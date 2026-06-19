import type { CostReadinessReport, IncidentResponseReadinessReport, SloReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildIncidentResponseReadinessReport(walk: WalkResult): Promise<IncidentResponseReadinessReport> {
  const sourceFiles = await incidentResponseSourceFiles(walk);
  const incidentSetups = incidentResponseSetupRows(sourceFiles);
  const intakeSignals = incidentIntakeSignals(sourceFiles);
  const triageSignals = incidentTriageSignals(sourceFiles);
  const onCallSignals = incidentOnCallSignals(sourceFiles);
  const communicationSignals = incidentCommunicationSignals(sourceFiles);
  const runbookSignals = incidentRunbookSignals(sourceFiles);
  const lifecycleSignals = incidentLifecycleSignals(sourceFiles);
  const governanceSignals = incidentGovernanceSignals(sourceFiles);
  const workflowSignals = incidentWorkflowSignals(sourceFiles);
  const packageSignals = incidentPackageSignals(sourceFiles);

  const hasIntake = intakeSignals.some((item) => item.readiness === "ready")
    || incidentSetups.some((item) => item.incidentCount + item.alertRouteCount > 0);
  const hasOnCall = onCallSignals.some((item) => item.readiness === "ready")
    || incidentSetups.some((item) => item.escalationCount + item.scheduleCount > 0);
  const hasCommunication = communicationSignals.some((item) => item.readiness === "ready")
    || incidentSetups.some((item) => item.notificationCount + item.statusPageCount > 0);
  const hasRunbook = runbookSignals.some((item) => item.readiness === "ready")
    || incidentSetups.some((item) => item.runbookCount + item.automationCount > 0);
  const hasReview = lifecycleSignals.some((item) => ["timeline", "retrospective", "postmortem"].includes(item.signal) && item.readiness === "ready")
    || incidentSetups.some((item) => item.timelineCount + item.postmortemCount > 0);

  const riskQueue: IncidentResponseReadinessReport["riskQueue"] = [];
  if (!hasIntake) {
    riskQueue.push({
      priority: "high",
      action: "Add or document incident intake before claiming incident-response readiness.",
      why: "Incident response needs a visible alert route, signal rule, webhook, email ingest, or manual incident entrypoint.",
      relatedHref: "html/incident-response-readiness.html"
    });
  }
  if (hasIntake && !hasOnCall) {
    riskQueue.push({
      priority: "medium",
      action: "Connect incident intake to schedules, rotations, handoffs, and escalation policies.",
      why: "Alerts are operationally incomplete unless the responsible on-call path and escalation chain are explicit.",
      relatedHref: "html/incident-response-readiness.html"
    });
  }
  if (hasOnCall && !hasRunbook) {
    riskQueue.push({
      priority: "medium",
      action: "Attach runbooks, automatic steps, owners, and incident-specific instructions to the escalation path.",
      why: "On-call routing does not tell responders what to do after they are paged.",
      relatedHref: "html/incident-response-readiness.html"
    });
  }
  if (hasIntake && !hasCommunication) {
    riskQueue.push({
      priority: "medium",
      action: "Document responder and stakeholder communication channels such as Slack, ChatOps, phone, SMS, email, or status pages.",
      why: "Incident coordination needs both responder notification and user/stakeholder communication paths.",
      relatedHref: "html/incident-response-readiness.html"
    });
  }
  if (hasIntake && !hasReview) {
    riskQueue.push({
      priority: "medium",
      action: "Add timeline, retrospective, postmortem, or incident-role evidence.",
      why: "Incident readiness should include learning and accountability after resolution, not just paging.",
      relatedHref: "html/incident-response-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static incident-response readiness only; it does not page responders, create incidents, change on-call schedules, contact PagerDuty/Grafana OnCall/FireHydrant, or publish status pages.",
    why: "Incident creation, paging, escalation, and public communications must run only through authorized operational workflows.",
    relatedHref: "html/incident-response-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `PagerDuty/Grafana OnCall/FireHydrant-style incident response readiness report: setup ${incidentSetups.length} files, intake signals ${intakeSignals.length}, on-call signals ${onCallSignals.length}, runbook signals ${runbookSignals.length} were mapped from static evidence.`,
    sourcePattern: "Incident response readiness PagerDuty Grafana OnCall FireHydrant alert routing escalation schedules runbooks status pages postmortems",
    incidentSetups,
    intakeSignals,
    triageSignals,
    onCallSignals,
    communicationSignals,
    runbookSignals,
    lifecycleSignals,
    governanceSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"pagerduty|grafana-oncall|firehydrant|incident|signal_rule|alert route|webhook|inbound email\" .", purpose: "Find incident intake, alert routing, and incident-management provider evidence." },
      { command: "rg \"escalation policy|on.?call schedule|rotation|handoff|override|follow-the-sun\" .", purpose: "Find on-call schedules, rotations, handoffs, overrides, and escalation paths." },
      { command: "rg \"runbook|automatic step|manual step|attachment_rule|owner_id|restricted|private incident\" .", purpose: "Find incident runbooks, automation, ownership, and private incident controls." },
      { command: "rg \"postmortem|post-mortem|retrospective|timeline|status page|statuspage|acknowledge|resolve\" .", purpose: "Find incident lifecycle, communication, and review evidence." }
    ],
    learnerNextSteps: [
      "Start with intake routes, then confirm every route maps to a service, team, severity, or incident type.",
      "Verify schedules, rotations, handoffs, overrides, and escalation policies before trusting on-call coverage.",
      "Read runbooks and automation steps next; check owners, attachment rules, and private incident restrictions.",
      "Confirm responder communication, stakeholder notification, status page, timeline, retrospective, and postmortem evidence.",
      "This report is static readiness only. Real paging, incident creation, escalation, and status-page updates require authorized operations."
    ]
  };
}

type IncidentResponseSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function incidentResponseSourceFiles(walk: WalkResult): Promise<IncidentResponseSourceFile[]> {
  const files: IncidentResponseSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !incidentResponseInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!incidentResponsePathSignal(file.relPath) && !incidentResponseContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function incidentResponseInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|go\.mod|requirements.*\.txt|pyproject\.toml|terraform\.tf|main\.tf|variables\.tf|outputs\.tf|Dockerfile|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(incident|incidents|runbook|runbooks|oncall|on-call|pagerduty|firehydrant|statuspage|status-page|ops|sre|alerts?|monitoring|terraform|infra|docs?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(tf|tfvars|hcl|js|ts|mjs|cjs|json|ya?ml|toml|md|py|go|sh|conf|ini)$/i.test(filePath);
}

function incidentResponsePathSignal(filePath: string): boolean {
  return /(incident|oncall|on-call|pagerduty|firehydrant|runbook|escalation|schedule|rotation|statuspage|status-page|postmortem|post-mortem|retrospective)/i.test(filePath);
}

function incidentResponseContentSignal(text: string): boolean {
  return /(PagerDuty|pagerduty|grafana-oncall|on-call|oncall|FireHydrant|firehydrant|incident|signal_rule|alert route|escalation policy|on_call_schedule|rotation|handoff|runbook|status page|statuspage|postmortem|post-mortem|retrospective)/i.test(text);
}

function incidentResponseSetupRows(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["incidentSetups"] {
  const rows: IncidentResponseReadinessReport["incidentSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const incidentCount = countMatches(source.text, /incident|firehydrant_incident|manual incident|declare incident|incident_type/gi);
    const alertRouteCount = countMatches(source.text, /alert route|alert group|signal_rule|routing|route|webhook|inbound email|email ingest|Alertmanager|deduplication/gi);
    const escalationCount = countMatches(source.text, /escalation|escalation_policy|escalation policy|dynamic escalation|handoff step/gi);
    const scheduleCount = countMatches(source.text, /on.?call schedule|on_call_schedule|schedule|rotation|handoff|override|follow-the-sun|follow the sun/gi);
    const notificationCount = countMatches(source.text, /Slack|ChatOps|phone|SMS|Telegram|Twilio|email|notification|notify/gi);
    const runbookCount = countMatches(source.text, /runbook|automatic step|manual step|attachment_rule|owner_id|repeats|repeat_duration|private incident|restricted/gi);
    const statusPageCount = countMatches(source.text, /status page|statuspage|public status|subscriber|stakeholder/gi);
    const roleCount = countMatches(source.text, /incident role|incident_role|commander|scribe|owner|team assignment|team_id|service owner/gi);
    const severityCount = countMatches(source.text, /severity|priority|sev[0-9]|SEV[0-9]|incident_type|incident type|impact/gi);
    const timelineCount = countMatches(source.text, /timeline|acknowledge|acknowledged|resolve|resolved|mitigated|update status/gi);
    const postmortemCount = countMatches(source.text, /postmortem|post-mortem|retrospective|review|lessons learned|follow-up|follow up/gi);
    const automationCount = countMatches(source.text, /automatic|automation|runbook action|terraform plan|import|drift|validate|incident drill|drill/gi);
    const ciCount = countMatches(haystack, /\.github\/workflows|terraform plan|terraform validate|CI|pull_request|schedule|runs-on|PAGERDUTY_TOKEN|FIREHYDRANT_API_KEY|GRAFANA_ONCALL/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = incidentCount + alertRouteCount + escalationCount + scheduleCount + notificationCount + runbookCount + statusPageCount + roleCount + severityCount + timelineCount + postmortemCount + automationCount + ciCount;
    if (totalSignals === 0 && !incidentResponsePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: incidentResponsePlatform(source),
      incidentCount,
      alertRouteCount,
      escalationCount,
      scheduleCount,
      notificationCount,
      runbookCount,
      statusPageCount,
      roleCount,
      severityCount,
      timelineCount,
      postmortemCount,
      automationCount,
      ciCount,
      readiness: (incidentCount + alertRouteCount > 0) && (escalationCount + scheduleCount > 0) && runbookCount > 0 && notificationCount > 0 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains incident ${incidentCount}, alert routes ${alertRouteCount}, escalation ${escalationCount}, schedules ${scheduleCount}, notifications ${notificationCount}, runbooks ${runbookCount}, status pages ${statusPageCount}, roles ${roleCount}, severity ${severityCount}, timeline ${timelineCount}, postmortem ${postmortemCount}, automation ${automationCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.incidentCount + b.alertRouteCount + b.escalationCount + b.scheduleCount + b.runbookCount + b.notificationCount + b.postmortemCount + b.ciCount;
    const aScore = a.incidentCount + a.alertRouteCount + a.escalationCount + a.scheduleCount + a.runbookCount + a.notificationCount + a.postmortemCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function incidentResponsePlatform(source: IncidentResponseSourceFile): IncidentResponseReadinessReport["incidentSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (/\.tf$|terraform|provider\s+"pagerduty"|provider\s+"firehydrant"|pagerduty_|firehydrant_/i.test(haystack)) return "terraform";
  if (/grafana-oncall|Grafana OnCall|oncall_engine|oncall/i.test(haystack)) return "grafana-oncall";
  if (/firehydrant|FireHydrant/i.test(haystack)) return "firehydrant";
  if (/pagerduty|PagerDuty/i.test(haystack)) return "pagerduty";
  if (/status page|statuspage/i.test(haystack)) return "status-page";
  if (/runbook/i.test(haystack)) return "runbook";
  return "unknown";
}

function incidentIntakeSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["intakeSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["intakeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "alert-route", pattern: /alert route|alert group|routing|route|Alertmanager|integration/i, evidence: "alert route evidence was detected." },
    { signal: "signal-rule", pattern: /signal_rule|signal rule|firehydrant_signal_rule/i, evidence: "signal rule evidence was detected." },
    { signal: "webhook", pattern: /webhook|web hook/i, evidence: "webhook evidence was detected." },
    { signal: "email-ingest", pattern: /inbound email|email ingest|email target/i, evidence: "email ingest evidence was detected." },
    { signal: "manual-incident", pattern: /manual incident|declare incident|create incident|incident_type/i, evidence: "manual incident evidence was detected." },
    { signal: "deduplication", pattern: /deduplication|dedupe|dedup/i, evidence: "deduplication evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "intake");
}

function incidentTriageSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["triageSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["triageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "severity", pattern: /severity|sev[0-9]|SEV[0-9]/i, evidence: "severity evidence was detected." },
    { signal: "priority", pattern: /priority|impact|urgency/i, evidence: "priority evidence was detected." },
    { signal: "incident-type", pattern: /incident_type|incident type/i, evidence: "incident type evidence was detected." },
    { signal: "service-ownership", pattern: /service|service owner|service_id|service escalation/i, evidence: "service ownership evidence was detected." },
    { signal: "team-assignment", pattern: /team assignment|team_id|team escalation|team\b/i, evidence: "team assignment evidence was detected." },
    { signal: "deduplication", pattern: /deduplication|dedupe|dedup/i, evidence: "deduplication evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "triage");
}

function incidentOnCallSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["onCallSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["onCallSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "schedule", pattern: /on.?call schedule|on_call_schedule|schedule/i, evidence: "on-call schedule evidence was detected." },
    { signal: "rotation", pattern: /rotation|rotation_name|rotation_description/i, evidence: "rotation evidence was detected." },
    { signal: "handoff", pattern: /handoff|hand-off/i, evidence: "handoff evidence was detected." },
    { signal: "escalation-policy", pattern: /escalation policy|escalation_policy|dynamic escalation|escalation/i, evidence: "escalation policy evidence was detected." },
    { signal: "override", pattern: /override|override schedule|schedule override/i, evidence: "override evidence was detected." },
    { signal: "follow-the-sun", pattern: /follow-the-sun|follow the sun|timezone|time zone/i, evidence: "follow-the-sun or timezone evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "on-call");
}

function incidentCommunicationSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["communicationSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["communicationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "slack", pattern: /Slack|slack/i, evidence: "Slack evidence was detected." },
    { signal: "chatops", pattern: /ChatOps|chat ops|incident channel|channel bookmark/i, evidence: "ChatOps evidence was detected." },
    { signal: "phone", pattern: /phone|call|voice/i, evidence: "phone evidence was detected." },
    { signal: "sms", pattern: /SMS|Twilio|text message/i, evidence: "SMS evidence was detected." },
    { signal: "email", pattern: /email|mail/i, evidence: "email evidence was detected." },
    { signal: "status-page", pattern: /status page|statuspage|public status|stakeholder/i, evidence: "status page evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "communication");
}

function incidentRunbookSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["runbookSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["runbookSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "runbook", pattern: /runbook/i, evidence: "runbook evidence was detected." },
    { signal: "automatic-step", pattern: /automatic step|automatic|runbook action/i, evidence: "automatic runbook step evidence was detected." },
    { signal: "manual-step", pattern: /manual step|manual action|manual/i, evidence: "manual step evidence was detected." },
    { signal: "owner", pattern: /owner_id|owner|runbook owner/i, evidence: "runbook owner evidence was detected." },
    { signal: "attachment-rule", pattern: /attachment_rule|attachment rule|attach runbook/i, evidence: "runbook attachment-rule evidence was detected." },
    { signal: "private-incident", pattern: /private incident|restricted|restricted runbook/i, evidence: "private incident or restricted runbook evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "runbook");
}

function incidentLifecycleSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "acknowledge", pattern: /acknowledge|acknowledged|ack/i, evidence: "acknowledge evidence was detected." },
    { signal: "resolve", pattern: /resolve|resolved|mitigate|mitigated/i, evidence: "resolve evidence was detected." },
    { signal: "timeline", pattern: /timeline|incident timeline|event timeline/i, evidence: "timeline evidence was detected." },
    { signal: "retrospective", pattern: /retrospective|retro/i, evidence: "retrospective evidence was detected." },
    { signal: "postmortem", pattern: /postmortem|post-mortem|lessons learned/i, evidence: "postmortem evidence was detected." },
    { signal: "incident-role", pattern: /incident role|incident_role|commander|scribe/i, evidence: "incident role evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "lifecycle");
}

function incidentGovernanceSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["governanceSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "terraform-provider", pattern: /terraform|provider\s+"pagerduty"|provider\s+"firehydrant"|pagerduty_|firehydrant_/i, evidence: "Terraform provider evidence was detected." },
    { signal: "api-token", pattern: /PAGERDUTY_TOKEN|FIREHYDRANT_API_KEY|api token|API key/i, evidence: "API token reference evidence was detected." },
    { signal: "audit-log", pattern: /audit log|audit trail|audit/i, evidence: "audit log evidence was detected." },
    { signal: "access-control", pattern: /access control|permission|RBAC|role-based|restricted/i, evidence: "access-control evidence was detected." },
    { signal: "restricted-runbook", pattern: /restricted runbook|restricted|private incident/i, evidence: "restricted runbook evidence was detected." },
    { signal: "enterprise-tier", pattern: /Enterprise tier|enterprise tier|enterprise/i, evidence: "enterprise tier evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "governance");
}

function incidentWorkflowSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ci-validate", pattern: /\.github\/workflows|terraform validate|CI|pull_request|runs-on/i, evidence: "CI validation evidence was detected." },
    { signal: "terraform-plan", pattern: /terraform plan/i, evidence: "terraform plan evidence was detected." },
    { signal: "import", pattern: /terraform import|\bimport\b|supports imports/i, evidence: "import evidence was detected." },
    { signal: "drift-detection", pattern: /drift|deleted outside of Terraform|refresh/i, evidence: "drift detection evidence was detected." },
    { signal: "incident-drill", pattern: /incident drill|fire drill|game day|drill/i, evidence: "incident drill evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "workflow");
}

function incidentPackageSignals(sourceFiles: IncidentResponseSourceFile[]): IncidentResponseReadinessReport["packageSignals"] {
  const specs: Array<{ signal: IncidentResponseReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pagerduty-provider", pattern: /terraform-provider-pagerduty|pagerduty_|provider\s+"pagerduty"|PagerDuty/i, evidence: "PagerDuty provider evidence was detected." },
    { signal: "grafana-oncall", pattern: /grafana-oncall|Grafana OnCall|oncall_engine|oncall/i, evidence: "Grafana OnCall evidence was detected." },
    { signal: "firehydrant-provider", pattern: /terraform-provider-firehydrant|firehydrant_|provider\s+"firehydrant"|FireHydrant/i, evidence: "FireHydrant provider evidence was detected." },
    { signal: "slack-sdk", pattern: /@slack|slack_sdk|Slack/i, evidence: "Slack SDK or integration evidence was detected." },
    { signal: "twilio", pattern: /twilio|Twilio|SMS/i, evidence: "Twilio/SMS evidence was detected." }
  ];
  return incidentSignalFromSpecs(sourceFiles, specs, "package");
}

function incidentSignalFromSpecs<T extends string>(
  sourceFiles: IncidentResponseSourceFile[],
  specs: Array<{ signal: T; pattern: RegExp; evidence: string }>,
  label: string
): Array<{ signal: T; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(haystack);
    });
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/incident-response-readiness.html"
    };
  });
}

export async function buildSloReadinessReport(walk: WalkResult): Promise<SloReadinessReport> {
  const sourceFiles = await sloSourceFiles(walk);
  const sloSetups = sloSetupRows(sourceFiles);
  const specSignals = sloSpecSignals(sourceFiles);
  const openSloObjectSignals = sloOpenSloObjectSignals(sourceFiles);
  const timeWindowSignals = sloTimeWindowSignals(sourceFiles);
  const metricSourceSignals = sloMetricSourceSignals(sourceFiles);
  const indicatorSignals = sloIndicatorSignals(sourceFiles);
  const objectiveSignals = sloObjectiveSignals(sourceFiles);
  const alertSignals = sloAlertSignals(sourceFiles);
  const ruleSignals = sloRuleSignals(sourceFiles);
  const governanceSignals = sloGovernanceSignals(sourceFiles);
  const workflowSignals = sloWorkflowSignals(sourceFiles);
  const packageSignals = sloPackageSignals(sourceFiles);

  const hasSpec = specSignals.some((item) => item.readiness === "ready") || sloSetups.some((item) => item.sloCount > 0);
  const hasIndicator = indicatorSignals.some((item) => item.readiness === "ready") || sloSetups.some((item) => item.sliCount + item.dataSourceCount > 0);
  const hasObjective = objectiveSignals.some((item) => item.readiness === "ready") || sloSetups.some((item) => item.objectiveCount + item.targetCount + item.windowCount > 0);
  const hasAlerting = alertSignals.some((item) => item.readiness === "ready") || sloSetups.some((item) => item.alertCount + item.burnRateCount > 0);
  const hasRules = ruleSignals.some((item) => item.readiness === "ready") || sloSetups.some((item) => item.recordingRuleCount > 0);
  const hasValidation = workflowSignals.some((item) => item.readiness === "ready") || sloSetups.some((item) => item.validationCount + item.ciCount > 0);

  const riskQueue: SloReadinessReport["riskQueue"] = [];
  if (!hasSpec) {
    riskQueue.push({
      priority: "high",
      action: "Add or document SLO specs before claiming SLO readiness.",
      why: "SLO readiness needs explicit OpenSLO, Sloth, Pyrra, PrometheusRule, or equivalent service-level-objective manifests.",
      relatedHref: "html/slo-readiness.html"
    });
  }
  if (hasSpec && !hasIndicator) {
    riskQueue.push({
      priority: "medium",
      action: "Connect each SLO to a measurable SLI.",
      why: "Targets are not actionable unless the good/total, bad/total, raw ratio, threshold, latency, or availability indicator is visible.",
      relatedHref: "html/slo-readiness.html"
    });
  }
  if (hasSpec && !hasObjective) {
    riskQueue.push({
      priority: "medium",
      action: "Add objective targets, time windows, and budgeting method evidence.",
      why: "Error budgets depend on a target and a window; missing objective metadata makes burn-rate interpretation ambiguous.",
      relatedHref: "html/slo-readiness.html"
    });
  }
  if (hasSpec && !hasAlerting) {
    riskQueue.push({
      priority: "medium",
      action: "Pair SLOs with burn-rate alerting and notification labels.",
      why: "SLO specs without page/ticket or Prometheus alert rules may not drive operational action when budgets burn.",
      relatedHref: "html/slo-readiness.html"
    });
  }
  if (hasSpec && !hasRules) {
    riskQueue.push({
      priority: "medium",
      action: "Check generated recording rules or Prometheus Operator rule outputs.",
      why: "Tools such as Sloth and Pyrra turn SLOs into recording and alerting rules; readiness should show where those rules are generated or routed.",
      relatedHref: "html/slo-readiness.html"
    });
  }
  if (hasSpec && !hasValidation) {
    riskQueue.push({
      priority: "medium",
      action: "Add CI validation or dry-run coverage for SLO manifests.",
      why: "SLO YAML can drift or fail to compile; CI validation catches broken specs before alerting changes land.",
      relatedHref: "html/slo-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static SLO readiness only; it does not evaluate PromQL, query Prometheus/Grafana, apply Kubernetes resources, generate rules, or page teams.",
    why: "SLO correctness and burn-rate behavior must be verified through authorized observability and deployment workflows.",
    relatedHref: "html/slo-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `OpenSLO/Sloth/Pyrra-style SLO readiness report: setup ${sloSetups.length} files, OpenSLO object signals ${openSloObjectSignals.length}, time-window signals ${timeWindowSignals.length}, metric-source signals ${metricSourceSignals.length}, indicator signals ${indicatorSignals.length}, objective signals ${objectiveSignals.length}, alert signals ${alertSignals.length} were mapped from static evidence.`,
    sourcePattern: "SLO readiness OpenSLO object model DataSource SLO SLI AlertPolicy AlertCondition AlertNotificationTarget Service duration shorthand service level objective SLI error budget burn rate Prometheus recording rules",
    sloSetups,
    specSignals,
    openSloObjectSignals,
    timeWindowSignals,
    metricSourceSignals,
    indicatorSignals,
    objectiveSignals,
    alertSignals,
    ruleSignals,
    governanceSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"apiVersion: (openslo|pyrra)|kind: (SLO|SLI|ServiceLevelObjective)|sloth.dev\" .", purpose: "Find OpenSLO, Pyrra, and Sloth SLO specification surfaces." },
      { command: "rg \"kind: (DataSource|SLO|SLI|AlertPolicy|AlertCondition|AlertNotificationTarget|Service)|metadata:|displayName|annotations:\" .", purpose: "Review OpenSLO object kinds and metadata required for portable ownership." },
      { command: "rg \"duration: [0-9]+[mhdwMQY]|isRolling|calendar:|timeZone|Occurrences|Timeslices|RatioTimeslices\" .", purpose: "Review OpenSLO time-window and budgeting method semantics." },
      { command: "rg \"metricSourceRef|metricSource:|connectionDetails|rawType|good:|bad:|total:|op: (lte|gte|lt|gt)\" .", purpose: "Review metric source references, ratio inputs, raw ratios, and threshold operators." },
      { command: "rg \"ratioMetric|thresholdMetric|indicator:|error_query|total_query|latency|availability|raw ratio\" .", purpose: "Review SLI indicator definitions and PromQL query inputs." },
      { command: "rg \"targetPercent|target:|objective:|timeWindow|window:|budgetingMethod|error budget\" .", purpose: "Review objectives, targets, windows, and budgeting method evidence." },
      { command: "rg \"burnrate|burn rate|page_alert|ticket_alert|PrometheusRule|recording rule|alertAfter|multi window\" .", purpose: "Review burn-rate alerting and generated rule evidence." },
      { command: "rg \"sloth validate|pyrra|kubectl apply|helm chart|dry-run|generic-rules\" .github . scripts ops deploy", purpose: "Review validation, deployment, and rule-generation workflows." }
    ],
    learnerNextSteps: [
      "Start by finding SLO specs and confirming the owning service/team labels.",
      "Check OpenSLO object kinds, metadata.name, displayName, labels, and annotations before treating specs as portable.",
      "Confirm timeWindow duration shorthand, rolling or calendar alignment, timezone, and budgeting method semantics.",
      "Trace metricSourceRef/type/spec, connection details, good/bad/total/raw ratios, and threshold operators for every SLI.",
      "For each SLO, verify the SLI query shape: ratio, threshold, latency, availability, or raw error ratio.",
      "Check target, targetPercent, objective, timeWindow/window, and budgetingMethod before trusting an error budget.",
      "Review burn-rate alerting, page/ticket labels, generated recording rules, and Prometheus Operator routing.",
      "This report is static readiness only. Real SLO correctness requires authorized PromQL evaluation, rule generation, and observability review."
    ]
  };
}

type SloSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function sloSourceFiles(walk: WalkResult): Promise<SloSourceFile[]> {
  const files: SloSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !sloInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!sloPathSignal(file.relPath) && !sloContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function sloInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|go\.mod|requirements.*\.txt|pyproject\.toml|Chart\.ya?ml|values\.ya?ml|README\.md)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(slo|slos|sli|slis|openslo|sloth|pyrra|prometheus|prometheus-rule|prometheusrule|grafana|dashboards?|alerts?|alerting|monitoring|observability|ops|sre|k8s|kubernetes|helm|charts?|manifests?|deploy|docs?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(ya?ml|json|jsonnet|toml|md|tf|hcl|js|ts|mjs|cjs|py|go|sh|conf|ini)$/i.test(filePath);
}

function sloPathSignal(filePath: string): boolean {
  return /(slo|sli|openslo|sloth|pyrra|servicelevelobjective|prometheusrule|error-budget|burnrate|burn-rate)/i.test(filePath);
}

function sloContentSignal(text: string): boolean {
  return /(OpenSLO|openslo|sloth\.dev|Sloth|Pyrra|pyrra\.dev|ServiceLevelObjective|kind:\s*(SLO|SLI)|service level objective|error budget|burnrate|burn rate|budgetingMethod|ratioMetric|thresholdMetric|targetPercent|page_alert|ticket_alert|PrometheusRule)/i.test(text);
}

function sloSetupRows(sourceFiles: SloSourceFile[]): SloReadinessReport["sloSetups"] {
  const rows: SloReadinessReport["sloSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const sloCount = countMatches(source.text, /kind:\s*SLO\b|ServiceLevelObjective|service level objective|\bslos?\s*:|pyrra\.dev\/v1alpha1|openslo\/v1|sloth\.dev/gi);
    const sliCount = countMatches(source.text, /kind:\s*SLI\b|SLI\b|indicator\s*:|indicatorRef|ratioMetric|thresholdMetric|error_query|total_query|raw ratio|latencyNative|boolGauge/gi);
    const objectiveCount = countMatches(source.text, /objectives?\s*:|objective\s*:|targetPercent|target\s*:|timeSliceTarget|compositeWeight/gi);
    const targetCount = countMatches(source.text, /targetPercent|target\s*:|objective\s*:\s*["']?[0-9]|target\s*=\s*["']?[0-9]/gi);
    const windowCount = countMatches(source.text, /timeWindow|window\s*:|timeSliceWindow|\{\{\.window\}\}|\[[0-9]+[smhdw]\]|[0-9]+\s*(minute|hour|day|week)/gi);
    const budgetCount = countMatches(source.text, /budgetingMethod|error budget|burn(?:ed)? budget|Occurrences|Timeslices|RatioTimeslices|budget target/gi);
    const alertCount = countMatches(source.text, /alerting\s*:|page_alert|ticket_alert|alertAfter|PrometheusRule|alert rules?|severity|slack_channel|multi window|multi burn/gi);
    const recordingRuleCount = countMatches(source.text, /recording rules?|PrometheusRule|rules\s*:|ruleOutput|generic-rules|promOpRulesGenerated|slo:sli_error|slo:objective|burnrate[0-9]+[smhdw]/gi);
    const burnRateCount = countMatches(source.text, /burnrate|burn rate|burn-rate|multi.?window|multi.?burn|MWMB|short window|long window/gi);
    const labelCount = countMatches(source.text, /labels\s*:|annotations\s*:|pyrra\.dev\/team|team\s*:|service\s*:|owner|runbook|dashboard/gi);
    const dataSourceCount = countMatches(source.text, /dataSourceRef|prometheus|Prometheus|query\s*:|promql|good\s*:|bad\s*:|total\s*:|error_query|total_query/gi);
    const validationCount = countMatches(source.text, /validate|validation|admission|dry-run|kubectl apply|sloth validate|pyrra filesy?stem|promtool/gi);
    const dashboardCount = countMatches(source.text, /Grafana|dashboard|generic-rules|grafana-external-url|grafana datasource|Explore/i);
    const ciCount = countMatches(haystack, /\.github\/workflows|CI|pull_request|runs-on|sloth validate|pyrra|kubectl apply|helm|promtool|dry-run/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = sloCount + sliCount + objectiveCount + targetCount + windowCount + budgetCount + alertCount + recordingRuleCount + burnRateCount + labelCount + dataSourceCount + validationCount + dashboardCount + ciCount;
    if (totalSignals === 0 && !sloPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: sloPlatform(source),
      sloCount,
      sliCount,
      objectiveCount,
      targetCount,
      windowCount,
      budgetCount,
      alertCount,
      recordingRuleCount,
      burnRateCount,
      labelCount,
      dataSourceCount,
      validationCount,
      dashboardCount,
      ciCount,
      readiness: sloCount > 0 && sliCount > 0 && targetCount > 0 && windowCount > 0 && (alertCount + recordingRuleCount + burnRateCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains SLO ${sloCount}, SLI ${sliCount}, objectives ${objectiveCount}, targets ${targetCount}, windows ${windowCount}, budgets ${budgetCount}, alerts ${alertCount}, recording rules ${recordingRuleCount}, burn-rate ${burnRateCount}, labels ${labelCount}, data sources ${dataSourceCount}, validation ${validationCount}, dashboards ${dashboardCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.sloCount + b.sliCount + b.objectiveCount + b.targetCount + b.windowCount + b.alertCount + b.recordingRuleCount + b.burnRateCount + b.ciCount;
    const aScore = a.sloCount + a.sliCount + a.objectiveCount + a.targetCount + a.windowCount + a.alertCount + a.recordingRuleCount + a.burnRateCount + a.ciCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function sloPlatform(source: SloSourceFile): SloReadinessReport["sloSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (/pyrra\.dev|ServiceLevelObjective|Pyrra/i.test(haystack)) return "pyrra";
  if (/sloth\.dev|Sloth|prometheus\/v1/i.test(haystack)) return "sloth";
  if (/openslo|OpenSLO|kind:\s*(SLO|SLI)\b|budgetingMethod|ratioMetric|thresholdMetric/i.test(haystack)) return "openslo";
  if (/PrometheusRule|recording rules?|burnrate/i.test(haystack)) return "prometheus-rule";
  if (/Grafana|dashboard/i.test(haystack)) return "grafana-dashboard";
  if (/slo|sli|service level objective/i.test(haystack)) return "custom";
  return "unknown";
}

function sloSpecSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["specSignals"] {
  const specs: Array<{ signal: SloReadinessReport["specSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "openslo", pattern: /OpenSLO|openslo\/v1|openslo\.com|kind:\s*(SLO|SLI)\b|budgetingMethod/i, evidence: "OpenSLO-style spec evidence was detected." },
    { signal: "sloth-spec", pattern: /sloth\.dev|Sloth|version:\s*"prometheus\/v1"|prometheusservicelevels/i, evidence: "Sloth spec evidence was detected." },
    { signal: "pyrra-crd", pattern: /pyrra\.dev\/v1alpha1|kind:\s*ServiceLevelObjective|Pyrra/i, evidence: "Pyrra ServiceLevelObjective CRD evidence was detected." },
    { signal: "prometheus-rule", pattern: /PrometheusRule|recording rules?|alerting rules?|groups:\s*|rules:\s*/i, evidence: "Prometheus rule evidence was detected." },
    { signal: "yaml-manifest", pattern: /apiVersion:|kind:|metadata:|spec:/i, evidence: "YAML manifest evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "spec");
}

function sloOpenSloObjectSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["openSloObjectSignals"] {
  const specs: Array<{ signal: SloReadinessReport["openSloObjectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "data-source-kind", pattern: /kind:\s*DataSource\b|connectionDetails\s*:/i, evidence: "OpenSLO DataSource object evidence was detected." },
    { signal: "slo-kind", pattern: /kind:\s*SLO\b|service level objective/i, evidence: "OpenSLO SLO object evidence was detected." },
    { signal: "sli-kind", pattern: /kind:\s*SLI\b|indicatorRef\s*:|ratioMetric\s*:|thresholdMetric\s*:/i, evidence: "OpenSLO SLI object evidence was detected." },
    { signal: "alert-policy-kind", pattern: /kind:\s*AlertPolicy\b|alertWhenBreaching|alertWhenResolved|alertWhenNoData/i, evidence: "OpenSLO AlertPolicy object evidence was detected." },
    { signal: "alert-condition-kind", pattern: /kind:\s*AlertCondition\b|lookbackWindow\s*:|conditionRef\s*:/i, evidence: "OpenSLO AlertCondition object evidence was detected." },
    { signal: "alert-notification-target-kind", pattern: /kind:\s*AlertNotificationTarget\b|notificationTargets\s*:|targetRef\s*:/i, evidence: "OpenSLO AlertNotificationTarget object evidence was detected." },
    { signal: "service-kind", pattern: /kind:\s*Service\b|spec:\s*\n\s*description:.*service/i, evidence: "OpenSLO Service object evidence was detected." },
    { signal: "metadata-name", pattern: /metadata:\s*\n(?:\s+[A-Za-z0-9_.-]+:\s*.*\n)*\s+name\s*:/i, evidence: "OpenSLO metadata.name evidence was detected." },
    { signal: "display-name", pattern: /displayName\s*:/i, evidence: "OpenSLO displayName evidence was detected." },
    { signal: "labels", pattern: /labels\s*:/i, evidence: "OpenSLO labels evidence was detected." },
    { signal: "annotations", pattern: /annotations\s*:|openslo\.com\//i, evidence: "OpenSLO annotations evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "openslo-object");
}

function sloTimeWindowSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["timeWindowSignals"] {
  const specs: Array<{ signal: SloReadinessReport["timeWindowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "duration-shorthand", pattern: /duration:\s*[0-9]+[mhdwMQY]\b|timeSliceWindow:\s*[0-9]+[mhdwMQY]\b|lookbackWindow:\s*[0-9]+[mhdwMQY]\b|alertAfter:\s*[0-9]+[mhdwMQY]\b/i, evidence: "OpenSLO duration shorthand evidence was detected." },
    { signal: "rolling-window", pattern: /isRolling:\s*true|rolling time window|window:\s*[0-9]+[mhdwMQY]\b/i, evidence: "rolling time window evidence was detected." },
    { signal: "calendar-window", pattern: /calendar:\s*|isRolling:\s*false|calendar.aligned/i, evidence: "calendar-aligned time window evidence was detected." },
    { signal: "time-zone", pattern: /timeZone\s*:|IANA Time Zone|America\/[A-Za-z_]+/i, evidence: "time zone evidence was detected." },
    { signal: "budgeting-occurrences", pattern: /budgetingMethod:\s*Occurrences\b|Occurrences method/i, evidence: "Occurrences budgeting evidence was detected." },
    { signal: "budgeting-timeslices", pattern: /budgetingMethod:\s*Timeslices\b|Timeslices method|timeSliceTarget/i, evidence: "Timeslices budgeting evidence was detected." },
    { signal: "budgeting-ratio-timeslices", pattern: /budgetingMethod:\s*RatioTimeslices\b|RatioTimeslices method/i, evidence: "RatioTimeslices budgeting evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "time-window");
}

function sloMetricSourceSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["metricSourceSignals"] {
  const specs: Array<{ signal: SloReadinessReport["metricSourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metric-source-ref", pattern: /metricSourceRef\s*:|dataSourceRef\s*:/i, evidence: "metric source reference evidence was detected." },
    { signal: "metric-source-type", pattern: /metricSource\s*:[\s\S]{0,240}?type\s*:|DataSource[\s\S]{0,240}?type\s*:/i, evidence: "metric source type evidence was detected." },
    { signal: "connection-details", pattern: /connectionDetails\s*:|accessKeyID|secretAccessKey|clusterId|databaseName/i, evidence: "connection details evidence was detected." },
    { signal: "ratio-good-total", pattern: /ratioMetric[\s\S]{0,800}?good\s*:[\s\S]{0,800}?total\s*:|good\s*:[\s\S]{0,400}?total\s*:/i, evidence: "ratio good/total metric evidence was detected." },
    { signal: "ratio-bad-total", pattern: /ratioMetric[\s\S]{0,800}?bad\s*:[\s\S]{0,800}?total\s*:|bad\s*:[\s\S]{0,400}?total\s*:/i, evidence: "ratio bad/total metric evidence was detected." },
    { signal: "raw-ratio-type", pattern: /rawType\s*:\s*(success|failure)|raw\s*:|error_ratio_query|raw ratio/i, evidence: "raw ratio metric evidence was detected." },
    { signal: "threshold-operator", pattern: /thresholdMetric\s*:|op:\s*(lte|gte|lt|gt)\b|value\s*:/i, evidence: "threshold operator evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "metric-source");
}

function sloIndicatorSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["indicatorSignals"] {
  const specs: Array<{ signal: SloReadinessReport["indicatorSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ratio-metric", pattern: /ratioMetric|ratio:\s*|good\s*:|bad\s*:|total\s*:/i, evidence: "ratio metric evidence was detected." },
    { signal: "threshold-metric", pattern: /thresholdMetric|threshold metric|op:\s*(lte|gte|lt|gt)|value\s*:/i, evidence: "threshold metric evidence was detected." },
    { signal: "latency", pattern: /latency|duration|histogram|quantile|le="/i, evidence: "latency SLI evidence was detected." },
    { signal: "availability", pattern: /availability|success|failure|5xx|error ratio|http_requests/i, evidence: "availability SLI evidence was detected." },
    { signal: "error-query", pattern: /error_query|bad\s*:|errors?|failure/i, evidence: "error query evidence was detected." },
    { signal: "total-query", pattern: /total_query|total\s*:|all requests|request.*count/i, evidence: "total query evidence was detected." },
    { signal: "raw-ratio", pattern: /raw ratio|raw\s*:|errorRatioQuery|already calculated/i, evidence: "raw ratio evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "indicator");
}

function sloObjectiveSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["objectiveSignals"] {
  const specs: Array<{ signal: SloReadinessReport["objectiveSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "target", pattern: /target\s*:|objective\s*:|target\s*=/i, evidence: "target evidence was detected." },
    { signal: "target-percent", pattern: /targetPercent|target percent|99\.[0-9]+|99\b/i, evidence: "targetPercent evidence was detected." },
    { signal: "time-window", pattern: /timeWindow|window\s*:|timeSliceWindow|\{\{\.window\}\}|\[[0-9]+[smhdw]\]/i, evidence: "time window evidence was detected." },
    { signal: "budgeting-method", pattern: /budgetingMethod|Occurrences|Timeslices|RatioTimeslices/i, evidence: "budgeting method evidence was detected." },
    { signal: "composite-weight", pattern: /compositeWeight|Composite SLO|composite objective/i, evidence: "composite SLO evidence was detected." },
    { signal: "error-budget", pattern: /error budget|burned budget|budget target|budget burn/i, evidence: "error budget evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "objective");
}

function sloAlertSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["alertSignals"] {
  const specs: Array<{ signal: SloReadinessReport["alertSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "burn-rate", pattern: /burnrate|burn rate|burn-rate/i, evidence: "burn-rate evidence was detected." },
    { signal: "multi-window", pattern: /multi.?window|multi.?burn|short window|long window|MWMB/i, evidence: "multi-window burn evidence was detected." },
    { signal: "page-alert", pattern: /page_alert|page alert|critical alert|severity:\s*(page|critical)/i, evidence: "page alert evidence was detected." },
    { signal: "ticket-alert", pattern: /ticket_alert|ticket alert|warning alert|severity:\s*(ticket|warning)/i, evidence: "ticket alert evidence was detected." },
    { signal: "prometheus-alert", pattern: /PrometheusRule|alert:\s*|expr:\s*|for:\s*/i, evidence: "Prometheus alert rule evidence was detected." },
    { signal: "alert-after", pattern: /alertAfter|alert after|for:\s*[0-9]+[smhd]/i, evidence: "alert-after evidence was detected." },
    { signal: "alert-labels", pattern: /slack_channel|labels:\s*|annotations:\s*|runbook|dashboard/i, evidence: "alert label or annotation evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "alert");
}

function sloRuleSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["ruleSignals"] {
  const specs: Array<{ signal: SloReadinessReport["ruleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "recording-rules", pattern: /recording rules?|record:\s*|slo:sli_error|slo:objective|burnrate[0-9]+[smhdw]/i, evidence: "recording rule evidence was detected." },
    { signal: "prometheus-operator", pattern: /Prometheus Operator|PrometheusRule|prometheusrules|promOpRulesGenerated/i, evidence: "Prometheus Operator evidence was detected." },
    { signal: "promql-window-template", pattern: /\{\{\.window\}\}|\[[0-9]+[smhdw]\]|rate\(|increase\(|sum_over_time/i, evidence: "PromQL window evidence was detected." },
    { signal: "rule-output", pattern: /ruleOutput|role:\s*alert-rules|prometheus:\s*|thanos/i, evidence: "rule output routing evidence was detected." },
    { signal: "generic-rules", pattern: /generic-rules|--generic-rules|ConfigMap|filesystem mode/i, evidence: "generic rule output evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "rule");
}

function sloGovernanceSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["governanceSignals"] {
  const specs: Array<{ signal: SloReadinessReport["governanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "service-owner", pattern: /service\s*:|service owner|owner|ownership/i, evidence: "service ownership evidence was detected." },
    { signal: "labels", pattern: /labels\s*:|annotations\s*:|pyrra\.dev\/|slo_label/i, evidence: "label metadata evidence was detected." },
    { signal: "team", pattern: /team\s*:|pyrra\.dev\/team|slack_channel|team owner/i, evidence: "team routing evidence was detected." },
    { signal: "runbook-link", pattern: /runbook|playbook|dashboard_url|dashboard/i, evidence: "runbook/dashboard link evidence was detected." },
    { signal: "dashboard", pattern: /Grafana|dashboard|grafana-external-url|grafana datasource/i, evidence: "dashboard evidence was detected." },
    { signal: "validation", pattern: /validate|validation|admission|dry-run|promtool/i, evidence: "validation evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "governance");
}

function sloWorkflowSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: SloReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ci-validate", pattern: /\.github\/workflows|CI|pull_request|runs-on|promtool|validate/i, evidence: "CI validation evidence was detected." },
    { signal: "sloth-validate", pattern: /sloth validate|sloth.*validate/i, evidence: "Sloth validate evidence was detected." },
    { signal: "kubectl-apply", pattern: /kubectl apply|kubectl diff|kustomize build/i, evidence: "kubectl apply/diff evidence was detected." },
    { signal: "helm-chart", pattern: /helm upgrade|helm install|Chart\.yaml|values\.yaml|helm chart/i, evidence: "Helm chart evidence was detected." },
    { signal: "dry-run", pattern: /dry-run|server-dry-run|--dry-run/i, evidence: "dry-run evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "workflow");
}

function sloPackageSignals(sourceFiles: SloSourceFile[]): SloReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SloReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sloth", pattern: /sloth\.dev|github\.com\/slok\/sloth|sloth\b/i, evidence: "Sloth evidence was detected." },
    { signal: "pyrra", pattern: /pyrra\.dev|github\.com\/pyrra-dev\/pyrra|pyrra\b/i, evidence: "Pyrra evidence was detected." },
    { signal: "openslo", pattern: /OpenSLO|openslo/i, evidence: "OpenSLO evidence was detected." },
    { signal: "prometheus-operator", pattern: /prometheus-operator|PrometheusRule|kube-prometheus/i, evidence: "Prometheus Operator evidence was detected." },
    { signal: "grafana", pattern: /grafana|Grafana|grafana-dashboard/i, evidence: "Grafana evidence was detected." }
  ];
  return sloSignalFromSpecs(sourceFiles, specs, "package");
}

function sloSignalFromSpecs<T extends string>(
  sourceFiles: SloSourceFile[],
  specs: Array<{ signal: T; pattern: RegExp; evidence: string }>,
  label: string
): Array<{ signal: T; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(haystack);
    });
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/slo-readiness.html"
    };
  });
}

export async function buildCostReadinessReport(walk: WalkResult): Promise<CostReadinessReport> {
  const sourceFiles = await costSourceFiles(walk);
  const costSetups = costSetupRows(sourceFiles);
  const estimateSignals = costEstimateSignals(sourceFiles);
  const allocationSignals = costAllocationSignals(sourceFiles);
  const pricingSignals = costPricingSignals(sourceFiles);
  const budgetSignals = costBudgetSignals(sourceFiles);
  const observabilitySignals = costObservabilitySignals(sourceFiles);
  const workflowSignals = costWorkflowSignals(sourceFiles);
  const packageSignals = costPackageSignals(sourceFiles);

  const hasSetup = costSetups.length > 0 || packageSignals.some((item) => item.readiness === "ready");
  const hasEstimate = estimateSignals.some((item) => item.readiness === "ready") || costSetups.some((item) => item.estimateCount + item.diffCount > 0);
  const hasAllocation = allocationSignals.some((item) => item.readiness === "ready") || costSetups.some((item) => item.allocationCount > 0);
  const hasPricing = pricingSignals.some((item) => item.readiness === "ready") || costSetups.some((item) => item.pricingCount + item.cloudCostCount > 0);
  const hasBudget = budgetSignals.some((item) => item.readiness === "ready") || costSetups.some((item) => item.budgetCount + item.alertCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || costSetups.some((item) => item.prometheusCount + item.dashboardCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || costSetups.some((item) => item.workflowCount > 0);

  const riskQueue: CostReadinessReport["riskQueue"] = [];
  if (!hasSetup) {
    riskQueue.push({
      priority: "high",
      action: "Add static cost tooling evidence before claiming cost readiness.",
      why: "Cost readiness needs Infracost, OpenCost, Kubecost, Prometheus cost metrics, Helm values, or workflow evidence instead of generic budget prose.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  if (hasSetup && !hasEstimate) {
    riskQueue.push({
      priority: "medium",
      action: "Add pre-deploy cost estimate or diff evidence.",
      why: "Infracost-style breakdown/diff output helps reviewers see monthly cost changes before infrastructure changes land.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  if (hasSetup && !hasAllocation) {
    riskQueue.push({
      priority: "medium",
      action: "Add allocation dimensions such as namespace, pod, node, service, controller, or label.",
      why: "FinOps review needs ownership and allocation views, not only total spend.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  if (hasSetup && !hasPricing) {
    riskQueue.push({
      priority: "medium",
      action: "Document cloud provider, custom pricing, or cloud cost integration inputs.",
      why: "OpenCost/Kubecost-style allocation depends on pricing sources and cloud bill integration boundaries.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  if (hasSetup && !hasBudget) {
    riskQueue.push({
      priority: "medium",
      action: "Add budget, alert, forecast, savings, or rightsizing evidence.",
      why: "Cost visibility becomes operational when thresholds and savings workflows route action to owners.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  if (hasSetup && !hasObservability) {
    riskQueue.push({
      priority: "medium",
      action: "Connect cost readiness to Prometheus metrics, Grafana dashboards, or network/PV cost signals.",
      why: "Runtime allocation needs scrapeable metrics and dashboard/query surfaces for cost review.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  if (hasSetup && !hasWorkflow) {
    riskQueue.push({
      priority: "medium",
      action: "Add CI, PR comment, Helm install, kubectl cost, or MCP workflow evidence.",
      why: "Cost checks are most useful when they appear in deployment and review workflows.",
      relatedHref: "html/cost-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "RepoTutor records static cost readiness only; it does not run Infracost, query OpenCost/Kubecost, contact Prometheus/Grafana, inspect cloud bills, or calculate spend.",
    why: "Actual cost correctness requires authorized cloud billing, cluster metrics, and FinOps review workflows.",
    relatedHref: "html/cost-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `Infracost/OpenCost/Kubecost-style cost readiness report: setup ${costSetups.length} files, estimate signals ${estimateSignals.length}, allocation signals ${allocationSignals.length}, budget signals ${budgetSignals.length} were mapped from static evidence.`,
    sourcePattern: "Cost readiness Infracost OpenCost Kubecost FinOps cost allocation cloud cost budget pricing Prometheus",
    costSetups,
    estimateSignals,
    allocationSignals,
    pricingSignals,
    budgetSignals,
    observabilitySignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"infracost (breakdown|diff|scan|inspect)|INFRACOST_API_KEY|usage-file|config-file\" .", purpose: "Find Infracost estimate, diff, API key, usage-file, and config-file evidence." },
      { command: "rg \"OpenCost|Kubecost|cost allocation|allocation/compute|get_allocation_costs|aggregate=|kubectl cost\" .", purpose: "Find OpenCost/Kubecost allocation API and CLI surfaces." },
      { command: "rg \"cloudCost|CloudCost|customPrices|pricing.csv|cloudIntegration|AWS|Azure|GCP\" .", purpose: "Review cloud-cost integration and pricing source evidence." },
      { command: "rg \"budget|budgetsConfig|threshold|forecast|savings|rightsizing|alertConfigs|Slack|Teams\" .", purpose: "Review budget, forecast, savings, rightsizing, and alert routing evidence." },
      { command: "rg \"PROMETHEUS_SERVER_ENDPOINT|node_total_hourly_cost|container_cpu_allocation|Grafana|Thanos|networkCosts\" .", purpose: "Review Prometheus, Grafana, Thanos, and network-cost observability evidence." }
    ],
    learnerNextSteps: [
      "Start by finding whether the repo has pre-deploy cost estimates, runtime allocation tooling, or both.",
      "Map allocation dimensions to owners: namespace, pod, node, service, controller, team label, and cloud account.",
      "Check pricing inputs such as cloud provider billing integration, custom pricing CSV, or on-prem pricing.",
      "Review budgets, threshold alerts, forecasts, savings, and rightsizing workflows next to dashboards.",
      "This report is static readiness only. Real cost review requires authorized billing data, cluster metrics, and FinOps approval."
    ]
  };
}

type CostSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function costSourceFiles(walk: WalkResult): Promise<CostSourceFile[]> {
  const files: CostSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !costInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!costPathSignal(file.relPath) && !costContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 360) break;
  }
  return files;
}

function costInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|go\.mod|requirements.*\.txt|pyproject\.toml|Chart\.ya?ml|values.*\.ya?ml|README\.md|infracost.*\.ya?ml)$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /(^|\/)(cost|costs|finops|billing|budget|budgets|infracost|opencost|kubecost|cloudcost|cloud-cost|pricing|prometheus|grafana|dashboards?|alerts?|monitoring|helm|charts?|k8s|kubernetes|terraform|tofu|infra|ops|deploy|docs?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(ya?ml|json|jsonnet|toml|md|tf|hcl|js|ts|mjs|cjs|py|go|sh|conf|ini|csv)$/i.test(filePath);
}

function costPathSignal(filePath: string): boolean {
  return /(infracost|opencost|kubecost|finops|cloudcost|cloud-cost|cost-analyzer|cost-allocation|pricing|budget)/i.test(filePath);
}

function costContentSignal(text: string): boolean {
  return /(Infracost|infracost\s+(breakdown|diff|scan|inspect)|OpenCost|opencost|Kubecost|kubecost|cost allocation|allocation\/compute|get_allocation_costs|CloudCost|cloudCost|node_total_hourly_cost|container_cpu_allocation|container_memory_allocation|PROMETHEUS_SERVER_ENDPOINT|customPrices|pricing\.csv|budgetsConfig|networkCosts)/i.test(text);
}

function costSetupRows(sourceFiles: CostSourceFile[]): CostReadinessReport["costSetups"] {
  const rows: CostReadinessReport["costSetups"] = [];
  for (const source of sourceFiles) {
    const haystack = `${source.filePath}\n${source.text}`;
    const estimateCount = countMatches(source.text, /infracost\s+(breakdown|scan|inspect)|cost estimate|cost estimates?|monthly cost|resource-level breakdown|cost drivers/gi);
    const diffCount = countMatches(source.text, /infracost\s+(diff|comment|upload)|cost diff|baseline cost|new monthly cost|total change|pull request comment|PR comment/gi);
    const allocationCount = countMatches(source.text, /cost allocation|allocation\/compute|get_allocation_costs|aggregate=|aggregate\s*:|namespace|pod|node|controller|service|label:/gi);
    const pricingCount = countMatches(source.text, /custom pricing|customPrices|pricing\.csv|pricing_schema|cloud provider|AWS|Azure|GCP|on-prem|provider pricing/gi);
    const cloudCostCount = countMatches(source.text, /CloudCost|cloudCost|CLOUD_COST|cloudIntegration|cloud integration|billing export|cloud bill/gi);
    const budgetCount = countMatches(source.text, /budgetsConfig|budgetType|budget\b|threshold|forecast|savings|rightsizing|right-sizing|costEvents|cost events/gi);
    const alertCount = countMatches(source.text, /alertConfigs|alerts?\s*:|Slack|slackWebhook|Teams|msTeamsWebhook|ownerContact|globalAlertEmails|budget-alert/gi);
    const labelCount = countMatches(source.text, /labelMappingConfigs|owner_label|team_label|department_label|product_label|environment_label|labels\s*:|tags\s*:|defaultTags|sharedNamespaces|sharedLabelValues/gi);
    const prometheusCount = countMatches(source.text, /PROMETHEUS_SERVER_ENDPOINT|Prometheus|prometheus|metrics|node_total_hourly_cost|container_cpu_allocation|container_memory_allocation|recording rules?|Thanos|Cortex|Mimir/gi);
    const dashboardCount = countMatches(source.text, /Grafana|grafana|dashboard|reports?|cloudCostReports|assetReports|saved reports|kubecost UI/gi);
    const workflowCount = countMatches(haystack, /\.github\/workflows|GitHub Actions|pull_request|runs-on|helm install|helm upgrade|kubectl cost|mcp\.enabled|MCP_SERVER_ENABLED|infracost\s+(diff|comment|upload)/gi) + (/^\.github\/workflows\//i.test(source.filePath) ? 1 : 0);
    const totalSignals = estimateCount + diffCount + allocationCount + pricingCount + cloudCostCount + budgetCount + alertCount + labelCount + prometheusCount + dashboardCount + workflowCount;
    if (totalSignals === 0 && !costPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: costPlatform(source),
      estimateCount,
      diffCount,
      allocationCount,
      pricingCount,
      cloudCostCount,
      budgetCount,
      alertCount,
      labelCount,
      prometheusCount,
      dashboardCount,
      workflowCount,
      readiness: (estimateCount + diffCount > 0 || allocationCount > 0) && (pricingCount + cloudCostCount > 0 || prometheusCount > 0) && (budgetCount + alertCount + workflowCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains estimates ${estimateCount}, diffs ${diffCount}, allocations ${allocationCount}, pricing ${pricingCount}, cloud cost ${cloudCostCount}, budgets ${budgetCount}, alerts ${alertCount}, labels ${labelCount}, Prometheus ${prometheusCount}, dashboards ${dashboardCount}, workflows ${workflowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.estimateCount + b.diffCount + b.allocationCount + b.pricingCount + b.cloudCostCount + b.budgetCount + b.alertCount + b.prometheusCount + b.workflowCount;
    const aScore = a.estimateCount + a.diffCount + a.allocationCount + a.pricingCount + a.cloudCostCount + a.budgetCount + a.alertCount + a.prometheusCount + a.workflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 100);
}

function costPlatform(source: CostSourceFile): CostReadinessReport["costSetups"][number]["platform"] {
  const haystack = `${source.filePath}\n${source.text}`;
  if (/^\.github\/workflows\//i.test(source.filePath)) return "workflow";
  if (/Infracost|infracost/i.test(haystack)) return "infracost";
  if (/Kubecost|kubecost|cost-analyzer/i.test(haystack)) return "kubecost";
  if (/OpenCost|opencost|get_allocation_costs|allocation\/compute/i.test(haystack)) return "opencost";
  if (/PROMETHEUS_SERVER_ENDPOINT|node_total_hourly_cost|container_cpu_allocation|Prometheus|prometheus/i.test(haystack)) return "prometheus";
  if (/Chart\.ya?ml|values.*\.ya?ml|helm install|helm upgrade/i.test(haystack)) return "helm";
  if (/\.tf$|terraform|tofu/i.test(source.filePath) || /terraform|tofu/i.test(source.text)) return "terraform";
  if (/cost|budget|pricing|billing/i.test(haystack)) return "custom";
  return "unknown";
}

function costEstimateSignals(sourceFiles: CostSourceFile[]): CostReadinessReport["estimateSignals"] {
  const specs: Array<{ signal: CostReadinessReport["estimateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "infracost-breakdown", pattern: /infracost\s+breakdown|resource-level breakdown|cost drivers/i, evidence: "Infracost breakdown evidence was detected." },
    { signal: "infracost-diff", pattern: /infracost\s+(diff|comment|upload)|cost diff|baseline cost|new monthly cost|total change/i, evidence: "Infracost diff/comment evidence was detected." },
    { signal: "usage-file", pattern: /usage-file|infracost-usage\.ya?ml|usage costs/i, evidence: "usage-file evidence was detected." },
    { signal: "config-file", pattern: /config-file|infracost.*\.ya?ml|projects:\s*|dependency_paths/i, evidence: "config-file evidence was detected." },
    { signal: "monthly-cost", pattern: /monthly cost|MonthlyCost|new monthly cost/i, evidence: "monthly cost output evidence was detected." },
    { signal: "policy-check", pattern: /policy checks?|cost policy|policyOutput|PolicyCheck|policySha/i, evidence: "cost policy check evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "estimate");
}

function costAllocationSignals(sourceFiles: CostSourceFile[]): CostReadinessReport["allocationSignals"] {
  const specs: Array<{ signal: CostReadinessReport["allocationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "namespace", pattern: /aggregate=namespace|namespace costs|namespace\b/i, evidence: "namespace allocation evidence was detected." },
    { signal: "pod", pattern: /aggregate=pod|pod cost|pod\b/i, evidence: "pod allocation evidence was detected." },
    { signal: "node", pattern: /aggregate=.*node|node_total_hourly_cost|\bnode\b/i, evidence: "node allocation evidence was detected." },
    { signal: "controller", pattern: /controller kind|controllername|controller\b/i, evidence: "controller allocation evidence was detected." },
    { signal: "service", pattern: /aggregate=.*service|service cost|\bservice\b/i, evidence: "service allocation evidence was detected." },
    { signal: "label", pattern: /label:|labelMappingConfigs|owner_label|team_label|department_label|product_label|environment_label/i, evidence: "label allocation evidence was detected." },
    { signal: "cloud-cost", pattern: /CloudCost|cloudCost|cloud costs?|provider.*service.*region/i, evidence: "cloud-cost allocation evidence was detected." },
    { signal: "asset", pattern: /asset costs?|assets_data|node costs?|persistentVolume|persistent volumes?|PV cost/i, evidence: "asset cost evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "allocation");
}

function costPricingSignals(sourceFiles: CostSourceFile[]): CostReadinessReport["pricingSignals"] {
  const specs: Array<{ signal: CostReadinessReport["pricingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "custom-pricing", pattern: /custom pricing|customPrices|enterprise pricing|custom CSV pricing/i, evidence: "custom pricing evidence was detected." },
    { signal: "pricing-csv", pattern: /pricing\.csv|pricing_schema|CSV pricing/i, evidence: "pricing CSV evidence was detected." },
    { signal: "cloud-provider", pattern: /cloud provider|provider pricing|billing API|cloudIntegration|cloud integration/i, evidence: "cloud provider pricing evidence was detected." },
    { signal: "aws", pattern: /\bAWS\b|amazon-web-services|aws\.json|s3|athena/i, evidence: "AWS cost/pricing evidence was detected." },
    { signal: "azure", pattern: /\bAzure\b|azure-cloud-services|azure\.json|billingexports/i, evidence: "Azure cost/pricing evidence was detected." },
    { signal: "gcp", pattern: /\bGCP\b|Google Cloud|gcp-cloud-services|gcp\.json/i, evidence: "GCP cost/pricing evidence was detected." },
    { signal: "on-prem", pattern: /on-prem|on prem|custom CSV pricing|airgapped|OTC/i, evidence: "on-prem pricing evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "pricing");
}

function costBudgetSignals(sourceFiles: CostSourceFile[]): CostReadinessReport["budgetSignals"] {
  const specs: Array<{ signal: CostReadinessReport["budgetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "budget-config", pattern: /budgetsConfig|budgetType|budgets?\s*:|budget config/i, evidence: "budget config evidence was detected." },
    { signal: "threshold", pattern: /threshold|limit|amount|percent/i, evidence: "threshold evidence was detected." },
    { signal: "forecast", pattern: /forecast|forecasting|modeling/i, evidence: "forecast evidence was detected." },
    { signal: "savings", pattern: /savings|Savings Insights|savingsRecommendations|allowlist/i, evidence: "savings recommendation evidence was detected." },
    { signal: "rightsizing", pattern: /rightsizing|right-sizing|requestSizing|container-request-rightsizing/i, evidence: "rightsizing evidence was detected." },
    { signal: "cost-events", pattern: /costEvents|cost events|actions\.config|cost event/i, evidence: "cost events evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "budget");
}

function costObservabilitySignals(sourceFiles: CostSourceFile[]): CostReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: CostReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prometheus-endpoint", pattern: /PROMETHEUS_SERVER_ENDPOINT|prometheus.*endpoint|prometheus\.server/i, evidence: "Prometheus endpoint evidence was detected." },
    { signal: "metrics", pattern: /node_total_hourly_cost|container_cpu_allocation|container_memory_allocation|\/metrics|cost metrics/i, evidence: "cost metrics evidence was detected." },
    { signal: "recording-rules", pattern: /recording rules?|PrometheusRule|rules:\s*/i, evidence: "recording rule evidence was detected." },
    { signal: "grafana", pattern: /Grafana|grafana|dashboard/i, evidence: "Grafana/dashboard evidence was detected." },
    { signal: "thanos", pattern: /Thanos|Cortex|Mimir|global query endpoint/i, evidence: "global Prometheus query endpoint evidence was detected." },
    { signal: "network-costs", pattern: /networkCosts|network costs|network-costs/i, evidence: "network cost evidence was detected." },
    { signal: "persistent-volume", pattern: /persistentVolume|persistent volumes?|PV cost|PVC/i, evidence: "persistent volume cost evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "observability");
}

function costWorkflowSignals(sourceFiles: CostSourceFile[]): CostReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: CostReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "pull-request-comment", pattern: /pull request|PR comment|infracost\s+comment|comment on.*pull requests?/i, evidence: "pull request cost comment evidence was detected." },
    { signal: "github-actions", pattern: /\.github\/workflows|GitHub Actions|runs-on|pull_request/i, evidence: "GitHub Actions evidence was detected." },
    { signal: "ci-cost-diff", pattern: /infracost\s+(diff|upload)|cost diff|cost estimate.*CI|CI\/CD integrations/i, evidence: "CI cost diff evidence was detected." },
    { signal: "helm-install", pattern: /helm repo add|helm install|helm upgrade|Chart\.ya?ml|values\.ya?ml/i, evidence: "Helm install evidence was detected." },
    { signal: "kubectl-cost", pattern: /kubectl cost|kubectl-cost/i, evidence: "kubectl cost evidence was detected." },
    { signal: "mcp", pattern: /mcp\.enabled|MCP_SERVER_ENABLED|OpenCost MCP|get_allocation_costs/i, evidence: "OpenCost MCP evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "workflow");
}

function costPackageSignals(sourceFiles: CostSourceFile[]): CostReadinessReport["packageSignals"] {
  const specs: Array<{ signal: CostReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "infracost", pattern: /Infracost|infracost/i, evidence: "Infracost evidence was detected." },
    { signal: "opencost", pattern: /OpenCost|opencost|github\.com\/opencost\/opencost/i, evidence: "OpenCost evidence was detected." },
    { signal: "kubecost", pattern: /Kubecost|kubecost|cost-analyzer/i, evidence: "Kubecost evidence was detected." },
    { signal: "prometheus", pattern: /Prometheus|prometheus|PROMETHEUS_SERVER_ENDPOINT/i, evidence: "Prometheus evidence was detected." },
    { signal: "grafana", pattern: /Grafana|grafana/i, evidence: "Grafana evidence was detected." },
    { signal: "helm", pattern: /helm install|helm upgrade|Chart\.ya?ml|values\.ya?ml/i, evidence: "Helm evidence was detected." }
  ];
  return costSignalFromSpecs(sourceFiles, specs, "package");
}

function costSignalFromSpecs<T extends string>(
  sourceFiles: CostSourceFile[],
  specs: Array<{ signal: T; pattern: RegExp; evidence: string }>,
  label: string
): Array<{ signal: T; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(haystack);
    });
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/cost-readiness.html"
    };
  });
}
