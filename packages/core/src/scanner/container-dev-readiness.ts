import path from "node:path";
import type { ComposeReadinessReport, DevContainerReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildComposeReadinessReport(walk: WalkResult): Promise<ComposeReadinessReport> {
  const sourceFiles = await composeSourceFiles(walk);
  const composeSetups = composeSetupFiles(sourceFiles);
  const configSignals = composeConfigSignals(sourceFiles);
  const serviceSignals = composeServiceSignals(sourceFiles);
  const dependencySignals = composeDependencySignals(sourceFiles);
  const resourceSignals = composeResourceSignals(sourceFiles);
  const workflowSignals = composeWorkflowSignals(sourceFiles);
  const safetySignals = composeSafetySignals(sourceFiles);
  const packageSignals = composePackageSignals(sourceFiles);

  const hasConfig = composeSetups.some((item) => ["compose-yaml", "docker-compose-yaml", "override"].includes(item.format)) || configSignals.some((item) => item.readiness === "ready");
  const hasServices = composeSetups.some((item) => item.serviceCount > 0) || configSignals.some((item) => item.signal === "services" && item.readiness === "ready");
  const hasHealthOrDependency = dependencySignals.some((item) => ["depends-on", "service-healthy", "healthcheck"].includes(item.signal) && item.readiness === "ready") || composeSetups.some((item) => item.dependencyCount > 0 || item.healthcheckCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || composeSetups.some((item) => item.commandCount > 0);
  const hasResourceOrEnv = resourceSignals.some((item) => item.readiness === "ready") || composeSetups.some((item) => item.volumeCount > 0 || item.networkCount > 0 || item.envCount > 0 || item.secretConfigCount > 0);

  const riskQueue: ComposeReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add or document Compose configuration if this project has multi-service local runtime topology.",
      why: "Docker Compose readiness starts from compose.yaml or docker-compose.yml with visible services, images/builds, ports, networks, and volumes.",
      relatedHref: "html/compose-readiness.html"
    });
  }
  if (hasConfig && !hasServices) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit services to the Compose inventory.",
      why: "A Compose file without visible services cannot explain what processes start together or which image/build path owns each runtime.",
      relatedHref: "html/compose-readiness.html"
    });
  }
  if (hasConfig && !hasHealthOrDependency) {
    riskQueue.push({
      priority: "medium",
      action: "Document service dependencies, healthchecks, or startup order before relying on Compose for repeatable local runs.",
      why: "depends_on, healthcheck, and service_healthy evidence help learners understand when a stack is actually ready.",
      relatedHref: "html/compose-readiness.html"
    });
  }
  if (hasConfig && !hasWorkflow) {
    riskQueue.push({
      priority: "medium",
      action: "Add repeatable docker compose commands for config validation, startup, inspection, logs, and teardown.",
      why: "docker compose config/up/ps/logs/down commands make the topology actionable without guessing at runtime.",
      relatedHref: "html/compose-readiness.html"
    });
  }
  if (hasConfig && !hasResourceOrEnv) {
    riskQueue.push({
      priority: "low",
      action: "Document environment, volume, network, secret, or config resources that services depend on.",
      why: "Compose stacks often fail because resource wiring is implicit; explicit resource signals make local state easier to audit.",
      relatedHref: "html/compose-readiness.html"
    });
  }

  return {
    summary: `Docker Compose readiness report: setup ${composeSetups.length}개, config signal ${configSignals.length}개, service signal ${serviceSignals.length}개, workflow signal ${workflowSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Docker Compose compose.yaml docker-compose.yml services build image ports volumes networks depends_on healthcheck profiles env_file secrets configs docker compose config up build run logs ps watch wait",
    composeSetups,
    configSignals,
    serviceSignals,
    dependencySignals,
    resourceSignals,
    workflowSignals,
    safetySignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "docker compose config", purpose: "Validate and render the Compose model before starting containers." },
      { command: "docker compose up --no-start", purpose: "Create the stack without starting services when you need a low-risk dry run." },
      { command: "docker compose up -d", purpose: "Start the stack in detached mode after config, resources, and healthchecks are reviewed." },
      { command: "docker compose ps", purpose: "Inspect service state and health after startup." },
      { command: "docker compose logs <service>", purpose: "Read a specific service log stream during local debugging." },
      { command: "docker compose down --remove-orphans", purpose: "Tear down containers and remove stale service containers after a smoke run." }
    ],
    learnerNextSteps: [
      "Open Compose Readiness and identify the Compose file that defines the local runtime topology.",
      "Map each service to its image or build context, exposed ports, volumes, networks, and environment inputs.",
      "Check depends_on, healthcheck, and service_healthy evidence before assuming startup order is reliable.",
      "Review docker compose config/up/ps/logs/down commands before changing local stack behavior."
    ]
  };
}

type ComposeSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function composeSourceFiles(walk: WalkResult): Promise<ComposeSourceFile[]> {
  const files: ComposeSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !composeInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!composePathSignal(file.relPath) && !composeContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function composeInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return composePathSignal(filePath)
    || /(^|\/)(README|docs?|src|docker|compose|containers?|services?|infra|infrastructure|scripts?|ci|workflows?|dev|local|test|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|Dockerfile(\..+)?|\.env(\..+)?|\.env)$/i.test(base);
}

function composePathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(compose|docker-compose)(\.override)?\.ya?ml$/i.test(base)
    || /^\.env(\..+)?$/i.test(base)
    || /^Dockerfile(\..+)?$/i.test(base)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath);
}

function composeContentSignal(text: string): boolean {
  return /(Docker Compose|docker\s+compose|docker-compose|(^|\n)\s*services\s*:|(^|\n)\s*depends_on\s*:|(^|\n)\s*healthcheck\s*:|(^|\n)\s*profiles\s*:|(^|\n)\s*env_file\s*:|(^|\n)\s*secrets\s*:|(^|\n)\s*configs\s*:|(^|\n)\s*networks\s*:|(^|\n)\s*volumes\s*:)/i.test(text);
}

function composeSetupFiles(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["composeSetups"] {
  const rows: ComposeReadinessReport["composeSetups"] = [];
  for (const source of sourceFiles) {
    const serviceCount = countMatches(source.text, /(^|\n)\s{2}[A-Za-z0-9_.-]+\s*:\s*\n\s{4}(build|image|command|entrypoint|ports|expose|depends_on|environment|env_file|volumes|networks|profiles|restart)\s*:/gm);
    const buildCount = countMatches(source.text, /(^|\n)\s*build\s*:|(^|\n)\s*context\s*:|(^|\n)\s*dockerfile\s*:|(^|\n)\s*FROM\s+\S+/gim);
    const imageCount = countMatches(source.text, /(^|\n)\s*image\s*:/gm);
    const portCount = countMatches(source.text, /(^|\n)\s*(ports|expose)\s*:|["']?\d{2,5}:\d{2,5}["']?/gm);
    const volumeCount = countMatches(source.text, /(^|\n)\s*volumes\s*:|(^|\n)\s*-\s*[^:\n]+:[^:\n]+/gm);
    const networkCount = countMatches(source.text, /(^|\n)\s*networks\s*:|(^|\n)\s*aliases\s*:|(^|\n)\s*external\s*:\s*true/gim);
    const dependencyCount = countMatches(source.text, /(^|\n)\s*depends_on\s*:|(^|\n)\s*condition\s*:|(^|\n)\s*links\s*:/gm);
    const healthcheckCount = countMatches(source.text, /(^|\n)\s*healthcheck\s*:|(^|\n)\s*test\s*:|(^|\n)\s*interval\s*:|(^|\n)\s*timeout\s*:|(^|\n)\s*retries\s*:/gm);
    const envCount = countMatches(source.text, /(^|\n)\s*environment\s*:|(^|\n)\s*env_file\s*:|(^|\n)[A-Z][A-Z0-9_]*=/gm);
    const secretConfigCount = countMatches(source.text, /(^|\n)\s*(secrets|configs)\s*:|\/run\/secrets|(^|\n)\s*file\s*:/gm);
    const profileCount = countMatches(source.text, /(^|\n)\s*profiles\s*:|COMPOSE_PROFILES/gm);
    const commandCount = countMatches(source.text, /docker\s+compose\s+(config|up|down|build|run|exec|logs|ps|pull|watch|wait|restart|start|stop)|docker-compose\s+(config|up|down|build|run|exec|logs|ps|pull|restart|start|stop)/gi);
    const totalSignals = serviceCount + buildCount + imageCount + portCount + volumeCount + networkCount + dependencyCount + healthcheckCount + envCount + secretConfigCount + profileCount + commandCount;
    if (totalSignals === 0 && !composePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      format: composeFormat(source),
      serviceCount,
      buildCount,
      imageCount,
      portCount,
      volumeCount,
      networkCount,
      dependencyCount,
      healthcheckCount,
      envCount,
      secretConfigCount,
      profileCount,
      commandCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} compose topology signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.serviceCount + b.buildCount + b.imageCount + b.dependencyCount + b.healthcheckCount + b.commandCount;
    const aScore = a.serviceCount + a.buildCount + a.imageCount + a.dependencyCount + a.healthcheckCount + a.commandCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function composeFormat(source: ComposeSourceFile): ComposeReadinessReport["composeSetups"][number]["format"] {
  const base = path.basename(source.filePath).toLowerCase();
  if (/^docker-compose\.override\.ya?ml$/.test(base) || /^compose\.override\.ya?ml$/.test(base)) return "override";
  if (/^docker-compose\.ya?ml$/.test(base)) return "docker-compose-yaml";
  if (/^compose\.ya?ml$/.test(base)) return "compose-yaml";
  if (/^\.env(\..+)?$/.test(base)) return "env-file";
  if (/^(package\.json|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base) || /docker\s+compose|docker-compose/i.test(source.text)) return "package-script";
  return "unknown";
}

function composeConfigSignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["configSignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "compose-yaml", pattern: /(^|\/)compose\.ya?ml$/i, evidence: "compose.yaml evidence was detected." },
    { signal: "docker-compose-yaml", pattern: /(^|\/)docker-compose\.ya?ml$/i, evidence: "docker-compose.yml evidence was detected." },
    { signal: "override-file", pattern: /(^|\/)(compose|docker-compose)\.override\.ya?ml$/i, evidence: "Compose override file evidence was detected." },
    { signal: "services", pattern: /(^|\n)\s*services\s*:/i, evidence: "services block evidence was detected." },
    { signal: "name", pattern: /(^|\n)\s*name\s*:/i, evidence: "project name evidence was detected." },
    { signal: "include", pattern: /(^|\n)\s*include\s*:/i, evidence: "include evidence was detected." },
    { signal: "extends", pattern: /(^|\n)\s*extends\s*:/i, evidence: "extends evidence was detected." },
    { signal: "x-extension", pattern: /(^|\n)\s*x-[A-Za-z0-9_.-]+\s*:/i, evidence: "Compose extension field evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function composeServiceSignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["serviceSignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["serviceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build", pattern: /(^|\n)\s*build\s*:|(^|\n)\s*context\s*:|(^|\n)\s*dockerfile\s*:/i, evidence: "service build evidence was detected." },
    { signal: "image", pattern: /(^|\n)\s*image\s*:/i, evidence: "service image evidence was detected." },
    { signal: "command", pattern: /(^|\n)\s*command\s*:/i, evidence: "service command evidence was detected." },
    { signal: "entrypoint", pattern: /(^|\n)\s*entrypoint\s*:/i, evidence: "service entrypoint evidence was detected." },
    { signal: "ports", pattern: /(^|\n)\s*ports\s*:|["']?\d{2,5}:\d{2,5}["']?/i, evidence: "service ports evidence was detected." },
    { signal: "expose", pattern: /(^|\n)\s*expose\s*:/i, evidence: "service expose evidence was detected." },
    { signal: "restart", pattern: /(^|\n)\s*restart\s*:/i, evidence: "restart policy evidence was detected." },
    { signal: "profiles", pattern: /(^|\n)\s*profiles\s*:/i, evidence: "profiles evidence was detected." },
    { signal: "scale-deploy", pattern: /(^|\n)\s*deploy\s*:|(^|\n)\s*replicas\s*:|(^|\n)\s*resources\s*:/i, evidence: "deploy/scale evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "service", "signal");
}

function composeDependencySignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["dependencySignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["dependencySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "depends-on", pattern: /(^|\n)\s*depends_on\s*:/i, evidence: "depends_on evidence was detected." },
    { signal: "service-healthy", pattern: /service_healthy/i, evidence: "service_healthy condition evidence was detected." },
    { signal: "healthcheck", pattern: /(^|\n)\s*healthcheck\s*:|(^|\n)\s*test\s*:/i, evidence: "healthcheck evidence was detected." },
    { signal: "links", pattern: /(^|\n)\s*links\s*:/i, evidence: "legacy links evidence was detected." },
    { signal: "external-network", pattern: /(^|\n)\s*external\s*:\s*true/i, evidence: "external network evidence was detected." },
    { signal: "aliases", pattern: /(^|\n)\s*aliases\s*:/i, evidence: "network aliases evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "dependency", "signal");
}

function composeResourceSignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["resourceSignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["resourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "volumes", pattern: /(^|\n)\s*volumes\s*:/i, evidence: "volume evidence was detected." },
    { signal: "bind-mounts", pattern: /(^|\n)\s*-\s*\.{1,2}(:|\/)/i, evidence: "bind mount evidence was detected." },
    { signal: "named-volumes", pattern: /(^|\n)\s{2,}[A-Za-z0-9_.-]+:\s*(\n|$)/i, evidence: "named volume style evidence was detected." },
    { signal: "networks", pattern: /(^|\n)\s*networks\s*:/i, evidence: "network evidence was detected." },
    { signal: "secrets", pattern: /(^|\n)\s*secrets\s*:|\/run\/secrets/i, evidence: "secrets evidence was detected." },
    { signal: "configs", pattern: /(^|\n)\s*configs\s*:/i, evidence: "configs evidence was detected." },
    { signal: "env-file", pattern: /(^|\n)\s*env_file\s*:|(^|\/)\.env(\..+)?$/i, evidence: "env_file evidence was detected." },
    { signal: "environment", pattern: /(^|\n)\s*environment\s*:|(^|\n)[A-Z][A-Z0-9_]*=/i, evidence: "environment evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "resource", "signal");
}

function composeWorkflowSignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "config", pattern: /docker\s+compose\s+config|docker-compose\s+config/i, evidence: "config command evidence was detected." },
    { signal: "up", pattern: /docker\s+compose\s+up|docker-compose\s+up/i, evidence: "up command evidence was detected." },
    { signal: "down", pattern: /docker\s+compose\s+down|docker-compose\s+down/i, evidence: "down command evidence was detected." },
    { signal: "build", pattern: /docker\s+compose\s+build|docker-compose\s+build/i, evidence: "build command evidence was detected." },
    { signal: "run", pattern: /docker\s+compose\s+run|docker-compose\s+run/i, evidence: "run command evidence was detected." },
    { signal: "exec", pattern: /docker\s+compose\s+exec|docker-compose\s+exec/i, evidence: "exec command evidence was detected." },
    { signal: "logs", pattern: /docker\s+compose\s+logs|docker-compose\s+logs/i, evidence: "logs command evidence was detected." },
    { signal: "ps", pattern: /docker\s+compose\s+ps|docker-compose\s+ps/i, evidence: "ps command evidence was detected." },
    { signal: "pull", pattern: /docker\s+compose\s+pull|docker-compose\s+pull/i, evidence: "pull command evidence was detected." },
    { signal: "watch", pattern: /docker\s+compose\s+watch/i, evidence: "watch command evidence was detected." },
    { signal: "wait", pattern: /docker\s+compose\s+wait/i, evidence: "wait command evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function composeSafetySignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "healthcheck", pattern: /(^|\n)\s*healthcheck\s*:/i, evidence: "healthcheck safety evidence was detected." },
    { signal: "restart-policy", pattern: /(^|\n)\s*restart\s*:/i, evidence: "restart policy evidence was detected." },
    { signal: "profiles", pattern: /(^|\n)\s*profiles\s*:|COMPOSE_PROFILES/i, evidence: "profile gating evidence was detected." },
    { signal: "resource-limits", pattern: /(^|\n)\s*(resources|limits|cpus|mem_limit)\s*:/i, evidence: "resource limit evidence was detected." },
    { signal: "read-only", pattern: /(^|\n)\s*read_only\s*:\s*true/i, evidence: "read-only container evidence was detected." },
    { signal: "cap-drop", pattern: /(^|\n)\s*cap_drop\s*:/i, evidence: "cap_drop evidence was detected." },
    { signal: "security-opt", pattern: /(^|\n)\s*security_opt\s*:/i, evidence: "security_opt evidence was detected." },
    { signal: "secrets", pattern: /(^|\n)\s*secrets\s*:|\/run\/secrets/i, evidence: "secrets safety evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function composePackageSignals(sourceFiles: ComposeSourceFile[]): ComposeReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ComposeReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "docker-compose-plugin", pattern: /docker\s+compose\s+(config|up|down|build|run|exec|logs|ps|pull|watch|wait)/i, evidence: "Docker Compose plugin command evidence was detected." },
    { signal: "docker-compose-v1", pattern: /docker-compose\s+(config|up|down|build|run|exec|logs|ps|pull)/i, evidence: "legacy docker-compose command evidence was detected." },
    { signal: "compose-spec", pattern: /compose-spec|Compose Specification|compose\.ya?ml/i, evidence: "Compose spec evidence was detected." },
    { signal: "compose-watch", pattern: /docker\s+compose\s+watch|develop\s*:|watch\s*:/i, evidence: "Compose watch evidence was detected." },
    { signal: "dockerfile", pattern: /(^|\/)Dockerfile(\..+)?$|(^|\n)\s*FROM\s+\S+/i, evidence: "Dockerfile evidence was detected." }
  ];
  return composeSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function composeSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ComposeSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/compose-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDevContainerReadinessReport(walk: WalkResult): Promise<DevContainerReadinessReport> {
  const sourceFiles = await devContainerSourceFiles(walk);
  const devContainerSetups = devContainerSetupFiles(sourceFiles);
  const configSignals = devContainerConfigSignals(sourceFiles);
  const featureSignals = devContainerFeatureSignals(sourceFiles);
  const lifecycleSignals = devContainerLifecycleSignals(sourceFiles);
  const environmentSignals = devContainerEnvironmentSignals(sourceFiles);
  const workspaceSignals = devContainerWorkspaceSignals(sourceFiles);
  const customizationSignals = devContainerCustomizationSignals(sourceFiles);
  const workflowSignals = devContainerWorkflowSignals(sourceFiles);
  const safetySignals = devContainerSafetySignals(sourceFiles);
  const packageSignals = devContainerPackageSignals(sourceFiles);

  const hasConfig = devContainerSetups.length > 0 || configSignals.some((item) => item.readiness === "ready");
  const hasRuntime = configSignals.some((item) => ["image", "build", "dockerfile", "docker-compose-file"].includes(item.signal) && item.readiness === "ready")
    || devContainerSetups.some((item) => item.imageBuildCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || devContainerSetups.some((item) => item.lifecycleCount > 0);
  const hasWorkspace = workspaceSignals.some((item) => item.readiness === "ready") || devContainerSetups.some((item) => item.mountCount > 0 || item.portCount > 0);
  const hasUser = environmentSignals.some((item) => ["remote-user", "container-user"].includes(item.signal) && item.readiness === "ready")
    || devContainerSetups.some((item) => item.userCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || devContainerSetups.some((item) => item.workflowCount > 0);
  const hasLockfile = safetySignals.some((item) => item.signal === "lockfile" && item.readiness === "ready")
    || devContainerSetups.some((item) => item.lockfileCount > 0);

  const riskQueue: DevContainerReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a .devcontainer/devcontainer.json inventory before claiming reproducible developer environment readiness.",
      why: "Dev Container readiness starts from a concrete devcontainer.json, image/build/Compose entry, workspace path, and lifecycle hooks.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  if (hasConfig && !hasRuntime) {
    riskQueue.push({
      priority: "high",
      action: "Document the image, Dockerfile build, or Compose service used to create the developer container.",
      why: "A devcontainer.json without image, build, Dockerfile, or dockerComposeFile evidence leaves the actual runtime undefined.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  if (hasConfig && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document lifecycle commands such as onCreateCommand, updateContentCommand, postCreateCommand, postStartCommand, or postAttachCommand.",
      why: "Lifecycle hooks explain how dependencies, generated files, and warmup tasks make the environment usable after creation.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  if (hasConfig && !hasWorkspace) {
    riskQueue.push({
      priority: "medium",
      action: "Trace workspaceFolder, workspaceMount, mounts, forwardPorts, and port attributes.",
      why: "Developer containers depend on correct source mounts and forwarded ports for editing, previewing, and debugging.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  if (hasConfig && !hasUser) {
    riskQueue.push({
      priority: "low",
      action: "Record remoteUser, containerUser, and UID policy before assuming host file ownership is safe.",
      why: "User and UID policy affects generated files, bind mounts, and whether learners can edit outputs after commands run.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  if (hasConfig && !hasWorkflow) {
    riskQueue.push({
      priority: "low",
      action: "Add documented devcontainer CLI commands for read-configuration, up, build, exec, and run-user-commands.",
      why: "Static config is easier to verify when the repo also names the reference CLI commands used in CI or local smoke checks.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  if (hasConfig && !hasLockfile) {
    riskQueue.push({
      priority: "low",
      action: "Consider committing .devcontainer-lock.json or documenting frozen lockfile policy for features.",
      why: "Feature resolution can drift without a lockfile or explicit frozen-lockfile command.",
      relatedHref: "html/devcontainer-readiness.html"
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;

  return {
    summary: `Dev Containers readiness report: setup ${devContainerSetups.length}개, config signal ${configSignals.length}개, feature signal ${featureSignals.length}개, lifecycle signal ${lifecycleSignals.length}개, workflow signal ${workflowSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Dev Containers devcontainer.json .devcontainer devcontainer build up exec read-configuration run-user-commands features templates postCreateCommand forwardPorts customizations remoteUser containerEnv mounts workspaceFolder",
    devContainerSetups,
    configSignals,
    featureSignals,
    lifecycleSignals,
    environmentSignals,
    workspaceSignals,
    customizationSignals,
    workflowSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "devcontainer read-configuration --workspace-folder <path>", purpose: "Render merged devcontainer.json without starting the container." },
      { command: "devcontainer up --workspace-folder <path>", purpose: "Create and configure the developer container after config, mounts, users, ports, and features are reviewed." },
      { command: "devcontainer run-user-commands --workspace-folder <path>", purpose: "Run lifecycle user commands in the container after the container exists." },
      { command: "devcontainer exec --workspace-folder <path> <cmd>", purpose: "Run a targeted smoke command inside the configured developer container." },
      { command: "devcontainer build --workspace-folder <path> --frozen-lockfile", purpose: "Build the configured container while requiring the committed feature lockfile." },
      { command: "devcontainer features test <feature-folder>", purpose: "Test local Dev Container Features before publishing or relying on them." }
    ],
    learnerNextSteps: [
      "Open Dev Container Readiness and find the primary .devcontainer/devcontainer.json file first.",
      "Map image, build.dockerfile, dockerComposeFile, service, workspaceFolder, and workspaceMount before reading lifecycle commands.",
      "Review features, devcontainer-feature.json, devcontainer-template.json, overrideFeatureInstallOrder, and .devcontainer-lock.json for reproducibility.",
      "Trace initializeCommand, onCreateCommand, updateContentCommand, postCreateCommand, postStartCommand, postAttachCommand, and waitFor in execution order.",
      "Check containerEnv, remoteEnv, secrets, remoteUser, containerUser, mounts, forwardPorts, portsAttributes, and customizations before running a container.",
      "Use the recommended devcontainer CLI commands only in a trusted runtime; RepoTutor records readiness statically and does not start containers or execute lifecycle hooks."
    ]
  };
}

type DevContainerSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function devContainerSourceFiles(walk: WalkResult): Promise<DevContainerSourceFile[]> {
  const files: DevContainerSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !devContainerInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!devContainerPathSignal(file.relPath) && !devContainerContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function devContainerInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return devContainerPathSignal(filePath)
    || /(^|\/)(README|docs?|src|scripts?|dev|container|containers?|docker|compose|ci|workflows?|test|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|Dockerfile(\..+)?|compose\.ya?ml|docker-compose\.ya?ml)$/i.test(base);
}

function devContainerPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)\.devcontainer(\/|$)/i.test(filePath)
    || /^devcontainer\.json$/i.test(base)
    || /^\.devcontainer-lock\.json$/i.test(base)
    || /^devcontainer-(feature|template)\.json$/i.test(base)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath);
}

function devContainerContentSignal(text: string): boolean {
  return /(Dev Containers?|devcontainer\.json|\.devcontainer|devcontainer\s+(read-configuration|up|build|exec|run-user-commands|features|templates|outdated|upgrade)|postCreateCommand|onCreateCommand|updateContentCommand|initializeCommand|postStartCommand|postAttachCommand|forwardPorts|portsAttributes|workspaceFolder|workspaceMount|containerEnv|remoteEnv|remoteUser|containerUser|customizations|@devcontainers\/cli|devcontainer-feature\.json|devcontainer-template\.json)/i.test(text);
}

function devContainerSetupFiles(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["devContainerSetups"] {
  const rows: DevContainerReadinessReport["devContainerSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /"?(name|image|build|dockerFile|dockerfile|dockerComposeFile|service|workspaceFolder|workspaceMount)"?\s*:/gi) + (/devcontainer\.json$/i.test(source.filePath) ? 1 : 0);
    const imageBuildCount = countMatches(source.text, /"?(image|build|dockerFile|dockerfile|dockerComposeFile|service)"?\s*:|(^|\n)\s*FROM\s+\S+|(^|\n)\s*services\s*:/gim);
    const featureCount = countMatches(source.text, /"?features"?\s*:|devcontainer-feature\.json|"?installsAfter"?\s*:|"options"\s*:|"?overrideFeatureInstallOrder"?\s*:|ghcr\.io\/devcontainers\/features/gi);
    const lifecycleCount = countMatches(source.text, /"?(initializeCommand|onCreateCommand|updateContentCommand|postCreateCommand|postStartCommand|postAttachCommand|waitFor)"?\s*:/gi);
    const environmentCount = countMatches(source.text, /"?(containerEnv|remoteEnv|userEnvProbe|secrets)"?\s*:|"?remoteUser"?\s*:|"?containerUser"?\s*:/gi);
    const mountCount = countMatches(source.text, /"?(workspaceMount|mounts)"?\s*:|source=|target=|type=(bind|volume)/gi);
    const portCount = countMatches(source.text, /"?forwardPorts"?\s*:|"?portsAttributes"?\s*:|"?otherPortsAttributes"?\s*:|onAutoForward/gi);
    const userCount = countMatches(source.text, /"?remoteUser"?\s*:|"?containerUser"?\s*:|"?updateRemoteUserUID"?\s*:/gi);
    const customizationCount = countMatches(source.text, /"?customizations"?\s*:|"?vscode"?\s*:|"?extensions"?\s*:|"?settings"?\s*:|"?codespaces"?\s*:|"?dotfiles"?\s*:/gi);
    const workflowCount = countMatches(source.text, /devcontainer\s+(read-configuration|up|build|exec|run-user-commands|features\s+(test|package)|templates|outdated|upgrade)/gi);
    const lockfileCount = countMatches(source.text, /\.devcontainer-lock\.json|--frozen-lockfile|--no-lockfile|"?lockfile"?\s*:/gi) + (/^\.devcontainer-lock\.json$/i.test(path.basename(source.filePath)) ? 1 : 0);
    const totalSignals = configCount + imageBuildCount + featureCount + lifecycleCount + environmentCount + mountCount + portCount + userCount + customizationCount + workflowCount + lockfileCount;
    if (totalSignals === 0 && !devContainerPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      format: devContainerFormat(source),
      configCount,
      imageBuildCount,
      featureCount,
      lifecycleCount,
      environmentCount,
      mountCount,
      portCount,
      userCount,
      customizationCount,
      workflowCount,
      lockfileCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} dev container signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.imageBuildCount + b.featureCount + b.lifecycleCount + b.workflowCount + b.lockfileCount;
    const aScore = a.configCount + a.imageBuildCount + a.featureCount + a.lifecycleCount + a.workflowCount + a.lockfileCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 70);
}

function devContainerFormat(source: DevContainerSourceFile): DevContainerReadinessReport["devContainerSetups"][number]["format"] {
  const base = path.basename(source.filePath).toLowerCase();
  if (base === "devcontainer.json") return "devcontainer-json";
  if (base === ".devcontainer-lock.json") return "devcontainer-lock";
  if (base === "devcontainer-feature.json") return "feature-json";
  if (base === "devcontainer-template.json") return "template-json";
  if (/^dockerfile(\..+)?$/i.test(base)) return "dockerfile";
  if (/^(compose|docker-compose)(\.override)?\.ya?ml$/i.test(base)) return "compose-file";
  if (/^(package\.json|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base)) return "package-script";
  if (/\.github\/workflows\/.*\.ya?ml$/i.test(source.filePath)) return "workflow";
  return "unknown";
}

function devContainerConfigSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["configSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "devcontainer-json", pattern: /(^|\/)(\.devcontainer\/)?devcontainer\.json$/i, evidence: "devcontainer.json evidence was detected." },
    { signal: "devcontainer-lock", pattern: /(^|\/)\.devcontainer-lock\.json$/i, evidence: "Dev Container lockfile evidence was detected." },
    { signal: "name", pattern: /"?name"?\s*:/i, evidence: "container name evidence was detected." },
    { signal: "image", pattern: /"?image"?\s*:/i, evidence: "image evidence was detected." },
    { signal: "build", pattern: /"?build"?\s*:/i, evidence: "build block evidence was detected." },
    { signal: "dockerfile", pattern: /"?docker(File|file)"?\s*:|(^|\/)Dockerfile(\..+)?$|(^|\n)\s*FROM\s+\S+/i, evidence: "Dockerfile evidence was detected." },
    { signal: "docker-compose-file", pattern: /"?dockerComposeFile"?\s*:|(^|\/)(compose|docker-compose)(\.override)?\.ya?ml$/i, evidence: "dockerComposeFile evidence was detected." },
    { signal: "service", pattern: /"?service"?\s*:/i, evidence: "Compose service evidence was detected." },
    { signal: "workspace-folder", pattern: /"?workspaceFolder"?\s*:/i, evidence: "workspaceFolder evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function devContainerFeatureSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["featureSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["featureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "features", pattern: /"?features"?\s*:|ghcr\.io\/devcontainers\/features/i, evidence: "features evidence was detected." },
    { signal: "feature-json", pattern: /(^|\/)devcontainer-feature\.json$/i, evidence: "devcontainer-feature.json evidence was detected." },
    { signal: "template-json", pattern: /(^|\/)devcontainer-template\.json$/i, evidence: "devcontainer-template.json evidence was detected." },
    { signal: "installs-after", pattern: /"?installsAfter"?\s*:/i, evidence: "installsAfter evidence was detected." },
    { signal: "options", pattern: /"?options"?\s*:/i, evidence: "feature options evidence was detected." },
    { signal: "override-feature-install-order", pattern: /"?overrideFeatureInstallOrder"?\s*:/i, evidence: "overrideFeatureInstallOrder evidence was detected." },
    { signal: "lockfile", pattern: /\.devcontainer-lock\.json|--frozen-lockfile/i, evidence: "feature lockfile evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "feature", "signal");
}

function devContainerLifecycleSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "initialize-command", pattern: /"?initializeCommand"?\s*:/i, evidence: "initializeCommand evidence was detected." },
    { signal: "on-create-command", pattern: /"?onCreateCommand"?\s*:/i, evidence: "onCreateCommand evidence was detected." },
    { signal: "update-content-command", pattern: /"?updateContentCommand"?\s*:/i, evidence: "updateContentCommand evidence was detected." },
    { signal: "post-create-command", pattern: /"?postCreateCommand"?\s*:/i, evidence: "postCreateCommand evidence was detected." },
    { signal: "post-start-command", pattern: /"?postStartCommand"?\s*:/i, evidence: "postStartCommand evidence was detected." },
    { signal: "post-attach-command", pattern: /"?postAttachCommand"?\s*:/i, evidence: "postAttachCommand evidence was detected." },
    { signal: "wait-for", pattern: /"?waitFor"?\s*:/i, evidence: "waitFor evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function devContainerEnvironmentSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["environmentSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["environmentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "container-env", pattern: /"?containerEnv"?\s*:/i, evidence: "containerEnv evidence was detected." },
    { signal: "remote-env", pattern: /"?remoteEnv"?\s*:/i, evidence: "remoteEnv evidence was detected." },
    { signal: "user-env-probe", pattern: /"?userEnvProbe"?\s*:/i, evidence: "userEnvProbe evidence was detected." },
    { signal: "secrets", pattern: /"?secrets"?\s*:/i, evidence: "secrets name mapping evidence was detected." },
    { signal: "remote-user", pattern: /"?remoteUser"?\s*:/i, evidence: "remoteUser evidence was detected." },
    { signal: "container-user", pattern: /"?containerUser"?\s*:/i, evidence: "containerUser evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "environment", "signal");
}

function devContainerWorkspaceSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["workspaceSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["workspaceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "workspace-folder", pattern: /"?workspaceFolder"?\s*:/i, evidence: "workspaceFolder evidence was detected." },
    { signal: "workspace-mount", pattern: /"?workspaceMount"?\s*:/i, evidence: "workspaceMount evidence was detected." },
    { signal: "mounts", pattern: /"?mounts"?\s*:|source=|target=|type=(bind|volume)/i, evidence: "mounts evidence was detected." },
    { signal: "forward-ports", pattern: /"?forwardPorts"?\s*:/i, evidence: "forwardPorts evidence was detected." },
    { signal: "ports-attributes", pattern: /"?portsAttributes"?\s*:/i, evidence: "portsAttributes evidence was detected." },
    { signal: "other-ports-attributes", pattern: /"?otherPortsAttributes"?\s*:/i, evidence: "otherPortsAttributes evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "workspace", "signal");
}

function devContainerCustomizationSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["customizationSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["customizationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "customizations", pattern: /"?customizations"?\s*:/i, evidence: "customizations evidence was detected." },
    { signal: "vscode-extensions", pattern: /"?extensions"?\s*:\s*\[|vscode.*extensions/i, evidence: "VS Code extensions evidence was detected." },
    { signal: "vscode-settings", pattern: /"?settings"?\s*:\s*\{|vscode.*settings/i, evidence: "VS Code settings evidence was detected." },
    { signal: "codespaces", pattern: /"?codespaces"?\s*:/i, evidence: "Codespaces customization evidence was detected." },
    { signal: "dotfiles", pattern: /"?dotfiles"?\s*:/i, evidence: "dotfiles evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "customization", "signal");
}

function devContainerWorkflowSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "devcontainer-up", pattern: /devcontainer\s+up\b/i, evidence: "devcontainer up evidence was detected." },
    { signal: "devcontainer-build", pattern: /devcontainer\s+build\b/i, evidence: "devcontainer build evidence was detected." },
    { signal: "devcontainer-exec", pattern: /devcontainer\s+exec\b/i, evidence: "devcontainer exec evidence was detected." },
    { signal: "read-configuration", pattern: /devcontainer\s+read-configuration\b/i, evidence: "read-configuration evidence was detected." },
    { signal: "run-user-commands", pattern: /devcontainer\s+run-user-commands\b/i, evidence: "run-user-commands evidence was detected." },
    { signal: "features-test", pattern: /devcontainer\s+features\s+test\b/i, evidence: "features test evidence was detected." },
    { signal: "features-package", pattern: /devcontainer\s+features\s+package\b/i, evidence: "features package evidence was detected." },
    { signal: "outdated", pattern: /devcontainer\s+outdated\b/i, evidence: "outdated evidence was detected." },
    { signal: "upgrade", pattern: /devcontainer\s+upgrade\b/i, evidence: "upgrade evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function devContainerSafetySignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["safetySignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "lockfile", pattern: /\.devcontainer-lock\.json/i, evidence: "Dev Container lockfile evidence was detected." },
    { signal: "frozen-lockfile", pattern: /--frozen-lockfile/i, evidence: "frozen lockfile evidence was detected." },
    { signal: "non-root-user", pattern: /"?(remoteUser|containerUser)"?\s*:\s*"(?!root\b)[^"]+"/i, evidence: "non-root user evidence was detected." },
    { signal: "cap-add", pattern: /"?capAdd"?\s*:|cap_add\s*:/i, evidence: "cap-add evidence was detected." },
    { signal: "security-opt", pattern: /"?securityOpt"?\s*:|security_opt\s*:/i, evidence: "securityOpt evidence was detected." },
    { signal: "privileged", pattern: /"?privileged"?\s*:\s*true/i, evidence: "privileged mode evidence was detected." },
    { signal: "host-requirements", pattern: /"?hostRequirements"?\s*:/i, evidence: "hostRequirements evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function devContainerPackageSignals(sourceFiles: DevContainerSourceFile[]): DevContainerReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DevContainerReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "devcontainers-cli", pattern: /@devcontainers\/cli/i, evidence: "@devcontainers/cli evidence was detected." },
    { signal: "devcontainer-cli", pattern: /devcontainer\s+(read-configuration|up|build|exec|run-user-commands|features|templates|outdated|upgrade)/i, evidence: "devcontainer CLI command evidence was detected." },
    { signal: "devcontainer-feature", pattern: /devcontainer-feature\.json|ghcr\.io\/devcontainers\/features/i, evidence: "Dev Container Feature evidence was detected." },
    { signal: "devcontainer-template", pattern: /devcontainer-template\.json|devcontainer\s+templates/i, evidence: "Dev Container Template evidence was detected." },
    { signal: "vscode-dev-containers", pattern: /vscode-dev-containers|ms-vscode-remote\.remote-containers|Dev Containers/i, evidence: "VS Code Dev Containers evidence was detected." }
  ];
  return devContainerSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function devContainerSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DevContainerSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/devcontainer-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
