import type { CrashReportingReadinessReport, DebugReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDebugReadinessReport(walk: WalkResult): Promise<DebugReadinessReport> {
  const sourceFiles = await debugSourceFiles(walk);
  const debugSetups = debugSetupRows(sourceFiles);
  const adapterSignals = debugAdapterSignals(sourceFiles);
  const modeSignals = debugModeSignals(sourceFiles);
  const breakpointSignals = debugBreakpointSignals(sourceFiles);
  const mappingSignals = debugMappingSignals(sourceFiles);
  const runtimeSignals = debugRuntimeSignals(sourceFiles);
  const remoteSignals = debugRemoteSignals(sourceFiles);
  const diagnosticSignals = debugDiagnosticSignals(sourceFiles);
  const packageSignals = debugPackageSignals(sourceFiles);

  const hasLaunchOrAttach = debugSetups.some((item) => item.launchCount + item.attachCount > 0);
  const hasAdapterOrRuntime = adapterSignals.some((item) => item.readiness === "ready")
    || runtimeSignals.some((item) => item.readiness === "ready")
    || debugSetups.some((item) => item.adapterCount + item.runtimeCount > 0);
  const hasBreakpointOrLogs = breakpointSignals.some((item) => item.readiness === "ready")
    || diagnosticSignals.some((item) => item.readiness === "ready")
    || debugSetups.some((item) => item.breakpointCount + item.logCount > 0);
  const hasRemote = remoteSignals.some((item) => item.readiness === "ready")
    || debugSetups.some((item) => item.remoteCount > 0);
  const hasRemoteSafety = debugSetups.some((item) => item.safetyCount > 0);
  const hasSourceMaps = mappingSignals.some((item) => item.signal === "source-map" && item.readiness === "ready")
    || debugSetups.some((item) => item.sourceMapCount > 0);
  const hasPathMappings = mappingSignals.some((item) => item.readiness === "ready" && ["source-map-overrides", "path-mappings", "cwd-root"].includes(item.signal))
    || debugSetups.some((item) => item.pathMappingCount > 0);

  const riskQueue: DebugReadinessReport["riskQueue"] = [];
  if (!hasLaunchOrAttach) {
    riskQueue.push({
      priority: "high",
      action: "Add or document launch/attach debugging configuration before claiming debugging readiness.",
      why: "Debugging readiness needs a visible launch.json, debugpy, Delve, DAP, package script, or workflow entrypoint.",
      relatedHref: "html/debug-readiness.html"
    });
  }
  if (hasLaunchOrAttach && !hasAdapterOrRuntime) {
    riskQueue.push({
      priority: "medium",
      action: "Document the debug adapter or runtime target used by launch/attach flows.",
      why: "Launch and attach entries are hard to reproduce unless the adapter, DAP server, interpreter, browser, Node, or Delve runtime is explicit.",
      relatedHref: "html/debug-readiness.html"
    });
  }
  if (hasLaunchOrAttach && !hasBreakpointOrLogs) {
    riskQueue.push({
      priority: "medium",
      action: "Document breakpoint, logpoint, exception, hit condition, stack trace, or adapter log checks.",
      why: "A debugger entrypoint is not enough for learners unless they can see how breakpoints and diagnostics are verified.",
      relatedHref: "html/debug-readiness.html"
    });
  }
  if (hasSourceMaps && !hasPathMappings) {
    riskQueue.push({
      priority: "medium",
      action: "Add sourceMapPathOverrides, pathMappings, webRoot, cwd, localRoot, or remoteRoot evidence.",
      why: "Source maps and transpiled output often need mapping rules before breakpoints bind to source files.",
      relatedHref: "html/debug-readiness.html"
    });
  }
  if (hasRemote && !hasRemoteSafety) {
    riskQueue.push({
      priority: "medium",
      action: "Document localhost binding, authorization, firewall, ptrace/native attach, or production safety constraints for remote debugging.",
      why: "Remote attach and debug ports can expose runtime state unless the safe environment and binding assumptions are explicit.",
      relatedHref: "html/debug-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static debugging readiness only; it does not launch debuggers, attach to processes, open debug ports, inspect memory, or mutate runtime state.",
    why: "Debugger launch, attach, port, and native inspection flows must run only in an authorized local or test environment.",
    relatedHref: "html/debug-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `VS Code js-debug/debugpy/Delve/DAP-style debugging readiness report: setup ${debugSetups.length}개, adapter signal ${adapterSignals.length}개, mode signal ${modeSignals.length}개, breakpoint signal ${breakpointSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Debug readiness VS Code js-debug debugpy Delve DAP launch attach breakpoints source maps path mappings remote logs",
    debugSetups,
    adapterSignals,
    modeSignals,
    breakpointSignals,
    mappingSignals,
    runtimeSignals,
    remoteSignals,
    diagnosticSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"launch.json|DebugConfiguration|request.*(launch|attach)|debugAdapterPath|Debug Adapter Protocol\" .", purpose: "Find launch/attach debug adapter configuration without starting debuggers." },
      { command: "rg \"breakpoint|logpoint|conditional breakpoint|hit condition|exception breakpoint|function breakpoint\" .", purpose: "Find breakpoint, logpoint, condition, exception, and function-breakpoint evidence." },
      { command: "rg \"sourceMaps|sourceMapPathOverrides|skipFiles|smartStep|pathMappings|localRoot|remoteRoot|webRoot\" .", purpose: "Find source mapping and breakpoint binding evidence." },
      { command: "rg \"debugpy|dlv|--inspect|--inspect-brk|--listen|wait_for_client|accept-multiclient|logToFile|--log-output\" .", purpose: "Find debugpy, Delve, Node inspect, remote attach, and diagnostic logging evidence." }
    ],
    learnerNextSteps: [
      "Start with launch and attach entries, then confirm which adapter and runtime each entry targets.",
      "Check breakpoint, logpoint, exception, hit condition, and stack trace evidence before relying on interactive debugging.",
      "Review source maps, skip files, smart step, path mappings, cwd, localRoot, remoteRoot, and webRoot when breakpoints may not bind.",
      "Treat remote attach, PID attach, native attach, and debug ports as authorized-environment work only.",
      "This report is static readiness only. Real debugger claims require an approved local or test runtime."
    ]
  };
}

type DebugSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function debugSourceFiles(walk: WalkResult): Promise<DebugSourceFile[]> {
  const files: DebugSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !debugInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!debugPathSignal(file.relPath) && !debugContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function debugInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements.*\.txt|go\.mod|Cargo\.toml|Dockerfile|docker-compose\.ya?ml|compose\.ya?ml|Makefile|Taskfile\.ya?ml|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /^\.vscode\/launch\.json$/i.test(filePath)
    || /\.code-workspace$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|py|go|sh|conf|ini)$/i.test(filePath);
}

function debugPathSignal(filePath: string): boolean {
  return /(debug|debugpy|delve|dlv|launch\.json|breakpoint|dap|vscode|inspect)/i.test(filePath);
}

function debugContentSignal(text: string): boolean {
  return /(DebugConfiguration|debugpy|dlv|Debug Adapter Protocol|launch\.json|breakpoint|logpoint|inspect-brk|sourceMapPathOverrides|pathMappings|wait_for_client|--headless|--listen|accept-multiclient)/i.test(text);
}

function debugSetupRows(sourceFiles: DebugSourceFile[]): DebugReadinessReport["debugSetups"] {
  const rows: DebugReadinessReport["debugSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const launchCount = countMatches(source.text, /"request"\s*:\s*"launch"|request\s*[:=]\s*["']?launch|launch\.json|debugpy\s+--listen|dlv\s+(debug|test)|program\s*:|runtimeExecutable/gi);
    const attachCount = countMatches(source.text, /"request"\s*:\s*"attach"|request\s*[:=]\s*["']?attach|Attach:\s*PID|--pid|\bpid\b|connect|listen|attachSimplePort|attachExistingChildren/gi);
    const breakpointCount = countMatches(source.text, /breakpoint|logpoint|conditional breakpoint|hit condition|exception breakpoint|function breakpoint/gi);
    const sourceMapCount = countMatches(source.text, /sourceMaps|sourceMapPathOverrides|smartStep|skipFiles|source-map|source map/gi);
    const pathMappingCount = countMatches(source.text, /pathMappings|localRoot|remoteRoot|cwd|webRoot|workspaceFolder|path translation|sourceMapPathOverrides/gi);
    const runtimeCount = countMatches(source.text, /--inspect|--inspect-brk|\bnode\b|\bbrowser\b|chrome|python\s+-m\s+debugpy|pytest|dlv\s+(debug|test|dap|core)|core dump|goroutine/gi);
    const adapterCount = countMatches(source.text, /Debug Adapter Protocol|debugAdapterPath|DebugConfiguration|debugServer|debugServerPort|\bDAP\b|adapter|@vscode\/debugadapter/gi);
    const logCount = countMatches(source.text, /trace|logToFile|debug logs|adapter logs|verbose|--log|--log-output|stack trace|goroutine/gi);
    const testCount = countMatches(source.text, /pytest|tox|dlv\s+test|go test|test explorer|vitest|jest/gi);
    const remoteCount = countMatches(source.text, /port|host|localhost|127\.0\.0\.1|5678|9229|--listen|accept-multiclient|subProcess|attachExistingChildren|container|ssh|WSL/gi);
    const safetyCount = countMatches(source.text, /wait-for-client|wait_for_client|localhost|127\.0\.0\.1|authorized|native attach|ptrace|debug port|production|security|do not expose|firewall/gi);
    const ciCount = countMatches(haystack, /\.github\/workflows|upload-artifact|artifact|CI|pull_request|schedule|runs-on/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = launchCount + attachCount + breakpointCount + sourceMapCount + pathMappingCount + runtimeCount + adapterCount + logCount + testCount + remoteCount + safetyCount + ciCount;
    if (totalSignals === 0 && !debugPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: debugPlatform(source),
      launchCount,
      attachCount,
      breakpointCount,
      sourceMapCount,
      pathMappingCount,
      runtimeCount,
      adapterCount,
      logCount,
      testCount,
      remoteCount,
      safetyCount,
      ciCount,
      readiness: (launchCount > 0 || attachCount > 0) && (adapterCount > 0 || runtimeCount > 0) && (breakpointCount > 0 || logCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains launch ${launchCount}, attach ${attachCount}, breakpoint ${breakpointCount}, source map ${sourceMapCount}, path mapping ${pathMappingCount}, runtime ${runtimeCount}, adapter ${adapterCount}, logs ${logCount}, tests ${testCount}, remote ${remoteCount}, safety ${safetyCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.launchCount + b.attachCount + b.breakpointCount + b.adapterCount + b.runtimeCount + b.remoteCount + b.ciCount;
    const aScore = a.launchCount + a.attachCount + a.breakpointCount + a.adapterCount + a.runtimeCount + a.remoteCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function debugPlatform(source: DebugSourceFile): DebugReadinessReport["debugSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (path.basename(source.filePath) === "package.json" && /(debug|inspect|vscode-js-debug|debugpy|delve|dlv)/i.test(source.text)) return "package-script";
  if (/^\.vscode\/launch\.json$/i.test(source.filePath) || /"request"\s*:\s*"(launch|attach)"/i.test(source.text)) return "launch-config";
  if (/debugpy|wait_for_client|justMyCode|pathMappings/i.test(haystack)) return "debugpy";
  if (/\bdlv\b|delve|--headless|accept-multiclient|dlv dap/i.test(haystack)) return "delve";
  if (/vscode-js-debug|js-debug|pwa-node|pwa-chrome|attachExistingChildren|sourceMapPathOverrides/i.test(haystack)) return "vscode-js-debug";
  if (/Debug Adapter Protocol|\bDAP\b|debugAdapterPath|debugServer/i.test(haystack)) return "dap";
  return "unknown";
}

function debugAdapterSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["adapterSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["adapterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "debug-adapter-protocol", pattern: /Debug Adapter Protocol|\bDAP\b|debugAdapterPath|debugServer|debugServerPort|@vscode\/debugadapter/i, evidence: "Debug Adapter Protocol evidence was detected." },
    { signal: "vscode-js-debug", pattern: /vscode-js-debug|js-debug|pwa-node|pwa-chrome|attachExistingChildren|sourceMapPathOverrides/i, evidence: "VS Code js-debug evidence was detected." },
    { signal: "debugpy", pattern: /debugpy|python\s+-m\s+debugpy|wait_for_client|justMyCode|pathMappings/i, evidence: "debugpy evidence was detected." },
    { signal: "delve-dap", pattern: /\bdlv\b|delve|dlv dap|--headless|accept-multiclient/i, evidence: "Delve/DAP evidence was detected." },
    { signal: "chrome-devtools", pattern: /chrome|browser|--inspect|--inspect-brk|\b9229\b/i, evidence: "Chrome DevTools or Node inspector evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "adapter");
}

function debugModeSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["modeSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["modeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "launch", pattern: /"request"\s*:\s*"launch"|request\s*[:=]\s*["']?launch|dlv\s+debug|dlv\s+test|program\s*:|runtimeExecutable/i, evidence: "launch-mode evidence was detected." },
    { signal: "attach", pattern: /"request"\s*:\s*"attach"|request\s*[:=]\s*["']?attach|Attach:\s*PID|--pid|\bpid\b|attachSimplePort|attachExistingChildren/i, evidence: "attach-mode evidence was detected." },
    { signal: "remote-attach", pattern: /remote|host|port|localhost|127\.0\.0\.1|5678|9229|attachExistingChildren|subProcess/i, evidence: "remote attach evidence was detected." },
    { signal: "headless", pattern: /--headless|headless/i, evidence: "headless debugger evidence was detected." },
    { signal: "listen", pattern: /--listen|debugpy\.listen|listen|debugServerPort/i, evidence: "listen-mode evidence was detected." },
    { signal: "connect", pattern: /--connect|debugpy\.connect|connect|address/i, evidence: "connect-mode evidence was detected." },
    { signal: "wait-for-client", pattern: /--wait-for-client|wait_for_client|wait for client/i, evidence: "wait-for-client evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "mode");
}

function debugBreakpointSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["breakpointSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["breakpointSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "line-breakpoint", pattern: /breakpoint|set breakpoints|line breakpoint/i, evidence: "line breakpoint evidence was detected." },
    { signal: "conditional-breakpoint", pattern: /conditional breakpoint|condition\s*:|conditional/i, evidence: "conditional breakpoint evidence was detected." },
    { signal: "logpoint", pattern: /logpoint|log point/i, evidence: "logpoint evidence was detected." },
    { signal: "function-breakpoint", pattern: /function breakpoint|functionBreakpoint/i, evidence: "function breakpoint evidence was detected." },
    { signal: "exception-breakpoint", pattern: /exception breakpoint|exceptionBreakpoints|caught exceptions|uncaught exceptions/i, evidence: "exception breakpoint evidence was detected." },
    { signal: "hit-condition", pattern: /hit condition|hitCondition|hit count/i, evidence: "hit condition evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "breakpoint");
}

function debugMappingSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["mappingSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["mappingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "source-map", pattern: /sourceMaps|source-map|source map/i, evidence: "source map evidence was detected." },
    { signal: "source-map-overrides", pattern: /sourceMapPathOverrides/i, evidence: "source map override evidence was detected." },
    { signal: "skip-files", pattern: /skipFiles|skip files/i, evidence: "skipFiles evidence was detected." },
    { signal: "smart-step", pattern: /smartStep|smart step/i, evidence: "smartStep evidence was detected." },
    { signal: "path-mappings", pattern: /pathMappings|localRoot|remoteRoot|path translation/i, evidence: "path mapping evidence was detected." },
    { signal: "cwd-root", pattern: /\bcwd\b|webRoot|workspaceFolder/i, evidence: "cwd/webRoot/workspaceFolder evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "mapping");
}

function debugRuntimeSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "node-inspect", pattern: /--inspect|--inspect-brk|\bnode\b|runtimeExecutable/i, evidence: "Node inspector evidence was detected." },
    { signal: "browser-debug", pattern: /chrome|browser|pwa-chrome|url\s*:|webRoot/i, evidence: "browser debugging evidence was detected." },
    { signal: "python-module", pattern: /python\s+-m\s+debugpy|debugpy\.listen|debugpy\.connect|justMyCode/i, evidence: "Python debugpy module evidence was detected." },
    { signal: "pytest-debug", pattern: /pytest|tox|debugging pytest/i, evidence: "pytest debugging evidence was detected." },
    { signal: "go-dlv", pattern: /\bdlv\b|delve|dlv\s+(debug|test|dap)/i, evidence: "Go Delve evidence was detected." },
    { signal: "core-dump", pattern: /core dump|dlv\s+core|core file/i, evidence: "core dump debugging evidence was detected." },
    { signal: "native-attach", pattern: /native attach|ptrace|attach binaries|Attach:\s*PID|\bpid\b/i, evidence: "native/PID attach evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "runtime");
}

function debugRemoteSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["remoteSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["remoteSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "port", pattern: /\bport\b|\b5678\b|\b9229\b|--listen|debugServerPort/i, evidence: "debug port evidence was detected." },
    { signal: "host", pattern: /\bhost\b|localhost|127\.0\.0\.1|address/i, evidence: "debug host evidence was detected." },
    { signal: "pid", pattern: /\bpid\b|Attach:\s*PID|--pid/i, evidence: "PID attach evidence was detected." },
    { signal: "subprocess", pattern: /subProcess|subprocess|attachExistingChildren/i, evidence: "subprocess attach evidence was detected." },
    { signal: "multiclient", pattern: /accept-multiclient|multi[- ]?client/i, evidence: "multi-client debug evidence was detected." },
    { signal: "container", pattern: /container|docker|devcontainer/i, evidence: "container debug evidence was detected." },
    { signal: "ssh-wsl", pattern: /\bssh\b|\bWSL\b|remoteRoot|localRoot/i, evidence: "SSH/WSL remote path evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "remote");
}

function debugDiagnosticSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["diagnosticSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["diagnosticSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trace", pattern: /\btrace\b|trace\s*:\s*true/i, evidence: "trace diagnostic evidence was detected." },
    { signal: "debug-logs", pattern: /debug logs|logToFile|--log\b|log file/i, evidence: "debug log evidence was detected." },
    { signal: "adapter-logs", pattern: /adapter logs|debugAdapterPath|debugServer|--log-output/i, evidence: "adapter log evidence was detected." },
    { signal: "verbose", pattern: /verbose|debug log level/i, evidence: "verbose diagnostic evidence was detected." },
    { signal: "stack-trace", pattern: /stack trace|stacktrace|stack frame/i, evidence: "stack trace evidence was detected." },
    { signal: "goroutine", pattern: /goroutine|dlv goroutine/i, evidence: "goroutine diagnostic evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "diagnostic");
}

function debugPackageSignals(sourceFiles: DebugSourceFile[]): DebugReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DebugReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vscode-js-debug", pattern: /vscode-js-debug|js-debug/i, evidence: "vscode-js-debug package evidence was detected." },
    { signal: "debugpy", pattern: /debugpy/i, evidence: "debugpy package evidence was detected." },
    { signal: "delve", pattern: /\bdlv\b|delve/i, evidence: "Delve package/command evidence was detected." },
    { signal: "@vscode/debugadapter", pattern: /@vscode\/debugadapter/i, evidence: "@vscode/debugadapter package evidence was detected." },
    { signal: "vscode", pattern: /"vscode"|\.vscode|code-workspace/i, evidence: "VS Code workspace/config evidence was detected." }
  ];
  return debugSignalFromSpecs(sourceFiles, specs, "package");
}

function debugSignalFromSpecs<T extends string>(
  sourceFiles: DebugSourceFile[],
  specs: Array<{ signal: T; pattern: RegExp; evidence: string }>,
  label: string
): Array<{ signal: T; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(haystack);
    });
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/debug-readiness.html"
    };
  });
}

export async function buildCrashReportingReadinessReport(walk: WalkResult): Promise<CrashReportingReadinessReport> {
  const sourceFiles = await crashReportingSourceFiles(walk);
  const crashSetups = crashReportingSetupRows(sourceFiles);
  const captureSignals = crashCaptureSignals(sourceFiles);
  const releaseSignals = crashReleaseSignals(sourceFiles);
  const symbolicationSignals = crashSymbolicationSignals(sourceFiles);
  const contextSignals = crashContextSignals(sourceFiles);
  const privacySignals = crashPrivacySignals(sourceFiles);
  const deliverySignals = crashDeliverySignals(sourceFiles);
  const workflowSignals = crashWorkflowSignals(sourceFiles);
  const packageSignals = crashPackageSignals(sourceFiles);

  const hasCapture = captureSignals.some((item) => item.readiness === "ready")
    || crashSetups.some((item) => item.eventCount + item.stacktraceCount > 0);
  const hasRelease = releaseSignals.some((item) => item.readiness === "ready")
    || crashSetups.some((item) => item.releaseCount > 0);
  const hasSymbolication = symbolicationSignals.some((item) => item.readiness === "ready")
    || crashSetups.some((item) => item.sourceMapCount + item.debugIdCount + item.symbolCount > 0);
  const hasPrivacy = privacySignals.some((item) => item.readiness === "ready")
    || crashSetups.some((item) => item.privacyCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready")
    || crashSetups.some((item) => item.artifactCount + item.ciCount > 0);

  const riskQueue: CrashReportingReadinessReport["riskQueue"] = [];
  if (!hasCapture) {
    riskQueue.push({
      priority: "high",
      action: "Add or document crash/event capture before claiming crash reporting readiness.",
      why: "Crash reporting needs visible Sentry, Bugsnag, Rollbar, native crash, unhandled exception, or manual notify evidence.",
      relatedHref: "html/crash-reporting-readiness.html"
    });
  }
  if (hasCapture && !hasRelease) {
    riskQueue.push({
      priority: "medium",
      action: "Attach release, dist, environment, appVersion, code_version, commit SHA, or deploy tracking to crash events.",
      why: "Crash reports are hard to reproduce unless events can be tied to a specific build or release.",
      relatedHref: "html/crash-reporting-readiness.html"
    });
  }
  if (hasRelease && !hasSymbolication) {
    riskQueue.push({
      priority: "medium",
      action: "Add source map, debug ID, artifact bundle, dSYM, ProGuard mapping, or symbolication upload evidence.",
      why: "Release identity alone does not make minified JavaScript, native frames, or obfuscated mobile stacks readable.",
      relatedHref: "html/crash-reporting-readiness.html"
    });
  }
  if (hasCapture && !hasPrivacy) {
    riskQueue.push({
      priority: "medium",
      action: "Document beforeSend, onError, scrub fields, PII toggles, payload truncation, sampling, or rate limits.",
      why: "Crash payloads often include user, request, stack, and metadata fields that need explicit privacy controls.",
      relatedHref: "html/crash-reporting-readiness.html"
    });
  }
  if (hasSymbolication && !hasWorkflow) {
    riskQueue.push({
      priority: "medium",
      action: "Add CI release commands or artifact upload evidence for source maps and symbol files.",
      why: "Symbolication evidence is fragile unless the release workflow uploads and preserves the needed artifacts.",
      relatedHref: "html/crash-reporting-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static crash reporting readiness only; it does not send crash events, upload source maps, upload symbols, contact Sentry/Bugsnag/Rollbar, or inspect production incidents.",
    why: "Crash event delivery, artifact upload, and production incident review must run only through authorized release or test workflows.",
    relatedHref: "html/crash-reporting-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Sentry/Bugsnag/Rollbar-style crash reporting readiness report: setup ${crashSetups.length} files, capture signals ${captureSignals.length}, release signals ${releaseSignals.length}, symbolication signals ${symbolicationSignals.length} were mapped from static evidence.`,
    sourcePattern: "Crash reporting readiness Sentry Bugsnag Rollbar release source maps debug IDs dSYM ProGuard stacktrace breadcrumbs sessions privacy alerts",
    crashSetups,
    captureSignals,
    releaseSignals,
    symbolicationSignals,
    contextSignals,
    privacySignals,
    deliverySignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"Sentry.init|captureException|Bugsnag.start|Bugsnag.notify|new Rollbar|Rollbar\\.(error|critical|warning)\" .", purpose: "Find crash capture setup without sending crash events." },
      { command: "rg \"release|dist|appVersion|code_version|releaseStage|environment|commit|deploy\" .", purpose: "Find release, environment, and deploy identity attached to crash reports." },
      { command: "rg \"sourcemap|source map|sourceMap|debugId|debug_id|artifact bundle|dSYM|ProGuard|mapping.txt|symbolication\" .", purpose: "Find source map, debug ID, symbol, dSYM, ProGuard, and symbolication evidence." },
      { command: "rg \"beforeSend|onError|scrubFields|scrubPaths|sendDefaultPii|dataCollection|payload truncation|maxEvents|maxItems|sampleRate\" .", purpose: "Find privacy filtering, payload scrubbing, truncation, sampling, and rate-limit evidence." }
    ],
    learnerNextSteps: [
      "Start with event capture, then verify release identity is attached to every crash event.",
      "Check source maps, debug IDs, artifact bundles, dSYM uploads, ProGuard mapping files, and stacktrace linking before trusting symbolicated frames.",
      "Review breadcrumbs, sessions, tags, user context, severity, and fingerprinting to understand crash context.",
      "Confirm beforeSend, onError, scrub fields, PII toggles, payload truncation, sampling, and rate limiting before production use.",
      "This report is static readiness only. Real crash delivery and artifact upload claims need an authorized release or test workflow."
    ]
  };
}

type CrashReportingSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function crashReportingSourceFiles(walk: WalkResult): Promise<CrashReportingSourceFile[]> {
  const files: CrashReportingSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !crashReportingInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!crashReportingPathSignal(file.relPath) && !crashReportingContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function crashReportingInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|bun\.lockb?|sentry\..*|bugsnag\..*|rollbar\..*|vite\.config\..*|webpack\.config\..*|next\.config\..*|metro\.config\..*|app\.json|app\.config\..*|Info\.plist|proguard-rules\.pro|mapping\.txt|Dockerfile|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(js|ts|mjs|cjs|json|ya?ml|toml|md|py|go|sh|conf|ini|plist|properties|gradle)$/i.test(filePath);
}

function crashReportingPathSignal(filePath: string): boolean {
  return /(sentry|bugsnag|rollbar|crash|sourcemap|source-map|symbolicat|dsym|proguard|mapping|release)/i.test(filePath);
}

function crashReportingContentSignal(text: string): boolean {
  return /(Sentry\.init|captureException|beforeSend|sentry-cli|withSentryConfig|Bugsnag\.start|Bugsnag\.notify|onError|onSession|Rollbar|code_version|scrubFields|sourceMap|debugId|debug_id|dSYM|ProGuard|stacktrace|breadcrumbs|releaseStage|appVersion|notifyReleaseStages)/i.test(text);
}

function crashReportingSetupRows(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["crashSetups"] {
  const rows: CrashReportingReadinessReport["crashSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const eventCount = countMatches(source.text, /captureException|captureMessage|Bugsnag\.notify|Rollbar\.(error|critical|warning|info)|notify\(|uncaughtException|unhandledRejection|native crash|crash/gi);
    const releaseCount = countMatches(source.text, /release|dist|appVersion|code_version|releaseStage|environment|deploy|commit|HEROKU_BUILD_COMMIT|notifyReleaseStages/gi);
    const sourceMapCount = countMatches(source.text, /sourceMap|source map|sourcemap|sentry-cli.*sourcemaps|upload.*source.*map|withSentryConfig/gi);
    const debugIdCount = countMatches(source.text, /debug id|debugId|debug_id|artifact bundle|artifact-bundle/gi);
    const symbolCount = countMatches(source.text, /dSYM|dsym|ProGuard|mapping\.txt|symbolicat|symbolication|symbol file|native symbol|upload.*symbols/gi);
    const stacktraceCount = countMatches(source.text, /stacktrace|stack trace|trace\.frames|trace_chain|frames|exception/gi);
    const breadcrumbCount = countMatches(source.text, /breadcrumb|breadcrumbs|leaveBreadcrumb/gi);
    const sessionCount = countMatches(source.text, /session|sessions|onSession|startSession|autoTrackSessions/gi);
    const privacyCount = countMatches(source.text, /beforeSend|onError|scrubFields|scrubPaths|sendDefaultPii|PII|dataCollection|payload truncation|truncate|maxEvents|maxItems|sampleRate/gi);
    const alertCount = countMatches(source.text, /alert|notification|notifyReleaseStages|severity|level|critical|warning|error/gi);
    const artifactCount = countMatches(source.text, /artifact|upload-artifact|build artifact|source maps|dSYM|mapping\.txt|debug files/gi);
    const ciCount = countMatches(haystack, /\.github\/workflows|upload-artifact|CI|pull_request|schedule|runs-on|SENTRY_AUTH_TOKEN|BUGSNAG_API_KEY|ROLLBAR_ACCESS_TOKEN/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = eventCount + releaseCount + sourceMapCount + debugIdCount + symbolCount + stacktraceCount + breadcrumbCount + sessionCount + privacyCount + alertCount + artifactCount + ciCount;
    if (totalSignals === 0 && !crashReportingPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: crashReportingPlatform(source),
      eventCount,
      releaseCount,
      sourceMapCount,
      debugIdCount,
      symbolCount,
      stacktraceCount,
      breadcrumbCount,
      sessionCount,
      privacyCount,
      alertCount,
      artifactCount,
      ciCount,
      readiness: (eventCount > 0 || stacktraceCount > 0) && releaseCount > 0 && (sourceMapCount + debugIdCount + symbolCount > 0) && privacyCount > 0 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains event ${eventCount}, release ${releaseCount}, source map ${sourceMapCount}, debug ID ${debugIdCount}, symbols ${symbolCount}, stacktrace ${stacktraceCount}, breadcrumbs ${breadcrumbCount}, sessions ${sessionCount}, privacy ${privacyCount}, alerts ${alertCount}, artifacts ${artifactCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.eventCount + b.releaseCount + b.sourceMapCount + b.debugIdCount + b.symbolCount + b.privacyCount + b.artifactCount + b.ciCount;
    const aScore = a.eventCount + a.releaseCount + a.sourceMapCount + a.debugIdCount + a.symbolCount + a.privacyCount + a.artifactCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function crashReportingPlatform(source: CrashReportingSourceFile): CrashReportingReadinessReport["crashSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (path.basename(source.filePath) === "package.json" && /(sentry|bugsnag|rollbar|sourcemap|source-map|release)/i.test(source.text)) return "package-script";
  if (/dSYM|dsym|ProGuard|mapping\.txt|symbolicat|symbolication|Info\.plist|proguard-rules\.pro/i.test(haystack)) return "symbol-file-config";
  if (/sourceMap|source map|sourcemap|debugId|debug_id|artifact bundle|artifact-bundle/i.test(haystack)) return "source-map-config";
  if (/Bugsnag\.start|Bugsnag\.notify|@bugsnag\/js|bugsnag-source-maps/i.test(haystack)) return "bugsnag";
  if (/Rollbar|code_version|rollbar/i.test(haystack)) return "rollbar";
  if (/Sentry\.init|captureException|@sentry\/|sentry-cli|withSentryConfig/i.test(haystack)) return "sentry";
  if (/native crash|crash dump|dSYM|ProGuard|symbol file/i.test(haystack)) return "native-crash";
  return "unknown";
}

function crashCaptureSignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["captureSignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["captureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "exception-capture", pattern: /captureException|Bugsnag\.notify|Rollbar\.(error|critical|warning|info)|exception/i, evidence: "exception capture evidence was detected." },
    { signal: "unhandled-exception", pattern: /uncaughtException|captureUncaught|uncaught exceptions|UnhandledException/i, evidence: "unhandled exception evidence was detected." },
    { signal: "unhandled-rejection", pattern: /unhandledRejection|captureUnhandledRejections|unhandled rejection/i, evidence: "unhandled rejection evidence was detected." },
    { signal: "native-crash", pattern: /native crash|dSYM|dsym|ProGuard|crash dump|symbol file/i, evidence: "native crash or native symbol evidence was detected." },
    { signal: "manual-notify", pattern: /Bugsnag\.notify|Rollbar\.(error|critical|warning|info)|captureMessage|notify\(/i, evidence: "manual notify evidence was detected." },
    { signal: "event-pipeline", pattern: /beforeSend|onError|transform\(payload\)|payload|event pipeline|Event/i, evidence: "event pipeline evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "capture");
}

function crashReleaseSignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["releaseSignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["releaseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "release-version", pattern: /\brelease\b|appVersion|code_version/i, evidence: "release version evidence was detected." },
    { signal: "dist-build", pattern: /\bdist\b|buildUUID|build artifact|build id/i, evidence: "dist/build identity evidence was detected." },
    { signal: "environment-stage", pattern: /environment|releaseStage|notifyReleaseStages|production|staging/i, evidence: "environment or release-stage evidence was detected." },
    { signal: "commit-sha", pattern: /commit|COMMIT_SHA|HEROKU_BUILD_COMMIT|GITHUB_SHA/i, evidence: "commit SHA evidence was detected." },
    { signal: "deploy-tracking", pattern: /deploy|deployment|release command|release:sentry|release:bugsnag|release:rollbar/i, evidence: "deploy tracking evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "release");
}

function crashSymbolicationSignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["symbolicationSignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["symbolicationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "source-map-upload", pattern: /sourcemap|source map|sourceMap|sentry-cli.*sourcemaps|upload.*source.*map|bugsnag-source-maps|rollbar-sourcemap|withSentryConfig/i, evidence: "source map upload evidence was detected." },
    { signal: "debug-id", pattern: /debug id|debugId|debug_id/i, evidence: "debug ID evidence was detected." },
    { signal: "artifact-bundle", pattern: /artifact bundle|artifact-bundle|debug files|build artifact/i, evidence: "artifact bundle evidence was detected." },
    { signal: "dsym", pattern: /dSYM|dsym/i, evidence: "dSYM evidence was detected." },
    { signal: "proguard-mapping", pattern: /ProGuard|mapping\.txt|proguard-rules/i, evidence: "ProGuard mapping evidence was detected." },
    { signal: "stacktrace-linking", pattern: /stacktrace|stack trace|trace\.frames|trace_chain|symbolication|frames/i, evidence: "stacktrace linking evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "symbolication");
}

function crashContextSignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["contextSignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "breadcrumbs", pattern: /breadcrumb|breadcrumbs|leaveBreadcrumb|addBreadcrumb/i, evidence: "breadcrumb evidence was detected." },
    { signal: "sessions", pattern: /session|sessions|onSession|startSession|autoTrackSessions/i, evidence: "session evidence was detected." },
    { signal: "user-context", pattern: /setUser|user context|user:/i, evidence: "user context evidence was detected." },
    { signal: "tags-metadata", pattern: /setTag|tags|metadata|addMetadata|context/i, evidence: "tags or metadata evidence was detected." },
    { signal: "severity-level", pattern: /severity|level|critical|warning|error/i, evidence: "severity or level evidence was detected." },
    { signal: "fingerprint-grouping", pattern: /fingerprint|grouping|group by/i, evidence: "fingerprint or grouping evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "context");
}

function crashPrivacySignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["privacySignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["privacySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "before-send", pattern: /beforeSend/i, evidence: "beforeSend privacy evidence was detected." },
    { signal: "on-error-filter", pattern: /onError|return false|filter/i, evidence: "onError/filter evidence was detected." },
    { signal: "scrub-fields", pattern: /scrubFields|scrubPaths|scrub fields|scrub paths|authorization|password/i, evidence: "scrub field/path evidence was detected." },
    { signal: "pii-toggle", pattern: /sendDefaultPii|PII|personally identifiable|dataCollection/i, evidence: "PII toggle evidence was detected." },
    { signal: "payload-truncation", pattern: /payload truncation|truncate|truncation|max payload|maxEvents|maxItems/i, evidence: "payload truncation evidence was detected." },
    { signal: "sampling-rate-limit", pattern: /sampleRate|tracesSampleRate|itemsPerMinute|maxItems|rate limit|rateLimiter/i, evidence: "sampling or rate-limit evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "privacy");
}

function crashDeliverySignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["deliverySignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["deliverySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dsn-access-token", pattern: /dsn|accessToken|SENTRY_AUTH_TOKEN|BUGSNAG_API_KEY|ROLLBAR_ACCESS_TOKEN/i, evidence: "DSN/API key/access-token reference was detected." },
    { signal: "notify-endpoint", pattern: /notify endpoint|notifyEndpoint|endpoints:\s*{[^}]*notify|\/notify/i, evidence: "notify endpoint evidence was detected." },
    { signal: "sessions-endpoint", pattern: /sessions endpoint|sessionsEndpoint|endpoints:\s*{[^}]*sessions|\/sessions/i, evidence: "sessions endpoint evidence was detected." },
    { signal: "offline-queue", pattern: /offline queue|queue|replay|send attempts|retry/i, evidence: "offline queue or retry evidence was detected." },
    { signal: "retry-rate-limit", pattern: /retry|rate limit|rateLimiter|itemsPerMinute|maxItems/i, evidence: "retry or rate-limit evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "delivery");
}

function crashWorkflowSignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ci-upload", pattern: /\.github\/workflows|runs-on|CI|SENTRY_AUTH_TOKEN|BUGSNAG_API_KEY|ROLLBAR_ACCESS_TOKEN/i, evidence: "CI upload workflow evidence was detected." },
    { signal: "release-command", pattern: /release:sentry|release:bugsnag|release:rollbar|sentry-cli|bugsnag-source-maps|rollbar-sourcemap/i, evidence: "release command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact|build artifact|debug files/i, evidence: "artifact upload evidence was detected." },
    { signal: "sourcemap-test", pattern: /sourcemap test|source map test|sourceMap test/i, evidence: "sourcemap test evidence was detected." },
    { signal: "crash-smoke-test", pattern: /crash smoke test|smoke test.*crash|crash.*smoke/i, evidence: "crash smoke test evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "workflow");
}

function crashPackageSignals(sourceFiles: CrashReportingSourceFile[]): CrashReportingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CrashReportingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@sentry/*", pattern: /@sentry\/|Sentry\.init|sentry-cli/i, evidence: "Sentry package/setup evidence was detected." },
    { signal: "@bugsnag/js", pattern: /@bugsnag\/js|Bugsnag\.start|Bugsnag\.notify/i, evidence: "Bugsnag package/setup evidence was detected." },
    { signal: "rollbar", pattern: /"rollbar"|new Rollbar|Rollbar\./i, evidence: "Rollbar package/setup evidence was detected." },
    { signal: "sentry-cli", pattern: /sentry-cli/i, evidence: "sentry-cli evidence was detected." },
    { signal: "bugsnag-source-maps", pattern: /bugsnag-source-maps|@bugsnag\/source-maps/i, evidence: "Bugsnag source-map upload package evidence was detected." }
  ];
  return crashReportingSignalFromSpecs(sourceFiles, specs, "package");
}

function crashReportingSignalFromSpecs<T extends string>(
  sourceFiles: CrashReportingSourceFile[],
  specs: Array<{ signal: T; pattern: RegExp; evidence: string }>,
  label: string
): Array<{ signal: T; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(haystack);
    });
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/crash-reporting-readiness.html"
    };
  });
}
