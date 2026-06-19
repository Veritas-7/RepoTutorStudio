import { z } from "zod";

export const CheckboxRadioSwitchReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  checkboxRadioSwitchSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix", "headless-ui", "ariakit", "custom", "unknown"]),
    checkboxCount: z.number().int().nonnegative(),
    radioCount: z.number().int().nonnegative(),
    switchCount: z.number().int().nonnegative(),
    providerCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-checkbox", "radix-radio-group", "radix-switch", "headless-checkbox", "headless-radio-group", "headless-switch", "ariakit-checkbox", "ariakit-radio", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlSignals: z.array(z.object({
    signal: z.enum(["checkbox", "radio-group", "switch", "menu-checkbox", "menu-radio", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "provider", "group", "item", "indicator", "thumb", "label", "description", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["checked", "default-checked", "on-checked-change", "on-change", "value", "default-value", "set-value", "indeterminate", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "required", "disabled", "hidden-input", "field", "value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "keyboard", "space-key", "arrow-keys", "roving-focus", "focus", "disabled-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-checkbox", "role-radio", "role-switch", "aria-checked", "aria-label", "aria-labelledby", "aria-describedby", "focus-management", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["group-context", "label-provider", "description-provider", "label-click-focus", "provided-id", "provided-disabled", "controllable-value", "default-value-hook", "sync-refs", "group-set-switch", "disposables-next-frame", "changing-state", "toggle-onchange", "disabled-react-issue", "click-prevent-default", "space-toggle", "enter-attempt-submit", "keypress-prevent-default", "labelled-by", "described-by", "focus-ring", "hover-state", "active-press", "slot-state", "role-switch", "aria-checked", "aria-labelledby", "aria-describedby", "resolve-button-type", "tab-index-normalize", "form-fields", "hidden-checkbox-override", "form-reset", "object-assign-subcomponents", "checkbox-indeterminate", "checkbox-mixed-aria", "checkbox-form-value-on", "radio-data-context", "radio-actions-context", "radio-register-option", "radio-unregister-option", "radio-comparator", "radio-first-option", "radio-contains-checked-option", "radio-trigger-change", "radio-keydown-arrow-focus", "radio-enter-submit", "radio-space-change", "radio-group-role", "radio-hidden-field-override", "radio-option-tab-index", "radio-option-focus-after-change", "radio-label-description-providers", "radio-object-assign-subcomponents", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "user-event", "role-test", "keyboard-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-checkbox", "@radix-ui/react-radio-group", "@radix-ui/react-switch", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
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

export const SliderProgressReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  sliderProgressSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-slider", "radix-progress", "zag-progress", "native", "custom", "unknown"]),
    sliderCount: z.number().int().nonnegative(),
    progressCount: z.number().int().nonnegative(),
    trackCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    thumbCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-slider", "radix-progress", "zag-progress", "native-range", "native-progress", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "track", "range", "thumb", "indicator", "provider", "bubble-input", "label", "value-text", "view", "circle", "circle-track", "circle-range", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "min", "max", "step", "percentage", "indeterminate", "data-state", "data-value", "value-as-string", "set-value", "set-to-min-max", "locale-format", "translation-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer", "keyboard", "home-end", "arrow-keys", "page-keys", "disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["horizontal", "vertical", "inverted", "rtl-dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "bubble-input", "input-range", "value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-slider", "role-progressbar", "aria-valuenow", "aria-valuemin", "aria-valuemax", "aria-valuetext", "aria-orientation", "aria-label", "aria-live", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "value-set-event", "set-value-action", "validate-context-action", "bindable-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-indeterminate", "percent", "formatter", "is-horizontal", "progress-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  circleSignals: z.array(z.object({
    signal: z.enum(["circle-root", "circle-track", "circle-range", "dasharray", "dashoffset", "rotate", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "track-id", "label-id", "circle-id", "data-max", "data-value", "data-state", "data-orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value-api", "value-as-string-api", "min-api", "max-api", "percent-api", "percent-as-string-api", "indeterminate-api", "set-value-api", "set-to-max-api", "set-to-min-api", "root-props", "label-props", "value-text-props", "track-props", "range-props", "view-props", "circle-props", "circle-track-props", "circle-range-props", "progressbar-role", "data-max", "data-value", "data-state", "data-orientation", "aria-valuemin", "aria-valuemax", "aria-valuenow", "aria-label", "aria-live", "percent-css-var", "circle-css-vars", "circle-dasharray", "circle-dashoffset", "view-hidden-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "precision-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-slider", "@radix-ui/react-progress", "@zag-js/progress", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const SelectComboboxReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  selectComboboxSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-select", "headlessui", "ariakit", "native", "custom", "unknown"]),
    selectCount: z.number().int().nonnegative(),
    comboboxCount: z.number().int().nonnegative(),
    listboxCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    optionsCount: z.number().int().nonnegative(),
    optionCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    portalPopoverCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-select", "headlessui-combobox", "headlessui-listbox", "headlessui-select", "ariakit-combobox", "ariakit-select", "native-select", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root-provider", "trigger-button", "input", "value-display", "options-list", "option-item", "portal-popover", "label", "indicator-check", "cancel-clear", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "on-change", "on-value-change", "multiple", "nullable", "active-option", "selected-option", "disabled-option", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["keyboard", "arrow-keys", "home-end", "enter", "escape", "pointer", "typeahead", "focus-management", "virtual-or-filtered", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-combobox", "role-listbox", "role-option", "aria-expanded", "aria-controls", "aria-selected", "aria-activedescendant", "aria-autocomplete", "aria-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "form", "required", "native-select", "hidden-select", "value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum([
      "controllable-value",
      "default-value-hook",
      "comparator",
      "combobox-machine",
      "virtualizer",
      "virtual-configuration",
      "display-value",
      "input-value-sync",
      "composition-guard",
      "immediate-focus-open",
      "input-ref-sync",
      "input-role-combobox",
      "input-aria-expanded",
      "input-aria-controls",
      "input-aria-activedescendant",
      "input-aria-autocomplete",
      "clear-on-empty",
      "open-on-input-change",
      "escape-clear",
      "tab-select-close",
      "button-refocus-input",
      "options-tree-walker-role-none",
      "options-modal-scroll-lock",
      "portal-owner-document",
      "input-movement-cancel-transition",
      "virtual-option-positioning",
      "option-refocus-input",
      "mobile-keyboard-guard",
      "option-register-order",
      "pointer-activation-trigger",
      "default-first-option",
      "active-descendant-virtual",
      "voiceover-input-reset",
      "listbox-machine",
      "data-ref-sync",
      "slice-state",
      "stack-machine",
      "top-layer",
      "outside-click-close",
      "refocus-button",
      "label-provider",
      "form-fields",
      "open-closed-provider",
      "floating-provider",
      "quick-release",
      "active-press",
      "floating-reference",
      "handle-toggle",
      "keyboard-open",
      "attempt-submit",
      "aria-haspopup-listbox",
      "button-aria-expanded",
      "button-aria-controls",
      "options-anchor",
      "portal-enabled",
      "transition-data",
      "disappear-close",
      "scroll-lock",
      "inert-others",
      "frozen-value",
      "active-descendant",
      "multiselectable",
      "orientation",
      "open-tab-index",
      "typeahead-search",
      "search-timeout",
      "select-active-option",
      "focus-next-prev",
      "focus-first-last",
      "tab-close-focus-next",
      "register-option",
      "unregister-option",
      "scroll-into-view",
      "pointer-tracking",
      "disabled-prevent-default",
      "option-role",
      "aria-selected",
      "data-focus",
      "unknown"
    ]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-select", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
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

export const ToolbarToggleReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  toolbarToggleSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-toolbar", "radix-toggle", "radix-toggle-group", "zag-toggle-group", "ariakit-toolbar", "custom", "unknown"]),
    toolbarCount: z.number().int().nonnegative(),
    toggleCount: z.number().int().nonnegative(),
    toggleGroupCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    separatorCount: z.number().int().nonnegative(),
    buttonLinkCount: z.number().int().nonnegative(),
    pressedStateCount: z.number().int().nonnegative(),
    rovingFocusCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-toolbar", "radix-toggle", "radix-toggle-group", "zag-toggle-group", "ariakit-toolbar", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["toolbar-root", "toolbar-provider", "toolbar-item", "button-link", "separator", "toggle-root", "toggle-group", "toggle-item", "input-container", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["pressed", "default-pressed", "on-pressed-change", "value", "default-value", "on-value-change", "single", "multiple", "data-state", "disabled", "deselectable", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["roving-focus", "composite-focus", "focus-loop", "virtual-focus", "active-item", "focusable-item", "rtl-dir", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["horizontal", "vertical", "aria-orientation", "dir", "loop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-toolbar", "role-group", "role-radio", "aria-pressed", "aria-checked", "aria-label", "aria-disabled", "tabindex", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["idle", "focused", "value-set", "toggle-click", "root-mouse-down", "root-focus", "root-blur", "toggle-focus", "focus-next", "focus-prev", "focus-first", "focus-last", "shift-tab", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value-array", "controlled-value", "default-value", "on-value-change", "multiple", "deselectable", "ensure-props", "add-or-remove", "item-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rovingFocusSignals: z.array(z.object({
    signal: z.enum(["focused-id", "tabbing-backward", "click-focus", "within-toolbar", "current-loop-focus", "raf-focus", "next-prev-by-id", "first-last", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "item-id", "data-ownedby", "data-disabled", "data-orientation", "data-focus", "data-state", "role-radiogroup", "role-group", "role-radio", "aria-checked", "aria-pressed", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value-api", "set-value-api", "item-state-api", "root-props", "item-props", "root-radiogroup-role", "root-group-role", "item-radio-role", "root-tabindex", "item-tabindex", "data-disabled", "data-orientation", "data-focus", "data-ownedby", "data-state", "aria-checked", "aria-pressed", "root-mouse-down-handler", "root-focus-handler", "root-blur-handler", "item-focus-handler", "item-click-handler", "item-keydown-handler", "arrow-key-map", "home-end-key-map", "shift-tab-key-map", "safari-focus-fix", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "keyboard-test", "role-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-toolbar", "@radix-ui/react-toggle", "@radix-ui/react-toggle-group", "@zag-js/toggle-group", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/utils", "@ariakit/react", "react", "unknown"]),
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

export const ScrollAreaReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scrollAreaSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-scroll-area", "zag-scroll-area", "native-scroll", "custom", "unknown"]),
    scrollAreaCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    scrollbarCount: z.number().int().nonnegative(),
    thumbCount: z.number().int().nonnegative(),
    cornerCount: z.number().int().nonnegative(),
    orientationCount: z.number().int().nonnegative(),
    overflowCount: z.number().int().nonnegative(),
    measurementCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-scroll-area", "zag-scroll-area", "native-scroll", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "viewport", "content", "scrollbar", "thumb", "corner", "provider-context", "anatomy-parts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["type", "scroll-hide-delay", "force-mount", "overflow-x", "overflow-y", "scrollbar-hidden", "scroll-progress", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  measurementSignals: z.array(z.object({
    signal: z.enum(["resize-observer", "scroll-height", "scroll-width", "client-height", "client-width", "thumb-size", "thumb-offset", "corner-size", "ratio", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["vertical", "horizontal", "dir", "rtl", "ltr", "data-orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["pointer", "wheel", "drag", "scroll-event", "scroll-to", "scroll-to-edge", "keyboard-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-presentation", "tabindex", "aria-label", "data-overflow", "data-ownedby", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "props-ensure-id", "bindable-context", "refs", "initial-idle", "watch-hidden-state", "top-level-effects", "entry-check-hovering", "exit-clear-timeouts", "thumb-measure-event", "viewport-scroll-event", "root-pointer-events", "idle-state", "dragging-state", "scrollbar-pointerdown-event", "thumb-pointerdown-event", "thumb-pointermove-event", "pointerup-events", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["scrolling-x", "scrolling-y", "hovering", "dragging", "touch-modality", "at-sides", "corner-size", "thumb-size", "hidden-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  refSignals: z.array(z.object({
    signal: z.enum(["orientation-ref", "scroll-position-ref", "scroll-y-timeout", "scroll-x-timeout", "scroll-end-timeout", "start-x", "start-y", "start-scroll-top", "start-scroll-left", "programmatic-scroll", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-content-resize", "resize-observer", "track-viewport-visibility", "intersection-observer", "track-wheel-event", "add-dom-event", "track-pointer-move", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-touch-modality", "set-hovering", "clear-hovering", "set-programmatic-scroll", "clear-scrolling", "set-thumb-size", "set-overflow-css-vars", "set-at-sides", "scroll-to-pointer", "start-dragging", "set-dragging-scroll", "stop-dragging", "clear-timeouts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "viewport-id", "content-id", "root-el", "viewport-el", "content-el", "scrollbar-x-el", "scrollbar-y-el", "thumb-x-el", "thumb-y-el", "corner-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  utilitySignals: z.array(z.object({
    signal: z.enum(["scroll-offset", "scroll-sides", "timeout", "scroll-to", "smooth-scroll", "scroll-progress", "scroll-to-edge", "rtl-scroll", "compact-scroll-options", "request-animation-frame", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["is-at-top", "is-at-bottom", "is-at-left", "is-at-right", "has-overflow-x", "has-overflow-y", "get-scroll-progress", "scroll-to-edge", "scroll-to", "get-scrollbar-state", "root-props", "viewport-props", "content-props", "scrollbar-props", "thumb-props", "corner-props", "root-pointer-handlers", "viewport-scroll-handler", "viewport-user-interaction", "scrollbar-pointer-handlers", "thumb-pointer-handler", "data-overflow", "data-ownedby", "data-orientation", "data-scrolling", "data-hover", "data-dragging", "corner-state", "css-vars", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "scroll-event-test", "wheel-test", "attribute-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-scroll-area", "@zag-js/scroll-area", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const AvatarReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  avatarSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-avatar", "zag-avatar", "native-img", "custom", "unknown"]),
    avatarCount: z.number().int().nonnegative(),
    imageCount: z.number().int().nonnegative(),
    fallbackCount: z.number().int().nonnegative(),
    loadingStatusCount: z.number().int().nonnegative(),
    delayCount: z.number().int().nonnegative(),
    srcCount: z.number().int().nonnegative(),
    altCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    ssrCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-avatar", "zag-avatar", "native-img", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "image", "fallback", "provider-context", "anatomy-parts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "loading", "loaded", "error", "data-state", "hidden", "delay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  imageSignals: z.array(z.object({
    signal: z.enum(["src", "srcset", "alt", "referrer-policy", "crossorigin", "complete", "natural-size", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["load-event", "error-event", "src-change", "image-removal", "status-change", "set-loaded-error", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ssrSignals: z.array(z.object({
    signal: z.enum(["hydration", "render-to-string", "use-is-hydrated", "server-render", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["alt-text", "role-img", "axe", "label", "fallback-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "loading-state", "loaded-state", "error-state", "src-change-event", "image-unmount-event", "image-loaded-event", "image-error-event", "check-image-status", "status-callback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-image-removal", "track-src-change", "observe-children", "observe-attributes", "removed-nodes", "src-srcset-watch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "image-id", "fallback-id", "root-el", "image-el", "data-scope-part", "data-state", "hidden", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["loaded", "set-src", "set-loaded", "set-error", "root-props", "image-props", "fallback-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "axe", "wait-for", "role-test", "fallback-test", "ssr-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-avatar", "@zag-js/avatar", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export type CheckboxRadioSwitchReadinessReport = z.infer<typeof CheckboxRadioSwitchReadinessReportSchema>;
export type SliderProgressReadinessReport = z.infer<typeof SliderProgressReadinessReportSchema>;
export type SelectComboboxReadinessReport = z.infer<typeof SelectComboboxReadinessReportSchema>;
export type ToolbarToggleReadinessReport = z.infer<typeof ToolbarToggleReadinessReportSchema>;
export type ScrollAreaReadinessReport = z.infer<typeof ScrollAreaReadinessReportSchema>;
export type AvatarReadinessReport = z.infer<typeof AvatarReadinessReportSchema>;
