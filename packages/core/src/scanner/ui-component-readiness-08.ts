import path from "node:path";
import type { ColorPickerReadinessReport, SplitterReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildColorPickerReadinessReport(walk: WalkResult): Promise<ColorPickerReadinessReport> {
  const sourceFiles = await colorPickerReadinessSourceFiles(walk);
  const colorPickerSetups = colorPickerReadinessSetups(sourceFiles);
  const frameworkSignals = colorPickerReadinessFrameworkSignals(sourceFiles);
  const structureSignals = colorPickerReadinessStructureSignals(sourceFiles);
  const valueSignals = colorPickerReadinessValueSignals(sourceFiles);
  const channelSignals = colorPickerReadinessChannelSignals(sourceFiles);
  const interactionSignals = colorPickerReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = colorPickerReadinessAccessibilitySignals(sourceFiles);
  const formSignals = colorPickerReadinessFormSignals(sourceFiles);
  const machineSignals = colorPickerReadinessMachineSignals(sourceFiles);
  const computedSignals = colorPickerReadinessComputedSignals(sourceFiles);
  const effectSignals = colorPickerReadinessEffectSignals(sourceFiles);
  const guardSignals = colorPickerReadinessGuardSignals(sourceFiles);
  const actionSignals = colorPickerReadinessActionSignals(sourceFiles);
  const domSignals = colorPickerReadinessDomSignals(sourceFiles);
  const apiSignals = colorPickerReadinessApiSignals(sourceFiles);
  const testSignals = colorPickerReadinessTestSignals(sourceFiles);
  const packageSignals = colorPickerReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.areaCount > 0 || item.channelSliderCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.valueCount > 0);
  const hasChannels = channelSignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.channelInputCount > 0 || item.channelSliderCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.interactionCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.accessibilityCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.formCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || colorPickerSetups.some((item) => item.testCount > 0);

  const riskQueue: ColorPickerReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document color-picker root, control, trigger, content, area, channel slider, input, swatch, eyedropper, and format structure before claiming color picker readiness.",
      why: "Color picker readiness starts with traceable widget structure and native color-input fallback evidence.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace value, defaultValue, valueAsString, format, alpha, setValue, setChannelValue, and setFormat behavior.",
      why: "Color pickers can diverge between displayed strings, internal color objects, formats, and alpha state.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasChannels) {
    riskQueue.push({
      priority: "medium",
      action: "Trace hue, saturation, brightness, alpha, hex, rgba, hsla, and hsba channels.",
      why: "Color editing correctness depends on channel-specific parsing, formatting, ranges, and conversion.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Trace open/close, area pointer, channel pointer, keyboard, page keys, Home/End, channel input, swatch click, eyedropper, and dismissable behavior.",
      why: "Color pickers combine pointer dragging, keyboard slider control, text input, popover dismissal, swatches, and optional eyedropper flows.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify dialog, slider, 2D slider, ARIA labels, value bounds, value text, expanded state, disabled/readOnly/invalid/required, and direction evidence.",
      why: "Color picker accessibility relies on dialog and slider metadata that expose channel state to assistive technology.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Trace hidden input, name, form-control tracking, reset, disabled fieldset, and required behavior.",
      why: "Color picker values usually submit through hidden inputs and must stay synchronized with forms.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, pointer, eyedropper, swatch, format, ARIA, and artifact tests.",
      why: "Static color picker evidence does not prove drag, channel conversion, text input, eyedropper, swatch, or format behavior.",
      relatedHref: "html/color-picker-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual color picker behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records color picker readiness only; it does not sample screen colors, drag thumbs, dispatch keyboard or pointer events, mutate color channels, invoke EyeDropper, submit forms, or run analyzed project tests.",
    relatedHref: "html/color-picker-readiness.html"
  });

  return {
    summary: `Color picker readiness report: setup ${colorPickerSetups.length} files, value signal ${valueSignals.length}, channel signal ${channelSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Color picker readiness Zag color-picker native color input area channel slider swatch eyedropper format form accessibility tests",
    colorPickerSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    channelSignals,
    interactionSignals,
    accessibilitySignals,
    formSignals,
    machineSignals,
    computedSignals,
    effectSignals,
    guardSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/color-picker|colorPicker\\.machine|colorPicker\\.connect|getAreaProps|getChannelSliderProps|getChannelInputProps\" package.json src app packages", purpose: "Find Zag color-picker machine, connect API, area, channel slider, and channel input props." },
      { command: "rg \"type=['\\\"]color|valueAsString|defaultFormat|setChannelValue|setAlpha|setFormat|EyeDropper\" src app packages", purpose: "Find native color inputs, value/format APIs, alpha handling, and eyedropper usage." },
      { command: "rg \"role=['\\\"]dialog|role=['\\\"]slider|aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|aria-expanded\" src app packages", purpose: "Find dialog and slider accessibility metadata." },
      { command: "rg \"ArrowLeft|ArrowRight|ArrowUp|ArrowDown|PageUp|PageDown|Home|End|pointer|swatch|format-select|color-picker-traces|upload-artifact\" src app packages test tests .github", purpose: "Check keyboard, pointer, swatch, format, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag color-picker, native color input, or a custom color editor.",
      "Trace root, label, control, trigger, content, area, channel slider, channel input, swatch, eyedropper, and format structure.",
      "Map value/defaultValue, valueAsString, format/defaultFormat, alpha, setValue, setChannelValue, setAlpha, and setFormat behavior.",
      "Check hue, saturation, brightness, alpha, hex, rgba, hsla, hsba, pointer, keyboard, dialog/slider ARIA, hidden input, form tracking, reset, and disabled fieldset evidence.",
      "This report is static readiness. Actual color sampling, thumb dragging, channel mutation, keyboard/pointer dispatch, EyeDropper, and project tests need trusted project QA."
    ]
  };
}

type ColorPickerReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function colorPickerReadinessSourceFiles(walk: WalkResult): Promise<ColorPickerReadinessSourceFile[]> {
  const files: ColorPickerReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !colorPickerReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!colorPickerReadinessPathSignal(file.relPath) && !colorPickerReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function colorPickerReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return colorPickerReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function colorPickerReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(color-picker|color_picker|colorpicker|color|swatch|palette|theme)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function colorPickerReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/color-picker|colorPicker\.machine|colorPicker\.connect|getAreaProps|getChannelSliderProps|getChannelInputProps|getSwatchTriggerProps|EyeDropper|type\s*=\s*["']color|aria-roledescription=["']2d slider|color-picker-traces)/i.test(text);
}

function colorPickerReadinessSetups(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["colorPickerSetups"] {
  const rows: ColorPickerReadinessReport["colorPickerSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(colorPicker\.machine|colorPicker\.connect|getRootProps|data-color-picker-root|color picker|type\s*=\s*["']color)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label\b|htmlFor|aria-label|aria-labelledby|Brand color|Accent color)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-state|data-invalid|data-readonly|data-disabled|\bcontrol\b)/gi);
    const triggerCount = countMatches(source.text, /(getTriggerProps|aria-expanded|aria-haspopup|TRIGGER\.CLICK|setOpen|openAutoFocus)/gi);
    const contentCount = countMatches(source.text, /(getContentProps|getPositionerProps|role\s*=\s*["']dialog|trackDismissableElement|INTERACT_OUTSIDE|data-state)/gi);
    const areaCount = countMatches(source.text, /(getAreaProps|getAreaBackgroundProps|areaBackground|getColorAreaGradient|xChannel|yChannel|saturation|brightness)/gi);
    const areaThumbCount = countMatches(source.text, /(getAreaThumbProps|aria-roledescription\s*=\s*["']2d slider|2d slider|AREA\.ARROW|focusAreaThumb)/gi);
    const channelSliderCount = countMatches(source.text, /(getChannelSliderProps|getChannelSliderTrackProps|getChannelSliderThumbProps|getChannelSliderLabelProps|getChannelSliderValueTextProps|CHANNEL_SLIDER|channel slider|getSliderBackground)/gi);
    const channelInputCount = countMatches(source.text, /(getChannelInputProps|CHANNEL_INPUT|channel input|onBeforeInput|valueAsNumber|type\s*=\s*["']color)/gi);
    const swatchCount = countMatches(source.text, /(getSwatchGroupProps|getSwatchTriggerProps|getSwatchTriggerState|getSwatchProps|getSwatchIndicatorProps|SWATCH_TRIGGER|swatch)/gi);
    const eyeDropperCount = countMatches(source.text, /(getEyeDropperTriggerProps|EyeDropper|EYEDROPPER|openEyeDropper|Pick a color from the screen|pick screen color)/gi);
    const formatCount = countMatches(source.text, /(getFormatSelectProps|getFormatTriggerProps|FORMAT\.SET|setFormat|defaultFormat|format-select|hsba|hsla|rgba)/gi);
    const valueCount = countMatches(source.text, /(value\s*[:=]|defaultValue|valueAsString|setValue|setChannelValue|setAlpha|getChannelValue|getChannelValueText|parseColor|normalizeColor|alpha)/gi);
    const interactionCount = countMatches(source.text, /(OPEN|CLOSE|TRIGGER\.CLICK|AREA\.POINTER|CHANNEL_SLIDER\.POINTER|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|PageUp|PageDown|Home|End|Enter|pointer|onPointer|user\.pointer|user\.keyboard|swatch|EyeDropper|trackDismissableElement)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']dialog|role\s*=\s*["']slider|aria-label|aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|aria-roledescription|aria-expanded|aria-disabled|aria-live|dir\s*[:=]|toHaveAttribute)/gi);
    const formCount = countMatches(source.text, /(name\s*[:=]|form|type\s*=\s*["']hidden|getHiddenInputProps|trackFormControl|onFormReset|fieldsetDisabled|required|disabled fieldset)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.keyboard|user\.pointer|getByRole|toHaveAttribute|color-picker-traces|upload-artifact|eyedropper-test|swatch-test|format-test)/gi);
    const total = rootCount + labelCount + controlCount + triggerCount + contentCount + areaCount + areaThumbCount + channelSliderCount + channelInputCount + swatchCount + eyeDropperCount + formatCount + valueCount + interactionCount + accessibilityCount + formCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && controlCount > 0 && valueCount > 0 && (areaCount > 0 || channelSliderCount > 0 || channelInputCount > 0) && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: colorPickerReadinessFramework(source),
      rootCount,
      labelCount,
      controlCount,
      triggerCount,
      contentCount,
      areaCount,
      areaThumbCount,
      channelSliderCount,
      channelInputCount,
      swatchCount,
      eyeDropperCount,
      formatCount,
      valueCount,
      interactionCount,
      accessibilityCount,
      formCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, control ${controlCount}, trigger ${triggerCount}, content ${contentCount}, area ${areaCount}, area thumb ${areaThumbCount}, channel slider ${channelSliderCount}, channel input ${channelInputCount}, swatch ${swatchCount}, eyedropper ${eyeDropperCount}, format ${formatCount}, value ${valueCount}, interaction ${interactionCount}, accessibility ${accessibilityCount}, form ${formCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.valueCount + b.channelSliderCount + b.channelInputCount + b.interactionCount - (a.valueCount + a.channelSliderCount + a.channelInputCount + a.interactionCount));
}

function colorPickerReadinessFramework(source: ColorPickerReadinessSourceFile): ColorPickerReadinessReport["colorPickerSetups"][number]["framework"] {
  if (/@zag-js\/color-picker|colorPicker\.machine|colorPicker\.connect|getAreaProps|getChannelSliderProps|getChannelInputProps/i.test(source.text)) return "zag-color-picker";
  if (/type\s*=\s*["']color|<input[^>]+type=["']color/i.test(source.text)) return "native-color-input";
  if (/color picker|swatch|palette|EyeDropper|hsba|hsla|rgba/i.test(source.text)) return "custom";
  return "unknown";
}

function colorPickerReadinessFrameworkSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-color-picker", pattern: /@zag-js\/color-picker|colorPicker\.machine|colorPicker\.connect|getAreaProps|getChannelSliderProps|getChannelInputProps/i, evidence: "Zag color-picker evidence was detected." },
    { signal: "native-color-input", pattern: /type\s*=\s*["']color|<input[^>]+type=["']color/i, evidence: "native color input evidence was detected." },
    { signal: "custom", pattern: /color picker|swatch|palette|EyeDropper|hsba|hsla|rgba/i, evidence: "custom color picker evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function colorPickerReadinessStructureSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-color-picker-root|colorPicker\.machine|type\s*=\s*["']color/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label\b|htmlFor|aria-label|aria-labelledby/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-invalid|data-readonly|data-disabled|\bcontrol\b/i, evidence: "control evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|aria-expanded|aria-haspopup|TRIGGER\.CLICK|setOpen/i, evidence: "trigger evidence was detected." },
    { signal: "content", pattern: /getContentProps|getPositionerProps|role\s*=\s*["']dialog|trackDismissableElement/i, evidence: "content evidence was detected." },
    { signal: "area", pattern: /getAreaProps|getAreaBackgroundProps|getColorAreaGradient|xChannel|yChannel/i, evidence: "area evidence was detected." },
    { signal: "area-thumb", pattern: /getAreaThumbProps|aria-roledescription\s*=\s*["']2d slider|2d slider|focusAreaThumb/i, evidence: "area thumb evidence was detected." },
    { signal: "channel-slider", pattern: /getChannelSliderProps|getChannelSliderTrackProps|getChannelSliderThumbProps|CHANNEL_SLIDER|getSliderBackground/i, evidence: "channel slider evidence was detected." },
    { signal: "channel-input", pattern: /getChannelInputProps|CHANNEL_INPUT|channel input|valueAsNumber/i, evidence: "channel input evidence was detected." },
    { signal: "swatch", pattern: /getSwatchGroupProps|getSwatchTriggerProps|getSwatchTriggerState|getSwatchProps|getSwatchIndicatorProps|swatch/i, evidence: "swatch evidence was detected." },
    { signal: "eyedropper", pattern: /getEyeDropperTriggerProps|EyeDropper|EYEDROPPER|openEyeDropper/i, evidence: "eyedropper evidence was detected." },
    { signal: "format-select", pattern: /getFormatSelectProps|getFormatTriggerProps|FORMAT\.SET|setFormat|format-select/i, evidence: "format select evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function colorPickerReadinessValueSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["valueSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|value:\s*|api\.value|onValueChange/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default value/i, evidence: "default value evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|toString\(/i, evidence: "valueAsString evidence was detected." },
    { signal: "format", pattern: /\bformat\b|defaultFormat|ColorFormat|format-select/i, evidence: "format evidence was detected." },
    { signal: "alpha", pattern: /\balpha\b|setAlpha|withChannelValue\(["']alpha/i, evidence: "alpha evidence was detected." },
    { signal: "set-value", pattern: /setValue|VALUE\.SET/i, evidence: "set value evidence was detected." },
    { signal: "set-channel-value", pattern: /setChannelValue|withChannelValue|getChannelValue/i, evidence: "set channel value evidence was detected." },
    { signal: "set-format", pattern: /setFormat|FORMAT\.SET|onFormatChange/i, evidence: "set format evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function colorPickerReadinessChannelSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["channelSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["channelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hue", pattern: /\bhue\b|channel:\s*["']hue/i, evidence: "hue evidence was detected." },
    { signal: "saturation", pattern: /\bsaturation\b|xChannel:\s*["']saturation/i, evidence: "saturation evidence was detected." },
    { signal: "brightness", pattern: /\bbrightness\b|yChannel:\s*["']brightness/i, evidence: "brightness evidence was detected." },
    { signal: "alpha", pattern: /\balpha\b|channel:\s*["']alpha/i, evidence: "alpha channel evidence was detected." },
    { signal: "hex", pattern: /\bhex\b|channel:\s*["']hex|#[0-9a-f]{3,8}/i, evidence: "hex evidence was detected." },
    { signal: "rgba", pattern: /\brgba\b|rgba\(/i, evidence: "rgba evidence was detected." },
    { signal: "hsla", pattern: /\bhsla\b|hsla\(/i, evidence: "hsla evidence was detected." },
    { signal: "hsba", pattern: /\bhsba\b/i, evidence: "hsba evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "channel", "signal");
}

function colorPickerReadinessInteractionSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-close", pattern: /\bOPEN\b|\bCLOSE\b|setOpen|TRIGGER\.CLICK|CONTROLLED\.OPEN|CONTROLLED\.CLOSE/i, evidence: "open/close evidence was detected." },
    { signal: "area-pointer", pattern: /AREA\.POINTER|onPointerDown|getEventPoint|trackPointerMove|focusAreaThumb/i, evidence: "area pointer evidence was detected." },
    { signal: "channel-pointer", pattern: /CHANNEL_SLIDER\.POINTER|getChannelSliderProps|focusChannelThumb/i, evidence: "channel pointer evidence was detected." },
    { signal: "keyboard", pattern: /ArrowLeft|ArrowRight|ArrowUp|ArrowDown|getEventKey|user\.keyboard/i, evidence: "keyboard evidence was detected." },
    { signal: "page-keys", pattern: /PageUp|PageDown|PAGE_UP|PAGE_DOWN/i, evidence: "page key evidence was detected." },
    { signal: "home-end", pattern: /\bHome\b|\bEnd\b|\bHOME\b|\bEND\b|setChannelToMin|setChannelToMax/i, evidence: "Home/End evidence was detected." },
    { signal: "channel-input", pattern: /CHANNEL_INPUT|getChannelInputProps|onBeforeInput|onBlur|onKeyDown|valueAsNumber/i, evidence: "channel input evidence was detected." },
    { signal: "swatch-click", pattern: /SWATCH_TRIGGER\.CLICK|getSwatchTriggerProps|swatch-test/i, evidence: "swatch click evidence was detected." },
    { signal: "eyedropper", pattern: /EYEDROPPER\.CLICK|EyeDropper|openEyeDropper|eyedropper-test/i, evidence: "eyedropper evidence was detected." },
    { signal: "dismissable", pattern: /trackDismissableElement|INTERACT_OUTSIDE|onInteractOutside|onPointerDownOutside|onFocusOutside/i, evidence: "dismissable evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function colorPickerReadinessAccessibilitySignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dialog", pattern: /role\s*=\s*["']dialog|role:\s*["']dialog|aria-haspopup/i, evidence: "dialog evidence was detected." },
    { signal: "slider", pattern: /role\s*=\s*["']slider|role:\s*["']slider/i, evidence: "slider evidence was detected." },
    { signal: "2d-slider", pattern: /aria-roledescription\s*=\s*["']2d slider|2d slider/i, evidence: "2D slider evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby/i, evidence: "ARIA label evidence was detected." },
    { signal: "aria-valuemin-max", pattern: /aria-valuemin|aria-valuemax/i, evidence: "ARIA value bounds evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "ARIA current value evidence was detected." },
    { signal: "aria-valuetext", pattern: /aria-valuetext/i, evidence: "ARIA value text evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "ARIA expanded evidence was detected." },
    { signal: "disabled-readonly-invalid-required", pattern: /disabled|readOnly|readonly|invalid|required|data-disabled|data-readonly|data-invalid|data-required/i, evidence: "disabled/readOnly/invalid/required evidence was detected." },
    { signal: "dir", pattern: /dir\s*[:=]|rtl|ltr|getEventKey/i, evidence: "direction evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function colorPickerReadinessFormSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["formSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /\bname\b|name\s*[:=]/i, evidence: "name evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|type\s*=\s*["']hidden|hidden input|visuallyHiddenStyle/i, evidence: "hidden input evidence was detected." },
    { signal: "track-form-control", pattern: /trackFormControl|track form control|dispatchInputValueEvent/i, evidence: "form-control tracking evidence was detected." },
    { signal: "reset", pattern: /onFormReset|reset|form\.reset/i, evidence: "reset evidence was detected." },
    { signal: "fieldset-disabled", pattern: /fieldsetDisabled|fieldset disabled|onFieldsetDisabledChange/i, evidence: "fieldset-disabled evidence was detected." },
    { signal: "required", pattern: /required|data-required/i, evidence: "required evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function colorPickerReadinessZagUsagePattern(sourceFiles: ColorPickerReadinessSourceFile[]): string {
  const hasZagColorPickerUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/color-picker|colorPicker\.machine|colorPicker\.connect|getAreaProps|getChannelSliderProps|getChannelInputProps|getSwatchTriggerProps|getFormatSelectProps|getEyeDropperTriggerProps/i.test(source.text));
  return hasZagColorPickerUsage ? "colorPicker\\.machine|colorPicker\\.connect|getAreaProps|getChannelSliderProps|getChannelInputProps|getSwatchTriggerProps|getFormatSelectProps|getEyeDropperTriggerProps" : "(?!)";
}

function colorPickerReadinessMachineSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["machineSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagColorPicker}|createMachine|colorPicker\\.machine`, "i"), evidence: "Zag createMachine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagColorPicker}|initialState\\([\\s\\S]{0,120}idle|state:\\s*["']idle["']|\\bidle\\b`, "i"), evidence: "idle state evidence was detected." },
    { signal: "focused-state", pattern: new RegExp(`${zagColorPicker}|state:\\s*["']focused["']|color-picker-focused|\\bfocused\\b`, "i"), evidence: "focused state evidence was detected." },
    { signal: "open-state", pattern: new RegExp(`${zagColorPicker}|state:\\s*["']open["']|open\\.idle|tags:\\s*\\[["']open`, "i"), evidence: "open state evidence was detected." },
    { signal: "dragging-state", pattern: new RegExp(`${zagColorPicker}|open\\.dragging|\\bdragging\\b|AREA\\.POINTER_MOVE|CHANNEL_SLIDER\\.POINTER_MOVE`, "i"), evidence: "dragging state evidence was detected." },
    { signal: "value-set-event", pattern: new RegExp(`${zagColorPicker}|VALUE\\.SET|setValue`, "i"), evidence: "VALUE.SET event evidence was detected." },
    { signal: "format-set-event", pattern: new RegExp(`${zagColorPicker}|FORMAT\\.SET|setFormat`, "i"), evidence: "FORMAT.SET event evidence was detected." },
    { signal: "channel-input-events", pattern: new RegExp(`${zagColorPicker}|CHANNEL_INPUT\\.CHANGE|CHANNEL_INPUT\\.FOCUS|CHANNEL_INPUT\\.BLUR|getChannelInputProps`, "i"), evidence: "channel input event evidence was detected." },
    { signal: "eyedropper-event", pattern: new RegExp(`${zagColorPicker}|EYEDROPPER\\.CLICK|openEyeDropper|EyeDropper`, "i"), evidence: "eyedropper event evidence was detected." },
    { signal: "swatch-trigger-event", pattern: new RegExp(`${zagColorPicker}|SWATCH_TRIGGER\\.CLICK|getSwatchTriggerProps`, "i"), evidence: "swatch trigger event evidence was detected." },
    { signal: "trigger-events", pattern: new RegExp(`${zagColorPicker}|TRIGGER\\.CLICK|TRIGGER\\.BLUR|CONTROLLED\\.OPEN|CONTROLLED\\.CLOSE|getTriggerProps`, "i"), evidence: "trigger/open event evidence was detected." },
    { signal: "area-pointer-events", pattern: new RegExp(`${zagColorPicker}|AREA\\.POINTER_DOWN|AREA\\.POINTER_MOVE|AREA\\.POINTER_UP|AREA\\.ARROW|AREA\\.PAGE|getAreaProps`, "i"), evidence: "area pointer event evidence was detected." },
    { signal: "channel-slider-events", pattern: new RegExp(`${zagColorPicker}|CHANNEL_SLIDER\\.POINTER|CHANNEL_SLIDER\\.ARROW|CHANNEL_SLIDER\\.PAGE|CHANNEL_SLIDER\\.HOME|CHANNEL_SLIDER\\.END|getChannelSliderProps`, "i"), evidence: "channel slider event evidence was detected." },
    { signal: "controlled-open-close-events", pattern: new RegExp(`${zagColorPicker}|CONTROLLED\\.OPEN|CONTROLLED\\.CLOSE|INTERACT_OUTSIDE|OPEN|CLOSE`, "i"), evidence: "controlled open/close event evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function colorPickerReadinessComputedSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["computedSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "disabled", pattern: new RegExp(`${zagColorPicker}|computed:[\\s\\S]{0,160}disabled|fieldsetDisabled`, "i"), evidence: "disabled computed evidence was detected." },
    { signal: "rtl", pattern: new RegExp(`${zagColorPicker}|rtl:|prop\\(["']dir["']\\) === ["']rtl["']|\\brtl\\b`, "i"), evidence: "RTL computed evidence was detected." },
    { signal: "interactive", pattern: new RegExp(`${zagColorPicker}|interactive:|readOnly|disabled`, "i"), evidence: "interactive computed evidence was detected." },
    { signal: "value-as-string", pattern: new RegExp(`${zagColorPicker}|valueAsString|toString\\(context\\.get\\(["']format["']\\)\\)`, "i"), evidence: "valueAsString computed evidence was detected." },
    { signal: "area-value", pattern: new RegExp(`${zagColorPicker}|areaValue|toFormat\\(["']hsba["']\\)|toFormat\\(["']hsla["']\\)`, "i"), evidence: "areaValue computed evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function colorPickerReadinessEffectSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["effectSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-form-control", pattern: new RegExp(`${zagColorPicker}|trackFormControl|onFieldsetDisabledChange|onFormReset`, "i"), evidence: "trackFormControl effect evidence was detected." },
    { signal: "track-positioning", pattern: new RegExp(`${zagColorPicker}|trackPositioning|getPlacement|currentPlacement`, "i"), evidence: "positioning effect evidence was detected." },
    { signal: "dismissable-element", pattern: new RegExp(`${zagColorPicker}|trackDismissableElement|onInteractOutside|onPointerDownOutside|onFocusOutside`, "i"), evidence: "dismissable element effect evidence was detected." },
    { signal: "pointer-move", pattern: new RegExp(`${zagColorPicker}|trackPointerMove|AREA\\.POINTER_MOVE|CHANNEL_SLIDER\\.POINTER_MOVE`, "i"), evidence: "pointer move effect evidence was detected." },
    { signal: "text-selection", pattern: new RegExp(`${zagColorPicker}|disableTextSelection|disable text selection`, "i"), evidence: "text selection effect evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function colorPickerReadinessGuardSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["guardSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "close-on-select", pattern: new RegExp(`${zagColorPicker}|closeOnSelect|prop\\(["']closeOnSelect["']\\)`, "i"), evidence: "closeOnSelect guard evidence was detected." },
    { signal: "open-controlled", pattern: new RegExp(`${zagColorPicker}|isOpenControlled|prop\\(["']open["']\\) != null|prop\\(["']inline["']\\)`, "i"), evidence: "open controlled guard evidence was detected." },
    { signal: "restore-focus", pattern: new RegExp(`${zagColorPicker}|shouldRestoreFocus|restoreFocus`, "i"), evidence: "restore focus guard evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function colorPickerReadinessActionSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["actionSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-eyedropper", pattern: new RegExp(`${zagColorPicker}|openEyeDropper|EyeDropper|sRGBHex`, "i"), evidence: "openEyeDropper action evidence was detected." },
    { signal: "active-channel", pattern: new RegExp(`${zagColorPicker}|setActiveChannel|activeChannel|activeOrientation`, "i"), evidence: "active channel action evidence was detected." },
    { signal: "clear-active-channel", pattern: new RegExp(`${zagColorPicker}|clearActiveChannel|activeId[\\s\\S]{0,80}null`, "i"), evidence: "clear active channel action evidence was detected." },
    { signal: "area-color-from-point", pattern: new RegExp(`${zagColorPicker}|setAreaColorFromPoint|getAreaValueFromPoint|xChannel|yChannel`, "i"), evidence: "area color from point action evidence was detected." },
    { signal: "channel-color-from-point", pattern: new RegExp(`${zagColorPicker}|setChannelColorFromPoint|getChannelSliderValueFromPoint`, "i"), evidence: "channel color from point action evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagColorPicker}|setValue\\(|VALUE\\.SET`, "i"), evidence: "setValue action evidence was detected." },
    { signal: "set-format", pattern: new RegExp(`${zagColorPicker}|setFormat|FORMAT\\.SET`, "i"), evidence: "setFormat action evidence was detected." },
    { signal: "dispatch-change-event", pattern: new RegExp(`${zagColorPicker}|dispatchChangeEvent|dispatchInputValueEvent`, "i"), evidence: "dispatch change event evidence was detected." },
    { signal: "sync-inputs", pattern: new RegExp(`${zagColorPicker}|syncInputElements|syncChannelInputs|setElementValue`, "i"), evidence: "sync inputs evidence was detected." },
    { signal: "change-end-callback", pattern: new RegExp(`${zagColorPicker}|invokeOnChangeEnd|onValueChangeEnd`, "i"), evidence: "change-end callback evidence was detected." },
    { signal: "channel-color-from-input", pattern: new RegExp(`${zagColorPicker}|setChannelColorFromInput|valueAsNumber|prefixHex|tryCatch`, "i"), evidence: "channel color from input evidence was detected." },
    { signal: "increment-decrement-channel", pattern: new RegExp(`${zagColorPicker}|incrementChannel|decrementChannel`, "i"), evidence: "increment/decrement channel evidence was detected." },
    { signal: "area-channel-increment", pattern: new RegExp(`${zagColorPicker}|incrementAreaXChannel|decrementAreaXChannel|incrementAreaYChannel|decrementAreaYChannel`, "i"), evidence: "area channel increment evidence was detected." },
    { signal: "channel-min-max", pattern: new RegExp(`${zagColorPicker}|setChannelToMax|setChannelToMin|getChannelRange`, "i"), evidence: "channel min/max evidence was detected." },
    { signal: "focus-thumbs", pattern: new RegExp(`${zagColorPicker}|focusAreaThumb|focusChannelThumb`, "i"), evidence: "thumb focus evidence was detected." },
    { signal: "initial-focus", pattern: new RegExp(`${zagColorPicker}|setInitialFocus|getInitialFocus|openAutoFocus`, "i"), evidence: "initial focus evidence was detected." },
    { signal: "return-focus", pattern: new RegExp(`${zagColorPicker}|setReturnFocus|getTriggerEl\\(scope\\)\\?\\.focus`, "i"), evidence: "return focus evidence was detected." },
    { signal: "sync-format-select", pattern: new RegExp(`${zagColorPicker}|syncFormatSelectElement|syncFormatSelect|getFormatSelectEl`, "i"), evidence: "sync format select evidence was detected." },
    { signal: "sync-value-with-format", pattern: new RegExp(`${zagColorPicker}|syncValueWithFormat|toFormat\\(context\\.get\\(["']format["']\\)\\)`, "i"), evidence: "sync value with format evidence was detected." },
    { signal: "open-close-callback", pattern: new RegExp(`${zagColorPicker}|invokeOnOpen|invokeOnClose|onOpenChange`, "i"), evidence: "open/close callback evidence was detected." },
    { signal: "toggle-visibility", pattern: new RegExp(`${zagColorPicker}|toggleVisibility|CONTROLLED\\.OPEN|CONTROLLED\\.CLOSE`, "i"), evidence: "toggle visibility evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function colorPickerReadinessDomSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["domSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagColorPicker}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "label-id", pattern: new RegExp(`${zagColorPicker}|getLabelId|ids\\?\\.label|getLabelProps`, "i"), evidence: "label id evidence was detected." },
    { signal: "hidden-input-id", pattern: new RegExp(`${zagColorPicker}|getHiddenInputId|ids\\?\\.hiddenInput|getHiddenInputProps`, "i"), evidence: "hidden input id evidence was detected." },
    { signal: "control-id", pattern: new RegExp(`${zagColorPicker}|getControlId|ids\\?\\.control|getControlProps`, "i"), evidence: "control id evidence was detected." },
    { signal: "trigger-id", pattern: new RegExp(`${zagColorPicker}|getTriggerId|ids\\?\\.trigger|getTriggerProps`, "i"), evidence: "trigger id evidence was detected." },
    { signal: "content-id", pattern: new RegExp(`${zagColorPicker}|getContentId|ids\\?\\.content|getContentProps`, "i"), evidence: "content id evidence was detected." },
    { signal: "positioner-id", pattern: new RegExp(`${zagColorPicker}|getPositionerId|ids\\?\\.positioner|getPositionerProps`, "i"), evidence: "positioner id evidence was detected." },
    { signal: "format-select-id", pattern: new RegExp(`${zagColorPicker}|getFormatSelectId|ids\\?\\.formatSelect|getFormatSelectProps`, "i"), evidence: "format select id evidence was detected." },
    { signal: "area-id", pattern: new RegExp(`${zagColorPicker}|getAreaId|ids\\?\\.area|getAreaProps`, "i"), evidence: "area id evidence was detected." },
    { signal: "area-gradient-id", pattern: new RegExp(`${zagColorPicker}|getAreaGradientId|ids\\?\\.areaGradient|getAreaBackgroundProps`, "i"), evidence: "area gradient id evidence was detected." },
    { signal: "area-thumb-id", pattern: new RegExp(`${zagColorPicker}|getAreaThumbId|ids\\?\\.areaThumb|getAreaThumbProps`, "i"), evidence: "area thumb id evidence was detected." },
    { signal: "channel-slider-ids", pattern: new RegExp(`${zagColorPicker}|getChannelSliderTrackId|getChannelSliderThumbId|ids\\?\\.channelSlider`, "i"), evidence: "channel slider id evidence was detected." },
    { signal: "content-el", pattern: new RegExp(`${zagColorPicker}|getContentEl|getById\\(getContentId`, "i"), evidence: "content element evidence was detected." },
    { signal: "area-thumb-el", pattern: new RegExp(`${zagColorPicker}|getAreaThumbEl|getById\\(getAreaThumbId`, "i"), evidence: "area thumb element evidence was detected." },
    { signal: "channel-input-els", pattern: new RegExp(`${zagColorPicker}|getChannelInputEl|getChannelInputEls|input\\[data-channel\\]`, "i"), evidence: "channel input element evidence was detected." },
    { signal: "format-select-el", pattern: new RegExp(`${zagColorPicker}|getFormatSelectEl|HTMLSelectElement`, "i"), evidence: "format select element evidence was detected." },
    { signal: "hidden-input-el", pattern: new RegExp(`${zagColorPicker}|getHiddenInputEl|HTMLInputElement`, "i"), evidence: "hidden input element evidence was detected." },
    { signal: "area-point", pattern: new RegExp(`${zagColorPicker}|getAreaValueFromPoint|getRelativePoint\\(point, areaEl\\)|orientation: ["']vertical["']`, "i"), evidence: "area point evidence was detected." },
    { signal: "slider-point", pattern: new RegExp(`${zagColorPicker}|getChannelSliderValueFromPoint|getChannelSliderTrackEl`, "i"), evidence: "slider point evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function colorPickerReadinessApiSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["apiSignals"] {
  const zagColorPicker = colorPickerReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: ColorPickerReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dragging", pattern: new RegExp(`${zagColorPicker}|api\\.dragging|dragging,`, "i"), evidence: "dragging API evidence was detected." },
    { signal: "open", pattern: new RegExp(`${zagColorPicker}|api\\.open|open,`, "i"), evidence: "open API evidence was detected." },
    { signal: "inline", pattern: new RegExp(`${zagColorPicker}|api\\.inline|inline: !!prop`, "i"), evidence: "inline API evidence was detected." },
    { signal: "value", pattern: new RegExp(`${zagColorPicker}|api\\.value|\\bvalue,`, "i"), evidence: "value API evidence was detected." },
    { signal: "value-as-string", pattern: new RegExp(`${zagColorPicker}|api\\.valueAsString|valueAsString`, "i"), evidence: "valueAsString API evidence was detected." },
    { signal: "set-open", pattern: new RegExp(`${zagColorPicker}|api\\.setOpen|setOpen\\(nextOpen\\)|OPEN|CLOSE`, "i"), evidence: "setOpen API evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagColorPicker}|api\\.setValue|setValue\\(value\\)|VALUE\\.SET`, "i"), evidence: "setValue API evidence was detected." },
    { signal: "channel-value", pattern: new RegExp(`${zagColorPicker}|api\\.getChannelValue|getChannelValue\\(channel\\)`, "i"), evidence: "getChannelValue API evidence was detected." },
    { signal: "channel-value-text", pattern: new RegExp(`${zagColorPicker}|api\\.getChannelValueText|formatChannelValue`, "i"), evidence: "getChannelValueText API evidence was detected." },
    { signal: "set-channel-value", pattern: new RegExp(`${zagColorPicker}|api\\.setChannelValue|withChannelValue`, "i"), evidence: "setChannelValue API evidence was detected." },
    { signal: "format", pattern: new RegExp(`${zagColorPicker}|api\\.format|format: context\\.get\\(["']format["']\\)`, "i"), evidence: "format API evidence was detected." },
    { signal: "set-format", pattern: new RegExp(`${zagColorPicker}|api\\.setFormat|setFormat\\(format\\)|set-format`, "i"), evidence: "setFormat API evidence was detected." },
    { signal: "alpha", pattern: new RegExp(`${zagColorPicker}|api\\.alpha|getChannelValue\\(["']alpha["']\\)`, "i"), evidence: "alpha API evidence was detected." },
    { signal: "set-alpha", pattern: new RegExp(`${zagColorPicker}|api\\.setAlpha|setAlpha\\(alphaValue\\)`, "i"), evidence: "setAlpha API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagColorPicker}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "trigger-props", pattern: new RegExp(`${zagColorPicker}|getTriggerProps`, "i"), evidence: "trigger props API evidence was detected." },
    { signal: "content-props", pattern: new RegExp(`${zagColorPicker}|getContentProps|getPositionerProps`, "i"), evidence: "content props API evidence was detected." },
    { signal: "area-props", pattern: new RegExp(`${zagColorPicker}|getAreaProps|getAreaBackgroundProps|getAreaThumbProps`, "i"), evidence: "area props API evidence was detected." },
    { signal: "channel-props", pattern: new RegExp(`${zagColorPicker}|getChannelSliderProps|getChannelSliderTrackProps|getChannelSliderThumbProps|getChannelInputProps`, "i"), evidence: "channel props API evidence was detected." },
    { signal: "hidden-input-props", pattern: new RegExp(`${zagColorPicker}|getHiddenInputProps`, "i"), evidence: "hidden input props API evidence was detected." },
    { signal: "eyedropper-props", pattern: new RegExp(`${zagColorPicker}|getEyeDropperTriggerProps`, "i"), evidence: "eyedropper props API evidence was detected." },
    { signal: "swatch-props", pattern: new RegExp(`${zagColorPicker}|getSwatchGroupProps|getSwatchTriggerProps|getSwatchProps|getSwatchIndicatorProps`, "i"), evidence: "swatch props API evidence was detected." },
    { signal: "format-props", pattern: new RegExp(`${zagColorPicker}|getFormatSelectProps|getFormatTriggerProps`, "i"), evidence: "format props API evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function colorPickerReadinessTestSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["testSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|ArrowLeft|ArrowRight|PageUp|PageDown|Home|End|keyboard-test/i, evidence: "keyboard test evidence was detected." },
    { signal: "pointer-test", pattern: /user\.pointer|pointer-test|onPointer/i, evidence: "pointer test evidence was detected." },
    { signal: "eyedropper-test", pattern: /eyedropper-test|EyeDropper|pick screen color/i, evidence: "eyedropper test evidence was detected." },
    { signal: "swatch-test", pattern: /swatch-test|getSwatchTriggerProps|SWATCH_TRIGGER/i, evidence: "swatch test evidence was detected." },
    { signal: "format-test", pattern: /format-test|getFormatSelectProps|getFormatTriggerProps|setFormat/i, evidence: "format test evidence was detected." },
    { signal: "aria-test", pattern: /aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|aria-expanded|toHaveAttribute|getByRole/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|color-picker-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function colorPickerReadinessPackageSignals(sourceFiles: ColorPickerReadinessSourceFile[]): ColorPickerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ColorPickerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/color-picker", pattern: /@zag-js\/color-picker/i, evidence: "@zag-js/color-picker dependency evidence was detected." },
    { signal: "@zag-js/color-utils", pattern: /@zag-js\/color-utils|parseColor|normalizeColor/i, evidence: "@zag-js/color-utils evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|createGuards|ColorPickerSchema|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|getEventKey|getEventPoint|getEventStep|trackFormControl|trackPointerMove|disableTextSelection|dispatchInputValueEvent/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable|trackDismissableElement|InteractOutsideHandlers/i, evidence: "@zag-js/dismissable evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper|getPlacement|getPlacementStyles|PositioningOptions/i, evidence: "@zag-js/popper evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty|EventKeyMap|Orientation/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|tryCatch|createSplitProps|createProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return colorPickerReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function colorPickerReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ColorPickerReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/color-picker-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSplitterReadinessReport(walk: WalkResult): Promise<SplitterReadinessReport> {
  const sourceFiles = await splitterReadinessSourceFiles(walk);
  const splitterSetups = splitterReadinessSetups(sourceFiles);
  const frameworkSignals = splitterReadinessFrameworkSignals(sourceFiles);
  const structureSignals = splitterReadinessStructureSignals(sourceFiles);
  const sizeSignals = splitterReadinessSizeSignals(sourceFiles);
  const collapseSignals = splitterReadinessCollapseSignals(sourceFiles);
  const interactionSignals = splitterReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = splitterReadinessAccessibilitySignals(sourceFiles);
  const registrySignals = splitterReadinessRegistrySignals(sourceFiles);
  const machineSignals = splitterReadinessMachineSignals(sourceFiles);
  const computedSignals = splitterReadinessComputedSignals(sourceFiles);
  const effectSignals = splitterReadinessEffectSignals(sourceFiles);
  const guardSignals = splitterReadinessGuardSignals(sourceFiles);
  const actionSignals = splitterReadinessActionSignals(sourceFiles);
  const domSignals = splitterReadinessDomSignals(sourceFiles);
  const utilitySignals = splitterReadinessUtilitySignals(sourceFiles);
  const apiSignals = splitterReadinessApiSignals(sourceFiles);
  const testSignals = splitterReadinessTestSignals(sourceFiles);
  const packageSignals = splitterReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || splitterSetups.some((item) => item.panelCount > 0 && item.handleCount > 0);
  const hasSize = sizeSignals.some((item) => item.readiness === "ready") || splitterSetups.some((item) => item.sizeCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || splitterSetups.some((item) => item.keyboardCount > 0 || item.pointerCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || splitterSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || splitterSetups.some((item) => item.testCount > 0);

  const riskQueue: SplitterReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document splitter root, panels, resize triggers, indicators, item order, and layout before claiming splitter readiness.",
      why: "Splitter readiness starts with traceable panel and separator structure.",
      relatedHref: "html/splitter-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasSize) {
    riskQueue.push({
      priority: "high",
      action: "Trace size/defaultSize, setSizes/resetSizes/getSizes, panel size, min/max, and validation behavior.",
      why: "Panel resize correctness depends on constrained size resolution and validation.",
      relatedHref: "html/splitter-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasSize) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Trace pointer down/move/up, keyboard move, Enter, Home/End, F6 focus cycle, and focus/blur behavior.",
      why: "Splitters need both pointer and keyboard resize paths to be operable.",
      relatedHref: "html/splitter-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasSize) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify separator role, aria-valuenow/min/max, aria-controls, aria-orientation, data-orientation, and dir evidence.",
      why: "Assistive technology relies on separator metadata to announce resize position and controlled panels.",
      relatedHref: "html/splitter-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasSize) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, pointer, ARIA, collapse, and artifact tests.",
      why: "Static splitter evidence does not prove resize, collapse, focus cycle, or separator ARIA behavior.",
      relatedHref: "html/splitter-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual splitter behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records splitter readiness only; it does not resize panels, drag separators, dispatch keyboard or pointer events, mutate panel sizes, collapse panels, observe layout, or run analyzed project tests.",
    relatedHref: "html/splitter-readiness.html"
  });

  return {
    summary: `Splitter readiness report: setup ${splitterSetups.length} files, size signal ${sizeSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`,
    sourcePattern: "Splitter readiness Zag splitter panel resize trigger separator size collapse keyboard pointer orientation bounds accessibility tests",
    splitterSetups,
    frameworkSignals,
    structureSignals,
    sizeSignals,
    collapseSignals,
    interactionSignals,
    accessibilitySignals,
    registrySignals,
    machineSignals,
    computedSignals,
    effectSignals,
    guardSignals,
    actionSignals,
    domSignals,
    utilitySignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/splitter|splitter\\.machine|splitter\\.connect|getResizeTriggerProps|getPanelProps\" package.json src app packages", purpose: "Find Zag splitter machine, connect API, panel props, and resize trigger props." },
      { command: "rg \"role=['\\\"]separator|aria-valuenow|aria-valuemin|aria-valuemax|aria-controls|aria-orientation|data-orientation\" src app packages", purpose: "Find native separator accessibility and orientation evidence." },
      { command: "rg \"setSizes|resetSizes|collapsePanel|expandPanel|resizePanel|minSize|maxSize|collapsedSize|keyboardResizeBy\" src app packages", purpose: "Check size APIs, constraints, collapse/expand, and keyboard resize settings." },
      { command: "rg \"ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|F6|pointer|splitter-traces|upload-artifact\" src app packages test tests .github", purpose: "Check keyboard, pointer, focus cycle, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag splitter, native separator markup, or a custom resize handle.",
      "Trace root, panel, resize trigger, indicator, items, and layout structure before reviewing size state.",
      "Map size/defaultSize, setSizes, resetSizes, getSizes, getPanelSize, min/max, validation, collapse/expand, and panel resize behavior.",
      "Check pointer, keyboard, Enter, Home/End, F6, focus/blur, registry, root resize, global cursor, separator ARIA, orientation, and controlled panels evidence.",
      "This report is static readiness. Actual resize, drag, keyboard dispatch, collapse, layout observation, and project tests need trusted project QA."
    ]
  };
}

type SplitterReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function splitterReadinessSourceFiles(walk: WalkResult): Promise<SplitterReadinessSourceFile[]> {
  const files: SplitterReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !splitterReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!splitterReadinessPathSignal(file.relPath) && !splitterReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function splitterReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return splitterReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function splitterReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(splitter|split|resizable|resize|panel|pane|separator)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function splitterReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/splitter|splitter\.machine|splitter\.connect|getResizeTriggerProps|getPanelProps|role\s*=\s*["']separator|aria-valuenow|splitter-traces)/i.test(text);
}

function splitterReadinessSetups(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["splitterSetups"] {
  const rows: SplitterReadinessReport["splitterSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(splitter\.machine|splitter\.connect|getRootProps|data-splitter-root|splitter root)/gi);
    const panelCount = countMatches(source.text, /(getPanelProps|getPanels|getPanelById|getPanelSize|data-panel-id|<section\b|PanelData|\bpanels\b)/gi);
    const handleCount = countMatches(source.text, /(getResizeTriggerProps|getResizeTriggerState|getResizeTriggerIndicator|resizeTrigger|role\s*=\s*["']separator|data-resize-trigger|handle)/gi);
    const sizeCount = countMatches(source.text, /(size\s*[:=]|defaultSize|setSizes|resetSizes|getSizes|getPanelSize|resolvePanelSizes|validateSizes|resizeByDelta)/gi);
    const collapseCount = countMatches(source.text, /(collapsible|collapsedSize|collapsePanel|expandPanel|isPanelCollapsed|isPanelExpanded|onCollapse|onExpand|collapse-test)/gi);
    const keyboardCount = countMatches(source.text, /(KEYBOARD_MOVE|keyboardResizeBy|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Enter|F6|getEventKey|user\.keyboard)/gi);
    const pointerCount = countMatches(source.text, /(POINTER_DOWN|POINTER_MOVE|POINTER_UP|pointerdown|pointermove|pointerup|trackPointerMove|getEventPoint|user\.pointer|setPointerCapture)/gi);
    const orientationCount = countMatches(source.text, /(orientation|horizontal|vertical|aria-orientation|data-orientation|row-resize|col-resize)/gi);
    const boundsCount = countMatches(source.text, /(minSize|maxSize|aria-valuemin|aria-valuemax|valueMin|valueMax|validateSizes|collapsedSize)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']separator|aria-valuenow|aria-valuemin|aria-valuemax|aria-controls|aria-orientation|tabIndex|data-orientation|dir\s*[:=]|toHaveAttribute)/gi);
    const registryCount = countMatches(source.text, /(registry|register|trackRootResize|resizeObserverBorderBox|setupGlobalCursor|removeGlobalCursor|preserveFixedPanelSizes|observeChildren)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.keyboard|user\.pointer|getByRole|getAllByRole|toHaveAttribute|splitter-traces|upload-artifact|collapse-test)/gi);
    const total = rootCount + panelCount + handleCount + sizeCount + collapseCount + keyboardCount + pointerCount + orientationCount + boundsCount + accessibilityCount + registryCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && panelCount > 0 && handleCount > 0 && sizeCount > 0 && (keyboardCount > 0 || pointerCount > 0) && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: splitterReadinessFramework(source),
      rootCount,
      panelCount,
      handleCount,
      sizeCount,
      collapseCount,
      keyboardCount,
      pointerCount,
      orientationCount,
      boundsCount,
      accessibilityCount,
      registryCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, panel ${panelCount}, handle ${handleCount}, size ${sizeCount}, collapse ${collapseCount}, keyboard ${keyboardCount}, pointer ${pointerCount}, orientation ${orientationCount}, bounds ${boundsCount}, accessibility ${accessibilityCount}, registry ${registryCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.panelCount + b.handleCount + b.sizeCount + b.accessibilityCount - (a.panelCount + a.handleCount + a.sizeCount + a.accessibilityCount));
}

function splitterReadinessFramework(source: SplitterReadinessSourceFile): SplitterReadinessReport["splitterSetups"][number]["framework"] {
  if (/@zag-js\/splitter|splitter\.machine|splitter\.connect|getResizeTriggerProps|getPanelProps/i.test(source.text)) return "zag-splitter";
  if (/role\s*=\s*["']separator|aria-valuenow|data-resize-trigger/i.test(source.text)) return "native-resize-handle";
  if (/splitter|resizable|resize handle|panel resize|pane/i.test(source.text)) return "custom";
  return "unknown";
}

function splitterReadinessFrameworkSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-splitter", pattern: /@zag-js\/splitter|splitter\.machine|splitter\.connect|getResizeTriggerProps|getPanelProps/i, evidence: "Zag splitter evidence was detected." },
    { signal: "native-resize-handle", pattern: /role\s*=\s*["']separator|aria-valuenow|data-resize-trigger/i, evidence: "native resize separator evidence was detected." },
    { signal: "custom", pattern: /splitter|resizable|resize handle|panel resize|pane/i, evidence: "custom splitter evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function splitterReadinessStructureSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["structureSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-splitter-root|splitter\.machine/i, evidence: "root evidence was detected." },
    { signal: "panel", pattern: /getPanelProps|getPanels|data-panel-id|PanelData|\bpanels\b/i, evidence: "panel evidence was detected." },
    { signal: "resize-trigger", pattern: /getResizeTriggerProps|resizeTrigger|role\s*=\s*["']separator|data-resize-trigger/i, evidence: "resize trigger evidence was detected." },
    { signal: "indicator", pattern: /getResizeTriggerIndicator|resizeTriggerIndicator|data-focus|data-dragging/i, evidence: "indicator evidence was detected." },
    { signal: "items", pattern: /getItems|type:\s*["']handle|type:\s*["']panel/i, evidence: "items evidence was detected." },
    { signal: "layout", pattern: /getLayout|getPanelLayout|layout/i, evidence: "layout evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function splitterReadinessSizeSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["sizeSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["sizeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "size", pattern: /\bsize\b|size:\s*|onResize/i, evidence: "size evidence was detected." },
    { signal: "default-size", pattern: /defaultSize|default size/i, evidence: "default size evidence was detected." },
    { signal: "set-sizes", pattern: /setSizes|SIZE\.SET/i, evidence: "set sizes evidence was detected." },
    { signal: "reset-sizes", pattern: /resetSizes|SIZE\.RESET/i, evidence: "reset sizes evidence was detected." },
    { signal: "get-sizes", pattern: /getSizes|getResolvedSizes/i, evidence: "get sizes evidence was detected." },
    { signal: "panel-size", pattern: /getPanelSize|panelSize|PanelSize/i, evidence: "panel size evidence was detected." },
    { signal: "min-max", pattern: /minSize|maxSize|aria-valuemin|aria-valuemax/i, evidence: "min/max evidence was detected." },
    { signal: "validate-sizes", pattern: /validateSizes|resolvePanelSizes|fuzzySizeEqual/i, evidence: "size validation evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "size", "signal");
}

function splitterReadinessCollapseSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["collapseSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["collapseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "collapsible", pattern: /collapsible/i, evidence: "collapsible evidence was detected." },
    { signal: "collapsed-size", pattern: /collapsedSize|collapsed size/i, evidence: "collapsed size evidence was detected." },
    { signal: "collapse-panel", pattern: /collapsePanel|PANEL\.COLLAPSE|onCollapse/i, evidence: "collapse panel evidence was detected." },
    { signal: "expand-panel", pattern: /expandPanel|PANEL\.EXPAND|onExpand/i, evidence: "expand panel evidence was detected." },
    { signal: "is-collapsed", pattern: /isPanelCollapsed/i, evidence: "is collapsed evidence was detected." },
    { signal: "is-expanded", pattern: /isPanelExpanded/i, evidence: "is expanded evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "collapse", "signal");
}

function splitterReadinessInteractionSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-down", pattern: /POINTER_DOWN|pointerdown|onPointerDown|getEventPoint/i, evidence: "pointer down evidence was detected." },
    { signal: "pointer-move", pattern: /POINTER_MOVE|pointermove|trackPointerMove|setPointerValue/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-up", pattern: /POINTER_UP|pointerup|onPointerUp|releasePointerCapture/i, evidence: "pointer up evidence was detected." },
    { signal: "keyboard-move", pattern: /KEYBOARD_MOVE|keyboardResizeBy|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/i, evidence: "keyboard move evidence was detected." },
    { signal: "enter", pattern: /\bEnter\b|\bENTER\b|collapseOrExpandPanel/i, evidence: "Enter evidence was detected." },
    { signal: "home-end", pattern: /\bHome\b|\bEnd\b|\bHOME\b|\bEND\b/i, evidence: "Home/End evidence was detected." },
    { signal: "f6", pattern: /\bF6\b|FOCUS\.CYCLE|focusNextResizeTrigger/i, evidence: "F6 focus cycle evidence was detected." },
    { signal: "focus-blur", pattern: /\bFOCUS\b|\bBLUR\b|onFocus|onBlur|data-focus/i, evidence: "focus/blur evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function splitterReadinessAccessibilitySignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "separator", pattern: /role\s*=\s*["']separator|role:\s*["']separator/i, evidence: "separator evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "aria-valuenow evidence was detected." },
    { signal: "aria-valuemin", pattern: /aria-valuemin/i, evidence: "aria-valuemin evidence was detected." },
    { signal: "aria-valuemax", pattern: /aria-valuemax/i, evidence: "aria-valuemax evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-orientation", pattern: /aria-orientation/i, evidence: "aria-orientation evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation evidence was detected." },
    { signal: "dir", pattern: /dir\s*[:=]|rtl|ltr|getEventKey/i, evidence: "direction evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function splitterReadinessRegistrySignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["registrySignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["registrySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "registry", pattern: /\bregistry\b|register\(/i, evidence: "registry evidence was detected." },
    { signal: "root-resize", pattern: /trackRootResize|resizeObserverBorderBox|ROOT\.RESIZE/i, evidence: "root resize evidence was detected." },
    { signal: "global-cursor", pattern: /setupGlobalCursor|removeGlobalCursor|setGlobalCursor|clearGlobalCursor/i, evidence: "global cursor evidence was detected." },
    { signal: "preserve-fixed-size", pattern: /preserveFixedPanelSizes|preserve-pixel-size|preserve-relative-size/i, evidence: "preserve fixed panel size evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "registry", "signal");
}

function splitterReadinessZagUsagePattern(sourceFiles: SplitterReadinessSourceFile[]): string {
  const hasZagSplitterUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/splitter|splitter\.machine|splitter\.connect|getResizeTriggerProps|getPanelProps|getRootProps/i.test(source.text));
  return hasZagSplitterUsage ? "splitter\\.machine|splitter\\.connect|getRootProps|getPanelProps|getResizeTriggerProps" : "(?!)";
}

function splitterReadinessMachineSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["machineSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagSplitter}|createMachine|splitter\\.machine`, "i"), evidence: "Zag createMachine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagSplitter}|initialState\\(\\)[\\s\\S]{0,80}idle|\\bidle\\b`, "i"), evidence: "idle state evidence was detected." },
    { signal: "hover-temp-state", pattern: new RegExp(`${zagSplitter}|hover:temp|HOVER_DELAY|waitForHoverDelay`, "i"), evidence: "hover:temp state evidence was detected." },
    { signal: "hover-state", pattern: new RegExp(`${zagSplitter}|\\bhover\\b|POINTER_OVER|POINTER_LEAVE`, "i"), evidence: "hover state evidence was detected." },
    { signal: "focused-state", pattern: new RegExp(`${zagSplitter}|focused|FOCUS|BLUR`, "i"), evidence: "focused state evidence was detected." },
    { signal: "dragging-state", pattern: new RegExp(`${zagSplitter}|dragging|trackPointerMove|POINTER_MOVE`, "i"), evidence: "dragging state evidence was detected." },
    { signal: "size-events", pattern: new RegExp(`${zagSplitter}|SIZE\\.SET|SIZE\\.RESET|setSizes|resetSizes`, "i"), evidence: "size event evidence was detected." },
    { signal: "panel-events", pattern: new RegExp(`${zagSplitter}|PANEL\\.COLLAPSE|PANEL\\.EXPAND|PANEL\\.RESIZE|collapsePanel|expandPanel|resizePanel`, "i"), evidence: "panel event evidence was detected." },
    { signal: "root-resize-event", pattern: new RegExp(`${zagSplitter}|ROOT\\.RESIZE|trackRootResize|resizeObserverBorderBox`, "i"), evidence: "root resize event evidence was detected." },
    { signal: "pointer-events", pattern: new RegExp(`${zagSplitter}|POINTER_DOWN|POINTER_MOVE|POINTER_UP|onPointerDown|onPointerUp`, "i"), evidence: "pointer event evidence was detected." },
    { signal: "focus-events", pattern: new RegExp(`${zagSplitter}|\\bFOCUS\\b|\\bBLUR\\b|onFocus|onBlur`, "i"), evidence: "focus event evidence was detected." },
    { signal: "keyboard-events", pattern: new RegExp(`${zagSplitter}|KEYBOARD_MOVE|keyboardResizeBy|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Enter|getEventKey`, "i"), evidence: "keyboard event evidence was detected." },
    { signal: "focus-cycle-event", pattern: new RegExp(`${zagSplitter}|FOCUS\\.CYCLE|focusNextResizeTrigger|\\bF6\\b`, "i"), evidence: "focus cycle event evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function splitterReadinessComputedSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["computedSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "horizontal", pattern: new RegExp(`${zagSplitter}|computed[\\s\\S]{0,120}horizontal|orientation\\) === ["']horizontal["']|api\\.orientation`, "i"), evidence: "horizontal computed evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function splitterReadinessEffectSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["effectSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-resize-handles", pattern: new RegExp(`${zagSplitter}|trackResizeHandles|observeChildren|registry.*register`, "i"), evidence: "resize handle tracking effect evidence was detected." },
    { signal: "track-root-resize", pattern: new RegExp(`${zagSplitter}|trackRootResize|resizeObserverBorderBox|ROOT\\.RESIZE`, "i"), evidence: "root resize effect evidence was detected." },
    { signal: "hover-delay", pattern: new RegExp(`${zagSplitter}|waitForHoverDelay|setRafTimeout|HOVER_DELAY`, "i"), evidence: "hover delay effect evidence was detected." },
    { signal: "pointer-move", pattern: new RegExp(`${zagSplitter}|trackPointerMove|POINTER_MOVE|POINTER_UP`, "i"), evidence: "pointer move effect evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function splitterReadinessGuardSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["guardSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resize-trigger-focused", pattern: new RegExp(`${zagSplitter}|isResizeTriggerFocused|isActiveElement\\(dom\\.getResizeTriggerEl`, "i"), evidence: "resize trigger focused guard evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function splitterReadinessActionSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["actionSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-size", pattern: new RegExp(`${zagSplitter}|setSize\\(|SIZE\\.SET|validateSizes`, "i"), evidence: "set size action evidence was detected." },
    { signal: "reset-size", pattern: new RegExp(`${zagSplitter}|resetSize|SIZE\\.RESET|initialSize`, "i"), evidence: "reset size action evidence was detected." },
    { signal: "sync-size", pattern: new RegExp(`${zagSplitter}|syncSize|resolvePanelSizes|normalizePanels`, "i"), evidence: "sync size action evidence was detected." },
    { signal: "dragging-state", pattern: new RegExp(`${zagSplitter}|setDraggingState|clearDraggingState|dragState`, "i"), evidence: "dragging state action evidence was detected." },
    { signal: "keyboard-state", pattern: new RegExp(`${zagSplitter}|setKeyboardState|clearKeyboardState|keyboardState`, "i"), evidence: "keyboard state action evidence was detected." },
    { signal: "collapse-panel", pattern: new RegExp(`${zagSplitter}|collapsePanel|PANEL\\.COLLAPSE|panelSizeBeforeCollapse`, "i"), evidence: "collapse panel action evidence was detected." },
    { signal: "expand-panel", pattern: new RegExp(`${zagSplitter}|expandPanel|PANEL\\.EXPAND|expandToSizes`, "i"), evidence: "expand panel action evidence was detected." },
    { signal: "resize-panel", pattern: new RegExp(`${zagSplitter}|resizePanel|PANEL\\.RESIZE|imperative-api`, "i"), evidence: "resize panel action evidence was detected." },
    { signal: "pointer-value", pattern: new RegExp(`${zagSplitter}|setPointerValue|initialCursorPosition|mouse-or-touch`, "i"), evidence: "pointer value action evidence was detected." },
    { signal: "keyboard-value", pattern: new RegExp(`${zagSplitter}|setKeyboardValue|KEYBOARD_MOVE|trigger: ["']keyboard["']`, "i"), evidence: "keyboard value action evidence was detected." },
    { signal: "resize-callbacks", pattern: new RegExp(`${zagSplitter}|invokeOnResizeEnd|invokeOnResizeStart|onResizeEnd|onResizeStart`, "i"), evidence: "resize callback action evidence was detected." },
    { signal: "collapse-or-expand", pattern: new RegExp(`${zagSplitter}|collapseOrExpandPanel|\\bENTER\\b|collapsedSize`, "i"), evidence: "collapse/expand keyboard action evidence was detected." },
    { signal: "global-cursor", pattern: new RegExp(`${zagSplitter}|setGlobalCursor|clearGlobalCursor|setupGlobalCursor|removeGlobalCursor`, "i"), evidence: "global cursor action evidence was detected." },
    { signal: "focus-next-trigger", pattern: new RegExp(`${zagSplitter}|focusNextResizeTrigger|FOCUS\\.CYCLE|prev\\(|next\\(`, "i"), evidence: "focus next trigger action evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function splitterReadinessDomSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["domSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagSplitter}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "resize-trigger-id", pattern: new RegExp(`${zagSplitter}|getResizeTriggerId|ids\\?\\.resizeTrigger|getResizeTriggerProps`, "i"), evidence: "resize trigger id evidence was detected." },
    { signal: "label-id", pattern: new RegExp(`${zagSplitter}|getLabelId|ids\\?\\.label`, "i"), evidence: "label id evidence was detected." },
    { signal: "panel-id", pattern: new RegExp(`${zagSplitter}|getPanelId|ids\\?\\.panel|getPanelProps`, "i"), evidence: "panel id evidence was detected." },
    { signal: "panel-els", pattern: new RegExp(`${zagSplitter}|getPanelEls|data-part=panel|data-ownedby`, "i"), evidence: "panel elements evidence was detected." },
    { signal: "root-el", pattern: new RegExp(`${zagSplitter}|getRootEl|getById\\(getRootId`, "i"), evidence: "root element evidence was detected." },
    { signal: "resize-trigger-el", pattern: new RegExp(`${zagSplitter}|getResizeTriggerEl|getById\\(getResizeTriggerId`, "i"), evidence: "resize trigger element evidence was detected." },
    { signal: "panel-el", pattern: new RegExp(`${zagSplitter}|getPanelEl|getById\\(getPanelId`, "i"), evidence: "panel element evidence was detected." },
    { signal: "resolve-trigger-id", pattern: new RegExp(`${zagSplitter}|resolveResizeTriggerId|getPrevPanelId|getNextPanelId`, "i"), evidence: "resolve resize trigger id evidence was detected." },
    { signal: "cursor", pattern: new RegExp(`${zagSplitter}|getCursor|col-resize|row-resize|e-resize|n-resize`, "i"), evidence: "cursor evidence was detected." },
    { signal: "global-cursor", pattern: new RegExp(`${zagSplitter}|getGlobalCursorId|getGlobalCursorEl|setupGlobalCursor|removeGlobalCursor`, "i"), evidence: "global cursor DOM evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function splitterReadinessUtilitySignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["utilitySignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["utilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-values", pattern: new RegExp(`${zagSplitter}|calculateAriaValues|getAriaValue|valueNow|valueMin|valueMax`, "i"), evidence: "ARIA value utility evidence was detected." },
    { signal: "fuzzy-compare", pattern: new RegExp(`${zagSplitter}|fuzzyCompareNumbers|fuzzyNumbersEqual|fuzzySizeEqual|PRECISION`, "i"), evidence: "fuzzy compare utility evidence was detected." },
    { signal: "panel-layout", pattern: new RegExp(`${zagSplitter}|getPanelLayout|sortPanels|serializePanels|panelDataHelper`, "i"), evidence: "panel layout utility evidence was detected." },
    { signal: "panel-flex-style", pattern: new RegExp(`${zagSplitter}|getPanelFlexBoxStyle|flexGrow|flexBasis|getClampedFlexBasis`, "i"), evidence: "panel flex style utility evidence was detected." },
    { signal: "default-size", pattern: new RegExp(`${zagSplitter}|getUnsafeDefaultSize|remainingSize|numPanelsWithSizes`, "i"), evidence: "default size utility evidence was detected." },
    { signal: "parse-panel-size", pattern: new RegExp(`${zagSplitter}|parsePanelSize|sizeRegex|toPixelValue`, "i"), evidence: "parse panel size utility evidence was detected." },
    { signal: "css-panel-size", pattern: new RegExp(`${zagSplitter}|toCssPanelSize|percentRegex`, "i"), evidence: "CSS panel size utility evidence was detected." },
    { signal: "resolve-panel-sizes", pattern: new RegExp(`${zagSplitter}|resolvePanelSizes|remainingSize`, "i"), evidence: "resolve panel sizes utility evidence was detected." },
    { signal: "normalize-panels", pattern: new RegExp(`${zagSplitter}|normalizePanels|minSize|maxSize|collapsedSize`, "i"), evidence: "normalize panels utility evidence was detected." },
    { signal: "resize-by-delta", pattern: new RegExp(`${zagSplitter}|resizeByDelta|pivotIndices|deltaApplied|mouse-or-touch|imperative-api`, "i"), evidence: "resize by delta utility evidence was detected." },
    { signal: "validate-sizes", pattern: new RegExp(`${zagSplitter}|validateSizes|nextSizeTotalSize|remainingSize`, "i"), evidence: "validate sizes utility evidence was detected." },
    { signal: "preserve-fixed-size", pattern: new RegExp(`${zagSplitter}|preserveFixedPanelSizes|preserve-pixel-size|relativeIndices`, "i"), evidence: "preserve fixed size utility evidence was detected." },
    { signal: "registry", pattern: new RegExp(`${zagSplitter}|SplitterRegistry|hitAreaMargins|register\\(|findIntersectingHandles|updateCursor`, "i"), evidence: "splitter registry utility evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "utility", "signal");
}

function splitterReadinessApiSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["apiSignals"] {
  const zagSplitter = splitterReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: SplitterReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dragging", pattern: new RegExp(`${zagSplitter}|api\\.dragging|dragging,`, "i"), evidence: "dragging API evidence was detected." },
    { signal: "orientation", pattern: new RegExp(`${zagSplitter}|api\\.orientation|orientation,`, "i"), evidence: "orientation API evidence was detected." },
    { signal: "panels", pattern: new RegExp(`${zagSplitter}|api\\.getPanels|getPanels\\(|api\\.getPanelById|getPanelById\\(`, "i"), evidence: "panel API evidence was detected." },
    { signal: "items", pattern: new RegExp(`${zagSplitter}|api\\.getItems|getItems\\(|type: ["']handle["']|type: ["']panel["']`, "i"), evidence: "items API evidence was detected." },
    { signal: "sizes", pattern: new RegExp(`${zagSplitter}|api\\.getSizes|getSizes\\(|getResolvedSizes`, "i"), evidence: "sizes API evidence was detected." },
    { signal: "set-sizes", pattern: new RegExp(`${zagSplitter}|api\\.setSizes|setSizes\\(|SIZE\\.SET`, "i"), evidence: "set sizes API evidence was detected." },
    { signal: "reset-sizes", pattern: new RegExp(`${zagSplitter}|api\\.resetSizes|resetSizes\\(|SIZE\\.RESET`, "i"), evidence: "reset sizes API evidence was detected." },
    { signal: "collapse-panel", pattern: new RegExp(`${zagSplitter}|api\\.collapsePanel|collapsePanel\\(|PANEL\\.COLLAPSE`, "i"), evidence: "collapse panel API evidence was detected." },
    { signal: "expand-panel", pattern: new RegExp(`${zagSplitter}|api\\.expandPanel|expandPanel\\(|PANEL\\.EXPAND`, "i"), evidence: "expand panel API evidence was detected." },
    { signal: "resize-panel", pattern: new RegExp(`${zagSplitter}|api\\.resizePanel|resizePanel\\(|PANEL\\.RESIZE`, "i"), evidence: "resize panel API evidence was detected." },
    { signal: "panel-size", pattern: new RegExp(`${zagSplitter}|api\\.getPanelSize|getPanelSize\\(|panelSize`, "i"), evidence: "panel size API evidence was detected." },
    { signal: "panel-state", pattern: new RegExp(`${zagSplitter}|api\\.isPanelCollapsed|api\\.isPanelExpanded|isPanelCollapsed\\(|isPanelExpanded\\(`, "i"), evidence: "panel collapsed/expanded API evidence was detected." },
    { signal: "layout", pattern: new RegExp(`${zagSplitter}|api\\.getLayout|getLayout\\(|getPanelLayout`, "i"), evidence: "layout API evidence was detected." },
    { signal: "resize-trigger-state", pattern: new RegExp(`${zagSplitter}|api\\.getResizeTriggerState|getResizeTriggerState`, "i"), evidence: "resize trigger state API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagSplitter}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "panel-props", pattern: new RegExp(`${zagSplitter}|getPanelProps`, "i"), evidence: "panel props API evidence was detected." },
    { signal: "resize-trigger-props", pattern: new RegExp(`${zagSplitter}|getResizeTriggerProps|role: ["']separator["']`, "i"), evidence: "resize trigger props API evidence was detected." },
    { signal: "resize-trigger-indicator", pattern: new RegExp(`${zagSplitter}|getResizeTriggerIndicator|resizeTriggerIndicator`, "i"), evidence: "resize trigger indicator API evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function splitterReadinessTestSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["testSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|F6|keyboard-test/i, evidence: "keyboard test evidence was detected." },
    { signal: "pointer-test", pattern: /user\.pointer|pointer-test|onPointer/i, evidence: "pointer test evidence was detected." },
    { signal: "aria-test", pattern: /aria-valuenow|aria-valuemin|aria-valuemax|aria-controls|toHaveAttribute|getByRole|getAllByRole/i, evidence: "ARIA test evidence was detected." },
    { signal: "collapse-test", pattern: /collapse-test|collapsePanel|expandPanel|isPanelCollapsed|isPanelExpanded/i, evidence: "collapse test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|splitter-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function splitterReadinessPackageSignals(sourceFiles: SplitterReadinessSourceFile[]): SplitterReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SplitterReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/splitter", pattern: /@zag-js\/splitter/i, evidence: "@zag-js/splitter dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|SplitterSchema|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|observeChildren|resizeObserverBorderBox|trackPointerMove|getEventKey|getEventPoint/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty|Orientation|Point/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|ensureProps|createSplitProps|createProps|setRafTimeout/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return splitterReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function splitterReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SplitterReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/splitter-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
