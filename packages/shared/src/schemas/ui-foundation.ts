import { z } from "zod";

export const AccessibilityReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  scanTargets: z.array(z.object({
    filePath: z.string(),
    kind: z.enum(["page", "component", "template", "test", "config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  ruleTags: z.array(z.object({
    tag: z.enum(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa", "best-practice", "section508", "cat.aria", "cat.color", "cat.forms", "cat.keyboard", "cat.language", "cat.name-role-value", "cat.parsing", "cat.semantics", "cat.structure", "cat.tables", "cat.text-alternatives", "cat.time-and-media", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  resultBuckets: z.array(z.object({
    bucket: z.enum(["violations", "passes", "incomplete", "inapplicable"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  impactLevels: z.array(z.object({
    impact: z.enum(["critical", "serious", "moderate", "minor", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  integrationSignals: z.array(z.object({
    filePath: z.string(),
    integration: z.enum(["axe-run", "axe-core-package", "jest-axe", "playwright-axe", "cypress-axe", "pa11y", "lighthouse", "manual-review", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  contextControls: z.array(z.object({
    control: z.enum(["include-exclude", "run-only-tags", "disable-rules", "iframes", "shadow-dom", "locale", "reporter", "jsdom", "timeouts"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const StorybookReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  storyFiles: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["csf3", "csf2", "mdx", "svelte-csf", "legacy", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  configFiles: z.array(z.object({
    filePath: z.string(),
    configType: z.enum(["main", "preview", "manager", "test-runner", "vitest", "package-script", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  storyAnnotations: z.array(z.object({
    annotation: z.enum(["component", "title", "args", "argTypes", "parameters", "decorators", "loaders", "tags", "render", "play", "name", "subcomponents"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  addonSignals: z.array(z.object({
    addon: z.enum(["docs", "controls", "actions", "interactions", "a11y", "viewport", "backgrounds", "measure", "outline", "coverage", "vitest", "test-runner", "chromatic", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  testSignals: z.array(z.object({
    signal: z.enum(["render-tests", "interaction-tests", "accessibility-tests", "visual-tests", "snapshot-tests", "coverage", "ci", "storybook-test", "portable-stories"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  publishSignals: z.array(z.object({
    signal: z.enum(["build-storybook", "storybook-static", "chromatic", "composition", "refs", "static-dirs", "docs-mode", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  storybookSignals: z.array(z.object({
    signal: z.enum(["meta-type", "storyobj-type", "satisfies-meta", "csf3-object", "stories-glob", "main-framework", "addons-array", "static-dirs", "preview-parameters", "preview-decorators", "global-types", "args", "arg-types", "parameters", "loaders", "before-each", "play-function", "tags-autodocs", "mdx-docs", "storybook-test-import", "portable-stories", "vitest-addon", "test-runner", "chromatic", "composition-refs", "msw-addon", "svelte-csf"]),
    readiness: z.enum(["ready", "missing"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const DesignTokensReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  tokenSources: z.array(z.object({
    filePath: z.string(),
    format: z.enum(["style-dictionary-config", "tokens-json", "tokens-js", "dtcg-json", "css-custom-properties", "tailwind-theme", "sass-variables", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  tokenCategories: z.array(z.object({
    category: z.enum(["color", "size", "dimension", "typography", "font", "spacing", "border", "radius", "shadow", "motion", "opacity", "breakpoint", "asset", "z-index", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  platformTargets: z.array(z.object({
    target: z.enum(["css", "scss", "javascript", "typescript", "android", "compose", "ios", "ios-swift", "flutter", "react-native", "docs", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  transformSignals: z.array(z.object({
    signal: z.enum(["transform-group", "transforms", "formats", "build-path", "files", "filters", "custom-transform", "custom-format", "custom-parser", "output-references", "expand", "dtcg"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  usageSignals: z.array(z.object({
    signal: z.enum(["css-variables", "theme-provider", "tailwind-config", "component-style", "storybook", "docs", "package-script", "build-output", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  governanceSignals: z.array(z.object({
    signal: z.enum(["cti-structure", "aliases", "comments", "themes", "multi-brand", "deprecation", "npm-module", "ci-build", "s3-publish", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export const I18nReportSchema = z.object({
  summary: z.string(),
  sourcePattern: z.string(),
  messageSources: z.array(z.object({
    filePath: z.string(),
    mechanism: z.enum(["defineMessages", "defineMessage", "FormattedMessage", "formatMessage", "IntlProvider", "next-intl-useTranslations", "next-intl-getTranslations", "next-intl-provider", "i18next-t", "i18next-resources", "react-i18next-useTranslation", "lingui-trans", "lingui-macro", "lingui-provider", "locale-json", "message-catalog", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  localeAssets: z.array(z.object({
    filePath: z.string(),
    locale: z.string().nullable(),
    assetType: z.enum(["source-locale", "target-locale", "compiled-messages", "extracted-messages", "runtime-locale-data", "po-catalog", "namespaced-resources", "route-locale-config", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing"]),
    evidence: z.string(),
    sourceHref: z.string()
  })),
  runtimeSignals: z.array(z.object({
    signal: z.enum(["IntlProvider", "next-intl-provider", "server-translations", "request-locale", "localized-routing", "middleware-locale", "locale-prop", "messages-prop", "navigator-language", "fallback-locale", "i18next-init", "language-detector", "backend-loader", "change-language", "lingui-provider", "load-activate", "polyfill", "locale-data", "resolved-options", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  extractionSignals: z.array(z.object({
    signal: z.enum(["formatjs-extract", "formatjs-compile", "formatjs-verify", "compile-folder", "lingui-extract", "lingui-compile", "lingui-config", "lingui-vite-plugin", "lingui-clean", "next-intl-plugin", "swc-plugin-extractor", "id-interpolation", "extract-source-location", "additional-names", "ignore-globs", "flatten", "pseudo-locale"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  icuSignals: z.array(z.object({
    signal: z.enum(["plural", "select", "selectordinal", "number", "date", "time", "rich-text", "description", "placeholder", "ast", "i18next-plural-suffix", "i18next-context", "lingui-plural", "message-id"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  qaSignals: z.array(z.object({
    signal: z.enum(["eslint-plugin-formatjs", "enforce-description", "enforce-id", "no-invalid-icu", "missing-keys", "structural-equality", "extra-keys", "lingui-eslint", "catalog-compile", "selector-types", "save-missing", "namespace-types", "pseudo-locale", "route-localization", "tms-format", "ci-workflow", "unknown"]),
    readiness: z.enum(["ready", "partial", "missing", "external"]),
    evidence: z.string(),
    relatedHref: z.string()
  })),
  riskQueue: z.array(z.object({
    priority: z.enum(["high", "medium", "low"]),
    action: z.string(),
    why: z.string(),
    relatedHref: z.string()
  })),
  recommendedCommands: z.array(z.object({
    command: z.string(),
    purpose: z.string()
  })),
  learnerNextSteps: z.array(z.string())
});

export type AccessibilityReport = z.infer<typeof AccessibilityReportSchema>;
export type StorybookReport = z.infer<typeof StorybookReportSchema>;
export type DesignTokensReport = z.infer<typeof DesignTokensReportSchema>;
export type I18nReport = z.infer<typeof I18nReportSchema>;
