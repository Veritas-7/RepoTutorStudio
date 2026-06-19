// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

describe("RepoTutor core pipeline - quality-and-testing-readiness", () => {
  it("detects next-intl, i18next, and Lingui i18n readiness without executing localization tooling", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-i18n-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-i18n-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "app", "[locale]"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "i18n"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "messages"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "locales", "en"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "locales", "ko"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "locales", "en"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "i18n:extract": "formatjs extract \"src/**/*.{ts,tsx}\" --out-file messages/en.json --extract-source-location && lingui extract --clean",
        "i18n:compile": "formatjs compile-folder messages compiled --ast && lingui compile",
        "i18n:verify": "formatjs verify \"messages/*.json\" --source-locale en --missing-keys --structural-equality --extra-keys",
        typecheck: "tsc --noEmit"
      },
      dependencies: {
        "@lingui/core": "latest",
        "@lingui/macro": "latest",
        "@lingui/react": "latest",
        i18next: "latest",
        "i18next-browser-languagedetector": "latest",
        "i18next-http-backend": "latest",
        "next-intl": "latest",
        "react-i18next": "latest",
        "react-intl": "latest"
      },
      devDependencies: {
        "@formatjs/cli": "latest",
        "@lingui/cli": "latest",
        "@lingui/conf": "latest",
        "@lingui/eslint-plugin": "latest",
        "@lingui/swc-plugin": "latest",
        "@lingui/vite-plugin": "latest",
        "eslint-plugin-formatjs": "latest",
        typescript: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "i18n", "routing.ts"), [
      "import { defineRouting } from 'next-intl/routing';",
      "import { createNavigation } from 'next-intl/navigation';",
      "",
      "export const routing = defineRouting({",
      "  locales: ['en', 'ko'],",
      "  defaultLocale: 'en',",
      "  localePrefix: 'as-needed',",
      "  pathnames: { '/about': { ko: '/about-ko' } }",
      "});",
      "",
      "export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "proxy.ts"), [
      "import createMiddleware from 'next-intl/middleware';",
      "import { routing } from './i18n/routing';",
      "",
      "export default createMiddleware(routing);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "next.config.ts"), [
      "import createNextIntlPlugin from 'next-intl/plugin';",
      "",
      "const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');",
      "export default withNextIntl({});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "i18n", "request.ts"), [
      "import { getRequestConfig } from 'next-intl/server';",
      "import { getTranslations, getMessages, getLocale, setRequestLocale, hasLocale } from 'next-intl/server';",
      "import { routing } from './routing';",
      "",
      "export default getRequestConfig(async ({ requestLocale }) => {",
      "  const locale = hasLocale(routing.locales, await requestLocale) ? await requestLocale : routing.defaultLocale;",
      "  setRequestLocale(locale);",
      "  await getTranslations({ locale, namespace: 'home' });",
      "  await getMessages({ locale });",
      "  await getLocale();",
      "  return { locale, messages: (await import(`../../messages/${locale}.json`)).default };",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "app", "[locale]", "page.tsx"), [
      "import { NextIntlClientProvider, useTranslations } from 'next-intl';",
      "import { getTranslations } from 'next-intl/server';",
      "",
      "export default async function Page({ params }: { params: Promise<{ locale: string }> }) {",
      "  const { locale } = await params;",
      "  const t = await getTranslations({ locale, namespace: 'home' });",
      "  return <NextIntlClientProvider locale={locale} messages={{ home: { title: t('title') } }}><Home /></NextIntlClientProvider>;",
      "}",
      "",
      "function Home() {",
      "  const t = useTranslations('home');",
      "  return <h1>{t('title')}</h1>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "i18n", "i18next.ts"), [
      "import i18next from 'i18next';",
      "import Backend from 'i18next-http-backend';",
      "import LanguageDetector from 'i18next-browser-languagedetector';",
      "import { initReactI18next, useTranslation, I18nextProvider } from 'react-i18next';",
      "",
      "export const resources = {",
      "  en: { common: { welcome: 'Welcome {{name}}', item_one: '{{count}} item', item_other: '{{count}} items' } },",
      "  ko: { common: { welcome: 'Welcome {{name}}', item_one: '{{count}} item', item_other: '{{count}} items' } }",
      "};",
      "",
      "i18next",
      "  .use(Backend)",
      "  .use(LanguageDetector)",
      "  .use(initReactI18next)",
      "  .init({",
      "    resources,",
      "    fallbackLng: 'en',",
      "    defaultNS: 'common',",
      "    contextSeparator: '_',",
      "    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },",
      "    saveMissing: true,",
      "    missingKeyHandler: () => undefined,",
      "    interpolation: { escapeValue: false },",
      "    returnObjects: true",
      "  });",
      "",
      "i18next.changeLanguage('ko');",
      "export const label = i18next.t('common:welcome', { count: 2, context: 'formal', keyPrefix: 'home' });",
      "export function Component() {",
      "  const { t } = useTranslation('common', { keyPrefix: 'home' });",
      "  return <I18nextProvider i18n={i18next}>{t('welcome')}</I18nextProvider>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "i18n", "i18next.d.ts"), [
      "import type { resources } from './i18next';",
      "",
      "declare module 'i18next' {",
      "  interface CustomTypeOptions {",
      "    defaultNS: 'common';",
      "    resources: typeof resources.en;",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "i18n", "lingui.tsx"), [
      "import { i18n } from '@lingui/core';",
      "import { I18nProvider, Trans, useLingui } from '@lingui/react';",
      "import { msg, plural } from '@lingui/core/macro';",
      "",
      "i18n.loadAndActivate({ locale: 'en', messages: {} });",
      "i18n.activate('ko');",
      "const descriptor = msg({ id: 'lingui.message', message: 'Hello {name}', comment: 'Greeting' });",
      "const pluralLabel = plural(2, { one: '# item', other: '# items' });",
      "",
      "export function LinguiScreen() {",
      "  const { _ } = useLingui();",
      "  return <I18nProvider i18n={i18n}><Trans id=\"welcome\" comment=\"Greeting\">Hello</Trans>{_(descriptor)}{pluralLabel}</I18nProvider>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "lingui.config.ts"), [
      "import { defineConfig } from '@lingui/conf';",
      "",
      "export default defineConfig({",
      "  sourceLocale: 'en',",
      "  fallbackLocales: { default: 'en' },",
      "  pseudoLocale: 'pseudo-LOCALE',",
      "  catalogs: [{ path: 'src/locales/{locale}/messages', include: ['src'] }],",
      "  compileNamespace: 'json',",
      "  generateMessageId: (message) => message.id",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "vite.config.ts"), [
      "import { lingui } from '@lingui/vite-plugin';",
      "",
      "export default { plugins: [lingui()] };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "eslint.config.js"), [
      "import lingui from '@lingui/eslint-plugin';",
      "import formatjs from 'eslint-plugin-formatjs';",
      "",
      "export default [{",
      "  plugins: { lingui, formatjs },",
      "  rules: {",
      "    'formatjs/no-invalid-icu': 'error',",
      "    'formatjs/enforce-description': 'error',",
      "    'formatjs/enforce-id': 'error',",
      "    'lingui/no-unlocalized-strings': 'warn'",
      "  }",
      "}];"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "messages", "en.json"), JSON.stringify({
      "home.title": {
        defaultMessage: "Hello <strong>{name}</strong>, you have {count, plural, one {# task} other {# tasks}} from {gender, select, female {her} male {him} other {them}} costing {price, number, ::currency/USD} on {date, date, short} at {time, time, short}",
        description: "Dashboard greeting with rich text, plural, select, number, date, and time placeholders"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "messages", "ko.json"), JSON.stringify({
      "home.title": {
        defaultMessage: "Hello <strong>{name}</strong>, you have {count, plural, one {# task} other {# tasks}} from {gender, select, female {her} male {him} other {them}} costing {price, number, ::currency/USD} on {date, date, short} at {time, time, short}",
        description: "Translated dashboard greeting"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "locales", "en", "common.json"), JSON.stringify({
      welcome: "Welcome {{name}}",
      item_one: "{{count}} item",
      item_other: "{{count}} items"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "locales", "ko", "common.json"), JSON.stringify({
      welcome: "Welcome {{name}}",
      item_one: "{{count}} item",
      item_other: "{{count}} items"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "locales", "en", "messages.po"), [
      "msgid \"welcome\"",
      "msgstr \"Welcome\"",
      "",
      "msgid \"{count, plural, one {# item} other {# items}}\"",
      "msgstr \"{count, plural, one {# item} other {# items}}\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "i18n.yml"), [
      "name: i18n",
      "on: [push]",
      "jobs:",
      "  i18n:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm i18n:extract",
      "      - run: pnpm i18n:compile",
      "      - run: pnpm i18n:verify",
      "      - run: pnpm typecheck"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "senior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "i18n-report.json"), "utf8")) as {
      sourcePattern: string;
      messageSources: Array<{ mechanism: string; readiness: string }>;
      localeAssets: Array<{ assetType: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      extractionSignals: Array<{ signal: string; readiness: string }>;
      icuSignals: Array<{ signal: string; readiness: string }>;
      qaSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string }>;
      riskQueue: Array<{ action: string; why: string }>;
    };
    const readyValues = <T extends { readiness: string }>(items: T[], key: keyof T) =>
      items.filter((item) => item.readiness === "ready").map((item) => String(item[key]));

    expect(report.sourcePattern).toContain("next-intl useTranslations getTranslations");
    expect(readyValues(report.messageSources, "mechanism")).toEqual(expect.arrayContaining([
      "next-intl-useTranslations",
      "next-intl-getTranslations",
      "next-intl-provider",
      "i18next-t",
      "i18next-resources",
      "react-i18next-useTranslation",
      "lingui-trans",
      "lingui-macro",
      "lingui-provider",
      "message-catalog",
      "locale-json"
    ]));
    expect(readyValues(report.localeAssets, "assetType")).toEqual(expect.arrayContaining([
      "source-locale",
      "target-locale",
      "po-catalog",
      "namespaced-resources",
      "route-locale-config",
      "extracted-messages"
    ]));
    expect(readyValues(report.runtimeSignals, "signal")).toEqual(expect.arrayContaining([
      "next-intl-provider",
      "server-translations",
      "request-locale",
      "localized-routing",
      "middleware-locale",
      "i18next-init",
      "language-detector",
      "backend-loader",
      "change-language",
      "lingui-provider",
      "load-activate"
    ]));
    expect(readyValues(report.extractionSignals, "signal")).toEqual(expect.arrayContaining([
      "formatjs-extract",
      "formatjs-compile",
      "formatjs-verify",
      "compile-folder",
      "lingui-extract",
      "lingui-compile",
      "lingui-config",
      "lingui-vite-plugin",
      "lingui-clean",
      "next-intl-plugin",
      "swc-plugin-extractor",
      "extract-source-location",
      "pseudo-locale"
    ]));
    expect(readyValues(report.icuSignals, "signal")).toEqual(expect.arrayContaining([
      "plural",
      "select",
      "number",
      "date",
      "time",
      "rich-text",
      "description",
      "placeholder",
      "ast",
      "i18next-plural-suffix",
      "i18next-context",
      "lingui-plural",
      "message-id"
    ]));
    expect(readyValues(report.qaSignals, "signal")).toEqual(expect.arrayContaining([
      "eslint-plugin-formatjs",
      "enforce-description",
      "enforce-id",
      "no-invalid-icu",
      "missing-keys",
      "structural-equality",
      "extra-keys",
      "lingui-eslint",
      "catalog-compile",
      "selector-types",
      "save-missing",
      "namespace-types",
      "pseudo-locale",
      "route-localization",
      "ci-workflow"
    ]));
    expect(report.recommendedCommands.map((item) => item.command).join("\n")).toContain("lingui extract && lingui compile");
    expect(report.riskQueue.map((item) => `${item.action} ${item.why}`).join("\n")).toContain("static readiness analysis");
    const i18nHtml = await fs.readFile(path.join(result.session.outputPaths.html, "i18n.html"), "utf8");
    expect(i18nHtml).toContain("next-intl useTranslations");
    expect(i18nHtml).toContain("data-source-pattern=\"I18n\"");
    expect(i18nHtml).toContain("does not extract, compile, verify, typecheck");
    const i18nMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "i18n.md"), "utf8");
    expect(i18nMarkdown).toContain("# I18n Readiness");
    expect(i18nMarkdown).toContain("Source pattern: I18n readiness");
    expect(i18nMarkdown).toContain("next-intl은 routing/middleware/pathnames/requestLocale");
  }, 10000);

  it("detects Zap logging readiness without executing logger calls", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zap-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zap-source-"));
    await fs.mkdir(path.join(sourceRoot, "internal", "logging"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/zapfixture",
      "",
      "go 1.24",
      "",
      "require go.uber.org/zap v1.28.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "logging", "logger.go"), [
      "package logging",
      "",
      "import (",
      "  \"errors\"",
      "  \"net/http\"",
      "  \"os\"",
      "  \"time\"",
      "",
      "  \"go.uber.org/zap\"",
      "  \"go.uber.org/zap/zapcore\"",
      "  \"go.uber.org/zap/zapgrpc\"",
      "  \"go.uber.org/zap/zapio\"",
      ")",
      "",
      "type RequestContext struct {",
      "  RequestID string",
      "  UserID string",
      "}",
      "",
      "func NewLogger() (*zap.Logger, zap.AtomicLevel) {",
      "  level := zap.NewAtomicLevelAt(zap.InfoLevel)",
      "  encoderCfg := zap.NewProductionEncoderConfig()",
      "  encoderCfg.TimeKey = \"ts\"",
      "  encoderCfg.EncodeTime = zapcore.ISO8601TimeEncoder",
      "  cfg := zap.Config{",
      "    Level: level,",
      "    Development: false,",
      "    Sampling: &zap.SamplingConfig{Initial: 100, Thereafter: 100},",
      "    Encoding: \"json\",",
      "    EncoderConfig: encoderCfg,",
      "    OutputPaths: []string{\"stdout\", \"file:///tmp/app.log\"},",
      "    ErrorOutputPaths: []string{\"stderr\"},",
      "    InitialFields: map[string]any{\"service\": \"api\"},",
      "  }",
      "  logger, _ := cfg.Build(zap.AddCaller(), zap.AddStacktrace(zapcore.ErrorLevel), zap.Fields(zap.String(\"env\", \"test\")), zap.Hooks(func(zapcore.Entry) error { return nil }))",
      "  core := zapcore.NewCore(zapcore.NewJSONEncoder(encoderCfg), zapcore.AddSync(os.Stdout), level)",
      "  _ = zap.New(core, zap.WrapCore(func(core zapcore.Core) zapcore.Core { return core }), zap.WithCaller(true))",
      "  _ = zap.NewDevelopment()",
      "  _ = zap.NewExample()",
      "  return logger.Named(\"api\").With(zap.String(\"requestId\", \"boot\"), zap.Any(\"config\", map[string]string{\"mode\": \"test\"}), zap.Error(errors.New(\"warmup\"))), level",
      "}",
      "",
      "func LogRequest(logger *zap.Logger, req *http.Request, ctx RequestContext) {",
      "  defer logger.Sync()",
      "  child := logger.Named(\"handler\").With(zap.String(\"requestId\", ctx.RequestID), zap.String(\"userId\", ctx.UserID), zap.String(\"method\", req.Method), zap.String(\"path\", req.URL.Path), zap.Any(\"req\", req))",
      "  sugar := child.Sugar()",
      "  sugar.Infow(\"request started\", \"requestId\", ctx.RequestID, \"token\", \"redacted-by-policy\")",
      "  sugar.Infof(\"request %s\", req.URL.Path)",
      "  child.Debug(\"debug request\", zap.String(\"requestId\", ctx.RequestID))",
      "  child.Info(\"request completed\", zap.Int(\"status\", 200), zap.Duration(\"latency\", 25*time.Millisecond), zap.Any(\"ctx\", ctx))",
      "  child.Warn(\"slow request\", zap.String(\"requestId\", ctx.RequestID))",
      "  child.Error(\"request failed\", zap.Error(errors.New(\"boom\")), zap.Any(\"ctx\", ctx))",
      "}",
      "",
      "func FatalPath(logger *zap.Logger) {",
      "  logger.Fatal(\"fatal path\", zap.String(\"reason\", \"shutdown\"))",
      "}",
      "",
      "func Adapters(logger *zap.Logger) {",
      "  _ = zapgrpc.NewLogger(logger)",
      "  _ = &zapio.Writer{Log: logger, Level: zapcore.InfoLevel}",
      "}",
      "",
      "func DevLogger() *zap.Logger {",
      "  logger, _ := zap.NewDevelopment(zap.Development())",
      "  return logger",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "logging", "logger_test.go"), [
      "package logging",
      "",
      "import (",
      "  \"testing\"",
      "",
      "  \"go.uber.org/zap/zaptest\"",
      ")",
      "",
      "func TestLogger(t *testing.T) {",
      "  logger := zaptest.NewLogger(t)",
      "  logger.Info(\"test log\")",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "logging-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      loggingSetups: Array<{ provider: string; readiness: string }>;
      levelSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      transportSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("go.uber.org/zap zap.NewProduction zap.NewDevelopment zap.Config zap.AtomicLevel zap.Logger zap.SugaredLogger zap.String zap.Error zap.Any zapcore.NewCore EncoderConfig WriteSyncer Sync AddCaller AddStacktrace Sampling");
    expect(report.loggingSetups.some((item) => item.provider === "zap" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.levelSignals)).toEqual(expect.arrayContaining(["debug", "info", "warn", "error", "fatal"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["child-logger", "bindings", "request-id", "http-request", "error-object", "serializer", "timestamp", "sugared-logger", "typed-fields", "named-logger"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["secret-fields", "error-serializer", "stdout-stderr", "flush-on-exit", "caller", "stacktrace", "sampling"]));
    expect(readySignals(report.transportSignals)).toEqual(expect.arrayContaining(["destination", "file-output", "zapcore", "encoder", "write-syncer", "sink"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["zap", "zapcore", "zapgrpc", "zapio", "zaptest"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "logging-readiness.md"), "utf8");
    expect(markdown).toContain("Source pattern: Pino Zap Zerolog");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "logging-readiness.html"), "utf8");
    expect(html).toContain("data-source-pattern=\"Pino Zap Zerolog\"");
  });

  it("detects Zerolog logging readiness without executing logger calls", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zerolog-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-zerolog-source-"));
    await fs.mkdir(path.join(sourceRoot, "internal", "logging"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/zerologfixture",
      "",
      "go 1.24",
      "",
      "require github.com/rs/zerolog v1.34.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "internal", "logging", "logger.go"), [
      "package logging",
      "",
      "import (",
      "  \"context\"",
      "  \"errors\"",
      "  \"io\"",
      "  \"net/http\"",
      "  \"os\"",
      "  \"time\"",
      "",
      "  \"github.com/rs/zerolog\"",
      "  \"github.com/rs/zerolog/diode\"",
      "  \"github.com/rs/zerolog/hlog\"",
      "  \"github.com/rs/zerolog/journald\"",
      "  zlog \"github.com/rs/zerolog/log\"",
      "  \"github.com/rs/zerolog/pkgerrors\"",
      "  \"github.com/rs/zerolog/syslog\"",
      ")",
      "",
      "type requestContext struct {",
      "  RequestID string",
      "  UserID string",
      "}",
      "",
      "func NewLogger() zerolog.Logger {",
      "  zerolog.TimeFieldFormat = zerolog.TimeFormatUnix",
      "  zerolog.ErrorStackMarshaler = pkgerrors.MarshalStack",
      "  zerolog.SetGlobalLevel(zerolog.DebugLevel)",
      "  console := zerolog.ConsoleWriter{Out: os.Stdout, NoColor: true, TimeFormat: time.RFC3339}",
      "  diodeWriter := diode.NewWriter(os.Stdout, 1000, 0, func(missed int) {})",
      "  multi := zerolog.MultiLevelWriter(console, diodeWriter, os.Stderr)",
      "  syncWriter := zerolog.SyncWriter(multi)",
      "  logger := zerolog.New(syncWriter).Level(zerolog.TraceLevel).Sample(&zerolog.BasicSampler{N: 10}).With().Timestamp().Caller().Str(\"service\", \"api\").Logger()",
      "  logger = logger.Hook(severityHook{})",
      "  zlog.Logger = logger.With().Str(\"component\", \"global\").Logger()",
      "  _ = journald.NewJournalDWriter()",
      "  _ = syslog.SyslogLevelWriter(syslogWriter{})",
      "  _ = zerolog.NewSlogHandler(logger)",
      "  _ = zerolog.Nop()",
      "  return logger",
      "}",
      "",
      "type severityHook struct{}",
      "func (severityHook) Run(e *zerolog.Event, level zerolog.Level, msg string) { e.Str(\"severity\", level.String()) }",
      "",
      "type syslogWriter struct{}",
      "func (syslogWriter) Debug(string) error { return nil }",
      "func (syslogWriter) Info(string) error { return nil }",
      "func (syslogWriter) Warning(string) error { return nil }",
      "func (syslogWriter) Err(string) error { return nil }",
      "func (syslogWriter) Emerg(string) error { return nil }",
      "func (syslogWriter) Crit(string) error { return nil }",
      "func (syslogWriter) Alert(string) error { return nil }",
      "func (syslogWriter) Notice(string) error { return nil }",
      "func (syslogWriter) Write([]byte) (int, error) { return 0, nil }",
      "func (syslogWriter) Close() error { return nil }",
      "",
      "func Middleware(next http.Handler) http.Handler {",
      "  logger := NewLogger()",
      "  return hlog.NewHandler(logger)(hlog.RequestIDHandler(\"requestId\", \"X-Request-ID\")(hlog.AccessHandler(func(r *http.Request, status, size int, duration time.Duration) {",
      "    hlog.FromRequest(r).Info().Str(\"requestId\", hlog.IDFromRequest(r).String()).Str(\"method\", r.Method).Str(\"path\", r.URL.Path).Int(\"status\", status).Dur(\"duration\", duration).Msg(\"request completed\")",
      "  })(next)))",
      "}",
      "",
      "func LogRequest(ctx context.Context, logger zerolog.Logger, req *http.Request, rc requestContext) context.Context {",
      "  logger = logger.With().Str(\"requestId\", rc.RequestID).Str(\"userId\", rc.UserID).Logger()",
      "  logger.UpdateContext(func(c zerolog.Context) zerolog.Context { return c.Str(\"module\", \"handler\") })",
      "  ctx = logger.WithContext(ctx)",
      "  zerolog.Ctx(ctx).Info().Str(\"method\", req.Method).Str(\"path\", req.URL.Path).Any(\"req\", req).Msg(\"request started\")",
      "  logger.Trace().Str(\"requestId\", rc.RequestID).Send()",
      "  logger.Debug().Str(\"requestId\", rc.RequestID).Msgf(\"debug %s\", req.URL.Path)",
      "  logger.Info().Str(\"token\", \"redacted-by-policy\").Int(\"attempt\", 1).Bool(\"ok\", true).Time(\"at\", time.Now()).Msg(\"request info\")",
      "  logger.Warn().Dict(\"payload\", zerolog.Dict().Str(\"key\", \"value\")).Array(\"items\", zerolog.Arr().Str(\"a\")).Msg(\"warning\")",
      "  logger.Error().Stack().Err(errors.New(\"boom\")).Interface(\"ctx\", rc).RawJSON(\"json\", []byte(`{\"ok\":true}`)).Msg(\"request failed\")",
      "  logger.WithLevel(zerolog.FatalLevel).Msg(\"fatal level without exit\")",
      "  logger.WithLevel(zerolog.PanicLevel).Msg(\"panic level without panic\")",
      "  zlog.Info().Str(\"component\", \"global\").Msg(\"global log\")",
      "  return ctx",
      "}",
      "",
      "func OutputLogger(w io.Writer) zerolog.Logger {",
      "  return zerolog.New(w).With().Timestamp().Logger()",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "logging-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      loggingSetups: Array<{ provider: string; readiness: string }>;
      levelSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      transportSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toContain("github.com/rs/zerolog zerolog.New log.Info Msg Msgf With Timestamp SetGlobalLevel ConsoleWriter MultiLevelWriter hlog diode journald syslog");
    expect(report.loggingSetups.some((item) => item.provider === "zerolog" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.levelSignals)).toEqual(expect.arrayContaining(["trace", "debug", "info", "warn", "error", "fatal", "panic", "custom-level"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["child-logger", "bindings", "request-id", "http-request", "error-object", "serializer", "timestamp", "typed-fields", "named-logger", "event-builder", "context-logger", "context-integration"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["secret-fields", "error-serializer", "stdout-stderr", "caller", "stacktrace", "sampling"]));
    expect(readySignals(report.transportSignals)).toEqual(expect.arrayContaining(["console-writer", "multi-writer", "level-writer", "diode-writer", "slog-handler", "journald", "syslog"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["zerolog", "zerolog-log", "zerolog-hlog", "zerolog-diode", "zerolog-journald", "zerolog-syslog", "zerolog-pkgerrors"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "logging-readiness.md"), "utf8");
    expect(markdown).toContain("Source pattern: Pino Zap Zerolog");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "logging-readiness.html"), "utf8");
    expect(html).toContain("data-source-pattern=\"Pino Zap Zerolog\"");
  });

  it("detects React Hook Form signals without mounting or submitting forms", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-rhf-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-rhf-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "profile-form.tsx"), [
      "import { zodResolver } from '@hookform/resolvers/zod';",
      "import { Controller, Form, FormProvider, FormStateSubscribe, RegisterOptions, ControllerRenderProps, FieldPath, FieldValues, SubmitHandler, UseFormReturn, createFormControl, useController, useFieldArray, useForm, useFormContext, useFormState, useWatch } from 'react-hook-form';",
      "import { z } from 'zod';",
      "",
      "const schema = z.object({ name: z.string().min(2), age: z.coerce.number().min(18), birthday: z.date().optional(), tags: z.array(z.object({ label: z.string() })) });",
      "type ProfileForm = FieldValues & z.infer<typeof schema>;",
      "const namePath: FieldPath<ProfileForm> = 'name';",
      "const nameOptions: RegisterOptions<ProfileForm, 'name'> = { required: true, minLength: 2, validate: (value) => value.length > 1, deps: ['age'], setValueAs: (value) => String(value).trim() };",
      "const ageOptions: RegisterOptions<ProfileForm, 'age'> = { valueAsNumber: true, max: 120 };",
      "const birthdayOptions: RegisterOptions<ProfileForm, 'birthday'> = { valueAsDate: true };",
      "const controlFactory = createFormControl<ProfileForm>({ defaultValues: { name: '', age: 18, tags: [] } });",
      "",
      "function NestedField() {",
      "  const { register, control, formState, getValues, getFieldState, setValue, setError, clearErrors, trigger, resetField } = useFormContext<ProfileForm>();",
      "  const watchedName = useWatch({ control, name: 'name' });",
      "  const { dirtyFields, touchedFields, isSubmitting, isValid, errors } = useFormState({ control, name: ['name', 'age'], exact: true });",
      "  const { field } = useController({ control, name: 'name', rules: nameOptions });",
      "  setValue('name', watchedName || getValues('name'), { shouldValidate: true, shouldDirty: true });",
      "  getFieldState('name', formState);",
      "  setError('name', { type: 'manual', message: 'Required' });",
      "  clearErrors('name');",
      "  trigger(['name', 'age']);",
      "  resetField('age', { defaultValue: 18 });",
      "  return <input {...register(namePath, nameOptions)} value={field.value} onChange={field.onChange} aria-invalid={!!errors.name} data-dirty={!!dirtyFields.name} data-touched={!!touchedFields.name} data-submitting={isSubmitting} data-valid={isValid} />;",
      "}",
      "",
      "export function ProfileForm() {",
      "  const methods: UseFormReturn<ProfileForm> = useForm<ProfileForm>({",
      "    mode: 'onChange',",
      "    reValidateMode: 'onBlur',",
      "    criteriaMode: 'all',",
      "    defaultValues: { name: '', age: 18, birthday: undefined, tags: [{ label: 'study' }] },",
      "    values: { name: 'Ada', age: 37, birthday: undefined, tags: [{ label: 'math' }] },",
      "    resolver: zodResolver(schema),",
      "    shouldUnregister: true,",
      "    disabled: false,",
      "    delayError: 250,",
      "    shouldFocusError: true,",
      "    context: { tenant: 'study' },",
      "  });",
      "  const { register, control, handleSubmit, reset, watch, formState: { errors } } = methods;",
      "  const { fields, append, remove, move, insert, update, replace, swap } = useFieldArray({ control, name: 'tags', keyName: 'fieldKey' });",
      "  const onSubmit: SubmitHandler<ProfileForm> = (values) => console.log(values);",
      "  watch('name');",
      "  append({ label: 'new' });",
      "  remove(0);",
      "  move(0, 1);",
      "  insert(0, { label: 'inserted' });",
      "  update(0, { label: 'updated' });",
      "  replace([{ label: 'replacement' }]);",
      "  swap(0, 1);",
      "  reset({ name: 'Grace', age: 40, birthday: undefined, tags: [] });",
      "  return <FormProvider {...methods}><Form control={control} onSubmit={onSubmit}><NestedField /><input {...register('age', ageOptions)} /><input {...register('birthday', birthdayOptions)} /><Controller name=\"name\" control={control} render={({ field, fieldState, formState }: { field: ControllerRenderProps<ProfileForm, 'name'>; fieldState: { invalid: boolean }; formState: { isValid: boolean } }) => <input {...field} aria-invalid={fieldState.invalid || !formState.isValid} />} />{fields.map((field, index) => <input key={field.fieldKey} {...register(`tags.${index}.label` as const, { required: true })} />)}<FormStateSubscribe control={control} name=\"name\" render={(state) => <span>{state.errors.name?.message}</span>} /><button type=\"submit\" disabled={!!errors.name}>Save</button></Form></FormProvider>;",
      "}",
      "",
      "void controlFactory;",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@hookform/resolvers": "^5.0.0",
        "react-hook-form": "^7.0.0",
        zod: "^4.0.0"
      },
      devDependencies: {
        vitest: "^3.0.0"
      },
      scripts: {
        test: "vitest run"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "junior", studiesRoot });
    const report = result.analysis.formReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("React Hook Form useForm register handleSubmit Controller useController FormProvider useFormContext useFieldArray append remove move insert update replace swap resolver mode reValidateMode criteriaMode errors defaultValues values watch useWatch useFormState formState reset resetField setValue getValues getFieldState setError clearErrors trigger shouldUnregister disabled delayError shouldFocusError context control RegisterOptions FieldValues FieldPath SubmitHandler UseFormReturn ControllerRenderProps Form component FormStateSubscribe createFormControl validation");
    expect(report.formSetups.some((item) => item.filePath === "src/profile-form.tsx" && item.library === "react-hook-form" && item.readiness === "ready" && item.hasDefaultValues && item.hasFormProvider)).toBe(true);
    expect(report.fieldRegistrations.some((item) => item.filePath === "src/profile-form.tsx" && item.registeredFieldCount > 0 && item.controlledFieldCount > 0 && item.fieldArrayCount > 0 && item.nestedFieldSignals > 0)).toBe(true);
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["required", "min", "max", "minLength", "validate", "resolver", "zodResolver", "schema"]));
    expect(readySignals(report.errorSignals)).toEqual(expect.arrayContaining(["formState-errors", "setError", "clearErrors", "trigger", "isValid", "isSubmitting", "dirtyFields", "touchedFields"]));
    expect(readySignals(report.valueFlowSignals)).toEqual(expect.arrayContaining(["watch", "useWatch", "getValues", "setValue", "reset", "resetField", "defaultValues", "values", "shouldUnregister"]));
    expect(readySignals(report.reactHookFormSignals)).toEqual(expect.arrayContaining(["use-form", "register", "handle-submit", "controller", "use-controller", "form-provider", "use-form-context", "use-field-array", "field-array-append", "field-array-remove", "field-array-move", "field-array-insert", "field-array-update", "field-array-replace", "field-array-swap", "use-watch", "watch", "use-form-state", "form-state", "resolver", "mode", "revalidate-mode", "criteria-mode", "default-values", "values", "reset", "reset-field", "set-value", "get-values", "get-field-state", "set-error", "clear-errors", "trigger", "should-unregister", "disabled", "delay-error", "should-focus-error", "context", "control", "register-options", "validate-option", "deps-option", "value-as-number", "value-as-date", "set-value-as", "dirty-fields", "touched-fields", "is-submitting", "is-valid", "field-values-type", "field-path-type", "submit-handler-type", "use-form-return-type", "controller-render", "form-component", "form-state-subscribe", "create-form-control"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["react-hook-form", "hookform-resolvers", "zod"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("reValidateMode") && item.command.includes("createFormControl"))).toBe(true);

    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "form-readiness.md"), "utf8");
    expect(markdown).toContain("## React Hook Form Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "form-readiness.html"), "utf8");
    expect(html).toContain("React Hook Form Signals");
    const text = await fs.readFile(path.join(result.session.outputPaths.analysis, "form-readiness-report.json"), "utf8");
    expect(text).toContain("\"reactHookFormSignals\"");
  });

  it("detects Auth.js runtime and session contracts without running auth flows", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-auth-runtime-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-auth-runtime-source-"));
    await fs.mkdir(path.join(sourceRoot, "app", "api", "auth", "[...nextauth]"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "app"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "auth.ts"), [
      "import NextAuth from \"next-auth\";",
      "import GitHub from \"next-auth/providers/github\";",
      "import Credentials from \"next-auth/providers/credentials\";",
      "import Passkey from \"next-auth/providers/passkey\";",
      "import { PrismaAdapter } from \"@auth/prisma-adapter\";",
      "",
      "export const { handlers, auth, signIn, signOut } = NextAuth({",
      "  secret: process.env.AUTH_SECRET,",
      "  adapter: PrismaAdapter(prisma),",
      "  providers: [",
      "    GitHub({ clientId: process.env.AUTH_GITHUB_ID!, clientSecret: process.env.AUTH_GITHUB_SECRET! }),",
      "    Credentials({ credentials: { email: {}, password: {} }, authorize: async () => user }),",
      "    Passkey",
      "  ],",
      "  session: { strategy: \"jwt\", maxAge: 30 * 24 * 60 * 60, updateAge: 24 * 60 * 60 },",
      "  trustHost: true,",
      "  basePath: \"/api/auth\",",
      "  rawEnv: { AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST, AUTH_URL: process.env.AUTH_URL },",
      "  experimental: { enableWebAuthn: true },",
      "  callbacks: {",
      "    authorized({ auth }) { return !!auth?.user; },",
      "    jwt({ token, account, profile }) { return token; },",
      "    session({ session, token }) { return session; },",
      "    signIn() { return true; },",
      "    redirect() { return \"/\"; }",
      "  },",
      "  events: { signIn(message) { console.log(message.account?.provider); } },",
      "  cookies: { sessionToken: { options: { httpOnly: true, sameSite: \"lax\", secure: true } } }",
      "});",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "api", "auth", "[...nextauth]", "route.ts"), [
      "import { handlers } from \"../../../../auth\";",
      "",
      "export const { GET, POST } = handlers;",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "middleware.ts"), [
      "export { auth as middleware } from \"./auth\";",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "app", "providers.tsx"), [
      "\"use client\";",
      "import { SessionProvider, useSession, signIn, signOut } from \"next-auth/react\";",
      "",
      "export function Providers({ children }: { children: React.ReactNode }) {",
      "  const session = useSession();",
      "  return <SessionProvider>{children}<button onClick={() => signIn()}>Sign in</button><button onClick={() => signOut()}>Sign out</button>{session.status}</SessionProvider>;",
      "}",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".env.example"), [
      "AUTH_SECRET=",
      "AUTH_URL=",
      "AUTH_GITHUB_ID=",
      "AUTH_GITHUB_SECRET=",
      "AUTH_TRUST_HOST=true",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        next: "^15.0.0",
        "next-auth": "^5.0.0-beta.0",
        "@auth/prisma-adapter": "^2.0.0",
        "@simplewebauthn/browser": "^11.0.0"
      },
      scripts: {
        test: "vitest run"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.authReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toContain("session strategy maxAge updateAge");
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining([
      "handlers-export",
      "auth-export",
      "sign-in-export",
      "sign-out-export",
      "session-strategy",
      "session-max-age",
      "session-update-age",
      "trust-host",
      "base-path",
      "experimental-webauthn",
      "raw-env"
    ]));
    expect(readySignals(report.providerSignals)).toEqual(expect.arrayContaining(["oauth-provider", "credentials-provider", "webauthn-passkey", "adapter", "jwt-session"]));
    expect(readySignals(report.credentialSignals)).toEqual(expect.arrayContaining(["AUTH_SECRET", "AUTH_URL", "provider-client-id", "provider-client-secret", "cookie-policy"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("trustHost") && item.command.includes("enableWebAuthn"))).toBe(true);

    const authReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "auth-readiness-report.json"), "utf8");
    expect(authReadinessText).toContain("\"runtimeSignals\"");
    expect(authReadinessText).toContain("experimental-webauthn");
    const authReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "auth-readiness.md"), "utf8");
    expect(authReadinessMarkdown).toContain("## Runtime Signals");
    expect(authReadinessMarkdown).toContain("trust-host");
    const authReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "auth-readiness.html"), "utf8");
    expect(authReadinessHtml).toContain("Runtime Signals");
    expect(authReadinessHtml).toContain("experimental-webauthn");
  });

  it("detects Resend provider workflows without sending email", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-resend-provider-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-resend-provider-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "server"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "server", "email.tsx"), [
      "import { Resend } from \"resend\";",
      "import { render } from \"@react-email/render\";",
      "",
      "const resend = new Resend(process.env.RESEND_API_KEY);",
      "",
      "function EmailTemplate(props: { firstName: string }) {",
      "  return <p>Hello {props.firstName}</p>;",
      "}",
      "",
      "export async function sendWelcome(userEmail: string) {",
      "  const html = await render(<EmailTemplate firstName=\"Ada\" />);",
      "  return resend.emails.send({",
      "    from: \"Learning App <onboarding@example.com>\",",
      "    to: userEmail,",
      "    subject: \"Welcome to the course\",",
      "    html,",
      "    react: <EmailTemplate firstName=\"Ada\" />,",
      "    replyTo: \"support@example.com\",",
      "    attachments: [],",
      "    tags: [{ name: \"flow\", value: \"welcome\" }]",
      "  }, { idempotencyKey: `welcome-${userEmail}` });",
      "}",
      "",
      "export async function sendBatch() {",
      "  return resend.batch.send([{",
      "    from: \"Learning App <digest@example.com>\",",
      "    to: \"learner@example.com\",",
      "    subject: \"Weekly digest\",",
      "    html: \"<p>Study plan</p>\"",
      "  }], { idempotencyKey: \"digest-demo\" });",
      "}",
      "",
      "export async function manageProviderWorkflows() {",
      "  await resend.domains.verify(\"domain-id\");",
      "  resend.webhooks.verify({",
      "    payload: \"{}\",",
      "    headers: { \"svix-id\": \"msg_123\", \"svix-timestamp\": \"123\", \"svix-signature\": \"sig\" },",
      "    secret: process.env.RESEND_WEBHOOK_SECRET!",
      "  });",
      "  await resend.apiKeys.create({ name: \"dashboard-key\" });",
      "  await resend.contacts.create({ email: \"learner@example.com\", unsubscribed: false });",
      "  await resend.audiences.create({ name: \"Learners\" });",
      "  await resend.segments.create({ name: \"Onboarding\" });",
      "  await resend.broadcasts.create({",
      "    audienceId: \"audience-id\",",
      "    from: \"Learning App <newsletter@example.com>\",",
      "    subject: \"Course update\",",
      "    html: \"<p>Update</p>\"",
      "  });",
      "  await resend.automations.create({ name: \"Onboarding automation\" });",
      "  await resend.templates.create({",
      "    name: \"welcome-template\",",
      "    subject: \"Welcome\",",
      "    from: \"Learning App <templates@example.com>\",",
      "    replyTo: \"support@example.com\",",
      "    html: \"<p>Hello</p>\",",
      "    react: <EmailTemplate firstName=\"Template\" />",
      "  });",
      "  await resend.events.send({ name: \"course.started\", userId: \"learner-id\" });",
      "  await resend.events.list({ limit: 10 });",
      "  await resend.logs.list({ limit: 10 });",
      "  await resend.emails.receiving.list({ limit: 10 });",
      "}",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".env.example"), [
      "RESEND_API_KEY=",
      "RESEND_WEBHOOK_SECRET=",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        resend: "^6.0.0",
        "@react-email/render": "^2.0.0",
        "@react-email/components": "^1.0.0",
        react: "^19.0.0"
      },
      scripts: {
        test: "vitest run"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.emailReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toContain("apiKeys contacts audiences segments broadcasts automations templates events logs receiving");
    expect(readySignals(report.providerSignals)).toEqual(expect.arrayContaining([
      "resend-client",
      "emails-resource",
      "batch-resource",
      "domains-resource",
      "webhooks-resource",
      "api-keys-resource",
      "templates-resource",
      "events-resource",
      "logs-resource",
      "contacts-resource",
      "audiences-segments",
      "broadcasts-resource",
      "automations-resource",
      "receiving-resource"
    ]));
    expect(readySignals(report.deliverySignals)).toEqual(expect.arrayContaining(["domain-verification", "batch-send", "idempotency", "webhook-verification"]));
    expect(readySignals(report.recipientSignals)).toEqual(expect.arrayContaining(["from", "to", "reply-to", "subject", "html", "react", "attachments", "tags"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("apiKeys") && item.command.includes("receiving"))).toBe(true);

    const emailReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "email-readiness-report.json"), "utf8");
    expect(emailReadinessText).toContain("\"providerSignals\"");
    expect(emailReadinessText).toContain("api-keys-resource");
    const emailReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "email-readiness.md"), "utf8");
    expect(emailReadinessMarkdown).toContain("## Provider Signals");
    const emailReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "email-readiness.html"), "utf8");
    expect(emailReadinessHtml).toContain("Provider Signals");
  }, 10000);

  it("detects TypeDoc configuration outputs and validation without generating docs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-typedoc-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-typedoc-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "index.ts"), [
      "/** Public course API. */",
      "export interface Course {",
      "  id: string;",
      "  title: string;",
      "}",
      "",
      "/** Create a course record. */",
      "export function createCourse(input: Course): Course {",
      "  return input;",
      "}",
      "",
      "class InternalHelper {",
      "  run() { return true; }",
      "}",
      "",
      "export const publicVersion = \"1.0.0\";",
      "void InternalHelper;",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "guide.md"), [
      "---",
      "title: API Guide",
      "group: Guides",
      "---",
      "",
      "# API Guide",
      "",
      "External document content that TypeDoc can include alongside generated API references.",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "typedoc.json"), JSON.stringify({
      $schema: "https://typedoc.org/schema.json",
      extends: ["./typedoc.base.json"],
      entryPoints: ["./src/index.ts"],
      entryPointStrategy: "packages",
      out: "docs/api",
      json: "docs/api.json",
      outputs: [
        { name: "html", path: "docs/api-html", options: { navigation: { includeCategories: true, includeGroups: true, includeFolders: true } } },
        { name: "json", path: "docs/api.json" },
        { name: "markdown", path: "docs/api-md" }
      ],
      emit: "none",
      theme: "default",
      router: "kind-dir",
      searchInComments: true,
      githubPages: true,
      plugin: ["typedoc-plugin-markdown"],
      validation: {
        notExported: true,
        invalidLink: true,
        invalidPath: true,
        rewrittenLink: true,
        notDocumented: true,
        unusedMergeModuleWith: true
      },
      treatWarningsAsErrors: true,
      treatValidationWarningsAsErrors: true,
      requiredToBeDocumented: ["Class", "Function", "Interface", "TypeAlias"],
      intentionallyNotDocumented: ["InternalHelper.run"],
      intentionallyNotExported: ["InternalHelper"],
      packagesRequiringDocumentation: ["typedoc-fixture"]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "typedoc.base.json"), JSON.stringify({
      out: "docs/base-api",
      emit: "docs"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tsconfig.json"), JSON.stringify({
      compilerOptions: {
        declaration: true,
        strict: true,
        skipLibCheck: true
      },
      typedocOptions: {
        entryPoints: ["src/index.ts"],
        plugin: ["typedoc-plugin-markdown"]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tsdoc.json"), JSON.stringify({
      $schema: "https://developer.microsoft.com/json-schemas/tsdoc/v0/tsdoc.schema.json",
      extends: ["typedoc/tsdoc.json"],
      tagDefinitions: [
        { tagName: "@learning", syntaxKind: "block" }
      ],
      supportForTags: {
        "@learning": true
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "typedoc-fixture",
      scripts: {
        docs: "typedoc --options typedoc.json --emit none",
        "docs:emit": "typedoc --emit docs",
        "docs:json": "typedoc --json docs/api.json"
      },
      devDependencies: {
        typedoc: "^0.28.0",
        "typedoc-plugin-markdown": "^4.0.0",
        typescript: "^5.0.0"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.apiReferenceReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toContain("typedoc.json typedocOptions outputs html json emit plugin");
    expect(readySignals(report.typedocConfigSignals)).toEqual(expect.arrayContaining([
      "typedoc-config",
      "package-script",
      "options-file",
      "tsconfig",
      "typedoc-options",
      "entry-points",
      "entry-point-strategy",
      "packages-strategy",
      "plugin",
      "tsdoc-config"
    ]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining([
      "out",
      "html",
      "json",
      "outputs-array",
      "emit-docs",
      "emit-none",
      "theme",
      "router",
      "navigation",
      "search",
      "markdown-plugin",
      "external-documents"
    ]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining([
      "validation-object",
      "not-exported",
      "invalid-link",
      "invalid-path",
      "rewritten-link",
      "not-documented",
      "treat-warnings-as-errors",
      "treat-validation-warnings-as-errors",
      "required-to-be-documented",
      "intentionally-not-documented",
      "intentionally-not-exported",
      "packages-requiring-documentation"
    ]));
    expect(report.publicSymbols.map((symbol) => symbol.name)).toEqual(expect.arrayContaining(["Course", "createCourse", "publicVersion"]));

    const apiReferenceText = await fs.readFile(path.join(result.session.outputPaths.analysis, "api-reference-report.json"), "utf8");
    expect(apiReferenceText).toContain("\"typedocConfigSignals\"");
    expect(apiReferenceText).toContain("packages-strategy");
    expect(apiReferenceText).toContain("treat-validation-warnings-as-errors");
    const apiReferenceMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "api-reference.md"), "utf8");
    expect(apiReferenceMarkdown).toContain("## TypeDoc Config Signals");
    expect(apiReferenceMarkdown).toContain("## Output Signals");
    expect(apiReferenceMarkdown).toContain("## Validation Signals");
    const apiReferenceHtml = await fs.readFile(path.join(result.session.outputPaths.html, "api-reference.html"), "utf8");
    expect(apiReferenceHtml).toContain("TypeDoc Config Signals");
    expect(apiReferenceHtml).toContain("Validation Signals");
  }, 10000);

  it("detects Docusaurus official signals without compiling docs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-docusaurus-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-docusaurus-source-"));
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "blog"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "pages"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "theme", "DocItem"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "static", "img"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "i18n", "fr", "docusaurus-plugin-content-docs", "current"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "versioned_docs", "version-1.0.0"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "versioned_sidebars"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "docusaurus-demo",
      version: "1.0.0",
      scripts: {
        start: "docusaurus start",
        build: "docusaurus build",
        serve: "docusaurus serve",
        deploy: "docusaurus deploy",
        version: "docusaurus docs:version 1.0.0",
        swizzle: "docusaurus swizzle --list"
      },
      dependencies: {
        "@docusaurus/core": "^3.10.0",
        "@docusaurus/preset-classic": "^3.10.0",
        "@docusaurus/plugin-content-docs": "^3.10.0",
        "@docusaurus/plugin-content-blog": "^3.10.0",
        "@docusaurus/plugin-content-pages": "^3.10.0",
        "@docusaurus/plugin-sitemap": "^3.10.0",
        "@docusaurus/plugin-client-redirects": "^3.10.0",
        "@docusaurus/theme-classic": "^3.10.0",
        "@docusaurus/mdx-loader": "^3.10.0",
        "@docsearch/react": "^3.0.0",
        "prism-react-renderer": "^2.0.0",
        "remark-gfm": "^4.0.0",
        "rehype-slug": "^6.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "docusaurus.config.ts"), [
      "import type {Config} from '@docusaurus/types';",
      "import type * as Preset from '@docusaurus/preset-classic';",
      "import remarkGfm from 'remark-gfm';",
      "import rehypeSlug from 'rehype-slug';",
      "",
      "export default async function createConfig(): Promise<Config> {",
      "  return {",
      "    title: 'Docs Demo',",
      "    tagline: 'Static documentation learning fixture',",
      "    favicon: 'img/favicon.ico',",
      "    url: 'https://docs.example.com',",
      "    baseUrl: '/',",
      "    onBrokenLinks: 'throw',",
      "    onBrokenMarkdownLinks: 'warn',",
      "    onDuplicateRoutes: 'throw',",
      "    staticDirectories: ['static'],",
      "    i18n: { defaultLocale: 'en', locales: ['en', 'fr'] },",
      "    presets: [[",
      "      'classic',",
      "      {",
      "        docs: {",
      "          sidebarPath: './sidebars.ts',",
      "          editUrl: 'https://github.com/acme/docs/edit/main/',",
      "          lastVersion: 'current',",
      "          onlyIncludeVersions: ['current', '1.0.0'],",
      "          admonitions: true,",
      "          remarkPlugins: [remarkGfm],",
      "          rehypePlugins: [rehypeSlug]",
      "        },",
      "        blog: { editUrl: 'https://github.com/acme/docs/edit/main/blog/' },",
      "        pages: {},",
      "        theme: { customCss: './src/css/custom.css' },",
      "        sitemap: { changefreq: 'weekly' }",
      "      } satisfies Preset.Options",
      "    ]],",
      "    plugins: [",
      "      '@docusaurus/plugin-sitemap',",
      "      '@docusaurus/plugin-client-redirects',",
      "      async function customPlugin() {",
      "        return {",
      "          name: 'custom-plugin',",
      "          loadContent() { return { generated: true }; },",
      "          async contentLoaded({actions}) {",
      "            const data = await actions.createData('generated.json', JSON.stringify({ok: true}));",
      "            actions.addRoute({ path: '/generated', component: '@site/src/pages/generated.tsx', modules: { data } });",
      "          },",
      "          configureWebpack() { return { resolve: { alias: { '@fixtures': './fixtures' } } }; },",
      "          postBuild() {}",
      "        };",
      "      }",
      "    ],",
      "    themeConfig: {",
      "      navbar: { items: [{ type: 'docSidebar', sidebarId: 'docs', label: 'Docs' }, { type: 'localeDropdown' }] },",
      "      footer: { links: [{ title: 'Docs', items: [{ label: 'Intro', to: '/docs/intro' }] }], copyright: 'MIT' },",
      "      colorMode: { defaultMode: 'dark', disableSwitch: false },",
      "      prism: { theme: {}, darkTheme: {} },",
      "      algolia: { appId: 'APP', apiKey: 'KEY', indexName: 'docs' },",
      "      docs: { sidebar: { hideable: true, autoCollapseCategories: true } }",
      "    } satisfies Preset.ThemeConfig",
      "  };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "sidebars.ts"), [
      "import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';",
      "const sidebars: SidebarsConfig = {",
      "  docs: [",
      "    { type: 'category', label: 'Guides', link: { type: 'generated-index' }, items: ['intro'] },",
      "    { type: 'category', label: 'Generated', items: [{ type: 'autogenerated', dirName: '.' }] }",
      "  ]",
      "};",
      "export default sidebars;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "intro.mdx"), [
      "---",
      "title: Intro",
      "description: Docusaurus MDX frontMatter document",
      "---",
      "import Translate, {translate} from '@docusaurus/Translate';",
      "",
      ":::tip",
      "Docusaurus admonitions and MDX components are static evidence.",
      ":::",
      "",
      "<Translate id=\"intro.cta\">Start</Translate>",
      "",
      "{translate({id: 'intro.label', message: 'Intro'})}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "blog", "2026-06-08-release.mdx"), "# Release\n\nBlog post with frontMatter and image metadata.\n");
    await fs.writeFile(path.join(sourceRoot, "src", "pages", "index.tsx"), [
      "import useDocusaurusContext from '@docusaurus/useDocusaurusContext';",
      "export default function Home() {",
      "  const {siteConfig} = useDocusaurusContext();",
      "  return <main>{siteConfig.title}</main>;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "theme", "DocItem", "index.tsx"), [
      "import DocItem from '@theme-original/DocItem';",
      "export default DocItem;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "i18n", "fr", "docusaurus-plugin-content-docs", "current", "intro.mdx"), "# Intro FR\n");
    await fs.writeFile(path.join(sourceRoot, "versioned_docs", "version-1.0.0", "intro.mdx"), "# Intro v1\n");
    await fs.writeFile(path.join(sourceRoot, "versioned_sidebars", "version-1.0.0-sidebars.json"), JSON.stringify({ docs: ["intro"] }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "static", "img", "favicon.ico"), "static asset placeholder\n");
    await fs.writeFile(path.join(sourceRoot, "netlify.toml"), "[build]\ncommand = \"npm run build\"\npublish = \"build\"\n");
    await fs.writeFile(path.join(sourceRoot, "vercel.json"), JSON.stringify({ buildCommand: "npm run build" }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "docs.yml"), [
      "name: docs",
      "on: [push, pull_request]",
      "jobs:",
      "  deploy:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run build",
      "      - run: npm run deploy",
      "        env:",
      "          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}",
      "      - uses: actions/upload-pages-artifact@v3",
      "        with:",
      "          path: build"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "documentation-report.json"), "utf8")) as {
      sourcePattern: string;
      docusaurusSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toContain("preset-classic plugin-content-docs plugin-content-blog theme-classic MDX admonitions swizzle plugin lifecycle");
    expect(readySignals(report.docusaurusSignals)).toEqual(expect.arrayContaining([
      "core-package",
      "preset-classic",
      "config-ts",
      "async-config",
      "docs-plugin",
      "blog-plugin",
      "pages-plugin",
      "theme-classic",
      "sidebars-config",
      "autogenerated-sidebar",
      "generated-index",
      "navbar-items",
      "footer-links",
      "theme-config",
      "prism-theme",
      "color-mode",
      "mdx-loader",
      "remark-plugin",
      "rehype-plugin",
      "admonitions",
      "edit-url",
      "broken-links-policy",
      "versioning",
      "i18n-config",
      "translate-api",
      "locale-dropdown",
      "docsearch",
      "sitemap-plugin",
      "client-redirects",
      "swizzle",
      "plugin-lifecycle",
      "configure-webpack",
      "content-loaded",
      "create-data",
      "static-assets",
      "deployment-netlify",
      "deployment-vercel",
      "github-pages"
    ]));
    expect(report.recommendedCommands.map((item) => item.command)).toContain("npx docusaurus swizzle --list");
    const documentationMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "documentation.md"), "utf8");
    expect(documentationMarkdown).toContain("## Docusaurus Signals");
    const documentationHtml = await fs.readFile(path.join(result.session.outputPaths.html, "documentation.html"), "utf8");
    expect(documentationHtml).toContain("Docusaurus Signals");
  }, 10000);

  it("detects GraphQL.js document utilities without executing operations", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-graphql-document-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-graphql-document-source-"));
    await fs.mkdir(path.join(sourceRoot, "src", "graphql"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "src", "graphql", "documents.ts"), [
      "import {",
      "  Kind,",
      "  Source,",
      "  TokenKind,",
      "  TypeInfo,",
      "  buildClientSchema,",
      "  buildSchema,",
      "  coerceInputValue,",
      "  concatAST,",
      "  execute,",
      "  extendSchema,",
      "  getIntrospectionQuery,",
      "  graphql,",
      "  introspectionFromSchema,",
      "  lex,",
      "  lexicographicSortSchema,",
      "  parse,",
      "  printSchema,",
      "  resolveSchemaCoordinate,",
      "  separateOperations,",
      "  specifiedRules,",
      "  stripIgnoredCharacters,",
      "  subscribe,",
      "  typeFromAST,",
      "  validate,",
      "  valueFromAST,",
      "  visit,",
      "  visitWithTypeInfo",
      "} from \"graphql\";",
      "",
      "const schema = buildSchema(`",
      "  type Query { course(id: ID!): Course version: String }",
      "  type Mutation { enroll(courseId: ID!): Boolean }",
      "  type Subscription { courseUpdated: Course }",
      "  type Course { id: ID! title: String! }",
      "`);",
      "",
      "const source = new Source(`",
      "  query GetCourse($id: ID!) { course(id: $id) { id title } }",
      "  mutation Enroll($courseId: ID!) { enroll(courseId: $courseId) }",
      "  subscription CourseUpdated { courseUpdated { id title } }",
      "  fragment CourseFields on Course { id title }",
      "`);",
      "",
      "const token = lex(source);",
      "if (token().kind === TokenKind.NAME) {",
      "  // Static fixture for token-kind detection only.",
      "}",
      "",
      "const document = parse(source);",
      "const typeInfo = new TypeInfo(schema);",
      "visit(document, visitWithTypeInfo(typeInfo, {",
      "  Field(node) {",
      "    if (node.kind === Kind.FIELD) {",
      "      typeInfo.getType();",
      "    }",
      "  }",
      "}));",
      "",
      "const separated = separateOperations(document);",
      "const compact = stripIgnoredCharacters(source);",
      "const extension = parse(\"extend type Query { lessonCount: Int }\");",
      "const combined = concatAST([document, extension]);",
      "const extended = extendSchema(schema, extension);",
      "const sorted = lexicographicSortSchema(extended);",
      "const printed = printSchema(sorted);",
      "const introspectionQuery = getIntrospectionQuery({ descriptions: true, inputValueDeprecation: true, typeDepth: 8 });",
      "const introspection = introspectionFromSchema(schema);",
      "const clientSchema = buildClientSchema(introspection);",
      "const coordinate = resolveSchemaCoordinate(extended, \"Query.course\");",
      "const fieldType = typeFromAST(schema, { kind: Kind.NAMED_TYPE, name: { kind: Kind.NAME, value: \"Course\" } });",
      "const literal = valueFromAST({ kind: Kind.STRING, value: \"course-1\" });",
      "const coerced = coerceInputValue(\"course-1\", schema.getType(\"ID\")!);",
      "const validationErrors = validate(schema, document, specifiedRules);",
      "const promise = graphql({ schema, source: \"query GetCourse { course(id: \\\"1\\\") { id } }\" });",
      "const execution = execute({ schema, document, variableValues: { id: \"1\" } });",
      "const subscription = subscribe({ schema, document });",
      "",
      "export const graphqlDocumentUtilityMap = {",
      "  clientSchema,",
      "  coerced,",
      "  combined,",
      "  compact,",
      "  coordinate,",
      "  execution,",
      "  fieldType,",
      "  introspectionQuery,",
      "  literal,",
      "  printed,",
      "  promise,",
      "  separated,",
      "  subscription,",
      "  validationErrors",
      "};",
      ""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        graphql: "^17.0.0"
      },
      scripts: {
        test: "vitest run"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.graphqlReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toContain("visit TypeInfo visitWithTypeInfo separateOperations concatAST stripIgnoredCharacters");
    expect(readySignals(report.documentSignals)).toEqual(expect.arrayContaining([
      "source-object",
      "lexer-token-kind",
      "ast-kind",
      "visit",
      "type-info",
      "visit-with-type-info",
      "separate-operations",
      "concat-ast",
      "strip-ignored-characters",
      "extend-schema",
      "lexicographic-sort-schema",
      "type-from-ast",
      "value-from-ast",
      "coerce-input-value",
      "schema-coordinate"
    ]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["parse", "validate", "specified-rules"]));
    expect(readySignals(report.executionSignals)).toEqual(expect.arrayContaining(["graphql", "execute", "subscribe", "variable-values"]));
    expect(report.recommendedCommands.some((item) => item.command.includes("visitWithTypeInfo") && item.command.includes("coerceInputValue"))).toBe(true);

    const graphqlReadinessText = await fs.readFile(path.join(result.session.outputPaths.analysis, "graphql-readiness-report.json"), "utf8");
    expect(graphqlReadinessText).toContain("\"documentSignals\"");
    expect(graphqlReadinessText).toContain("visit-with-type-info");
    const graphqlReadinessMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "graphql-readiness.md"), "utf8");
    expect(graphqlReadinessMarkdown).toContain("## Document Signals");
    const graphqlReadinessHtml = await fs.readFile(path.join(result.session.outputPaths.html, "graphql-readiness.html"), "utf8");
    expect(graphqlReadinessHtml).toContain("Document Signals");
  }, 10000);

  it("detects CODEOWNERS readiness patterns without contacting GitHub", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-codeowners-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-codeowners-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "rulesets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "packages", "api"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, ".github", "CODEOWNERS"), [
      "* @acme/platform",
      "/src/ @acme/app-team @octocat app@example.com",
      "/tests/ @acme/qa",
      "/packages/api/ @acme/api",
      "/.github/ @acme/security",
      "/.github/CODEOWNERS @acme/security",
      "/docs/ @acme/docs",
      "/src/ @acme/override"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "codeowners.yml"), [
      "name: codeowners",
      "on: [pull_request]",
      "jobs:",
      "  validate:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: mszostok/codeowners-validator@v0.7.4",
      "        with:",
      "          checks: files,owners,duppatterns,syntax",
      "          experimental_checks: notowned",
      "          owner_checker_owners_must_be_teams: true",
      "          owner_checker_allow_unowned_patterns: false",
      "          not_owned_checker_skip_patterns: docs/generated/**",
      "          github_access_token: ${{ secrets.GITHUB_TOKEN }}",
      "          repository_path: ${{ github.workspace }}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "rulesets", "main.json"), JSON.stringify({
      name: "main",
      target: "branch",
      enforcement: "active",
      rulesets: true,
      branchProtection: {
        required_approving_review_count: 2,
        requireCodeOwnerReview: "Require review from Code Owners",
        dismissStaleReviews: "dismiss stale reviews"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# CODEOWNERS fixture",
      "",
      "GitHub automatically requested code owners for review on pull request review flows.",
      "The last matching rule wins, so rule order matters for CODEOWNERS.",
      "Fork base branch behavior and draft pull request ready for review behavior are documented before enabling required code owner review.",
      "Use the codeowners/errors API to inspect CODEOWNERS API parsing errors.",
      "Paths are case-sensitive and must be cased correctly.",
      "The hmarr/codeowners parser can help inspect local ownership matches."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        owners: "codeowners --help",
        "owners:validate": "codeowners-validator --checks files,owners,duppatterns,syntax"
      },
      devDependencies: {
        "hmarr/codeowners": "^1.2.0",
        "codeowners-validator": "^0.7.4"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "app.ts"), "export const app = true;\n");
    await fs.writeFile(path.join(sourceRoot, "tests", "app.test.ts"), "export const covered = true;\n");
    await fs.writeFile(path.join(sourceRoot, "packages", "api", "index.ts"), "export const api = true;\n");
    await fs.writeFile(path.join(sourceRoot, "docs", "guide.md"), "# Guide\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.codeOwnershipReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const codeownersFile = report.codeownerFiles[0];

    expect(codeownersFile?.location).toBe("github");
    expect(codeownersFile?.ruleCount).toBeGreaterThanOrEqual(7);
    expect(codeownersFile?.teamOwnerCount).toBeGreaterThan(0);
    expect(codeownersFile?.userOwnerCount).toBeGreaterThan(0);
    expect(codeownersFile?.emailOwnerCount).toBeGreaterThan(0);
    expect(codeownersFile?.duplicatePatternCount).toBeGreaterThan(0);
    expect(codeownersFile?.selfOwnershipCount).toBeGreaterThan(0);
    expect(readySignals(report.ownershipSignals)).toEqual(expect.arrayContaining(["codeowners-file", "standard-location", "pattern-rules", "last-match-wins", "team-owner", "user-owner", "email-owner", "self-owned-codeowners"]));
    expect(readySignals(report.validationSignals)).toEqual(expect.arrayContaining(["syntax-check", "owner-check", "file-exists-check", "duplicate-pattern-check", "not-owned-check", "github-action", "api-errors"]));
    expect(readySignals(report.reviewSignals)).toEqual(expect.arrayContaining(["auto-review-request", "required-code-owner-review", "branch-protection", "rulesets", "dismiss-stale-review", "required-approving-review", "fork-base-branch", "draft-pr"]));
    expect(readySignals(report.coverageSignals)).toEqual(expect.arrayContaining(["root-default", "docs", "src", "tests", "github-directory", "packages", "unowned-allowed", "case-sensitive-paths"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["hmarr/codeowners", "codeowners-validator", "github-codeowners-api", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-ownership-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-ownership-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-ownership-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects SCIP code intelligence signals without running indexers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-symbol-intel-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-symbol-intel-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# SCIP fixture",
      "",
      "SCIP Code Intelligence Protocol writes index.scip data from scip.proto for precise code intelligence.",
      "Use scip lint, scip print --json, scip snapshot, scip stats, and scip test in a trusted workspace.",
      "The learning flow checks Go to definition, Find references, and Find implementations for important symbols.",
      "Occurrence ranges use position_encoding with start_line and end_line fields.",
      "SymbolInformation stores documentation, signature_documentation, and Relationship rows with is_definition, type_definition, and reference_symbol.",
      "Hover signature docstring data should be paired with Diagnostic diagnostics such as compiler error, warning, and severity.",
      "Language indexers include scip-java, scip-typescript, rust-analyzer, scip-clang, scip-ruby, scip-python, scip-dotnet, scip-dart, and scip-php."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "navigation.ts"), [
      "export interface Animal {",
      "  sound(): string;",
      "}",
      "export class Dog implements Animal {",
      "  sound() {",
      "    return speak('woof');",
      "  }",
      "}",
      "export function speak(value: string) {",
      "  return value;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const reportText = await fs.readFile(path.join(result.session.outputPaths.analysis, "symbol-map-report.json"), "utf8");
    const report = JSON.parse(reportText) as {
      totalSymbols: number;
      codeIntelligenceSignals: Array<{ signal: string; readiness: string }>;
      symbolNavigationPrompts: Array<{ title: string; question: string }>;
    };
    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };

    expect(report.totalSymbols).toBeGreaterThan(0);
    expectReady(report.codeIntelligenceSignals, [
      "scip-index",
      "scip-cli",
      "definition-navigation",
      "reference-navigation",
      "implementation-navigation",
      "occurrence-ranges",
      "symbol-information",
      "relationships",
      "hover-signature",
      "diagnostics",
      "snapshot-testing",
      "stats-command",
      "language-indexers"
    ]);
    expect(report.symbolNavigationPrompts.some((item) => item.title === "Go to definition")).toBe(true);
    expect(report.symbolNavigationPrompts.some((item) => item.question.includes("참조"))).toBe(true);

    const html = await fs.readFile(path.join(result.session.outputPaths.html, "symbol-map.html"), "utf8");
    expect(html).toContain("Code Intelligence Signals");
    expect(html).toContain("Symbol Navigation Prompts");
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "symbol-map.md"), "utf8");
    expect(markdown).toContain("## Code Intelligence Signals");
    expect(markdown).toContain("## Symbol Navigation Prompts");
  });

  it("detects Tree-sitter parser and query signals without running parsers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tree-sitter-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tree-sitter-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "queries"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "corpus"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test", "tags"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Tree-sitter fixture",
      "",
      "Tree-sitter is an incremental parser that can build a concrete syntax tree and update the syntax tree as the source file is edited.",
      "Trusted operators may run tree-sitter parse --cst --json-summary --stat, tree-sitter query --captures --row-range, tree-sitter highlight, tree-sitter tags, and tree-sitter test.",
      "Queries can inspect (ERROR) @error-node and (MISSING) @missing-node to separate syntax errors from missing tokens."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "grammar.js"), [
      "module.exports = grammar({",
      "  name: 'demo',",
      "  supertypes: ($) => [$._declaration],",
      "  rules: {",
      "    source_file: ($) => repeat($._declaration),",
      "    _declaration: ($) => choice($.function_declaration),",
      "    function_declaration: ($) => seq('fn', field('name', $.identifier), $.parameter_list),",
      "    parameter_list: () => '()',",
      "    identifier: () => /[a-z_]+/",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tree-sitter.json"), JSON.stringify({
      grammars: [{
        name: "demo",
        scope: "source.demo",
        fileTypes: ["demo"],
        highlights: "queries/highlights.scm",
        locals: "queries/locals.scm",
        injections: "queries/injections.scm"
      }]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "node-types.json"), JSON.stringify([
      {
        type: "function_declaration",
        named: true,
        fields: {
          name: {
            multiple: false,
            required: true,
            types: [{ type: "identifier", named: true }]
          }
        },
        children: {
          multiple: true,
          required: false,
          types: [{ type: "parameter_list", named: true }]
        }
      },
      {
        type: "_declaration",
        named: true,
        subtypes: [{ type: "function_declaration", named: true }]
      }
    ], null, 2));
    await fs.writeFile(path.join(sourceRoot, "queries", "highlights.scm"), [
      "\"fn\" @keyword",
      "(function_declaration name: (identifier) @function)",
      "(identifier) @type"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "queries", "locals.scm"), [
      "(function_declaration) @local.scope",
      "(function_declaration name: (identifier) @local.definition)",
      "(identifier) @local.reference",
      "((identifier) @variable.builtin (#is-not? local))"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "queries", "injections.scm"), [
      "((comment) @injection.content",
      "  (#set! injection.language \"doxygen\"))"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "queries", "tags.scm"), [
      "((comment)* @doc",
      "  .",
      "  (function_declaration name: (identifier) @name) @definition.function",
      "  (#strip! @doc \"^#\\\\s*\")",
      "  (#select-adjacent! @doc @definition.function))",
      "(call_expression function: (identifier) @name) @reference.call"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "corpus", "functions.txt"), [
      "==================",
      "Function declarations",
      ":cst",
      "==================",
      "",
      "fn greet()",
      "",
      "---",
      "",
      "(source_file",
      "  (function_declaration",
      "    name: (identifier)",
      "    (parameter_list)))"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "test", "tags", "functions.demo"), [
      "fn greet()",
      "#  ^ definition.function"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "navigation.ts"), [
      "export function greet(name: string) {",
      "  return name;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const reportText = await fs.readFile(path.join(result.session.outputPaths.analysis, "symbol-map-report.json"), "utf8");
    const report = JSON.parse(reportText) as {
      syntaxParserSignals: Array<{ signal: string; readiness: string }>;
      syntaxQueryPrompts: Array<{ title: string; question: string }>;
    };
    const readySignals = report.syntaxParserSignals.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(readySignals).toEqual(expect.arrayContaining([
      "tree-sitter-grammar",
      "incremental-parser",
      "concrete-syntax-tree",
      "node-types",
      "query-captures",
      "highlight-query",
      "locals-query",
      "injections-query",
      "tags-query",
      "parse-command",
      "query-command",
      "grammar-tests",
      "error-node-query"
    ]));
    expect(report.syntaxQueryPrompts.some((item) => item.title === "Trace grammar to node-types")).toBe(true);
    expect(report.syntaxQueryPrompts.some((item) => item.question.includes("@definition"))).toBe(true);

    const html = await fs.readFile(path.join(result.session.outputPaths.html, "symbol-map.html"), "utf8");
    expect(html).toContain("Syntax Parser Signals");
    expect(html).toContain("Syntax Query Prompts");
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "symbol-map.md"), "utf8");
    expect(markdown).toContain("## Syntax Parser Signals");
    expect(markdown).toContain("## Syntax Query Prompts");
  });

  it("emits Zoekt-style code search query drills without running search indexes", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-code-search-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-code-search-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Code search fixture",
      "",
      "This repo demonstrates a request router and cache invalidation flow.",
      "Learners should search for the public handler and compare implementation files."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "router.ts"), [
      "export function routeRequest(pathname: string) {",
      "  if (pathname === '/health') return 'ok';",
      "  return invalidateCache(pathname);",
      "}",
      "export function invalidateCache(key: string) {",
      "  return `cache:${key}`;",
      "}"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const reportText = await fs.readFile(path.join(result.session.outputPaths.analysis, "search-index-report.json"), "utf8");
    const report = JSON.parse(reportText) as {
      codeSearchQuerySignals: Array<{ signal: string; readiness: string }>;
      codeSearchDrillPrompts: Array<{ queryType: string; query: string; learningGoal: string }>;
    };
    const readySignals = report.codeSearchQuerySignals.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const staticOnlySignals = report.codeSearchQuerySignals.filter((item) => item.readiness === "static-only").map((item) => item.signal);
    const suggestedSignals = report.codeSearchQuerySignals.filter((item) => item.readiness === "suggested").map((item) => item.signal);

    expect(readySignals).toEqual(expect.arrayContaining(["substring-search", "file-filter", "language-filter", "symbol-search"]));
    expect(suggestedSignals).toEqual(expect.arrayContaining(["regexp-search", "boolean-operators", "repo-filter", "branch-filter", "case-sensitivity", "result-type-filter"]));
    expect(staticOnlySignals).toEqual(expect.arrayContaining(["trigram-index", "ctags-ranking", "index-shards", "json-api"]));
    expect(report.codeSearchDrillPrompts.some((item) => item.queryType === "scope" && item.query.includes("lang:typescript"))).toBe(true);
    expect(report.codeSearchDrillPrompts.some((item) => item.queryType === "symbol" && item.query.includes("sym:"))).toBe(true);
    expect(report.codeSearchDrillPrompts.some((item) => item.queryType === "regex" && item.query.includes("content:/"))).toBe(true);

    const html = await fs.readFile(path.join(result.session.outputPaths.html, "search-index.html"), "utf8");
    expect(html).toContain("Code Search Query Signals");
    expect(html).toContain("Code Search Drill Prompts");
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "search-index.md"), "utf8");
    expect(markdown).toContain("## Code Search Query Signals");
    expect(markdown).toContain("## Code Search Drill Prompts");
  });

  it("detects code metrics readiness patterns without running metric tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-code-metrics-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-code-metrics-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Code metrics fixture",
      "",
      "Use scc --by-file --wide --format json . and scc --hotspots --format json .",
      "Use lizard -l javascript -l typescript -l python . and tokei --output json .",
      "Use cloc --json . for a second LOC comparison and scc --by-file --wide --format html --report . for an HTML report.",
      "The team reviews function length and parameter count thresholds alongside cognitive complexity.",
      "COCOMO and LOCOMO reports are reviewed as estimates.",
      "CodeCharta Web Studio uses cc.json maps where files become buildings and area, height, and color represent selected metrics.",
      "Data stays local with no analytics or telemetry, and compare two maps exposes delta changes over time.",
      "The analysis pipeline includes RawTextParser, SourceCodeParser, GitLogParser, SonarImporter, TokeiImporter, CodeMaat, CSVImporter, CoverageImporter, EdgeFilter, MergeFilter, StructureModifier, ValidationTool, and InspectionTool."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "metrics:scc": "scc --by-file --wide --format json .",
        "metrics:hotspots": "scc --hotspots --format json .",
        "metrics:lizard": "lizard -l typescript --CCN 8 .",
        "metrics:tokei": "tokei --output json .",
        "metrics:cloc": "cloc --json .",
        "metrics:html": "scc --by-file --wide --format html --report .",
        "metrics:codecharta": "ccsh rawtextparser ."
      },
      devDependencies: {
        "complexity-report": "^1.0.0",
        eslint: "^9.0.0"
      },
      eslintConfig: {
        rules: {
          complexity: ["error", 8],
          "sonarjs/cognitive-complexity": ["warn", 10],
          "max-params": ["warn", 4],
          "max-lines-per-function": ["warn", 80]
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".sccignore"), "dist\ncoverage\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "metrics.yml"), [
      "name: metrics",
      "on: [pull_request]",
      "jobs:",
      "  metrics:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: scc --by-file --wide --format json .",
      "      - run: scc --hotspots --format csv .",
      "      - run: scc --by-file --wide --format html --report .",
      "      - run: lizard --CCN 8 src",
      "      - run: tokei --output json .",
      "      - run: cloc --json .",
      "      - run: ccsh rawtextparser .",
      "      - run: echo openmetrics threshold baseline diff-check hotspot report CodeCharta cc.json Web Studio area height color delta"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "codecharta.md"), [
      "# CodeCharta map workflow",
      "",
      "Upload codecharta.cc.json to Web Studio for a local 3D map.",
      "Use area for rloc or code lines, height for branch-token complexity, color for complexity density, and delta for baseline comparison.",
      "Run ValidationTool against generatedSchema.json and InspectionTool to inspect cc.json metadata before sharing."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "codecharta.cc.json"), JSON.stringify({
      projectName: "fixture",
      apiVersion: "1.3",
      nodes: [
        {
          name: "root",
          type: "Folder",
          attributes: { rloc: 10, mcc: 3 },
          children: [{ name: "complex.ts", type: "File", attributes: { rloc: 8, mcc: 3 } }]
        }
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "complex.ts"), [
      "// Keep comment lines visible for scc-style reports.",
      "",
      "export function complex(value: number) {",
      "  if (value > 10) {",
      "    for (let index = 0; index < value; index += 1) {",
      "      if (index % 2 === 0 && value !== 13) {",
      "        while (value > index) { break; }",
      "      } else if (index === 3 || value === 4) {",
      "        switch (index) { case 1: return value; default: break; }",
      "      }",
      "    }",
      "  }",
      "  return value > 0 ? value : 0;",
      "}",
      "export const arrow = (flag: boolean) => flag ? complex(12) : 0;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "small.py"), [
      "def helper(value):",
      "    if value:",
      "        return value",
      "    return 0"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const reportText = await fs.readFile(path.join(result.session.outputPaths.analysis, "code-metrics-readiness-report.json"), "utf8");
    const report = JSON.parse(reportText) as {
      totals: { codeLines: number; commentLines: number; blankLines: number; branchCount: number };
      languageMetrics: Array<{ language: string; codeLines: number }>;
      hotspots: Array<{ filePath: string; branchCount: number; functionCount: number; readingPriority: string }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      metricSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      codeMapMetricBindings: Array<{ channel: string; readiness: string }>;
      codeMapSignals: Array<{ signal: string; readiness: string }>;
    };
    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };

    expect(report.totals.codeLines).toBeGreaterThan(0);
    expect(report.totals.commentLines).toBeGreaterThan(0);
    expect(report.totals.blankLines).toBeGreaterThan(0);
    expect(report.totals.branchCount).toBeGreaterThan(0);
    expect(report.languageMetrics.some((item) => item.language === "TypeScript" && item.codeLines > 0)).toBe(true);
    const complex = report.hotspots.find((item) => item.filePath === "src/complex.ts");
    expect(complex?.branchCount).toBeGreaterThan(0);
    expect(complex?.functionCount).toBeGreaterThan(0);
    expect(complex?.readingPriority).toBe("high");
    expectReady(report.toolSignals, ["scc", "lizard", "tokei", "cloc", "eslint-complexity", "complexity-report", "cocomo", "locomo", "codecharta"]);
    expectReady(report.metricSignals, ["loc", "blank-lines", "comment-lines", "code-lines", "cognitive", "function-length", "parameter-count"]);
    expect(report.metricSignals.some((item) => item.signal === "cyclomatic" && item.readiness === "partial")).toBe(true);
    expect(report.metricSignals.some((item) => item.signal === "function-count" && item.readiness === "partial")).toBe(true);
    expect(report.metricSignals.some((item) => item.signal === "hotspots" && item.readiness === "partial")).toBe(true);
    expectReady(report.workflowSignals, ["json-output", "csv-output", "html-report", "openmetrics", "threshold", "ci-complexity", "baseline", "diff-check", "ignore-file", "hotspot-report"]);
    expect(report.codeMapMetricBindings.some((item) => item.channel === "area" && item.readiness === "ready")).toBe(true);
    expect(report.codeMapMetricBindings.some((item) => item.channel === "height" && item.readiness === "partial")).toBe(true);
    expect(report.codeMapMetricBindings.some((item) => item.channel === "color" && item.readiness === "partial")).toBe(true);
    expect(report.codeMapMetricBindings.some((item) => item.channel === "delta" && item.readiness === "ready")).toBe(true);
    expectReady(report.codeMapSignals, ["cc-json", "source-parser", "git-log-parser", "metric-importer", "filter-pipeline", "web-studio", "local-only", "delta-comparison", "validation-tool", "inspection-tool"]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "code-metrics-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "code-metrics-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "code-metrics-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects large asset readiness patterns without running Git LFS or DVC", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-large-asset-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-large-asset-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".dvc"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "data"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "models"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "scripts"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, ".gitattributes"), [
      "*.psd filter=lfs diff=lfs merge=lfs -text lockable",
      "*.zip filter=lfs diff=lfs merge=lfs -text",
      "models/*.onnx filter=lfs diff=lfs merge=lfs -text"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "models", "model-lfs-pointer.txt"), [
      "version https://git-lfs.github.com/spec/v1",
      "oid sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      "size 123456"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dvc", "config"), [
      "[core]",
      "    remote = storage",
      "['remote \"storage\"']",
      "    url = s3://repotutor-fixture-bucket/path",
      "[cache]",
      "    dir = .dvc/cache"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dvcignore"), "tmp/**\n");
    await fs.writeFile(path.join(sourceRoot, "dvc.yaml"), [
      "stages:",
      "  featurize:",
      "    cmd: python scripts/featurize.py",
      "    deps:",
      "      - data/raw",
      "      - scripts/featurize.py",
      "    outs:",
      "      - data/features",
      "    metrics:",
      "      - metrics.json",
      "    params:",
      "      - train.epochs"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "dvc.lock"), [
      "schema: '2.0'",
      "stages:",
      "  featurize:",
      "    cmd: python scripts/featurize.py",
      "    deps:",
      "      - path: data/raw",
      "        md5: abc123",
      "    outs:",
      "      - path: data/features",
      "        md5: def456"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "data", "raw.dvc"), [
      "outs:",
      "- path: data/raw",
      "  md5: abc123",
      "  size: 123"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".gitmodules"), [
      "[submodule \"assets/vendor\"]",
      "  path = assets/vendor",
      "  url = https://example.com/vendor-assets.git"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "assets.yml"), [
      "name: assets",
      "on: [push]",
      "jobs:",
      "  assets:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "        with:",
      "          lfs: true",
      "          submodules: recursive",
      "      - uses: actions/cache@v4",
      "        with:",
      "          path: .dvc/cache",
      "          key: dvc-cache",
      "      - run: git lfs pull && git lfs status --json && git lfs fsck --pointers HEAD",
      "      - run: dvc doctor && dvc status && dvc pull && dvc repro && dvc push"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "scripts", "assets.sh"), [
      "git lfs install --local --skip-smudge",
      "git lfs track \"*.psd\"",
      "git lfs fetch",
      "git lfs push origin main",
      "git lfs migrate info --everything --pointers=ignore --top=100",
      "git lfs prune",
      "git lfs locks",
      "git submodule update --init --recursive",
      "dvc status",
      "dvc pull",
      "dvc push",
      "dvc repro"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Large asset fixture",
      "",
      "Git LFS patterns are case-sensitive; use bracketed case patterns when needed.",
      "Contributors run git lfs pull, git lfs locks, and dvc pull before model work.",
      "DVC remote storage uses dvc-s3 and the default remote configured in .dvc/config."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "assets:lfs": "git lfs status --json && git lfs fsck --pointers HEAD",
        "assets:dvc": "dvc status && dvc repro && dvc push"
      },
      devDependencies: {
        "git-lfs": "^3.0.0",
        dvc: "^3.0.0",
        "dvc-s3": "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "scripts", "featurize.py"), "print('feature fixture')\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.largeAssetReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const attributesSetup = report.assetSetups.find((item) => item.filePath === ".gitattributes");
    const dvcConfigSetup = report.assetSetups.find((item) => item.filePath === ".dvc/config");
    const dvcYamlSetup = report.assetSetups.find((item) => item.filePath === "dvc.yaml");
    const submoduleSetup = report.assetSetups.find((item) => item.filePath === ".gitmodules");

    expect(report.assetSetups.length).toBeGreaterThan(0);
    expect(attributesSetup?.tool).toBe("git-lfs");
    expect(attributesSetup?.patternCount).toBeGreaterThan(0);
    expect(attributesSetup?.lockableCount).toBeGreaterThan(0);
    expect(dvcConfigSetup?.tool).toBe("dvc");
    expect(dvcConfigSetup?.remoteCount).toBeGreaterThan(0);
    expect(dvcConfigSetup?.cacheCount).toBeGreaterThan(0);
    expect(dvcYamlSetup?.outCount).toBeGreaterThan(0);
    expect(dvcYamlSetup?.depCount).toBeGreaterThan(0);
    expect(dvcYamlSetup?.metricCount).toBeGreaterThan(0);
    expect(submoduleSetup?.tool).toBe("git-submodule");
    expect(readySignals(report.lfsSignals)).toEqual(expect.arrayContaining(["gitattributes", "filter-lfs", "diff-merge-lfs", "pointer-file", "oid-sha256", "track-command", "install-command", "status-command", "pull-push-fetch", "fsck", "migrate", "prune", "lockable", "locks", "skip-smudge", "case-sensitive-patterns"]));
    expect(readySignals(report.dvcSignals)).toEqual(expect.arrayContaining(["dvc-yaml", "dvc-lock", "dvc-file", "outs", "deps", "metrics", "params", "remote-config", "default-remote", "cache", "push", "pull", "status", "repro", "dvcignore", "optional-remote-deps"]));
    expect(readySignals(report.submoduleSignals)).toEqual(expect.arrayContaining(["gitmodules", "submodule-url", "submodule-path", "recursive-clone"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["ci-fetch", "ci-pull", "ci-push", "artifact-cache", "checkout-lfs", "dvc-repro", "dvc-doctor"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["git-lfs", "dvc", "dvc-s3", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "large-asset-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "large-asset-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "large-asset-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects integration test environment readiness without starting containers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-integration-env-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-integration-env-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests", "integration"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest run",
        "test:integration": "vitest run tests/integration --runInBand"
      },
      devDependencies: {
        testcontainers: "^12.0.0",
        "@testcontainers/postgresql": "^12.0.0",
        vitest: "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tests", "integration", "postgres.test.ts"), [
      "import { afterAll, beforeAll, describe, expect, it } from \"vitest\";",
      "import { GenericContainer, Wait, type StartedTestContainer } from \"testcontainers\";",
      "import { PostgreSqlContainer } from \"@testcontainers/postgresql\";",
      "",
      "let redis: StartedTestContainer;",
      "let postgres: StartedTestContainer;",
      "",
      "beforeAll(async () => {",
      "  redis = await new GenericContainer(\"redis:8\")",
      "    .withExposedPorts(6379)",
      "    .withEnvironment({ ALLOW_EMPTY_PASSWORD: \"yes\" })",
      "    .withWaitStrategy(Wait.forAll([Wait.forListeningPorts(), Wait.forLogMessage(\"Ready to accept connections\")]))",
      "    .withStartupTimeout(120_000)",
      "    .start();",
      "  postgres = await new PostgreSqlContainer(\"postgres:16\")",
      "    .withDatabase(\"app_test\")",
      "    .withUsername(\"app\")",
      "    .withPassword(\"secret\")",
      "    .start();",
      "});",
      "",
      "afterAll(async () => {",
      "  await postgres.stop();",
      "  await redis.stop();",
      "});",
      "",
      "describe(\"integration env\", () => {",
      "  it(\"uses started services\", () => expect(redis.getMappedPort(6379)).toBeGreaterThan(0));",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"integration-env-fixture\"",
      "dependencies = [\"testcontainers[postgres]\", \"pytest\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "conftest.py"), [
      "import pytest",
      "from testcontainers.postgres import PostgresContainer",
      "from testcontainers.core.waiting_utils import wait_for_logs, wait_for_http",
      "",
      "@pytest.fixture(scope=\"session\")",
      "def postgres_container():",
      "    container = PostgresContainer(\"postgres:16\")",
      "    container.with_exposed_ports(5432)",
      "    container.with_env(\"POSTGRES_DB\", \"app_test\")",
      "    container.start()",
      "    wait_for_logs(container, \"database system is ready to accept connections\")",
      "    wait_for_http(\"/health\", port=8080)",
      "    try:",
      "        yield container",
      "    finally:",
      "        container.stop()"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "integration.yml"), [
      "name: integration",
      "on: [push]",
      "jobs:",
      "  integration:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      DOCKER_HOST: unix:///var/run/docker.sock",
      "      TESTCONTAINERS_RYUK_DISABLED: \"false\"",
      "      TESTCONTAINERS_TIMEOUT: \"120\"",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: docker compose version",
      "      - run: npm run test:integration"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "testcontainers.properties"), "testcontainers.reuse.enable=false\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.integrationTestEnvironmentReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const nodeSetup = report.integrationSetups.find((item) => item.filePath.endsWith("postgres.test.ts"));
    const pythonSetup = report.integrationSetups.find((item) => item.filePath.endsWith("conftest.py"));

    expect(report.integrationSetups.length).toBeGreaterThan(0);
    expect(nodeSetup?.ecosystem).toBe("testcontainers-node");
    expect(nodeSetup?.containerCount).toBeGreaterThan(0);
    expect(nodeSetup?.hasWaitStrategy).toBe(true);
    expect(nodeSetup?.hasLifecycleCleanup).toBe(true);
    expect(pythonSetup?.ecosystem).toBe("testcontainers-python");
    expect(pythonSetup?.hasLifecycleCleanup).toBe(true);
    expect(readySignals(report.containerSignals)).toEqual(expect.arrayContaining(["generic-container", "specialized-module", "exposed-ports", "env-vars"]));
    expect(readySignals(report.waitSignals)).toEqual(expect.arrayContaining(["listening-ports", "log-message", "startup-timeout", "wait-for-logs", "wait-for-http"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["start", "stop", "before-all", "after-all", "ryuk", "reuse"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["docker-host", "compose-binary", "socket", "env-config", "timeout"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["testcontainers", "@testcontainers/*", "testcontainers-python", "pytest", "vitest"]));
    expect(report.riskQueue.at(-1)?.action).toContain("Run integration tests only in a trusted workspace");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "integration-test-environment-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "integration-test-environment-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "integration-test-environment-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects chaos engineering readiness patterns without running chaos tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-chaos-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-chaos-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "chaos"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "go.mod"), [
      "module example.com/chaosfixture",
      "",
      "require github.com/Shopify/toxiproxy v2.12.0+incompatible"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "network-delay.yaml"), [
      "apiVersion: chaos-mesh.org/v1alpha1",
      "kind: NetworkChaos",
      "metadata:",
      "  name: checkout-network-delay",
      "  namespace: chaos-testing",
      "spec:",
      "  action: delay",
      "  mode: one",
      "  selector:",
      "    namespaces:",
      "      - default",
      "    labelSelectors:",
      "      app: checkout",
      "  duration: \"30s\"",
      "  containerNames:",
      "    - app",
      "  delay:",
      "    latency: \"200ms\"",
      "    correlation: \"25\"",
      "---",
      "apiVersion: chaos-mesh.org/v1alpha1",
      "kind: Schedule",
      "metadata:",
      "  name: checkout-chaos-schedule",
      "spec:",
      "  schedule: \"@every 10m\"",
      "  type: NetworkChaos",
      "  historyLimit: 1"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "litmus-engine.yaml"), [
      "apiVersion: litmuschaos.io/v1alpha1",
      "kind: ChaosEngine",
      "metadata:",
      "  name: checkout-litmus",
      "  namespace: chaos-testing",
      "spec:",
      "  annotationCheck: \"true\"",
      "  chaosServiceAccount: litmus-admin",
      "  jobCleanUpPolicy: delete",
      "  appinfo:",
      "    appns: default",
      "    applabel: app=checkout",
      "    appkind: deployment",
      "  experiments:",
      "    - name: pod-network-latency",
      "      spec:",
      "        components:",
      "          env:",
      "            - name: TOTAL_CHAOS_DURATION",
      "              value: \"30\"",
      "            - name: CHAOS_INTERVAL",
      "              value: \"10\"",
      "        probe:",
      "          - name: checkout-http-steady-state",
      "            type: httpProbe",
      "            mode: SOT",
      "            httpProbe/inputs:",
      "              url: http://checkout.default/health",
      "          - name: checkout-prometheus-steady-state",
      "            type: promProbe",
      "            mode: EOT",
      "            promProbe/inputs:",
      "              endpoint: http://prometheus.monitoring:9090",
      "              query: rate(http_requests_total[1m])",
      "---",
      "apiVersion: litmuschaos.io/v1alpha1",
      "kind: ChaosExperiment",
      "metadata:",
      "  name: pod-delete"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "litmus-result.yaml"), [
      "apiVersion: litmuschaos.io/v1alpha1",
      "kind: ChaosResult",
      "metadata:",
      "  name: checkout-pod-network-latency",
      "spec:",
      "  engine: checkout-litmus"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "chaos", "prometheus-rules.yaml"), [
      "apiVersion: monitoring.coreos.com/v1",
      "kind: PrometheusRule",
      "metadata:",
      "  name: litmuschaos-alerts",
      "spec:",
      "  groups:",
      "    - name: litmuschaos",
      "      rules:",
      "        - alert: ChaosExperimentFailed",
      "          expr: litmuschaos_awaited_probe_success_total < 1",
      "          labels:",
      "            dashboard: grafana",
      "            metrics: litmuschaos_awaited_probe_success_total"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "toxiproxy_test.go"), [
      "package tests",
      "",
      "import toxiproxy \"github.com/Shopify/toxiproxy/client\"",
      "",
      "func configureProxy() error {",
      "  client := toxiproxy.NewClient(\"localhost:8474\")",
      "  proxy, err := client.CreateProxy(\"postgres\", \"localhost:15432\", \"localhost:5432\")",
      "  if err != nil { return err }",
      "  toxic, err := proxy.AddToxic(\"db_latency\", \"latency\", \"downstream\", 1.0, toxiproxy.Attributes{\"latency\": 200})",
      "  if err != nil { return err }",
      "  _ = toxic.Update()",
      "  return proxy.RemoveToxic(\"db_latency\")",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "chaos.yml"), [
      "name: chaos",
      "on: [workflow_dispatch]",
      "jobs:",
      "  validate-chaos:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: helm template chaos-mesh chaos-mesh/chaos-mesh --dry-run",
      "      - run: kubectl apply --dry-run=server -f chaos/",
      "      - run: kubectl get chaosresults --all-namespaces"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.chaosEngineeringReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const meshSetup = report.chaosSetups.find((item) => item.filePath.endsWith("network-delay.yaml"));
    const litmusSetup = report.chaosSetups.find((item) => item.filePath.endsWith("litmus-engine.yaml"));
    const toxiproxySetup = report.chaosSetups.find((item) => item.filePath.endsWith("toxiproxy_test.go"));

    expect(report.chaosSetups.length).toBeGreaterThan(0);
    expect(meshSetup?.platform).toBe("chaos-mesh");
    expect(meshSetup?.hasSelector).toBe(true);
    expect(meshSetup?.hasDuration).toBe(true);
    expect(litmusSetup?.platform).toBe("litmus");
    expect(litmusSetup?.hasProbeOrSteadyState).toBe(true);
    expect(toxiproxySetup?.platform).toBe("toxiproxy");
    expect(readySignals(report.experimentSignals)).toEqual(expect.arrayContaining(["network-chaos", "schedule", "chaos-engine", "chaos-experiment", "chaos-result", "toxiproxy"]));
    expect(readySignals(report.faultSignals)).toEqual(expect.arrayContaining(["network-delay", "pod-delete", "latency-toxic"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["selector", "namespace", "label-selector", "mode", "duration", "container-names", "target", "service-account", "annotation-check"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["probe", "steady-state", "sot", "eot", "prometheus-probe", "http-probe", "cleanup", "job-cleanup-policy"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["prometheus", "grafana", "alert-rule", "metrics", "chaos-result"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["chaos-mesh", "litmuschaos", "toxiproxy", "helm", "kubectl"]));
    expect(report.riskQueue.at(-1)?.action).toContain("approved non-production environment");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "chaos-engineering-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "chaos-engineering-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "chaos-engineering-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects consumer contract readiness patterns without running Pact tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consumer-contract-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-consumer-contract-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:pact": "vitest run tests/consumer.pact.test.ts",
        "pact:verify": "node tests/provider.pact.test.ts",
        "pact:publish": "pact-broker publish pacts --consumer-app-version $GITHUB_SHA",
        "pact:can-i-deploy": "pact-broker can-i-deploy --pacticipant checkout-web --version $GITHUB_SHA --to-environment production"
      },
      devDependencies: {
        "@pact-foundation/pact": "^13.0.0",
        "pact-broker-client": "^1.0.0",
        "pactflow-cli": "^1.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tests", "consumer.pact.test.ts"), [
      "import { PactV3, MatchersV3 } from '@pact-foundation/pact';",
      "",
      "const provider = new PactV3({ consumer: 'checkout-web', provider: 'inventory-api' });",
      "",
      "it('gets available inventory through a consumer contract', async () => {",
      "  await provider",
      "    .given('inventory item exists', { sku: 'sku-1' })",
      "    .uponReceiving('a request for available inventory')",
      "    .withRequest({",
      "      method: 'GET',",
      "      path: MatchersV3.fromProviderState('/inventory/${sku}', '/inventory/sku-1'),",
      "      headers: { Authorization: MatchersV3.regex('Bearer token', 'Bearer .+') },",
      "      body: { traceId: MatchersV3.like('primary') }",
      "    })",
      "    .willRespondWith({",
      "      status: 200,",
      "      headers: { 'Content-Type': 'application/json' },",
      "      body: { items: MatchersV3.eachLike({ sku: MatchersV3.regex('sku-1', 'sku-[0-9]+'), quantity: MatchersV3.like(2) }) }",
      "    })",
      "    .executeTest(async (mockServer) => fetch(`${mockServer.url}/inventory/sku-1`));",
      "});",
      "",
      "const messageContract = 'asynchronous message pact for Kafka order events';",
      "const graphqlInteraction = 'GraphQLInteraction plugin contract';",
      "void messageContract;",
      "void graphqlInteraction;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "provider.pact.test.ts"), [
      "import { Verifier } from '@pact-foundation/pact';",
      "",
      "export async function verifyInventoryProvider() {",
      "  const verifier = new Verifier({",
      "    provider: 'inventory-api',",
      "    providerBaseUrl: 'http://localhost:8080',",
      "    pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,",
      "    pactBrokerToken: process.env.PACT_BROKER_TOKEN,",
      "    publishVerificationResult: true,",
      "    providerVersion: process.env.PACT_PROVIDER_VERSION,",
      "    providerVersionBranch: process.env.PACT_PROVIDER_BRANCH,",
      "    enablePending: true,",
      "    includeWipPactsSince: '2024-01-01',",
      "    consumerVersionSelectors: [{ matchingBranch: true }, { deployedOrReleased: true }],",
      "    stateHandlers: {",
      "      'inventory item exists': async () => ({ sku: 'sku-1' })",
      "    }",
      "  });",
      "  return verifier.verifyProvider();",
      "}",
      "",
      "void 'PactVerificationContext @Provider @State provider state provider states';"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "pact.yml"), [
      "name: pact",
      "on: [pull_request]",
      "jobs:",
      "  contract:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run test:pact",
      "      - run: npm run pact:verify",
      "      - run: pact-broker publish pacts --consumer-app-version $GITHUB_SHA --broker-base-url $PACT_BROKER_BASE_URL",
      "      - run: pact-broker can-i-deploy --pacticipant checkout-web --version $GITHUB_SHA --to-environment production",
      "      - run: echo junit pact verification report"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.consumerContractReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const consumerSetup = report.contractSetups.find((item) => item.filePath.endsWith("consumer.pact.test.ts"));
    const providerSetup = report.contractSetups.find((item) => item.filePath.endsWith("provider.pact.test.ts"));

    expect(report.contractSetups.length).toBeGreaterThan(0);
    expect(consumerSetup?.framework).toBe("pact-js");
    expect(consumerSetup?.interactionCount).toBeGreaterThan(0);
    expect(consumerSetup?.providerStateCount).toBeGreaterThan(0);
    expect(consumerSetup?.matcherCount).toBeGreaterThan(0);
    expect(consumerSetup?.readiness).toBe("ready");
    expect(providerSetup?.framework).toBe("pact-js");
    expect(providerSetup?.verifierCount).toBeGreaterThan(0);
    expect(providerSetup?.brokerCount).toBeGreaterThan(0);
    expect(readySignals(report.interactionSignals)).toEqual(expect.arrayContaining(["pact-v3", "given", "upon-receiving", "with-request", "will-respond-with", "execute-test", "message", "graphql", "plugin"]));
    expect(readySignals(report.providerSignals)).toEqual(expect.arrayContaining(["verifier", "provider-state", "state-handlers", "provider-base-url", "verification-context", "publish-results", "provider-version", "provider-branch"]));
    expect(readySignals(report.brokerSignals)).toEqual(expect.arrayContaining(["pact-broker", "pactflow", "can-i-deploy", "consumer-version-selector", "pending-pacts", "wip-pacts", "token-auth"]));
    expect(readySignals(report.matcherSignals)).toEqual(expect.arrayContaining(["like", "each-like", "regex", "from-provider-state", "headers", "body"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["publish-pact", "verify-provider", "junit", "github-actions", "npm-script"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@pact-foundation/pact", "pact-broker-client", "pactflow"]));
    expect(report.riskQueue.at(-1)?.action).toContain("Run Pact consumer tests");
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "consumer-contract-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "consumer-contract-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "consumer-contract-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects mutation testing readiness patterns without executing mutation engines", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mutation-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mutation-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports", "mutation"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "lib"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Mutation testing fixture",
      "",
      "This project documents mutation testing, mutator review, mutation score, and survived mutant handling."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "calc.ts"), "export const add = (a: number, b: number) => a + b;\n");
    await fs.writeFile(path.join(sourceRoot, "lib", "legacy.ts"), "export const negate = (value: boolean) => !value;\n");
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        test: "vitest run",
        "test:mutation": "stryker run --reporters html,json,clear-text,progress,dashboard,badge,junit",
        "test:mutation:incremental": "stryker run --incremental --dry-run"
      },
      devDependencies: {
        "@stryker-mutator/core": "^8.0.0",
        "@stryker-mutator/vitest-runner": "^8.0.0",
        "@stryker-mutator/jest-runner": "^8.0.0",
        "mutation-testing-report-schema": "^3.0.0",
        "infection/infection": "^0.29.0",
        mutmut: "^3.0.0",
        pitest: "^1.15.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "stryker.conf.json"), JSON.stringify({
      "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
      mutate: ["src/**/*.ts", "lib/**/*.ts", "!src/**/*.test.ts"],
      mutator: { excludedMutations: ["StringLiteral"] },
      testRunner: "vitest",
      coverageAnalysis: "perTest",
      reporters: ["html", "json", "clear-text", "progress", "dashboard", "badge", "junit"],
      thresholds: { high: 80, low: 60, break: 50 },
      timeoutMS: 10000,
      timeoutFactor: 1.5,
      incremental: true,
      disableTypeChecks: "{src,lib,test}/**/*.{ts,tsx}",
      ignoreStatic: true,
      dashboard: { project: "repotutor-fixture" }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "infection.json"), JSON.stringify({
      "$schema": "vendor/infection/infection/resources/schema.json",
      source: { directories: ["src", "lib"] },
      sourceDirs: ["src", "lib"],
      testFramework: "phpunit",
      timeout: 15,
      logs: {
        html: "reports/infection.html",
        json: "reports/infection.json",
        text: "reports/infection.txt",
        junit: "reports/infection-junit.xml"
      },
      mutators: { "@default": true, BooleanLiteral: true, ReturnRemoval: true },
      minMsi: 80,
      minCoveredMsi: 90,
      withUncovered: true,
      notes: "Killed Survived Timeout Ignored NoCoverage with-uncovered covered MSI MSI"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "mutation.yml"), [
      "name: mutation",
      "on: [pull_request]",
      "jobs:",
      "  mutation:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - run: npx stryker run --incremental --dry-run --reporters html,json,clear-text,progress,dashboard,badge,junit"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "reports", "mutation", "mutation-report.json"), JSON.stringify({
      schemaVersion: "3.0",
      thresholds: { high: 80, low: 60 },
      mutationScore: 85,
      coveredScore: 90,
      files: {
        "src/calc.ts": {
          mutants: [
            { id: "1", mutatorName: "BooleanLiteral", status: "Killed" },
            { id: "2", mutatorName: "StringLiteral", status: "Survived" },
            { id: "3", mutatorName: "ArrayDeclaration", status: "Timeout" },
            { id: "4", mutatorName: "ReturnRemoval", status: "Ignored" },
            { id: "5", mutatorName: "StringLiteral", status: "NoCoverage" }
          ]
        }
      },
      package: "mutation-testing-report-schema"
    }, null, 2));
    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = result.analysis.mutationTestingReadinessReport;
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.mutationSetups.some((item) => item.tool === "stryker" && item.readiness === "ready")).toBe(true);
    expect(report.mutationSetups.some((item) => item.tool === "infection" && item.readiness === "ready")).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["stryker", "infection", "mutation-testing-elements", "mutmut", "pitest", "custom"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["config-file", "package-script", "schema", "mutate-pattern", "test-runner", "coverage-analysis", "disable-type-checks"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["thresholds", "mutation-score", "covered-score", "survived", "killed", "timeout", "ignored", "no-coverage"]));
    expect(readySignals(report.reporterSignals)).toEqual(expect.arrayContaining(["html", "json", "clear-text", "progress", "dashboard", "badge", "junit", "mutation-testing-report-schema"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["src", "lib", "test-files", "ignore-patterns", "with-uncovered", "incremental", "dry-run"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@stryker-mutator/core", "@stryker-mutator/vitest-runner", "@stryker-mutator/jest-runner", "mutation-testing-report-schema", "infection/infection", "mutmut", "pitest", "custom"]));
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "mutation-testing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mutation-testing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mutation-testing-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects OpenTofu infrastructure readiness in Terraform files", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-infra-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-infra-source-"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Infrastructure fixture",
      "",
      "Use tofu init, tofu validate, tofu plan, and tofu apply during operator review."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "main.tf"), [
      "terraform {",
      "  required_version = \">= 1.8.0\"",
      "  required_providers {",
      "    aws = {",
      "      source = \"hashicorp/aws\"",
      "      version = \">= 5.0.0\"",
      "    }",
      "  }",
      "  backend \"local\" {",
      "    path = \"state/terraform.tfstate\"",
      "  }",
      "}",
      "",
      "provider \"aws\" {",
      "  region = var.region",
      "}",
      "",
      "variable \"region\" {",
      "  type = string",
      "  default = \"us-east-1\"",
      "  validation {",
      "    condition = length(var.region) > 0",
      "    error_message = \"Region is required.\"",
      "  }",
      "}",
      "",
      "resource \"aws_s3_bucket\" \"logs\" {",
      "  bucket = \"repotutor-infra-fixture\"",
      "}",
      "",
      "data \"aws_caller_identity\" \"current\" {}",
      "",
      "module \"network\" {",
      "  source = \"./modules/network\"",
      "  providers = { aws = aws }",
      "}",
      "",
      "output \"account_id\" {",
      "  value = data.aws_caller_identity.current.account_id",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".terraform.lock.hcl"), "# provider dependency lockfile fixture\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "infrastructure-readiness-report.json"), "utf8")) as {
      infrastructureSetups: Array<{ filePath: string; providerCount: number; resourceCount: number; dataSourceCount: number; moduleCount: number; variableCount: number; outputCount: number; backendCount: number; workflowCount: number }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      moduleSignals: Array<{ signal: string; readiness: string }>;
      variableSignals: Array<{ signal: string; readiness: string }>;
    };
    const mainSetup = report.infrastructureSetups.find((item) => item.filePath === "main.tf");
    expect(report.infrastructureSetups.length).toBeGreaterThan(0);
    expect(mainSetup?.providerCount).toBeGreaterThan(0);
    expect(mainSetup?.resourceCount).toBeGreaterThan(0);
    expect(mainSetup?.dataSourceCount).toBeGreaterThan(0);
    expect(mainSetup?.moduleCount).toBeGreaterThan(0);
    expect(mainSetup?.variableCount).toBeGreaterThan(0);
    expect(mainSetup?.outputCount).toBeGreaterThan(0);
    expect(mainSetup?.backendCount).toBeGreaterThan(0);
    expect(report.infrastructureSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(report.stateSignals.some((item) => item.signal === "backend" && item.readiness === "ready")).toBe(true);
    expect(report.stateSignals.some((item) => item.signal === "terraform-lock-hcl" && item.readiness === "ready")).toBe(true);
    expect(report.workflowSignals.some((item) => item.signal === "plan-command" && item.readiness === "ready")).toBe(true);
    expect(report.moduleSignals.some((item) => item.signal === "local-module" && item.readiness === "ready")).toBe(true);
    expect(report.variableSignals.some((item) => item.signal === "validation" && item.readiness === "ready")).toBe(true);
  });

  it("detects IaC drift readiness without refreshing state or contacting cloud APIs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-iac-drift-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-iac-drift-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "infra"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "scripts"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "iac-drift.yml"), [
      "name: IaC drift",
      "on:",
      "  schedule:",
      "    - cron: '0 3 * * *'",
      "  pull_request:",
      "jobs:",
      "  drift:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: driftctl scan --from tfstate+s3://state/prod.tfstate --to aws --output json > drift-report.json",
      "      - run: terraform plan -detailed-exitcode -refresh-only -out=tfplan || test $? -eq 2",
      "      - run: terraform show -json tfplan > plan.json",
      "      - run: tofu plan -refresh-only -detailed-exitcode -out=tofu.tfplan",
      "      - run: pulumi refresh --yes && pulumi preview --diff --expect-no-changes && pulumi stack export > stack.json",
      "      - run: terragrunt run-all plan --terragrunt-non-interactive",
      "      - run: infracost diff --path plan.json",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: iac-drift-readiness-report",
      "          path: |",
      "            drift-report.json",
      "            drift-report.sarif",
      "            drift-report.md",
      "            drift-report.html"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "infra", "main.tf"), [
      "terraform {",
      "  required_providers {",
      "    aws = { source = \"hashicorp/aws\" }",
      "  }",
      "  backend \"s3\" {",
      "    bucket = \"state-bucket\"",
      "    key = \"prod.tfstate\"",
      "    region = \"us-east-1\"",
      "    dynamodb_table = \"terraform-lock\"",
      "  }",
      "}",
      "provider \"aws\" {",
      "  region = var.region",
      "  account_id = var.account_id",
      "}",
      "variable \"region\" { default = \"us-east-1\" }",
      "variable \"account_id\" { default = \"123456789012\" }",
      "resource \"aws_s3_bucket\" \"bucket\" { bucket = \"repotutor-iac-drift\" }",
      "data \"terraform_remote_state\" \"network\" { backend = \"s3\" }",
      "# resource address aws_s3_bucket.bucket and asset inventory cloud control evidence",
      "# changed missing unmanaged drift ignore-rules exit code 2 drift summary:",
      "# manual review before apply gated remediation"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "infra", "backend.tf"), [
      "# remote state, state lock, workspace, state pull, state list, state show",
      "terraform workspace select prod",
      "terraform state pull > state.json",
      "terraform state rm aws_s3_bucket.old",
      "terraform state mv aws_s3_bucket.old aws_s3_bucket.bucket",
      "terraform import aws_s3_bucket.bucket repotutor-iac-drift",
      "tofu import aws_s3_bucket.bucket repotutor-iac-drift"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "infra", "terragrunt.hcl"), [
      "terraform { source = \"./modules/app\" }",
      "# terragrunt plan-all and terragrunt hclfmt",
      "# terragrunt run-all plan --terragrunt-non-interactive"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Pulumi.yaml"), [
      "name: repotutor-drift",
      "runtime: nodejs",
      "description: Pulumi refresh preview stack export import drift fixture"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Pulumi.dev.yaml"), [
      "config:",
      "  aws:region: us-east-1",
      "# pulumi import urn:pulumi:dev::repotutor::aws:s3/bucket:Bucket::bucket"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".driftignore"), [
      "# .driftignore ignore-rules for ignored unmanaged fixtures",
      "aws_iam_policy.noisy"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "driftctl.yml"), [
      "from: tfstate+s3://state/prod.tfstate",
      "to: aws",
      "output: json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "scripts", "terraform-drift.sh"), [
      "terraform plan -detailed-exitcode -refresh-only -out=tfplan",
      "terraform refresh",
      "terraform show -json tfplan > terraform-plan.json",
      "terraform state pull > terraform-state.json",
      "terraform import aws_s3_bucket.bucket repotutor-iac-drift",
      "terraform state rm aws_s3_bucket.old",
      "terraform state mv aws_s3_bucket.old aws_s3_bucket.bucket"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "drift:scan": "driftctl scan --from tfstate+s3://state/prod.tfstate --to aws --output json",
        "drift:terraform": "terraform plan -detailed-exitcode -refresh-only -out=tfplan && terraform show -json tfplan",
        "drift:tofu": "tofu plan -refresh-only -detailed-exitcode -out=tofu.tfplan",
        "drift:pulumi": "pulumi refresh --yes && pulumi preview --diff --expect-no-changes && pulumi stack export && pulumi import",
        "drift:terragrunt": "terragrunt run-all plan --terragrunt-non-interactive && terragrunt plan-all && terragrunt hclfmt",
        "drift:cost": "infracost diff --path plan.json"
      },
      devDependencies: {
        driftctl: "0.40.0",
        terraform: "1.6.0",
        opentofu: "1.8.0",
        pulumi: "3.0.0",
        terragrunt: "0.60.0",
        infracost: "0.10.0"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "iac-drift-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      driftSetups: Array<{ filePath: string; tool: string; readiness: string; stateCount: number; refreshCount: number; planCount: number; driftCount: number; outputCount: number; ciCount: number; remediationCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      stateSignals: Array<{ signal: string; readiness: string }>;
      inventorySignals: Array<{ signal: string; readiness: string }>;
      refreshSignals: Array<{ signal: string; readiness: string }>;
      planSignals: Array<{ signal: string; readiness: string }>;
      driftSignals: Array<{ signal: string; readiness: string }>;
      remediationSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string }>;
    };

    expect(report.sourcePattern).toBe("IaC drift readiness driftctl scan from tfstate terraform plan -detailed-exitcode refresh-only state pull show json OpenTofu tofu Pulumi refresh preview stack export import Terragrunt run-all plan ignore unmanaged missing changed drift summary");
    expect(report.driftSetups.length).toBeGreaterThan(0);
    expect(Array.from(new Set(report.driftSetups.map((item) => item.tool)))).toEqual(expect.arrayContaining(["workflow", "package-script", "driftctl", "terraform", "opentofu", "pulumi", "terragrunt"]));
    expect(report.driftSetups.some((item) => item.stateCount > 0 && item.refreshCount > 0 && item.planCount > 0 && item.driftCount > 0 && item.outputCount > 0)).toBe(true);
    expect(report.driftSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(report.driftSetups.some((item) => item.remediationCount > 0)).toBe(true);

    const readySignals = (items: Array<{ signal: string; readiness: string }>) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "cloud-provider"]));
    expect(readySignals(report.stateSignals)).toEqual(expect.arrayContaining(["tfstate", "remote-state", "backend", "workspace", "stack", "state-lock", "import"]));
    expect(readySignals(report.inventorySignals)).toEqual(expect.arrayContaining(["provider", "account", "region", "resource-address", "asset-inventory", "cloud-control"]));
    expect(readySignals(report.refreshSignals)).toEqual(expect.arrayContaining(["refresh-only", "refresh", "pulumi-refresh", "state-pull", "drift-scan"]));
    expect(readySignals(report.planSignals)).toEqual(expect.arrayContaining(["plan", "detailed-exitcode", "out-plan", "pulumi-preview", "terragrunt-plan", "cost-diff"]));
    expect(readySignals(report.driftSignals)).toEqual(expect.arrayContaining(["changed", "missing", "unmanaged", "drift", "ignore-rules", "exit-code", "summary"]));
    expect(readySignals(report.remediationSignals)).toEqual(expect.arrayContaining(["import", "state-rm", "state-mv", "pulumi-import", "apply-gated", "manual-review"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["json", "sarif", "markdown", "html", "artifact-upload"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "scheduled-run", "pull-request", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["driftctl", "terraform", "opentofu", "pulumi", "terragrunt", "infracost"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.some((item) => item.action.startsWith("Run driftctl, Terraform/OpenTofu, Pulumi, Terragrunt"))).toBe(true);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"driftctl scan|--from tfstate|--to aws|--output json|\\.driftignore|driftctl\\.yml\" .",
      "rg \"terraform plan|tofu plan|refresh-only|-detailed-exitcode|state pull|show -json|terraform import|tofu import\" .",
      "rg \"pulumi refresh|pulumi preview|pulumi stack export|pulumi import|--expect-no-changes|--diff\" .",
      "rg \"terragrunt run-all plan|terragrunt plan-all|--terragrunt-non-interactive|terragrunt hclfmt\" .",
      "rg \"changed|missing|unmanaged|drift|upload-artifact|iac-drift-readiness-report|infracost diff\" .github ."
    ]);

    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "iac-drift-readiness.md"), "utf8");
    expect(markdown).toContain("# IaC Drift Readiness");
    expect(markdown).toContain("## Drift Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "iac-drift-readiness.html"), "utf8");
    expect(html).toContain("IaC Drift Readiness");
    expect(html).toContain("iac-drift-readiness-card");
    expect(html).toContain("data-source-pattern=\"IaCDrift\"");
  });

  it("detects Helm deployment readiness in chart files", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-deployment-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-deployment-source-"));
    const templatesDir = path.join(sourceRoot, "charts", "app", "templates");
    await fs.mkdir(templatesDir, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Deployment fixture",
      "",
      "Review with helm lint, helm template, helm install --dry-run --debug, helm upgrade --install --wait --rollback-on-failure, helm test, and helm rollback."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "Chart.yaml"), [
      "apiVersion: v2",
      "name: repotutor-app",
      "version: 0.1.0",
      "appVersion: \"1.0.0\"",
      "type: application",
      "dependencies:",
      "  - name: redis",
      "    version: 1.0.0",
      "    repository: https://example.com/charts"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "values.yaml"), [
      "global:",
      "  imageRegistry: example.test",
      "image:",
      "  repository: repotutor/app",
      "service:",
      "  port: 8080"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "charts", "app", "values.schema.json"), "{\"type\":\"object\"}\n");
    await fs.writeFile(path.join(templatesDir, "_helpers.tpl"), "{{- define \"repotutor.name\" -}}repotutor{{- end -}}\n");
    await fs.writeFile(path.join(templatesDir, "deployment.yaml"), [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: {{ include \"repotutor.name\" . }}",
      "  namespace: {{ .Release.Namespace }}",
      "spec:",
      "  template:",
      "    spec:",
      "      containers:",
      "        - name: app",
      "          image: {{ .Values.image.repository }}"
    ].join("\n"));
    await fs.writeFile(path.join(templatesDir, "service.yaml"), [
      "apiVersion: v1",
      "kind: Service",
      "metadata:",
      "  name: repotutor",
      "spec:",
      "  ports:",
      "    - port: {{ .Values.service.port }}"
    ].join("\n"));
    await fs.writeFile(path.join(templatesDir, "test-connection.yaml"), [
      "apiVersion: v1",
      "kind: Pod",
      "metadata:",
      "  annotations:",
      "    helm.sh/hook: test",
      "spec:",
      "  containers:",
      "    - name: smoke",
      "      image: busybox"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "deployment-readiness-report.json"), "utf8")) as {
      deploymentSetups: Array<{ filePath: string; chartMetadataCount: number; valuesCount: number; templateCount: number; manifestCount: number; dependencyCount: number; hookCount: number; releaseWorkflowCount: number }>;
      chartSignals: Array<{ signal: string; readiness: string }>;
      templateSignals: Array<{ signal: string; readiness: string }>;
      valueSignals: Array<{ signal: string; readiness: string }>;
      releaseSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
    };
    const chartSetup = report.deploymentSetups.find((item) => item.filePath === "charts/app/Chart.yaml");
    const deploymentTemplate = report.deploymentSetups.find((item) => item.filePath === "charts/app/templates/deployment.yaml");
    expect(report.deploymentSetups.length).toBeGreaterThan(0);
    expect(chartSetup?.chartMetadataCount).toBeGreaterThan(0);
    expect(chartSetup?.dependencyCount).toBeGreaterThan(0);
    expect(deploymentTemplate?.templateCount).toBeGreaterThan(0);
    expect(deploymentTemplate?.manifestCount).toBeGreaterThan(0);
    expect(report.deploymentSetups.some((item) => item.releaseWorkflowCount > 0)).toBe(true);
    expect(report.chartSignals.some((item) => item.signal === "chart-yaml" && item.readiness === "ready")).toBe(true);
    expect(report.chartSignals.some((item) => item.signal === "values-schema" && item.readiness === "ready")).toBe(true);
    expect(report.templateSignals.some((item) => item.signal === "deployment" && item.readiness === "ready")).toBe(true);
    expect(report.templateSignals.some((item) => item.signal === "tests" && item.readiness === "ready")).toBe(true);
    expect(report.valueSignals.some((item) => item.signal === "global-values" && item.readiness === "ready")).toBe(true);
    expect(report.releaseSignals.some((item) => item.signal === "upgrade-command" && item.readiness === "ready")).toBe(true);
    expect(report.safetySignals.some((item) => item.signal === "rollback-on-failure" && item.readiness === "ready")).toBe(true);
  });

  it("detects Serverless Framework readiness in service files", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-serverless-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-serverless-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        deploy: "serverless deploy --stage prod --region us-east-1",
        package: "serverless package --stage prod",
        local: "serverless invoke local -f api"
      },
      dependencies: {
        serverless: "^4.0.0",
        "serverless-offline": "^14.0.0",
        "serverless-prune-plugin": "^2.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "serverless.yml"), [
      "service: demo-api",
      "frameworkVersion: '4'",
      "provider:",
      "  name: aws",
      "  runtime: nodejs22.x",
      "  region: us-east-1",
      "  stage: ${opt:stage, 'dev'}",
      "  logRetentionInDays: 14",
      "  tracing:",
      "    lambda: true",
      "  environment:",
      "    TABLE_NAME: ${self:service}-${sls:stage}-items",
      "    TOKEN: ${ssm:/demo/token}",
      "  iam:",
      "    role:",
      "      statements:",
      "        - Effect: Allow",
      "          Action:",
      "            - dynamodb:PutItem",
      "          Resource: !GetAtt ItemsTable.Arn",
      "functions:",
      "  api:",
      "    handler: src/handler.main",
      "    timeout: 10",
      "    memorySize: 256",
      "    events:",
      "      - httpApi:",
      "          path: /items",
      "          method: post",
      "      - schedule: rate(5 minutes)",
      "package:",
      "  patterns:",
      "    - '!tests/**'",
      "plugins:",
      "  - serverless-offline",
      "  - serverless-prune-plugin",
      "resources:",
      "  Resources:",
      "    ItemsTable:",
      "      Type: AWS::DynamoDB::Table",
      "      Properties:",
      "        BillingMode: PAY_PER_REQUEST"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "handler.js"), "export async function main() { return { statusCode: 200, body: 'ok' }; }\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "serverless-readiness-report.json"), "utf8")) as {
      serverlessSetups: Array<{ filePath: string; framework: string; serviceCount: number; providerCount: number; functionCount: number; eventCount: number; iamCount: number; resourceCount: number; commandCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      functionSignals: Array<{ signal: string; readiness: string }>;
      eventSignals: Array<{ signal: string; readiness: string }>;
      deploymentSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const setup = report.serverlessSetups.find((item) => item.filePath === "serverless.yml");
    expect(report.serverlessSetups.length).toBeGreaterThan(0);
    expect(setup?.framework).toBe("serverless-framework");
    expect(setup?.serviceCount).toBeGreaterThan(0);
    expect(setup?.providerCount).toBeGreaterThan(0);
    expect(setup?.functionCount).toBeGreaterThan(0);
    expect(setup?.eventCount).toBeGreaterThan(0);
    expect(setup?.iamCount).toBeGreaterThan(0);
    expect(setup?.resourceCount).toBeGreaterThan(0);
    expect(report.serverlessSetups.some((item) => item.commandCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "serverless-yml" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "variables" && item.readiness === "ready")).toBe(true);
    expect(report.functionSignals.some((item) => item.signal === "handler" && item.readiness === "ready")).toBe(true);
    expect(report.eventSignals.some((item) => item.signal === "http-api" && item.readiness === "ready")).toBe(true);
    expect(report.eventSignals.some((item) => item.signal === "schedule" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "deploy" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "invoke-local" && item.readiness === "ready")).toBe(true);
    expect(report.safetySignals.some((item) => item.signal === "iam-role-statements" && item.readiness === "ready")).toBe(true);
    expect(report.safetySignals.some((item) => item.signal === "secrets" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "serverless-offline" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "serverless-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "serverless-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects coverage readiness without running coverage toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-coverage-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-coverage-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "coverage"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "coverage-study",
      version: "1.0.0",
      workspaces: ["packages/*"],
      scripts: {
        test: "vitest run --reporter=junit",
        coverage: "nyc --all --check-coverage --reporter=lcov --reporter=text-summary --reporter=json-summary npm test",
        "coverage:c8": "c8 --all --src src --include \"src/**/*.ts\" --exclude \"**/*.test.ts\" --exclude-after-remap --check-coverage --lines 90 --functions 85 --branches 80 --statements 90 --reporter=lcov --reporter=cobertura --reporter=json npm test",
        "coverage:vitest": "vitest run --coverage",
        "coverage:py": "python -m pytest --cov=src --cov-report=term --cov-report=xml",
        "coverage:go": "go test ./... -coverprofile=coverage.out",
        "coverage:coveralls": "coveralls < coverage/lcov.info",
        "coverage:merge": "nyc merge coverage .nyc_output/coverage-final.json && c8 report --reporter=lcov"
      },
      dependencies: {
        coveralls: "^3.1.1"
      },
      devDependencies: {
        nyc: "latest",
        c8: "latest",
        vitest: "latest",
        "@vitest/coverage-v8": "latest",
        "@vitest/coverage-istanbul": "latest",
        jest: "latest",
        "babel-plugin-istanbul": "latest",
        "nyc-config-typescript": "latest"
      },
      nyc: {
        all: true,
        include: ["src/**/*.ts"],
        exclude: ["**/*.test.ts"],
        "exclude-after-remap": true,
        "check-coverage": true,
        branches: 80,
        functions: 85,
        lines: 90,
        statements: 90,
        "per-file": true,
        watermarks: { lines: [80, 95] },
        reporter: ["lcov", "text-summary", "json", "json-summary", "html", "cobertura", "clover"]
      },
      jest: {
        collectCoverage: true,
        collectCoverageFrom: ["src/**/*.ts"],
        coverageThreshold: {
          global: { branches: 80, functions: 85, lines: 90, statements: 90 }
        },
        coverageReporters: ["json", "lcov", "text", "clover"]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".nycrc.json"), JSON.stringify({
      all: true,
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      "exclude-after-remap": true,
      "check-coverage": true,
      branches: 80,
      functions: 85,
      lines: 90,
      statements: 90,
      "per-file": true,
      watermarks: { statements: [80, 95] },
      reporter: ["lcov", "text-summary", "json", "html", "cobertura", "clover"]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".c8rc.json"), JSON.stringify({
      all: true,
      src: ["src"],
      include: ["src/**/*.ts"],
      exclude: ["**/*.test.ts"],
      "exclude-after-remap": true,
      "check-coverage": true,
      lines: 90,
      functions: 85,
      branches: 80,
      statements: 90,
      "per-file": true,
      reporter: ["lcov", "text-summary", "cobertura", "json", "json-summary"]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "vitest.config.ts"), [
      "import { defineConfig } from 'vitest/config';",
      "export default defineConfig({",
      "  test: {",
      "    coverage: {",
      "      provider: 'v8',",
      "      enabled: true,",
      "      include: ['src/**/*.ts'],",
      "      exclude: ['**/*.test.ts'],",
      "      reporter: ['text', 'html', 'lcov', 'json-summary', 'cobertura'],",
      "      thresholds: { lines: 90, functions: 85, branches: 80, statements: 90 }",
      "    }",
      "  }",
      "});",
      "export const istanbulProvider = { provider: 'istanbul', sourceMap: true };"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"coverage-study\"",
      "dependencies = [\"coverage>=7\", \"pytest-cov\"]",
      "",
      "[tool.coverage.run]",
      "source = [\"src\"]",
      "omit = [\"tests/*\"]",
      "branch = true",
      "",
      "[tool.coverage.report]",
      "fail_under = 90",
      "",
      "[tool.pytest.ini_options]",
      "addopts = \"--cov=src --cov-report=term --cov-report=xml --cov-report=html\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".coveragerc"), [
      "[run]",
      "source = src",
      "branch = True",
      "",
      "[report]",
      "fail_under = 90",
      "pragma: no cover"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "codecov.yml"), [
      "coverage:",
      "  status:",
      "    project:",
      "      default:",
      "        target: auto",
      "        threshold: 1%",
      "    patch:",
      "      default:",
      "        target: 80%",
      "        threshold: 2%",
      "flags:",
      "  unittests:",
      "    paths:",
      "      - src"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "coverage.yml"), [
      "name: coverage",
      "on: [push, pull_request]",
      "permissions:",
      "  contents: read",
      "  id-token: write",
      "jobs:",
      "  coverage:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      CODECOV_TOKEN: ${{ secrets.CODECOV_TOKEN }}",
      "      COVERALLS_REPO_TOKEN: ${{ secrets.COVERALLS_REPO_TOKEN }}",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run coverage && npm run coverage:c8 && npm run coverage:py && npm run coverage:go",
      "      - run: echo coverage summary >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: coverage",
      "          path: coverage/lcov.info",
      "      - uses: codecov/codecov-action@v5",
      "        with:",
      "          use_oidc: true",
      "          token: ${{ secrets.CODECOV_TOKEN }}",
      "          files: ./coverage/lcov.info,./coverage.xml,./coverage-final.json,./coverage.out",
      "          flags: unittests,node",
      "          fail_ci_if_error: true",
      "          disable_search: true",
      "          directory: ./coverage",
      "          report_type: test_results",
      "      - run: coveralls < coverage/lcov.info"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Coverage Study",
      "[![coverage](https://img.shields.io/badge/coverage-90%25-brightgreen.svg)](https://codecov.io/gh/example/coverage-study)",
      "Codecov badge and codecov/c/github style coverage link."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "math.ts"), [
      "export function add(a: number, b: number) {",
      "  /* c8 ignore next */",
      "  /* istanbul ignore next */",
      "  return a + b;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "math.test.ts"), [
      "import { expect, it } from 'vitest';",
      "import { add } from './math';",
      "it('adds', () => expect(add(1, 2)).toBe(3));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "coverage", "lcov.info"), "TN:\nSF:src/math.ts\nLF:1\nLH:1\nend_of_record\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "coverage-final.json"), "{\"src/math.ts\":{\"path\":\"src/math.ts\"}}\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "coverage-summary.json"), "{\"total\":{\"lines\":{\"pct\":100}}}\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "cobertura-coverage.xml"), "<coverage line-rate=\"1\" branch-rate=\"1\"></coverage>\n");
    await fs.writeFile(path.join(sourceRoot, "coverage", "clover.xml"), "<coverage generated=\"1\"></coverage>\n");
    await fs.writeFile(path.join(sourceRoot, "coverage.out"), "mode: set\nsrc/math.ts:1.1,3.2 1 1\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "coverage-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      coverageSetups: Array<{ filePath: string; tool: string; configCount: number; reporterCount: number; thresholdCount: number; includeCount: number; excludeCount: number; uploadCount: number; artifactCount: number; mergeCount: number }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      scopeSignals: Array<{ signal: string; readiness: string }>;
      thresholdSignals: Array<{ signal: string; readiness: string }>;
      reportSignals: Array<{ signal: string; readiness: string }>;
      ciUploadSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("nyc c8 Istanbul V8 coverage lcov cobertura coverage-final check-coverage thresholds Codecov OIDC flags");
    expect(report.coverageSetups.length).toBeGreaterThan(0);
    expect(report.coverageSetups.some((item) => item.tool === "nyc" && item.configCount > 0 && item.reporterCount > 0 && item.thresholdCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.tool === "c8" && item.includeCount > 0 && item.excludeCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.tool === "vitest" && item.reporterCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.tool === "codecov" && item.configCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.uploadCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.artifactCount > 0)).toBe(true);
    expect(report.coverageSetups.some((item) => item.mergeCount > 0)).toBe(true);
    expect(readySignals(report.instrumentationSignals)).toEqual(expect.arrayContaining(["nyc", "c8", "v8-provider", "istanbul-provider", "babel-istanbul", "coverage-py", "pytest-cov", "go-cover", "lcov-genhtml"]));
    expect(readySignals(report.scopeSignals)).toEqual(expect.arrayContaining(["all-files", "include", "exclude", "exclude-after-remap", "source-map", "per-file", "workspace-src", "ignore-hints"]));
    expect(readySignals(report.thresholdSignals)).toEqual(expect.arrayContaining(["check-coverage", "lines", "functions", "branches", "statements", "watermarks", "global-threshold", "per-file-threshold", "patch-threshold", "project-threshold"]));
    expect(readySignals(report.reportSignals)).toEqual(expect.arrayContaining(["text", "text-summary", "html", "lcov", "json", "json-summary", "cobertura", "clover", "junit", "coverage-final", "coverage-out"]));
    expect(readySignals(report.ciUploadSignals)).toEqual(expect.arrayContaining(["codecov-action", "codecov-token", "codecov-oidc", "codecov-flags", "codecov-files", "fail-ci-if-error", "coveralls", "github-step-summary", "upload-artifact", "badge"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["nyc", "c8", "@vitest/coverage-v8", "@vitest/coverage-istanbul", "jest", "babel-plugin-istanbul", "coverage", "pytest-cov", "codecov-action", "coveralls"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx nyc --all --check-coverage --reporter=lcov --reporter=text-summary npm test",
      "npx c8 --all --check-coverage --reporter=lcov --reporter=text-summary npm test",
      "npx vitest run --coverage"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "coverage-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "coverage-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "coverage-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects profiling readiness without attaching profilers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-profiling-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-profiling-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "profiling"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "scripts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "profiling.yml"), [
      "name: profiling",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: \"0 4 * * *\"",
      "jobs:",
      "  profile:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run profile:clinic",
      "      " + "- run: py-spy record --pid 123 --duration 30 --rate 100 --native --subprocesses --gil --format speedscope --output profiles/app.speedscope.json",
      "      - run: go tool pprof -http=:0 profiles/cpu.pprof",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: profiling-artifacts",
      "          path: |",
      "            profiles/*.html",
      "            profiles/*.svg",
      "            profiles/*.pprof",
      "            profiles/*.speedscope.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "profiling-study",
      version: "1.0.0",
      scripts: {
        "profile:clinic": "clinic doctor --collect-only --autocannon [ -m GET /health ] -- node server.js && clinic bubbleprof --on-port 'autocannon http://localhost:$PORT' -- node server.js && clinic flame --visualize-only 123.clinic-flame && clinic heapprofiler --open=false -- node server.js"
      },
      devDependencies: {
        clinic: "latest",
        autocannon: "latest",
        "@sentry/profiling-node": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "requirements.txt"), [
      "py-spy",
      "pyroscope-io"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "profiling", "pyroscope.yml"), [
      "application_name: example.api",
      "server_address: http://pyroscope:4040",
      "sample_rate: 100",
      "tags:",
      "  env: test",
      "  service: api",
      "scrape_configs:",
      "  - job_name: app",
      "    targets: [\"app:6060\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "profiling.md"), [
      "# Profiling",
      "Clinic.js doctor, clinic bubbleprof, clinic flame, and clinic heapprofiler are documented for Node process profiling.",
      "py-spy top, py-spy record, and py-spy dump cover Python process CPU and wall-clock profiling.",
      "Pyroscope continuous profiling uses profiles.grafana.com/cpu.port_name, profiles.grafana.com/memory.port_name, goroutine, k8s.grafana.com/scrape, Kubernetes pod annotations, application_name, server_address, and tags.",
      "pprof and /debug/pprof/profile cover Go pprof and HTTP pprof endpoints.",
      "Outputs include flamegraph, speedscope, raw, pprof, JSON, profilecli, Grafana dashboard, and HTML reports.",
      "Runtime controls include --on-port, autocannon, duration, sample rate, native symbols, subprocesses, and GIL.",
      "Safety notes cover sudo, ptrace, SYS_PTRACE, CAP_SYS_PTRACE, eBPF, nonblocking sampling, production warning, sampling overhead, data retention, pod, container, and profile data boundaries."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "server.go"), [
      "package main",
      "import _ \"net/http/pprof\"",
      "func main() {",
      "  // pprof is exposed only in an authorized profiling environment.",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "scripts", "profile.sh"), [
      "py-spy top --pid 123",
      "py-spy dump --pid 123",
      "profilecli query --from now-1h",
      "curl http://localhost:6060/debug/pprof/profile"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "profiling-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      profilingSetups: Array<{ filePath: string; tool: string; cpuCount: number; wallCount: number; heapCount: number; asyncCount: number; attachCount: number; continuousCount: number; outputCount: number; permissionCount: number; ciCount: number }>;
      targetSignals: Array<{ signal: string; readiness: string }>;
      modeSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Profiling readiness Clinic.js py-spy Pyroscope pprof flamegraph speedscope heap CPU wall sampling tags permissions CI");
    expect(report.profilingSetups.length).toBeGreaterThan(0);
    expect(report.profilingSetups.some((item) => item.tool === "workflow" && item.ciCount > 0 && item.outputCount > 0)).toBe(true);
    expect(report.profilingSetups.some((item) => item.tool === "package-script" && item.cpuCount > 0 && item.asyncCount > 0 && item.outputCount > 0)).toBe(true);
    expect(report.profilingSetups.some((item) => item.tool === "py-spy" && item.attachCount > 0)).toBe(true);
    expect(report.profilingSetups.some((item) => item.tool === "pyroscope" && item.continuousCount > 0)).toBe(true);
    expect(report.profilingSetups.some((item) => item.tool === "pprof" && item.outputCount > 0)).toBe(true);
    expect(readySignals(report.targetSignals)).toEqual(expect.arrayContaining(["node-process", "python-process", "go-pprof", "http-pprof", "kubernetes-pod", "container"]));
    expect(readySignals(report.modeSignals)).toEqual(expect.arrayContaining(["clinic-doctor", "clinic-bubbleprof", "clinic-flame", "clinic-heapprofiler", "py-spy-top", "py-spy-record", "py-spy-dump", "pyroscope-agent", "pprof"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["html", "flamegraph", "speedscope", "raw", "pprof", "json", "profilecli", "grafana-dashboard"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["on-port", "autocannon", "duration", "sample-rate", "native-symbols", "subprocesses", "gil", "tags", "application-name", "server-address"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["sudo", "ptrace", "sys-ptrace", "nonblocking", "production-warning", "sampling-overhead", "data-retention"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["clinic", "autocannon", "py-spy", "pyroscope", "pprof", "sentry-profiling"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("Run Clinic.js, py-spy, Pyroscope, pprof, eBPF, or profiling commands only in an authorized environment.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"clinic doctor|clinic bubbleprof|clinic flame|clinic heapprofiler|py-spy|pyroscope|pprof\" .",
      "rg \"flamegraph|speedscope|profilecli|pprof|profiles.grafana.com|application_name|server_address\" .",
      "rg \"sudo|ptrace|SYS_PTRACE|--native|--subprocesses|--gil|sample_rate|duration|tags\" .",
      "rg \"autocannon|--on-port|--collect-only|--visualize-only|upload-artifact|profile artifact\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "profiling-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "profiling-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "profiling-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "profiling-readiness.md"), "utf8");
    expect(markdown).toContain("# Profiling Readiness");
    expect(markdown).toContain("## Safety Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "profiling-readiness.html"), "utf8");
    expect(html).toContain("profiling-readiness-card");
    expect(html).toContain("does not attach to processes");
  });

  it("detects tracing readiness without sending spans", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tracing-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-tracing-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "deploy"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tracing"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "tracing.yml"), [
      "name: tracing",
      "on: [pull_request]",
      "jobs:",
      "  trace:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      OTEL_EXPORTER_OTLP_ENDPOINT: http://otel-collector:4318/v1/traces",
      "      OTEL_TRACES_EXPORTER: otlp",
      "      OTEL_PROPAGATORS: tracecontext,baggage,b3",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run trace:smoke",
      "      - run: echo collector config tempo jaeger zipkin spanmetrics service_graph dropped spans export failures health check dashboard retention artifact",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: tracing-artifacts",
      "          path: deploy/*.yaml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "tracing-study",
      version: "1.0.0",
      scripts: {
        "trace:smoke": "node --require ./tracing/otel.js src/server.js"
      },
      dependencies: {
        "@opentelemetry/api": "latest",
        "@opentelemetry/sdk-node": "latest",
        "@opentelemetry/sdk-trace-node": "latest",
        "@opentelemetry/auto-instrumentations-node": "latest",
        "@opentelemetry/instrumentation": "latest",
        "@opentelemetry/instrumentation-http": "latest",
        "@opentelemetry/instrumentation-grpc": "latest",
        "@opentelemetry/instrumentation-pg": "latest",
        "@opentelemetry/context-async-hooks": "latest",
        "@opentelemetry/propagator-b3": "latest",
        "@opentelemetry/exporter-trace-otlp-grpc": "latest",
        "@opentelemetry/exporter-trace-otlp-http": "latest",
        "@opentelemetry/exporter-jaeger": "latest",
        "@opentelemetry/exporter-zipkin": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "tracing", "otel.js"), [
      "const { trace, propagation } = require('@opentelemetry/api');",
      "const { NodeSDK } = require('@opentelemetry/sdk-node');",
      "const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node');",
      "const { BatchSpanProcessor, SimpleSpanProcessor, ConsoleSpanExporter, ParentBasedSampler, TraceIdRatioBasedSampler, AlwaysOnSampler, AlwaysOffSampler } = require('@opentelemetry/sdk-trace-base');",
      "const { OTLPTraceExporter: OTLPGrpcTraceExporter } = require('@opentelemetry/exporter-trace-otlp-grpc');",
      "const { OTLPTraceExporter: OTLPHttpTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');",
      "const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');",
      "const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');",
      "const { resourceFromAttributes } = require('@opentelemetry/resources');",
      "const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');",
      "const { W3CTraceContextPropagator, W3CBaggagePropagator } = require('@opentelemetry/core');",
      "const { B3Propagator } = require('@opentelemetry/propagator-b3');",
      "const { AsyncHooksContextManager } = require('@opentelemetry/context-async-hooks');",
      "const { ZoneContextManager } = require('@opentelemetry/context-zone');",
      "const { registerInstrumentations } = require('@opentelemetry/instrumentation');",
      "const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');",
      "const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');",
      "const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');",
      "const { PgInstrumentation } = require('@opentelemetry/instrumentation-pg');",
      "const resource = resourceFromAttributes({ [ATTR_SERVICE_NAME]: 'checkout-api', 'service.name': 'checkout-api', 'service.version': '1.2.3', 'deployment.environment': 'test', attributes: 'resource attributes' });",
      "const provider = new NodeTracerProvider({ resource, sampler: new ParentBasedSampler({ root: new TraceIdRatioBasedSampler(0.25) }) });",
      "provider.addSpanProcessor(new BatchSpanProcessor(new OTLPGrpcTraceExporter({ url: 'http://otel-collector:4317' })));",
      "provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));",
      "new OTLPHttpTraceExporter({ url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://otel-collector:4318/v1/traces' });",
      "new JaegerExporter({ endpoint: 'http://jaeger:14268/api/traces' });",
      "new ZipkinExporter({ url: 'http://zipkin:9411/api/v2/spans' });",
      "propagation.setGlobalPropagator(new W3CTraceContextPropagator());",
      "new W3CBaggagePropagator();",
      "new B3Propagator();",
      "new AsyncHooksContextManager();",
      "new ZoneContextManager();",
      "new AlwaysOnSampler();",
      "new AlwaysOffSampler();",
      "registerInstrumentations({ instrumentations: [getNodeAutoInstrumentations(), new HttpInstrumentation(), new GrpcInstrumentation(), new PgInstrumentation()] });",
      "const sdk = new NodeSDK({ traceExporter: new OTLPGrpcTraceExporter(), resource });",
      "sdk.start();",
      "sdk.shutdown();"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "server.ts"), [
      "import { trace } from '@opentelemetry/api';",
      "export function checkout() {",
      "  const span = trace.getTracer('checkout').startSpan('GET /checkout');",
      "  span.setAttribute('http.route', '/checkout');",
      "  span.addEvent('validated cart with traceparent baggage');",
      "  span.end();",
      "  return { traceparent: '00-abc-abc-01', baggage: 'tenant=alpha' };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "deploy", "otel-collector.yaml"), [
      "receivers:",
      "  otlp:",
      "    protocols:",
      "      grpc:",
      "      http:",
      "  jaeger:",
      "  zipkin:",
      "processors:",
      "  batch:",
      "  tail_sampling:",
      "  memory_limiter:",
      "exporters:",
      "  otlp/tempo:",
      "    endpoint: tempo:4317",
      "  jaeger:",
      "    endpoint: jaeger:14250",
      "  zipkin:",
      "    endpoint: http://zipkin:9411/api/v2/spans",
      "service:",
      "  pipelines:",
      "    traces:",
      "      receivers: [otlp, jaeger, zipkin]",
      "      processors: [memory_limiter, tail_sampling, batch]",
      "      exporters: [otlp/tempo, jaeger, zipkin]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "deploy", "jaeger.yaml"), [
      "jaeger all-in-one collector query ports 16686 14250 14268",
      "storage backend Badger Elasticsearch Cassandra Kafka",
      "remote sampling and rate limiting are documented for the Jaeger collector"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "deploy", "tempo.yaml"), [
      "tempo distributor ingester querier compactor metrics-generator",
      "spanmetrics service_graph object storage S3 GCS WAL retention tenant multi-tenant TraceQL dashboard",
      "dropped spans export failures health check /health"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "tracing.md"), [
      "# Tracing",
      "Zipkin server, B3, Jaeger propagation, X-Ray xray, zone context, and browser tracing are documented.",
      "Resource detector detectResources ResourceDetector envDetector containerDetector enriches attributes.",
      "Span metrics, service graph, dropped spans, export failures, health check, dashboard, and retention are required before trusting traces."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "tracing-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      tracingSetups: Array<{ filePath: string; platform: string; tracerCount: number; spanCount: number; propagationCount: number; exporterCount: number; samplingCount: number; resourceCount: number; processorCount: number; backendCount: number; storageCount: number; queryCount: number; ciCount: number }>;
      instrumentationSignals: Array<{ signal: string; readiness: string }>;
      propagationSignals: Array<{ signal: string; readiness: string }>;
      exporterSignals: Array<{ signal: string; readiness: string }>;
      samplingSignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      backendSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Tracing readiness OpenTelemetry Jaeger Zipkin Tempo traceparent baggage spans exporters sampling resources backends quality");
    expect(report.tracingSetups.length).toBeGreaterThan(0);
    expect(report.tracingSetups.some((item) => item.platform === "opentelemetry" && item.tracerCount > 0 && item.spanCount > 0 && item.propagationCount > 0 && item.exporterCount > 0)).toBe(true);
    expect(report.tracingSetups.some((item) => item.platform === "workflow" && item.ciCount > 0)).toBe(true);
    expect(report.tracingSetups.some((item) => item.platform === "package-script" && item.tracerCount > 0)).toBe(true);
    expect(report.tracingSetups.some((item) => item.platform === "collector-config" && item.processorCount > 0 && item.exporterCount > 0)).toBe(true);
    expect(report.tracingSetups.some((item) => item.platform === "jaeger" && item.backendCount > 0 && item.queryCount > 0)).toBe(true);
    expect(report.tracingSetups.some((item) => item.platform === "tempo" && item.storageCount > 0)).toBe(true);
    expect(readySignals(report.instrumentationSignals)).toEqual(expect.arrayContaining(["manual-span", "auto-instrumentation", "http-instrumentation", "grpc-instrumentation", "db-instrumentation", "browser-instrumentation"]));
    expect(readySignals(report.propagationSignals)).toEqual(expect.arrayContaining(["tracecontext", "baggage", "b3", "jaeger", "xray", "async-context", "zone-context"]));
    expect(readySignals(report.exporterSignals)).toEqual(expect.arrayContaining(["otlp-grpc", "otlp-http", "console", "jaeger", "zipkin", "tempo", "collector"]));
    expect(readySignals(report.samplingSignals)).toEqual(expect.arrayContaining(["parent-based", "traceid-ratio", "always-on", "always-off", "tail-sampling", "remote-sampling", "rate-limit"]));
    expect(readySignals(report.resourceSignals)).toEqual(expect.arrayContaining(["service-name", "service-version", "deployment-environment", "resource-detector", "attributes"]));
    expect(readySignals(report.backendSignals)).toEqual(expect.arrayContaining(["jaeger-all-in-one", "jaeger-collector", "jaeger-query", "tempo-distributor", "tempo-ingester", "tempo-querier", "zipkin-server", "storage-backend"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["span-metrics", "service-graph", "dropped-spans", "export-failures", "health-check", "dashboard", "retention"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@opentelemetry/api", "@opentelemetry/sdk-node", "@opentelemetry/instrumentation", "@opentelemetry/exporter-trace-otlp", "jaeger", "zipkin", "tempo"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static tracing readiness only; it does not start SDKs, send spans, contact collectors, query Jaeger/Tempo/Zipkin, or inspect live dashboards.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"NodeSDK|TracerProvider|startSpan|trace.getTracer|registerInstrumentations|getNodeAutoInstrumentations\" .",
      "rg \"traceparent|baggage|B3Propagator|W3CTraceContextPropagator|OTEL_PROPAGATORS\" .",
      "rg \"OTLPTraceExporter|JaegerExporter|ZipkinExporter|OTEL_EXPORTER_OTLP_ENDPOINT|collector|tempo|jaeger|zipkin\" .",
      "rg \"ParentBasedSampler|TraceIdRatioBasedSampler|tail_sampling|remote sampling|spanmetrics|service_graph|dropped spans\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "tracing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "tracing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "tracing-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "tracing-readiness.md"), "utf8");
    expect(markdown).toContain("# Tracing Readiness");
    expect(markdown).toContain("## Propagation Signals");
    expect(markdown).toContain("## Backend Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "tracing-readiness.html"), "utf8");
    expect(html).toContain("tracing-readiness-card");
    expect(html).toContain("does not start SDKs");
  });

  it("detects debugging readiness without launching debuggers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-debug-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-debug-source-"));
    await fs.mkdir(path.join(sourceRoot, ".vscode"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "debug"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "debug-readiness-study",
      version: "1.0.0",
      scripts: {
        "debug:node": "node --inspect-brk src/server.js",
        "debug:chrome": "node --inspect=9229 src/server.js"
      },
      dependencies: {
        "vscode-js-debug": "latest",
        "@vscode/debugadapter": "latest",
        vscode: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".vscode", "launch.json"), JSON.stringify({
      version: "0.2.0",
      configurations: [
        {
          type: "pwa-node",
          request: "launch",
          name: "Launch API",
          runtimeExecutable: "node",
          runtimeArgs: ["--inspect-brk"],
          program: "${workspaceFolder}/src/server.ts",
          cwd: "${workspaceFolder}",
          sourceMaps: true,
          sourceMapPathOverrides: {
            "webpack:///*": "${workspaceFolder}/*"
          },
          skipFiles: ["<node_internals>/**"],
          smartStep: true,
          trace: true,
          debugServer: 4711,
          debugServerPort: 4711
        },
        {
          type: "pwa-chrome",
          request: "attach",
          name: "Attach Chrome",
          port: 9229,
          address: "localhost",
          webRoot: "${workspaceFolder}/src",
          attachExistingChildren: true
        },
        {
          type: "python",
          request: "attach",
          name: "Attach debugpy",
          connect: { host: "127.0.0.1", port: 5678 },
          justMyCode: false,
          subProcess: true,
          pathMappings: [{ localRoot: "${workspaceFolder}", remoteRoot: "/app" }],
          debugAdapterPath: "${workspaceFolder}/.venv/bin/debugpy"
        },
        {
          type: "go",
          request: "attach",
          name: "Attach Delve",
          mode: "remote",
          host: "127.0.0.1",
          port: 2345,
          debugAdapter: "dlv-dap"
        }
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "server.ts"), [
      "export function start() {",
      "  console.log('debug target');",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "debug", "debugpy.md"), [
      "# debugpy",
      "Debug Adapter Protocol DAP DebugConfiguration debugAdapterPath adapter logs.",
      "Run python -m debugpy --listen localhost:5678 --wait-for-client -m pytest tests/test_api.py.",
      "debugpy.listen(('localhost', 5678)); debugpy.connect(('localhost', 5678)); debugpy.wait_for_client(); debugpy.logToFile('debug.log').",
      "Use breakpoint(), set breakpoints, conditional breakpoint, line breakpoint, logpoint, function breakpoint, exception breakpoint, and hit condition checks.",
      "Attach: PID native attach attach binaries ptrace is authorized only on localhost; do not expose debug port in production; firewall and security review required.",
      "pathMappings localRoot remoteRoot cwd webRoot workspaceFolder path translation source map sourceMaps sourceMapPathOverrides skipFiles smartStep.",
      "pytest tox debugging pytest test explorer stack trace stack frame verbose debug logs."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "debug", "delve.md"), [
      "# Delve",
      "dlv debug ./cmd/api --headless --listen 127.0.0.1:2345 --accept-multiclient --log --log-output=debugger,rpc.",
      "dlv test ./... and dlv dap use Delve DAP adapter flows.",
      "dlv core ./api core.dump covers core dump analysis.",
      "goroutine stack trace output is captured in debug logs.",
      "Remote container SSH WSL localRoot remoteRoot mapping is documented."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "debugging.md"), [
      "# Debugging Guide",
      "VS Code js-debug launch.json uses pwa-node, pwa-chrome, Node inspect, --inspect, --inspect-brk, browser debug, Chrome DevTools, source maps, skip files, smart step.",
      "Debug Adapter Protocol DAP links request launch and attach modes to breakpoints, exception breakpoints, function breakpoints, logpoints, hit conditions, and stack traces.",
      "Remote attach may use host, port, pid, subprocess, multiclient, container, SSH, WSL, localhost, 127.0.0.1, authorized sessions, firewall, and production safety notes.",
      "Adapter logs, debug logs, verbose logging, trace true, stack frame, and goroutine diagnostics are reviewed before trusting the debug setup."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "debug.yml"), [
      "name: debug",
      "on: [push, pull_request]",
      "jobs:",
      "  debug:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: echo 'debug smoke launch.json debugpy dlv Debug Adapter Protocol breakpoint logpoint source maps pathMappings trace adapter logs'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: debug-logs",
      "          path: debug/debug.log"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "debug-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      debugSetups: Array<{ filePath: string; platform: string; launchCount: number; attachCount: number; breakpointCount: number; sourceMapCount: number; pathMappingCount: number; runtimeCount: number; adapterCount: number; logCount: number; testCount: number; remoteCount: number; safetyCount: number; ciCount: number }>;
      adapterSignals: Array<{ signal: string; readiness: string }>;
      modeSignals: Array<{ signal: string; readiness: string }>;
      breakpointSignals: Array<{ signal: string; readiness: string }>;
      mappingSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      remoteSignals: Array<{ signal: string; readiness: string }>;
      diagnosticSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Debug readiness VS Code js-debug debugpy Delve DAP launch attach breakpoints source maps path mappings remote logs");
    expect(report.debugSetups.length).toBeGreaterThan(0);
    expect(report.debugSetups.some((item) => item.platform === "launch-config" && item.launchCount > 0 && item.attachCount > 0 && item.sourceMapCount > 0 && item.pathMappingCount > 0)).toBe(true);
    expect(report.debugSetups.some((item) => item.platform === "package-script" && item.runtimeCount > 0)).toBe(true);
    expect(report.debugSetups.some((item) => item.platform === "debugpy" && item.breakpointCount > 0 && item.safetyCount > 0)).toBe(true);
    expect(report.debugSetups.some((item) => item.platform === "delve" && item.remoteCount > 0 && item.logCount > 0)).toBe(true);
    expect(report.debugSetups.some((item) => item.platform === "workflow" && item.ciCount > 0)).toBe(true);
    expect(readySignals(report.adapterSignals)).toEqual(expect.arrayContaining(["debug-adapter-protocol", "vscode-js-debug", "debugpy", "delve-dap", "chrome-devtools"]));
    expect(readySignals(report.modeSignals)).toEqual(expect.arrayContaining(["launch", "attach", "remote-attach", "headless", "listen", "connect", "wait-for-client"]));
    expect(readySignals(report.breakpointSignals)).toEqual(expect.arrayContaining(["line-breakpoint", "conditional-breakpoint", "logpoint", "function-breakpoint", "exception-breakpoint", "hit-condition"]));
    expect(readySignals(report.mappingSignals)).toEqual(expect.arrayContaining(["source-map", "source-map-overrides", "skip-files", "smart-step", "path-mappings", "cwd-root"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["node-inspect", "browser-debug", "python-module", "pytest-debug", "go-dlv", "core-dump", "native-attach"]));
    expect(readySignals(report.remoteSignals)).toEqual(expect.arrayContaining(["port", "host", "pid", "subprocess", "multiclient", "container", "ssh-wsl"]));
    expect(readySignals(report.diagnosticSignals)).toEqual(expect.arrayContaining(["trace", "debug-logs", "adapter-logs", "verbose", "stack-trace", "goroutine"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["vscode-js-debug", "debugpy", "delve", "@vscode/debugadapter", "vscode"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static debugging readiness only; it does not launch debuggers, attach to processes, open debug ports, inspect memory, or mutate runtime state.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "rg \"launch.json|DebugConfiguration|request.*(launch|attach)|debugAdapterPath|Debug Adapter Protocol\" .",
      "rg \"breakpoint|logpoint|conditional breakpoint|hit condition|exception breakpoint|function breakpoint\" .",
      "rg \"sourceMaps|sourceMapPathOverrides|skipFiles|smartStep|pathMappings|localRoot|remoteRoot|webRoot\" .",
      "rg \"debugpy|dlv|--inspect|--inspect-brk|--listen|wait_for_client|accept-multiclient|logToFile|--log-output\" ."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "debug-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "debug-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "debug-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "debug-readiness.md"), "utf8");
    expect(markdown).toContain("# Debug Readiness");
    expect(markdown).toContain("## Breakpoint Signals");
    expect(markdown).toContain("## Mapping Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "debug-readiness.html"), "utf8");
    expect(html).toContain("debug-readiness-card");
    expect(html).toContain("does not launch debuggers");
  });

  it("detects crash reporting readiness without sending events", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-crash-reporting-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-crash-reporting-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "mobile"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "crash-reporting-study",
      version: "1.0.0",
      scripts: {
        "release:sentry": "sentry-cli sourcemaps upload --release $COMMIT_SHA --dist web dist/assets --rewrite",
        "release:bugsnag": "bugsnag-source-maps upload-browser --api-key $BUGSNAG_API_KEY --app-version $APP_VERSION --minified-url https://cdn.example.com/app.js --source-map dist/app.js.map",
        "release:rollbar": "rollbar-sourcemap upload dist/app.js.map --code-version $COMMIT_SHA"
      },
      dependencies: {
        "@sentry/browser": "latest",
        "@sentry/nextjs": "latest",
        "@sentry/cli": "latest",
        "@bugsnag/js": "latest",
        "@bugsnag/source-maps": "latest",
        rollbar: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "sentry-crash.ts"), [
      "import * as Sentry from '@sentry/browser';",
      "Sentry.init({",
      "  dsn: process.env.SENTRY_DSN,",
      "  release: process.env.COMMIT_SHA,",
      "  dist: 'web',",
      "  environment: 'production',",
      "  beforeSend(event) {",
      "    delete event.request?.headers?.authorization;",
      "    return event;",
      "  },",
      "  sendDefaultPii: false,",
      "  sampleRate: 0.2",
      "});",
      "Sentry.addBreadcrumb({ category: 'checkout', message: 'before crash' });",
      "Sentry.setTag('deploy', process.env.COMMIT_SHA ?? 'local');",
      "Sentry.setUser({ id: 'redacted-user' });",
      "Sentry.captureException(new Error('handled crash'));",
      "Sentry.captureMessage('manual crash note');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "bugsnag-crash.ts"), [
      "import Bugsnag from '@bugsnag/js';",
      "Bugsnag.start({",
      "  apiKey: process.env.BUGSNAG_API_KEY,",
      "  appVersion: process.env.APP_VERSION,",
      "  releaseStage: 'production',",
      "  notifyReleaseStages: ['production'],",
      "  endpoints: { notify: 'https://notify.example.com', sessions: 'https://sessions.example.com' },",
      "  onError(event) {",
      "    event.addMetadata('deploy', { commit: process.env.COMMIT_SHA });",
      "    return true;",
      "  },",
      "  onSession(session) {",
      "    session.app.version = process.env.APP_VERSION;",
      "  }",
      "});",
      "Bugsnag.leaveBreadcrumb('checkout submitted');",
      "Bugsnag.notify(new Error('handled bugsnag crash'));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "rollbar-crash.ts"), [
      "import Rollbar from 'rollbar';",
      "const rollbar = new Rollbar({",
      "  accessToken: process.env.ROLLBAR_ACCESS_TOKEN,",
      "  code_version: process.env.COMMIT_SHA,",
      "  environment: 'production',",
      "  scrubFields: ['password'],",
      "  scrubPaths: ['request.headers.authorization'],",
      "  captureUncaught: true,",
      "  captureUnhandledRejections: true,",
      "  maxItems: 100,",
      "  itemsPerMinute: 60,",
      "  transform(payload) {",
      "    payload.data.level = 'error';",
      "    return payload;",
      "  }",
      "});",
      "rollbar.error('manual rollbar crash');"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "crash-reporting.md"), [
      "# Crash Reporting",
      "Sentry, Bugsnag, and Rollbar releases use source map upload, debug ID, artifact bundle, dSYM upload, ProGuard mapping.txt, symbolication, stacktrace linking, trace.frames, and trace_chain.",
      "Crash context includes breadcrumbs, sessions, user context, tags metadata, severity level, critical alert notification, fingerprint grouping, and deploy tracking.",
      "Privacy controls include beforeSend, onError filter, scrubFields, scrubPaths, sendDefaultPii false, dataCollection review, payload truncation, truncate, maxEvents, maxItems, sampleRate, retry rate limit, offline queue, and replay handling.",
      "Workflow checks include sourcemap test and crash smoke test before release."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "crash-reporting.yml"), [
      "name: crash-reporting",
      "on: [push, pull_request]",
      "jobs:",
      "  crash-reporting:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}",
      "      BUGSNAG_API_KEY: ${{ secrets.BUGSNAG_API_KEY }}",
      "      ROLLBAR_ACCESS_TOKEN: ${{ secrets.ROLLBAR_ACCESS_TOKEN }}",
      "      COMMIT_SHA: ${{ github.sha }}",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm release:sentry && pnpm release:bugsnag && pnpm release:rollbar",
      "      - run: echo 'sourcemap test source map test sourceMap test crash smoke test release deploy artifact bundle debug files'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: crash-symbolication-artifacts",
      "          path: |",
      "            dist/app.js.map",
      "            mobile/app.dSYM.zip",
      "            mobile/mapping.txt"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mobile", "proguard-rules.pro"), [
      "-keep class com.example.crash.** { *; }",
      "# ProGuard mapping.txt symbolication upload symbols native crash"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mobile", "mapping.txt"), [
      "com.example.Crash -> a.b:",
      "    1:1:void crash():42:42 -> a",
      "# ProGuard mapping.txt stacktrace symbolication"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "mobile", "Info.plist"), [
      "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
      "<plist><dict><key>CrashSymbolUpload</key><string>dSYM upload native crash symbol file</string></dict></plist>"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "crash-reporting-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      crashSetups: Array<{ filePath: string; platform: string; eventCount: number; releaseCount: number; sourceMapCount: number; debugIdCount: number; symbolCount: number; stacktraceCount: number; breadcrumbCount: number; sessionCount: number; privacyCount: number; alertCount: number; artifactCount: number; ciCount: number }>;
      captureSignals: Array<{ signal: string; readiness: string }>;
      releaseSignals: Array<{ signal: string; readiness: string }>;
      symbolicationSignals: Array<{ signal: string; readiness: string }>;
      contextSignals: Array<{ signal: string; readiness: string }>;
      privacySignals: Array<{ signal: string; readiness: string }>;
      deliverySignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Crash reporting readiness Sentry Bugsnag Rollbar release source maps debug IDs dSYM ProGuard stacktrace breadcrumbs sessions privacy alerts");
    expect(report.crashSetups.length).toBeGreaterThan(0);
    expect(report.crashSetups.some((item) => item.platform === "sentry" && item.eventCount > 0 && item.releaseCount > 0 && item.privacyCount > 0)).toBe(true);
    expect(report.crashSetups.some((item) => item.platform === "bugsnag" && item.eventCount > 0 && item.sessionCount > 0)).toBe(true);
    expect(report.crashSetups.some((item) => item.platform === "rollbar" && item.eventCount > 0 && item.privacyCount > 0)).toBe(true);
    expect(report.crashSetups.some((item) => item.platform === "package-script" && item.sourceMapCount > 0)).toBe(true);
    expect(report.crashSetups.some((item) => item.platform === "workflow" && item.ciCount > 0 && item.artifactCount > 0)).toBe(true);
    expect(report.crashSetups.some((item) => item.platform === "symbol-file-config" && item.symbolCount > 0)).toBe(true);
    expect(readySignals(report.captureSignals)).toEqual(expect.arrayContaining(["exception-capture", "unhandled-exception", "unhandled-rejection", "native-crash", "manual-notify", "event-pipeline"]));
    expect(readySignals(report.releaseSignals)).toEqual(expect.arrayContaining(["release-version", "dist-build", "environment-stage", "commit-sha", "deploy-tracking"]));
    expect(readySignals(report.symbolicationSignals)).toEqual(expect.arrayContaining(["source-map-upload", "debug-id", "artifact-bundle", "dsym", "proguard-mapping", "stacktrace-linking"]));
    expect(readySignals(report.contextSignals)).toEqual(expect.arrayContaining(["breadcrumbs", "sessions", "user-context", "tags-metadata", "severity-level", "fingerprint-grouping"]));
    expect(readySignals(report.privacySignals)).toEqual(expect.arrayContaining(["before-send", "on-error-filter", "scrub-fields", "pii-toggle", "payload-truncation", "sampling-rate-limit"]));
    expect(readySignals(report.deliverySignals)).toEqual(expect.arrayContaining(["dsn-access-token", "notify-endpoint", "sessions-endpoint", "offline-queue", "retry-rate-limit"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["ci-upload", "release-command", "artifact-upload", "sourcemap-test", "crash-smoke-test"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@sentry/*", "@bugsnag/js", "rollbar", "sentry-cli", "bugsnag-source-maps"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static crash reporting readiness only; it does not send crash events, upload source maps, upload symbols, contact Sentry/Bugsnag/Rollbar, or inspect production incidents.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"Sentry.init|captureException|Bugsnag.start|Bugsnag.notify|new Rollbar|Rollbar\\.(error|critical|warning)\" .",
      "rg \"release|dist|appVersion|code_version|releaseStage|environment|commit|deploy\" .",
      "rg \"sourcemap|source map|sourceMap|debugId|debug_id|artifact bundle|dSYM|ProGuard|mapping.txt|symbolication\" .",
      "rg \"beforeSend|onError|scrubFields|scrubPaths|sendDefaultPii|dataCollection|payload truncation|maxEvents|maxItems|sampleRate\" ."
    ]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "crash-reporting-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "crash-reporting-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "crash-reporting-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "crash-reporting-readiness.md"), "utf8");
    expect(markdown).toContain("# Crash Reporting Readiness");
    expect(markdown).toContain("## Symbolication Signals");
    expect(markdown).toContain("## Privacy Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "crash-reporting-readiness.html"), "utf8");
    expect(html).toContain("crash-reporting-readiness-card");
    expect(html).toContain("does not send crash events");
  });

  it("detects incident response readiness without paging responders", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incident-response-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-incident-response-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "ops"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "runbooks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "terraform"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "incident-response-study",
      version: "1.0.0",
      scripts: {
        "incident:validate": "terraform validate && terraform plan -out incident-response.tfplan",
        "incident:drill": "echo incident drill fire drill PagerDuty FireHydrant grafana-oncall"
      },
      dependencies: {
        "@slack/web-api": "latest",
        twilio: "latest",
        "grafana-oncall": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "terraform", "main.tf"), [
      "terraform { required_providers { pagerduty = { source = \"PagerDuty/pagerduty\" } firehydrant = { source = \"firehydrant/firehydrant\" } } }",
      "provider \"pagerduty\" { token = var.pagerduty_token }",
      "provider \"firehydrant\" { api_key = var.firehydrant_api_key }",
      "resource \"pagerduty_escalation_policy\" \"payments\" { name = \"Payments escalation policy\" }",
      "resource \"pagerduty_schedule\" \"payments_primary\" { name = \"Payments on-call schedule\" time_zone = \"UTC\" }",
      "resource \"firehydrant_on_call_schedule\" \"payments\" { name = \"payments schedule\" rotation_name = \"primary rotation\" rotation_description = \"follow-the-sun handoff rotation\" }",
      "resource \"firehydrant_escalation_policy\" \"payments\" { name = \"payments dynamic escalation policy\" }",
      "resource \"firehydrant_signal_rule\" \"payment_alert_route\" { name = \"payment alert route\" incident_type_id = firehydrant_incident_type.payment.id deduplication_expiry = \"PT30M\" }",
      "resource \"firehydrant_incident_type\" \"payment\" { name = \"payment outage\" }",
      "resource \"firehydrant_incident_role\" \"commander\" { name = \"Incident commander\" }",
      "resource \"firehydrant_severity\" \"sev1\" { slug = \"SEV1\" description = \"critical priority impact\" }",
      "resource \"firehydrant_runbook\" \"payment\" { name = \"payment incident runbook\" owner_id = firehydrant_team.payments.id restricted = true attachment_rule = \"incident_type\" steps = jsonencode([{ name = \"automatic step\", automatic = true }, { name = \"manual step\", automatic = false }]) }",
      "resource \"firehydrant_inbound_email\" \"payments\" { name = \"payment inbound email ingest\" target = \"payment-oncall@example.com\" }"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "ops", "grafana-oncall.yaml"), [
      "grafana-oncall:",
      "  alert_groups: payments",
      "  alert route: payment-alerts",
      "  on-call schedule: payments-primary",
      "  automatic escalations: true",
      "  notifications: Slack, phone calls, SMS, Telegram, email",
      "  Slack ChatOps: incident channel bookmark",
      "  webhook: https://alerts.example.com/webhook",
      "  override: holiday coverage"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "runbooks", "payment-outage.md"), [
      "# Payment Outage Runbook",
      "Manual incident declaration creates a payment incident and assigns the service owner team.",
      "Alertmanager webhook and signal rule route alerts with deduplication to the Payments escalation policy.",
      "On-call schedule rotation has handoff, override, timezone, and follow-the-sun coverage.",
      "Runbook owner_id, attachment_rule, automatic step, manual step, private incident, restricted runbook, and access control are reviewed.",
      "Responder communication uses Slack ChatOps, phone, SMS through Twilio, email, and a public status page statuspage stakeholder update.",
      "Lifecycle requires acknowledge, resolve, timeline, incident role commander, scribe, retrospective, postmortem, lessons learned, and follow-up actions.",
      "Governance includes audit log, RBAC role-based access control, API token handling, Enterprise tier requirements, terraform import, drift detection, and incident drill."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "incident-response.yml"), [
      "name: incident-response",
      "on: [push, pull_request]",
      "jobs:",
      "  validate:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      PAGERDUTY_TOKEN: ${{ secrets.PAGERDUTY_TOKEN }}",
      "      FIREHYDRANT_API_KEY: ${{ secrets.FIREHYDRANT_API_KEY }}",
      "      GRAFANA_ONCALL_URL: ${{ secrets.GRAFANA_ONCALL_URL }}",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: terraform validate",
      "      - run: terraform plan -out incident-response.tfplan",
      "      - run: terraform import pagerduty_escalation_policy.payments ABC123 || true",
      "      - run: echo 'incident drill drift detection fire drill'"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "incident-response-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      incidentSetups: Array<{ filePath: string; platform: string; incidentCount: number; alertRouteCount: number; escalationCount: number; scheduleCount: number; notificationCount: number; runbookCount: number; statusPageCount: number; roleCount: number; severityCount: number; timelineCount: number; postmortemCount: number; automationCount: number; ciCount: number }>;
      intakeSignals: Array<{ signal: string; readiness: string }>;
      triageSignals: Array<{ signal: string; readiness: string }>;
      onCallSignals: Array<{ signal: string; readiness: string }>;
      communicationSignals: Array<{ signal: string; readiness: string }>;
      runbookSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Incident response readiness PagerDuty Grafana OnCall FireHydrant alert routing escalation schedules runbooks status pages postmortems");
    expect(report.incidentSetups.length).toBeGreaterThan(0);
    expect(report.incidentSetups.some((item) => item.platform === "terraform" && item.escalationCount > 0 && item.scheduleCount > 0 && item.runbookCount > 0)).toBe(true);
    expect(report.incidentSetups.some((item) => item.platform === "grafana-oncall" && item.notificationCount > 0 && item.alertRouteCount > 0)).toBe(true);
    expect(report.incidentSetups.some((item) => item.platform === "workflow" && item.ciCount > 0 && item.automationCount > 0)).toBe(true);
    expect(readySignals(report.intakeSignals)).toEqual(expect.arrayContaining(["alert-route", "signal-rule", "webhook", "email-ingest", "manual-incident", "deduplication"]));
    expect(readySignals(report.triageSignals)).toEqual(expect.arrayContaining(["severity", "priority", "incident-type", "service-ownership", "team-assignment", "deduplication"]));
    expect(readySignals(report.onCallSignals)).toEqual(expect.arrayContaining(["schedule", "rotation", "handoff", "escalation-policy", "override", "follow-the-sun"]));
    expect(readySignals(report.communicationSignals)).toEqual(expect.arrayContaining(["slack", "chatops", "phone", "sms", "email", "status-page"]));
    expect(readySignals(report.runbookSignals)).toEqual(expect.arrayContaining(["runbook", "automatic-step", "manual-step", "owner", "attachment-rule", "private-incident"]));
    expect(readySignals(report.lifecycleSignals)).toEqual(expect.arrayContaining(["acknowledge", "resolve", "timeline", "retrospective", "postmortem", "incident-role"]));
    expect(readySignals(report.governanceSignals)).toEqual(expect.arrayContaining(["terraform-provider", "api-token", "audit-log", "access-control", "restricted-runbook", "enterprise-tier"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["ci-validate", "terraform-plan", "import", "drift-detection", "incident-drill"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["pagerduty-provider", "grafana-oncall", "firehydrant-provider", "slack-sdk", "twilio"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static incident-response readiness only; it does not page responders, create incidents, change on-call schedules, contact PagerDuty/Grafana OnCall/FireHydrant, or publish status pages.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"pagerduty|grafana-oncall|firehydrant|incident|signal_rule|alert route|webhook|inbound email\" .",
      "rg \"escalation policy|on.?call schedule|rotation|handoff|override|follow-the-sun\" .",
      "rg \"runbook|automatic step|manual step|attachment_rule|owner_id|restricted|private incident\" .",
      "rg \"postmortem|post-mortem|retrospective|timeline|status page|statuspage|acknowledge|resolve\" ."
    ]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "incident-response-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "incident-response-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "incident-response-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "incident-response-readiness.md"), "utf8");
    expect(markdown).toContain("# Incident Response Readiness");
    expect(markdown).toContain("## On-Call Signals");
    expect(markdown).toContain("## Runbook Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "incident-response-readiness.html"), "utf8");
    expect(html).toContain("incident-response-readiness-card");
    expect(html).toContain("does not page responders");
  });

  it("detects SLO readiness without evaluating PromQL", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-slo-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-slo-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "slo"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prometheus"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "dashboards"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "slo-readiness-study",
      version: "1.0.0",
      scripts: {
        "slo:validate": "sloth validate -i slo/payment-sloth.yaml && promtool check rules prometheus/payment-slo-rules.yaml",
        "slo:dry-run": "kubectl apply --dry-run=server -f slo && helm upgrade --install pyrra pyrra-dev/pyrra && pyrra --generic-rules"
      },
      dependencies: {
        sloth: "latest",
        pyrra: "latest",
        openslo: "latest",
        grafana: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "slo", "payment-openslo.yaml"), [
      "apiVersion: openslo/v1",
      "kind: SLO",
      "metadata:",
      "  name: payment-availability",
      "  displayName: Payment availability",
      "  labels:",
      "    team: payments",
      "    runbook: https://runbooks.example.com/payment-slo",
      "  annotations:",
      "    openslo.com/dashboard: https://grafana.example.com/d/slo",
      "spec:",
      "  service: payments-api",
      "  indicator:",
      "    ratioMetric:",
      "      good:",
      "        dataSourceRef: prometheus",
      "        query: sum(rate(http_requests_total{job=\"payments\",code!~\"5..\"}[{{.window}}]))",
      "      total:",
      "        dataSourceRef: prometheus",
      "        query: sum(rate(http_requests_total{job=\"payments\"}[{{.window}}]))",
      "  timeWindow:",
      "    - duration: 28d",
      "      isRolling: true",
      "  budgetingMethod: Occurrences",
      "  objectives:",
      "    - displayName: availability",
      "      targetPercent: 99.9",
      "      timeSliceTarget: 0.999",
      "      timeSliceWindow: 5m",
      "      compositeWeight: 1",
      "  alertPolicies:",
      "    - kind: burnrate",
      "      alertAfter: 5m",
      "---",
      "apiVersion: openslo/v1",
      "kind: SLI",
      "metadata:",
      "  name: payment-latency",
      "spec:",
      "  thresholdMetric:",
      "    dataSourceRef: prometheus",
      "    query: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[{{.window}}]))",
      "  op: lte",
      "  value: 0.25",
      "---",
      "apiVersion: openslo/v1",
      "kind: DataSource",
      "metadata:",
      "  name: prometheus",
      "  displayName: Prometheus datasource",
      "spec:",
      "  type: Prometheus",
      "  connectionDetails:",
      "    url: https://prometheus.example.com",
      "---",
      "apiVersion: openslo/v1",
      "kind: Service",
      "metadata:",
      "  name: payments-api",
      "  displayName: Payments API",
      "spec:",
      "  description: Service owning payment SLOs",
      "---",
      "apiVersion: openslo/v1",
      "kind: SLO",
      "metadata:",
      "  name: payment-calendar-timeslices",
      "spec:",
      "  service: payments-api",
      "  indicatorRef: payment-raw-ratio",
      "  timeWindow:",
      "    - duration: 1w",
      "      isRolling: false",
      "      calendar:",
      "        startTime: 2022-01-01 12:00:00",
      "        timeZone: America/New_York",
      "  budgetingMethod: Timeslices",
      "  objectives:",
      "    - displayName: Calendar objective",
      "      target: 0.9995",
      "      timeSliceTarget: 0.95",
      "      timeSliceWindow: 1m",
      "---",
      "apiVersion: openslo/v1",
      "kind: SLO",
      "metadata:",
      "  name: payment-ratio-timeslices",
      "spec:",
      "  service: payments-api",
      "  indicatorRef: payment-bad-total",
      "  timeWindow:",
      "    - duration: 2w",
      "      isRolling: true",
      "  budgetingMethod: RatioTimeslices",
      "  objectives:",
      "    - displayName: Ratio timeslice objective",
      "      op: gt",
      "      target: 0.99",
      "      timeSliceWindow: 1m",
      "---",
      "apiVersion: openslo/v1",
      "kind: SLI",
      "metadata:",
      "  name: payment-raw-ratio",
      "spec:",
      "  ratioMetric:",
      "    rawType: failure",
      "    raw:",
      "      metricSource:",
      "        metricSourceRef: prometheus",
      "        type: Prometheus",
      "        spec:",
      "          query: payment_error_ratio",
      "---",
      "apiVersion: openslo/v1",
      "kind: SLI",
      "metadata:",
      "  name: payment-bad-total",
      "spec:",
      "  ratioMetric:",
      "    bad:",
      "      metricSource:",
      "        metricSourceRef: prometheus",
      "        type: Prometheus",
      "        spec:",
      "          query: sum(rate(http_requests_total{job=\"payments\",code=~\"5..\"}[{{.window}}]))",
      "    total:",
      "      metricSource:",
      "        metricSourceRef: prometheus",
      "        type: Prometheus",
      "        spec:",
      "          query: sum(rate(http_requests_total{job=\"payments\"}[{{.window}}]))",
      "---",
      "apiVersion: openslo/v1",
      "kind: AlertCondition",
      "metadata:",
      "  name: payment-burnrate-page",
      "spec:",
      "  severity: page",
      "  condition:",
      "    kind: burnrate",
      "    op: gte",
      "    threshold: 2",
      "    lookbackWindow: 1h",
      "    alertAfter: 5m",
      "---",
      "apiVersion: openslo/v1",
      "kind: AlertNotificationTarget",
      "metadata:",
      "  name: payments-slack",
      "spec:",
      "  target: slack",
      "  description: Sends payment SLO alerts to Slack",
      "---",
      "apiVersion: openslo/v1",
      "kind: AlertPolicy",
      "metadata:",
      "  name: payment-alert-policy",
      "spec:",
      "  alertWhenNoData: true",
      "  alertWhenResolved: true",
      "  alertWhenBreaching: true",
      "  conditions:",
      "    - conditionRef: payment-burnrate-page",
      "  notificationTargets:",
      "    - targetRef: payments-slack"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "slo", "payment-sloth.yaml"), [
      "# sloth validate -i slo/payment-sloth.yaml in CI before multi window multi burn rule generation",
      "version: \"prometheus/v1\"",
      "service: payments-api",
      "labels:",
      "  team: payments",
      "slo_plugins:",
      "  - id: common-sli",
      "slos:",
      "  - name: payment-availability",
      "    objective: 99.9",
      "    description: Availability SLO with error budget and raw ratio backup",
      "    labels:",
      "      owner: sre",
      "    sli:",
      "      events:",
      "        error_query: sum(rate(http_requests_total{job=\"payments\",code=~\"5..|429\"}[{{.window}}]))",
      "        total_query: sum(rate(http_requests_total{job=\"payments\"}[{{.window}}]))",
      "      raw:",
      "        error_ratio_query: sum(rate(payment_error_ratio[{{.window}}]))",
      "    alerting:",
      "      name: payment-slo",
      "      labels:",
      "        dashboard: https://grafana.example.com/d/slo",
      "      page_alert:",
      "        labels:",
      "          severity: page",
      "          slack_channel: '#payments-page'",
      "      ticket_alert:",
      "        labels:",
      "          severity: ticket"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "slo", "payment-pyrra.yaml"), [
      "# Pyrra creates PrometheusRule objects for the Prometheus Operator.",
      "apiVersion: pyrra.dev/v1alpha1",
      "kind: ServiceLevelObjective",
      "metadata:",
      "  name: payment-errors",
      "  labels:",
      "    prometheus: k8s",
      "    role: alert-rules",
      "    pyrra.dev/team: payments",
      "spec:",
      "  target: \"99\"",
      "  window: 2w",
      "  performanceOverAccuracy: true",
      "  ruleOutput:",
      "    short:",
      "      labels:",
      "        prometheus: k8s",
      "    long:",
      "      labels:",
      "        prometheus: thanos-k8s",
      "  indicator:",
      "    ratio:",
      "      errors:",
      "        metric: http_requests_total{job=\"payments\",code=~\"5..\"}",
      "      total:",
      "        metric: http_requests_total{job=\"payments\"}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prometheus", "payment-slo-rules.yaml"), [
      "groups:",
      "  - name: payment-slo",
      "    rules:",
      "      - record: payment:http_requests:burnrate5m",
      "        expr: sum(rate(http_requests_total{job=\"payments\",code=~\"5..\"}[5m])) / sum(rate(http_requests_total{job=\"payments\"}[5m]))",
      "      - record: payment:slo:sli_error:ratio_rate28d",
      "        expr: sum_over_time(payment:http_requests:burnrate5m[28d:5m])",
      "      - alert: PaymentSLOBurnRatePage",
      "        expr: payment:http_requests:burnrate5m > 14.4",
      "        for: 5m",
      "        labels:",
      "          severity: page",
      "          team: payments",
      "        annotations:",
      "          runbook: https://runbooks.example.com/payment-slo",
      "      - alert: PaymentSLOBurnRateTicket",
      "        expr: payment:http_requests:burnrate5m > 6",
      "        for: 30m",
      "        labels:",
      "          severity: ticket"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "dashboards", "slo-dashboard.json"), JSON.stringify({
      title: "Grafana SLO dashboard",
      panels: [
        { title: "Error budget burned", targets: [{ expr: "payment:http_requests:burnrate5m" }] },
        { title: "Availability SLI", targets: [{ expr: "payment:slo:sli_error:ratio_rate28d" }] }
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "slo.yml"), [
      "name: slo",
      "on: [push, pull_request]",
      "jobs:",
      "  validate:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: sloth validate -i slo/payment-sloth.yaml",
      "      - run: promtool check rules prometheus/payment-slo-rules.yaml",
      "      - run: kubectl apply --dry-run=server -f slo",
      "      - run: helm upgrade --install pyrra pyrra-dev/pyrra --dry-run"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "slo-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      sloSetups: Array<{ filePath: string; platform: string; sloCount: number; sliCount: number; objectiveCount: number; targetCount: number; windowCount: number; budgetCount: number; alertCount: number; recordingRuleCount: number; burnRateCount: number; labelCount: number; dataSourceCount: number; validationCount: number; dashboardCount: number; ciCount: number }>;
      specSignals: Array<{ signal: string; readiness: string }>;
      openSloObjectSignals: Array<{ signal: string; readiness: string }>;
      timeWindowSignals: Array<{ signal: string; readiness: string }>;
      metricSourceSignals: Array<{ signal: string; readiness: string }>;
      indicatorSignals: Array<{ signal: string; readiness: string }>;
      objectiveSignals: Array<{ signal: string; readiness: string }>;
      alertSignals: Array<{ signal: string; readiness: string }>;
      ruleSignals: Array<{ signal: string; readiness: string }>;
      governanceSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("SLO readiness OpenSLO object model DataSource SLO SLI AlertPolicy AlertCondition AlertNotificationTarget Service duration shorthand service level objective SLI error budget burn rate Prometheus recording rules");
    expect(report.sloSetups.length).toBeGreaterThan(0);
    expect(report.sloSetups.some((item) => item.platform === "openslo" && item.sloCount > 0 && item.sliCount > 0 && item.targetCount > 0)).toBe(true);
    expect(report.sloSetups.some((item) => item.platform === "sloth" && item.sloCount > 0 && item.alertCount > 0 && item.validationCount > 0)).toBe(true);
    expect(report.sloSetups.some((item) => item.platform === "pyrra" && item.sloCount > 0 && item.recordingRuleCount > 0)).toBe(true);
    expect(report.sloSetups.some((item) => item.platform === "prometheus-rule" && item.recordingRuleCount > 0 && item.burnRateCount > 0)).toBe(true);
    expect(report.sloSetups.some((item) => item.platform === "workflow" && item.ciCount > 0 && item.validationCount > 0)).toBe(true);
    expect(readySignals(report.specSignals)).toEqual(expect.arrayContaining(["openslo", "sloth-spec", "pyrra-crd", "prometheus-rule", "yaml-manifest"]));
    expect(readySignals(report.openSloObjectSignals)).toEqual(expect.arrayContaining(["data-source-kind", "slo-kind", "sli-kind", "alert-policy-kind", "alert-condition-kind", "alert-notification-target-kind", "service-kind", "metadata-name", "display-name", "labels", "annotations"]));
    expect(readySignals(report.timeWindowSignals)).toEqual(expect.arrayContaining(["duration-shorthand", "rolling-window", "calendar-window", "time-zone", "budgeting-occurrences", "budgeting-timeslices", "budgeting-ratio-timeslices"]));
    expect(readySignals(report.metricSourceSignals)).toEqual(expect.arrayContaining(["metric-source-ref", "metric-source-type", "connection-details", "ratio-good-total", "ratio-bad-total", "raw-ratio-type", "threshold-operator"]));
    expect(readySignals(report.indicatorSignals)).toEqual(expect.arrayContaining(["ratio-metric", "threshold-metric", "latency", "availability", "error-query", "total-query", "raw-ratio"]));
    expect(readySignals(report.objectiveSignals)).toEqual(expect.arrayContaining(["target", "target-percent", "time-window", "budgeting-method", "composite-weight", "error-budget"]));
    expect(readySignals(report.alertSignals)).toEqual(expect.arrayContaining(["burn-rate", "multi-window", "page-alert", "ticket-alert", "prometheus-alert", "alert-after", "alert-labels"]));
    expect(readySignals(report.ruleSignals)).toEqual(expect.arrayContaining(["recording-rules", "prometheus-operator", "promql-window-template", "rule-output", "generic-rules"]));
    expect(readySignals(report.governanceSignals)).toEqual(expect.arrayContaining(["service-owner", "labels", "team", "runbook-link", "dashboard", "validation"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["ci-validate", "sloth-validate", "kubectl-apply", "helm-chart", "dry-run"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["sloth", "pyrra", "openslo", "prometheus-operator", "grafana"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static SLO readiness only; it does not evaluate PromQL, query Prometheus/Grafana, apply Kubernetes resources, generate rules, or page teams.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"apiVersion: (openslo|pyrra)|kind: (SLO|SLI|ServiceLevelObjective)|sloth.dev\" .",
      "rg \"kind: (DataSource|SLO|SLI|AlertPolicy|AlertCondition|AlertNotificationTarget|Service)|metadata:|displayName|annotations:\" .",
      "rg \"duration: [0-9]+[mhdwMQY]|isRolling|calendar:|timeZone|Occurrences|Timeslices|RatioTimeslices\" .",
      "rg \"metricSourceRef|metricSource:|connectionDetails|rawType|good:|bad:|total:|op: (lte|gte|lt|gt)\" .",
      "rg \"ratioMetric|thresholdMetric|indicator:|error_query|total_query|latency|availability|raw ratio\" .",
      "rg \"targetPercent|target:|objective:|timeWindow|window:|budgetingMethod|error budget\" .",
      "rg \"burnrate|burn rate|page_alert|ticket_alert|PrometheusRule|recording rule|alertAfter|multi window\" .",
      "rg \"sloth validate|pyrra|kubectl apply|helm chart|dry-run|generic-rules\" .github . scripts ops deploy"
    ]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "slo-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "slo-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "slo-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "slo-readiness.md"), "utf8");
    expect(markdown).toContain("# SLO Readiness");
    expect(markdown).toContain("## OpenSLO Object Signals");
    expect(markdown).toContain("## Time Window Signals");
    expect(markdown).toContain("## Metric Source Signals");
    expect(markdown).toContain("## Indicator Signals");
    expect(markdown).toContain("## Rule Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "slo-readiness.html"), "utf8");
    expect(html).toContain("slo-readiness-card");
    expect(html).toContain("OpenSLO Object Signals");
    expect(html).toContain("Time Window Signals");
    expect(html).toContain("Metric Source Signals");
    expect(html).toContain("does not evaluate PromQL");
  });

  it("detects cost readiness without querying billing systems", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-cost-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-cost-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "finops"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "helm", "kubecost"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prometheus"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "cost-readiness-study",
      version: "1.0.0",
      scripts: {
        "cost:breakdown": "infracost breakdown --path infra --usage-file finops/infracost-usage.yml --format json --out-file reports/infracost.json",
        "cost:diff": "infracost diff --config-file finops/infracost.yml --format json --out-file reports/infracost-diff.json && infracost comment github --path reports/infracost-diff.json",
        "cost:allocation": "kubectl cost namespace --window 7d"
      },
      dependencies: {
        infracost: "latest",
        opencost: "latest",
        kubecost: "latest",
        prometheus: "latest",
        grafana: "latest",
        helm: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "finops", "infracost.yml"), [
      "version: 0.1",
      "projects:",
      "  - path: ../infra",
      "    usage_file: infracost-usage.yml",
      "    dependency_paths:",
      "      - ../infra/modules",
      "policy_checks:",
      "  enabled: true",
      "  policySha: abc123",
      "thresholds:",
      "  monthly_cost: 500",
      "# infracost breakdown and infracost diff post pull request comment with baseline cost, total change, and new monthly cost"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "finops", "infracost-usage.yml"), [
      "version: 0.1",
      "resource_usage:",
      "  aws_instance.web:",
      "    monthly_cpu_credit_hrs: 40",
      "    operating_system: linux"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "finops", "opencost.md"), [
      "# OpenCost allocation",
      "Use OpenCost get_allocation_costs with window: 7d and aggregate: namespace,node,service,label:team.",
      "The API mirrors /allocation/compute?aggregate=namespace&window=7d and CloudCost provider/service/region aggregation.",
      "Set PROMETHEUS_SERVER_ENDPOINT to Thanos Query for HA Prometheus.",
      "Metrics include node_total_hourly_cost, container_cpu_allocation, and container_memory_allocation_bytes.",
      "OpenCost MCP is opt-in with opencost.mcp.enabled=true and MCP_SERVER_ENABLED=true.",
      "kubectl cost namespace validates the CLI path."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "helm", "kubecost", "Chart.yaml"), [
      "apiVersion: v2",
      "name: kubecost",
      "version: 1.0.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "helm", "kubecost", "values.yaml"), [
      "global:",
      "  notifications:",
      "    alertConfigs:",
      "      globalSlackWebhookUrl: https://hooks.slack.com/services/example",
      "      globalAlertEmails:",
      "        - finops@example.com",
      "      alerts:",
      "        - type: budget",
      "          window: 1h",
      "          ownerContact: finops@example.com",
      "          slackWebhookUrl: https://hooks.slack.com/services/team",
      "kubecostProductConfigs:",
      "  budgets:",
      "    budgetsConfig:",
      "      - budgetType: allocations",
      "        filters:",
      "          label:",
      "            - team:payments",
      "        threshold: 1000",
      "        emails:",
      "          - budget-alert@example.com",
      "  labelMappingConfigs:",
      "    owner_label: owner",
      "    team_label: team",
      "    department_label: dept",
      "    product_label: product",
      "    environment_label: env",
      "  savingsRecommendationsAllowLists:",
      "    aws:",
      "      nodeGroups:",
      "        - payments",
      "  savingsProfiles:",
      "    requestSizing:",
      "      enabled: true",
      "  costEventsAudit:",
      "    enabled: true",
      "  forecasting:",
      "    enabled: true",
      "cloudCost:",
      "  enabled: true",
      "  cloudIntegrationSecret: cloud-integration",
      "  cloudIntegrationJSON: '{\"aws\": {\"athena\": true}}'",
      "networkCosts:",
      "  enabled: true",
      "  prometheusScrape: true",
      "persistentVolume:",
      "  enabled: true",
      "  size: 32Gi",
      "enterpriseCustomPricing:",
      "  enabled: true",
      "  configMapName: kubecost-enterprise-pricing",
      "kubecost:",
      "  customPrices:",
      "    enabled: true",
      "    CSV: pricing.csv"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prometheus", "cost-rules.yaml"), [
      "groups:",
      "  - name: cost-allocation",
      "    rules:",
      "      - record: namespace:node_total_hourly_cost:sum",
      "        expr: sum by (namespace) (node_total_hourly_cost)",
      "      - record: namespace:container_cpu_allocation:sum",
      "        expr: sum by (namespace,pod) (container_cpu_allocation)",
      "      - alert: CostBudgetExceeded",
      "        expr: namespace:node_total_hourly_cost:sum > 1000",
      "        labels:",
      "          severity: warning",
      "          team: finops",
      "        annotations:",
      "          dashboard: https://grafana.example.com/d/cost"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "cost.yml"), [
      "name: cost",
      "on: [pull_request]",
      "jobs:",
      "  infracost:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: infracost breakdown --path infra --usage-file finops/infracost-usage.yml --format json --out-file infracost-base.json",
      "        env:",
      "          INFRACOST_API_KEY: ${{ secrets.INFRACOST_API_KEY }}",
      "      - run: infracost diff --config-file finops/infracost.yml --format json --out-file infracost-diff.json",
      "      - run: infracost comment github --path infracost-diff.json --behavior update",
      "      - run: helm upgrade --install kubecost ./helm/kubecost --dry-run",
      "      - run: kubectl cost namespace --window 7d"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "cost-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      costSetups: Array<{ filePath: string; platform: string; estimateCount: number; diffCount: number; allocationCount: number; pricingCount: number; cloudCostCount: number; budgetCount: number; alertCount: number; labelCount: number; prometheusCount: number; dashboardCount: number; workflowCount: number }>;
      estimateSignals: Array<{ signal: string; readiness: string }>;
      allocationSignals: Array<{ signal: string; readiness: string }>;
      pricingSignals: Array<{ signal: string; readiness: string }>;
      budgetSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Cost readiness Infracost OpenCost Kubecost FinOps cost allocation cloud cost budget pricing Prometheus");
    expect(report.costSetups.length).toBeGreaterThan(0);
    expect(report.costSetups.some((item) => item.platform === "infracost" && item.estimateCount > 0 && item.diffCount > 0)).toBe(true);
    expect(report.costSetups.some((item) => item.platform === "opencost" && item.allocationCount > 0 && item.prometheusCount > 0)).toBe(true);
    expect(report.costSetups.some((item) => item.platform === "kubecost" && item.budgetCount > 0 && item.cloudCostCount > 0 && item.alertCount > 0)).toBe(true);
    expect(report.costSetups.some((item) => item.platform === "workflow" && item.workflowCount > 0 && item.diffCount > 0)).toBe(true);
    expect(readySignals(report.estimateSignals)).toEqual(expect.arrayContaining(["infracost-breakdown", "infracost-diff", "usage-file", "config-file", "monthly-cost", "policy-check"]));
    expect(readySignals(report.allocationSignals)).toEqual(expect.arrayContaining(["namespace", "pod", "node", "service", "label", "cloud-cost", "asset"]));
    expect(readySignals(report.pricingSignals)).toEqual(expect.arrayContaining(["custom-pricing", "pricing-csv", "cloud-provider", "aws"]));
    expect(readySignals(report.budgetSignals)).toEqual(expect.arrayContaining(["budget-config", "threshold", "forecast", "savings", "rightsizing", "cost-events"]));
    expect(readySignals(report.observabilitySignals)).toEqual(expect.arrayContaining(["prometheus-endpoint", "metrics", "recording-rules", "grafana", "thanos", "network-costs", "persistent-volume"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["pull-request-comment", "github-actions", "ci-cost-diff", "helm-install", "kubectl-cost", "mcp"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["infracost", "opencost", "kubecost", "prometheus", "grafana", "helm"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static cost readiness only; it does not run Infracost, query OpenCost/Kubecost, contact Prometheus/Grafana, inspect cloud bills, or calculate spend.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"infracost (breakdown|diff|scan|inspect)|INFRACOST_API_KEY|usage-file|config-file\" .",
      "rg \"OpenCost|Kubecost|cost allocation|allocation/compute|get_allocation_costs|aggregate=|kubectl cost\" .",
      "rg \"cloudCost|CloudCost|customPrices|pricing.csv|cloudIntegration|AWS|Azure|GCP\" .",
      "rg \"budget|budgetsConfig|threshold|forecast|savings|rightsizing|alertConfigs|Slack|Teams\" .",
      "rg \"PROMETHEUS_SERVER_ENDPOINT|node_total_hourly_cost|container_cpu_allocation|Grafana|Thanos|networkCosts\" ."
    ]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "cost-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "cost-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "cost-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "cost-readiness.md"), "utf8");
    expect(markdown).toContain("# Cost Readiness");
    expect(markdown).toContain("## Allocation Signals");
    expect(markdown).toContain("## Observability Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "cost-readiness.html"), "utf8");
    expect(html).toContain("cost-readiness-card");
    expect(html).toContain("does not run Infracost");
  });

  it("detects progressive delivery readiness without touching rollout controllers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-progressive-delivery-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-progressive-delivery-source-"));
    await fs.mkdir(path.join(sourceRoot, "rollouts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "flagger"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "kayenta"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "progressive-delivery-study",
      version: "1.0.0",
      scripts: {
        "rollout:status": "kubectl argo rollouts get rollout orders -n prod",
        "rollout:promote": "kubectl argo rollouts promote orders -n prod",
        "rollout:abort": "kubectl argo rollouts abort orders -n prod",
        "rollout:retry": "kubectl argo rollouts retry rollout/orders -n prod"
      },
      dependencies: {
        "argo-rollouts": "latest",
        flagger: "latest",
        kayenta: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "rollouts", "orders-rollout.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: Rollout",
      "metadata:",
      "  name: orders",
      "spec:",
      "  progressDeadlineSeconds: 600",
      "  progressDeadlineAbort: true",
      "  strategy:",
      "    canary:",
      "      stableService: orders-stable",
      "      canaryService: orders-canary",
      "      abortScaleDownDelaySeconds: 30",
      "      trafficRouting:",
      "        istio:",
      "          virtualService:",
      "            name: orders-vsvc",
      "            routes: [primary]",
      "      steps:",
      "        - setWeight: 20",
      "        - pause: { duration: 5m }",
      "        - analysis:",
      "            templates:",
      "              - templateName: orders-success-rate",
      "        - setWeight: 50",
      "---",
      "apiVersion: argoproj.io/v1alpha1",
      "kind: Rollout",
      "metadata:",
      "  name: orders-bluegreen",
      "spec:",
      "  strategy:",
      "    blueGreen:",
      "      activeService: orders-active",
      "      previewService: orders-preview",
      "      previewReplicaCount: 2",
      "      autoPromotionEnabled: false",
      "      scaleDownDelaySeconds: 30",
      "---",
      "apiVersion: argoproj.io/v1alpha1",
      "kind: AnalysisTemplate",
      "metadata:",
      "  name: orders-success-rate",
      "spec:",
      "  metrics:",
      "    - name: success-rate",
      "      interval: 1m",
      "      successCondition: result[0] >= 0.99",
      "      failureCondition: result[0] < 0.95",
      "      failureLimit: 2",
      "      provider:",
      "        prometheus:",
      "          address: http://prometheus.monitoring.svc:9090",
      "          query: sum(rate(http_requests_total{status!~\"5..\"}[5m])) / sum(rate(http_requests_total[5m]))",
      "---",
      "apiVersion: argoproj.io/v1alpha1",
      "kind: Experiment",
      "metadata:",
      "  name: orders-experiment",
      "spec:",
      "  templates:",
      "    - name: baseline",
      "      replicas: 1",
      "    - name: canary",
      "      replicas: 1",
      "---",
      "apiVersion: argoproj.io/v1alpha1",
      "kind: AnalysisRun",
      "metadata:",
      "  name: orders-success-rate-run",
      "status:",
      "  phase: Successful",
      "  message: Canary analysis completed successfully"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "flagger", "orders-canary.yaml"), [
      "apiVersion: flagger.app/v1beta1",
      "kind: Canary",
      "metadata:",
      "  name: orders",
      "spec:",
      "  provider: istio",
      "  targetRef:",
      "    apiVersion: apps/v1",
      "    kind: Deployment",
      "    name: orders",
      "  service:",
      "    port: 80",
      "    gateways: [mesh]",
      "  analysis:",
      "    interval: 15s",
      "    threshold: 5",
      "    maxWeight: 50",
      "    stepWeight: 5",
      "    stepWeights: [5, 10, 20, 30, 40, 50]",
      "    metrics:",
      "      - name: request-success-rate",
      "        thresholdRange:",
      "          min: 99",
      "        interval: 1m",
      "      - name: request-duration",
      "        templateRef:",
      "          name: latency",
      "        thresholdRange:",
      "          max: 500",
      "        interval: 30s",
      "    webhooks:",
      "      - name: load-test",
      "        type: rollout",
      "        url: http://flagger-loadtester.test/",
      "      - name: gate",
      "        type: confirm-promotion",
      "        url: http://gate.test/approve",
      "    alerts:",
      "      - name: slack-alert",
      "        severity: error",
      "        providerRef:",
      "          name: slack",
      "---",
      "apiVersion: flagger.app/v1beta1",
      "kind: MetricTemplate",
      "metadata:",
      "  name: latency",
      "spec:",
      "  provider:",
      "    type: prometheus",
      "    address: http://prometheus.monitoring:9090",
      "  query: histogram_quantile(0.99, sum(rate(request_duration_seconds_bucket[{{ interval }}])) by (le))",
      "---",
      "apiVersion: flagger.app/v1beta1",
      "kind: AlertProvider",
      "metadata:",
      "  name: slack",
      "spec:",
      "  type: slack",
      "  channel: '#deployments'",
      "  username: flagger",
      "---",
      "apiVersion: split.smi-spec.io/v1alpha3",
      "kind: TrafficSplit",
      "metadata:",
      "  name: orders",
      "spec:",
      "  service: orders",
      "  backends:",
      "    - service: orders-primary",
      "      weight: 90",
      "    - service: orders-canary",
      "      weight: 10",
      "---",
      "apiVersion: networking.k8s.io/v1",
      "kind: Ingress",
      "metadata:",
      "  name: orders-canary",
      "  annotations:",
      "    nginx.ingress.kubernetes.io/canary: \"true\"",
      "    nginx.ingress.kubernetes.io/canary-weight: \"10\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "kayenta", "canary-config.json"), JSON.stringify({
      name: "orders-kayenta",
      description: "Kayenta automated canary analysis for orders",
      judge: {
        name: "NetflixACAJudge-v1.0",
        judgeConfigurations: {}
      },
      metrics: [
        {
          name: "errors",
          query: "sum:trace.http.request.errors{service:orders}.as_count()",
          analysisConfigurations: {
            canary: {
              direction: "increase"
            }
          }
        }
      ],
      scoreThresholds: {
        marginal: 75,
        pass: 95
      },
      pipeline: [
        { type: "metricSetMixer", controlScope: "baseline", experimentScope: "canary" },
        { type: "canaryJudge", canaryConfigId: "orders-kayenta", metricSetPairListId: "mixed", metricsAccountName: "datadog-prod" }
      ],
      baseline: "orders-stable",
      experiment: "orders-canary",
      controlScope: { scope: "baseline" },
      experimentScope: { scope: "canary" },
      Datadog: true
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "progressive-delivery.yml"), [
      "name: progressive-delivery",
      "on: [pull_request]",
      "jobs:",
      "  rollout:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: helm upgrade --install argo-rollouts argo/argo-rollouts --namespace argo-rollouts --wait",
      "      - run: kubectl apply --dry-run=server -f rollouts/orders-rollout.yaml",
      "      - run: kubectl argo rollouts get rollout orders -n prod --watch=false > rollout-report.txt",
      "      - run: kubectl argo rollouts promote orders -n prod",
      "      - run: kubectl argo rollouts abort orders -n prod || true",
      "      - run: kubectl argo rollouts retry rollout/orders -n prod || true",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: rollout report",
      "          path: rollout-report.txt"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "progressive-delivery-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      rolloutSetups: Array<{ platform: string; strategyCount: number; trafficRoutingCount: number; analysisCount: number; promotionCount: number; abortCount: number; workflowCount: number }>;
      strategySignals: Array<{ signal: string; readiness: string }>;
      trafficSignals: Array<{ signal: string; readiness: string }>;
      analysisSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      notificationSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Progressive delivery readiness Argo Rollouts Flagger Kayenta canary blue-green traffic routing analysis promotion abort");
    expect(report.rolloutSetups.length).toBeGreaterThan(0);
    expect(report.rolloutSetups.some((item) => item.platform === "argo-rollouts" && item.strategyCount > 0 && item.trafficRoutingCount > 0 && item.analysisCount > 0)).toBe(true);
    expect(report.rolloutSetups.some((item) => item.platform === "flagger" && item.strategyCount > 0 && item.trafficRoutingCount > 0 && item.analysisCount > 0)).toBe(true);
    expect(report.rolloutSetups.some((item) => item.platform === "kayenta" && item.analysisCount > 0)).toBe(true);
    expect(report.rolloutSetups.some((item) => item.platform === "workflow" && item.workflowCount > 0 && item.promotionCount > 0 && item.abortCount > 0)).toBe(true);
    expect(readySignals(report.strategySignals)).toEqual(expect.arrayContaining(["rollout-crd", "canary-crd", "blue-green", "canary-steps", "experiment", "traffic-routing"]));
    expect(readySignals(report.trafficSignals)).toEqual(expect.arrayContaining(["set-weight", "step-weight", "max-weight", "traffic-split", "service-mesh", "ingress"]));
    expect(readySignals(report.analysisSignals)).toEqual(expect.arrayContaining(["analysis-template", "metric-template", "kayenta-judge", "prometheus-query", "datadog-query", "webhook-check", "threshold-range", "score-threshold"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["manual-promotion", "auto-promotion", "abort-on-failure", "pause-step", "rollback", "progress-deadline", "failure-threshold"]));
    expect(readySignals(report.notificationSignals)).toEqual(expect.arrayContaining(["slack", "webhook", "alert-provider", "analysis-run-status"]));
    expect(readySignals(report.workflowSignals)).toEqual(expect.arrayContaining(["kubectl-plugin", "promote-command", "abort-command", "retry-command", "helm-install", "github-actions", "artifact-upload"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["argo-rollouts", "flagger", "kayenta", "prometheus", "istio"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("RepoTutor records static progressive delivery readiness only; it does not apply Rollouts or Canaries, shift traffic, query metrics, promote, abort, or roll back releases.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"apiVersion: argoproj.io|kind: Rollout|AnalysisTemplate|AnalysisRun|Experiment\" .",
      "rg \"kind: Canary|flagger.app|MetricTemplate|AlertProvider|thresholdRange|stepWeight|maxWeight\" .",
      "rg \"trafficRouting|setWeight|stepWeights|VirtualService|TrafficSplit|HTTPRoute|Ingress|Gateway\" .",
      "rg \"Kayenta|canaryJudge|scoreThresholds|baseline|experiment|controlScope|experimentScope\" .",
      "rg \"promote|abort|pause|rollback|failureThreshold|manualPromotion|kubectl argo rollouts\" .github . scripts deploy"
    ]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "progressive-delivery-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "progressive-delivery-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "progressive-delivery-readiness.html"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "progressive-delivery-readiness.md"), "utf8");
    expect(markdown).toContain("# Progressive Delivery Readiness");
    expect(markdown).toContain("## Traffic Signals");
    expect(markdown).toContain("## Analysis Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "progressive-delivery-readiness.html"), "utf8");
    expect(html).toContain("progressive-delivery-readiness-card");
    expect(html).toContain("does not apply Rollouts");
  });

  it("detects load testing readiness without running load toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-load-testing-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-load-testing-source-"));
    await fs.mkdir(path.join(sourceRoot, "performance"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "load-testing-study",
      version: "1.0.0",
      scripts: {
        "load:k6": "k6 run --summary-export reports/k6-summary.json performance/k6-load.js",
        "load:artillery": "artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json",
        "load:locust": "locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust",
        "load:autocannon": "autocannon -c 20 -d 30 http://localhost:3000"
      },
      dependencies: {
        artillery: "latest",
        "@artilleryio/processor": "latest",
        "artillery-engine-playwright": "latest",
        "artillery-plugin-ensure": "latest",
        "artillery-plugin-expect": "latest",
        "artillery-plugin-publish-metrics": "latest",
        autocannon: "latest"
      },
      devDependencies: {
        k6: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "performance", "k6-load.js"), [
      "import http from 'k6/http';",
      "import ws from 'k6/ws';",
      "import grpc from 'k6/net/grpc';",
      "import { browser } from 'k6/browser';",
      "import { check, group, sleep } from 'k6';",
      "import { Counter, Rate, Trend } from 'k6/metrics';",
      "import { SharedArray } from 'k6/data';",
      "const data = new SharedArray('users', () => JSON.parse(open('./users.json')));",
      "export const options = {",
      "  vus: 10,",
      "  duration: '30s',",
      "  stages: [{ duration: '30s', target: 20 }, { duration: '1m', target: 20 }, { duration: '10s', target: 0 }],",
      "  scenarios: {",
      "    smoke: { executor: 'constant-vus', vus: 1, duration: '30s' },",
      "    stress: { executor: 'ramping-vus', stages: [{ duration: '1m', target: 50 }] },",
      "    spike: { executor: 'ramping-arrival-rate', startRate: 1, timeUnit: '1s', preAllocatedVUs: 10, stages: [{ duration: '30s', target: 100 }] },",
      "    soak: { executor: 'constant-arrival-rate', rate: 5, timeUnit: '1s', duration: '10m', preAllocatedVUs: 20 }",
      "  },",
      "  thresholds: {",
      "    http_req_duration: ['p(95)<500', { threshold: 'p(99)<1000', abortOnFail: true }],",
      "    http_req_failed: ['rate<0.01'],",
      "    checks: ['rate>0.99']",
      "  },",
      "  summaryTrendStats: ['avg', 'p(95)', 'p(99)'],",
      "  ext: { loadimpact: { projectID: 123 } }",
      "};",
      "const errors = new Counter('custom_errors');",
      "const successRate = new Rate('custom_success');",
      "const apiTrend = new Trend('api_duration');",
      "export function setup() { return { token: __ENV.API_TOKEN, data }; }",
      "export default function () {",
      "  group('graphql api', () => {",
      "    const res = http.post(`${__ENV.BASE_URL}/graphql`, JSON.stringify({ query: '{ viewer { id } }' }), { tags: { name: 'GraphQL query' } });",
      "    check(res, { 'status is 200': (r) => r.status === 200, 'response body valid': (r) => r.body.includes('viewer') });",
      "    successRate.add(res.status === 200);",
      "    apiTrend.add(res.timings.duration);",
      "    errors.add(res.status !== 200);",
      "  });",
      "  ws.connect('wss://example.test/socket', {}, () => {});",
      "  grpc.Client;",
      "  browser.newPage;",
      "  sleep(1);",
      "}",
      "export function teardown() {}",
      "export function handleSummary(data) {",
      "  return { 'reports/k6-summary.json': JSON.stringify(data), stdout: 'summary' };",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "performance", "users.json"), "[{\"id\":1}]\n");
    await fs.writeFile(path.join(sourceRoot, "load-test.yml"), [
      "config:",
      "  target: \"https://example.test\"",
      "  phases:",
      "    - duration: 60",
      "      arrivalRate: 5",
      "      rampTo: 50",
      "      name: stress",
      "  plugins:",
      "    ensure: {}",
      "    expect: {}",
      "    publish-metrics:",
      "      - type: prometheus",
      "      - type: datadog",
      "  processor: \"./processor.js\"",
      "  engines:",
      "    playwright: {}",
      "  ensure:",
      "    thresholds:",
      "      - http.response_time.p95: 500",
      "  apdex:",
      "    threshold: 200",
      "  variables:",
      "    tenant:",
      "      - alpha",
      "  payload:",
      "    path: ./performance/users.csv",
      "    fields:",
      "      - id",
      "scenarios:",
      "  - name: graphql websocket browser",
      "    beforeScenario: \"beforeScenario\"",
      "    afterScenario: \"afterScenario\"",
      "    engine: \"playwright\"",
      "    flow:",
      "      - get:",
      "          url: \"/health\"",
      "          expect:",
      "            - statusCode: 200",
      "      - post:",
      "          url: \"/graphql\"",
      "          json:",
      "            query: \"{ viewer { id } }\"",
      "      - websocket:",
      "          url: \"wss://example.test/socket\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "processor.js"), [
      "module.exports.beforeScenario = function beforeScenario(context, events, done) {",
      "  context.vars.token = process.env.API_TOKEN;",
      "  events.request.fire('counter', 'custom_metric', 1);",
      "  done();",
      "};",
      "module.exports.afterScenario = function afterScenario(context, events, done) {",
      "  events.request.fire('histogram', 'scenario_duration', 10);",
      "  done();",
      "};",
      "module.exports.beforeRequest = function beforeRequest(requestParams, context, events, done) {",
      "  requestParams.headers = { 'x-tenant': context.vars.tenant };",
      "  const tcpSocket = 'net.connect tcp socket';",
      "  done();",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "locustfile.py"), [
      "from locust import HttpUser, FastHttpUser, LoadTestShape, between, constant_pacing, task, events",
      "import os, csv",
      "class WebsiteUser(HttpUser):",
      "    host = os.environ.get('TARGET_HOST', 'https://example.test')",
      "    wait_time = between(1, 2)",
      "    @task(3)",
      "    def index(self):",
      "        with self.client.get('/health', name='status-check', catch_response=True) as response:",
      "            if response.status_code != 200:",
      "                response.failure('status_check failed')",
      "    @task",
      "    def graphql(self):",
      "        self.client.post('/graphql', json={'query': '{ viewer { id } }'}, name='GraphQL')",
      "class ApiUser(FastHttpUser):",
      "    wait_time = constant_pacing(1)",
      "    @task",
      "    def api(self):",
      "        self.client.get('/api')",
      "class StepLoadShape(LoadTestShape):",
      "    def tick(self):",
      "        run_time = self.get_run_time()",
      "        if run_time < 60:",
      "            return (10, 2)",
      "        return None",
      "@events.request.add_listener",
      "def on_request(**kwargs):",
      "    pass"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "requirements-load.txt"), [
      "locust>=2",
      "locust-plugins>=4"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "performance", "users.csv"), "id\n1\n");
    await fs.writeFile(path.join(sourceRoot, "docker-compose.yml"), [
      "services:",
      "  k6:",
      "    image: grafana/k6",
      "    command: run /scripts/k6-load.js",
      "  locust-master:",
      "    image: locustio/locust",
      "    command: --master --expect-workers 2",
      "  locust-worker:",
      "    image: locustio/locust",
      "    command: --worker --master-host locust-master",
      "  artillery:",
      "    image: artilleryio/artillery",
      "    command: run /scripts/load-test.yml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "load.yml"), [
      "name: load",
      "on: [push, pull_request]",
      "jobs:",
      "  load:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      K6_CLOUD_TOKEN: ${{ secrets.K6_CLOUD_TOKEN }}",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: k6 run --summary-export reports/k6-summary.json performance/k6-load.js",
      "      - run: k6 cloud performance/k6-load.js",
      "      - run: artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json",
      "      - run: artillery cloud run load-test.yml",
      "      - run: locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust --processes 2 --expect-workers 2",
      "      - run: echo 'SLO service level objective p(95) p(99) JUnit xunit InfluxDB cloud dashboard Grafana Cloud k6-operator Kubernetes TestRun distributed parallel workers'",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: load-performance-reports",
      "          path: |",
      "            reports/k6-summary.json",
      "            reports/artillery.json",
      "            reports/locust.html",
      "            reports/locust_stats.csv",
      "            reports/load-junit.xml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Load Testing Study",
      "Authorized load testing only.",
      "Smoke, stress, spike, and soak profiles publish Prometheus, InfluxDB, Grafana, Datadog, JUnit, and cloud dashboard reports.",
      "The k6-operator Kubernetes TestRun path is documented for distributed workers.",
      "locust-plugins, tcp socket, and custom client coverage are documented for non-HTTP load testing."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "reports", "locust_stats.csv"), "Name,Requests\nGET /health,1\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "artillery.json"), "{\"aggregate\":{\"counters\":{}}}\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "k6-summary.json"), "{\"metrics\":{}}\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "load-junit.xml"), "<testsuite></testsuite>\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "load-testing-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      loadTestSetups: Array<{ filePath: string; tool: string; configCount: number; scriptCount: number; scenarioCount: number; loadProfileCount: number; thresholdCount: number; protocolCount: number; dataCount: number; reportCount: number; distributedCount: number; ciCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      profileSignals: Array<{ signal: string; readiness: string }>;
      protocolSignals: Array<{ signal: string; readiness: string }>;
      assertionSignals: Array<{ signal: string; readiness: string }>;
      dataSignals: Array<{ signal: string; readiness: string }>;
      executionSignals: Array<{ signal: string; readiness: string }>;
      reportSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("k6 Artillery Locust load testing scenarios phases thresholds checks ensure HttpUser headless distributed reports");
    expect(report.loadTestSetups.length).toBeGreaterThan(0);
    expect(report.loadTestSetups.some((item) => item.tool === "k6" && item.configCount > 0 && item.loadProfileCount > 0 && item.thresholdCount > 0 && item.reportCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.tool === "artillery" && item.scenarioCount > 0 && item.protocolCount > 0 && item.dataCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.tool === "locust" && item.scriptCount > 0 && item.loadProfileCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.distributedCount > 0)).toBe(true);
    expect(report.loadTestSetups.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["k6", "artillery", "locust", "autocannon"]));
    expect(readySignals(report.profileSignals)).toEqual(expect.arrayContaining(["vus", "duration", "stages", "scenarios", "arrival-rate", "ramping", "spawn-rate", "users", "wait-time", "load-shape", "soak", "stress", "spike", "smoke"]));
    expect(readySignals(report.protocolSignals)).toEqual(expect.arrayContaining(["http", "websocket", "grpc", "graphql", "browser", "playwright", "tcp", "custom-client"]));
    expect(readySignals(report.assertionSignals)).toEqual(expect.arrayContaining(["thresholds", "checks", "ensure", "expect-plugin", "apdex", "slo", "abort-on-fail", "percentiles", "status-check"]));
    expect(readySignals(report.dataSignals)).toEqual(expect.arrayContaining(["setup-teardown", "shared-array", "csv-data", "env-vars", "processor", "custom-metrics", "tags", "parameterization"]));
    expect(readySignals(report.executionSignals)).toEqual(expect.arrayContaining(["headless", "cloud", "distributed-master-worker", "k6-operator", "docker", "ci-workflow", "artifact-upload", "parallel-workers"]));
    expect(readySignals(report.reportSignals)).toEqual(expect.arrayContaining(["summary", "handleSummary", "json", "html", "csv", "prometheus", "influxdb", "grafana", "datadog", "cloud-dashboard", "junit"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["k6", "artillery", "@artilleryio/*", "artillery-engine-playwright", "locust", "locust-plugins", "autocannon"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "k6 run --summary-export reports/k6-summary.json performance/load-test.js",
      "artillery run load-test.yml --output reports/artillery.json && artillery report reports/artillery.json",
      "locust -f locustfile.py --headless -u 50 -r 5 --run-time 5m --html reports/locust.html --csv reports/locust"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "load-testing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "load-testing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "load-testing-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects benchmark readiness without running benchmark toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-benchmark-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-benchmark-source-"));
    await fs.mkdir(path.join(sourceRoot, "benchmarks"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "benches"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "benchmark-study",
      version: "1.0.0",
      scripts: {
        "bench:vitest": "vitest bench --run --reporter=json --outputFile=reports/vitest-bench.json",
        "bench:tiny": "node benchmarks/tinybench.mjs",
        "bench:benchmarkjs": "node benchmarks/benchmarkjs.cjs",
        "bench:hyperfine": "hyperfine --warmup 3 --runs 10 --min-runs 5 --export-json reports/hyperfine.json --export-markdown reports/hyperfine.md --export-csv reports/hyperfine.csv -L runtime node,bun 'npm run test:{runtime}'",
        "bench:cargo": "cargo bench",
        "bench:pytest": "pytest --benchmark-json reports/pytest-benchmark.json",
        "bench:go": "go test -bench=. -benchmem ./...",
        "bench:bencher": "bencher run --project repotutor --branch main --threshold-measure latency --threshold-test t_test npm run bench:hyperfine"
      },
      devDependencies: {
        tinybench: "latest",
        benchmark: "latest",
        vitest: "latest",
        "@types/benchmark": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "benchmarks", "tinybench.mjs"), [
      "import { Bench, hrtimeNow } from 'tinybench';",
      "const bench = new Bench({ name: 'parser benchmark', time: 100, iterations: 64, warmup: true, warmupTime: 50, warmupIterations: 8, retainSamples: true, concurrency: 2, timestampProvider: 'performanceNow' });",
      "bench.addEventListener('cycle', () => {});",
      "bench.add('baseline parse', async () => JSON.parse('{\"a\":1}'), { async: true });",
      "bench.add('candidate parse', () => JSON.parse('{\"a\":1}'));",
      "if (global.gc) global.gc();",
      "await bench.run();",
      "const table = bench.table();",
      "const compare = bench.tasks.map((task) => task.result?.throughput.mean);",
      "console.table(table);",
      "await fs.promises.writeFile('reports/tinybench.json', JSON.stringify({ table, compare, hrtimeNow }));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "benchmarks", "benchmarkjs.cjs"), [
      "const Benchmark = require('benchmark');",
      "const suite = new Benchmark.Suite();",
      "suite.add('RegExp#test baseline', function () { /o/.test('Hello World'); }, { setup: function () { var input = 'Hello World'; }, teardown: function () {} });",
      "suite.add('String#indexOf candidate', { defer: true, fn: function (deferred) { Promise.resolve('Hello World'.indexOf('o')).then(() => deferred.resolve()); } });",
      "suite.on('cycle', function (event) { console.log(String(event.target)); });",
      "suite.on('complete', function () { console.log('Fastest is ' + this.filter('fastest').map('name')); console.log('Slowest is ' + this.filter('slowest').map('name')); });",
      "suite.run({ async: true });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "benchmarks", "parser.bench.ts"), [
      "import { test } from 'vitest';",
      "test('parser benchmark', async ({ bench }) => {",
      "  await bench('parse baseline', () => JSON.parse('{\"a\":1}')).run();",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "benchmarks", "hyperfine.sh"), [
      "#!/usr/bin/env bash",
      "hyperfine --warmup 3 --runs 10 --min-runs 5 --max-runs 20 --prepare 'sync; echo 3 | sudo tee /proc/sys/vm/drop_caches' --cleanup 'rm -rf tmp-bench' --parameter-scan threads 1 8 'npm test -- --threads {threads}' --export-json reports/hyperfine.json --export-markdown reports/hyperfine.md --export-csv reports/hyperfine.csv",
      "hyperfine --parameter-list runtime node,bun 'npm run test:{runtime}'"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Cargo.toml"), [
      "[dev-dependencies]",
      "criterion = \"0.5\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "benches", "criterion.rs"), [
      "use criterion::{criterion_group, criterion_main, Criterion};",
      "fn parser_benchmark(c: &mut Criterion) {",
      "    let mut group = c.benchmark_group(\"parser\");",
      "    group.sample_size(100);",
      "    group.warm_up_time(std::time::Duration::from_millis(50));",
      "    group.measurement_time(std::time::Duration::from_millis(100));",
      "    group.bench_function(\"baseline\", |b| b.iter(|| 1 + 1));",
      "    group.finish();",
      "}",
      "criterion_group!(benches, parser_benchmark);",
      "criterion_main!(benches);"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = [\"pytest-benchmark\"]",
      "",
      "[tool.pytest.ini_options]",
      "addopts = \"--benchmark-min-rounds=5 --benchmark-json=reports/pytest-benchmark.json\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "benchmarks", "test_benchmark.py"), [
      "import pytest",
      "@pytest.mark.benchmark(group='parser')",
      "def test_parser_benchmark(benchmark):",
      "    benchmark(lambda: {'a': 1})"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "go.mod"), "module example.com/bench\n\ngo 1.22\n");
    await fs.writeFile(path.join(sourceRoot, "parser_bench_test.go"), [
      "package bench",
      "import \"testing\"",
      "func BenchmarkParser(b *testing.B) {",
      "    b.ReportAllocs()",
      "    for i := 0; i < b.N; i++ { _ = i + 1 }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "benchmarks.yml"), [
      "name: benchmarks",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: '0 3 * * 1'",
      "jobs:",
      "  bench:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run bench:vitest",
      "      - run: node benchmarks/benchmarkjs.cjs",
      "      - run: hyperfine --warmup 3 --runs 10 --export-json reports/hyperfine.json --export-markdown reports/hyperfine.md --export-csv reports/hyperfine.csv 'npm test'",
      "      - run: cargo bench",
      "      - run: pytest --benchmark-json reports/pytest-benchmark.json",
      "      - run: go test -bench=. -benchmem ./...",
      "      - run: bencher run --project repotutor --branch ${{ github.ref_name }} --threshold-measure latency --threshold-test t_test npm run bench:hyperfine",
      "      - run: echo 'relative times regression threshold trend history compare main standard deviation margin of error percentile confidence JUnit html report' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: benchmark-artifacts",
      "          path: |",
      "            reports/*.json",
      "            reports/*.md",
      "            reports/*.csv",
      "            reports/*.html",
      "            reports/benchmark-junit.xml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Benchmark Study",
      "Vitest bench, Tinybench, Benchmark.js, Hyperfine, Criterion, pytest-benchmark, and Go benchmark workflows compare baseline and candidate implementations.",
      "Reports include ops/sec, mean, stddev, standard deviation, margin of error, rme, moe, percentile, confidence, relative times, regression threshold, trend history, and compare main notes.",
      "Bencher stores trend-history and pull request benchmark regression evidence."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "reports", "hyperfine.json"), "{\"results\":[]}\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "hyperfine.md"), "| Command | Mean |\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "hyperfine.csv"), "command,mean\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "criterion.html"), "<html></html>\n");
    await fs.writeFile(path.join(sourceRoot, "reports", "benchmark-junit.xml"), "<testsuite></testsuite>\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "benchmark-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      benchmarkSuites: Array<{ filePath: string; tool: string; configCount: number; taskCount: number; warmupCount: number; iterationCount: number; parameterCount: number; hookCount: number; asyncCount: number; baselineCount: number; reportCount: number; ciCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      timingSignals: Array<{ signal: string; readiness: string }>;
      comparisonSignals: Array<{ signal: string; readiness: string }>;
      reportSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Vitest bench Tinybench Benchmark.js Hyperfine Criterion pytest-benchmark Go benchmark warmup iterations samples ops/sec export-json regression threshold");
    expect(report.benchmarkSuites.length).toBeGreaterThan(0);
    expect(report.benchmarkSuites.some((item) => item.tool === "tinybench" && item.taskCount > 0 && item.warmupCount > 0 && item.reportCount > 0)).toBe(true);
    expect(report.benchmarkSuites.some((item) => item.tool === "benchmark-js" && item.taskCount > 0 && item.asyncCount > 0 && item.baselineCount > 0)).toBe(true);
    expect(report.benchmarkSuites.some((item) => item.tool === "hyperfine" && item.parameterCount > 0 && item.hookCount > 0 && item.reportCount > 0)).toBe(true);
    expect(report.benchmarkSuites.some((item) => item.tool === "criterion" && item.warmupCount > 0 && item.iterationCount > 0)).toBe(true);
    expect(report.benchmarkSuites.some((item) => item.tool === "go-bench" && item.taskCount > 0)).toBe(true);
    expect(report.benchmarkSuites.some((item) => item.ciCount > 0)).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["vitest-bench", "tinybench", "benchmark-js", "hyperfine", "criterion", "pytest-benchmark", "go-bench"]));
    expect(readySignals(report.timingSignals)).toEqual(expect.arrayContaining(["hrtime", "performance-now", "warmup", "iterations", "runs", "min-runs", "time-window", "samples", "concurrency", "async", "gc-control"]));
    expect(readySignals(report.comparisonSignals)).toEqual(expect.arrayContaining(["suite", "tasks", "baseline", "compare", "fastest-slowest", "parameter-scan", "parameter-list", "relative-times", "regression-threshold", "statistical-significance"]));
    expect(readySignals(report.reportSignals)).toEqual(expect.arrayContaining(["console-table", "json", "markdown", "csv", "html", "junit", "bencher", "github-step-summary", "artifact-upload", "trend-history"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "scheduled", "pull-request", "hyperfine-command", "vitest-bench-command", "cargo-bench-command", "pytest-benchmark-command", "go-test-bench-command", "benchmarkjs-command"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["tinybench", "benchmark", "hyperfine", "criterion", "pytest-benchmark", "bencher", "vitest"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx vitest bench --run",
      "hyperfine --warmup 3 --runs 10 --export-json reports/hyperfine.json 'npm test'",
      "go test -bench=. -benchmem ./..."
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "benchmark-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "benchmark-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "benchmark-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Playwright E2E signals without running browsers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-e2e-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-e2e-source-"));
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:e2e": "playwright test --project=chromium --reporter=list,junit,html --workers=2 --shard=1/2",
        "test:e2e:ui": "playwright test --ui",
        "test:e2e:codegen": "playwright codegen http://localhost:4173",
        "test:e2e:debug": "PWDEBUG=1 playwright test --debug"
      },
      devDependencies: {
        "@playwright/test": "^1.60.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "playwright.config.ts"), [
      "import { defineConfig, devices } from '@playwright/test';",
      "export default defineConfig({",
      "  timeout: 30000,",
      "  retries: process.env.CI ? 2 : 0,",
      "  workers: process.env.CI ? 2 : undefined,",
      "  fullyParallel: true,",
      "  reporter: [['html'], ['junit', { outputFile: 'reports/junit.xml' }], ['json', { outputFile: 'reports/results.json' }]],",
      "  use: { baseURL: 'http://127.0.0.1:4173', trace: 'on-first-retry', screenshot: 'only-on-failure', video: 'retain-on-failure', storageState: 'playwright/.auth/user.json' },",
      "  webServer: { command: 'pnpm preview', url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI },",
      "  projects: [",
      "    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },",
      "    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },",
      "    { name: 'webkit', use: { ...devices['Desktop Safari'] } },",
      "    { name: 'mobile', use: { ...devices['iPhone 15'] } }",
      "  ]",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "auth.setup.ts"), [
      "import { test } from '@playwright/test';",
      "test('login', async ({ page }) => {",
      "  await page.goto('/login');",
      "  await page.context().storageState({ path: 'playwright/.auth/user.json' });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "checkout.spec.ts"), [
      "import { test, expect, type APIRequestContext } from '@playwright/test';",
      "test.describe.configure({ mode: 'parallel' });",
      "test.describe('checkout flow', () => {",
      "  test.use({ storageState: 'playwright/.auth/user.json' });",
      "  test('happy path', async ({ page, request }) => {",
      "    const api: APIRequestContext = request;",
      "    await test.step('open checkout', async () => {",
      "      await page.goto('/checkout');",
      "      await page.getByRole('button', { name: 'Checkout' }).click();",
      "      await page.getByTestId('order-id').click();",
      "    });",
      "    await expect(page).toHaveURL(/checkout/);",
      "    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();",
      "    await expect.poll(async () => (await page.request.get('/health')).status(), { timeout: 10000 }).toBe(200);",
      "    await expect(async () => {",
      "      const response = await api.get('/api/orders');",
      "      expect(response.status()).toBe(200);",
      "    }).toPass({ timeout: 10000 });",
      "    await expect(page).toHaveScreenshot('checkout.png');",
      "  });",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "e2e.yml"), [
      "name: e2e",
      "on: [pull_request]",
      "jobs:",
      "  e2e:",
      "    strategy:",
      "      matrix:",
      "        shard: [1, 2]",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npx playwright test --shard=${{ matrix.shard }}/2 --trace=on-first-retry",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: playwright-report",
      "          path: |",
      "            playwright-report",
      "            test-results",
      "            trace.zip"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# E2E Study",
      "Developers can run npx playwright test --ui, npx playwright codegen http://localhost:4173, or PWDEBUG=1 npx playwright test --debug.",
      "The HTML reporter, Trace Viewer, screenshots, videos, and APIRequestContext evidence are inspected statically."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "e2e-report.json"), "utf8")) as {
      sourcePattern: string;
      browserProjects: Array<{ browser: string; readiness: string }>;
      locatorSignals: Array<{ locatorType: string; readiness: string }>;
      artifacts: Array<{ artifact: string; readiness: string }>;
      runtimeTargets: Array<{ target: string; readiness: string }>;
      playwrightSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Playwright browser E2E tests defineConfig fixtures projects devices locators assertions poll toPass traces screenshots video reporters CI webServer storageState APIRequestContext");
    expect(report.browserProjects.filter((item) => item.readiness === "ready").map((item) => item.browser)).toEqual(expect.arrayContaining(["chromium", "firefox", "webkit", "mobile", "api"]));
    expect(report.locatorSignals.map((item) => item.locatorType)).toEqual(expect.arrayContaining(["role", "testid"]));
    expect(report.artifacts.filter((item) => item.readiness === "ready").map((item) => item.artifact)).toEqual(expect.arrayContaining(["trace", "screenshot", "video", "html-report", "junit", "json"]));
    expect(report.runtimeTargets.filter((item) => item.readiness === "ready").map((item) => item.target)).toEqual(expect.arrayContaining(["web-server", "base-url", "parallel-workers", "retries", "ci-artifacts", "storage-state"]));
    expect(readySignals(report.playwrightSignals)).toEqual(expect.arrayContaining([
      "define-config",
      "test-fixtures",
      "test-describe",
      "test-step",
      "test-use",
      "projects",
      "devices",
      "web-server",
      "storage-state",
      "api-request",
      "role-locator",
      "testid-locator",
      "expect-poll",
      "expect-to-pass",
      "trace",
      "screenshot",
      "video",
      "reporter",
      "retries",
      "workers",
      "timeout",
      "fully-parallel",
      "shard",
      "ui-mode",
      "codegen",
      "debug-mode"
    ]));
    const e2eMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "e2e.md"), "utf8");
    expect(e2eMarkdown).toContain("## Playwright Signals");
    expect(e2eMarkdown).toContain("expect-poll [ready]");
    const e2eHtml = await fs.readFile(path.join(result.session.outputPaths.html, "e2e.html"), "utf8");
    expect(e2eHtml).toContain("Playwright Signals");
    expect(e2eHtml).toContain("expect-to-pass");
  });

  it("detects flaky test readiness without running test toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-flaky-test-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-flaky-test-source-"));
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:pw": "playwright test --retries=2 --trace=on-first-retry --repeat-each=2 --workers=1",
        "test:jest": "jest --runInBand --detectOpenHandles --testTimeout=10000",
        "test:pytest": "pytest --reruns 3 --reruns-delay 2 --fail-on-flaky -r aR --only-rerun AssertionError --rerun-except OSError"
      },
      devDependencies: {
        "@playwright/test": "^1.0.0",
        "jest": "^30.0.0",
        "jest-junit": "^16.0.0",
        "vitest": "^3.0.0",
        "cypress": "^14.0.0",
        "mocha": "^11.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "playwright.config.ts"), [
      "import { defineConfig } from '@playwright/test';",
      "export default defineConfig({",
      "  retries: process.env.CI ? 2 : 0,",
      "  failOnFlakyTests: true,",
      "  reporter: [['html'], ['junit', { outputFile: 'test-results/junit.xml' }], ['blob']],",
      "  trace: 'on-first-retry',",
      "  screenshot: 'only-on-failure',",
      "  video: 'on-first-retry',",
      "  workers: 1,",
      "  fullyParallel: false,",
      "  timeout: 30000,",
      "  globalTimeout: 600000,",
      "  use: { storageState: 'state.json' },",
      "  projects: [{ name: 'chromium' }]",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "flaky.spec.ts"), [
      "import { test, expect } from '@playwright/test';",
      "test.describe.configure({ mode: 'serial', retries: 2 });",
      "test.fixme(true, 'flaky issue #123 owner: qa-team quarantine');",
      "test('retry aware', async ({ page }, testInfo) => {",
      "  if (testInfo.retry) await testInfo.attach('retry-log', { body: 'retry trace.zip test-results/junit.xml' });",
      "  expect(testInfo.retry).toBeGreaterThanOrEqual(0);",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "jest.config.js"), [
      "module.exports = {",
      "  bail: 1,",
      "  testTimeout: 10000,",
      "  slowTestThreshold: 5,",
      "  detectOpenHandles: true,",
      "  randomize: true,",
      "  seed: 123,",
      "  reporters: ['default', 'jest-junit']",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "flaky.test.js"), [
      "jest.retryTimes(3, { logErrorsBeforeRetry: true, waitBeforeRetry: 100, retryImmediately: true });",
      "it.skip('quarantined flaky BUG-123 owner: qa-team', () => {});",
      "test('retry artifact', () => { expect('junit test-results').toContain('junit'); });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = ['pytest-rerunfailures', 'flaky']",
      "[tool.pytest.ini_options]",
      "addopts = '--reruns 3 --reruns-delay 2 --fail-on-flaky -r aR --only-rerun AssertionError --rerun-except OSError'",
      "markers = ['flaky: flaky rerun quarantine marker']"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "test_flaky.py"), [
      "import pytest",
      "import sys",
      "@pytest.mark.flaky(reruns=2, reruns_delay=1, only_rerun=['AssertionError'], condition=sys.platform.startswith('linux'))",
      "@pytest.mark.xfail(reason='BUG-123 owner: qa-team quarantine test-results/junit.xml')",
      "def test_py_flaky():",
      "    assert True"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "flaky-tests.yml"), [
      "name: flaky tests",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: '0 5 * * *'",
      "  workflow_dispatch:",
      "jobs:",
      "  flaky:",
      "    strategy:",
      "      matrix:",
      "        shard: [1, 2]",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npx playwright test --shard=${{ matrix.shard }}/2 --retries=2 --trace=on-first-retry",
      "      - run: pytest --reruns 3 --reruns-delay 2 --fail-on-flaky -r aR",
      "      - run: echo 'flaky dashboard rerun job retry job' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: retry-trace-upload",
      "          path: |",
      "            playwright-report",
      "            test-results",
      "            blob-report",
      "            trace.zip"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Flaky Test Study",
      "Quarantine-list and flaky-tests.txt isolate owner: qa-team issue #123 while grep-invert @flaky keeps noisy tests out of blocking jobs.",
      "Random seed order randomization is tracked before release gates."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "flaky-tests.txt"), "tests/flaky.spec.ts # owner: qa-team issue #123 quarantine grep-invert @flaky\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "flaky-test-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      flakyTestSetups: Array<{ filePath: string; framework: string; retryCount: number; rerunCount: number; quarantineCount: number; failOnFlakyCount: number; artifactCount: number; readiness: string }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      retrySignals: Array<{ signal: string; readiness: string }>;
      quarantineSignals: Array<{ signal: string; readiness: string }>;
      isolationSignals: Array<{ signal: string; readiness: string }>;
      artifactSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    expect(report.sourcePattern).toBe("Flaky test readiness Playwright retries failOnFlakyTests trace on-first-retry pytest-rerunfailures --reruns --fail-on-flaky jest.retryTimes quarantine skip fixme xfail artifacts");
    expect(report.flakyTestSetups.some((item) => item.framework === "playwright" && item.retryCount > 0 && item.quarantineCount > 0 && item.artifactCount > 0)).toBe(true);
    expect(report.flakyTestSetups.some((item) => item.framework === "pytest" && item.rerunCount > 0 && item.quarantineCount > 0)).toBe(true);
    expect(report.flakyTestSetups.some((item) => item.framework === "jest" && item.retryCount > 0 && item.quarantineCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["playwright", "pytest-rerunfailures", "jest", "vitest", "cypress", "mocha"]));
    expect(readySignals(report.retrySignals)).toEqual(expect.arrayContaining(["retries", "reruns", "retry-times", "retry-immediately", "wait-before-retry", "reruns-delay", "repeat-each", "only-rerun", "rerun-except", "fail-on-flaky"]));
    expect(readySignals(report.quarantineSignals)).toEqual(expect.arrayContaining(["flaky-marker", "skip-fixme", "xfail", "quarantine-tag", "grep-invert", "test-list", "issue-link", "owner"]));
    expect(readySignals(report.isolationSignals)).toEqual(expect.arrayContaining(["workers-one", "run-in-band", "fully-parallel-control", "serial-mode", "test-timeout", "global-timeout", "detect-open-handles", "storage-state", "random-seed", "order-randomization"]));
    expect(readySignals(report.artifactSignals)).toEqual(expect.arrayContaining(["trace-on-first-retry", "screenshot-on-failure", "video-on-retry", "html-report", "junit-report", "blob-report", "retry-trace-upload", "test-results", "step-summary"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "pull-request", "scheduled", "shard", "matrix", "upload-artifact", "flaky-dashboard", "rerun-job"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@playwright/test", "pytest-rerunfailures", "jest", "vitest", "cypress", "mocha", "flaky"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx playwright test --retries=2 --trace=on-first-retry",
      "pytest --reruns 3 --reruns-delay 2 --fail-on-flaky -r aR",
      "npx jest --runInBand --detectOpenHandles"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "flaky-test-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "flaky-test-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "flaky-test-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects test impact readiness without running test toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-test-impact-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-test-impact-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tools"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:affected": "nx affected -t test --base=origin/main --head=HEAD --parallel=3",
        "test:related": "jest --findRelatedTests $(git diff --name-only origin/main...HEAD) --listTests",
        "test:changed": "jest --onlyChanged --changedSince=origin/main --lastCommit",
        "test:testmon": "pytest --testmon --testmon-forceselect",
        "test:turbo": "turbo run test --filter=...[origin/main]"
      },
      devDependencies: {
        "@nx/js": "^21.0.0",
        "jest": "^30.0.0",
        "nx": "^21.0.0",
        "pytest-testmon": "^2.1.0",
        "turbo": "^2.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "nx.json"), JSON.stringify({
      defaultBase: "origin/main",
      targetDefaults: {
        test: {
          inputs: ["default", "^default"],
          outputs: ["coverage/{projectRoot}"],
          cache: true
        }
      },
      namedInputs: {
        default: ["{projectRoot}/**/*"],
        production: ["default", "!{projectRoot}/**/*.spec.ts"]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "jest.config.js"), [
      "module.exports = {",
      "  changedSince: 'origin/main',",
      "  watchman: true,",
      "  watchPlugins: ['jest-watch-typeahead/filename'],",
      "  // findRelatedTests, onlyChanged, jest-haste-map, jest-changed-files reverse dependency graph",
      "  testMatch: ['**/*.test.ts']",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = ['pytest', 'pytest-testmon', 'coverage']",
      "[tool.pytest.ini_options]",
      "addopts = '--testmon --testmon-forceselect'",
      "testmon_ignore_dependencies = ['node_modules/*']"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "test-impact.yml"), [
      "name: test impact",
      "on:",
      "  pull_request:",
      "jobs:",
      "  affected:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      NX_BASE: ${{ github.event.pull_request.base.sha || 'origin/main' }}",
      "      NX_HEAD: ${{ github.sha }}",
      "    strategy:",
      "      matrix:",
      "        shard: [1, 2]",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: git diff --name-only \"$NX_BASE...$NX_HEAD\" > changed-files.txt",
      "      - run: npx nx affected -t test --base=$NX_BASE --head=$NX_HEAD --parallel=3",
      "      - run: npx jest --findRelatedTests $(cat changed-files.txt) --listTests --shard=${{ matrix.shard }}/2",
      "      - run: pytest --testmon",
      "      - run: npx turbo run test --filter=...[$NX_BASE]",
      "      - run: echo 'affected-only test splitting test-impact-report.json' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: test-impact-report",
      "          path: |",
      "            changed-files.txt",
      "            affected-tests.json",
      "            test-impact-report.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Test Impact Study",
      "Affected-only testing uses a project graph and dependency graph to select only run related tests.",
      "Nx remote cache, task cache, and cache what did not change are documented before CI adoption.",
      "Jest watch mode with Watchman and getChangedFilesForRoots maps changed files and repos into a reverse dependency graph.",
      "pytest-testmon uses .testmondata, coverage dependency graph, coverage.py data, changed files, and selected tests.",
      "Fallback policy: if no affected projects are found, run all tests with watchAll or run-many --all."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "testmon.md"), [
      "# pytest-testmon",
      "pytest-testmon runs pytest --testmon and selects tests affected by changed files.",
      "It stores .testmondata and a coverage dependency graph from coverage.py data.",
      "Use --testmon-forceselect for force selection and --testmon-noselect for fallback noselect runs."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tools", "test-impact.sh"), [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "git diff --name-only origin/main...HEAD > changed-files.txt",
      "npx jest --findRelatedTests $(cat changed-files.txt) --listTests",
      "npx nx show projects --affected --base=origin/main --head=HEAD --uncommitted --untracked --files=libs/mylib/src/index.ts",
      "npx nx affected -t test --files=libs/mylib/src/index.ts",
      "pytest --testmon --testmon-noselect"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "test-impact-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      impactSetups: Array<{ filePath: string; tool: string; affectedCommandCount: number; changedFileInputCount: number; baseHeadCount: number; graphCount: number; cacheCount: number; readiness: string }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      changeDetectionSignals: Array<{ signal: string; readiness: string }>;
      selectionSignals: Array<{ signal: string; readiness: string }>;
      cacheSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Test impact readiness Nx affected Jest findRelatedTests onlyChanged changedSince pytest-testmon --testmon dependency graph base head changed files CI cache");
    expect(report.impactSetups.some((item) => item.tool === "nx" && item.readiness === "ready" && item.affectedCommandCount > 0 && item.baseHeadCount > 0)).toBe(true);
    expect(report.impactSetups.some((item) => item.tool === "nx" && item.cacheCount > 0)).toBe(true);
    expect(report.impactSetups.some((item) => item.tool === "jest" && item.affectedCommandCount > 0 && item.changedFileInputCount > 0)).toBe(true);
    expect(report.impactSetups.some((item) => item.tool === "pytest-testmon" && item.affectedCommandCount > 0 && item.graphCount > 0)).toBe(true);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["nx", "jest", "pytest-testmon", "turbo", "custom"]));
    expect(readySignals(report.changeDetectionSignals)).toEqual(expect.arrayContaining(["base-head", "changed-since", "changed-files", "git-diff", "uncommitted", "untracked", "last-commit", "files-input"]));
    expect(readySignals(report.selectionSignals)).toEqual(expect.arrayContaining(["affected-projects", "find-related-tests", "only-changed", "testmon-select", "testmon-forceselect", "related-tests-list", "dependency-graph", "project-graph", "test-splitting"]));
    expect(readySignals(report.cacheSignals)).toEqual(expect.arrayContaining(["nx-cache", "remote-cache", "task-cache", "testmon-data", "coverage-deps", "jest-haste-map", "watchman"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "pull-request", "base-head-env", "matrix", "shard", "affected-only", "upload-artifact"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["nx", "jest", "pytest-testmon", "turbo"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx nx affected -t test --base=origin/main --head=HEAD",
      "npx jest --findRelatedTests $(git diff --name-only origin/main...HEAD)",
      "pytest --testmon"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "test-impact-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "test-impact-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "test-impact-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects test reporting readiness without running test toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-test-reporting-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-test-reporting-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "reports"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "test-results"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "allure-results"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:jest": "jest --ci --reporters=default --reporters=jest-junit",
        "test:pytest": "pytest --junitxml=reports/pytest.xml",
        "test:playwright": "playwright test --reporter=list,junit,html,json",
        "test:vitest": "vitest run --reporter=default --reporter=junit --outputFile.junit=reports/vitest-junit.xml",
        "report:allure": "allure generate ./allure-results -o ./allure-report && allure open ./allure-report",
        "report:ctrf": "node -e \"console.log('ctrf-report.json results.summary.tests results.tests duration start stop')\""
      },
      devDependencies: {
        "@playwright/test": "^1.54.0",
        "allure": "^3.0.0",
        "allure-js-commons": "^3.0.0",
        "allure-jest": "^3.0.0",
        "allure-playwright": "^3.0.0",
        "ctrf": "^0.0.0",
        "jest": "^30.0.0",
        "jest-junit": "^16.0.0",
        "junit-report-builder": "^5.0.0",
        "vitest": "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "jest.config.js"), [
      "module.exports = {",
      "  reporters: [",
      "    'default',",
      "    ['jest-junit', { outputDirectory: 'reports/junit', outputName: 'jest-junit.xml' }],",
      "    ['allure-jest', { resultsDir: 'allure-results' }]",
      "  ]",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "vitest.config.ts"), [
      "import { defineConfig } from 'vitest/config';",
      "export default defineConfig({",
      "  test: {",
      "    reporters: ['default', 'junit'],",
      "    outputFile: { junit: 'reports/vitest-junit.xml' }",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "playwright.config.ts"), [
      "import { defineConfig } from '@playwright/test';",
      "export default defineConfig({",
      "  reporter: [",
      "    ['list'],",
      "    ['junit', { outputFile: 'reports/playwright-junit.xml' }],",
      "    ['html', { outputFolder: 'playwright-report' }],",
      "    ['json', { outputFile: 'reports/playwright.json' }],",
      "    ['allure-playwright', { resultsDir: 'allure-results' }]",
      "  ]",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = ['pytest', 'allure-pytest']",
      "[tool.pytest.ini_options]",
      "addopts = '--junitxml=reports/pytest.xml --alluredir=allure-results'",
      "junit_family = 'xunit2'"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "allurerc.mjs"), [
      "export default {",
      "  output: './allure-report',",
      "  resultsDir: './allure-results',",
      "  categories: [{ name: 'flaky analysis', matchedStatuses: ['broken'] }],",
      "  environmentInfo: { appName: 'RepoTutor fixture', buildName: 'test-reporting' },",
      "  executor: { name: 'GitHub Actions', buildUrl: 'https://example.test/build', reportUrl: 'https://example.test/report', jobName: 'reports' }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "jest-reporting.yml"), [
      "name: jest reporting",
      "on:",
      "  pull_request:",
      "permissions:",
      "  checks: write",
      "  contents: read",
      "jobs:",
      "  junit:",
      "    if: ${{ !cancelled() }}",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run test:jest",
      "      - run: echo '### JUnit test report summary' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: junit-reports",
      "          path: reports/**/*.xml",
      "      - uses: dorny/test-reporter@v3",
      "        with:",
      "          name: JUnit Tests",
      "          path: reports/**/*.xml",
      "          reporter: jest-junit",
      "          max-annotations: 10",
      "          fail-on-error: true",
      "          fail-on-empty: true",
      "          summary_file: reports/test-summary.md"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "test-reporting.yml"), [
      "name: test reporting",
      "on:",
      "  pull_request:",
      "  workflow_run:",
      "    workflows: ['tests']",
      "    types: [completed]",
      "permissions:",
      "  checks: write",
      "  contents: read",
      "jobs:",
      "  reports:",
      "    if: ${{ !cancelled() }}",
      "    strategy:",
      "      matrix:",
      "        shard: [1, 2]",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npm run test:jest",
      "      - run: pytest --junitxml=reports/pytest.xml",
      "      - run: npx playwright test --reporter=list,junit,html,json",
      "      - run: npx allure generate ./allure-results -o ./allure-report",
      "      - run: echo '### Test report summary threshold pass rate duration owner labels' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: test-report-artifacts",
      "          path: |",
      "            reports/**/*.xml",
      "            reports/**/*.json",
      "            test-results/**/*.json",
      "            allure-results",
      "            allure-report",
      "            ctrf-report.json",
      "      - uses: actions/download-artifact@v4",
      "      - uses: dorny/test-reporter@v3",
      "        with:",
      "          name: JUnit Tests",
      "          path: reports/**/*.xml",
      "          reporter: python-xunit",
      "          max-annotations: 10",
      "          fail-on-error: true",
      "          fail-on-empty: true",
      "          summary: true",
      "          summary_file: reports/test-summary.md",
      "      - uses: ctrf-io/github-test-reporter@v1",
      "        with:",
      "          report-path: ctrf-report.json",
      "      - uses: EnricoMi/publish-unit-test-result-action@v2",
      "        with:",
      "          files: reports/**/*.xml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Test Reporting Study",
      "CTRF JSON stores results.summary.tests, results.tests, duration, start, and stop in ctrf-report.json.",
      "Allure history-aware reports use retries, flaky analysis, categories, environment metadata, executor metadata, attachments, screenshots, logs, traces, and API payloads.",
      "dorny/test-reporter can parse dotnet-trx, java-junit, jest-junit, mocha-json, and python-xunit for annotations and Check Run output.",
      "GitHub annotations, checks, job summary, artifact trend history, owner labels, duration thresholds, and Markdown summary files are required.",
      "Use publish-unit-test-result for pull request comments when checks are unavailable."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "test-reporting-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      reportSetups: Array<{ filePath: string; format: string; junitCount: number; ctrfCount: number; allureCount: number; outputCount: number; historyCount: number; readiness: string }>;
      formatSignals: Array<{ signal: string; readiness: string }>;
      adapterSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      qualitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Test reporting readiness CTRF JSON Allure results JUnit XML GitHub annotations checks summaries artifacts history");
    expect(report.reportSetups.some((item) => item.format === "junit" && item.readiness === "ready" && item.junitCount > 0 && item.outputCount > 0)).toBe(true);
    expect(report.reportSetups.some((item) => item.format === "allure" && item.allureCount > 0 && item.outputCount > 0 && item.historyCount > 0)).toBe(true);
    expect(report.reportSetups.some((item) => item.format === "ctrf" && item.ctrfCount > 0 && item.outputCount > 0)).toBe(true);
    expect(readySignals(report.formatSignals)).toEqual(expect.arrayContaining(["junit-xml", "ctrf-json", "allure-results", "allure-report", "trx", "xunit", "mocha-json", "json", "html", "markdown"]));
    expect(readySignals(report.adapterSignals)).toEqual(expect.arrayContaining(["jest-junit", "vitest-junit", "pytest-junitxml", "playwright-reporters", "allure-js", "allure-pytest", "ctrf-reporter", "dorny-test-reporter", "github-test-reporter", "publish-unit-test-result"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "workflow-run", "checks-write", "job-summary", "annotations", "upload-artifact", "download-artifact", "pull-request", "always-run", "matrix"]));
    expect(readySignals(report.outputSignals)).toEqual(expect.arrayContaining(["report-path", "glob-path", "results-dir", "output-file", "summary-file", "html-report", "history-trend", "attachments", "environment-metadata", "executor-metadata"]));
    expect(readySignals(report.qualitySignals)).toEqual(expect.arrayContaining(["fail-on-error", "fail-on-empty", "max-annotations", "threshold-summary", "rerun-history", "flaky-analysis", "categories", "owner-labels", "duration"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["jest-junit", "allure", "allure-js", "allure-pytest", "ctrf", "test-reporter", "publish-unit-test-result", "junit"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx jest --ci --reporters=default --reporters=jest-junit",
      "pytest --junitxml=reports/pytest.xml",
      "npx playwright test --reporter=list,junit,html",
      "npx allure generate ./allure-results -o ./allure-report"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "test-reporting-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "test-reporting-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "test-reporting-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects snapshot readiness without running test toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-snapshot-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-snapshot-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "__tests__", "__snapshots__"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "__tests__", "fixtures"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "e2e", "__snapshots__"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "__screenshots__"), { recursive: true });

    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "test:jest": "jest --ci",
        "test:jest:update": "jest --updateSnapshot",
        "test:vitest:update": "vitest run --update",
        "test:playwright": "playwright test --update-snapshots=none",
        "test:playwright:update": "playwright test --update-snapshots=changed",
        "test:playwright:update-missing": "playwright test --update-snapshots=missing",
        "test:playwright:update-all": "playwright test --update-snapshots=all"
      },
      devDependencies: {
        "@playwright/test": "^1.54.0",
        "@testing-library/react": "^16.0.0",
        "jest": "^30.0.0",
        "jest-snapshot": "^30.0.0",
        "pretty-format": "^30.0.0",
        "react-test-renderer": "^19.0.0",
        "vitest": "^3.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "jest.config.js"), [
      "module.exports = {",
      "  ci: true,",
      "  snapshotFormat: { escapeString: false, printBasicPrototype: false },",
      "  snapshotSerializers: ['<rootDir>/test/snapshot-serializer.js'],",
      "  snapshotResolver: '<rootDir>/test/snapshot-resolver.js'",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "vitest.config.ts"), [
      "import { defineConfig } from 'vitest/config';",
      "export default defineConfig({",
      "  test: {",
      "    snapshotFormat: { printBasicPrototype: false },",
      "    snapshotSerializers: ['./test/vitest-serializer.ts'],",
      "    update: false",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "playwright.config.ts"), [
      "import { defineConfig } from '@playwright/test';",
      "export default defineConfig({",
      "  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',",
      "  updateSnapshots: 'none',",
      "  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }, { name: 'firefox', use: { browserName: 'firefox' } }],",
      "  expect: {",
      "    toHaveScreenshot: { maxDiffPixels: 20, maxDiffPixelRatio: 0.01, threshold: 0.2, animations: 'disabled', caret: 'hide', scale: 'css', stylePath: './snapshot.css' },",
      "    toMatchSnapshot: { maxDiffPixels: 10, maxDiffPixelRatio: 0.01, threshold: 0.2 }",
      "  }",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "__tests__", "component.test.tsx"), [
      "import { toMatchSnapshot, toMatchInlineSnapshot } from 'jest-snapshot';",
      "expect.addSnapshotSerializer({ test: value => Boolean(value), print: value => String(value) });",
      "expect.extend({ toMatchTrimmedSnapshot(received) { return toMatchSnapshot.call(this, String(received).trim()); } });",
      "// Baselines are committed in __snapshots__; update locally with jest --updateSnapshot; CI uses jest --ci and fails on new snapshots.",
      "test('component snapshot', () => {",
      "  const user = { id: 'volatile-id', createdAt: Date.now(), name: 'Ada' };",
      "  expect(user).toMatchSnapshot({ id: expect.any(String), createdAt: expect.any(Number) });",
      "  expect('<button>Ada</button>').toMatchInlineSnapshot(`<button>Ada</button>`);",
      "  expect(() => { throw new Error('boom'); }).toThrowErrorMatchingInlineSnapshot(`boom`);",
      "  toMatchInlineSnapshot.call(expect('<p>Ada</p>'), '<p>Ada</p>');",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "__tests__", "file-snapshot.test.ts"), [
      "import { expect, test } from 'vitest';",
      "// toMatchFileSnapshot stores the baseline in fixtures/component.html and updates with vitest run --update.",
      "test('file snapshot', async () => {",
      "  await expect('<main>stable html</main>').toMatchFileSnapshot('./fixtures/component.html');",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "e2e", "home.spec.ts"), [
      "import { expect, test } from '@playwright/test';",
      "test('visual and aria snapshots', async ({ page }) => {",
      "  await page.goto('/');",
      "  await expect(page).toHaveScreenshot('home.png', {",
      "    mask: [page.locator('[data-dynamic]')],",
      "    maskColor: '#000000',",
      "    stylePath: './snapshot.css',",
      "    animations: 'disabled',",
      "    caret: 'hide',",
      "    scale: 'css',",
      "    maxDiffPixels: 20,",
      "    maxDiffPixelRatio: 0.01,",
      "    threshold: 0.2",
      "  });",
      "  await expect(page.locator('main')).toMatchAriaSnapshot();",
      "  expect(await page.textContent('main')).toMatchSnapshot('main.txt');",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "__tests__", "__snapshots__", "component.test.tsx.snap"), [
      "exports[`component snapshot 1`] = `",
      "<button>Ada</button>",
      "`;"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "__tests__", "fixtures", "component.html"), "<main>stable html</main>\n");
    await fs.writeFile(path.join(sourceRoot, "e2e", "__snapshots__", "home.aria.yml"), "- main:\n  - heading \"Welcome\"\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "snapshots.yml"), [
      "name: snapshots",
      "on:",
      "  pull_request:",
      "jobs:",
      "  snapshot:",
      "    runs-on: ${{ matrix.os }}",
      "    strategy:",
      "      matrix:",
      "        os: [ubuntu-latest, macos-latest]",
      "        browser: [chromium, firefox, webkit]",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: npx jest --ci",
      "      - run: npx vitest run",
      "      - run: npx playwright test --update-snapshots=none --project=${{ matrix.browser }}",
      "      - run: echo 'snapshot diff HTML report update snapshots forbidden' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: snapshot-artifact-${{ matrix.os }}-${{ matrix.browser }}",
      "          path: |",
      "            __snapshots__",
      "            __screenshots__",
      "            playwright-report",
      "            test-results"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "# Snapshot Study",
      "Jest inline snapshots can update with --updateSnapshot or the u key in watch mode.",
      "Jest CI mode should fail when a new snapshot appears and should not automatically write new snapshots.",
      "Playwright update-snapshots supports missing, changed, all, and none policies.",
      "Version controlled baseline snapshots are committed under __snapshots__, .snap files, __screenshots__, and ARIA YAML files.",
      "Visual snapshots need threshold, maxDiffPixels, maxDiffPixelRatio, mask, maskColor, stylePath, animations, caret, and scale controls.",
      "Snapshot review compares expected and actual output, uploads snapshot artifacts, and requires pull request approval."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "snapshot-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      snapshotSetups: Array<{ filePath: string; framework: string; textSnapshotCount: number; visualSnapshotCount: number; updatePolicyCount: number; baselineCount: number; readiness: string }>;
      assertionSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      updateSignals: Array<{ signal: string; readiness: string }>;
      serializerSignals: Array<{ signal: string; readiness: string }>;
      visualSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Snapshot testing readiness Jest Vitest Playwright toMatchSnapshot inline file visual ARIA snapshots update policy serializers baselines CI");
    expect(report.snapshotSetups.some((item) => item.framework === "jest" && item.readiness === "ready" && item.textSnapshotCount > 0 && item.updatePolicyCount > 0 && item.baselineCount > 0)).toBe(true);
    expect(report.snapshotSetups.some((item) => item.framework === "playwright" && item.visualSnapshotCount > 0 && item.updatePolicyCount > 0 && item.baselineCount > 0)).toBe(true);
    expect(readySignals(report.assertionSignals)).toEqual(expect.arrayContaining(["to-match-snapshot", "inline-snapshot", "file-snapshot", "throw-error-inline", "to-have-screenshot", "to-match-aria-snapshot", "property-matchers", "custom-matchers"]));
    expect(readySignals(report.storageSignals)).toEqual(expect.arrayContaining(["__snapshots__", "snap-files", "file-snapshot", "snapshot-path-template", "screenshot-baseline", "aria-yaml", "version-controlled-baseline"]));
    expect(readySignals(report.updateSignals)).toEqual(expect.arrayContaining(["update-snapshot", "update-snapshots", "watch-update", "ci-new-snapshot-fail", "missing-only", "changed-only", "all-update", "none-update"]));
    expect(readySignals(report.serializerSignals)).toEqual(expect.arrayContaining(["snapshot-serializers", "add-snapshot-serializer", "snapshot-format", "pretty-format", "custom-serializer"]));
    expect(readySignals(report.visualSignals)).toEqual(expect.arrayContaining(["to-have-screenshot", "max-diff-pixels", "max-diff-pixel-ratio", "threshold", "mask", "mask-color", "style-path", "animations", "caret", "scale"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "pull-request", "update-forbidden", "snapshot-artifact", "os-matrix", "browser-matrix", "snapshot-report"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["jest", "vitest", "playwright", "jest-snapshot", "pretty-format", "testing-library"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "npx jest --ci",
      "npx jest --updateSnapshot",
      "npx vitest run --update",
      "npx playwright test --update-snapshots=changed"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "snapshot-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "snapshot-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "snapshot-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects property-based testing readiness without running test toolchains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-property-based-testing-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-property-based-testing-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "tests"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "main", "test", "java", "demo"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "property-demo",
      version: "1.0.0",
      scripts: {
        "property": "vitest run --runInBand --numRuns=250",
        "property:jest": "jest --show-seed --runInBand",
        "property:hypothesis": "pytest -q --hypothesis-show-statistics",
        "property:jqwik": "mvn test -Djqwik.failures.runfirst=true"
      },
      devDependencies: {
        "fast-check": "^4.0.0",
        "@fast-check/jest": "^3.0.0",
        "vitest": "^4.0.0",
        "jest": "^30.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "dependencies = [\"hypothesis\", \"pytest\"]",
      "[tool.pytest.ini_options]",
      "addopts = \"--hypothesis-show-statistics\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pom.xml"), [
      "<project>",
      "  <dependencies>",
      "    <dependency><groupId>net.jqwik</groupId><artifactId>jqwik</artifactId><version>1.10.1</version><scope>test</scope></dependency>",
      "  </dependencies>",
      "</project>"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "junit-platform.properties"), [
      "jqwik.tries=1000",
      "jqwik.seed=123456789",
      "jqwik.failures.runfirst=true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "math.property.test.ts"), [
      "import fc from 'fast-check';",
      "fc.configureGlobal({ numRuns: 250, seed: 1234, path: '1:0:0', replayPath: '1:0:0' });",
      "test('array reversal is an involution', () => {",
      "  fc.assert(fc.property(fc.array(fc.record({ name: fc.string(), score: fc.integer() })), (items) => {",
      "    expect(items.toReversed().toReversed()).toEqual(items);",
      "  }), { numRuns: 250, seed: 1234, path: '1:0:0', replayPath: '1:0:0' });",
      "});",
      "const checked = fc.check(fc.property(fc.oneof(fc.string(), fc.constant('')), (value) => value.length >= 0));",
      "if (checked.failed) throw new Error(String(checked.counterexample));",
      "const recursiveTree = fc.letrec((tie) => ({ tree: fc.record({ value: fc.integer(), children: fc.array(tie('tree'), { maxLength: 2 }) }) })).tree;",
      "test('model based command sequence', () => {",
      "  fc.modelRun(() => ({ model: { value: 0 }, real: { value: 0 } }), fc.commands([]));",
      "  expect(recursiveTree).toBeDefined();",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "tests", "test_hypothesis_properties.py"), [
      "from hypothesis import given, settings, strategies as st, example, assume",
      "from hypothesis.stateful import RuleBasedStateMachine, rule, run_state_machine_as_test",
      "",
      "@settings(max_examples=75, derandomize=True, database=None)",
      "@example([1, 2, 3])",
      "@given(st.lists(st.integers()).filter(lambda values: len(values) < 5), st.data())",
      "def test_sorted_preserves_length(values, data):",
      "    assume(values is not None)",
      "    index = data.draw(st.integers(min_value=0, max_value=10))",
      "    assert len(sorted(values)) == len(values)",
      "    assert index >= 0",
      "",
      "class CounterMachine(RuleBasedStateMachine):",
      "    @rule(n=st.integers())",
      "    def add(self, n):",
      "        assert isinstance(n, int)",
      "",
      "run_state_machine_as_test(CounterMachine)",
      "# Falsifying example, example database, shrinking, counterexample, reproduce_failure"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "main", "test", "java", "demo", "PropertiesTest.java"), [
      "package demo;",
      "import net.jqwik.api.*;",
      "",
      "@PropertyDefaults(tries = 10, shrinking = ShrinkingMode.FULL)",
      "class PropertiesTest {",
      "  @Property(tries = 25, seed = \"123456\")",
      "  boolean absoluteValueIsPositive(@ForAll int number) {",
      "    return Math.abs(number) >= 0;",
      "  }",
      "  @Provide",
      "  Arbitrary<String> names() {",
      "    return Arbitraries.strings().alpha().ofMinLength(1).ofMaxLength(12).filter(value -> !value.isBlank());",
      "  }",
      "  @Property",
      "  void generatedName(@ForAll(\"names\") String name) {",
      "    Assertions.assertThat(name.length()).isGreaterThan(0);",
      "  }",
      "  // ActionChain stateful testing, afterFailure, falsified sample, shrinking report.",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "property.yml"), [
      "name: property",
      "on:",
      "  pull_request:",
      "jobs:",
      "  property:",
      "    runs-on: ubuntu-latest",
      "    strategy:",
      "      matrix:",
      "        runner: [vitest, pytest, jqwik]",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: pnpm property",
      "      - run: pytest -q --hypothesis-show-statistics",
      "      - run: mvn test -Djqwik.failures.runfirst=true",
      "      - run: echo 'property counterexample artifact seed numRuns max_examples tries' >> $GITHUB_STEP_SUMMARY",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: property-artifact",
      "          path: reports/property"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "property-based-testing-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      propertySetups: Array<{ filePath: string; ecosystem: string; propertyCount: number; generatorCount: number; assertionCount: number; readiness: string }>;
      generatorSignals: Array<{ signal: string; readiness: string }>;
      runnerSignals: Array<{ signal: string; readiness: string }>;
      reproductionSignals: Array<{ signal: string; readiness: string }>;
      statefulSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Property-based testing fast-check Hypothesis jqwik generators arbitraries strategies shrinking seeds counterexamples stateful CI");
    expect(report.propertySetups.some((item) => item.ecosystem === "fast-check" && item.readiness === "ready" && item.propertyCount > 0 && item.generatorCount > 0 && item.assertionCount > 0)).toBe(true);
    expect(report.propertySetups.some((item) => item.ecosystem === "hypothesis" && item.propertyCount > 0 && item.generatorCount > 0)).toBe(true);
    expect(report.propertySetups.some((item) => item.ecosystem === "jqwik" && item.propertyCount > 0 && item.generatorCount > 0)).toBe(true);
    expect(readySignals(report.generatorSignals)).toEqual(expect.arrayContaining(["fast-check-arbitraries", "hypothesis-strategies", "jqwik-arbitraries", "custom-generators", "composite-generators", "filtered-generators", "recursive-generators"]));
    expect(readySignals(report.runnerSignals)).toEqual(expect.arrayContaining(["fc-assert", "fc-check", "hypothesis-given", "jqwik-property", "pytest", "vitest", "jest", "junit-platform"]));
    expect(readySignals(report.reproductionSignals)).toEqual(expect.arrayContaining(["seed", "path", "replay-path", "counterexample", "example-database", "falsifying-example", "shrinking"]));
    expect(readySignals(report.statefulSignals)).toEqual(expect.arrayContaining(["model-run", "commands", "rule-based-state-machine", "state-machine", "action-chain"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "property-script", "num-runs", "max-examples", "tries", "seed-policy", "artifact"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["fast-check", "@fast-check/jest", "hypothesis", "pytest", "jqwik"]));
    expect(report.recommendedCommands.map((item) => item.command)).toEqual(expect.arrayContaining([
      "pytest -q --hypothesis-show-statistics",
      "mvn test -Djqwik.failures.runfirst=true"
    ]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "property-based-testing-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "property-based-testing-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "property-based-testing-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects fuzz readiness without compiling or running fuzzers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-fuzz-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-fuzz-source-"));
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "fuzz", "dicts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "fuzz", "seeds"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "fuzz", "fuzz_targets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "test", "java", "com", "example"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".clusterfuzzlite"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "fuzz.yml"), [
      "name: fuzz",
      "on:",
      "  pull_request:",
      "  schedule:",
      "    - cron: \"0 3 * * *\"",
      "jobs:",
      "  fuzz:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: python3 infra/helper.py build_fuzzers --sanitizer address example",
      "      - run: python3 infra/helper.py run_fuzzer example parse_fuzzer -runs=100 -max_len=4096 -max_total_time=60 -dict=fuzz/dicts/http.dict",
      "      - run: cifuzz run fuzz/ParseFuzzer.java --engine jazzer --sanitizer address --coverage",
      "      - run: ./afl-fuzz -i fuzz/seeds -o fuzz/out -x fuzz/dicts/http.dict -- ./target @@",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: fuzz-artifacts",
      "          path: |",
      "            fuzz/out",
      "            .cifuzz-corpus",
      "            coverage.exec",
      "            crash-reproducer"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "project.yaml"), [
      "homepage: https://example.com",
      "language: c++",
      "primary_contact: security@example.com",
      "fuzzing_engines:",
      "  - libfuzzer",
      "  - afl",
      "  - honggfuzz",
      "  - centipede",
      "sanitizers:",
      "  - address",
      "  - undefined",
      "  - memory",
      "main_repo: https://github.com/example/project"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".clusterfuzzlite", "config.yml"), [
      "fuzzing_language: c++",
      "fuzzing_engine: libfuzzer",
      "sanitizer: address",
      "ClusterFuzzLite: true",
      "cifuzz: true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "Dockerfile"), [
      "FROM gcr.io/oss-fuzz-base/base-builder",
      "RUN apt-get update && apt-get install -y clang llvm"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "build.sh"), [
      "#!/bin/bash",
      "$CXX $CXXFLAGS -fsanitize=fuzzer,address,undefined -I$SRC/include fuzz/parse_fuzzer.cc -o $OUT/parse_fuzzer",
      "cp fuzz/dicts/http.dict $OUT/"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "parse_fuzzer.cc"), [
      "#include <cstddef>",
      "#include <cstdint>",
      "extern \"C\" int LLVMFuzzerTestOneInput(const uint8_t *data, size_t size) {",
      "  return size > 0 ? 0 : 0;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "afl_harness.c"), [
      "int main(void) {",
      "  __AFL_INIT();",
      "  while (__AFL_LOOP(1000)) { }",
      "  return 0;",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "dicts", "http.dict"), [
      "\"GET\"",
      "\"POST\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "seeds", "seed.txt"), "GET / HTTP/1.1\n");
    await fs.writeFile(path.join(sourceRoot, "src", "test", "java", "com", "example", "ParseFuzzer.java"), [
      "package com.example;",
      "import com.code_intelligence.jazzer.junit.FuzzTest;",
      "import com.code_intelligence.jazzer.api.FuzzedDataProvider;",
      "public class ParseFuzzer {",
      "  @FuzzTest",
      "  void fuzzParse(FuzzedDataProvider data) {",
      "    data.consumeRemainingAsString();",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "pom.xml"), [
      "<project>",
      "  <dependencies>",
      "    <dependency><groupId>com.code-intelligence</groupId><artifactId>jazzer-junit</artifactId><version>0.0.0</version></dependency>",
      "  </dependencies>",
      "  <build><plugins><plugin><groupId>com.code-intelligence</groupId><artifactId>jazzer-maven-plugin</artifactId></plugin></plugins></build>",
      "</project>"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "BUILD.bazel"), [
      "load(\"@rules_fuzzing//fuzzing:cc_defs.bzl\", \"cc_fuzz_test\")",
      "load(\"@rules_fuzzing//fuzzing:java_defs.bzl\", \"java_fuzz_test\")",
      "cc_fuzz_test(name = \"parse_cc_fuzz\", srcs = [\"fuzz/parse_fuzzer.cc\"])",
      "java_fuzz_test(name = \"parse_java_fuzz\", test_class = \"com.example.ParseFuzzer\")"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), [
      "{",
      "  \"scripts\": {",
      "    \"fuzz-corpus\": \"echo dictionary corpus seed\"",
      "  }",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "parse_fuzz_test.go"), [
      "package fuzz",
      "import \"testing\"",
      "func FuzzParse(f *testing.F) {",
      "  f.Add([]byte(\"seed\"))",
      "  f.Fuzz(func(t *testing.T, data []byte) {})",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "fuzz_targets", "parse.rs"), [
      "use libfuzzer_sys::fuzz_target;",
      "fuzz_target!(|data: &[u8]| {",
      "  let _ = data.len();",
      "});"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "fuzz", "Cargo.toml"), [
      "[package]",
      "name = \"parse-fuzz\"",
      "version = \"0.0.0\"",
      "edition = \"2021\"",
      "[dependencies]",
      "libfuzzer-sys = \"0.4\"",
      "[package.metadata]",
      "cargo-fuzz = true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "fuzzing.md"), [
      "# Fuzzing",
      "ClusterFuzzLite, CIFuzz, OSS-Fuzz, Fuzz Introspector, coverage_report, coverage_dump, JaCoCo code coverage.",
      ".cifuzz-corpus generated corpus inputs directory seed corpus reproducer crash- Crash-Example.java.",
      "AddressSanitizer UndefinedBehaviorSanitizer MemorySanitizer ASAN UBSAN MSAN.",
      "BugDetectorsAPI disabled_hooks --asan --ubsan -fork=2 -jobs=2 persistent mode deferred forkserver.",
      "AFL_USE_ASAN AFL_USE_UBSAN AFL_USE_MSAN AFL_LLVM_CMPLOG afl-clang-fast -x fuzz/dicts/http.dict.",
      "Bazel rules_fuzzing cc_fuzz_test java_fuzz_test.",
      "timeout max_total_time max_len Honggfuzz Centipede AFL++ libFuzzer Jazzer."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "fuzz-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      fuzzSetups: Array<{ filePath: string; ecosystem: string; targetCount: number; harnessCount: number; engineCount: number; sanitizerCount: number; corpusCount: number; dictionaryCount: number; coverageCount: number; ciCount: number; readiness: string }>;
      harnessSignals: Array<{ signal: string; readiness: string }>;
      engineSignals: Array<{ signal: string; readiness: string }>;
      buildSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      sanitizerSignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);

    expect(report.sourcePattern).toBe("Fuzz readiness OSS-Fuzz libFuzzer AFL++ Jazzer ClusterFuzzLite fuzz targets corpus dictionary sanitizer coverage reproducer CI");
    expect(report.fuzzSetups.some((item) => item.readiness === "ready")).toBe(true);
    expect(report.fuzzSetups.some((item) => item.targetCount > 0)).toBe(true);
    expect(report.fuzzSetups.some((item) => item.harnessCount > 0)).toBe(true);
    expect(report.fuzzSetups.some((item) => item.engineCount > 0)).toBe(true);
    expect(report.fuzzSetups.some((item) => item.sanitizerCount > 0)).toBe(true);
    expect(report.fuzzSetups.some((item) => item.corpusCount > 0 && item.dictionaryCount > 0 && item.coverageCount > 0 && item.ciCount > 0)).toBe(true);
    expect(report.fuzzSetups.map((item) => item.ecosystem)).toEqual(expect.arrayContaining(["oss-fuzz", "libfuzzer", "aflplusplus", "jazzer", "go-fuzz", "cargo-fuzz", "clusterfuzzlite", "package-script"]));
    expect(readySignals(report.harnessSignals)).toEqual(expect.arrayContaining(["llvm-fuzzer-test-one-input", "fuzztest-annotation", "jazzer-fuzztest", "go-fuzz", "cargo-fuzz-target", "afl-target"]));
    expect(readySignals(report.engineSignals)).toEqual(expect.arrayContaining(["oss-fuzz", "libfuzzer", "aflplusplus", "jazzer", "clusterfuzzlite", "honggfuzz", "centipede"]));
    expect(readySignals(report.buildSignals)).toEqual(expect.arrayContaining(["oss-fuzz-dockerfile", "build-sh", "project-yaml", "compiler-wrapper", "fsanitize-fuzzer", "bazel-rules-fuzzing", "maven-plugin"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["seed-corpus", "generated-corpus", "dictionary", "timeout", "max-len", "runs", "fork-jobs", "persistent-mode", "reproducer"]));
    expect(readySignals(report.sanitizerSignals)).toEqual(expect.arrayContaining(["address", "undefined", "memory", "coverage", "asan", "ubsan", "msan", "jazzer-sanitizers"]));
    expect(readySignals(report.ciSignals)).toEqual(expect.arrayContaining(["github-actions", "cifuzz", "oss-fuzz", "clusterfuzzlite", "artifact-upload", "coverage-report"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["libfuzzer", "aflplusplus", "jazzer-junit", "jazzer-maven-plugin", "rules-fuzzing", "cargo-fuzz", "go-test-fuzz"]));
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.map((item) => item.action)).toContain("Run OSS-Fuzz, libFuzzer, AFL++, Jazzer, ClusterFuzzLite, or language fuzz commands only in an authorized environment.");
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"LLVMFuzzerTestOneInput|@FuzzTest|FuzzedDataProvider|go test -fuzz|cargo fuzz|afl-fuzz\" .",
      "rg \"project.yaml|build.sh|Dockerfile|infra/helper.py build_fuzzers|ClusterFuzzLite|cifuzz\" .github .",
      "rg -- \"-fsanitize=fuzzer|AFL_USE_ASAN|AFL_LLVM_CMPLOG|afl-clang-fast|jazzer-junit|rules_fuzzing\" .",
      "rg \"corpus|seed|dictionary|-dict|-x |timeout|max_len|max_total_time|reproducer|crash-\" ."
    ]);
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "fuzz-readiness-report.json"))).resolves.toBeUndefined();
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "fuzz-readiness.md"), "utf8");
    expect(markdown).toContain("# Fuzz Readiness");
    expect(markdown).toContain("## Harness Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "fuzz-readiness.html"), "utf8");
    expect(html).toContain("Fuzz Readiness");
    expect(html).toContain("fuzz-readiness-card");
    expect(html).toContain("data-source-pattern=\"Fuzz\"");
  });
});
