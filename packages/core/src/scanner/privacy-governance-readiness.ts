import type { ConsentReadinessReport, PrivacyReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildConsentReadinessReport(walk: WalkResult): Promise<ConsentReadinessReport> {
  const sourceFiles = await consentReadinessSourceFiles(walk);
  const consentSetups = consentReadinessSetups(sourceFiles);
  const bannerSignals = consentReadinessBannerSignals(sourceFiles);
  const categorySignals = consentReadinessCategorySignals(sourceFiles);
  const scriptSignals = consentReadinessScriptSignals(sourceFiles);
  const privacySignals = consentReadinessPrivacySignals(sourceFiles);
  const tcfSignals = consentReadinessTcfSignals(sourceFiles);
  const packageSignals = consentReadinessPackageSignals(sourceFiles);

  const hasBannerOrModal = bannerSignals.some((item) => ["banner", "modal"].includes(item.signal) && item.readiness === "ready") || consentSetups.some((item) => item.bannerCount + item.modalCount > 0);
  const hasCategoriesOrPurposes = categorySignals.some((item) => item.readiness === "ready") || consentSetups.some((item) => item.categoryCount + item.purposeCount + item.serviceCount > 0);
  const hasChoiceControls = bannerSignals.some((item) => ["accept-all", "accept-selected", "reject-all", "settings-button"].includes(item.signal) && item.readiness === "ready");
  const hasScriptBlocking = scriptSignals.some((item) => item.readiness === "ready") || consentSetups.some((item) => item.scriptBlockingCount > 0);
  const hasPrivacyControls = privacySignals.some((item) => ["privacy-policy", "withdraw", "opt-out", "proof"].includes(item.signal) && item.readiness === "ready");
  const hasTcf = tcfSignals.some((item) => item.signal !== "unknown" && item.readiness === "ready") || consentSetups.some((item) => item.vendorCount + item.purposeCount > 0);
  const hasTcfConsentModel = tcfSignals.some((item) => ["vendor-list", "purpose-consents", "vendor-consents", "gvl"].includes(item.signal) && item.readiness === "ready");
  const hasStorageAndLocalization = consentSetups.some((item) => item.storageCount > 0 && item.localizationCount > 0) || bannerSignals.some((item) => item.signal === "revision" && item.readiness === "ready");

  const riskQueue: ConsentReadinessReport["riskQueue"] = [];
  if (!hasBannerOrModal) {
    riskQueue.push({
      priority: "high",
      action: "Add or document a consent banner, modal, or settings entry point before claiming privacy consent readiness.",
      why: "Consent management needs a visible user interaction surface, not just a package dependency or policy text.",
      relatedHref: "html/consent-readiness.html"
    });
  }
  if (hasBannerOrModal && !hasCategoriesOrPurposes) {
    riskQueue.push({
      priority: "high",
      action: "Model consent categories, services, or purposes such as necessary, analytics, marketing, and preferences.",
      why: "A banner without categories or purposes cannot explain what users are accepting or rejecting.",
      relatedHref: "html/consent-readiness.html"
    });
  }
  if (hasCategoriesOrPurposes && !hasChoiceControls) {
    riskQueue.push({
      priority: "medium",
      action: "Expose accept-all, accept-selected, reject-all, and settings controls for the consent surface.",
      why: "Consent readiness depends on granular choice controls that match the declared categories and purposes.",
      relatedHref: "html/consent-readiness.html"
    });
  }
  if (hasCategoriesOrPurposes && !hasScriptBlocking) {
    riskQueue.push({
      priority: "medium",
      action: "Wire non-essential scripts through data-src, text/plain script blocking, autoclear, or equivalent consent gates.",
      why: "Categories alone do not prevent analytics or marketing scripts from loading before consent.",
      relatedHref: "html/consent-readiness.html"
    });
  }
  if (hasBannerOrModal && !hasPrivacyControls) {
    riskQueue.push({
      priority: "medium",
      action: "Link privacy policy, withdrawal, opt-out, or consent proof flows from the consent implementation.",
      why: "Users and auditors need a way to revisit consent choices and trace the policy basis.",
      relatedHref: "html/consent-readiness.html"
    });
  }
  if (hasTcf && !hasTcfConsentModel) {
    riskQueue.push({
      priority: "high",
      action: "Complete IAB TCF vendor list, purpose consent, vendor consent, and GVL evidence.",
      why: "TCF evidence is incomplete unless the CMP exposes vendor and purpose consent state.",
      relatedHref: "html/consent-readiness.html"
    });
  }
  if (hasBannerOrModal && !hasStorageAndLocalization) {
    riskQueue.push({
      priority: "low",
      action: "Document consent storage, revision handling, and localized consent copy.",
      why: "Consent updates and multilingual users are harder to audit without persisted revision and translation evidence.",
      relatedHref: "html/consent-readiness.html"
    });
  }

  return {
    summary: `Consent readiness report: consent setup ${consentSetups.length}개, banner signal ${bannerSignals.length}개, category signal ${categorySignals.length}개, TCF signal ${tcfSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Consent readiness CookieConsent Klaro IAB TCF CMP banner modal categories services purposes vendors accept all accept selected reject all withdraw privacy policy data-src text/plain data-type data-name autoclear cookies localStorage revision translations __tcfapi TCString cmpId GVL purposeConsents vendorConsents legitimateInterests",
    consentSetups,
    bannerSignals,
    categorySignals,
    scriptSignals,
    privacySignals,
    tcfSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"CookieConsent|cookieconsent|klaro|__tcfapi|TCString|ConsentManager\" package.json src app docs", purpose: "Find CMP packages, consent manager entry points, and IAB TCF APIs." },
      { command: "rg \"categories|services|purposes|necessary|analytics|marketing|preferences|data-src|text/plain|data-type|data-name|autoclear\" src app docs", purpose: "Trace categories, services, purposes, and script blocking controls." },
      { command: "rg \"privacy policy|withdraw|opt-out|consentMode|gpc|do not track|purposeConsents|vendorConsents|GVL\" src app docs", purpose: "Check privacy policy links, withdrawal controls, consent mode, GPC/DNT, and TCF consent state." }
    ],
    learnerNextSteps: [
      "먼저 banner/modal/settings UI가 어디서 노출되는지 확인하세요.",
      "necessary, analytics, marketing, preferences 같은 category와 service/purpose 매핑을 찾으세요.",
      "data-src, text/plain, data-type, data-name, autoclear 같은 script blocking이 비필수 스크립트에 적용되는지 확인하세요.",
      "IAB TCF를 쓰는 repo라면 __tcfapi, TCString, GVL, purpose/vendor consent 상태가 함께 보이는지 추적하세요."
    ]
  };
}

type ConsentSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function consentReadinessSourceFiles(walk: WalkResult): Promise<ConsentSourceFile[]> {
  const rows: ConsentSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!consentInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!consentPathSignal(file.relPath) && !consentContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 180);
}

function consentInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|cookieconsent\.(json|ya?ml|ts|tsx|js|mjs|cjs)|klaro\.(json|ya?ml|ts|tsx|js|mjs|cjs)|consent\.(json|ya?ml|md|ts|tsx|js|mjs|cjs)|privacy\.(json|ya?ml|md|ts|tsx|js)|cookies?\.(json|ya?ml|md|ts|tsx|js)|cmp\.(json|ya?ml|ts|tsx|js)|tcf\.(json|ya?ml|ts|tsx|js))$/i.test(base)
    || /(^|\/)(consent|cookie|cookies|privacy|klaro|cmp|tcf|iab|vendor|vendors|purpose|purposes|gdpr|preferences?)(\/|\.|-|_|$)/i.test(filePath)
    || /\.(json|ya?ml|ts|tsx|js|jsx|mjs|cjs|md|html|vue|svelte|go|rs|py|rb|php)$/i.test(filePath);
}

function consentPathSignal(filePath: string): boolean {
  return /(^|\/)(consent|cookie|cookies|privacy|klaro|cmp|tcf|iab|vendor|vendors|purpose|purposes|gdpr|preferences?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|cookieconsent\.(json|ya?ml|ts|tsx|js|mjs|cjs)|klaro\.(json|ya?ml|ts|tsx|js|mjs|cjs)|consent\.(json|ya?ml|md|ts|tsx|js|mjs|cjs)|privacy\.(json|ya?ml|md|ts|tsx|js)|cmp\.(json|ya?ml|ts|tsx|js)|tcf\.(json|ya?ml|ts|tsx|js))$/i.test(path.basename(filePath));
}

function consentContentSignal(text: string): boolean {
  return /CookieConsent|cookieconsent|vanilla-cookieconsent|klaro|ConsentManager|cookie consent|consent manager|\bCMP\b|__tcfapi|TCString|purposeConsents|vendorConsents|legitimateInterest|data-src|data-type|data-name|text\/plain|autoclear|privacy policy|withdraw consent|acceptAll|acceptSelected|rejectAll/i.test(text);
}

function consentReadinessSetups(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["consentSetups"] {
  const rows: ConsentReadinessReport["consentSetups"] = [];
  for (const source of sourceFiles) {
    const bannerCount = countMatches(source.text, /\b(banner|notice|bar|consentNotice|consent notice|guiOptions|cookie banner|cookie notice)\b/gi);
    const modalCount = countMatches(source.text, /\b(modal|settings|preferencesModal|consentModal|preferences modal|settings button|showPreferences|showSettings)\b/gi);
    const categoryCount = countMatches(source.text, /\b(category|categories|necessary|analytics|marketing|preferences|functional|performance)\b/gi);
    const serviceCount = countMatches(source.text, /\b(service|services|apps|third.?party|module|scriptName|data-name)\b/gi);
    const purposeCount = countMatches(source.text, /\b(purpose|purposes|purposeConsents|purposeLegitimateInterests|purpose one|purpose two)\b/gi);
    const vendorCount = countMatches(source.text, /\b(vendor|vendors|GVL|vendorList|vendorConsents|vendorLegitimateInterests|vendor list)\b/gi);
    const scriptBlockingCount = countMatches(source.text, /\b(data-src|text\/plain|data-type|data-name|autoclear|script blocking|disablePageInteraction|pageScripts|page scripts)\b/gi);
    const storageCount = countMatches(source.text, /\b(cookie|cookies|localStorage|sessionStorage|storageName|consent cookie|revision|cookie_expiration|cookieDomain)\b/gi);
    const localizationCount = countMatches(source.text, /\b(language|languages|translations|locale|locales|i18n|consentLanguage|default_language)\b/gi);
    const apiCount = countMatches(source.text, /\b(onConsent|onChange|getConsent|ConsentManager|klaro\.show|__tcfapi|addEventListener|TCString|CmpApi|acceptAll|acceptSelected|rejectAll)\b/gi);
    const totalSignals = bannerCount + modalCount + categoryCount + serviceCount + purposeCount + vendorCount + scriptBlockingCount + storageCount + localizationCount + apiCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      provider: consentProvider(source),
      bannerCount,
      modalCount,
      categoryCount,
      serviceCount,
      purposeCount,
      vendorCount,
      scriptBlockingCount,
      storageCount,
      localizationCount,
      apiCount,
      readiness: (bannerCount + modalCount) > 0 && (categoryCount + serviceCount + purposeCount) > 0 && (scriptBlockingCount + apiCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} consent readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.bannerCount + b.modalCount + b.categoryCount + b.scriptBlockingCount + b.apiCount) - (a.bannerCount + a.modalCount + a.categoryCount + a.scriptBlockingCount + a.apiCount))
    .slice(0, 45);
}

function consentProvider(source: ConsentSourceFile): ConsentReadinessReport["consentSetups"][number]["provider"] {
  if (/cookieconsent/i.test(source.filePath) || /CookieConsent|cookieconsent|vanilla-cookieconsent/i.test(source.text)) return "cookieconsent";
  if (/klaro/i.test(source.filePath) || /klaro|ConsentManager|getConsent/i.test(source.text)) return "klaro";
  if (/(^|\/)(iab|tcf|cmp)(\/|\.|-|_|$)/i.test(source.filePath) || /@iabtcf|__tcfapi|TCString|CmpApi|GVL|purposeConsents|vendorConsents/i.test(source.text)) return "iab-tcf";
  if (/consent|cookie|privacy|cmp/i.test(source.filePath) || /consent|cookie|privacy|CMP/i.test(source.text)) return "custom";
  return "unknown";
}

function consentReadinessBannerSignals(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["bannerSignals"] {
  const specs: Array<{ signal: ConsentReadinessReport["bannerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "banner", pattern: /banner|consentNotice|cookie notice|cookie banner|guiOptions/i, evidence: "consent banner evidence was detected." },
    { signal: "modal", pattern: /modal|settings|preferencesModal|consentModal|preferences modal/i, evidence: "consent modal/settings evidence was detected." },
    { signal: "accept-all", pattern: /acceptAll|accept all|accept_all|btn-accept-all/i, evidence: "accept-all control evidence was detected." },
    { signal: "accept-selected", pattern: /acceptSelected|accept selected|accept_necessary|accept necessary|save preferences/i, evidence: "accept-selected/preference save evidence was detected." },
    { signal: "reject-all", pattern: /rejectAll|reject all|reject_all|decline|deny/i, evidence: "reject-all control evidence was detected." },
    { signal: "settings-button", pattern: /settings button|showSettings|showPreferences|preferences button|manage preferences/i, evidence: "settings button evidence was detected." },
    { signal: "revision", pattern: /revision|policyVersion|consentVersion|versioned consent/i, evidence: "consent revision/version evidence was detected." },
    { signal: "hide-from-bots", pattern: /hideFromBots|hide from bots|bot.*consent|crawler/i, evidence: "bot/crawler handling evidence was detected." }
  ];
  return consentSignalFromSpecs(sourceFiles, specs, "banner", "signal");
}

function consentReadinessCategorySignals(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["categorySignals"] {
  const specs: Array<{ signal: ConsentReadinessReport["categorySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "necessary", pattern: /necessary|required|essential/i, evidence: "necessary category evidence was detected." },
    { signal: "analytics", pattern: /analytics|measurement|statistics|gtag|ga4/i, evidence: "analytics category evidence was detected." },
    { signal: "marketing", pattern: /marketing|advertising|ads|remarketing|pixel/i, evidence: "marketing category evidence was detected." },
    { signal: "preferences", pattern: /preferences|personalization|settings/i, evidence: "preferences category evidence was detected." },
    { signal: "functional", pattern: /functional|functionality/i, evidence: "functional category evidence was detected." },
    { signal: "performance", pattern: /performance|perf|speed|monitoring/i, evidence: "performance category evidence was detected." },
    { signal: "services", pattern: /\bservices\b|\bapps\b|third.?party|data-name/i, evidence: "service mapping evidence was detected." },
    { signal: "purposes", pattern: /\bpurposes?\b|purposeConsents|purposeLegitimateInterests/i, evidence: "purpose mapping evidence was detected." }
  ];
  return consentSignalFromSpecs(sourceFiles, specs, "category", "signal");
}

function consentReadinessScriptSignals(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["scriptSignals"] {
  const specs: Array<{ signal: ConsentReadinessReport["scriptSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "data-src", pattern: /data-src/i, evidence: "data-src script blocking evidence was detected." },
    { signal: "text-plain", pattern: /text\/plain|type=["']text\/plain/i, evidence: "text/plain script blocking evidence was detected." },
    { signal: "data-type", pattern: /data-type/i, evidence: "data-type consent script evidence was detected." },
    { signal: "data-name", pattern: /data-name/i, evidence: "data-name service mapping evidence was detected." },
    { signal: "autoclear", pattern: /autoclear|autoClear/i, evidence: "autoclear evidence was detected." },
    { signal: "page-script", pattern: /pageScripts|page scripts|script.*category|managed script/i, evidence: "page script management evidence was detected." },
    { signal: "disable-page-interaction", pattern: /disablePageInteraction|disable page interaction|block.*interaction/i, evidence: "page interaction blocking evidence was detected." }
  ];
  return consentSignalFromSpecs(sourceFiles, specs, "script", "signal");
}

function consentReadinessPrivacySignals(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["privacySignals"] {
  const specs: Array<{ signal: ConsentReadinessReport["privacySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "privacy-policy", pattern: /privacy policy|privacyPolicy|privacy[-_ ]url|policy link/i, evidence: "privacy policy evidence was detected." },
    { signal: "withdraw", pattern: /withdraw|revoke|change consent|reset consent/i, evidence: "withdraw/revoke evidence was detected." },
    { signal: "opt-out", pattern: /opt.?out|do not sell|unsubscribe|reject/i, evidence: "opt-out evidence was detected." },
    { signal: "consent-mode", pattern: /consentMode|consent mode|ad_storage|analytics_storage/i, evidence: "consent mode evidence was detected." },
    { signal: "gpc", pattern: /\bGPC\b|global privacy control|navigator\.globalPrivacyControl/i, evidence: "Global Privacy Control evidence was detected." },
    { signal: "do-not-track", pattern: /do not track|\bDNT\b|navigator\.doNotTrack/i, evidence: "Do Not Track evidence was detected." },
    { signal: "legitimate-interest", pattern: /legitimate interest|legitimateInterests|purposeLegitimateInterests|vendorLegitimateInterests/i, evidence: "legitimate interest evidence was detected." },
    { signal: "proof", pattern: /proof|audit|consent log|consent record|timestamp|lastConsent/i, evidence: "consent proof/audit evidence was detected." }
  ];
  return consentSignalFromSpecs(sourceFiles, specs, "privacy", "signal");
}

function consentReadinessTcfSignals(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["tcfSignals"] {
  const specs: Array<{ signal: ConsentReadinessReport["tcfSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "__tcfapi", pattern: /__tcfapi/i, evidence: "IAB TCF API evidence was detected." },
    { signal: "tc-string", pattern: /TCString|tcString|getTCData/i, evidence: "TC string evidence was detected." },
    { signal: "cmp-id", pattern: /cmpId|cmpVersion|cmpStatus|eventStatus/i, evidence: "CMP identity/status evidence was detected." },
    { signal: "vendor-list", pattern: /vendorList|vendor list|vendorListVersion/i, evidence: "vendor list evidence was detected." },
    { signal: "purpose-consents", pattern: /purposeConsents|purpose consent|purposeConsent/i, evidence: "purpose consent evidence was detected." },
    { signal: "vendor-consents", pattern: /vendorConsents|vendor consent|vendorConsent/i, evidence: "vendor consent evidence was detected." },
    { signal: "legitimate-interests", pattern: /legitimateInterests|purposeLegitimateInterests|vendorLegitimateInterests/i, evidence: "legitimate interests evidence was detected." },
    { signal: "gvl", pattern: /\bGVL\b|GlobalVendorList|global vendor list/i, evidence: "Global Vendor List evidence was detected." }
  ];
  return consentSignalFromSpecs(sourceFiles, specs, "TCF", "signal");
}

function consentReadinessPackageSignals(sourceFiles: ConsentSourceFile[]): ConsentReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ConsentReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vanilla-cookieconsent", pattern: /"vanilla-cookieconsent"|vanilla-cookieconsent|CookieConsent/i, evidence: "vanilla-cookieconsent package or API evidence was detected." },
    { signal: "klaro", pattern: /"klaro"|klaro|ConsentManager/i, evidence: "Klaro package or API evidence was detected." },
    { signal: "@iabtcf/core", pattern: /"@iabtcf\/core"|@iabtcf\/core|TCString/i, evidence: "IAB TCF core package or API evidence was detected." },
    { signal: "@iabtcf/cmpapi", pattern: /"@iabtcf\/cmpapi"|@iabtcf\/cmpapi|CmpApi/i, evidence: "IAB TCF CMP API package evidence was detected." },
    { signal: "@iabtcf/stub", pattern: /"@iabtcf\/stub"|@iabtcf\/stub/i, evidence: "IAB TCF stub package evidence was detected." },
    { signal: "custom", pattern: /consent|cookie|privacy|CMP|data-src|text\/plain/i, evidence: "custom consent implementation evidence was detected." }
  ];
  return consentSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function consentSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ConsentSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/consent-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildPrivacyReadinessReport(walk: WalkResult): Promise<PrivacyReadinessReport> {
  const sourceFiles = await privacyReadinessSourceFiles(walk);
  const privacySetups = privacyReadinessSetups(sourceFiles);
  const piiDetectionSignals = privacyReadinessPiiDetectionSignals(sourceFiles);
  const redactionSignals = privacyReadinessRedactionSignals(sourceFiles);
  const policySignals = privacyReadinessPolicySignals(sourceFiles);
  const differentialPrivacySignals = privacyReadinessDifferentialPrivacySignals(sourceFiles);
  const configSignals = privacyReadinessConfigSignals(sourceFiles);
  const ciSignals = privacyReadinessCiSignals(sourceFiles);
  const packageSignals = privacyReadinessPackageSignals(sourceFiles);

  const hasPiiDetection = piiDetectionSignals.some((item) => item.readiness === "ready") || privacySetups.some((item) => item.detectorCount > 0);
  const hasRedaction = redactionSignals.some((item) => item.readiness === "ready") || privacySetups.some((item) => item.anonymizerCount > 0);
  const hasPolicy = policySignals.some((item) => ["privacy-policy", "data-minimization", "data-classification"].includes(item.signal) && item.readiness === "ready") || privacySetups.some((item) => item.policyCount > 0);
  const hasRetention = policySignals.some((item) => ["retention-policy", "deletion-policy"].includes(item.signal) && item.readiness === "ready") || privacySetups.some((item) => item.retentionCount > 0);
  const hasDsar = policySignals.some((item) => item.signal === "dsar-export-delete" && item.readiness === "ready") || privacySetups.some((item) => item.dsarCount > 0);
  const hasConsentPurpose = policySignals.some((item) => item.signal === "consent-purpose" && item.readiness === "ready") || privacySetups.some((item) => item.consentCount > 0);
  const hasDp = differentialPrivacySignals.some((item) => item.readiness === "ready") || privacySetups.some((item) => item.differentialPrivacyCount > 0);
  const hasDpBudget = differentialPrivacySignals.some((item) => ["privacy-map", "epsilon-delta", "privacy-budget", "clamp-bounds"].includes(item.signal) && item.readiness === "ready");
  const hasConfig = configSignals.some((item) => item.readiness === "ready");
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || privacySetups.some((item) => item.ciCount > 0);

  const riskQueue: PrivacyReadinessReport["riskQueue"] = [];
  if (!hasPiiDetection) {
    riskQueue.push({
      priority: "high",
      action: "Add or document PII detector coverage before claiming privacy readiness.",
      why: "Privacy work needs traceable entity detection, such as Presidio recognizers, scrubadub detectors, or a custom PII scanner.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if (hasPiiDetection && !hasRedaction) {
    riskQueue.push({
      priority: "high",
      action: "Pair PII detection with redaction, masking, replacement, encryption, or tokenization evidence.",
      why: "Detection alone only finds sensitive data; learners also need to see how the repository transforms or protects it.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if ((hasPiiDetection || hasRedaction) && !hasPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Add privacy policy, data classification, and data minimization docs near the implementation.",
      why: "Privacy controls need a declared purpose and data handling boundary, not just code-level redaction helpers.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if (hasPolicy && !hasRetention) {
    riskQueue.push({
      priority: "medium",
      action: "Document retention and deletion rules for captured PII.",
      why: "A policy without retention or deletion behavior leaves sensitive data lifetime ambiguous.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if (hasPolicy && !hasDsar) {
    riskQueue.push({
      priority: "medium",
      action: "Trace DSAR export/delete or account deletion flows.",
      why: "Privacy readiness should show how a user can access, export, correct, or delete personal data.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if (hasPolicy && !hasConsentPurpose) {
    riskQueue.push({
      priority: "low",
      action: "Link collection points to consent, purpose, or lawful-basis language.",
      why: "Purpose mapping helps learners connect implementation details to privacy policy commitments.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if (hasDp && !hasDpBudget) {
    riskQueue.push({
      priority: "high",
      action: "Complete differential privacy budget, bounds, and privacy_map evidence.",
      why: "OpenDP-style privacy claims need epsilon/delta, bounds, transformations, and privacy loss accounting.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if ((hasPiiDetection || hasRedaction || hasPolicy) && !hasConfig) {
    riskQueue.push({
      priority: "low",
      action: "Record allow-list, deny-list, threshold, locale, NLP, or field-map configuration.",
      why: "Configuration explains false positive handling and where privacy controls attach to product data.",
      relatedHref: "html/privacy-readiness.html"
    });
  }
  if ((hasPiiDetection || hasRedaction || hasPolicy) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Add a CI privacy scan or PII redaction fixture test.",
      why: "Privacy regressions are easier to catch when fixtures and scanner commands run continuously.",
      relatedHref: "html/privacy-readiness.html"
    });
  }

  return {
    summary: `Privacy readiness report: privacy setup ${privacySetups.length}개, PII detection signal ${piiDetectionSignals.length}개, redaction signal ${redactionSignals.length}개, policy signal ${policySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Privacy readiness Presidio OpenDP scrubadub PII analyzer anonymizer recognizer detector redaction masking encryption allow-list deny-list privacy budget epsilon delta retention deletion consent DSAR CI",
    privacySetups,
    piiDetectionSignals,
    redactionSignals,
    policySignals,
    differentialPrivacySignals,
    configSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"AnalyzerEngine|AnonymizerEngine|RecognizerResult|PatternRecognizer|Scrubber|Detector|PII|redact|mask|privacy|retention|delete|DSAR|epsilon|delta\" .", purpose: "Find Presidio, scrubadub, OpenDP, PII, redaction, policy, retention, DSAR, and privacy budget evidence." },
      { command: "python -m pytest -q tests -k \"privacy or pii or redaction\"", purpose: "Run privacy, PII, or redaction fixture tests when the target repository is Python-based." },
      { command: "presidio-analyzer --help", purpose: "Check whether Presidio Analyzer CLI usage is documented or installed." },
      { command: "presidio-anonymizer --help", purpose: "Check whether Presidio Anonymizer CLI usage is documented or installed." },
      { command: "rg \"allow_list|deny_list|score_threshold|OperatorConfig|epsilon|delta|privacy budget\" .", purpose: "Trace thresholds, allow/deny lists, anonymizer operator defaults, and differential privacy budget controls." }
    ],
    learnerNextSteps: [
      "먼저 AnalyzerEngine, PatternRecognizer, Scrubber, Detector 같은 PII detection 진입점을 찾으세요.",
      "AnonymizerEngine, OperatorConfig, mask, redact, encrypt, surrogate, tokenization으로 탐지 결과가 어떻게 보호되는지 확인하세요.",
      "privacy policy, data minimization, retention, deletion, DSAR export/delete 문서가 구현과 연결되는지 추적하세요.",
      "OpenDP나 differential privacy 신호가 있으면 epsilon, delta, privacy_map, clamp/bounds, noise 메커니즘을 함께 확인하세요.",
      "privacy scan 또는 redaction fixture가 CI에서 실행되는지 마지막에 확인하세요."
    ]
  };
}

type PrivacySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function privacyReadinessSourceFiles(walk: WalkResult): Promise<PrivacySourceFile[]> {
  const rows: PrivacySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!privacyInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!privacyPathSignal(file.relPath) && !privacyContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 220);
}

function privacyInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|privacy\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|pii\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|redaction\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|retention\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|dsar\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py))$/i.test(base)
    || /(^|\/)(privacy|pii|redact|redaction|anonymi[sz]e|presidio|opendp|scrubadub|gdpr|ccpa|retention|deletion|dsar|data-subject|data_subject|personal-data|personal_data)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|html|vue|svelte|go|rs|py|rb|php|java|kt|cs)$/i.test(filePath);
}

function privacyPathSignal(filePath: string): boolean {
  return /(^|\/)(privacy|pii|redact|redaction|anonymi[sz]e|presidio|opendp|scrubadub|gdpr|ccpa|retention|deletion|dsar|data-subject|data_subject|personal-data|personal_data)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|pyproject\.toml|requirements\.txt|privacy\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|pii\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|redaction\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|retention\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py)|dsar\.(json|ya?ml|md|ts|tsx|js|mjs|cjs|py))$/i.test(path.basename(filePath));
}

function privacyContentSignal(text: string): boolean {
  return /AnalyzerEngine|AnonymizerEngine|RecognizerResult|PatternRecognizer|OperatorConfig|Scrubber|scrubadub|Filth|Detector|OpenDP|privacy_map|epsilon|delta|make_laplace|make_gaussian|differential privacy|PII|personal data|privacy policy|data minimization|retention policy|deletion policy|DSAR|data subject|allow_list|deny_list|score_threshold|redact|mask|anonymi[sz]e|tokeni[sz]e/i.test(text);
}

function privacyReadinessSetups(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["privacySetups"] {
  const rows: PrivacyReadinessReport["privacySetups"] = [];
  for (const source of sourceFiles) {
    const detectorCount = countMatches(source.text, /\b(AnalyzerEngine|RecognizerResult|PatternRecognizer|BatchAnalyzerEngine|Scrubber|Detector|Filth|PII detector|entity recognizer|email detector|phone detector|name detector|address detector)\b/gi);
    const anonymizerCount = countMatches(source.text, /\b(AnonymizerEngine|DeanonymizeEngine|OperatorConfig|anonymi[sz]e|redact|mask|replace|encrypt|decrypt|surrogate|tokeni[sz]e|hash)\b/gi);
    const policyCount = countMatches(source.text, /\b(privacy policy|privacy notice|data classification|data minimization|minimi[sz]ation|purpose limitation|lawful basis|GDPR|CCPA|personal data)\b/gi);
    const retentionCount = countMatches(source.text, /\b(retention|retention policy|delete|deletion|purge|erase|erasure|expire|ttl|time.?to.?live)\b/gi);
    const consentCount = countMatches(source.text, /\b(consent|purpose|preferences?|opt.?in|opt.?out|withdraw|lawful basis|processing purpose)\b/gi);
    const dsarCount = countMatches(source.text, /\b(DSAR|data subject access|subject access|right to access|right to deletion|right to erasure|export data|data export|delete account)\b/gi);
    const differentialPrivacyCount = countMatches(source.text, /\b(OpenDP|Measurement|Transformation|privacy_map|privacy loss|privacy budget|epsilon|delta|make_laplace|make_gaussian|laplace|gaussian|clamp|bounds|noise|differential privacy)\b/gi);
    const ciCount = countMatches(source.text, /\b(github actions|\.github\/workflows|privacy scan|PII scan|redaction test|pytest|upload-artifact|policy check)\b/gi);
    const totalSignals = detectorCount + anonymizerCount + policyCount + retentionCount + consentCount + dsarCount + differentialPrivacyCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: privacyReadinessTool(source),
      detectorCount,
      anonymizerCount,
      policyCount,
      retentionCount,
      consentCount,
      dsarCount,
      differentialPrivacyCount,
      ciCount,
      readiness: detectorCount > 0 && anonymizerCount > 0 && (policyCount + retentionCount + dsarCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} privacy readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.detectorCount + b.anonymizerCount + b.policyCount + b.retentionCount + b.dsarCount + b.differentialPrivacyCount + b.ciCount) - (a.detectorCount + a.anonymizerCount + a.policyCount + a.retentionCount + a.dsarCount + a.differentialPrivacyCount + a.ciCount))
    .slice(0, 55);
}

function privacyReadinessTool(source: PrivacySourceFile): PrivacyReadinessReport["privacySetups"][number]["tool"] {
  if (/presidio/i.test(source.filePath) || /AnalyzerEngine|AnonymizerEngine|RecognizerResult|PatternRecognizer|OperatorConfig|presidio/i.test(source.text)) return "presidio";
  if (/opendp/i.test(source.filePath) || /OpenDP|privacy_map|Measurement|Transformation|make_laplace|make_gaussian|epsilon|delta/i.test(source.text)) return "opendp";
  if (/scrubadub/i.test(source.filePath) || /scrubadub|Scrubber|Filth|PostProcessor/i.test(source.text)) return "scrubadub";
  if (/gdpr/i.test(source.filePath) || /\bGDPR\b|data subject|DSAR|right to erasure/i.test(source.text)) return "gdpr";
  if (/ccpa/i.test(source.filePath) || /\bCCPA\b|do not sell|consumer privacy/i.test(source.text)) return "ccpa";
  if (/pii|redact|anonymi[sz]e|personal.?data|privacy/i.test(source.filePath) || /PII|redact|anonymi[sz]e|personal data|privacy/i.test(source.text)) return "pii-scanner";
  if (/retention|deletion|consent/i.test(source.filePath) || /retention|deletion|consent/i.test(source.text)) return "custom";
  return "unknown";
}

function privacyReadinessPiiDetectionSignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["piiDetectionSignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["piiDetectionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "presidio-analyzer", pattern: /AnalyzerEngine|AnalyzerEngineProvider|BatchAnalyzerEngine|presidio-analyzer/i, evidence: "Presidio analyzer evidence was detected." },
    { signal: "pattern-recognizer", pattern: /PatternRecognizer|RegexRecognizer|deny_list|deny list/i, evidence: "custom pattern recognizer or deny-list evidence was detected." },
    { signal: "recognizer-result", pattern: /RecognizerResult|entity_type|start\s*=|end\s*=|score/i, evidence: "recognizer result/entity score evidence was detected." },
    { signal: "scrubadub-detector", pattern: /scrubadub|Scrubber|Detector|EmailDetector|PhoneDetector|NameDetector|Filth/i, evidence: "scrubadub detector evidence was detected." },
    { signal: "email-phone-name-address", pattern: /email|phone|name|address|credit card|ssn|passport|PERSON|LOCATION/i, evidence: "common personal-data entity evidence was detected." },
    { signal: "score-threshold", pattern: /score_threshold|score threshold|min_score|confidence|threshold/i, evidence: "PII confidence threshold evidence was detected." },
    { signal: "custom-entity", pattern: /custom entity|custom recognizer|entity recognizer|supported_entities|entities/i, evidence: "custom entity detection evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "PII detection", "signal");
}

function privacyReadinessRedactionSignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["redactionSignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["redactionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "anonymizer-engine", pattern: /AnonymizerEngine|DeanonymizeEngine|presidio-anonymizer/i, evidence: "Presidio anonymizer evidence was detected." },
    { signal: "operator-config", pattern: /OperatorConfig|operators|operator_name|default_anonymizers|default operators/i, evidence: "anonymizer operator configuration evidence was detected." },
    { signal: "replace-mask-redact", pattern: /replace|mask|redact|redaction|\[REDACTED\]|<redacted>/i, evidence: "replace/mask/redact transform evidence was detected." },
    { signal: "encrypt-decrypt", pattern: /encrypt|decrypt|crypto|kms|fernet|cipher/i, evidence: "encryption or decryption evidence was detected." },
    { signal: "surrogate-token", pattern: /surrogate|tokeni[sz]e|pseudonym|pseudonymi[sz]e/i, evidence: "surrogate/tokenization evidence was detected." },
    { signal: "scrubadub-post-processor", pattern: /PostProcessor|post_processor|clean|replace_with|Scrubber/i, evidence: "scrubadub post-processing evidence was detected." },
    { signal: "hash-tokenize", pattern: /\bhash\b|sha256|digest|hmac|token vault|token map/i, evidence: "hash/token map evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "redaction", "signal");
}

function privacyReadinessPolicySignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["policySignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "privacy-policy", pattern: /privacy policy|privacy notice|privacy statement|privacy[-_ ]policy/i, evidence: "privacy policy evidence was detected." },
    { signal: "data-classification", pattern: /data classification|classification label|sensitive data|personal data|confidential/i, evidence: "data classification evidence was detected." },
    { signal: "data-minimization", pattern: /data minimization|minimi[sz]e data|purpose limitation|collect only|least data/i, evidence: "data minimization evidence was detected." },
    { signal: "retention-policy", pattern: /retention policy|retention period|retain for|ttl|expire|purge after/i, evidence: "retention policy evidence was detected." },
    { signal: "deletion-policy", pattern: /deletion policy|delete account|right to erasure|erase|purge|hard delete|soft delete/i, evidence: "deletion/erasure policy evidence was detected." },
    { signal: "dsar-export-delete", pattern: /DSAR|data subject access|subject access request|export data|data export|right to access|right to deletion/i, evidence: "DSAR export/delete evidence was detected." },
    { signal: "consent-purpose", pattern: /consent|processing purpose|lawful basis|purpose|opt.?in|opt.?out|withdraw/i, evidence: "consent or purpose mapping evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function privacyReadinessDifferentialPrivacySignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["differentialPrivacySignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["differentialPrivacySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "opendp-measurement", pattern: /OpenDP|Measurement|make_private|differential privacy/i, evidence: "OpenDP measurement evidence was detected." },
    { signal: "privacy-map", pattern: /privacy_map|map privacy|privacy loss/i, evidence: "privacy map/loss evidence was detected." },
    { signal: "epsilon-delta", pattern: /epsilon|delta|eps/i, evidence: "epsilon/delta evidence was detected." },
    { signal: "laplace-gaussian-noise", pattern: /make_laplace|make_gaussian|laplace|gaussian|noise/i, evidence: "Laplace/Gaussian noise evidence was detected." },
    { signal: "clamp-bounds", pattern: /clamp|bounds|bounded|lower_bound|upper_bound|domain/i, evidence: "clamp/bounds evidence was detected." },
    { signal: "privacy-budget", pattern: /privacy budget|budget accounting|composition|privacy unit|privacy profile/i, evidence: "privacy budget evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "differential privacy", "signal");
}

function privacyReadinessConfigSignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["configSignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "allow-list", pattern: /allow_list|allow list|allowlist|whitelist/i, evidence: "allow-list evidence was detected." },
    { signal: "deny-list", pattern: /deny_list|deny list|denylist|blacklist/i, evidence: "deny-list evidence was detected." },
    { signal: "score-threshold", pattern: /score_threshold|score threshold|min_score|threshold|confidence/i, evidence: "score threshold evidence was detected." },
    { signal: "locale", pattern: /locale|locales|language|languages|supported_language/i, evidence: "locale/language evidence was detected." },
    { signal: "nlp-engine", pattern: /nlp_engine|NlpEngine|spacy|stanza|transformers/i, evidence: "NLP engine evidence was detected." },
    { signal: "operator-defaults", pattern: /OperatorConfig|default_anonymizers|default operators|operators|masking chars|new_value/i, evidence: "operator default evidence was detected." },
    { signal: "database-field-map", pattern: /field map|column map|pii_fields|personal_data_fields|database fields|schema mapping/i, evidence: "database field mapping evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "configuration", "signal");
}

function privacyReadinessCiSignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["ciSignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "privacy-scan-command", pattern: /privacy scan|pii scan|presidio-analyzer|presidio-anonymizer|scrubadub|opendp|rg .*PII/i, evidence: "privacy scan command evidence was detected." },
    { signal: "pii-test-fixture", pattern: /pytest.*privacy|pytest.*pii|vitest.*privacy|PII fixture|redaction fixture|tests?.*redaction/i, evidence: "PII/redaction fixture evidence was detected." },
    { signal: "redaction-artifact", pattern: /upload-artifact|redaction report|privacy report|pii report|sarif/i, evidence: "redaction/privacy artifact evidence was detected." },
    { signal: "policy-check", pattern: /policy check|privacy policy check|retention check|dsar check|gdpr check|ccpa check/i, evidence: "privacy policy check evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function privacyReadinessPackageSignals(sourceFiles: PrivacySourceFile[]): PrivacyReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PrivacyReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "presidio", pattern: /"presidio"|presidio-analyzer|presidio-anonymizer|AnalyzerEngine|AnonymizerEngine/i, evidence: "Presidio package/API evidence was detected." },
    { signal: "opendp", pattern: /"opendp"|opendp|OpenDP|privacy_map|make_laplace/i, evidence: "OpenDP package/API evidence was detected." },
    { signal: "scrubadub", pattern: /"scrubadub"|scrubadub|Scrubber|Filth/i, evidence: "scrubadub package/API evidence was detected." },
    { signal: "faker", pattern: /"faker"|"@faker-js\/faker"|Faker|fake\.|faker\./i, evidence: "Faker/synthetic data package evidence was detected." },
    { signal: "zod", pattern: /"zod"|from ["']zod["']|z\.object/i, evidence: "Zod schema evidence was detected." },
    { signal: "yup", pattern: /"yup"|from ["']yup["']|yup\.object/i, evidence: "Yup schema evidence was detected." },
    { signal: "pydantic", pattern: /pydantic|BaseModel|Field\(/i, evidence: "Pydantic schema evidence was detected." },
    { signal: "gdpr", pattern: /\bGDPR\b|gdpr|data subject|right to erasure/i, evidence: "GDPR package/text evidence was detected." }
  ];
  return privacySignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function privacySignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PrivacySourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/privacy-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}
