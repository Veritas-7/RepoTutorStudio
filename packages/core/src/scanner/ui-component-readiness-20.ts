import type { MenuReadinessReport, PresenceReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildPresenceReadinessReport(walk: WalkResult): Promise<PresenceReadinessReport> {
  const sourceFiles = await presenceReadinessSourceFiles(walk);
  const presenceSetups = presenceReadinessSetups(sourceFiles);
  const frameworkSignals = presenceFrameworkSignals(sourceFiles);
  const stateSignals = presenceStateSignals(sourceFiles);
  const lifecycleSignals = presenceLifecycleSignals(sourceFiles);
  const animationSignals = presenceAnimationSignals(sourceFiles);
  const visibilitySignals = presenceVisibilitySignals(sourceFiles);
  const machineSignals = presenceMachineSignals(sourceFiles);
  const contextSignals = presenceContextSignals(sourceFiles);
  const effectSignals = presenceEffectSignals(sourceFiles);
  const actionSignals = presenceActionSignals(sourceFiles);
  const apiSignals = presenceApiSignals(sourceFiles);
  const implementationSignals = presenceImplementationSignals(sourceFiles);
  const testSignals = presenceTestSignals(sourceFiles);
  const packageSignals = presencePackageSignals(sourceFiles);

  const hasState = stateSignals.some((item) => item.readiness === "ready") || presenceSetups.some((item) => item.stateCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || presenceSetups.some((item) => item.mountCount + item.unmountCount > 0);
  const hasAnimation = animationSignals.some((item) => item.readiness === "ready") || presenceSetups.some((item) => item.animationCount > 0);
  const hasVisibility = visibilitySignals.some((item) => item.readiness === "ready") || presenceSetups.some((item) => item.visibilityCount + item.immediateCount > 0);
  const hasApi = apiSignals.some((item) => item.readiness === "ready") || presenceSetups.some((item) => item.apiCount + item.callbackCount > 0);
  const hasCleanup = presenceSetups.some((item) => item.cleanupCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || presenceSetups.some((item) => item.testCount > 0);

  const riskQueue: PresenceReadinessReport["riskQueue"] = [];
  if (!hasState && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Trace mounted, unmountSuspended, unmounted, present, initial, and skip state before claiming presence readiness.",
      why: "Presence readiness starts from the static mount/unmount state model that keeps disappearing DOM nodes reviewable.",
      relatedHref: "html/presence-readiness.html"
    });
  }
  if ((hasState || hasLifecycle) && !hasAnimation) {
    riskQueue.push({
      priority: "high",
      action: "Add animation name, duration, fill-mode, animationstart, animationend, and animationcancel evidence.",
      why: "Zag presence delays unmount around CSS animation state; static reports should show the animation evidence that gates cleanup.",
      relatedHref: "html/presence-readiness.html"
    });
  }
  if ((hasState || hasLifecycle) && !hasVisibility) {
    riskQueue.push({
      priority: "medium",
      action: "Add document.hidden, visibilityState, requestAnimationFrame, immediate, and hidden-skip evidence.",
      why: "Presence can skip animations when the document is hidden or immediate mode is active, so visibility policy should be explicit.",
      relatedHref: "html/presence-readiness.html"
    });
  }
  if ((hasState || hasLifecycle || hasAnimation) && !hasApi) {
    riskQueue.push({
      priority: "medium",
      action: "Add setNode, unmount, present/skip API, and onExitComplete callback evidence.",
      why: "Learners need to see which public API controls DOM node tracking, forced unmount, and exit completion callbacks.",
      relatedHref: "html/presence-readiness.html"
    });
  }
  if ((hasAnimation || hasApi) && !hasCleanup) {
    riskQueue.push({
      priority: "medium",
      action: "Add cleanupNode, cleanupEventListeners, and cleanupStyles evidence.",
      why: "Presence transitions should clean event listeners and animation styles after exit completion.",
      relatedHref: "html/presence-readiness.html"
    });
  }
  if ((hasState || hasLifecycle || hasAnimation || hasVisibility || hasApi) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add animation, visibility, exitcomplete, and artifact tests for presence behavior.",
      why: "Static readiness is stronger when tests preserve animation-end, hidden-document, callback, and artifact coverage.",
      relatedHref: "html/presence-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live mount/unmount timing, animation events, computed styles, document visibility, callbacks, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records presence readiness only; it does not mount or unmount real DOM nodes, wait real animations, dispatch animation events, inspect live computed styles, mutate document visibility, call exit callbacks, or run analyzed project tests.",
    relatedHref: "html/presence-readiness.html"
  });

  return {
    summary: presenceSetups.length > 0
      ? `Presence readiness report: setup ${presenceSetups.length} files, state signal ${stateSignals.length}, lifecycle signal ${lifecycleSignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length}, implementation signal ${implementationSignals.length} were summarized from static analysis.`
      : "No presence readiness source files were detected.",
    sourcePattern: "Presence readiness Zag presence Headless UI Transition mounted unmountSuspended unmounted nesting transition data open closed visibility immediate tests",
    presenceSetups,
    frameworkSignals,
    stateSignals,
    lifecycleSignals,
    animationSignals,
    visibilitySignals,
    machineSignals,
    contextSignals,
    effectSignals,
    actionSignals,
    apiSignals,
    implementationSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/presence|@headlessui/react|presence\\.machine|presence\\.connect|TransitionContext|NestingContext|OpenClosedProvider|transitionDataAttributes|setNode|onExitComplete|data-presence\" package.json src app packages",
        purpose: "Find Zag presence usage, Headless UI Transition internals, machine/connect setup, node tracking, callbacks, and custom presence markers."
      },
      {
        command: "rg \"mounted|unmountSuspended|unmounted|presence\\.changed|cleanupNode|exitcomplete|animationstart|animationend|animationcancel|animationFillMode\" src app packages test",
        purpose: "Inspect mount/unmount state, cleanup, exit completion, and animation lifecycle evidence."
      },
      {
        command: "rg \"document\\.hidden|visibilityState|requestAnimationFrame|immediate|animation-test|visibility-test|exitcomplete-test|presence-traces|upload-artifact\" src app packages test tests .github",
        purpose: "Check visibility skip behavior, immediate mode, presence tests, and CI artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open presence setup links and identify which code owns present, initial, skip, and mounted/unmounted state.",
      "Trace the unmountSuspended path separately from the final unmounted cleanup path.",
      "Review animation evidence around animation names, duration, fill-mode, animationstart, animationend, and animationcancel.",
      "Check whether hidden-document or immediate mode can skip animation waits before exit completion.",
      "For Headless UI Transition, trace nesting registration, open/closed provider state, transition data attributes, and before/after callbacks.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type PresenceReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function presenceReadinessSourceFiles(walk: WalkResult): Promise<PresenceReadinessSourceFile[]> {
  const files: PresenceReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !presenceInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!presencePathSignal(file.relPath) && !presenceContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 200) break;
  }
  return files;
}

function presenceInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return presencePathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function presencePathSignal(filePath: string): boolean {
  return /presence|animation|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function presenceContentSignal(text: string): boolean {
  return /@zag-js\/presence|@headlessui\/react|presence\.machine|presence\.connect|data-presence|presence-traces|onExitComplete|exitcomplete|TransitionContext|NestingContext|OpenClosedProvider|transitionDataAttributes/i.test(text);
}

function presenceReadinessSetups(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["presenceSetups"] {
  const rows: PresenceReadinessReport["presenceSetups"] = [];
  for (const source of sourceFiles) {
    const presentCount = countMatches(source.text, /\bpresent\b|data-presence|present-api|Presence/i);
    const stateCount = countMatches(source.text, /mounted|unmountSuspended|unmount-suspended|unmounted|initial|\bskip\b|data-state/i);
    const mountCount = countMatches(source.text, /\bmount\b|\bmounted\b|mounting|setMounted|data-state=['"]mounted/i);
    const unmountCount = countMatches(source.text, /\bunmount\b|unmountSuspended|unmount-suspended|unmounted|unmountAnimationName/i);
    const animationCount = countMatches(source.text, /animationName|getAnimationName|animationDuration|animationFillMode|animationstart|animationend|animationcancel|animation-start|animation-end|animation-cancel|animation-name|animation-duration|animation-fill-mode|prevAnimationName|unmountAnimationName/i);
    const eventCount = countMatches(source.text, /presence\.changed|animationstart|animationend|animationcancel|exitcomplete|dispatchEvent|CustomEvent|event/i);
    const visibilityCount = countMatches(source.text, /document\.hidden|document-hidden|visibilityState|visibility-state|requestAnimationFrame|request-animation-frame|hidden-skip/i);
    const immediateCount = countMatches(source.text, /\bimmediate\b|hidden-skip/i);
    const callbackCount = countMatches(source.text, /onExitComplete|on-exit-complete|exit-complete|exitcomplete|callback/i);
    const apiCount = countMatches(source.text, /setNode|set-node|api\.present|api\.skip|api\.unmount|present-api|skip-api|\bunmount\(\)/i);
    const cleanupCount = countMatches(source.text, /cleanupNode|cleanup-node|cleanupEventListeners|cleanup-event-listeners|cleanupStyles|cleanup-styles|removeEventListener/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|test\(|@testing-library\/react|userEvent|animation-test|visibility-test|exitcomplete-test|upload-artifact|presence-traces/i);
    const evidenceScore = presentCount + stateCount + mountCount + unmountCount + animationCount + eventCount + visibilityCount + immediateCount + callbackCount + apiCount + cleanupCount + testCount;
    if (evidenceScore === 0 && !presencePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: presenceFramework(source),
      presentCount,
      stateCount,
      mountCount,
      unmountCount,
      animationCount,
      eventCount,
      visibilityCount,
      immediateCount,
      callbackCount,
      apiCount,
      cleanupCount,
      testCount,
      readiness: evidenceScore >= 9 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static presence readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.stateCount + b.mountCount + b.unmountCount + b.animationCount + b.eventCount + b.visibilityCount + b.callbackCount + b.apiCount + b.cleanupCount + b.testCount;
    const aScore = a.stateCount + a.mountCount + a.unmountCount + a.animationCount + a.eventCount + a.visibilityCount + a.callbackCount + a.apiCount + a.cleanupCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function presenceFramework(source: PresenceReadinessSourceFile): PresenceReadinessReport["presenceSetups"][number]["framework"] {
  if (/@zag-js\/presence|presence\.machine|presence\.connect/i.test(source.text)) return "zag-presence";
  if (/@headlessui\/react|TransitionContext|NestingContext|OpenClosedProvider|transitionDataAttributes/i.test(source.text)) return "headless-transition";
  if (/custom presence|data-presence|presence-traces/i.test(source.text)) return "custom-presence";
  return "unknown";
}

function presenceFrameworkSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-presence", pattern: /@zag-js\/presence|presence\.machine|presence\.connect/i, evidence: "Zag presence evidence was detected." },
    { signal: "headless-transition", pattern: /@headlessui\/react|TransitionContext|NestingContext|OpenClosedProvider|transitionDataAttributes/i, evidence: "Headless UI Transition evidence was detected." },
    { signal: "custom-presence", pattern: /custom presence|data-presence|presence-traces/i, evidence: "custom presence evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function presenceStateSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["stateSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mounted", pattern: /\bmounted\b|data-state=['"]mounted/i, evidence: "mounted evidence was detected." },
    { signal: "unmount-suspended", pattern: /unmountSuspended|unmount-suspended/i, evidence: "unmount-suspended evidence was detected." },
    { signal: "unmounted", pattern: /\bunmounted\b|data-state=['"]unmounted/i, evidence: "unmounted evidence was detected." },
    { signal: "present", pattern: /\bpresent\b|present-api/i, evidence: "present evidence was detected." },
    { signal: "initial", pattern: /\binitial\b/i, evidence: "initial evidence was detected." },
    { signal: "skip", pattern: /\bskip\b|skip-api|data-skip/i, evidence: "skip evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function presenceLifecycleSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mount", pattern: /\bmount\b|\bmounted\b|data-state=['"]mounted/i, evidence: "mount evidence was detected." },
    { signal: "unmount", pattern: /\bunmount\b|unmount\(\)|unmounted|unmountSuspended/i, evidence: "unmount evidence was detected." },
    { signal: "presence-changed", pattern: /presence\.changed|presence-changed/i, evidence: "presence changed evidence was detected." },
    { signal: "set-node", pattern: /setNode|set-node/i, evidence: "set node evidence was detected." },
    { signal: "cleanup-node", pattern: /cleanupNode|cleanup-node/i, evidence: "cleanup node evidence was detected." },
    { signal: "exit-complete", pattern: /exitcomplete|exit-complete|onExitComplete/i, evidence: "exit complete evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function presenceAnimationSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["animationSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["animationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "animation-start", pattern: /animationstart|animation-start/i, evidence: "animation start evidence was detected." },
    { signal: "animation-end", pattern: /animationend|animation-end/i, evidence: "animation end evidence was detected." },
    { signal: "animation-cancel", pattern: /animationcancel|animation-cancel/i, evidence: "animation cancel evidence was detected." },
    { signal: "animation-name", pattern: /getAnimationName|animationName|animation-name/i, evidence: "animation name evidence was detected." },
    { signal: "animation-duration", pattern: /animationDuration|animation-duration/i, evidence: "animation duration evidence was detected." },
    { signal: "animation-fill-mode", pattern: /animationFillMode|animation-fill-mode|\bforwards\b/i, evidence: "animation fill-mode evidence was detected." },
    { signal: "prev-animation-name", pattern: /prevAnimationName|prev-animation-name/i, evidence: "previous animation name evidence was detected." },
    { signal: "unmount-animation-name", pattern: /unmountAnimationName|unmount-animation-name/i, evidence: "unmount animation name evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "animation", "signal");
}

function presenceVisibilitySignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["visibilitySignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["visibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "document-hidden", pattern: /document\.hidden|document-hidden/i, evidence: "document hidden evidence was detected." },
    { signal: "visibility-state", pattern: /visibilityState|visibility-state/i, evidence: "visibility state evidence was detected." },
    { signal: "request-animation-frame", pattern: /requestAnimationFrame|request-animation-frame/i, evidence: "requestAnimationFrame evidence was detected." },
    { signal: "immediate", pattern: /\bimmediate\b/i, evidence: "immediate evidence was detected." },
    { signal: "hidden-skip", pattern: /hidden-skip|document\.hidden.*skip|skip.*document\.hidden/i, evidence: "hidden skip evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "visibility", "signal");
}

function presenceMachineSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["machineSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<PresenceSchema>|createMachine\s+PresenceSchema/i, evidence: "createMachine PresenceSchema evidence was detected." },
    { signal: "default-props", pattern: /props[\s\S]{0,120}present[\s\S]{0,80}(!!|boolean)|props\s+present\s+boolean/i, evidence: "default present prop evidence was detected." },
    { signal: "initial-state", pattern: /initialState[\s\S]{0,120}mounted[\s\S]{0,120}unmounted|initialState\s+mounted\s+unmounted/i, evidence: "initial state evidence was detected." },
    { signal: "refs", pattern: /refs[\s\S]{0,100}node[\s\S]{0,100}styles|refs\s+node\s+styles/i, evidence: "node/styles refs evidence was detected." },
    { signal: "bindable-context", pattern: /unmountAnimationName[\s\S]{0,140}bindable[\s\S]{0,220}prevAnimationName[\s\S]{0,140}bindable[\s\S]{0,220}present[\s\S]{0,140}bindable[\s\S]{0,180}initial[\s\S]{0,140}bindable|context\s+unmountAnimationName\s+bindable[\s\S]{0,180}initial\s+bindable/i, evidence: "bindable context evidence was detected." },
    { signal: "exit-cleanup", pattern: /exit[\s\S]{0,80}cleanupNode|exit\s+cleanupNode/i, evidence: "exit cleanup evidence was detected." },
    { signal: "watch-present", pattern: /watch[\s\S]{0,160}present[\s\S]{0,160}PRESENCE\.CHANGED|watch\s+present\s+PRESENCE\.CHANGED/i, evidence: "present watch evidence was detected." },
    { signal: "node-presence-events", pattern: /NODE\.SET[\s\S]{0,140}PRESENCE\.CHANGED|NODE\.SET[\s\S]{0,220}MOUNT|PRESENCE\.CHANGED/i, evidence: "node and presence event evidence was detected." },
    { signal: "state-transitions", pattern: /MOUNT[\s\S]{0,120}UNMOUNT[\s\S]{0,120}UNMOUNT\.SUSPEND|mounted[\s\S]{0,120}unmountSuspended[\s\S]{0,120}unmounted/i, evidence: "state transition evidence was detected." },
    { signal: "track-animation-effect", pattern: /effects[\s\S]{0,100}trackAnimationEvents|effects\s+trackAnimationEvents/i, evidence: "trackAnimationEvents effect evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function presenceContextSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["contextSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "unmount-animation-name", pattern: /unmountAnimationName[\s\S]{0,100}bindable|unmount-animation-name/i, evidence: "unmountAnimationName context evidence was detected." },
    { signal: "prev-animation-name", pattern: /prevAnimationName[\s\S]{0,100}bindable|prev-animation-name/i, evidence: "prevAnimationName context evidence was detected." },
    { signal: "present-context", pattern: /present[\s\S]{0,100}bindable|present\s+bindable/i, evidence: "present bindable context evidence was detected." },
    { signal: "initial-context", pattern: /initial[\s\S]{0,120}bindable[\s\S]{0,80}sync[\s\S]{0,80}true|initial\s+bindable\s+sync\s+true/i, evidence: "initial bindable context evidence was detected." },
    { signal: "node-ref", pattern: /node\s+ref|refs[\s\S]{0,100}node/i, evidence: "node ref evidence was detected." },
    { signal: "styles-ref", pattern: /styles\s+ref|refs[\s\S]{0,120}styles/i, evidence: "styles ref evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function presenceEffectSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["effectSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-animation-events", pattern: /trackAnimationEvents/i, evidence: "trackAnimationEvents effect evidence was detected." },
    { signal: "animation-start-listener", pattern: /animationstart|animation-start/i, evidence: "animationstart listener evidence was detected." },
    { signal: "animation-end-listener", pattern: /animationend|animation-end/i, evidence: "animationend listener evidence was detected." },
    { signal: "animation-cancel-listener", pattern: /animationcancel|animation-cancel/i, evidence: "animationcancel listener evidence was detected." },
    { signal: "animation-fill-mode", pattern: /animationFillMode[\s\S]{0,80}forwards|animation-fill-mode|\bforwards\b/i, evidence: "animation fill-mode evidence was detected." },
    { signal: "cleanup-listeners", pattern: /removeEventListener[\s\S]{0,220}animationstart[\s\S]{0,220}removeEventListener[\s\S]{0,220}animationcancel[\s\S]{0,220}removeEventListener[\s\S]{0,220}animationend|removeEventListener/i, evidence: "cleanup listener evidence was detected." },
    { signal: "next-tick-cleanup", pattern: /nextTick[\s\S]{0,120}cleanupStyles|nextTick\s+cleanupStyles/i, evidence: "nextTick cleanup evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function presenceActionSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["actionSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-initial", pattern: /setInitial[\s\S]{0,160}queueMicrotask|setInitial\s+queueMicrotask/i, evidence: "setInitial action evidence was detected." },
    { signal: "invoke-exit-complete", pattern: /invokeOnExitComplete[\s\S]{0,180}(onExitComplete|CustomEvent|exitcomplete|dispatchEvent)|invokeOnExitComplete\s+onExitComplete\s+CustomEvent\s+exitcomplete\s+dispatchEvent/i, evidence: "invokeOnExitComplete action evidence was detected." },
    { signal: "setup-node", pattern: /setupNode[\s\S]{0,140}getComputedStyle|setupNode\s+getComputedStyle/i, evidence: "setupNode action evidence was detected." },
    { signal: "cleanup-node", pattern: /cleanupNode/i, evidence: "cleanupNode action evidence was detected." },
    { signal: "sync-presence", pattern: /syncPresence[\s\S]{0,220}(visibilityState|hidden|raf|animationDuration|UNMOUNT\.SUSPEND)|syncPresence\s+ownerDocument\s+visibilityState\s+hidden\s+raf\s+animationDuration/i, evidence: "syncPresence action evidence was detected." },
    { signal: "set-prev-animation-name", pattern: /setPrevAnimationName/i, evidence: "setPrevAnimationName action evidence was detected." },
    { signal: "clear-prev-animation-name", pattern: /clearPrevAnimationName/i, evidence: "clearPrevAnimationName action evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function presenceApiSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["apiSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-node", pattern: /setNode|set-node/i, evidence: "set node API evidence was detected." },
    { signal: "unmount", pattern: /api\.unmount|unmount\(\)|\bunmount\b/i, evidence: "unmount API evidence was detected." },
    { signal: "present-api", pattern: /api\.present|present-api/i, evidence: "present API evidence was detected." },
    { signal: "skip-api", pattern: /api\.skip|skip-api/i, evidence: "skip API evidence was detected." },
    { signal: "on-exit-complete", pattern: /onExitComplete|on-exit-complete/i, evidence: "onExitComplete evidence was detected." },
    { signal: "node-null-guard", pattern: /if\s*\(!node\)\s*return|if !node return/i, evidence: "setNode null guard evidence was detected." },
    { signal: "node-set-event", pattern: /NODE\.SET|send\(\{\s*type:\s*["']NODE\.SET["']/i, evidence: "NODE.SET API event evidence was detected." },
    { signal: "unmount-event", pattern: /UNMOUNT|send\(\{\s*type:\s*["']UNMOUNT["']/i, evidence: "UNMOUNT API event evidence was detected." },
    { signal: "state-matches-present", pattern: /state\.matches\(["']mounted["'][\s\S]{0,80}["']unmountSuspended["']\)|state matches mounted unmountSuspended/i, evidence: "state.matches present evidence was detected." },
    { signal: "initial-skip", pattern: /!\s*context\.get\(["']initial["']\)|context initial|skip:\s*!context/i, evidence: "initial skip API evidence was detected." },
    { signal: "props-create-props", pattern: /createProps<PresenceProps>|props-create-props/i, evidence: "Presence props createProps API evidence was detected." },
    { signal: "present-prop", pattern: /present\?:\s*boolean|present-prop/i, evidence: "present prop API evidence was detected." },
    { signal: "on-exit-complete-prop", pattern: /onExitComplete\?:\s*VoidFunction|on-exit-complete-prop/i, evidence: "onExitComplete prop API evidence was detected." },
    { signal: "immediate-prop", pattern: /immediate\?:\s*boolean|immediate-prop/i, evidence: "immediate prop API evidence was detected." },
    { signal: "presence-api-interface", pattern: /interface\s+PresenceApi|presence-api-interface/i, evidence: "PresenceApi interface evidence was detected." },
    { signal: "skip-boolean", pattern: /skip:\s*boolean|skip-boolean/i, evidence: "skip boolean API evidence was detected." },
    { signal: "present-boolean", pattern: /present:\s*boolean|present-boolean/i, evidence: "present boolean API evidence was detected." },
    { signal: "set-node-nullable", pattern: /setNode:\s*\(node:\s*HTMLElement\s*\|\s*null\)\s*=>\s*void|set-node-nullable/i, evidence: "nullable setNode API evidence was detected." },
    { signal: "unmount-void-api", pattern: /unmount:\s*VoidFunction|unmount-void-api/i, evidence: "unmount VoidFunction API evidence was detected." },
    { signal: "presence-service-type", pattern: /PresenceService\s*=\s*Service<PresenceSchema>|presence-service-type/i, evidence: "PresenceService type evidence was detected." },
    { signal: "presence-machine-type", pattern: /PresenceMachine\s*=\s*Machine<PresenceSchema>|presence-machine-type/i, evidence: "PresenceMachine type evidence was detected." },
    { signal: "present-coerce-boolean", pattern: /present:\s*!!props\.present|present-coerce-boolean/i, evidence: "present boolean coercion API evidence was detected." },
    { signal: "initial-state-present-prop", pattern: /initialState[\s\S]{0,100}prop\(["']present["']\)|initial-state-present-prop/i, evidence: "initial state present prop evidence was detected." },
    { signal: "exitcomplete-bubbles-false", pattern: /CustomEvent\(["']exitcomplete["'],\s*\{\s*bubbles:\s*false\s*\}\)|exitcomplete-bubbles-false/i, evidence: "exitcomplete non-bubbling event evidence was detected." },
    { signal: "node-dispatch-event", pattern: /node\.dispatchEvent\(event\)|node-dispatch-event/i, evidence: "node dispatchEvent API evidence was detected." },
    { signal: "same-node-guard", pattern: /refs\.get\(["']node["']\)\s*===\s*event\.node|same-node-guard/i, evidence: "same node guard evidence was detected." },
    { signal: "computed-style-cache", pattern: /refs\.set\(["']styles["'],\s*getComputedStyle\(event\.node\)\)|computed-style-cache/i, evidence: "computed style cache evidence was detected." },
    { signal: "visibility-hidden-unmount", pattern: /visibilityState\s*===\s*["']hidden["']|visibility-hidden-unmount/i, evidence: "visibility hidden unmount evidence was detected." },
    { signal: "raf-presence-check", pattern: /raf\(\(\)\s*=>[\s\S]{0,140}prop\(["']present["']\)|raf-presence-check/i, evidence: "raf present recheck evidence was detected." },
    { signal: "animation-name-none", pattern: /animationName\s*===\s*["']none["']|animation-name-none/i, evidence: "animation name none unmount evidence was detected." },
    { signal: "display-none-unmount", pattern: /display\s*===\s*["']none["']|display-none-unmount/i, evidence: "display none unmount evidence was detected." },
    { signal: "zero-duration-unmount", pattern: /animationDuration\s*===\s*["']0s["']|zero-duration-unmount/i, evidence: "zero duration unmount evidence was detected." },
    { signal: "unmount-suspend-event", pattern: /UNMOUNT\.SUSPEND|unmount-suspend-event/i, evidence: "UNMOUNT.SUSPEND evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function presenceImplementationSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["implementationSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["implementationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "transition-context", pattern: /TransitionContext/i, evidence: "Headless UI TransitionContext evidence was detected." },
    { signal: "nesting-context", pattern: /NestingContext/i, evidence: "Headless UI NestingContext evidence was detected." },
    { signal: "tree-states", pattern: /TreeStates[\s\S]{0,120}Visible[\s\S]{0,120}Hidden|TreeStates\s+Visible\s+Hidden/i, evidence: "TreeStates visible/hidden evidence was detected." },
    { signal: "should-forward-ref", pattern: /shouldForwardRef/i, evidence: "shouldForwardRef fragment/ref strategy evidence was detected." },
    { signal: "register-unregister", pattern: /register[\s\S]{0,140}unregister|unregister[\s\S]{0,140}register/i, evidence: "transition child register/unregister evidence was detected." },
    { signal: "has-children", pattern: /hasChildren/i, evidence: "hasChildren nesting evidence was detected." },
    { signal: "render-strategy-unmount-hidden", pattern: /RenderStrategy[\s\S]{0,140}Unmount[\s\S]{0,140}Hidden|RenderStrategy\s+Unmount\s+Hidden/i, evidence: "RenderStrategy Unmount/Hidden evidence was detected." },
    { signal: "transition-chains", pattern: /chains|transitionableChildren/i, evidence: "transition child chain evidence was detected." },
    { signal: "wait-promises", pattern: /\bwait\b[\s\S]{0,120}Promise|Promise[\s\S]{0,120}\bwait\b/i, evidence: "wait promise evidence was detected." },
    { signal: "server-handoff", pattern: /useServerHandoffComplete/i, evidence: "server handoff readiness evidence was detected." },
    { signal: "skip-initial-transition", pattern: /initial[\s\S]{0,160}!appear|skip initial transition/i, evidence: "initial transition skip evidence was detected." },
    { signal: "immediate-appear", pattern: /appear[\s\S]{0,120}show[\s\S]{0,120}initial|immediate appear/i, evidence: "immediate appear transition evidence was detected." },
    { signal: "use-transition-hook", pattern: /useTransition\(/i, evidence: "useTransition hook evidence was detected." },
    { signal: "transition-data-attributes", pattern: /transitionDataAttributes/i, evidence: "transition data attribute evidence was detected." },
    { signal: "class-map-enter-leave", pattern: /classNames[\s\S]{0,180}enter[\s\S]{0,180}leave[\s\S]{0,180}entered|enter\s+leave\s+entered/i, evidence: "enter/leave/entered class map evidence was detected." },
    { signal: "open-closed-provider", pattern: /OpenClosedProvider/i, evidence: "OpenClosedProvider evidence was detected." },
    { signal: "state-opening-closing", pattern: /State\.Opening[\s\S]{0,120}State\.Closing|State\.Closing[\s\S]{0,120}State\.Opening|State\.Opening\s+State\.Closing/i, evidence: "open/closed opening and closing state evidence was detected." },
    { signal: "show-from-open-closed", pattern: /useOpenClosed|show[\s\S]{0,120}useOpenClosed|open closed/i, evidence: "show derived from open/closed context evidence was detected." },
    { signal: "missing-show-error", pattern: /missing\s+show|A <Transition \/> is used but it is missing|show prop/i, evidence: "missing show error evidence was detected." },
    { signal: "initial-change-tracking", pattern: /initial[\s\S]{0,160}changes|changes[\s\S]{0,160}initial/i, evidence: "initial change tracking evidence was detected." },
    { signal: "before-enter-leave", pattern: /beforeEnter[\s\S]{0,120}beforeLeave|beforeLeave[\s\S]{0,120}beforeEnter/i, evidence: "beforeEnter/beforeLeave callback evidence was detected." },
    { signal: "after-enter-leave", pattern: /afterEnter[\s\S]{0,120}afterLeave|afterLeave[\s\S]{0,120}afterEnter/i, evidence: "afterEnter/afterLeave callback evidence was detected." },
    { signal: "internal-transition-child", pattern: /InternalTransitionChild|TransitionChild/i, evidence: "internal transition child evidence was detected." },
    { signal: "transition-object-assign", pattern: /Object\.assign\(TransitionRoot|Transition\s*=\s*Object\.assign/i, evidence: "Transition Object.assign subcomponent evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "implementation", "signal");
}

function presenceTestSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["testSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(|test\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "animation-test", pattern: /animation-test|animationend|animationcancel|animationstart/i, evidence: "animation test evidence was detected." },
    { signal: "visibility-test", pattern: /visibility-test|document\.hidden|visibilityState/i, evidence: "visibility test evidence was detected." },
    { signal: "exitcomplete-test", pattern: /exitcomplete-test|exitcomplete|onExitComplete/i, evidence: "exitcomplete test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|presence-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function presencePackageSignals(sourceFiles: PresenceReadinessSourceFile[]): PresenceReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PresenceReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/presence", pattern: /@zag-js\/presence/i, evidence: "@zag-js/presence dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|setup\(/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|raf|nextTick/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|compact|warn/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "@headlessui/react", pattern: /@headlessui\/react/i, evidence: "@headlessui/react dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return presenceSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function presenceSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PresenceReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/presence-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildMenuReadinessReport(walk: WalkResult): Promise<MenuReadinessReport> {
  const sourceFiles = await menuReadinessSourceFiles(walk);
  const menuSetups = menuReadinessSetups(sourceFiles);
  const frameworkSignals = menuFrameworkSignals(sourceFiles);
  const anatomySignals = menuAnatomySignals(sourceFiles);
  const stateSignals = menuStateSignals(sourceFiles);
  const highlightSignals = menuHighlightSignals(sourceFiles);
  const typeaheadSignals = menuTypeaheadSignals(sourceFiles);
  const positioningSignals = menuPositioningSignals(sourceFiles);
  const interactionSignals = menuInteractionSignals(sourceFiles);
  const keyboardSignals = menuKeyboardSignals(sourceFiles);
  const accessibilitySignals = menuAccessibilitySignals(sourceFiles);
  const machineSignals = menuMachineSignals(sourceFiles);
  const contextSignals = menuContextSignals(sourceFiles);
  const computedSignals = menuComputedSignals(sourceFiles);
  const effectSignals = menuEffectSignals(sourceFiles);
  const guardSignals = menuGuardSignals(sourceFiles);
  const actionSignals = menuActionSignals(sourceFiles);
  const domSignals = menuDomSignals(sourceFiles);
  const apiSignals = menuApiSignals(sourceFiles);
  const testSignals = menuTestSignals(sourceFiles);
  const packageSignals = menuPackageSignals(sourceFiles);

  const hasAnatomy = anatomySignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.triggerCount + item.contentCount + item.itemCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.stateCount > 0);
  const hasHighlight = highlightSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.highlightCount > 0);
  const hasTypeahead = typeaheadSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.typeaheadCount > 0);
  const hasPositioning = positioningSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.positioningCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.dismissCount + item.submenuCount > 0);
  const hasKeyboard = keyboardSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.keyboardCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || menuSetups.some((item) => item.testCount > 0);

  const riskQueue: MenuReadinessReport["riskQueue"] = [];
  if (!hasAnatomy) {
    riskQueue.push({
      priority: "medium",
      action: "Trace trigger, context trigger, positioner, content, item, option item, group, separator, indicator, and arrow parts before claiming menu readiness.",
      why: "Menu readiness starts from the static anatomy that separates trigger, context-menu entry, positioned content, selectable items, and option items.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Add open/closed/opening/closing/contextmenu, triggerValue, defaultOpen, and controlled-open evidence.",
      why: "Zag menu behavior is state-machine driven; learners need to distinguish idle, context-menu opening, delayed submenu opening, and closing.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasHighlight) {
    riskQueue.push({
      priority: "medium",
      action: "Add highlightedValue, lastHighlightedValue, highlight set/restore/suggest, item state, and option state evidence.",
      why: "Menu traversal and selection depend on highlighted item state, including radio and checkbox option state updates.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasTypeahead) {
    riskQueue.push({
      priority: "medium",
      action: "Add typeahead, typeaheadState, matched item, printable key, and valueText evidence.",
      why: "Printable-key typeahead is a core keyboard behavior for menus and should be visible in static reports.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasPositioning) {
    riskQueue.push({
      priority: "high",
      action: "Add positioning, current placement, placement side, popper styles, reposition, anchor point, anchor rect, and context-menu positioning evidence.",
      why: "Zag menu supports both trigger-based and context-menu anchor-point positioning, which should not be collapsed into generic popover readiness.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasInteraction) {
    riskQueue.push({
      priority: "medium",
      action: "Add trigger, pointer, item-click, dismissable outside, escape, option-state, and submenu-routing evidence.",
      why: "Menu readiness needs outside-dismissal and submenu pointer-routing evidence in addition to item click handlers.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasKeyboard) {
    riskQueue.push({
      priority: "medium",
      action: "Add arrow, Home/End, Enter/Space, Tab/Escape, navigate, focus-menu, and focus-trigger evidence.",
      why: "Menus are keyboard-first widgets; static readiness should preserve traversal, activation, and focus restoration evidence.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if (hasAnatomy && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Add role, ARIA, data-state, data-placement, data-ownedby, data-value, data-highlighted, and direction evidence.",
      why: "The DOM contract is how learners verify menu state and ownership without executing the widget.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  if ((hasAnatomy || hasState || hasHighlight || hasTypeahead || hasPositioning || hasInteraction || hasKeyboard) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add keyboard, pointer, typeahead, context-menu, submenu, option, positioning, and artifact tests.",
      why: "Static readiness is stronger when tests preserve delayed open/close, typeahead, option state, submenu routing, positioning, and artifact coverage.",
      relatedHref: "html/menu-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live menu open/close, delayed timers, popper placement, submenu pointer routing, pointer/keyboard/outside events, link clicks, option state, and analyzed-project tests outside RepoTutor.",
    why: "RepoTutor records menu readiness only; it does not open real menus, wait real delays, calculate live popper placement, route real submenu pointer polygons, dispatch pointer/keyboard/outside events, click real links, mutate option state, or run analyzed project tests.",
    relatedHref: "html/menu-readiness.html"
  });

  return {
    summary: menuSetups.length > 0
      ? `Menu readiness report: setup ${menuSetups.length} files, anatomy signal ${anatomySignals.length}, state signal ${stateSignals.length}, typeahead signal ${typeaheadSignals.length}, positioning signal ${positioningSignals.length}, interaction signal ${interactionSignals.length}, machine signal ${machineSignals.length}, effect signal ${effectSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`
      : "No menu readiness source files were detected.",
    sourcePattern: "Menu readiness Zag menu trigger context typeahead submenu positioning dismissable keyboard option tests",
    menuSetups,
    frameworkSignals,
    anatomySignals,
    stateSignals,
    highlightSignals,
    typeaheadSignals,
    positioningSignals,
    interactionSignals,
    keyboardSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    guardSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      {
        command: "rg \"@zag-js/menu|menu\\.machine|menu\\.connect|getTriggerProps|getContextTriggerProps|getContentProps|getItemProps|getOptionItemProps\" package.json src app packages",
        purpose: "Find Zag menu package usage, machine/connect setup, anatomy parts, context triggers, regular items, and option items."
      },
      {
        command: "rg \"highlightedValue|triggerValue|typeaheadState|anchorPoint|intentPolygon|positioningOverride|setParent|setChild|trackPointerMove|trackDismissableElement\" src app packages test",
        purpose: "Inspect highlight, trigger, typeahead, anchor positioning, submenu routing, pointer routing, and outside-dismissal evidence."
      },
      {
        command: "rg \"ARROW_DOWN|ARROW_UP|ARROW_LEFT|ARROW_RIGHT|HOME|END|ENTER|TYPEAHEAD|menu-traces|keyboard-test|context-menu-test|submenu-test|option-test|upload-artifact\" src app packages test tests .github",
        purpose: "Check keyboard traversal, typeahead, context-menu, submenu, option-state tests, and artifact traces."
      }
    ],
    learnerNextSteps: [
      "Open menu setup links and identify trigger, context trigger, positioner, content, item, option item, group, separator, indicator, and arrow parts.",
      "Trace triggerValue and highlightedValue separately; one controls active trigger identity while the other controls item traversal.",
      "Review typeahead and valueText evidence before assuming printable keyboard search works.",
      "Separate trigger-based positioning from context-menu anchor-point positioning and submenu placement overrides.",
      "Use the risk queue to decide whether missing behavior belongs in tests, implementation, or documentation."
    ]
  };
}

type MenuReadinessSourceFile = {
  filePath: string;
  sourceHref: string;
  text: string;
};

async function menuReadinessSourceFiles(walk: WalkResult): Promise<MenuReadinessSourceFile[]> {
  const files: MenuReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !menuInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!menuPathSignal(file.relPath) && !menuContentSignal(text)) continue;
    files.push({ filePath: file.relPath, sourceHref: `source/${encodedPath(file.relPath)}`, text });
    if (files.length >= 200) break;
  }
  return files;
}

function menuInspectablePath(filePath: string): boolean {
  if (filePath.includes("node_modules/") || filePath.includes(".git/") || filePath.includes("dist/") || filePath.includes("coverage/")) return false;
  return menuPathSignal(filePath)
    || /\.(tsx|ts|jsx|js|mjs|cjs|vue|svelte|mdx|md|json|yml|yaml|html|css|scss)$/i.test(filePath);
}

function menuPathSignal(filePath: string): boolean {
  return /menu|dropdown|context|\.github\/workflows|package\.json|test|spec/i.test(filePath);
}

function menuContentSignal(text: string): boolean {
  return /@zag-js\/menu|menu\.machine|menu\.connect|getContextTriggerProps|getOptionItemProps|menu-traces|data-scope=['"]menu/i.test(text);
}

function menuReadinessSetups(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["menuSetups"] {
  const rows: MenuReadinessReport["menuSetups"] = [];
  for (const source of sourceFiles) {
    const triggerCount = countMatches(source.text, /getTriggerProps|data-part=['"]trigger|TRIGGER_CLICK|TRIGGER_FOCUS|aria-haspopup/i);
    const contextTriggerCount = countMatches(source.text, /getContextTriggerProps|contextTrigger|context-trigger|CONTEXT_MENU|CONTEXT_MENU_START/i);
    const contentCount = countMatches(source.text, /getContentProps|data-part=['"]content|role=['"]menu|aria-activedescendant/i);
    const itemCount = countMatches(source.text, /getItemProps|getItemState|data-part=['"]item|role=['"]menuitem|ITEM_/i);
    const optionItemCount = countMatches(source.text, /getOptionItemProps|getOptionItemState|menuitemcheckbox|menuitemradio|OptionItem|data-type|aria-checked|checkbox|radio|option-test/i);
    const groupCount = countMatches(source.text, /getItemGroupProps|getItemGroupLabelProps|itemGroup|item-group|itemGroupLabel|item-group-label/i);
    const separatorCount = countMatches(source.text, /getSeparatorProps|separator|role=['"]separator/i);
    const arrowCount = countMatches(source.text, /getArrowProps|getArrowTipProps|arrowTip|arrow-tip|data-part=['"]arrow/i);
    const stateCount = countMatches(source.text, /idle|open|closed|opening|closing|opening:contextmenu|contextmenu|CONTROLLED\.OPEN|CONTROLLED\.CLOSE|defaultOpen|setOpen|data-state/i);
    const highlightCount = countMatches(source.text, /highlightedValue|lastHighlightedValue|HIGHLIGHTED\.SET|HIGHLIGHTED\.RESTORE|HIGHLIGHTED\.SUGGEST|setHighlightedValue|getItemState|getOptionItemState|highlighted-set|highlighted-restore|highlighted-suggest|option-state/i);
    const typeaheadCount = countMatches(source.text, /typeahead|typeaheadState|getByTypeahead|TYPEAHEAD|isPrintableKey|valueText|data-valuetext|matched-item|typeahead-test/i);
    const positioningCount = countMatches(source.text, /positioning|currentPlacement|getPlacement|getPlacementStyles|getPlacementSide|popperStyles|reposition|anchorPoint|getAnchorRect|positioningOverride|placement-side|anchor-point|positioning-test/i);
    const submenuCount = countMatches(source.text, /isSubmenu|setParent|setChild|parent|children|pointerRouting|setParentRoutingLock|unlockParent|intentPolygon|trackPointerMove|submenu|submenu-test/i);
    const dismissCount = countMatches(source.text, /trackDismissableElement|dismissable|onInteractOutside|onFocusOutside|onPointerDownOutside|onEscapeKeyDown|onRequestDismiss|escape-key|interact-outside|focus-outside|pointer-down-outside/i);
    const keyboardCount = countMatches(source.text, /ARROW_DOWN|ARROW_UP|ARROW_LEFT|ARROW_RIGHT|HOME|END|ENTER|Space|Tab|Escape|navigate|focusMenu|focusTrigger|keyboard-test|arrow-keys|home-end|enter-space|tab-escape/i);
    const accessibilityCount = countMatches(source.text, /role=['"]menu|menuitem|menuitemcheckbox|aria-haspopup|aria-controls|aria-expanded|aria-activedescendant|aria-labelledby|aria-checked|data-state|data-placement|data-side|data-ownedby|data-value|data-highlighted|dir=|dir:|direction/i);
    const testCount = countMatches(source.text, /vitest|describe\(|it\(|test\(|@testing-library\/react|userEvent|keyboard-test|pointer-test|typeahead-test|context-menu-test|submenu-test|option-test|positioning-test|upload-artifact|menu-traces/i);
    const evidenceScore = triggerCount + contextTriggerCount + contentCount + itemCount + optionItemCount + groupCount + separatorCount + arrowCount + stateCount + highlightCount + typeaheadCount + positioningCount + submenuCount + dismissCount + keyboardCount + accessibilityCount + testCount;
    if (evidenceScore === 0 && !menuPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: menuFramework(source),
      triggerCount,
      contextTriggerCount,
      contentCount,
      itemCount,
      optionItemCount,
      groupCount,
      separatorCount,
      arrowCount,
      stateCount,
      highlightCount,
      typeaheadCount,
      positioningCount,
      submenuCount,
      dismissCount,
      keyboardCount,
      accessibilityCount,
      testCount,
      readiness: evidenceScore >= 12 ? "ready" : evidenceScore > 0 ? "partial" : "missing",
      evidence: `${evidenceScore} static menu readiness signal(s) detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.stateCount + b.highlightCount + b.typeaheadCount + b.positioningCount + b.submenuCount + b.dismissCount + b.keyboardCount + b.accessibilityCount + b.testCount;
    const aScore = a.stateCount + a.highlightCount + a.typeaheadCount + a.positioningCount + a.submenuCount + a.dismissCount + a.keyboardCount + a.accessibilityCount + a.testCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function menuFramework(source: MenuReadinessSourceFile): MenuReadinessReport["menuSetups"][number]["framework"] {
  if (/@zag-js\/menu|menu\.machine|menu\.connect/i.test(source.text)) return "zag-menu";
  if (/custom menu|data-scope=['"]menu|menu-traces/i.test(source.text)) return "custom-menu";
  return "unknown";
}

function menuFrameworkSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-menu", pattern: /@zag-js\/menu|menu\.machine|menu\.connect/i, evidence: "Zag menu evidence was detected." },
    { signal: "custom-menu", pattern: /custom menu|data-scope=['"]menu|menu-traces/i, evidence: "custom menu evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function menuAnatomySignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["anatomySignals"] {
  const specs: Array<{ signal: MenuReadinessReport["anatomySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger|aria-haspopup/i, evidence: "trigger evidence was detected." },
    { signal: "context-trigger", pattern: /getContextTriggerProps|context-trigger|contextTrigger/i, evidence: "context trigger evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner|positioner/i, evidence: "positioner evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]menu/i, evidence: "content evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-part=['"]item|role=['"]menuitem/i, evidence: "item evidence was detected." },
    { signal: "option-item", pattern: /getOptionItemProps|getOptionItemState|menuitemcheckbox|menuitemradio|data-type|aria-checked|option/i, evidence: "option item evidence was detected." },
    { signal: "item-group", pattern: /getItemGroupProps|itemGroup|item-group/i, evidence: "item group evidence was detected." },
    { signal: "item-group-label", pattern: /getItemGroupLabelProps|itemGroupLabel|item-group-label/i, evidence: "item group label evidence was detected." },
    { signal: "separator", pattern: /getSeparatorProps|role=['"]separator|separator/i, evidence: "separator evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-part=['"]indicator|indicator/i, evidence: "indicator evidence was detected." },
    { signal: "item-indicator", pattern: /getItemIndicatorProps|itemIndicator|item-indicator/i, evidence: "item indicator evidence was detected." },
    { signal: "item-text", pattern: /getItemTextProps|itemText|item-text/i, evidence: "item text evidence was detected." },
    { signal: "arrow", pattern: /getArrowProps|data-part=['"]arrow|arrow/i, evidence: "arrow evidence was detected." },
    { signal: "arrow-tip", pattern: /getArrowTipProps|arrowTip|arrow-tip/i, evidence: "arrow tip evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "anatomy", "signal");
}

function menuStateSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["stateSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle evidence was detected." },
    { signal: "open", pattern: /\bopen\b|data-state=['"]open|OPEN_AUTOFOCUS/i, evidence: "open evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|data-state=['"]closed/i, evidence: "closed evidence was detected." },
    { signal: "opening", pattern: /\bopening\b|DELAY\.OPEN/i, evidence: "opening evidence was detected." },
    { signal: "closing", pattern: /\bclosing\b|DELAY\.CLOSE/i, evidence: "closing evidence was detected." },
    { signal: "contextmenu", pattern: /opening:contextmenu|contextmenu|CONTEXT_MENU/i, evidence: "context menu state evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue|TRIGGER_VALUE\.SET|trigger-value/i, evidence: "trigger value evidence was detected." },
    { signal: "controlled-open", pattern: /CONTROLLED\.OPEN|CONTROLLED\.CLOSE|controlled-open/i, evidence: "controlled open evidence was detected." },
    { signal: "default-open", pattern: /defaultOpen|default-open/i, evidence: "default open evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function menuHighlightSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["highlightSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["highlightSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "highlighted-value", pattern: /highlightedValue|highlighted-value/i, evidence: "highlighted value evidence was detected." },
    { signal: "last-highlighted", pattern: /lastHighlightedValue|last-highlighted/i, evidence: "last highlighted evidence was detected." },
    { signal: "highlighted-set", pattern: /HIGHLIGHTED\.SET|setHighlightedValue|highlighted-set/i, evidence: "highlighted set evidence was detected." },
    { signal: "highlighted-restore", pattern: /HIGHLIGHTED\.RESTORE|restoreHighlighted|highlighted-restore/i, evidence: "highlighted restore evidence was detected." },
    { signal: "highlighted-suggest", pattern: /HIGHLIGHTED\.SUGGEST|suggestHighlighted|highlighted-suggest/i, evidence: "highlighted suggest evidence was detected." },
    { signal: "item-state", pattern: /getItemState|itemState|data-highlighted/i, evidence: "item state evidence was detected." },
    { signal: "option-state", pattern: /getOptionItemState|setOptionState|onCheckedChange|option-state/i, evidence: "option state evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "highlight", "signal");
}

function menuTypeaheadSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["typeaheadSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["typeaheadSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "typeahead", pattern: /\btypeahead\b|TYPEAHEAD/i, evidence: "typeahead evidence was detected." },
    { signal: "typeahead-state", pattern: /typeaheadState|typeahead-state/i, evidence: "typeahead state evidence was detected." },
    { signal: "matched-item", pattern: /highlightMatchedItem|getByTypeahead|matched-item/i, evidence: "matched item evidence was detected." },
    { signal: "printable-key", pattern: /isPrintableKey|printable-key/i, evidence: "printable key evidence was detected." },
    { signal: "value-text", pattern: /valueText|data-valuetext|value-text/i, evidence: "valueText evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "typeahead", "signal");
}

function menuPositioningSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "positioning", pattern: /\bpositioning\b|positioningOverride/i, evidence: "positioning evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "current placement evidence was detected." },
    { signal: "placement-side", pattern: /getPlacementSide|currentPlacementSide|placement-side/i, evidence: "placement side evidence was detected." },
    { signal: "popper-styles", pattern: /getPlacementStyles|popperStyles|popper-styles/i, evidence: "popper styles evidence was detected." },
    { signal: "reposition", pattern: /reposition\(|POSITIONING\.SET|reposition/i, evidence: "reposition evidence was detected." },
    { signal: "anchor-point", pattern: /anchorPoint|anchor-point/i, evidence: "anchor point evidence was detected." },
    { signal: "anchor-rect", pattern: /getAnchorRect|anchor-rect/i, evidence: "anchor rect evidence was detected." },
    { signal: "context-menu-position", pattern: /CONTEXT_MENU|context-menu-position|contextmenu.*anchor|anchorPoint/i, evidence: "context menu positioning evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function menuInteractionSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-click", pattern: /TRIGGER_CLICK|onClick\(|trigger-click/i, evidence: "trigger click evidence was detected." },
    { signal: "trigger-focus", pattern: /TRIGGER_FOCUS|onFocus\(|trigger-focus/i, evidence: "trigger focus evidence was detected." },
    { signal: "pointer-move", pattern: /POINTERMOVE|onPointerMove|pointer-move/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-leave", pattern: /POINTERLEAVE|onPointerLeave|pointer-leave/i, evidence: "pointer leave evidence was detected." },
    { signal: "item-click", pattern: /ITEM_CLICK|item-click/i, evidence: "item click evidence was detected." },
    { signal: "dismissable", pattern: /trackDismissableElement|dismissable/i, evidence: "dismissable evidence was detected." },
    { signal: "interact-outside", pattern: /onInteractOutside|interact-outside/i, evidence: "interact outside evidence was detected." },
    { signal: "focus-outside", pattern: /onFocusOutside|focus-outside/i, evidence: "focus outside evidence was detected." },
    { signal: "escape-key", pattern: /onEscapeKeyDown|Escape|escape-key/i, evidence: "escape key evidence was detected." },
    { signal: "option-state", pattern: /setOptionState|onCheckedChange|option-state/i, evidence: "option state evidence was detected." },
    { signal: "submenu-routing", pattern: /setParent|setChild|setParentRoutingLock|unlockParent|submenu-routing|pointerRouting/i, evidence: "submenu routing evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function menuKeyboardSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["keyboardSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["keyboardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "arrow-keys", pattern: /ARROW_DOWN|ARROW_UP|ARROW_LEFT|ARROW_RIGHT|ArrowDown|ArrowUp|ArrowLeft|ArrowRight|arrow-keys/i, evidence: "arrow key evidence was detected." },
    { signal: "home-end", pattern: /\bHOME\b|\bEND\b|\bHome\b|\bEnd\b|home-end/i, evidence: "Home/End evidence was detected." },
    { signal: "enter-space", pattern: /\bENTER\b|\bSpace\b|\bEnter\b|enter-space/i, evidence: "Enter/Space evidence was detected." },
    { signal: "tab-escape", pattern: /\bTab\b|\bEscape\b|tab-escape|onEscapeKeyDown/i, evidence: "Tab/Escape evidence was detected." },
    { signal: "navigate", pattern: /\bnavigate\b|clickHighlightedItem|clickIfLink/i, evidence: "navigate evidence was detected." },
    { signal: "focus-menu", pattern: /focusMenu|FOCUS_MENU|focus-menu/i, evidence: "focus menu evidence was detected." },
    { signal: "focus-trigger", pattern: /focusTrigger|focus-trigger/i, evidence: "focus trigger evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "keyboard", "signal");
}

function menuAccessibilitySignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: MenuReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-menu", pattern: /role=['"]menu|role:\s*["']menu["']/i, evidence: "role menu evidence was detected." },
    { signal: "menuitem", pattern: /role=['"]menuitem|menuitem/i, evidence: "menuitem evidence was detected." },
    { signal: "menuitemcheckbox", pattern: /menuitemcheckbox|menuitemradio/i, evidence: "menuitemcheckbox evidence was detected." },
    { signal: "aria-haspopup", pattern: /aria-haspopup/i, evidence: "aria-haspopup evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-activedescendant", pattern: /aria-activedescendant/i, evidence: "aria-activedescendant evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-checked", pattern: /aria-checked/i, evidence: "aria-checked evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement evidence was detected." },
    { signal: "data-side", pattern: /data-side/i, evidence: "data-side evidence was detected." },
    { signal: "data-ownedby", pattern: /data-ownedby/i, evidence: "data-ownedby evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value evidence was detected." },
    { signal: "data-highlighted", pattern: /data-highlighted/i, evidence: "data-highlighted evidence was detected." },
    { signal: "direction", pattern: /\bdir\s*[:=]|\bdir\b|direction/i, evidence: "direction evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function menuMachineSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["machineSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<MenuSchema>|menu\.machine/i, evidence: "createMachine MenuSchema evidence was detected." },
    { signal: "create-guards", pattern: /createGuards<MenuSchema>|createGuards\s+MenuSchema/i, evidence: "createGuards MenuSchema evidence was detected." },
    { signal: "default-props", pattern: /props[\s\S]{0,220}closeOnSelect[\s\S]{0,120}typeahead[\s\S]{0,120}composite[\s\S]{0,120}loopFocus[\s\S]{0,120}positioning|closeOnSelect\s+typeahead\s+composite\s+loopFocus\s+positioning/i, evidence: "default props evidence was detected." },
    { signal: "initial-state", pattern: /initialState[\s\S]{0,100}open[\s\S]{0,100}defaultOpen[\s\S]{0,100}idle|initialState\s+open\s+defaultOpen\s+idle/i, evidence: "initial state evidence was detected." },
    { signal: "bindable-context", pattern: /context[\s\S]{0,260}highlightedValue[\s\S]{0,160}bindable[\s\S]{0,160}lastHighlightedValue[\s\S]{0,160}currentPlacement[\s\S]{0,160}intentPolygon|highlightedValue\s+bindable\s+lastHighlightedValue\s+bindable\s+currentPlacement\s+bindable\s+intentPolygon\s+bindable\s+anchorPoint\s+bindable\s+isSubmenu\s+bindable\s+triggerValue\s+bindable\s+pointerRoutingMode/i, evidence: "bindable context evidence was detected." },
    { signal: "refs", pattern: /refs[\s\S]{0,180}parent[\s\S]{0,120}children[\s\S]{0,120}pointerRoutingLocked[\s\S]{0,120}typeaheadState[\s\S]{0,120}positioningOverride|refs\s+parent\s+children\s+pointerRoutingLocked\s+typeaheadState\s+positioningOverride/i, evidence: "refs evidence was detected." },
    { signal: "computed-state", pattern: /computed[\s\S]{0,180}isRtl[\s\S]{0,120}isTypingAhead[\s\S]{0,120}highlightedId|computed\s+isRtl\s+isTypingAhead\s+highlightedId/i, evidence: "computed state evidence was detected." },
    { signal: "watch-props", pattern: /watch[\s\S]{0,180}isSubmenu[\s\S]{0,120}setSubmenuPlacement[\s\S]{0,120}anchorPoint[\s\S]{0,120}reposition[\s\S]{0,120}open[\s\S]{0,120}toggleVisibility|watch\s+isSubmenu\s+setSubmenuPlacement\s+anchorPoint\s+reposition\s+open\s+toggleVisibility/i, evidence: "watch prop evidence was detected." },
    { signal: "root-events", pattern: /TRIGGER_VALUE\.SET|PARENT\.SET|CHILD\.SET|OPEN_AUTOFOCUS|HIGHLIGHTED\.RESTORE|HIGHLIGHTED\.SET|HIGHLIGHTED\.SUGGEST/i, evidence: "root event evidence was detected." },
    { signal: "delayed-states", pattern: /opening:contextmenu|waitForLongPress|waitForOpenDelay|waitForCloseDelay|DELAY\.OPEN|DELAY\.CLOSE|LONG_PRESS\.OPEN/i, evidence: "delayed state evidence was detected." },
    { signal: "open-state", pattern: /states[\s\S]{0,220}idle[\s\S]{0,160}opening[\s\S]{0,160}closing[\s\S]{0,160}closed[\s\S]{0,160}open|idle\s+opening:contextmenu\s+opening\s+closing\s+closed\s+open/i, evidence: "open state chart evidence was detected." },
    { signal: "implementation-block", pattern: /implementations[\s\S]{0,120}guards[\s\S]{0,120}effects[\s\S]{0,120}actions|implementations\s+guards\s+effects\s+actions/i, evidence: "implementation block evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function menuContextSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["contextSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "highlighted-value", pattern: /highlightedValue/i, evidence: "highlighted value context evidence was detected." },
    { signal: "last-highlighted-value", pattern: /lastHighlightedValue/i, evidence: "last highlighted value context evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement/i, evidence: "current placement context evidence was detected." },
    { signal: "intent-polygon", pattern: /intentPolygon/i, evidence: "intent polygon context evidence was detected." },
    { signal: "anchor-point", pattern: /anchorPoint/i, evidence: "anchor point context evidence was detected." },
    { signal: "is-submenu", pattern: /isSubmenu/i, evidence: "isSubmenu context evidence was detected." },
    { signal: "trigger-value", pattern: /triggerValue/i, evidence: "trigger value context evidence was detected." },
    { signal: "pointer-routing-mode", pattern: /pointerRoutingMode|pointerRouting/i, evidence: "pointer routing mode context evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function menuComputedSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["computedSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-rtl", pattern: /isRtl/i, evidence: "isRtl computed evidence was detected." },
    { signal: "is-typing-ahead", pattern: /isTypingAhead/i, evidence: "isTypingAhead computed evidence was detected." },
    { signal: "highlighted-id", pattern: /highlightedId/i, evidence: "highlightedId computed evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function menuEffectSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["effectSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wait-open-delay", pattern: /waitForOpenDelay|DELAY\.OPEN/i, evidence: "open delay effect evidence was detected." },
    { signal: "wait-close-delay", pattern: /waitForCloseDelay|DELAY\.CLOSE/i, evidence: "close delay effect evidence was detected." },
    { signal: "wait-long-press", pattern: /waitForLongPress|LONG_PRESS\.OPEN/i, evidence: "long press effect evidence was detected." },
    { signal: "track-focus-visible", pattern: /trackFocusVisible|focus-visible/i, evidence: "focus visible effect evidence was detected." },
    { signal: "track-positioning", pattern: /trackPositioning|getPlacement/i, evidence: "positioning effect evidence was detected." },
    { signal: "track-interact-outside", pattern: /trackInteractOutside|trackDismissableElement/i, evidence: "interact outside effect evidence was detected." },
    { signal: "track-pointer-move", pattern: /trackPointerMove|addDomEvent[\s\S]{0,120}pointermove/i, evidence: "pointer move effect evidence was detected." },
    { signal: "scroll-highlighted-item", pattern: /scrollToHighlightedItem|scrollIntoView/i, evidence: "scroll highlighted item effect evidence was detected." },
    { signal: "observe-attributes", pattern: /observeAttributes|aria-activedescendant/i, evidence: "observe attributes effect evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function menuGuardSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["guardSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "close-on-select", pattern: /closeOnSelect/i, evidence: "closeOnSelect guard evidence was detected." },
    { signal: "is-trigger-item", pattern: /isTriggerItem/i, evidence: "isTriggerItem guard evidence was detected." },
    { signal: "is-trigger-item-highlighted", pattern: /isTriggerItemHighlighted/i, evidence: "isTriggerItemHighlighted guard evidence was detected." },
    { signal: "is-submenu", pattern: /isSubmenu/i, evidence: "isSubmenu guard evidence was detected." },
    { signal: "is-pointer-routing-locked", pattern: /isPointerRoutingLocked|pointerRoutingLocked/i, evidence: "pointer routing lock guard evidence was detected." },
    { signal: "is-highlighted-item-editable", pattern: /isHighlightedItemEditable|isEditableElement/i, evidence: "highlighted item editable guard evidence was detected." },
    { signal: "is-open-controlled", pattern: /isOpenControlled|CONTROLLED\.OPEN|CONTROLLED\.CLOSE/i, evidence: "open controlled guard evidence was detected." },
    { signal: "arrow-event", pattern: /isArrowLeftEvent|isArrowUpEvent|isArrowDownEvent/i, evidence: "arrow event guard evidence was detected." },
    { signal: "open-autofocus-event", pattern: /isOpenAutoFocusEvent|OPEN_AUTOFOCUS/i, evidence: "open autofocus guard evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function menuActionSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["actionSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-anchor-point", pattern: /setAnchorPoint/i, evidence: "set anchor point action evidence was detected." },
    { signal: "set-submenu-placement", pattern: /setSubmenuPlacement/i, evidence: "set submenu placement action evidence was detected." },
    { signal: "reposition", pattern: /reposition|getPlacement|POSITIONING\.SET/i, evidence: "reposition action evidence was detected." },
    { signal: "set-option-state", pattern: /setOptionState|onCheckedChange/i, evidence: "set option state action evidence was detected." },
    { signal: "click-highlighted-item", pattern: /clickHighlightedItem|clickIfLink/i, evidence: "click highlighted item action evidence was detected." },
    { signal: "intent-polygon", pattern: /setIntentPolygon|clearIntentPolygon|getElementPolygon|isPointInPolygon/i, evidence: "intent polygon action evidence was detected." },
    { signal: "parent-routing-lock", pattern: /setParentRoutingLock|unlockParentOnOpen|unlockParentOnClose|unlockParentAfterChildClose|unlockParentOnSubmenuClose|releaseParentRoutingLock/i, evidence: "parent routing lock action evidence was detected." },
    { signal: "highlight-navigation", pattern: /highlightFirstItem|highlightLastItem|highlightNextItem|highlightPrevItem|setHighlightedItem|clearHighlightedItem|restoreHighlightedItem|suggestHighlightedItem/i, evidence: "highlight navigation action evidence was detected." },
    { signal: "selection-callback", pattern: /invokeOnSelect|dispatchSelectionEvent|onSelect/i, evidence: "selection callback action evidence was detected." },
    { signal: "focus-actions", pattern: /focusMenu|focusTrigger|focusParentMenu|restoreParentHighlightedItem|getInitialFocus/i, evidence: "focus action evidence was detected." },
    { signal: "typeahead-match", pattern: /highlightMatchedItem|getElemByKey|getByTypeahead/i, evidence: "typeahead match action evidence was detected." },
    { signal: "parent-child-menu", pattern: /setParentMenu|setChildMenu|setParent|setChild/i, evidence: "parent/child menu action evidence was detected." },
    { signal: "submenu-actions", pattern: /openSubmenu|closeSiblingMenus|closeRootMenu/i, evidence: "submenu action evidence was detected." },
    { signal: "open-close-callbacks", pattern: /invokeOnOpen|invokeOnClose|onOpenChange/i, evidence: "open/close callback evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility/i, evidence: "toggle visibility action evidence was detected." },
    { signal: "trigger-value", pattern: /setTriggerValue|TRIGGER_VALUE\.SET|triggerValue/i, evidence: "trigger value action evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function menuDomSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["domSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-id", pattern: /getTriggerId/i, evidence: "trigger ID evidence was detected." },
    { signal: "context-trigger-id", pattern: /getContextTriggerId/i, evidence: "context trigger ID evidence was detected." },
    { signal: "content-id", pattern: /getContentId/i, evidence: "content ID evidence was detected." },
    { signal: "arrow-id", pattern: /getArrowId/i, evidence: "arrow ID evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId/i, evidence: "positioner ID evidence was detected." },
    { signal: "group-id", pattern: /getGroupId/i, evidence: "group ID evidence was detected." },
    { signal: "item-id", pattern: /getItemId/i, evidence: "item ID evidence was detected." },
    { signal: "group-label-id", pattern: /getGroupLabelId/i, evidence: "group label ID evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element evidence was detected." },
    { signal: "positioner-el", pattern: /getPositionerEl/i, evidence: "positioner element evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl/i, evidence: "trigger element evidence was detected." },
    { signal: "item-el", pattern: /getItemEl/i, evidence: "item element evidence was detected." },
    { signal: "arrow-el", pattern: /getArrowEl/i, evidence: "arrow element evidence was detected." },
    { signal: "context-trigger-el", pattern: /getContextTriggerEl/i, evidence: "context trigger element evidence was detected." },
    { signal: "trigger-els", pattern: /getTriggerEls/i, evidence: "trigger elements query evidence was detected." },
    { signal: "context-trigger-els", pattern: /getContextTriggerEls/i, evidence: "context trigger elements query evidence was detected." },
    { signal: "elements-query", pattern: /getElements|queryAll|role\^=.menuitem/i, evidence: "menu item elements query evidence was detected." },
    { signal: "typeahead-key", pattern: /getElemByKey|getByTypeahead/i, evidence: "typeahead key DOM evidence was detected." },
    { signal: "selection-event", pattern: /itemSelectEvent|dispatchSelectionEvent|menu:select/i, evidence: "selection event DOM evidence was detected." },
    { signal: "menu-tree", pattern: /isTargetWithinMenuTree|getPortaledContentEl/i, evidence: "menu tree DOM evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function menuApiSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["apiSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "highlighted-value", pattern: /api\.highlightedValue|highlightedValue/i, evidence: "highlightedValue API evidence was detected." },
    { signal: "trigger-value", pattern: /api\.triggerValue|triggerValue/i, evidence: "triggerValue API evidence was detected." },
    { signal: "set-open", pattern: /setOpen|api\.setOpen/i, evidence: "setOpen API evidence was detected." },
    { signal: "set-trigger-value", pattern: /setTriggerValue|api\.setTriggerValue/i, evidence: "setTriggerValue API evidence was detected." },
    { signal: "set-highlighted-value", pattern: /setHighlightedValue|api\.setHighlightedValue/i, evidence: "setHighlightedValue API evidence was detected." },
    { signal: "set-parent", pattern: /setParent\(|api\.setParent|\bsetParent\b/i, evidence: "setParent API evidence was detected." },
    { signal: "set-child", pattern: /setChild\(|api\.setChild|\bsetChild\b/i, evidence: "setChild API evidence was detected." },
    { signal: "reposition", pattern: /reposition\(|api\.reposition/i, evidence: "reposition API evidence was detected." },
    { signal: "add-item-listener", pattern: /addItemListener|api\.addItemListener/i, evidence: "add item listener API evidence was detected." },
    { signal: "context-trigger-props", pattern: /getContextTriggerProps/i, evidence: "context trigger props API evidence was detected." },
    { signal: "trigger-item-props", pattern: /getTriggerItemProps/i, evidence: "trigger item props API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props API evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props API evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps/i, evidence: "positioner props API evidence was detected." },
    { signal: "arrow-props", pattern: /getArrowProps/i, evidence: "arrow props API evidence was detected." },
    { signal: "arrow-tip-props", pattern: /getArrowTipProps/i, evidence: "arrow tip props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "separator-props", pattern: /getSeparatorProps/i, evidence: "separator props API evidence was detected." },
    { signal: "item-state", pattern: /getItemState/i, evidence: "item state API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props API evidence was detected." },
    { signal: "option-item-state", pattern: /getOptionItemState/i, evidence: "option item state API evidence was detected." },
    { signal: "option-item-props", pattern: /getOptionItemProps/i, evidence: "option item props API evidence was detected." },
    { signal: "item-indicator-props", pattern: /getItemIndicatorProps/i, evidence: "item indicator props API evidence was detected." },
    { signal: "item-text-props", pattern: /getItemTextProps/i, evidence: "item text props API evidence was detected." },
    { signal: "item-group-label-props", pattern: /getItemGroupLabelProps/i, evidence: "item group label props API evidence was detected." },
    { signal: "item-group-props", pattern: /getItemGroupProps/i, evidence: "item group props API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir-prop/i, evidence: "dir prop API evidence was detected." },
    { signal: "data-placement", pattern: /["']data-placement["']|data-placement/i, evidence: "data-placement API evidence was detected." },
    { signal: "data-side", pattern: /["']data-side["']|data-side/i, evidence: "data-side API evidence was detected." },
    { signal: "type-button", pattern: /type:\s*["']button["']|type-button/i, evidence: "button type API evidence was detected." },
    { signal: "data-ownedby", pattern: /["']data-ownedby["']|data-ownedby/i, evidence: "data-ownedby API evidence was detected." },
    { signal: "data-value", pattern: /["']data-value["']|data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "data-current", pattern: /["']data-current["']|data-current/i, evidence: "data-current API evidence was detected." },
    { signal: "data-uid", pattern: /["']data-uid["']|data-uid/i, evidence: "data-uid API evidence was detected." },
    { signal: "aria-haspopup-menu-dialog", pattern: /["']aria-haspopup["']:\s*composite\s*\?\s*["']menu["']\s*:\s*["']dialog["']|aria-haspopup-menu-dialog/i, evidence: "aria-haspopup menu/dialog API evidence was detected." },
    { signal: "aria-controls", pattern: /["']aria-controls["']|aria-controls/i, evidence: "aria-controls API evidence was detected." },
    { signal: "data-controls", pattern: /["']data-controls["']|data-controls/i, evidence: "data-controls API evidence was detected." },
    { signal: "aria-expanded", pattern: /["']aria-expanded["']|aria-expanded/i, evidence: "aria-expanded API evidence was detected." },
    { signal: "pointer-move-handler", pattern: /onPointerMove\b|pointer-move-handler/i, evidence: "pointer move handler API evidence was detected." },
    { signal: "pointer-leave-handler", pattern: /onPointerLeave\b|pointer-leave-handler/i, evidence: "pointer leave handler API evidence was detected." },
    { signal: "disabled-target-guard", pattern: /isTargetDisabled|disabled-target-guard/i, evidence: "disabled target guard API evidence was detected." },
    { signal: "context-menu-guard", pattern: /isContextMenuEvent|context-menu-guard/i, evidence: "context menu guard API evidence was detected." },
    { signal: "prevent-default", pattern: /preventDefault\(|prevent-default/i, evidence: "preventDefault API evidence was detected." },
    { signal: "default-prevented-guard", pattern: /event\.defaultPrevented|default-prevented-guard/i, evidence: "defaultPrevented guard API evidence was detected." },
    { signal: "trigger-blur-handler", pattern: /onBlur\(\)|trigger-blur-handler/i, evidence: "trigger blur handler API evidence was detected." },
    { signal: "trigger-focus-handler", pattern: /onFocus\(\)|trigger-focus-handler/i, evidence: "trigger focus handler API evidence was detected." },
    { signal: "key-map-arrow", pattern: /keyMap[\s\S]{0,220}ArrowDown|key-map-arrow/i, evidence: "arrow key map API evidence was detected." },
    { signal: "positioner-floating-style", pattern: /popperStyles\.floating|positioner-floating-style/i, evidence: "positioner floating style API evidence was detected." },
    { signal: "arrow-style", pattern: /popperStyles\.arrow|arrow-style/i, evidence: "arrow style API evidence was detected." },
    { signal: "arrow-tip-style", pattern: /popperStyles\.arrowTip|arrow-tip-style/i, evidence: "arrow tip style API evidence was detected." },
    { signal: "content-role", pattern: /role:\s*composite\s*\?\s*["']menu["']\s*:\s*["']dialog["']|content-role/i, evidence: "content role API evidence was detected." },
    { signal: "content-tabindex", pattern: /tabIndex:\s*0|content-tabindex/i, evidence: "content tabIndex API evidence was detected." },
    { signal: "aria-activedescendant", pattern: /["']aria-activedescendant["']|aria-activedescendant/i, evidence: "aria-activedescendant API evidence was detected." },
    { signal: "aria-labelledby", pattern: /["']aria-labelledby["']|aria-labelledby/i, evidence: "aria-labelledby API evidence was detected." },
    { signal: "valid-tab-guard", pattern: /isValidTabEvent|valid-tab-guard/i, evidence: "valid tab guard API evidence was detected." },
    { signal: "typeahead-printable-guard", pattern: /isPrintableKey|typeahead-printable-guard/i, evidence: "typeahead printable guard API evidence was detected." },
    { signal: "separator-role", pattern: /role:\s*["']separator["']|separator-role/i, evidence: "separator role API evidence was detected." },
    { signal: "option-data-type", pattern: /["']data-type["']:\s*type|option-data-type/i, evidence: "option data-type API evidence was detected." },
    { signal: "aria-checked", pattern: /["']aria-checked["']|aria-checked/i, evidence: "aria-checked API evidence was detected." },
    { signal: "item-indicator-hidden", pattern: /hidden:\s*hasProp\(props,\s*["']checked["']\)|item-indicator-hidden/i, evidence: "item indicator hidden API evidence was detected." },
    { signal: "item-group-role", pattern: /role:\s*["']group["']|item-group-role/i, evidence: "item group role API evidence was detected." },
    { signal: "download-guard", pattern: /isDownloadingEvent|download-guard/i, evidence: "download guard API evidence was detected." },
    { signal: "new-tab-guard", pattern: /isOpeningInNewTab|new-tab-guard/i, evidence: "new tab guard API evidence was detected." },
    { signal: "drag-link-prevent-default", pattern: /onDragStart[\s\S]{0,140}preventDefault\(\)|drag-link-prevent-default/i, evidence: "drag link preventDefault API evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function menuTestSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["testSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(|test\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|render\(|screen\./i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|ArrowDown|Home|End/i, evidence: "keyboard test evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|user\.click|pointer/i, evidence: "pointer test evidence was detected." },
    { signal: "typeahead-test", pattern: /typeahead-test|TYPEAHEAD|printable/i, evidence: "typeahead test evidence was detected." },
    { signal: "context-menu-test", pattern: /context-menu-test|contextmenu|CONTEXT_MENU/i, evidence: "context menu test evidence was detected." },
    { signal: "submenu-test", pattern: /submenu-test|setParent|setChild|pointerRouting/i, evidence: "submenu test evidence was detected." },
    { signal: "option-test", pattern: /option-test|menuitemcheckbox|onCheckedChange|setOptionState/i, evidence: "option test evidence was detected." },
    { signal: "positioning-test", pattern: /positioning-test|getPlacement|reposition|anchorPoint/i, evidence: "positioning test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|menu-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function menuPackageSignals(sourceFiles: MenuReadinessSourceFile[]): MenuReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MenuReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/menu", pattern: /@zag-js\/menu/i, evidence: "@zag-js/menu dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react|normalizeProps|useMachine/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy|createAnatomy/i, evidence: "@zag-js/anatomy evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core|createMachine|createGuards|mergeProps/i, evidence: "@zag-js/core evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable|dismissable/i, evidence: "@zag-js/dismissable evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query|getByTypeahead|isPrintableKey|scrollIntoView/i, evidence: "@zag-js/dom-query evidence was detected." },
    { signal: "@zag-js/focus-visible", pattern: /@zag-js\/focus-visible|trackFocusVisible|focus-visible/i, evidence: "@zag-js/focus-visible evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper|getPlacement|getPlacementStyles|getPlacementSide/i, evidence: "@zag-js/popper evidence was detected." },
    { signal: "@zag-js/rect-utils", pattern: /@zag-js\/rect-utils|getElementPolygon|isPointInPolygon|intentPolygon/i, evidence: "@zag-js/rect-utils evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types|NormalizeProps|PropTypes|createProps/i, evidence: "@zag-js/types evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils|createSplitProps|cast|hasProp|isEqual/i, evidence: "@zag-js/utils evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|@testing-library\/react/i, evidence: "React evidence was detected." }
  ];
  return menuSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function menuSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MenuReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/menu-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
