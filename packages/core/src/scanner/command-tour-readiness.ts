import type { CommandPaletteReadinessReport, GuidedTourReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildCommandPaletteReadinessReport(walk: WalkResult): Promise<CommandPaletteReadinessReport> {
  const sourceFiles = await commandPaletteReadinessSourceFiles(walk);
  const commandPaletteSetups = commandPaletteReadinessSetups(sourceFiles);
  const frameworkSignals = commandPaletteReadinessFrameworkSignals(sourceFiles);
  const inputSignals = commandPaletteReadinessInputSignals(sourceFiles);
  const resultSignals = commandPaletteReadinessResultSignals(sourceFiles);
  const selectionSignals = commandPaletteReadinessSelectionSignals(sourceFiles);
  const filterSignals = commandPaletteReadinessFilterSignals(sourceFiles);
  const stateSignals = commandPaletteReadinessStateSignals(sourceFiles);
  const pluginSignals = commandPaletteReadinessPluginSignals(sourceFiles);
  const accessibilitySignals = commandPaletteReadinessAccessibilitySignals(sourceFiles);
  const keyboardSignals = commandPaletteReadinessKeyboardSignals(sourceFiles);
  const testSignals = commandPaletteReadinessTestSignals(sourceFiles);
  const packageSignals = commandPaletteReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasInput = inputSignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.inputCount > 0);
  const hasResults = resultSignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.resultCount > 0);
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.selectionCount > 0);
  const hasFiltering = filterSignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.filterCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.accessibilityCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.keyboardCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || commandPaletteSetups.some((item) => item.testCount > 0);

  const riskQueue: CommandPaletteReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasInput) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a command palette or autocomplete boundary such as cmdk, Algolia Autocomplete, Downshift, or a custom combobox adapter.",
      why: "Command palette readiness starts with a visible input, command dialog, autocomplete root, or combobox boundary learners can inspect.",
      relatedHref: "html/command-palette-readiness.html"
    });
  }
  if (hasInput && !hasResults) {
    riskQueue.push({
      priority: "high",
      action: "Trace the result source, item renderer, menu/list, group, empty state, or option getter for the palette.",
      why: "A command input without visible result semantics does not show how users discover and compare possible commands.",
      relatedHref: "html/command-palette-readiness.html"
    });
  }
  if (hasResults && !hasSelection) {
    riskQueue.push({
      priority: "high",
      action: "Document onSelect, selectedItem, highlightedIndex, setQuery, value, or URL handoff behavior.",
      why: "Learners need to see how highlighted results become navigation, actions, or query state changes.",
      relatedHref: "html/command-palette-readiness.html"
    });
  }
  if (hasInput && !hasFiltering) {
    riskQueue.push({
      priority: "medium",
      action: "Add filter, keywords, query, sourceId, stateReducer, or source ranking evidence.",
      why: "Command palettes are search interfaces; filtering and ranking rules should be inspectable before readiness is claimed.",
      relatedHref: "html/command-palette-readiness.html"
    });
  }
  if (hasInput && (!hasAccessibility || !hasKeyboard)) {
    riskQueue.push({
      priority: "high",
      action: "Add combobox/listbox/option roles, aria-activedescendant, aria-expanded, aria-controls, and keyboard handling evidence.",
      why: "Palettes and autocomplete menus are keyboard-first UI and can regress badly without explicit ARIA and keyboard contracts.",
      relatedHref: "html/command-palette-readiness.html"
    });
  }
  if (hasInput && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for Meta-K opening, Arrow navigation, Enter selection, Escape close, and role-based queries.",
      why: "Palette regressions usually surface in focus, keyboard, and option-selection transitions, so static code alone is not enough.",
      relatedHref: "html/command-palette-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live palette behavior with trusted local browser or original project tests outside RepoTutor.",
    why: "RepoTutor records command palette readiness only; it does not open dialogs, dispatch keyboard events, focus inputs, run fuzzy search, fetch autocomplete sources, mutate selected state, navigate URLs, call Algolia services, render portals, or run analyzed project tests.",
    relatedHref: "html/command-palette-readiness.html"
  });

  return {
    summary: `cmdk/Algolia Autocomplete/Downshift-style command palette readiness report: setup ${commandPaletteSetups.length}개, framework signal ${frameworkSignals.length}개, keyboard signal ${keyboardSignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Command palette readiness cmdk Command.Input Command.Item Algolia autocomplete getSources Downshift useCombobox keyboard aria tests",
    commandPaletteSetups,
    frameworkSignals,
    inputSignals,
    resultSignals,
    selectionSignals,
    filterSignals,
    stateSignals,
    pluginSignals,
    accessibilitySignals,
    keyboardSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"Command.Dialog|Command.Input|Command.List|Command.Item|useCommandState|onValueChange|onSelect\" src app packages test", purpose: "Find cmdk command palette roots, inputs, lists, items, selected state, and selection handlers." },
      { command: "rg \"autocomplete\\(|createAutocomplete|getSources|getItems|getInputProps|getItemProps|getMenuProps|setQuery|refresh\\(\\)|update\\(\" src app packages test", purpose: "Find Algolia Autocomplete setup, sources, prop getters, query mutations, and refresh/update paths." },
      { command: "rg \"useCombobox|Downshift|getInputProps|getMenuProps|getItemProps|getToggleButtonProps|highlightedIndex|selectedItem|stateReducer\" src app packages test", purpose: "Find Downshift combobox state, prop getters, highlighted item, selected item, and reducer hooks." },
      { command: "rg \"role=.*combobox|role=.*listbox|role=.*option|aria-activedescendant|aria-expanded|aria-controls|aria-autocomplete\" src app packages test", purpose: "Review ARIA combobox/listbox/option semantics and active descendant wiring." },
      { command: "rg \"ArrowDown|ArrowUp|Enter|Escape|metaKey|keyCode === 229|userEvent\\.keyboard|fireEvent\\.keyDown\" src app packages test", purpose: "Review keyboard navigation, selection, close behavior, Meta-K shortcut, and IME guards." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover palette opening, keyboard navigation, filtering, selection, and accessibility flows." }
    ],
    learnerNextSteps: [
      "먼저 cmdk, Algolia Autocomplete, Downshift, custom combobox 중 어떤 palette boundary가 있는지 찾으세요.",
      "Command.Input, getInputProps, placeholder, openOnFocus 같은 input 신호부터 보면 검색 진입점이 보입니다.",
      "Command.List, Command.Item, getSources, getItems, getMenuProps, getItemProps는 결과 목록과 item rendering 경계를 설명합니다.",
      "onSelect, selectedItem, highlightedIndex, setQuery, value는 사용자의 선택이 action, navigation, query state로 바뀌는 경로입니다.",
      "filter, keywords, shouldFilter, query, stateReducer는 검색어가 결과 ranking과 filtering으로 들어가는 규칙입니다.",
      "role=combobox/listbox/option, aria-activedescendant, aria-expanded, aria-controls와 Arrow/Enter/Escape/Meta-K 테스트를 같이 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 focus trap, portal, IME composition, remote source latency, navigation side effect는 원본 프로젝트 테스트나 수동 검증에서 확인하세요."
    ]
  };
}

type CommandPaletteReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function commandPaletteReadinessSourceFiles(walk: WalkResult): Promise<CommandPaletteReadinessSourceFile[]> {
  const files: CommandPaletteReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !commandPaletteReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!commandPaletteReadinessPathSignal(file.relPath) && !commandPaletteReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function commandPaletteReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return commandPaletteReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function commandPaletteReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(command|commands|palette|autocomplete|combobox|search|quick[-_ ]?open|launcher|cmdk|downshift|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function commandPaletteReadinessContentSignal(text: string): boolean {
  return /(cmdk|Command\.Dialog|Command\.Input|Command\.List|Command\.Item|useCommandState|@algolia\/autocomplete|autocomplete\s*\(|createAutocomplete|getSources|getInputProps|getItemProps|getMenuProps|useCombobox|Downshift|stateChangeTypes|highlightedIndex|selectedItem|aria-activedescendant|role\s*=\s*["']combobox|fireEvent\.keyDown|userEvent\.keyboard)/i.test(text);
}

function commandPaletteReadinessSetups(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["commandPaletteSetups"] {
  const rows: CommandPaletteReadinessReport["commandPaletteSetups"] = [];
  for (const source of sourceFiles) {
    const inputCount = countMatches(source.text, /(Command\.Input|onValueChange|getInputProps|inputElement|placeholder|openOnFocus|search\s*=|search,|inputValue|autocomplete\s*\(|createAutocomplete|combobox)/gi);
    const resultCount = countMatches(source.text, /(Command\.List|Command\.Item|Command\.Group|Command\.Empty|getSources|getItems|getItemUrl|getMenuProps|getItemProps|templates\s*:|noResults|listbox|option)/gi);
    const selectionCount = countMatches(source.text, /(onSelect|selectedItem|highlightedIndex|setQuery|value\s*=|value:|getItemUrl|InputKeyDownEnter|aria-selected)/gi);
    const filterCount = countMatches(source.text, /(filter\s*=|filter:|keywords|shouldFilter|query\s*=>|query\s*\}|query\s*\)|sourceId|stateReducer|rank|fuzzy)/gi);
    const stateCount = countMatches(source.text, /(useCommandState|open\s*=|onOpenChange|setOpen|search|inputValue|isOpen|onStateChange|onInputValueChange|onSelectedItemChange|refresh\s*\(|update\s*\()/gi);
    const pluginCount = countMatches(source.text, /(createLocalStorageRecentSearchesPlugin|recentSearchesPlugin|createQuerySuggestionsPlugin|querySuggestionsPlugin|plugins\s*:|insights|templates\s*:)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']combobox|role:\s*["']combobox|role\s*=\s*["']listbox|role\s*=\s*["']option|["']role["']\s*,\s*["']combobox|["']role["']\s*,\s*["']listbox|["']role["']\s*,\s*["']option|aria-activedescendant|aria-expanded|aria-controls|aria-autocomplete|aria-label|aria-selected)/gi);
    const keyboardCount = countMatches(source.text, /(ArrowDown|ArrowUp|Enter|Escape|metaKey|Meta|Mod-k|keyCode\s*===\s*229|KeyboardEvent|keydown|userEvent\.keyboard|fireEvent\.keyDown)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|describe\s*\(|it\s*\(|expect\s*\(|testing-library|getByRole|queryAllByRole|userEvent\.keyboard|fireEvent\.keyDown|upload-artifact|command-palette-traces)/gi);
    const hasSetupSignal = inputCount + resultCount + selectionCount + filterCount + stateCount + pluginCount + accessibilityCount + keyboardCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: commandPaletteReadinessPlatform(source),
      inputCount,
      resultCount,
      selectionCount,
      filterCount,
      stateCount,
      pluginCount,
      accessibilityCount,
      keyboardCount,
      testCount,
      readiness: inputCount > 0 && resultCount > 0 && selectionCount > 0 && stateCount > 0 && (accessibilityCount + keyboardCount + testCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains input ${inputCount}, results ${resultCount}, selection ${selectionCount}, filtering ${filterCount}, state ${stateCount}, plugins ${pluginCount}, accessibility ${accessibilityCount}, keyboard ${keyboardCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function commandPaletteReadinessPlatform(source: CommandPaletteReadinessSourceFile): CommandPaletteReadinessReport["commandPaletteSetups"][number]["platform"] {
  if (/cmdk|Command\.Dialog|Command\.Input|Command\.List|Command\.Item|useCommandState/i.test(source.text)) return "cmdk";
  if (/@algolia\/autocomplete|autocomplete\s*\(|createAutocomplete|getSources|getPanelProps/i.test(source.text)) return "algolia-autocomplete";
  if (/downshift|useCombobox|Downshift|stateChangeTypes|getToggleButtonProps/i.test(source.text)) return "downshift";
  if (/command|palette|autocomplete|combobox|launcher|quick[-_ ]?open/i.test(source.text) || commandPaletteReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function commandPaletteReadinessFrameworkSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cmdk", pattern: /cmdk|Command\.Dialog|Command\.Input|Command\.List|Command\.Item|useCommandState/i, evidence: "cmdk evidence was detected." },
    { signal: "algolia-autocomplete", pattern: /@algolia\/autocomplete|autocomplete\s*\(|createAutocomplete|getSources/i, evidence: "Algolia Autocomplete evidence was detected." },
    { signal: "downshift", pattern: /downshift|useCombobox|Downshift|stateChangeTypes/i, evidence: "Downshift evidence was detected." },
    { signal: "custom", pattern: /command[-_ ]?palette|quick[-_ ]?open|combobox|launcher|autocomplete/i, evidence: "custom palette evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function commandPaletteReadinessInputSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["inputSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["inputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "command-input", pattern: /Command\.Input/i, evidence: "Command.Input evidence was detected." },
    { signal: "get-input-props", pattern: /getInputProps/i, evidence: "getInputProps evidence was detected." },
    { signal: "placeholder", pattern: /placeholder/i, evidence: "placeholder evidence was detected." },
    { signal: "open-on-focus", pattern: /openOnFocus/i, evidence: "openOnFocus evidence was detected." },
    { signal: "search-input", pattern: /search|inputValue|autocomplete\s*\(|combobox/i, evidence: "search input evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "input", "signal");
}

function commandPaletteReadinessResultSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["resultSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["resultSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "command-list", pattern: /Command\.List/i, evidence: "Command.List evidence was detected." },
    { signal: "command-item", pattern: /Command\.Item/i, evidence: "Command.Item evidence was detected." },
    { signal: "command-group", pattern: /Command\.Group/i, evidence: "Command.Group evidence was detected." },
    { signal: "get-sources", pattern: /getSources/i, evidence: "getSources evidence was detected." },
    { signal: "get-items", pattern: /getItems/i, evidence: "getItems evidence was detected." },
    { signal: "get-menu-props", pattern: /getMenuProps/i, evidence: "getMenuProps evidence was detected." },
    { signal: "get-item-props", pattern: /getItemProps/i, evidence: "getItemProps evidence was detected." },
    { signal: "empty-state", pattern: /Command\.Empty|noResults|renderNoResults/i, evidence: "empty/no-results evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "result", "signal");
}

function commandPaletteReadinessSelectionSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "on-select", pattern: /onSelect/i, evidence: "onSelect evidence was detected." },
    { signal: "selected-item", pattern: /selectedItem|onSelectedItemChange/i, evidence: "selected item evidence was detected." },
    { signal: "highlighted-index", pattern: /highlightedIndex/i, evidence: "highlighted index evidence was detected." },
    { signal: "set-query", pattern: /setQuery/i, evidence: "setQuery evidence was detected." },
    { signal: "value", pattern: /\bvalue\s*=|\bvalue\s*:|state\.value/i, evidence: "value evidence was detected." },
    { signal: "item-url", pattern: /getItemUrl|item\.url|redirectUrl/i, evidence: "item URL evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function commandPaletteReadinessFilterSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["filterSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["filterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "filter", pattern: /\bfilter\s*=|\bfilter\s*:/i, evidence: "filter evidence was detected." },
    { signal: "keywords", pattern: /keywords/i, evidence: "keywords evidence was detected." },
    { signal: "should-filter", pattern: /shouldFilter/i, evidence: "shouldFilter evidence was detected." },
    { signal: "query", pattern: /\bquery\b/i, evidence: "query evidence was detected." },
    { signal: "state-reducer", pattern: /stateReducer/i, evidence: "stateReducer evidence was detected." },
    { signal: "source-id", pattern: /sourceId/i, evidence: "sourceId evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "filter", "signal");
}

function commandPaletteReadinessStateSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["stateSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "search", pattern: /\bsearch\b|setSearch/i, evidence: "search state evidence was detected." },
    { signal: "input-value", pattern: /inputValue|onInputValueChange/i, evidence: "input value evidence was detected." },
    { signal: "is-open", pattern: /isOpen|\bopen\b|setOpen/i, evidence: "open state evidence was detected." },
    { signal: "on-state-change", pattern: /onStateChange/i, evidence: "onStateChange evidence was detected." },
    { signal: "refresh-update", pattern: /refresh\s*\(|update\s*\(/i, evidence: "refresh/update evidence was detected." },
    { signal: "open-change", pattern: /onOpenChange/i, evidence: "open-change evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function commandPaletteReadinessPluginSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["pluginSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["pluginSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "recent-searches", pattern: /createLocalStorageRecentSearchesPlugin|recentSearchesPlugin|recent-searches/i, evidence: "recent searches plugin evidence was detected." },
    { signal: "query-suggestions", pattern: /createQuerySuggestionsPlugin|querySuggestionsPlugin|query[-_ ]?suggestions/i, evidence: "query suggestions plugin evidence was detected." },
    { signal: "plugins", pattern: /\bplugins\s*:/i, evidence: "plugins array evidence was detected." },
    { signal: "insights", pattern: /\binsights\b/i, evidence: "insights evidence was detected." },
    { signal: "templates", pattern: /\btemplates\s*:/i, evidence: "templates evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "plugin", "signal");
}

function commandPaletteReadinessAccessibilitySignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "combobox", pattern: /role\s*=\s*["']combobox|role:\s*["']combobox|role="combobox"|["']role["']\s*,\s*["']combobox/i, evidence: "combobox role evidence was detected." },
    { signal: "listbox", pattern: /role\s*=\s*["']listbox|role="listbox"|["']role["']\s*,\s*["']listbox/i, evidence: "listbox role evidence was detected." },
    { signal: "option", pattern: /role\s*=\s*["']option|role="option"|["']role["']\s*,\s*["']option/i, evidence: "option role evidence was detected." },
    { signal: "aria-activedescendant", pattern: /aria-activedescendant/i, evidence: "aria-activedescendant evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-autocomplete", pattern: /aria-autocomplete/i, evidence: "aria-autocomplete evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function commandPaletteReadinessKeyboardSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-down", pattern: /ArrowDown/i, evidence: "ArrowDown evidence was detected." },
    { signal: "arrow-up", pattern: /ArrowUp/i, evidence: "ArrowUp evidence was detected." },
    { signal: "enter", pattern: /Enter|InputKeyDownEnter/i, evidence: "Enter evidence was detected." },
    { signal: "escape", pattern: /Escape/i, evidence: "Escape evidence was detected." },
    { signal: "meta-k", pattern: /metaKey|Meta>\}k|Mod-k|Command\+K/i, evidence: "Meta-K evidence was detected." },
    { signal: "ime-guard", pattern: /keyCode\s*===\s*229|isComposing/i, evidence: "IME guard evidence was detected." },
    { signal: "keyboard-handler", pattern: /KeyboardEvent|keydown|userEvent\.keyboard|fireEvent\.keyDown/i, evidence: "keyboard handler evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function commandPaletteReadinessTestSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["testSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|getByRole|queryAllByRole/i, evidence: "Testing Library evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|fireEvent\.keyDown|ArrowDown|ArrowUp|Enter|Escape/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|queryAllByRole|role\s*=\s*["']combobox|role="combobox"/i, evidence: "role-based test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|command-palette-traces|palette-traces|screenshot|trace/i, evidence: "artifact upload evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function commandPaletteReadinessPackageSignals(sourceFiles: CommandPaletteReadinessSourceFile[]): CommandPaletteReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CommandPaletteReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cmdk", pattern: /["@']cmdk["@']|from ["']cmdk["']/i, evidence: "cmdk package evidence was detected." },
    { signal: "@algolia/autocomplete-js", pattern: /["@']@algolia\/autocomplete-js["@']|from ["']@algolia\/autocomplete-js["']/i, evidence: "@algolia/autocomplete-js evidence was detected." },
    { signal: "@algolia/autocomplete-core", pattern: /["@']@algolia\/autocomplete-core["@']|from ["']@algolia\/autocomplete-core["']/i, evidence: "@algolia/autocomplete-core evidence was detected." },
    { signal: "@algolia/autocomplete-plugin-recent-searches", pattern: /["@']@algolia\/autocomplete-plugin-recent-searches["@']|from ["']@algolia\/autocomplete-plugin-recent-searches["']/i, evidence: "Algolia recent searches plugin evidence was detected." },
    { signal: "@algolia/autocomplete-plugin-query-suggestions", pattern: /["@']@algolia\/autocomplete-plugin-query-suggestions["@']|from ["']@algolia\/autocomplete-plugin-query-suggestions["']/i, evidence: "Algolia query suggestions plugin evidence was detected." },
    { signal: "downshift", pattern: /["@']downshift["@']|from ["']downshift["']/i, evidence: "Downshift package evidence was detected." }
  ];
  return commandPaletteReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function commandPaletteReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CommandPaletteReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/command-palette-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildGuidedTourReadinessReport(walk: WalkResult): Promise<GuidedTourReadinessReport> {
  const sourceFiles = await guidedTourReadinessSourceFiles(walk);
  const guidedTourSetups = guidedTourReadinessSetups(sourceFiles);
  const frameworkSignals = guidedTourReadinessFrameworkSignals(sourceFiles);
  const stepSignals = guidedTourReadinessStepSignals(sourceFiles);
  const targetSignals = guidedTourReadinessTargetSignals(sourceFiles);
  const navigationSignals = guidedTourReadinessNavigationSignals(sourceFiles);
  const overlaySignals = guidedTourReadinessOverlaySignals(sourceFiles);
  const callbackSignals = guidedTourReadinessCallbackSignals(sourceFiles);
  const accessibilitySignals = guidedTourReadinessAccessibilitySignals(sourceFiles);
  const stateSignals = guidedTourReadinessStateSignals(sourceFiles);
  const machineSignals = guidedTourReadinessMachineSignals(sourceFiles);
  const targetResolutionSignals = guidedTourReadinessTargetResolutionSignals(sourceFiles);
  const positioningSignals = guidedTourReadinessPositioningSignals(sourceFiles);
  const spotlightSignals = guidedTourReadinessSpotlightSignals(sourceFiles);
  const effectSignals = guidedTourReadinessEffectSignals(sourceFiles);
  const actionSignals = guidedTourReadinessActionSignals(sourceFiles);
  const domSignals = guidedTourReadinessDomSignals(sourceFiles);
  const apiSignals = guidedTourReadinessApiSignals(sourceFiles);
  const testSignals = guidedTourReadinessTestSignals(sourceFiles);
  const packageSignals = guidedTourReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasSteps = stepSignals.some((item) => item.readiness === "ready") || guidedTourSetups.some((item) => item.stepCount > 0);
  const hasTargets = targetSignals.some((item) => item.readiness === "ready") || guidedTourSetups.some((item) => item.targetCount > 0);
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready") || guidedTourSetups.some((item) => item.navigationCount > 0);
  const hasOverlay = overlaySignals.some((item) => item.readiness === "ready") || guidedTourSetups.some((item) => item.overlayCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || guidedTourSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || guidedTourSetups.some((item) => item.testCount > 0);

  const riskQueue: GuidedTourReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasSteps) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a guided tour boundary such as React Joyride, Shepherd.js, driver.js, or a custom tour adapter.",
      why: "Guided tour readiness starts with explicit steps, targets, popovers, or a tour framework learners can inspect.",
      relatedHref: "html/guided-tour-readiness.html"
    });
  }
  if ((hasFramework || hasSteps) && !hasTargets) {
    riskQueue.push({
      priority: "high",
      action: "Pair tour steps with target, attachTo, element, selector, highlight, or spotlight evidence.",
      why: "A tour step without target semantics does not prove where the learner will be guided.",
      relatedHref: "html/guided-tour-readiness.html"
    });
  }
  if (hasTargets && !hasNavigation) {
    riskQueue.push({
      priority: "high",
      action: "Document start, next, back/previous, skip/cancel/close, complete, progress, and continuous flow behavior.",
      why: "Guided tours are stateful journeys, so learners need visible navigation and completion semantics.",
      relatedHref: "html/guided-tour-readiness.html"
    });
  }
  if (hasSteps && !hasOverlay) {
    riskQueue.push({
      priority: "medium",
      action: "Add overlay, spotlight, stage sizing, popover class/style, and scroll behavior evidence.",
      why: "Guided tour usability depends on overlay framing, target visibility, and scroll-to-target behavior.",
      relatedHref: "html/guided-tour-readiness.html"
    });
  }
  if (hasSteps && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add dialog role, labels, described-by/control wiring, focus trap, Escape, and tab-order evidence.",
      why: "Guided tours can block the page and must be inspectable for keyboard and assistive technology users.",
      relatedHref: "html/guided-tour-readiness.html"
    });
  }
  if (hasSteps && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic unit, browser, or Cypress tests that cover step navigation, overlays, Escape, and a11y contracts.",
      why: "Tour regressions usually appear in focus, overlay placement, target lookup, and next/back transitions.",
      relatedHref: "html/guided-tour-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live guided tour behavior in a trusted browser or the original project tests outside RepoTutor.",
    why: "RepoTutor records guided tour readiness only; it does not start tours, mutate overlays, focus elements, scroll pages, attach popovers, dispatch tour events, persist progress, or run analyzed project tests.",
    relatedHref: "html/guided-tour-readiness.html"
  });

  return {
    summary: `React Joyride/Shepherd.js/driver.js-style guided tour readiness report: setup ${guidedTourSetups.length}개, framework signal ${frameworkSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Guided tour readiness React Joyride Shepherd.js driver.js steps target attachTo popover overlay progress callbacks accessibility tests",
    guidedTourSetups,
    frameworkSignals,
    stepSignals,
    targetSignals,
    navigationSignals,
    overlaySignals,
    callbackSignals,
    accessibilitySignals,
    stateSignals,
    machineSignals,
    targetResolutionSignals,
    positioningSignals,
    spotlightSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"react-joyride|Joyride|steps|target|callback|showProgress|showSkipButton\" src app packages test", purpose: "Find React Joyride setup, step targets, callbacks, progress, skip, and controlled state." },
      { command: "rg \"Shepherd\\.Tour|new Shepherd|addStep|attachTo|useModalOverlay|beforeShowPromise|advanceOn\" src app packages test", purpose: "Find Shepherd.js tour construction, target attachment, modal overlay, hooks, and advance behavior." },
      { command: "rg \"driver\\(|driver\\.js|setSteps|drive\\(|highlight\\(|popover|stagePadding|stageRadius|onNextClick\" src app packages test", purpose: "Find driver.js setup, popover steps, stage sizing, and explicit navigation callbacks." },
      { command: "rg \"role=.*dialog|aria-label|aria-labelledby|aria-describedby|aria-controls|focus-trap|Escape|tab-order\" src app packages test", purpose: "Review guided tour dialog semantics, focus handling, Escape behavior, and tab order." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover guided tour navigation, overlay, target lookup, keyboard, and accessibility flows." }
    ],
    learnerNextSteps: [
      "먼저 React Joyride, Shepherd.js, driver.js, custom tour 중 어떤 guided tour boundary가 있는지 찾으세요.",
      "steps 배열, addStep, title/content/text/description, placement/popover 신호로 각 단계가 무엇을 설명하는지 확인하세요.",
      "target, attachTo, element, selector, highlight, spotlight 신호는 tour step이 실제 화면 어디에 붙는지 보여줍니다.",
      "start, next, back/previous, skip/cancel/close, complete, progress, continuous 신호로 사용자가 tour를 이동하고 끝내는 경로를 확인하세요.",
      "useModalOverlay, spotlight, stagePadding, stageRadius, popoverClass, styles, scroll 신호로 overlay와 target visibility를 점검하세요.",
      "dialog role, aria-label/labelledby/describedby/controls, focus trap, Escape, tab order 테스트를 같이 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 tour start, DOM mutation, focus movement, scroll, overlay placement, progress persistence는 안전한 브라우저 테스트에서 별도로 검증하세요."
    ]
  };
}

type GuidedTourReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function guidedTourReadinessSourceFiles(walk: WalkResult): Promise<GuidedTourReadinessSourceFile[]> {
  const files: GuidedTourReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !guidedTourReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!guidedTourReadinessPathSignal(file.relPath) && !guidedTourReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function guidedTourReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return guidedTourReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function guidedTourReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(tour|guided|onboarding|walkthrough|joyride|shepherd|driver|coachmark|hotspot|tooltip|popover|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function guidedTourReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/tour|tour\.machine|tour\.connect|react-joyride|Joyride|Shepherd\.Tour|new Shepherd|shepherd\.js|driver\.js|driver\s*\(|addStep|setSteps|steps\s*:|steps\s*=|attachTo|target\s*:|popover|useModalOverlay|showProgress|showSkipButton|spotlight|stagePadding|aria-labelledby|aria-describedby|data-shepherd-step-id|tourInactive|STEP\.ROUTE|TARGET\.RESOLVED|getBackdropProps|getSpotlightProps|getActionTriggerProps)/i.test(text);
}

function guidedTourReadinessSetups(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["guidedTourSetups"] {
  const rows: GuidedTourReadinessReport["guidedTourSetups"] = [];
  for (const source of sourceFiles) {
    const stepCount = countMatches(source.text, /(steps\s*=|steps\s*:|Step\[\]|addStep|addSteps|step\s*:|title\s*:|content\s*:|text\s*:|description\s*:|popover\s*:)/gi);
    const targetCount = countMatches(source.text, /(target\s*:|attachTo|element\s*:|selector\s*:|highlight|highlightClass|spotlight|data-shepherd-step-id)/gi);
    const navigationCount = countMatches(source.text, /(start\s*\(|\.start|next\s*\(|\.next|back\s*\(|\.back|prev|previous|skip|cancel|close|complete|drive\s*\(|showProgress|continuous)/gi);
    const overlayCount = countMatches(source.text, /(useModalOverlay|modalOverlay|spotlight|stagePadding|stageRadius|popoverClass|styles\s*=|styles\s*:|classes\s*:|scrollTo|smoothScroll|disableOverlayClose|overlayClickBehavior)/gi);
    const callbackCount = countMatches(source.text, /(callback\s*=|callback\s*:|tour\.on|\.on\s*\(|EVENTS|event\s*:|onNextClick|onPrevClick|onCloseClick|onDeselected|onPopoverRender|beforeShowPromise|STEP_AFTER|onHighlighted|onHighlightStarted|dispatchEvent|CustomEvent|onStatusChange|onStepChange|onStepsChange|onInteractOutside|onPointerDownOutside|onFocusOutside)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']dialog|role:\s*["']dialog|aria-label|aria-labelledby|aria-describedby|aria-controls|focusTrap|focus-trap|data-focus-trap|Escape|tab-order|tabIndex|tabindex|showSkipButton|disableOverlayClose|locale\s*=|locale\s*:|cancelIcon|disableActiveInteraction)/gi);
    const stateCount = countMatches(source.text, /(run\s*=|run\s*:|setRun|stepIndex|initialStepIndex|STATUS|status|LIFECYCLE|lifecycle|STEP_AFTER|controlled|setSteps|setConfig|localStorage|tour-progress|getActiveElement|activeStep)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|describe\s*\(|it\s*\(|expect\s*\(|testing-library|getByRole|fireEvent\.keyDown|userEvent\.keyboard|a11y|axe|upload-artifact|guided-tour-traces)/gi);
    const hasSetupSignal = stepCount + targetCount + navigationCount + overlayCount + callbackCount + accessibilityCount + stateCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: guidedTourReadinessPlatform(source),
      stepCount,
      targetCount,
      navigationCount,
      overlayCount,
      callbackCount,
      accessibilityCount,
      stateCount,
      testCount,
      readiness: stepCount > 0 && targetCount > 0 && navigationCount > 0 && overlayCount > 0 && callbackCount > 0 && (accessibilityCount + stateCount + testCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains steps ${stepCount}, targets ${targetCount}, navigation ${navigationCount}, overlays ${overlayCount}, callbacks ${callbackCount}, accessibility ${accessibilityCount}, state ${stateCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function guidedTourReadinessPlatform(source: GuidedTourReadinessSourceFile): GuidedTourReadinessReport["guidedTourSetups"][number]["platform"] {
  if (/@zag-js\/tour|tour\.machine|tour\.connect|tourInactive|STEP\.ROUTE|TARGET\.RESOLVED|getBackdropProps|getActionTriggerProps/i.test(source.text)) return "zag-tour";
  if (/react-joyride|Joyride|ACTIONS|EVENTS|STATUS/i.test(source.text)) return "react-joyride";
  if (/shepherd\.js|Shepherd\.Tour|new Shepherd|addStep|attachTo/i.test(source.text)) return "shepherd";
  if (/driver\.js|driver\s*\(|setSteps|drive\s*\(|stagePadding|popoverClass/i.test(source.text)) return "driver-js";
  if (/tour|guided|onboarding|walkthrough|coachmark|popover/i.test(source.text) || guidedTourReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function guidedTourReadinessFrameworkSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-joyride", pattern: /react-joyride|Joyride|ACTIONS|EVENTS|STATUS/i, evidence: "React Joyride evidence was detected." },
    { signal: "shepherd", pattern: /shepherd\.js|Shepherd\.Tour|new Shepherd|addStep/i, evidence: "Shepherd.js evidence was detected." },
    { signal: "driver-js", pattern: /driver\.js|driver\s*\(|setSteps|drive\s*\(/i, evidence: "driver.js evidence was detected." },
    { signal: "zag-tour", pattern: /@zag-js\/tour|tour\.machine|tour\.connect|tourInactive|STEP\.ROUTE|TARGET\.RESOLVED|getBackdropProps|getActionTriggerProps/i, evidence: "Zag tour evidence was detected." },
    { signal: "custom", pattern: /guided[-_ ]?tour|onboarding|walkthrough|coachmark|hotspot/i, evidence: "custom guided tour evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function guidedTourReadinessStepSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["stepSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["stepSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "steps-array", pattern: /steps\s*=|steps\s*:|const\s+steps|Step\[\]|setSteps/i, evidence: "steps array evidence was detected." },
    { signal: "step-object", pattern: /addStep|addSteps|step\s*:|\{\s*(target|element|attachTo|popover)\b/i, evidence: "step object evidence was detected." },
    { signal: "title", pattern: /\btitle\s*:/i, evidence: "step title evidence was detected." },
    { signal: "content-text", pattern: /\bcontent\s*:|\btext\s*:|\bdescription\s*:/i, evidence: "step content/text evidence was detected." },
    { signal: "placement", pattern: /\bplacement\s*:|\bon\s*:|\bside\s*:|\balign\s*:/i, evidence: "placement evidence was detected." },
    { signal: "popover", pattern: /\bpopover\s*:|popoverClass|onPopoverRender|getContentProps|getPositionerProps/i, evidence: "popover evidence was detected." },
    { signal: "step-type-tooltip", pattern: /type\s*:\s*["']tooltip["']|isTooltipStep|StepType.*tooltip/i, evidence: "tooltip step type evidence was detected." },
    { signal: "step-type-dialog", pattern: /type\s*:\s*["']dialog["']|isDialogStep|StepType.*dialog/i, evidence: "dialog step type evidence was detected." },
    { signal: "step-type-wait", pattern: /type\s*:\s*["']wait["']|isWaitStep|StepType.*wait/i, evidence: "wait step type evidence was detected." },
    { signal: "step-type-floating", pattern: /type\s*:\s*["']floating["']|StepType.*floating/i, evidence: "floating step type evidence was detected." },
    { signal: "step-effect", pattern: /\beffect\s*\(|StepEffectArgs|executeStepEffect|createEffectUtilities/i, evidence: "step effect evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "step", "signal");
}

function guidedTourReadinessTargetSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["targetSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["targetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "target", pattern: /\btarget\s*:/i, evidence: "target evidence was detected." },
    { signal: "attach-to", pattern: /attachTo/i, evidence: "attachTo evidence was detected." },
    { signal: "element", pattern: /\belement\s*:/i, evidence: "element evidence was detected." },
    { signal: "selector", pattern: /\bselector\s*:/i, evidence: "selector evidence was detected." },
    { signal: "highlight", pattern: /highlight|highlightClass/i, evidence: "highlight evidence was detected." },
    { signal: "spotlight", pattern: /spotlight|spotlightClicks|getSpotlightProps/i, evidence: "spotlight evidence was detected." },
    { signal: "resolved-target", pattern: /resolvedTarget|TARGET\.RESOLVED|get\("resolvedTarget"\)/i, evidence: "resolved target evidence was detected." },
    { signal: "target-rect", pattern: /targetRect|get\("targetRect"\)/i, evidence: "target rect evidence was detected." },
    { signal: "boundary-size", pattern: /boundarySize|trackBoundarySize/i, evidence: "boundary size evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "target", "signal");
}

function guidedTourReadinessNavigationSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "start", pattern: /start\s*\(|\.start|drive\s*\(/i, evidence: "start/drive evidence was detected." },
    { signal: "next", pattern: /\bnext\b|onNextClick|ACTIONS\.NEXT/i, evidence: "next evidence was detected." },
    { signal: "back-prev", pattern: /\bback\b|\bprev\b|previous|onPrevClick/i, evidence: "back/previous evidence was detected." },
    { signal: "skip-cancel-close", pattern: /skip|cancel|close|allowClose|onCloseClick|showSkipButton/i, evidence: "skip/cancel/close evidence was detected." },
    { signal: "complete", pattern: /complete|FINISHED|STATUS\.FINISHED/i, evidence: "complete evidence was detected." },
    { signal: "progress", pattern: /showProgress|progress|tour-progress/i, evidence: "progress evidence was detected." },
    { signal: "continuous", pattern: /continuous/i, evidence: "continuous flow evidence was detected." },
    { signal: "goto", pattern: /\bgoto\s*\(|actionMap\.goto|STEP\.SET/i, evidence: "goto evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function guidedTourReadinessOverlaySignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["overlaySignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["overlaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "modal-overlay", pattern: /useModalOverlay|modalOverlay|disableOverlayClose|overlayClickBehavior/i, evidence: "modal overlay evidence was detected." },
    { signal: "spotlight", pattern: /spotlight|spotlightClicks/i, evidence: "spotlight overlay evidence was detected." },
    { signal: "stage-padding", pattern: /stagePadding|modalOverlayOpeningPadding/i, evidence: "stage padding evidence was detected." },
    { signal: "stage-radius", pattern: /stageRadius|spotlightRadius/i, evidence: "stage radius evidence was detected." },
    { signal: "popover-class", pattern: /popoverClass|classes\s*:|classPrefix/i, evidence: "popover/class evidence was detected." },
    { signal: "styles", pattern: /\bstyles\s*=|\bstyles\s*:|theme/i, evidence: "styles evidence was detected." },
    { signal: "scroll", pattern: /scrollTo|scrollToFirstStep|smoothScroll|scrollIntoView|waitForScrollEnd/i, evidence: "scroll evidence was detected." },
    { signal: "backdrop", pattern: /\bbackdrop\b|getBackdropProps/i, evidence: "backdrop evidence was detected." },
    { signal: "clip-path", pattern: /clipPath|getClipPath|clip-path/i, evidence: "clip path evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "overlay", "signal");
}

function guidedTourReadinessCallbackSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["callbackSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["callbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "callback", pattern: /\bcallback\s*=|\bcallback\s*:|handleCallback/i, evidence: "callback evidence was detected." },
    { signal: "on-event", pattern: /tour\.on|\.on\s*\(|EVENTS|event\s*:/i, evidence: "event callback evidence was detected." },
    { signal: "on-next-click", pattern: /onNextClick/i, evidence: "onNextClick evidence was detected." },
    { signal: "on-prev-click", pattern: /onPrevClick/i, evidence: "onPrevClick evidence was detected." },
    { signal: "on-close-click", pattern: /onCloseClick/i, evidence: "onCloseClick evidence was detected." },
    { signal: "before-show", pattern: /beforeShowPromise|onHighlightStarted/i, evidence: "before-show evidence was detected." },
    { signal: "after-hook", pattern: /STEP_AFTER|onHighlighted|after/i, evidence: "after hook evidence was detected." },
    { signal: "analytics-event", pattern: /dispatchEvent|CustomEvent|analytics|track|telemetry|console\.(log|warn)/i, evidence: "analytics/event evidence was detected." },
    { signal: "status-change", pattern: /onStatusChange|StatusChangeDetails|invokeOn(Start|Dismiss|Complete|Skip|NotFound)/i, evidence: "status change evidence was detected." },
    { signal: "step-change", pattern: /onStepChange|StepChangeDetails/i, evidence: "step change evidence was detected." },
    { signal: "steps-change", pattern: /onStepsChange|StepsChangeDetails/i, evidence: "steps change evidence was detected." },
    { signal: "interact-outside", pattern: /onInteractOutside|onPointerDownOutside|onFocusOutside|trackInteractOutside/i, evidence: "interact outside evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "callback", "signal");
}

function guidedTourReadinessAccessibilitySignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dialog-role", pattern: /role\s*=\s*["'](?:alert)?dialog|role:\s*["'](?:alert)?dialog|role="(?:alert)?dialog"/i, evidence: "dialog role evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "focus-trap", pattern: /focusTrap|focus-trap|data-focus-trap/i, evidence: "focus trap evidence was detected." },
    { signal: "keyboard-escape", pattern: /Escape|key\s*:\s*["']Escape/i, evidence: "Escape-key evidence was detected." },
    { signal: "tab-order", pattern: /tab-order|tabIndex|tabindex/i, evidence: "tab order evidence was detected." },
    { signal: "aria-modal", pattern: /aria-modal/i, evidence: "aria-modal evidence was detected." },
    { signal: "aria-live", pattern: /aria-live/i, evidence: "aria-live evidence was detected." },
    { signal: "tabindex", pattern: /tabIndex|tabindex/i, evidence: "tabindex evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function guidedTourReadinessStateSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["stateSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "run", pattern: /\brun\s*=|\brun\s*:|setRun/i, evidence: "run state evidence was detected." },
    { signal: "step-index", pattern: /stepIndex|initialStepIndex|data\.index/i, evidence: "step index evidence was detected." },
    { signal: "status", pattern: /STATUS|status/i, evidence: "status evidence was detected." },
    { signal: "lifecycle", pattern: /LIFECYCLE|lifecycle|STEP_AFTER/i, evidence: "lifecycle evidence was detected." },
    { signal: "controlled-mode", pattern: /controlled|stepIndex|run\s*=/i, evidence: "controlled-mode evidence was detected." },
    { signal: "set-steps", pattern: /setSteps|steps\s*=/i, evidence: "set steps evidence was detected." },
    { signal: "local-storage-progress", pattern: /localStorage|tour-progress/i, evidence: "local progress persistence evidence was detected." },
    { signal: "open-tag", pattern: /tags:\s*\[\s*["']open["']|state\.hasTag\(["']open["']\)|api\.open|data-state.*open/i, evidence: "open tag evidence was detected." },
    { signal: "closed-tag", pattern: /tags:\s*\[\s*["']closed["']|data-state.*closed|tourInactive/i, evidence: "closed tag evidence was detected." },
    { signal: "internal-change", pattern: /_internalChange/i, evidence: "internal change evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function guidedTourReadinessMachineSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["machineSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tour-inactive", pattern: /tourInactive/i, evidence: "tourInactive state evidence was detected." },
    { signal: "running", pattern: /\brunning\b/i, evidence: "running compound state evidence was detected." },
    { signal: "resolving", pattern: /\bresolving\b/i, evidence: "target resolving state evidence was detected." },
    { signal: "scrolling", pattern: /\bscrolling\b/i, evidence: "scrolling state evidence was detected." },
    { signal: "waiting", pattern: /\bwaiting\b/i, evidence: "waiting state evidence was detected." },
    { signal: "active", pattern: /\bactive\b/i, evidence: "active state evidence was detected." },
    { signal: "step-route", pattern: /STEP\.ROUTE/i, evidence: "STEP.ROUTE transition evidence was detected." },
    { signal: "step-changed", pattern: /STEP\.CHANGED/i, evidence: "STEP.CHANGED transition evidence was detected." },
    { signal: "target-resolved", pattern: /TARGET\.RESOLVED/i, evidence: "TARGET.RESOLVED event evidence was detected." },
    { signal: "target-not-found", pattern: /TARGET\.NOT_FOUND/i, evidence: "TARGET.NOT_FOUND event evidence was detected." },
    { signal: "scroll-end", pattern: /SCROLL\.END/i, evidence: "SCROLL.END event evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function guidedTourReadinessTargetResolutionSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["targetResolutionSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["targetResolutionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "target-function", pattern: /target\s*:\s*\(\)\s*=>|target\?\.\(\)|targetEl/i, evidence: "target function evidence was detected." },
    { signal: "resolved-target", pattern: /resolvedTarget|TARGET\.RESOLVED/i, evidence: "resolved target evidence was detected." },
    { signal: "mutation-observer", pattern: /MutationObserver/i, evidence: "MutationObserver target wait evidence was detected." },
    { signal: "wait-for-target", pattern: /waitForTarget\b/i, evidence: "waitForTarget effect evidence was detected." },
    { signal: "wait-for-target-timeout", pattern: /waitForTargetTimeout|TARGET\.NOT_FOUND|3000/i, evidence: "target timeout evidence was detected." },
    { signal: "target-cleanup", pattern: /_targetCleanup|cleanup.*target/i, evidence: "target cleanup evidence was detected." },
    { signal: "data-tour-highlighted", pattern: /data-tour-highlighted/i, evidence: "target highlighted attribute evidence was detected." },
    { signal: "prevent-interaction-inert", pattern: /preventInteraction|\.inert\s*=/i, evidence: "prevent interaction inert evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "target resolution", "signal");
}

function guidedTourReadinessPositioningSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get-placement", pattern: /getPlacement\(|@zag-js\/popper/i, evidence: "getPlacement evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement/i, evidence: "current placement context evidence was detected." },
    { signal: "placement-side", pattern: /getPlacementSide|data-side|placementSide/i, evidence: "placement side evidence was detected." },
    { signal: "popper-styles", pattern: /getPlacementStyles|popperStyles/i, evidence: "popper styles evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|getPositionerId|positioner/i, evidence: "positioner evidence was detected." },
    { signal: "arrow", pattern: /getArrowProps|getArrowId|arrow/i, evidence: "arrow evidence was detected." },
    { signal: "arrow-tip", pattern: /getArrowTipProps|arrowTip/i, evidence: "arrow tip evidence was detected." },
    { signal: "anchor-rect", pattern: /getAnchorRect|rects\.reference|targetRect|getBoundingClientRect/i, evidence: "anchor rect evidence was detected." },
    { signal: "spotlight-offset", pattern: /spotlightOffset|offset\(rect/i, evidence: "spotlight offset evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function guidedTourReadinessSpotlightSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["spotlightSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["spotlightSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "backdrop", pattern: /\bbackdrop\b|getBackdropProps|getBackdropId/i, evidence: "backdrop evidence was detected." },
    { signal: "spotlight", pattern: /\bspotlight\b|getSpotlightProps/i, evidence: "spotlight evidence was detected." },
    { signal: "clip-path", pattern: /clipPath|getClipPath|clip-path/i, evidence: "clip path evidence was detected." },
    { signal: "target-rect", pattern: /targetRect/i, evidence: "target rect evidence was detected." },
    { signal: "boundary-size", pattern: /boundarySize|trackBoundarySize/i, evidence: "boundary size evidence was detected." },
    { signal: "spotlight-radius", pattern: /spotlightRadius|borderRadius/i, evidence: "spotlight radius evidence was detected." },
    { signal: "visual-viewport", pattern: /visualViewport|innerWidth|scrollHeight/i, evidence: "visual viewport evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "spotlight", "signal");
}

function guidedTourReadinessEffectSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["effectSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-boundary-size", pattern: /trackBoundarySize/i, evidence: "trackBoundarySize evidence was detected." },
    { signal: "track-placement", pattern: /trackPlacement/i, evidence: "trackPlacement evidence was detected." },
    { signal: "track-dismissable-branch", pattern: /trackDismissableBranch/i, evidence: "trackDismissableBranch evidence was detected." },
    { signal: "track-interact-outside", pattern: /trackInteractOutside/i, evidence: "trackInteractOutside evidence was detected." },
    { signal: "track-escape-keydown", pattern: /trackEscapeKeydown/i, evidence: "trackEscapeKeydown evidence was detected." },
    { signal: "trap-focus", pattern: /trapFocus|@zag-js\/focus-trap/i, evidence: "trap focus evidence was detected." },
    { signal: "wait-for-scroll-end", pattern: /waitForScrollEnd|SCROLL\.END|100\)/i, evidence: "wait for scroll end evidence was detected." },
    { signal: "cleanup-all", pattern: /cleanupAll/i, evidence: "cleanupAll evidence was detected." },
    { signal: "cleanup-step-effect", pattern: /cleanupStepEffect/i, evidence: "cleanupStepEffect evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function guidedTourReadinessActionSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["actionSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "add-step", pattern: /addStep\(/i, evidence: "add step API evidence was detected." },
    { signal: "remove-step", pattern: /removeStep\(/i, evidence: "remove step API evidence was detected." },
    { signal: "update-step", pattern: /updateStep\(/i, evidence: "update step API evidence was detected." },
    { signal: "set-step", pattern: /setStep\(|STEP\.SET/i, evidence: "set step API evidence was detected." },
    { signal: "start", pattern: /\bstart\(|START/i, evidence: "start API evidence was detected." },
    { signal: "next", pattern: /\bnext\(|STEP\.NEXT/i, evidence: "next action evidence was detected." },
    { signal: "prev", pattern: /\bprev\(|STEP\.PREV/i, evidence: "prev action evidence was detected." },
    { signal: "dismiss", pattern: /\bdismiss\(|DISMISS/i, evidence: "dismiss action evidence was detected." },
    { signal: "skip", pattern: /\bskip\(|SKIP/i, evidence: "skip action evidence was detected." },
    { signal: "goto", pattern: /\bgoto\(/i, evidence: "goto action evidence was detected." },
    { signal: "progress-percent", pattern: /getProgressPercent|progress\s*:/i, evidence: "progress percent evidence was detected." },
    { signal: "progress-text", pattern: /getProgressText|progressText/i, evidence: "progress text evidence was detected." },
    { signal: "action-trigger", pattern: /getActionTriggerProps|actionTrigger|StepActionMap/i, evidence: "action trigger evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function guidedTourReadinessDomSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["domSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "positioner-id", pattern: /getPositionerId/i, evidence: "positioner id helper evidence was detected." },
    { signal: "content-id", pattern: /getContentId/i, evidence: "content id helper evidence was detected." },
    { signal: "title-id", pattern: /getTitleId/i, evidence: "title id helper evidence was detected." },
    { signal: "description-id", pattern: /getDescriptionId/i, evidence: "description id helper evidence was detected." },
    { signal: "arrow-id", pattern: /getArrowId/i, evidence: "arrow id helper evidence was detected." },
    { signal: "backdrop-id", pattern: /getBackdropId/i, evidence: "backdrop id helper evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element helper evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl/i, evidence: "positioner element helper evidence was detected." },
    { signal: "backdrop-el", pattern: /getBackdropEl/i, evidence: "backdrop element helper evidence was detected." },
    { signal: "sync-z-index", pattern: /syncZIndex|--z-index|zIndex/i, evidence: "z-index sync evidence was detected." },
    { signal: "raf", pattern: /\braf\(/i, evidence: "request animation frame helper evidence was detected." },
    { signal: "computed-style", pattern: /getComputedStyle/i, evidence: "computed style evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "DOM", "signal");
}

function guidedTourReadinessApiSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["apiSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /\bopen:\s*open\b|\bopen\b/i, evidence: "open API state evidence was detected." },
    { signal: "total-steps", pattern: /totalSteps/i, evidence: "total steps API evidence was detected." },
    { signal: "step-index", pattern: /stepIndex/i, evidence: "step index API evidence was detected." },
    { signal: "step-api", pattern: /\bstep\s*,|\bstep:/i, evidence: "step API evidence was detected." },
    { signal: "next-step-state", pattern: /hasNextStep/i, evidence: "next-step state API evidence was detected." },
    { signal: "prev-step-state", pattern: /hasPrevStep/i, evidence: "previous-step state API evidence was detected." },
    { signal: "first-step-state", pattern: /firstStep|isFirstStep/i, evidence: "first-step state API evidence was detected." },
    { signal: "last-step-state", pattern: /lastStep|isLastStep/i, evidence: "last-step state API evidence was detected." },
    { signal: "add-step-api", pattern: /addStep\(/i, evidence: "addStep API evidence was detected." },
    { signal: "remove-step-api", pattern: /removeStep\(/i, evidence: "removeStep API evidence was detected." },
    { signal: "update-step-api", pattern: /updateStep\(/i, evidence: "updateStep API evidence was detected." },
    { signal: "set-steps-api", pattern: /setSteps\(/i, evidence: "setSteps API evidence was detected." },
    { signal: "set-step-api", pattern: /setStep\(/i, evidence: "setStep API evidence was detected." },
    { signal: "start-api", pattern: /start\(/i, evidence: "start API evidence was detected." },
    { signal: "valid-step-api", pattern: /isValidStep/i, evidence: "isValidStep API evidence was detected." },
    { signal: "current-step-api", pattern: /isCurrentStep/i, evidence: "isCurrentStep API evidence was detected." },
    { signal: "next-api", pattern: /\bnext\(\)|STEP\.NEXT/i, evidence: "next API evidence was detected." },
    { signal: "prev-api", pattern: /\bprev\(\)|STEP\.PREV/i, evidence: "prev API evidence was detected." },
    { signal: "progress-percent-api", pattern: /getProgressPercent/i, evidence: "progress percent API evidence was detected." },
    { signal: "progress-text-api", pattern: /getProgressText/i, evidence: "progress text API evidence was detected." },
    { signal: "backdrop-props", pattern: /getBackdropProps/i, evidence: "backdrop prop getter evidence was detected." },
    { signal: "spotlight-props", pattern: /getSpotlightProps/i, evidence: "spotlight prop getter evidence was detected." },
    { signal: "progress-text-props", pattern: /getProgressTextProps/i, evidence: "progress text prop getter evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps/i, evidence: "positioner prop getter evidence was detected." },
    { signal: "arrow-props", pattern: /getArrowProps/i, evidence: "arrow prop getter evidence was detected." },
    { signal: "arrow-tip-props", pattern: /getArrowTipProps/i, evidence: "arrow tip prop getter evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content prop getter evidence was detected." },
    { signal: "title-props", pattern: /getTitleProps/i, evidence: "title prop getter evidence was detected." },
    { signal: "description-props", pattern: /getDescriptionProps/i, evidence: "description prop getter evidence was detected." },
    { signal: "close-trigger-props", pattern: /getCloseTriggerProps/i, evidence: "close trigger prop getter evidence was detected." },
    { signal: "action-trigger-props", pattern: /getActionTriggerProps/i, evidence: "action trigger prop getter evidence was detected." },
    { signal: "keyboard-navigation", pattern: /keyboardNavigation|ArrowRight|ArrowLeft/i, evidence: "keyboard navigation evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state attribute evidence was detected." },
    { signal: "data-type", pattern: /data-type/i, evidence: "data-type attribute evidence was detected." },
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement attribute evidence was detected." },
    { signal: "data-side", pattern: /data-side/i, evidence: "data-side attribute evidence was detected." },
    { signal: "aria-modal", pattern: /aria-modal/i, evidence: "aria-modal evidence was detected." },
    { signal: "aria-live", pattern: /aria-live/i, evidence: "aria-live evidence was detected." },
    { signal: "aria-atomic", pattern: /aria-atomic/i, evidence: "aria-atomic evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "data-step", pattern: /data-step/i, evidence: "data-step attribute evidence was detected." },
    { signal: "action-map", pattern: /StepActionMap|actionMap/i, evidence: "action map evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "API", "signal");
}

function guidedTourReadinessTestSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["testSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|getByRole|queryAllByRole/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /user-event|userEvent/i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /fireEvent\.keyDown|userEvent\.keyboard|Escape|ArrowDown|ArrowUp|Enter/i, evidence: "keyboard test evidence was detected." },
    { signal: "a11y-test", pattern: /a11y|axe|aria-label|aria-labelledby|aria-describedby|accessibility/i, evidence: "a11y test evidence was detected." },
    { signal: "fake-timers", pattern: /useFakeTimers|advanceTimersByTime|vi\./i, evidence: "fake timer evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|guided-tour-traces|tour-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function guidedTourReadinessPackageSignals(sourceFiles: GuidedTourReadinessSourceFile[]): GuidedTourReadinessReport["packageSignals"] {
  const specs: Array<{ signal: GuidedTourReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-joyride", pattern: /["@']react-joyride["@']|from ["']react-joyride["']/i, evidence: "react-joyride package evidence was detected." },
    { signal: "shepherd.js", pattern: /["@']shepherd\.js["@']|from ["']shepherd\.js["']/i, evidence: "Shepherd.js package evidence was detected." },
    { signal: "react-shepherd", pattern: /["@']react-shepherd["@']|from ["']react-shepherd["']/i, evidence: "react-shepherd package evidence was detected." },
    { signal: "driver.js", pattern: /["@']driver\.js["@']|from ["']driver\.js["']/i, evidence: "driver.js package evidence was detected." },
    { signal: "@zag-js/tour", pattern: /["@']@zag-js\/tour["@']|from ["']@zag-js\/tour["']/i, evidence: "@zag-js/tour package evidence was detected." },
    { signal: "@zag-js/focus-trap", pattern: /["@']@zag-js\/focus-trap["@']|from ["']@zag-js\/focus-trap["']/i, evidence: "@zag-js/focus-trap package evidence was detected." },
    { signal: "@zag-js/popper", pattern: /["@']@zag-js\/popper["@']|from ["']@zag-js\/popper["']/i, evidence: "@zag-js/popper package evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /["@']@zag-js\/dismissable["@']|from ["']@zag-js\/dismissable["']/i, evidence: "@zag-js/dismissable package evidence was detected." },
    { signal: "@zag-js/interact-outside", pattern: /["@']@zag-js\/interact-outside["@']|from ["']@zag-js\/interact-outside["']/i, evidence: "@zag-js/interact-outside package evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /["@']@zag-js\/dom-query["@']|from ["']@zag-js\/dom-query["']/i, evidence: "@zag-js/dom-query package evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /["@']@zag-js\/anatomy["@']|from ["']@zag-js\/anatomy["']/i, evidence: "@zag-js/anatomy package evidence was detected." },
    { signal: "@zag-js/core", pattern: /["@']@zag-js\/core["@']|from ["']@zag-js\/core["']/i, evidence: "@zag-js/core package evidence was detected." },
    { signal: "@zag-js/utils", pattern: /["@']@zag-js\/utils["@']|from ["']@zag-js\/utils["']/i, evidence: "@zag-js/utils package evidence was detected." },
    { signal: "react", pattern: /["@']react["@']|from ["']react["']/i, evidence: "react package evidence was detected." }
  ];
  return guidedTourReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function guidedTourReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: GuidedTourReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/guided-tour-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
