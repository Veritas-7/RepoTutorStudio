import type { ChartVisualizationReadinessReport, PdfGenerationReadinessReport, SpreadsheetReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildPdfGenerationReadinessReport(walk: WalkResult): Promise<PdfGenerationReadinessReport> {
  const sourceFiles = await pdfGenerationReadinessSourceFiles(walk);
  const pdfGenerationSetups = pdfGenerationReadinessSetups(sourceFiles);
  const documentSignals = pdfGenerationReadinessDocumentSignals(sourceFiles);
  const pageSignals = pdfGenerationReadinessPageSignals(sourceFiles);
  const assetSignals = pdfGenerationReadinessAssetSignals(sourceFiles);
  const formSignals = pdfGenerationReadinessFormSignals(sourceFiles);
  const outputSignals = pdfGenerationReadinessOutputSignals(sourceFiles);
  const safetySignals = pdfGenerationReadinessSafetySignals(sourceFiles);
  const packageSignals = pdfGenerationReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasPdfLibPackage = packageSignals.some((item) => item.signal === "pdf-lib" && item.readiness === "ready");
  const hasSetup = pdfGenerationSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = pdfGenerationSetups.some((item) => item.readiness === "ready");
  const hasPages = pageSignals.some((item) => item.readiness === "ready") || pdfGenerationSetups.some((item) => item.pageCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || pdfGenerationSetups.some((item) => item.outputCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || pdfGenerationSetups.some((item) => item.safetyCount > 0);
  const hasAssets = assetSignals.some((item) => item.readiness === "ready") || pdfGenerationSetups.some((item) => item.assetCount > 0);

  const riskQueue: PdfGenerationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the PDF generation strategy before claiming document export readiness.",
      why: "PDF generation readiness starts with explicit document creation/loading, page drawing, asset embedding, form handling, output, or package evidence.",
      relatedHref: "html/pdf-generation-readiness.html"
    });
  }
  if (hasPdfLibPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair pdf-lib package evidence with concrete PDFDocument.create/load, page, drawText/drawImage, embed, form, and save call sites.",
      why: "A PDF dependency alone does not prove that generated documents, assets, forms, and output bytes are wired.",
      relatedHref: "html/pdf-generation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasPages) {
    riskQueue.push({
      priority: "high",
      action: "Add page creation, page sizing, text/image drawing, shape drawing, or coordinate-system documentation.",
      why: "Generated PDFs need visible page composition before they can be treated as user-facing exports.",
      relatedHref: "html/pdf-generation-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasOutput) {
    riskQueue.push({
      priority: "high",
      action: "Add save, base64/data URI, file write, download, or stream output handling.",
      why: "PDF generation is incomplete until the bytes are returned, written, streamed, or downloaded intentionally.",
      relatedHref: "html/pdf-generation-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Review input bytes, encryption, metadata, font embedding, large document limits, and error handling.",
      why: "PDF code commonly handles user-provided bytes, embedded assets, metadata, and large files that need explicit boundaries.",
      relatedHref: "html/pdf-generation-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasAssets) {
    riskQueue.push({
      priority: "medium",
      action: "Document font, image, color, and asset embedding choices for generated PDFs.",
      why: "Exports become hard to reproduce when fonts, images, color spaces, or embedded asset policies are implicit.",
      relatedHref: "html/pdf-generation-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative PDF generation tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records PDF generation readiness only; it does not parse PDFs, render pages, embed fonts/images, modify form fields, write files, trigger downloads, or run the analyzed project's tests.",
    relatedHref: "html/pdf-generation-readiness.html"
  });

  return {
    summary: `pdf-lib-style PDF generation readiness report: setup ${pdfGenerationSetups.length}개, document signal ${documentSignals.length}개, page signal ${pageSignals.length}개, output signal ${outputSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "pdf-lib PDFDocument create load addPage drawText drawImage embedFont embedPng embedJpg getForm createTextField setText copyPages save saveAsBase64",
    pdfGenerationSetups,
    documentSignals,
    pageSignals,
    assetSignals,
    formSignals,
    outputSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"PDFDocument|pdf-lib|pdfkit|@react-pdf/renderer|pdfmake|jsPDF\" src app packages", purpose: "Inventory PDF generators, renderers, and package-level document export entry points." },
      { command: "rg \"create\\(|load\\(|copyPages|addPage|drawText|drawImage|drawRectangle|PageSizes\" src app packages", purpose: "Review document construction, page composition, drawing, page sizing, and copy-page flows." },
      { command: "rg \"embedFont|StandardFonts|registerFontkit|embedPng|embedJpg|rgb\\(|grayscale\" src app packages", purpose: "Check font, image, color, and asset embedding policy." },
      { command: "rg \"getForm|createTextField|getTextField|setText|createCheckBox|createRadioGroup|flatten\" src app packages", purpose: "Check AcroForm field access, mutation, and flattening behavior." },
      { command: "rg \"save\\(|saveAsBase64|dataUri|writeFile|download|createWriteStream|pipe\\(\" src app packages", purpose: "Confirm output byte, base64, file, browser download, or stream handling." },
      { command: "npx vitest run", purpose: "Run local tests that cover generated PDF bytes, pages, embedded assets, form fields, output paths, and failure handling." }
    ],
    learnerNextSteps: [
      "먼저 PDFDocument.create/load, pdfkit, @react-pdf/renderer, pdfmake, jsPDF 경로를 찾아 PDF 생성 책임이 있는 파일을 분리하세요.",
      "addPage, PageSizes, drawText, drawImage, drawRectangle 같은 신호로 page composition과 좌표계를 확인하세요.",
      "embedFont, StandardFonts, registerFontkit, embedPng, embedJpg, rgb 신호로 font/image/color 자산 정책을 확인하세요.",
      "getForm, createTextField, setText, flatten 신호가 있다면 form field 변경과 flatten 여부를 별도로 확인하세요.",
      "save, saveAsBase64, data URI, writeFile, download, stream 신호로 생성된 PDF bytes가 어디로 나가는지 추적하세요.",
      "이 리포트는 정적 readiness입니다. 실제 PDF 파싱, 렌더링, 폰트/이미지 임베딩, form field 변경, 파일 쓰기/다운로드는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type PdfGenerationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function pdfGenerationReadinessSourceFiles(walk: WalkResult): Promise<PdfGenerationReadinessSourceFile[]> {
  const files: PdfGenerationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !pdfGenerationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!pdfGenerationReadinessPathSignal(file.relPath) && !pdfGenerationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function pdfGenerationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return pdfGenerationReadinessPathSignal(filePath)
    || /^(package\.json|pdf\.[cm]?[jt]sx?|pdfs\.[cm]?[jt]sx?|document\.[cm]?[jt]sx?|documents\.[cm]?[jt]sx?|export\.[cm]?[jt]sx?|exports\.[cm]?[jt]sx?|print\.[cm]?[jt]sx?|certificate\.[cm]?[jt]sx?|report\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function pdfGenerationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(pdf|pdfs|document|documents|export|exports|print|report|reports|certificate|certificates|invoice|invoices|receipt|receipts|form|forms)(\/|\.|-|_|$)/i.test(filePath);
}

function pdfGenerationReadinessContentSignal(text: string): boolean {
  return /(PDFDocument|pdf-lib|PDFKit|@react-pdf\/renderer|pdfmake|pdfMake|jsPDF|addPage|drawText|drawImage|embedFont|embedPng|embedJpg|saveAsBase64|getForm|createTextField|copyPages)/i.test(text);
}

function pdfGenerationReadinessSetups(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["pdfGenerationSetups"] {
  const rows: PdfGenerationReadinessReport["pdfGenerationSetups"] = [];
  for (const source of sourceFiles) {
    const documentCount = countMatches(source.text, /PDFDocument\.create|PDFDocument\.load|new PDFDocument|new jsPDF|pdfMake\.createPdf|<Document\b|Document\s*\(|copyPages/gi);
    const pageCount = countMatches(source.text, /addPage|insertPage|drawPage|page\.draw|drawText|drawImage|drawRectangle|drawLine|PageSizes|setSize|getPages|removePage|width|height|x:|y:/gi);
    const assetCount = countMatches(source.text, /embedFont|embedPng|embedJpg|registerFontkit|StandardFonts|rgb\s*\(|grayscale|cmyk|drawImage|fontkit/gi);
    const formCount = countMatches(source.text, /getForm|createTextField|getTextField|setText|createCheckBox|createRadioGroup|createDropdown|addOptionToDropdown|flatten/gi);
    const outputCount = countMatches(source.text, /save\s*\(|saveAsBase64|dataUri|data URI|writeFile|download|createWriteStream|pipe\s*\(|toBuffer|arrayBuffer/gi);
    const safetyCount = countMatches(source.text, /encrypted|ignoreEncryption|updateMetadata|setTitle|setAuthor|parseSpeed|throw|catch\s*\(|try\s*\{|large page|pageCount|fontkit|Uint8Array|ArrayBuffer/gi);
    const hasSetupSignal = documentCount + pageCount + assetCount + formCount + outputCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: pdfGenerationReadinessProvider(source),
      documentCount,
      pageCount,
      assetCount,
      formCount,
      outputCount,
      safetyCount,
      readiness: documentCount > 0 && pageCount > 0 && outputCount > 0 && (assetCount > 0 || formCount > 0 || safetyCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains document ${documentCount}, page ${pageCount}, asset ${assetCount}, form ${formCount}, output ${outputCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function pdfGenerationReadinessProvider(source: PdfGenerationReadinessSourceFile): PdfGenerationReadinessReport["pdfGenerationSetups"][number]["provider"] {
  if (/pdf-lib|PDFDocument\.create|PDFDocument\.load|embedFont|embedPng|embedJpg|saveAsBase64/i.test(source.text)) return "pdf-lib";
  if (/pdfkit|PDFKit|new PDFDocument/i.test(source.text)) return "pdfkit";
  if (/@react-pdf\/renderer|<Document\b|<Page\b/i.test(source.text)) return "react-pdf";
  if (/pdfmake|pdfMake|createPdf/i.test(source.text)) return "pdfmake";
  if (/jspdf|jsPDF|new jsPDF/i.test(source.text)) return "jspdf";
  if (/pdf|document export|print/i.test(source.text)) return "custom";
  return "unknown";
}

function pdfGenerationReadinessDocumentSignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["documentSignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["documentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-document", pattern: /PDFDocument\.create|new PDFDocument|new jsPDF|pdfMake\.createPdf|<Document\b|Document\s*\(/i, evidence: "PDF document creation evidence was detected." },
    { signal: "load-document", pattern: /PDFDocument\.load|loadPdf|fromBytes|ArrayBuffer|Uint8Array/i, evidence: "existing PDF load/input bytes evidence was detected." },
    { signal: "copy-pages", pattern: /copyPages|embedPage|drawPage/i, evidence: "copy or embed pages evidence was detected." },
    { signal: "metadata", pattern: /setTitle|setAuthor|setSubject|setKeywords|setProducer|setCreator|updateMetadata/i, evidence: "metadata policy evidence was detected." },
    { signal: "attachments", pattern: /attach|attachment|embedFile|fileAttachment/i, evidence: "attachment evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "document", "signal");
}

function pdfGenerationReadinessPageSignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["pageSignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["pageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "add-page", pattern: /addPage|insertPage|<Page\b/i, evidence: "page creation evidence was detected." },
    { signal: "page-size", pattern: /PageSizes|setSize|getWidth|getHeight|width\s*:|height\s*:/i, evidence: "page size evidence was detected." },
    { signal: "draw-text", pattern: /drawText|<Text\b|fontSize|lineHeight/i, evidence: "text drawing evidence was detected." },
    { signal: "draw-image", pattern: /drawImage|<Image\b|embedPng|embedJpg/i, evidence: "image drawing evidence was detected." },
    { signal: "draw-shapes", pattern: /drawRectangle|drawLine|drawCircle|drawEllipse|drawSvgPath/i, evidence: "shape drawing evidence was detected." },
    { signal: "coordinates", pattern: /\bx\s*:|\by\s*:|moveTo|translate|rotate|degrees\s*\(|scale\s*\(/i, evidence: "coordinate or transform evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "page", "signal");
}

function pdfGenerationReadinessAssetSignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["assetSignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["assetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "standard-fonts", pattern: /StandardFonts|Helvetica|TimesRoman|Courier/i, evidence: "standard font evidence was detected." },
    { signal: "custom-fontkit", pattern: /registerFontkit|fontkit|custom font/i, evidence: "custom fontkit evidence was detected." },
    { signal: "embed-font", pattern: /embedFont|font\s*:/i, evidence: "font embedding evidence was detected." },
    { signal: "embed-png", pattern: /embedPng|\.png|image\/png/i, evidence: "PNG embedding evidence was detected." },
    { signal: "embed-jpg", pattern: /embedJpg|embedJpeg|\.jpe?g|image\/jpeg/i, evidence: "JPEG embedding evidence was detected." },
    { signal: "colors", pattern: /rgb\s*\(|grayscale|cmyk|color\s*:/i, evidence: "color evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "asset", "signal");
}

function pdfGenerationReadinessFormSignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["formSignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "get-form", pattern: /getForm|getFields|getField/i, evidence: "form access evidence was detected." },
    { signal: "text-field", pattern: /createTextField|getTextField|setText/i, evidence: "text field evidence was detected." },
    { signal: "checkbox-radio", pattern: /createCheckBox|getCheckBox|createRadioGroup|getRadioGroup|check\s*\(|select\s*\(/i, evidence: "checkbox or radio evidence was detected." },
    { signal: "dropdown-option", pattern: /createDropdown|getDropdown|createOptionList|addOptionToDropdown|select\s*\(/i, evidence: "dropdown or option list evidence was detected." },
    { signal: "flatten", pattern: /flatten\s*\(|updateFieldAppearances/i, evidence: "form flatten/appearance evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function pdfGenerationReadinessOutputSignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["outputSignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "save-bytes", pattern: /save\s*\(|toBuffer|arrayBuffer|Uint8Array/i, evidence: "save bytes evidence was detected." },
    { signal: "save-base64", pattern: /saveAsBase64|base64/i, evidence: "base64 output evidence was detected." },
    { signal: "data-uri", pattern: /dataUri|data URI|data:application\/pdf/i, evidence: "data URI output evidence was detected." },
    { signal: "write-file", pattern: /writeFile|writeFileSync|Deno\.writeFile/i, evidence: "file write evidence was detected." },
    { signal: "download", pattern: /download|createObjectURL|Blob|saveAs\s*\(|anchor\.click/i, evidence: "browser download evidence was detected." },
    { signal: "stream", pattern: /createWriteStream|pipe\s*\(|Readable|stream/i, evidence: "stream output evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function pdfGenerationReadinessSafetySignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["safetySignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "input-bytes", pattern: /Uint8Array|ArrayBuffer|Buffer\.from|readFile|fetch\s*\(/i, evidence: "input bytes evidence was detected." },
    { signal: "encrypted-pdf", pattern: /encrypted|ignoreEncryption|password|ownerPassword|userPassword/i, evidence: "encrypted PDF handling evidence was detected." },
    { signal: "font-embedding", pattern: /registerFontkit|fontkit|embedFont|subset/i, evidence: "font embedding boundary evidence was detected." },
    { signal: "large-page-count", pattern: /pageCount|getPageCount|getPages|large page|limit|maxPages/i, evidence: "large document/page count evidence was detected." },
    { signal: "metadata-policy", pattern: /updateMetadata|setTitle|setAuthor|setCreator|setProducer|metadata/i, evidence: "metadata policy evidence was detected." },
    { signal: "error-handling", pattern: /try\s*\{|catch\s*\(|throw new Error|onError|reject\s*\(/i, evidence: "error handling evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function pdfGenerationReadinessPackageSignals(sourceFiles: PdfGenerationReadinessSourceFile[]): PdfGenerationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PdfGenerationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pdf-lib", pattern: /"pdf-lib"|from ['"]pdf-lib|require\(['"]pdf-lib|PDFDocument\.create|PDFDocument\.load/i, evidence: "pdf-lib package/import evidence was detected." },
    { signal: "pdfkit", pattern: /"pdfkit"|from ['"]pdfkit|require\(['"]pdfkit|new PDFDocument/i, evidence: "PDFKit package/import evidence was detected." },
    { signal: "@react-pdf/renderer", pattern: /"@react-pdf\/renderer"|from ['"]@react-pdf\/renderer|<Document\b|<Page\b/i, evidence: "React PDF renderer evidence was detected." },
    { signal: "pdfmake", pattern: /"pdfmake"|from ['"]pdfmake|require\(['"]pdfmake|pdfMake|createPdf/i, evidence: "pdfmake package/import evidence was detected." },
    { signal: "jspdf", pattern: /"jspdf"|from ['"]jspdf|require\(['"]jspdf|jsPDF|new jsPDF/i, evidence: "jsPDF package/import evidence was detected." }
  ];
  return pdfGenerationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function pdfGenerationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PdfGenerationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/pdf-generation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSpreadsheetReadinessReport(walk: WalkResult): Promise<SpreadsheetReadinessReport> {
  const sourceFiles = await spreadsheetReadinessSourceFiles(walk);
  const spreadsheetSetups = spreadsheetReadinessSetups(sourceFiles);
  const workbookSignals = spreadsheetReadinessWorkbookSignals(sourceFiles);
  const sheetSignals = spreadsheetReadinessSheetSignals(sourceFiles);
  const formatSignals = spreadsheetReadinessFormatSignals(sourceFiles);
  const inputSignals = spreadsheetReadinessInputSignals(sourceFiles);
  const outputSignals = spreadsheetReadinessOutputSignals(sourceFiles);
  const safetySignals = spreadsheetReadinessSafetySignals(sourceFiles);
  const packageSignals = spreadsheetReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSheetJsPackage = packageSignals.some((item) => item.signal === "xlsx" && item.readiness === "ready");
  const hasSetup = spreadsheetSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = spreadsheetSetups.some((item) => item.readiness === "ready");
  const hasInput = inputSignals.some((item) => item.readiness === "ready") || spreadsheetSetups.some((item) => item.inputCount > 0);
  const hasTransform = sheetSignals.some((item) => item.readiness === "ready") || spreadsheetSetups.some((item) => item.transformCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || spreadsheetSetups.some((item) => item.outputCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || spreadsheetSetups.some((item) => item.safetyCount > 0);

  const riskQueue: SpreadsheetReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the spreadsheet/CSV import-export strategy before claiming table export readiness.",
      why: "Spreadsheet readiness starts with explicit workbook, sheet, input, transform, output, or package evidence.",
      relatedHref: "html/spreadsheet-readiness.html"
    });
  }
  if (hasSheetJsPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair SheetJS package evidence with concrete read/write, workbook, sheet transform, and output call sites.",
      why: "An xlsx dependency alone does not prove that workbook inputs, sheet conversion, and exported bytes are wired.",
      relatedHref: "html/spreadsheet-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasInput) {
    riskQueue.push({
      priority: "high",
      action: "Add readFile, XLSX.read, upload buffer, table input, stream input, or remote fetch handling.",
      why: "Spreadsheet workflows need an explicit source of workbook or CSV data before analysis or export can be trusted.",
      relatedHref: "html/spreadsheet-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasTransform) {
    riskQueue.push({
      priority: "medium",
      action: "Add json_to_sheet, aoa_to_sheet, table_to_sheet, sheet_to_json, append, or range conversion evidence.",
      why: "Workbook code is hard to audit when row/column conversion, sheet appending, and range handling are implicit.",
      relatedHref: "html/spreadsheet-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasOutput) {
    riskQueue.push({
      priority: "high",
      action: "Add writeFile, XLSX.write, writeBuffer, download, Blob, base64, stream, or CSV stringify output handling.",
      why: "Spreadsheet export is incomplete until workbook or CSV bytes are intentionally returned, written, streamed, or downloaded.",
      relatedHref: "html/spreadsheet-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Review formula injection, large workbook limits, date parsing, encoding, cell types, and error handling.",
      why: "Spreadsheet files can carry formulas, dates, encodings, very large row sets, and user-provided cell values.",
      relatedHref: "html/spreadsheet-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative spreadsheet/CSV tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records spreadsheet readiness only; it does not open spreadsheet files, parse workbooks, evaluate formulas, convert tables, stream rows, write files, trigger downloads, or run the analyzed project's tests.",
    relatedHref: "html/spreadsheet-readiness.html"
  });

  return {
    summary: `SheetJS-style spreadsheet readiness report: setup ${spreadsheetSetups.length}개, workbook signal ${workbookSignals.length}개, sheet signal ${sheetSignals.length}개, output signal ${outputSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "SheetJS XLSX readFile writeFile read write book_new book_append_sheet json_to_sheet sheet_to_json aoa_to_sheet table_to_sheet CSV workbook worksheet",
    spreadsheetSetups,
    workbookSignals,
    sheetSignals,
    formatSignals,
    inputSignals,
    outputSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"XLSX|SheetJS|ExcelJS|PapaParse|csv-parse|csv-stringify|Workbook|Worksheet\" src app packages", purpose: "Inventory spreadsheet, workbook, CSV parser, and table export providers." },
      { command: "rg \"readFile|XLSX\\.read|arrayBuffer|FileReader|createReadStream|fetch\\(\" src app packages", purpose: "Review workbook and CSV input sources, including uploads, buffers, streams, and remote fetches." },
      { command: "rg \"book_new|book_append_sheet|json_to_sheet|aoa_to_sheet|table_to_sheet|sheet_to_json|sheet_add_json|decode_range|encode_cell\" src app packages", purpose: "Check sheet creation, row conversion, append, and range handling." },
      { command: "rg \"writeFile|XLSX\\.write|writeBuffer|download|createObjectURL|Blob|base64|createWriteStream|pipe\\(\" src app packages", purpose: "Confirm workbook or CSV output byte, browser download, file, stream, and base64 handling." },
      { command: "rg \"formula|escapeFormulae|dateNF|cellDates|raw|defval|encoding|try\\s*\\{|catch\\s*\\(\" src app packages", purpose: "Review formula injection, dates, encoding, cell type policy, defaults, and error handling." },
      { command: "npx vitest run", purpose: "Run local tests that cover workbook/CSV inputs, transforms, output paths, and failure handling." }
    ],
    learnerNextSteps: [
      "먼저 XLSX, SheetJS, ExcelJS, PapaParse, csv-parse, csv-stringify import와 package evidence를 찾아 spreadsheet 책임 파일을 분리하세요.",
      "readFile, XLSX.read, FileReader, arrayBuffer, createReadStream, fetch 신호로 input source와 신뢰 경계를 확인하세요.",
      "book_new, book_append_sheet, json_to_sheet, aoa_to_sheet, table_to_sheet, sheet_to_json 신호로 workbook/sheet 변환 흐름을 확인하세요.",
      "writeFile, XLSX.write, writeBuffer, Blob, createObjectURL, stream 신호로 출력 bytes가 어디로 나가는지 추적하세요.",
      "formula, escapeFormulae, cellDates, dateNF, raw, defval, encoding 신호로 formula injection, 날짜, 인코딩, cell type 정책을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 spreadsheet 파싱, formula 평가, table 변환, stream 처리, 파일 쓰기/다운로드는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type SpreadsheetReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function spreadsheetReadinessSourceFiles(walk: WalkResult): Promise<SpreadsheetReadinessSourceFile[]> {
  const files: SpreadsheetReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !spreadsheetReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!spreadsheetReadinessPathSignal(file.relPath) && !spreadsheetReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function spreadsheetReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return spreadsheetReadinessPathSignal(filePath)
    || /^(spreadsheet\.[cm]?[jt]sx?|spreadsheets\.[cm]?[jt]sx?|sheet\.[cm]?[jt]sx?|sheets\.[cm]?[jt]sx?|workbook\.[cm]?[jt]sx?|workbooks\.[cm]?[jt]sx?|csv\.[cm]?[jt]sx?|export\.[cm]?[jt]sx?|exports\.[cm]?[jt]sx?|table\.[cm]?[jt]sx?|tables\.[cm]?[jt]sx?|report\.[cm]?[jt]sx?|reports\.[cm]?[jt]sx?|package\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function spreadsheetReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(spreadsheet|spreadsheets|sheet|sheets|workbook|workbooks|csv|xlsx|excel|export|exports|table|tables|report|reports)(\/|\.|-|_|$)/i.test(filePath);
}

function spreadsheetReadinessContentSignal(text: string): boolean {
  return /(XLSX|SheetJS|readFile|writeFile|book_new|book_append_sheet|json_to_sheet|sheet_to_json|aoa_to_sheet|table_to_sheet|sheet_add_json|sheet_add_aoa|ExcelJS|Workbook|Worksheet|Papa|PapaParse|csv-parse|csv-stringify)/i.test(text);
}

function spreadsheetReadinessSetups(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["spreadsheetSetups"] {
  const rows: SpreadsheetReadinessReport["spreadsheetSetups"] = [];
  for (const source of sourceFiles) {
    const workbookCount = countMatches(source.text, /XLSX\.read|XLSX\.write|readFile|writeFile|book_new|new Workbook|workbook|Workbook/gi);
    const sheetCount = countMatches(source.text, /book_append_sheet|json_to_sheet|aoa_to_sheet|table_to_sheet|sheet_to_json|sheet_add_json|sheet_add_aoa|worksheet|Worksheet|decode_range|encode_range/gi);
    const inputCount = countMatches(source.text, /readFile|XLSX\.read|arrayBuffer|ArrayBuffer|Buffer\.from|FileReader|table_to_sheet|fetch\s*\(|createReadStream|parse\s*\(/gi);
    const transformCount = countMatches(source.text, /json_to_sheet|sheet_to_json|aoa_to_sheet|sheet_add_json|sheet_add_aoa|decode_range|encode_cell|encode_range|cellDates|raw:|header:/gi);
    const outputCount = countMatches(source.text, /writeFile|XLSX\.write|writeBuffer|download|createObjectURL|Blob|base64|createWriteStream|pipe\s*\(|stringify/gi);
    const safetyCount = countMatches(source.text, /formula|escapeFormulae|cellDates|dateNF|raw|defval|encoding|codepage|try\s*\{|catch\s*\(|throw/gi);
    const hasSetupSignal = workbookCount + sheetCount + inputCount + transformCount + outputCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: spreadsheetReadinessProvider(source),
      workbookCount,
      sheetCount,
      inputCount,
      transformCount,
      outputCount,
      safetyCount,
      readiness: workbookCount > 0 && sheetCount > 0 && inputCount > 0 && outputCount > 0 && (transformCount > 0 || safetyCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains workbook ${workbookCount}, sheet ${sheetCount}, input ${inputCount}, transform ${transformCount}, output ${outputCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function spreadsheetReadinessProvider(source: SpreadsheetReadinessSourceFile): SpreadsheetReadinessReport["spreadsheetSetups"][number]["provider"] {
  if (/xlsx|SheetJS|XLSX\.|book_new|json_to_sheet/i.test(source.text)) return "sheetjs";
  if (/exceljs|new Workbook|Workbook|Worksheet/i.test(source.text)) return "exceljs";
  if (/Papa|PapaParse|papaparse/i.test(source.text)) return "papaparse";
  if (/csv-stringify|stringify/i.test(source.text)) return "csv-stringify";
  if (/csv-parse|node-csv/i.test(source.text)) return "node-csv";
  if (/csv|spreadsheet|workbook|worksheet|export/i.test(source.text)) return "custom";
  return "unknown";
}

function spreadsheetReadinessWorkbookSignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["workbookSignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["workbookSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "workbook-create", pattern: /book_new|new Workbook|Workbook\s*\(|XLSX\.utils\.book_new/i, evidence: "workbook creation evidence was detected." },
    { signal: "workbook-read", pattern: /XLSX\.read|readFile|workbook\.xlsx\.read|workbook\.csv\.read/i, evidence: "workbook read evidence was detected." },
    { signal: "workbook-write", pattern: /XLSX\.write|writeFile|writeBuffer|workbook\.xlsx\.write|workbook\.csv\.write/i, evidence: "workbook write evidence was detected." },
    { signal: "multi-sheet", pattern: /book_append_sheet|SheetNames|Worksheets|addWorksheet|worksheets/i, evidence: "multi-sheet evidence was detected." },
    { signal: "workbook-metadata", pattern: /Props|Workbook|creator|created|modified|company|subject/i, evidence: "workbook metadata evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "workbook", "signal");
}

function spreadsheetReadinessSheetSignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["sheetSignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["sheetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "json-to-sheet", pattern: /json_to_sheet/i, evidence: "JSON to sheet conversion evidence was detected." },
    { signal: "aoa-to-sheet", pattern: /aoa_to_sheet/i, evidence: "array-of-arrays to sheet conversion evidence was detected." },
    { signal: "table-to-sheet", pattern: /table_to_sheet|table_to_book|HTMLTableElement/i, evidence: "HTML table to sheet conversion evidence was detected." },
    { signal: "sheet-to-json", pattern: /sheet_to_json/i, evidence: "sheet to JSON conversion evidence was detected." },
    { signal: "sheet-add-json", pattern: /sheet_add_json|sheet_add_aoa|addRow|addRows/i, evidence: "sheet append evidence was detected." },
    { signal: "range-encode-decode", pattern: /decode_range|encode_range|encode_cell|decode_cell|!ref/i, evidence: "range or cell encoding evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "sheet", "signal");
}

function spreadsheetReadinessFormatSignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["formatSignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["formatSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "xlsx", pattern: /\.xlsx|bookType\s*:\s*["']xlsx|XLSX/i, evidence: "XLSX format evidence was detected." },
    { signal: "csv", pattern: /\.csv|bookType\s*:\s*["']csv|CSV|csv-parse|csv-stringify/i, evidence: "CSV format evidence was detected." },
    { signal: "ods", pattern: /\.ods|bookType\s*:\s*["']ods/i, evidence: "ODS format evidence was detected." },
    { signal: "html", pattern: /\.html|bookType\s*:\s*["']html|table_to_sheet|sheet_to_html/i, evidence: "HTML table format evidence was detected." },
    { signal: "json", pattern: /sheet_to_json|json_to_sheet|application\/json|\.json/i, evidence: "JSON row conversion evidence was detected." },
    { signal: "array-buffer", pattern: /ArrayBuffer|arrayBuffer|type\s*:\s*["']array|buffer/i, evidence: "array/buffer format evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "format", "signal");
}

function spreadsheetReadinessInputSignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["inputSignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["inputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "read-file", pattern: /readFile|readFileSync|XLSX\.readFile/i, evidence: "file read input evidence was detected." },
    { signal: "upload-buffer", pattern: /FileReader|files\[|formData|multer|busboy|Buffer\.from/i, evidence: "upload or buffer input evidence was detected." },
    { signal: "array-buffer", pattern: /arrayBuffer|ArrayBuffer|Uint8Array/i, evidence: "array buffer input evidence was detected." },
    { signal: "html-table", pattern: /table_to_sheet|table_to_book|HTMLTableElement|querySelector\(['"]table/i, evidence: "HTML table input evidence was detected." },
    { signal: "stream-input", pattern: /createReadStream|Readable|stream|pipe\s*\(/i, evidence: "stream input evidence was detected." },
    { signal: "remote-fetch", pattern: /fetch\s*\(|axios\.get|got\s*\(|request\s*\(/i, evidence: "remote fetch input evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "input", "signal");
}

function spreadsheetReadinessOutputSignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["outputSignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "write-file", pattern: /writeFile|writeFileSync|XLSX\.writeFile/i, evidence: "file write output evidence was detected." },
    { signal: "download", pattern: /download|createObjectURL|Blob|anchor\.click|saveAs\s*\(/i, evidence: "browser download evidence was detected." },
    { signal: "buffer-output", pattern: /writeBuffer|Buffer\.from|type\s*:\s*["']buffer|arrayBuffer/i, evidence: "buffer output evidence was detected." },
    { signal: "base64-output", pattern: /base64|type\s*:\s*["']base64|data:application\/vnd/i, evidence: "base64 output evidence was detected." },
    { signal: "stream-output", pattern: /createWriteStream|Writable|stream|pipe\s*\(/i, evidence: "stream output evidence was detected." },
    { signal: "csv-stringify", pattern: /csv-stringify|stringify\s*\(|Papa\.unparse/i, evidence: "CSV stringify output evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function spreadsheetReadinessSafetySignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["safetySignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "formula-injection", pattern: /formula|escapeFormulae|sanitizeFormula|^[=+\-@]/im, evidence: "formula injection boundary evidence was detected." },
    { signal: "large-workbook", pattern: /sheetRows|maxRows|rowLimit|limit|large workbook|stream/i, evidence: "large workbook or row limit evidence was detected." },
    { signal: "date-parsing", pattern: /cellDates|dateNF|UTC|Date\(|date1904|numFmt/i, evidence: "date parsing or format evidence was detected." },
    { signal: "encoding", pattern: /encoding|codepage|UTF-8|utf8|delimiter|bom/i, evidence: "encoding or delimiter evidence was detected." },
    { signal: "cell-type-policy", pattern: /raw|defval|blankrows|cellText|cellNF|cellStyles|type\s*:/i, evidence: "cell type or default policy evidence was detected." },
    { signal: "error-handling", pattern: /try\s*\{|catch\s*\(|throw new Error|onError|reject\s*\(/i, evidence: "error handling evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function spreadsheetReadinessPackageSignals(sourceFiles: SpreadsheetReadinessSourceFile[]): SpreadsheetReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SpreadsheetReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "xlsx", pattern: /"xlsx"|from ['"]xlsx|require\(['"]xlsx|XLSX\.utils|SheetJS/i, evidence: "SheetJS xlsx package/import evidence was detected." },
    { signal: "exceljs", pattern: /"exceljs"|from ['"]exceljs|require\(['"]exceljs|new Workbook|ExcelJS/i, evidence: "ExcelJS package/import evidence was detected." },
    { signal: "papaparse", pattern: /"papaparse"|from ['"]papaparse|require\(['"]papaparse|PapaParse|Papa\.parse|Papa\.unparse/i, evidence: "PapaParse package/import evidence was detected." },
    { signal: "csv-parse", pattern: /"csv-parse"|from ['"]csv-parse|require\(['"]csv-parse|parse\s*\(/i, evidence: "csv-parse package/import evidence was detected." },
    { signal: "csv-stringify", pattern: /"csv-stringify"|from ['"]csv-stringify|require\(['"]csv-stringify|stringify\s*\(/i, evidence: "csv-stringify package/import evidence was detected." },
    { signal: "node-csv", pattern: /"csv"|from ['"]csv|require\(['"]csv|node-csv/i, evidence: "node-csv package/import evidence was detected." }
  ];
  return spreadsheetReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function spreadsheetReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SpreadsheetReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/spreadsheet-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildChartVisualizationReadinessReport(walk: WalkResult): Promise<ChartVisualizationReadinessReport> {
  const sourceFiles = await chartVisualizationReadinessSourceFiles(walk);
  const chartSetups = chartVisualizationReadinessSetups(sourceFiles);
  const chartTypeSignals = chartVisualizationReadinessChartTypeSignals(sourceFiles);
  const dataSignals = chartVisualizationReadinessDataSignals(sourceFiles);
  const scaleSignals = chartVisualizationReadinessScaleSignals(sourceFiles);
  const interactionSignals = chartVisualizationReadinessInteractionSignals(sourceFiles);
  const renderSignals = chartVisualizationReadinessRenderSignals(sourceFiles);
  const lifecycleSignals = chartVisualizationReadinessLifecycleSignals(sourceFiles);
  const safetySignals = chartVisualizationReadinessSafetySignals(sourceFiles);
  const packageSignals = chartVisualizationReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasChartJsPackage = packageSignals.some((item) => item.signal === "chart.js" && item.readiness === "ready");
  const hasSetup = chartSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = chartSetups.some((item) => item.readiness === "ready");
  const hasData = dataSignals.some((item) => item.readiness === "ready") || chartSetups.some((item) => item.dataCount > 0);
  const hasRender = renderSignals.some((item) => item.readiness === "ready") || chartSetups.some((item) => item.renderCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || chartSetups.some((item) => item.lifecycleCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || chartSetups.some((item) => item.safetyCount > 0);

  const riskQueue: ChartVisualizationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the chart visualization strategy before claiming analytics/dashboard readiness.",
      why: "Chart readiness starts with explicit chart config, data, scale, render, lifecycle, or package evidence.",
      relatedHref: "html/chart-visualization-readiness.html"
    });
  }
  if (hasChartJsPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Chart.js package evidence with concrete Chart config, data, scale, render, and lifecycle call sites.",
      why: "A chart package alone does not prove that datasets, axes, canvas rendering, updates, and cleanup are wired.",
      relatedHref: "html/chart-visualization-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasData) {
    riskQueue.push({
      priority: "high",
      action: "Add labels, datasets, series, parsing, object data, or stacking evidence.",
      why: "Charts are misleading without explicit data shape and dataset mapping.",
      relatedHref: "html/chart-visualization-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasRender) {
    riskQueue.push({
      priority: "high",
      action: "Add canvas/SVG mounting, responsive layout, animation, or export-image handling.",
      why: "Visualization readiness needs an explicit render target and viewport/export behavior.",
      relatedHref: "html/chart-visualization-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Add update, resize, destroy, plugin hook, or registry lifecycle handling.",
      why: "Charts embedded in apps need updates and cleanup to avoid stale data, memory leaks, and broken resizing.",
      relatedHref: "html/chart-visualization-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Review large dataset limits, decimation, parsing policy, accessibility labels, SSR guards, and error handling.",
      why: "Charting code often handles large datasets, browser-only APIs, and visuals that need accessible fallbacks.",
      relatedHref: "html/chart-visualization-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative chart rendering tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records chart visualization readiness only; it does not render charts, open canvases, measure pixels, execute plugins, export images, mutate DOM, or run the analyzed project's tests.",
    relatedHref: "html/chart-visualization-readiness.html"
  });

  return {
    summary: `Chart.js-style chart visualization readiness report: setup ${chartSetups.length}개, chart type signal ${chartTypeSignals.length}개, data signal ${dataSignals.length}개, render signal ${renderSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Chart.js new Chart Chart.register registerables datasets scales tooltip legend responsive canvas update resize destroy toBase64Image decimation",
    chartSetups,
    chartTypeSignals,
    dataSignals,
    scaleSignals,
    interactionSignals,
    renderSignals,
    lifecycleSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"Chart\\(|new Chart|Chart\\.register|registerables|recharts|echarts|d3|ResponsiveContainer\" src app packages", purpose: "Inventory chart providers, registration, and chart entry points." },
      { command: "rg \"datasets|dataset|series|labels|data:|parsing|stacked\" src app packages", purpose: "Review chart data shape, dataset mapping, parsing, and stacking." },
      { command: "rg \"scales|category|linear|time|logarithmic|radial|xAxis|yAxis\" src app packages", purpose: "Check axes, scales, and multi-axis chart behavior." },
      { command: "rg \"tooltip|legend|hover|onClick|interaction|zoom|pan|htmlLegend\" src app packages", purpose: "Check chart interaction and annotation surfaces." },
      { command: "rg \"canvas|svg|responsive|maintainAspectRatio|animation|toBase64Image|update\\(|resize\\(|destroy\\(\" src app packages", purpose: "Confirm render target, layout, export, and lifecycle handling." },
      { command: "npx vitest run", purpose: "Run local tests that cover chart configs, data mapping, render fallbacks, and lifecycle cleanup." }
    ],
    learnerNextSteps: [
      "먼저 Chart.js, Recharts, ECharts, D3, visx, Nivo import와 chart creation 지점을 찾으세요.",
      "labels, datasets, series, parsing, object data, stacking 신호로 데이터가 시각화에 어떻게 매핑되는지 확인하세요.",
      "scales, category, linear, time, logarithmic, radial, multi-axis 신호로 축과 단위 정책을 확인하세요.",
      "tooltip, legend, hover, click, zoom/pan 신호로 사용자 interaction과 설명 가능성을 확인하세요.",
      "canvas, svg, responsive, animation, toBase64Image, update, resize, destroy 신호로 렌더링과 lifecycle을 추적하세요.",
      "이 리포트는 정적 readiness입니다. 실제 chart 렌더링, canvas pixel 검사, plugin 실행, 이미지 export는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type ChartVisualizationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function chartVisualizationReadinessSourceFiles(walk: WalkResult): Promise<ChartVisualizationReadinessSourceFile[]> {
  const files: ChartVisualizationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !chartVisualizationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!chartVisualizationReadinessPathSignal(file.relPath) && !chartVisualizationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function chartVisualizationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return chartVisualizationReadinessPathSignal(filePath)
    || /^(chart\.[cm]?[jt]sx?|charts\.[cm]?[jt]sx?|graph\.[cm]?[jt]sx?|graphs\.[cm]?[jt]sx?|visualization\.[cm]?[jt]sx?|visualizations\.[cm]?[jt]sx?|dashboard\.[cm]?[jt]sx?|analytics\.[cm]?[jt]sx?|package\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function chartVisualizationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(chart|charts|graph|graphs|visualization|visualizations|dashboard|dashboards|analytics|metric|metrics|plot|plots)(\/|\.|-|_|$)/i.test(filePath);
}

function chartVisualizationReadinessContentSignal(text: string): boolean {
  return /(new Chart|Chart\.register|registerables|datasets|scales|Tooltip|Legend|toBase64Image|ResponsiveContainer|recharts|echarts|d3\.|@visx|nivo)/i.test(text);
}

function chartVisualizationReadinessSetups(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["chartSetups"] {
  const rows: ChartVisualizationReadinessReport["chartSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /new Chart|Chart\s*\(|type\s*:|ChartConfiguration|options\s*:|plugins\s*:|Chart\.register|registerables/gi);
    const dataCount = countMatches(source.text, /labels|datasets|dataset|series|data\s*:|parsing|stacked|ChartData/gi);
    const scaleCount = countMatches(source.text, /scales|scale|category|linear|time|logarithmic|radial|xAxis|yAxis|axis/gi);
    const interactionCount = countMatches(source.text, /tooltip|legend|hover|onClick|click|interaction|zoom|pan|htmlLegend/gi);
    const renderCount = countMatches(source.text, /canvas|svg|responsive|maintainAspectRatio|animation|layout|toBase64Image|render/gi);
    const lifecycleCount = countMatches(source.text, /update\s*\(|resize\s*\(|destroy\s*\(|beforeInit|afterInit|beforeDraw|afterDraw|Chart\.register|unregister/gi);
    const safetyCount = countMatches(source.text, /decimation|threshold|samples|parsing\s*:|aria|role=|accessible|typeof window|window\?|try\s*\{|catch\s*\(|throw/gi);
    const hasSetupSignal = configCount + dataCount + scaleCount + interactionCount + renderCount + lifecycleCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: chartVisualizationReadinessProvider(source),
      configCount,
      dataCount,
      scaleCount,
      interactionCount,
      renderCount,
      lifecycleCount,
      safetyCount,
      readiness: configCount > 0 && dataCount > 0 && renderCount > 0 && (scaleCount > 0 || interactionCount > 0 || lifecycleCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, data ${dataCount}, scale ${scaleCount}, interaction ${interactionCount}, render ${renderCount}, lifecycle ${lifecycleCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function chartVisualizationReadinessProvider(source: ChartVisualizationReadinessSourceFile): ChartVisualizationReadinessReport["chartSetups"][number]["provider"] {
  if (/chart\.js|new Chart|Chart\.register|registerables/i.test(source.text)) return "chartjs";
  if (/recharts|ResponsiveContainer|LineChart|BarChart|PieChart/i.test(source.text)) return "recharts";
  if (/echarts|ECharts|setOption|init\s*\(/i.test(source.text)) return "echarts";
  if (/d3\.|from ['"]d3|require\(['"]d3/i.test(source.text)) return "d3";
  if (/@visx|visx/i.test(source.text)) return "visx";
  if (/nivo|@nivo/i.test(source.text)) return "nivo";
  if (/chart|visualization|dashboard|graph/i.test(source.text)) return "custom";
  return "unknown";
}

function chartVisualizationReadinessChartTypeSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["chartTypeSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["chartTypeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "bar", pattern: /type\s*:\s*['"]bar|BarChart|BarController/i, evidence: "bar chart evidence was detected." },
    { signal: "line", pattern: /type\s*:\s*['"]line|LineChart|LineController/i, evidence: "line chart evidence was detected." },
    { signal: "pie-doughnut", pattern: /type\s*:\s*['"](pie|doughnut)|PieChart|DoughnutController/i, evidence: "pie or doughnut chart evidence was detected." },
    { signal: "scatter-bubble", pattern: /type\s*:\s*['"](scatter|bubble)|ScatterChart|BubbleController/i, evidence: "scatter or bubble chart evidence was detected." },
    { signal: "radar-polar", pattern: /type\s*:\s*['"](radar|polarArea)|RadarChart|PolarAreaController/i, evidence: "radar or polar chart evidence was detected." },
    { signal: "mixed", pattern: /datasets[\s\S]{0,400}type\s*:|mixed chart|ChartTypeRegistry/i, evidence: "mixed chart evidence was detected." },
    { signal: "area", pattern: /fill\s*:|area chart|AreaChart/i, evidence: "area chart evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "chart type", "signal");
}

function chartVisualizationReadinessDataSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["dataSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["dataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "labels", pattern: /labels\s*:|label\s*:/i, evidence: "label mapping evidence was detected." },
    { signal: "datasets", pattern: /datasets|dataset|ChartDataset/i, evidence: "dataset mapping evidence was detected." },
    { signal: "series", pattern: /series|dataKey|values|points/i, evidence: "series mapping evidence was detected." },
    { signal: "object-data", pattern: /\{x\s*:|\{y\s*:|parsing\s*:\s*\{|xAxisKey|yAxisKey/i, evidence: "object data mapping evidence was detected." },
    { signal: "parsing", pattern: /parsing\s*:|parse\s*\(|normalized/i, evidence: "parsing policy evidence was detected." },
    { signal: "stacking", pattern: /stacked|stack\s*:|stackId/i, evidence: "stacking evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "data", "signal");
}

function chartVisualizationReadinessScaleSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["scaleSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["scaleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "category", pattern: /type\s*:\s*['"]category|CategoryScale|XAxis|xAxis/i, evidence: "category scale evidence was detected." },
    { signal: "linear", pattern: /type\s*:\s*['"]linear|LinearScale|YAxis|yAxis/i, evidence: "linear scale evidence was detected." },
    { signal: "time", pattern: /type\s*:\s*['"]time|TimeScale|time\s*:|adapter/i, evidence: "time scale evidence was detected." },
    { signal: "logarithmic", pattern: /type\s*:\s*['"]logarithmic|LogarithmicScale/i, evidence: "logarithmic scale evidence was detected." },
    { signal: "radial", pattern: /radial|RadialLinearScale|rAxis/i, evidence: "radial scale evidence was detected." },
    { signal: "multi-axis", pattern: /yAxisID|xAxisID|axisId|scales\s*:\s*\{[\s\S]{0,300}(x|y)2/i, evidence: "multi-axis evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "scale", "signal");
}

function chartVisualizationReadinessInteractionSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tooltip", pattern: /tooltip|Tooltip/i, evidence: "tooltip evidence was detected." },
    { signal: "legend", pattern: /legend|Legend/i, evidence: "legend evidence was detected." },
    { signal: "hover", pattern: /hover|onHover|activeElements/i, evidence: "hover evidence was detected." },
    { signal: "click", pattern: /onClick|click|setActiveElements|getElementsAtEvent/i, evidence: "click evidence was detected." },
    { signal: "zoom-pan", pattern: /zoom|pan|chartjs-plugin-zoom/i, evidence: "zoom or pan evidence was detected." },
    { signal: "html-legend", pattern: /htmlLegend|generateLabels|legendCallback|setDatasetVisibility/i, evidence: "HTML legend evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function chartVisualizationReadinessRenderSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["renderSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["renderSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "canvas", pattern: /canvas|getContext\(['"]2d|HTMLCanvasElement/i, evidence: "canvas render target evidence was detected." },
    { signal: "svg", pattern: /svg|<svg|SVGElement/i, evidence: "SVG render target evidence was detected." },
    { signal: "responsive", pattern: /responsive|maintainAspectRatio|ResizeObserver|ResponsiveContainer/i, evidence: "responsive layout evidence was detected." },
    { signal: "animation", pattern: /animation|animations|easing|duration/i, evidence: "animation evidence was detected." },
    { signal: "layout", pattern: /layout|padding|chartArea|aspectRatio|width|height/i, evidence: "layout evidence was detected." },
    { signal: "export-image", pattern: /toBase64Image|toDataURL|save image|download/i, evidence: "image export evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "render", "signal");
}

function chartVisualizationReadinessLifecycleSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create", pattern: /new Chart|Chart\s*\(|echarts\.init|<LineChart|<BarChart/i, evidence: "chart creation evidence was detected." },
    { signal: "update", pattern: /\.update\s*\(|setOption|updateOptions/i, evidence: "chart update evidence was detected." },
    { signal: "resize", pattern: /\.resize\s*\(|resizeObserver|onResize|ResponsiveContainer/i, evidence: "chart resize evidence was detected." },
    { signal: "destroy", pattern: /\.destroy\s*\(|dispose\s*\(|cleanup|unmount/i, evidence: "chart destroy cleanup evidence was detected." },
    { signal: "plugin-hook", pattern: /beforeInit|afterInit|beforeDraw|afterDraw|beforeEvent|afterEvent/i, evidence: "plugin hook evidence was detected." },
    { signal: "registry", pattern: /Chart\.register|registerables|Chart\.unregister|Registry/i, evidence: "registry evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function chartVisualizationReadinessSafetySignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "large-dataset", pattern: /large dataset|threshold|samples|dataLimit|maxTicksLimit|normalized/i, evidence: "large dataset boundary evidence was detected." },
    { signal: "decimation", pattern: /decimation|lttb|min-max|sampleSize/i, evidence: "decimation evidence was detected." },
    { signal: "parsing-policy", pattern: /parsing\s*:|normalized|skipNull|spanGaps/i, evidence: "parsing policy evidence was detected." },
    { signal: "accessibility-label", pattern: /aria-label|role=['"]img|figcaption|description|accessible/i, evidence: "accessibility label evidence was detected." },
    { signal: "ssr-guard", pattern: /typeof window|window\?|document\?|useEffect|onMount/i, evidence: "browser-only or SSR guard evidence was detected." },
    { signal: "error-handling", pattern: /try\s*\{|catch\s*\(|throw new Error|onError|fallback/i, evidence: "error handling evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function chartVisualizationReadinessPackageSignals(sourceFiles: ChartVisualizationReadinessSourceFile[]): ChartVisualizationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ChartVisualizationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chart.js", pattern: /"chart\.js"|from ['"]chart\.js|require\(['"]chart\.js|new Chart|Chart\.register/i, evidence: "Chart.js package/import evidence was detected." },
    { signal: "recharts", pattern: /"recharts"|from ['"]recharts|ResponsiveContainer|LineChart|BarChart/i, evidence: "Recharts package/import evidence was detected." },
    { signal: "echarts", pattern: /"echarts"|from ['"]echarts|echarts\.init|setOption/i, evidence: "ECharts package/import evidence was detected." },
    { signal: "d3", pattern: /"d3"|from ['"]d3|require\(['"]d3|d3\./i, evidence: "D3 package/import evidence was detected." },
    { signal: "visx", pattern: /"@visx|from ['"]@visx|visx/i, evidence: "visx package/import evidence was detected." },
    { signal: "nivo", pattern: /"@nivo|from ['"]@nivo|nivo/i, evidence: "Nivo package/import evidence was detected." }
  ];
  return chartVisualizationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function chartVisualizationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ChartVisualizationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/chart-visualization-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
