import path from "node:path";
import type { NumberInputReadinessReport, RatingGroupReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildNumberInputReadinessReport(walk: WalkResult): Promise<NumberInputReadinessReport> {
  const sourceFiles = await numberInputReadinessSourceFiles(walk);
  const numberInputSetups = numberInputReadinessSetups(sourceFiles);
  const frameworkSignals = numberInputReadinessFrameworkSignals(sourceFiles);
  const structureSignals = numberInputReadinessStructureSignals(sourceFiles);
  const valueSignals = numberInputReadinessValueSignals(sourceFiles);
  const boundsSignals = numberInputReadinessBoundsSignals(sourceFiles);
  const formatSignals = numberInputReadinessFormatSignals(sourceFiles);
  const keyboardSignals = numberInputReadinessKeyboardSignals(sourceFiles);
  const interactionSignals = numberInputReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = numberInputReadinessAccessibilitySignals(sourceFiles);
  const formSignals = numberInputReadinessFormSignals(sourceFiles);
  const machineSignals = numberInputReadinessMachineSignals(sourceFiles);
  const computedSignals = numberInputReadinessComputedSignals(sourceFiles);
  const effectSignals = numberInputReadinessEffectSignals(sourceFiles);
  const actionSignals = numberInputReadinessActionSignals(sourceFiles);
  const domSignals = numberInputReadinessDomSignals(sourceFiles);
  const cursorSignals = numberInputReadinessCursorSignals(sourceFiles);
  const apiSignals = numberInputReadinessApiSignals(sourceFiles);
  const testSignals = numberInputReadinessTestSignals(sourceFiles);
  const packageSignals = numberInputReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.inputCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.valueCount > 0);
  const hasBounds = boundsSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.boundsCount > 0);
  const hasFormatting = formatSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.formatCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.keyboardCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.interactionCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || numberInputSetups.some((item) => item.testCount > 0);

  const riskQueue: NumberInputReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document number input root, label, control, input, increment/decrement triggers, scrubber, and value text before claiming number-input readiness.",
      why: "Number input readiness starts with traceable spinbutton structure and visible value controls.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace value, defaultValue, valueAsNumber, formattedValue, setValue, clearValue, increment, decrement, and set-to-min/max behavior.",
      why: "Number inputs can desynchronize string value, parsed number, formatted display, and external form value.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasBounds) {
    riskQueue.push({
      priority: "high",
      action: "Trace min, max, step, allow-overflow, clamp-on-blur, at-min/max, out-of-range, and invalid state handling.",
      why: "Bounds and clamp behavior decide whether increment/decrement controls stay inside valid domain values.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasFormatting) {
    riskQueue.push({
      priority: "medium",
      action: "Document locale, format options, parser, formatter, pattern, input mode, and value text evidence.",
      why: "Formatting changes how users see values and how typed strings become numbers.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && (!hasKeyboard || !hasInteraction)) {
    riskQueue.push({
      priority: "medium",
      action: "Trace ArrowUp, ArrowDown, Home, End, Enter, beforeinput/change/blur/focus, spin-on-press, wheel, pointer, scrubber, pointer-lock, virtual cursor, and caret behavior.",
      why: "Number input interaction semantics include keyboard, long-press, wheel, pointer, and caret preservation paths.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify role spinbutton, aria-valuemin/max/now/text, aria-invalid, aria-controls, aria-label, data-disabled, and required/readOnly evidence.",
      why: "Assistive technology relies on spinbutton metadata to describe the current numeric value and range.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, pointer, wheel, ARIA, bounds, formatting, and artifact tests.",
      why: "Static component evidence does not prove clamping, parsing, repeated spinning, wheel behavior, or accessibility attributes.",
      relatedHref: "html/number-input-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual number-input behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records number input readiness only; it does not press spin buttons, type values, dispatch wheel or pointer events, mutate inputs, clamp live values, request pointer lock, submit forms, or run analyzed project tests.",
    relatedHref: "html/number-input-readiness.html"
  });

  return {
    summary: `Number input readiness report: setup ${numberInputSetups.length} files, value signal ${valueSignals.length}, bounds signal ${boundsSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Number input readiness Zag number-input native spinbutton value min max step clamp format locale keyboard scrubber wheel tests",
    numberInputSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    boundsSignals,
    formatSignals,
    keyboardSignals,
    interactionSignals,
    accessibilitySignals,
    formSignals,
    machineSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    domSignals,
    cursorSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/number-input|numberInput\\.machine|numberInput\\.connect|getInputProps|getIncrementTriggerProps|getDecrementTriggerProps|getScrubberProps\" package.json src app packages", purpose: "Find Zag number-input machine, connect API, spinbutton props, triggers, and scrubber wiring." },
      { command: "rg \"role=['\\\"]spinbutton|min|max|step|aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext\" src app packages", purpose: "Find native or custom spinbutton range and ARIA value evidence." },
      { command: "rg \"valueAsNumber|formattedValue|setValue|clearValue|increment\\(|decrement\\(|setToMax|setToMin|clampValueOnBlur|allowOverflow\" src app packages", purpose: "Check value, formatting, bounds, and command APIs." },
      { command: "rg \"ArrowUp|ArrowDown|Home|End|beforeinput|wheel|pointer|scrubber|requestPointerLock|number-input-traces|upload-artifact\" src app packages test tests .github", purpose: "Check keyboard, wheel, pointer, scrubber, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag number-input, native spinbutton markup, or a custom number field.",
      "Trace root, label, control, input, increment/decrement triggers, scrubber, and value-text structure before reviewing value state.",
      "Map value/defaultValue, valueAsNumber, formattedValue, setValue, clearValue, increment/decrement, and set-to-min/max behavior.",
      "Check min, max, step, allow-overflow, clamp-on-blur, at-min/max, out-of-range, invalid, locale, parser, formatter, pattern, and input-mode evidence.",
      "Verify keyboard, wheel, pointer, scrubber, pointer-lock, virtual cursor, caret, ARIA, form, and disabled fieldset coverage.",
      "This report is static readiness. Actual spin-button presses, typed values, wheel/pointer dispatch, live clamping, pointer lock, form submit, and project tests need trusted project QA."
    ]
  };
}

type NumberInputReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function numberInputReadinessSourceFiles(walk: WalkResult): Promise<NumberInputReadinessSourceFile[]> {
  const files: NumberInputReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !numberInputReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!numberInputReadinessPathSignal(file.relPath) && !numberInputReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function numberInputReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return numberInputReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function numberInputReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(number-input|number_input|numberinput|spinbutton|counter|quantity|price|amount|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function numberInputReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/number-input|numberInput\.machine|numberInput\.connect|getIncrementTriggerProps|getDecrementTriggerProps|getScrubberProps|role\s*=\s*["']spinbutton|aria-valuemin|aria-valuemax|valueAsNumber|formattedValue|clampValueOnBlur|allowMouseWheel|number-input-traces)/i.test(text);
}

function numberInputReadinessSetups(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["numberInputSetups"] {
  const rows: NumberInputReadinessReport["numberInputSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(numberInput\.machine|numberInput\.connect|getRootProps|data-number-input-root|number input|spinbutton|<section\b|<div\b)/gi);
    const inputCount = countMatches(source.text, /(getInputProps|<input\b|role\s*=\s*["']spinbutton|type\s*=\s*["']number|inputMode|input-mode)/gi);
    const triggerCount = countMatches(source.text, /(getIncrementTriggerProps|getDecrementTriggerProps|incrementTrigger|decrementTrigger|api\.increment|api\.decrement|Increase|Decrease|<button\b)/gi);
    const scrubberCount = countMatches(source.text, /(getScrubberProps|scrubber|scrub|drag|pointer)/gi);
    const valueCount = countMatches(source.text, /(valueAsNumber|formattedValue|defaultValue|value\s*[:=]|setValue|clearValue|api\.increment|api\.decrement|setToMax|setToMin|getValueTextProps)/gi);
    const boundsCount = countMatches(source.text, /(min\s*[:=]|max\s*[:=]|step\s*[:=]|allowOverflow|clampValueOnBlur|clampValue|isAtMin|isAtMax|isOutOfRange|canIncrement|canDecrement|invalid|aria-valuemin|aria-valuemax)/gi);
    const formatCount = countMatches(source.text, /(locale|formatOptions|createFormatter|createParser|parseValue|formatValue|pattern|inputMode|valueText|aria-valuetext|currency|decimal)/gi);
    const keyboardCount = countMatches(source.text, /(ArrowUp|ArrowDown|Home|End|Enter|beforeinput|before-input|onKeyDown|INPUT\.ARROW_UP|INPUT\.ARROW_DOWN|INPUT\.HOME|INPUT\.END|INPUT\.ENTER|INPUT\.CHANGE|INPUT\.BLUR|focus\(|blur)/gi);
    const interactionCount = countMatches(source.text, /(spinOnPress|allowMouseWheel|wheel|pointer|requestPointerLock|virtual cursor|cursor|caret|recordCursor|restoreCursor|setCaretToEnd|getScrubberProps|user\.pointer|fireEvent\.wheel)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']spinbutton|aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|aria-invalid|aria-controls|aria-label|data-disabled|required|readOnly|readonly|disabled|toHaveAttribute)/gi);
    const formCount = countMatches(source.text, /(name\s*[:=]|form\s*[:=]|trackFormControl|fieldsetDisabled|disabled fieldset|onValueCommit|value commit|required|readOnly|readonly)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.keyboard|user\.pointer|fireEvent\.wheel|getByRole|toHaveAttribute|number-input-traces|upload-artifact)/gi);
    const total = rootCount + inputCount + triggerCount + scrubberCount + valueCount + boundsCount + formatCount + keyboardCount + interactionCount + accessibilityCount + formCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && inputCount > 0 && valueCount > 0 && boundsCount > 0 && (keyboardCount > 0 || interactionCount > 0) ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: numberInputReadinessFramework(source),
      rootCount,
      inputCount,
      triggerCount,
      scrubberCount,
      valueCount,
      boundsCount,
      formatCount,
      keyboardCount,
      interactionCount,
      accessibilityCount,
      formCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, input ${inputCount}, trigger ${triggerCount}, scrubber ${scrubberCount}, value ${valueCount}, bounds ${boundsCount}, format ${formatCount}, keyboard ${keyboardCount}, interaction ${interactionCount}, accessibility ${accessibilityCount}, form ${formCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.inputCount + b.valueCount + b.boundsCount + b.interactionCount - (a.inputCount + a.valueCount + a.boundsCount + a.interactionCount));
}

function numberInputReadinessFramework(source: NumberInputReadinessSourceFile): NumberInputReadinessReport["numberInputSetups"][number]["framework"] {
  if (/@zag-js\/number-input|numberInput\.machine|numberInput\.connect|getIncrementTriggerProps|getScrubberProps/i.test(source.text)) return "zag-number-input";
  if (/role\s*=\s*["']spinbutton|type\s*=\s*["']number|aria-valuemin|aria-valuemax/i.test(source.text)) return "native-spinbutton";
  if (/number input|number-input|increment|decrement|min|max|step/i.test(source.text)) return "custom";
  return "unknown";
}

function numberInputReadinessFrameworkSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-number-input", pattern: /@zag-js\/number-input|numberInput\.machine|numberInput\.connect|getIncrementTriggerProps|getScrubberProps/i, evidence: "Zag number-input evidence was detected." },
    { signal: "native-spinbutton", pattern: /role\s*=\s*["']spinbutton|type\s*=\s*["']number|aria-valuemin|aria-valuemax/i, evidence: "native spinbutton evidence was detected." },
    { signal: "custom", pattern: /number input|number-input|increment|decrement|min|max|step/i, evidence: "custom number input evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function numberInputReadinessStructureSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["structureSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-number-input-root|numberInput\.machine|<section\b|<div\b/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label\b|htmlFor|aria-label/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|control|aria-controls/i, evidence: "control evidence was detected." },
    { signal: "input", pattern: /getInputProps|<input\b|role\s*=\s*["']spinbutton|type\s*=\s*["']number/i, evidence: "input evidence was detected." },
    { signal: "increment-trigger", pattern: /getIncrementTriggerProps|incrementTrigger|api\.increment|Increase/i, evidence: "increment trigger evidence was detected." },
    { signal: "decrement-trigger", pattern: /getDecrementTriggerProps|decrementTrigger|api\.decrement|Decrease/i, evidence: "decrement trigger evidence was detected." },
    { signal: "scrubber", pattern: /getScrubberProps|scrubber|scrub/i, evidence: "scrubber evidence was detected." },
    { signal: "value-text", pattern: /getValueTextProps|valueText|aria-valuetext|formattedValue/i, evidence: "value text evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function numberInputReadinessValueSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["valueSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|value:\s*|api\.value|onValueChange/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default value/i, evidence: "default value evidence was detected." },
    { signal: "value-as-number", pattern: /valueAsNumber|value as number/i, evidence: "value-as-number evidence was detected." },
    { signal: "formatted-value", pattern: /formattedValue|formatted value|formatValue/i, evidence: "formatted value evidence was detected." },
    { signal: "set-value", pattern: /setValue|VALUE\.SET/i, evidence: "set value evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|VALUE\.CLEAR/i, evidence: "clear value evidence was detected." },
    { signal: "increment", pattern: /increment\(|VALUE\.INCREMENT|getIncrementTriggerProps/i, evidence: "increment evidence was detected." },
    { signal: "decrement", pattern: /decrement\(|VALUE\.DECREMENT|getDecrementTriggerProps/i, evidence: "decrement evidence was detected." },
    { signal: "set-to-min-max", pattern: /setToMax|setToMin|set to max|set to min/i, evidence: "set-to-min/max evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function numberInputReadinessBoundsSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["boundsSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["boundsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "min", pattern: /\bmin\b|min\s*[:=]|aria-valuemin|Number\.MIN_SAFE_INTEGER/i, evidence: "min evidence was detected." },
    { signal: "max", pattern: /\bmax\b|max\s*[:=]|aria-valuemax|Number\.MAX_SAFE_INTEGER/i, evidence: "max evidence was detected." },
    { signal: "step", pattern: /\bstep\b|step\s*[:=]|getDefaultStep/i, evidence: "step evidence was detected." },
    { signal: "allow-overflow", pattern: /allowOverflow|allow overflow/i, evidence: "allow overflow evidence was detected." },
    { signal: "clamp-on-blur", pattern: /clampValueOnBlur|clamp on blur|clampValue/i, evidence: "clamp-on-blur evidence was detected." },
    { signal: "at-min-max", pattern: /isAtMin|isAtMax|isValueAtMin|isValueAtMax|canIncrement|canDecrement/i, evidence: "at-min/max evidence was detected." },
    { signal: "out-of-range", pattern: /isOutOfRange|isValueWithinRange|outOfRange|out-of-range/i, evidence: "out-of-range evidence was detected." },
    { signal: "invalid", pattern: /\binvalid\b|aria-invalid|onValueInvalid/i, evidence: "invalid evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "bounds", "signal");
}

function numberInputReadinessFormatSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["formatSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["formatSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "locale", pattern: /locale|en-US|Intl/i, evidence: "locale evidence was detected." },
    { signal: "format-options", pattern: /formatOptions|style:\s*["']currency|currency/i, evidence: "format options evidence was detected." },
    { signal: "parser", pattern: /createParser|parseValue|parser/i, evidence: "parser evidence was detected." },
    { signal: "formatter", pattern: /createFormatter|formatValue|formatter|formattedValue/i, evidence: "formatter evidence was detected." },
    { signal: "pattern", pattern: /pattern\s*[:=]|pattern=/i, evidence: "pattern evidence was detected." },
    { signal: "input-mode", pattern: /inputMode|input-mode|inputmode/i, evidence: "input mode evidence was detected." },
    { signal: "value-text", pattern: /valueText|aria-valuetext|getValueTextProps/i, evidence: "value text evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "format", "signal");
}

function numberInputReadinessKeyboardSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-up", pattern: /ArrowUp|ARROW_UP/i, evidence: "ArrowUp evidence was detected." },
    { signal: "arrow-down", pattern: /ArrowDown|ARROW_DOWN/i, evidence: "ArrowDown evidence was detected." },
    { signal: "home", pattern: /\bHome\b|INPUT\.HOME/i, evidence: "Home key evidence was detected." },
    { signal: "end", pattern: /\bEnd\b|INPUT\.END/i, evidence: "End key evidence was detected." },
    { signal: "enter", pattern: /\bEnter\b|INPUT\.ENTER/i, evidence: "Enter key evidence was detected." },
    { signal: "before-input", pattern: /beforeinput|before-input|onBeforeInput/i, evidence: "beforeinput evidence was detected." },
    { signal: "change", pattern: /onChange|INPUT\.CHANGE|user\.keyboard|fireEvent\.change/i, evidence: "change evidence was detected." },
    { signal: "blur", pattern: /onBlur|INPUT\.BLUR|blur/i, evidence: "blur evidence was detected." },
    { signal: "focus", pattern: /onFocus|focusInputOnChange|api\.focus|focus\(/i, evidence: "focus evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function numberInputReadinessInteractionSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "spin-on-press", pattern: /spinOnPress|spin on press/i, evidence: "spin-on-press evidence was detected." },
    { signal: "mouse-wheel", pattern: /allowMouseWheel|wheel|mouse wheel|fireEvent\.wheel/i, evidence: "mouse wheel evidence was detected." },
    { signal: "pointer", pattern: /pointer|onPointer|user\.pointer/i, evidence: "pointer evidence was detected." },
    { signal: "scrubber", pattern: /scrubber|getScrubberProps|scrub/i, evidence: "scrubber evidence was detected." },
    { signal: "pointer-lock", pattern: /requestPointerLock|pointer lock/i, evidence: "pointer lock evidence was detected." },
    { signal: "virtual-cursor", pattern: /virtual cursor|scrubberCursorPoint|virtualCursor/i, evidence: "virtual cursor evidence was detected." },
    { signal: "caret", pattern: /caret|recordCursor|restoreCursor|setCaretToEnd|cursor/i, evidence: "caret/cursor evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function numberInputReadinessAccessibilitySignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-spinbutton", pattern: /role\s*=\s*["']spinbutton|role:\s*["']spinbutton/i, evidence: "role spinbutton evidence was detected." },
    { signal: "aria-valuemin", pattern: /aria-valuemin/i, evidence: "aria-valuemin evidence was detected." },
    { signal: "aria-valuemax", pattern: /aria-valuemax/i, evidence: "aria-valuemax evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "aria-valuenow evidence was detected." },
    { signal: "aria-valuetext", pattern: /aria-valuetext/i, evidence: "aria-valuetext evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|incrementLabel|decrementLabel/i, evidence: "aria-label evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled|disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "required-readonly", pattern: /required|readOnly|readonly/i, evidence: "required/readOnly evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function numberInputReadinessFormSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["formSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /\bname\b|name\s*[:=]/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /\bform\b|form\s*[:=]/i, evidence: "form evidence was detected." },
    { signal: "track-form-control", pattern: /trackFormControl|track form control/i, evidence: "form-control tracking evidence was detected." },
    { signal: "disabled-fieldset", pattern: /fieldsetDisabled|disabled fieldset|fieldset/i, evidence: "disabled fieldset evidence was detected." },
    { signal: "value-commit", pattern: /onValueCommit|value commit|VALUE\.COMMIT/i, evidence: "value commit evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function numberInputReadinessZagUsagePattern(sourceFiles: NumberInputReadinessSourceFile[]): string {
  const hasZagNumberInputUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/number-input|numberInput\.machine|numberInput\.connect|getRootProps|getLabelProps|getControlProps|getValueTextProps|getInputProps|getIncrementTriggerProps|getDecrementTriggerProps|getScrubberProps/i.test(source.text));
  return hasZagNumberInputUsage ? "numberInput\\.machine|numberInput\\.connect|getRootProps|getLabelProps|getControlProps|getValueTextProps|getInputProps|getIncrementTriggerProps|getDecrementTriggerProps|getScrubberProps" : "(?!)";
}

function numberInputReadinessMachineSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["machineSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagNumberInput}|setup<NumberInputSchema>|createMachine|numberInput\\.machine`, "i"), evidence: "Zag setup/createMachine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagNumberInput}|initialState\\(\\)[\\s\\S]{0,80}idle|state:\\s*["']idle["']|\\bidle\\b`, "i"), evidence: "idle state evidence was detected." },
    { signal: "focused-state", pattern: new RegExp(`${zagNumberInput}|state:\\s*["']focused["']|\\bfocused\\b|INPUT\\.FOCUS`, "i"), evidence: "focused state evidence was detected." },
    { signal: "before-spin-state", pattern: new RegExp(`${zagNumberInput}|before:spin|CHANGE_DELAY`, "i"), evidence: "before:spin state evidence was detected." },
    { signal: "spinning-state", pattern: new RegExp(`${zagNumberInput}|\\bspinning\\b|SPIN|spinValue`, "i"), evidence: "spinning state evidence was detected." },
    { signal: "scrubbing-state", pattern: new RegExp(`${zagNumberInput}|\\bscrubbing\\b|SCRUBBER\\.PRESS_DOWN`, "i"), evidence: "scrubbing state evidence was detected." },
    { signal: "value-set-event", pattern: new RegExp(`${zagNumberInput}|VALUE\\.SET|setRawValue|setValue\\(`, "i"), evidence: "VALUE.SET event evidence was detected." },
    { signal: "value-clear-event", pattern: new RegExp(`${zagNumberInput}|VALUE\\.CLEAR|clearValue`, "i"), evidence: "VALUE.CLEAR event evidence was detected." },
    { signal: "value-increment-event", pattern: new RegExp(`${zagNumberInput}|VALUE\\.INCREMENT|INPUT\\.ARROW_UP|increment\\(`, "i"), evidence: "VALUE.INCREMENT event evidence was detected." },
    { signal: "value-decrement-event", pattern: new RegExp(`${zagNumberInput}|VALUE\\.DECREMENT|INPUT\\.ARROW_DOWN|decrement\\(`, "i"), evidence: "VALUE.DECREMENT event evidence was detected." },
    { signal: "trigger-press-events", pattern: new RegExp(`${zagNumberInput}|TRIGGER\\.PRESS_DOWN|TRIGGER\\.PRESS_UP|getIncrementTriggerProps|getDecrementTriggerProps`, "i"), evidence: "trigger press event evidence was detected." },
    { signal: "scrubber-events", pattern: new RegExp(`${zagNumberInput}|SCRUBBER\\.PRESS_DOWN|SCRUBBER\\.POINTER_MOVE|SCRUBBER\\.POINTER_UP|getScrubberProps`, "i"), evidence: "scrubber event evidence was detected." },
    { signal: "input-events", pattern: new RegExp(`${zagNumberInput}|INPUT\\.FOCUS|INPUT\\.BLUR|INPUT\\.CHANGE|INPUT\\.ENTER|INPUT\\.HOME|INPUT\\.END|onBeforeInput|onKeyDown`, "i"), evidence: "input event evidence was detected." },
    { signal: "spin-events", pattern: new RegExp(`${zagNumberInput}|CHANGE_DELAY|SPIN|spinOnPress|spinValue`, "i"), evidence: "spin event evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function numberInputReadinessComputedSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["computedSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-as-number", pattern: new RegExp(`${zagNumberInput}|valueAsNumber|parseValue`, "i"), evidence: "valueAsNumber computed evidence was detected." },
    { signal: "formatted-value", pattern: new RegExp(`${zagNumberInput}|formattedValue|formatValue`, "i"), evidence: "formattedValue computed evidence was detected." },
    { signal: "at-min", pattern: new RegExp(`${zagNumberInput}|isAtMin|isValueAtMin`, "i"), evidence: "isAtMin computed evidence was detected." },
    { signal: "at-max", pattern: new RegExp(`${zagNumberInput}|isAtMax|isValueAtMax`, "i"), evidence: "isAtMax computed evidence was detected." },
    { signal: "out-of-range", pattern: new RegExp(`${zagNumberInput}|isOutOfRange|isValueWithinRange`, "i"), evidence: "out-of-range computed evidence was detected." },
    { signal: "value-empty", pattern: new RegExp(`${zagNumberInput}|isValueEmpty|context\\.get\\(["']value["']\\) === ["']["']`, "i"), evidence: "empty value computed evidence was detected." },
    { signal: "disabled", pattern: new RegExp(`${zagNumberInput}|isDisabled|fieldsetDisabled|prop\\(["']disabled["']\\)`, "i"), evidence: "disabled computed evidence was detected." },
    { signal: "can-increment", pattern: new RegExp(`${zagNumberInput}|canIncrement|allowOverflow|isAtMax`, "i"), evidence: "canIncrement computed evidence was detected." },
    { signal: "can-decrement", pattern: new RegExp(`${zagNumberInput}|canDecrement|allowOverflow|isAtMin`, "i"), evidence: "canDecrement computed evidence was detected." },
    { signal: "value-text", pattern: new RegExp(`${zagNumberInput}|valueText|aria-valuetext|translations.*valueText`, "i"), evidence: "valueText computed evidence was detected." },
    { signal: "rtl", pattern: new RegExp(`${zagNumberInput}|isRtl|dir\\) === ["']rtl["']|rtl`, "i"), evidence: "RTL computed evidence was detected." },
    { signal: "formatter", pattern: new RegExp(`${zagNumberInput}|formatter|createFormatter|Intl\\.NumberFormat`, "i"), evidence: "formatter computed evidence was detected." },
    { signal: "parser", pattern: new RegExp(`${zagNumberInput}|parser|createParser|NumberParser`, "i"), evidence: "parser computed evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function numberInputReadinessEffectSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["effectSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-form-control", pattern: new RegExp(`${zagNumberInput}|trackFormControl|onFieldsetDisabledChange|onFormReset`, "i"), evidence: "trackFormControl effect evidence was detected." },
    { signal: "wheel-listener", pattern: new RegExp(`${zagNumberInput}|attachWheelListener|addDomEvent\\(inputEl, ["']wheel["']|allowMouseWheel`, "i"), evidence: "wheel listener effect evidence was detected." },
    { signal: "pointer-lock", pattern: new RegExp(`${zagNumberInput}|activatePointerLock|requestPointerLock`, "i"), evidence: "pointer lock effect evidence was detected." },
    { signal: "mouse-move", pattern: new RegExp(`${zagNumberInput}|trackMousemove|mousemove|getMousemoveValue`, "i"), evidence: "mousemove tracking effect evidence was detected." },
    { signal: "virtual-cursor", pattern: new RegExp(`${zagNumberInput}|setupVirtualCursor|createVirtualCursor|scrubberCursorPoint`, "i"), evidence: "virtual cursor effect evidence was detected." },
    { signal: "prevent-text-selection", pattern: new RegExp(`${zagNumberInput}|preventTextSelection|userSelect|pointerEvents`, "i"), evidence: "prevent text selection effect evidence was detected." },
    { signal: "button-disabled", pattern: new RegExp(`${zagNumberInput}|trackButtonDisabled|observeAttributes|disabled`, "i"), evidence: "button disabled tracking evidence was detected." },
    { signal: "change-delay", pattern: new RegExp(`${zagNumberInput}|waitForChangeDelay|CHANGE_DELAY|setTimeout`, "i"), evidence: "change delay effect evidence was detected." },
    { signal: "spin-value", pattern: new RegExp(`${zagNumberInput}|spinValue|setInterval|SPIN`, "i"), evidence: "spin value effect evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function numberInputReadinessActionSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["actionSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focus-input", pattern: new RegExp(`${zagNumberInput}|focusInput|focusInputOnChange|preventScroll`, "i"), evidence: "focusInput action evidence was detected." },
    { signal: "increment", pattern: new RegExp(`${zagNumberInput}|increment\\(|incrementValue|VALUE\\.INCREMENT`, "i"), evidence: "increment action evidence was detected." },
    { signal: "decrement", pattern: new RegExp(`${zagNumberInput}|decrement\\(|decrementValue|VALUE\\.DECREMENT`, "i"), evidence: "decrement action evidence was detected." },
    { signal: "set-clamped-value", pattern: new RegExp(`${zagNumberInput}|setClampedValue|clampValue\\(computed\\(["']valueAsNumber["']\\)`, "i"), evidence: "setClampedValue action evidence was detected." },
    { signal: "set-raw-value", pattern: new RegExp(`${zagNumberInput}|setRawValue|parseValue\\(event\\.value`, "i"), evidence: "setRawValue action evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagNumberInput}|setValue\\(|event\\.target\\?\\.value|VALUE\\.SET`, "i"), evidence: "setValue action evidence was detected." },
    { signal: "clear-value", pattern: new RegExp(`${zagNumberInput}|clearValue|context\\.set\\(["']value["'], ["']["']\\)`, "i"), evidence: "clearValue action evidence was detected." },
    { signal: "set-to-max", pattern: new RegExp(`${zagNumberInput}|incrementToMax|setToMax|prop\\(["']max["']\\)`, "i"), evidence: "max value action evidence was detected." },
    { signal: "set-to-min", pattern: new RegExp(`${zagNumberInput}|decrementToMin|setToMin|prop\\(["']min["']\\)`, "i"), evidence: "min value action evidence was detected." },
    { signal: "hint", pattern: new RegExp(`${zagNumberInput}|setHint|clearHint|context\\.set\\(["']hint["']`, "i"), evidence: "hint action evidence was detected." },
    { signal: "focus-callback", pattern: new RegExp(`${zagNumberInput}|invokeOnFocus|onFocusChange.*focused:\\s*true`, "i"), evidence: "focus callback evidence was detected." },
    { signal: "blur-callback", pattern: new RegExp(`${zagNumberInput}|invokeOnBlur|onFocusChange.*focused:\\s*false`, "i"), evidence: "blur callback evidence was detected." },
    { signal: "invalid-callback", pattern: new RegExp(`${zagNumberInput}|invokeOnInvalid|onValueInvalid|rangeOverflow|rangeUnderflow`, "i"), evidence: "invalid callback evidence was detected." },
    { signal: "commit-callback", pattern: new RegExp(`${zagNumberInput}|invokeOnValueCommit|onValueCommit`, "i"), evidence: "value commit callback evidence was detected." },
    { signal: "sync-input", pattern: new RegExp(`${zagNumberInput}|syncInputElement|setElementValue|restoreCursor`, "i"), evidence: "sync input evidence was detected." },
    { signal: "formatted-value", pattern: new RegExp(`${zagNumberInput}|setFormattedValue|computed\\(["']formattedValue["']\\)`, "i"), evidence: "formatted value action evidence was detected." },
    { signal: "cursor-point", pattern: new RegExp(`${zagNumberInput}|setCursorPoint|clearCursorPoint|scrubberCursorPoint`, "i"), evidence: "cursor point action evidence was detected." },
    { signal: "virtual-cursor-position", pattern: new RegExp(`${zagNumberInput}|setVirtualCursorPosition|translate3d`, "i"), evidence: "virtual cursor position evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function numberInputReadinessDomSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["domSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagNumberInput}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "input-id", pattern: new RegExp(`${zagNumberInput}|getInputId|ids\\?\\.input|getInputProps`, "i"), evidence: "input id evidence was detected." },
    { signal: "increment-trigger-id", pattern: new RegExp(`${zagNumberInput}|getIncrementTriggerId|ids\\?\\.incrementTrigger|getIncrementTriggerProps`, "i"), evidence: "increment trigger id evidence was detected." },
    { signal: "decrement-trigger-id", pattern: new RegExp(`${zagNumberInput}|getDecrementTriggerId|ids\\?\\.decrementTrigger|getDecrementTriggerProps`, "i"), evidence: "decrement trigger id evidence was detected." },
    { signal: "scrubber-id", pattern: new RegExp(`${zagNumberInput}|getScrubberId|ids\\?\\.scrubber|getScrubberProps`, "i"), evidence: "scrubber id evidence was detected." },
    { signal: "cursor-id", pattern: new RegExp(`${zagNumberInput}|getCursorId|scrubber--cursor`, "i"), evidence: "cursor id evidence was detected." },
    { signal: "label-id", pattern: new RegExp(`${zagNumberInput}|getLabelId|ids\\?\\.label|getLabelProps`, "i"), evidence: "label id evidence was detected." },
    { signal: "input-el", pattern: new RegExp(`${zagNumberInput}|getInputEl|HTMLInputElement`, "i"), evidence: "input element evidence was detected." },
    { signal: "trigger-el", pattern: new RegExp(`${zagNumberInput}|getIncrementTriggerEl|getDecrementTriggerEl|HTMLButtonElement`, "i"), evidence: "trigger element evidence was detected." },
    { signal: "scrubber-el", pattern: new RegExp(`${zagNumberInput}|getScrubberEl|getScrubberId`, "i"), evidence: "scrubber element evidence was detected." },
    { signal: "cursor-el", pattern: new RegExp(`${zagNumberInput}|getCursorEl|getCursorId`, "i"), evidence: "cursor element evidence was detected." },
    { signal: "pressed-trigger", pattern: new RegExp(`${zagNumberInput}|getPressedTriggerEl|hint === ["']increment["']|hint === ["']decrement["']`, "i"), evidence: "pressed trigger evidence was detected." },
    { signal: "mousemove-value", pattern: new RegExp(`${zagNumberInput}|getMousemoveValue|movementX|isRtl`, "i"), evidence: "mousemove value evidence was detected." },
    { signal: "data-state", pattern: new RegExp(`${zagNumberInput}|data-scrubbing|data-focus|data-invalid|data-disabled`, "i"), evidence: "data state evidence was detected." },
    { signal: "aria-spinbutton", pattern: new RegExp(`${zagNumberInput}|role:\\s*["']spinbutton["']|aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|aria-roledescription`, "i"), evidence: "spinbutton ARIA evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function numberInputReadinessCursorSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["cursorSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["cursorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "record-cursor", pattern: new RegExp(`${zagNumberInput}|recordCursor|selectionStart|selectionEnd`, "i"), evidence: "recordCursor evidence was detected." },
    { signal: "restore-cursor", pattern: new RegExp(`${zagNumberInput}|restoreCursor|setSelectionRange`, "i"), evidence: "restoreCursor evidence was detected." },
    { signal: "next-cursor-position", pattern: new RegExp(`${zagNumberInput}|getNextCursorPosition|oldPosition`, "i"), evidence: "next cursor position evidence was detected." },
    { signal: "selection-range", pattern: new RegExp(`${zagNumberInput}|selectionStart|selectionEnd|setSelectionRange`, "i"), evidence: "selection range evidence was detected." },
    { signal: "prefix-suffix", pattern: new RegExp(`${zagNumberInput}|prefixLength|suffixLength|beforeCursor|afterCursor`, "i"), evidence: "prefix/suffix cursor evidence was detected." },
    { signal: "fallback-end", pattern: new RegExp(`${zagNumberInput}|Fallback to end of input|newValue\\.length|len, len`, "i"), evidence: "fallback cursor-end evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "cursor", "signal");
}

function numberInputReadinessApiSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["apiSignals"] {
  const zagNumberInput = numberInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: NumberInputReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focused", pattern: new RegExp(`${zagNumberInput}|api\\.focused|focused: focused`, "i"), evidence: "focused API evidence was detected." },
    { signal: "invalid", pattern: new RegExp(`${zagNumberInput}|api\\.invalid|invalid: invalid`, "i"), evidence: "invalid API evidence was detected." },
    { signal: "empty", pattern: new RegExp(`${zagNumberInput}|api\\.empty|empty: empty`, "i"), evidence: "empty API evidence was detected." },
    { signal: "value", pattern: new RegExp(`${zagNumberInput}|api\\.value|value: computed\\(["']formattedValue["']\\)`, "i"), evidence: "value API evidence was detected." },
    { signal: "value-as-number", pattern: new RegExp(`${zagNumberInput}|api\\.valueAsNumber|valueAsNumber: computed`, "i"), evidence: "valueAsNumber API evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagNumberInput}|api\\.setValue|setValue\\(value\\)|VALUE\\.SET`, "i"), evidence: "setValue API evidence was detected." },
    { signal: "clear-value", pattern: new RegExp(`${zagNumberInput}|api\\.clearValue|clearValue\\(\\)|VALUE\\.CLEAR`, "i"), evidence: "clearValue API evidence was detected." },
    { signal: "increment", pattern: new RegExp(`${zagNumberInput}|api\\.increment|increment\\(\\)|VALUE\\.INCREMENT`, "i"), evidence: "increment API evidence was detected." },
    { signal: "decrement", pattern: new RegExp(`${zagNumberInput}|api\\.decrement|decrement\\(\\)|VALUE\\.DECREMENT`, "i"), evidence: "decrement API evidence was detected." },
    { signal: "set-to-max", pattern: new RegExp(`${zagNumberInput}|api\\.setToMax|setToMax\\(\\)|prop\\(["']max["']\\)`, "i"), evidence: "setToMax API evidence was detected." },
    { signal: "set-to-min", pattern: new RegExp(`${zagNumberInput}|api\\.setToMin|setToMin\\(\\)|prop\\(["']min["']\\)`, "i"), evidence: "setToMin API evidence was detected." },
    { signal: "focus", pattern: new RegExp(`${zagNumberInput}|api\\.focus|focus\\(\\)|getInputEl\\(scope\\)\\?\\.focus`, "i"), evidence: "focus API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagNumberInput}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: new RegExp(`${zagNumberInput}|getLabelProps`, "i"), evidence: "label props API evidence was detected." },
    { signal: "control-props", pattern: new RegExp(`${zagNumberInput}|getControlProps`, "i"), evidence: "control props API evidence was detected." },
    { signal: "value-text-props", pattern: new RegExp(`${zagNumberInput}|getValueTextProps`, "i"), evidence: "value text props API evidence was detected." },
    { signal: "input-props", pattern: new RegExp(`${zagNumberInput}|getInputProps`, "i"), evidence: "input props API evidence was detected." },
    { signal: "trigger-props", pattern: new RegExp(`${zagNumberInput}|getIncrementTriggerProps|getDecrementTriggerProps`, "i"), evidence: "trigger props API evidence was detected." },
    { signal: "scrubber-props", pattern: new RegExp(`${zagNumberInput}|getScrubberProps`, "i"), evidence: "scrubber props API evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function numberInputReadinessTestSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["testSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|ArrowUp|ArrowDown|Home|End|Enter|keyboard-test/i, evidence: "keyboard test evidence was detected." },
    { signal: "pointer-test", pattern: /user\.pointer|fireEvent\.pointer|pointer-test/i, evidence: "pointer test evidence was detected." },
    { signal: "wheel-test", pattern: /fireEvent\.wheel|wheel-test|allowMouseWheel/i, evidence: "wheel test evidence was detected." },
    { signal: "aria-test", pattern: /aria-valuemin|aria-valuemax|aria-valuenow|aria-valuetext|toHaveAttribute|getByRole/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|number-input-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function numberInputReadinessPackageSignals(sourceFiles: NumberInputReadinessSourceFile[]): NumberInputReadinessReport["packageSignals"] {
  const specs: Array<{ signal: NumberInputReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/number-input", pattern: /@zag-js\/number-input/i, evidence: "@zag-js/number-input dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|setup<NumberInputSchema>|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|addDomEvent|trackFormControl|requestPointerLock|setElementValue|setCaretToEnd/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|LocaleProperties|EventKeyMap/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|clampValue|incrementValue|decrementValue|isValueAtMax|isValueAtMin|isValueWithinRange|roundToDpr/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "@internationalized/number", pattern: /@internationalized\/number|NumberParser/i, evidence: "@internationalized/number evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return numberInputReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function numberInputReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: NumberInputReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/number-input-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildRatingGroupReadinessReport(walk: WalkResult): Promise<RatingGroupReadinessReport> {
  const sourceFiles = await ratingGroupReadinessSourceFiles(walk);
  const ratingGroupSetups = ratingGroupReadinessSetups(sourceFiles);
  const frameworkSignals = ratingGroupReadinessFrameworkSignals(sourceFiles);
  const structureSignals = ratingGroupReadinessStructureSignals(sourceFiles);
  const valueSignals = ratingGroupReadinessValueSignals(sourceFiles);
  const selectionSignals = ratingGroupReadinessSelectionSignals(sourceFiles);
  const interactionSignals = ratingGroupReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = ratingGroupReadinessAccessibilitySignals(sourceFiles);
  const formSignals = ratingGroupReadinessFormSignals(sourceFiles);
  const machineSignals = ratingGroupReadinessMachineSignals(sourceFiles);
  const computedSignals = ratingGroupReadinessComputedSignals(sourceFiles);
  const effectSignals = ratingGroupReadinessEffectSignals(sourceFiles);
  const guardSignals = ratingGroupReadinessGuardSignals(sourceFiles);
  const actionSignals = ratingGroupReadinessActionSignals(sourceFiles);
  const domSignals = ratingGroupReadinessDomSignals(sourceFiles);
  const apiSignals = ratingGroupReadinessApiSignals(sourceFiles);
  const testSignals = ratingGroupReadinessTestSignals(sourceFiles);
  const packageSignals = ratingGroupReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.itemCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.valueCount > 0);
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.halfCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.keyboardCount > 0 || item.pointerCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.accessibilityCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.formCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || ratingGroupSetups.some((item) => item.testCount > 0);

  const riskQueue: RatingGroupReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document rating-group root, label, hidden input, control, and item structure before claiming rating readiness.",
      why: "Rating group readiness starts with traceable radio/radiogroup structure and item state.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace value, defaultValue, hoveredValue, count, items, setValue, clearValue, and item state behavior.",
      why: "Rating groups can diverge between selected value, hovered preview, and displayed item state.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasSelection) {
    riskQueue.push({
      priority: "medium",
      action: "Trace highlighted, half, checked, allow-half, and rounding behavior.",
      why: "Half-rating and hover preview semantics change how selected and highlighted stars are interpreted.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Trace pointer-over, pointer-leave, click, focus/blur, Space, arrow, Home, and End behavior.",
      why: "Rating widgets need both pointer and keyboard paths to update value predictably.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify radiogroup/radio roles, labels, checked state, set size, position, readonly, disabled, required, and direction evidence.",
      why: "Assistive technology relies on radio metadata to announce rating position and selected state.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Trace hidden input, name, form, form-control tracking, reset, and disabled fieldset behavior.",
      why: "Rating groups often submit through hidden inputs and must reset with forms and disabled fieldsets.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, pointer, ARIA, form, half-state, and artifact tests.",
      why: "Static component evidence does not prove hover, half-rating, keyboard, form reset, or ARIA behavior.",
      relatedHref: "html/rating-group-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual rating behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records rating group readiness only; it does not click ratings, hover stars, dispatch keyboard or pointer events, mutate values, submit forms, reset forms, or run analyzed project tests.",
    relatedHref: "html/rating-group-readiness.html"
  });

  return {
    summary: `Rating group readiness report: setup ${ratingGroupSetups.length} files, value signal ${valueSignals.length}, selection signal ${selectionSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Rating group readiness Zag rating-group native radiogroup radio value hover half keyboard pointer form accessibility tests",
    ratingGroupSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    selectionSignals,
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
      { command: "rg \"@zag-js/rating-group|ratingGroup\\.machine|ratingGroup\\.connect|getItemProps|getControlProps|getHiddenInputProps\" package.json src app packages", purpose: "Find Zag rating-group machine, connect API, hidden input, control, and item props." },
      { command: "rg \"role=['\\\"]radiogroup|role=['\\\"]radio|aria-checked|aria-setsize|aria-posinset|data-half|data-highlighted\" src app packages", purpose: "Find native radio/radiogroup structure, checked state, half/highlighted state, and ARIA metadata." },
      { command: "rg \"allowHalf|hoveredValue|getItemState|setValue|clearValue|onValueChange|onHoverChange|ratingValueText\" src app packages", purpose: "Check value, hover, half-star, and translation APIs." },
      { command: "rg \"ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Space|pointer|click|trackFormControl|rating-group-traces|upload-artifact\" src app packages test tests .github", purpose: "Check keyboard, pointer, form tracking, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag rating-group, native radio/radiogroup markup, or a custom rating widget.",
      "Trace root, label, hidden input, control, and item structure before reviewing value state.",
      "Map value/defaultValue, hoveredValue, count, items, setValue, clearValue, and item state behavior.",
      "Check highlighted, half, checked, allow-half, rounding, pointer, keyboard, focus/blur, ARIA, form tracking, reset, and disabled fieldset evidence.",
      "This report is static readiness. Actual rating clicks, hover, keyboard/pointer dispatch, form reset, and project tests need trusted project QA."
    ]
  };
}

type RatingGroupReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function ratingGroupReadinessSourceFiles(walk: WalkResult): Promise<RatingGroupReadinessSourceFile[]> {
  const files: RatingGroupReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !ratingGroupReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!ratingGroupReadinessPathSignal(file.relPath) && !ratingGroupReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function ratingGroupReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return ratingGroupReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function ratingGroupReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(rating-group|rating_group|ratinggroup|rating|stars?|review)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function ratingGroupReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/rating-group|ratingGroup\.machine|ratingGroup\.connect|getItemProps|getHiddenInputProps|role\s*=\s*["']radiogroup|role\s*=\s*["']radio|aria-checked|aria-setsize|hoveredValue|allowHalf|rating-group-traces)/i.test(text);
}

function ratingGroupReadinessSetups(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["ratingGroupSetups"] {
  const rows: RatingGroupReadinessReport["ratingGroupSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(ratingGroup\.machine|ratingGroup\.connect|getRootProps|data-rating-group-root|rating group|radiogroup|<fieldset\b|<div\b)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label\b|<legend\b|aria-label|aria-labelledby|ratingValueText)/gi);
    const hiddenInputCount = countMatches(source.text, /(getHiddenInputProps|type\s*=\s*["']hidden|hiddenInput|hidden input)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|role\s*=\s*["']radiogroup|control|aria-orientation)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|getItemState|role\s*=\s*["']radio|api\.items|items\.map|aria-posinset|aria-setsize)/gi);
    const valueCount = countMatches(source.text, /(value\s*[:=]|defaultValue|hoveredValue|setValue|clearValue|onValueChange|onHoverChange|api\.value|api\.count|api\.items|getItemState)/gi);
    const hoverCount = countMatches(source.text, /(hoveredValue|isHovering|hovering|onHoverChange|POINTER_OVER|GROUP_POINTER_OVER|pointerover|pointerleave|setHoveredValue|clearHoveredValue)/gi);
    const halfCount = countMatches(source.text, /(allowHalf|half|data-half|isMidway|roundValueIfNeeded|0\.5|half star)/gi);
    const keyboardCount = countMatches(source.text, /(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Home|End|Space|onKeyDown|getEventKey|ARROW_LEFT|ARROW_RIGHT|SPACE|HOME|END|user\.keyboard)/gi);
    const pointerCount = countMatches(source.text, /(pointer|onPointer|Pointer|isLeftClick|getEventPoint|getRelativePoint|getPercentValue|isMidway|user\.pointer|click|onClick)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']radiogroup|role\s*=\s*["']radio|aria-roledescription|aria-label|aria-checked|aria-setsize|aria-posinset|aria-readonly|aria-disabled|data-disabled|data-readonly|required|readOnly|disabled|dir\s*[:=]|toHaveAttribute)/gi);
    const formCount = countMatches(source.text, /(name\s*[:=]|form\s*[:=]|getHiddenInputProps|trackFormControl|onFormReset|fieldsetDisabled|disabled fieldset|required|defaultValue)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.keyboard|user\.pointer|getByRole|toHaveAttribute|rating-group-traces|upload-artifact|half-test|form-test)/gi);
    const total = rootCount + labelCount + hiddenInputCount + controlCount + itemCount + valueCount + hoverCount + halfCount + keyboardCount + pointerCount + accessibilityCount + formCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && controlCount > 0 && itemCount > 0 && valueCount > 0 && (keyboardCount > 0 || pointerCount > 0) ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: ratingGroupReadinessFramework(source),
      rootCount,
      labelCount,
      hiddenInputCount,
      controlCount,
      itemCount,
      valueCount,
      hoverCount,
      halfCount,
      keyboardCount,
      pointerCount,
      accessibilityCount,
      formCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, hidden input ${hiddenInputCount}, control ${controlCount}, item ${itemCount}, value ${valueCount}, hover ${hoverCount}, half ${halfCount}, keyboard ${keyboardCount}, pointer ${pointerCount}, accessibility ${accessibilityCount}, form ${formCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.itemCount + b.valueCount + b.hoverCount + b.keyboardCount - (a.itemCount + a.valueCount + a.hoverCount + a.keyboardCount));
}

function ratingGroupReadinessFramework(source: RatingGroupReadinessSourceFile): RatingGroupReadinessReport["ratingGroupSetups"][number]["framework"] {
  if (/@zag-js\/rating-group|ratingGroup\.machine|ratingGroup\.connect|getItemProps|getHiddenInputProps/i.test(source.text)) return "zag-rating-group";
  if (/role\s*=\s*["']radiogroup|role\s*=\s*["']radio|aria-checked|type\s*=\s*["']radio/i.test(source.text)) return "native-radiogroup";
  if (/rating group|rating|stars?|allowHalf|hoveredValue/i.test(source.text)) return "custom";
  return "unknown";
}

function ratingGroupReadinessFrameworkSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-rating-group", pattern: /@zag-js\/rating-group|ratingGroup\.machine|ratingGroup\.connect|getItemProps|getHiddenInputProps/i, evidence: "Zag rating-group evidence was detected." },
    { signal: "native-radiogroup", pattern: /role\s*=\s*["']radiogroup|role\s*=\s*["']radio|aria-checked|type\s*=\s*["']radio/i, evidence: "native radio/radiogroup evidence was detected." },
    { signal: "custom", pattern: /rating group|rating|stars?|allowHalf|hoveredValue/i, evidence: "custom rating evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function ratingGroupReadinessStructureSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["structureSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-rating-group-root|ratingGroup\.machine|<fieldset\b|<div\b/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label\b|<legend\b|aria-label|aria-labelledby/i, evidence: "label evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|type\s*=\s*["']hidden|hiddenInput|hidden input/i, evidence: "hidden input evidence was detected." },
    { signal: "control", pattern: /getControlProps|role\s*=\s*["']radiogroup|aria-orientation|control/i, evidence: "control evidence was detected." },
    { signal: "item", pattern: /getItemProps|getItemState|role\s*=\s*["']radio|api\.items|aria-posinset|aria-setsize/i, evidence: "item evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function ratingGroupReadinessValueSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["valueSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|value:\s*|api\.value|onValueChange/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default value/i, evidence: "default value evidence was detected." },
    { signal: "hovered-value", pattern: /hoveredValue|hovered value|onHoverChange/i, evidence: "hovered value evidence was detected." },
    { signal: "count", pattern: /\bcount\b|api\.count|aria-setsize/i, evidence: "count evidence was detected." },
    { signal: "items", pattern: /api\.items|items:\s*|Array\.from|items\.map/i, evidence: "items evidence was detected." },
    { signal: "set-value", pattern: /setValue|SET_VALUE/i, evidence: "set value evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|CLEAR_VALUE/i, evidence: "clear value evidence was detected." },
    { signal: "item-state", pattern: /getItemState|highlighted|checked|half/i, evidence: "item state evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function ratingGroupReadinessSelectionSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "highlighted", pattern: /highlighted|data-highlighted/i, evidence: "highlighted evidence was detected." },
    { signal: "half", pattern: /\bhalf\b|data-half|isMidway|0\.5/i, evidence: "half rating evidence was detected." },
    { signal: "checked", pattern: /\bchecked\b|aria-checked|data-checked/i, evidence: "checked evidence was detected." },
    { signal: "allow-half", pattern: /allowHalf|allow half/i, evidence: "allow-half evidence was detected." },
    { signal: "rounding", pattern: /roundValueIfNeeded|Math\.round|rounding/i, evidence: "rounding evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function ratingGroupReadinessInteractionSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-over", pattern: /POINTER_OVER|GROUP_POINTER_OVER|pointerover|onPointerMove|user\.pointer/i, evidence: "pointer-over evidence was detected." },
    { signal: "pointer-leave", pattern: /GROUP_POINTER_LEAVE|pointerleave|onPointerLeave/i, evidence: "pointer-leave evidence was detected." },
    { signal: "click", pattern: /\bCLICK\b|onClick|click|isLeftClick/i, evidence: "click evidence was detected." },
    { signal: "focus-blur", pattern: /\bFOCUS\b|\bBLUR\b|onFocus|onBlur|focusActiveRadio|blur/i, evidence: "focus/blur evidence was detected." },
    { signal: "space", pattern: /\bSpace\b|\bSPACE\b/i, evidence: "Space key evidence was detected." },
    { signal: "arrow-left", pattern: /ArrowLeft|ARROW_LEFT|ArrowUp/i, evidence: "arrow-left/up evidence was detected." },
    { signal: "arrow-right", pattern: /ArrowRight|ARROW_RIGHT|ArrowDown/i, evidence: "arrow-right/down evidence was detected." },
    { signal: "home", pattern: /\bHome\b|\bHOME\b/i, evidence: "Home key evidence was detected." },
    { signal: "end", pattern: /\bEnd\b|\bEND\b/i, evidence: "End key evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function ratingGroupReadinessAccessibilitySignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radiogroup", pattern: /role\s*=\s*["']radiogroup|role:\s*["']radiogroup/i, evidence: "radiogroup evidence was detected." },
    { signal: "radio", pattern: /role\s*=\s*["']radio|role:\s*["']radio|type\s*=\s*["']radio/i, evidence: "radio evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby|ratingValueText/i, evidence: "ARIA label evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-setsize", pattern: /aria-setsize/i, evidence: "aria-setsize evidence was detected." },
    { signal: "aria-posinset", pattern: /aria-posinset/i, evidence: "aria-posinset evidence was detected." },
    { signal: "aria-readonly", pattern: /aria-readonly|data-readonly|readOnly|readonly/i, evidence: "readonly evidence was detected." },
    { signal: "disabled-readonly-required", pattern: /disabled|readOnly|readonly|required|aria-disabled|data-disabled/i, evidence: "disabled/readOnly/required evidence was detected." },
    { signal: "dir", pattern: /dir\s*[:=]|rtl|ltr|getEventKey/i, evidence: "direction evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function ratingGroupReadinessFormSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["formSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /\bname\b|name\s*[:=]/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /\bform\b|form\s*[:=]/i, evidence: "form evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|type\s*=\s*["']hidden|hiddenInput/i, evidence: "hidden input evidence was detected." },
    { signal: "track-form-control", pattern: /trackFormControl|track form control/i, evidence: "form-control tracking evidence was detected." },
    { signal: "reset", pattern: /onFormReset|reset/i, evidence: "reset evidence was detected." },
    { signal: "fieldset-disabled", pattern: /fieldsetDisabled|fieldset disabled|onFieldsetDisabledChange/i, evidence: "fieldset-disabled evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function ratingGroupReadinessZagUsagePattern(sourceFiles: RatingGroupReadinessSourceFile[]): string {
  const hasZagRatingGroupUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/rating-group|ratingGroup\.machine|ratingGroup\.connect|getRootProps|getHiddenInputProps|getLabelProps|getControlProps|getItemProps/i.test(source.text));
  return hasZagRatingGroupUsage ? "ratingGroup\\.machine|ratingGroup\\.connect|getRootProps|getHiddenInputProps|getLabelProps|getControlProps|getItemProps" : "(?!)";
}

function ratingGroupReadinessMachineSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["machineSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagRatingGroup}|createMachine|ratingGroup\\.machine`, "i"), evidence: "Zag createMachine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagRatingGroup}|initialState\\(\\)[\\s\\S]{0,80}idle|state:\\s*["']idle["']|\\bidle\\b`, "i"), evidence: "idle state evidence was detected." },
    { signal: "hover-state", pattern: new RegExp(`${zagRatingGroup}|state:\\s*["']hover["']|\\bhover\\b|GROUP_POINTER_OVER`, "i"), evidence: "hover state evidence was detected." },
    { signal: "focus-state", pattern: new RegExp(`${zagRatingGroup}|state:\\s*["']focus["']|\\bfocus\\b|FOCUS`, "i"), evidence: "focus state evidence was detected." },
    { signal: "set-value-event", pattern: new RegExp(`${zagRatingGroup}|SET_VALUE|setValue`, "i"), evidence: "SET_VALUE event evidence was detected." },
    { signal: "clear-value-event", pattern: new RegExp(`${zagRatingGroup}|CLEAR_VALUE|clearValue`, "i"), evidence: "CLEAR_VALUE event evidence was detected." },
    { signal: "group-pointer-over-event", pattern: new RegExp(`${zagRatingGroup}|GROUP_POINTER_OVER|onPointerMove`, "i"), evidence: "GROUP_POINTER_OVER event evidence was detected." },
    { signal: "group-pointer-leave-event", pattern: new RegExp(`${zagRatingGroup}|GROUP_POINTER_LEAVE|onPointerLeave`, "i"), evidence: "GROUP_POINTER_LEAVE event evidence was detected." },
    { signal: "pointer-over-event", pattern: new RegExp(`${zagRatingGroup}|POINTER_OVER|setHoveredValue|getRelativePoint`, "i"), evidence: "POINTER_OVER event evidence was detected." },
    { signal: "click-event", pattern: new RegExp(`${zagRatingGroup}|CLICK|onClick|isLeftClick`, "i"), evidence: "CLICK event evidence was detected." },
    { signal: "focus-blur-events", pattern: new RegExp(`${zagRatingGroup}|FOCUS|BLUR|onFocus|onBlur`, "i"), evidence: "focus/blur event evidence was detected." },
    { signal: "keyboard-events", pattern: new RegExp(`${zagRatingGroup}|SPACE|ARROW_LEFT|ARROW_RIGHT|HOME|END|onKeyDown|getEventKey`, "i"), evidence: "keyboard event evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function ratingGroupReadinessComputedSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["computedSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "interactive", pattern: new RegExp(`${zagRatingGroup}|isInteractive|readOnly|disabled`, "i"), evidence: "interactive computed evidence was detected." },
    { signal: "hovering", pattern: new RegExp(`${zagRatingGroup}|isHovering|hoveredValue|hovering`, "i"), evidence: "hovering computed evidence was detected." },
    { signal: "disabled", pattern: new RegExp(`${zagRatingGroup}|isDisabled|fieldsetDisabled|prop\\(["']disabled["']\\)`, "i"), evidence: "disabled computed evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function ratingGroupReadinessEffectSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["effectSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-form-control", pattern: new RegExp(`${zagRatingGroup}|trackFormControl|trackFormControlState`, "i"), evidence: "trackFormControl effect evidence was detected." },
    { signal: "fieldset-disabled", pattern: new RegExp(`${zagRatingGroup}|onFieldsetDisabledChange|fieldsetDisabled`, "i"), evidence: "fieldset disabled effect evidence was detected." },
    { signal: "form-reset", pattern: new RegExp(`${zagRatingGroup}|onFormReset|context\\.initial\\(["']value["']\\)`, "i"), evidence: "form reset effect evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function ratingGroupReadinessGuardSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["guardSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "interactive", pattern: new RegExp(`${zagRatingGroup}|isInteractive|readOnly|disabled`, "i"), evidence: "interactive guard evidence was detected." },
    { signal: "hovered-value-empty", pattern: new RegExp(`${zagRatingGroup}|isHoveredValueEmpty|hoveredValue.*-1`, "i"), evidence: "hovered value empty guard evidence was detected." },
    { signal: "value-empty", pattern: new RegExp(`${zagRatingGroup}|isValueEmpty|context\\.get\\(["']value["']\\) <= 0`, "i"), evidence: "value empty guard evidence was detected." },
    { signal: "radio-focused", pattern: new RegExp(`${zagRatingGroup}|isRadioFocused|getControlEl\\(scope\\).*contains`, "i"), evidence: "radio focused guard evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function ratingGroupReadinessActionSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["actionSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "clear-hovered-value", pattern: new RegExp(`${zagRatingGroup}|clearHoveredValue|hoveredValue["'], -1`, "i"), evidence: "clearHoveredValue action evidence was detected." },
    { signal: "focus-active-radio", pattern: new RegExp(`${zagRatingGroup}|focusActiveRadio|getRadioEl\\(scope`, "i"), evidence: "focusActiveRadio action evidence was detected." },
    { signal: "set-prev-value", pattern: new RegExp(`${zagRatingGroup}|setPrevValue|Math\\.max\\(0`, "i"), evidence: "setPrevValue action evidence was detected." },
    { signal: "set-next-value", pattern: new RegExp(`${zagRatingGroup}|setNextValue|Math\\.min\\(prop\\(["']count["']\\)`, "i"), evidence: "setNextValue action evidence was detected." },
    { signal: "set-min-value", pattern: new RegExp(`${zagRatingGroup}|setValueToMin|context\\.set\\(["']value["'], 1\\)`, "i"), evidence: "setValueToMin action evidence was detected." },
    { signal: "set-max-value", pattern: new RegExp(`${zagRatingGroup}|setValueToMax|prop\\(["']count["']\\)`, "i"), evidence: "setValueToMax action evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagRatingGroup}|setValue\\(|SET_VALUE`, "i"), evidence: "setValue action evidence was detected." },
    { signal: "clear-value", pattern: new RegExp(`${zagRatingGroup}|clearValue|CLEAR_VALUE|context\\.set\\(["']value["'], -1\\)`, "i"), evidence: "clearValue action evidence was detected." },
    { signal: "set-hovered-value", pattern: new RegExp(`${zagRatingGroup}|setHoveredValue|isMidway|allowHalf`, "i"), evidence: "setHoveredValue action evidence was detected." },
    { signal: "round-value", pattern: new RegExp(`${zagRatingGroup}|roundValueIfNeeded|Math\\.round`, "i"), evidence: "roundValueIfNeeded action evidence was detected." },
    { signal: "dispatch-change-event", pattern: new RegExp(`${zagRatingGroup}|dispatchChangeEvent|dispatchInputValueEvent`, "i"), evidence: "dispatch change event evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function ratingGroupReadinessDomSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["domSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagRatingGroup}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "label-id", pattern: new RegExp(`${zagRatingGroup}|getLabelId|ids\\?\\.label|getLabelProps`, "i"), evidence: "label id evidence was detected." },
    { signal: "hidden-input-id", pattern: new RegExp(`${zagRatingGroup}|getHiddenInputId|ids\\?\\.hiddenInput|getHiddenInputProps`, "i"), evidence: "hidden input id evidence was detected." },
    { signal: "control-id", pattern: new RegExp(`${zagRatingGroup}|getControlId|ids\\?\\.control|getControlProps`, "i"), evidence: "control id evidence was detected." },
    { signal: "item-id", pattern: new RegExp(`${zagRatingGroup}|getItemId|ids\\?\\.item|getItemProps`, "i"), evidence: "item id evidence was detected." },
    { signal: "root-el", pattern: new RegExp(`${zagRatingGroup}|getRootEl|getById\\(getRootId`, "i"), evidence: "root element evidence was detected." },
    { signal: "control-el", pattern: new RegExp(`${zagRatingGroup}|getControlEl|getById\\(getControlId`, "i"), evidence: "control element evidence was detected." },
    { signal: "radio-el", pattern: new RegExp(`${zagRatingGroup}|getRadioEl|\\[role=radio\\]\\[aria-posinset`, "i"), evidence: "radio element evidence was detected." },
    { signal: "hidden-input-el", pattern: new RegExp(`${zagRatingGroup}|getHiddenInputEl|HTMLInputElement`, "i"), evidence: "hidden input element evidence was detected." },
    { signal: "dispatch-change-event", pattern: new RegExp(`${zagRatingGroup}|dispatchChangeEvent|dispatchInputValueEvent`, "i"), evidence: "dispatch change event DOM evidence was detected." },
    { signal: "aria-posinset-query", pattern: new RegExp(`${zagRatingGroup}|aria-posinset|Math\\.ceil\\(value\\)`, "i"), evidence: "aria-posinset query evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function ratingGroupReadinessApiSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["apiSignals"] {
  const zagRatingGroup = ratingGroupReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: RatingGroupReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hovering", pattern: new RegExp(`${zagRatingGroup}|api\\.hovering|hovering: computed\\(["']isHovering["']\\)`, "i"), evidence: "hovering API evidence was detected." },
    { signal: "value", pattern: new RegExp(`${zagRatingGroup}|api\\.value|\\bvalue,`, "i"), evidence: "value API evidence was detected." },
    { signal: "hovered-value", pattern: new RegExp(`${zagRatingGroup}|api\\.hoveredValue|hoveredValue`, "i"), evidence: "hoveredValue API evidence was detected." },
    { signal: "count", pattern: new RegExp(`${zagRatingGroup}|api\\.count|count: prop\\(["']count["']\\)`, "i"), evidence: "count API evidence was detected." },
    { signal: "items", pattern: new RegExp(`${zagRatingGroup}|api\\.items|Array\\.from\\(\\{ length: prop\\(["']count["']\\)`, "i"), evidence: "items API evidence was detected." },
    { signal: "item-state", pattern: new RegExp(`${zagRatingGroup}|api\\.getItemState|getItemState`, "i"), evidence: "item state API evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagRatingGroup}|api\\.setValue|setValue\\(value\\)|SET_VALUE`, "i"), evidence: "setValue API evidence was detected." },
    { signal: "clear-value", pattern: new RegExp(`${zagRatingGroup}|api\\.clearValue|clearValue\\(\\)|CLEAR_VALUE`, "i"), evidence: "clearValue API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagRatingGroup}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "hidden-input-props", pattern: new RegExp(`${zagRatingGroup}|getHiddenInputProps`, "i"), evidence: "hidden input props API evidence was detected." },
    { signal: "label-props", pattern: new RegExp(`${zagRatingGroup}|getLabelProps`, "i"), evidence: "label props API evidence was detected." },
    { signal: "control-props", pattern: new RegExp(`${zagRatingGroup}|getControlProps`, "i"), evidence: "control props API evidence was detected." },
    { signal: "item-props", pattern: new RegExp(`${zagRatingGroup}|getItemProps`, "i"), evidence: "item props API evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function ratingGroupReadinessTestSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["testSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|ArrowLeft|ArrowRight|Home|End|Space|keyboard-test/i, evidence: "keyboard test evidence was detected." },
    { signal: "pointer-test", pattern: /user\.pointer|pointer-test|onPointer/i, evidence: "pointer test evidence was detected." },
    { signal: "aria-test", pattern: /aria-checked|aria-setsize|aria-posinset|toHaveAttribute|getByRole/i, evidence: "ARIA test evidence was detected." },
    { signal: "form-test", pattern: /form-test|trackFormControl|onFormReset|type\s*=\s*["']hidden/i, evidence: "form test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|rating-group-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function ratingGroupReadinessPackageSignals(sourceFiles: RatingGroupReadinessSourceFile[]): RatingGroupReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RatingGroupReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/rating-group", pattern: /@zag-js\/rating-group/i, evidence: "@zag-js/rating-group dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|RatingGroupSchema|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|trackFormControl|dispatchInputValueEvent|getEventKey|getEventPoint|getRelativePoint|isLeftClick/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty|EventKeyMap/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps|createProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return ratingGroupReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function ratingGroupReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RatingGroupReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/rating-group-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
