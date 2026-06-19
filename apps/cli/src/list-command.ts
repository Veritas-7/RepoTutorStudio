import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { listSessions } from "@repotutor/core";
import type { ParsedArgs } from "./args.js";
import { optionalCreatedAtBoundFlag, optionalPositiveIntegerFlag, optionalScoreFlag, optionalStringFlag, stringFlag, verifyListOutputReportPath } from "./flags.js";
import {
  DEFAULT_LIST_CSV_FIELDS,
  LIST_FIELDS,
  LIST_FIELD_PRESETS,
  LIST_FIELD_PRESET_NAMES,
  LIST_FIELD_SET,
  LIST_OUTPUT_MANIFEST_SCHEMA_VERSION,
  type ListField,
  type ListFilterManifest,
  type ListOutputContext,
  type ListOutputManifest,
  type ListOutputVerification,
  type ListRow,
  type ListSummary
} from "./list-types.js";
import { markdownTableCell } from "./markdown-utils.js";
import { openTargetPaths } from "./open-targets.js";
import { htmlTargetStatus, sessionVerificationSummary } from "./session-utils.js";

export async function verifyListOutput(parsed: ParsedArgs): Promise<void> {
  const outputFile = parsed.rest[0];
  if (!outputFile) throw new Error("verify-list-output requires an output file.");
  const outputPath = path.resolve(outputFile);
  const manifestFile = optionalStringFlag(parsed.flags.manifest, "manifest");
  const manifestPath = path.resolve(manifestFile ?? `${outputPath}.manifest.json`);
  const result = await verifyListOutputManifest(outputPath, manifestPath);
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("verify-list-output supports --format json or markdown.");
  const rendered = format === "markdown" ? listOutputVerificationMarkdown(result) : jsonText(result);
  await emitVerifyListOutputReport(rendered, parsed.flags.report, outputPath, format);
  if (!result.ok) process.exitCode = 1;
}

export async function list(parsed: ParsedArgs, studiesRootPath: string): Promise<void> {
  const sessions = await listSessions(studiesRootPath);
  const rows: ListRow[] = await Promise.all(sessions.map(async (session) => {
    const verification = await sessionVerificationSummary(session.outputPaths.root);
    const targetStatus = await htmlTargetStatus(openTargetPaths(session.outputPaths.html));
    const missingHtmlTargets = Object.entries(targetStatus)
      .filter(([, present]) => !present)
      .map(([target]) => target);
    return {
      sessionId: session.sessionId,
      repo: `${session.owner}/${session.repo}`,
      createdAt: session.createdAt,
      mode: session.studyMode,
      level: session.learnerLevel,
      score: session.quizSummary.latestScore,
      wrong: session.quizSummary.wrongCount,
      path: session.outputPaths.root,
      html: path.join(session.outputPaths.html, "index.html"),
      htmlTargetsComplete: missingHtmlTargets.length === 0,
      missingHtmlTargets,
      verificationStatus: verification.status,
      verificationOk: verification.ok,
      verificationReport: verification.reportPath,
      verificationMarkdown: verification.markdownPath,
      verificationHtml: verification.htmlPath,
      verificationCheckedRequiredArtifacts: verification.checkedRequiredArtifacts,
      verificationChecks: verification.checks
    };
  }));
  const repoFilter = optionalStringFlag(parsed.flags.repo, "repo");
  const repoRows = repoFilter ? rows.filter((row) => repoMatches(row.repo, repoFilter)) : rows;
  const createdFrom = optionalCreatedAtBoundFlag(parsed.flags["created-from"], "created-from", "start");
  const createdTo = optionalCreatedAtBoundFlag(parsed.flags["created-to"], "created-to", "end");
  validateCreatedAtRange(createdFrom, createdTo);
  const dateRows = rowsByCreatedAtRange(repoRows, createdFrom, createdTo);
  const level = learnerLevelFlag(parsed.flags.level);
  const levelRows = level === "all" ? dateRows : dateRows.filter((row) => row.level === level);
  const mode = studyModeFlag(parsed.flags.mode);
  const modeRows = mode === "all" ? levelRows : levelRows.filter((row) => row.mode === mode);
  const status = verificationStatusFlag(parsed.flags.status);
  const statusRows = status === "all" ? modeRows : modeRows.filter((row) => row.verificationStatus === status);
  const verifiedRows = parsed.flags["verified-only"] === true ? statusRows.filter((row) => row.verificationOk === true) : statusRows;
  const wrongRows = parsed.flags["wrong-only"] === true ? verifiedRows.filter((row) => row.wrong > 0) : verifiedRows;
  const quizRows = parsed.flags["unattempted-only"] === true
    ? wrongRows.filter((row) => row.score === null)
    : parsed.flags["scored-only"] === true
      ? wrongRows.filter((row) => row.score !== null)
      : wrongRows;
  const minScore = optionalScoreFlag(parsed.flags["min-score"], "min-score");
  const maxScore = optionalScoreFlag(parsed.flags["max-score"], "max-score");
  validateListFilterCombinations(parsed.flags, minScore, maxScore);
  const minScoreRows = minScore === null ? quizRows : quizRows.filter((row) => row.score !== null && row.score >= minScore);
  const scoreRows = maxScore === null ? minScoreRows : minScoreRows.filter((row) => row.score !== null && row.score <= maxScore);
  const htmlTargets = htmlTargetsFlag(parsed.flags["html-targets"]);
  const targetRows = htmlTargets === "all"
    ? scoreRows
    : scoreRows.filter((row) => htmlTargets === "complete" ? row.htmlTargetsComplete : !row.htmlTargetsComplete);
  const sort = listSortFlag(parsed.flags.sort);
  const sortedRows = sort ? sortSessionRows(targetRows, sort) : targetRows;
  const limit = optionalPositiveIntegerFlag(parsed.flags.limit, "limit");
  const filtered = limit === null ? sortedRows : sortedRows.slice(0, limit);
  const format = stringFlag(parsed.flags.format) ?? "json";
  const filters = listFilterManifest(parsed.flags, {
    repo: repoFilter,
    createdFrom: stringFlag(parsed.flags["created-from"]) ?? null,
    createdTo: stringFlag(parsed.flags["created-to"]) ?? null,
    mode,
    level,
    status,
    htmlTargets,
    sort,
    limit,
    minScore,
    maxScore
  });
  if (parsed.flags.summary === true) {
    if (parsed.flags.fields !== undefined || parsed.flags["field-preset"] !== undefined) throw new Error("list cannot combine --summary with --fields or --field-preset.");
    if (!["json", "markdown"].includes(format)) throw new Error("list --summary supports --format json or markdown.");
    const summary = listSummary(filtered);
    await emitListOutput(format === "markdown" ? listSummaryMarkdown(summary) : jsonText(summary), parsed.flags.output, parsed.flags["output-manifest"], {
      format,
      summary: true,
      rows: filtered.length,
      fields: null,
      fieldPreset: null,
      filters
    });
    return;
  }
  const fields = listFieldSelection(parsed.flags.fields, parsed.flags["field-preset"]);
  const outputFields = fields ?? (format === "csv" ? [...DEFAULT_LIST_CSV_FIELDS] : null);
  const projected = fields ? projectListRows(filtered, fields) : filtered;
  if (!["json", "markdown", "jsonl", "csv"].includes(format)) throw new Error("list supports --format json, markdown, jsonl, or csv.");
  let rendered: string;
  if (format === "markdown") {
    rendered = fields ? listFieldsMarkdown(projected, fields) : listMarkdown(filtered);
  } else if (format === "jsonl") {
    rendered = listJsonl(projected);
  } else if (format === "csv") {
    rendered = listCsv(filtered, fields ?? [...DEFAULT_LIST_CSV_FIELDS]);
  } else {
    rendered = jsonText(projected);
  }
  await emitListOutput(rendered, parsed.flags.output, parsed.flags["output-manifest"], {
    format,
    summary: false,
    rows: filtered.length,
    fields: outputFields,
    fieldPreset: stringFlag(parsed.flags["field-preset"]) ?? null,
    filters
  });
}

function listFieldsFlag(value: string | boolean | undefined): ListField[] | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`fields must be a comma-separated list of: ${LIST_FIELDS.join(", ")}.`);
  const selected = value.split(",").map((field) => field.trim()).filter(Boolean);
  const fields: ListField[] = [];
  for (const field of selected) {
    if (!LIST_FIELD_SET.has(field)) throw new Error(`list supports --fields ${LIST_FIELDS.join(", ")}.`);
    if (!fields.includes(field as ListField)) fields.push(field as ListField);
  }
  if (fields.length === 0) throw new Error(`fields must be a comma-separated list of: ${LIST_FIELDS.join(", ")}.`);
  return fields;
}

function listFieldPresetFlag(value: string | boolean | undefined): ListField[] | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`field-preset must be one of: ${LIST_FIELD_PRESET_NAMES.join(", ")}.`);
  if (!LIST_FIELD_PRESET_NAMES.includes(value as keyof typeof LIST_FIELD_PRESETS)) {
    throw new Error(`list supports --field-preset ${LIST_FIELD_PRESET_NAMES.join(", ")}.`);
  }
  return [...LIST_FIELD_PRESETS[value as keyof typeof LIST_FIELD_PRESETS]];
}

function listFieldSelection(fieldsValue: string | boolean | undefined, presetValue: string | boolean | undefined): ListField[] | null {
  const fields = listFieldsFlag(fieldsValue);
  const preset = listFieldPresetFlag(presetValue);
  if (fields && preset) throw new Error("list cannot combine --fields and --field-preset.");
  return fields ?? preset;
}

function projectListRows(rows: ListRow[], fields: ListField[]): Array<Partial<ListRow>> {
  return rows.map((row) => Object.fromEntries(fields.map((field) => [field, row[field]])) as Partial<ListRow>);
}

function validateCreatedAtRange(createdFrom: number | null, createdTo: number | null): void {
  if (createdFrom !== null && createdTo !== null && createdFrom > createdTo) {
    throw new Error("created-from must be less than or equal to created-to.");
  }
}

function rowsByCreatedAtRange<T extends { createdAt: string }>(rows: T[], createdFrom: number | null, createdTo: number | null): T[] {
  if (createdFrom === null && createdTo === null) return rows;
  return rows.filter((row) => {
    const createdAt = Date.parse(row.createdAt);
    if (Number.isNaN(createdAt)) return false;
    if (createdFrom !== null && createdAt < createdFrom) return false;
    if (createdTo !== null && createdAt > createdTo) return false;
    return true;
  });
}

function validateListFilterCombinations(flags: Record<string, string | boolean>, minScore: number | null, maxScore: number | null): void {
  const unattemptedOnly = flags["unattempted-only"] === true;
  const scoredOnly = flags["scored-only"] === true;
  const wrongOnly = flags["wrong-only"] === true;
  const hasScoreRange = minScore !== null || maxScore !== null;
  if (unattemptedOnly && scoredOnly) throw new Error("list cannot combine --unattempted-only and --scored-only.");
  if (unattemptedOnly && wrongOnly) throw new Error("list cannot combine --unattempted-only and --wrong-only.");
  if (unattemptedOnly && hasScoreRange) throw new Error("list cannot combine --unattempted-only with score filters.");
  if (minScore !== null && maxScore !== null && minScore > maxScore) throw new Error("min-score must be less than or equal to max-score.");
}

function listFilterManifest(
  flags: Record<string, string | boolean>,
  values: Pick<ListFilterManifest, "repo" | "createdFrom" | "createdTo" | "mode" | "level" | "status" | "htmlTargets" | "sort" | "limit" | "minScore" | "maxScore">
): ListFilterManifest {
  return {
    ...values,
    verifiedOnly: flags["verified-only"] === true,
    wrongOnly: flags["wrong-only"] === true,
    unattemptedOnly: flags["unattempted-only"] === true,
    scoredOnly: flags["scored-only"] === true
  };
}

function verificationStatusFlag(value: string | boolean | undefined): "all" | "passed" | "failed" | "missing" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --status passed, failed, missing, or all.");
  if (["all", "passed", "failed", "missing"].includes(value)) return value as "all" | "passed" | "failed" | "missing";
  throw new Error("list supports --status passed, failed, missing, or all.");
}

function learnerLevelFlag(value: string | boolean | undefined): "all" | "beginner" | "junior" | "senior" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --level beginner, junior, senior, or all.");
  if (["all", "beginner", "junior", "senior"].includes(value)) return value as "all" | "beginner" | "junior" | "senior";
  throw new Error("list supports --level beginner, junior, senior, or all.");
}

function studyModeFlag(value: string | boolean | undefined): "all" | "quick" | "standard" | "deep" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --mode quick, standard, deep, or all.");
  if (["all", "quick", "standard", "deep"].includes(value)) return value as "all" | "quick" | "standard" | "deep";
  throw new Error("list supports --mode quick, standard, deep, or all.");
}

function htmlTargetsFlag(value: string | boolean | undefined): "all" | "complete" | "missing" {
  if (value === undefined) return "all";
  if (typeof value !== "string") throw new Error("list supports --html-targets complete, missing, or all.");
  if (["all", "complete", "missing"].includes(value)) return value as "all" | "complete" | "missing";
  throw new Error("list supports --html-targets complete, missing, or all.");
}

function repoMatches(repo: string, filter: string): boolean {
  const normalizedRepo = repo.toLowerCase();
  const normalizedFilter = filter.toLowerCase();
  return normalizedRepo === normalizedFilter || normalizedRepo.endsWith(`/${normalizedFilter}`);
}

function listSortFlag(value: string | boolean | undefined): "newest" | "oldest" | "score-desc" | "score-asc" | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error("list supports --sort newest, oldest, score-desc, or score-asc.");
  if (["newest", "oldest", "score-desc", "score-asc"].includes(value)) return value as "newest" | "oldest" | "score-desc" | "score-asc";
  throw new Error("list supports --sort newest, oldest, score-desc, or score-asc.");
}

function sortSessionRows<T extends { createdAt: string; sessionId: string; score: number | null }>(rows: T[], direction: "newest" | "oldest" | "score-desc" | "score-asc"): T[] {
  if (direction === "score-desc" || direction === "score-asc") {
    const multiplier = direction === "score-desc" ? -1 : 1;
    return [...rows].sort((left, right) => {
      if (left.score === null && right.score === null) return right.createdAt.localeCompare(left.createdAt) || left.sessionId.localeCompare(right.sessionId);
      if (left.score === null) return 1;
      if (right.score === null) return -1;
      const scoreDelta = (left.score - right.score) * multiplier;
      return scoreDelta || right.createdAt.localeCompare(left.createdAt) || left.sessionId.localeCompare(right.sessionId);
    });
  }
  const multiplier = direction === "newest" ? -1 : 1;
  return [...rows].sort((left, right) => {
    const leftTime = Date.parse(left.createdAt);
    const rightTime = Date.parse(right.createdAt);
    const timeDelta = (leftTime - rightTime) * multiplier;
    return timeDelta || left.sessionId.localeCompare(right.sessionId);
  });
}

function listMarkdown(rows: Array<{
  sessionId: string;
  repo: string;
  createdAt: string;
  mode: string;
  level: string;
  score: number | null;
  wrong: number;
  path: string;
  html: string;
  htmlTargetsComplete: boolean;
  missingHtmlTargets: string[];
  verificationStatus: string;
  verificationOk: boolean | null;
  verificationHtml: string;
}>): string {
  const body = rows.length === 0
    ? "_No sessions found._"
    : [
      "| Session | Repo | Created | Mode | Level | Score | Wrong | Verification | HTML Targets | Session Path | HTML |",
      "|---|---|---|---|---|---:|---:|---|---|---|---|",
      ...rows.map((row) => [
        row.sessionId,
        row.repo,
        row.createdAt,
        row.mode,
        row.level,
        row.score === null ? "none" : String(row.score),
        String(row.wrong),
        row.verificationStatus,
        row.htmlTargetsComplete ? "complete" : `missing: ${row.missingHtmlTargets.join(", ")}`,
        row.path,
        row.html
      ].map(markdownTableCell).join(" | "))
        .map((line) => `| ${line} |`)
    ].join("\n");
  return [
    "# RepoTutor Sessions",
    "",
    `- Returned sessions: ${rows.length}`,
    "",
    body
  ].join("\n");
}

function listJsonl(rows: unknown[]): string {
  return rows.map((row) => JSON.stringify(row)).join("\n") + (rows.length > 0 ? "\n" : "");
}

async function emitListOutput(
  text: string,
  outputValue: string | boolean | undefined,
  outputManifestValue: string | boolean | undefined,
  context: ListOutputContext
): Promise<void> {
  const outputFile = optionalStringFlag(outputValue, "output");
  const normalizedText = text.endsWith("\n") ? text : `${text}\n`;
  if (outputFile === null) {
    if (outputManifestValue !== undefined) throw new Error("list requires --output when --output-manifest is used.");
    process.stdout.write(normalizedText);
    return;
  }
  const outputPath = path.resolve(outputFile);
  const manifestPath = outputManifestPath(outputManifestValue, outputPath);
  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, normalizedText);
  if (manifestPath !== null) {
    const manifest = createListOutputManifest(normalizedText, outputPath, manifestPath, context);
    await fs.mkdir(path.dirname(manifestPath), { recursive: true });
    await fs.writeFile(manifestPath, jsonText(manifest));
    process.stdout.write(jsonText({ outputPath, manifestPath }));
    return;
  }
  console.log(outputPath);
}

function jsonText(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function emitVerifyListOutputReport(text: string, reportValue: string | boolean | undefined, outputPath: string, format: string): Promise<void> {
  const reportFile = verifyListOutputReportPath(reportValue, outputPath, format);
  const normalizedText = text.endsWith("\n") ? text : `${text}\n`;
  if (reportFile === null) {
    process.stdout.write(normalizedText);
    return;
  }
  const reportPath = path.resolve(reportFile);
  await fs.mkdir(path.dirname(reportPath), { recursive: true });
  await fs.writeFile(reportPath, normalizedText);
  console.log(reportPath);
}

function outputManifestPath(value: string | boolean | undefined, outputPath: string): string | null {
  if (value === undefined) return null;
  if (value === true) return `${outputPath}.manifest.json`;
  if (typeof value !== "string") throw new Error("output-manifest must be a non-empty manifest path.");
  if (value.trim() === "") throw new Error("output-manifest must be a non-empty manifest path.");
  return path.resolve(value.trim());
}

function createListOutputManifest(text: string, outputPath: string, manifestPath: string, context: ListOutputContext): ListOutputManifest {
  return {
    schemaVersion: LIST_OUTPUT_MANIFEST_SCHEMA_VERSION,
    outputPath,
    manifestPath,
    format: context.format,
    summary: context.summary,
    rows: context.rows,
    fields: context.fields,
    fieldPreset: context.fieldPreset,
    filters: context.filters,
    bytes: Buffer.byteLength(text),
    sha256: createHash("sha256").update(text).digest("hex"),
    createdAt: new Date().toISOString()
  };
}

async function verifyListOutputManifest(outputPath: string, manifestPath: string): Promise<ListOutputVerification> {
  const failures: ListOutputVerification["failures"] = [];
  let manifest: Partial<ListOutputManifest> | null = null;
  try {
    manifest = JSON.parse(await fs.readFile(manifestPath, "utf8")) as Partial<ListOutputManifest>;
  } catch {
    failures.push({
      reason: "manifest-read-failed",
      path: manifestPath,
      expected: "readable JSON manifest",
      actual: null
    });
  }

  const expectedBytes = typeof manifest?.bytes === "number" ? manifest.bytes : null;
  const expectedSha256 = typeof manifest?.sha256 === "string" ? manifest.sha256 : null;
  const schemaVersion = typeof manifest?.schemaVersion === "number" ? manifest.schemaVersion : null;
  const supportedSchemaVersion = schemaVersion === null || schemaVersion === LIST_OUTPUT_MANIFEST_SCHEMA_VERSION;
  const format = typeof manifest?.format === "string" ? manifest.format : null;
  const summary = typeof manifest?.summary === "boolean" ? manifest.summary : null;
  const rows = typeof manifest?.rows === "number" ? manifest.rows : null;
  const fields = Array.isArray(manifest?.fields) && manifest.fields.every((field) => typeof field === "string")
    ? manifest.fields
    : null;

  if (manifest) {
    if (manifest.outputPath !== outputPath) {
      failures.push({ reason: "output-path-mismatch", path: manifestPath, expected: outputPath, actual: manifest.outputPath ?? null });
    }
    if (manifest.manifestPath !== manifestPath) {
      failures.push({ reason: "manifest-path-mismatch", path: manifestPath, expected: manifestPath, actual: manifest.manifestPath ?? null });
    }
    if (format === null) failures.push({ reason: "format-missing", path: manifestPath, expected: "string", actual: null });
    if (summary === null) failures.push({ reason: "summary-missing", path: manifestPath, expected: "boolean", actual: null });
    if (rows === null) failures.push({ reason: "rows-missing", path: manifestPath, expected: "number", actual: null });
    if (expectedBytes === null) failures.push({ reason: "bytes-missing", path: manifestPath, expected: "number", actual: null });
    if (expectedSha256 === null) failures.push({ reason: "sha256-missing", path: manifestPath, expected: "string", actual: null });
    if (!supportedSchemaVersion) {
      failures.push({ reason: "unsupported-schema-version", path: manifestPath, expected: LIST_OUTPUT_MANIFEST_SCHEMA_VERSION, actual: schemaVersion });
    }
  }

  let actualBytes: number | null = null;
  let actualSha256: string | null = null;
  let actualRows: number | null = null;
  let actualFields: string[] | null = null;
  try {
    const outputText = await fs.readFile(outputPath, "utf8");
    actualBytes = Buffer.byteLength(outputText);
    actualSha256 = createHash("sha256").update(outputText).digest("hex");
    actualRows = listOutputRowCount(outputText, format, summary);
    actualFields = listOutputFields(outputText, format, summary);
  } catch {
    if (actualBytes !== null) {
      failures.push({
        reason: "output-format-parse-failed",
        path: outputPath,
        expected: format ?? "known list format",
        actual: null
      });
    }
  }
  if (actualBytes === null) {
    try {
      await fs.access(outputPath);
    } catch {
      failures.push({
        reason: "output-read-failed",
        path: outputPath,
        expected: "readable output file",
        actual: null
      });
    }
  }

  if (rows !== null && actualRows !== null && rows !== actualRows) {
    failures.push({ reason: "rows-mismatch", path: outputPath, expected: rows, actual: actualRows });
  }
  if (fields !== null && actualFields !== null && fieldListKey(fields) !== fieldListKey(actualFields)) {
    failures.push({ reason: "fields-mismatch", path: outputPath, expected: fieldListKey(fields), actual: fieldListKey(actualFields) });
  }

  if (expectedBytes !== null && actualBytes !== null && expectedBytes !== actualBytes) {
    failures.push({ reason: "bytes-mismatch", path: outputPath, expected: expectedBytes, actual: actualBytes });
  }
  if (expectedSha256 !== null && actualSha256 !== null && expectedSha256 !== actualSha256) {
    failures.push({ reason: "sha256-mismatch", path: outputPath, expected: expectedSha256, actual: actualSha256 });
  }

  return {
    ok: failures.length === 0,
    outputPath,
    manifestPath,
    schemaVersion,
    supportedSchemaVersion,
    format,
    summary,
    rows,
    actualRows,
    fields,
    actualFields,
    expectedBytes,
    actualBytes,
    expectedSha256,
    actualSha256,
    failures
  };
}

function listOutputRowCount(text: string, format: string | null, summary: boolean | null): number | null {
  if (summary === true) return null;
  if (format === "json") {
    const parsed = JSON.parse(text) as unknown;
    return Array.isArray(parsed) ? parsed.length : null;
  }
  if (format === "jsonl") {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    for (const line of lines) JSON.parse(line);
    return lines.length;
  }
  if (format === "csv") {
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    return Math.max(0, lines.length - 1);
  }
  return null;
}

function listOutputFields(text: string, format: string | null, summary: boolean | null): string[] | null {
  if (summary === true) return null;
  if (format === "json") {
    const parsed = JSON.parse(text) as unknown;
    if (!Array.isArray(parsed)) return null;
    const first = parsed[0] as unknown;
    return first && typeof first === "object" && !Array.isArray(first) ? Object.keys(first) : [];
  }
  if (format === "jsonl") {
    const firstLine = text.split("\n").find((line) => line.trim() !== "");
    if (!firstLine) return [];
    const first = JSON.parse(firstLine) as unknown;
    return first && typeof first === "object" && !Array.isArray(first) ? Object.keys(first) : null;
  }
  if (format === "csv") {
    const header = text.split("\n").find((line) => line.trim() !== "");
    return header ? header.split(",") : [];
  }
  return null;
}

function fieldListKey(fields: readonly string[]): string {
  return fields.join(",");
}

function listSummary(rows: ListRow[]): ListSummary {
  const scores = rows.map((row) => row.score).filter((score): score is number => score !== null);
  return {
    total: rows.length,
    verificationStatus: countBy(rows, (row) => row.verificationStatus),
    modes: countBy(rows, (row) => row.mode),
    levels: countBy(rows, (row) => row.level),
    htmlTargets: {
      complete: rows.filter((row) => row.htmlTargetsComplete).length,
      missing: rows.filter((row) => !row.htmlTargetsComplete).length
    },
    quiz: {
      scored: scores.length,
      unattempted: rows.length - scores.length,
      wrong: rows.filter((row) => row.wrong > 0).length,
      averageScore: scores.length === 0 ? null : Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2)),
      minScore: scores.length === 0 ? null : Math.min(...scores),
      maxScore: scores.length === 0 ? null : Math.max(...scores)
    },
    repos: countBy(rows, (row) => row.repo)
  };
}

function countBy<T>(items: T[], key: (item: T) => string): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

function listSummaryMarkdown(summary: ListSummary): string {
  return [
    "# RepoTutor Session Summary",
    "",
    `- Total sessions: ${summary.total}`,
    `- HTML targets complete: ${summary.htmlTargets.complete}`,
    `- HTML targets missing: ${summary.htmlTargets.missing}`,
    `- Scored sessions: ${summary.quiz.scored}`,
    `- Unattempted sessions: ${summary.quiz.unattempted}`,
    `- Wrong-answer sessions: ${summary.quiz.wrong}`,
    `- Average score: ${summary.quiz.averageScore ?? "none"}`,
    `- Min score: ${summary.quiz.minScore ?? "none"}`,
    `- Max score: ${summary.quiz.maxScore ?? "none"}`,
    "",
    "## Verification Status",
    "",
    countMarkdown(summary.verificationStatus),
    "",
    "## Modes",
    "",
    countMarkdown(summary.modes),
    "",
    "## Levels",
    "",
    countMarkdown(summary.levels),
    "",
    "## Repositories",
    "",
    countMarkdown(summary.repos)
  ].join("\n");
}

function countMarkdown(counts: Record<string, number>): string {
  const entries = Object.entries(counts).sort(([left], [right]) => left.localeCompare(right));
  return entries.length === 0 ? "- none" : entries.map(([key, value]) => `- ${key}: ${value}`).join("\n");
}

function listFieldsMarkdown(rows: Array<Partial<ListRow>>, fields: ListField[]): string {
  const body = rows.length === 0
    ? "_No sessions found._"
    : [
      `| ${fields.map(markdownTableCell).join(" | ")} |`,
      `| ${fields.map(() => "---").join(" | ")} |`,
      ...rows.map((row) => `| ${fields.map((field) => markdownTableCell(listFieldDisplayValue(row[field]))).join(" | ")} |`)
    ].join("\n");
  return [
    "# RepoTutor Sessions",
    "",
    `- Returned sessions: ${rows.length}`,
    `- Fields: ${fields.join(", ")}`,
    "",
    body
  ].join("\n");
}

function listCsv(rows: ListRow[], fields: readonly ListField[]): string {
  const lines = rows.map((row) => fields.map((field) => csvCell(listFieldCsvValue(row[field]))).join(","));
  return `${[fields.join(","), ...lines].join("\n")}\n`;
}

function listFieldDisplayValue(value: unknown): string {
  if (value === null || value === undefined) return "none";
  if (Array.isArray(value)) return value.length === 0 ? "none" : value.map(String).join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function listFieldCsvValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) return value.map(String).join(";");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function csvCell(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;
}

function listOutputVerificationMarkdown(payload: ListOutputVerification): string {
  const failures = payload.failures.length === 0
    ? "- none"
    : payload.failures.map((failure) => [
      `- ${failure.reason}: ${failure.path}`,
      `  - Expected: ${failure.expected ?? "none"}`,
      `  - Actual: ${failure.actual ?? "none"}`
    ].join("\n")).join("\n");
  return [
    "# RepoTutor List Output Verification",
    "",
    `- OK: ${payload.ok ? "PASS" : "FAIL"}`,
    `- Output: ${payload.outputPath}`,
    `- Manifest: ${payload.manifestPath}`,
    `- Schema version: ${payload.schemaVersion ?? "unknown"}`,
    `- Supported schema version: ${payload.supportedSchemaVersion ? "yes" : "no"}`,
    `- Format: ${payload.format ?? "unknown"}`,
    `- Summary: ${payload.summary ?? "unknown"}`,
    `- Rows: ${payload.rows ?? "unknown"}`,
    `- Actual rows: ${payload.actualRows ?? "unknown"}`,
    `- Fields: ${payload.fields ? fieldListKey(payload.fields) : "unknown"}`,
    `- Actual fields: ${payload.actualFields ? fieldListKey(payload.actualFields) : "unknown"}`,
    `- Expected bytes: ${payload.expectedBytes ?? "unknown"}`,
    `- Actual bytes: ${payload.actualBytes ?? "missing"}`,
    `- Expected sha256: ${payload.expectedSha256 ?? "unknown"}`,
    `- Actual sha256: ${payload.actualSha256 ?? "missing"}`,
    "",
    "## Failures",
    "",
    failures
  ].join("\n");
}
