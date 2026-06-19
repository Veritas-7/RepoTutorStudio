import { z } from "zod";

export const ClipboardReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  clipboardSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-clipboard", "native-clipboard", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    copyCount: z.number().int().nonnegative(),
    statusCount: z.number().int().nonnegative(),
    timerCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    fallbackCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-clipboard", "native-clipboard", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "input", "trigger", "indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "set-value", "sync-input", "read-only-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  copySignals: z.array(z.object({
    signal: z.enum(["copy", "input-copy", "navigator-clipboard", "exec-command", "selection-range", "fallback-node", "copy-done", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  statusSignals: z.array(z.object({
    signal: z.enum(["copied-state", "data-copied", "status-change", "timeout", "translations", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "label", "read-only", "data-readonly", "focus-select", "hidden-indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "copied-state", "value-context", "value-set-event", "copy-event", "input-copy-event", "copy-done-event", "watch-value-sync", "default-value", "timeout-default", "translation-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["timeout-effect", "raf-timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "copy-to-clipboard", "invoke-on-copy", "sync-input-element", "send-copy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "label-id", "input-el", "write-to-clipboard", "create-node", "copy-node", "copy-text", "navigator-write-text", "exec-command", "selection-range", "append-remove-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["copied", "value", "set-value", "copy", "root-props", "label-props", "control-props", "input-props", "trigger-props", "indicator-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "copy-test", "aria-test", "status-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/clipboard", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const QrCodeReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  qrCodeSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-qr-code", "native-svg-qr", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    frameCount: z.number().int().nonnegative(),
    patternCount: z.number().int().nonnegative(),
    overlayCount: z.number().int().nonnegative(),
    downloadCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    encodingCount: z.number().int().nonnegative(),
    pixelCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    dataUrlCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-qr-code", "native-svg-qr", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "frame", "pattern", "overlay", "download-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["value", "default-value", "set-value", "on-value-change", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  encodingSignals: z.array(z.object({
    signal: z.enum(["encoding", "uqr", "encoded-size", "pixel-size", "path-data", "viewbox", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  downloadSignals: z.array(z.object({
    signal: z.enum(["get-data-url", "download-trigger", "mime-type", "quality", "file-name", "anchor-click", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-img", "aria-label", "svg", "button", "overlay-alt", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "idle-state", "value-context", "default-value", "pixel-size-default", "computed-encoded", "memo-encoded", "encode-uqr", "value-set-event", "download-trigger-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["encoded", "encoded-size", "encoded-data", "width-height", "path-list", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-value", "download-qr-code", "get-data-url", "anchor-create", "anchor-download", "anchor-click", "anchor-remove", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "frame-id", "frame-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value", "set-value", "get-data-url", "root-props", "frame-props", "pattern-props", "overlay-props", "download-trigger-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "download-test", "data-url-test", "svg-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/qr-code", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "proxy-memoize", "uqr", "react", "unknown"]),
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

export const TimerReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  timerSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-timer", "native-timer", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    areaCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    actionCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    timeCount: z.number().int().nonnegative(),
    tickCount: z.number().int().nonnegative(),
    progressCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-timer", "native-timer", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "area", "control", "item", "item-label", "item-value", "separator", "action-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "running", "paused", "running-temp", "auto-start", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  timeSignals: z.array(z.object({
    signal: z.enum(["time-parts", "formatted-time", "progress-percent", "countdown", "start-ms", "target-ms", "interval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlSignals: z.array(z.object({
    signal: z.enum(["start", "pause", "resume", "reset", "restart", "tick", "complete", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["role-timer", "aria-label", "aria-atomic", "aria-hidden", "hidden-actions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["validate-props", "positive-interval", "nonnegative-start", "nonnegative-target", "countdown-config", "stopwatch-config", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "validate-props", "idle-state", "running-state", "running-temp-state", "paused-state", "auto-start", "restart-event", "start-event", "pause-event", "resume-event", "reset-event", "tick-event", "continue-event", "current-ms-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["time", "formatted-time", "progress-percent", "memo-progress", "clamp-value", "ms-to-time", "format-time", "to-percent", "round-to-interval", "pad-start", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["keep-ticking", "wait-next-tick", "raf-interval", "raf-timeout", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["update-time", "reset-time", "invoke-on-tick", "invoke-on-complete", "countdown-delta", "target-clamp", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["has-reached-target", "countdown-target-default", "countdown-target", "stopwatch-target", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "area-id", "area-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["running", "paused", "time", "formatted-time", "progress-percent", "start", "pause", "resume", "reset", "restart", "root-props", "area-props", "control-props", "item-props", "item-label-props", "item-value-props", "separator-props", "action-trigger-props", "valid-actions", "hidden-actions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parseSignals: z.array(z.object({
    signal: z.enum(["parse-string", "parse-time-segment", "time-segments", "milliseconds", "invalid-date", "is-object", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "fake-timers", "click-test", "aria-test", "progress-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/timer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const StepsReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  stepsSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-steps", "native-stepper", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    listCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    navCount: z.number().int().nonnegative(),
    progressCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    validationCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-steps", "native-stepper", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "list", "item", "trigger", "indicator", "separator", "content", "next-trigger", "prev-trigger", "progress", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["step", "default-step", "current", "completed", "incomplete", "first-last", "has-next-prev", "is-completed", "percent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["step-set", "step-next", "step-prev", "step-reset", "set-step", "next-step", "prev-step", "reset-step", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  validationSignals: z.array(z.object({
    signal: z.enum(["linear", "is-step-valid", "is-step-skippable", "on-step-invalid", "range-check", "count", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["tablist", "tab", "tabpanel", "aria-current", "aria-selected", "aria-controls", "aria-owns", "aria-orientation", "disabled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-step", "count-default", "linear-default", "orientation-default", "bindable-step", "idle-state", "entry-validate-step", "step-set-event", "step-next-event", "step-prev-event", "step-reset-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["percent", "memo-percent", "has-next-step", "has-prev-step", "completed", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["current-step-valid", "valid-step-navigation", "skippable-bypass", "valid-callback", "range-check", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["go-to-next-step", "go-to-prev-step", "reset-step", "set-step", "validate-step-index", "invoke-step-invalid", "step-change-callback", "step-complete-callback", "min-bound", "max-bound", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "list-id", "trigger-id", "content-id", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["value", "count", "percent", "has-next-step", "has-prev-step", "is-completed", "is-step-valid", "is-step-skippable", "go-to-next-step", "go-to-prev-step", "reset-step", "get-item-state", "set-step", "root-props", "list-props", "item-props", "trigger-props", "content-props", "next-trigger-props", "prev-trigger-props", "progress-props", "indicator-props", "separator-props", "item-state", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "aria-test", "linear-test", "progress-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/steps", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const CarouselReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  carouselSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-carousel", "native-carousel", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    itemGroupCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    autoplayCount: z.number().int().nonnegative(),
    snapCount: z.number().int().nonnegative(),
    scrollCount: z.number().int().nonnegative(),
    dragCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-carousel", "native-carousel", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "item-group", "item", "control", "prev-trigger", "next-trigger", "indicator-group", "indicator", "autoplay-trigger", "progress-text", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["page", "page-snap-points", "slides-in-view", "can-scroll-next-prev", "is-playing", "is-dragging", "loop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  snapSignals: z.array(z.object({
    signal: z.enum(["scroll-snap", "snap-points", "slides-per-page", "slides-per-move", "auto-size", "spacing", "orientation", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["scroll-next", "scroll-prev", "scroll-to", "scroll-to-index", "indicator-click", "keyboard", "wheel", "touch", "mouse-drag", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  autoplaySignals: z.array(z.object({
    signal: z.enum(["autoplay", "play", "pause", "tick", "interval", "visibility", "autoplay-status", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["region", "carousel-roledescription", "slide-roledescription", "aria-live", "aria-label", "aria-hidden", "aria-controls", "data-current", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "ensure-slide-count", "default-page", "orientation-default", "snap-type-default", "loop-autoplay-default", "slides-per-page", "slides-per-move", "autoplay-default", "allow-mouse-drag-default", "in-view-threshold", "auto-size-default", "idle-state", "focus-state", "dragging-state", "settling-state", "user-scroll-state", "autoplay-state", "page-next-event", "page-prev-event", "page-set-event", "index-set-event", "snap-refresh-event", "page-scroll-event", "dragging-events", "autoplay-events", "viewport-events", "scroll-end-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-rtl", "is-horizontal", "can-scroll-next", "can-scroll-prev", "autoplay-interval", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-slide-mutation", "track-slide-intersections", "track-slide-resize", "track-scroll", "track-settling-scroll", "track-document-visibility", "track-pointer-move", "track-keyboard-scroll", "auto-update-slide", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["clear-scroll-end-timer", "scroll-to-page", "scroll-if-drifted", "set-closest-page", "set-next-page", "set-prev-page", "set-matching-page", "set-page", "set-snap-points", "disable-scroll-snap", "scroll-slides", "end-dragging", "focus-indicator", "invoke-drag-start", "invoke-dragging", "invoke-dragging-end", "invoke-autoplay", "invoke-autoplay-start", "invoke-autoplay-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-focused", "can-scroll-next", "can-scroll-prev", "loop-mode", "drift-threshold", "clamp-page", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "item-id", "item-group-id", "next-trigger-id", "prev-trigger-id", "indicator-group-id", "indicator-id", "root-el", "item-group-el", "item-el", "item-els", "indicator-el", "sync-tab-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["is-playing", "is-dragging", "page", "page-snap-points", "can-scroll-next", "can-scroll-prev", "progress", "progress-text", "scroll-to-index", "scroll-to", "scroll-next", "scroll-prev", "play", "pause", "is-in-view", "refresh", "root-props", "item-group-props", "item-props", "control-props", "prev-trigger-props", "next-trigger-props", "indicator-group-props", "indicator-props", "autoplay-trigger-props", "progress-text-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "autoplay-test", "drag-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/carousel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/scroll-snap", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const TreeViewReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  treeViewSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-tree-view", "native-tree", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    treeCount: z.number().int().nonnegative(),
    branchCount: z.number().int().nonnegative(),
    itemCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    checkboxCount: z.number().int().nonnegative(),
    renameCount: z.number().int().nonnegative(),
    selectionCount: z.number().int().nonnegative(),
    expansionCount: z.number().int().nonnegative(),
    loadingCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-tree-view", "native-tree", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "tree", "branch", "branch-control", "branch-trigger", "branch-content", "branch-indicator", "item", "node-checkbox", "node-rename-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["expanded-value", "selected-value", "checked-value", "focused-value", "visible-nodes", "node-state", "loading-status", "renaming-value", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  navigationSignals: z.array(z.object({
    signal: z.enum(["arrow-down", "arrow-up", "arrow-left", "arrow-right", "home", "end", "typeahead", "select-parent", "expand-parent", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  selectionSignals: z.array(z.object({
    signal: z.enum(["single", "multiple", "select", "deselect", "select-all", "checked-toggle", "checked-map", "shift-selection", "ctrl-selection", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  loadingSignals: z.array(z.object({
    signal: z.enum(["load-children", "loading-status", "abort-controller", "load-complete", "load-error", "scroll-to-index", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renameSignals: z.array(z.object({
    signal: z.enum(["start-renaming", "submit-renaming", "cancel-renaming", "can-rename", "before-rename", "rename-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["tree-role", "treeitem-role", "group-role", "checkbox-role", "aria-multiselectable", "aria-selected", "aria-expanded", "aria-level", "aria-checked", "aria-busy", "aria-label", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-selection-mode", "default-collection", "default-typeahead", "default-expand-on-click", "default-expanded-value", "default-selected-value", "translation-defaults", "idle-state", "renaming-state", "expanded-set-event", "expanded-clear-event", "expanded-all-event", "branch-expand-event", "branch-collapse-event", "selected-set-event", "selected-all-event", "selected-clear-event", "node-select-event", "node-deselect-event", "checked-toggle-event", "checked-set-event", "checked-clear-event", "node-focus-event", "keyboard-navigation-events", "branch-node-events", "branch-toggle-click-event", "tree-typeahead-event", "node-rename-event", "rename-submit-event", "rename-cancel-event", "clear-pending-aborts-exit", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["expanded-value", "selected-value", "focused-value", "loading-status", "checked-value", "renaming-value", "typeahead-state", "pending-aborts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-multiple-selection", "is-typing-ahead", "visible-nodes", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["select-node", "deselect-node", "set-focused-node", "toggle-branch-node", "expand-branch", "expand-branches", "collapse-branch", "collapse-branches", "set-expanded", "clear-expanded", "set-selected", "clear-selected", "focus-tree-first-node", "focus-tree-last-node", "focus-branch-first-node", "focus-tree-next-node", "focus-tree-prev-node", "focus-branch-node", "select-all-nodes", "focus-matched-node", "toggle-node-selection", "expand-all-branches", "expand-sibling-branches", "extend-selection-to-node", "extend-selection-to-next-node", "extend-selection-to-prev-node", "extend-selection-to-first-node", "extend-selection-to-last-node", "clear-pending-aborts", "toggle-checked", "set-checked", "clear-checked", "set-renaming-value", "submit-renaming", "cancel-renaming", "sync-rename-input", "focus-rename-input", "scroll-to-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-branch-focused", "is-branch-expanded", "is-shift-key", "is-ctrl-key", "has-selected-items", "is-multiple-selection", "move-focus", "expand-on-click", "is-rename-label-valid", "skip-collapsed-branch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  asyncSignals: z.array(z.object({
    signal: z.enum(["load-children", "loading-status", "loaded-status", "pending-aborts", "abort-controller", "promise-all-settled", "load-complete-callback", "load-error-callback", "collection-replace", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "label-id", "node-id", "tree-id", "tree-el", "focus-node", "rename-input-id", "rename-input-el", "ownedby-data", "path-data", "value-data", "depth-data", "state-data", "loading-data", "renaming-data", "checked-data", "indeterminate-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["collection", "expanded-value", "selected-value", "checked-value", "toggle-checked", "set-checked", "clear-checked", "checked-map", "expand", "collapse", "select", "deselect", "visible-nodes", "focus", "select-parent", "expand-parent", "set-expanded-value", "set-selected-value", "start-renaming", "submit-renaming", "cancel-renaming", "root-props", "label-props", "tree-props", "node-state", "item-props", "item-text-props", "item-indicator-props", "branch-props", "branch-indicator-props", "branch-trigger-props", "branch-control-props", "branch-content-props", "branch-text-props", "branch-indent-guide-props", "node-checkbox-props", "node-rename-input-props", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "typeahead-test", "rename-test", "loading-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/tree-view", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const CollapsibleReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  collapsibleSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-collapsible", "radix-collapsible", "native-disclosure", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    contentCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    stateCount: z.number().int().nonnegative(),
    sizeCount: z.number().int().nonnegative(),
    animationCount: z.number().int().nonnegative(),
    tabbableCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-collapsible", "radix-collapsible", "native-disclosure", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "trigger", "content", "indicator", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["open", "closed", "closing", "visible", "disabled", "controlled-open", "default-open", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sizeSignals: z.array(z.object({
    signal: z.enum(["measure-size", "collapsed-height", "collapsed-width", "css-vars", "hidden", "overflow", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  animationSignals: z.array(z.object({
    signal: z.enum(["enter-animation", "exit-animation", "animation-end", "exit-complete", "initial-state", "cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  focusSignals: z.array(z.object({
    signal: z.enum(["tabbables", "inert", "observe-children", "restore-inert", "disabled-trigger", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-expanded", "aria-controls", "data-state", "data-disabled", "button-type", "hidden", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "initial-open", "initial-closed", "open-state", "closed-state", "closing-state", "controlled-open-event", "controlled-close-event", "open-event", "close-event", "size-measure-event", "animation-end-event", "watch-open", "exit-cleanup", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["size-context", "initial-context", "cleanup-ref", "styles-ref", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-enter-animation", "track-exit-animation", "track-tabbable-elements", "computed-style", "animationend-listener", "raf", "next-tick", "tabbables", "set-inert", "observe-children", "set-style", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-initial", "clear-initial", "cleanup-node", "measure-size", "compute-size", "invoke-on-open", "invoke-on-close", "invoke-on-exit-complete", "toggle-visibility", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-open-controlled", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "content-id", "trigger-id", "root-el", "content-el", "trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["disabled", "visible", "open", "measure-size", "set-open", "root-props", "content-props", "trigger-props", "indicator-props", "collapsed-size", "hidden-content", "css-vars", "aria-expanded", "aria-controls", "data-state", "data-disabled", "data-has-collapsed-size", "trigger-click-handler", "button-type", "dir-prop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "aria-test", "animation-test", "size-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/collapsible", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "@radix-ui/react-collapsible", "react", "unknown"]),
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

export const EditableReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  editableSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-editable", "native-contenteditable", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    areaCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    previewCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    valueCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-editable", "native-contenteditable", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "area", "label", "preview", "input", "edit-trigger", "submit-trigger", "cancel-trigger", "control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["edit", "preview", "editing", "empty", "value", "previous-value", "controlled-edit", "default-edit", "disabled", "read-only", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  valueSignals: z.array(z.object({
    signal: z.enum(["set-value", "clear-value", "value-change", "value-commit", "value-revert", "max-length", "placeholder", "auto-resize", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["activation-focus", "activation-click", "activation-dblclick", "submit-enter", "submit-blur", "cancel-escape", "interact-outside", "final-focus", "select-on-focus", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-invalid", "aria-readonly", "aria-disabled", "data-focus", "data-disabled", "data-readonly", "data-invalid", "required", "form-name", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "initial-edit", "initial-preview", "edit-state", "preview-state", "controlled-edit-event", "controlled-preview-event", "edit-event", "cancel-event", "submit-event", "value-set-event", "watch-value", "watch-edit", "entry-focus-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["value-context", "previous-value-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["submit-on-enter", "submit-on-blur", "is-interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-interact-outside", "focus-outside", "pointer-down-outside", "interact-outside", "exclude-triggers", "contains", "submit-on-blur-routing", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["restore-focus", "clear-value", "focus-input-if-needed", "focus-input", "invoke-on-cancel", "invoke-on-submit", "invoke-on-edit", "invoke-on-preview", "toggle-editing", "sync-input-value", "set-element-value", "set-value", "set-previous-value", "revert-value", "blur-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  guardSignals: z.array(z.object({
    signal: z.enum(["is-edit-controlled", "is-submit-event", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "area-id", "label-id", "preview-id", "input-id", "control-id", "submit-trigger-id", "cancel-trigger-id", "edit-trigger-id", "input-el", "preview-el", "submit-trigger-el", "cancel-trigger-el", "edit-trigger-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["editing", "empty", "value", "value-text", "set-value", "clear-value", "edit", "cancel", "submit", "root-props", "area-props", "label-props", "input-props", "preview-props", "edit-trigger-props", "control-props", "submit-trigger-props", "cancel-trigger-props", "hidden-edit", "auto-resize", "aria-label", "aria-invalid", "aria-readonly", "aria-disabled", "form-name", "button-type", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "click-test", "keyboard-test", "blur-test", "commit-test", "cancel-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/editable", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/interact-outside", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const PasswordInputReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  passwordInputSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-password-input", "native-password-input", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    triggerCount: z.number().int().nonnegative(),
    indicatorCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    visibilityCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    passwordManagerCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-password-input", "native-password-input", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "input", "visibility-trigger", "indicator", "control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "visible", "hidden", "disabled", "invalid", "read-only", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  visibilitySignals: z.array(z.object({
    signal: z.enum(["default-visible", "set-visible", "toggle-visible", "visibility-change", "trigger-click", "focus-input", "type-switch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["form-reset", "form-submit", "name", "auto-complete", "required", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  passwordManagerSignals: z.array(z.object({
    signal: z.enum(["ignore-password-managers", "one-password", "lastpass", "bitwarden", "dashlane", "proton-pass", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-controls", "aria-expanded", "aria-invalid", "aria-hidden", "data-state", "data-disabled", "data-invalid", "data-readonly", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-visible", "default-autocomplete", "ignore-password-managers-default", "translations", "idle-state", "visibility-set-event", "trigger-click-event", "track-form-events-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["visible-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-form-events", "form-reset-listener", "form-submit-listener", "abort-controller", "reset-hides", "submit-hides", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["set-visibility", "toggle-visibility", "focus-input-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "input-id", "input-el", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["visible", "disabled", "invalid", "focus", "set-visible", "toggle-visible", "root-props", "label-props", "input-props", "visibility-trigger-props", "indicator-props", "control-props", "type-switch", "password-manager-props", "aria-controls", "aria-expanded", "aria-label", "aria-invalid", "aria-hidden", "data-state", "data-disabled", "data-invalid", "data-readonly", "button-type", "tab-index", "left-click", "read-only-api", "required-prop", "data-required", "auto-capitalize-off", "spell-check-false", "prevent-default", "interactive-guard", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "reset-test", "submit-test", "visibility-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/password-input", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react", "unknown"]),
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

export const SignaturePadReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  signaturePadSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["zag-signature-pad", "native-canvas", "custom", "unknown"]),
    rootCount: z.number().int().nonnegative(),
    labelCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    segmentCount: z.number().int().nonnegative(),
    segmentPathCount: z.number().int().nonnegative(),
    guideCount: z.number().int().nonnegative(),
    clearTriggerCount: z.number().int().nonnegative(),
    hiddenInputCount: z.number().int().nonnegative(),
    drawingCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  frameworkSignals: z.array(z.object({
    signal: z.enum(["zag-signature-pad", "native-canvas", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structureSignals: z.array(z.object({
    signal: z.enum(["root", "label", "control", "segment", "segment-path", "guide", "clear-trigger", "hidden-input", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  stateSignals: z.array(z.object({
    signal: z.enum(["idle", "drawing", "empty", "disabled", "read-only", "required", "interactive", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  drawingSignals: z.array(z.object({
    signal: z.enum(["pointer-down", "pointer-move", "pointer-up", "current-points", "current-path", "paths", "pressure", "perfect-freehand", "stroke-options", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["svg-path", "data-url", "png", "jpeg", "svg", "quality", "clear", "draw-callback", "draw-end-callback", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["name", "hidden-input", "required", "value", "readonly", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["aria-label", "aria-roledescription", "aria-disabled", "data-disabled", "data-required", "role-application", "tab-index", "label-for", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  machineSignals: z.array(z.object({
    signal: z.enum(["create-machine", "default-paths", "drawing-defaults", "translations", "idle-state", "drawing-state", "pointer-down-event", "pointer-move-event", "pointer-up-event", "clear-event", "track-pointer-move-effect", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  contextSignals: z.array(z.object({
    signal: z.enum(["paths-context", "current-points-context", "current-path-context", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  computedSignals: z.array(z.object({
    signal: z.enum(["is-interactive", "is-empty", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  effectSignals: z.array(z.object({
    signal: z.enum(["track-pointer-move", "get-relative-point", "pointer-move-send", "pointer-up-send", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  actionSignals: z.array(z.object({
    signal: z.enum(["add-point", "end-stroke", "clear-points", "focus-canvas-el", "invoke-on-draw", "invoke-on-draw-end", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  domSignals: z.array(z.object({
    signal: z.enum(["root-id", "control-id", "label-id", "hidden-input-id", "control-el", "segment-el", "hidden-input-el", "data-url", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  apiSignals: z.array(z.object({
    signal: z.enum(["empty", "drawing", "current-path", "paths", "clear", "get-data-url", "label-props", "root-props", "control-props", "segment-props", "segment-path-props", "guide-props", "clear-trigger-props", "hidden-input-props", "left-click", "modifier-key", "pointer-capture", "role-application", "aria-roledescription", "aria-label", "aria-disabled", "tab-index", "touch-action", "user-select", "button-type", "hidden", "read-only", "name", "value", "data-disabled", "data-required", "dir-prop", "default-prevented", "clear-trigger-target-guard", "pointer-events-none", "input-type-text", "required-prop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "testing-library", "user-event", "pointer-test", "clear-test", "data-url-test", "hidden-input-test", "aria-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["@zag-js/signature-pad", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "perfect-freehand", "react", "unknown"]),
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

export type ClipboardReadinessReport = z.infer<typeof ClipboardReadinessReportSchema>;
export type QrCodeReadinessReport = z.infer<typeof QrCodeReadinessReportSchema>;
export type TimerReadinessReport = z.infer<typeof TimerReadinessReportSchema>;
export type StepsReadinessReport = z.infer<typeof StepsReadinessReportSchema>;
export type CarouselReadinessReport = z.infer<typeof CarouselReadinessReportSchema>;
export type TreeViewReadinessReport = z.infer<typeof TreeViewReadinessReportSchema>;
export type CollapsibleReadinessReport = z.infer<typeof CollapsibleReadinessReportSchema>;
export type EditableReadinessReport = z.infer<typeof EditableReadinessReportSchema>;
export type PasswordInputReadinessReport = z.infer<typeof PasswordInputReadinessReportSchema>;
export type SignaturePadReadinessReport = z.infer<typeof SignaturePadReadinessReportSchema>;
