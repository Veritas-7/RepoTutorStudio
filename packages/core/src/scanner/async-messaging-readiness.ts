import type { EmailReadinessReport, EventStreamReadinessReport, QueueReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildEmailReadinessReport(walk: WalkResult): Promise<EmailReadinessReport> {
  const sourceFiles = await emailReadinessSourceFiles(walk);
  const emailSetups = emailReadinessEmailSetups(sourceFiles);
  const recipientSignals = emailReadinessRecipientSignals(sourceFiles);
  const deliverySignals = emailReadinessDeliverySignals(sourceFiles);
  const templateSignals = emailReadinessTemplateSignals(sourceFiles);
  const providerSignals = emailReadinessProviderSignals(sourceFiles);
  const credentialSignals = emailReadinessCredentialSignals(sourceFiles);
  const packageSignals = emailReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasResendPackage = packageSignals.some((item) => item.signal === "resend" && item.readiness === "ready");
  const hasSetup = emailSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = emailSetups.some((item) => item.readiness === "ready");
  const hasSend = emailSetups.some((item) => item.sendCallCount > 0) || deliverySignals.some((item) => item.signal === "batch-send" && item.readiness === "ready");
  const hasApiKey = credentialSignals.some((item) => item.signal === "RESEND_API_KEY" && item.readiness === "ready");
  const hasFrom = recipientSignals.some((item) => item.signal === "from" && item.readiness === "ready");
  const hasTo = recipientSignals.some((item) => item.signal === "to" && item.readiness === "ready");
  const hasSubject = recipientSignals.some((item) => item.signal === "subject" && item.readiness === "ready");
  const hasContent = recipientSignals.some((item) => ["text", "html", "react"].includes(item.signal) && item.readiness === "ready");
  const hasDomainVerification = deliverySignals.some((item) => item.signal === "domain-verification" && item.readiness === "ready");
  const hasWebhook = deliverySignals.some((item) => item.signal === "webhook-verification" && item.readiness === "ready" || item.signal === "event-handling" && item.readiness === "ready");
  const hasWebhookVerification = deliverySignals.some((item) => item.signal === "webhook-verification" && item.readiness === "ready");
  const hasBatch = deliverySignals.some((item) => item.signal === "batch-send" && item.readiness === "ready");
  const hasIdempotency = deliverySignals.some((item) => item.signal === "idempotency" && item.readiness === "ready");
  const hasReactTemplate = templateSignals.some((item) => ["react-email", "jsx-runtime"].includes(item.signal) && item.readiness === "ready");
  const hasReactRenderPackage = packageSignals.some((item) => item.signal === "@react-email/render" && item.readiness === "ready");
  const hasListOrBroadcastSurface = providerSignals.some((item) => ["contacts-resource", "audiences-segments", "broadcasts-resource", "automations-resource"].includes(item.signal) && item.readiness === "ready");
  const hasUnsubscribe = deliverySignals.some((item) => item.signal === "unsubscribe" && item.readiness === "ready") || recipientSignals.some((item) => item.signal === "tags" && item.readiness === "ready");

  const riskQueue: EmailReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasSend) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the transactional email strategy before claiming email readiness.",
      why: "Email readiness starts with an explicit provider package, client setup, send call, SMTP transport, or notification surface.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasResendPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Expose a Resend client setup before trusting email flow scans.",
      why: "Resend's Node SDK expects `new Resend(...)` or RESEND_API_KEY-backed initialization before email, domain, webhook, or contact calls.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if ((hasResendPackage || hasSetup) && !hasApiKey) {
    riskQueue.push({
      priority: "high",
      action: "Document RESEND_API_KEY or the equivalent server-only email provider credential.",
      why: "Transactional email calls must not rely on missing, hard-coded, or client-exposed provider credentials.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasSend && (!hasFrom || !hasTo || !hasSubject || !hasContent)) {
    riskQueue.push({
      priority: "medium",
      action: "Review send payloads for from, to, subject, and text/html/react content coverage.",
      why: "Email sends need auditable sender, recipient, subject, and body/template assumptions before runtime QA.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasSend && !hasDomainVerification) {
    riskQueue.push({
      priority: "medium",
      action: "Document sender-domain verification and DNS ownership before production email delivery.",
      why: "Provider SDKs can send only after SPF/DKIM/domain verification is complete for production sender domains.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasWebhook && !hasWebhookVerification) {
    riskQueue.push({
      priority: "high",
      action: "Verify email webhook signatures before processing delivery events.",
      why: "Delivery, bounce, complaint, and open/click callbacks must reject forged webhook requests.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasBatch && !hasIdempotency) {
    riskQueue.push({
      priority: "medium",
      action: "Add idempotency or duplicate-send protection around batch email sends.",
      why: "Transactional and batch email sends may be retried; duplicate delivery can create support and trust issues.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasReactTemplate && !hasReactRenderPackage) {
    riskQueue.push({
      priority: "medium",
      action: "Confirm React email templates have a renderer dependency and build path.",
      why: "Resend renders React templates through a render helper that depends on @react-email/render-style tooling.",
      relatedHref: "html/email-readiness.html"
    });
  }
  if (hasListOrBroadcastSurface && !hasUnsubscribe) {
    riskQueue.push({
      priority: "medium",
      action: "Document unsubscribe and preference handling for audience, contact, broadcast, or automation email surfaces.",
      why: "Resend exposes list-management and broadcast workflows separately from transactional sends, so learners need to check consent and unsubscribe paths.",
      relatedHref: "html/email-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run email delivery tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not send email, call provider APIs, verify live DNS, process live callbacks, or run the analyzed project's tests.",
    relatedHref: "html/email-readiness.html"
  });

  return {
    summary: `Resend식 email readiness report: setup ${emailSetups.length}개, recipient/content signal ${recipientSignals.length}개, delivery signal ${deliverySignals.length}개, template signal ${templateSignals.length}개, provider workflow signal ${providerSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Resend new Resend emails.send batch.send domains verify webhooks verify standardwebhooks apiKeys contacts audiences segments broadcasts automations templates events logs receiving from to subject html react attachments replyTo RESEND_API_KEY idempotency",
    emailSetups,
    recipientSignals,
    deliverySignals,
    templateSignals,
    providerSignals,
    credentialSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"new Resend|RESEND_API_KEY|resend\\.\" src app pages packages", purpose: "Inventory Resend client setup and server-only credential usage." },
      { command: "rg \"emails\\.send|emails\\.create|batch\\.send|sendMail|transporter\\.sendMail\" src app pages packages", purpose: "Find transactional and batch email send calls." },
      { command: "rg \"from:|to:|cc:|bcc:|replyTo|subject:|text:|html:|react:|attachments\" src app pages packages", purpose: "Review sender, recipient, subject, body, template, and attachment payloads." },
      { command: "rg \"domains\\.|verify\\(|SPF|DKIM|webhooks\\.verify|standardwebhooks|webhook-signature|bounce|complaint|delivered\" src app pages packages", purpose: "Check domain verification, webhook signature verification, and delivery-event handling." },
      { command: "rg \"apiKeys\\.|contacts\\.|audiences\\.|segments\\.|broadcasts\\.|automations\\.|events\\.|logs\\.|templates\\.|receiving\\.\" src app pages packages", purpose: "Map broader Resend provider workflows such as API key management, contact lists, broadcasts, automations, events, logs, templates, and receiving." },
      { command: "rg \"@react-email/render|react-email|EmailTemplate|templateId|variables|unsubscribe|Idempotency-Key|idempotencyKey\" src app pages packages", purpose: "Trace template rendering, variables, unsubscribe, and duplicate-send protection." },
      { command: "npx vitest run", purpose: "Run local tests that exercise email payload construction, provider mocks, webhooks, and duplicate-send handling." }
    ],
    learnerNextSteps: [
      "먼저 서버 쪽 email provider client 생성 위치를 찾고 RESEND_API_KEY 같은 credential이 어떻게 주입되는지 확인하세요.",
      "emails.send 또는 batch.send가 있으면 from, to, subject, text/html/react, attachments, replyTo를 함께 추적하세요.",
      "apiKeys, contacts, audiences/segments, broadcasts, automations, events, logs, templates, receiving이 보이면 transactional send 밖의 provider workflow까지 따로 분리해 읽으세요.",
      "커스텀 발신 도메인을 쓰면 SPF/DKIM/domain verification 증거가 있는지 확인하세요.",
      "webhooks.verify 또는 delivery event 처리가 있으면 signature header, raw payload, signing configuration, bounce/complaint 처리까지 같이 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 이메일 전송, DNS 검증, provider callback, unsubscribe compliance는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type EmailReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function emailReadinessSourceFiles(walk: WalkResult): Promise<EmailReadinessSourceFile[]> {
  const files: EmailReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !emailReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!emailReadinessPathSignal(file.relPath) && !emailReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function emailReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return emailReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env)$/i.test(filePath);
}

function emailReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(emails?|mail|mailer|notifications?|resend|smtp|templates?|webhooks?|domains?|api-?keys?|contacts?|audiences?|segments?|topics?|broadcasts?|automations?|events?|logs?|receiving|newsletters?)(\/|\.|-|_|$)|sendgrid|mailgun|postmark|ses/i.test(filePath);
}

function emailReadinessContentSignal(text: string): boolean {
  return /\b(Resend|resend|emails\.send|emails\.create|batch\.send|sendMail|transporter\.sendMail|RESEND_API_KEY|SENDGRID_API_KEY|MAILGUN_API_KEY|SMTP_HOST|SMTP_USER|SMTP_PASS|POSTMARK_SERVER_TOKEN|@react-email\/render|react-email|replyTo|attachments|domains\.|webhooks\.verify|apiKeys\.|contacts\.|audiences\.|segments\.|topics\.|broadcasts\.|automations\.|events\.|logs\.|templates\.|receiving\.|standardwebhooks|Idempotency-Key|idempotencyKey|bounce|complaint|unsubscribe|delivered|mailgun|sendgrid|postmark)\b/i.test(text);
}

function emailReadinessEmailSetups(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["emailSetups"] {
  const rows: EmailReadinessReport["emailSetups"] = [];
  for (const source of sourceFiles) {
    const clientSetupCount = countMatches(source.text, /\bnew\s+Resend\s*\(|\bResend\s*\(\s*(process\.env\.)?RESEND_API_KEY|createTransport\s*\(|setApiKey\s*\(|new\s+Mailgun\b|new\s+Postmark\b|SESClient\s*\(/gi);
    const sendCallCount = countMatches(source.text, /\bemails\.(send|create)\s*\(|\bbatch\.(send|create)\s*\(|\bsendMail\s*\(|\btransporter\.sendMail\s*\(|\bmessages\(\)\.send\b/gi);
    const templateSignalCount = countMatches(source.text, /\breact\s*:|\bhtml\s*:|\btext\s*:|EmailTemplate|@react-email\/render|templateId|template_id|variables\s*:/gi);
    const domainSignalCount = countMatches(source.text, /\bdomains?\.(create|verify|get|list|update)|SPF|DKIM|domain verification|verify domain/gi);
    const webhookSignalCount = countMatches(source.text, /\bwebhooks?\.(create|verify|get|list|update)|standardwebhooks|webhook-signature|webhookSecret|bounce|complaint|delivered/gi);
    const hasSetupSignal = clientSetupCount + sendCallCount + templateSignalCount + domainSignalCount + webhookSignalCount > 0 || /\b(email|mail|notification)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: emailReadinessProvider(source),
      clientSetupCount,
      sendCallCount,
      templateSignalCount,
      domainSignalCount,
      webhookSignalCount,
      readiness: clientSetupCount > 0 && sendCallCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains client setup ${clientSetupCount}, send calls ${sendCallCount}, template signals ${templateSignalCount}, domain signals ${domainSignalCount}, webhook signals ${webhookSignalCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function emailReadinessProvider(source: EmailReadinessSourceFile): EmailReadinessReport["emailSetups"][number]["provider"] {
  if (/\bResend\b|["']resend["']/i.test(source.text)) return "resend";
  if (/\bnodemailer\b|createTransport|sendMail/i.test(source.text)) return "nodemailer";
  if (/@sendgrid\/mail|sendgrid/i.test(source.text)) return "sendgrid";
  if (/mailgun\.js|mailgun/i.test(source.text)) return "mailgun";
  if (/postmark/i.test(source.text)) return "postmark";
  if (/SESClient|@aws-sdk\/client-ses|AWS_SES/i.test(source.text)) return "ses";
  if (/\bemail|mail|notification\b/i.test(source.text)) return "custom";
  return "unknown";
}

function emailReadinessRecipientSignals(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["recipientSignals"] {
  const specs: Array<{ signal: EmailReadinessReport["recipientSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "from", pattern: /\bfrom\s*:/i, evidence: "sender/from evidence was detected." },
    { signal: "to", pattern: /\bto\s*:/i, evidence: "recipient/to evidence was detected." },
    { signal: "cc", pattern: /\bcc\s*:/i, evidence: "cc recipient evidence was detected." },
    { signal: "bcc", pattern: /\bbcc\s*:/i, evidence: "bcc recipient evidence was detected." },
    { signal: "reply-to", pattern: /\breplyTo\s*:|\breply_to\s*:|\breply-to\b/i, evidence: "reply-to evidence was detected." },
    { signal: "subject", pattern: /\bsubject\s*:/i, evidence: "subject evidence was detected." },
    { signal: "text", pattern: /\btext\s*:/i, evidence: "plain text body evidence was detected." },
    { signal: "html", pattern: /\bhtml\s*:/i, evidence: "HTML body evidence was detected." },
    { signal: "react", pattern: /\breact\s*:|EmailTemplate|jsx\(/i, evidence: "React email template evidence was detected." },
    { signal: "attachments", pattern: /\battachments?\s*:/i, evidence: "attachment evidence was detected." },
    { signal: "scheduled", pattern: /\bscheduledAt\b|\bscheduled_at\b|\bschedule/i, evidence: "scheduled email evidence was detected." },
    { signal: "tags", pattern: /\btags\s*:|\bheaders\s*:|List-Unsubscribe/i, evidence: "tag/header/unsubscribe evidence was detected." }
  ];
  return emailReadinessSignalFromSpecs(sourceFiles, specs, "recipient", "signal");
}

function emailReadinessDeliverySignals(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["deliverySignals"] {
  const specs: Array<{ signal: EmailReadinessReport["deliverySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "domain-verification", pattern: /\bdomains?\.(create|verify|get|list|update)|SPF|DKIM|domain verification|verify domain/i, evidence: "domain verification evidence was detected." },
    { signal: "batch-send", pattern: /\bbatch\.(send|create)\s*\(|\/emails\/batch|x-batch-validation/i, evidence: "batch send evidence was detected." },
    { signal: "idempotency", pattern: /\bIdempotency-Key\b|\bidempotencyKey\b|\bidempotent\b/i, evidence: "idempotency evidence was detected." },
    { signal: "webhook-verification", pattern: /\bwebhooks?\.verify\b|standardwebhooks|webhook-signature|webhookSecret|signature/i, evidence: "webhook signature verification evidence was detected." },
    { signal: "event-handling", pattern: /\bevent\.type\b|\bcase\s+['"][a-z0-9_.-]+['"]|email\.(sent|delivered|opened|clicked|bounced|complained)/i, evidence: "delivery event handling evidence was detected." },
    { signal: "bounce", pattern: /\bbounce(d)?\b|email\.bounced/i, evidence: "bounce handling evidence was detected." },
    { signal: "complaint", pattern: /\bcomplaint\b|\bcomplained\b|email\.complained/i, evidence: "complaint handling evidence was detected." },
    { signal: "delivery", pattern: /\bdelivered\b|email\.delivered|delivery/i, evidence: "delivery status evidence was detected." },
    { signal: "open-tracking", pattern: /\bopenTracking\b|\bopen_tracking\b|email\.opened/i, evidence: "open tracking evidence was detected." },
    { signal: "click-tracking", pattern: /\bclickTracking\b|\bclick_tracking\b|email\.clicked/i, evidence: "click tracking evidence was detected." },
    { signal: "unsubscribe", pattern: /List-Unsubscribe|unsubscribe|preferences/i, evidence: "unsubscribe or preferences evidence was detected." }
  ];
  return emailReadinessSignalFromSpecs(sourceFiles, specs, "delivery", "signal");
}

function emailReadinessTemplateSignals(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["templateSignals"] {
  const specs: Array<{ signal: EmailReadinessReport["templateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "react-email", pattern: /@react-email\/render|@react-email\/components|react-email|EmailTemplate/i, evidence: "React Email evidence was detected." },
    { signal: "html-template", pattern: /\bhtml\s*:|<html|<strong|template.*html/i, evidence: "HTML template evidence was detected." },
    { signal: "text-template", pattern: /\btext\s*:|plain text|text template/i, evidence: "text template evidence was detected." },
    { signal: "jsx-runtime", pattern: /react\/jsx-runtime|\bjsx\s*\(/i, evidence: "JSX runtime email template evidence was detected." },
    { signal: "template-id", pattern: /templateId|template_id|template_id\s*:/i, evidence: "template ID evidence was detected." },
    { signal: "variables", pattern: /variables\s*:|firstName|{{|}}|\${/i, evidence: "template variable evidence was detected." }
  ];
  return emailReadinessSignalFromSpecs(sourceFiles, specs, "template", "signal");
}

function emailReadinessProviderSignals(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["providerSignals"] {
  const specs: Array<{ signal: EmailReadinessReport["providerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resend-client", pattern: /\bnew\s+Resend\b|\bResend\s*\(|\bRESEND_API_KEY\b/i, evidence: "Resend client or API-key setup evidence was detected." },
    { signal: "emails-resource", pattern: /\bemails\.(send|create|list|get|update|cancel)\b|\/emails\b/i, evidence: "Resend emails resource evidence was detected." },
    { signal: "batch-resource", pattern: /\bbatch\.(send|create)\b|\/emails\/batch/i, evidence: "Resend batch resource evidence was detected." },
    { signal: "domains-resource", pattern: /\bdomains?\.(create|list|get|update|remove|verify)\b|\/domains\b|SPF|DKIM/i, evidence: "Resend domains resource evidence was detected." },
    { signal: "webhooks-resource", pattern: /\bwebhooks?\.(create|list|get|update|remove|verify)\b|\/webhooks\b|standardwebhooks/i, evidence: "Resend webhooks resource evidence was detected." },
    { signal: "api-keys-resource", pattern: /\bapiKeys\.(create|list|get|update|remove)\b|api-keys|\/api-keys\b/i, evidence: "Resend API keys resource evidence was detected." },
    { signal: "templates-resource", pattern: /\btemplates\.(create|list|get|update|remove|duplicate|publish)\b|\/templates\b|templateId|template_id/i, evidence: "Resend templates resource evidence was detected." },
    { signal: "events-resource", pattern: /\bevents\.(send|create|list|get|update|remove)\b|\/events\b|event\.type/i, evidence: "Resend events resource evidence was detected." },
    { signal: "logs-resource", pattern: /\blogs\.(list|get)\b|\/logs\b/i, evidence: "Resend logs resource evidence was detected." },
    { signal: "contacts-resource", pattern: /\bcontacts\.(create|list|get|update|remove)\b|\/contacts\b|contactProperties\b/i, evidence: "Resend contacts resource evidence was detected." },
    { signal: "audiences-segments", pattern: /\baudiences\.(create|list|get|update|remove)\b|\bsegments\.(create|list|get|update|remove)\b|\/audiences\b|\/segments\b/i, evidence: "Resend audiences or segments evidence was detected." },
    { signal: "broadcasts-resource", pattern: /\bbroadcasts\.(create|send|list|get|update|remove)\b|\/broadcasts\b/i, evidence: "Resend broadcasts resource evidence was detected." },
    { signal: "automations-resource", pattern: /\bautomations\.(create|list|get|update|remove|stop)\b|\/automations\b|automation-runs/i, evidence: "Resend automations resource evidence was detected." },
    { signal: "receiving-resource", pattern: /\breceiving\.(list|get|update|remove)\b|emails\.receiving|\/emails\/receiving/i, evidence: "Resend receiving resource evidence was detected." }
  ];
  return emailReadinessSignalFromSpecs(sourceFiles, specs, "provider", "signal");
}

function emailReadinessCredentialSignals(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["credentialSignals"] {
  const specs: Array<{ signal: EmailReadinessReport["credentialSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "RESEND_API_KEY", pattern: /\bRESEND_API_KEY\b/i, evidence: "RESEND_API_KEY evidence was detected." },
    { signal: "RESEND_BASE_URL", pattern: /\bRESEND_BASE_URL\b/i, evidence: "RESEND_BASE_URL evidence was detected." },
    { signal: "RESEND_USER_AGENT", pattern: /\bRESEND_USER_AGENT\b/i, evidence: "RESEND_USER_AGENT evidence was detected." },
    { signal: "SENDGRID_API_KEY", pattern: /\bSENDGRID_API_KEY\b/i, evidence: "SENDGRID_API_KEY evidence was detected." },
    { signal: "MAILGUN_API_KEY", pattern: /\bMAILGUN_API_KEY\b/i, evidence: "MAILGUN_API_KEY evidence was detected." },
    { signal: "SMTP_HOST", pattern: /\bSMTP_HOST\b|\bSMTP_SERVER\b/i, evidence: "SMTP host evidence was detected." },
    { signal: "SMTP_USER", pattern: /\bSMTP_USER\b|\bSMTP_USERNAME\b/i, evidence: "SMTP user evidence was detected." },
    { signal: "SMTP_PASS", pattern: /\bSMTP_PASS\b|\bSMTP_PASSWORD\b/i, evidence: "SMTP password evidence was detected." },
    { signal: "POSTMARK_SERVER_TOKEN", pattern: /\bPOSTMARK_SERVER_TOKEN\b|\bPOSTMARK_API_TOKEN\b/i, evidence: "Postmark token evidence was detected." },
    { signal: "AWS_SES", pattern: /\bAWS_SES\b|\bAWS_ACCESS_KEY_ID\b|SESClient/i, evidence: "AWS SES credential/client evidence was detected." }
  ];
  return emailReadinessSignalFromSpecs(sourceFiles, specs, "credential", "signal");
}

function emailReadinessPackageSignals(sourceFiles: EmailReadinessSourceFile[]): EmailReadinessReport["packageSignals"] {
  const specs: Array<{ signal: EmailReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resend", pattern: /["']resend["']|from\s+["']resend["']|\bnew\s+Resend\b/i, evidence: "resend package/import evidence was detected." },
    { signal: "nodemailer", pattern: /["']nodemailer["']|createTransport|sendMail/i, evidence: "nodemailer package/import evidence was detected." },
    { signal: "@sendgrid/mail", pattern: /@sendgrid\/mail|sendgrid/i, evidence: "@sendgrid/mail package/import evidence was detected." },
    { signal: "mailgun.js", pattern: /mailgun\.js|mailgun/i, evidence: "mailgun.js package/import evidence was detected." },
    { signal: "postmark", pattern: /["']postmark["']|postmark/i, evidence: "postmark package/import evidence was detected." },
    { signal: "@aws-sdk/client-ses", pattern: /@aws-sdk\/client-ses|SESClient/i, evidence: "AWS SES package/import evidence was detected." },
    { signal: "@react-email/render", pattern: /@react-email\/render|@react-email\/components|react-email/i, evidence: "React Email render package/import evidence was detected." }
  ];
  return emailReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function emailReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: EmailReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/email-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildQueueReadinessReport(walk: WalkResult): Promise<QueueReadinessReport> {
  const sourceFiles = await queueReadinessSourceFiles(walk);
  const queueSetups = queueReadinessQueueSetups(sourceFiles);
  const producerSignals = queueReadinessProducerSignals(sourceFiles);
  const workerSignals = queueReadinessWorkerSignals(sourceFiles);
  const reliabilitySignals = queueReadinessReliabilitySignals(sourceFiles);
  const connectionSignals = queueReadinessConnectionSignals(sourceFiles);
  const packageSignals = queueReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasBullMqPackage = packageSignals.some((item) => item.signal === "bullmq" && item.readiness === "ready");
  const hasSetup = queueSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = queueSetups.some((item) => item.readiness === "ready");
  const hasProducer = producerSignals.some((item) => ["queue-add", "add-bulk"].includes(item.signal) && item.readiness === "ready");
  const hasWorker = workerSignals.some((item) => ["worker", "processor"].includes(item.signal) && item.readiness === "ready");
  const hasConnection = connectionSignals.some((item) => ["REDIS_URL", "connection", "ioredis", "node-redis", "docker-compose-redis"].includes(item.signal) && item.readiness === "ready");
  const hasRetryPolicy = reliabilitySignals.some((item) => ["attempts", "backoff", "retry"].includes(item.signal) && item.readiness === "ready");
  const hasFailureHandling = reliabilitySignals.some((item) => ["failed-event", "queue-events", "dead-letter"].includes(item.signal) && item.readiness === "ready");
  const hasDelayedOrRepeatJobs = producerSignals.some((item) => ["delay", "repeat"].includes(item.signal) && item.readiness === "ready") || queueSetups.some((item) => item.schedulerCount > 0);
  const hasStalledHandling = workerSignals.some((item) => ["stalled-check", "lock-renewal"].includes(item.signal) && item.readiness === "ready");
  const hasFlowJobs = producerSignals.some((item) => item.signal === "parent" && item.readiness === "ready") || queueSetups.some((item) => item.flowCount > 0);

  const riskQueue: QueueReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup && !hasProducer) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the background job and queue strategy before claiming queue readiness.",
      why: "Queue readiness starts with an explicit queue package, producer call, worker process, scheduler, or Redis-backed job surface.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  if (hasBullMqPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair each BullMQ package signal with a queue producer and worker setup.",
      why: "BullMQ readiness requires both producers that enqueue jobs and workers that process them against a Redis connection.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  if ((hasBullMqPackage || hasSetup || hasProducer || hasWorker) && !hasConnection) {
    riskQueue.push({
      priority: "high",
      action: "Document Redis connection configuration for queue producers and workers.",
      why: "BullMQ and related Redis-backed queues need auditable connection configuration before runtime worker QA.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  if (hasProducer && !hasRetryPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Add retry attempts and backoff policy for queued jobs.",
      why: "Background jobs often fail transiently; retry and backoff settings make failure handling explicit.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  if (hasWorker && !hasFailureHandling) {
    riskQueue.push({
      priority: "medium",
      action: "Handle failed and completed worker events before production queue operation.",
      why: "Workers need observable failure and completion paths so operators can retry, alert, or inspect job outcomes.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  if (hasDelayedOrRepeatJobs && !hasStalledHandling) {
    riskQueue.push({
      priority: "medium",
      action: "Review delayed or repeat jobs for stalled-job and lock-renewal behavior.",
      why: "Scheduled queue work can strand jobs if worker locks, stalled checks, or recovery settings are not understood.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  if (hasFlowJobs && !hasFailureHandling) {
    riskQueue.push({
      priority: "medium",
      action: "Define failure handling for parent and child job flows.",
      why: "Flow jobs can leave dependent work blocked unless parent failure and child retry behavior are explicit.",
      relatedHref: "html/queue-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run queue integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not start Redis, enqueue jobs, run workers, process queues, retry failed jobs, or run the analyzed project's tests.",
    relatedHref: "html/queue-readiness.html"
  });

  return {
    summary: `BullMQ식 queue readiness report: setup ${queueSetups.length}개, producer signal ${producerSignals.length}개, worker signal ${workerSignals.length}개, reliability signal ${reliabilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "BullMQ Queue Worker QueueEvents FlowProducer JobScheduler queue.add addBulk repeat attempts backoff removeOnComplete removeOnFail Redis connection concurrency limiter stalled failed completed metrics telemetry",
    queueSetups,
    producerSignals,
    workerSignals,
    reliabilitySignals,
    connectionSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"new Queue|new Worker|QueueEvents|FlowProducer|JobScheduler|QueueScheduler\" src app pages packages", purpose: "Inventory BullMQ queue producers, workers, event listeners, flows, and schedulers." },
      { command: "rg \"queue\\.add|addBulk|repeat|delay|priority|jobId|parent\" src app pages packages", purpose: "Find producer calls, delayed/repeat jobs, priorities, deterministic IDs, and parent-child flow evidence." },
      { command: "rg \"attempts|backoff|removeOnComplete|removeOnFail|retry|failed|completed|stalled\" src app pages packages", purpose: "Review retry policy, cleanup policy, failure events, completion events, and stalled-job handling." },
      { command: "rg \"REDIS_URL|REDIS_HOST|REDIS_PORT|REDIS_PASSWORD|connection|ioredis|redis\" src app pages packages docker-compose.yml", purpose: "Check Redis connection configuration and queue client dependencies." },
      { command: "rg \"concurrency|limiter|metrics|telemetry|bull-board|taskforce|dashboard\" src app pages packages", purpose: "Trace worker concurrency, rate limiting, metrics, telemetry, and operator dashboard signals." },
      { command: "npx vitest run", purpose: "Run local tests that exercise producer payloads, worker processors, retry policy, and queue mocks." }
    ],
    learnerNextSteps: [
      "먼저 queue setup 파일에서 Queue, Worker, QueueEvents, FlowProducer가 어디서 생성되는지 확인하세요.",
      "queue.add 또는 addBulk 호출이 있으면 job name, payload, priority, delay, repeat, jobId, parent flow를 함께 추적하세요.",
      "Worker가 있으면 processor, concurrency, limiter, stalled check, lock renewal, removeOnComplete/removeOnFail 설정을 확인하세요.",
      "Redis 연결은 REDIS_URL 또는 connection/ioredis/node-redis 설정과 docker-compose Redis 서비스가 일관되는지 비교하세요.",
      "이 리포트는 정적 readiness입니다. 실제 Redis 실행, job enqueue/process/retry, worker crash recovery는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type QueueReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function queueReadinessSourceFiles(walk: WalkResult): Promise<QueueReadinessSourceFile[]> {
  const files: QueueReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !queueReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!queueReadinessPathSignal(file.relPath) && !queueReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function queueReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return queueReadinessPathSignal(filePath)
    || /^(package\.json|\.env\.example|\.env\.sample|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|next\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function queueReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(queues?|jobs?|workers?|bullmq|bull|agenda|bree|graphile|redis|schedulers?|schedules?|tasks?)(\/|\.|-|_|$)|docker-compose|compose\.ya?ml/i.test(filePath);
}

function queueReadinessContentSignal(text: string): boolean {
  return /\b(bullmq|BullMQ|new\s+Queue|new\s+Worker|QueueEvents|FlowProducer|JobScheduler|QueueScheduler|queue\.add|addBulk|repeat|attempts|backoff|removeOnComplete|removeOnFail|REDIS_URL|REDIS_HOST|REDIS_PORT|REDIS_PASSWORD|connection\s*:|ioredis|node-redis|stalled|failed|completed|concurrency|limiter|metrics|telemetry|bull-board|taskforce)\b/i.test(text);
}

function queueReadinessQueueSetups(sourceFiles: QueueReadinessSourceFile[]): QueueReadinessReport["queueSetups"] {
  const rows: QueueReadinessReport["queueSetups"] = [];
  for (const source of sourceFiles) {
    const queueCount = countMatches(source.text, /\bnew\s+Queue\s*\(|\bQueue\s*\(|\bqueue\s*=/gi);
    const workerCount = countMatches(source.text, /\bnew\s+Worker\s*\(|\bWorker\s*\(|\bprocessor\s*[:=]|\bprocess\s*\(/gi);
    const schedulerCount = countMatches(source.text, /\bJobScheduler\b|\bQueueScheduler\b|\brepeat\s*:|\bcron\b|\bevery\b|\bdelay\s*:/gi);
    const eventCount = countMatches(source.text, /\bQueueEvents\b|\.on\s*\(\s*["'](completed|failed|stalled|active|progress|drained)["']/gi);
    const flowCount = countMatches(source.text, /\bFlowProducer\b|\bparent\s*:|\bchildren\s*:/gi);
    const hasSetupSignal = queueCount + workerCount + schedulerCount + eventCount + flowCount > 0 || /\b(queue|job|worker|redis)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: queueReadinessProvider(source),
      queueCount,
      workerCount,
      schedulerCount,
      eventCount,
      flowCount,
      readiness: queueCount > 0 && workerCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains queues ${queueCount}, workers ${workerCount}, schedulers ${schedulerCount}, event listeners ${eventCount}, flows ${flowCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function queueReadinessProvider(source: QueueReadinessSourceFile): QueueReadinessReport["queueSetups"][number]["provider"] {
  if (/["']bullmq["']|\bbullmq\b|\bQueueEvents\b|\bFlowProducer\b|\bJobScheduler\b/i.test(source.text)) return "bullmq";
  if (/["']bull["']|from\s+["']bull["']|\bBull\b/i.test(source.text)) return "bull";
  if (/graphile-worker|makeWorkerUtils|runMigrations/i.test(source.text)) return "graphile-worker";
  if (/["']bree["']|\bnew\s+Bree\b/i.test(source.text)) return "bree";
  if (/["']agenda["']|\bnew\s+Agenda\b/i.test(source.text)) return "agenda";
  if (/\b(queue|job|worker|redis)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function queueReadinessProducerSignals(sourceFiles: QueueReadinessSourceFile[]): QueueReadinessReport["producerSignals"] {
  const specs: Array<{ signal: QueueReadinessReport["producerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "queue-add", pattern: /\bqueue\.add\s*\(|\.add\s*\(\s*["'`]/i, evidence: "queue.add producer evidence was detected." },
    { signal: "add-bulk", pattern: /\baddBulk\s*\(/i, evidence: "bulk enqueue evidence was detected." },
    { signal: "job-name", pattern: /\bqueue\.add\s*\(\s*["'`][^"'`]+["'`]|name\s*:/i, evidence: "job name evidence was detected." },
    { signal: "job-data", pattern: /\bqueue\.add\s*\([^,]+,\s*[{[]|\bdata\s*:/i, evidence: "job payload/data evidence was detected." },
    { signal: "priority", pattern: /\bpriority\s*:/i, evidence: "priority evidence was detected." },
    { signal: "delay", pattern: /\bdelay\s*:/i, evidence: "delayed job evidence was detected." },
    { signal: "repeat", pattern: /\brepeat\s*:|\bcron\s*:|\bevery\s*:/i, evidence: "repeat or cron job evidence was detected." },
    { signal: "job-id", pattern: /\bjobId\s*:|\bjobID\s*:|\bidempotent/i, evidence: "deterministic job ID evidence was detected." },
    { signal: "parent", pattern: /\bparent\s*:|\bchildren\s*:|\bFlowProducer\b/i, evidence: "parent-child flow evidence was detected." }
  ];
  return queueReadinessSignalFromSpecs(sourceFiles, specs, "producer", "signal");
}

function queueReadinessWorkerSignals(sourceFiles: QueueReadinessSourceFile[]): QueueReadinessReport["workerSignals"] {
  const specs: Array<{ signal: QueueReadinessReport["workerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "worker", pattern: /\bnew\s+Worker\s*\(|\bWorker\s*\(/i, evidence: "worker setup evidence was detected." },
    { signal: "processor", pattern: /\bprocessor\s*[:=]|\basync\s*\(\s*job\b|\bprocess\s*\(\s*async|\bjob\s*=>/i, evidence: "job processor evidence was detected." },
    { signal: "concurrency", pattern: /\bconcurrency\s*:/i, evidence: "worker concurrency evidence was detected." },
    { signal: "rate-limit", pattern: /\blimiter\s*:|\brateLimit|maximumRateLimitDelay/i, evidence: "rate limiting evidence was detected." },
    { signal: "sandbox", pattern: /\bsandbox|useWorkerThreads|worker_threads|processorFile/i, evidence: "sandbox or worker-thread evidence was detected." },
    { signal: "stalled-check", pattern: /\bstalled\b|maxStalledCount|stalledInterval|skipStalledCheck/i, evidence: "stalled job handling evidence was detected." },
    { signal: "lock-renewal", pattern: /lockDuration|lockRenewTime|skipLockRenewal/i, evidence: "lock renewal evidence was detected." },
    { signal: "remove-on-complete", pattern: /removeOnComplete/i, evidence: "completed-job cleanup evidence was detected." },
    { signal: "remove-on-fail", pattern: /removeOnFail/i, evidence: "failed-job cleanup evidence was detected." }
  ];
  return queueReadinessSignalFromSpecs(sourceFiles, specs, "worker", "signal");
}

function queueReadinessReliabilitySignals(sourceFiles: QueueReadinessSourceFile[]): QueueReadinessReport["reliabilitySignals"] {
  const specs: Array<{ signal: QueueReadinessReport["reliabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "attempts", pattern: /\battempts\s*:/i, evidence: "retry attempts evidence was detected." },
    { signal: "backoff", pattern: /\bbackoff\s*:/i, evidence: "backoff policy evidence was detected." },
    { signal: "failed-event", pattern: /\.on\s*\(\s*["']failed["']|\bfailed\b|failReason/i, evidence: "failed event evidence was detected." },
    { signal: "completed-event", pattern: /\.on\s*\(\s*["']completed["']|\bcompleted\b|returnvalue/i, evidence: "completed event evidence was detected." },
    { signal: "queue-events", pattern: /\bQueueEvents\b/i, evidence: "QueueEvents evidence was detected." },
    { signal: "retry", pattern: /\bretry\s*\(|\bretryJobs\b|\bretry\b/i, evidence: "manual retry evidence was detected." },
    { signal: "dead-letter", pattern: /dead[-_ ]?letter|dlq|failedQueue|failureQueue/i, evidence: "dead-letter queue evidence was detected." },
    { signal: "metrics", pattern: /\bmetrics\s*:|\bexportPrometheusMetrics\b|\bgetMetrics\b/i, evidence: "queue metrics evidence was detected." },
    { signal: "telemetry", pattern: /\btelemetry\s*:|OpenTelemetry|traceId|spanId/i, evidence: "telemetry evidence was detected." },
    { signal: "dashboard", pattern: /bull-board|@bull-board|taskforce|arena|dashboard/i, evidence: "queue dashboard evidence was detected." }
  ];
  return queueReadinessSignalFromSpecs(sourceFiles, specs, "reliability", "signal");
}

function queueReadinessConnectionSignals(sourceFiles: QueueReadinessSourceFile[]): QueueReadinessReport["connectionSignals"] {
  const specs: Array<{ signal: QueueReadinessReport["connectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "REDIS_URL", pattern: /\bREDIS_URL\b/i, evidence: "REDIS_URL evidence was detected." },
    { signal: "REDIS_HOST", pattern: /\bREDIS_HOST\b/i, evidence: "REDIS_HOST evidence was detected." },
    { signal: "REDIS_PORT", pattern: /\bREDIS_PORT\b/i, evidence: "REDIS_PORT evidence was detected." },
    { signal: "REDIS_PASSWORD", pattern: /\bREDIS_PASSWORD\b/i, evidence: "REDIS_PASSWORD evidence was detected." },
    { signal: "connection", pattern: /\bconnection\s*:|\bconnection\s*=|\bnew\s+IORedis\b|\bcreateClient\s*\(/i, evidence: "queue connection configuration evidence was detected." },
    { signal: "ioredis", pattern: /["']ioredis["']|\bIORedis\b/i, evidence: "ioredis package/import evidence was detected." },
    { signal: "node-redis", pattern: /["']redis["']|\bcreateClient\s*\(|node-redis/i, evidence: "node-redis package/import evidence was detected." },
    { signal: "docker-compose-redis", pattern: /redis:\s*\n|image:\s*redis|REDIS_URL|docker-compose/i, evidence: "Docker Compose Redis evidence was detected." }
  ];
  return queueReadinessSignalFromSpecs(sourceFiles, specs, "connection", "signal");
}

function queueReadinessPackageSignals(sourceFiles: QueueReadinessSourceFile[]): QueueReadinessReport["packageSignals"] {
  const specs: Array<{ signal: QueueReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "bullmq", pattern: /["']bullmq["']|\bfrom\s+["']bullmq["']|\bBullMQ\b/i, evidence: "bullmq package/import evidence was detected." },
    { signal: "bull", pattern: /["']bull["']|\bfrom\s+["']bull["']|\bBull\b/i, evidence: "bull package/import evidence was detected." },
    { signal: "@nestjs/bullmq", pattern: /@nestjs\/bullmq/i, evidence: "@nestjs/bullmq package/import evidence was detected." },
    { signal: "graphile-worker", pattern: /graphile-worker|makeWorkerUtils/i, evidence: "graphile-worker package/import evidence was detected." },
    { signal: "bree", pattern: /["']bree["']|\bnew\s+Bree\b/i, evidence: "bree package/import evidence was detected." },
    { signal: "agenda", pattern: /["']agenda["']|\bnew\s+Agenda\b/i, evidence: "agenda package/import evidence was detected." },
    { signal: "ioredis", pattern: /["']ioredis["']|\bIORedis\b/i, evidence: "ioredis package/import evidence was detected." },
    { signal: "redis", pattern: /["']redis["']|\bcreateClient\s*\(|node-redis/i, evidence: "redis package/import evidence was detected." }
  ];
  return queueReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function queueReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: QueueReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/queue-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildEventStreamReadinessReport(walk: WalkResult): Promise<EventStreamReadinessReport> {
  const sourceFiles = await eventStreamReadinessSourceFiles(walk);
  const eventStreamSetups = eventStreamReadinessSetups(sourceFiles);
  const platformSignals = eventStreamReadinessPlatformSignals(sourceFiles);
  const brokerSignals = eventStreamReadinessBrokerSignals(sourceFiles);
  const topicSignals = eventStreamReadinessTopicSignals(sourceFiles);
  const producerSignals = eventStreamReadinessProducerSignals(sourceFiles);
  const consumerSignals = eventStreamReadinessConsumerSignals(sourceFiles);
  const groupProtocolSignals = eventStreamReadinessGroupProtocolSignals(sourceFiles);
  const schemaSignals = eventStreamReadinessSchemaSignals(sourceFiles);
  const reliabilitySignals = eventStreamReadinessReliabilitySignals(sourceFiles);
  const securitySignals = eventStreamReadinessSecuritySignals(sourceFiles);
  const opsSignals = eventStreamReadinessOpsSignals(sourceFiles);
  const ciSignals = eventStreamReadinessCiSignals(sourceFiles);
  const packageSignals = eventStreamReadinessPackageSignals(sourceFiles);

  const hasPlatform = platformSignals.some((item) => item.readiness === "ready") || packageSignals.some((item) => ["kafka-client", "redpanda", "pulsar-client", "pulsar-broker"].includes(item.signal) && item.readiness === "ready");
  const hasBroker = brokerSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.brokerCount > 0);
  const hasTopic = topicSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.topicCount > 0);
  const hasProducer = producerSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.producerCount > 0);
  const hasConsumer = consumerSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.consumerCount > 0);
  const hasGroupProtocol = groupProtocolSignals.some((item) => item.readiness === "ready");
  const hasOffsetOrAck = consumerSignals.some((item) => ["offset-commit", "acknowledge", "negative-ack", "rebalance"].includes(item.signal) && item.readiness === "ready") || eventStreamSetups.some((item) => item.groupCount + item.offsetCount > 0);
  const hasSchemaPackage = packageSignals.some((item) => ["kafka-connect", "pulsar-client", "pulsar-broker"].includes(item.signal) && item.readiness === "ready") || schemaSignals.some((item) => ["avro", "protobuf", "json-schema", "schema-definition"].includes(item.signal) && item.readiness === "ready");
  const hasSchema = schemaSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.schemaCount > 0);
  const hasReliability = reliabilitySignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.reliabilityCount > 0);
  const hasSecurity = securitySignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.securityCount > 0);
  const hasOps = opsSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.opsCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || eventStreamSetups.some((item) => item.ciCount > 0);

  const riskQueue: EventStreamReadinessReport["riskQueue"] = [];
  if (!hasPlatform && !hasBroker && !hasTopic) {
    riskQueue.push({
      priority: "high",
      action: "Document the event streaming platform, broker, and topic strategy before claiming stream readiness.",
      why: "Kafka, Redpanda, and Pulsar readiness starts with explicit platform, broker, topic, partition, or namespace evidence.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if (hasTopic && (!hasProducer || !hasConsumer)) {
    riskQueue.push({
      priority: "high",
      action: "Pair each stream topic with producer and consumer ownership.",
      why: "A topic without both publishing and consuming paths leaves event flow, ownership, and failure handling ambiguous.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if ((hasProducer || hasConsumer) && !hasOffsetOrAck) {
    riskQueue.push({
      priority: "medium",
      action: "Add consumer-group offset, rebalance, subscription, or acknowledgement handling.",
      why: "Streaming consumers need auditable offset commits, rebalance callbacks, Pulsar subscriptions, or ack/nack behavior before runtime verification.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if (hasConsumer && !hasGroupProtocol) {
    riskQueue.push({
      priority: "medium",
      action: "Document Kafka consumer group protocol, coordinator, offsets topic, auto-offset, auto-commit, isolation, assignment, or rebalance metrics.",
      why: "Kafka 4 consumer readiness depends on the group protocol and coordinator/offset behavior, not only on the presence of KafkaConsumer and commit calls.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if (hasSchemaPackage && !hasSchema) {
    riskQueue.push({
      priority: "medium",
      action: "Document schema registry, schema definitions, and compatibility policy.",
      why: "Typed event streams need schema evolution controls so producers and consumers can change safely.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if ((hasPlatform || hasTopic) && !hasReliability) {
    riskQueue.push({
      priority: "medium",
      action: "Add DLQ, retry topic, transaction, exactly-once, replication, or backpressure evidence.",
      why: "Event streams need explicit handling for poison records, duplicate delivery, cross-cluster recovery, and overload behavior.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if ((hasPlatform || hasBroker) && !hasSecurity) {
    riskQueue.push({
      priority: "medium",
      action: "Document SASL/TLS/ACL/authentication controls for stream clients and brokers.",
      why: "Broker access and topic permissions are security boundaries, not implementation details.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if ((hasPlatform || hasBroker || hasTopic) && !hasOps) {
    riskQueue.push({
      priority: "low",
      action: "Add lag, metrics, quota, rack-awareness, admin-client, reassignment, or health-check evidence.",
      why: "Operators need observability and administrative controls to diagnose stream drift before incidents.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  if ((hasPlatform || hasTopic) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add CI smoke artifacts for broker, producer, consumer, and schema checks.",
      why: "Static stream readiness is stronger when CI records a broker/client/schema smoke result as an artifact.",
      relatedHref: "html/event-stream-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run event stream integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor records event stream readiness only; it does not run Kafka, Redpanda, Pulsar, brokers, clients, schema registries, topic creation, producer/consumer jobs, security handshakes, or CI commands.",
    relatedHref: "html/event-stream-readiness.html"
  });

  return {
    summary: `Event stream readiness report: setup ${eventStreamSetups.length}개, platform signal ${platformSignals.length}개, topic signal ${topicSignals.length}개, group protocol signal ${groupProtocolSignals.length}개, reliability signal ${reliabilitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Event stream readiness Apache Kafka Redpanda Apache Pulsar KafkaProducer KafkaConsumer AdminClient NewTopic consumer group group.protocol consumer streams classic group coordinator __consumer_offsets auto.offset.reset enable.auto.commit isolation.level partition assignment rebalance metrics offset commit rebalance schema registry DLQ retention compaction idempotence transactions ACL SASL PulsarClient SubscriptionType BookKeeper tenant namespace CI",
    eventStreamSetups,
    platformSignals,
    brokerSignals,
    topicSignals,
    producerSignals,
    consumerSignals,
    groupProtocolSignals,
    schemaSignals,
    reliabilitySignals,
    securitySignals,
    opsSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"KafkaProducer|KafkaConsumer|AdminClient|NewTopic|bootstrap.servers|consumer group|commitSync|commitAsync\" .", purpose: "Inventory Kafka producers, consumers, admin topic creation, broker bootstrap, consumer groups, and offset commits." },
      { command: "rg \"group\\.protocol|classic|consumer group protocol|streams group|group coordinator|__consumer_offsets|auto\\.offset\\.reset|enable\\.auto\\.commit|isolation\\.level|partition assignment|rebalance.*metrics\" .", purpose: "Review Kafka group protocol, group coordinator, offsets topic, auto-offset reset, auto-commit, isolation level, partition assignment, and rebalance metrics." },
      { command: "rg \"PulsarClient|newProducer|newConsumer|SubscriptionType|acknowledge|negativeAcknowledge|tenant|namespace\" .", purpose: "Find Pulsar client setup, producers, consumers, subscriptions, ack/nack behavior, and tenant/namespace boundaries." },
      { command: "rg \"schema.registry|Schema Registry|Avro|Protobuf|JSONSchema|SchemaDefinition|compatibility\" .", purpose: "Review schema registry, event schema formats, schema definitions, and compatibility policy." },
      { command: "rg \"dead.?letter|DLQ|retry topic|poison|transactional.id|enable.idempotence|exactly-once|geo-replication|MirrorMaker\" .", purpose: "Trace DLQ, retry, poison-record, transaction, idempotence, exactly-once, and replication behavior." },
      { command: "rg \"SASL|SCRAM|OAuth|TLS|ACL|authorization|authentication|quota|lag|rack.aware|upload-artifact|stream smoke\" .github .", purpose: "Check security, quota, lag monitoring, rack awareness, CI smoke, and artifact upload evidence." }
    ],
    learnerNextSteps: [
      "먼저 Kafka, Redpanda, Pulsar 중 어떤 platform evidence가 있는지 확인하고 broker/topic/partition 경계를 표시하세요.",
      "topic 또는 namespace가 보이면 producer와 consumer가 모두 있는지, consumer group 또는 subscription ownership이 분명한지 확인하세요.",
      "Kafka consumer가 있으면 group.protocol, group coordinator, __consumer_offsets, auto.offset.reset, enable.auto.commit, isolation.level, partition assignment, rebalance metrics를 별도로 확인하세요.",
      "consumer 코드는 offset commit, rebalance listener, acknowledge, negativeAcknowledge, DLQ, retry topic 같은 장애 복구 단서를 함께 추적하세요.",
      "schema registry, Avro, Protobuf, JSON Schema, SchemaDefinition evidence가 있으면 compatibility와 schema evolution 정책을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 broker startup, topic creation, producer/consumer job, security handshake, lag monitoring은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type EventStreamReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function eventStreamReadinessSourceFiles(walk: WalkResult): Promise<EventStreamReadinessSourceFile[]> {
  const files: EventStreamReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !eventStreamReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 260_000);
    if (!text) continue;
    if (!eventStreamReadinessPathSignal(file.relPath) && !eventStreamReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function eventStreamReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return eventStreamReadinessPathSignal(filePath)
    || /^(package\.json|package-lock\.json|pnpm-lock\.yaml|yarn\.lock|build\.gradle|settings\.gradle|pom\.xml|docker-compose\.ya?ml|compose\.ya?ml|Dockerfile|\.env\.example|\.env\.sample)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|java|kt|scala|py|go|rs|json|md|mdx|ya?ml|toml|properties|conf|env)$/i.test(filePath);
}

function eventStreamReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(kafka|redpanda|pulsar|event[-_]?streams?|streams?|topics?|producers?|consumers?|schema[-_]?registry|dlq|dead[-_]?letter|connectors?|brokers?|subscriptions?|namespaces?)(\/|\.|-|_|$)|\.github\/workflows|docker-compose|compose\.ya?ml/i.test(filePath);
}

function eventStreamReadinessContentSignal(text: string): boolean {
  return /\b(Apache Kafka|KafkaProducer|KafkaConsumer|AdminClient|NewTopic|bootstrap\.servers|consumer group|group\.protocol|group coordinator|__consumer_offsets|auto\.offset\.reset|enable\.auto\.commit|isolation\.level|partition assignment|commitSync|commitAsync|ConsumerRebalanceListener|enable\.idempotence|transactional\.id|schema\.registry|Schema Registry|dead[-_ ]?letter|DLQ|retention\.ms|cleanup\.policy|SASL|SCRAM|ACL|Redpanda|rpk topic|pandaproxy|kafka-clients|kafka-streams|connect-api|kafka-connect|PulsarClient|newProducer|newConsumer|SubscriptionType|acknowledge|negativeAcknowledge|DeadLetterPolicy|BookKeeper|pulsar-client|pulsar-broker|pulsar-functions|tenant|namespace|partitioned topic)\b/i.test(text);
}

function eventStreamReadinessSetups(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["eventStreamSetups"] {
  const rows: EventStreamReadinessReport["eventStreamSetups"] = [];
  for (const source of sourceFiles) {
    const brokerCount = countMatches(source.text, /\bbroker\b|\bbootstrap\.servers\b|\badvertised\.listeners?\b|\blisteners?\b|\bKRaft\b|\bZooKeeper\b|\bBookKeeper\b|\bserviceUrl\b|\bpandaproxy\b/gi);
    const topicCount = countMatches(source.text, /\btopic\b|\bNewTopic\b|\bpartitions?\b|\breplication\.factor\b|\bretention\.ms\b|\bcleanup\.policy\b|\bcompaction\b|\bpartitioned topic\b|\btenant\b|\bnamespace\b|\brpk topic\b/gi);
    const producerCount = countMatches(source.text, /\bKafkaProducer\b|\bnewProducer\b|\bProducer\b|\bproducer\b|\backs\b|\benable\.idempotence\b|\btransactional\.id\b|\bbatching\b|\bcompression\b/gi);
    const consumerCount = countMatches(source.text, /\bKafkaConsumer\b|\bnewConsumer\b|\bConsumer\b|\bconsumer\b|\bsubscribe\b|\bSubscriptionType\b|\backnowledge\b|\bnegativeAcknowledge\b/gi);
    const groupCount = countMatches(source.text, /\bconsumer group\b|\bgroup\.id\b|\bgroupId\b|\bgroup_name\b|\bsubscription(Name|Type)?\b|\bConsumerRebalanceListener\b/gi);
    const offsetCount = countMatches(source.text, /\boffset\b|\bcommitSync\b|\bcommitAsync\b|\boffset commit\b|\backnowledge\b|\bnegativeAcknowledge\b|\bpending ack\b/gi);
    const schemaCount = countMatches(source.text, /\bschema\.registry\b|\bSchema Registry\b|\bschema_registry\b|\bSchemaDefinition\b|\bSchema\.(AVRO|JSON|PROTOBUF)\b|\bAvro\b|\bProtobuf\b|\bJSONSchema\b|\bcompatibility\b/gi);
    const reliabilityCount = countMatches(source.text, /\bdead[-_ ]?letter\b|\bDLQ\b|\bretry topic\b|\bpoison\b|\btransaction\b|\bexactly[-_ ]?once\b|\bMirrorMaker\b|\bgeo[-_ ]?replication\b|\bbackpressure\b|\benable\.idempotence\b/gi);
    const securityCount = countMatches(source.text, /\bSASL\b|\bSCRAM\b|\bOAuth\b|\bOAUTHBEARER\b|\bTLS\b|\bSSL\b|\bACL\b|\bauthentication\b|\bauthorization\b|\bcertificates?\b/gi);
    const opsCount = countMatches(source.text, /\bmetrics?\b|\blag\b|\bquota\b|\brack\.aware\b|\brack-awareness\b|\bAdminClient\b|\btopic create\b|\breassignment\b|\bhealth[-_ ]?check\b|\brpk\b/gi);
    const ciCount = countMatches(source.text, /\bgithub[-_ ]?actions\b|\.github\/workflows|upload-artifact|broker-smoke|producer-smoke|consumer-smoke|schema-smoke|stream smoke/gi);
    const hasSetupSignal = brokerCount + topicCount + producerCount + consumerCount + groupCount + offsetCount + schemaCount + reliabilityCount + securityCount + opsCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      platform: eventStreamReadinessPlatform(source),
      brokerCount,
      topicCount,
      producerCount,
      consumerCount,
      groupCount,
      offsetCount,
      schemaCount,
      reliabilityCount,
      securityCount,
      opsCount,
      ciCount,
      readiness: brokerCount > 0 && topicCount > 0 && (producerCount > 0 || consumerCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains brokers ${brokerCount}, topics ${topicCount}, producers ${producerCount}, consumers ${consumerCount}, groups ${groupCount}, offsets ${offsetCount}, schemas ${schemaCount}, reliability ${reliabilityCount}, security ${securityCount}, ops ${opsCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function eventStreamReadinessPlatform(source: EventStreamReadinessSourceFile): EventStreamReadinessReport["eventStreamSetups"][number]["platform"] {
  if (/\bRedpanda\b|\brpk\b|\bpandaproxy\b|redpanda/i.test(source.filePath) || /\bRedpanda\b|\brpk\s+topic|\bpandaproxy\b/i.test(source.text)) return "redpanda";
  if (/\bPulsarClient\b|\bApache Pulsar\b|\bBookKeeper\b|\bSubscriptionType\b|pulsar/i.test(source.filePath) || /\bPulsarClient\b|\bApache Pulsar\b|\bBookKeeper\b|\bSubscriptionType\b/i.test(source.text)) return "pulsar";
  if (/\bKafkaProducer\b|\bKafkaConsumer\b|\bApache Kafka\b|\bAdminClient\b|\bKafka Streams\b|kafka/i.test(source.filePath) || /\bKafkaProducer\b|\bKafkaConsumer\b|\bApache Kafka\b|\bAdminClient\b|\bKafka Streams\b/i.test(source.text)) return "kafka";
  if (/\bevent[-_ ]?stream|\bmessage[-_ ]?stream|\bstreaming platform\b/i.test(source.text)) return "custom";
  return "unknown";
}

function eventStreamReadinessPlatformSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["platformSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "apache-kafka", pattern: /\bApache Kafka\b|\bKafkaProducer\b|\bKafkaConsumer\b|\bAdminClient\b|\bKafka Streams\b|\bkafka-clients\b|kafkajs/i, evidence: "Apache Kafka client or platform evidence was detected." },
    { signal: "redpanda", pattern: /\bRedpanda\b|\brpk\b|\bpandaproxy\b|redpanda/i, evidence: "Redpanda platform evidence was detected." },
    { signal: "apache-pulsar", pattern: /\bApache Pulsar\b|\bPulsarClient\b|\bSubscriptionType\b|\bBookKeeper\b|pulsar-client/i, evidence: "Apache Pulsar platform evidence was detected." },
    { signal: "custom", pattern: /\bevent[-_ ]?stream|\bmessage[-_ ]?stream|\bstreaming platform\b/i, evidence: "custom event stream platform evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function eventStreamReadinessBrokerSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["brokerSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["brokerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "broker", pattern: /\bbroker(s)?\b|\bKafkaCluster\b|\bPulsarService\b|\bredpanda\b/i, evidence: "broker evidence was detected." },
    { signal: "bootstrap-server", pattern: /\bbootstrap\.servers\b|\bbootstrapServers\b|\bBOOTSTRAP_SERVERS\b/i, evidence: "bootstrap server evidence was detected." },
    { signal: "listener", pattern: /\blisteners?\b|\bSASL_SSL:\/\/|\bPLAINTEXT:\/\//i, evidence: "listener evidence was detected." },
    { signal: "advertised-listener", pattern: /\badvertised\.listeners?\b|\badvertised_kafka_api\b/i, evidence: "advertised listener evidence was detected." },
    { signal: "kraft", pattern: /\bKRaft\b|\bprocess\.roles\b|\bcontroller\.quorum\b/i, evidence: "KRaft broker mode evidence was detected." },
    { signal: "zookeeper", pattern: /\bZooKeeper\b|\bzookeeper\b/i, evidence: "ZooKeeper coordination evidence was detected." },
    { signal: "bookkeeper", pattern: /\bBookKeeper\b|\bbookkeeper\b/i, evidence: "BookKeeper storage evidence was detected." },
    { signal: "broker-service", pattern: /\bPulsarService\b|\bbrokerService\b|\bserviceUrl\b|\bbrokerServiceUrl\b/i, evidence: "Pulsar broker service evidence was detected." },
    { signal: "proxy", pattern: /\bpandaproxy\b|\bpulsar-proxy\b|\bProxyService\b|\bproxyService\b/i, evidence: "stream proxy evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "broker", "signal");
}

function eventStreamReadinessTopicSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["topicSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["topicSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "topic", pattern: /\btopic(Name)?\b|\bNewTopic\b|\brpk topic\b/i, evidence: "topic evidence was detected." },
    { signal: "partition", pattern: /\bpartitions?\b|\bnumPartitions\b|\bpartitioned\b/i, evidence: "partition evidence was detected." },
    { signal: "replication-factor", pattern: /\breplication\.factor\b|\breplicationFactor\b|\breplicas\b/i, evidence: "replication factor evidence was detected." },
    { signal: "retention", pattern: /\bretention\.ms\b|\bretention\.bytes\b|\bmessageRetention\b|\bretentionSize\b|\bretentionTime\b/i, evidence: "retention evidence was detected." },
    { signal: "compaction", pattern: /\bcompaction\b|\bcompacted\b|\bTopicCompaction\b|\bcleanup\.policy\s*=\s*compact\b/i, evidence: "compaction evidence was detected." },
    { signal: "cleanup-policy", pattern: /\bcleanup\.policy\b|\blog\.cleanup\.policy\b/i, evidence: "cleanup policy evidence was detected." },
    { signal: "partitioned-topic", pattern: /\bpartitioned topic\b|\bcreatePartitionedTopic\b|\bpartitionedTopic\b/i, evidence: "partitioned topic evidence was detected." },
    { signal: "tenant-namespace", pattern: /\btenant\b|\bnamespace\b|\bNamespaceName\b|\bTenantInfo\b/i, evidence: "tenant or namespace evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "topic", "signal");
}

function eventStreamReadinessProducerSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["producerSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["producerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-producer", pattern: /\bKafkaProducer\b|\bnew\s+ProducerRecord\b|\bkafka\.producer\b|\bproducer\.send\b/i, evidence: "Kafka producer evidence was detected." },
    { signal: "pulsar-producer", pattern: /\bnewProducer\b|\bProducerBuilder\b|\bPulsarClient.*producer|\bproducerName\b/i, evidence: "Pulsar producer evidence was detected." },
    { signal: "producer-config", pattern: /\bProducerConfig\b|\bproducer\.properties\b|\bproducerConfig\b|\bproducer\./i, evidence: "producer configuration evidence was detected." },
    { signal: "acks", pattern: /\backs\b|\backs=all|\bACKS_CONFIG\b/i, evidence: "producer acknowledgement config evidence was detected." },
    { signal: "idempotence", pattern: /\benable\.idempotence\b|\bIDEMPOTENCE\b|\bidempotent\b/i, evidence: "idempotent producer evidence was detected." },
    { signal: "transactional-id", pattern: /\btransactional\.id\b|\bTRANSACTIONAL_ID\b|\btransactionalId\b/i, evidence: "transactional producer ID evidence was detected." },
    { signal: "batching", pattern: /\bbatch\.size\b|\bbatching\b|\bbatchingMax\b|\blinger\.ms\b/i, evidence: "producer batching evidence was detected." },
    { signal: "compression", pattern: /\bcompression\.type\b|\bcompressionType\b|\bcompression\b/i, evidence: "producer compression evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "producer", "signal");
}

function eventStreamReadinessConsumerSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["consumerSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["consumerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-consumer", pattern: /\bKafkaConsumer\b|\bkafka\.consumer\b|\bconsumer\.poll\b|\bsubscribe\s*\(/i, evidence: "Kafka consumer evidence was detected." },
    { signal: "pulsar-consumer", pattern: /\bnewConsumer\b|\bConsumerBuilder\b|\bPulsarClient.*consumer|\bsubscriptionName\b/i, evidence: "Pulsar consumer evidence was detected." },
    { signal: "consumer-group", pattern: /\bconsumer group\b|\bgroup\.id\b|\bgroupId\b|\bgroup_name\b/i, evidence: "consumer group evidence was detected." },
    { signal: "subscription", pattern: /\bSubscriptionType\b|\bsubscriptionName\b|\bsubscriptionType\b|\bsubscribeAsync\b/i, evidence: "Pulsar subscription evidence was detected." },
    { signal: "offset-commit", pattern: /\bcommitSync\b|\bcommitAsync\b|\boffset commit\b|\bOffsetCommit\b|\bcommitted offset\b/i, evidence: "offset commit evidence was detected." },
    { signal: "rebalance", pattern: /\bConsumerRebalanceListener\b|\brebalance\b|\bonPartitionsAssigned\b|\bonPartitionsRevoked\b/i, evidence: "consumer rebalance evidence was detected." },
    { signal: "acknowledge", pattern: /\backnowledge(Async)?\b|\backTimeout\b|\bpositive ack\b/i, evidence: "acknowledgement evidence was detected." },
    { signal: "negative-ack", pattern: /\bnegativeAcknowledge\b|\bnack\b|\bnegative ack\b/i, evidence: "negative acknowledgement evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "consumer", "signal");
}

function eventStreamReadinessGroupProtocolSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["groupProtocolSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["groupProtocolSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "group-protocol-consumer", pattern: /group\.protocol\s*=\s*consumer|Consumer rebalance protocol|new Consumer rebalance protocol/i, evidence: "Kafka consumer group protocol evidence was detected." },
    { signal: "group-protocol-streams", pattern: /group\.protocol\s*=\s*streams|Streams Rebalance Protocol|streams group/i, evidence: "Kafka Streams group protocol evidence was detected." },
    { signal: "classic-protocol", pattern: /classic group protocol|classic consumer group protocol|group\.protocol\s*=\s*classic|\bClassic\b.*rebalance/i, evidence: "Kafka classic group protocol evidence was detected." },
    { signal: "group-coordinator", pattern: /group coordinator|FindCoordinatorRequest|FindCoordinatorResponse|coordinator broker/i, evidence: "Kafka group coordinator evidence was detected." },
    { signal: "consumer-offsets-topic", pattern: /__consumer_offsets|offsets topic|OffsetCommitRequest|OffsetFetchRequest/i, evidence: "Kafka consumer offsets topic evidence was detected." },
    { signal: "auto-offset-reset", pattern: /auto\.offset\.reset/i, evidence: "Kafka auto.offset.reset evidence was detected." },
    { signal: "auto-commit", pattern: /enable\.auto\.commit|auto commit/i, evidence: "Kafka auto commit evidence was detected." },
    { signal: "isolation-level", pattern: /isolation\.level|read_committed|read_uncommitted/i, evidence: "Kafka isolation level evidence was detected." },
    { signal: "partition-assignment", pattern: /partition assignment|RangeAssignor|CooperativeStickyAssignor|StickyAssignor|assignor/i, evidence: "Kafka partition assignment evidence was detected." },
    { signal: "rebalance-metrics", pattern: /rebalance.*metrics|tasks-revoked-latency|tasks-assigned-latency|tasks-lost-latency/i, evidence: "Kafka rebalance metrics evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "group protocol", "signal");
}

function eventStreamReadinessSchemaSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "schema-registry", pattern: /\bschema\.registry\b|\bSchema Registry\b|\bschema_registry\b|\bSchemaRegistry\b/i, evidence: "schema registry evidence was detected." },
    { signal: "avro", pattern: /\bAvro\b|\bSchema\.AVRO\b|\bavroSchema\b/i, evidence: "Avro schema evidence was detected." },
    { signal: "protobuf", pattern: /\bProtobuf\b|\bProtoBuf\b|\bSchema\.PROTOBUF\b|\bproto3\b/i, evidence: "Protobuf schema evidence was detected." },
    { signal: "json-schema", pattern: /\bJSONSchema\b|\bJSON Schema\b|\bSchema\.JSON\b|\bjson-schema\b/i, evidence: "JSON Schema evidence was detected." },
    { signal: "schema-evolution", pattern: /\bschema evolution\b|\bevolution\b|\bversioned schema\b|\bSchemaInfoWithVersion\b/i, evidence: "schema evolution evidence was detected." },
    { signal: "compatibility", pattern: /\bcompatibility\b|\bBACKWARD\b|\bFORWARD\b|\bFULL_TRANSITIVE\b/i, evidence: "schema compatibility evidence was detected." },
    { signal: "schema-definition", pattern: /\bSchemaDefinition\b|\bSchemaInfo\b|\bSchemaType\b|\bSchema\.builder\b/i, evidence: "schema definition evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function eventStreamReadinessReliabilitySignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["reliabilitySignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["reliabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dead-letter-queue", pattern: /\bdead[-_ ]?letter\b|\bDLQ\b|errors\.deadletterqueue\.topic\.name|DeadLetterPolicy/i, evidence: "dead-letter queue evidence was detected." },
    { signal: "retry-topic", pattern: /\bretry topic\b|\bretryTopic\b|\bretry[-_ ]?queue\b|\bRetryLetterTopic\b/i, evidence: "retry topic evidence was detected." },
    { signal: "poison-record", pattern: /\bpoison\b|\bpoison record\b|\bbad record\b|\bmalformed message\b/i, evidence: "poison record handling evidence was detected." },
    { signal: "transaction", pattern: /\btransactional\.id\b|\bTransaction\b|\btransaction coordinator\b|\bTxnID\b|\bwithTransaction\b/i, evidence: "transaction evidence was detected." },
    { signal: "exactly-once", pattern: /\bexactly[-_ ]?once\b|\beos\b|\bidempotent\b|\benable\.idempotence\b/i, evidence: "exactly-once or idempotence evidence was detected." },
    { signal: "mirror-replication", pattern: /\bMirrorMaker\b|\bMirrorSource\b|\bMirrorCheckpoint\b|\bmirror replication\b/i, evidence: "mirror replication evidence was detected." },
    { signal: "geo-replication", pattern: /\bgeo[-_ ]?replication\b|\breplicate.*cluster\b|\bcluster replication\b/i, evidence: "geo replication evidence was detected." },
    { signal: "backpressure", pattern: /\bbackpressure\b|\bmaxPollRecords\b|\breceiverQueueSize\b|\bflow control\b/i, evidence: "backpressure or flow-control evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "reliability", "signal");
}

function eventStreamReadinessSecuritySignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["securitySignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["securitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sasl", pattern: /\bSASL\b|\bsasl\./i, evidence: "SASL evidence was detected." },
    { signal: "tls", pattern: /\bTLS\b|\bSSL\b|\bSASL_SSL\b|\bssl\./i, evidence: "TLS/SSL evidence was detected." },
    { signal: "acl", pattern: /\bACL\b|\bAclBinding\b|\bAccessControlEntry\b|\ballowAcl\b/i, evidence: "ACL evidence was detected." },
    { signal: "authentication", pattern: /\bauthentication\b|\bauthn\b|\bAuthenticationProvider\b|\bauthPluginClassName\b/i, evidence: "authentication evidence was detected." },
    { signal: "authorization", pattern: /\bauthorization\b|\bauthz\b|\bAuthorizationProvider\b|\bauthorizer\b/i, evidence: "authorization evidence was detected." },
    { signal: "oauth", pattern: /\bOAuth\b|\bOAUTHBEARER\b|\boauthbearer\b/i, evidence: "OAuth evidence was detected." },
    { signal: "scram", pattern: /\bSCRAM\b|\bscram\b/i, evidence: "SCRAM evidence was detected." },
    { signal: "certificates", pattern: /\bcertificate\b|\bcertFile\b|\btruststore\b|\bkeystore\b|\bcaCert\b/i, evidence: "certificate evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "security", "signal");
}

function eventStreamReadinessOpsSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["opsSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["opsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "metrics", pattern: /\bmetrics?\b|\bJMX\b|\bPrometheus\b|\bMicrometer\b/i, evidence: "metrics evidence was detected." },
    { signal: "lag-monitoring", pattern: /\blag\b|\bconsumer lag\b|\boffset lag\b|\brecords-lag\b/i, evidence: "lag monitoring evidence was detected." },
    { signal: "quota", pattern: /\bquota\b|\bclient quota\b|\bclient_quota\b|\bthrottle/i, evidence: "quota evidence was detected." },
    { signal: "rack-awareness", pattern: /\brack\.aware\b|\brack-awareness\b|\bbroker\.rack\b|\brackAware\b/i, evidence: "rack awareness evidence was detected." },
    { signal: "admin-client", pattern: /\bAdminClient\b|\bAdmin\b|\brpk\b|\bPulsarAdmin\b/i, evidence: "admin client evidence was detected." },
    { signal: "topic-create", pattern: /\bNewTopic\b|\bcreateTopics?\b|\brpk topic create\b|\bcreatePartitionedTopic\b/i, evidence: "topic creation evidence was detected." },
    { signal: "reassignment", pattern: /\breassignment\b|\breassign partitions\b|\balterPartitionReassignments\b/i, evidence: "partition reassignment evidence was detected." },
    { signal: "health-check", pattern: /\bhealth[-_ ]?check\b|\breadinessProbe\b|\blivenessProbe\b|\bcluster health\b/i, evidence: "health check evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "ops", "signal");
}

function eventStreamReadinessCiSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["ciSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github[-_ ]?actions|\buses:\s*actions\//i, evidence: "GitHub Actions evidence was detected." },
    { signal: "broker-smoke-command", pattern: /broker-smoke|stream broker smoke|kafka.*smoke|pulsar.*smoke|redpanda.*smoke/i, evidence: "broker smoke command evidence was detected." },
    { signal: "producer-smoke-command", pattern: /producer-smoke|producer smoke|produce.*smoke/i, evidence: "producer smoke command evidence was detected." },
    { signal: "consumer-smoke-command", pattern: /consumer-smoke|consumer smoke|consume.*smoke/i, evidence: "consumer smoke command evidence was detected." },
    { signal: "schema-smoke-command", pattern: /schema-smoke|schema registry.*smoke|schema.*compatibility.*check/i, evidence: "schema smoke command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|event-stream-report\.json|consumer-lag\.json|schema-registry-check\.json|dlq-report\.json/i, evidence: "stream readiness artifact upload evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "ci", "signal");
}

function eventStreamReadinessPackageSignals(sourceFiles: EventStreamReadinessSourceFile[]): EventStreamReadinessReport["packageSignals"] {
  const specs: Array<{ signal: EventStreamReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kafka-client", pattern: /kafkajs|@confluentinc\/kafka-javascript|org\.apache\.kafka:kafka-clients|["']kafka-node["']|\bkafka-clients\b/i, evidence: "Kafka client package evidence was detected." },
    { signal: "kafka-streams", pattern: /org\.apache\.kafka:kafka-streams|\bkafka-streams\b|\bKafkaStreams\b/i, evidence: "Kafka Streams package evidence was detected." },
    { signal: "kafka-connect", pattern: /org\.apache\.kafka:connect-api|\bkafka-connect\b|\bconnect-api\b|\bKafka Connect\b/i, evidence: "Kafka Connect package evidence was detected." },
    { signal: "redpanda", pattern: /redpanda|@redpanda-data|\brpk\b|\bpandaproxy\b/i, evidence: "Redpanda package or CLI evidence was detected." },
    { signal: "pulsar-client", pattern: /pulsar-client|org\.apache\.pulsar:pulsar-client|\bPulsarClient\b/i, evidence: "Pulsar client package evidence was detected." },
    { signal: "pulsar-broker", pattern: /pulsar-broker|org\.apache\.pulsar:pulsar-broker|\bPulsarService\b/i, evidence: "Pulsar broker package evidence was detected." },
    { signal: "pulsar-functions", pattern: /pulsar-functions|org\.apache\.pulsar:pulsar-functions|\bPulsar Functions\b/i, evidence: "Pulsar Functions package evidence was detected." },
    { signal: "custom", pattern: /\bevent[-_ ]?stream|\bmessage[-_ ]?stream|\bstream processor\b/i, evidence: "custom stream package evidence was detected." }
  ];
  return eventStreamReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function eventStreamReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: EventStreamReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/event-stream-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
