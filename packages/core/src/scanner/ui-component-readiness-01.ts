import path from "node:path";
import type { CalendarReadinessReport, DataTableReadinessReport, DialogReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDataTableReadinessReport(walk: WalkResult): Promise<DataTableReadinessReport> {
  const sourceFiles = await dataTableReadinessSourceFiles(walk);
  const dataTableSetups = dataTableReadinessSetups(sourceFiles);
  const frameworkSignals = dataTableReadinessFrameworkSignals(sourceFiles);
  const columnSignals = dataTableReadinessColumnSignals(sourceFiles);
  const rowModelSignals = dataTableReadinessRowModelSignals(sourceFiles);
  const interactionSignals = dataTableReadinessInteractionSignals(sourceFiles);
  const stateSignals = dataTableReadinessStateSignals(sourceFiles);
  const virtualizationSignals = dataTableReadinessVirtualizationSignals(sourceFiles);
  const editingSignals = dataTableReadinessEditingSignals(sourceFiles);
  const accessibilitySignals = dataTableReadinessAccessibilitySignals(sourceFiles);
  const testSignals = dataTableReadinessTestSignals(sourceFiles);
  const packageSignals = dataTableReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasColumns = columnSignals.some((item) => item.readiness === "ready") || dataTableSetups.some((item) => item.columnCount > 0);
  const hasRows = rowModelSignals.some((item) => item.readiness === "ready") || dataTableSetups.some((item) => item.rowCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || dataTableSetups.some((item) => item.sortCount + item.filterCount + item.paginationCount + item.selectionCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || dataTableSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || dataTableSetups.some((item) => item.testCount > 0);

  const riskQueue: DataTableReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasColumns) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a data table boundary such as TanStack Table, AG Grid, React Data Grid, or a custom grid adapter.",
      why: "Data table readiness starts with explicit table/grid framework, column definition, or row model evidence.",
      relatedHref: "html/data-table-readiness.html"
    });
  }
  if ((hasFramework || hasColumns) && !hasRows) {
    riskQueue.push({
      priority: "high",
      action: "Pair column definitions with row data, row model, row key, or server-side row loading evidence.",
      why: "A table column contract without row model evidence does not show how records are rendered or updated.",
      relatedHref: "html/data-table-readiness.html"
    });
  }
  if ((hasColumns || hasRows) && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Document sorting, filtering, pagination, selection, expansion, or faceting behavior.",
      why: "Learners need to inspect how large tabular data is searched, sorted, paged, and selected.",
      relatedHref: "html/data-table-readiness.html"
    });
  }
  if ((hasFramework || hasColumns) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add grid/table roles, row/column indices, aria-sort, and keyboard-navigation evidence.",
      why: "Data grids are keyboard-heavy, high-density controls and can regress accessibility without explicit ARIA contracts.",
      relatedHref: "html/data-table-readiness.html"
    });
  }
  if ((hasFramework || hasColumns) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for sorting, filtering, pagination, row selection, editing, virtualization, and grid roles.",
      why: "Data table regressions commonly appear in state transitions, row identity, keyboard focus, and virtualized rendering.",
      relatedHref: "html/data-table-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live data table behavior in a trusted browser or original project tests outside RepoTutor.",
    why: "RepoTutor records data table readiness only; it does not mount grids, measure DOM geometry, virtualize rows, sort/filter data, mutate row state, edit cells, dispatch keyboard events, fetch server-side rows, or run analyzed project tests.",
    relatedHref: "html/data-table-readiness.html"
  });

  return {
    summary: `TanStack Table/AG Grid/React Data Grid-style data table readiness report: setup ${dataTableSetups.length}개, framework signal ${frameworkSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data table readiness TanStack Table AG Grid React Data Grid columns rows sorting filtering pagination virtualization selection editing accessibility tests",
    dataTableSetups,
    frameworkSignals,
    columnSignals,
    rowModelSignals,
    interactionSignals,
    stateSignals,
    virtualizationSignals,
    editingSignals,
    accessibilitySignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@tanstack/react-table|useReactTable|ColumnDef|getCoreRowModel|getSortedRowModel|getFilteredRowModel|getPaginationRowModel|flexRender\" src app packages test", purpose: "Find TanStack Table setup, column definitions, row models, renderers, and controlled table state." },
      { command: "rg \"AgGridReact|GridOptions|columnDefs|rowData|defaultColDef|rowSelection|pagination|cellRenderer|cellEditor\" src app packages test", purpose: "Find AG Grid column, row, selection, pagination, renderer, and editing configuration." },
      { command: "rg \"react-data-grid|DataGrid|TreeDataGrid|rowKeyGetter|onRowsChange|selectedRows|sortColumns|renderEditCell|enableVirtualization\" src app packages test", purpose: "Find React Data Grid row identity, row updates, selection, sorting, editing, and virtualization." },
      { command: "rg \"role=.*grid|role=.*row|role=.*columnheader|role=.*gridcell|aria-rowcount|aria-colcount|aria-rowindex|aria-colindex|aria-sort|ArrowDown|Enter\" src app packages test", purpose: "Review grid roles, ARIA indices, sort state, and keyboard-navigation tests." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover table sorting, filtering, pagination, selection, editing, virtualization, keyboard, and accessibility flows." }
    ],
    learnerNextSteps: [
      "먼저 TanStack Table, AG Grid, React Data Grid, custom grid 중 어떤 table boundary가 있는지 찾으세요.",
      "columnDefs, ColumnDef, createColumnHelper, accessorKey, cellRenderer/renderCell, header, column visibility/pinning/sizing 신호로 column contract를 확인하세요.",
      "rowData, rows, rowKeyGetter, getCoreRowModel, sorted/filtered/pagination/grouped/expanded row model 신호로 row lifecycle을 추적하세요.",
      "sorting, filtering, pagination, row selection, column reorder, row expansion, faceting 신호는 사용자 interaction과 table state 전환을 설명합니다.",
      "useVirtualizer, enableVirtualization, virtual rows, viewport, row height 신호로 큰 데이터셋 렌더링 전략을 점검하세요.",
      "editable, cellEditor/renderEditCell, onRowsChange, valueGetter/valueFormatter 신호로 cell editing과 value projection 경계를 확인하세요.",
      "role=grid/row/columnheader/gridcell, aria-rowcount/colcount/rowindex/colindex/sort, keyboard tests를 같이 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 grid mount, DOM measurement, row virtualization, sorting/filtering execution, cell editing, server-side row loading은 안전한 테스트 환경에서 별도로 검증하세요."
    ]
  };
}

type DataTableReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataTableReadinessSourceFiles(walk: WalkResult): Promise<DataTableReadinessSourceFile[]> {
  const files: DataTableReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dataTableReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!dataTableReadinessPathSignal(file.relPath) && !dataTableReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function dataTableReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dataTableReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function dataTableReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(table|tables|grid|grids|datatable|data-table|data-grid|tanstack|ag-grid|react-data-grid|rows?|columns?|virtual|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function dataTableReadinessContentSignal(text: string): boolean {
  return /(useReactTable|\bColumnDef\b|createColumnHelper|getCoreRowModel|flexRender|AgGridReact|GridOptions|columnDefs|rowData|DataGrid|TreeDataGrid|rowKeyGetter|onRowsChange|selectedRows|sortColumns|enableVirtualization|role\s*=\s*["']grid|aria-rowcount|aria-colcount)/i.test(text);
}

function dataTableReadinessSetups(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["dataTableSetups"] {
  const rows: DataTableReadinessReport["dataTableSetups"] = [];
  for (const source of sourceFiles) {
    const columnCount = countMatches(source.text, /(ColumnDef|columnDefs|columns\s*=|columns\s*:|createColumnHelper|accessorKey|field\s*:|headerName|header\s*:|cellRenderer|renderCell|columnVisibility|columnPinning|resizable|size\s*:)/gi);
    const rowCount = countMatches(source.text, /(rowData|rows\s*=|rows\s*:|rowKeyGetter|getRowModel|getCoreRowModel|rowModelType|setGridOption\(['"]rowData|TreeDataGrid|rowGrouper)/gi);
    const sortCount = countMatches(source.text, /(getSortedRowModel|sorting|setSorting|sortColumns|onSortColumnsChange|sortable|aria-sort|SortColumn)/gi);
    const filterCount = countMatches(source.text, /(getFilteredRowModel|filter|columnFilter|globalFilter|faceting|getFaceted|enableColumnFilter)/gi);
    const paginationCount = countMatches(source.text, /(getPaginationRowModel|pagination|pageIndex|pageSize|paginationPageSize|manualPagination)/gi);
    const virtualizationCount = countMatches(source.text, /(useVirtualizer|virtualizer|virtualItems|enableVirtualization|rowVirtualizer|viewport|rowHeight|estimateSize|suppressRowVirtualisation|domLayout)/gi);
    const selectionCount = countMatches(source.text, /(rowSelection|selectedRows|onSelectedRowsChange|onRowSelectionChange|enableRowSelection|SelectColumn|onSelectionChanged|getSelectedRows)/gi);
    const editingCount = countMatches(source.text, /(editable|cellEditor|renderEditCell|renderTextEditor|onRowsChange|setRows|valueGetter|valueFormatter)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']grid|role:\s*["']grid|role\s*=\s*["']row|role\s*=\s*["']columnheader|role\s*=\s*["']gridcell|aria-label|aria-rowcount|aria-colcount|aria-rowindex|aria-colindex|aria-sort|ArrowDown|keyboard)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|describe\s*\(|it\s*\(|expect\s*\(|testing-library|getByRole|queryAllByRole|fireEvent\.keyDown|userEvent\.keyboard|upload-artifact|data-table-traces)/gi);
    const hasSetupSignal = columnCount + rowCount + sortCount + filterCount + paginationCount + virtualizationCount + selectionCount + editingCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: dataTableReadinessPlatform(source),
      columnCount,
      rowCount,
      sortCount,
      filterCount,
      paginationCount,
      virtualizationCount,
      selectionCount,
      editingCount,
      accessibilityCount,
      testCount,
      readiness: columnCount > 0 && rowCount > 0 && (sortCount + filterCount + paginationCount + selectionCount > 0) && (virtualizationCount + editingCount + accessibilityCount + testCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains columns ${columnCount}, rows ${rowCount}, sorting ${sortCount}, filters ${filterCount}, pagination ${paginationCount}, virtualization ${virtualizationCount}, selection ${selectionCount}, editing ${editingCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function dataTableReadinessPlatform(source: DataTableReadinessSourceFile): DataTableReadinessReport["dataTableSetups"][number]["platform"] {
  if (/@tanstack\/react-table|useReactTable|\bColumnDef\b|getCoreRowModel|flexRender/i.test(source.text)) return "tanstack-table";
  if (/ag-grid-react|AgGridReact|GridOptions|columnDefs|defaultColDef/i.test(source.text)) return "ag-grid";
  if (/react-data-grid|DataGrid|TreeDataGrid|rowKeyGetter|onRowsChange|SelectColumn/i.test(source.text)) return "react-data-grid";
  if (/data[-_ ]?table|data[-_ ]?grid|role\s*=\s*["']grid|columns|rows/i.test(source.text) || dataTableReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function dataTableReadinessFrameworkSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tanstack-table", pattern: /@tanstack\/react-table|useReactTable|\bColumnDef\b|getCoreRowModel|flexRender/i, evidence: "TanStack Table evidence was detected." },
    { signal: "ag-grid", pattern: /ag-grid-react|AgGridReact|GridOptions|columnDefs|defaultColDef/i, evidence: "AG Grid evidence was detected." },
    { signal: "react-data-grid", pattern: /react-data-grid|DataGrid|TreeDataGrid|rowKeyGetter|onRowsChange/i, evidence: "React Data Grid evidence was detected." },
    { signal: "custom", pattern: /data[-_ ]?table|data[-_ ]?grid|role\s*=\s*["']grid/i, evidence: "custom data table evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function dataTableReadinessColumnSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["columnSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["columnSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "column-defs", pattern: /ColumnDef|columnDefs|columns\s*=|columns\s*:/i, evidence: "column definition evidence was detected." },
    { signal: "column-helper", pattern: /createColumnHelper|columnHelper/i, evidence: "column helper evidence was detected." },
    { signal: "accessor-key", pattern: /accessorKey|accessor\s*\(/i, evidence: "accessor key evidence was detected." },
    { signal: "cell-renderer", pattern: /cellRenderer|renderCell|flexRender|\bcell\s*:/i, evidence: "cell renderer evidence was detected." },
    { signal: "header", pattern: /headerName|\bheader\s*:|columnheader/i, evidence: "header evidence was detected." },
    { signal: "column-visibility", pattern: /columnVisibility|onColumnVisibilityChange|hide\s*:/i, evidence: "column visibility evidence was detected." },
    { signal: "column-pinning", pattern: /columnPinning|onColumnPinningChange|pinned|frozen/i, evidence: "column pinning evidence was detected." },
    { signal: "column-sizing", pattern: /columnSizing|size\s*:|resizable|width|minWidth|maxWidth/i, evidence: "column sizing evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "column", "signal");
}

function dataTableReadinessRowModelSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["rowModelSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["rowModelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "core-row-model", pattern: /getCoreRowModel|core row model/i, evidence: "core row model evidence was detected." },
    { signal: "sorted-row-model", pattern: /getSortedRowModel|sorted row model/i, evidence: "sorted row model evidence was detected." },
    { signal: "filtered-row-model", pattern: /getFilteredRowModel|filtered row model/i, evidence: "filtered row model evidence was detected." },
    { signal: "pagination-row-model", pattern: /getPaginationRowModel|pagination row model/i, evidence: "pagination row model evidence was detected." },
    { signal: "grouped-row-model", pattern: /getGroupedRowModel|grouped row model|rowGrouper|groupBy/i, evidence: "grouped row model evidence was detected." },
    { signal: "expanded-row-model", pattern: /getExpandedRowModel|expanded row model|TreeDataGrid/i, evidence: "expanded row model evidence was detected." },
    { signal: "row-data", pattern: /rowData|rows\s*=|rows\s*:|setGridOption\(['"]rowData|rowKeyGetter/i, evidence: "row data evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "row-model", "signal");
}

function dataTableReadinessInteractionSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sorting", pattern: /sorting|sortColumns|sortable|aria-sort|onSortColumnsChange/i, evidence: "sorting evidence was detected." },
    { signal: "filtering", pattern: /filter|columnFilter|globalFilter|enableColumnFilter/i, evidence: "filtering evidence was detected." },
    { signal: "pagination", pattern: /pagination|pageIndex|pageSize|paginationPageSize/i, evidence: "pagination evidence was detected." },
    { signal: "row-selection", pattern: /rowSelection|selectedRows|onSelectedRowsChange|SelectColumn|onSelectionChanged/i, evidence: "row selection evidence was detected." },
    { signal: "column-reorder", pattern: /onColumnsReorder|columnsOrder|columnOrder|columnPinning|columnVisibility/i, evidence: "column reorder/visibility evidence was detected." },
    { signal: "row-expansion", pattern: /getExpandedRowModel|TreeDataGrid|expanded|subRows/i, evidence: "row expansion evidence was detected." },
    { signal: "faceting", pattern: /faceting|getFaceted|getFilteredRowModel|getGroupedRowModel/i, evidence: "faceting/grouping evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function dataTableReadinessStateSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["stateSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "controlled-state", pattern: /\bstate\s*:|state\s*=|useState|controlled/i, evidence: "controlled state evidence was detected." },
    { signal: "on-state-change", pattern: /onSortingChange|onRowSelectionChange|onPaginationChange|onColumnVisibilityChange|onColumnPinningChange|onSortColumnsChange|onSelectedRowsChange/i, evidence: "state change handler evidence was detected." },
    { signal: "row-selection-state", pattern: /RowSelectionState|rowSelection|selectedRows/i, evidence: "row selection state evidence was detected." },
    { signal: "sorting-state", pattern: /SortingState|sorting|sortColumns/i, evidence: "sorting state evidence was detected." },
    { signal: "pagination-state", pattern: /PaginationState|pagination|pageIndex|pageSize/i, evidence: "pagination state evidence was detected." },
    { signal: "rows-change", pattern: /onRowsChange|setRows|setRowData|setGridOption\(['"]rowData/i, evidence: "rows change evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function dataTableReadinessVirtualizationSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["virtualizationSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["virtualizationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "use-virtualizer", pattern: /useVirtualizer|@tanstack\/react-virtual/i, evidence: "useVirtualizer evidence was detected." },
    { signal: "enable-virtualization", pattern: /enableVirtualization|suppressRowVirtualisation\s*:\s*false/i, evidence: "enable virtualization evidence was detected." },
    { signal: "virtual-rows", pattern: /rowVirtualizer|virtualRows|virtualItems|getVirtualItems/i, evidence: "virtual rows evidence was detected." },
    { signal: "viewport", pattern: /viewport|data-table-viewport|getScrollElement|domLayout/i, evidence: "viewport evidence was detected." },
    { signal: "row-height", pattern: /rowHeight|estimateSize|defaultRowHeight/i, evidence: "row height evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "virtualization", "signal");
}

function dataTableReadinessEditingSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["editingSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["editingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "editable", pattern: /editable/i, evidence: "editable evidence was detected." },
    { signal: "cell-editor", pattern: /cellEditor|CellEditor/i, evidence: "cell editor evidence was detected." },
    { signal: "render-edit-cell", pattern: /renderEditCell|renderTextEditor/i, evidence: "render edit cell evidence was detected." },
    { signal: "on-rows-change", pattern: /onRowsChange|setRows/i, evidence: "onRowsChange evidence was detected." },
    { signal: "value-getter", pattern: /valueGetter/i, evidence: "valueGetter evidence was detected." },
    { signal: "value-formatter", pattern: /valueFormatter/i, evidence: "valueFormatter evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "editing", "signal");
}

function dataTableReadinessAccessibilitySignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "grid-role", pattern: /role\s*=\s*["']grid|role:\s*["']grid|role="grid"/i, evidence: "grid role evidence was detected." },
    { signal: "row-role", pattern: /role\s*=\s*["']row|role="row"/i, evidence: "row role evidence was detected." },
    { signal: "columnheader-role", pattern: /role\s*=\s*["']columnheader|role="columnheader"/i, evidence: "columnheader role evidence was detected." },
    { signal: "gridcell-role", pattern: /role\s*=\s*["']gridcell|role="gridcell"/i, evidence: "gridcell role evidence was detected." },
    { signal: "aria-rowcount", pattern: /aria-rowcount/i, evidence: "aria-rowcount evidence was detected." },
    { signal: "aria-colcount", pattern: /aria-colcount/i, evidence: "aria-colcount evidence was detected." },
    { signal: "aria-rowindex", pattern: /aria-rowindex/i, evidence: "aria-rowindex evidence was detected." },
    { signal: "aria-colindex", pattern: /aria-colindex/i, evidence: "aria-colindex evidence was detected." },
    { signal: "aria-sort", pattern: /aria-sort/i, evidence: "aria-sort evidence was detected." },
    { signal: "keyboard-navigation", pattern: /ArrowDown|ArrowUp|ArrowLeft|ArrowRight|Enter|keyboard|fireEvent\.keyDown|userEvent\.keyboard/i, evidence: "keyboard navigation evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function dataTableReadinessTestSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["testSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|getByRole|queryAllByRole/i, evidence: "Testing Library evidence was detected." },
    { signal: "keyboard-test", pattern: /fireEvent\.keyDown|userEvent\.keyboard|ArrowDown|ArrowUp|Enter/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|queryAllByRole|role\s*=\s*["']grid|role="grid"/i, evidence: "role test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|data-table-traces|grid-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function dataTableReadinessPackageSignals(sourceFiles: DataTableReadinessSourceFile[]): DataTableReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataTableReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@tanstack/react-table", pattern: /["@']@tanstack\/react-table["@']|from ["']@tanstack\/react-table["']/i, evidence: "@tanstack/react-table package evidence was detected." },
    { signal: "@tanstack/react-virtual", pattern: /["@']@tanstack\/react-virtual["@']|from ["']@tanstack\/react-virtual["']/i, evidence: "@tanstack/react-virtual package evidence was detected." },
    { signal: "ag-grid-react", pattern: /["@']ag-grid-react["@']|from ["']ag-grid-react["']/i, evidence: "ag-grid-react package evidence was detected." },
    { signal: "ag-grid-community", pattern: /["@']ag-grid-community["@']|from ["']ag-grid-community["']/i, evidence: "ag-grid-community package evidence was detected." },
    { signal: "react-data-grid", pattern: /["@']react-data-grid["@']|from ["']react-data-grid["']/i, evidence: "react-data-grid package evidence was detected." }
  ];
  return dataTableReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataTableReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataTableReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/data-table-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCalendarReadinessReport(walk: WalkResult): Promise<CalendarReadinessReport> {
  const sourceFiles = await calendarReadinessSourceFiles(walk);
  const calendarSetups = calendarReadinessSetups(sourceFiles);
  const frameworkSignals = calendarReadinessFrameworkSignals(sourceFiles);
  const viewSignals = calendarReadinessViewSignals(sourceFiles);
  const eventSignals = calendarReadinessEventSignals(sourceFiles);
  const selectionSignals = calendarReadinessSelectionSignals(sourceFiles);
  const navigationSignals = calendarReadinessNavigationSignals(sourceFiles);
  const localizationSignals = calendarReadinessLocalizationSignals(sourceFiles);
  const resourceSignals = calendarReadinessResourceSignals(sourceFiles);
  const dragDropSignals = calendarReadinessDragDropSignals(sourceFiles);
  const rangeConstraintSignals = calendarReadinessRangeConstraintSignals(sourceFiles);
  const accessibilitySignals = calendarReadinessAccessibilitySignals(sourceFiles);
  const testSignals = calendarReadinessTestSignals(sourceFiles);
  const packageSignals = calendarReadinessPackageSignals(sourceFiles);
  const reactBigCalendarSignals = calendarReadinessReactBigCalendarSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasViews = viewSignals.some((item) => item.readiness === "ready") || calendarSetups.some((item) => item.viewCount > 0);
  const hasEventsOrSelection = eventSignals.some((item) => item.readiness === "ready") || selectionSignals.some((item) => item.readiness === "ready") || calendarSetups.some((item) => item.eventCount + item.selectionCount > 0);
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready") || calendarSetups.some((item) => item.navigationCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || calendarSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || calendarSetups.some((item) => item.testCount > 0);

  const riskQueue: CalendarReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasViews) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a calendar/date-picker boundary such as FullCalendar, react-big-calendar, React DayPicker, or a custom date grid.",
      why: "Calendar readiness starts with explicit view, picker, or scheduling component evidence.",
      relatedHref: "html/calendar-readiness.html"
    });
  }
  if ((hasFramework || hasViews) && !hasEventsOrSelection) {
    riskQueue.push({
      priority: "high",
      action: "Pair calendar views with events, event accessors, selected dates, ranges, or slot selection handlers.",
      why: "A calendar view without event or selection contracts does not show how users inspect or choose dates.",
      relatedHref: "html/calendar-readiness.html"
    });
  }
  if ((hasFramework || hasViews) && !hasNavigation) {
    riskQueue.push({
      priority: "medium",
      action: "Document calendar navigation such as toolbar, prev/next, today, default date, caption layout, or bounded date range.",
      why: "Calendar workflows depend on predictable movement through months, weeks, days, and constrained ranges.",
      relatedHref: "html/calendar-readiness.html"
    });
  }
  if ((hasFramework || hasViews) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add labels, grid roles, button labels, keyboard navigation, and focus-management evidence.",
      why: "Calendars are dense keyboard controls and need explicit accessibility contracts for date cells and navigation buttons.",
      relatedHref: "html/calendar-readiness.html"
    });
  }
  if ((hasFramework || hasViews) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for view switching, event selection, date range selection, keyboard navigation, time zones, and labels.",
      why: "Calendar bugs often hide in time-zone, locale, keyboard, range, and drag/drop edge cases.",
      relatedHref: "html/calendar-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live calendar behavior in a trusted browser or original project tests outside RepoTutor.",
    why: "RepoTutor records calendar readiness only; it does not render calendars, mutate Date objects, calculate layout geometry, drag events, resize events, select dates, advance time zones, fetch event sources, or run analyzed project tests.",
    relatedHref: "html/calendar-readiness.html"
  });

  return {
    summary: `FullCalendar/react-big-calendar/React DayPicker-style calendar readiness report: setup ${calendarSetups.length}개, framework signal ${frameworkSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개, react-big-calendar signal ${reactBigCalendarSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Calendar readiness FullCalendar react-big-calendar React DayPicker events views selection navigation localization resources drag drop date ranges accessibility tests localizer accessors components getters popup drilldown DnD addon",
    calendarSetups,
    frameworkSignals,
    viewSignals,
    eventSignals,
    selectionSignals,
    navigationSignals,
    localizationSignals,
    resourceSignals,
    dragDropSignals,
    rangeConstraintSignals,
    accessibilitySignals,
    testSignals,
    packageSignals,
    reactBigCalendarSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"FullCalendar|@fullcalendar/react|initialView|headerToolbar|events|eventClick|dateClick|selectable|eventDrop|eventResize\" src app packages test", purpose: "Find FullCalendar setup, views, toolbar, events, selection, and interaction hooks." },
      { command: "rg \"react-big-calendar|Calendar|localizer|momentLocalizer|dateFnsLocalizer|startAccessor|endAccessor|onSelectEvent|onSelectSlot|withDragAndDrop\" src app packages test", purpose: "Find react-big-calendar localizer, event accessors, selection, resources, and drag/drop setup." },
      { command: "rg \"dayjsLocalizer|globalizeLocalizer|tooltipAccessor|allDayAccessor|components=|eventPropGetter|slotPropGetter|dayPropGetter|getDrilldownView|popup|showMultiDayTimes|step|timeslots\" src app packages test", purpose: "Map react-big-calendar localizers, accessor coverage, component overrides, popup/drilldown behavior, and time-grid controls." },
      { command: "rg \"react-day-picker|DayPicker|mode=|selected=|onSelect|disabled=|modifiers|captionLayout|navLayout|numberOfMonths|startMonth|endMonth\" src app packages test", purpose: "Find DayPicker selection mode, disabled dates, modifiers, navigation, and range constraints." },
      { command: "rg \"aria-label|getByRole|role=.*grid|ArrowLeft|ArrowRight|labelDayButton|keyboard|focus\" src app packages test", purpose: "Review calendar labels, grid roles, navigation buttons, keyboard behavior, and focus evidence." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover calendar views, events, date selection, time zones, keyboard navigation, and accessibility flows." }
    ],
    learnerNextSteps: [
      "먼저 FullCalendar, react-big-calendar, React DayPicker, custom calendar 중 어떤 boundary가 있는지 찾으세요.",
      "initialView, dayGrid/timeGrid/list, views, numberOfMonths 신호로 사용자가 보는 calendar surface를 확인하세요.",
      "events, eventClick/dateClick, eventContent/classNames, start/end accessors 신호로 event rendering과 선택 경계를 추적하세요.",
      "selectable, select callback, onSelectSlot/onSelectEvent, selected/onSelect, mode 신호는 date selection contract를 설명합니다.",
      "headerToolbar, toolbar, today, prev/next, defaultDate, caption/nav layout, start/end month 신호로 navigation을 점검하세요.",
      "timeZone, locale, localizer, moment/date-fns localizer, weekStartsOn, formats/messages 신호로 locale/time-zone 위험을 분리하세요.",
      "resources, resource accessors, resourceTimeGrid, eventDrop/eventResize, withDragAndDrop, draggableAccessor 신호로 scheduling 고급 기능을 확인하세요.",
      "react-big-calendar 프로젝트는 localizer 선택, accessor coverage, components/getters, popup/drilldown, time bounds, DnD addon을 별도 신호로 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 calendar render, layout measurement, drag/drop, date selection, timezone calculation, event source fetching은 안전한 테스트 환경에서 별도로 검증하세요."
    ]
  };
}

type CalendarReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function calendarReadinessSourceFiles(walk: WalkResult): Promise<CalendarReadinessSourceFile[]> {
  const files: CalendarReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !calendarReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!calendarReadinessPathSignal(file.relPath) && !calendarReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function calendarReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return calendarReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function calendarReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(calendar|calendars|date[-_ ]?picker|datepicker|daypicker|fullcalendar|react-big-calendar|schedule|schedules|booking|availability|events?|resources?|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function calendarReadinessContentSignal(text: string): boolean {
  return /(FullCalendar|@fullcalendar\/react|CalendarOptions|react-big-calendar|momentLocalizer|dateFnsLocalizer|withDragAndDrop|DayPicker|react-day-picker|mode\s*=|onSelectSlot|eventClick|dateClick|headerToolbar|captionLayout|navLayout|aria-label=.*calendar)/i.test(text);
}

function calendarReadinessSetups(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["calendarSetups"] {
  const rows: CalendarReadinessReport["calendarSetups"] = [];
  for (const source of sourceFiles) {
    const viewCount = countMatches(source.text, /(initialView|dayGrid|timeGrid|listWeek|listPlugin|Views\.MONTH|Views\.WEEK|Views\.DAY|Views\.AGENDA|defaultView|views\s*=|numberOfMonths|month|week|agenda)/gi);
    const eventCount = countMatches(source.text, /(events\s*=|events\s*:|eventSources|eventClick|dateClick|eventContent|eventClassNames|startAccessor|endAccessor|titleAccessor|onSelectEvent)/gi);
    const selectionCount = countMatches(source.text, /(selectable|selectMirror|\bselect\s*=|select\s*:|onSelectSlot|onSelectEvent|selected\s*=|onSelect\s*=|mode\s*=|mode:\s*["'](single|multiple|range)|required)/gi);
    const navigationCount = countMatches(source.text, /(headerToolbar|toolbar|today|prev,next|previous|next|defaultDate|onNavigate|onView|captionLayout|navLayout|startMonth|endMonth|fromMonth|toMonth)/gi);
    const localizationCount = countMatches(source.text, /(timeZone|locale|culture|localizer|momentLocalizer|dateFnsLocalizer|weekStartsOn|ISOWeek|formats|messages)/gi);
    const resourceCount = countMatches(source.text, /(resources\s*=|resources\s*:|resourceAccessor|resourceIdAccessor|resourceTitleAccessor|resourceId|resourceAreaHeaderContent|resourceTimeGrid|resource-timegrid)/gi);
    const dragDropCount = countMatches(source.text, /(interactionPlugin|editable|droppable|eventDrop|eventResize|withDragAndDrop|draggableAccessor|resizable|onEventDrop|onEventResize)/gi);
    const rangeCount = countMatches(source.text, /(validRange|min\s*=|max\s*=|slotDuration|scrollToTime|disabled\s*=|DateRange|Matcher|startMonth|endMonth|fromMonth|toMonth|modifiers|before:|after:|dayOfWeek)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|role\s*=\s*["']grid|role:\s*["']grid|getByRole\(['"]grid|labelDayButton|Navigation bar|Go to the Next Month|Go to the Previous Month|ArrowLeft|ArrowRight|keyboard|focus)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|describe\s*\(|it\s*\(|expect\s*\(|getByRole|fireEvent\.keyDown|userEvent\.keyboard|timeZone|timezone|upload-artifact|calendar-traces)/gi);
    const hasSetupSignal = viewCount + eventCount + selectionCount + navigationCount + localizationCount + resourceCount + dragDropCount + rangeCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: calendarReadinessPlatform(source),
      viewCount,
      eventCount,
      selectionCount,
      navigationCount,
      localizationCount,
      resourceCount,
      dragDropCount,
      rangeCount,
      accessibilityCount,
      testCount,
      readiness: viewCount > 0 && (eventCount + selectionCount > 0) && (navigationCount + localizationCount + rangeCount > 0) && (accessibilityCount + testCount + resourceCount + dragDropCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains views ${viewCount}, events ${eventCount}, selection ${selectionCount}, navigation ${navigationCount}, localization ${localizationCount}, resources ${resourceCount}, drag/drop ${dragDropCount}, ranges ${rangeCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function calendarReadinessPlatform(source: CalendarReadinessSourceFile): CalendarReadinessReport["calendarSetups"][number]["platform"] {
  if (/@fullcalendar\/|FullCalendar|CalendarOptions|dayGridPlugin|timeGridPlugin/i.test(source.text)) return "fullcalendar";
  if (/react-big-calendar|momentLocalizer|dateFnsLocalizer|withDragAndDrop|startAccessor|endAccessor/i.test(source.text)) return "react-big-calendar";
  if (/react-day-picker|DayPicker|DateRange|captionLayout|navLayout|labelDayButton/i.test(source.text)) return "react-day-picker";
  if (/calendar|date[-_ ]?picker|datepicker|booking|availability/i.test(source.text) || calendarReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function calendarReadinessFrameworkSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "fullcalendar", pattern: /@fullcalendar\/react|FullCalendar|CalendarOptions|dayGridPlugin|timeGridPlugin/i, evidence: "FullCalendar evidence was detected." },
    { signal: "react-big-calendar", pattern: /react-big-calendar|momentLocalizer|dateFnsLocalizer|withDragAndDrop|startAccessor|endAccessor/i, evidence: "react-big-calendar evidence was detected." },
    { signal: "react-day-picker", pattern: /react-day-picker|DayPicker|DateRange|labelDayButton/i, evidence: "React DayPicker evidence was detected." },
    { signal: "custom", pattern: /date[-_ ]?picker|booking calendar|availability calendar|role\s*=\s*["']grid/i, evidence: "custom calendar evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function calendarReadinessViewSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["viewSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["viewSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "initial-view", pattern: /initialView|defaultView/i, evidence: "initial/default view evidence was detected." },
    { signal: "day-grid", pattern: /dayGrid|dayGridPlugin|dayGridMonth/i, evidence: "day grid evidence was detected." },
    { signal: "time-grid", pattern: /timeGrid|timeGridPlugin|timeGridWeek|timeGridDay/i, evidence: "time grid evidence was detected." },
    { signal: "list-view", pattern: /listPlugin|listWeek|list-view/i, evidence: "list view evidence was detected." },
    { signal: "month-view", pattern: /Views\.MONTH|month|dayGridMonth/i, evidence: "month view evidence was detected." },
    { signal: "week-view", pattern: /Views\.WEEK|week|timeGridWeek/i, evidence: "week view evidence was detected." },
    { signal: "agenda-view", pattern: /Views\.AGENDA|agenda/i, evidence: "agenda view evidence was detected." },
    { signal: "number-of-months", pattern: /numberOfMonths/i, evidence: "numberOfMonths evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "view", "signal");
}

function calendarReadinessEventSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["eventSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["eventSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "events", pattern: /events\s*=|events\s*:|\bevents\b/i, evidence: "events evidence was detected." },
    { signal: "event-click", pattern: /eventClick|onSelectEvent/i, evidence: "event click/select evidence was detected." },
    { signal: "date-click", pattern: /dateClick/i, evidence: "date click evidence was detected." },
    { signal: "event-content", pattern: /eventContent|components\s*=|\bevent:\s*\(/i, evidence: "event content evidence was detected." },
    { signal: "event-class-names", pattern: /eventClassNames|eventPropGetter|className/i, evidence: "event class names evidence was detected." },
    { signal: "event-source", pattern: /eventSources|EventSource|source/i, evidence: "event source evidence was detected." },
    { signal: "event-accessors", pattern: /startAccessor|endAccessor|titleAccessor|resourceAccessor/i, evidence: "event accessor evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "event", "signal");
}

function calendarReadinessSelectionSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "selectable", pattern: /selectable|selectMirror/i, evidence: "selectable evidence was detected." },
    { signal: "select-callback", pattern: /\bselect\s*=|select\s*:|onSelect\s*=/i, evidence: "select callback evidence was detected." },
    { signal: "on-select-slot", pattern: /onSelectSlot/i, evidence: "onSelectSlot evidence was detected." },
    { signal: "on-select-event", pattern: /onSelectEvent/i, evidence: "onSelectEvent evidence was detected." },
    { signal: "selected-date", pattern: /selected\s*=|selected\s*:|DateRange/i, evidence: "selected date evidence was detected." },
    { signal: "on-select-date", pattern: /onSelect\s*=|onDayClick|setRange|setDate/i, evidence: "onSelect date evidence was detected." },
    { signal: "selection-mode", pattern: /mode\s*=|mode:\s*["'](single|multiple|range)|required/i, evidence: "selection mode evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function calendarReadinessNavigationSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "header-toolbar", pattern: /headerToolbar/i, evidence: "headerToolbar evidence was detected." },
    { signal: "toolbar", pattern: /toolbar|Toolbar/i, evidence: "toolbar evidence was detected." },
    { signal: "today-button", pattern: /today|Today/i, evidence: "today button evidence was detected." },
    { signal: "prev-next", pattern: /prev,next|previous|next|Go to the Previous Month|Go to the Next Month/i, evidence: "prev/next evidence was detected." },
    { signal: "default-date", pattern: /defaultDate|initialDate/i, evidence: "default date evidence was detected." },
    { signal: "date-range-navigation", pattern: /onNavigate|startMonth|endMonth|fromMonth|toMonth|validRange/i, evidence: "date range navigation evidence was detected." },
    { signal: "caption-layout", pattern: /captionLayout/i, evidence: "caption layout evidence was detected." },
    { signal: "nav-layout", pattern: /navLayout/i, evidence: "nav layout evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function calendarReadinessLocalizationSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["localizationSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["localizationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "time-zone", pattern: /timeZone|timezone/i, evidence: "time zone evidence was detected." },
    { signal: "locale", pattern: /locale|culture/i, evidence: "locale/culture evidence was detected." },
    { signal: "localizer", pattern: /localizer|DateLocalizer/i, evidence: "localizer evidence was detected." },
    { signal: "moment-localizer", pattern: /momentLocalizer/i, evidence: "moment localizer evidence was detected." },
    { signal: "date-fns-localizer", pattern: /dateFnsLocalizer|date-fns/i, evidence: "date-fns localizer evidence was detected." },
    { signal: "week-starts-on", pattern: /weekStartsOn|startOfWeek|ISOWeek/i, evidence: "week start evidence was detected." },
    { signal: "formats-messages", pattern: /formats\s*=|formats\s*:|messages\s*=|messages\s*:/i, evidence: "formats/messages evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "localization", "signal");
}

function calendarReadinessResourceSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["resourceSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["resourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resources", pattern: /resources\s*=|resources\s*:|resourceAreaHeaderContent/i, evidence: "resources evidence was detected." },
    { signal: "resource-accessor", pattern: /resourceAccessor/i, evidence: "resource accessor evidence was detected." },
    { signal: "resource-id", pattern: /resourceId|resourceIdAccessor/i, evidence: "resource id evidence was detected." },
    { signal: "resource-title", pattern: /resourceTitleAccessor|resourceAreaHeaderContent|\btitle\s*:/i, evidence: "resource title evidence was detected." },
    { signal: "resource-time-grid", pattern: /resourceTimeGrid|resource-timegrid|@fullcalendar\/resource-timegrid/i, evidence: "resource time grid evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "resource", "signal");
}

function calendarReadinessDragDropSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["dragDropSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["dragDropSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "interaction-plugin", pattern: /interactionPlugin|@fullcalendar\/interaction/i, evidence: "interaction plugin evidence was detected." },
    { signal: "editable-events", pattern: /editable|droppable|resizable/i, evidence: "editable event evidence was detected." },
    { signal: "event-drop", pattern: /eventDrop|onEventDrop/i, evidence: "event drop evidence was detected." },
    { signal: "event-resize", pattern: /eventResize|onEventResize/i, evidence: "event resize evidence was detected." },
    { signal: "with-drag-and-drop", pattern: /withDragAndDrop/i, evidence: "withDragAndDrop evidence was detected." },
    { signal: "draggable-accessor", pattern: /draggableAccessor/i, evidence: "draggable accessor evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "drag-drop", "signal");
}

function calendarReadinessRangeConstraintSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["rangeConstraintSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["rangeConstraintSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "valid-range", pattern: /validRange/i, evidence: "valid range evidence was detected." },
    { signal: "min-max-time", pattern: /min\s*=|max\s*=|slotDuration|scrollToTime/i, evidence: "min/max time evidence was detected." },
    { signal: "disabled-dates", pattern: /disabled\s*=|disabled\s*:|before:|after:|dayOfWeek/i, evidence: "disabled date evidence was detected." },
    { signal: "date-range", pattern: /DateRange|mode\s*=\s*["']range|from:|to:/i, evidence: "date range evidence was detected." },
    { signal: "start-end-month", pattern: /startMonth|endMonth|fromMonth|toMonth/i, evidence: "start/end month evidence was detected." },
    { signal: "modifiers", pattern: /modifiers|modifiersClassNames/i, evidence: "modifier evidence was detected." },
    { signal: "matcher", pattern: /Matcher|before:|after:|dayOfWeek/i, evidence: "matcher evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "range-constraint", "signal");
}

function calendarReadinessAccessibilitySignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "calendar-label", pattern: /aria-label=.*calendar|aria-label=["'][^"']*calendar|Booking calendar|Operations calendar|Team calendar/i, evidence: "calendar label evidence was detected." },
    { signal: "grid-role", pattern: /role\s*=\s*["']grid|role:\s*["']grid|getByRole\(["']grid|role="grid"/i, evidence: "grid role evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|labelDayButton|Navigation bar/i, evidence: "aria-label evidence was detected." },
    { signal: "keyboard-navigation", pattern: /ArrowLeft|ArrowRight|ArrowUp|ArrowDown|Enter|fireEvent\.keyDown|userEvent\.keyboard|keyboard/i, evidence: "keyboard navigation evidence was detected." },
    { signal: "button-labels", pattern: /labelDayButton|today|previous|next|Go to the Previous Month|Go to the Next Month|getByRole\(["']button/i, evidence: "button label evidence was detected." },
    { signal: "focus-management", pattern: /focus|focused|tabIndex|fireEvent\.keyDown|keyboard/i, evidence: "focus management evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function calendarReadinessTestSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["testSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|getByRole|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "keyboard-test", pattern: /fireEvent\.keyDown|userEvent\.keyboard|ArrowLeft|ArrowRight|Enter/i, evidence: "keyboard test evidence was detected." },
    { signal: "role-test", pattern: /getByRole|queryAllByRole|role\s*=\s*["']grid|role="grid"/i, evidence: "role test evidence was detected." },
    { signal: "timezone-test", pattern: /timeZone|timezone|resolvedOptions/i, evidence: "time-zone test/evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|calendar-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function calendarReadinessPackageSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@fullcalendar/react", pattern: /["@']@fullcalendar\/react["@']|from ["']@fullcalendar\/react["']/i, evidence: "@fullcalendar/react package evidence was detected." },
    { signal: "@fullcalendar/core", pattern: /["@']@fullcalendar\/core["@']|from ["']@fullcalendar\/core["']/i, evidence: "@fullcalendar/core package evidence was detected." },
    { signal: "react-big-calendar", pattern: /["@']react-big-calendar["@']|from ["']react-big-calendar["']/i, evidence: "react-big-calendar package evidence was detected." },
    { signal: "react-day-picker", pattern: /["@']react-day-picker["@']|from ["']react-day-picker["']/i, evidence: "react-day-picker package evidence was detected." },
    { signal: "date-fns", pattern: /["@']date-fns["@']|from ["']date-fns["']|dateFnsLocalizer/i, evidence: "date-fns package evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function calendarReadinessReactBigCalendarSignals(sourceFiles: CalendarReadinessSourceFile[]): CalendarReadinessReport["reactBigCalendarSignals"] {
  const specs: Array<{ signal: CalendarReadinessReport["reactBigCalendarSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "calendar-component", pattern: /from ["']react-big-calendar["']|<Calendar\b|Calendar\s*,|DnDCalendar/i, evidence: "react-big-calendar Calendar component evidence was detected." },
    { signal: "localizer-required", pattern: /localizer\s*=|localizer\s*:|DateLocalizer/i, evidence: "localizer requirement evidence was detected." },
    { signal: "moment-localizer", pattern: /momentLocalizer/i, evidence: "momentLocalizer evidence was detected." },
    { signal: "globalize-localizer", pattern: /globalizeLocalizer/i, evidence: "globalizeLocalizer evidence was detected." },
    { signal: "date-fns-localizer", pattern: /dateFnsLocalizer/i, evidence: "dateFnsLocalizer evidence was detected." },
    { signal: "dayjs-localizer", pattern: /dayjsLocalizer/i, evidence: "dayjsLocalizer evidence was detected." },
    { signal: "views-constant", pattern: /Views\.(MONTH|WEEK|WORK_WEEK|DAY|AGENDA)|views\s*=\s*\[/i, evidence: "Views constant/list evidence was detected." },
    { signal: "controlled-view", pattern: /\bview\s*=|onView\s*=/i, evidence: "controlled view evidence was detected." },
    { signal: "default-view", pattern: /defaultView\s*=|defaultView\s*:/i, evidence: "defaultView evidence was detected." },
    { signal: "event-accessors", pattern: /startAccessor|endAccessor|titleAccessor/i, evidence: "event accessor evidence was detected." },
    { signal: "tooltip-accessor", pattern: /tooltipAccessor/i, evidence: "tooltip accessor evidence was detected." },
    { signal: "all-day-accessor", pattern: /allDayAccessor/i, evidence: "all-day accessor evidence was detected." },
    { signal: "resource-accessors", pattern: /resourceAccessor|resourceIdAccessor|resourceTitleAccessor/i, evidence: "resource accessor evidence was detected." },
    { signal: "selectable-slots", pattern: /selectable|onSelectSlot/i, evidence: "selectable slot evidence was detected." },
    { signal: "on-navigate", pattern: /onNavigate/i, evidence: "onNavigate evidence was detected." },
    { signal: "on-view", pattern: /onView/i, evidence: "onView evidence was detected." },
    { signal: "components-override", pattern: /components\s*=|components\s*:/i, evidence: "components override evidence was detected." },
    { signal: "event-prop-getter", pattern: /eventPropGetter/i, evidence: "eventPropGetter evidence was detected." },
    { signal: "slot-prop-getter", pattern: /slotPropGetter/i, evidence: "slotPropGetter evidence was detected." },
    { signal: "day-prop-getter", pattern: /dayPropGetter/i, evidence: "dayPropGetter evidence was detected." },
    { signal: "formats", pattern: /formats\s*=|formats\s*:/i, evidence: "formats evidence was detected." },
    { signal: "messages", pattern: /messages\s*=|messages\s*:/i, evidence: "messages evidence was detected." },
    { signal: "popup", pattern: /popup|popupOffset/i, evidence: "popup evidence was detected." },
    { signal: "drilldown", pattern: /drilldownView|getDrilldownView|onDrillDown|doShowMoreDrillDown/i, evidence: "drilldown evidence was detected." },
    { signal: "show-multi-day-times", pattern: /showMultiDayTimes/i, evidence: "showMultiDayTimes evidence was detected." },
    { signal: "time-bounds", pattern: /\bmin\s*=|\bmax\s*=|scrollToTime/i, evidence: "time bounds evidence was detected." },
    { signal: "step-timeslots", pattern: /step\s*=|timeslots\s*=/i, evidence: "step/timeslots evidence was detected." },
    { signal: "dnd-addon", pattern: /withDragAndDrop|addons\/dragAndDrop|DragAndDropCalendar/i, evidence: "drag-and-drop addon evidence was detected." },
    { signal: "on-event-drop", pattern: /onEventDrop/i, evidence: "onEventDrop evidence was detected." },
    { signal: "on-event-resize", pattern: /onEventResize/i, evidence: "onEventResize evidence was detected." },
    { signal: "draggable-accessor", pattern: /draggableAccessor/i, evidence: "draggableAccessor evidence was detected." },
    { signal: "resizable", pattern: /resizable/i, evidence: "resizable evidence was detected." },
    { signal: "css-import", pattern: /react-big-calendar\/lib\/css\/react-big-calendar\.css|react-big-calendar\.css/i, evidence: "react-big-calendar CSS import evidence was detected." },
    { signal: "sass-styles", pattern: /react-big-calendar\/lib\/sass\/styles|\.scss|SASS|sass/i, evidence: "react-big-calendar Sass style evidence was detected." },
    { signal: "localizer-tests", pattern: /localizer\.test|DateLocalizer|mergeWithDefaults|formats.*messages/i, evidence: "localizer test/merge evidence was detected." }
  ];
  return calendarReadinessSignalFromSpecs(sourceFiles, specs, "react-big-calendar", "signal");
}

function calendarReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CalendarReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/calendar-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDialogReadinessReport(walk: WalkResult): Promise<DialogReadinessReport> {
  const sourceFiles = await dialogReadinessSourceFiles(walk);
  const dialogSetups = dialogReadinessSetups(sourceFiles);
  const frameworkSignals = dialogReadinessFrameworkSignals(sourceFiles);
  const structureSignals = dialogReadinessStructureSignals(sourceFiles);
  const stateSignals = dialogReadinessStateSignals(sourceFiles);
  const focusSignals = dialogReadinessFocusSignals(sourceFiles);
  const dismissalSignals = dialogReadinessDismissalSignals(sourceFiles);
  const portalOverlaySignals = dialogReadinessPortalOverlaySignals(sourceFiles);
  const accessibilitySignals = dialogReadinessAccessibilitySignals(sourceFiles);
  const animationSignals = dialogReadinessAnimationSignals(sourceFiles);
  const implementationSignals = dialogReadinessImplementationSignals(sourceFiles);
  const testSignals = dialogReadinessTestSignals(sourceFiles);
  const packageSignals = dialogReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || dialogSetups.some((item) => item.contentCount + item.triggerCount > 0);
  const hasFocus = focusSignals.some((item) => item.readiness === "ready") || dialogSetups.some((item) => item.focusCount > 0);
  const hasDismiss = dismissalSignals.some((item) => item.readiness === "ready") || dialogSetups.some((item) => item.dismissCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || dialogSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || dialogSetups.some((item) => item.testCount > 0);

  const riskQueue: DialogReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a dialog boundary such as Radix Dialog, Headless UI Dialog, Ariakit Dialog, native dialog, or a custom modal.",
      why: "Dialog readiness starts with explicit trigger, portal, content, and close boundary evidence.",
      relatedHref: "html/dialog-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasFocus) {
    riskQueue.push({
      priority: "high",
      action: "Pair dialogs with focus trap, initial focus, restore focus, tab lock, or inert sibling behavior.",
      why: "A dialog without focus management can trap keyboard users outside the intended modal workflow.",
      relatedHref: "html/dialog-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasDismiss) {
    riskQueue.push({
      priority: "high",
      action: "Document close buttons, Escape handling, outside-click policy, dismiss layers, or onClose/onDismiss callbacks.",
      why: "Dialog users need predictable and testable ways to leave overlays without losing context.",
      relatedHref: "html/dialog-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasAccessibility) {
    riskQueue.push({
      priority: "high",
      action: "Add role, aria-modal, aria-label, aria-labelledby, aria-describedby, title, and description evidence.",
      why: "Dialogs are accessibility-critical surfaces and need explicit labels plus semantic modal state.",
      relatedHref: "html/dialog-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for role discovery, labels, Escape, Tab flow, focus return, close buttons, and portal artifacts.",
      why: "Dialog regressions often appear in keyboard, focus, portal, and dismissal edge cases.",
      relatedHref: "html/dialog-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live dialog behavior in a trusted browser or original project tests outside RepoTutor.",
    why: "RepoTutor records dialog readiness only; it does not open portals, move focus, mark siblings inert, lock scroll, dispatch Escape/outside clicks, animate overlays, or run analyzed project tests.",
    relatedHref: "html/dialog-readiness.html"
  });

  return {
    summary: `Radix Dialog/Headless UI Dialog/Ariakit Dialog-style dialog readiness report: setup ${dialogSetups.length}개, framework signal ${frameworkSignals.length}개, focus signal ${focusSignals.length}개, implementation signal ${implementationSignals.length}개, accessibility signal ${accessibilitySignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Dialog readiness Radix Dialog Headless UI Dialog FocusTrap internals Ariakit Dialog portal overlay focus trap focus lock hidden guards tab direction dismiss accessibility server handoff root containers inert stack top layer scroll lock disappear tests",
    dialogSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    focusSignals,
    dismissalSignals,
    portalOverlaySignals,
    accessibilitySignals,
    animationSignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@radix-ui/react-dialog|Dialog.Root|Dialog.Trigger|Dialog.Portal|Dialog.Overlay|Dialog.Content|Dialog.Title|Dialog.Description|Dialog.Close\" src app packages test", purpose: "Find Radix Dialog roots, triggers, portal, overlay, content, labels, and close controls." },
      { command: "rg \"@radix-ui/react-alert-dialog|AlertDialog.Root|AlertDialog.Action|AlertDialog.Cancel|role=\\\"alertdialog\\\"\" src app packages test", purpose: "Find destructive or confirmation dialogs that need alertdialog semantics and cancel/action controls." },
      { command: "rg \"@headlessui/react|DialogPanel|DialogTitle|DialogBackdrop|Description|CloseButton|initialFocus|onClose|Transition|FocusTrap\" src app packages test", purpose: "Find Headless UI Dialog state, panel/backdrop, focus, close, transition, and focus trap wiring." },
      { command: "rg \"useServerHandoffComplete|useNestedPortals|useRootContainers|useInertOthers|stackMachines|useOutsideClick|useEscape|useScrollLock|useOnDisappear|FocusTrapFeatures|useRestoreFocus|useInitialFocus|useFocusLock|useTabDirection|HiddenFeatures|data-headlessui-focus-guard|microTask|focusIn\" src app packages test", purpose: "Review Headless UI-style dialog internals for portal ownership, inert siblings, top-layer dismissal, scroll lock, disappearance, focus trap features, hidden guards, tab direction, and focus lock hooks." },
      { command: "rg \"@ariakit/react|DialogProvider|useDialogStore|DialogDisclosure|DialogDismiss|modal|portal|backdrop|hideOnEscape|hideOnInteractOutside\" src app packages test", purpose: "Find Ariakit Dialog provider, store, disclosure, dismiss, portal, modal, and escape/outside policies." },
      { command: "rg \"getByRole\\(['\\\"]dialog|getByRole\\(['\\\"]alertdialog|userEvent\\.keyboard|Escape|Tab|document\\.activeElement|aria-modal|aria-labelledby|aria-describedby\" src app packages test", purpose: "Review dialog role, label, keyboard, focus, and accessibility tests." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover dialog open/close, labels, focus trap, Escape, Tab flow, portal behavior, and accessibility flows." }
    ],
    learnerNextSteps: [
      "먼저 Radix Dialog, Headless UI Dialog, Ariakit Dialog, native dialog, custom modal 중 어떤 boundary가 있는지 찾으세요.",
      "root, trigger, portal, overlay/backdrop, content/panel, title, description, close 신호로 dialog structure를 확인하세요.",
      "open, defaultOpen, onOpenChange, onClose, DialogProvider, useDialogStore, controlled state 신호로 state ownership을 분리하세요.",
      "FocusScope, FocusTrap, initialFocus, restore/final focus, autoFocus, TabLock, inert siblings 신호로 keyboard/focus 위험을 점검하세요.",
      "DismissableLayer, outside click, Escape, close button, DialogDismiss, hideOnEscape, hideOnInteractOutside 신호로 dismissal policy를 확인하세요.",
      "Headless UI Dialog라면 server handoff, nested portals, root containers, inert siblings, stack top-layer, scroll lock, disappearing close, FocusTrapFeatures, focus lock hooks, tab direction, and hidden focus guard 신호를 따로 확인하세요.",
      "portal, portal group, force portal root, RemoveScroll, scroll lock, backdrop, overlay, modal 신호로 stacking과 scroll behavior를 추적하세요.",
      "role dialog/alertdialog, aria-modal, aria-label, aria-labelledby, aria-describedby, title, description 신호로 accessibility contract를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 portal open, focus movement, inert marking, scroll locking, Escape/outside click, animation은 안전한 테스트 환경에서 별도로 검증하세요."
    ]
  };
}

type DialogReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dialogReadinessSourceFiles(walk: WalkResult): Promise<DialogReadinessSourceFile[]> {
  const files: DialogReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dialogReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!dialogReadinessPathSignal(file.relPath) && !dialogReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function dialogReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dialogReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml|css)$/i.test(filePath);
}

function dialogReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(dialog|dialogs|modal|modals|overlay|overlays|portal|portals|drawer|sheet|alert[-_ ]?dialog|confirmation|confirm|settings|billing|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function dialogReadinessContentSignal(text: string): boolean {
  return /(@radix-ui\/react-dialog|@radix-ui\/react-alert-dialog|Dialog\.Root|Dialog\.Trigger|Dialog\.Portal|Dialog\.Overlay|Dialog\.Content|AlertDialog|@headlessui\/react|DialogPanel|DialogBackdrop|DialogTitle|CloseButton|@ariakit\/react|DialogProvider|useDialogStore|DialogDisclosure|DialogDismiss|<dialog\b|HTMLDialogElement|showModal\(|role\s*=\s*["']dialog|role\s*=\s*["']alertdialog|aria-modal|aria-labelledby|aria-describedby)/i.test(text);
}

function dialogReadinessSetups(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["dialogSetups"] {
  const rows: DialogReadinessReport["dialogSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /(Dialog\.Trigger|AlertDialog\.Trigger|DialogTrigger|DialogDisclosure|Disclosure|trigger|open dialog|Open .*dialog)/gi);
    const portalCount = countMatches(source.text, /(Dialog\.Portal|AlertDialog\.Portal|Portal|PortalGroup|ForcePortalRoot|portal\s*=|portal:|forceMount|@headlessui\/react|<Dialog\b)/gi);
    const overlayCount = countMatches(source.text, /(Dialog\.Overlay|AlertDialog\.Overlay|DialogBackdrop|Backdrop|Overlay|backdrop|modal overlay|fixed inset-0)/gi);
    const contentCount = countMatches(source.text, /(Dialog\.Content|AlertDialog\.Content|DialogPanel|Dialog\s+store=|<Dialog\b|HTMLDialogElement|<dialog\b|content|panel)/gi);
    const titleDescriptionCount = countMatches(source.text, /(Dialog\.Title|AlertDialog\.Title|DialogTitle|DialogHeading|Dialog\.Description|AlertDialog\.Description|DialogDescription|Description|aria-labelledby|aria-describedby|title|required description)/gi);
    const stateCount = countMatches(source.text, /(open\s*=|open\s*:|defaultOpen|onOpenChange|onClose|setOpen|useState|DialogProvider|useDialogStore|Transition|State\.Open|data-state)/gi);
    const focusCount = countMatches(source.text, /(FocusScope|FocusTrap|initialFocus|onOpenAutoFocus|onCloseAutoFocus|autoFocus|autoFocusOnShow|autoFocusOnHide|finalFocus|RestoreFocus|TabLock|tab lock|inert|useInertOthers|document\.activeElement|focus\()/gi);
    const dismissCount = countMatches(source.text, /(DismissableLayer|onDismiss|Dialog\.Close|AlertDialog\.Cancel|AlertDialog\.Action|CloseButton|DialogDismiss|hideOnEscape|hideOnInteractOutside|useOutsideClick|useEscape|Escape|outside click|onClose|onOpenChange)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']dialog|role\s*=\s*["']alertdialog|aria-modal|aria-label|aria-labelledby|aria-describedby|Dialog\.Title|DialogTitle|DialogHeading|Dialog\.Description|DialogDescription|Description|getByRole|getByLabelText)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|testing-library|user-event|describe\s*\(|it\s*\(|expect\s*\(|getByRole|getByLabelText|userEvent\.keyboard|fireEvent\.keyDown|document\.activeElement|upload-artifact|dialog-traces)/gi);
    const hasSetupSignal = triggerCount + portalCount + overlayCount + contentCount + titleDescriptionCount + stateCount + focusCount + dismissCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      framework: dialogReadinessFramework(source),
      triggerCount,
      portalCount,
      overlayCount,
      contentCount,
      titleDescriptionCount,
      stateCount,
      focusCount,
      dismissCount,
      accessibilityCount,
      testCount,
      readiness: contentCount > 0 && (triggerCount + stateCount > 0) && (portalCount + overlayCount > 0) && focusCount > 0 && dismissCount > 0 && accessibilityCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains triggers ${triggerCount}, portals ${portalCount}, overlays ${overlayCount}, content ${contentCount}, title/description ${titleDescriptionCount}, state ${stateCount}, focus ${focusCount}, dismiss ${dismissCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function dialogReadinessFramework(source: DialogReadinessSourceFile): DialogReadinessReport["dialogSetups"][number]["framework"] {
  if (/@radix-ui\/react-dialog|Dialog\.Root|Dialog\.Trigger|Dialog\.Content/i.test(source.text)) return "radix-dialog";
  if (/@headlessui\/react|DialogPanel|DialogBackdrop|DialogTitle|CloseButton/i.test(source.text)) return "headlessui-dialog";
  if (/@ariakit\/react|DialogProvider|useDialogStore|DialogDisclosure|DialogDismiss/i.test(source.text)) return "ariakit-dialog";
  if (/<dialog\b|HTMLDialogElement|showModal\(|\.close\(\)/.test(source.text)) return "native-dialog";
  if (/dialog|modal|overlay|portal/i.test(source.text) || dialogReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function dialogReadinessFrameworkSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "radix-dialog", pattern: /@radix-ui\/react-dialog|Dialog\.Root|Dialog\.Trigger|Dialog\.Content/i, evidence: "Radix Dialog evidence was detected." },
    { signal: "radix-alert-dialog", pattern: /@radix-ui\/react-alert-dialog|AlertDialog\.Root|AlertDialog\.Action|AlertDialog\.Cancel/i, evidence: "Radix AlertDialog evidence was detected." },
    { signal: "headlessui-dialog", pattern: /@headlessui\/react|DialogPanel|DialogBackdrop|DialogTitle|CloseButton/i, evidence: "Headless UI Dialog evidence was detected." },
    { signal: "ariakit-dialog", pattern: /@ariakit\/react|DialogProvider|useDialogStore|DialogDisclosure|DialogDismiss/i, evidence: "Ariakit Dialog evidence was detected." },
    { signal: "native-dialog", pattern: /<dialog\b|HTMLDialogElement|showModal\(|\.close\(\)/, evidence: "native dialog evidence was detected." },
    { signal: "custom", pattern: /custom modal|modal component|dialog component|role\s*=\s*["']dialog/i, evidence: "custom dialog evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function dialogReadinessStructureSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["structureSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /Dialog\.Root|AlertDialog\.Root|<Dialog\b|DialogProvider|useDialogStore|<dialog\b/i, evidence: "dialog root evidence was detected." },
    { signal: "trigger", pattern: /Dialog\.Trigger|AlertDialog\.Trigger|DialogTrigger|DialogDisclosure|trigger|Open .*dialog/i, evidence: "dialog trigger evidence was detected." },
    { signal: "portal", pattern: /Dialog\.Portal|AlertDialog\.Portal|Portal|PortalGroup|portal\s*=|portal:/i, evidence: "portal evidence was detected." },
    { signal: "overlay", pattern: /Dialog\.Overlay|AlertDialog\.Overlay|Overlay|overlay/i, evidence: "overlay evidence was detected." },
    { signal: "content", pattern: /Dialog\.Content|AlertDialog\.Content|content/i, evidence: "content evidence was detected." },
    { signal: "title", pattern: /Dialog\.Title|AlertDialog\.Title|DialogTitle|DialogHeading|title/i, evidence: "title evidence was detected." },
    { signal: "description", pattern: /Dialog\.Description|AlertDialog\.Description|DialogDescription|Description|aria-describedby/i, evidence: "description evidence was detected." },
    { signal: "close", pattern: /Dialog\.Close|CloseButton|DialogDismiss|AlertDialog\.Cancel|close/i, evidence: "close evidence was detected." },
    { signal: "panel", pattern: /DialogPanel|panel/i, evidence: "panel evidence was detected." },
    { signal: "backdrop", pattern: /DialogBackdrop|Backdrop|backdrop|fixed inset-0/i, evidence: "backdrop evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function dialogReadinessStateSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["stateSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open-prop", pattern: /\bopen\s*=|\bopen\s*:/i, evidence: "open prop evidence was detected." },
    { signal: "default-open", pattern: /defaultOpen/i, evidence: "defaultOpen evidence was detected." },
    { signal: "on-open-change", pattern: /onOpenChange/i, evidence: "onOpenChange evidence was detected." },
    { signal: "on-close", pattern: /onClose/i, evidence: "onClose evidence was detected." },
    { signal: "dialog-provider", pattern: /DialogProvider/i, evidence: "DialogProvider evidence was detected." },
    { signal: "dialog-store", pattern: /useDialogStore|store\s*=/i, evidence: "dialog store evidence was detected." },
    { signal: "controlled-state", pattern: /useState|setOpen|controlled|open,\s*setOpen/i, evidence: "controlled state evidence was detected." },
    { signal: "transition-state", pattern: /Transition|State\.Open|State\.Closed|data-state|openClosed|open-closed/i, evidence: "transition/open-closed state evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function dialogReadinessFocusSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["focusSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["focusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "focus-scope", pattern: /FocusScope|onOpenAutoFocus|onCloseAutoFocus|@radix-ui\/react-dialog/i, evidence: "focus scope evidence was detected." },
    { signal: "focus-trap", pattern: /FocusTrap|initialFocus|autoFocus|@headlessui\/react|TabLock/i, evidence: "focus trap evidence was detected." },
    { signal: "initial-focus", pattern: /initialFocus|onOpenAutoFocus|autoFocusOnShow|autoFocus/i, evidence: "initial focus evidence was detected." },
    { signal: "restore-focus", pattern: /RestoreFocus|onCloseAutoFocus|autoFocusOnHide|finalFocus|restore focus/i, evidence: "restore focus evidence was detected." },
    { signal: "auto-focus", pattern: /autoFocus|autoFocusOnShow|autoFocusOnHide|onOpenAutoFocus/i, evidence: "auto focus evidence was detected." },
    { signal: "final-focus", pattern: /finalFocus|onCloseAutoFocus|restore focus/i, evidence: "final focus evidence was detected." },
    { signal: "tab-lock", pattern: /TabLock|\{Tab\}|userEvent\.keyboard\([^)]*Tab|fireEvent\.keyDown[^)]*Tab|tab flow/i, evidence: "tab lock/test evidence was detected." },
    { signal: "inert-others", pattern: /useInertOthers|aria-modal|inert|modal\b/i, evidence: "inert/modal sibling evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "focus", "signal");
}

function dialogReadinessDismissalSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["dismissalSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["dismissalSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dismissable-layer", pattern: /DismissableLayer|@radix-ui\/react-dialog|Dialog\.Close/i, evidence: "dismissable layer evidence was detected." },
    { signal: "outside-click", pattern: /useOutsideClick|hideOnInteractOutside|onInteractOutside|outside click|interact outside/i, evidence: "outside click evidence was detected." },
    { signal: "escape-key", pattern: /useEscape|hideOnEscape|Escape|\{Escape\}|key:\s*["']Escape/i, evidence: "Escape key evidence was detected." },
    { signal: "close-button", pattern: /Dialog\.Close|CloseButton|close button|aria-label=["'][^"']*Close/i, evidence: "close button evidence was detected." },
    { signal: "dialog-dismiss", pattern: /DialogDismiss|AlertDialog\.Cancel|AlertDialog\.Action/i, evidence: "dialog dismiss evidence was detected." },
    { signal: "hide-on-escape", pattern: /hideOnEscape/i, evidence: "hideOnEscape evidence was detected." },
    { signal: "hide-on-interact-outside", pattern: /hideOnInteractOutside/i, evidence: "hideOnInteractOutside evidence was detected." },
    { signal: "on-dismiss", pattern: /onDismiss|onClose|onOpenChange|setOpen\(false\)/i, evidence: "dismiss callback evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "dismissal", "signal");
}

function dialogReadinessPortalOverlaySignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["portalOverlaySignals"] {
  const specs: Array<{ signal: DialogReadinessReport["portalOverlaySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "portal", pattern: /Dialog\.Portal|AlertDialog\.Portal|Portal|portal\s*=|portal:/i, evidence: "portal evidence was detected." },
    { signal: "portal-group", pattern: /PortalGroup|Dialog\.Portal|AlertDialog\.Portal/i, evidence: "portal group evidence was detected." },
    { signal: "force-portal-root", pattern: /ForcePortalRoot|forceMount|force portal/i, evidence: "force portal/root evidence was detected." },
    { signal: "remove-scroll", pattern: /RemoveScroll|react-remove-scroll|preventBodyScroll/i, evidence: "RemoveScroll/prevent body scroll evidence was detected." },
    { signal: "scroll-lock", pattern: /scroll lock|ScrollLock|preventBodyScroll|RemoveScroll|overflow-hidden/i, evidence: "scroll lock evidence was detected." },
    { signal: "backdrop", pattern: /DialogBackdrop|Backdrop|backdrop|fixed inset-0/i, evidence: "backdrop evidence was detected." },
    { signal: "overlay", pattern: /Dialog\.Overlay|AlertDialog\.Overlay|Overlay|overlay/i, evidence: "overlay evidence was detected." },
    { signal: "modal", pattern: /modal\b|aria-modal|role\s*=\s*["']alertdialog/i, evidence: "modal evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "portal-overlay", "signal");
}

function dialogReadinessAccessibilitySignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: DialogReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-dialog", pattern: /role\s*=\s*["']dialog|role:\s*["']dialog|Dialog\.Content|<Dialog\b/i, evidence: "role dialog evidence was detected." },
    { signal: "role-alertdialog", pattern: /role\s*=\s*["']alertdialog|role:\s*["']alertdialog|AlertDialog/i, evidence: "role alertdialog evidence was detected." },
    { signal: "aria-modal", pattern: /aria-modal|modal\b|role\s*=\s*["']alertdialog/i, evidence: "aria-modal/modal evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby|Dialog\.Title|AlertDialog\.Title|DialogTitle|DialogHeading/i, evidence: "aria-labelledby/title evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby|Dialog\.Description|AlertDialog\.Description|DialogDescription|Description/i, evidence: "aria-describedby/description evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|getByLabelText/i, evidence: "aria-label evidence was detected." },
    { signal: "title-required", pattern: /Dialog\.Title|AlertDialog\.Title|DialogTitle|DialogHeading|title required/i, evidence: "title requirement evidence was detected." },
    { signal: "description-warning", pattern: /Dialog\.Description|AlertDialog\.Description|DialogDescription|Description|aria-describedby=\{undefined\}|description warning/i, evidence: "description warning/description evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function dialogReadinessAnimationSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["animationSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["animationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "transition", pattern: /Transition|transition|enter=|leave=/i, evidence: "transition evidence was detected." },
    { signal: "transition-child", pattern: /Transition\.Child|TransitionChild|Transition.Child/i, evidence: "transition child evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "force-mount", pattern: /forceMount|force-mount/i, evidence: "forceMount evidence was detected." },
    { signal: "open-closed-state", pattern: /open-closed|openClosed|State\.Open|State\.Closed|data-state/i, evidence: "open/closed state evidence was detected." },
    { signal: "mounted-state", pattern: /mounted|forceMount|static|unmount/i, evidence: "mounted/static state evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "animation", "signal");
}

function dialogReadinessImplementationSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "server-handoff", pattern: /useServerHandoffComplete|server handoff/i, evidence: "server handoff readiness evidence was detected." },
    { signal: "nested-portals", pattern: /useNestedPortals|nested portals|PortalWrapper/i, evidence: "nested portal evidence was detected." },
    { signal: "root-containers", pattern: /useRootContainers|resolveRootContainers|resolveContainers|defaultContainers/i, evidence: "root container resolution evidence was detected." },
    { signal: "main-tree-provider", pattern: /MainTreeProvider|useMainTreeNode|mainTreeNode/i, evidence: "main tree provider evidence was detected." },
    { signal: "inert-others", pattern: /useInertOthers|inertOthersEnabled|inert siblings/i, evidence: "inert siblings evidence was detected." },
    { signal: "stack-machine", pattern: /stackMachines|get\(null\)|actions\.push|actions\.pop/i, evidence: "dialog stack machine evidence was detected." },
    { signal: "top-layer", pattern: /isTopLayer|selectors\.isTop|current top layer/i, evidence: "top-layer guard evidence was detected." },
    { signal: "outside-click", pattern: /useOutsideClick|outside click|onPointerDownOutside|hideOnInteractOutside/i, evidence: "outside-click dismissal evidence was detected." },
    { signal: "escape-close", pattern: /useEscape|Escape|escape close|hideOnEscape/i, evidence: "Escape dismissal evidence was detected." },
    { signal: "escape-blur-active-element", pattern: /activeElement[\s\S]{0,120}\.blur\(|document\.activeElement[\s\S]{0,140}blur/i, evidence: "Escape activeElement blur evidence was detected." },
    { signal: "scroll-lock", pattern: /useScrollLock|scrollLockEnabled|lockScroll|preventBodyScroll|RemoveScroll/i, evidence: "scroll lock evidence was detected." },
    { signal: "disappear-close", pattern: /useOnDisappear|on disappear|becomes hidden/i, evidence: "close-on-disappear evidence was detected." },
    { signal: "description-provider", pattern: /useDescriptions|DescriptionProvider|describedby/i, evidence: "description provider evidence was detected." },
    { signal: "focus-trap-features", pattern: /FocusTrapFeatures|features=\{focusTrapFeatures\}|focusTrapFeatures/i, evidence: "FocusTrapFeatures evidence was detected." },
    { signal: "focus-trap-none", pattern: /FocusTrapFeatures\.None|features\s*=\s*FocusTrapFeatures\.None|features === FocusTrapFeatures\.None/i, evidence: "FocusTrapFeatures.None evidence was detected." },
    { signal: "focus-lock", pattern: /FocusTrapFeatures\.FocusLock|\bFocusLock\b|focus lock/i, evidence: "FocusLock feature evidence was detected." },
    { signal: "focus-trap-props", pattern: /initialFocusFallback|features\?:\s*FocusTrapFeatures|containers\?:|<FocusTrap[\s\S]{0,180}(initialFocus|features|containers)/i, evidence: "FocusTrap props evidence was detected." },
    { signal: "resolve-containers", pattern: /function\s+resolveContainers|resolveContainers\(|allContainers/i, evidence: "focus trap container resolution evidence was detected." },
    { signal: "sync-refs", pattern: /useSyncRefs|focusTrapRef/i, evidence: "focus trap ref sync evidence was detected." },
    { signal: "owner-document", pattern: /useOwnerDocument|ownerDocument/i, evidence: "focus trap owner document evidence was detected." },
    { signal: "restore-element-history", pattern: /useRestoreElement|history\.slice|localHistory/i, evidence: "focus restore history evidence was detected." },
    { signal: "restore-focus-hook", pattern: /useRestoreFocus/i, evidence: "useRestoreFocus hook evidence was detected." },
    { signal: "initial-focus-hook", pattern: /useInitialFocus/i, evidence: "useInitialFocus hook evidence was detected." },
    { signal: "initial-focus-fallback", pattern: /initialFocusFallback/i, evidence: "initial focus fallback evidence was detected." },
    { signal: "focus-lock-hook", pattern: /useFocusLock/i, evidence: "useFocusLock hook evidence was detected." },
    { signal: "tab-direction", pattern: /useTabDirection|TabDirection|direction\.current/i, evidence: "tab direction evidence was detected." },
    { signal: "hidden-focus-guards", pattern: /<Hidden[\s\S]{0,180}data-headlessui-focus-guard|data-headlessui-focus-guard/i, evidence: "hidden focus guard evidence was detected." },
    { signal: "focus-guard-dataset", pattern: /dataset\.headlessuiFocusGuard|data-headlessui-focus-guard/i, evidence: "focus guard dataset evidence was detected." },
    { signal: "focusable-hidden", pattern: /HiddenFeatures\.Focusable|features=\{HiddenFeatures\.Focusable\}/i, evidence: "HiddenFeatures.Focusable evidence was detected." },
    { signal: "microtask-focus", pattern: /microTask[\s\S]{0,180}(focusIn|focusElement)|process\.env\.NODE_ENV === ['"]test['"][\s\S]{0,160}microTask/i, evidence: "microtask-delayed focus evidence was detected." },
    { signal: "focus-in-first-last", pattern: /focusIn[\s\S]{0,160}Focus\.First[\s\S]{0,220}focusIn[\s\S]{0,160}Focus\.Last|Focus\.First[\s\S]{0,220}Focus\.Last/i, evidence: "first/last focusIn evidence was detected." },
    { signal: "focus-next-previous-wrap", pattern: /Focus\.Next[\s\S]{0,220}Focus\.Previous[\s\S]{0,220}Focus\.WrapAround|Focus\.Previous[\s\S]{0,220}Focus\.WrapAround|Focus\.Next[\s\S]{0,220}Focus\.WrapAround/i, evidence: "next/previous wrap-around focus evidence was detected." },
    { signal: "recent-tab-key", pattern: /recentlyUsedTabKey/i, evidence: "recent Tab key tracking evidence was detected." },
    { signal: "disposables-raf", pattern: /useDisposables|requestAnimationFrame/i, evidence: "disposable requestAnimationFrame evidence was detected." },
    { signal: "blur-focus-lock", pattern: /onBlur[\s\S]{0,220}FocusTrapFeatures\.FocusLock|handleBlur[\s\S]{0,220}FocusTrapFeatures\.FocusLock|FocusLock[\s\S]{0,220}onBlur|blur[\s\S]{0,160}focus lock/i, evidence: "blur focus-lock evidence was detected." },
    { signal: "event-listener", pattern: /useEventListener[\s\S]{0,120}['"]focus['"]|addEventListener[\s\S]{0,120}['"]focus['"]/i, evidence: "focus event listener evidence was detected." },
    { signal: "contains-containers", pattern: /function\s+contains[\s\S]{0,220}container\.contains|contains\(allContainers|contains\(containers/i, evidence: "container contains guard evidence was detected." },
    { signal: "focus-trap-object-assign", pattern: /Object\.assign\(FocusTrapRoot[\s\S]{0,120}FocusTrapFeatures|features:\s*FocusTrapFeatures/i, evidence: "FocusTrap Object.assign feature export evidence was detected." },
    { signal: "restore-focus", pattern: /FocusTrapFeatures\.RestoreFocus|RestoreFocus|restore focus/i, evidence: "restore focus feature evidence was detected." },
    { signal: "tab-lock", pattern: /FocusTrapFeatures\.TabLock|TabLock|tab lock/i, evidence: "tab lock feature evidence was detected." },
    { signal: "auto-focus", pattern: /FocusTrapFeatures\.AutoFocus|autoFocus/i, evidence: "auto focus feature evidence was detected." },
    { signal: "initial-focus", pattern: /FocusTrapFeatures\.InitialFocus|initialFocus|initialFocusFallback/i, evidence: "initial focus feature evidence was detected." },
    { signal: "force-portal-root", pattern: /ForcePortalRoot|force portal root/i, evidence: "force portal root evidence was detected." },
    { signal: "portal-group", pattern: /PortalGroup|target=\{internalDialogRef\}|target=\{panelRef\}/i, evidence: "portal group target evidence was detected." },
    { signal: "close-provider", pattern: /CloseProvider|value=\{close\}|close provider/i, evidence: "close provider evidence was detected." },
    { signal: "reset-open-closed-provider", pattern: /ResetOpenClosedProvider/i, evidence: "ResetOpenClosedProvider evidence was detected." },
    { signal: "open-closed-context", pattern: /useOpenClosed|State\.Open|State\.Closed|open closed state/i, evidence: "open/closed context evidence was detected." },
    { signal: "closing-state", pattern: /State\.Closing|isClosing|Closing/i, evidence: "closing-state evidence was detected." },
    { signal: "role-validation", pattern: /didWarnOnRole|Invalid role|role === ['"]dialog['"][\s\S]{0,120}role === ['"]alertdialog['"]|role fallback/i, evidence: "role validation evidence was detected." },
    { signal: "controlled-prop-validation", pattern: /forgot an [`'"]open[`'"] prop|forgot an [`'"]onClose[`'"] prop|value is not a boolean|value is not a function|hasOpen|hasOnClose/i, evidence: "controlled prop validation evidence was detected." },
    { signal: "aria-modal-open", pattern: /aria-modal[\s\S]{0,120}Open|aria-modal[\s\S]{0,120}open|dialogState === DialogStates\.Open|aria-modal=\{open/i, evidence: "open-state aria-modal evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby|titleId/i, evidence: "aria-labelledby/title id evidence was detected." },
    { signal: "aria-describedby", pattern: /aria-describedby|describedby/i, evidence: "aria-describedby evidence was detected." },
    { signal: "tab-index-minus-one", pattern: /tabIndex:\s*-1|tabIndex=\{-1\}/i, evidence: "tabIndex -1 evidence was detected." },
    { signal: "panel-stop-propagation", pattern: /stopPropagation\(\)|Panel[\s\S]{0,220}onClick/i, evidence: "panel click propagation guard evidence was detected." },
    { signal: "backdrop-aria-hidden", pattern: /aria-hidden[\s\S]{0,80}true|DialogBackdrop[\s\S]{0,120}aria-hidden/i, evidence: "backdrop aria-hidden evidence was detected." },
    { signal: "title-registration", pattern: /setTitleId|ActionTypes\.SetTitleId|useEffect\([\s\S]{0,160}setTitleId/i, evidence: "dialog title registration evidence was detected." },
    { signal: "transition-wrapper", pattern: /TransitionChild|Transition show|transition=\{?transition|transition wrapper/i, evidence: "transition wrapper evidence was detected." },
    { signal: "render-strategy-static", pattern: /RenderFeatures\.RenderStrategy|RenderFeatures\.Static|\bstatic\b|\bunmount\b/i, evidence: "render strategy/static/unmount evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function dialogReadinessTestSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["testSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|from ["']vitest["']/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /playwright|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /cypress/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /testing-library|@testing-library\/react|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "role-test", pattern: /getByRole\(["']dialog|getByRole\(["']alertdialog|getByRole/i, evidence: "role test evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|fireEvent\.keyDown|Escape|\{Escape\}|\{Tab\}|key:\s*["']Escape/i, evidence: "keyboard test evidence was detected." },
    { signal: "focus-test", pattern: /document\.activeElement|toHaveFocus|focus\(|initialFocus|restore focus/i, evidence: "focus test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|dialog-traces|trace|screenshot/i, evidence: "artifact upload evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function dialogReadinessPackageSignals(sourceFiles: DialogReadinessSourceFile[]): DialogReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DialogReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@radix-ui/react-dialog", pattern: /["@']@radix-ui\/react-dialog["@']|from ["']@radix-ui\/react-dialog["']/i, evidence: "@radix-ui/react-dialog package evidence was detected." },
    { signal: "@radix-ui/react-alert-dialog", pattern: /["@']@radix-ui\/react-alert-dialog["@']|from ["']@radix-ui\/react-alert-dialog["']/i, evidence: "@radix-ui/react-alert-dialog package evidence was detected." },
    { signal: "@headlessui/react", pattern: /["@']@headlessui\/react["@']|from ["']@headlessui\/react["']/i, evidence: "@headlessui/react package evidence was detected." },
    { signal: "@ariakit/react", pattern: /["@']@ariakit\/react["@']|from ["']@ariakit\/react["']/i, evidence: "@ariakit/react package evidence was detected." },
    { signal: "react", pattern: /["@']react["@']|from ["']react["']/i, evidence: "React package evidence was detected." }
  ];
  return dialogReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dialogReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DialogReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/dialog-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
