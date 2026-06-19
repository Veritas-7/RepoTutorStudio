import path from "node:path";
import type { ClipboardReadinessReport, QrCodeReadinessReport, TagsInputReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildTagsInputReadinessReport(walk: WalkResult): Promise<TagsInputReadinessReport> {
  const sourceFiles = await tagsInputReadinessSourceFiles(walk);
  const tagsInputSetups = tagsInputReadinessSetups(sourceFiles);
  const frameworkSignals = tagsInputReadinessFrameworkSignals(sourceFiles);
  const structureSignals = tagsInputReadinessStructureSignals(sourceFiles);
  const valueSignals = tagsInputReadinessValueSignals(sourceFiles);
  const validationSignals = tagsInputReadinessValidationSignals(sourceFiles);
  const interactionSignals = tagsInputReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = tagsInputReadinessAccessibilitySignals(sourceFiles);
  const formSignals = tagsInputReadinessFormSignals(sourceFiles);
  const liveRegionSignals = tagsInputReadinessLiveRegionSignals(sourceFiles);
  const machineSignals = tagsInputReadinessMachineSignals(sourceFiles);
  const computedSignals = tagsInputReadinessComputedSignals(sourceFiles);
  const effectSignals = tagsInputReadinessEffectSignals(sourceFiles);
  const guardSignals = tagsInputReadinessGuardSignals(sourceFiles);
  const actionSignals = tagsInputReadinessActionSignals(sourceFiles);
  const domSignals = tagsInputReadinessDomSignals(sourceFiles);
  const apiSignals = tagsInputReadinessApiSignals(sourceFiles);
  const testSignals = tagsInputReadinessTestSignals(sourceFiles);
  const packageSignals = tagsInputReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || tagsInputSetups.some((item) => item.rootCount > 0 && item.inputCount > 0 && item.itemCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || tagsInputSetups.some((item) => item.valueCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || tagsInputSetups.some((item) => item.validationCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || tagsInputSetups.some((item) => item.interactionCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || tagsInputSetups.some((item) => item.hiddenInputCount > 0 && item.formCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || tagsInputSetups.some((item) => item.testCount > 0);

  const riskQueue: TagsInputReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document tags input root, label, control, entry input, tag items, clear trigger, and delete triggers before claiming tags input readiness.",
      why: "Tags input readiness starts with traceable token-entry structure and tag item controls.",
      relatedHref: "html/tags-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace value/defaultValue, inputValue/defaultInputValue, valueAsString, setValue, addValue, clearValue, and setValueAtIndex behavior.",
      why: "Tags input state is split between the tag array and the current entry input.",
      relatedHref: "html/tags-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Trace max, maxLength, validate, sanitizeValue, allowDuplicates, allowOverflow, and invalid reasons.",
      why: "Tag creation can silently reject, deduplicate, overflow, or sanitize user-entered tokens.",
      relatedHref: "html/tags-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Trace typing, Enter, delimiter, paste, blur, arrow navigation, Backspace/Delete, Escape, double-click edit, pointer tag selection, and focus behavior.",
      why: "Tags input workflows combine text input, chip navigation, edit mode, and delete controls.",
      relatedHref: "html/tags-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Verify hidden input, name, form, required, disabled fieldset, reset, and dispatchInputEvent evidence.",
      why: "Form readiness depends on serializing the tag array and keeping reset/fieldset state synchronized.",
      relatedHref: "html/tags-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, paste, edit, delete, ARIA, and artifact tests.",
      why: "Static tags input evidence does not prove token creation, paste splitting, edit mode, deletion, or accessibility behavior.",
      relatedHref: "html/tags-input-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual tags input behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records tags input readiness only; it does not type tags, paste clipboard data, edit tags, click delete controls, dispatch keyboard or pointer events, mutate tag arrays, submit forms, reset forms, announce live regions, or run analyzed project tests.",
    relatedHref: "html/tags-input-readiness.html"
  });

  return {
    summary: `Tags input readiness report: setup ${tagsInputSetups.length} files, value signal ${valueSignals.length}, validation signal ${validationSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length}, live region signal ${liveRegionSignals.length} were summarized from static analysis.`,
    sourcePattern: "Tags input readiness Zag tags input value array editable tags paste delimiter validation live region form hidden input keyboard delete accessibility tests",
    tagsInputSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    validationSignals,
    interactionSignals,
    accessibilitySignals,
    formSignals,
    liveRegionSignals,
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
      { command: "rg \"@zag-js/tags-input|tagsInput\\.machine|tagsInput\\.connect|getItemPreviewProps|getItemInputProps|getItemDeleteTriggerProps\" package.json src app packages", purpose: "Find Zag tags input machine, connect API, tag item rendering, edit input, and delete trigger props." },
      { command: "rg \"valueAsString|setValueAtIndex|addValue|clearValue|defaultInputValue|allowDuplicates|allowOverflow|sanitizeValue|validate|delimiter|addOnPaste\" src app packages", purpose: "Check value array, input value, validation, dedupe, paste, delimiter, and sanitizer behavior." },
      { command: "rg \"hidden.*input|name=|form=|trackFormControl|onFormReset|dispatchInputEvent|required|fieldset\" src app packages", purpose: "Trace form serialization, reset, required, hidden input, and disabled fieldset evidence." },
      { command: "rg \"ArrowLeft|ArrowRight|Backspace|Delete|Escape|Enter|dblClick|paste|tags-input-traces|upload-artifact|aria-invalid|aria-label\" src app packages test tests .github", purpose: "Check keyboard, paste, edit, delete, ARIA, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag tags input, native token input markup, or a custom chip editor.",
      "Trace root, label, control, input, hidden input, item, preview, item text, item input, clear trigger, and delete trigger structure.",
      "Map value/defaultValue, inputValue/defaultInputValue, valueAsString, setValue, addValue, clearValue, setValueAtIndex, count, and max behavior.",
      "Check validation, sanitizer, duplicates/overflow, paste delimiter splitting, blur behavior, edit mode, deletion, keyboard navigation, ARIA, form reset, and live region translations.",
      "This report is static readiness. Actual typing, paste, edit, delete, live-region announcement, form submission/reset, and project tests need trusted project QA."
    ]
  };
}

type TagsInputReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function tagsInputReadinessSourceFiles(walk: WalkResult): Promise<TagsInputReadinessSourceFile[]> {
  const files: TagsInputReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !tagsInputReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!tagsInputReadinessPathSignal(file.relPath) && !tagsInputReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function tagsInputReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return tagsInputReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function tagsInputReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(tags-input|tagsInput|tag-input|tagInput|token-input|chips?|chip-input|tag-editor|topics?)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function tagsInputReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/tags-input|tagsInput\.machine|tagsInput\.connect|getItemPreviewProps|getItemInputProps|getItemDeleteTriggerProps|data-tags-input-root|tags-input-traces)/i.test(text);
}

function tagsInputReadinessSetups(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["tagsInputSetups"] {
  const rows: TagsInputReadinessReport["tagsInputSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(tagsInput\.machine|tagsInput\.connect|getRootProps|data-tags-input-root|tags input root)/gi);
    const inputCount = countMatches(source.text, /(getInputProps|data-part=['"]input|tag-entry|inputValue|defaultInputValue|SET_INPUT_VALUE|TYPE|TAG_INPUT_TYPE)/gi);
    const hiddenInputCount = countMatches(source.text, /(getHiddenInputProps|hidden input|type=['"]hidden|hiddenInput|tag-hidden|getHiddenInputId)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|getItemPreviewProps|getItemTextProps|data-part=['"]item|data-part=['"]item-preview|data-part=['"]item-text|getItemState|data-value)/gi);
    const editCount = countMatches(source.text, /(getItemInputProps|itemInput|editedTag|editing:tag|TAG_INPUT_ENTER|TAG_INPUT_ESCAPE|DOUBLE_CLICK_TAG|autoResizeInput|edit-test)/gi);
    const deleteCount = countMatches(source.text, /(getItemDeleteTriggerProps|deleteTag|CLICK_DELETE_TAG|CLEAR_TAG|Backspace|Delete|delete-test|Delete tag)/gi);
    const valueCount = countMatches(source.text, /(valueAsString|defaultValue|value\s*[:=]|setValue|addValue|clearValue|setValueAtIndex|count|atMax|ADD_TAG|CLEAR_VALUE|SET_VALUE_AT_INDEX)/gi);
    const validationCount = countMatches(source.text, /(maxLength|max\s*[:=]|validate|sanitizeValue|allowDuplicates|allowOverflow|onValueInvalid|invalidTag|rangeOverflow)/gi);
    const interactionCount = countMatches(source.text, /(ENTER|DELIMITER_KEY|PASTE|BLUR|ARROW_LEFT|ARROW_RIGHT|BACKSPACE|DELETE|ESCAPE|DOUBLE_CLICK_TAG|POINTER_DOWN_TAG|onInput|onKeyDown|onPointerDown|onDoubleClick|user\.type|user\.paste|user\.keyboard|user\.dblClick|user\.click)/gi);
    const accessibilityCount = countMatches(source.text, /(getLabelProps|aria-invalid|aria-label|data-highlighted|data-disabled|data-readonly|data-required|data-empty|dir\s*[:=]|label|toHaveAttribute)/gi);
    const formCount = countMatches(source.text, /(getHiddenInputProps|name\s*[:=]|form\s*[:=]|required|trackFormControl|fieldsetDisabled|onFormReset|dispatchInputEvent|dispatchInputValueEvent|form-reset)/gi);
    const liveRegionCount = countMatches(source.text, /(trackLiveRegion|createLiveRegion|liveRegion|translations|tagAdded|tagUpdated|tagDeleted|tagsPasted|tagSelected|announceLog|announce-add|announce-update|announce-delete|announce-paste|announce-select)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.type|user\.paste|user\.keyboard|user\.dblClick|user\.click|getByLabelText|toHaveAttribute|keyboard-test|paste-test|edit-test|delete-test|aria-test|tags-input-traces|upload-artifact)/gi);
    const total = rootCount + inputCount + hiddenInputCount + itemCount + editCount + deleteCount + valueCount + validationCount + interactionCount + accessibilityCount + formCount + liveRegionCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && inputCount > 0 && itemCount > 0 && valueCount > 0 && interactionCount > 0 && accessibilityCount > 0 && formCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: tagsInputReadinessFramework(source),
      rootCount,
      inputCount,
      hiddenInputCount,
      itemCount,
      editCount,
      deleteCount,
      valueCount,
      validationCount,
      interactionCount,
      accessibilityCount,
      formCount,
      liveRegionCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, input ${inputCount}, hidden input ${hiddenInputCount}, item ${itemCount}, edit ${editCount}, delete ${deleteCount}, value ${valueCount}, validation ${validationCount}, interaction ${interactionCount}, accessibility ${accessibilityCount}, form ${formCount}, live region ${liveRegionCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.itemCount + b.valueCount + b.interactionCount + b.accessibilityCount - (a.itemCount + a.valueCount + a.interactionCount + a.accessibilityCount));
}

function tagsInputReadinessFramework(source: TagsInputReadinessSourceFile): TagsInputReadinessReport["tagsInputSetups"][number]["framework"] {
  if (/@zag-js\/tags-input|tagsInput\.machine|tagsInput\.connect|getItemPreviewProps|getItemInputProps/i.test(source.text)) return "zag-tags-input";
  if (/data-tags-input-root|data-part=['"]item|token input|chip input|tag-entry/i.test(source.text)) return "native-token-input";
  if (/tags input|tag editor|token input|chip input|chips/i.test(source.text)) return "custom";
  return "unknown";
}

function tagsInputReadinessFrameworkSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-tags-input", pattern: /@zag-js\/tags-input|tagsInput\.machine|tagsInput\.connect|getItemPreviewProps|getItemInputProps/i, evidence: "Zag tags input evidence was detected." },
    { signal: "native-token-input", pattern: /data-tags-input-root|data-part=['"]item|token input|chip input|tag-entry/i, evidence: "native token input evidence was detected." },
    { signal: "custom", pattern: /tags input|tag editor|token input|chip input|chips/i, evidence: "custom tags input evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function tagsInputReadinessStructureSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["structureSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-tags-input-root|tagsInput\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor|label/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-tags-input-control|control/i, evidence: "control evidence was detected." },
    { signal: "input", pattern: /getInputProps|data-part=['"]input|tag-entry|inputValue/i, evidence: "input evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|hiddenInput|type=['"]hidden|getHiddenInputId/i, evidence: "hidden input evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-part=['"]item|ItemProps/i, evidence: "item evidence was detected." },
    { signal: "item-preview", pattern: /getItemPreviewProps|data-part=['"]item-preview|itemPreview/i, evidence: "item preview evidence was detected." },
    { signal: "item-input", pattern: /getItemInputProps|data-part=['"]item-input|itemInput/i, evidence: "item input evidence was detected." },
    { signal: "item-text", pattern: /getItemTextProps|data-part=['"]item-text|itemText/i, evidence: "item text evidence was detected." },
    { signal: "clear-trigger", pattern: /getClearTriggerProps|clearTrigger|Clear all tags|data-clear-trigger/i, evidence: "clear trigger evidence was detected." },
    { signal: "delete-trigger", pattern: /getItemDeleteTriggerProps|itemDeleteTrigger|Delete tag/i, evidence: "delete trigger evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function tagsInputReadinessValueSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["valueSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b\s*[:=]|value:\s*\[/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "input-value", pattern: /inputValue|SET_INPUT_VALUE/i, evidence: "input value evidence was detected." },
    { signal: "default-input-value", pattern: /defaultInputValue/i, evidence: "default input value evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|computed\(["']valueAsString/i, evidence: "valueAsString evidence was detected." },
    { signal: "set-value", pattern: /setValue\(|SET_VALUE/i, evidence: "set value evidence was detected." },
    { signal: "add-value", pattern: /addValue\(|ADD_TAG|INSERT_TAG|addTag/i, evidence: "add value evidence was detected." },
    { signal: "clear-value", pattern: /clearValue\(|CLEAR_VALUE|clearTags|clearInputValue/i, evidence: "clear value evidence was detected." },
    { signal: "set-value-at-index", pattern: /setValueAtIndex|SET_VALUE_AT_INDEX/i, evidence: "set value at index evidence was detected." },
    { signal: "count-at-max", pattern: /\bcount\b|atMax|isAtMax|max\s*[:=]/i, evidence: "count/atMax evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function tagsInputReadinessValidationSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["validationSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "max", pattern: /\bmax\b\s*[:=]|isAtMax|rangeOverflow/i, evidence: "max evidence was detected." },
    { signal: "max-length", pattern: /maxLength/i, evidence: "maxLength evidence was detected." },
    { signal: "validate", pattern: /validate|onValueInvalid|invalidTag/i, evidence: "validate evidence was detected." },
    { signal: "sanitize-value", pattern: /sanitizeValue|sanitizedInputValue/i, evidence: "sanitize value evidence was detected." },
    { signal: "allow-duplicates", pattern: /allowDuplicates|uniq\(/i, evidence: "allow duplicates evidence was detected." },
    { signal: "allow-overflow", pattern: /allowOverflow|isOverflowing/i, evidence: "allow overflow evidence was detected." },
    { signal: "invalid-reason", pattern: /invalidTag|rangeOverflow|ValidityState|reason/i, evidence: "invalid reason evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function tagsInputReadinessInteractionSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "type", pattern: /\bTYPE\b|TAG_INPUT_TYPE|onInput|user\.type/i, evidence: "type evidence was detected." },
    { signal: "enter", pattern: /\bENTER\b|TAG_INPUT_ENTER|Enter|user\.keyboard/i, evidence: "Enter evidence was detected." },
    { signal: "delimiter", pattern: /DELIMITER_KEY|delimiter|endsWith/i, evidence: "delimiter evidence was detected." },
    { signal: "paste", pattern: /\bPASTE\b|addOnPaste|addTagFromPaste|user\.paste|paste-test/i, evidence: "paste evidence was detected." },
    { signal: "blur", pattern: /\bBLUR\b|TAG_INPUT_BLUR|blurBehavior|onBlur|EXTERNAL_BLUR/i, evidence: "blur evidence was detected." },
    { signal: "arrow-navigation", pattern: /ARROW_LEFT|ARROW_RIGHT|ArrowLeft|ArrowRight|highlightNextTag|highlightPrevTag/i, evidence: "arrow navigation evidence was detected." },
    { signal: "backspace-delete", pattern: /BACKSPACE|DELETE|Backspace|Delete|deleteHighlightedTag/i, evidence: "Backspace/Delete evidence was detected." },
    { signal: "escape", pattern: /\bESCAPE\b|TAG_INPUT_ESCAPE|Escape/i, evidence: "Escape evidence was detected." },
    { signal: "double-click-edit", pattern: /DOUBLE_CLICK_TAG|onDoubleClick|dblClick|editing:tag/i, evidence: "double-click edit evidence was detected." },
    { signal: "pointer-tag", pattern: /POINTER_DOWN_TAG|onPointerDown|pointer|setHoverIntent|clearHoverIntent/i, evidence: "pointer tag evidence was detected." },
    { signal: "focus", pattern: /\bFOCUS\b|focusInput|focusEditedTagInput|onFocus|focus\(\)/i, evidence: "focus evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function tagsInputReadinessAccessibilitySignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "label", pattern: /getLabelProps|htmlFor|<label/i, evidence: "label evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|deleteTagTriggerLabel|tagEdited/i, evidence: "aria-label evidence was detected." },
    { signal: "data-highlighted", pattern: /data-highlighted|highlightedTagId/i, evidence: "data-highlighted evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled|disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly|readOnly/i, evidence: "data-readonly evidence was detected." },
    { signal: "data-required", pattern: /data-required|required/i, evidence: "data-required evidence was detected." },
    { signal: "data-empty", pattern: /data-empty|empty/i, evidence: "data-empty evidence was detected." },
    { signal: "dir", pattern: /dir\s*[:=]|rtl|ltr|getEventKey/i, evidence: "direction evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function tagsInputReadinessFormSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["formSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hidden-input", pattern: /getHiddenInputProps|hiddenInput|type=['"]hidden|getHiddenInputId/i, evidence: "hidden input evidence was detected." },
    { signal: "name", pattern: /name\s*[:=]|name=/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /form\s*[:=]|form=/i, evidence: "form evidence was detected." },
    { signal: "required", pattern: /required|data-required/i, evidence: "required evidence was detected." },
    { signal: "disabled-fieldset", pattern: /fieldsetDisabled|onFieldsetDisabledChange|disabled fieldset|fieldset/i, evidence: "disabled fieldset evidence was detected." },
    { signal: "form-reset", pattern: /onFormReset|form-reset|SET_VALUE.*form-reset/i, evidence: "form reset evidence was detected." },
    { signal: "dispatch-input-event", pattern: /dispatchInputEvent|dispatchInputValueEvent/i, evidence: "dispatch input event evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function tagsInputReadinessLiveRegionSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["liveRegionSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["liveRegionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "live-region", pattern: /trackLiveRegion|createLiveRegion|liveRegion/i, evidence: "live region evidence was detected." },
    { signal: "translations", pattern: /translations|clearTriggerLabel|deleteTagTriggerLabel/i, evidence: "translations evidence was detected." },
    { signal: "announce-add", pattern: /tagAdded|announce-add|\btype:\s*["']add/i, evidence: "announce add evidence was detected." },
    { signal: "announce-update", pattern: /tagUpdated|announce-update|\btype:\s*["']update/i, evidence: "announce update evidence was detected." },
    { signal: "announce-delete", pattern: /tagDeleted|announce-delete|\btype:\s*["']delete/i, evidence: "announce delete evidence was detected." },
    { signal: "announce-paste", pattern: /tagsPasted|announce-paste|\btype:\s*["']paste/i, evidence: "announce paste evidence was detected." },
    { signal: "announce-select", pattern: /tagSelected|announce-select|\btype:\s*["']select/i, evidence: "announce select evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "live region", "signal");
}

function tagsInputReadinessZagUsagePattern(sourceFiles: TagsInputReadinessSourceFile[]): string {
  const hasZagTagsInputUsage = sourceFiles.some((source) => source.filePath !== "package.json" && /@zag-js\/tags-input|tagsInput\.machine|tagsInput\.connect|getItemPreviewProps|getItemInputProps|getItemDeleteTriggerProps/i.test(source.text));
  return hasZagTagsInputUsage ? "tagsInput\\.machine|tagsInput\\.connect|getRootProps|getInputProps|getItemPreviewProps|getItemInputProps|getItemDeleteTriggerProps" : "(?!)";
}

function tagsInputReadinessMachineSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["machineSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: new RegExp(`${zagTagsInput}|createMachine|tagsInput\\.machine`, "i"), evidence: "Zag createMachine evidence was detected." },
    { signal: "idle-state", pattern: new RegExp(`${zagTagsInput}|\\bidle\\b|initialState`, "i"), evidence: "idle state evidence was detected." },
    { signal: "focused-input-state", pattern: new RegExp(`${zagTagsInput}|focused:input|FOCUS`, "i"), evidence: "focused input state evidence was detected." },
    { signal: "navigating-tag-state", pattern: new RegExp(`${zagTagsInput}|navigating:tag|highlightedTagId`, "i"), evidence: "navigating tag state evidence was detected." },
    { signal: "editing-tag-state", pattern: new RegExp(`${zagTagsInput}|editing:tag|editedTagId|editedTagValue`, "i"), evidence: "editing tag state evidence was detected." },
    { signal: "double-click-tag-event", pattern: new RegExp(`${zagTagsInput}|DOUBLE_CLICK_TAG|onDoubleClick`, "i"), evidence: "double click tag event evidence was detected." },
    { signal: "pointer-tag-event", pattern: new RegExp(`${zagTagsInput}|POINTER_DOWN_TAG|onPointerDown`, "i"), evidence: "pointer tag event evidence was detected." },
    { signal: "delete-tag-event", pattern: new RegExp(`${zagTagsInput}|CLICK_DELETE_TAG|CLEAR_TAG|deleteTag`, "i"), evidence: "delete tag event evidence was detected." },
    { signal: "set-value-events", pattern: new RegExp(`${zagTagsInput}|SET_INPUT_VALUE|SET_VALUE|SET_VALUE_AT_INDEX|CLEAR_VALUE`, "i"), evidence: "set value event evidence was detected." },
    { signal: "add-insert-events", pattern: new RegExp(`${zagTagsInput}|ADD_TAG|INSERT_TAG|raiseInsertTagEvent`, "i"), evidence: "add/insert event evidence was detected." },
    { signal: "external-blur-event", pattern: new RegExp(`${zagTagsInput}|EXTERNAL_BLUR|raiseExternalBlurEvent`, "i"), evidence: "external blur event evidence was detected." },
    { signal: "input-key-events", pattern: new RegExp(`${zagTagsInput}|TYPE|BLUR|ENTER|DELIMITER_KEY|ARROW_LEFT|ARROW_RIGHT|ARROW_DOWN|BACKSPACE|DELETE|ESCAPE`, "i"), evidence: "input key event evidence was detected." },
    { signal: "tag-input-events", pattern: new RegExp(`${zagTagsInput}|TAG_INPUT_TYPE|TAG_INPUT_ESCAPE|TAG_INPUT_BLUR|TAG_INPUT_ENTER`, "i"), evidence: "tag input event evidence was detected." },
    { signal: "paste-event", pattern: new RegExp(`${zagTagsInput}|PASTE|addTagFromPaste|addOnPaste`, "i"), evidence: "paste event evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function tagsInputReadinessComputedSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["computedSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "count", pattern: new RegExp(`${zagTagsInput}|count: \\(\\{ context \\}\\)|api\\.count|computed\\(["']count["']\\)`, "i"), evidence: "count computed evidence was detected." },
    { signal: "value-as-string", pattern: new RegExp(`${zagTagsInput}|valueAsString|context\\.hash\\(["']value["']\\)`, "i"), evidence: "valueAsString computed evidence was detected." },
    { signal: "sanitized-input-value", pattern: new RegExp(`${zagTagsInput}|sanitizedInputValue|sanitizeValue`, "i"), evidence: "sanitized input value computed evidence was detected." },
    { signal: "disabled", pattern: new RegExp(`${zagTagsInput}|isDisabled|prop\\(["']disabled["']\\)`, "i"), evidence: "disabled computed evidence was detected." },
    { signal: "interactive", pattern: new RegExp(`${zagTagsInput}|isInteractive|readOnly|disabled`, "i"), evidence: "interactive computed evidence was detected." },
    { signal: "at-max", pattern: new RegExp(`${zagTagsInput}|isAtMax|prop\\(["']max["']\\)|api\\.atMax`, "i"), evidence: "at max computed evidence was detected." },
    { signal: "overflowing", pattern: new RegExp(`${zagTagsInput}|isOverflowing|rangeOverflow|invalid`, "i"), evidence: "overflowing computed evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function tagsInputReadinessEffectSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["effectSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "live-region", pattern: new RegExp(`${zagTagsInput}|trackLiveRegion|createLiveRegion|liveRegion\\.destroy`, "i"), evidence: "live region effect evidence was detected." },
    { signal: "form-control", pattern: new RegExp(`${zagTagsInput}|trackFormControlState|trackFormControl|onFormReset|fieldsetDisabled`, "i"), evidence: "form control effect evidence was detected." },
    { signal: "interact-outside", pattern: new RegExp(`${zagTagsInput}|trackInteractOutside|onInteractOutside|onFocusOutside|onPointerDownOutside`, "i"), evidence: "interact outside effect evidence was detected." },
    { signal: "auto-resize", pattern: new RegExp(`${zagTagsInput}|autoResize|autoResizeInput|editedTagValue`, "i"), evidence: "auto resize effect evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function tagsInputReadinessGuardSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["guardSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "input-related-target", pattern: new RegExp(`${zagTagsInput}|isInputRelatedTarget|relatedTarget`, "i"), evidence: "input related target guard evidence was detected." },
    { signal: "at-max", pattern: new RegExp(`${zagTagsInput}|isAtMax|allowOverflow`, "i"), evidence: "at max guard evidence was detected." },
    { signal: "highlighted-tag", pattern: new RegExp(`${zagTagsInput}|hasHighlightedTag|highlightedTagId`, "i"), evidence: "highlighted tag guard evidence was detected." },
    { signal: "first-last-highlighted", pattern: new RegExp(`${zagTagsInput}|isFirstTagHighlighted|isLastTagHighlighted`, "i"), evidence: "first/last highlighted guard evidence was detected." },
    { signal: "edited-tag-empty", pattern: new RegExp(`${zagTagsInput}|isEditedTagEmpty|editedTagValue`, "i"), evidence: "edited tag empty guard evidence was detected." },
    { signal: "input-empty", pattern: new RegExp(`${zagTagsInput}|isInputValueEmpty|inputValue`, "i"), evidence: "input empty guard evidence was detected." },
    { signal: "has-tags", pattern: new RegExp(`${zagTagsInput}|hasTags|value\\)\\.length > 0`, "i"), evidence: "has tags guard evidence was detected." },
    { signal: "allow-overflow", pattern: new RegExp(`${zagTagsInput}|allowOverflow`, "i"), evidence: "allow overflow guard evidence was detected." },
    { signal: "auto-focus", pattern: new RegExp(`${zagTagsInput}|autoFocus`, "i"), evidence: "auto focus guard evidence was detected." },
    { signal: "blur-behavior", pattern: new RegExp(`${zagTagsInput}|addOnBlur|clearOnBlur|blurBehavior`, "i"), evidence: "blur behavior guard evidence was detected." },
    { signal: "add-on-paste", pattern: new RegExp(`${zagTagsInput}|addOnPaste`, "i"), evidence: "add on paste guard evidence was detected." },
    { signal: "tag-editable", pattern: new RegExp(`${zagTagsInput}|isTagEditable|editable`, "i"), evidence: "tag editable guard evidence was detected." },
    { signal: "caret-start", pattern: new RegExp(`${zagTagsInput}|isCaretAtStart`, "i"), evidence: "caret start guard evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function tagsInputReadinessActionSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["actionSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "raise-insert", pattern: new RegExp(`${zagTagsInput}|raiseInsertTagEvent|INSERT_TAG`, "i"), evidence: "raise insert action evidence was detected." },
    { signal: "external-blur", pattern: new RegExp(`${zagTagsInput}|raiseExternalBlurEvent|EXTERNAL_BLUR`, "i"), evidence: "external blur action evidence was detected." },
    { signal: "dispatch-change", pattern: new RegExp(`${zagTagsInput}|dispatchChangeEvent|dispatchInputEvent`, "i"), evidence: "dispatch change action evidence was detected." },
    { signal: "highlight-navigation", pattern: new RegExp(`${zagTagsInput}|highlightNextTag|highlightFirstTag|highlightLastTag|highlightPrevTag|highlightTagAtIndex`, "i"), evidence: "highlight navigation action evidence was detected." },
    { signal: "delete-tag", pattern: new RegExp(`${zagTagsInput}|deleteTag|deleteHighlightedTag|removeAt`, "i"), evidence: "delete tag action evidence was detected." },
    { signal: "edited-id", pattern: new RegExp(`${zagTagsInput}|setEditedId|clearEditedId|editedTagId`, "i"), evidence: "edited id action evidence was detected." },
    { signal: "edited-tag-value", pattern: new RegExp(`${zagTagsInput}|setEditedTagValue|clearEditedTagValue|editedTagValue`, "i"), evidence: "edited tag value action evidence was detected." },
    { signal: "submit-edited-tag", pattern: new RegExp(`${zagTagsInput}|submitEditedTagValue|tagUpdated|update`, "i"), evidence: "submit edited tag action evidence was detected." },
    { signal: "set-value-at-index", pattern: new RegExp(`${zagTagsInput}|setValueAtIndex|SET_VALUE_AT_INDEX`, "i"), evidence: "set value at index action evidence was detected." },
    { signal: "focus-edited-input", pattern: new RegExp(`${zagTagsInput}|focusEditedTagInput|getEditInputEl|select\\(\\)`, "i"), evidence: "focus edited input action evidence was detected." },
    { signal: "input-value", pattern: new RegExp(`${zagTagsInput}|setInputValue|clearInputValue|SET_INPUT_VALUE`, "i"), evidence: "input value action evidence was detected." },
    { signal: "highlighted-id", pattern: new RegExp(`${zagTagsInput}|clearHighlightedId|highlightedTagId`, "i"), evidence: "highlighted id action evidence was detected." },
    { signal: "focus-input", pattern: new RegExp(`${zagTagsInput}|focusInput|getInputEl\\(scope\\)\\?\\.focus`, "i"), evidence: "focus input action evidence was detected." },
    { signal: "sync-inputs", pattern: new RegExp(`${zagTagsInput}|syncInputValue|syncEditedTagInputValue|setElementValue`, "i"), evidence: "sync inputs action evidence was detected." },
    { signal: "add-tag", pattern: new RegExp(`${zagTagsInput}|addTag\\(|ADD_TAG|uniq\\(`, "i"), evidence: "add tag action evidence was detected." },
    { signal: "paste-tag", pattern: new RegExp(`${zagTagsInput}|addTagFromPaste|tagsPasted|split\\(delimiter\\)`, "i"), evidence: "paste tag action evidence was detected." },
    { signal: "clear-tags", pattern: new RegExp(`${zagTagsInput}|clearTags|CLEAR_VALUE|type: ["']clear["']`, "i"), evidence: "clear tags action evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagTagsInput}|setValue\\(|SET_VALUE`, "i"), evidence: "set value action evidence was detected." },
    { signal: "invalid-callback", pattern: new RegExp(`${zagTagsInput}|invokeOnInvalid|onValueInvalid|rangeOverflow|invalidTag`, "i"), evidence: "invalid callback action evidence was detected." },
    { signal: "log-announcements", pattern: new RegExp(`${zagTagsInput}|clearLog|logHighlightedTag|announceLog|region\\.announce`, "i"), evidence: "log announcement action evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function tagsInputReadinessDomSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["domSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: new RegExp(`${zagTagsInput}|getRootId|ids\\?\\.root|getRootProps`, "i"), evidence: "root id evidence was detected." },
    { signal: "input-id", pattern: new RegExp(`${zagTagsInput}|getInputId|ids\\?\\.input|getInputProps`, "i"), evidence: "input id evidence was detected." },
    { signal: "clear-trigger-id", pattern: new RegExp(`${zagTagsInput}|getClearTriggerId|ids\\?\\.clearBtn|getClearTriggerProps`, "i"), evidence: "clear trigger id evidence was detected." },
    { signal: "hidden-input-id", pattern: new RegExp(`${zagTagsInput}|getHiddenInputId|ids\\?\\.hiddenInput|getHiddenInputProps`, "i"), evidence: "hidden input id evidence was detected." },
    { signal: "label-id", pattern: new RegExp(`${zagTagsInput}|getLabelId|ids\\?\\.label|getLabelProps`, "i"), evidence: "label id evidence was detected." },
    { signal: "control-id", pattern: new RegExp(`${zagTagsInput}|getControlId|ids\\?\\.control|getControlProps`, "i"), evidence: "control id evidence was detected." },
    { signal: "item-id", pattern: new RegExp(`${zagTagsInput}|getItemId|ids\\?\\.item|getItemProps`, "i"), evidence: "item id evidence was detected." },
    { signal: "item-delete-trigger-id", pattern: new RegExp(`${zagTagsInput}|getItemDeleteTriggerId|ids\\?\\.itemDeleteTrigger|getItemDeleteTriggerProps`, "i"), evidence: "item delete trigger id evidence was detected." },
    { signal: "item-input-id", pattern: new RegExp(`${zagTagsInput}|getItemInputId|ids\\?\\.itemInput|getItemInputProps`, "i"), evidence: "item input id evidence was detected." },
    { signal: "edit-input-id", pattern: new RegExp(`${zagTagsInput}|getEditInputId|getEditInputEl`, "i"), evidence: "edit input id evidence was detected." },
    { signal: "item-els", pattern: new RegExp(`${zagTagsInput}|getItemEls|\\[data-part=item\\]`, "i"), evidence: "item elements evidence was detected." },
    { signal: "tag-input-el", pattern: new RegExp(`${zagTagsInput}|getTagInputEl|getItemInputId`, "i"), evidence: "tag input element evidence was detected." },
    { signal: "root-el", pattern: new RegExp(`${zagTagsInput}|getRootEl|getById.*getRootId`, "i"), evidence: "root element evidence was detected." },
    { signal: "input-el", pattern: new RegExp(`${zagTagsInput}|getInputEl|getById.*getInputId`, "i"), evidence: "input element evidence was detected." },
    { signal: "hidden-input-el", pattern: new RegExp(`${zagTagsInput}|getHiddenInputEl|getById.*getHiddenInputId`, "i"), evidence: "hidden input element evidence was detected." },
    { signal: "tag-elements", pattern: new RegExp(`${zagTagsInput}|getTagElements|item-preview.*not\\(\\[data-disabled\\]\\)`, "i"), evidence: "tag elements evidence was detected." },
    { signal: "first-last", pattern: new RegExp(`${zagTagsInput}|getFirstEl|getLastEl`, "i"), evidence: "first/last element evidence was detected." },
    { signal: "prev-next", pattern: new RegExp(`${zagTagsInput}|getPrevEl|getNextEl|prevById|nextById`, "i"), evidence: "previous/next element evidence was detected." },
    { signal: "index-of-id", pattern: new RegExp(`${zagTagsInput}|getIndexOfId|indexOfId|getTagElAtIndex`, "i"), evidence: "index-of-id evidence was detected." },
    { signal: "input-focused", pattern: new RegExp(`${zagTagsInput}|isInputFocused|isActiveElement`, "i"), evidence: "input focused evidence was detected." },
    { signal: "tag-value", pattern: new RegExp(`${zagTagsInput}|getTagValue|dataset\\.value`, "i"), evidence: "tag value evidence was detected." },
    { signal: "hover-intent", pattern: new RegExp(`${zagTagsInput}|setHoverIntent|clearHoverIntent|deleteIntent`, "i"), evidence: "hover intent evidence was detected." },
    { signal: "dispatch-input-event", pattern: new RegExp(`${zagTagsInput}|dispatchInputEvent|dispatchInputValueEvent`, "i"), evidence: "dispatch input event evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function tagsInputReadinessApiSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["apiSignals"] {
  const zagTagsInput = tagsInputReadinessZagUsagePattern(sourceFiles);
  const specs: Array<{ signal: TagsInputReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "empty", pattern: new RegExp(`${zagTagsInput}|api\\.empty|empty: empty`, "i"), evidence: "empty API evidence was detected." },
    { signal: "input-value", pattern: new RegExp(`${zagTagsInput}|api\\.inputValue|inputValue: context\\.get`, "i"), evidence: "input value API evidence was detected." },
    { signal: "value", pattern: new RegExp(`${zagTagsInput}|api\\.value|value: context\\.get`, "i"), evidence: "value API evidence was detected." },
    { signal: "value-as-string", pattern: new RegExp(`${zagTagsInput}|api\\.valueAsString|valueAsString`, "i"), evidence: "valueAsString API evidence was detected." },
    { signal: "count", pattern: new RegExp(`${zagTagsInput}|api\\.count|count: computed`, "i"), evidence: "count API evidence was detected." },
    { signal: "at-max", pattern: new RegExp(`${zagTagsInput}|api\\.atMax|atMax`, "i"), evidence: "atMax API evidence was detected." },
    { signal: "set-value", pattern: new RegExp(`${zagTagsInput}|api\\.setValue|setValue\\(|SET_VALUE`, "i"), evidence: "setValue API evidence was detected." },
    { signal: "clear-value", pattern: new RegExp(`${zagTagsInput}|api\\.clearValue|clearValue\\(|CLEAR_TAG|CLEAR_VALUE`, "i"), evidence: "clearValue API evidence was detected." },
    { signal: "add-value", pattern: new RegExp(`${zagTagsInput}|api\\.addValue|addValue\\(|ADD_TAG`, "i"), evidence: "addValue API evidence was detected." },
    { signal: "set-value-at-index", pattern: new RegExp(`${zagTagsInput}|api\\.setValueAtIndex|setValueAtIndex\\(|SET_VALUE_AT_INDEX`, "i"), evidence: "setValueAtIndex API evidence was detected." },
    { signal: "set-input-value", pattern: new RegExp(`${zagTagsInput}|api\\.setInputValue|setInputValue\\(|SET_INPUT_VALUE`, "i"), evidence: "setInputValue API evidence was detected." },
    { signal: "clear-input-value", pattern: new RegExp(`${zagTagsInput}|api\\.clearInputValue|clearInputValue`, "i"), evidence: "clearInputValue API evidence was detected." },
    { signal: "focus", pattern: new RegExp(`${zagTagsInput}|api\\.focus|focus\\(\\)`, "i"), evidence: "focus API evidence was detected." },
    { signal: "item-state", pattern: new RegExp(`${zagTagsInput}|api\\.getItemState|getItemState`, "i"), evidence: "getItemState API evidence was detected." },
    { signal: "root-props", pattern: new RegExp(`${zagTagsInput}|getRootProps`, "i"), evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: new RegExp(`${zagTagsInput}|getLabelProps`, "i"), evidence: "label props API evidence was detected." },
    { signal: "control-props", pattern: new RegExp(`${zagTagsInput}|getControlProps`, "i"), evidence: "control props API evidence was detected." },
    { signal: "input-props", pattern: new RegExp(`${zagTagsInput}|getInputProps`, "i"), evidence: "input props API evidence was detected." },
    { signal: "hidden-input-props", pattern: new RegExp(`${zagTagsInput}|getHiddenInputProps`, "i"), evidence: "hidden input props API evidence was detected." },
    { signal: "item-props", pattern: new RegExp(`${zagTagsInput}|getItemProps`, "i"), evidence: "item props API evidence was detected." },
    { signal: "item-preview-props", pattern: new RegExp(`${zagTagsInput}|getItemPreviewProps`, "i"), evidence: "item preview props API evidence was detected." },
    { signal: "item-text-props", pattern: new RegExp(`${zagTagsInput}|getItemTextProps`, "i"), evidence: "item text props API evidence was detected." },
    { signal: "item-input-props", pattern: new RegExp(`${zagTagsInput}|getItemInputProps`, "i"), evidence: "item input props API evidence was detected." },
    { signal: "item-delete-trigger-props", pattern: new RegExp(`${zagTagsInput}|getItemDeleteTriggerProps`, "i"), evidence: "item delete trigger props API evidence was detected." },
    { signal: "clear-trigger-props", pattern: new RegExp(`${zagTagsInput}|getClearTriggerProps`, "i"), evidence: "clear trigger props API evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function tagsInputReadinessTestSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["testSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /user\.keyboard|ArrowLeft|ArrowRight|Backspace|Delete|Escape|Enter|keyboard-test/i, evidence: "keyboard test evidence was detected." },
    { signal: "paste-test", pattern: /user\.paste|paste-test|addOnPaste/i, evidence: "paste test evidence was detected." },
    { signal: "edit-test", pattern: /dblClick|double-click|edit-test|TAG_INPUT_ENTER|editing:tag/i, evidence: "edit test evidence was detected." },
    { signal: "delete-test", pattern: /click\(.*Delete|delete-test|CLICK_DELETE_TAG|getItemDeleteTriggerProps/i, evidence: "delete test evidence was detected." },
    { signal: "aria-test", pattern: /aria-invalid|aria-label|toHaveAttribute|getByLabelText/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|tags-input-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function tagsInputReadinessPackageSignals(sourceFiles: TagsInputReadinessSourceFile[]): TagsInputReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TagsInputReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/tags-input", pattern: /@zag-js\/tags-input/i, evidence: "@zag-js/tags-input dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy|parts\./i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/auto-resize", pattern: /@zag-js\/auto-resize|autoResizeInput/i, evidence: "@zag-js/auto-resize evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|createGuards|TagsInputSchema|Machine|Service/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|getEventKey|trackFormControl|dispatchInputValueEvent|isCaretAtStart|setElementValue/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/interact-outside", pattern: /@zag-js\/interact-outside|trackInteractOutside|InteractOutsideHandlers/i, evidence: "@zag-js/interact-outside evidence was detected." },
    { signal: "@zag-js/live-region", pattern: /@zag-js\/live-region|createLiveRegion|LiveRegion/i, evidence: "@zag-js/live-region evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|PropTypes|CommonProperties|DirectionProperty|EventKeyMap/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|uniq|removeAt|warn|createSplitProps|createProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return tagsInputReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function tagsInputReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TagsInputReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/tags-input-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildClipboardReadinessReport(walk: WalkResult): Promise<ClipboardReadinessReport> {
  const sourceFiles = await clipboardReadinessSourceFiles(walk);
  const clipboardSetups = clipboardReadinessSetups(sourceFiles);
  const frameworkSignals = clipboardReadinessFrameworkSignals(sourceFiles);
  const structureSignals = clipboardReadinessStructureSignals(sourceFiles);
  const valueSignals = clipboardReadinessValueSignals(sourceFiles);
  const copySignals = clipboardReadinessCopySignals(sourceFiles);
  const statusSignals = clipboardReadinessStatusSignals(sourceFiles);
  const accessibilitySignals = clipboardReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = clipboardReadinessMachineSignals(sourceFiles);
  const effectSignals = clipboardReadinessEffectSignals(sourceFiles);
  const actionSignals = clipboardReadinessActionSignals(sourceFiles);
  const domSignals = clipboardReadinessDomSignals(sourceFiles);
  const apiSignals = clipboardReadinessApiSignals(sourceFiles);
  const testSignals = clipboardReadinessTestSignals(sourceFiles);
  const packageSignals = clipboardReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || clipboardSetups.some((item) => item.inputCount > 0 && item.triggerCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || clipboardSetups.some((item) => item.valueCount > 0);
  const hasCopy = copySignals.some((item) => item.readiness === "ready") || clipboardSetups.some((item) => item.copyCount > 0);
  const hasStatus = statusSignals.some((item) => item.readiness === "ready") || clipboardSetups.some((item) => item.statusCount > 0 || item.timerCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || clipboardSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || clipboardSetups.some((item) => item.testCount > 0);

  const riskQueue: ClipboardReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document clipboard root, label, control, read-only input, trigger, and copied indicators before claiming clipboard readiness.",
      why: "Clipboard readiness starts with a traceable value surface and a trigger that users can identify.",
      relatedHref: "html/clipboard-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "medium",
      action: "Trace value/defaultValue, setValue, input synchronization, and read-only input behavior.",
      why: "Clipboard UI usually copies a derived value; learners need to see where that value comes from and how the input is kept in sync.",
      relatedHref: "html/clipboard-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasCopy) {
    riskQueue.push({
      priority: "high",
      action: "Trace copy(), input copy events, navigator.clipboard.writeText, execCommand fallback, selection ranges, fallback nodes, and COPY.DONE.",
      why: "Clipboard APIs can fail under insecure contexts, permissions, or missing fallback paths.",
      relatedHref: "html/clipboard-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasStatus) {
    riskQueue.push({
      priority: "medium",
      action: "Trace copied state, data-copied, status callbacks, timeout reset, and copied/not-copied translations.",
      why: "Users need clear feedback that resets after a predictable timeout.",
      relatedHref: "html/clipboard-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify aria-label, label linkage, readOnly/data-readonly input, focus select behavior, and hidden indicator evidence.",
      why: "Clipboard controls need accessible labels and non-editable value fields that still support manual copy.",
      relatedHref: "html/clipboard-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, copy event, ARIA, copied status, timeout, and artifact tests.",
      why: "Static clipboard evidence does not prove copy invocation, fallback behavior, status reset, or accessible trigger labels.",
      relatedHref: "html/clipboard-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual clipboard behavior in a trusted browser or component test outside RepoTutor.",
    why: "RepoTutor records clipboard readiness only; it does not write to the system clipboard, call navigator.clipboard, execute copy commands, select DOM ranges, mutate copied status, advance timers, or run analyzed project tests.",
    relatedHref: "html/clipboard-readiness.html"
  });

  return {
    summary: `Clipboard readiness report: setup ${clipboardSetups.length} files, copy signal ${copySignals.length}, status signal ${statusSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Clipboard readiness Zag clipboard copy value trigger indicator timeout native clipboard fallback accessibility tests",
    clipboardSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    copySignals,
    statusSignals,
    accessibilitySignals,
    machineSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/clipboard|clipboard\\.machine|clipboard\\.connect|getTriggerProps|getInputProps|getIndicatorProps\" package.json src app packages", purpose: "Find Zag clipboard machine, connect API, input, trigger, and indicator props." },
      { command: "rg \"navigator\\.clipboard|writeText|execCommand\\(['\\\"]copy|createRange|selectNodeContents|getSelection|fallback\" src app packages", purpose: "Check native Clipboard API usage and execCommand fallback path." },
      { command: "rg \"COPY\\.DONE|setRafTimeout|timeout|data-copied|onStatusChange|triggerLabel|Copied to clipboard\" src app packages", purpose: "Trace copied status, timeout reset, callbacks, and copied/not-copied labels." },
      { command: "rg \"click-test|copy-test|aria-test|status-test|clipboard-traces|upload-artifact|aria-label|readOnly|data-readonly\" src app packages test tests .github", purpose: "Check click, copy event, accessibility, status, and artifact coverage." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag clipboard, native Clipboard API code, or a custom copy helper.",
      "Trace root, label, control, read-only input, trigger, and copied/not-copied indicators before reviewing behavior.",
      "Map value/defaultValue, setValue, input synchronization, copy(), input copy events, native clipboard writes, fallback node/range selection, and COPY.DONE timeout reset.",
      "Check aria-label, label linkage, readOnly/data-readonly, focus select, hidden indicators, copied status callbacks, and user feedback translations.",
      "This report is static readiness. Actual clipboard writes, permission failures, selection ranges, timers, and project tests need trusted browser/component QA."
    ]
  };
}

type ClipboardReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function clipboardReadinessSourceFiles(walk: WalkResult): Promise<ClipboardReadinessSourceFile[]> {
  const files: ClipboardReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !clipboardReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!clipboardReadinessPathSignal(file.relPath) && !clipboardReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function clipboardReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return clipboardReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function clipboardReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(clipboard|copy|share-link|share-url)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function clipboardReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/clipboard|clipboard\.machine|clipboard\.connect|getTriggerProps|getIndicatorProps|navigator\.clipboard|execCommand\(['"]copy|clipboard-traces)/i.test(text);
}

function clipboardReadinessSetups(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["clipboardSetups"] {
  const rows: ClipboardReadinessReport["clipboardSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(clipboard\.machine|clipboard\.connect|getRootProps|data-clipboard-root|clipboard root)/gi);
    const inputCount = countMatches(source.text, /(getInputProps|readOnly|data-readonly|share-url|getInputId|onCopy|select\(\))/gi);
    const triggerCount = countMatches(source.text, /(getTriggerProps|triggerLabel|Copy to clipboard|aria-label|onClick|copy button)/gi);
    const indicatorCount = countMatches(source.text, /(getIndicatorProps|indicator|Copied to clipboard|hidden|data-copied)/gi);
    const valueCount = countMatches(source.text, /(value\s*[:=]|defaultValue|setValue|VALUE\.SET|syncInputElement|setElementValue)/gi);
    const copyCount = countMatches(source.text, /(copy\(\)|COPY\b|INPUT\.COPY|writeToClipboard|writeText|execCommand\(['"]copy|onCopy|fireEvent\.copy)/gi);
    const statusCount = countMatches(source.text, /(copied|data-copied|onStatusChange|CopyStatusDetails|triggerLabel|status-test)/gi);
    const timerCount = countMatches(source.text, /(timeout|setRafTimeout|COPY\.DONE|advanceTimersByTime|useFakeTimers)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|getLabelProps|htmlFor|readOnly|data-readonly|onFocus|select\(\)|hidden|toHaveAttribute)/gi);
    const fallbackCount = countMatches(source.text, /(navigator\.clipboard|writeText|execCommand\(['"]copy|createNode|copyNode|copyText|createRange|selectNodeContents|getSelection|removeAllRanges|appendChild|removeChild|fallback)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|fireEvent\.copy|click-test|copy-test|aria-test|status-test|clipboard-traces|upload-artifact)/gi);
    const total = rootCount + inputCount + triggerCount + indicatorCount + valueCount + copyCount + statusCount + timerCount + accessibilityCount + fallbackCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && inputCount > 0 && triggerCount > 0 && valueCount > 0 && copyCount > 0 && statusCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: clipboardReadinessFramework(source),
      rootCount,
      inputCount,
      triggerCount,
      indicatorCount,
      valueCount,
      copyCount,
      statusCount,
      timerCount,
      accessibilityCount,
      fallbackCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, input ${inputCount}, trigger ${triggerCount}, indicator ${indicatorCount}, value ${valueCount}, copy ${copyCount}, status ${statusCount}, timer ${timerCount}, accessibility ${accessibilityCount}, fallback ${fallbackCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.copyCount + b.statusCount + b.accessibilityCount + b.fallbackCount - (a.copyCount + a.statusCount + a.accessibilityCount + a.fallbackCount));
}

function clipboardReadinessFramework(source: ClipboardReadinessSourceFile): ClipboardReadinessReport["clipboardSetups"][number]["framework"] {
  if (/@zag-js\/clipboard|clipboard\.machine|clipboard\.connect|getTriggerProps|getIndicatorProps/i.test(source.text)) return "zag-clipboard";
  if (/navigator\.clipboard|execCommand\(['"]copy|data-clipboard-root|copyWithFallback/i.test(source.text)) return "native-clipboard";
  if (/clipboard|copy to clipboard|share link|copy button/i.test(source.text)) return "custom";
  return "unknown";
}

function clipboardReadinessFrameworkSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-clipboard", pattern: /@zag-js\/clipboard|clipboard\.machine|clipboard\.connect|getTriggerProps|getIndicatorProps/i, evidence: "Zag clipboard evidence was detected." },
    { signal: "native-clipboard", pattern: /navigator\.clipboard|execCommand\(['"]copy|data-clipboard-root|copyWithFallback/i, evidence: "native clipboard evidence was detected." },
    { signal: "custom", pattern: /clipboard|copy to clipboard|share link|copy button/i, evidence: "custom clipboard evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function clipboardReadinessStructureSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-clipboard-root|clipboard\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|control/i, evidence: "control evidence was detected." },
    { signal: "input", pattern: /getInputProps|share-url|readOnly|getInputId/i, evidence: "input evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|trigger|button|Copy to clipboard/i, evidence: "trigger evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|indicator|Copied to clipboard|hidden/i, evidence: "indicator evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function clipboardReadinessValueSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["valueSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b\s*[:=]|api\.value|context\.get\(["']value/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "set-value", pattern: /setValue|VALUE\.SET/i, evidence: "set value evidence was detected." },
    { signal: "sync-input", pattern: /syncInputElement|setElementValue|getInputEl/i, evidence: "sync input evidence was detected." },
    { signal: "read-only-input", pattern: /readOnly|data-readonly/i, evidence: "read-only input evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function clipboardReadinessCopySignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["copySignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["copySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "copy", pattern: /\bCOPY\b|copy\(\)|writeToClipboard/i, evidence: "copy evidence was detected." },
    { signal: "input-copy", pattern: /INPUT\.COPY|onCopy|fireEvent\.copy/i, evidence: "input copy evidence was detected." },
    { signal: "navigator-clipboard", pattern: /navigator\.clipboard|writeText/i, evidence: "navigator clipboard evidence was detected." },
    { signal: "exec-command", pattern: /execCommand\(['"]copy/i, evidence: "execCommand copy evidence was detected." },
    { signal: "selection-range", pattern: /getSelection|createRange|selectNodeContents|removeAllRanges|addRange/i, evidence: "selection range evidence was detected." },
    { signal: "fallback-node", pattern: /createNode|copyNode|copyText|appendChild|removeChild|fallback/i, evidence: "fallback node evidence was detected." },
    { signal: "copy-done", pattern: /COPY\.DONE|setRafTimeout/i, evidence: "copy done evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "copy", "signal");
}

function clipboardReadinessStatusSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["statusSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["statusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "copied-state", pattern: /copied|state\.matches\(["']copied/i, evidence: "copied state evidence was detected." },
    { signal: "data-copied", pattern: /data-copied/i, evidence: "data-copied evidence was detected." },
    { signal: "status-change", pattern: /onStatusChange|CopyStatusDetails|invokeOnCopy/i, evidence: "status change evidence was detected." },
    { signal: "timeout", pattern: /timeout|setRafTimeout|advanceTimersByTime/i, evidence: "timeout evidence was detected." },
    { signal: "translations", pattern: /translations|triggerLabel|Copied to clipboard|Copy to clipboard/i, evidence: "translation evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "status", "signal");
}

function clipboardReadinessAccessibilitySignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|triggerLabel/i, evidence: "aria-label evidence was detected." },
    { signal: "label", pattern: /getLabelProps|htmlFor|<label/i, evidence: "label evidence was detected." },
    { signal: "read-only", pattern: /readOnly/i, evidence: "readOnly evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly evidence was detected." },
    { signal: "focus-select", pattern: /onFocus|select\(\)/i, evidence: "focus select evidence was detected." },
    { signal: "hidden-indicator", pattern: /getIndicatorProps|hidden|Copied to clipboard/i, evidence: "hidden indicator evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function clipboardReadinessMachineSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["machineSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<ClipboardSchema>|createMachine|clipboard\.machine/i, evidence: "createMachine evidence was detected." },
    { signal: "idle-state", pattern: /initialState\(\)|\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "copied-state", pattern: /\bcopied\b|state\.matches\(["']copied/i, evidence: "copied state evidence was detected." },
    { signal: "value-context", pattern: /context\.get\(["']value|context\.get\s+value|context\.set\(["']value|context:\s*\{[\s\S]*value/i, evidence: "value context evidence was detected." },
    { signal: "value-set-event", pattern: /VALUE\.SET/i, evidence: "VALUE.SET event evidence was detected." },
    { signal: "copy-event", pattern: /\bCOPY\b|send\(\{\s*type:\s*["']COPY/i, evidence: "COPY event evidence was detected." },
    { signal: "input-copy-event", pattern: /INPUT\.COPY|onCopy/i, evidence: "INPUT.COPY event evidence was detected." },
    { signal: "copy-done-event", pattern: /COPY\.DONE/i, evidence: "COPY.DONE event evidence was detected." },
    { signal: "watch-value-sync", pattern: /watch\(|track\(\[\(\)\s*=>\s*context\.get\(["']value|syncInputElement/i, evidence: "watch value sync evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "timeout-default", pattern: /timeout:\s*3000|timeout/i, evidence: "timeout default evidence was detected." },
    { signal: "translation-label", pattern: /translations|triggerLabel|Copied to clipboard|Copy to clipboard/i, evidence: "translation label evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function clipboardReadinessEffectSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["effectSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "timeout-effect", pattern: /waitForTimeout/i, evidence: "timeout effect evidence was detected." },
    { signal: "raf-timeout", pattern: /setRafTimeout/i, evidence: "setRafTimeout evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function clipboardReadinessActionSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["actionSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-value", pattern: /setValue|context\.set\(["']value|VALUE\.SET/i, evidence: "set value action evidence was detected." },
    { signal: "copy-to-clipboard", pattern: /copyToClipboard|writeToClipboard/i, evidence: "copyToClipboard action evidence was detected." },
    { signal: "invoke-on-copy", pattern: /invokeOnCopy|onStatusChange/i, evidence: "invokeOnCopy action evidence was detected." },
    { signal: "sync-input-element", pattern: /syncInputElement|setElementValue|getInputEl/i, evidence: "sync input element action evidence was detected." },
    { signal: "send-copy", pattern: /send\(\{\s*type:\s*["']COPY|api\.copy\(\)|copy\(\)\s*\{/i, evidence: "send copy action evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function clipboardReadinessDomSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["domSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id evidence was detected." },
    { signal: "input-id", pattern: /getInputId/i, evidence: "input id evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id evidence was detected." },
    { signal: "input-el", pattern: /getInputEl/i, evidence: "input element evidence was detected." },
    { signal: "write-to-clipboard", pattern: /writeToClipboard/i, evidence: "writeToClipboard evidence was detected." },
    { signal: "create-node", pattern: /createNode|createElement\(["']pre/i, evidence: "create node evidence was detected." },
    { signal: "copy-node", pattern: /copyNode/i, evidence: "copy node evidence was detected." },
    { signal: "copy-text", pattern: /copyText/i, evidence: "copy text evidence was detected." },
    { signal: "navigator-write-text", pattern: /navigator\.clipboard|writeText/i, evidence: "navigator writeText evidence was detected." },
    { signal: "exec-command", pattern: /execCommand(?:\(["']copy)?/i, evidence: "execCommand copy evidence was detected." },
    { signal: "selection-range", pattern: /getSelection|createRange|selectNodeContents|removeAllRanges|addRange/i, evidence: "selection range evidence was detected." },
    { signal: "append-remove-node", pattern: /appendChild|removeChild/i, evidence: "append/remove node evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function clipboardReadinessApiSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["apiSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "copied", pattern: /api\.copied|\bcopied\b/i, evidence: "copied API evidence was detected." },
    { signal: "value", pattern: /api\.value|value:\s*context\.get|context\.get\(["']value/i, evidence: "value API evidence was detected." },
    { signal: "set-value", pattern: /api\.setValue|setValue\(value\)|send\(\{\s*type:\s*["']VALUE\.SET/i, evidence: "setValue API evidence was detected." },
    { signal: "copy", pattern: /api\.copy|copy\(\)\s*\{|send\(\{\s*type:\s*["']COPY/i, evidence: "copy API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props evidence was detected." },
    { signal: "input-props", pattern: /getInputProps/i, evidence: "input props evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function clipboardReadinessTestSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["testSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test/i, evidence: "click test evidence was detected." },
    { signal: "copy-test", pattern: /fireEvent\.copy|copy-test|onCopy/i, evidence: "copy test evidence was detected." },
    { signal: "aria-test", pattern: /aria-label|toHaveAttribute|getByRole|getByLabelText|aria-test/i, evidence: "ARIA test evidence was detected." },
    { signal: "status-test", pattern: /status-test|advanceTimersByTime|useFakeTimers|data-copied/i, evidence: "status test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|clipboard-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function clipboardReadinessPackageSignals(sourceFiles: ClipboardReadinessSourceFile[]): ClipboardReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ClipboardReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/clipboard", pattern: /@zag-js\/clipboard/i, evidence: "@zag-js/clipboard dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return clipboardReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function clipboardReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ClipboardReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/clipboard-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildQrCodeReadinessReport(walk: WalkResult): Promise<QrCodeReadinessReport> {
  const sourceFiles = await qrCodeReadinessSourceFiles(walk);
  const qrCodeSetups = qrCodeReadinessSetups(sourceFiles);
  const frameworkSignals = qrCodeReadinessFrameworkSignals(sourceFiles);
  const structureSignals = qrCodeReadinessStructureSignals(sourceFiles);
  const valueSignals = qrCodeReadinessValueSignals(sourceFiles);
  const encodingSignals = qrCodeReadinessEncodingSignals(sourceFiles);
  const downloadSignals = qrCodeReadinessDownloadSignals(sourceFiles);
  const accessibilitySignals = qrCodeReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = qrCodeReadinessMachineSignals(sourceFiles);
  const computedSignals = qrCodeReadinessComputedSignals(sourceFiles);
  const actionSignals = qrCodeReadinessActionSignals(sourceFiles);
  const domSignals = qrCodeReadinessDomSignals(sourceFiles);
  const apiSignals = qrCodeReadinessApiSignals(sourceFiles);
  const testSignals = qrCodeReadinessTestSignals(sourceFiles);
  const packageSignals = qrCodeReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || qrCodeSetups.some((item) => item.frameCount > 0 && item.patternCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || qrCodeSetups.some((item) => item.valueCount > 0);
  const hasEncoding = encodingSignals.some((item) => item.readiness === "ready") || qrCodeSetups.some((item) => item.encodingCount > 0 && item.renderCount > 0);
  const hasDownload = downloadSignals.some((item) => item.readiness === "ready") || qrCodeSetups.some((item) => item.downloadCount > 0 && item.dataUrlCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || qrCodeSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || qrCodeSetups.some((item) => item.testCount > 0);

  const riskQueue: QrCodeReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document QR root, SVG frame, pattern path, overlay, and download trigger before claiming QR code readiness.",
      why: "QR readiness starts with a traceable rendered frame and encoded pattern surface.",
      relatedHref: "html/qr-code-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "medium",
      action: "Trace value/defaultValue, setValue, and onValueChange before reviewing generated QR output.",
      why: "QR code correctness depends on the exact value that gets encoded.",
      relatedHref: "html/qr-code-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasEncoding) {
    riskQueue.push({
      priority: "high",
      action: "Trace encoding options, uqr usage, encoded size/data, pixelSize, SVG path data, and viewBox dimensions.",
      why: "QR generation can be visually present while encoding the wrong value, size, or error correction settings.",
      relatedHref: "html/qr-code-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasDownload) {
    riskQueue.push({
      priority: "medium",
      action: "Trace getDataUrl, download trigger props, mimeType, quality, fileName, data URI, and anchor click behavior.",
      why: "Download flows need explicit output type and filename evidence.",
      relatedHref: "html/qr-code-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify role=img, aria-label, SVG presence, accessible download button, and overlay alt/label evidence.",
      why: "QR images and overlay logos need accessible labels and discoverable download controls.",
      relatedHref: "html/qr-code-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add SVG, data URL, download trigger, accessibility, and artifact tests.",
      why: "Static QR code evidence does not prove encoded output, data URL conversion, download behavior, or accessible labeling.",
      relatedHref: "html/qr-code-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual QR code rendering and scanability with trusted visual or component tests outside RepoTutor.",
    why: "RepoTutor records QR code readiness only; it does not encode live QR matrices, render SVG pixels, convert data URLs, click download anchors, generate files, scan QR codes, or run analyzed project tests.",
    relatedHref: "html/qr-code-readiness.html"
  });

  return {
    summary: `QR code readiness report: setup ${qrCodeSetups.length} files, encoding signal ${encodingSignals.length}, download signal ${downloadSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "QR code readiness Zag qr-code uqr SVG pattern overlay download data URL encoding pixel size accessibility tests",
    qrCodeSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    encodingSignals,
    downloadSignals,
    accessibilitySignals,
    machineSignals,
    computedSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/qr-code|qrCode\\.machine|qrCode\\.connect|getFrameProps|getPatternProps|getDownloadTriggerProps\" package.json src app packages", purpose: "Find Zag QR code machine, connect API, SVG frame, pattern, overlay, and download trigger props." },
      { command: "rg \"uqr|encode\\(|encoding|pixelSize|encoded\\.size|encoded\\.data|viewBox|path data|paths\\.join\" src app packages", purpose: "Check QR encoding options, matrix dimensions, pixel size, and SVG path generation." },
      { command: "rg \"getDataUrl|DOWNLOAD_TRIGGER\\.CLICK|mimeType|quality|fileName|download|data:image|createElement\\(['\\\"]a|anchor\\.click\" src app packages", purpose: "Trace data URL export and download anchor behavior." },
      { command: "rg \"role=['\\\"]img|aria-label|overlay|download-test|data-url-test|svg-test|qr-code-traces|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility, overlay labeling, download/data URL tests, SVG tests, and artifacts." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag qr-code, native SVG QR markup, or a custom QR renderer.",
      "Trace root, frame, pattern, overlay, and download trigger structure before reviewing generated output.",
      "Map value/defaultValue, setValue, onValueChange, encoding options, uqr encode, encoded matrix size/data, pixelSize, path data, and viewBox.",
      "Check getDataUrl, mimeType, quality, fileName, anchor download/click behavior, role/aria labels, overlay labeling, and test artifacts.",
      "This report is static readiness. Actual QR encoding, visual scanability, data URL conversion, download files, and project tests need trusted QA."
    ]
  };
}

type QrCodeReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function qrCodeReadinessSourceFiles(walk: WalkResult): Promise<QrCodeReadinessSourceFile[]> {
  const files: QrCodeReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !qrCodeReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!qrCodeReadinessPathSignal(file.relPath) && !qrCodeReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function qrCodeReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return qrCodeReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|svg)$/i.test(filePath);
}

function qrCodeReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(qr-code|qrcode|qr|barcode|share-qr|payment-qr)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function qrCodeReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/qr-code|qrCode\.machine|qrCode\.connect|getFrameProps|getPatternProps|getDownloadTriggerProps|data-qr-code-root|qr-code-traces|uqr|encode\()/i.test(text);
}

function qrCodeReadinessSetups(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["qrCodeSetups"] {
  const rows: QrCodeReadinessReport["qrCodeSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(qrCode\.machine|qrCode\.connect|getRootProps|data-qr-code-root|qr code root)/gi);
    const frameCount = countMatches(source.text, /(getFrameProps|data-qr-frame|<svg|viewBox|getFrameId|getFrameEl)/gi);
    const patternCount = countMatches(source.text, /(getPatternProps|data-qr-pattern|<path|pathData|paths\.join|encoded\.data)/gi);
    const overlayCount = countMatches(source.text, /(getOverlayProps|data-qr-overlay|overlay|figcaption|Brand overlay|Logo overlay)/gi);
    const downloadCount = countMatches(source.text, /(getDownloadTriggerProps|DOWNLOAD_TRIGGER\.CLICK|downloadQrCode|downloadSvg|download-trigger|Download QR|download)/gi);
    const valueCount = countMatches(source.text, /(value\s*[:=]|defaultValue|setValue|VALUE\.SET|onValueChange|api\.value)/gi);
    const encodingCount = countMatches(source.text, /(encoding|encode\(|uqr|QrCodeGenerateOptions|QrCodeGenerateResult|ecc|maskPattern)/gi);
    const pixelCount = countMatches(source.text, /(pixelSize|--qrcode-pixel-size|--qrcode-width|--qrcode-height|encoded\.size|width|height)/gi);
    const renderCount = countMatches(source.text, /(viewBox|paths\.push|paths\.join|encoded\.data|pattern|frame|svg|pathData)/gi);
    const dataUrlCount = countMatches(source.text, /(getDataUrl|dataUrl|dataUri|data:image|mimeType|quality|encodeURIComponent)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]img|aria-label|overlay-alt|button|Download QR|figcaption|getByRole)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|getByRole|download-test|data-url-test|svg-test|qr-code-traces|upload-artifact)/gi);
    const total = rootCount + frameCount + patternCount + overlayCount + downloadCount + valueCount + encodingCount + pixelCount + renderCount + dataUrlCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && frameCount > 0 && patternCount > 0 && valueCount > 0 && encodingCount > 0 && renderCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: qrCodeReadinessFramework(source),
      rootCount,
      frameCount,
      patternCount,
      overlayCount,
      downloadCount,
      valueCount,
      encodingCount,
      pixelCount,
      renderCount,
      dataUrlCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, frame ${frameCount}, pattern ${patternCount}, overlay ${overlayCount}, download ${downloadCount}, value ${valueCount}, encoding ${encodingCount}, pixel ${pixelCount}, render ${renderCount}, data URL ${dataUrlCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.encodingCount + b.renderCount + b.downloadCount + b.accessibilityCount - (a.encodingCount + a.renderCount + a.downloadCount + a.accessibilityCount));
}

function qrCodeReadinessFramework(source: QrCodeReadinessSourceFile): QrCodeReadinessReport["qrCodeSetups"][number]["framework"] {
  if (/@zag-js\/qr-code|qrCode\.machine|qrCode\.connect|getPatternProps|getDownloadTriggerProps/i.test(source.text)) return "zag-qr-code";
  if (/data-qr-frame|<svg|data-qr-pattern|pathData|data-qr-code-root/i.test(source.text)) return "native-svg-qr";
  if (/qr code|qrcode|barcode|download qr/i.test(source.text)) return "custom";
  return "unknown";
}

function qrCodeReadinessFrameworkSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-qr-code", pattern: /@zag-js\/qr-code|qrCode\.machine|qrCode\.connect|getPatternProps|getDownloadTriggerProps/i, evidence: "Zag QR code evidence was detected." },
    { signal: "native-svg-qr", pattern: /data-qr-frame|<svg|data-qr-pattern|pathData|data-qr-code-root/i, evidence: "native SVG QR evidence was detected." },
    { signal: "custom", pattern: /qr code|qrcode|barcode|download qr/i, evidence: "custom QR evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function qrCodeReadinessStructureSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["structureSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-qr-code-root|qrCode\.machine/i, evidence: "root evidence was detected." },
    { signal: "frame", pattern: /getFrameProps|data-qr-frame|<svg|getFrameId|getFrameEl/i, evidence: "frame evidence was detected." },
    { signal: "pattern", pattern: /getPatternProps|data-qr-pattern|<path|pathData|paths\.join/i, evidence: "pattern evidence was detected." },
    { signal: "overlay", pattern: /getOverlayProps|data-qr-overlay|overlay|figcaption/i, evidence: "overlay evidence was detected." },
    { signal: "download-trigger", pattern: /getDownloadTriggerProps|download-trigger|Download QR|DOWNLOAD_TRIGGER\.CLICK/i, evidence: "download trigger evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function qrCodeReadinessValueSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["valueSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b\s*[:=]|api\.value|context\.get\(["']value/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "set-value", pattern: /setValue|VALUE\.SET/i, evidence: "set value evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange|ValueChangeDetails/i, evidence: "onValueChange evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function qrCodeReadinessEncodingSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["encodingSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["encodingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "encoding", pattern: /encoding|QrCodeGenerateOptions|ecc|maskPattern/i, evidence: "encoding option evidence was detected." },
    { signal: "uqr", pattern: /\buqr\b|from ["']uqr["']|encode\(/i, evidence: "uqr evidence was detected." },
    { signal: "encoded-size", pattern: /encoded\.size|height|width/i, evidence: "encoded size evidence was detected." },
    { signal: "pixel-size", pattern: /pixelSize|--qrcode-pixel-size/i, evidence: "pixel size evidence was detected." },
    { signal: "path-data", pattern: /paths\.push|paths\.join|pathData|encoded\.data/i, evidence: "path data evidence was detected." },
    { signal: "viewbox", pattern: /viewBox/i, evidence: "viewBox evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "encoding", "signal");
}

function qrCodeReadinessDownloadSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["downloadSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["downloadSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get-data-url", pattern: /getDataUrl|dataUrl|dataUri|data:image/i, evidence: "data URL evidence was detected." },
    { signal: "download-trigger", pattern: /getDownloadTriggerProps|DOWNLOAD_TRIGGER\.CLICK|download-trigger|Download QR/i, evidence: "download trigger evidence was detected." },
    { signal: "mime-type", pattern: /mimeType|image\/png|image\/svg/i, evidence: "mime type evidence was detected." },
    { signal: "quality", pattern: /\bquality\b/i, evidence: "quality evidence was detected." },
    { signal: "file-name", pattern: /fileName|download\s*=|native-qr\.svg|share-qr\.png/i, evidence: "file name evidence was detected." },
    { signal: "anchor-click", pattern: /createElement\(["']a|anchor\.click|a\.click|rel\s*=\s*["']noopener|setTimeout|remove\(\)/i, evidence: "anchor click evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "download", "signal");
}

function qrCodeReadinessAccessibilitySignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-img", pattern: /role=['"]img|getByRole\(['"]img/i, evidence: "role img evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "svg", pattern: /<svg|getFrameProps|data-qr-frame/i, evidence: "SVG evidence was detected." },
    { signal: "button", pattern: /<button|getDownloadTriggerProps|Download QR|getByRole\(['"]button/i, evidence: "button evidence was detected." },
    { signal: "overlay-alt", pattern: /overlay-alt|Brand overlay|Logo overlay|data-qr-overlay|figcaption/i, evidence: "overlay label evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function qrCodeReadinessMachineSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["machineSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<QrCodeSchema>|createMachine|qrCode\.machine/i, evidence: "createMachine evidence was detected." },
    { signal: "idle-state", pattern: /initialState\(\)|\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "value-context", pattern: /context\.get\(["']value|context\.get\s+value|context\.set\(["']value|context:\s*\{[\s\S]*value/i, evidence: "value context evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "pixel-size-default", pattern: /pixelSize:\s*10|pixelSize/i, evidence: "pixelSize default evidence was detected." },
    { signal: "computed-encoded", pattern: /computed:\s*\{[\s\S]*encoded|computed\(["']encoded|computed encoded/i, evidence: "computed encoded evidence was detected." },
    { signal: "memo-encoded", pattern: /\bmemo\(|\bmemo\b|memo encoded/i, evidence: "memo encoded evidence was detected." },
    { signal: "encode-uqr", pattern: /encode\(|\buqr\b/i, evidence: "uqr encode evidence was detected." },
    { signal: "value-set-event", pattern: /VALUE\.SET/i, evidence: "VALUE.SET event evidence was detected." },
    { signal: "download-trigger-event", pattern: /DOWNLOAD_TRIGGER\.CLICK/i, evidence: "download trigger event evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function qrCodeReadinessComputedSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["computedSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "encoded", pattern: /computed\(["']encoded|encoded\s*=|computed encoded/i, evidence: "encoded computed evidence was detected." },
    { signal: "encoded-size", pattern: /encoded\.size/i, evidence: "encoded size evidence was detected." },
    { signal: "encoded-data", pattern: /encoded\.data/i, evidence: "encoded data evidence was detected." },
    { signal: "width-height", pattern: /\bwidth\b|\bheight\b|--qrcode-width|--qrcode-height/i, evidence: "width/height evidence was detected." },
    { signal: "path-list", pattern: /paths\.push|paths\.join|path-list/i, evidence: "path list evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function qrCodeReadinessActionSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["actionSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-value", pattern: /setValue|context\.set\(["']value|VALUE\.SET/i, evidence: "set value action evidence was detected." },
    { signal: "download-qr-code", pattern: /downloadQrCode/i, evidence: "download QR code action evidence was detected." },
    { signal: "get-data-url", pattern: /getDataUrl|dataUri|data URL/i, evidence: "getDataUrl action evidence was detected." },
    { signal: "anchor-create", pattern: /createElement\(["']a|anchor-create/i, evidence: "anchor create evidence was detected." },
    { signal: "anchor-download", pattern: /\.download\s*=|download\s*=|fileName|anchor-download/i, evidence: "anchor download evidence was detected." },
    { signal: "anchor-click", pattern: /\.click\(\)|anchor\.click|a\.click|anchor-click/i, evidence: "anchor click evidence was detected." },
    { signal: "anchor-remove", pattern: /\.remove\(\)|anchor\.remove|a\.remove|\bremove\b|anchor-remove/i, evidence: "anchor remove evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function qrCodeReadinessDomSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["domSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id evidence was detected." },
    { signal: "frame-id", pattern: /getFrameId/i, evidence: "frame id evidence was detected." },
    { signal: "frame-el", pattern: /getFrameEl/i, evidence: "frame element evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function qrCodeReadinessApiSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["apiSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /api\.value|value:\s*context\.get|context\.get\(["']value/i, evidence: "value API evidence was detected." },
    { signal: "set-value", pattern: /api\.setValue|setValue\(value\)|VALUE\.SET/i, evidence: "setValue API evidence was detected." },
    { signal: "get-data-url", pattern: /api\.getDataUrl|getDataUrl\(type/i, evidence: "getDataUrl API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props evidence was detected." },
    { signal: "frame-props", pattern: /getFrameProps/i, evidence: "frame props evidence was detected." },
    { signal: "pattern-props", pattern: /getPatternProps/i, evidence: "pattern props evidence was detected." },
    { signal: "overlay-props", pattern: /getOverlayProps/i, evidence: "overlay props evidence was detected." },
    { signal: "download-trigger-props", pattern: /getDownloadTriggerProps/i, evidence: "download trigger props evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function qrCodeReadinessTestSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["testSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "download-test", pattern: /download-test|user\.click|Download QR/i, evidence: "download test evidence was detected." },
    { signal: "data-url-test", pattern: /data-url-test|getDataUrl|dataUrl|data:image/i, evidence: "data URL test evidence was detected." },
    { signal: "svg-test", pattern: /svg-test|getByRole\(['"]img|<svg|viewBox/i, evidence: "SVG test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|qr-code-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function qrCodeReadinessPackageSignals(sourceFiles: QrCodeReadinessSourceFile[]): QrCodeReadinessReport["packageSignals"] {
  const specs: Array<{ signal: QrCodeReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/qr-code", pattern: /@zag-js\/qr-code/i, evidence: "@zag-js/qr-code dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "proxy-memoize", pattern: /proxy-memoize/i, evidence: "proxy-memoize dependency evidence was detected." },
    { signal: "uqr", pattern: /"uqr"|from ["']uqr["']|\buqr\b/i, evidence: "uqr dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return qrCodeReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function qrCodeReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: QrCodeReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/qr-code-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
