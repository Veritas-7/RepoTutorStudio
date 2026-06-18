export function flagEnum(value: string | boolean | undefined, allowed: string[], fallback: string): string {
  return typeof value === "string" && allowed.includes(value) ? value : fallback;
}

export function stringFlag(value: string | boolean | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export function optionalStringFlag(value: string | boolean | undefined, name: string): string | null {
  if (value === undefined) return null;
  if (typeof value !== "string" || value.trim() === "") throw new Error(`${name} must be a non-empty string.`);
  return value.trim();
}

export function verifyListOutputReportPath(value: string | boolean | undefined, outputPath: string, format: string): string | null {
  if (value === undefined) return null;
  if (value === true) return `${outputPath}${format === "markdown" ? ".verification.md" : ".verification.json"}`;
  if (typeof value !== "string" || value.trim() === "") throw new Error("report must be a non-empty string.");
  return value.trim();
}

export function numberFlag(value: string | boolean | undefined, fallback: number): number {
  if (typeof value !== "string") return fallback;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function optionalPositiveIntegerFlag(value: string | boolean | undefined, name: string): number | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error(`${name} must be a positive integer.`);
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new Error(`${name} must be a positive integer.`);
  return parsed;
}

export function optionalScoreFlag(value: string | boolean | undefined, name: string): number | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error(`${name} must be a number from 0 to 100.`);
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) throw new Error(`${name} must be a number from 0 to 100.`);
  return parsed;
}

export function optionalCreatedAtBoundFlag(value: string | boolean | undefined, name: string, dateOnlyBoundary: "start" | "end"): number | null {
  if (value === undefined) return null;
  if (typeof value !== "string") throw new Error(`${name} must be an ISO date or timestamp.`);
  const trimmed = value.trim();
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(trimmed)
    ? `${trimmed}T${dateOnlyBoundary === "start" ? "00:00:00.000" : "23:59:59.999"}Z`
    : trimmed;
  const parsed = Date.parse(normalized);
  if (Number.isNaN(parsed)) throw new Error(`${name} must be an ISO date or timestamp.`);
  return parsed;
}
