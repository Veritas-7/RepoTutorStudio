import type { AuthReadinessReport, AuthorizationReadinessReport, FormReadinessReport, PaymentReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildFormReadinessReport(walk: WalkResult): Promise<FormReadinessReport> {
  const sourceFiles = await formReadinessSourceFiles(walk);
  const formSetups = formReadinessFormSetups(sourceFiles);
  const fieldRegistrations = formReadinessFieldRegistrations(sourceFiles);
  const validationSignals = formReadinessValidationSignals(sourceFiles);
  const errorSignals = formReadinessErrorSignals(sourceFiles);
  const valueFlowSignals = formReadinessValueFlowSignals(sourceFiles);
  const reactHookFormSignals = formReadinessReactHookFormSignals(sourceFiles);
  const packageSignals = formReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasReactHookForm = packageSignals.some((item) => item.signal === "react-hook-form" && item.readiness === "ready");
  const hasSetup = formSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = formSetups.some((item) => item.readiness === "ready");
  const hasSubmitHandler = formSetups.some((item) => item.hasSubmitHandler);
  const hasFieldRegistration = fieldRegistrations.some((item) => item.registeredFieldCount > 0 || item.controlledFieldCount > 0);
  const hasControlledFields = fieldRegistrations.some((item) => item.controlledFieldCount > 0);
  const hasFieldArray = fieldRegistrations.some((item) => item.fieldArrayCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready");
  const hasResolver = validationSignals.some((item) => ["resolver", "zodResolver", "yupResolver"].includes(item.signal) && item.readiness === "ready");
  const hasErrors = errorSignals.some((item) => item.readiness === "ready");
  const hasDefaultValues = formSetups.some((item) => item.hasDefaultValues) || valueFlowSignals.some((item) => item.signal === "defaultValues" && item.readiness === "ready");

  const riskQueue: FormReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasFieldRegistration) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the form strategy before claiming form-readiness.",
      why: "React Hook Form-style readiness starts with useForm, register, submit handling, controlled components, validation, or an explicit alternative form package.",
      relatedHref: "html/form-readiness.html"
    });
  }
  if (hasReactHookForm && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Expose a useForm setup with register and handleSubmit before treating the form as production-ready.",
      why: "React Hook Form centers readiness around a useForm control surface, field registration, and handleSubmit wiring.",
      relatedHref: "html/form-readiness.html"
    });
  }
  if (hasSetup && !hasSubmitHandler) {
    riskQueue.push({
      priority: "medium",
      action: "Connect forms to handleSubmit or another explicit submit handler.",
      why: "Learners need to trace how validated values leave the form and where side effects start.",
      relatedHref: "html/form-readiness.html"
    });
  }
  if ((hasSetup || hasFieldRegistration) && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Add visible validation rules or schema resolver evidence for important fields.",
      why: "Field registration without validation leaves required data contracts implicit.",
      relatedHref: "html/form-readiness.html"
    });
  }
  if (hasValidation && !hasErrors) {
    riskQueue.push({
      priority: "medium",
      action: "Render or expose form errors near the relevant fields.",
      why: "Validation is only useful to learners and users when errors are surfaced through formState, ErrorMessage, or explicit error helpers.",
      relatedHref: "html/form-readiness.html"
    });
  }
  if ((hasControlledFields || hasFieldArray || hasResolver) && !hasDefaultValues) {
    riskQueue.push({
      priority: "low",
      action: "Document defaultValues for controlled components, field arrays, or schema-backed forms.",
      why: "Default values make reset behavior, controlled inputs, and nested field arrays easier to reason about.",
      relatedHref: "html/form-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run form tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not mount forms, submit values, execute schema validators, or run the analyzed project's tests.",
    relatedHref: "html/form-readiness.html"
  });

  return {
    summary: `React Hook Form식 form readiness report: form setup ${formSetups.length}개, field registration ${fieldRegistrations.length}개, validation signal ${validationSignals.length}개, RHF signal ${reactHookFormSignals.filter((item) => item.readiness === "ready").length}개, error signal ${errorSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "React Hook Form useForm register handleSubmit Controller useController FormProvider useFormContext useFieldArray append remove move insert update replace swap resolver mode reValidateMode criteriaMode errors defaultValues values watch useWatch useFormState formState reset resetField setValue getValues getFieldState setError clearErrors trigger shouldUnregister disabled delayError shouldFocusError context control RegisterOptions FieldValues FieldPath SubmitHandler UseFormReturn ControllerRenderProps Form component FormStateSubscribe createFormControl validation",
    formSetups,
    fieldRegistrations,
    validationSignals,
    errorSignals,
    valueFlowSignals,
    reactHookFormSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"useForm|register|handleSubmit|FormProvider|useFormContext\" src app pages packages", purpose: "Inventory form setup, registration, submit, and provider boundaries." },
      { command: "rg \"Controller|useController|control=|useFieldArray|fields\\\\.map\" src app pages packages", purpose: "Find controlled inputs and dynamic field array flows." },
      { command: "rg \"required|minLength|maxLength|pattern|validate|resolver|zodResolver|yupResolver\" src app pages packages", purpose: "Review inline validation rules and schema resolver usage." },
      { command: "rg \"formState|errors|setError|clearErrors|trigger|isSubmitting|isValid\" src app pages packages", purpose: "Trace error rendering and form state feedback." },
      { command: "rg \"watch|useWatch|getValues|setValue|reset|resetField|defaultValues|unregister\" src app pages packages", purpose: "Check value-flow helpers, reset behavior, and unregister policy." },
      { command: "rg \"mode|reValidateMode|criteriaMode|shouldUnregister|disabled|delayError|shouldFocusError|RegisterOptions|FieldValues|FieldPath|SubmitHandler|UseFormReturn|ControllerRenderProps|createFormControl|FormStateSubscribe\" src app pages packages", purpose: "Review React Hook Form validation modes, lifecycle options, type contracts, low-level control, and form-state subscription APIs." },
      { command: "npx vitest run", purpose: "Run local tests that exercise form validation, submit handlers, controlled inputs, and dynamic fields." }
    ],
    learnerNextSteps: [
      "먼저 useForm을 찾고 register, handleSubmit, formState.errors가 같은 흐름 안에서 연결되는지 확인하세요.",
      "Controller나 useController가 있으면 외부 UI 컴포넌트와 control/defaultValues가 함께 연결되는지 확인하세요.",
      "useFieldArray가 있으면 append/remove와 중첩 name 경로가 화면 렌더링과 validation에 맞게 유지되는지 확인하세요.",
      "resolver, zodResolver, yupResolver가 있으면 schema 파일과 실제 field name이 일치하는지 함께 읽으세요.",
      "React Hook Form 고급 흐름은 mode/reValidateMode/criteriaMode, reset/resetField/setValue/getValues, getFieldState/setError/clearErrors/trigger, formState/useFormState/useWatch를 함께 추적하세요.",
      "이 리포트는 정적 readiness입니다. 실제 submit, validation message, reset 동작은 원본 프로젝트 테스트나 브라우저에서 별도로 확인하세요."
    ]
  };
}

type FormReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function formReadinessSourceFiles(walk: WalkResult): Promise<FormReadinessSourceFile[]> {
  const files: FormReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !formReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!formReadinessPathSignal(file.relPath) && !formReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function formReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return formReadinessPathSignal(filePath)
    || /^(package\.json|tsconfig\.json|vite\.config\.[cm]?[jt]s|next\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|ya?ml)$/i.test(filePath);
}

function formReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(forms?|fields?|validation|validators?|schema|schemas|resolver|resolvers|inputs?|components?)(\/|\.|-|_|$)|react-hook-form|formik|tanstack-form|zod|yup/i.test(filePath);
}

function formReadinessContentSignal(text: string): boolean {
  return /\b(useForm|register|handleSubmit|Controller|Form|FormProvider|useFormContext|useFieldArray|append|remove|move|insert|update|replace|swap|useController|useFormState|FormStateSubscribe|createFormControl|formState|errors|defaultValues|values|resolver|zodResolver|yupResolver|mode|reValidateMode|criteriaMode|setError|clearErrors|trigger|watch|useWatch|getValues|getFieldState|setValue|reset|resetField|unregister|shouldUnregister|disabled|delayError|shouldFocusError|RegisterOptions|FieldValues|FieldPath|SubmitHandler|UseFormReturn|ControllerRenderProps|valueAsNumber|valueAsDate|setValueAs|Formik|useFormik|FieldArray|FormData|HTMLFormElement)\b/i.test(text);
}

function formReadinessFormSetups(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["formSetups"] {
  const rows: FormReadinessReport["formSetups"] = [];
  for (const source of sourceFiles) {
    const useFormCount = countMatches(source.text, /\buseForm\s*(<[^>]+>)?\s*\(/gi);
    const hasRegister = /\bregister\s*\(/i.test(source.text);
    const hasSubmitHandler = /\bhandleSubmit\s*\(|onSubmit\s*=\s*{?[^}\n]*handleSubmit|<form\b[^>]*onSubmit|\bfunction\s+onSubmit\b|\bconst\s+onSubmit\b/i.test(source.text);
    const hasDefaultValues = /\b(defaultValues|values)\s*:/i.test(source.text);
    const hasFormProvider = /\bFormProvider\b|\buseFormContext\b/i.test(source.text);
    const hasNativeForm = /<form\b|new\s+FormData\b|\bHTMLFormElement\b/i.test(source.text);
    const hasSetupSignal = useFormCount > 0 || hasRegister || hasSubmitHandler || hasDefaultValues || hasFormProvider || hasNativeForm || /\b(useFormik|<Formik|FormikProvider|createFormHook)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      library: formReadinessLibrary(source),
      useFormCount,
      hasSubmitHandler,
      hasDefaultValues,
      hasFormProvider,
      readiness: useFormCount > 0 && hasRegister && hasSubmitHandler ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains useForm ${useFormCount}, register ${hasRegister ? "yes" : "no"}, submit handler ${hasSubmitHandler ? "yes" : "no"}, defaultValues ${hasDefaultValues ? "yes" : "no"}, FormProvider/useFormContext ${hasFormProvider ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function formReadinessLibrary(source: FormReadinessSourceFile): FormReadinessReport["formSetups"][number]["library"] {
  if (/react-hook-form|\buseForm\b|\bregister\s*\(|\bhandleSubmit\b|\bController\b|\bFormProvider\b/i.test(source.text)) return "react-hook-form";
  if (/formik|\buseFormik\b|<Formik\b|FormikProvider/i.test(source.text)) return "formik";
  if (/@tanstack\/(react-)?form|createFormHook|formOptions/i.test(source.text)) return "tanstack-form";
  if (/<form\b|new\s+FormData\b|\bHTMLFormElement\b/i.test(source.text)) return "native";
  return "unknown";
}

function formReadinessFieldRegistrations(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["fieldRegistrations"] {
  const rows: FormReadinessReport["fieldRegistrations"] = [];
  for (const source of sourceFiles) {
    const registerCount = countMatches(source.text, /\bregister\s*\(/gi);
    const namedFieldCount = countMatches(source.text, /\bname\s*=\s*["'][^"']+["']/gi);
    const registeredFieldCount = registerCount + namedFieldCount;
    const controlledFieldCount = countMatches(source.text, /\bController\b|\buseController\s*\(|\bcontrol\s*=/gi);
    const fieldArrayCount = countMatches(source.text, /\buseFieldArray\s*\(|\bfields\.map\b|\b(append|remove|swap|move|insert|prepend|replace|update)\s*\(/gi);
    const nestedFieldSignals = countMatches(source.text, /\bregister\s*\(\s*["'`][^"'`]+[.[\]][^"'`]*["'`]|\bname\s*=\s*["'][^"']+[.[\]][^"']*["']/gi);
    if (registeredFieldCount + controlledFieldCount + fieldArrayCount + nestedFieldSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      registeredFieldCount,
      controlledFieldCount,
      fieldArrayCount,
      nestedFieldSignals,
      readiness: registeredFieldCount > 0 && (controlledFieldCount > 0 || nestedFieldSignals > 0 || fieldArrayCount > 0) ? "ready" : registeredFieldCount > 0 || controlledFieldCount > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains registered field signals ${registeredFieldCount}, controlled field signals ${controlledFieldCount}, field array signals ${fieldArrayCount}, nested field signals ${nestedFieldSignals}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 120);
}

function formReadinessValidationSignals(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["validationSignals"] {
  const specs: Array<{ signal: FormReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "required", pattern: /\brequired\s*[:=]|\brequired\b/i, evidence: "required field validation evidence was detected." },
    { signal: "min", pattern: /\bmin\s*[:=]|\bmin\s*\(/i, evidence: "minimum value validation evidence was detected." },
    { signal: "max", pattern: /\bmax\s*[:=]|\bmax\s*\(/i, evidence: "maximum value validation evidence was detected." },
    { signal: "minLength", pattern: /\bminLength\s*[:=]|\.min\s*\(/i, evidence: "minimum length validation evidence was detected." },
    { signal: "maxLength", pattern: /\bmaxLength\s*[:=]|\.max\s*\(/i, evidence: "maximum length validation evidence was detected." },
    { signal: "pattern", pattern: /\bpattern\s*[:=]|new\s+RegExp\b|\/.+\/[gimsuy]*/i, evidence: "pattern validation evidence was detected." },
    { signal: "validate", pattern: /\bvalidate\s*[:=]|\bvalidate\s*\(/i, evidence: "custom validate callback evidence was detected." },
    { signal: "resolver", pattern: /\bresolver\s*[:=]|@hookform\/resolvers/i, evidence: "React Hook Form resolver evidence was detected." },
    { signal: "zodResolver", pattern: /\bzodResolver\s*\(|@hookform\/resolvers\/zod/i, evidence: "Zod resolver evidence was detected." },
    { signal: "yupResolver", pattern: /\byupResolver\s*\(|@hookform\/resolvers\/yup/i, evidence: "Yup resolver evidence was detected." },
    { signal: "schema", pattern: /\b(schema|validationSchema)\b|z\.object\s*\(|yup\.object\s*\(/i, evidence: "schema validation evidence was detected." }
  ];
  return formReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function formReadinessErrorSignals(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["errorSignals"] {
  const specs: Array<{ signal: FormReadinessReport["errorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "formState-errors", pattern: /\bformState\s*:\s*{[^}]*errors\b|\bformState\.errors\b|\berrors\.[A-Za-z_$]/i, evidence: "formState errors evidence was detected." },
    { signal: "ErrorMessage", pattern: /\bErrorMessage\b/i, evidence: "ErrorMessage component evidence was detected." },
    { signal: "setError", pattern: /\bsetError\s*\(/i, evidence: "setError evidence was detected." },
    { signal: "clearErrors", pattern: /\bclearErrors\s*\(/i, evidence: "clearErrors evidence was detected." },
    { signal: "trigger", pattern: /\btrigger\s*\(/i, evidence: "trigger validation evidence was detected." },
    { signal: "isValid", pattern: /\bisValid\b/i, evidence: "isValid form state evidence was detected." },
    { signal: "isSubmitting", pattern: /\bisSubmitting\b/i, evidence: "isSubmitting form state evidence was detected." },
    { signal: "dirtyFields", pattern: /\bdirtyFields\b/i, evidence: "dirtyFields form state evidence was detected." },
    { signal: "touchedFields", pattern: /\btouchedFields\b/i, evidence: "touchedFields form state evidence was detected." }
  ];
  return formReadinessSignalFromSpecs(sourceFiles, specs, "error", "signal");
}

function formReadinessValueFlowSignals(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["valueFlowSignals"] {
  const specs: Array<{ signal: FormReadinessReport["valueFlowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "watch", pattern: /\bwatch\s*\(/i, evidence: "watch value subscription evidence was detected." },
    { signal: "useWatch", pattern: /\buseWatch\s*\(/i, evidence: "useWatch evidence was detected." },
    { signal: "getValues", pattern: /\bgetValues\s*\(/i, evidence: "getValues evidence was detected." },
    { signal: "setValue", pattern: /\bsetValue\s*\(/i, evidence: "setValue evidence was detected." },
    { signal: "reset", pattern: /\breset\s*\(/i, evidence: "reset evidence was detected." },
    { signal: "resetField", pattern: /\bresetField\s*\(/i, evidence: "resetField evidence was detected." },
    { signal: "defaultValues", pattern: /\bdefaultValues\s*:/i, evidence: "defaultValues evidence was detected." },
    { signal: "values", pattern: /\bvalues\s*:/i, evidence: "controlled values evidence was detected." },
    { signal: "unregister", pattern: /\bunregister\s*\(/i, evidence: "unregister evidence was detected." },
    { signal: "shouldUnregister", pattern: /\bshouldUnregister\b/i, evidence: "shouldUnregister policy evidence was detected." }
  ];
  return formReadinessSignalFromSpecs(sourceFiles, specs, "value-flow", "signal");
}

function formReadinessReactHookFormSignals(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["reactHookFormSignals"] {
  const specs: Array<{ signal: FormReadinessReport["reactHookFormSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "use-form", pattern: /\buseForm\s*(<[^>]+>)?\s*\(/i, evidence: "useForm evidence was detected." },
    { signal: "register", pattern: /\bregister\s*\(/i, evidence: "register evidence was detected." },
    { signal: "handle-submit", pattern: /\bhandleSubmit\b/i, evidence: "handleSubmit evidence was detected." },
    { signal: "controller", pattern: /\bController\b/i, evidence: "Controller evidence was detected." },
    { signal: "use-controller", pattern: /\buseController\s*\(/i, evidence: "useController evidence was detected." },
    { signal: "form-provider", pattern: /\bFormProvider\b/i, evidence: "FormProvider evidence was detected." },
    { signal: "use-form-context", pattern: /\buseFormContext\s*(<[^>]+>)?\s*\(/i, evidence: "useFormContext evidence was detected." },
    { signal: "use-field-array", pattern: /\buseFieldArray\s*\(/i, evidence: "useFieldArray evidence was detected." },
    { signal: "field-array-append", pattern: /\bappend\s*\(/i, evidence: "field array append evidence was detected." },
    { signal: "field-array-remove", pattern: /\bremove\s*\(/i, evidence: "field array remove evidence was detected." },
    { signal: "field-array-move", pattern: /\bmove\s*\(/i, evidence: "field array move evidence was detected." },
    { signal: "field-array-insert", pattern: /\binsert\s*\(/i, evidence: "field array insert evidence was detected." },
    { signal: "field-array-update", pattern: /\bupdate\s*\(/i, evidence: "field array update evidence was detected." },
    { signal: "field-array-replace", pattern: /\breplace\s*\(/i, evidence: "field array replace evidence was detected." },
    { signal: "field-array-swap", pattern: /\bswap\s*\(/i, evidence: "field array swap evidence was detected." },
    { signal: "use-watch", pattern: /\buseWatch\s*\(/i, evidence: "useWatch evidence was detected." },
    { signal: "watch", pattern: /\bwatch\s*\(/i, evidence: "watch evidence was detected." },
    { signal: "use-form-state", pattern: /\buseFormState\s*\(/i, evidence: "useFormState evidence was detected." },
    { signal: "form-state", pattern: /\bformState\b/i, evidence: "formState evidence was detected." },
    { signal: "resolver", pattern: /\bresolver\s*[:=]|@hookform\/resolvers|\b(zodResolver|yupResolver|valibotResolver)\b/i, evidence: "resolver evidence was detected." },
    { signal: "mode", pattern: /\bmode\s*:/i, evidence: "validation mode evidence was detected." },
    { signal: "revalidate-mode", pattern: /\breValidateMode\s*:/i, evidence: "reValidateMode evidence was detected." },
    { signal: "criteria-mode", pattern: /\bcriteriaMode\s*:/i, evidence: "criteriaMode evidence was detected." },
    { signal: "default-values", pattern: /\bdefaultValues\s*:/i, evidence: "defaultValues evidence was detected." },
    { signal: "values", pattern: /\bvalues\s*:/i, evidence: "values evidence was detected." },
    { signal: "reset", pattern: /\breset\s*\(/i, evidence: "reset evidence was detected." },
    { signal: "reset-field", pattern: /\bresetField\s*\(/i, evidence: "resetField evidence was detected." },
    { signal: "set-value", pattern: /\bsetValue\s*\(/i, evidence: "setValue evidence was detected." },
    { signal: "get-values", pattern: /\bgetValues\s*\(/i, evidence: "getValues evidence was detected." },
    { signal: "get-field-state", pattern: /\bgetFieldState\s*\(/i, evidence: "getFieldState evidence was detected." },
    { signal: "set-error", pattern: /\bsetError\s*\(/i, evidence: "setError evidence was detected." },
    { signal: "clear-errors", pattern: /\bclearErrors\s*\(/i, evidence: "clearErrors evidence was detected." },
    { signal: "trigger", pattern: /\btrigger\s*\(/i, evidence: "trigger evidence was detected." },
    { signal: "should-unregister", pattern: /\bshouldUnregister\b/i, evidence: "shouldUnregister evidence was detected." },
    { signal: "disabled", pattern: /\bdisabled\s*[:=]|<[^>]+\sdisabled\b/i, evidence: "disabled field/form evidence was detected." },
    { signal: "delay-error", pattern: /\bdelayError\s*:/i, evidence: "delayError evidence was detected." },
    { signal: "should-focus-error", pattern: /\bshouldFocusError\s*:/i, evidence: "shouldFocusError evidence was detected." },
    { signal: "context", pattern: /\bcontext\s*:/i, evidence: "form context option evidence was detected." },
    { signal: "control", pattern: /\bcontrol\b/i, evidence: "control object evidence was detected." },
    { signal: "register-options", pattern: /\bRegisterOptions\b|\b(required|min|max|minLength|maxLength|pattern|validate|deps|valueAsNumber|valueAsDate|setValueAs)\s*:/i, evidence: "register options evidence was detected." },
    { signal: "validate-option", pattern: /\bvalidate\s*:/i, evidence: "validate option evidence was detected." },
    { signal: "deps-option", pattern: /\bdeps\s*:/i, evidence: "deps option evidence was detected." },
    { signal: "value-as-number", pattern: /\bvalueAsNumber\s*:/i, evidence: "valueAsNumber evidence was detected." },
    { signal: "value-as-date", pattern: /\bvalueAsDate\s*:/i, evidence: "valueAsDate evidence was detected." },
    { signal: "set-value-as", pattern: /\bsetValueAs\s*:/i, evidence: "setValueAs evidence was detected." },
    { signal: "dirty-fields", pattern: /\bdirtyFields\b/i, evidence: "dirtyFields evidence was detected." },
    { signal: "touched-fields", pattern: /\btouchedFields\b/i, evidence: "touchedFields evidence was detected." },
    { signal: "is-submitting", pattern: /\bisSubmitting\b/i, evidence: "isSubmitting evidence was detected." },
    { signal: "is-valid", pattern: /\bisValid\b/i, evidence: "isValid evidence was detected." },
    { signal: "field-values-type", pattern: /\bFieldValues\b/i, evidence: "FieldValues type evidence was detected." },
    { signal: "field-path-type", pattern: /\bFieldPath\b|\bPath</i, evidence: "FieldPath/Path type evidence was detected." },
    { signal: "submit-handler-type", pattern: /\bSubmitHandler\b/i, evidence: "SubmitHandler type evidence was detected." },
    { signal: "use-form-return-type", pattern: /\bUseFormReturn\b/i, evidence: "UseFormReturn type evidence was detected." },
    { signal: "controller-render", pattern: /\brender\s*=\s*{[^}]*field|ControllerRenderProps/i, evidence: "Controller render prop evidence was detected." },
    { signal: "form-component", pattern: /\bForm\s*<|<Form\b|control\.handleSubmit/i, evidence: "React Hook Form Form component evidence was detected." },
    { signal: "form-state-subscribe", pattern: /\bFormStateSubscribe\b|formStateSubscribe/i, evidence: "FormStateSubscribe evidence was detected." },
    { signal: "create-form-control", pattern: /\bcreateFormControl\s*(<[^>]+>)?\s*\(/i, evidence: "createFormControl evidence was detected." }
  ];
  return formReadinessSignalFromSpecs(sourceFiles, specs, "react-hook-form", "signal");
}

function formReadinessPackageSignals(sourceFiles: FormReadinessSourceFile[]): FormReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FormReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-hook-form", pattern: /["']react-hook-form["']|from\s+["']react-hook-form["']|\buseForm\b|\bregister\s*\(/i, evidence: "react-hook-form package/import evidence was detected." },
    { signal: "hookform-resolvers", pattern: /@hookform\/resolvers|\b(zodResolver|yupResolver)\b/i, evidence: "@hookform/resolvers package/import evidence was detected." },
    { signal: "formik", pattern: /["']formik["']|\buseFormik\b|<Formik\b/i, evidence: "Formik package/import evidence was detected." },
    { signal: "tanstack-form", pattern: /@tanstack\/(react-)?form|createFormHook|formOptions/i, evidence: "TanStack Form package/import evidence was detected." },
    { signal: "zod", pattern: /["']zod["']|\bz\.object\s*\(/i, evidence: "Zod package/import evidence was detected." },
    { signal: "yup", pattern: /["']yup["']|yup\.object\s*\(/i, evidence: "Yup package/import evidence was detected." },
    { signal: "valibot", pattern: /["']valibot["']|\bv\.object\s*\(/i, evidence: "Valibot package/import evidence was detected." }
  ];
  return formReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function formReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FormReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/form-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildAuthReadinessReport(walk: WalkResult): Promise<AuthReadinessReport> {
  const sourceFiles = await authReadinessSourceFiles(walk);
  const authSetups = authReadinessAuthSetups(sourceFiles);
  const sessionSurfaces = authReadinessSessionSurfaces(sourceFiles);
  const runtimeSignals = authReadinessRuntimeSignals(sourceFiles);
  const protectionSignals = authReadinessProtectionSignals(sourceFiles);
  const providerSignals = authReadinessProviderSignals(sourceFiles);
  const callbackSignals = authReadinessCallbackSignals(sourceFiles);
  const credentialSignals = authReadinessCredentialSignals(sourceFiles);
  const packageSignals = authReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasAuthPackage = packageSignals.some((item) => ["next-auth", "@auth/core", "better-auth", "@clerk/nextjs", "@auth0/nextjs-auth0"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = authSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = authSetups.some((item) => item.readiness === "ready");
  const hasProvider = providerSignals.some((item) => ["oauth-provider", "credentials-provider", "email-provider", "webauthn-passkey"].includes(item.signal) && item.readiness === "ready");
  const hasSecret = credentialSignals.some((item) => ["AUTH_SECRET", "NEXTAUTH_SECRET"].includes(item.signal) && item.readiness === "ready");
  const hasProtection = protectionSignals.some((item) => item.readiness === "ready");
  const hasSession = sessionSurfaces.some((item) => item.readiness !== "missing");
  const hasRuntime = runtimeSignals.some((item) => item.readiness === "ready");
  const hasCallbacks = callbackSignals.some((item) => item.readiness === "ready");
  const hasCredentialProvider = providerSignals.some((item) => item.signal === "credentials-provider" && item.readiness === "ready");
  const hasCsrf = protectionSignals.some((item) => item.signal === "csrf" && item.readiness === "ready") || credentialSignals.some((item) => item.signal === "csrf-token" && item.readiness === "ready");

  const riskQueue: AuthReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasSession) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the authentication strategy before claiming auth readiness.",
      why: "Auth readiness starts with an explicit package, auth setup, session surface, route handler, middleware, or custom guard.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if (hasAuthPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Expose an auth setup with handlers/auth exports or a clear route handler.",
      why: "Auth.js-style projects need a visible setup surface that owns request handlers, session helpers, and sign-in/sign-out functions.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if (hasReadySetup && !hasRuntime) {
    riskQueue.push({
      priority: "medium",
      action: "Document Auth.js runtime exports and session/runtime configuration before treating the auth setup as production-ready.",
      why: "Auth.js v5 readiness depends on generated handlers/auth/signIn/signOut exports, session strategy and age policies, trustHost/basePath, WebAuthn enablement, and runtime env boundaries.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if (hasSetup && !hasProvider) {
    riskQueue.push({
      priority: "high",
      action: "Define at least one provider or document why authentication is delegated elsewhere.",
      why: "A setup without OAuth, credentials, email, passkey, or external provider evidence cannot explain how users sign in.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if ((hasAuthPackage || hasSetup) && !hasSecret) {
    riskQueue.push({
      priority: "high",
      action: "Document required auth secret environment variables in the deployment checklist.",
      why: "Auth.js and similar session systems need stable secrets for token, cookie, and callback security.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if (hasSession && !hasProtection) {
    riskQueue.push({
      priority: "medium",
      action: "Map which routes, middleware, or server actions require an authenticated session.",
      why: "Session reads without explicit route protection make it hard to know which user data paths are guarded.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if (hasProvider && !hasCallbacks) {
    riskQueue.push({
      priority: "low",
      action: "Review callbacks and events for account linking, profile shaping, and session/JWT claims.",
      why: "Provider setup often needs callback logic to constrain sign-in, project user roles, or copy claims into sessions.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  if (hasCredentialProvider && !hasCsrf) {
    riskQueue.push({
      priority: "medium",
      action: "Verify CSRF and rate-limit coverage for credential-style sign-in flows.",
      why: "Password or credential flows need explicit anti-abuse and CSRF review beyond provider configuration.",
      relatedHref: "html/auth-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run auth flow tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not start auth servers, call providers, mint tokens, submit credentials, or run the analyzed project's tests.",
    relatedHref: "html/auth-readiness.html"
  });

  return {
    summary: `Auth.js식 auth readiness report: auth setup ${authSetups.length}개, session surface ${sessionSurfaces.length}개, runtime signal ${runtimeSignals.length}개, protection signal ${protectionSignals.length}개, provider signal ${providerSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Auth.js NextAuth auth handlers auth signIn signOut exports providers callbacks session strategy maxAge updateAge jwt middleware protected routes trustHost basePath raw env secrets adapter WebAuthn experimental useSession SessionProvider",
    authSetups,
    sessionSurfaces,
    runtimeSignals,
    protectionSignals,
    providerSignals,
    callbackSignals,
    credentialSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"NextAuth|auth\\\\(|handlers|GET|POST|middleware|withAuth\" src app pages packages", purpose: "Inventory auth setup files, route handlers, and middleware boundaries." },
      { command: "rg \"providers|Credentials|GitHub|Google|Email|Passkey|WebAuthn|adapter\" src app pages packages", purpose: "Review sign-in providers, credential flows, passkeys, and database adapter wiring." },
      { command: "rg \"callbacks|authorized|jwt|session|signIn|redirect|events\" src app pages packages", purpose: "Trace callback logic, session/JWT shaping, and authorization gates." },
      { command: "rg \"useSession|SessionProvider|getServerSession|getToken|signIn|signOut\" src app pages packages", purpose: "Find client and server session consumers plus sign-in/sign-out entry points." },
      { command: "rg \"handlers|auth\\\\s*,|signIn|signOut|session\\\\s*:|strategy|maxAge|updateAge|trustHost|basePath|experimental|enableWebAuthn|rawEnv|AUTH_TRUST_HOST\" src app pages packages", purpose: "Check Auth.js runtime exports, session policy, host/path config, WebAuthn flags, and runtime env boundaries." },
      { command: "rg \"AUTH_SECRET|NEXTAUTH_SECRET|AUTH_URL|NEXTAUTH_URL|clientId|clientSecret|cookies|csrf\" .", purpose: "Check documented environment variables, provider credentials, cookies, and CSRF hints." },
      { command: "npx vitest run", purpose: "Run local tests that exercise protected routes, callbacks, session reads, and sign-in/sign-out behavior." }
    ],
    learnerNextSteps: [
      "먼저 auth setup 파일에서 NextAuth 또는 auth/handlers export가 어디서 만들어지는지 확인하세요.",
      "Auth.js v5 프로젝트라면 handlers, auth, signIn, signOut export와 session strategy, maxAge, updateAge, trustHost, basePath 설정을 같이 확인하세요.",
      "providers 배열을 읽고 OAuth, credentials, email, passkey, adapter 중 어떤 로그인 경로가 실제로 열려 있는지 분리하세요.",
      "callbacks와 events에서는 signIn, jwt, session, authorized 로직이 사용자 역할과 claim을 어떻게 바꾸는지 확인하세요.",
      "middleware나 protected route에서 session required, redirect, role check가 어디에 걸려 있는지 원본 링크로 추적하세요.",
      "이 리포트는 정적 readiness입니다. 실제 로그인, 쿠키, 토큰, provider callback은 원본 프로젝트 테스트나 안전한 개발 환경에서 별도로 확인하세요."
    ]
  };
}

type AuthReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function authReadinessSourceFiles(walk: WalkResult): Promise<AuthReadinessSourceFile[]> {
  const files: AuthReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !authReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!authReadinessPathSignal(file.relPath) && !authReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function authReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return authReadinessPathSignal(filePath)
    || /^(package\.json|middleware\.[cm]?[jt]s|middleware\.[jt]sx?|\.env\.example|\.env\.sample|auth\.[cm]?[jt]s|next\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|prisma)$/i.test(filePath);
}

function authReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(auth|authentication|session|sessions|signin|sign-in|signout|sign-out|login|logout|middleware|protected|providers?|adapters?|callbacks?)(\/|\.|-|_|$)|next-auth|authjs|better-auth|clerk|auth0/i.test(filePath);
}

function authReadinessContentSignal(text: string): boolean {
  return /\b(NextAuth|auth\s*\(|handlers\b|SessionProvider|useSession|getServerSession|getToken|signIn|signOut|providers\s*:|callbacks\s*:|authorized\s*\(|middleware|withAuth|AUTH_SECRET|NEXTAUTH_SECRET|AUTH_URL|NEXTAUTH_URL|AUTH_TRUST_HOST|clientId|clientSecret|Credentials|OAuth|WebAuthn|Passkey|adapter\s*:|session\s*:|strategy\s*:|maxAge\s*:|updateAge\s*:|trustHost\s*:|basePath\s*:|rawEnv|enableWebAuthn|jwt\s*:|csrf|CSRF|ClerkProvider|auth0)\b/i.test(text);
}

function authReadinessAuthSetups(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["authSetups"] {
  const rows: AuthReadinessReport["authSetups"] = [];
  for (const source of sourceFiles) {
    const handlerCount = countMatches(source.text, /\bhandlers\b|export\s+\{\s*GET\s*,\s*POST\s*\}|export\s+const\s+(GET|POST)\b|\bhandleAuth\s*\(/gi);
    const hasAuthFunction = /\bNextAuth\s*\(|\bauth\s*\(|\bBetterAuth\s*\(|\bbetterAuth\s*\(|\bClerk\b|\bauth0\b/i.test(source.text);
    const hasRouteHandler = /app\/api\/auth|pages\/api\/auth|route\.[jt]s|\[\.{3}nextauth\]|export\s+\{\s*GET\s*,\s*POST\s*\}|export\s+const\s+\{[^}]*handlers/i.test(source.filePath) || /\bhandlers\b|export\s+const\s+(GET|POST)\b/i.test(source.text);
    const hasMiddleware = /(^|\/)middleware\.[cm]?[jt]sx?$/i.test(source.filePath) || /\bauth\s+as\s+middleware\b|\bwithAuth\b|\bexport\s+default\s+auth\b|\bmiddleware\b/i.test(source.text);
    const hasSetupSignal = handlerCount > 0 || hasAuthFunction || hasRouteHandler || hasMiddleware || /\bproviders\s*:|\bcallbacks\s*:|\bsession\s*:/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      framework: authReadinessFramework(source),
      handlerCount,
      hasAuthFunction,
      hasRouteHandler,
      hasMiddleware,
      readiness: hasAuthFunction && (hasRouteHandler || hasMiddleware || handlerCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains handlers ${handlerCount}, auth function ${hasAuthFunction ? "yes" : "no"}, route handler ${hasRouteHandler ? "yes" : "no"}, middleware ${hasMiddleware ? "yes" : "no"}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function authReadinessFramework(source: AuthReadinessSourceFile): AuthReadinessReport["authSetups"][number]["framework"] {
  if (/next-auth|NextAuth|@auth\/nextjs/i.test(source.text)) return "next-auth";
  if (/@auth\/core|Auth\.js|authjs/i.test(source.text)) return "authjs";
  if (/better-auth|betterAuth/i.test(source.text)) return "better-auth";
  if (/@clerk\/nextjs|ClerkProvider|clerkMiddleware/i.test(source.text)) return "clerk";
  if (/@auth0\/nextjs-auth0|handleAuth|auth0/i.test(source.text)) return "auth0";
  if (/\bauth\s*\(|\bsession\b|\bmiddleware\b/i.test(source.text)) return "custom";
  return "unknown";
}

function authReadinessSessionSurfaces(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["sessionSurfaces"] {
  const rows: AuthReadinessReport["sessionSurfaces"] = [];
  for (const source of sourceFiles) {
    const clientSessionCount = countMatches(source.text, /\buseSession\s*\(|\bSessionProvider\b|\bgetSession\s*\(|\bsession\s*=/gi);
    const serverSessionCount = countMatches(source.text, /\bgetServerSession\s*\(|\bgetToken\s*\(|\bauth\s*\(\s*\)|\breq\.auth\b|\bserverSession\b/gi);
    const providerBoundaryCount = countMatches(source.text, /\bSessionProvider\b|\bAuthProvider\b|\bClerkProvider\b|\bUserProvider\b/gi);
    const signInOutCount = countMatches(source.text, /\bsignIn\s*\(|\bsignOut\s*\(|\bSignInButton\b|\bSignOutButton\b/gi);
    if (clientSessionCount + serverSessionCount + providerBoundaryCount + signInOutCount === 0) continue;
    rows.push({
      filePath: source.filePath,
      clientSessionCount,
      serverSessionCount,
      providerBoundaryCount,
      signInOutCount,
      readiness: (clientSessionCount > 0 || serverSessionCount > 0) && signInOutCount > 0 ? "ready" : clientSessionCount + serverSessionCount + providerBoundaryCount + signInOutCount > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains client session ${clientSessionCount}, server session ${serverSessionCount}, provider boundary ${providerBoundaryCount}, sign-in/out ${signInOutCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 120);
}

function authReadinessRuntimeSignals(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: AuthReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "handlers-export", pattern: /export\s+const\s+\{[^}]*handlers|export\s+\{\s*(GET|POST)\s*,\s*(POST|GET)\s*\}|handlers\s*[:,]/i, evidence: "Auth.js handlers export evidence was detected." },
    { signal: "auth-export", pattern: /export\s+const\s+\{[^}]*auth|export\s+\{\s*auth\s*\}|\bauth\s+as\s+middleware\b/i, evidence: "Auth.js auth helper export evidence was detected." },
    { signal: "sign-in-export", pattern: /export\s+const\s+\{[^}]*signIn|\bsignIn\s*\(/i, evidence: "Auth.js signIn export/helper evidence was detected." },
    { signal: "sign-out-export", pattern: /export\s+const\s+\{[^}]*signOut|\bsignOut\s*\(/i, evidence: "Auth.js signOut export/helper evidence was detected." },
    { signal: "session-strategy", pattern: /\bsession\s*:\s*\{[^}]*strategy\s*:\s*["'](?:jwt|database)["']|\bstrategy\s*:\s*["'](?:jwt|database)["']/i, evidence: "session strategy evidence was detected." },
    { signal: "session-max-age", pattern: /\bmaxAge\s*:\s*(?:\d|[A-Za-z_])|\bsession\s*:\s*\{[^}]*maxAge\b/i, evidence: "session maxAge evidence was detected." },
    { signal: "session-update-age", pattern: /\bupdateAge\s*:\s*(?:\d|[A-Za-z_])|\bsession\s*:\s*\{[^}]*updateAge\b/i, evidence: "session updateAge evidence was detected." },
    { signal: "trust-host", pattern: /\btrustHost\s*:\s*true\b|\bAUTH_TRUST_HOST\b|\btrust host\b/i, evidence: "trustHost evidence was detected." },
    { signal: "base-path", pattern: /\bbasePath\s*:|\bbasePath\b|\/api\/auth\b|\/auth\//i, evidence: "auth base path evidence was detected." },
    { signal: "experimental-webauthn", pattern: /\bexperimental\s*:\s*\{[^}]*enableWebAuthn\b|\benableWebAuthn\s*:\s*true\b|next-auth\/webauthn/i, evidence: "experimental WebAuthn evidence was detected." },
    { signal: "raw-env", pattern: /\brawEnv\b|\benv\.AUTH_|\bprocess\.env\.AUTH_|\bprocess\.env\.NEXTAUTH_|\bAUTH_TRUST_HOST\b/i, evidence: "Auth.js env/runtime binding evidence was detected." }
  ];
  return authReadinessSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function authReadinessProtectionSignals(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["protectionSignals"] {
  const specs: Array<{ signal: AuthReadinessReport["protectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "middleware", pattern: /(^|\/)middleware\.[cm]?[jt]sx?$|\bauth\s+as\s+middleware\b|\bwithAuth\b|\bmiddleware\b/i, evidence: "middleware protection evidence was detected." },
    { signal: "authorized-callback", pattern: /\bauthorized\s*[:(]|\bcallbacks\s*:\s*{[^}]*authorized\b/i, evidence: "authorized callback evidence was detected." },
    { signal: "protected-route", pattern: /\bprotected\b|\brequireAuth\b|\bensureAuth\b|\bprivateRoute\b|\bauthRequired\b/i, evidence: "protected route naming evidence was detected." },
    { signal: "redirect", pattern: /\bredirect\s*\(|\bNextResponse\.redirect\b|\bcallbackUrl\b|\bsignIn\([^)]*callbackUrl/i, evidence: "auth redirect evidence was detected." },
    { signal: "role-check", pattern: /\b(role|roles|permission|permissions|isAdmin|adminOnly|RBAC)\b/i, evidence: "role or permission check evidence was detected." },
    { signal: "session-required", pattern: /\bif\s*\([^)]*!session|\bif\s*\([^)]*!.*auth|\bsession\s*==\s*null|\bstatus\s*===\s*['"]unauthenticated/i, evidence: "required session guard evidence was detected." },
    { signal: "csrf", pattern: /\bcsrf\b|\bCSRF\b|getCsrfToken|Cross-Site Request Forgery/i, evidence: "CSRF protection evidence was detected." }
  ];
  return authReadinessSignalFromSpecs(sourceFiles, specs, "protection", "signal");
}

function authReadinessProviderSignals(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["providerSignals"] {
  const specs: Array<{ signal: AuthReadinessReport["providerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "oauth-provider", pattern: /\bproviders\s*:\s*\[|next-auth\/providers\/(github|google|keycloak|azure|discord|facebook)|\bOAuth\b|\bOIDC\b/i, evidence: "OAuth/OIDC provider evidence was detected." },
    { signal: "credentials-provider", pattern: /next-auth\/providers\/credentials|\bCredentials\s*\(|\bcredentials\s*:/i, evidence: "credentials provider evidence was detected." },
    { signal: "email-provider", pattern: /next-auth\/providers\/(email|resend|sendgrid)|\bEmail\s*\(|\bResend\s*\(|\bpasswordless\b/i, evidence: "email/passwordless provider evidence was detected." },
    { signal: "webauthn-passkey", pattern: /\bWebAuthn\b|\bPasskey\b|\bpasskeys?\b/i, evidence: "WebAuthn/passkey evidence was detected." },
    { signal: "adapter", pattern: /\badapter\s*:|@auth\/[a-z0-9-]+-adapter|\bAdapter\b/i, evidence: "database adapter evidence was detected." },
    { signal: "database-session", pattern: /\bsession\s*:\s*{[^}]*strategy\s*:\s*['"]database|sessionToken|sessionsTable|AdapterSession/i, evidence: "database session evidence was detected." },
    { signal: "jwt-session", pattern: /\bsession\s*:\s*{[^}]*strategy\s*:\s*['"]jwt|\bjwt\s*[:(]|JSON Web Tokens?|JWE/i, evidence: "JWT session evidence was detected." }
  ];
  return authReadinessSignalFromSpecs(sourceFiles, specs, "provider", "signal");
}

function authReadinessCallbackSignals(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["callbackSignals"] {
  const specs: Array<{ signal: AuthReadinessReport["callbackSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "signIn", pattern: /\bsignIn\s*[:(]/i, evidence: "signIn callback or helper evidence was detected." },
    { signal: "redirect", pattern: /\bredirect\s*[:(]/i, evidence: "redirect callback evidence was detected." },
    { signal: "session", pattern: /\bsession\s*[:(]/i, evidence: "session callback evidence was detected." },
    { signal: "jwt", pattern: /\bjwt\s*[:(]/i, evidence: "jwt callback evidence was detected." },
    { signal: "authorized", pattern: /\bauthorized\s*[:(]/i, evidence: "authorized callback evidence was detected." },
    { signal: "account", pattern: /\baccount\s*[:.]|\baccount\)/i, evidence: "account callback/data evidence was detected." },
    { signal: "profile", pattern: /\bprofile\s*[:.]|\bprofile\)/i, evidence: "profile callback/data evidence was detected." },
    { signal: "events", pattern: /\bevents\s*:\s*{|\bevents\./i, evidence: "auth event hook evidence was detected." }
  ];
  return authReadinessSignalFromSpecs(sourceFiles, specs, "callback", "signal");
}

function authReadinessCredentialSignals(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["credentialSignals"] {
  const specs: Array<{ signal: AuthReadinessReport["credentialSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "AUTH_SECRET", pattern: /\bAUTH_SECRET\b/i, evidence: "AUTH_SECRET evidence was detected." },
    { signal: "NEXTAUTH_SECRET", pattern: /\bNEXTAUTH_SECRET\b/i, evidence: "NEXTAUTH_SECRET evidence was detected." },
    { signal: "AUTH_URL", pattern: /\bAUTH_URL\b/i, evidence: "AUTH_URL evidence was detected." },
    { signal: "NEXTAUTH_URL", pattern: /\bNEXTAUTH_URL\b/i, evidence: "NEXTAUTH_URL evidence was detected." },
    { signal: "provider-client-id", pattern: /\b(clientId|CLIENT_ID|AUTH_[A-Z0-9_]+_ID|NEXT_PUBLIC_[A-Z0-9_]+_ID)\b/i, evidence: "provider client ID evidence was detected." },
    { signal: "provider-client-secret", pattern: /\b(clientSecret|CLIENT_SECRET|AUTH_[A-Z0-9_]+_SECRET|NEXTAUTH_[A-Z0-9_]+_SECRET)\b/i, evidence: "provider client secret reference evidence was detected." },
    { signal: "cookie-policy", pattern: /\bcookies?\s*:|\bsameSite\b|\bsecure\s*:|\bhttpOnly\b/i, evidence: "cookie policy evidence was detected." },
    { signal: "csrf-token", pattern: /\bcsrf\b|\bCSRF\b|getCsrfToken/i, evidence: "CSRF token evidence was detected." }
  ];
  return authReadinessSignalFromSpecs(sourceFiles, specs, "credential", "signal");
}

function authReadinessPackageSignals(sourceFiles: AuthReadinessSourceFile[]): AuthReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AuthReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "next-auth", pattern: /["']next-auth["']|from\s+["']next-auth|NextAuth\b/i, evidence: "next-auth package/import evidence was detected." },
    { signal: "@auth/core", pattern: /@auth\/core|Auth\.js/i, evidence: "@auth/core evidence was detected." },
    { signal: "@auth-adapter", pattern: /@auth\/[a-z0-9-]+-adapter|PrismaAdapter|DrizzleAdapter|Adapter\b/i, evidence: "Auth.js adapter package evidence was detected." },
    { signal: "better-auth", pattern: /["']better-auth["']|\bbetterAuth\b/i, evidence: "Better Auth package/import evidence was detected." },
    { signal: "@clerk/nextjs", pattern: /@clerk\/nextjs|ClerkProvider|clerkMiddleware/i, evidence: "Clerk package/import evidence was detected." },
    { signal: "@auth0/nextjs-auth0", pattern: /@auth0\/nextjs-auth0|handleAuth|auth0/i, evidence: "Auth0 Next.js package/import evidence was detected." }
  ];
  return authReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function authReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AuthReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/auth-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildAuthorizationReadinessReport(walk: WalkResult): Promise<AuthorizationReadinessReport> {
  const sourceFiles = await authorizationReadinessSourceFiles(walk);
  const authorizationSetups = authorizationReadinessSetups(sourceFiles);
  const modelSignals = authorizationReadinessModelSignals(sourceFiles);
  const enforcementSignals = authorizationReadinessEnforcementSignals(sourceFiles);
  const identitySignals = authorizationReadinessIdentitySignals(sourceFiles);
  const resourceSignals = authorizationReadinessResourceSignals(sourceFiles);
  const governanceSignals = authorizationReadinessGovernanceSignals(sourceFiles);
  const testSignals = authorizationReadinessTestSignals(sourceFiles);
  const packageSignals = authorizationReadinessPackageSignals(sourceFiles);

  const hasSetup = authorizationSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = authorizationSetups.some((item) => item.readiness === "ready");
  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasAuthorizationModel = modelSignals.some((item) => ["rbac", "abac", "rebac", "acl", "relationship-tuples", "policy-file"].includes(item.signal) && item.readiness === "ready");
  const hasSubjectActionModel = modelSignals.some((item) => ["subject-object-action", "resource-action"].includes(item.signal) && item.readiness === "ready");
  const hasEnforcement = enforcementSignals.some((item) => ["guard", "middleware", "can-check", "authorize-call", "route-protection", "resolver-protection", "ui-ability"].includes(item.signal) && item.readiness === "ready");
  const hasDenyDefault = enforcementSignals.some((item) => item.signal === "deny-by-default" && item.readiness === "ready");
  const hasTests = testSignals.some((item) => ["unit-test", "fixture", "table-test", "negative-test", "policy-test", "e2e-test", "type-test"].includes(item.signal) && item.readiness === "ready");
  const hasGovernance = governanceSignals.some((item) => ["least-privilege", "audit-log", "permission-review", "policy-versioning", "decision-log"].includes(item.signal) && item.readiness === "ready");
  const hasTenantOrOrg = identitySignals.some((item) => ["tenant", "organization"].includes(item.signal) && item.readiness === "ready") || resourceSignals.some((item) => ["tenant", "organization"].includes(item.signal) && item.readiness === "ready");
  const hasOwnershipBoundary = identitySignals.some((item) => ["owner", "tenant", "organization", "group"].includes(item.signal) && item.readiness === "ready") || authorizationSetups.some((item) => item.ownershipCount > 0);

  const riskQueue: AuthorizationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "high",
      action: "Add or document the authorization strategy before claiming authorization readiness.",
      why: "Authorization readiness starts with explicit permission packages, policy models, relationship tuples, RBAC/ABAC/ReBAC rules, guards, middleware, or custom authorize checks.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if (hasSetup && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Connect the authorization model to a concrete enforcement point.",
      why: "Policy files or permission vocabulary alone do not prove that protected routes, resolvers, UI abilities, or service calls use the model.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if ((hasSetup || hasPackage) && !hasAuthorizationModel) {
    riskQueue.push({
      priority: "medium",
      action: "Make the permission model explicit with RBAC, ABAC, ReBAC, ACL, relationship tuple, or policy-file evidence.",
      why: "Readers need to see which permission model the project uses before they can audit access boundaries.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if ((hasSetup || hasPackage) && !hasSubjectActionModel) {
    riskQueue.push({
      priority: "medium",
      action: "Document subject, resource, and action vocabulary next to permission checks.",
      why: "Authorization decisions need a stable actor-resource-action shape or resource-action mapping to avoid ambiguous checks.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if ((hasSetup || hasPackage) && !hasEnforcement) {
    riskQueue.push({
      priority: "high",
      action: "Add guard, middleware, can-check, authorize-call, route, resolver, or UI ability enforcement evidence.",
      why: "A model that is not enforced at request or UI boundaries cannot explain how access is denied.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if (hasEnforcement && !hasDenyDefault) {
    riskQueue.push({
      priority: "medium",
      action: "Document deny-by-default behavior for failed authorization decisions.",
      why: "Permission systems should make the denial path explicit so missing rules do not become accidental allows.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if (hasTenantOrOrg && !hasOwnershipBoundary) {
    riskQueue.push({
      priority: "medium",
      action: "Map tenant, organization, group, and owner boundaries in authorization checks.",
      why: "Multi-tenant or organization-aware permissions need ownership boundaries to avoid cross-tenant access.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if ((hasSetup || hasPackage) && !hasTests) {
    riskQueue.push({
      priority: "medium",
      action: "Add unit, fixture, table, negative, policy, E2E, or type tests for authorization decisions.",
      why: "Authorization failures are often regression-prone; negative and table tests are the fastest static signal that deny paths were considered.",
      relatedHref: "html/authorization-readiness.html"
    });
  }
  if ((hasSetup || hasPackage) && !hasGovernance) {
    riskQueue.push({
      priority: "low",
      action: "Add least-privilege, audit log, permission review, policy versioning, migration, decision log, or break-glass notes.",
      why: "Authorization readiness includes operational governance, not only code-level permission checks.",
      relatedHref: "html/authorization-readiness.html"
    });
  }

  return {
    summary: `Authorization readiness report: setup ${authorizationSetups.length}개, model signal ${modelSignals.length}개, enforcement signal ${enforcementSignals.length}개, governance signal ${governanceSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Authorization readiness OpenFGA Casbin CASL Oso RBAC ABAC ReBAC ACL relationship tuples policy model roles permissions resources actions guards middleware can checks deny by default ownership tenants organizations audit decision logs tests",
    authorizationSetups,
    modelSignals,
    enforcementSignals,
    identitySignals,
    resourceSignals,
    governanceSignals,
    testSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"OpenFGA|authorization model|relationship tuple|TupleKey|user:\\\\*|define .*:|relations\" src app pages packages policies", purpose: "Inventory OpenFGA/Zanzibar-style relationship models and tuple checks." },
      { command: "rg \"newEnforcer|enforce\\\\(|model.conf|policy.csv|sub, obj, act|RBAC|ABAC|ACL\" src app pages packages policies", purpose: "Review Casbin-style model, policy, and enforcement surfaces." },
      { command: "rg \"AbilityBuilder|defineAbility|can\\\\(|cannot\\\\(|ForbiddenError|throwUnlessCan\" src app pages packages", purpose: "Trace CASL ability definitions and UI/API can-checks." },
      { command: "rg \"Polar|allow\\\\(|authorize\\\\(|is_allowed|actor.*action.*resource\" src app pages packages policies", purpose: "Find Oso/Polar or custom actor-action-resource authorization checks." },
      { command: "rg \"tenant|organization|owner|group|service account|anonymous|deny by default|audit log|decision log|permission review\" docs src app pages packages policies", purpose: "Map identity boundaries, denial behavior, and governance evidence." },
      { command: "npx vitest run", purpose: "Run local tests that exercise positive and negative authorization decisions in a trusted workspace." }
    ],
    learnerNextSteps: [
      "먼저 authorization model이 RBAC, ABAC, ReBAC, ACL, 또는 custom 정책 중 무엇을 기준으로 하는지 분류하세요.",
      "subject, resource, action이 어떤 이름으로 표현되는지 찾고 route, resolver, service, UI ability 중 어디에서 검사되는지 연결하세요.",
      "deny-by-default와 negative test가 있는지 확인해 빠진 permission이 allow로 처리되지 않는지 검토하세요.",
      "tenant, organization, group, owner, service account 같은 identity boundary가 resource boundary와 같이 검사되는지 원본 링크로 추적하세요.",
      "이 리포트는 정적 readiness입니다. OpenFGA, Casbin, CASL, Oso, OPA, custom policy engine은 실행하지 않고 신뢰된 환경에서 별도로 검증하세요."
    ]
  };
}

type AuthorizationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function authorizationReadinessSourceFiles(walk: WalkResult): Promise<AuthorizationReadinessSourceFile[]> {
  const files: AuthorizationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !authorizationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!authorizationReadinessPathSignal(file.relPath) && !authorizationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function authorizationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return authorizationReadinessPathSignal(filePath)
    || /^(package\.json|permissions?\.json|authorization\.json|authz\.json|model\.conf|policy\.csv|policy\.polar|policy\.rego)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|conf|csv|rego|polar|graphql|gql|prisma)$/i.test(filePath);
}

function authorizationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(authz|authorization|authorize|permission|permissions|rbac|abac|rebac|acl|policy|policies|guard|guards|middleware|openfga|fga|casbin|casl|oso|ability|abilities|access-control|access_control)(\/|\.|-|_|$)/i.test(filePath);
}

function authorizationReadinessContentSignal(text: string): boolean {
  return /(OpenFGA|authorization model|relationship tuple|TupleKey|user:\*|define\s+[A-Za-z0-9_-]+\s*:|relations?\b|newEnforcer|enforce\s*\(|model\.conf|policy\.csv|sub\s*,\s*obj\s*,\s*act|AbilityBuilder|defineAbility|createMongoAbility|ForbiddenError|(?:can|cannot)\s*\(|throwUnlessCan|Polar|allow\s*\(|oso\.authorize|is_allowed|authorize\s*\(|authorized_actions|RBAC|ABAC|ReBAC|ACL|\brole\b|\broles\b|\bpermission\b|\bpermissions\b|\bresource\b|\baction\b|\bguard\b|\bmiddleware\b|deny[- ]by[- ]default|least[- ]privilege|\bowner\b|\btenant\b|\borganization\b|audit log|decision log)/i.test(text);
}

function authorizationReadinessSetups(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["authorizationSetups"] {
  const rows: AuthorizationReadinessReport["authorizationSetups"] = [];
  for (const source of sourceFiles) {
    const modelCount = countMatches(source.text, /(authorization model|model\.conf|policy\.csv|policy\.polar|\.rego\b|resource\s+[A-Z][A-Za-z0-9_]*\s*{|AbilityBuilder|defineAbility|createMongoAbility|Polar|OpenFGA|newEnforcer|RBAC|ABAC|ReBAC|ACL)/gi);
    const relationCount = countMatches(source.text, /(relationship tuple|TupleKey|tuple\.NewTupleKey|relations?\b|define\s+[A-Za-z0-9_-]+\s*:|has_relation|relation\s*:|member from parent|#member|#viewer)/gi);
    const roleCount = countMatches(source.text, /\b(role|roles|RBAC|admin|member|viewer|editor|owner|reader|writer)\b/gi);
    const permissionCount = countMatches(source.text, /\b(permissions?|has_permission|is_allowed|throwUnlessCan|ForbiddenError|AccessDenied|allowed|canCheck)\b|(?:can|cannot|enforce|authorize|allow|check)\s*\(/gi);
    const resourceCount = countMatches(source.text, /\b(resource|resources|document|project|repository|repo|organization|tenant|record|field|collection|obj|subject)\b/gi);
    const actionCount = countMatches(source.text, /\b(action|actions|act|read|write|create|update|delete|manage|invite|pull|push|view|edit)\b/gi);
    const guardCount = countMatches(source.text, /\b(guard|guards|requirePermission|requireRole|authorize|authorized|canCheck|canAccess|assertAllowed|throwUnlessCan|ForbiddenError|AccessDenied|NotAllowed)\b/gi);
    const middlewareCount = countMatches(source.text, /\b(middleware|route protection|protected route|resolver protection|beforeEach|interceptor)\b/gi);
    const ownershipCount = countMatches(source.text, /\b(owner|own|tenant|organization|org|group|service account|service-account|anonymous|createdBy|author)\b/gi);
    const testCount = countMatches(source.text, /\b(test|spec|fixture|table test|table-driven|negative test|policy test|e2e|type test|expect|describe|it\()\b/gi);
    const totalSignals = modelCount + relationCount + roleCount + permissionCount + resourceCount + actionCount + guardCount + middlewareCount + ownershipCount + testCount;
    const hasModel = modelCount > 0 || relationCount > 0 || roleCount > 0 || permissionCount > 0;
    const hasSubjectAction = resourceCount > 0 && actionCount > 0;
    const hasEnforcement = guardCount > 0 || middlewareCount > 0 || /(?:enforce|can|authorize|allow|check)\s*\(|\b(is_allowed|throwUnlessCan)\b/i.test(source.text);
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      framework: authorizationReadinessFramework(source),
      modelCount,
      relationCount,
      roleCount,
      permissionCount,
      resourceCount,
      actionCount,
      guardCount,
      middlewareCount,
      ownershipCount,
      testCount,
      readiness: hasModel && hasSubjectAction && hasEnforcement && totalSignals >= 8 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains model ${modelCount}, relations ${relationCount}, roles ${roleCount}, permissions ${permissionCount}, resources ${resourceCount}, actions ${actionCount}, guards ${guardCount}, middleware ${middlewareCount}, ownership ${ownershipCount}, tests ${testCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 100);
}

function authorizationReadinessFramework(source: AuthorizationReadinessSourceFile): AuthorizationReadinessReport["authorizationSetups"][number]["framework"] {
  if (/OpenFGA|@openfga\/sdk|authorization model|relationship tuple|TupleKey|user:\*/i.test(source.text) || /openfga|(^|\/)fga(\/|\.|-|_|$)/i.test(source.filePath)) return "openfga";
  if (/casbin|newEnforcer|enforce\s*\(|model\.conf|policy\.csv|sub\s*,\s*obj\s*,\s*act/i.test(source.text) || /casbin|model\.conf|policy\.csv/i.test(source.filePath)) return "casbin";
  if (/CASL|@casl\/ability|AbilityBuilder|defineAbility|createMongoAbility|ForbiddenError|throwUnlessCan/i.test(source.text) || /casl|abilit/i.test(source.filePath)) return "casl";
  if (/Oso|Polar|policy\.polar|allow\s*\(|is_allowed|oso\.authorize/i.test(source.text) || /oso|\.polar$/i.test(source.filePath)) return "oso";
  if (/OPA|Rego|\.rego\b|opa\s+(eval|test|check|build)|package\s+[A-Za-z0-9_.]+/i.test(source.text) || /\.rego$/i.test(source.filePath)) return "opa";
  if (/\b(authorize|permission|permissions|requireRole|requirePermission|canAccess|AccessDenied|Forbidden)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function authorizationReadinessModelSignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["modelSignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["modelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "rbac", pattern: /\b(RBAC|role-based access control|role|roles|getRolesForUser|hasRoleForUser|role_definition)\b/i, evidence: "RBAC role evidence was detected." },
    { signal: "abac", pattern: /\b(ABAC|attribute-based access control|attribute|attributes|context attributes|r\.sub\.[A-Za-z]|conditions?|eval\(p\.)\b/i, evidence: "ABAC attribute or condition evidence was detected." },
    { signal: "rebac", pattern: /\b(ReBAC|relationship-based|relationship tuple|TupleKey|tuple-to-userset|userset|member from parent|Zanzibar|OpenFGA)\b/i, evidence: "ReBAC relationship evidence was detected." },
    { signal: "acl", pattern: /\b(ACL|access control list|allowlist|denylist|allow-list|deny-list)\b/i, evidence: "ACL evidence was detected." },
    { signal: "relationship-tuples", pattern: /(relationship tuple|TupleKey|tuple\.NewTupleKey|user:\*|[A-Za-z]+:[A-Za-z0-9_-]+#[A-Za-z0-9_-]+@user:|define\s+[A-Za-z0-9_-]+\s*:)/i, evidence: "relationship tuple/model evidence was detected." },
    { signal: "policy-file", pattern: /(model\.conf|policy\.csv|policy\.polar|\.rego\b|package\s+[A-Za-z0-9_.]+|resource\s+[A-Z][A-Za-z0-9_]*\s*{|authorization model)/i, evidence: "policy file or model evidence was detected." },
    { signal: "subject-object-action", pattern: /(sub\s*,\s*obj\s*,\s*act|subject.*object.*action|actor.*action.*resource|user.*resource.*action|r\.sub.*r\.obj.*r\.act)/i, evidence: "subject/object/action decision shape evidence was detected." },
    { signal: "resource-action", pattern: /(resource.*action|action.*resource|permissions?\s*[:=]\s*\[|actions?\s*[:=]\s*\[|can\s*\(\s*['"][a-z]+['"],\s*['"][A-Za-z])/i, evidence: "resource/action vocabulary evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "model", "signal");
}

function authorizationReadinessEnforcementSignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["enforcementSignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["enforcementSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "guard", pattern: /\b(guard|guards|requirePermission|requireRole|ensurePermission|canAccess|assertAllowed|AccessDenied|Forbidden)\b/i, evidence: "guard enforcement evidence was detected." },
    { signal: "middleware", pattern: /\b(middleware|withAuthorization|authzMiddleware|permissionMiddleware|accessMiddleware)\b/i, evidence: "middleware enforcement evidence was detected." },
    { signal: "can-check", pattern: /(\bcan\s*\(|\bcannot\s*\(|\bcanCheck\b|\bability\.can\b|\bcanAccess\b|enforcer\.enforce\s*\()/i, evidence: "can-check evidence was detected." },
    { signal: "authorize-call", pattern: /(\bauthorize\s*\(|\boso\.authorize\b|\bis_allowed\b|\ballow\s*\(|\bquery_rule_once\b|\brequirePermission\s*\()/i, evidence: "authorize-call evidence was detected." },
    { signal: "deny-by-default", pattern: /(deny[- ]by[- ]default|default deny|allow by exception|fail closed|fail-closed|ForbiddenError|throwUnlessCan|NotAllowed|AccessDenied|return\s+false|403)/i, evidence: "deny-by-default evidence was detected." },
    { signal: "route-protection", pattern: /(protected route|route protection|route guard|beforeEach|loader.*authorize|middleware.*route|GET.*authorize|POST.*authorize|app\/api\/.*authz)/i, evidence: "route protection evidence was detected." },
    { signal: "resolver-protection", pattern: /(resolver.*authorize|authorize.*resolver|resolver protection|field.*authorize|authorize_field|field.*permission|GraphQL.*permission|trpc.*permission|procedure.*guard)/i, evidence: "resolver protection evidence was detected." },
    { signal: "ui-ability", pattern: /(AbilityBuilder|defineAbility|Can\b|ability\.can|useAbility|ForbiddenError|accessibleBy|ui ability|component permission)/i, evidence: "UI ability evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "enforcement", "signal");
}

function authorizationReadinessIdentitySignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["identitySignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["identitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "user", pattern: /\b(user|users|actor|subject|sub)\b|user:/i, evidence: "user/actor identity evidence was detected." },
    { signal: "role", pattern: /\b(role|roles|admin|member|reader|writer|viewer|editor)\b/i, evidence: "role identity evidence was detected." },
    { signal: "group", pattern: /\b(group|groups|team|teams|member from parent|#member)\b/i, evidence: "group identity evidence was detected." },
    { signal: "tenant", pattern: /\b(tenant|tenants|tenantId|tenant_id|domain|domains)\b/i, evidence: "tenant identity evidence was detected." },
    { signal: "organization", pattern: /\b(organization|organizations|org|orgId|org_id|company|workspace)\b/i, evidence: "organization identity evidence was detected." },
    { signal: "service-account", pattern: /\b(service account|service-account|serviceAccount|machine identity|robot account|client credentials)\b/i, evidence: "service account identity evidence was detected." },
    { signal: "owner", pattern: /\b(owner|owners|owned|createdBy|author|resource\.owner|obj\.Owner)\b/i, evidence: "owner identity evidence was detected." },
    { signal: "anonymous", pattern: /\b(anonymous|guest|public|unauthenticated|user:\*)\b/i, evidence: "anonymous/public identity evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "identity", "signal");
}

function authorizationReadinessResourceSignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["resourceSignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["resourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "document", pattern: /\b(document|documents|doc|docs|BlogPost|Post)\b/i, evidence: "document resource evidence was detected." },
    { signal: "project", pattern: /\b(project|projects)\b/i, evidence: "project resource evidence was detected." },
    { signal: "repository", pattern: /\b(repository|repositories|repo|repos)\b/i, evidence: "repository resource evidence was detected." },
    { signal: "organization", pattern: /\b(organization|organizations|org|company|workspace)\b/i, evidence: "organization resource evidence was detected." },
    { signal: "tenant", pattern: /\b(tenant|tenants|domain|domains)\b/i, evidence: "tenant resource evidence was detected." },
    { signal: "record", pattern: /\b(record|records|row|rows|entity|entities)\b/i, evidence: "record resource evidence was detected." },
    { signal: "field", pattern: /\b(field|fields|authorize_field|allowed fields|field permission)\b/i, evidence: "field-level resource evidence was detected." },
    { signal: "collection", pattern: /\b(collection|collections|list|ListObjects|authorized_resources|accessibleBy)\b/i, evidence: "collection-level resource evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "resource", "signal");
}

function authorizationReadinessGovernanceSignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["governanceSignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "least-privilege", pattern: /(least privilege|least-privilege|minimal permission|minimum permission|scoped permission)/i, evidence: "least privilege evidence was detected." },
    { signal: "separation-of-duties", pattern: /(separation of duties|separation-of-duties|two person|two-person|dual approval|maker checker)/i, evidence: "separation of duties evidence was detected." },
    { signal: "audit-log", pattern: /(audit log|audit-log|audit trail|access log|permission log|authorization log)/i, evidence: "audit log evidence was detected." },
    { signal: "permission-review", pattern: /(permission review|access review|entitlement review|role review|recertification)/i, evidence: "permission review evidence was detected." },
    { signal: "policy-versioning", pattern: /(policy version|policy-version|versioned policy|authorization model version|model id|migration)/i, evidence: "policy versioning evidence was detected." },
    { signal: "migration", pattern: /(migration|migrate|model migration|policy migration|backfill)/i, evidence: "authorization migration evidence was detected." },
    { signal: "decision-log", pattern: /(decision log|decision-log|authorization decision|PDP|policy decision|decision output)/i, evidence: "decision log evidence was detected." },
    { signal: "break-glass", pattern: /(break glass|break-glass|emergency access|privileged access|override access)/i, evidence: "break-glass evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "governance", "signal");
}

function authorizationReadinessTestSignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["testSignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["testSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "unit-test", pattern: /(\bdescribe\s*\(|\bit\s*\(|\btest\s*\(|unit test|\.test\.|\.spec\.)/i, evidence: "unit test evidence was detected." },
    { signal: "fixture", pattern: /\b(fixture|fixtures|sample policy|sample tuple|test data)\b/i, evidence: "fixture evidence was detected." },
    { signal: "table-test", pattern: /(table test|table-driven|test cases|cases\s*=\s*\[|each\s*\()/i, evidence: "table test evidence was detected." },
    { signal: "negative-test", pattern: /(negative test|denies|deny|forbid|forbidden|not allowed|expect.*false|rejects|403)/i, evidence: "negative test evidence was detected." },
    { signal: "policy-test", pattern: /(policy test|authorization model test|fga model test|casbin test|oso test|opa test|rego test|allow.*deny)/i, evidence: "policy test evidence was detected." },
    { signal: "e2e-test", pattern: /(e2e|end-to-end|playwright|cypress|protected route test|browser permission)/i, evidence: "E2E authorization test evidence was detected." },
    { signal: "type-test", pattern: /(ts-expect-error|type test|expectType|type-level|AppAbility|AbilityTuple|SubjectType)/i, evidence: "type test evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "test", "signal");
}

function authorizationReadinessPackageSignals(sourceFiles: AuthorizationReadinessSourceFile[]): AuthorizationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: AuthorizationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "@openfga/sdk", pattern: /@openfga\/sdk/i, evidence: "@openfga/sdk package evidence was detected." },
    { signal: "openfga", pattern: /["']openfga["']|\bOpenFGA\b|openfga\/openfga|openfga\s+(model|tuple|check)/i, evidence: "OpenFGA evidence was detected." },
    { signal: "casbin", pattern: /["']casbin["']|\bCasbin\b|newEnforcer|model\.conf|policy\.csv/i, evidence: "Casbin package/model evidence was detected." },
    { signal: "casl", pattern: /["']casl["']|\bCASL\b|defineAbility|AbilityBuilder/i, evidence: "CASL evidence was detected." },
    { signal: "@casl/ability", pattern: /@casl\/ability/i, evidence: "@casl/ability package evidence was detected." },
    { signal: "oso", pattern: /["']oso["']|\bOso\b|\bPolar\b|policy\.polar/i, evidence: "Oso/Polar evidence was detected." },
    { signal: "opa", pattern: /["']opa["']|\bOPA\b|\bRego\b|\.rego\b|opa\s+(eval|test|check|build)/i, evidence: "OPA/Rego evidence was detected." },
    { signal: "custom", pattern: /\b(authorize|authorization|permission|permissions|requirePermission|canAccess|AccessDenied|Forbidden)\b/i, evidence: "custom authorization evidence was detected." }
  ];
  return authorizationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function authorizationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: AuthorizationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/authorization-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildPaymentReadinessReport(walk: WalkResult): Promise<PaymentReadinessReport> {
  const sourceFiles = await paymentReadinessSourceFiles(walk);
  const paymentSetups = paymentReadinessPaymentSetups(sourceFiles);
  const checkoutSignals = paymentReadinessCheckoutSignals(sourceFiles);
  const webhookSignals = paymentReadinessWebhookSignals(sourceFiles);
  const customerSignals = paymentReadinessCustomerSignals(sourceFiles);
  const credentialSignals = paymentReadinessCredentialSignals(sourceFiles);
  const packageSignals = paymentReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasStripePackage = packageSignals.some((item) => item.signal === "stripe" && item.readiness === "ready");
  const hasSetup = paymentSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = paymentSetups.some((item) => item.readiness === "ready");
  const hasCheckout = checkoutSignals.some((item) => ["checkout-session", "payment-intent", "subscription"].includes(item.signal) && item.readiness === "ready");
  const hasWebhook = webhookSignals.some((item) => item.signal === "webhook-route" && item.readiness === "ready");
  const hasSignatureVerification = webhookSignals.some((item) => item.signal === "signature-verification" && item.readiness === "ready");
  const hasSecret = credentialSignals.some((item) => item.signal === "STRIPE_SECRET_KEY" && item.readiness === "ready");
  const hasWebhookSecret = credentialSignals.some((item) => ["STRIPE_WEBHOOK_SECRET", "webhook-secret"].includes(item.signal) && item.readiness === "ready");
  const hasPrice = checkoutSignals.some((item) => item.signal === "price-id" && item.readiness === "ready") || credentialSignals.some((item) => item.signal === "price-env" && item.readiness === "ready");
  const hasIdempotency = webhookSignals.some((item) => item.signal === "idempotency" && item.readiness === "ready");
  const hasCustomerBilling = customerSignals.some((item) => ["customer", "subscription", "invoice", "billing-portal"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: PaymentReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasCheckout) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the payment strategy before claiming payment readiness.",
      why: "Payment readiness starts with an explicit payment package, server client setup, checkout flow, payment intent, subscription, or webhook surface.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  if (hasStripePackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Expose a server-side Stripe client setup before trusting payment flow scans.",
      why: "Stripe's Node SDK expects server-side initialization with a secret key and optional API version before creating customers, checkout sessions, or payment intents.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  if ((hasStripePackage || hasSetup) && !hasSecret) {
    riskQueue.push({
      priority: "high",
      action: "Document STRIPE_SECRET_KEY or the equivalent server-only secret key in deployment configuration.",
      why: "Payment server calls must not depend on missing or client-exposed secret-key configuration.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  if (hasCheckout && !hasPrice) {
    riskQueue.push({
      priority: "medium",
      action: "Map checkout prices/products to environment variables or a typed pricing table.",
      why: "Checkout and subscription flows need auditable price IDs, product IDs, currency, and quantity assumptions.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  if (hasWebhook && (!hasSignatureVerification || !hasWebhookSecret)) {
    riskQueue.push({
      priority: "high",
      action: "Verify webhook raw-body handling and signature verification with a webhook secret.",
      why: "Stripe webhooks must use the raw request body and constructEvent signature verification to reject forged events.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  if (hasWebhook && !hasIdempotency) {
    riskQueue.push({
      priority: "medium",
      action: "Add idempotency or duplicate-event handling for payment webhooks.",
      why: "Payment webhooks may be retried; fulfillment and entitlement updates need duplicate-safe processing.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  if (hasCustomerBilling && !hasWebhook) {
    riskQueue.push({
      priority: "medium",
      action: "Connect billing lifecycle events to a verified webhook handler.",
      why: "Subscriptions, invoices, refunds, and portals usually need server-side event handling to keep local entitlement state in sync.",
      relatedHref: "html/payment-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run payment flow tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not call payment APIs, create checkout sessions, charge cards, verify live webhooks, or run the analyzed project's tests.",
    relatedHref: "html/payment-readiness.html"
  });

  return {
    summary: `Stripe식 payment readiness report: payment setup ${paymentSetups.length}개, checkout signal ${checkoutSignals.length}개, webhook signal ${webhookSignals.length}개, customer/billing signal ${customerSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Stripe new Stripe checkout sessions payment intents subscriptions customers invoices billing portal webhooks constructEvent raw body signature idempotency apiVersion env price",
    paymentSetups,
    checkoutSignals,
    webhookSignals,
    customerSignals,
    credentialSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"new Stripe|Stripe\\(|STRIPE_SECRET_KEY|apiVersion\" src app pages packages", purpose: "Inventory server-side Stripe client setup and API version configuration." },
      { command: "rg \"checkout\\.sessions|paymentIntents|PaymentIntent|redirectToCheckout|loadStripe\" src app pages packages", purpose: "Find Checkout Sessions, PaymentIntents, and client redirect or Elements surfaces." },
      { command: "rg \"webhooks|constructEvent|stripe-signature|rawBody|raw body|STRIPE_WEBHOOK_SECRET\" src app pages packages", purpose: "Review webhook route, raw-body handling, signature verification, and webhook secret configuration." },
      { command: "rg \"checkout.session.completed|invoice.paid|invoice.payment_failed|payment_intent.succeeded|customer.subscription\" src app pages packages", purpose: "Trace event handling for fulfillment, invoices, payment failures, and subscription changes." },
      { command: "rg \"price_|product_|PRICE|currency|quantity|billingPortal|subscriptions|customers|invoices|refunds\" src app pages packages", purpose: "Check pricing, products, billing portal, customer, invoice, subscription, and refund assumptions." },
      { command: "npx vitest run", purpose: "Run local tests that exercise checkout creation, webhook verification, entitlement updates, and duplicate-event handling." }
    ],
    learnerNextSteps: [
      "먼저 서버 쪽 Stripe client 생성 위치를 찾고 STRIPE_SECRET_KEY와 apiVersion이 어떻게 들어가는지 확인하세요.",
      "checkout.sessions.create 또는 paymentIntents.create가 있으면 price, currency, quantity, success/cancel URL을 함께 추적하세요.",
      "webhooks.constructEvent가 있으면 raw body와 stripe-signature header, STRIPE_WEBHOOK_SECRET 연결을 반드시 같이 확인하세요.",
      "subscription, invoice, billing portal, refund 신호가 있으면 webhook event와 로컬 entitlement 업데이트가 중복 안전하게 연결되는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 결제, 카드 청구, provider callback, webhook 검증은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type PaymentReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function paymentReadinessSourceFiles(walk: WalkResult): Promise<PaymentReadinessSourceFile[]> {
  const files: PaymentReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !paymentReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!paymentReadinessPathSignal(file.relPath) && !paymentReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function paymentReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return paymentReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env)$/i.test(filePath);
}

function paymentReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(payments?|billing|checkout|stripe|webhooks?|subscriptions?|invoices?|customers?|pricing|prices?|products?|refunds?)(\/|\.|-|_|$)|paypal|paddle|lemonsqueezy/i.test(filePath);
}

function paymentReadinessContentSignal(text: string): boolean {
  return /\b(Stripe|stripe|checkout\.sessions|paymentIntents|PaymentIntent|subscriptions|billingPortal|webhooks|constructEvent|stripe-signature|rawBody|idempotencyKey|apiVersion|STRIPE_SECRET_KEY|STRIPE_WEBHOOK_SECRET|STRIPE_PUBLISHABLE_KEY|NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY|price_|product_|currency|quantity|invoice|refund|customer|PayPal|Paddle|LemonSqueezy)\b/i.test(text);
}

function paymentReadinessPaymentSetups(sourceFiles: PaymentReadinessSourceFile[]): PaymentReadinessReport["paymentSetups"] {
  const rows: PaymentReadinessReport["paymentSetups"] = [];
  for (const source of sourceFiles) {
    const serverClientCount = countMatches(source.text, /\bnew\s+Stripe\s*\(|\bStripe\s*\(\s*(process\.env\.)?STRIPE_SECRET_KEY|require\(["']stripe["']\)\s*\(/gi);
    const checkoutSessionCount = countMatches(source.text, /\bcheckout\.sessions\.(create|retrieve|list)|\bCheckoutSession\b|\bredirectToCheckout\b/gi);
    const paymentIntentCount = countMatches(source.text, /\bpaymentIntents\.(create|retrieve|confirm|update)|\bPaymentIntent\b/gi);
    const webhookHandlerCount = countMatches(source.text, /\bwebhooks\.constructEvent\b|\bconstructEvent\s*\(|\bstripe-signature\b|\bwebhook\b/gi);
    const hasSetupSignal = serverClientCount + checkoutSessionCount + paymentIntentCount + webhookHandlerCount > 0 || /\bpaypal|paddle|lemonsqueezy\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: paymentReadinessProvider(source),
      serverClientCount,
      checkoutSessionCount,
      paymentIntentCount,
      webhookHandlerCount,
      readiness: serverClientCount > 0 && (checkoutSessionCount > 0 || paymentIntentCount > 0 || webhookHandlerCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains server client ${serverClientCount}, checkout sessions ${checkoutSessionCount}, payment intents ${paymentIntentCount}, webhook handlers ${webhookHandlerCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function paymentReadinessProvider(source: PaymentReadinessSourceFile): PaymentReadinessReport["paymentSetups"][number]["provider"] {
  if (/\bStripe\b|["']stripe["']|@stripe\//i.test(source.text)) return "stripe";
  if (/\bpaypal|@paypal/i.test(source.text)) return "paypal";
  if (/\bpaddle|@paddle/i.test(source.text)) return "paddle";
  if (/\blemonsqueezy|lemon-squeezy/i.test(source.text)) return "lemonsqueezy";
  if (/\bpayment|billing|checkout\b/i.test(source.text)) return "custom";
  return "unknown";
}

function paymentReadinessCheckoutSignals(sourceFiles: PaymentReadinessSourceFile[]): PaymentReadinessReport["checkoutSignals"] {
  const specs: Array<{ signal: PaymentReadinessReport["checkoutSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "checkout-session", pattern: /\bcheckout\.sessions\.(create|retrieve|list)|\bCheckoutSession\b|\bredirectToCheckout\b/i, evidence: "Checkout Session evidence was detected." },
    { signal: "payment-intent", pattern: /\bpaymentIntents\.(create|retrieve|confirm|update)|\bPaymentIntent\b/i, evidence: "PaymentIntent evidence was detected." },
    { signal: "subscription", pattern: /\bsubscriptions?\.(create|retrieve|update|cancel)|\bmode\s*:\s*['"]subscription|\bcustomer\.subscription|\bSubscription\b/i, evidence: "subscription evidence was detected." },
    { signal: "customer-portal", pattern: /\bbillingPortal\b|\bbilling_portal\b|\bportal\.sessions\.(create|retrieve)|customer portal/i, evidence: "billing portal evidence was detected." },
    { signal: "price-id", pattern: /\bprice_[A-Za-z0-9]+|\bprice\s*:\s*|PRICE_ID|STRIPE_PRICE/i, evidence: "price ID evidence was detected." },
    { signal: "product-id", pattern: /\bprod_[A-Za-z0-9]+|\bproduct\s*:\s*|PRODUCT_ID|STRIPE_PRODUCT/i, evidence: "product ID evidence was detected." },
    { signal: "currency", pattern: /\bcurrency\s*:\s*['"][a-z]{3}['"]|\bCURRENCY\b/i, evidence: "currency evidence was detected." },
    { signal: "quantity", pattern: /\bquantity\s*:\s*\d+|\bquantity\s*:/i, evidence: "quantity evidence was detected." }
  ];
  return paymentReadinessSignalFromSpecs(sourceFiles, specs, "checkout", "signal");
}

function paymentReadinessWebhookSignals(sourceFiles: PaymentReadinessSourceFile[]): PaymentReadinessReport["webhookSignals"] {
  const specs: Array<{ signal: PaymentReadinessReport["webhookSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "webhook-route", pattern: /(^|\/)webhooks?(\/|\.|-|_|$)|\bwebhook\b|\bwebhooks\b/i, evidence: "webhook route or handler evidence was detected." },
    { signal: "signature-verification", pattern: /\bwebhooks\.constructEvent\b|\bconstructEvent\s*\(|\bverifyHeader\b|\bstripe-signature\b/i, evidence: "webhook signature verification evidence was detected." },
    { signal: "raw-body", pattern: /\brawBody\b|\braw\s*\(|\bbuffer\s*\(|\btext\s*\(\s*\)|raw request body|bodyParser\s*:\s*false/i, evidence: "raw body handling evidence was detected." },
    { signal: "event-switch", pattern: /\bswitch\s*\([^)]*event\.type|\bevent\.type\b|\bcase\s+['"][a-z0-9_.]+['"]/i, evidence: "webhook event type dispatch evidence was detected." },
    { signal: "checkout-completed", pattern: /checkout\.session\.completed/i, evidence: "checkout completion event evidence was detected." },
    { signal: "invoice-paid", pattern: /invoice\.(paid|payment_succeeded|finalized)/i, evidence: "invoice paid/finalized event evidence was detected." },
    { signal: "payment-failed", pattern: /invoice\.payment_failed|payment_intent\.payment_failed|charge\.failed/i, evidence: "payment failure event evidence was detected." },
    { signal: "idempotency", pattern: /\bidempotency(Key)?\b|\bidempotent\b|\bevent\.id\b|\bprocessedEvents\b/i, evidence: "idempotency or duplicate-event evidence was detected." }
  ];
  return paymentReadinessSignalFromSpecs(sourceFiles, specs, "webhook", "signal");
}

function paymentReadinessCustomerSignals(sourceFiles: PaymentReadinessSourceFile[]): PaymentReadinessReport["customerSignals"] {
  const specs: Array<{ signal: PaymentReadinessReport["customerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "customer", pattern: /\bcustomers?\.(create|retrieve|update|list)|\bcustomer\s*:/i, evidence: "customer API evidence was detected." },
    { signal: "subscription", pattern: /\bsubscriptions?\.(create|retrieve|update|cancel|list)|\bSubscription\b/i, evidence: "subscription API evidence was detected." },
    { signal: "invoice", pattern: /\binvoices?\.(create|retrieve|finalize|pay|list)|\binvoiceItems?\./i, evidence: "invoice API evidence was detected." },
    { signal: "billing-portal", pattern: /\bbillingPortal\b|\bportal\.sessions\b|customer portal/i, evidence: "billing portal evidence was detected." },
    { signal: "trial", pattern: /\btrial_period_days\b|\btrial_end\b|\btrial\b/i, evidence: "trial configuration evidence was detected." },
    { signal: "coupon", pattern: /\bcoupon\b|\bpromotionCode\b|\bdiscount\b/i, evidence: "coupon or discount evidence was detected." },
    { signal: "tax", pattern: /\bautomatic_tax\b|\btax_rates?\b|\btax_behavior\b|\btax_code\b/i, evidence: "tax configuration evidence was detected." },
    { signal: "refund", pattern: /\brefunds?\.(create|retrieve|list)|\bRefund\b/i, evidence: "refund evidence was detected." }
  ];
  return paymentReadinessSignalFromSpecs(sourceFiles, specs, "customer", "signal");
}

function paymentReadinessCredentialSignals(sourceFiles: PaymentReadinessSourceFile[]): PaymentReadinessReport["credentialSignals"] {
  const specs: Array<{ signal: PaymentReadinessReport["credentialSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "STRIPE_SECRET_KEY", pattern: /\bSTRIPE_SECRET_KEY\b|\bsk_(test|live)_/i, evidence: "STRIPE_SECRET_KEY evidence was detected." },
    { signal: "STRIPE_WEBHOOK_SECRET", pattern: /\bSTRIPE_WEBHOOK_SECRET\b|\bwhsec_/i, evidence: "STRIPE_WEBHOOK_SECRET evidence was detected." },
    { signal: "STRIPE_PUBLISHABLE_KEY", pattern: /\bSTRIPE_PUBLISHABLE_KEY\b|\bpk_(test|live)_/i, evidence: "STRIPE_PUBLISHABLE_KEY evidence was detected." },
    { signal: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", pattern: /\bNEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY\b/i, evidence: "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY evidence was detected." },
    { signal: "price-env", pattern: /\bSTRIPE_PRICE|\bPRICE_ID\b|\bPRICE_[A-Z0-9_]+\b/i, evidence: "price environment variable evidence was detected." },
    { signal: "api-version", pattern: /\bapiVersion\s*:|\bStripe-Version\b|API_VERSION/i, evidence: "Stripe API version evidence was detected." },
    { signal: "webhook-secret", pattern: /\bwebhookSecret\b|\bendpointSecret\b|\bsigningSecret\b/i, evidence: "webhook secret variable evidence was detected." }
  ];
  return paymentReadinessSignalFromSpecs(sourceFiles, specs, "credential", "signal");
}

function paymentReadinessPackageSignals(sourceFiles: PaymentReadinessSourceFile[]): PaymentReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PaymentReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "stripe", pattern: /["']stripe["']|from\s+["']stripe["']|\bnew\s+Stripe\b/i, evidence: "stripe package/import evidence was detected." },
    { signal: "@stripe/stripe-js", pattern: /@stripe\/stripe-js|\bloadStripe\b/i, evidence: "@stripe/stripe-js package/import evidence was detected." },
    { signal: "@stripe/react-stripe-js", pattern: /@stripe\/react-stripe-js|\bElements\b|\bPaymentElement\b/i, evidence: "@stripe/react-stripe-js package/import evidence was detected." },
    { signal: "paypal", pattern: /@paypal|\bpaypal\b/i, evidence: "PayPal package/import evidence was detected." },
    { signal: "paddle", pattern: /@paddle|\bpaddle\b/i, evidence: "Paddle package/import evidence was detected." },
    { signal: "lemonsqueezy", pattern: /lemonsqueezy|lemon-squeezy/i, evidence: "Lemon Squeezy package/import evidence was detected." }
  ];
  return paymentReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function paymentReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PaymentReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/payment-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
