import { constants as fsConstants } from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { CLI_COMMANDS, type ParsedArgs } from "./args.js";
import { doctorMarkdown } from "./cli-formatters.js";
import { stringFlag } from "./flags.js";
import { LIST_FIELDS, LIST_FIELD_PRESET_NAMES, type DoctorPayload } from "./list-types.js";
import { openTargetEntries } from "./open-targets.js";
import { studiesRoot } from "./session-utils.js";

export async function doctor(parsed: ParsedArgs): Promise<void> {
  const format = stringFlag(parsed.flags.format) ?? "json";
  if (!["json", "markdown"].includes(format)) throw new Error("doctor supports --format json or markdown.");
  const runtimeStudiesRoot = studiesRoot(parsed.flags);
  const payload: DoctorPayload = {
    ok: true,
    product: "RepoTutor Studio",
    commands: [...CLI_COMMANDS],
    defaultStudyCommand: true,
    formats: {
      study: ["json", "markdown"],
      quiz: ["json", "markdown"],
      resume: ["json", "markdown"],
      evidence: ["json", "markdown"],
      verifyExport: ["json", "markdown"],
      verifyEvidence: ["json", "markdown"],
      verifySession: ["json", "markdown"],
      verifyListOutput: ["json", "markdown"],
      list: ["json", "markdown", "jsonl", "csv"],
      openTargets: ["json", "markdown"],
      openAll: ["json", "markdown"],
      pruneSource: ["json", "markdown"],
      export: ["html", "zip"],
      exportSummary: ["json", "markdown"]
    },
    runtime: {
      cwd: process.cwd(),
      studiesRoot: runtimeStudiesRoot,
      initCwd: process.env.INIT_CWD ?? null,
      envStudiesRoot: process.env.REPOTUTOR_STUDIES_ROOT ?? null
    },
    runtimeOptions: {
      studiesRootFlag: true,
      envStudiesRoot: true,
      initCwdFallback: true,
      codexSdkDefault: true,
      noCodexFlag: true,
      sourcePruneDryRun: true
    },
    runtimeHealth: await doctorRuntimeHealth(runtimeStudiesRoot),
    listFilters: {
      level: ["beginner", "junior", "senior", "all"],
      mode: ["quick", "standard", "deep", "all"],
      status: ["passed", "failed", "missing", "all"],
      htmlTargets: ["complete", "missing", "all"],
      sort: ["newest", "oldest", "score-desc", "score-asc"],
      fields: [...LIST_FIELDS],
      fieldPresets: LIST_FIELD_PRESET_NAMES,
      summary: true,
      output: true,
      outputManifest: true,
      repo: true,
      createdFrom: true,
      createdTo: true,
      createdRangeValidation: true,
      verifiedOnly: true,
      wrongOnly: true,
      unattemptedOnly: true,
      scoredOnly: true,
      minScore: true,
      maxScore: true,
      filterConflictValidation: true,
      limit: true
    },
    openTargets: [...openTargetEntries().map((entry) => entry.target), "all"],
    modes: ["cli", "codex-skill", "tauri-sidecar"],
    security: {
      codexSdkDefault: true,
      staticAnalysisFallback: true,
      codexAuthDelegated: true,
      arbitraryCommandExecution: false,
      secretExclusion: true
    }
  };
  if (format === "markdown") {
    console.log(doctorMarkdown(payload));
  } else {
    console.log(JSON.stringify(payload, null, 2));
  }
}

async function doctorRuntimeHealth(studiesRootPath: string): Promise<Record<string, boolean>> {
  const studiesRootExists = await pathAccess(studiesRootPath, fsConstants.F_OK);
  return {
    studiesRootExists,
    studiesRootReadable: studiesRootExists && await pathAccess(studiesRootPath, fsConstants.R_OK),
    studiesRootWritable: studiesRootExists && await pathAccess(studiesRootPath, fsConstants.W_OK),
    studiesRootParentWritable: await pathAccess(path.dirname(studiesRootPath), fsConstants.W_OK)
  };
}

async function pathAccess(targetPath: string, mode: number): Promise<boolean> {
  try {
    await fs.access(targetPath, mode);
    return true;
  } catch {
    return false;
  }
}
