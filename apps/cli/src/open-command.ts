import path from "node:path";
import type { ParsedArgs } from "./args.js";
import { stringFlag } from "./flags.js";
import { openTargetEntries, openTargetFile, openTargetPaths, openTargetPathsMarkdown, openTargetsMarkdown } from "./open-targets.js";
import { assertReadableFile, resolveSessionRoot } from "./session-utils.js";

export async function openSession(parsed: ParsedArgs): Promise<void> {
  if (parsed.flags["list-targets"] === true) {
    const format = stringFlag(parsed.flags.format) ?? "json";
    if (!["json", "markdown"].includes(format)) throw new Error("open --list-targets supports --format json or markdown.");
    const entries = openTargetEntries();
    console.log(format === "markdown" ? openTargetsMarkdown(entries) : JSON.stringify(entries, null, 2));
    return;
  }
  const sessionRoot = await resolveSessionRoot(parsed.rest[0], parsed.flags);
  const target = stringFlag(parsed.flags.target) ?? "index";
  if (target === "all") {
    const format = stringFlag(parsed.flags.format) ?? "json";
    if (!["json", "markdown"].includes(format)) throw new Error("open --target all supports --format json or markdown.");
    const targetPaths = openTargetPaths(path.join(sessionRoot, "html"));
    for (const [targetName, filePath] of Object.entries(targetPaths)) {
      await assertReadableFile(filePath, `Open target file not found for ${targetName}: ${filePath}`);
    }
    console.log(format === "markdown" ? openTargetPathsMarkdown(targetPaths) : JSON.stringify(targetPaths, null, 2));
    return;
  }
  const fileName = openTargetFile(target);
  const htmlPath = path.join(sessionRoot, "html", fileName);
  await assertReadableFile(htmlPath, `Open target file not found: ${htmlPath}`);
  console.log(htmlPath);
}
