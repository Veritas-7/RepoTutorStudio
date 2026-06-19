import fs from "node:fs/promises";
import path from "node:path";

export async function assertReadableFile(filePath: string, message: string): Promise<void> {
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) throw new Error(message);
  } catch {
    throw new Error(message);
  }
}

export async function readableFileExists(filePath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(filePath);
    return stat.isFile();
  } catch {
    return false;
  }
}

export async function htmlTargetStatus(targets: Record<string, string>): Promise<Record<string, boolean>> {
  const statuses = await Promise.all(
    Object.entries(targets).map(async ([target, filePath]) => [target, await readableFileExists(filePath)] as const)
  );
  return Object.fromEntries(statuses);
}

export async function sessionVerificationSummary(sessionRoot: string): Promise<{
  status: "passed" | "failed" | "missing";
  ok: boolean | null;
  reportPath: string;
  markdownPath: string;
  htmlPath: string;
  checkedRequiredArtifacts: number | null;
  checks: Record<string, boolean> | null;
}> {
  const reportPath = path.join(sessionRoot, "analysis", "session-verification-report.json");
  try {
    const report = JSON.parse(await fs.readFile(reportPath, "utf8")) as {
      ok: boolean;
      checkedRequiredArtifacts: number;
      checks: Record<string, boolean>;
    };
    return {
      status: report.ok ? "passed" : "failed",
      ok: report.ok,
      reportPath,
      markdownPath: path.join(sessionRoot, "markdown", "session-verification.md"),
      htmlPath: path.join(sessionRoot, "html", "session-verification.html"),
      checkedRequiredArtifacts: report.checkedRequiredArtifacts,
      checks: report.checks
    };
  } catch {
    return {
      status: "missing",
      ok: null,
      reportPath,
      markdownPath: path.join(sessionRoot, "markdown", "session-verification.md"),
      htmlPath: path.join(sessionRoot, "html", "session-verification.html"),
      checkedRequiredArtifacts: null,
      checks: null
    };
  }
}
