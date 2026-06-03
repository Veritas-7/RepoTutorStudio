import fs from "node:fs/promises";
import path from "node:path";
import type { z } from "zod";
import type { CodexRunLog } from "@repotutor/shared";

export interface StructuredTask<T> {
  taskName: string;
  prompt: string;
  schema: z.ZodType<T>;
  outputSchema?: unknown;
}

export interface StructuredRunnerOptions {
  codexDir: string;
  enableSdk?: boolean;
  workingDirectory?: string;
}

export class PromptTemplateRegistry {
  purposeTask(evidence: string): StructuredTask<{ oneLineSummary: string; longExplanation: string }> {
    return {
      taskName: "PurposeTask",
      prompt: [
        "You are RepoTutor Studio.",
        "Explain the repository purpose for a beginner in Korean.",
        "Do not invent facts. Mark uncertainty as inference.",
        evidence
      ].join("\n\n"),
      schema: {
        parse(value: unknown) {
          const record = value as Record<string, unknown>;
          if (typeof record.oneLineSummary !== "string" || typeof record.longExplanation !== "string") {
            throw new Error("Expected oneLineSummary and longExplanation strings");
          }
          return record as { oneLineSummary: string; longExplanation: string };
        }
      } as z.ZodType<{ oneLineSummary: string; longExplanation: string }>
    };
  }
}

export class StructuredRunner {
  constructor(private readonly options: StructuredRunnerOptions) {}

  async run<T>(task: StructuredTask<T>): Promise<{ result: T | null; log: CodexRunLog }> {
    await fs.mkdir(this.options.codexDir, { recursive: true });
    const startedAt = new Date().toISOString();
    const promptPath = path.join(this.options.codexDir, "prompts.jsonl");
    await fs.appendFile(promptPath, JSON.stringify({ taskName: task.taskName, createdAt: startedAt, prompt: task.prompt }) + "\n");

    if (!this.options.enableSdk) {
      const log: CodexRunLog = {
        taskName: task.taskName,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "skipped",
        promptPath,
        outputPath: null,
        validationErrors: ["Codex SDK disabled; deterministic local generator used."]
      };
      await this.appendLog(log);
      return { result: null, log };
    }

    try {
      const sdk = await import("@openai/codex-sdk");
      const output = await this.tryRunSdk(sdk, task);
      const parsed = task.schema.parse(output);
      const outputPath = path.join(this.options.codexDir, "structured-outputs.jsonl");
      await fs.appendFile(outputPath, JSON.stringify({ taskName: task.taskName, createdAt: new Date().toISOString(), output: parsed }) + "\n");
      const log: CodexRunLog = {
        taskName: task.taskName,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "success",
        promptPath,
        outputPath,
        validationErrors: []
      };
      await this.appendLog(log);
      return { result: parsed, log };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const log: CodexRunLog = {
        taskName: task.taskName,
        startedAt,
        finishedAt: new Date().toISOString(),
        status: "failed",
        promptPath,
        outputPath: null,
        validationErrors: [message]
      };
      await this.appendLog(log);
      return { result: null, log };
    }
  }

  private async tryRunSdk<T>(sdk: unknown, task: StructuredTask<T>): Promise<unknown> {
    const record = sdk as { Codex?: new (options?: unknown) => { startThread: (options?: unknown) => { id: string | null; run: (input: string, options?: unknown) => Promise<{ finalResponse: string }> } } };
    if (typeof record.Codex !== "function") {
      throw new Error("@openai/codex-sdk loaded but Codex class was not found.");
    }
    const codex = new record.Codex();
    const thread = codex.startThread({
      workingDirectory: this.options.workingDirectory ?? process.cwd(),
      skipGitRepoCheck: true,
      sandboxMode: "read-only",
      approvalPolicy: "never",
      networkAccessEnabled: false
    });
    const turn = await thread.run(task.prompt, task.outputSchema ? { outputSchema: task.outputSchema } : undefined);
    await fs.writeFile(path.join(this.options.codexDir, "thread.json"), JSON.stringify({ threadId: thread.id, taskName: task.taskName }, null, 2));
    try {
      return JSON.parse(turn.finalResponse);
    } catch {
      return { finalResponse: turn.finalResponse };
    }
  }

  private async appendLog(log: CodexRunLog): Promise<void> {
    await fs.appendFile(path.join(this.options.codexDir, "events.jsonl"), JSON.stringify(log) + "\n");
  }
}

export class OutputSchemaValidator {
  validate<T>(schema: z.ZodType<T>, value: unknown): { ok: true; value: T } | { ok: false; errors: string[] } {
    const parsed = schema.safeParse(value);
    if (parsed.success) return { ok: true, value: parsed.data };
    return { ok: false, errors: parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`) };
  }
}

export class StreamingEventBridge {
  constructor(private readonly codexDir: string) {}

  async record(event: Record<string, unknown>): Promise<void> {
    await fs.mkdir(this.codexDir, { recursive: true });
    await fs.appendFile(path.join(this.codexDir, "events.jsonl"), JSON.stringify({ ...event, createdAt: new Date().toISOString() }) + "\n");
  }
}
