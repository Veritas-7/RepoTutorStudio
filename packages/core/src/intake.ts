import fs from "node:fs/promises";
import path from "node:path";
import { SourceInput, SourceType, slugPart } from "@repotutor/shared";
import { pathExists } from "./fs-utils.js";

export interface ParseSourceOptions {
  baseDir?: string;
}

export async function parseSource(raw: string, options: ParseSourceOptions = {}): Promise<SourceInput> {
  const trimmed = raw.trim();
  const github = parseGitHubUrl(trimmed);
  if (github) return github;

  const bases = uniqueStrings([options.baseDir, process.cwd()].filter((item): item is string => Boolean(item)));
  for (const base of bases) {
    const resolved = path.resolve(base, trimmed);
    if (await pathExists(resolved)) {
      const stat = await fs.stat(resolved);
      if (stat.isFile() && path.extname(resolved).toLowerCase() === ".zip") {
        return localInput(trimmed, "zip", resolved);
      }
      if (stat.isDirectory() && await pathExists(path.join(resolved, "SKILL.md"))) {
        return localInput(trimmed, "skill", resolved);
      }
      if (stat.isDirectory() && await pathExists(path.join(resolved, "agent-harness"))) {
        return localInput(trimmed, "cli-anything", resolved);
      }
      if (stat.isDirectory()) {
        return localInput(trimmed, "local", resolved);
      }
    }
  }

  throw new Error(`지원하지 않는 입력입니다: ${trimmed}`);
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => path.resolve(value))));
}

function localInput(raw: string, sourceType: SourceType, resolved: string): SourceInput {
  const repo = slugPart(path.basename(resolved).replace(/\.zip$/i, ""));
  return {
    raw,
    sourceType,
    owner: sourceType === "skill" ? "skill" : sourceType === "zip" ? "zip" : "local",
    repo,
    branch: "local",
    localSourcePath: resolved
  };
}

function parseGitHubUrl(raw: string): SourceInput | null {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.hostname !== "github.com") return null;
  const parts = url.pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (parts.length < 2) return null;
  const owner = slugPart(parts[0]);
  const repo = slugPart(parts[1].replace(/\.git$/i, ""));
  let branch = "main";
  if (parts[2] === "tree" && parts[3]) {
    branch = slugPart(parts.slice(3).join("-"));
  }
  return {
    raw,
    sourceType: "github",
    owner,
    repo,
    branch,
    sourceUrl: `https://github.com/${owner}/${repo}.git`
  };
}
