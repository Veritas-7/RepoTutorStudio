import type { AdmissionPolicyReadinessReport, ApiGatewayReadinessReport, HelmReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildHelmReadinessReport(walk: WalkResult): Promise<HelmReadinessReport> {
  const sourceFiles = await helmReadinessSourceFiles(walk);
  const helmSetups = helmReadinessSetups(sourceFiles);
  const chartSignals = helmReadinessChartSignals(sourceFiles);
  const templateSignals = helmReadinessTemplateSignals(sourceFiles);
  const valuesSignals = helmReadinessValuesSignals(sourceFiles);
  const dependencySignals = helmReadinessDependencySignals(sourceFiles);
  const validationSignals = helmReadinessValidationSignals(sourceFiles);
  const releaseSignals = helmReadinessReleaseSignals(sourceFiles);
  const securitySignals = helmReadinessSecuritySignals(sourceFiles);
  const ciSignals = helmReadinessCiSignals(sourceFiles);
  const packageSignals = helmReadinessPackageSignals(sourceFiles);

  const hasChart = chartSignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.chartCount > 0);
  const hasTemplates = templateSignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.templateCount > 0);
  const hasValues = valuesSignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.valuesCount > 0);
  const hasDependencies = dependencySignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.dependencyCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.testCount > 0);
  const hasRelease = releaseSignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.releaseCount > 0);
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.provenanceCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || helmSetups.some((item) => item.ciCount > 0);

  const riskQueue: HelmReadinessReport["riskQueue"] = [];
  if (!hasChart) riskQueue.push({ priority: "high", action: "Document Chart.yaml metadata before claiming Helm readiness.", why: "Helm readiness starts with visible chart metadata, chart type, version, dependencies, or chart packaging evidence.", relatedHref: "html/helm-readiness.html" });
  if (hasChart && !hasValues) riskQueue.push({ priority: "medium", action: "Pair charts with values.yaml, values.schema.json, or environment values evidence.", why: "Values are the learner-facing configuration contract for Helm installs and upgrades.", relatedHref: "html/helm-readiness.html" });
  if (hasChart && !hasTemplates) riskQueue.push({ priority: "medium", action: "Add template evidence such as templates/, _helpers.tpl, include, tpl, required, Capabilities, or hooks.", why: "Chart metadata alone does not show what Kubernetes objects Helm will render.", relatedHref: "html/helm-readiness.html" });
  if (hasDependencies && !dependencySignals.some((item) => item.signal === "chart-lock" && item.readiness === "ready")) riskQueue.push({ priority: "medium", action: "Commit Chart.lock or document dependency build/update policy.", why: "Dependency declarations without a lock or build policy can drift across installs.", relatedHref: "html/helm-readiness.html" });
  if ((hasChart || hasTemplates) && !hasValidation) riskQueue.push({ priority: "low", action: "Add helm lint/template, dry-run, kubeconform, chart-testing, or helm-unittest validation evidence.", why: "Static chart readiness is stronger when rendered manifests and chart metadata are validated before release.", relatedHref: "html/helm-readiness.html" });
  if ((hasChart || hasValidation) && !hasRelease) riskQueue.push({ priority: "low", action: "Add install, upgrade, rollback, helm test, chart-releaser, OCI push, or repo index release evidence.", why: "Learners need to distinguish rendering readiness from install and release workflow readiness.", relatedHref: "html/helm-readiness.html" });
  if ((hasRelease || hasChart) && !hasSecurity) riskQueue.push({ priority: "low", action: "Add provenance, signing, verify, keyring, digest, or OCI registry integrity evidence.", why: "Published charts should make package integrity and registry boundaries inspectable.", relatedHref: "html/helm-readiness.html" });
  if ((hasChart || hasValidation || hasRelease) && !hasCi) riskQueue.push({ priority: "low", action: "Add Helm CI checks for chart-testing, lint/template, kubeconform, chart-releaser, and artifact upload.", why: "CI artifacts make chart render, install, and release outcomes reproducible.", relatedHref: "html/helm-readiness.html" });
  riskQueue.push({ priority: "low", action: "Run Helm, Kubernetes, chart-testing, chart-releaser, OCI registry, and signing commands only in a trusted sandbox after reviewing this static map.", why: "RepoTutor records Helm readiness only; it does not render charts, install releases, contact clusters, push OCI artifacts, sign packages, call GitHub releases, or execute CI commands.", relatedHref: "html/helm-readiness.html" });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Helm readiness report: setup ${helmSetups.length}개, chart signal ${chartSignals.length}개, validation signal ${validationSignals.length}개, release signal ${releaseSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Helm readiness Chart.yaml values.yaml templates _helpers.tpl values.schema.json Chart.lock helm lint template install upgrade rollback test package push provenance chart-testing ct lint ct install chart-releaser cr upload cr index OCI kubeconform",
    helmSetups,
    chartSignals,
    templateSignals,
    valuesSignals,
    dependencySignals,
    validationSignals,
    releaseSignals,
    securitySignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"Chart.yaml|type: library|values.yaml|values.schema.json|templates/|_helpers.tpl|Chart.lock\" .", purpose: "Inventory chart metadata, values contract, helper templates, schemas, and dependency locks." },
      { command: "rg \"helm lint|helm template|helm install|helm upgrade|helm rollback|helm test|--dry-run|--atomic|--wait\" .", purpose: "Review Helm validation, install, upgrade, rollback, and test workflows." },
      { command: "rg \"ct lint|ct install|chart-testing|kubeconform|kubeval|helm unittest|helm-unittest\" .github .", purpose: "Find chart-testing, manifest validation, and Helm unit-test CI evidence." },
      { command: "rg \"helm dependency (build|update)|dependencies:|repository:|condition:|alias:\" .", purpose: "Trace dependency declarations, repositories, conditions, aliases, and dependency build policy." },
      { command: "rg \"helm package|--sign|--keyring|helm verify|\\.prov|helm push|oci://|cr upload|cr index|chart-releaser|helm repo index|upload-artifact\" .github .", purpose: "Check packaging, provenance, OCI push, chart-releaser, repo index, and artifact upload evidence." }
    ],
    learnerNextSteps: [
      "먼저 Chart.yaml이 있는 chart roots를 찾고 type이 application인지 library인지 확인하세요.",
      "values.yaml, values.schema.json, required/default/global/env values가 사용자 설정 계약을 어떻게 표현하는지 묶어 보세요.",
      "templates/, _helpers.tpl, include, tpl, required, lookup, Capabilities, hooks가 어떤 Kubernetes manifests를 렌더링하는지 확인하세요.",
      "dependencies, repository, condition, alias, Chart.lock, helm dependency build/update가 dependency drift를 어떻게 관리하는지 확인하세요.",
      "helm lint/template, dry-run, kubeconform, ct lint/install, helm test, chart-releaser, OCI push가 CI에서 어떤 산출물로 남는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 helm render/install/upgrade/push/sign/verify는 안전한 sandbox와 test cluster에서 별도로 확인하세요."
    ]
  };
}

type HelmReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function helmReadinessSourceFiles(walk: WalkResult): Promise<HelmReadinessSourceFile[]> {
  const files: HelmReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !helmReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!helmReadinessPathSignal(file.relPath) && !helmReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function helmReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return helmReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|go\.sum|pyproject\.toml|requirements\.txt|Dockerfile|Chart\.ya?ml|Chart\.lock|values\.ya?ml|values\.schema\.json|ct\.ya?ml|cr\.ya?ml|kustomization\.ya?ml)$/i.test(base)
    || /\.(json|ya?ml|toml|tf|hcl|cue|rego|md|mdx|txt|conf|sh|bash|go|py|ts|tsx|js|jsx|mjs|cjs|rst|tpl)$/i.test(filePath);
}

function helmReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(charts?|helm|templates|values|chart-testing|chart-releaser|ct|cr)(\/|\.|-|_|$)|(^|\/)(Chart\.ya?ml|Chart\.lock|values\.ya?ml|values\.schema\.json|_helpers\.tpl)$|\.github\/workflows/i.test(filePath);
}

function helmReadinessContentSignal(text: string): boolean {
  return /(Chart\.yaml|apiVersion:\s*v2|type:\s*library|values\.yaml|values\.schema\.json|templates\/|_helpers\.tpl|helm\s+(lint|template|install|upgrade|rollback|test|package|push|verify)|ct\s+(lint|install|lint-and-install)|chart-testing|chart-releaser|cr\s+(upload|index)|Chart\.lock|helm dependency|oci:\/\/|\.prov|kubeconform|helm-unittest)/i.test(text);
}

function helmReadinessSetups(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["helmSetups"] {
  const rows: HelmReadinessReport["helmSetups"] = [];
  for (const source of sourceFiles) {
    const chartCount = countMatches(source.text, /Chart\.ya?ml|apiVersion:\s*v2|apiVersion:\s*v1|\bname:\s|version:\s|appVersion:|type:\s*(application|library)/gi) + (/(^|\/)Chart\.ya?ml$/i.test(source.filePath) ? 1 : 0);
    const valuesCount = countMatches(source.text, /values\.ya?ml|--values\b|-f\s+|--set\b|--set-string|--set-file|--set-json|global:|required values?|default values?/gi) + (/(^|\/)values\.ya?ml$/i.test(source.filePath) ? 1 : 0);
    const templateCount = countMatches(source.text, /templates\/|_helpers\.tpl|{{-?\s*(include|tpl|required|lookup|define|template)|\.Capabilities|helm\.sh\/hook|hook-weight/gi) + (/\/templates\//i.test(source.filePath) ? 1 : 0);
    const dependencyCount = countMatches(source.text, /dependencies:|repository:\s|condition:\s|alias:\s|Chart\.lock|helm dependency (build|update)|requirements\.ya?ml|charts\//gi);
    const schemaCount = countMatches(source.text, /values\.schema\.json|\$schema|JSON Schema|validate-chart-schema|schema validation/gi) + (/(^|\/)values\.schema\.json$/i.test(source.filePath) ? 1 : 0);
    const testCount = countMatches(source.text, /helm lint|helm template|helm install.*--dry-run|--dry-run=server|kubeconform|kubeval|ct lint|ct install|ct lint-and-install|helm unittest|helm-unittest|helm test/gi);
    const packagingCount = countMatches(source.text, /helm package|helm repo index|index\.ya?ml|\.tgz|chart package|package-path|packages-with-index/gi);
    const releaseCount = countMatches(source.text, /helm install|helm upgrade|helm rollback|helm test|helm push|oci:\/\/|chart-releaser|cr upload|cr index|helm\/chart-releaser-action|skip-existing/gi);
    const provenanceCount = countMatches(source.text, /--sign|--keyring|helm verify|provenance|\.prov|DigestFile|sha256|keyring|verify/i);
    const ciCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|chart-testing|ct lint|ct install|helm lint|helm template|kubeconform|chart-releaser|upload-artifact|helm-readiness-report\.json/gi);
    const hasSetupSignal = chartCount + valuesCount + templateCount + dependencyCount + schemaCount + testCount + packagingCount + releaseCount + provenanceCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      chartType: helmReadinessChartType(source),
      chartCount,
      valuesCount,
      templateCount,
      dependencyCount,
      schemaCount,
      testCount,
      packagingCount,
      releaseCount,
      provenanceCount,
      ciCount,
      readiness: chartCount > 0 && valuesCount > 0 && templateCount > 0 && testCount > 0 && (releaseCount > 0 || packagingCount > 0) ? "ready" : "partial",
      evidence: `${source.filePath} contains chart ${chartCount}, values ${valuesCount}, templates ${templateCount}, dependencies ${dependencyCount}, schemas ${schemaCount}, tests ${testCount}, packaging ${packagingCount}, releases ${releaseCount}, provenance ${provenanceCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.chartCount + b.valuesCount + b.templateCount + b.testCount + b.releaseCount + b.provenanceCount + b.ciCount) - (a.chartCount + a.valuesCount + a.templateCount + a.testCount + a.releaseCount + a.provenanceCount + a.ciCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function helmReadinessChartType(source: HelmReadinessSourceFile): HelmReadinessReport["helmSetups"][number]["chartType"] {
  if (/type:\s*library/i.test(source.text)) return "library";
  if (/type:\s*application|apiVersion:\s*v2|templates\/|kind:\s*(Deployment|Service|Ingress|ConfigMap)/i.test(source.text)) return "application";
  return "unknown";
}

function helmReadinessChartSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["chartSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "chart-yaml", pattern: /Chart\.ya?ml|apiVersion:\s*v2|apiVersion:\s*v1|appVersion:|version:/i, evidence: "Chart.yaml metadata evidence was detected." },
    { signal: "values", pattern: /values\.ya?ml|--values\b|-f\s+|--set\b|default values/i, evidence: "values evidence was detected." },
    { signal: "templates", pattern: /templates\/|kind:\s*(Deployment|Service|Ingress|ConfigMap|Secret)|{{-?\s*(include|tpl|required|define)/i, evidence: "template evidence was detected." },
    { signal: "helpers", pattern: /_helpers\.tpl|{{-?\s*define|{{-?\s*include/i, evidence: "helper template evidence was detected." },
    { signal: "library-chart", pattern: /type:\s*library|library chart/i, evidence: "library chart evidence was detected." },
    { signal: "chart-lock", pattern: /Chart\.lock|digest:\s|generated:\s/i, evidence: "Chart.lock evidence was detected." }
  ], "chart", "signal");
}

function helmReadinessTemplateSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["templateSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "helm-template", pattern: /helm template|rendered manifest|template command/i, evidence: "helm template evidence was detected." },
    { signal: "include", pattern: /{{-?\s*include\b/i, evidence: "include helper evidence was detected." },
    { signal: "tpl", pattern: /{{-?\s*tpl\b/i, evidence: "tpl function evidence was detected." },
    { signal: "lookup", pattern: /\blookup\b/i, evidence: "lookup function evidence was detected." },
    { signal: "required", pattern: /{{-?\s*required\b|required values?/i, evidence: "required value evidence was detected." },
    { signal: "capabilities", pattern: /\.Capabilities|Capabilities\.APIVersions|Capabilities\.KubeVersion/i, evidence: "Capabilities evidence was detected." },
    { signal: "hooks", pattern: /helm\.sh\/hook|hook-weight|pre-install|post-install|pre-upgrade|post-upgrade|test-success/i, evidence: "Helm hook evidence was detected." }
  ], "template", "signal");
}

function helmReadinessValuesSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["valuesSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "values-schema", pattern: /values\.schema\.json|\$schema|JSON Schema|validate-chart-schema/i, evidence: "values schema evidence was detected." },
    { signal: "global-values", pattern: /\bglobal:\s|Values\.global/i, evidence: "global values evidence was detected." },
    { signal: "env-values", pattern: /ci\/.*-values\.ya?ml|prod-values|staging-values|dev-values|environment values|values-prod|values-staging/i, evidence: "environment values evidence was detected." },
    { signal: "required-values", pattern: /required values?|{{-?\s*required\b|requiredEnv|must be set/i, evidence: "required values evidence was detected." },
    { signal: "default-values", pattern: /default values?|values\.ya?ml|default config|default configuration/i, evidence: "default values evidence was detected." }
  ], "values", "signal");
}

function helmReadinessDependencySignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["dependencySignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "dependencies", pattern: /dependencies:|requirements\.ya?ml/i, evidence: "dependency declaration evidence was detected." },
    { signal: "repository", pattern: /repository:\s|@helm repo|helm repo add/i, evidence: "repository evidence was detected." },
    { signal: "condition", pattern: /condition:\s|tags:\s/i, evidence: "dependency condition evidence was detected." },
    { signal: "alias", pattern: /alias:\s/i, evidence: "dependency alias evidence was detected." },
    { signal: "helm-dependency", pattern: /helm dependency (build|update)|skip-helm-dependencies|helm-dependency-extra-args/i, evidence: "helm dependency command evidence was detected." },
    { signal: "chart-lock", pattern: /Chart\.lock|digest:\s|generated:\s/i, evidence: "Chart.lock evidence was detected." }
  ], "dependency", "signal");
}

function helmReadinessValidationSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["validationSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "helm-lint", pattern: /helm lint|Run 'helm lint'|lint charts?/i, evidence: "helm lint evidence was detected." },
    { signal: "helm-template", pattern: /helm template|template --debug|render manifests?/i, evidence: "helm template evidence was detected." },
    { signal: "dry-run", pattern: /--dry-run|dry run|dry-run=server|helm install.*dry-run|helm upgrade.*dry-run/i, evidence: "dry-run evidence was detected." },
    { signal: "kubeconform", pattern: /kubeconform|kubeval|datree|conftest/i, evidence: "manifest validation evidence was detected." },
    { signal: "ct-lint", pattern: /ct lint|chart-testing.*lint/i, evidence: "ct lint evidence was detected." },
    { signal: "ct-install", pattern: /ct install|ct lint-and-install|chart-testing.*install/i, evidence: "ct install evidence was detected." },
    { signal: "helm-unittest", pattern: /helm unittest|helm-unittest|unittest plugin/i, evidence: "helm-unittest evidence was detected." }
  ], "validation", "signal");
}

function helmReadinessReleaseSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["releaseSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "helm-upgrade", pattern: /helm upgrade|upgrade --install|helm upgrade --install/i, evidence: "helm upgrade evidence was detected." },
    { signal: "helm-install", pattern: /helm install|InstallWithValues|ct install/i, evidence: "helm install evidence was detected." },
    { signal: "helm-rollback", pattern: /helm rollback|rollback release/i, evidence: "helm rollback evidence was detected." },
    { signal: "helm-test", pattern: /helm test|Test runs `helm test`|ct install.*test/i, evidence: "helm test evidence was detected." },
    { signal: "chart-releaser", pattern: /chart-releaser|helm\/chart-releaser-action|cr upload|cr index/i, evidence: "chart-releaser evidence was detected." },
    { signal: "oci-push", pattern: /helm push|oci:\/\/|OCI registry|registry login/i, evidence: "OCI push evidence was detected." },
    { signal: "repo-index", pattern: /helm repo index|index\.ya?ml|cr index|packages-with-index/i, evidence: "repo index evidence was detected." }
  ], "release", "signal");
}

function helmReadinessSecuritySignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["securitySignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "provenance", pattern: /provenance|\.prov|provFile/i, evidence: "provenance evidence was detected." },
    { signal: "signing", pattern: /helm package --sign|--sign|signing key|signed package/i, evidence: "signing evidence was detected." },
    { signal: "verify", pattern: /helm verify|--verify|Verify that the given chart/i, evidence: "verify evidence was detected." },
    { signal: "keyring", pattern: /--keyring|keyring|public key/i, evidence: "keyring evidence was detected." },
    { signal: "digest", pattern: /sha256|DigestFile|digest:\s|checksum/i, evidence: "digest evidence was detected." },
    { signal: "oci-registry", pattern: /oci:\/\/|OCI registry|helm registry login|registry\.Client/i, evidence: "OCI registry evidence was detected." }
  ], "security", "signal");
}

function helmReadinessCiSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["ciSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "chart-testing", pattern: /chart-testing|ct lint|ct install|ct lint-and-install|quay\.io\/helmpack\/chart-testing/i, evidence: "chart-testing evidence was detected." },
    { signal: "helm-lint", pattern: /helm lint/i, evidence: "helm lint CI evidence was detected." },
    { signal: "helm-template", pattern: /helm template/i, evidence: "helm template CI evidence was detected." },
    { signal: "kubeconform", pattern: /kubeconform|kubeval|datree/i, evidence: "kubeconform CI evidence was detected." },
    { signal: "chart-releaser", pattern: /chart-releaser|helm\/chart-releaser-action|cr upload|cr index/i, evidence: "chart-releaser CI evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|helm-readiness-report\.json|chart-report\.json|helm-template\.yaml|ct-report\.json/i, evidence: "Helm artifact upload evidence was detected." }
  ], "CI", "signal");
}

function helmReadinessPackageSignals(sourceFiles: HelmReadinessSourceFile[]): HelmReadinessReport["packageSignals"] {
  return helmReadinessSignalFromSpecs(sourceFiles, [
    { signal: "helm", pattern: /helm\.sh\/helm|helm\s+(lint|template|install|upgrade|package|push|verify)|\bhelm\b/i, evidence: "Helm package/command evidence was detected." },
    { signal: "chart-testing", pattern: /helm\/chart-testing|chart-testing|ct lint|ct install|quay\.io\/helmpack\/chart-testing/i, evidence: "chart-testing package evidence was detected." },
    { signal: "chart-releaser", pattern: /helm\/chart-releaser|chart-releaser|cr upload|cr index|chart-releaser-action/i, evidence: "chart-releaser package evidence was detected." },
    { signal: "helm-docs", pattern: /helm-docs|norwoodj\/helm-docs/i, evidence: "helm-docs evidence was detected." },
    { signal: "helm-unittest", pattern: /helm-unittest|helm unittest/i, evidence: "helm-unittest package evidence was detected." },
    { signal: "kubeconform", pattern: /kubeconform|kubeval|datree/i, evidence: "kubeconform package evidence was detected." }
  ], "package", "signal");
}

function helmReadinessSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: HelmReadinessSourceFile[],
  specs: T,
  label: string,
  labelKey: "signal"
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/helm-readiness.html"
    } as { signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildAdmissionPolicyReadinessReport(walk: WalkResult): Promise<AdmissionPolicyReadinessReport> {
  const sourceFiles = await admissionPolicyReadinessSourceFiles(walk);
  const admissionSetups = admissionPolicyReadinessSetups(sourceFiles);
  const controllerSignals = admissionPolicyControllerSignals(sourceFiles);
  const policySignals = admissionPolicyPolicySignals(sourceFiles);
  const ruleSignals = admissionPolicyRuleSignals(sourceFiles);
  const enforcementSignals = admissionPolicyEnforcementSignals(sourceFiles);
  const exceptionSignals = admissionPolicyExceptionSignals(sourceFiles);
  const validationSignals = admissionPolicyValidationSignals(sourceFiles);
  const observabilitySignals = admissionPolicyObservabilitySignals(sourceFiles);
  const ciSignals = admissionPolicyCiSignals(sourceFiles);
  const packageSignals = admissionPolicyPackageSignals(sourceFiles);

  const hasController = controllerSignals.some((item) => item.readiness === "ready");
  const hasPolicy = policySignals.some((item) => item.readiness === "ready");
  const hasRule = ruleSignals.some((item) => item.readiness === "ready");
  const hasEnforcement = enforcementSignals.some((item) => item.readiness === "ready");
  const hasValidation = validationSignals.some((item) => item.readiness === "ready");
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => item.readiness === "ready");

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  const riskQueue: AdmissionPolicyReadinessReport["riskQueue"] = [];
  if (!hasController) riskQueue.push({ priority: "high", action: "Identify the admission policy engine or native Kubernetes admission API before claiming policy readiness.", why: "Admission policy readiness starts with visible Kyverno, Gatekeeper, ValidatingAdmissionPolicy, MutatingAdmissionPolicy, or admission webhook evidence.", relatedHref: "html/admission-policy-readiness.html" });
  if (hasController && !hasPolicy) riskQueue.push({ priority: "high", action: "Add concrete policy resources such as ClusterPolicy, ConstraintTemplate, constraints, or ValidatingAdmissionPolicy.", why: "An installed controller without policy resources does not show what requests will be allowed, denied, audited, or mutated.", relatedHref: "html/admission-policy-readiness.html" });
  if (hasPolicy && !hasRule) riskQueue.push({ priority: "medium", action: "Document validate, mutate, generate, verifyImages, CEL, Rego violation, or matchConditions rules.", why: "Learners need to see the rule language and admission request matching semantics, not only resource names.", relatedHref: "html/admission-policy-readiness.html" });
  if (hasPolicy && !hasEnforcement) riskQueue.push({ priority: "medium", action: "Record enforcement mode such as Enforce, Audit, warn, dryrun, validationActions, or failurePolicy.", why: "Admission policies are risky when learners cannot distinguish fail-closed, fail-open, warning, and audit-only behavior.", relatedHref: "html/admission-policy-readiness.html" });
  if (hasPolicy && !hasValidation) riskQueue.push({ priority: "low", action: "Add kyverno test/apply, gator test/verify, conftest, or kubectl dry-run evidence.", why: "Static policy resources are stronger when a safe validation workflow exists before cluster admission changes.", relatedHref: "html/admission-policy-readiness.html" });
  if (hasPolicy && !hasObservability) riskQueue.push({ priority: "low", action: "Add PolicyReport, ClusterPolicyReport, violations, audit result, metric, or event evidence.", why: "Admission controls should leave learner-visible feedback for rejected, warned, or audited requests.", relatedHref: "html/admission-policy-readiness.html" });
  if ((hasValidation || hasPolicy) && !hasCi) riskQueue.push({ priority: "low", action: "Publish admission policy validation artifacts from CI.", why: "CI artifacts make policy decisions and dry-run validation reproducible without contacting a learner's cluster.", relatedHref: "html/admission-policy-readiness.html" });
  riskQueue.push({ priority: "low", action: "Run Kyverno, Gatekeeper, kubectl, and admission webhook checks only in a trusted sandbox or test cluster.", why: "RepoTutor records admission policy readiness only; it does not apply policies, call admission webhooks, mutate clusters, evaluate live requests, or run controller CLIs.", relatedHref: "html/admission-policy-readiness.html" });

  return {
    summary: `Admission policy readiness report: setup ${admissionSetups.length}개, controller signal ${controllerSignals.length}개, policy signal ${policySignals.length}개, enforcement signal ${enforcementSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Admission policy readiness Kyverno ClusterPolicy PolicyException validate mutate generate verifyImages validationFailureAction Gatekeeper ConstraintTemplate constraint enforcementAction audit warn dryrun gator ValidatingAdmissionPolicy MutatingAdmissionPolicy admissionReviewVersions failurePolicy matchConditions validationActions PolicyReport",
    admissionSetups,
    controllerSignals,
    policySignals,
    ruleSignals,
    enforcementSignals,
    exceptionSignals,
    validationSignals,
    observabilitySignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"ClusterPolicy|PolicyException|validationFailureAction|verifyImages|kyverno (test|apply)\" .", purpose: "Inventory Kyverno policies, exceptions, enforcement modes, image verification, and safe CLI validation evidence." },
      { command: "rg \"ConstraintTemplate|constraints\\.gatekeeper\\.sh|enforcementAction|violation\\[|gator (test|verify)\" .", purpose: "Trace Gatekeeper templates, constraints, enforcement actions, Rego violations, and gator validation evidence." },
      { command: "rg \"ValidatingAdmissionPolicy|MutatingAdmissionPolicy|validationActions|matchConditions|failurePolicy|admissionReviewVersions\" .", purpose: "Find native Kubernetes admission policy and webhook matching/failure semantics." },
      { command: "rg \"PolicyReport|ClusterPolicyReport|totalViolations|audit-results|admission_webhook|upload-artifact\" .github .", purpose: "Check policy reporting, violation feedback, admission metrics, and CI artifact evidence." },
      { command: "rg \"namespaceSelector|objectSelector|exclude:|match:|exemptions|PolicyException\" .", purpose: "Review exception and scoping paths before changing enforcement." }
    ],
    learnerNextSteps: [
      "먼저 Kyverno, Gatekeeper, Kubernetes native admission, webhook 중 어떤 admission policy engine이 보이는지 확인하세요.",
      "ClusterPolicy, Policy, ConstraintTemplate, constraints, ValidatingAdmissionPolicy 같은 실제 policy resources를 controller evidence와 묶어 보세요.",
      "validate, mutate, generate, verifyImages, CEL expression, Rego violation, matchConditions가 어떤 admission request를 다루는지 확인하세요.",
      "Enforce, Audit, warn, dryrun, validationActions, failurePolicy가 fail-closed/fail-open/audit-only 중 어디에 해당하는지 분리하세요.",
      "PolicyException, namespaceSelector, objectSelector, match/exclude, exemptions가 어떤 예외 경로를 여는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 policy apply, webhook 호출, controller CLI, cluster mutation은 안전한 sandbox 또는 test cluster에서 별도 확인하세요."
    ]
  };
}

type AdmissionPolicyReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function admissionPolicyReadinessSourceFiles(walk: WalkResult): Promise<AdmissionPolicyReadinessSourceFile[]> {
  const files: AdmissionPolicyReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !admissionPolicyInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!admissionPolicyPathSignal(file.relPath) && !admissionPolicyContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function admissionPolicyInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return admissionPolicyPathSignal(filePath)
    || /^(package\.json|go\.mod|go\.sum|requirements\.txt|pyproject\.toml|Dockerfile|Chart\.ya?ml|values\.ya?ml|kustomization\.ya?ml)$/i.test(base)
    || /\.(json|ya?ml|toml|tf|hcl|cue|rego|md|mdx|txt|conf|sh|bash|go|py|ts|tsx|js|jsx|mjs|cjs|rst|tpl)$/i.test(filePath);
}

function admissionPolicyPathSignal(filePath: string): boolean {
  return /(^|\/)(kyverno|gatekeeper|admission|admission[-_]?policy|policies|policy|constraints?|constraint[-_]?templates?|webhooks?|kubernetes|k8s|manifests?)(\/|\.|-|_|$)|\.github\/workflows/i.test(filePath);
}

function admissionPolicyContentSignal(text: string): boolean {
  return /(ClusterPolicy|PolicyException|validationFailureAction|verifyImages|kyverno\s+(test|apply)|ConstraintTemplate|constraints\.gatekeeper\.sh|enforcementAction|violation\[|gator\s+(test|verify)|ValidatingAdmissionPolicy|MutatingAdmissionPolicy|ValidatingWebhookConfiguration|MutatingWebhookConfiguration|AdmissionReview|admissionReviewVersions|failurePolicy|matchConditions|validationActions|PolicyReport|ClusterPolicyReport)/i.test(text);
}

function admissionPolicyReadinessSetups(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["admissionSetups"] {
  const rows: AdmissionPolicyReadinessReport["admissionSetups"] = [];
  for (const source of sourceFiles) {
    const policyCount = countMatches(source.text, /kind:\s*(ClusterPolicy|Policy|ValidatingAdmissionPolicy|MutatingAdmissionPolicy)\b|ClusterPolicy|PolicyException/gi);
    const constraintCount = countMatches(source.text, /ConstraintTemplate|constraints\.gatekeeper\.sh|kind:\s*K8s[A-Za-z0-9]+|violation\[/gi);
    const webhookCount = countMatches(source.text, /ValidatingWebhookConfiguration|MutatingWebhookConfiguration|AdmissionReview|admissionReviewVersions|webhooks?:|clientConfig:|service:/gi);
    const validationCount = countMatches(source.text, /validate:|validationActions|validations:|expression:|cel|failurePolicy|matchConditions|kyverno apply|kyverno test|gator test|gator verify|conftest|kubectl.*dry-run/gi);
    const mutationCount = countMatches(source.text, /mutate:|generate:|MutatingAdmissionPolicy|MutatingWebhookConfiguration|patchesJson6902|patchStrategicMerge|AssignMetadata|ModifySet|AssignImage/gi);
    const exceptionCount = countMatches(source.text, /PolicyException|namespaceSelector|objectSelector|exclude:|match:|exemptions?|excludedNamespaces|excludedRules/gi);
    const enforcementCount = countMatches(source.text, /validationFailureAction:\s*(Enforce|Audit)|enforcementAction:\s*(deny|dryrun|warn|audit)|validationActions:\s*\[|failurePolicy:\s*(Fail|Ignore)|dryrun|warn|audit/gi);
    const testCount = countMatches(source.text, /kyverno\s+(test|apply)|gator\s+(test|verify)|conftest|kubectl\s+.*--dry-run|chainsaw|policy[-_ ]?test/gi);
    const observabilityCount = countMatches(source.text, /PolicyReport|ClusterPolicyReport|totalViolations|status\.violations|audit-results|audit result|admission_webhook|apiserver_admission|events?|metrics?/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|upload-artifact|kyverno-test|gator-report|admission-policy-readiness-report\.json/gi);
    const totalSignals = policyCount + constraintCount + webhookCount + validationCount + mutationCount + exceptionCount + enforcementCount + testCount + observabilityCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      framework: admissionPolicyFramework(source),
      policyCount,
      constraintCount,
      webhookCount,
      validationCount,
      mutationCount,
      exceptionCount,
      enforcementCount,
      testCount,
      observabilityCount,
      ciCount,
      readiness: (policyCount > 0 || constraintCount > 0 || webhookCount > 0) && validationCount > 0 && enforcementCount > 0 && testCount > 0 ? "ready" : "partial",
      evidence: `${source.filePath} contains policies ${policyCount}, constraints ${constraintCount}, webhooks ${webhookCount}, validation ${validationCount}, mutation ${mutationCount}, exceptions ${exceptionCount}, enforcement ${enforcementCount}, tests ${testCount}, observability ${observabilityCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.policyCount + b.constraintCount + b.webhookCount + b.validationCount + b.enforcementCount + b.testCount + b.ciCount) - (a.policyCount + a.constraintCount + a.webhookCount + a.validationCount + a.enforcementCount + a.testCount + a.ciCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function admissionPolicyFramework(source: AdmissionPolicyReadinessSourceFile): AdmissionPolicyReadinessReport["admissionSetups"][number]["framework"] {
  if (/\.github\/workflows/i.test(source.filePath)) return "workflow";
  if (/^(package\.json|go\.mod|requirements\.txt|pyproject\.toml)$/i.test(path.basename(source.filePath))) return "package-script";
  if (/kyverno|ClusterPolicy|PolicyException|validationFailureAction|verifyImages/i.test(source.filePath) || /kyverno|ClusterPolicy|PolicyException|validationFailureAction|verifyImages/i.test(source.text)) return "kyverno";
  if (/gatekeeper|ConstraintTemplate|constraints\.gatekeeper\.sh|enforcementAction|gator/i.test(source.filePath) || /gatekeeper|ConstraintTemplate|constraints\.gatekeeper\.sh|enforcementAction|gator/i.test(source.text)) return "gatekeeper";
  if (/ValidatingAdmissionPolicy|MutatingAdmissionPolicy|validationActions|matchConditions/i.test(source.text)) return "kubernetes-native";
  if (/ValidatingWebhookConfiguration|MutatingWebhookConfiguration|AdmissionReview|admissionReviewVersions/i.test(source.text)) return "webhook";
  if (/readme|docs?/i.test(source.filePath)) return "readme";
  return "unknown";
}

function admissionPolicyControllerSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["controllerSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "kyverno", pattern: /kyverno|ClusterPolicy|PolicyException|validationFailureAction|verifyImages/i, evidence: "Kyverno evidence was detected." },
    { signal: "gatekeeper", pattern: /gatekeeper|ConstraintTemplate|constraints\.gatekeeper\.sh|gator\s+(test|verify)/i, evidence: "Gatekeeper evidence was detected." },
    { signal: "validating-admission-policy", pattern: /ValidatingAdmissionPolicy|validatingadmissionpolicy|validationActions|validations:/i, evidence: "ValidatingAdmissionPolicy evidence was detected." },
    { signal: "mutating-admission-policy", pattern: /MutatingAdmissionPolicy|mutatingadmissionpolicy|applyConfiguration|jsonPatch/i, evidence: "MutatingAdmissionPolicy evidence was detected." },
    { signal: "admission-webhook", pattern: /ValidatingWebhookConfiguration|MutatingWebhookConfiguration|AdmissionReview|admissionReviewVersions/i, evidence: "admission webhook evidence was detected." }
  ], "controller", "signal");
}

function admissionPolicyPolicySignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["policySignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "cluster-policy", pattern: /kind:\s*ClusterPolicy\b|ClusterPolicy/i, evidence: "ClusterPolicy evidence was detected." },
    { signal: "policy", pattern: /kind:\s*Policy\b|apiVersion:\s*kyverno\.io/i, evidence: "Kyverno Policy evidence was detected." },
    { signal: "constraint-template", pattern: /ConstraintTemplate|templates\.gatekeeper\.sh/i, evidence: "ConstraintTemplate evidence was detected." },
    { signal: "constraint", pattern: /constraints\.gatekeeper\.sh|kind:\s*K8s[A-Za-z0-9]+|spec:\s*\n\s*match:/i, evidence: "Gatekeeper constraint evidence was detected." },
    { signal: "validating-admission-policy", pattern: /kind:\s*ValidatingAdmissionPolicy\b|ValidatingAdmissionPolicyBinding/i, evidence: "native admission policy evidence was detected." },
    { signal: "policy-binding", pattern: /ValidatingAdmissionPolicyBinding|policyName:|paramRef:/i, evidence: "policy binding evidence was detected." }
  ], "policy", "signal");
}

function admissionPolicyRuleSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["ruleSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "validate", pattern: /validate:|validations:|messageExpression|deny:/i, evidence: "validate rule evidence was detected." },
    { signal: "mutate", pattern: /mutate:|patchStrategicMerge|patchesJson6902|AssignMetadata|ModifySet|AssignImage/i, evidence: "mutate rule evidence was detected." },
    { signal: "generate", pattern: /generate:|synchronize:\s|clone:|data:/i, evidence: "generate rule evidence was detected." },
    { signal: "verify-images", pattern: /verifyImages|attestors:|imageReferences|cosign|rekor/i, evidence: "image verification evidence was detected." },
    { signal: "cel-expression", pattern: /expression:\s|object\.|oldObject\.|request\.|authorizer\./i, evidence: "CEL expression evidence was detected." },
    { signal: "rego-violation", pattern: /violation\[|rego|package\s+[A-Za-z0-9_.-]+/i, evidence: "Rego violation evidence was detected." },
    { signal: "match-conditions", pattern: /matchConditions|namespaceSelector|objectSelector|resources:|operations:|apiGroups:|apiVersions:/i, evidence: "request matching evidence was detected." }
  ], "rule", "signal");
}

function admissionPolicyEnforcementSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["enforcementSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "enforce", pattern: /validationFailureAction:\s*Enforce|enforcementAction:\s*deny|\bEnforce\b/i, evidence: "enforce/deny evidence was detected." },
    { signal: "audit", pattern: /validationFailureAction:\s*Audit|enforcementAction:\s*audit|\baudit\b/i, evidence: "audit evidence was detected." },
    { signal: "warn", pattern: /enforcementAction:\s*warn|\bwarn\b|validationActions:\s*\[[^\]]*Warn/i, evidence: "warn evidence was detected." },
    { signal: "dryrun", pattern: /enforcementAction:\s*dryrun|\bdryrun\b|dry[-_ ]?run/i, evidence: "dryrun evidence was detected." },
    { signal: "failure-policy-fail", pattern: /failurePolicy:\s*Fail/i, evidence: "failurePolicy Fail evidence was detected." },
    { signal: "failure-policy-ignore", pattern: /failurePolicy:\s*Ignore/i, evidence: "failurePolicy Ignore evidence was detected." },
    { signal: "validation-actions", pattern: /validationActions:\s*\[|validationActions:/i, evidence: "validationActions evidence was detected." }
  ], "enforcement", "signal");
}

function admissionPolicyExceptionSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["exceptionSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "policy-exception", pattern: /PolicyException|enablePolicyException/i, evidence: "PolicyException evidence was detected." },
    { signal: "namespace-selector", pattern: /namespaceSelector|excludedNamespaces|namespaces:/i, evidence: "namespace selector evidence was detected." },
    { signal: "object-selector", pattern: /objectSelector|labelSelector|matchLabels|matchExpressions/i, evidence: "object selector evidence was detected." },
    { signal: "match-exclude", pattern: /exclude:|match:\s|notKinds|excludedRules|subjects:/i, evidence: "match/exclude evidence was detected." },
    { signal: "exemptions", pattern: /exemptions?|exemptNamespace|exemptImages|excludedUsers|excludedGroups/i, evidence: "exemption evidence was detected." }
  ], "exception", "signal");
}

function admissionPolicyValidationSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["validationSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "kyverno-test", pattern: /kyverno\s+test|kyverno-test|chainsaw/i, evidence: "kyverno test evidence was detected." },
    { signal: "kyverno-apply", pattern: /kyverno\s+apply|kyverno apply|policy[-_ ]?report/i, evidence: "kyverno apply evidence was detected." },
    { signal: "gator-test", pattern: /gator\s+test|gator-test/i, evidence: "gator test evidence was detected." },
    { signal: "gator-verify", pattern: /gator\s+verify|gator-verify/i, evidence: "gator verify evidence was detected." },
    { signal: "conftest", pattern: /conftest|opa\s+test/i, evidence: "conftest/OPA test evidence was detected." },
    { signal: "kubectl-dry-run", pattern: /kubectl\s+.*--dry-run|--dry-run=server|kubectl\s+diff/i, evidence: "kubectl dry-run/diff evidence was detected." }
  ], "validation", "signal");
}

function admissionPolicyObservabilitySignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["observabilitySignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "policy-report", pattern: /PolicyReport|wgpolicyk8s\.io\/v1alpha2/i, evidence: "PolicyReport evidence was detected." },
    { signal: "cluster-policy-report", pattern: /ClusterPolicyReport/i, evidence: "ClusterPolicyReport evidence was detected." },
    { signal: "violations", pattern: /totalViolations|status\.violations|constraint_violations|violation count/i, evidence: "violation feedback evidence was detected." },
    { signal: "audit-results", pattern: /audit-results|audit result|auditChannel|audit-controller/i, evidence: "audit result evidence was detected." },
    { signal: "metrics", pattern: /admission_webhook|apiserver_admission|prometheus|metrics|histogram|counter/i, evidence: "metrics evidence was detected." },
    { signal: "events", pattern: /generateSuccessEvents|events?|EventBroadcaster|emit.*event/i, evidence: "event evidence was detected." }
  ], "observability", "signal");
}

function admissionPolicyCiSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["ciSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|admission-policy-readiness-report\.json|kyverno-report\.json|gator-report\.json|policy-report\.json/i, evidence: "artifact upload evidence was detected." },
    { signal: "kyverno-cli", pattern: /kyverno\s+(test|apply|jp)|kyverno-action/i, evidence: "Kyverno CLI CI evidence was detected." },
    { signal: "gator-cli", pattern: /gator\s+(test|verify)|setup-gator/i, evidence: "gator CLI CI evidence was detected." },
    { signal: "kubectl", pattern: /kubectl\s+(apply|diff|wait|get|auth|create).*dry-run|kubectl\s+diff/i, evidence: "kubectl CI evidence was detected." }
  ], "CI", "signal");
}

function admissionPolicyPackageSignals(sourceFiles: AdmissionPolicyReadinessSourceFile[]): AdmissionPolicyReadinessReport["packageSignals"] {
  return admissionPolicySignalFromSpecs(sourceFiles, [
    { signal: "kyverno", pattern: /"kyverno"|kyverno\/kyverno|ghcr\.io\/kyverno|kyverno\s+(test|apply)|kyverno\.io/i, evidence: "Kyverno package/tool evidence was detected." },
    { signal: "gatekeeper", pattern: /gatekeeper|open-policy-agent\/gatekeeper|gator\s+(test|verify)|gatekeeper\.sh/i, evidence: "Gatekeeper package/tool evidence was detected." },
    { signal: "opa", pattern: /open-policy-agent|opa\s+(test|eval)|conftest|rego/i, evidence: "OPA/Rego package/tool evidence was detected." },
    { signal: "kubernetes-client", pattern: /@kubernetes\/client-node|client-go|k8s\.io\/api|kubectl|kubernetes-client/i, evidence: "Kubernetes client evidence was detected." }
  ], "package", "signal");
}

function admissionPolicySignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: AdmissionPolicyReadinessSourceFile[],
  specs: T,
  label: string,
  labelKey: "signal"
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/admission-policy-readiness.html"
    } as { signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildApiGatewayReadinessReport(walk: WalkResult): Promise<ApiGatewayReadinessReport> {
  const sourceFiles = await apiGatewayReadinessSourceFiles(walk);
  const apiGatewaySetups = apiGatewayReadinessSetups(sourceFiles);
  const gatewaySignals = apiGatewayReadinessGatewaySignals(sourceFiles);
  const routeSignals = apiGatewayReadinessRouteSignals(sourceFiles);
  const upstreamSignals = apiGatewayReadinessUpstreamSignals(sourceFiles);
  const authSignals = apiGatewayReadinessAuthSignals(sourceFiles);
  const pluginSignals = apiGatewayReadinessPluginSignals(sourceFiles);
  const trafficPolicySignals = apiGatewayReadinessTrafficPolicySignals(sourceFiles);
  const observabilitySignals = apiGatewayReadinessObservabilitySignals(sourceFiles);
  const validationSignals = apiGatewayReadinessValidationSignals(sourceFiles);
  const ciSignals = apiGatewayReadinessCiSignals(sourceFiles);
  const packageSignals = apiGatewayReadinessPackageSignals(sourceFiles);

  const hasGateway = gatewaySignals.some((item) => item.readiness === "ready") || apiGatewaySetups.length > 0;
  const hasRoute = routeSignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.routeCount > 0);
  const hasUpstream = upstreamSignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.upstreamCount > 0);
  const hasAuth = authSignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.authCount > 0);
  const hasPlugin = pluginSignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.pluginCount > 0);
  const hasTrafficPolicy = trafficPolicySignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.trafficPolicyCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.observabilityCount > 0);
  const hasValidation = validationSignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.validationCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || apiGatewaySetups.some((item) => item.ciCount > 0);

  const riskQueue: ApiGatewayReadinessReport["riskQueue"] = [];
  if (!hasGateway) riskQueue.push({ priority: "high", action: "Identify the API gateway product or cloud API Gateway boundary before claiming gateway readiness.", why: "Gateway readiness starts with visible Kong, Tyk, KrakenD, cloud API Gateway, or reverse-proxy evidence.", relatedHref: "html/api-gateway-readiness.html" });
  if (hasGateway && !hasRoute) riskQueue.push({ priority: "high", action: "Add concrete service, route, endpoint, listen_path, or path/method route definitions.", why: "A gateway package without routes does not show which client traffic is accepted.", relatedHref: "html/api-gateway-readiness.html" });
  if (hasRoute && !hasUpstream) riskQueue.push({ priority: "medium", action: "Pair each route with upstream, target, backend, host, load-balancing, health-check, or timeout evidence.", why: "Learners need to trace from public route to backend service behavior.", relatedHref: "html/api-gateway-readiness.html" });
  if (hasRoute && !hasAuth) riskQueue.push({ priority: "medium", action: "Document gateway authentication such as key-auth, JWT, OAuth2, OIDC, ACL, mTLS, auth_configs, or keyless posture.", why: "Gateway routes without an auth posture can expose protected APIs or hide intentional public endpoints.", relatedHref: "html/api-gateway-readiness.html" });
  if ((hasGateway || hasRoute) && !hasTrafficPolicy) riskQueue.push({ priority: "medium", action: "Add rate limit, quota, retry, timeout, circuit-breaker, throttle, or proxy-cache policy evidence.", why: "API gateways usually enforce traffic contracts in front of services, not only route traffic.", relatedHref: "html/api-gateway-readiness.html" });
  if (hasPlugin && !hasValidation) riskQueue.push({ priority: "low", action: "Add decK, Tyk sync, krakend check, plugin test, gateway test, or OpenAPI validation evidence.", why: "Plugin and middleware changes are safer when gateway config can be validated without live production traffic.", relatedHref: "html/api-gateway-readiness.html" });
  if ((hasGateway || hasTrafficPolicy) && !hasObservability) riskQueue.push({ priority: "low", action: "Add metrics, analytics, tracing, logs, health, or status endpoint evidence for gateway behavior.", why: "Gateway failures need visible request, upstream, and policy feedback.", relatedHref: "html/api-gateway-readiness.html" });
  if ((hasGateway || hasValidation) && !hasCi) riskQueue.push({ priority: "low", action: "Publish gateway validation artifacts from CI.", why: "CI artifacts make route, policy, and plugin validation reproducible without contacting production gateways.", relatedHref: "html/api-gateway-readiness.html" });
  riskQueue.push({ priority: "low", action: "Run Kong, decK, Tyk, KrakenD, cloud gateway, Docker, Kubernetes, and sync commands only in a trusted sandbox after reviewing this static map.", why: "RepoTutor records API gateway readiness only; it does not start gateways, proxy requests, contact admin APIs, mutate route configs, run plugins, call cloud APIs, or execute gateway CLIs.", relatedHref: "html/api-gateway-readiness.html" });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `API gateway readiness report: setup ${apiGatewaySetups.length}개, gateway signal ${gatewaySignals.length}개, route signal ${routeSignals.length}개, traffic policy signal ${trafficPolicySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "API gateway readiness Kong Service Route Plugin Consumer Upstream Target key-auth jwt acl rate-limiting decK Tyk api_definition listen_path target_url auth_configs quota analytics KrakenD endpoint backend extra_config qos/ratelimit telemetry krakend check plugin",
    apiGatewaySetups,
    gatewaySignals,
    routeSignals,
    upstreamSignals,
    authSignals,
    pluginSignals,
    trafficPolicySignals,
    observabilitySignals,
    validationSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"_format_version|services:|routes:|plugins:|consumers:|upstreams:|deck gateway\" .", purpose: "Inventory Kong and decK service, route, plugin, consumer, upstream, and validation config." },
      { command: "rg \"api_definition|x-tyk-api-gateway|listen_path|target_url|auth_configs|enable_jwt|global_rate_limit|quota\" .", purpose: "Trace Tyk API definitions, proxy routes, auth, limits, and policy fields." },
      { command: "rg \"krakend|endpoints|endpoint|backend|extra_config|qos/ratelimit|telemetry/metrics|krakend check|test-plugin\" .", purpose: "Find KrakenD endpoint, backend, extra_config, rate-limit, telemetry, check, and plugin-test evidence." },
      { command: "rg \"key-auth|jwt|oauth2|openid-connect|acl|mtls|use_keyless|auth_configs|api_key\" .", purpose: "Review gateway auth posture and intentionally public routes." },
      { command: "rg \"prometheus|metrics|analytics|tracing|OpenTelemetry|health|status|upload-artifact|api-gateway-readiness-report\" .github .", purpose: "Check gateway observability, CI validation, and artifact upload evidence." }
    ],
    learnerNextSteps: [
      "먼저 Kong, Tyk, KrakenD, cloud API Gateway 중 어떤 gateway boundary가 실제로 쓰이는지 찾으세요.",
      "route/service/endpoint/listen_path가 어떤 public path와 method를 열고 backend/upstream/target/host로 어떻게 이어지는지 묶어 보세요.",
      "key-auth, JWT, OAuth2/OIDC, ACL, mTLS, keyless 같은 auth posture를 route별로 구분하세요.",
      "plugin, custom middleware, transform, CORS, cache, rate limit, quota, retry, timeout, circuit breaker가 traffic contract를 어디서 강제하는지 확인하세요.",
      "decK, Tyk sync, krakend check, test-plugin, OpenAPI validation, CI artifact가 gateway 설정 검증을 어떻게 남기는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 gateway start, admin API sync, proxy traffic, plugin execution, cloud API 변경은 안전한 sandbox에서 별도로 확인하세요."
    ]
  };
}

type ApiGatewayReadinessSourceFile = { filePath: string; text: string; sourceHref: string };

async function apiGatewayReadinessSourceFiles(walk: WalkResult): Promise<ApiGatewayReadinessSourceFile[]> {
  const files: ApiGatewayReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !apiGatewayReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!apiGatewayReadinessPathSignal(file.relPath) && !apiGatewayReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function apiGatewayReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return apiGatewayReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|go\.mod|go\.sum|pyproject\.toml|requirements\.txt|Dockerfile|docker-compose\.ya?ml|krakend\.json|kong\.ya?ml|deck\.ya?ml|tyk\.conf)$/i.test(base)
    || /\.(json|ya?ml|toml|hcl|md|mdx|txt|conf|ini|sh|bash|go|lua|py|ts|tsx|js|jsx|mjs|cjs|rst)$/i.test(filePath);
}

function apiGatewayReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(api[-_ ]?gateway|gateway|kong|deck|decK|tyk|krakend|routes?|services?|plugins?|upstreams?|middlewares?|policies?)(\/|\.|-|_|$)|(^|\/)(krakend\.json|kong\.ya?ml|deck\.ya?ml|tyk\.conf)$|\.github\/workflows/i.test(filePath);
}

function apiGatewayReadinessContentSignal(text: string): boolean {
  return /(Kong|_format_version:\s*['"]?3|deck gateway|decK|services:\s*\n|routes:\s*\n|plugins:\s*\n|consumers:\s*\n|upstreams:\s*\n|Tyk|x-tyk-api-gateway|api_definition|listen_path|target_url|auth_configs|global_rate_limit|KrakenD|krakend\.json|endpoints?\s*:|"endpoints"\s*:|"endpoint"\s*:|"backend"\s*:|extra_config|qos\/ratelimit|telemetry\/metrics|AWS::ApiGateway|apigatewayv2|google_api_gateway|azurerm_api_management|reverse[-_ ]?proxy)/i.test(text);
}

function apiGatewayReadinessSetups(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["apiGatewaySetups"] {
  const rows: ApiGatewayReadinessReport["apiGatewaySetups"] = [];
  for (const source of sourceFiles) {
    const routeCount = countMatches(source.text, /\broutes?:\s*\n|\bRoute\b|paths?:\s*\[|methods?:\s*\[|"endpoint"\s*:|endpoint:\s|listen_path|path:\s|uri:\s|strip_path|strip_listen_path|x-tyk-api-gateway/gi);
    const upstreamCount = countMatches(source.text, /\bservices?:\s*\n|upstreams?:\s*\n|targets?:\s*\n|target_url|backend"\s*:|backend:\s|host"\s*:|host:\s|url_pattern|loadbalanc|health[-_ ]?check|active_healthchecks|passive_healthchecks|circuit[-_ ]?breaker|timeout/gi);
    const authCount = countMatches(source.text, /key-auth|jwt|oauth2|openid-connect|acl|consumer|credential|mtls|client certificate|auth_configs|enable_jwt|use_keyless|api_key|authorization|oauth|jwks|jwk/gi);
    const pluginCount = countMatches(source.text, /plugins?:\s*\n|plugin\s*[:=]|custom_middleware|middleware|request-transformer|response-transformer|pre-function|post-function|cors|proxy-cache|cel|lua|martian|modifier\/lua|test-plugin/gi);
    const trafficPolicyCount = countMatches(source.text, /rate[-_ ]?limit|rate-limiting|ratelimit|quota|throttle|retry|timeout|circuit[-_ ]?breaker|proxy-cache|qos\/ratelimit|global_rate_limit|disable_rate_limit|disable_quota/gi);
    const transformCount = countMatches(source.text, /request-transformer|response-transformer|transform|strip_path|strip_listen_path|headers?:|querystring|rewrite|modify_response|modifier\/lua|martian|mapping/gi);
    const observabilityCount = countMatches(source.text, /prometheus|metrics|analytics|tracing|opentelemetry|opencensus|jaeger|zipkin|logs?|access logs?|health|status|__health|dashboard|x-kong-upstream-status/gi);
    const validationCount = countMatches(source.text, /deck gateway (validate|diff|sync|dump)|deck\s+(validate|diff|sync|dump)|tyk[-_ ]?sync|tyk sync|krakend\s+(check|test-plugin|audit)|gateway[-_ ]?test|openapi|redocly|schema validation/gi);
    const deploymentCount = countMatches(source.text, /docker-compose|helm|kubernetes|Deployment|Service|Ingress|values\.ya?ml|kong\/kong|tyk-gateway|krakend|gateway image|container_name|ports:/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\/|upload-artifact|deck gateway|tyk sync|krakend check|krakend test-plugin|api-gateway-readiness-report\.json/gi);
    const totalSignals = routeCount + upstreamCount + authCount + pluginCount + trafficPolicyCount + transformCount + observabilityCount + validationCount + deploymentCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      gateway: apiGatewayReadinessGateway(source),
      routeCount,
      upstreamCount,
      authCount,
      pluginCount,
      trafficPolicyCount,
      transformCount,
      observabilityCount,
      validationCount,
      deploymentCount,
      ciCount,
      readiness: routeCount > 0 && upstreamCount > 0 && (authCount > 0 || trafficPolicyCount > 0) && validationCount > 0 ? "ready" : "partial",
      evidence: `${source.filePath} contains routes ${routeCount}, upstreams ${upstreamCount}, auth ${authCount}, plugins ${pluginCount}, traffic policies ${trafficPolicyCount}, transforms ${transformCount}, observability ${observabilityCount}, validation ${validationCount}, deployment ${deploymentCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => (b.routeCount + b.upstreamCount + b.authCount + b.pluginCount + b.trafficPolicyCount + b.validationCount + b.ciCount) - (a.routeCount + a.upstreamCount + a.authCount + a.pluginCount + a.trafficPolicyCount + a.validationCount + a.ciCount) || a.filePath.localeCompare(b.filePath)).slice(0, 100);
}

function apiGatewayReadinessGateway(source: ApiGatewayReadinessSourceFile): ApiGatewayReadinessReport["apiGatewaySetups"][number]["gateway"] {
  if (/\.github\/workflows/i.test(source.filePath)) return "workflow";
  if (/^(package\.json|go\.mod|requirements\.txt|pyproject\.toml|docker-compose\.ya?ml)$/i.test(path.basename(source.filePath))) return "package-script";
  if (/kong|deck gateway|decK|_format_version|x-kong/i.test(source.filePath) || /Kong|deck gateway|decK|_format_version|x-kong|key-auth|rate-limiting/i.test(source.text)) return "kong";
  if (/tyk|x-tyk-api-gateway|api_definition|listen_path|target_url|auth_configs/i.test(source.filePath) || /Tyk|x-tyk-api-gateway|api_definition|listen_path|target_url|auth_configs|use_keyless/i.test(source.text)) return "tyk";
  if (/krakend/i.test(source.filePath) || /KrakenD|krakend|qos\/ratelimit|telemetry\/metrics|extra_config/i.test(source.text)) return "krakend";
  if (/AWS::ApiGateway|apigatewayv2|google_api_gateway|azurerm_api_management|ApiGatewayV2/i.test(source.text)) return "cloud-api-gateway";
  if (/readme|docs?/i.test(source.filePath)) return "readme";
  return "unknown";
}

function apiGatewayReadinessGatewaySignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["gatewaySignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "kong", pattern: /Kong|kong\/kong|_format_version|deck gateway|decK|x-kong/i, evidence: "Kong or decK evidence was detected." },
    { signal: "tyk", pattern: /Tyk|tyk-gateway|x-tyk-api-gateway|api_definition|listen_path|target_url/i, evidence: "Tyk gateway evidence was detected." },
    { signal: "krakend", pattern: /KrakenD|krakend|qos\/ratelimit|telemetry\/metrics|extra_config/i, evidence: "KrakenD evidence was detected." },
    { signal: "cloud-api-gateway", pattern: /AWS::ApiGateway|AWS::ApiGatewayV2|apigatewayv2|google_api_gateway|azurerm_api_management|aws_api_gateway/i, evidence: "cloud API Gateway evidence was detected." },
    { signal: "reverse-proxy", pattern: /reverse[-_ ]?proxy|proxy_pass|upstream\s+\w+\s*\{|ReverseProxy|proxying request/i, evidence: "reverse proxy evidence was detected." }
  ], "gateway", "signal");
}

function apiGatewayReadinessRouteSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["routeSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "service", pattern: /\bservices?:\s*\n|Kong-Service|service:\s|service_id|Service entity/i, evidence: "service route boundary evidence was detected." },
    { signal: "route", pattern: /\broutes?:\s*\n|Kong-Route|route:\s|route_id|Route entity/i, evidence: "route evidence was detected." },
    { signal: "endpoint", pattern: /"endpoint"\s*:|endpoint:\s|endpoints?:\s*\[/i, evidence: "endpoint evidence was detected." },
    { signal: "listen-path", pattern: /listen_path|strip_listen_path/i, evidence: "listen_path evidence was detected." },
    { signal: "path-method", pattern: /paths?:\s*\[|methods?:\s*\[|method:\s|get:\s|post:\s|put:\s|delete:\s|patch:\s/i, evidence: "path/method evidence was detected." },
    { signal: "host", pattern: /hosts?:\s*\[|host:\s|Host header|hostname/i, evidence: "host routing evidence was detected." },
    { signal: "strip-path", pattern: /strip_path|strip-listen-path|strip_listen_path|preserve_host/i, evidence: "strip/preserve path evidence was detected." }
  ], "route", "signal");
}

function apiGatewayReadinessUpstreamSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["upstreamSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "upstream", pattern: /upstreams?:\s*\n|Upstream entity|set_upstream/i, evidence: "upstream evidence was detected." },
    { signal: "target", pattern: /targets?:\s*\n|target_url|target:\s|Target entity/i, evidence: "target evidence was detected." },
    { signal: "backend", pattern: /backend"\s*:|backend:\s|BackendFactory|backendFactory|url_pattern/i, evidence: "backend evidence was detected." },
    { signal: "host", pattern: /host"\s*:|host:\s|hosts?:\s*\[|disable_host_sanitize/i, evidence: "host evidence was detected." },
    { signal: "load-balancing", pattern: /loadbalanc|balancer|least-connections|round-robin|hash_on|algorithm/i, evidence: "load-balancing evidence was detected." },
    { signal: "health-check", pattern: /health[-_ ]?check|active_healthchecks|passive_healthchecks|host_checker|healthy|unhealthy/i, evidence: "health-check evidence was detected." },
    { signal: "timeout", pattern: /timeout|connect_timeout|read_timeout|write_timeout|proxyTimeout/i, evidence: "timeout evidence was detected." },
    { signal: "circuit-breaker", pattern: /circuit[-_ ]?breaker|cb\.BackendFactory|qos\/circuit-breaker/i, evidence: "circuit breaker evidence was detected." }
  ], "upstream", "signal");
}

function apiGatewayReadinessAuthSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["authSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "key-auth", pattern: /key-auth|keyauth|api_key|AuthKey/i, evidence: "key auth evidence was detected." },
    { signal: "jwt", pattern: /\bjwt\b|enable_jwt|jwks|jwk|jwt_default_policies/i, evidence: "JWT evidence was detected." },
    { signal: "oauth2", pattern: /oauth2|oauth2-clientcredentials|client credentials/i, evidence: "OAuth2 evidence was detected." },
    { signal: "openid-connect", pattern: /openid-connect|oidc|OpenID Connect/i, evidence: "OIDC evidence was detected." },
    { signal: "acl", pattern: /\bacl\b|acls|allow_groups|block_groups/i, evidence: "ACL evidence was detected." },
    { signal: "mtls", pattern: /mtls|mTLS|client certificate|tlsAuth|VerifyPeerCertificate/i, evidence: "mTLS evidence was detected." },
    { signal: "auth-configs", pattern: /auth_configs|authConfigs|base_identity_provided_by|custom authentication/i, evidence: "auth_configs evidence was detected." },
    { signal: "keyless", pattern: /use_keyless|keyless|disable authentication/i, evidence: "keyless route evidence was detected." }
  ], "auth", "signal");
}

function apiGatewayReadinessPluginSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["pluginSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "plugin", pattern: /plugins?:\s*\n|Plugin Development Kit|LoadPlugins|test-plugin|plugin\.go/i, evidence: "plugin evidence was detected." },
    { signal: "custom-middleware", pattern: /custom_middleware|middleware\.py|mw_|MiddlewareDefinition|custom middleware/i, evidence: "custom middleware evidence was detected." },
    { signal: "request-transformer", pattern: /request-transformer|request transformer|request\.set|rewrite/i, evidence: "request transformer evidence was detected." },
    { signal: "response-transformer", pattern: /response-transformer|response transformer|modify_response|response\.set/i, evidence: "response transformer evidence was detected." },
    { signal: "cors", pattern: /\bcors\b|allow_origins|Access-Control-Allow/i, evidence: "CORS evidence was detected." },
    { signal: "cache", pattern: /proxy-cache|response cache|res_cache|cache middleware/i, evidence: "cache plugin evidence was detected." },
    { signal: "cel", pattern: /cel|Google CEL|modifier\/cel/i, evidence: "CEL extension evidence was detected." },
    { signal: "lua", pattern: /\blua\b|modifier\/lua|lua-backend/i, evidence: "Lua extension evidence was detected." }
  ], "plugin", "signal");
}

function apiGatewayReadinessTrafficPolicySignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["trafficPolicySignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "rate-limiting", pattern: /rate[-_ ]?limit|rate-limiting|ratelimit|qos\/ratelimit|global_rate_limit/i, evidence: "rate limit evidence was detected." },
    { signal: "quota", pattern: /\bquota\b|quota_max|quota_remaining|disable_quota/i, evidence: "quota evidence was detected." },
    { signal: "throttle", pattern: /throttle|throttling|burst/i, evidence: "throttle evidence was detected." },
    { signal: "retry", pattern: /\bretry\b|retries|num_retries|automatic recovery/i, evidence: "retry evidence was detected." },
    { signal: "timeout", pattern: /timeout|connect_timeout|read_timeout|write_timeout|proxyTimeout/i, evidence: "timeout evidence was detected." },
    { signal: "circuit-breaker", pattern: /circuit[-_ ]?breaker|qos\/circuit-breaker|cb\.BackendFactory/i, evidence: "circuit breaker evidence was detected." },
    { signal: "proxy-cache", pattern: /proxy-cache|response cache|cache_ttl|Redis cache/i, evidence: "proxy cache evidence was detected." }
  ], "traffic policy", "signal");
}

function apiGatewayReadinessObservabilitySignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["observabilitySignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "prometheus", pattern: /prometheus|ServiceMonitor|prometheus exporter/i, evidence: "Prometheus evidence was detected." },
    { signal: "metrics", pattern: /metrics|telemetry\/metrics|metricCollector|histogram|counter/i, evidence: "metrics evidence was detected." },
    { signal: "analytics", pattern: /analytics|AnalyticsRecord|analytics_plugin|dashboard/i, evidence: "analytics evidence was detected." },
    { signal: "tracing", pattern: /tracing|OpenTelemetry|opentelemetry|opencensus|jaeger|zipkin|xray/i, evidence: "tracing evidence was detected." },
    { signal: "logs", pattern: /logs?|access logs?|Log-Plugin|logger|telemetry\/logging/i, evidence: "log evidence was detected." },
    { signal: "health", pattern: /health|__health|healthz|host_checker|active_healthchecks/i, evidence: "health evidence was detected." },
    { signal: "status", pattern: /status|upstream status|X-Kong-Upstream-Status|gateway status/i, evidence: "status evidence was detected." }
  ], "observability", "signal");
}

function apiGatewayReadinessValidationSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["validationSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "deck", pattern: /deck gateway validate|deck validate|decK validate/i, evidence: "decK validate evidence was detected." },
    { signal: "deck-sync", pattern: /deck gateway (diff|sync|dump)|deck\s+(diff|sync|dump)/i, evidence: "decK diff/sync/dump evidence was detected." },
    { signal: "tyk-sync", pattern: /tyk[-_ ]?sync|tyk sync|Tyk Sync/i, evidence: "Tyk sync evidence was detected." },
    { signal: "krakend-check", pattern: /krakend\s+check|krakend check|krakend audit/i, evidence: "krakend check evidence was detected." },
    { signal: "krakend-test-plugin", pattern: /krakend\s+test-plugin|test-plugin/i, evidence: "krakend test-plugin evidence was detected." },
    { signal: "gateway-tests", pattern: /gateway.*test|proxy.*test|router.*test|api gateway smoke/i, evidence: "gateway test evidence was detected." },
    { signal: "openapi", pattern: /openapi|swagger|redocly|schema validation/i, evidence: "OpenAPI validation evidence was detected." }
  ], "validation", "signal");
}

function apiGatewayReadinessCiSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["ciSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|api-gateway-readiness-report\.json|gateway-report\.json|deck-report\.json|krakend-report\.json|tyk-report\.json/i, evidence: "artifact upload evidence was detected." },
    { signal: "docker-compose", pattern: /docker-compose|compose\.ya?ml|services:\s*\n/i, evidence: "Docker Compose evidence was detected." },
    { signal: "helm", pattern: /helm|Chart\.ya?ml|values\.ya?ml|kong\/chart|tyk-headless|krakend/i, evidence: "Helm evidence was detected." },
    { signal: "kubernetes", pattern: /kind:\s*(Deployment|Service|Ingress|ConfigMap)|kubernetes|kubectl|Kustomization/i, evidence: "Kubernetes deployment evidence was detected." }
  ], "CI", "signal");
}

function apiGatewayReadinessPackageSignals(sourceFiles: ApiGatewayReadinessSourceFile[]): ApiGatewayReadinessReport["packageSignals"] {
  return apiGatewayReadinessSignalFromSpecs(sourceFiles, [
    { signal: "kong", pattern: /kong\/kong|Kong|lua-kong-nginx-module|@kong\//i, evidence: "Kong package/image evidence was detected." },
    { signal: "deck", pattern: /kong\/deck|deck gateway|decK/i, evidence: "decK package/tool evidence was detected." },
    { signal: "tyk", pattern: /Tyk|tyk-gateway|github\.com\/TykTechnologies\/tyk|tykio\/tyk-gateway/i, evidence: "Tyk package/image evidence was detected." },
    { signal: "krakend", pattern: /KrakenD|krakend|github\.com\/krakend\/krakend|devopsfaith\/krakend/i, evidence: "KrakenD package/image evidence was detected." },
    { signal: "lura", pattern: /luraproject\/lura|github\.com\/luraproject\/lura/i, evidence: "Lura package evidence was detected." },
    { signal: "gateway-api", pattern: /@aws-sdk\/client-api-gateway|aws-cdk-lib\/aws-apigateway|google_api_gateway|azurerm_api_management/i, evidence: "cloud gateway package/provider evidence was detected." }
  ], "package", "signal");
}

function apiGatewayReadinessSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: ApiGatewayReadinessSourceFile[],
  specs: T,
  label: string,
  labelKey: "signal"
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/api-gateway-readiness.html"
    } as { signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
