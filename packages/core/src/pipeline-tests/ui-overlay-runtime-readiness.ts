// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

describe("RepoTutor core pipeline - ui-overlay-runtime-readiness", () => {
  it("detects Zag cascade select machine readiness without opening real poppers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-cascade-select-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-cascade-select-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-cascade-select-machine.tsx"), [
      "import * as cascadeSelect from '@zag-js/cascade-select';",
      "import { collection } from '@zag-js/cascade-select';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const continentCollection = collection({ rootNode: { value: 'ROOT', children: [{ value: 'asia', label: 'Asia', children: [{ value: 'korea', label: 'Korea' }] }] } });",
      "",
      "export function ZagCascadeSelectMachineReadiness() {",
      "  const service = useMachine(cascadeSelect.machine, {",
      "    id: 'region-cascade-machine',",
      "    name: 'region',",
      "    form: 'checkout',",
      "    collection: continentCollection,",
      "    defaultOpen: false,",
      "    defaultValue: [],",
      "    defaultHighlightedValue: [],",
      "    value: [['asia', 'korea']],",
      "    highlightedValue: ['asia'],",
      "    multiple: true,",
      "    required: true,",
      "    disabled: false,",
      "    readOnly: false,",
      "    invalid: false,",
      "    closeOnSelect: true,",
      "    loopFocus: false,",
      "    highlightTrigger: 'click',",
      "    allowParentSelection: false,",
      "    positioning: { placement: 'bottom-start', gutter: 8 },",
      "    scrollToIndexFn: console.info,",
      "    formatValue: (items) => items.map((path) => path.map((item) => item.label).join(' / ')).join(', '),",
      "    onValueChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onOpenChange: console.info,",
      "    onFocusOutside: console.warn,",
      "    onPointerDownOutside: console.warn,",
      "    onInteractOutside: console.warn",
      "  });",
      "  const api = cascadeSelect.connect(service, normalizeProps);",
      "  const rootItem = continentCollection.rootNode.children[0];",
      "  api.collection; api.open; api.focused; api.multiple; api.disabled; api.value; api.highlightedValue; api.highlightedItems; api.selectedItems; api.hasSelectedItems; api.empty; api.valueAsString;",
      "  api.reposition({ placement: 'bottom-end' }); api.focus(); api.setOpen(true); api.setHighlightValue(['asia']); api.clearHighlightValue(); api.setValue([['asia']]); api.selectValue(['asia', 'korea']); api.clearValue(['asia']); api.getItemState({ item: rootItem, indexPath: [0], value: ['asia'] });",
      "  const machineEvidence = 'createMachine CascadeSelectSchema closeOnSelect true loopFocus false defaultValue [] defaultHighlightedValue [] defaultOpen false multiple false highlightTrigger click allowParentSelection false positioning placement bottom-start gutter 8 initialState open idle states idle focused open CONTROLLED.OPEN CONTROLLED.CLOSE TRIGGER.CLICK TRIGGER.FOCUS TRIGGER.BLUR TRIGGER.ENTER TRIGGER.ARROW_UP TRIGGER.ARROW_DOWN TRIGGER.ARROW_LEFT TRIGGER.ARROW_RIGHT CONTENT.HOME CONTENT.END CONTENT.ARROW_DOWN CONTENT.ARROW_UP CONTENT.ARROW_RIGHT CONTENT.ARROW_LEFT CONTENT.ENTER ITEM.CLICK ITEM.POINTER_ENTER ITEM.POINTER_LEAVE POINTER_MOVE GRACE_AREA.CLEAR VALUE.SET VALUE.CLEAR HIGHLIGHTED_VALUE.SET HIGHLIGHTED_VALUE.CLEAR ITEM.SELECT ITEM.CLEAR POSITIONING.SET effects trackFormControlState trackDismissableElement trackFocusVisible computePlacement scrollToHighlightedItems';",
      "  const contextEvidence = 'value bindable defaultValue prop defaultValue value prop value highlightedValue bindable defaultHighlightedValue valueIndexPath highlightedIndexPath highlightedItems selectedItems currentPlacement fieldsetDisabled graceArea isPointerInTransit';",
      "  const computedEvidence = 'isInteractive disabled readOnly valueAsString formatValue selectedItems multiple stringifyNode';",
      "  const effectEvidence = 'trackFormControlState trackFormControl onFieldsetDisabledChange onFormReset trackFocusVisible trackDismissableElement onFocusOutside onPointerDownOutside onInteractOutside onDismiss computePlacement getPlacement currentPlacement scrollToHighlightedItems getInteractionModality setInteractionModality scrollIntoView observeAttributes data-activedescendant';",
      "  const actionEvidence = 'setValue clearValue setHighlightedValue clearHighlightedValue reposition selectItem clearItem selectHighlightedItem highlightFirstItem highlightLastItem highlightNextItem highlightPreviousItem highlightFirstChild highlightParent setInitialFocus focusTriggerEl invokeOnOpen invokeOnClose toggleVisibility highlightFirstSelectedItem createGraceArea clearGraceArea syncInputValue dispatchChangeEvent scrollContentToTop selectedItems highlightedItems onValueChange onHighlightChange';",
      "  const guardEvidence = 'restoreFocus multiple loop isOpenControlled isTriggerClickEvent isTriggerArrowUpEvent isTriggerArrowDownEvent isTriggerEnterEvent hasHighlightedValue isHighlightedFirstItem isHighlightedLastItem shouldCloseOnSelect shouldCloseOnSelectHighlighted canSelectItem canSelectHighlightedItem canNavigateToChild canNavigateToParent isAtRootLevel isHoverHighlight shouldHighlightOnHover hasGraceArea isPointerOutsideGraceArea isPointerNotInAnyItem';",
      "  const domEvidence = 'getRootId getLabelId getControlId getTriggerId getIndicatorId getClearTriggerId getPositionerId getContentId getHiddenInputId getListId getItemId getRootEl getLabelEl getControlEl getTriggerEl getContentEl getHiddenInputEl getListEls getItemEl dispatchInputEvent';",
      "  const apiEvidence = 'collection open focused multiple disabled value highlightedValue highlightedItems selectedItems hasSelectedItems empty valueAsString reposition focus setOpen setHighlightValue clearHighlightValue setValue selectValue clearValue getItemState getRootProps getLabelProps getControlProps getTriggerProps getClearTriggerProps getPositionerProps getContentProps getListProps getIndicatorProps getItemProps getItemTextProps getItemIndicatorProps getValueTextProps getHiddenInputProps role combobox listbox treeitem hidden input aria-controls aria-expanded aria-haspopup aria-activedescendant aria-multiselectable aria-disabled aria-level aria-owns aria-hidden data-disabled data-invalid data-readonly data-focus data-placement data-placeholder-shown data-depth data-selected data-type';",
      "  const packageEvidence = '@zag-js/cascade-select @zag-js/react @zag-js/anatomy @zag-js/collection @zag-js/core @zag-js/dismissable @zag-js/dom-query @zag-js/focus-visible @zag-js/popper @zag-js/rect-utils @zag-js/types @zag-js/utils react';",
      "  return <div {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, guardEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}><label {...api.getLabelProps()}>Region</label><div {...api.getControlProps()}><button {...api.getTriggerProps()}>{api.valueAsString}</button><button {...api.getClearTriggerProps()}>Clear</button><span {...api.getIndicatorProps()}>open</span><span {...api.getValueTextProps()}>{api.valueAsString}</span></div><div {...api.getPositionerProps()}><div {...api.getContentProps()}><div {...api.getListProps({ item: rootItem, indexPath: [0], value: ['asia'] })}><div {...api.getItemProps({ item: rootItem, indexPath: [0], value: ['asia'] })}><span {...api.getItemTextProps({ item: rootItem, indexPath: [0], value: ['asia'] })}>Asia</span><span {...api.getItemIndicatorProps({ item: rootItem, indexPath: [0], value: ['asia'] })}>selected</span></div></div></div></div><input {...api.getHiddenInputProps()} /></div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/cascade-select": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/collection": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/focus-visible": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/rect-utils": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest",
        "react-dom": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "cascade-select-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-props", "idle-state", "focused-state", "open-state", "controlled-open-event", "controlled-close-event", "trigger-events", "content-key-events", "item-events", "value-events", "highlight-events", "positioning-event", "track-form-control-effect", "open-effects"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["value-context", "highlighted-value-context", "value-index-path-context", "highlighted-index-path-context", "highlighted-items-context", "selected-items-context", "current-placement-context", "fieldset-disabled-context", "grace-area-context", "pointer-transit-context"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-interactive", "value-as-string"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-form-control-state", "track-focus-visible", "track-dismissable-element", "compute-placement", "scroll-to-highlighted-items", "observe-activedescendant"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-value", "clear-value", "set-highlighted-value", "clear-highlighted-value", "reposition", "select-item", "clear-item", "select-highlighted-item", "highlight-first-item", "highlight-last-item", "highlight-next-item", "highlight-previous-item", "highlight-first-child", "highlight-parent", "set-initial-focus", "focus-trigger-el", "invoke-on-open", "invoke-on-close", "toggle-visibility", "highlight-first-selected-item", "create-grace-area", "clear-grace-area", "sync-input-value", "dispatch-change-event", "scroll-content-to-top"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["restore-focus", "multiple", "loop", "is-open-controlled", "trigger-event-guards", "has-highlighted-value", "highlight-boundary", "close-on-select", "can-select-item", "can-select-highlighted-item", "navigate-child-parent", "root-level", "hover-highlight", "grace-area", "pointer-not-in-item"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "label-id", "control-id", "trigger-id", "indicator-id", "clear-trigger-id", "positioner-id", "content-id", "hidden-input-id", "list-id", "item-id", "root-el", "label-el", "control-el", "trigger-el", "content-el", "hidden-input-el", "list-els", "item-el", "dispatch-input-event"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["collection", "open", "focused", "multiple", "disabled", "value", "highlighted-value", "highlighted-items", "selected-items", "has-selected-items", "empty", "value-as-string", "reposition", "focus", "set-open", "set-highlight-value", "clear-highlight-value", "set-value", "select-value", "clear-value", "get-item-state", "root-props", "label-props", "control-props", "trigger-props", "clear-trigger-props", "positioner-props", "content-props", "list-props", "indicator-props", "item-props", "item-text-props", "item-indicator-props", "value-text-props", "hidden-input-props", "combobox-role", "listbox-role", "treeitem-role", "hidden-input", "aria-hidden", "data-disabled", "data-invalid", "data-readonly", "data-focus", "data-placement", "data-placeholder-shown", "data-depth", "data-selected", "data-type"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/cascade-select", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react"]));
    const cascadeSelectMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "cascade-select-readiness.md"), "utf8");
    expect(cascadeSelectMarkdown).toContain("Machine Signals");
    expect(cascadeSelectMarkdown).toContain("@zag-js/cascade-select");
    const cascadeSelectHtml = await fs.readFile(path.join(result.session.outputPaths.html, "cascade-select-readiness.html"), "utf8");
    expect(cascadeSelectHtml).toContain("Machine Signals");
    expect(cascadeSelectHtml).toContain("@zag-js/cascade-select");
  });

  it("detects async list readiness without fetching remote data", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-async-list-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-async-list-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-async-list.tsx"), [
      "import * as asyncList from '@zag-js/async-list';",
      "import { useMachine } from '@zag-js/react';",
      "",
      "type Row = { id: string; title: string; status: string };",
      "",
      "export function IssueAsyncList() {",
      "  const service = useMachine(asyncList.machine<Row, string>, {",
      "    id: 'issues-list',",
      "    initialItems: [{ id: '1', title: 'Alpha', status: 'open' }],",
      "    initialFilterText: 'open',",
      "    initialSortDescriptor: { column: 'title', direction: 'ascending' },",
      "    dependencies: ['repo', true, 1],",
      "    autoReload: true,",
      "    load: async ({ signal, cursor, filterText, sortDescriptor }) => {",
      "      signal?.throwIfAborted?.();",
      "      return { items: [{ id: cursor ?? '2', title: filterText, status: sortDescriptor?.direction ?? 'open' }], cursor: cursor ? undefined : 'next-cursor' };",
      "    },",
      "    sort: async ({ items, descriptor, filterText }) => ({ items: items.toSorted((a, b) => String(a[descriptor.column]).localeCompare(String(b[descriptor.column]))).filter((item) => item.title.includes(filterText)) }),",
      "    onSuccess: console.info,",
      "    onError: console.error",
      "  });",
      "  const api = asyncList.connect(service);",
      "  const evidence = 'idle loading sorting RELOAD LOAD_MORE SORT FILTER SUCCESS ERROR ABORT loadIfNeeded performFetch cancelFetch performSort cancelSort clearItems setItems setCursor setError clearError clearCursor setSortDescriptor setFilterText invokeOnSuccess invokeOnError AbortController signal cursor filterText sortDescriptor dependencies autoReload initialItems initialFilterText initialSortDescriptor onSuccess onError seq stale empty hasMore reload loadMore clearFilter append load-test filter-test sort-test abort-test pagination-test async-list-traces upload-artifact';",
      "  api.items; api.cursor; api.loading; api.sorting; api.empty; api.hasMore; api.error; api.filterText; api.sortDescriptor;",
      "  api.reload(); api.loadMore(); api.sort({ column: 'title', direction: 'descending' }); api.setFilterText('closed'); api.clearFilter(); api.abort();",
      "  return <section data-async-list={evidence}>{api.loading ? 'Loading' : api.items.map((item) => item.title).join(', ')}</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-async-list.tsx"), [
      "import { useRef, useState } from 'react';",
      "",
      "export function useCustomAsyncList() {",
      "  const [items, setItems] = useState<Array<{ id: string; title: string }>>([]);",
      "  const [filterText, setFilterText] = useState('');",
      "  const [cursor, setCursor] = useState<string | undefined>('first');",
      "  const [sortDescriptor, setSortDescriptor] = useState({ column: 'title', direction: 'ascending' });",
      "  const [loading, setLoading] = useState(false);",
      "  const [sorting, setSorting] = useState(false);",
      "  const [error, setError] = useState<Error | undefined>();",
      "  const abortRef = useRef<AbortController | null>(null);",
      "  const seqRef = useRef(0);",
      "  const traces = 'custom async list items cursor filter-text sort-descriptor loading sorting error empty has-more load initial-items auto-reload dependencies reload load-more success error cursor has-more append clear-cursor initial-filter-text set-filter-text clear-filter filter-event initial-sort-descriptor sort-function sort-event sorting-state abort-controller abort-event cancel-fetch cancel-sort stale-sequence signal on-success on-error invoke-on-success invoke-on-error load-test filter-test sort-test abort-test pagination-test';",
      "  async function reload() { abortRef.current?.abort(); const abort = new AbortController(); abortRef.current = abort; const seq = seqRef.current + 1; seqRef.current = seq; setLoading(true); try { const response = await fetch('/issues?filter=' + filterText, { signal: abort.signal }); const nextItems = await response.json(); if (seq !== seqRef.current) return; setItems(nextItems); setCursor(undefined); setError(undefined); } catch (err) { if (seq !== seqRef.current) return; setError(err as Error); } finally { setLoading(false); } }",
      "  function loadMore() { setCursor((value) => value ? undefined : 'next'); setItems((value) => [...value, { id: 'more', title: traces }]); }",
      "  function sort() { setSorting(true); setSortDescriptor({ column: 'title', direction: 'descending' }); setItems((value) => [...value].sort((a, b) => a.title.localeCompare(b.title))); setSorting(false); }",
      "  function clearFilter() { setFilterText(''); }",
      "  function abort() { abortRef.current?.abort(); }",
      "  return { items, filterText, cursor, sortDescriptor, loading, sorting, error, empty: items.length === 0, hasMore: cursor != null, reload, loadMore, sort, setFilterText, clearFilter, abort, traces };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "async-list.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "",
      "describe('async list readiness', () => {",
      "  it('covers load, filter, sort, abort, pagination, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    render(<button>load more</button>);",
      "    await user.click(screen.getByRole('button', { name: /load more/i }));",
      "    await user.keyboard('open{Enter}');",
      "    expect('load-test filter-test sort-test abort-test pagination-test async-list-traces upload-artifact').toContain('pagination-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "async-list.yml"), [
      "name: async-list-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- async-list",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: async-list-traces",
      "          path: test-results/async-list"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/async-list": "latest",
        "@zag-js/core": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "async-list-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      asyncListSetups: Array<{ filePath: string; framework: string; loadCount: number; itemCount: number; cursorCount: number; filterCount: number; sortCount: number; stateCount: number; eventCount: number; abortCount: number; sequenceCount: number; callbackCount: number; apiCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      loadSignals: Array<{ signal: string; readiness: string }>;
      paginationSignals: Array<{ signal: string; readiness: string }>;
      filterSignals: Array<{ signal: string; readiness: string }>;
      sortSignals: Array<{ signal: string; readiness: string }>;
      cancellationSignals: Array<{ signal: string; readiness: string }>;
      callbackSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Async list readiness Zag async-list load cursor filter sort abort stale sequence callbacks tests");
    expect(report.asyncListSetups.some((item) => item.filePath === "src/zag-async-list.tsx" && item.framework === "zag-async-list" && item.loadCount > 0 && item.itemCount > 0 && item.cursorCount > 0 && item.filterCount > 0 && item.sortCount > 0 && item.stateCount > 0 && item.eventCount > 0 && item.abortCount > 0 && item.sequenceCount > 0 && item.callbackCount > 0 && item.apiCount > 0)).toBe(true);
    expect(report.asyncListSetups.some((item) => item.filePath === "src/custom-async-list.tsx" && item.framework === "custom" && item.loadCount > 0 && item.itemCount > 0 && item.cursorCount > 0 && item.filterCount > 0 && item.sortCount > 0 && item.stateCount > 0 && item.abortCount > 0 && item.sequenceCount > 0 && item.apiCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-async-list", "custom"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "loading", "sorting", "error", "empty", "has-more"]));
    expect(readySignals(report.loadSignals)).toEqual(expect.arrayContaining(["load", "initial-items", "auto-reload", "dependencies", "reload", "load-more", "success", "error"]));
    expect(readySignals(report.paginationSignals)).toEqual(expect.arrayContaining(["cursor", "has-more", "append", "clear-cursor"]));
    expect(readySignals(report.filterSignals)).toEqual(expect.arrayContaining(["filter-text", "initial-filter-text", "set-filter-text", "clear-filter", "filter-event"]));
    expect(readySignals(report.sortSignals)).toEqual(expect.arrayContaining(["sort-descriptor", "initial-sort-descriptor", "sort-function", "sort-event", "sorting-state"]));
    expect(readySignals(report.cancellationSignals)).toEqual(expect.arrayContaining(["abort-controller", "abort-event", "cancel-fetch", "cancel-sort", "stale-sequence", "signal"]));
    expect(readySignals(report.callbackSignals)).toEqual(expect.arrayContaining(["on-success", "on-error", "invoke-on-success", "invoke-on-error"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["items", "cursor", "loading", "sorting", "empty", "has-more", "error", "abort", "reload", "load-more", "sort", "set-filter-text", "clear-filter"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "load-test", "filter-test", "sort-test", "abort-test", "pagination-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/async-list", "@zag-js/core", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/async-list"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records async list readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "async-list-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "async-list-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "async-list-readiness.html"))).resolves.toBeUndefined();
    const asyncListMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "async-list-readiness.md"), "utf8");
    expect(asyncListMarkdown).toContain("Async List Readiness");
    expect(asyncListMarkdown).toContain("@zag-js/async-list");
    const asyncListHtml = await fs.readFile(path.join(result.session.outputPaths.html, "async-list-readiness.html"), "utf8");
    expect(asyncListHtml).toContain("async-list-readiness-card");
    expect(asyncListHtml).toContain("data-source-pattern=\"AsyncList\"");
    expect(asyncListHtml).toContain("RepoTutor records async list readiness only");
  });

  it("detects Zag async list machine readiness without fetching remote data", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-async-list-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-async-list-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-async-list-machine.tsx"), [
      "import * as asyncList from '@zag-js/async-list';",
      "import { useMachine } from '@zag-js/react';",
      "",
      "type Row = { id: string; title: string; status: string };",
      "",
      "export function ZagAsyncListMachineReadiness() {",
      "  const service = useMachine(asyncList.machine<Row, string>, {",
      "    id: 'issues-list-machine',",
      "    initialItems: [{ id: '1', title: 'Alpha', status: 'open' }],",
      "    initialFilterText: 'open',",
      "    initialSortDescriptor: { column: 'title', direction: 'ascending' },",
      "    dependencies: ['repo', true, 1],",
      "    autoReload: true,",
      "    load: async ({ signal, cursor, filterText, sortDescriptor }) => {",
      "      signal?.throwIfAborted?.();",
      "      return { items: [{ id: cursor ?? '2', title: filterText, status: sortDescriptor?.direction ?? 'open' }], cursor: cursor ? undefined : 'next-cursor' };",
      "    },",
      "    sort: async ({ items, descriptor, filterText }) => ({ items: items.filter((item) => item.title.includes(filterText)).toSorted((a, b) => String(a[descriptor.column]).localeCompare(String(b[descriptor.column]))) }),",
      "    onSuccess: console.info,",
      "    onError: console.error",
      "  });",
      "  const api = asyncList.connect(service);",
      "  api.items; api.sortDescriptor; api.loading; api.sorting; api.empty; api.hasMore; api.error; api.filterText; api.cursor;",
      "  api.abort(); api.reload(); api.loadMore(); api.sort({ column: 'title', direction: 'descending' }); api.setFilterText('closed'); api.clearFilter();",
      "  const machineEvidence = 'createMachine AsyncListSchema ensureProps load is required context refs watch hashDeps initialState idle entry loadIfNeeded states idle loading sorting RELOAD LOAD_MORE SORT FILTER SUCCESS ERROR ABORT performFetch cancelFetch performSort cancelSort';",
      "  const contextEvidence = 'items bindable initialItems cursor bindable null filterText bindable initialFilterText sortDescriptor bindable initialSortDescriptor error bindable undefined abort ref AbortController seq ref dependency watch dependencies hashDeps';",
      "  const actionEvidence = 'loadIfNeeded performFetch performSort setSortDescriptor setFilterText invokeOnSuccess invokeOnError clearItems setItems setCursor setError clearError clearCursor cancelFetch cancelSort';",
      "  const guardEvidence = 'hasCursor hasSortFn seq stale isAbortError AbortError';",
      "  const asyncEvidence = 'AbortController signal cursor filterText sortDescriptor loadFn sortFn sequence increment stale success guard stale error guard append results Promise resolve abort error skip';",
      "  const apiEvidence = 'items sortDescriptor loading sorting empty hasMore error filterText cursor abort reload loadMore sort setFilterText clearFilter send ABORT RELOAD LOAD_MORE SORT FILTER';",
      "  const packageEvidence = '@zag-js/async-list @zag-js/react @zag-js/core @zag-js/utils react';",
      "  return <section data-async-list={[machineEvidence, contextEvidence, actionEvidence, guardEvidence, asyncEvidence, apiEvidence, packageEvidence].join(' ')}>{api.loading ? 'Loading' : api.items.map((item) => item.title).join(', ')}</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/async-list": "latest",
        "@zag-js/react": "latest",
        "@zag-js/core": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "async-list-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      asyncSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "required-load-prop", "idle-state", "loading-state", "sorting-state", "reload-event", "load-more-event", "sort-event", "filter-event", "success-event", "error-event", "abort-event", "load-if-needed-entry", "perform-fetch-entry", "cancel-fetch-exit"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["items-context", "cursor-context", "filter-text-context", "sort-descriptor-context", "error-context", "abort-ref", "sequence-ref", "dependency-watch"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["load-if-needed", "perform-fetch", "perform-sort", "set-sort-descriptor", "set-filter-text", "invoke-on-success", "invoke-on-error", "clear-items", "set-items", "set-cursor", "set-error", "clear-error", "clear-cursor", "cancel-fetch", "cancel-sort"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["has-cursor", "has-sort-fn", "stale-sequence", "abort-error"]));
    expect(readySignals(report.asyncSignals)).toEqual(expect.arrayContaining(["abort-controller", "load-signal", "cursor-forwarding", "filter-forwarding", "sort-forwarding", "sequence-increment", "stale-success-guard", "stale-error-guard", "append-results", "sort-promise", "abort-error-skip"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["items", "cursor", "loading", "sorting", "empty", "has-more", "error", "abort", "reload", "load-more", "sort", "set-filter-text", "clear-filter", "sort-descriptor", "filter-text", "abort-event-api", "reload-event-api", "load-more-event-api", "sort-event-api", "filter-event-api"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/async-list", "@zag-js/react", "@zag-js/core", "@zag-js/utils", "react"]));
    const asyncListMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "async-list-readiness.md"), "utf8");
    expect(asyncListMarkdown).toContain("Machine Signals");
    expect(asyncListMarkdown).toContain("@zag-js/async-list");
    const asyncListHtml = await fs.readFile(path.join(result.session.outputPaths.html, "async-list-readiness.html"), "utf8");
    expect(asyncListHtml).toContain("Machine Signals");
    expect(asyncListHtml).toContain("@zag-js/async-list");
  });

  it("detects image cropper readiness without cropping real pixels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-image-cropper-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-image-cropper-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-image-cropper.tsx"), [
      "import * as imageCropper from '@zag-js/image-cropper';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function AvatarCropper() {",
      "  const service = useMachine(imageCropper.machine, {",
      "    id: 'avatar-cropper',",
      "    initialCrop: { x: 12, y: 16, width: 180, height: 120 },",
      "    minWidth: 40,",
      "    minHeight: 40,",
      "    maxWidth: 320,",
      "    maxHeight: 280,",
      "    aspectRatio: 1,",
      "    cropShape: 'circle',",
      "    defaultZoom: 1,",
      "    zoomStep: 0.1,",
      "    zoomSensitivity: 2,",
      "    minZoom: 1,",
      "    maxZoom: 5,",
      "    defaultRotation: 0,",
      "    defaultFlip: { horizontal: false, vertical: false },",
      "    fixedCropArea: false,",
      "    nudgeStep: 1,",
      "    nudgeStepShift: 10,",
      "    nudgeStepCtrl: 50,",
      "    onCropChange: console.info,",
      "    onZoomChange: console.info,",
      "    onRotationChange: console.info,",
      "    onFlipChange: console.info",
      "  });",
      "  const api = imageCropper.connect(service, normalizeProps);",
      "  api.zoom; api.rotation; api.flip; api.crop; api.offset; api.naturalSize; api.viewportRect; api.dragging; api.panning;",
      "  api.setZoom(1.5); api.zoomBy(0.1); api.setRotation(90); api.rotateBy(90); api.setFlip({ horizontal: true }); api.flipHorizontally(); api.flipVertically(); api.resize('se', 12); api.reset(); api.getCropData(); api.getCroppedImage({ type: 'image/png', quality: 0.92, output: 'dataUrl' });",
      "  const evidence = 'idle dragging panning isMeasured isImageReady fixedCropArea cropShape rectangle circle SET_NATURAL_SIZE SET_DEFAULT_CROP POINTER_DOWN POINTER_MOVE POINTER_UP PAN_POINTER_DOWN ZOOM PINCH_START PINCH_MOVE PINCH_END SET_ZOOM SET_ROTATION SET_FLIP RESIZE_CROP VIEWPORT_RESIZE RESET ADJUST_ASPECT_RATIO checkImageStatus setNaturalSize setDefaultCrop setPointerStart setCropStart setHandlePosition updateCrop updatePanOffset setRotation setFlip resizeCrop updateZoom setPinchDistance handlePinchMove clearPinchDistance nudgeResizeCrop nudgeMoveCrop resizeViewport resetToInitialState adjustCropAspectRatio trackPointerMove trackViewportResize trackWheelEvent trackTouchEvents computeResizeCrop computeMoveCrop computeKeyboardCrop getNudgeStep getCropSourceRect drawCroppedImageToCanvas toBlob toDataURL image/png image/jpeg quality Blob dataUrl role group role slider aria-roledescription aria-label aria-description aria-live aria-controls aria-busy aria-valuemin aria-valuemax aria-valuenow aria-valuetext data-dragging data-panning image-cropper-traces upload-artifact';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <div {...api.getViewportProps()}>",
      "        <img {...api.getImageProps()} src='/avatar.png' />",
      "        <div {...api.getSelectionProps()}>",
      "          <span {...api.getHandleProps({ position: 'nw' })} />",
      "          <span {...api.getHandleProps({ position: 'se' })} />",
      "          <span {...api.getGridProps({ axis: 'horizontal' })} />",
      "          <span {...api.getGridProps({ axis: 'vertical' })} />",
      "        </div>",
      "      </div>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-image-cropper.tsx"), [
      "import { useState } from 'react';",
      "",
      "export function CustomImageCropper() {",
      "  const [crop, setCrop] = useState({ x: 0, y: 0, width: 120, height: 120 });",
      "  const [zoom, setZoom] = useState(1);",
      "  const [rotation, setRotation] = useState(0);",
      "  const [flip, setFlip] = useState({ horizontal: false, vertical: false });",
      "  const traces = 'custom image cropper native cropper root viewport image selection handle grid idle dragging panning measured image-ready fixed-crop-area rectangle circle crop initial-crop default-crop min-size max-size aspect-ratio crop-shape crop-change source-rect zoom default-zoom min-max-zoom zoom-step rotation default-rotation flip offset pointer-down pointer-move pointer-up pan-pointer-down wheel pinch-start pinch-move pinch-end resize-crop reset arrow-keys alt-resize shift-step ctrl-step zoom-in zoom-out nudge get-crop-data get-cropped-image canvas blob data-url png jpeg quality group-role slider-role aria-roledescription aria-label aria-description aria-live aria-controls aria-busy aria-valuemin-max aria-valuenow aria-valuetext data-dragging data-panning pointer-test wheel-test keyboard-test pinch-test output-test aria-test image-cropper-traces upload-artifact';",
      "  function onPointerDown() { setCrop((value) => ({ ...value, x: value.x + 1 })); }",
      "  function onPointerMove() { setCrop((value) => ({ ...value, y: value.y + 1 })); }",
      "  function onWheel() { setZoom((value) => value + 0.1); }",
      "  function onKeyDown(event: KeyboardEvent) { if (event.altKey) setCrop((value) => ({ ...value, width: value.width + 10 })); }",
      "  function getCropData() { return { ...crop, rotate: rotation, flipX: flip.horizontal, flipY: flip.vertical }; }",
      "  async function getCroppedImage() { const canvas = document.createElement('canvas'); return canvas.toDataURL('image/jpeg', 0.8); }",
      "  return <section role='group' aria-roledescription='Image cropper' aria-label='Avatar cropper' aria-description={traces} aria-live='polite' aria-controls='crop-viewport crop-selection' data-dragging='false' data-panning='false' data-fixed='false' data-shape='circle' onPointerDown={onPointerDown} onPointerMove={onPointerMove} onWheel={onWheel} data-crop={JSON.stringify(getCropData())}>{zoom}{rotation}{String(flip.horizontal)}{traces}</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "image-cropper.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "",
      "describe('image cropper readiness', () => {",
      "  it('covers pointer, wheel, keyboard, pinch, output, aria, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    render(<button aria-label='crop selection'>crop</button>);",
      "    await user.click(screen.getByRole('button', { name: /crop selection/i }));",
      "    await user.keyboard('{ArrowRight}+');",
      "    expect('pointer-test wheel-test keyboard-test pinch-test output-test aria-test image-cropper-traces upload-artifact').toContain('output-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "image-cropper.yml"), [
      "name: image-cropper-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- image-cropper",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: image-cropper-traces",
      "          path: test-results/image-cropper"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/image-cropper": "latest",
        "@zag-js/core": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "image-cropper-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      imageCropperSetups: Array<{ filePath: string; framework: string; rootCount: number; viewportCount: number; imageCount: number; selectionCount: number; handleCount: number; gridCount: number; cropCount: number; transformCount: number; resizeCount: number; panCount: number; zoomCount: number; keyboardCount: number; outputCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      cropSignals: Array<{ signal: string; readiness: string }>;
      transformSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Image cropper readiness Zag image-cropper crop resize pan zoom rotate flip canvas accessibility tests");
    expect(report.imageCropperSetups.some((item) => item.filePath === "src/zag-image-cropper.tsx" && item.framework === "zag-image-cropper" && item.rootCount > 0 && item.viewportCount > 0 && item.imageCount > 0 && item.selectionCount > 0 && item.handleCount > 0 && item.gridCount > 0 && item.cropCount > 0 && item.transformCount > 0 && item.resizeCount > 0 && item.panCount > 0 && item.zoomCount > 0 && item.keyboardCount > 0 && item.outputCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.imageCropperSetups.some((item) => item.filePath === "src/custom-image-cropper.tsx" && item.framework === "custom" && item.rootCount > 0 && item.viewportCount > 0 && item.imageCount > 0 && item.selectionCount > 0 && item.handleCount > 0 && item.gridCount > 0 && item.cropCount > 0 && item.transformCount > 0 && item.resizeCount > 0 && item.panCount > 0 && item.zoomCount > 0 && item.keyboardCount > 0 && item.outputCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-image-cropper", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "viewport", "image", "selection", "handle", "grid"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "dragging", "panning", "measured", "image-ready", "fixed-crop-area", "rectangle", "circle"]));
    expect(readySignals(report.cropSignals)).toEqual(expect.arrayContaining(["crop", "initial-crop", "default-crop", "min-size", "max-size", "aspect-ratio", "crop-shape", "crop-change", "source-rect"]));
    expect(readySignals(report.transformSignals)).toEqual(expect.arrayContaining(["zoom", "default-zoom", "min-max-zoom", "zoom-step", "rotation", "default-rotation", "flip", "offset"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer-down", "pointer-move", "pointer-up", "pan-pointer-down", "wheel", "pinch-start", "pinch-move", "pinch-end", "resize-crop", "reset"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-keys", "alt-resize", "shift-step", "ctrl-step", "zoom-in", "zoom-out", "nudge"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["get-crop-data", "get-cropped-image", "canvas", "blob", "data-url", "png", "jpeg", "quality"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["group-role", "slider-role", "aria-roledescription", "aria-label", "aria-description", "aria-live", "aria-controls", "aria-busy", "aria-valuemin-max", "aria-valuenow", "aria-valuetext", "data-dragging", "data-panning"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "wheel-test", "keyboard-test", "pinch-test", "output-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/image-cropper", "@zag-js/core", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/image-cropper"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records image cropper readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "image-cropper-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "image-cropper-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "image-cropper-readiness.html"))).resolves.toBeUndefined();
    const imageCropperMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "image-cropper-readiness.md"), "utf8");
    expect(imageCropperMarkdown).toContain("Image Cropper Readiness");
    expect(imageCropperMarkdown).toContain("@zag-js/image-cropper");
    const imageCropperHtml = await fs.readFile(path.join(result.session.outputPaths.html, "image-cropper-readiness.html"), "utf8");
    expect(imageCropperHtml).toContain("image-cropper-readiness-card");
    expect(imageCropperHtml).toContain("data-source-pattern=\"ImageCropper\"");
    expect(imageCropperHtml).toContain("RepoTutor records image cropper readiness only");
  });

  it("detects Zag image cropper machine readiness without cropping real pixels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-image-cropper-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-image-cropper-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-image-cropper-machine.tsx"), [
      "import * as imageCropper from '@zag-js/image-cropper';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ZagImageCropperMachineReadiness() {",
      "  const service = useMachine(imageCropper.machine, {",
      "    id: 'avatar-cropper-machine',",
      "    ids: { root: 'crop-root', viewport: 'crop-viewport', image: 'crop-image', selection: 'crop-selection', handle: (position) => `crop-handle-${position}` },",
      "    initialCrop: { x: 12, y: 16, width: 180, height: 120 },",
      "    minWidth: 40,",
      "    minHeight: 40,",
      "    maxWidth: 320,",
      "    maxHeight: 280,",
      "    aspectRatio: 1,",
      "    cropShape: 'circle',",
      "    defaultZoom: 1,",
      "    zoomStep: 0.1,",
      "    zoomSensitivity: 2,",
      "    minZoom: 1,",
      "    maxZoom: 5,",
      "    defaultRotation: 0,",
      "    defaultFlip: { horizontal: false, vertical: false },",
      "    fixedCropArea: false,",
      "    nudgeStep: 1,",
      "    nudgeStepShift: 10,",
      "    nudgeStepCtrl: 50,",
      "    translations: { rootLabel: 'Image cropper', rootRoleDescription: 'Image cropper', previewLoading: 'Image cropper preview loading' },",
      "    onCropChange: console.info,",
      "    onZoomChange: console.info,",
      "    onRotationChange: console.info,",
      "    onFlipChange: console.info",
      "  });",
      "  const api = imageCropper.connect(service, normalizeProps);",
      "  api.zoom; api.rotation; api.flip; api.crop; api.offset; api.naturalSize; api.viewportRect; api.dragging; api.panning;",
      "  api.setZoom(1.5); api.zoomBy(0.1); api.setRotation(90); api.rotateBy(90); api.setFlip({ horizontal: true }); api.flipHorizontally(); api.flipVertically(); api.resize('se', 12); api.reset(); api.getCropData(); api.getCroppedImage({ type: 'image/png', quality: 0.92, output: 'dataUrl' });",
      "  const machineEvidence = 'createMachine ImageCropperSchema minWidth 40 minHeight 40 maxWidth Infinity maxHeight Infinity defaultZoom 1 zoomStep 0.1 zoomSensitivity 2 minZoom 1 maxZoom 5 defaultRotation 0 defaultFlip horizontal false vertical false fixedCropArea false cropShape rectangle nudgeStep 1 nudgeStepShift 10 nudgeStepCtrl 50 translations rootLabel previewDescription selectionLabel initialState idle states idle dragging panning computed isMeasured isImageReady watch zoom aspectRatio cropShape PINCH_START PINCH_MOVE PINCH_END SET_ZOOM SET_ROTATION SET_FLIP RESIZE_CROP VIEWPORT_RESIZE RESET ADJUST_ASPECT_RATIO SET_NATURAL_SIZE SET_DEFAULT_CROP POINTER_DOWN PAN_POINTER_DOWN ZOOM NUDGE_RESIZE_CROP NUDGE_MOVE_CROP POINTER_MOVE POINTER_UP effects trackViewportResize trackWheelEvent trackTouchEvents trackPointerMove';",
      "  const contextEvidence = 'naturalSize bindable crop bindable pointerStart cropStart handlePosition shiftLockRatio pinchDistance pinchMidpoint zoom bindable rotation bindable flip bindable offset offsetStart viewportRect onCropChange onZoomChange onRotationChange onFlipChange';",
      "  const effectEvidence = 'trackPointerMove addDomEvent pointermove pointerup trackViewportResize resizeObserverBorderBox VIEWPORT_RESIZE trackWheelEvent wheel passive false trackTouchEvents touchstart touchmove touchend PINCH_START PINCH_MOVE PINCH_END';",
      "  const actionEvidence = 'checkImageStatus setNaturalSize setDefaultCrop setPointerStart setOffsetStart setCropStart updateCrop updatePanOffset setHandlePosition setRotation setFlip resizeCrop clearPointerStart clearCropStart clearHandlePosition clearOffsetStart clearShiftRatio updateZoom setPinchDistance handlePinchMove clearPinchDistance nudgeResizeCrop nudgeMoveCrop resizeViewport resetToInitialState adjustCropAspectRatio computeResizeCrop computeMoveCrop computeKeyboardCrop getNudgeStep getCropSizeLimits clampOffset getCropSourceRect';",
      "  const guardEvidence = 'hasViewportRect canResizeCrop canPan canDragSelection isVisibleRect fixedCropArea isAspectRatioEqual';",
      "  const domEvidence = 'getRootId getViewportId getImageId getSelectionId getHandleId getRootEl getViewportEl getImageEl getSelectionEl getHandleEl drawCroppedImageToCanvas canvas getContext 2d translate rotate scale drawImage toBlob toDataURL';",
      "  const apiEvidence = 'zoom rotation flip crop offset naturalSize viewportRect dragging panning setZoom zoomBy setRotation rotateBy setFlip flipHorizontally flipVertically resize reset getCropData getCroppedImage getRootProps getViewportProps getImageProps getSelectionProps getHandleProps getGridProps role group role presentation role slider aria-roledescription aria-label aria-description aria-live aria-controls aria-busy aria-valuemin aria-valuemax aria-valuenow aria-valuetext aria-hidden onPointerDown onKeyDown keyMap touchAction userSelect data-dragging data-panning data-fixed data-shape data-ready data-measured data-pinch data-ownedby data-flip-horizontal data-flip-vertical';",
      "  const packageEvidence = '@zag-js/image-cropper @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return <div {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, effectEvidence, actionEvidence, guardEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}><div {...api.getViewportProps()}><img {...api.getImageProps()} src='/avatar.png' /><div {...api.getSelectionProps()}><span {...api.getHandleProps({ position: 'nw' })} /><span {...api.getHandleProps({ position: 'se' })} /><span {...api.getGridProps({ axis: 'horizontal' })} /><span {...api.getGridProps({ axis: 'vertical' })} /></div></div></div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/image-cropper": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "image-cropper-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-props", "translations", "idle-state", "dragging-state", "panning-state", "global-events", "pointer-events", "pinch-events", "transform-events", "viewport-events", "computed-state", "watch-props", "idle-effects", "track-pointer-move-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["natural-size-context", "crop-context", "pointer-start-context", "crop-start-context", "handle-position-context", "shift-lock-ratio-context", "pinch-distance-context", "pinch-midpoint-context", "zoom-context", "rotation-context", "flip-context", "offset-context", "offset-start-context", "viewport-rect-context"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-measured", "is-image-ready"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-pointer-move", "track-viewport-resize", "track-wheel-event", "track-touch-events"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["check-image-status", "set-natural-size", "set-default-crop", "set-pointer-start", "set-offset-start", "set-crop-start", "update-crop", "update-pan-offset", "set-handle-position", "set-rotation", "set-flip", "resize-crop", "clear-pointer-start", "clear-crop-start", "clear-handle-position", "clear-offset-start", "clear-shift-ratio", "update-zoom", "set-pinch-distance", "handle-pinch-move", "clear-pinch-distance", "nudge-resize-crop", "nudge-move-crop", "resize-viewport", "reset-to-initial-state", "adjust-crop-aspect-ratio"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["has-viewport-rect", "can-resize-crop", "can-pan", "can-drag-selection", "visible-rect", "fixed-crop-area", "aspect-ratio-equal"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "viewport-id", "image-id", "selection-id", "handle-id", "root-el", "viewport-el", "image-el", "selection-el", "handle-el", "draw-cropped-image-canvas"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["zoom", "rotation", "flip", "crop", "offset", "natural-size", "viewport-rect", "dragging", "panning", "set-zoom", "zoom-by", "set-rotation", "rotate-by", "set-flip", "flip-horizontally", "flip-vertically", "resize", "reset", "get-crop-data", "get-cropped-image", "root-props", "viewport-props", "image-props", "selection-props", "handle-props", "grid-props", "group-role", "presentation-role", "slider-role", "keyboard-map", "pointer-handlers", "aria-live", "aria-busy", "aria-hidden", "data-pinch", "data-ownedby", "data-flip-horizontal", "data-flip-vertical"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/image-cropper", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const imageCropperMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "image-cropper-readiness.md"), "utf8");
    expect(imageCropperMarkdown).toContain("Machine Signals");
    expect(imageCropperMarkdown).toContain("@zag-js/image-cropper");
    const imageCropperHtml = await fs.readFile(path.join(result.session.outputPaths.html, "image-cropper-readiness.html"), "utf8");
    expect(imageCropperHtml).toContain("Machine Signals");
    expect(imageCropperHtml).toContain("@zag-js/image-cropper");
  });

  it("detects listbox readiness without selecting real options", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-listbox-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-listbox-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-listbox.tsx"), [
      "import * as listbox from '@zag-js/listbox';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const collection = listbox.collection({",
      "  items: [{ label: 'Ada', value: 'ada' }, { label: 'Grace', value: 'grace', disabled: true }],",
      "  itemToValue: (item) => item.value,",
      "  itemToString: (item) => item.label,",
      "  isItemDisabled: (item) => item.disabled",
      "});",
      "const gridCollection = listbox.gridCollection({ items: [{ label: 'Linus', value: 'linus' }], columnCount: 2, itemToValue: (item) => item.value });",
      "",
      "export function ContributorListbox() {",
      "  const service = useMachine(listbox.machine, {",
      "    id: 'contributors',",
      "    collection,",
      "    defaultValue: ['ada'],",
      "    defaultHighlightedValue: 'grace',",
      "    selectionMode: 'extended',",
      "    loopFocus: true,",
      "    typeahead: true,",
      "    selectOnHighlight: true,",
      "    deselectable: true,",
      "    multiple: true,",
      "    composite: true,",
      "    orientation: 'vertical',",
      "    disallowSelectAll: false,",
      "    scrollToIndexFn: console.info,",
      "    onValueChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onSelect: console.info",
      "  });",
      "  const api = listbox.connect(service, normalizeProps);",
      "  api.empty; api.highlightedItem; api.highlightedValue; api.selectedItems; api.hasSelectedItems; api.value; api.valueAsString; api.collection; api.disabled;",
      "  api.highlightValue('ada'); api.highlightFirst(); api.highlightLast(); api.highlightNext(); api.highlightPrevious(); api.clearHighlightedValue(); api.selectValue('ada'); api.setValue(['ada']); api.selectAll(); api.clearValue('ada'); api.getItemState({ item: collection.items[0] });",
      "  const evidence = 'idle focused focusVisible empty disabled highlighted selected multiple isTypingAhead isInteractive value defaultValue selectionMode single multiple extended deselectable selectOnHighlight selectAll clearValue onValueChange onSelect highlightedValue defaultHighlightedValue highlightFirst highlightLast highlightNext highlightPrevious clearHighlightedValue autoHighlight onHighlightChange collection ListCollection GridCollection items firstValue lastValue getNextValue getPreviousValue stringifyItems getItemDisabled INPUT.FOCUS CONTENT.FOCUS CONTENT.BLUR ITEM.CLICK CONTENT.TYPEAHEAD ITEM.POINTER_MOVE ITEM.POINTER_LEAVE NAVIGATE HIGHLIGHTED_VALUE.SET ITEM.SELECT ITEM.CLEAR VALUE.SET VALUE.CLEAR HIGHLIGHT.FIRST HIGHLIGHT.LAST HIGHLIGHT.NEXT HIGHLIGHT.PREV trackFocusVisible scrollToHighlightedItem observeAttributes scrollIntoView getByTypeahead setInteractionModality keyboardPriority ArrowUp ArrowDown ArrowLeft ArrowRight Home End Enter Space Escape meta+a shiftKey loopFocus role listbox role option role group aria-selected aria-disabled aria-activedescendant aria-multiselectable aria-labelledby aria-haspopup aria-controls aria-autocomplete tabIndex data-highlighted data-selected listbox-traces upload-artifact';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Contributor</label>",
      "      <input {...api.getInputProps({ autoHighlight: true, keyboardPriority: 'navigate' })} />",
      "      <span {...api.getValueTextProps()}>{api.valueAsString}</span>",
      "      <div {...api.getContentProps()}>",
      "        <div {...api.getItemGroupProps({ id: 'people' })}>",
      "          <span {...api.getItemGroupLabelProps({ htmlFor: 'people' })}>People</span>",
      "          {collection.items.map((item) => <div key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}><span {...api.getItemTextProps({ item })}>{item.label}</span><span {...api.getItemIndicatorProps({ item })}>selected</span></div>)}",
      "        </div>",
      "      </div>",
      "      <output data-grid={gridCollection.columnCount}>grid</output>",
      "    </div>",
      "  );",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-listbox.tsx"), [
      "import { useState } from 'react';",
      "",
      "export function CustomListbox() {",
      "  const [value, setValue] = useState(['ada']);",
      "  const [highlightedValue, setHighlightedValue] = useState('grace');",
      "  const traces = 'custom listbox root label input content item item-text item-indicator item-group item-group-label value-text idle focused focus-visible empty disabled highlighted selected multiple typing-ahead interactive collection list-collection grid-collection items first-last next-prev stringify-items disabled-item value default-value selection-mode single multiple extended deselectable select-on-highlight select-all clear-value on-value-change on-select highlighted-value default-highlighted-value highlight-first highlight-last highlight-next highlight-previous clear-highlight auto-highlight on-highlight-change content-focus content-blur item-click pointer-move pointer-leave typeahead navigate input-focus input-blur input-keydown arrow-up arrow-down arrow-left arrow-right home end enter space escape meta-a shift-selection loop-focus keyboard-priority role-listbox role-option role-group aria-selected aria-disabled aria-activedescendant aria-multiselectable aria-labelledby aria-haspopup aria-controls aria-autocomplete tab-index data-highlighted data-selected keyboard-test pointer-test typeahead-test selection-test multi-select-test aria-test listbox-traces upload-artifact';",
      "  function onKeyDown(event: KeyboardEvent) { if (event.key === 'ArrowDown') setHighlightedValue('grace'); if (event.metaKey && event.key === 'a') setValue(['ada', 'grace']); }",
      "  function onPointerMove() { setHighlightedValue('ada'); }",
      "  function selectAll() { setValue(['ada', 'grace']); }",
      "  function clearValue() { setValue([]); }",
      "  return <section data-part='root' aria-label='contributors' data-evidence={traces}>",
      "    <label id='contributors-label' data-part='label'>Contributors</label>",
      "    <input data-part='input' aria-haspopup='listbox' aria-controls='contributors-list' aria-autocomplete='list' aria-activedescendant={highlightedValue} onKeyDown={onKeyDown} />",
      "    <span data-part='value-text'>{value.join(',')}</span>",
      "    <div id='contributors-list' data-part='content' role='listbox' aria-labelledby='contributors-label' aria-multiselectable='true' tabIndex={0}>",
      "      <div data-part='item-group' role='group' aria-labelledby='people-label'><span id='people-label' data-part='item-group-label'>People</span>",
      "        <div role='option' data-part='item' aria-selected='true' aria-disabled='false' data-highlighted='true' data-selected='true' onPointerMove={onPointerMove}><span data-part='item-text'>Ada</span><span data-part='item-indicator'>✓</span></div>",
      "        <div role='option' data-part='item' aria-selected='false' aria-disabled='true' data-highlighted='false' data-selected='false'>Grace</div>",
      "      </div>",
      "    </div>",
      "    <button type='button' onClick={selectAll}>select all</button><button type='button' onClick={clearValue}>clear</button>{traces}</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "listbox.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "",
      "describe('listbox readiness', () => {",
      "  it('covers keyboard, pointer, typeahead, selection, multiselect, aria, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    render(<div role='listbox' aria-label='contributors'><div role='option' aria-selected='true'>Ada</div></div>);",
      "    await user.keyboard('{ArrowDown}{Enter}{Meta>}a{/Meta}{Escape}');",
      "    await user.click(screen.getByRole('option', { name: /ada/i }));",
      "    expect('keyboard-test pointer-test typeahead-test selection-test multi-select-test aria-test listbox-traces upload-artifact').toContain('selection-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "listbox.yml"), [
      "name: listbox-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- listbox",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: listbox-traces",
      "          path: test-results/listbox"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/listbox": "latest",
        "@zag-js/collection": "latest",
        "@zag-js/core": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "listbox-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      listboxSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; inputCount: number; contentCount: number; itemCount: number; itemTextCount: number; itemIndicatorCount: number; itemGroupCount: number; valueCount: number; collectionCount: number; selectionCount: number; highlightCount: number; keyboardCount: number; typeaheadCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      collectionSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      highlightSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Listbox readiness Zag listbox collection selection highlight typeahead keyboard accessibility tests");
    expect(report.listboxSetups.some((item) => item.filePath === "src/zag-listbox.tsx" && item.framework === "zag-listbox" && item.rootCount > 0 && item.labelCount > 0 && item.inputCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.itemTextCount > 0 && item.itemIndicatorCount > 0 && item.itemGroupCount > 0 && item.valueCount > 0 && item.collectionCount > 0 && item.selectionCount > 0 && item.highlightCount > 0 && item.keyboardCount > 0 && item.typeaheadCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.listboxSetups.some((item) => item.filePath === "src/custom-listbox.tsx" && item.framework === "custom" && item.rootCount > 0 && item.labelCount > 0 && item.inputCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.itemTextCount > 0 && item.itemIndicatorCount > 0 && item.itemGroupCount > 0 && item.valueCount > 0 && item.collectionCount > 0 && item.selectionCount > 0 && item.highlightCount > 0 && item.keyboardCount > 0 && item.typeaheadCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-listbox", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "input", "content", "item", "item-text", "item-indicator", "item-group", "item-group-label", "value-text"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "focused", "focus-visible", "empty", "disabled", "highlighted", "selected", "multiple", "typing-ahead", "interactive"]));
    expect(readySignals(report.collectionSignals)).toEqual(expect.arrayContaining(["collection", "list-collection", "grid-collection", "items", "first-last", "next-prev", "stringify-items", "disabled-item"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["value", "default-value", "selection-mode", "single", "multiple", "extended", "deselectable", "select-on-highlight", "select-all", "clear-value", "on-value-change", "on-select"]));
    expect(readySignals(report.highlightSignals)).toEqual(expect.arrayContaining(["highlighted-value", "default-highlighted-value", "highlight-first", "highlight-last", "highlight-next", "highlight-previous", "clear-highlight", "auto-highlight", "on-highlight-change"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["content-focus", "content-blur", "item-click", "pointer-move", "pointer-leave", "typeahead", "navigate", "input-focus", "input-blur", "input-keydown"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-up", "arrow-down", "arrow-left", "arrow-right", "home", "end", "enter", "space", "escape", "meta-a", "shift-selection", "loop-focus", "keyboard-priority"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-listbox", "role-option", "role-group", "aria-selected", "aria-disabled", "aria-activedescendant", "aria-multiselectable", "aria-labelledby", "aria-haspopup", "aria-controls", "aria-autocomplete", "tab-index", "data-highlighted", "data-selected"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "typeahead-test", "selection-test", "multi-select-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/listbox", "@zag-js/collection", "@zag-js/core", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/listbox"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records listbox readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "listbox-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "listbox-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "listbox-readiness.html"))).resolves.toBeUndefined();
    const listboxMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "listbox-readiness.md"), "utf8");
    expect(listboxMarkdown).toContain("Listbox Readiness");
    expect(listboxMarkdown).toContain("@zag-js/listbox");
    const listboxHtml = await fs.readFile(path.join(result.session.outputPaths.html, "listbox-readiness.html"), "utf8");
    expect(listboxHtml).toContain("listbox-readiness-card");
    expect(listboxHtml).toContain("data-source-pattern=\"Listbox\"");
    expect(listboxHtml).toContain("RepoTutor records listbox readiness only");
  });

  it("detects Zag listbox machine readiness without selecting real options", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-listbox-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-listbox-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-listbox-machine.tsx"), [
      "import * as listbox from '@zag-js/listbox';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const collection = listbox.collection({",
      "  items: [{ label: 'Ada', value: 'ada' }, { label: 'Grace', value: 'grace', disabled: true }],",
      "  itemToValue: (item) => item.value,",
      "  itemToString: (item) => item.label,",
      "  isItemDisabled: (item) => item.disabled",
      "});",
      "const gridCollection = listbox.gridCollection({ items: [{ label: 'Linus', value: 'linus' }], columnCount: 2, itemToValue: (item) => item.value });",
      "",
      "export function ZagListboxMachineReadiness() {",
      "  const service = useMachine(listbox.machine, {",
      "    id: 'contributors-machine',",
      "    ids: { root: 'contributors-root', label: 'contributors-label', content: 'contributors-content', item: (value) => `contributors-item-${value}`, itemGroup: (value) => `contributors-group-${value}`, itemGroupLabel: (value) => `contributors-group-label-${value}` },",
      "    collection,",
      "    defaultValue: ['ada'],",
      "    defaultHighlightedValue: 'grace',",
      "    loopFocus: true,",
      "    composite: true,",
      "    multiple: false,",
      "    typeahead: true,",
      "    orientation: 'vertical',",
      "    selectionMode: 'extended',",
      "    selectOnHighlight: true,",
      "    deselectable: true,",
      "    disallowSelectAll: false,",
      "    scrollToIndexFn: console.info,",
      "    onValueChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onSelect: console.info",
      "  });",
      "  const api = listbox.connect(service, normalizeProps);",
      "  api.empty; api.highlightedItem; api.highlightedValue; api.selectedItems; api.hasSelectedItems; api.value; api.valueAsString; api.collection; api.disabled;",
      "  api.clearHighlightedValue(); api.selectValue('ada'); api.setValue(['ada']); api.selectAll(); api.highlightValue('ada'); api.highlightFirst(); api.highlightLast(); api.highlightNext(); api.highlightPrevious(); api.clearValue('ada'); api.getItemState({ item: collection.items[0] });",
      "  const machineEvidence = 'createMachine ListboxSchema loopFocus false composite true defaultValue [] multiple false typeahead true collection empty orientation vertical selectionMode single initialState idle states idle effects trackFocusVisible watch value highlightedValue collection HIGHLIGHTED_VALUE.SET ITEM.SELECT ITEM.CLEAR VALUE.SET VALUE.CLEAR HIGHLIGHT.FIRST HIGHLIGHT.LAST HIGHLIGHT.NEXT HIGHLIGHT.PREV INPUT.FOCUS CONTENT.FOCUS CONTENT.BLUR ITEM.CLICK CONTENT.TYPEAHEAD ITEM.POINTER_MOVE ITEM.POINTER_LEAVE NAVIGATE';",
      "  const contextEvidence = 'value bindable highlightedValue bindable highlightedItem bindable selectedItemMap bindable focused bindable typeahead ref focusVisible ref inputState autoHighlight focused';",
      "  const computedEvidence = 'hasSelectedItems isTypingAhead isInteractive selection multiple selectedItems valueAsString';",
      "  const effectEvidence = 'trackFocusVisible scrollToHighlightedItem observeAttributes data-activedescendant scrollIntoView raf setInteractionModality getInteractionModality';",
      "  const actionEvidence = 'selectHighlightedItem selectWithKeyboard highlightItem highlightMatchingItem setHighlightedItem highlightFirstValue highlightLastValue highlightNextValue highlightPreviousValue clearHighlightedItem selectItem clearItem setSelectedItems clearSelectedItems syncSelectedItems syncHighlightedItem syncHighlightedValue setFocused setDefaultHighlightedValue clearFocused setInputState clearInputState invokeOnSelect';",
      "  const guardEvidence = 'hasSelectedValue hasHighlightedValue';",
      "  const domEvidence = 'getRootId getContentId getLabelId getItemId getItemGroupId getItemGroupLabelId getContentEl getItemEl';",
      "  const apiEvidence = 'empty highlightedItem highlightedValue clearHighlightedValue selectedItems hasSelectedItems value valueAsString collection disabled selectValue setValue selectAll highlightValue highlightFirst highlightLast highlightNext highlightPrevious clearValue getItemState getRootProps getInputProps getLabelProps getValueTextProps getContentProps getItemProps getItemTextProps getItemIndicatorProps getItemGroupProps getItemGroupLabelProps role listbox role option role group role presentation dir prop aria-selected aria-disabled aria-activedescendant aria-multiselectable aria-labelledby aria-haspopup aria-controls aria-autocomplete aria-hidden data-highlighted data-selected data-disabled data-orientation data-state data-empty data-layout data-activedescendant autoComplete off spellCheck false enterKeyHint go onFocus onBlur onKeyDown onPointerMove onMouseDown onClick keyMap keyboardPriority';",
      "  const packageEvidence = '@zag-js/listbox @zag-js/react @zag-js/anatomy @zag-js/collection @zag-js/core @zag-js/dom-query @zag-js/focus-visible @zag-js/types @zag-js/utils react';",
      "  return <div {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, guardEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}><label {...api.getLabelProps()}>Contributors</label><input {...api.getInputProps({ autoHighlight: true, keyboardPriority: 'navigate' })} /><span {...api.getValueTextProps()}>{api.valueAsString}</span><div {...api.getContentProps()}><div {...api.getItemGroupProps({ id: 'people' })}><span {...api.getItemGroupLabelProps({ htmlFor: 'people' })}>People</span>{collection.items.map((item) => <div key={item.value} {...api.getItemProps({ item, highlightOnHover: true })}><span {...api.getItemTextProps({ item })}>{item.label}</span><span {...api.getItemIndicatorProps({ item })}>selected</span></div>)}</div></div><output data-grid={gridCollection.columnCount}>grid</output></div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/listbox": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/collection": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/focus-visible": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "listbox-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-props", "idle-state", "global-events", "selection-events", "highlight-events", "input-events", "content-events", "item-events", "navigate-event", "watch-value", "watch-highlighted-value", "watch-collection", "track-focus-visible-effect", "scroll-highlighted-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["value-context", "highlighted-value-context", "highlighted-item-context", "selected-item-map-context", "focused-context", "typeahead-ref", "focus-visible-ref", "input-state-ref"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["has-selected-items", "is-typing-ahead", "is-interactive", "selection", "multiple", "selected-items", "value-as-string"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-focus-visible", "scroll-to-highlighted-item", "observe-active-descendant", "scroll-into-view", "interaction-modality"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["select-highlighted-item", "select-with-keyboard", "highlight-item", "highlight-matching-item", "set-highlighted-item", "highlight-first-value", "highlight-last-value", "highlight-next-value", "highlight-previous-value", "clear-highlighted-item", "select-item", "clear-item", "set-selected-items", "clear-selected-items", "sync-selected-items", "sync-highlighted-item", "sync-highlighted-value", "set-focused", "set-default-highlighted-value", "clear-focused", "set-input-state", "clear-input-state"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["has-selected-value", "has-highlighted-value"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "content-id", "label-id", "item-id", "item-group-id", "item-group-label-id", "content-el", "item-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["empty", "highlighted-item", "highlighted-value", "clear-highlighted-value", "selected-items", "has-selected-items", "value", "value-as-string", "collection", "disabled", "select-value", "set-value", "select-all", "highlight-value", "highlight-first", "highlight-last", "highlight-next", "highlight-previous", "clear-value", "get-item-state", "root-props", "input-props", "label-props", "value-text-props", "content-props", "item-props", "item-text-props", "item-indicator-props", "item-group-props", "item-group-label-props", "listbox-role", "option-role", "group-role", "presentation-role", "keyboard-map", "pointer-handlers", "dir-prop", "data-disabled", "data-orientation", "data-state", "data-layout", "data-empty", "data-activedescendant", "aria-hidden", "autocomplete-off", "spellcheck-false", "enter-key-hint"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/listbox", "@zag-js/react", "@zag-js/anatomy", "@zag-js/collection", "@zag-js/core", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/types", "@zag-js/utils", "react"]));
    const listboxMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "listbox-readiness.md"), "utf8");
    expect(listboxMarkdown).toContain("Machine Signals");
    expect(listboxMarkdown).toContain("@zag-js/listbox");
    const listboxHtml = await fs.readFile(path.join(result.session.outputPaths.html, "listbox-readiness.html"), "utf8");
    expect(listboxHtml).toContain("Machine Signals");
    expect(listboxHtml).toContain("@zag-js/listbox");
  });

  it("detects date picker readiness without opening real calendars", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-date-picker-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-date-picker-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-date-picker.tsx"), [
      "import * as datePicker from '@zag-js/date-picker';",
      "import * as dateInput from '@zag-js/date-input';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import { CalendarDate, parseDate } from '@internationalized/date';",
      "",
      "export function BookingDatePicker() {",
      "  const service = useMachine(datePicker.machine, {",
      "    id: 'booking-date',",
      "    locale: 'en-US',",
      "    timeZone: 'UTC',",
      "    defaultValue: [parseDate('2026-06-06')],",
      "    defaultFocusedValue: parseDate('2026-06-06'),",
      "    selectionMode: 'range',",
      "    numOfMonths: 2,",
      "    defaultOpen: true,",
      "    inline: false,",
      "    closeOnSelect: true,",
      "    outsideDaySelectable: true,",
      "    min: new CalendarDate(2026, 1, 1),",
      "    max: new CalendarDate(2026, 12, 31),",
      "    startOfWeek: 1,",
      "    showWeekNumbers: true,",
      "    fixedWeeks: true,",
      "    maxSelectedDates: 4,",
      "    onValueChange: console.info,",
      "    onFocusChange: console.info,",
      "    onViewChange: console.info,",
      "    onOpenChange: console.info,",
      "    onVisibleRangeChange: console.info,",
      "    isDateUnavailable: (date) => date.day === 13",
      "  });",
      "  const api = datePicker.connect(service, normalizeProps);",
      "  api.focused; api.open; api.disabled; api.invalid; api.readOnly; api.inline; api.numOfMonths; api.showWeekNumbers; api.selectionMode; api.maxSelectedDates; api.isMaxSelected; api.view;",
      "  api.value; api.valueAsDate; api.valueAsString; api.focusedValue; api.focusedValueAsDate; api.focusedValueAsString; api.visibleRange; api.visibleRangeText; api.weekDays; api.weeks;",
      "  api.selectToday(); api.setValue([parseDate('2026-06-07')]); api.setTime({ hour: 9, minute: 30 }); api.clearValue(); api.setFocusedValue(parseDate('2026-06-08')); api.setOpen(true); api.focusMonth(6); api.focusYear(2026); api.getYears(); api.getMonths(); api.getYearsGrid({ columns: 4 }); api.getMonthsGrid({ columns: 4 }); api.getDecade(); api.setView('month'); api.goToNext(); api.goToPrev(); api.getRangePresetValue('last7Days'); api.getWeekNumber(api.weeks[0] ?? []); api.getDaysInWeek(1); api.getOffset({ months: 1 });",
      "  const evidence = 'idle open focused closed disabled readOnly invalid inline empty hoveredValue unavailable selected today weekend isInteractive visibleDuration visibleRange visibleRangeText isPrevVisibleRangeValid isNextVisibleRangeValid value defaultValue focusedValue defaultFocusedValue inputValue placeholderValue valueAsString valueAsDate setValue clearValue setTime selectToday selectionMode single multiple range maxSelectedDates isSelectingEndDate hasSelectedRange hoveredRange closeOnSelect outsideDaySelectable PRESET.CLICK day month year minView maxView defaultView VIEW.SET onViewChange getNextView getPreviousView decade nextTrigger prevTrigger GOTO.NEXT GOTO.PREV getNextPage getPreviousPage focusNextYear focusPreviousYear focusNextDecade focusPreviousDecade getMonthsGrid getYearsGrid getWeekDays getWeekOfYear TABLE.ARROW_LEFT TABLE.ARROW_RIGHT TABLE.ARROW_UP TABLE.ARROW_DOWN TABLE.PAGE_UP TABLE.PAGE_DOWN TABLE.HOME TABLE.END TABLE.ENTER TABLE.ESCAPE role application role grid role gridcell role button aria-roledescription aria-label aria-selected aria-disabled aria-invalid aria-current aria-multiselectable aria-readonly aria-labelledby data-state date-picker-traces upload-artifact';",
      "  return (",
      "    <div {...api.getRootProps()} data-evidence={evidence}>",
      "      <label {...api.getLabelProps()}>Booking date</label>",
      "      <div {...api.getControlProps()}>",
      "        <input {...api.getInputProps({ index: 0 })} />",
      "        <button {...api.getTriggerProps()}>open</button>",
      "        <button {...api.getClearTriggerProps()}>clear</button>",
      "      </div>",
      "      <span {...api.getRangeTextProps()}>{api.valueAsString.join(' - ')}</span>",
      "      <div {...api.getPositionerProps()}>",
      "        <div {...api.getContentProps()}>",
      "          <div {...api.getViewControlProps({ view: 'day' })}>",
      "            <button {...api.getPrevTriggerProps({ view: 'day' })}>previous</button>",
      "            <button {...api.getViewTriggerProps({ view: 'day' })}>month</button>",
      "            <button {...api.getNextTriggerProps({ view: 'day' })}>next</button>",
      "          </div>",
      "          <select {...api.getMonthSelectProps()} />",
      "          <select {...api.getYearSelectProps()} />",
      "          <table {...api.getTableProps({ view: 'day' })}>",
      "            <thead {...api.getTableHeadProps({ view: 'day' })}><tr {...api.getTableRowProps({ view: 'day' })}><th {...api.getTableHeaderProps({ view: 'day' })}>Mo</th></tr></thead>",
      "            <tbody {...api.getTableBodyProps({ view: 'day' })}>{api.weeks.map((week, weekIndex) => <tr key={weekIndex} {...api.getTableRowProps({ view: 'day' })}>{week.map((value) => <td key={value.toString()} {...api.getDayTableCellProps({ value })}><button {...api.getDayTableCellTriggerProps({ value })}>{value.day}</button></td>)}</tr>)}</tbody>",
      "          </table>",
      "          <button {...api.getPresetTriggerProps({ value: api.getRangePresetValue('last7Days') })}>Last 7 days</button>",
      "        </div>",
      "      </div>",
      "    </div>",
      "  );",
      "}",
      "",
      "export function SegmentedDateInput() {",
      "  const service = useMachine(dateInput.machine, { id: 'segmented-date', selectionMode: 'range', granularity: 'minute', defaultValue: [parseDate('2026-06-06')], placeholderValue: parseDate('2026-06-01'), shouldForceLeadingZeros: true, onValueChange: console.info, onPlaceholderChange: console.info, onFocusChange: console.info });",
      "  const api = dateInput.connect(service, normalizeProps);",
      "  const inputEvidence = 'date-input root label control segmentGroup segment hiddenInput idle focused disabled readOnly invalid value defaultValue placeholderValue valueAsString valueAsDate displayValues activeIndex activeSegmentIndex enteredKeys SEGMENT.FOCUS SEGMENT.BLUR SEGMENT.INPUT SEGMENT.ADJUST SEGMENT.ARROW_LEFT SEGMENT.ARROW_RIGHT SEGMENT.BACKSPACE SEGMENT.HOME SEGMENT.END SEGMENT.PASTE role spinbutton contentEditable aria-valuenow aria-valuetext aria-valuemin aria-valuemax aria-invalid aria-readonly aria-disabled hidden input';",
      "  return <div {...api.getRootProps()} data-evidence={inputEvidence}><label {...api.getLabelProps()}>Segmented date</label><div {...api.getControlProps()}>{api.getSegments().map((segment) => <span key={segment.type} {...api.getSegmentProps({ segment })}>{segment.text}</span>)}</div><input {...api.getHiddenInputProps()} /></div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-date-picker.tsx"), [
      "import { useState } from 'react';",
      "",
      "export function CustomDatePicker() {",
      "  const [open, setOpen] = useState(false);",
      "  const [view, setView] = useState<'day' | 'month' | 'year'>('day');",
      "  const [value, setValue] = useState(['2026-06-06']);",
      "  const traces = 'custom date picker root label control input trigger clearTrigger content positioner table tableCell tableCellTrigger monthSelect yearSelect rangeText viewControl viewTrigger prevTrigger nextTrigger presetTrigger date-input segmentGroup segment hiddenInput idle open focused closed disabled readonly invalid inline empty hovered unavailable selected today weekend value default-value focused-value default-focused-value input-value placeholder-value value-as-string value-as-date set-value clear-value set-time select-today single multiple range max-selected-dates selecting-end-date selected-range hovered-range close-on-select outside-day-selectable preset-click day-view month-view year-view min-view max-view view-change set-view next-view previous-view decade next-trigger prev-trigger goto-next goto-prev next-page previous-page next-year previous-year next-decade previous-decade month-grid year-grid week-days week-numbers segment-focus segment-blur segment-input segment-adjust segment-arrow-left segment-arrow-right segment-backspace segment-home segment-end segment-paste spinbutton contenteditable arrow-left arrow-right arrow-up arrow-down page-up page-down home end enter escape role-application role-grid role-gridcell role-button role-spinbutton aria-roledescription aria-label aria-selected aria-disabled aria-invalid aria-current aria-multiselectable aria-readonly aria-labelledby hidden-input data-state keyboard-test range-test segment-test aria-test date-picker-traces upload-artifact';",
      "  function onKeyDown(event: KeyboardEvent) { if (event.key === 'ArrowRight') setValue(['2026-06-07']); if (event.key === 'Escape') setOpen(false); if (event.key === 'PageUp') setView('year'); }",
      "  return <section data-part='root' data-state={open ? 'open' : 'closed'} data-evidence={traces}>",
      "    <label id='booking-label' data-part='label'>Booking date</label>",
      "    <div data-part='control'><input data-part='input' aria-labelledby='booking-label' onKeyDown={onKeyDown} /><button data-part='trigger' aria-controls='booking-content' onClick={() => setOpen(true)}>Open</button><button data-part='clear-trigger' onClick={() => setValue([])}>Clear</button></div>",
      "    <span data-part='range-text'>{value.join(' - ')}</span>",
      "    <div data-part='positioner'><div id='booking-content' data-part='content' role='application' aria-roledescription='datepicker' aria-label='Booking calendar'>",
      "      <div data-part='view-control'><button data-part='prev-trigger'>Prev</button><button data-part='view-trigger' onClick={() => setView('month')}>{view}</button><button data-part='next-trigger'>Next</button></div>",
      "      <select data-part='month-select' aria-label='Month'></select><select data-part='year-select' aria-label='Year'></select>",
      "      <table data-part='table' role='grid' aria-multiselectable='true' aria-readonly='false' aria-disabled='false'><thead data-part='table-head'><tr data-part='table-row'><th data-part='table-header'>Mon</th></tr></thead><tbody data-part='table-body'><tr data-part='table-row'><td data-part='table-cell' role='gridcell' aria-selected='true' aria-disabled='false' aria-current='date'><button data-part='table-cell-trigger' role='button' aria-label='June 6 2026' data-state='selected'>6</button></td></tr></tbody></table>",
      "      <button data-part='preset-trigger' onClick={() => setValue(['2026-06-01', '2026-06-07'])}>Last 7 days</button>",
      "    </div></div>",
      "    <div data-part='segment-group' role='group' aria-labelledby='booking-label'><span data-part='segment' role='spinbutton' contentEditable aria-valuenow={6} aria-valuetext='six' aria-valuemin={1} aria-valuemax={31} aria-invalid='false' aria-readonly='false' aria-disabled='false'>06</span><input data-part='hidden-input' type='hidden' value={value[0] ?? ''} /></div>{traces}</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "date-picker.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it } from 'vitest';",
      "",
      "describe('date picker readiness', () => {",
      "  it('covers keyboard, range, segment, aria, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    render(<div role='application' aria-roledescription='datepicker'><table role='grid'><tbody><tr><td role='gridcell' aria-selected='true'><button>6</button></td></tr></tbody></table><span role='spinbutton' aria-valuenow='6'>06</span></div>);",
      "    await user.keyboard('{ArrowRight}{PageUp}{Home}{End}{Enter}{Escape}');",
      "    await user.click(screen.getByRole('button', { name: '6' }));",
      "    expect('keyboard-test range-test segment-test aria-test date-picker-traces upload-artifact').toContain('segment-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "date-picker.yml"), [
      "name: date-picker-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- date-picker",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: date-picker-traces",
      "          path: test-results/date-picker"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/date-picker": "latest",
        "@zag-js/date-input": "latest",
        "@zag-js/date-utils": "latest",
        "@internationalized/date": "latest",
        "@zag-js/core": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "date-picker-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      datePickerSetups: Array<{ filePath: string; framework: string; rootCount: number; labelCount: number; controlCount: number; inputCount: number; triggerCount: number; contentCount: number; tableCount: number; cellCount: number; segmentCount: number; rangeCount: number; selectionCount: number; navigationCount: number; keyboardCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      viewSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      segmentSignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Date picker readiness Zag date-picker date-input range calendar segment keyboard accessibility tests");
    expect(report.datePickerSetups.some((item) => item.filePath === "src/zag-date-picker.tsx" && item.framework === "zag-date-picker" && item.rootCount > 0 && item.controlCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.tableCount > 0 && item.cellCount > 0 && item.rangeCount > 0 && item.selectionCount > 0 && item.navigationCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.datePickerSetups.some((item) => item.filePath === "src/zag-date-picker.tsx" && item.framework === "zag-date-picker" && item.segmentCount > 0)).toBe(true);
    expect(report.datePickerSetups.some((item) => item.filePath === "src/custom-date-picker.tsx" && item.framework === "custom" && item.rootCount > 0 && item.controlCount > 0 && item.inputCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.tableCount > 0 && item.cellCount > 0 && item.segmentCount > 0 && item.rangeCount > 0 && item.selectionCount > 0 && item.navigationCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-date-picker", "zag-date-input", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "label", "control", "input", "trigger", "content", "positioner", "table", "table-cell", "table-cell-trigger", "month-select", "year-select", "range-text", "segment-group", "segment", "hidden-input"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "open", "focused", "closed", "disabled", "readonly", "invalid", "inline", "empty", "hovered", "unavailable", "selected", "today", "weekend"]));
    expect(readySignals(report.valueSignals)).toEqual(expect.arrayContaining(["value", "default-value", "focused-value", "default-focused-value", "input-value", "placeholder-value", "value-as-string", "value-as-date", "set-value", "clear-value", "set-time", "select-today"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["single", "multiple", "range", "max-selected-dates", "selecting-end-date", "selected-range", "hovered-range", "close-on-select", "outside-day-selectable", "preset-click"]));
    expect(readySignals(report.viewSignals)).toEqual(expect.arrayContaining(["day-view", "month-view", "year-view", "min-view", "max-view", "view-change", "set-view", "next-view", "previous-view", "decade"]));
    expect(readySignals(report.navigationSignals)).toEqual(expect.arrayContaining(["next-trigger", "prev-trigger", "goto-next", "goto-prev", "next-page", "previous-page", "next-year", "previous-year", "next-decade", "previous-decade", "month-grid", "year-grid", "week-days", "week-numbers"]));
    expect(readySignals(report.segmentSignals)).toEqual(expect.arrayContaining(["segment-focus", "segment-blur", "segment-input", "segment-adjust", "segment-arrow-left", "segment-arrow-right", "segment-backspace", "segment-home", "segment-end", "segment-paste", "spinbutton", "contenteditable"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-left", "arrow-right", "arrow-up", "arrow-down", "page-up", "page-down", "home", "end", "enter", "escape"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-application", "role-grid", "role-gridcell", "role-button", "role-spinbutton", "aria-roledescription", "aria-label", "aria-selected", "aria-disabled", "aria-invalid", "aria-current", "aria-multiselectable", "aria-readonly", "aria-labelledby", "hidden-input", "data-state"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "range-test", "segment-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/date-picker", "@zag-js/date-input", "@internationalized/date", "@zag-js/date-utils", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/date-picker"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records date picker readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "date-picker-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "date-picker-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "date-picker-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "date-picker-readiness.md"), "utf8");
    expect(markdown).toContain("Date Picker Readiness");
    expect(markdown).toContain("@zag-js/date-picker");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "date-picker-readiness.html"), "utf8");
    expect(html).toContain("date-picker-readiness-card");
    expect(html).toContain("data-source-pattern=\"DatePicker\"");
    expect(html).toContain("RepoTutor records date picker readiness only");
  });

  it("detects Zag date-picker machine readiness without opening real calendars", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-date-picker-machine-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-date-picker-machine-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "date-picker-machine-notes.ts"), [
      "import { anatomy } from '@zag-js/anatomy';",
      "import { createGuards, createMachine } from '@zag-js/core';",
      "import { trackDismissableElement } from '@zag-js/dismissable';",
      "import { getElementById } from '@zag-js/dom-query';",
      "import { setupLiveRegion } from '@zag-js/live-region';",
      "import { getPlacement } from '@zag-js/popper';",
      "import type { PropTypes } from '@zag-js/types';",
      "import { compact } from '@zag-js/utils';",
      "import { parseDate } from '@internationalized/date';",
      "import { getWeekDays } from '@zag-js/date-utils';",
      "import * as datePicker from '@zag-js/date-picker';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import React from 'react';",
      "",
      "const guards = createGuards<DatePickerSchema>();",
      "const machine = createMachine<DatePickerSchema>({ props: () => ({ locale: 'en-US', timeZone: 'UTC', selectionMode: 'range', numOfMonths: 2, minView: 'day', maxView: 'year', defaultView: 'day', outsideDaySelectable: false, closeOnSelect: true, positioning: { placement: 'bottom' } }), initialState: ({ prop }) => prop('open') ? 'open' : 'idle', refs: ({ prop }) => ({ announcer: setupLiveRegion() }), context: ({ bindable }) => ({ focusedValue: bindable(() => parseDate('2026-06-06')), value: bindable(() => []), inputValue: bindable(() => ''), activeIndex: bindable(() => 0), hoveredValue: bindable(() => null), view: bindable(() => 'day'), startValue: bindable(() => parseDate('2026-06-01')), currentPlacement: bindable(() => undefined), restoreFocus: bindable(() => false) }), computed: { isInteractive: ({ prop }) => !prop('disabled') && !prop('readOnly'), visibleDuration: () => ({ months: 2 }), endValue: () => parseDate('2026-07-01'), visibleRange: () => ({}), visibleRangeText: () => '', isPrevVisibleRangeValid: () => true, isNextVisibleRangeValid: () => true, valueAsString: () => [] }, effects: ['setupLiveRegion'], watch: { locale: ['setStartValue', 'syncInputElement'], focusedValue: ['setStartValue', 'focusActiveCellIfNeeded', 'setHoveredValueIfKeyboard'], startValue: ['syncMonthSelectElement', 'syncYearSelectElement', 'invokeOnVisibleRangeChange'], inputValue: ['syncInputValue'], value: ['syncInputElement'], valueAsString: ['announceValueText'], view: ['focusActiveCell'], open: ['toggleVisibility'] }, on: { 'VALUE.SET': {}, 'VIEW.SET': {}, 'FOCUS.SET': {}, 'VALUE.CLEAR': {}, 'INPUT.CHANGE': {}, 'INPUT.ENTER': {}, 'INPUT.FOCUS': {}, 'INPUT.BLUR': {}, 'PRESET.CLICK': {}, 'GOTO.NEXT': {}, 'GOTO.PREV': {} }, states: { idle: {}, focused: {}, open: { effects: ['trackDismissableElement', 'trackPositioning'], on: { 'CONTROLLED.CLOSE': {}, 'CELL.CLICK': {}, 'CELL.POINTER_MOVE': {}, 'CELL.POINTER_LEAVE': {}, 'TABLE.ARROW_LEFT': {}, 'TABLE.ARROW_RIGHT': {}, 'TABLE.ARROW_UP': {}, 'TABLE.ARROW_DOWN': {}, 'TABLE.PAGE_UP': {}, 'TABLE.PAGE_DOWN': {}, 'TABLE.HOME': {}, 'TABLE.END': {}, 'TABLE.ENTER': {}, 'TABLE.ESCAPE': {}, 'TRIGGER.CLICK': {}, 'VIEW.CLICK': {}, 'INTERACT_OUTSIDE': {}, CLOSE: {} } } }, guards: { isAboveMinView: () => true, isDayView: () => true, isMonthView: () => false, isYearView: () => false, isRangePicker: () => true, hasSelectedRange: () => false, isMultiPicker: () => false, canSelectDate: () => true, shouldRestoreFocus: () => true, isSelectingEndDate: () => false, closeOnSelect: () => true, isOpenControlled: () => false, isInteractOutsideEvent: () => false, isInputValueEmpty: () => false, shouldFixOnBlur: () => false, isDayPointerMoveOutsideVisibleMonth: () => false }, actions: { setNextView() {}, setPreviousView() {}, setView() {}, setRestoreFocus() {}, announceValueText() {}, announceVisibleRange() {}, disableTextSelection() {}, enableTextSelection() {}, focusFirstSelectedDate() {}, syncInputElement() {}, setFocusedDate() {}, setFocusedValueForView() {}, focusNextMonth() {}, focusPreviousMonth() {}, setDateValue() {}, clearDateValue() {}, setSelectedDate() {}, resetSelection() {}, toggleSelectedDate() {}, setHoveredDate() {}, clearHoveredDate() {}, selectFocusedDate() {}, focusNextDay() {}, focusPreviousDay() {}, focusNextWeek() {}, focusPreviousWeek() {}, focusNextPage() {}, focusPreviousPage() {}, focusNextSection() {}, focusPreviousSection() {}, focusNextYear() {}, focusPreviousYear() {}, focusNextDecade() {}, focusPreviousDecade() {}, focusNextMonthColumn() {}, focusPreviousMonthColumn() {}, focusNextYearColumn() {}, focusPreviousYearColumn() {}, focusFirstDay() {}, focusLastDay() {}, clearFocusedDate() {}, setActiveIndex() {}, setActiveIndexToEnd() {}, setActiveIndexToStart() {}, focusActiveCell() {}, focusActiveCellIfNeeded() {}, setHoveredValueIfKeyboard() {}, focusTriggerElement() {}, focusFirstInputElement() {}, focusInputElement() {}, syncMonthSelectElement() {}, syncYearSelectElement() {}, setInputValue() {}, syncInputValue() {}, focusParsedDate() {}, selectParsedDate() {}, resetView() {}, setStartValue() {}, invokeOnOpen() {}, invokeOnClose() {}, invokeOnVisibleRangeChange() {}, toggleVisibility() {} } });",
      "",
      "const dom = { getLabelId: 'label-id', getRootId: 'root-id', getTableId: 'table-id', getTableHeaderId: 'table-header-id', getTableBodyId: 'table-body-id', getTableRowId: 'table-row-id', getContentId: 'content-id', getCellTriggerId: 'cell-trigger-id', getPrevTriggerId: 'prev-trigger-id', getNextTriggerId: 'next-trigger-id', getViewTriggerId: 'view-trigger-id', getClearTriggerId: 'clear-trigger-id', getControlId: 'control-id', getInputId: 'input-id', getTriggerId: 'trigger-id', getPositionerId: 'positioner-id', getMonthSelectId: 'month-select-id', getYearSelectId: 'year-select-id', getFocusedCell: 'focused-cell', getTriggerEl: 'trigger-el', getContentEl: 'content-el', getInputEls: 'input-els', getYearSelectEl: 'year-select-el', getMonthSelectEl: 'month-select-el', getClearTriggerEl: 'clear-trigger-el', getPositionerEl: 'positioner-el', getControlEl: 'control-el' };",
      "",
      "export function DatePickerMachineProbe() {",
      "  const service = useMachine(datePicker.machine, { id: 'machine-probe', locale: 'en-US', timeZone: 'UTC', selectionMode: 'range', defaultOpen: true });",
      "  const api = datePicker.connect(service, normalizeProps);",
      "  api.focused; api.open; api.disabled; api.invalid; api.readOnly; api.inline; api.numOfMonths; api.showWeekNumbers; api.selectionMode; api.maxSelectedDates; api.isMaxSelected; api.view; api.isUnavailable(parseDate('2026-06-06')); api.weeks; api.weekDays; api.visibleRangeText; api.value; api.valueAsDate; api.valueAsString; api.focusedValue; api.focusedValueAsDate; api.focusedValueAsString; api.visibleRange;",
      "  api.getRangePresetValue('last7Days'); api.getWeekNumber(api.weeks[0] ?? []); api.getDaysInWeek(1); api.getOffset({ months: 1 }); api.getMonthWeeks({ month: parseDate('2026-06-01') }); api.selectToday(); api.setValue([parseDate('2026-06-07')]); api.setTime({ hour: 9 }); api.clearValue(); api.setFocusedValue(parseDate('2026-06-08')); api.setOpen(true); api.focusMonth(6); api.focusYear(2026); api.getYears(); api.getMonths(); api.getYearsGrid({ columns: 4 }); api.getDecade(); api.getMonthsGrid({ columns: 4 }); api.format(parseDate('2026-06-09')); api.setView('month'); api.goToNext(); api.goToPrev();",
      "  const apiSurfaceEvidence = 'dir prop data-disabled data-readonly data-empty data-placeholder-shown data-placement data-side data-inline data-view data-selectable autoComplete off autoCorrect off spellCheck false';",
      "  return <div {...api.getRootProps()} data-api-evidence={apiSurfaceEvidence}><label {...api.getLabelProps()} /><div {...api.getControlProps()}><input {...api.getInputProps({ index: 0 })} /><button {...api.getTriggerProps()} /><button {...api.getClearTriggerProps()} /></div><span {...api.getRangeTextProps()} /><div {...api.getPositionerProps()}><div {...api.getContentProps()}><table {...api.getTableProps({ view: 'day' })}><thead {...api.getTableHeadProps({ view: 'day' })}><tr {...api.getTableRowProps({ view: 'day' })}><th {...api.getTableHeaderProps({ view: 'day' })} /></tr></thead><tbody {...api.getTableBodyProps({ view: 'day' })}><tr {...api.getTableRowProps({ view: 'day' })}><td {...api.getWeekNumberCellProps({ week: [] })} /><td {...api.getDayTableCellProps({ value: parseDate('2026-06-06') })}><button {...api.getDayTableCellTriggerProps({ value: parseDate('2026-06-06') })} /></td></tr></tbody></table><table {...api.getTableProps({ view: 'month' })}><tbody><tr><td {...api.getMonthTableCellProps({ months: api.getMonthsGrid({ columns: 4 })[0] })}><button {...api.getMonthTableCellTriggerProps({ months: api.getMonthsGrid({ columns: 4 })[0] })} /></td></tr></tbody></table><table {...api.getTableProps({ view: 'year' })}><tbody><tr><td {...api.getYearTableCellProps({ years: api.getYearsGrid({ columns: 4 })[0] })}><button {...api.getYearTableCellTriggerProps({ years: api.getYearsGrid({ columns: 4 })[0] })} /></td></tr></tbody></table><button {...api.getNextTriggerProps({ view: 'day' })} /><button {...api.getPrevTriggerProps({ view: 'day' })} /><button {...api.getViewTriggerProps({ view: 'day' })} /><div {...api.getViewProps({ view: 'day' })} /><div {...api.getViewControlProps({ view: 'day' })} /><select {...api.getMonthSelectProps()} /><select {...api.getYearSelectProps()} /><button {...api.getPresetTriggerProps({ value: api.getRangePresetValue('last7Days') })} /></div></div>{JSON.stringify(dom)}{String(machine)}{String(guards)}{String(anatomy)}{String(trackDismissableElement)}{String(getPlacement)}{String(getElementById)}{String(getWeekDays)}{String(compact)}{String(React)}{String({ PropTypes })}</div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/date-picker": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/live-region": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/date-utils": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "@internationalized/date": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "date-picker-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "create-guards", "default-props", "initial-state", "refs", "bindable-context", "computed-state", "watch-props", "root-events", "open-state", "implementation-block"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["focused-value", "value", "input-value", "active-index", "hovered-value", "view", "start-value", "current-placement", "restore-focus"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-interactive", "visible-duration", "end-value", "visible-range", "visible-range-text", "prev-visible-range-valid", "next-visible-range-valid", "value-as-string"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["setup-live-region", "track-positioning", "track-dismissable-element"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["is-above-min-view", "is-day-view", "is-month-view", "is-year-view", "is-range-picker", "has-selected-range", "is-multi-picker", "can-select-date", "should-restore-focus", "is-selecting-end-date", "close-on-select", "is-open-controlled", "interact-outside-event", "input-value-empty", "fix-on-blur", "day-pointer-outside-visible-month"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["view-actions", "restore-focus", "announce-actions", "text-selection", "sync-input", "focused-date", "date-value", "range-selection", "hovered-date", "keyboard-navigation", "active-index", "focus-elements", "select-sync", "parse-input", "visible-range", "open-close-callbacks", "toggle-visibility"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["label-id", "root-id", "table-id", "table-header-id", "table-body-id", "table-row-id", "content-id", "cell-trigger-id", "prev-trigger-id", "next-trigger-id", "view-trigger-id", "clear-trigger-id", "control-id", "input-id", "trigger-id", "positioner-id", "month-select-id", "year-select-id", "focused-cell", "trigger-el", "content-el", "input-els", "year-select-el", "month-select-el", "clear-trigger-el", "positioner-el", "control-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["focused", "open", "disabled", "invalid", "read-only", "inline", "num-of-months", "show-week-numbers", "selection-mode", "max-selected-dates", "is-max-selected", "view-api", "unavailable-api", "weeks-api", "week-days-api", "visible-range-text-api", "value-api", "value-as-date", "value-as-string-api", "focused-value-api", "focused-value-as-date", "focused-value-as-string", "visible-range-api", "range-preset-value", "week-number", "days-in-week", "offset-api", "month-weeks", "select-today-api", "set-value-api", "set-time-api", "clear-value-api", "set-focused-value-api", "set-open-api", "focus-month", "focus-year", "years-api", "months-api", "years-grid", "decade-api", "months-grid", "format-api", "set-view-api", "go-to-next", "go-to-prev", "root-props", "label-props", "control-props", "range-text-props", "content-props", "table-props", "table-head-props", "table-header-props", "table-body-props", "table-row-props", "week-number-cell-props", "day-table-cell-state", "day-table-cell-props", "day-table-cell-trigger-props", "month-table-cell-props", "month-table-cell-trigger-props", "year-table-cell-props", "year-table-cell-trigger-props", "next-trigger-props", "prev-trigger-props", "clear-trigger-props", "trigger-props", "view-props", "view-trigger-props", "view-control-props", "input-props", "month-select-props", "year-select-props", "positioner-props", "preset-trigger-props", "dir-prop", "data-disabled", "data-readonly", "data-empty", "data-placeholder-shown", "data-placement", "data-side", "data-inline", "data-view", "data-selectable", "autocomplete-off", "autocorrect-off", "spellcheck-false"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/date-picker", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/live-region", "@zag-js/dismissable", "@zag-js/date-utils", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "@internationalized/date", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "date-picker-readiness.md"), "utf8");
    expect(markdown).toContain("Machine Signals");
    expect(markdown).toContain("@zag-js/popper");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "date-picker-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("@zag-js/popper");
  });

  it("detects marquee readiness without running real animations", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-marquee-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-marquee-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-marquee.tsx"), [
      "import * as marquee from '@zag-js/marquee';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function SponsorMarquee() {",
      "  const service = useMachine(marquee.machine, {",
      "    id: 'sponsors',",
      "    dir: 'ltr',",
      "    side: 'start',",
      "    speed: 80,",
      "    delay: 0.25,",
      "    loopCount: 3,",
      "    spacing: '2rem',",
      "    autoFill: true,",
      "    pauseOnInteraction: true,",
      "    reverse: true,",
      "    defaultPaused: false,",
      "    translations: { root: 'Sponsor logos' },",
      "    onPauseChange: console.info,",
      "    onLoopComplete: console.info,",
      "    onComplete: console.info",
      "  });",
      "  const api = marquee.connect(service, normalizeProps);",
      "  api.paused; api.orientation; api.side; api.multiplier; api.contentCount; api.pause(); api.resume(); api.togglePause(); api.restart();",
      "  const evidence = 'idle paused resumed reverse horizontal vertical speed delay loopCount spacing duration --marquee-duration --marquee-spacing --marquee-delay --marquee-loop-count --marquee-translate autoFill multiplier contentCount rootSize contentSize dimensions ResizeObserver requestAnimationFrame PAUSE RESUME TOGGLE_PAUSE RESTART pauseOnInteraction mouseenter mouseleave focus capture blur capture restart animationiteration animationend keyframes role region aria-roledescription marquee aria-live off aria-label presentation clone aria-hidden data-state data-orientation data-paused prefers-reduced-motion marquee-traces upload-artifact';",
      "  return <div {...api.getRootProps()} data-evidence={evidence}>",
      "    <div {...api.getViewportProps()}>{Array.from({ length: api.contentCount }).map((_, index) => <div key={index} {...api.getContentProps({ index })}><span {...api.getItemProps()}>Sponsor {index}</span></div>)}</div>",
      "    <div {...api.getEdgeProps({ side: 'start' })} />",
      "    <button onClick={api.pause}>Pause</button><button onClick={api.resume}>Resume</button><button onClick={api.togglePause}>Toggle</button><button onClick={api.restart}>Restart</button>{evidence}",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-marquee.tsx"), [
      "export function CustomMarquee() {",
      "  const evidence = 'custom marquee root viewport content edge item clone css-variable --marquee-duration --marquee-spacing --marquee-delay --marquee-loop-count --marquee-translate idle paused resumed reverse horizontal vertical speed delay loop-count spacing duration translate keyframes animation-iteration animation-end restart auto-fill multiplier content-count root-size content-size resize-observer request-animation-frame dimension-snapshot pause resume toggle-pause pause-on-interaction mouse-enter mouse-leave focus-capture blur-capture role-region aria-roledescription aria-live-off aria-label presentation-clone aria-hidden-clone reduced-motion data-state data-orientation data-paused pause-test loop-test measurement-test aria-test marquee-traces upload-artifact';",
      "  return <section role='region' aria-roledescription='marquee' aria-live='off' aria-label='Sponsor logos' data-part='root' data-state='idle' data-orientation='horizontal' data-paused='false' data-evidence={evidence} onMouseEnter={() => {}} onMouseLeave={() => {}} onFocusCapture={() => {}} onBlurCapture={() => {}}>",
      "    <div data-part='viewport' onAnimationIteration={() => {}} onAnimationEnd={() => {}} style={{ overflow: 'hidden', contain: 'layout style paint', ['--marquee-duration' as string]: '12s', ['--marquee-spacing' as string]: '2rem', ['--marquee-delay' as string]: '0.25s', ['--marquee-loop-count' as string]: 'infinite', ['--marquee-translate' as string]: '-100%' }}>",
      "      <div data-part='content' data-index='0' style={{ animation: 'marquee var(--marquee-duration) linear infinite', willChange: 'transform', transform: 'translateZ(0)' }}><span data-part='item'>A</span></div>",
      "      <div data-part='content' data-index='1' data-clone role='presentation' aria-hidden='true'><span data-part='item'>A clone</span></div>",
      "    </div><div data-part='edge' data-side='start' /><button data-action='pause'>Pause</button><button data-action='resume'>Resume</button><button data-action='toggle-pause'>Toggle</button><button data-action='restart'>Restart</button>{evidence}</section>;",
      "}",
      "",
      "export const styles = '@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(var(--marquee-translate)); } } @media (prefers-reduced-motion: reduce) { [data-part=\"content\"] { animation: none; } }';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "marquee.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('marquee readiness', () => {",
      "  it('covers pause, loop, measurement, aria, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    const ResizeObserver = vi.fn();",
      "    window.requestAnimationFrame(() => 0);",
      "    render(<section role='region' aria-roledescription='marquee' aria-live='off' aria-label='Sponsor logos'><button>Pause</button><div role='presentation' aria-hidden='true'>clone</div></section>);",
      "    await user.hover(screen.getByRole('region', { name: 'Sponsor logos' }));",
      "    await user.click(screen.getByRole('button', { name: 'Pause' }));",
      "    expect('pause-test loop-test measurement-test aria-test marquee-traces upload-artifact ResizeObserver animationiteration animationend').toContain('measurement-test');",
      "    expect(ResizeObserver).toBeDefined();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "marquee.yml"), [
      "name: marquee-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- marquee",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: marquee-traces",
      "          path: test-results/marquee"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/marquee": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "marquee-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      marqueeSetups: Array<{ filePath: string; framework: string; rootCount: number; viewportCount: number; contentCount: number; itemCount: number; edgeCount: number; cloneCount: number; controlCount: number; measurementCount: number; motionCount: number; pauseCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      motionSignals: Array<{ signal: string; readiness: string }>;
      measurementSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Marquee readiness Zag marquee motion autofill pause interaction accessibility tests");
    expect(report.marqueeSetups.some((item) => item.filePath === "src/zag-marquee.tsx" && item.framework === "zag-marquee" && item.rootCount > 0 && item.viewportCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.edgeCount > 0 && item.cloneCount > 0 && item.controlCount > 0 && item.measurementCount > 0 && item.motionCount > 0 && item.pauseCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.marqueeSetups.some((item) => item.filePath === "src/custom-marquee.tsx" && item.framework === "custom" && item.rootCount > 0 && item.viewportCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.edgeCount > 0 && item.cloneCount > 0 && item.controlCount > 0 && item.measurementCount > 0 && item.motionCount > 0 && item.pauseCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-marquee", "css-marquee", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "viewport", "content", "item", "edge", "clone", "css-variable"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "paused", "resumed", "reverse", "horizontal", "vertical"]));
    expect(readySignals(report.motionSignals)).toEqual(expect.arrayContaining(["speed", "delay", "loop-count", "spacing", "duration", "translate", "keyframes", "animation-iteration", "animation-end", "restart"]));
    expect(readySignals(report.measurementSignals)).toEqual(expect.arrayContaining(["auto-fill", "multiplier", "content-count", "root-size", "content-size", "resize-observer", "request-animation-frame", "dimension-snapshot"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pause", "resume", "toggle-pause", "pause-on-interaction", "mouse-enter", "mouse-leave", "focus-capture", "blur-capture", "restart"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-region", "aria-roledescription", "aria-live-off", "aria-label", "presentation-clone", "aria-hidden-clone", "reduced-motion", "data-state", "data-orientation", "data-paused"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pause-test", "loop-test", "measurement-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/marquee", "@zag-js/core", "@zag-js/dom-query", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/marquee"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records marquee readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "marquee-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "marquee-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "marquee-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "marquee-readiness.md"), "utf8");
    expect(markdown).toContain("Marquee Readiness");
    expect(markdown).toContain("@zag-js/marquee");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "marquee-readiness.html"), "utf8");
    expect(html).toContain("marquee-readiness-card");
    expect(html).toContain("data-source-pattern=\"Marquee\"");
    expect(html).toContain("RepoTutor records marquee readiness only");
  });

  it("detects Zag marquee machine readiness without running real animations", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-marquee-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-marquee-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-marquee-machine.tsx"), [
      "import * as marquee from '@zag-js/marquee';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function PartnerLogoMarquee({ id = 'partner-logos' }: { id?: string }) {",
      "  const service = useMachine(marquee.machine, {",
      "    id,",
      "    ids: { root: 'partner-root', viewport: 'partner-viewport', content: 'partner-content' },",
      "    side: 'end',",
      "    speed: 80,",
      "    delay: 0.25,",
      "    loopCount: 2,",
      "    spacing: '2rem',",
      "    autoFill: true,",
      "    pauseOnInteraction: true,",
      "    reverse: true,",
      "    defaultPaused: false,",
      "    translations: { root: 'Partner logos' },",
      "    onPauseChange: console.info,",
      "    onLoopComplete: console.info,",
      "    onComplete: console.info",
      "  });",
      "  const api = marquee.connect(service, normalizeProps);",
      "  api.paused; api.orientation; api.side; api.multiplier; api.contentCount;",
      "  api.pause(); api.resume(); api.togglePause(); api.restart();",
      "  const machineEvidence = 'createMachine MarqueeSchema dir ltr side start speed 50 delay 0 loopCount 0 spacing 1rem autoFill false pauseOnInteraction false reverse false defaultPaused false translations root Marquee content refs dimensions initialDurationSet context paused bindable duration bindable initialState idle computed orientation isVertical multiplier watch speed spacing side PAUSE RESUME TOGGLE_PAUSE RESTART effects trackDimensions';",
      "  const contextEvidence = 'paused bindable value prop paused defaultPaused onPauseChange duration bindable 2000 Math.max speed dimensions ref initialDurationSet ref';",
      "  const computedEvidence = 'orientation isVertical multiplier autoFill rootSize contentSize Math.ceil';",
      "  const effectEvidence = 'trackDimensions getRootEl getContentEl ResizeObserver requestAnimationFrame cancelAnimationFrame refs set dimensions initialDurationSet observer observe disconnect measureDimensions';",
      "  const actionEvidence = 'setPaused setResumed togglePaused restartAnimation recalculateDuration calculateDuration querySelectorAll data-part content animation none offsetHeight';",
      "  const domEvidence = 'getRootId getViewportId getContentId getRootEl getViewportEl getContentEl getEdgePositionStyles getMarqueeTranslate';",
      "  const apiEvidence = 'paused orientation side multiplier contentCount pause resume togglePause restart getRootProps getViewportProps getContentProps getEdgeProps getItemProps role region aria-roledescription marquee aria-live off aria-label dir prop data-state data-orientation data-paused data-part viewport data-part content data-part edge data-index data-side data-reverse data-clone onMouseEnter onMouseLeave onFocusCapture onBlurCapture onAnimationIteration onAnimationEnd onLoopComplete onComplete role presentation aria-hidden display flex flexDirection overflow hidden contain layout style paint pointerEvents none marginInline marginBlock willChange transform translateZ --marquee-duration --marquee-spacing --marquee-delay --marquee-loop-count --marquee-translate';",
      "  const packageEvidence = '@zag-js/marquee @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return <section {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}>",
      "    <div {...api.getViewportProps()}>",
      "      {Array.from({ length: api.contentCount }).map((_, index) => <div key={index} {...api.getContentProps({ index })}><span {...api.getItemProps()}>Logo</span></div>)}",
      "      <div {...api.getEdgeProps({ side: 'start' })} />",
      "    </div>",
      "  </section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/marquee": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "marquee-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-props", "refs", "bindable-context", "idle-state", "computed-state", "watch-props", "global-events", "track-dimensions-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["paused-context", "duration-context", "dimensions-ref", "initial-duration-ref"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["orientation", "is-vertical", "multiplier"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-dimensions", "resize-observer", "request-animation-frame", "dimension-measurement", "observer-cleanup"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-paused", "set-resumed", "toggle-paused", "restart-animation", "recalculate-duration", "calculate-duration"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "viewport-id", "content-id", "root-el", "viewport-el", "content-el", "edge-position-styles", "marquee-translate"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["paused", "orientation", "side", "multiplier", "content-count", "pause", "resume", "toggle-pause", "restart", "root-props", "viewport-props", "content-props", "edge-props", "item-props", "region-role", "animation-events", "pause-interaction-handlers", "clone-accessibility", "css-variables", "dir-prop", "data-part", "data-index", "data-side", "data-reverse", "data-clone", "display-flex", "overflow-hidden", "contain-layout-style-paint", "pointer-events-none", "spacing-margin", "will-change-transform", "translate-z"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/marquee", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "marquee-readiness.md"), "utf8");
    expect(markdown).toContain("Machine Signals");
    expect(markdown).toContain("@zag-js/marquee");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "marquee-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("@zag-js/marquee");
  });

  it("detects TOC readiness without observing real headings", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-toc-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-toc-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-toc.tsx"), [
      "import * as toc from '@zag-js/toc';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const items = [{ value: 'intro', depth: 2 }, { value: 'install', depth: 2 }, { value: 'api', depth: 3 }];",
      "",
      "export function ArticleToc() {",
      "  const service = useMachine(toc.machine, {",
      "    id: 'article-toc',",
      "    dir: 'ltr',",
      "    items,",
      "    defaultActiveIds: ['intro'],",
      "    activeIds: ['intro', 'install'],",
      "    rootMargin: '-20px 0% -40% 0%',",
      "    threshold: 0.25,",
      "    autoScroll: true,",
      "    scrollBehavior: 'smooth',",
      "    scrollEl: () => document.querySelector('[data-scroll-root]') as HTMLElement | null,",
      "    onActiveChange: console.info",
      "  });",
      "  const api = toc.connect(service, normalizeProps);",
      "  api.activeIds; api.activeItems; api.items; api.setActiveIds(['api']); api.scrollTo('api', { behavior: 'instant' }); api.getItemState({ item: items[0] });",
      "  const evidence = 'idle activeIds activeItems defaultActiveIds ACTIVE_IDS.SET active item state first last depth root title list item link indicator heading IntersectionObserver rootMargin threshold scrollEl visibilityMap resizeObserverBorderBox indicatorCleanup autoScroll scrollBehavior scrollTo scrollIntoView scrollToElement getSamePageHash pushHash hashchange indicatorRect isRectEmpty --top --left --width --height active range aria-labelledby aria-current location data-active data-depth data-first data-last dir toc-traces upload-artifact';",
      "  return <nav {...api.getRootProps()} data-evidence={evidence}>",
      "    <h2 {...api.getTitleProps()}>On this page</h2>",
      "    <ol {...api.getListProps()}>{api.items.map((item) => <li key={item.value} {...api.getItemProps({ item })}><a href={`#${item.value}`} {...api.getLinkProps({ item })}>{item.value}</a></li>)}</ol>",
      "    <div {...api.getIndicatorProps()} />",
      "  </nav>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-toc.tsx"), [
      "const headings = [{ value: 'intro', depth: 2 }, { value: 'install', depth: 2 }, { value: 'api', depth: 3 }];",
      "",
      "export function CustomToc() {",
      "  const traces = 'custom toc table-of-contents scroll-spy root title list item link indicator heading css-indicator idle active-ids active-items default-active-ids active-item-state first-active last-active depth intersection-observer root-margin threshold scroll-root visibility-map resize-observer indicator-cleanup auto-scroll scroll-behavior scroll-to scroll-into-view same-page-hash push-hash hashchange indicator-rect rect-empty top-left-width-height active-range aria-labelledby aria-current-location data-active data-depth data-first data-last direction observer-test scroll-test active-test aria-test toc-traces upload-artifact';",
      "  return <nav id='toc-root' aria-labelledby='toc-title' dir='ltr' data-evidence={traces} style={{ ['--top' as string]: '4px', ['--left' as string]: '0px', ['--width' as string]: '120px', ['--height' as string]: '24px' }}>",
      "    <h2 id='toc-title' data-part='title'>On this page</h2>",
      "    <ol data-part='list' data-scroll-root>{headings.map((item, index) => <li key={item.value} data-part='item' data-value={item.value} data-depth={item.depth} data-active={index === 0 ? '' : undefined} data-first={index === 0 ? '' : undefined} data-last={index === 1 ? '' : undefined} style={{ ['--depth' as string]: item.depth }}><a data-part='link' href={`#${item.value}`} aria-current={index === 0 ? 'location' : undefined} onClick={(event) => { event.preventDefault(); history.pushState(null, '', `#${item.value}`); window.dispatchEvent(new HashChangeEvent('hashchange')); document.getElementById(item.value)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>{item.value}</a></li>)}</ol>",
      "    <div data-part='indicator' hidden={false} data-indicator-rect='0,4,120,24' />",
      "    <section id='intro'><h2>Intro</h2></section><section id='install'><h2>Install</h2></section><section id='api'><h3>API</h3></section>{traces}",
      "  </nav>;",
      "}",
      "",
      "export const observerNotes = 'new IntersectionObserver callback visibilityMap rootMargin threshold resizeObserverBorderBox.observe indicatorCleanup getBoundingClientRect isRectEmpty scrollIntoView scrollToElement getSamePageHash pushHash hashchange';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "toc.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('toc readiness', () => {",
      "  it('covers observer, scroll, active state, aria, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    const IntersectionObserver = vi.fn();",
      "    const ResizeObserver = vi.fn();",
      "    render(<nav aria-labelledby='toc-title'><h2 id='toc-title'>On this page</h2><ol><li data-active='' data-depth='2'><a href='#intro' aria-current='location'>Intro</a></li></ol><div data-part='indicator' /></nav>);",
      "    await user.click(screen.getByRole('link', { name: 'Intro' }));",
      "    expect('observer-test scroll-test active-test aria-test toc-traces upload-artifact IntersectionObserver ResizeObserver hashchange').toContain('active-test');",
      "    expect(IntersectionObserver).toBeDefined();",
      "    expect(ResizeObserver).toBeDefined();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "toc.yml"), [
      "name: toc-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- toc",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: toc-traces",
      "          path: test-results/toc"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/toc": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "toc-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tocSetups: Array<{ filePath: string; framework: string; rootCount: number; titleCount: number; listCount: number; itemCount: number; linkCount: number; indicatorCount: number; headingCount: number; activeCount: number; observerCount: number; scrollCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      observerSignals: Array<{ signal: string; readiness: string }>;
      scrollSignals: Array<{ signal: string; readiness: string }>;
      indicatorSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("TOC readiness Zag toc active headings observer indicator scroll accessibility tests");
    expect(report.tocSetups.some((item) => item.filePath === "src/zag-toc.tsx" && item.framework === "zag-toc" && item.rootCount > 0 && item.titleCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.linkCount > 0 && item.indicatorCount > 0 && item.headingCount > 0 && item.activeCount > 0 && item.observerCount > 0 && item.scrollCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.tocSetups.some((item) => item.filePath === "src/custom-toc.tsx" && item.framework === "custom" && item.rootCount > 0 && item.titleCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.linkCount > 0 && item.indicatorCount > 0 && item.headingCount > 0 && item.activeCount > 0 && item.observerCount > 0 && item.scrollCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-toc", "docs-toc", "custom"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "title", "list", "item", "link", "indicator", "heading", "css-indicator"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "active-ids", "active-items", "default-active-ids", "active-item-state", "first-active", "last-active", "depth"]));
    expect(readySignals(report.observerSignals)).toEqual(expect.arrayContaining(["intersection-observer", "root-margin", "threshold", "scroll-root", "visibility-map", "resize-observer", "indicator-cleanup"]));
    expect(readySignals(report.scrollSignals)).toEqual(expect.arrayContaining(["auto-scroll", "scroll-behavior", "scroll-to", "scroll-into-view", "same-page-hash", "push-hash", "hashchange"]));
    expect(readySignals(report.indicatorSignals)).toEqual(expect.arrayContaining(["indicator-rect", "rect-empty", "top-left-width-height", "active-range", "resize-border-box"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-labelledby", "aria-current-location", "data-active", "data-depth", "data-first", "data-last", "direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "observer-test", "scroll-test", "active-test", "aria-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/toc", "@zag-js/core", "@zag-js/dom-query", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/toc"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records TOC readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "toc-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "toc-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "toc-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "toc-readiness.md"), "utf8");
    expect(markdown).toContain("TOC Readiness");
    expect(markdown).toContain("@zag-js/toc");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "toc-readiness.html"), "utf8");
    expect(html).toContain("toc-readiness-card");
    expect(html).toContain("data-source-pattern=\"TOC\"");
    expect(html).toContain("RepoTutor records TOC readiness only");
  });

  it("detects Zag TOC machine readiness without observing real headings", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-toc-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-toc-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-toc-machine.tsx"), [
      "import * as toc from '@zag-js/toc';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const items = [{ value: 'intro', depth: 2 }, { value: 'install', depth: 2 }, { value: 'api', depth: 3 }];",
      "",
      "export function MachineBackedToc({ id = 'article-toc' }: { id?: string }) {",
      "  const service = useMachine(toc.machine, {",
      "    id,",
      "    ids: { root: 'toc-root', title: 'toc-title', list: 'toc-list', indicator: 'toc-indicator', item: (value) => `toc-item-${value}`, link: (value) => `toc-link-${value}` },",
      "    dir: 'ltr',",
      "    items,",
      "    defaultActiveIds: ['intro'],",
      "    activeIds: ['intro', 'install'],",
      "    rootMargin: '-20px 0% -40% 0%',",
      "    threshold: 0,",
      "    autoScroll: true,",
      "    scrollBehavior: 'smooth',",
      "    scrollEl: () => document.querySelector('[data-scroll-root]') as HTMLElement | null,",
      "    onActiveChange: console.info",
      "  });",
      "  const api = toc.connect(service, normalizeProps);",
      "  api.activeIds; api.activeItems; api.items;",
      "  api.setActiveIds(['api']); api.scrollTo('api', { behavior: 'instant' }); api.getItemState({ item: items[0] });",
      "  const machineEvidence = 'createMachine TocSchema dir ltr rootMargin -20px 0% -40% 0% threshold 0 autoScroll true scrollBehavior smooth items initialState idle context activeIds bindable defaultActiveIds activeIds indicatorRect bindable defaultValue null refs visibilityMap indicatorCleanup computed activeItems watch activeIds autoScrollToc syncIndicatorRect entry syncIndicatorRect exit cleanupIndicatorObserver ACTIVE_IDS.SET effects trackHeadingVisibility';",
      "  const contextEvidence = 'activeIds bindable defaultActiveIds activeIds indicatorRect bindable null visibilityMap Map indicatorCleanup ref';",
      "  const computedEvidence = 'activeItems prop items filter ids includes item value';",
      "  const effectEvidence = 'trackHeadingVisibility IntersectionObserver rootMargin threshold scrollEl observerOptions visibilityMap isIntersecting nextActiveIds currentActiveIds observer observe disconnect visibilityMap clear';",
      "  const actionEvidence = 'setActiveIds autoScrollToc scrollIntoView cleanupIndicatorObserver syncIndicatorRect getIndicatorEl indicatorRect getItemEl getListEl getBoundingClientRect resizeObserverBorderBox observe callAll invokeOnActiveChange';",
      "  const domEvidence = 'getRootId getTitleId getListId getItemId getLinkId getIndicatorId getRootEl getListEl getItemEl getIndicatorEl getHeadingEl getDoc getElementById';",
      "  const apiEvidence = 'activeIds activeItems items setActiveIds scrollTo getItemState getRootProps getTitleProps getListProps getItemProps getLinkProps getIndicatorProps aria-labelledby aria-current location dir prop data-value data-depth data-active data-first data-last --depth scrollBehavior scrollIntoView event preventDefault isDownloadingEvent isOpeningInNewTab scrollToElement getSamePageHash pushHash HashChangeEvent position absolute --top --left --width --height hidden isRectEmpty';",
      "  const packageEvidence = '@zag-js/toc @zag-js/react @zag-js/anatomy @zag-js/core @zag-js/dom-query @zag-js/types @zag-js/utils react';",
      "  return <nav {...api.getRootProps()} data-evidence={[machineEvidence, contextEvidence, computedEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence, packageEvidence].join(' ')}>",
      "    <h2 {...api.getTitleProps()}>On this page</h2>",
      "    <ol {...api.getListProps()} data-scroll-root>{api.items.map((item) => <li key={item.value} {...api.getItemProps({ item })}><a href={`#${item.value}`} {...api.getLinkProps({ item })}>{item.value}</a></li>)}</ol>",
      "    <div {...api.getIndicatorProps()} />",
      "  </nav>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "@zag-js/toc": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "toc-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-props", "bindable-context", "refs", "computed-state", "watch-active-ids", "entry-exit-actions", "active-ids-event", "idle-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["active-ids-context", "indicator-rect-context", "visibility-map-ref", "indicator-cleanup-ref"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["active-items"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-heading-visibility", "intersection-observer", "observer-options", "scroll-root", "visibility-map", "observer-cleanup"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-active-ids", "auto-scroll-toc", "cleanup-indicator-observer", "sync-indicator-rect", "resize-observer-border-box", "invoke-active-change"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "title-id", "list-id", "item-id", "link-id", "indicator-id", "root-el", "list-el", "item-el", "indicator-el", "heading-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["active-ids", "active-items", "items", "set-active-ids", "scroll-to", "item-state", "root-props", "title-props", "list-props", "item-props", "link-props", "indicator-props", "aria-labelledby", "aria-current-location", "data-active", "same-page-hash", "push-hash", "scroll-to-element", "css-variables", "hidden-indicator", "dir-prop", "data-value", "data-depth", "data-first", "data-last", "depth-css-var", "scroll-behavior", "scroll-into-view", "prevent-default", "download-guard", "new-tab-guard", "hashchange-event", "indicator-position-absolute"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/toc", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "toc-readiness.md"), "utf8");
    expect(markdown).toContain("Machine Signals");
    expect(markdown).toContain("@zag-js/toc");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "toc-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("@zag-js/toc");
  });

  it("detects floating panel readiness without dragging real panels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-floating-panel-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-floating-panel-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-floating-panel.tsx"), [
      "import * as floatingPanel from '@zag-js/floating-panel';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function InspectorPanel() {",
      "  const service = useMachine(floatingPanel.machine, {",
      "    id: 'inspector-panel',",
      "    dir: 'ltr',",
      "    defaultOpen: true,",
      "    strategy: 'fixed',",
      "    gridSize: 8,",
      "    allowOverflow: false,",
      "    resizable: true,",
      "    draggable: true,",
      "    defaultSize: { width: 320, height: 240 },",
      "    defaultPosition: { x: 300, y: 100 },",
      "    minSize: { width: 240, height: 160 },",
      "    maxSize: { width: 960, height: 640 },",
      "    getAnchorPosition: ({ triggerRect, boundaryRect }) => ({ x: (triggerRect?.x ?? boundaryRect?.x ?? 0) + 12, y: (triggerRect?.y ?? boundaryRect?.y ?? 0) + 24 }),",
      "    lockAspectRatio: true,",
      "    closeOnEscape: true,",
      "    getBoundaryEl: () => document.querySelector('[data-boundary]') as HTMLElement | null,",
      "    initialFocusEl: () => document.querySelector('[data-initial-focus]') as HTMLElement | null,",
      "    finalFocusEl: () => document.querySelector('[data-final-focus]') as HTMLElement | null,",
      "    restoreFocus: true,",
      "    onPositionChange: console.info,",
      "    onPositionChangeEnd: console.info,",
      "    onSizeChange: console.info,",
      "    onSizeChangeEnd: console.info,",
      "    onStageChange: console.info,",
      "    onOpenChange: console.info",
      "  });",
      "  const api = floatingPanel.connect(service, normalizeProps);",
      "  api.open; api.dragging; api.resizing; api.position; api.size; api.setOpen(true); api.setPosition({ x: 320, y: 160 }); api.setSize({ width: 360, height: 260 }); api.minimize(); api.maximize(); api.restore();",
      "  const evidence = 'floating-panel open closed idle dragging resizing minimized maximized default stage topmost behind trigger positioner content header body title resizeTrigger dragTrigger stageTrigger closeTrigger control panelStack bringToFront z-index boundaryRect getBoundaryEl allowOverflow fallback size fallback position strategy fixed absolute anchor position --width --height --x --y pointerMove trackPointerMove pointer capture DRAG_START RESIZE_START DRAG DRAG_END gridSize clampPoint clampSize resizeRect ResizeTriggerAxis n e s w ne nw se sw lockAspectRatio keyboard MOVE ArrowLeft ArrowRight ArrowUp ArrowDown role dialog aria-labelledby aria-controls initialFocus finalFocus restoreFocus closeOnEscape data-state data-stage data-dragging data-topmost floating-panel-traces upload-artifact';",
      "  return <div data-boundary data-evidence={evidence}>",
      "    <button {...api.getTriggerProps()} data-final-focus>Open</button>",
      "    <div {...api.getPositionerProps()}><section {...api.getContentProps()}><header {...api.getHeaderProps()}><h2 {...api.getTitleProps()}>Inspector</h2><div {...api.getDragTriggerProps()}><button {...api.getCloseTriggerProps()}>Close</button><button {...api.getStageTriggerProps({ stage: 'minimized' })}>Minimize</button><button {...api.getStageTriggerProps({ stage: 'maximized' })}>Maximize</button><button {...api.getStageTriggerProps({ stage: 'default' })}>Restore</button></div></header><div {...api.getBodyProps()} data-initial-focus>Body</div><div {...api.getControlProps()} />{(['n','e','s','w','ne','nw','se','sw'] as const).map((axis) => <span key={axis} {...api.getResizeTriggerProps({ axis })} />)}</section></div>",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-floating-panel.tsx"), [
      "const axes = ['n', 'e', 's', 'w', 'ne', 'nw', 'se', 'sw'];",
      "",
      "export function CustomFloatingPanel() {",
      "  const traces = 'custom floating panel trigger positioner content header body title control stage-trigger close-trigger resize-trigger drag-trigger open closed idle dragging resizing minimized maximized default-stage topmost behind size position css-vars strategy-fixed strategy-absolute fallback-size fallback-position anchor-position boundary-rect allow-overflow drag-start resize-start pointer-move pointer-capture grid-size clamp-point resize-axis lock-aspect-ratio keyboard-move panel-stack bring-to-front z-index stack-remove role-dialog aria-labelledby aria-controls initial-focus final-focus restore-focus escape-close data-state data-stage direction pointer-test keyboard-test resize-test stage-test floating-panel-traces upload-artifact';",
      "  return <section role='dialog' aria-labelledby='panel-title' aria-controls='panel-body' dir='ltr' data-floating-panel data-state='open' data-stage='default' data-dragging='' data-topmost='' style={{ ['--width' as string]: '320px', ['--height' as string]: '240px', ['--x' as string]: '300px', ['--y' as string]: '100px', position: 'fixed', zIndex: 12 }} data-evidence={traces}>",
      "    <button data-part='trigger' aria-controls='panel-content'>Open</button>",
      "    <div data-part='positioner' style={{ top: 'var(--y)', left: 'var(--x)', width: 'var(--width)', height: 'var(--height)' }}>",
      "      <div id='panel-content' data-part='content'><header data-part='header'><h2 id='panel-title' data-part='title'>Inspector</h2><div data-part='drag-trigger' onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)} onDoubleClick={() => undefined}>Drag</div><button data-part='close-trigger'>Close</button><button data-part='stage-trigger' data-stage='minimized'>Minimize</button><button data-part='stage-trigger' data-stage='maximized'>Maximize</button><button data-part='stage-trigger' data-stage='default'>Restore</button></header><main id='panel-body' data-part='body'>Body</main><div data-part='control' data-minimized='' data-maximized='' data-staged='' /></div>",
      "      {axes.map((axis) => <span key={axis} data-part='resize-trigger' data-axis={axis} data-resize-axis={axis} />)}",
      "    </div>{traces}",
      "  </section>;",
      "}",
      "",
      "export const stackNotes = 'panelStack stack bringToFront remove isTopmost indexOf --z-index resizeObserverBorderBox addDomEvent resize clampPoint clampSize resizeRect getBoundaryRect getWindowRect getElementRect setInitialFocus setFinalFocus restoreFocus Escape ArrowLeft ArrowRight ArrowUp ArrowDown';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "floating-panel.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('floating panel readiness', () => {",
      "  it('covers pointer, keyboard, resize, stage, and artifact traces', async () => {",
      "    const user = userEvent.setup();",
      "    const ResizeObserver = vi.fn();",
      "    render(<section role='dialog' aria-labelledby='panel-title' data-state='open' data-stage='default'><h2 id='panel-title'>Inspector</h2><button>Maximize</button><span data-axis='se' /></section>);",
      "    await user.keyboard('{ArrowRight}{Escape}');",
      "    await user.click(screen.getByRole('button', { name: 'Maximize' }));",
      "    expect('pointer-test keyboard-test resize-test stage-test floating-panel-traces upload-artifact ResizeObserver').toContain('resize-test');",
      "    expect(ResizeObserver).toBeDefined();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "floating-panel.yml"), [
      "name: floating-panel-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- floating-panel",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: floating-panel-traces",
      "          path: test-results/floating-panel"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/floating-panel": "latest",
        "@zag-js/rect-utils": "latest",
        "@zag-js/store": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "floating-panel-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      floatingPanelSetups: Array<{ filePath: string; framework: string; triggerCount: number; positionerCount: number; contentCount: number; titleCount: number; headerCount: number; bodyCount: number; controlCount: number; stageTriggerCount: number; resizeTriggerCount: number; dragTriggerCount: number; stackCount: number; boundaryCount: number; focusCount: number; keyboardCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      layoutSignals: Array<{ signal: string; readiness: string }>;
      dragResizeSignals: Array<{ signal: string; readiness: string }>;
      stackSignals: Array<{ signal: string; readiness: string }>;
      focusAccessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Floating panel readiness Zag floating-panel drag resize stage stack boundary focus accessibility tests");
    expect(report.floatingPanelSetups.some((item) => item.filePath === "src/zag-floating-panel.tsx" && item.framework === "zag-floating-panel" && item.triggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.titleCount > 0 && item.headerCount > 0 && item.bodyCount > 0 && item.controlCount > 0 && item.stageTriggerCount > 0 && item.resizeTriggerCount > 0 && item.dragTriggerCount > 0 && item.stackCount > 0 && item.boundaryCount > 0 && item.focusCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.floatingPanelSetups.some((item) => item.filePath === "src/custom-floating-panel.tsx" && item.framework === "custom-floating-panel" && item.triggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.titleCount > 0 && item.headerCount > 0 && item.bodyCount > 0 && item.controlCount > 0 && item.stageTriggerCount > 0 && item.resizeTriggerCount > 0 && item.dragTriggerCount > 0 && item.stackCount > 0 && item.boundaryCount > 0 && item.focusCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-floating-panel", "custom-floating-panel"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["trigger", "positioner", "content", "header", "body", "title", "control", "stage-trigger", "resize-trigger", "drag-trigger", "close-trigger"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open", "closed", "idle", "dragging", "resizing", "minimized", "maximized", "default-stage", "topmost", "behind"]));
    expect(readySignals(report.layoutSignals)).toEqual(expect.arrayContaining(["size", "position", "css-vars", "strategy-fixed", "strategy-absolute", "fallback-size", "fallback-position", "anchor-position", "boundary-rect", "allow-overflow"]));
    expect(readySignals(report.dragResizeSignals)).toEqual(expect.arrayContaining(["drag-start", "resize-start", "pointer-move", "pointer-capture", "grid-size", "clamp-point", "resize-axis", "lock-aspect-ratio", "keyboard-move"]));
    expect(readySignals(report.stackSignals)).toEqual(expect.arrayContaining(["panel-stack", "bring-to-front", "z-index", "topmost", "stack-remove"]));
    expect(readySignals(report.focusAccessibilitySignals)).toEqual(expect.arrayContaining(["role-dialog", "aria-labelledby", "aria-controls", "initial-focus", "final-focus", "restore-focus", "escape-close", "data-state", "data-stage", "direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "resize-test", "stage-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/floating-panel", "@zag-js/rect-utils", "@zag-js/store", "@zag-js/dom-query", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/floating-panel"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records floating panel readiness only"))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "floating-panel-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "floating-panel-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "floating-panel-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "floating-panel-readiness.md"), "utf8");
    expect(markdown).toContain("Floating Panel Readiness");
    expect(markdown).toContain("@zag-js/floating-panel");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "floating-panel-readiness.html"), "utf8");
    expect(html).toContain("floating-panel-readiness-card");
    expect(html).toContain("data-source-pattern=\"FloatingPanel\"");
    expect(html).toContain("RepoTutor records floating panel readiness only");
  });

  it("detects Zag floating-panel machine readiness without dragging real panels", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-floating-panel-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-floating-panel-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-floating-panel-machine.tsx"), [
      "import * as floatingPanel from '@zag-js/floating-panel';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function MachineFloatingPanel() {",
      "  const service = useMachine(floatingPanel.machine, {",
      "    id: 'machine-panel',",
      "    ids: { trigger: 'panel-trigger', positioner: 'panel-positioner', content: 'panel-content', title: 'panel-title', header: 'panel-header' },",
      "    dir: 'ltr',",
      "    defaultOpen: true,",
      "    strategy: 'fixed',",
      "    gridSize: 8,",
      "    allowOverflow: false,",
      "    resizable: true,",
      "    draggable: true,",
      "    defaultSize: { width: 320, height: 240 },",
      "    defaultPosition: { x: 300, y: 100 },",
      "    minSize: { width: 240, height: 160 },",
      "    maxSize: { width: 960, height: 640 },",
      "    getAnchorPosition: ({ triggerRect, boundaryRect }) => ({ x: (triggerRect?.x ?? boundaryRect?.x ?? 0) + 12, y: (triggerRect?.y ?? boundaryRect?.y ?? 0) + 24 }),",
      "    lockAspectRatio: true,",
      "    closeOnEscape: true,",
      "    getBoundaryEl: () => document.querySelector('[data-boundary]') as HTMLElement | null,",
      "    initialFocusEl: () => document.querySelector('[data-initial-focus]') as HTMLElement | null,",
      "    finalFocusEl: () => document.querySelector('[data-final-focus]') as HTMLElement | null,",
      "    restoreFocus: true,",
      "    onPositionChange: console.info,",
      "    onPositionChangeEnd: console.info,",
      "    onSizeChange: console.info,",
      "    onSizeChangeEnd: console.info,",
      "    onStageChange: console.info,",
      "    onOpenChange: console.info",
      "  });",
      "  const api = floatingPanel.connect(service, normalizeProps);",
      "  api.open; api.dragging; api.resizing; api.position; api.size; api.setOpen(true); api.setPosition({ x: 320, y: 160 }); api.setSize({ width: 360, height: 260 }); api.minimize(); api.maximize(); api.restore();",
      "  const machineEvidence = 'createMachine<FloatingPanelSchema> createGuards<FloatingPanelSchema> ensureProps floating-panel strategy fixed gridSize allowOverflow resizable draggable translations initialState open defaultOpen closed context size bindable position bindable stage bindable lastEventPosition bindable prevPosition bindable prevSize bindable isTopmost bindable computed isMaximized isMinimized isStaged hasSpecifiedPosition canResize canDrag watch position setPositionStyle size setSizeStyle open toggleVisibility effects trackPanelStack CONTENT_FOCUS SET_POSITION SET_SIZE CONTROLLED.OPEN CONTROLLED.CLOSE OPEN CLOSE open idle dragging resizing DRAG_START RESIZE_START DRAG DRAG_END ESCAPE MINIMIZE MAXIMIZE RESTORE MOVE guards closeOnEsc isOpenControlled';",
      "  const effectEvidence = 'trackPointerMove trackBoundaryRect trackPanelStack resizeObserverBorderBox addDomEvent subscribe panelStack isTopmost indexOf --z-index';",
      "  const actionEvidence = 'setPosition setSize setAnchorPosition setPrevPosition clearPrevPosition restorePosition setPositionFromDrag setPositionStyle resetRect setPrevSize clearPrevSize restoreSize setSizeFromDrag setSizeStyle setMaximized setMinimized setRestored setPositionFromKeyboard bringToFrontOfPanelStack invokeOnOpen invokeOnClose invokeOnDragEnd invokeOnResizeEnd setFinalFocus setInitialFocus toggleVisibility clampPoint clampSize resizeRect addPoints subtractPoints queueMicrotask';",
      "  const domEvidence = 'getTriggerId getPositionerId getContentId getTitleId getHeaderId getTriggerEl getPositionerEl getContentEl getHeaderEl getBoundaryRect getWindowRect getElementRect createRect pick';",
      "  const apiEvidence = 'open setOpen dragging resizing position setPosition size setSize minimize maximize restore resizable draggable getDragTriggerProps getResizeTriggerProps getTriggerProps getPositionerProps getContentProps getTitleProps getHeaderProps getBodyProps getCloseTriggerProps getControlProps getStageTriggerProps dir prop disabled-prop type button data-state data-dragging aria-controls role dialog tabIndex hidden-content data-topmost data-behind data-minimized data-maximized data-staged data-axis --width --height --x --y Escape ArrowLeft ArrowRight ArrowUp ArrowDown setPointerCapture releasePointerCapture stopPropagation isLeftClick data-no-drag onDoubleClick touchAction none cursor move pointerEvents';",
      "  return <div data-boundary data-evidence={[machineEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence].join(' ')}>",
      "    <button {...api.getTriggerProps()} data-final-focus>Open</button>",
      "    <div {...api.getPositionerProps()}><section {...api.getContentProps()}><header {...api.getHeaderProps()}><h2 {...api.getTitleProps()}>Inspector</h2><div {...api.getDragTriggerProps()}><button {...api.getCloseTriggerProps()}>Close</button><button {...api.getStageTriggerProps({ stage: 'minimized' })}>Minimize</button><button {...api.getStageTriggerProps({ stage: 'maximized' })}>Maximize</button><button {...api.getStageTriggerProps({ stage: 'default' })}>Restore</button></div></header><div {...api.getBodyProps()} data-initial-focus>Body</div><div {...api.getControlProps()} />{(['n','e','s','w','ne','nw','se','sw'] as const).map((axis) => <span key={axis} {...api.getResizeTriggerProps({ axis })} />)}</section></div>",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/floating-panel": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/rect-utils": "latest",
        "@zag-js/store": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "floating-panel-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "computed-state", "watch-props", "top-level-effects", "root-events", "nested-states", "guard-logic"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["size", "position", "stage", "last-event-position", "prev-position", "prev-size", "is-topmost"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-maximized", "is-minimized", "is-staged", "has-specified-position", "can-resize", "can-drag"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-pointer-move", "track-boundary-rect", "track-panel-stack", "resize-observer-border-box", "stack-subscribe"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-position", "set-size", "anchor-position", "prev-position", "drag-position", "resize-from-drag", "stage-actions", "keyboard-position", "stack-front", "open-close-callbacks", "focus-actions", "toggle-visibility", "style-actions", "reset-rect"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["trigger-id", "positioner-id", "content-id", "title-id", "header-id", "trigger-el", "positioner-el", "content-el", "header-el", "boundary-rect", "window-rect", "element-rect"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "set-open", "dragging", "resizing", "position-api", "set-position", "size-api", "set-size", "minimize", "maximize", "restore", "resizable-api", "draggable-api", "trigger-props", "positioner-props", "content-props", "title-props", "header-props", "body-props", "close-trigger-props", "control-props", "stage-trigger-props", "resize-trigger-props", "drag-trigger-props", "dir-prop", "disabled-prop", "type-button", "data-state", "data-dragging", "aria-controls", "role-dialog", "tab-index", "hidden-content", "data-topmost", "data-behind", "data-minimized", "data-maximized", "data-staged", "data-axis", "css-position-vars", "escape-key", "arrow-key-move", "pointer-capture", "pointer-release", "stop-propagation", "left-click-guard", "no-drag-guard", "double-click-stage", "touch-action-none", "cursor-move"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/floating-panel", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/store", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "floating-panel-readiness.md"), "utf8");
    expect(markdown).toContain("## Machine Signals");
    expect(markdown).toContain("## API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "floating-panel-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("API Signals");
  });

  it("detects drawer readiness without opening real drawers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-drawer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-drawer-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-drawer.tsx"), [
      "import * as drawer from '@zag-js/drawer';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "const stack = drawer.createStack();",
      "",
      "export function FilterDrawer() {",
      "  const stackApi = drawer.connectStack(stack.getSnapshot(), normalizeProps);",
      "  const service = useMachine(drawer.machine, {",
      "    id: 'filter-drawer',",
      "    dir: 'ltr',",
      "    defaultOpen: true,",
      "    modal: true,",
      "    trapFocus: true,",
      "    preventScroll: true,",
      "    role: 'alertdialog',",
      "    initialFocusEl: () => document.querySelector('[data-initial-focus]') as HTMLElement | null,",
      "    finalFocusEl: () => document.querySelector('[data-final-focus]') as HTMLElement | null,",
      "    restoreFocus: true,",
      "    closeOnEscape: true,",
      "    closeOnInteractOutside: true,",
      "    snapPoints: [1, 0.5, '320px', '24rem'],",
      "    defaultSnapPoint: 1,",
      "    snapPoint: 0.5,",
      "    onSnapPointChange: console.info,",
      "    swipeDirection: 'down',",
      "    snapToSequentialPoints: true,",
      "    swipeVelocityThreshold: 500,",
      "    closeThreshold: 0.5,",
      "    preventDragOnScroll: true,",
      "    onOpenChange: console.info,",
      "    onEscapeKeyDown: console.info,",
      "    onInteractOutside: console.info,",
      "    onPointerDownOutside: console.info,",
      "    onFocusOutside: console.info,",
      "    onRequestDismiss: console.info,",
      "    stack,",
      "    triggerValue: 'filters',",
      "    defaultTriggerValue: 'filters'",
      "  });",
      "  const api = drawer.connect(service, normalizeProps);",
      "  api.open; api.dragging; api.triggerValue; api.setTriggerValue('filters'); api.setOpen(true); api.snapPoints; api.swipeDirection; api.snapPoint; api.setSnapPoint(0.5); api.getOpenPercentage(); api.getSnapPointIndex(); api.getContentSize();",
      "  const evidence = 'Drawer open closed closing swiping-open swipe-area-dragging dragging triggerValue TRIGGER_VALUE.SET data-expanded data-nested-drawer-open data-nested-drawer-swiping snapPoints defaultSnapPoint onSnapPointChange SNAP_POINT.SET resolvedSnapPoints resolvedActiveSnapPoint getSnapPointIndex getOpenPercentage getContentSize contentSize viewportSize rootFontSize rem-snap-points swipeDirection physicalSwipeDirection POINTER_DOWN POINTER_MOVE POINTER_UP POINTER_CANCEL SWIPE_AREA.START dragOffset swipeProgress swipeVelocityThreshold closeThreshold preventDragOnScroll data-no-drag DrawerStack drawer-stack createStack connectStack register unregister openCount frontmostHeight nestedMetrics drawerRegistry role dialog aria-modal aria-labelledby aria-describedby trapFocus initialFocusEl finalFocusEl restoreFocus closeOnEscape closeOnInteractOutside preventScroll preventBodyScroll ariaHidden data-state data-swipe-direction drawer-traces upload-artifact';",
      "  return <div data-evidence={evidence}>",
      "    <button {...api.getTriggerProps({ value: 'filters' })} data-final-focus>Filters</button>",
      "    <div {...api.getPositionerProps()}><section {...api.getContentProps()}><h2 {...api.getTitleProps()}>Filters</h2><p {...api.getDescriptionProps()}>Choose filters</p><div {...api.getGrabberProps()}><span {...api.getGrabberIndicatorProps()} /></div><button {...api.getCloseTriggerProps()} data-initial-focus>Close</button></section></div>",
      "    <div {...api.getBackdropProps()} />",
      "    <div {...api.getSwipeAreaProps()} />",
      "    <div {...stackApi.getIndentProps()} {...stackApi.getIndentBackgroundProps()} />",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-drawer.tsx"), [
      "export function CustomDrawer() {",
      "  const traces = 'custom drawer data-drawer trigger positioner content title description backdrop close-trigger grabber grabber-indicator swipe-area open closed closing swiping-open swipe-area-dragging dragging trigger-value expanded nested-open nested-swiping snap-points default-snap-point snap-point-change resolved-snap-points snap-index open-percentage content-size viewport-size root-font-size rem-snap-points swipe-direction physical-direction pointer-down pointer-move pointer-up pointer-cancel swipe-area-start drag-offset swipe-progress velocity-threshold close-threshold prevent-drag-on-scroll no-drag drawer-stack create-stack connect-stack register unregister open-count frontmost-height nested-metrics registry role-dialog aria-modal aria-labelledby aria-describedby trap-focus initial-focus final-focus restore-focus escape-close interact-outside prevent-scroll aria-hidden data-state data-swipe-direction pointer-test keyboard-test swipe-test snap-test stack-test drawer-traces upload-artifact';",
      "  return <section data-drawer role='dialog' aria-modal='true' aria-labelledby='drawer-title' aria-describedby='drawer-description' data-state='open' data-swipe-direction='down' data-expanded='' data-nested-drawer-open='' data-nested-drawer-swiping='' data-evidence={traces}>",
      "    <button data-part='trigger' aria-haspopup='dialog' aria-expanded='true' aria-controls='drawer-content' data-current=''>Open</button>",
      "    <div data-part='positioner'><div id='drawer-content' data-part='content' data-swiping='' data-dragging='' style={{ ['--drawer-translate' as string]: '0px', ['--drawer-translate-x' as string]: '0px', ['--drawer-translate-y' as string]: '0px', ['--drawer-snap-point-offset-y' as string]: '50%', ['--drawer-swipe-movement-y' as string]: '12px', ['--drawer-swipe-strength' as string]: '0.5', ['--nested-drawers' as string]: '1', ['--drawer-height' as string]: '480px', ['--drawer-frontmost-height' as string]: '420px' }}><h2 id='drawer-title' data-part='title'>Filters</h2><p id='drawer-description' data-part='description'>Choose filters</p><div data-part='grabber' onPointerDown={(event) => event.currentTarget.setPointerCapture(event.pointerId)}><span data-part='grabber-indicator' /></div><button data-part='close-trigger'>Close</button><input data-no-drag aria-label='No drag input' /></div></div>",
      "    <div data-part='backdrop' data-swiping='' style={{ ['--drawer-swipe-progress' as string]: '0.25' }} />",
      "    <div data-part='swipe-area' role='presentation' aria-hidden='true' data-state='closed' data-swipe-direction='down' onPointerDown={() => undefined} onTouchStart={() => undefined} />",
      "    {traces}",
      "  </section>;",
      "}",
      "",
      "export const drawerNotes = 'DrawerSwipeSession SwipeSession shouldPreventTouchScroll resolvedSnapPoints findClosestSnapPoint snapToSequentialPoints getOpenPercentage getSnapPointIndex contentSize viewportSize rootFontSize drawerRegistry register unregister setSwiping setSwipeProgress getSwipeProgressAfter hasSwipingAfter createStack connectStack openCount frontmostHeight trapFocus preventBodyScroll ariaHidden trackDismissableElement closeOnInteractOutside closeOnEscape';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "drawer.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('drawer readiness', () => {",
      "  it('covers pointer, keyboard, swipe, snap, stack, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    const ResizeObserver = vi.fn();",
      "    render(<section role='dialog' aria-modal='true' aria-labelledby='drawer-title' data-state='open' data-swipe-direction='down'><h2 id='drawer-title'>Filters</h2><button>Close</button><div data-part='swipe-area' /></section>);",
      "    await user.keyboard('{Escape}');",
      "    await user.click(screen.getByRole('button', { name: 'Close' }));",
      "    expect('pointer-test keyboard-test swipe-test snap-test stack-test drawer-traces upload-artifact ResizeObserver vitest testing-library user-event').toContain('swipe-test');",
      "    expect(ResizeObserver).toBeDefined();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "drawer.yml"), [
      "name: drawer-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- drawer",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: drawer-traces",
      "          path: test-results/drawer"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/drawer": "latest",
        "@zag-js/remove-scroll": "latest",
        "@zag-js/focus-trap": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/aria-hidden": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "drawer-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      drawerSetups: Array<{ filePath: string; framework: string; triggerCount: number; positionerCount: number; contentCount: number; titleCount: number; descriptionCount: number; backdropCount: number; closeTriggerCount: number; grabberCount: number; grabberIndicatorCount: number; swipeAreaCount: number; snapPointCount: number; swipeCount: number; stackCount: number; focusCount: number; dismissCount: number; scrollLockCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      snapSignals: Array<{ signal: string; readiness: string }>;
      swipeSignals: Array<{ signal: string; readiness: string }>;
      stackSignals: Array<{ signal: string; readiness: string }>;
      focusAccessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Drawer readiness Zag drawer swipe snap stack modal focus accessibility tests");
    expect(report.drawerSetups.some((item) => item.filePath === "src/zag-drawer.tsx" && item.framework === "zag-drawer" && item.triggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.titleCount > 0 && item.descriptionCount > 0 && item.backdropCount > 0 && item.closeTriggerCount > 0 && item.grabberCount > 0 && item.grabberIndicatorCount > 0 && item.swipeAreaCount > 0 && item.snapPointCount > 0 && item.swipeCount > 0 && item.stackCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.scrollLockCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.drawerSetups.some((item) => item.filePath === "src/custom-drawer.tsx" && item.framework === "custom-drawer" && item.triggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.titleCount > 0 && item.descriptionCount > 0 && item.backdropCount > 0 && item.closeTriggerCount > 0 && item.grabberCount > 0 && item.grabberIndicatorCount > 0 && item.swipeAreaCount > 0 && item.snapPointCount > 0 && item.swipeCount > 0 && item.stackCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.scrollLockCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-drawer", "custom-drawer"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["trigger", "positioner", "content", "title", "description", "backdrop", "close-trigger", "grabber", "grabber-indicator", "swipe-area"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open", "closed", "closing", "swiping-open", "swipe-area-dragging", "dragging", "trigger-value", "expanded", "nested-open", "nested-swiping"]));
    expect(readySignals(report.snapSignals)).toEqual(expect.arrayContaining(["snap-points", "default-snap-point", "snap-point-change", "resolved-snap-points", "snap-index", "open-percentage", "content-size", "viewport-size", "root-font-size", "rem-snap-points"]));
    expect(readySignals(report.swipeSignals)).toEqual(expect.arrayContaining(["swipe-direction", "physical-direction", "pointer-down", "pointer-move", "pointer-up", "pointer-cancel", "swipe-area-start", "drag-offset", "swipe-progress", "velocity-threshold", "close-threshold", "prevent-drag-on-scroll", "no-drag"]));
    expect(readySignals(report.stackSignals)).toEqual(expect.arrayContaining(["drawer-stack", "create-stack", "connect-stack", "register", "unregister", "open-count", "frontmost-height", "swipe-progress", "nested-metrics", "registry"]));
    expect(readySignals(report.focusAccessibilitySignals)).toEqual(expect.arrayContaining(["role-dialog", "aria-modal", "aria-labelledby", "aria-describedby", "trap-focus", "initial-focus", "final-focus", "restore-focus", "escape-close", "interact-outside", "prevent-scroll", "aria-hidden", "data-state", "data-swipe-direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "swipe-test", "snap-test", "stack-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/drawer", "@zag-js/remove-scroll", "@zag-js/focus-trap", "@zag-js/dismissable", "@zag-js/aria-hidden", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/drawer"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records drawer readiness only; it does not open real drawers, trap real focus, lock body scroll, hide live DOM, dispatch pointer or keyboard events, calculate real snap points, mutate drawer stacks, or run analyzed project tests."))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "drawer-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "drawer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "drawer-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "drawer-readiness.md"), "utf8");
    expect(markdown).toContain("Drawer Readiness");
    expect(markdown).toContain("@zag-js/drawer");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "drawer-readiness.html"), "utf8");
    expect(html).toContain("drawer-readiness-card");
    expect(html).toContain("data-source-pattern=\"Drawer\"");
    expect(html).toContain("RepoTutor records drawer readiness only");
  });

  it("detects Zag drawer machine readiness without opening real drawers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-drawer-machine-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-drawer-machine-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "drawer-machine-notes.ts"), [
      "import * as drawer from '@zag-js/drawer';",
      "import { createMachine, createGuards } from '@zag-js/core';",
      "import { ariaHidden } from '@zag-js/aria-hidden';",
      "import { trackDismissableElement } from '@zag-js/dismissable';",
      "import { trapFocus } from '@zag-js/focus-trap';",
      "import { preventBodyScroll } from '@zag-js/remove-scroll';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "import { createAnatomy } from '@zag-js/anatomy';",
      "import { createProps } from '@zag-js/types';",
      "import { createSplitProps } from '@zag-js/utils';",
      "",
      "type DrawerSchema = { context: unknown };",
      "const guards = createGuards<DrawerSchema>();",
      "const machine = createMachine<DrawerSchema>({",
      "  props: { modal: true, trapFocus: true, preventScroll: true, closeOnInteractOutside: true, closeOnEscape: true, restoreFocus: true, role: 'dialog', initialFocusEl: undefined, snapPoints: [1], defaultSnapPoint: 1, swipeDirection: 'down', snapToSequentialPoints: false, swipeVelocityThreshold: 700, closeThreshold: 0.25, preventDragOnScroll: true },",
      "  context: ({ bindable, refs }) => ({ triggerValue: bindable(() => null), dragOffset: bindable(() => null), snapPoint: bindable(() => 1), resolvedActiveSnapPoint: bindable(() => null), contentSize: bindable(() => null), viewportSize: bindable(() => 0), rootFontSize: bindable(() => 16), swipeStrength: bindable(() => 1), rendered: bindable(() => ({ title: false, description: false })), nestedMetrics: bindable(() => ({ count: 0, height: 0, frontmostHeight: 0, open: false, swiping: false })), swipeSession: refs.get('swipeSession'), snapBackFrame: refs.get('snapBackFrame') }),",
      "  refs: () => ({ swipeSession: 'DrawerSwipeSession', snapBackFrame: 'AnimationFrame' }),",
      "  computed: { drawerId: () => 'drawer-id', physicalSwipeDirection: () => 'down', resolvedSnapPoints: () => [] },",
      "  watch: { snapPoint: ['setResolvedActiveSnapPoint'], contentSize: ['syncDrawerStack'], rootFontSize: ['setResolvedSnapPoints'], snapPoints: ['setResolvedSnapPoints'], open: ['toggleVisibility'], dragOffset: ['syncDrawerStack'] },",
      "  initialState: ({ prop }) => prop('open') || prop('defaultOpen') ? 'open' : 'closed',",
      "  on: { 'SNAP_POINT.SET': { actions: ['setSnapPoint'] } },",
      "  states: { open: { effects: ['trackDismissableElement', 'preventScroll', 'trapFocus', 'hideContentBelow', 'trackPointerMove', 'trackSizeMeasurements', 'trackNestedDrawerMetrics', 'trackDrawerStack'] }, closing: { effects: ['trackExitAnimation'] }, closed: {}, 'swipe-area-dragging': { effects: ['trackSwipeOpenPointerMove'] }, 'swiping-open': { effects: ['trackSwipeOpenPointerMove', 'trackSizeMeasurements'] } },",
      "  implementations: { guards: { isOpenControlled: guards.state, isDragging: guards.state, shouldStartDragging: guards.state, shouldCloseOnSwipe: guards.state, hasSwipeIntent: guards.state, shouldOpenOnSwipe: guards.state }, actions: { setInitialFocus(){}, checkRenderedElements(){}, deferClearDragOffset(){}, suppressBackdropAnimation(){}, clearSwipeOpenAnimation(){}, setTriggerValue(){}, invokeOnOpen(){}, invokeOnClose(){}, setSnapPoint(){}, setPointerStart(){}, setDragOffset(){}, setSwipeOpenDragOffset(){}, setClosestSnapPoint(){}, clearDragOffset(){}, clearActiveSnapPoint(){}, clearResolvedActiveSnapPoint(){}, clearSizeMeasurements(){}, clearPointerStart(){}, clearVelocityTracking(){}, setSnapSwipeStrength(){}, setDismissSwipeStrength(){}, resetSwipeStrength(){}, scheduleSnapBack(){}, cancelSnapBack(){}, setRegistrySwiping(){}, clearRegistrySwiping(){}, toggleVisibility(){}, syncDrawerStack(){} }, effects: { trackDrawerStack(){}, trackDismissableElement(){}, preventScroll(){}, trapFocus(){}, hideContentBelow(){}, trackPointerMove(){}, trackSizeMeasurements(){}, trackNestedDrawerMetrics(){}, trackSwipeOpenPointerMove(){}, trackExitAnimation(){} } }",
      "});",
      "",
      "export function inspectDrawer(api = drawer.connect(useMachine(machine), normalizeProps)) {",
      "  api.open; api.dragging; api.setOpen(true); api.snapPoints; api.swipeDirection; api.snapPoint; api.setSnapPoint(1); api.getOpenPercentage(); api.getSnapPointIndex(); api.getContentSize(); api.triggerValue; api.setTriggerValue('filters');",
      "  api.getPositionerProps(); api.getContentProps(); api.getTitleProps(); api.getDescriptionProps(); api.getTriggerProps(); api.getBackdropProps(); api.getGrabberProps(); api.getGrabberIndicatorProps(); api.getCloseTriggerProps(); api.getSwipeAreaProps();",
      "  const apiEvidence = 'dir prop hidden data-state data-swipe-direction pointerEvents none tabIndex role aria-modal aria-labelledby aria-describedby data-expanded data-swiping data-dragging data-nested-drawer-open data-nested-drawer-swiping translate3d --drawer-translate --drawer-snap-point-offset-y --drawer-swipe-movement-y --drawer-swipe-strength --nested-drawers willChange transform data-ownedby data-value aria-haspopup dialog aria-expanded aria-controls data-current aria-hidden data-disabled touchAction pan-x pan-y onTouchStart preventDefault isLeftClick';",
      "  return `${apiEvidence} getContentId getPositionerId getTitleId getDescriptionId getTriggerId getTriggerEls getActiveTriggerEl getBackdropId getHeaderId getGrabberId getGrabberIndicatorId getCloseTriggerId getSwipeAreaId getContentEl getPositionerEl getTitleEl getDescriptionEl getTriggerEl getBackdropEl getHeaderEl getGrabberEl getGrabberIndicatorEl getCloseTriggerEl getSwipeAreaEl isPointerWithinContentOrSwipeArea getScrollEls drawerRegistry setSwiping setSwipeProgress getSwipeProgressAfter hasSwipingAfter createStack connectStack getIndentProps getIndentBackgroundProps ariaHidden trackDismissableElement trapFocus preventBodyScroll createAnatomy createProps createSplitProps`; ",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/anatomy": "latest",
        "@zag-js/aria-hidden": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/drawer": "latest",
        "@zag-js/focus-trap": "latest",
        "@zag-js/react": "latest",
        "@zag-js/remove-scroll": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "drawer-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "refs", "computed-state", "watch-props", "root-events", "open-state", "swipe-states", "implementation-block"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["trigger-value", "drag-offset", "snap-point", "resolved-active-snap-point", "content-size", "viewport-size", "root-font-size", "swipe-strength", "rendered", "nested-metrics"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["drawer-id", "physical-swipe-direction", "resolved-snap-points"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-drawer-stack", "track-dismissable-element", "prevent-scroll", "trap-focus", "hide-content-below", "track-pointer-move", "track-size-measurements", "track-nested-drawer-metrics", "track-swipe-open-pointer-move", "track-exit-animation"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["is-open-controlled", "is-dragging", "should-start-dragging", "should-close-on-swipe", "has-swipe-intent", "should-open-on-swipe"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["initial-focus", "rendered-elements", "drag-offset-cleanup", "swipe-open-animation", "trigger-value", "open-close-callbacks", "snap-point", "pointer-start", "drag-offset", "swipe-open-drag-offset", "closest-snap-point", "clear-snap-and-size", "velocity-tracking", "swipe-strength", "snap-back", "registry-swiping", "toggle-visibility", "sync-drawer-stack"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["content-id", "positioner-id", "title-id", "description-id", "trigger-id", "trigger-els", "active-trigger-el", "backdrop-id", "header-id", "grabber-id", "grabber-indicator-id", "close-trigger-id", "swipe-area-id", "content-el", "positioner-el", "title-el", "description-el", "trigger-el", "backdrop-el", "header-el", "grabber-el", "grabber-indicator-el", "close-trigger-el", "swipe-area-el", "content-or-swipe-area-hit-test", "scroll-elements"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "dragging", "set-open", "snap-points", "swipe-direction", "snap-point", "set-snap-point", "open-percentage", "snap-point-index", "content-size-api", "trigger-value-api", "set-trigger-value", "positioner-props", "content-props", "title-props", "description-props", "trigger-props", "backdrop-props", "grabber-props", "grabber-indicator-props", "close-trigger-props", "swipe-area-props", "dir-prop", "hidden-prop", "data-state", "data-swipe-direction", "pointer-events-none", "tab-index", "role-prop", "aria-modal", "aria-labelledby", "aria-describedby", "data-expanded", "data-swiping", "data-dragging", "nested-open", "nested-swiping", "transform-translate3d", "drawer-css-vars", "will-change-transform", "data-ownedby", "data-value", "aria-haspopup-dialog", "aria-expanded", "aria-controls", "data-current", "aria-hidden", "data-disabled", "touch-action-pan", "touch-start", "prevent-default", "left-click-guard"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/drawer", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/aria-hidden", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-trap", "@zag-js/remove-scroll", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "drawer-readiness.md"), "utf8");
    expect(markdown).toContain("## Machine Signals");
    expect(markdown).toContain("## API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "drawer-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("API Signals");
  });

  it("detects hover-card readiness without opening real hover cards", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-hover-card-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-hover-card-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-hover-card.tsx"), [
      "import * as hoverCard from '@zag-js/hover-card';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function AccountHoverCard() {",
      "  const service = useMachine(hoverCard.machine, {",
      "    id: 'account-hover-card',",
      "    dir: 'ltr',",
      "    open: false,",
      "    defaultOpen: false,",
      "    disabled: false,",
      "    openDelay: 600,",
      "    closeDelay: 300,",
      "    positioning: { placement: 'bottom', strategy: 'fixed', gutter: 8 },",
      "    triggerValue: 'profile',",
      "    defaultTriggerValue: 'profile',",
      "    onOpenChange: console.info,",
      "    onTriggerValueChange: console.info,",
      "    onInteractOutside: console.info,",
      "    onPointerDownOutside: console.info,",
      "    onFocusOutside: console.info",
      "  });",
      "  const api = hoverCard.connect(service, normalizeProps);",
      "  api.open; api.triggerValue; api.setOpen(true); api.setTriggerValue('profile'); api.reposition({ placement: 'top-start' });",
      "  const evidence = 'HoverCard opening open closing closed disabled isPointer currentPlacement triggerValue TRIGGER_VALUE.SET CONTROLLED.OPEN CONTROLLED.CLOSE OPEN_DELAY CLOSE_DELAY waitForOpenDelay waitForCloseDelay trackPositioning getPlacement getPlacementStyles getPlacementSide popperStyles currentPlacementSide placement bottom strategy fixed listeners false reposition POSITIONING.SET trackDismissableElement type popover exclude getTriggerEls onDismiss onInteractOutside onPointerDownOutside onFocusOutside preventDefault POINTER_ENTER POINTER_LEAVE TRIGGER_FOCUS TRIGGER_BLUR touch ignore data-state data-placement data-side data-ownedby data-value data-current hidden tabIndex dir hover-card-traces pointer-test focus-test delay-test positioning-test upload-artifact';",
      "  return <section data-evidence={evidence}>",
      "    <button {...api.getTriggerProps({ value: 'profile' })}>Profile</button>",
      "    <div {...api.getPositionerProps()}><article {...api.getContentProps()}><div {...api.getArrowProps()}><span {...api.getArrowTipProps()} /></div>Profile details</article></div>",
      "  </section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-hover-card.tsx"), [
      "export function CustomHoverCard() {",
      "  const traces = 'custom hover-card data-scope hover-card data-part trigger positioner content arrow arrow-tip open closed opening closing disabled trigger-value current-placement is-pointer open-delay close-delay wait-open wait-close placement current-placement reposition popper-styles get-placement placement-side strategy listeners pointer-enter pointer-leave focus blur dismissable interact-outside focus-outside touch-ignore controlled-open data-state data-placement data-side data-ownedby data-current hidden tab-index dir pointer-test focus-test delay-test positioning-test hover-card-traces upload-artifact';",
      "  return <section data-scope='hover-card' data-evidence={traces}>",
      "    <button data-part='trigger' data-state='open' data-placement='bottom' data-side='bottom' data-ownedby='account-hover-card' data-value='profile' data-current='' aria-describedby='hover-card-content'>Profile</button>",
      "    <div data-part='positioner' style={{ position: 'fixed', ['--x' as string]: '0px', ['--y' as string]: '8px' }}>",
      "      <article id='hover-card-content' data-part='content' tabIndex={-1} data-state='open' data-placement='bottom' data-side='bottom'>",
      "        <div data-part='arrow'><span data-part='arrow-tip' /></div>",
      "        {traces}",
      "      </article>",
      "    </div>",
      "  </section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "hover-card.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('hover-card readiness', () => {",
      "  it('covers pointer, focus, delay, positioning, and artifacts', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup();",
      "    render(<section data-scope='hover-card'><button data-part='trigger'>Profile</button><article data-part='content' data-state='closed'>Profile details</article></section>);",
      "    await user.hover(screen.getByRole('button', { name: 'Profile' }));",
      "    await user.tab();",
      "    expect('pointer-test focus-test delay-test positioning-test hover-card-traces upload-artifact vitest testing-library user-event').toContain('delay-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "hover-card.yml"), [
      "name: hover-card-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- hover-card",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: hover-card-traces",
      "          path: test-results/hover-card"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/hover-card": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "hover-card-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      hoverCardSetups: Array<{ filePath: string; framework: string; triggerCount: number; positionerCount: number; contentCount: number; arrowCount: number; arrowTipCount: number; delayCount: number; positioningCount: number; pointerCount: number; focusCount: number; dismissCount: number; triggerValueCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      delaySignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Hover card readiness Zag hover-card delayed hover focus positioning dismissable accessibility tests");
    expect(report.hoverCardSetups.some((item) => item.filePath === "src/zag-hover-card.tsx" && item.framework === "zag-hover-card" && item.triggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.arrowCount > 0 && item.arrowTipCount > 0 && item.delayCount > 0 && item.positioningCount > 0 && item.pointerCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.triggerValueCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.hoverCardSetups.some((item) => item.filePath === "src/custom-hover-card.tsx" && item.framework === "custom-hover-card" && item.triggerCount > 0 && item.positionerCount > 0 && item.contentCount > 0 && item.arrowCount > 0 && item.arrowTipCount > 0 && item.delayCount > 0 && item.positioningCount > 0 && item.pointerCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.triggerValueCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-hover-card", "custom-hover-card"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["trigger", "positioner", "content", "arrow", "arrow-tip"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open", "closed", "opening", "closing", "disabled", "trigger-value", "current-placement", "is-pointer"]));
    expect(readySignals(report.delaySignals)).toEqual(expect.arrayContaining(["open-delay", "close-delay", "wait-open-delay", "wait-close-delay"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["placement", "current-placement", "reposition", "popper-styles", "get-placement", "placement-side", "strategy", "listeners"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer-enter", "pointer-leave", "focus", "blur", "dismissable", "interact-outside", "focus-outside", "touch-ignore", "controlled-open"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["data-state", "data-placement", "data-side", "data-ownedby", "data-current", "hidden", "tab-index", "direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "focus-test", "delay-test", "positioning-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/hover-card", "@zag-js/dismissable", "@zag-js/popper", "@zag-js/dom-query", "@zag-js/anatomy", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/hover-card"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records hover-card readiness only; it does not open real hover cards, wait real timers, calculate live popper placement, dispatch pointer/focus/outside events, mutate trigger value, or run analyzed project tests."))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "hover-card-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "hover-card-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "hover-card-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "hover-card-readiness.md"), "utf8");
    expect(markdown).toContain("Hover Card Readiness");
    expect(markdown).toContain("@zag-js/hover-card");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "hover-card-readiness.html"), "utf8");
    expect(html).toContain("hover-card-readiness-card");
    expect(html).toContain("data-source-pattern=\"HoverCard\"");
    expect(html).toContain("RepoTutor records hover-card readiness only");
  });

  it("detects Zag hover-card machine readiness without opening real hover cards", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-hover-card-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-hover-card-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-hover-card-machine.tsx"), [
      "import * as hoverCard from '@zag-js/hover-card';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function AccountHoverCard() {",
      "  const service = useMachine(hoverCard.machine, {",
      "    id: 'account-hover-card',",
      "    ids: { trigger: 'account-trigger', content: 'account-content', arrow: 'account-arrow', positioner: 'account-positioner' },",
      "    dir: 'ltr',",
      "    openDelay: 600,",
      "    closeDelay: 300,",
      "    disabled: false,",
      "    defaultOpen: false,",
      "    defaultTriggerValue: 'profile',",
      "    triggerValue: 'profile',",
      "    positioning: { placement: 'bottom' },",
      "    onOpenChange: console.info,",
      "    onTriggerValueChange: console.info,",
      "    onInteractOutside: console.info,",
      "    onPointerDownOutside: console.info,",
      "    onFocusOutside: console.info",
      "  });",
      "  const api = hoverCard.connect(service, normalizeProps);",
      "  api.open; api.triggerValue; api.setOpen(true); api.setTriggerValue('profile'); api.reposition({ placement: 'top-start' });",
      "  const machineEvidence = 'createMachine<HoverCardSchema> createGuards<HoverCardSchema> props disabled openDelay closeDelay positioning placement initialState open defaultOpen closed context open bindable currentPlacement bindable isPointer bindable triggerValue bindable defaultTriggerValue onTriggerValueChange watch disabled close open toggleVisibility TRIGGER_VALUE.SET states closed opening open closing guards isPointer isOpenControlled';",
      "  const effectEvidence = 'waitForOpenDelay waitForCloseDelay setTimeout OPEN_DELAY CLOSE_DELAY trackPositioning getPlacement currentPlacement onComplete trackDismissableElement type popover exclude getTriggerEls onDismiss onInteractOutside onPointerDownOutside onFocusOutside preventDefault';",
      "  const actionEvidence = 'invokeOnClose invokeOnOpen setIsPointer clearIsPointer reposition POSITIONING.SET listeners false setTriggerValue toggleVisibility queueMicrotask CONTROLLED.OPEN CONTROLLED.CLOSE';",
      "  const domEvidence = 'getTriggerId getContentId getPositionerId getArrowId getTriggerEl getContentEl getPositionerEl getTriggerEls getActiveTriggerEl queryAll isFunction';",
      "  const apiEvidence = 'open setOpen triggerValue setTriggerValue reposition getArrowProps getArrowTipProps getTriggerProps getPositionerProps getContentProps dir prop disabled guard popperStyles arrow arrowTip floating data-placement data-side data-ownedby data-value data-current data-state hidden tabIndex onPointerEnter onPointerLeave pointerType touch onFocus onBlur shouldSwitch';",
      "  return <section data-evidence={`${machineEvidence} ${effectEvidence} ${actionEvidence} ${domEvidence} ${apiEvidence}`}>",
      "    <button {...api.getTriggerProps({ value: 'profile' })}>Profile</button>",
      "    <div {...api.getPositionerProps()}><article {...api.getContentProps()}><div {...api.getArrowProps()}><span {...api.getArrowTipProps()} /></div>Profile details</article></div>",
      "  </section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/hover-card": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "hover-card-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "watch-props", "global-events", "state-chart", "guard-logic"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["open-context", "current-placement", "is-pointer", "trigger-value"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["wait-open-delay", "wait-close-delay", "track-positioning", "track-dismissable-element"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["invoke-on-open", "invoke-on-close", "set-is-pointer", "clear-is-pointer", "reposition", "set-trigger-value", "toggle-visibility"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["trigger-id", "content-id", "positioner-id", "arrow-id", "trigger-el", "content-el", "positioner-el", "trigger-els", "active-trigger-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "set-open", "trigger-value-api", "set-trigger-value", "reposition-api", "trigger-props", "arrow-props", "arrow-tip-props", "positioner-props", "content-props", "data-current", "hidden", "tab-index", "dir-prop", "disabled-guard", "arrow-style", "arrow-tip-style", "positioner-floating-style", "pointer-enter-handler", "pointer-leave-handler", "touch-ignore", "focus-handler", "blur-handler", "trigger-value-switch"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/hover-card", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "hover-card-readiness.md"), "utf8");
    expect(markdown).toContain("## Machine Signals");
    expect(markdown).toContain("## API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "hover-card-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("API Signals");
  });

  it("detects navigation-menu readiness without opening real navigation menus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-navigation-menu-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-navigation-menu-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-navigation-menu.tsx"), [
      "import * as navigationMenu from '@zag-js/navigation-menu';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function ProductNavigationMenu() {",
      "  const service = useMachine(navigationMenu.machine, {",
      "    id: 'product-navigation',",
      "    dir: 'ltr',",
      "    orientation: 'horizontal',",
      "    value: 'products',",
      "    defaultValue: 'products',",
      "    openDelay: 200,",
      "    closeDelay: 300,",
      "    disableHoverTrigger: false,",
      "    disableClickTrigger: false,",
      "    disablePointerLeaveClose: false,",
      "    translations: { rootLabel: 'Product navigation' },",
      "    onValueChange: console.info",
      "  });",
      "  const api = navigationMenu.connect(service, normalizeProps);",
      "  api.open; api.value; api.orientation; api.isViewportRendered; api.getViewportNode(); api.setValue('products'); api.reposition(); api.getItemState({ value: 'products' });",
      "  const evidence = 'NavigationMenu idle open closed value defaultValue previousValue selected wasSelected disabled isViewportRendered viewportSize viewportPosition contentNode triggerRect triggerNode openDelay closeDelay setOpenTimeout setCloseTimeout clearOpenTimeout clearCloseTimeout clearAllOpenTimeouts shouldSkipDelay TRIGGER.POINTERENTER TRIGGER.POINTERLEAVE TRIGGER.CLICK CONTENT.FOCUS CONTENT.BLUR CONTENT.POINTERENTER CONTENT.POINTERLEAVE ITEM.NAVIGATE ITEM.CLOSE CLOSE trackDismissableElement onFocusOutside onPointerDownOutside onDismiss screenOffset ResizeObserver trackResizeObserver getViewportEl getViewportPositionerProps getViewportProps getTriggerProxyProps getViewportProxyProps getIndicatorProps getItemIndicatorProps getArrowProps setMotionAttr data-motion exitcomplete focusFirstTabbableEl removeFromTabOrder restoreTabOrder navigate ArrowDown ArrowUp ArrowLeft ArrowRight Home End Tab aria-label aria-controls aria-expanded aria-current aria-owns aria-labelledby aria-hidden hidden data-state data-orientation data-value data-ownedby dir pointer-test keyboard-test focus-test delay-test viewport-test navigation-menu-traces upload-artifact';",
      "  return <nav {...api.getRootProps()} data-evidence={evidence}>",
      "    <ul {...api.getListProps()}>",
      "      <li {...api.getItemProps({ value: 'products' })}>",
      "        <button {...api.getTriggerProps({ value: 'products' })}>Products</button>",
      "        <span {...api.getTriggerProxyProps({ value: 'products' })} />",
      "        <div {...api.getViewportProxyProps({ value: 'products' })} />",
      "        <a {...api.getLinkProps({ value: 'products', current: true })}>Overview</a>",
      "        <section {...api.getContentProps({ value: 'products' })}>Products content</section>",
      "        <span {...api.getItemIndicatorProps({ value: 'products' })} />",
      "      </li>",
      "    </ul>",
      "    <div {...api.getIndicatorProps()} />",
      "    <div {...api.getViewportPositionerProps({ align: 'center' })}><div {...api.getViewportProps({ align: 'center' })}><span {...api.getArrowProps()} /></div></div>",
      "  </nav>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-navigation-menu.tsx"), [
      "export function CustomNavigationMenu() {",
      "  const traces = 'custom navigation-menu data-scope navigation-menu data-part root list item trigger trigger-proxy viewport viewport-positioner viewport-proxy content link indicator item-indicator arrow open closed value default-value previous-value selected was-selected disabled viewport-rendered viewport-size viewport-position trigger-rect screen-offset open-delay close-delay open-timeout close-timeout skip-delay clear-timeouts pointer-enter pointer-leave trigger-click content-focus content-blur item-navigate item-close dismissable focus-outside pointer-down-outside close-on-click arrow-keys home-end entry-key tab-order trigger-proxy focus-first focus-trigger navigate rtl aria-label aria-controls aria-expanded aria-current aria-owns aria-labelledby aria-hidden hidden data-state data-orientation data-value data-ownedby data-motion dir viewport-test keyboard-test focus-test delay-test pointer-test navigation-menu-traces upload-artifact';",
      "  return <nav data-scope='navigation-menu' data-part='root' data-orientation='horizontal' aria-label='Product navigation' data-evidence={traces}>",
      "    <ul data-part='list'>",
      "      <li data-part='item' data-state='open' data-value='products'>",
      "        <button data-part='trigger' aria-controls='products-content' aria-expanded='true' data-state='open' data-value='products'>Products</button>",
      "        <span data-trigger-proxy='' data-part='trigger-proxy' tabIndex={0} hidden={false} />",
      "        <a data-part='link' data-current='' aria-current='page' data-ownedby='products-content'>Overview</a>",
      "        <section id='products-content' data-part='content' aria-labelledby='products-trigger' data-state='open' data-orientation='horizontal' data-value='products' data-motion='from-end'>Products content</section>",
      "        <span data-part='item-indicator' aria-hidden='true' data-state='open' />",
      "      </li>",
      "    </ul>",
      "    <div data-part='indicator' aria-hidden='true' data-state='open' />",
      "    <div data-part='viewport-positioner' data-align='center'><div data-part='viewport' aria-owns='products-content' data-state='open' data-orientation='horizontal' style={{ ['--viewport-width' as string]: '320px', ['--viewport-height' as string]: '240px', ['--viewport-x' as string]: '12px', ['--viewport-y' as string]: '0px' }}><span data-part='arrow' /></div></div>",
      "  </nav>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "navigation-menu.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('navigation-menu readiness', () => {",
      "  it('covers pointer, keyboard, focus, delay, viewport, and artifacts', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup();",
      "    render(<nav data-scope='navigation-menu'><button data-part='trigger'>Products</button><section data-part='content' data-state='closed'>Products content</section></nav>);",
      "    await user.hover(screen.getByRole('button', { name: 'Products' }));",
      "    await user.keyboard('{ArrowDown}{Home}{End}{Tab}');",
      "    expect('pointer-test keyboard-test focus-test delay-test viewport-test navigation-menu-traces upload-artifact vitest testing-library user-event').toContain('viewport-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "navigation-menu.yml"), [
      "name: navigation-menu-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- navigation-menu",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: navigation-menu-traces",
      "          path: test-results/navigation-menu"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/navigation-menu": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "navigation-menu-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      navigationMenuSetups: Array<{ filePath: string; framework: string; rootCount: number; listCount: number; itemCount: number; triggerCount: number; contentCount: number; viewportCount: number; indicatorCount: number; arrowCount: number; valueCount: number; delayCount: number; pointerCount: number; keyboardCount: number; focusCount: number; dismissCount: number; motionCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      structureSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      delaySignals: Array<{ signal: string; readiness: string }>;
      viewportSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Navigation menu readiness Zag navigation-menu value viewport proxy motion dismissable keyboard accessibility tests");
    expect(report.navigationMenuSetups.some((item) => item.filePath === "src/zag-navigation-menu.tsx" && item.framework === "zag-navigation-menu" && item.rootCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.viewportCount > 0 && item.indicatorCount > 0 && item.arrowCount > 0 && item.valueCount > 0 && item.delayCount > 0 && item.pointerCount > 0 && item.keyboardCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.motionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.navigationMenuSetups.some((item) => item.filePath === "src/custom-navigation-menu.tsx" && item.framework === "custom-navigation-menu" && item.rootCount > 0 && item.listCount > 0 && item.itemCount > 0 && item.triggerCount > 0 && item.contentCount > 0 && item.viewportCount > 0 && item.indicatorCount > 0 && item.arrowCount > 0 && item.valueCount > 0 && item.delayCount > 0 && item.pointerCount > 0 && item.keyboardCount > 0 && item.focusCount > 0 && item.dismissCount > 0 && item.motionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-navigation-menu", "custom-navigation-menu"]));
    expect(readySignals(report.structureSignals)).toEqual(expect.arrayContaining(["root", "list", "item", "trigger", "trigger-proxy", "viewport", "viewport-positioner", "viewport-proxy", "content", "link", "indicator", "item-indicator", "arrow"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["value", "default-value", "previous-value", "open", "closed", "selected", "was-selected", "disabled", "viewport-rendered", "viewport-size", "viewport-position", "trigger-rect"]));
    expect(readySignals(report.delaySignals)).toEqual(expect.arrayContaining(["open-delay", "close-delay", "open-timeout", "close-timeout", "skip-delay", "clear-timeouts"]));
    expect(readySignals(report.viewportSignals)).toEqual(expect.arrayContaining(["viewport-size", "viewport-position", "trigger-rect", "css-vars", "resize-observer", "reposition", "align", "screen-offset", "motion-attr", "exitcomplete"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pointer-enter", "pointer-leave", "trigger-click", "content-focus", "content-blur", "item-navigate", "item-close", "dismissable", "focus-outside", "pointer-down-outside", "close-on-click"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-keys", "home-end", "entry-key", "tab-order", "trigger-proxy", "focus-first", "focus-trigger", "navigate", "rtl"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["aria-label", "aria-controls", "aria-expanded", "aria-current", "aria-owns", "aria-labelledby", "aria-hidden", "hidden", "data-state", "data-orientation", "data-value", "data-ownedby", "data-motion", "direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "pointer-test", "keyboard-test", "focus-test", "delay-test", "viewport-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/navigation-menu", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/navigation-menu"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records navigation-menu readiness only; it does not open real navigation menus, wait real timers, resize real viewports, move real focus, dispatch pointer/keyboard/outside events, mutate browser navigation, or run analyzed project tests."))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "navigation-menu-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "navigation-menu-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "navigation-menu-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "navigation-menu-readiness.md"), "utf8");
    expect(markdown).toContain("Navigation Menu Readiness");
    expect(markdown).toContain("@zag-js/navigation-menu");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "navigation-menu-readiness.html"), "utf8");
    expect(html).toContain("navigation-menu-readiness-card");
    expect(html).toContain("data-source-pattern=\"NavigationMenu\"");
    expect(html).toContain("RepoTutor records navigation-menu readiness only");
  });

  it("detects Zag navigation-menu machine readiness without opening real navigation menus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-navigation-menu-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-navigation-menu-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-navigation-menu-machine.tsx"), [
      "import * as navigationMenu from '@zag-js/navigation-menu';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function MachineNavigationMenu() {",
      "  const service = useMachine(navigationMenu.machine, {",
      "    id: 'machine-navigation',",
      "    ids: { root: 'nav-root', list: 'nav-list', viewport: 'nav-viewport', item: (value) => `nav-item-${value}`, trigger: (value) => `nav-trigger-${value}`, content: (value) => `nav-content-${value}` },",
      "    dir: 'ltr',",
      "    orientation: 'horizontal',",
      "    value: 'products',",
      "    defaultValue: 'products',",
      "    openDelay: 200,",
      "    closeDelay: 300,",
      "    disableHoverTrigger: false,",
      "    disableClickTrigger: false,",
      "    disablePointerLeaveClose: false,",
      "    translations: { rootLabel: 'Product navigation' },",
      "    onValueChange: console.info",
      "  });",
      "  const api = navigationMenu.connect(service, normalizeProps);",
      "  api.open; api.value; api.orientation; api.isViewportRendered; api.getViewportNode(); api.setValue('products'); api.reposition(); api.getItemState({ value: 'products' });",
      "  const machineEvidence = 'setup<NavigationMenuSchema> createMachine props ensureProps id dir ltr openDelay closeDelay orientation horizontal defaultValue context value bindable previousValue bindable viewportSize bindable isViewportRendered bindable viewportPosition bindable contentNode bindable triggerRect bindable triggerNode bindable computed open watch value restoreTabOrder setTriggerNode syncContentNode syncMotionAttribute refs restoreContentTabOrder contentResizeObserverCleanup contentDismissableCleanup contentExitCompleteCleanup triggerResizeObserverCleanup closeTimeoutId openTimeoutIds entry checkViewportNode exit cleanupObservers effects trackDocumentResize initialState idle VALUE.SET VIEWPORT.POSITION TRIGGER.POINTERENTER TRIGGER.POINTERLEAVE TRIGGER.CLICK CONTENT.FOCUS CONTENT.BLUR CONTENT.POINTERENTER CONTENT.POINTERLEAVE ITEM.NAVIGATE ITEM.CLOSE CLOSE states idle guards isItemOpen';",
      "  const effectEvidence = 'trackDocumentResize trackResizeObserver ResizeObserver contentResizeObserverCleanup triggerResizeObserverCleanup trackDismissableElement contentDismissableCleanup onFocusOutside onPointerDownOutside onDismiss exitcomplete contentExitCompleteCleanup addDomEvent callAll';",
      "  const actionEvidence = 'setValue clearCloseTimeout clearAllOpenTimeouts setCloseTimeout resetValueWithDelay clearOpenTimeout setValueWithDelay setOpenTimeout shouldSkipDelay selectValue deselectValue syncContentNode setTriggerNode syncMotionAttribute focusFirstTabbableEl focusNextLink focusTrigger focusTriggerIfNeeded removeFromTabOrder restoreTabOrder cleanupObservers checkViewportNode setViewportPosition screenOffset';",
      "  const domEvidence = 'getRootId getTriggerId getTriggerProxyId getContentId getViewportId getListId getItemId getRootEl getViewportEl getTriggerEl getTriggerProxyEl getListEl getContentEl getContentEls getTabbableEls getTriggerEls getLinkEls getElements trackResizeObserver setMotionAttr focusFirst removeFromTabOrder queryAll getTabbables getWindow';",
      "  const apiEvidence = 'open value orientation isViewportRendered getViewportNode setValue reposition getRootProps getListProps getItemProps getIndicatorProps getItemIndicatorProps getArrowProps getTriggerProps getTriggerProxyProps getViewportProxyProps getLinkProps getContentProps getViewportPositionerProps getViewportProps getItemState aria-owns data-motion pointerEvents dir-prop root-aria-label data-orientation layout-css-vars data-value data-state data-disabled aria-hidden hidden-prop indicator-position-absolute transition-none data-uid data-trigger-proxy-id aria-controls aria-expanded pointer-enter-handler pointer-leave-handler mouse-pointer-guard disable-hover-guard disable-click-guard key-navigation prevent-default stop-propagation trigger-proxy-focus visually-hidden-style aria-current-page custom-link-select close-on-click meta-key-guard aria-labelledby viewport-pointer-events-none data-align';",
      "  return <nav {...api.getRootProps()} data-evidence={[machineEvidence, effectEvidence, actionEvidence, domEvidence, apiEvidence].join(' ')}>",
      "    <ul {...api.getListProps()}>",
      "      <li {...api.getItemProps({ value: 'products' })}>",
      "        <button {...api.getTriggerProps({ value: 'products' })}>Products</button>",
      "        <span {...api.getTriggerProxyProps({ value: 'products' })} />",
      "        <div {...api.getViewportProxyProps({ value: 'products' })} />",
      "        <a {...api.getLinkProps({ value: 'products', current: true })}>Overview</a>",
      "        <section {...api.getContentProps({ value: 'products' })}>Products content</section>",
      "        <span {...api.getItemIndicatorProps({ value: 'products' })} />",
      "      </li>",
      "    </ul>",
      "    <div {...api.getIndicatorProps()} />",
      "    <div {...api.getViewportPositionerProps({ align: 'center' })}><div {...api.getViewportProps({ align: 'center' })}><span {...api.getArrowProps()} /></div></div>",
      "  </nav>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/navigation-menu": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "navigation-menu-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["setup-machine", "default-props", "bindable-context", "computed-open", "watch-value", "refs", "entry-exit-effects", "root-events", "state-chart", "guard-logic"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["value", "previous-value", "viewport-size", "viewport-rendered", "viewport-position", "content-node", "trigger-rect", "trigger-node"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-document-resize", "track-resize-observer", "content-resize-observer", "dismissable-content", "exitcomplete-listener"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-value", "timeout-actions", "select-deselect-value", "sync-content-node", "set-trigger-node", "sync-motion-attribute", "focus-actions", "tab-order-actions", "cleanup-observers", "viewport-position"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["root-id", "trigger-id", "trigger-proxy-id", "content-id", "viewport-id", "list-id", "item-id", "root-el", "viewport-el", "trigger-el", "trigger-proxy-el", "list-el", "content-el", "content-els", "tabbable-els", "trigger-els", "link-els", "elements", "resize-observer", "motion-attr", "focus-first", "tab-order"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "value-api", "orientation", "viewport-rendered-api", "viewport-node-api", "set-value", "reposition-api", "root-props", "list-props", "item-props", "indicator-props", "item-indicator-props", "arrow-props", "trigger-props", "trigger-proxy-props", "viewport-proxy-props", "link-props", "content-props", "viewport-positioner-props", "viewport-props", "item-state-api", "dir-prop", "root-aria-label", "data-orientation", "layout-css-vars", "data-value", "data-state", "data-disabled", "aria-hidden", "hidden-prop", "indicator-position-absolute", "transition-none", "data-uid", "data-trigger-proxy-id", "aria-controls", "aria-expanded", "pointer-enter-handler", "pointer-leave-handler", "mouse-pointer-guard", "disable-hover-guard", "disable-click-guard", "key-navigation", "prevent-default", "stop-propagation", "trigger-proxy-focus", "visually-hidden-style", "aria-owns", "aria-current-page", "custom-link-select", "close-on-click", "meta-key-guard", "aria-labelledby", "viewport-pointer-events-none", "data-align"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/navigation-menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "navigation-menu-readiness.md"), "utf8");
    expect(markdown).toContain("## Machine Signals");
    expect(markdown).toContain("## API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "navigation-menu-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("API Signals");
  });

  it("detects presence readiness without mounting real presence nodes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-presence-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-presence-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-presence.tsx"), [
      "import * as presence from '@zag-js/presence';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function DialogPresence() {",
      "  const service = useMachine(presence.machine, {",
      "    id: 'dialog-presence',",
      "    present: true,",
      "    immediate: false,",
      "    onExitComplete: console.info",
      "  });",
      "  const api = presence.connect(service, normalizeProps);",
      "  api.skip; api.present; api.setNode(document.querySelector('[data-presence-node]') as HTMLElement | null); api.unmount();",
      "  const evidence = 'Presence mounted unmountSuspended unmounted present initial skip presence.changed setNode cleanupNode exitcomplete onExitComplete immediate hidden visibilityState document.hidden requestAnimationFrame getAnimationName animationName prevAnimationName unmountAnimationName animationDuration animationFillMode forwards animationstart animationend animationcancel cleanupEventListeners cleanupStyles set-node unmount present-api skip-api exit-complete visibility-test animation-test exitcomplete-test presence-traces upload-artifact';",
      "  return <section data-evidence={evidence} data-presence-node data-state={api.present ? 'mounted' : 'unmounted'} data-skip={api.skip}>Presence content</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-presence.tsx"), [
      "export function CustomPresence({ present }: { present: boolean }) {",
      "  const traces = 'custom presence data-presence mounted unmount-suspended unmounted present initial skip presence-changed mount unmount set-node cleanup-node exit-complete callback on-exit-complete immediate hidden-skip document-hidden visibility-state request-animation-frame animation-start animation-end animation-cancel animation-name animation-duration animation-fill-mode prev-animation-name unmount-animation-name cleanup-event-listeners cleanup-styles present-api skip-api presence-traces';",
      "  return <div data-presence data-state={present ? 'mounted' : 'unmounted'} data-skip='false' data-evidence={traces}>{traces}</div>;",
      "}",
      "",
      "export const presenceNotes = 'presence.changed mounted unmountSuspended unmounted cleanupNode exitcomplete onExitComplete immediate document.hidden visibilityState requestAnimationFrame animationstart animationend animationcancel animationFillMode forwards prevAnimationName unmountAnimationName';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "presence.spec.tsx"), [
      "import { render } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('presence readiness', () => {",
      "  it('covers animation, visibility, exitcomplete, and artifacts', async () => {",
      "    const user = userEvent.setup();",
      "    const onExitComplete = vi.fn();",
      "    render(<div data-presence data-state='mounted'>Presence</div>);",
      "    await user.click(document.body);",
      "    expect('animation-test visibility-test exitcomplete-test presence-traces upload-artifact vitest testing-library user-event onExitComplete').toContain('exitcomplete-test');",
      "    expect(onExitComplete).toBeDefined();",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "presence.yml"), [
      "name: presence-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- presence",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: presence-traces",
      "          path: test-results/presence"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/presence": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/utils": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "presence-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      presenceSetups: Array<{ filePath: string; framework: string; presentCount: number; stateCount: number; mountCount: number; unmountCount: number; animationCount: number; eventCount: number; visibilityCount: number; immediateCount: number; callbackCount: number; apiCount: number; cleanupCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      animationSignals: Array<{ signal: string; readiness: string }>;
      visibilitySignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Presence readiness Zag presence Headless UI Transition mounted unmountSuspended unmounted nesting transition data open closed visibility immediate tests");
    expect(report.presenceSetups.some((item) => item.filePath === "src/zag-presence.tsx" && item.framework === "zag-presence" && item.presentCount > 0 && item.stateCount > 0 && item.mountCount > 0 && item.unmountCount > 0 && item.animationCount > 0 && item.eventCount > 0 && item.visibilityCount > 0 && item.immediateCount > 0 && item.callbackCount > 0 && item.apiCount > 0 && item.cleanupCount > 0)).toBe(true);
    expect(report.presenceSetups.some((item) => item.filePath === "src/custom-presence.tsx" && item.framework === "custom-presence" && item.presentCount > 0 && item.stateCount > 0 && item.mountCount > 0 && item.unmountCount > 0 && item.animationCount > 0 && item.eventCount > 0 && item.visibilityCount > 0 && item.immediateCount > 0 && item.callbackCount > 0 && item.apiCount > 0 && item.cleanupCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-presence", "custom-presence"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["mounted", "unmount-suspended", "unmounted", "present", "initial", "skip"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["mount", "unmount", "presence-changed", "set-node", "cleanup-node", "exit-complete"]));
    expect(readySignals(report.animationSignals)).toEqual(expect.arrayContaining(["animation-start", "animation-end", "animation-cancel", "animation-name", "animation-duration", "animation-fill-mode", "prev-animation-name", "unmount-animation-name"]));
    expect(readySignals(report.visibilitySignals)).toEqual(expect.arrayContaining(["document-hidden", "visibility-state", "request-animation-frame", "immediate", "hidden-skip"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["set-node", "unmount", "present-api", "skip-api", "on-exit-complete"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "animation-test", "visibility-test", "exitcomplete-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/presence", "@zag-js/core", "@zag-js/dom-query", "@zag-js/utils", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/presence"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records presence readiness only; it does not mount or unmount real DOM nodes, wait real animations, dispatch animation events, inspect live computed styles, mutate document visibility, call exit callbacks, or run analyzed project tests."))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "presence-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "presence-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "presence-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "presence-readiness.md"), "utf8");
    expect(markdown).toContain("Presence Readiness");
    expect(markdown).toContain("@zag-js/presence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "presence-readiness.html"), "utf8");
    expect(html).toContain("presence-readiness-card");
    expect(html).toContain("data-source-pattern=\"Presence\"");
    expect(html).toContain("RepoTutor records presence readiness only");
  });

  it("detects Zag presence machine readiness without mounting real presence nodes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-presence-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-presence-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-presence-machine.tsx"), [
      "import * as presence from '@zag-js/presence';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function MachinePresence() {",
      "  const service = useMachine(presence.machine, {",
      "    id: 'machine-presence',",
      "    present: true,",
      "    immediate: false,",
      "    onExitComplete: console.info",
      "  });",
      "  const api = presence.connect(service, normalizeProps);",
      "  api.skip; api.present; api.setNode(document.querySelector('[data-presence-node]') as HTMLElement | null); api.unmount();",
      "  const machineEvidence = 'createMachine PresenceSchema props present boolean initialState mounted unmounted refs node styles context unmountAnimationName bindable prevAnimationName bindable present bindable initial bindable sync true exit cleanupNode watch present PRESENCE.CHANGED NODE.SET MOUNT UNMOUNT UNMOUNT.SUSPEND mounted unmountSuspended unmounted effects trackAnimationEvents';",
      "  const contextEvidence = 'unmountAnimationName bindable prevAnimationName bindable present bindable initial bindable sync true node ref styles ref';",
      "  const effectEvidence = 'trackAnimationEvents animationstart animationcancel animationend getEventTarget composedPath getAnimationName unmountAnimationName setStyle animationFillMode forwards removeEventListener nextTick cleanupStyles';",
      "  const actionEvidence = 'setInitial queueMicrotask invokeOnExitComplete onExitComplete CustomEvent exitcomplete dispatchEvent setupNode getComputedStyle cleanupNode syncPresence ownerDocument visibilityState hidden raf animationDuration 0s setPrevAnimationName clearPrevAnimationName';",
      "  const apiEvidence = 'skip present setNode unmount state matches mounted unmountSuspended NODE.SET UNMOUNT onExitComplete if !node return context initial props-create-props present-prop on-exit-complete-prop immediate-prop presence-api-interface skip-boolean present-boolean set-node-nullable unmount-void-api presence-service-type presence-machine-type present-coerce-boolean initial-state-present-prop exitcomplete-bubbles-false node-dispatch-event same-node-guard computed-style-cache visibility-hidden-unmount raf-presence-check animation-name-none display-none-unmount zero-duration-unmount unmount-suspend-event';",
      "  const packageEvidence = '@zag-js/presence @zag-js/react @zag-js/core @zag-js/dom-query @zag-js/types react';",
      "  return <section data-presence-node data-evidence={[machineEvidence, contextEvidence, effectEvidence, actionEvidence, apiEvidence, packageEvidence].join(' ')} data-state={api.present ? 'mounted' : 'unmounted'} data-skip={api.skip}>Presence content</section>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/presence": "latest",
        "@zag-js/react": "latest",
        "@zag-js/types": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "presence-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "default-props", "initial-state", "refs", "bindable-context", "exit-cleanup", "watch-present", "node-presence-events", "state-transitions", "track-animation-effect"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["unmount-animation-name", "prev-animation-name", "present-context", "initial-context", "node-ref", "styles-ref"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-animation-events", "animation-start-listener", "animation-end-listener", "animation-cancel-listener", "animation-fill-mode", "cleanup-listeners", "next-tick-cleanup"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-initial", "invoke-exit-complete", "setup-node", "cleanup-node", "sync-presence", "set-prev-animation-name", "clear-prev-animation-name"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["set-node", "unmount", "present-api", "skip-api", "on-exit-complete", "node-null-guard", "node-set-event", "unmount-event", "state-matches-present", "initial-skip", "props-create-props", "present-prop", "on-exit-complete-prop", "immediate-prop", "presence-api-interface", "skip-boolean", "present-boolean", "set-node-nullable", "unmount-void-api", "presence-service-type", "presence-machine-type", "present-coerce-boolean", "initial-state-present-prop", "exitcomplete-bubbles-false", "node-dispatch-event", "same-node-guard", "computed-style-cache", "visibility-hidden-unmount", "raf-presence-check", "animation-name-none", "display-none-unmount", "zero-duration-unmount", "unmount-suspend-event"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/presence", "@zag-js/react", "@zag-js/core", "@zag-js/dom-query", "@zag-js/types", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "presence-readiness.md"), "utf8");
    expect(markdown).toContain("Machine Signals");
    expect(markdown).toContain("@zag-js/presence");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "presence-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("@zag-js/presence");
  });

  it("detects Headless UI transition implementation details without running animations", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-transition-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-headless-transition-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "headless-transition.tsx"), [
      "import { Transition } from '@headlessui/react';",
      "",
      "export function HeadlessTransitionFixture() {",
      "  const transitionEvidence = 'TransitionContext NestingContext TreeStates Visible Hidden shouldForwardRef useNesting children register unregister hasChildren RenderStrategy Unmount Hidden transitionableChildren chains wait Promise useServerHandoffComplete initial appear show skip initial transition immediate appear useTransition() transitionDataAttributes classNames enter leave entered OpenClosedProvider State.Open State.Closed State.Opening State.Closing useOpenClosed missing show initial changes ref beforeEnter beforeLeave afterEnter afterLeave InternalTransitionChild TransitionChild Object.assign(TransitionRoot, { Child, Root })';",
      "  return <Transition show appear beforeEnter={() => undefined} afterLeave={() => undefined} className={transitionEvidence}>Transition content</Transition>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@headlessui/react": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "presence-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      presenceSetups: Array<{ filePath: string; framework: string; stateCount: number; unmountCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      implementationSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Presence readiness Zag presence Headless UI Transition mounted unmountSuspended unmounted nesting transition data open closed visibility immediate tests");
    expect(report.presenceSetups.some((item) => item.filePath === "src/headless-transition.tsx" && item.framework === "headless-transition" && item.stateCount > 0 && item.unmountCount > 0 && item.readiness !== "missing")).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["headless-transition"]));
    expect(readySignals(report.implementationSignals)).toEqual(expect.arrayContaining([
      "transition-context",
      "nesting-context",
      "tree-states",
      "should-forward-ref",
      "register-unregister",
      "has-children",
      "render-strategy-unmount-hidden",
      "transition-chains",
      "wait-promises",
      "server-handoff",
      "skip-initial-transition",
      "immediate-appear",
      "use-transition-hook",
      "transition-data-attributes",
      "class-map-enter-leave",
      "open-closed-provider",
      "state-opening-closing",
      "show-from-open-closed",
      "missing-show-error",
      "initial-change-tracking",
      "before-enter-leave",
      "after-enter-leave",
      "internal-transition-child",
      "transition-object-assign"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@headlessui/react", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "presence-readiness.md"), "utf8");
    expect(markdown).toContain("Implementation Signals");
    expect(markdown).toContain("headless-transition");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "presence-readiness.html"), "utf8");
    expect(html).toContain("Implementation Signals");
    expect(html).toContain("headless-transition");
  });

  it("detects menu readiness without opening real menus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-menu-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-menu-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-menu.tsx"), [
      "import * as menu from '@zag-js/menu';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function AccountMenu() {",
      "  const service = useMachine(menu.machine, {",
      "    id: 'account-menu',",
      "    dir: 'ltr',",
      "    open: false,",
      "    defaultOpen: false,",
      "    defaultHighlightedValue: 'profile',",
      "    highlightedValue: 'profile',",
      "    triggerValue: 'account',",
      "    defaultTriggerValue: 'account',",
      "    anchorPoint: { x: 20, y: 30 },",
      "    loopFocus: true,",
      "    typeahead: true,",
      "    composite: true,",
      "    closeOnSelect: true,",
      "    positioning: { placement: 'bottom-start', gutter: 8 },",
      "    navigate: console.info,",
      "    onOpenChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onSelect: console.info,",
      "    onTriggerValueChange: console.info,",
      "    onEscapeKeyDown: console.info,",
      "    onFocusOutside: console.info,",
      "    onInteractOutside: console.info,",
      "    onPointerDownOutside: console.info",
      "  });",
      "  const api = menu.connect(service, normalizeProps);",
      "  api.open; api.highlightedValue; api.triggerValue; api.setOpen(true); api.setTriggerValue('account'); api.setHighlightedValue('profile'); api.reposition({ placement: 'right-start' }); api.addItemListener({ id: 'profile', onSelect: console.info }); api.getItemState({ value: 'profile' }); api.getOptionItemState({ type: 'checkbox', value: 'beta', checked: true });",
      "  const evidence = 'Menu idle closed opening open closing opening:contextmenu CONTROLLED.OPEN CONTROLLED.CLOSE OPEN OPEN_AUTOFOCUS CLOSE CONTEXT_MENU_START CONTEXT_MENU CONTEXT_MENU_CANCEL LONG_PRESS.OPEN DELAY.OPEN DELAY.CLOSE TRIGGER_VALUE.SET HIGHLIGHTED.SET HIGHLIGHTED.RESTORE HIGHLIGHTED.SUGGEST highlightedValue lastHighlightedValue currentPlacement intentPolygon anchorPoint isSubmenu triggerValue pointerRoutingMode parent children pointerRoutingLocked typeaheadState positioningOverride loopFocus typeahead composite closeOnSelect defaultHighlightedValue defaultTriggerValue onHighlightChange onSelect onTriggerValueChange setTriggerValue setHighlightedValue setParent setChild reposition addItemListener getContextTriggerProps getTriggerProps getContentProps getItemProps getOptionItemProps getOptionItemState getItemIndicatorProps getItemTextProps getSeparatorProps getArrowProps getArrowTipProps trigger context-trigger positioner content item option itemGroup itemGroupLabel separator indicator itemIndicator itemText arrow arrowTip trackDismissableElement onInteractOutside onFocusOutside onPointerDownOutside onEscapeKeyDown onRequestDismiss focusMenu focusTrigger trackFocusVisible trackPositioning getPlacement getPlacementStyles getPlacementSide currentPlacementSide popperStyles context-menu anchor-point getAnchorRect TRIGGER_CLICK TRIGGER_FOCUS TRIGGER_POINTERMOVE TRIGGER_POINTERLEAVE ITEM_POINTERMOVE ITEM_POINTERLEAVE ITEM_POINTERDOWN ITEM_CLICK MENU_POINTERENTER POINTER_MOVED_AWAY_FROM_SUBMENU trackPointerMove intent-polygon typeahead getByTypeahead highlightMatchedItem isPrintableKey ARROW_DOWN ARROW_UP ARROW_LEFT ARROW_RIGHT HOME END ENTER Space Tab Escape navigate clickHighlightedItem setOptionState checkbox radio aria-haspopup aria-controls aria-expanded aria-activedescendant aria-labelledby aria-checked data-state data-placement data-side data-ownedby data-value data-valuetext data-highlighted data-disabled data-current dir menu-traces keyboard-test pointer-test typeahead-test context-menu-test submenu-test option-test positioning-test upload-artifact';",
      "  return <div data-evidence={evidence}>",
      "    <button {...api.getContextTriggerProps({ value: 'context-account' })}>Context</button>",
      "    <button {...api.getTriggerProps({ value: 'account' })}>Account</button>",
      "    <div {...api.getPositionerProps()}><div {...api.getContentProps()}><div {...api.getItemGroupProps({ id: 'group' })}><div {...api.getItemGroupLabelProps({ htmlFor: 'group' })}>Group</div><button {...api.getItemProps({ value: 'profile', valueText: 'Profile' })}><span {...api.getItemTextProps({ value: 'profile' })}>Profile</span></button><button {...api.getOptionItemProps({ type: 'checkbox', value: 'beta', checked: true })}><span {...api.getItemIndicatorProps({ value: 'beta' })} /></button></div><div {...api.getSeparatorProps()} /><span {...api.getArrowProps()}><span {...api.getArrowTipProps()} /></span></div></div>",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-menu.tsx"), [
      "export function CustomMenu() {",
      "  const traces = 'custom menu data-scope menu data-part trigger context-trigger positioner content item option item-group item-group-label separator indicator item-indicator item-text arrow arrow-tip open closed opening closing contextmenu highlighted-value last-highlighted current-placement intent-polygon anchor-point submenu trigger-value pointer-routing parent-child typeahead-state positioning-override loop-focus typeahead composite close-on-select trigger-value-set highlighted-set highlighted-restore highlighted-suggest open-autofocus delay-open delay-close long-press context-menu-start context-menu-cancel context-menu anchor-rect get-placement popper-styles placement-side dismissable interact-outside focus-outside pointer-down-outside escape-key request-dismiss focus-menu focus-trigger focus-visible pointer-move pointer-leave pointer-down item-click menu-pointerenter pointer-moved-away intent-polygon typeahead matched-item arrow-keys home-end enter-space tab-escape navigate click-highlighted option-state checkbox radio role-menu menuitem menuitemcheckbox aria-haspopup aria-controls aria-expanded aria-activedescendant aria-labelledby aria-checked data-state data-placement data-side data-ownedby data-value data-valuetext data-highlighted data-disabled data-current dir keyboard-test pointer-test typeahead-test context-menu-test submenu-test option-test positioning-test menu-traces upload-artifact';",
      "  return <div data-scope='menu' data-evidence={traces}>",
      "    <button data-part='trigger' aria-haspopup='menu' aria-controls='account-menu' aria-expanded='false' data-state='closed' data-value='account' data-current=''>Account</button>",
      "    <button data-part='context-trigger' data-value='context-account' data-state='closed'>Context</button>",
      "    <div data-part='positioner' style={{ ['--popper-x' as string]: '10px' }}><div id='account-menu' data-part='content' role='menu' tabIndex={0} aria-activedescendant='profile' aria-labelledby='account-trigger' data-placement='bottom-start' data-side='bottom' data-state='open'>",
      "      <div data-part='item-group'><div data-part='item-group-label'>Group</div><button data-part='item' role='menuitem' data-highlighted='' data-value='profile' data-valuetext='Profile'>Profile</button><button data-part='item' role='menuitemcheckbox' aria-checked='true' data-type='checkbox' data-value='beta'><span data-part='item-indicator' /><span data-part='item-text'>Beta</span></button></div>",
      "      <div data-part='separator' role='separator' /><span data-part='indicator' /><span data-part='arrow'><span data-part='arrow-tip' /></span>",
      "    </div></div>{traces}",
      "  </div>;",
      "}",
      "",
      "export const menuNotes = 'triggerValue highlightedValue currentPlacement anchorPoint intentPolygon pointerRoutingMode typeaheadState positioningOverride waitForOpenDelay waitForCloseDelay waitForLongPress trackInteractOutside trackFocusVisible trackPositioning trackPointerMove getPlacement getPlacementStyles getPlacementSide setOptionState closeRootMenu setParentRoutingLock unlockParentOnOpen unlockParentOnClose dispatchSelectionEvent getByTypeahead isPrintableKey';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "menu.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('menu readiness', () => {",
      "  it('covers keyboard, pointer, typeahead, context menu, submenu, option, positioning, and artifacts', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup();",
      "    render(<div data-scope='menu'><button aria-haspopup='menu'>Account</button><div role='menu'><button role='menuitem'>Profile</button></div></div>);",
      "    await user.click(screen.getByRole('button', { name: 'Account' }));",
      "    await user.keyboard('{ArrowDown}{ArrowUp}{ArrowRight}{Home}{End}{Enter}{Escape}p');",
      "    expect('keyboard-test pointer-test typeahead-test context-menu-test submenu-test option-test positioning-test menu-traces upload-artifact vitest testing-library user-event').toContain('typeahead-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "menu.yml"), [
      "name: menu-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- menu",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: menu-traces",
      "          path: test-results/menu"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/menu": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/focus-visible": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/rect-utils": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "menu-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      menuSetups: Array<{ filePath: string; framework: string; triggerCount: number; contextTriggerCount: number; contentCount: number; itemCount: number; optionItemCount: number; groupCount: number; separatorCount: number; arrowCount: number; stateCount: number; highlightCount: number; typeaheadCount: number; positioningCount: number; submenuCount: number; dismissCount: number; keyboardCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      anatomySignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      highlightSignals: Array<{ signal: string; readiness: string }>;
      typeaheadSignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      keyboardSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Menu readiness Zag menu trigger context typeahead submenu positioning dismissable keyboard option tests");
    expect(report.menuSetups.some((item) => item.filePath === "src/zag-menu.tsx" && item.framework === "zag-menu" && item.triggerCount > 0 && item.contextTriggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.optionItemCount > 0 && item.groupCount > 0 && item.separatorCount > 0 && item.arrowCount > 0 && item.stateCount > 0 && item.highlightCount > 0 && item.typeaheadCount > 0 && item.positioningCount > 0 && item.submenuCount > 0 && item.dismissCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.menuSetups.some((item) => item.filePath === "src/custom-menu.tsx" && item.framework === "custom-menu" && item.triggerCount > 0 && item.contextTriggerCount > 0 && item.contentCount > 0 && item.itemCount > 0 && item.optionItemCount > 0 && item.groupCount > 0 && item.separatorCount > 0 && item.arrowCount > 0 && item.stateCount > 0 && item.highlightCount > 0 && item.typeaheadCount > 0 && item.positioningCount > 0 && item.submenuCount > 0 && item.dismissCount > 0 && item.keyboardCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-menu", "custom-menu"]));
    expect(readySignals(report.anatomySignals)).toEqual(expect.arrayContaining(["trigger", "context-trigger", "positioner", "content", "item", "option-item", "item-group", "item-group-label", "separator", "indicator", "item-indicator", "item-text", "arrow", "arrow-tip"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["idle", "open", "closed", "opening", "closing", "contextmenu", "trigger-value", "controlled-open", "default-open"]));
    expect(readySignals(report.highlightSignals)).toEqual(expect.arrayContaining(["highlighted-value", "last-highlighted", "highlighted-set", "highlighted-restore", "highlighted-suggest", "item-state", "option-state"]));
    expect(readySignals(report.typeaheadSignals)).toEqual(expect.arrayContaining(["typeahead", "typeahead-state", "matched-item", "printable-key", "value-text"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["positioning", "current-placement", "placement-side", "popper-styles", "reposition", "anchor-point", "anchor-rect", "context-menu-position"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["trigger-click", "trigger-focus", "pointer-move", "pointer-leave", "item-click", "dismissable", "interact-outside", "focus-outside", "escape-key", "option-state", "submenu-routing"]));
    expect(readySignals(report.keyboardSignals)).toEqual(expect.arrayContaining(["arrow-keys", "home-end", "enter-space", "tab-escape", "navigate", "focus-menu", "focus-trigger"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-menu", "menuitem", "menuitemcheckbox", "aria-haspopup", "aria-controls", "aria-expanded", "aria-activedescendant", "aria-labelledby", "aria-checked", "data-state", "data-placement", "data-side", "data-ownedby", "data-value", "data-highlighted", "direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "keyboard-test", "pointer-test", "typeahead-test", "context-menu-test", "submenu-test", "option-test", "positioning-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/menu", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/anatomy", "@zag-js/core", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/menu"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records menu readiness only; it does not open real menus, wait real delays, calculate live popper placement, route real submenu pointer polygons, dispatch pointer/keyboard/outside events, click real links, mutate option state, or run analyzed project tests."))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "menu-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "menu-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "menu-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "menu-readiness.md"), "utf8");
    expect(markdown).toContain("Menu Readiness");
    expect(markdown).toContain("@zag-js/menu");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "menu-readiness.html"), "utf8");
    expect(html).toContain("menu-readiness-card");
    expect(html).toContain("data-source-pattern=\"Menu\"");
    expect(html).toContain("RepoTutor records menu readiness only");
  });

  it("detects Zag menu machine readiness without opening real menus", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-menu-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-menu-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-menu-machine.tsx"), [
      "import * as menu from '@zag-js/menu';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function MachineMenu() {",
      "  const service = useMachine(menu.machine, {",
      "    id: 'machine-menu',",
      "    ids: { trigger: 'menu-trigger', contextTrigger: 'menu-context-trigger', content: 'menu-content', arrow: 'menu-arrow', positioner: 'menu-positioner', group: (id) => `menu-group-${id}`, groupLabel: (id) => `menu-group-label-${id}` },",
      "    dir: 'ltr',",
      "    defaultOpen: true,",
      "    open: false,",
      "    defaultHighlightedValue: 'copy',",
      "    highlightedValue: 'copy',",
      "    defaultTriggerValue: 'file',",
      "    triggerValue: 'file',",
      "    anchorPoint: { x: 120, y: 40 },",
      "    loopFocus: true,",
      "    typeahead: true,",
      "    composite: true,",
      "    closeOnSelect: true,",
      "    positioning: { placement: 'bottom-start', gutter: 8 },",
      "    navigate: console.info,",
      "    onOpenChange: console.info,",
      "    onHighlightChange: console.info,",
      "    onSelect: console.info,",
      "    onTriggerValueChange: console.info,",
      "    onEscapeKeyDown: console.info,",
      "    onFocusOutside: console.info,",
      "    onInteractOutside: console.info,",
      "    onPointerDownOutside: console.info,",
      "    onRequestDismiss: console.info",
      "  });",
      "  const api = menu.connect(service, normalizeProps);",
      "  api.open; api.highlightedValue; api.triggerValue; api.setOpen(true); api.setTriggerValue('file'); api.setHighlightedValue('copy'); api.reposition({ placement: 'right-start' }); api.addItemListener({ id: 'copy', onSelect: console.info }); api.setParent; api.setChild;",
      "  const machineEvidence = 'createMachine<MenuSchema> createGuards<MenuSchema> props closeOnSelect typeahead composite loopFocus positioning placement bottom-start gutter initialState open defaultOpen idle context highlightedValue bindable lastHighlightedValue bindable currentPlacement bindable intentPolygon bindable anchorPoint bindable isSubmenu bindable triggerValue bindable pointerRoutingMode bindable refs parent children pointerRoutingLocked typeaheadState positioningOverride computed isRtl isTypingAhead highlightedId watch isSubmenu setSubmenuPlacement anchorPoint reposition open toggleVisibility TRIGGER_VALUE.SET PARENT.SET CHILD.SET OPEN OPEN_AUTOFOCUS CLOSE HIGHLIGHTED.RESTORE HIGHLIGHTED.SET HIGHLIGHTED.SUGGEST idle opening:contextmenu opening closing closed open CONTROLLED.OPEN CONTROLLED.CLOSE CONTEXT_MENU_START CONTEXT_MENU CONTEXT_MENU_CANCEL TRIGGER_CLICK TRIGGER_FOCUS TRIGGER_POINTERMOVE TRIGGER_POINTERLEAVE BLUR DELAY.OPEN DELAY.CLOSE LONG_PRESS.OPEN MENU_POINTERENTER POINTER_MOVED_AWAY_FROM_SUBMENU ARROW_DOWN ARROW_UP ARROW_LEFT ARROW_RIGHT HOME END ENTER ITEM_POINTERMOVE ITEM_POINTERLEAVE ITEM_POINTERDOWN ITEM_CLICK TYPEAHEAD FOCUS_MENU POSITIONING.SET implementations guards effects actions';",
      "  const effectEvidence = 'waitForOpenDelay waitForCloseDelay waitForLongPress trackFocusVisible trackPositioning trackInteractOutside trackDismissableElement trackPointerMove scrollToHighlightedItem observeAttributes addDomEvent getPlacement getInteractionModality setInteractionModality scrollIntoView';",
      "  const guardEvidence = 'closeOnSelect isTriggerItem isTriggerItemHighlighted isSubmenu isPointerRoutingLocked isHighlightedItemEditable isOpenControlled isArrowLeftEvent isArrowUpEvent isArrowDownEvent isOpenAutoFocusEvent';",
      "  const actionEvidence = 'setAnchorPoint setSubmenuPlacement reposition setOptionState clickHighlightedItem setIntentPolygon clearIntentPolygon clearAnchorPoint unlockParentOnOpen unlockParentOnClose setHighlightedItem clearHighlightedItem focusMenu highlightFirstItem highlightLastItem highlightNextItem highlightPrevItem invokeOnSelect focusTrigger highlightMatchedItem setParentMenu setChildMenu closeSiblingMenus closeRootMenu openSubmenu focusParentMenu setLastHighlightedItem suggestHighlightedItem restoreHighlightedItem restoreParentHighlightedItem invokeOnOpen invokeOnClose releaseParentRoutingLock toggleVisibility setTriggerValue getElementPolygon isPointInPolygon setParentRoutingLock unlockParentAfterChildClose unlockParentOnSubmenuClose dispatchSelectionEvent';",
      "  const domEvidence = 'getTriggerId getContextTriggerId getContentId getArrowId getPositionerId getGroupId getItemId getItemValue getGroupLabelId getContentEl getPositionerEl getTriggerEl getItemEl getArrowEl getContextTriggerEl getTriggerEls getContextTriggerEls getActiveTriggerEl getElements getFirstEl getLastEl getNextEl getPrevEl getElemByKey isTargetDisabled isTriggerItem getOptionFromItemEl itemSelectEvent isTargetWithinMenuTree';",
      "  const apiEvidence = 'open highlightedValue triggerValue setOpen setTriggerValue setHighlightedValue setParent setChild reposition addItemListener getContextTriggerProps getTriggerItemProps getTriggerProps getIndicatorProps getPositionerProps getArrowProps getArrowTipProps getContentProps getSeparatorProps getItemState getItemProps getOptionItemState getOptionItemProps getItemIndicatorProps getItemTextProps getItemGroupLabelProps getItemGroupProps dir-prop data-placement data-side type-button data-ownedby data-value data-current data-uid aria-haspopup-menu-dialog aria-controls data-controls aria-expanded pointer-move-handler pointer-leave-handler disabled-target-guard context-menu-guard prevent-default default-prevented-guard trigger-blur-handler trigger-focus-handler key-map-arrow positioner-floating-style arrow-style arrow-tip-style content-role content-tabindex aria-activedescendant aria-labelledby valid-tab-guard typeahead-printable-guard separator-role option-data-type aria-checked item-indicator-hidden item-group-role download-guard new-tab-guard drag-link-prevent-default';",
      "  return <div data-evidence={[machineEvidence, effectEvidence, guardEvidence, actionEvidence, domEvidence, apiEvidence].join(' ')}>",
      "    <button {...api.getContextTriggerProps({ value: 'context-file' })}>Context</button>",
      "    <button {...api.getTriggerProps({ value: 'file' })}>File</button>",
      "    <span {...api.getIndicatorProps()} />",
      "    <div {...api.getPositionerProps()}><div {...api.getContentProps()}><div {...api.getItemGroupProps({ id: 'main' })}><div {...api.getItemGroupLabelProps({ htmlFor: 'main' })}>Main</div><button {...api.getItemProps({ value: 'copy', valueText: 'Copy' })}><span {...api.getItemTextProps({ value: 'copy' })}>Copy</span></button><button {...api.getOptionItemProps({ type: 'checkbox', value: 'beta', checked: true })}><span {...api.getItemIndicatorProps({ value: 'beta' })} />Beta</button></div><div {...api.getSeparatorProps()} /><span {...api.getArrowProps()}><span {...api.getArrowTipProps()} /></span></div></div>",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/menu": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dismissable": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/focus-visible": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/rect-utils": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "menu-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      computedSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      guardSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "create-guards", "default-props", "initial-state", "bindable-context", "refs", "computed-state", "watch-props", "root-events", "delayed-states", "open-state", "implementation-block"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["highlighted-value", "last-highlighted-value", "current-placement", "intent-polygon", "anchor-point", "is-submenu", "trigger-value", "pointer-routing-mode"]));
    expect(readySignals(report.computedSignals)).toEqual(expect.arrayContaining(["is-rtl", "is-typing-ahead", "highlighted-id"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["wait-open-delay", "wait-close-delay", "wait-long-press", "track-focus-visible", "track-positioning", "track-interact-outside", "track-pointer-move", "scroll-highlighted-item", "observe-attributes"]));
    expect(readySignals(report.guardSignals)).toEqual(expect.arrayContaining(["close-on-select", "is-trigger-item", "is-trigger-item-highlighted", "is-submenu", "is-pointer-routing-locked", "is-highlighted-item-editable", "is-open-controlled", "arrow-event", "open-autofocus-event"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-anchor-point", "set-submenu-placement", "reposition", "set-option-state", "click-highlighted-item", "intent-polygon", "parent-routing-lock", "highlight-navigation", "selection-callback", "focus-actions", "typeahead-match", "parent-child-menu", "submenu-actions", "open-close-callbacks", "toggle-visibility", "trigger-value"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["trigger-id", "context-trigger-id", "content-id", "arrow-id", "positioner-id", "group-id", "item-id", "group-label-id", "content-el", "positioner-el", "trigger-el", "item-el", "arrow-el", "context-trigger-el", "trigger-els", "context-trigger-els", "elements-query", "typeahead-key", "selection-event", "menu-tree"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "highlighted-value", "trigger-value", "set-open", "set-trigger-value", "set-highlighted-value", "set-parent", "set-child", "reposition", "add-item-listener", "context-trigger-props", "trigger-item-props", "trigger-props", "indicator-props", "positioner-props", "arrow-props", "arrow-tip-props", "content-props", "separator-props", "item-state", "item-props", "option-item-state", "option-item-props", "item-indicator-props", "item-text-props", "item-group-label-props", "item-group-props", "dir-prop", "data-placement", "data-side", "type-button", "data-ownedby", "data-value", "data-current", "data-uid", "aria-haspopup-menu-dialog", "aria-controls", "data-controls", "aria-expanded", "pointer-move-handler", "pointer-leave-handler", "disabled-target-guard", "context-menu-guard", "prevent-default", "default-prevented-guard", "trigger-blur-handler", "trigger-focus-handler", "key-map-arrow", "positioner-floating-style", "arrow-style", "arrow-tip-style", "content-role", "content-tabindex", "aria-activedescendant", "aria-labelledby", "valid-tab-guard", "typeahead-printable-guard", "separator-role", "option-data-type", "aria-checked", "item-indicator-hidden", "item-group-role", "download-guard", "new-tab-guard", "drag-link-prevent-default"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/menu", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dismissable", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/rect-utils", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "menu-readiness.md"), "utf8");
    expect(markdown).toContain("## Machine Signals");
    expect(markdown).toContain("## API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "menu-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("API Signals");
  });

  it("detects tooltip readiness without opening real tooltips", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tooltip-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tooltip-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tooltip.tsx"), [
      "import * as tooltip from '@zag-js/tooltip';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function HelpTooltip() {",
      "  const service = useMachine(tooltip.machine, {",
      "    id: 'help-tooltip',",
      "    dir: 'ltr',",
      "    open: false,",
      "    defaultOpen: false,",
      "    disabled: false,",
      "    interactive: true,",
      "    closeOnClick: true,",
      "    closeOnPointerDown: true,",
      "    closeOnEscape: true,",
      "    closeOnScroll: true,",
      "    openDelay: 400,",
      "    closeDelay: 150,",
      "    defaultTriggerValue: 'help',",
      "    triggerValue: 'help',",
      "    positioning: { placement: 'bottom', gutter: 8 },",
      "    onOpenChange: console.info,",
      "    onTriggerValueChange: console.info",
      "  });",
      "  const api = tooltip.connect(service, normalizeProps);",
      "  api.open; api.triggerValue; api.setOpen(true); api.setTriggerValue('help'); api.reposition({ placement: 'top' });",
      "  const evidence = 'Tooltip open closed opening closing controlled.open controlled.close open close pointer.move pointer.leave content.pointer.move content.pointer.leave positioning.set triggerValue.set defaultOpen openDelay closeDelay after.openDelay after.closeDelay waitForOpenDelay waitForCloseDelay closeOnClick closeOnPointerDown closeOnEscape closeOnScroll disabled interactive currentPlacement hasPointerMoveOpened triggerValue defaultTriggerValue setTriggerValue setOpen reposition repositionImmediate getPlacement getPlacementStyles getPlacementSide popperStyles placement current-placement currentPlacementSide active-trigger anchor-trigger trackFocusVisible trackStore store id prevId instant setGlobalId clearGlobalId store.subscribe open-tooltip close-tooltip trackScroll getOverflowAncestors scroll-close trackPointerlockChange pointerlock-close trackEscapeKey keydown.escape isComposingEvent trigger.click trigger.focus trigger.blur trigger.pointerdown pointer.move pointer.leave pointer.cancel content.pointer.move content.pointer.leave getTriggerProps getPositionerProps getContentProps getArrowProps getArrowTipProps trigger positioner content arrow arrowTip role tooltip aria-describedby aria-label data-state data-placement data-side data-ownedby data-value data-expanded data-current data-instant data-disabled dir tooltip-traces fake-timers pointer-test focus-test delay-test scroll-test escape-test positioning-test upload-artifact';",
      "  return <div data-evidence={evidence}>",
      "    <button {...api.getTriggerProps({ value: 'help' })}>Help</button>",
      "    <div {...api.getPositionerProps()}><div {...api.getContentProps()}><span {...api.getArrowProps()}><span {...api.getArrowTipProps()} /></span>Tooltip</div></div>",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "custom-tooltip.tsx"), [
      "export function CustomTooltip() {",
      "  const traces = 'custom tooltip data-scope tooltip data-part trigger positioner content arrow arrow-tip open closed opening closing controlled-open controlled-close disabled trigger-value default-open pointer-open open-delay close-delay wait-open-delay wait-close-delay instant-open positioning placement current-placement placement-side popper-styles reposition anchor-trigger get-placement tooltip-store global-id previous-id instant store-subscribe open-tooltip close-tooltip trigger-click trigger-focus trigger-blur pointer-move pointer-leave pointer-down content-pointer escape-key scroll-close pointerlock-close interactive role-tooltip aria-describedby aria-label data-state data-placement data-side data-ownedby data-value data-expanded data-current data-instant data-disabled direction fake-timers pointer-test focus-test delay-test scroll-test escape-test positioning-test tooltip-traces upload-artifact';",
      "  return <div data-scope='tooltip' data-evidence={traces}>",
      "    <button data-part='trigger' data-ownedby='help-tooltip' data-value='help' data-expanded='' data-current='' data-state='open' aria-describedby='help-tooltip-content' dir='ltr'>Help</button>",
      "    <div data-part='positioner' style={{ ['--popper-x' as string]: '8px' }}><div id='help-tooltip-content' data-part='content' role='tooltip' aria-label='Helpful context' data-state='open' data-placement='bottom' data-side='bottom' data-instant='' data-disabled='false'>",
      "      <span data-part='arrow'><span data-part='arrow-tip' /></span>Tooltip",
      "    </div></div>{traces}",
      "  </div>;",
      "}",
      "",
      "export const tooltipNotes = 'openDelay closeDelay closeOnEscape closeOnScroll closeOnPointerDown closeOnClick interactive currentPlacement hasPointerMoveOpened triggerValue defaultTriggerValue setGlobalId clearGlobalId trackStore store.subscribe trackScroll getOverflowAncestors trackPointerlockChange trackEscapeKey waitForOpenDelay waitForCloseDelay repositionImmediate getPlacement getPlacementStyles getPlacementSide popperStyles';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "tooltip.spec.tsx"), [
      "import { render, screen } from '@testing-library/react';",
      "import userEvent from '@testing-library/user-event';",
      "import { describe, expect, it, vi } from 'vitest';",
      "",
      "describe('tooltip readiness', () => {",
      "  it('covers fake timers, pointer, focus, delay, scroll, escape, positioning, and artifacts', async () => {",
      "    vi.useFakeTimers();",
      "    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });",
      "    render(<div data-scope='tooltip'><button aria-describedby='tip'>Help</button><div id='tip' role='tooltip' data-state='open'>Tip</div></div>);",
      "    await user.hover(screen.getByRole('button', { name: 'Help' }));",
      "    await user.keyboard('{Escape}');",
      "    vi.advanceTimersByTime(400);",
      "    expect('fake-timers pointer-test focus-test delay-test scroll-test escape-test positioning-test tooltip-traces upload-artifact vitest testing-library user-event').toContain('delay-test');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "tooltip.yml"), [
      "name: tooltip-traces",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm test -- tooltip",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: tooltip-traces",
      "          path: test-results/tooltip"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/tooltip": "latest",
        "@zag-js/focus-visible": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/utils": "latest",
        "@zag-js/react": "latest",
        "react": "latest"
      },
      devDependencies: {
        "@testing-library/react": "latest",
        "@testing-library/user-event": "latest",
        "vitest": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tooltip-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tooltipSetups: Array<{ filePath: string; framework: string; triggerCount: number; contentCount: number; arrowCount: number; stateCount: number; delayCount: number; positioningCount: number; storeCount: number; pointerCount: number; interactionCount: number; accessibilityCount: number; testCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      anatomySignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      delaySignals: Array<{ signal: string; readiness: string }>;
      positioningSignals: Array<{ signal: string; readiness: string }>;
      storeSignals: Array<{ signal: string; readiness: string }>;
      interactionSignals: Array<{ signal: string; readiness: string }>;
      accessibilitySignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string; why: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Tooltip readiness Zag tooltip trigger content arrow delay positioning store pointer scroll escape accessibility tests");
    expect(report.tooltipSetups.some((item) => item.filePath === "src/zag-tooltip.tsx" && item.framework === "zag-tooltip" && item.triggerCount > 0 && item.contentCount > 0 && item.arrowCount > 0 && item.stateCount > 0 && item.delayCount > 0 && item.positioningCount > 0 && item.storeCount > 0 && item.pointerCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(report.tooltipSetups.some((item) => item.filePath === "src/custom-tooltip.tsx" && item.framework === "custom-tooltip" && item.triggerCount > 0 && item.contentCount > 0 && item.arrowCount > 0 && item.stateCount > 0 && item.delayCount > 0 && item.positioningCount > 0 && item.storeCount > 0 && item.pointerCount > 0 && item.interactionCount > 0 && item.accessibilityCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["zag-tooltip", "custom-tooltip"]));
    expect(readySignals(report.anatomySignals)).toEqual(expect.arrayContaining(["trigger", "positioner", "content", "arrow", "arrow-tip"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["open", "closed", "opening", "closing", "controlled-open", "disabled", "trigger-value", "pointer-open"]));
    expect(readySignals(report.delaySignals)).toEqual(expect.arrayContaining(["open-delay", "close-delay", "instant-open", "wait-open-delay", "wait-close-delay"]));
    expect(readySignals(report.positioningSignals)).toEqual(expect.arrayContaining(["positioning", "placement", "current-placement", "placement-side", "popper-styles", "reposition", "anchor-trigger", "get-placement"]));
    expect(readySignals(report.storeSignals)).toEqual(expect.arrayContaining(["tooltip-store", "global-id", "previous-id", "instant", "store-subscribe"]));
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["trigger-click", "trigger-focus", "trigger-blur", "pointer-move", "pointer-leave", "pointer-down", "content-pointer", "escape-key", "scroll-close", "pointerlock-close", "interactive"]));
    expect(readySignals(report.accessibilitySignals)).toEqual(expect.arrayContaining(["role-tooltip", "aria-describedby", "aria-label", "data-state", "data-placement", "data-side", "data-ownedby", "data-value", "data-expanded", "data-current", "data-instant", "direction"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["vitest", "testing-library", "user-event", "fake-timers", "pointer-test", "focus-test", "delay-test", "scroll-test", "escape-test", "positioning-test", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tooltip", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/dom-query", "@zag-js/anatomy", "@zag-js/core", "@zag-js/utils", "react"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("@zag-js/tooltip"))).toBe(true);
    expect(report.riskQueue.some((item) => item.why.includes("RepoTutor records tooltip readiness only; it does not open real tooltips, wait real delays, calculate live popper placement, observe real scroll or pointerlock events, dispatch pointer/focus/keyboard events, mutate the global tooltip store, or run analyzed project tests."))).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "tooltip-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "tooltip-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "tooltip-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tooltip-readiness.md"), "utf8");
    expect(markdown).toContain("Tooltip Readiness");
    expect(markdown).toContain("@zag-js/tooltip");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "tooltip-readiness.html"), "utf8");
    expect(html).toContain("tooltip-readiness-card");
    expect(html).toContain("data-source-pattern=\"Tooltip\"");
    expect(html).toContain("RepoTutor records tooltip readiness only");
  });

  it("detects Zag tooltip machine readiness without opening real tooltips", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tooltip-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zag-tooltip-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "zag-tooltip-machine.tsx"), [
      "import * as tooltip from '@zag-js/tooltip';",
      "import { normalizeProps, useMachine } from '@zag-js/react';",
      "",
      "export function SaveTooltip() {",
      "  const service = useMachine(tooltip.machine, {",
      "    id: 'save-tooltip',",
      "    ids: { trigger: 'save-trigger', content: 'save-content', arrow: 'save-arrow', positioner: 'save-positioner' },",
      "    openDelay: 400,",
      "    closeDelay: 150,",
      "    closeOnEscape: true,",
      "    closeOnClick: true,",
      "    closeOnPointerDown: true,",
      "    closeOnScroll: true,",
      "    interactive: true,",
      "    disabled: false,",
      "    defaultOpen: false,",
      "    defaultTriggerValue: 'save',",
      "    triggerValue: 'save',",
      "    positioning: { placement: 'bottom' },",
      "    onOpenChange: console.info,",
      "    onTriggerValueChange: console.info",
      "  });",
      "  const api = tooltip.connect(service, normalizeProps);",
      "  api.open; api.triggerValue; api.setOpen(true); api.setTriggerValue('save'); api.reposition({ placement: 'top' });",
      "  const machineEvidence = 'createMachine<TooltipSchema> createGuards<TooltipSchema> initialState open closed props ensureProps id openDelay closeDelay closeOnEscape closeOnScroll interactive closeOnClick closeOnPointerDown positioning placement bottom effects trackFocusVisible trackStore context currentPlacement bindable hasPointerMoveOpened bindable triggerValue bindable defaultTriggerValue onTriggerValueChange watch disabled closeIfDisabled open toggleVisibility triggerValue repositionImmediate triggerValue.set states closed opening open closing noVisibleTooltip isVisible isInteractive hasPointerMoveOpened isOpenControlled';",
      "  const effectEvidence = 'trackFocusVisible trackStore trackScroll trackPointerlockChange trackPositioning trackEscapeKey waitForOpenDelay waitForCloseDelay getOverflowAncestors pointerlockchange addDomEvent keydown Escape isComposingEvent setTimeout after.openDelay after.closeDelay';",
      "  const actionEvidence = 'setGlobalId clearGlobalId invokeOnOpen invokeOnClose closeIfDisabled reposition repositionImmediate toggleVisibility setPointerMoveOpened clearPointerMoveOpened setTriggerValue immediateReopen store.update store.set queueMicrotask getPlacement';",
      "  const domEvidence = 'getTriggerId getContentId getArrowId getPositionerId getTriggerEl getContentEl getPositionerEl getArrowEl getTriggerEls getActiveTriggerEl queryAll isFunction';",
      "  const apiEvidence = 'open setOpen triggerValue setTriggerValue reposition getTriggerProps getArrowProps getArrowTipProps getPositionerProps getContentProps aria-describedby role tooltip data-state data-placement data-side pointerEvents data-ownedby data-value data-current dir-prop data-expanded close-on-click-guard focus-visible-guard related-trigger-guard left-click-guard close-on-pointerdown-guard touch-pointer-ignore pointer-over-handler pointer-cancel-handler arrow-style arrow-tip-style positioner-floating-style hidden-prop data-instant aria-label-role-guard content-id-aria-label-guard content-pointer-enter content-pointer-leave interactive-pointer-events default-prevented-guard disabled-guard store-current-id store-prev-id current-placement-side';",
      "  return <div data-evidence={`${machineEvidence} ${effectEvidence} ${actionEvidence} ${domEvidence} ${apiEvidence}`}>",
      "    <button {...api.getTriggerProps({ value: 'save' })}>Save</button>",
      "    <div {...api.getPositionerProps()}><div {...api.getContentProps()}><span {...api.getArrowProps()}><span {...api.getArrowTipProps()} /></span>Save tip</div></div>",
      "  </div>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@zag-js/tooltip": "latest",
        "@zag-js/react": "latest",
        "@zag-js/anatomy": "latest",
        "@zag-js/core": "latest",
        "@zag-js/dom-query": "latest",
        "@zag-js/focus-visible": "latest",
        "@zag-js/popper": "latest",
        "@zag-js/types": "latest",
        "@zag-js/utils": "latest",
        "react": "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tooltip-readiness-report.json"), "utf8")) as {
      machineSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      effectSignals: Array<{ signal: string; readiness: string }>;
      actionSignals: Array<{ signal: string; readiness: string }>;
      domSignals: Array<{ signal: string; readiness: string }>;
      apiSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.machineSignals)).toEqual(expect.arrayContaining(["create-machine", "create-guards", "initial-state", "default-props", "top-level-effects", "bindable-context", "watch-props", "global-events", "state-chart", "guard-logic"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["current-placement", "pointer-move-opened", "trigger-value"]));
    expect(readySignals(report.effectSignals)).toEqual(expect.arrayContaining(["track-focus-visible", "track-store", "track-scroll", "track-pointerlock-change", "track-positioning", "track-escape-key", "wait-open-delay", "wait-close-delay"]));
    expect(readySignals(report.actionSignals)).toEqual(expect.arrayContaining(["set-global-id", "clear-global-id", "invoke-on-open", "invoke-on-close", "close-if-disabled", "reposition", "reposition-immediate", "toggle-visibility", "set-pointer-move-opened", "clear-pointer-move-opened", "set-trigger-value", "immediate-reopen"]));
    expect(readySignals(report.domSignals)).toEqual(expect.arrayContaining(["trigger-id", "content-id", "arrow-id", "positioner-id", "trigger-el", "content-el", "positioner-el", "arrow-el", "trigger-els", "active-trigger-el"]));
    expect(readySignals(report.apiSignals)).toEqual(expect.arrayContaining(["open", "set-open", "trigger-value-api", "set-trigger-value", "reposition-api", "trigger-props", "arrow-props", "arrow-tip-props", "positioner-props", "content-props", "data-ownedby", "data-value", "data-current", "dir-prop", "data-expanded", "close-on-click-guard", "focus-visible-guard", "related-trigger-guard", "left-click-guard", "close-on-pointerdown-guard", "touch-pointer-ignore", "pointer-over-handler", "pointer-cancel-handler", "arrow-style", "arrow-tip-style", "positioner-floating-style", "hidden-prop", "data-instant", "aria-label-role-guard", "content-id-aria-label-guard", "content-pointer-enter", "content-pointer-leave", "interactive-pointer-events", "default-prevented-guard", "disabled-guard", "store-current-id", "store-prev-id", "current-placement-side"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@zag-js/tooltip", "@zag-js/react", "@zag-js/anatomy", "@zag-js/core", "@zag-js/dom-query", "@zag-js/focus-visible", "@zag-js/popper", "@zag-js/types", "@zag-js/utils", "react"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tooltip-readiness.md"), "utf8");
    expect(markdown).toContain("## Machine Signals");
    expect(markdown).toContain("## API Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "tooltip-readiness.html"), "utf8");
    expect(html).toContain("Machine Signals");
    expect(html).toContain("API Signals");
  });

  it("detects Lefthook job orchestration without installing hooks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-lefthook-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-lefthook-source-"));
    await fs.mkdir(path.join(sourceRoot, ".config"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "lefthook.yml"), [
      "extends:",
      "  - .config/shared-lefthook.yml",
      "remotes:",
      "  - git_url: git@example.com:team/hooks",
      "    ref: v1.2.3",
      "    configs:",
      "      - lefthook.yml",
      "output:",
      "  - summary",
      "  - failure",
      "pre-commit:",
      "  parallel: true",
      "  only:",
      "    - ref: feature/*",
      "  jobs:",
      "    - name: frontend group",
      "      root: web/",
      "      glob:",
      "        - \"*.ts\"",
      "      group:",
      "        piped: true",
      "        jobs:",
      "          - run: pnpm install --frozen-lockfile",
      "          - run: pnpm lint -- {staged_files}",
      "    - name: format staged",
      "      files: git diff --name-only --cached",
      "      tags:",
      "        - frontend",
      "        - style",
      "      run: pnpm format -- {files}",
      "      stage_fixed: true",
      "    - script: template_checker",
      "      runner: bash",
      "pre-push:",
      "  commands:",
      "    tests:",
      "      skip:",
      "        - merge",
      "        - rebase",
      "      run: pnpm test",
      "commit-msg:",
      "  scripts:",
      "    commitlint:",
      "      runner: node"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".config", "lefthook-local.yml"), [
      "pre-push:",
      "  exclude_tags:",
      "    - frontend",
      "  jobs:",
      "    - name: local skip",
      "      skip: true",
      "      run: echo local-only"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Hook workflow",
      "",
      "Run `lefthook install`, `lefthook run pre-commit`, `lefthook validate`, and `lefthook dump` in a trusted workspace.",
      "Use `LEFTHOOK=0 git commit` only for documented emergency bypasses."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        prepare: "lefthook install",
        lint: "eslint .",
        format: "prettier --write .",
        test: "vitest run"
      },
      devDependencies: {
        lefthook: "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "git-hooks-report.json"), "utf8")) as {
      sourcePattern: string;
      toolConfigFiles: Array<{ tool: string; filePath: string }>;
      lefthookSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = report.lefthookSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("Lefthook lefthook.yml jobs commands scripts parallel group piped glob files root tags skip only stage_fixed runner output extends remotes local config run validate dump");
    expect(report.toolConfigFiles.some((item) => item.tool === "lefthook" && item.filePath === "lefthook.yml")).toBe(true);
    expect(readySignals).toEqual(expect.arrayContaining([
      "config-file",
      "local-config",
      "parallel",
      "jobs",
      "commands",
      "scripts",
      "group",
      "piped",
      "glob-filter",
      "files-template",
      "root",
      "tags",
      "skip",
      "only",
      "stage-fixed",
      "runner",
      "output-control",
      "extends",
      "remotes",
      "run-command",
      "validate-command",
      "dump-command"
    ]));
    expect(report.recommendedCommands.some((item) => item.command === "lefthook validate")).toBe(true);
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "git-hooks.md"), "utf8");
    expect(markdown).toContain("## Lefthook Signals");
    expect(markdown).toContain("stage-fixed");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "git-hooks.html"), "utf8");
    expect(html).toContain("Lefthook Signals");
    expect(html).toContain("data-source-pattern=\"Husky Lefthook\"");
  });

  it("detects mise runtime tool, env, and task signals without running mise", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mise-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mise-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "mise-tasks"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "mise.toml"), [
      "min_version = \"2024.1.1\"",
      "",
      "[tools]",
      "node = \"24\"",
      "python = \"3.12\"",
      "ruby = \"3.3\"",
      "",
      "[env]",
      "NODE_ENV = \"development\"",
      "_.path = [\"./node_modules/.bin\"]",
      "_.file = \".env\"",
      "_.source = \"./scripts/env.sh\"",
      "",
      "[settings]",
      "experimental = true",
      "",
      "[tasks.build]",
      "description = \"Build app\"",
      "depends = [\"lint\"]",
      "run = \"pnpm build\"",
      "",
      "[tasks.lint]",
      "description = \"Lint app\"",
      "run = \"pnpm lint\"",
      "",
      "[task_config]",
      "includes = [\"mise-tasks\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".mise.production.toml"), [
      "[env]",
      "NODE_ENV = \"production\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".miserc.toml"), [
      "env = [\"development\"]",
      "ceiling_paths = [\"{{ env.HOME }}\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".tool-versions"), "node 24\npython 3.12\n");
    await fs.writeFile(path.join(sourceRoot, ".node-version"), "24\n");
    await fs.writeFile(path.join(sourceRoot, "mise.lock"), "[[tools]]\nname = \"node\"\nversion = \"24\"\n");
    await fs.writeFile(path.join(sourceRoot, "mise-tasks", "test"), [
      "#!/usr/bin/env bash",
      "#MISE description=\"Run tests\"",
      "pnpm test"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "ci.yml"), [
      "name: ci",
      "on: [push]",
      "jobs:",
      "  test:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - uses: jdx/mise-action@v3",
      "        with:",
      "          install: true",
      "      - run: mise install",
      "      - run: mise exec -- pnpm test"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Mise runtime",
      "",
      "Use `MISE_ENV=development mise config`, `mise doctor`, `mise trust`, `mise run build`, and `mise watch build` in a trusted workspace.",
      "The task runner receives MISE_PROJECT_ROOT and MISE_MONOREPO_ROOT for monorepo task context.",
      "direnv users can load it with `.envrc` and use_mise."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "runtime-environment-report.json"), "utf8")) as {
      sourcePattern: string;
      toolVersionSignals: Array<{ signal: string; readiness: string }>;
      environmentConfigSignals: Array<{ signal: string; readiness: string }>;
      taskRunnerSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("mise dev tools env vars tasks mise.toml .mise.toml .tool-versions idiomatic version files mise install exec run doctor trust config hierarchy environments task_config includes mise-action");
    expect(readySignals(report.toolVersionSignals)).toEqual(expect.arrayContaining(["mise-config", "mise-tools", "tool-versions", "idiomatic-version-file", "mise-lock", "mise-install-command", "mise-exec-command", "mise-action", "mise-doctor", "mise-trust"]));
    expect(readySignals(report.environmentConfigSignals)).toEqual(expect.arrayContaining(["env-section", "env-file-directive", "env-source-directive", "mise-env", "mise-env-config", "mise-config-hierarchy", "mise-settings", "mise-path", "direnv"]));
    expect(readySignals(report.taskRunnerSignals)).toEqual(expect.arrayContaining(["toml-task", "file-task", "task-depends", "task-description", "task-run-command", "task-config-includes", "mise-run-command", "mise-watch-command", "monorepo-task-context"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "runtime-environment.md"), "utf8");
    expect(markdown).toContain("## Tool Version Signals");
    expect(markdown).toContain("mise-install-command");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "runtime-environment.html"), "utf8");
    expect(html).toContain("Tool Version Signals");
    expect(html).toContain("data-source-pattern=\"docSmith mise\"");
  });

  it("detects Zod and Valibot schema validation signals without executing schemas", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-valibot-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-valibot-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "valibot-fixture",
      dependencies: {
        zod: "^4.1.0",
        valibot: "^1.1.0",
        "@valibot/to-json-schema": "^1.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "zod-v4.ts"), [
      "import * as z from 'zod/v4';",
      "import * as zm from 'zod/mini';",
      "",
      "const registry = z.registry<{ title: string }>();",
      "",
      "const IsoDateCodec = z.codec(z.iso.datetime(), z.date(), {",
      "  decode: (value) => new Date(value),",
      "  encode: (value) => value.toISOString()",
      "});",
      "",
      "const UserSchema = z.strictObject({",
      "  id: z.string({ error: 'id is required' }).uuid(),",
      "  name: z.string().min(1),",
      "  email: z.email(),",
      "  createdAt: IsoDateCodec",
      "})",
      "  .catchall(z.unknown())",
      "  .register(registry, { title: 'User' })",
      "  .meta({ id: 'User', title: 'User schema' })",
      "  .describe('User schema')",
      "  .readonly();",
      "",
      "const EnvSchema = z.looseObject({",
      "  FEATURE_ENABLED: z.stringbool(),",
      "  PORT: z.string().prefault('3000').pipe(z.coerce.number()),",
      "  ROUTE: z.templateLiteral(['/api/', z.string()])",
      "});",
      "",
      "const MiniSchema = zm.object({ id: zm.string() });",
      "z.globalRegistry.add(UserSchema, { id: 'UserSchema', title: 'User schema' });",
      "",
      "export type User = z.infer<typeof UserSchema>;",
      "export type UserInput = z.input<typeof UserSchema>;",
      "export type UserOutput = z.output<typeof UserSchema>;",
      "",
      "export function readUser(input: unknown) {",
      "  const envResult = EnvSchema.safeParse(input);",
      "  if (!envResult.success) {",
      "    return { tree: z.treeifyError(envResult.error), flat: z.flattenError(envResult.error), pretty: z.prettifyError(envResult.error) };",
      "  }",
      "  const parsed = UserSchema.parse(input);",
      "  const decoded = z.decode(IsoDateCodec, '2026-06-08T00:00:00.000Z');",
      "  const encoded = z.encode(IsoDateCodec, decoded);",
      "  return { parsed, encoded, json: z.toJSONSchema(UserSchema, { registry, io: 'output', cycles: 'ref', reused: 'ref' }), mini: MiniSchema };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "schemas.ts"), [
      "import * as v from 'valibot';",
      "import { toJsonSchema } from '@valibot/to-json-schema';",
      "",
      "export const LoginSchema = v.object({",
      "  email: v.pipe(v.string(), v.email(), v.minLength(3)),",
      "  role: v.picklist(['admin', 'learner']),",
      "  kind: v.literal('login')",
      "});",
      "",
      "export const MessageSchema = v.variant('type', [",
      "  v.object({ type: v.literal('email'), email: v.pipe(v.string(), v.email()) }),",
      "  v.object({ type: v.literal('sms'), phone: v.pipe(v.string(), v.minLength(10)) })",
      "]);",
      "",
      "export type LoginInput = v.InferInput<typeof LoginSchema>;",
      "export type LoginOutput = v.InferOutput<typeof LoginSchema>;",
      "export type LoginIssue = v.InferIssue<typeof LoginSchema>;",
      "",
      "const parseLogin = v.parser(LoginSchema);",
      "const safeParseLogin = v.safeParser(LoginSchema);",
      "",
      "export function readLogin(input: unknown) {",
      "  const strictLogin = v.pipe(",
      "    LoginSchema,",
      "    v.forward(v.partialCheck([['email']], (value) => value.email.endsWith('@example.com'), 'Use the learning domain'), ['email']),",
      "    v.rawCheck(({ dataset, addIssue }) => {",
      "      if (dataset.typed && dataset.value.role === 'admin') addIssue({ message: 'admin requires review' });",
      "    }),",
      "    v.metadata({ title: 'Login schema' })",
      "  );",
      "  const result = v.safeParse(strictLogin, input);",
      "  const parsed = v.parse(LoginSchema, input);",
      "  const output = parseLogin(input);",
      "  const safeOutput = safeParseLogin(input);",
      "  if (!result.success) return v.flatten(result.issues);",
      "  return { parsed, output, safeOutput, json: toJsonSchema(strictLogin) };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Schema validation",
      "",
      "This project migrated with zod-to-valibot and keeps Standard Schema compatibility notes for contracts."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "schema-validation-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      schemaSetups: Array<{ provider: string; readiness: string }>;
      zodSignals: Array<{ signal: string; readiness: string }>;
      valibotSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      typeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("zod/v4 zod/mini globalRegistry register meta describe codec decode encode prefault readonly templateLiteral stringbool");
    expect(report.sourcePattern).toContain("Valibot v.object v.pipe v.variant v.picklist parse safeParse parser safeParser InferInput InferOutput InferIssue ValiError issues flatten forward partialCheck rawCheck metadata @valibot/to-json-schema zod-to-valibot Standard Schema");
    expect(report.schemaSetups.some((item) => item.provider === "zod" && item.readiness === "ready")).toBe(true);
    expect(report.schemaSetups.some((item) => item.provider === "valibot" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.zodSignals)).toEqual(expect.arrayContaining(["zod-v4-import", "zod-mini-import", "strict-object", "loose-object", "catchall", "template-literal", "stringbool", "codec", "decode", "encode", "prefault", "readonly", "registry", "global-registry", "meta", "describe", "native-json-schema", "json-schema-io", "json-schema-registry", "error-param", "treeify-error", "flatten-error", "prettify-error", "pipe"]));
    expect(readySignals(report.valibotSignals)).toEqual(expect.arrayContaining(["v-object", "v-pipe", "v-variant", "v-picklist", "v-parser", "v-safe-parser", "v-infer-output", "v-issues", "v-flatten", "v-forward", "v-partial-check", "v-raw-check", "v-metadata", "v-json-schema", "zod-codemod", "standard-schema"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["zod", "valibot", "@valibot/to-json-schema"]));
    expect(readySignals(report.typeSignals)).toEqual(expect.arrayContaining(["infer", "input-output", "standard-schema", "json-schema"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["issues", "flatten", "treeify", "prettify", "custom-error-map"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "schema-validation-readiness.md"), "utf8");
    expect(markdown).toContain("## Zod Signals");
    expect(markdown).toContain("zod-mini-import");
    expect(markdown).toContain("## Valibot Signals");
    expect(markdown).toContain("v-partial-check");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "schema-validation-readiness.html"), "utf8");
    expect(html).toContain("Zod Signals");
    expect(html).toContain("Valibot Signals");
    expect(html).toContain("data-source-pattern=\"Zod Valibot\"");
  });

  it("detects Express server framework signals without executing route handlers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-express-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-express-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "express-fixture",
      dependencies: {
        "cookie-parser": "^1.4.7",
        express: "^5.2.1"
      },
      devDependencies: {
        mocha: "^11.7.5",
        supertest: "^6.3.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "app.js"), [
      "const express = require('express');",
      "const cookieParser = require('cookie-parser');",
      "",
      "const app = express();",
      "const router = express.Router({ mergeParams: true });",
      "const admin = express();",
      "",
      "app.set('trust proxy', true);",
      "app.set('views', './views');",
      "app.set('view engine', 'html');",
      "app.engine('html', (filePath, options, callback) => callback(null, '<main></main>'));",
      "app.locals.title = 'RepoTutor Express';",
      "",
      "app.use(express.json({ limit: '1mb' }));",
      "app.use(express.urlencoded({ extended: true }));",
      "app.use(express.raw({ type: 'application/octet-stream' }));",
      "app.use(express.text());",
      "app.use(cookieParser());",
      "app.use('/static', express.static('public'));",
      "app.use((req, res, next) => {",
      "  res.locals.requestId = req.get('x-request-id');",
      "  next();",
      "});",
      "",
      "app.param('userId', (req, res, next, userId) => {",
      "  req.userId = userId;",
      "  next();",
      "});",
      "router.param('fileName', (req, res, next, fileName) => next());",
      "",
      "router.get('/users/:userId', (req, res) => {",
      "  const id = req.params.userId;",
      "  const tab = req.query.tab;",
      "  const body = req.body;",
      "  const cookie = req.cookies.session;",
      "  const header = req.headers.authorization || req.get('authorization');",
      "  const acceptsJson = req.accepts('json');",
      "  res.status(200).json({ id, tab, body, cookie, header, acceptsJson });",
      "});",
      "",
      "router.route('/files/:fileName')",
      "  .get((req, res) => res.sendFile(req.params.fileName, { root: process.cwd() }))",
      "  .post((req, res) => res.download(req.params.fileName, 'download.txt'));",
      "",
      "router.all('/wildcard', (req, res) => res.jsonp({ ok: true }));",
      "app.get('/', (req, res) => res.send('hello'));",
      "app.post('/submit', (req, res) => res.cookie('session', 'abc').redirect('/done'));",
      "app.put('/items/:id', (req, res) => res.sendStatus(204));",
      "app.patch('/items/:id', (req, res) => res.status(200).send({ patched: true }));",
      "app.delete('/items/:id', (req, res) => res.clearCookie('session').send('deleted'));",
      "app.all('/all', (req, res) => res.send('all'));",
      "app.route('/chain').get((req, res) => res.render('chain')).post((req, res) => res.send('posted'));",
      "",
      "app.use('/api', router);",
      "admin.get('/dashboard', (req, res) => res.send('admin'));",
      "app.use('/admin', admin);",
      "const mountedAt = admin.mountpath || app.mountpath;",
      "",
      "app.use('/skip', (req, res, next) => next('route'));",
      "app.use((req, res) => res.sendStatus(404));",
      "app.use((err, req, res, next) => {",
      "  res.status(500).render('error', { error: err.message, mountedAt });",
      "});",
      "",
      "app.listen(3000);",
      "module.exports = app;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "app.test.js"), [
      "const request = require('supertest');",
      "const app = require('../src/app');",
      "",
      "describe('express fixture', function () {",
      "  it('responds to the root route', function (done) {",
      "    request(app).get('/').expect(200, done);",
      "  });",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      expressSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("express express.Router app.use error middleware app.param express.static express.json express.urlencoded res.send res.json res.render res.redirect req.params req.query req.body supertest mocha");
    expect(report.serverSetups.some((item) => item.framework === "express" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "put", "patch", "delete", "route", "all", "params", "prefix"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port", "trust-proxy", "body-limit"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "set-not-found-handler", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["supertest"]));
    expect(readySignals(report.expressSignals)).toEqual(expect.arrayContaining([
      "app-instance",
      "router-instance",
      "router-mount",
      "route-shorthand",
      "route-object",
      "all-route",
      "middleware-use",
      "error-middleware",
      "param-middleware",
      "static-middleware",
      "json-parser",
      "urlencoded-parser",
      "raw-parser",
      "text-parser",
      "route-params",
      "request-query",
      "request-body",
      "request-cookies",
      "request-headers",
      "request-accepts",
      "response-send",
      "response-json",
      "response-jsonp",
      "response-status",
      "response-send-status",
      "response-render",
      "response-redirect",
      "response-send-file",
      "response-download",
      "response-cookie",
      "response-locals",
      "app-locals",
      "app-settings",
      "view-engine",
      "template-engine",
      "trust-proxy",
      "sub-app-mount",
      "mountpath",
      "next-route",
      "listen",
      "supertest",
      "mocha"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["express"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Express Signals");
    expect(markdown).toContain("express.Router");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Express Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Koa server framework signals without executing middleware", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-koa-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-koa-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "koa-fixture",
      dependencies: {
        koa: "^3.2.1",
        "koa-compose": "^4.1.0"
      },
      devDependencies: {
        supertest: "^7.1.1"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "app.js"), [
      "const Koa = require('koa');",
      "const compose = require('koa-compose');",
      "const { PassThrough } = require('node:stream');",
      "",
      "const app = new Koa({",
      "  proxy: true,",
      "  proxyIpHeader: 'X-Real-IP',",
      "  subdomainOffset: 3,",
      "  asyncLocalStorage: true,",
      "  keys: ['keyboard cat']",
      "});",
      "",
      "app.keys = ['keyboard cat', 'next key'];",
      "app.proxy = true;",
      "app.subdomainOffset = 3;",
      "app.context.db = { find: async () => ({ ok: true }) };",
      "",
      "const timing = async (ctx, next) => {",
      "  ctx.state.startedAt = Date.now();",
      "  ctx.set('X-Start', '1');",
      "  await next();",
      "  ctx.status = ctx.status || 200;",
      "};",
      "",
      "const guard = async (ctx, next) => {",
      "  ctx.assert(ctx.request.accepts('json'), 406, 'json required');",
      "  if (ctx.query.fail) ctx.throw(400, 'bad request');",
      "  await next();",
      "};",
      "",
      "const stream = async (ctx, next) => {",
      "  if (ctx.path === '/stream') {",
      "    ctx.response.type = 'text/plain';",
      "    ctx.body = new PassThrough();",
      "    ctx.respond = false;",
      "    return;",
      "  }",
      "  await next();",
      "};",
      "",
      "const responder = async ctx => {",
      "  const body = ctx.request.json ? await ctx.request.json() : null;",
      "  const query = ctx.query;",
      "  ctx.cookies.set('sid', '123', { signed: true });",
      "  const sid = ctx.cookies.get('sid');",
      "  const accept = ctx.get('accept');",
      "  if (query.redirect) ctx.redirect('/next');",
      "  ctx.type = 'application/json';",
      "  ctx.body = { body, query, sid, accept, db: await ctx.db.find() };",
      "};",
      "",
      "const all = compose([timing, guard, stream, responder]);",
      "app.use(all);",
      "app.use(async (ctx, next) => {",
      "  await next();",
      "  ctx.response.body = ctx.body;",
      "});",
      "app.on('error', (err, ctx) => {",
      "  ctx.app.emit('observed-error', err);",
      "});",
      "app.emit('error', new Error('observed'));",
      "",
      "const handler = app.callback();",
      "app.listen(3000);",
      "module.exports = app;",
      "module.exports.handler = handler;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "app.test.js"), [
      "const test = require('node:test');",
      "const request = require('supertest');",
      "const app = require('../src/app');",
      "",
      "test('koa callback responds', async () => {",
      "  await request(app.callback()).get('/').set('Accept', 'application/json').expect(200);",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      koaSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("new Koa app.use async ctx await next koa-compose app.callback app.on error ctx.body ctx.status ctx.throw ctx.assert ctx.state ctx.cookies ctx.redirect app.context app.keys app.proxy asyncLocalStorage node:test");
    expect(report.serverSetups.some((item) => item.framework === "koa" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["supertest"]));
    expect(readySignals(report.koaSignals)).toEqual(expect.arrayContaining([
      "app-instance",
      "middleware-use",
      "async-middleware",
      "await-next",
      "compose",
      "callback",
      "listen",
      "error-listener",
      "context-state",
      "context-body",
      "context-status",
      "context-throw",
      "context-assert",
      "context-cookies",
      "context-set",
      "context-get",
      "context-redirect",
      "request-object",
      "response-object",
      "request-accepts",
      "request-query",
      "request-body-json",
      "response-type",
      "response-stream",
      "app-context",
      "app-keys",
      "app-proxy",
      "proxy-ip-header",
      "subdomain-offset",
      "async-local-storage",
      "ctx-respond-false",
      "supertest",
      "node-test"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["koa"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Koa Signals");
    expect(markdown).toContain("koa-compose");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Koa Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects NestJS server framework signals without executing decorators or bootstrap", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-nestjs-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-nestjs-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "nestjs-fixture",
      dependencies: {
        "@nestjs/common": "^11.1.10",
        "@nestjs/core": "^11.1.10",
        "@nestjs/graphql": "^13.4.2",
        "@nestjs/microservices": "^11.1.10",
        "@nestjs/mongoose": "^11.0.4",
        "@nestjs/platform-express": "^11.1.10",
        "@nestjs/platform-fastify": "^11.1.10",
        "@nestjs/typeorm": "^11.0.1",
        "class-validator": "^0.15.1",
        "reflect-metadata": "^0.2.2",
        rxjs: "^7.8.2"
      },
      devDependencies: {
        "@nestjs/testing": "^11.1.10",
        supertest: "^7.1.1"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "app.ts"), [
      "import 'reflect-metadata';",
      "import { Body, CanActivate, Catch, Controller, ExceptionFilter, ExecutionContext, Get, Headers, HttpCode, HttpException, Inject, Injectable, MiddlewareConsumer, Module, NestInterceptor, OnApplicationShutdown, OnModuleInit, Param, PipeTransform, Post, Query, Req, UseFilters, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';",
      "import { NestFactory } from '@nestjs/core';",
      "import { ClientProxy, MessagePattern, MicroserviceOptions, Transport } from '@nestjs/microservices';",
      "import { NestExpressApplication } from '@nestjs/platform-express';",
      "import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';",
      "import { WebSocketGateway, SubscribeMessage, MessageBody, WsResponse } from '@nestjs/websockets';",
      "import { GraphQLModule, Resolver, Query as GqlQuery, Mutation } from '@nestjs/graphql';",
      "import { ConfigModule } from '@nestjs/config';",
      "import { TypeOrmModule } from '@nestjs/typeorm';",
      "import { MongooseModule } from '@nestjs/mongoose';",
      "",
      "class CreateCatDto { name!: string; }",
      "class Photo {}",
      "class CatSchema {}",
      "class LoggerMiddleware {}",
      "",
      "@Injectable()",
      "class AuthGuard implements CanActivate {",
      "  canActivate(context: ExecutionContext) { return true; }",
      "}",
      "",
      "@Injectable()",
      "class ParseCatPipe implements PipeTransform {",
      "  transform(value: unknown) { return value; }",
      "}",
      "",
      "@Injectable()",
      "class LoggingInterceptor implements NestInterceptor {",
      "  intercept(context: ExecutionContext, next: any) { return next.handle(); }",
      "}",
      "",
      "@Catch(HttpException)",
      "class HttpExceptionFilter implements ExceptionFilter {",
      "  catch(exception: HttpException) { return exception.getStatus(); }",
      "}",
      "",
      "@Injectable()",
      "class CatsService implements OnModuleInit, OnApplicationShutdown {",
      "  constructor(@Inject('CAT_REPOSITORY') private readonly repo: unknown, @Inject('MESSAGE_CLIENT') private readonly client: ClientProxy) {}",
      "  onModuleInit() { return this.repo; }",
      "  onApplicationShutdown() { return this.client; }",
      "  find(id: string) { return { id }; }",
      "}",
      "",
      "@Controller('cats')",
      "@UseGuards(AuthGuard)",
      "@UsePipes(new ValidationPipe(), new ParseCatPipe())",
      "@UseInterceptors(LoggingInterceptor)",
      "@UseFilters(HttpExceptionFilter)",
      "class CatsController {",
      "  constructor(private readonly service: CatsService) {}",
      "  @Get(':id')",
      "  findOne(@Param('id') id: string, @Query('tab') tab: string, @Headers('trace') trace: string, @Req() req: unknown) {",
      "    return this.service.find(id);",
      "  }",
      "  @Post()",
      "  @HttpCode(201)",
      "  create(@Body() dto: CreateCatDto) {",
      "    if (!dto.name) throw new HttpException('missing name', 400);",
      "    return dto;",
      "  }",
      "}",
      "",
      "@WebSocketGateway({ namespace: 'events' })",
      "class EventsGateway {",
      "  @SubscribeMessage('identity')",
      "  identity(@MessageBody() data: string): WsResponse<string> {",
      "    return { event: 'identity', data };",
      "  }",
      "}",
      "",
      "@Resolver('Cat')",
      "class CatsResolver {",
      "  @GqlQuery('cats')",
      "  findAll() { return []; }",
      "  @Mutation('createCat')",
      "  createCat(@Body() dto: CreateCatDto) { return dto; }",
      "}",
      "",
      "@Controller()",
      "class WorkerController {",
      "  @MessagePattern({ cmd: 'sum' })",
      "  sum(data: number[]) { return data.reduce((total, item) => total + item, 0); }",
      "}",
      "",
      "@Module({",
      "  imports: [",
      "    ConfigModule.forRoot(),",
      "    TypeOrmModule.forFeature([Photo]),",
      "    MongooseModule.forFeature([{ name: 'Cat', schema: CatSchema }]),",
      "    GraphQLModule.forRoot({ autoSchemaFile: true })",
      "  ],",
      "  controllers: [CatsController, WorkerController],",
      "  providers: [",
      "    CatsService,",
      "    AuthGuard,",
      "    ParseCatPipe,",
      "    LoggingInterceptor,",
      "    HttpExceptionFilter,",
      "    EventsGateway,",
      "    CatsResolver,",
      "    { provide: 'CAT_REPOSITORY', useValue: {} },",
      "    { provide: 'MESSAGE_CLIENT', useFactory: () => ({ emit: () => undefined }) }",
      "  ],",
      "  exports: [CatsService]",
      "})",
      "class AppModule {",
      "  configure(consumer: MiddlewareConsumer) {",
      "    consumer.apply(LoggerMiddleware).forRoutes('cats');",
      "  }",
      "}",
      "",
      "async function bootstrap() {",
      "  const app = await NestFactory.create<NestExpressApplication>(AppModule, { logger: ['error', 'warn'] });",
      "  const fastifyApp = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());",
      "  const microservice = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, { transport: Transport.TCP });",
      "  app.setGlobalPrefix('api');",
      "  app.enableCors({ origin: true });",
      "  app.useGlobalPipes(new ValidationPipe({ transform: true }));",
      "  app.useGlobalGuards(new AuthGuard());",
      "  app.useGlobalInterceptors(new LoggingInterceptor());",
      "  app.useGlobalFilters(new HttpExceptionFilter());",
      "  app.connectMicroservice({ transport: Transport.TCP });",
      "  await app.startAllMicroservices();",
      "  await app.listen(process.env.PORT ?? 3000);",
      "  await fastifyApp.listen(3001);",
      "  return microservice;",
      "}",
      "bootstrap();",
      "export { AppModule, CatsController, CatsService };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "app.e2e-spec.ts"), [
      "import { Test, TestingModule } from '@nestjs/testing';",
      "import request from 'supertest';",
      "import { AppModule } from '../src/app';",
      "",
      "describe('CatsController e2e', () => {",
      "  it('reads cats through Nest testing module', async () => {",
      "    const moduleFixture: TestingModule = await Test.createTestingModule({ imports: [AppModule] }).compile();",
      "    const app = moduleFixture.createNestApplication();",
      "    await app.init();",
      "    await request(app.getHttpServer()).get('/api/cats/1').expect(200);",
      "  });",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      nestjsSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("NestFactory @Module @Controller @Get @Post @Injectable @Inject @Body @Param @Query @Headers @UseGuards @UsePipes @UseInterceptors @UseFilters ValidationPipe ExceptionFilter CanActivate PipeTransform NestInterceptor TestingModule createTestingModule enableCors setGlobalPrefix NestExpressApplication NestFastifyApplication WebSocketGateway @Resolver @MessagePattern ClientProxy ConfigModule TypeOrmModule MongooseModule GraphQLModule");
    expect(report.serverSetups.some((item) => item.framework === "nestjs" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["encapsulation"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "port", "logger"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "framework-errors", "validation-error", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["supertest", "vitest"]));
    expect(readySignals(report.nestjsSignals)).toEqual(expect.arrayContaining([
      "app-factory",
      "module-decorator",
      "controller-decorator",
      "method-decorators",
      "route-params",
      "request-body",
      "request-query",
      "request-headers",
      "injectable-provider",
      "injection-token",
      "provider-registration",
      "module-imports",
      "module-exports",
      "middleware-consumer",
      "guard",
      "pipe",
      "interceptor",
      "exception-filter",
      "global-prefix",
      "enable-cors",
      "global-pipes",
      "global-guards",
      "global-interceptors",
      "global-filters",
      "validation-pipe",
      "platform-express",
      "platform-fastify",
      "microservice",
      "websocket-gateway",
      "graphql-resolver",
      "testing-module",
      "e2e-supertest",
      "lifecycle-hooks",
      "config-module",
      "orm-module"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@nestjs/core"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## NestJS Signals");
    expect(markdown).toContain("NestJS module decorator");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("NestJS Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });

  it("detects Fastify server framework signals without executing route handlers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-fastify-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-fastify-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "fastify-fixture",
      dependencies: {
        "@fastify/autoload": "^6.0.0",
        "@fastify/ajv-compiler": "^4.0.0",
        "@fastify/fast-json-stringify-compiler": "^5.0.0",
        fastify: "^5.0.0",
        "fastify-plugin": "^5.0.0"
      },
      devDependencies: {
        tap: "^21.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "server.ts"), [
      "import fastify, { type FastifyInstance, type FastifyPluginAsync, type FastifyPluginCallback, type FastifyReply, type FastifyRequest } from 'fastify';",
      "import autoload from '@fastify/autoload';",
      "import AjvCompiler from '@fastify/ajv-compiler';",
      "import SerializerCompiler from '@fastify/fast-json-stringify-compiler';",
      "import fp from 'fastify-plugin';",
      "",
      "const app: FastifyInstance = fastify({",
      "  logger: true,",
      "  trustProxy: true,",
      "  bodyLimit: 1048576,",
      "  http2: true,",
      "  childLoggerFactory: (logger, context) => logger.child(context),",
      "  schemaController: {",
      "    compilersFactory: {",
      "      buildValidator: AjvCompiler(),",
      "      buildSerializer: SerializerCompiler()",
      "    }",
      "  }",
      "}).withTypeProvider<{ output: unknown; input: unknown }>();",
      "",
      "app.addSchema({ $id: 'user', type: 'object', properties: { id: { type: 'string' } } });",
      "app.setValidatorCompiler(({ schema }) => (data) => true);",
      "app.setSerializerCompiler(({ schema, method, url, httpStatus }) => (data) => JSON.stringify(data));",
      "app.addContentTypeParser('application/custom', (request, payload, done) => done(null, payload));",
      "app.decorate('services', { users: [] });",
      "app.decorateRequest('user', null);",
      "app.decorateReply('traceId', '');",
      "app.hasDecorator('services');",
      "app.hasRequestDecorator('user');",
      "app.hasReplyDecorator('traceId');",
      "",
      "app.addHook('onRequest', async (request, reply) => { request.log.info('start'); });",
      "app.addHook('preParsing', async (request, reply, payload) => payload);",
      "app.addHook('preValidation', async (request, reply) => undefined);",
      "app.addHook('preHandler', async (request, reply) => undefined);",
      "app.addHook('preSerialization', async (request, reply, payload) => payload);",
      "app.addHook('onSend', async (request, reply, payload) => payload);",
      "app.addHook('onResponse', async (request, reply) => undefined);",
      "app.addHook('onError', async (request, reply, error) => undefined);",
      "app.addHook('onRoute', (routeOptions) => { app.log.info(routeOptions.url); });",
      "app.addHook('onReady', async () => undefined);",
      "app.addHook('onListen', async () => undefined);",
      "app.addHook('onClose', async () => undefined);",
      "",
      "app.setErrorHandler((error, request, reply) => reply.code(500).send({ error: error.message }));",
      "app.setNotFoundHandler((request, reply) => reply.code(404).send({ missing: request.url }));",
      "",
      "const callbackPlugin: FastifyPluginCallback = fp((instance, opts, done) => {",
      "  instance.get('/plugin', { schema: { response: { 200: { type: 'object' } } } }, async (request, reply) => reply.code(200).send({ ok: true }));",
      "  done();",
      "}, { name: 'callbackPlugin' });",
      "",
      "const asyncPlugin: FastifyPluginAsync = async (instance) => {",
      "  instance.post('/async/:id', {",
      "    schema: {",
      "      body: { type: 'object', properties: { name: { type: 'string' } } },",
      "      params: { type: 'object', properties: { id: { type: 'string' } } },",
      "      querystring: { type: 'object', properties: { verbose: { type: 'boolean' } } },",
      "      headers: { type: 'object', properties: { trace: { type: 'string' } } },",
      "      response: { 201: { type: 'object' } }",
      "    },",
      "    preValidation: async (request, reply) => undefined,",
      "    preHandler: async (request, reply) => undefined",
      "  }, async (request: FastifyRequest, reply: FastifyReply) => {",
      "    const params = request.params;",
      "    const body = request.body;",
      "    const query = request.query;",
      "    return reply.code(201).send({ params, body, query });",
      "  });",
      "};",
      "",
      "app.register(autoload, { dir: 'routes' });",
      "app.register(callbackPlugin, { prefix: '/v1' });",
      "app.register(asyncPlugin, { prefix: '/api' });",
      "app.route({ method: 'GET', url: '/health', schema: { response: { 200: { type: 'object' } } }, handler: async (request, reply) => reply.code(200).send({ ok: true }) });",
      "app.get('/users/:id', { schema: { params: { type: 'object' }, querystring: { type: 'object' }, response: { 200: { type: 'object' } } } }, async (request, reply) => reply.send({ id: request.params, query: request.query }));",
      "app.listen({ port: 3000, host: '0.0.0.0' });",
      "app.inject({ method: 'GET', url: '/health' });",
      "export default app;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "server.test.ts"), [
      "import { test } from 'tap';",
      "import app from '../src/server';",
      "",
      "test('health route', async (t) => {",
      "  const response = await app.inject({ method: 'GET', url: '/health' });",
      "  t.equal(response.statusCode, 200);",
      "});"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "server-framework-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      serverSetups: Array<{ framework: string; readiness: string }>;
      routeSignals: Array<{ signal: string; readiness: string }>;
      schemaSignals: Array<{ signal: string; readiness: string }>;
      pluginSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      errorSignals: Array<{ signal: string; readiness: string }>;
      testSignals: Array<{ signal: string; readiness: string }>;
      fastifySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("withTypeProvider FastifyInstance FastifyPluginCallback FastifyPluginAsync addContentTypeParser childLoggerFactory");
    expect(report.serverSetups.some((item) => item.framework === "fastify" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.routeSignals)).toEqual(expect.arrayContaining(["get", "post", "route", "params", "prefix"]));
    expect(readySignals(report.schemaSignals)).toEqual(expect.arrayContaining(["body", "querystring", "params", "headers", "response", "add-schema", "validator-compiler", "serializer-compiler"]));
    expect(readySignals(report.pluginSignals)).toEqual(expect.arrayContaining(["register", "fastify-plugin", "autoload", "encapsulation"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["on-request", "pre-parsing", "pre-validation", "pre-handler", "pre-serialization", "on-send", "on-response", "on-error", "on-close"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["listen", "host", "port", "logger", "trust-proxy", "body-limit", "content-type-parser"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["set-error-handler", "set-not-found-handler", "reply-code"]));
    expect(readySignals(report.testSignals)).toEqual(expect.arrayContaining(["inject", "tap"]));
    expect(readySignals(report.fastifySignals)).toEqual(expect.arrayContaining([
      "app-instance",
      "route-shorthand",
      "route-object",
      "route-options-schema",
      "route-prefix",
      "register-plugin",
      "fastify-plugin",
      "autoload",
      "encapsulation",
      "decorate",
      "decorate-request",
      "decorate-reply",
      "has-decorator",
      "add-hook",
      "on-route-hook",
      "on-ready-hook",
      "on-listen-hook",
      "on-close-hook",
      "set-error-handler",
      "set-not-found-handler",
      "add-schema",
      "validator-compiler",
      "serializer-compiler",
      "schema-controller",
      "type-provider",
      "fastify-instance-type",
      "fastify-plugin-callback-type",
      "fastify-plugin-async-type",
      "fastify-request-type",
      "fastify-reply-type",
      "listen",
      "inject",
      "logger",
      "child-logger-factory",
      "trust-proxy",
      "body-limit",
      "content-type-parser",
      "reply-send",
      "reply-code",
      "request-params",
      "request-body",
      "request-query",
      "http2",
      "ajv"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["fastify", "@fastify/autoload", "fastify-plugin"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "server-framework-readiness.md"), "utf8");
    expect(markdown).toContain("## Fastify Signals");
    expect(markdown).toContain("withTypeProvider");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "server-framework-readiness.html"), "utf8");
    expect(html).toContain("Fastify Signals");
    expect(html).toContain("data-source-pattern=\"Fastify Express Koa NestJS Hono Hapi Elysia AdonisJS Sails Meteor Rails Django Laravel Spring Boot ASP.NET Core Flask Symfony Gin Echo Fiber Chi Gorilla Mux\"");
  });
});
