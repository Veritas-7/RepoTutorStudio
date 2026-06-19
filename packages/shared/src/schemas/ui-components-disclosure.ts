import { z } from "zod";

export const DataTableReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dataTableSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["tanstack-table", "ag-grid", "react-data-grid", "custom", "unknown"]),
    columnCount: z.number().int().nonnegative(),
    rowCount: z.number().int().nonnegative(),
    sortCount: z.number().int().nonnegative(),
    filterCount: z.number().int().nonnegative(),
    paginationCount: z.number().int().nonnegative(),
    virtualizationCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    editingCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["tanstack-table", "ag-grid", "react-data-grid", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  columnSignals: z.array(z.object({
    signal: z.enum(["column-defs", "column-helper", "accessor-key", "cell-renderer", "header", "column-visibility", "column-pinning", "column-sizing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rowModelSignals: z.array(z.object({
    signal: z.enum(["core-row-model", "sorted-row-model", "filtered-row-model", "pagination-row-model", "grouped-row-model", "expanded-row-model", "row-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["sorting", "filtering", "pagination", "row-selection", "column-reorder", "row-expansion", "faceting", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["controlled-state", "on-state-change", "row-selection-state", "sorting-state", "pagination-state", "rows-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  virtualizationSignals: z.array(z.object({
    signal: z.enum(["use-virtualizer", "enable-virtualization", "virtual-rows", "viewport", "row-height", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  editingSignals: z.array(z.object({
    signal: z.enum(["editable", "cell-editor", "render-edit-cell", "on-rows-change", "value-getter", "value-formatter", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["grid-role", "row-role", "columnheader-role", "gridcell-role", "aria-rowcount", "aria-colcount", "aria-rowindex", "aria-colindex", "aria-sort", "keyboard-navigation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@tanstack/react-table", "@tanstack/react-virtual", "ag-grid-react", "ag-grid-community", "react-data-grid", "unknown"]),
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

export const CalendarReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  calendarSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["fullcalendar", "react-big-calendar", "react-day-picker", "custom", "unknown"]),
    viewCount: z.number().int().nonnegative(),
    eventCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    navigationCount: z.number().int().nonnegative(),
    localizationCount: z.number().int().nonnegative(),
    resourceCount: z.number().int().nonnegative(),
    dragDropCount: z.number().int().nonnegative(),
    rangeCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["fullcalendar", "react-big-calendar", "react-day-picker", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewSignals: z.array(z.object({
    signal: z.enum(["initial-view", "day-grid", "time-grid", "list-view", "month-view", "week-view", "agenda-view", "number-of-months", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  eventSignals: z.array(z.object({
    signal: z.enum(["events", "event-click", "date-click", "event-content", "event-class-names", "event-source", "event-accessors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["selectable", "select-callback", "on-select-slot", "on-select-event", "selected-date", "on-select-date", "selection-mode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["header-toolbar", "toolbar", "today-button", "prev-next", "default-date", "date-range-navigation", "caption-layout", "nav-layout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  localizationSignals: z.array(z.object({
    signal: z.enum(["time-zone", "locale", "localizer", "moment-localizer", "date-fns-localizer", "week-starts-on", "formats-messages", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resourceSignals: z.array(z.object({
    signal: z.enum(["resources", "resource-accessor", "resource-id", "resource-title", "resource-time-grid", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dragDropSignals: z.array(z.object({
    signal: z.enum(["interaction-plugin", "editable-events", "event-drop", "event-resize", "with-drag-and-drop", "draggable-accessor", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  rangeConstraintSignals: z.array(z.object({
    signal: z.enum(["valid-range", "min-max-time", "disabled-dates", "date-range", "start-end-month", "modifiers", "matcher", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["calendar-label", "grid-role", "aria-label", "keyboard-navigation", "button-labels", "focus-management", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "timezone-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@fullcalendar/react", "@fullcalendar/core", "react-big-calendar", "react-day-picker", "date-fns", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reactBigCalendarSignals: z.array(z.object({
    signal: z.enum(["calendar-component", "localizer-required", "moment-localizer", "globalize-localizer", "date-fns-localizer", "dayjs-localizer", "views-constant", "controlled-view", "default-view", "event-accessors", "tooltip-accessor", "all-day-accessor", "resource-accessors", "selectable-slots", "on-navigate", "on-view", "components-override", "event-prop-getter", "slot-prop-getter", "day-prop-getter", "formats", "messages", "popup", "drilldown", "show-multi-day-times", "time-bounds", "step-timeslots", "dnd-addon", "on-event-drop", "on-event-resize", "draggable-accessor", "resizable", "css-import", "sass-styles", "localizer-tests"]),
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

export const DialogReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  dialogSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-dialog", "headlessui-dialog", "ariakit-dialog", "native-dialog", "custom", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    portalCount: z.number().int().nonnegative(),
    overlayCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    titleDescriptionCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-dialog", "radix-alert-dialog", "headlessui-dialog", "ariakit-dialog", "native-dialog", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "trigger", "portal", "overlay", "content", "title", "description", "close", "panel", "backdrop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open-prop", "default-open", "on-open-change", "on-close", "dialog-provider", "dialog-store", "controlled-state", "transition-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["focus-scope", "focus-trap", "initial-focus", "restore-focus", "auto-focus", "final-focus", "tab-lock", "inert-others", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dismissalSignals: z.array(z.object({
    signal: z.enum(["dismissable-layer", "outside-click", "escape-key", "close-button", "dialog-dismiss", "hide-on-escape", "hide-on-interact-outside", "on-dismiss", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  portalOverlaySignals: z.array(z.object({
    signal: z.enum(["portal", "portal-group", "force-portal-root", "remove-scroll", "scroll-lock", "backdrop", "overlay", "modal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-dialog", "role-alertdialog", "aria-modal", "aria-labelledby", "aria-describedby", "aria-label", "title-required", "description-warning", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  animationSignals: z.array(z.object({
    signal: z.enum(["transition", "transition-child", "data-state", "force-mount", "open-closed-state", "mounted-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum([
      "server-handoff",
      "nested-portals",
      "root-containers",
      "main-tree-provider",
      "inert-others",
      "stack-machine",
      "top-layer",
      "outside-click",
      "escape-close",
      "escape-blur-active-element",
      "scroll-lock",
      "disappear-close",
      "description-provider",
      "focus-trap-features",
      "focus-trap-none",
      "focus-lock",
      "focus-trap-props",
      "resolve-containers",
      "sync-refs",
      "owner-document",
      "restore-element-history",
      "restore-focus-hook",
      "initial-focus-hook",
      "initial-focus-fallback",
      "focus-lock-hook",
      "tab-direction",
      "hidden-focus-guards",
      "focus-guard-dataset",
      "focusable-hidden",
      "microtask-focus",
      "focus-in-first-last",
      "focus-next-previous-wrap",
      "recent-tab-key",
      "disposables-raf",
      "blur-focus-lock",
      "event-listener",
      "contains-containers",
      "focus-trap-object-assign",
      "restore-focus",
      "tab-lock",
      "auto-focus",
      "initial-focus",
      "force-portal-root",
      "portal-group",
      "close-provider",
      "reset-open-closed-provider",
      "open-closed-context",
      "closing-state",
      "role-validation",
      "controlled-prop-validation",
      "aria-modal-open",
      "aria-labelledby",
      "aria-describedby",
      "tab-index-minus-one",
      "panel-stop-propagation",
      "backdrop-aria-hidden",
      "title-registration",
      "transition-wrapper",
      "render-strategy-static",
      "unknown"
    ]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "role-test", "keyboard-test", "focus-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-dialog", "@radix-ui/react-alert-dialog", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
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

export const PopoverTooltipReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  popoverTooltipSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-popover", "radix-tooltip", "radix-hover-card", "headless-popover", "floating-ui", "ariakit-popover", "ariakit-tooltip", "ariakit-hovercard", "custom", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    anchorCount: z.number().int().nonnegative(),
    portalCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    positionCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    dismissCount: z.number().int().nonnegative(),
    focusCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-popover", "radix-tooltip", "radix-hover-card", "headless-popover", "floating-ui", "ariakit-popover", "ariakit-tooltip", "ariakit-hovercard", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "provider", "trigger", "anchor", "portal", "content", "arrow", "dismiss", "heading", "description", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["use-floating", "popper", "side-offset", "align", "placement", "offset", "flip", "shift", "arrow-middleware", "auto-update", "collision-boundary", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "hover", "focus", "safe-polygon", "delay-duration", "open-prop", "on-open-change", "controlled-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dismissalSignals: z.array(z.object({
    signal: z.enum(["dismissable-layer", "use-dismiss", "escape-key", "outside-click", "popover-dismiss", "hide-on-escape", "hide-on-interact-outside", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["focus-scope", "floating-focus-manager", "initial-focus", "return-focus", "modal-focus", "tab-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-tooltip", "role-dialog", "aria-describedby", "aria-labelledby", "aria-label", "aria-expanded", "aria-controls", "keyboard-navigation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  portalSignals: z.array(z.object({
    signal: z.enum(["portal", "floating-portal", "force-mount", "mounted-state", "overlay", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["popover-machine", "machine-context", "demo-mode-open", "stack-machine", "action-open-close", "refocusable-close", "portalled-selector", "owner-document-focusables", "root-document", "group-context", "group-close-others", "nested-portals", "root-containers", "main-tree-provider", "close-provider", "open-closed-provider", "focus-out-close", "outside-click-close", "outside-click-refocus", "floating-provider", "floating-reference", "button-unique-identifier", "single-button-warning", "within-panel-close-button", "keyboard-toggle", "keyboard-escape-close", "space-keyup-prevent-default", "active-press", "focus-ring", "hover-state", "focus-guard-sentinels", "hidden-focus-sentinel", "tab-direction", "focus-in-panel", "microtask-focus", "backdrop-transition", "backdrop-aria-hidden", "panel-anchor", "floating-panel", "portal-owner-document", "transition-data", "disappear-close", "scroll-lock-modal", "panel-unlink-on-unmount", "panel-blur-close", "reset-open-closed-provider", "portal-enabled-visible-static", "button-width-css-var", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "hover-test", "keyboard-test", "role-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-popover", "@radix-ui/react-tooltip", "@radix-ui/react-hover-card", "@headlessui/react", "@floating-ui/react", "@floating-ui/react-dom", "@ariakit/react", "react", "unknown"]),
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

export const MenuDropdownReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  menuDropdownSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-dropdown-menu", "radix-context-menu", "radix-menubar", "radix-navigation-menu", "headless-menu", "headless-listbox", "headless-combobox", "ariakit-menu", "ariakit-select", "ariakit-combobox", "custom", "unknown"]),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    positioningCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-dropdown-menu", "radix-context-menu", "radix-menubar", "radix-navigation-menu", "headless-menu", "headless-listbox", "headless-combobox", "ariakit-menu", "ariakit-select", "ariakit-combobox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "trigger-button", "portal", "content", "item", "group", "label", "separator", "checkbox-item", "radio-item", "indicator", "submenu", "arrow", "viewport", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["value-prop", "on-value-change", "checked-state", "on-checked-change", "radio-group", "selected-state", "multiple-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  positioningSignals: z.array(z.object({
    signal: z.enum(["side", "align", "side-offset", "collision-boundary", "popper", "anchor", "viewport", "floating-panel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "context-menu", "hover", "typeahead", "roving-focus", "keyboard-navigation", "escape-key", "outside-click", "tab-close", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-menu", "role-menuitem", "role-listbox", "role-option", "aria-haspopup", "aria-expanded", "aria-controls", "aria-activedescendant", "aria-labelledby", "aria-selected", "aria-checked", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open-prop", "default-open", "on-open-change", "disabled", "data-state", "data-highlighted", "data-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["menu-machine", "machine-context", "stack-machine", "top-layer", "outside-click-close", "button-refocus", "floating-provider", "open-closed-provider", "button-floating-reference", "button-keyboard-open", "space-keyup-prevent-default", "quick-release", "handle-toggle", "pointer-open-trigger", "active-press", "button-aria-haspopup-menu", "button-aria-controls", "button-aria-expanded", "items-anchor", "items-floating-panel", "portal-owner-document", "transition-data", "disappear-close", "scroll-lock", "inert-others", "button-movement-cancel-transition", "items-focus-on-open", "items-tree-walker-role-none", "items-role-menu", "items-open-tab-index", "items-active-descendant", "typeahead-search", "search-timeout", "enter-click-active", "restore-focus", "focus-next-prev", "focus-first-last", "escape-close", "tab-close-focus-next", "register-items", "unregister-items", "sort-items", "scroll-into-view", "text-value", "pointer-tracking", "disabled-focus-nothing", "item-role-menuitem", "aria-disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "keyboard-test", "role-test", "pointer-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-dropdown-menu", "@radix-ui/react-context-menu", "@radix-ui/react-menubar", "@radix-ui/react-navigation-menu", "@headlessui/react", "@ariakit/react", "react", "unknown"]),
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

export const ToastSnackbarReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  toastSnackbarSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix-toast", "sonner", "react-hot-toast", "notistack", "mui-snackbar", "zag-toast", "custom", "unknown"]),
    providerCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    toastCount: z.number().int().nonnegative(),
    titleDescriptionCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    closeCount: z.number().int().nonnegative(),
    variantCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-toast", "sonner", "react-hot-toast", "notistack", "mui-snackbar", "zag-toast", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["provider", "toaster", "viewport", "root", "title", "description", "action", "close", "icon", "portal-container", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  variantSignals: z.array(z.object({
    signal: z.enum(["success", "error", "warning", "info", "loading", "promise", "custom", "rich-colors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["open-state", "duration", "auto-dismiss", "dismiss", "remove", "pause-resume", "queue-limit", "prevent-duplicate", "persist", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["swipe", "keyboard-shortcut", "escape-key", "click-away", "action-button", "close-button", "hover-pause", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-status", "aria-live", "aria-atomic", "region-label", "alt-text", "close-label", "focus-visible", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stylingSignals: z.array(z.object({
    signal: z.enum(["position", "offset", "transition", "swipe-direction", "theme", "unstyled", "class-names", "data-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["toast-machine", "group-machine", "visible-state", "visible-persist-state", "visible-updating-state", "dismissing-state", "unmounted-state", "computed-z-index", "computed-height", "computed-frontmost", "computed-should-persist", "wait-for-duration", "wait-for-remove-delay", "wait-for-next-tick", "track-height", "mutation-observer", "queue-microtask-measure", "status-change-callback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storeSignals: z.array(z.object({
    signal: z.enum(["create-toast-store", "priority-sorting", "queue-max", "toast-create-update", "dismissed-set", "visible-toasts", "promise-unwrap", "http-response-error", "pause-resume-messages", "expand-collapse", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  groupSignals: z.array(z.object({
    signal: z.enum(["subscribe-to-store", "document-visibility", "hotkey-focus-region", "dismissable-branch", "stack-overlap-states", "pointer-enter-leave", "focus-blur-region", "ignore-mouse-timer", "restore-last-focus", "region-live-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["root-props", "ghost-before-after", "title-description-props", "action-trigger", "close-trigger", "placement-style", "toast-data-attrs", "keyboard-dismiss", "group-props", "group-subscribe", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "cypress", "testing-library", "timer-test", "role-test", "interaction-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@radix-ui/react-toast", "sonner", "react-hot-toast", "notistack", "@mui/material", "@zag-js/toast", "@zag-js/core", "@zag-js/dom-query", "@zag-js/dismissable", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const TabsAccordionReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tabsAccordionSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["radix", "headless-ui", "ariakit", "zag-accordion", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    panelCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    keyboardCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["radix-tabs", "radix-accordion", "radix-collapsible", "headless-tabs", "headless-disclosure", "ariakit-tabs", "ariakit-disclosure", "zag-accordion", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "list", "trigger", "content", "item", "header", "panel", "provider", "disclosure-button", "disclosure-panel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["controlled-value", "default-value", "selected-index", "selected-id", "open-state", "default-open", "on-change", "data-state", "force-mount", "unmount-on-hide", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["keyboard-navigation", "arrow-keys", "home-end", "tab-key", "click", "manual-activation", "automatic-activation", "roving-focus", "disabled-item", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-tablist", "role-tab", "role-tabpanel", "aria-selected", "aria-controls", "aria-expanded", "aria-orientation", "aria-label", "focus-management", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  orientationSignals: z.array(z.object({
    signal: z.enum(["horizontal", "vertical", "activation-mode", "dir", "rtl", "collapsible", "multiple", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "focused-state", "value-set-event", "trigger-focus-event", "trigger-click-event", "goto-next-prev", "goto-first-last", "trigger-blur-event", "can-toggle-guard", "is-expanded-guard", "collapse-action", "expand-action", "focus-trigger-actions", "focused-value", "bindable-value", "computed-horizontal", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "item-id", "item-content-id", "item-trigger-id", "root-el", "trigger-elements", "first-last-trigger", "next-prev-trigger", "data-ownedby", "data-controls", "data-state", "data-focus", "data-disabled", "data-orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["focused-value-api", "value-api", "set-value-api", "item-state-api", "root-props", "item-props", "item-content-props", "item-indicator-props", "item-trigger-props", "region-role", "aria-labelledby", "aria-hidden", "aria-controls", "aria-expanded", "data-controls", "data-ownedby", "hidden-content", "trigger-focus-handler", "trigger-blur-handler", "trigger-click-handler", "trigger-keydown-handler", "arrow-key-map", "home-end-key-map", "safari-focus-fix", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  implementationSignals: z.array(z.object({
    signal: z.enum(["tabs-data-context", "tabs-actions-context", "tabs-controlled-info", "tabs-register-tab", "tabs-register-panel", "tabs-dom-sort", "tabs-focus-sentinel", "tabs-stable-collection", "tabs-stable-index", "tabs-iso-effect", "tabs-latest-value", "tabs-auto-activation", "tabs-manual-activation", "tabs-keyboard-map", "tabs-focus-in", "tabs-mousedown-prevent-default", "tabs-click-selection", "tabs-microtask-ready", "tabs-hidden-panel", "tabs-object-assign", "disclosure-context", "disclosure-api-context", "disclosure-panel-context", "disclosure-reducer", "disclosure-default-open", "disclosure-close-refocus", "disclosure-open-closed-provider", "disclosure-close-provider", "disclosure-button-id", "disclosure-panel-id", "disclosure-within-panel", "disclosure-space-enter-toggle", "disclosure-keyup-prevent-default", "disclosure-disabled-guard", "disclosure-button-type", "disclosure-focus-ring", "disclosure-hover-state", "disclosure-active-press", "disclosure-transition", "disclosure-reset-open-closed", "disclosure-start-transition", "disclosure-object-assign", "unknown"]),
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
    signal: z.enum(["@radix-ui/react-tabs", "@radix-ui/react-accordion", "@radix-ui/react-collapsible", "@headlessui/react", "@ariakit/react", "@zag-js/accordion", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export type DataTableReadinessReport = z.infer<typeof DataTableReadinessReportSchema>;
export type CalendarReadinessReport = z.infer<typeof CalendarReadinessReportSchema>;
export type DialogReadinessReport = z.infer<typeof DialogReadinessReportSchema>;
export type PopoverTooltipReadinessReport = z.infer<typeof PopoverTooltipReadinessReportSchema>;
export type MenuDropdownReadinessReport = z.infer<typeof MenuDropdownReadinessReportSchema>;
export type ToastSnackbarReadinessReport = z.infer<typeof ToastSnackbarReadinessReportSchema>;
export type TabsAccordionReadinessReport = z.infer<typeof TabsAccordionReadinessReportSchema>;
