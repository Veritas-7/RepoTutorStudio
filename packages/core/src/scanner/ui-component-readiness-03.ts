import path from "node:path";
import type { CheckboxRadioSwitchReadinessReport, SliderProgressReadinessReport, TabsAccordionReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildTabsAccordionReadinessReport(walk: WalkResult): Promise<TabsAccordionReadinessReport> {
  const sourceFiles = await tabsAccordionReadinessSourceFiles(walk);
  const tabsAccordionSetups = tabsAccordionReadinessSetups(sourceFiles);
  const frameworkSignals = tabsAccordionReadinessFrameworkSignals(sourceFiles);
  const structureSignals = tabsAccordionReadinessStructureSignals(sourceFiles);
  const stateSignals = tabsAccordionReadinessStateSignals(sourceFiles);
  const interactionSignals = tabsAccordionReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = tabsAccordionReadinessAccessibilitySignals(sourceFiles);
  const orientationSignals = tabsAccordionReadinessOrientationSignals(sourceFiles);
  const machineSignals = tabsAccordionReadinessMachineSignals(sourceFiles);
  const domSignals = tabsAccordionReadinessDomSignals(sourceFiles);
  const apiSignals = tabsAccordionReadinessApiSignals(sourceFiles);
  const implementationSignals = tabsAccordionReadinessImplementationSignals(sourceFiles);
  const testSignals = tabsAccordionReadinessTestSignals(sourceFiles);
  const packageSignals = tabsAccordionReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || tabsAccordionSetups.some((item) => item.rootCount + item.triggerCount + item.contentCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || tabsAccordionSetups.some((item) => item.stateCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || tabsAccordionSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || tabsAccordionSetups.some((item) => item.testCount > 0);

  const riskQueue: TabsAccordionReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a tabs, accordion, collapsible, or disclosure component boundary before claiming disclosure UI readiness.",
      why: "Tabs/accordion readiness starts with concrete root, trigger, content, list, or panel evidence.",
      relatedHref: "html/tabs-accordion-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Trace controlled/default value, selected index/id, open/defaultOpen, onChange, data-state, forceMount, and unmount-on-hide behavior.",
      why: "Tabs, accordions, and disclosures fail through state ownership and mount/unmount lifecycle mismatches.",
      relatedHref: "html/tabs-accordion-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Verify roles and ARIA wiring for tablist/tab/tabpanel, aria-selected, aria-controls, aria-expanded, orientation, labels, and focus management.",
      why: "These widgets are keyboard-first disclosure controls; visual toggles alone are not accessible readiness.",
      relatedHref: "html/tabs-accordion-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add role, keyboard, click, and attribute tests for tab switching, accordion expansion, disabled items, manual activation, and panel visibility.",
      why: "Static component evidence does not prove keyboard behavior, focus movement, controlled state, or mounted panel contracts.",
      relatedHref: "html/tabs-accordion-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify widget behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records tabs/accordion/disclosure readiness only; it does not switch selected tabs, expand panels, move focus, dispatch keyboard/click events, measure animation height, mutate stores, or run analyzed project tests.",
    relatedHref: "html/tabs-accordion-readiness.html"
  });

  return {
    summary: `Tabs/accordion/disclosure readiness report: setup ${tabsAccordionSetups.length}개, framework signal ${frameworkSignals.length}개, state signal ${stateSignals.length}개, machine signal ${machineSignals.length}개, api signal ${apiSignals.length}개, implementation signal ${implementationSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Tabs/accordion readiness Radix Tabs Accordion Collapsible Headless UI Tab Disclosure internals Ariakit Tab Disclosure Zag Accordion machine DOM API keyboard orientation controlled state accessibility tests",
    tabsAccordionSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    interactionSignals,
    accessibilitySignals,
    orientationSignals,
    machineSignals,
    domSignals,
    apiSignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-tabs|@radix-ui/react-accordion|@radix-ui/react-collapsible|Tabs\\.Root|Accordion\\.Root|Collapsible\\.Root\" package.json src app packages", purpose: "Find Radix tabs, accordion, and collapsible boundaries." },
      { command: "rg \"@zag-js/accordion|accordion\\.machine|accordion\\.connect|getItemTriggerProps|getItemContentProps\" package.json src app packages", purpose: "Find Zag accordion machine, connector, and API prop boundaries." },
      { command: "rg \"@headlessui/react|Tab\\.Group|TabGroup|DisclosureButton|DisclosurePanel|Disclosure\\.Button|Disclosure\\.Panel|TabsDataContext|DisclosureContext|FocusSentinel|useStableCollectionIndex\" package.json src app packages", purpose: "Find Headless UI tabs/disclosure usage and implementation internals." },
      { command: "rg \"@ariakit/react|TabProvider|TabList|TabPanel|DisclosureProvider|DisclosureContent\" package.json src app packages", purpose: "Find Ariakit tab and disclosure store boundaries." },
      { command: "rg \"selectedIndex|selectedId|value=|defaultValue|defaultIndex|defaultOpen|onValueChange|onChange|onOpenChange|setSelectedId|setOpen\" src app packages", purpose: "Review controlled/default state ownership." },
      { command: "rg \"role=|getByRole|aria-selected|aria-controls|aria-expanded|aria-orientation|aria-label|userEvent\\.keyboard|Arrow|Home|End|Tab\" test tests src app packages", purpose: "Check roles, ARIA wiring, keyboard coverage, and attribute assertions." }
    ],
    learnerNextSteps: [
      "먼저 Radix Tabs/Accordion/Collapsible, Headless UI Tab/Disclosure, Ariakit Tab/Disclosure, Zag Accordion 중 어떤 family를 쓰는지 확인하세요.",
      "Root/List/Trigger/Content/Item/Header/Panel/Provider가 어떤 파일에서 조합되는지 보고 component boundary를 정리하세요.",
      "value/defaultValue, selectedIndex, selectedId, open/defaultOpen, onChange/onOpenChange, data-state, forceMount, unmountOnHide로 state ownership을 확인하세요.",
      "orientation, activationMode/manual, dir/rtl, multiple/collapsible 설정이 keyboard behavior와 일치하는지 확인하세요.",
      "Headless UI라면 TabsDataContext/TabsActionsContext, registerTab/registerPanel, FocusSentinel, useStableCollectionIndex, DisclosureContext/DisclosureAPIContext, CloseProvider/OpenClosedProvider, transition/refocus 구현 신호를 함께 확인하세요.",
      "tablist/tab/tabpanel role, aria-selected, aria-controls, aria-expanded, aria-orientation, aria-label, focus management를 테스트나 story에서 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 tab switch, accordion expand/collapse, focus movement, animation height, keyboard/click event는 원본 프로젝트의 component/browser tests에서 별도 확인하세요."
    ]
  };
}

type TabsAccordionReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function tabsAccordionReadinessSourceFiles(walk: WalkResult): Promise<TabsAccordionReadinessSourceFile[]> {
  const files: TabsAccordionReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !tabsAccordionReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!tabsAccordionReadinessPathSignal(file.relPath) && !tabsAccordionReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function tabsAccordionReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return tabsAccordionReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function tabsAccordionReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(tabs?|tablist|tabpanel|accordion|accordions|collapsible|disclosure|disclosures|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function tabsAccordionReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-tabs|@radix-ui\/react-accordion|@radix-ui\/react-collapsible|Tabs\.Root|Accordion\.Root|Collapsible\.Root|@headlessui\/react|Tab\.Group|TabGroup|DisclosureButton|DisclosurePanel|TabsDataContext|TabsActionsContext|DisclosureContext|DisclosureAPIContext|FocusSentinel|useStableCollectionIndex|@ariakit\/react|TabProvider|TabList|TabPanel|DisclosureProvider|DisclosureContent|@zag-js\/accordion|accordion\.machine|accordion\.connect|getItemTriggerProps|getItemContentProps|role\s*=\s*["']tablist|aria-selected|aria-expanded)/i.test(text);
}

function tabsAccordionReadinessSetups(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["tabsAccordionSetups"] {
  const rows: TabsAccordionReadinessReport["tabsAccordionSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(Tabs\.Root|Accordion\.Root|Collapsible\.Root|Tab\.Group|TabGroup|TabProvider|DisclosureProvider|<Disclosure\b|Disclosure\b|Root\b)/gi);
    const listCount = countMatches(source.text, /(Tabs\.List|Tab\.List|TabList|role\s*=\s*["']tablist|getByRole\(["']tablist)/gi);
    const triggerCount = countMatches(source.text, /(Tabs\.Trigger|Accordion\.Trigger|Collapsible\.Trigger|Disclosure\.Button|DisclosureButton|Ariakit\.Disclosure|<Tab\b|Ariakit\.Tab\b|Trigger|button)/gi);
    const contentCount = countMatches(source.text, /(Tabs\.Content|Accordion\.Content|Collapsible\.Content|Disclosure\.Panel|DisclosurePanel|DisclosureContent|Content|Panel)/gi);
    const itemCount = countMatches(source.text, /(Accordion\.Item|AccordionItem|<Tab\b|Ariakit\.Tab\b|Tabs\.Trigger|Item|disabled|accessibleWhenDisabled)/gi);
    const panelCount = countMatches(source.text, /(Tabs\.Content|Tab\.Panel|TabPanel|role\s*=\s*["']tabpanel|getByRole\(["']tabpanel|Panel)/gi);
    const stateCount = countMatches(source.text, /(value\s*=|defaultValue|selectedIndex|defaultIndex|selectedId|defaultSelectedId|open\s*=|defaultOpen|onValueChange|onOpenChange|onChange|setSelectedId|setOpen|data-state|data-headlessui-state|data-open|forceMount|unmountOnHide|static|alwaysVisible)/gi);
    const keyboardCount = countMatches(source.text, /(userEvent\.keyboard|keyboard|Arrow(Up|Down|Left|Right)|Home|End|\{Tab\}|Keys\.Tab|activationMode|manual|automatic|roving|RovingFocus|tabIndex|orientation)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']tablist|role\s*=\s*["']tab|role\s*=\s*["']tabpanel|getByRole|aria-selected|aria-controls|aria-expanded|aria-orientation|aria-label|aria-disabled|accessibleWhenDisabled|focus|tabIndex)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.click|userEvent\.keyboard|getByRole|toHaveAttribute|tabs-accordion-traces|upload-artifact)/gi);
    const total = rootCount + listCount + triggerCount + contentCount + itemCount + panelCount + stateCount + keyboardCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && triggerCount > 0 && contentCount > 0 && stateCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: tabsAccordionReadinessFramework(source),
      rootCount,
      listCount,
      triggerCount,
      contentCount,
      itemCount,
      panelCount,
      stateCount,
      keyboardCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, list ${listCount}, trigger ${triggerCount}, content ${contentCount}, item ${itemCount}, panel ${panelCount}, state ${stateCount}, keyboard ${keyboardCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.rootCount + b.triggerCount + b.contentCount + b.stateCount + b.accessibilityCount - (a.rootCount + a.triggerCount + a.contentCount + a.stateCount + a.accessibilityCount));
}

function tabsAccordionReadinessFramework(source: TabsAccordionReadinessSourceFile): TabsAccordionReadinessReport["tabsAccordionSetups"][number]["framework"] {
  if (/@radix-ui\/react-tabs|@radix-ui\/react-accordion|@radix-ui\/react-collapsible|Tabs\.Root|Accordion\.Root|Collapsible\.Root/i.test(source.text)) return "radix";
  if (/@headlessui\/react|Tab\.Group|TabGroup|Disclosure\.Button|DisclosureButton|DisclosurePanel/i.test(source.text)) return "headless-ui";
  if (/@ariakit\/react|TabProvider|Ariakit\.Tab|DisclosureProvider|DisclosureContent/i.test(source.text)) return "ariakit";
  if (/@zag-js\/accordion|accordion\.machine|accordion\.connect|getItemTriggerProps|getItemContentProps/i.test(source.text)) return "zag-accordion";
  if (/tablist|tabpanel|accordion|collapsible|disclosure|aria-expanded/i.test(source.filePath) || /tablist|tabpanel|accordion|collapsible|disclosure|aria-expanded/i.test(source.text)) return "custom";
  return "unknown";
}

function tabsAccordionReadinessFrameworkSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-tabs", pattern: /@radix-ui\/react-tabs|Tabs\.Root|Tabs\.List|Tabs\.Trigger|Tabs\.Content/i, evidence: "Radix Tabs evidence was detected." },
    { signal: "radix-accordion", pattern: /@radix-ui\/react-accordion|Accordion\.Root|Accordion\.Item|Accordion\.Trigger|Accordion\.Content/i, evidence: "Radix Accordion evidence was detected." },
    { signal: "radix-collapsible", pattern: /@radix-ui\/react-collapsible|Collapsible\.Root|Collapsible\.Trigger|Collapsible\.Content/i, evidence: "Radix Collapsible evidence was detected." },
    { signal: "headless-tabs", pattern: /@headlessui\/react|Tab\.Group|TabGroup|Tab\.List|Tab\.Panels|Tab\.Panel/i, evidence: "Headless UI Tabs evidence was detected." },
    { signal: "headless-disclosure", pattern: /Disclosure\.Button|Disclosure\.Panel|DisclosureButton|DisclosurePanel|<Disclosure\b/i, evidence: "Headless UI Disclosure evidence was detected." },
    { signal: "ariakit-tabs", pattern: /@ariakit\/react|TabProvider|TabList|TabPanel|Ariakit\.Tab\b/i, evidence: "Ariakit Tabs evidence was detected." },
    { signal: "ariakit-disclosure", pattern: /DisclosureProvider|DisclosureContent|Ariakit\.Disclosure\b/i, evidence: "Ariakit Disclosure evidence was detected." },
    { signal: "zag-accordion", pattern: /@zag-js\/accordion|accordion\.machine|accordion\.connect|getItemTriggerProps|getItemContentProps/i, evidence: "Zag Accordion evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']tablist|aria-selected|aria-expanded|accordion|collapsible|disclosure/i, evidence: "custom tabs/accordion/disclosure evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function tabsAccordionReadinessStructureSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["structureSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /Tabs\.Root|Accordion\.Root|Collapsible\.Root|Tab\.Group|TabGroup|Root\b/i, evidence: "root evidence was detected." },
    { signal: "list", pattern: /Tabs\.List|Tab\.List|TabList|role\s*=\s*["']tablist/i, evidence: "list evidence was detected." },
    { signal: "trigger", pattern: /Tabs\.Trigger|Accordion\.Trigger|Collapsible\.Trigger|Trigger|<Tab\b|Ariakit\.Tab\b/i, evidence: "trigger evidence was detected." },
    { signal: "content", pattern: /Tabs\.Content|Accordion\.Content|Collapsible\.Content|Content|DisclosureContent/i, evidence: "content evidence was detected." },
    { signal: "item", pattern: /Accordion\.Item|AccordionItem|<Tab\b|Ariakit\.Tab\b|Item/i, evidence: "item evidence was detected." },
    { signal: "header", pattern: /Accordion\.Header|AccordionHeader|Header/i, evidence: "header evidence was detected." },
    { signal: "panel", pattern: /Tab\.Panel|TabPanel|Tabs\.Content|role\s*=\s*["']tabpanel|Panel/i, evidence: "panel evidence was detected." },
    { signal: "provider", pattern: /TabProvider|DisclosureProvider|Tabs\.Root|Accordion\.Root|Collapsible\.Root|Tab\.Group/i, evidence: "provider/root evidence was detected." },
    { signal: "disclosure-button", pattern: /Disclosure\.Button|DisclosureButton|Ariakit\.Disclosure|Collapsible\.Trigger|aria-expanded/i, evidence: "disclosure button evidence was detected." },
    { signal: "disclosure-panel", pattern: /Disclosure\.Panel|DisclosurePanel|DisclosureContent|Collapsible\.Content|aria-controls/i, evidence: "disclosure panel evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function tabsAccordionReadinessStateSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["stateSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "controlled-value", pattern: /value\s*=|value=\{|selectedIndex|selectedId|open\s*=|open=\{/i, evidence: "controlled value/open evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|defaultIndex|defaultSelectedId/i, evidence: "default value evidence was detected." },
    { signal: "selected-index", pattern: /selectedIndex|defaultIndex|setSelectedIndex/i, evidence: "selected index evidence was detected." },
    { signal: "selected-id", pattern: /selectedId|defaultSelectedId|setSelectedId|tabId/i, evidence: "selected id evidence was detected." },
    { signal: "open-state", pattern: /open\s*=|open=\{|setOpen|aria-expanded|data-open/i, evidence: "open state evidence was detected." },
    { signal: "default-open", pattern: /defaultOpen/i, evidence: "default open evidence was detected." },
    { signal: "on-change", pattern: /onValueChange|onOpenChange|onChange|setSelectedId|setSelectedIndex|setOpen/i, evidence: "change handler evidence was detected." },
    { signal: "data-state", pattern: /data-state|data-headlessui-state|data-open|data-orientation/i, evidence: "data-state evidence was detected." },
    { signal: "force-mount", pattern: /forceMount|static|alwaysVisible/i, evidence: "force/static mount evidence was detected." },
    { signal: "unmount-on-hide", pattern: /unmountOnHide|unmount|hidden/i, evidence: "unmount-on-hide evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function tabsAccordionReadinessInteractionSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keyboard-navigation", pattern: /userEvent\.keyboard|keyboard|activationMode|orientation|aria-orientation|tabIndex/i, evidence: "keyboard navigation evidence was detected." },
    { signal: "arrow-keys", pattern: /Arrow(Up|Down|Left|Right)|Keys\.Arrow|arrow keys/i, evidence: "arrow key evidence was detected." },
    { signal: "home-end", pattern: /Home|End|Keys\.Home|Keys\.End/i, evidence: "Home/End evidence was detected." },
    { signal: "tab-key", pattern: /\{Tab\}|Keys\.Tab|Tab key|shift\(Keys\.Tab\)|userEvent\.tab/i, evidence: "Tab key evidence was detected." },
    { signal: "click", pattern: /userEvent\.click|onClick|click\(|await click/i, evidence: "click evidence was detected." },
    { signal: "manual-activation", pattern: /activationMode\s*=\s*["']manual|manual\b/i, evidence: "manual activation evidence was detected." },
    { signal: "automatic-activation", pattern: /activationMode|automatic/i, evidence: "automatic activation/config evidence was detected." },
    { signal: "roving-focus", pattern: /roving|RovingFocus|tabIndex|activeId|orientation|Composite/i, evidence: "roving/composite focus evidence was detected." },
    { signal: "disabled-item", pattern: /disabled|aria-disabled|accessibleWhenDisabled/i, evidence: "disabled item evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function tabsAccordionReadinessAccessibilitySignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-tablist", pattern: /role\s*=\s*["']tablist|getByRole\(["']tablist|Tabs\.List|Tab\.List|TabList/i, evidence: "tablist role evidence was detected." },
    { signal: "role-tab", pattern: /role\s*=\s*["']tab|getByRole\(["']tab|Tabs\.Trigger|<Tab\b|Ariakit\.Tab\b/i, evidence: "tab role evidence was detected." },
    { signal: "role-tabpanel", pattern: /role\s*=\s*["']tabpanel|getByRole\(["']tabpanel|Tabs\.Content|Tab\.Panel|TabPanel/i, evidence: "tabpanel role evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected|selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-orientation", pattern: /aria-orientation|orientation\s*=/i, evidence: "aria orientation evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria label evidence was detected." },
    { signal: "focus-management", pattern: /focus|tabIndex|roving|RovingFocus|accessibleWhenDisabled|userEvent\.keyboard/i, evidence: "focus management evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function tabsAccordionReadinessOrientationSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["orientationSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["orientationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "horizontal", pattern: /horizontal|orientation\s*=\s*["']horizontal/i, evidence: "horizontal orientation evidence was detected." },
    { signal: "vertical", pattern: /vertical|orientation\s*=\s*["']vertical/i, evidence: "vertical orientation evidence was detected." },
    { signal: "activation-mode", pattern: /activationMode|manual|automatic/i, evidence: "activation mode evidence was detected." },
    { signal: "dir", pattern: /\bdir\s*=|direction/i, evidence: "direction evidence was detected." },
    { signal: "rtl", pattern: /rtl|dir\s*=\s*["']rtl/i, evidence: "RTL evidence was detected." },
    { signal: "collapsible", pattern: /collapsible|Collapsible\.|Disclosure/i, evidence: "collapsible/disclosure evidence was detected." },
    { signal: "multiple", pattern: /multiple|type\s*=\s*["']multiple|aria-multiselectable/i, evidence: "multiple selection evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "orientation", "signal");
}

function tabsAccordionReadinessMachineSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["machineSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|accordion\.machine|@zag-js\/core/i, evidence: "Zag machine creation evidence was detected." },
    { signal: "idle-state", pattern: /initial\s*:\s*["']idle|states\s*:\s*\{[^}]*idle|\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "focused-state", pattern: /focusedValue|onFocusChange|setFocusedValue|clearFocusedValue/i, evidence: "focused state evidence was detected." },
    { signal: "value-set-event", pattern: /VALUE\.SET|setValue/i, evidence: "value set event evidence was detected." },
    { signal: "trigger-focus-event", pattern: /TRIGGER\.FOCUS|onFocus/i, evidence: "trigger focus event evidence was detected." },
    { signal: "trigger-click-event", pattern: /TRIGGER\.CLICK|onClick/i, evidence: "trigger click event evidence was detected." },
    { signal: "goto-next-prev", pattern: /GOTO\.(NEXT|PREV)|focus(Next|Prev)Trigger|Arrow(Down|Up|Right|Left)/i, evidence: "next/previous navigation evidence was detected." },
    { signal: "goto-first-last", pattern: /GOTO\.(FIRST|LAST)|focus(First|Last)Trigger|Home|End/i, evidence: "first/last navigation evidence was detected." },
    { signal: "trigger-blur-event", pattern: /TRIGGER\.BLUR|onBlur/i, evidence: "trigger blur event evidence was detected." },
    { signal: "can-toggle-guard", pattern: /canToggle/i, evidence: "canToggle guard evidence was detected." },
    { signal: "is-expanded-guard", pattern: /isExpanded|expanded/i, evidence: "expanded guard/state evidence was detected." },
    { signal: "collapse-action", pattern: /\bcollapse\b/i, evidence: "collapse action evidence was detected." },
    { signal: "expand-action", pattern: /\bexpand\b/i, evidence: "expand action evidence was detected." },
    { signal: "focus-trigger-actions", pattern: /focus(First|Last|Next|Prev)Trigger/i, evidence: "focus trigger action evidence was detected." },
    { signal: "focused-value", pattern: /focusedValue/i, evidence: "focusedValue context evidence was detected." },
    { signal: "bindable-value", pattern: /defaultValue|value\s*:|value\s*=|bindable/i, evidence: "bindable value evidence was detected." },
    { signal: "computed-horizontal", pattern: /isHorizontal|orientation.*horizontal|horizontal.*orientation/i, evidence: "computed horizontal orientation evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function tabsAccordionReadinessDomSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["domSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|data-zag-root|data-part=["']root/i, evidence: "root id evidence was detected." },
    { signal: "item-id", pattern: /getItemId|data-part=["']item|accordion:item/i, evidence: "item id evidence was detected." },
    { signal: "item-content-id", pattern: /getItemContentId|accordion:content|itemContent/i, evidence: "item content id evidence was detected." },
    { signal: "item-trigger-id", pattern: /getItemTriggerId|accordion:trigger|itemTrigger/i, evidence: "item trigger id evidence was detected." },
    { signal: "root-el", pattern: /getRootEl|getRootProps|rootProps/i, evidence: "root element evidence was detected." },
    { signal: "trigger-elements", pattern: /getTriggerEls|item-trigger|getItemTriggerProps/i, evidence: "trigger collection evidence was detected." },
    { signal: "first-last-trigger", pattern: /getFirstTriggerEl|getLastTriggerEl|first trigger|last trigger|focus(First|Last)Trigger/i, evidence: "first/last trigger evidence was detected." },
    { signal: "next-prev-trigger", pattern: /getNextTriggerEl|getPrevTriggerEl|next trigger|previous trigger|focus(Next|Prev)Trigger/i, evidence: "next/previous trigger evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby|dataOwnedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "data-controls", pattern: /data-controls|dataControls/i, evidence: "data-controls evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-focus", pattern: /data-focus/i, evidence: "data-focus evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function tabsAccordionReadinessApiSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["apiSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focused-value-api", pattern: /focusedValue/i, evidence: "focused value API evidence was detected." },
    { signal: "value-api", pattern: /\bvalue\b|api\.value/i, evidence: "value API evidence was detected." },
    { signal: "set-value-api", pattern: /setValue|api\.setValue/i, evidence: "setValue API evidence was detected." },
    { signal: "item-state-api", pattern: /getItemState/i, evidence: "item state API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps|rootProps/i, evidence: "root props API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps|itemProps/i, evidence: "item props API evidence was detected." },
    { signal: "item-content-props", pattern: /getItemContentProps|contentProps/i, evidence: "item content props API evidence was detected." },
    { signal: "item-indicator-props", pattern: /getItemIndicatorProps|indicatorProps/i, evidence: "item indicator props API evidence was detected." },
    { signal: "item-trigger-props", pattern: /getItemTriggerProps|triggerProps/i, evidence: "item trigger props API evidence was detected." },
    { signal: "region-role", pattern: /role\s*[:=]\s*["']region|role=["']region/i, evidence: "region role evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby|ariaLabelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden|ariaHidden/i, evidence: "aria-hidden evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls|ariaControls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded|ariaExpanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "data-controls", pattern: /data-controls|dataControls/i, evidence: "data-controls API evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby|dataOwnedby/i, evidence: "data-ownedby API evidence was detected." },
    { signal: "hidden-content", pattern: /hiddenContent|\bhidden\b/i, evidence: "hidden content evidence was detected." },
    { signal: "trigger-focus-handler", pattern: /onFocus|TRIGGER\.FOCUS/i, evidence: "trigger focus handler evidence was detected." },
    { signal: "trigger-blur-handler", pattern: /onBlur|TRIGGER\.BLUR/i, evidence: "trigger blur handler evidence was detected." },
    { signal: "trigger-click-handler", pattern: /onClick|TRIGGER\.CLICK/i, evidence: "trigger click handler evidence was detected." },
    { signal: "trigger-keydown-handler", pattern: /onKeyDown|getEventKey/i, evidence: "trigger keydown handler evidence was detected." },
    { signal: "arrow-key-map", pattern: /Arrow(Down|Up|Right|Left)/i, evidence: "arrow key API map evidence was detected." },
    { signal: "home-end-key-map", pattern: /Home|End/i, evidence: "Home/End API map evidence was detected." },
    { signal: "safari-focus-fix", pattern: /isSafari|safariFocusFix/i, evidence: "Safari focus fix evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function tabsAccordionReadinessImplementationSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tabs-data-context", pattern: /TabsDataContext|useData\(['"]Tab/i, evidence: "Headless UI Tabs data context evidence was detected." },
    { signal: "tabs-actions-context", pattern: /TabsActionsContext|useActions\(['"]Tab/i, evidence: "Headless UI Tabs actions context evidence was detected." },
    { signal: "tabs-controlled-info", pattern: /isControlled|useLatestValue\(\{\s*isControlled/i, evidence: "Headless UI Tabs controlled/uncontrolled info evidence was detected." },
    { signal: "tabs-register-tab", pattern: /RegisterTab|registerTab|actions\.registerTab/i, evidence: "Headless UI Tabs tab registration evidence was detected." },
    { signal: "tabs-register-panel", pattern: /RegisterPanel|registerPanel|actions\.registerPanel/i, evidence: "Headless UI Tabs panel registration evidence was detected." },
    { signal: "tabs-dom-sort", pattern: /sortByDomNode/i, evidence: "Headless UI Tabs DOM-order sorting evidence was detected." },
    { signal: "tabs-focus-sentinel", pattern: /FocusSentinel/i, evidence: "Headless UI Tabs focus sentinel evidence was detected." },
    { signal: "tabs-stable-collection", pattern: /StableCollection/i, evidence: "Headless UI Tabs stable collection evidence was detected." },
    { signal: "tabs-stable-index", pattern: /useStableCollectionIndex/i, evidence: "Headless UI Tabs SSR stable index evidence was detected." },
    { signal: "tabs-iso-effect", pattern: /useIsoMorphicEffect/i, evidence: "Headless UI Tabs isomorphic effect evidence was detected." },
    { signal: "tabs-latest-value", pattern: /useLatestValue/i, evidence: "Headless UI Tabs latest-value ref evidence was detected." },
    { signal: "tabs-auto-activation", pattern: /activation\s*=\s*['"]auto|autoActivation|activation:\s*['"]auto/i, evidence: "Headless UI Tabs auto activation evidence was detected." },
    { signal: "tabs-manual-activation", pattern: /manual\s*=|manual\b|activation\s*=\s*['"]manual|activation:\s*['"]manual/i, evidence: "Headless UI Tabs manual activation evidence was detected." },
    { signal: "tabs-keyboard-map", pattern: /Keys\.(Home|PageUp|End|PageDown|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|Space|Enter)/i, evidence: "Headless UI Tabs keyboard map evidence was detected." },
    { signal: "tabs-focus-in", pattern: /focusIn\(|Focus\.(First|Last|Previous|Next|WrapAround)/i, evidence: "Headless UI Tabs focusIn navigation evidence was detected." },
    { signal: "tabs-mousedown-prevent-default", pattern: /handleMouseDown|onMouseDown|event\.preventDefault\(\)/i, evidence: "Headless UI Tabs mouse-down preventDefault evidence was detected." },
    { signal: "tabs-click-selection", pattern: /handleSelection|onClick:\s*handleSelection|actions\.change\(myIndex\)/i, evidence: "Headless UI Tabs click selection evidence was detected." },
    { signal: "tabs-microtask-ready", pattern: /microTask|ready\.current/i, evidence: "Headless UI Tabs microtask ready guard evidence was detected." },
    { signal: "tabs-hidden-panel", pattern: /<Hidden|Hidden\s+aria-hidden|aria-hidden=["']true/i, evidence: "Headless UI Tabs hidden unselected panel evidence was detected." },
    { signal: "tabs-object-assign", pattern: /Object\.assign\(Tab|Object\.assign\(TabRoot/i, evidence: "Headless UI Tabs static subcomponent assignment evidence was detected." },
    { signal: "disclosure-context", pattern: /DisclosureContext/i, evidence: "Headless UI Disclosure context evidence was detected." },
    { signal: "disclosure-api-context", pattern: /DisclosureAPIContext/i, evidence: "Headless UI Disclosure API context evidence was detected." },
    { signal: "disclosure-panel-context", pattern: /DisclosurePanelContext/i, evidence: "Headless UI Disclosure panel context evidence was detected." },
    { signal: "disclosure-reducer", pattern: /ActionTypes\.(ToggleDisclosure|CloseDisclosure)|stateReducer|useReducer\(stateReducer/i, evidence: "Headless UI Disclosure reducer/action evidence was detected." },
    { signal: "disclosure-default-open", pattern: /defaultOpen|DisclosureStates\.Open/i, evidence: "Headless UI Disclosure default-open state evidence was detected." },
    { signal: "disclosure-close-refocus", pattern: /getOwnerDocument|restoreElement\?\.focus|CloseDisclosure/i, evidence: "Headless UI Disclosure close refocus evidence was detected." },
    { signal: "disclosure-open-closed-provider", pattern: /OpenClosedProvider|useOpenClosed|State\.Open|State\.Closed/i, evidence: "Headless UI Disclosure open/closed provider evidence was detected." },
    { signal: "disclosure-close-provider", pattern: /CloseProvider/i, evidence: "Headless UI Disclosure close provider evidence was detected." },
    { signal: "disclosure-button-id", pattern: /SetButtonId|buttonId|headlessui-disclosure-button/i, evidence: "Headless UI Disclosure button id evidence was detected." },
    { signal: "disclosure-panel-id", pattern: /SetPanelId|panelId|headlessui-disclosure-panel/i, evidence: "Headless UI Disclosure panel id evidence was detected." },
    { signal: "disclosure-within-panel", pattern: /isWithinPanel|withinPanel|DisclosurePanelContext/i, evidence: "Headless UI Disclosure within-panel button evidence was detected." },
    { signal: "disclosure-space-enter-toggle", pattern: /Keys\.Space[\s\S]{0,120}Keys\.Enter|Keys\.Enter[\s\S]{0,120}Keys\.Space/i, evidence: "Headless UI Disclosure Space/Enter toggle evidence was detected." },
    { signal: "disclosure-keyup-prevent-default", pattern: /handleKeyUp|onKeyUp|Keys\.Space[\s\S]{0,120}preventDefault/i, evidence: "Headless UI Disclosure keyup preventDefault evidence was detected." },
    { signal: "disclosure-disabled-guard", pattern: /isDisabledReactIssue7711|disabled:\s*undefined|if\s*\(disabled\)\s*return/i, evidence: "Headless UI Disclosure disabled guard evidence was detected." },
    { signal: "disclosure-button-type", pattern: /useResolveButtonType/i, evidence: "Headless UI Disclosure button type resolution evidence was detected." },
    { signal: "disclosure-focus-ring", pattern: /useFocusRing/i, evidence: "Headless UI Disclosure focus ring evidence was detected." },
    { signal: "disclosure-hover-state", pattern: /useHover/i, evidence: "Headless UI Disclosure hover state evidence was detected." },
    { signal: "disclosure-active-press", pattern: /useActivePress/i, evidence: "Headless UI Disclosure active press evidence was detected." },
    { signal: "disclosure-transition", pattern: /useTransition|transitionDataAttributes|transitionData/i, evidence: "Headless UI Disclosure transition evidence was detected." },
    { signal: "disclosure-reset-open-closed", pattern: /ResetOpenClosedProvider/i, evidence: "Headless UI Disclosure reset open/closed provider evidence was detected." },
    { signal: "disclosure-start-transition", pattern: /startTransition/i, evidence: "Headless UI Disclosure startTransition evidence was detected." },
    { signal: "disclosure-object-assign", pattern: /Object\.assign\(Disclosure|Object\.assign\(DisclosureRoot/i, evidence: "Headless UI Disclosure static subcomponent assignment evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function tabsAccordionReadinessTestSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["testSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|pnpm playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress|pnpm cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent\./i, evidence: "user-event evidence was detected." },
    { signal: "role-test", pattern: /getByRole|role\s*=\s*["']tab|role\s*=\s*["']tabpanel|role\s*=\s*["']tablist/i, evidence: "role test evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|Arrow(Up|Down|Left|Right)|Home|End|\{Tab\}/i, evidence: "keyboard test evidence was detected." },
    { signal: "attribute-test", pattern: /toHaveAttribute|aria-selected|aria-controls|aria-expanded|aria-orientation/i, evidence: "attribute assertion evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|tabs-accordion-traces|reports\/tabs-accordion/i, evidence: "artifact upload evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function tabsAccordionReadinessPackageSignals(sourceFiles: TabsAccordionReadinessSourceFile[]): TabsAccordionReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TabsAccordionReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-tabs", pattern: /@radix-ui\/react-tabs/i, evidence: "@radix-ui/react-tabs dependency evidence was detected." },
    { signal: "@radix-ui/react-accordion", pattern: /@radix-ui\/react-accordion/i, evidence: "@radix-ui/react-accordion dependency evidence was detected." },
    { signal: "@radix-ui/react-collapsible", pattern: /@radix-ui\/react-collapsible/i, evidence: "@radix-ui/react-collapsible dependency evidence was detected." },
    { signal: "@headlessui/react", pattern: /@headlessui\/react/i, evidence: "@headlessui/react dependency evidence was detected." },
    { signal: "@ariakit/react", pattern: /@ariakit\/react/i, evidence: "@ariakit/react dependency evidence was detected." },
    { signal: "@zag-js/accordion", pattern: /@zag-js\/accordion/i, evidence: "@zag-js/accordion dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']/i, evidence: "React dependency evidence was detected." }
  ];
  return tabsAccordionReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function tabsAccordionReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TabsAccordionReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/tabs-accordion-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCheckboxRadioSwitchReadinessReport(walk: WalkResult): Promise<CheckboxRadioSwitchReadinessReport> {
  const sourceFiles = await checkboxRadioSwitchReadinessSourceFiles(walk);
  const checkboxRadioSwitchSetups = checkboxRadioSwitchReadinessSetups(sourceFiles);
  const frameworkSignals = checkboxRadioSwitchReadinessFrameworkSignals(sourceFiles);
  const controlSignals = checkboxRadioSwitchReadinessControlSignals(sourceFiles);
  const structureSignals = checkboxRadioSwitchReadinessStructureSignals(sourceFiles);
  const stateSignals = checkboxRadioSwitchReadinessStateSignals(sourceFiles);
  const formSignals = checkboxRadioSwitchReadinessFormSignals(sourceFiles);
  const interactionSignals = checkboxRadioSwitchReadinessInteractionSignals(sourceFiles);
  const accessibilitySignals = checkboxRadioSwitchReadinessAccessibilitySignals(sourceFiles);
  const implementationSignals = checkboxRadioSwitchReadinessImplementationSignals(sourceFiles);
  const testSignals = checkboxRadioSwitchReadinessTestSignals(sourceFiles);
  const packageSignals = checkboxRadioSwitchReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasControls = controlSignals.some((item) => item.readiness === "ready") || checkboxRadioSwitchSetups.some((item) => item.checkboxCount + item.radioCount + item.switchCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || checkboxRadioSwitchSetups.some((item) => item.stateCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || checkboxRadioSwitchSetups.some((item) => item.formCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || checkboxRadioSwitchSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || checkboxRadioSwitchSetups.some((item) => item.testCount > 0);

  const riskQueue: CheckboxRadioSwitchReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasControls) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document checkbox, radio group, or switch component boundaries before claiming selection control readiness.",
      why: "Selection control readiness starts with concrete checkbox, radio, switch, item, indicator, or provider evidence.",
      relatedHref: "html/checkbox-radio-switch-readiness.html"
    });
  }
  if ((hasFramework || hasControls) && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Trace checked/defaultChecked, value/defaultValue, onCheckedChange/onChange/onValueChange, setValue, indeterminate, and data-state behavior.",
      why: "Checkboxes, radios, and switches fail through controlled/uncontrolled state drift and mixed-state handling.",
      relatedHref: "html/checkbox-radio-switch-readiness.html"
    });
  }
  if ((hasFramework || hasControls) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm name, value, form, required, disabled, hidden input, and field/group integration for form submission.",
      why: "Selection controls often render custom buttons while relying on hidden or bubble inputs for native form behavior.",
      relatedHref: "html/checkbox-radio-switch-readiness.html"
    });
  }
  if ((hasFramework || hasControls) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Verify checkbox/radio/switch roles, aria-checked, labels, descriptions, and focus management.",
      why: "Custom selection controls must preserve role and ARIA semantics when they are not native inputs.",
      relatedHref: "html/checkbox-radio-switch-readiness.html"
    });
  }
  if ((hasFramework || hasControls || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add role, keyboard, click, disabled, mixed-state, and attribute tests for selection controls.",
      why: "Static component evidence does not prove toggling, roving focus, disabled behavior, form submission, or mixed-state attributes.",
      relatedHref: "html/checkbox-radio-switch-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual control behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records checkbox/radio/switch readiness only; it does not toggle controls, change checked state, move focus, dispatch keyboard/click events, submit forms, mutate stores, or run analyzed project tests.",
    relatedHref: "html/checkbox-radio-switch-readiness.html"
  });

  return {
    summary: `Checkbox/radio/switch readiness report: setup ${checkboxRadioSwitchSetups.length}개, framework signal ${frameworkSignals.length}개, implementation signal ${implementationSignals.length}개, state signal ${stateSignals.length}개, form signal ${formSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Checkbox/radio/switch readiness Radix Checkbox RadioGroup Switch Headless UI Checkbox RadioGroup Switch controllable comparator option registration form fields labels keyboard focus Ariakit Checkbox Radio checked defaultChecked indeterminate aria-checked form tests",
    checkboxRadioSwitchSetups,
    frameworkSignals,
    controlSignals,
    structureSignals,
    stateSignals,
    formSignals,
    interactionSignals,
    accessibilitySignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-checkbox|@radix-ui/react-radio-group|@radix-ui/react-switch|Checkbox\\.Root|RadioGroup\\.Root|Switch\\.Root\" package.json src app packages", purpose: "Find Radix checkbox, radio group, and switch boundaries." },
      { command: "rg \"@headlessui/react|<Checkbox|RadioGroup|<Switch|Switch\\.Group|SwitchLabel|SwitchDescription|RadioGroupDataContext|RadioGroupActionsContext|useByComparator|RegisterOption|useControllable|useDefaultValue|FormFields|attemptSubmit|aria-checked\" package.json src app packages", purpose: "Find Headless UI selection control usage and implementation internals." },
      { command: "rg \"@ariakit/react|CheckboxProvider|useCheckboxStore|Ariakit\\.Checkbox|RadioProvider|Ariakit\\.Radio|MenuItemCheckbox|MenuItemRadio\" package.json src app packages", purpose: "Find Ariakit checkbox/radio and menu selection controls." },
      { command: "rg \"checked|defaultChecked|onCheckedChange|onChange|onValueChange|setValue|value=|defaultValue|indeterminate|data-state\" src app packages", purpose: "Review state ownership and mixed checked state handling." },
      { command: "rg \"role=|getByRole|aria-checked|aria-label|aria-labelledby|aria-describedby|userEvent\\.keyboard|Space|Arrow|toHaveAttribute\" test tests src app packages", purpose: "Check roles, ARIA wiring, keyboard coverage, and attribute assertions." }
    ],
    learnerNextSteps: [
      "먼저 Radix, Headless UI, Ariakit, 또는 custom selection control 중 어떤 family를 쓰는지 확인하세요.",
      "checkbox, radio group, switch root/provider/item/indicator/thumb/label/description 구조가 어떤 파일에 있는지 정리하세요.",
      "checked/defaultChecked, value/defaultValue, onCheckedChange/onChange/onValueChange, setValue, indeterminate, data-state로 controlled state를 확인하세요.",
      "name, value, form, required, disabled, hidden input, field/group integration이 native form submission과 일치하는지 확인하세요.",
      "role checkbox/radio/switch, aria-checked, aria-label, aria-labelledby, aria-describedby, focus management를 테스트나 story에서 확인하세요.",
      "Headless UI Checkbox/RadioGroup/Switch는 controllable/default state, comparator, option registration, group label/description provider, keyboard Space/Enter/Arrow handling, hidden FormFields, reset, focus/hover/active slot state를 구현 신호로 따로 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 toggle, radio roving focus, switch click, mixed-state keyboard, form submit은 원본 프로젝트의 component/browser tests에서 별도 확인하세요."
    ]
  };
}

type CheckboxRadioSwitchReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function checkboxRadioSwitchReadinessSourceFiles(walk: WalkResult): Promise<CheckboxRadioSwitchReadinessSourceFile[]> {
  const files: CheckboxRadioSwitchReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !checkboxRadioSwitchReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!checkboxRadioSwitchReadinessPathSignal(file.relPath) && !checkboxRadioSwitchReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function checkboxRadioSwitchReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return checkboxRadioSwitchReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function checkboxRadioSwitchReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(checkbox|checkboxes|radio|radios|radio-group|radiogroup|switch|switches|selection|preferences|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function checkboxRadioSwitchReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-checkbox|@radix-ui\/react-radio-group|@radix-ui\/react-switch|Checkbox\.Root|RadioGroup\.Root|Switch\.Root|@headlessui\/react|<Checkbox\b|RadioGroup|RadioGroupDataContext|RadioGroupActionsContext|useByComparator|RegisterOption|<Switch\b|useControllable|useDefaultValue|FormFields|attemptSubmit|Ariakit\.Checkbox|Ariakit\.Radio|CheckboxProvider|RadioProvider|role\s*=\s*["']checkbox|role\s*=\s*["']radio|role\s*=\s*["']switch|aria-checked|indeterminate)/i.test(text);
}

function checkboxRadioSwitchReadinessSetups(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["checkboxRadioSwitchSetups"] {
  const rows: CheckboxRadioSwitchReadinessReport["checkboxRadioSwitchSetups"] = [];
  for (const source of sourceFiles) {
    const checkboxCount = countMatches(source.text, /(Checkbox\.Root|Checkbox\b|Ariakit\.Checkbox\b|CheckboxProvider|useCheckboxStore|MenuItemCheckbox|role\s*=\s*["']checkbox|getByRole\(["']checkbox|type\s*=\s*["']checkbox)/gi);
    const radioCount = countMatches(source.text, /(RadioGroup\.Root|RadioGroup\b|Ariakit\.Radio\b|RadioProvider|MenuItemRadio|role\s*=\s*["']radio|getByRole\(["']radio|type\s*=\s*["']radio)/gi);
    const switchCount = countMatches(source.text, /(Switch\.Root|Switch\.Group|Switch\b|role\s*=\s*["']switch|getByRole\(["']switch|aria-checked.*switch)/gi);
    const providerCount = countMatches(source.text, /(Provider|CheckboxProvider|RadioProvider|useCheckboxStore|Field|Group|Switch\.Group|RadioGroup\.Root|Checkbox\.Root|Switch\.Root)/gi);
    const itemCount = countMatches(source.text, /(Item|RadioGroup\.Item|RadioGroup\.Option|Ariakit\.Radio|MenuItemCheckbox|MenuItemRadio|Option|value\s*=|disabled)/gi);
    const indicatorCount = countMatches(source.text, /(Indicator|CheckboxCheck|Switch\.Thumb|Thumb|forceMount|data-testid)/gi);
    const stateCount = countMatches(source.text, /(checked\s*=|defaultChecked|onCheckedChange|onChange|onValueChange|setValue|value\s*=|defaultValue|indeterminate|data-state|data-headlessui-state|aria-checked|useState|useCheckboxStore)/gi);
    const formCount = countMatches(source.text, /(name\s*=|form\s*=|required|disabled|value\s*=|type\s*=\s*["']checkbox|type\s*=\s*["']radio|BubbleInput|hidden|Field|FormCheckbox)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']checkbox|role\s*=\s*["']radio|role\s*=\s*["']switch|getByRole|aria-checked|aria-label|aria-labelledby|aria-describedby|Label|Description|focus|tabIndex)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.click|userEvent\.keyboard|getByRole|toHaveAttribute|checkbox-radio-switch-traces|upload-artifact)/gi);
    const total = checkboxCount + radioCount + switchCount + providerCount + itemCount + indicatorCount + stateCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = (checkboxCount + radioCount + switchCount > 0) && stateCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: checkboxRadioSwitchReadinessFramework(source),
      checkboxCount,
      radioCount,
      switchCount,
      providerCount,
      itemCount,
      indicatorCount,
      stateCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `checkbox ${checkboxCount}, radio ${radioCount}, switch ${switchCount}, provider ${providerCount}, item ${itemCount}, indicator ${indicatorCount}, state ${stateCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.checkboxCount + b.radioCount + b.switchCount + b.stateCount + b.accessibilityCount - (a.checkboxCount + a.radioCount + a.switchCount + a.stateCount + a.accessibilityCount));
}

function checkboxRadioSwitchReadinessFramework(source: CheckboxRadioSwitchReadinessSourceFile): CheckboxRadioSwitchReadinessReport["checkboxRadioSwitchSetups"][number]["framework"] {
  if (/@radix-ui\/react-checkbox|@radix-ui\/react-radio-group|@radix-ui\/react-switch|Checkbox\.Root|RadioGroup\.Root|Switch\.Root/i.test(source.text)) return "radix";
  if (/@ariakit\/react|Ariakit\.Checkbox|Ariakit\.Radio|CheckboxProvider|RadioProvider|MenuItemCheckbox|MenuItemRadio/i.test(source.text)) return "ariakit";
  if (/@headlessui\/react|<Checkbox\b|RadioGroup|<Switch\b|Switch\.Group|data-headlessui-state/i.test(source.text)) return "headless-ui";
  if (/checkbox|radio|switch|aria-checked/i.test(source.filePath) || /checkbox|radio|switch|aria-checked/i.test(source.text)) return "custom";
  return "unknown";
}

function checkboxRadioSwitchReadinessFrameworkSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-checkbox", pattern: /@radix-ui\/react-checkbox|Checkbox\.Root|Checkbox\.Indicator/i, evidence: "Radix Checkbox evidence was detected." },
    { signal: "radix-radio-group", pattern: /@radix-ui\/react-radio-group|RadioGroup\.Root|RadioGroup\.Item|RadioGroup\.Indicator/i, evidence: "Radix RadioGroup evidence was detected." },
    { signal: "radix-switch", pattern: /@radix-ui\/react-switch|Switch\.Root|Switch\.Thumb/i, evidence: "Radix Switch evidence was detected." },
    { signal: "headless-checkbox", pattern: /@headlessui\/react|<Checkbox\b|data-headlessui-state/i, evidence: "Headless UI Checkbox evidence was detected." },
    { signal: "headless-radio-group", pattern: /@headlessui\/react|RadioGroup\.Option|RadioGroup\.Label|<RadioGroup\b/i, evidence: "Headless UI RadioGroup evidence was detected." },
    { signal: "headless-switch", pattern: /@headlessui\/react|<Switch\b|Switch\.Group|Switch\.Label|Switch\.Description/i, evidence: "Headless UI Switch evidence was detected." },
    { signal: "ariakit-checkbox", pattern: /@ariakit\/react|Ariakit\.Checkbox|CheckboxProvider|useCheckboxStore|CheckboxCheck|MenuItemCheckbox/i, evidence: "Ariakit Checkbox evidence was detected." },
    { signal: "ariakit-radio", pattern: /@ariakit\/react|Ariakit\.Radio|RadioProvider|RadioGroup|MenuItemRadio/i, evidence: "Ariakit Radio evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']checkbox|role\s*=\s*["']radio|role\s*=\s*["']switch|aria-checked|type\s*=\s*["']checkbox|type\s*=\s*["']radio/i, evidence: "custom selection control evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function checkboxRadioSwitchReadinessControlSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["controlSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["controlSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "checkbox", pattern: /Checkbox\.Root|<Checkbox\b|Ariakit\.Checkbox|role\s*=\s*["']checkbox|getByRole\(["']checkbox|type\s*=\s*["']checkbox/i, evidence: "checkbox evidence was detected." },
    { signal: "radio-group", pattern: /RadioGroup\.Root|<RadioGroup\b|RadioGroup\.Option|Ariakit\.RadioGroup|role\s*=\s*["']radio|getByRole\(["']radio/i, evidence: "radio group evidence was detected." },
    { signal: "switch", pattern: /Switch\.Root|<Switch\b|Switch\.Group|role\s*=\s*["']switch|getByRole\(["']switch/i, evidence: "switch evidence was detected." },
    { signal: "menu-checkbox", pattern: /MenuItemCheckbox|menuitemcheckbox/i, evidence: "menu checkbox evidence was detected." },
    { signal: "menu-radio", pattern: /MenuItemRadio|menuitemradio/i, evidence: "menu radio evidence was detected." },
    { signal: "custom", pattern: /aria-checked|indeterminate|data-state.*checked/i, evidence: "custom checked-state evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "control", "signal");
}

function checkboxRadioSwitchReadinessStructureSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["structureSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /Checkbox\.Root|RadioGroup\.Root|Switch\.Root|Root\b|<Checkbox\b|<RadioGroup\b|<Switch\b/i, evidence: "root evidence was detected." },
    { signal: "provider", pattern: /Provider|CheckboxProvider|RadioProvider|useCheckboxStore|Field|Switch\.Group/i, evidence: "provider/group evidence was detected." },
    { signal: "group", pattern: /RadioGroup|Switch\.Group|Field|role\s*=\s*["']radiogroup/i, evidence: "group evidence was detected." },
    { signal: "item", pattern: /RadioGroup\.Item|RadioGroup\.Option|Ariakit\.Radio|MenuItemCheckbox|MenuItemRadio|Item|Option/i, evidence: "item evidence was detected." },
    { signal: "indicator", pattern: /Indicator|CheckboxCheck|forceMount/i, evidence: "indicator evidence was detected." },
    { signal: "thumb", pattern: /Switch\.Thumb|Thumb/i, evidence: "switch thumb evidence was detected." },
    { signal: "label", pattern: /Label|aria-label|aria-labelledby/i, evidence: "label evidence was detected." },
    { signal: "description", pattern: /Description|aria-describedby/i, evidence: "description evidence was detected." },
    { signal: "hidden-input", pattern: /BubbleInput|hidden|type\s*=\s*["']checkbox|type\s*=\s*["']radio|name\s*=|form\s*=/i, evidence: "hidden/native input bridge evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function checkboxRadioSwitchReadinessStateSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["stateSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "checked", pattern: /checked\s*=|checked\b|aria-checked/i, evidence: "checked state evidence was detected." },
    { signal: "default-checked", pattern: /defaultChecked/i, evidence: "default checked evidence was detected." },
    { signal: "on-checked-change", pattern: /onCheckedChange/i, evidence: "onCheckedChange evidence was detected." },
    { signal: "on-change", pattern: /onChange|onValueChange/i, evidence: "change handler evidence was detected." },
    { signal: "value", pattern: /value\s*=|value\b/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "set-value", pattern: /setValue|setChecked|setRadio|setEnabled|useState/i, evidence: "set value evidence was detected." },
    { signal: "indeterminate", pattern: /indeterminate|mixed/i, evidence: "indeterminate/mixed evidence was detected." },
    { signal: "data-state", pattern: /data-state|data-headlessui-state|data-checked/i, evidence: "data-state evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function checkboxRadioSwitchReadinessFormSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["formSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /name\s*=/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /form\s*=|<form\b/i, evidence: "form evidence was detected." },
    { signal: "required", pattern: /required/i, evidence: "required evidence was detected." },
    { signal: "disabled", pattern: /disabled|aria-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "hidden-input", pattern: /BubbleInput|hidden|type\s*=\s*["']checkbox|type\s*=\s*["']radio|name\s*=|form\s*=|overrides=\{\{ type: ['"]checkbox/i, evidence: "hidden/native input evidence was detected." },
    { signal: "field", pattern: /Field|FormCheckbox|form field/i, evidence: "field wrapper evidence was detected." },
    { signal: "value", pattern: /value\s*=|defaultValue/i, evidence: "form value evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function checkboxRadioSwitchReadinessInteractionSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "click", pattern: /userEvent\.click|onClick|click/i, evidence: "click evidence was detected." },
    { signal: "keyboard", pattern: /userEvent\.keyboard|keyboard|onKeyDown|tabIndex/i, evidence: "keyboard evidence was detected." },
    { signal: "space-key", pattern: /\{Space\}|Space|space key|onKeyDown/i, evidence: "space key evidence was detected." },
    { signal: "arrow-keys", pattern: /Arrow(Up|Down|Left|Right)|rovingFocus|orientation/i, evidence: "arrow key evidence was detected." },
    { signal: "roving-focus", pattern: /rovingFocus|RovingFocus|RadioGroup|orientation/i, evidence: "roving focus evidence was detected." },
    { signal: "focus", pattern: /focus|tabIndex|focus-visible/i, evidence: "focus evidence was detected." },
    { signal: "disabled-control", pattern: /disabled|aria-disabled/i, evidence: "disabled control evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function checkboxRadioSwitchReadinessAccessibilitySignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-checkbox", pattern: /role\s*=\s*["']checkbox|getByRole\(["']checkbox|Checkbox\b/i, evidence: "checkbox role evidence was detected." },
    { signal: "role-radio", pattern: /role\s*=\s*["']radio|getByRole\(["']radio|Radio\b/i, evidence: "radio role evidence was detected." },
    { signal: "role-switch", pattern: /role\s*=\s*["']switch|getByRole\(["']switch|Switch\b/i, evidence: "switch role evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked|toHaveAttribute\(["']aria-checked/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "focus-management", pattern: /focus|tabIndex|Field|Label|Description|rovingFocus/i, evidence: "focus management evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function checkboxRadioSwitchReadinessImplementationSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "group-context", pattern: /GroupContext|createContext<StateDefinition|null>|createContext\(null\)/i, evidence: "group context evidence was detected." },
    { signal: "label-provider", pattern: /LabelProvider|useLabels|Switch\.Label|SwitchLabel/i, evidence: "label provider evidence was detected." },
    { signal: "description-provider", pattern: /DescriptionProvider|useDescriptions|Switch\.Description|SwitchDescription/i, evidence: "description provider evidence was detected." },
    { signal: "label-click-focus", pattern: /switchElement\.click|switchElement\?\.click|focus\(\{ preventScroll: true \}\)/i, evidence: "label click/focus evidence was detected." },
    { signal: "provided-id", pattern: /useProvidedId|providedId|headlessui-switch/i, evidence: "provided id evidence was detected." },
    { signal: "provided-disabled", pattern: /useDisabled|providedDisabled/i, evidence: "provided disabled evidence was detected." },
    { signal: "controllable-value", pattern: /useControllable|controlledChecked|controlledOnChange/i, evidence: "controllable value evidence was detected." },
    { signal: "default-value-hook", pattern: /useDefaultValue|defaultChecked/i, evidence: "default value hook evidence was detected." },
    { signal: "sync-refs", pattern: /useSyncRefs|switchRef/i, evidence: "sync refs evidence was detected." },
    { signal: "group-set-switch", pattern: /setSwitch|setSwitchElement|groupContext\.setSwitch/i, evidence: "group set switch evidence was detected." },
    { signal: "disposables-next-frame", pattern: /useDisposables|nextFrame/i, evidence: "disposables next frame evidence was detected." },
    { signal: "changing-state", pattern: /changing|setChanging/i, evidence: "changing state evidence was detected." },
    { signal: "toggle-onchange", pattern: /toggle[\s\S]{0,180}onChange|onChange\?\.\(!checked\)/i, evidence: "toggle onChange evidence was detected." },
    { signal: "disabled-react-issue", pattern: /isDisabledReactIssue7711/i, evidence: "disabled React issue guard evidence was detected." },
    { signal: "click-prevent-default", pattern: /handleClick[\s\S]{0,180}preventDefault|onClick[\s\S]{0,180}preventDefault/i, evidence: "click preventDefault evidence was detected." },
    { signal: "space-toggle", pattern: /Keys\.Space[\s\S]{0,180}toggle|Space[\s\S]{0,180}toggle/i, evidence: "Space toggle evidence was detected." },
    { signal: "enter-attempt-submit", pattern: /Keys\.Enter[\s\S]{0,180}attemptSubmit|Enter[\s\S]{0,180}attemptSubmit/i, evidence: "Enter attemptSubmit evidence was detected." },
    { signal: "keypress-prevent-default", pattern: /handleKeyPress[\s\S]{0,120}preventDefault|onKeyPress[\s\S]{0,120}preventDefault/i, evidence: "keypress preventDefault evidence was detected." },
    { signal: "labelled-by", pattern: /useLabelledBy|labelledBy|aria-labelledby/i, evidence: "labelled-by evidence was detected." },
    { signal: "described-by", pattern: /useDescribedBy|describedBy|aria-describedby/i, evidence: "described-by evidence was detected." },
    { signal: "focus-ring", pattern: /useFocusRing|isFocusVisible/i, evidence: "focus ring evidence was detected." },
    { signal: "hover-state", pattern: /useHover|isHovered/i, evidence: "hover state evidence was detected." },
    { signal: "active-press", pattern: /useActivePress|pressed/i, evidence: "active press evidence was detected." },
    { signal: "slot-state", pattern: /useSlot[\s\S]{0,240}checked|slot[\s\S]{0,160}changing/i, evidence: "slot state evidence was detected." },
    { signal: "role-switch", pattern: /role:\s*['"]switch|role\s*=\s*["']switch/i, evidence: "role switch evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked/i, evidence: "aria-checked evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "resolve-button-type", pattern: /useResolveButtonType/i, evidence: "resolve button type evidence was detected." },
    { signal: "tab-index-normalize", pattern: /tabIndex[\s\S]{0,100}\?\?\s*0|tabIndex=\{0\}|props\.tabIndex === -1/i, evidence: "tab index normalization evidence was detected." },
    { signal: "form-fields", pattern: /FormFields/i, evidence: "FormFields evidence was detected." },
    { signal: "hidden-checkbox-override", pattern: /overrides=\{\{ type:\s*['"]checkbox|overrides[\s\S]{0,120}checked/i, evidence: "hidden checkbox override evidence was detected." },
    { signal: "form-reset", pattern: /onReset|reset\s*=\s*useCallback|defaultChecked[\s\S]{0,160}onChange/i, evidence: "form reset evidence was detected." },
    { signal: "object-assign-subcomponents", pattern: /Object\.assign\(SwitchRoot|SwitchGroup|SwitchLabel|SwitchDescription/i, evidence: "object assign subcomponents evidence was detected." },
    { signal: "checkbox-indeterminate", pattern: /indeterminate/i, evidence: "Headless UI Checkbox indeterminate evidence was detected." },
    { signal: "checkbox-mixed-aria", pattern: /aria-checked[\s\S]{0,120}mixed|mixed[\s\S]{0,120}aria-checked/i, evidence: "Headless UI Checkbox mixed aria-checked evidence was detected." },
    { signal: "checkbox-form-value-on", pattern: /data:\s*\{\s*\[name\]:\s*value\s*\|\|\s*['"]on|data=\{\{\s*\[name\]:\s*['"]on/i, evidence: "Headless UI Checkbox default form value evidence was detected." },
    { signal: "radio-data-context", pattern: /RadioGroupDataContext/i, evidence: "Headless UI RadioGroup data context evidence was detected." },
    { signal: "radio-actions-context", pattern: /RadioGroupActionsContext/i, evidence: "Headless UI RadioGroup actions context evidence was detected." },
    { signal: "radio-register-option", pattern: /RegisterOption|registerOption|actions\.registerOption/i, evidence: "Headless UI RadioGroup option registration evidence was detected." },
    { signal: "radio-unregister-option", pattern: /UnregisterOption|unregisterOption/i, evidence: "Headless UI RadioGroup option unregistration evidence was detected." },
    { signal: "radio-comparator", pattern: /useByComparator|compare\(/i, evidence: "Headless UI RadioGroup comparator evidence was detected." },
    { signal: "radio-first-option", pattern: /firstOption/i, evidence: "Headless UI RadioGroup first option evidence was detected." },
    { signal: "radio-contains-checked-option", pattern: /containsCheckedOption/i, evidence: "Headless UI RadioGroup checked option tracking evidence was detected." },
    { signal: "radio-trigger-change", pattern: /triggerChange|actions\.change|change:\s*triggerChange/i, evidence: "Headless UI RadioGroup trigger change evidence was detected." },
    { signal: "radio-keydown-arrow-focus", pattern: /Keys\.Arrow(Left|Right|Up|Down)[\s\S]{0,260}focusIn|focusIn[\s\S]{0,260}Focus\.(Previous|Next)/i, evidence: "Headless UI RadioGroup arrow focus evidence was detected." },
    { signal: "radio-enter-submit", pattern: /Keys\.Enter[\s\S]{0,160}attemptSubmit|Enter[\s\S]{0,160}attemptSubmit/i, evidence: "Headless UI RadioGroup Enter submit evidence was detected." },
    { signal: "radio-space-change", pattern: /Keys\.Space[\s\S]{0,220}triggerChange|Space[\s\S]{0,220}triggerChange/i, evidence: "Headless UI RadioGroup Space change evidence was detected." },
    { signal: "radio-group-role", pattern: /role:\s*['"]radiogroup|role\s*=\s*["']radiogroup/i, evidence: "Headless UI RadioGroup role evidence was detected." },
    { signal: "radio-hidden-field-override", pattern: /overrides=\{\{ type:\s*['"]radio|overrides[\s\S]{0,120}type:\s*['"]radio/i, evidence: "Headless UI RadioGroup hidden radio field evidence was detected." },
    { signal: "radio-option-tab-index", pattern: /containsCheckedOption[\s\S]{0,220}tabIndex|tabIndex:\s*\(\(\)\s*=>|data\.tabIndex/i, evidence: "Headless UI RadioGroup option tabIndex evidence was detected." },
    { signal: "radio-option-focus-after-change", pattern: /internalRadioRef\.current\?\.focus|internalOptionRef\.current\?\.focus/i, evidence: "Headless UI RadioGroup focus after change evidence was detected." },
    { signal: "radio-label-description-providers", pattern: /RadioGroup\.Label|RadioGroupLabel|RadioGroupDescription|LabelProvider[\s\S]{0,160}DescriptionProvider|DescriptionProvider[\s\S]{0,160}LabelProvider/i, evidence: "Headless UI RadioGroup label/description provider evidence was detected." },
    { signal: "radio-object-assign-subcomponents", pattern: /Object\.assign\(RadioGroup|Object\.assign\(RadioGroupRoot|RadioGroupOption|RadioGroupLabel|RadioGroupDescription/i, evidence: "Headless UI RadioGroup static subcomponent assignment evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function checkboxRadioSwitchReadinessTestSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["testSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|vi\.|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent\./i, evidence: "user-event evidence was detected." },
    { signal: "role-test", pattern: /getByRole|role\s*=/i, evidence: "role test evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|\{Space\}|Arrow(Left|Right|Up|Down)|Tab/i, evidence: "keyboard test evidence was detected." },
    { signal: "attribute-test", pattern: /toHaveAttribute|aria-checked|data-state/i, evidence: "attribute test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|checkbox-radio-switch-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function checkboxRadioSwitchReadinessPackageSignals(sourceFiles: CheckboxRadioSwitchReadinessSourceFile[]): CheckboxRadioSwitchReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CheckboxRadioSwitchReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-checkbox", pattern: /@radix-ui\/react-checkbox/i, evidence: "@radix-ui/react-checkbox dependency evidence was detected." },
    { signal: "@radix-ui/react-radio-group", pattern: /@radix-ui\/react-radio-group/i, evidence: "@radix-ui/react-radio-group dependency evidence was detected." },
    { signal: "@radix-ui/react-switch", pattern: /@radix-ui\/react-switch/i, evidence: "@radix-ui/react-switch dependency evidence was detected." },
    { signal: "@headlessui/react", pattern: /@headlessui\/react/i, evidence: "@headlessui/react dependency evidence was detected." },
    { signal: "@ariakit/react", pattern: /@ariakit\/react/i, evidence: "@ariakit/react dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\./i, evidence: "React evidence was detected." }
  ];
  return checkboxRadioSwitchReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function checkboxRadioSwitchReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CheckboxRadioSwitchReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/checkbox-radio-switch-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSliderProgressReadinessReport(walk: WalkResult): Promise<SliderProgressReadinessReport> {
  const sourceFiles = await sliderProgressReadinessSourceFiles(walk);
  const sliderProgressSetups = sliderProgressReadinessSetups(sourceFiles);
  const frameworkSignals = sliderProgressReadinessFrameworkSignals(sourceFiles);
  const structureSignals = sliderProgressReadinessStructureSignals(sourceFiles);
  const valueSignals = sliderProgressReadinessValueSignals(sourceFiles);
  const interactionSignals = sliderProgressReadinessInteractionSignals(sourceFiles);
  const orientationSignals = sliderProgressReadinessOrientationSignals(sourceFiles);
  const formSignals = sliderProgressReadinessFormSignals(sourceFiles);
  const accessibilitySignals = sliderProgressReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = sliderProgressReadinessMachineSignals(sourceFiles);
  const computedSignals = sliderProgressReadinessComputedSignals(sourceFiles);
  const circleSignals = sliderProgressReadinessCircleSignals(sourceFiles);
  const domSignals = sliderProgressReadinessDomSignals(sourceFiles);
  const apiSignals = sliderProgressReadinessApiSignals(sourceFiles);
  const testSignals = sliderProgressReadinessTestSignals(sourceFiles);
  const packageSignals = sliderProgressReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || sliderProgressSetups.some((item) => item.trackCount + item.thumbCount + item.indicatorCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || sliderProgressSetups.some((item) => item.valueCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || sliderProgressSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || sliderProgressSetups.some((item) => item.testCount > 0);

  const riskQueue: SliderProgressReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document slider, progress, range input, or progressbar boundaries before claiming value-control readiness.",
      why: "Slider/progress readiness starts with concrete root, track, range, thumb, indicator, or native range/progress evidence.",
      relatedHref: "html/slider-progress-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace value/defaultValue, min, max, step, percent, indeterminate, data-state, and data-value behavior.",
      why: "Sliders and progress bars fail through value bounds, precision, and indeterminate-state drift.",
      relatedHref: "html/slider-progress-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Verify slider/progressbar roles and aria-valuenow/min/max/text/orientation/label wiring.",
      why: "Custom range controls must expose value semantics without relying only on visual tracks or transforms.",
      relatedHref: "html/slider-progress-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasValue) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add role, keyboard, pointer, boundary, precision, and attribute tests for slider/progress controls.",
      why: "Static component evidence does not prove dragging, arrow/Home/End/Page key handling, value commit, or progress state updates.",
      relatedHref: "html/slider-progress-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual slider/progress behavior in the analyzed project with trusted component tests or browser QA outside RepoTutor.",
    why: "RepoTutor records slider/progress readiness only; it does not drag thumbs, change values, dispatch pointer/keyboard events, submit forms, mutate stores, animate indicators, or run analyzed project tests.",
    relatedHref: "html/slider-progress-readiness.html"
  });

  return {
    summary: `Slider/progress readiness report: setup ${sliderProgressSetups.length}개, framework signal ${frameworkSignals.length}개, value signal ${valueSignals.length}개, accessibility signal ${accessibilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Slider/progress readiness Radix Slider Progress Zag progress native input range progressbar value min max step orientation aria-valuenow form tests",
    sliderProgressSetups,
    frameworkSignals,
    structureSignals,
    valueSignals,
    interactionSignals,
    orientationSignals,
    formSignals,
    accessibilitySignals,
    machineSignals,
    computedSignals,
    circleSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-slider|Slider\\.Root|Slider\\.Track|Slider\\.Range|Slider\\.Thumb|SliderBubbleInput\" package.json src app packages", purpose: "Find Radix slider boundaries, track/range/thumb structure, and form bubble inputs." },
      { command: "rg \"@radix-ui/react-progress|Progress\\.Root|Progress\\.Indicator|role=.*progressbar|aria-valuenow|aria-valuetext\" package.json src app packages", purpose: "Find Radix/native progress indicators and ARIA value semantics." },
      { command: "rg \"@zag-js/progress|progress\\.machine|progress\\.connect|getTrackProps|getCircleProps|getValueTextProps\" package.json src app packages", purpose: "Find Zag progress package usage, machine/connect setup, track/range/value/circle wiring, and ARIA progressbar props." },
      { command: "rg \"type=.*range|role=.*slider|value=|defaultValue|min=|max=|step=|orientation=|inverted|dir=\" src app packages test", purpose: "Review slider value bounds, orientation, RTL/inversion, and native range controls." },
      { command: "rg \"Home|End|Arrow|PageUp|PageDown|pointer|drag|userEvent\\.keyboard|toHaveAttribute|getByRole\" test tests src app packages", purpose: "Check keyboard, pointer, role, and attribute coverage for value controls." }
    ],
    learnerNextSteps: [
      "먼저 Radix Slider/Progress, native range/progress, 또는 custom role slider/progressbar 중 어떤 family를 쓰는지 확인하세요.",
      "root, track, range, thumb, indicator, provider, bubble input 구조가 어떤 파일에 있는지 정리하세요.",
      "value/defaultValue, min/max, step, percent, indeterminate, data-state, data-value가 controlled state와 일치하는지 확인하세요.",
      "orientation, inverted, dir/RTL, Home/End/Arrow/Page key, pointer drag, disabled behavior를 테스트에서 확인하세요.",
      "role slider/progressbar와 aria-valuenow/min/max/text/orientation/label이 실제 화면 읽기 값과 맞는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 drag, keyboard increment, form submit, progress animation은 원본 프로젝트의 component/browser tests에서 별도 확인하세요."
    ]
  };
}

type SliderProgressReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function sliderProgressReadinessSourceFiles(walk: WalkResult): Promise<SliderProgressReadinessSourceFile[]> {
  const files: SliderProgressReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !sliderProgressReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!sliderProgressReadinessPathSignal(file.relPath) && !sliderProgressReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function sliderProgressReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return sliderProgressReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function sliderProgressReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(slider|sliders|progress|progressbar|range|ranges|meter|meters|settings|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function sliderProgressReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-slider|@radix-ui\/react-progress|@zag-js\/progress|Slider\.Root|Slider\.Track|Slider\.Range|Slider\.Thumb|Progress\.Root|Progress\.Indicator|progress\.machine|progress\.connect|getTrackProps|getCircleProps|SliderBubbleInput|type\s*=\s*["']range|role\s*=\s*["']slider|role\s*=\s*["']progressbar|aria-valuenow|aria-valuetext|data-value|data-max)/i.test(text);
}

function sliderProgressReadinessSetups(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["sliderProgressSetups"] {
  const rows: SliderProgressReadinessReport["sliderProgressSetups"] = [];
  for (const source of sourceFiles) {
    const sliderCount = countMatches(source.text, /(Slider\.Root|SliderImpl|role\s*=\s*["']slider|getByRole\(["']slider|type\s*=\s*["']range|slider\b)/gi);
    const progressCount = countMatches(source.text, /(@zag-js\/progress|progress\.machine|progress\.connect|Progress\.Root|ProgressPrimitive|role\s*=\s*["']progressbar|getByRole\(["']progressbar|<progress\b|progressbar\b)/gi);
    const trackCount = countMatches(source.text, /(Slider\.Track|SliderTrack|getTrackProps|Track\b|track\b)/gi);
    const rangeCount = countMatches(source.text, /(Slider\.Range|SliderRange|getRangeProps|getCircleRangeProps|Range\b|range\b)/gi);
    const thumbCount = countMatches(source.text, /(Slider\.Thumb|SliderThumb|Thumb\b|thumb\b)/gi);
    const indicatorCount = countMatches(source.text, /(Progress\.Indicator|ProgressIndicator|getValueTextProps|getViewProps|getCircleProps|Indicator\b|data-state|data-value|data-max)/gi);
    const valueCount = countMatches(source.text, /(value\s*=|defaultValue|aria-valuenow|aria-valuemin|aria-valuemax|aria-valuetext|min\s*=|max\s*=|step\s*=|getValueLabel|valueAsString|setValue|setToMin|setToMax|data-value|data-max|percent|percentage|indeterminate)/gi);
    const keyboardCount = countMatches(source.text, /(Home|End|ArrowUp|ArrowDown|ArrowLeft|ArrowRight|PageUp|PageDown|userEvent\.keyboard|onKeyDown|keyboard)/gi);
    const orientationCount = countMatches(source.text, /(orientation\s*=|aria-orientation|data-orientation|horizontal|vertical|inverted|dir\s*=|rtl|ltr)/gi);
    const formCount = countMatches(source.text, /(name\s*=|form\s*=|SliderBubbleInput|BubbleInput|type\s*=\s*["']range|<form\b|form change event)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']slider|role\s*=\s*["']progressbar|getByRole|getTrackProps|getCircleProps|getValueTextProps|aria-valuenow|aria-valuemin|aria-valuemax|aria-valuetext|aria-orientation|aria-label|aria-labelledby|aria-live|tabIndex)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|userEvent\.keyboard|getByRole|toHaveAttribute|scientific notation|precision|upload-artifact|slider-progress-traces)/gi);
    const total = sliderCount + progressCount + trackCount + rangeCount + thumbCount + indicatorCount + valueCount + keyboardCount + orientationCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = (sliderCount + progressCount > 0) && valueCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: sliderProgressReadinessFramework(source),
      sliderCount,
      progressCount,
      trackCount,
      rangeCount,
      thumbCount,
      indicatorCount,
      valueCount,
      keyboardCount,
      orientationCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `slider ${sliderCount}, progress ${progressCount}, track ${trackCount}, range ${rangeCount}, thumb ${thumbCount}, indicator ${indicatorCount}, value ${valueCount}, keyboard ${keyboardCount}, orientation ${orientationCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.sliderCount + b.progressCount + b.valueCount + b.accessibilityCount - (a.sliderCount + a.progressCount + a.valueCount + a.accessibilityCount));
}

function sliderProgressReadinessFramework(source: SliderProgressReadinessSourceFile): SliderProgressReadinessReport["sliderProgressSetups"][number]["framework"] {
  if (/@radix-ui\/react-slider|Slider\.Root|Slider\.Track|Slider\.Range|Slider\.Thumb|SliderBubbleInput/i.test(source.text)) return "radix-slider";
  if (/@radix-ui\/react-progress|Progress\.Root|Progress\.Indicator|ProgressProvider/i.test(source.text)) return "radix-progress";
  if (/@zag-js\/progress|progress\.machine|progress\.connect|getTrackProps|getCircleProps/i.test(source.text)) return "zag-progress";
  if (/type\s*=\s*["']range|<progress\b/i.test(source.text)) return "native";
  if (/role\s*=\s*["']slider|role\s*=\s*["']progressbar|aria-valuenow|data-value/i.test(source.text)) return "custom";
  return "unknown";
}

function sliderProgressReadinessFrameworkSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-slider", pattern: /@radix-ui\/react-slider|Slider\.Root|Slider\.Track|Slider\.Range|Slider\.Thumb|SliderBubbleInput/i, evidence: "Radix Slider evidence was detected." },
    { signal: "radix-progress", pattern: /@radix-ui\/react-progress|Progress\.Root|Progress\.Indicator|ProgressProvider/i, evidence: "Radix Progress evidence was detected." },
    { signal: "zag-progress", pattern: /@zag-js\/progress|progress\.machine|progress\.connect|getTrackProps|getCircleProps/i, evidence: "Zag progress evidence was detected." },
    { signal: "native-range", pattern: /type\s*=\s*["']range|<input[^>]+range/i, evidence: "native range input evidence was detected." },
    { signal: "native-progress", pattern: /<progress\b|HTMLProgressElement/i, evidence: "native progress evidence was detected." },
    { signal: "custom", pattern: /role\s*=\s*["']slider|role\s*=\s*["']progressbar|aria-valuenow|data-value/i, evidence: "custom slider/progress evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function sliderProgressReadinessStructureSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["structureSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /Slider\.Root|Progress\.Root|getRootProps|parts\.root|Root\b|role\s*=\s*["']slider|role\s*=\s*["']progressbar|type\s*=\s*["']range|<progress\b/i, evidence: "root evidence was detected." },
    { signal: "track", pattern: /Slider\.Track|SliderTrack|getTrackProps|parts\.track|Track\b|track\b/i, evidence: "track evidence was detected." },
    { signal: "range", pattern: /Slider\.Range|SliderRange|getRangeProps|parts\.range|getCircleRangeProps|Range\b|range\b/i, evidence: "range evidence was detected." },
    { signal: "thumb", pattern: /Slider\.Thumb|SliderThumb|Thumb\b|thumb\b/i, evidence: "thumb evidence was detected." },
    { signal: "indicator", pattern: /Progress\.Indicator|ProgressIndicator|Indicator\b|data-state|data-value|data-max/i, evidence: "indicator evidence was detected." },
    { signal: "provider", pattern: /SliderProvider|ProgressProvider|createSliderScope|createProgressScope|@radix-ui\/react-slider|@radix-ui\/react-progress|Slider\.Root|Progress\.Root/i, evidence: "provider evidence was detected." },
    { signal: "bubble-input", pattern: /SliderBubbleInput|BubbleInput|form change event|type\s*=\s*["']range|name\s*=|form\s*=/i, evidence: "bubble/native input evidence was detected." },
    { signal: "label", pattern: /getLabelProps|parts\.label|label\b/i, evidence: "label evidence was detected." },
    { signal: "value-text", pattern: /getValueTextProps|valueText|aria-live|valueAsString/i, evidence: "value text evidence was detected." },
    { signal: "view", pattern: /getViewProps|parts\.view|ProgressState|data-state/i, evidence: "view evidence was detected." },
    { signal: "circle", pattern: /getCircleProps|parts\.circle|circle\b|<circle\b/i, evidence: "circle evidence was detected." },
    { signal: "circle-track", pattern: /getCircleTrackProps|circleTrack|parts\.circleTrack/i, evidence: "circle track evidence was detected." },
    { signal: "circle-range", pattern: /getCircleRangeProps|circleRange|parts\.circleRange/i, evidence: "circle range evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function sliderProgressReadinessValueSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["valueSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /value\s*=|value\b|aria-valuenow/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue/i, evidence: "default value evidence was detected." },
    { signal: "min", pattern: /min\s*=|aria-valuemin|\bmin\b/i, evidence: "minimum value evidence was detected." },
    { signal: "max", pattern: /max\s*=|aria-valuemax|\bmax\b/i, evidence: "maximum value evidence was detected." },
    { signal: "step", pattern: /step\s*=|\bstep\b|minStepsBetweenThumbs/i, evidence: "step evidence was detected." },
    { signal: "percentage", pattern: /percent|percentage|Math\.round|getValueLabel|%/i, evidence: "percentage/value label evidence was detected." },
    { signal: "indeterminate", pattern: /indeterminate|value\s*=\s*null|data-state=["']indeterminate|getProgressState/i, evidence: "indeterminate evidence was detected." },
    { signal: "data-state", pattern: /data-state|getRootProps|getTrackProps|getRangeProps|getViewProps|getCircleRangeProps/i, evidence: "data-state evidence was detected." },
    { signal: "data-value", pattern: /data-value|data-max|getRootProps|getTrackProps|getCircleProps/i, evidence: "data-value/data-max evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|percentAsString|translations\?\.value|getValueTextProps/i, evidence: "value string evidence was detected." },
    { signal: "set-value", pattern: /setValue|VALUE\.SET|onValueChange/i, evidence: "set value evidence was detected." },
    { signal: "set-to-min-max", pattern: /setToMin|setToMax|prop\(["']min["']\)|prop\(["']max["']\)/i, evidence: "set min/max evidence was detected." },
    { signal: "locale-format", pattern: /Intl\.NumberFormat|formatOptions|locale|formatter/i, evidence: "locale/formatter evidence was detected." },
    { signal: "translation-value", pattern: /translations|ValueTranslationDetails|loading\.\.\.|formatter\.format/i, evidence: "translation value evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function sliderProgressReadinessInteractionSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer", pattern: /pointer|onPointer|onSlide|drag|thumb/i, evidence: "pointer/drag evidence was detected." },
    { signal: "keyboard", pattern: /keyboard|onKeyDown|userEvent\.keyboard|Home|End|Arrow|PageUp|PageDown/i, evidence: "keyboard evidence was detected." },
    { signal: "home-end", pattern: /Home|End|onHomeKeyDown|onEndKeyDown/i, evidence: "Home/End key evidence was detected." },
    { signal: "arrow-keys", pattern: /ArrowUp|ArrowDown|ArrowLeft|ArrowRight|ARROW_KEYS/i, evidence: "arrow key evidence was detected." },
    { signal: "page-keys", pattern: /PageUp|PageDown|PAGE_KEYS/i, evidence: "page key evidence was detected." },
    { signal: "disabled", pattern: /disabled|aria-disabled/i, evidence: "disabled evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function sliderProgressReadinessOrientationSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["orientationSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["orientationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "horizontal", pattern: /horizontal|data-orientation=["']horizontal|orientation=["']horizontal/i, evidence: "horizontal orientation evidence was detected." },
    { signal: "vertical", pattern: /vertical|data-orientation=["']vertical|orientation=["']vertical/i, evidence: "vertical orientation evidence was detected." },
    { signal: "inverted", pattern: /inverted|isSlidingFromRight|isSlidingFromBottom/i, evidence: "inverted direction evidence was detected." },
    { signal: "rtl-dir", pattern: /dir\s*=|useDirection|rtl|ltr|Direction/i, evidence: "RTL/direction evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "orientation", "signal");
}

function sliderProgressReadinessFormSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["formSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /name\s*=/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /form\s*=|<form\b|closest\(["']form["']\)/i, evidence: "form evidence was detected." },
    { signal: "bubble-input", pattern: /SliderBubbleInput|BubbleInput|form change event|Bubble value change|Slider\.Root|name\s*=|form\s*=/i, evidence: "bubble input evidence was detected." },
    { signal: "input-range", pattern: /type\s*=\s*["']range/i, evidence: "input range evidence was detected." },
    { signal: "value", pattern: /value\s*=|defaultValue|aria-valuenow/i, evidence: "form value evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function sliderProgressReadinessAccessibilitySignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-slider", pattern: /role\s*=\s*["']slider|getByRole\(["']slider|type\s*=\s*["']range|SliderThumbTrigger/i, evidence: "slider role evidence was detected." },
    { signal: "role-progressbar", pattern: /role\s*=\s*["']progressbar|getByRole\(["']progressbar|<progress\b|Progress\.Root|getTrackProps|getCircleProps/i, evidence: "progressbar role evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow|toHaveAttribute\(["']aria-valuenow|getTrackProps|getCircleProps/i, evidence: "aria-valuenow evidence was detected." },
    { signal: "aria-valuemin", pattern: /aria-valuemin|toHaveAttribute\(["']aria-valuemin|getTrackProps|getCircleProps/i, evidence: "aria-valuemin evidence was detected." },
    { signal: "aria-valuemax", pattern: /aria-valuemax|toHaveAttribute\(["']aria-valuemax|getTrackProps|getCircleProps/i, evidence: "aria-valuemax evidence was detected." },
    { signal: "aria-valuetext", pattern: /aria-valuetext|getValueLabel|valueAsString|getValueTextProps|translations/i, evidence: "aria-valuetext evidence was detected." },
    { signal: "aria-orientation", pattern: /aria-orientation|orientation\s*=/i, evidence: "aria orientation evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|aria-labelledby|getLabelProps|aria-label/i, evidence: "aria label evidence was detected." },
    { signal: "aria-live", pattern: /aria-live|getValueTextProps/i, evidence: "aria-live evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function sliderProgressReadinessMachineSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["machineSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine|progress\.machine|@zag-js\/progress/i, evidence: "Zag createMachine/progress.machine evidence was detected." },
    { signal: "idle-state", pattern: /@zag-js\/progress|progress\.machine|initialState\(\)[\s\S]{0,80}idle|state:\s*["']idle["']|idle/i, evidence: "idle state evidence was detected." },
    { signal: "value-set-event", pattern: /@zag-js\/progress|progress\.machine|VALUE\.SET|send\(\{\s*type:\s*["']VALUE\.SET["']|setValue|setToMin|setToMax/i, evidence: "VALUE.SET event evidence was detected." },
    { signal: "set-value-action", pattern: /setValue|actions:\s*\[[^\]]*setValue|setValue:\s*\(/i, evidence: "setValue action evidence was detected." },
    { signal: "validate-context-action", pattern: /@zag-js\/progress|progress\.machine|validateContext|isValidMax|isValidMin|isValidNumber/i, evidence: "validate context evidence was detected." },
    { signal: "bindable-value", pattern: /bindable<|bindable\(|onValueChange|context\.get\(["']value["']\)/i, evidence: "bindable value evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function sliderProgressReadinessComputedSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["computedSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-indeterminate", pattern: /isIndeterminate|value\s*===\s*null|value == null|indeterminate/i, evidence: "indeterminate computed evidence was detected." },
    { signal: "percent", pattern: /percent|percentAsString|getValuePercent|--percent/i, evidence: "percent computed evidence was detected." },
    { signal: "formatter", pattern: /formatter|Intl\.NumberFormat|formatOptions|resolvedOptions/i, evidence: "formatter evidence was detected." },
    { signal: "is-horizontal", pattern: /@zag-js\/progress|progress\.machine|isHorizontal|orientation\W+horizontal|orientation:\s*["']horizontal["']/i, evidence: "horizontal computed evidence was detected." },
    { signal: "progress-state", pattern: /getProgressState|ProgressState|indeterminate|complete|loading/i, evidence: "progress state evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function sliderProgressReadinessCircleSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["circleSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["circleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "circle-root", pattern: /getCircleProps|parts\.circle|circleProps\.root|<svg/i, evidence: "circle root evidence was detected." },
    { signal: "circle-track", pattern: /getCircleTrackProps|circleTrack|parts\.circleTrack|circleProps\.track/i, evidence: "circle track evidence was detected." },
    { signal: "circle-range", pattern: /getCircleRangeProps|circleRange|parts\.circleRange|circleProps\.range/i, evidence: "circle range evidence was detected." },
    { signal: "dasharray", pattern: /@zag-js\/progress|progress\.machine|strokeDasharray|--circumference|dasharray/i, evidence: "stroke dasharray evidence was detected." },
    { signal: "dashoffset", pattern: /@zag-js\/progress|progress\.machine|strokeDashoffset|--offset|dashoffset/i, evidence: "stroke dashoffset evidence was detected." },
    { signal: "rotate", pattern: /@zag-js\/progress|progress\.machine|rotate\(-90deg\)|transform:\s*["']rotate|transformOrigin/i, evidence: "circle rotation evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "circle", "signal");
}

function sliderProgressReadinessDomSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["domSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|id:\s*dom\.getRootId|getRootProps|ids\?\.root/i, evidence: "root id evidence was detected." },
    { signal: "track-id", pattern: /getTrackId|id:\s*dom\.getTrackId|getTrackProps|ids\?\.track/i, evidence: "track id evidence was detected." },
    { signal: "label-id", pattern: /getLabelId|id:\s*dom\.getLabelId|getLabelProps|ids\?\.label/i, evidence: "label id evidence was detected." },
    { signal: "circle-id", pattern: /getCircleId|id:\s*dom\.getCircleId|getCircleProps|ids\?\.circle/i, evidence: "circle id evidence was detected." },
    { signal: "data-max", pattern: /data-max|getRootProps|getTrackProps|getCircleProps/i, evidence: "data-max evidence was detected." },
    { signal: "data-value", pattern: /data-value|getRootProps|getTrackProps|getCircleProps/i, evidence: "data-value evidence was detected." },
    { signal: "data-state", pattern: /data-state|getRootProps|getTrackProps|getRangeProps|getCircleRangeProps|getViewProps|getProgressState/i, evidence: "data-state evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation|orientation/i, evidence: "data-orientation evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function sliderProgressReadinessApiSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["apiSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-api", pattern: /\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "value-as-string-api", pattern: /valueAsString/i, evidence: "valueAsString API evidence was detected." },
    { signal: "min-api", pattern: /\bmin\b/i, evidence: "min API evidence was detected." },
    { signal: "max-api", pattern: /\bmax\b/i, evidence: "max API evidence was detected." },
    { signal: "percent-api", pattern: /\bpercent\b/i, evidence: "percent API evidence was detected." },
    { signal: "percent-as-string-api", pattern: /percentAsString/i, evidence: "percentAsString API evidence was detected." },
    { signal: "indeterminate-api", pattern: /indeterminate|isIndeterminate/i, evidence: "indeterminate API evidence was detected." },
    { signal: "set-value-api", pattern: /setValue\(|VALUE\.SET/i, evidence: "setValue API evidence was detected." },
    { signal: "set-to-max-api", pattern: /setToMax/i, evidence: "setToMax API evidence was detected." },
    { signal: "set-to-min-api", pattern: /setToMin/i, evidence: "setToMin API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root prop getter evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label prop getter evidence was detected." },
    { signal: "value-text-props", pattern: /getValueTextProps/i, evidence: "value text prop getter evidence was detected." },
    { signal: "track-props", pattern: /getTrackProps/i, evidence: "track prop getter evidence was detected." },
    { signal: "range-props", pattern: /getRangeProps/i, evidence: "range prop getter evidence was detected." },
    { signal: "view-props", pattern: /getViewProps/i, evidence: "view prop getter evidence was detected." },
    { signal: "circle-props", pattern: /getCircleProps/i, evidence: "circle prop getter evidence was detected." },
    { signal: "circle-track-props", pattern: /getCircleTrackProps/i, evidence: "circle track prop getter evidence was detected." },
    { signal: "circle-range-props", pattern: /getCircleRangeProps/i, evidence: "circle range prop getter evidence was detected." },
    { signal: "progressbar-role", pattern: /role:\s*["']progressbar["']|role=["']progressbar["']/i, evidence: "progressbar role evidence was detected." },
    { signal: "data-max", pattern: /data-max/i, evidence: "data-max API attribute evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value API attribute evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API attribute evidence was detected." },
    { signal: "data-orientation", pattern: /data-orientation/i, evidence: "data-orientation API attribute evidence was detected." },
    { signal: "aria-valuemin", pattern: /aria-valuemin/i, evidence: "aria-valuemin evidence was detected." },
    { signal: "aria-valuemax", pattern: /aria-valuemax/i, evidence: "aria-valuemax evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "aria-valuenow evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-live", pattern: /aria-live/i, evidence: "aria-live evidence was detected." },
    { signal: "percent-css-var", pattern: /--percent/i, evidence: "percent CSS variable evidence was detected." },
    { signal: "circle-css-vars", pattern: /--radius|--size|--thickness|--circumference/i, evidence: "circle CSS variable evidence was detected." },
    { signal: "circle-dasharray", pattern: /strokeDasharray/i, evidence: "circle dasharray evidence was detected." },
    { signal: "circle-dashoffset", pattern: /strokeDashoffset/i, evidence: "circle dashoffset evidence was detected." },
    { signal: "view-hidden-state", pattern: /hidden:\s*props\.state|hidden=.*state/i, evidence: "view hidden state evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "API", "signal");
}

function sliderProgressReadinessTestSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["testSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|Home|End|Arrow|PageUp|PageDown/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|role\s*=/i, evidence: "role test evidence was detected." },
    { signal: "attribute-test", pattern: /toHaveAttribute|aria-valuenow|data-state|value/i, evidence: "attribute test evidence was detected." },
    { signal: "precision-test", pattern: /scientific notation|precision|1e-|roundValue|getDecimalCount|step/i, evidence: "precision/step evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|slider-progress-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function sliderProgressReadinessPackageSignals(sourceFiles: SliderProgressReadinessSourceFile[]): SliderProgressReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SliderProgressReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-slider", pattern: /@radix-ui\/react-slider/i, evidence: "@radix-ui/react-slider dependency evidence was detected." },
    { signal: "@radix-ui/react-progress", pattern: /@radix-ui\/react-progress/i, evidence: "@radix-ui/react-progress dependency evidence was detected." },
    { signal: "@zag-js/progress", pattern: /@zag-js\/progress/i, evidence: "@zag-js/progress dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|parts\.|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|progress\.machine/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|dom\.getRootId|dom\.getTrackId|dom\.getLabelId|dom\.getCircleId/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|NormalizeProps|PropTypes|OrientationProperty/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|getValuePercent|isNumber|createSplitProps/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\./i, evidence: "React evidence was detected." }
  ];
  return sliderProgressReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function sliderProgressReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SliderProgressReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/slider-progress-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
