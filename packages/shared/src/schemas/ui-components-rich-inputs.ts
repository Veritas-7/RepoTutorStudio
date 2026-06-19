import { z } from "zod";

export const PinInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pinInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-otp", "zag-pin-input", "native-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-otp", "zag-pin-input", "native-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "input", "hidden-input", "label", "control", "collection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "value-as-string", "complete", "count", "focused-index", "set-value", "clear-value", "set-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["numeric", "alpha", "alphanumeric", "pattern", "sanitize", "invalid", "mask", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["paste", "before-input", "change", "backspace", "delete", "arrow-left", "arrow-right", "home", "end", "enter", "focus-blur", "auto-advance", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "auto-submit", "request-submit", "hidden-submit-input", "reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "group-role", "input-mode", "autocomplete-one-time-code", "disabled", "readonly", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "value-set-event", "value-clear-event", "input-focus-event", "input-change-event", "input-paste-event", "input-keyboard-events", "value-invalid-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["normalized-value", "value-length", "filled-value-length", "is-value-complete", "value-as-string", "focused-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["auto-focus", "has-value", "is-value-complete", "has-index", "valid-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-input-count", "focus-input", "select-input", "invoke-complete", "invoke-invalid", "dispatch-input-event", "sync-input-elements", "request-form-submit", "auto-submit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "hidden-input-id", "label-id", "control-id", "input-elements", "data-complete", "data-ownedby", "data-invalid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focus", "items", "set-value", "clear-value", "set-value-at-index", "root-props", "label-props", "hidden-input-props", "control-props", "input-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "axe", "keyboard-test", "paste-test", "form-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-one-time-password-field", "@zag-js/pin-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const PaginationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  paginationSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-pagination", "tanstack-table", "native-controls", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    ellipsisCount: z.number().int().nonnegative(),
    pageStateCount: z.number().int().nonnegative(),
    pageSizeCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    linkCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-pagination", "tanstack-table", "native-controls", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "item", "ellipsis", "first-trigger", "prev-trigger", "next-trigger", "last-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["page", "default-page", "page-size", "default-page-size", "total-pages", "page-count", "row-count", "page-range", "manual-pagination", "auto-reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["set-page", "set-page-size", "first-page", "previous-page", "next-page", "last-page", "can-next-prev", "clamp", "slice", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["button-mode", "link-mode", "href", "selected", "disabled", "ellipsis", "page-options", "row-model", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-current", "data-selected", "data-disabled", "translations", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "page-bindable", "page-size-bindable", "page-size-watch", "set-page-event", "set-page-size-event", "first-page-event", "previous-page-event", "next-page-event", "last-page-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["total-pages", "page-range", "previous-page", "next-page", "valid-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["valid-page", "valid-count", "can-next-page", "can-prev-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-page", "set-page-size", "first-page", "previous-page", "next-page", "last-page", "set-page-if-needed", "clamp-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rangeSignals: z.array(z.object({
    signal: z.enum(["range-helper", "transform-helper", "transformed-range", "sibling-count", "boundary-count", "left-ellipsis", "right-ellipsis", "ellipsis-collapse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "first-trigger-id", "prev-trigger-id", "next-trigger-id", "last-trigger-id", "ellipsis-id", "item-id", "data-selected", "data-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["page", "count", "page-size", "total-pages", "pages", "previous-page", "next-page", "page-range", "slice", "set-page", "set-page-size", "first-page", "previous-page-action", "next-page-action", "last-page-action", "root-props", "item-props", "ellipsis-props", "trigger-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "disabled-test", "aria-test", "row-model-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/pagination", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@tanstack/react-table", "@tanstack/table-core", "react", "unknown"]),
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

export const NumberInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  numberInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-number-input", "native-spinbutton", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    scrubberCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    boundsCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-number-input", "native-spinbutton", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "increment-trigger", "decrement-trigger", "scrubber", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "value-as-number", "formatted-value", "set-value", "clear-value", "increment", "decrement", "set-to-min-max", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  boundsSignals: z.array(z.object({
    signal: z.enum(["min", "max", "step", "allow-overflow", "clamp-on-blur", "at-min-max", "out-of-range", "invalid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["locale", "format-options", "parser", "formatter", "pattern", "input-mode", "value-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  keyboardSignals: z.array(z.object({
    signal: z.enum(["arrow-up", "arrow-down", "home", "end", "enter", "before-input", "change", "blur", "focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["spin-on-press", "mouse-wheel", "pointer", "scrubber", "pointer-lock", "virtual-cursor", "caret", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-spinbutton", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-valuetext", "aria-invalid", "aria-controls", "aria-label", "data-disabled", "required-readonly", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "track-form-control", "disabled-fieldset", "value-commit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "before-spin-state", "spinning-state", "scrubbing-state", "value-set-event", "value-clear-event", "value-increment-event", "value-decrement-event", "trigger-press-events", "scrubber-events", "input-events", "spin-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["value-as-number", "formatted-value", "at-min", "at-max", "out-of-range", "value-empty", "disabled", "can-increment", "can-decrement", "value-text", "rtl", "formatter", "parser", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control", "wheel-listener", "pointer-lock", "mouse-move", "virtual-cursor", "prevent-text-selection", "button-disabled", "change-delay", "spin-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["focus-input", "increment", "decrement", "set-clamped-value", "set-raw-value", "set-value", "clear-value", "set-to-max", "set-to-min", "hint", "focus-callback", "blur-callback", "invalid-callback", "commit-callback", "sync-input", "formatted-value", "cursor-point", "virtual-cursor-position", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "increment-trigger-id", "decrement-trigger-id", "scrubber-id", "cursor-id", "label-id", "input-el", "trigger-el", "scrubber-el", "cursor-el", "pressed-trigger", "mousemove-value", "data-state", "aria-spinbutton", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cursorSignals: z.array(z.object({
    signal: z.enum(["record-cursor", "restore-cursor", "next-cursor-position", "selection-range", "prefix-suffix", "fallback-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focused", "invalid", "empty", "value", "value-as-number", "set-value", "clear-value", "increment", "decrement", "set-to-max", "set-to-min", "focus", "root-props", "label-props", "control-props", "value-text-props", "input-props", "trigger-props", "scrubber-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "wheel-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/number-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@internationalized/number", "react", "unknown"]),
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

export const RatingGroupReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  ratingGroupSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-rating-group", "native-radiogroup", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    hoverCount: z.number().int().nonnegative(),
    halfCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-rating-group", "native-radiogroup", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "hidden-input", "control", "item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "hovered-value", "count", "items", "set-value", "clear-value", "item-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["highlighted", "half", "checked", "allow-half", "rounding", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-over", "pointer-leave", "click", "focus-blur", "space", "arrow-left", "arrow-right", "home", "end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["radiogroup", "radio", "aria-label", "aria-checked", "aria-setsize", "aria-posinset", "aria-readonly", "disabled-readonly-required", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "hidden-input", "track-form-control", "reset", "fieldset-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "hover-state", "focus-state", "set-value-event", "clear-value-event", "group-pointer-over-event", "group-pointer-leave-event", "pointer-over-event", "click-event", "focus-blur-events", "keyboard-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["interactive", "hovering", "disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control", "fieldset-disabled", "form-reset", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["interactive", "hovered-value-empty", "value-empty", "radio-focused", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["clear-hovered-value", "focus-active-radio", "set-prev-value", "set-next-value", "set-min-value", "set-max-value", "set-value", "clear-value", "set-hovered-value", "round-value", "dispatch-change-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "hidden-input-id", "control-id", "item-id", "root-el", "control-el", "radio-el", "hidden-input-el", "dispatch-change-event", "aria-posinset-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["hovering", "value", "hovered-value", "count", "items", "item-state", "set-value", "clear-value", "root-props", "hidden-input-props", "label-props", "control-props", "item-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "aria-test", "form-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/rating-group", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const ColorPickerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  colorPickerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-color-picker", "native-color-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    areaCount: z.number().int().nonnegative(),
    areaThumbCount: z.number().int().nonnegative(),
    channelSliderCount: z.number().int().nonnegative(),
    channelInputCount: z.number().int().nonnegative(),
    swatchCount: z.number().int().nonnegative(),
    eyeDropperCount: z.number().int().nonnegative(),
    formatCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-color-picker", "native-color-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "trigger", "content", "area", "area-thumb", "channel-slider", "channel-input", "swatch", "eyedropper", "format-select", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "value-as-string", "format", "alpha", "set-value", "set-channel-value", "set-format", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  channelSignals: z.array(z.object({
    signal: z.enum(["hue", "saturation", "brightness", "alpha", "hex", "rgba", "hsla", "hsba", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["open-close", "area-pointer", "channel-pointer", "keyboard", "page-keys", "home-end", "channel-input", "swatch-click", "eyedropper", "dismissable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["dialog", "slider", "2d-slider", "aria-label", "aria-valuemin-max", "aria-valuenow", "aria-valuetext", "aria-expanded", "disabled-readonly-invalid-required", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "hidden-input", "track-form-control", "reset", "fieldset-disabled", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "open-state", "dragging-state", "value-set-event", "format-set-event", "channel-input-events", "eyedropper-event", "swatch-trigger-event", "trigger-events", "area-pointer-events", "channel-slider-events", "controlled-open-close-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["disabled", "rtl", "interactive", "value-as-string", "area-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-control", "track-positioning", "dismissable-element", "pointer-move", "text-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["close-on-select", "open-controlled", "restore-focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["open-eyedropper", "active-channel", "clear-active-channel", "area-color-from-point", "channel-color-from-point", "set-value", "set-format", "dispatch-change-event", "sync-inputs", "change-end-callback", "channel-color-from-input", "increment-decrement-channel", "area-channel-increment", "channel-min-max", "focus-thumbs", "initial-focus", "return-focus", "sync-format-select", "sync-value-with-format", "open-close-callback", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "hidden-input-id", "control-id", "trigger-id", "content-id", "positioner-id", "format-select-id", "area-id", "area-gradient-id", "area-thumb-id", "channel-slider-ids", "content-el", "area-thumb-el", "channel-input-els", "format-select-el", "hidden-input-el", "area-point", "slider-point", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["dragging", "open", "inline", "value", "value-as-string", "set-open", "set-value", "channel-value", "channel-value-text", "set-channel-value", "format", "set-format", "alpha", "set-alpha", "root-props", "trigger-props", "content-props", "area-props", "channel-props", "hidden-input-props", "eyedropper-props", "swatch-props", "format-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "eyedropper-test", "swatch-test", "format-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/color-picker", "@zag-js/color-utils", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const SplitterReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  splitterSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-splitter", "native-resize-handle", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    panelCount: z.number().int().nonnegative(),
    handleCount: z.number().int().nonnegative(),
    sizeCount: z.number().int().nonnegative(),
    collapseCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    pointerCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    boundsCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    registryCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-splitter", "native-resize-handle", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "panel", "resize-trigger", "indicator", "items", "layout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sizeSignals: z.array(z.object({
    signal: z.enum(["size", "default-size", "set-sizes", "reset-sizes", "get-sizes", "panel-size", "min-max", "validate-sizes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  collapseSignals: z.array(z.object({
    signal: z.enum(["collapsible", "collapsed-size", "collapse-panel", "expand-panel", "is-collapsed", "is-expanded", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "keyboard-move", "enter", "home-end", "f6", "focus-blur", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["separator", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-controls", "aria-orientation", "data-orientation", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  registrySignals: z.array(z.object({
    signal: z.enum(["registry", "root-resize", "global-cursor", "preserve-fixed-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "hover-temp-state", "hover-state", "focused-state", "dragging-state", "size-events", "panel-events", "root-resize-event", "pointer-events", "focus-events", "keyboard-events", "focus-cycle-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["horizontal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-resize-handles", "track-root-resize", "hover-delay", "pointer-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["resize-trigger-focused", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-size", "reset-size", "sync-size", "dragging-state", "keyboard-state", "collapse-panel", "expand-panel", "resize-panel", "pointer-value", "keyboard-value", "resize-callbacks", "collapse-or-expand", "global-cursor", "focus-next-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "resize-trigger-id", "label-id", "panel-id", "panel-els", "root-el", "resize-trigger-el", "panel-el", "resolve-trigger-id", "cursor", "global-cursor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  utilitySignals: z.array(z.object({
    signal: z.enum(["aria-values", "fuzzy-compare", "panel-layout", "panel-flex-style", "default-size", "parse-panel-size", "css-panel-size", "resolve-panel-sizes", "normalize-panels", "resize-by-delta", "validate-sizes", "preserve-fixed-size", "registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["dragging", "orientation", "panels", "items", "sizes", "set-sizes", "reset-sizes", "collapse-panel", "expand-panel", "resize-panel", "panel-size", "panel-state", "layout", "resize-trigger-state", "root-props", "panel-props", "resize-trigger-props", "resize-trigger-indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "aria-test", "collapse-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/splitter", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const TagsInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tagsInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-tags-input", "native-token-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    editCount: z.number().int().nonnegative(),
    deleteCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    liveRegionCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-tags-input", "native-token-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "hidden-input", "item", "item-preview", "item-input", "item-text", "clear-trigger", "delete-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "input-value", "default-input-value", "value-as-string", "set-value", "add-value", "clear-value", "set-value-at-index", "count-at-max", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["max", "max-length", "validate", "sanitize-value", "allow-duplicates", "allow-overflow", "invalid-reason", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["type", "enter", "delimiter", "paste", "blur", "arrow-navigation", "backspace-delete", "escape", "double-click-edit", "pointer-tag", "focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["label", "aria-invalid", "aria-label", "data-highlighted", "data-disabled", "data-readonly", "data-required", "data-empty", "dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["hidden-input", "name", "form", "required", "disabled-fieldset", "form-reset", "dispatch-input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  liveRegionSignals: z.array(z.object({
    signal: z.enum(["live-region", "translations", "announce-add", "announce-update", "announce-delete", "announce-paste", "announce-select", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-input-state", "navigating-tag-state", "editing-tag-state", "double-click-tag-event", "pointer-tag-event", "delete-tag-event", "set-value-events", "add-insert-events", "external-blur-event", "input-key-events", "tag-input-events", "paste-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["count", "value-as-string", "sanitized-input-value", "disabled", "interactive", "at-max", "overflowing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["live-region", "form-control", "interact-outside", "auto-resize", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["input-related-target", "at-max", "highlighted-tag", "first-last-highlighted", "edited-tag-empty", "input-empty", "has-tags", "allow-overflow", "auto-focus", "blur-behavior", "add-on-paste", "tag-editable", "caret-start", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["raise-insert", "external-blur", "dispatch-change", "highlight-navigation", "delete-tag", "edited-id", "edited-tag-value", "submit-edited-tag", "set-value-at-index", "focus-edited-input", "input-value", "highlighted-id", "focus-input", "sync-inputs", "add-tag", "paste-tag", "clear-tags", "set-value", "invalid-callback", "log-announcements", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "clear-trigger-id", "hidden-input-id", "label-id", "control-id", "item-id", "item-delete-trigger-id", "item-input-id", "edit-input-id", "item-els", "tag-input-el", "root-el", "input-el", "hidden-input-el", "tag-elements", "first-last", "prev-next", "index-of-id", "input-focused", "tag-value", "hover-intent", "dispatch-input-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["empty", "input-value", "value", "value-as-string", "count", "at-max", "set-value", "clear-value", "add-value", "set-value-at-index", "set-input-value", "clear-input-value", "focus", "item-state", "root-props", "label-props", "control-props", "input-props", "hidden-input-props", "item-props", "item-preview-props", "item-text-props", "item-input-props", "item-delete-trigger-props", "clear-trigger-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "paste-test", "edit-test", "delete-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/tags-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/auto-resize", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/live-region", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export type PinInputReadinessReport = z.infer<typeof PinInputReadinessReportSchema>;
export type PaginationReadinessReport = z.infer<typeof PaginationReadinessReportSchema>;
export type NumberInputReadinessReport = z.infer<typeof NumberInputReadinessReportSchema>;
export type RatingGroupReadinessReport = z.infer<typeof RatingGroupReadinessReportSchema>;
export type ColorPickerReadinessReport = z.infer<typeof ColorPickerReadinessReportSchema>;
export type SplitterReadinessReport = z.infer<typeof SplitterReadinessReportSchema>;
export type TagsInputReadinessReport = z.infer<typeof TagsInputReadinessReportSchema>;
