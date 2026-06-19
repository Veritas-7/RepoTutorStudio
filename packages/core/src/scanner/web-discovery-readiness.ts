import type { BrowserCompatibilityReadinessReport, BrowserExtensionReadinessReport, LinkIntegrityReadinessReport, PwaReadinessReport, SeoMetadataReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildLinkIntegrityReadinessReport(walk: WalkResult): Promise<LinkIntegrityReadinessReport> {
  const sourceFiles = await linkIntegrityReadinessSourceFiles(walk);
  const linkSetups = linkIntegrityReadinessSetups(sourceFiles);
  const targetSignals = linkIntegrityReadinessTargetSignals(sourceFiles);
  const policySignals = linkIntegrityReadinessPolicySignals(sourceFiles);
  const networkSignals = linkIntegrityReadinessNetworkSignals(sourceFiles);
  const outputSignals = linkIntegrityReadinessOutputSignals(sourceFiles);
  const ciSignals = linkIntegrityReadinessCiSignals(sourceFiles);
  const packageSignals = linkIntegrityReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasLycheePackage = packageSignals.some((item) => item.signal === "lychee" && item.readiness === "ready");
  const hasSetup = linkSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = linkSetups.some((item) => item.readiness === "ready");
  const hasTargets = targetSignals.some((item) => item.readiness === "ready") || linkSetups.some((item) => item.targetCount > 0);
  const hasPolicy = policySignals.some((item) => item.readiness === "ready") || linkSetups.some((item) => item.policyCount > 0);
  const hasNetwork = networkSignals.some((item) => item.readiness === "ready") || linkSetups.some((item) => item.networkCount > 0);
  const hasOutput = outputSignals.some((item) => item.readiness === "ready") || linkSetups.some((item) => item.outputCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || linkSetups.some((item) => item.ciCount > 0);

  const riskQueue: LinkIntegrityReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document a link integrity checker before claiming documentation/site link readiness.",
      why: "Link integrity readiness starts with explicit checker config, target file types, policy, network, output, or CI evidence.",
      relatedHref: "html/link-integrity-readiness.html"
    });
  }
  if (hasLycheePackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair lychee package/action evidence with concrete targets, accepted statuses, excludes, network limits, and report output.",
      why: "A link checker package alone does not prove broken-link checks run on the right files with stable policy.",
      relatedHref: "html/link-integrity-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasTargets) {
    riskQueue.push({
      priority: "high",
      action: "Declare Markdown, HTML, website, sitemap, mail, or reStructuredText link-check targets.",
      why: "Link checks must name the content surfaces they cover before their results can be trusted.",
      relatedHref: "html/link-integrity-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasPolicy) {
    riskQueue.push({
      priority: "medium",
      action: "Add accept status, include/exclude, scheme, private-network, and fragment policy.",
      why: "Without policy, link checking tends to oscillate on redirects, rate limits, private URLs, and generated anchors.",
      relatedHref: "html/link-integrity-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasNetwork) {
    riskQueue.push({
      priority: "medium",
      action: "Review timeout, retry, user-agent, headers, GitHub token, and offline mode settings.",
      why: "External link checks need bounded network behavior and authentication/rate-limit controls.",
      relatedHref: "html/link-integrity-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && (!hasOutput || !hasCi)) {
    riskQueue.push({
      priority: "low",
      action: "Add machine-readable output and CI wiring for repeatable broken-link review.",
      why: "Learners and maintainers need durable JSON/Markdown/JUnit output, cache behavior, and CI scripts/actions.",
      relatedHref: "html/link-integrity-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real link checks only in a trusted workspace with explicit network policy.",
    why: "RepoTutor records link integrity readiness only; it does not crawl websites, open URLs, send mail checks, use credentials, contact external hosts, mutate reports, or run the analyzed project's tests.",
    relatedHref: "html/link-integrity-readiness.html"
  });

  return {
    summary: `Lychee-style link integrity readiness report: setup ${linkSetups.length}개, target signal ${targetSignals.length}개, policy signal ${policySignals.length}개, network signal ${networkSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Lychee link checker markdown html reStructuredText website mail sitemap accept status exclude include scheme timeout retry headers github-token offline output cache",
    linkSetups,
    targetSignals,
    policySignals,
    networkSignals,
    outputSignals,
    ciSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"lychee|markdown-link-check|broken-link-checker|linkinator|html-proofer\" .github package.json pnpm-lock.yaml docs", purpose: "Inventory link checker providers and scripts." },
      { command: "rg \"markdown|html|reStructuredText|sitemap|include_mail|wikilinks|README|docs\" .github docs . lychee*.toml", purpose: "Review link-check target surfaces." },
      { command: "rg \"accept|exclude|include|scheme|include_fragments|exclude_private|exclude_loopback|exclude_all_private\" .github docs . lychee*.toml", purpose: "Check status, include/exclude, scheme, private network, and fragment policy." },
      { command: "rg \"timeout|retry|user-agent|headers|github-token|offline|accept_timeouts\" .github docs . lychee*.toml", purpose: "Check network limits, auth, headers, and offline behavior." },
      { command: "rg \"output|format|json|markdown|junit|cache|dump|summary\" .github docs . lychee*.toml", purpose: "Confirm durable output, cache, and reporting behavior." },
      { command: "npx vitest run", purpose: "Run local tests that cover generated link lists, HTML anchors, and docs navigation." }
    ],
    learnerNextSteps: [
      "먼저 lychee, markdown-link-check, broken-link-checker, linkinator, html-proofer 설정과 package/CI script를 찾으세요.",
      "Markdown, HTML, website, sitemap, mail, reStructuredText target 신호로 어떤 문서 표면이 검사되는지 확인하세요.",
      "accept, exclude, include, scheme, private-network, fragments 신호로 false positive와 private URL 정책을 확인하세요.",
      "timeout, retry, user-agent, headers, github-token, offline 신호로 외부 네트워크 경계를 확인하세요.",
      "JSON, Markdown report, JUnit, summary, dump, cache 신호로 결과가 사람이 읽고 자동화가 재사용할 수 있는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 웹 크롤링, URL 접속, mail check, credential 사용, 네트워크 테스트는 안전한 환경에서 별도로 실행하세요."
    ]
  };
}

type LinkIntegrityReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function linkIntegrityReadinessSourceFiles(walk: WalkResult): Promise<LinkIntegrityReadinessSourceFile[]> {
  const files: LinkIntegrityReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !linkIntegrityReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!linkIntegrityReadinessPathSignal(file.relPath) && !linkIntegrityReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function linkIntegrityReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return linkIntegrityReadinessPathSignal(filePath)
    || /^(lychee\.(toml|json|ya?ml)|\.lycheeignore|markdown-link-check\.(json|js)|linkinator\.(json|js)|package\.json|README\.md)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|md|mdx|html?|rst|ya?ml|toml)$/i.test(filePath);
}

function linkIntegrityReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(lychee|link-check|linkcheck|links|markdown-link-check|broken-link|linkinator|html-proofer|docs|website|site)(\/|\.|-|_|$)/i.test(filePath);
}

function linkIntegrityReadinessContentSignal(text: string): boolean {
  return /(lychee|markdown-link-check|broken-link-checker|linkinator|html-proofer|accept\s*=|exclude\s*=|include_fragments|include_mail|github-token|user-agent|timeout|retry|offline|sitemap|href=|https?:\/\/|mailto:)/i.test(text);
}

function linkIntegrityReadinessSetups(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["linkSetups"] {
  const rows: LinkIntegrityReadinessReport["linkSetups"] = [];
  for (const source of sourceFiles) {
    const targetCount = countMatches(source.text, /markdown|\.md\b|html|\.html?\b|reStructuredText|\.rst\b|website|sitemap|mailto|include_mail|wikilinks|README|docs/gi);
    const extractionCount = countMatches(source.text, /href=|https?:\/\/|mailto:|extract|fragment|anchor|include_fragments|fallback_extensions|index_files/gi);
    const policyCount = countMatches(source.text, /accept|exclude|include|scheme|exclude_private|exclude_link_local|exclude_loopback|exclude_all_private|include_fragments/gi);
    const networkCount = countMatches(source.text, /timeout|retry|retry_wait_time|user-agent|headers?|github-token|offline|accept_timeouts|method|basic-auth/gi);
    const outputCount = countMatches(source.text, /output|format|json|markdown|junit|summary|cache|dump|report/gi);
    const ciCount = countMatches(source.text, /github action|lychee-action|\.github\/workflows|docker|nix|pre-commit|package script|npm run|pnpm/gi);
    const hasSetupSignal = targetCount + extractionCount + policyCount + networkCount + outputCount + ciCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: linkIntegrityReadinessProvider(source),
      targetCount,
      extractionCount,
      policyCount,
      networkCount,
      outputCount,
      ciCount,
      readiness: targetCount > 0 && policyCount > 0 && networkCount > 0 && outputCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains target ${targetCount}, extraction ${extractionCount}, policy ${policyCount}, network ${networkCount}, output ${outputCount}, CI ${ciCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function linkIntegrityReadinessProvider(source: LinkIntegrityReadinessSourceFile): LinkIntegrityReadinessReport["linkSetups"][number]["provider"] {
  if (/lychee|lychee-action/i.test(source.text)) return "lychee";
  if (/markdown-link-check/i.test(source.text)) return "markdown-link-check";
  if (/broken-link-checker|blc\b/i.test(source.text)) return "broken-link-checker";
  if (/linkinator/i.test(source.text)) return "linkinator";
  if (/html-proofer/i.test(source.text)) return "html-proofer";
  if (/link|href|url/i.test(source.text)) return "custom";
  return "unknown";
}

function linkIntegrityReadinessTargetSignals(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["targetSignals"] {
  const specs: Array<{ signal: LinkIntegrityReadinessReport["targetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "markdown", pattern: /markdown|\.md\b|README\.md/i, evidence: "Markdown target evidence was detected." },
    { signal: "html", pattern: /html|\.html?\b|href=/i, evidence: "HTML target evidence was detected." },
    { signal: "restructuredtext", pattern: /reStructuredText|\.rst\b/i, evidence: "reStructuredText target evidence was detected." },
    { signal: "website", pattern: /website|https?:\/\/|crawl|site\b/i, evidence: "website target evidence was detected." },
    { signal: "mail", pattern: /mailto:|include_mail|mail address|email/i, evidence: "mail link evidence was detected." },
    { signal: "sitemap", pattern: /sitemap|sitemap\.xml/i, evidence: "sitemap target evidence was detected." }
  ];
  return linkIntegrityReadinessSignalFromSpecs(sourceFiles, specs, "target", "signal");
}

function linkIntegrityReadinessPolicySignals(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["policySignals"] {
  const specs: Array<{ signal: LinkIntegrityReadinessReport["policySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "accept-status", pattern: /accept\s*=|--accept|accepted status|status code/i, evidence: "accepted status policy evidence was detected." },
    { signal: "exclude", pattern: /exclude\s*=|exclude_path|--exclude|\.lycheeignore/i, evidence: "exclude policy evidence was detected." },
    { signal: "include", pattern: /include\s*=|--include|include_verbatim|include_mail|include_wikilinks/i, evidence: "include policy evidence was detected." },
    { signal: "scheme", pattern: /scheme\s*=|--scheme|http, https, file, and mailto|mailto/i, evidence: "scheme policy evidence was detected." },
    { signal: "private-network", pattern: /exclude_private|exclude_link_local|exclude_loopback|exclude_all_private|private/i, evidence: "private network policy evidence was detected." },
    { signal: "fragments", pattern: /include_fragments|fragments?|anchor/i, evidence: "fragment policy evidence was detected." }
  ];
  return linkIntegrityReadinessSignalFromSpecs(sourceFiles, specs, "policy", "signal");
}

function linkIntegrityReadinessNetworkSignals(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["networkSignals"] {
  const specs: Array<{ signal: LinkIntegrityReadinessReport["networkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "timeout", pattern: /timeout|--timeout/i, evidence: "timeout evidence was detected." },
    { signal: "retry", pattern: /retry|retry_wait_time|--max-retries/i, evidence: "retry evidence was detected." },
    { signal: "user-agent", pattern: /user-agent|user_agent|--user-agent/i, evidence: "user-agent evidence was detected." },
    { signal: "headers", pattern: /headers?\s*=|--header|custom headers/i, evidence: "headers evidence was detected." },
    { signal: "github-token", pattern: /github-token|GITHUB_TOKEN|github_token/i, evidence: "GitHub token evidence was detected." },
    { signal: "offline", pattern: /offline|accept_timeouts|--offline/i, evidence: "offline/timeout acceptance evidence was detected." }
  ];
  return linkIntegrityReadinessSignalFromSpecs(sourceFiles, specs, "network", "signal");
}

function linkIntegrityReadinessOutputSignals(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["outputSignals"] {
  const specs: Array<{ signal: LinkIntegrityReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "json", pattern: /json output|--format json|format\s*=\s*['"]?json|\.json/i, evidence: "JSON output evidence was detected." },
    { signal: "markdown-report", pattern: /markdown report|\.md\b|report\.md|summary output/i, evidence: "Markdown report evidence was detected." },
    { signal: "junit", pattern: /junit|junit\.xml/i, evidence: "JUnit output evidence was detected." },
    { signal: "summary", pattern: /summary|summar(y|ies)/i, evidence: "summary evidence was detected." },
    { signal: "dump", pattern: /dump|dump_inputs|--dump/i, evidence: "dump output evidence was detected." },
    { signal: "cache", pattern: /cache|cache_exclude_status|--cache/i, evidence: "cache evidence was detected." }
  ];
  return linkIntegrityReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function linkIntegrityReadinessCiSignals(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["ciSignals"] {
  const specs: Array<{ signal: LinkIntegrityReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-action", pattern: /lychee-action|github action|\.github\/workflows|Check Links/i, evidence: "GitHub Action evidence was detected." },
    { signal: "docker", pattern: /docker|lycheeverse\/lychee/i, evidence: "Docker execution evidence was detected." },
    { signal: "nix", pattern: /nix|testers\.lycheeLinkCheck/i, evidence: "Nix link check evidence was detected." },
    { signal: "precommit", pattern: /pre-commit|precommit|pre-commit-config/i, evidence: "pre-commit evidence was detected." },
    { signal: "script", pattern: /package\.json|npm run|pnpm|yarn|cargo run|script/i, evidence: "script evidence was detected." }
  ];
  return linkIntegrityReadinessSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function linkIntegrityReadinessPackageSignals(sourceFiles: LinkIntegrityReadinessSourceFile[]): LinkIntegrityReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LinkIntegrityReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "lychee", pattern: /"lychee"|lycheeverse\/lychee|lychee-action|\blychee\b/i, evidence: "lychee package/action evidence was detected." },
    { signal: "markdown-link-check", pattern: /"markdown-link-check"|markdown-link-check/i, evidence: "markdown-link-check evidence was detected." },
    { signal: "broken-link-checker", pattern: /"broken-link-checker"|broken-link-checker|\bblc\b/i, evidence: "broken-link-checker evidence was detected." },
    { signal: "linkinator", pattern: /"linkinator"|linkinator/i, evidence: "linkinator evidence was detected." },
    { signal: "html-proofer", pattern: /"html-proofer"|html-proofer/i, evidence: "html-proofer evidence was detected." },
    { signal: "custom", pattern: /link check|linkcheck|broken link|href=|https?:\/\//i, evidence: "custom link checking evidence was detected." }
  ];
  return linkIntegrityReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function linkIntegrityReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LinkIntegrityReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/link-integrity-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildSeoMetadataReadinessReport(walk: WalkResult): Promise<SeoMetadataReadinessReport> {
  const sourceFiles = await seoMetadataReadinessSourceFiles(walk);
  const seoSetups = seoMetadataReadinessSetups(sourceFiles);
  const crawlSignals = seoMetadataReadinessCrawlSignals(sourceFiles);
  const sitemapSignals = seoMetadataReadinessSitemapSignals(sourceFiles);
  const metadataSignals = seoMetadataReadinessMetadataSignals(sourceFiles);
  const structuredDataSignals = seoMetadataReadinessStructuredDataSignals(sourceFiles);
  const aiReadinessSignals = seoMetadataReadinessAiSignals(sourceFiles);
  const packageSignals = seoMetadataReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = seoSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = seoSetups.some((item) => item.readiness === "ready");
  const hasCrawl = crawlSignals.some((item) => item.readiness === "ready") || seoSetups.some((item) => item.crawlCount > 0);
  const hasSitemap = sitemapSignals.some((item) => item.readiness === "ready") || seoSetups.some((item) => item.sitemapCount > 0);
  const hasMetadata = metadataSignals.some((item) => item.readiness === "ready") || seoSetups.some((item) => item.metadataCount > 0);
  const hasStructuredData = structuredDataSignals.some((item) => item.readiness === "ready") || seoSetups.some((item) => item.structuredDataCount > 0);
  const hasSocial = seoSetups.some((item) => item.socialCount > 0) || metadataSignals.some((item) => ["open-graph", "twitter-card"].includes(item.signal) && item.readiness === "ready");
  const hasAi = aiReadinessSignals.some((item) => item.readiness === "ready") || seoSetups.some((item) => item.aiCount > 0);

  const riskQueue: SeoMetadataReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document SEO metadata readiness before treating a site as publication-ready.",
      why: "SEO/AEO readiness needs crawl control, sitemap, metadata, structured data, social preview, or AI crawler evidence.",
      relatedHref: "html/seo-metadata-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && (!hasCrawl || !hasSitemap)) {
    riskQueue.push({
      priority: "high",
      action: "Pair SEO metadata with robots and sitemap coverage.",
      why: "Search and answer engines need both crawl permissions and discoverable route indexes.",
      relatedHref: "html/seo-metadata-readiness.html"
    });
  }
  if ((hasPackage || hasReadySetup) && !hasMetadata) {
    riskQueue.push({
      priority: "high",
      action: "Add title, description, canonical, Open Graph, Twitter card, and favicon metadata.",
      why: "Metadata is the first surface search results, social previews, and crawler summaries consume.",
      relatedHref: "html/seo-metadata-readiness.html"
    });
  }
  if ((hasPackage || hasReadySetup) && !hasStructuredData) {
    riskQueue.push({
      priority: "medium",
      action: "Add JSON-LD/Schema.org structured data for key page types.",
      why: "Structured data helps crawlers and answer engines identify entities, breadcrumbs, articles, products, and FAQs.",
      relatedHref: "html/seo-metadata-readiness.html"
    });
  }
  if ((hasPackage || hasReadySetup) && (!hasSocial || !hasAi)) {
    riskQueue.push({
      priority: "low",
      action: "Review social preview and AI crawler readability surfaces.",
      why: "OpenGraph images, AI crawler policies, llms.txt, markdown endpoints, and agent-readability checks improve shareability and AEO coverage.",
      relatedHref: "html/seo-metadata-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real SEO validation only in a trusted deployed or preview environment.",
    why: "RepoTutor records SEO metadata readiness only; it does not crawl websites, render pages, fetch robots.txt, validate sitemap XML, query search engines, execute Nuxt modules, or run the analyzed project's tests.",
    relatedHref: "html/seo-metadata-readiness.html"
  });

  return {
    summary: `Nuxt SEO-style metadata readiness report: setup ${seoSetups.length}개, crawl signal ${crawlSignals.length}개, sitemap signal ${sitemapSignals.length}개, metadata signal ${metadataSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Nuxt SEO robots sitemap Schema.org OpenGraph meta tags canonical siteUrl indexable i18n hreflang JSON-LD AEO llms",
    seoSetups,
    crawlSignals,
    sitemapSignals,
    metadataSignals,
    structuredDataSignals,
    aiReadinessSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"@nuxtjs/seo|nuxt-seo|@nuxtjs/robots|@nuxtjs/sitemap|nuxt-schema-org|nuxt-og-image|nuxt-seo-utils\" package.json pnpm-lock.yaml nuxt.config.* app pages docs", purpose: "Inventory SEO packages, modules, and app configuration." },
      { command: "rg \"robots.txt|meta name=\\\"robots\\\"|X-Robots-Tag|indexable|noindex|crawler|Googlebot|GPTBot|ClaudeBot\" .", purpose: "Review crawl control and indexing policy." },
      { command: "rg \"sitemap.xml|sitemap_index|hreflang|alternate|lastmod|Sitemap:\" .", purpose: "Check sitemap, locale alternate, and robots sitemap evidence." },
      { command: "rg \"title|description|canonical|og:|twitter:|favicon|breadcrumb\" app pages docs nuxt.config.*", purpose: "Check metadata, canonical, social preview, favicon, and breadcrumb evidence." },
      { command: "rg \"schema.org|application/ld\\\\+json|json-ld|FAQPage|Article|Product|BreadcrumbList\" .", purpose: "Check structured data evidence." },
      { command: "npx vitest run", purpose: "Run local tests that cover metadata generation, route snapshots, and static output." }
    ],
    learnerNextSteps: [
      "먼저 Nuxt SEO, robots, sitemap, schema.org, OG image, SEO utils 패키지와 module config를 찾으세요.",
      "robots.txt, meta robots, X-Robots-Tag, indexable/noindex, crawler rules 신호로 crawl control을 확인하세요.",
      "sitemap.xml, sitemap index, route sources, lastmod, hreflang, robots Sitemap 신호로 crawler discovery를 확인하세요.",
      "title, description, canonical, Open Graph, Twitter card, favicon 신호로 search/social metadata를 확인하세요.",
      "JSON-LD, Schema.org, breadcrumbs, article/product/FAQ 신호로 structured data coverage를 확인하세요.",
      "AEO, llms.txt, markdown endpoint, AI crawler, agent-readability 신호는 실제 배포 환경에서 별도 검증하세요."
    ]
  };
}

type SeoMetadataReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function seoMetadataReadinessSourceFiles(walk: WalkResult): Promise<SeoMetadataReadinessSourceFile[]> {
  const files: SeoMetadataReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !seoMetadataReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!seoMetadataReadinessPathSignal(file.relPath) && !seoMetadataReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function seoMetadataReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return seoMetadataReadinessPathSignal(filePath)
    || /^(package\.json|README\.md|nuxt\.config\.(ts|js|mjs)|next\.config\.(js|mjs|ts)|astro\.config\.(js|mjs|ts)|robots\.txt|sitemap\.xml|llms\.txt)$/i.test(base)
    || /\.(vue|js|cjs|mjs|ts|tsx|jsx|json|md|mdx|html?|ya?ml|toml)$/i.test(filePath);
}

function seoMetadataReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(seo|metadata|head|robots|sitemap|schema|og-image|open-graph|opengraph|llms|pages|app|routes|content|docs)(\/|\.|-|_|$)/i.test(filePath);
}

function seoMetadataReadinessContentSignal(text: string): boolean {
  return /(@nuxtjs\/seo|nuxt-seo|@nuxtjs\/robots|@nuxtjs\/sitemap|nuxt-schema-org|nuxt-og-image|nuxt-seo-utils|useSeoMeta|useHead|robots\.txt|sitemap\.xml|canonical|og:|twitter:|schema\.org|application\/ld\+json|JSON-LD|hreflang|llms\.txt|AEO|agent-readability|indexable|noindex)/i.test(text);
}

function seoMetadataReadinessSetups(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["seoSetups"] {
  const rows: SeoMetadataReadinessReport["seoSetups"] = [];
  for (const source of sourceFiles) {
    const crawlCount = countMatches(source.text, /robots\.txt|meta name=["']robots|X-Robots-Tag|indexable|noindex|crawler|Googlebot|GPTBot|ClaudeBot|PerplexityBot/gi);
    const sitemapCount = countMatches(source.text, /sitemap\.xml|sitemap_index|sitemapindex|hreflang|alternate|lastmod|Sitemap:/gi);
    const metadataCount = countMatches(source.text, /useSeoMeta|useHead|title|description|canonical|og:|OpenGraph|twitter:|favicon|breadcrumb/gi);
    const structuredDataCount = countMatches(source.text, /schema\.org|application\/ld\+json|JSON-LD|json-ld|BreadcrumbList|Article|Product|FAQPage|defineSchemaOrg/gi);
    const socialCount = countMatches(source.text, /og:image|defineOgImage|OpenGraph|twitter:card|twitter:image|social share|1200|630/gi);
    const aiCount = countMatches(source.text, /AEO|answer engine|AI crawler|llms\.txt|markdown endpoint|agent-readability|ChatGPT|Claude|Perplexity|AI Overviews/gi);
    const hasSetupSignal = crawlCount + sitemapCount + metadataCount + structuredDataCount + socialCount + aiCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: seoMetadataReadinessProvider(source),
      crawlCount,
      sitemapCount,
      metadataCount,
      structuredDataCount,
      socialCount,
      aiCount,
      readiness: crawlCount > 0 && sitemapCount > 0 && metadataCount > 0 && structuredDataCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains crawl ${crawlCount}, sitemap ${sitemapCount}, metadata ${metadataCount}, structured data ${structuredDataCount}, social ${socialCount}, AI ${aiCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function seoMetadataReadinessProvider(source: SeoMetadataReadinessSourceFile): SeoMetadataReadinessReport["seoSetups"][number]["provider"] {
  if (/@nuxtjs\/seo|nuxt-seo/i.test(source.text)) return "nuxt-seo";
  if (/next-seo|next\/head|metadata\s*:/i.test(source.text)) return "next-seo";
  if (/unhead|useSeoMeta|useHead/i.test(source.text)) return "unhead";
  if (/astro-seo|astro:head/i.test(source.text)) return "astro-seo";
  if (/seo|metadata|robots|sitemap|canonical|og:/i.test(source.text)) return "custom";
  return "unknown";
}

function seoMetadataReadinessCrawlSignals(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["crawlSignals"] {
  const specs: Array<{ signal: SeoMetadataReadinessReport["crawlSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "robots-txt", pattern: /robots\.txt|@nuxtjs\/robots|nuxt-robots/i, evidence: "robots.txt evidence was detected." },
    { signal: "meta-robots", pattern: /meta name=["']robots|useRobotsRule|robots:\s*{|max-image-preview|max-snippet/i, evidence: "meta robots evidence was detected." },
    { signal: "x-robots-tag", pattern: /X-Robots-Tag|x-robots/i, evidence: "X-Robots-Tag evidence was detected." },
    { signal: "indexable", pattern: /indexable|index,\s*follow|allow indexing/i, evidence: "indexable policy evidence was detected." },
    { signal: "noindex", pattern: /noindex|nofollow|disallow|block indexing/i, evidence: "noindex/disallow evidence was detected." },
    { signal: "crawler-rules", pattern: /Googlebot|GPTBot|ClaudeBot|PerplexityBot|AI crawler|crawler/i, evidence: "crawler-specific rule evidence was detected." }
  ];
  return seoMetadataReadinessSignalFromSpecs(sourceFiles, specs, "crawl", "signal");
}

function seoMetadataReadinessSitemapSignals(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["sitemapSignals"] {
  const specs: Array<{ signal: SeoMetadataReadinessReport["sitemapSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sitemap-xml", pattern: /sitemap\.xml|@nuxtjs\/sitemap|nuxt-sitemap/i, evidence: "sitemap.xml evidence was detected." },
    { signal: "sitemap-index", pattern: /sitemap_index|sitemapindex|__sitemap__/i, evidence: "sitemap index evidence was detected." },
    { signal: "route-sources", pattern: /sources|routes|urls|content|data sources/i, evidence: "sitemap route source evidence was detected." },
    { signal: "lastmod", pattern: /lastmod|lastModified|modifiedAt/i, evidence: "lastmod evidence was detected." },
    { signal: "hreflang", pattern: /hreflang|xhtml:link|alternate|locale/i, evidence: "hreflang/alternate evidence was detected." },
    { signal: "robots-sitemap", pattern: /Sitemap:\s*https?:\/\/|Sitemap:/i, evidence: "robots Sitemap directive evidence was detected." }
  ];
  return seoMetadataReadinessSignalFromSpecs(sourceFiles, specs, "sitemap", "signal");
}

function seoMetadataReadinessMetadataSignals(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["metadataSignals"] {
  const specs: Array<{ signal: SeoMetadataReadinessReport["metadataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "title", pattern: /titleTemplate|title:\s*|<title>|og:title/i, evidence: "title evidence was detected." },
    { signal: "description", pattern: /description:\s*|meta name=["']description|og:description/i, evidence: "description evidence was detected." },
    { signal: "canonical", pattern: /canonical|rel=["']canonical|siteUrl|url:\s*['"]https?:\/\//i, evidence: "canonical/site URL evidence was detected." },
    { signal: "open-graph", pattern: /og:|OpenGraph|defineOgImage|ogImage|og:image/i, evidence: "Open Graph evidence was detected." },
    { signal: "twitter-card", pattern: /twitter:card|twitter:image|summary_large_image/i, evidence: "Twitter card evidence was detected." },
    { signal: "favicon", pattern: /favicon|icon\.png|apple-touch-icon/i, evidence: "favicon evidence was detected." }
  ];
  return seoMetadataReadinessSignalFromSpecs(sourceFiles, specs, "metadata", "signal");
}

function seoMetadataReadinessStructuredDataSignals(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["structuredDataSignals"] {
  const specs: Array<{ signal: SeoMetadataReadinessReport["structuredDataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "json-ld", pattern: /application\/ld\+json|JSON-LD|json-ld/i, evidence: "JSON-LD evidence was detected." },
    { signal: "schema-org", pattern: /schema\.org|nuxt-schema-org|defineSchemaOrg/i, evidence: "Schema.org evidence was detected." },
    { signal: "breadcrumbs", pattern: /BreadcrumbList|breadcrumb/i, evidence: "breadcrumb structured data evidence was detected." },
    { signal: "article", pattern: /Article|BlogPosting|NewsArticle/i, evidence: "article structured data evidence was detected." },
    { signal: "product", pattern: /Product|Offer|AggregateRating/i, evidence: "product structured data evidence was detected." },
    { signal: "faq", pattern: /FAQPage|Question|acceptedAnswer/i, evidence: "FAQ structured data evidence was detected." }
  ];
  return seoMetadataReadinessSignalFromSpecs(sourceFiles, specs, "structured data", "signal");
}

function seoMetadataReadinessAiSignals(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["aiReadinessSignals"] {
  const specs: Array<{ signal: SeoMetadataReadinessReport["aiReadinessSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "aeo", pattern: /AEO|answer engine|AI Overviews|answer engines/i, evidence: "AEO evidence was detected." },
    { signal: "llms-txt", pattern: /llms\.txt|llms-full\.txt/i, evidence: "llms.txt evidence was detected." },
    { signal: "markdown-endpoint", pattern: /markdown endpoint|\.md endpoint|on-demand markdown|content endpoint/i, evidence: "markdown endpoint evidence was detected." },
    { signal: "ai-crawlers", pattern: /GPTBot|ClaudeBot|PerplexityBot|ChatGPT|AI crawler/i, evidence: "AI crawler policy evidence was detected." },
    { signal: "agent-readability", pattern: /agent-readability|@vercel\/agent-readability|AI parsers/i, evidence: "agent readability evidence was detected." }
  ];
  return seoMetadataReadinessSignalFromSpecs(sourceFiles, specs, "AI readiness", "signal");
}

function seoMetadataReadinessPackageSignals(sourceFiles: SeoMetadataReadinessSourceFile[]): SeoMetadataReadinessReport["packageSignals"] {
  const specs: Array<{ signal: SeoMetadataReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nuxt-seo", pattern: /@nuxtjs\/seo|nuxt-seo/i, evidence: "Nuxt SEO package/module evidence was detected." },
    { signal: "nuxt-robots", pattern: /@nuxtjs\/robots|nuxt-robots/i, evidence: "Nuxt Robots evidence was detected." },
    { signal: "nuxt-sitemap", pattern: /@nuxtjs\/sitemap|nuxt-sitemap/i, evidence: "Nuxt Sitemap evidence was detected." },
    { signal: "nuxt-schema-org", pattern: /nuxt-schema-org/i, evidence: "nuxt-schema-org evidence was detected." },
    { signal: "nuxt-og-image", pattern: /nuxt-og-image|defineOgImage/i, evidence: "Nuxt OG Image evidence was detected." },
    { signal: "seo-utils", pattern: /nuxt-seo-utils|useSeoMeta|canonical|breadcrumbs?|favicons?/i, evidence: "SEO utils evidence was detected." }
  ];
  return seoMetadataReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function seoMetadataReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: SeoMetadataReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/seo-metadata-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildPwaReadinessReport(walk: WalkResult): Promise<PwaReadinessReport> {
  const sourceFiles = await pwaReadinessSourceFiles(walk);
  const pwaSetups = pwaReadinessSetups(sourceFiles);
  const manifestSignals = pwaReadinessManifestSignals(sourceFiles);
  const serviceWorkerSignals = pwaReadinessServiceWorkerSignals(sourceFiles);
  const cachingSignals = pwaReadinessCachingSignals(sourceFiles);
  const updateSignals = pwaReadinessUpdateSignals(sourceFiles);
  const installSignals = pwaReadinessInstallSignals(sourceFiles);
  const packageSignals = pwaReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = pwaSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = pwaSetups.some((item) => item.readiness === "ready");
  const hasManifest = manifestSignals.some((item) => item.readiness === "ready") || pwaSetups.some((item) => item.manifestCount > 0);
  const hasServiceWorker = serviceWorkerSignals.some((item) => item.readiness === "ready") || pwaSetups.some((item) => item.serviceWorkerCount > 0);
  const hasCaching = cachingSignals.some((item) => item.readiness === "ready") || pwaSetups.some((item) => item.cachingCount > 0);
  const hasUpdate = updateSignals.some((item) => item.readiness === "ready") || pwaSetups.some((item) => item.updateCount > 0);
  const hasInstall = installSignals.some((item) => item.readiness === "ready") || pwaSetups.some((item) => item.installCount > 0);

  const riskQueue: PwaReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document PWA readiness before claiming offline/installable app support.",
      why: "PWA readiness starts with manifest, service worker, caching, update, install, or package evidence.",
      relatedHref: "html/pwa-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && (!hasManifest || !hasServiceWorker)) {
    riskQueue.push({
      priority: "high",
      action: "Pair the PWA package/config with both web manifest and service worker registration evidence.",
      why: "Installability and offline behavior require a valid manifest plus a registered/generated service worker.",
      relatedHref: "html/pwa-readiness.html"
    });
  }
  if ((hasPackage || hasReadySetup) && !hasCaching) {
    riskQueue.push({
      priority: "high",
      action: "Add precache and runtime caching policy before promising offline support.",
      why: "A service worker without clear precache/runtime strategy can still fail key routes when offline.",
      relatedHref: "html/pwa-readiness.html"
    });
  }
  if ((hasPackage || hasReadySetup) && (!hasUpdate || !hasInstall)) {
    riskQueue.push({
      priority: "medium",
      action: "Review update prompts, offline-ready prompts, install prompts, and credential handling.",
      why: "Users need understandable update/offline/install behavior and protected-manifest credential policy.",
      relatedHref: "html/pwa-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real PWA validation only in a trusted browser against a built preview.",
    why: "RepoTutor records PWA readiness only; it does not register service workers, open browsers, populate Cache Storage, fetch manifests, test offline mode, trigger install prompts, or run the analyzed project's tests.",
    relatedHref: "html/pwa-readiness.html"
  });

  return {
    summary: `Vite PWA-style readiness report: setup ${pwaSetups.length}개, manifest signal ${manifestSignals.length}개, service worker signal ${serviceWorkerSignals.length}개, caching signal ${cachingSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Vite PWA manifest webmanifest service worker registerSW Workbox generateSW injectManifest precache runtimeCaching offline icons theme_color start_url display",
    pwaSetups,
    manifestSignals,
    serviceWorkerSignals,
    cachingSignals,
    updateSignals,
    installSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"vite-plugin-pwa|VitePWA|workbox|next-pwa|nuxt-pwa\" package.json vite.config.* src app public", purpose: "Inventory PWA providers and config." },
      { command: "rg \"manifest.webmanifest|webmanifest|icons|theme_color|start_url|display|scope\" public src app vite.config.*", purpose: "Review web app manifest readiness." },
      { command: "rg \"registerSW|virtual:pwa-register|serviceWorker|sw.js|generateSW|injectManifest|selfDestroying\" src app public vite.config.*", purpose: "Check service worker registration and strategy." },
      { command: "rg \"precache|runtimeCaching|globPatterns|maximumFileSizeToCacheInBytes|CacheFirst|NetworkFirst|StaleWhileRevalidate\" src app public vite.config.*", purpose: "Check offline caching policy." },
      { command: "rg \"autoUpdate|prompt|needRefresh|offlineReady|beforeinstallprompt|useCredentials|shortcuts\" src app public vite.config.*", purpose: "Check update, offline ready, install prompt, and manifest credential behavior." },
      { command: "npx vitest run", purpose: "Run local tests for generated manifest, service worker assets, and offline UI state." }
    ],
    learnerNextSteps: [
      "먼저 vite-plugin-pwa, Workbox, next-pwa, nuxt-pwa 패키지와 config를 찾으세요.",
      "manifest.webmanifest, icons, theme_color, start_url, display, scope 신호로 installability 기본값을 확인하세요.",
      "registerSW, serviceWorker, generateSW, injectManifest, custom sw, selfDestroying 신호로 service worker lifecycle을 확인하세요.",
      "precache, runtimeCaching, globPatterns, maximumFileSizeToCacheInBytes, CacheFirst/NetworkFirst 신호로 offline cache policy를 확인하세요.",
      "autoUpdate, prompt update, skipWaiting, clientsClaim, offlineReady, beforeinstallprompt 신호로 사용자가 체감할 update/install 흐름을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 offline/PWA install 검증은 build preview와 브라우저 DevTools/Lighthouse에서 별도로 실행하세요."
    ]
  };
}

type PwaReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function pwaReadinessSourceFiles(walk: WalkResult): Promise<PwaReadinessSourceFile[]> {
  const files: PwaReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !pwaReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!pwaReadinessPathSignal(file.relPath) && !pwaReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function pwaReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return pwaReadinessPathSignal(filePath)
    || /^(package\.json|README\.md|vite\.config\.(ts|js|mjs)|next\.config\.(js|mjs|ts)|nuxt\.config\.(ts|js|mjs)|manifest\.webmanifest|manifest\.json|sw\.(js|ts)|service-worker\.(js|ts))$/i.test(base)
    || /\.(vue|js|cjs|mjs|ts|tsx|jsx|json|md|mdx|html?|ya?ml|toml)$/i.test(filePath);
}

function pwaReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(pwa|service-worker|sw|workbox|manifest|offline|install|public|src|app|examples)(\/|\.|-|_|$)/i.test(filePath);
}

function pwaReadinessContentSignal(text: string): boolean {
  return /(vite-plugin-pwa|VitePWA|workbox|manifest\.webmanifest|webmanifest|serviceWorker|registerSW|virtual:pwa-register|generateSW|injectManifest|precache|runtimeCaching|offlineReady|needRefresh|beforeinstallprompt|theme_color|start_url|display|selfDestroying)/i.test(text);
}

function pwaReadinessSetups(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["pwaSetups"] {
  const rows: PwaReadinessReport["pwaSetups"] = [];
  for (const source of sourceFiles) {
    const manifestCount = countMatches(source.text, /manifest\.webmanifest|webmanifest|manifest:|icons|theme_color|start_url|display|scope|shortcuts/gi);
    const serviceWorkerCount = countMatches(source.text, /serviceWorker|service worker|registerSW|virtual:pwa-register|sw\.js|sw\.ts|generateSW|injectManifest|selfDestroying/gi);
    const cachingCount = countMatches(source.text, /workbox|precache|runtimeCaching|globPatterns|maximumFileSizeToCacheInBytes|CacheFirst|NetworkFirst|StaleWhileRevalidate|ExpirationPlugin/gi);
    const updateCount = countMatches(source.text, /autoUpdate|prompt|needRefresh|skipWaiting|clientsClaim|onNeedRefresh|onRegisteredSW/gi);
    const installCount = countMatches(source.text, /offlineReady|beforeinstallprompt|installPrompt|useCredentials|ready to work offline|shortcuts/gi);
    const runtimeCount = countMatches(source.text, /runtime|navigateFallback|manifestTransforms|periodicSync|push|notifications?|CacheStorage/gi);
    const hasSetupSignal = manifestCount + serviceWorkerCount + cachingCount + updateCount + installCount + runtimeCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: pwaReadinessProvider(source),
      manifestCount,
      serviceWorkerCount,
      cachingCount,
      updateCount,
      installCount,
      runtimeCount,
      readiness: manifestCount > 0 && serviceWorkerCount > 0 && cachingCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains manifest ${manifestCount}, service worker ${serviceWorkerCount}, caching ${cachingCount}, update ${updateCount}, install ${installCount}, runtime ${runtimeCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function pwaReadinessProvider(source: PwaReadinessSourceFile): PwaReadinessReport["pwaSetups"][number]["provider"] {
  if (/vite-plugin-pwa|VitePWA/i.test(source.text)) return "vite-plugin-pwa";
  if (/workbox/i.test(source.text)) return "workbox";
  if (/next-pwa/i.test(source.text)) return "next-pwa";
  if (/nuxt-pwa|@vite-pwa\/nuxt/i.test(source.text)) return "nuxt-pwa";
  if (/pwa|serviceWorker|manifest\.webmanifest/i.test(source.text)) return "custom";
  return "unknown";
}

function pwaReadinessManifestSignals(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["manifestSignals"] {
  const specs: Array<{ signal: PwaReadinessReport["manifestSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "webmanifest", pattern: /manifest\.webmanifest|webmanifest|rel=["']manifest/i, evidence: "web manifest evidence was detected." },
    { signal: "icons", pattern: /icons|apple-touch-icon|maskable|purpose/i, evidence: "manifest icons evidence was detected." },
    { signal: "theme-color", pattern: /theme_color|theme-color|background_color/i, evidence: "theme/background color evidence was detected." },
    { signal: "start-url", pattern: /start_url|startUrl/i, evidence: "start_url evidence was detected." },
    { signal: "display", pattern: /display:\s*['"]?(standalone|fullscreen|minimal-ui)|display_override/i, evidence: "display mode evidence was detected." },
    { signal: "scope", pattern: /scope|scope_extensions/i, evidence: "manifest scope evidence was detected." }
  ];
  return pwaReadinessSignalFromSpecs(sourceFiles, specs, "manifest", "signal");
}

function pwaReadinessServiceWorkerSignals(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["serviceWorkerSignals"] {
  const specs: Array<{ signal: PwaReadinessReport["serviceWorkerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "register", pattern: /registerSW|virtual:pwa-register|navigator\.serviceWorker\.register|serviceWorker/i, evidence: "service worker registration evidence was detected." },
    { signal: "generate-sw", pattern: /generateSW|strategies:\s*['"]generateSW|GenerateSWOptions/i, evidence: "generateSW strategy evidence was detected." },
    { signal: "inject-manifest", pattern: /injectManifest|strategies:\s*['"]injectManifest|InjectManifestOptions|__WB_MANIFEST/i, evidence: "injectManifest strategy evidence was detected." },
    { signal: "custom-sw", pattern: /sw\.js|sw\.ts|custom-sw|ServiceWorkerGlobalScope/i, evidence: "custom service worker evidence was detected." },
    { signal: "sw-scope", pattern: /scope|swScope|basePath|srcDir|filename/i, evidence: "service worker scope/path evidence was detected." },
    { signal: "self-destroying", pattern: /selfDestroying|unregister service worker|unregister\(\)/i, evidence: "self-destroying/unregister evidence was detected." }
  ];
  return pwaReadinessSignalFromSpecs(sourceFiles, specs, "service worker", "signal");
}

function pwaReadinessCachingSignals(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["cachingSignals"] {
  const specs: Array<{ signal: PwaReadinessReport["cachingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "precache", pattern: /precache|precacheAndRoute|__WB_MANIFEST|workbox-precaching/i, evidence: "precache evidence was detected." },
    { signal: "runtime-caching", pattern: /runtimeCaching|registerRoute|runtime cache/i, evidence: "runtime caching evidence was detected." },
    { signal: "glob-patterns", pattern: /globPatterns|includeAssets|globIgnores|manifestTransforms/i, evidence: "glob/asset selection evidence was detected." },
    { signal: "maximum-file-size", pattern: /maximumFileSizeToCacheInBytes|2 MiB|max file size/i, evidence: "maximum cache file size evidence was detected." },
    { signal: "cache-first", pattern: /CacheFirst|cache first/i, evidence: "CacheFirst strategy evidence was detected." },
    { signal: "network-first", pattern: /NetworkFirst|StaleWhileRevalidate|network first/i, evidence: "network-first/stale-while-revalidate evidence was detected." }
  ];
  return pwaReadinessSignalFromSpecs(sourceFiles, specs, "caching", "signal");
}

function pwaReadinessUpdateSignals(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["updateSignals"] {
  const specs: Array<{ signal: PwaReadinessReport["updateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auto-update", pattern: /autoUpdate|registerType:\s*['"]autoUpdate/i, evidence: "auto update evidence was detected." },
    { signal: "prompt-update", pattern: /prompt|prompt for update|onNeedRefresh/i, evidence: "prompt update evidence was detected." },
    { signal: "skip-waiting", pattern: /skipWaiting|self\.skipWaiting/i, evidence: "skipWaiting evidence was detected." },
    { signal: "clients-claim", pattern: /clientsClaim|clients\.claim/i, evidence: "clientsClaim evidence was detected." },
    { signal: "need-refresh", pattern: /needRefresh|onNeedRefresh|need reload/i, evidence: "needRefresh evidence was detected." }
  ];
  return pwaReadinessSignalFromSpecs(sourceFiles, specs, "update", "signal");
}

function pwaReadinessInstallSignals(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["installSignals"] {
  const specs: Array<{ signal: PwaReadinessReport["installSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "offline-ready", pattern: /offlineReady|onOfflineReady|ready to work offline|offline support/i, evidence: "offline ready evidence was detected." },
    { signal: "install-prompt", pattern: /installPrompt|install prompt|PWA install/i, evidence: "install prompt evidence was detected." },
    { signal: "beforeinstallprompt", pattern: /beforeinstallprompt/i, evidence: "beforeinstallprompt evidence was detected." },
    { signal: "use-credentials", pattern: /useCredentials|crossorigin=["']use-credentials|401.*manifest/i, evidence: "manifest credential evidence was detected." },
    { signal: "shortcuts", pattern: /shortcuts|screenshots|categories|share_target/i, evidence: "manifest shortcut/advanced install evidence was detected." }
  ];
  return pwaReadinessSignalFromSpecs(sourceFiles, specs, "install", "signal");
}

function pwaReadinessPackageSignals(sourceFiles: PwaReadinessSourceFile[]): PwaReadinessReport["packageSignals"] {
  const specs: Array<{ signal: PwaReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vite-plugin-pwa", pattern: /vite-plugin-pwa|VitePWA/i, evidence: "vite-plugin-pwa evidence was detected." },
    { signal: "workbox", pattern: /workbox-build|workbox-core|workbox-routing|workbox-strategies|workbox-precaching/i, evidence: "Workbox evidence was detected." },
    { signal: "workbox-window", pattern: /workbox-window/i, evidence: "workbox-window evidence was detected." },
    { signal: "next-pwa", pattern: /next-pwa/i, evidence: "next-pwa evidence was detected." },
    { signal: "nuxt-pwa", pattern: /nuxt-pwa|@vite-pwa\/nuxt/i, evidence: "Nuxt PWA evidence was detected." },
    { signal: "custom", pattern: /serviceWorker|manifest\.webmanifest|registerSW|pwa/i, evidence: "custom PWA evidence was detected." }
  ];
  return pwaReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function pwaReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: PwaReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/pwa-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildBrowserCompatibilityReadinessReport(walk: WalkResult): Promise<BrowserCompatibilityReadinessReport> {
  const sourceFiles = await browserCompatibilityReadinessSourceFiles(walk);
  const compatibilitySetups = browserCompatibilityReadinessSetups(sourceFiles);
  const configSignals = browserCompatibilityReadinessConfigSignals(sourceFiles);
  const querySignals = browserCompatibilityReadinessQuerySignals(sourceFiles);
  const coverageSignals = browserCompatibilityReadinessCoverageSignals(sourceFiles);
  const featureSignals = browserCompatibilityReadinessFeatureSignals(sourceFiles);
  const updateSignals = browserCompatibilityReadinessUpdateSignals(sourceFiles);
  const packageSignals = browserCompatibilityReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSetup = compatibilitySetups.some((item) => item.readiness !== "missing");
  const hasConfig = configSignals.some((item) => item.readiness === "ready") || compatibilitySetups.some((item) => item.configCount > 0);
  const hasQuery = querySignals.some((item) => item.readiness === "ready") || compatibilitySetups.some((item) => item.queryCount > 0);
  const hasCoverage = coverageSignals.some((item) => item.readiness === "ready") || compatibilitySetups.some((item) => item.coverageCount > 0);
  const hasUpdate = updateSignals.some((item) => item.readiness === "ready") || compatibilitySetups.some((item) => item.updateCount > 0);

  const riskQueue: BrowserCompatibilityReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document browser compatibility targets before relying on transpilation, polyfill, or CSS prefix behavior.",
      why: "Browserslist-style readiness starts with package/config/query evidence that shared frontend tools can consume.",
      relatedHref: "html/browser-compat-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && (!hasConfig || !hasQuery)) {
    riskQueue.push({
      priority: "high",
      action: "Pair browser compatibility packages with explicit Browserslist config and target queries.",
      why: "Autoprefixer, Babel preset-env, Stylelint, and related tools need stable target queries rather than implicit defaults.",
      relatedHref: "html/browser-compat-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasCoverage) {
    riskQueue.push({
      priority: "medium",
      action: "Review coverage, regional usage, custom stats, and mobile-to-desktop assumptions for product markets.",
      why: "A target list can be technically valid but still miss the user base if coverage and stats inputs are never checked.",
      relatedHref: "html/browser-compat-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasUpdate) {
    riskQueue.push({
      priority: "medium",
      action: "Add a caniuse-lite update path before treating browser support data as current.",
      why: "Browserslist depends on browser usage and feature datasets that drift over time.",
      relatedHref: "html/browser-compat-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real build/test compatibility validation in the target toolchain before changing browser support policy.",
    why: "RepoTutor records browser compatibility readiness only; it does not resolve Browserslist queries, update caniuse-lite, run Babel, run Autoprefixer, execute browser tests, or contact external services.",
    relatedHref: "html/browser-compat-readiness.html"
  });

  return {
    summary: `Browserslist-style readiness report: setup ${compatibilitySetups.length}개, config signal ${configSignals.length}개, query signal ${querySignals.length}개, coverage signal ${coverageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Browserslist target browsers config queries coverage caniuse-lite update-browserslist-db mobile-to-desktop env stats",
    compatibilitySetups,
    configSignals,
    querySignals,
    coverageSignals,
    featureSignals,
    updateSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"browserslist|\\.browserslistrc|BROWSERSLIST|browserslist-config\" package.json . .github src app config", purpose: "Inventory browser target config surfaces." },
      { command: "rg \"defaults|last [0-9]+ versions|not dead|> ?[0-9.]+%|cover [0-9.]+%|maintained node\" package.json .browserslistrc browserslist config", purpose: "Review target query policy." },
      { command: "rg \"coverage|stats|browserslist-stats|mobile-to-desktop|BROWSERSLIST_STATS\" package.json . .github src app config", purpose: "Check coverage and custom usage assumptions." },
      { command: "rg \"caniuse-lite|update-browserslist-db|BROWSERSLIST_IGNORE_OLD_DATA|browserslist-update-action\" package.json .github scripts", purpose: "Check browser data update workflow." },
      { command: "rg \"autoprefixer|@babel/preset-env|postcss-preset-env|eslint-plugin-compat\" package.json babel.config.* postcss.config.* eslint.config.*", purpose: "Find tools that consume the browser target policy." },
      { command: "npx browserslist", purpose: "Resolve actual browser targets locally after reviewing static readiness." }
    ],
    learnerNextSteps: [
      "먼저 package.json browserslist, .browserslistrc, browserslist 파일, BROWSERSLIST_CONFIG 신호를 찾아 browser target의 소유 위치를 확인하세요.",
      "defaults, last n versions, not dead, usage threshold, cover, maintained node versions 같은 query가 제품 정책과 맞는지 확인하세요.",
      "coverage, regional usage, my stats, mobile-to-desktop 신호로 실제 사용자 기반을 반영하는지 확인하세요.",
      "caniuse-lite와 update-browserslist-db 또는 자동 업데이트 workflow를 찾아 데이터 최신성 관리 방식을 확인하세요.",
      "Autoprefixer, Babel preset-env, postcss-preset-env, eslint-plugin-compat 같은 소비 도구가 같은 target을 공유하는지 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 대상 브라우저 목록은 프로젝트 루트에서 npx browserslist와 build/test로 별도 확인하세요."
    ]
  };
}

type BrowserCompatibilityReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function browserCompatibilityReadinessSourceFiles(walk: WalkResult): Promise<BrowserCompatibilityReadinessSourceFile[]> {
  const files: BrowserCompatibilityReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !browserCompatibilityReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!browserCompatibilityReadinessPathSignal(file.relPath) && !browserCompatibilityReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function browserCompatibilityReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return browserCompatibilityReadinessPathSignal(filePath)
    || /^(package\.json|README\.md|\.browserslistrc|browserslist|browserslist-stats\.json|babel\.config\.(js|mjs|cjs|ts|json)|postcss\.config\.(js|mjs|cjs|ts)|eslint\.config\.(js|mjs|cjs|ts))$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|json|md|mdx|ya?ml|toml|rc)$/i.test(filePath);
}

function browserCompatibilityReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(browserslist|browserlist|compat|caniuse|autoprefixer|babel|postcss|eslint|baseline|config|\.github|scripts|src|app|test)(\/|\.|-|_|$)/i.test(filePath);
}

function browserCompatibilityReadinessContentSignal(text: string): boolean {
  return /(browserslist|browserlist|\.browserslistrc|BROWSERSLIST|last\s+\d+\s+(major\s+)?versions?|not dead|defaults|cover\s+\d|caniuse-lite|update-browserslist-db|mobile-to-desktop|browserslist-stats|autoprefixer|@babel\/preset-env|postcss-preset-env|eslint-plugin-compat|baseline newly|baseline widely)/i.test(text);
}

function browserCompatibilityReadinessSetups(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["compatibilitySetups"] {
  const rows: BrowserCompatibilityReadinessReport["compatibilitySetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /"browserslist"|\.browserslistrc|(^|\s)browserslist(\s|$)|BROWSERSLIST_CONFIG|browserslist-config-/gim);
    const queryCount = countMatches(source.text, /defaults|last\s+\d+\s+(major\s+)?versions?|not dead|>\s*\d|cover\s+\d|maintained node|supports\s+[\w-]+|baseline\s+(newly|widely)/gi);
    const coverageCount = countMatches(source.text, /coverage|--coverage|in my stats|browserslist-stats|BROWSERSLIST_STATS|mobile-to-desktop|global|regional/gi);
    const envCount = countMatches(source.text, /BROWSERSLIST_ENV|NODE_ENV|env|production|development|BROWSERSLIST|BROWSERSLIST_CONFIG/gi);
    const updateCount = countMatches(source.text, /caniuse-lite|update-browserslist-db|update-db|BROWSERSLIST_IGNORE_OLD_DATA|old data|browserslist-update-action/gi);
    const featureCount = countMatches(source.text, /supports\s+[\w-]+|fully supports|partially supports|es6-module|baseline|dead|unreleased|electron-to-chromium|electron/gi);
    const hasSetupSignal = configCount + queryCount + coverageCount + envCount + updateCount + featureCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: browserCompatibilityReadinessProvider(source),
      configCount,
      queryCount,
      coverageCount,
      envCount,
      updateCount,
      featureCount,
      readiness: configCount > 0 && queryCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains config ${configCount}, query ${queryCount}, coverage ${coverageCount}, env ${envCount}, update ${updateCount}, feature ${featureCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function browserCompatibilityReadinessProvider(source: BrowserCompatibilityReadinessSourceFile): BrowserCompatibilityReadinessReport["compatibilitySetups"][number]["provider"] {
  if (/browserslist|\.browserslistrc|BROWSERSLIST/i.test(source.text) || /browserslist/i.test(source.filePath)) return "browserslist";
  if (/autoprefixer/i.test(source.text)) return "autoprefixer";
  if (/@babel\/preset-env|preset-env/i.test(source.text)) return "babel-preset-env";
  if (/postcss-preset-env/i.test(source.text)) return "postcss-preset-env";
  if (/eslint-plugin-compat/i.test(source.text)) return "eslint-plugin-compat";
  if (/compat|caniuse|browser/i.test(source.text)) return "custom";
  return "unknown";
}

function browserCompatibilityReadinessConfigSignals(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["configSignals"] {
  const specs: Array<{ signal: BrowserCompatibilityReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "package-json", pattern: /"browserslist"\s*:/i, evidence: "package.json browserslist config evidence was detected." },
    { signal: "browserslistrc", pattern: /\.browserslistrc/i, evidence: ".browserslistrc evidence was detected." },
    { signal: "browserslist-file", pattern: /(^|\/)browserslist$|Browserslist config/i, evidence: "browserslist file evidence was detected." },
    { signal: "env-config", pattern: /BROWSERSLIST_ENV|NODE_ENV|env\s*[:=]|production|development/i, evidence: "environment-specific config evidence was detected." },
    { signal: "shareable-config", pattern: /extends\s+browserslist-config-|@[^/]+\/browserslist-config|BROWSERSLIST_DANGEROUS_EXTEND/i, evidence: "shareable config evidence was detected." },
    { signal: "env-var", pattern: /BROWSERSLIST|BROWSERSLIST_CONFIG|BROWSERSLIST_ROOT_PATH|BROWSERSLIST_DISABLE_CACHE/i, evidence: "Browserslist environment variable evidence was detected." }
  ];
  return browserCompatibilityReadinessSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function browserCompatibilityReadinessQuerySignals(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["querySignals"] {
  const specs: Array<{ signal: BrowserCompatibilityReadinessReport["querySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "defaults", pattern: /defaults|>\s*0\.5%.*last\s+2\s+versions.*not dead/i, evidence: "defaults query evidence was detected." },
    { signal: "last-versions", pattern: /last\s+\d+\s+(major\s+)?versions?/i, evidence: "last versions query evidence was detected." },
    { signal: "usage-threshold", pattern: />=?\s*\d+(\.\d+)?%|<=?\s*\d+(\.\d+)?%/i, evidence: "usage percentage query evidence was detected." },
    { signal: "not-dead", pattern: /not dead|dead browsers/i, evidence: "not-dead/dead browser query evidence was detected." },
    { signal: "coverage", pattern: /cover\s+\d+(\.\d+)?%|coverage/i, evidence: "coverage query evidence was detected." },
    { signal: "maintained-node", pattern: /maintained node versions|node\s*(>=|>|<=|<)|current node/i, evidence: "Node target query evidence was detected." }
  ];
  return browserCompatibilityReadinessSignalFromSpecs(sourceFiles, specs, "query", "signal");
}

function browserCompatibilityReadinessCoverageSignals(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["coverageSignals"] {
  const specs: Array<{ signal: BrowserCompatibilityReadinessReport["coverageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "global-coverage", pattern: /--coverage|coverage\(.*global|global coverage|coverage.*global/i, evidence: "global coverage evidence was detected." },
    { signal: "regional-coverage", pattern: /--coverage=|in\s+[A-Z]{2}\b|region|caniuse-lite\/data\/regions/i, evidence: "regional coverage evidence was detected." },
    { signal: "custom-stats", pattern: /in my stats|custom usage data|browserslist-stats/i, evidence: "custom stats query evidence was detected." },
    { signal: "stats-file", pattern: /browserslist-stats\.json|BROWSERSLIST_STATS|--stats/i, evidence: "stats file evidence was detected." },
    { signal: "mobile-to-desktop", pattern: /mobile-to-desktop|mobileToDesktop/i, evidence: "mobile-to-desktop evidence was detected." }
  ];
  return browserCompatibilityReadinessSignalFromSpecs(sourceFiles, specs, "coverage", "signal");
}

function browserCompatibilityReadinessFeatureSignals(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["featureSignals"] {
  const specs: Array<{ signal: BrowserCompatibilityReadinessReport["featureSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "supports-feature", pattern: /supports\s+[\w-]+|fully supports|partially supports/i, evidence: "feature support query evidence was detected." },
    { signal: "es-modules", pattern: /es6-module|es modules?|supports\s+es6-module/i, evidence: "ES modules target evidence was detected." },
    { signal: "baseline", pattern: /baseline\s+(newly|widely|available)|baseline-browser-mapping/i, evidence: "baseline browser mapping evidence was detected." },
    { signal: "dead-browsers", pattern: /\bdead\b|not dead|official support|security updates/i, evidence: "dead browser policy evidence was detected." },
    { signal: "unreleased", pattern: /unreleased versions?|not unreleased/i, evidence: "unreleased version evidence was detected." },
    { signal: "electron", pattern: /electron-to-chromium|electron\s+\d/i, evidence: "Electron target evidence was detected." }
  ];
  return browserCompatibilityReadinessSignalFromSpecs(sourceFiles, specs, "feature", "signal");
}

function browserCompatibilityReadinessUpdateSignals(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["updateSignals"] {
  const specs: Array<{ signal: BrowserCompatibilityReadinessReport["updateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "caniuse-lite", pattern: /caniuse-lite/i, evidence: "caniuse-lite evidence was detected." },
    { signal: "update-browserslist-db", pattern: /update-browserslist-db|update-db/i, evidence: "update-browserslist-db evidence was detected." },
    { signal: "old-data-warning", pattern: /old data|Browserslist: browsers data|caniuse-lite is outdated/i, evidence: "old browser data warning evidence was detected." },
    { signal: "ignore-old-data", pattern: /BROWSERSLIST_IGNORE_OLD_DATA/i, evidence: "ignore old data override evidence was detected." },
    { signal: "update-action", pattern: /browserslist-update-action|update browserslist db|update caniuse/i, evidence: "browser data update automation evidence was detected." }
  ];
  return browserCompatibilityReadinessSignalFromSpecs(sourceFiles, specs, "update", "signal");
}

function browserCompatibilityReadinessPackageSignals(sourceFiles: BrowserCompatibilityReadinessSourceFile[]): BrowserCompatibilityReadinessReport["packageSignals"] {
  const specs: Array<{ signal: BrowserCompatibilityReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "browserslist", pattern: /"browserslist"|browserslist/i, evidence: "Browserslist evidence was detected." },
    { signal: "caniuse-lite", pattern: /caniuse-lite/i, evidence: "caniuse-lite evidence was detected." },
    { signal: "autoprefixer", pattern: /autoprefixer/i, evidence: "Autoprefixer evidence was detected." },
    { signal: "@babel/preset-env", pattern: /@babel\/preset-env|preset-env/i, evidence: "Babel preset-env evidence was detected." },
    { signal: "postcss-preset-env", pattern: /postcss-preset-env/i, evidence: "postcss-preset-env evidence was detected." },
    { signal: "eslint-plugin-compat", pattern: /eslint-plugin-compat/i, evidence: "eslint-plugin-compat evidence was detected." }
  ];
  return browserCompatibilityReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function browserCompatibilityReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BrowserCompatibilityReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/browser-compat-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildBrowserExtensionReadinessReport(walk: WalkResult): Promise<BrowserExtensionReadinessReport> {
  const sourceFiles = await browserExtensionSourceFiles(walk);
  const extensionSetups = browserExtensionSetupFiles(sourceFiles);
  const manifestSignals = browserExtensionManifestSignals(sourceFiles);
  const entrypointSignals = browserExtensionEntrypointSignals(sourceFiles);
  const permissionSignals = browserExtensionPermissionSignals(sourceFiles);
  const messagingSignals = browserExtensionMessagingSignals(sourceFiles);
  const buildSignals = browserExtensionBuildSignals(sourceFiles);
  const publishSignals = browserExtensionPublishSignals(sourceFiles);
  const packageSignals = browserExtensionPackageSignals(sourceFiles);

  const hasFramework = packageSignals.some((item) => ["wxt", "plasmo", "@crxjs/vite-plugin"].includes(item.signal) && item.readiness === "ready");
  const hasManifest = manifestSignals.some((item) => item.readiness === "ready") || extensionSetups.some((item) => item.manifestCount > 0);
  const hasEntrypoint = entrypointSignals.some((item) => item.readiness === "ready") || extensionSetups.some((item) => item.entrypointCount > 0);
  const hasPermissions = permissionSignals.some((item) => item.readiness === "ready") || extensionSetups.some((item) => item.permissionCount > 0 || item.hostPermissionCount > 0);
  const hasMessaging = messagingSignals.some((item) => item.readiness === "ready") || extensionSetups.some((item) => item.messagingCount > 0);
  const hasBuild = buildSignals.some((item) => item.readiness === "ready") || extensionSetups.some((item) => item.buildCount > 0);
  const hasPublish = publishSignals.some((item) => item.readiness === "ready") || extensionSetups.some((item) => item.publishCount > 0);

  const riskQueue: BrowserExtensionReadinessReport["riskQueue"] = [];
  if (!hasFramework && !hasManifest) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document browser extension manifest/framework ownership if this repository ships an extension.",
      why: "WXT/Plasmo/CRXJS-style review starts from concrete manifest, config, package, or entrypoint evidence.",
      relatedHref: "html/browser-extension-readiness.html"
    });
  }
  if ((hasFramework || hasManifest) && !hasEntrypoint) {
    riskQueue.push({
      priority: "high",
      action: "Trace background/service worker, content script, popup, options, side panel, or devtools entrypoints.",
      why: "Extension behavior is split across isolated browser contexts, so learners need explicit entrypoint ownership.",
      relatedHref: "html/browser-extension-readiness.html"
    });
  }
  if ((hasFramework || hasManifest) && !hasPermissions) {
    riskQueue.push({
      priority: "high",
      action: "Review permissions, host_permissions, optional permissions, and web_accessible_resources before release.",
      why: "Manifest permissions shape install warnings and runtime security boundaries.",
      relatedHref: "html/browser-extension-readiness.html"
    });
  }
  if ((hasFramework || hasManifest) && !hasMessaging) {
    riskQueue.push({
      priority: "medium",
      action: "Document message passing between content scripts, background service workers, tabs, and UI surfaces.",
      why: "Most extension bugs appear at runtime context boundaries rather than inside a single component.",
      relatedHref: "html/browser-extension-readiness.html"
    });
  }
  if ((hasFramework || hasManifest) && !hasBuild) {
    riskQueue.push({
      priority: "medium",
      action: "Record build/dev/package commands and generated artifact locations for target browsers.",
      why: "Extension builds often generate browser-specific manifests and zip artifacts that are not obvious from source files alone.",
      relatedHref: "html/browser-extension-readiness.html"
    });
  }
  if ((hasFramework || hasManifest) && !hasPublish) {
    riskQueue.push({
      priority: "low",
      action: "Document Chrome Web Store, Firefox Add-ons, Edge Add-ons, or signed web-ext publication flow.",
      why: "Publication credentials, review artifacts, and target-store differences are operational readiness risks.",
      relatedHref: "html/browser-extension-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run the original extension build/test/publish workflow only in a trusted runtime before treating this report as release approval.",
    why: "RepoTutor records browser extension readiness only; it does not run WXT, Plasmo, CRXJS, Vite, web-ext, browser launchers, store upload, signing, or extension tests.",
    relatedHref: "html/browser-extension-readiness.html"
  });

  const priorityOrder = { high: 0, medium: 1, low: 2 } as const;
  return {
    summary: `WXT/Plasmo/CRXJS-style browser extension readiness report: setup ${extensionSetups.length}개, manifest signal ${manifestSignals.length}개, entrypoint signal ${entrypointSignals.length}개, permission signal ${permissionSignals.length}개, build signal ${buildSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "WXT Plasmo CRXJS Manifest V3 manifest.json background service_worker content_scripts permissions host_permissions web_accessible_resources chrome.runtime browser.runtime web-ext zip publish",
    extensionSetups,
    manifestSignals,
    entrypointSignals,
    permissionSignals,
    messagingSignals,
    buildSignals,
    publishSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]),
    recommendedCommands: [
      { command: "rg \"manifest_version|manifest.json|wxt.config|defineManifest|plasmo|crx\\(|@crxjs/vite-plugin\" .", purpose: "Find extension manifest/config/framework surfaces." },
      { command: "rg \"background|service_worker|content_scripts|popup|options_page|side_panel|devtools_page|offscreen\" .", purpose: "Trace extension entrypoints and UI surfaces." },
      { command: "rg \"permissions|host_permissions|optional_permissions|web_accessible_resources|declarativeNetRequest|content_security_policy\" .", purpose: "Review extension permission and resource exposure policy." },
      { command: "rg \"chrome\\.runtime|browser\\.runtime|sendMessage|runtime\\.connect|tabs\\.sendMessage|@plasmohq/messaging|wxt\\/utils\\/messaging\" .", purpose: "Trace runtime messaging boundaries." },
      { command: "rg \"wxt (dev|build|zip|submit)|plasmo (dev|build|package|publish)|web-ext (build|sign|run)|chrome-webstore-upload|addons.mozilla.org|edge add-ons\" package.json .github scripts", purpose: "Review build, zip, signing, and store publication commands." }
    ],
    learnerNextSteps: [
      "먼저 manifest.json, wxt.config.ts, Plasmo convention files, CRXJS Vite config에서 manifest source of truth를 찾으세요.",
      "background service worker, content scripts, popup, options, side panel, devtools, offscreen entrypoint가 어느 파일에 있는지 확인하세요.",
      "permissions, host_permissions, optional permissions, web_accessible_resources, CSP, declarativeNetRequest를 install warning과 runtime boundary 관점에서 읽으세요.",
      "chrome.runtime/browser.runtime messaging, tabs.sendMessage, runtime.connect, Plasmo/WXT messaging helper가 context 사이를 어떻게 연결하는지 확인하세요.",
      "wxt build/zip/submit, plasmo build/package/publish, CRXJS Vite build, web-ext build/sign command와 산출물 위치를 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 extension build, browser launch, store signing/upload는 신뢰된 원본 런타임에서 별도 검증하세요."
    ]
  };
}

type BrowserExtensionSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function browserExtensionSourceFiles(walk: WalkResult): Promise<BrowserExtensionSourceFile[]> {
  const files: BrowserExtensionSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !browserExtensionInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!browserExtensionPathSignal(file.relPath) && !browserExtensionContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 280) break;
  }
  return files;
}

function browserExtensionInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return browserExtensionPathSignal(filePath)
    || /^(package\.json|manifest\.json|wxt\.config\.[cm]?[jt]s|plasmo\.config\.[cm]?[jt]s|vite\.config\.[cm]?[jt]s|web-ext-config\.(js|cjs|mjs|json)|README\.md)$/i.test(base)
    || /\.(json|ya?ml|js|cjs|mjs|ts|tsx|jsx|md|mdx|html|css)$/i.test(filePath);
}

function browserExtensionPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(manifest\.json|wxt\.config\.[cm]?[jt]s|plasmo\.config\.[cm]?[jt]s|web-ext-config\.(js|cjs|mjs|json))$/i.test(base)
    || /(^|\/)(entrypoints?|background|content|contents?|popup|options|sidepanel|side-panel|devtools|offscreen|newtab|tabs?|extension|extensions?|webext|web-ext|plasmo|wxt|crx|public|assets|scripts?|\.github\/workflows)(\/|\.|-|_|$)/i.test(filePath);
}

function browserExtensionContentSignal(text: string): boolean {
  return /(manifest_version|content_scripts|host_permissions|web_accessible_resources|service_worker|declarativeNetRequest|chrome\.runtime|browser\.runtime|sendMessage|runtime\.connect|@plasmohq|plasmo|wxt\.config|defineManifest|defineConfig|@crxjs\/vite-plugin|webextension-polyfill|web-ext|chrome web store|addons\.mozilla|edge add-ons)/i.test(text);
}

function browserExtensionSetupFiles(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["extensionSetups"] {
  const rows: BrowserExtensionReadinessReport["extensionSetups"] = [];
  for (const source of sourceFiles) {
    const manifestCount = countMatches(source.text, /manifest_version|manifest\.json|defineManifest|wxt\.config|plasmo|crx\(|background|content_scripts|action|browser_action|page_action/gi) + (/manifest\.json$/i.test(source.filePath) ? 1 : 0);
    const entrypointCount = countMatches(source.text, /background|service_worker|content_scripts|content script|popup|options_page|options_ui|side_panel|devtools_page|offscreen|newtab|entrypoints?/gi);
    const permissionCount = countMatches(source.text, /"permissions"|permissions\s*:|activeTab|scripting|storage|tabs|cookies|declarativeNetRequest|content_security_policy/gi);
    const hostPermissionCount = countMatches(source.text, /host_permissions|optional_host_permissions|https?:\/\/\*|<all_urls>|matches\s*:|exclude_matches/gi);
    const messagingCount = countMatches(source.text, /chrome\.runtime|browser\.runtime|sendMessage|runtime\.connect|tabs\.sendMessage|onMessage|Port|@plasmohq\/messaging|wxt\/utils\/messaging/gi);
    const storageCount = countMatches(source.text, /chrome\.storage|browser\.storage|storage\.local|storage\.sync|@plasmohq\/storage|wxt\/utils\/storage/gi);
    const uiSurfaceCount = countMatches(source.text, /popup|options|side_panel|devtools|offscreen|action|browser_action|page_action|newtab|content UI|CSUI/gi);
    const buildCount = countMatches(source.text, /wxt\s+(dev|build|zip|prepare)|plasmo\s+(dev|build|package)|vite build|crx\(|web-ext\s+(run|build|lint)|HMR|hot reload|typescript/gi);
    const publishCount = countMatches(source.text, /wxt\s+submit|plasmo\s+publish|bpp|chrome-webstore|Chrome Web Store|addons\.mozilla|web-ext\s+sign|Edge Add-ons|action-gh-release|upload-artifact/gi);
    const totalSignals = manifestCount + entrypointCount + permissionCount + hostPermissionCount + messagingCount + storageCount + uiSurfaceCount + buildCount + publishCount;
    if (totalSignals === 0 && !browserExtensionPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: browserExtensionFramework(source),
      manifestCount,
      entrypointCount,
      permissionCount,
      hostPermissionCount,
      messagingCount,
      storageCount,
      uiSurfaceCount,
      buildCount,
      publishCount,
      readiness: manifestCount > 0 && entrypointCount > 0 && (permissionCount > 0 || hostPermissionCount > 0) ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${source.filePath} contains manifest ${manifestCount}, entrypoint ${entrypointCount}, permission ${permissionCount}, host permission ${hostPermissionCount}, messaging ${messagingCount}, storage ${storageCount}, UI ${uiSurfaceCount}, build ${buildCount}, publish ${publishCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.manifestCount + b.entrypointCount + b.permissionCount + b.hostPermissionCount + b.messagingCount + b.buildCount + b.publishCount;
    const aScore = a.manifestCount + a.entrypointCount + a.permissionCount + a.hostPermissionCount + a.messagingCount + a.buildCount + a.publishCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 80);
}

function browserExtensionFramework(source: BrowserExtensionSourceFile): BrowserExtensionReadinessReport["extensionSetups"][number]["framework"] {
  if (/wxt\.config|wxt\s+(dev|build|zip|submit)|from ['"]wxt|defineWxtModule|#imports/i.test(source.filePath) || /wxt\.config|wxt\s+(dev|build|zip|submit)|from ['"]wxt|defineWxtModule|#imports/i.test(source.text)) return "wxt";
  if (/plasmo|@plasmohq|plasmo\s+(dev|build|package|publish)/i.test(source.filePath) || /plasmo|@plasmohq|plasmo\s+(dev|build|package|publish)/i.test(source.text)) return "plasmo";
  if (/@crxjs\/vite-plugin|crx\(|defineManifest/i.test(source.filePath) || /@crxjs\/vite-plugin|crx\(|defineManifest/i.test(source.text)) return "crxjs";
  if (/manifest\.json|manifest_version|content_scripts|host_permissions/i.test(source.filePath) || /manifest_version|content_scripts|host_permissions/i.test(source.text)) return "manifest";
  if (/webextension-polyfill|browser\.runtime/i.test(source.filePath) || /webextension-polyfill|browser\.runtime/i.test(source.text)) return "webextension-polyfill";
  if (/extension|webext|chrome\.runtime|browser\.runtime/i.test(source.filePath) || /extension|webext|chrome\.runtime|browser\.runtime/i.test(source.text)) return "custom";
  return "unknown";
}

function browserExtensionManifestSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["manifestSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["manifestSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "manifest-v3", pattern: /manifest_version["']?\s*[:=]\s*3|ManifestV3|MV3/i, evidence: "Manifest V3 evidence was detected." },
    { signal: "manifest-v2", pattern: /manifest_version["']?\s*[:=]\s*2|ManifestV2|MV2/i, evidence: "Manifest V2 evidence was detected." },
    { signal: "manifest-json", pattern: /(^|\/)manifest\.json$|manifest\.json/i, evidence: "manifest.json evidence was detected." },
    { signal: "generated-manifest", pattern: /defineManifest|manifest:\s*\(|manifest\s*:\s*{|generated manifest/i, evidence: "generated manifest evidence was detected." },
    { signal: "wxt-config", pattern: /wxt\.config|defineConfig\(\s*{[\s\S]*manifest|WxtConfig/i, evidence: "WXT config evidence was detected." },
    { signal: "plasmo-config", pattern: /plasmo|PlasmoConfig|@plasmohq/i, evidence: "Plasmo config evidence was detected." },
    { signal: "crxjs-plugin", pattern: /@crxjs\/vite-plugin|crx\(\s*{|defineManifest/i, evidence: "CRXJS plugin evidence was detected." },
    { signal: "browser-targets", pattern: /targetBrowsers|browser\s*:\s*['"]?(chrome|firefox|edge)|firefox|chromium|chrome/i, evidence: "browser target evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "manifest", "signal");
}

function browserExtensionEntrypointSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["entrypointSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["entrypointSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "background", pattern: /background|entrypoints\/background|background\.service_worker/i, evidence: "background entrypoint evidence was detected." },
    { signal: "service-worker", pattern: /service_worker|service worker|background\.service_worker/i, evidence: "service worker evidence was detected." },
    { signal: "content-script", pattern: /content_scripts|content script|entrypoints\/content|matches\s*:/i, evidence: "content script evidence was detected." },
    { signal: "popup", pattern: /popup|default_popup|entrypoints\/popup/i, evidence: "popup evidence was detected." },
    { signal: "options", pattern: /options_page|options_ui|entrypoints\/options/i, evidence: "options page evidence was detected." },
    { signal: "side-panel", pattern: /side_panel|sidePanel|entrypoints\/sidepanel|side-panel/i, evidence: "side panel evidence was detected." },
    { signal: "devtools", pattern: /devtools_page|devtools|entrypoints\/devtools/i, evidence: "devtools page evidence was detected." },
    { signal: "offscreen", pattern: /offscreen|OffscreenDocument|chrome\.offscreen/i, evidence: "offscreen document evidence was detected." },
    { signal: "newtab", pattern: /chrome_url_overrides|newtab|new tab/i, evidence: "new tab override evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "entrypoint", "signal");
}

function browserExtensionPermissionSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["permissionSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["permissionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "permissions", pattern: /"permissions"\s*:|permissions\s*:/i, evidence: "permissions evidence was detected." },
    { signal: "host-permissions", pattern: /host_permissions|<all_urls>|https?:\/\/\*|matches\s*:/i, evidence: "host permissions evidence was detected." },
    { signal: "optional-permissions", pattern: /optional_permissions|chrome\.permissions\.request/i, evidence: "optional permissions evidence was detected." },
    { signal: "optional-host-permissions", pattern: /optional_host_permissions/i, evidence: "optional host permissions evidence was detected." },
    { signal: "active-tab", pattern: /activeTab|active_tab/i, evidence: "activeTab permission evidence was detected." },
    { signal: "scripting", pattern: /scripting|chrome\.scripting|browser\.scripting/i, evidence: "scripting permission/API evidence was detected." },
    { signal: "storage", pattern: /storage|chrome\.storage|browser\.storage/i, evidence: "storage permission/API evidence was detected." },
    { signal: "declarative-net-request", pattern: /declarativeNetRequest|declarative_net_request|rule_resources/i, evidence: "declarativeNetRequest evidence was detected." },
    { signal: "web-accessible-resources", pattern: /web_accessible_resources/i, evidence: "web accessible resources evidence was detected." },
    { signal: "content-security-policy", pattern: /content_security_policy|Content-Security-Policy|extension_pages/i, evidence: "content security policy evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "permission", "signal");
}

function browserExtensionMessagingSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["messagingSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["messagingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chrome-runtime", pattern: /chrome\.runtime/i, evidence: "chrome.runtime evidence was detected." },
    { signal: "browser-runtime", pattern: /browser\.runtime/i, evidence: "browser.runtime evidence was detected." },
    { signal: "send-message", pattern: /sendMessage|onMessage/i, evidence: "sendMessage/onMessage evidence was detected." },
    { signal: "runtime-connect", pattern: /runtime\.connect|onConnect|Port\b/i, evidence: "runtime port connection evidence was detected." },
    { signal: "tabs-message", pattern: /tabs\.sendMessage|chrome\.tabs|browser\.tabs/i, evidence: "tabs messaging evidence was detected." },
    { signal: "plasmo-messaging", pattern: /@plasmohq\/messaging|PlasmoMessaging|sendToBackground|relayMessage/i, evidence: "Plasmo messaging evidence was detected." },
    { signal: "wxt-messaging", pattern: /wxt\/utils\/messaging|defineExtensionMessaging|sendMessage\(/i, evidence: "WXT messaging evidence was detected." },
    { signal: "webextension-polyfill", pattern: /webextension-polyfill|browser\.runtime/i, evidence: "webextension-polyfill evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "messaging", "signal");
}

function browserExtensionBuildSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["buildSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["buildSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wxt-build", pattern: /wxt\s+(dev|build|zip|prepare)|npx wxt/i, evidence: "WXT build command evidence was detected." },
    { signal: "plasmo-build", pattern: /plasmo\s+(dev|build|package)|plasmo build|plasmo package/i, evidence: "Plasmo build command evidence was detected." },
    { signal: "vite-crx", pattern: /@crxjs\/vite-plugin|crx\(\s*{|vite build/i, evidence: "CRXJS/Vite build evidence was detected." },
    { signal: "web-ext", pattern: /web-ext\s+(run|build|lint|sign)|"web-ext"/i, evidence: "web-ext command evidence was detected." },
    { signal: "zip-artifact", pattern: /wxt\s+zip|\.zip|zip artifact|extension zip|upload-artifact/i, evidence: "zip artifact evidence was detected." },
    { signal: "watch-dev", pattern: /watch|dev|hmr|hot reload|reload extension/i, evidence: "dev watch evidence was detected." },
    { signal: "hmr", pattern: /HMR|hot module|hot reload|runtime reload/i, evidence: "HMR evidence was detected." },
    { signal: "typescript", pattern: /typescript|tsconfig|@types\/chrome|chrome-types/i, evidence: "TypeScript evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "build", "signal");
}

function browserExtensionPublishSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["publishSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["publishSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "chrome-web-store", pattern: /Chrome Web Store|chrome-webstore|chromewebstore|CWS|chrome store/i, evidence: "Chrome Web Store evidence was detected." },
    { signal: "firefox-addons", pattern: /addons\.mozilla|AMO|Firefox Add-ons|web-ext sign/i, evidence: "Firefox Add-ons evidence was detected." },
    { signal: "edge-addons", pattern: /Edge Add-ons|edgeaddons|Microsoft Edge Addons/i, evidence: "Edge Add-ons evidence was detected." },
    { signal: "plasmo-bpp", pattern: /bpp|Browser Platform Publisher|plasmo publish/i, evidence: "Plasmo BPP publication evidence was detected." },
    { signal: "wxt-submit", pattern: /wxt\s+submit|submit\.config|WXT.*submit/i, evidence: "WXT submit evidence was detected." },
    { signal: "web-ext-sign", pattern: /web-ext\s+sign|JWT issuer|JWT secret|AMO_JWT/i, evidence: "web-ext signing evidence was detected." },
    { signal: "release-action", pattern: /action-gh-release|upload-artifact|release.*zip|gh release upload/i, evidence: "release action evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "publish", "signal");
}

function browserExtensionPackageSignals(sourceFiles: BrowserExtensionSourceFile[]): BrowserExtensionReadinessReport["packageSignals"] {
  const specs: Array<{ signal: BrowserExtensionReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wxt", pattern: /"wxt"|from ['"]wxt|wxt\s+(dev|build|zip|submit)/i, evidence: "WXT package evidence was detected." },
    { signal: "plasmo", pattern: /"plasmo"|@plasmohq|plasmo\s+(dev|build|package|publish)/i, evidence: "Plasmo package evidence was detected." },
    { signal: "@crxjs/vite-plugin", pattern: /@crxjs\/vite-plugin|from ['"]@crxjs\/vite-plugin/i, evidence: "CRXJS package evidence was detected." },
    { signal: "webextension-polyfill", pattern: /webextension-polyfill/i, evidence: "webextension-polyfill evidence was detected." },
    { signal: "@types/chrome", pattern: /@types\/chrome/i, evidence: "@types/chrome evidence was detected." },
    { signal: "chrome-types", pattern: /chrome-types|@types\/chrome/i, evidence: "chrome-types evidence was detected." },
    { signal: "web-ext", pattern: /"web-ext"|web-ext\s+(run|build|sign|lint)/i, evidence: "web-ext package evidence was detected." },
    { signal: "extension-api", pattern: /chrome\.runtime|browser\.runtime|chrome\.tabs|browser\.tabs/i, evidence: "browser extension API evidence was detected." }
  ];
  return browserExtensionSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function browserExtensionSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: BrowserExtensionSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => {
      const haystack = `${source.filePath}\n${source.text}`;
      return spec.pattern.test(source.filePath) || spec.pattern.test(source.text) || spec.pattern.test(haystack);
    });
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/browser-extension-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
