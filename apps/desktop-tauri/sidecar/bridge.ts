import { listSessions, runStudy } from "@repotutor/core";

// Node sidecar JSONL bridge for Tauri commands.
interface RequestMessage {
  id: string;
  method: "study" | "list";
  params?: Record<string, unknown>;
}

process.stdin.setEncoding("utf8");

let buffer = "";
process.stdin.on("data", (chunk) => {
  buffer += chunk;
  const lines = buffer.split(/\r?\n/);
  buffer = lines.pop() ?? "";
  for (const line of lines.filter(Boolean)) {
    void handle(line);
  }
});

async function handle(line: string): Promise<void> {
  const request = JSON.parse(line) as RequestMessage;
  try {
    if (request.method === "study") {
      const result = await runStudy({
        source: String(request.params?.source ?? ""),
        mode: request.params?.mode as never,
        level: request.params?.level as never,
        studiesRoot: String(request.params?.studiesRoot ?? "studies"),
        enableCodex: request.params?.enableCodex !== false
      });
      respond(request.id, {
        sessionId: result.session.sessionId,
        status: result.session.status,
        path: result.session.outputPaths.root,
        html: `${result.session.outputPaths.html}/index.html`,
        dailySummaryHtml: `${result.session.outputPaths.html}/daily-summary.html`,
        teachingWorkspaceHtml: `${result.session.outputPaths.html}/teaching-workspace.html`,
        quizQuestions: result.session.quizSummary.totalQuestions
      });
      return;
    }
    if (request.method === "list") {
      respond(request.id, await listSessions(String(request.params?.studiesRoot ?? "studies")));
      return;
    }
    throw new Error(`Unknown method: ${request.method}`);
  } catch (error) {
    respond(request.id, { error: error instanceof Error ? error.message : String(error) });
  }
}

function respond(id: string, result: unknown): void {
  process.stdout.write(`${JSON.stringify({ id, result })}\n`);
}
