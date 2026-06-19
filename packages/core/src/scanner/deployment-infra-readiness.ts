import path from "node:path";
import type { DeploymentReadinessReport, IacDriftReadinessReport, InfrastructureReadinessReport, ServerlessReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildInfrastructureReadinessReport(walk: WalkResult): Promise<InfrastructureReadinessReport> {
  const sourceFiles = await infrastructureSourceFiles(walk);
  const infrastructureSetups = infrastructureSetupFiles(sourceFiles);
  const configSignals = infrastructureConfigSignals(sourceFiles);
  const stateSignals = infrastructureStateSignals(sourceFiles);
  const workflowSignals = infrastructureWorkflowSignals(sourceFiles);
  const moduleSignals = infrastructureModuleSignals(sourceFiles);
  const variableSignals = infrastructureVariableSignals(sourceFiles);
  const policySignals = infrastructurePolicySignals(sourceFiles);
  const packageSignals = infrastructurePackageSignals(sourceFiles);

  const hasConfig = infrastructureSetups.length > 0 || configSignals.some((item) => item.readiness === "ready");
  const hasState = stateSignals.some((item) => ["backend", "remote-state", "state-lock", "terraform-lock-hcl", "state-encryption"].includes(item.signal) && item.readiness === "ready");
  const hasPlan = workflowSignals.some((item) => item.signal === "plan-command" && item.readiness === "ready");
  const hasPolicy = policySignals.some((item) => item.readiness === "ready");
  const hasVariables = variableSignals.some((item) => item.readiness === "ready") || infrastructureSetups.some((item) => item.variableCount > 0);

  const riskQueue: InfrastructureReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add an infrastructure inventory if this project owns cloud resources.",
      why: "OpenTofu-style review starts from concrete .tf files, providers, resources, modules, variables, and outputs.",
      relatedHref: "html/infrastructure-readiness.html"
    });
  }
  if (hasConfig && !hasState) {
    riskQueue.push({
      priority: "medium",
      action: "Document backend, state locking, workspace, and lockfile ownership.",
      why: "Infrastructure changes are unsafe when state storage, locking, and dependency selections are implicit.",
      relatedHref: "html/infrastructure-readiness.html"
    });
  }
  if (hasConfig && !hasPlan) {
    riskQueue.push({
      priority: "medium",
      action: "Record a plan-before-apply workflow in docs or CI.",
      why: "OpenTofu execution plans let reviewers inspect intended infrastructure changes before apply.",
      relatedHref: "html/infrastructure-readiness.html"
    });
  }
  if (hasConfig && !hasPolicy) {
    riskQueue.push({
      priority: "low",
      action: "Add static IaC guardrails such as tflint, tfsec, checkov, OPA, or conftest.",
      why: "Policy and lint checks catch unsafe infrastructure patterns before plan or apply.",
      relatedHref: "html/infrastructure-readiness.html"
    });
  }
  if (hasConfig && !hasVariables) {
    riskQueue.push({
      priority: "low",
      action: "Document input variables, tfvars files, and sensitive values.",
      why: "Reviewers need to know which values are supplied at plan/apply time and which must stay secret.",
      relatedHref: "html/infrastructure-readiness.html"
    });
  }

  return {
    summary: `OpenTofu-style infrastructure readiness report: setup ${infrastructureSetups.length}개, config signal ${configSignals.length}개, state signal ${stateSignals.length}개, workflow signal ${workflowSignals.length}개, policy signal ${policySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenTofu terraform block provider resource data module variable output backend state lockfile init plan apply import workspace validate fmt test",
    infrastructureSetups,
    configSignals,
    stateSignals,
    workflowSignals,
    moduleSignals,
    variableSignals,
    policySignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "tofu init -backend=false", purpose: "Check provider/module initialization without touching a remote backend." },
      { command: "tofu validate", purpose: "Validate OpenTofu configuration syntax and provider-facing constraints." },
      { command: "tofu plan -out plan.tfplan", purpose: "Generate a reviewable execution plan before apply." },
      { command: "tofu show -json plan.tfplan", purpose: "Export the plan for policy, cost, or review tooling." }
    ],
    learnerNextSteps: [
      "Open Infrastructure Readiness and identify the root .tf files first.",
      "Confirm required providers, backend/state ownership, and workspace policy before reading resources.",
      "Use the plan/apply/import workflow signals to understand how infrastructure changes are reviewed.",
      "Review variable and policy signals before trusting any apply path."
    ]
  };
}

type InfrastructureSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function infrastructureSourceFiles(walk: WalkResult): Promise<InfrastructureSourceFile[]> {
  const files: InfrastructureSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !infrastructureInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!infrastructurePathSignal(file.relPath) && !infrastructureContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function infrastructureInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return infrastructurePathSignal(filePath)
    || /(^|\/)(README|docs?|infrastructure|infra|terraform|tofu|terragrunt|pulumi|cdk|cloudformation|deployment|deploy|iac|policy|policies|ci|workflows?|scripts?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base);
}

function infrastructurePathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /\.(tf|tfvars|tftest\.hcl)$/i.test(filePath)
    || base === ".terraform.lock.hcl"
    || /^terragrunt\.hcl$/i.test(base)
    || /^(Pulumi\.(ya?ml|json)|cdk\.json|template\.(ya?ml|json))$/i.test(base)
    || /(^|\/)(terraform|opentofu|tofu|terragrunt|pulumi|cdk|cloudformation|infra|infrastructure|iac)(\/|$)/i.test(filePath);
}

function infrastructureContentSignal(text: string): boolean {
  return /(OpenTofu|tofu\s+(init|plan|apply|validate|fmt|test|import|destroy)|terraform\s+(init|plan|apply|validate|fmt|test|import|destroy)|terraform\s*\{|required_providers|required_version|provider\s+"|resource\s+"|data\s+"|module\s+"|variable\s+"|output\s+"|backend\s+"|terraform_remote_state|\.terraform\.lock\.hcl|terragrunt|tflint|tfsec|checkov|conftest|infracost)/i.test(text);
}

function infrastructureSetupFiles(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["infrastructureSetups"] {
  const rows: InfrastructureReadinessReport["infrastructureSetups"] = [];
  for (const source of sourceFiles) {
    const terraformBlockCount = countMatches(source.text, /(^|\n)\s*terraform\s*\{/g);
    const providerCount = countMatches(source.text, /(^|\n)\s*provider\s+"[^"]+"/g);
    const resourceCount = countMatches(source.text, /(^|\n)\s*resource\s+"[^"]+"\s+"[^"]+"/g);
    const dataSourceCount = countMatches(source.text, /(^|\n)\s*data\s+"[^"]+"\s+"[^"]+"/g);
    const moduleCount = countMatches(source.text, /(^|\n)\s*module\s+"[^"]+"/g);
    const variableCount = countMatches(source.text, /(^|\n)\s*variable\s+"[^"]+"/g);
    const outputCount = countMatches(source.text, /(^|\n)\s*output\s+"[^"]+"/g);
    const backendCount = countMatches(source.text, /backend\s+"[^"]+"|terraform_remote_state|remote state|state backend/gi);
    const workflowCount = countMatches(source.text, /\b(tofu|terraform)\s+(init|plan|apply|validate|fmt|test|import|destroy)\b/g);
    const totalSignals = terraformBlockCount + providerCount + resourceCount + dataSourceCount + moduleCount + variableCount + outputCount + backendCount + workflowCount;
    if (totalSignals === 0 && !infrastructurePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: infrastructureTool(source),
      terraformBlockCount,
      providerCount,
      resourceCount,
      dataSourceCount,
      moduleCount,
      variableCount,
      outputCount,
      backendCount,
      workflowCount,
      readiness: totalSignals >= 5 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} OpenTofu/Terraform-style infrastructure signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.resourceCount + b.moduleCount + b.providerCount + b.workflowCount;
    const aScore = a.resourceCount + a.moduleCount + a.providerCount + a.workflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 50);
}

function infrastructureTool(source: InfrastructureSourceFile): InfrastructureReadinessReport["infrastructureSetups"][number]["tool"] {
  if (/opentofu|tofu\s+(init|plan|apply|validate|fmt|test|import|destroy)/i.test(source.text)) return "opentofu";
  if (/terragrunt/i.test(source.filePath) || /terragrunt/i.test(source.text)) return "terragrunt";
  if (/pulumi/i.test(source.filePath) || /pulumi/i.test(source.text)) return "pulumi";
  if (/cdk\.json|aws-cdk|cdktf/i.test(source.filePath) || /aws-cdk|cdktf/i.test(source.text)) return "cdk";
  if (/cloudformation|AWSTemplateFormatVersion|Resources:/i.test(source.filePath) || /AWSTemplateFormatVersion|CloudFormation/i.test(source.text)) return "cloudformation";
  if (/helm|Chart\.yaml/i.test(source.filePath) || /helm/i.test(source.text)) return "helm";
  if (/kustomize|kustomization\.ya?ml/i.test(source.filePath) || /kustomize/i.test(source.text)) return "kustomize";
  if (/terraform|\.tf(vars)?$|\.terraform\.lock\.hcl/i.test(source.filePath) || /terraform\s*\{|terraform\s+(init|plan|apply|validate|fmt|test|import|destroy)/i.test(source.text)) return "terraform";
  return "unknown";
}

function infrastructureConfigSignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["configSignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tf-file", pattern: /\.tf$|\.tfvars$|\.tftest\.hcl$/i, evidence: "Terraform/OpenTofu file evidence was detected." },
    { signal: "terraform-block", pattern: /(^|\n)\s*terraform\s*\{/i, evidence: "terraform block evidence was detected." },
    { signal: "required-providers", pattern: /required_providers/i, evidence: "required provider declaration evidence was detected." },
    { signal: "required-version", pattern: /required_version/i, evidence: "required version evidence was detected." },
    { signal: "provider-block", pattern: /(^|\n)\s*provider\s+"[^"]+"/i, evidence: "provider block evidence was detected." },
    { signal: "resource-block", pattern: /(^|\n)\s*resource\s+"[^"]+"\s+"[^"]+"/i, evidence: "resource block evidence was detected." },
    { signal: "data-source", pattern: /(^|\n)\s*data\s+"[^"]+"\s+"[^"]+"/i, evidence: "data source evidence was detected." },
    { signal: "module-block", pattern: /(^|\n)\s*module\s+"[^"]+"/i, evidence: "module block evidence was detected." },
    { signal: "variable-block", pattern: /(^|\n)\s*variable\s+"[^"]+"/i, evidence: "variable block evidence was detected." },
    { signal: "output-block", pattern: /(^|\n)\s*output\s+"[^"]+"/i, evidence: "output block evidence was detected." },
    { signal: "locals-block", pattern: /(^|\n)\s*locals\s*\{/i, evidence: "locals block evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function infrastructureStateSignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["stateSignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["stateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "backend", pattern: /backend\s+"[^"]+"|state backend|remote backend/i, evidence: "backend evidence was detected." },
    { signal: "remote-state", pattern: /terraform_remote_state|remote state/i, evidence: "remote state data source evidence was detected." },
    { signal: "state-lock", pattern: /state lock|locking|lock table|DynamoDB|Consul|pg_advisory_lock/i, evidence: "state locking evidence was detected." },
    { signal: "workspace", pattern: /\bworkspace\b|tofu workspace|terraform workspace/i, evidence: "workspace evidence was detected." },
    { signal: "terraform-lock-hcl", pattern: /\.terraform\.lock\.hcl|provider lock|dependency lock/i, evidence: "dependency lockfile evidence was detected." },
    { signal: "state-file-warning", pattern: /terraform\.tfstate|state file|do not commit state|sensitive state/i, evidence: "state file warning evidence was detected." },
    { signal: "state-encryption", pattern: /state encryption|encrypted state|key_provider|encryption\s*\{/i, evidence: "state or plan encryption evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "state", "signal");
}

function infrastructureWorkflowSignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "init-command", pattern: /\b(tofu|terraform)\s+init\b/i, evidence: "init command evidence was detected." },
    { signal: "plan-command", pattern: /\b(tofu|terraform)\s+plan\b/i, evidence: "plan command evidence was detected." },
    { signal: "apply-command", pattern: /\b(tofu|terraform)\s+apply\b/i, evidence: "apply command evidence was detected." },
    { signal: "destroy-command", pattern: /\b(tofu|terraform)\s+destroy\b/i, evidence: "destroy command evidence was detected." },
    { signal: "import-command", pattern: /\b(tofu|terraform)\s+import\b|(^|\n)\s*import\s*\{/i, evidence: "import workflow evidence was detected." },
    { signal: "validate-command", pattern: /\b(tofu|terraform)\s+validate\b/i, evidence: "validate command evidence was detected." },
    { signal: "fmt-command", pattern: /\b(tofu|terraform)\s+fmt\b/i, evidence: "format command evidence was detected." },
    { signal: "test-command", pattern: /\b(tofu|terraform)\s+test\b|\.tftest\.hcl/i, evidence: "test command or tftest evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function infrastructureModuleSignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["moduleSignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["moduleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "source-url", pattern: /source\s*=\s*"[^"]*(git::|https?:\/\/|ssh:\/\/)/i, evidence: "module source URL evidence was detected." },
    { signal: "local-module", pattern: /source\s*=\s*"\.\/|source\s*=\s*"\.\.\//i, evidence: "local module source evidence was detected." },
    { signal: "registry-module", pattern: /source\s*=\s*"[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+"/i, evidence: "registry module source evidence was detected." },
    { signal: "provider-alias", pattern: /alias\s*=|providers\s*=\s*\{/i, evidence: "provider alias or provider passing evidence was detected." },
    { signal: "for-each", pattern: /for_each\s*=/i, evidence: "for_each evidence was detected." },
    { signal: "count", pattern: /count\s*=/i, evidence: "count evidence was detected." },
    { signal: "depends-on", pattern: /depends_on\s*=/i, evidence: "explicit dependency evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "module", "signal");
}

function infrastructureVariableSignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["variableSignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["variableSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tfvars", pattern: /\.tfvars$/i, evidence: "tfvars file evidence was detected." },
    { signal: "auto-tfvars", pattern: /\.auto\.tfvars$/i, evidence: "auto tfvars evidence was detected." },
    { signal: "sensitive-var", pattern: /sensitive\s*=\s*true|secret|password|token/i, evidence: "sensitive variable evidence was detected." },
    { signal: "validation", pattern: /validation\s*\{|condition\s*=|error_message\s*=/i, evidence: "variable validation evidence was detected." },
    { signal: "default-value", pattern: /default\s*=/i, evidence: "variable default evidence was detected." },
    { signal: "environment-var", pattern: /TF_VAR_|environment variable|env var/i, evidence: "environment variable evidence was detected." },
    { signal: "input-variable", pattern: /(^|\n)\s*variable\s+"[^"]+"/i, evidence: "input variable block evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "variable", "signal");
}

function infrastructurePolicySignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["policySignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tflint", pattern: /tflint|\.tflint\.hcl/i, evidence: "TFLint evidence was detected." },
    { signal: "tfsec", pattern: /tfsec/i, evidence: "tfsec evidence was detected." },
    { signal: "checkov", pattern: /checkov/i, evidence: "Checkov evidence was detected." },
    { signal: "opa", pattern: /\bopa\b|rego/i, evidence: "OPA/Rego evidence was detected." },
    { signal: "conftest", pattern: /conftest/i, evidence: "Conftest evidence was detected." },
    { signal: "sentinel", pattern: /sentinel/i, evidence: "Sentinel evidence was detected." },
    { signal: "infracost", pattern: /infracost/i, evidence: "Infracost evidence was detected." },
    { signal: "terraform-test", pattern: /\.tftest\.hcl|\b(tofu|terraform)\s+test\b/i, evidence: "OpenTofu/Terraform test evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function infrastructurePackageSignals(sourceFiles: InfrastructureSourceFile[]): InfrastructureReadinessReport["packageSignals"] {
  const specs: Array<{ signal: InfrastructureReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "opentofu", pattern: /opentofu|tofu\s+(init|plan|apply|validate|fmt|test|import|destroy)/i, evidence: "OpenTofu package or command evidence was detected." },
    { signal: "terraform", pattern: /terraform\s+(init|plan|apply|validate|fmt|test|import|destroy)|hashicorp\/terraform|\.terraform\.lock\.hcl/i, evidence: "Terraform package or command evidence was detected." },
    { signal: "terragrunt", pattern: /terragrunt/i, evidence: "Terragrunt evidence was detected." },
    { signal: "tflint", pattern: /tflint/i, evidence: "TFLint evidence was detected." },
    { signal: "tfsec", pattern: /tfsec/i, evidence: "tfsec evidence was detected." },
    { signal: "checkov", pattern: /checkov/i, evidence: "Checkov evidence was detected." },
    { signal: "cdktf", pattern: /cdktf|cdk\.json/i, evidence: "CDKTF evidence was detected." },
    { signal: "pulumi", pattern: /pulumi/i, evidence: "Pulumi evidence was detected." }
  ];
  return infrastructureSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function infrastructureSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: InfrastructureSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/infrastructure-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildIacDriftReadinessReport(walk: WalkResult): Promise<IacDriftReadinessReport> {
  const sourceFiles = await iacDriftSourceFiles(walk);
  const driftSetups = iacDriftSetups(sourceFiles);
  const toolSignals = iacDriftToolSignals(sourceFiles);
  const stateSignals = iacDriftStateSignals(sourceFiles);
  const inventorySignals = iacDriftInventorySignals(sourceFiles);
  const refreshSignals = iacDriftRefreshSignals(sourceFiles);
  const planSignals = iacDriftPlanSignals(sourceFiles);
  const driftSignals = iacDriftDriftSignals(sourceFiles);
  const remediationSignals = iacDriftRemediationSignals(sourceFiles);
  const outputSignals = iacDriftOutputSignals(sourceFiles);
  const ciSignals = iacDriftCiSignals(sourceFiles);
  const packageSignals = iacDriftPackageSignals(sourceFiles);

  const hasTool = toolSignals.some((item) => item.readiness === "ready") || driftSetups.length > 0;
  const hasState = stateSignals.some((item) => item.readiness === "ready") || driftSetups.some((item) => item.stateCount > 0);
  const hasRefresh = refreshSignals.some((item) => item.readiness === "ready") || driftSetups.some((item) => item.refreshCount > 0);
  const hasPlan = planSignals.some((item) => item.readiness === "ready") || driftSetups.some((item) => item.planCount > 0);
  const hasDrift = driftSignals.some((item) => item.readiness === "ready") || driftSetups.some((item) => item.driftCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || driftSetups.some((item) => item.outputCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || driftSetups.some((item) => item.ciCount > 0);

  const riskQueue: IacDriftReadinessReport["riskQueue"] = [];
  if (!hasTool) {
    riskQueue.push({
      priority: "high",
      action: "Identify the drift detection toolchain before relying on IaC drift readiness.",
      why: "Drift review needs a concrete scanner or plan/preview command such as driftctl, Terraform/OpenTofu, Pulumi, or Terragrunt.",
      relatedHref: "html/iac-drift-readiness.html"
    });
  }
  if (hasTool && !hasState) {
    riskQueue.push({
      priority: "high",
      action: "Document state, backend, workspace, stack, lock, and import ownership before comparing drift.",
      why: "Drift checks can mislead reviewers when state inventory and live-resource ownership are implicit.",
      relatedHref: "html/iac-drift-readiness.html"
    });
  }
  if (hasTool && !hasRefresh && !hasPlan) {
    riskQueue.push({
      priority: "medium",
      action: "Add a refresh-only, drift scan, plan, preview, or state-pull path that reviewers can inspect.",
      why: "A drift readiness lane needs a repeatable comparison between declared state and observed infrastructure.",
      relatedHref: "html/iac-drift-readiness.html"
    });
  }
  if ((hasRefresh || hasPlan) && !hasDrift) {
    riskQueue.push({
      priority: "medium",
      action: "Capture changed, missing, unmanaged, ignored, and exit-code drift outcomes.",
      why: "Without explicit drift outcome terms, users cannot tell whether a scan found no drift or did not classify it.",
      relatedHref: "html/iac-drift-readiness.html"
    });
  }
  if ((hasRefresh || hasPlan || hasDrift) && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Retain drift output as JSON, SARIF, Markdown, HTML, or CI artifacts.",
      why: "Drift evidence must survive the run so reviewers can compare changes across branches and schedules.",
      relatedHref: "html/iac-drift-readiness.html"
    });
  }
  if (hasTool && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Schedule drift checks or attach them to pull-request review when the environment is safe.",
      why: "Drift can emerge outside application commits, so scheduled evidence is often more useful than ad hoc runs.",
      relatedHref: "html/iac-drift-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run driftctl, Terraform/OpenTofu, Pulumi, Terragrunt, cloud provider, state, plan, refresh, import, apply, and destroy commands only in a trusted sandbox.",
    why: "RepoTutor records static readiness metadata only; real drift tools may read cloud APIs, remote state, credentials, and mutable infrastructure.",
    relatedHref: "html/iac-drift-readiness.html"
  });

  return {
    summary: `IaC drift readiness report: setup ${driftSetups.length}개, tool signal ${toolSignals.length}개, state signal ${stateSignals.length}개, refresh signal ${refreshSignals.length}개, drift signal ${driftSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "IaC drift readiness driftctl scan from tfstate terraform plan -detailed-exitcode refresh-only state pull show json OpenTofu tofu Pulumi refresh preview stack export import Terragrunt run-all plan ignore unmanaged missing changed drift summary",
    driftSetups,
    toolSignals,
    stateSignals,
    inventorySignals,
    refreshSignals,
    planSignals,
    driftSignals,
    remediationSignals,
    outputSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"driftctl scan|--from tfstate|--to aws|--output json|\\.driftignore|driftctl\\.yml\" .", purpose: "Find driftctl scan setup, state source, live inventory target, output, and ignore rules." },
      { command: "rg \"terraform plan|tofu plan|refresh-only|-detailed-exitcode|state pull|show -json|terraform import|tofu import\" .", purpose: "Find Terraform/OpenTofu refresh, plan, state export, JSON, and import review paths." },
      { command: "rg \"pulumi refresh|pulumi preview|pulumi stack export|pulumi import|--expect-no-changes|--diff\" .", purpose: "Find Pulumi stack refresh, preview diff, export, and import evidence." },
      { command: "rg \"terragrunt run-all plan|terragrunt plan-all|--terragrunt-non-interactive|terragrunt hclfmt\" .", purpose: "Find Terragrunt multi-module plan and formatting workflows." },
      { command: "rg \"changed|missing|unmanaged|drift|upload-artifact|iac-drift-readiness-report|infracost diff\" .github .", purpose: "Find drift outcome terms, retained artifacts, and cost-diff review signals." }
    ],
    learnerNextSteps: [
      "Open IaC Drift Readiness and identify which tool owns the drift comparison.",
      "Confirm the state/backend/workspace/stack evidence before trusting any changed, missing, or unmanaged result.",
      "Check whether refresh or plan evidence produces retained JSON, SARIF, Markdown, HTML, or CI artifacts.",
      "Treat import, state rm/mv, apply, and remediation references as review prompts, not commands to run from RepoTutor."
    ]
  };
}

type IacDriftSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function iacDriftSourceFiles(walk: WalkResult): Promise<IacDriftSourceFile[]> {
  const files: IacDriftSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !iacDriftInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!iacDriftPathSignal(file.relPath) && !iacDriftContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function iacDriftInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return iacDriftPathSignal(filePath)
    || /(^|\/)(README|docs?|infrastructure|infra|terraform|tofu|terragrunt|pulumi|iac|drift|state|cloud|ci|workflows?|scripts?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|driftctl\.ya?ml|\.driftignore)$/i.test(base);
}

function iacDriftPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /\.(tf|tfvars|tftest\.hcl)$/i.test(filePath)
    || /^terragrunt\.hcl$/i.test(base)
    || /^(Pulumi\.(ya?ml|json)|Pulumi\.[^.]+\.(ya?ml|json))$/i.test(base)
    || /^(driftctl\.ya?ml|\.driftignore)$/i.test(base)
    || /(^|\/)(terraform|opentofu|tofu|terragrunt|pulumi|infra|infrastructure|iac|drift)(\/|$)/i.test(filePath);
}

function iacDriftContentSignal(text: string): boolean {
  return /(driftctl\s+scan|--from\s+tfstate|--to\s+(aws|gcp|azure)|terraform\s+(plan|show|state|import)|tofu\s+(plan|show|state|import)|refresh-only|-detailed-exitcode|pulumi\s+(refresh|preview|stack\s+export|import)|terragrunt\s+(run-all\s+plan|plan-all|plan)|infracost\s+diff|unmanaged|missing|changed|drift summary|upload-artifact|\.driftignore)/i.test(text);
}

function iacDriftSetups(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["driftSetups"] {
  const rows: IacDriftReadinessReport["driftSetups"] = [];
  for (const source of sourceFiles) {
    const inventoryCount = countMatches(source.text, /(provider\s+"[^"]+"|--to\s+(aws|gcp|azure)|account|subscription|project|region|resource address|asset inventory|cloud control|cloudcontrol)/gi);
    const stateCount = countMatches(source.text, /(tfstate|remote state|backend\s+"[^"]+"|terraform_remote_state|workspace|stack|state lock|state pull|state list|state show|import)/gi);
    const refreshCount = countMatches(source.text, /(refresh-only|terraform\s+refresh|tofu\s+refresh|pulumi\s+refresh|state pull|driftctl\s+scan)/gi);
    const planCount = countMatches(source.text, /((terraform|tofu)\s+plan|-detailed-exitcode|-out[=\s]|pulumi\s+preview|terragrunt\s+(run-all\s+plan|plan-all|plan)|infracost\s+diff)/gi);
    const driftCount = countMatches(source.text, /(changed|missing|unmanaged|drift|ignore-rules|exit code|exit-code|summary)/gi);
    const ignoreCount = countMatches(source.text, /(\.driftignore|driftignore|ignore-rules|ignore rules|ignored)/gi);
    const outputCount = countMatches(source.text, /(json|sarif|markdown|html|upload-artifact|artifact upload|iac-drift-readiness-report)/gi);
    const ciCount = countMatches(source.text, /(github actions|\.github\/workflows|schedule:|cron:|pull_request|upload-artifact)/gi);
    const remediationCount = countMatches(source.text, /(terraform\s+import|tofu\s+import|state\s+rm|state\s+mv|pulumi\s+import|apply gated|manual review)/gi);
    const totalSignals = inventoryCount + stateCount + refreshCount + planCount + driftCount + ignoreCount + outputCount + ciCount + remediationCount;
    if (totalSignals === 0 && !iacDriftPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: iacDriftTool(source),
      inventoryCount,
      stateCount,
      refreshCount,
      planCount,
      driftCount,
      ignoreCount,
      outputCount,
      ciCount,
      remediationCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} IaC drift readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.driftCount + b.refreshCount + b.planCount + b.outputCount + b.ciCount;
    const aScore = a.driftCount + a.refreshCount + a.planCount + a.outputCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function iacDriftTool(source: IacDriftSourceFile): IacDriftReadinessReport["driftSetups"][number]["tool"] {
  if (/\.github\/workflows|github actions|pull_request|schedule:/i.test(source.filePath) || /\.github\/workflows|github actions|pull_request|schedule:/i.test(source.text)) return "workflow";
  if (/package\.json$/i.test(source.filePath)) return "package-script";
  if (/README|docs?/i.test(source.filePath)) return "readme";
  if (/driftctl/i.test(source.filePath) || /driftctl\s+scan|driftctl\.ya?ml|\.driftignore/i.test(source.text)) return "driftctl";
  if (/terragrunt/i.test(source.filePath) || /terragrunt/i.test(source.text)) return "terragrunt";
  if (/pulumi/i.test(source.filePath) || /pulumi/i.test(source.text)) return "pulumi";
  if (/opentofu|tofu\s+(plan|show|state|import|refresh)/i.test(source.text)) return "opentofu";
  if (/terraform|\.tf(vars)?$/i.test(source.filePath) || /terraform\s+(plan|show|state|import|refresh)|backend\s+"[^"]+"|tfstate/i.test(source.text)) return "terraform";
  return "unknown";
}

function iacDriftToolSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["toolSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "driftctl", pattern: /driftctl\s+scan|driftctl\.ya?ml|\.driftignore/i, evidence: "driftctl scan or config evidence was detected." },
    { signal: "terraform", pattern: /terraform\s+(plan|show|state|import|refresh)|backend\s+"[^"]+"|tfstate/i, evidence: "Terraform drift comparison evidence was detected." },
    { signal: "opentofu", pattern: /opentofu|tofu\s+(plan|show|state|import|refresh)/i, evidence: "OpenTofu drift comparison evidence was detected." },
    { signal: "pulumi", pattern: /pulumi\s+(refresh|preview|stack\s+export|import)|Pulumi\./i, evidence: "Pulumi drift comparison evidence was detected." },
    { signal: "terragrunt", pattern: /terragrunt\s+(run-all\s+plan|plan-all|plan)|terragrunt\.hcl/i, evidence: "Terragrunt plan evidence was detected." },
    { signal: "cloud-provider", pattern: /--to\s+(aws|gcp|azure)|provider\s+"[^"]+"|AWS_|AZURE_|GOOGLE_|cloud provider/i, evidence: "Cloud provider inventory evidence was detected." }
  ], "tool");
}

function iacDriftStateSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["stateSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "tfstate", pattern: /tfstate|\.tfstate/i, evidence: "Terraform state file/source evidence was detected." },
    { signal: "remote-state", pattern: /remote state|terraform_remote_state|remote backend/i, evidence: "Remote state evidence was detected." },
    { signal: "backend", pattern: /backend\s+"[^"]+"|state backend/i, evidence: "Backend configuration evidence was detected." },
    { signal: "workspace", pattern: /\bworkspace\b|terraform workspace|tofu workspace/i, evidence: "Workspace evidence was detected." },
    { signal: "stack", pattern: /pulumi stack|stack export|stack select|Pulumi\.[^.]+\.(ya?ml|json)/i, evidence: "Pulumi stack evidence was detected." },
    { signal: "state-lock", pattern: /state lock|locking|lock table|DynamoDB|Consul/i, evidence: "State locking evidence was detected." },
    { signal: "import", pattern: /terraform\s+import|tofu\s+import|pulumi\s+import|(^|\n)\s*import\s*\{/i, evidence: "Import ownership evidence was detected." }
  ], "state");
}

function iacDriftInventorySignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["inventorySignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "provider", pattern: /provider\s+"[^"]+"|required_providers/i, evidence: "Provider inventory evidence was detected." },
    { signal: "account", pattern: /account[_ -]?id|subscription[_ -]?id|tenant[_ -]?id|project[_ -]?id/i, evidence: "Account/project inventory evidence was detected." },
    { signal: "region", pattern: /\bregion\b|regions\b|location\s*=/i, evidence: "Region/location inventory evidence was detected." },
    { signal: "resource-address", pattern: /resource address|module\.[A-Za-z0-9_.-]+|[A-Za-z0-9_]+\.[A-Za-z0-9_.-]+|urn:pulumi/i, evidence: "Resource address evidence was detected." },
    { signal: "asset-inventory", pattern: /asset inventory|cloud inventory|resource inventory/i, evidence: "Asset inventory evidence was detected." },
    { signal: "cloud-control", pattern: /cloud control|cloudcontrol|AWS Cloud Control|CloudControl/i, evidence: "Cloud control inventory evidence was detected." }
  ], "inventory");
}

function iacDriftRefreshSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["refreshSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "refresh-only", pattern: /refresh-only|-refresh-only/i, evidence: "Refresh-only plan evidence was detected." },
    { signal: "refresh", pattern: /\b(terraform|tofu)\s+refresh\b|refresh\s*=/i, evidence: "Terraform/OpenTofu refresh evidence was detected." },
    { signal: "pulumi-refresh", pattern: /pulumi\s+refresh/i, evidence: "Pulumi refresh evidence was detected." },
    { signal: "state-pull", pattern: /\b(terraform|tofu)\s+state\s+pull\b|\bstate pull\b/i, evidence: "State pull evidence was detected." },
    { signal: "drift-scan", pattern: /driftctl\s+scan|drift scan|scan drift/i, evidence: "Drift scan evidence was detected." }
  ], "refresh");
}

function iacDriftPlanSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["planSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "plan", pattern: /\b(terraform|tofu)\s+plan\b/i, evidence: "Terraform/OpenTofu plan evidence was detected." },
    { signal: "detailed-exitcode", pattern: /-detailed-exitcode|detailed exitcode/i, evidence: "Detailed exit code evidence was detected." },
    { signal: "out-plan", pattern: /-out[=\s]|\.tfplan|show\s+-json/i, evidence: "Plan file or JSON export evidence was detected." },
    { signal: "pulumi-preview", pattern: /pulumi\s+preview|--expect-no-changes|--diff/i, evidence: "Pulumi preview evidence was detected." },
    { signal: "terragrunt-plan", pattern: /terragrunt\s+(run-all\s+plan|plan-all|plan)/i, evidence: "Terragrunt plan evidence was detected." },
    { signal: "cost-diff", pattern: /infracost\s+diff|cost diff|cost estimate/i, evidence: "Cost diff evidence was detected." }
  ], "plan");
}

function iacDriftDriftSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["driftSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "changed", pattern: /\bchanged\b|change detected|will be updated/i, evidence: "Changed-resource drift evidence was detected." },
    { signal: "missing", pattern: /\bmissing\b|not found|deleted outside/i, evidence: "Missing-resource drift evidence was detected." },
    { signal: "unmanaged", pattern: /\bunmanaged\b|not managed|outside state/i, evidence: "Unmanaged-resource drift evidence was detected." },
    { signal: "drift", pattern: /\bdrift\b|drifted/i, evidence: "Drift term evidence was detected." },
    { signal: "ignore-rules", pattern: /\.driftignore|ignore-rules|ignore rules|ignored/i, evidence: "Drift ignore rule evidence was detected." },
    { signal: "exit-code", pattern: /exit code\s*2|exit-code|detailed-exitcode|return code/i, evidence: "Exit-code handling evidence was detected." },
    { signal: "summary", pattern: /drift summary|summary:|scan summary|plan summary/i, evidence: "Drift summary evidence was detected." }
  ], "drift");
}

function iacDriftRemediationSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["remediationSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "import", pattern: /terraform\s+import|tofu\s+import|(^|\n)\s*import\s*\{/i, evidence: "Terraform/OpenTofu import evidence was detected." },
    { signal: "state-rm", pattern: /\b(terraform|tofu)\s+state\s+rm\b|\bstate rm\b/i, evidence: "State rm remediation evidence was detected." },
    { signal: "state-mv", pattern: /\b(terraform|tofu)\s+state\s+mv\b|\bstate mv\b/i, evidence: "State mv remediation evidence was detected." },
    { signal: "pulumi-import", pattern: /pulumi\s+import/i, evidence: "Pulumi import evidence was detected." },
    { signal: "apply-gated", pattern: /apply gated|manual approval|environment protection|approval before apply/i, evidence: "Apply gate evidence was detected." },
    { signal: "manual-review", pattern: /manual review|human review|review drift|approve drift/i, evidence: "Manual review evidence was detected." }
  ], "remediation");
}

function iacDriftOutputSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["outputSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "json", pattern: /--output\s+json|show\s+-json|\.json\b|json output/i, evidence: "JSON output evidence was detected." },
    { signal: "sarif", pattern: /\.sarif\b|sarif/i, evidence: "SARIF output evidence was detected." },
    { signal: "markdown", pattern: /\.md\b|markdown/i, evidence: "Markdown output evidence was detected." },
    { signal: "html", pattern: /\.html\b|html report/i, evidence: "HTML output evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact upload|actions\/upload-artifact/i, evidence: "Artifact upload evidence was detected." }
  ], "output");
}

function iacDriftCiSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["ciSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "scheduled-run", pattern: /schedule:|cron:|scheduled drift/i, evidence: "Scheduled run evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|merge_request|pr comment|pull request/i, evidence: "Pull request evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact upload|actions\/upload-artifact/i, evidence: "Artifact upload evidence was detected." }
  ], "ci");
}

function iacDriftPackageSignals(sourceFiles: IacDriftSourceFile[]): IacDriftReadinessReport["packageSignals"] {
  return iacDriftSignalFromSpecs(sourceFiles, [
    { signal: "driftctl", pattern: /driftctl/i, evidence: "driftctl package or command evidence was detected." },
    { signal: "terraform", pattern: /terraform/i, evidence: "Terraform package or command evidence was detected." },
    { signal: "opentofu", pattern: /opentofu|tofu\s+/i, evidence: "OpenTofu package or command evidence was detected." },
    { signal: "pulumi", pattern: /pulumi/i, evidence: "Pulumi package or command evidence was detected." },
    { signal: "terragrunt", pattern: /terragrunt/i, evidence: "Terragrunt package or command evidence was detected." },
    { signal: "infracost", pattern: /infracost/i, evidence: "Infracost package or command evidence was detected." }
  ], "package");
}

function iacDriftSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: IacDriftSourceFile[],
  specs: T,
  label: string
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/iac-drift-readiness.html"
    };
  });
}

export async function buildDeploymentReadinessReport(walk: WalkResult): Promise<DeploymentReadinessReport> {
  const sourceFiles = await deploymentSourceFiles(walk);
  const deploymentSetups = deploymentSetupFiles(sourceFiles);
  const chartSignals = deploymentChartSignals(sourceFiles);
  const templateSignals = deploymentTemplateSignals(sourceFiles);
  const valueSignals = deploymentValueSignals(sourceFiles);
  const releaseSignals = deploymentReleaseSignals(sourceFiles);
  const safetySignals = deploymentSafetySignals(sourceFiles);
  const packageSignals = deploymentPackageSignals(sourceFiles);

  const hasChart = deploymentSetups.length > 0 || chartSignals.some((item) => ["chart-yaml", "values-yaml"].includes(item.signal) && item.readiness === "ready");
  const hasTemplates = templateSignals.some((item) => item.readiness === "ready") || deploymentSetups.some((item) => item.templateCount > 0 || item.manifestCount > 0);
  const hasReleaseWorkflow = releaseSignals.some((item) => ["lint-command", "template-command", "install-command", "upgrade-command"].includes(item.signal) && item.readiness === "ready");
  const hasSafety = safetySignals.some((item) => ["dry-run", "wait", "rollback-on-failure", "namespace", "kube-context"].includes(item.signal) && item.readiness === "ready");
  const hasValues = valueSignals.some((item) => item.readiness === "ready") || deploymentSetups.some((item) => item.valuesCount > 0);

  const riskQueue: DeploymentReadinessReport["riskQueue"] = [];
  if (!hasChart) {
    riskQueue.push({
      priority: "high",
      action: "Add a deployment inventory if this project ships Kubernetes resources.",
      why: "Helm-style review starts from Chart.yaml, values.yaml, templates, and release workflow ownership.",
      relatedHref: "html/deployment-readiness.html"
    });
  }
  if (hasChart && !hasTemplates) {
    riskQueue.push({
      priority: "medium",
      action: "Document rendered manifest templates or Kubernetes YAML entrypoints.",
      why: "Reviewers need to inspect what Kubernetes resources are rendered before trusting install or upgrade commands.",
      relatedHref: "html/deployment-readiness.html"
    });
  }
  if (hasChart && !hasValues) {
    riskQueue.push({
      priority: "medium",
      action: "Record values files, override flags, and schema validation policy.",
      why: "Helm releases are often controlled by values overrides; missing value ownership hides runtime differences.",
      relatedHref: "html/deployment-readiness.html"
    });
  }
  if (hasChart && !hasReleaseWorkflow) {
    riskQueue.push({
      priority: "medium",
      action: "Record lint, template, install, and upgrade review commands.",
      why: "A release path without dry render and upgrade checks is difficult to review safely.",
      relatedHref: "html/deployment-readiness.html"
    });
  }
  if (hasChart && !hasSafety) {
    riskQueue.push({
      priority: "low",
      action: "Add safe release flags such as dry-run, wait, rollback-on-failure, namespace, or kube-context guidance.",
      why: "Operational flags define whether a Helm command renders locally, waits for readiness, rolls back, or targets the intended cluster.",
      relatedHref: "html/deployment-readiness.html"
    });
  }

  return {
    summary: `Helm-style deployment readiness report: setup ${deploymentSetups.length}개, chart signal ${chartSignals.length}개, template signal ${templateSignals.length}개, release signal ${releaseSignals.length}개, safety signal ${safetySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Helm Chart.yaml values.yaml templates helm lint template install upgrade rollback dependency package repo test",
    deploymentSetups,
    chartSignals,
    templateSignals,
    valueSignals,
    releaseSignals,
    safetySignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "helm lint <chart-dir>", purpose: "Check chart metadata, values, templates, and dependency structure without installing." },
      { command: "helm template <release> <chart-dir> --debug", purpose: "Render Kubernetes manifests for review before contacting a cluster." },
      { command: "helm install <release> <chart-dir> --dry-run --debug", purpose: "Preview install behavior with release naming and values resolution." },
      { command: "helm upgrade <release> <chart-dir> --install --wait --rollback-on-failure", purpose: "Review the intended safe upgrade posture before live release." }
    ],
    learnerNextSteps: [
      "Open Deployment Readiness and identify Chart.yaml plus values.yaml first.",
      "Read template and Kubernetes manifest signals before trusting release commands.",
      "Compare values override and schema signals to understand how environments differ.",
      "Review dry-run, wait, rollback, namespace, and kube-context signals before any live deployment."
    ]
  };
}

type DeploymentSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function deploymentSourceFiles(walk: WalkResult): Promise<DeploymentSourceFile[]> {
  const files: DeploymentSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !deploymentInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!deploymentPathSignal(file.relPath) && !deploymentContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function deploymentInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return deploymentPathSignal(filePath)
    || /(^|\/)(README|docs?|deploy|deployment|k8s|kubernetes|helm|charts?|manifests?|overlays?|base|ci|workflows?|scripts?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base);
}

function deploymentPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(Chart\.yaml|values\.ya?ml|Chart\.lock|\.helmignore|values\.schema\.json|kustomization\.ya?ml)$/i.test(base)
    || /(^|\/)(templates|charts|crds|manifests|k8s|kubernetes|helm|deploy|deployment|overlays|base)(\/|$)/i.test(filePath)
    || /\.(ya?ml|tpl)$/i.test(filePath) && /(^|\/)(deploy|deployment|k8s|kubernetes|helm|charts?|manifests?)(\/|$)/i.test(filePath);
}

function deploymentContentSignal(text: string): boolean {
  return /(Helm|helm\s+(lint|template|install|upgrade|rollback|uninstall|test|status|history|dependency|package|repo)|apiVersion:\s*v[12]|apiVersion:\s+apps\/v1|kind:\s+(Deployment|Service|Ingress|ConfigMap|Secret|ServiceAccount|HorizontalPodAutoscaler|Job|CronJob)|Chart\.yaml|values\.yaml|\.Values|helm\.sh\/hook|argocd|kustomize|kubectl apply|flux\s+reconcile)/i.test(text);
}

function deploymentSetupFiles(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["deploymentSetups"] {
  const rows: DeploymentReadinessReport["deploymentSetups"] = [];
  for (const source of sourceFiles) {
    const chartMetadataCount = countMatches(source.text, /(^|\n)\s*(apiVersion|name|version|appVersion|type):/g) + (path.basename(source.filePath).toLowerCase() === "chart.yaml" ? 1 : 0);
    const valuesCount = countMatches(source.text, /(^|\n)\s*values:|\.Values|--values\b|-f\s+|--set\b|--set-string\b|--set-file\b|--set-json\b/g) + (/values\.ya?ml$/i.test(source.filePath) ? 1 : 0);
    const templateCount = countMatches(source.text, /\{\{[^}]+(\.Values|include|tpl|define|template|toYaml|nindent)/g) + (/\/templates\//i.test(source.filePath) ? 1 : 0);
    const manifestCount = countMatches(source.text, /(^|\n)\s*kind:\s*(Deployment|Service|Ingress|ConfigMap|Secret|ServiceAccount|HorizontalPodAutoscaler|Job|CronJob|StatefulSet|DaemonSet)\b/g);
    const dependencyCount = countMatches(source.text, /(^|\n)\s*dependencies:|Chart\.lock|helm\s+dependency|(^|\/)charts\//g);
    const hookCount = countMatches(source.text, /helm\.sh\/hook|pre-install|post-install|pre-upgrade|post-upgrade|pre-delete|post-delete|test-success|test-failure/g);
    const releaseWorkflowCount = countMatches(source.text, /\bhelm\s+(lint|template|install|upgrade|rollback|uninstall|test|status|history|dependency|package|repo)\b/g);
    const totalSignals = chartMetadataCount + valuesCount + templateCount + manifestCount + dependencyCount + hookCount + releaseWorkflowCount;
    if (totalSignals === 0 && !deploymentPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: deploymentTool(source),
      chartMetadataCount,
      valuesCount,
      templateCount,
      manifestCount,
      dependencyCount,
      hookCount,
      releaseWorkflowCount,
      readiness: totalSignals >= 5 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} Helm/Kubernetes deployment signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.chartMetadataCount + b.templateCount + b.manifestCount + b.releaseWorkflowCount;
    const aScore = a.chartMetadataCount + a.templateCount + a.manifestCount + a.releaseWorkflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 50);
}

function deploymentTool(source: DeploymentSourceFile): DeploymentReadinessReport["deploymentSetups"][number]["tool"] {
  if (/argocd|argoproj\.io|ApplicationSet/i.test(source.filePath) || /argocd|argoproj\.io|ApplicationSet/i.test(source.text)) return "argo-cd";
  if (/flux|GitRepository|Kustomization|HelmRelease/i.test(source.filePath) || /fluxcd|HelmRelease|GitRepository/i.test(source.text)) return "flux";
  if (/skaffold/i.test(source.filePath) || /skaffold/i.test(source.text)) return "skaffold";
  if (/kustomization\.ya?ml|kustomize/i.test(source.filePath) || /kustomize/i.test(source.text)) return "kustomize";
  if (/Chart\.yaml|values\.ya?ml|\/templates\/|helm\s+(lint|template|install|upgrade|rollback|uninstall|test|status|history|dependency|package|repo)/i.test(source.filePath) || /Helm|helm\s+(lint|template|install|upgrade|rollback|uninstall|test|status|history|dependency|package|repo)|\.Values/i.test(source.text)) return "helm";
  if (/kubectl/i.test(source.filePath) || /kubectl\s+(apply|diff|rollout|delete)/i.test(source.text)) return "kubectl";
  if (/kind:\s+(Deployment|Service|Ingress|ConfigMap|Secret|ServiceAccount|HorizontalPodAutoscaler|Job|CronJob)/i.test(source.text)) return "kubernetes";
  return "unknown";
}

function deploymentChartSignals(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["chartSignals"] {
  const specs: Array<{ signal: DeploymentReadinessReport["chartSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chart-yaml", pattern: /(^|\/)Chart\.yaml$/i, evidence: "Chart.yaml metadata file evidence was detected." },
    { signal: "api-version", pattern: /(^|\n)\s*apiVersion:\s*v[12]\b/i, evidence: "chart apiVersion evidence was detected." },
    { signal: "chart-name", pattern: /(^|\n)\s*name:\s*[-A-Za-z0-9_.]+/i, evidence: "chart name evidence was detected." },
    { signal: "chart-version", pattern: /(^|\n)\s*version:\s*['"]?[0-9]/i, evidence: "chart version evidence was detected." },
    { signal: "app-version", pattern: /(^|\n)\s*appVersion:/i, evidence: "appVersion evidence was detected." },
    { signal: "chart-type", pattern: /(^|\n)\s*type:\s*(application|library)/i, evidence: "chart type evidence was detected." },
    { signal: "dependencies", pattern: /(^|\n)\s*dependencies:/i, evidence: "chart dependencies evidence was detected." },
    { signal: "chart-lock", pattern: /(^|\/)Chart\.lock$/i, evidence: "Chart.lock evidence was detected." },
    { signal: "helmignore", pattern: /(^|\/)\.helmignore$/i, evidence: ".helmignore evidence was detected." },
    { signal: "values-yaml", pattern: /(^|\/)values\.ya?ml$/i, evidence: "values.yaml evidence was detected." },
    { signal: "values-schema", pattern: /(^|\/)values\.schema\.json$/i, evidence: "values schema evidence was detected." }
  ];
  return deploymentSignalFromSpecs(sourceFiles, specs, "chart", "signal");
}

function deploymentTemplateSignals(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["templateSignals"] {
  const specs: Array<{ signal: DeploymentReadinessReport["templateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "deployment", pattern: /kind:\s*Deployment\b/i, evidence: "Deployment manifest evidence was detected." },
    { signal: "service", pattern: /kind:\s*Service\b/i, evidence: "Service manifest evidence was detected." },
    { signal: "ingress", pattern: /kind:\s*Ingress\b/i, evidence: "Ingress manifest evidence was detected." },
    { signal: "configmap", pattern: /kind:\s*ConfigMap\b/i, evidence: "ConfigMap manifest evidence was detected." },
    { signal: "secret", pattern: /kind:\s*Secret\b/i, evidence: "Secret manifest evidence was detected." },
    { signal: "serviceaccount", pattern: /kind:\s*ServiceAccount\b/i, evidence: "ServiceAccount manifest evidence was detected." },
    { signal: "hpa", pattern: /kind:\s*HorizontalPodAutoscaler\b|autoscaling\/v[0-9]/i, evidence: "HPA manifest evidence was detected." },
    { signal: "notes", pattern: /templates\/NOTES\.txt|NOTES\.txt/i, evidence: "NOTES template evidence was detected." },
    { signal: "helpers", pattern: /templates\/_helpers\.tpl|{{-?\s*define\s+"/i, evidence: "helper template evidence was detected." },
    { signal: "crd", pattern: /(^|\/)crds\/|kind:\s*CustomResourceDefinition\b/i, evidence: "CRD evidence was detected." },
    { signal: "hooks", pattern: /helm\.sh\/hook|pre-install|post-install|pre-upgrade|post-upgrade/i, evidence: "Helm hook evidence was detected." },
    { signal: "tests", pattern: /helm\.sh\/hook:\s*test|helm\.sh\/hook:\s*test-success|helm\s+test\b/i, evidence: "Helm test hook or command evidence was detected." }
  ];
  return deploymentSignalFromSpecs(sourceFiles, specs, "template", "signal");
}

function deploymentValueSignals(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["valueSignals"] {
  const specs: Array<{ signal: DeploymentReadinessReport["valueSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "values-file", pattern: /(^|\/)values\.ya?ml$/i, evidence: "values file evidence was detected." },
    { signal: "values-override", pattern: /--values\b|-f\s+|override\.ya?ml|values-[A-Za-z0-9_-]+\.ya?ml/i, evidence: "values override evidence was detected." },
    { signal: "set-flag", pattern: /--set\b/i, evidence: "--set evidence was detected." },
    { signal: "set-string-flag", pattern: /--set-string\b/i, evidence: "--set-string evidence was detected." },
    { signal: "set-file-flag", pattern: /--set-file\b/i, evidence: "--set-file evidence was detected." },
    { signal: "set-json-flag", pattern: /--set-json\b/i, evidence: "--set-json evidence was detected." },
    { signal: "schema-validation", pattern: /values\.schema\.json|JSON Schema|schema validation/i, evidence: "values schema validation evidence was detected." },
    { signal: "global-values", pattern: /(^|\n)\s*global:|\.Values\.global/i, evidence: "global values evidence was detected." }
  ];
  return deploymentSignalFromSpecs(sourceFiles, specs, "value", "signal");
}

function deploymentReleaseSignals(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["releaseSignals"] {
  const specs: Array<{ signal: DeploymentReadinessReport["releaseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "lint-command", pattern: /\bhelm\s+lint\b/i, evidence: "helm lint evidence was detected." },
    { signal: "template-command", pattern: /\bhelm\s+template\b/i, evidence: "helm template evidence was detected." },
    { signal: "install-command", pattern: /\bhelm\s+install\b/i, evidence: "helm install evidence was detected." },
    { signal: "upgrade-command", pattern: /\bhelm\s+upgrade\b/i, evidence: "helm upgrade evidence was detected." },
    { signal: "rollback-command", pattern: /\bhelm\s+rollback\b/i, evidence: "helm rollback evidence was detected." },
    { signal: "uninstall-command", pattern: /\bhelm\s+uninstall\b/i, evidence: "helm uninstall evidence was detected." },
    { signal: "test-command", pattern: /\bhelm\s+test\b/i, evidence: "helm test evidence was detected." },
    { signal: "status-command", pattern: /\bhelm\s+status\b/i, evidence: "helm status evidence was detected." },
    { signal: "history-command", pattern: /\bhelm\s+history\b/i, evidence: "helm history evidence was detected." },
    { signal: "dependency-command", pattern: /\bhelm\s+dependency\b/i, evidence: "helm dependency evidence was detected." },
    { signal: "package-command", pattern: /\bhelm\s+package\b/i, evidence: "helm package evidence was detected." },
    { signal: "repo-command", pattern: /\bhelm\s+repo\b/i, evidence: "helm repo evidence was detected." }
  ];
  return deploymentSignalFromSpecs(sourceFiles, specs, "release", "signal");
}

function deploymentSafetySignals(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["safetySignals"] {
  const specs: Array<{ signal: DeploymentReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dry-run", pattern: /--dry-run\b|helm\s+template\b/i, evidence: "dry-run or template-render evidence was detected." },
    { signal: "wait", pattern: /--wait\b/i, evidence: "--wait evidence was detected." },
    { signal: "rollback-on-failure", pattern: /--rollback-on-failure\b|--atomic\b/i, evidence: "rollback-on-failure evidence was detected." },
    { signal: "no-hooks", pattern: /--no-hooks\b/i, evidence: "--no-hooks evidence was detected." },
    { signal: "skip-crds", pattern: /--skip-crds\b/i, evidence: "--skip-crds evidence was detected." },
    { signal: "disable-openapi-validation", pattern: /--disable-openapi-validation\b/i, evidence: "OpenAPI validation override evidence was detected." },
    { signal: "namespace", pattern: /--namespace\b|-n\s+|metadata:\s*\n\s*namespace:/i, evidence: "namespace targeting evidence was detected." },
    { signal: "kube-context", pattern: /--kube-context\b|KUBECONFIG/i, evidence: "cluster context evidence was detected." },
    { signal: "create-namespace", pattern: /--create-namespace\b/i, evidence: "create namespace evidence was detected." }
  ];
  return deploymentSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function deploymentPackageSignals(sourceFiles: DeploymentSourceFile[]): DeploymentReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DeploymentReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "helm", pattern: /Helm|helm\s+(lint|template|install|upgrade|rollback|dependency|package|repo)|Chart\.yaml|values\.yaml/i, evidence: "Helm evidence was detected." },
    { signal: "kustomize", pattern: /kustomize|kustomization\.ya?ml/i, evidence: "Kustomize evidence was detected." },
    { signal: "kubectl", pattern: /kubectl\s+(apply|diff|rollout|delete|kustomize)/i, evidence: "kubectl evidence was detected." },
    { signal: "argo-cd", pattern: /argocd|argoproj\.io|ApplicationSet/i, evidence: "Argo CD evidence was detected." },
    { signal: "flux", pattern: /fluxcd|flux\s+(reconcile|bootstrap)|HelmRelease|GitRepository/i, evidence: "Flux evidence was detected." },
    { signal: "skaffold", pattern: /skaffold/i, evidence: "Skaffold evidence was detected." },
    { signal: "chart-releaser", pattern: /chart-releaser|cr\s+upload|cr\s+index/i, evidence: "chart-releaser evidence was detected." }
  ];
  return deploymentSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function deploymentSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DeploymentSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/deployment-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildServerlessReadinessReport(walk: WalkResult): Promise<ServerlessReadinessReport> {
  const sourceFiles = await serverlessSourceFiles(walk);
  const serverlessSetups = serverlessSetupFiles(sourceFiles);
  const configSignals = serverlessConfigSignals(sourceFiles);
  const functionSignals = serverlessFunctionSignals(sourceFiles);
  const eventSignals = serverlessEventSignals(sourceFiles);
  const runtimeSignals = serverlessRuntimeSignals(sourceFiles);
  const deploymentSignals = serverlessDeploymentSignals(sourceFiles);
  const safetySignals = serverlessSafetySignals(sourceFiles);
  const packageSignals = serverlessPackageSignals(sourceFiles);

  const hasConfig = serverlessSetups.length > 0 || configSignals.some((item) => item.readiness === "ready");
  const hasFunctions = functionSignals.some((item) => item.readiness === "ready") || serverlessSetups.some((item) => item.functionCount > 0);
  const hasEvents = eventSignals.some((item) => item.readiness === "ready") || serverlessSetups.some((item) => item.eventCount > 0);
  const hasDeploy = deploymentSignals.some((item) => item.signal === "deploy" && item.readiness === "ready") || serverlessSetups.some((item) => item.commandCount > 0);
  const hasSafety = safetySignals.some((item) => ["iam-role-statements", "least-privilege", "secrets", "log-retention", "tracing"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: ServerlessReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a serverless service inventory if this project owns functions or event triggers.",
      why: "Serverless Framework-style review starts from serverless.yml, provider/runtime/stage, functions, events, resources, and plugins.",
      relatedHref: "html/serverless-readiness.html"
    });
  }
  if (hasConfig && !hasFunctions) {
    riskQueue.push({
      priority: "high",
      action: "Document every deployed function handler and its runtime settings.",
      why: "A serverless service without visible handlers, memory, timeout, and runtime ownership is hard to test or operate.",
      relatedHref: "html/serverless-readiness.html"
    });
  }
  if (hasConfig && !hasEvents) {
    riskQueue.push({
      priority: "medium",
      action: "Record HTTP, schedule, queue, stream, storage, or websocket event triggers.",
      why: "Learners need trigger evidence to understand how functions are invoked and what external systems call them.",
      relatedHref: "html/serverless-readiness.html"
    });
  }
  if (hasConfig && !hasDeploy) {
    riskQueue.push({
      priority: "medium",
      action: "Add repeatable deploy, package, invoke, info, logs, or offline commands.",
      why: "Serverless deployments are operational workflows; commands make the service reproducible without guessing.",
      relatedHref: "html/serverless-readiness.html"
    });
  }
  if (hasConfig && !hasSafety) {
    riskQueue.push({
      priority: "low",
      action: "Document IAM, secrets, log retention, tracing, rollback, and pruning guardrails.",
      why: "Least privilege, secrets boundaries, observability, and cleanup controls keep short-lived functions maintainable.",
      relatedHref: "html/serverless-readiness.html"
    });
  }

  return {
    summary: `Serverless Framework-style serverless readiness report: setup ${serverlessSetups.length}개, config signal ${configSignals.length}개, function signal ${functionSignals.length}개, event signal ${eventSignals.length}개, deployment signal ${deploymentSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Serverless Framework serverless.yml service provider runtime stage region functions handler events httpApi schedule sqs sns resources package plugins deploy invoke offline logs",
    serverlessSetups,
    configSignals,
    functionSignals,
    eventSignals,
    runtimeSignals,
    deploymentSignals,
    safetySignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "serverless print --stage <stage>", purpose: "Resolve variables and inspect the final service configuration without deploying." },
      { command: "serverless package --stage <stage>", purpose: "Build CloudFormation and function artifacts for review before deploy." },
      { command: "serverless deploy --stage <stage> --verbose", purpose: "Deploy the full service when configuration, resources, or events changed." },
      { command: "serverless invoke local -f <function>", purpose: "Exercise a function handler locally with controlled event payloads." },
      { command: "serverless logs -f <function> --stage <stage> --tail", purpose: "Inspect function logs after a deployed smoke test." }
    ],
    learnerNextSteps: [
      "Open Serverless Readiness and identify the serverless service file first.",
      "Confirm provider, runtime, stage, region, and variable resolution before reading functions.",
      "Map each function handler to its event triggers and cloud resources.",
      "Review IAM, secrets, packaging, offline, and logging signals before trusting a deploy path."
    ]
  };
}

type ServerlessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function serverlessSourceFiles(walk: WalkResult): Promise<ServerlessSourceFile[]> {
  const files: ServerlessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !serverlessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!serverlessPathSignal(file.relPath) && !serverlessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function serverlessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return serverlessPathSignal(filePath)
    || /(^|\/)(README|docs?|serverless|lambda|functions?|handlers?|events?|infra|infrastructure|deploy|deployment|scripts?|ci|workflows?|cloudflare|workers?|netlify|vercel|sst)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|template\.ya?ml|samconfig\.toml)$/i.test(base);
}

function serverlessPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^serverless\.(ya?ml|json|[cm]?[jt]s)$/i.test(base)
    || /^sst\.config\.[cm]?[jt]s$/i.test(base)
    || /^template\.ya?ml$/i.test(base)
    || /^vercel\.json$/i.test(base)
    || /^netlify\.toml$/i.test(base)
    || /^wrangler\.toml$/i.test(base)
    || /(^|\/)(serverless|lambda|functions|netlify\/functions|api|workers|cloudflare|sst)(\/|$)/i.test(filePath);
}

function serverlessContentSignal(text: string): boolean {
  return /(Serverless Framework|serverless\.ya?ml|serverless\s+(print|package|deploy|deploy function|invoke|invoke local|info|logs|remove|offline)|\bsls\s+(print|package|deploy|invoke|info|logs|remove)|(^|\n)\s*service\s*:|(^|\n)\s*functions\s*:|(^|\n)\s*provider\s*:|(^|\n)\s*events\s*:|httpApi\s*:|schedule\s*:|serverless-offline|AWS::Lambda::Function|AWS::ApiGateway|AWS::DynamoDB|sst\.config|netlify functions|vercel functions|wrangler deploy)/im.test(text);
}

function serverlessSetupFiles(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["serverlessSetups"] {
  const rows: ServerlessReadinessReport["serverlessSetups"] = [];
  for (const source of sourceFiles) {
    const serviceCount = countMatches(source.text, /(^|\n)\s*service\s*:|service\s*=/gi) + (/serverless\.(ya?ml|json|[cm]?[jt]s)$/i.test(source.filePath) ? 1 : 0);
    const providerCount = countMatches(source.text, /(^|\n)\s*provider\s*:|name:\s*(aws|azure|google|cloudflare)|runtime:\s*|region:\s*|stage:\s*/gi);
    const functionCount = countMatches(source.text, /(^|\n)\s*functions\s*:|(^|\n)\s{2,}[A-Za-z0-9_-]+\s*:\s*\n\s{4,}handler\s*:|handler:\s*|AWS::Lambda::Function/gi);
    const eventCount = countMatches(source.text, /(^|\n)\s*events\s*:|httpApi\s*:|http\s*:|schedule\s*:|eventBridge\s*:|sqs\s*:|sns\s*:|s3\s*:|stream\s*:|websocket\s*:|alb\s*:/gi);
    const environmentCount = countMatches(source.text, /(^|\n)\s*environment\s*:|\$\{env:|\.env|secrets?|SSM|Secrets Manager/gi);
    const iamCount = countMatches(source.text, /(^|\n)\s*iam\s*:|iamRoleStatements|role\s*:|Effect:\s*Allow|Action:\s*|Resource:\s*|least privilege/gi);
    const resourceCount = countMatches(source.text, /(^|\n)\s*resources\s*:|AWS::[A-Za-z0-9:]+|CloudFormation|Fn::GetAtt|!GetAtt|!Ref/gi);
    const packageCount = countMatches(source.text, /(^|\n)\s*package\s*:|patterns\s*:|artifact\s*:|individually\s*:|excludeDevDependencies|serverless\s+package/gi);
    const pluginCount = countMatches(source.text, /(^|\n)\s*plugins\s*:|serverless-offline|serverless-esbuild|serverless-webpack|serverless-prune-plugin|serverless-domain-manager/gi);
    const commandCount = countMatches(source.text, /\b(serverless|sls)\s+(print|package|deploy|deploy function|invoke|invoke local|info|logs|remove|offline|doctor)\b/gi);
    const totalSignals = serviceCount + providerCount + functionCount + eventCount + environmentCount + iamCount + resourceCount + packageCount + pluginCount + commandCount;
    if (totalSignals === 0 && !serverlessPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: serverlessFramework(source),
      serviceCount,
      providerCount,
      functionCount,
      eventCount,
      environmentCount,
      iamCount,
      resourceCount,
      packageCount,
      pluginCount,
      commandCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} serverless service signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.serviceCount + b.functionCount + b.eventCount + b.commandCount;
    const aScore = a.serviceCount + a.functionCount + a.eventCount + a.commandCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 50);
}

function serverlessFramework(source: ServerlessSourceFile): ServerlessReadinessReport["serverlessSetups"][number]["framework"] {
  if (/serverless\.(ya?ml|json|[cm]?[jt]s)$/i.test(source.filePath) || /Serverless Framework|serverless\s+(print|package|deploy|invoke|info|logs|remove)|"serverless"/i.test(source.text)) return "serverless-framework";
  if (/template\.ya?ml|samconfig\.toml|AWS::Serverless::Function|sam\s+(build|deploy|package)/i.test(source.filePath) || /AWS::Serverless::Function|sam\s+(build|deploy|package)/i.test(source.text)) return "aws-sam";
  if (/sst\.config/i.test(source.filePath) || /\bsst\s+(deploy|dev|build)|from ["']sst/i.test(source.text)) return "sst";
  if (/vercel\.json|\/api\//i.test(source.filePath) || /vercel functions|@vercel\/node|vc\s+deploy/i.test(source.text)) return "vercel-functions";
  if (/netlify\.toml|netlify\/functions/i.test(source.filePath) || /netlify functions|netlify deploy/i.test(source.text)) return "netlify-functions";
  if (/wrangler\.toml|cloudflare|workers?/i.test(source.filePath) || /wrangler\s+deploy|cloudflare workers/i.test(source.text)) return "cloudflare-workers";
  return "unknown";
}

function serverlessConfigSignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["configSignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "serverless-yml", pattern: /(^|\/)serverless\.(ya?ml|json|[cm]?[jt]s)$/i, evidence: "Serverless service configuration file evidence was detected." },
    { signal: "service", pattern: /(^|\n)\s*service\s*:/i, evidence: "service declaration evidence was detected." },
    { signal: "framework-version", pattern: /frameworkVersion\s*:/i, evidence: "frameworkVersion evidence was detected." },
    { signal: "provider", pattern: /(^|\n)\s*provider\s*:/i, evidence: "provider block evidence was detected." },
    { signal: "runtime", pattern: /runtime\s*:\s*(nodejs|python|go|java|dotnet|ruby)/i, evidence: "runtime evidence was detected." },
    { signal: "stage", pattern: /stage\s*:|\$\{sls:stage\}|\$\{opt:stage/i, evidence: "stage evidence was detected." },
    { signal: "region", pattern: /region\s*:|\$\{aws:region\}|\$\{opt:region/i, evidence: "region evidence was detected." },
    { signal: "custom", pattern: /(^|\n)\s*custom\s*:/i, evidence: "custom configuration evidence was detected." },
    { signal: "params", pattern: /(^|\n)\s*params\s*:/i, evidence: "params evidence was detected." },
    { signal: "variables", pattern: /\$\{(self|env|opt|sls|aws|param|file|ssm|cf):/i, evidence: "variable resolver evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function serverlessFunctionSignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["functionSignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["functionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "functions", pattern: /(^|\n)\s*functions\s*:/i, evidence: "functions block evidence was detected." },
    { signal: "handler", pattern: /handler\s*:/i, evidence: "handler evidence was detected." },
    { signal: "timeout", pattern: /timeout\s*:/i, evidence: "timeout evidence was detected." },
    { signal: "memory-size", pattern: /memorySize\s*:/i, evidence: "memorySize evidence was detected." },
    { signal: "layers", pattern: /layers\s*:|AWS::Lambda::LayerVersion/i, evidence: "Lambda layer evidence was detected." },
    { signal: "url", pattern: /url\s*:\s*(true|\{)|FunctionUrlConfig/i, evidence: "function URL evidence was detected." },
    { signal: "reserved-concurrency", pattern: /reservedConcurrency\s*:/i, evidence: "reserved concurrency evidence was detected." },
    { signal: "provisioned-concurrency", pattern: /provisionedConcurrency\s*:/i, evidence: "provisioned concurrency evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "function", "signal");
}

function serverlessEventSignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["eventSignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["eventSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "http", pattern: /-\s*http\s*:|http:\s*\{?|apiGateway/i, evidence: "HTTP API Gateway event evidence was detected." },
    { signal: "http-api", pattern: /httpApi\s*:/i, evidence: "HTTP API event evidence was detected." },
    { signal: "schedule", pattern: /schedule\s*:|rate\(|cron\(/i, evidence: "scheduled event evidence was detected." },
    { signal: "event-bridge", pattern: /eventBridge\s*:|EventBridge|AWS::Events::Rule/i, evidence: "EventBridge evidence was detected." },
    { signal: "sqs", pattern: /sqs\s*:|AWS::SQS::Queue/i, evidence: "SQS event evidence was detected." },
    { signal: "sns", pattern: /sns\s*:|AWS::SNS::Topic/i, evidence: "SNS event evidence was detected." },
    { signal: "s3", pattern: /s3\s*:|AWS::S3::Bucket/i, evidence: "S3 event evidence was detected." },
    { signal: "stream", pattern: /stream\s*:|dynamodb\s*:|kinesis\s*:|AWS::DynamoDB::Stream/i, evidence: "stream event evidence was detected." },
    { signal: "websocket", pattern: /websocket\s*:|websocketsApi|WebSocket/i, evidence: "websocket event evidence was detected." },
    { signal: "alb", pattern: /alb\s*:|ApplicationLoadBalancer|AWS::ElasticLoadBalancingV2/i, evidence: "ALB event evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "event", "signal");
}

function serverlessRuntimeSignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nodejs", pattern: /runtime\s*:\s*nodejs|nodejs[0-9]/i, evidence: "Node.js runtime evidence was detected." },
    { signal: "python", pattern: /runtime\s*:\s*python|python3\.[0-9]/i, evidence: "Python runtime evidence was detected." },
    { signal: "go", pattern: /runtime\s*:\s*go|provided\.al2/i, evidence: "Go/custom runtime evidence was detected." },
    { signal: "java", pattern: /runtime\s*:\s*java|java[0-9]/i, evidence: "Java runtime evidence was detected." },
    { signal: "dotnet", pattern: /runtime\s*:\s*dotnet|dotnet[0-9]/i, evidence: ".NET runtime evidence was detected." },
    { signal: "ruby", pattern: /runtime\s*:\s*ruby|ruby[0-9]/i, evidence: "Ruby runtime evidence was detected." },
    { signal: "arm64", pattern: /architecture\s*:\s*arm64|arm64/i, evidence: "arm64 architecture evidence was detected." },
    { signal: "x86-64", pattern: /architecture\s*:\s*x86_64|x86_64/i, evidence: "x86_64 architecture evidence was detected." },
    { signal: "ephemeral-storage", pattern: /ephemeralStorageSize\s*:|EphemeralStorage/i, evidence: "ephemeral storage evidence was detected." },
    { signal: "vpc", pattern: /(^|\n)\s*vpc\s*:|securityGroupIds|subnetIds/i, evidence: "VPC evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function serverlessDeploymentSignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["deploymentSignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["deploymentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "deploy", pattern: /\b(serverless|sls)\s+deploy\b/i, evidence: "deploy command evidence was detected." },
    { signal: "deploy-function", pattern: /\b(serverless|sls)\s+deploy\s+function\b/i, evidence: "deploy function command evidence was detected." },
    { signal: "package", pattern: /\b(serverless|sls)\s+package\b/i, evidence: "package command evidence was detected." },
    { signal: "remove", pattern: /\b(serverless|sls)\s+remove\b/i, evidence: "remove command evidence was detected." },
    { signal: "invoke", pattern: /\b(serverless|sls)\s+invoke\b/i, evidence: "invoke command evidence was detected." },
    { signal: "invoke-local", pattern: /\b(serverless|sls)\s+invoke\s+local\b/i, evidence: "invoke local command evidence was detected." },
    { signal: "info", pattern: /\b(serverless|sls)\s+info\b/i, evidence: "info command evidence was detected." },
    { signal: "logs", pattern: /\b(serverless|sls)\s+logs\b/i, evidence: "logs command evidence was detected." },
    { signal: "doctor", pattern: /\b(serverless|sls)\s+doctor\b/i, evidence: "doctor command evidence was detected." },
    { signal: "offline", pattern: /serverless-offline|\b(serverless|sls)\s+offline\b/i, evidence: "offline emulation evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "deployment", "signal");
}

function serverlessSafetySignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "iam-role-statements", pattern: /iamRoleStatements|(^|\n)\s*iam\s*:|Effect:\s*Allow|Action:\s*|Resource:\s*/i, evidence: "IAM policy evidence was detected." },
    { signal: "least-privilege", pattern: /least privilege|Resource:\s*(?!['"]?\*)|Condition:|Fn::GetAtt|!GetAtt/i, evidence: "least-privilege review evidence was detected." },
    { signal: "environment", pattern: /(^|\n)\s*environment\s*:|\$\{env:/i, evidence: "environment variable evidence was detected." },
    { signal: "secrets", pattern: /\$\{(ssm|secretsmanager|env):|Secrets Manager|SSM|licenseKey|Doppler|Vault/i, evidence: "secret resolver evidence was detected." },
    { signal: "deployment-bucket", pattern: /deploymentBucket\s*:|ServerlessDeploymentBucket|bucketName/i, evidence: "deployment bucket evidence was detected." },
    { signal: "rollback", pattern: /rollback|disableRollback|CloudFormation rollback/i, evidence: "rollback policy evidence was detected." },
    { signal: "prune", pattern: /serverless-prune-plugin|prune\s*:/i, evidence: "function version pruning evidence was detected." },
    { signal: "log-retention", pattern: /logRetentionInDays|retentionInDays|LogGroup/i, evidence: "log retention evidence was detected." },
    { signal: "tracing", pattern: /tracing\s*:|xray|X-Ray|AWS::XRay/i, evidence: "tracing evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function serverlessPackageSignals(sourceFiles: ServerlessSourceFile[]): ServerlessReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ServerlessReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "serverless", pattern: /"serverless"|Serverless Framework|serverless\s+(print|package|deploy|invoke|info|logs|remove)/i, evidence: "Serverless Framework package evidence was detected." },
    { signal: "serverless-offline", pattern: /serverless-offline/i, evidence: "serverless-offline evidence was detected." },
    { signal: "serverless-esbuild", pattern: /serverless-esbuild|esbuild\s*:/i, evidence: "serverless-esbuild evidence was detected." },
    { signal: "serverless-webpack", pattern: /serverless-webpack|webpack\s*:/i, evidence: "serverless-webpack evidence was detected." },
    { signal: "serverless-prune-plugin", pattern: /serverless-prune-plugin|prune\s*:/i, evidence: "serverless prune evidence was detected." },
    { signal: "serverless-domain-manager", pattern: /serverless-domain-manager|customDomain/i, evidence: "custom domain manager evidence was detected." },
    { signal: "aws-sam", pattern: /AWS::Serverless::Function|sam\s+(build|deploy|package)|aws-sam-cli/i, evidence: "AWS SAM evidence was detected." },
    { signal: "sst", pattern: /\bsst\s+(deploy|dev|build)|sst\.config|from ["']sst/i, evidence: "SST evidence was detected." },
    { signal: "vercel", pattern: /vercel\.json|vercel\s+deploy|@vercel\/node/i, evidence: "Vercel functions evidence was detected." },
    { signal: "netlify", pattern: /netlify\.toml|netlify functions|netlify deploy/i, evidence: "Netlify functions evidence was detected." },
    { signal: "wrangler", pattern: /wrangler\.toml|wrangler\s+deploy|cloudflare workers/i, evidence: "Wrangler/Cloudflare Workers evidence was detected." }
  ];
  return serverlessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function serverlessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ServerlessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/serverless-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
