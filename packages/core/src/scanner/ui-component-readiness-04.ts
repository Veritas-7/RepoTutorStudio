import path from "node:path";
import type { SelectComboboxReadinessReport, ToolbarToggleReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildSelectComboboxReadinessReport(walk: WalkResult): Promise<SelectComboboxReadinessReport> {
  const sourceFiles = await selectComboboxReadinessSourceFiles(walk);
  const selectComboboxSetups = selectComboboxReadinessSetups(sourceFiles);
  const frameworkSignals = selectComboboxReadinessFrameworkSignals(sourceFiles);
  const structureSignals = selectComboboxReadinessStructureSignals(sourceFiles);
  const stateSignals = selectComboboxReadinessStateSignals(sourceFiles);
  const interactionSignals = selectComboboxReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = selectComboboxReadinessAccessibilitySignals(sourceFiles);
  const formSignals = selectComboboxReadinessFormSignals(sourceFiles);
  const implementationSignals = selectComboboxReadinessImplementationSignals(sourceFiles);
  const testSignals = selectComboboxReadinessTestSignals(sourceFiles);
  const packageSignals = selectComboboxReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || selectComboboxSetups.some((item) => item.optionsCount + item.optionCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || selectComboboxSetups.some((item) => item.valueCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || selectComboboxSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || selectComboboxSetups.some((item) => item.testCount > 0);

  const riskQueue: SelectComboboxReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document select, combobox, listbox, native select, option, or popup boundaries before claiming choice-control readiness.",
      why: "Select/combobox/listbox readiness starts with concrete trigger, input, options list, option item, value display, or native select evidence.",
      relatedHref: "html/select-combobox-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Trace value/defaultValue, onChange/onValueChange, active option, selected option, disabled option, and multiple/nullable state.",
      why: "Choice controls fail when visual labels, highlighted options, selected values, and submitted values drift apart.",
      relatedHref: "html/select-combobox-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Verify combobox/listbox/option roles plus aria-expanded, aria-controls, aria-selected, aria-activedescendant, autocomplete, and labels.",
      why: "Custom select and autocomplete controls must expose popup, active descendant, selection, and label semantics without relying only on visual state.",
      relatedHref: "html/select-combobox-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add role, keyboard, typeahead, filtering, option selection, form serialization, and attribute tests for select/combobox/listbox controls.",
      why: "Static component evidence does not prove arrow/Home/End/Enter/Escape behavior, filtered option movement, value commit, or form submission.",
      relatedHref: "html/select-combobox-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual select/combobox/listbox behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records select/combobox/listbox readiness only; it does not open popups, type queries, move active options, select values, submit forms, mutate stores, or run analyzed project tests.",
    relatedHref: "html/select-combobox-readiness.html"
  });

  return {
    summary: `Select/combobox/listbox readiness report: setup ${selectComboboxSetups.length}개, framework signal ${frameworkSignals.length}개, state signal ${stateSignals.length}개, implementation signal ${implementationSignals.length}개, accessibility signal ${accessibilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Select/combobox/listbox readiness Radix Select Headless UI Combobox Listbox Ariakit Select Combobox Listbox Combobox machine Listbox machine virtualizer input display value IME immediate stack top layer typeahead form fields floating portal option registration value option aria-activedescendant form tests",
    selectComboboxSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    interactionSignals,
    accessibilitySignals,
    formSignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-select|Select\\.Root|Select\\.Trigger|Select\\.Content|Select\\.Item|Select\\.Value\" package.json src app packages", purpose: "Find Radix Select roots, trigger/content boundaries, value display, and item wiring." },
      { command: "rg \"@headlessui/react|Combobox\\.|Listbox\\.|<Select|value=|defaultValue|onChange|multiple|nullable\" package.json src app packages", purpose: "Find Headless UI Combobox/Listbox/Select value, option, and popup state." },
      { command: "rg \"useComboboxMachine|ComboboxMachine|useVirtualizer|displayValue|isComposing|immediate|setInputElement|useTreeWalker|activeDescendantId\" src app packages", purpose: "Review Headless UI-style Combobox implementation details for machine lifecycle, virtual options, input synchronization, IME guard, immediate focus-open, ARIA, and option registration." },
      { command: "rg \"useListboxMachine|ListboxMachine|stackMachines|useOutsideClick|useQuickRelease|FormFields|useFloatingPanel|useTransition|useInertOthers|useScrollLock|registerOption|activeDescendantId\" src app packages", purpose: "Review Headless UI-style Listbox implementation details for machine lifecycle, stack ownership, form serialization, floating options, typeahead, and option registration." },
      { command: "rg \"@ariakit/react|ComboboxProvider|SelectProvider|ComboboxPopover|SelectPopover|ComboboxItem|SelectItem|setValueOnChange\" package.json src app packages", purpose: "Find Ariakit provider/store, popover, item, value, and autocomplete boundaries." },
      { command: "rg \"role=.*combobox|role=.*listbox|role=.*option|aria-expanded|aria-controls|aria-selected|aria-activedescendant|aria-autocomplete|getByRole|userEvent\\.keyboard\" test tests src app packages", purpose: "Check ARIA, role, keyboard, and attribute coverage for choice controls." }
    ],
    learnerNextSteps: [
      "먼저 Radix Select, Headless UI Combobox/Listbox/Select, Ariakit Combobox/Select, native select 중 어떤 family를 쓰는지 확인하세요.",
      "trigger/button, input, value display, options/listbox, option item, portal/popover, label, indicator/check 구조가 어떤 파일에 있는지 정리하세요.",
      "value/defaultValue, onChange/onValueChange, multiple/nullable, active/selected/disabled option, data-state가 controlled state와 일치하는지 확인하세요.",
      "Arrow/Home/End/Enter/Escape, typeahead, filtering, virtualized options, focus management, pointer hover/click behavior를 테스트에서 확인하세요.",
      "Headless UI Combobox라면 useComboboxMachine/ComboboxMachine, virtualizer, displayValue/input sync, IME composition guard, immediate focus-open, input ARIA, modal options, pointer activation, option registration 신호를 따로 확인하세요.",
      "Headless UI Listbox라면 useListboxMachine/ListboxMachine, stack top-layer, outside click refocus, FormFields, OpenClosedProvider, FloatingProvider, quick release, transition/inert/scroll lock, typeahead, option registration, and active descendant 신호를 따로 확인하세요.",
      "role combobox/listbox/option과 aria-expanded/controls/selected/activedescendant/autocomplete/label이 실제 화면 읽기 값과 맞는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 popup open, query typing, active option movement, selection commit, form submit은 원본 프로젝트의 component/browser tests에서 별도 확인하세요."
    ]
  };
}

type SelectComboboxReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function selectComboboxReadinessSourceFiles(walk: WalkResult): Promise<SelectComboboxReadinessSourceFile[]> {
  const files: SelectComboboxReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !selectComboboxReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!selectComboboxReadinessPathSignal(file.relPath) && !selectComboboxReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function selectComboboxReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return selectComboboxReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function selectComboboxReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(select|selects|combobox|comboboxes|listbox|listboxes|autocomplete|autosuggest|dropdown|option|options|choice|choices|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function selectComboboxReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-select|@headlessui\/react|@ariakit\/react|Select\.Root|Select\.Trigger|Select\.Content|Combobox\.|Listbox\.|ComboboxProvider|SelectProvider|role\s*=\s*["']combobox|role\s*=\s*["']listbox|aria-activedescendant|aria-autocomplete|<select\b)/i.test(text);
}

function selectComboboxReadinessSetups(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["selectComboboxSetups"] {
  const rows: SelectComboboxReadinessReport["selectComboboxSetups"] = [];
  for (const source of sourceFiles) {
    const selectCount = countMatches(source.text, /(Select\.Root|SelectProvider|SelectPopover|Select\.Trigger|<Select\b|<select\b|useSelectStore|select\b)/gi);
    const comboboxCount = countMatches(source.text, /(Combobox\.|ComboboxProvider|ComboboxPopover|<Combobox\b|useComboboxStore|role\s*=\s*["']combobox|combobox\b)/gi);
    const listboxCount = countMatches(source.text, /(Listbox\.|ListboxButton|ListboxOptions|<Listbox\b|role\s*=\s*["']listbox|listbox\b)/gi);
    const triggerCount = countMatches(source.text, /(Select\.Trigger|Combobox\.Button|Listbox\.Button|SelectButton|Button\b|Trigger\b|trigger\b)/gi);
    const inputCount = countMatches(source.text, /(Combobox\.Input|<Combobox\b|ComboboxProvider|input\b|aria-autocomplete|displayValue|setValueOnChange)/gi);
    const optionsCount = countMatches(source.text, /(Select\.Content|Select\.Viewport|Combobox\.Options|Listbox\.Options|ComboboxPopover|SelectPopover|Options\b|List\b|role\s*=\s*["']listbox)/gi);
    const optionCount = countMatches(source.text, /(Select\.Item|Combobox\.Option|Listbox\.Option|ComboboxItem|SelectItem|<option\b|role\s*=\s*["']option)/gi);
    const valueCount = countMatches(source.text, /(value\s*=|defaultValue|onValueChange|onChange|setValue|Select\.Value|ComboboxItemValue|displayValue|selected|aria-selected)/gi);
    const portalPopoverCount = countMatches(source.text, /(Select\.Portal|Select\.Content|ComboboxPopover|SelectPopover|Portal\b|Popover\b|position\s*=|anchor\s*=|gutter\s*=|sameWidth|modal\s*=|Popper)/gi);
    const formCount = countMatches(source.text, /(name\s*=|form\s*=|required|<form\b|<select\b|BubbleSelect|native `select`|hidden select|defaultValue|value\s*=)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']combobox|role\s*=\s*["']listbox|role\s*=\s*["']option|getByRole|aria-expanded|aria-controls|aria-selected|aria-activedescendant|aria-autocomplete|aria-label|aria-labelledby|aria-describedby|Label\b)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.keyboard|getByRole|toHaveAttribute|select-combobox-traces|upload-artifact|keyboard)/gi);
    const total = selectCount + comboboxCount + listboxCount + triggerCount + inputCount + optionsCount + optionCount + valueCount + portalPopoverCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = (selectCount + comboboxCount + listboxCount > 0) && optionCount > 0 && valueCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: selectComboboxReadinessFramework(source),
      selectCount,
      comboboxCount,
      listboxCount,
      triggerCount,
      inputCount,
      optionsCount,
      optionCount,
      valueCount,
      portalPopoverCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `select ${selectCount}, combobox ${comboboxCount}, listbox ${listboxCount}, trigger ${triggerCount}, input ${inputCount}, options ${optionsCount}, option ${optionCount}, value ${valueCount}, portal/popover ${portalPopoverCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.selectCount + b.comboboxCount + b.listboxCount + b.optionCount + b.valueCount - (a.selectCount + a.comboboxCount + a.listboxCount + a.optionCount + a.valueCount));
}

function selectComboboxReadinessFramework(source: SelectComboboxReadinessSourceFile): SelectComboboxReadinessReport["selectComboboxSetups"][number]["framework"] {
  if (/@radix-ui\/react-select|Select\.Root|Select\.Trigger|Select\.Content|Select\.Item/i.test(source.text)) return "radix-select";
  if (/@ariakit\/react|ComboboxProvider|SelectProvider|ComboboxPopover|SelectPopover|useComboboxStore|useSelectStore/i.test(source.text)) return "ariakit";
  if (/@headlessui\/react|Combobox\.|Listbox\.|<Select\b/i.test(source.text)) return "headlessui";
  if (/<select\b|<option\b/i.test(source.text)) return "native";
  if (/role\s*=\s*["']combobox|role\s*=\s*["']listbox|aria-activedescendant/i.test(source.text)) return "custom";
  return "unknown";
}

function selectComboboxReadinessFrameworkSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-select", pattern: /@radix-ui\/react-select|Select\.Root|Select\.Trigger|Select\.Content|Select\.Item/i, evidence: "Radix Select evidence was detected." },
    { signal: "headlessui-combobox", pattern: /@headlessui\/react[\s\S]*Combobox|Combobox\.|<Combobox\b/i, evidence: "Headless UI Combobox evidence was detected." },
    { signal: "headlessui-listbox", pattern: /@headlessui\/react[\s\S]*Listbox|Listbox\.|<Listbox\b/i, evidence: "Headless UI Listbox evidence was detected." },
    { signal: "headlessui-select", pattern: /@headlessui\/react[\s\S]*Select|<Select\b|SelectFn/i, evidence: "Headless UI Select evidence was detected." },
    { signal: "ariakit-combobox", pattern: /@ariakit\/react[\s\S]*Combobox|ComboboxProvider|ComboboxPopover|ComboboxItem|useComboboxStore/i, evidence: "Ariakit Combobox evidence was detected." },
    { signal: "ariakit-select", pattern: /@ariakit\/react[\s\S]*Select|SelectProvider|SelectPopover|SelectItem|useSelectStore/i, evidence: "Ariakit Select evidence was detected." },
    { signal: "native-select", pattern: /<select\b|<option\b|HTMLSelectElement/i, evidence: "native select evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']combobox|role\s*=\s*["']listbox|aria-activedescendant/i, evidence: "custom combobox/listbox evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function selectComboboxReadinessStructureSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["structureSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-provider", pattern: /Select\.Root|ComboboxProvider|SelectProvider|Combobox\.|Listbox\.|<select\b|useComboboxStore|useSelectStore/i, evidence: "root/provider evidence was detected." },
    { signal: "trigger-button", pattern: /Select\.Trigger|Combobox\.Button|Listbox\.Button|Button\b|Trigger\b|<Select\b/i, evidence: "trigger/button evidence was detected." },
    { signal: "input", pattern: /Combobox\.Input|<Combobox\b|input\b|aria-autocomplete|displayValue|setValueOnChange/i, evidence: "combobox input evidence was detected." },
    { signal: "value-display", pattern: /Select\.Value|ComboboxItemValue|ListboxSelectedOption|displayValue|selected|value\s*=/i, evidence: "value display evidence was detected." },
    { signal: "options-list", pattern: /Select\.Content|Select\.Viewport|Combobox\.Options|Listbox\.Options|ComboboxPopover|SelectPopover|role\s*=\s*["']listbox|Options\b/i, evidence: "options/list evidence was detected." },
    { signal: "option-item", pattern: /Select\.Item|Combobox\.Option|Listbox\.Option|ComboboxItem|SelectItem|<option\b|role\s*=\s*["']option/i, evidence: "option item evidence was detected." },
    { signal: "portal-popover", pattern: /Select\.Portal|Select\.Content|ComboboxPopover|SelectPopover|Portal\b|Popover\b|position\s*=|anchor\s*=|gutter\s*=/i, evidence: "portal/popover evidence was detected." },
    { signal: "label", pattern: /Select\.Label|Combobox\.Label|Listbox\.Label|SelectLabel|Label\b|aria-label|aria-labelledby/i, evidence: "label evidence was detected." },
    { signal: "indicator-check", pattern: /Select\.ItemIndicator|ComboboxItemCheck|SelectItemCheck|ItemIndicator|checked|aria-selected/i, evidence: "indicator/check evidence was detected." },
    { signal: "cancel-clear", pattern: /ComboboxCancel|clear|reset|setValue\(["']{0,2}\)/i, evidence: "cancel/clear evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function selectComboboxReadinessStateSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["stateSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /value\s*=|\bvalue\b|Select\.Value|ComboboxItemValue/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "on-change", pattern: /onChange|setValueOnChange/i, evidence: "onChange evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange|setValue/i, evidence: "onValueChange/setValue evidence was detected." },
    { signal: "multiple", pattern: /multiple|ValueMode\.Multi/i, evidence: "multiple selection evidence was detected." },
    { signal: "nullable", pattern: /nullable|null\b|undefined/i, evidence: "nullable evidence was detected." },
    { signal: "active-option", pattern: /activeOption|active-option|Combobox\.Options|Listbox\.Options|aria-activedescendant|goToOption|active\b/i, evidence: "active option evidence was detected." },
    { signal: "selected-option", pattern: /selected|aria-selected|Select\.Value|ListboxSelectedOption|isSelected/i, evidence: "selected option evidence was detected." },
    { signal: "disabled-option", pattern: /disabled|aria-disabled/i, evidence: "disabled option evidence was detected." },
    { signal: "data-state", pattern: /data-state|Select\.Trigger|Select\.Content|comboboxState|listboxState/i, evidence: "data-state/state evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function selectComboboxReadinessInteractionSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keyboard", pattern: /keyboard|onKeyDown|userEvent\.keyboard|Arrow|Home|End|Enter|Escape/i, evidence: "keyboard evidence was detected." },
    { signal: "arrow-keys", pattern: /ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Arrow|goToOption/i, evidence: "arrow key evidence was detected." },
    { signal: "home-end", pattern: /Home|End|Focus\.First|Focus\.Last/i, evidence: "Home/End key evidence was detected." },
    { signal: "enter", pattern: /Enter|selectOption|onClick/i, evidence: "Enter/select evidence was detected." },
    { signal: "escape", pattern: /Escape|CloseCombobox|closeListbox|DismissableLayer/i, evidence: "Escape/close evidence was detected." },
    { signal: "pointer", pattern: /pointer|onPointer|onMouse|onClick|hover|\.Button|\.Option|SelectItem|ComboboxItem|onChange/i, evidence: "pointer/click evidence was detected." },
    { signal: "typeahead", pattern: /typeahead|searchRef|displayValue|onChange|autoComplete|Combobox\.Input/i, evidence: "typeahead/search evidence was detected." },
    { signal: "focus-management", pattern: /FocusScope|focus|aria-controls|aria-activedescendant|ComboboxPopover|SelectPopover|Listbox\.Options/i, evidence: "focus management evidence was detected." },
    { signal: "virtual-or-filtered", pattern: /virtual|filtered|displayValue|filter|options\.map|showOnChange|showOnKeyPress/i, evidence: "virtual/filter evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function selectComboboxReadinessAccessibilitySignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-combobox", pattern: /role\s*=\s*["']combobox|getByRole\(["']combobox|Select\.Trigger|Combobox\.Input|<Combobox\b/i, evidence: "combobox role evidence was detected." },
    { signal: "role-listbox", pattern: /role\s*=\s*["']listbox|getByRole\(["']listbox|Select\.Content|Combobox\.Options|Listbox\.Options|ComboboxPopover|SelectPopover/i, evidence: "listbox role evidence was detected." },
    { signal: "role-option", pattern: /role\s*=\s*["']option|getByRole\(["']option|Select\.Item|Combobox\.Option|Listbox\.Option|ComboboxItem|SelectItem|<option\b/i, evidence: "option role evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded|toHaveAttribute\(["']aria-expanded|Combobox\.Button|Listbox\.Button|Select\.Trigger/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls|toHaveAttribute\(["']aria-controls|ComboboxCancel|Select\.Trigger/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected|selected|isSelected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-activedescendant", pattern: /aria-activedescendant|activeOption|Combobox\.Input|<Combobox\b/i, evidence: "aria-activedescendant evidence was detected." },
    { signal: "aria-autocomplete", pattern: /aria-autocomplete|autoComplete|Combobox\.Input|<Combobox\b/i, evidence: "aria-autocomplete evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby|aria-describedby|Label\b/i, evidence: "aria label evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function selectComboboxReadinessFormSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["formSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /name\s*=/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /form\s*=|<form\b|form id|closest\(["']form["']\)/i, evidence: "form evidence was detected." },
    { signal: "required", pattern: /required|aria-required/i, evidence: "required evidence was detected." },
    { signal: "native-select", pattern: /<select\b|<option\b|HTMLSelectElement/i, evidence: "native select evidence was detected." },
    { signal: "hidden-select", pattern: /BubbleSelect|native `select`|aria-hidden|defaultValue|Select\.Root|name\s*=/i, evidence: "hidden/native select bridge evidence was detected." },
    { signal: "value", pattern: /value\s*=|defaultValue|onValueChange|onChange/i, evidence: "form value evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function selectComboboxReadinessImplementationSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "controllable-value", pattern: /useControllable|controlledValue|controlledOnChange/i, evidence: "controllable value evidence was detected." },
    { signal: "default-value-hook", pattern: /useDefaultValue|defaultValue/i, evidence: "default value hook evidence was detected." },
    { signal: "comparator", pattern: /useByComparator|\bcompare\b|isSelected/i, evidence: "comparator evidence was detected." },
    { signal: "combobox-machine", pattern: /useComboboxMachine|ComboboxMachine|ComboboxContext|ComboboxState|ActionTypes\.OpenCombobox/i, evidence: "Combobox machine evidence was detected." },
    { signal: "virtualizer", pattern: /useVirtualizer|Virtualizer|VirtualProvider|@tanstack\/react-virtual/i, evidence: "virtualizer evidence was detected." },
    { signal: "virtual-configuration", pattern: /UpdateVirtualConfiguration|virtual\.options|machine\.state\.virtual|virtual:\s*\{/i, evidence: "virtual configuration evidence was detected." },
    { signal: "display-value", pattern: /displayValue|currentDisplayValue/i, evidence: "display value evidence was detected." },
    { signal: "input-value-sync", pattern: /currentDisplayValue[\s\S]{0,500}input\.value|useWatch[\s\S]{0,500}input\.value|setSelectionRange/i, evidence: "input value synchronization evidence was detected." },
    { signal: "composition-guard", pattern: /isComposing|CompositionStart|CompositionEnd|compositionend|IME/i, evidence: "IME composition guard evidence was detected." },
    { signal: "immediate-focus-open", pattern: /immediate[\s\S]{0,500}ActivationTrigger\.Focus|microTask[\s\S]{0,240}openCombobox|data\.immediate/i, evidence: "immediate focus-open evidence was detected." },
    { signal: "input-ref-sync", pattern: /setInputElement|inputRef|internalInputRef/i, evidence: "input ref sync evidence was detected." },
    { signal: "input-role-combobox", pattern: /role=["']combobox|role:\s*['"]combobox/i, evidence: "input combobox role evidence was detected." },
    { signal: "input-aria-expanded", pattern: /aria-expanded|ComboboxState\.Open/i, evidence: "input aria-expanded evidence was detected." },
    { signal: "input-aria-controls", pattern: /aria-controls|optionsElement\?\.id/i, evidence: "input aria-controls evidence was detected." },
    { signal: "input-aria-activedescendant", pattern: /aria-activedescendant|activeDescendantId/i, evidence: "input aria-activedescendant evidence was detected." },
    { signal: "input-aria-autocomplete", pattern: /aria-autocomplete|autocomplete['"]?:\s*['"]list/i, evidence: "input aria-autocomplete evidence was detected." },
    { signal: "clear-on-empty", pattern: /event\.target\.value === ['"]{2}|clear\(\)|onChange\(null\)/i, evidence: "clear on empty input evidence was detected." },
    { signal: "open-on-input-change", pattern: /handleInputChange[\s\S]{0,240}openCombobox|Open the combobox to show/i, evidence: "open on input change evidence was detected." },
    { signal: "escape-clear", pattern: /Keys\.Escape[\s\S]{0,500}clear\(\)|data\.value === null/i, evidence: "Escape clear evidence was detected." },
    { signal: "tab-select-close", pattern: /Keys\.Tab[\s\S]{0,400}selectActiveOption[\s\S]{0,240}closeCombobox/i, evidence: "Tab select-and-close evidence was detected." },
    { signal: "button-refocus-input", pattern: /useRefocusableInput|refocusInput/i, evidence: "button input-refocus evidence was detected." },
    { signal: "options-tree-walker-role-none", pattern: /useTreeWalker[\s\S]{0,400}role[\s\S]{0,240}none|setAttribute\(['"]role['"], ['"]none/i, evidence: "options role-none tree walker evidence was detected." },
    { signal: "options-modal-scroll-lock", pattern: /modal && comboboxState|scrollLockEnabled|inertOthersEnabled|useScrollLock[\s\S]{0,120}comboboxState/i, evidence: "modal options scroll-lock/inert evidence was detected." },
    { signal: "portal-owner-document", pattern: /portalOwnerDocument|useOwnerDocument\(inputElement \|\| buttonElement\)|ownerDocument/i, evidence: "portal owner document evidence was detected." },
    { signal: "input-movement-cancel-transition", pattern: /didInputMove|MarkInputAsMoved|detectMovement|inputPositionState/i, evidence: "input movement transition-cancel evidence was detected." },
    { signal: "virtual-option-positioning", pattern: /aria-setsize|aria-posinset|translateY\(\$\{item\.start\}|scrollToIndex/i, evidence: "virtual option positioning evidence was detected." },
    { signal: "option-refocus-input", pattern: /requestAnimationFrame\(\(\) => refocusInput\(\)\)|isMobile\(\)|virtual keyboard|refocusInput\(\)/i, evidence: "option input-refocus evidence was detected." },
    { signal: "mobile-keyboard-guard", pattern: /isMobile\(\)|virtual keyboard|Navigator\.virtualKeyboard|MouseButton\.Left/i, evidence: "mobile virtual-keyboard guard evidence was detected." },
    { signal: "option-register-order", pattern: /registerOption\([^)]*\{ current:[\s\S]{0,220}order|order:\s*[0-9]+|dataRef\.current\.order/i, evidence: "ordered option registration evidence was detected." },
    { signal: "pointer-activation-trigger", pattern: /ActivationTrigger\.Pointer|setActivationTrigger\(ActivationTrigger\.Pointer|pointer\.wasMoved/i, evidence: "pointer activation trigger evidence was detected." },
    { signal: "default-first-option", pattern: /DefaultToFirstOption|defaultToFirstOption/i, evidence: "default-to-first-option evidence was detected." },
    { signal: "active-descendant-virtual", pattern: /activeDescendantId[\s\S]{0,500}state\.virtual|state\.virtual![\s\S]{0,200}options\[activeOptionIndex\]|machine\.selectors\.activeDescendantId/i, evidence: "virtual active descendant evidence was detected." },
    { signal: "voiceover-input-reset", pattern: /VoiceOver|input\.value = ['"]{2}[\s\S]{0,120}input\.value = currentValue/i, evidence: "VoiceOver input reset evidence was detected." },
    { signal: "listbox-machine", pattern: /useListboxMachine|ListboxMachine|ListboxContext|ActionTypes|ListboxStates/i, evidence: "Listbox machine evidence was detected." },
    { signal: "data-ref-sync", pattern: /dataRef\.current|machine\.state\.dataRef|useIsoMorphicEffect/i, evidence: "machine data ref sync evidence was detected." },
    { signal: "slice-state", pattern: /useSlice\(machine|useSlice\(stackMachine|listboxState/i, evidence: "slice state evidence was detected." },
    { signal: "stack-machine", pattern: /stackMachines|get\(null\)|StackActionTypes|actions\.push|actions\.pop/i, evidence: "stack machine evidence was detected." },
    { signal: "top-layer", pattern: /isTopLayer|selectors\.isTop|top of the hierarchy|top layer/i, evidence: "top-layer evidence was detected." },
    { signal: "outside-click-close", pattern: /useOutsideClick[\s\S]{0,220}CloseListbox|outside click[\s\S]{0,120}CloseListbox/i, evidence: "outside-click close evidence was detected." },
    { signal: "refocus-button", pattern: /buttonElement\?\.focus|buttonElement!\s*,|focus\(\{ preventScroll: true \}\)/i, evidence: "button refocus evidence was detected." },
    { signal: "label-provider", pattern: /useLabels|LabelProvider|useLabelledBy|aria-labelledby/i, evidence: "label provider evidence was detected." },
    { signal: "form-fields", pattern: /FormFields|onReset|data:\s*\{\s*\[name\]|form=/i, evidence: "form fields bridge evidence was detected." },
    { signal: "open-closed-provider", pattern: /OpenClosedProvider|State\.Open|State\.Closed|useOpenClosed/i, evidence: "OpenClosedProvider evidence was detected." },
    { signal: "floating-provider", pattern: /FloatingProvider|useFloatingPanel|useFloatingPanelProps|useResolvedAnchor/i, evidence: "floating provider evidence was detected." },
    { signal: "quick-release", pattern: /useQuickRelease|QuickReleaseAction|selectActiveOption/i, evidence: "quick release evidence was detected." },
    { signal: "active-press", pattern: /useActivePress|pressProps|pressed:/i, evidence: "active press evidence was detected." },
    { signal: "floating-reference", pattern: /useFloatingReference|useFloatingReferenceProps|getFloatingReferenceProps/i, evidence: "floating reference evidence was detected." },
    { signal: "handle-toggle", pattern: /useHandleToggle|toggleProps|closeListbox\(\)|openListbox/i, evidence: "toggle handler evidence was detected." },
    { signal: "keyboard-open", pattern: /onKeyDown|handleKeyDown|Keys\.ArrowDown|Keys\.ArrowUp|openListbox/i, evidence: "keyboard open evidence was detected." },
    { signal: "attempt-submit", pattern: /attemptSubmit|Keys\.Enter/i, evidence: "attemptSubmit/Enter evidence was detected." },
    { signal: "aria-haspopup-listbox", pattern: /aria-haspopup['"]?:\s*['"]listbox|aria-haspopup=["']listbox/i, evidence: "aria-haspopup listbox evidence was detected." },
    { signal: "button-aria-expanded", pattern: /aria-expanded|button.*expanded/i, evidence: "button aria-expanded evidence was detected." },
    { signal: "button-aria-controls", pattern: /aria-controls|optionsElement\?\.id/i, evidence: "button aria-controls evidence was detected." },
    { signal: "options-anchor", pattern: /anchor: rawAnchor|useResolvedAnchor|anchorOptions|bottom selection/i, evidence: "options anchor evidence was detected." },
    { signal: "portal-enabled", pattern: /Portal enabled|portal = true|enabled=\{portal|portal\?/i, evidence: "portal enablement evidence was detected." },
    { signal: "transition-data", pattern: /useTransition|transitionDataAttributes|transitionData/i, evidence: "transition data evidence was detected." },
    { signal: "disappear-close", pattern: /useOnDisappear|becomes hidden|closeListbox/i, evidence: "disappear close evidence was detected." },
    { signal: "scroll-lock", pattern: /useScrollLock|scrollLockEnabled/i, evidence: "scroll lock evidence was detected." },
    { signal: "inert-others", pattern: /useInertOthers|inertOthersEnabled|allowed:/i, evidence: "inert others evidence was detected." },
    { signal: "frozen-value", pattern: /useFrozenData|frozenValue|hasFrozenValue/i, evidence: "frozen value evidence was detected." },
    { signal: "active-descendant", pattern: /activeDescendantId|aria-activedescendant|activeOptionIndex/i, evidence: "active descendant evidence was detected." },
    { signal: "multiselectable", pattern: /aria-multiselectable|ValueMode\.Multi|multiple/i, evidence: "multi-select evidence was detected." },
    { signal: "orientation", pattern: /aria-orientation|orientation|horizontal|vertical/i, evidence: "orientation evidence was detected." },
    { signal: "open-tab-index", pattern: /tabIndex[\s\S]{0,100}ListboxStates\.Open|tabIndex=\{listboxState === ListboxStates\.Open/i, evidence: "open tabIndex evidence was detected." },
    { signal: "typeahead-search", pattern: /machine\.actions\.search|searchQuery|ActionTypes\.Search|type ahead/i, evidence: "typeahead search evidence was detected." },
    { signal: "search-timeout", pattern: /setTimeout\([\s\S]{0,120}clearSearch|ClearSearch|350/i, evidence: "search timeout evidence was detected." },
    { signal: "select-active-option", pattern: /selectActiveOption|SelectOption|activeOptionIndex/i, evidence: "select active option evidence was detected." },
    { signal: "focus-next-prev", pattern: /Focus\.Next|Focus\.Previous|Keys\.ArrowDown|Keys\.ArrowUp/i, evidence: "next/previous focus evidence was detected." },
    { signal: "focus-first-last", pattern: /Focus\.First|Focus\.Last|Keys\.Home|Keys\.End|PageUp|PageDown/i, evidence: "first/last focus evidence was detected." },
    { signal: "tab-close-focus-next", pattern: /Keys\.Tab|focusFrom|FocusManagementFocus\.Next|Focus\.Next/i, evidence: "Tab close/focus next evidence was detected." },
    { signal: "register-option", pattern: /registerOption|ActionTypes\.RegisterOptions/i, evidence: "option registration evidence was detected." },
    { signal: "unregister-option", pattern: /unregisterOption|ActionTypes\.UnregisterOptions/i, evidence: "option unregister evidence was detected." },
    { signal: "scroll-into-view", pattern: /scrollIntoView|shouldScrollIntoView/i, evidence: "scroll into view evidence was detected." },
    { signal: "pointer-tracking", pattern: /useTrackedPointer|pointer\.wasMoved|ActivationTrigger\.Pointer|onPointerMove/i, evidence: "pointer tracking evidence was detected." },
    { signal: "disabled-prevent-default", pattern: /disabled[\s\S]{0,120}preventDefault|aria-disabled/i, evidence: "disabled preventDefault evidence was detected." },
    { signal: "option-role", pattern: /role:\s*['"]option|role=["']option/i, evidence: "option role evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected|selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "data-focus", pattern: /focus:\s*active|data-focus|active,\s*focus/i, evidence: "data focus/focus slot evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function selectComboboxReadinessTestSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["testSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|Arrow|Home|End|Enter|Escape/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|role\s*=/i, evidence: "role test evidence was detected." },
    { signal: "attribute-test", pattern: /toHaveAttribute|aria-expanded|aria-controls|aria-selected|aria-activedescendant|value/i, evidence: "attribute test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|select-combobox-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function selectComboboxReadinessPackageSignals(sourceFiles: SelectComboboxReadinessSourceFile[]): SelectComboboxReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SelectComboboxReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-select", pattern: /@radix-ui\/react-select/i, evidence: "@radix-ui/react-select dependency evidence was detected." },
    { signal: "@headlessui/react", pattern: /@headlessui\/react/i, evidence: "@headlessui/react dependency evidence was detected." },
    { signal: "@ariakit/react", pattern: /@ariakit\/react/i, evidence: "@ariakit/react dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\./i, evidence: "React evidence was detected." }
  ];
  return selectComboboxReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function selectComboboxReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SelectComboboxReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/select-combobox-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildToolbarToggleReadinessReport(walk: WalkResult): Promise<ToolbarToggleReadinessReport> {
  const sourceFiles = await toolbarToggleReadinessSourceFiles(walk);
  const toolbarToggleSetups = toolbarToggleReadinessSetups(sourceFiles);
  const frameworkSignals = toolbarToggleReadinessFrameworkSignals(sourceFiles);
  const structureSignals = toolbarToggleReadinessStructureSignals(sourceFiles);
  const stateSignals = toolbarToggleReadinessStateSignals(sourceFiles);
  const focusSignals = toolbarToggleReadinessFocusSignals(sourceFiles);
  const orientationSignals = toolbarToggleReadinessOrientationSignals(sourceFiles);
  const accessibilitySignals = toolbarToggleReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = toolbarToggleReadinessMachineSignals(sourceFiles);
  const valueSignals = toolbarToggleReadinessValueSignals(sourceFiles);
  const rovingFocusSignals = toolbarToggleReadinessRovingFocusSignals(sourceFiles);
  const domSignals = toolbarToggleReadinessDomSignals(sourceFiles);
  const apiSignals = toolbarToggleReadinessApiSignals(sourceFiles);
  const testSignals = toolbarToggleReadinessTestSignals(sourceFiles);
  const packageSignals = toolbarToggleReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || toolbarToggleSetups.some((item) => item.toolbarCount + item.toggleCount + item.toggleGroupCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || toolbarToggleSetups.some((item) => item.pressedStateCount > 0);
  const hasFocus = focusSignals.some((item) => item.readiness === "ready") || toolbarToggleSetups.some((item) => item.rovingFocusCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || toolbarToggleSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || toolbarToggleSetups.some((item) => item.testCount > 0);

  const riskQueue: ToolbarToggleReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document toolbar, toggle, or toggle group boundaries before claiming toolbar/toggle readiness.",
      why: "Toolbar/toggle readiness starts with concrete toolbar roots, toggle roots, toggle groups, items, separators, buttons, or links.",
      relatedHref: "html/toolbar-toggle-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Trace pressed/defaultPressed/onPressedChange, value/defaultValue/onValueChange, single/multiple, disabled, and data-state behavior.",
      why: "Toggle controls fail through controlled/uncontrolled pressed state drift, group value drift, and disabled-state mismatch.",
      relatedHref: "html/toolbar-toggle-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasFocus) {
    riskQueue.push({
      priority: "high",
      action: "Verify roving/composite focus, focusLoop, virtualFocus, active item, focusable item, and RTL direction handling.",
      why: "Toolbars and toggle groups depend on predictable keyboard focus movement without mutating unrelated controls.",
      relatedHref: "html/toolbar-toggle-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Verify toolbar/group/radio roles and aria-pressed, aria-checked, aria-label, aria-disabled, and tabindex wiring.",
      why: "Toolbar toggle readiness must expose pressed and grouped selection semantics to assistive technology.",
      relatedHref: "html/toolbar-toggle-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState || hasFocus) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add role, pressed-state, keyboard navigation, orientation, disabled, and attribute tests for toolbar/toggle controls.",
      why: "Static component evidence does not prove arrow/Home/End movement, roving focus, or pressed/group value updates.",
      relatedHref: "html/toolbar-toggle-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual toolbar/toggle behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records toolbar/toggle readiness only; it does not click buttons, toggle pressed state, move focus, dispatch keyboard events, mutate stores, submit forms, or run analyzed project tests.",
    relatedHref: "html/toolbar-toggle-readiness.html"
  });

  return {
    summary: `Toolbar/toggle readiness report: setup ${toolbarToggleSetups.length}개, framework signal ${frameworkSignals.length}개, state signal ${stateSignals.length}개, focus signal ${focusSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Toolbar/toggle readiness Radix Toolbar Toggle ToggleGroup Ariakit Toolbar pressed aria-pressed roving focus orientation keyboard tests",
    toolbarToggleSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    focusSignals,
    orientationSignals,
    accessibilitySignals,
    machineSignals,
    valueSignals,
    rovingFocusSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-toolbar|Toolbar\\.Root|Toolbar\\.Button|Toolbar\\.Link|Toolbar\\.Separator|Toolbar\\.ToggleGroup|Toolbar\\.ToggleItem\" package.json src app packages", purpose: "Find Radix toolbar roots, button/link controls, separators, and toolbar-scoped toggle groups." },
      { command: "rg \"@radix-ui/react-toggle|@radix-ui/react-toggle-group|Toggle\\.Root|ToggleGroup\\.Root|ToggleGroup\\.Item|pressed|defaultPressed|onPressedChange|onValueChange\" package.json src app packages", purpose: "Find Radix Toggle and ToggleGroup pressed/value state boundaries." },
      { command: "rg \"@ariakit/react|ToolbarProvider|useToolbarStore|ToolbarItem|ToolbarSeparator|ToolbarInput|focusLoop|virtualFocus|rtl\" package.json src app packages", purpose: "Find Ariakit toolbar provider/store, composite focus, separators, and input controls." },
      { command: "rg \"role=.*toolbar|aria-pressed|aria-checked|aria-orientation|ArrowRight|ArrowLeft|Home|End|getByRole|toHaveAttribute|userEvent\\.keyboard\" test tests src app packages", purpose: "Check ARIA, role, pressed-state, orientation, keyboard, and attribute coverage for toolbar/toggle controls." }
    ],
    learnerNextSteps: [
      "먼저 Radix Toolbar/Toggle/ToggleGroup, Ariakit Toolbar, 또는 custom toolbar/toggle 중 어떤 family를 쓰는지 확인하세요.",
      "toolbar root/provider, button/link, separator, toggle root/group/item, input/container 구조가 어떤 파일에 있는지 정리하세요.",
      "pressed/defaultPressed/onPressedChange, value/defaultValue/onValueChange, single/multiple, disabled, data-state가 controlled state와 일치하는지 확인하세요.",
      "roving focus, composite focus, focusLoop, virtualFocus, active/focusable item, RTL/dir, horizontal/vertical orientation, loop behavior를 테스트에서 확인하세요.",
      "role toolbar/group/radio와 aria-pressed/checked/label/disabled/orientation/tabindex가 실제 화면 읽기 값과 맞는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 click, pressed toggle, arrow/Home/End focus movement, store mutation은 원본 프로젝트의 component/browser tests에서 별도 확인하세요."
    ]
  };
}

type ToolbarToggleReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function toolbarToggleReadinessSourceFiles(walk: WalkResult): Promise<ToolbarToggleReadinessSourceFile[]> {
  const files: ToolbarToggleReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !toolbarToggleReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!toolbarToggleReadinessPathSignal(file.relPath) && !toolbarToggleReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function toolbarToggleReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return toolbarToggleReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function toolbarToggleReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(toolbar|toolbars|toggle|toggles|toggle-group|togglegroups|formatting|editor|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function toolbarToggleReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-toolbar|@radix-ui\/react-toggle|@radix-ui\/react-toggle-group|@zag-js\/toggle-group|toggleGroup\.machine|toggleGroup\.connect|TOGGLE\.FOCUS_NEXT|ROOT\.FOCUS|@ariakit\/react|Toolbar\.Root|Toolbar\.ToggleGroup|Toolbar\.ToggleItem|Toggle\.Root|ToggleGroup\.Root|ToggleGroup\.Item|ToolbarProvider|useToolbarStore|ToolbarItem|role\s*=\s*["']toolbar|aria-pressed|aria-checked|RovingFocusGroup|rovingFocus|focusLoop|virtualFocus)/i.test(text);
}

function toolbarToggleReadinessSetups(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["toolbarToggleSetups"] {
  const rows: ToolbarToggleReadinessReport["toolbarToggleSetups"] = [];
  for (const source of sourceFiles) {
    const toolbarCount = countMatches(source.text, /(Toolbar\.Root|ToolbarProvider|useToolbarStore|<Toolbar\b|role\s*=\s*["']toolbar|toolbar\b)/gi);
    const toggleCount = countMatches(source.text, /(Toggle\.Root|TogglePrimitive|useToggle|aria-pressed|pressed\b|toggle\b)/gi);
    const toggleGroupCount = countMatches(source.text, /(@zag-js\/toggle-group|toggleGroup\.machine|toggleGroup\.connect|ToggleGroup\.Root|Toolbar\.ToggleGroup|ToggleGroupPrimitive|type\s*=\s*["']single|type\s*=\s*["']multiple|toggle group|toggle-group|getRootProps)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|getItemState|getItemId|Toolbar\.ToggleItem|ToggleGroup\.Item|ToolbarItem|ToolbarInput|Item\b|item\b)/gi);
    const separatorCount = countMatches(source.text, /(Toolbar\.Separator|ToolbarSeparator|SeparatorPrimitive|separator\b)/gi);
    const buttonLinkCount = countMatches(source.text, /(Toolbar\.Button|Toolbar\.Link|ToolbarButton|ToolbarLink|as\s*=\s*["']button|type\s*=\s*["']button|href\s*=|button\b|link\b)/gi);
    const pressedStateCount = countMatches(source.text, /(pressed\s*=|defaultPressed|onPressedChange|aria-pressed|data-state|isPressed|pressed\b)/gi);
    const rovingFocusCount = countMatches(source.text, /(RovingFocusGroup|rovingFocus|focusedId|currentLoopFocus|isTabbingBackward|isClickFocus|isWithinToolbar|useToolbarStore|Composite|focusLoop|virtualFocus|focusable|active|rtl|dir\s*=\s*["']rtl)/gi);
    const orientationCount = countMatches(source.text, /(orientation\s*=|aria-orientation|horizontal|vertical|dir\s*=|rtl|ltr|loop\s*=|focusLoop|Loop)/gi);
    const keyboardCount = countMatches(source.text, /(keyboard|onKeyDown|userEvent\.keyboard|ArrowRight|ArrowLeft|ArrowUp|ArrowDown|Home|End)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']toolbar|role\s*=\s*["']group|role\s*=\s*["']radio|getByRole|aria-pressed|aria-checked|aria-label|aria-labelledby|aria-disabled|aria-orientation|tabIndex|disabled)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.keyboard|getByRole|toHaveAttribute|toolbar-toggle-traces|upload-artifact|keyboard)/gi);
    const total = toolbarCount + toggleCount + toggleGroupCount + itemCount + separatorCount + buttonLinkCount + pressedStateCount + rovingFocusCount + orientationCount + keyboardCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = (toolbarCount + toggleCount + toggleGroupCount > 0) && pressedStateCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: toolbarToggleReadinessFramework(source),
      toolbarCount,
      toggleCount,
      toggleGroupCount,
      itemCount,
      separatorCount,
      buttonLinkCount,
      pressedStateCount,
      rovingFocusCount,
      orientationCount,
      keyboardCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `toolbar ${toolbarCount}, toggle ${toggleCount}, toggle group ${toggleGroupCount}, item ${itemCount}, separator ${separatorCount}, button/link ${buttonLinkCount}, pressed state ${pressedStateCount}, roving focus ${rovingFocusCount}, orientation ${orientationCount}, keyboard ${keyboardCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.toolbarCount + b.toggleCount + b.toggleGroupCount + b.pressedStateCount + b.accessibilityCount - (a.toolbarCount + a.toggleCount + a.toggleGroupCount + a.pressedStateCount + a.accessibilityCount));
}

function toolbarToggleReadinessFramework(source: ToolbarToggleReadinessSourceFile): ToolbarToggleReadinessReport["toolbarToggleSetups"][number]["framework"] {
  if (/@zag-js\/toggle-group|toggleGroup\.machine|toggleGroup\.connect|TOGGLE\.FOCUS_NEXT|ROOT\.FOCUS|getItemProps/i.test(source.text)) return "zag-toggle-group";
  if (/@radix-ui\/react-toolbar|Toolbar\.Root|Toolbar\.ToggleGroup|Toolbar\.ToggleItem|Toolbar\.Button|Toolbar\.Link/i.test(source.text)) return "radix-toolbar";
  if (/@radix-ui\/react-toggle-group|ToggleGroup\.Root|ToggleGroup\.Item/i.test(source.text)) return "radix-toggle-group";
  if (/@radix-ui\/react-toggle|Toggle\.Root|defaultPressed|onPressedChange/i.test(source.text)) return "radix-toggle";
  if (/@ariakit\/react|ToolbarProvider|useToolbarStore|ToolbarItem|ToolbarSeparator|ToolbarInput/i.test(source.text)) return "ariakit-toolbar";
  if (/role\s*=\s*["']toolbar|aria-pressed|aria-checked/i.test(source.text)) return "custom";
  return "unknown";
}

function toolbarToggleReadinessFrameworkSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-toolbar", pattern: /@radix-ui\/react-toolbar|Toolbar\.Root|Toolbar\.ToggleGroup|Toolbar\.ToggleItem|Toolbar\.Button|Toolbar\.Link/i, evidence: "Radix Toolbar evidence was detected." },
    { signal: "radix-toggle", pattern: /@radix-ui\/react-toggle|Toggle\.Root|defaultPressed|onPressedChange/i, evidence: "Radix Toggle evidence was detected." },
    { signal: "radix-toggle-group", pattern: /@radix-ui\/react-toggle-group|ToggleGroup\.Root|ToggleGroup\.Item|Toolbar\.ToggleGroup|Toolbar\.ToggleItem/i, evidence: "Radix ToggleGroup evidence was detected." },
    { signal: "zag-toggle-group", pattern: /@zag-js\/toggle-group|toggleGroup\.machine|toggleGroup\.connect|TOGGLE\.FOCUS_NEXT|ROOT\.FOCUS|getItemProps/i, evidence: "Zag ToggleGroup evidence was detected." },
    { signal: "ariakit-toolbar", pattern: /@ariakit\/react|ToolbarProvider|useToolbarStore|ToolbarItem|ToolbarSeparator|ToolbarInput/i, evidence: "Ariakit Toolbar evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']toolbar|aria-pressed|aria-checked/i, evidence: "custom toolbar/toggle evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function toolbarToggleReadinessStructureSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["structureSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "toolbar-root", pattern: /Toolbar\.Root|<Toolbar\b|role\s*=\s*["']toolbar|useToolbarStore/i, evidence: "toolbar root evidence was detected." },
    { signal: "toolbar-provider", pattern: /ToolbarProvider|createToolbarStore|useToolbarStore|Toolbar\.Root|ToolbarProviderContext/i, evidence: "toolbar provider/store evidence was detected." },
    { signal: "toolbar-item", pattern: /ToolbarItem|Toolbar\.Button|Toolbar\.Link|Toolbar\.ToggleItem|ToggleGroup\.Item/i, evidence: "toolbar item evidence was detected." },
    { signal: "button-link", pattern: /Toolbar\.Button|Toolbar\.Link|ToolbarButton|ToolbarLink|as\s*=\s*["']button|type\s*=\s*["']button|href\s*=|button\b|link\b/i, evidence: "button/link evidence was detected." },
    { signal: "separator", pattern: /Toolbar\.Separator|ToolbarSeparator|SeparatorPrimitive|separator\b/i, evidence: "separator evidence was detected." },
    { signal: "toggle-root", pattern: /Toggle\.Root|TogglePrimitive|aria-pressed|pressed\s*=/i, evidence: "toggle root evidence was detected." },
    { signal: "toggle-group", pattern: /@zag-js\/toggle-group|toggleGroup\.machine|toggleGroup\.connect|ToggleGroup\.Root|Toolbar\.ToggleGroup|ToggleGroupPrimitive|type\s*=\s*["']single|type\s*=\s*["']multiple|getRootProps/i, evidence: "toggle group evidence was detected." },
    { signal: "toggle-item", pattern: /getItemProps|getItemState|ToggleGroup\.Item|Toolbar\.ToggleItem|role\s*=\s*["']radio|aria-checked/i, evidence: "toggle item evidence was detected." },
    { signal: "input-container", pattern: /ToolbarInput|ToolbarContainer|input\b|container\b/i, evidence: "toolbar input/container evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function toolbarToggleReadinessStateSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["stateSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pressed", pattern: /pressed\s*=|aria-pressed|\bpressed\b/i, evidence: "pressed evidence was detected." },
    { signal: "default-pressed", pattern: /defaultPressed/i, evidence: "defaultPressed evidence was detected." },
    { signal: "on-pressed-change", pattern: /onPressedChange|setPressed/i, evidence: "onPressedChange evidence was detected." },
    { signal: "value", pattern: /value\s*=|\bvalue\b|ToggleGroup\.Item|Toolbar\.ToggleItem/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange|setValue/i, evidence: "onValueChange evidence was detected." },
    { signal: "single", pattern: /type\s*=\s*["']single|single\b/i, evidence: "single selection evidence was detected." },
    { signal: "multiple", pattern: /type\s*=\s*["']multiple|multiple\b/i, evidence: "multiple selection evidence was detected." },
    { signal: "data-state", pattern: /data-state|pressed\s*\?|Toggle\.Root/i, evidence: "data-state evidence was detected." },
    { signal: "disabled", pattern: /disabled|aria-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "deselectable", pattern: /deselectable/i, evidence: "deselectable evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function toolbarToggleReadinessFocusSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["focusSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["focusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "roving-focus", pattern: /RovingFocusGroup|rovingFocus|Toolbar\.Root|Toolbar\.ToggleGroup|ToggleGroup\.Root|getItemProps/i, evidence: "roving focus evidence was detected." },
    { signal: "composite-focus", pattern: /Composite|useComposite|useToolbarStore|ToolbarProvider|ToolbarItem/i, evidence: "composite focus evidence was detected." },
    { signal: "focus-loop", pattern: /focusLoop|loopFocus|loop\s*=|loop\b/i, evidence: "focus loop evidence was detected." },
    { signal: "virtual-focus", pattern: /virtualFocus|virtual focus/i, evidence: "virtual focus evidence was detected." },
    { signal: "active-item", pattern: /active|data-active|focusedId|activeItem|currentId/i, evidence: "active item evidence was detected." },
    { signal: "focusable-item", pattern: /focusable|ToolbarItem|getItemProps|ToggleGroup\.Item|Toolbar\.ToggleItem|tabIndex/i, evidence: "focusable item evidence was detected." },
    { signal: "rtl-dir", pattern: /dir\s*=\s*["']rtl|rtl\s*:\s*true|rtl\b/i, evidence: "RTL direction evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "focus", "signal");
}

function toolbarToggleReadinessOrientationSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["orientationSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["orientationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "horizontal", pattern: /horizontal|orientation\s*=\s*["']horizontal/i, evidence: "horizontal orientation evidence was detected." },
    { signal: "vertical", pattern: /vertical|orientation\s*=\s*["']vertical/i, evidence: "vertical orientation evidence was detected." },
    { signal: "aria-orientation", pattern: /aria-orientation|toHaveAttribute\(["']aria-orientation/i, evidence: "aria-orientation evidence was detected." },
    { signal: "dir", pattern: /dir\s*=|direction|rtl|ltr/i, evidence: "direction evidence was detected." },
    { signal: "loop", pattern: /loop\s*=|focusLoop|loopFocus|loop\b/i, evidence: "loop evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "orientation", "signal");
}

function toolbarToggleReadinessAccessibilitySignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-toolbar", pattern: /role\s*=\s*["']toolbar|getByRole\(["']toolbar|Toolbar\.Root|<Toolbar\b/i, evidence: "toolbar role evidence was detected." },
    { signal: "role-group", pattern: /role\s*=\s*["']group|ToggleGroup\.Root|Toolbar\.ToggleGroup|type\s*=\s*["']multiple|type\s*=\s*["']single/i, evidence: "group role evidence was detected." },
    { signal: "role-radio", pattern: /role\s*=\s*["']radio|ToggleGroup\.Item|Toolbar\.ToggleItem|type\s*=\s*["']single/i, evidence: "radio role evidence was detected." },
    { signal: "aria-pressed", pattern: /aria-pressed|getByRole\([^)]*pressed|pressed\s*=/i, evidence: "aria-pressed evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked|ToggleGroup\.Item|Toolbar\.ToggleItem|type\s*=\s*["']single/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby|aria-describedby|label\b/i, evidence: "ARIA label evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled|disabled/i, evidence: "ARIA disabled evidence was detected." },
    { signal: "tabindex", pattern: /tabIndex|tabindex|RovingFocusGroup|ToolbarItem|focusable/i, evidence: "tabindex/focusability evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function toolbarToggleReadinessMachineSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["machineSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "focused", pattern: /\bfocused\b/i, evidence: "focused state evidence was detected." },
    { signal: "value-set", pattern: /VALUE\.SET/i, evidence: "VALUE.SET event evidence was detected." },
    { signal: "toggle-click", pattern: /TOGGLE\.CLICK/i, evidence: "TOGGLE.CLICK event evidence was detected." },
    { signal: "root-mouse-down", pattern: /ROOT\.MOUSE_DOWN/i, evidence: "ROOT.MOUSE_DOWN event evidence was detected." },
    { signal: "root-focus", pattern: /ROOT\.FOCUS/i, evidence: "ROOT.FOCUS event evidence was detected." },
    { signal: "root-blur", pattern: /ROOT\.BLUR/i, evidence: "ROOT.BLUR event evidence was detected." },
    { signal: "toggle-focus", pattern: /TOGGLE\.FOCUS\b/i, evidence: "TOGGLE.FOCUS event evidence was detected." },
    { signal: "focus-next", pattern: /TOGGLE\.FOCUS_NEXT|focusNextToggle/i, evidence: "focus next evidence was detected." },
    { signal: "focus-prev", pattern: /TOGGLE\.FOCUS_PREV|focusPrevToggle/i, evidence: "focus prev evidence was detected." },
    { signal: "focus-first", pattern: /TOGGLE\.FOCUS_FIRST|focusFirstToggle/i, evidence: "focus first evidence was detected." },
    { signal: "focus-last", pattern: /TOGGLE\.FOCUS_LAST|focusLastToggle/i, evidence: "focus last evidence was detected." },
    { signal: "shift-tab", pattern: /TOGGLE\.SHIFT_TAB|isTabbingBackward/i, evidence: "shift tab evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function toolbarToggleReadinessValueSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["valueSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-array", pattern: /value:\s*\[|value\s*=\s*\[|string\[\]|value\)/i, evidence: "value array evidence was detected." },
    { signal: "controlled-value", pattern: /value\s*:|value\s*=|prop\(["']value["']\)/i, evidence: "controlled value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange/i, evidence: "onValueChange evidence was detected." },
    { signal: "multiple", pattern: /multiple/i, evidence: "multiple selection evidence was detected." },
    { signal: "deselectable", pattern: /deselectable/i, evidence: "deselectable evidence was detected." },
    { signal: "ensure-props", pattern: /ensureProps/i, evidence: "ensureProps evidence was detected." },
    { signal: "add-or-remove", pattern: /addOrRemove/i, evidence: "addOrRemove evidence was detected." },
    { signal: "item-state", pattern: /getItemState|ItemState|pressed|focused/i, evidence: "item state evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function toolbarToggleReadinessRovingFocusSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["rovingFocusSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["rovingFocusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focused-id", pattern: /focusedId/i, evidence: "focusedId evidence was detected." },
    { signal: "tabbing-backward", pattern: /isTabbingBackward|setIsTabbingBackward/i, evidence: "tabbing backward evidence was detected." },
    { signal: "click-focus", pattern: /isClickFocus|setClickFocus/i, evidence: "click focus evidence was detected." },
    { signal: "within-toolbar", pattern: /isWithinToolbar|checkIfWithinToolbar|\[role=toolbar\]/i, evidence: "within toolbar evidence was detected." },
    { signal: "current-loop-focus", pattern: /currentLoopFocus/i, evidence: "current loop focus evidence was detected." },
    { signal: "raf-focus", pattern: /\braf\b|preventScroll/i, evidence: "raf focus evidence was detected." },
    { signal: "next-prev-by-id", pattern: /nextById|prevById|getNextEl|getPrevEl/i, evidence: "next/prev by id evidence was detected." },
    { signal: "first-last", pattern: /getFirstEl|getLastEl|first\(|last\(/i, evidence: "first/last focus evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "roving focus", "signal");
}

function toolbarToggleReadinessDomSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["domSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|ids:\s*\{\s*root|toggle-group:/i, evidence: "root id evidence was detected." },
    { signal: "item-id", pattern: /getItemId|ids:\s*\{[^}]*item|toggle-group:.*:/i, evidence: "item id evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation evidence was detected." },
    { signal: "data-focus", pattern: /data-focus/i, evidence: "data-focus evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "role-radiogroup", pattern: /role:\s*isSingle\s*\?\s*["']radiogroup|role\s*=\s*["']radiogroup/i, evidence: "radiogroup role evidence was detected." },
    { signal: "role-group", pattern: /role:\s*isSingle[^:]+:\s*["']group|role\s*=\s*["']group/i, evidence: "group role evidence was detected." },
    { signal: "role-radio", pattern: /role:\s*isSingle\s*\?\s*["']radio|role\s*=\s*["']radio/i, evidence: "radio role evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-pressed", pattern: /aria-pressed/i, evidence: "aria-pressed evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function toolbarToggleReadinessApiSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["apiSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-api", pattern: /\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "set-value-api", pattern: /setValue\(|VALUE\.SET/i, evidence: "setValue API evidence was detected." },
    { signal: "item-state-api", pattern: /getItemState|ItemState/i, evidence: "item state API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root prop getter evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item prop getter evidence was detected." },
    { signal: "root-radiogroup-role", pattern: /role:\s*isSingle\s*\?\s*["']radiogroup|role:\s*radiogroup|role\s*=\s*["']radiogroup/i, evidence: "root radiogroup role evidence was detected." },
    { signal: "root-group-role", pattern: /role:\s*isSingle[^:]+:\s*["']group|role:\s*group|role\s*=\s*["']group/i, evidence: "root group role evidence was detected." },
    { signal: "item-radio-role", pattern: /role:\s*isSingle\s*\?\s*["']radio|role:\s*radio|role\s*=\s*["']radio/i, evidence: "item radio role evidence was detected." },
    { signal: "root-tabindex", pattern: /tabIndex:\s*context\.get\(["']isTabbingBackward["']\)|tabIndex=\{?0/i, evidence: "root tabIndex evidence was detected." },
    { signal: "item-tabindex", pattern: /tabIndex:\s*rovingFocus|rovingTabIndex|tabIndex/i, evidence: "item tabIndex evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API attribute evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation API attribute evidence was detected." },
    { signal: "data-focus", pattern: /data-focus/i, evidence: "data-focus API attribute evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby API attribute evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API attribute evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-pressed", pattern: /aria-pressed/i, evidence: "aria-pressed evidence was detected." },
    { signal: "root-mouse-down-handler", pattern: /onMouseDown/i, evidence: "root mouse down handler evidence was detected." },
    { signal: "root-focus-handler", pattern: /onFocus\(event\)|ROOT\.FOCUS/i, evidence: "root focus handler evidence was detected." },
    { signal: "root-blur-handler", pattern: /onBlur\(event\)|ROOT\.BLUR/i, evidence: "root blur handler evidence was detected." },
    { signal: "item-focus-handler", pattern: /onFocus\(\)|TOGGLE\.FOCUS/i, evidence: "item focus handler evidence was detected." },
    { signal: "item-click-handler", pattern: /onClick\(event\)|TOGGLE\.CLICK/i, evidence: "item click handler evidence was detected." },
    { signal: "item-keydown-handler", pattern: /onKeyDown|getEventKey/i, evidence: "item keydown handler evidence was detected." },
    { signal: "arrow-key-map", pattern: /ArrowLeft|ArrowRight|ArrowUp|ArrowDown/i, evidence: "arrow key map evidence was detected." },
    { signal: "home-end-key-map", pattern: /\bHome\b|\bEnd\b/i, evidence: "Home/End key map evidence was detected." },
    { signal: "shift-tab-key-map", pattern: /shiftKey|TOGGLE\.SHIFT_TAB/i, evidence: "Shift+Tab key map evidence was detected." },
    { signal: "safari-focus-fix", pattern: /isSafari|preventScroll/i, evidence: "Safari focus fix evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "API", "signal");
}

function toolbarToggleReadinessTestSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["testSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|ArrowRight|ArrowLeft|ArrowUp|ArrowDown|Home|End/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|role\s*=/i, evidence: "role test evidence was detected." },
    { signal: "attribute-test", pattern: /toHaveAttribute|aria-pressed|aria-checked|aria-orientation|data-state/i, evidence: "attribute test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|toolbar-toggle-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function toolbarToggleReadinessPackageSignals(sourceFiles: ToolbarToggleReadinessSourceFile[]): ToolbarToggleReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ToolbarToggleReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-toolbar", pattern: /@radix-ui\/react-toolbar/i, evidence: "@radix-ui/react-toolbar dependency evidence was detected." },
    { signal: "@radix-ui/react-toggle", pattern: /@radix-ui\/react-toggle["']|@radix-ui\/react-toggle\b/i, evidence: "@radix-ui/react-toggle dependency evidence was detected." },
    { signal: "@radix-ui/react-toggle-group", pattern: /@radix-ui\/react-toggle-group/i, evidence: "@radix-ui/react-toggle-group dependency evidence was detected." },
    { signal: "@zag-js/toggle-group", pattern: /@zag-js\/toggle-group/i, evidence: "@zag-js/toggle-group dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "@ariakit/react", pattern: /@ariakit\/react/i, evidence: "@ariakit/react dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\./i, evidence: "React evidence was detected." }
  ];
  return toolbarToggleReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function toolbarToggleReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ToolbarToggleReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/toolbar-toggle-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
