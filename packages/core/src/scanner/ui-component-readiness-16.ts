import path from "node:path";
import type { DatePickerReadinessReport, ListboxReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildListboxReadinessReport(walk: WalkResult): Promise<ListboxReadinessReport> {
  const sourceFiles = await listboxReadinessSourceFiles(walk);
  const listboxSetups = listboxReadinessSetups(sourceFiles);
  const frameworkSignals = listboxReadinessFrameworkSignals(sourceFiles);
  const structureSignals = listboxReadinessStructureSignals(sourceFiles);
  const stateSignals = listboxReadinessStateSignals(sourceFiles);
  const collectionSignals = listboxReadinessCollectionSignals(sourceFiles);
  const selectionSignals = listboxReadinessSelectionSignals(sourceFiles);
  const highlightSignals = listboxReadinessHighlightSignals(sourceFiles);
  const interactionSignals = listboxReadinessInteractionSignals(sourceFiles);
  const keyboardSignals = listboxReadinessKeyboardSignals(sourceFiles);
  const accessibilitySignals = listboxReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = listboxReadinessMachineSignals(sourceFiles);
  const contextSignals = listboxReadinessContextSignals(sourceFiles);
  const computedSignals = listboxReadinessComputedSignals(sourceFiles);
  const effectSignals = listboxReadinessEffectSignals(sourceFiles);
  const actionSignals = listboxReadinessActionSignals(sourceFiles);
  const guardSignals = listboxReadinessGuardSignals(sourceFiles);
  const domSignals = listboxReadinessDomSignals(sourceFiles);
  const apiSignals = listboxReadinessApiSignals(sourceFiles);
  const testSignals = listboxReadinessTestSignals(sourceFiles);
  const packageSignals = listboxReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.contentCount > 0 && item.itemCount > 0);
  const hasCollection = collectionSignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.collectionCount > 0);
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.selectionCount > 0);
  const hasHighlight = highlightSignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.highlightCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.keyboardCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || listboxSetups.some((item) => item.testCount > 0);

  const riskQueue: ListboxReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a listbox boundary with root, label/input, content, option items, and value display.",
      why: "Listbox readiness starts with a traceable listbox/option surface before selection, highlight, keyboard, and typeahead behavior can be reviewed.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  if (hasStructure && !hasCollection) {
    riskQueue.push({
      priority: "medium",
      action: "Trace the collection model, item values, item labels, disabled items, and list/grid layout.",
      why: "Listbox behavior depends on stable item identity and collection navigation; DOM-only option markup is not enough for learner rebuilds.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  if ((hasFramework || hasCollection) && !hasSelection) {
    riskQueue.push({
      priority: "high",
      action: "Add or document value/defaultValue, selectionMode, select all, clear value, and selection callbacks.",
      why: "Single, multiple, and extended listboxes have different selection semantics and regression points.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  if ((hasFramework || hasSelection) && !hasHighlight) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document highlighted value ownership, auto-highlight, and highlight movement methods.",
      why: "Keyboard navigation, typeahead, focus visibility, and active-descendant semantics depend on highlighted item state.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  if ((hasSelection || hasHighlight) && !hasKeyboard) {
    riskQueue.push({
      priority: "high",
      action: "Add keyboard coverage for arrows, Home/End, Enter, Space, Escape, meta+a, shift extension, and loop focus.",
      why: "Listbox regressions often appear in keyboard-only selection and multi-select extension behavior.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  if ((hasStructure || hasSelection || hasHighlight) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Verify listbox, option, group roles plus ARIA selected, disabled, active-descendant, multiselectable, labelledby, and input control wiring.",
      why: "Listbox accessibility is a core contract, especially when focus stays on content or an input while active descendants move.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasSelection || hasKeyboard) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add tests or archived traces for keyboard, pointer hover, typeahead, single/multi selection, and ARIA attributes.",
      why: "Static listbox signals should be paired with focused regression tests before claiming UI readiness.",
      relatedHref: "html/listbox-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real listbox focus, typeahead, keyboard, pointer, and selection behavior outside RepoTutor.",
    why: "RepoTutor records listbox readiness only; it does not select real options, move focus, dispatch pointer/keyboard events, submit form values, mutate collections, scroll real DOM, or run analyzed project tests.",
    relatedHref: "html/listbox-readiness.html"
  });

  return {
    summary: `Listbox readiness report: setup ${listboxSetups.length} files, collection signal ${collectionSignals.length}, selection signal ${selectionSignals.length}, keyboard signal ${keyboardSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`,
    sourcePattern: "Listbox readiness Zag listbox collection selection highlight typeahead keyboard accessibility tests",
    listboxSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    collectionSignals,
    selectionSignals,
    highlightSignals,
    interactionSignals,
    keyboardSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    guardSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/listbox|listbox\\.machine|listbox\\.connect|getContentProps|getItemProps|getInputProps\" package.json src app packages", purpose: "Find Zag listbox machine usage and rendered root/input/content/item parts." },
      { command: "rg \"collection\\(|gridCollection|ListCollection|GridCollection|itemToValue|itemToString|getItemDisabled|selectionMode|selectAll|clearValue\" src app packages test tests", purpose: "Trace collection identity, disabled items, selection mode, select-all, and clear-value ownership." },
      { command: "rg \"highlightedValue|highlightFirst|highlightNext|typeahead|autoHighlight|scrollToHighlightedItem|aria-activedescendant\" src app packages test tests", purpose: "Check highlight ownership, typeahead, active-descendant, and scroll-to-highlight behavior." },
      { command: "rg \"role=['\\\"]listbox|role=['\\\"]option|aria-selected|aria-multiselectable|userEvent\\.keyboard|ArrowDown|Meta|listbox-traces|upload-artifact\" src app packages test tests .github", purpose: "Check ARIA roles, keyboard/multiselect tests, and archived listbox traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag listbox, Headless UI Listbox, or a custom listbox implementation.",
      "Trace root, label, input, content, item, item text, item indicator, item group, group label, and value text before inspecting behavior.",
      "Then inspect collection identity, list/grid layout, disabled item handling, selection mode, default value, selected values, and callbacks.",
      "Check highlighted value, auto-highlight, typeahead, keyboard navigation, pointer hover, ARIA active descendant, multi-select, and tests.",
      "This report is static readiness. Real focus movement, option selection, keyboard/pointer dispatch, DOM scrolling, form integration, and project tests need trusted QA."
    ]
  };
}

type ListboxReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function listboxReadinessSourceFiles(walk: WalkResult): Promise<ListboxReadinessSourceFile[]> {
  const files: ListboxReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !listboxReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!listboxReadinessPathSignal(file.relPath) && !listboxReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function listboxReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return listboxReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function listboxReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(listbox|listboxes|select|choices?|options?|collection|multi-select|multiselect|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function listboxReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/listbox|listbox\.machine|listbox\.connect|getContentProps|getItemProps|getInputProps|selectionMode|highlightedValue|aria-activedescendant|role=['"]listbox)/i.test(text);
}

function listboxReadinessSetups(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["listboxSetups"] {
  const rows: ListboxReadinessReport["listboxSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(getRootProps|data-part=['"]root|listbox root|custom listbox)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|data-part=['"]label|<label\b|aria-label|aria-labelledby|label)/gi);
    const inputCount = countMatches(source.text, /(getInputProps|data-part=['"]input|<input\b|aria-autocomplete|input-keydown)/gi);
    const contentCount = countMatches(source.text, /(getContentProps|data-part=['"]content|role=['"]listbox|role="listbox"|listbox content)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|data-part=['"]item|role=['"]option|role="option"|Listbox\.Option|\boption\b)/gi);
    const itemTextCount = countMatches(source.text, /(getItemTextProps|data-part=['"]item-text|itemText|item-text)/gi);
    const itemIndicatorCount = countMatches(source.text, /(getItemIndicatorProps|data-part=['"]item-indicator|itemIndicator|item-indicator)/gi);
    const itemGroupCount = countMatches(source.text, /(getItemGroupProps|data-part=['"]item-group|role=['"]group|getItemGroupLabelProps|item-group-label)/gi);
    const valueCount = countMatches(source.text, /(getValueTextProps|data-part=['"]value-text|valueText|valueAsString|\bvalue\b|defaultValue|default-value)/gi);
    const collectionCount = countMatches(source.text, /(collection|ListCollection|GridCollection|gridCollection|list-collection|grid-collection|itemToValue|itemToString|getItemDisabled|firstValue|lastValue|getNextValue|getPreviousValue|stringifyItems)/gi);
    const selectionCount = countMatches(source.text, /(selectionMode|selection-mode|selectValue|selectAll|select-all|clearValue|clear-value|setValue|onValueChange|on-value-change|onSelect|on-select|deselectable|selectOnHighlight|single|multiple|extended)/gi);
    const highlightCount = countMatches(source.text, /(highlightedValue|highlighted-value|defaultHighlightedValue|default-highlighted-value|highlightFirst|highlight-first|highlightLast|highlightNext|highlightPrevious|clearHighlightedValue|clear-highlight|autoHighlight|onHighlightChange)/gi);
    const keyboardCount = countMatches(source.text, /(ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Home|End|Enter|Space|Escape|meta\+a|CtrlOrMeta|shiftKey|loopFocus|keyboardPriority|keyboard-test)/gi);
    const typeaheadCount = countMatches(source.text, /(typeahead|CONTENT\.TYPEAHEAD|getByTypeahead|isTypingAhead|typing-ahead)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]listbox|role="listbox"|role=['"]option|role="option"|role=['"]group|aria-selected|aria-disabled|aria-activedescendant|aria-multiselectable|aria-labelledby|aria-haspopup|aria-controls|aria-autocomplete|tabIndex|tab-index|data-highlighted|data-selected|aria-test)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|keyboard-test|pointer-test|typeahead-test|selection-test|multi-select-test|aria-test|listbox-traces|upload-artifact)/gi);
    const total = rootCount + labelCount + inputCount + contentCount + itemCount + itemTextCount + itemIndicatorCount + itemGroupCount + valueCount + collectionCount + selectionCount + highlightCount + keyboardCount + typeaheadCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = contentCount > 0 && itemCount > 0 && collectionCount > 0 && selectionCount > 0 && highlightCount > 0 && keyboardCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: listboxReadinessFramework(source),
      rootCount,
      labelCount,
      inputCount,
      contentCount,
      itemCount,
      itemTextCount,
      itemIndicatorCount,
      itemGroupCount,
      valueCount,
      collectionCount,
      selectionCount,
      highlightCount,
      keyboardCount,
      typeaheadCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, input ${inputCount}, content ${contentCount}, item ${itemCount}, item text ${itemTextCount}, indicator ${itemIndicatorCount}, group ${itemGroupCount}, value ${valueCount}, collection ${collectionCount}, selection ${selectionCount}, highlight ${highlightCount}, keyboard ${keyboardCount}, typeahead ${typeaheadCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.collectionCount + b.selectionCount + b.highlightCount + b.accessibilityCount - (a.collectionCount + a.selectionCount + a.highlightCount + a.accessibilityCount));
}

function listboxReadinessFramework(source: ListboxReadinessSourceFile): ListboxReadinessReport["listboxSetups"][number]["framework"] {
  if (/@zag-js\/listbox|listbox\.machine|listbox\.connect/i.test(source.text)) return "zag-listbox";
  if (/custom listbox|role=['"]listbox|role="listbox"|aria-activedescendant|selection-mode/i.test(source.text)) return "custom";
  if (/@headlessui\/react|Listbox\.Button|Listbox\.Options|Listbox\.Option|<Listbox\b/i.test(source.text)) return "headless-listbox";
  return "unknown";
}

function listboxReadinessFrameworkSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-listbox", pattern: /@zag-js\/listbox|listbox\.machine|listbox\.connect/i, evidence: "Zag listbox evidence was detected." },
    { signal: "headless-listbox", pattern: /@headlessui\/react[\s\S]*Listbox|Listbox\.Button|Listbox\.Options|Listbox\.Option|<Listbox\b/i, evidence: "Headless UI Listbox evidence was detected." },
    { signal: "custom", pattern: /custom listbox|role=['"]listbox|role="listbox"|aria-activedescendant|selection-mode/i, evidence: "custom listbox evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function listboxReadinessStructureSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|custom listbox/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|data-part=['"]label|<label\b|aria-label|aria-labelledby/i, evidence: "label evidence was detected." },
    { signal: "input", pattern: /getInputProps|data-part=['"]input|<input\b|aria-autocomplete/i, evidence: "input evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]listbox|role="listbox"/i, evidence: "content/listbox evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-part=['"]item|role=['"]option|role="option"|Listbox\.Option/i, evidence: "item/option evidence was detected." },
    { signal: "item-text", pattern: /getItemTextProps|data-part=['"]item-text|itemText|item-text/i, evidence: "item text evidence was detected." },
    { signal: "item-indicator", pattern: /getItemIndicatorProps|data-part=['"]item-indicator|itemIndicator|item-indicator/i, evidence: "item indicator evidence was detected." },
    { signal: "item-group", pattern: /getItemGroupProps|data-part=['"]item-group|role=['"]group|role="group"/i, evidence: "item group evidence was detected." },
    { signal: "item-group-label", pattern: /getItemGroupLabelProps|data-part=['"]item-group-label|itemGroupLabel|item-group-label/i, evidence: "item group label evidence was detected." },
    { signal: "value-text", pattern: /getValueTextProps|data-part=['"]value-text|valueText|value-text|valueAsString/i, evidence: "value text evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function listboxReadinessStateSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["stateSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "focused", pattern: /\bfocused\b|setFocused|CONTENT\.FOCUS|INPUT\.FOCUS/i, evidence: "focused state evidence was detected." },
    { signal: "focus-visible", pattern: /focusVisible|focus-visible|trackFocusVisible/i, evidence: "focus-visible evidence was detected." },
    { signal: "empty", pattern: /\bempty\b|data-empty/i, evidence: "empty state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled|aria-disabled/i, evidence: "disabled state evidence was detected." },
    { signal: "highlighted", pattern: /\bhighlighted\b|data-highlighted|highlightedValue/i, evidence: "highlighted state evidence was detected." },
    { signal: "selected", pattern: /\bselected\b|data-selected|aria-selected/i, evidence: "selected state evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b|aria-multiselectable|selectionMode:\s*['"]multiple|selectionMode:\s*['"]extended/i, evidence: "multiple selection evidence was detected." },
    { signal: "typing-ahead", pattern: /isTypingAhead|typing-ahead|typeahead/i, evidence: "typing-ahead evidence was detected." },
    { signal: "interactive", pattern: /isInteractive|interactive|!prop\(["']disabled["']\)/i, evidence: "interactive state evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function listboxReadinessCollectionSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["collectionSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["collectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "collection", pattern: /\bcollection\b|prop\(["']collection["']\)/i, evidence: "collection evidence was detected." },
    { signal: "list-collection", pattern: /ListCollection|list-collection|collection\(/i, evidence: "ListCollection evidence was detected." },
    { signal: "grid-collection", pattern: /GridCollection|gridCollection|grid-collection|isGridCollection/i, evidence: "GridCollection evidence was detected." },
    { signal: "items", pattern: /\bitems\b|collection\.items|getValues/i, evidence: "items evidence was detected." },
    { signal: "first-last", pattern: /firstValue|lastValue|first-last/i, evidence: "first/last value evidence was detected." },
    { signal: "next-prev", pattern: /getNextValue|getPreviousValue|getNextRowValue|getPreviousRowValue|next-prev/i, evidence: "next/previous value evidence was detected." },
    { signal: "stringify-items", pattern: /stringifyItems|valueAsString|stringify-items/i, evidence: "stringify items evidence was detected." },
    { signal: "disabled-item", pattern: /getItemDisabled|isItemDisabled|disabled-item/i, evidence: "disabled item evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "collection", "signal");
}

function listboxReadinessSelectionSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|setValue|selectValue/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default-value/i, evidence: "default value evidence was detected." },
    { signal: "selection-mode", pattern: /selectionMode|selection-mode/i, evidence: "selection mode evidence was detected." },
    { signal: "single", pattern: /\bsingle\b/i, evidence: "single selection evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b/i, evidence: "multiple selection evidence was detected." },
    { signal: "extended", pattern: /\bextended\b|extendSelection|shift-selection/i, evidence: "extended selection evidence was detected." },
    { signal: "deselectable", pattern: /deselectable/i, evidence: "deselectable evidence was detected." },
    { signal: "select-on-highlight", pattern: /selectOnHighlight|select-on-highlight/i, evidence: "select-on-highlight evidence was detected." },
    { signal: "select-all", pattern: /selectAll|select-all|meta\+a|disallowSelectAll/i, evidence: "select-all evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|VALUE\.CLEAR|clear-value/i, evidence: "clear value evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange|on-value-change/i, evidence: "onValueChange evidence was detected." },
    { signal: "on-select", pattern: /onSelect|on-select|invokeOnSelect/i, evidence: "onSelect evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function listboxReadinessHighlightSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["highlightSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["highlightSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "highlighted-value", pattern: /highlightedValue|highlighted-value/i, evidence: "highlighted value evidence was detected." },
    { signal: "default-highlighted-value", pattern: /defaultHighlightedValue|default-highlighted-value/i, evidence: "default highlighted value evidence was detected." },
    { signal: "highlight-first", pattern: /highlightFirst|HIGHLIGHT\.FIRST|highlight-first/i, evidence: "highlight first evidence was detected." },
    { signal: "highlight-last", pattern: /highlightLast|HIGHLIGHT\.LAST|highlight-last/i, evidence: "highlight last evidence was detected." },
    { signal: "highlight-next", pattern: /highlightNext|HIGHLIGHT\.NEXT|highlight-next/i, evidence: "highlight next evidence was detected." },
    { signal: "highlight-previous", pattern: /highlightPrevious|HIGHLIGHT\.PREV|highlight-previous/i, evidence: "highlight previous evidence was detected." },
    { signal: "clear-highlight", pattern: /clearHighlightedValue|clearHighlightedItem|clear-highlight/i, evidence: "clear highlight evidence was detected." },
    { signal: "auto-highlight", pattern: /autoHighlight|auto-highlight/i, evidence: "auto-highlight evidence was detected." },
    { signal: "on-highlight-change", pattern: /onHighlightChange|on-highlight-change/i, evidence: "onHighlightChange evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "highlight", "signal");
}

function listboxReadinessInteractionSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "content-focus", pattern: /CONTENT\.FOCUS|content-focus|getContentProps[\s\S]*onFocus/i, evidence: "content focus evidence was detected." },
    { signal: "content-blur", pattern: /CONTENT\.BLUR|content-blur|getContentProps[\s\S]*onBlur/i, evidence: "content blur evidence was detected." },
    { signal: "item-click", pattern: /ITEM\.CLICK|item-click|onClick/i, evidence: "item click evidence was detected." },
    { signal: "pointer-move", pattern: /ITEM\.POINTER_MOVE|pointer-move|onPointerMove/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-leave", pattern: /ITEM\.POINTER_LEAVE|pointer-leave|onPointerLeave/i, evidence: "pointer leave evidence was detected." },
    { signal: "typeahead", pattern: /CONTENT\.TYPEAHEAD|typeahead|getByTypeahead/i, evidence: "typeahead evidence was detected." },
    { signal: "navigate", pattern: /\bNAVIGATE\b|navigate/i, evidence: "navigate evidence was detected." },
    { signal: "input-focus", pattern: /INPUT\.FOCUS|input-focus|getInputProps[\s\S]*onFocus/i, evidence: "input focus evidence was detected." },
    { signal: "input-blur", pattern: /input-blur|getInputProps[\s\S]*onBlur/i, evidence: "input blur evidence was detected." },
    { signal: "input-keydown", pattern: /input-keydown|getInputProps[\s\S]*onKeyDown/i, evidence: "input keydown evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function listboxReadinessKeyboardSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-up", pattern: /ArrowUp|arrow-up/i, evidence: "ArrowUp evidence was detected." },
    { signal: "arrow-down", pattern: /ArrowDown|arrow-down/i, evidence: "ArrowDown evidence was detected." },
    { signal: "arrow-left", pattern: /ArrowLeft|arrow-left/i, evidence: "ArrowLeft evidence was detected." },
    { signal: "arrow-right", pattern: /ArrowRight|arrow-right/i, evidence: "ArrowRight evidence was detected." },
    { signal: "home", pattern: /\bHome\b|\bhome\b/i, evidence: "Home key evidence was detected." },
    { signal: "end", pattern: /\bEnd\b|\bend\b/i, evidence: "End key evidence was detected." },
    { signal: "enter", pattern: /\bEnter\b|\benter\b/i, evidence: "Enter key evidence was detected." },
    { signal: "space", pattern: /\bSpace\b|\bspace\b/i, evidence: "Space key evidence was detected." },
    { signal: "escape", pattern: /\bEscape\b|\bescape\b/i, evidence: "Escape key evidence was detected." },
    { signal: "meta-a", pattern: /meta\+a|isCtrlOrMetaKey|disallowSelectAll|key\)\s*&&\s*computed\(["']multiple/i, evidence: "Meta/Ctrl+A evidence was detected." },
    { signal: "shift-selection", pattern: /shiftKey|shift-selection|extendSelection/i, evidence: "shift selection evidence was detected." },
    { signal: "loop-focus", pattern: /loopFocus|loop-focus/i, evidence: "loop focus evidence was detected." },
    { signal: "keyboard-priority", pattern: /keyboardPriority|keyboard-priority/i, evidence: "keyboard priority evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function listboxReadinessAccessibilitySignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-listbox", pattern: /role=['"]listbox|role="listbox"|role-listbox/i, evidence: "listbox role evidence was detected." },
    { signal: "role-option", pattern: /role=['"]option|role="option"|role-option/i, evidence: "option role evidence was detected." },
    { signal: "role-group", pattern: /role=['"]group|role="group"|role-group/i, evidence: "group role evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled evidence was detected." },
    { signal: "aria-activedescendant", pattern: /aria-activedescendant/i, evidence: "aria-activedescendant evidence was detected." },
    { signal: "aria-multiselectable", pattern: /aria-multiselectable/i, evidence: "aria-multiselectable evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-haspopup", pattern: /aria-haspopup/i, evidence: "aria-haspopup evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-autocomplete", pattern: /aria-autocomplete/i, evidence: "aria-autocomplete evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tab index evidence was detected." },
    { signal: "data-highlighted", pattern: /data-highlighted/i, evidence: "data-highlighted evidence was detected." },
    { signal: "data-selected", pattern: /data-selected/i, evidence: "data-selected evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function listboxReadinessMachineSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["machineSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|createMachine\s+ListboxSchema/i, evidence: "Zag listbox createMachine evidence was detected." },
    { signal: "default-props", pattern: /loopFocus[\s\S]{0,260}selectionMode|defaultValue \[\]|selectionMode single/i, evidence: "listbox default prop evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,80}idle|states[\s\S]{0,120}idle|initialState idle/i, evidence: "idle state evidence was detected." },
    { signal: "global-events", pattern: /HIGHLIGHTED_VALUE\.SET[\s\S]{0,260}HIGHLIGHT\.PREV|VALUE\.SET[\s\S]{0,120}VALUE\.CLEAR/i, evidence: "global machine event evidence was detected." },
    { signal: "selection-events", pattern: /ITEM\.SELECT|ITEM\.CLEAR|VALUE\.SET|VALUE\.CLEAR/i, evidence: "selection event evidence was detected." },
    { signal: "highlight-events", pattern: /HIGHLIGHTED_VALUE\.SET|HIGHLIGHT\.FIRST|HIGHLIGHT\.LAST|HIGHLIGHT\.NEXT|HIGHLIGHT\.PREV/i, evidence: "highlight event evidence was detected." },
    { signal: "input-events", pattern: /INPUT\.FOCUS|input-focus/i, evidence: "input event evidence was detected." },
    { signal: "content-events", pattern: /CONTENT\.FOCUS|CONTENT\.BLUR|CONTENT\.TYPEAHEAD/i, evidence: "content event evidence was detected." },
    { signal: "item-events", pattern: /ITEM\.CLICK|ITEM\.POINTER_MOVE|ITEM\.POINTER_LEAVE/i, evidence: "item event evidence was detected." },
    { signal: "navigate-event", pattern: /\bNAVIGATE\b/i, evidence: "navigate event evidence was detected." },
    { signal: "watch-value", pattern: /watch[\s\S]{0,180}value|watch value/i, evidence: "value watch evidence was detected." },
    { signal: "watch-highlighted-value", pattern: /watch[\s\S]{0,220}highlightedValue|watch value highlightedValue/i, evidence: "highlighted value watch evidence was detected." },
    { signal: "watch-collection", pattern: /watch[\s\S]{0,260}collection|watch value highlightedValue collection/i, evidence: "collection watch evidence was detected." },
    { signal: "track-focus-visible-effect", pattern: /effects[\s\S]{0,80}trackFocusVisible|trackFocusVisible/i, evidence: "trackFocusVisible effect evidence was detected." },
    { signal: "scroll-highlighted-effect", pattern: /scrollToHighlightedItem/i, evidence: "scroll highlighted effect evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function listboxReadinessContextSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["contextSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-context", pattern: /\bvalue\b[\s\S]{0,80}bindable|value bindable/i, evidence: "value context evidence was detected." },
    { signal: "highlighted-value-context", pattern: /highlightedValue[\s\S]{0,80}bindable|highlightedValue bindable/i, evidence: "highlighted value context evidence was detected." },
    { signal: "highlighted-item-context", pattern: /highlightedItem[\s\S]{0,80}bindable|highlightedItem bindable/i, evidence: "highlighted item context evidence was detected." },
    { signal: "selected-item-map-context", pattern: /selectedItemMap[\s\S]{0,80}bindable|selectedItemMap bindable/i, evidence: "selected item map context evidence was detected." },
    { signal: "focused-context", pattern: /focused[\s\S]{0,80}bindable|focused bindable/i, evidence: "focused context evidence was detected." },
    { signal: "typeahead-ref", pattern: /typeahead[\s\S]{0,80}(ref|defaultOptions)|typeahead ref/i, evidence: "typeahead ref evidence was detected." },
    { signal: "focus-visible-ref", pattern: /focusVisible[\s\S]{0,80}(ref|false)|focusVisible ref/i, evidence: "focus visible ref evidence was detected." },
    { signal: "input-state-ref", pattern: /inputState[\s\S]{0,120}autoHighlight|inputState autoHighlight/i, evidence: "input state ref evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function listboxReadinessComputedSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["computedSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "has-selected-items", pattern: /hasSelectedItems/i, evidence: "hasSelectedItems evidence was detected." },
    { signal: "is-typing-ahead", pattern: /isTypingAhead/i, evidence: "isTypingAhead evidence was detected." },
    { signal: "is-interactive", pattern: /isInteractive/i, evidence: "isInteractive evidence was detected." },
    { signal: "selection", pattern: /\bselection\b/i, evidence: "selection computed evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b/i, evidence: "multiple computed evidence was detected." },
    { signal: "selected-items", pattern: /selectedItems/i, evidence: "selectedItems evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString/i, evidence: "valueAsString evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function listboxReadinessEffectSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["effectSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-focus-visible", pattern: /trackFocusVisible/i, evidence: "track focus visible effect evidence was detected." },
    { signal: "scroll-to-highlighted-item", pattern: /scrollToHighlightedItem/i, evidence: "scroll to highlighted item effect evidence was detected." },
    { signal: "observe-active-descendant", pattern: /observeAttributes[\s\S]{0,160}data-activedescendant|observeAttributes data-activedescendant/i, evidence: "active descendant observe evidence was detected." },
    { signal: "scroll-into-view", pattern: /scrollIntoView/i, evidence: "scrollIntoView evidence was detected." },
    { signal: "interaction-modality", pattern: /setInteractionModality|getInteractionModality/i, evidence: "interaction modality evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function listboxReadinessActionSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["actionSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "select-highlighted-item", pattern: /selectHighlightedItem/i, evidence: "select highlighted item action evidence was detected." },
    { signal: "select-with-keyboard", pattern: /selectWithKeyboard/i, evidence: "select with keyboard action evidence was detected." },
    { signal: "highlight-item", pattern: /highlightItem/i, evidence: "highlight item action evidence was detected." },
    { signal: "highlight-matching-item", pattern: /highlightMatchingItem/i, evidence: "highlight matching item action evidence was detected." },
    { signal: "set-highlighted-item", pattern: /setHighlightedItem/i, evidence: "set highlighted item action evidence was detected." },
    { signal: "highlight-first-value", pattern: /highlightFirstValue/i, evidence: "highlight first value action evidence was detected." },
    { signal: "highlight-last-value", pattern: /highlightLastValue/i, evidence: "highlight last value action evidence was detected." },
    { signal: "highlight-next-value", pattern: /highlightNextValue/i, evidence: "highlight next value action evidence was detected." },
    { signal: "highlight-previous-value", pattern: /highlightPreviousValue/i, evidence: "highlight previous value action evidence was detected." },
    { signal: "clear-highlighted-item", pattern: /clearHighlightedItem/i, evidence: "clear highlighted item action evidence was detected." },
    { signal: "select-item", pattern: /selectItem/i, evidence: "select item action evidence was detected." },
    { signal: "clear-item", pattern: /clearItem/i, evidence: "clear item action evidence was detected." },
    { signal: "set-selected-items", pattern: /setSelectedItems/i, evidence: "set selected items action evidence was detected." },
    { signal: "clear-selected-items", pattern: /clearSelectedItems/i, evidence: "clear selected items action evidence was detected." },
    { signal: "sync-selected-items", pattern: /syncSelectedItems/i, evidence: "sync selected items action evidence was detected." },
    { signal: "sync-highlighted-item", pattern: /syncHighlightedItem/i, evidence: "sync highlighted item action evidence was detected." },
    { signal: "sync-highlighted-value", pattern: /syncHighlightedValue/i, evidence: "sync highlighted value action evidence was detected." },
    { signal: "set-focused", pattern: /setFocused/i, evidence: "set focused action evidence was detected." },
    { signal: "set-default-highlighted-value", pattern: /setDefaultHighlightedValue/i, evidence: "set default highlighted value action evidence was detected." },
    { signal: "clear-focused", pattern: /clearFocused/i, evidence: "clear focused action evidence was detected." },
    { signal: "set-input-state", pattern: /setInputState/i, evidence: "set input state action evidence was detected." },
    { signal: "clear-input-state", pattern: /clearInputState/i, evidence: "clear input state action evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function listboxReadinessGuardSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["guardSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "has-selected-value", pattern: /hasSelectedValue/i, evidence: "has selected value guard evidence was detected." },
    { signal: "has-highlighted-value", pattern: /hasHighlightedValue/i, evidence: "has highlighted value guard evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function listboxReadinessDomSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["domSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "content-id", pattern: /getContentId/i, evidence: "content id DOM evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id DOM evidence was detected." },
    { signal: "item-id", pattern: /getItemId/i, evidence: "item id DOM evidence was detected." },
    { signal: "item-group-id", pattern: /getItemGroupId/i, evidence: "item group id DOM evidence was detected." },
    { signal: "item-group-label-id", pattern: /getItemGroupLabelId/i, evidence: "item group label id DOM evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element DOM evidence was detected." },
    { signal: "item-el", pattern: /getItemEl/i, evidence: "item element DOM evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function listboxReadinessApiSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["apiSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "empty", pattern: /\bempty\b/i, evidence: "empty API evidence was detected." },
    { signal: "highlighted-item", pattern: /highlightedItem/i, evidence: "highlighted item API evidence was detected." },
    { signal: "highlighted-value", pattern: /highlightedValue/i, evidence: "highlighted value API evidence was detected." },
    { signal: "clear-highlighted-value", pattern: /clearHighlightedValue/i, evidence: "clear highlighted value API evidence was detected." },
    { signal: "selected-items", pattern: /selectedItems/i, evidence: "selected items API evidence was detected." },
    { signal: "has-selected-items", pattern: /hasSelectedItems/i, evidence: "has selected items API evidence was detected." },
    { signal: "value", pattern: /\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString/i, evidence: "valueAsString API evidence was detected." },
    { signal: "collection", pattern: /\bcollection\b/i, evidence: "collection API evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b/i, evidence: "disabled API evidence was detected." },
    { signal: "select-value", pattern: /selectValue/i, evidence: "select value API evidence was detected." },
    { signal: "set-value", pattern: /setValue/i, evidence: "set value API evidence was detected." },
    { signal: "select-all", pattern: /selectAll/i, evidence: "select all API evidence was detected." },
    { signal: "highlight-value", pattern: /highlightValue/i, evidence: "highlight value API evidence was detected." },
    { signal: "highlight-first", pattern: /highlightFirst/i, evidence: "highlight first API evidence was detected." },
    { signal: "highlight-last", pattern: /highlightLast/i, evidence: "highlight last API evidence was detected." },
    { signal: "highlight-next", pattern: /highlightNext/i, evidence: "highlight next API evidence was detected." },
    { signal: "highlight-previous", pattern: /highlightPrevious/i, evidence: "highlight previous API evidence was detected." },
    { signal: "clear-value", pattern: /clearValue/i, evidence: "clear value API evidence was detected." },
    { signal: "get-item-state", pattern: /getItemState/i, evidence: "get item state API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "input-props", pattern: /getInputProps/i, evidence: "input props API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "value-text-props", pattern: /getValueTextProps/i, evidence: "value text props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props API evidence was detected." },
    { signal: "item-text-props", pattern: /getItemTextProps/i, evidence: "item text props API evidence was detected." },
    { signal: "item-indicator-props", pattern: /getItemIndicatorProps/i, evidence: "item indicator props API evidence was detected." },
    { signal: "item-group-props", pattern: /getItemGroupProps/i, evidence: "item group props API evidence was detected." },
    { signal: "item-group-label-props", pattern: /getItemGroupLabelProps/i, evidence: "item group label props API evidence was detected." },
    { signal: "listbox-role", pattern: /role\s+listbox|role:\s*["']listbox|role=['"]listbox/i, evidence: "listbox role API evidence was detected." },
    { signal: "option-role", pattern: /role\s+option|role:\s*["']option|role=['"]option/i, evidence: "option role API evidence was detected." },
    { signal: "group-role", pattern: /role\s+group|role:\s*["']group|role=['"]group/i, evidence: "group role API evidence was detected." },
    { signal: "presentation-role", pattern: /role\s+presentation|role:\s*["']presentation|role=['"]presentation/i, evidence: "presentation role API evidence was detected." },
    { signal: "keyboard-map", pattern: /keyMap|onKeyDown|keyboardPriority/i, evidence: "keyboard map API evidence was detected." },
    { signal: "pointer-handlers", pattern: /onPointerMove|onMouseDown|onClick|ITEM\.POINTER_MOVE/i, evidence: "pointer handler API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|\bdir prop\b/i, evidence: "dir prop API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled|dataDisabled/i, evidence: "data disabled API evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation|dataOrientation/i, evidence: "data orientation API evidence was detected." },
    { signal: "data-state", pattern: /data-state|dataState/i, evidence: "data state API evidence was detected." },
    { signal: "data-layout", pattern: /data-layout|dataLayout/i, evidence: "data layout API evidence was detected." },
    { signal: "data-empty", pattern: /data-empty|dataEmpty/i, evidence: "data empty API evidence was detected." },
    { signal: "data-activedescendant", pattern: /data-activedescendant|dataActiveDescendant/i, evidence: "data active descendant API evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden|ariaHidden/i, evidence: "ARIA hidden API evidence was detected." },
    { signal: "autocomplete-off", pattern: /autoComplete:\s*["']off["']|autoComplete off/i, evidence: "autocomplete off API evidence was detected." },
    { signal: "spellcheck-false", pattern: /spellCheck:\s*false|spellCheck false/i, evidence: "spellcheck false API evidence was detected." },
    { signal: "enter-key-hint", pattern: /enterKeyHint:\s*["']go["']|enterKeyHint go/i, evidence: "enter key hint API evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function listboxReadinessTestSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["testSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|Arrow/i, evidence: "keyboard test evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|user\.click|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "typeahead-test", pattern: /typeahead-test|typeahead/i, evidence: "typeahead test evidence was detected." },
    { signal: "selection-test", pattern: /selection-test|selectValue|selectAll|clearValue/i, evidence: "selection test evidence was detected." },
    { signal: "multi-select-test", pattern: /multi-select-test|multiselect|multi-select|aria-multiselectable|meta\+a/i, evidence: "multi-select test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole|aria-/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|listbox-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function listboxReadinessPackageSignals(sourceFiles: ListboxReadinessSourceFile[]): ListboxReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ListboxReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/listbox", pattern: /@zag-js\/listbox/i, evidence: "@zag-js/listbox dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/collection", pattern: /@zag-js\/collection/i, evidence: "@zag-js/collection dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/focus-visible", pattern: /@zag-js\/focus-visible/i, evidence: "@zag-js/focus-visible dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return listboxReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function listboxReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ListboxReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/listbox-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDatePickerReadinessReport(walk: WalkResult): Promise<DatePickerReadinessReport> {
  const sourceFiles = await datePickerReadinessSourceFiles(walk);
  const datePickerSetups = datePickerReadinessSetups(sourceFiles);
  const frameworkSignals = datePickerReadinessFrameworkSignals(sourceFiles);
  const structureSignals = datePickerReadinessStructureSignals(sourceFiles);
  const stateSignals = datePickerReadinessStateSignals(sourceFiles);
  const valueSignals = datePickerReadinessValueSignals(sourceFiles);
  const selectionSignals = datePickerReadinessSelectionSignals(sourceFiles);
  const viewSignals = datePickerReadinessViewSignals(sourceFiles);
  const navigationSignals = datePickerReadinessNavigationSignals(sourceFiles);
  const segmentSignals = datePickerReadinessSegmentSignals(sourceFiles);
  const keyboardSignals = datePickerReadinessKeyboardSignals(sourceFiles);
  const accessibilitySignals = datePickerReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = datePickerReadinessMachineSignals(sourceFiles);
  const contextSignals = datePickerReadinessContextSignals(sourceFiles);
  const computedSignals = datePickerReadinessComputedSignals(sourceFiles);
  const effectSignals = datePickerReadinessEffectSignals(sourceFiles);
  const guardSignals = datePickerReadinessGuardSignals(sourceFiles);
  const actionSignals = datePickerReadinessActionSignals(sourceFiles);
  const domSignals = datePickerReadinessDomSignals(sourceFiles);
  const apiSignals = datePickerReadinessApiSignals(sourceFiles);
  const testSignals = datePickerReadinessTestSignals(sourceFiles);
  const packageSignals = datePickerReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready")
    || datePickerSetups.some((item) => item.rootCount > 0 && (item.tableCount > 0 || item.segmentCount > 0));
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || datePickerSetups.some((item) => item.selectionCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || datePickerSetups.some((item) => item.keyboardCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || datePickerSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || datePickerSetups.some((item) => item.testCount > 0);
  const hasSegments = segmentSignals.some((item) => item.readiness === "ready") || datePickerSetups.some((item) => item.segmentCount > 0);

  const riskQueue: DatePickerReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Trace the date picker/date input implementation path before claiming calendar selection readiness.",
      why: "Zag date-picker readiness starts with a root/control/input/trigger/content or segmented date input path learners can inspect.",
      relatedHref: "html/date-picker-readiness.html"
    });
  }
  if (hasStructure && !hasSelection) {
    riskQueue.push({
      priority: "high",
      action: "Add or document value, range, multiple, preset, and clear/select state transitions.",
      why: "Date picker UIs are risky when calendar structure exists but selected date/range lifecycle is not traceable.",
      relatedHref: "html/date-picker-readiness.html"
    });
  }
  if (hasStructure && !hasKeyboard) {
    riskQueue.push({
      priority: "high",
      action: "Cover Arrow, PageUp/PageDown, Home/End, Enter, and Escape calendar keyboard behavior.",
      why: "Date pickers rely on keyboard date navigation across days, weeks, months, years, and popup dismissal.",
      relatedHref: "html/date-picker-readiness.html"
    });
  }
  if (hasSegments && !segmentSignals.some((item) => item.signal === "spinbutton" && item.readiness === "ready")) {
    riskQueue.push({
      priority: "medium",
      action: "Expose segmented date input fields as spinbutton-like accessible controls.",
      why: "Zag date-input models editable date segments with spinbutton semantics and segment-specific keyboard behavior.",
      relatedHref: "html/date-picker-readiness.html"
    });
  }
  if (hasStructure && !hasA11y) {
    riskQueue.push({
      priority: "high",
      action: "Trace application/grid/gridcell/button/spinbutton roles and aria state on date picker parts.",
      why: "Calendar popups and segmented date inputs need explicit ARIA roles, labels, selected/current state, invalid/read-only state, and hidden input behavior.",
      relatedHref: "html/date-picker-readiness.html"
    });
  }
  if ((hasStructure || hasSelection || hasKeyboard) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add focused tests for date selection, range selection, segmented input editing, keyboard navigation, and ARIA queries.",
      why: "Date picker readiness is strongest when project tests assert date lifecycle and accessibility behavior instead of only rendering markup.",
      relatedHref: "html/date-picker-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real calendar popup, focus, date selection, segmented input, keyboard, hidden input, live region, and popper behavior outside RepoTutor.",
    why: "RepoTutor records date picker readiness only; it does not open real calendars, move focus, select dates, parse live locale input, dispatch keyboard/pointer events, submit hidden form values, mutate real date objects, position poppers, update live regions, or run analyzed project tests.",
    relatedHref: "html/date-picker-readiness.html"
  });

  return {
    summary: datePickerSetups.length > 0
      ? `Detected ${datePickerSetups.length} date picker/date input readiness source file(s).`
      : "No date picker readiness source files were detected.",
    sourcePattern: "Date picker readiness Zag date-picker date-input range calendar segment keyboard accessibility tests",
    datePickerSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    valueSignals,
    selectionSignals,
    viewSignals,
    navigationSignals,
    segmentSignals,
    keyboardSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    guardSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/date-picker|datePicker\\.machine|datePicker\\.connect|getTableProps|getDayTableCellProps|getTriggerProps\" package.json src app packages",
        purpose: "Find Zag date-picker package usage, machine/connect setup, calendar table, cells, and trigger wiring."
      },
      {
        command: "rg \"@zag-js/date-input|getSegmentProps|getHiddenInputProps|role=['\\\"]spinbutton|contentEditable|SEGMENT\\.\" package.json src app packages",
        purpose: "Find segmented date input fields, hidden form values, spinbutton semantics, and segment keyboard events."
      },
      {
        command: "rg \"role=['\\\"]application|role=['\\\"]grid|role=['\\\"]gridcell|aria-selected|aria-current|PageUp|PageDown|date-picker-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check calendar popup ARIA, keyboard navigation, date picker tests, and trace artifact uploads."
      }
    ],
    learnerNextSteps: [
      "Open the source links for the date picker setup rows and identify whether selection is single, multiple, or range.",
      "Compare the keyboard signal list against calendar popup tests before trusting calendar accessibility behavior.",
      "Confirm segmented date input fields submit the same value users see through a hidden input or form boundary.",
      "Use the risk queue to decide whether missing behavior belongs in tests, documentation, or implementation."
    ]
  };
}

type DatePickerReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function datePickerReadinessSourceFiles(walk: WalkResult): Promise<DatePickerReadinessSourceFile[]> {
  const files: DatePickerReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !datePickerReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!datePickerReadinessPathSignal(file.relPath) && !datePickerReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 220) break;
  }
  return files;
}

function datePickerReadinessInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return datePickerReadinessPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css)$/i.test(filePath);
}

function datePickerReadinessPathSignal(filePath: string): boolean {
  return /date[-_]?picker|date[-_]?input|calendar|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function datePickerReadinessContentSignal(text: string): boolean {
  return /@zag-js\/date-picker|@zag-js\/date-input|datePicker\.machine|dateInput\.machine|getDayTableCellProps|getSegmentProps|role=['"]gridcell|role=['"]spinbutton|date-picker-traces/i.test(text);
}

function datePickerReadinessSetups(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["datePickerSetups"] {
  const rows: DatePickerReadinessReport["datePickerSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /getRootProps|data-part=['"]root|date-picker-root|date-input-root/i);
    const labelCount = countMatches(source.text, /getLabelProps|data-part=['"]label|<label\b|aria-label|aria-labelledby/i);
    const controlCount = countMatches(source.text, /getControlProps|data-part=['"]control|date-picker-control|date-input-control/i);
    const inputCount = countMatches(source.text, /getInputProps|data-part=['"]input|<input\b|inputValue|date-picker-input/i);
    const triggerCount = countMatches(source.text, /getTriggerProps|getClearTriggerProps|getPrevTriggerProps|getNextTriggerProps|getViewTriggerProps|getPresetTriggerProps|data-part=['"][^'"]*trigger|trigger/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|role=['"]application|aria-roledescription=['"]datepicker/i);
    const tableCount = countMatches(source.text, /getTableProps|data-part=['"]table|<table\b|role=['"]grid/i);
    const cellCount = countMatches(source.text, /getDayTableCellProps|getDayTableCellTriggerProps|data-part=['"]table-cell|role=['"]gridcell/i);
    const segmentCount = countMatches(source.text, /getSegmentProps|data-part=['"]segment|segmentGroup|role=['"]spinbutton|SEGMENT\./i);
    const rangeCount = countMatches(source.text, /range|selectionMode:\s*['"]range|selectedRange|hoveredRange|visibleRange|rangeText/i);
    const selectionCount = countMatches(source.text, /selectionMode|setValue|clearValue|selectToday|CELL\.CLICK|VALUE\.SET|VALUE\.CLEAR|aria-selected/i);
    const navigationCount = countMatches(source.text, /goToNext|goToPrev|GOTO\.NEXT|GOTO\.PREV|PageUp|PageDown|nextTrigger|prevTrigger|focusMonth|focusYear|getYearsGrid|getMonthsGrid/i);
    const keyboardCount = countMatches(source.text, /ArrowLeft|ArrowRight|ArrowUp|ArrowDown|PageUp|PageDown|Home|End|Enter|Escape|keyboard|SEGMENT\.ARROW/i);
    const accessibilityCount = countMatches(source.text, /role=['"](application|grid|gridcell|button|spinbutton)|aria-|data-state|hiddenInput|contentEditable/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|@testing-library\/react|userEvent|user\.keyboard|user\.click|getByRole|upload-artifact|date-picker-traces/i);
    const evidenceScore = rootCount + controlCount + inputCount + triggerCount + contentCount + tableCount + cellCount + segmentCount + selectionCount + keyboardCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !datePickerReadinessPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: datePickerReadinessFramework(source),
      rootCount,
      labelCount,
      controlCount,
      inputCount,
      triggerCount,
      contentCount,
      tableCount,
      cellCount,
      segmentCount,
      rangeCount,
      selectionCount,
      navigationCount,
      keyboardCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 8 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static date picker/date input readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 80);
}

function datePickerReadinessFramework(source: DatePickerReadinessSourceFile): DatePickerReadinessReport["datePickerSetups"][number]["framework"] {
  if (/@zag-js\/date-picker|datePicker\.machine|datePicker\.connect/i.test(source.text)) return "zag-date-picker";
  if (/@zag-js\/date-input|dateInput\.machine|dateInput\.connect/i.test(source.text)) return "zag-date-input";
  if (/custom date picker|role=['"]gridcell|role=['"]spinbutton|date-picker-traces|calendar/i.test(source.text)) return "custom";
  return "unknown";
}

function datePickerReadinessFrameworkSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-date-picker", pattern: /@zag-js\/date-picker|datePicker\.machine|datePicker\.connect/i, evidence: "Zag date-picker evidence was detected." },
    { signal: "zag-date-input", pattern: /@zag-js\/date-input|dateInput\.machine|dateInput\.connect/i, evidence: "Zag date-input evidence was detected." },
    { signal: "custom", pattern: /custom date picker|role=['"]gridcell|role=['"]spinbutton|date-picker-traces|calendar/i, evidence: "custom date picker evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function datePickerReadinessStructureSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["structureSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|date-picker-root|date-input-root/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|data-part=['"]label|<label\b|aria-label|aria-labelledby/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control|date-picker-control|date-input-control/i, evidence: "control evidence was detected." },
    { signal: "input", pattern: /getInputProps|data-part=['"]input|inputValue|<input\b/i, evidence: "input evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger|TRIGGER\.CLICK/i, evidence: "trigger evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]application|aria-roledescription=['"]datepicker/i, evidence: "content evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner|positioning|currentPlacement/i, evidence: "positioner evidence was detected." },
    { signal: "table", pattern: /getTableProps|data-part=['"]table|role=['"]grid|<table\b/i, evidence: "calendar table evidence was detected." },
    { signal: "table-cell", pattern: /getDayTableCellProps|data-part=['"]table-cell|role=['"]gridcell/i, evidence: "table cell evidence was detected." },
    { signal: "table-cell-trigger", pattern: /getDayTableCellTriggerProps|data-part=['"]table-cell-trigger|tableCellTrigger/i, evidence: "table cell trigger evidence was detected." },
    { signal: "month-select", pattern: /getMonthSelectProps|data-part=['"]month-select|monthSelect/i, evidence: "month select evidence was detected." },
    { signal: "year-select", pattern: /getYearSelectProps|data-part=['"]year-select|yearSelect/i, evidence: "year select evidence was detected." },
    { signal: "range-text", pattern: /getRangeTextProps|data-part=['"]range-text|visibleRangeText|rangeText/i, evidence: "range text evidence was detected." },
    { signal: "segment-group", pattern: /getSegmentGroupProps|data-part=['"]segment-group|segmentGroup/i, evidence: "segment group evidence was detected." },
    { signal: "segment", pattern: /getSegmentProps|data-part=['"]segment|SEGMENT\./i, evidence: "segment evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|data-part=['"]hidden-input|hiddenInput|type=['"]hidden/i, evidence: "hidden input evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function datePickerReadinessStateSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["stateSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "open", pattern: /\bopen\b|data-state=['"]open|OPEN|setOpen/i, evidence: "open state evidence was detected." },
    { signal: "focused", pattern: /\bfocused\b|focusedValue|FOCUS\.SET|SEGMENT\.FOCUS/i, evidence: "focused state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed|CONTROLLED\.CLOSE/i, evidence: "closed state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|aria-disabled|data-disabled/i, evidence: "disabled state evidence was detected." },
    { signal: "readonly", pattern: /readOnly|readonly|aria-readonly/i, evidence: "read-only state evidence was detected." },
    { signal: "invalid", pattern: /\binvalid\b|aria-invalid|data-invalid/i, evidence: "invalid state evidence was detected." },
    { signal: "inline", pattern: /\binline\b/i, evidence: "inline mode evidence was detected." },
    { signal: "empty", pattern: /\bempty\b|data-empty|isValueEmpty/i, evidence: "empty state evidence was detected." },
    { signal: "hovered", pattern: /\bhovered\b|hoveredValue|CELL\.POINTER_MOVE/i, evidence: "hovered state evidence was detected." },
    { signal: "unavailable", pattern: /\bunavailable\b|isUnavailable|data-unavailable/i, evidence: "unavailable date evidence was detected." },
    { signal: "selected", pattern: /\bselected\b|aria-selected|data-selected/i, evidence: "selected state evidence was detected." },
    { signal: "today", pattern: /\btoday\b|selectToday|data-today|aria-current/i, evidence: "today state evidence was detected." },
    { signal: "weekend", pattern: /\bweekend\b|data-weekend/i, evidence: "weekend state evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function datePickerReadinessValueSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["valueSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|VALUE\.SET/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default-value/i, evidence: "default value evidence was detected." },
    { signal: "focused-value", pattern: /focusedValue|focused-value/i, evidence: "focused value evidence was detected." },
    { signal: "default-focused-value", pattern: /defaultFocusedValue|default-focused-value/i, evidence: "default focused value evidence was detected." },
    { signal: "input-value", pattern: /inputValue|input-value|INPUT\.CHANGE/i, evidence: "input value evidence was detected." },
    { signal: "placeholder-value", pattern: /placeholderValue|placeholder-value/i, evidence: "placeholder value evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|value-as-string/i, evidence: "valueAsString evidence was detected." },
    { signal: "value-as-date", pattern: /valueAsDate|value-as-date/i, evidence: "valueAsDate evidence was detected." },
    { signal: "set-value", pattern: /setValue|VALUE\.SET|set-value/i, evidence: "set value evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|VALUE\.CLEAR|clear-value/i, evidence: "clear value evidence was detected." },
    { signal: "set-time", pattern: /setTime|set-time/i, evidence: "set time evidence was detected." },
    { signal: "select-today", pattern: /selectToday|select-today/i, evidence: "select today evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function datePickerReadinessSelectionSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "single", pattern: /\bsingle\b|selectionMode:\s*['"]single/i, evidence: "single selection evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b|selectionMode:\s*['"]multiple|aria-multiselectable/i, evidence: "multiple selection evidence was detected." },
    { signal: "range", pattern: /\brange\b|selectionMode:\s*['"]range|rangeText/i, evidence: "range selection evidence was detected." },
    { signal: "max-selected-dates", pattern: /maxSelectedDates|max-selected-dates/i, evidence: "max selected dates evidence was detected." },
    { signal: "selecting-end-date", pattern: /selectingEndDate|selecting-end-date/i, evidence: "selecting end date evidence was detected." },
    { signal: "selected-range", pattern: /selectedRange|selected-range/i, evidence: "selected range evidence was detected." },
    { signal: "hovered-range", pattern: /hoveredRange|hovered-range/i, evidence: "hovered range evidence was detected." },
    { signal: "close-on-select", pattern: /closeOnSelect|close-on-select/i, evidence: "close on select evidence was detected." },
    { signal: "outside-day-selectable", pattern: /outsideDaySelectable|outside-day-selectable/i, evidence: "outside day selectable evidence was detected." },
    { signal: "preset-click", pattern: /PRESET\.CLICK|preset-click|getPresetTriggerProps/i, evidence: "preset click evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function datePickerReadinessViewSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["viewSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["viewSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "day-view", pattern: /view:\s*['"]day|day-view|\bday\b/i, evidence: "day view evidence was detected." },
    { signal: "month-view", pattern: /view:\s*['"]month|month-view|\bmonth\b/i, evidence: "month view evidence was detected." },
    { signal: "year-view", pattern: /view:\s*['"]year|year-view|\byear\b/i, evidence: "year view evidence was detected." },
    { signal: "min-view", pattern: /minView|min-view/i, evidence: "min view evidence was detected." },
    { signal: "max-view", pattern: /maxView|max-view/i, evidence: "max view evidence was detected." },
    { signal: "view-change", pattern: /VIEW\.SET|onViewChange|view-change/i, evidence: "view change evidence was detected." },
    { signal: "set-view", pattern: /setView|set-view/i, evidence: "set view evidence was detected." },
    { signal: "next-view", pattern: /getNextView|next-view/i, evidence: "next view evidence was detected." },
    { signal: "previous-view", pattern: /getPrevView|previous-view|prev-view/i, evidence: "previous view evidence was detected." },
    { signal: "decade", pattern: /decade|getDecade/i, evidence: "decade evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "view", "signal");
}

function datePickerReadinessNavigationSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "next-trigger", pattern: /getNextTriggerProps|nextTrigger|next-trigger/i, evidence: "next trigger evidence was detected." },
    { signal: "prev-trigger", pattern: /getPrevTriggerProps|prevTrigger|prev-trigger/i, evidence: "previous trigger evidence was detected." },
    { signal: "goto-next", pattern: /GOTO\.NEXT|goToNext|goto-next/i, evidence: "go to next evidence was detected." },
    { signal: "goto-prev", pattern: /GOTO\.PREV|goToPrev|goto-prev/i, evidence: "go to previous evidence was detected." },
    { signal: "next-page", pattern: /nextPage|next-page|PageDown/i, evidence: "next page evidence was detected." },
    { signal: "previous-page", pattern: /previousPage|prevPage|previous-page|PageUp/i, evidence: "previous page evidence was detected." },
    { signal: "next-year", pattern: /nextYear|next-year/i, evidence: "next year evidence was detected." },
    { signal: "previous-year", pattern: /previousYear|previous-year|prev-year/i, evidence: "previous year evidence was detected." },
    { signal: "next-decade", pattern: /nextDecade|next-decade/i, evidence: "next decade evidence was detected." },
    { signal: "previous-decade", pattern: /previousDecade|previous-decade|prev-decade/i, evidence: "previous decade evidence was detected." },
    { signal: "month-grid", pattern: /getMonthsGrid|getMonths|month-grid/i, evidence: "month grid evidence was detected." },
    { signal: "year-grid", pattern: /getYearsGrid|getYears|year-grid/i, evidence: "year grid evidence was detected." },
    { signal: "week-days", pattern: /weekDays|getDaysInWeek|week-days/i, evidence: "week days evidence was detected." },
    { signal: "week-numbers", pattern: /showWeekNumbers|getWeekNumber|week-numbers/i, evidence: "week numbers evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function datePickerReadinessSegmentSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["segmentSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["segmentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "segment-focus", pattern: /SEGMENT\.FOCUS|segment-focus|getSegmentProps[\s\S]*onFocus/i, evidence: "segment focus evidence was detected." },
    { signal: "segment-blur", pattern: /SEGMENT\.BLUR|segment-blur|getSegmentProps[\s\S]*onBlur/i, evidence: "segment blur evidence was detected." },
    { signal: "segment-input", pattern: /SEGMENT\.INPUT|segment-input|getSegmentProps[\s\S]*onInput/i, evidence: "segment input evidence was detected." },
    { signal: "segment-adjust", pattern: /SEGMENT\.ADJUST|segment-adjust|adjustSegment/i, evidence: "segment adjust evidence was detected." },
    { signal: "segment-arrow-left", pattern: /SEGMENT\.ARROW_LEFT|segment-arrow-left|ArrowLeft/i, evidence: "segment ArrowLeft evidence was detected." },
    { signal: "segment-arrow-right", pattern: /SEGMENT\.ARROW_RIGHT|segment-arrow-right|ArrowRight/i, evidence: "segment ArrowRight evidence was detected." },
    { signal: "segment-backspace", pattern: /SEGMENT\.BACKSPACE|segment-backspace|Backspace/i, evidence: "segment Backspace evidence was detected." },
    { signal: "segment-home", pattern: /SEGMENT\.HOME|segment-home|\bHome\b/i, evidence: "segment Home evidence was detected." },
    { signal: "segment-end", pattern: /SEGMENT\.END|segment-end|\bEnd\b/i, evidence: "segment End evidence was detected." },
    { signal: "segment-paste", pattern: /SEGMENT\.PASTE|segment-paste|\bpaste\b/i, evidence: "segment paste evidence was detected." },
    { signal: "spinbutton", pattern: /role=['"]spinbutton|role="spinbutton"|spinbutton/i, evidence: "spinbutton evidence was detected." },
    { signal: "contenteditable", pattern: /contentEditable|contenteditable/i, evidence: "contentEditable evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "segment", "signal");
}

function datePickerReadinessKeyboardSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-left", pattern: /ArrowLeft|arrow-left/i, evidence: "ArrowLeft evidence was detected." },
    { signal: "arrow-right", pattern: /ArrowRight|arrow-right/i, evidence: "ArrowRight evidence was detected." },
    { signal: "arrow-up", pattern: /ArrowUp|arrow-up/i, evidence: "ArrowUp evidence was detected." },
    { signal: "arrow-down", pattern: /ArrowDown|arrow-down/i, evidence: "ArrowDown evidence was detected." },
    { signal: "page-up", pattern: /PageUp|page-up/i, evidence: "PageUp evidence was detected." },
    { signal: "page-down", pattern: /PageDown|page-down/i, evidence: "PageDown evidence was detected." },
    { signal: "home", pattern: /\bHome\b|\bhome\b/i, evidence: "Home key evidence was detected." },
    { signal: "end", pattern: /\bEnd\b|\bend\b/i, evidence: "End key evidence was detected." },
    { signal: "enter", pattern: /\bEnter\b|\benter\b/i, evidence: "Enter key evidence was detected." },
    { signal: "escape", pattern: /\bEscape\b|\bescape\b/i, evidence: "Escape key evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function datePickerReadinessAccessibilitySignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-application", pattern: /role=['"]application|role="application"/i, evidence: "application role evidence was detected." },
    { signal: "role-grid", pattern: /role=['"]grid|role="grid"/i, evidence: "grid role evidence was detected." },
    { signal: "role-gridcell", pattern: /role=['"]gridcell|role="gridcell"/i, evidence: "gridcell role evidence was detected." },
    { signal: "role-button", pattern: /role=['"]button|role="button"|<button\b/i, evidence: "button role evidence was detected." },
    { signal: "role-spinbutton", pattern: /role=['"]spinbutton|role="spinbutton"/i, evidence: "spinbutton role evidence was detected." },
    { signal: "aria-roledescription", pattern: /aria-roledescription/i, evidence: "aria-roledescription evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid evidence was detected." },
    { signal: "aria-current", pattern: /aria-current/i, evidence: "aria-current evidence was detected." },
    { signal: "aria-multiselectable", pattern: /aria-multiselectable/i, evidence: "aria-multiselectable evidence was detected." },
    { signal: "aria-readonly", pattern: /aria-readonly/i, evidence: "aria-readonly evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|hiddenInput|type=['"]hidden/i, evidence: "hidden input evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function datePickerReadinessMachineSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["machineSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|datePicker\.machine|machine\s*=/i, evidence: "Zag createMachine or machine usage evidence was detected." },
    { signal: "create-guards", pattern: /createGuards|guards\s*:/i, evidence: "guard creation/registration evidence was detected." },
    { signal: "default-props", pattern: /props:\s*\(|defaultValue|defaultOpen|defaultFocusedValue|minView|maxView|selectionMode|numOfMonths/i, evidence: "default props evidence was detected." },
    { signal: "initial-state", pattern: /initialState|idle|focused|open/i, evidence: "initial state evidence was detected." },
    { signal: "refs", pattern: /refs:\s*\(|announcer|setupLiveRegion/i, evidence: "machine refs evidence was detected." },
    { signal: "bindable-context", pattern: /bindable|focusedValue|inputValue|activeIndex|hoveredValue|startValue|currentPlacement|restoreFocus/i, evidence: "bindable context evidence was detected." },
    { signal: "computed-state", pattern: /computed:|isInteractive|visibleDuration|visibleRangeText|isPrevVisibleRangeValid|isNextVisibleRangeValid|valueAsString/i, evidence: "computed state evidence was detected." },
    { signal: "watch-props", pattern: /watch:|syncInputElement|syncInputValue|invokeOnVisibleRangeChange|focusActiveCellIfNeeded/i, evidence: "watch/effect trigger evidence was detected." },
    { signal: "root-events", pattern: /VALUE\.SET|VIEW\.SET|FOCUS\.SET|INPUT\.CHANGE|PRESET\.CLICK|GOTO\.NEXT|GOTO\.PREV/i, evidence: "root event evidence was detected." },
    { signal: "open-state", pattern: /open:\s*\{|trackDismissableElement|trackPositioning|INTERACT_OUTSIDE|CELL\.CLICK/i, evidence: "open state transition evidence was detected." },
    { signal: "implementation-block", pattern: /date-picker\.machine|DatePickerSchema|createMachine|createGuards|datePicker\.connect|@zag-js\/date-picker/i, evidence: "Zag date-picker implementation block evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function datePickerReadinessContextSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["contextSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focused-value", pattern: /focusedValue|focused-value/i, evidence: "focusedValue context evidence was detected." },
    { signal: "value", pattern: /\bvalue\b|VALUE\.SET|VALUE\.CLEAR/i, evidence: "value context evidence was detected." },
    { signal: "input-value", pattern: /inputValue|input-value|INPUT\.CHANGE/i, evidence: "inputValue context evidence was detected." },
    { signal: "active-index", pattern: /activeIndex|active-index/i, evidence: "activeIndex context evidence was detected." },
    { signal: "hovered-value", pattern: /hoveredValue|hovered-value/i, evidence: "hoveredValue context evidence was detected." },
    { signal: "view", pattern: /\bview\b|VIEW\.SET|setView/i, evidence: "view context evidence was detected." },
    { signal: "start-value", pattern: /startValue|start-value|setStartValue/i, evidence: "startValue context evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement|getPlacement|positioning/i, evidence: "current placement context evidence was detected." },
    { signal: "restore-focus", pattern: /restoreFocus|restore-focus|setRestoreFocus/i, evidence: "restoreFocus context evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function datePickerReadinessComputedSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["computedSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-interactive", pattern: /isInteractive|is-interactive/i, evidence: "isInteractive computed evidence was detected." },
    { signal: "visible-duration", pattern: /visibleDuration|visible-duration/i, evidence: "visibleDuration computed evidence was detected." },
    { signal: "end-value", pattern: /endValue|end-value/i, evidence: "endValue computed evidence was detected." },
    { signal: "visible-range", pattern: /visibleRange\b|visible-range/i, evidence: "visibleRange computed evidence was detected." },
    { signal: "visible-range-text", pattern: /visibleRangeText|visible-range-text/i, evidence: "visibleRangeText computed evidence was detected." },
    { signal: "prev-visible-range-valid", pattern: /isPrevVisibleRangeValid|prev-visible-range-valid/i, evidence: "previous visible range validity evidence was detected." },
    { signal: "next-visible-range-valid", pattern: /isNextVisibleRangeValid|next-visible-range-valid/i, evidence: "next visible range validity evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|value-as-string/i, evidence: "valueAsString computed evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function datePickerReadinessEffectSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["effectSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "setup-live-region", pattern: /setupLiveRegion|@zag-js\/live-region|announcer/i, evidence: "live region setup evidence was detected." },
    { signal: "track-positioning", pattern: /trackPositioning|@zag-js\/popper|getPlacement|positioning/i, evidence: "position tracking evidence was detected." },
    { signal: "track-dismissable-element", pattern: /trackDismissableElement|@zag-js\/dismissable|INTERACT_OUTSIDE/i, evidence: "dismissable element tracking evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function datePickerReadinessGuardSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["guardSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-above-min-view", pattern: /isAboveMinView|above-min-view/i, evidence: "min view guard evidence was detected." },
    { signal: "is-day-view", pattern: /isDayView|day-view/i, evidence: "day view guard evidence was detected." },
    { signal: "is-month-view", pattern: /isMonthView|month-view/i, evidence: "month view guard evidence was detected." },
    { signal: "is-year-view", pattern: /isYearView|year-view/i, evidence: "year view guard evidence was detected." },
    { signal: "is-range-picker", pattern: /isRangePicker|range-picker|selectionMode:\s*['"]range/i, evidence: "range picker guard evidence was detected." },
    { signal: "has-selected-range", pattern: /hasSelectedRange|selected-range/i, evidence: "selected range guard evidence was detected." },
    { signal: "is-multi-picker", pattern: /isMultiPicker|multi-picker|selectionMode:\s*['"]multiple/i, evidence: "multi picker guard evidence was detected." },
    { signal: "can-select-date", pattern: /canSelectDate|isDateUnavailable|can-select-date/i, evidence: "date selectability guard evidence was detected." },
    { signal: "should-restore-focus", pattern: /shouldRestoreFocus|restore-focus/i, evidence: "restore focus guard evidence was detected." },
    { signal: "is-selecting-end-date", pattern: /isSelectingEndDate|selecting-end-date/i, evidence: "range end selection guard evidence was detected." },
    { signal: "close-on-select", pattern: /closeOnSelect|close-on-select/i, evidence: "close-on-select guard evidence was detected." },
    { signal: "is-open-controlled", pattern: /isOpenControlled|open-controlled/i, evidence: "open controlled guard evidence was detected." },
    { signal: "interact-outside-event", pattern: /isInteractOutsideEvent|INTERACT_OUTSIDE|interact-outside/i, evidence: "interact outside guard evidence was detected." },
    { signal: "input-value-empty", pattern: /isInputValueEmpty|input-value-empty/i, evidence: "input empty guard evidence was detected." },
    { signal: "fix-on-blur", pattern: /shouldFixOnBlur|fix-on-blur/i, evidence: "fix-on-blur guard evidence was detected." },
    { signal: "day-pointer-outside-visible-month", pattern: /isDayPointerMoveOutsideVisibleMonth|outside-visible-month/i, evidence: "outside visible month pointer guard evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function datePickerReadinessActionSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["actionSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "view-actions", pattern: /setNextView|setPreviousView|setView|resetView/i, evidence: "view action evidence was detected." },
    { signal: "restore-focus", pattern: /setRestoreFocus|restoreFocus/i, evidence: "restore focus action evidence was detected." },
    { signal: "announce-actions", pattern: /announceValueText|announceVisibleRange|setupLiveRegion/i, evidence: "announcement action evidence was detected." },
    { signal: "text-selection", pattern: /disableTextSelection|enableTextSelection/i, evidence: "text selection action evidence was detected." },
    { signal: "sync-input", pattern: /syncInputElement|setInputValue|syncInputValue/i, evidence: "input synchronization action evidence was detected." },
    { signal: "focused-date", pattern: /focusFirstSelectedDate|setFocusedDate|setFocusedValueForView|clearFocusedDate/i, evidence: "focused date action evidence was detected." },
    { signal: "date-value", pattern: /setDateValue|clearDateValue|setSelectedDate|selectFocusedDate/i, evidence: "date value action evidence was detected." },
    { signal: "range-selection", pattern: /resetSelection|toggleSelectedDate|hasSelectedRange|isSelectingEndDate/i, evidence: "range selection action evidence was detected." },
    { signal: "hovered-date", pattern: /setHoveredDate|clearHoveredDate|setHoveredValueIfKeyboard/i, evidence: "hovered date action evidence was detected." },
    { signal: "keyboard-navigation", pattern: /focusNextDay|focusPreviousDay|focusNextWeek|focusPreviousWeek|focusNextPage|focusPreviousPage|focusNextSection|focusPreviousSection|focusNextYear|focusPreviousYear|focusNextDecade|focusPreviousDecade|focusFirstDay|focusLastDay/i, evidence: "keyboard navigation action evidence was detected." },
    { signal: "active-index", pattern: /setActiveIndex|setActiveIndexToEnd|setActiveIndexToStart/i, evidence: "active index action evidence was detected." },
    { signal: "focus-elements", pattern: /focusActiveCell|focusTriggerElement|focusFirstInputElement|focusInputElement/i, evidence: "focus element action evidence was detected." },
    { signal: "select-sync", pattern: /syncMonthSelectElement|syncYearSelectElement/i, evidence: "select element sync action evidence was detected." },
    { signal: "parse-input", pattern: /focusParsedDate|selectParsedDate|parseDate/i, evidence: "parsed input action evidence was detected." },
    { signal: "visible-range", pattern: /setStartValue|invokeOnVisibleRangeChange|visibleRange/i, evidence: "visible range action evidence was detected." },
    { signal: "open-close-callbacks", pattern: /invokeOnOpen|invokeOnClose|onOpenChange/i, evidence: "open/close callback action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility|setOpen|TRIGGER\.CLICK/i, evidence: "visibility toggle action evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function datePickerReadinessDomSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["domSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "label-id", pattern: /getLabelId|label-id/i, evidence: "label ID DOM evidence was detected." },
    { signal: "root-id", pattern: /getRootId|root-id/i, evidence: "root ID DOM evidence was detected." },
    { signal: "table-id", pattern: /getTableId|table-id/i, evidence: "table ID DOM evidence was detected." },
    { signal: "table-header-id", pattern: /getTableHeaderId|table-header-id/i, evidence: "table header ID DOM evidence was detected." },
    { signal: "table-body-id", pattern: /getTableBodyId|table-body-id/i, evidence: "table body ID DOM evidence was detected." },
    { signal: "table-row-id", pattern: /getTableRowId|table-row-id/i, evidence: "table row ID DOM evidence was detected." },
    { signal: "content-id", pattern: /getContentId|content-id/i, evidence: "content ID DOM evidence was detected." },
    { signal: "cell-trigger-id", pattern: /getCellTriggerId|cell-trigger-id/i, evidence: "cell trigger ID DOM evidence was detected." },
    { signal: "prev-trigger-id", pattern: /getPrevTriggerId|prev-trigger-id/i, evidence: "previous trigger ID DOM evidence was detected." },
    { signal: "next-trigger-id", pattern: /getNextTriggerId|next-trigger-id/i, evidence: "next trigger ID DOM evidence was detected." },
    { signal: "view-trigger-id", pattern: /getViewTriggerId|view-trigger-id/i, evidence: "view trigger ID DOM evidence was detected." },
    { signal: "clear-trigger-id", pattern: /getClearTriggerId|clear-trigger-id/i, evidence: "clear trigger ID DOM evidence was detected." },
    { signal: "control-id", pattern: /getControlId|control-id/i, evidence: "control ID DOM evidence was detected." },
    { signal: "input-id", pattern: /getInputId|input-id/i, evidence: "input ID DOM evidence was detected." },
    { signal: "trigger-id", pattern: /getTriggerId|trigger-id/i, evidence: "trigger ID DOM evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId|positioner-id/i, evidence: "positioner ID DOM evidence was detected." },
    { signal: "month-select-id", pattern: /getMonthSelectId|month-select-id/i, evidence: "month select ID DOM evidence was detected." },
    { signal: "year-select-id", pattern: /getYearSelectId|year-select-id/i, evidence: "year select ID DOM evidence was detected." },
    { signal: "focused-cell", pattern: /getFocusedCell|focused-cell/i, evidence: "focused cell DOM evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl|trigger-el/i, evidence: "trigger element DOM evidence was detected." },
    { signal: "content-el", pattern: /getContentEl|content-el/i, evidence: "content element DOM evidence was detected." },
    { signal: "input-els", pattern: /getInputEls|input-els/i, evidence: "input elements DOM evidence was detected." },
    { signal: "year-select-el", pattern: /getYearSelectEl|year-select-el/i, evidence: "year select element DOM evidence was detected." },
    { signal: "month-select-el", pattern: /getMonthSelectEl|month-select-el/i, evidence: "month select element DOM evidence was detected." },
    { signal: "clear-trigger-el", pattern: /getClearTriggerEl|clear-trigger-el/i, evidence: "clear trigger element DOM evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl|positioner-el/i, evidence: "positioner element DOM evidence was detected." },
    { signal: "control-el", pattern: /getControlEl|control-el/i, evidence: "control element DOM evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function datePickerReadinessApiSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["apiSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focused", pattern: /\.focused\b|focused:/i, evidence: "focused API evidence was detected." },
    { signal: "open", pattern: /\.open\b|setOpen|defaultOpen/i, evidence: "open API evidence was detected." },
    { signal: "disabled", pattern: /\.disabled\b|disabled:/i, evidence: "disabled API evidence was detected." },
    { signal: "invalid", pattern: /\.invalid\b|invalid:/i, evidence: "invalid API evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only/i, evidence: "readOnly API evidence was detected." },
    { signal: "inline", pattern: /\.inline\b|inline:/i, evidence: "inline API evidence was detected." },
    { signal: "num-of-months", pattern: /numOfMonths|num-of-months/i, evidence: "numOfMonths API evidence was detected." },
    { signal: "show-week-numbers", pattern: /showWeekNumbers|show-week-numbers/i, evidence: "show week numbers API evidence was detected." },
    { signal: "selection-mode", pattern: /selectionMode|selection-mode/i, evidence: "selectionMode API evidence was detected." },
    { signal: "max-selected-dates", pattern: /maxSelectedDates|max-selected-dates/i, evidence: "max selected dates API evidence was detected." },
    { signal: "is-max-selected", pattern: /isMaxSelected|is-max-selected/i, evidence: "isMaxSelected API evidence was detected." },
    { signal: "view-api", pattern: /\.view\b|getViewProps|setView/i, evidence: "view API evidence was detected." },
    { signal: "unavailable-api", pattern: /isUnavailable|isDateUnavailable/i, evidence: "unavailable date API evidence was detected." },
    { signal: "weeks-api", pattern: /\.weeks\b|getMonthWeeks/i, evidence: "weeks API evidence was detected." },
    { signal: "week-days-api", pattern: /weekDays|getDaysInWeek/i, evidence: "week days API evidence was detected." },
    { signal: "visible-range-text-api", pattern: /visibleRangeText|visible-range-text/i, evidence: "visible range text API evidence was detected." },
    { signal: "value-api", pattern: /\.value\b|setValue|clearValue/i, evidence: "value API evidence was detected." },
    { signal: "value-as-date", pattern: /valueAsDate|value-as-date/i, evidence: "valueAsDate API evidence was detected." },
    { signal: "value-as-string-api", pattern: /valueAsString|value-as-string/i, evidence: "valueAsString API evidence was detected." },
    { signal: "focused-value-api", pattern: /focusedValue\b|setFocusedValue/i, evidence: "focusedValue API evidence was detected." },
    { signal: "focused-value-as-date", pattern: /focusedValueAsDate|focused-value-as-date/i, evidence: "focusedValueAsDate API evidence was detected." },
    { signal: "focused-value-as-string", pattern: /focusedValueAsString|focused-value-as-string/i, evidence: "focusedValueAsString API evidence was detected." },
    { signal: "visible-range-api", pattern: /visibleRange\b|visible-range/i, evidence: "visibleRange API evidence was detected." },
    { signal: "range-preset-value", pattern: /getRangePresetValue|range-preset-value/i, evidence: "range preset value API evidence was detected." },
    { signal: "week-number", pattern: /getWeekNumber|week-number/i, evidence: "week number API evidence was detected." },
    { signal: "days-in-week", pattern: /getDaysInWeek|days-in-week/i, evidence: "days in week API evidence was detected." },
    { signal: "offset-api", pattern: /getOffset|offset-api/i, evidence: "offset API evidence was detected." },
    { signal: "month-weeks", pattern: /getMonthWeeks|month-weeks/i, evidence: "month weeks API evidence was detected." },
    { signal: "select-today-api", pattern: /selectToday|select-today/i, evidence: "select today API evidence was detected." },
    { signal: "set-value-api", pattern: /setValue|VALUE\.SET/i, evidence: "set value API evidence was detected." },
    { signal: "set-time-api", pattern: /setTime|set-time/i, evidence: "set time API evidence was detected." },
    { signal: "clear-value-api", pattern: /clearValue|VALUE\.CLEAR/i, evidence: "clear value API evidence was detected." },
    { signal: "set-focused-value-api", pattern: /setFocusedValue|FOCUS\.SET/i, evidence: "set focused value API evidence was detected." },
    { signal: "set-open-api", pattern: /setOpen|set-open/i, evidence: "set open API evidence was detected." },
    { signal: "focus-month", pattern: /focusMonth|focus-month/i, evidence: "focus month API evidence was detected." },
    { signal: "focus-year", pattern: /focusYear|focus-year/i, evidence: "focus year API evidence was detected." },
    { signal: "years-api", pattern: /getYears\(|years-api/i, evidence: "years API evidence was detected." },
    { signal: "months-api", pattern: /getMonths\(|months-api/i, evidence: "months API evidence was detected." },
    { signal: "years-grid", pattern: /getYearsGrid|years-grid/i, evidence: "years grid API evidence was detected." },
    { signal: "decade-api", pattern: /getDecade|decade-api/i, evidence: "decade API evidence was detected." },
    { signal: "months-grid", pattern: /getMonthsGrid|months-grid/i, evidence: "months grid API evidence was detected." },
    { signal: "format-api", pattern: /\.format\(|format:\s*|format-api/i, evidence: "format API evidence was detected." },
    { signal: "set-view-api", pattern: /setView|VIEW\.SET/i, evidence: "set view API evidence was detected." },
    { signal: "go-to-next", pattern: /goToNext|GOTO\.NEXT/i, evidence: "go to next API evidence was detected." },
    { signal: "go-to-prev", pattern: /goToPrev|GOTO\.PREV/i, evidence: "go to previous API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "range-text-props", pattern: /getRangeTextProps/i, evidence: "range text props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "table-props", pattern: /getTableProps/i, evidence: "table props API evidence was detected." },
    { signal: "table-head-props", pattern: /getTableHeadProps/i, evidence: "table head props API evidence was detected." },
    { signal: "table-header-props", pattern: /getTableHeaderProps/i, evidence: "table header props API evidence was detected." },
    { signal: "table-body-props", pattern: /getTableBodyProps/i, evidence: "table body props API evidence was detected." },
    { signal: "table-row-props", pattern: /getTableRowProps/i, evidence: "table row props API evidence was detected." },
    { signal: "week-number-header-cell-props", pattern: /getWeekNumberHeaderCellProps|week-number-header-cell/i, evidence: "week number header cell props API evidence was detected." },
    { signal: "week-number-cell-props", pattern: /getWeekNumberCellProps|week-number-cell/i, evidence: "week number cell props API evidence was detected." },
    { signal: "day-table-cell-state", pattern: /getDayTableCellState|getDayTableCellProps/i, evidence: "day table cell state API evidence was detected." },
    { signal: "day-table-cell-props", pattern: /getDayTableCellProps/i, evidence: "day table cell props API evidence was detected." },
    { signal: "day-table-cell-trigger-props", pattern: /getDayTableCellTriggerProps/i, evidence: "day table cell trigger props API evidence was detected." },
    { signal: "month-table-cell-state", pattern: /getMonthTableCellState|getMonthTableCellProps/i, evidence: "month table cell state API evidence was detected." },
    { signal: "month-table-cell-props", pattern: /getMonthTableCellProps/i, evidence: "month table cell props API evidence was detected." },
    { signal: "month-table-cell-trigger-props", pattern: /getMonthTableCellTriggerProps/i, evidence: "month table cell trigger props API evidence was detected." },
    { signal: "year-table-cell-state", pattern: /getYearTableCellState|getYearTableCellProps/i, evidence: "year table cell state API evidence was detected." },
    { signal: "year-table-cell-props", pattern: /getYearTableCellProps/i, evidence: "year table cell props API evidence was detected." },
    { signal: "year-table-cell-trigger-props", pattern: /getYearTableCellTriggerProps/i, evidence: "year table cell trigger props API evidence was detected." },
    { signal: "next-trigger-props", pattern: /getNextTriggerProps/i, evidence: "next trigger props API evidence was detected." },
    { signal: "prev-trigger-props", pattern: /getPrevTriggerProps/i, evidence: "previous trigger props API evidence was detected." },
    { signal: "clear-trigger-props", pattern: /getClearTriggerProps/i, evidence: "clear trigger props API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props API evidence was detected." },
    { signal: "view-props", pattern: /getViewProps/i, evidence: "view props API evidence was detected." },
    { signal: "view-trigger-props", pattern: /getViewTriggerProps/i, evidence: "view trigger props API evidence was detected." },
    { signal: "view-control-props", pattern: /getViewControlProps/i, evidence: "view control props API evidence was detected." },
    { signal: "input-props", pattern: /getInputProps/i, evidence: "input props API evidence was detected." },
    { signal: "month-select-props", pattern: /getMonthSelectProps/i, evidence: "month select props API evidence was detected." },
    { signal: "year-select-props", pattern: /getYearSelectProps/i, evidence: "year select props API evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps/i, evidence: "positioner props API evidence was detected." },
    { signal: "preset-trigger-props", pattern: /getPresetTriggerProps/i, evidence: "preset trigger props API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|\bdir prop\b/i, evidence: "dir prop API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled|dataDisabled/i, evidence: "data disabled API evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly|dataReadonly/i, evidence: "data readonly API evidence was detected." },
    { signal: "data-empty", pattern: /data-empty|dataEmpty/i, evidence: "data empty API evidence was detected." },
    { signal: "data-placeholder-shown", pattern: /data-placeholder-shown|dataPlaceholderShown/i, evidence: "data placeholder shown API evidence was detected." },
    { signal: "data-placement", pattern: /data-placement|dataPlacement/i, evidence: "data placement API evidence was detected." },
    { signal: "data-side", pattern: /data-side|dataSide/i, evidence: "data side API evidence was detected." },
    { signal: "data-inline", pattern: /data-inline|dataInline/i, evidence: "data inline API evidence was detected." },
    { signal: "data-view", pattern: /data-view|dataView/i, evidence: "data view API evidence was detected." },
    { signal: "data-selectable", pattern: /data-selectable|dataSelectable/i, evidence: "data selectable API evidence was detected." },
    { signal: "autocomplete-off", pattern: /autoComplete:\s*["']off["']|autoComplete off/i, evidence: "autocomplete off API evidence was detected." },
    { signal: "autocorrect-off", pattern: /autoCorrect:\s*["']off["']|autoCorrect off/i, evidence: "autocorrect off API evidence was detected." },
    { signal: "spellcheck-false", pattern: /spellCheck:\s*(["']false["']|false)|spellCheck false/i, evidence: "spellcheck false API evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function datePickerReadinessTestSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["testSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|Arrow|PageUp|PageDown/i, evidence: "keyboard test evidence was detected." },
    { signal: "range-test", pattern: /range-test|selectionMode:\s*['"]range|selectedRange|range/i, evidence: "range test evidence was detected." },
    { signal: "segment-test", pattern: /segment-test|getByRole\(['"]spinbutton|segment/i, evidence: "segment test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole|aria-/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|date-picker-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function datePickerReadinessPackageSignals(sourceFiles: DatePickerReadinessSourceFile[]): DatePickerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DatePickerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/date-picker", pattern: /@zag-js\/date-picker/i, evidence: "@zag-js/date-picker dependency evidence was detected." },
    { signal: "@zag-js/date-input", pattern: /@zag-js\/date-input/i, evidence: "@zag-js/date-input dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/live-region", pattern: /@zag-js\/live-region/i, evidence: "@zag-js/live-region dependency evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable/i, evidence: "@zag-js/dismissable dependency evidence was detected." },
    { signal: "@zag-js/date-utils", pattern: /@zag-js\/date-utils/i, evidence: "@zag-js/date-utils evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper/i, evidence: "@zag-js/popper dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "@internationalized/date", pattern: /@internationalized\/date/i, evidence: "@internationalized/date evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return datePickerReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function datePickerReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DatePickerReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/date-picker-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
