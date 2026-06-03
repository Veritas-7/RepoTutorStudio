import fs from "node:fs/promises";
import path from "node:path";

export interface CliAnythingInspection {
  installed: boolean;
  hasCliHub: boolean;
  hasGeneratedHarness: boolean;
  harnessPath: string | null;
  notes: string[];
}

export async function inspectCliAnythingTarget(repoRoot: string): Promise<CliAnythingInspection> {
  const harnessPath = path.join(repoRoot, "agent-harness");
  return {
    installed: Boolean(process.env.CLI_ANYTHING_HOME),
    hasCliHub: Boolean(process.env.CLI_HUB_HOME),
    hasGeneratedHarness: await exists(harnessPath),
    harnessPath: await exists(harnessPath) ? harnessPath : null,
    notes: [
      "CLI-Anything is optional and never required for default RepoTutor analysis.",
      "Generated harness folders can be analyzed as learning material when present."
    ]
  };
}

async function exists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}
