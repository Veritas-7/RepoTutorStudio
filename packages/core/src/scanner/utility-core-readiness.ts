import type { DateTimeReadinessReport, FileUploadReadinessReport, IdGenerationReadinessReport, ImageProcessingReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDateTimeReadinessReport(walk: WalkResult): Promise<DateTimeReadinessReport> {
  const sourceFiles = await dateTimeReadinessSourceFiles(walk);
  const dateTimeSetups = dateTimeReadinessSetups(sourceFiles);
  const constructionSignals = dateTimeReadinessConstructionSignals(sourceFiles);
  const parsingSignals = dateTimeReadinessParsingSignals(sourceFiles);
  const formattingSignals = dateTimeReadinessFormattingSignals(sourceFiles);
  const zoneSignals = dateTimeReadinessZoneSignals(sourceFiles);
  const durationSignals = dateTimeReadinessDurationSignals(sourceFiles);
  const validitySignals = dateTimeReadinessValiditySignals(sourceFiles);
  const luxonSignals = dateTimeReadinessLuxonSignals(sourceFiles);
  const packageSignals = dateTimeReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasLuxonPackage = packageSignals.some((item) => item.signal === "luxon" && item.readiness === "ready");
  const hasSetup = dateTimeSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = dateTimeSetups.some((item) => item.readiness === "ready");
  const hasParser = parsingSignals.some((item) => item.readiness === "ready") || dateTimeSetups.some((item) => item.parseCount > 0);
  const hasFormat = formattingSignals.some((item) => item.readiness === "ready") || dateTimeSetups.some((item) => item.formatCount > 0);
  const hasZone = zoneSignals.some((item) => item.readiness === "ready") || dateTimeSetups.some((item) => item.zoneCount > 0);
  const hasMath = durationSignals.some((item) => item.readiness === "ready") || dateTimeSetups.some((item) => item.mathCount > 0);
  const hasValidity = validitySignals.some((item) => ["is-valid", "invalid-reason", "throw-on-invalid", "test-clock"].includes(item.signal) && item.readiness === "ready") || dateTimeSetups.some((item) => item.validityCount > 0);
  const hasLocaleFormat = formattingSignals.some((item) => item.signal === "to-locale-string" && item.readiness === "ready");

  const riskQueue: DateTimeReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the date/time handling strategy before claiming datetime readiness.",
      why: "Datetime readiness starts with explicit construction, parsing, formatting, zone, duration, validity, or package evidence.",
      relatedHref: "html/datetime-readiness.html"
    });
  }
  if (hasLuxonPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Luxon package evidence with concrete DateTime, Duration, Interval, zone, formatting, and validity call sites.",
      why: "A date library in dependencies does not prove that parsing, timezone behavior, display output, and invalid values are handled consistently.",
      relatedHref: "html/datetime-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && hasParser && !hasValidity) {
    riskQueue.push({
      priority: "high",
      action: "Check parsed dates with isValid, invalidReason, invalidExplanation, or deterministic failure tests.",
      why: "Date parsers can return invalid values for bad calendar units, unsupported zones, ambiguous formats, or environment-specific Intl behavior.",
      relatedHref: "html/datetime-readiness.html"
    });
  }
  if ((hasReadySetup || hasMath) && !hasZone) {
    riskQueue.push({
      priority: "medium",
      action: "Review zone policy for local/system/default/UTC/IANA/fixed-offset behavior before doing date math.",
      why: "Date math and start/end boundaries can change across DST and local timezone rules if zone policy is implicit.",
      relatedHref: "html/datetime-readiness.html"
    });
  }
  if (hasFormat && !hasLocaleFormat) {
    riskQueue.push({
      priority: "low",
      action: "Prefer toLocaleString or explicit locale/numbering/output calendar settings for human-facing dates.",
      why: "Token formats are useful for machine formats, but human output should usually use Intl-backed locale formatting.",
      relatedHref: "html/datetime-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run clock, timezone, locale, DST, and invalid-date tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not evaluate current time, parse dates, change process timezone, modify Luxon Settings, run timers, or run the analyzed project's tests.",
    relatedHref: "html/datetime-readiness.html"
  });

  return {
    summary: `Luxon식 datetime readiness report: setup ${dateTimeSetups.length}개, construction signal ${constructionSignals.length}개, parsing signal ${parsingSignals.length}개, zone signal ${zoneSignals.length}개, Luxon signal ${luxonSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "DateTime Duration Interval Zone setZone fromISO fromFormat fromJSDate toISO toFormat toLocaleString diff plus minus startOf endOf isValid invalidReason Settings defaultZone Info Settings IANAZone FixedOffsetZone InvalidZone SystemZone fromRFC2822 fromHTTP fromSQL fromFormatExplain keepLocalTime keepCalendarTime resolvedLocaleOptions outputCalendar numberingSystem toRelativeCalendar toHuman shiftTo normalize rescale splitBy mapEndpoints contains overlaps engulfs abuts Settings.now throwOnInvalid",
    dateTimeSetups,
    constructionSignals,
    parsingSignals,
    formattingSignals,
    zoneSignals,
    durationSignals,
    validitySignals,
    luxonSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"DateTime|Duration|Interval|new Date|Temporal|date-fns|dayjs|moment\" src app packages", purpose: "Inventory date/time libraries, native Date usage, and domain call sites." },
      { command: "rg \"fromISO|fromFormat|fromJSDate|fromMillis|fromSeconds|Date\\.parse|parseISO|parse\\(\" src app packages", purpose: "Review date parser call sites and accepted input formats." },
      { command: "rg \"setZone|zone|zoneName|toUTC|toLocal|defaultZone|timeZone|UTC|America/|Asia/|Europe/\" src app packages", purpose: "Check timezone, UTC/local, IANA, fixed-offset, and default-zone policy." },
      { command: "rg \"toISO|toFormat|toLocaleString|toRFC2822|toHTTP|toMillis|toSeconds|toRelative\" src app packages", purpose: "Inspect machine-readable and human-readable formatting output." },
      { command: "rg \"diff\\(|plus\\(|minus\\(|startOf\\(|endOf\\(|Duration|Interval|isValid|invalidReason|Settings\\.now\" src app packages test tests", purpose: "Review date math, intervals, validity checks, and deterministic clock tests." },
      { command: "rg \"Info\\.|Settings\\.|IANAZone|FixedOffsetZone|InvalidZone|SystemZone|fromRFC2822|fromHTTP|fromSQL|fromFormatExplain|keepLocalTime|keepCalendarTime|resolvedLocaleOptions|toRelativeCalendar|toHuman|shiftTo|normalize|rescale|splitBy|mapEndpoints|contains|overlaps|engulfs|abuts|throwOnInvalid\" src app packages test tests", purpose: "Map Luxon-specific settings, zones, parser explainers, locale output, duration conversion, interval relations, and invalid handling." },
      { command: "npx vitest run", purpose: "Run local tests that cover parsing, invalid dates, timezone/DST behavior, locale formatting, durations, and intervals." }
    ],
    learnerNextSteps: [
      "먼저 DateTime, Duration, Interval, new Date, Temporal, date-fns, dayjs, moment 사용 위치를 찾아 날짜 정책의 중심을 확인하세요.",
      "fromISO, fromFormat, Date.parse 같은 parser는 입력 형식과 timezone option, setZone 사용 여부를 함께 확인하세요.",
      "setZone, toUTC, toLocal, Settings.defaultZone, IANA zone 문자열을 보며 서버/클라이언트의 local time 의존성을 분리하세요.",
      "toISO는 API/저장용, toLocaleString은 사용자 표시용, toFormat은 특수 format용으로 나뉘는지 확인하세요.",
      "Luxon 프로젝트처럼 Info, Settings, Zone 클래스, Duration 변환, Interval 관계 신호를 분리해서 날짜 처리 정책의 깊이를 점검하세요.",
      "이 리포트는 정적 readiness입니다. 실제 clock, timezone, locale, DST, invalid date 동작은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type DateTimeReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dateTimeReadinessSourceFiles(walk: WalkResult): Promise<DateTimeReadinessSourceFile[]> {
  const files: DateTimeReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !dateTimeReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!dateTimeReadinessPathSignal(file.relPath) && !dateTimeReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function dateTimeReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return dateTimeReadinessPathSignal(filePath)
    || /^(package\.json|date\.[cm]?[jt]sx?|datetime\.[cm]?[jt]sx?|time\.[cm]?[jt]sx?|calendar\.[cm]?[jt]sx?|schedule\.[cm]?[jt]sx?|locale\.[cm]?[jt]sx?|timezone\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function dateTimeReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(date|dates|datetime|datetimes|time|times|timezone|timezones|zone|zones|duration|durations|interval|intervals|calendar|calendars|locale|locales|schedule|schedules)(\/|\.|-|_|$)/i.test(filePath);
}

function dateTimeReadinessContentSignal(text: string): boolean {
  return /(from ['"]luxon['"]|require\(['"]luxon['"]\)|DateTime\.|Duration\.|Interval\.|Info\.|Settings\.|IANAZone|FixedOffsetZone|InvalidZone|SystemZone|setZone|fromISO|fromFormat|fromJSDate|toISO|toFormat|toLocaleString|invalidReason|Settings\.defaultZone|new Date\s*\(|Date\.parse|Temporal\.|date-fns|dayjs|moment-timezone|moment\()/i.test(text);
}

function dateTimeReadinessSetups(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["dateTimeSetups"] {
  const rows: DateTimeReadinessReport["dateTimeSetups"] = [];
  for (const source of sourceFiles) {
    const dateTimeCount = countMatches(source.text, /DateTime\.|Duration\.|Interval\.|new Date\s*\(|Date\.now|Date\.parse|Temporal\.|dayjs\s*\(|moment\s*\(|parseISO|format\s*\(/gi);
    const parseCount = countMatches(source.text, /fromISO|fromFormat|fromRFC2822|fromHTTP|fromSQL|fromJSDate|fromMillis|fromSeconds|Date\.parse|parseISO|parseJSON|dayjs\s*\(|moment\s*\(/gi);
    const formatCount = countMatches(source.text, /toISO|toISODate|toISOTime|toFormat|toLocaleString|toRFC2822|toHTTP|toMillis|toSeconds|toUnixInteger|toRelative|format\s*\(/gi);
    const zoneCount = countMatches(source.text, /setZone|zoneName|zone\s*:|toUTC|toLocal|defaultZone|timeZone|UTC|IANA|FixedOffsetZone|keepLocalTime|isInDST|offsetName/gi);
    const mathCount = countMatches(source.text, /diff\s*\(|plus\s*\(|minus\s*\(|startOf\s*\(|endOf\s*\(|Duration\.|Interval\.|toRelative|until\s*\(|splitBy\s*\(/gi);
    const validityCount = countMatches(source.text, /isValid|invalidReason|invalidExplanation|throwOnInvalid|Invalid Date|isNaN|Settings\.now|fakeTimers|useFakeTimers/gi);
    const hasSetupSignal = dateTimeCount + parseCount + formatCount + zoneCount + mathCount + validityCount > 0 || /\b(date time|datetime|timezone|time zone|calendar|duration|interval)\b/i.test(source.text);
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: dateTimeReadinessProvider(source),
      dateTimeCount,
      parseCount,
      formatCount,
      zoneCount,
      mathCount,
      validityCount,
      readiness: dateTimeCount > 0 && (parseCount > 0 || formatCount > 0) && (zoneCount > 0 || validityCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains datetime ${dateTimeCount}, parse ${parseCount}, format ${formatCount}, zone ${zoneCount}, math ${mathCount}, validity/test-clock ${validityCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function dateTimeReadinessProvider(source: DateTimeReadinessSourceFile): DateTimeReadinessReport["dateTimeSetups"][number]["provider"] {
  if (/from ['"]luxon['"]|require\(['"]luxon['"]\)|DateTime\.|Duration\.|Interval\./i.test(source.text)) return "luxon";
  if (/from ['"]date-fns|require\(['"]date-fns|parseISO|formatDistance|date-fns/i.test(source.text)) return "date-fns";
  if (/from ['"]dayjs|require\(['"]dayjs|dayjs\s*\(/i.test(source.text)) return "dayjs";
  if (/moment-timezone/i.test(source.text)) return "moment";
  if (/from ['"]moment|require\(['"]moment|moment\s*\(/i.test(source.text)) return "moment";
  if (/Temporal\.|@js-temporal\/polyfill/i.test(source.text)) return "temporal";
  if (/new Date\s*\(|Date\.parse|Date\.now/i.test(source.text)) return "native-date";
  if (/\b(date time|datetime|timezone|time zone|calendar|duration|interval)\b/i.test(source.text)) return "custom";
  return "unknown";
}

function dateTimeReadinessConstructionSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["constructionSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["constructionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "now", pattern: /DateTime\.now\s*\(|Date\.now\s*\(|dayjs\s*\(\s*\)|moment\s*\(\s*\)|Temporal\.Now/i, evidence: "current-time construction evidence was detected." },
    { signal: "local", pattern: /DateTime\.local\s*\(|toLocal\s*\(|zone\s*:\s*['"]local|system/i, evidence: "local/system time construction evidence was detected." },
    { signal: "utc", pattern: /DateTime\.utc\s*\(|toUTC\s*\(|zone\s*:\s*['"]utc['"]|UTC/i, evidence: "UTC construction/conversion evidence was detected." },
    { signal: "from-js-date", pattern: /fromJSDate|new Date\s*\(|Date\.parse/i, evidence: "JS Date construction evidence was detected." },
    { signal: "from-millis-seconds", pattern: /fromMillis|fromSeconds|toMillis|toSeconds|unix|timestamp/i, evidence: "timestamp construction evidence was detected." },
    { signal: "from-object", pattern: /fromObject|DateTime\.local\s*\(\s*\d|Temporal\.(PlainDate|PlainDateTime|ZonedDateTime)\.from/i, evidence: "object/civil-time construction evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "construction", "signal");
}

function dateTimeReadinessParsingSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["parsingSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["parsingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "from-iso", pattern: /fromISO|parseISO|toISO/i, evidence: "ISO parsing evidence was detected." },
    { signal: "from-format", pattern: /fromFormat|fromFormatExplain|custom format|parseExact/i, evidence: "custom format parsing evidence was detected." },
    { signal: "from-rfc-http", pattern: /fromRFC2822|fromHTTP|toRFC2822|toHTTP/i, evidence: "RFC/HTTP date parsing evidence was detected." },
    { signal: "from-sql", pattern: /fromSQL|SQL date|sqlDate/i, evidence: "SQL date parsing evidence was detected." },
    { signal: "parse-debug", pattern: /fromFormatExplain|invalidReason|invalidExplanation|parseExplain/i, evidence: "parse debugging evidence was detected." },
    { signal: "native-parse", pattern: /Date\.parse|new Date\s*\([^)]*(string|input|value|date)|parseJSON/i, evidence: "native Date parser evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "parsing", "signal");
}

function dateTimeReadinessFormattingSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["formattingSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["formattingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "to-iso", pattern: /toISO|toISODate|toISOTime|toJSON/i, evidence: "ISO output evidence was detected." },
    { signal: "to-format", pattern: /toFormat|format\s*\(|formatISO|formatDistance/i, evidence: "token/custom format output evidence was detected." },
    { signal: "to-locale-string", pattern: /toLocaleString|Intl\.DateTimeFormat|setLocale|locale\s*:/i, evidence: "locale-aware output evidence was detected." },
    { signal: "to-rfc-http", pattern: /toRFC2822|toHTTP|fromRFC2822|fromHTTP/i, evidence: "RFC/HTTP output evidence was detected." },
    { signal: "unix-timestamp", pattern: /toMillis|toSeconds|toUnixInteger|valueOf\s*\(|getTime\s*\(/i, evidence: "timestamp output evidence was detected." },
    { signal: "relative-output", pattern: /toRelative|toRelativeCalendar|formatDistance|fromNow/i, evidence: "relative date output evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "formatting", "signal");
}

function dateTimeReadinessZoneSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["zoneSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["zoneSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "set-zone", pattern: /setZone|zone\s*:|timeZone\s*:/i, evidence: "explicit zone setting evidence was detected." },
    { signal: "utc-local", pattern: /toUTC|toLocal|DateTime\.utc|DateTime\.local|UTC|local zone|system zone/i, evidence: "UTC/local conversion evidence was detected." },
    { signal: "iana-zone", pattern: /America\/|Asia\/|Europe\/|IANAZone|IANA|zoneName/i, evidence: "IANA zone evidence was detected." },
    { signal: "fixed-offset", pattern: /FixedOffsetZone|UTC[+-]\\d|fixed offset|offsetName|offset\s*:/i, evidence: "fixed offset evidence was detected." },
    { signal: "default-zone", pattern: /Settings\.defaultZone|defaultZone|zone\s*:\s*['"]default/i, evidence: "default zone evidence was detected." },
    { signal: "keep-local-time", pattern: /keepLocalTime|keepCalendarTime/i, evidence: "keep-local-time zone conversion evidence was detected." },
    { signal: "dst-offset", pattern: /isInDST|offsetNameShort|offsetNameLong|DST|daylight saving|startOf\s*\(|endOf\s*\(/i, evidence: "DST/offset boundary evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "zone", "signal");
}

function dateTimeReadinessDurationSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["durationSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["durationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "duration", pattern: /Duration\.|fromDurationLike|toDuration|duration/i, evidence: "Duration evidence was detected." },
    { signal: "interval", pattern: /Interval\.|fromDateTimes|fromISO|splitBy|until\s*\(/i, evidence: "Interval evidence was detected." },
    { signal: "diff", pattern: /\.diff\s*\(|diffNow|differenceIn/i, evidence: "date difference evidence was detected." },
    { signal: "plus-minus", pattern: /\.plus\s*\(|\.minus\s*\(|add\s*\(|sub\s*\(/i, evidence: "date arithmetic evidence was detected." },
    { signal: "start-end-of", pattern: /\.startOf\s*\(|\.endOf\s*\(|startOfDay|endOfDay/i, evidence: "start/end boundary evidence was detected." },
    { signal: "relative", pattern: /toRelative|toRelativeCalendar|formatDistance|fromNow/i, evidence: "relative duration output evidence was detected." },
    { signal: "conversion-accuracy", pattern: /conversionAccuracy|shiftTo|normalize|rescale|casual|longterm/i, evidence: "duration conversion policy evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "duration", "signal");
}

function dateTimeReadinessValiditySignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["validitySignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["validitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "is-valid", pattern: /isValid|Number\.isNaN|isNaN|Invalid Date/i, evidence: "validity check evidence was detected." },
    { signal: "invalid-reason", pattern: /invalidReason|invalidExplanation|unsupported zone|out of range/i, evidence: "invalid reason evidence was detected." },
    { signal: "throw-on-invalid", pattern: /throwOnInvalid|Settings\.throwOnInvalid/i, evidence: "throw-on-invalid evidence was detected." },
    { signal: "invalid-duration", pattern: /Duration\.invalid|Invalid Duration|duration\.isValid/i, evidence: "invalid Duration evidence was detected." },
    { signal: "invalid-interval", pattern: /Interval\.invalid|Invalid Interval|interval\.isValid/i, evidence: "invalid Interval evidence was detected." },
    { signal: "test-clock", pattern: /Settings\.now|fakeTimers|useFakeTimers|setSystemTime|mockDate|timezone-mock|TZ=/i, evidence: "deterministic clock/timezone test evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "validity", "signal");
}

function dateTimeReadinessLuxonSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["luxonSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["luxonSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "datetime-class", pattern: /DateTime\./i, evidence: "Luxon DateTime class evidence was detected." },
    { signal: "duration-class", pattern: /Duration\./i, evidence: "Luxon Duration class evidence was detected." },
    { signal: "interval-class", pattern: /Interval\./i, evidence: "Luxon Interval class evidence was detected." },
    { signal: "info-class", pattern: /Info\./i, evidence: "Luxon Info locale helper evidence was detected." },
    { signal: "settings-class", pattern: /Settings\./i, evidence: "Luxon Settings evidence was detected." },
    { signal: "iana-zone", pattern: /IANAZone|America\/|Asia\/|Europe\//i, evidence: "IANA zone evidence was detected." },
    { signal: "fixed-offset-zone", pattern: /FixedOffsetZone|fixed offset|UTC[+-]\d/i, evidence: "Fixed offset zone evidence was detected." },
    { signal: "invalid-zone", pattern: /InvalidZone|unsupported zone|America\/Blorp/i, evidence: "Invalid zone evidence was detected." },
    { signal: "system-zone", pattern: /SystemZone|zone\s*:\s*["']system["']|setZone\(["']system["']\)/i, evidence: "System zone evidence was detected." },
    { signal: "from-rfc-http", pattern: /fromRFC2822|fromHTTP|toRFC2822|toHTTP/i, evidence: "RFC/HTTP parser or formatter evidence was detected." },
    { signal: "from-sql", pattern: /fromSQL/i, evidence: "SQL datetime parser evidence was detected." },
    { signal: "from-format-explain", pattern: /fromFormatExplain/i, evidence: "Format parser explainer evidence was detected." },
    { signal: "set-zone-option", pattern: /setZone\s*:\s*true|setZone\(/i, evidence: "Set-zone option or conversion evidence was detected." },
    { signal: "keep-local-time", pattern: /keepLocalTime/i, evidence: "keepLocalTime zone conversion evidence was detected." },
    { signal: "keep-calendar-time", pattern: /keepCalendarTime/i, evidence: "keepCalendarTime zone conversion evidence was detected." },
    { signal: "locale-output", pattern: /setLocale|locale\s*:|toLocaleString|Info\.(months|weekdays|eras)/i, evidence: "Locale-aware output evidence was detected." },
    { signal: "numbering-system", pattern: /numberingSystem|defaultNumberingSystem/i, evidence: "Numbering-system output policy evidence was detected." },
    { signal: "output-calendar", pattern: /outputCalendar|defaultOutputCalendar/i, evidence: "Output-calendar policy evidence was detected." },
    { signal: "resolved-locale-options", pattern: /resolvedLocaleOptions/i, evidence: "Resolved locale options evidence was detected." },
    { signal: "relative-calendar", pattern: /toRelativeCalendar/i, evidence: "Relative calendar output evidence was detected." },
    { signal: "duration-human", pattern: /toHuman/i, evidence: "Human-readable duration output evidence was detected." },
    { signal: "duration-shift", pattern: /shiftTo/i, evidence: "Duration unit shift evidence was detected." },
    { signal: "duration-normalize", pattern: /normalize/i, evidence: "Duration normalization evidence was detected." },
    { signal: "duration-rescale", pattern: /rescale/i, evidence: "Duration rescale evidence was detected." },
    { signal: "interval-contains", pattern: /\.contains\(/i, evidence: "Interval contains evidence was detected." },
    { signal: "interval-split", pattern: /splitBy/i, evidence: "Interval split evidence was detected." },
    { signal: "interval-map-endpoints", pattern: /mapEndpoints/i, evidence: "Interval endpoint mapping evidence was detected." },
    { signal: "interval-count", pattern: /\.count\(/i, evidence: "Interval count evidence was detected." },
    { signal: "interval-overlap", pattern: /overlaps/i, evidence: "Interval overlap evidence was detected." },
    { signal: "interval-engulf-abut", pattern: /engulfs|abuts/i, evidence: "Interval engulf/abut evidence was detected." },
    { signal: "has-same", pattern: /hasSame/i, evidence: "Luxon hasSame comparison evidence was detected." },
    { signal: "equals", pattern: /\.equals\(/i, evidence: "Luxon equals comparison evidence was detected." },
    { signal: "week-settings", pattern: /defaultWeekSettings|Info\.getStartOfWeek|Info\.getMinimumDaysInFirstWeek|Info\.getWeekendWeekdays/i, evidence: "Week-setting helper evidence was detected." },
    { signal: "local-week", pattern: /localWeek(?:day|Number|Year)|weeksInLocalWeekYear/i, evidence: "Local week calendar evidence was detected." },
    { signal: "settings-now", pattern: /Settings\.now/i, evidence: "Deterministic Luxon Settings.now evidence was detected." },
    { signal: "settings-throw-on-invalid", pattern: /Settings\.throwOnInvalid|throwOnInvalid/i, evidence: "Luxon throw-on-invalid setting evidence was detected." },
    { signal: "two-digit-cutoff-year", pattern: /twoDigitCutoffYear/i, evidence: "Two-digit cutoff year setting evidence was detected." },
    { signal: "zone-cache-reset", pattern: /IANAZone\.resetCache|DateTime\.resetCache|resetCaches?/i, evidence: "Luxon zone/cache reset evidence was detected." },
    { signal: "invalid-explanation", pattern: /invalidExplanation/i, evidence: "Invalid explanation evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "luxon", "signal");
}

function dateTimeReadinessPackageSignals(sourceFiles: DateTimeReadinessSourceFile[]): DateTimeReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DateTimeReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "luxon", pattern: /"luxon"|from ['"]luxon['"]|DateTime\.|Duration\.|Interval\./i, evidence: "Luxon package/import evidence was detected." },
    { signal: "date-fns", pattern: /"date-fns"|from ['"]date-fns|parseISO|formatDistance/i, evidence: "date-fns package/import evidence was detected." },
    { signal: "dayjs", pattern: /"dayjs"|from ['"]dayjs['"]|dayjs\s*\(/i, evidence: "Day.js package/import evidence was detected." },
    { signal: "moment", pattern: /"moment"|from ['"]moment['"]|moment\s*\(/i, evidence: "Moment package/import evidence was detected." },
    { signal: "moment-timezone", pattern: /"moment-timezone"|moment-timezone|moment\.tz/i, evidence: "Moment timezone package/import evidence was detected." },
    { signal: "@js-temporal/polyfill", pattern: /@js-temporal\/polyfill|Temporal\./i, evidence: "Temporal polyfill or Temporal API evidence was detected." }
  ];
  return dateTimeReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dateTimeReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DateTimeReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/datetime-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildIdGenerationReadinessReport(walk: WalkResult): Promise<IdGenerationReadinessReport> {
  const sourceFiles = await idGenerationReadinessSourceFiles(walk);
  const idGeneratorSetups = idGenerationReadinessSetups(sourceFiles);
  const generationSignals = idGenerationReadinessGenerationSignals(sourceFiles);
  const entropySignals = idGenerationReadinessEntropySignals(sourceFiles);
  const alphabetSignals = idGenerationReadinessAlphabetSignals(sourceFiles);
  const runtimeSignals = idGenerationReadinessRuntimeSignals(sourceFiles);
  const usageSignals = idGenerationReadinessUsageSignals(sourceFiles);
  const validationSignals = idGenerationReadinessValidationSignals(sourceFiles);
  const packageSignals = idGenerationReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasNanoidPackage = packageSignals.some((item) => item.signal === "nanoid" && item.readiness === "ready");
  const hasSetup = idGeneratorSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = idGeneratorSetups.some((item) => item.readiness === "ready");
  const hasSecureEntropy = entropySignals.some((item) => ["crypto-random-values", "node-crypto", "web-crypto"].includes(item.signal) && item.readiness === "ready") || idGeneratorSetups.some((item) => item.secureRandomCount > 0);
  const hasUnsafeEntropy = entropySignals.some((item) => ["math-random", "non-secure-import"].includes(item.signal) && item.readiness === "ready");
  const hasCustomAlphabet = alphabetSignals.some((item) => item.signal === "custom-alphabet" && item.readiness === "ready") || idGeneratorSetups.some((item) => item.customAlphabetCount > 0);
  const hasLengthOverride = alphabetSignals.some((item) => item.signal === "length-override" && item.readiness === "ready") || generationSignals.some((item) => item.signal === "sized-nanoid" && item.readiness === "ready");
  const hasReactKeyRisk = usageSignals.some((item) => item.signal === "react-key" && item.readiness === "ready") || idGeneratorSetups.some((item) => item.usageRiskCount > 0);
  const hasValidation = validationSignals.some((item) => ["positive-size", "collision-tests", "uniqueness-tests", "distribution-tests"].includes(item.signal) && item.readiness === "ready") || idGeneratorSetups.some((item) => item.validationCount > 0);

  const riskQueue: IdGenerationReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the ID generation strategy before claiming ID readiness.",
      why: "ID readiness starts with explicit generator, entropy source, alphabet/size, usage, or package evidence.",
      relatedHref: "html/id-generation-readiness.html"
    });
  }
  if (hasNanoidPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Nano ID package evidence with concrete nanoid, customAlphabet, customRandom, size, and usage call sites.",
      why: "A dependency alone does not prove IDs are generated consistently or safely in the application paths that need them.",
      relatedHref: "html/id-generation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && hasUnsafeEntropy && !hasSecureEntropy) {
    riskQueue.push({
      priority: "high",
      action: "Review Math.random or nanoid/non-secure usage before using generated IDs for security-sensitive or collision-sensitive data.",
      why: "Nano ID distinguishes secure hardware random bytes from non-secure predictable random generation.",
      relatedHref: "html/id-generation-readiness.html"
    });
  }
  if ((hasReadySetup || hasCustomAlphabet) && !hasLengthOverride) {
    riskQueue.push({
      priority: "medium",
      action: "Record the intended ID size and collision budget for each custom alphabet.",
      why: "Changing alphabet or size changes collision probability and brute-force characteristics.",
      relatedHref: "html/id-generation-readiness.html"
    });
  }
  if (hasReactKeyRisk) {
    riskQueue.push({
      priority: "medium",
      action: "Avoid generating React keys during render unless the value is stable across renders.",
      why: "Nano ID documentation calls out React key usage as a stability risk when generated inline.",
      relatedHref: "html/id-generation-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasValidation) {
    riskQueue.push({
      priority: "low",
      action: "Add tests for positive size handling, uniqueness/collision assumptions, and custom alphabet boundaries.",
      why: "ID generation bugs often come from size parsing, alphabet changes, non-secure fallbacks, and missing uniqueness checks.",
      relatedHref: "html/id-generation-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run collision, distribution, size, and integration tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not generate IDs, call crypto or Math.random, run CLI generators, mutate stores, or run the analyzed project's tests.",
    relatedHref: "html/id-generation-readiness.html"
  });

  return {
    summary: `Nano ID-style ID generation readiness report: setup ${idGeneratorSetups.length}개, generation signal ${generationSignals.length}개, entropy signal ${entropySignals.length}개, usage signal ${usageSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "nanoid customAlphabet customRandom urlAlphabet random nanoid/non-secure crypto.getRandomValues Math.random --size --alphabet react-native-get-random-values",
    idGeneratorSetups,
    generationSignals,
    entropySignals,
    alphabetSignals,
    runtimeSignals,
    usageSignals,
    validationSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"nanoid|customAlphabet|customRandom|randomUUID|uuidv4|createId|ulid\" src app packages", purpose: "Inventory ID generation libraries and call sites." },
      { command: "rg \"nanoid/non-secure|Math\\.random|crypto\\.getRandomValues|randomBytes|randomUUID\" src app packages", purpose: "Review entropy sources and non-secure fallbacks." },
      { command: "rg \"customAlphabet|urlAlphabet|--alphabet|--size|nanoid\\([0-9]|nanoid\\(.*size\" src app packages", purpose: "Check custom alphabet and ID length decisions." },
      { command: "rg \"key=\\{nanoid|key=\\{.*random|model\\.id|user\\.id|_id|slug|publicUrl\" src app packages", purpose: "Find generated ID usage sites and React key stability risks." },
      { command: "rg \"collision|unique|duplicate|distribution|positive integer|Size must be|alphabet.*size\" test tests src app packages", purpose: "Find tests and guards for ID size, uniqueness, and alphabet behavior." },
      { command: "npx vitest run", purpose: "Run local tests that cover ID generation, collision assumptions, size parsing, custom alphabets, and render stability." }
    ],
    learnerNextSteps: [
      "먼저 nanoid, customAlphabet, customRandom, randomUUID, uuid, cuid2, ulid 사용 위치를 찾아 ID 생성의 중심을 확인하세요.",
      "nanoid/non-secure와 Math.random은 보안/충돌 민감 경로에 쓰였는지 별도로 확인하세요.",
      "customAlphabet이나 size override가 있으면 collision probability 계산 근거와 길이 정책을 함께 기록하세요.",
      "React key에 inline generator가 쓰였으면 렌더마다 값이 바뀌는지 확인하고 안정적인 데이터 ID로 바꾸는 방안을 검토하세요.",
      "이 리포트는 정적 readiness입니다. 실제 collision, distribution, uniqueness, size parsing 동작은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type IdGenerationReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function idGenerationReadinessSourceFiles(walk: WalkResult): Promise<IdGenerationReadinessSourceFile[]> {
  const files: IdGenerationReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !idGenerationReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!idGenerationReadinessPathSignal(file.relPath) && !idGenerationReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function idGenerationReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return idGenerationReadinessPathSignal(filePath)
    || /^(package\.json|id\.[cm]?[jt]sx?|ids\.[cm]?[jt]sx?|identifier\.[cm]?[jt]sx?|slug\.[cm]?[jt]sx?|random\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|env|toml)$/i.test(filePath);
}

function idGenerationReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(id|ids|identifier|identifiers|nanoid|uuid|cuid|ulid|slug|slugs|random|randomness|entropy)(\/|\.|-|_|$)/i.test(filePath);
}

function idGenerationReadinessContentSignal(text: string): boolean {
  return /(from ['"]nanoid|require\(['"]nanoid|nanoid\s*\(|customAlphabet|customRandom|urlAlphabet|nanoid\/non-secure|randomUUID|uuidv4|crypto\.getRandomValues|randomBytes|Math\.random|react-native-get-random-values|@paralleldrive\/cuid2|createId\s*\(|ulid\s*\()/i.test(text);
}

function idGenerationReadinessSetups(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["idGeneratorSetups"] {
  const rows: IdGenerationReadinessReport["idGeneratorSetups"] = [];
  for (const source of sourceFiles) {
    const generatorCount = countMatches(source.text, /nanoid\s*\(|customAlphabet\s*\(|customRandom\s*\(|randomUUID\s*\(|uuidv4\s*\(|v4\s*\(|createId\s*\(|ulid\s*\(/gi);
    const secureRandomCount = countMatches(source.text, /crypto\.getRandomValues|randomBytes|randomUUID|random\s*\(|node:crypto|from ['"]crypto['"]/gi);
    const customAlphabetCount = countMatches(source.text, /customAlphabet|urlAlphabet|--alphabet|alphabet\s*[:=]/gi);
    const customRandomCount = countMatches(source.text, /customRandom|seedrandom|random\s*=>|randomBytes|Math\.random/gi);
    const validationCount = countMatches(source.text, /collision|unique|duplicate|distribution|positive integer|Size must be|alphabet.*size|toHaveLength|length\s*===|\.length\)/gi);
    const usageRiskCount = countMatches(source.text, /key=\{[^}\n]*(nanoid|random|uuid|createId)|<li key=\{nanoid|React\.|useId|mock.*nanoid/gi);
    const hasSetupSignal = generatorCount + secureRandomCount + customAlphabetCount + customRandomCount + validationCount + usageRiskCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: idGenerationReadinessProvider(source),
      generatorCount,
      secureRandomCount,
      customAlphabetCount,
      customRandomCount,
      validationCount,
      usageRiskCount,
      readiness: generatorCount > 0 && (secureRandomCount > 0 || customAlphabetCount > 0 || validationCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains generator ${generatorCount}, secure-random ${secureRandomCount}, custom alphabet ${customAlphabetCount}, custom random ${customRandomCount}, validation/test ${validationCount}, usage-risk ${usageRiskCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function idGenerationReadinessProvider(source: IdGenerationReadinessSourceFile): IdGenerationReadinessReport["idGeneratorSetups"][number]["provider"] {
  if (/from ['"]nanoid|require\(['"]nanoid|nanoid\s*\(|customAlphabet|customRandom|urlAlphabet/i.test(source.text)) return "nanoid";
  if (/@paralleldrive\/cuid2|createId\s*\(/i.test(source.text)) return "cuid2";
  if (/from ['"]ulid|require\(['"]ulid|ulid\s*\(/i.test(source.text)) return "ulid";
  if (/from ['"]uuid|require\(['"]uuid|uuidv4|v4\s*\(/i.test(source.text)) return "uuid";
  if (/randomUUID|crypto\.randomUUID/i.test(source.text)) return "crypto-randomuuid";
  if (/Math\.random|randomBytes|crypto\.getRandomValues|random id|generated id/i.test(source.text)) return "custom";
  return "unknown";
}

function idGenerationReadinessGenerationSignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["generationSignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["generationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "default-nanoid", pattern: /nanoid\s*\(\s*\)|import\s*\{\s*nanoid\s*\}\s*from ['"]nanoid['"]/i, evidence: "default Nano ID generation evidence was detected." },
    { signal: "sized-nanoid", pattern: /nanoid\s*\(\s*\d+|nanoid\s*\([^)]*size|--size|-s\s+\d/i, evidence: "sized ID generation evidence was detected." },
    { signal: "custom-alphabet", pattern: /customAlphabet|--alphabet|-a\s+|alphabet\s*[:=]/i, evidence: "custom alphabet generation evidence was detected." },
    { signal: "custom-random", pattern: /customRandom|seedrandom|random\s*=>|randomByte/i, evidence: "custom random generator evidence was detected." },
    { signal: "url-alphabet", pattern: /urlAlphabet|URL-friendly|url safe|A-Za-z0-9_-/i, evidence: "URL-safe alphabet evidence was detected." },
    { signal: "random-bytes", pattern: /random\s*\(|crypto\.getRandomValues|randomBytes|Uint8Array/i, evidence: "random bytes generation evidence was detected." },
    { signal: "cli-generation", pattern: /npx nanoid|bin\/nanoid|--size|--alphabet|\$ nanoid/i, evidence: "CLI ID generation evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "generation", "signal");
}

function idGenerationReadinessEntropySignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["entropySignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["entropySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "crypto-random-values", pattern: /crypto\.getRandomValues|getRandomValues/i, evidence: "crypto.getRandomValues evidence was detected." },
    { signal: "node-crypto", pattern: /node:crypto|from ['"]crypto['"]|randomBytes|randomUUID/i, evidence: "Node crypto evidence was detected." },
    { signal: "web-crypto", pattern: /Web Crypto|globalThis\.crypto|window\.crypto|crypto\.getRandomValues/i, evidence: "Web Crypto evidence was detected." },
    { signal: "math-random", pattern: /Math\.random/i, evidence: "Math.random evidence was detected." },
    { signal: "non-secure-import", pattern: /nanoid\/non-secure|non-secure/i, evidence: "Nano ID non-secure import evidence was detected." },
    { signal: "collision-calculator", pattern: /collision probability|nanoid.*calculator|zelark\.github\.io\/nano-id-cc|collision/i, evidence: "collision probability evidence was detected." },
    { signal: "uniformity", pattern: /uniformity|distribution|random % alphabet|brute-forc/i, evidence: "uniformity or distribution evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "entropy", "signal");
}

function idGenerationReadinessAlphabetSignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["alphabetSignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["alphabetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "url-safe", pattern: /urlAlphabet|URL-friendly|url safe|A-Za-z0-9_-/i, evidence: "URL-safe alphabet evidence was detected." },
    { signal: "custom-alphabet", pattern: /customAlphabet|--alphabet|-a\s+|alphabet\s*[:=]/i, evidence: "custom alphabet evidence was detected." },
    { signal: "alphabet-size-limit", pattern: /256 symbols|alphabet.*256|Alphabet must contain/i, evidence: "alphabet size limit evidence was detected." },
    { signal: "dictionary", pattern: /nanoid-dictionary|dictionary|alphabet options/i, evidence: "alphabet dictionary evidence was detected." },
    { signal: "prefix-suffix", pattern: /prefix|suffix|slug|_id\s*:\s*['"][^'"]*\s*\+|['"][^'"]*\s*\+\s*nanoid/i, evidence: "ID prefix, suffix, or slug evidence was detected." },
    { signal: "length-override", pattern: /nanoid\s*\(\s*\d+|customAlphabet\s*\([^)]*,\s*\d+|--size|-s\s+\d/i, evidence: "ID length override evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "alphabet", "signal");
}

function idGenerationReadinessRuntimeSignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "esm-import", pattern: /import\s+\{[^}]*nanoid|from ['"]nanoid['"]|type\s*:\s*['"]module['"]/i, evidence: "ESM Nano ID import evidence was detected." },
    { signal: "dynamic-import", pattern: /import\(['"]nanoid['"]\)|await import\(['"]nanoid['"]\)/i, evidence: "dynamic import evidence was detected." },
    { signal: "commonjs-require", pattern: /require\(['"]nanoid['"]\)|module\.exports|CommonJS/i, evidence: "CommonJS usage evidence was detected." },
    { signal: "browser", pattern: /index\.browser|window\.crypto|globalThis\.crypto|browser/i, evidence: "browser runtime evidence was detected." },
    { signal: "react-native-random-values", pattern: /react-native-get-random-values|getRandomValues/i, evidence: "React Native random values evidence was detected." },
    { signal: "deno-jsr", pattern: /@sitnik\/nanoid|jsr:@sitnik\/nanoid|deno add|Deno|JSR/i, evidence: "Deno/JSR runtime evidence was detected." },
    { signal: "cli", pattern: /npx nanoid|\$ nanoid|bin\/nanoid|--help|--version/i, evidence: "CLI runtime evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function idGenerationReadinessUsageSignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["usageSignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["usageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "model-id", pattern: /model\.id|entity\.id|item\.id|id\s*=\s*nanoid|id:\s*nanoid/i, evidence: "model/entity ID usage evidence was detected." },
    { signal: "database-id", pattern: /_id|primary key|database|db\.|insert|create.*id|id\s+string/i, evidence: "database ID usage evidence was detected." },
    { signal: "react-key", pattern: /key=\{[^}\n]*(nanoid|random|uuid|createId)|<li key=\{nanoid/i, evidence: "React key generation evidence was detected." },
    { signal: "mock-id", pattern: /mock.*nanoid|factory.*id|faker|test.*id|fixture.*id/i, evidence: "mock/test ID usage evidence was detected." },
    { signal: "branded-type", pattern: /nanoid<|Type extends string|opaque|brand|Branded|UserId|OrderId/i, evidence: "typed/branded ID evidence was detected." },
    { signal: "public-url", pattern: /slug|publicUrl|share.*id|invite.*id|url.*id|route.*id/i, evidence: "public URL or slug ID evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "usage", "signal");
}

function idGenerationReadinessValidationSignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["validationSignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["validationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "positive-size", pattern: /Size must be positive integer|size\s*<=\s*0|Number\.isNaN\(size\)|positive integer/i, evidence: "positive size guard evidence was detected." },
    { signal: "alphabet-required-with-size", pattern: /alphabet.*size|--alphabet.*--size|size.*alphabet|customAlphabet\([^)]*,\s*\d+/i, evidence: "alphabet and size coupling evidence was detected." },
    { signal: "collision-tests", pattern: /collision|duplicate|no collisions|Set\(|unique/i, evidence: "collision/duplicate test evidence was detected." },
    { signal: "uniqueness-tests", pattern: /unique ID|unique.*id|toBeUnique|not\.toEqual|notEqual|notStrictEqual/i, evidence: "uniqueness test evidence was detected." },
    { signal: "distribution-tests", pattern: /distribution|uniformity|random % alphabet|chars\.length|urlAlphabet\.length/i, evidence: "distribution/uniformity test evidence was detected." },
    { signal: "type-tests", pattern: /nanoid<|Type extends string|expectType|tsd|branded|opaque/i, evidence: "typed ID evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "validation", "signal");
}

function idGenerationReadinessPackageSignals(sourceFiles: IdGenerationReadinessSourceFile[]): IdGenerationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: IdGenerationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "nanoid", pattern: /"nanoid"|from ['"]nanoid|require\(['"]nanoid|nanoid\s*\(/i, evidence: "Nano ID package/import evidence was detected." },
    { signal: "uuid", pattern: /"uuid"|from ['"]uuid|require\(['"]uuid|uuidv4|randomUUID/i, evidence: "uuid package/import evidence was detected." },
    { signal: "@paralleldrive/cuid2", pattern: /@paralleldrive\/cuid2|createId\s*\(/i, evidence: "cuid2 package/import evidence was detected." },
    { signal: "ulid", pattern: /"ulid"|from ['"]ulid|require\(['"]ulid|ulid\s*\(/i, evidence: "ULID package/import evidence was detected." },
    { signal: "react-native-get-random-values", pattern: /react-native-get-random-values/i, evidence: "React Native random values package/import evidence was detected." }
  ];
  return idGenerationReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function idGenerationReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: IdGenerationReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/id-generation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildImageProcessingReadinessReport(walk: WalkResult): Promise<ImageProcessingReadinessReport> {
  const sourceFiles = await imageProcessingReadinessSourceFiles(walk);
  const imageProcessingSetups = imageProcessingReadinessSetups(sourceFiles);
  const inputSignals = imageProcessingReadinessInputSignals(sourceFiles);
  const transformSignals = imageProcessingReadinessTransformSignals(sourceFiles);
  const outputSignals = imageProcessingReadinessOutputSignals(sourceFiles);
  const safetySignals = imageProcessingReadinessSafetySignals(sourceFiles);
  const performanceSignals = imageProcessingReadinessPerformanceSignals(sourceFiles);
  const packageSignals = imageProcessingReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasSharpPackage = packageSignals.some((item) => item.signal === "sharp" && item.readiness === "ready");
  const hasSetup = imageProcessingSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = imageProcessingSetups.some((item) => item.readiness === "ready");
  const hasOutput = outputSignals.some((item) => ["to-file", "to-buffer"].includes(item.signal) && item.readiness === "ready") || imageProcessingSetups.some((item) => item.outputCount > 0);
  const hasResize = transformSignals.some((item) => item.signal === "resize" && item.readiness === "ready") || imageProcessingSetups.some((item) => item.resizeCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || imageProcessingSetups.some((item) => item.safetyCount > 0);
  const hasPerformance = performanceSignals.some((item) => item.readiness === "ready");

  const riskQueue: ImageProcessingReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the image processing strategy before claiming image readiness.",
      why: "Image readiness starts with explicit input, transform, output, safety, performance, or package evidence.",
      relatedHref: "html/image-processing-readiness.html"
    });
  }
  if (hasSharpPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Sharp package evidence with concrete sharp(), resize, format, metadata, output, and safety call sites.",
      why: "A native image dependency alone does not prove that transforms, output formats, or input limits are handled in application paths.",
      relatedHref: "html/image-processing-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && hasResize && !hasSafety) {
    riskQueue.push({
      priority: "high",
      action: "Review input limits, failOn policy, timeout, and enlargement controls before resizing untrusted images.",
      why: "Image pipelines can be exposed to oversized, corrupt, animated, or hostile files if safety controls are implicit.",
      relatedHref: "html/image-processing-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasOutput) {
    riskQueue.push({
      priority: "medium",
      action: "Add explicit toFile or toBuffer output handling and error paths.",
      why: "Transform chains need a terminal output and observable failures to be operationally useful.",
      relatedHref: "html/image-processing-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasPerformance) {
    riskQueue.push({
      priority: "low",
      action: "Consider cache, concurrency, stream pipeline, clone, and libvips deployment checks for production image workloads.",
      why: "Image processing can be CPU, memory, and native-binary sensitive even when the API calls are correct.",
      relatedHref: "html/image-processing-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative image conversion tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not decode images, load native binaries, transform pixels, read image metadata, write output files, or run the analyzed project's tests.",
    relatedHref: "html/image-processing-readiness.html"
  });

  return {
    summary: `Sharp-style image processing readiness report: setup ${imageProcessingSetups.length}개, input signal ${inputSignals.length}개, transform signal ${transformSignals.length}개, safety signal ${safetySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "sharp resize toFormat jpeg png webp avif metadata rotate composite pipeline stream toBuffer toFile cache concurrency limitInputPixels",
    imageProcessingSetups,
    inputSignals,
    transformSignals,
    outputSignals,
    safetySignals,
    performanceSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"sharp\\(|Jimp|imagemin|Image\\(|createCanvas|resize\\(|toBuffer\\(|toFile\\(\" src app packages", purpose: "Inventory image processing libraries, transform chains, and output terminals." },
      { command: "rg \"metadata\\(|limitInputPixels|failOn|timeout|withoutEnlargement|sequentialRead|animated|density\" src app packages test tests", purpose: "Review image input metadata, safety limits, animated input, and read policy." },
      { command: "rg \"jpeg\\(|png\\(|webp\\(|avif\\(|gif\\(|tiff\\(|toFormat|withMetadata|keepMetadata\" src app packages", purpose: "Inspect output format, quality, metadata retention, and color profile decisions." },
      { command: "rg \"cache\\(|concurrency\\(|pipeline\\(|pipe\\(|clone\\(|libvips|@img/sharp\" src app packages package.json", purpose: "Check performance, streaming, native binary, and deployment readiness." },
      { command: "npx vitest run", purpose: "Run local tests that cover representative image inputs, transforms, output formats, safety limits, and error paths." }
    ],
    learnerNextSteps: [
      "먼저 sharp(), resize(), toBuffer(), toFile(), toFormat() 호출 위치를 찾아 이미지 pipeline의 시작과 끝을 확인하세요.",
      "limitInputPixels, failOn, timeout, withoutEnlargement, sequentialRead 같은 safety option이 untrusted image 경로에 있는지 확인하세요.",
      "jpeg, png, webp, avif, gif, tiff 출력은 품질, metadata retention, ICC/EXIF 정책과 함께 확인하세요.",
      "stream, pipeline, clone, cache, concurrency, libvips/native package 신호를 보며 운영 환경의 CPU/메모리/native binary 리스크를 분리하세요.",
      "이 리포트는 정적 readiness입니다. 실제 이미지 decoding, 변환, metadata, 파일 출력은 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type ImageProcessingReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function imageProcessingReadinessSourceFiles(walk: WalkResult): Promise<ImageProcessingReadinessSourceFile[]> {
  const files: ImageProcessingReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !imageProcessingReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!imageProcessingReadinessPathSignal(file.relPath) && !imageProcessingReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function imageProcessingReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return imageProcessingReadinessPathSignal(filePath)
    || /^(package\.json|image\.[cm]?[jt]sx?|images\.[cm]?[jt]sx?|thumbnail\.[cm]?[jt]sx?|media\.[cm]?[jt]sx?|upload\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function imageProcessingReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(image|images|img|media|asset|assets|thumbnail|thumbnails|picture|photo|photos|sharp|jimp|resize|upload|uploads)(\/|\.|-|_|$)/i.test(filePath);
}

function imageProcessingReadinessContentSignal(text: string): boolean {
  return /(from ['"]sharp|require\(['"]sharp|sharp\s*\(|\.resize\s*\(|\.toFormat\s*\(|\.toBuffer\s*\(|\.toFile\s*\(|\.metadata\s*\(|limitInputPixels|withoutEnlargement|imagemin|Jimp|createCanvas|ImageData)/i.test(text);
}

function imageProcessingReadinessSetups(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["imageProcessingSetups"] {
  const rows: ImageProcessingReadinessReport["imageProcessingSetups"] = [];
  for (const source of sourceFiles) {
    const pipelineCount = countMatches(source.text, /sharp\s*\(|Jimp\.|imagemin\s*\(|pipeline\s*\(|pipe\s*\(|createCanvas\s*\(/gi);
    const resizeCount = countMatches(source.text, /\.resize\s*\(|resize\s*[:=]|thumbnail|width\s*[:=]|height\s*[:=]|fit\s*:/gi);
    const formatCount = countMatches(source.text, /\.toFormat\s*\(|\.jpeg\s*\(|\.png\s*\(|\.webp\s*\(|\.avif\s*\(|\.gif\s*\(|\.tiff\s*\(|format\s*:/gi);
    const metadataCount = countMatches(source.text, /\.metadata\s*\(|withMetadata|keepMetadata|EXIF|ICC|xmp|density|orientation/gi);
    const outputCount = countMatches(source.text, /\.toBuffer\s*\(|\.toFile\s*\(|createWriteStream|writeFile|pipe\s*\(/gi);
    const safetyCount = countMatches(source.text, /limitInputPixels|failOn|timeout|withoutEnlargement|withoutReduction|sequentialRead|animated|error\s*=>|catch\s*\(/gi);
    const hasSetupSignal = pipelineCount + resizeCount + formatCount + metadataCount + outputCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: imageProcessingReadinessProvider(source),
      pipelineCount,
      resizeCount,
      formatCount,
      metadataCount,
      outputCount,
      safetyCount,
      readiness: pipelineCount > 0 && outputCount > 0 && (resizeCount > 0 || formatCount > 0) ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains pipeline ${pipelineCount}, resize ${resizeCount}, format ${formatCount}, metadata ${metadataCount}, output ${outputCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function imageProcessingReadinessProvider(source: ImageProcessingReadinessSourceFile): ImageProcessingReadinessReport["imageProcessingSetups"][number]["provider"] {
  if (/from ['"]sharp|require\(['"]sharp|sharp\s*\(/i.test(source.text)) return "sharp";
  if (/from ['"]jimp|require\(['"]jimp|Jimp\./i.test(source.text)) return "jimp";
  if (/from ['"]imagemin|require\(['"]imagemin|imagemin\s*\(/i.test(source.text)) return "imagemin";
  if (/image-js|from ['"]image-js|Image\.load/i.test(source.text)) return "image-js";
  if (/canvas|createCanvas|ImageData/i.test(source.text)) return "canvas";
  if (/resize|thumbnail|image processing|transform image/i.test(source.text)) return "custom";
  return "unknown";
}

function imageProcessingReadinessInputSignals(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["inputSignals"] {
  const specs: Array<{ signal: ImageProcessingReadinessReport["inputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "file-input", pattern: /sharp\s*\(\s*['"`]|createReadStream|input\.(jpg|jpeg|png|webp|gif|tiff|avif)/i, evidence: "file input evidence was detected." },
    { signal: "buffer-input", pattern: /Buffer\.|inputBuffer|toBuffer|Uint8Array|ArrayBuffer/i, evidence: "Buffer or typed-array input evidence was detected." },
    { signal: "stream-input", pattern: /\.pipe\s*\(|pipeline\s*\(|readableStream|writableStream|createReadStream/i, evidence: "stream input evidence was detected." },
    { signal: "raw-create", pattern: /sharp\s*\(\s*\{|create\s*:|raw\s*:|channels\s*:/i, evidence: "raw/create input evidence was detected." },
    { signal: "animated-pages", pattern: /animated\s*:|pages\s*:|pageHeight|gif|multi-page/i, evidence: "animated or multi-page input evidence was detected." },
    { signal: "density", pattern: /density\s*:|dpi|resolutionUnit|EXIF|orientation/i, evidence: "density or orientation input evidence was detected." }
  ];
  return imageProcessingReadinessSignalFromSpecs(sourceFiles, specs, "input", "signal");
}

function imageProcessingReadinessTransformSignals(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["transformSignals"] {
  const specs: Array<{ signal: ImageProcessingReadinessReport["transformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "resize", pattern: /\.resize\s*\(|fit\s*:|cover|contain|inside|outside|withoutEnlargement/i, evidence: "resize evidence was detected." },
    { signal: "rotate", pattern: /\.rotate\s*\(|auto-orientation|orientation/i, evidence: "rotation/orientation evidence was detected." },
    { signal: "extract", pattern: /\.extract\s*\(|left\s*:|top\s*:|region|crop/i, evidence: "extract/crop evidence was detected." },
    { signal: "composite", pattern: /\.composite\s*\(|overlay|gravity|blend/i, evidence: "composite evidence was detected." },
    { signal: "trim", pattern: /\.trim\s*\(|threshold|lineArt/i, evidence: "trim evidence was detected." },
    { signal: "effects", pattern: /\.blur\s*\(|\.sharpen\s*\(|\.negate\s*\(|\.flatten\s*\(|\.gamma\s*\(|\.clahe\s*\(/i, evidence: "image effect evidence was detected." },
    { signal: "colourspace", pattern: /colourspace|colorspace|ICC|pipelineColourspace|toColourspace|ensureAlpha|extractChannel/i, evidence: "colourspace/channel evidence was detected." }
  ];
  return imageProcessingReadinessSignalFromSpecs(sourceFiles, specs, "transform", "signal");
}

function imageProcessingReadinessOutputSignals(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["outputSignals"] {
  const specs: Array<{ signal: ImageProcessingReadinessReport["outputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "to-file", pattern: /\.toFile\s*\(|writeFile|createWriteStream/i, evidence: "file output evidence was detected." },
    { signal: "to-buffer", pattern: /\.toBuffer\s*\(|resolveWithObject|Buffer/i, evidence: "buffer output evidence was detected." },
    { signal: "jpeg", pattern: /\.jpeg\s*\(|toFormat\s*\(\s*['"]jpe?g|mozjpeg|chromaSubsampling/i, evidence: "JPEG output evidence was detected." },
    { signal: "png", pattern: /\.png\s*\(|toFormat\s*\(\s*['"]png|compressionLevel|dither/i, evidence: "PNG output evidence was detected." },
    { signal: "webp-avif", pattern: /\.webp\s*\(|\.avif\s*\(|toFormat\s*\(\s*['"](webp|avif)|effort|lossless/i, evidence: "WebP/AVIF output evidence was detected." },
    { signal: "tiff-gif", pattern: /\.tiff\s*\(|\.gif\s*\(|toFormat\s*\(\s*['"](tiff|tif|gif)|animated/i, evidence: "TIFF/GIF output evidence was detected." },
    { signal: "metadata-output", pattern: /withMetadata|keepMetadata|metadata\(\)|EXIF|ICC|XMP|IPTC/i, evidence: "metadata output evidence was detected." }
  ];
  return imageProcessingReadinessSignalFromSpecs(sourceFiles, specs, "output", "signal");
}

function imageProcessingReadinessSafetySignals(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["safetySignals"] {
  const specs: Array<{ signal: ImageProcessingReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "limit-input-pixels", pattern: /limitInputPixels|unlimited\s*:/i, evidence: "input pixel limit evidence was detected." },
    { signal: "fail-on", pattern: /failOn\s*:|truncated|warning|unsupported image format/i, evidence: "failOn/corrupt input policy evidence was detected." },
    { signal: "timeout", pattern: /\.timeout\s*\(|timeout\s*:/i, evidence: "processing timeout evidence was detected." },
    { signal: "without-enlargement", pattern: /withoutEnlargement|withoutReduction/i, evidence: "resize enlargement/reduction guard evidence was detected." },
    { signal: "sequential-read", pattern: /sequentialRead|sequential read/i, evidence: "sequential read policy evidence was detected." },
    { signal: "error-handling", pattern: /catch\s*\(|err\s*=>|error\s*=>|on\(['"]error|assert\.rejects/i, evidence: "error handling evidence was detected." }
  ];
  return imageProcessingReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function imageProcessingReadinessPerformanceSignals(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["performanceSignals"] {
  const specs: Array<{ signal: ImageProcessingReadinessReport["performanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "cache", pattern: /sharp\.cache|cache\s*\(/i, evidence: "Sharp cache evidence was detected." },
    { signal: "concurrency", pattern: /sharp\.concurrency|concurrency\s*\(/i, evidence: "Sharp concurrency evidence was detected." },
    { signal: "libvips", pattern: /libvips|@img\/sharp-libvips|detect-libc|native binary/i, evidence: "libvips/native binary evidence was detected." },
    { signal: "stream-pipeline", pattern: /pipeline\s*\(|\.pipe\s*\(|createReadStream|createWriteStream/i, evidence: "stream pipeline evidence was detected." },
    { signal: "clone", pattern: /\.clone\s*\(|clone pipeline/i, evidence: "Sharp clone pipeline evidence was detected." },
    { signal: "queue", pattern: /queue|Queue contains|task\(s\)|parallel|bench/i, evidence: "queue or parallelism evidence was detected." }
  ];
  return imageProcessingReadinessSignalFromSpecs(sourceFiles, specs, "performance", "signal");
}

function imageProcessingReadinessPackageSignals(sourceFiles: ImageProcessingReadinessSourceFile[]): ImageProcessingReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ImageProcessingReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "sharp", pattern: /"sharp"|from ['"]sharp|require\(['"]sharp|sharp\s*\(/i, evidence: "Sharp package/import evidence was detected." },
    { signal: "jimp", pattern: /"jimp"|from ['"]jimp|require\(['"]jimp|Jimp\./i, evidence: "Jimp package/import evidence was detected." },
    { signal: "imagemin", pattern: /"imagemin"|from ['"]imagemin|imagemin\s*\(/i, evidence: "imagemin package/import evidence was detected." },
    { signal: "image-js", pattern: /"image-js"|from ['"]image-js|Image\.load/i, evidence: "image-js package/import evidence was detected." },
    { signal: "canvas", pattern: /"canvas"|from ['"]canvas|createCanvas|ImageData/i, evidence: "canvas package/import evidence was detected." },
    { signal: "squoosh", pattern: /squoosh|@squoosh\/lib/i, evidence: "Squoosh package/import evidence was detected." }
  ];
  return imageProcessingReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function imageProcessingReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ImageProcessingReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/image-processing-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildFileUploadReadinessReport(walk: WalkResult): Promise<FileUploadReadinessReport> {
  const sourceFiles = await fileUploadReadinessSourceFiles(walk);
  const fileUploadSetups = fileUploadReadinessSetups(sourceFiles);
  const inputSignals = fileUploadReadinessInputSignals(sourceFiles);
  const restrictionSignals = fileUploadReadinessRestrictionSignals(sourceFiles);
  const transportSignals = fileUploadReadinessTransportSignals(sourceFiles);
  const lifecycleSignals = fileUploadReadinessLifecycleSignals(sourceFiles);
  const safetySignals = fileUploadReadinessSafetySignals(sourceFiles);
  const packageSignals = fileUploadReadinessPackageSignals(sourceFiles);

  const hasPackage = packageSignals.some((item) => item.readiness === "ready");
  const hasUppyPackage = packageSignals.some((item) => ["uppy", "@uppy/react"].includes(item.signal) && item.readiness === "ready");
  const hasSetup = fileUploadSetups.some((item) => item.readiness !== "missing");
  const hasReadySetup = fileUploadSetups.some((item) => item.readiness === "ready");
  const hasRestrictions = restrictionSignals.some((item) => item.readiness === "ready") || fileUploadSetups.some((item) => item.restrictionCount > 0);
  const hasTransport = transportSignals.some((item) => item.readiness === "ready") || fileUploadSetups.some((item) => item.transportCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || fileUploadSetups.some((item) => item.lifecycleCount > 0);
  const hasSafety = safetySignals.some((item) => item.readiness === "ready") || fileUploadSetups.some((item) => item.safetyCount > 0);

  const riskQueue: FileUploadReadinessReport["riskQueue"] = [];
  if (!hasPackage && !hasSetup) {
    riskQueue.push({
      priority: "medium",
      action: "Add or document the file upload strategy before claiming upload readiness.",
      why: "Upload readiness starts with explicit input, restriction, transport, lifecycle, safety, or package evidence.",
      relatedHref: "html/file-upload-readiness.html"
    });
  }
  if (hasUppyPackage && !hasReadySetup) {
    riskQueue.push({
      priority: "high",
      action: "Pair Uppy package evidence with concrete Uppy(), Dashboard or DragDrop setup, restrictions, transport, and lifecycle handlers.",
      why: "A browser upload dependency alone does not prove that file limits, network transport, progress, errors, or completion states are wired.",
      relatedHref: "html/file-upload-readiness.html"
    });
  }
  if ((hasPackage || hasSetup) && !hasRestrictions) {
    riskQueue.push({
      priority: "high",
      action: "Add MIME type, size, file-count, image-dimension, or metadata restrictions for untrusted uploads.",
      why: "Upload entry points without explicit restrictions can accept oversized, unsupported, or unexpected files.",
      relatedHref: "html/file-upload-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasTransport) {
    riskQueue.push({
      priority: "medium",
      action: "Document the upload transport, endpoint, resumability, headers, and remote-provider boundary.",
      why: "Users need to know whether uploads use XHR, Tus, S3 multipart, Companion, or a server parser before testing reliability.",
      relatedHref: "html/file-upload-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Add upload progress, status, completion, cancellation, retry, and error handling signals.",
      why: "Upload UX and recovery depend on visible lifecycle states, not only file selection.",
      relatedHref: "html/file-upload-readiness.html"
    });
  }
  if ((hasReadySetup || hasPackage) && !hasSafety) {
    riskQueue.push({
      priority: "high",
      action: "Review authentication headers, CSRF, content validation, storage path, scanning, and rate-limit controls.",
      why: "Upload endpoints are security boundaries and should not rely only on client-side widgets.",
      relatedHref: "html/file-upload-readiness.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run representative upload tests only in a trusted workspace after reviewing this static map.",
    why: "RepoTutor does not select files, open browsers, send uploads, contact Companion, write storage objects, scan content, or run the analyzed project's tests.",
    relatedHref: "html/file-upload-readiness.html"
  });

  return {
    summary: `Uppy-style file upload readiness report: setup ${fileUploadSetups.length}개, input signal ${inputSignals.length}개, restriction signal ${restrictionSignals.length}개, transport signal ${transportSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Uppy Dashboard DragDrop FileInput restrictions allowedFileTypes maxFileSize maxNumberOfFiles metaFields XHRUpload Tus AwsS3 Companion upload-progress complete error cancel retry",
    fileUploadSetups,
    inputSignals,
    restrictionSignals,
    transportSignals,
    lifecycleSignals,
    safetySignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "rg \"Uppy\\(|Dashboard|DragDrop|FileInput|useDropzone|dropzone|multer|formidable\" src app packages", purpose: "Inventory upload entry points, browser widgets, hooks, and server-side parsers." },
      { command: "rg \"restrictions|allowedFileTypes|maxFileSize|maxNumberOfFiles|minNumberOfFiles|maxTotalFileSize|metaFields\" src app packages test tests", purpose: "Review file type, size, count, and required metadata gates." },
      { command: "rg \"XHRUpload|Tus|AwsS3|Companion|endpoint|headers|getUploadParameters|createMultipartUpload\" src app packages", purpose: "Inspect upload transport, endpoints, headers, resumability, and remote-provider wiring." },
      { command: "rg \"upload-progress|progress|complete|upload-error|cancel|retry|pause|resume|StatusBar\" src app packages", purpose: "Check upload lifecycle, recovery UX, and error reporting." },
      { command: "rg \"csrf|authorization|virus|scan|validate|sanitize|storage|rateLimit|content-type\" src app packages", purpose: "Check server-side upload security controls and storage boundaries." },
      { command: "npx vitest run", purpose: "Run local tests that cover representative file selection, restrictions, upload transport, progress, cancellation, retry, and error paths." }
    ],
    learnerNextSteps: [
      "먼저 Uppy(), Dashboard, DragDrop, FileInput, useDropzone 같은 entry point를 찾아 사용자가 파일을 어디에서 넣는지 확인하세요.",
      "restrictions, allowedFileTypes, maxFileSize, maxNumberOfFiles, metaFields가 실제 upload path에 적용되는지 확인하세요.",
      "XHRUpload, Tus, AwsS3, Companion, endpoint, headers를 보며 업로드가 어디로 가고 재시도/재개가 가능한지 분리하세요.",
      "upload-progress, complete, upload-error, cancel, retry, pause, resume, StatusBar 신호로 사용자에게 보이는 lifecycle을 확인하세요.",
      "이 리포트는 정적 readiness입니다. 실제 파일 선택, 네트워크 업로드, 서버 저장, 악성 파일 검사, 권한 검사는 안전한 테스트 환경에서 별도로 확인하세요."
    ]
  };
}

type FileUploadReadinessSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function fileUploadReadinessSourceFiles(walk: WalkResult): Promise<FileUploadReadinessSourceFile[]> {
  const files: FileUploadReadinessSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !fileUploadReadinessInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!fileUploadReadinessPathSignal(file.relPath) && !fileUploadReadinessContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function fileUploadReadinessInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return fileUploadReadinessPathSignal(filePath)
    || /^(package\.json|upload\.[cm]?[jt]sx?|uploads\.[cm]?[jt]sx?|uploader\.[cm]?[jt]sx?|dropzone\.[cm]?[jt]sx?|storage\.[cm]?[jt]sx?|media\.[cm]?[jt]sx?)$/i.test(base)
    || /\.(js|cjs|mjs|ts|tsx|jsx|vue|svelte|json|md|mdx|ya?ml|toml)$/i.test(filePath);
}

function fileUploadReadinessPathSignal(filePath: string): boolean {
  return /(^|\/)(upload|uploads|uploader|file-upload|fileinput|dropzone|drag-drop|multipart|form-data|storage|media|attachments|companion|uppy)(\/|\.|-|_|$)/i.test(filePath);
}

function fileUploadReadinessContentSignal(text: string): boolean {
  return /(from ['"]@uppy|require\(['"]@uppy|new Uppy|Uppy\s*\(|Dashboard|DragDrop|FileInput|restrictions|allowedFileTypes|maxFileSize|maxNumberOfFiles|XHRUpload|Tus|AwsS3|Companion|react-dropzone|multer|formidable|busboy|upload-progress|upload-error)/i.test(text);
}

function fileUploadReadinessSetups(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["fileUploadSetups"] {
  const rows: FileUploadReadinessReport["fileUploadSetups"] = [];
  for (const source of sourceFiles) {
    const uploaderCount = countMatches(source.text, /new Uppy|Uppy\s*\(|\.use\s*\(|Dashboard|DragDrop|FileInput|useDropzone|multer\s*\(|formidable\s*\(|busboy\s*\(/gi);
    const restrictionCount = countMatches(source.text, /restrictions|allowedFileTypes|maxFileSize|maxNumberOfFiles|minNumberOfFiles|maxTotalFileSize|maxNumberOfFiles|metaFields|requiredMetaFields/gi);
    const transportCount = countMatches(source.text, /XHRUpload|Tus|AwsS3|AwsS3Multipart|Companion|endpoint\s*:|headers\s*:|getUploadParameters|createMultipartUpload/gi);
    const metadataCount = countMatches(source.text, /meta\s*:|metadata|setFileMeta|metaFields|fields\s*:|formData|bundle\s*:/gi);
    const lifecycleCount = countMatches(source.text, /upload-progress|progress|complete|upload-success|upload-error|cancel|retry|pause|resume|StatusBar/gi);
    const safetyCount = countMatches(source.text, /authorization|headers\s*:|csrf|content-type|mime|validate|sanitize|virus|scan|storage|path|rateLimit|limit/gi);
    const hasSetupSignal = uploaderCount + restrictionCount + transportCount + metadataCount + lifecycleCount + safetyCount > 0;
    if (!hasSetupSignal) continue;
    rows.push({
      filePath: source.filePath,
      provider: fileUploadReadinessProvider(source),
      uploaderCount,
      restrictionCount,
      transportCount,
      metadataCount,
      lifecycleCount,
      safetyCount,
      readiness: uploaderCount > 0 && restrictionCount > 0 && transportCount > 0 && lifecycleCount > 0 ? "ready" : hasSetupSignal ? "partial" : "missing",
      evidence: `${source.filePath} contains uploader ${uploaderCount}, restriction ${restrictionCount}, transport ${transportCount}, metadata ${metadataCount}, lifecycle ${lifecycleCount}, safety ${safetyCount}.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.slice(0, 90);
}

function fileUploadReadinessProvider(source: FileUploadReadinessSourceFile): FileUploadReadinessReport["fileUploadSetups"][number]["provider"] {
  if (/@uppy|new Uppy|Uppy\s*\(|Dashboard|DragDrop|XHRUpload|Tus/i.test(source.text)) return "uppy";
  if (/react-dropzone|useDropzone|Dropzone/i.test(source.text)) return "react-dropzone";
  if (/multer|multipart\/form-data/i.test(source.text)) return "multer";
  if (/formidable/i.test(source.text)) return "formidable";
  if (/busboy/i.test(source.text)) return "busboy";
  if (/upload|uploader|file input|multipart/i.test(source.text)) return "custom";
  return "unknown";
}

function fileUploadReadinessInputSignals(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["inputSignals"] {
  const specs: Array<{ signal: FileUploadReadinessReport["inputSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dashboard", pattern: /Dashboard|DashboardModal|@uppy\/dashboard/i, evidence: "Uppy Dashboard evidence was detected." },
    { signal: "drag-drop", pattern: /DragDrop|drag-drop|DropTarget|drop-target|ondrop|onDrop/i, evidence: "drag and drop upload evidence was detected." },
    { signal: "file-input", pattern: /FileInput|type=['"]file|useFileInput|createFileInput/i, evidence: "file input evidence was detected." },
    { signal: "dropzone", pattern: /react-dropzone|useDropzone|dropzone/i, evidence: "dropzone evidence was detected." },
    { signal: "camera-screen", pattern: /Webcam|ScreenCapture|@uppy\/webcam|@uppy\/screen-capture|camera/i, evidence: "camera or screen capture input evidence was detected." },
    { signal: "remote-provider", pattern: /Companion|Dropbox|GoogleDrive|OneDrive|Box|Url|Unsplash|remoteSources|provider/i, evidence: "remote provider input evidence was detected." }
  ];
  return fileUploadReadinessSignalFromSpecs(sourceFiles, specs, "input", "signal");
}

function fileUploadReadinessRestrictionSignals(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["restrictionSignals"] {
  const specs: Array<{ signal: FileUploadReadinessReport["restrictionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mime-types", pattern: /allowedFileTypes|accept\s*:|accept=|mime|content-type|image\/|application\//i, evidence: "MIME type restriction evidence was detected." },
    { signal: "max-file-size", pattern: /maxFileSize|maxTotalFileSize|fileSize|sizeLimit|limit\s*:/i, evidence: "file size restriction evidence was detected." },
    { signal: "max-number-files", pattern: /maxNumberOfFiles|minNumberOfFiles|maxFiles|fileCount/i, evidence: "file count restriction evidence was detected." },
    { signal: "image-dimensions", pattern: /maxWidth|maxHeight|minWidth|minHeight|dimensions|Image\s*\(|metadata\s*\(/i, evidence: "image dimension validation evidence was detected." },
    { signal: "required-meta-fields", pattern: /metaFields|requiredMetaFields|requiredMeta|fields\s*:|validateMetadata/i, evidence: "required metadata field evidence was detected." }
  ];
  return fileUploadReadinessSignalFromSpecs(sourceFiles, specs, "restriction", "signal");
}

function fileUploadReadinessTransportSignals(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["transportSignals"] {
  const specs: Array<{ signal: FileUploadReadinessReport["transportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "xhr-upload", pattern: /XHRUpload|@uppy\/xhr-upload|XMLHttpRequest/i, evidence: "XHRUpload evidence was detected." },
    { signal: "tus-resumable", pattern: /Tus|@uppy\/tus|tus-js-client|resumable|resume/i, evidence: "Tus or resumable upload evidence was detected." },
    { signal: "s3-multipart", pattern: /AwsS3|AwsS3Multipart|@uppy\/aws-s3|createMultipartUpload|signPart|completeMultipartUpload/i, evidence: "S3 multipart upload evidence was detected." },
    { signal: "companion", pattern: /Companion|companionUrl|companionHeaders|@uppy\/companion/i, evidence: "Companion transport evidence was detected." },
    { signal: "endpoint", pattern: /endpoint\s*:|uploadUrl|uploadURL|url\s*:|action\s*=/i, evidence: "upload endpoint evidence was detected." },
    { signal: "headers", pattern: /headers\s*:|Authorization|Bearer|withCredentials|getUploadParameters|csrf/i, evidence: "upload header evidence was detected." }
  ];
  return fileUploadReadinessSignalFromSpecs(sourceFiles, specs, "transport", "signal");
}

function fileUploadReadinessLifecycleSignals(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: FileUploadReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "progress", pattern: /upload-progress|progress|bytesUploaded|percentage|onProgress/i, evidence: "upload progress evidence was detected." },
    { signal: "status", pattern: /StatusBar|status|isUploading|uploadStarted|state\.totalProgress/i, evidence: "upload status evidence was detected." },
    { signal: "cancel-retry", pattern: /cancel|retry|retryUpload|cancel-all|resetProgress/i, evidence: "cancel or retry evidence was detected." },
    { signal: "complete", pattern: /complete|upload-success|onComplete|successful|finished/i, evidence: "upload completion evidence was detected." },
    { signal: "error", pattern: /upload-error|error|failed|onError|catch\s*\(/i, evidence: "upload error evidence was detected." },
    { signal: "pause-resume", pattern: /pause|resume|paused|isPaused|pauseResume/i, evidence: "pause or resume evidence was detected." }
  ];
  return fileUploadReadinessSignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function fileUploadReadinessSafetySignals(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["safetySignals"] {
  const specs: Array<{ signal: FileUploadReadinessReport["safetySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "auth-headers", pattern: /Authorization|Bearer|headers\s*:|withCredentials|session|cookie/i, evidence: "upload auth header evidence was detected." },
    { signal: "csrf", pattern: /csrf|xsrf|sameSite|anti-forgery/i, evidence: "CSRF protection evidence was detected." },
    { signal: "virus-scan", pattern: /virus|malware|clamav|scan|quarantine/i, evidence: "virus scan or quarantine evidence was detected." },
    { signal: "content-validation", pattern: /allowedFileTypes|mime|content-type|validate|sanitize|magic|file-type/i, evidence: "content validation evidence was detected." },
    { signal: "storage-path", pattern: /storage|bucket|key\s*:|path\s*:|filename|destination|diskStorage|memoryStorage/i, evidence: "storage path evidence was detected." },
    { signal: "rate-limit", pattern: /rateLimit|rate-limit|throttle|quota|limit\s*:|maxFiles/i, evidence: "rate limit or quota evidence was detected." }
  ];
  return fileUploadReadinessSignalFromSpecs(sourceFiles, specs, "safety", "signal");
}

function fileUploadReadinessPackageSignals(sourceFiles: FileUploadReadinessSourceFile[]): FileUploadReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FileUploadReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "uppy", pattern: /"uppy"|from ['"]uppy|require\(['"]uppy|new Uppy|Uppy\s*\(/i, evidence: "Uppy package/import evidence was detected." },
    { signal: "@uppy/react", pattern: /"@uppy\/react"|from ['"]@uppy\/react/i, evidence: "@uppy/react package/import evidence was detected." },
    { signal: "@uppy/xhr-upload", pattern: /"@uppy\/xhr-upload"|XHRUpload/i, evidence: "@uppy/xhr-upload package/import evidence was detected." },
    { signal: "@uppy/tus", pattern: /"@uppy\/tus"|from ['"]@uppy\/tus|Tus/i, evidence: "@uppy/tus package/import evidence was detected." },
    { signal: "react-dropzone", pattern: /"react-dropzone"|from ['"]react-dropzone|useDropzone/i, evidence: "react-dropzone package/import evidence was detected." },
    { signal: "multer", pattern: /"multer"|from ['"]multer|require\(['"]multer|multer\s*\(/i, evidence: "multer package/import evidence was detected." },
    { signal: "formidable", pattern: /"formidable"|from ['"]formidable|require\(['"]formidable|formidable\s*\(/i, evidence: "formidable package/import evidence was detected." }
  ];
  return fileUploadReadinessSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function fileUploadReadinessSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FileUploadReadinessSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/file-upload-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
