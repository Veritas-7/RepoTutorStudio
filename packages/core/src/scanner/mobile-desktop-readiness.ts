import path from "node:path";
import type { DesktopReadinessReport, EdgeReadinessReport, MobileReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildMobileReadinessReport(walk: WalkResult): Promise<MobileReadinessReport> {
  const sourceFiles = await mobileSourceFiles(walk);
  const mobileSetups = mobileSetupFiles(sourceFiles);
  const configSignals = mobileConfigSignals(sourceFiles);
  const platformSignals = mobilePlatformSignals(sourceFiles);
  const navigationSignals = mobileNavigationSignals(sourceFiles);
  const buildSignals = mobileBuildSignals(sourceFiles);
  const updateSignals = mobileUpdateSignals(sourceFiles);
  const assetSignals = mobileAssetSignals(sourceFiles);
  const packageSignals = mobilePackageSignals(sourceFiles);

  const hasConfig = mobileSetups.length > 0 || configSignals.some((item) => item.readiness === "ready");
  const hasPlatform = platformSignals.some((item) => ["ios", "android", "native-ios-dir", "native-android-dir"].includes(item.signal) && item.readiness === "ready");
  const hasNavigation = navigationSignals.some((item) => item.readiness === "ready");
  const hasBuild = buildSignals.some((item) => ["eas-json", "eas-build", "run-ios", "run-android"].includes(item.signal) && item.readiness === "ready");
  const hasUpdates = updateSignals.some((item) => ["expo-updates", "runtime-version", "updates-url", "eas-update"].includes(item.signal) && item.readiness === "ready");
  const hasAssets = assetSignals.some((item) => ["icon", "adaptive-icon", "splash-screen", "assets-directory"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: MobileReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add an Expo or React Native app configuration inventory before treating this project as mobile-ready.",
      why: "Expo-style review starts from app.json/app.config, package dependencies, platform identifiers, plugins, assets, and launch commands.",
      relatedHref: "html/mobile-readiness.html"
    });
  }
  if (hasConfig && !hasPlatform) {
    riskQueue.push({
      priority: "high",
      action: "Record iOS and Android identifiers or native project ownership.",
      why: "Bundle IDs, Android package names, permissions, and native directories determine what can be installed, signed, submitted, and updated.",
      relatedHref: "html/mobile-readiness.html"
    });
  }
  if (hasConfig && !hasNavigation) {
    riskQueue.push({
      priority: "medium",
      action: "Document the app entry point, router, and deep-linking scheme.",
      why: "Learners need a first navigation map before they can understand launch flow, tabs/stacks, and URL routing.",
      relatedHref: "html/mobile-readiness.html"
    });
  }
  if (hasConfig && !hasBuild) {
    riskQueue.push({
      priority: "medium",
      action: "Add repeatable Expo/EAS build, prebuild, and device run commands.",
      why: "Mobile readiness depends on reproducible simulator/device builds and explicit EAS profiles, not only JavaScript package scripts.",
      relatedHref: "html/mobile-readiness.html"
    });
  }
  if (hasConfig && !hasUpdates) {
    riskQueue.push({
      priority: "low",
      action: "Document OTA update policy, runtimeVersion, update URL, branch, or channel before publishing updates.",
      why: "Expo Updates require native runtime compatibility and update routing evidence to avoid shipping incompatible bundles.",
      relatedHref: "html/mobile-readiness.html"
    });
  }
  if (hasConfig && !hasAssets) {
    riskQueue.push({
      priority: "low",
      action: "Record icon, adaptive icon, splash, favicon, and bundled asset evidence.",
      why: "Mobile builds fail or look unfinished when required visual assets are implicit or missing from app configuration.",
      relatedHref: "html/mobile-readiness.html"
    });
  }

  return {
    summary: `Expo/React Native mobile readiness report: setup ${mobileSetups.length}개, config signal ${configSignals.length}개, platform signal ${platformSignals.length}개, build signal ${buildSignals.length}개, update signal ${updateSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Expo app.json app.config eas.json expo start expo run:ios expo run:android eas build eas update expo-updates runtimeVersion scheme plugins assets permissions",
    mobileSetups,
    configSignals,
    platformSignals,
    navigationSignals,
    buildSignals,
    updateSignals,
    assetSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "npx expo start --dev-client", purpose: "Start Metro for a development build without publishing or building native binaries." },
      { command: "npx expo prebuild --clean", purpose: "Regenerate native projects from app config when native folders are intentionally managed by Expo." },
      { command: "npx expo run:ios --configuration Release", purpose: "Build and run the iOS release configuration locally when macOS/Xcode are available." },
      { command: "npx expo run:android --variant release", purpose: "Build and run the Android release variant locally when the Android toolchain is available." },
      { command: "eas build --platform all --profile production", purpose: "Run cloud production builds after profiles, credentials, and signing policy are reviewed." },
      { command: "eas update --branch <branch>", purpose: "Publish an OTA update only after runtimeVersion, update URL, branch, and channel compatibility are confirmed." }
    ],
    learnerNextSteps: [
      "Open Mobile Readiness and identify the app configuration file first.",
      "Confirm name, slug, version, scheme, plugins, and platform identifiers before reading screens.",
      "Map Expo Router or React Navigation entry points to the app directory and deep-linking scheme.",
      "Review EAS build profiles, development client, OTA update runtimeVersion, and visual assets before trusting a release path."
    ]
  };
}

type MobileSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function mobileSourceFiles(walk: WalkResult): Promise<MobileSourceFile[]> {
  const files: MobileSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !mobileInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!mobilePathSignal(file.relPath) && !mobileContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function mobileInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return mobilePathSignal(filePath)
    || /(^|\/)(README|docs?|app|src|screens?|routes?|navigation|navigator|ios|android|assets?|images?|icons?|build|submit|release|updates?|scripts?|ci|workflows?|mobile|native)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|eas\.json|app\.json|app\.config\.[cm]?[jt]s|metro\.config\.[cm]?[jt]s|babel\.config\.[cm]?js|react-native\.config\.[cm]?js)$/i.test(base);
}

function mobilePathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(app\.json|app\.config\.[cm]?[jt]s|eas\.json|metro\.config\.[cm]?[jt]s|react-native\.config\.[cm]?js)$/i.test(base)
    || /(^|\/)(ios|android|app|screens|navigation|routes|assets)(\/|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath);
}

function mobileContentSignal(text: string): boolean {
  return /("expo"\s*:|app\.config|expo-router|expo start|expo run:(ios|android)|expo prebuild|eas\.json|eas\s+(build|submit|update|login|whoami)|expo-updates|runtimeVersion|updates\s*:|ios\s*:|android\s*:|bundleIdentifier|adaptiveIcon|splash|react-native|React Native|registerRootComponent|AppRegistry\.registerComponent|AndroidManifest|NSCameraUsageDescription|uses-permission)/i.test(text);
}

function mobileSetupFiles(sourceFiles: MobileSourceFile[]): MobileReadinessReport["mobileSetups"] {
  const rows: MobileReadinessReport["mobileSetups"] = [];
  for (const source of sourceFiles) {
    const appConfigCount = countMatches(source.text, /"expo"\s*:|app\.config|name\s*:|"name"\s*:|slug\s*:|"slug"\s*:|version\s*:|"version"\s*:|scheme\s*:|"scheme"\s*:|plugins\s*:|"plugins"\s*:|experiments\s*:|"experiments"\s*:/gi) + (/^(app\.json|app\.config\.[cm]?[jt]s)$/i.test(path.basename(source.filePath)) ? 1 : 0);
    const platformCount = countMatches(source.text, /ios\s*:|"ios"\s*:|android\s*:|"android"\s*:|bundleIdentifier|package\s*:|"package"\s*:|supportsTablet|permissions|web\s*:|"web"\s*:/gi) + (/(\b|\/)(ios|android)(\/|$)/i.test(source.filePath) ? 1 : 0);
    const navigationCount = countMatches(source.text, /expo-router|react-navigation|@react-navigation|Stack\s*\/>|Tabs\s*\/>|app\/_layout|typedRoutes|deep linking|scheme\s*:|"scheme"\s*:/gi) + (/(\b|\/)(app|screens|navigation|routes)(\/|$)/i.test(source.filePath) ? 1 : 0);
    const buildProfileCount = countMatches(source.text, /eas\.json|eas\s+build|developmentClient|distribution|internal|autoIncrement|submit\s*:|"submit"\s*:|expo prebuild|expo run:(ios|android)/gi) + (/^eas\.json$/i.test(path.basename(source.filePath)) ? 1 : 0);
    const updateCount = countMatches(source.text, /expo-updates|runtimeVersion|updates\s*:|"updates"\s*:|updates\.url|eas\s+update|branch\s*:|"branch"\s*:|channel\s*:|"channel"\s*:/gi);
    const assetCount = countMatches(source.text, /icon\s*:|"icon"\s*:|adaptiveIcon|splash|expo-splash-screen|favicon|assets?\//gi) + (/(\b|\/)(assets|images|icons)(\/|$)/i.test(source.filePath) ? 1 : 0);
    const permissionCount = countMatches(source.text, /permissions\s*:|"permissions"\s*:|uses-permission|NS[A-Za-z]+UsageDescription|UIBackgroundModes|android\.permission/gi);
    const commandCount = countMatches(source.text, /\b(expo|npx expo|yarn expo|pnpm expo|bun expo)\s+(start|prebuild|run:ios|run:android|install)|\beas\s+(build|submit|update|login|whoami|credentials)\b/gi);
    const packageCount = countMatches(source.text, /"expo"|"react-native"|"expo-router"|"expo-dev-client"|"expo-updates"|"eas-cli"|"react-native-web"|"@expo\/metro-config"/gi);
    const totalSignals = appConfigCount + platformCount + navigationCount + buildProfileCount + updateCount + assetCount + permissionCount + commandCount + packageCount;
    if (totalSignals === 0 && !mobilePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: mobileFramework(source),
      appConfigCount,
      platformCount,
      navigationCount,
      buildProfileCount,
      updateCount,
      assetCount,
      permissionCount,
      commandCount,
      packageCount,
      readiness: totalSignals >= 6 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} mobile app signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.appConfigCount + b.platformCount + b.buildProfileCount + b.updateCount + b.packageCount;
    const aScore = a.appConfigCount + a.platformCount + a.buildProfileCount + a.updateCount + a.packageCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function mobileFramework(source: MobileSourceFile): MobileReadinessReport["mobileSetups"][number]["framework"] {
  if (/eas\.json/i.test(source.filePath) || /\beas\s+(build|submit|update|login|whoami)|"eas-cli"/i.test(source.text)) return "eas";
  if (/app\.json|app\.config|expo-router|"expo"|expo\s+(start|prebuild|run:ios|run:android)|expo-updates/i.test(source.filePath) || /"expo"|expo-router|expo\s+(start|prebuild|run:ios|run:android)|expo-updates/i.test(source.text)) return "expo";
  if (/react-native|React Native|AppRegistry\.registerComponent|registerRootComponent/i.test(source.text)) return "react-native";
  if (/(^|\/)(ios|android)(\/|$)/i.test(source.filePath) || /AndroidManifest|Info\.plist|Podfile|Gradle/i.test(source.text)) return "bare-native";
  if (/capacitor\.config|@capacitor/i.test(source.filePath) || /@capacitor|Capacitor/i.test(source.text)) return "capacitor";
  return "unknown";
}

function mobileConfigSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["configSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "app-json", pattern: /(^|\/)app\.json$/i, evidence: "app.json evidence was detected." },
    { signal: "app-config", pattern: /(^|\/)app\.config\.[cm]?[jt]s$/i, evidence: "dynamic app config evidence was detected." },
    { signal: "name", pattern: /"name"\s*:|name\s*:/i, evidence: "app name evidence was detected." },
    { signal: "slug", pattern: /"slug"\s*:|slug\s*:/i, evidence: "Expo slug evidence was detected." },
    { signal: "version", pattern: /"version"\s*:|version\s*:/i, evidence: "app version evidence was detected." },
    { signal: "scheme", pattern: /"scheme"\s*:|scheme\s*:/i, evidence: "deep-linking scheme evidence was detected." },
    { signal: "extra", pattern: /"extra"\s*:|extra\s*:/i, evidence: "extra config evidence was detected." },
    { signal: "plugins", pattern: /"plugins"\s*:|plugins\s*:/i, evidence: "Expo plugin evidence was detected." },
    { signal: "experiments", pattern: /"experiments"\s*:|experiments\s*:/i, evidence: "Expo experiment config evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function mobilePlatformSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["platformSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ios", pattern: /"ios"\s*:|ios\s*:/i, evidence: "iOS app config evidence was detected." },
    { signal: "bundle-identifier", pattern: /bundleIdentifier|PRODUCT_BUNDLE_IDENTIFIER/i, evidence: "iOS bundle identifier evidence was detected." },
    { signal: "android", pattern: /"android"\s*:|android\s*:/i, evidence: "Android app config evidence was detected." },
    { signal: "android-package", pattern: /"package"\s*:|applicationId|namespace\s*=|android:host/i, evidence: "Android package/application ID evidence was detected." },
    { signal: "native-ios-dir", pattern: /(^|\/)ios(\/|$)|Podfile|Info\.plist/i, evidence: "native iOS directory evidence was detected." },
    { signal: "native-android-dir", pattern: /(^|\/)android(\/|$)|AndroidManifest|build\.gradle/i, evidence: "native Android directory evidence was detected." },
    { signal: "web", pattern: /"web"\s*:|expo start --web|react-native-web/i, evidence: "web target evidence was detected." },
    { signal: "permissions", pattern: /permissions\s*:|"permissions"\s*:|uses-permission|NS[A-Za-z]+UsageDescription|android\.permission/i, evidence: "mobile permission evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function mobileNavigationSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["navigationSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["navigationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "expo-router", pattern: /expo-router/i, evidence: "Expo Router evidence was detected." },
    { signal: "app-directory", pattern: /(^|\/)app\/(_layout|index|\+html|\[[^\]]+\])\.[cm]?[jt]sx?$|(^|\/)app(\/|$)/i, evidence: "app directory route evidence was detected." },
    { signal: "typed-routes", pattern: /typedRoutes/i, evidence: "typed routes evidence was detected." },
    { signal: "deep-linking", pattern: /scheme\s*:|"scheme"\s*:|Linking\.createURL|deep linking/i, evidence: "deep-linking evidence was detected." },
    { signal: "react-navigation", pattern: /@react-navigation|NavigationContainer|createNativeStackNavigator|createBottomTabNavigator/i, evidence: "React Navigation evidence was detected." },
    { signal: "entry-point", pattern: /"main"\s*:\s*"expo-router\/entry"|registerRootComponent|AppRegistry\.registerComponent/i, evidence: "mobile app entry point evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "navigation", "signal");
}

function mobileBuildSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["buildSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["buildSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "eas-json", pattern: /(^|\/)eas\.json$/i, evidence: "EAS build profile file evidence was detected." },
    { signal: "eas-build", pattern: /\beas\s+build\b/i, evidence: "EAS build command evidence was detected." },
    { signal: "development-client", pattern: /developmentClient|expo-dev-client|--dev-client/i, evidence: "development client evidence was detected." },
    { signal: "internal-distribution", pattern: /distribution\s*:\s*["']?internal|"distribution"\s*:\s*"internal"/i, evidence: "internal distribution evidence was detected." },
    { signal: "submit", pattern: /\beas\s+submit\b|"submit"\s*:/i, evidence: "store submission evidence was detected." },
    { signal: "auto-increment", pattern: /autoIncrement|appVersionSource/i, evidence: "version auto-increment evidence was detected." },
    { signal: "prebuild", pattern: /expo\s+prebuild|npx\s+expo\s+prebuild/i, evidence: "Expo prebuild evidence was detected." },
    { signal: "run-ios", pattern: /expo\s+run:ios|npx\s+expo\s+run:ios/i, evidence: "iOS local run command evidence was detected." },
    { signal: "run-android", pattern: /expo\s+run:android|npx\s+expo\s+run:android/i, evidence: "Android local run command evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "build", "signal");
}

function mobileUpdateSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["updateSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["updateSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "expo-updates", pattern: /expo-updates|Updates\./i, evidence: "expo-updates evidence was detected." },
    { signal: "runtime-version", pattern: /runtimeVersion|EXPO_RUNTIME_VERSION/i, evidence: "runtimeVersion evidence was detected." },
    { signal: "updates-url", pattern: /updates\s*:|"updates"\s*:|updates\.url|EXPO_UPDATE_URL|u\.expo\.dev/i, evidence: "update URL evidence was detected." },
    { signal: "eas-update", pattern: /\beas\s+update\b|EAS Update/i, evidence: "EAS Update command evidence was detected." },
    { signal: "update-branch", pattern: /branch\s*:|"branch"\s*:|--branch/i, evidence: "update branch evidence was detected." },
    { signal: "channel", pattern: /channel\s*:|"channel"\s*:|--channel/i, evidence: "update channel evidence was detected." },
    { signal: "check-for-update", pattern: /checkForUpdateAsync/i, evidence: "manual update check evidence was detected." },
    { signal: "fetch-update", pattern: /fetchUpdateAsync|reloadAsync/i, evidence: "manual update fetch/reload evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "update", "signal");
}

function mobileAssetSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["assetSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["assetSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "icon", pattern: /"icon"\s*:|icon\s*:/i, evidence: "app icon evidence was detected." },
    { signal: "adaptive-icon", pattern: /adaptiveIcon|android-icon/i, evidence: "Android adaptive icon evidence was detected." },
    { signal: "splash-screen", pattern: /expo-splash-screen|"splash"\s*:|splash\s*:|splash-icon/i, evidence: "splash screen evidence was detected." },
    { signal: "favicon", pattern: /favicon/i, evidence: "web favicon evidence was detected." },
    { signal: "assets-directory", pattern: /(^|\/)assets(\/|$)|assets?\//i, evidence: "asset directory evidence was detected." },
    { signal: "font-assets", pattern: /expo-font|useFonts|Font\.loadAsync|\.(ttf|otf)/i, evidence: "font asset evidence was detected." },
    { signal: "image-assets", pattern: /\.(png|jpe?g|webp|gif|svg)|Image\s+from|require\(['"].*assets/i, evidence: "image asset evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "asset", "signal");
}

function mobilePackageSignals(sourceFiles: MobileSourceFile[]): MobileReadinessReport["packageSignals"] {
  const specs: Array<{ signal: MobileReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "expo", pattern: /"expo"|from ['"]expo['"]|npx\s+expo/i, evidence: "Expo package/command evidence was detected." },
    { signal: "react-native", pattern: /"react-native"|from ['"]react-native['"]|React Native/i, evidence: "React Native package evidence was detected." },
    { signal: "expo-router", pattern: /"expo-router"|expo-router/i, evidence: "Expo Router package evidence was detected." },
    { signal: "expo-dev-client", pattern: /"expo-dev-client"|expo-dev-client/i, evidence: "Expo development client package evidence was detected." },
    { signal: "expo-updates", pattern: /"expo-updates"|expo-updates/i, evidence: "Expo Updates package evidence was detected." },
    { signal: "eas-cli", pattern: /"eas-cli"|\beas\s+(build|submit|update|login|whoami)\b/i, evidence: "EAS CLI evidence was detected." },
    { signal: "react-native-web", pattern: /"react-native-web"|react-native-web/i, evidence: "React Native Web package evidence was detected." },
    { signal: "metro-config", pattern: /@expo\/metro-config|expo\/metro-config|metro\.config/i, evidence: "Metro config evidence was detected." }
  ];
  return mobileSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function mobileSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: MobileSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/mobile-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildDesktopReadinessReport(walk: WalkResult): Promise<DesktopReadinessReport> {
  const sourceFiles = await desktopSourceFiles(walk);
  const desktopSetups = desktopSetupFiles(sourceFiles);
  const frameworkSignals = desktopFrameworkSignals(sourceFiles);
  const configSignals = desktopConfigSignals(sourceFiles);
  const runtimeSignals = desktopRuntimeSignals(sourceFiles);
  const permissionSignals = desktopPermissionSignals(sourceFiles);
  const bundleSignals = desktopBundleSignals(sourceFiles);
  const releaseSignals = desktopReleaseSignals(sourceFiles);
  const packageSignals = desktopPackageSignals(sourceFiles);

  const hasFramework = frameworkSignals.some((item) => item.readiness === "ready");
  const hasConfig = desktopSetups.length > 0 || configSignals.some((item) => item.readiness === "ready");
  const hasRuntime = runtimeSignals.some((item) => ["window", "ipc", "tray", "menu"].includes(item.signal) && item.readiness === "ready");
  const hasPermissions = permissionSignals.some((item) => ["tauri-capabilities", "permissions", "csp", "allowlist", "entitlements", "sandbox"].includes(item.signal) && item.readiness === "ready");
  const hasBundle = bundleSignals.some((item) => ["bundle-targets", "icons", "macos", "windows", "linux", "dmg", "nsis", "appimage", "msi"].includes(item.signal) && item.readiness === "ready");
  const hasRelease = releaseSignals.some((item) => ["updater", "signing", "notarization", "ci-build", "artifact-upload"].includes(item.signal) && item.readiness === "ready");

  const riskQueue: DesktopReadinessReport["riskQueue"] = [];
  if (!hasFramework) {
    riskQueue.push({
      priority: "high",
      action: "Add or document the desktop runtime framework before treating this project as desktop-ready.",
      why: "Tauri, Electron, Wails, or another webview runtime determines the config files, IPC boundary, packaging flow, and release surface.",
      relatedHref: "html/desktop-readiness.html"
    });
  }
  if (hasFramework && !hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Record the desktop app configuration entrypoint.",
      why: "Desktop review starts from tauri.conf.json, wails.json, electron-builder/Forge config, package main, or Cargo manifest evidence.",
      relatedHref: "html/desktop-readiness.html"
    });
  }
  if (hasConfig && !hasRuntime) {
    riskQueue.push({
      priority: "medium",
      action: "Document window, tray, menu, dialog, protocol, and IPC entrypoints.",
      why: "Learners need the native shell map before they can understand webview lifecycle and host/frontend boundaries.",
      relatedHref: "html/desktop-readiness.html"
    });
  }
  if (hasConfig && !hasPermissions) {
    riskQueue.push({
      priority: "high",
      action: "Review desktop permissions, capabilities, CSP, entitlements, sandbox, and shell/file scopes.",
      why: "Desktop apps cross a stronger native boundary than ordinary web apps; permissive IPC, shell, file, or global bridge settings can become release blockers.",
      relatedHref: "html/desktop-readiness.html"
    });
  }
  if (hasConfig && !hasBundle) {
    riskQueue.push({
      priority: "medium",
      action: "Add repeatable bundle target, icon, resource, and platform packaging evidence.",
      why: "Desktop releases need explicit macOS, Windows, and Linux package decisions instead of only a dev server command.",
      relatedHref: "html/desktop-readiness.html"
    });
  }
  if (hasBundle && !hasRelease) {
    riskQueue.push({
      priority: "medium",
      action: "Document updater, signing, notarization, CI build, and artifact upload policy before distribution.",
      why: "Tauri and Electron release failures often happen in updater metadata, code signing, notarization, or missing uploaded artifacts after local builds pass.",
      relatedHref: "html/desktop-readiness.html"
    });
  }

  return {
    summary: `Tauri/Electron/Wails desktop readiness report: setup ${desktopSetups.length}개, framework signal ${frameworkSignals.length}개, config signal ${configSignals.length}개, runtime signal ${runtimeSignals.length}개, release signal ${releaseSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Tauri tauri.conf.json capabilities permissions bundle updater createUpdaterArtifacts signing notarization Electron electron-builder electron-forge autoUpdater Wails wails.json wails build desktop app packaging",
    desktopSetups,
    frameworkSignals,
    configSignals,
    runtimeSignals,
    permissionSignals,
    bundleSignals,
    releaseSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "pnpm tauri info", purpose: "Tauri CLI, Rust toolchain, platform dependency, and app config health를 확인합니다." },
      { command: "pnpm tauri build --bundles app,dmg,nsis,msi,appimage", purpose: "Trusted workspace에서 desktop bundle target별 빌드를 검증합니다." },
      { command: "pnpm electron-builder --mac --win --linux", purpose: "Electron Builder packaging, signing, updater artifact 설정을 검증합니다." },
      { command: "wails build -platform darwin/universal,windows/amd64,linux/amd64", purpose: "Wails desktop target별 native bundle 생성을 검증합니다." },
      { command: "rg \"tauri.conf|capabilities|electron-builder|electron-forge|wails.json|updater|autoUpdater|notarize|codesign|entitlements\" .", purpose: "Desktop config, release, signing, permission evidence를 정적으로 찾습니다." }
    ],
    learnerNextSteps: [
      "Open Desktop Readiness and identify whether the project is Tauri, Electron, Wails, or another webview runtime.",
      "Start from tauri.conf.json, wails.json, electron-builder/Forge config, package main, or Cargo manifest before reading native code.",
      "Map native windows, tray/menu/dialog/protocol hooks, and IPC commands to frontend entrypoints.",
      "Review permissions, capabilities, CSP, entitlements, updater metadata, signing, notarization, and artifact upload before trusting a desktop release."
    ]
  };
}

type DesktopSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function desktopSourceFiles(walk: WalkResult): Promise<DesktopSourceFile[]> {
  const files: DesktopSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !desktopInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!desktopPathSignal(file.relPath) && !desktopContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function desktopInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return desktopPathSignal(filePath)
    || /(^|\/)(README|docs?|desktop|src-tauri|electron|wails|native|app|main|preload|commands?|capabilities|permissions|bundle|installer|installers?|release|releases?|sign|signing|notar|notarization|entitlements|scripts?|ci|workflows?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Cargo\.toml|tauri\.conf\.(json|json5)|wails\.json|electron-builder\.(ya?ml|json|js|cjs|mjs|ts)|forge\.config\.[cm]?[jt]s|electron\.vite\.config\.[cm]?[jt]s|entitlements\.plist)$/i.test(base);
}

function desktopPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(tauri\.conf\.(json|json5)|wails\.json|electron-builder\.(ya?ml|json|js|cjs|mjs|ts)|forge\.config\.[cm]?[jt]s|electron\.vite\.config\.[cm]?[jt]s|entitlements\.plist)$/i.test(base)
    || /(^|\/)(src-tauri|electron|desktop|capabilities|permissions)(\/|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath);
}

function desktopContentSignal(text: string): boolean {
  return /(tauri\.conf|@tauri-apps\/api|@tauri-apps\/cli|tauri::Builder|tauri::command|capabilities|createUpdaterArtifacts|TAURI_SIGNING|electron-builder|electron-forge|electron\.app|BrowserWindow|ipcMain|contextBridge|autoUpdater|electron-notarize|@electron\/notarize|wails\.json|wails\s+(dev|build)|github\.com\/wailsapp\/wails|Neutralino|WebView2|notariz|codesign|entitlements|hardenedRuntime)/i.test(text);
}

function desktopSetupFiles(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["desktopSetups"] {
  const rows: DesktopReadinessReport["desktopSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /tauri\.conf|wails\.json|electron-builder|electron-forge|forge\.config|package\.json|"main"\s*:|Cargo\.toml|frontendDist|devUrl|identifier/gi) + (/^(tauri\.conf\.(json|json5)|wails\.json|electron-builder\.(ya?ml|json|js|cjs|mjs|ts)|forge\.config\.[cm]?[jt]s|Cargo\.toml|package\.json)$/i.test(path.basename(source.filePath)) ? 1 : 0);
    const windowCount = countMatches(source.text, /window|BrowserWindow|WebviewWindow|WindowBuilder|tauri::Window|CreateWindow|frameless|transparent|decorations|resizable|alwaysOnTop|multiwindow|multi-window/gi);
    const commandCount = countMatches(source.text, /tauri::command|invoke\(|ipcMain|ipcRenderer|contextBridge|preload|WailsBind|runtime\.Events|frontend:|backend:/gi);
    const permissionCount = countMatches(source.text, /capabilities|permissions|allowlist|csp|Content-Security-Policy|entitlements|sandbox|shell\.open|fs:|path:|withGlobalTauri|__TAURI__/gi) + (/\/capabilities\//i.test(source.filePath) ? 1 : 0);
    const bundleCount = countMatches(source.text, /bundle|targets?|icons?|resources?|macOS|darwin|windows|linux|dmg|nsis|msi|appimage|deb|rpm|AppImage/gi);
    const updaterCount = countMatches(source.text, /updater|autoUpdater|createUpdaterArtifacts|latest\.json|pubkey|signature|TAURI_SIGNING_PRIVATE_KEY/gi);
    const signingCount = countMatches(source.text, /signing|codesign|notariz|hardenedRuntime|entitlements|certificate|APPLE_ID|APPLE_TEAM_ID|TAURI_SIGNING/gi);
    const platformCount = countMatches(source.text, /macOS|darwin|windows|linux|win32|nsis|msi|dmg|appimage|deb|rpm|universal|x64|arm64/gi);
    const packageCount = countMatches(source.text, /@tauri-apps\/(api|cli|plugin)|"tauri"|"electron"|"electron-builder"|"electron-forge"|"@electron\/notarize"|"wails"|github\.com\/wailsapp\/wails/gi);
    const totalSignals = configCount + windowCount + commandCount + permissionCount + bundleCount + updaterCount + signingCount + platformCount + packageCount;
    if (totalSignals === 0 && !desktopPathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      framework: desktopFramework(source),
      configCount,
      windowCount,
      commandCount,
      permissionCount,
      bundleCount,
      updaterCount,
      signingCount,
      platformCount,
      packageCount,
      readiness: totalSignals >= 7 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} desktop app signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.commandCount + b.permissionCount + b.bundleCount + b.updaterCount + b.signingCount;
    const aScore = a.configCount + a.commandCount + a.permissionCount + a.bundleCount + a.updaterCount + a.signingCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function desktopFramework(source: DesktopSourceFile): DesktopReadinessReport["desktopSetups"][number]["framework"] {
  if (/tauri\.conf|src-tauri|@tauri-apps|tauri::Builder|tauri::command|createUpdaterArtifacts/i.test(source.filePath) || /tauri\.conf|@tauri-apps|tauri::Builder|tauri::command|createUpdaterArtifacts/i.test(source.text)) return "tauri";
  if (/electron|BrowserWindow|ipcMain|contextBridge|electron-builder|electron-forge|autoUpdater/i.test(source.filePath) || /electron|BrowserWindow|ipcMain|contextBridge|electron-builder|electron-forge|autoUpdater/i.test(source.text)) return "electron";
  if (/wails\.json|wails|github\.com\/wailsapp\/wails/i.test(source.filePath) || /wails\.json|wails\s+(build|dev)|github\.com\/wailsapp\/wails/i.test(source.text)) return "wails";
  if (/neutralino|Neutralino/i.test(source.filePath) || /neutralino|Neutralino/i.test(source.text)) return "neutralino";
  if (/webview|WebView2|WKWebView/i.test(source.filePath) || /webview|WebView2|WKWebView/i.test(source.text)) return "desktop-webview";
  return "unknown";
}

function desktopFrameworkSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["frameworkSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["frameworkSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tauri", pattern: /tauri\.conf|src-tauri|@tauri-apps|tauri::Builder|tauri::command/i, evidence: "Tauri framework evidence was detected." },
    { signal: "electron", pattern: /electron|BrowserWindow|ipcMain|contextBridge/i, evidence: "Electron framework evidence was detected." },
    { signal: "wails", pattern: /wails\.json|wails\s+(build|dev)|github\.com\/wailsapp\/wails/i, evidence: "Wails framework evidence was detected." },
    { signal: "neutralino", pattern: /neutralino|Neutralino/i, evidence: "Neutralino framework evidence was detected." },
    { signal: "webview", pattern: /WebView2|WKWebView|webview/i, evidence: "desktop webview evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "framework", "signal");
}

function desktopConfigSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["configSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tauri-conf", pattern: /(^|\/)tauri\.conf\.(json|json5)$|tauri\.conf/i, evidence: "Tauri config evidence was detected." },
    { signal: "wails-json", pattern: /(^|\/)wails\.json$|"wails"/i, evidence: "Wails config evidence was detected." },
    { signal: "electron-builder", pattern: /electron-builder|(^|\/)electron-builder\.(ya?ml|json|js|cjs|mjs|ts)$/i, evidence: "electron-builder config evidence was detected." },
    { signal: "forge-config", pattern: /electron-forge|(^|\/)forge\.config\.[cm]?[jt]s$/i, evidence: "Electron Forge config evidence was detected." },
    { signal: "package-main", pattern: /"main"\s*:|app\.whenReady|BrowserWindow/i, evidence: "package main or Electron main entry evidence was detected." },
    { signal: "cargo-manifest", pattern: /(^|\/)Cargo\.toml$|\[package\]|tauri-build/i, evidence: "Cargo manifest evidence was detected." },
    { signal: "frontend-dist", pattern: /frontendDist|distDir|webDir|frontend:build|beforeBuildCommand/i, evidence: "frontend distribution evidence was detected." },
    { signal: "dev-url", pattern: /devUrl|frontend:dev|beforeDevCommand|localhost:\d+/i, evidence: "desktop dev URL evidence was detected." },
    { signal: "identifier", pattern: /identifier|bundleIdentifier|appId|com\.[A-Za-z0-9_.-]+/i, evidence: "desktop app identifier evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function desktopRuntimeSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["runtimeSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["runtimeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "window", pattern: /BrowserWindow|WebviewWindow|WindowBuilder|tauri::Window|window\s*:/i, evidence: "desktop window evidence was detected." },
    { signal: "multi-window", pattern: /multiwindow|multi-window|WebviewWindow::new|create_window|new BrowserWindow/i, evidence: "multi-window evidence was detected." },
    { signal: "tray", pattern: /SystemTray|tray|TrayIcon|Menu::new/i, evidence: "system tray evidence was detected." },
    { signal: "menu", pattern: /Menu|Submenu|menuBar|applicationMenu|setApplicationMenu/i, evidence: "native menu evidence was detected." },
    { signal: "dialog", pattern: /dialog|open_file|save_file|showOpenDialog|showSaveDialog/i, evidence: "native dialog evidence was detected." },
    { signal: "deep-link", pattern: /deep[-_ ]?link|single-instance|open-url|protocol/i, evidence: "deep link evidence was detected." },
    { signal: "file-association", pattern: /fileAssociations|file-associations|CFBundleDocumentTypes|documentTypes/i, evidence: "file association evidence was detected." },
    { signal: "custom-protocol", pattern: /customProtocol|protocol\.register|assetProtocol|wails:\/\/|tauri:\/\/|registerUriSchemeProtocol/i, evidence: "custom protocol evidence was detected." },
    { signal: "ipc", pattern: /tauri::command|invoke\(|ipcMain|ipcRenderer|contextBridge|preload|runtime\.Events|WailsBind/i, evidence: "IPC/command boundary evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "runtime", "signal");
}

function desktopPermissionSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["permissionSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["permissionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tauri-capabilities", pattern: /capabilities|capability|default\.json|permissions\/.*\.toml/i, evidence: "Tauri capability evidence was detected." },
    { signal: "permissions", pattern: /permissions|allow\(|deny\(|permission/i, evidence: "permission evidence was detected." },
    { signal: "csp", pattern: /csp|Content-Security-Policy|default-src|script-src/i, evidence: "CSP evidence was detected." },
    { signal: "allowlist", pattern: /allowlist|allowlist\s*:/i, evidence: "Tauri allowlist evidence was detected." },
    { signal: "entitlements", pattern: /entitlements|com\.apple\.security|Entitlements\.plist/i, evidence: "macOS entitlement evidence was detected." },
    { signal: "sandbox", pattern: /sandbox|app-sandbox|com\.apple\.security\.app-sandbox/i, evidence: "desktop sandbox evidence was detected." },
    { signal: "shell-open", pattern: /shell\.open|opener|openPath|openUrl|ShellExecute|openExternal/i, evidence: "shell/open external evidence was detected." },
    { signal: "fs-scope", pattern: /fs:|scope|readFile|writeFile|BaseDirectory|path:allow/i, evidence: "file-system scope evidence was detected." },
    { signal: "global-tauri", pattern: /withGlobalTauri|__TAURI__/i, evidence: "global Tauri bridge evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "permission", "signal");
}

function desktopBundleSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["bundleSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["bundleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "bundle-targets", pattern: /bundle|targets?|bundles?|package\s*:|makers\s*:/i, evidence: "bundle target evidence was detected." },
    { signal: "icons", pattern: /icons?|icon\.(icns|ico|png)|\.icns|\.ico/i, evidence: "desktop icon evidence was detected." },
    { signal: "resources", pattern: /resources?|extraResources|externalBin|assetDir/i, evidence: "bundled resource evidence was detected." },
    { signal: "macos", pattern: /macOS|darwin|osx|app bundle|\.app/i, evidence: "macOS bundle evidence was detected." },
    { signal: "windows", pattern: /windows|win32|win-|\.exe|nsis|msi/i, evidence: "Windows bundle evidence was detected." },
    { signal: "linux", pattern: /linux|AppImage|deb|rpm|\.desktop/i, evidence: "Linux bundle evidence was detected." },
    { signal: "dmg", pattern: /\bdmg\b|\.dmg/i, evidence: "DMG evidence was detected." },
    { signal: "nsis", pattern: /\bnsis\b|Nullsoft/i, evidence: "NSIS installer evidence was detected." },
    { signal: "appimage", pattern: /AppImage|appimage/i, evidence: "AppImage evidence was detected." },
    { signal: "msi", pattern: /\bmsi\b|WiX/i, evidence: "MSI installer evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "bundle", "signal");
}

function desktopReleaseSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["releaseSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["releaseSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "updater", pattern: /updater|autoUpdater|checkForUpdates|latest\.json/i, evidence: "desktop updater evidence was detected." },
    { signal: "updater-artifacts", pattern: /createUpdaterArtifacts|\.sig|signature|pubkey|TAURI_SIGNING_PRIVATE_KEY/i, evidence: "updater artifact/signature evidence was detected." },
    { signal: "signing", pattern: /signing|codesign|certificate|CSC_LINK|TAURI_SIGNING|APPLE_CERTIFICATE/i, evidence: "code-signing evidence was detected." },
    { signal: "notarization", pattern: /notariz|notarytool|@electron\/notarize|electron-notarize|APPLE_ID|APPLE_TEAM_ID/i, evidence: "notarization evidence was detected." },
    { signal: "hardened-runtime", pattern: /hardenedRuntime|hardened runtime|com\.apple\.security\.cs/i, evidence: "hardened runtime evidence was detected." },
    { signal: "ci-build", pattern: /(^|\/)\.github\/workflows\/[^/]+\.ya?ml[\s\S]*(tauri|electron|wails|desktop|notariz|codesign)|CI[\s\S]*(tauri|electron|wails)/i, evidence: "desktop CI build evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|actions\/upload-release-asset|gh release upload|softprops\/action-gh-release/i, evidence: "release artifact upload evidence was detected." },
    { signal: "release-draft", pattern: /draft release|release draft|generate release|create-release|action-gh-release/i, evidence: "release drafting evidence was detected." },
    { signal: "version-sync", pattern: /version\s*:|"version"\s*:|package\.json|Cargo\.toml|tauri\.conf|wails\.json/i, evidence: "version metadata evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "release", "signal");
}

function desktopPackageSignals(sourceFiles: DesktopSourceFile[]): DesktopReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DesktopReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tauri-cli", pattern: /@tauri-apps\/cli|cargo tauri|tauri\s+(dev|build|info)/i, evidence: "Tauri CLI evidence was detected." },
    { signal: "tauri-api", pattern: /@tauri-apps\/api|window\.__TAURI__|from ['"]@tauri-apps/i, evidence: "Tauri API evidence was detected." },
    { signal: "tauri-plugin", pattern: /@tauri-apps\/plugin-|tauri-plugin-|plugin:|\.plugin\(/i, evidence: "Tauri plugin evidence was detected." },
    { signal: "electron", pattern: /"electron"|from ['"]electron['"]|require\(['"]electron['"]\)/i, evidence: "Electron package evidence was detected." },
    { signal: "electron-builder", pattern: /"electron-builder"|electron-builder/i, evidence: "electron-builder package evidence was detected." },
    { signal: "electron-forge", pattern: /"@electron-forge|electron-forge|forge\.config/i, evidence: "Electron Forge package evidence was detected." },
    { signal: "electron-notarize", pattern: /"@electron\/notarize"|"electron-notarize"|@electron\/notarize|electron-notarize/i, evidence: "Electron notarize package evidence was detected." },
    { signal: "wails", pattern: /github\.com\/wailsapp\/wails|wails\.json|wails\s+(build|dev)/i, evidence: "Wails package evidence was detected." },
    { signal: "wails-cli", pattern: /wails\s+(doctor|dev|build|generate)|wails\.io\/docs/i, evidence: "Wails CLI evidence was detected." }
  ];
  return desktopSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function desktopSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DesktopSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/desktop-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

export async function buildEdgeReadinessReport(walk: WalkResult): Promise<EdgeReadinessReport> {
  const sourceFiles = await edgeSourceFiles(walk);
  const edgeSetups = edgeSetupFiles(sourceFiles);
  const configSignals = edgeConfigSignals(sourceFiles);
  const handlerSignals = edgeHandlerSignals(sourceFiles);
  const bindingSignals = edgeBindingSignals(sourceFiles);
  const routingSignals = edgeRoutingSignals(sourceFiles);
  const devSignals = edgeDevSignals(sourceFiles);
  const deploymentSignals = edgeDeploymentSignals(sourceFiles);
  const observabilitySignals = edgeObservabilitySignals(sourceFiles);
  const packageSignals = edgePackageSignals(sourceFiles);

  const hasConfig = edgeSetups.length > 0 || configSignals.some((item) => item.readiness === "ready");
  const hasHandler = handlerSignals.some((item) => item.readiness === "ready") || edgeSetups.some((item) => item.handlerCount > 0);
  const hasDev = devSignals.some((item) => item.readiness === "ready") || edgeSetups.some((item) => item.devWorkflowCount > 0);
  const hasDeploy = deploymentSignals.some((item) => item.signal === "wrangler-deploy" && item.readiness === "ready") || edgeSetups.some((item) => item.deploymentWorkflowCount > 0);
  const hasObservability = observabilitySignals.some((item) => item.readiness === "ready") || edgeSetups.some((item) => item.observabilityCount > 0);

  const riskQueue: EdgeReadinessReport["riskQueue"] = [];
  if (!hasConfig) {
    riskQueue.push({
      priority: "high",
      action: "Add a Cloudflare Workers inventory if this project owns edge runtime code.",
      why: "Workers readiness starts from Wrangler config, compatibility date, entry point, routes, bindings, and environment-specific settings.",
      relatedHref: "html/edge-readiness.html"
    });
  }
  if (hasConfig && !hasHandler) {
    riskQueue.push({
      priority: "high",
      action: "Document the module Worker handlers that receive edge traffic or background events.",
      why: "A Worker without visible fetch, scheduled, queue, email, Durable Object, or Workflow handlers is hard to explain or smoke test.",
      relatedHref: "html/edge-readiness.html"
    });
  }
  if (hasConfig && !hasDev) {
    riskQueue.push({
      priority: "medium",
      action: "Add local edge development and test commands before changing runtime behavior.",
      why: "Wrangler dev, .dev.vars, Miniflare, type generation, or the Workers Vitest pool make edge behavior reproducible without deploying.",
      relatedHref: "html/edge-readiness.html"
    });
  }
  if (hasConfig && !hasDeploy) {
    riskQueue.push({
      priority: "medium",
      action: "Record deploy, version, secret, KV, R2, D1, or CI commands for edge operations.",
      why: "Workers changes usually span config and account resources; repeatable commands avoid guessing at deploy time.",
      relatedHref: "html/edge-readiness.html"
    });
  }
  if (hasConfig && !hasObservability) {
    riskQueue.push({
      priority: "low",
      action: "Document tailing, logs, traces, console instrumentation, or analytics signals.",
      why: "Edge failures are often environment-specific; observability evidence helps learners connect a request to runtime behavior.",
      relatedHref: "html/edge-readiness.html"
    });
  }

  return {
    summary: `Cloudflare Workers-style edge readiness report: setup ${edgeSetups.length}개, config signal ${configSignals.length}개, handler signal ${handlerSignals.length}개, binding signal ${bindingSignals.length}개, deployment signal ${deploymentSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Cloudflare Workers wrangler.toml compatibility_date main fetch handler bindings kv_namespaces r2_buckets d1_databases durable_objects queues services vars routes workers_dev wrangler dev deploy tail secret Miniflare vitest-pool-workers",
    edgeSetups,
    configSignals,
    handlerSignals,
    bindingSignals,
    routingSignals,
    devSignals,
    deploymentSignals,
    observabilitySignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "wrangler dev --local", purpose: "Run a local Workers simulation after config, bindings, and .dev.vars are reviewed." },
      { command: "wrangler types", purpose: "Generate Worker binding types so env usage matches the Wrangler configuration." },
      { command: "wrangler deploy", purpose: "Deploy the Worker only after compatibility date, routes, bindings, secrets, and account scope are confirmed." },
      { command: "wrangler tail", purpose: "Tail deployed Worker events after a controlled smoke test." },
      { command: "wrangler secret list", purpose: "Review configured secret names without exposing secret values." }
    ],
    learnerNextSteps: [
      "Open Edge Readiness and identify the Wrangler configuration file first.",
      "Confirm name, main, compatibility_date, compatibility_flags, env blocks, vars, and routes before reading handlers.",
      "Map every KV, R2, D1, Durable Object, Queue, service, workflow, analytics, or secret binding to its code usage.",
      "Review local dev, typegen, deploy, tail, and resource commands before trusting an edge release path."
    ]
  };
}

type EdgeSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function edgeSourceFiles(walk: WalkResult): Promise<EdgeSourceFile[]> {
  const files: EdgeSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !edgeInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath);
    if (!text) continue;
    if (!edgePathSignal(file.relPath) && !edgeContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return files;
}

function edgeInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return edgePathSignal(filePath)
    || /(^|\/)(README|docs?|src|workers?|cloudflare|edge|functions?|routes?|assets?|bindings?|scripts?|ci|workflows?|test|tests)(\/|\.|-|_|$)/i.test(filePath)
    || /^(package\.json|Makefile|Taskfile\.ya?ml|justfile|vitest\.config\.[cm]?[jt]s|tsconfig\.json)$/i.test(base);
}

function edgePathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^wrangler\.(toml|json|jsonc)$/i.test(base)
    || /^\.dev\.vars(\..+)?$/i.test(base)
    || /^vitest\.config\.[cm]?[jt]s$/i.test(base)
    || /(^|\/)\.github\/workflows\/.*\.(ya?ml)$/i.test(filePath)
    || /(^|\/)(workers|cloudflare|edge|functions)(\/|$)/i.test(filePath);
}

function edgeContentSignal(text: string): boolean {
  return /(Cloudflare Workers|wrangler\.(toml|json|jsonc)|compatibility_date|workers_dev|kv_namespaces|r2_buckets|d1_databases|durable_objects|queues|services|workflows|analytics_engine|export\s+default\s*\{|async\s+fetch\s*\(|fetch\s*\(\s*request|DurableObject|KVNamespace|R2Bucket|D1Database|wrangler\s+(dev|deploy|tail|secret|kv|r2|d1|versions|types)|Miniflare|@cloudflare\/vitest-pool-workers|@cloudflare\/workers-types)/i.test(text);
}

function edgeSetupFiles(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["edgeSetups"] {
  const rows: EdgeReadinessReport["edgeSetups"] = [];
  for (const source of sourceFiles) {
    const configCount = countMatches(source.text, /(^|\n)\s*(name|main|compatibility_date|compatibility_flags|compatibility_flags|account_id|env|vars|limits)\s*[=:]|"compatibility_date"\s*:|"main"\s*:|"name"\s*:/gi) + (/^wrangler\.(toml|json|jsonc)$/i.test(path.basename(source.filePath)) ? 1 : 0);
    const handlerCount = countMatches(source.text, /export\s+default\s*\{|async\s+fetch\s*\(|fetch\s*\(\s*request|scheduled\s*\(|queue\s*\(|email\s*\(|class\s+\w+\s+extends\s+DurableObject|WorkflowEntrypoint|assets?\s*:/gi);
    const bindingCount = countMatches(source.text, /kv_namespaces|KVNamespace|r2_buckets|R2Bucket|d1_databases|D1Database|durable_objects|DurableObject(Namespace)?|queues|Queue<|services|Service<|workflows|Workflow<|analytics_engine|AnalyticsEngineDataset|secrets?|Secret/gi);
    const routingCount = countMatches(source.text, /workers_dev|routes?\s*[=:]|custom_domain|zone_name|pattern\s*[=:]|assets\s*[=:]|site\s*[=:]|migrations\s*[=:]|placement\s*[=:]/gi);
    const devWorkflowCount = countMatches(source.text, /wrangler\s+dev|--local|--remote|\.dev\.vars|Miniflare|@cloudflare\/vitest-pool-workers|wrangler\s+types|typegen/gi);
    const deploymentWorkflowCount = countMatches(source.text, /wrangler\s+(deploy|versions|tail|secret|kv|r2|d1)|CLOUDFLARE_API_TOKEN|cloudflare\/wrangler-action/gi);
    const observabilityCount = countMatches(source.text, /wrangler\s+tail|console\.(log|warn|error|info)|logs?|traces?|analytics_engine|version_metadata|Workers Logs/gi);
    const packageCount = countMatches(source.text, /"wrangler"|"@cloudflare\/workers-types"|"miniflare"|"@cloudflare\/vitest-pool-workers"|"vite-plugin-cloudflare"|"@cloudflare\/kv-asset-handler"|workers-tsconfig/gi);
    const totalSignals = configCount + handlerCount + bindingCount + routingCount + devWorkflowCount + deploymentWorkflowCount + observabilityCount + packageCount;
    if (totalSignals === 0 && !edgePathSignal(source.filePath)) continue;
    rows.push({
      filePath: source.filePath,
      platform: edgePlatform(source),
      configCount,
      handlerCount,
      bindingCount,
      routingCount,
      devWorkflowCount,
      deploymentWorkflowCount,
      observabilityCount,
      packageCount,
      readiness: totalSignals >= 5 ? "ready" : totalSignals > 0 ? "partial" : "missing",
      evidence: `${totalSignals} edge runtime signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows.sort((a, b) => {
    const bScore = b.configCount + b.handlerCount + b.bindingCount + b.deploymentWorkflowCount;
    const aScore = a.configCount + a.handlerCount + a.bindingCount + a.deploymentWorkflowCount;
    return bScore - aScore || a.filePath.localeCompare(b.filePath);
  }).slice(0, 60);
}

function edgePlatform(source: EdgeSourceFile): EdgeReadinessReport["edgeSetups"][number]["platform"] {
  if (/Miniflare|"miniflare"/i.test(source.text) || /miniflare/i.test(source.filePath)) return "miniflare";
  if (/wrangler\.(toml|json|jsonc)$/i.test(source.filePath) || /wrangler\s+(dev|deploy|tail|secret|kv|r2|d1|types)|"wrangler"/i.test(source.text)) return "cloudflare-workers";
  if (/functions(\/|$)|Pages Functions|pages_build_output_dir/i.test(source.filePath) || /Pages Functions|pages_build_output_dir/i.test(source.text)) return "pages-functions";
  if (/Cloudflare Workers|KVNamespace|R2Bucket|D1Database|DurableObject/i.test(source.text)) return "cloudflare-workers";
  return "unknown";
}

function edgeConfigSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["configSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["configSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wrangler-toml", pattern: /(^|\/)wrangler\.toml$/i, evidence: "wrangler.toml evidence was detected." },
    { signal: "wrangler-json", pattern: /(^|\/)wrangler\.(json|jsonc)$/i, evidence: "wrangler JSON/JSONC evidence was detected." },
    { signal: "name", pattern: /(^|\n)\s*name\s*=|"name"\s*:/i, evidence: "Worker name evidence was detected." },
    { signal: "main", pattern: /(^|\n)\s*main\s*=|"main"\s*:/i, evidence: "Worker entry point evidence was detected." },
    { signal: "compatibility-date", pattern: /compatibility_date|"compatibility_date"/i, evidence: "compatibility date evidence was detected." },
    { signal: "compatibility-flags", pattern: /compatibility_flags|"compatibility_flags"/i, evidence: "compatibility flags evidence was detected." },
    { signal: "env", pattern: /(^|\n)\s*\[env\.|(^|\n)\s*env\s*=|"env"\s*:/i, evidence: "environment block evidence was detected." },
    { signal: "vars", pattern: /(^|\n)\s*\[vars\]|(^|\n)\s*vars\s*=|"vars"\s*:/i, evidence: "vars evidence was detected." },
    { signal: "limits", pattern: /(^|\n)\s*\[limits\]|limits\s*=|"limits"\s*:/i, evidence: "limits evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "config", "signal");
}

function edgeHandlerSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["handlerSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["handlerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "module-worker", pattern: /export\s+default\s*\{/i, evidence: "module Worker export evidence was detected." },
    { signal: "fetch-handler", pattern: /async\s+fetch\s*\(|fetch\s*\(\s*request|addEventListener\s*\(\s*["']fetch/i, evidence: "fetch handler evidence was detected." },
    { signal: "scheduled", pattern: /scheduled\s*\(\s*(controller|event)|ScheduledController|cron_triggers/i, evidence: "scheduled handler evidence was detected." },
    { signal: "queue-handler", pattern: /queue\s*\(\s*batch|MessageBatch|queues?\s*[=:]/i, evidence: "queue handler evidence was detected." },
    { signal: "durable-object-class", pattern: /class\s+\w+\s+extends\s+DurableObject|DurableObjectNamespace|durable_objects/i, evidence: "Durable Object evidence was detected." },
    { signal: "workflow-class", pattern: /WorkflowEntrypoint|workflows?\s*[=:]/i, evidence: "Workflow evidence was detected." },
    { signal: "email-handler", pattern: /email\s*\(\s*message|EmailMessage|send_email/i, evidence: "email handler evidence was detected." },
    { signal: "assets-worker", pattern: /assets\s*[=:]|ASSETS|kv-asset-handler/i, evidence: "static assets Worker evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "handler", "signal");
}

function edgeBindingSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["bindingSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["bindingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "kv", pattern: /kv_namespaces|KVNamespace|\bKV\b/i, evidence: "KV binding evidence was detected." },
    { signal: "r2", pattern: /r2_buckets|R2Bucket|\bR2\b/i, evidence: "R2 binding evidence was detected." },
    { signal: "d1", pattern: /d1_databases|D1Database|\bD1\b/i, evidence: "D1 binding evidence was detected." },
    { signal: "durable-objects", pattern: /durable_objects|DurableObject(Namespace)?|migrations\s*[=:]/i, evidence: "Durable Objects evidence was detected." },
    { signal: "queues", pattern: /queues?\s*[=:]|Queue<|MessageBatch/i, evidence: "Queues evidence was detected." },
    { signal: "services", pattern: /services?\s*[=:]|Service</i, evidence: "service binding evidence was detected." },
    { signal: "workflows", pattern: /workflows?\s*[=:]|Workflow</i, evidence: "workflow binding evidence was detected." },
    { signal: "analytics-engine", pattern: /analytics_engine|AnalyticsEngineDataset/i, evidence: "Analytics Engine evidence was detected." },
    { signal: "secrets", pattern: /wrangler\s+secret|Secret|secrets?|\.dev\.vars/i, evidence: "secret binding evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "binding", "signal");
}

function edgeRoutingSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["routingSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["routingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "workers-dev", pattern: /workers_dev/i, evidence: "workers.dev routing evidence was detected." },
    { signal: "route", pattern: /(^|\n)\s*route\s*=|"route"\s*:/i, evidence: "single route evidence was detected." },
    { signal: "routes", pattern: /(^|\n)\s*routes\s*=|"routes"\s*:/i, evidence: "routes array evidence was detected." },
    { signal: "custom-domain", pattern: /custom_domain|custom_domain\s*=|"custom_domain"\s*:/i, evidence: "custom domain evidence was detected." },
    { signal: "assets", pattern: /assets\s*[=:]|assets\.binding|assets\.directory/i, evidence: "assets routing evidence was detected." },
    { signal: "site", pattern: /(^|\n)\s*\[site\]|site\s*=|"site"\s*:/i, evidence: "site/static asset evidence was detected." },
    { signal: "durable-object-migrations", pattern: /migrations\s*[=:]|new_sqlite_classes|new_classes|deleted_classes|renamed_classes/i, evidence: "Durable Object migration evidence was detected." },
    { signal: "placement", pattern: /placement\s*[=:]|smart_placement/i, evidence: "placement evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "routing", "signal");
}

function edgeDevSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["devSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["devSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wrangler-dev", pattern: /wrangler\s+dev/i, evidence: "wrangler dev evidence was detected." },
    { signal: "local-mode", pattern: /--local|local_protocol|local_ip/i, evidence: "local mode evidence was detected." },
    { signal: "remote-bindings", pattern: /--remote|remote\s*=\s*true|remote:\s*true/i, evidence: "remote binding development evidence was detected." },
    { signal: "dev-vars", pattern: /\.dev\.vars/i, evidence: ".dev.vars evidence was detected." },
    { signal: "miniflare", pattern: /Miniflare|"miniflare"/i, evidence: "Miniflare evidence was detected." },
    { signal: "vitest-pool-workers", pattern: /@cloudflare\/vitest-pool-workers|defineWorkersConfig/i, evidence: "Workers Vitest pool evidence was detected." },
    { signal: "typegen", pattern: /wrangler\s+types|typegen|worker-configuration\.d\.ts/i, evidence: "Worker type generation evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "dev", "signal");
}

function edgeDeploymentSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["deploymentSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["deploymentSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wrangler-deploy", pattern: /wrangler\s+deploy/i, evidence: "wrangler deploy evidence was detected." },
    { signal: "wrangler-versions", pattern: /wrangler\s+versions/i, evidence: "wrangler versions evidence was detected." },
    { signal: "wrangler-tail", pattern: /wrangler\s+tail/i, evidence: "wrangler tail evidence was detected." },
    { signal: "wrangler-secret", pattern: /wrangler\s+secret/i, evidence: "wrangler secret evidence was detected." },
    { signal: "wrangler-kv", pattern: /wrangler\s+kv/i, evidence: "wrangler KV command evidence was detected." },
    { signal: "wrangler-r2", pattern: /wrangler\s+r2/i, evidence: "wrangler R2 command evidence was detected." },
    { signal: "wrangler-d1", pattern: /wrangler\s+d1/i, evidence: "wrangler D1 command evidence was detected." },
    { signal: "ci-deploy", pattern: /CLOUDFLARE_API_TOKEN|cloudflare\/wrangler-action|wrangler-action/i, evidence: "CI deploy evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "deployment", "signal");
}

function edgeObservabilitySignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["observabilitySignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["observabilitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tail", pattern: /wrangler\s+tail/i, evidence: "tailing evidence was detected." },
    { signal: "logs", pattern: /Workers Logs|logs?\s*[=:]|wrangler\s+tail/i, evidence: "logs evidence was detected." },
    { signal: "console", pattern: /console\.(log|warn|error|info)/i, evidence: "console instrumentation evidence was detected." },
    { signal: "traces", pattern: /traces?|Trace Events|Workers Trace/i, evidence: "trace evidence was detected." },
    { signal: "analytics-engine", pattern: /analytics_engine|AnalyticsEngineDataset/i, evidence: "Analytics Engine observability evidence was detected." },
    { signal: "version-metadata", pattern: /version_metadata|VersionMetadata/i, evidence: "version metadata evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "observability", "signal");
}

function edgePackageSignals(sourceFiles: EdgeSourceFile[]): EdgeReadinessReport["packageSignals"] {
  const specs: Array<{ signal: EdgeReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "wrangler", pattern: /"wrangler"|wrangler\s+(dev|deploy|tail|secret|kv|r2|d1|types)/i, evidence: "Wrangler package/command evidence was detected." },
    { signal: "cloudflare-workers-types", pattern: /"@cloudflare\/workers-types"|KVNamespace|R2Bucket|D1Database/i, evidence: "Workers types evidence was detected." },
    { signal: "miniflare", pattern: /"miniflare"|Miniflare/i, evidence: "Miniflare evidence was detected." },
    { signal: "vitest-pool-workers", pattern: /"@cloudflare\/vitest-pool-workers"|@cloudflare\/vitest-pool-workers/i, evidence: "Workers Vitest pool evidence was detected." },
    { signal: "vite-plugin-cloudflare", pattern: /"vite-plugin-cloudflare"|vite-plugin-cloudflare/i, evidence: "Vite Cloudflare plugin evidence was detected." },
    { signal: "workers-tsconfig", pattern: /workers-tsconfig|worker-configuration\.d\.ts/i, evidence: "Workers tsconfig/typegen evidence was detected." },
    { signal: "kv-asset-handler", pattern: /"@cloudflare\/kv-asset-handler"|kv-asset-handler/i, evidence: "KV asset handler evidence was detected." }
  ];
  return edgeSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function edgeSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: EdgeSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/edge-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}
