import type { AnimationReadinessReport, DragAndDropReadinessReport, RichTextEditorReadinessReport, StateMachineReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildStateMachineReadinessReport(walk: WalkResult): Promise<StateMachineReadinessReport> {
  const sourceFiles = await stateMachineReadinessSourceFiles(walk);
  const stateMachineSetups = stateMachineReadinessSetups(sourceFiles);
  const frameworkSignals = stateMachineReadinessFrameworkSignals(sourceFiles);
  const stateSignals = stateMachineReadinessStateSignals(sourceFiles);
  const transitionSignals = stateMachineReadinessTransitionSignals(sourceFiles);
  const actionSignals = stateMachineReadinessActionSignals(sourceFiles);
  const guardSignals = stateMachineReadinessGuardSignals(sourceFiles);
  const actorSignals = stateMachineReadinessActorSignals(sourceFiles);
  const contextSignals = stateMachineReadinessContextSignals(sourceFiles);
  const eventSignals = stateMachineReadinessEventSignals(sourceFiles);
  const testSignals = stateMachineReadinessTestSignals(sourceFiles);
  const packageSignals = stateMachineReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasMachine = stateMachineSetups.some((item) => item.machineCount > 0);
  const hasStates = stateSignals.some((item) => item.readiness === "ready") || stateMachineSetups.some((item) => item.stateCount > 0);
  const hasTransitions = transitionSignals.some((item) => item.readiness === "ready") || stateMachineSetups.some((item) => item.transitionCount > 0);
  const hasActors = actorSignals.some((item) => item.readiness === "ready") || stateMachineSetups.some((item) => item.actorCount > 0 || item.invokeCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || stateMachineSetups.some((item) => item.testCount > 0);

  const riskQueue: StateMachineReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasMachine) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the state machine framework or explicit machine definition before claiming state machine readiness.",
      why: "XState/Robot/Zag-style readiness starts with a machine boundary learners can trace.",
      relatedHref: "html/state-machine-readiness.html"
    });
  }
  if (hasMachine && !hasStates) {
    riskQueue.push({
      priority: "high",
      action: "Trace initial state, states map, final states, computed state, or watch-derived state.",
      why: "A machine without visible states cannot explain the lifecycle or allowed UI/business modes.",
      relatedHref: "html/state-machine-readiness.html"
    });
  }
  if ((hasMachine || hasStates) && !hasTransitions) {
    riskQueue.push({
      priority: "high",
      action: "Document event-to-target transitions, always/immediate transitions, delayed transitions, or transition helpers.",
      why: "State machine value comes from explicit transitions; missing transition evidence leaves behavior implicit.",
      relatedHref: "html/state-machine-readiness.html"
    });
  }
  if ((hasMachine || hasTransitions) && !hasActors) {
    riskQueue.push({
      priority: "medium",
      action: "Identify actor, service, invoke, promise, or interpreter boundaries.",
      why: "Async work and running machines are often expressed as actors/services; learners need to separate definition from runtime execution.",
      relatedHref: "html/state-machine-readiness.html"
    });
  }
  if ((hasMachine || hasTransitions || hasActors) && !hasTests) {
    riskQueue.push({
      priority: "low",
      action: "Add transition, model, snapshot, or workflow artifact tests for critical machine paths.",
      why: "State machine regressions are easiest to catch when event paths and terminal states are asserted.",
      relatedHref: "html/state-machine-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify machine behavior with trusted local tests or reviewed traces outside RepoTutor.",
    why: "RepoTutor records state machine readiness only; it does not interpret machines, start actors, send runtime events, run workflows, call invoked services, or execute analyzed project tests.",
    relatedHref: "html/state-machine-readiness.html"
  });

  return {
    summary: `XState/Robot/Zag-style state machine readiness report: setup ${stateMachineSetups.length}개, framework signal ${frameworkSignals.length}개, transition signal ${transitionSignals.length}개, actor signal ${actorSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "State machine readiness XState createMachine setup createActor Robot state transition interpret Zag createMachine connect states on actions guards",
    stateMachineSetups,
    frameworkSignals,
    stateSignals,
    transitionSignals,
    actionSignals,
    guardSignals,
    actorSignals,
    contextSignals,
    eventSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"createMachine|setup\\(|createActor|interpret\\(|state\\(|transition\\(|machine\\(|connect\\(\" src app packages test", purpose: "Find machine definitions, actor/service startup, Robot helpers, and Zag machine/connect usage." },
      { command: "rg \"initial:|states:|type: ['\\\"]final|computed:|watch:\" src app packages test", purpose: "Trace initial, concrete, final, computed, and watched state boundaries." },
      { command: "rg \"on:|target:|always:|immediate\\(|after:|delay|transition\\(\" src app packages test", purpose: "Inventory event-driven, immediate, delayed, and helper-based transitions." },
      { command: "rg \"assign\\(|actions:|reduce\\(|entry:|exit:|effects:|guards:|guard:|cond:\" src app packages test", purpose: "Review actions, reducers, entry/exit/effects, and guarded paths." },
      { command: "rg \"invoke:|fromPromise|onDone|onError|service\\.send|actor\\.send|subscribe\\(|matches\\(\" src app packages test", purpose: "Separate invoked async work, runtime event sending, subscriptions, and snapshot matching." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover machine transitions and terminal states." }
    ],
    learnerNextSteps: [
      "먼저 XState, Robot, Zag, javascript-state-machine 같은 framework 또는 custom machine definition을 찾으세요.",
      "initial, states, final, computed, watch 신호로 가능한 상태와 파생 상태를 분리하세요.",
      "on, target, always, immediate, after/delay, transition helper를 따라 이벤트가 상태를 어떻게 바꾸는지 확인하세요.",
      "assign/actions/reduce/entry/exit/effects와 guard/cond/choose를 나눠 side effect와 조건부 전이를 표시하세요.",
      "createActor, interpret, invoke, fromPromise, service/actor ref로 정의와 런타임 실행 경계를 구분하세요.",
      "send, subscribe, event type, onDone/onError, snapshot.matches로 이벤트 입출력과 검증 지점을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 actor start, event send, invoked service, transition timing은 원본 프로젝트 테스트나 수동 검증에서 별도 확인하세요."
    ]
  };
}

type StateMachineReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function stateMachineReadinessSourceFiles(walk: WalkResult): Promise<StateMachineReadinessSourceFile[]> {
  const files: StateMachineReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !stateMachineReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!stateMachineReadinessPathSignal(file.relPath) && !stateMachineReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function stateMachineReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return stateMachineReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml)$/i.test(filePath);
}

function stateMachineReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(machines?|state-machine|statemachine|workflow|flows?|actors?|services?|xstate|robot|zag|stores?|tests?)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function stateMachineReadinessContentSignal(text: string): boolean {
  return /\b(createMachine|setup\s*\(|createActor|interpret\s*\(|fromPromise|assign\s*\(|state\s*\(|transition\s*\(|reduce\s*\(|guard\s*\(|immediate\s*\(|invoke\s*\(|states\s*:|initial\s*:|on\s*:|target\s*:|always\s*:|onDone|onError|snapshot\.matches|\.send\s*\(|\.subscribe\s*\(|useMachine|normalizeProps|connect\s*\(|computed\s*:|watch\s*:)\b|"(xstate|robot3|@zag-js\/core|@zag-js\/react|@zag-js\/toggle|javascript-state-machine)"/i.test(text);
}

function stateMachineReadinessSetups(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["stateMachineSetups"] {
  const rows: StateMachineReadinessReport["stateMachineSetups"] = [];
  for (const source of sourceFiles) {
    const machineCount = countMatches(source.text, /(createMachine|setup\s*\(|\.createMachine\s*\(|Machine\s*\(|createModel|machine\s*\(|toggle\.machine)/gi);
    const stateCount = countMatches(source.text, /(initial\s*:|states\s*:|state\s*\(|type\s*:\s*['"]final['"]|computed\s*:|watch\s*:|parallel\s*:|history)/gi);
    const transitionCount = countMatches(source.text, /(on\s*:|target\s*:|always\s*:|immediate\s*\(|transition\s*\(|after\s*:|delay\s*:|onDone|onError)/gi);
    const actionCount = countMatches(source.text, /(assign\s*\(|actions\s*:|reduce\s*\(|entry\s*:|exit\s*:|effects\s*:|effect\s*:|onTransition)/gi);
    const guardCount = countMatches(source.text, /(guard\s*:|guards\s*:|guard\s*\(|cond\s*:|choose\s*\(|can[A-Z][A-Za-z0-9_]*)/gi);
    const actorCount = countMatches(source.text, /(createActor|interpret\s*\(|useMachine|actor\.|ActorRef|service\.|spawn|fromCallback|fromObservable)/gi);
    const invokeCount = countMatches(source.text, /(invoke\s*:|invoke\s*\(|fromPromise|fromCallback|fromObservable|actors\s*:|onDone|onError)/gi);
    const contextCount = countMatches(source.text, /(context\s*:|snapshot|\.context|matches\s*\(|computed\s*:|watch\s*:|input\s*:)/gi);
    const eventCount = countMatches(source.text, /(send\s*\(|\.send\s*\(|subscribe\s*\(|type\s*:\s*['"`][A-Z_a-z.-]+|onDone|onError|event\.|events\s*:)/gi);
    const testCount = countMatches(source.text, /(vitest|describe\s*\(|it\s*\(|expect\s*\(|model test|createTestModel|testModel|upload-artifact|state-machine-traces|transition test)/gi);
    const hasSetupSignal = machineCount + stateCount + transitionCount + actionCount + guardCount + actorCount + invokeCount + contextCount + eventCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: stateMachineReadinessPlatform(source),
      machineCount,
      stateCount,
      transitionCount,
      actionCount,
      guardCount,
      actorCount,
      invokeCount,
      contextCount,
      eventCount,
      testCount,
      readiness: machineCount > 0 && stateCount > 0 && transitionCount > 0 && (actorCount > 0 || eventCount > 0 || invokeCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains machines ${machineCount}, states ${stateCount}, transitions ${transitionCount}, actions ${actionCount}, guards ${guardCount}, actors ${actorCount}, invokes ${invokeCount}, context ${contextCount}, events ${eventCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function stateMachineReadinessPlatform(source: StateMachineReadinessSourceFile): StateMachineReadinessReport["stateMachineSetups"][number]["platform"] {
  if (/\b(from ["']xstate["']|require\(["']xstate["']\)|createActor|fromPromise|setup\s*\(|\.createMachine\s*\(|@xstate)\b/i.test(source.text)) return "xstate";
  if (/\b(from ["']robot3["']|require\(["']robot3["']\)|state\s*\(|transition\s*\(|reduce\s*\(|immediate\s*\(|interpret\s*\()\b/i.test(source.text)) return "robot";
  if (/@zag-js\/(core|react|toggle)|toggle\.machine|normalizeProps|connect\s*\(|useMachine/i.test(source.text)) return "zag";
  if (/javascript-state-machine|new\s+StateMachine|StateMachine\.factory/i.test(source.text)) return "javascript-state-machine";
  if (/createMachine|states\s*:|transition|actor|service|event/i.test(source.text) || stateMachineReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function stateMachineReadinessFrameworkSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "xstate", pattern: /"xstate"|from ["']xstate["']|createActor|fromPromise|setup\s*\(|\.createMachine\s*\(/i, evidence: "XState evidence was detected." },
    { signal: "robot", pattern: /"robot3"|from ["']robot3["']|state\s*\(|transition\s*\(|reduce\s*\(|immediate\s*\(/i, evidence: "Robot evidence was detected." },
    { signal: "zag", pattern: /@zag-js\/(core|react|toggle)|toggle\.machine|normalizeProps|connect\s*\(|useMachine/i, evidence: "Zag evidence was detected." },
    { signal: "javascript-state-machine", pattern: /javascript-state-machine|new\s+StateMachine|StateMachine\.factory/i, evidence: "javascript-state-machine evidence was detected." },
    { signal: "custom", pattern: /states\s*:|transitions?\s*:|state machine|finite state|actor|event bus/i, evidence: "custom state machine evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function stateMachineReadinessStateSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["stateSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "initial", pattern: /\binitial\s*:/i, evidence: "initial state evidence was detected." },
    { signal: "states", pattern: /\bstates\s*:|state\s*\(/i, evidence: "states map/helper evidence was detected." },
    { signal: "final", pattern: /type\s*:\s*['"]final['"]|final\s*:/i, evidence: "final state evidence was detected." },
    { signal: "nested", pattern: /states\s*:\s*\{[\s\S]{0,300}states\s*:|nested/i, evidence: "nested state evidence was detected." },
    { signal: "parallel", pattern: /type\s*:\s*['"]parallel['"]|parallel\s*:/i, evidence: "parallel state evidence was detected." },
    { signal: "history", pattern: /type\s*:\s*['"]history['"]|history\s*:/i, evidence: "history state evidence was detected." },
    { signal: "computed", pattern: /\bcomputed\s*:/i, evidence: "computed state evidence was detected." },
    { signal: "watch", pattern: /\bwatch\s*:/i, evidence: "watch-derived state evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function stateMachineReadinessTransitionSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["transitionSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["transitionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "on", pattern: /\bon\s*:/i, evidence: "event transition map evidence was detected." },
    { signal: "target", pattern: /\btarget\s*:/i, evidence: "target transition evidence was detected." },
    { signal: "always", pattern: /\balways\s*:/i, evidence: "always transition evidence was detected." },
    { signal: "immediate", pattern: /\bimmediate\s*\(/i, evidence: "immediate transition evidence was detected." },
    { signal: "transition", pattern: /\btransition\s*\(/i, evidence: "transition helper evidence was detected." },
    { signal: "after", pattern: /\bafter\s*:/i, evidence: "after transition evidence was detected." },
    { signal: "delay", pattern: /\bdelay\s*:|delays\s*:/i, evidence: "delay transition evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "transition", "signal");
}

function stateMachineReadinessActionSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["actionSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "assign", pattern: /\bassign\s*\(/i, evidence: "assign action evidence was detected." },
    { signal: "actions", pattern: /\bactions\s*:/i, evidence: "actions map evidence was detected." },
    { signal: "reduce", pattern: /\breduce\s*\(/i, evidence: "Robot reducer evidence was detected." },
    { signal: "entry", pattern: /\bentry\s*:/i, evidence: "entry action evidence was detected." },
    { signal: "exit", pattern: /\bexit\s*:/i, evidence: "exit action evidence was detected." },
    { signal: "effect", pattern: /\beffects?\s*:/i, evidence: "effect action evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function stateMachineReadinessGuardSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["guardSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "guard", pattern: /\bguard\s*:|\bguard\s*\(/i, evidence: "guard evidence was detected." },
    { signal: "guards", pattern: /\bguards\s*:/i, evidence: "guards map evidence was detected." },
    { signal: "can-guard", pattern: /\bcan[A-Z][A-Za-z0-9_]*\b/i, evidence: "can* guard naming evidence was detected." },
    { signal: "cond", pattern: /\bcond\s*:/i, evidence: "condition evidence was detected." },
    { signal: "choose", pattern: /\bchoose\s*\(/i, evidence: "choose guard evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function stateMachineReadinessActorSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["actorSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["actorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-actor", pattern: /\bcreateActor\s*\(/i, evidence: "createActor evidence was detected." },
    { signal: "interpret", pattern: /\binterpret\s*\(/i, evidence: "interpreter evidence was detected." },
    { signal: "invoke", pattern: /\binvoke\s*:|\binvoke\s*\(/i, evidence: "invoke evidence was detected." },
    { signal: "from-promise", pattern: /\bfromPromise\s*\(/i, evidence: "fromPromise evidence was detected." },
    { signal: "service", pattern: /\bservice\.|const\s+service|useMachine/i, evidence: "service/useMachine evidence was detected." },
    { signal: "actor-ref", pattern: /\bActorRef|actor\.|spawn\s*\(/i, evidence: "actor ref evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "actor", "signal");
}

function stateMachineReadinessContextSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["contextSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "context", pattern: /\bcontext\s*:|\.context\b/i, evidence: "context evidence was detected." },
    { signal: "snapshot", pattern: /\bsnapshot\b|getSnapshot\s*\(/i, evidence: "snapshot evidence was detected." },
    { signal: "matches", pattern: /\bmatches\s*\(/i, evidence: "state matching evidence was detected." },
    { signal: "computed", pattern: /\bcomputed\s*:/i, evidence: "computed context evidence was detected." },
    { signal: "watch", pattern: /\bwatch\s*:/i, evidence: "watch evidence was detected." },
    { signal: "input", pattern: /\binput\s*:|fromPromise\s*\(\s*async\s*\(\s*\{\s*input/i, evidence: "input evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function stateMachineReadinessEventSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["eventSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["eventSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "send", pattern: /\.send\s*\(|\bsend\s*\(/i, evidence: "send event evidence was detected." },
    { signal: "subscribe", pattern: /\.subscribe\s*\(|subscribe\s*\(/i, evidence: "subscription evidence was detected." },
    { signal: "event-type", pattern: /type\s*:\s*['"`][A-Za-z0-9_.-]+|events\s*:/i, evidence: "event type evidence was detected." },
    { signal: "on-done", pattern: /onDone|xstate\.done|transition\s*\(['"]done['"]/i, evidence: "done event evidence was detected." },
    { signal: "on-error", pattern: /onError|transition\s*\(['"]error['"]/i, evidence: "error event evidence was detected." },
    { signal: "event-payload", pattern: /event\.[A-Za-z0-9_]+|ev\.[A-Za-z0-9_]+|payload|output/i, evidence: "event payload evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "event", "signal");
}

function stateMachineReadinessTestSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["testSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /\bvitest\b|describe\s*\(|it\s*\(|expect\s*\(/i, evidence: "Vitest evidence was detected." },
    { signal: "model-test", pattern: /createTestModel|testModel|@xstate\/test|model-based/i, evidence: "model-based test evidence was detected." },
    { signal: "transition-test", pattern: /transition test|matches\s*\(|getSnapshot\s*\(|state-machine/i, evidence: "transition assertion evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|state-machine-traces|artifacts?/i, evidence: "artifact upload evidence was detected." },
    { signal: "storybook", pattern: /storybook|play\s*:/i, evidence: "Storybook interaction evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function stateMachineReadinessPackageSignals(sourceFiles: StateMachineReadinessSourceFile[]): StateMachineReadinessReport["packageSignals"] {
  const specs: Array<{ signal: StateMachineReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "xstate", pattern: /"xstate"|from ["']xstate["']|createActor|fromPromise|setup\s*\(/i, evidence: "XState package evidence was detected." },
    { signal: "robot3", pattern: /"robot3"|from ["']robot3["']|require\(["']robot3["']\)/i, evidence: "Robot3 package evidence was detected." },
    { signal: "@zag-js/core", pattern: /"@zag-js\/core"|from ["']@zag-js\/core["']|createMachine\s*\(/i, evidence: "Zag core package evidence was detected." },
    { signal: "@zag-js/react", pattern: /"@zag-js\/react"|from ["']@zag-js\/react["']|useMachine|normalizeProps/i, evidence: "Zag React package evidence was detected." },
    { signal: "@zag-js/toggle", pattern: /"@zag-js\/toggle"|from ["']@zag-js\/toggle["']|toggle\.machine|toggle\.connect/i, evidence: "Zag toggle package evidence was detected." },
    { signal: "javascript-state-machine", pattern: /"javascript-state-machine"|javascript-state-machine|new\s+StateMachine/i, evidence: "javascript-state-machine package evidence was detected." }
  ];
  return stateMachineReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function stateMachineReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: StateMachineReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/state-machine-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildAnimationReadinessReport(walk: WalkResult): Promise<AnimationReadinessReport> {
  const sourceFiles = await animationReadinessSourceFiles(walk);
  const animationSetups = animationReadinessSetups(sourceFiles);
  const librarySignals = animationReadinessLibrarySignals(sourceFiles);
  const declarationSignals = animationReadinessDeclarationSignals(sourceFiles);
  const timingSignals = animationReadinessTimingSignals(sourceFiles);
  const interactionSignals = animationReadinessInteractionSignals(sourceFiles);
  const layoutSignals = animationReadinessLayoutSignals(sourceFiles);
  const accessibilitySignals = animationReadinessAccessibilitySignals(sourceFiles);
  const runtimeSignals = animationReadinessRuntimeSignals(sourceFiles);
  const testSignals = animationReadinessTestSignals(sourceFiles);
  const packageSignals = animationReadinessPackageSignals(sourceFiles);

  const hasLibrary = librarySignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasDeclaration = declarationSignals.some((item) => item.readiness === "ready") || animationSetups.some((item) => item.componentCount > 0 || item.timelineCount > 0 || item.keyframeCount > 0);
  const hasTiming = timingSignals.some((item) => item.readiness === "ready");
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready");
  const hasLayout = layoutSignals.some((item) => item.readiness === "ready");
  const hasReducedMotion = accessibilitySignals.some((item) => item.signal === "reduced-motion" && item.readiness === "ready")
    || accessibilitySignals.some((item) => item.signal === "prefers-reduced-motion" && item.readiness === "ready");
  const hasTests = testSignals.some((item) => item.readiness === "ready") || animationSetups.some((item) => item.testCount > 0);

  const riskQueue: AnimationReadinessReport["riskQueue"] = [];
  if (!hasLibrary && !hasDeclaration) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document animation library, CSS keyframes, WAAPI calls, or custom timeline definitions before claiming animation readiness.",
      why: "Animation readiness starts with a visible animation boundary learners can inspect.",
      relatedHref: "html/animation-readiness.html"
    });
  }
  if (hasDeclaration && !hasTiming) {
    riskQueue.push({
      priority: "high",
      action: "Trace duration, delay, easing, spring config, stagger, repeat, yoyo, or timeline defaults.",
      why: "Animation behavior is difficult to reason about when timing and easing policy are implicit.",
      relatedHref: "html/animation-readiness.html"
    });
  }
  if (hasDeclaration && !hasReducedMotion) {
    riskQueue.push({
      priority: "high",
      action: "Add reduced-motion handling or document why motion is safe for sensitive users.",
      why: "Learners should see how animation code respects `prefers-reduced-motion` or equivalent controls.",
      relatedHref: "html/animation-readiness.html"
    });
  }
  if ((hasInteraction || hasLayout) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic animation checks for interaction, layout, scroll, or mid-animation states.",
      why: "Gesture, scroll, and layout animations often regress without frame/timer-aware tests or visual review artifacts.",
      relatedHref: "html/animation-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify animation behavior with trusted local visual tests, browser checks, or manual review outside RepoTutor.",
    why: "RepoTutor records animation readiness only; it does not start timelines, tick animation frames, query live computed styles, call requestAnimationFrame callbacks, read live getAnimations results, or execute analyzed project tests.",
    relatedHref: "html/animation-readiness.html"
  });

  return {
    summary: `Motion/React Spring/GSAP-style animation readiness report: setup ${animationSetups.length}개, library signal ${librarySignals.length}개, timing signal ${timingSignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Animation readiness Motion animate AnimatePresence variants React Spring useSpring animated GSAP timeline ScrollTrigger reduced motion frame tests",
    animationSetups,
    librarySignals,
    declarationSignals,
    timingSignals,
    interactionSignals,
    layoutSignals,
    accessibilitySignals,
    runtimeSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"motion\\.|AnimatePresence|useAnimate|useAnimationControls|variants|whileHover|whileTap\" src app packages test", purpose: "Find Motion/Framer Motion components, variants, gestures, and controls." },
      { command: "rg \"useSpring|useSprings|useTrail|useTransition|animated\\.|Controller|SpringValue|config\" src app packages test", purpose: "Find React Spring hooks, animated hosts, controllers, spring values, and config." },
      { command: "rg \"gsap\\.timeline|gsap\\.to|gsap\\.from|fromTo|ScrollTrigger|registerPlugin\" src app packages test", purpose: "Find GSAP timelines, tweens, plugins, and scroll-linked animation." },
      { command: "rg \"duration|delay|ease|stagger|repeat|yoyo|stiffness|damping|tension|friction\" src app packages test", purpose: "Review timing, easing, spring, repeat, and stagger policies." },
      { command: "rg \"useReducedMotion|prefers-reduced-motion|will-change|getAnimations|requestAnimationFrame|fakeTimers\" src app packages test", purpose: "Check reduced-motion handling, compositor hints, and deterministic frame/timer test evidence." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover animation timing, interaction, and visual states." }
    ],
    learnerNextSteps: [
      "먼저 Motion, Framer Motion, React Spring, GSAP, CSS keyframes, WAAPI 중 어떤 애니메이션 경계가 있는지 찾으세요.",
      "animate, variants, keyframes, timeline, transition 선언을 보고 어떤 값이 움직이는지 분리하세요.",
      "duration, delay, ease, spring config, stagger, repeat, yoyo를 찾아 애니메이션 정책을 읽으세요.",
      "whileHover, whileTap, drag, inView, ScrollTrigger는 사용자 입력이나 scroll 상태와 연결된 신호입니다.",
      "AnimatePresence, exit, layout, layoutId, FLIP 신호는 mount/unmount 또는 layout 전환을 설명합니다.",
      "useReducedMotion, prefers-reduced-motion, will-change, compositor property 신호로 접근성과 성능 배려를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 frame timing, computed style, animation playback은 원본 프로젝트 테스트나 수동 브라우저 검증에서 확인하세요."
    ]
  };
}

type AnimationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function animationReadinessSourceFiles(walk: WalkResult): Promise<AnimationReadinessSourceFile[]> {
  const files: AnimationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !animationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!animationReadinessPathSignal(file.relPath) && !animationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function animationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return animationReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|css|scss|sass|less|json|md|mdx|ya?ml)$/i.test(filePath);
}

function animationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(animations?|motion|transitions?|springs?|timeline|gsap|framer|react-spring|visual|e2e|tests?)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function animationReadinessContentSignal(text: string): boolean {
  return /(<motion\.|motion\s*\(|AnimatePresence|useAnimate|useAnimationControls|useMotionValue|useReducedMotion|whileHover|whileTap|variants\s*=|variants\s*:|layoutId|@react-spring\/|useSpring|useSprings|useTrail|useTransition|animated\.|SpringValue|Controller|gsap\.|ScrollTrigger|registerPlugin|@keyframes|keyframes\s*{|Element\.animate|\.animate\s*\(|prefers-reduced-motion|getAnimations|requestAnimationFrame)/i.test(text);
}

function animationReadinessSetups(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["animationSetups"] {
  const rows: AnimationReadinessReport["animationSetups"] = [];
  for (const source of sourceFiles) {
    const componentCount = countMatches(source.text, /(<motion\.|motion\s*\(|<animated\.|animated\.|animated\s*\()/gi);
    const timelineCount = countMatches(source.text, /(gsap\.timeline|timeline\.|ScrollTrigger|anime\.timeline|new\s+Timeline|TimelineMax|TimelineLite)/gi);
    const keyframeCount = countMatches(source.text, /(@keyframes|keyframes\s*:|keyframes\s*\{|animate\s*:\s*\[|Element\.animate|\.animate\s*\(|fromTo\s*\()/gi);
    const springCount = countMatches(source.text, /(useSpring|useSprings|useTrail|SpringValue|Controller|stiffness|damping|tension|friction|type\s*:\s*['"]spring['"]|config\s*:)/gi);
    const gestureCount = countMatches(source.text, /(whileHover|whileTap|\bdrag\b|useInView|ScrollTrigger|onHover|onTap|gesture|hover\s*:|tap\s*:)/gi);
    const layoutCount = countMatches(source.text, /(AnimatePresence|layoutId|layout\s*(?:=|:)|exit\s*=|exit\s*:|\bFLIP\b|Flip\.|shared layout|LayoutGroup)/gi);
    const accessibilityCount = countMatches(source.text, /(useReducedMotion|prefers-reduced-motion|reducedMotion|shouldReduceMotion|willChange|will-change|compositor|transform|opacity|getAnimations)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|describe\s*\(|it\s*\(|expect\s*\(|fakeTimers|advanceTimers|requestAnimationFrame|getAnimations|upload-artifact|animation-traces|visual regression|mid-animation)/gi);
    const hasSetupSignal = componentCount + timelineCount + keyframeCount + springCount + gestureCount + layoutCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: animationReadinessPlatform(source),
      componentCount,
      timelineCount,
      keyframeCount,
      springCount,
      gestureCount,
      layoutCount,
      accessibilityCount,
      testCount,
      readiness: (componentCount + timelineCount + keyframeCount + springCount > 0) && (springCount + timelineCount + keyframeCount + accessibilityCount + testCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains components ${componentCount}, timelines ${timelineCount}, keyframes ${keyframeCount}, springs ${springCount}, gestures ${gestureCount}, layout ${layoutCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function animationReadinessPlatform(source: AnimationReadinessSourceFile): AnimationReadinessReport["animationSetups"][number]["platform"] {
  if (/from ["']motion(?:\/react)?["']|["']motion["']|<motion\.|motion\s*\(|useAnimate|AnimatePresence/i.test(source.text)) return "motion";
  if (/from ["']framer-motion["']|["']framer-motion["']/i.test(source.text)) return "framer-motion";
  if (/@react-spring\/|from ["']react-spring["']|useSpring|animated\.|SpringValue|Controller/i.test(source.text)) return "react-spring";
  if (/["']gsap["']|from ["']gsap|gsap\.|ScrollTrigger|TimelineMax|TimelineLite/i.test(source.text)) return "gsap";
  if (/@keyframes|animation-name|animation-duration|transition-property/i.test(source.text)) return "css";
  if (/Element\.animate|\.animate\s*\(|getAnimations|KeyframeEffect|AnimationTimeline/i.test(source.text)) return "waapi";
  if (/animation|transition|timeline|spring/i.test(source.text) || animationReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function animationReadinessLibrarySignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["librarySignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["librarySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "motion", pattern: /from ["']motion(?:\/react)?["']|["']motion["']|<motion\.|motion\s*\(|useAnimate|AnimatePresence/i, evidence: "Motion evidence was detected." },
    { signal: "framer-motion", pattern: /from ["']framer-motion["']|["']framer-motion["']/i, evidence: "Framer Motion evidence was detected." },
    { signal: "react-spring", pattern: /@react-spring\/|from ["']react-spring["']|useSpring|animated\.|SpringValue|Controller/i, evidence: "React Spring evidence was detected." },
    { signal: "gsap", pattern: /["']gsap["']|from ["']gsap|gsap\.|ScrollTrigger|registerPlugin/i, evidence: "GSAP evidence was detected." },
    { signal: "css", pattern: /@keyframes|animation-name|animation-duration|transition-property|transition\s*:/i, evidence: "CSS animation/transition evidence was detected." },
    { signal: "waapi", pattern: /Element\.animate|\.animate\s*\(|getAnimations|KeyframeEffect|AnimationTimeline/i, evidence: "Web Animations API evidence was detected." },
    { signal: "custom", pattern: /requestAnimationFrame|timeline|interpolate|lerp|spring/i, evidence: "custom animation evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "library", "signal");
}

function animationReadinessDeclarationSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["declarationSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["declarationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "motion-component", pattern: /<motion\.|motion\s*\(/i, evidence: "motion component evidence was detected." },
    { signal: "animated-component", pattern: /<animated\.|animated\.|animated\s*\(/i, evidence: "animated component evidence was detected." },
    { signal: "animate-prop", pattern: /\banimate\s*=|\banimate\s*:|controls\.start|api\.start/i, evidence: "animate/start evidence was detected." },
    { signal: "variants", pattern: /\bvariants\s*=|\bvariants\s*:/i, evidence: "variants evidence was detected." },
    { signal: "keyframes", pattern: /\bkeyframes\s*:|\banimate\s*:\s*\[|fromTo\s*\(/i, evidence: "keyframe sequence evidence was detected." },
    { signal: "css-keyframes", pattern: /@keyframes|animation-name/i, evidence: "CSS keyframes evidence was detected." },
    { signal: "transition", pattern: /\btransition\s*=|\btransition\s*:|useTransition/i, evidence: "transition evidence was detected." },
    { signal: "timeline", pattern: /gsap\.timeline|timeline\.|TimelineMax|TimelineLite/i, evidence: "timeline evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "declaration", "signal");
}

function animationReadinessTimingSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["timingSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["timingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "duration", pattern: /\bduration\s*:|animation-duration/i, evidence: "duration evidence was detected." },
    { signal: "delay", pattern: /\bdelay\s*:|animation-delay/i, evidence: "delay evidence was detected." },
    { signal: "ease", pattern: /\bease\s*:|easing|parseEase|power\d|linear/i, evidence: "easing evidence was detected." },
    { signal: "spring-config", pattern: /stiffness|damping|tension|friction|type\s*:\s*['"]spring['"]|config\s*:/i, evidence: "spring config evidence was detected." },
    { signal: "stagger", pattern: /\bstagger|staggerChildren|trail\s*:/i, evidence: "stagger/trail evidence was detected." },
    { signal: "repeat", pattern: /\brepeat\s*:|repeatDelay|loop\s*:/i, evidence: "repeat evidence was detected." },
    { signal: "yoyo", pattern: /\byoyo\s*:|alternate/i, evidence: "yoyo/alternate evidence was detected." },
    { signal: "timeline-defaults", pattern: /gsap\.timeline\s*\(\s*\{[\s\S]{0,200}defaults\s*:/i, evidence: "timeline defaults evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "timing", "signal");
}

function animationReadinessInteractionSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "while-hover", pattern: /whileHover|onHover|hover\s*:/i, evidence: "hover animation evidence was detected." },
    { signal: "while-tap", pattern: /whileTap|onTap|tap\s*:/i, evidence: "tap animation evidence was detected." },
    { signal: "drag", pattern: /\bdrag\b|dragControls|whileDrag/i, evidence: "drag animation evidence was detected." },
    { signal: "scroll-trigger", pattern: /ScrollTrigger|scrollYProgress|useScroll|scroll-linked|scroll timeline/i, evidence: "scroll-trigger animation evidence was detected." },
    { signal: "in-view", pattern: /useInView|whileInView|IntersectionObserver|inView/i, evidence: "in-view animation evidence was detected." },
    { signal: "gesture", pattern: /gesture|pointer|touch|pan|swipe/i, evidence: "gesture animation evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function animationReadinessLayoutSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["layoutSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["layoutSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "layout", pattern: /\blayout\b|\blayout\s*=|\blayout\s*:/i, evidence: "layout animation evidence was detected." },
    { signal: "layout-id", pattern: /layoutId/i, evidence: "layoutId evidence was detected." },
    { signal: "animate-presence", pattern: /AnimatePresence/i, evidence: "AnimatePresence evidence was detected." },
    { signal: "exit", pattern: /\bexit\s*=|\bexit\s*:/i, evidence: "exit animation evidence was detected." },
    { signal: "flip", pattern: /\bFLIP\b|Flip\.|gsap\/Flip/i, evidence: "FLIP evidence was detected." },
    { signal: "shared-layout", pattern: /shared layout|LayoutGroup|layoutDependency/i, evidence: "shared layout evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "layout", "signal");
}

function animationReadinessAccessibilitySignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "reduced-motion", pattern: /useReducedMotion|reducedMotion|shouldReduceMotion/i, evidence: "reduced-motion hook/config evidence was detected." },
    { signal: "prefers-reduced-motion", pattern: /prefers-reduced-motion|matchMedia\s*\(\s*['"]\(prefers-reduced-motion/i, evidence: "prefers-reduced-motion media query evidence was detected." },
    { signal: "disable-motion", pattern: /disableMotion|motion\s*:\s*false|reduced\s*:\s*true/i, evidence: "motion disable evidence was detected." },
    { signal: "will-change", pattern: /willChange|will-change/i, evidence: "will-change performance hint evidence was detected." },
    { signal: "compositor", pattern: /transform|opacity|translate3d|scale3d|compositor|WAAPI/i, evidence: "compositor-friendly property evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function animationReadinessRuntimeSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "controls", pattern: /useAnimationControls|controls\.start|api\.start|controller\.start/i, evidence: "imperative controls evidence was detected." },
    { signal: "motion-value", pattern: /useMotionValue|motionValue|MotionValue|useTransform|SpringValue/i, evidence: "motion value evidence was detected." },
    { signal: "animation-frame", pattern: /requestAnimationFrame|useAnimationFrame|frameLoop|rafz|ticker/i, evidence: "animation frame evidence was detected." },
    { signal: "get-animations", pattern: /getAnimations\s*\(/i, evidence: "getAnimations evidence was detected." },
    { signal: "ticker", pattern: /gsap\.ticker|ticker\.|rafz/i, evidence: "ticker evidence was detected." },
    { signal: "kill", pattern: /killTweensOf|\.kill\s*\(|cancelAnimationFrame|stop\s*\(/i, evidence: "animation stop/kill evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function animationReadinessTestSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["testSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /\bvitest\b|describe\s*\(|it\s*\(|expect\s*\(/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /\bplaywright\b|@playwright\/test|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /\bcypress\b|cy\.|cypress\/integration/i, evidence: "Cypress evidence was detected." },
    { signal: "fake-timers", pattern: /fakeTimers|useFakeTimers|advanceTimers|tick\s*\(/i, evidence: "fake timer evidence was detected." },
    { signal: "frame-test", pattern: /requestAnimationFrame|getAnimations|mid-animation|computed style|advanceTimers/i, evidence: "frame or mid-animation test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|animation-traces|visual-report|screenshot|trace/i, evidence: "artifact upload evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function animationReadinessPackageSignals(sourceFiles: AnimationReadinessSourceFile[]): AnimationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AnimationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "motion", pattern: /["']motion["']|from ["']motion(?:\/react)?["']/i, evidence: "Motion package evidence was detected." },
    { signal: "framer-motion", pattern: /["']framer-motion["']|from ["']framer-motion["']/i, evidence: "Framer Motion package evidence was detected." },
    { signal: "@react-spring/web", pattern: /["@']@react-spring\/web["@']|from ["']@react-spring\/web["']/i, evidence: "React Spring web package evidence was detected." },
    { signal: "gsap", pattern: /["']gsap["']|from ["']gsap|gsap\//i, evidence: "GSAP package evidence was detected." },
    { signal: "animejs", pattern: /["']animejs["']|["']animejs\/lib|from ["']animejs/i, evidence: "Anime.js package evidence was detected." }
  ];
  return animationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function animationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AnimationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/animation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDragAndDropReadinessReport(walk: WalkResult): Promise<DragAndDropReadinessReport> {
  const sourceFiles = await dragAndDropReadinessSourceFiles(walk);
  const dragAndDropSetups = dragAndDropReadinessSetups(sourceFiles);
  const librarySignals = dragAndDropReadinessLibrarySignals(sourceFiles);
  const providerSignals = dragAndDropReadinessProviderSignals(sourceFiles);
  const sensorSignals = dragAndDropReadinessSensorSignals(sourceFiles);
  const draggableSignals = dragAndDropReadinessDraggableSignals(sourceFiles);
  const droppableSignals = dragAndDropReadinessDroppableSignals(sourceFiles);
  const sortableSignals = dragAndDropReadinessSortableSignals(sourceFiles);
  const feedbackSignals = dragAndDropReadinessFeedbackSignals(sourceFiles);
  const accessibilitySignals = dragAndDropReadinessAccessibilitySignals(sourceFiles);
  const testSignals = dragAndDropReadinessTestSignals(sourceFiles);
  const packageSignals = dragAndDropReadinessPackageSignals(sourceFiles);

  const hasLibrary = librarySignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasProvider = providerSignals.some((item) => item.readiness === "ready") || dragAndDropSetups.some((item) => item.providerCount > 0);
  const hasDragSource = draggableSignals.some((item) => item.readiness === "ready") || dragAndDropSetups.some((item) => item.draggableCount > 0);
  const hasDropTarget = droppableSignals.some((item) => item.readiness === "ready") || dragAndDropSetups.some((item) => item.droppableCount > 0);
  const hasKeyboard = accessibilitySignals.some((item) => item.signal === "keyboard" && item.readiness === "ready")
    || sensorSignals.some((item) => item.signal === "keyboard-sensor" && item.readiness === "ready");
  const hasTests = testSignals.some((item) => item.readiness === "ready") || dragAndDropSetups.some((item) => item.testCount > 0);

  const riskQueue: DragAndDropReadinessReport["riskQueue"] = [];
  if (!hasLibrary && !hasProvider) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a drag-and-drop boundary such as DnD Kit, React DnD, SortableJS, native HTML5 drag events, or a custom adapter.",
      why: "Drag-and-drop readiness starts with an explicit provider, backend, sortable binding, or event contract learners can inspect.",
      relatedHref: "html/drag-and-drop-readiness.html"
    });
  }
  if (hasDragSource && !hasDropTarget) {
    riskQueue.push({
      priority: "high",
      action: "Pair draggable sources with visible droppable targets, accept/canDrop rules, or drop handlers.",
      why: "Drag sources alone do not explain where items can land or how a drop result is produced.",
      relatedHref: "html/drag-and-drop-readiness.html"
    });
  }
  if ((hasDragSource || hasDropTarget) && !hasKeyboard) {
    riskQueue.push({
      priority: "high",
      action: "Add keyboard sensor, keyboard drag instructions, or accessible handle semantics.",
      why: "Drag-and-drop interactions often become mouse-only unless keyboard and screen-reader behavior is explicit.",
      relatedHref: "html/drag-and-drop-readiness.html"
    });
  }
  if ((hasProvider || hasDragSource || hasDropTarget) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for pointer, keyboard, dragstart/drop, backend, or reorder outcomes.",
      why: "Drag-and-drop regressions are usually interaction-state regressions and need explicit event or backend test evidence.",
      relatedHref: "html/drag-and-drop-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real drag behavior with trusted local browser, backend, or manual interaction checks outside RepoTutor.",
    why: "RepoTutor records drag-and-drop readiness only; it does not dispatch pointer, keyboard, dragstart, dragover, drop, touch, or mouse events, create DataTransfer payloads, mount DnD providers, read live DOM geometry, or execute analyzed project tests.",
    relatedHref: "html/drag-and-drop-readiness.html"
  });

  return {
    summary: `DnD Kit/React DnD/SortableJS-style drag-and-drop readiness report: setup ${dragAndDropSetups.length}개, provider signal ${providerSignals.length}개, sortable signal ${sortableSignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Drag and drop readiness DnD Kit DndContext useDraggable useDroppable React DnD DndProvider useDrag useDrop SortableJS onEnd keyboard tests",
    dragAndDropSetups,
    librarySignals,
    providerSignals,
    sensorSignals,
    draggableSignals,
    droppableSignals,
    sortableSignals,
    feedbackSignals,
    accessibilitySignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"DndContext|useDraggable|useDroppable|useSortable|SortableContext|DragOverlay|PointerSensor|KeyboardSensor\" src app packages test", purpose: "Find DnD Kit providers, hooks, overlays, sortable contexts, and sensors." },
      { command: "rg \"DndProvider|useDrag|useDrop|useDragLayer|HTML5Backend|TouchBackend|TestBackend|monitor|collect\" src app packages test", purpose: "Find React DnD providers, hooks, backends, monitors, and collect functions." },
      { command: "rg \"Sortable\\.create|new Sortable|onEnd|onUpdate|onMove|group:|handle:|ghostClass|chosenClass|dragClass\" src app packages test", purpose: "Find SortableJS bindings, reorder handlers, grouping, handles, and drag feedback classes." },
      { command: "rg \"KeyboardSensor|screenReaderInstructions|aria-live|aria-grabbed|role=|handle\" src app packages test", purpose: "Review keyboard and accessibility support for drag interactions." },
      { command: "rg \"fireEvent|pointerDown|dragStart|drop|DataTransfer|playwright|TestBackend|upload-artifact\" src app packages test .github", purpose: "Check deterministic drag tests and trace artifact evidence." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover drag sources, drop targets, sorting, and keyboard flows." }
    ],
    learnerNextSteps: [
      "먼저 DnD Kit, React DnD, SortableJS, native HTML5 drag event 중 어떤 경계가 있는지 찾으세요.",
      "DndContext, DndProvider, Sortable.create 같은 provider/binding 지점부터 읽으면 전체 상호작용 범위가 보입니다.",
      "useDraggable/useDrag와 useDroppable/useDrop를 짝지어 drag source와 drop target 규칙을 분리하세요.",
      "PointerSensor, KeyboardSensor, HTML5Backend, TouchBackend, TestBackend는 입력 장치와 테스트 경계를 설명합니다.",
      "SortableContext, useSortable, arrayMove, onEnd, onUpdate, group, swapThreshold는 reorder 정책을 설명합니다.",
      "DragOverlay, ghostClass, chosenClass, monitor, collect, preview 신호는 drag 중 피드백 상태입니다.",
      "이 리포트는 정적 readiness입니다. 실제 pointer/drop 이벤트, DataTransfer, DOM geometry, browser playback은 원본 프로젝트 테스트나 수동 검증에서 확인하세요."
    ]
  };
}

type DragAndDropReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dragAndDropReadinessSourceFiles(walk: WalkResult): Promise<DragAndDropReadinessSourceFile[]> {
  const files: DragAndDropReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dragAndDropReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!dragAndDropReadinessPathSignal(file.relPath) && !dragAndDropReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function dragAndDropReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dragAndDropReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|css|scss|sass|less|json|md|mdx|ya?ml)$/i.test(filePath);
}

function dragAndDropReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(dnd|drag|drop|sortable|sort|reorder|kanban|board|interaction|e2e|tests?)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function dragAndDropReadinessContentSignal(text: string): boolean {
  return /(DndContext|DragDropProvider|DndProvider|useDraggable|useDroppable|useSortable|SortableContext|DragOverlay|PointerSensor|KeyboardSensor|closestCenter|arrayMove|useDrag|useDrop|useDragLayer|HTML5Backend|TouchBackend|TestBackend|Sortable\.create|new Sortable|onEnd|onUpdate|onMove|ghostClass|chosenClass|dragClass|dragstart|DataTransfer|aria-grabbed|screenReaderInstructions)/i.test(text);
}

function dragAndDropReadinessSetups(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["dragAndDropSetups"] {
  const rows: DragAndDropReadinessReport["dragAndDropSetups"] = [];
  for (const source of sourceFiles) {
    const providerCount = countMatches(source.text, /(DndContext|DragDropProvider|DndProvider|Sortable\.create|new\s+Sortable|backend\s*=|backend\s*:)/gi);
    const draggableCount = countMatches(source.text, /(useDraggable|useDrag\s*\(|dragRef|connectDragSource|draggable\s*=|draggable\s*=\s*true|dragstart|onDragStart|setActivatorNodeRef)/gi);
    const droppableCount = countMatches(source.text, /(useDroppable|useDrop\s*\(|dropRef|connectDropTarget|drop\s*:|onDrop|canDrop|accept\s*:|fireEvent\.drop)/gi);
    const sortableCount = countMatches(source.text, /(SortableContext|useSortable|arrayMove|Sortable\.create|new\s+Sortable|onEnd|onUpdate|onMove|swapThreshold|group\s*:|toArray\s*\()/gi);
    const sensorCount = countMatches(source.text, /(useSensor|useSensors|PointerSensor|KeyboardSensor|TouchSensor|MouseSensor|HTML5Backend|TouchBackend|TestBackend|activationConstraint|pointerdown|pointerDown|dragStart)/gi);
    const feedbackCount = countMatches(source.text, /(DragOverlay|ghostClass|chosenClass|dragClass|useDragLayer|monitor\.|collect\s*:|previewRef|isDragging|isDropTarget|data-can-drop)/gi);
    const accessibilityCount = countMatches(source.text, /(KeyboardSensor|screenReaderInstructions|aria-live|aria-grabbed|aria-describedby|role=|role\s*:|handle\s*:|handleRef|keyboard)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|describe\s*\(|it\s*\(|expect\s*\(|testing-library|fireEvent|pointerDown|dragStart|DataTransfer|TestBackend|upload-artifact|dnd-traces)/gi);
    const hasSetupSignal = providerCount + draggableCount + droppableCount + sortableCount + sensorCount + feedbackCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: dragAndDropReadinessPlatform(source),
      providerCount,
      draggableCount,
      droppableCount,
      sortableCount,
      sensorCount,
      feedbackCount,
      accessibilityCount,
      testCount,
      readiness: (providerCount + sortableCount > 0) && (draggableCount + droppableCount + sortableCount > 0) && (sensorCount + accessibilityCount + testCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains providers ${providerCount}, draggables ${draggableCount}, droppables ${droppableCount}, sortable ${sortableCount}, sensors ${sensorCount}, feedback ${feedbackCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function dragAndDropReadinessPlatform(source: DragAndDropReadinessSourceFile): DragAndDropReadinessReport["dragAndDropSetups"][number]["platform"] {
  if (/@dnd-kit\/|DndContext|DragDropProvider|useDraggable|useDroppable|useSortable|SortableContext|DragOverlay|PointerSensor|KeyboardSensor/i.test(source.text)) return "dnd-kit";
  if (/from ["']react-dnd["']|["']react-dnd["']|DndProvider|useDrag\s*\(|useDrop\s*\(|HTML5Backend|TouchBackend|TestBackend/i.test(source.text)) return "react-dnd";
  if (/["']sortablejs["']|Sortable\.create|new\s+Sortable|ghostClass|chosenClass|swapThreshold/i.test(source.text)) return "sortablejs";
  if (/dragstart|dragover|drop|DataTransfer|draggable\s*=/i.test(source.text)) return "native-html5";
  if (/drag|drop|sortable|reorder/i.test(source.text) || dragAndDropReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function dragAndDropReadinessLibrarySignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["librarySignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["librarySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dnd-kit", pattern: /@dnd-kit\/|DndContext|DragDropProvider|useDraggable|useDroppable|useSortable|SortableContext/i, evidence: "DnD Kit evidence was detected." },
    { signal: "react-dnd", pattern: /from ["']react-dnd["']|["']react-dnd["']|DndProvider|useDrag\s*\(|useDrop\s*\(/i, evidence: "React DnD evidence was detected." },
    { signal: "sortablejs", pattern: /["']sortablejs["']|Sortable\.create|new\s+Sortable/i, evidence: "SortableJS evidence was detected." },
    { signal: "native-html5", pattern: /dragstart|dragover|DataTransfer|draggable\s*=|ondrop|onDrop/i, evidence: "native HTML5 drag/drop evidence was detected." },
    { signal: "custom", pattern: /reorder|drag\s+and\s+drop|dragDrop|dropTarget/i, evidence: "custom drag-and-drop evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "library", "signal");
}

function dragAndDropReadinessProviderSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["providerSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["providerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dnd-context", pattern: /DndContext|DragDropProvider/i, evidence: "DndContext/DragDropProvider evidence was detected." },
    { signal: "dnd-provider", pattern: /DndProvider/i, evidence: "React DnD provider evidence was detected." },
    { signal: "backend", pattern: /backend\s*=|backend\s*:|HTML5Backend|TouchBackend|TestBackend/i, evidence: "backend evidence was detected." },
    { signal: "sortable-create", pattern: /Sortable\.create|new\s+Sortable/i, evidence: "SortableJS create evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "provider", "signal");
}

function dragAndDropReadinessSensorSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["sensorSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["sensorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-sensor", pattern: /PointerSensor|pointerdown|pointerDown|pointermove|pointerup/i, evidence: "pointer sensor/event evidence was detected." },
    { signal: "keyboard-sensor", pattern: /KeyboardSensor|keyboardCodes|keyDown|keydown|keyboard/i, evidence: "keyboard sensor/event evidence was detected." },
    { signal: "touch-backend", pattern: /TouchBackend|TouchSensor|touchstart|touchmove/i, evidence: "touch backend/sensor evidence was detected." },
    { signal: "html5-backend", pattern: /HTML5Backend|dragstart|DataTransfer/i, evidence: "HTML5 backend evidence was detected." },
    { signal: "test-backend", pattern: /TestBackend|react-dnd-test-backend/i, evidence: "test backend evidence was detected." },
    { signal: "activation-constraint", pattern: /activationConstraint|delay\s*:|distance\s*:/i, evidence: "activation constraint evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "sensor", "signal");
}

function dragAndDropReadinessDraggableSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["draggableSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["draggableSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "use-draggable", pattern: /useDraggable/i, evidence: "useDraggable evidence was detected." },
    { signal: "use-drag", pattern: /useDrag\s*\(/i, evidence: "useDrag evidence was detected." },
    { signal: "drag-ref", pattern: /dragRef|connectDragSource|setActivatorNodeRef|setNodeRef/i, evidence: "drag ref evidence was detected." },
    { signal: "dragstart", pattern: /dragstart|dragStart|onDragStart|fireEvent\.dragStart/i, evidence: "dragstart evidence was detected." },
    { signal: "draggable-attribute", pattern: /draggable\s*=|draggable\s*=\s*true/i, evidence: "draggable attribute evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "draggable", "signal");
}

function dragAndDropReadinessDroppableSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["droppableSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["droppableSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "use-droppable", pattern: /useDroppable/i, evidence: "useDroppable evidence was detected." },
    { signal: "use-drop", pattern: /useDrop\s*\(/i, evidence: "useDrop evidence was detected." },
    { signal: "drop-ref", pattern: /dropRef|connectDropTarget|setNodeRef/i, evidence: "drop ref evidence was detected." },
    { signal: "drop-handler", pattern: /drop\s*:|onDrop|fireEvent\.drop|\.drop\s*\(/i, evidence: "drop handler evidence was detected." },
    { signal: "can-drop", pattern: /canDrop|accept\s*:|isOver|isDropTarget/i, evidence: "canDrop/accept evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "droppable", "signal");
}

function dragAndDropReadinessSortableSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["sortableSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["sortableSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sortable-context", pattern: /SortableContext/i, evidence: "SortableContext evidence was detected." },
    { signal: "use-sortable", pattern: /useSortable/i, evidence: "useSortable evidence was detected." },
    { signal: "array-move", pattern: /arrayMove|arraySwap|move\s*\(/i, evidence: "array move evidence was detected." },
    { signal: "sortable-create", pattern: /Sortable\.create|new\s+Sortable/i, evidence: "SortableJS create evidence was detected." },
    { signal: "on-end", pattern: /onEnd|onDragEnd/i, evidence: "drag end/reorder evidence was detected." },
    { signal: "on-update", pattern: /onUpdate/i, evidence: "update handler evidence was detected." },
    { signal: "group", pattern: /group\s*:/i, evidence: "sortable group evidence was detected." },
    { signal: "swap-threshold", pattern: /swapThreshold|invertedSwapThreshold/i, evidence: "swap threshold evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "sortable", "signal");
}

function dragAndDropReadinessFeedbackSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["feedbackSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["feedbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "drag-overlay", pattern: /DragOverlay/i, evidence: "DragOverlay evidence was detected." },
    { signal: "ghost-class", pattern: /ghostClass|sortable-ghost/i, evidence: "ghost class evidence was detected." },
    { signal: "chosen-class", pattern: /chosenClass|sortable-chosen/i, evidence: "chosen class evidence was detected." },
    { signal: "drag-class", pattern: /dragClass|sortable-drag/i, evidence: "drag class evidence was detected." },
    { signal: "monitor", pattern: /monitor\.|DragSourceMonitor|DropTargetMonitor|useDragLayer/i, evidence: "monitor evidence was detected." },
    { signal: "collect", pattern: /collect\s*:/i, evidence: "collect function evidence was detected." },
    { signal: "preview", pattern: /previewRef|DragPreview|connectDragPreview/i, evidence: "drag preview evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "feedback", "signal");
}

function dragAndDropReadinessAccessibilitySignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "keyboard", pattern: /KeyboardSensor|keyboard|keyDown|keydown/i, evidence: "keyboard drag evidence was detected." },
    { signal: "screen-reader-instructions", pattern: /screenReaderInstructions|screen reader|announcements/i, evidence: "screen reader instruction evidence was detected." },
    { signal: "aria-live", pattern: /aria-live/i, evidence: "aria-live evidence was detected." },
    { signal: "aria-grabbed", pattern: /aria-grabbed/i, evidence: "aria-grabbed evidence was detected." },
    { signal: "role", pattern: /role=|role\s*:/i, evidence: "role evidence was detected." },
    { signal: "handle", pattern: /handle\s*:|handleRef|setActivatorNodeRef|\.handle/i, evidence: "drag handle evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function dragAndDropReadinessTestSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["testSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /\bvitest\b|describe\s*\(|it\s*\(|expect\s*\(/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /\bplaywright\b|@playwright\/test|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /\bcypress\b|cy\.|cypress\/integration/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library|fireEvent|userEvent/i, evidence: "Testing Library evidence was detected." },
    { signal: "pointer-event", pattern: /pointerDown|pointerdown|pointerMove|pointerUp|PointerEvent/i, evidence: "pointer event test evidence was detected." },
    { signal: "drag-event", pattern: /dragStart|dragstart|fireEvent\.drop|DataTransfer|drop\s*\(/i, evidence: "drag/drop event test evidence was detected." },
    { signal: "test-backend", pattern: /TestBackend|react-dnd-test-backend/i, evidence: "test backend evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|dnd-traces|drag-traces|screenshot|trace/i, evidence: "artifact upload evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function dragAndDropReadinessPackageSignals(sourceFiles: DragAndDropReadinessSourceFile[]): DragAndDropReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DragAndDropReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@dnd-kit/core", pattern: /["@']@dnd-kit\/core["@']|from ["']@dnd-kit\/core["']/i, evidence: "DnD Kit core package evidence was detected." },
    { signal: "@dnd-kit/sortable", pattern: /["@']@dnd-kit\/sortable["@']|from ["']@dnd-kit\/sortable["']/i, evidence: "DnD Kit sortable package evidence was detected." },
    { signal: "@dnd-kit/utilities", pattern: /["@']@dnd-kit\/utilities["@']|from ["']@dnd-kit\/utilities["']/i, evidence: "DnD Kit utilities package evidence was detected." },
    { signal: "react-dnd", pattern: /["@']react-dnd["@']|from ["']react-dnd["']/i, evidence: "React DnD package evidence was detected." },
    { signal: "react-dnd-html5-backend", pattern: /["@']react-dnd-html5-backend["@']|from ["']react-dnd-html5-backend["']/i, evidence: "React DnD HTML5 backend package evidence was detected." },
    { signal: "react-dnd-touch-backend", pattern: /["@']react-dnd-touch-backend["@']|from ["']react-dnd-touch-backend["']/i, evidence: "React DnD touch backend package evidence was detected." },
    { signal: "react-dnd-test-backend", pattern: /["@']react-dnd-test-backend["@']|from ["']react-dnd-test-backend["']/i, evidence: "React DnD test backend package evidence was detected." },
    { signal: "sortablejs", pattern: /["@']sortablejs["@']|from ["']sortablejs["']/i, evidence: "SortableJS package evidence was detected." }
  ];
  return dragAndDropReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dragAndDropReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DragAndDropReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/drag-and-drop-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildRichTextEditorReadinessReport(walk: WalkResult): Promise<RichTextEditorReadinessReport> {
  const sourceFiles = await richTextEditorReadinessSourceFiles(walk);
  const richTextEditorSetups = richTextEditorReadinessSetups(sourceFiles);
  const frameworkSignals = richTextEditorReadinessFrameworkSignals(sourceFiles);
  const schemaSignals = richTextEditorReadinessSchemaSignals(sourceFiles);
  const renderSignals = richTextEditorReadinessRenderSignals(sourceFiles);
  const commandSignals = richTextEditorReadinessCommandSignals(sourceFiles);
  const stateSignals = richTextEditorReadinessStateSignals(sourceFiles);
  const extensionSignals = richTextEditorReadinessExtensionSignals(sourceFiles);
  const collaborationSignals = richTextEditorReadinessCollaborationSignals(sourceFiles);
  const accessibilitySignals = richTextEditorReadinessAccessibilitySignals(sourceFiles);
  const testSignals = richTextEditorReadinessTestSignals(sourceFiles);
  const lexicalSignals = richTextEditorReadinessLexicalSignals(sourceFiles);
  const packageSignals = richTextEditorReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasRender = renderSignals.some((item) => item.readiness === "ready") || richTextEditorSetups.some((item) => item.renderCount > 0);
  const hasSchema = schemaSignals.some((item) => item.readiness === "ready") || richTextEditorSetups.some((item) => item.schemaCount > 0);
  const hasCommands = commandSignals.some((item) => item.readiness === "ready") || richTextEditorSetups.some((item) => item.commandCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || richTextEditorSetups.some((item) => item.stateCount > 0);
  const hasAccessibility = accessibilitySignals.some((item) => item.readiness === "ready") || richTextEditorSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || richTextEditorSetups.some((item) => item.testCount > 0);

  const riskQueue: RichTextEditorReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasRender) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a rich text editor boundary such as Tiptap, ProseMirror, Lexical, contenteditable, or a custom adapter.",
      why: "Rich text editor readiness starts with a visible editor mount, document model, or editable DOM boundary learners can inspect.",
      relatedHref: "html/rich-text-editor-readiness.html"
    });
  }
  if (hasRender && !hasSchema) {
    riskQueue.push({
      priority: "medium",
      action: "Trace the document schema, node, mark, extension, or custom node registration for the editor.",
      why: "Rendering an editor is not enough to explain which document shapes and formatting features it accepts.",
      relatedHref: "html/rich-text-editor-readiness.html"
    });
  }
  if (hasRender && !hasCommands) {
    riskQueue.push({
      priority: "high",
      action: "Document command, toolbar, keyboard shortcut, input-rule, or dispatch paths for formatting changes.",
      why: "Learners need to see how bold, link, list, undo/redo, and insert actions flow into editor state.",
      relatedHref: "html/rich-text-editor-readiness.html"
    });
  }
  if (hasRender && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Add editor state, transaction, onChange, selection, JSON, or HTML serialization evidence.",
      why: "Rich text editors are state machines around structured documents, so state and serialization boundaries must be visible.",
      relatedHref: "html/rich-text-editor-readiness.html"
    });
  }
  if (hasRender && !hasAccessibility) {
    riskQueue.push({
      priority: "medium",
      action: "Add role=textbox, aria-label, placeholder, focus, and keyboard evidence near the editable surface.",
      why: "Rich text editing can become inaccessible unless editable focus and keyboard semantics are explicit.",
      relatedHref: "html/rich-text-editor-readiness.html"
    });
  }
  if (hasRender && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add deterministic tests for keyboard formatting, input events, serialization, toolbar commands, or editor-state snapshots.",
      why: "Editor regressions usually surface in command/state transitions and need tests that do not rely only on manual typing.",
      relatedHref: "html/rich-text-editor-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live editor behavior with trusted local browser or original project tests outside RepoTutor.",
    why: "RepoTutor records rich text editor readiness only; it does not mount Tiptap, ProseMirror, Lexical, or contenteditable editors, dispatch keyboard/input/composition events, mutate documents, execute commands, sync Yjs state, serialize live documents, or run analyzed project tests.",
    relatedHref: "html/rich-text-editor-readiness.html"
  });

  return {
    summary: `Tiptap/ProseMirror/Lexical-style rich text editor readiness report: setup ${richTextEditorSetups.length}개, framework signal ${frameworkSignals.length}개, command signal ${commandSignals.length}개, Lexical signal ${lexicalSignals.length}개, test signal ${testSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Rich text editor readiness Tiptap useEditor EditorContent ProseMirror EditorState EditorView LexicalComposer RichTextPlugin ContentEditable initialConfig namespace theme nodes onError PlainTextPlugin HistoryPlugin OnChangePlugin AutoFocusPlugin LexicalErrorBoundary editor.update editor.read registerCommand createCommand COMMAND_PRIORITY $getRoot $getSelection $isRangeSelection $createTextNode $generateHtmlFromNodes MarkdownShortcutPlugin ListPlugin LinkPlugin TablePlugin CollaborationPlugin Yjs mergeRegister createEditor commands keyboard tests",
    richTextEditorSetups,
    frameworkSignals,
    schemaSignals,
    renderSignals,
    commandSignals,
    stateSignals,
    extensionSignals,
    collaborationSignals,
    accessibilitySignals,
    testSignals,
    lexicalSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"useEditor|EditorContent|BubbleMenu|FloatingMenu|StarterKit|\\.chain\\(\\)|editor\\.commands\" src app packages test", purpose: "Find Tiptap editor mounts, menus, starter kit/extensions, chains, and command calls." },
      { command: "rg \"EditorState|EditorView|Schema|DOMParser|DOMSerializer|Plugin|keymap|inputRules|history\" src app packages test", purpose: "Find ProseMirror state, view, schema, parser/serializer, plugins, keymaps, input rules, and history." },
      { command: "rg \"LexicalComposer|initialConfig|namespace|theme|nodes|onError|RichTextPlugin|PlainTextPlugin|ContentEditable|LexicalErrorBoundary|HistoryPlugin|OnChangePlugin\" src app packages test", purpose: "Find Lexical composer setup, editor config, editable surfaces, error boundary, history, and change plugins." },
      { command: "rg \"editor\\.update|editor\\.read|editor\\.getEditorState|editor\\.parseEditorState|registerCommand|dispatchCommand|createCommand|COMMAND_PRIORITY|FORMAT_TEXT_COMMAND|FORMAT_ELEMENT_COMMAND|SELECTION_CHANGE_COMMAND\" src app packages test", purpose: "Find Lexical state reads/writes, serialization, command registration, dispatch paths, command priorities, formatting commands, and selection commands." },
      { command: "rg \"TextNode|ElementNode|DecoratorNode|ParagraphNode|LineBreakNode|\\$getRoot|\\$getSelection|\\$isRangeSelection|\\$createTextNode|\\$generateHtmlFromNodes|\\$generateNodesFromDOM|MarkdownShortcutPlugin|ListPlugin|LinkPlugin|TablePlugin|CollaborationPlugin|Yjs|mergeRegister|createEditor\" src app packages test", purpose: "Find Lexical node model, selection APIs, HTML/Markdown conversion, plugin ecosystem, collaboration bindings, cleanup registration, and vanilla editor creation." },
      { command: "rg \"role=.*textbox|aria-label|placeholder|keyboard|userEvent\\.keyboard|fireEvent\\.input|execCommand\" src app packages test", purpose: "Review accessibility, keyboard, and deterministic input test evidence." },
      { command: "rg \"Collaboration|awareness|Y\\.Doc|yjs|provider\" src app packages test", purpose: "Check collaboration and CRDT readiness around editor document state." },
      { command: "pnpm test", purpose: "Run trusted local tests that cover editor commands, state transitions, serialization, and accessibility flows." }
    ],
    learnerNextSteps: [
      "먼저 Tiptap, ProseMirror, Lexical, contenteditable 중 어떤 editor boundary가 있는지 찾으세요.",
      "EditorContent, EditorView, RichTextPlugin, ContentEditable 같은 render surface부터 읽으면 실제 편집 영역이 보입니다.",
      "Schema, StarterKit, nodes, marks, Node.create, Mark.create, DecoratorNode는 문서 모델과 확장 가능 범위를 설명합니다.",
      "editor.chain, editor.commands, dispatchCommand, keymap, inputRules는 사용자의 toolbar/keyboard 액션이 상태로 들어가는 경로입니다.",
      "EditorState, Transaction, editor.update, selection, getJSON, getHTML, onChange는 저장/동기화/검증 경계를 설명합니다.",
      "Lexical은 initialConfig, namespace, theme, nodes, onError에서 editor boundary가 정해지고, editor.update/read, registerCommand/dispatchCommand, node/selection/plugin 신호가 핵심 학습 경로입니다.",
      "Collaboration, awareness, Y.Doc, provider 신호는 다중 사용자 문서 동기화와 충돌 가능성을 설명합니다.",
      "이 리포트는 정적 readiness입니다. 실제 typing, composition, selection, clipboard, undo/redo, collaboration sync는 원본 프로젝트 테스트나 수동 검증에서 확인하세요."
    ]
  };
}

type RichTextEditorReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function richTextEditorReadinessSourceFiles(walk: WalkResult): Promise<RichTextEditorReadinessSourceFile[]> {
  const files: RichTextEditorReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !richTextEditorReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!richTextEditorReadinessPathSignal(file.relPath) && !richTextEditorReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function richTextEditorReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return richTextEditorReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|css|scss|sass|less|json|md|mdx|ya?ml)$/i.test(filePath);
}

function richTextEditorReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(editor|rich[-_ ]?text|contenteditable|tiptap|prosemirror|lexical|composer|toolbar|format|document|collab|collaboration|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function richTextEditorReadinessContentSignal(text: string): boolean {
  return /(useEditor|EditorContent|BubbleMenu|FloatingMenu|StarterKit|@tiptap\/|EditorState|EditorView|prosemirror-|DOMParser\.fromSchema|DOMSerializer\.fromSchema|keymap|inputRules|LexicalComposer|LexicalNestedComposer|RichTextPlugin|PlainTextPlugin|ContentEditable|LexicalErrorBoundary|useLexicalComposerContext|initialConfig|FORMAT_TEXT_COMMAND|FORMAT_ELEMENT_COMMAND|SELECTION_CHANGE_COMMAND|editor\.dispatchCommand|editor\.registerCommand|editor\.update|editor\.read|\$getRoot|\$getSelection|\$isRangeSelection|\$createTextNode|\$generateHtmlFromNodes|MarkdownShortcutPlugin|ListPlugin|LinkPlugin|TablePlugin|CollaborationPlugin|mergeRegister|createEditor|contenteditable|execCommand|Y\.Doc|Yjs|Collaboration|awareness)/i.test(text);
}

function richTextEditorReadinessSetups(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["richTextEditorSetups"] {
  const rows: RichTextEditorReadinessReport["richTextEditorSetups"] = [];
  for (const source of sourceFiles) {
    const schemaCount = countMatches(source.text, /(StarterKit|new\s+Schema|schema\s*=|Schema\(|Node\.create|Mark\.create|TextNode|ElementNode|DecoratorNode|ParagraphNode|LineBreakNode|RootNode|nodes\s*:|marks\s*:|initialConfig)/gi);
    const renderCount = countMatches(source.text, /(EditorContent|EditorView|ContentEditable|contenteditable|RichTextPlugin|PlainTextPlugin|BubbleMenu|FloatingMenu|LexicalComposer|LexicalNestedComposer)/gi);
    const commandCount = countMatches(source.text, /(chain\s*\(|editor\.commands|dispatchCommand|FORMAT_TEXT_COMMAND|FORMAT_ELEMENT_COMMAND|SELECTION_CHANGE_COMMAND|KEY_ENTER_COMMAND|COMMAND_PRIORITY|createCommand|registerCommand|keymap\s*\(|inputRules\s*\(|execCommand|toggleBold|setLink|undo|redo)/gi);
    const stateCount = countMatches(source.text, /(EditorState|Transaction|dispatchTransaction|updateState|editor\.update|editor\.read|editor\.getEditorState|parseEditorState|registerUpdateListener|registerTextContentListener|OnChangePlugin|onChange|onUpdate|\$getSelection|\$getRoot|\$isRangeSelection|getJSON|getHTML|toJSON|selection|SerializedEditorState)/gi);
    const extensionCount = countMatches(source.text, /(extensions\s*:|Extension\.create|Node\.create|Mark\.create|Plugin\s*\(|new\s+Plugin|history\s*\(|Placeholder|Link\.configure|exampleSetup|HistoryPlugin|MarkdownShortcutPlugin|ListPlugin|LinkPlugin|TablePlugin|mergeRegister)/gi);
    const collaborationCount = countMatches(source.text, /(Collaboration|CollaborationPlugin|awareness|Y\.Doc|Yjs|yjs|provider|collab|collaboration)/gi);
    const accessibilityCount = countMatches(source.text, /(role\s*=\s*["']textbox|role:\s*["']textbox|aria-label|placeholder|AutoFocusPlugin|focus\s*\(|keyboard|userEvent\.keyboard|LexicalErrorBoundary)/gi);
    const testCount = countMatches(source.text, /(vitest|playwright|cypress|describe\s*\(|it\s*\(|expect\s*\(|testing-library|userEvent\.keyboard|fireEvent\.input|execCommand|upload-artifact|rich-text-editor-traces)/gi);
    const hasSetupSignal = schemaCount + renderCount + commandCount + stateCount + extensionCount + collaborationCount + accessibilityCount + testCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: richTextEditorReadinessPlatform(source),
      schemaCount,
      renderCount,
      commandCount,
      stateCount,
      extensionCount,
      collaborationCount,
      accessibilityCount,
      testCount,
      readiness: renderCount > 0 && stateCount > 0 && (commandCount + schemaCount + extensionCount > 0) && (accessibilityCount + testCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains schema ${schemaCount}, render ${renderCount}, commands ${commandCount}, state ${stateCount}, extensions ${extensionCount}, collaboration ${collaborationCount}, accessibility ${accessibilityCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function richTextEditorReadinessPlatform(source: RichTextEditorReadinessSourceFile): RichTextEditorReadinessReport["richTextEditorSetups"][number]["platform"] {
  if (/@tiptap\/|useEditor|EditorContent|StarterKit|BubbleMenu|FloatingMenu/i.test(source.text)) return "tiptap";
  if (/LexicalComposer|RichTextPlugin|@lexical\/|FORMAT_TEXT_COMMAND|useLexicalComposerContext|editor\.dispatchCommand/i.test(source.text)) return "lexical";
  if (/prosemirror-|EditorState|EditorView|DOMParser\.fromSchema|DOMSerializer\.fromSchema|new\s+Schema|exampleSetup/i.test(source.text)) return "prosemirror";
  if (/contenteditable|execCommand/i.test(source.text)) return "contenteditable";
  if (/rich[-_ ]?text|editor|format/i.test(source.text) || richTextEditorReadinessPathSignal(source.filePath)) return "custom";
  return "unknown";
}

function richTextEditorReadinessFrameworkSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tiptap", pattern: /@tiptap\/|useEditor|EditorContent|StarterKit/i, evidence: "Tiptap evidence was detected." },
    { signal: "prosemirror", pattern: /prosemirror-|EditorState|EditorView|DOMParser\.fromSchema|new\s+Schema/i, evidence: "ProseMirror evidence was detected." },
    { signal: "lexical", pattern: /@lexical\/|LexicalComposer|RichTextPlugin|FORMAT_TEXT_COMMAND/i, evidence: "Lexical evidence was detected." },
    { signal: "contenteditable", pattern: /contenteditable|ContentEditable|execCommand/i, evidence: "contenteditable evidence was detected." },
    { signal: "custom", pattern: /rich[-_ ]?text|editor|toolbar|format/i, evidence: "custom editor evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function richTextEditorReadinessSchemaSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "starter-kit", pattern: /StarterKit/i, evidence: "StarterKit evidence was detected." },
    { signal: "schema", pattern: /new\s+Schema|schema\s*=|Schema\(|schema\s+as\s+basicSchema/i, evidence: "schema evidence was detected." },
    { signal: "node", pattern: /Node\.create|ElementNode|TextNode|\bnodes\s*:/i, evidence: "node evidence was detected." },
    { signal: "mark", pattern: /Mark\.create|\bmarks\s*:|toggleBold|toggleItalic|toggleStrike/i, evidence: "mark evidence was detected." },
    { signal: "nodes", pattern: /\bnodes\s*:|TextNode|ElementNode|DecoratorNode/i, evidence: "node registry evidence was detected." },
    { signal: "decorator-node", pattern: /DecoratorNode/i, evidence: "DecoratorNode evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function richTextEditorReadinessRenderSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["renderSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["renderSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "editor-content", pattern: /EditorContent/i, evidence: "EditorContent evidence was detected." },
    { signal: "editor-view", pattern: /EditorView/i, evidence: "EditorView evidence was detected." },
    { signal: "contenteditable", pattern: /ContentEditable|contenteditable/i, evidence: "contenteditable evidence was detected." },
    { signal: "rich-text-plugin", pattern: /RichTextPlugin/i, evidence: "RichTextPlugin evidence was detected." },
    { signal: "bubble-menu", pattern: /BubbleMenu/i, evidence: "BubbleMenu evidence was detected." },
    { signal: "floating-menu", pattern: /FloatingMenu/i, evidence: "FloatingMenu evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "render", "signal");
}

function richTextEditorReadinessCommandSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["commandSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["commandSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chain", pattern: /\.chain\s*\(|chain\s*\(\)/i, evidence: "chain command evidence was detected." },
    { signal: "commands", pattern: /editor\.commands|commands\s*:/i, evidence: "editor command evidence was detected." },
    { signal: "dispatch-command", pattern: /dispatchCommand|registerCommand|createCommand/i, evidence: "dispatch command evidence was detected." },
    { signal: "format-text", pattern: /FORMAT_TEXT_COMMAND|toggleBold|toggleItalic|toggleStrike|formatBold/i, evidence: "format text command evidence was detected." },
    { signal: "keymap", pattern: /keymap\s*\(|prosemirror-keymap/i, evidence: "keymap evidence was detected." },
    { signal: "input-rule", pattern: /inputRules\s*\(|prosemirror-inputrules/i, evidence: "input rule evidence was detected." },
    { signal: "exec-command", pattern: /execCommand/i, evidence: "execCommand evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "command", "signal");
}

function richTextEditorReadinessStateSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["stateSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "editor-state", pattern: /EditorState|useEditorState|editorState/i, evidence: "editor state evidence was detected." },
    { signal: "transaction", pattern: /Transaction|dispatchTransaction|\.apply\s*\(|updateState/i, evidence: "transaction evidence was detected." },
    { signal: "update", pattern: /editor\.update|onUpdate|updateState/i, evidence: "update evidence was detected." },
    { signal: "selection", pattern: /\$getSelection|selection/i, evidence: "selection evidence was detected." },
    { signal: "json-html", pattern: /getJSON|getHTML|toJSON|serializeFragment|DOMSerializer/i, evidence: "JSON/HTML serialization evidence was detected." },
    { signal: "on-change", pattern: /OnChangePlugin|onChange/i, evidence: "onChange evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function richTextEditorReadinessExtensionSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["extensionSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["extensionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "extension-create", pattern: /Extension\.create|extensions\s*:/i, evidence: "extension registration evidence was detected." },
    { signal: "node-create", pattern: /Node\.create/i, evidence: "Node.create evidence was detected." },
    { signal: "mark-create", pattern: /Mark\.create/i, evidence: "Mark.create evidence was detected." },
    { signal: "plugin", pattern: /new\s+Plugin|Plugin\s*\(|plugins\s*:/i, evidence: "plugin evidence was detected." },
    { signal: "history", pattern: /history\s*\(|HistoryPlugin|prosemirror-history/i, evidence: "history evidence was detected." },
    { signal: "placeholder", pattern: /Placeholder|placeholder/i, evidence: "placeholder evidence was detected." },
    { signal: "link", pattern: /Link\.configure|setLink|extension-link/i, evidence: "link extension evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "extension", "signal");
}

function richTextEditorReadinessCollaborationSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["collaborationSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["collaborationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "collaboration", pattern: /Collaboration|collaboration/i, evidence: "collaboration evidence was detected." },
    { signal: "awareness", pattern: /awareness/i, evidence: "awareness evidence was detected." },
    { signal: "yjs", pattern: /Y\.Doc|from ["']yjs["']|["']yjs["']/i, evidence: "Yjs evidence was detected." },
    { signal: "provider", pattern: /provider/i, evidence: "collaboration provider evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "collaboration", "signal");
}

function richTextEditorReadinessAccessibilitySignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-textbox", pattern: /role\s*=\s*["']textbox|role:\s*["']textbox|role=["']textbox/i, evidence: "role=textbox evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|ariaLabel/i, evidence: "aria-label evidence was detected." },
    { signal: "keyboard", pattern: /keyboard|userEvent\.keyboard|keymap|keydown|keyDown/i, evidence: "keyboard evidence was detected." },
    { signal: "placeholder", pattern: /placeholder/i, evidence: "placeholder evidence was detected." },
    { signal: "focus", pattern: /focus\s*\(|AutoFocusPlugin|autofocus|autoFocus/i, evidence: "focus evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function richTextEditorReadinessTestSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["testSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /\bvitest\b|describe\s*\(|it\s*\(|expect\s*\(/i, evidence: "Vitest evidence was detected." },
    { signal: "playwright", pattern: /\bplaywright\b|@playwright\/test|npx playwright/i, evidence: "Playwright evidence was detected." },
    { signal: "cypress", pattern: /\bcypress\b|cy\.|cypress\/integration/i, evidence: "Cypress evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library|fireEvent|userEvent/i, evidence: "Testing Library evidence was detected." },
    { signal: "keyboard-test", pattern: /userEvent\.keyboard|fireEvent\.keyDown|keydown|keyDown/i, evidence: "keyboard test evidence was detected." },
    { signal: "input-test", pattern: /fireEvent\.input|inputType|execCommand|contenteditable/i, evidence: "input test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|rich-text-editor-traces|editor-traces|screenshot|trace/i, evidence: "artifact upload evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function richTextEditorReadinessLexicalSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["lexicalSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["lexicalSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "composer", pattern: /LexicalComposer/i, evidence: "LexicalComposer evidence was detected." },
    { signal: "composer-context", pattern: /useLexicalComposerContext|LexicalComposerContext/i, evidence: "Lexical composer context evidence was detected." },
    { signal: "initial-config", pattern: /initialConfig/i, evidence: "initialConfig evidence was detected." },
    { signal: "namespace", pattern: /\bnamespace\s*:/i, evidence: "namespace config evidence was detected." },
    { signal: "theme", pattern: /\btheme\s*:/i, evidence: "theme config evidence was detected." },
    { signal: "nodes-registration", pattern: /\bnodes\s*:|nodes:\s*\[|registerNode/i, evidence: "node registration evidence was detected." },
    { signal: "on-error", pattern: /onError/i, evidence: "onError handler evidence was detected." },
    { signal: "rich-text-plugin", pattern: /RichTextPlugin/i, evidence: "RichTextPlugin evidence was detected." },
    { signal: "plain-text-plugin", pattern: /PlainTextPlugin/i, evidence: "PlainTextPlugin evidence was detected." },
    { signal: "content-editable", pattern: /ContentEditable|contenteditable/i, evidence: "ContentEditable evidence was detected." },
    { signal: "error-boundary", pattern: /LexicalErrorBoundary|ErrorBoundary/i, evidence: "Lexical error boundary evidence was detected." },
    { signal: "history-plugin", pattern: /HistoryPlugin|@lexical\/react\/LexicalHistoryPlugin/i, evidence: "HistoryPlugin evidence was detected." },
    { signal: "on-change-plugin", pattern: /OnChangePlugin|@lexical\/react\/LexicalOnChangePlugin/i, evidence: "OnChangePlugin evidence was detected." },
    { signal: "autofocus-plugin", pattern: /AutoFocusPlugin|@lexical\/react\/LexicalAutoFocusPlugin/i, evidence: "AutoFocusPlugin evidence was detected." },
    { signal: "nested-composer", pattern: /LexicalNestedComposer/i, evidence: "LexicalNestedComposer evidence was detected." },
    { signal: "editor-update", pattern: /editor\.update/i, evidence: "editor.update evidence was detected." },
    { signal: "editor-read", pattern: /editor\.read|editor\.getEditorState\(\)\.read/i, evidence: "editor read evidence was detected." },
    { signal: "editor-state", pattern: /editor\.getEditorState|EditorState|editorState/i, evidence: "editor state evidence was detected." },
    { signal: "parse-editor-state", pattern: /parseEditorState/i, evidence: "parseEditorState evidence was detected." },
    { signal: "serialized-editor-state", pattern: /SerializedEditorState|toJSON\(\)|editorState\.toJSON/i, evidence: "serialized editor state evidence was detected." },
    { signal: "editable-state", pattern: /setEditable|editable\s*:/i, evidence: "editable state evidence was detected." },
    { signal: "dispatch-command", pattern: /dispatchCommand/i, evidence: "dispatchCommand evidence was detected." },
    { signal: "register-command", pattern: /registerCommand/i, evidence: "registerCommand evidence was detected." },
    { signal: "create-command", pattern: /createCommand/i, evidence: "createCommand evidence was detected." },
    { signal: "command-priority", pattern: /COMMAND_PRIORITY/i, evidence: "command priority evidence was detected." },
    { signal: "format-text-command", pattern: /FORMAT_TEXT_COMMAND/i, evidence: "FORMAT_TEXT_COMMAND evidence was detected." },
    { signal: "format-element-command", pattern: /FORMAT_ELEMENT_COMMAND/i, evidence: "FORMAT_ELEMENT_COMMAND evidence was detected." },
    { signal: "key-command", pattern: /KEY_[A-Z_]+_COMMAND|KEY_ENTER_COMMAND/i, evidence: "key command evidence was detected." },
    { signal: "selection-change-command", pattern: /SELECTION_CHANGE_COMMAND/i, evidence: "selection change command evidence was detected." },
    { signal: "update-listener", pattern: /registerUpdateListener/i, evidence: "update listener evidence was detected." },
    { signal: "text-content-listener", pattern: /registerTextContentListener/i, evidence: "text content listener evidence was detected." },
    { signal: "mutation-listener", pattern: /registerMutationListener/i, evidence: "mutation listener evidence was detected." },
    { signal: "root-listener", pattern: /registerRootListener/i, evidence: "root listener evidence was detected." },
    { signal: "decorator-listener", pattern: /registerDecoratorListener/i, evidence: "decorator listener evidence was detected." },
    { signal: "root-node", pattern: /\$getRoot|RootNode/i, evidence: "root node evidence was detected." },
    { signal: "selection-api", pattern: /\$getSelection|\$setSelection/i, evidence: "selection API evidence was detected." },
    { signal: "range-selection", pattern: /\$isRangeSelection|RangeSelection/i, evidence: "range selection evidence was detected." },
    { signal: "node-selection", pattern: /\$isNodeSelection|NodeSelection/i, evidence: "node selection evidence was detected." },
    { signal: "grid-selection", pattern: /GridSelection/i, evidence: "grid selection evidence was detected." },
    { signal: "text-node", pattern: /\$createTextNode|TextNode/i, evidence: "text node evidence was detected." },
    { signal: "element-node", pattern: /\$isElementNode|ElementNode/i, evidence: "element node evidence was detected." },
    { signal: "decorator-node", pattern: /DecoratorNode/i, evidence: "decorator node evidence was detected." },
    { signal: "paragraph-node", pattern: /\$createParagraphNode|ParagraphNode/i, evidence: "paragraph node evidence was detected." },
    { signal: "line-break-node", pattern: /\$createLineBreakNode|LineBreakNode/i, evidence: "line break node evidence was detected." },
    { signal: "html-import-export", pattern: /\$generateHtmlFromNodes|\$generateNodesFromDOM|@lexical\/html/i, evidence: "HTML import/export evidence was detected." },
    { signal: "markdown-shortcut", pattern: /MarkdownShortcutPlugin|@lexical\/markdown/i, evidence: "Markdown shortcut evidence was detected." },
    { signal: "list-plugin", pattern: /ListPlugin|@lexical\/list/i, evidence: "ListPlugin evidence was detected." },
    { signal: "link-plugin", pattern: /LinkPlugin|@lexical\/link/i, evidence: "LinkPlugin evidence was detected." },
    { signal: "check-list-plugin", pattern: /CheckListPlugin|checkList/i, evidence: "CheckListPlugin evidence was detected." },
    { signal: "table-plugin", pattern: /TablePlugin|@lexical\/table/i, evidence: "TablePlugin evidence was detected." },
    { signal: "code-highlight-plugin", pattern: /CodeHighlightPlugin|@lexical\/code/i, evidence: "CodeHighlightPlugin evidence was detected." },
    { signal: "hashtag-plugin", pattern: /HashtagPlugin|@lexical\/hashtag/i, evidence: "HashtagPlugin evidence was detected." },
    { signal: "auto-link-plugin", pattern: /AutoLinkPlugin/i, evidence: "AutoLinkPlugin evidence was detected." },
    { signal: "collaboration-plugin", pattern: /CollaborationPlugin|LexicalCollaborationPlugin/i, evidence: "CollaborationPlugin evidence was detected." },
    { signal: "yjs-collab", pattern: /Y\.Doc|Yjs|@lexical\/yjs|from ["']yjs["']/i, evidence: "Yjs collaboration evidence was detected." },
    { signal: "update-tags", pattern: /\$addUpdateTag|\$hasUpdateTag|HISTORY_PUSH_TAG|PASTE_TAG|SKIP_DOM_SELECTION_TAG|SKIP_SCROLL_INTO_VIEW_TAG|COLLABORATION_TAG/i, evidence: "update tag evidence was detected." },
    { signal: "merge-register", pattern: /mergeRegister/i, evidence: "mergeRegister cleanup evidence was detected." },
    { signal: "create-editor", pattern: /createEditor/i, evidence: "createEditor evidence was detected." },
    { signal: "tree-view", pattern: /TreeView|LexicalTreeView/i, evidence: "TreeView evidence was detected." },
    { signal: "draggable-block", pattern: /DraggableBlockPlugin/i, evidence: "draggable block evidence was detected." },
    { signal: "floating-toolbar", pattern: /FloatingTextFormatToolbarPlugin|ToolbarPlugin/i, evidence: "floating toolbar evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "lexical", "signal");
}

function richTextEditorReadinessPackageSignals(sourceFiles: RichTextEditorReadinessSourceFile[]): RichTextEditorReadinessReport["packageSignals"] {
  const specs: Array<{ signal: RichTextEditorReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@tiptap/react", pattern: /["@']@tiptap\/react["@']|from ["']@tiptap\/react["']/i, evidence: "Tiptap React package evidence was detected." },
    { signal: "@tiptap/starter-kit", pattern: /["@']@tiptap\/starter-kit["@']|from ["']@tiptap\/starter-kit["']/i, evidence: "Tiptap StarterKit package evidence was detected." },
    { signal: "@tiptap/core", pattern: /["@']@tiptap\/core["@']|from ["']@tiptap\/core["']/i, evidence: "Tiptap core package evidence was detected." },
    { signal: "prosemirror-state", pattern: /["@']prosemirror-state["@']|from ["']prosemirror-state["']/i, evidence: "ProseMirror state package evidence was detected." },
    { signal: "prosemirror-view", pattern: /["@']prosemirror-view["@']|from ["']prosemirror-view["']/i, evidence: "ProseMirror view package evidence was detected." },
    { signal: "prosemirror-model", pattern: /["@']prosemirror-model["@']|from ["']prosemirror-model["']/i, evidence: "ProseMirror model package evidence was detected." },
    { signal: "lexical", pattern: /["@']lexical["@']|from ["']lexical["']/i, evidence: "Lexical package evidence was detected." },
    { signal: "@lexical/react", pattern: /["@']@lexical\/react["@']|from ["']@lexical\/react\//i, evidence: "Lexical React package evidence was detected." },
    { signal: "yjs", pattern: /["@']yjs["@']|from ["']yjs["']/i, evidence: "Yjs package evidence was detected." }
  ];
  return richTextEditorReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function richTextEditorReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RichTextEditorReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/rich-text-editor-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
