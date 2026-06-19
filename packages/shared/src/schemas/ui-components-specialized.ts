import { z } from "zod";

export const AngleSliderReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  angleSliderSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-angle-slider", "native-angle-dial", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    thumbCount: z.number().int().nonnegative(),
    valueTextCount: z.number().int().nonnegative(),
    markerGroupCount: z.number().int().nonnegative(),
    markerCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    angleMathCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-angle-slider", "native-angle-dial", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "thumb", "value-text", "marker-group", "marker", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "dragging", "disabled", "read-only", "invalid", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "value-as-degree", "default-value", "step", "min-max", "set-value", "on-value-change", "on-value-change-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "thumb-focus", "thumb-blur", "arrow-inc", "arrow-dec", "home", "end", "track-pointer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  angleMathSignals: z.array(z.object({
    signal: z.enum(["pointer-value", "angle", "display-angle", "clamp-angle", "constrain-angle", "snap-angle-to-step", "rtl-mirror", "thumb-drag-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["hidden-input", "name", "form-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-slider", "aria-label", "aria-labelledby", "aria-valuemin", "aria-valuemax", "aria-valuenow", "data-disabled", "data-invalid", "data-readonly", "tab-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "step-default", "default-value", "idle-state", "focused-state", "dragging-state", "value-set-event", "control-pointer-down-event", "doc-pointer-move-event", "doc-pointer-up-event", "thumb-focus-event", "thumb-blur-event", "arrow-key-events", "home-end-events", "track-pointer-move-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "thumb-drag-offset-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["interactive", "value-as-degree", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "pointer-move-send", "pointer-up-send", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["sync-input-element", "invoke-on-change-end", "set-pointer-value", "set-value-to-min", "set-value-to-max", "set-value", "decrement-value", "increment-value", "focus-thumb", "set-thumb-drag-offset", "clear-thumb-drag-offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "thumb-id", "hidden-input-id", "control-id", "value-text-id", "label-id", "hidden-input-el", "control-el", "thumb-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value", "value-as-degree", "dragging", "set-value", "root-props", "label-props", "hidden-input-props", "control-props", "thumb-props", "value-text-props", "marker-group-props", "marker-props", "data-state", "data-value", "pointer-down", "keyboard-map", "role-presentation", "role-slider", "aria-label", "aria-labelledby", "aria-valuemin", "aria-valuemax", "aria-valuenow", "tab-index", "touch-action", "user-select", "rotate-style", "data-disabled", "data-invalid", "data-readonly", "dir-prop", "hidden-input-type", "stop-propagation", "thumb-focus-handler", "thumb-blur-handler", "prevent-default", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "form-test", "aria-test", "marker-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/angle-slider", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const CascadeSelectReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  cascadeSelectSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-cascade-select", "native-cascader", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    clearTriggerCount: z.number().int().nonnegative(),
    positionerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    valueTextCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    collectionCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-cascade-select", "native-cascader", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "trigger", "indicator", "clear-trigger", "positioner", "content", "list", "item", "item-text", "item-indicator", "value-text", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "open", "closed", "disabled", "read-only", "invalid", "required", "multiple", "empty", "selected", "highlighted", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collectionSignals: z.array(z.object({
    signal: z.enum(["tree-collection", "root-node", "branch-node", "leaf-node", "index-path", "value-path", "depth", "disabled-node", "parent-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "selected-items", "has-selected-items", "clear-value", "select-value", "multiple", "close-on-select", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["trigger-click", "trigger-focus", "arrow-up", "arrow-down", "arrow-left", "arrow-right", "home", "end", "enter", "pointer-enter", "pointer-leave", "grace-area", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["positioning", "placement", "popper", "dismissable", "focus-visible", "scroll-into-view", "current-placement", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["hidden-input", "name", "form", "required", "read-only", "default-value", "reset", "input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["combobox", "listbox", "treeitem", "group", "aria-controls", "aria-expanded", "aria-haspopup", "aria-activedescendant", "aria-multiselectable", "aria-disabled", "aria-level", "aria-owns", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "idle-state", "focused-state", "open-state", "controlled-open-event", "controlled-close-event", "trigger-events", "content-key-events", "item-events", "value-events", "highlight-events", "positioning-event", "track-form-control-effect", "open-effects", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "highlighted-value-context", "value-index-path-context", "highlighted-index-path-context", "highlighted-items-context", "selected-items-context", "current-placement-context", "fieldset-disabled-context", "grace-area-context", "pointer-transit-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-interactive", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control-state", "track-focus-visible", "track-dismissable-element", "compute-placement", "scroll-to-highlighted-items", "observe-activedescendant", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "clear-value", "set-highlighted-value", "clear-highlighted-value", "reposition", "select-item", "clear-item", "select-highlighted-item", "highlight-first-item", "highlight-last-item", "highlight-next-item", "highlight-previous-item", "highlight-first-child", "highlight-parent", "set-initial-focus", "focus-trigger-el", "invoke-on-open", "invoke-on-close", "toggle-visibility", "highlight-first-selected-item", "create-grace-area", "clear-grace-area", "sync-input-value", "dispatch-change-event", "scroll-content-to-top", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["restore-focus", "multiple", "loop", "is-open-controlled", "trigger-event-guards", "has-highlighted-value", "highlight-boundary", "close-on-select", "can-select-item", "can-select-highlighted-item", "navigate-child-parent", "root-level", "hover-highlight", "grace-area", "pointer-not-in-item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "control-id", "trigger-id", "indicator-id", "clear-trigger-id", "positioner-id", "content-id", "hidden-input-id", "list-id", "item-id", "root-el", "label-el", "control-el", "trigger-el", "content-el", "hidden-input-el", "list-els", "item-el", "dispatch-input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["collection", "open", "focused", "multiple", "disabled", "value", "highlighted-value", "highlighted-items", "selected-items", "has-selected-items", "empty", "value-as-string", "reposition", "focus", "set-open", "set-highlight-value", "clear-highlight-value", "set-value", "select-value", "clear-value", "get-item-state", "root-props", "label-props", "control-props", "trigger-props", "clear-trigger-props", "positioner-props", "content-props", "list-props", "indicator-props", "item-props", "item-text-props", "item-indicator-props", "value-text-props", "hidden-input-props", "combobox-role", "listbox-role", "treeitem-role", "hidden-input", "aria-hidden", "data-disabled", "data-invalid", "data-readonly", "data-focus", "data-placement", "data-placeholder-shown", "data-depth", "data-selected", "data-type", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "hover-test", "form-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/cascade-select", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const AsyncListReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  asyncListSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-async-list", "tanstack-query", "custom", "unknown"]),
    loadCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    cursorCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    sortCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    abortCount: z.number().int().nonnegative(),
    sequenceCount: z.number().int().nonnegative(),
    callbackCount: z.number().int().nonnegative(),
    apiCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-async-list", "tanstack-query", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "loading", "sorting", "error", "empty", "has-more", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadSignals: z.array(z.object({
    signal: z.enum(["load", "initial-items", "auto-reload", "dependencies", "reload", "load-more", "success", "error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  paginationSignals: z.array(z.object({
    signal: z.enum(["cursor", "has-more", "append", "clear-cursor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  filterSignals: z.array(z.object({
    signal: z.enum(["filter-text", "initial-filter-text", "set-filter-text", "clear-filter", "filter-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sortSignals: z.array(z.object({
    signal: z.enum(["sort-descriptor", "initial-sort-descriptor", "sort-function", "sort-event", "sorting-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cancellationSignals: z.array(z.object({
    signal: z.enum(["abort-controller", "abort-event", "cancel-fetch", "cancel-sort", "stale-sequence", "signal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  callbackSignals: z.array(z.object({
    signal: z.enum(["on-success", "on-error", "invoke-on-success", "invoke-on-error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "required-load-prop", "idle-state", "loading-state", "sorting-state", "reload-event", "load-more-event", "sort-event", "filter-event", "success-event", "error-event", "abort-event", "load-if-needed-entry", "perform-fetch-entry", "cancel-fetch-exit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["items-context", "cursor-context", "filter-text-context", "sort-descriptor-context", "error-context", "abort-ref", "sequence-ref", "dependency-watch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["load-if-needed", "perform-fetch", "perform-sort", "set-sort-descriptor", "set-filter-text", "invoke-on-success", "invoke-on-error", "clear-items", "set-items", "set-cursor", "set-error", "clear-error", "clear-cursor", "cancel-fetch", "cancel-sort", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-cursor", "has-sort-fn", "stale-sequence", "abort-error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  asyncSignals: z.array(z.object({
    signal: z.enum(["abort-controller", "load-signal", "cursor-forwarding", "filter-forwarding", "sort-forwarding", "sequence-increment", "stale-success-guard", "stale-error-guard", "append-results", "sort-promise", "abort-error-skip", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["items", "cursor", "loading", "sorting", "empty", "has-more", "error", "abort", "reload", "load-more", "sort", "set-filter-text", "clear-filter", "sort-descriptor", "filter-text", "abort-event-api", "reload-event-api", "load-more-event-api", "sort-event-api", "filter-event-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "load-test", "filter-test", "sort-test", "abort-test", "pagination-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/async-list", "@zag-js/react", "@zag-js/core", "@zag-js/utils", "react", "unknown"]),
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

export const ImageCropperReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  imageCropperSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-image-cropper", "native-cropper", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    handleCount: z.number().int().nonnegative(),
    gridCount: z.number().int().nonnegative(),
    cropCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    resizeCount: z.number().int().nonnegative(),
    panCount: z.number().int().nonnegative(),
    zoomCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-image-cropper", "native-cropper", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "viewport", "image", "selection", "handle", "grid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "dragging", "panning", "measured", "image-ready", "fixed-crop-area", "rectangle", "circle", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cropSignals: z.array(z.object({
    signal: z.enum(["crop", "initial-crop", "default-crop", "min-size", "max-size", "aspect-ratio", "crop-shape", "crop-change", "source-rect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["zoom", "default-zoom", "min-max-zoom", "zoom-step", "rotation", "default-rotation", "flip", "offset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "pan-pointer-down", "wheel", "pinch-start", "pinch-move", "pinch-end", "resize-crop", "reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-keys", "alt-resize", "shift-step", "ctrl-step", "zoom-in", "zoom-out", "nudge", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["get-crop-data", "get-cropped-image", "canvas", "blob", "data-url", "png", "jpeg", "quality", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["group-role", "slider-role", "aria-roledescription", "aria-label", "aria-description", "aria-live", "aria-controls", "aria-busy", "aria-valuemin-max", "aria-valuenow", "aria-valuetext", "data-dragging", "data-panning", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "translations", "idle-state", "dragging-state", "panning-state", "global-events", "pointer-events", "pinch-events", "transform-events", "viewport-events", "computed-state", "watch-props", "idle-effects", "track-pointer-move-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["natural-size-context", "crop-context", "pointer-start-context", "crop-start-context", "handle-position-context", "shift-lock-ratio-context", "pinch-distance-context", "pinch-midpoint-context", "zoom-context", "rotation-context", "flip-context", "offset-context", "offset-start-context", "viewport-rect-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-measured", "is-image-ready", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "track-viewport-resize", "track-wheel-event", "track-touch-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["check-image-status", "set-natural-size", "set-default-crop", "set-pointer-start", "set-offset-start", "set-crop-start", "update-crop", "update-pan-offset", "set-handle-position", "set-rotation", "set-flip", "resize-crop", "clear-pointer-start", "clear-crop-start", "clear-handle-position", "clear-offset-start", "clear-shift-ratio", "update-zoom", "set-pinch-distance", "handle-pinch-move", "clear-pinch-distance", "nudge-resize-crop", "nudge-move-crop", "resize-viewport", "reset-to-initial-state", "adjust-crop-aspect-ratio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-viewport-rect", "can-resize-crop", "can-pan", "can-drag-selection", "visible-rect", "fixed-crop-area", "aspect-ratio-equal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "viewport-id", "image-id", "selection-id", "handle-id", "root-el", "viewport-el", "image-el", "selection-el", "handle-el", "draw-cropped-image-canvas", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["zoom", "rotation", "flip", "crop", "offset", "natural-size", "viewport-rect", "dragging", "panning", "set-zoom", "zoom-by", "set-rotation", "rotate-by", "set-flip", "flip-horizontally", "flip-vertically", "resize", "reset", "get-crop-data", "get-cropped-image", "root-props", "viewport-props", "image-props", "selection-props", "handle-props", "grid-props", "group-role", "presentation-role", "slider-role", "keyboard-map", "pointer-handlers", "aria-live", "aria-busy", "aria-hidden", "data-pinch", "data-ownedby", "data-flip-horizontal", "data-flip-vertical", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "wheel-test", "keyboard-test", "pinch-test", "output-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/image-cropper", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const ListboxReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  listboxSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-listbox", "headless-listbox", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    itemTextCount: z.number().int().nonnegative(),
    itemIndicatorCount: z.number().int().nonnegative(),
    itemGroupCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    collectionCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    highlightCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    typeaheadCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-listbox", "headless-listbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "input", "content", "item", "item-text", "item-indicator", "item-group", "item-group-label", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "focus-visible", "empty", "disabled", "highlighted", "selected", "multiple", "typing-ahead", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collectionSignals: z.array(z.object({
    signal: z.enum(["collection", "list-collection", "grid-collection", "items", "first-last", "next-prev", "stringify-items", "disabled-item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "selection-mode", "single", "multiple", "extended", "deselectable", "select-on-highlight", "select-all", "clear-value", "on-value-change", "on-select", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  highlightSignals: z.array(z.object({
    signal: z.enum(["highlighted-value", "default-highlighted-value", "highlight-first", "highlight-last", "highlight-next", "highlight-previous", "clear-highlight", "auto-highlight", "on-highlight-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["content-focus", "content-blur", "item-click", "pointer-move", "pointer-leave", "typeahead", "navigate", "input-focus", "input-blur", "input-keydown", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-up", "arrow-down", "arrow-left", "arrow-right", "home", "end", "enter", "space", "escape", "meta-a", "shift-selection", "loop-focus", "keyboard-priority", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-listbox", "role-option", "role-group", "aria-selected", "aria-disabled", "aria-activedescendant", "aria-multiselectable", "aria-labelledby", "aria-haspopup", "aria-controls", "aria-autocomplete", "tab-index", "data-highlighted", "data-selected", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "idle-state", "global-events", "selection-events", "highlight-events", "input-events", "content-events", "item-events", "navigate-event", "watch-value", "watch-highlighted-value", "watch-collection", "track-focus-visible-effect", "scroll-highlighted-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "highlighted-value-context", "highlighted-item-context", "selected-item-map-context", "focused-context", "typeahead-ref", "focus-visible-ref", "input-state-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["has-selected-items", "is-typing-ahead", "is-interactive", "selection", "multiple", "selected-items", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-focus-visible", "scroll-to-highlighted-item", "observe-active-descendant", "scroll-into-view", "interaction-modality", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["select-highlighted-item", "select-with-keyboard", "highlight-item", "highlight-matching-item", "set-highlighted-item", "highlight-first-value", "highlight-last-value", "highlight-next-value", "highlight-previous-value", "clear-highlighted-item", "select-item", "clear-item", "set-selected-items", "clear-selected-items", "sync-selected-items", "sync-highlighted-item", "sync-highlighted-value", "set-focused", "set-default-highlighted-value", "clear-focused", "set-input-state", "clear-input-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-selected-value", "has-highlighted-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "content-id", "label-id", "item-id", "item-group-id", "item-group-label-id", "content-el", "item-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["empty", "highlighted-item", "highlighted-value", "clear-highlighted-value", "selected-items", "has-selected-items", "value", "value-as-string", "collection", "disabled", "select-value", "set-value", "select-all", "highlight-value", "highlight-first", "highlight-last", "highlight-next", "highlight-previous", "clear-value", "get-item-state", "root-props", "input-props", "label-props", "value-text-props", "content-props", "item-props", "item-text-props", "item-indicator-props", "item-group-props", "item-group-label-props", "listbox-role", "option-role", "group-role", "presentation-role", "keyboard-map", "pointer-handlers", "dir-prop", "data-disabled", "data-orientation", "data-state", "data-layout", "data-empty", "data-activedescendant", "aria-hidden", "autocomplete-off", "spellcheck-false", "enter-key-hint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "typeahead-test", "selection-test", "multi-select-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/listbox", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const DatePickerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  datePickerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-date-picker", "zag-date-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    tableCount: z.number().int().nonnegative(),
    cellCount: z.number().int().nonnegative(),
    segmentCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-date-picker", "zag-date-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "trigger", "content", "positioner", "table", "table-cell", "table-cell-trigger", "month-select", "year-select", "range-text", "segment-group", "segment", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "open", "focused", "closed", "disabled", "readonly", "invalid", "inline", "empty", "hovered", "unavailable", "selected", "today", "weekend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "focused-value", "default-focused-value", "input-value", "placeholder-value", "value-as-string", "value-as-date", "set-value", "clear-value", "set-time", "select-today", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["single", "multiple", "range", "max-selected-dates", "selecting-end-date", "selected-range", "hovered-range", "close-on-select", "outside-day-selectable", "preset-click", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewSignals: z.array(z.object({
    signal: z.enum(["day-view", "month-view", "year-view", "min-view", "max-view", "view-change", "set-view", "next-view", "previous-view", "decade", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["next-trigger", "prev-trigger", "goto-next", "goto-prev", "next-page", "previous-page", "next-year", "previous-year", "next-decade", "previous-decade", "month-grid", "year-grid", "week-days", "week-numbers", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  segmentSignals: z.array(z.object({
    signal: z.enum(["segment-focus", "segment-blur", "segment-input", "segment-adjust", "segment-arrow-left", "segment-arrow-right", "segment-backspace", "segment-home", "segment-end", "segment-paste", "spinbutton", "contenteditable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-left", "arrow-right", "arrow-up", "arrow-down", "page-up", "page-down", "home", "end", "enter", "escape", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-application", "role-grid", "role-gridcell", "role-button", "role-spinbutton", "aria-roledescription", "aria-label", "aria-selected", "aria-disabled", "aria-invalid", "aria-current", "aria-multiselectable", "aria-readonly", "aria-labelledby", "hidden-input", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "create-guards", "default-props", "initial-state", "refs", "bindable-context", "computed-state", "watch-props", "root-events", "open-state", "implementation-block", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["focused-value", "value", "input-value", "active-index", "hovered-value", "view", "start-value", "current-placement", "restore-focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-interactive", "visible-duration", "end-value", "visible-range", "visible-range-text", "prev-visible-range-valid", "next-visible-range-valid", "value-as-string", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["setup-live-region", "track-positioning", "track-dismissable-element", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-above-min-view", "is-day-view", "is-month-view", "is-year-view", "is-range-picker", "has-selected-range", "is-multi-picker", "can-select-date", "should-restore-focus", "is-selecting-end-date", "close-on-select", "is-open-controlled", "interact-outside-event", "input-value-empty", "fix-on-blur", "day-pointer-outside-visible-month", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["view-actions", "restore-focus", "announce-actions", "text-selection", "sync-input", "focused-date", "date-value", "range-selection", "hovered-date", "keyboard-navigation", "active-index", "focus-elements", "select-sync", "parse-input", "visible-range", "open-close-callbacks", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["label-id", "root-id", "table-id", "table-header-id", "table-body-id", "table-row-id", "content-id", "cell-trigger-id", "prev-trigger-id", "next-trigger-id", "view-trigger-id", "clear-trigger-id", "control-id", "input-id", "trigger-id", "positioner-id", "month-select-id", "year-select-id", "focused-cell", "trigger-el", "content-el", "input-els", "year-select-el", "month-select-el", "clear-trigger-el", "positioner-el", "control-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focused", "open", "disabled", "invalid", "read-only", "inline", "num-of-months", "show-week-numbers", "selection-mode", "max-selected-dates", "is-max-selected", "view-api", "unavailable-api", "weeks-api", "week-days-api", "visible-range-text-api", "value-api", "value-as-date", "value-as-string-api", "focused-value-api", "focused-value-as-date", "focused-value-as-string", "visible-range-api", "range-preset-value", "week-number", "days-in-week", "offset-api", "month-weeks", "select-today-api", "set-value-api", "set-time-api", "clear-value-api", "set-focused-value-api", "set-open-api", "focus-month", "focus-year", "years-api", "months-api", "years-grid", "decade-api", "months-grid", "format-api", "set-view-api", "go-to-next", "go-to-prev", "root-props", "label-props", "control-props", "range-text-props", "content-props", "table-props", "table-head-props", "table-header-props", "table-body-props", "table-row-props", "week-number-header-cell-props", "week-number-cell-props", "day-table-cell-state", "day-table-cell-props", "day-table-cell-trigger-props", "month-table-cell-state", "month-table-cell-props", "month-table-cell-trigger-props", "year-table-cell-state", "year-table-cell-props", "year-table-cell-trigger-props", "next-trigger-props", "prev-trigger-props", "clear-trigger-props", "trigger-props", "view-props", "view-trigger-props", "view-control-props", "input-props", "month-select-props", "year-select-props", "positioner-props", "preset-trigger-props", "dir-prop", "data-disabled", "data-readonly", "data-empty", "data-placeholder-shown", "data-placement", "data-side", "data-inline", "data-view", "data-selectable", "autocomplete-off", "autocorrect-off", "spellcheck-false", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "range-test", "segment-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/date-picker", "@zag-js/date-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/live-region", "@zag-js/dismissable", "@zag-js/date-utils", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "@internationalized/date", "react", "unknown"]),
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

export const MarqueeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  marqueeSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-marquee", "css-marquee", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    edgeCount: z.number().int().nonnegative(),
    cloneCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    measurementCount: z.number().int().nonnegative(),
    motionCount: z.number().int().nonnegative(),
    pauseCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-marquee", "css-marquee", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "viewport", "content", "item", "edge", "clone", "css-variable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "paused", "resumed", "reverse", "horizontal", "vertical", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  motionSignals: z.array(z.object({
    signal: z.enum(["speed", "delay", "loop-count", "spacing", "duration", "translate", "keyframes", "animation-iteration", "animation-end", "restart", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  measurementSignals: z.array(z.object({
    signal: z.enum(["auto-fill", "multiplier", "content-count", "root-size", "content-size", "resize-observer", "request-animation-frame", "dimension-snapshot", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pause", "resume", "toggle-pause", "pause-on-interaction", "mouse-enter", "mouse-leave", "focus-capture", "blur-capture", "restart", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-region", "aria-roledescription", "aria-live-off", "aria-label", "presentation-clone", "aria-hidden-clone", "reduced-motion", "data-state", "data-orientation", "data-paused", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "refs", "bindable-context", "idle-state", "computed-state", "watch-props", "global-events", "track-dimensions-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["paused-context", "duration-context", "dimensions-ref", "initial-duration-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["orientation", "is-vertical", "multiplier", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-dimensions", "resize-observer", "request-animation-frame", "dimension-measurement", "observer-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-paused", "set-resumed", "toggle-paused", "restart-animation", "recalculate-duration", "calculate-duration", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "viewport-id", "content-id", "root-el", "viewport-el", "content-el", "edge-position-styles", "marquee-translate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["paused", "orientation", "side", "multiplier", "content-count", "pause", "resume", "toggle-pause", "restart", "root-props", "viewport-props", "content-props", "edge-props", "item-props", "region-role", "animation-events", "pause-interaction-handlers", "clone-accessibility", "css-variables", "dir-prop", "data-part", "data-index", "data-side", "data-reverse", "data-clone", "display-flex", "overflow-hidden", "contain-layout-style-paint", "pointer-events-none", "spacing-margin", "will-change-transform", "translate-z", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pause-test", "loop-test", "measurement-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/marquee", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const TocReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tocSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-toc", "docs-toc", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    titleCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    linkCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    headingCount: z.number().int().nonnegative(),
    activeCount: z.number().int().nonnegative(),
    observerCount: z.number().int().nonnegative(),
    scrollCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-toc", "docs-toc", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "title", "list", "item", "link", "indicator", "heading", "css-indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "active-ids", "active-items", "default-active-ids", "active-item-state", "first-active", "last-active", "depth", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  observerSignals: z.array(z.object({
    signal: z.enum(["intersection-observer", "root-margin", "threshold", "scroll-root", "visibility-map", "resize-observer", "indicator-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scrollSignals: z.array(z.object({
    signal: z.enum(["auto-scroll", "scroll-behavior", "scroll-to", "scroll-into-view", "same-page-hash", "push-hash", "hashchange", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  indicatorSignals: z.array(z.object({
    signal: z.enum(["indicator-rect", "rect-empty", "top-left-width-height", "active-range", "resize-border-box", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-labelledby", "aria-current-location", "data-active", "data-depth", "data-first", "data-last", "direction", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-props", "bindable-context", "refs", "computed-state", "watch-active-ids", "entry-exit-actions", "active-ids-event", "idle-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["active-ids-context", "indicator-rect-context", "visibility-map-ref", "indicator-cleanup-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["active-items", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-heading-visibility", "intersection-observer", "observer-options", "scroll-root", "visibility-map", "observer-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-active-ids", "auto-scroll-toc", "cleanup-indicator-observer", "sync-indicator-rect", "resize-observer-border-box", "invoke-active-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "title-id", "list-id", "item-id", "link-id", "indicator-id", "root-el", "list-el", "item-el", "indicator-el", "heading-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["active-ids", "active-items", "items", "set-active-ids", "scroll-to", "item-state", "root-props", "title-props", "list-props", "item-props", "link-props", "indicator-props", "aria-labelledby", "aria-current-location", "data-active", "same-page-hash", "push-hash", "scroll-to-element", "css-variables", "hidden-indicator", "dir-prop", "data-value", "data-depth", "data-first", "data-last", "depth-css-var", "scroll-behavior", "scroll-into-view", "prevent-default", "download-guard", "new-tab-guard", "hashchange-event", "indicator-position-absolute", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "observer-test", "scroll-test", "active-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/toc", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export type AngleSliderReadinessReport = z.infer<typeof AngleSliderReadinessReportSchema>;
export type CascadeSelectReadinessReport = z.infer<typeof CascadeSelectReadinessReportSchema>;
export type AsyncListReadinessReport = z.infer<typeof AsyncListReadinessReportSchema>;
export type ImageCropperReadinessReport = z.infer<typeof ImageCropperReadinessReportSchema>;
export type ListboxReadinessReport = z.infer<typeof ListboxReadinessReportSchema>;
export type DatePickerReadinessReport = z.infer<typeof DatePickerReadinessReportSchema>;
export type MarqueeReadinessReport = z.infer<typeof MarqueeReadinessReportSchema>;
export type TocReadinessReport = z.infer<typeof TocReadinessReportSchema>;
