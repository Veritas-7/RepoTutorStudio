import { z } from "zod";

export const PdfGenerationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pdfGenerationSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["pdf-lib", "pdfkit", "react-pdf", "pdfmake", "jspdf", "custom", "unknown"]),
    documentCount: z.number().int().nonnegative(),
    pageCount: z.number().int().nonnegative(),
    assetCount: z.number().int().nonnegative(),
    formCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  documentSignals: z.array(z.object({
    signal: z.enum(["create-document", "load-document", "copy-pages", "metadata", "attachments", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pageSignals: z.array(z.object({
    signal: z.enum(["add-page", "page-size", "draw-text", "draw-image", "draw-shapes", "coordinates", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  assetSignals: z.array(z.object({
    signal: z.enum(["standard-fonts", "custom-fontkit", "embed-font", "embed-png", "embed-jpg", "colors", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formSignals: z.array(z.object({
    signal: z.enum(["get-form", "text-field", "checkbox-radio", "dropdown-option", "flatten", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["save-bytes", "save-base64", "data-uri", "write-file", "download", "stream", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["input-bytes", "encrypted-pdf", "font-embedding", "large-page-count", "metadata-policy", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["pdf-lib", "pdfkit", "@react-pdf/renderer", "pdfmake", "jspdf", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SpreadsheetReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  spreadsheetSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["sheetjs", "exceljs", "papaparse", "node-csv", "csv-stringify", "custom", "unknown"]),
    workbookCount: z.number().int().nonnegative(),
    sheetCount: z.number().int().nonnegative(),
    inputCount: z.number().int().nonnegative(),
    transformCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  workbookSignals: z.array(z.object({
    signal: z.enum(["workbook-create", "workbook-read", "workbook-write", "multi-sheet", "workbook-metadata", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sheetSignals: z.array(z.object({
    signal: z.enum(["json-to-sheet", "aoa-to-sheet", "table-to-sheet", "sheet-to-json", "sheet-add-json", "range-encode-decode", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  formatSignals: z.array(z.object({
    signal: z.enum(["xlsx", "csv", "ods", "html", "json", "array-buffer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  inputSignals: z.array(z.object({
    signal: z.enum(["read-file", "upload-buffer", "array-buffer", "html-table", "stream-input", "remote-fetch", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["write-file", "download", "buffer-output", "base64-output", "stream-output", "csv-stringify", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["formula-injection", "large-workbook", "date-parsing", "encoding", "cell-type-policy", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["xlsx", "exceljs", "papaparse", "csv-parse", "csv-stringify", "node-csv", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const ChartVisualizationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  chartSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["chartjs", "recharts", "echarts", "d3", "visx", "nivo", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    dataCount: z.number().int().nonnegative(),
    scaleCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    lifecycleCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  chartTypeSignals: z.array(z.object({
    signal: z.enum(["bar", "line", "pie-doughnut", "scatter-bubble", "radar-polar", "mixed", "area", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["labels", "datasets", "series", "object-data", "parsing", "stacking", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  scaleSignals: z.array(z.object({
    signal: z.enum(["category", "linear", "time", "logarithmic", "radial", "multi-axis", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["tooltip", "legend", "hover", "click", "zoom-pan", "html-legend", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["canvas", "svg", "responsive", "animation", "layout", "export-image", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  lifecycleSignals: z.array(z.object({
    signal: z.enum(["create", "update", "resize", "destroy", "plugin-hook", "registry", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  safetySignals: z.array(z.object({
    signal: z.enum(["large-dataset", "decimation", "parsing-policy", "accessibility-label", "ssr-guard", "error-handling", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["chart.js", "recharts", "echarts", "d3", "visx", "nivo", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MarkdownCodeRenderingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  markdownCodeRenderingSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["react-markdown", "shiki", "prism", "highlightjs", "mdx", "custom", "unknown"]),
    rendererCount: z.number().int().nonnegative(),
    parserCount: z.number().int().nonnegative(),
    highlightCount: z.number().int().nonnegative(),
    pluginCount: z.number().int().nonnegative(),
    securityCount: z.number().int().nonnegative(),
    themeCount: z.number().int().nonnegative(),
    accessibilityCount: z.number().int().nonnegative(),
    testCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  rendererSignals: z.array(z.object({
    signal: z.enum(["react-markdown", "markdown-hooks", "components-map", "code-component", "pre-code", "mdx-provider", "custom-renderer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  parserSignals: z.array(z.object({
    signal: z.enum(["remark-plugins", "remark-gfm", "remark-rehype", "rehype-plugins", "rehype-raw", "frontmatter", "mdx", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  highlightSignals: z.array(z.object({
    signal: z.enum(["shiki-code-to-html", "create-highlighter", "code-to-tokens", "prism-highlight", "highlight-element", "language-class", "token-stream", "highlightjs-highlight", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  pluginSignals: z.array(z.object({
    signal: z.enum(["rehype-sanitize", "transformers", "line-numbers", "copy-to-clipboard", "toolbar", "show-language", "math-katex", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["skip-html", "allowed-elements", "disallowed-elements", "url-transform", "rehype-sanitize", "raw-html-risk", "xss", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  themeSignals: z.array(z.object({
    signal: z.enum(["theme", "themes", "bundled-themes", "langs", "bundled-languages", "css-theme", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  accessibilitySignals: z.array(z.object({
    signal: z.enum(["pre-code", "aria-label", "tabindex", "keyboard", "copy-button", "screen-reader", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["vitest", "playwright", "testing-library", "snapshot-test", "security-test", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["react-markdown", "remark-gfm", "rehype-raw", "rehype-sanitize", "shiki", "@shikijs/transformers", "prismjs", "@mdx-js/react", "highlight.js", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const NotebookReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  notebookSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["jupyter", "marimo", "quarto", "jupytext", "custom", "unknown"]),
    cellCount: z.number().int().nonnegative(),
    codeCellCount: z.number().int().nonnegative(),
    markdownCellCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    kernelCount: z.number().int().nonnegative(),
    executionCount: z.number().int().nonnegative(),
    dependencyCount: z.number().int().nonnegative(),
    interactivityCount: z.number().int().nonnegative(),
    exportCount: z.number().int().nonnegative(),
    reproducibilityCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["jupyter", "marimo", "quarto", "jupytext", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  fileSignals: z.array(z.object({
    signal: z.enum(["ipynb", "py-percent", "marimo-py", "qmd", "quarto-project", "binder", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  kernelSignals: z.array(z.object({
    signal: z.enum(["kernelspec", "language-info", "jupyter-kernel", "quarto-jupyter", "python-kernel", "r-kernel", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  executionSignals: z.array(z.object({
    signal: z.enum(["execute-count", "nbconvert-execute", "papermill", "quarto-execute", "marimo-run", "cell-order", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dependencySignals: z.array(z.object({
    signal: z.enum(["notebook", "jupyterlab", "nbconvert", "nbformat", "papermill", "jupytext", "marimo", "quarto", "ipywidgets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactivitySignals: z.array(z.object({
    signal: z.enum(["ipywidgets", "display", "plot-output", "marimo-ui", "marimo-markdown", "quarto-widget", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  exportSignals: z.array(z.object({
    signal: z.enum(["html-export", "pdf-export", "nbconvert", "marimo-export", "quarto-render", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  reproducibilitySignals: z.array(z.object({
    signal: z.enum(["jupytext", "binder", "freeze", "cache", "parameters", "outputs", "deterministic-cells", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "nbconvert", "papermill", "marimo-export", "quarto-render", "artifact-upload", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["notebook", "jupyterlab", "nbconvert", "nbformat", "papermill", "jupytext", "marimo", "quarto", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const MapVisualizationReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  mapSetups: z.array(z.object({
    filePath: z.string(),
    platform: z.enum(["maplibre", "leaflet", "deck-gl", "google-maps", "mapbox", "custom", "unknown"]),
    mapCount: z.number().int().nonnegative(),
    tileCount: z.number().int().nonnegative(),
    layerCount: z.number().int().nonnegative(),
    sourceCount: z.number().int().nonnegative(),
    viewportCount: z.number().int().nonnegative(),
    markerCount: z.number().int().nonnegative(),
    geometryCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    controlCount: z.number().int().nonnegative(),
    styleCount: z.number().int().nonnegative(),
    tokenCount: z.number().int().nonnegative(),
    workflowCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  platformSignals: z.array(z.object({
    signal: z.enum(["maplibre", "leaflet", "deck-gl", "google-maps", "mapbox", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  containerSignals: z.array(z.object({
    signal: z.enum(["container", "canvas", "map-div", "webgl-context", "react-component", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  tileSignals: z.array(z.object({
    signal: z.enum(["tile-url", "vector-tile", "raster-tile", "tilejson", "osm", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layerSignals: z.array(z.object({
    signal: z.enum(["geojson-layer", "marker-layer", "symbol-layer", "fill-line-layer", "deck-layer", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  deckGlSignals: z.array(z.object({
    signal: z.enum(["deck-instance", "deckgl-react", "map-view", "initial-view-state", "controlled-view-state", "controller", "picking", "tooltip", "layer-filter", "geojson-layer", "scatterplot-layer", "arc-layer", "path-layer", "polygon-layer", "text-layer", "icon-layer", "tile-layer", "mvt-layer", "terrain-layer", "heatmap-layer", "hexagon-layer", "grid-layer", "screen-grid-layer", "data-filter-extension", "brushing-extension", "path-style-extension", "mask-extension", "mapbox-overlay", "google-maps-overlay", "arcgis-overlay", "widgets", "test-utils"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  dataSignals: z.array(z.object({
    signal: z.enum(["geojson", "coordinates", "feature-properties", "mvt", "bounds-data", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  viewportSignals: z.array(z.object({
    signal: z.enum(["center-zoom", "bounds", "deck-view-state", "pitch-bearing", "fit-bounds", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  interactionSignals: z.array(z.object({
    signal: z.enum(["click", "hover-pick", "popup", "tooltip", "feature-query", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  controlSignals: z.array(z.object({
    signal: z.enum(["navigation", "geolocation", "layer-control", "scale", "attribution-control", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  styleSignals: z.array(z.object({
    signal: z.enum(["style-json", "paint-layout", "attribution", "css", "icon-sprite", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  workflowSignals: z.array(z.object({
    signal: z.enum(["github-actions", "playwright", "visual-regression", "artifact-upload", "lint", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["maplibre-gl", "leaflet", "deck.gl", "@deck.gl/core", "@deck.gl/layers", "@deck.gl/geo-layers", "react-map-gl", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DiagramRenderingReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  diagramSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["mermaid", "plantuml", "kroki", "markmap", "graphviz", "custom", "unknown"]),
    syntaxCount: z.number().int().nonnegative(),
    renderCount: z.number().int().nonnegative(),
    themeCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    interactionCount: z.number().int().nonnegative(),
    safetyCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  diagramTypeSignals: z.array(z.object({
    signal: z.enum(["flowchart", "sequence", "class", "state", "er", "gantt", "mindmap", "architecture", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  renderSignals: z.array(z.object({
    signal: z.enum(["initialize", "run", "render", "parse", "svg-output", "bind-functions", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  themeSignals: z.array(z.object({
    signal: z.enum(["theme", "theme-variables", "theme-css", "dark-mode", "font-family", "html-labels", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  securitySignals: z.array(z.object({
    signal: z.enum(["security-level", "strict-mode", "sandbox", "sanitize", "dompurify", "external-links", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  layoutSignals: z.array(z.object({
    signal: z.enum(["use-max-width", "viewbox", "elk", "dagre", "tidy-tree", "responsive-svg", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["svg", "iframe", "download", "live-editor", "snapshot-test", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["mermaid", "plantuml", "kroki", "markmap", "graphviz", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const LinkIntegrityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  linkSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["lychee", "markdown-link-check", "broken-link-checker", "linkinator", "html-proofer", "custom", "unknown"]),
    targetCount: z.number().int().nonnegative(),
    extractionCount: z.number().int().nonnegative(),
    policyCount: z.number().int().nonnegative(),
    networkCount: z.number().int().nonnegative(),
    outputCount: z.number().int().nonnegative(),
    ciCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  targetSignals: z.array(z.object({
    signal: z.enum(["markdown", "html", "restructuredtext", "website", "mail", "sitemap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  policySignals: z.array(z.object({
    signal: z.enum(["accept-status", "exclude", "include", "scheme", "private-network", "fragments", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  networkSignals: z.array(z.object({
    signal: z.enum(["timeout", "retry", "user-agent", "headers", "github-token", "offline", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  outputSignals: z.array(z.object({
    signal: z.enum(["json", "markdown-report", "junit", "summary", "dump", "cache", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  ciSignals: z.array(z.object({
    signal: z.enum(["github-action", "docker", "nix", "precommit", "script", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["lychee", "markdown-link-check", "broken-link-checker", "linkinator", "html-proofer", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const SeoMetadataReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  seoSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["nuxt-seo", "next-seo", "unhead", "astro-seo", "custom", "unknown"]),
    crawlCount: z.number().int().nonnegative(),
    sitemapCount: z.number().int().nonnegative(),
    metadataCount: z.number().int().nonnegative(),
    structuredDataCount: z.number().int().nonnegative(),
    socialCount: z.number().int().nonnegative(),
    aiCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  crawlSignals: z.array(z.object({
    signal: z.enum(["robots-txt", "meta-robots", "x-robots-tag", "indexable", "noindex", "crawler-rules", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  sitemapSignals: z.array(z.object({
    signal: z.enum(["sitemap-xml", "sitemap-index", "route-sources", "lastmod", "hreflang", "robots-sitemap", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  metadataSignals: z.array(z.object({
    signal: z.enum(["title", "description", "canonical", "open-graph", "twitter-card", "favicon", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  structuredDataSignals: z.array(z.object({
    signal: z.enum(["json-ld", "schema-org", "breadcrumbs", "article", "product", "faq", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  aiReadinessSignals: z.array(z.object({
    signal: z.enum(["aeo", "llms-txt", "markdown-endpoint", "ai-crawlers", "agent-readability", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["nuxt-seo", "nuxt-robots", "nuxt-sitemap", "nuxt-schema-org", "nuxt-og-image", "seo-utils", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const PwaReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  pwaSetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["vite-plugin-pwa", "workbox", "next-pwa", "nuxt-pwa", "custom", "unknown"]),
    manifestCount: z.number().int().nonnegative(),
    serviceWorkerCount: z.number().int().nonnegative(),
    cachingCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    installCount: z.number().int().nonnegative(),
    runtimeCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  manifestSignals: z.array(z.object({
    signal: z.enum(["webmanifest", "icons", "theme-color", "start-url", "display", "scope", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  serviceWorkerSignals: z.array(z.object({
    signal: z.enum(["register", "generate-sw", "inject-manifest", "custom-sw", "sw-scope", "self-destroying", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  cachingSignals: z.array(z.object({
    signal: z.enum(["precache", "runtime-caching", "glob-patterns", "maximum-file-size", "cache-first", "network-first", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["auto-update", "prompt-update", "skip-waiting", "clients-claim", "need-refresh", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  installSignals: z.array(z.object({
    signal: z.enum(["offline-ready", "install-prompt", "beforeinstallprompt", "use-credentials", "shortcuts", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["vite-plugin-pwa", "workbox", "workbox-window", "next-pwa", "nuxt-pwa", "custom", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BrowserCompatibilityReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  compatibilitySetups: z.array(z.object({
    filePath: z.string(),
    provider: z.enum(["browserslist", "autoprefixer", "babel-preset-env", "postcss-preset-env", "eslint-plugin-compat", "custom", "unknown"]),
    configCount: z.number().int().nonnegative(),
    queryCount: z.number().int().nonnegative(),
    coverageCount: z.number().int().nonnegative(),
    envCount: z.number().int().nonnegative(),
    updateCount: z.number().int().nonnegative(),
    featureCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configSignals: z.array(z.object({
    signal: z.enum(["package-json", "browserslistrc", "browserslist-file", "env-config", "shareable-config", "env-var", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  querySignals: z.array(z.object({
    signal: z.enum(["defaults", "last-versions", "usage-threshold", "not-dead", "coverage", "maintained-node", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  coverageSignals: z.array(z.object({
    signal: z.enum(["global-coverage", "regional-coverage", "custom-stats", "stats-file", "mobile-to-desktop", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  featureSignals: z.array(z.object({
    signal: z.enum(["supports-feature", "es-modules", "baseline", "dead-browsers", "unreleased", "electron", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  updateSignals: z.array(z.object({
    signal: z.enum(["caniuse-lite", "update-browserslist-db", "old-data-warning", "ignore-old-data", "update-action", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["browserslist", "caniuse-lite", "autoprefixer", "@babel/preset-env", "postcss-preset-env", "eslint-plugin-compat", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const BrowserExtensionReadinessReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  extensionSetups: z.array(z.object({
    filePath: z.string(),
    framework: z.enum(["wxt", "plasmo", "crxjs", "manifest", "webextension-polyfill", "custom", "unknown"]),
    manifestCount: z.number().int().nonnegative(),
    entrypointCount: z.number().int().nonnegative(),
    permissionCount: z.number().int().nonnegative(),
    hostPermissionCount: z.number().int().nonnegative(),
    messagingCount: z.number().int().nonnegative(),
    storageCount: z.number().int().nonnegative(),
    uiSurfaceCount: z.number().int().nonnegative(),
    buildCount: z.number().int().nonnegative(),
    publishCount: z.number().int().nonnegative(),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  manifestSignals: z.array(z.object({
    signal: z.enum(["manifest-v3", "manifest-v2", "manifest-json", "generated-manifest", "wxt-config", "plasmo-config", "crxjs-plugin", "browser-targets", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  entrypointSignals: z.array(z.object({
    signal: z.enum(["background", "service-worker", "content-script", "popup", "options", "side-panel", "devtools", "offscreen", "newtab", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  permissionSignals: z.array(z.object({
    signal: z.enum(["permissions", "host-permissions", "optional-permissions", "optional-host-permissions", "active-tab", "scripting", "storage", "declarative-net-request", "web-accessible-resources", "content-security-policy", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  messagingSignals: z.array(z.object({
    signal: z.enum(["chrome-runtime", "browser-runtime", "send-message", "runtime-connect", "tabs-message", "plasmo-messaging", "wxt-messaging", "webextension-polyfill", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  buildSignals: z.array(z.object({
    signal: z.enum(["wxt-build", "plasmo-build", "vite-crx", "web-ext", "zip-artifact", "watch-dev", "hmr", "typescript", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  publishSignals: z.array(z.object({
    signal: z.enum(["chrome-web-store", "firefox-addons", "edge-addons", "plasmo-bpp", "wxt-submit", "web-ext-sign", "release-action", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  packageSignals: z.array(z.object({
    signal: z.enum(["wxt", "plasmo", "@crxjs/vite-plugin", "webextension-polyfill", "@types/chrome", "chrome-types", "web-ext", "extension-api", "unknown"]),
    readiness: z.enum(["ready", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export type PdfGenerationReadinessReport = z.infer<typeof PdfGenerationReadinessReportSchema>;
export type SpreadsheetReadinessReport = z.infer<typeof SpreadsheetReadinessReportSchema>;
export type ChartVisualizationReadinessReport = z.infer<typeof ChartVisualizationReadinessReportSchema>;
export type MarkdownCodeRenderingReadinessReport = z.infer<typeof MarkdownCodeRenderingReadinessReportSchema>;
export type NotebookReadinessReport = z.infer<typeof NotebookReadinessReportSchema>;
export type MapVisualizationReadinessReport = z.infer<typeof MapVisualizationReadinessReportSchema>;
export type DiagramRenderingReadinessReport = z.infer<typeof DiagramRenderingReadinessReportSchema>;
export type LinkIntegrityReadinessReport = z.infer<typeof LinkIntegrityReadinessReportSchema>;
export type SeoMetadataReadinessReport = z.infer<typeof SeoMetadataReadinessReportSchema>;
export type PwaReadinessReport = z.infer<typeof PwaReadinessReportSchema>;
export type BrowserCompatibilityReadinessReport = z.infer<typeof BrowserCompatibilityReadinessReportSchema>;
export type BrowserExtensionReadinessReport = z.infer<typeof BrowserExtensionReadinessReportSchema>;
