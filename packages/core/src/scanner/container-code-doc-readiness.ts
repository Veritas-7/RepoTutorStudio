import type { CodeQualityReport, ContainerReadinessReport, ContainerScanReadinessReport, DocumentationReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildContainerReadinessReport(walk: WalkResult): Promise<ContainerReadinessReport> {
  const sourceFiles = await containerSourceFiles(walk);
  const dockerfiles = containerDockerfiles(sourceFiles);
  const composeFiles = containerComposeFiles(sourceFiles);
  const configSignals = containerConfigSignals(sourceFiles);
  const instructionRisks = containerInstructionRisks(dockerfiles, configSignals);
  const labelPolicy = containerLabelPolicy(dockerfiles, configSignals, sourceFiles);
  const integrationSignals = containerIntegrationSignals(sourceFiles);
  const dockerfileRows = dockerfiles.map(({ text: _text, ...row }) => row);
  const hasDockerfile = dockerfiles.length > 0;
  const hasConfig = configSignals.some((item) => item.signal === "hadolint-config");
  const hasRegistryPolicy = configSignals.some((item) => item.signal === "trusted-registries");
  const hasLabelSchema = configSignals.some((item) => item.signal === "label-schema");
  const hasIntegration = integrationSignals.some((item) => ["pre-commit", "github-action", "gitlab-ci", "circleci", "jenkins"].includes(item.signal) && item.readiness === "ready");
  const hasMachineReport = integrationSignals.some((item) => ["sarif", "junit", "code-quality-report"].includes(item.signal) && item.readiness === "ready");
  const observedRisks = instructionRisks.filter((item) => item.readiness === "partial");

  const riskQueue: ContainerReadinessReport["riskQueue"] = [];
  if (!hasDockerfile) {
    riskQueue.push({
      priority: "medium",
      action: "Add a Dockerfile only if this project is meant to build container images.",
      why: "Container readiness is irrelevant for libraries without images, but runtime apps should make image build assumptions visible.",
      relatedHref: "html/container-readiness.html"
    });
  }
  if (hasDockerfile && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add .hadolint.yaml to document failure thresholds, ignored rules, registries, and label policy.",
      why: "Hadolint supports project-level config; undocumented CLI flags make Dockerfile quality gates hard to reproduce.",
      relatedHref: "html/container-readiness.html"
    });
  }
  if (hasDockerfile && !hasIntegration) {
    riskQueue.push({
      priority: "high",
      action: "Run Hadolint in pre-commit or CI before container builds are published.",
      why: "Dockerfile linting is most useful before image build and release steps, not after a broken image reaches users.",
      relatedHref: "html/container-readiness.html"
    });
  }
  if (hasDockerfile && !hasRegistryPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Declare trustedRegistries or a trusted registry CLI policy.",
      why: "Hadolint can warn when FROM images come from registries outside the allowed list.",
      relatedHref: "html/container-readiness.html"
    });
  }
  if (hasDockerfile && !hasLabelSchema) {
    riskQueue.push({
      priority: "medium",
      action: "Define an image label schema for version, source, license, and documentation labels.",
      why: "Labels make built images traceable; Hadolint can enforce label formats such as semver, hash, url, email, and SPDX.",
      relatedHref: "html/container-readiness.html"
    });
  }
  if (observedRisks.length > 0) {
    riskQueue.push({
      priority: "medium",
      action: "Review observed Dockerfile risk patterns before building images.",
      why: `${observedRisks.length} Hadolint-style rule pattern(s) were detected in copied Dockerfile text.`,
      relatedHref: "html/container-readiness.html"
    });
  }
  if (hasDockerfile && !hasMachineReport) {
    riskQueue.push({
      priority: "low",
      action: "Emit SARIF, JUnit, or code-quality output for Dockerfile lint findings.",
      why: "Machine-readable lint reports can be attached to CI artifacts and code scanning systems.",
      relatedHref: "html/container-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Hadolint against the original source tree before treating this report as lint approval.",
    why: "RepoTutor records static readiness patterns only; it does not parse the Dockerfile AST, execute ShellCheck, build images, or verify registry access.",
    relatedHref: "html/container-readiness.html"
  });

  return {
    summary: `Hadolint식 container readiness report: Dockerfile ${dockerfiles.length}개, Compose file ${composeFiles.length}개, config signal ${configSignals.length}개, instruction check ${instructionRisks.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Hadolint Dockerfile AST ShellCheck rules config ignored rules severity overrides trusted registries labels SARIF JUnit CI pre-commit",
    dockerfiles: dockerfileRows,
    composeFiles,
    configSignals,
    instructionRisks,
    labelPolicy,
    integrationSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "hadolint Dockerfile", purpose: "Lint the default Dockerfile with Hadolint best-practice and ShellCheck-backed rules." },
      { command: "hadolint --config .hadolint.yaml Dockerfile", purpose: "Run with project-specific ignored rules, severity overrides, trusted registries, and label schema." },
      { command: "hadolint --format sarif Dockerfile > hadolint.sarif", purpose: "Write SARIF output for code scanning or CI artifact review." },
      { command: "hadolint --failure-threshold warning Dockerfile", purpose: "Fail only when findings meet the configured minimum severity." },
      { command: "docker run --rm -i hadolint/hadolint < Dockerfile", purpose: "Run Hadolint via its container image without installing a local binary." }
    ],
    learnerNextSteps: [
      "Dockerfile이 없다면 이 프로젝트가 container image를 배포해야 하는지부터 확인하세요.",
      "FROM image tag, USER, package pinning, COPY/ADD, HEALTHCHECK, pipefail은 beginner가 image 품질을 이해하기 좋은 첫 점검 항목입니다.",
      ".hadolint.yaml의 ignored rule은 예외 사유가 좁고 문서화되어 있는지 확인하세요.",
      "RepoTutor는 Docker build나 registry 검증을 하지 않으므로 실제 배포 전 원본 repo에서 Hadolint를 실행하세요."
    ]
  };
}

type ContainerSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

type ContainerDockerfile = ContainerReadinessReport["dockerfiles"][number] & {
  text: string;
};

async function containerSourceFiles(walk: WalkResult): Promise<ContainerSourceFile[]> {
  const files: ContainerSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !containerInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!containerPathSignal(file.relPath) && !containerContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function containerInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(Dockerfile|Containerfile|docker-compose\.ya?ml|compose\.ya?ml|\.hadolint\.ya?ml|hadolint\.ya?ml|\.pre-commit-config\.ya?ml|README\.md|SECURITY\.md)$/i.test(base)
    || /\.dockerfile$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(ya?ml|json|md|sh)$/i.test(filePath);
}

function containerPathSignal(filePath: string): boolean {
  return /(Dockerfile|Containerfile|docker-compose|compose\.ya?ml|hadolint|container|image|pre-commit|workflow|gitlab-ci|circleci|jenkins)/i.test(filePath);
}

function containerContentSignal(text: string): boolean {
  return /\b(FROM|RUN|COPY|ADD|USER|HEALTHCHECK|ENTRYPOINT|CMD|LABEL)\b|hadolint|Dockerfile|trustedRegistries|failure-threshold|label-schema|strict-labels|disable-ignore-pragma|gitlab_codeclimate|sarif|junit/i.test(text);
}

function containerDockerfiles(sourceFiles: ContainerSourceFile[]): ContainerDockerfile[] {
  return sourceFiles
    .filter((source) => /(^|\/)(Dockerfile|Containerfile)(\.[^/]*)?$|\.dockerfile$/i.test(source.filePath))
    .map((source) => {
      const baseImages = [...source.text.matchAll(/^FROM\s+(?:--platform=\S+\s+)?([^\s#]+)(?:\s+AS\s+\S+)?/gim)].map((match) => match[1] ?? "").filter(Boolean);
      const instructionKinds = [...new Set([...source.text.matchAll(/^\s*([A-Z][A-Z0-9_-]+)\b/gm)].map((match) => match[1] ?? "").filter(Boolean))];
      return {
        filePath: source.filePath,
        stageCount: baseImages.length,
        baseImages,
        instructionKinds,
        readiness: baseImages.length > 0 ? "ready" : "partial",
        evidence: baseImages.length > 0 ? `${source.filePath} defines ${baseImages.length} FROM stage(s).` : `${source.filePath} is Dockerfile-like but no FROM instruction was detected.`,
        sourceHref: source.sourceHref,
        text: source.text
      };
    });
}

function containerComposeFiles(sourceFiles: ContainerSourceFile[]): ContainerReadinessReport["composeFiles"] {
  return sourceFiles
    .filter((source) => /(^|\/)(docker-compose|compose)\.ya?ml$/i.test(source.filePath))
    .map((source) => {
      const servicesBlock = source.text.match(/(?:^|\n)services:\s*\n([\s\S]*?)(?:\n\S|\s*$)/i)?.[1] ?? "";
      const serviceCount = [...servicesBlock.matchAll(/^\s{2,}([A-Za-z0-9_.-]+):\s*(?:#.*)?$/gm)].length;
      return {
        filePath: source.filePath,
        serviceCount,
        readiness: serviceCount > 0 ? "ready" : "partial",
        evidence: serviceCount > 0 ? `${source.filePath} declares ${serviceCount} Compose service(s).` : `${source.filePath} is compose-like but service count could not be inferred statically.`,
        sourceHref: source.sourceHref
      };
    });
}

function containerConfigSignals(sourceFiles: ContainerSourceFile[]): ContainerReadinessReport["configSignals"] {
  const rows: ContainerReadinessReport["configSignals"] = [];
  for (const source of sourceFiles) {
    for (const signal of containerConfigSignalTypes(source.filePath, source.text)) {
      rows.push({
        filePath: source.filePath,
        signal,
        readiness: signal === "unknown" ? "partial" : "ready",
        evidence: containerConfigEvidence(source.filePath, signal),
        sourceHref: source.sourceHref
      });
    }
  }
  return rows.slice(0, 140);
}

function containerConfigSignalTypes(filePath: string, text: string): ContainerReadinessReport["configSignals"][number]["signal"][] {
  const signals = new Set<ContainerReadinessReport["configSignals"][number]["signal"]>();
  if (/\.hadolint\.ya?ml$|hadolint\.ya?ml$/i.test(filePath) || /hadolint\s+--config|HADOLINT_/i.test(text)) signals.add("hadolint-config");
  if (/ignored:\s*\[|ignored:\s*\n|--ignore\s+DL|HADOLINT_IGNORE|#\s*hadolint\s+(global\s+)?ignore=/i.test(text)) signals.add("ignored-rules");
  if (/override:\s*\n|--(error|warning|info|style)\s+DL|HADOLINT_OVERRIDE_/i.test(text)) signals.add("severity-override");
  if (/failure-threshold|HADOLINT_FAILURE_THRESHOLD/i.test(text)) signals.add("failure-threshold");
  if (/trustedRegistries|trusted-registry|HADOLINT_TRUSTED_REGISTRIES/i.test(text)) signals.add("trusted-registries");
  if (/label-schema|require-label|HADOLINT_REQUIRE_LABELS/i.test(text)) signals.add("label-schema");
  if (/strict-labels|HADOLINT_STRICT_LABELS/i.test(text)) signals.add("strict-labels");
  if (/disable-ignore-pragma|HADOLINT_DISABLE_IGNORE_PRAGMA/i.test(text)) signals.add("disable-ignore-pragma");
  if (/--format\s+(json|checkstyle|codeclimate|gitlab_codeclimate|gnu|codacy|sonarqube|sarif|junit)|HADOLINT_FORMAT|format:\s*(json|sarif|junit|codeclimate|gitlab_codeclimate)/i.test(text)) signals.add("output-format");
  if (signals.size === 0 && /hadolint/i.test(text)) signals.add("unknown");
  return [...signals];
}

function containerConfigEvidence(filePath: string, signal: ContainerReadinessReport["configSignals"][number]["signal"]): string {
  if (signal === "hadolint-config") return `${filePath} provides or references Hadolint configuration.`;
  if (signal === "ignored-rules") return `${filePath} references Hadolint ignored rules or inline/global ignores.`;
  if (signal === "severity-override") return `${filePath} references Hadolint severity overrides.`;
  if (signal === "failure-threshold") return `${filePath} references failure threshold behavior.`;
  if (signal === "trusted-registries") return `${filePath} references trusted registry policy.`;
  if (signal === "label-schema") return `${filePath} references image label schema policy.`;
  if (signal === "strict-labels") return `${filePath} references strict label enforcement.`;
  if (signal === "disable-ignore-pragma") return `${filePath} disables inline ignore pragmas.`;
  if (signal === "output-format") return `${filePath} references machine-readable Hadolint output format.`;
  return `${filePath} contains Hadolint-related configuration evidence.`;
}

function containerInstructionRisks(dockerfiles: ContainerDockerfile[], configSignals: ContainerReadinessReport["configSignals"]): ContainerReadinessReport["instructionRisks"] {
  const allText = dockerfiles.map((item) => item.text).join("\n");
  const allDockerfiles = dockerfiles.map((item) => item.filePath).join(", ") || "Dockerfile";
  const hasDockerfile = dockerfiles.length > 0;
  const hasTrustedRegistry = configSignals.some((item) => item.signal === "trusted-registries");
  const specs: Array<{ rule: ContainerReadinessReport["instructionRisks"][number]["rule"]; severity: ContainerReadinessReport["instructionRisks"][number]["severity"]; pattern: RegExp; missingEvidence: string; hitEvidence: string }> = [
    { rule: "DL3002", severity: "warning", pattern: /(^|\n)\s*USER\s+root\b/i, missingEvidence: "No explicit USER root instruction was detected.", hitEvidence: "USER root pattern was detected." },
    { rule: "DL3006", severity: "warning", pattern: /^FROM\s+(?:--platform=\S+\s+)?(?:[^\s:@]+\/)?[^\s:@]+(?:\s|$)/gim, missingEvidence: "All detected FROM images appear to include a tag, digest, or alias-only reference.", hitEvidence: "FROM image without explicit tag or digest may be present." },
    { rule: "DL3007", severity: "warning", pattern: /^FROM\s+.*:latest\b/gim, missingEvidence: "No FROM latest tag was detected.", hitEvidence: "FROM latest tag was detected." },
    { rule: "DL3008", severity: "warning", pattern: /RUN\s+.*apt-get\s+.*install(?![^&;\n]*=)[^|\n]*/i, missingEvidence: "No obvious unpinned apt-get install pattern was detected.", hitEvidence: "apt-get install without visible version pin may be present." },
    { rule: "DL3013", severity: "warning", pattern: /RUN\s+.*(?:pip|pip3|python\s+-m\s+pip)\s+install(?![^&;\n]*(==|~=|>=|<=|!=|<|>|-r|--requirement|\.[\s;&|]|\.whl|\.tar\.gz))[^|\n]*/i, missingEvidence: "No obvious unpinned pip install pattern was detected.", hitEvidence: "pip install without visible version pin or requirements file may be present." },
    { rule: "DL3016", severity: "warning", pattern: /RUN\s+.*npm\s+install\s+(?!(-g\s+)?[^&;\n]*@)[A-Za-z0-9@/_-]+/i, missingEvidence: "No obvious unpinned npm install pattern was detected.", hitEvidence: "npm install without visible version pin may be present." },
    { rule: "DL3018", severity: "warning", pattern: /RUN\s+.*apk\s+add(?![^&;\n]*=)[^|\n]*/i, missingEvidence: "No obvious unpinned apk add pattern was detected.", hitEvidence: "apk add without visible version pin may be present." },
    { rule: "DL3020", severity: "error", pattern: /^ADD\s+(?!.*\.(tar|tgz|tar\.gz|zip)\b)/gim, missingEvidence: "No ADD-for-plain-copy pattern was detected.", hitEvidence: "ADD is used where COPY may be clearer." },
    { rule: "DL3025", severity: "warning", pattern: /^(CMD|ENTRYPOINT)\s+(?!\[)/gim, missingEvidence: "CMD/ENTRYPOINT instructions appear to use JSON notation when present.", hitEvidence: "Shell-form CMD or ENTRYPOINT was detected." },
    { rule: "DL3026", severity: "error", pattern: /^FROM\s+(?!scratch\b|[A-Za-z0-9_.-]+(?:\s+AS\s+\S+)?$)/gim, missingEvidence: hasTrustedRegistry ? "Trusted registry policy is configured." : "No trusted registry policy was found for FROM image validation.", hitEvidence: "FROM image registry should be checked against trustedRegistries." },
    { rule: "DL3042", severity: "warning", pattern: /RUN\s+.*(?:pip|pip3|python\s+-m\s+pip)\s+install(?![^&;\n]*--no-cache-dir)/i, missingEvidence: "No pip install without --no-cache-dir was detected.", hitEvidence: "pip install without --no-cache-dir may cache packages in the image layer." },
    { rule: "DL3057", severity: "info", pattern: /^HEALTHCHECK\b/gim, missingEvidence: "HEALTHCHECK was not detected.", hitEvidence: "HEALTHCHECK instruction was detected." },
    { rule: "DL3059", severity: "info", pattern: /^RUN\b[\s\S]*\n\s*RUN\b/i, missingEvidence: "Multiple consecutive RUN instructions were not detected.", hitEvidence: "Multiple consecutive RUN instructions may be present." },
    { rule: "DL4006", severity: "warning", pattern: /^RUN\s+.*\|.*$/gim, missingEvidence: "RUN pipelines were not detected.", hitEvidence: "RUN pipeline detected; SHELL pipefail should be reviewed." },
    { rule: "SC", severity: "external", pattern: /^RUN\s+.*(\$\(|`|&&|\|\||;)/gim, missingEvidence: "No complex shell RUN instruction was detected.", hitEvidence: "Complex RUN shell text exists; Hadolint delegates Bash checks to ShellCheck." }
  ];

  return specs.map((spec) => {
    const matched = hasDockerfile && spec.pattern.test(allText);
    spec.pattern.lastIndex = 0;
    const readiness = !hasDockerfile ? "missing" : matched ? "partial" : spec.rule === "DL3026" && !hasTrustedRegistry ? "external" : spec.rule === "DL3057" && !matched ? "external" : "ready";
    return {
      rule: spec.rule,
      severity: spec.severity,
      readiness,
      evidence: !hasDockerfile ? "No Dockerfile target was detected." : matched ? `${allDockerfiles}: ${spec.hitEvidence}` : spec.missingEvidence,
      relatedHref: matched ? dockerfiles[0]?.sourceHref ?? "html/container-readiness.html" : "html/container-readiness.html"
    };
  });
}

function containerLabelPolicy(dockerfiles: ContainerDockerfile[], configSignals: ContainerReadinessReport["configSignals"], sourceFiles: ContainerSourceFile[]): ContainerReadinessReport["labelPolicy"] {
  const allText = dockerfiles.map((item) => item.text).join("\n");
  const labelSchemaFiles = configSignals.filter((item) => item.signal === "label-schema");
  const labelSchemaSources = sourceFiles.filter((source) => labelSchemaFiles.some((item) => item.filePath === source.filePath));
  const hasDockerfile = dockerfiles.length > 0;
  const labels: ContainerReadinessReport["labelPolicy"][number]["label"][] = ["author", "contact", "created", "version", "documentation", "git-revision", "license"];
  return labels.map((label) => {
    const labelPattern = new RegExp(`(?:LABEL\\s+[^\\n]*\\b${label}\\b|label-schema:[\\s\\S]*\\b${label}\\b|${label}:\\s*(?:text|email|rfc3339|semver|url|hash|spdx))`, "i");
    const matchedDockerfile = labelPattern.test(allText);
    const matchedConfig = labelSchemaSources.find((source) => labelPattern.test(source.text));
    return {
      label,
      readiness: matchedDockerfile || matchedConfig ? "ready" : hasDockerfile ? "external" : "missing",
      evidence: matchedDockerfile ? `Dockerfile LABEL or schema evidence includes ${label}.` : matchedConfig ? `Hadolint label-schema config should be checked for ${label}.` : `${label} image label policy was not detected.`,
      relatedHref: matchedDockerfile ? dockerfiles[0]?.sourceHref ?? "html/container-readiness.html" : matchedConfig?.sourceHref ?? "html/container-readiness.html"
    };
  });
}

function containerIntegrationSignals(sourceFiles: ContainerSourceFile[]): ContainerReadinessReport["integrationSignals"] {
  const specs: Array<{ signal: ContainerReadinessReport["integrationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pre-commit", pattern: /pre-commit|hadolint-docker|types:\s*\["?dockerfile/i, evidence: "pre-commit Hadolint hook evidence was detected." },
    { signal: "github-action", pattern: /hadolint-action|uses:\s*hadolint|hadolint\/hadolint-action/i, evidence: "GitHub Actions Hadolint evidence was detected." },
    { signal: "gitlab-ci", pattern: /gitlab_codeclimate|\.gitlab-ci|reports:\s*codequality/i, evidence: "GitLab code quality integration evidence was detected." },
    { signal: "circleci", pattern: /circleci|docker\/hadolint|ignore-rules|trusted-registries/i, evidence: "CircleCI Hadolint integration evidence was detected." },
    { signal: "jenkins", pattern: /Jenkinsfile|jenkins|archiveArtifacts|recordIssues/i, evidence: "Jenkins Hadolint integration evidence was detected." },
    { signal: "editor", pattern: /vscode-hadolint|Hadolint extension|editor integration/i, evidence: "editor integration evidence was detected." },
    { signal: "code-quality-report", pattern: /gitlab_codeclimate|codeclimate|sonarqube|codacy|checkstyle/i, evidence: "code quality report format evidence was detected." },
    { signal: "sarif", pattern: /--format\s+sarif|format:\s*sarif|HADOLINT_FORMAT=sarif/i, evidence: "SARIF report evidence was detected." },
    { signal: "junit", pattern: /--format\s+junit|format:\s*junit|HADOLINT_FORMAT=junit/i, evidence: "JUnit report evidence was detected." }
  ];
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${spec.signal} integration evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/container-readiness.html"
    };
  });
}

export async function buildContainerScanReadinessReport(walk: WalkResult): Promise<ContainerScanReadinessReport> {
  const sourceFiles = await containerScanSourceFiles(walk);
  const containerScanSetups = containerScanSetupsFromSources(sourceFiles);
  const targetSignals = containerScanTargetSignals(sourceFiles);
  const scannerSignals = containerScanScannerSignals(sourceFiles);
  const gateSignals = containerScanGateSignals(sourceFiles);
  const outputSignals = containerScanOutputSignals(sourceFiles);
  const policySignals = containerScanPolicySignals(sourceFiles);
  const registrySignals = containerScanRegistrySignals(sourceFiles);
  const ciSignals = containerScanCiSignals(sourceFiles);
  const packageSignals = containerScanPackageSignals(sourceFiles);

  const hasImageTarget = targetSignals.some((item) => item.signal === "image" && item.readiness === "ready")
    || containerScanSetups.some((item) => item.imageCount > 0);
  const hasScanner = scannerSignals.some((item) => ["trivy", "grype", "dockle"].includes(item.signal) && item.readiness === "ready");
  const hasGate = gateSignals.some((item) => ["exit-code", "severity", "fail-on", "exit-level"].includes(item.signal) && item.readiness === "ready");
  const hasOutput = outputSignals.some((item) => ["json", "sarif", "cyclonedx", "spdx", "artifact-upload"].includes(item.signal) && item.readiness === "ready")
    || containerScanSetups.some((item) => item.outputCount > 0);
  const hasPolicy = policySignals.some((item) => item.readiness === "ready")
    || containerScanSetups.some((item) => item.policyCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready")
    || containerScanSetups.some((item) => item.ciCount > 0);

  const riskQueue: ContainerScanReadinessReport["riskQueue"] = [];
  if (!hasImageTarget && hasScanner) {
    riskQueue.push({
      priority: "high",
      action: "Declare the container image, tar archive, filesystem, or SBOM target that scanners review.",
      why: "Container scan tools need a concrete image-ref, tar input, filesystem path, or SBOM source before the gate is reproducible.",
      relatedHref: "html/container-scan-readiness.html"
    });
  }
  if (!hasScanner) {
    riskQueue.push({
      priority: "high",
      action: "Add a Trivy, Grype, or Dockle scan before relying on image security readiness.",
      why: "Dockerfile linting and dependency review do not prove the built image was scanned for package vulnerabilities, misconfigurations, secrets, licenses, or CIS checks.",
      relatedHref: "html/container-scan-readiness.html"
    });
  }
  if (hasScanner && !hasGate) {
    riskQueue.push({
      priority: "high",
      action: "Set failure thresholds such as exit-code, severity, fail-on, or Dockle exit-level.",
      why: "Container scanners can report findings without failing CI unless the gate is explicit.",
      relatedHref: "html/container-scan-readiness.html"
    });
  }
  if (hasScanner && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Persist JSON, SARIF, CycloneDX, SPDX, table/template, GitHub, or artifact output.",
      why: "Machine-readable scan output lets reviewers inspect findings after CI and feed code scanning or SBOM workflows.",
      relatedHref: "html/container-scan-readiness.html"
    });
  }
  if (hasScanner && !hasPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Document ignore, VEX, offline DB, or suspicious-file acceptance policy.",
      why: "Suppression policy is the boundary between accepted findings and hidden image risk.",
      relatedHref: "html/container-scan-readiness.html"
    });
  }
  if (hasScanner && !hasCi) {
    riskQueue.push({
      priority: "medium",
      action: "Attach image scanning to the build or pull-request workflow.",
      why: "Image scans are most useful when they run on the exact image tag or digest produced by CI.",
      relatedHref: "html/container-scan-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Trivy, Grype, Dockle, Docker, registry, vulnerability DB, and SARIF upload commands only in an authorized local or CI environment.",
    why: "RepoTutor records static container-scan readiness only and never builds images, pulls registries, downloads scanner databases, starts Docker, or uploads SARIF.",
    relatedHref: "html/container-scan-readiness.html"
  });

  return {
    summary: `Container scan readiness report: setup ${containerScanSetups.length}개, target signal ${targetSignals.length}개, scanner signal ${scannerSignals.length}개, gate signal ${gateSignals.length}개, output signal ${outputSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Container scan readiness Trivy Grype Dockle image filesystem SBOM vulnerability misconfig secret license CIS exit-code severity ignore-unfixed only-fixed fail-on exit-level SARIF CycloneDX SPDX JSON VEX trivyignore grype ignore dockleignore registry token docker-host",
    containerScanSetups,
    targetSignals,
    scannerSignals,
    gateSignals,
    outputSignals,
    policySignals,
    registrySignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"trivy image|aquasecurity/trivy-action|image-ref|--scanners|--severity|--exit-code|--ignore-unfixed|--format sarif|--format cyclonedx|--format spdx\" .", purpose: "Find Trivy image targets, scanners, severity gates, ignore policy, and machine-readable output." },
      { command: "rg \"grype |anchore/grype|sbom:|--fail-on|--only-fixed|--by-cve|--scope|\\.grype\\.ya?ml|GRYPE_\" .", purpose: "Find Grype image/filesystem/SBOM targets, fail gates, config, and environment policy." },
      { command: "rg \"dockle|goodwithtech/dockle-action|--exit-code|--exit-level|\\.dockleignore|DOCKLE_IGNORES|accept-key|sensitive-file|CIS-DI|DKL-DI\" .", purpose: "Find Dockle CIS/best-practice gates, ignores, suspicious-file policy, and CI action usage." },
      { command: "rg \"docker build|docker save|image-ref|registry-token|docker-host|podman-host|platform|upload-sarif|upload-artifact|security-events: write\" .github .", purpose: "Find image build/source, registry auth, SARIF upload, and artifact retention evidence." }
    ],
    learnerNextSteps: [
      "Start from Container Scan Readiness after Dockerfile readiness so the image target and scan gate are separate.",
      "Check whether scanners review vulnerabilities, misconfigurations, secrets, licenses, and CIS checkpoints rather than only one finding class.",
      "Review ignore and VEX policy before treating a clean scan as proof of acceptable image risk.",
      "RepoTutor does not build images, access registries, download DBs, or upload SARIF; run the commands in authorized CI before release."
    ]
  };
}

type ContainerScanSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function containerScanSourceFiles(walk: WalkResult): Promise<ContainerScanSourceFile[]> {
  const files: ContainerScanSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !containerScanInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!containerScanPathSignal(file.relPath) && !containerScanContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 240) break;
  }
  return files;
}

function containerScanInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return containerScanPathSignal(filePath)
    || filePath.startsWith(".github/workflows/")
    || /(^|\/)(README|docs?|security|containers?|images?|scripts?|workflows?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Dockerfile|Containerfile|docker-compose\.ya?ml|compose\.ya?ml|\.trivyignore|trivy\.ya?ml|trivy\.toml|\.grype\.ya?ml|\.dockleignore|Makefile|Taskfile\.ya?ml|justfile)$/i.test(base)
    || /\.(ya?ml|json|toml|md|sh)$/i.test(filePath);
}

function containerScanPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(trivy|grype|dockle|container[-_ ]?scan|image[-_ ]?scan|vulnerability[-_ ]?scan|scan[-_ ]?image|sbom|sarif)/i.test(filePath)
    || /^(trivy\.ya?ml|trivy\.toml|\.trivyignore|\.grype\.ya?ml|\.dockleignore)$/i.test(base);
}

function containerScanContentSignal(text: string): boolean {
  return /(trivy image|aquasecurity\/trivy-action|grype\s+(?:sbom:|docker:|oci:|registry:|dir:|\.|[A-Za-z0-9_.:/@-]+)|anchore\/grype|dockle|goodwithtech\/dockle-action|--scanners|--severity|--exit-code|--ignore-unfixed|--only-fixed|--fail-on|--exit-level|--format\s+(?:json|sarif|cyclonedx|spdx)|CycloneDX|SPDX|SARIF|\.trivyignore|\.grype|\.dockleignore|CIS-DI|DKL-DI|docker build|image-ref|registry-token|security-events: write)/i.test(text);
}

function containerScanSetupsFromSources(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["containerScanSetups"] {
  const rows: ContainerScanReadinessReport["containerScanSetups"] = [];
  for (const source of sourceFiles) {
    const imageCount = countMatches(source.text, /(trivy image|image-ref|docker build|docker save|dockle\s+[\w${}/:.@-]+|grype\s+(?:docker:|oci:|registry:)?[\w${}/:.@-]+|container image|IMAGE_NAME|IMAGE_NAME|platform|image-src)/gi);
    const vulnerabilityCount = countMatches(source.text, /(vulnerabilit|CVE|GHSA|trivy image|grype|--scanners\s+vuln|Known vulnerabilities|vulnerability database)/gi);
    const misconfigCount = countMatches(source.text, /(misconfig|IaC|Dockerfile|Kubernetes|CIS-DI|DKL-DI|CIS Benchmark|dockle|--image-config-scanners|--misconfig-scanners)/gi);
    const secretCount = countMatches(source.text, /(secret|Sensitive information|credential|DOCKLE_ACCEPT|DOCKLE_REJECT|sensitive-file|CIS-DI-0010|--scanners.*secret)/gi);
    const licenseCount = countMatches(source.text, /(license|--scanners.*license|--ignored-licenses|license-full|SPDX)/gi);
    const sbomCount = countMatches(source.text, /(SBOM|CycloneDX|SPDX|spdx-json|syft|sbom:|--format\s+cyclonedx|--format\s+spdx)/gi);
    const policyCount = countMatches(source.text, /(\.trivyignore|trivyignore|\.grype|ignore:|\.dockleignore|DOCKLE_IGNORES|--ignore|--ignore-policy|--ignore-unfixed|--only-fixed|--offline-scan|--skip-db-update|VEX|--vex|accept-key|sensitive-file)/gi);
    const outputCount = countMatches(source.text, /(SARIF|sarif|json|CycloneDX|SPDX|spdx-json|table|template|github|--output|-o\s+|upload-artifact|upload-sarif|artifact)/gi);
    const ciCount = countMatches(source.text, /(\.github\/workflows|github actions|pull_request|permissions:|security-events: write|docker build|upload-artifact|upload-sarif|trivy-action|dockle-action|anchore\/scan-action)/gi);
    const totalSignals = imageCount + vulnerabilityCount + misconfigCount + secretCount + licenseCount + sbomCount + policyCount + outputCount + ciCount;
    if (totalSignals === 0 && !containerScanPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: containerScanTool(source),
      imageCount,
      vulnerabilityCount,
      misconfigCount,
      secretCount,
      licenseCount,
      sbomCount,
      policyCount,
      outputCount,
      ciCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} container-scan readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.imageCount + b.vulnerabilityCount + b.misconfigCount + b.secretCount + b.licenseCount + b.sbomCount + b.policyCount + b.outputCount + b.ciCount;
    const aScore = a.imageCount + a.vulnerabilityCount + a.misconfigCount + a.secretCount + a.licenseCount + a.sbomCount + a.policyCount + a.outputCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 70);
}

function containerScanTool(source: ContainerScanSourceFile): ContainerScanReadinessReport["containerScanSetups"][number]["tool"] {
  if (/package\.json$/i.test(source.filePath) || /scripts?["']?\s*:/.test(source.text)) return "package-script";
  if (/trivy/i.test(source.filePath) || /trivy image|aquasecurity\/trivy-action|aquasec\/trivy/i.test(source.text)) return "trivy";
  if (/grype/i.test(source.filePath) || /\bgrype\b|anchore\/grype/i.test(source.text)) return "grype";
  if (/dockle/i.test(source.filePath) || /\bdockle\b|goodwithtech\/dockle-action/i.test(source.text)) return "dockle";
  if (/\.github\/workflows/i.test(source.filePath)) return "github-actions";
  if (/README|docs?/i.test(source.filePath)) return "readme";
  return "unknown";
}

function containerScanTargetSignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["targetSignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "image", pattern: /trivy image|image-ref|dockle\s+[\w${}/:.@-]+|grype\s+(?:docker:|oci:|registry:)?[\w${}/:.@-]+|container image/i, evidence: "container image scan target evidence was detected." },
    { signal: "filesystem", pattern: /trivy fs|filesystem|grype\s+(?:dir:)?\.|grype\s+\.\/|scan source/i, evidence: "filesystem scan target evidence was detected." },
    { signal: "sbom", pattern: /SBOM|sbom:|CycloneDX|SPDX|syft/i, evidence: "SBOM scan target evidence was detected." },
    { signal: "dockerfile", pattern: /Dockerfile|Containerfile|--image-config-scanners|CIS-DI|DKL-DI/i, evidence: "Dockerfile or image config target evidence was detected." },
    { signal: "kubernetes", pattern: /trivy k8s|Kubernetes|k8s|helm|--misconfig-scanners/i, evidence: "Kubernetes scan target evidence was detected." },
    { signal: "tar-input", pattern: /docker save|--input|image\.tar|alpine\.tar/i, evidence: "image tar input evidence was detected." },
    { signal: "registry", pattern: /registry|image-ref|ghcr\.io|docker\.io|quay\.io|ECR|GCR|DOCKLE_AUTH_URL/i, evidence: "registry image target evidence was detected." }
  ], "target");
}

function containerScanScannerSignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["scannerSignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "trivy", pattern: /trivy image|aquasecurity\/trivy-action|aquasec\/trivy|\.trivyignore/i, evidence: "Trivy evidence was detected." },
    { signal: "grype", pattern: /\bgrype\b|anchore\/grype|\.grype\.ya?ml/i, evidence: "Grype evidence was detected." },
    { signal: "dockle", pattern: /\bdockle\b|goodwithtech\/dockle-action|\.dockleignore/i, evidence: "Dockle evidence was detected." },
    { signal: "vulnerability", pattern: /vulnerabilit|CVE|GHSA|--scanners\s+vuln|Known vulnerabilities/i, evidence: "vulnerability scan evidence was detected." },
    { signal: "misconfig", pattern: /misconfig|IaC|Dockerfile|Kubernetes|CIS-DI|DKL-DI|--image-config-scanners|--misconfig-scanners/i, evidence: "misconfiguration scan evidence was detected." },
    { signal: "secret", pattern: /secret|Sensitive information|credential|CIS-DI-0010|--scanners.*secret/i, evidence: "secret scan evidence was detected." },
    { signal: "license", pattern: /license|--scanners.*license|--ignored-licenses|license-full|SPDX/i, evidence: "license scan evidence was detected." },
    { signal: "cis-benchmark", pattern: /CIS Benchmark|CIS-DI|DKL-DI|checkpoint|dockle/i, evidence: "CIS/checkpoint evidence was detected." }
  ], "scanner");
}

function containerScanGateSignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["gateSignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "exit-code", pattern: /--exit-code|exit-code:\s*['"]?\d|exit_code/i, evidence: "exit-code gate evidence was detected." },
    { signal: "severity", pattern: /--severity|severity:\s*(CRITICAL|HIGH|MEDIUM|LOW|UNKNOWN)|HIGH,CRITICAL|warn|fatal/i, evidence: "severity gate evidence was detected." },
    { signal: "ignore-unfixed", pattern: /--ignore-unfixed|ignore-unfixed/i, evidence: "ignore-unfixed evidence was detected." },
    { signal: "only-fixed", pattern: /--only-fixed|only-fixed/i, evidence: "only-fixed evidence was detected." },
    { signal: "fail-on", pattern: /--fail-on|fail-on|fail-on-severity/i, evidence: "fail-on gate evidence was detected." },
    { signal: "exit-level", pattern: /--exit-level|exit-level:\s*(warn|fatal|info)/i, evidence: "Dockle exit-level evidence was detected." },
    { signal: "ignore-policy", pattern: /--ignore-policy|ignore-policy|\.trivyignore|\.grype|\.dockleignore|DOCKLE_IGNORES/i, evidence: "ignore policy evidence was detected." }
  ], "gate");
}

function containerScanOutputSignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["outputSignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "json", pattern: /--format\s+json|-f\s+json|format:\s*json|\.json\b/i, evidence: "JSON output evidence was detected." },
    { signal: "sarif", pattern: /--format\s+sarif|-f\s+sarif|format:\s*sarif|SARIF|upload-sarif/i, evidence: "SARIF output evidence was detected." },
    { signal: "cyclonedx", pattern: /--format\s+cyclonedx|CycloneDX|cyclonedx/i, evidence: "CycloneDX output evidence was detected." },
    { signal: "spdx", pattern: /--format\s+spdx|spdx-json|SPDX/i, evidence: "SPDX output evidence was detected." },
    { signal: "table", pattern: /--format\s+table|format:\s*table|\btable\b/i, evidence: "table output evidence was detected." },
    { signal: "template", pattern: /--format\s+template|template:|\.tpl\b/i, evidence: "template output evidence was detected." },
    { signal: "github", pattern: /--format\s+github|format:\s*github|github code scanning/i, evidence: "GitHub output evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|actions\/upload-artifact|artifact/i, evidence: "artifact upload evidence was detected." }
  ], "output");
}

function containerScanPolicySignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["policySignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "trivyignore", pattern: /\.trivyignore|trivyignore|--ignorefile/i, evidence: "Trivy ignore evidence was detected." },
    { signal: "grype-ignore", pattern: /\.grype\.ya?ml|ignore:\s|ignoredMatches|GRYPE_IGNORE/i, evidence: "Grype ignore evidence was detected." },
    { signal: "dockleignore", pattern: /\.dockleignore|DOCKLE_IGNORES|--ignore\s+CIS|--ignore\s+DKL/i, evidence: "Dockle ignore evidence was detected." },
    { signal: "vex", pattern: /\bVEX\b|OpenVEX|--vex|vex:/i, evidence: "VEX evidence was detected." },
    { signal: "ignore-policy", pattern: /--ignore-policy|ignore-policy|Rego/i, evidence: "ignore policy evidence was detected." },
    { signal: "accept-key", pattern: /accept-key|DOCKLE_ACCEPT_KEYS|accept-file|DOCKLE_ACCEPT_FILES/i, evidence: "accepted suspicious key/file evidence was detected." },
    { signal: "sensitive-file", pattern: /sensitive-file|DOCKLE_REJECT_FILES|sensitive-word|DOCKLE_REJECT_FILE_EXTENSIONS/i, evidence: "sensitive file/key policy evidence was detected." },
    { signal: "offline-db", pattern: /--offline-scan|--skip-db-update|--download-db-only|db-repository|vulnerability database/i, evidence: "offline or database policy evidence was detected." }
  ], "policy");
}

function containerScanRegistrySignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["registrySignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "image-ref", pattern: /image-ref|IMAGE_NAME|container image|docker build.*-t|ghcr\.io|docker\.io|quay\.io/i, evidence: "image reference evidence was detected." },
    { signal: "registry-token", pattern: /registry-token|TRIVY_PASSWORD|TRIVY_USERNAME|DOCKLE_AUTH|docker\/login-action|password-stdin/i, evidence: "registry credential evidence was detected." },
    { signal: "docker-host", pattern: /docker-host|DOCKER_HOST|\/var\/run\/docker\.sock/i, evidence: "Docker host evidence was detected." },
    { signal: "podman", pattern: /podman|podman-host/i, evidence: "Podman evidence was detected." },
    { signal: "private-registry", pattern: /private registry|self hosted registry|registry\.example|DOCKLE_AUTH_URL|registry-token/i, evidence: "private registry evidence was detected." },
    { signal: "platform", pattern: /--platform|platform:\s|linux\/amd64|linux\/arm64/i, evidence: "platform selection evidence was detected." }
  ], "registry");
}

function containerScanCiSignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["ciSignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|merge_request|pull request/i, evidence: "pull-request evidence was detected." },
    { signal: "docker-build", pattern: /docker build|buildx|docker\/build-push-action/i, evidence: "Docker build evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|actions\/upload-artifact|artifact/i, evidence: "artifact upload evidence was detected." },
    { signal: "sarif-upload", pattern: /upload-sarif|security-events: write|sarif_file/i, evidence: "SARIF upload evidence was detected." },
    { signal: "permissions", pattern: /permissions:|contents: read|security-events: write/i, evidence: "workflow permission evidence was detected." }
  ], "CI");
}

function containerScanPackageSignals(sourceFiles: ContainerScanSourceFile[]): ContainerScanReadinessReport["packageSignals"] {
  return containerScanSignalFromSpecs(sourceFiles, [
    { signal: "trivy-action", pattern: /aquasecurity\/trivy-action|aquasec\/trivy|\btrivy\b/i, evidence: "Trivy package/action evidence was detected." },
    { signal: "grype", pattern: /anchore\/grype|\bgrype\b/i, evidence: "Grype package/tool evidence was detected." },
    { signal: "dockle-action", pattern: /goodwithtech\/dockle-action|\bdockle\b/i, evidence: "Dockle package/action evidence was detected." },
    { signal: "docker", pattern: /docker build|docker save|docker\/login-action|docker\/build-push-action|DOCKER_HOST/i, evidence: "Docker package/tool evidence was detected." },
    { signal: "syft", pattern: /\bsyft\b|anchore\/sbom-action|SBOM/i, evidence: "Syft/SBOM evidence was detected." }
  ], "package");
}

function containerScanSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: ContainerScanSourceFile[],
  specs: T,
  label: string
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/container-scan-readiness.html"
    };
  });
}

export async function buildCodeQualityReport(walk: WalkResult): Promise<CodeQualityReport> {
  const sourceFiles = await codeQualitySourceFiles(walk);
  const toolConfigs = codeQualityToolConfigs(sourceFiles);
  const formatterSignals = codeQualityFormatterSignals(sourceFiles);
  const linterSignals = codeQualityLinterSignals(sourceFiles);
  const assistSignals = codeQualityAssistSignals(sourceFiles);
  const ciSignals = codeQualityCiSignals(sourceFiles);
  const languageCoverage = codeQualityLanguageCoverage(walk, toolConfigs);
  const hasWebFiles = languageCoverage.some((item) => item.fileCount > 0 && item.language !== "unknown");
  const hasBiomeConfig = toolConfigs.some((item) => item.tool === "biome-config");
  const hasFormatter = formatterSignals.some((item) => ["formatter-enabled", "format-command"].includes(item.signal) && item.readiness === "ready");
  const hasLinter = linterSignals.some((item) => ["linter-enabled", "rule-groups", "recommended-rules"].includes(item.signal) && item.readiness === "ready");
  const hasAssist = assistSignals.some((item) => ["assist-enabled", "organize-imports"].includes(item.signal) && item.readiness === "ready");
  const hasCi = ciSignals.some((item) => ["biome-ci", "biome-check", "github-action", "gitlab-ci", "pre-commit"].includes(item.signal) && item.readiness === "ready");
  const hasReporter = ciSignals.some((item) => item.signal === "reporter" && item.readiness === "ready");

  const riskQueue: CodeQualityReport["riskQueue"] = [];
  if (hasWebFiles && !hasBiomeConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a biome.json or biome.jsonc config when this repo wants unified formatting and linting.",
      why: "Biome works with sane defaults, but a committed config makes formatter, linter, assist, file include, and VCS ignore behavior reproducible.",
      relatedHref: "html/code-quality.html"
    });
  }
  if (hasWebFiles && !hasFormatter) {
    riskQueue.push({
      priority: "high",
      action: "Add a formatter command such as biome format or biome check.",
      why: "Biome's formatter is a first-class quality gate for JavaScript, TypeScript, JSX, JSON, CSS, and GraphQL files.",
      relatedHref: "html/code-quality.html"
    });
  }
  if (hasWebFiles && !hasLinter) {
    riskQueue.push({
      priority: "high",
      action: "Add a linter command or enable linter rules in config.",
      why: "Biome lint diagnostics and safe fixes give learners a concrete path from source findings to code health improvements.",
      relatedHref: "html/code-quality.html"
    });
  }
  if (hasWebFiles && !hasAssist) {
    riskQueue.push({
      priority: "medium",
      action: "Consider enabling assist actions such as organizeImports.",
      why: "Biome can centralize import organization and source actions that otherwise drift between editor settings and ad hoc scripts.",
      relatedHref: "html/code-quality.html"
    });
  }
  if (hasWebFiles && !hasCi) {
    riskQueue.push({
      priority: "medium",
      action: "Run biome ci or biome check in CI before publishing generated learning artifacts.",
      why: "Local formatting and linting are useful, but CI makes the code-quality contract visible to every contributor.",
      relatedHref: "html/code-quality.html"
    });
  }
  if (hasWebFiles && !hasReporter) {
    riskQueue.push({
      priority: "low",
      action: "Choose a machine-readable or CI-friendly reporter when findings need review artifacts.",
      why: "Biome supports diagnostics/reporting workflows; RepoTutor should surface whether a repo has a durable quality report path.",
      relatedHref: "html/code-quality.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Biome against the original source tree before treating this report as quality approval.",
    why: "RepoTutor records static code-quality readiness only; it does not execute Biome, ESLint, Prettier, editor LSPs, or unsafe fixes.",
    relatedHref: "html/code-quality.html"
  });

  return {
    summary: `Biome식 code quality report: config ${toolConfigs.length}개, formatter signal ${formatterSignals.length}개, linter signal ${linterSignals.length}개, CI/editor signal ${ciSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Biome formatter linter check ci biome.json assist organize imports diagnostics reporter editor LSP VCS ignore safe fixes",
    toolConfigs,
    formatterSignals,
    linterSignals,
    assistSignals,
    ciSignals,
    languageCoverage,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npx @biomejs/biome check .", purpose: "Run formatter, linter, assist, and other enabled checks without writing changes." },
      { command: "npx @biomejs/biome check --write .", purpose: "Apply safe formatting, lint, and assist fixes where the project policy allows writes." },
      { command: "npx @biomejs/biome ci .", purpose: "Run the CI-oriented quality gate for all configured files." },
      { command: "npx @biomejs/biome format --write .", purpose: "Format supported web-language files." },
      { command: "npx @biomejs/biome lint --write .", purpose: "Run lint rules and apply safe fixes." }
    ],
    learnerNextSteps: [
      "package.json scripts, biome.json, editor settings, and CI workflows should agree on the same quality gate.",
      "Formatter readiness answers style drift; linter readiness answers code-health diagnostics; assist readiness answers import/source-action drift.",
      "If the repo already uses ESLint or Prettier, decide whether Biome complements, replaces, or intentionally stays out of that scope.",
      "RepoTutor does not run Biome, so use the recommended commands on the original source tree before claiming code-quality pass/fail."
    ]
  };
}

type CodeQualitySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function codeQualitySourceFiles(walk: WalkResult): Promise<CodeQualitySourceFile[]> {
  const files: CodeQualitySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !codeQualityInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!codeQualityPathSignal(file.relPath) && !codeQualityContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function codeQualityInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|biome\.jsonc?|\.biome\.jsonc?|\.editorconfig|\.prettierrc(\..*)?|prettier\.config\.[cm]?[jt]s|eslint\.config\.[cm]?[jt]s|\.eslintrc(\..*)?|\.pre-commit-config\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /^\.vscode\/settings\.json$/i.test(filePath)
    || /^\.gitlab-ci\.ya?ml$/i.test(filePath)
    || /\.(json|jsonc|ya?ml|toml|md|[cm]?[jt]s)$/i.test(filePath);
}

function codeQualityPathSignal(filePath: string): boolean {
  return /(biome|eslint|prettier|lint|format|pre-commit|workflow|gitlab-ci|\.vscode|editorconfig)/i.test(filePath);
}

function codeQualityContentSignal(text: string): boolean {
  return /@biomejs\/biome|\bbiome\s+(format|lint|check|ci)\b|biome\.json|organizeImports|assist|formatter|linter|prettier|eslint|reporter|diagnostic|safe fix|unsafe/i.test(text);
}

function codeQualityToolConfigs(sourceFiles: CodeQualitySourceFile[]): CodeQualityReport["toolConfigs"] {
  const rows: CodeQualityReport["toolConfigs"] = [];
  for (const source of sourceFiles) {
    const base = path.basename(source.filePath).toLowerCase();
    const push = (tool: CodeQualityReport["toolConfigs"][number]["tool"], readiness: CodeQualityReport["toolConfigs"][number]["readiness"], evidence: string) => {
      rows.push({ filePath: source.filePath, tool, readiness, evidence, sourceHref: source.sourceHref });
    };
    if (/^\.?biome\.jsonc?$/.test(base)) push("biome-config", "ready", `${source.filePath} is a Biome project configuration file.`);
    if (/^package\.json$/.test(base) && /@biomejs\/biome|\bbiome\s+(format|lint|check|ci)\b/i.test(source.text)) push("package-script", "ready", `${source.filePath} references Biome dependency or commands.`);
    if (/^package\.json$/.test(base) && /\b(eslint|prettier)\b/i.test(source.text) && !/@biomejs\/biome|\bbiome\s+(format|lint|check|ci)\b/i.test(source.text)) push("package-script", "partial", `${source.filePath} references ESLint or Prettier scripts without Biome.`);
    if (/^(eslint\.config\.[cm]?[jt]s|\.eslintrc(\..*)?)$/i.test(base)) push("eslint-config", "partial", `${source.filePath} is an ESLint configuration file.`);
    if (/^(\.prettierrc(\..*)?|prettier\.config\.[cm]?[jt]s)$/i.test(base)) push("prettier-config", "partial", `${source.filePath} is a Prettier configuration file.`);
    if (/^(\.editorconfig|settings\.json)$/i.test(base) && /(format|biome|prettier|eslint|editor\.defaultFormatter)/i.test(source.text)) push("editor-config", "partial", `${source.filePath} contains editor formatting or linting configuration.`);
    if (rows.length < 140 && /biome/i.test(source.text) && !rows.some((item) => item.filePath === source.filePath)) push("unknown", "partial", `${source.filePath} contains Biome-related text.`);
  }
  return rows.slice(0, 140);
}

function codeQualityFormatterSignals(sourceFiles: CodeQualitySourceFile[]): CodeQualityReport["formatterSignals"] {
  const specs: Array<{ signal: CodeQualityReport["formatterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "formatter-enabled", pattern: /"formatter"\s*:|formatter:\s|formatter\s+enabled|biome\s+format/i, evidence: "formatter configuration or command evidence was detected." },
    { signal: "format-command", pattern: /\bbiome\s+format\b|@biomejs\/biome\s+format|"(format|fmt)"\s*:\s*"[^"]*(biome|prettier)/i, evidence: "format command evidence was detected." },
    { signal: "write-mode", pattern: /--write|--fix|check\s+--write|lint\s+--write|format\s+--write/i, evidence: "write/fix mode evidence was detected." },
    { signal: "language-support", pattern: /JavaScript|TypeScript|JSX|JSON|CSS|GraphQL|javascript|typescript|json|css|graphql/i, evidence: "supported language coverage evidence was detected." },
    { signal: "line-width", pattern: /lineWidth|printWidth|max_line_length/i, evidence: "line width formatting policy evidence was detected." },
    { signal: "indent-style", pattern: /indentStyle|indent_size|indent_style|tabWidth/i, evidence: "indent formatting policy evidence was detected." },
    { signal: "prettier-compat", pattern: /prettier|Prettier/i, evidence: "Prettier compatibility or coexistence evidence was detected." }
  ];
  return codeQualitySignalFromSpecs(sourceFiles, specs, "formatter");
}

function codeQualityLinterSignals(sourceFiles: CodeQualitySourceFile[]): CodeQualityReport["linterSignals"] {
  const specs: Array<{ signal: CodeQualityReport["linterSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "linter-enabled", pattern: /"linter"\s*:|linter:\s|biome\s+lint|biome\s+check/i, evidence: "linter configuration or command evidence was detected." },
    { signal: "rule-groups", pattern: /"rules"\s*:|"style"\s*:|"correctness"\s*:|"suspicious"\s*:|"nursery"\s*:|"complexity"\s*:/i, evidence: "Biome-style rule group evidence was detected." },
    { signal: "custom-rules", pattern: /plugins?|\.grit|rules\s*:/i, evidence: "custom rule or plugin evidence was detected." },
    { signal: "recommended-rules", pattern: /recommended\s*:\s*(true|"on")|recommended/i, evidence: "recommended rule mode evidence was detected." },
    { signal: "safe-fixes", pattern: /safe fix|safe fixes|lint\s+--write|check\s+--write/i, evidence: "safe fix workflow evidence was detected." },
    { signal: "unsafe-fixes", pattern: /--unsafe|unsafe/i, evidence: "unsafe fix workflow evidence was detected." },
    { signal: "dependency-rule", pattern: /noUndeclaredDependencies|no-undeclared-dependencies/i, evidence: "dependency declaration lint evidence was detected." },
    { signal: "import-cycle-rule", pattern: /noImportCycles|import cycle|no-import-cycles/i, evidence: "import cycle lint evidence was detected." },
    { signal: "promise-rule", pattern: /noFloatingPromises|floating promises|no-floating-promises/i, evidence: "promise lint evidence was detected." }
  ];
  return codeQualitySignalFromSpecs(sourceFiles, specs, "linter");
}

function codeQualityAssistSignals(sourceFiles: CodeQualitySourceFile[]): CodeQualityReport["assistSignals"] {
  const specs: Array<{ signal: CodeQualityReport["assistSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "assist-enabled", pattern: /"assist"\s*:|assist:\s|source action|sourceAction/i, evidence: "assist/source-action configuration evidence was detected." },
    { signal: "organize-imports", pattern: /organizeImports|organize imports|source\.organizeImports/i, evidence: "organize imports evidence was detected." },
    { signal: "sorted-keys", pattern: /useSortedKeys|sorted keys|sort(ed)? keys/i, evidence: "sorted key assist evidence was detected." },
    { signal: "plugins", pattern: /"plugins"\s*:|\.grit|plugin/i, evidence: "Biome plugin evidence was detected." },
    { signal: "vcs-ignore", pattern: /"vcs"\s*:|useIgnoreFile|clientKind|\.gitignore/i, evidence: "VCS ignore integration evidence was detected." }
  ];
  return codeQualitySignalFromSpecs(sourceFiles, specs, "assist");
}

function codeQualityCiSignals(sourceFiles: CodeQualitySourceFile[]): CodeQualityReport["ciSignals"] {
  const specs: Array<{ signal: CodeQualityReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "biome-ci", pattern: /\bbiome\s+ci\b|@biomejs\/biome\s+ci/i, evidence: "biome ci evidence was detected." },
    { signal: "biome-check", pattern: /\bbiome\s+check\b|@biomejs\/biome\s+check/i, evidence: "biome check evidence was detected." },
    { signal: "github-action", pattern: /\.github\/workflows|github actions|actions\/checkout|setup-node|biomejs\/setup-biome/i, evidence: "GitHub Actions quality gate evidence was detected." },
    { signal: "gitlab-ci", pattern: /\.gitlab-ci|gitlab/i, evidence: "GitLab CI quality gate evidence was detected." },
    { signal: "pre-commit", pattern: /pre-commit|repos:\s*\n|biome.*pre-commit/i, evidence: "pre-commit quality gate evidence was detected." },
    { signal: "package-script", pattern: /"(lint|format|fmt|check|ci)"\s*:\s*"[^"]*(biome|eslint|prettier)/i, evidence: "package script quality gate evidence was detected." },
    { signal: "editor-lsp", pattern: /biomejs\.biome|language server|LSP|editor\.defaultFormatter|\.vscode/i, evidence: "editor or LSP integration evidence was detected." },
    { signal: "reporter", pattern: /--reporter|reporter|diagnostic|junit|github|json|summary/i, evidence: "reporter or diagnostic output evidence was detected." }
  ];
  return codeQualitySignalFromSpecs(sourceFiles, specs, "CI/editor");
}

function codeQualitySignalFromSpecs<T extends { signal: string; pattern: RegExp; evidence: string }>(
  sourceFiles: CodeQualitySourceFile[],
  specs: T[],
  label: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    spec.pattern.lastIndex = 0;
    return {
      signal: spec.signal,
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/code-quality.html"
    };
  });
}

function codeQualityLanguageCoverage(walk: WalkResult, toolConfigs: CodeQualityReport["toolConfigs"]): CodeQualityReport["languageCoverage"] {
  const hasQualityTool = toolConfigs.some((item) => ["biome-config", "package-script", "eslint-config", "prettier-config"].includes(item.tool));
  const specs: Array<{ language: CodeQualityReport["languageCoverage"][number]["language"]; pattern: RegExp }> = [
    { language: "javascript", pattern: /\.(mjs|cjs|js)$/i },
    { language: "typescript", pattern: /\.ts$/i },
    { language: "jsx", pattern: /\.(jsx|tsx)$/i },
    { language: "json", pattern: /\.jsonc?$/i },
    { language: "css", pattern: /\.css$/i },
    { language: "graphql", pattern: /\.(graphql|gql)$/i },
    { language: "html", pattern: /\.html$/i },
    { language: "markdown", pattern: /\.mdx?$/i }
  ];
  return specs.map((spec) => {
    const count = walk.files.filter((file) => spec.pattern.test(file.relPath)).length;
    const readiness = count === 0 ? "missing" : hasQualityTool ? "ready" : "external";
    return {
      language: spec.language,
      fileCount: count,
      readiness,
      evidence: count === 0 ? `${spec.language} files were not detected.` : hasQualityTool ? `${count} ${spec.language} file(s) can be reviewed against detected quality tooling.` : `${count} ${spec.language} file(s) exist but no code-quality tool config was detected.`,
      relatedHref: "html/code-quality.html"
    };
  });
}

export async function buildDocumentationReport(walk: WalkResult): Promise<DocumentationReport> {
  const sourceFiles = await documentationSourceFiles(walk);
  const siteConfigs = documentationSiteConfigs(sourceFiles);
  const contentSurfaces = documentationContentSurfaces(walk, siteConfigs);
  const navigationSignals = documentationNavigationSignals(sourceFiles);
  const qualitySignals = documentationQualitySignals(sourceFiles);
  const localizationSignals = documentationLocalizationSignals(sourceFiles);
  const releaseSignals = documentationReleaseSignals(sourceFiles);
  const docusaurusSignals = documentationDocusaurusSignals(sourceFiles);
  const objectDocumentationTargets = await documentationObjectTargets(walk);
  const repoAgentAutomationSignals = documentationRepoAgentAutomationSignals(sourceFiles, objectDocumentationTargets);
  const hasDocContent = contentSurfaces.some((item) => item.count > 0 && ["docs", "blog", "pages", "mdx", "versioned-docs"].includes(item.surface));
  const hasDocusaurusConfig = siteConfigs.some((item) => item.configType === "docusaurus-config");
  const hasNavigation = navigationSignals.some((item) => ["sidebar", "navbar", "footer"].includes(item.signal) && item.readiness === "ready");
  const hasBuild = releaseSignals.some((item) => item.signal === "build-script" && item.readiness === "ready");
  const hasDeploy = releaseSignals.some((item) => ["deploy-script", "github-pages", "netlify", "vercel", "ci-preview"].includes(item.signal) && item.readiness === "ready");
  const hasSearch = qualitySignals.some((item) => item.signal === "search" && item.readiness === "ready");
  const hasSeo = qualitySignals.some((item) => ["seo", "sitemap"].includes(item.signal) && item.readiness === "ready");
  const hasLocalization = localizationSignals.some((item) => item.readiness === "ready");
  const hasVersioning = contentSurfaces.some((item) => item.surface === "versioned-docs" && item.count > 0);

  const riskQueue: DocumentationReport["riskQueue"] = [];
  if (hasDocContent && !hasDocusaurusConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add or identify docusaurus.config when this repository is meant to publish a documentation website.",
      why: "Docusaurus keeps docs, blog, pages, navbar, footer, i18n, and plugin behavior reproducible through a committed site config.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasNavigation) {
    riskQueue.push({
      priority: "medium",
      action: "Define sidebar, navbar, or footer navigation for the main documentation paths.",
      why: "Docusaurus documentation is easier to learn when source folders map to visible navigation instead of isolated markdown files.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasBuild) {
    riskQueue.push({
      priority: "high",
      action: "Add a documented build command such as docusaurus build or an equivalent docs build script.",
      why: "A static documentation report cannot prove the site compiles; learners need a repeatable command for broken links, MDX, and generated routes.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasDeploy) {
    riskQueue.push({
      priority: "medium",
      action: "Record how the documentation site is previewed or deployed.",
      why: "Docusaurus sites often rely on GitHub Pages, Netlify, Vercel, or CI previews, and that path should be visible before publication.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasSearch) {
    riskQueue.push({
      priority: "medium",
      action: "Decide whether the docs need search and record the chosen search integration.",
      why: "Public documentation sites usually need a durable search path such as Algolia or local search as content grows.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasSeo) {
    riskQueue.push({
      priority: "low",
      action: "Check sitemap and SEO metadata before treating the docs site as publication-ready.",
      why: "A docs site can render locally while still being hard to discover or inspect in search/social previews.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasLocalization) {
    riskQueue.push({
      priority: "low",
      action: "Mark i18n as intentionally out of scope or add locale configuration when the docs serve multiple languages.",
      why: "Docusaurus has first-class i18n surfaces; RepoTutor should show whether localization is absent by design or simply missing.",
      relatedHref: "html/documentation.html"
    });
  }
  if (hasDocContent && !hasVersioning) {
    riskQueue.push({
      priority: "low",
      action: "Decide whether versioned docs are needed for released APIs or product versions.",
      why: "Docusaurus docs versioning is important when learners must match documentation to a specific release line.",
      relatedHref: "html/documentation.html"
    });
  }
  if (objectDocumentationTargets.length > 0 && !repoAgentAutomationSignals.some((item) => item.signal === "project-hierarchy-record" && item.readiness === "ready")) {
    riskQueue.push({
      priority: "medium",
      action: "Create a durable hierarchy record before claiming automated object-level documentation is maintainable.",
      why: "RepoAgent persists a project hierarchy record so regenerated Markdown can track files, objects, and relationships across changes.",
      relatedHref: "html/documentation.html"
    });
  }
  if (objectDocumentationTargets.length > 0 && !repoAgentAutomationSignals.some((item) => item.signal === "change-detection" && item.readiness === "ready")) {
    riskQueue.push({
      priority: "medium",
      action: "Add a documented change-detection path before auto-refreshing generated docs.",
      why: "RepoAgent detects additions, deletions, and modifications before replacing Markdown, which prevents stale generated explanations.",
      relatedHref: "html/documentation.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run Docusaurus or the original documentation generator against the source tree before treating this report as documentation approval.",
    why: "RepoTutor records static documentation readiness only; it does not run MDX compilation, route generation, link checking, search indexing, RepoAgent AST extraction, LLM generation, or deployment.",
    relatedHref: "html/documentation.html"
  });

  return {
    summary: `Docusaurus식 documentation report: site config ${siteConfigs.length}개, content surface ${contentSurfaces.length}개, navigation signal ${navigationSignals.length}개, release signal ${releaseSignals.length}개, Docusaurus signal ${docusaurusSignals.filter((item) => item.readiness === "ready").length}개, RepoAgent식 object documentation target ${objectDocumentationTargets.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Docusaurus docs blog pages sidebars docusaurus.config themeConfig navbar footer i18n versioning search build deploy preset-classic plugin-content-docs plugin-content-blog theme-classic MDX admonitions swizzle plugin lifecycle; RepoAgent repository-level code documentation generation AST object docs bidirectional invocation relationships change detection Markdown replacement project hierarchy pre-commit GitBook chat-with-repo local model",
    siteConfigs,
    contentSurfaces,
    navigationSignals,
    qualitySignals,
    localizationSignals,
    releaseSignals,
    docusaurusSignals,
    objectDocumentationTargets,
    repoAgentAutomationSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "npm run build", purpose: "Build the documentation site and catch MDX, routing, and broken-link failures through the project script." },
      { command: "npm run serve", purpose: "Serve the built documentation locally before sharing the output." },
      { command: "npm run docusaurus docs:version 1.0", purpose: "Create a versioned docs snapshot when the project publishes version-specific documentation." },
      { command: "npm run start -- --locale fr", purpose: "Preview a localized documentation build when i18n is enabled." },
      { command: "npx docusaurus build", purpose: "Run the Docusaurus build directly when no package script wraps it yet." },
      { command: "npx docusaurus swizzle --list", purpose: "List swizzleable theme components before customizing Docusaurus theme internals." },
      { command: "repoagent run --print-hierarchy --target-repo-path <repo>", purpose: "Inspect RepoAgent's parsed hierarchy before generating or refreshing object-level Markdown docs." },
      { command: "repoagent diff --target-repo-path <repo>", purpose: "Check which generated docs would change after code modifications." }
    ],
    learnerNextSteps: [
      "Check whether docs, blog, and custom pages are visible through sidebars, navbar, or footer navigation.",
      "Use build and serve commands on the original source tree before claiming documentation pass/fail status.",
      "If the repo uses another docs stack, treat Docusaurus signals as a comparison checklist rather than a required dependency.",
      "Compare docusaurusSignals against config, plugin, MDX, versioning, i18n, search, and theme customization requirements.",
      "Record why i18n, versioning, search, or deploy previews are intentionally omitted when they are out of scope.",
      "Use objectDocumentationTargets to pick the first files that need object-level explanations and relationship notes."
    ]
  };
}

type DocumentationSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function documentationSourceFiles(walk: WalkResult): Promise<DocumentationSourceFile[]> {
  const files: DocumentationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !documentationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 180_000);
    if (!text) continue;
    if (!documentationPathSignal(file.relPath) && !documentationContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function documentationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|docusaurus\.config\.[cm]?[jt]s|sidebars\.[cm]?[jt]s|sidebars\.json|README\.md|crowdin\.ya?ml|netlify\.toml|vercel\.json)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(docs|blog|src\/pages|pages|static|public|i18n|versioned_docs|versioned_sidebars)\//i.test(filePath)
    || /\.(mdx?|[cm]?[jt]sx?|json|ya?ml|toml)$/i.test(filePath);
}

function documentationPathSignal(filePath: string): boolean {
  return /(docusaurus|sidebars?|docs\/|blog\/|src\/pages|\/pages\/|i18n\/|versioned_docs|versioned_sidebars|netlify|vercel|deploy|readme)/i.test(filePath);
}

function documentationContentSignal(text: string): boolean {
  return /@docusaurus|docusaurus\s+(build|serve|start|deploy|docs:version|swizzle)|sidebars?|themeConfig|navbar|footer|i18n|locales|algolia|DocSearch|sitemap|MDX|\.mdx|docsVersion|editUrl|GitHub Pages|Netlify|Vercel|plugin-content-docs|plugin-content-blog|preset-classic|admonitions|onBrokenLinks|configureWebpack|contentLoaded|createData|@theme-original|@theme\//i.test(text);
}

function documentationSiteConfigs(sourceFiles: DocumentationSourceFile[]): DocumentationReport["siteConfigs"] {
  const rows: DocumentationReport["siteConfigs"] = [];
  for (const source of sourceFiles) {
    const base = path.basename(source.filePath).toLowerCase();
    const push = (configType: DocumentationReport["siteConfigs"][number]["configType"], readiness: DocumentationReport["siteConfigs"][number]["readiness"], evidence: string) => {
      rows.push({ filePath: source.filePath, configType, readiness, evidence, sourceHref: source.sourceHref });
    };
    if (/^docusaurus\.config\.[cm]?[jt]s$/.test(base)) push("docusaurus-config", "ready", `${source.filePath} is a Docusaurus site configuration file.`);
    if (/^package\.json$/.test(base) && /@docusaurus|docusaurus\s+(start|build|serve|deploy|docs:version)/i.test(source.text)) push("package-script", "ready", `${source.filePath} references Docusaurus dependencies or commands.`);
    if (/^sidebars(\.[cm]?[jt]s|\.json)$/.test(base)) push("sidebar", "ready", `${source.filePath} defines documentation sidebar navigation.`);
    if (/themeConfig|navbar|footer|colorMode|prism/i.test(source.text) && /^docusaurus\.config\./i.test(base)) push("theme-config", "ready", `${source.filePath} contains themeConfig navigation or theme settings.`);
    if (rows.length < 140 && /@docusaurus|themeConfig|sidebars?/i.test(source.text) && !rows.some((item) => item.filePath === source.filePath)) push("unknown", "partial", `${source.filePath} contains Docusaurus-related text.`);
  }
  return rows.slice(0, 140);
}

function documentationContentSurfaces(walk: WalkResult, siteConfigs: DocumentationReport["siteConfigs"]): DocumentationReport["contentSurfaces"] {
  const hasConfig = siteConfigs.some((item) => ["docusaurus-config", "package-script"].includes(item.configType));
  const specs: Array<{ surface: DocumentationReport["contentSurfaces"][number]["surface"]; pattern: RegExp; evidence: string }> = [
    { surface: "docs", pattern: /(^|\/)docs\/.+\.mdx?$/i, evidence: "docs markdown/MDX files were detected." },
    { surface: "blog", pattern: /(^|\/)blog\/.+\.mdx?$/i, evidence: "blog markdown/MDX files were detected." },
    { surface: "pages", pattern: /(^|\/)(src\/pages|pages)\/.+\.(mdx?|[jt]sx?)$/i, evidence: "custom pages were detected." },
    { surface: "mdx", pattern: /\.mdx$/i, evidence: "MDX authoring files were detected." },
    { surface: "static-assets", pattern: /(^|\/)(static|public)\/.+/i, evidence: "static assets for documentation were detected." },
    { surface: "versioned-docs", pattern: /(^|\/)(versioned_docs|versioned_sidebars)\//i, evidence: "versioned docs or sidebars were detected." },
    { surface: "i18n", pattern: /(^|\/)i18n\//i, evidence: "i18n translation folders were detected." }
  ];
  return specs.map((spec) => {
    const count = walk.files.filter((file) => spec.pattern.test(file.relPath)).length;
    const readiness = count > 0 ? "ready" : hasConfig ? "external" : "missing";
    return {
      surface: spec.surface,
      count,
      readiness,
      evidence: count > 0 ? `${count} file(s): ${spec.evidence}` : `${spec.surface} content was not detected.`,
      relatedHref: "html/documentation.html"
    };
  });
}

function documentationNavigationSignals(sourceFiles: DocumentationSourceFile[]): DocumentationReport["navigationSignals"] {
  const specs: Array<{ signal: DocumentationReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sidebar", pattern: /sidebars?|sidebarPath|docs:\s*\{[\s\S]*sidebar/i, evidence: "sidebar navigation evidence was detected." },
    { signal: "navbar", pattern: /navbar|Navbar/i, evidence: "navbar evidence was detected." },
    { signal: "footer", pattern: /footer/i, evidence: "footer evidence was detected." },
    { signal: "breadcrumbs", pattern: /breadcrumbs|hideBreadcrumbs/i, evidence: "breadcrumb control evidence was detected." },
    { signal: "toc", pattern: /tableOfContents|hide_table_of_contents|\btoc\b/i, evidence: "table-of-contents evidence was detected." },
    { signal: "edit-url", pattern: /editUrl|editCurrentVersion|editLocalizedFiles/i, evidence: "edit URL evidence was detected." }
  ];
  return documentationSignalFromSpecs(sourceFiles, specs, "navigation");
}

function documentationQualitySignals(sourceFiles: DocumentationSourceFile[]): DocumentationReport["qualitySignals"] {
  const specs: Array<{ signal: DocumentationReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "search", pattern: /algolia|localSearch|@easyops-cn\/docusaurus-search-local|search/i, evidence: "search integration evidence was detected." },
    { signal: "seo", pattern: /title:|tagline|metadata|headTags|onBrokenLinks|favicon/i, evidence: "SEO or site metadata evidence was detected." },
    { signal: "sitemap", pattern: /sitemap|@docusaurus\/plugin-sitemap/i, evidence: "sitemap evidence was detected." },
    { signal: "pwa", pattern: /pwa|@docusaurus\/plugin-pwa/i, evidence: "PWA plugin evidence was detected." },
    { signal: "analytics", pattern: /googleAnalytics|gtag|gtm|analytics|tag-manager/i, evidence: "analytics evidence was detected." },
    { signal: "theme", pattern: /themeConfig|@docusaurus\/theme|prism|colorMode/i, evidence: "theme customization evidence was detected." },
    { signal: "mdx", pattern: /MDX|\.mdx|@mdx/i, evidence: "MDX evidence was detected." },
    { signal: "typescript", pattern: /docusaurus\.config\.ts|sidebars\.ts|tsconfig|typescript/i, evidence: "TypeScript config evidence was detected." }
  ];
  return documentationSignalFromSpecs(sourceFiles, specs, "quality");
}

function documentationLocalizationSignals(sourceFiles: DocumentationSourceFile[]): DocumentationReport["localizationSignals"] {
  const specs: Array<{ signal: DocumentationReport["localizationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "i18n-config", pattern: /i18n\s*:|locales|defaultLocale/i, evidence: "i18n config evidence was detected." },
    { signal: "locale-dropdown", pattern: /localeDropdown|type:\s*['"]localeDropdown/i, evidence: "locale dropdown evidence was detected." },
    { signal: "translation-folder", pattern: /(^|\/)i18n\/|translations|code\.json/i, evidence: "translation folder evidence was detected." },
    { signal: "crowdin", pattern: /crowdin/i, evidence: "Crowdin localization workflow evidence was detected." },
    { signal: "localized-config", pattern: /currentLocale|@docusaurus\/Translate|\btranslate\(/i, evidence: "localized config or translation helper evidence was detected." }
  ];
  return documentationSignalFromSpecs(sourceFiles, specs, "localization");
}

function documentationReleaseSignals(sourceFiles: DocumentationSourceFile[]): DocumentationReport["releaseSignals"] {
  const specs: Array<{ signal: DocumentationReport["releaseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "build-script", pattern: /"build"\s*:\s*"[^"]*docusaurus\s+build|docusaurus\s+build/i, evidence: "Docusaurus build script evidence was detected." },
    { signal: "serve-script", pattern: /"serve"\s*:\s*"[^"]*docusaurus\s+serve|docusaurus\s+serve|docusaurus\s+start/i, evidence: "serve/start script evidence was detected." },
    { signal: "deploy-script", pattern: /"deploy"\s*:\s*"[^"]*docusaurus\s+deploy|docusaurus\s+deploy/i, evidence: "deploy script evidence was detected." },
    { signal: "github-pages", pattern: /gh-pages|GitHub Pages|GITHUB_TOKEN|peaceiris|actions\/deploy-pages/i, evidence: "GitHub Pages deploy evidence was detected." },
    { signal: "netlify", pattern: /netlify|deploy-preview/i, evidence: "Netlify deploy or preview evidence was detected." },
    { signal: "vercel", pattern: /vercel/i, evidence: "Vercel deploy evidence was detected." },
    { signal: "ci-preview", pattern: /pull_request|preview|artifact|pages:|upload-pages-artifact/i, evidence: "CI preview or artifact evidence was detected." }
  ];
  return documentationSignalFromSpecs(sourceFiles, specs, "release");
}

function documentationDocusaurusSignals(sourceFiles: DocumentationSourceFile[]): DocumentationReport["docusaurusSignals"] {
  const specs: Array<{ signal: DocumentationReport["docusaurusSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "core-package", pattern: /@docusaurus\/core|docusaurus\s+(start|build|serve|deploy)/i, evidence: "Docusaurus core package or CLI evidence was detected." },
    { signal: "preset-classic", pattern: /@docusaurus\/preset-classic|preset-classic/i, evidence: "classic preset evidence was detected." },
    { signal: "config-ts", pattern: /docusaurus\.config\.ts|import\s+type\s+\{?Config\}?|satisfies\s+Config/i, evidence: "TypeScript config evidence was detected." },
    { signal: "async-config", pattern: /export\s+default\s+async\s+function|async\s+function\s+createConfig|Promise<\s*Config\s*>/i, evidence: "async Docusaurus config evidence was detected." },
    { signal: "docs-plugin", pattern: /@docusaurus\/plugin-content-docs|plugin-content-docs|docs:\s*\{/i, evidence: "docs plugin evidence was detected." },
    { signal: "blog-plugin", pattern: /@docusaurus\/plugin-content-blog|plugin-content-blog|blog:\s*\{/i, evidence: "blog plugin evidence was detected." },
    { signal: "pages-plugin", pattern: /@docusaurus\/plugin-content-pages|plugin-content-pages|src\/pages|pages:\s*\{/i, evidence: "pages plugin evidence was detected." },
    { signal: "theme-classic", pattern: /@docusaurus\/theme-classic|theme-classic/i, evidence: "classic theme evidence was detected." },
    { signal: "sidebars-config", pattern: /SidebarsConfig|sidebars?\s*[:=]|sidebarPath/i, evidence: "sidebars config evidence was detected." },
    { signal: "autogenerated-sidebar", pattern: /type:\s*['"]autogenerated|dirName\s*:/i, evidence: "autogenerated sidebar evidence was detected." },
    { signal: "generated-index", pattern: /type:\s*['"]generated-index/i, evidence: "generated index sidebar evidence was detected." },
    { signal: "navbar-items", pattern: /navbar\s*:\s*\{[\s\S]{0,800}items\s*:|type:\s*['"]docSidebar|to:\s*['"]\/docs/i, evidence: "navbar item evidence was detected." },
    { signal: "footer-links", pattern: /footer\s*:\s*\{[\s\S]{0,800}(links|copyright)|footer\.links/i, evidence: "footer link evidence was detected." },
    { signal: "theme-config", pattern: /themeConfig\s*:|ThemeConfig/i, evidence: "themeConfig evidence was detected." },
    { signal: "prism-theme", pattern: /prism\s*:|PrismLight|PrismDark|prism-react-renderer/i, evidence: "Prism theme evidence was detected." },
    { signal: "color-mode", pattern: /colorMode|defaultMode|disableSwitch|data-theme/i, evidence: "color mode evidence was detected." },
    { signal: "mdx-loader", pattern: /@docusaurus\/mdx-loader|@mdx-js\/react|MDXProvider|\.mdx|MDX/i, evidence: "MDX loader or MDX content evidence was detected." },
    { signal: "remark-plugin", pattern: /remarkPlugins|remark-|remark[A-Z][A-Za-z0-9_]*/i, evidence: "remark plugin evidence was detected." },
    { signal: "rehype-plugin", pattern: /rehypePlugins|rehype-|rehype[A-Z][A-Za-z0-9_]*/i, evidence: "rehype plugin evidence was detected." },
    { signal: "admonitions", pattern: /admonitions|:::note|:::tip|:::warning|:::danger|@docusaurus\/theme-common.*admonition/i, evidence: "admonition evidence was detected." },
    { signal: "edit-url", pattern: /editUrl|editLocalizedFiles|editCurrentVersion/i, evidence: "edit URL evidence was detected." },
    { signal: "broken-links-policy", pattern: /onBrokenLinks|onBrokenMarkdownLinks|onDuplicateRoutes/i, evidence: "broken link policy evidence was detected." },
    { signal: "versioning", pattern: /docs:version|versioned_docs|versioned_sidebars|onlyIncludeVersions|lastVersion|versions\.json|disableVersioning/i, evidence: "docs versioning evidence was detected." },
    { signal: "i18n-config", pattern: /i18n\s*:|defaultLocale|locales|localeConfigs|currentLocale/i, evidence: "i18n config evidence was detected." },
    { signal: "translate-api", pattern: /@docusaurus\/Translate|\btranslate\(|<Translate\b/i, evidence: "Docusaurus translate API evidence was detected." },
    { signal: "locale-dropdown", pattern: /localeDropdown|type:\s*['"]localeDropdown/i, evidence: "locale dropdown evidence was detected." },
    { signal: "docsearch", pattern: /DocSearch|algolia\s*:|@docsearch/i, evidence: "DocSearch or Algolia evidence was detected." },
    { signal: "sitemap-plugin", pattern: /@docusaurus\/plugin-sitemap|sitemap/i, evidence: "sitemap plugin evidence was detected." },
    { signal: "client-redirects", pattern: /@docusaurus\/plugin-client-redirects|createRedirects|redirects/i, evidence: "client redirects evidence was detected." },
    { signal: "swizzle", pattern: /swizzle|@theme-original|@theme\//i, evidence: "theme swizzle evidence was detected." },
    { signal: "plugin-lifecycle", pattern: /loadContent|contentLoaded|postBuild|configurePostCss|injectHtmlTags|validateOptions|validateThemeConfig/i, evidence: "plugin lifecycle evidence was detected." },
    { signal: "configure-webpack", pattern: /configureWebpack|webpack\s*:/i, evidence: "configureWebpack evidence was detected." },
    { signal: "content-loaded", pattern: /contentLoaded\s*\(|actions\s*:\s*\{[\s\S]{0,200}(addRoute|createData)|addRoute\s*\(/i, evidence: "contentLoaded route evidence was detected." },
    { signal: "create-data", pattern: /createData\s*\(|actions\s*:\s*\{[\s\S]{0,200}createData/i, evidence: "createData evidence was detected." },
    { signal: "static-assets", pattern: /staticDirectories|staticDirs|\/static\/|static\/img|favicon/i, evidence: "static asset evidence was detected." },
    { signal: "deployment-netlify", pattern: /NETLIFY|netlify\.toml|app\.netlify\.com|deploy-preview/i, evidence: "Netlify deployment evidence was detected." },
    { signal: "deployment-vercel", pattern: /vercel\.json|vercel\.com|Deploy with Vercel/i, evidence: "Vercel deployment evidence was detected." },
    { signal: "github-pages", pattern: /docusaurus\s+deploy|gh-pages|GITHUB_TOKEN|actions\/deploy-pages|upload-pages-artifact/i, evidence: "GitHub Pages deployment evidence was detected." }
  ];
  return documentationSignalFromSpecs(sourceFiles, specs, "Docusaurus official");
}

async function documentationObjectTargets(walk: WalkResult): Promise<DocumentationReport["objectDocumentationTargets"]> {
  const targets: DocumentationReport["objectDocumentationTargets"] = [];
  const candidates = walk.files
    .filter((file) => file.isTextCandidate && documentationObjectTargetPath(file.relPath))
    .slice(0, 240);
  for (const file of candidates) {
    const text = await readTextIfSafe(file.absPath, 140_000);
    if (!text) continue;
    const objectCount = documentationObjectCount(file.relPath, text);
    const relationHintCount = documentationRelationHintCount(file.relPath, text);
    if (objectCount === 0 && relationHintCount === 0) continue;
    const readiness = objectCount > 0 && relationHintCount > 0 ? "ready" : objectCount > 0 ? "partial" : "missing";
    targets.push({
      filePath: file.relPath,
      language: documentationLanguageFromPath(file.relPath),
      objectCount,
      relationHintCount,
      readiness,
      evidence: `${file.relPath} has ${objectCount} object documentation candidate(s) and ${relationHintCount} relationship hint(s).`,
      sourceHref: `source/${encodedPath(file.relPath)}`
    });
  }
  const order = { ready: 0, partial: 1, missing: 2 };
  return targets
    .sort((a, b) => order[a.readiness] - order[b.readiness] || (b.objectCount + b.relationHintCount) - (a.objectCount + a.relationHintCount) || a.filePath.localeCompare(b.filePath))
    .slice(0, 60);
}

function documentationObjectTargetPath(filePath: string): boolean {
  const base = path.basename(filePath);
  if (/(test|spec|fixture|mock|generated|dist|build|vendor|min)\./i.test(base)) return false;
  return /\.(py|ts|tsx|js|jsx|mjs|cjs|go|rs|java|cs|cpp|c|h|hpp|php|rb|swift|kt)$/i.test(base);
}

function documentationObjectCount(filePath: string, text: string): number {
  if (/\.py$/i.test(filePath)) return countMatches(text, /(^|\n)\s*(class|def)\s+[A-Za-z_][A-Za-z0-9_]*/g);
  if (/\.(ts|tsx|js|jsx|mjs|cjs)$/i.test(filePath)) return countMatches(text, /\b(export\s+)?(class|function|const|let|var|interface|type)\s+[A-Za-z_$][A-Za-z0-9_$]*/g);
  if (/\.go$/i.test(filePath)) return countMatches(text, /\b(func|type)\s+[A-Za-z_][A-Za-z0-9_]*/g);
  if (/\.rs$/i.test(filePath)) return countMatches(text, /\b(fn|struct|enum|trait|impl)\s+[A-Za-z_][A-Za-z0-9_]*/g);
  return countMatches(text, /\b(class|function|func|def|struct|enum|interface)\s+[A-Za-z_][A-Za-z0-9_]*/g);
}

function documentationRelationHintCount(filePath: string, text: string): number {
  const importSignals = countMatches(text, /\b(import|from|require|use|include|using|package)\b/g);
  const callSignals = countMatches(text, /[A-Za-z_$][A-Za-z0-9_$]*\s*\(/g);
  const exportSignals = countMatches(text, /\b(export|return|yield|implements|extends|inherits)\b/g);
  return Math.min(120, importSignals + callSignals + exportSignals + (path.dirname(filePath) === "." ? 0 : 1));
}

function documentationLanguageFromPath(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const map: Record<string, string> = {
    ".py": "Python",
    ".ts": "TypeScript",
    ".tsx": "TypeScript React",
    ".js": "JavaScript",
    ".jsx": "JavaScript React",
    ".mjs": "JavaScript",
    ".cjs": "JavaScript",
    ".go": "Go",
    ".rs": "Rust",
    ".java": "Java",
    ".cs": "C#",
    ".cpp": "C++",
    ".c": "C",
    ".h": "C/C++ header",
    ".hpp": "C++ header",
    ".php": "PHP",
    ".rb": "Ruby",
    ".swift": "Swift",
    ".kt": "Kotlin"
  };
  return map[ext] ?? "unknown";
}

function documentationRepoAgentAutomationSignals(
  sourceFiles: DocumentationSourceFile[],
  objectDocumentationTargets: DocumentationReport["objectDocumentationTargets"]
): DocumentationReport["repoAgentAutomationSignals"] {
  const textCorpus = sourceFiles.map((source) => `${source.filePath}\n${source.text}`).join("\n");
  const hasMarkdownDocs = /(^|\/)(markdown_docs|docs|documentation)\//i.test(textCorpus);
  const hasPreCommit = /\.pre-commit-config\.ya?ml|pre-commit|repoagent/i.test(textCorpus);
  const hasGitBook = /GitBook|book\.json|SUMMARY\.md|gitbook/i.test(textCorpus);
  const hasChatDocs = /chat[- ]with[- ]repo|chat_with_repo|issue.*Q&A|code explanation/i.test(textCorpus);
  const hasHierarchy = /\.project_doc_record|hierarchy|print-hierarchy|project hierarchy/i.test(textCorpus);
  const hasLocalModel = /local model|Llama|chatGLM|Qwen|GLM4|Ollama/i.test(textCorpus);
  const targetsReady = objectDocumentationTargets.some((item) => item.readiness === "ready");
  const relationReady = objectDocumentationTargets.some((item) => item.relationHintCount > 0);

  return [
    {
      signal: "ast-object-docs",
      readiness: targetsReady ? "ready" : objectDocumentationTargets.length > 0 ? "suggested" : "missing",
      evidence: targetsReady
        ? `${objectDocumentationTargets.length} source files have object-level documentation candidates.`
        : "RepoAgent-style AST object documentation targets were not found in scanned source files.",
      relatedHref: "html/documentation.html"
    },
    {
      signal: "bidirectional-relations",
      readiness: relationReady ? "ready" : "suggested",
      evidence: relationReady
        ? "Import, call, export, or inheritance-like relationship hints were detected for object documentation targets."
        : "Relationship hints should be recorded before generating global object documentation.",
      relatedHref: "html/component-graph.html"
    },
    {
      signal: "change-detection",
      readiness: /change detector|git diff|staged|modified|deleted|added/i.test(textCorpus) ? "ready" : "suggested",
      evidence: "RepoAgent tracks additions, deletions, and modifications before refreshing generated Markdown.",
      relatedHref: "html/incremental.html"
    },
    {
      signal: "markdown-replacement",
      readiness: hasMarkdownDocs ? "ready" : "suggested",
      evidence: hasMarkdownDocs ? "Markdown documentation folders were detected." : "Generated Markdown replacement should be explicit before automated doc refresh.",
      relatedHref: "html/documentation.html"
    },
    {
      signal: "project-hierarchy-record",
      readiness: hasHierarchy ? "ready" : "suggested",
      evidence: hasHierarchy ? "Project hierarchy record evidence was detected." : "RepoAgent keeps a hierarchy record such as .project_doc_record to organize generated docs.",
      relatedHref: "html/component-graph.html"
    },
    {
      signal: "pre-commit-hook",
      readiness: hasPreCommit ? "ready" : "suggested",
      evidence: hasPreCommit ? "pre-commit or repoagent hook evidence was detected." : "RepoAgent can run through a pre-commit hook, but this repo has no static hook evidence.",
      relatedHref: "html/git-hooks.html"
    },
    {
      signal: "gitbook-display",
      readiness: hasGitBook ? "ready" : "suggested",
      evidence: hasGitBook ? "GitBook display evidence was detected." : "RepoAgent renders generated Markdown as a GitBook-style documentation book.",
      relatedHref: "html/documentation.html"
    },
    {
      signal: "chat-with-repo",
      readiness: hasChatDocs ? "ready" : "static-only",
      evidence: hasChatDocs ? "chat-with-repo documentation evidence was detected." : "RepoTutor records chat-with-repo as static readiness only and does not start a chat server.",
      relatedHref: "html/search-index.html"
    },
    {
      signal: "local-model-support",
      readiness: hasLocalModel ? "ready" : "static-only",
      evidence: hasLocalModel ? "local model support evidence was detected." : "RepoAgent supports local models, but RepoTutor does not load local LLMs for this report.",
      relatedHref: "html/llm-readiness.html"
    }
  ];
}

function documentationSignalFromSpecs<T extends { signal: string; pattern: RegExp; evidence: string }>(
  sourceFiles: DocumentationSourceFile[],
  specs: T[],
  label: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/documentation.html"
    };
  });
}
