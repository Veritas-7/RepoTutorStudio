import path from "node:path";
import type { BackupReadinessReport, GitOpsReadinessReport, KubernetesReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildKubernetesReadinessReport(walk: WalkResult): Promise<KubernetesReadinessReport> {
  const sourceFiles = await kubernetesSourceFiles(walk);
  const kubernetesSetups = kubernetesSetupFiles(sourceFiles);
  const manifestSignals = kubernetesManifestSignals(sourceFiles);
  const workloadSignals = kubernetesWorkloadSignals(sourceFiles);
  const networkSignals = kubernetesNetworkSignals(sourceFiles);
  const configSignals = kubernetesConfigSignals(sourceFiles);
  const storageSignals = kubernetesStorageSignals(sourceFiles);
  const securitySignals = kubernetesSecuritySignals(sourceFiles);
  const healthSignals = kubernetesHealthSignals(sourceFiles);
  const kustomizeSignals = kubernetesKustomizeSignals(sourceFiles);
  const workflowSignals = kubernetesWorkflowSignals(sourceFiles);
  const packageSignals = kubernetesPackageSignals(sourceFiles);

  const hasManifest = kubernetesSetups.length > 0 || manifestSignals.some((item) => item.readiness === "ready");
  const hasWorkload = workloadSignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.workloadCount > 0);
  const hasNetwork = networkSignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.serviceCount > 0);
  const hasConfig = configSignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.configCount > 0);
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.securityCount > 0);
  const hasHealth = healthSignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.probeCount > 0 || item.resourceCount > 0 || item.autoscalingCount > 0);
  const hasKustomize = kustomizeSignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.format === "kustomization");
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || kubernetesSetups.some((item) => item.workflowCount > 0);

  const riskQueue: KubernetesReadinessReport["riskQueue"] = [];
  if (!hasManifest) {
    riskQueue.push({
      priority: "high",
      action: "Add Kubernetes manifest or Kustomize evidence before claiming raw Kubernetes readiness.",
      why: "Kubernetes readiness starts from concrete apiVersion/kind/metadata manifests or a kustomization.yaml that references them.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasWorkload) {
    riskQueue.push({
      priority: "high",
      action: "Document workload objects such as Deployment, StatefulSet, DaemonSet, Job, CronJob, or Pod.",
      why: "A manifest set without workload evidence cannot explain what will run in the cluster.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasNetwork) {
    riskQueue.push({
      priority: "medium",
      action: "Trace Service, Ingress, NetworkPolicy, selector, and port wiring.",
      why: "Learners need network topology to understand how pods are reached and constrained.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasConfig) {
    riskQueue.push({
      priority: "medium",
      action: "Record ConfigMap, Secret reference, env, envFrom, and imagePullSecrets usage.",
      why: "Runtime configuration and secret references are common rebuild blockers even when manifests apply.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasHealth) {
    riskQueue.push({
      priority: "medium",
      action: "Add readiness/liveness/startup probes, resource requests/limits, HPA, or PDB evidence.",
      why: "Health, resources, and scaling controls define whether the workload can be operated safely after apply.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasSecurity) {
    riskQueue.push({
      priority: "low",
      action: "Trace ServiceAccount, RBAC, securityContext, and podSecurityContext before production reuse.",
      why: "Kubernetes manifests often work locally while still over-granting permissions or running with unsafe container defaults.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasKustomize) {
    riskQueue.push({
      priority: "low",
      action: "Consider adding a kustomization.yaml or documenting why raw manifests are applied directly.",
      why: "Kustomize resources, overlays, patches, images, and generators make environment-specific rebuild steps visible.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  if (hasManifest && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add documented kubectl/kustomize commands for diff, dry-run, apply, wait, rollout, logs, describe, port-forward, and delete.",
      why: "Operational commands explain how the manifest set is verified without forcing RepoTutor to touch a cluster.",
      relatedHref: "html/kubernetes-readiness.html"
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

  return {
    summary: `Kubernetes readiness report: setup ${kubernetesSetups.length}개, manifest signal ${manifestSignals.length}개, workload signal ${workloadSignals.length}개, kustomize signal ${kustomizeSignals.length}개, workflow signal ${workflowSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Kubernetes apiVersion kind metadata labels annotations namespace Deployment StatefulSet DaemonSet Service Ingress ConfigMap Secret ServiceAccount Role RoleBinding ClusterRole ClusterRoleBinding NetworkPolicy PersistentVolume PersistentVolumeClaim readinessProbe livenessProbe resources requests limits HorizontalPodAutoscaler PodDisruptionBudget kustomization resources patches kubectl apply diff wait rollout logs describe port-forward delete",
    kubernetesSetups,
    manifestSignals,
    workloadSignals,
    networkSignals,
    configSignals,
    storageSignals,
    securitySignals,
    healthSignals,
    kustomizeSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "kustomize build <overlay>", purpose: "Render the selected overlay locally before touching a cluster." },
      { command: "kubectl diff -k <overlay>", purpose: "Preview server-side object drift for a Kustomize overlay." },
      { command: "kubectl apply --dry-run=server -k <overlay>", purpose: "Ask the API server to validate the rendered objects without persisting them." },
      { command: "kubectl apply -k <overlay>", purpose: "Apply a reviewed Kustomize overlay to the target namespace." },
      { command: "kubectl wait --for=condition=Available deployment/<name> -n <namespace>", purpose: "Block until the main workload reports availability." },
      { command: "kubectl rollout status deployment/<name> -n <namespace>", purpose: "Watch rollout completion for the primary Deployment." },
      { command: "kubectl logs -l app=<label> -n <namespace>", purpose: "Inspect application logs for pods matching the release label." },
      { command: "kubectl describe <kind>/<name> -n <namespace>", purpose: "Inspect events, selector wiring, and controller status for one object." },
      { command: "kubectl port-forward service/<name> 8080:80 -n <namespace>", purpose: "Create a local tunnel to validate service routing manually." },
      { command: "kubectl delete -k <overlay>", purpose: "Remove the same overlay after a disposable validation run." }
    ],
    learnerNextSteps: [
      "Open Kubernetes Readiness and identify the primary manifest or kustomization.yaml first.",
      "Map apiVersion, kind, metadata, labels, annotations, namespaces, and selectors before reading workloads.",
      "Trace Deployment/StatefulSet/DaemonSet/Job/CronJob/Pod, Service, Ingress, and NetworkPolicy together as one topology.",
      "Check ConfigMap, Secret references, env/envFrom, imagePullSecrets, volumes, PVC/PV, ServiceAccount, RBAC, and securityContext before running kubectl.",
      "Review readinessProbe, livenessProbe, startupProbe, resources requests/limits, HorizontalPodAutoscaler, and PodDisruptionBudget for operability.",
      "Use Kustomize resources, bases, patches, generators, images, replacements, and components to understand environment overlays.",
      "Run the recommended kubectl/kustomize commands only in a trusted cluster; RepoTutor records readiness statically and does not contact Kubernetes APIs."
    ]
  };
}

type KubernetesSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function kubernetesSourceFiles(walk: WalkResult): Promise<KubernetesSourceFile[]> {
  const files: KubernetesSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !kubernetesInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!kubernetesPathSignal(file.relPath) && !kubernetesContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function kubernetesInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return kubernetesPathSignal(filePath)
    || /(^|\/)(README|docs?|k8s|kubernetes|manifests?|deploy|deployment|overlays?|base|infra|infrastructure|scripts?|ci|workflows?|dev|prod|staging|test|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|kustomization\.ya?ml)$/i.test(base);
}

function kubernetesPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^kustomization\.ya?ml$/i.test(base)
    || /(^|\/)(k8s|kubernetes|manifests?|deploy|deployment|overlays?|base)\/.*\.(ya?ml|json)$/i.test(filePath)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath)
    || /(^|\/)(deployment|service|ingress|configmap|namespace|rbac|role|rolebinding|serviceaccount|hpa|pdb|networkpolicy|persistentvolume|pvc|pv)[-.].*\.(ya?ml|json)$/i.test(filePath)
    || /^(deployment|service|ingress|configmap|namespace|rbac|role|rolebinding|serviceaccount|hpa|pdb|networkpolicy|persistentvolume|pvc|pv)\.(ya?ml|json)$/i.test(base);
}

function kubernetesContentSignal(text: string): boolean {
  return /(Kubernetes|kubectl\s+(apply|diff|wait|rollout|logs|describe|port-forward|delete|get)|kustomize\s+build|(^|\n)\s*apiVersion\s*:|(^|\n)\s*kind\s*:|(^|\n)\s*metadata\s*:|HorizontalPodAutoscaler|PodDisruptionBudget|NetworkPolicy|ServiceAccount|RoleBinding|ClusterRoleBinding|readinessProbe|livenessProbe|startupProbe|configMapGenerator|secretGenerator|(^|\n)\s*resources\s*:|(^|\n)\s*patches\s*:)/i.test(text);
}

function kubernetesSetupFiles(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["kubernetesSetups"] {
  const rows: KubernetesReadinessReport["kubernetesSetups"] = [];
  for (const source of sourceFiles) {
    const manifestCount = countMatches(source.text, /(^|\n)\s*apiVersion\s*:|(^|\n)\s*kind\s*:/gi);
    const workloadCount = countMatches(source.text, /kind\s*:\s*(Deployment|StatefulSet|DaemonSet|Job|CronJob|Pod)\b|(^|\n)\s*replicas\s*:/gi);
    const serviceCount = countMatches(source.text, /kind\s*:\s*(Service|Ingress|NetworkPolicy)\b|(^|\n)\s*(ports|selector|selectors)\s*:/gi);
    const configCount = countMatches(source.text, /kind\s*:\s*(ConfigMap|Secret)\b|(^|\n)\s*(env|envFrom|configMapRef|secretRef|imagePullSecrets|stringData|data)\s*:/gi);
    const storageCount = countMatches(source.text, /kind\s*:\s*(PersistentVolume|PersistentVolumeClaim)\b|(^|\n)\s*(volumeMounts|volumes|storageClassName|emptyDir|hostPath)\s*:/gi);
    const securityCount = countMatches(source.text, /kind\s*:\s*(ServiceAccount|Role|RoleBinding|ClusterRole|ClusterRoleBinding)\b|(^|\n)\s*(serviceAccountName|securityContext|podSecurityContext|runAsNonRoot|allowPrivilegeEscalation)\s*:/gi);
    const policyCount = countMatches(source.text, /kind\s*:\s*(NetworkPolicy|PodDisruptionBudget|ResourceQuota|LimitRange)\b|(^|\n)\s*policyTypes\s*:/gi);
    const probeCount = countMatches(source.text, /(^|\n)\s*(readinessProbe|livenessProbe|startupProbe)\s*:/gi);
    const resourceCount = countMatches(source.text, /(^|\n)\s*(resources|requests|limits)\s*:/gi);
    const autoscalingCount = countMatches(source.text, /kind\s*:\s*HorizontalPodAutoscaler\b|autoscaling\/v\d|(^|\n)\s*(minReplicas|maxReplicas|scaleTargetRef|metrics)\s*:/gi);
    const observabilityCount = countMatches(source.text, /kind\s*:\s*(ServiceMonitor|PrometheusRule|APIService)\b|prometheus\.io\/scrape|custom\.metrics|metrics\.k8s\.io/gi);
    const workflowCount = countMatches(source.text, /kubectl\s+(apply|diff|wait|rollout|logs|describe|port-forward|delete|get)|kustomize\s+build/gi);
    const kustomizeCount = countMatches(source.text, /(^|\n)\s*(resources|bases|patches|patchesStrategicMerge|configMapGenerator|secretGenerator|images|replacements|components|namespace|namePrefix|nameSuffix)\s*:/gi) + (/^kustomization\.ya?ml$/i.test(path.basename(source.filePath)) ? 1 : 0);
    const totalSignals = manifestCount + workloadCount + serviceCount + configCount + storageCount + securityCount + policyCount + probeCount + resourceCount + autoscalingCount + observabilityCount + workflowCount + kustomizeCount;
    if (totalSignals === 0 && !kubernetesPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      format: kubernetesFormat(source),
      manifestCount,
      workloadCount,
      serviceCount,
      configCount,
      storageCount,
      securityCount,
      policyCount,
      probeCount,
      resourceCount,
      autoscalingCount,
      observabilityCount,
      workflowCount,
      readiness: totalSignals >= 7 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} Kubernetes/Kustomize signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.manifestCount + b.workloadCount + b.serviceCount + b.securityCount + b.probeCount + b.autoscalingCount + b.workflowCount;
    const aScore = a.manifestCount + a.workloadCount + a.serviceCount + a.securityCount + a.probeCount + a.autoscalingCount + a.workflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function kubernetesFormat(source: KubernetesSourceFile): KubernetesReadinessReport["kubernetesSetups"][number]["format"] {
  const base = path.basename(source.filePath).toLowerCase();
  if (/^kustomization\.ya?ml$/.test(base)) return "kustomization";
  if (/\.(ya?ml|json)$/.test(base) && /(^|\n)\s*(apiVersion|kind)\s*:/i.test(source.text)) return "manifest-yaml";
  if (/^(package\.json|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base) || /kubectl\s+|kustomize\s+build/i.test(source.text)) return "package-script";
  if (/\.github\/workflows\/.*\.ya?ml$/i.test(source.filePath)) return "workflow";
  if (/^README\.md$/i.test(base)) return "readme";
  return "unknown";
}

function kubernetesManifestSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["manifestSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["manifestSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "api-version", pattern: /(^|\n)\s*apiVersion\s*:/i, evidence: "apiVersion evidence was detected." },
    { signal: "kind", pattern: /(^|\n)\s*kind\s*:/i, evidence: "kind evidence was detected." },
    { signal: "metadata", pattern: /(^|\n)\s*metadata\s*:/i, evidence: "metadata evidence was detected." },
    { signal: "labels", pattern: /(^|\n)\s*labels\s*:/i, evidence: "labels evidence was detected." },
    { signal: "annotations", pattern: /(^|\n)\s*annotations\s*:/i, evidence: "annotations evidence was detected." },
    { signal: "namespace", pattern: /(^|\n)\s*namespace\s*:|kind\s*:\s*Namespace\b|kubectl\s+create\s+namespace/i, evidence: "namespace evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "manifest", "signal");
}

function kubernetesWorkloadSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["workloadSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["workloadSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "deployment", pattern: /kind\s*:\s*Deployment\b|deployment\/[A-Za-z0-9_.-]+/i, evidence: "Deployment evidence was detected." },
    { signal: "statefulset", pattern: /kind\s*:\s*StatefulSet\b/i, evidence: "StatefulSet evidence was detected." },
    { signal: "daemonset", pattern: /kind\s*:\s*DaemonSet\b/i, evidence: "DaemonSet evidence was detected." },
    { signal: "job", pattern: /kind\s*:\s*Job\b/i, evidence: "Job evidence was detected." },
    { signal: "cronjob", pattern: /kind\s*:\s*CronJob\b/i, evidence: "CronJob evidence was detected." },
    { signal: "pod", pattern: /kind\s*:\s*Pod\b|(^|\n)\s*pods?\b/i, evidence: "Pod evidence was detected." },
    { signal: "replicas", pattern: /(^|\n)\s*replicas\s*:/i, evidence: "replica count evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "workload", "signal");
}

function kubernetesNetworkSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["networkSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["networkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "service", pattern: /kind\s*:\s*Service\b|service\/[A-Za-z0-9_.-]+/i, evidence: "Service evidence was detected." },
    { signal: "ingress", pattern: /kind\s*:\s*Ingress\b|networking\.k8s\.io\/v1/i, evidence: "Ingress evidence was detected." },
    { signal: "network-policy", pattern: /kind\s*:\s*NetworkPolicy\b/i, evidence: "NetworkPolicy evidence was detected." },
    { signal: "ports", pattern: /(^|\n)\s*(ports|containerPort|targetPort|port)\s*:/i, evidence: "port wiring evidence was detected." },
    { signal: "selectors", pattern: /(^|\n)\s*(selector|selectors|matchLabels|podSelector)\s*:/i, evidence: "selector evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "network", "signal");
}

function kubernetesConfigSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["configSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "configmap", pattern: /kind\s*:\s*ConfigMap\b|configMapRef|configMapGenerator/i, evidence: "ConfigMap evidence was detected." },
    { signal: "secret", pattern: /kind\s*:\s*Secret\b|secretRef|secretGenerator|stringData/i, evidence: "Secret reference evidence was detected." },
    { signal: "env", pattern: /(^|\n)\s*env\s*:/i, evidence: "env evidence was detected." },
    { signal: "env-from", pattern: /(^|\n)\s*envFrom\s*:/i, evidence: "envFrom evidence was detected." },
    { signal: "image-pull-secret", pattern: /(^|\n)\s*imagePullSecrets\s*:/i, evidence: "imagePullSecrets evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function kubernetesStorageSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["storageSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["storageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "persistent-volume", pattern: /kind\s*:\s*PersistentVolume\b/i, evidence: "PersistentVolume evidence was detected." },
    { signal: "persistent-volume-claim", pattern: /kind\s*:\s*PersistentVolumeClaim\b/i, evidence: "PersistentVolumeClaim evidence was detected." },
    { signal: "volume-mount", pattern: /(^|\n)\s*volumeMounts\s*:/i, evidence: "volumeMounts evidence was detected." },
    { signal: "volume", pattern: /(^|\n)\s*volumes\s*:/i, evidence: "volumes evidence was detected." },
    { signal: "storage-class", pattern: /(^|\n)\s*storageClassName\s*:/i, evidence: "storageClassName evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "storage", "signal");
}

function kubernetesSecuritySignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["securitySignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "service-account", pattern: /kind\s*:\s*ServiceAccount\b|(^|\n)\s*serviceAccountName\s*:/i, evidence: "ServiceAccount evidence was detected." },
    { signal: "role", pattern: /kind\s*:\s*Role\b/i, evidence: "Role evidence was detected." },
    { signal: "role-binding", pattern: /kind\s*:\s*RoleBinding\b/i, evidence: "RoleBinding evidence was detected." },
    { signal: "cluster-role", pattern: /kind\s*:\s*ClusterRole\b/i, evidence: "ClusterRole evidence was detected." },
    { signal: "cluster-role-binding", pattern: /kind\s*:\s*ClusterRoleBinding\b/i, evidence: "ClusterRoleBinding evidence was detected." },
    { signal: "security-context", pattern: /(^|\n)\s*securityContext\s*:/i, evidence: "container securityContext evidence was detected." },
    { signal: "pod-security-context", pattern: /podSecurityContext|runAsNonRoot|allowPrivilegeEscalation/i, evidence: "pod security policy evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function kubernetesHealthSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["healthSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["healthSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "readiness-probe", pattern: /(^|\n)\s*readinessProbe\s*:/i, evidence: "readinessProbe evidence was detected." },
    { signal: "liveness-probe", pattern: /(^|\n)\s*livenessProbe\s*:/i, evidence: "livenessProbe evidence was detected." },
    { signal: "startup-probe", pattern: /(^|\n)\s*startupProbe\s*:/i, evidence: "startupProbe evidence was detected." },
    { signal: "resources", pattern: /(^|\n)\s*resources\s*:/i, evidence: "resources block evidence was detected." },
    { signal: "limits", pattern: /(^|\n)\s*limits\s*:/i, evidence: "resource limits evidence was detected." },
    { signal: "requests", pattern: /(^|\n)\s*requests\s*:/i, evidence: "resource requests evidence was detected." },
    { signal: "hpa", pattern: /kind\s*:\s*HorizontalPodAutoscaler\b|autoscaling\/v\d/i, evidence: "HorizontalPodAutoscaler evidence was detected." },
    { signal: "pdb", pattern: /kind\s*:\s*PodDisruptionBudget\b/i, evidence: "PodDisruptionBudget evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "health", "signal");
}

function kubernetesKustomizeSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["kustomizeSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["kustomizeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kustomization", pattern: /(^|\/)kustomization\.ya?ml$/i, evidence: "kustomization.yaml evidence was detected." },
    { signal: "resources", pattern: /(^|\n)\s*resources\s*:/i, evidence: "Kustomize resources evidence was detected." },
    { signal: "bases", pattern: /(^|\n)\s*bases\s*:/i, evidence: "legacy bases evidence was detected." },
    { signal: "patches", pattern: /(^|\n)\s*(patches|patchesStrategicMerge|patchesJson6902)\s*:/i, evidence: "Kustomize patches evidence was detected." },
    { signal: "configmap-generator", pattern: /(^|\n)\s*configMapGenerator\s*:/i, evidence: "configMapGenerator evidence was detected." },
    { signal: "secret-generator", pattern: /(^|\n)\s*secretGenerator\s*:/i, evidence: "secretGenerator evidence was detected." },
    { signal: "images", pattern: /(^|\n)\s*images\s*:/i, evidence: "Kustomize image override evidence was detected." },
    { signal: "replacements", pattern: /(^|\n)\s*replacements\s*:/i, evidence: "Kustomize replacements evidence was detected." },
    { signal: "components", pattern: /(^|\n)\s*components\s*:/i, evidence: "Kustomize components evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "kustomize", "signal");
}

function kubernetesWorkflowSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kubectl-apply", pattern: /kubectl\s+apply\b/i, evidence: "kubectl apply evidence was detected." },
    { signal: "kubectl-diff", pattern: /kubectl\s+diff\b/i, evidence: "kubectl diff evidence was detected." },
    { signal: "kubectl-wait", pattern: /kubectl\s+wait\b/i, evidence: "kubectl wait evidence was detected." },
    { signal: "kubectl-rollout", pattern: /kubectl\s+rollout\b/i, evidence: "kubectl rollout evidence was detected." },
    { signal: "kubectl-logs", pattern: /kubectl\s+logs\b/i, evidence: "kubectl logs evidence was detected." },
    { signal: "kubectl-describe", pattern: /kubectl\s+describe\b/i, evidence: "kubectl describe evidence was detected." },
    { signal: "kubectl-port-forward", pattern: /kubectl\s+port-forward\b/i, evidence: "kubectl port-forward evidence was detected." },
    { signal: "kubectl-delete", pattern: /kubectl\s+delete\b/i, evidence: "kubectl delete evidence was detected." },
    { signal: "kustomize-build", pattern: /kustomize\s+build\b|kubectl\s+(apply|diff).*-k\b/i, evidence: "Kustomize build/apply evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function kubernetesPackageSignals(sourceFiles: KubernetesSourceFile[]): KubernetesReadinessReport["packageSignals"] {
  const specs: Array<{ signal: KubernetesReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kubectl", pattern: /(^|\W)kubectl(\W|$)|"kubectl"\s*:/i, evidence: "kubectl evidence was detected." },
    { signal: "kustomize", pattern: /(^|\W)kustomize(\W|$)|"kustomize"\s*:/i, evidence: "kustomize evidence was detected." },
    { signal: "kubernetes-yaml", pattern: /(^|\n)\s*apiVersion\s*:|Kubernetes/i, evidence: "Kubernetes YAML evidence was detected." },
    { signal: "kind", pattern: /(^|\W)kind\s+(create|load|export|get)|kindest\/node/i, evidence: "kind cluster tool evidence was detected." },
    { signal: "minikube", pattern: /(^|\W)minikube(\W|$)/i, evidence: "minikube evidence was detected." }
  ];
  return kubernetesSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function kubernetesSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: KubernetesSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/kubernetes-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildGitOpsReadinessReport(walk: WalkResult): Promise<GitOpsReadinessReport> {
  const sourceFiles = await gitopsSourceFiles(walk);
  const gitopsSetups = gitopsSetupFiles(sourceFiles);
  const argoSignals = gitopsArgoSignals(sourceFiles);
  const fluxSourceSignals = gitopsFluxSourceSignals(sourceFiles);
  const fluxReconcileSignals = gitopsFluxReconcileSignals(sourceFiles);
  const imageNotificationSignals = gitopsImageNotificationSignals(sourceFiles);
  const workflowSignals = gitopsWorkflowSignals(sourceFiles);
  const safetySignals = gitopsSafetySignals(sourceFiles);
  const packageSignals = gitopsPackageSignals(sourceFiles);

  const hasArgo = argoSignals.some((item) => item.readiness === "ready") || gitopsSetups.some((item) => item.controller === "argo-cd" || item.controller === "hybrid");
  const hasFlux = fluxSourceSignals.some((item) => item.readiness === "ready") || fluxReconcileSignals.some((item) => item.readiness === "ready") || gitopsSetups.some((item) => item.controller === "flux" || item.controller === "hybrid");
  const hasApplication = argoSignals.some((item) => item.signal === "application" && item.readiness === "ready") || gitopsSetups.some((item) => item.applicationCount > 0);
  const hasSource = argoSignals.some((item) => ["repo-url", "target-revision", "path"].includes(item.signal) && item.readiness === "ready") || fluxSourceSignals.some((item) => item.readiness === "ready");
  const hasDestination = argoSignals.some((item) => item.signal.startsWith("destination") && item.readiness === "ready") || fluxReconcileSignals.some((item) => item.signal === "target-namespace" && item.readiness === "ready");
  const hasSyncPolicy = argoSignals.some((item) => ["sync-policy", "automated-sync", "prune", "self-heal"].includes(item.signal) && item.readiness === "ready") || fluxReconcileSignals.some((item) => ["prune", "depends-on", "health-checks"].includes(item.signal) && item.readiness === "ready");
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || gitopsSetups.some((item) => item.workflowCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready");

  const riskQueue: GitOpsReadinessReport["riskQueue"] = [];
  if (!hasArgo && !hasFlux) {
    riskQueue.push({
      priority: "high",
      action: "Add Argo CD or Flux custom resources before claiming GitOps readiness.",
      why: "GitOps readiness needs declarative controller evidence such as Application, ApplicationSet, AppProject, GitRepository, Kustomization, or HelmRelease.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  if ((hasArgo || hasFlux) && !hasSource) {
    riskQueue.push({
      priority: "high",
      action: "Trace the Git/Helm/OCI source reference, revision, and path.",
      why: "A GitOps object without a concrete source cannot explain what repository content will be reconciled.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  if (hasArgo && !hasApplication) {
    riskQueue.push({
      priority: "high",
      action: "Add or document Argo CD Application/ApplicationSet coverage.",
      why: "Argo CD readiness needs a concrete application object, not just generic controller installation evidence.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  if ((hasArgo || hasFlux) && !hasDestination) {
    riskQueue.push({
      priority: "medium",
      action: "Record destination server, namespace, targetNamespace, or service account boundaries.",
      why: "GitOps learners need the cluster and namespace boundary before they can reason about reconciliation blast radius.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  if ((hasArgo || hasFlux) && !hasSyncPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Document sync, prune, self-heal, dependsOn, healthChecks, timeout, and retry behavior.",
      why: "Reconciliation safety depends on whether the controller prunes, self-heals, waits for health, and orders dependencies.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  if ((hasArgo || hasFlux) && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add argocd or flux read-only workflow commands for diff, sync/reconcile, wait, get, trace, tree, logs, and events.",
      why: "Operational commands explain how to inspect drift and health without RepoTutor contacting a live cluster.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  if ((hasArgo || hasFlux) && !hasSafety) {
    riskQueue.push({
      priority: "low",
      action: "Add project boundaries, allow/deny lists, sync windows, dry-run/diff, signed commits, health checks, or manual approval evidence.",
      why: "GitOps controllers can mutate clusters continuously; static analysis should surface the guardrails before live reconciliation.",
      relatedHref: "html/gitops-readiness.html"
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

  return {
    summary: `GitOps readiness report: setup ${gitopsSetups.length}개, Argo signal ${argoSignals.length}개, Flux source signal ${fluxSourceSignals.length}개, Flux reconcile signal ${fluxReconcileSignals.length}개, workflow signal ${workflowSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "GitOps Argo CD Application ApplicationSet AppProject repoURL targetRevision path destination syncPolicy automated prune selfHeal syncOptions Flux GitRepository HelmRepository OCIRepository Bucket Kustomization HelmRelease dependsOn interval prune suspend healthChecks timeout retryInterval ImageRepository ImagePolicy ImageUpdateAutomation Receiver Alert Provider argocd app sync diff wait get repo add cluster add flux bootstrap reconcile get suspend resume trace tree logs events",
    gitopsSetups,
    argoSignals,
    fluxSourceSignals,
    fluxReconcileSignals,
    imageNotificationSignals,
    workflowSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "argocd app diff <app>", purpose: "Preview Argo CD drift before syncing." },
      { command: "argocd app sync <app> --prune", purpose: "Review the intended sync and prune workflow for one Application." },
      { command: "argocd app wait <app> --health", purpose: "Wait for Argo CD to report healthy state after reconciliation." },
      { command: "argocd app get <app>", purpose: "Inspect source, destination, sync status, and health for one Application." },
      { command: "flux bootstrap github --owner <owner> --repository <repo> --path <path>", purpose: "Review the Flux bootstrap shape for a Git-backed cluster path." },
      { command: "flux reconcile kustomization <name> --with-source", purpose: "Manually request Flux reconciliation after source changes." },
      { command: "flux get all", purpose: "List Flux sources, kustomizations, Helm releases, and status." },
      { command: "flux trace <kind>/<name>", purpose: "Trace object ownership through Flux reconciliation." },
      { command: "flux tree kustomization <name>", purpose: "Inspect the resource tree managed by one Flux Kustomization." },
      { command: "flux logs --kind Kustomization", purpose: "Inspect Flux controller logs for a reconciliation kind." }
    ],
    learnerNextSteps: [
      "Open GitOps Readiness and identify whether the repo uses Argo CD, Flux, or both.",
      "For Argo CD, map Application/ApplicationSet/AppProject, repoURL, targetRevision, path, destination, and syncPolicy.",
      "For Flux, map GitRepository/HelmRepository/OCIRepository/Bucket sources before Kustomization or HelmRelease objects.",
      "Trace prune, self-heal, suspend, dependsOn, healthChecks, timeout, retryInterval, targetNamespace, and serviceAccountName before live reconciliation.",
      "Review ImageRepository, ImagePolicy, ImageUpdateAutomation, Receiver, Alert, and Provider signals for automation and notifications.",
      "Run the recommended argocd/flux commands only in a trusted cluster; RepoTutor records GitOps readiness statically and does not contact controllers or Kubernetes APIs."
    ]
  };
}

type GitOpsSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function gitopsSourceFiles(walk: WalkResult): Promise<GitOpsSourceFile[]> {
  const files: GitOpsSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !gitopsInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!gitopsPathSignal(file.relPath) && !gitopsContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function gitopsInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return gitopsPathSignal(filePath)
    || /(^|\/)(README|docs?|gitops|argocd|argo-cd|applicationsets?|apps?|clusters?|flux|flux-system|k8s|kubernetes|manifests?|deploy|deployment|overlays?|base|infra|scripts?|ci|workflows?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|kustomization\.ya?ml)$/i.test(base);
}

function gitopsPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(argocd|argo-cd|applicationsets?|gitops|flux|flux-system|clusters?)\/.*\.(ya?ml|json|md)$/i.test(filePath)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath)
    || /^(application|applicationset|appproject|gitrepository|helmrepository|ocirepository|bucket|kustomization|helmrelease|imagerepository|imagepolicy|imageupdateautomation|receiver|alert|provider)[-.].*\.(ya?ml|json)$/i.test(base)
    || /^(application|applicationset|appproject|gitrepository|helmrepository|ocirepository|bucket|kustomization|helmrelease|imagerepository|imagepolicy|imageupdateautomation|receiver|alert|provider)\.(ya?ml|json)$/i.test(base);
}

function gitopsContentSignal(text: string): boolean {
  return /(argoproj\.io\/v1alpha1|kind\s*:\s*(Application|ApplicationSet|AppProject)\b|repoURL\s*:|targetRevision\s*:|syncPolicy\s*:|selfHeal\s*:|source\.toolkit\.fluxcd\.io|kustomize\.toolkit\.fluxcd\.io|helm\.toolkit\.fluxcd\.io|image\.toolkit\.fluxcd\.io|notification\.toolkit\.fluxcd\.io|kind\s*:\s*(GitRepository|HelmRepository|OCIRepository|Bucket|Kustomization|HelmRelease|ImageRepository|ImagePolicy|ImageUpdateAutomation|Receiver|Alert|Provider)\b|flux\s+(bootstrap|reconcile|get|suspend|resume|trace|tree|logs|events)|argocd\s+(app|repo|cluster)\s+)/i.test(text);
}

function gitopsSetupFiles(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["gitopsSetups"] {
  const rows: GitOpsReadinessReport["gitopsSetups"] = [];
  for (const source of sourceFiles) {
    const applicationCount = countMatches(source.text, /kind\s*:\s*(Application|ApplicationSet|AppProject)\b|apiVersion\s*:\s*argoproj\.io\/v1alpha1/gi);
    const sourceCount = countMatches(source.text, /repoURL\s*:|targetRevision\s*:|(^|\n)\s*path\s*:|(^|\n)\s*sources?\s*:/gi);
    const destinationCount = countMatches(source.text, /(^|\n)\s*destination\s*:|(^|\n)\s*server\s*:|(^|\n)\s*namespace\s*:|targetNamespace\s*:/gi);
    const syncPolicyCount = countMatches(source.text, /syncPolicy\s*:|automated\s*:|prune\s*:|selfHeal\s*:|syncOptions\s*:/gi);
    const generatorCount = countMatches(source.text, /generators?\s*:|matrix\s*:|merge\s*:|clusters?\s*:|directories\s*:|scmProvider\s*:|pullRequest\s*:/gi);
    const fluxSourceCount = countMatches(source.text, /kind\s*:\s*(GitRepository|HelmRepository|OCIRepository|Bucket)\b|source\.toolkit\.fluxcd\.io|sourceRef\s*:|secretRef\s*:|interval\s*:/gi);
    const fluxReconcileCount = countMatches(source.text, /kind\s*:\s*(Kustomization|HelmRelease)\b|kustomize\.toolkit\.fluxcd\.io|helm\.toolkit\.fluxcd\.io|dependsOn\s*:|healthChecks\s*:|retryInterval\s*:|timeout\s*:|suspend\s*:/gi);
    const imageAutomationCount = countMatches(source.text, /kind\s*:\s*(ImageRepository|ImagePolicy|ImageUpdateAutomation)\b|image\.toolkit\.fluxcd\.io|imageRepositoryRef\s*:|policy\s*:|ImageUpdateAutomation/gi);
    const notificationCount = countMatches(source.text, /kind\s*:\s*(Receiver|Alert|Provider)\b|notification\.toolkit\.fluxcd\.io|providerRef\s*:|webhook|events\s*:/gi);
    const workflowCount = countMatches(source.text, /argocd\s+(app|repo|cluster)\s+(sync|diff|wait|get|add)|flux\s+(bootstrap|reconcile|get|suspend|resume|trace|tree|logs|events)/gi);
    const totalSignals = applicationCount + sourceCount + destinationCount + syncPolicyCount + generatorCount + fluxSourceCount + fluxReconcileCount + imageAutomationCount + notificationCount + workflowCount;
    if (totalSignals === 0 && !gitopsPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      controller: gitopsController(source),
      applicationCount,
      sourceCount,
      destinationCount,
      syncPolicyCount,
      generatorCount,
      fluxSourceCount,
      fluxReconcileCount,
      imageAutomationCount,
      notificationCount,
      workflowCount,
      readiness: totalSignals >= 7 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} GitOps/Argo CD/Flux signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.applicationCount + b.sourceCount + b.destinationCount + b.syncPolicyCount + b.fluxSourceCount + b.fluxReconcileCount + b.workflowCount;
    const aScore = a.applicationCount + a.sourceCount + a.destinationCount + a.syncPolicyCount + a.fluxSourceCount + a.fluxReconcileCount + a.workflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function gitopsController(source: GitOpsSourceFile): GitOpsReadinessReport["gitopsSetups"][number]["controller"] {
  const argo = /argocd|argo-cd|argoproj\.io|ApplicationSet|AppProject|kind\s*:\s*Application\b/i.test(source.filePath) || /argocd|argoproj\.io|ApplicationSet|AppProject|kind\s*:\s*Application\b/i.test(source.text);
  const flux = /flux|fluxcd|toolkit\.fluxcd\.io|GitRepository|HelmRelease|ImageUpdateAutomation/i.test(source.filePath) || /fluxcd|flux\s+(bootstrap|reconcile|get|suspend|resume|trace|tree|logs|events)|toolkit\.fluxcd\.io|GitRepository|HelmRelease|ImageUpdateAutomation/i.test(source.text);
  if (argo && flux) return "hybrid";
  if (argo) return "argo-cd";
  if (flux) return "flux";
  if (/^(package\.json|Makefile|Taskfile\.ya?ml|justfile)$/i.test(path.basename(source.filePath))) return "package-script";
  if (/\.github\/workflows\/.*\.ya?ml$/i.test(source.filePath)) return "workflow";
  if (/^README\.md$/i.test(path.basename(source.filePath))) return "readme";
  return "unknown";
}

function gitopsArgoSignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["argoSignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["argoSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "application", pattern: /kind\s*:\s*Application\b|argocd\s+app\s+/i, evidence: "Argo CD Application evidence was detected." },
    { signal: "applicationset", pattern: /kind\s*:\s*ApplicationSet\b|ApplicationSet/i, evidence: "ApplicationSet evidence was detected." },
    { signal: "app-project", pattern: /kind\s*:\s*AppProject\b|AppProject|sourceRepos\s*:|destinations\s*:/i, evidence: "AppProject boundary evidence was detected." },
    { signal: "repo-url", pattern: /repoURL\s*:/i, evidence: "repoURL evidence was detected." },
    { signal: "target-revision", pattern: /targetRevision\s*:/i, evidence: "targetRevision evidence was detected." },
    { signal: "path", pattern: /(^|\n)\s*path\s*:/i, evidence: "application path evidence was detected." },
    { signal: "destination-server", pattern: /destination\s*:|server\s*:\s*https?:|server\s*:\s*https:\/\/kubernetes\.default\.svc/i, evidence: "destination server evidence was detected." },
    { signal: "destination-namespace", pattern: /destination\s*:|namespace\s*:/i, evidence: "destination namespace evidence was detected." },
    { signal: "sync-policy", pattern: /syncPolicy\s*:/i, evidence: "syncPolicy evidence was detected." },
    { signal: "automated-sync", pattern: /automated\s*:/i, evidence: "automated sync evidence was detected." },
    { signal: "prune", pattern: /prune\s*:\s*true|--prune\b/i, evidence: "prune evidence was detected." },
    { signal: "self-heal", pattern: /selfHeal\s*:\s*true/i, evidence: "selfHeal evidence was detected." },
    { signal: "sync-options", pattern: /syncOptions\s*:|CreateNamespace=true|ApplyOutOfSyncOnly=true/i, evidence: "syncOptions evidence was detected." },
    { signal: "helm-source", pattern: /(^|\n)\s*helm\s*:|valueFiles\s*:/i, evidence: "Argo Helm source evidence was detected." },
    { signal: "kustomize-source", pattern: /(^|\n)\s*kustomize\s*:|namePrefix\s*:|nameSuffix\s*:/i, evidence: "Argo Kustomize source evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "argo", "signal");
}

function gitopsFluxSourceSignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["fluxSourceSignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["fluxSourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "git-repository", pattern: /kind\s*:\s*GitRepository\b|source\.toolkit\.fluxcd\.io/i, evidence: "GitRepository evidence was detected." },
    { signal: "helm-repository", pattern: /kind\s*:\s*HelmRepository\b/i, evidence: "HelmRepository evidence was detected." },
    { signal: "oci-repository", pattern: /kind\s*:\s*OCIRepository\b|oci:\/\//i, evidence: "OCIRepository evidence was detected." },
    { signal: "bucket", pattern: /kind\s*:\s*Bucket\b/i, evidence: "Bucket source evidence was detected." },
    { signal: "source-ref", pattern: /sourceRef\s*:/i, evidence: "sourceRef evidence was detected." },
    { signal: "interval", pattern: /interval\s*:/i, evidence: "interval evidence was detected." },
    { signal: "secret-ref", pattern: /secretRef\s*:/i, evidence: "secretRef evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "flux source", "signal");
}

function gitopsFluxReconcileSignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["fluxReconcileSignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["fluxReconcileSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kustomization", pattern: /kind\s*:\s*Kustomization\b|kustomize\.toolkit\.fluxcd\.io/i, evidence: "Flux Kustomization evidence was detected." },
    { signal: "helm-release", pattern: /kind\s*:\s*HelmRelease\b|helm\.toolkit\.fluxcd\.io/i, evidence: "HelmRelease evidence was detected." },
    { signal: "depends-on", pattern: /dependsOn\s*:/i, evidence: "dependsOn evidence was detected." },
    { signal: "prune", pattern: /prune\s*:\s*true/i, evidence: "prune evidence was detected." },
    { signal: "suspend", pattern: /suspend\s*:\s*(true|false)|flux\s+suspend|flux\s+resume/i, evidence: "suspend/resume evidence was detected." },
    { signal: "health-checks", pattern: /healthChecks\s*:/i, evidence: "healthChecks evidence was detected." },
    { signal: "timeout", pattern: /timeout\s*:/i, evidence: "timeout evidence was detected." },
    { signal: "retry-interval", pattern: /retryInterval\s*:/i, evidence: "retryInterval evidence was detected." },
    { signal: "target-namespace", pattern: /targetNamespace\s*:|namespace\s*:/i, evidence: "target namespace evidence was detected." },
    { signal: "service-account", pattern: /serviceAccountName\s*:/i, evidence: "serviceAccountName evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "flux reconcile", "signal");
}

function gitopsImageNotificationSignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["imageNotificationSignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["imageNotificationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "image-repository", pattern: /kind\s*:\s*ImageRepository\b/i, evidence: "ImageRepository evidence was detected." },
    { signal: "image-policy", pattern: /kind\s*:\s*ImagePolicy\b/i, evidence: "ImagePolicy evidence was detected." },
    { signal: "image-update-automation", pattern: /kind\s*:\s*ImageUpdateAutomation\b/i, evidence: "ImageUpdateAutomation evidence was detected." },
    { signal: "receiver", pattern: /kind\s*:\s*Receiver\b/i, evidence: "Receiver evidence was detected." },
    { signal: "alert", pattern: /kind\s*:\s*Alert\b/i, evidence: "Alert evidence was detected." },
    { signal: "provider", pattern: /kind\s*:\s*Provider\b|providerRef\s*:/i, evidence: "Provider evidence was detected." },
    { signal: "webhook", pattern: /webhook|events\s*:/i, evidence: "webhook/event evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "image/notification", "signal");
}

function gitopsWorkflowSignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "argocd-app-sync", pattern: /argocd\s+app\s+sync\b/i, evidence: "argocd app sync evidence was detected." },
    { signal: "argocd-app-diff", pattern: /argocd\s+app\s+diff\b/i, evidence: "argocd app diff evidence was detected." },
    { signal: "argocd-app-wait", pattern: /argocd\s+app\s+wait\b/i, evidence: "argocd app wait evidence was detected." },
    { signal: "argocd-app-get", pattern: /argocd\s+app\s+get\b/i, evidence: "argocd app get evidence was detected." },
    { signal: "argocd-repo-add", pattern: /argocd\s+repo\s+add\b/i, evidence: "argocd repo add evidence was detected." },
    { signal: "argocd-cluster-add", pattern: /argocd\s+cluster\s+add\b/i, evidence: "argocd cluster add evidence was detected." },
    { signal: "flux-bootstrap", pattern: /flux\s+bootstrap\b/i, evidence: "flux bootstrap evidence was detected." },
    { signal: "flux-reconcile", pattern: /flux\s+reconcile\b/i, evidence: "flux reconcile evidence was detected." },
    { signal: "flux-get", pattern: /flux\s+get\b/i, evidence: "flux get evidence was detected." },
    { signal: "flux-suspend", pattern: /flux\s+suspend\b/i, evidence: "flux suspend evidence was detected." },
    { signal: "flux-resume", pattern: /flux\s+resume\b/i, evidence: "flux resume evidence was detected." },
    { signal: "flux-trace", pattern: /flux\s+trace\b/i, evidence: "flux trace evidence was detected." },
    { signal: "flux-tree", pattern: /flux\s+tree\b/i, evidence: "flux tree evidence was detected." },
    { signal: "flux-logs", pattern: /flux\s+logs\b/i, evidence: "flux logs evidence was detected." },
    { signal: "flux-events", pattern: /flux\s+events\b/i, evidence: "flux events evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function gitopsSafetySignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["safetySignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dry-run", pattern: /dry[- ]?run|argocd\s+app\s+diff|kubectl\s+diff/i, evidence: "dry-run/diff evidence was detected." },
    { signal: "namespace", pattern: /namespace\s*:|targetNamespace\s*:|CreateNamespace=true/i, evidence: "namespace boundary evidence was detected." },
    { signal: "project-boundary", pattern: /kind\s*:\s*AppProject\b|sourceRepos\s*:|destinations\s*:/i, evidence: "project boundary evidence was detected." },
    { signal: "sync-window", pattern: /syncWindows\s*:|sync window/i, evidence: "sync window evidence was detected." },
    { signal: "allow-list", pattern: /allow|whitelist|clusterResourceWhitelist|namespaceResourceWhitelist/i, evidence: "allow-list evidence was detected." },
    { signal: "deny-list", pattern: /deny|blacklist|clusterResourceBlacklist|namespaceResourceBlacklist/i, evidence: "deny-list evidence was detected." },
    { signal: "signed-commit", pattern: /signed commit|signature|verify.*commit|GnuPG|gpg/i, evidence: "signed commit evidence was detected." },
    { signal: "health-check", pattern: /healthChecks\s*:|--health|health status/i, evidence: "health check evidence was detected." },
    { signal: "drift-detection", pattern: /diff|drift|OutOfSync|reconcile/i, evidence: "drift detection evidence was detected." },
    { signal: "manual-approval", pattern: /manual approval|manual sync|automated\s*:\s*false|suspend\s*:\s*true/i, evidence: "manual gate evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function gitopsPackageSignals(sourceFiles: GitOpsSourceFile[]): GitOpsReadinessReport["packageSignals"] {
  const specs: Array<{ signal: GitOpsReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "argocd", pattern: /(^|\W)argocd(\W|$)|argocd\s+(app|repo|cluster)/i, evidence: "argocd CLI evidence was detected." },
    { signal: "argo-cd", pattern: /argo-cd|Argo CD|argoproj\.io/i, evidence: "Argo CD evidence was detected." },
    { signal: "flux", pattern: /(^|\W)flux\s+(bootstrap|reconcile|get|suspend|resume|trace|tree|logs|events)/i, evidence: "flux CLI evidence was detected." },
    { signal: "fluxcd", pattern: /fluxcd|toolkit\.fluxcd\.io/i, evidence: "Flux controller evidence was detected." },
    { signal: "source-controller", pattern: /source-controller|source\.toolkit\.fluxcd\.io/i, evidence: "source-controller evidence was detected." },
    { signal: "kustomize-controller", pattern: /kustomize-controller|kustomize\.toolkit\.fluxcd\.io/i, evidence: "kustomize-controller evidence was detected." },
    { signal: "helm-controller", pattern: /helm-controller|helm\.toolkit\.fluxcd\.io/i, evidence: "helm-controller evidence was detected." },
    { signal: "notification-controller", pattern: /notification-controller|notification\.toolkit\.fluxcd\.io/i, evidence: "notification-controller evidence was detected." },
    { signal: "image-automation-controller", pattern: /image-automation-controller|image\.toolkit\.fluxcd\.io/i, evidence: "image automation evidence was detected." }
  ];
  return gitopsSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function gitopsSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: GitOpsSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/gitops-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildBackupReadinessReport(walk: WalkResult): Promise<BackupReadinessReport> {
  const sourceFiles = await backupSourceFiles(walk);
  const backupSetups = backupSetupFiles(sourceFiles);
  const veleroSignals = backupVeleroSignals(sourceFiles);
  const litestreamSignals = backupLitestreamSignals(sourceFiles);
  const resticSignals = backupResticSignals(sourceFiles);
  const restoreDrillSignals = backupRestoreDrillSignals(sourceFiles);
  const safetySignals = backupSafetySignals(sourceFiles);
  const packageSignals = backupPackageSignals(sourceFiles);

  const hasTool = packageSignals.some((item) => item.readiness === "ready") || backupSetups.length > 0;
  const hasBackup = backupSetups.some((item) => item.backupCount > 0) || veleroSignals.some((item) => item.signal === "backup" && item.readiness === "ready") || resticSignals.some((item) => item.signal === "backup-command" && item.readiness === "ready") || litestreamSignals.some((item) => item.signal === "replicate-command" && item.readiness === "ready");
  const hasRestore = backupSetups.some((item) => item.restoreCount > 0) || restoreDrillSignals.some((item) => item.signal === "restore-command" && item.readiness === "ready");
  const hasStorage = backupSetups.some((item) => item.storageCount > 0) || safetySignals.some((item) => ["storage-location", "snapshot-location", "external-repository"].includes(item.signal) && item.readiness === "ready");
  const hasRetention = backupSetups.some((item) => item.retentionCount > 0) || safetySignals.some((item) => ["retention-policy", "prune-policy"].includes(item.signal) && item.readiness === "ready");
  const hasVerification = backupSetups.some((item) => item.verificationCount > 0) || safetySignals.some((item) => item.signal === "verification-check" && item.readiness === "ready") || restoreDrillSignals.some((item) => ["integrity-check", "read-data"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: BackupReadinessReport["riskQueue"] = [];
  if (!hasTool) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit backup tooling or documented backup scripts before claiming backup readiness.",
      why: "Backup readiness needs concrete Velero, Litestream, restic, workflow, or script evidence instead of generic operational notes.",
      relatedHref: "html/backup-readiness.html"
    });
  }
  if (hasTool && !hasBackup) {
    riskQueue.push({
      priority: "high",
      action: "Document the actual backup or replication command/resource.",
      why: "A backup system without a backup resource, replication process, or backup command cannot explain what data is protected.",
      relatedHref: "html/backup-readiness.html"
    });
  }
  if (hasTool && !hasRestore) {
    riskQueue.push({
      priority: "high",
      action: "Add a restore command or restore runbook.",
      why: "The restore path is the operational proof of backup value; static readiness should surface it next to backup creation.",
      relatedHref: "html/backup-readiness.html"
    });
  }
  if (hasTool && !hasStorage) {
    riskQueue.push({
      priority: "medium",
      action: "Record storage location, snapshot location, replica URL, or repository configuration.",
      why: "Learners need to know where backup data lands before reviewing retention, credentials, or recovery blast radius.",
      relatedHref: "html/backup-readiness.html"
    });
  }
  if (hasTool && !hasRetention) {
    riskQueue.push({
      priority: "medium",
      action: "Add retention, TTL, forget, prune, or keep policy evidence.",
      why: "Backups without retention policy can silently grow forever or expire too early.",
      relatedHref: "html/backup-readiness.html"
    });
  }
  if (hasTool && !hasVerification) {
    riskQueue.push({
      priority: "low",
      action: "Add integrity checks, read-data checks, describe/log commands, or restore drill validation.",
      why: "Backup workflows should prove recoverability, not only create backup artifacts.",
      relatedHref: "html/backup-readiness.html"
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

  return {
    summary: `Backup readiness report: setup ${backupSetups.length}개, Velero signal ${veleroSignals.length}개, Litestream signal ${litestreamSignals.length}개, restic signal ${resticSignals.length}개, restore drill signal ${restoreDrillSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Backup readiness Velero Backup Schedule Restore BackupStorageLocation VolumeSnapshotLocation includedNamespaces excludedNamespaces ttl storageLocation snapshotVolumes defaultVolumesToFsBackup backup describe logs restore describe Litestream litestream.yml dbs path replicas s3 gcs azure snapshot interval retention replicate restore databases Restic RESTIC_REPOSITORY RESTIC_PASSWORD_FILE init backup snapshots restore forget prune check read-data tags exclude",
    backupSetups,
    veleroSignals,
    litestreamSignals,
    resticSignals,
    restoreDrillSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "velero backup create <name> --include-namespaces <namespace> --wait", purpose: "Create and wait for a scoped Kubernetes backup after reviewing namespace and volume scope." },
      { command: "velero backup describe <name>", purpose: "Inspect backup phase, included resources, storage location, and warnings." },
      { command: "velero backup logs <name>", purpose: "Read backup logs during a controlled drill without changing cluster resources." },
      { command: "velero restore create --from-backup <name> --wait", purpose: "Run a restore drill from a known backup in a trusted target namespace." },
      { command: "litestream replicate -config litestream.yml", purpose: "Start SQLite replication after reviewing db paths, replica URLs, and retention." },
      { command: "litestream restore -o <db-path> <replica-url>", purpose: "Restore a SQLite database copy from the configured replica." },
      { command: "restic backup <path> --tag <service>", purpose: "Create an encrypted restic snapshot for a scoped data path." },
      { command: "restic forget --keep-daily 7 --keep-weekly 4 --prune", purpose: "Apply retention policy and prune unneeded repository data after review." },
      { command: "restic check --read-data-subset=5%", purpose: "Verify repository integrity with bounded data reads." },
      { command: "restic restore latest --target <restore-dir>", purpose: "Restore the latest snapshot into a separate target directory for validation." }
    ],
    learnerNextSteps: [
      "Open Backup Readiness and identify whether the repo uses Velero, Litestream, restic, scripts, or workflows.",
      "Map backup creation or replication first, then map the restore command or restore resource.",
      "Trace storage locations, replica URLs, snapshot locations, repository env vars, and credential indirection before trusting a backup path.",
      "Review TTL, retention, forget, prune, and keep policy evidence so backup cost and expiry behavior are visible.",
      "Look for describe, logs, check, read-data, and restore drill commands that prove recoverability.",
      "Run the recommended commands only in trusted infrastructure; RepoTutor records backup readiness statically and does not contact clusters, object stores, repositories, or restore data."
    ]
  };
}

type BackupSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function backupSourceFiles(walk: WalkResult): Promise<BackupSourceFile[]> {
  const files: BackupSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !backupInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!backupPathSignal(file.relPath) && !backupContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function backupInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return backupPathSignal(filePath)
    || /(^|\/)(README|docs?|runbooks?|backup|backups|restore|recovery|disaster|dr|ops|scripts?|bin|k8s|kubernetes|manifests?|deploy|infra|config|cron|workflows?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|docker-compose\.ya?ml|compose\.ya?ml)$/i.test(base);
}

function backupPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)(velero|litestream|restic|backup|restore|recovery|disaster|dr)(\/|\.|-|_|$)/i.test(filePath)
    || /^\.github\/workflows\/.*(backup|restore|recovery|velero|litestream|restic).*\.(ya?ml)$/i.test(filePath)
    || /^(litestream\.ya?ml|restic.*|backup.*|restore.*|velero.*)\.(ya?ml|json|md|sh|bash|txt)$/i.test(base);
}

function backupContentSignal(text: string): boolean {
  return /(velero\s+(backup|schedule|restore|install|plugin)|kind\s*:\s*(Backup|Schedule|Restore|BackupStorageLocation|VolumeSnapshotLocation)\b|litestream\s+(replicate|restore|databases)|litestream\.ya?ml|(^|\n)\s*dbs\s*:|(^|\n)\s*replicas\s*:|restic\s+(init|backup|snapshots|restore|forget|prune|check)|RESTIC_REPOSITORY|RESTIC_PASSWORD|restore drill|point[- ]in[- ]time|backup retention)/i.test(text);
}

function backupSetupFiles(sourceFiles: BackupSourceFile[]): BackupReadinessReport["backupSetups"] {
  const rows: BackupReadinessReport["backupSetups"] = [];
  for (const source of sourceFiles) {
    const backupCount = countMatches(source.text, /kind\s*:\s*Backup\b|velero\s+backup\s+create\b|restic\s+backup\b|litestream\s+replicate\b|(^|\n)\s*backup\s*:/gi);
    const restoreCount = countMatches(source.text, /kind\s*:\s*Restore\b|velero\s+restore\s+create\b|restic\s+restore\b|litestream\s+restore\b|(^|\n)\s*restore\s*:/gi);
    const scheduleCount = countMatches(source.text, /kind\s*:\s*Schedule\b|velero\s+schedule\s+create\b|schedule\s*:|cron|crontab/gi);
    const storageCount = countMatches(source.text, /BackupStorageLocation|VolumeSnapshotLocation|storageLocation\s*:|volumeSnapshotLocations\s*:|replicas\s*:|s3:\/\/|gcs:\/\/|abs:\/\/|azure|RESTIC_REPOSITORY|--repo\b/gi);
    const retentionCount = countMatches(source.text, /ttl\s*:|retention\s*:|forget\b|prune\b|--keep-(daily|weekly|monthly|yearly|last)\b/gi);
    const verificationCount = countMatches(source.text, /velero\s+backup\s+(describe|logs|get)\b|velero\s+restore\s+describe\b|restic\s+check\b|--read-data|litestream\s+databases\b|--wait\b|restore drill/gi);
    const totalSignals = backupCount + restoreCount + scheduleCount + storageCount + retentionCount + verificationCount;
    if (totalSignals === 0 && !backupPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: backupTool(source),
      backupCount,
      restoreCount,
      scheduleCount,
      storageCount,
      retentionCount,
      verificationCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} backup/restore signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.backupCount + b.restoreCount + b.storageCount + b.retentionCount + b.verificationCount;
    const aScore = a.backupCount + a.restoreCount + a.storageCount + a.retentionCount + a.verificationCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function backupTool(source: BackupSourceFile): BackupReadinessReport["backupSetups"][number]["tool"] {
  const velero = /velero|BackupStorageLocation|VolumeSnapshotLocation|kind\s*:\s*(Backup|Schedule|Restore)\b/i.test(source.filePath) || /velero|BackupStorageLocation|VolumeSnapshotLocation|kind\s*:\s*(Backup|Schedule|Restore)\b/i.test(source.text);
  const litestream = /litestream/i.test(source.filePath) || /litestream|(^|\n)\s*dbs\s*:|(^|\n)\s*replicas\s*:/i.test(source.text);
  const restic = /restic/i.test(source.filePath) || /restic|RESTIC_REPOSITORY|RESTIC_PASSWORD/i.test(source.text);
  const count = [velero, litestream, restic].filter(Boolean).length;
  if (count > 1) return "hybrid";
  if (velero) return "velero";
  if (litestream) return "litestream";
  if (restic) return "restic";
  if (/\.github\/workflows\/.*\.ya?ml$/i.test(source.filePath)) return "workflow";
  if (/\.(sh|bash|zsh)$/i.test(source.filePath) || /^(Makefile|Taskfile\.ya?ml|justfile|package\.json)$/i.test(path.basename(source.filePath))) return "script";
  if (/^README\.md$/i.test(path.basename(source.filePath))) return "readme";
  return "unknown";
}

function backupVeleroSignals(sourceFiles: BackupSourceFile[]): BackupReadinessReport["veleroSignals"] {
  const specs: Array<{ signal: BackupReadinessReport["veleroSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "backup", pattern: /kind\s*:\s*Backup\b|velero\s+backup\s+create\b/i, evidence: "Velero Backup evidence was detected." },
    { signal: "schedule", pattern: /kind\s*:\s*Schedule\b|velero\s+schedule\s+create\b/i, evidence: "Velero Schedule evidence was detected." },
    { signal: "restore", pattern: /kind\s*:\s*Restore\b|velero\s+restore\s+create\b/i, evidence: "Velero Restore evidence was detected." },
    { signal: "backup-storage-location", pattern: /kind\s*:\s*BackupStorageLocation\b|BackupStorageLocation/i, evidence: "BackupStorageLocation evidence was detected." },
    { signal: "volume-snapshot-location", pattern: /kind\s*:\s*VolumeSnapshotLocation\b|VolumeSnapshotLocation/i, evidence: "VolumeSnapshotLocation evidence was detected." },
    { signal: "included-namespaces", pattern: /includedNamespaces\s*:|--include-namespaces\b/i, evidence: "included namespace scope evidence was detected." },
    { signal: "excluded-namespaces", pattern: /excludedNamespaces\s*:|--exclude-namespaces\b/i, evidence: "excluded namespace scope evidence was detected." },
    { signal: "ttl", pattern: /ttl\s*:|--ttl\b/i, evidence: "TTL evidence was detected." },
    { signal: "storage-location", pattern: /storageLocation\s*:|--storage-location\b/i, evidence: "storage location evidence was detected." },
    { signal: "volume-snapshot", pattern: /snapshotVolumes\s*:|volumeSnapshotLocations\s*:|--snapshot-volumes\b/i, evidence: "volume snapshot evidence was detected." },
    { signal: "fs-backup", pattern: /defaultVolumesToFsBackup\s*:|--default-volumes-to-fs-backup|file-system backup/i, evidence: "file-system backup evidence was detected." },
    { signal: "backup-describe", pattern: /velero\s+backup\s+describe\b/i, evidence: "backup describe evidence was detected." },
    { signal: "backup-logs", pattern: /velero\s+backup\s+logs\b/i, evidence: "backup logs evidence was detected." },
    { signal: "restore-describe", pattern: /velero\s+restore\s+describe\b/i, evidence: "restore describe evidence was detected." }
  ];
  return backupSignalFromSpecs(sourceFiles, specs, "velero", "signal");
}

function backupLitestreamSignals(sourceFiles: BackupSourceFile[]): BackupReadinessReport["litestreamSignals"] {
  const specs: Array<{ signal: BackupReadinessReport["litestreamSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "config", pattern: /litestream\.ya?ml|(^|\n)\s*dbs\s*:/i, evidence: "Litestream config evidence was detected." },
    { signal: "db-path", pattern: /(^|\n)\s*-\s*path\s*:|(^|\n)\s*path\s*:\s*.*\.db\b/i, evidence: "database path evidence was detected." },
    { signal: "replica-url", pattern: /replicas\s*:|(^|\n)\s*url\s*:\s*(s3|gcs|abs|file):/i, evidence: "replica URL evidence was detected." },
    { signal: "s3", pattern: /s3:\/\//i, evidence: "S3 replica evidence was detected." },
    { signal: "gcs", pattern: /gcs:\/\//i, evidence: "GCS replica evidence was detected." },
    { signal: "azure", pattern: /abs:\/\/|azure|blob/i, evidence: "Azure Blob replica evidence was detected." },
    { signal: "snapshot-interval", pattern: /snapshot\s*:|interval\s*:/i, evidence: "snapshot interval evidence was detected." },
    { signal: "snapshot-retention", pattern: /retention\s*:/i, evidence: "snapshot retention evidence was detected." },
    { signal: "replicate-command", pattern: /litestream\s+replicate\b/i, evidence: "litestream replicate evidence was detected." },
    { signal: "restore-command", pattern: /litestream\s+restore\b/i, evidence: "litestream restore evidence was detected." },
    { signal: "database-command", pattern: /litestream\s+databases\b/i, evidence: "litestream databases evidence was detected." }
  ];
  return backupSignalFromSpecs(sourceFiles, specs, "litestream", "signal");
}

function backupResticSignals(sourceFiles: BackupSourceFile[]): BackupReadinessReport["resticSignals"] {
  const specs: Array<{ signal: BackupReadinessReport["resticSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "repository", pattern: /RESTIC_REPOSITORY|--repo\b|-r\s+\S+|restic\s+-r\b/i, evidence: "restic repository evidence was detected." },
    { signal: "password-file", pattern: /RESTIC_PASSWORD_FILE|RESTIC_PASSWORD_COMMAND|--password-file\b/i, evidence: "restic password indirection evidence was detected." },
    { signal: "init", pattern: /restic\s+init\b/i, evidence: "restic init evidence was detected." },
    { signal: "backup-command", pattern: /restic\s+backup\b/i, evidence: "restic backup evidence was detected." },
    { signal: "snapshots-command", pattern: /restic\s+snapshots\b/i, evidence: "restic snapshots evidence was detected." },
    { signal: "restore-command", pattern: /restic\s+restore\b/i, evidence: "restic restore evidence was detected." },
    { signal: "forget-prune", pattern: /restic\s+forget\b|restic\s+prune\b|--prune\b/i, evidence: "restic forget/prune evidence was detected." },
    { signal: "check", pattern: /restic\s+check\b/i, evidence: "restic check evidence was detected." },
    { signal: "tags", pattern: /--tag\b|--tags\b/i, evidence: "restic tag evidence was detected." },
    { signal: "exclude", pattern: /--exclude\b|--iexclude\b|exclude-file/i, evidence: "restic exclude evidence was detected." },
    { signal: "read-data", pattern: /--read-data\b|--read-data-subset\b/i, evidence: "restic read-data evidence was detected." }
  ];
  return backupSignalFromSpecs(sourceFiles, specs, "restic", "signal");
}

function backupRestoreDrillSignals(sourceFiles: BackupSourceFile[]): BackupReadinessReport["restoreDrillSignals"] {
  const specs: Array<{ signal: BackupReadinessReport["restoreDrillSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "restore-runbook", pattern: /restore drill|restore runbook|disaster recovery|recovery drill/i, evidence: "restore runbook evidence was detected." },
    { signal: "restore-command", pattern: /velero\s+restore\s+create|litestream\s+restore|restic\s+restore|kind\s*:\s*Restore\b/i, evidence: "restore command evidence was detected." },
    { signal: "point-in-time", pattern: /point[- ]in[- ]time|PITR|timestamp|generation|wal/i, evidence: "point-in-time recovery evidence was detected." },
    { signal: "wait", pattern: /--wait\b|kubectl\s+wait\b/i, evidence: "wait evidence was detected." },
    { signal: "describe", pattern: /velero\s+(backup|restore)\s+describe\b|kubectl\s+describe\b/i, evidence: "describe evidence was detected." },
    { signal: "logs", pattern: /velero\s+backup\s+logs\b|kubectl\s+logs\b/i, evidence: "log inspection evidence was detected." },
    { signal: "integrity-check", pattern: /restic\s+check\b|checksum|integrity/i, evidence: "integrity check evidence was detected." },
    { signal: "read-data", pattern: /--read-data\b|--read-data-subset\b/i, evidence: "read-data evidence was detected." },
    { signal: "target-path", pattern: /--target\b|--from-backup\b|-o\s+\S+\.db\b|target directory/i, evidence: "restore target evidence was detected." }
  ];
  return backupSignalFromSpecs(sourceFiles, specs, "restore drill", "signal");
}

function backupSafetySignals(sourceFiles: BackupSourceFile[]): BackupReadinessReport["safetySignals"] {
  const specs: Array<{ signal: BackupReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "retention-policy", pattern: /retention\s*:|ttl\s*:|--ttl\b|--keep-(daily|weekly|monthly|yearly|last)\b/i, evidence: "retention policy evidence was detected." },
    { signal: "encrypted-secret", pattern: /RESTIC_PASSWORD_FILE|RESTIC_PASSWORD_COMMAND|secretRef\s*:|credential|password-file|\/run\/secrets/i, evidence: "credential indirection evidence was detected." },
    { signal: "namespace-scope", pattern: /includedNamespaces\s*:|excludedNamespaces\s*:|--include-namespaces|--exclude-namespaces|namespace\s*:/i, evidence: "namespace scope evidence was detected." },
    { signal: "storage-location", pattern: /BackupStorageLocation|storageLocation\s*:|s3:\/\/|gcs:\/\/|RESTIC_REPOSITORY|replica/i, evidence: "storage location evidence was detected." },
    { signal: "snapshot-location", pattern: /VolumeSnapshotLocation|volumeSnapshotLocations\s*:|snapshotVolumes\s*:/i, evidence: "snapshot location evidence was detected." },
    { signal: "verification-check", pattern: /restic\s+check\b|velero\s+backup\s+(describe|logs|get)\b|litestream\s+databases\b/i, evidence: "verification check evidence was detected." },
    { signal: "prune-policy", pattern: /forget\b|prune\b|--prune\b/i, evidence: "prune policy evidence was detected." },
    { signal: "restore-drill", pattern: /restore drill|velero\s+restore\s+create|litestream\s+restore|restic\s+restore|kind\s*:\s*Restore\b/i, evidence: "restore drill evidence was detected." },
    { signal: "external-repository", pattern: /s3:\/\/|gcs:\/\/|abs:\/\/|RESTIC_REPOSITORY|objectStorage\s*:|bucket\s*:/i, evidence: "external repository evidence was detected." }
  ];
  return backupSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function backupPackageSignals(sourceFiles: BackupSourceFile[]): BackupReadinessReport["packageSignals"] {
  const specs: Array<{ signal: BackupReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "velero", pattern: /(^|\W)velero(\W|$)|velero\.io|BackupStorageLocation|VolumeSnapshotLocation/i, evidence: "Velero evidence was detected." },
    { signal: "litestream", pattern: /(^|\W)litestream(\W|$)|litestream\.ya?ml/i, evidence: "Litestream evidence was detected." },
    { signal: "restic", pattern: /(^|\W)restic(\W|$)|RESTIC_REPOSITORY/i, evidence: "restic evidence was detected." },
    { signal: "backup-script", pattern: /backup.*\.(sh|bash|zsh)|restore.*\.(sh|bash|zsh)|backup:/i, evidence: "backup script evidence was detected." },
    { signal: "cron", pattern: /cron|crontab|schedule\s*:|0\s+\d+\s+\*\s+\*\s+\*/i, evidence: "cron/schedule evidence was detected." },
    { signal: "workflow", pattern: /\.github\/workflows\/|workflow_dispatch|schedule:/i, evidence: "workflow evidence was detected." }
  ];
  return backupSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function backupSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BackupSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/backup-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
