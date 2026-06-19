import path from "node:path";
import type { PasswordInputReadinessReport, SignaturePadReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildPasswordInputReadinessReport(walk: WalkResult): Promise<PasswordInputReadinessReport> {
  const sourceFiles = await passwordInputReadinessSourceFiles(walk);
  const passwordInputSetups = passwordInputReadinessSetups(sourceFiles);
  const frameworkSignals = passwordInputReadinessFrameworkSignals(sourceFiles);
  const structureSignals = passwordInputReadinessStructureSignals(sourceFiles);
  const stateSignals = passwordInputReadinessStateSignals(sourceFiles);
  const visibilitySignals = passwordInputReadinessVisibilitySignals(sourceFiles);
  const formSignals = passwordInputReadinessFormSignals(sourceFiles);
  const passwordManagerSignals = passwordInputReadinessPasswordManagerSignals(sourceFiles);
  const accessibilitySignals = passwordInputReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = passwordInputReadinessMachineSignals(sourceFiles);
  const contextSignals = passwordInputReadinessContextSignals(sourceFiles);
  const effectSignals = passwordInputReadinessEffectSignals(sourceFiles);
  const actionSignals = passwordInputReadinessActionSignals(sourceFiles);
  const domSignals = passwordInputReadinessDomSignals(sourceFiles);
  const apiSignals = passwordInputReadinessApiSignals(sourceFiles);
  const testSignals = passwordInputReadinessTestSignals(sourceFiles);
  const packageSignals = passwordInputReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.rootCount > 0 && item.inputCount > 0 && item.triggerCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.visibilityCount > 0);
  const hasVisibility = visibilitySignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.visibilityCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.formCount > 0);
  const hasPasswordManager = passwordManagerSignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.passwordManagerCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || passwordInputSetups.some((item) => item.testCount > 0);

  const riskQueue: PasswordInputReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document password input root, label, input, visibility trigger, indicator, and control structure before claiming password input readiness.",
      why: "Password input readiness starts with traceable input and visibility-trigger ownership.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace idle, visible, hidden, disabled, invalid, read-only, and required state.",
      why: "Password inputs can render while visibility, validation, and interactivity state diverge.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasVisibility) {
    riskQueue.push({
      priority: "high",
      action: "Trace default visibility, set/toggle visibility, visibility-change callbacks, trigger clicks, focus return, and password/text type switching.",
      why: "Password input regressions commonly expose secret text, lose focus, or desynchronize trigger state.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Trace form reset, form submit, name, autocomplete, and required semantics.",
      why: "Password visibility should reset around form lifecycle while preserving form association and browser autocomplete behavior.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasPasswordManager) {
    riskQueue.push({
      priority: "medium",
      action: "Document whether password-manager ignore attributes are intentionally used or avoided.",
      why: "Password managers affect sign-in reliability, autofill privacy, and user expectations.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify aria-label, aria-controls, aria-expanded, aria-invalid, aria-hidden, data state, disabled, invalid, and read-only semantics.",
      why: "Visibility buttons must expose whether the password is shown and which input they control.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, reset, submit, visibility, aria, and artifact tests for password input traces.",
      why: "Static password input evidence does not prove visibility state, form lifecycle, or accessibility behavior.",
      relatedHref: "html/password-input-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real show/hide behavior, focus return, form reset/submit hiding, password-manager behavior, accessibility tree, and project tests outside RepoTutor.",
    why: "RepoTutor records password input readiness only; it does not reveal or hide real passwords, focus live inputs, reset or submit forms, click visibility triggers, mutate password-manager attributes, or run analyzed project tests.",
    relatedHref: "html/password-input-readiness.html"
  });

  return {
    summary: `Password input readiness report: setup ${passwordInputSetups.length} files, machine signal ${machineSignals.length}, API signal ${apiSignals.length}, visibility signal ${visibilitySignals.length}, form signal ${formSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`,
    sourcePattern: "Password input readiness Zag password-input visibility trigger form reset submit password manager accessibility tests",
    passwordInputSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    visibilitySignals,
    formSignals,
    passwordManagerSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/password-input|passwordInput\\.machine|password-input\\.machine|getVisibilityTriggerProps|getInputProps|getIndicatorProps\" package.json src app packages", purpose: "Find Zag password-input machine, connect API, input, indicator, and visibility trigger props." },
      { command: "rg \"visible|defaultVisible|VISIBILITY\\.SET|TRIGGER\\.CLICK|onVisibilityChange|setVisible|toggleVisible|type=.*password|type=.*text\" src app packages", purpose: "Trace visibility state, trigger events, callback wiring, and password/text type switching." },
      { command: "rg \"trackFormEvents|form.*reset|form.*submit|onReset|onSubmit|name=|autoComplete|autocomplete|required\" src app packages", purpose: "Check reset/submit visibility hiding, form association, autocomplete, and required semantics." },
      { command: "rg \"ignorePasswordManagers|data-1p-ignore|data-lpignore|data-bwignore|data-form-type|data-protonpass-ignore|aria-controls|aria-expanded|aria-label|aria-invalid|pointer-test|reset-test|submit-test|visibility-test|upload-artifact\" src app packages test tests .github", purpose: "Check password-manager policy, accessibility semantics, tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag password-input, native password inputs, or custom show/hide password controls.",
      "Trace root, label, input, visibility trigger, indicator, and control anatomy before reviewing behavior.",
      "Map visible/defaultVisible, setVisible/toggleVisible, visibility-change callbacks, trigger clicks, focus return, and password/text type switching.",
      "Check form reset/submit hiding, name/autocomplete/required semantics, password-manager attributes, ARIA/data state, and tests.",
      "This report is static readiness. Real show/hide behavior, live focus, form lifecycle, password-manager behavior, accessibility tree, and project tests need trusted QA."
    ]
  };
}

type PasswordInputReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function passwordInputReadinessSourceFiles(walk: WalkResult): Promise<PasswordInputReadinessSourceFile[]> {
  const files: PasswordInputReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !passwordInputReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!passwordInputReadinessPathSignal(file.relPath) && !passwordInputReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function passwordInputReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return passwordInputReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function passwordInputReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(password-input|password|credentials?|login|signin|auth|account|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function passwordInputReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/password-input|password-input\.machine|passwordInput\.machine|getVisibilityTriggerProps|VISIBILITY\.SET|TRIGGER\.CLICK|ignorePasswordManagers|data-1p-ignore|type\s*=\s*["']password["'])/i.test(text);
}

function passwordInputReadinessSetups(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["passwordInputSetups"] {
  const rows: PasswordInputReadinessReport["passwordInputSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(password-input\.machine|passwordInput\.machine|passwordInput\.connect|getRootProps|data-password-input-root|password-input-root|password input root)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label|htmlFor|aria-labelledby|label)/gi);
    const inputCount = countMatches(source.text, /(getInputProps|<input|type\s*=\s*["']password["']|type:\s*["']password["']|autoComplete|autocomplete|current-password|new-password)/gi);
    const triggerCount = countMatches(source.text, /(getVisibilityTriggerProps|visibilityTrigger|TRIGGER\.CLICK|Show password|Hide password|aria-expanded|visibility trigger)/gi);
    const indicatorCount = countMatches(source.text, /(getIndicatorProps|indicator|aria-hidden|data-state|visible|hidden)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-part=['"]control|control)/gi);
    const visibilityCount = countMatches(source.text, /(visible|defaultVisible|default-visible|VISIBILITY\.SET|TRIGGER\.CLICK|setVisible|toggleVisible|toggleVisibility|setVisibility|onVisibilityChange|visibility-change|trigger-click|focusInputEl|focus-input|type-switch|type\s*=\s*["']text["']|type:\s*["']text["'])/gi);
    const formCount = countMatches(source.text, /(trackFormEvents|form\.addEventListener|form-reset|form-submit|onReset|onSubmit|\breset\b|\bsubmit\b|\bname=|name:\s*|autoComplete|autocomplete|required)/gi);
    const passwordManagerCount = countMatches(source.text, /(ignorePasswordManagers|password-manager-ignore|data-1p-ignore|data-lpignore|data-bwignore|data-form-type|data-protonpass-ignore|1Password|LastPass|Bitwarden|Dashlane|Proton Pass)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|aria-controls|aria-expanded|aria-invalid|aria-hidden|data-state|data-disabled|data-invalid|data-readonly|data-required|getByLabelText|getByRole)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|pointer-test|reset-test|submit-test|visibility-test|aria-test|password-input-traces|upload-artifact)/gi);
    const total = rootCount + labelCount + inputCount + triggerCount + indicatorCount + controlCount + visibilityCount + formCount + passwordManagerCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && labelCount > 0 && inputCount > 0 && triggerCount > 0 && indicatorCount > 0 && controlCount > 0 && visibilityCount > 0 && formCount > 0 && passwordManagerCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: passwordInputReadinessFramework(source),
      rootCount,
      labelCount,
      inputCount,
      triggerCount,
      indicatorCount,
      controlCount,
      visibilityCount,
      formCount,
      passwordManagerCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, input ${inputCount}, trigger ${triggerCount}, indicator ${indicatorCount}, control ${controlCount}, visibility ${visibilityCount}, form ${formCount}, password-manager ${passwordManagerCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.visibilityCount + b.formCount + b.accessibilityCount - (a.visibilityCount + a.formCount + a.accessibilityCount));
}

function passwordInputReadinessFramework(source: PasswordInputReadinessSourceFile): PasswordInputReadinessReport["passwordInputSetups"][number]["framework"] {
  if (/@zag-js\/password-input|password-input\.machine|passwordInput\.machine|getVisibilityTriggerProps|getInputProps/i.test(source.text)) return "zag-password-input";
  if (/type\s*=\s*["']password["']|type:\s*["']password["']|autoComplete|autocomplete/i.test(source.text)) return "native-password-input";
  if (/password|credential|show password|hide password|visibility/i.test(source.text)) return "custom";
  return "unknown";
}

function passwordInputReadinessFrameworkSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-password-input", pattern: /@zag-js\/password-input|password-input\.machine|passwordInput\.machine|getVisibilityTriggerProps|getInputProps/i, evidence: "Zag password-input evidence was detected." },
    { signal: "native-password-input", pattern: /type\s*=\s*["']password["']|type:\s*["']password["']|autoComplete|autocomplete/i, evidence: "native password input evidence was detected." },
    { signal: "custom", pattern: /show password|hide password|password visibility|credential/i, evidence: "custom password input evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function passwordInputReadinessStructureSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["structureSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-password-input-root|password-input\.machine|passwordInput\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor/i, evidence: "label evidence was detected." },
    { signal: "input", pattern: /getInputProps|<input|type\s*=\s*["']password["']|autoComplete|autocomplete/i, evidence: "input evidence was detected." },
    { signal: "visibility-trigger", pattern: /getVisibilityTriggerProps|visibilityTrigger|Show password|Hide password|aria-expanded/i, evidence: "visibility trigger evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|indicator|aria-hidden|data-state/i, evidence: "indicator evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control|control/i, evidence: "control evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function passwordInputReadinessStateSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["stateSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b|initialState/i, evidence: "idle state evidence was detected." },
    { signal: "visible", pattern: /\bvisible\b|data-state=['"]visible/i, evidence: "visible state evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b|data-state=['"]hidden/i, evidence: "hidden state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "invalid", pattern: /\binvalid\b|aria-invalid|data-invalid/i, evidence: "invalid evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|readonly|data-readonly/i, evidence: "read-only evidence was detected." },
    { signal: "required", pattern: /\brequired\b|data-required/i, evidence: "required evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function passwordInputReadinessVisibilitySignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["visibilitySignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["visibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "default-visible", pattern: /defaultVisible|default-visible/i, evidence: "default visible evidence was detected." },
    { signal: "set-visible", pattern: /setVisible|setVisibility|VISIBILITY\.SET|set-visible/i, evidence: "set visible evidence was detected." },
    { signal: "toggle-visible", pattern: /toggleVisible|toggleVisibility|toggle-visible/i, evidence: "toggle visible evidence was detected." },
    { signal: "visibility-change", pattern: /onVisibilityChange|visibility-change/i, evidence: "visibility change evidence was detected." },
    { signal: "trigger-click", pattern: /TRIGGER\.CLICK|trigger-click|onPointerDown|user\.click/i, evidence: "trigger click evidence was detected." },
    { signal: "focus-input", pattern: /focusInputEl|focus\(\)|focus-input|getInputEl/i, evidence: "input focus evidence was detected." },
    { signal: "type-switch", pattern: /type:\s*visible\s*\?|type\s*=\s*["']text["']|type\s*=\s*["']password["']|type-switch/i, evidence: "password/text type switch evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "visibility", "signal");
}

function passwordInputReadinessFormSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["formSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "form-reset", pattern: /trackFormEvents|form\.addEventListener\([^)]*reset|onReset|form-reset|\breset\b/i, evidence: "form reset evidence was detected." },
    { signal: "form-submit", pattern: /trackFormEvents|form\.addEventListener\([^)]*submit|onSubmit|form-submit|\bsubmit\b/i, evidence: "form submit evidence was detected." },
    { signal: "name", pattern: /\bname=|name:\s*|prop\(["']name/i, evidence: "name evidence was detected." },
    { signal: "auto-complete", pattern: /autoComplete|autocomplete|current-password|new-password/i, evidence: "autocomplete evidence was detected." },
    { signal: "required", pattern: /\brequired\b|data-required/i, evidence: "required evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function passwordInputReadinessPasswordManagerSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["passwordManagerSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["passwordManagerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ignore-password-managers", pattern: /ignorePasswordManagers|password-manager-ignore/i, evidence: "password-manager ignore policy evidence was detected." },
    { signal: "one-password", pattern: /data-1p-ignore|1Password/i, evidence: "1Password ignore evidence was detected." },
    { signal: "lastpass", pattern: /data-lpignore|LastPass/i, evidence: "LastPass ignore evidence was detected." },
    { signal: "bitwarden", pattern: /data-bwignore|Bitwarden/i, evidence: "Bitwarden ignore evidence was detected." },
    { signal: "dashlane", pattern: /data-form-type|Dashlane/i, evidence: "Dashlane ignore evidence was detected." },
    { signal: "proton-pass", pattern: /data-protonpass-ignore|Proton Pass/i, evidence: "Proton Pass ignore evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "password manager", "signal");
}

function passwordInputReadinessAccessibilitySignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|getByLabelText/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded|toHaveAttribute\(["']aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-invalid", pattern: /data-invalid/i, evidence: "data-invalid evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function passwordInputReadinessMachineSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["machineSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<PasswordInputSchema>|createMachine\s+PasswordInputSchema/i, evidence: "Zag password-input createMachine evidence was detected." },
    { signal: "default-visible", pattern: /defaultVisible[\s\S]{0,120}false|defaultVisible false|default-visible/i, evidence: "defaultVisible false evidence was detected." },
    { signal: "default-autocomplete", pattern: /autoComplete[\s\S]{0,120}current-password|autoComplete current-password|default-autocomplete/i, evidence: "default autocomplete evidence was detected." },
    { signal: "ignore-password-managers-default", pattern: /ignorePasswordManagers[\s\S]{0,120}false|ignorePasswordManagers false|ignore-password-managers-default/i, evidence: "ignorePasswordManagers default evidence was detected." },
    { signal: "translations", pattern: /translations[\s\S]{0,160}visibilityTrigger|translations visibilityTrigger/i, evidence: "visibility trigger translation evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,120}idle|states[\s\S]{0,120}idle|initialState idle/i, evidence: "idle initial state evidence was detected." },
    { signal: "visibility-set-event", pattern: /VISIBILITY\.SET/i, evidence: "VISIBILITY.SET event evidence was detected." },
    { signal: "trigger-click-event", pattern: /TRIGGER\.CLICK/i, evidence: "TRIGGER.CLICK event evidence was detected." },
    { signal: "track-form-events-effect", pattern: /effects[\s\S]{0,120}trackFormEvents|effects trackFormEvents/i, evidence: "trackFormEvents machine effect evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function passwordInputReadinessContextSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["contextSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "visible-context", pattern: /visible\s*:\s*bindable|visible bindable|context[\s\S]{0,180}visible/i, evidence: "visible bindable context evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function passwordInputReadinessEffectSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["effectSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-form-events", pattern: /trackFormEvents/i, evidence: "trackFormEvents effect evidence was detected." },
    { signal: "form-reset-listener", pattern: /form\.addEventListener[\s\S]{0,120}reset|form\.addEventListener reset|onReset|form-reset/i, evidence: "form reset listener evidence was detected." },
    { signal: "form-submit-listener", pattern: /form\.addEventListener[\s\S]{0,120}submit|form\.addEventListener submit|onSubmit|form-submit/i, evidence: "form submit listener evidence was detected." },
    { signal: "abort-controller", pattern: /AbortController|controller\.abort/i, evidence: "AbortController cleanup evidence was detected." },
    { signal: "reset-hides", pattern: /reset[\s\S]{0,160}VISIBILITY\.SET[\s\S]{0,80}false|reset[\s\S]{0,120}setVisible\(false\)|reset-hides/i, evidence: "reset hides visibility evidence was detected." },
    { signal: "submit-hides", pattern: /submit[\s\S]{0,160}VISIBILITY\.SET[\s\S]{0,80}false|submit[\s\S]{0,120}setVisible\(false\)|submit-hides/i, evidence: "submit hides visibility evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function passwordInputReadinessActionSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["actionSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-visibility", pattern: /setVisibility|setVisible|VISIBILITY\.SET/i, evidence: "set visibility action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility|toggleVisible/i, evidence: "toggle visibility action evidence was detected." },
    { signal: "focus-input-el", pattern: /focusInputEl|inputEl\.focus|focusInput/i, evidence: "focus input element action evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function passwordInputReadinessDomSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["domSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id helper evidence was detected." },
    { signal: "input-id", pattern: /getInputId/i, evidence: "input id helper evidence was detected." },
    { signal: "input-el", pattern: /getInputEl/i, evidence: "input element helper evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function passwordInputReadinessApiSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["apiSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "visible", pattern: /\bvisible\b/i, evidence: "visible API evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled/i, evidence: "disabled API evidence was detected." },
    { signal: "invalid", pattern: /\binvalid\b|aria-invalid|data-invalid/i, evidence: "invalid API evidence was detected." },
    { signal: "focus", pattern: /\bfocus\(\)|api\.focus|focusInputEl/i, evidence: "focus API evidence was detected." },
    { signal: "set-visible", pattern: /setVisible|setVisibility|VISIBILITY\.SET/i, evidence: "setVisible API evidence was detected." },
    { signal: "toggle-visible", pattern: /toggleVisible|toggleVisibility/i, evidence: "toggleVisible API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "input-props", pattern: /getInputProps/i, evidence: "input props API evidence was detected." },
    { signal: "visibility-trigger-props", pattern: /getVisibilityTriggerProps/i, evidence: "visibility trigger props API evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "type-switch", pattern: /type:\s*visible\s*\?|type visible text password|type password text|type\s*=\s*["']password["']|type\s*=\s*["']text["']|type-switch/i, evidence: "password/text type switch API evidence was detected." },
    { signal: "password-manager-props", pattern: /passwordManagerProps|ignorePasswordManagers|data-1p-ignore|data-lpignore|data-bwignore|data-form-type|data-protonpass-ignore/i, evidence: "password manager props API evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls API evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded API evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria-label API evidence was detected." },
    { signal: "aria-invalid", pattern: /aria-invalid/i, evidence: "aria-invalid API evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "data-invalid", pattern: /data-invalid/i, evidence: "data-invalid API evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly API evidence was detected." },
    { signal: "button-type", pattern: /type:\s*["']button|button type|<button/i, evidence: "button type API evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tabIndex API evidence was detected." },
    { signal: "left-click", pattern: /isLeftClick|left-click|left click|onPointerDown/i, evidence: "left click trigger evidence was detected." },
    { signal: "read-only-api", pattern: /readOnly|read-only|readonly|data-readonly/i, evidence: "readOnly API evidence was detected." },
    { signal: "required-prop", pattern: /\brequired\b|prop\(["']required["']\)/i, evidence: "required prop API evidence was detected." },
    { signal: "data-required", pattern: /data-required/i, evidence: "data-required API evidence was detected." },
    { signal: "auto-capitalize-off", pattern: /autoCapitalize:\s*["']off["']|autoCapitalize off/i, evidence: "autoCapitalize off API evidence was detected." },
    { signal: "spell-check-false", pattern: /spellCheck:\s*false|spellCheck false/i, evidence: "spellCheck false API evidence was detected." },
    { signal: "prevent-default", pattern: /preventDefault\(\)|preventDefault/i, evidence: "preventDefault trigger evidence was detected." },
    { signal: "interactive-guard", pattern: /\binteractive\b|!\(readOnly\s*\|\|\s*disabled\)|readOnly\s*\|\|\s*disabled/i, evidence: "interactive trigger guard evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function passwordInputReadinessTestSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["testSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /user\.click|pointer-test|onPointerDown/i, evidence: "pointer test evidence was detected." },
    { signal: "reset-test", pattern: /reset-test|form-reset|onReset|\breset\b/i, evidence: "reset test evidence was detected." },
    { signal: "submit-test", pattern: /submit-test|form-submit|onSubmit|\bsubmit\b/i, evidence: "submit test evidence was detected." },
    { signal: "visibility-test", pattern: /visibility-test|Show password|Hide password|aria-expanded/i, evidence: "visibility test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|toHaveAttribute|getByLabelText|getByRole/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|password-input-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function passwordInputReadinessPackageSignals(sourceFiles: PasswordInputReadinessSourceFile[]): PasswordInputReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PasswordInputReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/password-input", pattern: /@zag-js\/password-input/i, evidence: "@zag-js/password-input dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react adapter evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return passwordInputReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function passwordInputReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PasswordInputReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/password-input-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSignaturePadReadinessReport(walk: WalkResult): Promise<SignaturePadReadinessReport> {
  const sourceFiles = await signaturePadReadinessSourceFiles(walk);
  const signaturePadSetups = signaturePadReadinessSetups(sourceFiles);
  const frameworkSignals = signaturePadReadinessFrameworkSignals(sourceFiles);
  const structureSignals = signaturePadReadinessStructureSignals(sourceFiles);
  const stateSignals = signaturePadReadinessStateSignals(sourceFiles);
  const drawingSignals = signaturePadReadinessDrawingSignals(sourceFiles);
  const outputSignals = signaturePadReadinessOutputSignals(sourceFiles);
  const formSignals = signaturePadReadinessFormSignals(sourceFiles);
  const accessibilitySignals = signaturePadReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = signaturePadReadinessMachineSignals(sourceFiles);
  const contextSignals = signaturePadReadinessContextSignals(sourceFiles);
  const computedSignals = signaturePadReadinessComputedSignals(sourceFiles);
  const effectSignals = signaturePadReadinessEffectSignals(sourceFiles);
  const actionSignals = signaturePadReadinessActionSignals(sourceFiles);
  const domSignals = signaturePadReadinessDomSignals(sourceFiles);
  const apiSignals = signaturePadReadinessApiSignals(sourceFiles);
  const testSignals = signaturePadReadinessTestSignals(sourceFiles);
  const packageSignals = signaturePadReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.controlCount > 0 && item.segmentCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.drawingCount > 0);
  const hasDrawing = drawingSignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.drawingCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.outputCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.formCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || signaturePadSetups.some((item) => item.testCount > 0);

  const riskQueue: SignaturePadReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document signature pad root, label, drawing control, SVG segment, guide, clear trigger, and hidden input structure.",
      why: "Signature pad readiness starts with traceable drawing ownership and form output.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace idle, drawing, empty, disabled, read-only, required, and interactive state.",
      why: "Canvas-style controls can look available while disabled, read-only, or empty state blocks valid form submission.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasDrawing) {
    riskQueue.push({
      priority: "high",
      action: "Trace pointer down/move/up, points, paths, pressure, perfect-freehand, and stroke option handling.",
      why: "Signature capture depends on pointer ownership, stroke sampling, pressure, and path generation.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasOutput) {
    riskQueue.push({
      priority: "high",
      action: "Trace SVG path output, data URL types, quality, clear behavior, draw callbacks, and draw-end callbacks.",
      why: "A signature pad is incomplete unless consumers can store, clear, and export the captured signature.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Trace hidden input value, name, required, and read-only semantics.",
      why: "Visual signatures need an explicit form value path for submission and validation.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify label association, role application, roledescription, aria-disabled, tab index, and data state semantics.",
      why: "Drawing controls need accessible labeling and keyboard focus boundaries even when pointer drawing is primary.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, clear, data URL, hidden input, ARIA, and artifact tests for signature pad traces.",
      why: "Static signature pad evidence does not prove pointer capture, export behavior, form wiring, or accessibility.",
      relatedHref: "html/signature-pad-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live pointer drawing, SVG path shape, data URL export, clear behavior, hidden input submission, and accessibility tree outside RepoTutor.",
    why: "RepoTutor records signature pad readiness only; it does not draw real strokes, capture pointers, export real canvas data, mutate form values, clear user signatures, or run analyzed project tests.",
    relatedHref: "html/signature-pad-readiness.html"
  });

  return {
    summary: `Signature pad readiness report: setup ${signaturePadSetups.length} files, machine signal ${machineSignals.length}, API signal ${apiSignals.length}, drawing signal ${drawingSignals.length}, output signal ${outputSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`,
    sourcePattern: "Signature pad readiness Zag signature-pad drawing paths pointer data URL hidden input accessibility tests",
    signaturePadSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    drawingSignals,
    outputSignals,
    formSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/signature-pad|signaturePad\\.machine|getControlProps|getSegmentProps|getHiddenInputProps\" package.json src app packages", purpose: "Find Zag signature-pad machine, drawing control, SVG segment, and hidden input wiring." },
      { command: "rg \"POINTER_DOWN|POINTER_MOVE|POINTER_UP|currentPoints|currentPath|paths|pressure|perfect-freehand|stroke\" src app packages", purpose: "Trace pointer drawing, path sampling, pressure, and stroke option handling." },
      { command: "rg \"getDataUrl|image/png|image/jpeg|image/svg\\+xml|clear\\(|onDraw|onDrawEnd|CLEAR|svg path\" src app packages", purpose: "Check export types, clear behavior, and draw callback wiring." },
      { command: "rg \"hidden input|type=.*text|name=|required|readOnly|aria-roledescription|role=.*application|aria-disabled|signature-pad-traces|upload-artifact\" src app packages test tests .github", purpose: "Check hidden input form wiring, accessibility semantics, tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag signature-pad, a native canvas/SVG signature component, or custom drawing logic.",
      "Trace root, label, control, SVG segment, segment path, guide, clear trigger, and hidden input anatomy before reviewing behavior.",
      "Map pointer down/move/up, current points, current path, paths, pressure, perfect-freehand, and stroke options.",
      "Check SVG path output, data URL export types, quality, clear behavior, draw callbacks, hidden input value/name/required semantics, ARIA/data state, and tests.",
      "This report is static readiness. Real drawing, pointer capture, export output, form submission, clear behavior, accessibility tree, and project tests need trusted QA."
    ]
  };
}

type SignaturePadReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function signaturePadReadinessSourceFiles(walk: WalkResult): Promise<SignaturePadReadinessSourceFile[]> {
  const files: SignaturePadReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !signaturePadReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!signaturePadReadinessPathSignal(file.relPath) && !signaturePadReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function signaturePadReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return signaturePadReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function signaturePadReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(signature-pad|signature|canvas|drawing|forms?|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function signaturePadReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/signature-pad|signaturePad\.machine|getControlProps|getSegmentProps|getHiddenInputProps|POINTER_DOWN|POINTER_MOVE|POINTER_UP|getDataUrl|perfect-freehand|aria-roledescription=['"]signature pad)/i.test(text);
}

function signaturePadReadinessSetups(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["signaturePadSetups"] {
  const rows: SignaturePadReadinessReport["signaturePadSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(signaturePad\.machine|signaturePad\.connect|getRootProps|data-part=['"]root|signature pad root)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label|htmlFor|label)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-part=['"]control|role=['"]application|signature control|control)/gi);
    const segmentCount = countMatches(source.text, /(getSegmentProps|data-part=['"]segment|<svg|segment)/gi);
    const segmentPathCount = countMatches(source.text, /(getSegmentPathProps|data-part=['"]segment-path|<path|svg path|segment-path)/gi);
    const guideCount = countMatches(source.text, /(getGuideProps|data-part=['"]guide|guide|Sign here)/gi);
    const clearTriggerCount = countMatches(source.text, /(getClearTriggerProps|clearTrigger|clear-trigger|clear signature|CLEAR|clear\(\))/gi);
    const hiddenInputCount = countMatches(source.text, /(getHiddenInputProps|hidden input|hiddenInput|type\s*=\s*["']text["']|hidden readOnly|hidden-input)/gi);
    const drawingCount = countMatches(source.text, /(POINTER_DOWN|POINTER_MOVE|POINTER_UP|pointer-down|pointer-move|pointer-up|currentPoints|current-points|currentPath|current-path|\bpaths\b|pressure|perfect-freehand|getStroke|stroke-options|drawing|simulatePressure|thinning|smoothing|streamline|size:)/gi);
    const outputCount = countMatches(source.text, /(getSvgPathFromStroke|svg-path|getDataUrl|data-url|image\/png|image\/jpeg|image\/svg\+xml|quality|onDraw|onDrawEnd|draw-callback|draw-end-callback|clear\(\)|CLEAR)/gi);
    const formCount = countMatches(source.text, /(getHiddenInputProps|hidden-input|\bname=|name:\s*|\brequired\b|\bvalue=|value:\s*|readOnly|readonly|form)/gi);
    const accessibilityCount = countMatches(source.text, /(aria-label|aria-roledescription|aria-disabled|data-disabled|data-required|role=['"]application|role-application|tabIndex|tab-index|htmlFor|label-for)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|pointer-test|clear-test|data-url-test|hidden-input-test|aria-test|signature-pad-traces|upload-artifact)/gi);
    const total = rootCount + labelCount + controlCount + segmentCount + segmentPathCount + guideCount + clearTriggerCount + hiddenInputCount + drawingCount + outputCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && labelCount > 0 && controlCount > 0 && segmentCount > 0 && segmentPathCount > 0 && guideCount > 0 && clearTriggerCount > 0 && hiddenInputCount > 0 && drawingCount > 0 && outputCount > 0 && formCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: signaturePadReadinessFramework(source),
      rootCount,
      labelCount,
      controlCount,
      segmentCount,
      segmentPathCount,
      guideCount,
      clearTriggerCount,
      hiddenInputCount,
      drawingCount,
      outputCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, control ${controlCount}, segment ${segmentCount}, segment path ${segmentPathCount}, guide ${guideCount}, clear trigger ${clearTriggerCount}, hidden input ${hiddenInputCount}, drawing ${drawingCount}, output ${outputCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.drawingCount + b.outputCount + b.accessibilityCount - (a.drawingCount + a.outputCount + a.accessibilityCount));
}

function signaturePadReadinessFramework(source: SignaturePadReadinessSourceFile): SignaturePadReadinessReport["signaturePadSetups"][number]["framework"] {
  if (/@zag-js\/signature-pad|signaturePad\.machine|getSegmentProps|getHiddenInputProps/i.test(source.text)) return "zag-signature-pad";
  if (/<canvas|CanvasRenderingContext2D|<svg|pointerdown|pointermove|pointerup|data-url/i.test(source.text)) return "native-canvas";
  if (/signature|drawing|stroke|clear signature/i.test(source.text)) return "custom";
  return "unknown";
}

function signaturePadReadinessFrameworkSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-signature-pad", pattern: /@zag-js\/signature-pad|signaturePad\.machine|getSegmentProps|getHiddenInputProps/i, evidence: "Zag signature-pad evidence was detected." },
    { signal: "native-canvas", pattern: /<canvas|CanvasRenderingContext2D|<svg|pointerdown|pointermove|pointerup|data-url/i, evidence: "native canvas/SVG signature evidence was detected." },
    { signal: "custom", pattern: /signature|drawing|stroke|clear signature/i, evidence: "custom signature pad evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function signaturePadReadinessStructureSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["structureSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|signature pad root|signaturePad\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control|role=['"]application/i, evidence: "control evidence was detected." },
    { signal: "segment", pattern: /getSegmentProps|data-part=['"]segment|<svg/i, evidence: "segment evidence was detected." },
    { signal: "segment-path", pattern: /getSegmentPathProps|data-part=['"]segment-path|<path|svg path/i, evidence: "segment path evidence was detected." },
    { signal: "guide", pattern: /getGuideProps|data-part=['"]guide|guide|Sign here/i, evidence: "guide evidence was detected." },
    { signal: "clear-trigger", pattern: /getClearTriggerProps|clearTrigger|clear-trigger|clear signature/i, evidence: "clear trigger evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|hidden input|hiddenInput|hidden-input|<input[\s\S]{0,120}hidden/i, evidence: "hidden input evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function signaturePadReadinessStateSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["stateSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "drawing", pattern: /\bdrawing\b|state\.matches\(["']drawing/i, evidence: "drawing state evidence was detected." },
    { signal: "empty", pattern: /\bempty\b|isEmpty/i, evidence: "empty state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled|aria-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|readonly/i, evidence: "read-only evidence was detected." },
    { signal: "required", pattern: /\brequired\b|data-required/i, evidence: "required evidence was detected." },
    { signal: "interactive", pattern: /isInteractive|interactive/i, evidence: "interactive state evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function signaturePadReadinessDrawingSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["drawingSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["drawingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-down", pattern: /POINTER_DOWN|pointer-down|onPointerDown/i, evidence: "pointer down evidence was detected." },
    { signal: "pointer-move", pattern: /POINTER_MOVE|pointer-move|onPointerMove/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-up", pattern: /POINTER_UP|pointer-up|onPointerUp/i, evidence: "pointer up evidence was detected." },
    { signal: "current-points", pattern: /currentPoints|current-points/i, evidence: "current points evidence was detected." },
    { signal: "current-path", pattern: /currentPath|current-path/i, evidence: "current path evidence was detected." },
    { signal: "paths", pattern: /\bpaths\b|defaultPaths/i, evidence: "paths evidence was detected." },
    { signal: "pressure", pattern: /pressure|simulatePressure/i, evidence: "pressure evidence was detected." },
    { signal: "perfect-freehand", pattern: /perfect-freehand|getStroke/i, evidence: "perfect-freehand evidence was detected." },
    { signal: "stroke-options", pattern: /thinning|smoothing|streamline|simulatePressure|size:|fill:/i, evidence: "stroke options evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "drawing", "signal");
}

function signaturePadReadinessOutputSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["outputSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "svg-path", pattern: /getSvgPathFromStroke|svg-path|<path|segment-path/i, evidence: "SVG path evidence was detected." },
    { signal: "data-url", pattern: /getDataUrl|data-url/i, evidence: "data URL evidence was detected." },
    { signal: "png", pattern: /image\/png/i, evidence: "PNG export evidence was detected." },
    { signal: "jpeg", pattern: /image\/jpeg/i, evidence: "JPEG export evidence was detected." },
    { signal: "svg", pattern: /image\/svg\+xml|<svg/i, evidence: "SVG export evidence was detected." },
    { signal: "quality", pattern: /\bquality\b|0\.92|0\.8/i, evidence: "quality evidence was detected." },
    { signal: "clear", pattern: /clear\(\)|CLEAR|clear signature|clearTrigger/i, evidence: "clear evidence was detected." },
    { signal: "draw-callback", pattern: /onDraw\b|invokeOnDraw\b|draw-callback/i, evidence: "draw callback evidence was detected." },
    { signal: "draw-end-callback", pattern: /onDrawEnd|invokeOnDrawEnd|draw-end-callback/i, evidence: "draw end callback evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function signaturePadReadinessFormSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["formSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "name", pattern: /\bname=|name:\s*|prop\(["']name/i, evidence: "name evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|hidden input|hiddenInput|hidden-input|<input[\s\S]{0,120}hidden/i, evidence: "hidden input evidence was detected." },
    { signal: "required", pattern: /\brequired\b|data-required/i, evidence: "required evidence was detected." },
    { signal: "value", pattern: /\bvalue=|value:\s*|props\.value/i, evidence: "value evidence was detected." },
    { signal: "readonly", pattern: /readOnly|readonly/i, evidence: "readonly evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function signaturePadReadinessAccessibilitySignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aria-label", pattern: /aria-label|getByRole\([^)]*name:/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-roledescription", pattern: /aria-roledescription/i, evidence: "aria-roledescription evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-required", pattern: /data-required/i, evidence: "data-required evidence was detected." },
    { signal: "role-application", pattern: /role:\s*["']application|role=['"]application|role-application/i, evidence: "role application evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tab index evidence was detected." },
    { signal: "label-for", pattern: /htmlFor|label-for/i, evidence: "label association evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function signaturePadReadinessMachineSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["machineSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<SignaturePadSchema>|createMachine\s+SignaturePadSchema/i, evidence: "Zag signature-pad createMachine evidence was detected." },
    { signal: "default-paths", pattern: /defaultPaths[\s\S]{0,120}\[\]|defaultPaths/i, evidence: "default paths evidence was detected." },
    { signal: "drawing-defaults", pattern: /drawing[\s\S]{0,220}(size|simulatePressure|thinning|smoothing|streamline)|drawing size simulatePressure/i, evidence: "drawing defaults evidence was detected." },
    { signal: "translations", pattern: /translations[\s\S]{0,180}(control|clearTrigger)|translations control clearTrigger/i, evidence: "translation evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,80}idle|states[\s\S]{0,120}idle|initialState idle/i, evidence: "idle state evidence was detected." },
    { signal: "drawing-state", pattern: /states[\s\S]{0,160}drawing|states idle drawing/i, evidence: "drawing state evidence was detected." },
    { signal: "pointer-down-event", pattern: /POINTER_DOWN/i, evidence: "POINTER_DOWN event evidence was detected." },
    { signal: "pointer-move-event", pattern: /POINTER_MOVE/i, evidence: "POINTER_MOVE event evidence was detected." },
    { signal: "pointer-up-event", pattern: /POINTER_UP/i, evidence: "POINTER_UP event evidence was detected." },
    { signal: "clear-event", pattern: /\bCLEAR\b/i, evidence: "CLEAR event evidence was detected." },
    { signal: "track-pointer-move-effect", pattern: /effects[\s\S]{0,120}trackPointerMove|effects trackPointerMove/i, evidence: "trackPointerMove machine effect evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function signaturePadReadinessContextSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["contextSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "paths-context", pattern: /paths\s*:\s*bindable|paths bindable|defaultPaths[\s\S]{0,160}onDraw/i, evidence: "paths context evidence was detected." },
    { signal: "current-points-context", pattern: /currentPoints\s*:\s*bindable|currentPoints bindable|current-points/i, evidence: "current points context evidence was detected." },
    { signal: "current-path-context", pattern: /currentPath\s*:\s*bindable|currentPath bindable|current-path/i, evidence: "current path context evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function signaturePadReadinessComputedSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["computedSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-interactive", pattern: /isInteractive/i, evidence: "isInteractive evidence was detected." },
    { signal: "is-empty", pattern: /isEmpty/i, evidence: "isEmpty evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function signaturePadReadinessEffectSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["effectSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-pointer-move", pattern: /trackPointerMove/i, evidence: "track pointer move effect evidence was detected." },
    { signal: "get-relative-point", pattern: /getRelativePoint/i, evidence: "relative point evidence was detected." },
    { signal: "pointer-move-send", pattern: /send[\s\S]{0,80}POINTER_MOVE|send POINTER_MOVE/i, evidence: "POINTER_MOVE send evidence was detected." },
    { signal: "pointer-up-send", pattern: /send[\s\S]{0,80}POINTER_UP|send POINTER_UP/i, evidence: "POINTER_UP send evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function signaturePadReadinessActionSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["actionSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "add-point", pattern: /addPoint/i, evidence: "add point action evidence was detected." },
    { signal: "end-stroke", pattern: /endStroke/i, evidence: "end stroke action evidence was detected." },
    { signal: "clear-points", pattern: /clearPoints/i, evidence: "clear points action evidence was detected." },
    { signal: "focus-canvas-el", pattern: /focusCanvasEl|queueMicrotask[\s\S]{0,120}focus/i, evidence: "focus canvas action evidence was detected." },
    { signal: "invoke-on-draw", pattern: /invokeOnDraw\b/i, evidence: "invoke on draw action evidence was detected." },
    { signal: "invoke-on-draw-end", pattern: /invokeOnDrawEnd/i, evidence: "invoke on draw end action evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function signaturePadReadinessDomSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["domSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "control-id", pattern: /getControlId/i, evidence: "control id DOM evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id DOM evidence was detected." },
    { signal: "hidden-input-id", pattern: /getHiddenInputId/i, evidence: "hidden input id DOM evidence was detected." },
    { signal: "control-el", pattern: /getControlEl/i, evidence: "control element DOM evidence was detected." },
    { signal: "segment-el", pattern: /getSegmentEl/i, evidence: "segment element DOM evidence was detected." },
    { signal: "hidden-input-el", pattern: /getHiddenInputEl/i, evidence: "hidden input element DOM evidence was detected." },
    { signal: "data-url", pattern: /getDataUrl|dataUrl/i, evidence: "data URL DOM evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function signaturePadReadinessApiSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["apiSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "empty", pattern: /\bempty\b|isEmpty/i, evidence: "empty API evidence was detected." },
    { signal: "drawing", pattern: /\bdrawing\b/i, evidence: "drawing API evidence was detected." },
    { signal: "current-path", pattern: /currentPath|current-path/i, evidence: "current path API evidence was detected." },
    { signal: "paths", pattern: /\bpaths\b/i, evidence: "paths API evidence was detected." },
    { signal: "clear", pattern: /\bclear\(\)|\bCLEAR\b|clearTrigger/i, evidence: "clear API evidence was detected." },
    { signal: "get-data-url", pattern: /getDataUrl|data-url/i, evidence: "get data URL API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "segment-props", pattern: /getSegmentProps/i, evidence: "segment props API evidence was detected." },
    { signal: "segment-path-props", pattern: /getSegmentPathProps/i, evidence: "segment path props API evidence was detected." },
    { signal: "guide-props", pattern: /getGuideProps/i, evidence: "guide props API evidence was detected." },
    { signal: "clear-trigger-props", pattern: /getClearTriggerProps/i, evidence: "clear trigger props API evidence was detected." },
    { signal: "hidden-input-props", pattern: /getHiddenInputProps/i, evidence: "hidden input props API evidence was detected." },
    { signal: "left-click", pattern: /isLeftClick|left-click/i, evidence: "left click API evidence was detected." },
    { signal: "modifier-key", pattern: /isModifierKey|modifier-key/i, evidence: "modifier key API evidence was detected." },
    { signal: "pointer-capture", pattern: /setPointerCapture|releasePointerCapture|pointer-capture/i, evidence: "pointer capture API evidence was detected." },
    { signal: "role-application", pattern: /role:\s*["']application|role application|role=['"]application/i, evidence: "role application API evidence was detected." },
    { signal: "aria-roledescription", pattern: /aria-roledescription/i, evidence: "aria roledescription API evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria label API evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria disabled API evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tab index API evidence was detected." },
    { signal: "touch-action", pattern: /touchAction|touch-action/i, evidence: "touch action API evidence was detected." },
    { signal: "user-select", pattern: /userSelect|user-select/i, evidence: "user select API evidence was detected." },
    { signal: "button-type", pattern: /type:\s*["']button|button type/i, evidence: "button type API evidence was detected." },
    { signal: "hidden", pattern: /\bhidden\b/i, evidence: "hidden API evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|readonly/i, evidence: "read only API evidence was detected." },
    { signal: "name", pattern: /\bname\b/i, evidence: "name API evidence was detected." },
    { signal: "value", pattern: /\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "data-required", pattern: /data-required/i, evidence: "data-required API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir prop dir/i, evidence: "dir prop API evidence was detected." },
    { signal: "default-prevented", pattern: /defaultPrevented/i, evidence: "defaultPrevented guard evidence was detected." },
    { signal: "clear-trigger-target-guard", pattern: /closest\(\s*["']\[data-part=clear-trigger\]["']\)|data-part=clear-trigger|clear-trigger-target/i, evidence: "clear trigger target guard evidence was detected." },
    { signal: "pointer-events-none", pattern: /pointerEvents:\s*["']none["']|pointerEvents none|pointer-events none/i, evidence: "pointerEvents none API evidence was detected." },
    { signal: "input-type-text", pattern: /type:\s*["']text["']|type text/i, evidence: "hidden input text type API evidence was detected." },
    { signal: "required-prop", pattern: /\brequired\b|prop\(["']required["']\)/i, evidence: "required prop API evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function signaturePadReadinessTestSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["testSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|pointerdown|pointermove|pointerup|onPointer/i, evidence: "pointer test evidence was detected." },
    { signal: "clear-test", pattern: /clear-test|clear signature|user\.click/i, evidence: "clear test evidence was detected." },
    { signal: "data-url-test", pattern: /data-url-test|getDataUrl|data-url/i, evidence: "data URL test evidence was detected." },
    { signal: "hidden-input-test", pattern: /hidden-input-test|hidden input|hiddenInput/i, evidence: "hidden input test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|toHaveAttribute|getByRole|aria-roledescription/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|signature-pad-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function signaturePadReadinessPackageSignals(sourceFiles: SignaturePadReadinessSourceFile[]): SignaturePadReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SignaturePadReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/signature-pad", pattern: /@zag-js\/signature-pad/i, evidence: "@zag-js/signature-pad dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "perfect-freehand", pattern: /perfect-freehand|getStroke/i, evidence: "perfect-freehand dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return signaturePadReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function signaturePadReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SignaturePadReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/signature-pad-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
