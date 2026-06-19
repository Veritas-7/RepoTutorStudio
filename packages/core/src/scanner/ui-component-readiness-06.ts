import path from "node:path";
import type { PaginationReadinessReport, PinInputReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildPinInputReadinessReport(walk: WalkResult): Promise<PinInputReadinessReport> {
  const sourceFiles = await pinInputReadinessSourceFiles(walk);
  const pinInputSetups = pinInputReadinessSetups(sourceFiles);
  const frameworkSignals = pinInputReadinessFrameworkSignals(sourceFiles);
  const structureSignals = pinInputReadinessStructureSignals(sourceFiles);
  const valueSignals = pinInputReadinessValueSignals(sourceFiles);
  const validationSignals = pinInputReadinessValidationSignals(sourceFiles);
  const interactionSignals = pinInputReadinessInteractionSignals(sourceFiles);
  const formSignals = pinInputReadinessFormSignals(sourceFiles);
  const accessibilitySignals = pinInputReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = pinInputReadinessMachineSignals(sourceFiles);
  const computedSignals = pinInputReadinessComputedSignals(sourceFiles);
  const guardSignals = pinInputReadinessGuardSignals(sourceFiles);
  const actionSignals = pinInputReadinessActionSignals(sourceFiles);
  const domSignals = pinInputReadinessDomSignals(sourceFiles);
  const apiSignals = pinInputReadinessApiSignals(sourceFiles);
  const testSignals = pinInputReadinessTestSignals(sourceFiles);
  const packageSignals = pinInputReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.inputCount > 0 && item.hiddenInputCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.valueCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.validationCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.interactionCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.formCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || pinInputSetups.some((item) => item.testCount > 0);

  const riskQueue: PinInputReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document pin input root, input slots, hidden input, label, and control boundaries before claiming OTP readiness.",
      why: "Pin input readiness starts with traceable multi-input structure plus hidden form value evidence.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace controlled/default values, valueAsString, completion, count, focused index, and set/clear APIs.",
      why: "OTP and PIN fields are value orchestration components; learners need to see how slot state maps to submitted code.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasValidation) {
    riskQueue.push({
      priority: "high",
      action: "Trace numeric, alpha, alphanumeric, pattern, sanitize, invalid callback, and mask/password handling.",
      why: "Pin inputs must reject invalid characters and safely normalize pasted codes before completion or submit.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add paste, beforeinput/change, backspace/delete, arrow, home/end, enter, focus/blur, and auto-advance evidence.",
      why: "Pin input usability depends on keyboard, paste, deletion, and focus movement semantics across slots.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Document name/form wiring, hidden submit input, auto-submit, requestSubmit, and reset behavior.",
      why: "OTP values often submit through forms; hidden input and reset behavior are part of the user-visible contract.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify group role, per-slot aria labels, inputMode, one-time-code autocomplete, disabled, readonly, and required states.",
      why: "Pin inputs have multiple fields that need clear labels and mobile keyboard/autofill hints.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, paste, form submit/reset, validation, and accessibility tests.",
      why: "Static component evidence does not prove paste normalization, focus movement, form submit, or accessibility behavior.",
      relatedHref: "html/pin-input-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual PIN/OTP behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records pin input readiness only; it does not type codes, paste clipboard data, dispatch keyboard/input events, submit forms, mutate values, move focus, or run analyzed project tests.",
    relatedHref: "html/pin-input-readiness.html"
  });

  return {
    summary: `Pin input readiness report: setup ${pinInputSetups.length} files, value signal ${valueSignals.length}, validation signal ${validationSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Pin input readiness Radix OneTimePasswordField Zag pin-input OTP hidden input paste keyboard validation form submit accessibility tests",
    pinInputSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    validationSignals,
    interactionSignals,
    formSignals,
    accessibilitySignals,
    machineSignals,
    computedSignals,
    guardSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-one-time-password-field|OneTimePasswordField\\.Root|OneTimePasswordField\\.Input|OneTimePasswordField\\.HiddenInput|onValueChange|onAutoSubmit\" package.json src app packages", purpose: "Find Radix OTP root, visible inputs, hidden input, value callback, and auto-submit wiring." },
      { command: "rg \"@zag-js/pin-input|pinInput\\.machine|pinInput\\.connect|getHiddenInputProps|getInputProps|setValueAtIndex|clearValue|onValueComplete|onValueInvalid\" package.json src app packages", purpose: "Find Zag pin-input machine, connect API, hidden/input props, value APIs, and completion/invalid callbacks." },
      { command: "rg \"paste|onBeforeInput|Backspace|Delete|ArrowLeft|ArrowRight|Home|End|Enter|autoSubmit|requestSubmit|reset|one-time-code\" src app packages test tests .github", purpose: "Check keyboard, paste, form submit/reset, and OTP autocomplete evidence." },
      { command: "rg \"axe|toHaveNoViolations|getAllByRole\\(['\\\"]textbox|role=['\\\"]group|aria-label|inputMode|pin-input-traces|upload-artifact\" test tests src app packages .github", purpose: "Check accessibility, role/label, mobile input hints, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Radix OneTimePasswordField, Zag pin-input, native inputs, or a custom PIN component.",
      "Trace root, input slots, hidden input, label, control, and collection boundaries before reviewing behavior.",
      "Map controlled/default value, valueAsString, complete/count/focused index, and set/clear/set-at-index APIs.",
      "Check numeric/alpha/alphanumeric/pattern validation, sanitizer, invalid callbacks, mask/password type, and paste normalization.",
      "Verify paste, beforeinput/change, deletion, arrow/home/end/enter, focus/blur, auto-advance, form submit/reset, and accessibility tests in the source project.",
      "This report is static readiness. Actual typing, paste, keyboard dispatch, focus movement, form submission, and value mutation need project tests or browser QA."
    ]
  };
}

type PinInputReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function pinInputReadinessSourceFiles(walk: WalkResult): Promise<PinInputReadinessSourceFile[]> {
  const files: PinInputReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !pinInputReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!pinInputReadinessPathSignal(file.relPath) && !pinInputReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function pinInputReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return pinInputReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function pinInputReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(pin-input|pin_input|pininput|otp|one-time-password|one_time_password|code-input|code_input|verification-code|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function pinInputReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-one-time-password-field|@zag-js\/pin-input|OneTimePasswordField\.Root|OneTimePasswordField\.Input|OneTimePasswordField\.HiddenInput|pinInput\.machine|pinInput\.connect|getHiddenInputProps|getInputProps|one-time-code|onValueComplete|onAutoSubmit|inputMode|requestSubmit|userEvent\.paste)/i.test(text);
}

function pinInputReadinessSetups(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["pinInputSetups"] {
  const rows: PinInputReadinessReport["pinInputSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(OneTimePasswordField\.Root|pinInput\.machine|pinInput\.connect|getRootProps|data-scope\s*=\s*["']pin-input|role\s*=\s*["']group|pin input|PIN input|OTP)/gi);
    const inputCount = countMatches(source.text, /(OneTimePasswordField\.Input|getInputProps|<input\b|getAllByRole\(['"]textbox|inputMode|data-part\s*=\s*["']input)/gi);
    const hiddenInputCount = countMatches(source.text, /(OneTimePasswordField\.HiddenInput|getHiddenInputProps|type\s*=\s*["']hidden|hidden input|hidden-submit-input|visuallyHiddenStyle)/gi);
    const valueCount = countMatches(source.text, /(valueAsString|onValueChange|onValueComplete|defaultValue|setValueAtIndex|setValue\(|clearValue|complete|count|focusedIndex|VALUE\.SET|VALUE\.CLEAR)/gi);
    const validationCount = countMatches(source.text, /(validationType|numeric|alpha|alphabetic|alphanumeric|pattern|sanitizeValue|onInvalidChange|onValueInvalid|VALUE\.INVALID|mask|password|invalid)/gi);
    const interactionCount = countMatches(source.text, /(onPaste|user\.paste|paste|onBeforeInput|onChange|Backspace|Delete|ArrowLeft|ArrowRight|Home|End|Enter|INPUT\.PASTE|INPUT\.CHANGE|INPUT\.BACKSPACE|focusInput|advanceFocusedIndex|RovingFocusGroup|onFocus|onBlur)/gi);
    const formCount = countMatches(source.text, /(name\s*=|form\s*=|autoSubmit|onAutoSubmit|requestSubmit|HiddenInput|hidden input|reset|addEventListener\(['"]reset|HTMLFormElement|form id)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|role\s*=\s*["']group|getByRole\(['"]group|getAllByRole\(['"]textbox|inputMode|autoComplete\s*=\s*["']one-time-code|one-time-code|disabled|readOnly|required|aria-invalid|axe|toHaveNoViolations)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|vitest-axe|axe|keyboard|paste|requestSubmit|reset|getAllByRole|pin-input-traces|upload-artifact)/gi);
    const total = rootCount + inputCount + hiddenInputCount + valueCount + validationCount + interactionCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && inputCount > 0 && hiddenInputCount > 0 && valueCount > 0 && validationCount > 0 && interactionCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: pinInputReadinessFramework(source),
      rootCount,
      inputCount,
      hiddenInputCount,
      valueCount,
      validationCount,
      interactionCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, input ${inputCount}, hidden input ${hiddenInputCount}, value ${valueCount}, validation ${validationCount}, interaction ${interactionCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.rootCount + b.inputCount + b.hiddenInputCount + b.valueCount + b.validationCount - (a.rootCount + a.inputCount + a.hiddenInputCount + a.valueCount + a.validationCount));
}

function pinInputReadinessFramework(source: PinInputReadinessSourceFile): PinInputReadinessReport["pinInputSetups"][number]["framework"] {
  if (/@radix-ui\/react-one-time-password-field|OneTimePasswordField\.Root|OneTimePasswordField\.Input|OneTimePasswordField\.HiddenInput/i.test(source.text)) return "radix-otp";
  if (/@zag-js\/pin-input|pinInput\.machine|pinInput\.connect|getInputProps|getHiddenInputProps/i.test(source.text)) return "zag-pin-input";
  if (/<input\b|HTMLInputElement|getAllByRole\(['"]textbox/i.test(source.text)) return "native-input";
  if (/pin input|PIN input|otp|one-time-code|verification code/i.test(source.text)) return "custom";
  return "unknown";
}

function pinInputReadinessFrameworkSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-otp", pattern: /@radix-ui\/react-one-time-password-field|OneTimePasswordField\.Root|OneTimePasswordField\.Input|OneTimePasswordField\.HiddenInput/i, evidence: "Radix OneTimePasswordField evidence was detected." },
    { signal: "zag-pin-input", pattern: /@zag-js\/pin-input|pinInput\.machine|pinInput\.connect|getInputProps|getHiddenInputProps/i, evidence: "Zag pin-input evidence was detected." },
    { signal: "native-input", pattern: /<input\b|HTMLInputElement|getAllByRole\(['"]textbox|inputMode/i, evidence: "native input evidence was detected." },
    { signal: "custom", pattern: /pin input|PIN input|otp|one-time-code|verification code/i, evidence: "custom PIN/OTP evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function pinInputReadinessStructureSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["structureSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /OneTimePasswordField\.Root|getRootProps|data-part\s*=\s*["']root|role\s*=\s*["']group|root\b/i, evidence: "root evidence was detected." },
    { signal: "input", pattern: /OneTimePasswordField\.Input|getInputProps|<input\b|data-part\s*=\s*["']input/i, evidence: "input evidence was detected." },
    { signal: "hidden-input", pattern: /OneTimePasswordField\.HiddenInput|getHiddenInputProps|type\s*=\s*["']hidden|hidden input|visuallyHiddenStyle/i, evidence: "hidden input evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label\b|aria-label|label\b/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part\s*=\s*["']control|control\b/i, evidence: "control evidence was detected." },
    { signal: "collection", pattern: /createCollection|useCollection|Collection\.Provider|RovingFocusGroup|items\.map|api\.items/i, evidence: "collection evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function pinInputReadinessValueSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["valueSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|onValueChange|context\.get\(["']value|valueProp/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|defaultProp|defaultProp:/i, evidence: "default value evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|join\(["']{0,1}["']{0,1}\)|value\.join/i, evidence: "valueAsString evidence was detected." },
    { signal: "complete", pattern: /complete|isValueComplete|onValueComplete|data-complete/i, evidence: "completion evidence was detected." },
    { signal: "count", pattern: /count|valueLength|items: Array\.from|context\.get\(["']count/i, evidence: "count evidence was detected." },
    { signal: "focused-index", pattern: /focusedIndex|setFocusedIndex|setFocusIndexToFirst|focusedValue/i, evidence: "focused index evidence was detected." },
    { signal: "set-value", pattern: /setValue\(|VALUE\.SET|setValueAtIndex|onValueChange/i, evidence: "set value evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|VALUE\.CLEAR|CLEAR_CHAR|CLEAR\b/i, evidence: "clear value evidence was detected." },
    { signal: "set-index", pattern: /setValueAtIndex|index\s*[:=]|data-index|getInputProps\(\{\s*index/i, evidence: "index-specific value evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function pinInputReadinessValidationSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["validationSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "numeric", pattern: /numeric|inputMode\s*=\s*["']numeric|type:\s*["']numeric|\\d\{1\}/i, evidence: "numeric validation evidence was detected." },
    { signal: "alpha", pattern: /alpha|alphabetic|a-zA-Z/i, evidence: "alpha validation evidence was detected." },
    { signal: "alphanumeric", pattern: /alphanumeric|a-zA-Z0-9/i, evidence: "alphanumeric validation evidence was detected." },
    { signal: "pattern", pattern: /pattern|isValidValue|regexp|RegExp/i, evidence: "pattern validation evidence was detected." },
    { signal: "sanitize", pattern: /sanitizeValue|removeWhitespace|replace\(|transformer/i, evidence: "sanitize evidence was detected." },
    { signal: "invalid", pattern: /onInvalidChange|onValueInvalid|VALUE\.INVALID|aria-invalid|data-invalid|invalid/i, evidence: "invalid state evidence was detected." },
    { signal: "mask", pattern: /mask|password|type\s*=\s*["']password|type:\s*["']password/i, evidence: "mask/password evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function pinInputReadinessInteractionSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "paste", pattern: /onPaste|INPUT\.PASTE|user\.paste|clipboardData|paste/i, evidence: "paste evidence was detected." },
    { signal: "before-input", pattern: /onBeforeInput|beforeinput|getBeforeInputValue/i, evidence: "beforeinput evidence was detected." },
    { signal: "change", pattern: /onChange|INPUT\.CHANGE|setFocusedValue|syncInputValue/i, evidence: "change evidence was detected." },
    { signal: "backspace", pattern: /Backspace|INPUT\.BACKSPACE|CLEAR_CHAR/i, evidence: "Backspace evidence was detected." },
    { signal: "delete", pattern: /Delete|deleteContentBackward|deleteByCut|INPUT\.DELETE/i, evidence: "Delete evidence was detected." },
    { signal: "arrow-left", pattern: /ArrowLeft|INPUT\.ARROW_LEFT|setPrevFocusedIndex/i, evidence: "ArrowLeft evidence was detected." },
    { signal: "arrow-right", pattern: /ArrowRight|INPUT\.ARROW_RIGHT|setNextFocusedIndex/i, evidence: "ArrowRight evidence was detected." },
    { signal: "home", pattern: /Home|INPUT\.HOME|setFocusIndexToFirst/i, evidence: "Home evidence was detected." },
    { signal: "end", pattern: /End|INPUT\.END|setFocusIndexToLast/i, evidence: "End evidence was detected." },
    { signal: "enter", pattern: /Enter|INPUT\.ENTER|requestFormSubmit/i, evidence: "Enter evidence was detected." },
    { signal: "focus-blur", pattern: /onFocus|onBlur|focusInput|blurFocusedInput|selectOnFocus|autoFocus/i, evidence: "focus/blur evidence was detected." },
    { signal: "auto-advance", pattern: /advanceFocusedIndex|INPUT\.ADVANCE|focus should have moved|move to next|auto-advance/i, evidence: "auto-advance evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function pinInputReadinessFormSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["formSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /name\s*=|name:|prop\(["']name|getHiddenInputProps/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /form\s*=|form:|prop\(["']form|HTMLFormElement|<form\b/i, evidence: "form evidence was detected." },
    { signal: "auto-submit", pattern: /autoSubmit|onAutoSubmit|autoSubmitIfNeeded/i, evidence: "auto-submit evidence was detected." },
    { signal: "request-submit", pattern: /requestSubmit|requestFormSubmit/i, evidence: "requestSubmit evidence was detected." },
    { signal: "hidden-submit-input", pattern: /HiddenInput|getHiddenInputProps|type\s*=\s*["']hidden|hidden input|visuallyHiddenStyle/i, evidence: "hidden submit input evidence was detected." },
    { signal: "reset", pattern: /reset|addEventListener\(['"]reset|form\.reset|CLEAR.*Reset/i, evidence: "reset evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function pinInputReadinessAccessibilitySignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|inputLabel|translations|label/i, evidence: "aria-label/label evidence was detected." },
    { signal: "group-role", pattern: /role\s*=\s*["']group|getByRole\(["']group/i, evidence: "group role evidence was detected." },
    { signal: "input-mode", pattern: /inputMode|inputmode/i, evidence: "inputMode evidence was detected." },
    { signal: "autocomplete-one-time-code", pattern: /autoComplete\s*=\s*["']one-time-code|one-time-code|otp:\s*true|otp\b/i, evidence: "one-time-code autocomplete evidence was detected." },
    { signal: "disabled", pattern: /disabled|data-disabled|toBeDisabled/i, evidence: "disabled evidence was detected." },
    { signal: "readonly", pattern: /readOnly|readonly|data-readonly/i, evidence: "readonly evidence was detected." },
    { signal: "required", pattern: /required|data-required/i, evidence: "required evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function pinInputReadinessZagUsagePattern(sourceFiles: PinInputReadinessSourceFile[]): string {
  const hasZagPinInputUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/pin-input|pinInput\.machine|pinInput\.connect|getRootProps|getLabelProps|getHiddenInputProps|getControlProps|getInputProps/i.test(source.text));
  return hasZagPinInputUsage ? "pinInput\\.machine|pinInput\\.connect|getRootProps|getLabelProps|getHiddenInputProps|getControlProps|getInputProps" : "(?!)";
}

function pinInputReadinessMachineSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["machineSignals"] {
  const zagPinInput = pinInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PinInputReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagPinInput}|createMachine|setup<PinInputSchema>`, "i"), evidence: "Zag createMachine/pinInput.machine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagPinInput}|initialState\\(\\)[\\s\\S]{0,80}idle|state:\\s*["']idle["']|\\bidle\\b`, "i"), evidence: "idle state evidence was detected." },
    { signal: "focused-state", pattern: new RegExp(`${zagPinInput}|state:\\s*["']focused["']|\\bfocused\\b|INPUT\\.FOCUS`, "i"), evidence: "focused state evidence was detected." },
    { signal: "value-set-event", pattern: new RegExp(`${zagPinInput}|VALUE\\.SET|setValueAtIndex|setValue\\(`, "i"), evidence: "VALUE.SET event evidence was detected." },
    { signal: "value-clear-event", pattern: new RegExp(`${zagPinInput}|VALUE\\.CLEAR|clearValue`, "i"), evidence: "VALUE.CLEAR event evidence was detected." },
    { signal: "input-focus-event", pattern: new RegExp(`${zagPinInput}|INPUT\\.FOCUS|onFocus|setFocusedIndex`, "i"), evidence: "INPUT.FOCUS event evidence was detected." },
    { signal: "input-change-event", pattern: new RegExp(`${zagPinInput}|INPUT\\.CHANGE|onChange|setFocusedValue`, "i"), evidence: "INPUT.CHANGE event evidence was detected." },
    { signal: "input-paste-event", pattern: new RegExp(`${zagPinInput}|INPUT\\.PASTE|onPaste|setPastedValue`, "i"), evidence: "INPUT.PASTE event evidence was detected." },
    { signal: "input-keyboard-events", pattern: new RegExp(`${zagPinInput}|INPUT\\.ARROW_(?:LEFT|RIGHT)|INPUT\\.HOME|INPUT\\.END|INPUT\\.BACKSPACE|INPUT\\.DELETE|INPUT\\.ENTER|onKeyDown|Backspace|Delete|ArrowLeft|ArrowRight|Home|End|Enter`, "i"), evidence: "keyboard event evidence was detected." },
    { signal: "value-invalid-event", pattern: new RegExp(`${zagPinInput}|VALUE\\.INVALID|onValueInvalid|invokeOnInvalid`, "i"), evidence: "VALUE.INVALID event evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function pinInputReadinessComputedSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["computedSignals"] {
  const zagPinInput = pinInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PinInputReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "normalized-value", pattern: new RegExp(`${zagPinInput}|_value|fill\\(context\\.get\\(["']value["']\\)`, "i"), evidence: "normalized value evidence was detected." },
    { signal: "value-length", pattern: new RegExp(`${zagPinInput}|valueLength|computed\\(["']valueLength["']\\)`, "i"), evidence: "value length evidence was detected." },
    { signal: "filled-value-length", pattern: new RegExp(`${zagPinInput}|filledValueLength|filter\\(\\(v\\)`, "i"), evidence: "filled value length evidence was detected." },
    { signal: "is-value-complete", pattern: new RegExp(`${zagPinInput}|isValueComplete|complete\\b|data-complete`, "i"), evidence: "complete computed evidence was detected." },
    { signal: "value-as-string", pattern: new RegExp(`${zagPinInput}|valueAsString|join\\(["']["']\\)`, "i"), evidence: "valueAsString evidence was detected." },
    { signal: "focused-value", pattern: new RegExp(`${zagPinInput}|focusedValue|focusedIndex`, "i"), evidence: "focused value evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function pinInputReadinessGuardSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["guardSignals"] {
  const zagPinInput = pinInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PinInputReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auto-focus", pattern: new RegExp(`${zagPinInput}|autoFocus|guard:\\s*["']autoFocus["']`, "i"), evidence: "autoFocus guard evidence was detected." },
    { signal: "has-value", pattern: new RegExp(`${zagPinInput}|hasValue|focusedValue`, "i"), evidence: "hasValue guard evidence was detected." },
    { signal: "is-value-complete", pattern: new RegExp(`${zagPinInput}|isValueComplete|complete\\b`, "i"), evidence: "isValueComplete guard evidence was detected." },
    { signal: "has-index", pattern: new RegExp(`${zagPinInput}|hasIndex|event\\.index`, "i"), evidence: "hasIndex guard evidence was detected." },
    { signal: "valid-value", pattern: new RegExp(`${zagPinInput}|isValidValue|isValidType|pattern|sanitizeValue|numeric|alphabetic|alphanumeric`, "i"), evidence: "valid value evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function pinInputReadinessActionSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["actionSignals"] {
  const zagPinInput = pinInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PinInputReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-input-count", pattern: new RegExp(`${zagPinInput}|setInputCount|context\\.set\\(["']count["']`, "i"), evidence: "setInputCount action evidence was detected." },
    { signal: "focus-input", pattern: new RegExp(`${zagPinInput}|focusInput|getInputElAtIndex|preventScroll`, "i"), evidence: "focusInput action evidence was detected." },
    { signal: "select-input", pattern: new RegExp(`${zagPinInput}|selectInputIfNeeded|selectOnFocus|\\.select\\(\\)`, "i"), evidence: "select input action evidence was detected." },
    { signal: "invoke-complete", pattern: new RegExp(`${zagPinInput}|invokeOnComplete|onValueComplete`, "i"), evidence: "complete callback action evidence was detected." },
    { signal: "invoke-invalid", pattern: new RegExp(`${zagPinInput}|invokeOnInvalid|onValueInvalid`, "i"), evidence: "invalid callback action evidence was detected." },
    { signal: "dispatch-input-event", pattern: new RegExp(`${zagPinInput}|dispatchInputEvent|dispatchInputValueEvent`, "i"), evidence: "dispatch input event action evidence was detected." },
    { signal: "sync-input-elements", pattern: new RegExp(`${zagPinInput}|syncInputElements|syncInputValue|setInputValue`, "i"), evidence: "sync input elements action evidence was detected." },
    { signal: "request-form-submit", pattern: new RegExp(`${zagPinInput}|requestFormSubmit|requestSubmit`, "i"), evidence: "request form submit action evidence was detected." },
    { signal: "auto-submit", pattern: new RegExp(`${zagPinInput}|autoSubmitIfNeeded|autoSubmit`, "i"), evidence: "auto-submit action evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function pinInputReadinessDomSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["domSignals"] {
  const zagPinInput = pinInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PinInputReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagPinInput}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "input-id", pattern: new RegExp(`${zagPinInput}|getInputId|ids\\?\\.input|getInputProps`, "i"), evidence: "input id evidence was detected." },
    { signal: "hidden-input-id", pattern: new RegExp(`${zagPinInput}|getHiddenInputId|ids\\?\\.hiddenInput|getHiddenInputProps`, "i"), evidence: "hidden input id evidence was detected." },
    { signal: "label-id", pattern: new RegExp(`${zagPinInput}|getLabelId|ids\\?\\.label|getLabelProps`, "i"), evidence: "label id evidence was detected." },
    { signal: "control-id", pattern: new RegExp(`${zagPinInput}|getControlId|ids\\?\\.control|getControlProps`, "i"), evidence: "control id evidence was detected." },
    { signal: "input-elements", pattern: new RegExp(`${zagPinInput}|getInputEls|getInputElAtIndex|getFirstInputEl|data-ownedby`, "i"), evidence: "input element query evidence was detected." },
    { signal: "data-complete", pattern: new RegExp(`${zagPinInput}|data-complete|complete\\b`, "i"), evidence: "data-complete evidence was detected." },
    { signal: "data-ownedby", pattern: new RegExp(`${zagPinInput}|data-ownedby|ownedby`, "i"), evidence: "data-ownedby evidence was detected." },
    { signal: "data-invalid", pattern: new RegExp(`${zagPinInput}|data-invalid|aria-invalid|invalid`, "i"), evidence: "data-invalid evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function pinInputReadinessApiSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["apiSignals"] {
  const zagPinInput = pinInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PinInputReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focus", pattern: new RegExp(`${zagPinInput}|api\\.focus|focus\\(\\)|getFirstInputEl`, "i"), evidence: "focus API evidence was detected." },
    { signal: "items", pattern: new RegExp(`${zagPinInput}|api\\.items|Array\\.from\\(\\{ length: context\\.get\\(["']count["']\\)`, "i"), evidence: "items API evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagPinInput}|api\\.setValue|setValue\\(`, "i"), evidence: "setValue API evidence was detected." },
    { signal: "clear-value", pattern: new RegExp(`${zagPinInput}|api\\.clearValue|clearValue`, "i"), evidence: "clearValue API evidence was detected." },
    { signal: "set-value-at-index", pattern: new RegExp(`${zagPinInput}|api\\.setValueAtIndex|setValueAtIndex`, "i"), evidence: "setValueAtIndex API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagPinInput}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: new RegExp(`${zagPinInput}|getLabelProps`, "i"), evidence: "label props API evidence was detected." },
    { signal: "hidden-input-props", pattern: new RegExp(`${zagPinInput}|getHiddenInputProps`, "i"), evidence: "hidden input props API evidence was detected." },
    { signal: "control-props", pattern: new RegExp(`${zagPinInput}|getControlProps`, "i"), evidence: "control props API evidence was detected." },
    { signal: "input-props", pattern: new RegExp(`${zagPinInput}|getInputProps`, "i"), evidence: "input props API evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function pinInputReadinessTestSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["testSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\.keyboard|user\.paste/i, evidence: "user-event evidence was detected." },
    { signal: "axe", pattern: /vitest-axe|axe\(|toHaveNoViolations/i, evidence: "axe test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard|ArrowLeft|ArrowRight|Backspace|Delete|Home|End|Enter/i, evidence: "keyboard test evidence was detected." },
    { signal: "paste-test", pattern: /paste|clipboardData|user\.paste/i, evidence: "paste test evidence was detected." },
    { signal: "form-test", pattern: /requestSubmit|HTMLFormElement|form\)|reset\(/i, evidence: "form test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|pin-input-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function pinInputReadinessPackageSignals(sourceFiles: PinInputReadinessSourceFile[]): PinInputReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PinInputReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-one-time-password-field", pattern: /@radix-ui\/react-one-time-password-field/i, evidence: "@radix-ui/react-one-time-password-field dependency evidence was detected." },
    { signal: "@zag-js/pin-input", pattern: /@zag-js\/pin-input/i, evidence: "@zag-js/pin-input dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|setup<PinInputSchema>|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|dispatchInputValueEvent|getBeforeInputValue|getEventKey|visuallyHiddenStyle|queryAll/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty|EventKeyMap/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps|setValueAtIndex|isEqual|invariant/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return pinInputReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function pinInputReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PinInputReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/pin-input-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildPaginationReadinessReport(walk: WalkResult): Promise<PaginationReadinessReport> {
  const sourceFiles = await paginationReadinessSourceFiles(walk);
  const paginationSetups = paginationReadinessSetups(sourceFiles);
  const frameworkSignals = paginationReadinessFrameworkSignals(sourceFiles);
  const structureSignals = paginationReadinessStructureSignals(sourceFiles);
  const stateSignals = paginationReadinessStateSignals(sourceFiles);
  const navigationSignals = paginationReadinessNavigationSignals(sourceFiles);
  const renderSignals = paginationReadinessRenderSignals(sourceFiles);
  const accessibilitySignals = paginationReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = paginationReadinessMachineSignals(sourceFiles);
  const computedSignals = paginationReadinessComputedSignals(sourceFiles);
  const guardSignals = paginationReadinessGuardSignals(sourceFiles);
  const actionSignals = paginationReadinessActionSignals(sourceFiles);
  const rangeSignals = paginationReadinessRangeSignals(sourceFiles);
  const domSignals = paginationReadinessDomSignals(sourceFiles);
  const apiSignals = paginationReadinessApiSignals(sourceFiles);
  const testSignals = paginationReadinessTestSignals(sourceFiles);
  const packageSignals = paginationReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || paginationSetups.some((item) => item.itemCount > 0 && item.triggerCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || paginationSetups.some((item) => item.pageStateCount > 0);
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready") || paginationSetups.some((item) => item.navigationCount > 0);
  const hasRendering = renderSignals.some((item) => item.readiness === "ready") || paginationSetups.some((item) => item.linkCount > 0 || item.ellipsisCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || paginationSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || paginationSetups.some((item) => item.testCount > 0);

  const riskQueue: PaginationReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document pagination root, items, ellipsis, and first/previous/next/last controls before claiming pagination readiness.",
      why: "Pagination readiness starts with traceable page controls and visible navigation boundaries.",
      relatedHref: "html/pagination-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Trace page, default page, page size, total pages, page count, row count, page range, manual pagination, and auto-reset behavior.",
      why: "Pagination state determines which rows or pages are visible and whether controls can be trusted.",
      relatedHref: "html/pagination-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasNavigation) {
    riskQueue.push({
      priority: "high",
      action: "Trace set-page, set-page-size, first/previous/next/last page, can-next/prev, clamp, and slice behavior.",
      why: "Pagination controls must not navigate outside valid ranges or desynchronize page size and page index.",
      relatedHref: "html/pagination-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasRendering) {
    riskQueue.push({
      priority: "medium",
      action: "Document button vs link mode, href generation, selected/current page, disabled state, ellipsis, page options, and row model evidence.",
      why: "Rendering choices change accessibility, routing, and table row slicing semantics.",
      relatedHref: "html/pagination-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Verify aria-label, aria-current, data-selected, data-disabled, translations, and text direction evidence.",
      why: "Pagination controls need clear labels and current/disabled semantics for keyboard and assistive technology users.",
      relatedHref: "html/pagination-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, disabled, current page, row model, page size, and artifact tests.",
      why: "Static component evidence does not prove boundary navigation, disabled states, or table row slicing behavior.",
      relatedHref: "html/pagination-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual pagination behavior in the analyzed project with trusted component tests, router checks, or browser QA outside RepoTutor.",
    why: "RepoTutor records pagination readiness only; it does not click page controls, change page state, fetch server pages, slice live data, follow pagination links, mutate table state, or run analyzed project tests.",
    relatedHref: "html/pagination-readiness.html"
  });

  return {
    summary: `Pagination readiness report: setup ${paginationSetups.length} files, state signal ${stateSignals.length}, navigation signal ${navigationSignals.length}, render signal ${renderSignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Pagination readiness Zag pagination TanStack table page pageSize totalPages pageRange next previous first last aria-current disabled tests",
    paginationSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    navigationSignals,
    renderSignals,
    accessibilitySignals,
    machineSignals,
    computedSignals,
    guardSignals,
    actionSignals,
    rangeSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/pagination|pagination\\.machine|pagination\\.connect|getItemProps|getNextTriggerProps|getPrevTriggerProps|getPageUrl\" package.json src app packages", purpose: "Find Zag pagination machine, connect API, item/trigger props, and link URL generation." },
      { command: "rg \"@tanstack/react-table|useReactTable|getPaginationRowModel|manualPagination|rowCount|pageCount|onPaginationChange\" package.json src app packages", purpose: "Find TanStack Table pagination state, row model, server pagination, and count wiring." },
      { command: "rg \"pageIndex|pageSize|setPageIndex|setPageSize|firstPage|previousPage|nextPage|lastPage|getCanNextPage|getCanPreviousPage\" src app packages test tests", purpose: "Check page state, page size, and boundary navigation APIs." },
      { command: "rg \"aria-current|aria-label|data-selected|data-disabled|disabled|ellipsis|page-options|pagination-traces|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility, disabled/current rendering, ellipsis/page options, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag pagination, TanStack Table pagination, native controls, router links, or a custom pagination component.",
      "Trace root, item, ellipsis, and first/previous/next/last trigger structure before reviewing state.",
      "Map page/defaultPage/pageSize/defaultPageSize, total pages, page count, row count, page range, manual pagination, and auto-reset behavior.",
      "Check set-page, set-page-size, first/previous/next/last navigation, can-next/prev guards, clamp behavior, and slice/row-model boundaries.",
      "Verify button vs link mode, href generation, selected/current state, disabled state, ellipsis, page options, and table row-model tests.",
      "This report is static readiness. Actual clicking, page state mutation, live data slicing, server fetches, link following, and table state changes need project tests or browser QA."
    ]
  };
}

type PaginationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function paginationReadinessSourceFiles(walk: WalkResult): Promise<PaginationReadinessSourceFile[]> {
  const files: PaginationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !paginationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!paginationReadinessPathSignal(file.relPath) && !paginationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function paginationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return paginationReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function paginationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(pagination|paginator|pager|page-nav|page_navigation|data-table|datatable|table|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function paginationReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/pagination|pagination\.machine|pagination\.connect|getItemProps|getNextTriggerProps|getPrevTriggerProps|getPaginationRowModel|manualPagination|pageIndex|pageSize|setPageIndex|setPageSize|aria-current|pagination-traces)/i.test(text);
}

function paginationReadinessSetups(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["paginationSetups"] {
  const rows: PaginationReadinessReport["paginationSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(pagination\.machine|pagination\.connect|getRootProps|useReactTable|<nav\b|role\s*=\s*["']navigation|aria-label\s*=\s*["'][^"']*pag|pagination\b)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|api\.pages|page\.type\s*===\s*["']page|pageOptions|getPageOptions|page item|aria-current)/gi);
    const triggerCount = countMatches(source.text, /(getFirstTriggerProps|getPrevTriggerProps|getNextTriggerProps|getLastTriggerProps|firstPage|previousPage|nextPage|lastPage|Prev|Next|First|Last|<button\b|<a\b)/gi);
    const ellipsisCount = countMatches(source.text, /(getEllipsisProps|ellipsis|\.{3}|page\.type\s*===\s*["']ellipsis)/gi);
    const pageStateCount = countMatches(source.text, /(pageIndex|page\s*[:=]|defaultPage|setPageIndex|setPage\(|onPageChange|pagination\s*[:=]|PaginationState|state:\s*\{\s*pagination)/gi);
    const pageSizeCount = countMatches(source.text, /(pageSize|defaultPageSize|setPageSize|onPageSizeChange|page size|select\s+value)/gi);
    const rangeCount = countMatches(source.text, /(totalPages|pageCount|rowCount|pageRange|getPageCount|getPageOptions|pageOptions|pageStart|pageEnd|range)/gi);
    const navigationCount = countMatches(source.text, /(goToNextPage|goToPrevPage|goToFirstPage|goToLastPage|firstPage\(|previousPage\(|nextPage\(|lastPage\(|getCanNextPage|getCanPreviousPage|canGoToNextPage|canGoToPrevPage|setPageIndex|setPageSize|clampPage|slice\()/gi);
    const linkCount = countMatches(source.text, /(type:\s*["']link|href|getPageUrl|<a\b|link mode|button mode|type\s*=\s*["']button)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|aria-current|data-selected|data-disabled|disabled|translations|rootLabel|itemLabel|dir\s*[:=]|toBeDisabled|toHaveAttribute)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|click|getByRole|toHaveAttribute|toBeDisabled|row model|pagination-traces|upload-artifact)/gi);
    const total = rootCount + itemCount + triggerCount + ellipsisCount + pageStateCount + pageSizeCount + rangeCount + navigationCount + linkCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && (itemCount > 0 || rangeCount > 0) && pageStateCount > 0 && pageSizeCount > 0 && navigationCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: paginationReadinessFramework(source),
      rootCount,
      itemCount,
      triggerCount,
      ellipsisCount,
      pageStateCount,
      pageSizeCount,
      rangeCount,
      navigationCount,
      linkCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, item ${itemCount}, trigger ${triggerCount}, ellipsis ${ellipsisCount}, page state ${pageStateCount}, page size ${pageSizeCount}, range ${rangeCount}, navigation ${navigationCount}, link ${linkCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.rootCount + b.pageStateCount + b.navigationCount + b.rangeCount - (a.rootCount + a.pageStateCount + a.navigationCount + a.rangeCount));
}

function paginationReadinessFramework(source: PaginationReadinessSourceFile): PaginationReadinessReport["paginationSetups"][number]["framework"] {
  if (/@zag-js\/pagination|pagination\.machine|pagination\.connect|getItemProps|getNextTriggerProps|getPageUrl/i.test(source.text)) return "zag-pagination";
  if (/@tanstack\/react-table|@tanstack\/table-core|useReactTable|getPaginationRowModel|manualPagination|pageIndex|rowCount/i.test(source.text)) return "tanstack-table";
  if (/<button\b|<a\b|<nav\b|aria-current|disabled/i.test(source.text)) return "native-controls";
  if (/pagination|paginator|pager|page navigation/i.test(source.text)) return "custom";
  return "unknown";
}

function paginationReadinessFrameworkSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-pagination", pattern: /@zag-js\/pagination|pagination\.machine|pagination\.connect|getItemProps|getNextTriggerProps|getPageUrl/i, evidence: "Zag pagination evidence was detected." },
    { signal: "tanstack-table", pattern: /@tanstack\/react-table|@tanstack\/table-core|useReactTable|getPaginationRowModel|manualPagination|pageIndex|rowCount/i, evidence: "TanStack Table pagination evidence was detected." },
    { signal: "native-controls", pattern: /<button\b|<a\b|<nav\b|aria-current|disabled/i, evidence: "native pagination control evidence was detected." },
    { signal: "custom", pattern: /pagination|paginator|pager|page navigation/i, evidence: "custom pagination evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function paginationReadinessStructureSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["structureSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|<nav\b|role\s*=\s*["']navigation|useReactTable|pagination\.machine/i, evidence: "root evidence was detected." },
    { signal: "item", pattern: /getItemProps|api\.pages|page\.type\s*===\s*["']page|pageOptions|getPageOptions|aria-current/i, evidence: "item evidence was detected." },
    { signal: "ellipsis", pattern: /getEllipsisProps|ellipsis|\.{3}|page\.type\s*===\s*["']ellipsis/i, evidence: "ellipsis evidence was detected." },
    { signal: "first-trigger", pattern: /getFirstTriggerProps|goToFirstPage|firstPage\(|First page|First/i, evidence: "first trigger evidence was detected." },
    { signal: "prev-trigger", pattern: /getPrevTriggerProps|goToPrevPage|previousPage\(|getCanPreviousPage|Previous page|Prev/i, evidence: "previous trigger evidence was detected." },
    { signal: "next-trigger", pattern: /getNextTriggerProps|goToNextPage|nextPage\(|getCanNextPage|Next page|Next/i, evidence: "next trigger evidence was detected." },
    { signal: "last-trigger", pattern: /getLastTriggerProps|goToLastPage|lastPage\(|Last page|Last/i, evidence: "last trigger evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function paginationReadinessStateSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["stateSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "page", pattern: /\bpage\b|page:\s*|api\.page|onPageChange|setPage\(/i, evidence: "page evidence was detected." },
    { signal: "default-page", pattern: /defaultPage|default page/i, evidence: "default page evidence was detected." },
    { signal: "page-size", pattern: /pageSize|page size|setPageSize|onPageSizeChange/i, evidence: "page size evidence was detected." },
    { signal: "default-page-size", pattern: /defaultPageSize|default page size/i, evidence: "default page size evidence was detected." },
    { signal: "total-pages", pattern: /totalPages|api\.totalPages/i, evidence: "total pages evidence was detected." },
    { signal: "page-count", pattern: /pageCount|getPageCount|page count/i, evidence: "page count evidence was detected." },
    { signal: "row-count", pattern: /rowCount|row count/i, evidence: "row count evidence was detected." },
    { signal: "page-range", pattern: /pageRange|page range|pageStart|pageEnd/i, evidence: "page range evidence was detected." },
    { signal: "manual-pagination", pattern: /manualPagination|manual pagination/i, evidence: "manual pagination evidence was detected." },
    { signal: "auto-reset", pattern: /autoResetPageIndex|resetPageIndex|auto reset/i, evidence: "auto reset evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function paginationReadinessNavigationSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-page", pattern: /setPage\(|SET_PAGE|setPageIndex|onPageChange/i, evidence: "set page evidence was detected." },
    { signal: "set-page-size", pattern: /setPageSize|SET_PAGE_SIZE|onPageSizeChange/i, evidence: "set page size evidence was detected." },
    { signal: "first-page", pattern: /goToFirstPage|firstPage\(|FIRST_PAGE|getFirstTriggerProps/i, evidence: "first page evidence was detected." },
    { signal: "previous-page", pattern: /goToPrevPage|previousPage\(|PREVIOUS_PAGE|getPrevTriggerProps|getCanPreviousPage/i, evidence: "previous page evidence was detected." },
    { signal: "next-page", pattern: /goToNextPage|nextPage\(|NEXT_PAGE|getNextTriggerProps|getCanNextPage/i, evidence: "next page evidence was detected." },
    { signal: "last-page", pattern: /goToLastPage|lastPage\(|LAST_PAGE|getLastTriggerProps/i, evidence: "last page evidence was detected." },
    { signal: "can-next-prev", pattern: /getCanNextPage|getCanPreviousPage|canGoToNextPage|canGoToPrevPage|api\.nextPage|api\.previousPage/i, evidence: "can-next/previous guard evidence was detected." },
    { signal: "clamp", pattern: /clampPage|clamp\(|isValidPage|Math\.min|Math\.max/i, evidence: "clamp evidence was detected." },
    { signal: "slice", pattern: /\.slice\(|api\.slice|createPaginatedRowModel|getPaginationRowModel/i, evidence: "slice or paginated row model evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function paginationReadinessRenderSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["renderSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["renderSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "button-mode", pattern: /type:\s*["']button|type\s*=\s*["']button|<button\b/i, evidence: "button mode evidence was detected." },
    { signal: "link-mode", pattern: /type:\s*["']link|<a\b|link mode/i, evidence: "link mode evidence was detected." },
    { signal: "href", pattern: /href|getPageUrl/i, evidence: "href evidence was detected." },
    { signal: "selected", pattern: /data-selected|aria-current|selected|api\.page/i, evidence: "selected page evidence was detected." },
    { signal: "disabled", pattern: /data-disabled|disabled|toBeDisabled|getCanNextPage|getCanPreviousPage/i, evidence: "disabled evidence was detected." },
    { signal: "ellipsis", pattern: /getEllipsisProps|ellipsis|\.{3}/i, evidence: "ellipsis rendering evidence was detected." },
    { signal: "page-options", pattern: /getPageOptions|pageOptions|api\.pages/i, evidence: "page options evidence was detected." },
    { signal: "row-model", pattern: /getPaginationRowModel|createPaginatedRowModel|row model|paginateExpandedRows/i, evidence: "paginated row model evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "render", "signal");
}

function paginationReadinessAccessibilitySignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|rootLabel|itemLabel/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-current", pattern: /aria-current|current page/i, evidence: "aria-current evidence was detected." },
    { signal: "data-selected", pattern: /data-selected|selected/i, evidence: "data-selected evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled|disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "translations", pattern: /translations|rootLabel|firstTriggerLabel|prevTriggerLabel|nextTriggerLabel|lastTriggerLabel|itemLabel/i, evidence: "translation evidence was detected." },
    { signal: "dir", pattern: /dir\s*[:=]|rtl|ltr/i, evidence: "text direction evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function paginationReadinessZagUsagePattern(sourceFiles: PaginationReadinessSourceFile[]): string {
  const hasZagPaginationUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/pagination|pagination\.machine|pagination\.connect|getRootProps|getItemProps|getEllipsisProps|getFirstTriggerProps|getPrevTriggerProps|getNextTriggerProps|getLastTriggerProps/i.test(source.text));
  return hasZagPaginationUsage ? "pagination\\.machine|pagination\\.connect|getRootProps|getItemProps|getEllipsisProps|getFirstTriggerProps|getPrevTriggerProps|getNextTriggerProps|getLastTriggerProps" : "(?!)";
}

function paginationReadinessMachineSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["machineSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagPagination}|createMachine|pagination\\.machine`, "i"), evidence: "Zag createMachine/pagination.machine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagPagination}|initialState\\(\\)[\\s\\S]{0,80}idle|state:\\s*["']idle["']|\\bidle\\b`, "i"), evidence: "idle state evidence was detected." },
    { signal: "page-bindable", pattern: new RegExp(`${zagPagination}|page:\\s*bindable|prop\\(["']page["']\\)|defaultPage|onPageChange`, "i"), evidence: "page bindable evidence was detected." },
    { signal: "page-size-bindable", pattern: new RegExp(`${zagPagination}|pageSize:\\s*bindable|prop\\(["']pageSize["']\\)|defaultPageSize|onPageSizeChange`, "i"), evidence: "pageSize bindable evidence was detected." },
    { signal: "page-size-watch", pattern: new RegExp(`${zagPagination}|track\\(\\[\\(\\) => context\\.get\\(["']pageSize["']\\)|setPageIfNeeded`, "i"), evidence: "pageSize watch evidence was detected." },
    { signal: "set-page-event", pattern: new RegExp(`${zagPagination}|SET_PAGE|setPage\\(`, "i"), evidence: "SET_PAGE event evidence was detected." },
    { signal: "set-page-size-event", pattern: new RegExp(`${zagPagination}|SET_PAGE_SIZE|setPageSize`, "i"), evidence: "SET_PAGE_SIZE event evidence was detected." },
    { signal: "first-page-event", pattern: new RegExp(`${zagPagination}|FIRST_PAGE|goToFirstPage|getFirstTriggerProps`, "i"), evidence: "FIRST_PAGE event evidence was detected." },
    { signal: "previous-page-event", pattern: new RegExp(`${zagPagination}|PREVIOUS_PAGE|goToPrevPage|getPrevTriggerProps`, "i"), evidence: "PREVIOUS_PAGE event evidence was detected." },
    { signal: "next-page-event", pattern: new RegExp(`${zagPagination}|NEXT_PAGE|goToNextPage|getNextTriggerProps`, "i"), evidence: "NEXT_PAGE event evidence was detected." },
    { signal: "last-page-event", pattern: new RegExp(`${zagPagination}|LAST_PAGE|goToLastPage|getLastTriggerProps`, "i"), evidence: "LAST_PAGE event evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function paginationReadinessComputedSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["computedSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "total-pages", pattern: new RegExp(`${zagPagination}|totalPages|Math\\.ceil\\(count / pageSize\\)|getPageCount`, "i"), evidence: "total pages computed evidence was detected." },
    { signal: "page-range", pattern: new RegExp(`${zagPagination}|pageRange|start:\\s*\\(page - 1\\) \\* pageSize|pageStart|pageEnd`, "i"), evidence: "page range computed evidence was detected." },
    { signal: "previous-page", pattern: new RegExp(`${zagPagination}|previousPage|goToPrevPage|getPrevTriggerProps`, "i"), evidence: "previous page computed evidence was detected." },
    { signal: "next-page", pattern: new RegExp(`${zagPagination}|nextPage|goToNextPage|getNextTriggerProps`, "i"), evidence: "next page computed evidence was detected." },
    { signal: "valid-page", pattern: new RegExp(`${zagPagination}|isValidPage|context\\.get\\(["']page["']\\) >= 1`, "i"), evidence: "valid page computed evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function paginationReadinessGuardSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["guardSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "valid-page", pattern: new RegExp(`${zagPagination}|isValidPage|event\\.page >= 1|event\\.page <= computed\\(["']totalPages["']\\)`, "i"), evidence: "isValidPage guard evidence was detected." },
    { signal: "valid-count", pattern: new RegExp(`${zagPagination}|isValidCount|event\\.count`, "i"), evidence: "isValidCount guard evidence was detected." },
    { signal: "can-next-page", pattern: new RegExp(`${zagPagination}|canGoToNextPage|context\\.get\\(["']page["']\\) < computed\\(["']totalPages["']\\)`, "i"), evidence: "canGoToNextPage guard evidence was detected." },
    { signal: "can-prev-page", pattern: new RegExp(`${zagPagination}|canGoToPrevPage|context\\.get\\(["']page["']\\) > 1`, "i"), evidence: "canGoToPrevPage guard evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function paginationReadinessActionSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["actionSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-page", pattern: new RegExp(`${zagPagination}|setPage\\(|context\\.set\\(["']page["']`, "i"), evidence: "setPage action evidence was detected." },
    { signal: "set-page-size", pattern: new RegExp(`${zagPagination}|setPageSize|context\\.set\\(["']pageSize["']`, "i"), evidence: "setPageSize action evidence was detected." },
    { signal: "first-page", pattern: new RegExp(`${zagPagination}|goToFirstPage|context\\.set\\(["']page["'],\\s*1\\)`, "i"), evidence: "first page action evidence was detected." },
    { signal: "previous-page", pattern: new RegExp(`${zagPagination}|goToPrevPage|prev - 1|PREVIOUS_PAGE`, "i"), evidence: "previous page action evidence was detected." },
    { signal: "next-page", pattern: new RegExp(`${zagPagination}|goToNextPage|prev \\+ 1|NEXT_PAGE`, "i"), evidence: "next page action evidence was detected." },
    { signal: "last-page", pattern: new RegExp(`${zagPagination}|goToLastPage|computed\\(["']totalPages["']\\)|LAST_PAGE`, "i"), evidence: "last page action evidence was detected." },
    { signal: "set-page-if-needed", pattern: new RegExp(`${zagPagination}|setPageIfNeeded|computed\\(["']isValidPage["']\\)`, "i"), evidence: "setPageIfNeeded action evidence was detected." },
    { signal: "clamp-page", pattern: new RegExp(`${zagPagination}|clampPage|Math\\.min\\(Math\\.max\\(page, 1\\), totalPages\\)`, "i"), evidence: "clampPage action evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function paginationReadinessRangeSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["rangeSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["rangeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "range-helper", pattern: new RegExp(`${zagPagination}|export const range|Array\\.from\\(\\{ length \\}`, "i"), evidence: "range helper evidence was detected." },
    { signal: "transform-helper", pattern: new RegExp(`${zagPagination}|export const transform|type:\\s*["']page["']|type:\\s*["']ellipsis["']`, "i"), evidence: "transform helper evidence was detected." },
    { signal: "transformed-range", pattern: new RegExp(`${zagPagination}|getTransformedRange|transform\\(getRange\\(ctx\\)\\)`, "i"), evidence: "transformed range evidence was detected." },
    { signal: "sibling-count", pattern: new RegExp(`${zagPagination}|siblingCount|leftSiblingIndex|rightSiblingIndex`, "i"), evidence: "siblingCount range evidence was detected." },
    { signal: "boundary-count", pattern: new RegExp(`${zagPagination}|boundaryCount|firstPageIndex|lastPageIndex`, "i"), evidence: "boundaryCount range evidence was detected." },
    { signal: "left-ellipsis", pattern: new RegExp(`${zagPagination}|showLeftEllipsis|leftSiblingIndex`, "i"), evidence: "left ellipsis range evidence was detected." },
    { signal: "right-ellipsis", pattern: new RegExp(`${zagPagination}|showRightEllipsis|rightSiblingIndex`, "i"), evidence: "right ellipsis range evidence was detected." },
    { signal: "ellipsis-collapse", pattern: new RegExp(`${zagPagination}|nextPage - prevPage === 2|pages\\[i\\] = prevPage \\+ 1`, "i"), evidence: "ellipsis collapse evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "range", "signal");
}

function paginationReadinessDomSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["domSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagPagination}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "first-trigger-id", pattern: new RegExp(`${zagPagination}|getFirstTriggerId|ids\\?\\.firstTrigger|getFirstTriggerProps`, "i"), evidence: "first trigger id evidence was detected." },
    { signal: "prev-trigger-id", pattern: new RegExp(`${zagPagination}|getPrevTriggerId|ids\\?\\.prevTrigger|getPrevTriggerProps`, "i"), evidence: "previous trigger id evidence was detected." },
    { signal: "next-trigger-id", pattern: new RegExp(`${zagPagination}|getNextTriggerId|ids\\?\\.nextTrigger|getNextTriggerProps`, "i"), evidence: "next trigger id evidence was detected." },
    { signal: "last-trigger-id", pattern: new RegExp(`${zagPagination}|getLastTriggerId|ids\\?\\.lastTrigger|getLastTriggerProps`, "i"), evidence: "last trigger id evidence was detected." },
    { signal: "ellipsis-id", pattern: new RegExp(`${zagPagination}|getEllipsisId|ids\\?\\.ellipsis|getEllipsisProps`, "i"), evidence: "ellipsis id evidence was detected." },
    { signal: "item-id", pattern: new RegExp(`${zagPagination}|getItemId|ids\\?\\.item|getItemProps`, "i"), evidence: "item id evidence was detected." },
    { signal: "data-selected", pattern: new RegExp(`${zagPagination}|data-selected|aria-current|isCurrentPage`, "i"), evidence: "data-selected evidence was detected." },
    { signal: "data-disabled", pattern: new RegExp(`${zagPagination}|data-disabled|disabled|isFirstPage|isLastPage`, "i"), evidence: "data-disabled evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function paginationReadinessApiSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["apiSignals"] {
  const zagPagination = paginationReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: PaginationReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "page", pattern: new RegExp(`${zagPagination}|api\\.page|\\bpage,`, "i"), evidence: "page API evidence was detected." },
    { signal: "count", pattern: new RegExp(`${zagPagination}|api\\.count|\\bcount,`, "i"), evidence: "count API evidence was detected." },
    { signal: "page-size", pattern: new RegExp(`${zagPagination}|api\\.pageSize|pageSize,`, "i"), evidence: "pageSize API evidence was detected." },
    { signal: "total-pages", pattern: new RegExp(`${zagPagination}|api\\.totalPages|totalPages,`, "i"), evidence: "totalPages API evidence was detected." },
    { signal: "pages", pattern: new RegExp(`${zagPagination}|api\\.pages|pages,|getTransformedRange`, "i"), evidence: "pages API evidence was detected." },
    { signal: "previous-page", pattern: new RegExp(`${zagPagination}|api\\.previousPage|previousPage,`, "i"), evidence: "previousPage API evidence was detected." },
    { signal: "next-page", pattern: new RegExp(`${zagPagination}|api\\.nextPage|nextPage,`, "i"), evidence: "nextPage API evidence was detected." },
    { signal: "page-range", pattern: new RegExp(`${zagPagination}|api\\.pageRange|pageRange,`, "i"), evidence: "pageRange API evidence was detected." },
    { signal: "slice", pattern: new RegExp(`${zagPagination}|api\\.slice|slice\\(data\\)|data\\.slice\\(pageRange\\.start, pageRange\\.end\\)`, "i"), evidence: "slice API evidence was detected." },
    { signal: "set-page", pattern: new RegExp(`${zagPagination}|api\\.setPage|setPage\\(page\\)|send\\(\\{ type: ["']SET_PAGE["']`, "i"), evidence: "setPage API evidence was detected." },
    { signal: "set-page-size", pattern: new RegExp(`${zagPagination}|api\\.setPageSize|setPageSize\\(size\\)|send\\(\\{ type: ["']SET_PAGE_SIZE["']`, "i"), evidence: "setPageSize API evidence was detected." },
    { signal: "first-page", pattern: new RegExp(`${zagPagination}|api\\.goToFirstPage|goToFirstPage\\(\\)|FIRST_PAGE`, "i"), evidence: "goToFirstPage API evidence was detected." },
    { signal: "previous-page-action", pattern: new RegExp(`${zagPagination}|api\\.goToPrevPage|goToPrevPage\\(\\)|PREVIOUS_PAGE`, "i"), evidence: "goToPrevPage API evidence was detected." },
    { signal: "next-page-action", pattern: new RegExp(`${zagPagination}|api\\.goToNextPage|goToNextPage\\(\\)|NEXT_PAGE`, "i"), evidence: "goToNextPage API evidence was detected." },
    { signal: "last-page-action", pattern: new RegExp(`${zagPagination}|api\\.goToLastPage|goToLastPage\\(\\)|LAST_PAGE`, "i"), evidence: "goToLastPage API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagPagination}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "item-props", pattern: new RegExp(`${zagPagination}|getItemProps`, "i"), evidence: "item props API evidence was detected." },
    { signal: "ellipsis-props", pattern: new RegExp(`${zagPagination}|getEllipsisProps`, "i"), evidence: "ellipsis props API evidence was detected." },
    { signal: "trigger-props", pattern: new RegExp(`${zagPagination}|getFirstTriggerProps|getPrevTriggerProps|getNextTriggerProps|getLastTriggerProps`, "i"), evidence: "trigger props API evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function paginationReadinessTestSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["testSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\.click/i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|fireEvent\.click|click\(/i, evidence: "click test evidence was detected." },
    { signal: "disabled-test", pattern: /toBeDisabled|data-disabled|disabled/i, evidence: "disabled test evidence was detected." },
    { signal: "aria-test", pattern: /aria-current|aria-label|toHaveAttribute|getByRole/i, evidence: "ARIA test evidence was detected." },
    { signal: "row-model-test", pattern: /row model|getPaginationRowModel|pageSize|pageIndex/i, evidence: "row model test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|pagination-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function paginationReadinessPackageSignals(sourceFiles: PaginationReadinessSourceFile[]): PaginationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PaginationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/pagination", pattern: /@zag-js\/pagination/i, evidence: "@zag-js/pagination dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|dataAttr/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps|isNumber/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "@tanstack/react-table", pattern: /@tanstack\/react-table/i, evidence: "@tanstack/react-table dependency evidence was detected." },
    { signal: "@tanstack/table-core", pattern: /@tanstack\/table-core/i, evidence: "@tanstack/table-core dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return paginationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function paginationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PaginationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/pagination-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
