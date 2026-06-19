import path from "node:path";
import type { StepsReadinessReport, TimerReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildTimerReadinessReport(walk: WalkResult): Promise<TimerReadinessReport> {
  const sourceFiles = await timerReadinessSourceFiles(walk);
  const timerSetups = timerReadinessSetups(sourceFiles);
  const frameworkSignals = timerReadinessFrameworkSignals(sourceFiles);
  const structureSignals = timerReadinessStructureSignals(sourceFiles);
  const stateSignals = timerReadinessStateSignals(sourceFiles);
  const timeSignals = timerReadinessTimeSignals(sourceFiles);
  const controlSignals = timerReadinessControlSignals(sourceFiles);
  const accessibilitySignals = timerReadinessAccessibilitySignals(sourceFiles);
  const validationSignals = timerReadinessValidationSignals(sourceFiles);
  const machineSignals = timerReadinessMachineSignals(sourceFiles);
  const computedSignals = timerReadinessComputedSignals(sourceFiles);
  const effectSignals = timerReadinessEffectSignals(sourceFiles);
  const actionSignals = timerReadinessActionSignals(sourceFiles);
  const guardSignals = timerReadinessGuardSignals(sourceFiles);
  const domSignals = timerReadinessDomSignals(sourceFiles);
  const apiSignals = timerReadinessApiSignals(sourceFiles);
  const parseSignals = timerReadinessParseSignals(sourceFiles);
  const testSignals = timerReadinessTestSignals(sourceFiles);
  const packageSignals = timerReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.rootCount > 0 && item.areaCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.stateCount > 0);
  const hasTime = timeSignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.timeCount > 0);
  const hasControls = controlSignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.actionCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.accessibilityCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.validationCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || timerSetups.some((item) => item.testCount > 0);

  const riskQueue: TimerReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document timer root, area, item, separator, control, and action trigger structure before claiming timer readiness.",
      why: "Timer readiness starts with a traceable displayed timer surface and controls.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace idle, running, paused, temporary running, and auto-start state transitions.",
      why: "Timer controls can render while the state machine cannot prove pause/resume/restart behavior.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTime) {
    riskQueue.push({
      priority: "high",
      action: "Trace time parts, formatted time, progress percent, countdown, startMs, targetMs, and interval settings.",
      why: "Timer correctness depends on elapsed/remaining time math, formatting, and progress bounds.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasControls) {
    riskQueue.push({
      priority: "medium",
      action: "Trace start, pause, resume, reset, restart, tick, and completion callbacks.",
      why: "A timer display without explicit control and completion evidence can drift from expected UX behavior.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify role=timer, aria-label, aria-atomic updates, aria-hidden separators, and hidden action rules.",
      why: "Timer updates need screen-reader-safe announcements and non-noisy separators/actions.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Document positive interval, nonnegative start/target values, and countdown/stopwatch configuration validation.",
      why: "Bad timer props can silently create negative, non-terminating, or over-fast timers.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add fake timer, click, aria, progress, and artifact tests.",
      why: "Static timer evidence does not prove ticks, state transitions, progress, or completion callbacks.",
      relatedHref: "html/timer-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual elapsed/remaining timing and completion behavior with trusted component tests outside RepoTutor.",
    why: "RepoTutor records timer readiness only; it does not advance real clocks, run requestAnimationFrame loops, invoke callbacks, click controls, or run analyzed project tests.",
    relatedHref: "html/timer-readiness.html"
  });

  return {
    summary: `Timer readiness report: setup ${timerSetups.length} files, time signal ${timeSignals.length}, control signal ${controlSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Timer readiness Zag timer countdown stopwatch interval tick progress controls aria timer completion tests",
    timerSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    timeSignals,
    controlSignals,
    accessibilitySignals,
    validationSignals,
    machineSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    guardSignals,
    domSignals,
    apiSignals,
    parseSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/timer|timer\\.machine|timer\\.connect|getAreaProps|getActionTriggerProps\" package.json src app packages", purpose: "Find Zag timer machine, connect API, displayed timer area, and action trigger props." },
      { command: "rg \"autoStart|countdown|startMs|targetMs|interval|formattedTime|progressPercent|msToTime|formatTime\" src app packages", purpose: "Check timer mode, duration inputs, display formatting, and progress calculation evidence." },
      { command: "rg \"START|PAUSE|RESUME|RESET|RESTART|TICK|CONTINUE|onTick|onComplete|setRafInterval|setRafTimeout\" src app packages", purpose: "Trace timer controls, tick loop, and completion callbacks." },
      { command: "rg \"role=['\\\"]timer|aria-atomic|aria-hidden|fakeTimers|advanceTimersByTime|timer-traces|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility, fake timer tests, progress assertions, and artifacts." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag timer, native timer markup, or a custom countdown/stopwatch implementation.",
      "Trace root, area, item, label, value, separator, control, and action trigger structure before reviewing timer behavior.",
      "Map idle/running/paused/auto-start state, time parts, formattedTime, progressPercent, countdown, startMs, targetMs, interval, and tick callbacks.",
      "Check role=timer, aria labels, aria-atomic updates, aria-hidden separators, hidden action rules, fake timer tests, control clicks, progress assertions, and artifact traces.",
      "This report is static readiness. Actual clock advancement, RAF interval behavior, callback order, and project tests need trusted QA."
    ]
  };
}

type TimerReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function timerReadinessSourceFiles(walk: WalkResult): Promise<TimerReadinessSourceFile[]> {
  const files: TimerReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !timerReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!timerReadinessPathSignal(file.relPath) && !timerReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function timerReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return timerReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function timerReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(timer|countdown|stopwatch|clock|elapsed|duration)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function timerReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/timer|timer\.machine|timer\.connect|getAreaProps|getActionTriggerProps|data-timer-root|role=['"]timer|timer-traces|formattedTime|progressPercent)/i.test(text);
}

function timerReadinessSetups(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["timerSetups"] {
  const rows: TimerReadinessReport["timerSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(timer\.machine|timer\.connect|getRootProps|data-timer-root|timer root)/gi);
    const areaCount = countMatches(source.text, /(getAreaProps|data-timer-area|role=['"]timer|role timer|getAreaId|getAreaEl)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|data-timer-item|getItemLabelProps|getItemValueProps|TimePart|days|hours|minutes|seconds|milliseconds)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-timer-control|timer control)/gi);
    const actionCount = countMatches(source.text, /(getActionTriggerProps|data-action-trigger|api\.(start|pause|resume|reset|restart)|START|PAUSE|RESUME|RESET|RESTART|<button)/gi);
    const stateCount = countMatches(source.text, /(idle|running:temp|running-temp|running|paused|autoStart|auto-start|api\.running|api\.paused)/gi);
    const timeCount = countMatches(source.text, /(time|formattedTime|msToTime|formatTime|TimePart|days|hours|minutes|seconds|milliseconds|startMs|targetMs|countdown|interval)/gi);
    const tickCount = countMatches(source.text, /(TICK|CONTINUE|setRafInterval|setRafTimeout|keepTicking|waitForNextTick|onTick|invokeOnTick|interval)/gi);
    const progressCount = countMatches(source.text, /(progressPercent|toPercent|<progress|role=['"]progressbar|Timer progress)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]timer|aria-label|aria-atomic|aria-hidden|areaLabel|getByRole\(['"]timer|hidden actions|hidden action|getActionTriggerProps)/gi);
    const validationCount = countMatches(source.text, /(validate|validate props|positive interval|nonnegative start|nonnegative target|countdown config|stopwatch config|startMs|targetMs|interval)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|useFakeTimers|advanceTimersByTime|user\.click|getByRole|click-test|aria-test|progress-test|timer-traces|upload-artifact)/gi);
    const total = rootCount + areaCount + itemCount + controlCount + actionCount + stateCount + timeCount + tickCount + progressCount + accessibilityCount + validationCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && areaCount > 0 && itemCount > 0 && actionCount > 0 && stateCount > 0 && timeCount > 0 && tickCount > 0 && progressCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: timerReadinessFramework(source),
      rootCount,
      areaCount,
      itemCount,
      controlCount,
      actionCount,
      stateCount,
      timeCount,
      tickCount,
      progressCount,
      accessibilityCount,
      validationCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, area ${areaCount}, item ${itemCount}, control ${controlCount}, action ${actionCount}, state ${stateCount}, time ${timeCount}, tick ${tickCount}, progress ${progressCount}, accessibility ${accessibilityCount}, validation ${validationCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.timeCount + b.actionCount + b.tickCount + b.accessibilityCount - (a.timeCount + a.actionCount + a.tickCount + a.accessibilityCount));
}

function timerReadinessFramework(source: TimerReadinessSourceFile): TimerReadinessReport["timerSetups"][number]["framework"] {
  if (/@zag-js\/timer|timer\.machine|timer\.connect|getAreaProps|getActionTriggerProps/i.test(source.text)) return "zag-timer";
  if (/data-timer-root|role=['"]timer|data-timer-control|<progress/i.test(source.text)) return "native-timer";
  if (/timer|countdown|stopwatch|elapsed|duration/i.test(source.text)) return "custom";
  return "unknown";
}

function timerReadinessFrameworkSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-timer", pattern: /@zag-js\/timer|timer\.machine|timer\.connect|getAreaProps|getActionTriggerProps/i, evidence: "Zag timer evidence was detected." },
    { signal: "native-timer", pattern: /data-timer-root|role=['"]timer|data-timer-control|<progress/i, evidence: "native timer evidence was detected." },
    { signal: "custom", pattern: /timer|countdown|stopwatch|elapsed|duration/i, evidence: "custom timer evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function timerReadinessStructureSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["structureSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-timer-root|timer\.machine/i, evidence: "root evidence was detected." },
    { signal: "area", pattern: /getAreaProps|data-timer-area|role=['"]timer|getAreaId|getAreaEl/i, evidence: "area evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-timer-control/i, evidence: "control evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-timer-item|TimePart|days|hours|minutes|seconds|milliseconds/i, evidence: "item evidence was detected." },
    { signal: "item-label", pattern: /getItemLabelProps|data-timer-label|itemLabel|label/i, evidence: "item label evidence was detected." },
    { signal: "item-value", pattern: /getItemValueProps|data-timer-value|itemValue|api\.time/i, evidence: "item value evidence was detected." },
    { signal: "separator", pattern: /getSeparatorProps|data-timer-separator|separator|aria-hidden/i, evidence: "separator evidence was detected." },
    { signal: "action-trigger", pattern: /getActionTriggerProps|data-action-trigger|actionTrigger|START|PAUSE|RESUME|RESET|RESTART/i, evidence: "action trigger evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function timerReadinessStateSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["stateSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "running", pattern: /\brunning\b|api\.running/i, evidence: "running state evidence was detected." },
    { signal: "paused", pattern: /\bpaused\b|api\.paused/i, evidence: "paused state evidence was detected." },
    { signal: "running-temp", pattern: /running:temp|running-temp|temp/i, evidence: "temporary running state evidence was detected." },
    { signal: "auto-start", pattern: /autoStart|auto-start/i, evidence: "auto-start evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function timerReadinessTimeSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["timeSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["timeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "time-parts", pattern: /days|hours|minutes|seconds|milliseconds|TimePart|api\.time/i, evidence: "time parts evidence was detected." },
    { signal: "formatted-time", pattern: /formattedTime|formatTime/i, evidence: "formatted time evidence was detected." },
    { signal: "progress-percent", pattern: /progressPercent|toPercent|<progress/i, evidence: "progress percent evidence was detected." },
    { signal: "countdown", pattern: /countdown/i, evidence: "countdown evidence was detected." },
    { signal: "start-ms", pattern: /startMs|nonnegative start/i, evidence: "startMs evidence was detected." },
    { signal: "target-ms", pattern: /targetMs|nonnegative target/i, evidence: "targetMs evidence was detected." },
    { signal: "interval", pattern: /interval|setRafInterval|positive interval/i, evidence: "interval evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "time", "signal");
}

function timerReadinessControlSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["controlSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["controlSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "start", pattern: /api\.start|START|action:\s*['"]start|data-action-trigger=['"]start|>Start</i, evidence: "start control evidence was detected." },
    { signal: "pause", pattern: /api\.pause|PAUSE|action:\s*['"]pause|data-action-trigger=['"]pause|>Pause</i, evidence: "pause control evidence was detected." },
    { signal: "resume", pattern: /api\.resume|RESUME|action:\s*['"]resume|data-action-trigger=['"]resume|>Resume</i, evidence: "resume control evidence was detected." },
    { signal: "reset", pattern: /api\.reset|RESET|action:\s*['"]reset|data-action-trigger=['"]reset|>Reset</i, evidence: "reset control evidence was detected." },
    { signal: "restart", pattern: /api\.restart|RESTART|action:\s*['"]restart|data-action-trigger=['"]restart|>Restart</i, evidence: "restart control evidence was detected." },
    { signal: "tick", pattern: /TICK|CONTINUE|onTick|invokeOnTick|setRafInterval|setRafTimeout|keepTicking|waitForNextTick/i, evidence: "tick loop evidence was detected." },
    { signal: "complete", pattern: /onComplete|invokeOnComplete|hasReachedTarget/i, evidence: "completion evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "control", "signal");
}

function timerReadinessAccessibilitySignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: TimerReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-timer", pattern: /role=['"]timer|getByRole\(['"]timer/i, evidence: "role timer evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|areaLabel/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-atomic", pattern: /aria-atomic/i, evidence: "aria-atomic evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden evidence was detected." },
    { signal: "hidden-actions", pattern: /hidden actions|hidden action|getActionTriggerProps|hidden:\s*/i, evidence: "hidden action evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function timerReadinessValidationSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["validationSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "validate-props", pattern: /validate|validate props|throw new Error|props/i, evidence: "prop validation evidence was detected." },
    { signal: "positive-interval", pattern: /positive interval|interval.*greater|interval.*0|interval/i, evidence: "positive interval evidence was detected." },
    { signal: "nonnegative-start", pattern: /nonnegative start|startMs|start.*0/i, evidence: "nonnegative start evidence was detected." },
    { signal: "nonnegative-target", pattern: /nonnegative target|targetMs|target.*0/i, evidence: "nonnegative target evidence was detected." },
    { signal: "countdown-config", pattern: /countdown config|countdown/i, evidence: "countdown config evidence was detected." },
    { signal: "stopwatch-config", pattern: /stopwatch config|stopwatch|countdown:\s*false/i, evidence: "stopwatch config evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function timerReadinessMachineSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["machineSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<TimerSchema>|createMachine|timer\.machine/i, evidence: "createMachine evidence was detected." },
    { signal: "validate-props", pattern: /validateProps|validate props/i, evidence: "validateProps evidence was detected." },
    { signal: "idle-state", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "running-state", pattern: /\brunning\b|api\.running/i, evidence: "running state evidence was detected." },
    { signal: "running-temp-state", pattern: /running:temp|running-temp/i, evidence: "running temp state evidence was detected." },
    { signal: "paused-state", pattern: /\bpaused\b|api\.paused/i, evidence: "paused state evidence was detected." },
    { signal: "auto-start", pattern: /autoStart|auto-start/i, evidence: "autoStart evidence was detected." },
    { signal: "restart-event", pattern: /RESTART/i, evidence: "restart event evidence was detected." },
    { signal: "start-event", pattern: /\bSTART\b|api\.start/i, evidence: "start event evidence was detected." },
    { signal: "pause-event", pattern: /\bPAUSE\b|api\.pause/i, evidence: "pause event evidence was detected." },
    { signal: "resume-event", pattern: /\bRESUME\b|api\.resume/i, evidence: "resume event evidence was detected." },
    { signal: "reset-event", pattern: /\bRESET\b|api\.reset/i, evidence: "reset event evidence was detected." },
    { signal: "tick-event", pattern: /\bTICK\b|invokeOnTick|onTick/i, evidence: "tick event evidence was detected." },
    { signal: "continue-event", pattern: /\bCONTINUE\b|waitForNextTick/i, evidence: "continue event evidence was detected." },
    { signal: "current-ms-context", pattern: /currentMs|context\.get\(["']currentMs|context\.set\(["']currentMs/i, evidence: "currentMs context evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function timerReadinessComputedSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["computedSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "time", pattern: /computed\(["']time|msToTime|api\.time|\btime\b/i, evidence: "time computed evidence was detected." },
    { signal: "formatted-time", pattern: /formattedTime|formatTime/i, evidence: "formatted time computed evidence was detected." },
    { signal: "progress-percent", pattern: /progressPercent|toPercent/i, evidence: "progress percent computed evidence was detected." },
    { signal: "memo-progress", pattern: /\bmemo\b|memo-progress/i, evidence: "memo progress evidence was detected." },
    { signal: "clamp-value", pattern: /clampValue/i, evidence: "clamp value evidence was detected." },
    { signal: "ms-to-time", pattern: /msToTime/i, evidence: "msToTime evidence was detected." },
    { signal: "format-time", pattern: /formatTime/i, evidence: "formatTime evidence was detected." },
    { signal: "to-percent", pattern: /toPercent/i, evidence: "toPercent evidence was detected." },
    { signal: "round-to-interval", pattern: /roundToInterval/i, evidence: "roundToInterval evidence was detected." },
    { signal: "pad-start", pattern: /padStart/i, evidence: "padStart evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function timerReadinessEffectSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["effectSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keep-ticking", pattern: /keepTicking/i, evidence: "keepTicking effect evidence was detected." },
    { signal: "wait-next-tick", pattern: /waitForNextTick/i, evidence: "waitForNextTick effect evidence was detected." },
    { signal: "raf-interval", pattern: /setRafInterval/i, evidence: "setRafInterval evidence was detected." },
    { signal: "raf-timeout", pattern: /setRafTimeout/i, evidence: "setRafTimeout evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function timerReadinessActionSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["actionSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "update-time", pattern: /updateTime/i, evidence: "updateTime action evidence was detected." },
    { signal: "reset-time", pattern: /resetTime/i, evidence: "resetTime action evidence was detected." },
    { signal: "invoke-on-tick", pattern: /invokeOnTick|onTick/i, evidence: "invokeOnTick action evidence was detected." },
    { signal: "invoke-on-complete", pattern: /invokeOnComplete|onComplete/i, evidence: "invokeOnComplete action evidence was detected." },
    { signal: "countdown-delta", pattern: /countdown[\s\S]{0,160}(?:-1|targetMs|Math\.max|Math\.min)|sign\s*=\s*prop\(["']countdown/i, evidence: "countdown delta evidence was detected." },
    { signal: "target-clamp", pattern: /Math\.max|Math\.min|targetMs/i, evidence: "target clamp evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function timerReadinessGuardSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["guardSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "has-reached-target", pattern: /hasReachedTarget/i, evidence: "hasReachedTarget guard evidence was detected." },
    { signal: "countdown-target-default", pattern: /targetMs\s*==\s*null[\s\S]{0,80}countdown|targetMs\s*:\s*0|countdown target default/i, evidence: "countdown target default evidence was detected." },
    { signal: "countdown-target", pattern: /currentMs\s*<=\s*targetMs|countdown[\s\S]{0,160}targetMs/i, evidence: "countdown target evidence was detected." },
    { signal: "stopwatch-target", pattern: /currentMs\s*>=\s*targetMs|!prop\(["']countdown|stopwatch|startMs/i, evidence: "stopwatch target evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function timerReadinessDomSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["domSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|ids:\s*\{[\s\S]{0,120}root|timer-root|getRootProps/i, evidence: "root id evidence was detected." },
    { signal: "area-id", pattern: /getAreaId|ids:\s*\{[\s\S]{0,120}area|timer-area|getAreaProps/i, evidence: "area id evidence was detected." },
    { signal: "area-el", pattern: /getAreaEl|areaEl|timer-area|getAreaProps/i, evidence: "area element evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function timerReadinessApiSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["apiSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "running", pattern: /api\.running|\brunning\b/i, evidence: "running API evidence was detected." },
    { signal: "paused", pattern: /api\.paused|\bpaused\b/i, evidence: "paused API evidence was detected." },
    { signal: "time", pattern: /api\.time|computed\(["']time/i, evidence: "time API evidence was detected." },
    { signal: "formatted-time", pattern: /api\.formattedTime|formattedTime/i, evidence: "formattedTime API evidence was detected." },
    { signal: "progress-percent", pattern: /api\.progressPercent|progressPercent/i, evidence: "progressPercent API evidence was detected." },
    { signal: "start", pattern: /api\.start|start\(\)\s*\{|START/i, evidence: "start API evidence was detected." },
    { signal: "pause", pattern: /api\.pause|pause\(\)\s*\{|PAUSE/i, evidence: "pause API evidence was detected." },
    { signal: "resume", pattern: /api\.resume|resume\(\)\s*\{|RESUME/i, evidence: "resume API evidence was detected." },
    { signal: "reset", pattern: /api\.reset|reset\(\)\s*\{|RESET/i, evidence: "reset API evidence was detected." },
    { signal: "restart", pattern: /api\.restart|restart\(\)\s*\{|RESTART/i, evidence: "restart API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props evidence was detected." },
    { signal: "area-props", pattern: /getAreaProps/i, evidence: "area props evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props evidence was detected." },
    { signal: "item-label-props", pattern: /getItemLabelProps/i, evidence: "item label props evidence was detected." },
    { signal: "item-value-props", pattern: /getItemValueProps/i, evidence: "item value props evidence was detected." },
    { signal: "separator-props", pattern: /getSeparatorProps/i, evidence: "separator props evidence was detected." },
    { signal: "action-trigger-props", pattern: /getActionTriggerProps/i, evidence: "action trigger props evidence was detected." },
    { signal: "valid-actions", pattern: /validActions|Invalid action/i, evidence: "valid actions evidence was detected." },
    { signal: "hidden-actions", pattern: /hidden:\s*match|hidden\s+match|hidden actions|hidden action/i, evidence: "hidden actions evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function timerReadinessParseSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["parseSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["parseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "parse-string", pattern: /parse\(|new Date\(|getTime/i, evidence: "parse string evidence was detected." },
    { signal: "parse-time-segment", pattern: /isTimeSegment|Partial<Time>|TimePart/i, evidence: "parse time segment evidence was detected." },
    { signal: "time-segments", pattern: /days|hours|minutes|seconds/i, evidence: "time segments evidence was detected." },
    { signal: "milliseconds", pattern: /milliseconds/i, evidence: "milliseconds evidence was detected." },
    { signal: "invalid-date", pattern: /Invalid date|throw new Error/i, evidence: "invalid date evidence was detected." },
    { signal: "is-object", pattern: /isObject/i, evidence: "isObject evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "parse", "signal");
}

function timerReadinessTestSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["testSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "fake-timers", pattern: /useFakeTimers|advanceTimersByTime|fake timers/i, evidence: "fake timer evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test|Start|Pause|Resume|Reset|Restart/i, evidence: "click test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole\(['"]timer|aria-atomic|aria-label/i, evidence: "aria test evidence was detected." },
    { signal: "progress-test", pattern: /progress-test|getByRole\(['"]progressbar|Timer progress|progressPercent/i, evidence: "progress test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|timer-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function timerReadinessPackageSignals(sourceFiles: TimerReadinessSourceFile[]): TimerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: TimerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/timer", pattern: /@zag-js\/timer/i, evidence: "@zag-js/timer dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return timerReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function timerReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: TimerReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/timer-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildStepsReadinessReport(walk: WalkResult): Promise<StepsReadinessReport> {
  const sourceFiles = await stepsReadinessSourceFiles(walk);
  const stepsSetups = stepsReadinessSetups(sourceFiles);
  const frameworkSignals = stepsReadinessFrameworkSignals(sourceFiles);
  const structureSignals = stepsReadinessStructureSignals(sourceFiles);
  const stateSignals = stepsReadinessStateSignals(sourceFiles);
  const navigationSignals = stepsReadinessNavigationSignals(sourceFiles);
  const validationSignals = stepsReadinessValidationSignals(sourceFiles);
  const accessibilitySignals = stepsReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = stepsReadinessMachineSignals(sourceFiles);
  const computedSignals = stepsReadinessComputedSignals(sourceFiles);
  const guardSignals = stepsReadinessGuardSignals(sourceFiles);
  const actionSignals = stepsReadinessActionSignals(sourceFiles);
  const domSignals = stepsReadinessDomSignals(sourceFiles);
  const apiSignals = stepsReadinessApiSignals(sourceFiles);
  const testSignals = stepsReadinessTestSignals(sourceFiles);
  const packageSignals = stepsReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || stepsSetups.some((item) => item.rootCount > 0 && item.listCount > 0 && item.itemCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || stepsSetups.some((item) => item.stateCount > 0);
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready") || stepsSetups.some((item) => item.navCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || stepsSetups.some((item) => item.validationCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || stepsSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || stepsSetups.some((item) => item.testCount > 0);

  const riskQueue: StepsReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document steps root, list, item, trigger, content, navigation trigger, and progress structure before claiming steps readiness.",
      why: "Steps readiness starts with traceable wizard/stepper anatomy.",
      relatedHref: "html/steps-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace current, completed, incomplete, first/last, hasNextStep, hasPrevStep, isCompleted, and percent state.",
      why: "A stepper can render tabs while state and completion semantics drift from the intended workflow.",
      relatedHref: "html/steps-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasNavigation) {
    riskQueue.push({
      priority: "high",
      action: "Trace STEP.SET, STEP.NEXT, STEP.PREV, STEP.RESET, setStep, goToNextStep, goToPrevStep, and resetStep paths.",
      why: "Wizard correctness depends on explicit navigation events and bounded transitions.",
      relatedHref: "html/steps-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Trace linear mode, isStepValid, isStepSkippable, onStepInvalid, range checks, and count bounds.",
      why: "Linear steppers need validation and skip rules to prevent invalid forward navigation.",
      relatedHref: "html/steps-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify tablist, tab, tabpanel, aria-current, aria-selected, aria-controls, aria-owns, aria-orientation, and disabled states.",
      why: "Stepper controls should be keyboard/screen-reader discoverable and expose current/completed state.",
      relatedHref: "html/steps-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, aria, linear blocking, progress, and artifact tests.",
      why: "Static steps evidence does not prove tab semantics, validation blocking, progress, or navigation behavior.",
      relatedHref: "html/steps-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify actual wizard navigation, validation blocking, keyboard behavior, and form persistence with trusted tests outside RepoTutor.",
    why: "RepoTutor records steps readiness only; it does not navigate real forms, dispatch real tab/keyboard interactions, validate business forms, submit data, or run analyzed project tests.",
    relatedHref: "html/steps-readiness.html"
  });

  return {
    summary: `Steps readiness report: setup ${stepsSetups.length} files, structure signal ${structureSignals.length}, navigation signal ${navigationSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length} were summarized from static analysis.`,
    sourcePattern: "Steps readiness Zag steps wizard stepper linear progress tablist validation navigation tests",
    stepsSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    navigationSignals,
    validationSignals,
    accessibilitySignals,
    machineSignals,
    computedSignals,
    guardSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/steps|steps\\.machine|steps\\.connect|getListProps|getTriggerProps|getContentProps\" package.json src app packages", purpose: "Find Zag steps machine, connect API, list, trigger, and content props." },
      { command: "rg \"STEP\\.SET|STEP\\.NEXT|STEP\\.PREV|STEP\\.RESET|setStep|goToNextStep|goToPrevStep|resetStep\" src app packages", purpose: "Trace step navigation events and API calls." },
      { command: "rg \"linear|isStepValid|isStepSkippable|onStepInvalid|validateStepIndex|isValueWithinRange|count|defaultStep|percent\" src app packages", purpose: "Check linear validation, skip rules, count bounds, default step, and progress state." },
      { command: "rg \"role=['\\\"]tablist|role=['\\\"]tab|role=['\\\"]tabpanel|aria-current|aria-selected|aria-controls|aria-owns|aria-orientation|steps-traces|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility semantics, tab tests, progress tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag steps, native tablist stepper markup, or a custom wizard flow.",
      "Trace root, list, item, trigger, indicator, separator, content, next/previous triggers, and progress structure before reviewing behavior.",
      "Map current step, defaultStep, completed/incomplete state, first/last, hasNextStep, hasPrevStep, isCompleted, percent, and navigation events.",
      "Check linear validation, isStepValid, isStepSkippable, onStepInvalid, range/count bounds, tablist/tab/tabpanel ARIA, disabled states, and tests.",
      "This report is static readiness. Actual wizard navigation, keyboard behavior, validation blocking, form persistence, and project tests need trusted QA."
    ]
  };
}

type StepsReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function stepsReadinessSourceFiles(walk: WalkResult): Promise<StepsReadinessSourceFile[]> {
  const files: StepsReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !stepsReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!stepsReadinessPathSignal(file.relPath) && !stepsReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function stepsReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return stepsReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function stepsReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(steps|stepper|wizard|onboarding|checkout|flow-step)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function stepsReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/steps|steps\.machine|steps\.connect|getListProps|getTriggerProps|getContentProps|data-steps-root|role=['"]tablist|steps-traces|STEP\.NEXT)/i.test(text);
}

function stepsReadinessSetups(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["stepsSetups"] {
  const rows: StepsReadinessReport["stepsSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(steps\.machine|steps\.connect|getRootProps|data-steps-root|steps root)/gi);
    const listCount = countMatches(source.text, /(getListProps|data-steps-list|role=['"]tablist|aria-owns|tablist)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|getItemState|data-steps-item|ItemState|data-current|data-incomplete|data-complete)/gi);
    const triggerCount = countMatches(source.text, /(getTriggerProps|data-steps-trigger|role=['"]tab|aria-selected|aria-controls)/gi);
    const contentCount = countMatches(source.text, /(getContentProps|data-steps-content|role=['"]tabpanel|tabpanel|aria-labelledby)/gi);
    const navCount = countMatches(source.text, /(getNextTriggerProps|getPrevTriggerProps|data-next-trigger|data-prev-trigger|STEP\.SET|STEP\.NEXT|STEP\.PREV|STEP\.RESET|setStep|goToNextStep|goToPrevStep|resetStep|Previous|Next)/gi);
    const progressCount = countMatches(source.text, /(getProgressProps|progressbar|<progress|aria-valuenow|aria-valuetext|percent|Checkout progress)/gi);
    const stateCount = countMatches(source.text, /(step|defaultStep|current|completed|incomplete|first|last|hasNextStep|hasPrevStep|isCompleted|percent)/gi);
    const validationCount = countMatches(source.text, /(linear|isStepValid|isStepSkippable|onStepInvalid|validateStepIndex|isValueWithinRange|count|range check)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]tablist|role=['"]tab|role=['"]tabpanel|aria-current|aria-selected|aria-controls|aria-owns|aria-orientation|disabled|getByRole)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|getByRole|click-test|aria-test|linear-test|progress-test|steps-traces|upload-artifact)/gi);
    const total = rootCount + listCount + itemCount + triggerCount + contentCount + navCount + progressCount + stateCount + validationCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && listCount > 0 && itemCount > 0 && triggerCount > 0 && contentCount > 0 && navCount > 0 && progressCount > 0 && stateCount > 0 && validationCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: stepsReadinessFramework(source),
      rootCount,
      listCount,
      itemCount,
      triggerCount,
      contentCount,
      navCount,
      progressCount,
      stateCount,
      validationCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, list ${listCount}, item ${itemCount}, trigger ${triggerCount}, content ${contentCount}, nav ${navCount}, progress ${progressCount}, state ${stateCount}, validation ${validationCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.navCount + b.stateCount + b.validationCount + b.accessibilityCount - (a.navCount + a.stateCount + a.validationCount + a.accessibilityCount));
}

function stepsReadinessFramework(source: StepsReadinessSourceFile): StepsReadinessReport["stepsSetups"][number]["framework"] {
  if (/@zag-js\/steps|steps\.machine|steps\.connect|getListProps|getTriggerProps|getContentProps/i.test(source.text)) return "zag-steps";
  if (/data-steps-root|role=['"]tablist|data-steps-trigger|data-steps-content|<progress/i.test(source.text)) return "native-stepper";
  if (/steps|stepper|wizard|onboarding|checkout/i.test(source.text)) return "custom";
  return "unknown";
}

function stepsReadinessFrameworkSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-steps", pattern: /@zag-js\/steps|steps\.machine|steps\.connect|getListProps|getTriggerProps|getContentProps/i, evidence: "Zag steps evidence was detected." },
    { signal: "native-stepper", pattern: /data-steps-root|role=['"]tablist|data-steps-trigger|data-steps-content|<progress/i, evidence: "native stepper evidence was detected." },
    { signal: "custom", pattern: /steps|stepper|wizard|onboarding|checkout/i, evidence: "custom steps evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function stepsReadinessStructureSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["structureSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-steps-root|steps\.machine/i, evidence: "root evidence was detected." },
    { signal: "list", pattern: /getListProps|data-steps-list|role=['"]tablist/i, evidence: "list evidence was detected." },
    { signal: "item", pattern: /getItemProps|getItemState|data-steps-item/i, evidence: "item evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|data-steps-trigger|role=['"]tab/i, evidence: "trigger evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-steps-indicator|indicator/i, evidence: "indicator evidence was detected." },
    { signal: "separator", pattern: /getSeparatorProps|data-steps-separator|separator/i, evidence: "separator evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-steps-content|role=['"]tabpanel/i, evidence: "content evidence was detected." },
    { signal: "next-trigger", pattern: /getNextTriggerProps|data-next-trigger|STEP\.NEXT|Next/i, evidence: "next trigger evidence was detected." },
    { signal: "prev-trigger", pattern: /getPrevTriggerProps|data-prev-trigger|STEP\.PREV|Previous/i, evidence: "previous trigger evidence was detected." },
    { signal: "progress", pattern: /getProgressProps|progressbar|<progress|aria-valuenow/i, evidence: "progress evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function stepsReadinessStateSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["stateSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "step", pattern: /\bstep\b|api\.value|context\.get\(["']step/i, evidence: "step value evidence was detected." },
    { signal: "default-step", pattern: /defaultStep/i, evidence: "default step evidence was detected." },
    { signal: "current", pattern: /current|data-current|aria-current/i, evidence: "current step evidence was detected." },
    { signal: "completed", pattern: /completed|data-complete/i, evidence: "completed step evidence was detected." },
    { signal: "incomplete", pattern: /incomplete|data-incomplete/i, evidence: "incomplete step evidence was detected." },
    { signal: "first-last", pattern: /\bfirst\b|\blast\b/i, evidence: "first/last evidence was detected." },
    { signal: "has-next-prev", pattern: /hasNextStep|hasPrevStep/i, evidence: "has next/previous evidence was detected." },
    { signal: "is-completed", pattern: /isCompleted|completed/i, evidence: "isCompleted evidence was detected." },
    { signal: "percent", pattern: /percent|aria-valuenow|aria-valuetext/i, evidence: "percent evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function stepsReadinessNavigationSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "step-set", pattern: /STEP\.SET/i, evidence: "STEP.SET evidence was detected." },
    { signal: "step-next", pattern: /STEP\.NEXT/i, evidence: "STEP.NEXT evidence was detected." },
    { signal: "step-prev", pattern: /STEP\.PREV/i, evidence: "STEP.PREV evidence was detected." },
    { signal: "step-reset", pattern: /STEP\.RESET/i, evidence: "STEP.RESET evidence was detected." },
    { signal: "set-step", pattern: /setStep|set step/i, evidence: "setStep evidence was detected." },
    { signal: "next-step", pattern: /goToNextStep|next trigger|Next/i, evidence: "next step evidence was detected." },
    { signal: "prev-step", pattern: /goToPrevStep|prev trigger|Previous/i, evidence: "previous step evidence was detected." },
    { signal: "reset-step", pattern: /resetStep|reset step/i, evidence: "reset step evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function stepsReadinessValidationSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["validationSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "linear", pattern: /linear/i, evidence: "linear mode evidence was detected." },
    { signal: "is-step-valid", pattern: /isStepValid|isCurrentStepValid/i, evidence: "step valid evidence was detected." },
    { signal: "is-step-skippable", pattern: /isStepSkippable|skippable/i, evidence: "step skippable evidence was detected." },
    { signal: "on-step-invalid", pattern: /onStepInvalid|invokeOnStepInvalid/i, evidence: "step invalid callback evidence was detected." },
    { signal: "range-check", pattern: /validateStepIndex|isValueWithinRange|out of bounds|range check/i, evidence: "range check evidence was detected." },
    { signal: "count", pattern: /\bcount\b|fromLength/i, evidence: "count evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function stepsReadinessAccessibilitySignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: StepsReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tablist", pattern: /role=['"]tablist|getByRole\(['"]tablist/i, evidence: "tablist evidence was detected." },
    { signal: "tab", pattern: /role=['"]tab|getByRole\(['"]tab/i, evidence: "tab evidence was detected." },
    { signal: "tabpanel", pattern: /role=['"]tabpanel|getByRole\(['"]tabpanel/i, evidence: "tabpanel evidence was detected." },
    { signal: "aria-current", pattern: /aria-current/i, evidence: "aria-current evidence was detected." },
    { signal: "aria-selected", pattern: /aria-selected/i, evidence: "aria-selected evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-owns", pattern: /aria-owns/i, evidence: "aria-owns evidence was detected." },
    { signal: "aria-orientation", pattern: /aria-orientation/i, evidence: "aria-orientation evidence was detected." },
    { signal: "disabled", pattern: /disabled|aria-disabled/i, evidence: "disabled evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function stepsReadinessMachineSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["machineSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<StepsSchema>|createMachine|steps\.machine/i, evidence: "createMachine evidence was detected." },
    { signal: "default-step", pattern: /defaultStep/i, evidence: "defaultStep evidence was detected." },
    { signal: "count-default", pattern: /count:\s*1|\bcount\b/i, evidence: "count default evidence was detected." },
    { signal: "linear-default", pattern: /linear:\s*false|\blinear\b/i, evidence: "linear default evidence was detected." },
    { signal: "orientation-default", pattern: /orientation:\s*["']horizontal|orientation/i, evidence: "orientation default evidence was detected." },
    { signal: "bindable-step", pattern: /bindable<number>|bindable[\s\S]{0,80}step|step:\s*bindable/i, evidence: "bindable step evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,60}idle|\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "entry-validate-step", pattern: /entry:\s*\[[\s\S]{0,80}validateStepIndex|validateStepIndex/i, evidence: "entry validate step evidence was detected." },
    { signal: "step-set-event", pattern: /STEP\.SET/i, evidence: "STEP.SET event evidence was detected." },
    { signal: "step-next-event", pattern: /STEP\.NEXT/i, evidence: "STEP.NEXT event evidence was detected." },
    { signal: "step-prev-event", pattern: /STEP\.PREV/i, evidence: "STEP.PREV event evidence was detected." },
    { signal: "step-reset-event", pattern: /STEP\.RESET/i, evidence: "STEP.RESET event evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function stepsReadinessComputedSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["computedSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "percent", pattern: /computed[\s\S]{0,120}percent|\bpercent\b/i, evidence: "percent computed evidence was detected." },
    { signal: "memo-percent", pattern: /\bmemo\b|memo-percent/i, evidence: "memo percent evidence was detected." },
    { signal: "has-next-step", pattern: /hasNextStep/i, evidence: "hasNextStep computed evidence was detected." },
    { signal: "has-prev-step", pattern: /hasPrevStep/i, evidence: "hasPrevStep computed evidence was detected." },
    { signal: "completed", pattern: /computed[\s\S]{0,220}completed|\bcompleted\b/i, evidence: "completed computed evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function stepsReadinessGuardSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["guardSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "current-step-valid", pattern: /isCurrentStepValid/i, evidence: "current step valid guard evidence was detected." },
    { signal: "valid-step-navigation", pattern: /isValidStepNavigation/i, evidence: "valid step navigation guard evidence was detected." },
    { signal: "skippable-bypass", pattern: /isStepSkippable|skippable bypass|skippable[\s\S]{0,80}bypass/i, evidence: "skippable bypass evidence was detected." },
    { signal: "valid-callback", pattern: /isStepValid|valid callback/i, evidence: "valid callback evidence was detected." },
    { signal: "range-check", pattern: /validateStepIndex|isValueWithinRange|out of bounds|range check/i, evidence: "range check guard evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function stepsReadinessActionSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["actionSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "go-to-next-step", pattern: /goToNextStep/i, evidence: "goToNextStep action evidence was detected." },
    { signal: "go-to-prev-step", pattern: /goToPrevStep/i, evidence: "goToPrevStep action evidence was detected." },
    { signal: "reset-step", pattern: /resetStep/i, evidence: "resetStep action evidence was detected." },
    { signal: "set-step", pattern: /setStep|context\.set\(["']step/i, evidence: "setStep action evidence was detected." },
    { signal: "validate-step-index", pattern: /validateStepIndex/i, evidence: "validateStepIndex action evidence was detected." },
    { signal: "invoke-step-invalid", pattern: /invokeOnStepInvalid|onStepInvalid/i, evidence: "invoke step invalid evidence was detected." },
    { signal: "step-change-callback", pattern: /onStepChange/i, evidence: "onStepChange callback evidence was detected." },
    { signal: "step-complete-callback", pattern: /onStepComplete/i, evidence: "onStepComplete callback evidence was detected." },
    { signal: "min-bound", pattern: /Math\.min/i, evidence: "Math.min bound evidence was detected." },
    { signal: "max-bound", pattern: /Math\.max/i, evidence: "Math.max bound evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function stepsReadinessDomSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["domSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId|ids:\s*\{[\s\S]{0,160}root|steps-root|getRootProps/i, evidence: "root id evidence was detected." },
    { signal: "list-id", pattern: /getListId|ids:\s*\{[\s\S]{0,160}list|steps-list|getListProps/i, evidence: "list id evidence was detected." },
    { signal: "trigger-id", pattern: /getTriggerId|triggerId|steps-trigger|getTriggerProps/i, evidence: "trigger id evidence was detected." },
    { signal: "content-id", pattern: /getContentId|contentId|steps-content|getContentProps/i, evidence: "content id evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function stepsReadinessApiSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["apiSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /api\.value|\bvalue:\s*step|\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "count", pattern: /api\.count|\bcount\b/i, evidence: "count API evidence was detected." },
    { signal: "percent", pattern: /api\.percent|\bpercent\b/i, evidence: "percent API evidence was detected." },
    { signal: "has-next-step", pattern: /api\.hasNextStep|hasNextStep/i, evidence: "hasNextStep API evidence was detected." },
    { signal: "has-prev-step", pattern: /api\.hasPrevStep|hasPrevStep/i, evidence: "hasPrevStep API evidence was detected." },
    { signal: "is-completed", pattern: /api\.isCompleted|isCompleted/i, evidence: "isCompleted API evidence was detected." },
    { signal: "is-step-valid", pattern: /api\.isStepValid|isStepValid/i, evidence: "isStepValid API evidence was detected." },
    { signal: "is-step-skippable", pattern: /api\.isStepSkippable|isStepSkippable/i, evidence: "isStepSkippable API evidence was detected." },
    { signal: "go-to-next-step", pattern: /api\.goToNextStep|goToNextStep/i, evidence: "goToNextStep API evidence was detected." },
    { signal: "go-to-prev-step", pattern: /api\.goToPrevStep|goToPrevStep/i, evidence: "goToPrevStep API evidence was detected." },
    { signal: "reset-step", pattern: /api\.resetStep|resetStep/i, evidence: "resetStep API evidence was detected." },
    { signal: "get-item-state", pattern: /api\.getItemState|getItemState/i, evidence: "getItemState API evidence was detected." },
    { signal: "set-step", pattern: /api\.setStep|setStep/i, evidence: "setStep API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props evidence was detected." },
    { signal: "list-props", pattern: /getListProps/i, evidence: "list props evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props evidence was detected." },
    { signal: "next-trigger-props", pattern: /getNextTriggerProps/i, evidence: "next trigger props evidence was detected." },
    { signal: "prev-trigger-props", pattern: /getPrevTriggerProps/i, evidence: "previous trigger props evidence was detected." },
    { signal: "progress-props", pattern: /getProgressProps/i, evidence: "progress props evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props evidence was detected." },
    { signal: "separator-props", pattern: /getSeparatorProps/i, evidence: "separator props evidence was detected." },
    { signal: "item-state", pattern: /ItemState|itemState|current|completed|incomplete|first|last|skippable|isValid|triggerId|contentId/i, evidence: "item state evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function stepsReadinessTestSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["testSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /user\.click|click-test|Next|Previous/i, evidence: "click test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|getByRole\(['"]tablist|getByRole\(['"]tab|aria-selected|aria-orientation/i, evidence: "aria test evidence was detected." },
    { signal: "linear-test", pattern: /linear-test|linear|isStepValid|onStepInvalid/i, evidence: "linear test evidence was detected." },
    { signal: "progress-test", pattern: /progress-test|getByRole\(['"]progressbar|Checkout progress|progressbar/i, evidence: "progress test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|steps-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function stepsReadinessPackageSignals(sourceFiles: StepsReadinessSourceFile[]): StepsReadinessReport["packageSignals"] {
  const specs: Array<{ signal: StepsReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/steps", pattern: /@zag-js\/steps/i, evidence: "@zag-js/steps dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return stepsReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function stepsReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: StepsReadinessSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/steps-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
