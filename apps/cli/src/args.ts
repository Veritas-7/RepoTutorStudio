export interface ParsedArgs {
  command: string;
  rest: string[];
  flags: Record<string, string | boolean>;
}

export const CLI_COMMANDS = [
  "study",
  "quiz",
  "resume",
  "evidence",
  "export",
  "verify-export",
  "verify-evidence",
  "verify-session",
  "verify-list-output",
  "list",
  "open",
  "prune-source",
  "doctor"
] as const;

const CLI_COMMAND_SET = new Set<string>(CLI_COMMANDS);
const HELP_COMMANDS = new Set(["help", "--help", "-h"]);

export function parseArgs(args: string[]): ParsedArgs {
  args = args.filter((arg) => arg !== "--");
  args = injectDefaultStudyCommand(args);
  const command = args[0] ?? "help";
  const rest: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    if (arg.startsWith("--")) {
      const key = arg.slice(2);
      const next = args[index + 1];
      if (next !== undefined && !next.startsWith("--")) {
        flags[key] = next;
        index += 1;
      } else {
        flags[key] = true;
      }
    } else {
      rest.push(arg);
    }
  }
  return { command, rest, flags };
}

function injectDefaultStudyCommand(args: string[]): string[] {
  if (args.length === 0) return args;
  const first = args[0];
  if (CLI_COMMAND_SET.has(first) || HELP_COMMANDS.has(first) || first.startsWith("-")) return args;
  return isStudyTargetCandidate(first) ? ["study", ...args] : args;
}

function isStudyTargetCandidate(value: string): boolean {
  return value.startsWith("http://")
    || value.startsWith("https://")
    || value.startsWith("git@")
    || value.startsWith("/")
    || value.startsWith(".")
    || value.includes("/")
    || value.endsWith(".git");
}
