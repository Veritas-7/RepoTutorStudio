import path from "node:path";
import type { ThreatModelReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildThreatModelReadinessReport(walk: WalkResult): Promise<ThreatModelReadinessReport> {
  const sourceFiles = await threatModelSourceFiles(walk);
  const threatModelSetups = threatModelSetupsFromSources(sourceFiles);
  const modelSignals = threatModelModelSignals(sourceFiles);
  const diagramSignals = threatModelDiagramSignals(sourceFiles);
  const assetSignals = threatModelAssetSignals(sourceFiles);
  const boundarySignals = threatModelBoundarySignals(sourceFiles);
  const threatSignals = threatModelThreatSignals(sourceFiles);
  const riskSignals = threatModelRiskSignals(sourceFiles);
  const outputSignals = threatModelOutputSignals(sourceFiles);
  const ciSignals = threatModelCiSignals(sourceFiles);
  const packageSignals = threatModelPackageSignals(sourceFiles);

  const hasModel = modelSignals.some((item) => item.readiness === "ready") || threatModelSetups.length > 0;
  const hasAssets = assetSignals.some((item) => item.readiness === "ready") || threatModelSetups.some((item) => item.assetCount > 0);
  const hasFlows = diagramSignals.some((item) => item.readiness === "ready") || threatModelSetups.some((item) => item.dataFlowCount > 0 || item.boundaryCount > 0);
  const hasThreats = threatSignals.some((item) => item.readiness === "ready") || threatModelSetups.some((item) => item.threatCount > 0 || item.strideCount > 0);
  const hasMitigation = riskSignals.some((item) => item.readiness === "ready" && (item.signal === "mitigation" || item.signal === "risk-tracking" || item.signal === "accepted-risk")) || threatModelSetups.some((item) => item.mitigationCount > 0 || item.riskTrackingCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || threatModelSetups.some((item) => item.outputCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || threatModelSetups.some((item) => item.ciCount > 0);

  const riskQueue: ThreatModelReadinessReport["riskQueue"] = [];
  if (!hasModel) {
    riskQueue.push({
      priority: "high",
      action: "Add a concrete threat model source before claiming design-security coverage.",
      why: "Threat-model readiness needs a model artifact such as pytm code, Threat Dragon JSON, Threagile YAML, or an explicit open threat model.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  if (hasModel && !hasAssets) {
    riskQueue.push({
      priority: "high",
      action: "Model actors, processes, datastores, data assets, or technical assets.",
      why: "A threat model without assets cannot connect risks to the system being taught.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  if (hasModel && !hasFlows) {
    riskQueue.push({
      priority: "medium",
      action: "Record data-flow, sequence, trust-boundary, or communication-link evidence.",
      why: "Threats are easier to review when model boundaries and data movement are visible.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  if (hasAssets && !hasThreats) {
    riskQueue.push({
      priority: "medium",
      action: "Attach STRIDE categories, explicit threats, abuse cases, or attack paths.",
      why: "Assets and flows are inventory; readiness needs threat reasoning tied to them.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  if (hasThreats && !hasMitigation) {
    riskQueue.push({
      priority: "medium",
      action: "Track mitigation, accepted risk, false positives, or unanswered questions.",
      why: "Threat findings need review status so learners can separate open design risk from accepted or mitigated risk.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  if (hasThreats && !hasOutput) {
    riskQueue.push({
      priority: "low",
      action: "Persist reports, diagrams, JSON, Markdown, PDF, Excel, or CI artifacts.",
      why: "Threat-model output should be reviewable without rerunning modeling tools.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  if (hasModel && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Attach model validation or report generation to a reviewable workflow.",
      why: "Repeatable threat-model checks help keep architecture changes aligned with design-security evidence.",
      relatedHref: "html/threat-model-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run pytm, Threat Dragon, Threagile, Graphviz, Docker, and report generation only in an authorized local or CI environment.",
    why: "RepoTutor records static readiness metadata only and never executes threat-modeling tools, containers, diagram renderers, or CI workflows.",
    relatedHref: "html/threat-model-readiness.html"
  });

  return {
    summary: `Threat model readiness report: setup ${threatModelSetups.length}개, model signal ${modelSignals.length}개, diagram signal ${diagramSignals.length}개, threat signal ${threatSignals.length}개, risk signal ${riskSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Threat model readiness pytm Threat Dragon Threagile open threat model STRIDE DFD data flow diagram trust boundary technical_assets data_assets communication_links risk_tracking abuse_cases mitigation report JSON Markdown PDF Graphviz",
    threatModelSetups,
    modelSignals,
    diagramSignals,
    assetSignals,
    boundarySignals,
    threatSignals,
    riskSignals,
    outputSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"pytm|TM\\(|Dataflow\\(|Boundary\\(|Actor\\(|Server\\(|Datastore\\(|Process\\(\" .", purpose: "Find pytm model code, assets, data flows, and boundaries." },
      { command: "rg \"Threat Dragon|open threat model|diagramType|diagramJson|threats|mitigation|STRIDE\" .", purpose: "Find Threat Dragon or Open Threat Model JSON, diagrams, threats, and mitigations." },
      { command: "rg \"threagile_version|technical_assets|data_assets|communication_links|trust_boundaries|risk_tracking|abuse_cases|questions\" .", purpose: "Find Threagile YAML model, assets, trust boundaries, risk tracking, abuse cases, and questions." },
      { command: "rg \"data-flow-diagram|attack tree|STRIDE|Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege\" .", purpose: "Find diagram, attack-tree, and STRIDE classification evidence." },
      { command: "rg \"threat-model|threat model|upload-artifact|report|graphviz|docker run .*threagile|pytm .*report\" .github .", purpose: "Find workflow, report, diagram renderer, and artifact retention evidence." }
    ],
    learnerNextSteps: [
      "Open Threat Model Readiness and verify the model maps assets to data flows or trust boundaries.",
      "Check whether STRIDE categories or explicit threat entries are tied to each modeled asset or flow.",
      "Review mitigation, accepted-risk, false-positive, and question tracking before treating findings as resolved.",
      "Treat all threat-model tool commands as external execution; RepoTutor only records static readiness."
    ]
  };
}

type ThreatModelSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function threatModelSourceFiles(walk: WalkResult): Promise<ThreatModelSourceFile[]> {
  const files: ThreatModelSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !threatModelInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!threatModelPathSignal(file.relPath) && !threatModelContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function threatModelInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return threatModelPathSignal(filePath)
    || /(^|\/)(README|docs?|security|architecture|threats?|risk|models?|diagrams?|workflows?|scripts?|tests?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|Dockerfile|docker-compose\.ya?ml|threagile\.ya?ml|tm\.py)$/i.test(base);
}

function threatModelPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /(^|\/)\.github\/workflows\//i.test(filePath)
    || /(threat[-_ ]?model|threatmodel|threat-dragon|threatdragon|threagile|pytm|stride|data[-_ ]flow|dfd|attack[-_ ]tree|risk[-_ ]tracking)/i.test(filePath)
    || /^(threagile\.ya?ml|tm\.py|threats?\.json|threats?\.ya?ml|open-threat-model\.json)$/i.test(base);
}

function threatModelContentSignal(text: string): boolean {
  return /(threat model|Threat Dragon|open threat model|threagile_version|technical_assets|data_assets|communication_links|trust_boundaries|risk_tracking|abuse_cases|STRIDE|Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege|pytm|TM\(|Dataflow\(|Boundary\(|Actor\(|Server\(|Datastore\(|Process\(|diagramType|diagramJson|mitigation|risk rating|Graphviz)/i.test(text);
}

function threatModelSetupsFromSources(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["threatModelSetups"] {
  const rows: ThreatModelReadinessReport["threatModelSetups"] = [];
  for (const source of sourceFiles) {
    const modelCount = countMatches(source.text, /(threat model|open threat model|Threat Dragon|threagile_version|pytm|TM\(|model\.py|diagramJson|diagramType)/gi);
    const assetCount = countMatches(source.text, /(Actor\(|Server\(|Process\(|Datastore\(|ExternalEntity|tm\.Actor|tm\.Process|tm\.Store|technical_assets|data_assets|technical asset|data asset|component|storesCredentials)/gi);
    const dataFlowCount = countMatches(source.text, /(Dataflow\(|data flow|data-flow|communication_links|data_assets_sent|data_assets_stored|data_assets_processed|sequence diagram|diagramType|diagramJson)/gi);
    const boundaryCount = countMatches(source.text, /(Boundary\(|trust boundary|trust_boundaries|outOfScope|out-of-scope|in-scope|isInScope|shared_runtime|scope)/gi);
    const threatCount = countMatches(source.text, /(threats?:|threats"\s*:|hasOpenThreats|abuse_cases|abuse case|attack tree|attack path|vulnerability|risk finding)/gi);
    const strideCount = countMatches(source.text, /(STRIDE|Spoofing|Tampering|Repudiation|Information Disclosure|Denial of Service|Elevation of Privilege|information-disclosure|denial-of-service|elevation-of-privilege)/gi);
    const mitigationCount = countMatches(source.text, /(mitigation|mitigated|remediation|countermeasure|control|reduce risk)/gi);
    const riskTrackingCount = countMatches(source.text, /(risk_tracking|risk tracking|accepted risk|false positive|false-positive|questions|unanswered|risk_status|risk_severity|risk_rating|severity|status)/gi);
    const outputCount = countMatches(source.text, /(report|json|markdown|\.md\b|pdf|diagram|Graphviz|graphviz|dot|excel|xlsx|data-flow-diagram|upload-artifact)/gi);
    const ciCount = countMatches(source.text, /(github actions|\.github\/workflows|pull_request|schedule:|cron:|docker run|upload-artifact|CI)/gi);
    const totalSignals = modelCount + assetCount + dataFlowCount + boundaryCount + threatCount + strideCount + mitigationCount + riskTrackingCount + outputCount + ciCount;
    if (totalSignals === 0 && !threatModelPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      tool: threatModelTool(source),
      modelCount,
      assetCount,
      dataFlowCount,
      boundaryCount,
      threatCount,
      strideCount,
      mitigationCount,
      riskTrackingCount,
      outputCount,
      ciCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} threat-model readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.modelCount + b.assetCount + b.dataFlowCount + b.boundaryCount + b.threatCount + b.riskTrackingCount + b.outputCount + b.ciCount;
    const aScore = a.modelCount + a.assetCount + a.dataFlowCount + a.boundaryCount + a.threatCount + a.riskTrackingCount + a.outputCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function threatModelTool(source: ThreatModelSourceFile): ThreatModelReadinessReport["threatModelSetups"][number]["tool"] {
  if (/\.github\/workflows/i.test(source.filePath)) return "workflow";
  if (/package\.json$/i.test(source.filePath)) return "package-script";
  if (/pytm|tm\.py/i.test(source.filePath) || /pytm|TM\(|Dataflow\(|Boundary\(|Actor\(|Server\(|Datastore\(|Process\(/i.test(source.text)) return "pytm";
  if (/threagile/i.test(source.filePath) || /threagile_version|technical_assets|data_assets|communication_links|risk_tracking/i.test(source.text)) return "threagile";
  if (/threat[-_ ]?dragon|open-threat-model/i.test(source.filePath) || /Threat Dragon|open threat model|diagramJson|diagramType|tm\.(Store|Actor|Process|Flow)/i.test(source.text)) return "threat-dragon";
  if (/diagram|dfd|data[-_ ]flow|attack[-_ ]tree/i.test(source.filePath) || /data flow diagram|Graphviz|graphviz|attack tree/i.test(source.text)) return "diagram";
  if (/README|docs?/i.test(source.filePath)) return "readme";
  return "unknown";
}

function threatModelModelSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["modelSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "pytm", pattern: /pytm|TM\(|Dataflow\(|Boundary\(|Actor\(|Server\(|Datastore\(|Process\(/i, evidence: "pytm model evidence was detected." },
    { signal: "threat-dragon", pattern: /Threat Dragon|diagramJson|diagramType|tm\.(Store|Actor|Process|Flow)/i, evidence: "Threat Dragon model evidence was detected." },
    { signal: "threagile", pattern: /threagile_version|technical_assets|data_assets|communication_links|risk_tracking/i, evidence: "Threagile model evidence was detected." },
    { signal: "open-threat-model", pattern: /open threat model|open-threat-model|otmVersion/i, evidence: "Open Threat Model evidence was detected." },
    { signal: "json-model", pattern: /\.json\b|"summary"|"detail"|"diagrams"|"threats"/i, evidence: "JSON model evidence was detected." },
    { signal: "yaml-model", pattern: /\.ya?ml\b|threagile_version|technical_assets:/i, evidence: "YAML model evidence was detected." },
    { signal: "python-model", pattern: /\.py\b|TM\(|Dataflow\(/i, evidence: "Python model evidence was detected." }
  ], "model");
}

function threatModelDiagramSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["diagramSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "dfd", pattern: /\bDFD\b|data flow diagram|Dataflow\(/i, evidence: "DFD evidence was detected." },
    { signal: "sequence", pattern: /sequence diagram|seq|pytm .*seq/i, evidence: "Sequence diagram evidence was detected." },
    { signal: "data-flow-diagram", pattern: /data-flow-diagram|data_flow_diagram|communication_links|diagramJson/i, evidence: "Data-flow diagram evidence was detected." },
    { signal: "attack-tree", pattern: /attack tree|attack-tree|attack path|abuse case/i, evidence: "Attack-tree or abuse-case evidence was detected." },
    { signal: "trust-boundary", pattern: /trust boundary|trust_boundaries|Boundary\(/i, evidence: "Trust-boundary diagram evidence was detected." },
    { signal: "component", pattern: /component|technical_assets|tm\.(Store|Actor|Process|Flow)/i, evidence: "Component diagram evidence was detected." }
  ], "diagram");
}

function threatModelAssetSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["assetSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "actor", pattern: /Actor\(|tm\.Actor|external entity|ExternalEntity/i, evidence: "Actor evidence was detected." },
    { signal: "process", pattern: /Process\(|Server\(|Lambda\(|tm\.Process|technical asset/i, evidence: "Process evidence was detected." },
    { signal: "datastore", pattern: /Datastore\(|Store\(|tm\.Store|database|data store/i, evidence: "Datastore evidence was detected." },
    { signal: "technical-asset", pattern: /technical_assets|technical asset/i, evidence: "Technical asset evidence was detected." },
    { signal: "data-asset", pattern: /data_assets|data asset|data_assets_(sent|stored|processed)/i, evidence: "Data asset evidence was detected." },
    { signal: "communication-link", pattern: /communication_links|Dataflow\(|tm\.Flow|data flow/i, evidence: "Communication link evidence was detected." }
  ], "asset");
}

function threatModelBoundarySignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["boundarySignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "trust-boundary", pattern: /trust_boundaries|trust boundary|Boundary\(/i, evidence: "Trust boundary evidence was detected." },
    { signal: "out-of-scope", pattern: /outOfScope|out-of-scope|out_of_scope/i, evidence: "Out-of-scope evidence was detected." },
    { signal: "scope", pattern: /\bscope\b|scoped|in scope|out of scope/i, evidence: "Scope evidence was detected." },
    { signal: "shared-runtime", pattern: /shared_runtime|shared runtime/i, evidence: "Shared runtime evidence was detected." },
    { signal: "in-scope", pattern: /isInScope|in-scope|in_scope/i, evidence: "In-scope evidence was detected." }
  ], "boundary");
}

function threatModelThreatSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["threatSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "stride", pattern: /STRIDE|diagramType"\s*:\s*"STRIDE/i, evidence: "STRIDE evidence was detected." },
    { signal: "spoofing", pattern: /Spoofing/i, evidence: "Spoofing evidence was detected." },
    { signal: "tampering", pattern: /Tampering/i, evidence: "Tampering evidence was detected." },
    { signal: "repudiation", pattern: /Repudiation/i, evidence: "Repudiation evidence was detected." },
    { signal: "information-disclosure", pattern: /Information Disclosure|Information disclosure|information-disclosure/i, evidence: "Information disclosure evidence was detected." },
    { signal: "denial-of-service", pattern: /Denial of Service|DenialOfService|denial-of-service/i, evidence: "Denial of service evidence was detected." },
    { signal: "elevation-of-privilege", pattern: /Elevation of Privilege|ElevationOfPrivilege|elevation-of-privilege/i, evidence: "Elevation of privilege evidence was detected." },
    { signal: "abuse-case", pattern: /abuse_cases|abuse case|misuse case|attack path/i, evidence: "Abuse-case evidence was detected." }
  ], "threat");
}

function threatModelRiskSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["riskSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "risk-rating", pattern: /risk rating|risk_rating|risk_assessment|relative attacker attractiveness|RAA/i, evidence: "Risk-rating evidence was detected." },
    { signal: "severity", pattern: /severity|Critical|High|Medium|Low|risk_severity/i, evidence: "Severity evidence was detected." },
    { signal: "mitigation", pattern: /mitigation|mitigated|remediation|countermeasure|control/i, evidence: "Mitigation evidence was detected." },
    { signal: "risk-tracking", pattern: /risk_tracking|risk tracking|risk_status|risk owner|ticket/i, evidence: "Risk-tracking evidence was detected." },
    { signal: "accepted-risk", pattern: /accepted risk|accepted-risk|risk accepted|acceptance/i, evidence: "Accepted-risk evidence was detected." },
    { signal: "false-positive", pattern: /false positive|false-positive|false_positive/i, evidence: "False-positive evidence was detected." },
    { signal: "questions", pattern: /questions|unanswered|open question/i, evidence: "Question tracking evidence was detected." }
  ], "risk");
}

function threatModelOutputSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["outputSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "report", pattern: /report|Threat Model Report/i, evidence: "Report evidence was detected." },
    { signal: "json", pattern: /\.json\b|json report|technical assets json/i, evidence: "JSON output evidence was detected." },
    { signal: "markdown", pattern: /markdown|\.md\b|adoc|asciidoc/i, evidence: "Markdown/ADOC output evidence was detected." },
    { signal: "pdf", pattern: /\.pdf\b|PDF report|report-pdf/i, evidence: "PDF output evidence was detected." },
    { signal: "diagram-output", pattern: /Graphviz|graphviz|\.dot\b|\.gv\b|diagram\.png|data-flow-diagram/i, evidence: "Diagram output evidence was detected." },
    { signal: "excel", pattern: /excel|xlsx|risk excel/i, evidence: "Excel output evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact upload|actions\/upload-artifact/i, evidence: "Artifact upload evidence was detected." }
  ], "output");
}

function threatModelCiSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["ciSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|actions\/checkout/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "scheduled-run", pattern: /schedule:|cron:|scheduled/i, evidence: "Scheduled run evidence was detected." },
    { signal: "pull-request", pattern: /pull_request|merge_request|pull request|pr comment/i, evidence: "Pull request evidence was detected." },
    { signal: "docker", pattern: /docker run|threagile\/threagile|pytm .*docker|container/i, evidence: "Docker execution evidence was detected." }
  ], "CI");
}

function threatModelPackageSignals(sourceFiles: ThreatModelSourceFile[]): ThreatModelReadinessReport["packageSignals"] {
  return threatModelSignalFromSpecs(sourceFiles, [
    { signal: "pytm", pattern: /"pytm"|\bpytm\b|OWASP\/pytm/i, evidence: "pytm package/tool evidence was detected." },
    { signal: "threat-dragon", pattern: /threat-dragon|threatdragon|OWASP\/threat-dragon/i, evidence: "Threat Dragon package/tool evidence was detected." },
    { signal: "threagile", pattern: /threagile|threagile\/threagile/i, evidence: "Threagile package/tool evidence was detected." },
    { signal: "graphviz", pattern: /graphviz|dot -T|\.dot\b|\.gv\b/i, evidence: "Graphviz package/tool evidence was detected." }
  ], "package");
}

function threatModelSignalFromSpecs<const T extends readonly { signal: string; pattern: RegExp; evidence: string }[]>(
  sourceFiles: ThreatModelSourceFile[],
  specs: T,
  label: string
): Array<{ signal: T[number]["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/threat-model-readiness.html"
    };
  });
}
