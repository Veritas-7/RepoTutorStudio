import path from "node:path";
import type { AngleSliderReadinessReport, CascadeSelectReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildAngleSliderReadinessReport(walk: WalkResult): Promise<AngleSliderReadinessReport> {
  const sourceFiles = await angleSliderReadinessSourceFiles(walk);
  const angleSliderSetups = angleSliderReadinessSetups(sourceFiles);
  const frameworkSignals = angleSliderReadinessFrameworkSignals(sourceFiles);
  const structureSignals = angleSliderReadinessStructureSignals(sourceFiles);
  const stateSignals = angleSliderReadinessStateSignals(sourceFiles);
  const valueSignals = angleSliderReadinessValueSignals(sourceFiles);
  const interactionSignals = angleSliderReadinessInteractionSignals(sourceFiles);
  const angleMathSignals = angleSliderReadinessAngleMathSignals(sourceFiles);
  const formSignals = angleSliderReadinessFormSignals(sourceFiles);
  const accessibilitySignals = angleSliderReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = angleSliderReadinessMachineSignals(sourceFiles);
  const contextSignals = angleSliderReadinessContextSignals(sourceFiles);
  const computedSignals = angleSliderReadinessComputedSignals(sourceFiles);
  const effectSignals = angleSliderReadinessEffectSignals(sourceFiles);
  const actionSignals = angleSliderReadinessActionSignals(sourceFiles);
  const domSignals = angleSliderReadinessDomSignals(sourceFiles);
  const apiSignals = angleSliderReadinessApiSignals(sourceFiles);
  const testSignals = angleSliderReadinessTestSignals(sourceFiles);
  const packageSignals = angleSliderReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.controlCount > 0 && item.thumbCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.stateCount > 0);
  const hasValue = valueSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.valueTextCount > 0);
  const hasInteraction = interactionSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.pointerCount > 0 && item.keyboardCount > 0);
  const hasMath = angleMathSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.angleMathCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.formCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || angleSliderSetups.some((item) => item.testCount > 0);

  const riskQueue: AngleSliderReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document angle slider root, label, control, thumb, value text, marker group, markers, and hidden input structure.",
      why: "Angle slider readiness starts with a traceable radial control, slider thumb, visible value, markers, and form output.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace idle, focused, dragging, disabled, read-only, invalid, and interactive state.",
      why: "Radial sliders can appear interactive while disabled, read-only, invalid, or outside a focused/dragging lifecycle.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasValue) {
    riskQueue.push({
      priority: "high",
      action: "Trace value, value-as-degree, default value, step, min/max, set-value, and value change callbacks.",
      why: "Angle controls need exact degree value semantics before learners can trust visual thumb rotation.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasInteraction) {
    riskQueue.push({
      priority: "high",
      action: "Trace pointer down/move/up, thumb focus/blur, arrow increment/decrement, Home/End, and pointer tracking.",
      why: "Angle slider behavior depends on both pointer and keyboard ownership.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasMath) {
    riskQueue.push({
      priority: "high",
      action: "Trace pointer value, angle, display angle, clamp, constrain, snap-to-step, RTL mirror, and thumb drag offset math.",
      why: "Radial controls can drift when degree math, step snapping, RTL display, or thumb-offset handling is incomplete.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Trace hidden input, submitted name, and synchronized form value.",
      why: "Visual degree selection needs a form value path for submission and verification.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify role slider, ARIA label/linkage, value min/max/now, data state, and tab index semantics.",
      why: "Angle sliders are custom controls and need explicit slider semantics for keyboard and assistive technology users.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasState) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add pointer, keyboard, form, ARIA, marker, and artifact tests for angle slider traces.",
      why: "Static angle slider evidence does not prove drag math, keyboard updates, form synchronization, marker states, or accessibility.",
      relatedHref: "html/angle-slider-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify live pointer dragging, keyboard stepping, degree math, RTL mirroring, hidden input synchronization, marker states, and accessibility tree outside RepoTutor.",
    why: "RepoTutor records angle slider readiness only; it does not drag real pointers, dispatch keyboard updates, compute live degree geometry, mutate hidden form values, validate marker placement, or run analyzed project tests.",
    relatedHref: "html/angle-slider-readiness.html"
  });

  return {
    summary: `Angle slider readiness report: setup ${angleSliderSetups.length} files, machine signal ${machineSignals.length}, API signal ${apiSignals.length}, interaction signal ${interactionSignals.length}, angle math signal ${angleMathSignals.length}, accessibility signal ${accessibilitySignals.length} were summarized from static analysis.`,
    sourcePattern: "Angle slider readiness Zag angle-slider radial dial pointer keyboard degree form accessibility tests",
    angleSliderSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    valueSignals,
    interactionSignals,
    angleMathSignals,
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
      { command: "rg \"@zag-js/angle-slider|angleSlider\\.machine|getControlProps|getThumbProps|getHiddenInputProps\" package.json src app packages", purpose: "Find Zag angle-slider machine, radial control, thumb, and hidden input wiring." },
      { command: "rg \"CONTROL\\.POINTER_DOWN|DOC\\.POINTER_MOVE|DOC\\.POINTER_UP|THUMB\\.ARROW|THUMB\\.HOME|THUMB\\.END|trackPointerMove|pointer-test|keyboard-test\" src app packages test tests", purpose: "Trace pointer and keyboard interaction ownership." },
      { command: "rg \"getPointerValue|getAngle|getDisplayAngle|clampAngle|constrainAngle|snapAngleToStep|mirrorAngle|thumbDragOffset|valueAsDegree\" src app packages", purpose: "Check radial degree math, snapping, RTL mirroring, and thumb offset evidence." },
      { command: "rg \"role=['\\\"]slider|aria-valuemin|aria-valuemax|aria-valuenow|aria-labelledby|type=['\\\"]hidden|marker-group|marker-test|angle-slider-traces|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility, hidden input form wiring, marker state tests, and artifact traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag angle-slider, a native radial dial, or custom angle control logic.",
      "Trace root, label, control, thumb, value text, marker group, markers, and hidden input anatomy before reviewing behavior.",
      "Map idle/focused/dragging state, value/value-as-degree, default value, step, 0-359 bounds, set value, value change, and value change end callbacks.",
      "Check pointer down/move/up, thumb focus/blur, arrow/Home/End keyboard handling, degree math, RTL mirroring, hidden input value/name semantics, slider ARIA/data state, marker states, and tests.",
      "This report is static readiness. Real dragging, keyboard updates, geometry math, hidden input synchronization, marker placement, accessibility tree, and project tests need trusted QA."
    ]
  };
}

type AngleSliderReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function angleSliderReadinessSourceFiles(walk: WalkResult): Promise<AngleSliderReadinessSourceFile[]> {
  const files: AngleSliderReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !angleSliderReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!angleSliderReadinessPathSignal(file.relPath) && !angleSliderReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function angleSliderReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return angleSliderReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function angleSliderReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(angle-slider|angle|radial|dial|hue|color|slider|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function angleSliderReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/angle-slider|angleSlider\.machine|angleSlider\.connect|getThumbProps|getMarkerProps|getHiddenInputProps|valueAsDegree|CONTROL\.POINTER_DOWN|getPointerValue|aria-valuenow)/i.test(text);
}

function angleSliderReadinessSetups(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["angleSliderSetups"] {
  const rows: AngleSliderReadinessReport["angleSliderSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(angleSlider\.machine|angleSlider\.connect|getRootProps|data-part=['"]root|angle slider root)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label|htmlFor|label)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-part=['"]control|role=['"]presentation|angle control|control)/gi);
    const thumbCount = countMatches(source.text, /(getThumbProps|data-part=['"]thumb|role=['"]slider|thumb)/gi);
    const valueTextCount = countMatches(source.text, /(getValueTextProps|valueText|value-text|<output|valueAsDegree|value-as-degree)/gi);
    const markerGroupCount = countMatches(source.text, /(getMarkerGroupProps|markerGroup|marker-group)/gi);
    const markerCount = countMatches(source.text, /(getMarkerProps|data-part=['"]marker|data-state=['"](under-value|over-value|at-value)|marker-test|\bmarkers\b)/gi);
    const hiddenInputCount = countMatches(source.text, /(getHiddenInputProps|hidden input|hiddenInput|hidden-input|type=['"]hidden|type:\s*["']hidden)/gi);
    const stateCount = countMatches(source.text, /\b(idle|focused|dragging|disabled|readOnly|read-only|invalid|interactive)\b|data-disabled|data-invalid|data-readonly/gi);
    const pointerCount = countMatches(source.text, /(CONTROL\.POINTER_DOWN|DOC\.POINTER_MOVE|DOC\.POINTER_UP|pointer-down|pointer-move|pointer-up|onPointerDown|trackPointerMove|pointer-test)/gi);
    const keyboardCount = countMatches(source.text, /(THUMB\.ARROW_INC|THUMB\.ARROW_DEC|THUMB\.HOME|THUMB\.END|ArrowRight|ArrowLeft|ArrowUp|ArrowDown|\bHome\b|\bEnd\b|keyboard-test)/gi);
    const angleMathCount = countMatches(source.text, /(getPointerValue|pointer-value|getAngle|\bangle\b|getDisplayAngle|display-angle|clampAngle|clamp-angle|constrainAngle|constrain-angle|snapAngleToStep|snap-angle-to-step|mirrorAngle|mirror-angle|thumbDragOffset|thumb-drag-offset|MIN_VALUE|MAX_VALUE|0 359)/gi);
    const formCount = countMatches(source.text, /(getHiddenInputProps|hidden-input|type=['"]hidden|\bname=|name:\s*|\bvalue=|value:\s*|form-value|<form)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]slider|role-slider|aria-label|aria-labelledby|aria-valuemin|aria-valuemax|aria-valuenow|data-disabled|data-invalid|data-readonly|tabIndex|tab-index)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.keyboard|pointer-test|keyboard-test|form-test|aria-test|marker-test|angle-slider-traces|upload-artifact)/gi);
    const total = rootCount + labelCount + controlCount + thumbCount + valueTextCount + markerGroupCount + markerCount + hiddenInputCount + stateCount + pointerCount + keyboardCount + angleMathCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && labelCount > 0 && controlCount > 0 && thumbCount > 0 && valueTextCount > 0 && markerGroupCount > 0 && markerCount > 0 && hiddenInputCount > 0 && stateCount > 0 && pointerCount > 0 && keyboardCount > 0 && angleMathCount > 0 && formCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: angleSliderReadinessFramework(source),
      rootCount,
      labelCount,
      controlCount,
      thumbCount,
      valueTextCount,
      markerGroupCount,
      markerCount,
      hiddenInputCount,
      stateCount,
      pointerCount,
      keyboardCount,
      angleMathCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, control ${controlCount}, thumb ${thumbCount}, value text ${valueTextCount}, marker group ${markerGroupCount}, marker ${markerCount}, hidden input ${hiddenInputCount}, state ${stateCount}, pointer ${pointerCount}, keyboard ${keyboardCount}, angle math ${angleMathCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.pointerCount + b.keyboardCount + b.angleMathCount + b.accessibilityCount - (a.pointerCount + a.keyboardCount + a.angleMathCount + a.accessibilityCount));
}

function angleSliderReadinessFramework(source: AngleSliderReadinessSourceFile): AngleSliderReadinessReport["angleSliderSetups"][number]["framework"] {
  if (/@zag-js\/angle-slider|angleSlider\.machine|angleSlider\.connect|getThumbProps|getMarkerProps/i.test(source.text)) return "zag-angle-slider";
  if (/radial dial|data-part=['"]thumb|role=['"]slider|aria-valuenow|value-as-degree/i.test(source.text)) return "native-angle-dial";
  if (/angle slider|angle control|hue angle|radial|dial/i.test(source.text)) return "custom";
  return "unknown";
}

function angleSliderReadinessFrameworkSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-angle-slider", pattern: /@zag-js\/angle-slider|angleSlider\.machine|angleSlider\.connect|getThumbProps|getMarkerProps/i, evidence: "Zag angle-slider evidence was detected." },
    { signal: "native-angle-dial", pattern: /radial dial|data-part=['"]thumb|role=['"]slider|aria-valuenow|value-as-degree/i, evidence: "native angle dial evidence was detected." },
    { signal: "custom", pattern: /angle slider|angle control|hue angle|radial|dial/i, evidence: "custom angle slider evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function angleSliderReadinessStructureSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["structureSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|angleSlider\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control|role=['"]presentation/i, evidence: "control evidence was detected." },
    { signal: "thumb", pattern: /getThumbProps|data-part=['"]thumb|role=['"]slider/i, evidence: "thumb evidence was detected." },
    { signal: "value-text", pattern: /getValueTextProps|valueText|value-text|<output|valueAsDegree/i, evidence: "value text evidence was detected." },
    { signal: "marker-group", pattern: /getMarkerGroupProps|markerGroup|marker-group/i, evidence: "marker group evidence was detected." },
    { signal: "marker", pattern: /getMarkerProps|data-part=['"]marker|data-state=['"](under-value|over-value|at-value)|marker-test/i, evidence: "marker evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|hiddenInput|hidden-input|type=['"]hidden|type:\s*["']hidden/i, evidence: "hidden input evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function angleSliderReadinessStateSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["stateSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "focused", pattern: /\bfocused\b|THUMB\.FOCUS/i, evidence: "focused state evidence was detected." },
    { signal: "dragging", pattern: /\bdragging\b|DOC\.POINTER_MOVE/i, evidence: "dragging state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|data-readonly/i, evidence: "read-only evidence was detected." },
    { signal: "invalid", pattern: /\binvalid\b|data-invalid/i, evidence: "invalid evidence was detected." },
    { signal: "interactive", pattern: /\binteractive\b|computed\(["']interactive/i, evidence: "interactive evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function angleSliderReadinessValueSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["valueSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|context\.get\(["']value/i, evidence: "value evidence was detected." },
    { signal: "value-as-degree", pattern: /valueAsDegree|value-as-degree|deg/i, evidence: "value-as-degree evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default-value/i, evidence: "default value evidence was detected." },
    { signal: "step", pattern: /\bstep\b|snapAngleToStep|snap-angle-to-step/i, evidence: "step evidence was detected." },
    { signal: "min-max", pattern: /MIN_VALUE|MAX_VALUE|aria-valuemin|aria-valuemax|0 359|0-359/i, evidence: "min/max evidence was detected." },
    { signal: "set-value", pattern: /VALUE\.SET|setValue\(|set-value/i, evidence: "set value evidence was detected." },
    { signal: "on-value-change", pattern: /onValueChange\b|on-value-change/i, evidence: "value change callback evidence was detected." },
    { signal: "on-value-change-end", pattern: /onValueChangeEnd|invokeOnChangeEnd|on-value-change-end/i, evidence: "value change end callback evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function angleSliderReadinessInteractionSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["interactionSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["interactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-down", pattern: /CONTROL\.POINTER_DOWN|pointer-down|onPointerDown/i, evidence: "pointer down evidence was detected." },
    { signal: "pointer-move", pattern: /DOC\.POINTER_MOVE|pointer-move|onPointerMove/i, evidence: "pointer move evidence was detected." },
    { signal: "pointer-up", pattern: /DOC\.POINTER_UP|pointer-up|onPointerUp/i, evidence: "pointer up evidence was detected." },
    { signal: "thumb-focus", pattern: /THUMB\.FOCUS|thumb-focus|focusThumb|onFocus/i, evidence: "thumb focus evidence was detected." },
    { signal: "thumb-blur", pattern: /THUMB\.BLUR|thumb-blur|onBlur/i, evidence: "thumb blur evidence was detected." },
    { signal: "arrow-inc", pattern: /THUMB\.ARROW_INC|arrow-inc|ArrowRight|ArrowDown/i, evidence: "arrow increment evidence was detected." },
    { signal: "arrow-dec", pattern: /THUMB\.ARROW_DEC|arrow-dec|ArrowLeft|ArrowUp/i, evidence: "arrow decrement evidence was detected." },
    { signal: "home", pattern: /THUMB\.HOME|\bHome\b/i, evidence: "Home key evidence was detected." },
    { signal: "end", pattern: /THUMB\.END|\bEnd\b/i, evidence: "End key evidence was detected." },
    { signal: "track-pointer", pattern: /trackPointerMove|pointer-test/i, evidence: "pointer tracking evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "interaction", "signal");
}

function angleSliderReadinessAngleMathSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["angleMathSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["angleMathSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pointer-value", pattern: /getPointerValue|pointer-value/i, evidence: "pointer value evidence was detected." },
    { signal: "angle", pattern: /getAngle|\bangle\b/i, evidence: "angle evidence was detected." },
    { signal: "display-angle", pattern: /getDisplayAngle|display-angle/i, evidence: "display angle evidence was detected." },
    { signal: "clamp-angle", pattern: /clampAngle|clamp-angle/i, evidence: "clamp angle evidence was detected." },
    { signal: "constrain-angle", pattern: /constrainAngle|constrain-angle/i, evidence: "constrain angle evidence was detected." },
    { signal: "snap-angle-to-step", pattern: /snapAngleToStep|snap-angle-to-step/i, evidence: "snap angle to step evidence was detected." },
    { signal: "rtl-mirror", pattern: /mirrorAngle|mirror-angle|dir:\s*["']rtl|rtl/i, evidence: "RTL mirror evidence was detected." },
    { signal: "thumb-drag-offset", pattern: /thumbDragOffset|thumb-drag-offset/i, evidence: "thumb drag offset evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "angle math", "signal");
}

function angleSliderReadinessFormSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["formSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hidden-input", pattern: /getHiddenInputProps|hiddenInput|hidden-input|type=['"]hidden|type:\s*["']hidden/i, evidence: "hidden input evidence was detected." },
    { signal: "name", pattern: /\bname=|name:\s*|prop\(["']name/i, evidence: "name evidence was detected." },
    { signal: "form-value", pattern: /form-value|\bvalue=|value:\s*|setElementValue|syncInputElement/i, evidence: "form value evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function angleSliderReadinessAccessibilitySignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "role-slider", pattern: /role:\s*["']slider|role=['"]slider|role-slider/i, evidence: "role slider evidence was detected." },
    { signal: "aria-label", pattern: /aria-label|getByRole\([^)]*name:/i, evidence: "aria-label evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria-labelledby evidence was detected." },
    { signal: "aria-valuemin", pattern: /aria-valuemin/i, evidence: "aria-valuemin evidence was detected." },
    { signal: "aria-valuemax", pattern: /aria-valuemax/i, evidence: "aria-valuemax evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "aria-valuenow evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled evidence was detected." },
    { signal: "data-invalid", pattern: /data-invalid/i, evidence: "data-invalid evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tab index evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function angleSliderReadinessMachineSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["machineSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<AngleSliderSchema>|createMachine\s+AngleSliderSchema/i, evidence: "Zag angle-slider createMachine evidence was detected." },
    { signal: "step-default", pattern: /step[\s\S]{0,80}1|step 1/i, evidence: "step default evidence was detected." },
    { signal: "default-value", pattern: /defaultValue[\s\S]{0,80}0|defaultValue 0|default-value/i, evidence: "default value evidence was detected." },
    { signal: "idle-state", pattern: /initialState[\s\S]{0,80}idle|states[\s\S]{0,120}idle|initialState idle/i, evidence: "idle state evidence was detected." },
    { signal: "focused-state", pattern: /states[\s\S]{0,180}focused|states idle focused/i, evidence: "focused state evidence was detected." },
    { signal: "dragging-state", pattern: /states[\s\S]{0,220}dragging|states idle focused dragging/i, evidence: "dragging state evidence was detected." },
    { signal: "value-set-event", pattern: /VALUE\.SET/i, evidence: "VALUE.SET event evidence was detected." },
    { signal: "control-pointer-down-event", pattern: /CONTROL\.POINTER_DOWN/i, evidence: "CONTROL.POINTER_DOWN event evidence was detected." },
    { signal: "doc-pointer-move-event", pattern: /DOC\.POINTER_MOVE/i, evidence: "DOC.POINTER_MOVE event evidence was detected." },
    { signal: "doc-pointer-up-event", pattern: /DOC\.POINTER_UP/i, evidence: "DOC.POINTER_UP event evidence was detected." },
    { signal: "thumb-focus-event", pattern: /THUMB\.FOCUS/i, evidence: "THUMB.FOCUS event evidence was detected." },
    { signal: "thumb-blur-event", pattern: /THUMB\.BLUR/i, evidence: "THUMB.BLUR event evidence was detected." },
    { signal: "arrow-key-events", pattern: /THUMB\.ARROW_DEC[\s\S]{0,120}THUMB\.ARROW_INC|THUMB\.ARROW_INC[\s\S]{0,120}THUMB\.ARROW_DEC|THUMB\.ARROW/i, evidence: "thumb arrow event evidence was detected." },
    { signal: "home-end-events", pattern: /THUMB\.HOME[\s\S]{0,120}THUMB\.END|THUMB\.END[\s\S]{0,120}THUMB\.HOME|THUMB\.HOME|THUMB\.END/i, evidence: "Home/End event evidence was detected." },
    { signal: "track-pointer-move-effect", pattern: /effects[\s\S]{0,120}trackPointerMove|effects trackPointerMove/i, evidence: "trackPointerMove machine effect evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function angleSliderReadinessContextSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["contextSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-context", pattern: /value\s*:\s*bindable|value bindable|defaultValue[\s\S]{0,160}onValueChange/i, evidence: "value context evidence was detected." },
    { signal: "thumb-drag-offset-ref", pattern: /thumbDragOffset|thumb-drag-offset/i, evidence: "thumb drag offset ref evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function angleSliderReadinessComputedSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["computedSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "interactive", pattern: /interactive[\s\S]{0,120}(disabled|readOnly)|interactive disabled readOnly/i, evidence: "interactive computed evidence was detected." },
    { signal: "value-as-degree", pattern: /valueAsDegree|value-as-degree/i, evidence: "valueAsDegree computed evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function angleSliderReadinessEffectSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["effectSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-pointer-move", pattern: /trackPointerMove/i, evidence: "track pointer move effect evidence was detected." },
    { signal: "pointer-move-send", pattern: /send[\s\S]{0,80}DOC\.POINTER_MOVE|send DOC\.POINTER_MOVE/i, evidence: "DOC.POINTER_MOVE send evidence was detected." },
    { signal: "pointer-up-send", pattern: /send[\s\S]{0,80}DOC\.POINTER_UP|send DOC\.POINTER_UP/i, evidence: "DOC.POINTER_UP send evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function angleSliderReadinessActionSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["actionSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sync-input-element", pattern: /syncInputElement|setElementValue/i, evidence: "sync input element action evidence was detected." },
    { signal: "invoke-on-change-end", pattern: /invokeOnChangeEnd/i, evidence: "invoke on change end action evidence was detected." },
    { signal: "set-pointer-value", pattern: /setPointerValue|getPointerValue/i, evidence: "set pointer value action evidence was detected." },
    { signal: "set-value-to-min", pattern: /setValueToMin|MIN_VALUE/i, evidence: "set value to min action evidence was detected." },
    { signal: "set-value-to-max", pattern: /setValueToMax|MAX_VALUE/i, evidence: "set value to max action evidence was detected." },
    { signal: "set-value", pattern: /setValue\b|setValue\(|clampAngle/i, evidence: "set value action evidence was detected." },
    { signal: "decrement-value", pattern: /decrementValue/i, evidence: "decrement value action evidence was detected." },
    { signal: "increment-value", pattern: /incrementValue/i, evidence: "increment value action evidence was detected." },
    { signal: "focus-thumb", pattern: /focusThumb|raf[\s\S]{0,120}getThumbEl/i, evidence: "focus thumb action evidence was detected." },
    { signal: "set-thumb-drag-offset", pattern: /setThumbDragOffset/i, evidence: "set thumb drag offset action evidence was detected." },
    { signal: "clear-thumb-drag-offset", pattern: /clearThumbDragOffset/i, evidence: "clear thumb drag offset action evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function angleSliderReadinessDomSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["domSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "thumb-id", pattern: /getThumbId/i, evidence: "thumb id DOM evidence was detected." },
    { signal: "hidden-input-id", pattern: /getHiddenInputId/i, evidence: "hidden input id DOM evidence was detected." },
    { signal: "control-id", pattern: /getControlId/i, evidence: "control id DOM evidence was detected." },
    { signal: "value-text-id", pattern: /getValueTextId/i, evidence: "value text id DOM evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id DOM evidence was detected." },
    { signal: "hidden-input-el", pattern: /getHiddenInputEl/i, evidence: "hidden input element DOM evidence was detected." },
    { signal: "control-el", pattern: /getControlEl/i, evidence: "control element DOM evidence was detected." },
    { signal: "thumb-el", pattern: /getThumbEl/i, evidence: "thumb element DOM evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function angleSliderReadinessApiSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["apiSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "value-as-degree", pattern: /valueAsDegree|value-as-degree/i, evidence: "valueAsDegree API evidence was detected." },
    { signal: "dragging", pattern: /\bdragging\b/i, evidence: "dragging API evidence was detected." },
    { signal: "set-value", pattern: /setValue\(|setValue\b/i, evidence: "set value API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "hidden-input-props", pattern: /getHiddenInputProps/i, evidence: "hidden input props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "thumb-props", pattern: /getThumbProps/i, evidence: "thumb props API evidence was detected." },
    { signal: "value-text-props", pattern: /getValueTextProps/i, evidence: "value text props API evidence was detected." },
    { signal: "marker-group-props", pattern: /getMarkerGroupProps/i, evidence: "marker group props API evidence was detected." },
    { signal: "marker-props", pattern: /getMarkerProps/i, evidence: "marker props API evidence was detected." },
    { signal: "data-state", pattern: /data-state/i, evidence: "data-state API evidence was detected." },
    { signal: "data-value", pattern: /data-value/i, evidence: "data-value API evidence was detected." },
    { signal: "pointer-down", pattern: /onPointerDown|CONTROL\.POINTER_DOWN/i, evidence: "pointer down API evidence was detected." },
    { signal: "keyboard-map", pattern: /onKeyDown|EventKeyMap|ArrowLeft|ArrowRight|ArrowUp|ArrowDown/i, evidence: "keyboard map API evidence was detected." },
    { signal: "role-presentation", pattern: /role:\s*["']presentation|role presentation|role=['"]presentation/i, evidence: "role presentation API evidence was detected." },
    { signal: "role-slider", pattern: /role:\s*["']slider|role slider|role=['"]slider/i, evidence: "role slider API evidence was detected." },
    { signal: "aria-label", pattern: /aria-label/i, evidence: "aria label API evidence was detected." },
    { signal: "aria-labelledby", pattern: /aria-labelledby/i, evidence: "aria labelledby API evidence was detected." },
    { signal: "aria-valuemin", pattern: /aria-valuemin/i, evidence: "aria valuemin API evidence was detected." },
    { signal: "aria-valuemax", pattern: /aria-valuemax/i, evidence: "aria valuemax API evidence was detected." },
    { signal: "aria-valuenow", pattern: /aria-valuenow/i, evidence: "aria valuenow API evidence was detected." },
    { signal: "tab-index", pattern: /tabIndex|tab-index/i, evidence: "tab index API evidence was detected." },
    { signal: "touch-action", pattern: /touchAction|touch-action/i, evidence: "touch action API evidence was detected." },
    { signal: "user-select", pattern: /userSelect|user-select/i, evidence: "user select API evidence was detected." },
    { signal: "rotate-style", pattern: /\brotate\b|--angle/i, evidence: "rotate style API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "data-invalid", pattern: /data-invalid/i, evidence: "data-invalid API evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly API evidence was detected." },
    { signal: "dir-prop", pattern: /dir:\s*prop\(["']dir["']\)|dir prop dir/i, evidence: "dir prop API evidence was detected." },
    { signal: "hidden-input-type", pattern: /type:\s*["']hidden["']|type hidden/i, evidence: "hidden input type API evidence was detected." },
    { signal: "stop-propagation", pattern: /stopPropagation\(\)|stopPropagation/i, evidence: "stopPropagation API evidence was detected." },
    { signal: "thumb-focus-handler", pattern: /onFocus|THUMB\.FOCUS/i, evidence: "thumb focus handler API evidence was detected." },
    { signal: "thumb-blur-handler", pattern: /onBlur|THUMB\.BLUR/i, evidence: "thumb blur handler API evidence was detected." },
    { signal: "prevent-default", pattern: /preventDefault\(\)|preventDefault/i, evidence: "preventDefault API evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function angleSliderReadinessTestSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["testSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "pointer-test", pattern: /pointer-test|pointerdown|pointermove|pointerup|onPointer/i, evidence: "pointer test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|ArrowRight|ArrowLeft|Home|End/i, evidence: "keyboard test evidence was detected." },
    { signal: "form-test", pattern: /form-test|hidden-input|type=['"]hidden|form-value/i, evidence: "form test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|toHaveAttribute|getByRole|aria-valuenow/i, evidence: "ARIA test evidence was detected." },
    { signal: "marker-test", pattern: /marker-test|marker-group|data-state=['"](under-value|over-value|at-value)/i, evidence: "marker test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|angle-slider-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function angleSliderReadinessPackageSignals(sourceFiles: AngleSliderReadinessSourceFile[]): AngleSliderReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AngleSliderReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/angle-slider", pattern: /@zag-js\/angle-slider/i, evidence: "@zag-js/angle-slider dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/rect-utils", pattern: /@zag-js\/rect-utils/i, evidence: "@zag-js/rect-utils dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return angleSliderReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function angleSliderReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AngleSliderReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/angle-slider-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildCascadeSelectReadinessReport(walk: WalkResult): Promise<CascadeSelectReadinessReport> {
  const sourceFiles = await cascadeSelectReadinessSourceFiles(walk);
  const cascadeSelectSetups = cascadeSelectReadinessSetups(sourceFiles);
  const frameworkSignals = cascadeSelectReadinessFrameworkSignals(sourceFiles);
  const structureSignals = cascadeSelectReadinessStructureSignals(sourceFiles);
  const stateSignals = cascadeSelectReadinessStateSignals(sourceFiles);
  const collectionSignals = cascadeSelectReadinessCollectionSignals(sourceFiles);
  const selectionSignals = cascadeSelectReadinessSelectionSignals(sourceFiles);
  const navigationSignals = cascadeSelectReadinessNavigationSignals(sourceFiles);
  const positioningSignals = cascadeSelectReadinessPositioningSignals(sourceFiles);
  const formSignals = cascadeSelectReadinessFormSignals(sourceFiles);
  const accessibilitySignals = cascadeSelectReadinessAccessibilitySignals(sourceFiles);
  const machineSignals = cascadeSelectReadinessMachineSignals(sourceFiles);
  const contextSignals = cascadeSelectReadinessContextSignals(sourceFiles);
  const computedSignals = cascadeSelectReadinessComputedSignals(sourceFiles);
  const effectSignals = cascadeSelectReadinessEffectSignals(sourceFiles);
  const actionSignals = cascadeSelectReadinessActionSignals(sourceFiles);
  const guardSignals = cascadeSelectReadinessGuardSignals(sourceFiles);
  const domSignals = cascadeSelectReadinessDomSignals(sourceFiles);
  const apiSignals = cascadeSelectReadinessApiSignals(sourceFiles);
  const testSignals = cascadeSelectReadinessTestSignals(sourceFiles);
  const packageSignals = cascadeSelectReadinessPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => item.readiness === "ready");
  const hasStructure = structureSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.triggerCount > 0 && item.contentCount > 0);
  const hasState = stateSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.stateCount > 0);
  const hasCollection = collectionSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.collectionCount > 0);
  const hasSelection = selectionSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.selectionCount > 0);
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.navigationCount > 0);
  const hasPositioning = positioningSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.positioningCount > 0);
  const hasForm = formSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.formCount > 0);
  const hasA11y = accessibilitySignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.accessibilityCount > 0);
  const hasTests = testSignals.some((item) => item.readiness === "ready") || cascadeSelectSetups.some((item) => item.testCount > 0);

  const riskQueue: CascadeSelectReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasStructure) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document cascade select root, label, control, trigger, positioner, content, list, item, value text, and hidden input structure.",
      why: "Cascade select readiness starts with a traceable combobox trigger, popup listbox/tree items, selected value text, and submitted form value.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure) && !hasCollection) {
    riskQueue.push({
      priority: "high",
      action: "Trace tree collection, root node, branch/leaf nodes, value paths, index paths, depth, disabled nodes, and parent selection policy.",
      why: "Cascade selects depend on hierarchical collection semantics before selection, highlighting, and ARIA ownership can be trusted.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Trace idle, focused, open/closed, disabled, read-only, invalid, required, multiple, empty, selected, and highlighted state.",
      why: "Cascade select controls can appear usable while disabled, read-only, invalid, empty, closed, or on a highlighted path that is not selected.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasSelection) {
    riskQueue.push({
      priority: "high",
      action: "Trace value/default value, selected items, clear/select methods, multiple selection, close-on-select, and value-as-string formatting.",
      why: "Hierarchical selection needs visible mapping between chosen path arrays, displayed text, and hidden submitted values.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasNavigation) {
    riskQueue.push({
      priority: "high",
      action: "Trace trigger focus/click, arrow/Home/End/Enter keyboard navigation, pointer enter/leave, and grace-area behavior.",
      why: "Cascade menus need keyboard and pointer transit coverage across nested lists before learners can trust open popup behavior.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasPositioning) {
    riskQueue.push({
      priority: "medium",
      action: "Trace positioning, placement, popper/dismissable boundaries, focus-visible state, scroll-into-view, and current placement.",
      why: "Nested popup lists can detach from trigger or highlighted items unless placement, dismissal, focus, and scrolling are visible.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasForm) {
    riskQueue.push({
      priority: "medium",
      action: "Trace hidden input, name, form owner, required/read-only state, default value, reset, and input event synchronization.",
      why: "A visual cascade select still needs a submitted hidden input path for forms and reset flows.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasA11y) {
    riskQueue.push({
      priority: "medium",
      action: "Verify combobox, listbox, treeitem, group, ARIA controls/expanded/haspopup/activedescendant/multiselectable/disabled/level/owns semantics.",
      why: "Cascade select is a composite popup control and needs explicit ARIA ownership for nested options.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  if ((hasFramework || hasStructure || hasCollection) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add click, keyboard, hover, form, ARIA, and artifact tests for cascade select traces.",
      why: "Static cascade select evidence does not prove nested popup navigation, selection, form sync, or accessibility behavior.",
      relatedHref: "html/cascade-select-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Verify real popup positioning, nested pointer transit, keyboard navigation, value-path selection, hidden input synchronization, ARIA tree semantics, and project tests outside RepoTutor.",
    why: "RepoTutor records cascade select readiness only; it does not open real poppers, navigate real DOM, mutate hidden form values, compute live placement/grace areas, dispatch keyboard/pointer events, or run analyzed project tests.",
    relatedHref: "html/cascade-select-readiness.html"
  });

  return {
    summary: `Cascade select readiness report: setup ${cascadeSelectSetups.length} files, collection signal ${collectionSignals.length}, navigation signal ${navigationSignals.length}, positioning signal ${positioningSignals.length}, accessibility signal ${accessibilitySignals.length}, machine signal ${machineSignals.length}, API signal ${apiSignals.length} were summarized from static analysis.`,
    sourcePattern: "Cascade select readiness Zag cascade-select tree collection value path popper combobox listbox accessibility tests",
    cascadeSelectSetups,
    frameworkSignals,
    structureSignals,
    stateSignals,
    collectionSignals,
    selectionSignals,
    navigationSignals,
    positioningSignals,
    formSignals,
    accessibilitySignals,
    machineSignals,
    contextSignals,
    computedSignals,
    effectSignals,
    actionSignals,
    guardSignals,
    domSignals,
    apiSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@zag-js/cascade-select|cascadeSelect\\.machine|cascadeSelect\\.connect|getTriggerProps|getContentProps|getItemProps\" package.json src app packages", purpose: "Find Zag cascade-select machine, combobox trigger, popup content, and item wiring." },
      { command: "rg \"TreeCollection|rootNode|branch node|leaf node|indexPath|value path|allowParentSelection|selectedItems|highlightedItems\" src app packages", purpose: "Trace hierarchical collection, value path, selected/highlighted items, and parent selection policy." },
      { command: "rg \"TRIGGER\\.CLICK|TRIGGER\\.FOCUS|CONTENT\\.ARROW|CONTENT\\.HOME|CONTENT\\.END|ITEM\\.POINTER_ENTER|ITEM\\.POINTER_LEAVE|graceArea|keyboard-test|hover-test\" src app packages test tests", purpose: "Check keyboard and pointer navigation ownership across nested lists." },
      { command: "rg \"role=['\\\"]combobox|role=['\\\"]listbox|role=['\\\"]treeitem|aria-activedescendant|aria-multiselectable|type=['\\\"]hidden|cascade-select-traces|upload-artifact\" src app packages test tests .github", purpose: "Check accessibility, hidden input form wiring, and archived cascade select traces." }
    ],
    learnerNextSteps: [
      "Identify whether the project uses Zag cascade-select, a native cascader pattern, or custom hierarchical select logic.",
      "Trace root, label, control, trigger, clear trigger, positioner, content, list, item, value text, and hidden input anatomy before reviewing behavior.",
      "Map tree collection, value paths, index paths, highlighted paths, selected items, multiple mode, close-on-select, and parent selection policy.",
      "Check trigger click/focus, arrow/Home/End/Enter keyboard behavior, pointer enter/leave, grace-area transit, positioning, dismissable boundary, scroll-to-highlight, hidden input name/form/value, and ARIA combobox/listbox/treeitem ownership.",
      "This report is static readiness. Real popup positioning, nested pointer movement, keyboard navigation, form synchronization, accessibility tree, and project tests need trusted QA."
    ]
  };
}

type CascadeSelectReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function cascadeSelectReadinessSourceFiles(walk: WalkResult): Promise<CascadeSelectReadinessSourceFile[]> {
  const files: CascadeSelectReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !cascadeSelectReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!cascadeSelectReadinessPathSignal(file.relPath) && !cascadeSelectReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function cascadeSelectReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return cascadeSelectReadinessPathSignal(filePath)
    || /^(package\.json|pnpm-lock\.yaml|yarn\.lock|package-lock\.json|playwright\.config\.[cm]?[jt]s|cypress\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|astro|json|md|mdx|ya?ml)$/i.test(filePath);
}

function cascadeSelectReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(cascade-select|cascader|cascade|region|category|tree-select|tree|tests?|e2e)(\/|\.|-|_|$)|package\.json$|workflow/i.test(filePath);
}

function cascadeSelectReadinessContentSignal(text: string): boolean {
  return /(@zag-js\/cascade-select|cascadeSelect\.machine|cascadeSelect\.connect|getTriggerProps|getContentProps|getItemProps|TreeCollection|valueAsString|aria-activedescendant)/i.test(text);
}

function cascadeSelectReadinessSetups(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["cascadeSelectSetups"] {
  const rows: CascadeSelectReadinessReport["cascadeSelectSetups"] = [];
  for (const source of sourceFiles) {
    const rootCount = countMatches(source.text, /(cascadeSelect\.machine|cascadeSelect\.connect|getRootProps|data-part=['"]root|cascade select root)/gi);
    const labelCount = countMatches(source.text, /(getLabelProps|<label|htmlFor|label)/gi);
    const controlCount = countMatches(source.text, /(getControlProps|data-part=['"]control|control)/gi);
    const triggerCount = countMatches(source.text, /(getTriggerProps|data-part=['"]trigger|role=['"]combobox|combobox)/gi);
    const clearTriggerCount = countMatches(source.text, /(getClearTriggerProps|clear-trigger|Clear value|CLEAR_TRIGGER)/gi);
    const positionerCount = countMatches(source.text, /(getPositionerProps|data-part=['"]positioner|positioner)/gi);
    const contentCount = countMatches(source.text, /(getContentProps|data-part=['"]content|role=['"]listbox|content)/gi);
    const listCount = countMatches(source.text, /(getListProps|data-part=['"]list|role=['"]group|list)/gi);
    const itemCount = countMatches(source.text, /(getItemProps|data-part=['"]item|role=['"]treeitem|treeitem)/gi);
    const valueTextCount = countMatches(source.text, /(getValueTextProps|valueText|value-text)/gi);
    const hiddenInputCount = countMatches(source.text, /(getHiddenInputProps|hidden-input|hidden input|type=['"]hidden|hidden:\s*true)/gi);
    const collectionCount = countMatches(source.text, /(TreeCollection|collection\(|rootNode|root-node|branch node|branch-node|leaf node|leaf-node|indexPath|index-path|value path|value-path|getIndexPath|allowParentSelection)/gi);
    const stateCount = countMatches(source.text, /\b(idle|focused|open|closed|disabled|readOnly|read-only|invalid|required|multiple|empty|selected|highlighted)\b|data-selected|data-highlighted/gi);
    const navigationCount = countMatches(source.text, /(TRIGGER\.CLICK|TRIGGER\.FOCUS|TRIGGER\.ARROW|CONTENT\.HOME|CONTENT\.END|CONTENT\.ARROW|CONTENT\.ENTER|ITEM\.POINTER_ENTER|ITEM\.POINTER_LEAVE|graceArea|grace-area|trigger-click|trigger-focus|arrow-up|arrow-down|arrow-left|arrow-right|click-test|keyboard-test|hover-test)/gi);
    const selectionCount = countMatches(source.text, /(VALUE\.SET|VALUE\.CLEAR|ITEM\.SELECT|ITEM\.CLEAR|setValue|clearValue|selectValue|selectedItems|selected-items|hasSelectedItems|has-selected-items|valueAsString|value-as-string|closeOnSelect|close-on-select)/gi);
    const positioningCount = countMatches(source.text, /(positioning|getPlacement|placement|popper|dismissable|trackDismissableElement|focus-visible|trackFocusVisible|scrollIntoView|scroll-into-view|currentPlacement|current-placement)/gi);
    const formCount = countMatches(source.text, /(getHiddenInputProps|hidden-input|\bname=|name:\s*|\bform=|form:\s*|\brequired\b|readOnly|read-only|defaultValue|default-value|reset|dispatchInputValueEvent|input-event)/gi);
    const accessibilityCount = countMatches(source.text, /(role=['"]combobox|role=['"]listbox|role=['"]treeitem|role=['"]group|aria-controls|aria-expanded|aria-haspopup|aria-activedescendant|aria-multiselectable|aria-disabled|aria-level|aria-owns)/gi);
    const testCount = countMatches(source.text, /(vitest|testing-library|user-event|user\.click|user\.keyboard|click-test|keyboard-test|hover-test|form-test|aria-test|cascade-select-traces|upload-artifact)/gi);
    const total = rootCount + labelCount + controlCount + triggerCount + clearTriggerCount + positionerCount + contentCount + listCount + itemCount + valueTextCount + hiddenInputCount + collectionCount + stateCount + navigationCount + selectionCount + positioningCount + formCount + accessibilityCount + testCount;
    if (total === 0) continue;
    const readiness = rootCount > 0 && labelCount > 0 && controlCount > 0 && triggerCount > 0 && clearTriggerCount > 0 && positionerCount > 0 && contentCount > 0 && listCount > 0 && itemCount > 0 && valueTextCount > 0 && hiddenInputCount > 0 && collectionCount > 0 && stateCount > 0 && navigationCount > 0 && selectionCount > 0 && positioningCount > 0 && formCount > 0 && accessibilityCount > 0 ? "ready" : "partial";
    rows.push({
      filePath: source.filePath,
      framework: cascadeSelectReadinessFramework(source),
      rootCount,
      labelCount,
      controlCount,
      triggerCount,
      clearTriggerCount,
      positionerCount,
      contentCount,
      listCount,
      itemCount,
      valueTextCount,
      hiddenInputCount,
      collectionCount,
      stateCount,
      navigationCount,
      selectionCount,
      positioningCount,
      formCount,
      accessibilityCount,
      testCount,
      readiness,
      evidence: `root ${rootCount}, label ${labelCount}, control ${controlCount}, trigger ${triggerCount}, clear trigger ${clearTriggerCount}, positioner ${positionerCount}, content ${contentCount}, list ${listCount}, item ${itemCount}, value text ${valueTextCount}, hidden input ${hiddenInputCount}, collection ${collectionCount}, state ${stateCount}, navigation ${navigationCount}, selection ${selectionCount}, positioning ${positioningCount}, form ${formCount}, accessibility ${accessibilityCount}, test ${testCount} signals detected.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => b.collectionCount + b.navigationCount + b.selectionCount + b.accessibilityCount - (a.collectionCount + a.navigationCount + a.selectionCount + a.accessibilityCount));
}

function cascadeSelectReadinessFramework(source: CascadeSelectReadinessSourceFile): CascadeSelectReadinessReport["cascadeSelectSetups"][number]["framework"] {
  if (/@zag-js\/cascade-select|cascadeSelect\.machine|cascadeSelect\.connect|getTriggerProps|getContentProps|getItemProps/i.test(source.text)) return "zag-cascade-select";
  if (/role=['"]combobox|role=['"]listbox|role=['"]treeitem|data-part=['"]content|native cascader|cascader/i.test(source.text)) return "native-cascader";
  if (/cascade select|tree select|category|region/i.test(source.text)) return "custom";
  return "unknown";
}

function cascadeSelectReadinessFrameworkSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "zag-cascade-select", pattern: /@zag-js\/cascade-select|cascadeSelect\.machine|cascadeSelect\.connect|getTriggerProps|getContentProps|getItemProps/i, evidence: "Zag cascade-select evidence was detected." },
    { signal: "native-cascader", pattern: /role=['"]combobox|role=['"]listbox|role=['"]treeitem|data-part=['"]content|native cascader|cascader/i, evidence: "native cascader evidence was detected." },
    { signal: "custom", pattern: /cascade select|tree select|category|region/i, evidence: "custom cascade select evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function cascadeSelectReadinessStructureSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["structureSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["structureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root", pattern: /getRootProps|data-part=['"]root|cascadeSelect\.machine/i, evidence: "root evidence was detected." },
    { signal: "label", pattern: /getLabelProps|<label|htmlFor/i, evidence: "label evidence was detected." },
    { signal: "control", pattern: /getControlProps|data-part=['"]control/i, evidence: "control evidence was detected." },
    { signal: "trigger", pattern: /getTriggerProps|data-part=['"]trigger|role=['"]combobox/i, evidence: "trigger evidence was detected." },
    { signal: "indicator", pattern: /getIndicatorProps|data-part=['"]indicator|indicator/i, evidence: "indicator evidence was detected." },
    { signal: "clear-trigger", pattern: /getClearTriggerProps|clear-trigger|CLEAR_TRIGGER/i, evidence: "clear trigger evidence was detected." },
    { signal: "positioner", pattern: /getPositionerProps|data-part=['"]positioner/i, evidence: "positioner evidence was detected." },
    { signal: "content", pattern: /getContentProps|data-part=['"]content|role=['"]listbox/i, evidence: "content evidence was detected." },
    { signal: "list", pattern: /getListProps|data-part=['"]list|role=['"]group/i, evidence: "list evidence was detected." },
    { signal: "item", pattern: /getItemProps|data-part=['"]item|role=['"]treeitem/i, evidence: "item evidence was detected." },
    { signal: "item-text", pattern: /getItemTextProps|item-text|data-part=['"]item-text/i, evidence: "item text evidence was detected." },
    { signal: "item-indicator", pattern: /getItemIndicatorProps|item-indicator|data-part=['"]item-indicator/i, evidence: "item indicator evidence was detected." },
    { signal: "value-text", pattern: /getValueTextProps|valueText|value-text/i, evidence: "value text evidence was detected." },
    { signal: "hidden-input", pattern: /getHiddenInputProps|hidden-input|type=['"]hidden/i, evidence: "hidden input evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "structure", "signal");
}

function cascadeSelectReadinessStateSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["stateSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "idle", pattern: /\bidle\b/i, evidence: "idle state evidence was detected." },
    { signal: "focused", pattern: /\bfocused\b|TRIGGER\.FOCUS/i, evidence: "focused state evidence was detected." },
    { signal: "open", pattern: /\bopen\b|CONTROLLED\.OPEN|defaultOpen/i, evidence: "open state evidence was detected." },
    { signal: "closed", pattern: /\bclosed\b|CONTROLLED\.CLOSE/i, evidence: "closed state evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\b|data-disabled|aria-disabled/i, evidence: "disabled evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|aria-readonly/i, evidence: "read-only evidence was detected." },
    { signal: "invalid", pattern: /\binvalid\b|data-invalid/i, evidence: "invalid evidence was detected." },
    { signal: "required", pattern: /\brequired\b|aria-required/i, evidence: "required evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b|aria-multiselectable/i, evidence: "multiple evidence was detected." },
    { signal: "empty", pattern: /\bempty\b|hasSelectedItems/i, evidence: "empty evidence was detected." },
    { signal: "selected", pattern: /\bselected\b|data-selected|selectedItems/i, evidence: "selected evidence was detected." },
    { signal: "highlighted", pattern: /\bhighlighted\b|data-highlighted|highlightedValue|highlightedItems/i, evidence: "highlighted evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function cascadeSelectReadinessCollectionSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["collectionSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["collectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tree-collection", pattern: /TreeCollection|tree-collection|collection\(/i, evidence: "tree collection evidence was detected." },
    { signal: "root-node", pattern: /rootNode|root-node/i, evidence: "root node evidence was detected." },
    { signal: "branch-node", pattern: /branch node|branch-node|data-type=['"]branch|type='branch'/i, evidence: "branch node evidence was detected." },
    { signal: "leaf-node", pattern: /leaf node|leaf-node|data-type=['"]leaf|type='leaf'/i, evidence: "leaf node evidence was detected." },
    { signal: "index-path", pattern: /indexPath|index-path|highlightedIndexPath|valueIndexPath/i, evidence: "index path evidence was detected." },
    { signal: "value-path", pattern: /value path|value-path|value:\s*\[/i, evidence: "value path evidence was detected." },
    { signal: "depth", pattern: /\bdepth\b|data-depth|aria-level/i, evidence: "depth evidence was detected." },
    { signal: "disabled-node", pattern: /disabled-node|disabled:\s*true|aria-disabled=['"]true/i, evidence: "disabled node evidence was detected." },
    { signal: "parent-selection", pattern: /allowParentSelection|parent-selection/i, evidence: "parent selection evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "collection", "signal");
}

function cascadeSelectReadinessSelectionSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["selectionSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["selectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value", pattern: /\bvalue\b|VALUE\.SET|setValue/i, evidence: "value evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default-value/i, evidence: "default value evidence was detected." },
    { signal: "selected-items", pattern: /selectedItems|selected-items/i, evidence: "selected items evidence was detected." },
    { signal: "has-selected-items", pattern: /hasSelectedItems|has-selected-items/i, evidence: "has selected items evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|VALUE\.CLEAR|clear-value/i, evidence: "clear value evidence was detected." },
    { signal: "select-value", pattern: /selectValue|ITEM\.SELECT|select-value/i, evidence: "select value evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b|aria-multiselectable/i, evidence: "multiple selection evidence was detected." },
    { signal: "close-on-select", pattern: /closeOnSelect|close-on-select/i, evidence: "close-on-select evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|value-as-string|formatValue/i, evidence: "value-as-string evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "selection", "signal");
}

function cascadeSelectReadinessNavigationSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "trigger-click", pattern: /TRIGGER\.CLICK|trigger-click|user\.click/i, evidence: "trigger click evidence was detected." },
    { signal: "trigger-focus", pattern: /TRIGGER\.FOCUS|trigger-focus|focusTriggerEl/i, evidence: "trigger focus evidence was detected." },
    { signal: "arrow-up", pattern: /ARROW_UP|arrow-up|ArrowUp/i, evidence: "ArrowUp evidence was detected." },
    { signal: "arrow-down", pattern: /ARROW_DOWN|arrow-down|ArrowDown/i, evidence: "ArrowDown evidence was detected." },
    { signal: "arrow-left", pattern: /ARROW_LEFT|arrow-left|ArrowLeft/i, evidence: "ArrowLeft evidence was detected." },
    { signal: "arrow-right", pattern: /ARROW_RIGHT|arrow-right|ArrowRight/i, evidence: "ArrowRight evidence was detected." },
    { signal: "home", pattern: /CONTENT\.HOME|\bHome\b|\bhome\b/i, evidence: "Home key evidence was detected." },
    { signal: "end", pattern: /CONTENT\.END|\bEnd\b|\bend\b/i, evidence: "End key evidence was detected." },
    { signal: "enter", pattern: /CONTENT\.ENTER|TRIGGER\.ENTER|\bEnter\b|\benter\b/i, evidence: "Enter evidence was detected." },
    { signal: "pointer-enter", pattern: /ITEM\.POINTER_ENTER|pointer-enter|onPointerEnter/i, evidence: "pointer enter evidence was detected." },
    { signal: "pointer-leave", pattern: /ITEM\.POINTER_LEAVE|pointer-leave|onPointerLeave/i, evidence: "pointer leave evidence was detected." },
    { signal: "grace-area", pattern: /graceArea|grace-area|createGraceArea|isPointerInGraceArea/i, evidence: "grace area evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function cascadeSelectReadinessPositioningSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["positioningSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["positioningSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "positioning", pattern: /\bpositioning\b|POSITIONING\.SET/i, evidence: "positioning evidence was detected." },
    { signal: "placement", pattern: /\bplacement\b|getPlacement/i, evidence: "placement evidence was detected." },
    { signal: "popper", pattern: /\bpopper\b|positioner/i, evidence: "popper/positioner evidence was detected." },
    { signal: "dismissable", pattern: /dismissable|trackDismissableElement|onFocusOutside|onInteractOutside|onPointerDownOutside/i, evidence: "dismissable boundary evidence was detected." },
    { signal: "focus-visible", pattern: /focus-visible|trackFocusVisible/i, evidence: "focus-visible evidence was detected." },
    { signal: "scroll-into-view", pattern: /scrollIntoView|scroll-into-view|scrollToHighlightedItems|scrollToIndexFn/i, evidence: "scroll-into-view evidence was detected." },
    { signal: "current-placement", pattern: /currentPlacement|current-placement/i, evidence: "current placement evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "positioning", "signal");
}

function cascadeSelectReadinessFormSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["formSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["formSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "hidden-input", pattern: /getHiddenInputProps|hidden-input|type=['"]hidden/i, evidence: "hidden input evidence was detected." },
    { signal: "name", pattern: /\bname=|name:\s*/i, evidence: "name evidence was detected." },
    { signal: "form", pattern: /\bform=|form:\s*|<form/i, evidence: "form owner evidence was detected." },
    { signal: "required", pattern: /\brequired\b|aria-required/i, evidence: "required evidence was detected." },
    { signal: "read-only", pattern: /readOnly|read-only|aria-readonly/i, evidence: "read-only form evidence was detected." },
    { signal: "default-value", pattern: /defaultValue|default-value/i, evidence: "default value evidence was detected." },
    { signal: "reset", pattern: /\breset\b|trackFormControlState/i, evidence: "reset evidence was detected." },
    { signal: "input-event", pattern: /dispatchInputValueEvent|input-event|setElementValue/i, evidence: "input event evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "form", "signal");
}

function cascadeSelectReadinessAccessibilitySignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["accessibilitySignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["accessibilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "combobox", pattern: /role=['"]combobox|\bcombobox\b/i, evidence: "combobox evidence was detected." },
    { signal: "listbox", pattern: /role=['"]listbox|\blistbox\b/i, evidence: "listbox evidence was detected." },
    { signal: "treeitem", pattern: /role=['"]treeitem|\btreeitem\b/i, evidence: "treeitem evidence was detected." },
    { signal: "group", pattern: /role=['"]group|\bgroup\b/i, evidence: "group evidence was detected." },
    { signal: "aria-controls", pattern: /aria-controls/i, evidence: "aria-controls evidence was detected." },
    { signal: "aria-expanded", pattern: /aria-expanded/i, evidence: "aria-expanded evidence was detected." },
    { signal: "aria-haspopup", pattern: /aria-haspopup/i, evidence: "aria-haspopup evidence was detected." },
    { signal: "aria-activedescendant", pattern: /aria-activedescendant/i, evidence: "aria-activedescendant evidence was detected." },
    { signal: "aria-multiselectable", pattern: /aria-multiselectable/i, evidence: "aria-multiselectable evidence was detected." },
    { signal: "aria-disabled", pattern: /aria-disabled/i, evidence: "aria-disabled evidence was detected." },
    { signal: "aria-level", pattern: /aria-level/i, evidence: "aria-level evidence was detected." },
    { signal: "aria-owns", pattern: /aria-owns/i, evidence: "aria-owns evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "accessibility", "signal");
}

function cascadeSelectReadinessMachineSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["machineSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["machineSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create-machine", pattern: /createMachine<CascadeSelectSchema>|createMachine\s+CascadeSelectSchema/i, evidence: "Zag cascade-select createMachine evidence was detected." },
    { signal: "default-props", pattern: /closeOnSelect[\s\S]{0,260}allowParentSelection|defaultOpen false|highlightTrigger click/i, evidence: "default props evidence was detected." },
    { signal: "idle-state", pattern: /states[\s\S]{0,160}idle|initialState[\s\S]{0,120}idle|states idle/i, evidence: "idle state evidence was detected." },
    { signal: "focused-state", pattern: /states[\s\S]{0,200}focused|states idle focused/i, evidence: "focused state evidence was detected." },
    { signal: "open-state", pattern: /states[\s\S]{0,240}open|initialState[\s\S]{0,120}open|states idle focused open/i, evidence: "open state evidence was detected." },
    { signal: "controlled-open-event", pattern: /CONTROLLED\.OPEN/i, evidence: "CONTROLLED.OPEN event evidence was detected." },
    { signal: "controlled-close-event", pattern: /CONTROLLED\.CLOSE/i, evidence: "CONTROLLED.CLOSE event evidence was detected." },
    { signal: "trigger-events", pattern: /TRIGGER\.CLICK[\s\S]{0,220}TRIGGER\.FOCUS|TRIGGER\.ARROW|TRIGGER\.ENTER/i, evidence: "trigger event evidence was detected." },
    { signal: "content-key-events", pattern: /CONTENT\.HOME|CONTENT\.END|CONTENT\.ARROW|CONTENT\.ENTER/i, evidence: "content key event evidence was detected." },
    { signal: "item-events", pattern: /ITEM\.CLICK|ITEM\.POINTER_ENTER|ITEM\.POINTER_LEAVE|ITEM\.SELECT|ITEM\.CLEAR/i, evidence: "item event evidence was detected." },
    { signal: "value-events", pattern: /VALUE\.SET|VALUE\.CLEAR/i, evidence: "value event evidence was detected." },
    { signal: "highlight-events", pattern: /HIGHLIGHTED_VALUE\.SET|HIGHLIGHTED_VALUE\.CLEAR/i, evidence: "highlight event evidence was detected." },
    { signal: "positioning-event", pattern: /POSITIONING\.SET/i, evidence: "positioning event evidence was detected." },
    { signal: "track-form-control-effect", pattern: /trackFormControlState|trackFormControl/i, evidence: "track form control effect evidence was detected." },
    { signal: "open-effects", pattern: /effects[\s\S]{0,220}(trackDismissableElement|trackFocusVisible|computePlacement|scrollToHighlightedItems)|trackDismissableElement[\s\S]{0,220}scrollToHighlightedItems/i, evidence: "open state effect evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "machine", "signal");
}

function cascadeSelectReadinessContextSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["contextSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["contextSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "value-context", pattern: /value\s*:\s*bindable|value bindable|defaultValue[\s\S]{0,160}value prop/i, evidence: "value context evidence was detected." },
    { signal: "highlighted-value-context", pattern: /highlightedValue\s*:\s*bindable|highlightedValue bindable|defaultHighlightedValue/i, evidence: "highlighted value context evidence was detected." },
    { signal: "value-index-path-context", pattern: /valueIndexPath|value-index-path/i, evidence: "value index path context evidence was detected." },
    { signal: "highlighted-index-path-context", pattern: /highlightedIndexPath|highlighted-index-path/i, evidence: "highlighted index path context evidence was detected." },
    { signal: "highlighted-items-context", pattern: /highlightedItems|highlighted-items/i, evidence: "highlighted items context evidence was detected." },
    { signal: "selected-items-context", pattern: /selectedItems|selected-items/i, evidence: "selected items context evidence was detected." },
    { signal: "current-placement-context", pattern: /currentPlacement|current-placement/i, evidence: "current placement context evidence was detected." },
    { signal: "fieldset-disabled-context", pattern: /fieldsetDisabled|fieldset-disabled/i, evidence: "fieldset disabled context evidence was detected." },
    { signal: "grace-area-context", pattern: /graceArea|grace-area/i, evidence: "grace area context evidence was detected." },
    { signal: "pointer-transit-context", pattern: /isPointerInTransit|pointer transit|pointer-transit/i, evidence: "pointer transit context evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "context", "signal");
}

function cascadeSelectReadinessComputedSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["computedSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["computedSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-interactive", pattern: /isInteractive[\s\S]{0,140}(disabled|readOnly)|isInteractive disabled readOnly/i, evidence: "isInteractive computed evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|value-as-string|formatValue[\s\S]{0,120}selectedItems/i, evidence: "valueAsString computed evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "computed", "signal");
}

function cascadeSelectReadinessEffectSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["effectSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["effectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "track-form-control-state", pattern: /trackFormControlState|trackFormControl[\s\S]{0,160}(onFormReset|fieldsetDisabled)/i, evidence: "track form control state effect evidence was detected." },
    { signal: "track-focus-visible", pattern: /trackFocusVisible|track-focus-visible/i, evidence: "track focus visible effect evidence was detected." },
    { signal: "track-dismissable-element", pattern: /trackDismissableElement|onFocusOutside|onPointerDownOutside|onInteractOutside|onDismiss/i, evidence: "track dismissable element effect evidence was detected." },
    { signal: "compute-placement", pattern: /computePlacement|getPlacement[\s\S]{0,120}currentPlacement/i, evidence: "compute placement effect evidence was detected." },
    { signal: "scroll-to-highlighted-items", pattern: /scrollToHighlightedItems|scrollIntoView|scrollToIndexFn/i, evidence: "scroll to highlighted items effect evidence was detected." },
    { signal: "observe-activedescendant", pattern: /observeAttributes|aria-activedescendant|data-activedescendant/i, evidence: "active descendant observer evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "effect", "signal");
}

function cascadeSelectReadinessActionSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["actionSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["actionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-value", pattern: /setValue\b|setValue\(/i, evidence: "set value action evidence was detected." },
    { signal: "clear-value", pattern: /clearValue\b|clearValue\(/i, evidence: "clear value action evidence was detected." },
    { signal: "set-highlighted-value", pattern: /setHighlightedValue\b|setHighlightedValue\(/i, evidence: "set highlighted value action evidence was detected." },
    { signal: "clear-highlighted-value", pattern: /clearHighlightedValue\b|clearHighlightedValue\(/i, evidence: "clear highlighted value action evidence was detected." },
    { signal: "reposition", pattern: /reposition\b|POSITIONING\.SET/i, evidence: "reposition action evidence was detected." },
    { signal: "select-item", pattern: /selectItem\b|selectItem\(/i, evidence: "select item action evidence was detected." },
    { signal: "clear-item", pattern: /clearItem\b|clearItem\(/i, evidence: "clear item action evidence was detected." },
    { signal: "select-highlighted-item", pattern: /selectHighlightedItem\b|selectHighlightedItem\(/i, evidence: "select highlighted item action evidence was detected." },
    { signal: "highlight-first-item", pattern: /highlightFirstItem\b|highlightFirstItem\(/i, evidence: "highlight first item action evidence was detected." },
    { signal: "highlight-last-item", pattern: /highlightLastItem\b|highlightLastItem\(/i, evidence: "highlight last item action evidence was detected." },
    { signal: "highlight-next-item", pattern: /highlightNextItem\b|highlightNextItem\(/i, evidence: "highlight next item action evidence was detected." },
    { signal: "highlight-previous-item", pattern: /highlightPreviousItem\b|highlightPreviousItem\(/i, evidence: "highlight previous item action evidence was detected." },
    { signal: "highlight-first-child", pattern: /highlightFirstChild\b|highlightFirstChild\(/i, evidence: "highlight first child action evidence was detected." },
    { signal: "highlight-parent", pattern: /highlightParent\b|highlightParent\(/i, evidence: "highlight parent action evidence was detected." },
    { signal: "set-initial-focus", pattern: /setInitialFocus\b|setInitialFocus\(/i, evidence: "set initial focus action evidence was detected." },
    { signal: "focus-trigger-el", pattern: /focusTriggerEl\b|focusTriggerEl\(/i, evidence: "focus trigger element action evidence was detected." },
    { signal: "invoke-on-open", pattern: /invokeOnOpen\b|invokeOnOpen\(/i, evidence: "invoke on open action evidence was detected." },
    { signal: "invoke-on-close", pattern: /invokeOnClose\b|invokeOnClose\(/i, evidence: "invoke on close action evidence was detected." },
    { signal: "toggle-visibility", pattern: /toggleVisibility\b|toggleVisibility\(/i, evidence: "toggle visibility action evidence was detected." },
    { signal: "highlight-first-selected-item", pattern: /highlightFirstSelectedItem\b|highlightFirstSelectedItem\(/i, evidence: "highlight first selected item action evidence was detected." },
    { signal: "create-grace-area", pattern: /createGraceArea\b|createGraceArea\(/i, evidence: "create grace area action evidence was detected." },
    { signal: "clear-grace-area", pattern: /clearGraceArea\b|clearGraceArea\(/i, evidence: "clear grace area action evidence was detected." },
    { signal: "sync-input-value", pattern: /syncInputValue\b|syncInputValue\(/i, evidence: "sync input value action evidence was detected." },
    { signal: "dispatch-change-event", pattern: /dispatchChangeEvent\b|dispatchChangeEvent\(/i, evidence: "dispatch change event action evidence was detected." },
    { signal: "scroll-content-to-top", pattern: /scrollContentToTop\b|scrollContentToTop\(/i, evidence: "scroll content to top action evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "action", "signal");
}

function cascadeSelectReadinessGuardSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["guardSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["guardSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "restore-focus", pattern: /restoreFocus|restore-focus/i, evidence: "restore focus guard evidence was detected." },
    { signal: "multiple", pattern: /\bmultiple\b/i, evidence: "multiple guard evidence was detected." },
    { signal: "loop", pattern: /\bloop\b|loopFocus/i, evidence: "loop guard evidence was detected." },
    { signal: "is-open-controlled", pattern: /isOpenControlled|open controlled|open-controlled/i, evidence: "open controlled guard evidence was detected." },
    { signal: "trigger-event-guards", pattern: /isTriggerClickEvent|isTriggerArrowUpEvent|isTriggerArrowDownEvent|isTriggerEnterEvent/i, evidence: "trigger event guard evidence was detected." },
    { signal: "has-highlighted-value", pattern: /hasHighlightedValue|has-highlighted-value/i, evidence: "has highlighted value guard evidence was detected." },
    { signal: "highlight-boundary", pattern: /isHighlightedFirstItem|isHighlightedLastItem|highlighted first item|highlighted last item/i, evidence: "highlight boundary guard evidence was detected." },
    { signal: "close-on-select", pattern: /shouldCloseOnSelect|closeOnSelect|close-on-select/i, evidence: "close on select guard evidence was detected." },
    { signal: "can-select-item", pattern: /canSelectItem|can-select-item/i, evidence: "can select item guard evidence was detected." },
    { signal: "can-select-highlighted-item", pattern: /canSelectHighlightedItem|can-select-highlighted-item/i, evidence: "can select highlighted item guard evidence was detected." },
    { signal: "navigate-child-parent", pattern: /canNavigateToChild|canNavigateToParent|navigate child parent/i, evidence: "child/parent navigation guard evidence was detected." },
    { signal: "root-level", pattern: /isAtRootLevel|root-level/i, evidence: "root level guard evidence was detected." },
    { signal: "hover-highlight", pattern: /isHoverHighlight|shouldHighlightOnHover|hover highlight/i, evidence: "hover highlight guard evidence was detected." },
    { signal: "grace-area", pattern: /hasGraceArea|isPointerOutsideGraceArea|grace-area|graceArea/i, evidence: "grace area guard evidence was detected." },
    { signal: "pointer-not-in-item", pattern: /isPointerNotInAnyItem|pointer not in any item|pointer-not-in-item/i, evidence: "pointer not in any item guard evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "guard", "signal");
}

function cascadeSelectReadinessDomSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["domSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["domSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "root-id", pattern: /getRootId/i, evidence: "root id DOM evidence was detected." },
    { signal: "label-id", pattern: /getLabelId/i, evidence: "label id DOM evidence was detected." },
    { signal: "control-id", pattern: /getControlId/i, evidence: "control id DOM evidence was detected." },
    { signal: "trigger-id", pattern: /getTriggerId/i, evidence: "trigger id DOM evidence was detected." },
    { signal: "indicator-id", pattern: /getIndicatorId/i, evidence: "indicator id DOM evidence was detected." },
    { signal: "clear-trigger-id", pattern: /getClearTriggerId/i, evidence: "clear trigger id DOM evidence was detected." },
    { signal: "positioner-id", pattern: /getPositionerId/i, evidence: "positioner id DOM evidence was detected." },
    { signal: "content-id", pattern: /getContentId/i, evidence: "content id DOM evidence was detected." },
    { signal: "hidden-input-id", pattern: /getHiddenInputId/i, evidence: "hidden input id DOM evidence was detected." },
    { signal: "list-id", pattern: /getListId/i, evidence: "list id DOM evidence was detected." },
    { signal: "item-id", pattern: /getItemId/i, evidence: "item id DOM evidence was detected." },
    { signal: "root-el", pattern: /getRootEl/i, evidence: "root element DOM evidence was detected." },
    { signal: "label-el", pattern: /getLabelEl/i, evidence: "label element DOM evidence was detected." },
    { signal: "control-el", pattern: /getControlEl/i, evidence: "control element DOM evidence was detected." },
    { signal: "trigger-el", pattern: /getTriggerEl/i, evidence: "trigger element DOM evidence was detected." },
    { signal: "content-el", pattern: /getContentEl/i, evidence: "content element DOM evidence was detected." },
    { signal: "hidden-input-el", pattern: /getHiddenInputEl/i, evidence: "hidden input element DOM evidence was detected." },
    { signal: "list-els", pattern: /getListEls/i, evidence: "list elements DOM evidence was detected." },
    { signal: "item-el", pattern: /getItemEl/i, evidence: "item element DOM evidence was detected." },
    { signal: "dispatch-input-event", pattern: /dispatchInputEvent|dispatchInputValueEvent|input-event/i, evidence: "input event dispatch DOM evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "dom", "signal");
}

function cascadeSelectReadinessApiSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["apiSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["apiSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "collection", pattern: /api\.collection|\bcollection\b/i, evidence: "collection API evidence was detected." },
    { signal: "open", pattern: /api\.open|\bopen\b/i, evidence: "open API evidence was detected." },
    { signal: "focused", pattern: /api\.focused|\bfocused\b/i, evidence: "focused API evidence was detected." },
    { signal: "multiple", pattern: /api\.multiple|\bmultiple\b/i, evidence: "multiple API evidence was detected." },
    { signal: "disabled", pattern: /api\.disabled|\bdisabled\b/i, evidence: "disabled API evidence was detected." },
    { signal: "value", pattern: /api\.value|\bvalue\b/i, evidence: "value API evidence was detected." },
    { signal: "highlighted-value", pattern: /highlightedValue|highlighted-value/i, evidence: "highlighted value API evidence was detected." },
    { signal: "highlighted-items", pattern: /highlightedItems|highlighted-items/i, evidence: "highlighted items API evidence was detected." },
    { signal: "selected-items", pattern: /selectedItems|selected-items/i, evidence: "selected items API evidence was detected." },
    { signal: "has-selected-items", pattern: /hasSelectedItems|has-selected-items/i, evidence: "has selected items API evidence was detected." },
    { signal: "empty", pattern: /api\.empty|\bempty\b/i, evidence: "empty API evidence was detected." },
    { signal: "value-as-string", pattern: /valueAsString|value-as-string/i, evidence: "value as string API evidence was detected." },
    { signal: "reposition", pattern: /api\.reposition|reposition\(/i, evidence: "reposition API evidence was detected." },
    { signal: "focus", pattern: /api\.focus|focus\(/i, evidence: "focus API evidence was detected." },
    { signal: "set-open", pattern: /setOpen|set-open/i, evidence: "set open API evidence was detected." },
    { signal: "set-highlight-value", pattern: /setHighlightValue|set-highlight-value/i, evidence: "set highlight value API evidence was detected." },
    { signal: "clear-highlight-value", pattern: /clearHighlightValue|clear-highlight-value/i, evidence: "clear highlight value API evidence was detected." },
    { signal: "set-value", pattern: /api\.setValue|setValue\(/i, evidence: "set value API evidence was detected." },
    { signal: "select-value", pattern: /selectValue|select-value/i, evidence: "select value API evidence was detected." },
    { signal: "clear-value", pattern: /clearValue|clear-value/i, evidence: "clear value API evidence was detected." },
    { signal: "get-item-state", pattern: /getItemState|get-item-state/i, evidence: "get item state API evidence was detected." },
    { signal: "root-props", pattern: /getRootProps/i, evidence: "root props API evidence was detected." },
    { signal: "label-props", pattern: /getLabelProps/i, evidence: "label props API evidence was detected." },
    { signal: "control-props", pattern: /getControlProps/i, evidence: "control props API evidence was detected." },
    { signal: "trigger-props", pattern: /getTriggerProps/i, evidence: "trigger props API evidence was detected." },
    { signal: "clear-trigger-props", pattern: /getClearTriggerProps/i, evidence: "clear trigger props API evidence was detected." },
    { signal: "positioner-props", pattern: /getPositionerProps/i, evidence: "positioner props API evidence was detected." },
    { signal: "content-props", pattern: /getContentProps/i, evidence: "content props API evidence was detected." },
    { signal: "list-props", pattern: /getListProps/i, evidence: "list props API evidence was detected." },
    { signal: "indicator-props", pattern: /getIndicatorProps/i, evidence: "indicator props API evidence was detected." },
    { signal: "item-props", pattern: /getItemProps/i, evidence: "item props API evidence was detected." },
    { signal: "item-text-props", pattern: /getItemTextProps/i, evidence: "item text props API evidence was detected." },
    { signal: "item-indicator-props", pattern: /getItemIndicatorProps/i, evidence: "item indicator props API evidence was detected." },
    { signal: "value-text-props", pattern: /getValueTextProps/i, evidence: "value text props API evidence was detected." },
    { signal: "hidden-input-props", pattern: /getHiddenInputProps/i, evidence: "hidden input props API evidence was detected." },
    { signal: "combobox-role", pattern: /role:\s*["']combobox|role combobox|role=['"]combobox|\bcombobox\b/i, evidence: "combobox role API evidence was detected." },
    { signal: "listbox-role", pattern: /role:\s*["']listbox|role listbox|role=['"]listbox|\blistbox\b/i, evidence: "listbox role API evidence was detected." },
    { signal: "treeitem-role", pattern: /role:\s*["']treeitem|role treeitem|role=['"]treeitem|\btreeitem\b/i, evidence: "treeitem role API evidence was detected." },
    { signal: "hidden-input", pattern: /hidden:\s*true|hidden input|type=['"]hidden|getHiddenInputProps/i, evidence: "hidden input API evidence was detected." },
    { signal: "aria-hidden", pattern: /aria-hidden/i, evidence: "aria-hidden API evidence was detected." },
    { signal: "data-disabled", pattern: /data-disabled/i, evidence: "data-disabled API evidence was detected." },
    { signal: "data-invalid", pattern: /data-invalid/i, evidence: "data-invalid API evidence was detected." },
    { signal: "data-readonly", pattern: /data-readonly/i, evidence: "data-readonly API evidence was detected." },
    { signal: "data-focus", pattern: /data-focus/i, evidence: "data-focus API evidence was detected." },
    { signal: "data-placement", pattern: /data-placement/i, evidence: "data-placement API evidence was detected." },
    { signal: "data-placeholder-shown", pattern: /data-placeholder-shown/i, evidence: "data-placeholder-shown API evidence was detected." },
    { signal: "data-depth", pattern: /data-depth/i, evidence: "data-depth API evidence was detected." },
    { signal: "data-selected", pattern: /data-selected/i, evidence: "data-selected API evidence was detected." },
    { signal: "data-type", pattern: /data-type/i, evidence: "data-type API evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "api", "signal");
}

function cascadeSelectReadinessTestSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["testSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vitest", pattern: /vitest|describe\(|it\(/i, evidence: "Vitest evidence was detected." },
    { signal: "testing-library", pattern: /@testing-library\/react|screen\.|render\(/i, evidence: "Testing Library evidence was detected." },
    { signal: "user-event", pattern: /@testing-library\/user-event|userEvent|user\./i, evidence: "user-event evidence was detected." },
    { signal: "click-test", pattern: /click-test|user\.click/i, evidence: "click test evidence was detected." },
    { signal: "keyboard-test", pattern: /keyboard-test|user\.keyboard|ArrowRight|ArrowLeft|Home|End|Enter/i, evidence: "keyboard test evidence was detected." },
    { signal: "hover-test", pattern: /hover-test|user\.hover|pointer-enter|pointer-leave/i, evidence: "hover test evidence was detected." },
    { signal: "form-test", pattern: /form-test|hidden-input|type=['"]hidden|form=/i, evidence: "form test evidence was detected." },
    { signal: "aria-test", pattern: /aria-test|toHaveAttribute|getByRole|aria-expanded|aria-activedescendant/i, evidence: "ARIA test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|cascade-select-traces/i, evidence: "artifact upload evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function cascadeSelectReadinessPackageSignals(sourceFiles: CascadeSelectReadinessSourceFile[]): CascadeSelectReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CascadeSelectReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@zag-js/cascade-select", pattern: /@zag-js\/cascade-select/i, evidence: "@zag-js/cascade-select dependency evidence was detected." },
    { signal: "@zag-js/react", pattern: /@zag-js\/react/i, evidence: "@zag-js/react dependency evidence was detected." },
    { signal: "@zag-js/anatomy", pattern: /@zag-js\/anatomy/i, evidence: "@zag-js/anatomy dependency evidence was detected." },
    { signal: "@zag-js/collection", pattern: /@zag-js\/collection|TreeCollection/i, evidence: "@zag-js/collection evidence was detected." },
    { signal: "@zag-js/core", pattern: /@zag-js\/core/i, evidence: "@zag-js/core dependency evidence was detected." },
    { signal: "@zag-js/dismissable", pattern: /@zag-js\/dismissable/i, evidence: "@zag-js/dismissable dependency evidence was detected." },
    { signal: "@zag-js/dom-query", pattern: /@zag-js\/dom-query/i, evidence: "@zag-js/dom-query dependency evidence was detected." },
    { signal: "@zag-js/focus-visible", pattern: /@zag-js\/focus-visible/i, evidence: "@zag-js/focus-visible dependency evidence was detected." },
    { signal: "@zag-js/popper", pattern: /@zag-js\/popper/i, evidence: "@zag-js/popper dependency evidence was detected." },
    { signal: "@zag-js/rect-utils", pattern: /@zag-js\/rect-utils/i, evidence: "@zag-js/rect-utils dependency evidence was detected." },
    { signal: "@zag-js/types", pattern: /@zag-js\/types/i, evidence: "@zag-js/types dependency evidence was detected." },
    { signal: "@zag-js/utils", pattern: /@zag-js\/utils/i, evidence: "@zag-js/utils dependency evidence was detected." },
    { signal: "react", pattern: /"react"|from\s+["']react["']|React\.|react-dom/i, evidence: "React evidence was detected." }
  ];
  return cascadeSelectReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function cascadeSelectReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: CascadeSelectReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/cascade-select-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
