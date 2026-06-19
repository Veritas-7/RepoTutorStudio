// biome-ignore-all lint/suspicious/noTemplateCurlyInString: test fixtures assert literal template syntax from source snapshots.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runStudy } from "../index.js";

const fixtureRoot = path.resolve("packages/core/tests/fixtures/simple-ts-app");

describe("RepoTutor core pipeline - langchain-core-readiness", () => {
  it("detects Expo mobile readiness in app config and EAS profiles", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mobile-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-mobile-source-"));
    await fs.mkdir(path.join(sourceRoot, "app"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "assets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "ios"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "android", "app", "src", "main"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "mobile-demo",
      version: "1.0.0",
      main: "expo-router/entry",
      scripts: {
        start: "expo start --dev-client",
        android: "expo run:android",
        ios: "expo run:ios",
        web: "expo start --web",
        "build:android": "eas build --platform android",
        "build:ios": "eas build --platform ios",
        update: "eas update --branch production"
      },
      dependencies: {
        expo: "~56.0.0",
        "expo-dev-client": "~6.0.0",
        "expo-router": "~6.0.0",
        "expo-updates": "~30.0.0",
        react: "19.0.0",
        "react-native": "0.86.0",
        "react-native-web": "^0.21.0"
      },
      devDependencies: {
        "eas-cli": "latest",
        "@expo/metro-config": "^0.22.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "app.json"), JSON.stringify({
      expo: {
        name: "Mobile Demo",
        slug: "mobile-demo",
        version: "1.0.0",
        orientation: "portrait",
        icon: "./assets/icon.png",
        scheme: "mobile-demo",
        ios: { bundleIdentifier: "com.example.mobiledemo", supportsTablet: true },
        android: {
          package: "com.example.mobiledemo",
          permissions: ["CAMERA"],
          adaptiveIcon: {
            foregroundImage: "./assets/adaptive-icon.png",
            backgroundColor: "#ffffff"
          }
        },
        web: { bundler: "metro", favicon: "./assets/favicon.png" },
        plugins: ["expo-router", "expo-dev-client", "expo-updates", ["expo-splash-screen", { image: "./assets/splash.png" }]],
        updates: { url: "https://u.expo.dev/demo" },
        runtimeVersion: { policy: "appVersion" },
        experiments: { typedRoutes: true },
        extra: { eas: { projectId: "00000000-0000-0000-0000-000000000000" } }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "eas.json"), JSON.stringify({
      cli: { version: ">= 13.0.0", appVersionSource: "remote" },
      build: {
        development: { developmentClient: true, distribution: "internal" },
        production: { autoIncrement: true, channel: "production" }
      },
      submit: { production: {} }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "app", "_layout.tsx"), "import { Stack } from 'expo-router';\nexport default function RootLayout() { return <Stack />; }\n");
    await fs.writeFile(path.join(sourceRoot, "ios", "Info.plist"), "<plist><dict><key>NSCameraUsageDescription</key><string>Scan examples</string></dict></plist>\n");
    await fs.writeFile(path.join(sourceRoot, "android", "app", "src", "main", "AndroidManifest.xml"), "<manifest xmlns:android=\"http://schemas.android.com/apk/res/android\"><uses-permission android:name=\"android.permission.CAMERA\" /></manifest>\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "eas.yml"), "name: eas\non: [push]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - run: eas build --platform all --non-interactive\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "mobile-readiness-report.json"), "utf8")) as {
      mobileSetups: Array<{ filePath: string; framework: string; appConfigCount: number; platformCount: number; buildProfileCount: number; updateCount: number; assetCount: number; permissionCount: number; commandCount: number; packageCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      platformSignals: Array<{ signal: string; readiness: string }>;
      navigationSignals: Array<{ signal: string; readiness: string }>;
      buildSignals: Array<{ signal: string; readiness: string }>;
      updateSignals: Array<{ signal: string; readiness: string }>;
      assetSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const appSetup = report.mobileSetups.find((item) => item.filePath === "app.json");
    const easSetup = report.mobileSetups.find((item) => item.filePath === "eas.json");
    expect(report.mobileSetups.length).toBeGreaterThan(0);
    expect(appSetup?.framework).toBe("expo");
    expect(appSetup?.appConfigCount).toBeGreaterThan(0);
    expect(appSetup?.platformCount).toBeGreaterThan(0);
    expect(appSetup?.updateCount).toBeGreaterThan(0);
    expect(appSetup?.assetCount).toBeGreaterThan(0);
    expect(appSetup?.permissionCount).toBeGreaterThan(0);
    expect(easSetup?.framework).toBe("eas");
    expect(easSetup?.buildProfileCount).toBeGreaterThan(0);
    expect(report.mobileSetups.some((item) => item.commandCount > 0)).toBe(true);
    expect(report.mobileSetups.some((item) => item.packageCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "app-json" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "plugins" && item.readiness === "ready")).toBe(true);
    expect(report.platformSignals.some((item) => item.signal === "bundle-identifier" && item.readiness === "ready")).toBe(true);
    expect(report.platformSignals.some((item) => item.signal === "permissions" && item.readiness === "ready")).toBe(true);
    expect(report.navigationSignals.some((item) => item.signal === "expo-router" && item.readiness === "ready")).toBe(true);
    expect(report.navigationSignals.some((item) => item.signal === "typed-routes" && item.readiness === "ready")).toBe(true);
    expect(report.buildSignals.some((item) => item.signal === "eas-json" && item.readiness === "ready")).toBe(true);
    expect(report.buildSignals.some((item) => item.signal === "run-ios" && item.readiness === "ready")).toBe(true);
    expect(report.updateSignals.some((item) => item.signal === "runtime-version" && item.readiness === "ready")).toBe(true);
    expect(report.updateSignals.some((item) => item.signal === "eas-update" && item.readiness === "ready")).toBe(true);
    expect(report.assetSignals.some((item) => item.signal === "adaptive-icon" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "expo-dev-client" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "mobile-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "mobile-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Tauri desktop readiness without running native build tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-desktop-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-desktop-source-"));
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "capabilities"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "permissions"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src-tauri", "icons"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "electron"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "desktop"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "desktop-demo",
      version: "1.0.0",
      main: "electron/main.js",
      scripts: {
        "tauri:dev": "tauri dev",
        "tauri:info": "tauri info",
        "tauri:build": "tauri build --bundles app,dmg,nsis,msi,appimage",
        "electron:build": "electron-builder --mac --win --linux",
        "wails:build": "wails build -platform darwin/universal,windows/amd64,linux/amd64"
      },
      dependencies: {
        "@tauri-apps/api": "^2.0.0",
        "@tauri-apps/plugin-opener": "^2.0.0",
        "@tauri-apps/plugin-updater": "^2.0.0",
        electron: "^35.0.0",
        wails: "^3.0.0"
      },
      devDependencies: {
        "@tauri-apps/cli": "^2.0.0",
        "electron-builder": "^26.0.0",
        "electron-forge": "^7.0.0",
        "@electron/notarize": "^3.0.0"
      },
      build: {
        appId: "com.example.desktopdemo",
        mac: { target: ["dmg"], hardenedRuntime: true, entitlements: "build/entitlements.plist" },
        win: { target: ["nsis", "msi"] },
        linux: { target: ["AppImage", "deb"] },
        publish: ["github"]
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "tauri.conf.json"), JSON.stringify({
      productName: "Desktop Demo",
      version: "1.0.0",
      identifier: "com.example.desktopdemo",
      build: {
        beforeDevCommand: "pnpm dev",
        beforeBuildCommand: "pnpm build",
        devUrl: "http://localhost:5173",
        frontendDist: "../dist"
      },
      app: {
        withGlobalTauri: true,
        security: { csp: "default-src 'self'" },
        windows: [{ label: "main", title: "Desktop Demo", width: 1200, height: 800, resizable: true }]
      },
      bundle: {
        active: true,
        targets: ["app", "dmg", "nsis", "msi", "appimage"],
        icon: ["icons/icon.icns", "icons/icon.ico", "icons/icon.png"],
        resources: ["resources/**"],
        fileAssociations: [{ ext: ["demo"], name: "Desktop Demo Document" }],
        macOS: { hardenedRuntime: true, entitlements: "Entitlements.plist" },
        windows: { nsis: { installerIcon: "icons/icon.ico" } },
        linux: { appimage: { bundleMediaFramework: true } }
      },
      plugins: {
        updater: {
          active: true,
          endpoints: ["https://example.com/latest.json"],
          pubkey: "TAURI_PUBKEY",
          createUpdaterArtifacts: true
        },
        opener: {}
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "Cargo.toml"), [
      "[package]",
      "name = \"desktop-demo\"",
      "version = \"1.0.0\"",
      "[build-dependencies]",
      "tauri-build = \"2\"",
      "[dependencies]",
      "tauri = { version = \"2\", features = [\"tray-icon\", \"devtools\"] }",
      "tauri-plugin-opener = \"2\"",
      "tauri-plugin-updater = \"2\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "src", "main.rs"), [
      "#[tauri::command]",
      "fn greet(name: String) -> String { format!(\"Hello {name}\") }",
      "fn main() {",
      "  tauri::Builder::default()",
      "    .plugin(tauri_plugin_opener::init())",
      "    .invoke_handler(tauri::generate_handler![greet])",
      "    .setup(|app| { let _ = app.handle(); Ok(()) })",
      "    .run(tauri::generate_context!())",
      "    .expect(\"error while running tauri application\");",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "capabilities", "default.json"), JSON.stringify({
      identifier: "default",
      windows: ["main"],
      permissions: [
        "core:default",
        "opener:allow-open-url",
        "updater:allow-check",
        "updater:allow-download-and-install",
        "fs:allow-read-text-file"
      ]
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "permissions", "fs.toml"), "identifier = \"fs-scope\"\ndescription = \"allow scoped read\"\ncommands.allow = [\"read_text_file\"]\n");
    await fs.writeFile(path.join(sourceRoot, "src-tauri", "Entitlements.plist"), "<plist><dict><key>com.apple.security.app-sandbox</key><true/><key>com.apple.security.cs.allow-jit</key><true/></dict></plist>\n");
    await fs.writeFile(path.join(sourceRoot, "electron", "main.js"), [
      "const { app, BrowserWindow, ipcMain, Menu, Tray, dialog, protocol, shell } = require('electron');",
      "const { autoUpdater } = require('electron-updater');",
      "let tray;",
      "function createWindow() {",
      "  tray = new Tray('icon.png');",
      "  const win = new BrowserWindow({ webPreferences: { preload: __dirname + '/preload.js', contextIsolation: true, sandbox: true }});",
      "  win.loadURL('app://index.html');",
      "  autoUpdater.checkForUpdatesAndNotify();",
      "  shell.openExternal('https://example.com');",
      "}",
      "app.whenReady().then(() => { protocol.registerFileProtocol('app', () => {}); Menu.setApplicationMenu(Menu.buildFromTemplate([])); createWindow(); });",
      "ipcMain.handle('dialog:open', () => dialog.showOpenDialog({}));"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "electron", "preload.js"), [
      "const { contextBridge, ipcRenderer } = require('electron');",
      "contextBridge.exposeInMainWorld('desktopApi', { open: () => ipcRenderer.invoke('dialog:open') });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "wails.json"), JSON.stringify({
      name: "Desktop Demo",
      outputfilename: "desktop-demo",
      "frontend:install": "pnpm install",
      "frontend:build": "pnpm build",
      "frontend:dev:watcher": "pnpm dev",
      author: { name: "RepoTutor" }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "desktop", "README.md"), "Desktop deep-link protocol and file-associations notes for Tauri, Electron, and Wails packaging.\n");
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "desktop.yml"), [
      "name: desktop",
      "on: [push]",
      "jobs:",
      "  build:",
      "    runs-on: macos-latest",
      "    steps:",
      "      - run: pnpm tauri info",
      "      - run: pnpm tauri build --bundles app,dmg,nsis,msi,appimage",
      "      - run: pnpm electron-builder --mac --win --linux",
      "      - run: wails build -platform darwin/universal,windows/amd64,linux/amd64",
      "      - run: echo TAURI_SIGNING_PRIVATE_KEY APPLE_ID APPLE_TEAM_ID codesign notarize createUpdaterArtifacts",
      "      - uses: actions/upload-artifact@v4",
      "      - uses: softprops/action-gh-release@v2"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "desktop-readiness-report.json"), "utf8")) as {
      desktopSetups: Array<{ filePath: string; framework: string; configCount: number; windowCount: number; commandCount: number; permissionCount: number; bundleCount: number; updaterCount: number; signingCount: number; platformCount: number; packageCount: number }>;
      frameworkSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      runtimeSignals: Array<{ signal: string; readiness: string }>;
      permissionSignals: Array<{ signal: string; readiness: string }>;
      bundleSignals: Array<{ signal: string; readiness: string }>;
      releaseSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const tauriConfig = report.desktopSetups.find((item) => item.filePath === "src-tauri/tauri.conf.json");
    expect(report.desktopSetups.length).toBeGreaterThan(0);
    expect(tauriConfig?.framework).toBe("tauri");
    expect(tauriConfig?.configCount).toBeGreaterThan(0);
    expect(tauriConfig?.permissionCount).toBeGreaterThan(0);
    expect(tauriConfig?.bundleCount).toBeGreaterThan(0);
    expect(tauriConfig?.updaterCount).toBeGreaterThan(0);
    expect(tauriConfig?.signingCount).toBeGreaterThan(0);
    expect(report.desktopSetups.some((item) => item.framework === "electron" && item.commandCount > 0)).toBe(true);
    expect(report.desktopSetups.some((item) => item.framework === "wails" && item.configCount > 0)).toBe(true);
    expect(readySignals(report.frameworkSignals)).toEqual(expect.arrayContaining(["tauri", "electron", "wails"]));
    expect(readySignals(report.configSignals)).toEqual(expect.arrayContaining(["tauri-conf", "wails-json", "electron-builder", "forge-config", "package-main", "cargo-manifest", "frontend-dist", "dev-url", "identifier"]));
    expect(readySignals(report.runtimeSignals)).toEqual(expect.arrayContaining(["window", "tray", "menu", "dialog", "deep-link", "file-association", "custom-protocol", "ipc"]));
    expect(readySignals(report.permissionSignals)).toEqual(expect.arrayContaining(["tauri-capabilities", "permissions", "csp", "entitlements", "sandbox", "shell-open", "fs-scope", "global-tauri"]));
    expect(readySignals(report.bundleSignals)).toEqual(expect.arrayContaining(["bundle-targets", "icons", "resources", "macos", "windows", "linux", "dmg", "nsis", "appimage", "msi"]));
    expect(readySignals(report.releaseSignals)).toEqual(expect.arrayContaining(["updater", "updater-artifacts", "signing", "notarization", "hardened-runtime", "ci-build", "artifact-upload", "release-draft", "version-sync"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["tauri-cli", "tauri-api", "tauri-plugin", "electron", "electron-builder", "electron-forge", "electron-notarize", "wails", "wails-cli"]));
    await expect(fs.access(path.join(result.session.outputPaths.analysis, "desktop-readiness-report.json"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "desktop-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "desktop-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Cloudflare Workers edge readiness in Wrangler config and handlers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-edge-studies-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-edge-source-"));
    await fs.mkdir(path.join(sourceRoot, "src"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      name: "edge-demo",
      scripts: {
        dev: "wrangler dev --local",
        types: "wrangler types",
        deploy: "wrangler deploy",
        tail: "wrangler tail",
        "secret:list": "wrangler secret list",
        "kv:list": "wrangler kv namespace list",
        "r2:list": "wrangler r2 bucket list",
        "d1:list": "wrangler d1 list"
      },
      devDependencies: {
        wrangler: "^5.0.0",
        "@cloudflare/workers-types": "^5.0.0",
        "@cloudflare/vitest-pool-workers": "^1.0.0",
        miniflare: "^4.0.0"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "wrangler.toml"), [
      "name = \"edge-demo\"",
      "main = \"src/index.ts\"",
      "compatibility_date = \"2026-06-01\"",
      "compatibility_flags = [\"nodejs_compat\"]",
      "workers_dev = true",
      "routes = [{ pattern = \"edge.example.com/*\", zone_name = \"example.com\" }]",
      "vars = { FEATURE_MODE = \"local\" }",
      "limits = { cpu_ms = 50 }",
      "placement = { mode = \"smart\" }",
      "kv_namespaces = [{ binding = \"CACHE\", id = \"local-cache\" }]",
      "r2_buckets = [{ binding = \"ASSETS\", bucket_name = \"assets\" }]",
      "d1_databases = [{ binding = \"DB\", database_name = \"demo\", database_id = \"demo\" }]",
      "queues.producers = [{ binding = \"JOB_QUEUE\", queue = \"jobs\" }]",
      "services = [{ binding = \"API\", service = \"api-worker\" }]",
      "analytics_engine_datasets = [{ binding = \"ANALYTICS\" }]",
      "workflows = [{ binding = \"PIPELINE\", name = \"pipeline\", class_name = \"PipelineWorkflow\" }]",
      "[[durable_objects.bindings]]",
      "name = \"COUNTER\"",
      "class_name = \"Counter\"",
      "[[migrations]]",
      "tag = \"v1\"",
      "new_sqlite_classes = [\"Counter\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dev.vars"), "FEATURE_MODE=local\n");
    await fs.writeFile(path.join(sourceRoot, "vitest.config.ts"), [
      "import { defineWorkersConfig } from '@cloudflare/vitest-pool-workers/config';",
      "export default defineWorkersConfig({ test: { poolOptions: { workers: { wrangler: { configPath: './wrangler.toml' } } } } });"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "index.ts"), [
      "export interface Env { CACHE: KVNamespace; ASSETS: R2Bucket; DB: D1Database; COUNTER: DurableObjectNamespace; JOB_QUEUE: Queue; API: Fetcher; ANALYTICS: AnalyticsEngineDataset; }",
      "export class Counter { fetch(request: Request) { return new Response('counter'); } }",
      "export default {",
      "  async fetch(request: Request, env: Env) {",
      "    console.log('edge request');",
      "    env.ANALYTICS.writeDataPoint({ blobs: ['demo'], doubles: [1], indexes: ['edge'] });",
      "    return new Response('edge');",
      "  },",
      "  async scheduled(controller: ScheduledController, env: Env) { console.info(controller.cron); },",
      "  async queue(batch: MessageBatch, env: Env) { console.warn(batch.messages.length); }",
      "};"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "deploy.yml"), "name: deploy\non: [push]\njobs:\n  deploy:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: cloudflare/wrangler-action@v3\n        env:\n          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}\n");

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "edge-readiness-report.json"), "utf8")) as {
      edgeSetups: Array<{ filePath: string; platform: string; configCount: number; handlerCount: number; bindingCount: number; routingCount: number; devWorkflowCount: number; deploymentWorkflowCount: number; observabilityCount: number; packageCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      handlerSignals: Array<{ signal: string; readiness: string }>;
      bindingSignals: Array<{ signal: string; readiness: string }>;
      routingSignals: Array<{ signal: string; readiness: string }>;
      devSignals: Array<{ signal: string; readiness: string }>;
      deploymentSignals: Array<{ signal: string; readiness: string }>;
      observabilitySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const setup = report.edgeSetups.find((item) => item.filePath === "wrangler.toml");
    expect(report.edgeSetups.length).toBeGreaterThan(0);
    expect(setup?.platform).toBe("cloudflare-workers");
    expect(setup?.configCount).toBeGreaterThan(0);
    expect(setup?.bindingCount).toBeGreaterThan(0);
    expect(setup?.routingCount).toBeGreaterThan(0);
    expect(report.edgeSetups.some((item) => item.handlerCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.devWorkflowCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.deploymentWorkflowCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.observabilityCount > 0)).toBe(true);
    expect(report.edgeSetups.some((item) => item.packageCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "wrangler-toml" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "compatibility-date" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "vars" && item.readiness === "ready")).toBe(true);
    expect(report.handlerSignals.some((item) => item.signal === "module-worker" && item.readiness === "ready")).toBe(true);
    expect(report.handlerSignals.some((item) => item.signal === "fetch-handler" && item.readiness === "ready")).toBe(true);
    expect(report.handlerSignals.some((item) => item.signal === "durable-object-class" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "kv" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "r2" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "d1" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "durable-objects" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "queues" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "services" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "workflows" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "analytics-engine" && item.readiness === "ready")).toBe(true);
    expect(report.bindingSignals.some((item) => item.signal === "secrets" && item.readiness === "ready")).toBe(true);
    expect(report.routingSignals.some((item) => item.signal === "workers-dev" && item.readiness === "ready")).toBe(true);
    expect(report.routingSignals.some((item) => item.signal === "routes" && item.readiness === "ready")).toBe(true);
    expect(report.routingSignals.some((item) => item.signal === "durable-object-migrations" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "wrangler-dev" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "dev-vars" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "miniflare" && item.readiness === "ready")).toBe(true);
    expect(report.devSignals.some((item) => item.signal === "vitest-pool-workers" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "wrangler-deploy" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "wrangler-tail" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "wrangler-secret" && item.readiness === "ready")).toBe(true);
    expect(report.deploymentSignals.some((item) => item.signal === "ci-deploy" && item.readiness === "ready")).toBe(true);
    expect(report.observabilitySignals.some((item) => item.signal === "tail" && item.readiness === "ready")).toBe(true);
    expect(report.observabilitySignals.some((item) => item.signal === "console" && item.readiness === "ready")).toBe(true);
    expect(report.observabilitySignals.some((item) => item.signal === "analytics-engine" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "wrangler" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "cloudflare-workers-types" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "vitest-pool-workers" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "edge-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "edge-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Docker Compose readiness patterns without running Docker", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-compose-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-compose-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "compose.yaml"), [
      "name: repotutor-compose-fixture",
      "x-common-env: &common-env",
      "  APP_MODE: compose",
      "include:",
      "  - compose.override.yml",
      "services:",
      "  web:",
      "    build:",
      "      context: .",
      "      dockerfile: Dockerfile",
      "    image: local/repotutor-web:dev",
      "    command: pnpm dev",
      "    entrypoint: [\"sh\", \"-c\"]",
      "    ports:",
      "      - \"3000:3000\"",
      "    expose:",
      "      - \"3000\"",
      "    restart: unless-stopped",
      "    profiles: [\"app\"]",
      "    environment:",
      "      <<: *common-env",
      "      DATABASE_URL: postgresql://db:5432/app",
      "    env_file:",
      "      - .env.compose",
      "    depends_on:",
      "      db:",
      "        condition: service_healthy",
      "    healthcheck:",
      "      test: [\"CMD\", \"node\", \"health.js\"]",
      "      interval: 10s",
      "      timeout: 3s",
      "      retries: 3",
      "    volumes:",
      "      - .:/workspace",
      "      - web-cache:/cache",
      "    networks:",
      "      app-net:",
      "        aliases: [\"web.local\"]",
      "    secrets:",
      "      - app_token",
      "    configs:",
      "      - app_config",
      "    deploy:",
      "      replicas: 1",
      "      resources:",
      "        limits:",
      "          cpus: \"0.50\"",
      "    read_only: true",
      "    cap_drop:",
      "      - ALL",
      "    security_opt:",
      "      - no-new-privileges:true",
      "  db:",
      "    image: postgres:16",
      "    environment:",
      "      POSTGRES_DB: app",
      "    healthcheck:",
      "      test: [\"CMD-SHELL\", \"pg_isready -U app\"]",
      "      interval: 5s",
      "      timeout: 3s",
      "      retries: 5",
      "    volumes:",
      "      - db-data:/var/lib/postgresql/data",
      "    networks:",
      "      - app-net",
      "  worker:",
      "    build: .",
      "    depends_on:",
      "      - web",
      "    command: pnpm worker",
      "    links:",
      "      - db",
      "volumes:",
      "  web-cache:",
      "  db-data:",
      "networks:",
      "  app-net:",
      "    external: true",
      "secrets:",
      "  app_token:",
      "    file: ./secrets/app_token.txt",
      "configs:",
      "  app_config:",
      "    file: ./config/app.yml",
      "extends:",
      "  file: compose.base.yml"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "compose.override.yml"), "services:\n  web:\n    profiles: [\"debug\"]\n");
    await fs.writeFile(path.join(sourceRoot, ".env.compose"), "APP_MODE=compose\nDB_NAME=app\nCOMPOSE_PROFILES=app\n");
    await fs.writeFile(path.join(sourceRoot, "Dockerfile"), "FROM node:22-alpine\nWORKDIR /workspace\nCMD [\"node\", \"health.js\"]\n");
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "compose:config": "docker compose config",
        "compose:up": "docker compose up -d",
        "compose:build": "docker compose build",
        "compose:run": "docker compose run --rm web pnpm test",
        "compose:exec": "docker compose exec web sh",
        "compose:logs": "docker compose logs web",
        "compose:ps": "docker compose ps",
        "compose:pull": "docker compose pull",
        "compose:watch": "docker compose watch",
        "compose:wait": "docker compose wait",
        "compose:down": "docker compose down --remove-orphans",
        "compose:v1": "docker-compose config"
      },
      devDependencies: {}
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "compose-readiness-report.json"), "utf8")) as {
      composeSetups: Array<{ filePath: string; format: string; serviceCount: number; buildCount: number; imageCount: number; portCount: number; volumeCount: number; networkCount: number; dependencyCount: number; healthcheckCount: number; envCount: number; secretConfigCount: number; profileCount: number; commandCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      serviceSignals: Array<{ signal: string; readiness: string }>;
      dependencySignals: Array<{ signal: string; readiness: string }>;
      resourceSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const setup = report.composeSetups.find((item) => item.filePath === "compose.yaml");
    expect(report.composeSetups.length).toBeGreaterThan(0);
    expect(setup?.format).toBe("compose-yaml");
    expect(setup?.serviceCount).toBeGreaterThan(0);
    expect(setup?.buildCount).toBeGreaterThan(0);
    expect(setup?.imageCount).toBeGreaterThan(0);
    expect(setup?.portCount).toBeGreaterThan(0);
    expect(setup?.volumeCount).toBeGreaterThan(0);
    expect(setup?.networkCount).toBeGreaterThan(0);
    expect(setup?.dependencyCount).toBeGreaterThan(0);
    expect(setup?.healthcheckCount).toBeGreaterThan(0);
    expect(setup?.envCount).toBeGreaterThan(0);
    expect(setup?.secretConfigCount).toBeGreaterThan(0);
    expect(setup?.profileCount).toBeGreaterThan(0);
    expect(report.composeSetups.some((item) => item.commandCount > 0)).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "compose-yaml" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "override-file" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "services" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "name" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "include" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "extends" && item.readiness === "ready")).toBe(true);
    expect(report.configSignals.some((item) => item.signal === "x-extension" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "build" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "image" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "command" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "entrypoint" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "ports" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "expose" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "restart" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "profiles" && item.readiness === "ready")).toBe(true);
    expect(report.serviceSignals.some((item) => item.signal === "scale-deploy" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "depends-on" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "service-healthy" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "healthcheck" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "links" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "external-network" && item.readiness === "ready")).toBe(true);
    expect(report.dependencySignals.some((item) => item.signal === "aliases" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "volumes" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "bind-mounts" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "named-volumes" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "networks" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "secrets" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "configs" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "env-file" && item.readiness === "ready")).toBe(true);
    expect(report.resourceSignals.some((item) => item.signal === "environment" && item.readiness === "ready")).toBe(true);
    for (const signal of ["config", "up", "down", "build", "run", "exec", "logs", "ps", "pull", "watch", "wait"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["healthcheck", "restart-policy", "profiles", "resource-limits", "read-only", "cap-drop", "security-opt", "secrets"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.packageSignals.some((item) => item.signal === "docker-compose-plugin" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "docker-compose-v1" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "compose-spec" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "compose-watch" && item.readiness === "ready")).toBe(true);
    expect(report.packageSignals.some((item) => item.signal === "dockerfile" && item.readiness === "ready")).toBe(true);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "compose-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "compose-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects container scan readiness without building images or contacting registries", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-container-scan-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-container-scan-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "docs"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "Dockerfile"), [
      "FROM node:22-alpine",
      "WORKDIR /app",
      "COPY package.json ./",
      "RUN npm ci --omit=dev",
      "COPY . .",
      "CMD [\"node\", \"index.js\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "container-scan.yml"), [
      "name: Container Scan",
      "on:",
      "  pull_request:",
      "permissions:",
      "  contents: read",
      "  security-events: write",
      "jobs:",
      "  scan:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: docker build --platform linux/amd64 -t ghcr.io/acme/app:${{ github.sha }} .",
      "      - uses: aquasecurity/trivy-action@v0.35.0",
      "        with:",
      "          image-ref: ghcr.io/acme/app:${{ github.sha }}",
      "          scanners: vuln,misconfig,secret,license",
      "          severity: HIGH,CRITICAL",
      "          ignore-unfixed: true",
      "          exit-code: '1'",
      "          format: sarif",
      "          output: trivy-results.sarif",
      "      - run: trivy image --scanners vuln,misconfig,secret,license --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed --format cyclonedx --output trivy.cdx.json --format spdx --offline-scan --skip-db-update --vex repo ghcr.io/acme/app:${{ github.sha }}",
      "      - run: grype ghcr.io/acme/app:${{ github.sha }} --fail-on high --only-fixed --by-cve --scope all-layers -o sarif > grype.sarif",
      "      - run: grype sbom:./sbom.syft.json -o json > grype.json",
      "      - uses: goodwithtech/dockle-action@v0.4.15",
      "        with:",
      "          image: ghcr.io/acme/app:${{ github.sha }}",
      "          exit-code: '1'",
      "          exit-level: warn",
      "          format: sarif",
      "          ignore: CIS-DI-0001,DKL-DI-0006",
      "      - run: docker save ghcr.io/acme/app:${{ github.sha }} -o image.tar && dockle --input image.tar -f json -o dockle.json --exit-code 1 --exit-level fatal -i CIS-DI-0001 --accept-key GPG_KEY --sensitive-file .env",
      "      - uses: github/codeql-action/upload-sarif@v4",
      "        with:",
      "          sarif_file: trivy-results.sarif",
      "      - uses: actions/upload-artifact@v4",
      "        with:",
      "          name: container-scan-artifacts",
      "          path: |",
      "            trivy-results.sarif",
      "            trivy.cdx.json",
      "            grype.sarif",
      "            grype.json",
      "            dockle.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".trivyignore"), "CVE-2026-0001\n");
    await fs.writeFile(path.join(sourceRoot, ".grype.yaml"), [
      "fail-on-severity: high",
      "ignore:",
      "  - vulnerability: CVE-2026-0002",
      "    vex-status: not_affected"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".dockleignore"), [
      "CIS-DI-0001",
      "DKL-DI-0006"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "docs", "container-scan.md"), [
      "Container image scanning covers Trivy, Grype, and Dockle.",
      "Operators may run trivy fs --scanners vuln,secret,misconfig ./ and trivy k8s --report summary cluster in authorized environments.",
      "Reports include JSON, SARIF, CycloneDX, SPDX, table, --format template, and github code scanning output.",
      "Policy includes .trivyignore, .grype.yaml ignore, .dockleignore, --ignore-policy, OpenVEX VEX, EPSS, KEV, offline DB, registry-token, DOCKER_HOST, podman-host, private registry, and platform linux/amd64.",
      "Syft produces the SBOM before Grype reads sbom:./sbom.syft.json."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "scan:container": "trivy image --severity HIGH,CRITICAL --exit-code 1 --ignore-unfixed --format sarif ghcr.io/acme/app:local && grype ghcr.io/acme/app:local --fail-on high --only-fixed && dockle --exit-code 1 --exit-level warn ghcr.io/acme/app:local"
      },
      devDependencies: {
        trivy: "latest",
        grype: "latest",
        dockle: "latest",
        syft: "latest"
      }
    }, null, 2));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "container-scan-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      containerScanSetups: Array<{ tool: string; imageCount: number; vulnerabilityCount: number; misconfigCount: number; secretCount: number; licenseCount: number; sbomCount: number; policyCount: number; outputCount: number; ciCount: number }>;
      targetSignals: Array<{ signal: string; readiness: string }>;
      scannerSignals: Array<{ signal: string; readiness: string }>;
      gateSignals: Array<{ signal: string; readiness: string }>;
      outputSignals: Array<{ signal: string; readiness: string }>;
      policySignals: Array<{ signal: string; readiness: string }>;
      registrySignals: Array<{ signal: string; readiness: string }>;
      ciSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: Array<{ priority: string; action: string }>;
      recommendedCommands: Array<{ command: string; purpose: string }>;
    };
    const ready = (items: Array<{ signal: string; readiness: string }>, signal: string) =>
      items.some((item) => item.signal === signal && item.readiness === "ready");
    expect(report.sourcePattern).toBe("Container scan readiness Trivy Grype Dockle image filesystem SBOM vulnerability misconfig secret license CIS exit-code severity ignore-unfixed only-fixed fail-on exit-level SARIF CycloneDX SPDX JSON VEX trivyignore grype ignore dockleignore registry token docker-host");
    expect(report.containerScanSetups.some((item) => item.tool === "trivy")).toBe(true);
    expect(report.containerScanSetups.some((item) => item.tool === "grype")).toBe(true);
    expect(report.containerScanSetups.some((item) => item.tool === "dockle")).toBe(true);
    expect(report.containerScanSetups.some((item) => item.tool === "package-script")).toBe(true);
    expect(report.containerScanSetups.some((item) => item.imageCount > 0 && item.vulnerabilityCount > 0 && item.misconfigCount > 0 && item.secretCount > 0 && item.licenseCount > 0 && item.sbomCount > 0 && item.policyCount > 0 && item.outputCount > 0 && item.ciCount > 0)).toBe(true);
    for (const signal of ["image", "filesystem", "sbom", "dockerfile", "kubernetes", "tar-input", "registry"]) {
      expect(ready(report.targetSignals, signal)).toBe(true);
    }
    for (const signal of ["trivy", "grype", "dockle", "vulnerability", "misconfig", "secret", "license", "cis-benchmark"]) {
      expect(ready(report.scannerSignals, signal)).toBe(true);
    }
    for (const signal of ["exit-code", "severity", "ignore-unfixed", "only-fixed", "fail-on", "exit-level", "ignore-policy"]) {
      expect(ready(report.gateSignals, signal)).toBe(true);
    }
    for (const signal of ["json", "sarif", "cyclonedx", "spdx", "table", "template", "github", "artifact-upload"]) {
      expect(ready(report.outputSignals, signal)).toBe(true);
    }
    for (const signal of ["trivyignore", "grype-ignore", "dockleignore", "vex", "ignore-policy", "accept-key", "sensitive-file", "offline-db"]) {
      expect(ready(report.policySignals, signal)).toBe(true);
    }
    for (const signal of ["image-ref", "registry-token", "docker-host", "podman", "private-registry", "platform"]) {
      expect(ready(report.registrySignals, signal)).toBe(true);
    }
    for (const signal of ["github-actions", "pull-request", "docker-build", "artifact-upload", "sarif-upload", "permissions"]) {
      expect(ready(report.ciSignals, signal)).toBe(true);
    }
    for (const signal of ["trivy-action", "grype", "dockle-action", "docker", "syft"]) {
      expect(ready(report.packageSignals, signal)).toBe(true);
    }
    expect(report.riskQueue.filter((item) => item.priority !== "low")).toHaveLength(0);
    expect(report.riskQueue.some((item) => item.action === "Run Trivy, Grype, Dockle, Docker, registry, vulnerability DB, and SARIF upload commands only in an authorized local or CI environment.")).toBe(true);
    expect(report.recommendedCommands.map((item) => item.command)).toEqual([
      "rg \"trivy image|aquasecurity/trivy-action|image-ref|--scanners|--severity|--exit-code|--ignore-unfixed|--format sarif|--format cyclonedx|--format spdx\" .",
      "rg \"grype |anchore/grype|sbom:|--fail-on|--only-fixed|--by-cve|--scope|\\.grype\\.ya?ml|GRYPE_\" .",
      "rg \"dockle|goodwithtech/dockle-action|--exit-code|--exit-level|\\.dockleignore|DOCKLE_IGNORES|accept-key|sensitive-file|CIS-DI|DKL-DI\" .",
      "rg \"docker build|docker save|image-ref|registry-token|docker-host|podman-host|platform|upload-sarif|upload-artifact|security-events: write\" .github ."
    ]);
    const containerScanMarkdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "container-scan-readiness.md"), "utf8");
    expect(containerScanMarkdown).toContain("# Container Scan Readiness");
    expect(containerScanMarkdown).toContain("## Gate Signals");
    expect(containerScanMarkdown).toContain("## Policy Signals");
    const containerScanHtml = await fs.readFile(path.join(result.session.outputPaths.html, "container-scan-readiness.html"), "utf8");
    expect(containerScanHtml).toContain("Container Scan Readiness");
    expect(containerScanHtml).toContain("container-scan-readiness-card");
    expect(containerScanHtml).toContain("data-source-pattern=\"Container Scan\"");
    expect(containerScanHtml).toContain("does not build images");
  });

  it("detects Dev Container readiness patterns without running containers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-devcontainer-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-devcontainer-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".devcontainer"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.appendFile(path.join(sourceRoot, "README.md"), "\nDev Containers local development is supported through VS Code Dev Containers.\n");
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "devcontainer.json"), JSON.stringify({
      name: "RepoTutor Dev Container Fixture",
      image: "mcr.microsoft.com/devcontainers/typescript-node:22",
      build: {
        dockerfile: "Dockerfile",
        context: ".."
      },
      dockerComposeFile: "docker-compose.yml",
      service: "app",
      workspaceFolder: "/workspaces/repotutor",
      workspaceMount: "source=${localWorkspaceFolder},target=/workspaces/repotutor,type=bind,consistency=cached",
      features: {
        "ghcr.io/devcontainers/features/github-cli:1": {}
      },
      overrideFeatureInstallOrder: ["ghcr.io/devcontainers/features/github-cli"],
      initializeCommand: "node --version",
      onCreateCommand: "pnpm install",
      updateContentCommand: "pnpm build",
      postCreateCommand: "pnpm test",
      postStartCommand: "pnpm devcontainer:ready",
      postAttachCommand: "pnpm devcontainer:attach",
      waitFor: "postCreateCommand",
      containerEnv: {
        APP_MODE: "devcontainer"
      },
      remoteEnv: {
        NODE_OPTIONS: "--max-old-space-size=4096"
      },
      userEnvProbe: "loginInteractiveShell",
      secrets: {
        APP_TOKEN_NAME: {
          description: "Name of the token env var supplied by the operator"
        }
      },
      remoteUser: "node",
      containerUser: "node",
      updateRemoteUserUID: true,
      mounts: ["source=repotutor-cache,target=/cache,type=volume"],
      forwardPorts: [3000, 5173],
      portsAttributes: {
        "3000": { label: "app" }
      },
      otherPortsAttributes: {
        onAutoForward: "notify"
      },
      customizations: {
        vscode: {
          extensions: ["dbaeumer.vscode-eslint"],
          settings: { "editor.formatOnSave": true }
        },
        codespaces: { openFiles: ["README.md"] }
      },
      dotfiles: {
        repository: "local/dotfiles"
      },
      capAdd: ["SYS_PTRACE"],
      securityOpt: ["seccomp=unconfined"],
      privileged: true,
      hostRequirements: {
        cpus: 2
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "Dockerfile"), "FROM mcr.microsoft.com/devcontainers/typescript-node:22\nWORKDIR /workspaces/repotutor\n");
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "docker-compose.yml"), [
      "services:",
      "  app:",
      "    build:",
      "      context: ..",
      "      dockerfile: .devcontainer/Dockerfile",
      "    volumes:",
      "      - ..:/workspaces/repotutor",
      "    command: sleep infinity"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "devcontainer-feature.json"), JSON.stringify({
      id: "repotutor-tooling",
      version: "1.0.0",
      name: "RepoTutor tooling",
      installsAfter: ["ghcr.io/devcontainers/features/common-utils"],
      options: {
        installTools: {
          type: "boolean",
          default: true
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer", "devcontainer-template.json"), JSON.stringify({
      id: "repotutor-template",
      version: "1.0.0",
      name: "RepoTutor Template"
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".devcontainer-lock.json"), JSON.stringify({
      features: {
        "ghcr.io/devcontainers/features/github-cli:1": {
          version: "1"
        }
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "devcontainer:read": "devcontainer read-configuration --workspace-folder .",
        "devcontainer:up": "devcontainer up --workspace-folder .",
        "devcontainer:build": "devcontainer build --workspace-folder . --frozen-lockfile",
        "devcontainer:exec": "devcontainer exec --workspace-folder . pnpm test",
        "devcontainer:run-user": "devcontainer run-user-commands --workspace-folder .",
        "devcontainer:features-test": "devcontainer features test .devcontainer",
        "devcontainer:features-package": "devcontainer features package .devcontainer",
        "devcontainer:outdated": "devcontainer outdated --workspace-folder .",
        "devcontainer:upgrade": "devcontainer upgrade --workspace-folder .",
        "devcontainer:templates": "devcontainer templates apply --template-id repotutor-template"
      },
      devDependencies: {
        "@devcontainers/cli": "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "devcontainer.yml"), [
      "name: devcontainer",
      "on: [push]",
      "jobs:",
      "  devcontainer:",
      "    runs-on: ubuntu-latest",
      "    steps:",
      "      - uses: actions/checkout@v4",
      "      - run: devcontainer build --workspace-folder . --frozen-lockfile",
      "      - run: devcontainer read-configuration --workspace-folder ."
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "devcontainer-readiness-report.json"), "utf8")) as {
      devContainerSetups: Array<{ filePath: string; format: string; configCount: number; imageBuildCount: number; featureCount: number; lifecycleCount: number; environmentCount: number; mountCount: number; portCount: number; userCount: number; customizationCount: number; workflowCount: number; lockfileCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      featureSignals: Array<{ signal: string; readiness: string }>;
      lifecycleSignals: Array<{ signal: string; readiness: string }>;
      environmentSignals: Array<{ signal: string; readiness: string }>;
      workspaceSignals: Array<{ signal: string; readiness: string }>;
      customizationSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const setup = report.devContainerSetups.find((item) => item.filePath === ".devcontainer/devcontainer.json");
    expect(report.devContainerSetups.length).toBeGreaterThan(0);
    expect(setup?.format).toBe("devcontainer-json");
    expect(setup?.configCount).toBeGreaterThan(0);
    expect(setup?.imageBuildCount).toBeGreaterThan(0);
    expect(setup?.featureCount).toBeGreaterThan(0);
    expect(setup?.lifecycleCount).toBeGreaterThan(0);
    expect(setup?.environmentCount).toBeGreaterThan(0);
    expect(setup?.mountCount).toBeGreaterThan(0);
    expect(setup?.portCount).toBeGreaterThan(0);
    expect(setup?.userCount).toBeGreaterThan(0);
    expect(setup?.customizationCount).toBeGreaterThan(0);
    expect(report.devContainerSetups.some((item) => item.workflowCount > 0)).toBe(true);
    expect(report.devContainerSetups.some((item) => item.lockfileCount > 0)).toBe(true);
    for (const signal of ["devcontainer-json", "devcontainer-lock", "name", "image", "build", "dockerfile", "docker-compose-file", "service", "workspace-folder"]) {
      expect(report.configSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["features", "feature-json", "template-json", "installs-after", "options", "override-feature-install-order", "lockfile"]) {
      expect(report.featureSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["initialize-command", "on-create-command", "update-content-command", "post-create-command", "post-start-command", "post-attach-command", "wait-for"]) {
      expect(report.lifecycleSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["container-env", "remote-env", "user-env-probe", "secrets", "remote-user", "container-user"]) {
      expect(report.environmentSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["workspace-folder", "workspace-mount", "mounts", "forward-ports", "ports-attributes", "other-ports-attributes"]) {
      expect(report.workspaceSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["customizations", "vscode-extensions", "vscode-settings", "codespaces", "dotfiles"]) {
      expect(report.customizationSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["devcontainer-up", "devcontainer-build", "devcontainer-exec", "read-configuration", "run-user-commands", "features-test", "features-package", "outdated", "upgrade"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["lockfile", "frozen-lockfile", "non-root-user", "cap-add", "security-opt", "privileged", "host-requirements"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["devcontainers-cli", "devcontainer-cli", "devcontainer-feature", "devcontainer-template", "vscode-dev-containers"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "devcontainer-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "devcontainer-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects Kubernetes readiness patterns without contacting a cluster", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-kubernetes-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-kubernetes-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "k8s", "base"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "k8s", "overlays", "dev"), { recursive: true });
    await fs.appendFile(path.join(sourceRoot, "README.md"), [
      "",
      "Kubernetes local workflow:",
      "kustomize build k8s/overlays/dev",
      "kubectl diff -k k8s/overlays/dev",
      "kubectl apply --dry-run=server -k k8s/overlays/dev",
      "kubectl apply -k k8s/overlays/dev",
      "kubectl wait --for=condition=Available deployment/repotutor-api -n repotutor-dev --timeout=180s",
      "kubectl rollout status deployment/repotutor-api -n repotutor-dev",
      "kubectl get pods -l app=repotutor-api -n repotutor-dev",
      "kubectl logs -l app=repotutor-api -n repotutor-dev",
      "kubectl describe hpa/repotutor-api -n repotutor-dev",
      "kubectl port-forward service/repotutor-api 8080:80 -n repotutor-dev",
      "kubectl delete -k k8s/overlays/dev",
      "kind create cluster --name repotutor-dev",
      "minikube start"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        "k8s:build": "kustomize build k8s/overlays/dev",
        "k8s:diff": "kubectl diff -k k8s/overlays/dev",
        "k8s:apply": "kubectl apply -k k8s/overlays/dev",
        "k8s:wait": "kubectl wait --for=condition=Available deployment/repotutor-api -n repotutor-dev",
        "k8s:rollout": "kubectl rollout status deployment/repotutor-api -n repotutor-dev",
        "k8s:logs": "kubectl logs -l app=repotutor-api -n repotutor-dev",
        "k8s:describe": "kubectl describe deployment/repotutor-api -n repotutor-dev",
        "k8s:port": "kubectl port-forward service/repotutor-api 8080:80 -n repotutor-dev",
        "k8s:delete": "kubectl delete -k k8s/overlays/dev"
      },
      devDependencies: {
        kubectl: "latest",
        kustomize: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "kustomization.yaml"), [
      "resources:",
      "  - namespace.yaml",
      "  - serviceaccount.yaml",
      "  - rbac.yaml",
      "  - app-config.yaml",
      "  - storage.yaml",
      "  - workloads.yaml",
      "  - deployment.yaml",
      "  - service.yaml",
      "  - ingress.yaml",
      "  - hpa.yaml",
      "  - pdb.yaml",
      "  - networkpolicy.yaml",
      "configMapGenerator:",
      "  - name: repotutor-generated-config",
      "    literals:",
      "      - FEATURE_FLAG=enabled",
      "images:",
      "  - name: ghcr.io/veritas/repotutor-api",
      "    newTag: dev"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "namespace.yaml"), [
      "apiVersion: v1",
      "kind: Namespace",
      "metadata:",
      "  name: repotutor-dev",
      "  labels:",
      "    app.kubernetes.io/name: repotutor"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "serviceaccount.yaml"), [
      "apiVersion: v1",
      "kind: ServiceAccount",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "imagePullSecrets:",
      "  - name: repotutor-registry-reference"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "rbac.yaml"), [
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: Role",
      "metadata:",
      "  name: repotutor-reader",
      "  namespace: repotutor-dev",
      "rules:",
      "  - apiGroups: [\"\"]",
      "    resources: [\"configmaps\", \"pods\"]",
      "    verbs: [\"get\", \"list\", \"watch\"]",
      "---",
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: RoleBinding",
      "metadata:",
      "  name: repotutor-reader-binding",
      "  namespace: repotutor-dev",
      "subjects:",
      "  - kind: ServiceAccount",
      "    name: repotutor-api",
      "    namespace: repotutor-dev",
      "roleRef:",
      "  kind: Role",
      "  name: repotutor-reader",
      "  apiGroup: rbac.authorization.k8s.io",
      "---",
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: ClusterRole",
      "metadata:",
      "  name: repotutor-cluster-reader",
      "rules:",
      "  - apiGroups: [\"\"]",
      "    resources: [\"nodes\"]",
      "    verbs: [\"get\", \"list\"]",
      "---",
      "apiVersion: rbac.authorization.k8s.io/v1",
      "kind: ClusterRoleBinding",
      "metadata:",
      "  name: repotutor-cluster-reader-binding",
      "subjects:",
      "  - kind: ServiceAccount",
      "    name: repotutor-api",
      "    namespace: repotutor-dev",
      "roleRef:",
      "  kind: ClusterRole",
      "  name: repotutor-cluster-reader",
      "  apiGroup: rbac.authorization.k8s.io"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "app-config.yaml"), [
      "apiVersion: v1",
      "kind: ConfigMap",
      "metadata:",
      "  name: repotutor-api-config",
      "  namespace: repotutor-dev",
      "data:",
      "  APP_MODE: dev",
      "---",
      "apiVersion: v1",
      "kind: Secret",
      "metadata:",
      "  name: repotutor-api-reference",
      "  namespace: repotutor-dev",
      "type: Opaque",
      "stringData:",
      "  TOKEN_NAME: APP_TOKEN_NAME"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "storage.yaml"), [
      "apiVersion: v1",
      "kind: PersistentVolume",
      "metadata:",
      "  name: repotutor-pv",
      "spec:",
      "  capacity:",
      "    storage: 1Gi",
      "  accessModes: [\"ReadWriteOnce\"]",
      "  storageClassName: manual",
      "  hostPath:",
      "    path: /tmp/repotutor",
      "---",
      "apiVersion: v1",
      "kind: PersistentVolumeClaim",
      "metadata:",
      "  name: repotutor-pvc",
      "  namespace: repotutor-dev",
      "spec:",
      "  storageClassName: manual",
      "  accessModes: [\"ReadWriteOnce\"]",
      "  resources:",
      "    requests:",
      "      storage: 1Gi"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "workloads.yaml"), [
      "apiVersion: apps/v1",
      "kind: StatefulSet",
      "metadata:",
      "  name: repotutor-stateful",
      "  namespace: repotutor-dev",
      "spec:",
      "  serviceName: repotutor-stateful",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-stateful",
      "  template:",
      "    metadata:",
      "      labels:",
      "        app: repotutor-stateful",
      "    spec:",
      "      containers:",
      "        - name: sidecar",
      "          image: ghcr.io/veritas/repotutor-sidecar:dev",
      "---",
      "apiVersion: apps/v1",
      "kind: DaemonSet",
      "metadata:",
      "  name: repotutor-agent",
      "  namespace: repotutor-dev",
      "spec:",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-agent",
      "  template:",
      "    metadata:",
      "      labels:",
      "        app: repotutor-agent",
      "    spec:",
      "      containers:",
      "        - name: agent",
      "          image: ghcr.io/veritas/repotutor-agent:dev",
      "---",
      "apiVersion: batch/v1",
      "kind: Job",
      "metadata:",
      "  name: repotutor-migrate",
      "  namespace: repotutor-dev",
      "spec:",
      "  template:",
      "    spec:",
      "      restartPolicy: Never",
      "      containers:",
      "        - name: migrate",
      "          image: ghcr.io/veritas/repotutor-api:dev",
      "---",
      "apiVersion: batch/v1",
      "kind: CronJob",
      "metadata:",
      "  name: repotutor-refresh",
      "  namespace: repotutor-dev",
      "spec:",
      "  schedule: \"*/30 * * * *\"",
      "  jobTemplate:",
      "    spec:",
      "      template:",
      "        spec:",
      "          restartPolicy: OnFailure",
      "          containers:",
      "            - name: refresh",
      "              image: ghcr.io/veritas/repotutor-api:dev",
      "---",
      "apiVersion: v1",
      "kind: Pod",
      "metadata:",
      "  name: repotutor-debug",
      "  namespace: repotutor-dev",
      "  labels:",
      "    app: repotutor-debug",
      "spec:",
      "  containers:",
      "    - name: debug",
      "      image: ghcr.io/veritas/repotutor-api:dev"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "deployment.yaml"), [
      "apiVersion: apps/v1",
      "kind: Deployment",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "  labels:",
      "    app: repotutor-api",
      "spec:",
      "  replicas: 2",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-api",
      "  template:",
      "    metadata:",
      "      labels:",
      "        app: repotutor-api",
      "      annotations:",
      "        prometheus.io/scrape: \"true\"",
      "        repotutor.dev/config: placeholder",
      "    spec:",
      "      serviceAccountName: repotutor-api",
      "      securityContext:",
      "        runAsNonRoot: true",
      "      containers:",
      "        - name: api",
      "          image: ghcr.io/veritas/repotutor-api:dev",
      "          ports:",
      "            - containerPort: 8080",
      "          env:",
      "            - name: APP_MODE",
      "              value: dev",
      "          envFrom:",
      "            - configMapRef:",
      "                name: repotutor-api-config",
      "          volumeMounts:",
      "            - name: data",
      "              mountPath: /data",
      "          readinessProbe:",
      "            httpGet:",
      "              path: /ready",
      "              port: 8080",
      "          livenessProbe:",
      "            httpGet:",
      "              path: /health",
      "              port: 8080",
      "          startupProbe:",
      "            httpGet:",
      "              path: /startup",
      "              port: 8080",
      "          resources:",
      "            requests:",
      "              cpu: 100m",
      "              memory: 128Mi",
      "            limits:",
      "              cpu: 500m",
      "              memory: 512Mi",
      "          securityContext:",
      "            allowPrivilegeEscalation: false",
      "      volumes:",
      "        - name: data",
      "          persistentVolumeClaim:",
      "            claimName: repotutor-pvc"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "service.yaml"), [
      "apiVersion: v1",
      "kind: Service",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  selector:",
      "    app: repotutor-api",
      "  ports:",
      "    - port: 80",
      "      targetPort: 8080"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "ingress.yaml"), [
      "apiVersion: networking.k8s.io/v1",
      "kind: Ingress",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  rules:",
      "    - host: repotutor.local",
      "      http:",
      "        paths:",
      "          - path: /",
      "            pathType: Prefix",
      "            backend:",
      "              service:",
      "                name: repotutor-api",
      "                port:",
      "                  number: 80"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "hpa.yaml"), [
      "apiVersion: autoscaling/v2",
      "kind: HorizontalPodAutoscaler",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  scaleTargetRef:",
      "    apiVersion: apps/v1",
      "    kind: Deployment",
      "    name: repotutor-api",
      "  minReplicas: 2",
      "  maxReplicas: 5",
      "  metrics:",
      "    - type: Resource",
      "      resource:",
      "        name: cpu",
      "        target:",
      "          type: Utilization",
      "          averageUtilization: 70"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "pdb.yaml"), [
      "apiVersion: policy/v1",
      "kind: PodDisruptionBudget",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  minAvailable: 1",
      "  selector:",
      "    matchLabels:",
      "      app: repotutor-api"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "base", "networkpolicy.yaml"), [
      "apiVersion: networking.k8s.io/v1",
      "kind: NetworkPolicy",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: repotutor-dev",
      "spec:",
      "  podSelector:",
      "    matchLabels:",
      "      app: repotutor-api",
      "  policyTypes:",
      "    - Ingress"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "k8s", "overlays", "dev", "kustomization.yaml"), [
      "bases:",
      "  - ../../base",
      "resources:",
      "  - ../../base",
      "namespace: repotutor-dev",
      "components:",
      "  - ../components/observability",
      "patches:",
      "  - target:",
      "      kind: Deployment",
      "      name: repotutor-api",
      "    patch: |-",
      "      - op: replace",
      "        path: /spec/replicas",
      "        value: 2",
      "configMapGenerator:",
      "  - name: repotutor-dev-settings",
      "    literals:",
      "      - LOG_LEVEL=debug",
      "secretGenerator:",
      "  - name: repotutor-generated-reference",
      "    literals:",
      "      - TOKEN_NAME=APP_TOKEN_NAME",
      "images:",
      "  - name: ghcr.io/veritas/repotutor-api",
      "    newTag: dev-2026",
      "replacements:",
      "  - source:",
      "      kind: ConfigMap",
      "      name: repotutor-dev-settings",
      "      fieldPath: metadata.name",
      "    targets:",
      "      - select:",
      "          kind: Deployment",
      "          name: repotutor-api",
      "        fieldPaths:",
      "          - spec.template.metadata.annotations.[repotutor.dev/config]"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "kubernetes-readiness-report.json"), "utf8")) as {
      kubernetesSetups: Array<{ filePath: string; format: string; manifestCount: number; workloadCount: number; serviceCount: number; configCount: number; storageCount: number; securityCount: number; policyCount: number; probeCount: number; resourceCount: number; autoscalingCount: number; observabilityCount: number; workflowCount: number }>;
      manifestSignals: Array<{ signal: string; readiness: string }>;
      workloadSignals: Array<{ signal: string; readiness: string }>;
      networkSignals: Array<{ signal: string; readiness: string }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      storageSignals: Array<{ signal: string; readiness: string }>;
      securitySignals: Array<{ signal: string; readiness: string }>;
      healthSignals: Array<{ signal: string; readiness: string }>;
      kustomizeSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const deploymentSetup = report.kubernetesSetups.find((item) => item.filePath === "k8s/base/deployment.yaml");
    const overlaySetup = report.kubernetesSetups.find((item) => item.filePath === "k8s/overlays/dev/kustomization.yaml");
    expect(report.kubernetesSetups.length).toBeGreaterThan(0);
    expect(deploymentSetup?.format).toBe("manifest-yaml");
    expect(deploymentSetup?.manifestCount).toBeGreaterThan(0);
    expect(deploymentSetup?.workloadCount).toBeGreaterThan(0);
    expect(deploymentSetup?.serviceCount).toBeGreaterThan(0);
    expect(deploymentSetup?.configCount).toBeGreaterThan(0);
    expect(deploymentSetup?.storageCount).toBeGreaterThan(0);
    expect(deploymentSetup?.securityCount).toBeGreaterThan(0);
    expect(deploymentSetup?.probeCount).toBeGreaterThan(0);
    expect(deploymentSetup?.resourceCount).toBeGreaterThan(0);
    expect(overlaySetup?.format).toBe("kustomization");
    expect(report.kubernetesSetups.some((item) => item.workflowCount > 0)).toBe(true);
    for (const signal of ["api-version", "kind", "metadata", "labels", "annotations", "namespace"]) {
      expect(report.manifestSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["deployment", "statefulset", "daemonset", "job", "cronjob", "pod", "replicas"]) {
      expect(report.workloadSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["service", "ingress", "network-policy", "ports", "selectors"]) {
      expect(report.networkSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["configmap", "secret", "env", "env-from", "image-pull-secret"]) {
      expect(report.configSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["persistent-volume", "persistent-volume-claim", "volume-mount", "volume", "storage-class"]) {
      expect(report.storageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["service-account", "role", "role-binding", "cluster-role", "cluster-role-binding", "security-context", "pod-security-context"]) {
      expect(report.securitySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["readiness-probe", "liveness-probe", "startup-probe", "resources", "limits", "requests", "hpa", "pdb"]) {
      expect(report.healthSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kustomization", "resources", "bases", "patches", "configmap-generator", "secret-generator", "images", "replacements", "components"]) {
      expect(report.kustomizeSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kubectl-apply", "kubectl-diff", "kubectl-wait", "kubectl-rollout", "kubectl-logs", "kubectl-describe", "kubectl-port-forward", "kubectl-delete", "kustomize-build"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kubectl", "kustomize", "kubernetes-yaml", "kind", "minikube"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "kubernetes-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "kubernetes-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects GitOps readiness patterns without contacting controllers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-gitops-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-gitops-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "gitops", "apps"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "clusters", "dev"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "README.md"), [
      "GitOps workflow with Argo CD and Flux:",
      "Argo CD reviews Application drift before sync.",
      "argocd app diff repotutor-api",
      "argocd app sync repotutor-api --prune",
      "argocd app wait repotutor-api --health",
      "argocd app get repotutor-api",
      "argocd repo add https://github.com/example/platform.git",
      "argocd cluster add dev",
      "flux bootstrap github --owner=example --repository=platform --path=clusters/dev",
      "flux reconcile kustomization repotutor-api --with-source",
      "flux get all",
      "flux suspend kustomization repotutor-api",
      "flux resume kustomization repotutor-api",
      "flux trace deployment/repotutor-api",
      "flux tree kustomization repotutor-api",
      "flux logs --kind=Kustomization",
      "flux events",
      "Flux controllers include source-controller, kustomize-controller, helm-controller, notification-controller, and image-automation-controller.",
      "The rollout requires signed commit verification and manual approval before production promotion."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gitops", "apps", "argocd-app.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: Application",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: argocd",
      "spec:",
      "  project: platform",
      "  source:",
      "    repoURL: https://github.com/example/platform.git",
      "    targetRevision: main",
      "    path: services/repotutor",
      "    helm:",
      "      valueFiles:",
      "        - values-dev.yaml",
      "    kustomize:",
      "      namePrefix: dev-",
      "  destination:",
      "    server: https://kubernetes.default.svc",
      "    namespace: repotutor-dev",
      "  syncPolicy:",
      "    automated:",
      "      prune: true",
      "      selfHeal: true",
      "    syncOptions:",
      "      - CreateNamespace=true"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gitops", "apps", "applicationset.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: ApplicationSet",
      "metadata:",
      "  name: repotutor-fleet",
      "spec:",
      "  generators:",
      "    - git:",
      "        repoURL: https://github.com/example/platform.git",
      "        revision: main",
      "        directories:",
      "          - path: clusters/*",
      "    - matrix:",
      "        generators:",
      "          - clusters: {}",
      "          - list:",
      "              elements:",
      "                - name: dev",
      "  template:",
      "    spec:",
      "      project: platform",
      "      source:",
      "        repoURL: https://github.com/example/platform.git",
      "        targetRevision: main",
      "        path: \"{{path}}\"",
      "      destination:",
      "        server: https://kubernetes.default.svc",
      "        namespace: repotutor-dev"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "gitops", "apps", "project.yaml"), [
      "apiVersion: argoproj.io/v1alpha1",
      "kind: AppProject",
      "metadata:",
      "  name: platform",
      "spec:",
      "  sourceRepos:",
      "    - https://github.com/example/platform.git",
      "  destinations:",
      "    - namespace: repotutor-*",
      "      server: https://kubernetes.default.svc",
      "  clusterResourceWhitelist:",
      "    - group: \"\"",
      "      kind: Namespace",
      "  namespaceResourceBlacklist:",
      "    - group: \"\"",
      "      kind: Secret",
      "  syncWindows:",
      "    - kind: allow",
      "      schedule: \"0 2 * * *\"",
      "      duration: 1h"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "clusters", "dev", "flux.yaml"), [
      "apiVersion: source.toolkit.fluxcd.io/v1",
      "kind: GitRepository",
      "metadata:",
      "  name: platform",
      "  namespace: flux-system",
      "spec:",
      "  interval: 1m",
      "  url: https://github.com/example/platform.git",
      "  ref:",
      "    branch: main",
      "  secretRef:",
      "    name: platform-git-reference",
      "---",
      "apiVersion: source.toolkit.fluxcd.io/v1",
      "kind: HelmRepository",
      "metadata:",
      "  name: platform-charts",
      "spec:",
      "  interval: 10m",
      "  url: https://charts.example.invalid",
      "---",
      "apiVersion: source.toolkit.fluxcd.io/v1beta2",
      "kind: OCIRepository",
      "metadata:",
      "  name: platform-oci",
      "spec:",
      "  interval: 10m",
      "  url: oci://ghcr.io/example/platform",
      "---",
      "apiVersion: source.toolkit.fluxcd.io/v1",
      "kind: Bucket",
      "metadata:",
      "  name: platform-bucket",
      "spec:",
      "  interval: 10m",
      "  bucketName: platform",
      "  endpoint: storage.example.invalid",
      "---",
      "apiVersion: kustomize.toolkit.fluxcd.io/v1",
      "kind: Kustomization",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: flux-system",
      "spec:",
      "  interval: 5m",
      "  retryInterval: 1m",
      "  timeout: 2m",
      "  path: ./services/repotutor",
      "  prune: true",
      "  suspend: false",
      "  targetNamespace: repotutor-dev",
      "  serviceAccountName: flux-reconciler",
      "  sourceRef:",
      "    kind: GitRepository",
      "    name: platform",
      "  dependsOn:",
      "    - name: platform-base",
      "  healthChecks:",
      "    - apiVersion: apps/v1",
      "      kind: Deployment",
      "      name: repotutor-api",
      "      namespace: repotutor-dev",
      "---",
      "apiVersion: helm.toolkit.fluxcd.io/v2",
      "kind: HelmRelease",
      "metadata:",
      "  name: repotutor-api",
      "  namespace: flux-system",
      "spec:",
      "  interval: 5m",
      "  chart:",
      "    spec:",
      "      chart: ./chart",
      "      sourceRef:",
      "        kind: GitRepository",
      "        name: platform",
      "---",
      "apiVersion: image.toolkit.fluxcd.io/v1",
      "kind: ImageRepository",
      "metadata:",
      "  name: repotutor-api",
      "spec:",
      "  image: ghcr.io/example/repotutor-api",
      "  interval: 10m",
      "---",
      "apiVersion: image.toolkit.fluxcd.io/v1",
      "kind: ImagePolicy",
      "metadata:",
      "  name: repotutor-api",
      "spec:",
      "  imageRepositoryRef:",
      "    name: repotutor-api",
      "  policy:",
      "    semver:",
      "      range: \">=1.0.0\"",
      "---",
      "apiVersion: image.toolkit.fluxcd.io/v1",
      "kind: ImageUpdateAutomation",
      "metadata:",
      "  name: repotutor-api",
      "spec:",
      "  interval: 5m",
      "  sourceRef:",
      "    kind: GitRepository",
      "    name: platform",
      "---",
      "apiVersion: notification.toolkit.fluxcd.io/v1beta3",
      "kind: Provider",
      "metadata:",
      "  name: slack",
      "spec:",
      "  type: slack",
      "  secretRef:",
      "    name: slack-webhook-reference",
      "---",
      "apiVersion: notification.toolkit.fluxcd.io/v1beta3",
      "kind: Alert",
      "metadata:",
      "  name: repotutor-alerts",
      "spec:",
      "  providerRef:",
      "    name: slack",
      "---",
      "apiVersion: notification.toolkit.fluxcd.io/v1",
      "kind: Receiver",
      "metadata:",
      "  name: github-webhook",
      "spec:",
      "  type: github",
      "  events:",
      "    - ping"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "gitops-readiness-report.json"), "utf8")) as {
      gitopsSetups: Array<{ filePath: string; controller: string; applicationCount: number; sourceCount: number; destinationCount: number; syncPolicyCount: number; generatorCount: number; fluxSourceCount: number; fluxReconcileCount: number; imageAutomationCount: number; notificationCount: number; workflowCount: number }>;
      argoSignals: Array<{ signal: string; readiness: string }>;
      fluxSourceSignals: Array<{ signal: string; readiness: string }>;
      fluxReconcileSignals: Array<{ signal: string; readiness: string }>;
      imageNotificationSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const argoSetup = report.gitopsSetups.find((item) => item.filePath === "gitops/apps/argocd-app.yaml");
    const fluxSetup = report.gitopsSetups.find((item) => item.filePath === "clusters/dev/flux.yaml");
    expect(report.gitopsSetups.length).toBeGreaterThan(0);
    expect(argoSetup?.controller).toBe("argo-cd");
    expect(argoSetup?.applicationCount).toBeGreaterThan(0);
    expect(argoSetup?.sourceCount).toBeGreaterThan(0);
    expect(argoSetup?.destinationCount).toBeGreaterThan(0);
    expect(argoSetup?.syncPolicyCount).toBeGreaterThan(0);
    expect(fluxSetup?.controller).toBe("flux");
    expect(fluxSetup?.fluxSourceCount).toBeGreaterThan(0);
    expect(fluxSetup?.fluxReconcileCount).toBeGreaterThan(0);
    expect(fluxSetup?.imageAutomationCount).toBeGreaterThan(0);
    expect(fluxSetup?.notificationCount).toBeGreaterThan(0);
    for (const signal of ["application", "applicationset", "app-project", "repo-url", "target-revision", "path", "destination-server", "destination-namespace", "sync-policy", "automated-sync", "prune", "self-heal", "sync-options", "helm-source", "kustomize-source"]) {
      expect(report.argoSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["git-repository", "helm-repository", "oci-repository", "bucket", "source-ref", "interval", "secret-ref"]) {
      expect(report.fluxSourceSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["kustomization", "helm-release", "depends-on", "prune", "suspend", "health-checks", "timeout", "retry-interval", "target-namespace", "service-account"]) {
      expect(report.fluxReconcileSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["image-repository", "image-policy", "image-update-automation", "receiver", "alert", "provider", "webhook"]) {
      expect(report.imageNotificationSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["argocd-app-sync", "argocd-app-diff", "argocd-app-wait", "argocd-app-get", "argocd-repo-add", "argocd-cluster-add", "flux-bootstrap", "flux-reconcile", "flux-get", "flux-suspend", "flux-resume", "flux-trace", "flux-tree", "flux-logs", "flux-events"]) {
      expect(report.workflowSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["dry-run", "namespace", "project-boundary", "sync-window", "allow-list", "deny-list", "signed-commit", "health-check", "drift-detection", "manual-approval"]) {
      expect(report.safetySignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    for (const signal of ["argocd", "argo-cd", "flux", "fluxcd", "source-controller", "kustomize-controller", "helm-controller", "notification-controller", "image-automation-controller"]) {
      expect(report.packageSignals.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
    }
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "gitops-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "gitops-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects LLM eval readiness patterns without running eval tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-eval-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-eval-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, ".github", "workflows"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "datasets"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "evals", "registry", "data", "qa"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "evals", "registry", "evals"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "prompts"), { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "evals"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      scripts: {
        eval: "promptfoo eval -c promptfooconfig.yaml --no-cache -o results/promptfoo.json",
        redteam: "promptfoo redteam eval -c promptfooconfig.redteam.yaml -o results/redteam.json",
        "eval:openai": "oaieval gpt-4.1-mini support_eval"
      },
      devDependencies: {
        "@langchain/openai": "latest",
        deepeval: "latest",
        langsmith: "latest",
        openevals: "latest",
        promptfoo: "latest",
        ragas: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "pyproject.toml"), [
      "[project]",
      "name = \"repotutor-llm-eval-fixture\"",
      "dependencies = [\"promptfoo\", \"openai-evals\", \"openevals\", \"langsmith\", \"deepeval\", \"ragas\"]"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "prompts", "support.txt"), [
      "Use the support policy and answer {{question}} with {{context}}.",
      "Include only facts from the provided policy."
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "promptfooconfig.yaml"), [
      "prompts:",
      "  - file://prompts/support.txt",
      "  - |",
      "    messages:",
      "      - role: system",
      "        content: \"Answer with the supplied context only.\"",
      "      - role: user",
      "        content: \"{{question}}\"",
      "providers:",
      "  - openai:gpt-4.1-mini",
      "tests:",
      "  - vars:",
      "      question: \"Can I return a damaged product?\"",
      "      context: \"Customers can request a refund within 30 days.\"",
      "    expected: \"refund within 30 days\"",
      "    assert:",
      "      - type: contains",
      "        value: refund",
      "      - type: llm-rubric",
      "        value: \"Answer is faithful to the supplied context.\"",
      "        threshold: 0.8",
      "dataset:",
      "  path: file://datasets/eval.csv",
      "output: results/promptfoo.json",
      "few_shot_examples:",
      "  - input: \"What is the policy?\"",
      "    output: \"Use only supplied policy text.\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "promptfooconfig.redteam.yaml"), [
      "redteam:",
      "  purpose: \"Support bot safety coverage mapped to OWASP LLM risks\"",
      "  plugins:",
      "    - pii:api-db",
      "    - prompt-extraction",
      "    - excessive-agency",
      "  strategies:",
      "    - jailbreak",
      "    - prompt-injection",
      "  output: results/redteam.json"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evals", "registry", "evals", "support.yaml"), [
      "support_eval:",
      "  id: support.eval",
      "  metrics: [accuracy]",
      "  class: evals.elsuite.modelgraded.classify:ModelBasedClassify",
      "  args:",
      "    samples_jsonl: evals/registry/data/qa/samples.jsonl",
      "    eval_type: cot_classify",
      "    modelgraded_spec: evals/registry/evals/support-modelgraded.yaml",
      "    completion_fns:",
      "      - gpt-4.1-mini"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evals", "registry", "evals", "support-modelgraded.yaml"), [
      "prompt: |",
      "  Grade correctness and hallucination risk for the answer.",
      "choice_scores:",
      "  pass: 1.0",
      "  fail: 0.0"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "evals", "registry", "data", "qa", "samples.jsonl"), [
      JSON.stringify({ input: [{ role: "user", content: "Can I get a refund?" }], ideal: "Customers can request a refund within 30 days." })
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "datasets", "eval.csv"), [
      "question,reference_output",
      "\"Can I return a damaged product?\",\"refund within 30 days\""
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, "src", "evals", "judge.ts"), [
      "import { createLLMAsJudge, CORRECTNESS_PROMPT, HALLUCINATION_PROMPT } from \"openevals\";",
      "const correctness = createLLMAsJudge({",
      "  prompt: CORRECTNESS_PROMPT,",
      "  model: \"openai:gpt-4.1-mini\",",
      "  feedbackKey: \"score\",",
      "  continuous: true,",
      "  choices: [0, 1],",
      "  few_shot_examples: [{ input: \"refund\", output: \"score: 1\" }]",
      "});",
      "const hallucination = createLLMAsJudge({ prompt: HALLUCINATION_PROMPT, feedbackKey: \"hallucination_score\" });",
      "export async function evaluate(outputs: string, referenceOutputs: string) {",
      "  const reference_outputs = [referenceOutputs];",
      "  return [await correctness({ outputs, reference_outputs, referenceOutputs }), await hallucination({ outputs, reference_outputs })];",
      "}"
    ].join("\n"));
    await fs.writeFile(path.join(sourceRoot, ".github", "workflows", "evals.yml"), [
      "name: evals",
      "on:",
      "  pull_request:",
      "  workflow_dispatch:",
      "jobs:",
      "  eval:",
      "    runs-on: ubuntu-latest",
      "    env:",
      "      OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}",
      "      LANGSMITH_API_KEY: ${{ secrets.LANGSMITH_API_KEY }}",
      "    steps:",
      "      - run: promptfoo eval -c promptfooconfig.yaml --no-cache -o results/promptfoo.json",
      "      - run: promptfoo redteam eval -c promptfooconfig.redteam.yaml -o results/redteam.json",
      "      - run: oaieval gpt-4.1-mini support_eval --record_path results/openai-evals.jsonl",
      "      - run: node -e \"client.evaluate(() => true, { projectName: 'support-eval' })\""
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-eval-readiness-report.json"), "utf8")) as {
      evalSetups: Array<{ filePath: string; framework: string; promptCount: number; providerCount: number; testCaseCount: number; assertionCount: number; datasetCount: number; judgeCount: number; redteamCount: number; outputCount: number }>;
      configSignals: Array<{ signal: string; readiness: string }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      providerSignals: Array<{ signal: string; readiness: string }>;
      testCaseSignals: Array<{ signal: string; readiness: string }>;
      judgeSignals: Array<{ signal: string; readiness: string }>;
      datasetSignals: Array<{ signal: string; readiness: string }>;
      redteamSignals: Array<{ signal: string; readiness: string }>;
      workflowSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
      riskQueue: unknown[];
    };
    const promptfooSetup = report.evalSetups.find((item) => item.filePath === "promptfooconfig.yaml");
    expect(report.evalSetups.length).toBeGreaterThan(0);
    expect(promptfooSetup?.framework).toBe("promptfoo");
    expect(promptfooSetup?.promptCount).toBeGreaterThan(0);
    expect(promptfooSetup?.providerCount).toBeGreaterThan(0);
    expect(promptfooSetup?.testCaseCount).toBeGreaterThan(0);
    expect(promptfooSetup?.assertionCount).toBeGreaterThan(0);
    expect(promptfooSetup?.datasetCount).toBeGreaterThan(0);
    expect(report.evalSetups.some((item) => item.framework === "openai-evals")).toBe(true);
    expect(report.evalSetups.some((item) => item.framework === "openevals")).toBe(true);

    const expectReady = (items: Array<{ signal: string; readiness: string }>, signals: string[]) => {
      for (const signal of signals) {
        expect(items.some((item) => item.signal === signal && item.readiness === "ready")).toBe(true);
      }
    };
    expectReady(report.configSignals, ["promptfoo-config", "eval-registry", "eval-class", "samples-jsonl", "pyproject", "package-script"]);
    expectReady(report.promptSignals, ["prompt", "prompt-file", "prompt-template", "vars", "messages", "few-shot"]);
    expectReady(report.providerSignals, ["provider", "model-name", "grader-model", "completion-fn", "api-key-env"]);
    expectReady(report.testCaseSignals, ["tests", "vars", "assert", "expected", "rubric", "threshold"]);
    expectReady(report.judgeSignals, ["llm-rubric", "modelgraded-spec", "llm-as-judge", "correctness", "hallucination", "feedback-key", "score"]);
    expectReady(report.datasetSignals, ["samples-jsonl", "dataset", "csv", "jsonl", "reference-output", "ideal"]);
    expectReady(report.redteamSignals, ["redteam", "plugins", "strategies", "jailbreak", "prompt-injection", "pii", "owasp"]);
    expectReady(report.workflowSignals, ["promptfoo-eval", "promptfoo-redteam", "oaieval", "evaluate", "ci", "report-output"]);
    expectReady(report.packageSignals, ["promptfoo", "openevals", "openai-evals", "langsmith", "deepeval", "ragas"]);
    expect(report.riskQueue).toHaveLength(0);
    await expect(fs.access(path.join(result.session.outputPaths.markdown, "llm-eval-readiness.md"))).resolves.toBeUndefined();
    await expect(fs.access(path.join(result.session.outputPaths.html, "llm-eval-readiness.html"))).resolves.toBeUndefined();
  });

  it("detects LangChain runnable readiness patterns without running model providers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        "@langchain/openai": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "langchain.ts"), [
      "import { z } from \"zod\";",
      "import { ChatOpenAI } from \"@langchain/openai\";",
      "import { ChatPromptTemplate, MessagesPlaceholder } from \"@langchain/core/prompts\";",
      "import { SystemMessage, HumanMessage } from \"@langchain/core/messages\";",
      "import { StringOutputParser, JsonOutputParser } from \"@langchain/core/output_parsers\";",
      "import { RunnableLambda, RunnableMap, RunnablePassthrough, RunnableSequence, RunnableWithMessageHistory } from \"@langchain/core/runnables\";",
      "import { tool, createAgent } from \"langchain\";",
      "",
      "const model = new ChatOpenAI({ model: \"gpt-4o-mini\", temperature: 0, maxTokens: 256, apiKey: process.env.OPENAI_API_KEY });",
      "const fallbackModel = new ChatOpenAI({ model: \"gpt-4o\", temperature: 0 }).withRetry({ stopAfterAttempt: 2 }).withFallbacks({ fallbacks: [model] });",
      "const prompt = ChatPromptTemplate.fromMessages([",
      "  new SystemMessage(\"Answer with retrieved context only.\"),",
      "  new MessagesPlaceholder(\"history\"),",
      "  new HumanMessage(\"{question}\"),",
      "]);",
      "const schema = z.object({ answer: z.string(), sources: z.array(z.string()) });",
      "const searchKnowledge = tool(async ({ query }) => query, {",
      "  name: \"search_knowledge\",",
      "  description: \"Search the knowledge base.\",",
      "  schema: z.object({ query: z.string() }),",
      "});",
      "const retriever = RunnableLambda.from(async (question: string) => [`context for ${question}`]);",
      "const mapped = RunnableMap.from({",
      "  question: new RunnablePassthrough(),",
      "  context: retriever,",
      "});",
      "const chain = RunnableSequence.from([",
      "  RunnablePassthrough.assign({ context: (input) => input.context }),",
      "  prompt,",
      "  fallbackModel.bindTools([searchKnowledge]),",
      "  new JsonOutputParser(),",
      "]).pipe(new StringOutputParser()).asTool({ schema, name: \"answer_question\", description: \"Answer a question\" });",
      "const agent = createAgent({ model, tools: [searchKnowledge, chain], systemPrompt: \"Use tools carefully.\" });",
      "const historyAware = new RunnableWithMessageHistory({ runnable: agent, config: {}, getMessageHistory: async () => ({ messages: [] }) });",
      "export async function answer(question: string) {",
      "  const input = { question, history: [] };",
      "  await mapped.batch([question]);",
      "  const stream = await historyAware.stream({ messages: [{ role: \"user\", content: question }] });",
      "  for await (const chunk of stream) void chunk;",
      "  return chain.invoke(input, { callbacks: [], tags: [\"llm-readiness\"], metadata: { source: \"fixture\" } });",
      "}",
      "void schema;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; promptCount: number; toolCount: number; agentCount: number; outputCount: number; streamingCount: number; observabilityCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      safetySignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/langchain.ts");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.agentCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining(["chat-model", "model-name", "temperature", "provider-config"]));
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining(["chat-prompt-template", "system-message", "human-message", "messages-placeholder"]));
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining(["runnable-sequence", "runnable-lambda", "runnable-passthrough", "runnable-map", "pipe-chain", "invoke", "batch", "stream", "as-tool", "with-message-history", "with-retry", "with-fallbacks"]));
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining(["tool", "tool-schema", "tool-calling", "agent"]));
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining(["output-parser", "zod-schema"]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["stream", "callbacks", "tracing"]));
    expect(readySignals(report.safetySignals)).toEqual(expect.arrayContaining(["retry", "fallback"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core", "@langchain/openai"]));
    const markdown = await fs.readFile(path.join(result.session.outputPaths.markdown, "llm-readiness.md"), "utf8");
    expect(markdown).toContain("## Runnable Signals");
    const html = await fs.readFile(path.join(result.session.outputPaths.html, "llm-readiness.html"), "utf8");
    expect(html).toContain("Runnable Signals");
  });

  it("detects LangChain LLM result output readiness without generating output", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-result-output-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-result-output-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "llm-results.ts"), [
      "import { AIMessageChunk } from \"@langchain/core/messages\";",
      "import { ChatGenerationChunk, GenerationChunk, RUN_KEY } from \"@langchain/core/outputs\";",
      "import type { ChatGeneration, ChatGenerationChunkFields, ChatResult, Generation, GenerationChunkFields, LLMResult } from \"@langchain/core/outputs\";",
      "",
      "const baseChunk = new GenerationChunk({",
      "  text: \"Hello\",",
      "  generationInfo: { finish_reason: \"length\" },",
      "} satisfies GenerationChunkFields);",
      "const mergedChunk = baseChunk.concat(new GenerationChunk({",
      "  text: \" world\",",
      "  generationInfo: { model_name: \"static-fixture\" },",
      "}));",
      "const chatChunk = new ChatGenerationChunk({",
      "  text: mergedChunk.text,",
      "  generationInfo: mergedChunk.generationInfo,",
      "  message: new AIMessageChunk({ content: mergedChunk.text }),",
      "} satisfies ChatGenerationChunkFields);",
      "const chatGeneration: ChatGeneration = {",
      "  text: chatChunk.text,",
      "  message: chatChunk.message,",
      "  generationInfo: chatChunk.generationInfo,",
      "};",
      "export const chatResult: ChatResult = {",
      "  generations: [chatGeneration],",
      "  llmOutput: { tokenUsage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 } },",
      "};",
      "export const llmResult: LLMResult = {",
      "  generations: [[{ text: chatChunk.text, generationInfo: { logprobs: [] } } satisfies Generation]],",
      "  llmOutput: { tokenUsage: { promptTokens: 1, completionTokens: 2, totalTokens: 3 } },",
      "  [RUN_KEY]: { runId: \"static-fixture\" },",
      "};",
      "const outputTerms = \"LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens concat BaseMessageChunk\";",
      "void outputTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; outputCount: number; streamingCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/llm-results.ts");
    expect(report.sourcePattern).toContain("LLMResult Generation GenerationChunk GenerationChunkFields");
    expect(report.sourcePattern).toContain("ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult");
    expect(report.sourcePattern).toContain("RUN_KEY generationInfo");
    expect(report.sourcePattern).toContain("llmOutput generations tokenUsage");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining([
      "llm-result-generations",
      "generation-info",
      "generation-chunk-concat",
      "chat-generation-chunk",
      "chat-result-output",
      "run-key-metadata"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain legacy stream bridge readiness without consuming streams", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-legacy-stream-bridge-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-legacy-stream-bridge-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "legacy-stream-bridge.ts"), [
      "import { convertChunksToEvents } from \"@langchain/core/language_models/compat\";",
      "import type { ChatModelStreamEvent, ContentBlockDelta } from \"@langchain/core/language_models/event\";",
      "import { AIMessageChunk } from \"@langchain/core/messages\";",
      "import type { ContentBlock } from \"@langchain/core/messages/content\";",
      "import type { ChatGenerationChunk } from \"@langchain/core/outputs\";",
      "",
      "export type LegacyBridgeContracts = ChatGenerationChunk | AIMessageChunk | ChatModelStreamEvent | ContentBlockDelta | ContentBlock;",
      "export async function bridge(chunks: AsyncIterable<ChatGenerationChunk>, signal?: AbortSignal) {",
      "  const events: ChatModelStreamEvent[] = [];",
      "  for await (const event of convertChunksToEvents(chunks, { signal })) {",
      "    events.push(event);",
      "  }",
      "  return events;",
      "}",
      "export const legacyBridgeTerms = \"convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens content-block-start content-block-delta text-delta tool_call_chunk options?.signal?.throwIfAborted AbortSignal\";",
      "void legacyBridgeTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; streamingCount: number; observabilityCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/legacy-stream-bridge.ts");
    expect(report.sourcePattern).toContain("convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk");
    expect(report.sourcePattern).toContain("activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload");
    expect(report.sourcePattern).toContain("MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining(["chat-model-stream-v2"]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "legacy-chat-generation-bridge",
      "stream-event-conversion",
      "stream-active-blocks",
      "stream-image-tool-output",
      "stream-audio-payload",
      "stream-abort-signal",
      "stream-usage-start"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain cache storage readiness without reading cache data", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-cache-storage-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-cache-storage-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "cache-storage.ts"), [
      "import { BaseCache, InMemoryCache, defaultHashKeyEncoder, deserializeStoredGeneration, serializeGeneration } from \"@langchain/core/caches\";",
      "import { AIMessage } from \"@langchain/core/messages\";",
      "import type { ContentBlock } from \"@langchain/core/messages/content\";",
      "import type { ChatGeneration, Generation } from \"@langchain/core/outputs\";",
      "import type { StoredGeneration } from \"@langchain/core/messages\";",
      "",
      "export type CacheContracts = BaseCache<Generation[]> | InMemoryCache<Generation[]> | StoredGeneration | ContentBlock;",
      "export const cache = new InMemoryCache<Generation[]>();",
      "cache.makeDefaultKeyEncoder((prompt, llmKey) => defaultHashKeyEncoder(prompt, llmKey));",
      "const chatGeneration: ChatGeneration = {",
      "  text: \"cached text\",",
      "  message: new AIMessage({ content: \"cached text\" }),",
      "};",
      "const storedGeneration = serializeGeneration(chatGeneration);",
      "const restoredGeneration = deserializeStoredGeneration(storedGeneration);",
      "const globalCache = InMemoryCache.global();",
      "export const cacheStorageTerms = \"BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock cache.lookup cache.update\";",
      "void cache;",
      "void globalCache;",
      "void restoredGeneration;",
      "void cacheStorageTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; outputCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/cache-storage.ts");
    expect(report.sourcePattern).toContain("BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256");
    expect(report.sourcePattern).toContain("serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration");
    expect(report.sourcePattern).toContain("makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining([
      "base-cache-interface",
      "in-memory-cache",
      "cache-key-encoder",
      "cache-generation-serialization",
      "cache-chat-generation-message",
      "global-cache-map",
      "chat-model-cache"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain output parser readiness without parsing model output", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-output-parser-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-output-parser-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "output-parsers.ts"), [
      "import { BytesOutputParser, CommaSeparatedListOutputParser, JsonOutputParser, MarkdownListOutputParser, NumberedListOutputParser, StringOutputParser, XMLOutputParser } from \"@langchain/core/output_parsers\";",
      "import type { BaseCumulativeTransformOutputParser, BaseLLMOutputParser, BaseOutputParser, BaseTransformOutputParser, FormatInstructionsOptions, OutputParserException } from \"@langchain/core/output_parsers\";",
      "import { JsonOutputFunctionsParser, JsonKeyOutputFunctionsParser, OutputFunctionsParser } from \"@langchain/core/output_parsers/openai_functions\";",
      "import { JsonOutputKeyToolsParser, JsonOutputToolsParser } from \"@langchain/core/output_parsers/openai_tools\";",
      "import { StandardSchemaOutputParser } from \"@langchain/core/output_parsers/standard_schema\";",
      "",
      "const parsers = [new StringOutputParser(), new JsonOutputParser(), new BytesOutputParser(), new CommaSeparatedListOutputParser(), new NumberedListOutputParser(), new MarkdownListOutputParser(), new XMLOutputParser({ tags: [\"answer\"] })];",
      "const functionsParser = new JsonOutputFunctionsParser({ argsOnly: true, diff: true });",
      "const keyFunctionsParser = new JsonKeyOutputFunctionsParser({ attrName: \"answer\" });",
      "const toolsParser = new JsonOutputToolsParser({ returnId: true, diff: true });",
      "const keyToolsParser = new JsonOutputKeyToolsParser({ keyName: \"answer\", returnSingle: true, returnId: true });",
      "const standardSchemaParser = StandardSchemaOutputParser.fromSerializableSchema({ \"~standard\": { version: 1, vendor: \"fixture\", validate: (value: unknown) => ({ value }) } });",
      "const outputParserTerms = \"BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly\";",
      "void parsers;",
      "void functionsParser;",
      "void keyFunctionsParser;",
      "void toolsParser;",
      "void keyToolsParser;",
      "void standardSchemaParser;",
      "void ({} as BaseLLMOutputParser);",
      "void ({} as BaseOutputParser);",
      "void ({} as BaseTransformOutputParser);",
      "void ({} as BaseCumulativeTransformOutputParser);",
      "void ({} as FormatInstructionsOptions);",
      "void ({} as OutputParserException);",
      "void outputParserTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; outputCount: number; streamingCount: number }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/output-parsers.ts");
    expect(report.sourcePattern).toContain("BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult");
    expect(report.sourcePattern).toContain("BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult");
    expect(report.sourcePattern).toContain("ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser");
    expect(report.sourcePattern).toContain("XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown");
    expect(report.sourcePattern).toContain("OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser");
    expect(report.sourcePattern).toContain("JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining([
      "base-output-parser",
      "transform-output-parser",
      "cumulative-output-parser",
      "json-output-parser",
      "string-output-parser",
      "bytes-output-parser",
      "list-output-parser",
      "xml-output-parser",
      "standard-schema-output-parser",
      "openai-functions-parser",
      "openai-tools-parser"
    ]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["stream-transformer"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain callback manager and tracer readiness without running callbacks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-callback-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-callback-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "callbacks.ts"), [
      "import { dispatchCustomEvent } from \"@langchain/core/callbacks/dispatch\";",
      "import { BaseCallbackHandler, type BaseCallbackHandlerInput, type HandleLLMNewTokenCallbackFields } from \"@langchain/core/callbacks/base\";",
      "import { CallbackManager, type BaseCallbackConfig, type CallbackManagerOptions } from \"@langchain/core/callbacks/manager\";",
      "import { EventStreamCallbackHandler, type EventStreamCallbackHandlerInput, type StreamEvent, type StreamEventData } from \"@langchain/core/tracers/event_stream\";",
      "import { LogStreamCallbackHandler, RunLog, RunLogPatch, type LogEntry, type RunState, type SchemaFormat } from \"@langchain/core/tracers/log_stream\";",
      "import { RunCollectorCallbackHandler } from \"@langchain/core/tracers/run_collector\";",
      "import { RootListenersTracer } from \"@langchain/core/tracers/root_listener\";",
      "",
      "class StaticCallbackHandler extends BaseCallbackHandler {",
      "  name = \"static_callback_handler\";",
      "  ignoreLLM = false;",
      "  ignoreChain = false;",
      "  ignoreAgent = false;",
      "  ignoreRetriever = false;",
      "  ignoreCustomEvent = false;",
      "  raiseError = true;",
      "  async handleLLMNewToken(_token: string, _idx: { prompt: number; completion: number }, _runId: string, _parentRunId?: string, _tags?: string[], _fields?: HandleLLMNewTokenCallbackFields) {}",
      "  async handleChatModelStreamEvent(_event: unknown, _runId: string) {}",
      "  async handleCustomEvent(_eventName: string, _data: unknown) {}",
      "}",
      "const manager = CallbackManager.configure([new StaticCallbackHandler()]);",
      "const childManager = manager?.copy?.([], true) ?? manager;",
      "const eventStream = new EventStreamCallbackHandler({ includeNames: [\"chain\"], includeTypes: [\"llm\"], includeTags: [\"trace\"], excludeNames: [\"skip\"], excludeTypes: [\"tool\"], excludeTags: [\"private\"] });",
      "const logStream = new LogStreamCallbackHandler({ _schemaFormat: \"streaming_events\", autoClose: true });",
      "const collector = new RunCollectorCallbackHandler({ exampleId: \"example-1\" });",
      "const rootTracer = new RootListenersTracer({ config: { callbacks: manager }, onStart: () => undefined, onEnd: () => undefined, onError: () => undefined });",
      "const callbackTerms = \"BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate\";",
      "void childManager;",
      "void eventStream;",
      "void logStream;",
      "void collector;",
      "void rootTracer;",
      "void ({} as BaseCallbackHandlerInput);",
      "void ({} as BaseCallbackConfig);",
      "void ({} as CallbackManagerOptions);",
      "void ({} as EventStreamCallbackHandlerInput);",
      "void ({} as StreamEvent);",
      "void ({} as StreamEventData);",
      "void ({} as LogEntry);",
      "void ({} as RunState);",
      "void ({} as SchemaFormat);",
      "void RunLog;",
      "void RunLogPatch;",
      "void dispatchCustomEvent;",
      "void callbackTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number; observabilityCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/callbacks.ts");
    expect(report.sourcePattern).toContain("BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM");
    expect(report.sourcePattern).toContain("CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun");
    expect(report.sourcePattern).toContain("dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData");
    expect(report.sourcePattern).toContain("LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState");
    expect(report.sourcePattern).toContain("RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "base-callback-handler",
      "callback-manager-config",
      "callback-run-manager",
      "custom-event-dispatch",
      "event-stream-callback",
      "log-stream-callback",
      "run-collector-tracer",
      "root-listener-tracer"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain custom event dispatch boundaries without dispatching events", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-custom-event-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-custom-event-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "custom-events.ts"), [
      "import { dispatchCustomEvent } from \"@langchain/core/callbacks/dispatch\";",
      "import { dispatchCustomEvent as dispatchCustomEventWeb } from \"@langchain/core/callbacks/dispatch/web\";",
      "import { CallbackManager } from \"@langchain/core/callbacks/manager\";",
      "import { AsyncLocalStorageProviderSingleton } from \"@langchain/core/singletons\";",
      "import { ensureConfig, getCallbackManagerForConfig, type RunnableConfig } from \"@langchain/core/runnables\";",
      "",
      "const config = ensureConfig({ callbacks: CallbackManager.fromHandlers({ handleCustomEvent: async () => undefined }) });",
      "const customEventTerms = \"AsyncLocalStorageProviderSingleton.initializeGlobalInstance AsyncLocalStorage ensureConfig dispatchCustomEventWeb getCallbackManagerForConfig parentRunId getParentRunId Unable to dispatch a custom event without a parent run id callbacks/dispatch/web handleCustomEvent RunnableConfig\";",
      "void config;",
      "void dispatchCustomEvent;",
      "void dispatchCustomEventWeb;",
      "void AsyncLocalStorageProviderSingleton;",
      "void getCallbackManagerForConfig;",
      "void ({} as RunnableConfig);",
      "void customEventTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/custom-events.ts");
    expect(report.sourcePattern).toContain("dispatchCustomEvent");
    expect(report.sourcePattern).toContain("getCallbackManagerForConfig");
    expect(report.sourcePattern).toContain("AsyncLocalStorageProviderSingleton");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "custom-event-dispatch",
      "custom-event-node-dispatch",
      "custom-event-web-dispatch",
      "custom-event-config-required",
      "custom-event-parent-run",
      "custom-event-async-local"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain runnable config propagation without invoking runnables", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-runnable-config-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-runnable-config-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "runnable-config.ts"), [
      "import { RunnableLambda, DEFAULT_RECURSION_LIMIT, ensureConfig, getCallbackManagerForConfig, mergeConfigs, patchConfig, pickRunnableConfigKeys, type RunnableConfig } from \"@langchain/core/runnables\";",
      "import { consumeAsyncIterableInContext, consumeIteratorInContext } from \"@langchain/core/runnables/iter\";",
      "import { AsyncLocalStorageProviderSingleton } from \"@langchain/core/singletons\";",
      "",
      "const baseConfig: RunnableConfig = {",
      "  configurable: { model: \"fixture\", thread_id: \"thread-1\" },",
      "  tags: [\"trace\"],",
      "  metadata: { source: \"fixture\" },",
      "  recursionLimit: DEFAULT_RECURSION_LIMIT,",
      "  maxConcurrency: 2,",
      "  timeout: 1000,",
      "  signal: AbortSignal.timeout(1000)",
      "};",
      "const merged = mergeConfigs(baseConfig, { metadata: { tenant: \"test\" }, tags: [\"child\"], configurable: { role: \"reader\" } });",
      "const ensured = ensureConfig(merged);",
      "const patched = patchConfig(ensured, { runName: \"fixture-run\", runId: \"run-1\", recursionLimit: 3, maxConcurrency: 1, configurable: { role: \"reviewer\" } });",
      "const picked = pickRunnableConfigKeys(patched);",
      "const runnable = RunnableLambda.from((input: string, options?: RunnableConfig) => ({ input, options: pickRunnableConfigKeys(options) }));",
      "const configTerms = \"RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig\";",
      "void picked;",
      "void runnable;",
      "void getCallbackManagerForConfig;",
      "void AsyncLocalStorageProviderSingleton;",
      "void consumeIteratorInContext;",
      "void consumeAsyncIterableInContext;",
      "void configTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number; observabilityCount: number }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/runnable-config.ts");
    expect(report.sourcePattern).toContain("RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig");
    expect(report.sourcePattern).toContain("getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys");
    expect(report.sourcePattern).toContain("AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency");
    expect(report.sourcePattern).toContain("timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store");
    expect(report.sourcePattern).toContain("consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "runnable-config",
      "config-ensure",
      "config-merge",
      "config-patch",
      "config-pick-keys",
      "runnable-callback-manager-config",
      "async-local-config",
      "recursion-limit",
      "config-timeout-signal",
      "configurable-runtime"
    ]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["callbacks", "tracing"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain async-local runnable run-tree propagation without invoking runnables", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-async-local-runtree-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-async-local-runtree-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest",
        langsmith: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "async-local-runnable.ts"), [
      "import { CallbackManager } from \"@langchain/core/callbacks/manager\";",
      "import { RunnableLambda, type RunnableConfig } from \"@langchain/core/runnables\";",
      "import { AsyncLocalStorageProviderSingleton } from \"@langchain/core/singletons\";",
      "import { LangChainTracer } from \"@langchain/core/tracers/tracer_langchain\";",
      "import { RunTree } from \"langsmith\";",
      "",
      "const callbackManager = CallbackManager._configureSync({ callbacks: [new LangChainTracer()] });",
      "const rootRunTree = new RunTree({ name: \"<runnable_lambda>\", run_type: \"chain\", inputs: {}, tracingEnabled: false });",
      "const config: RunnableConfig = { callbacks: callbackManager, metadata: { parentRunId: rootRunTree.id } };",
      "const runnable = RunnableLambda.from((input: string) => input);",
      "const asyncLocalTerms = \"MockAsyncLocalStorage LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance getRunnableConfig runWithConfig avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance\";",
      "void config;",
      "void runnable;",
      "void rootRunTree;",
      "void AsyncLocalStorageProviderSingleton;",
      "void asyncLocalTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number; observabilityCount: number }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/async-local-runnable.ts");
    expect(report.sourcePattern).toContain("runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider");
    expect(report.sourcePattern).toContain("getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId");
    expect(report.sourcePattern).toContain("LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda>");
    expect(report.sourcePattern).toContain("runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run");
    expect(report.sourcePattern).toContain("initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "async-local-config",
      "async-local-child-config",
      "async-local-run-tree",
      "async-local-root-run-control",
      "async-local-context-carryover",
      "async-local-global-instance"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain runnable graph and Mermaid contracts without rendering graphs", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-runnable-graph-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-runnable-graph-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "runnable-graph.ts"), [
      "import { RunnableLambda } from \"@langchain/core/runnables\";",
      "import { Graph } from \"@langchain/core/runnables/graph\";",
      "import { drawMermaid, drawMermaidImage } from \"@langchain/core/runnables/graph_mermaid\";",
      "",
      "const graph = new Graph();",
      "const start = graph.addNode(RunnableLambda.from((input: string) => input), \"start\", { role: \"input\" });",
      "const finish = graph.addNode(RunnableLambda.from((input: string) => input.toUpperCase()), \"finish\", { role: \"output\" });",
      "const edge = graph.addEdge(start, finish, \"route when valid\", true);",
      "const first = graph.firstNode();",
      "const last = graph.lastNode();",
      "const serialized = graph.toJSON();",
      "const reidentified = graph.reid();",
      "reidentified.trimFirstNode();",
      "reidentified.trimLastNode();",
      "const mermaid = graph.drawMermaid({ withStyles: true, curveStyle: \"linear\", nodeColors: { default: \"fill:#fff\" }, wrapLabelNWords: 4 });",
      "const graphTerms = \"Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType\";",
      "void edge;",
      "void first;",
      "void last;",
      "void serialized;",
      "void mermaid;",
      "void drawMermaid;",
      "void drawMermaidImage;",
      "void graphTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/runnable-graph.ts");
    expect(report.sourcePattern).toContain("Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds");
    expect(report.sourcePattern).toContain("addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid");
    expect(report.sourcePattern).toContain("drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode");
    expect(report.sourcePattern).toContain("_escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle");
    expect(report.sourcePattern).toContain("withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType");
    expect(setup?.provider).toBe("langchain");
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "runnable-graph",
      "runnable-graph-json",
      "runnable-graph-edge",
      "runnable-graph-trim-reid",
      "runnable-graph-mermaid",
      "runnable-graph-mermaid-image"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["@langchain/core", "langchain"]));
  });

  it("detects LangChain runnable composition contracts without executing chains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-runnable-composition-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-runnable-composition-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "runnable-composition.ts"), [
      "import { RunnableBranch, RunnableEach, RunnableLambda, RunnableMap, RunnablePassthrough, RunnablePick, RunnableSequence, RunnableWithFallbacks, type RunnableBindingArgs, type RunnableConfig, type RunnableRetryFailedAttemptHandler } from \"@langchain/core/runnables\";",
      "import { RootListenersTracer } from \"@langchain/core/tracers/root_listener\";",
      "",
      "const condition = RunnableLambda.from((input: { topic: string }) => input.topic.includes(\"langchain\"));",
      "const langchainBranch = RunnableLambda.from((input: { topic: string }) => ({ answer: `langchain:${input.topic}` }));",
      "const defaultBranch = RunnableLambda.from((input: { topic: string }) => ({ answer: `default:${input.topic}` }));",
      "const branch = RunnableBranch.from([[condition, langchainBranch], defaultBranch]);",
      "const mapped = RunnableMap.from({ branch, original: new RunnablePassthrough() });",
      "const assigned = RunnablePassthrough.assign({ answer: branch, topic: (input: { topic: string }) => input.topic });",
      "const picked = new RunnablePick([\"answer\", \"topic\"]);",
      "const sequence = RunnableSequence.from([mapped, assigned, picked], { name: \"composition-fixture\", omitSequenceTags: false });",
      "const bindingArgs: RunnableBindingArgs<any, any> = {",
      "  bound: sequence,",
      "  kwargs: {},",
      "  config: { tags: [\"binding\"], metadata: { feature: \"composition\" } },",
      "  configFactories: [(config: RunnableConfig) => ({",
      "    callbacks: [new RootListenersTracer({ config, onStart: () => undefined, onEnd: () => undefined, onError: () => undefined })],",
      "    tags: [\"factory\"]",
      "  })]",
      "};",
      "const bound = sequence.withConfig({ runName: \"bound\", configurable: { role: \"tester\" } }).withListeners({ onStart: () => undefined, onEnd: () => undefined, onError: () => undefined });",
      "const each = new RunnableEach({ bound: branch });",
      "const retryHandler: RunnableRetryFailedAttemptHandler = (_error, _input) => undefined;",
      "const retried = branch.withRetry({ stopAfterAttempt: 3, onFailedAttempt: retryHandler });",
      "const fallback = new RunnableWithFallbacks({ runnable: retried, fallbacks: [defaultBranch], handledExceptions: [Error], exceptionKey: \"error\" });",
      "const chain = bound.pipe(each).withFallbacks({ fallbacks: [fallback] });",
      "const compositionTerms = \"RunnableBranch Branch BranchLike condition branch default branch:default RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end\";",
      "void bindingArgs;",
      "void chain;",
      "void compositionTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number; observabilityCount: number }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/runnable-composition.ts");
    expect(report.sourcePattern).toContain("RunnableBranch Branch BranchLike condition branch default branch:default");
    expect(report.sourcePattern).toContain("RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer");
    expect(report.sourcePattern).toContain("RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt");
    expect(report.sourcePattern).toContain("RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys");
    expect(report.sourcePattern).toContain("map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output");
    expect(report.sourcePattern).toContain("streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "runnable-branch",
      "branch-condition",
      "branch-default",
      "runnable-binding",
      "config-factory",
      "runnable-each",
      "runnable-retry",
      "retry-attempt-handler",
      "runnable-with-fallbacks",
      "runnable-assign",
      "runnable-pick",
      "map-key-callback",
      "runnable-stream-log",
      "runnable-stream-events",
      "runnable-coercion"
    ]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["stream-events", "log-stream-callback"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain chat model stream facade contracts without consuming streams", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-chat-model-stream-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-chat-model-stream-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "chat-model-stream.ts"), [
      "import { ChatModelStream, TextContentStream, ToolCallsStream, ReasoningContentStream, UsageMetadataStream } from \"@langchain/core/language_models/stream\";",
      "import type { ChatModelStreamEvent, ContentBlockDelta } from \"@langchain/core/language_models/event\";",
      "import type { ContentBlock } from \"@langchain/core/messages/content\";",
      "import { AIMessage } from \"@langchain/core/messages\";",
      "",
      "export type StreamFacade = ChatModelStream | TextContentStream | ToolCallsStream | ReasoningContentStream | UsageMetadataStream;",
      "export type StreamEvent = ChatModelStreamEvent;",
      "export type Delta = ContentBlockDelta;",
      "export type Blocks = ContentBlock[];",
      "export const assembled = AIMessage;",
      "export const streamFacadeTerms = \"ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall standardize tool_call_chunk tool_use input_json_delta\";",
      "void assembled;",
      "void streamFacadeTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; streamingCount: number }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/chat-model-stream.ts");
    expect(report.sourcePattern).toContain("ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream");
    expect(report.sourcePattern).toContain("ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage");
    expect(report.sourcePattern).toContain("parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta");
    expect(report.sourcePattern).toContain("reasoning-delta data-delta block-delta content-block-finish message-start message-finish");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining([
      "chat-model-stream",
      "text-content-stream",
      "tool-calls-substream",
      "reasoning-content-stream",
      "usage-metadata-stream",
      "replay-buffer",
      "content-delta-assembly",
      "stream-output-message",
      "tool-block-standardization"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain base chat model execution contracts without calling models", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-chat-model-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-chat-model-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "base-chat-model.ts"), [
      "import { BaseChatModel, type BaseChatModelParams, type BaseChatModelCallOptions } from \"@langchain/core/language_models/chat_models\";",
      "import { BaseLanguageModel, type BaseLanguageModelCallOptions, type BaseLanguageModelInput, type BaseLanguageModelParams } from \"@langchain/core/language_models/base\";",
      "import { ChatModelStream } from \"@langchain/core/language_models/stream\";",
      "import type { ChatModelStreamEvent } from \"@langchain/core/language_models/event\";",
      "import type { CallbackManagerForLLMRun } from \"@langchain/core/callbacks/manager\";",
      "import type { RunnableConfig } from \"@langchain/core/runnables\";",
      "import type { BaseCache } from \"@langchain/core/caches\";",
      "import { RUN_KEY, type LLMResult, ChatGenerationChunk } from \"@langchain/core/outputs\";",
      "",
      "export type ChatModelExecutionContracts = BaseChatModel | BaseLanguageModel | BaseChatModelParams | BaseChatModelCallOptions | BaseLanguageModelCallOptions | BaseLanguageModelInput | BaseLanguageModelParams | RunnableConfig | CallbackManagerForLLMRun | BaseCache<unknown[]> | LLMResult | ChatGenerationChunk | ChatModelStream | ChatModelStreamEvent;",
      "export const baseChatModelTerms = \"BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens\";",
      "void RUN_KEY;",
      "void baseChatModelTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; streamingCount: number; observabilityCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/base-chat-model.ts");
    expect(report.sourcePattern).toContain("BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel");
    expect(report.sourcePattern).toContain("streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator");
    expect(report.sourcePattern).toContain("_generateUncached _generateCached generatePrompt generate invocationParams");
    expect(report.sourcePattern).toContain("_getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining([
      "base-chat-model",
      "chat-model-call-options",
      "chat-model-stream-v2",
      "chat-model-generation",
      "chat-model-cache",
      "chat-model-callbacks",
      "model-output-version",
      "model-token-usage-output"
    ]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["chat-model-stream"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain model profile capability contracts without calling models", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-model-profile-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-model-profile-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "model-profile.ts"), [
      "import type { ModelProfile } from \"@langchain/core/language_models/profile\";",
      "",
      "export const profile: ModelProfile = {",
      "  maxInputTokens: 128000,",
      "  maxOutputTokens: 8192,",
      "  imageInputs: true,",
      "  imageUrlInputs: true,",
      "  pdfInputs: true,",
      "  audioInputs: true,",
      "  videoInputs: false,",
      "  imageToolMessage: true,",
      "  pdfToolMessage: true,",
      "  reasoningOutput: true,",
      "  imageOutputs: false,",
      "  audioOutputs: false,",
      "  videoOutputs: false,",
      "  toolCalling: true,",
      "  toolChoice: true,",
      "  structuredOutput: true",
      "};",
      "export const modelProfileTerms = \"ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput profile context window input token budget multimodal support tool message content output modalities\";",
      "void modelProfileTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; modelCount: number; promptCount: number; toolCount: number; outputCount: number }>;
      modelSignals: Array<{ signal: string; readiness: string }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/model-profile.ts");
    expect(report.sourcePattern).toContain("ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs");
    expect(report.sourcePattern).toContain("pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage");
    expect(report.sourcePattern).toContain("reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.modelCount).toBeGreaterThan(0);
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.modelSignals)).toEqual(expect.arrayContaining([
      "model-profile",
      "model-context-window",
      "model-multimodal-inputs",
      "model-tool-message-inputs",
      "model-output-modalities",
      "model-reasoning-output",
      "model-tool-capabilities",
      "model-structured-output-profile"
    ]));
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining(["json-schema-support"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain structured output pipeline contracts without invoking parsers", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-structured-output-pipeline-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-structured-output-pipeline-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "structured-output-pipeline.ts"), [
      "import { createContentParser, createFunctionCallingParser, assembleStructuredOutputPipeline } from \"@langchain/core/language_models/structured_output\";",
      "import { JsonOutputKeyToolsParser } from \"@langchain/core/output_parsers/openai_tools\";",
      "import { RunnableLambda, RunnablePassthrough, RunnableSequence } from \"@langchain/core/runnables\";",
      "import type { BaseLanguageModelInput } from \"@langchain/core/language_models/base\";",
      "import type { BaseMessage } from \"@langchain/core/messages\";",
      "import { z } from \"zod\";",
      "",
      "const schema = z.object({ answer: z.string() });",
      "const contentParser = createContentParser(schema);",
      "const functionParser = createFunctionCallingParser(schema, \"extract\", JsonOutputKeyToolsParser);",
      "const llm = RunnableLambda.from<BaseLanguageModelInput, BaseMessage>((input) => input as BaseMessage);",
      "export const pipeline = assembleStructuredOutputPipeline(llm, contentParser, true, \"StructuredOutputRunnable\");",
      "export const manualRawParsed = RunnableSequence.from([{ raw: llm }, RunnablePassthrough.assign({ parsed: (input: { raw: BaseMessage }) => contentParser.invoke(input.raw) }).withFallbacks({ fallbacks: [RunnablePassthrough.assign({ parsed: () => null })] })]);",
      "export const structuredOutputPipelineTerms = \"createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema StructuredOutputRunnable StructuredOutput outputParser.invoke fallback parsed falls back to null\";",
      "void functionParser;",
      "void manualRawParsed;",
      "void structuredOutputPipelineTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; outputCount: number; streamingCount: number }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/structured-output-pipeline.ts");
    expect(report.sourcePattern).toContain("createContentParser createFunctionCallingParser FunctionCallingParserConstructor");
    expect(report.sourcePattern).toContain("assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback");
    expect(report.sourcePattern).toContain("RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining(["runnable-sequence", "runnable-passthrough", "runnable-with-fallbacks"]));
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining([
      "content-parser-factory",
      "function-calling-parser-factory",
      "structured-output-pipeline",
      "include-raw-output",
      "raw-parsed-output",
      "parser-fallback",
      "parser-assign"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain message history readiness without invoking chains", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-message-history-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-message-history-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "message-history.ts"), [
      "import { ChatPromptTemplate, MessagesPlaceholder } from \"@langchain/core/prompts\";",
      "import { RunnableLambda, RunnablePassthrough, RunnableWithMessageHistory } from \"@langchain/core/runnables\";",
      "import { InMemoryChatMessageHistory, type BaseChatMessageHistory, type BaseListChatMessageHistory } from \"@langchain/core/chat_history\";",
      "",
      "const histories: Record<string, BaseChatMessageHistory | BaseListChatMessageHistory> = {};",
      "const prompt = ChatPromptTemplate.fromMessages([",
      "  [\"system\", \"You are helpful\"],",
      "  new MessagesPlaceholder(\"history\"),",
      "  [\"human\", \"{input}\"],",
      "]);",
      "const runnable = prompt.pipe(RunnablePassthrough.assign({ output: RunnableLambda.from((input) => input) }));",
      "export const chainWithHistory = new RunnableWithMessageHistory({",
      "  runnable,",
      "  getMessageHistory: async (sessionId: string) => {",
      "    histories[sessionId] ??= new InMemoryChatMessageHistory();",
      "    return histories[sessionId];",
      "  },",
      "  inputMessagesKey: \"input\",",
      "  outputMessagesKey: \"output\",",
      "  historyMessagesKey: \"history\",",
      "  config: { configurable: { sessionId: \"static-fixture\" } },",
      "});",
      "const messageHistoryTerms = \"RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey configurable.sessionId configurable.messageHistory messageHistory loadHistory insertHistory getMessages addMessages sessionId is required _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig HumanMessage AIMessage isBaseMessage generations[0][0].message existingMessages.length inputMessages.slice\";",
      "void messageHistoryTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/message-history.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(report.sourcePattern).toContain("RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable");
    expect(report.sourcePattern).toContain("_getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig");
    expect(report.sourcePattern).toContain("configurable.messageHistory existingMessages.length inputMessages.slice");
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining(["chat-prompt-template", "messages-placeholder"]));
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "with-message-history",
      "message-history-store",
      "message-history-config",
      "message-history-keys",
      "message-history-insert",
      "message-history-persist",
      "message-history-input-coercion",
      "message-history-output-coercion",
      "message-history-enter-exit",
      "message-history-session-attach",
      "message-history-dedupe"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain few-shot example selector readiness without selecting examples", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-few-shot-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-few-shot-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "few-shot-prompts.ts"), [
      "import { ChatPromptTemplate, FewShotChatMessagePromptTemplate, FewShotPromptTemplate, PromptTemplate } from \"@langchain/core/prompts\";",
      "import { BaseExampleSelector, LengthBasedExampleSelector, SemanticSimilarityExampleSelector } from \"@langchain/core/example_selectors\";",
      "",
      "const examples = [",
      "  { input: \"happy\", output: \"sad\" },",
      "  { input: \"tall\", output: \"short\" },",
      "];",
      "const examplePrompt = PromptTemplate.fromTemplate(\"Input: {input}\\nOutput: {output}\");",
      "const lengthSelector = await LengthBasedExampleSelector.fromExamples(examples, {",
      "  examplePrompt,",
      "  maxLength: 25,",
      "  getTextLength: (text) => text.split(/\\n| /).length,",
      "});",
      "class StaticExampleSelector extends BaseExampleSelector {",
      "  async addExample() {}",
      "  async selectExamples() { return examples; }",
      "}",
      "export const dynamicPrompt = new FewShotPromptTemplate({",
      "  exampleSelector: lengthSelector,",
      "  examplePrompt,",
      "  prefix: \"Give the antonym of every input\",",
      "  suffix: \"Input: {adjective}\\nOutput:\",",
      "  exampleSeparator: \"\\n\\n\",",
      "  inputVariables: [\"adjective\"],",
      "  partialVariables: { domain: \"antonyms\" },",
      "});",
      "export const chatFewShot = new FewShotChatMessagePromptTemplate({",
      "  exampleSelector: new StaticExampleSelector({}),",
      "  examplePrompt: ChatPromptTemplate.fromMessages([[\"human\", \"{input}\"], [\"ai\", \"{output}\"]]),",
      "  prefix: \"Examples\",",
      "  suffix: \"Now answer\",",
      "  inputVariables: [\"input\"],",
      "});",
      "const fewShotTerms = \"FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples vectorStoreRetriever fromExamples addDocuments sortedValues\";",
      "void SemanticSimilarityExampleSelector;",
      "void fewShotTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/few-shot-prompts.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "few-shot",
      "few-shot-template",
      "example-selector",
      "length-based-example-selector",
      "semantic-similarity-example-selector",
      "example-prompt",
      "example-separator",
      "partial-variables"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain conditional prompt selector readiness without selecting prompts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-conditional-prompt-selector-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-conditional-prompt-selector-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "conditional-prompt-selector.ts"), [
      "import { PromptTemplate, type BasePromptTemplate } from \"@langchain/core/prompts\";",
      "import { BasePromptSelector, ConditionalPromptSelector, isChatModel, isLLM, type BaseGetPromptAsyncOptions } from \"@langchain/core/example_selectors\";",
      "import type { BaseLanguageModelInterface } from \"@langchain/core/language_models/base\";",
      "",
      "const defaultPrompt = PromptTemplate.fromTemplate(\"Summarize: {input}\");",
      "const chatPrompt = PromptTemplate.fromTemplate(\"Chat summary: {input}\");",
      "",
      "class StaticPromptSelector extends BasePromptSelector {",
      "  getPrompt(llm: BaseLanguageModelInterface): BasePromptTemplate {",
      "    return llm._modelType() === \"base_chat_model\" ? chatPrompt : defaultPrompt;",
      "  }",
      "}",
      "",
      "export const selector = new ConditionalPromptSelector(defaultPrompt, [",
      "  [isChatModel, chatPrompt],",
      "  [isLLM, defaultPrompt],",
      "]);",
      "",
      "const asyncOptions: BaseGetPromptAsyncOptions = { partialVariables: { audience: \"maintainers\" } };",
      "const selectorTerms = \"BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface BasePromptTemplate _modelType base_llm base_chat_model\";",
      "void StaticPromptSelector;",
      "void asyncOptions;",
      "void selectorTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/conditional-prompt-selector.ts");
    expect(report.sourcePattern).toContain("BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync");
    expect(report.sourcePattern).toContain("defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "base-prompt-selector",
      "conditional-prompt-selector",
      "prompt-selector-partials",
      "prompt-selector-llm-type-guard"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain prompt template format readiness without rendering prompts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-template-format-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-template-format-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "prompt-template-formats.ts"), [
      "import { ChatPromptTemplate, PromptTemplate } from \"@langchain/core/prompts\";",
      "import { checkValidTemplate, parseTemplate, renderTemplate, type ParsedTemplateNode, type TemplateFormat } from \"@langchain/core/prompts\";",
      "",
      "const format: TemplateFormat = \"mustache\";",
      "const parsed: ParsedTemplateNode[] = parseTemplate(\"Hello {{name}}\", format);",
      "export const prompt = new PromptTemplate({",
      "  inputVariables: [\"name\"],",
      "  template: \"Hello {{name}}\",",
      "  templateFormat: \"mustache\",",
      "  validateTemplate: true,",
      "});",
      "export const chatPrompt = ChatPromptTemplate.fromMessages([[\"human\", \"Image: {{image_url.url}}\"]]);",
      "checkValidTemplate(\"Hello {name}\", \"f-string\", [\"name\"]);",
      "renderTemplate(\"Image: {{image_url.url}}\", \"mustache\", { image_url: { url: \"https://example.com/a.png\" } });",
      "const templateTerms = \"TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url message content template validation Object.fromEntries inputVariables\";",
      "void parsed;",
      "void templateTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/prompt-template-formats.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "template-format",
      "mustache-template",
      "f-string-template",
      "template-parser",
      "template-renderer",
      "template-validation",
      "invalid-prompt-input",
      "message-content-template"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain chat message prompt internals without formatting messages", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-chat-message-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-chat-message-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "chat-message-prompts.ts"), [
      "import { AIMessagePromptTemplate, ChatMessagePromptTemplate, ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, SystemMessagePromptTemplate, type BaseChatPromptTemplate, type BaseMessagePromptTemplate, type BaseMessagePromptTemplateLike } from \"@langchain/core/prompts\";",
      "import { HumanMessage } from \"@langchain/core/messages\";",
      "",
      "const systemPrompt = SystemMessagePromptTemplate.fromTemplate(\"System policy: {policy}\");",
      "const history = new MessagesPlaceholder({ variableName: \"history\", optional: true });",
      "const humanPrompt = HumanMessagePromptTemplate.fromTemplate([",
      "  { text: \"Question: {input}\" },",
      "  { image_url: { url: \"{imageUrl}\", detail: \"high\" } },",
      "]);",
      "const aiPrompt = AIMessagePromptTemplate.fromTemplate(\"I will answer with context.\");",
      "const rolePrompt = ChatMessagePromptTemplate.fromTemplate(\"Trace id {traceId}\", \"developer\");",
      "const prompt = ChatPromptTemplate.fromMessages([",
      "  systemPrompt,",
      "  history,",
      "  [\"placeholder\", \"{scratchpad}\"],",
      "  new HumanMessage({ content: [{ type: \"text\", text: \"Hello {name}\" }, { type: \"image_url\", image_url: { url: \"{imageUrl}\" } }] }),",
      "  humanPrompt,",
      "  aiPrompt,",
      "  rolePrompt,",
      "], { templateFormat: \"f-string\", validateTemplate: true });",
      "const chatTerms = \"BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables MessageContent ContentBlock additionalContentFields InputFormatError coerceMessageLikeToMessage formatMessages formatPromptValue\";",
      "const typedPrompt: BaseChatPromptTemplate | BaseMessagePromptTemplate | BaseMessagePromptTemplateLike = prompt;",
      "void typedPrompt;",
      "void chatTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/chat-message-prompts.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "message-prompt-template",
      "chat-message-prompt-template",
      "role-message-prompt-template",
      "image-prompt-template",
      "placeholder-coercion",
      "chat-prompt-validation",
      "image-prompt-parsing",
      "chat-prompt-flattening"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain image prompt detail readiness without formatting images", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-image-prompt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-image-prompt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "image-prompts.ts"), [
      "import { ImagePromptTemplate, type ImagePromptTemplateInput } from \"@langchain/core/prompts\";",
      "import type { ContentBlock, MessageContent } from \"@langchain/core/messages\";",
      "import type { ImageContent, ImagePromptValue } from \"@langchain/core/prompt_values\";",
      "",
      "type ImageInput = { url: string; detail: string };",
      "const contentFields: ContentBlock = { type: \"image_url\", image_url: { url: \"{url}\", detail: \"high\" } };",
      "const imagePromptInput: ImagePromptTemplateInput<ImageInput> = {",
      "  inputVariables: [\"url\", \"detail\"],",
      "  template: { url: \"{url}\", detail: \"{detail}\" },",
      "  templateFormat: \"f-string\",",
      "  validateTemplate: true,",
      "  additionalContentFields: contentFields,",
      "};",
      "export const imagePrompt = new ImagePromptTemplate<ImageInput>(imagePromptInput);",
      "const messageContent: MessageContent = [{ type: \"image_url\", image_url: { url: \"{url}\", detail: \"high\" } }];",
      "const imagePromptTerms = \"ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock MessageContent additionalContentFields image_url detail formatPromptValue partial PartialValues newPartialVariables validateTemplate checkValidTemplate renderTemplate Must provide either an image URL url must be a string\";",
      "void ({} as ImagePromptValue);",
      "void ({} as ImageContent);",
      "void messageContent;",
      "void imagePromptTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/image-prompts.ts");
    expect(report.sourcePattern).toContain("image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail");
    expect(report.sourcePattern).toContain("Must provide either an image URL url must be a string");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "image-prompt-template",
      "image-prompt-input",
      "image-prompt-value",
      "image-content-fields",
      "image-url-template",
      "image-prompt-partial"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain message content block translator readiness without converting blocks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-content-block-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-content-block-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "message-content-blocks.ts"), [
      "import type { AIMessage, ContentBlock, MessageContent } from \"@langchain/core/messages\";",
      "import type { Data, MessageContentComplex, ProviderFormatTypes, StandardContentBlockConverter } from \"@langchain/core/messages/content\";",
      "import type { StandardContentBlockTranslator } from \"@langchain/core/messages/block_translators\";",
      "",
      "type TutorProviderFormats = ProviderFormatTypes<string, { type: \"image_url\" }, { type: \"input_audio\" }, { type: \"file\" }>;",
      "const content: MessageContent = [",
      "  { type: \"text\", text: \"Explain the diagram\" },",
      "  { type: \"image_url\", image_url: { url: \"data:image/png;base64,AAAA\", detail: \"high\" } },",
      "];",
      "const dataBlock: Data.DataContentBlock = { type: \"image\", source_type: \"base64\", data: \"AAAA\", mime_type: \"image/png\" };",
      "const converter: StandardContentBlockConverter<TutorProviderFormats> = {",
      "  providerName: \"tutor\",",
      "  fromStandardImageBlock: (block) => ({ type: \"image_url\", image_url: { url: block.url ?? block.data ?? block.id ?? \"\" } }),",
      "};",
      "const translator: StandardContentBlockTranslator = { providerName: \"tutor\", fromStandardContentBlock: (block) => block as ContentBlock };",
      "const contentBlockTerms = \"MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata\";",
      "void ({} as AIMessage);",
      "void ({} as MessageContentComplex);",
      "void content;",
      "void dataBlock;",
      "void converter;",
      "void translator;",
      "void contentBlockTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/message-content-blocks.ts");
    expect(report.sourcePattern).toContain("MessageContentComplex DataContentBlock BaseDataContentBlock");
    expect(report.sourcePattern).toContain("isDataContentBlock isURLContentBlock isBase64ContentBlock");
    expect(report.sourcePattern).toContain("parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter");
    expect(report.sourcePattern).toContain("convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions");
    expect(report.sourcePattern).toContain("convertToV1FromResponses convertToV1FromResponsesChunk");
    expect(report.sourcePattern).toContain("convertToV1FromAnthropicInput convertToV1FromAnthropicMessage");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "message-content-block",
      "data-content-block",
      "provider-content-converter",
      "openai-data-block",
      "openai-response-block",
      "anthropic-content-block",
      "content-block-merge"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain provider reasoning block readiness without translating blocks", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-provider-block-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-provider-block-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "provider-reasoning-blocks.ts"), [
      "import type { AIMessage, ContentBlock } from \"@langchain/core/messages\";",
      "import type { StandardContentBlockTranslator } from \"@langchain/core/messages/block_translators\";",
      "",
      "const translator: StandardContentBlockTranslator = { providerName: \"tutor\", translateContent: (message) => message.content as ContentBlock.Standard[] };",
      "const openRouter = { additional_kwargs: { reasoning_content: \"plan\", reasoning_details: [{ type: \"reasoning.summary\" }, { type: \"reasoning.text\" }, { type: \"reasoning.encrypted\" }] } };",
      "const groq = { additional_kwargs: { reasoning: \"<think>trace</think>final\" } };",
      "const ollama = { additional_kwargs: { reasoning_content: \"local chain\" } };",
      "const deepseek = { additional_kwargs: { reasoning_content: \"deep chain\" } };",
      "const xai = { additional_kwargs: { reasoning: { summary: [{ text: \"trace\" }] }, reasoning_content: \"completion trace\" } };",
      "const google = { thinking: true, thoughtSignature: \"sig\", thought: \"chain\", inlineData: {}, functionCall: {}, functionResponse: {}, fileData: {}, executableCode: {}, codeExecutionResult: {}, non_standard: {} };",
      "const bedrock = { cache_point: {}, citations_content: { citationsContent: { content: [{ text: \"source text\" }], citations: [{ sourceContent: [{ text: \"quote\" }], location: { documentChar: { documentIndex: 0, start: 1, end: 5 } } }] } }, reasoning_content: { reasoningText: \"trace\" }, guard_content: {} };",
      "const providerBlockTerms = \"convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk\";",
      "void ({} as AIMessage);",
      "void translator;",
      "void openRouter;",
      "void groq;",
      "void ollama;",
      "void deepseek;",
      "void xai;",
      "void google;",
      "void bedrock;",
      "void providerBlockTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/provider-reasoning-blocks.ts");
    expect(report.sourcePattern).toContain("convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details");
    expect(report.sourcePattern).toContain("convertToV1FromGroqMessage ChatGroqTranslator <think>");
    expect(report.sourcePattern).toContain("convertToV1FromXAIMessage ChatXAITranslator");
    expect(report.sourcePattern).toContain("ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature");
    expect(report.sourcePattern).toContain("convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage");
    expect(report.sourcePattern).toContain("citations_content citationsContent reasoning_content guard_content cache_point");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "openrouter-reasoning-block",
      "groq-reasoning-block",
      "ollama-reasoning-block",
      "deepseek-reasoning-block",
      "xai-reasoning-block",
      "google-thinking-block",
      "bedrock-converse-block",
      "bedrock-citation-block"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain tool-call message readiness without parsing tool calls", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-tool-message-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-tool-message-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "tool-call-messages.ts"), [
      "import { AIMessage, ToolMessage, ToolMessageChunk, isDirectToolOutput } from \"@langchain/core/messages\";",
      "import type { ContentBlock, InvalidToolCall, ToolCall, ToolCallChunk, ToolMessageFields } from \"@langchain/core/messages\";",
      "import type { ContentAndArtifact, InferToolEventFromFunc, InferToolOutputFromFunc, ResponseFormat, StructuredToolCallInput, StructuredToolInterface, ToolEventType, ToolInputSchemaBase, ToolInputSchemaInputType, ToolInputSchemaOutputType, ToolOutputType, ToolReturnType, ToolRunnableConfig } from \"@langchain/core/tools\";",
      "",
      "const toolCall: ToolCall = { type: \"tool_call\", name: \"lookup\", args: { query: \"RepoTutor\" }, id: \"call_1\" };",
      "const invalidToolCall: InvalidToolCall = { type: \"invalid_tool_call\", name: \"lookup\", args: \"{\", id: \"bad_1\", error: \"parse failed\" };",
      "const toolChunk: ToolCallChunk = { type: \"tool_call_chunk\", name: \"lookup\", args: \"{\\\"query\\\"\", id: \"chunk_1\", index: 0 };",
      "const ai = new AIMessage({ content: \"\", tool_calls: [toolCall], invalid_tool_calls: [invalidToolCall], additional_kwargs: { tool_calls: [] } });",
      "const toolFields: ToolMessageFields = { content: \"short result\", tool_call_id: \"call_1\", artifact: { full: \"result\" }, status: \"success\", metadata: { source: \"fixture\" } };",
      "const tool = new ToolMessage(toolFields);",
      "const chunk = new ToolMessageChunk({ content: \"partial\", tool_call_id: \"call_1\", artifact: { page: 1 }, status: \"success\" });",
      "const responseFormat: ResponseFormat = \"content_and_artifact\";",
      "const config: ToolRunnableConfig = { toolCall, configurable: { tenant: \"demo\" } };",
      "type LookupArtifact = ContentAndArtifact;",
      "type LookupReturn = ToolReturnType<ToolCall, ToolRunnableConfig, ToolOutputType>;",
      "type LookupEvent = InferToolEventFromFunc<() => AsyncGenerator<ToolEventType, string, void>>;",
      "type LookupOutput = InferToolOutputFromFunc<() => Promise<string>>;",
      "const toolMessageTerms = \"ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result\";",
      "void ({} as ContentBlock.Tools.ServerToolCall);",
      "void ({} as LookupArtifact);",
      "void ({} as LookupReturn);",
      "void ({} as LookupEvent);",
      "void ({} as LookupOutput);",
      "void ({} as ToolInputSchemaBase);",
      "void ({} as ToolInputSchemaInputType<ToolInputSchemaBase>);",
      "void ({} as ToolInputSchemaOutputType<ToolInputSchemaBase>);",
      "void ({} as StructuredToolCallInput);",
      "void ({} as StructuredToolInterface);",
      "void ai;",
      "void tool;",
      "void chunk;",
      "void toolChunk;",
      "void responseFormat;",
      "void config;",
      "void isDirectToolOutput(tool);",
      "void toolMessageTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; toolCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/tool-call-messages.ts");
    expect(report.sourcePattern).toContain("ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput");
    expect(report.sourcePattern).toContain("ResponseFormat content_and_artifact ToolOutputType ToolEventType");
    expect(report.sourcePattern).toContain("ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams");
    expect(report.sourcePattern).toContain("ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType");
    expect(report.sourcePattern).toContain("StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat");
    expect(report.sourcePattern).toContain("_formatToolOutput returnDirect toolCallId config.toolCall Tool response format");
    expect(report.sourcePattern).toContain("ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser");
    expect(report.sourcePattern).toContain("server_tool_call server_tool_call_chunk server_tool_call_result");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "ai-message-tool-calls",
      "tool-call-parser",
      "tool-call-chunk",
      "tool-message-artifact",
      "tool-message-status",
      "tool-response-format",
      "tool-return-type",
      "tool-content-artifact-format",
      "direct-tool-output",
      "tool-output-formatting",
      "tool-runnable-config",
      "server-tool-call-block"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain OpenAI tool schema conversion readiness without converting schemas", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-tool-schema-conversion-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-tool-schema-conversion-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "tool-schema-conversion.ts"), [
      "import { convertToOpenAIFunction, convertToOpenAITool } from \"@langchain/core/utils/function_calling\";",
      "import { toJsonSchema } from \"@langchain/core/utils/json_schema\";",
      "import type { FunctionDefinition, ToolDefinition } from \"@langchain/core/language_models/base\";",
      "import type { StructuredToolInterface, StructuredToolParams } from \"@langchain/core/tools\";",
      "import type { RunnableToolLike } from \"@langchain/core/runnables\";",
      "",
      "const toolLike = { name: \"lookup\", description: \"Lookup docs\", schema: { type: \"object\", properties: { query: { type: \"string\" } } } };",
      "const strictFields = { strict: true };",
      "const conversionTerms = \"convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema\";",
      "void ({} as FunctionDefinition);",
      "void ({} as ToolDefinition);",
      "void ({} as StructuredToolInterface);",
      "void ({} as StructuredToolParams);",
      "void ({} as RunnableToolLike);",
      "void convertToOpenAIFunction;",
      "void convertToOpenAITool;",
      "void toJsonSchema;",
      "void toolLike;",
      "void strictFields;",
      "void conversionTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; toolCount: number; outputCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/tool-schema-conversion.ts");
    expect(report.sourcePattern).toContain("convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition");
    expect(report.sourcePattern).toContain("RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike");
    expect(report.sourcePattern).toContain("strict fieldsCopy strict !== undefined parameters toJsonSchema");
    expect(report.sourcePattern).toContain("_jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1");
    expect(report.sourcePattern).toContain("interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "openai-function-conversion",
      "openai-tool-conversion",
      "tool-strict-schema",
      "tool-json-schema-conversion",
      "tool-json-schema-cache",
      "tool-schema-type-guards"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain dynamic tool wrapper readiness without invoking tools", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-dynamic-tool-wrapper-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-dynamic-tool-wrapper-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest",
        zod: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "dynamic-tools.ts"), [
      "import { z } from \"zod\";",
      "import { DynamicStructuredTool, DynamicTool, StructuredTool, ToolInputParsingException, tool } from \"@langchain/core/tools\";",
      "import type { DynamicStructuredToolInput, DynamicToolInput, ToolRuntime, ToolRunnableConfig, ToolWrapperParams } from \"@langchain/core/tools\";",
      "",
      "const stringToolFields: ToolWrapperParams = { name: \"echo\", description: \"Echo text\", schema: z.string().describe(\"Text to echo\"), returnDirect: true, responseFormat: \"content\" };",
      "const objectToolFields: ToolWrapperParams = { name: \"lookup\", description: \"Lookup docs\", schema: z.object({ query: z.string() }), verboseParsingErrors: true, responseFormat: \"content_and_artifact\" };",
      "const runtimeTool = tool(async (input: { query: string }, runtime: ToolRuntime<{ tenant: string }, { traceId: string }>) => [input.query, { traceId: runtime.context?.traceId }], objectToolFields);",
      "const stringTool = tool(async (input: string, config: ToolRunnableConfig) => input + String(config.toolCall?.id ?? \"\"), stringToolFields);",
      "const dynamicTool = new DynamicTool({ name: \"direct\", description: \"Direct dynamic tool\", func: async (input, runManager, parentConfig) => input + String(parentConfig?.toolCall?.id ?? \"\") });",
      "const dynamicStructuredTool = new DynamicStructuredTool({ name: \"structured\", description: \"Structured dynamic tool\", schema: z.object({ query: z.string() }), func: async (input, runManager, parentConfig) => [input.query, { ok: true }] as const, responseFormat: \"content_and_artifact\" });",
      "const parsingError = new ToolInputParsingException(\"Received tool input did not match expected schema\", JSON.stringify({ query: 1 }));",
      "const dynamicInput = {} as DynamicToolInput;",
      "const structuredInput = {} as DynamicStructuredToolInput;",
      "const structuredBase = {} as StructuredTool;",
      "const wrapperTerms = \"StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams tool(func, fields) ToolInputParsingException interopParseAsync validate verboseParsingErrors Received tool input did not match expected schema handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError config.signal.addEventListener removeEventListener\";",
      "void runtimeTool;",
      "void stringTool;",
      "void dynamicTool;",
      "void dynamicStructuredTool;",
      "void parsingError;",
      "void dynamicInput;",
      "void structuredInput;",
      "void structuredBase;",
      "void wrapperTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; toolCount: number; outputCount: number }>;
      toolSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/dynamic-tools.ts");
    expect(report.sourcePattern).toContain("StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams");
    expect(report.sourcePattern).toContain("ToolInputParsingException interopParseAsync validate verboseParsingErrors");
    expect(report.sourcePattern).toContain("handleToolStart handleToolEvent handleToolError handleToolEnd");
    expect(report.sourcePattern).toContain("isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig");
    expect(report.sourcePattern).toContain("patchConfig pickRunnableConfigKeys getAbortSignalError");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.toolCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.toolSignals)).toEqual(expect.arrayContaining([
      "dynamic-tool-wrapper",
      "dynamic-structured-tool",
      "tool-input-parsing-exception",
      "tool-callback-lifecycle",
      "tool-wrapper-runtime-config",
      "tool-wrapper-abort-signal"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain message transform readiness without transforming messages", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-message-transform-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-message-transform-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "message-transforms.ts"), [
      "import { AIMessage, AIMessageChunk, BaseMessageChunk, HumanMessage, filterMessages, mergeMessageRuns, trimMessages } from \"@langchain/core/messages\";",
      "import type { AIMessageChunkFields, BaseMessage, TrimMessagesFields, UsageMetadata } from \"@langchain/core/messages\";",
      "import { mergeResponseMetadata, mergeUsageMetadata } from \"@langchain/core/messages\";",
      "",
      "const messages: BaseMessage[] = [new HumanMessage({ content: \"hello\", name: \"learner\", id: \"m1\" }), new AIMessage({ content: \"answer\", id: \"m2\" })];",
      "const filtered = filterMessages(messages, { includeNames: [\"learner\"], excludeTypes: [\"system\"], includeIds: [\"m1\"], excludeIds: [\"m2\"] });",
      "const merged = mergeMessageRuns(messages);",
      "const trimOptions: TrimMessagesFields = {",
      "  maxTokens: 32,",
      "  tokenCounter: async (items) => items.length,",
      "  strategy: \"last\",",
      "  allowPartial: true,",
      "  endOn: \"human\",",
      "  startOn: \"human\",",
      "  includeSystem: true,",
      "  textSplitter: async (text) => text.split(/(\\s+)/),",
      "};",
      "const trimmer = trimMessages(trimOptions);",
      "const usage: UsageMetadata = { input_tokens: 1, output_tokens: 2, total_tokens: 3, input_token_details: { cache_read: 1, text: 1 }, output_token_details: { reasoning: 1, audio: 1 } };",
      "const chunkFields: AIMessageChunkFields = { content: \"partial\", usage_metadata: usage, tool_call_chunks: [] };",
      "const chunk = new AIMessageChunk(chunkFields);",
      "const mergedUsage = mergeUsageMetadata(usage, { input_tokens: 4, output_tokens: 5, total_tokens: 9 });",
      "const mergedMetadata = mergeResponseMetadata({ model_provider: \"openai\", model_name: \"gpt-4o\", output_version: \"v1\" }, { trace_id: \"abc\" });",
      "const transformTerms = \"_coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk chunkUsesRawInputArgs mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details\";",
      "void filtered;",
      "void merged;",
      "void trimmer;",
      "void chunk;",
      "void (chunk as BaseMessageChunk);",
      "void mergedUsage;",
      "void mergedMetadata;",
      "void transformTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number; streamingCount: number; observabilityCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      runnableSignals: Array<{ signal: string; readiness: string }>;
      streamingSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/message-transforms.ts");
    expect(report.sourcePattern).toContain("_coerceToolCall isSerializedConstructor SerializedConstructor");
    expect(report.sourcePattern).toContain("_constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString");
    expect(report.sourcePattern).toContain("mapV1MessageToStoredMessage StoredMessage StoredMessageV1");
    expect(report.sourcePattern).toContain("mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict");
    expect(report.sourcePattern).toContain("filterMessages FilterMessagesFields includeNames excludeNames");
    expect(report.sourcePattern).toContain("mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg");
    expect(report.sourcePattern).toContain("trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial");
    expect(report.sourcePattern).toContain("AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk");
    expect(report.sourcePattern).toContain("mergeResponseMetadata mergeUsageMetadata UsageMetadata");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(setup?.streamingCount).toBeGreaterThan(0);
    expect(setup?.observabilityCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "message-constructor-coercion",
      "message-like-coercion",
      "message-buffer-string",
      "stored-message-v1-map",
      "stored-message-chat-map",
      "chat-message-storage-map"
    ]));
    expect(readySignals(report.runnableSignals)).toEqual(expect.arrayContaining([
      "message-filter",
      "message-run-merge",
      "message-trim",
      "message-chunk-conversion",
      "response-metadata-merge",
      "usage-metadata-merge"
    ]));
    expect(readySignals(report.streamingSignals)).toEqual(expect.arrayContaining(["token-usage"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain pipeline prompt readiness without formatting pipeline prompts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-pipeline-prompt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-pipeline-prompt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "pipeline-prompts.ts"), [
      "import { ChatPromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder, PromptTemplate, SystemMessagePromptTemplate } from \"@langchain/core/prompts\";",
      "import { PipelinePromptTemplate, type PipelinePromptParams, type PipelinePromptTemplateInput } from \"@langchain/core/prompts\";",
      "",
      "const intro = PromptTemplate.fromTemplate(\"You are impersonating {person}.\");",
      "const example = PromptTemplate.fromTemplate(\"Q: {exampleQuestion}\\nA: {exampleAnswer}\");",
      "const chatStep = ChatPromptTemplate.fromMessages([HumanMessagePromptTemplate.fromTemplate(\"{name} halpert\")]);",
      "const finalPrompt = ChatPromptTemplate.fromMessages([",
      "  SystemMessagePromptTemplate.fromTemplate(\"{introduction}\\n{example}\"),",
      "  new MessagesPlaceholder(\"chatStep\"),",
      "]);",
      "const pipelinePrompts: PipelinePromptParams<typeof intro>[] = [",
      "  { name: \"introduction\", prompt: intro },",
      "  { name: \"example\", prompt: example },",
      "];",
      "export const prompt = new PipelinePromptTemplate({",
      "  pipelinePrompts: [...pipelinePrompts, { name: \"chatStep\", prompt: chatStep }],",
      "  finalPrompt,",
      "});",
      "const typedInput: PipelinePromptTemplateInput<typeof intro> = { pipelinePrompts, finalPrompt: intro };",
      "const pipelineTerms = \"PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize mergePartialAndUserVariables formatPromptValue PromptValueReturnType partialVariables _getPromptType pipeline SerializedBasePromptTemplate\";",
      "void typedInput;",
      "void pipelineTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/pipeline-prompts.ts");
    expect(report.sourcePattern).toBe("LangChain.js ModelProfile maxInputTokens maxOutputTokens imageInputs imageUrlInputs pdfInputs audioInputs videoInputs imageToolMessage pdfToolMessage reasoningOutput imageOutputs audioOutputs videoOutputs toolCalling toolChoice structuredOutput BaseChatModel BaseChatModelParams BaseChatModelCallOptions BaseLanguageModel BaseLanguageModelCallOptions BaseLanguageModelInput BaseLanguageModelParams LangSmithParams BindToolsInput ToolChoice disableStreaming outputVersion LC_OUTPUT_VERSION MessageOutputVersion streamV2 _streamChatModelEvents _streamResponseChunks _streamIterator _generateUncached _generateCached generatePrompt generate invocationParams _modelType _llmType _combineLLMOutput _separateRunnableConfigFromCallOptionsCompat handleChatModelStart handleChatModelStreamEvent handleLLMEnd handleLLMError callbackHandlerPrefersChatModelStreamEvents callbackHandlerPrefersStreaming _getSerializedCacheKeyParametersForCall cache.lookup cache.update BaseCache InMemoryCache defaultHashKeyEncoder HashKeyEncoder sha256 serializeGeneration deserializeStoredGeneration StoredGeneration Generation ChatGeneration mapStoredMessageToChatMessage toDict makeDefaultKeyEncoder keyEncoder lookup update prompt llmKey Promise<T | null> GLOBAL_MAP global() Map<string, T> ContentBlock missingPromptIndices RUN_KEY castStandardMessageContent ModelAbortError LLMResult Generation GenerationChunk GenerationChunkFields ChatGeneration ChatGenerationChunk ChatGenerationChunkFields ChatResult RUN_KEY generationInfo FakeBuiltModel fakeModel ResponseFactory QueueEntry FakeModelCall FakeModelState respond respondWithTools alwaysThrow structuredResponse bindTools callCount calls fake-model-builder no response queued llmOutput generations tokenUsage promptTokens completionTokens totalTokens ChatOpenAI ChatPromptTemplate RunnableSequence RunnableLambda RunnablePassthrough RunnableBranch Branch BranchLike condition branch default branch:default RouterRunnable RouterInput runnables key actualInput missingKey No runnable associated with key _getOptionsList returnExceptions batchSize RunnableBinding RunnableBindingArgs configFactories withConfig withListeners RootListenersTracer RunnableEach RunnableRetry RunnableRetryFailedAttemptHandler stopAfterAttempt onFailedAttempt maxAttemptNumber retry:attempt RunnableWithFallbacks handledExceptions exceptionKey RunnableAssign mapper RunnablePick keys map:key RunnableMapLike _coerceToRunnable _coerceToDict streamLog RunLogPatch streamed_output streamEvents StreamEvent on_chain_start on_chain_stream on_chain_end convertChunksToEvents ChatModelStreamEvent ContentBlockDelta ChatGenerationChunk AIMessageChunk _streamResponseChunks activeBlocks nextBlockIndex getAdditionalKwargs extractImageBlocksFromToolOutputs getAudioPayload MIME_TYPE_BY_AUDIO_FORMAT MIME_TYPE_BY_IMAGE_FORMAT AudioStreamState usage_metadata input_tokens output_tokens total_tokens options?.signal?.throwIfAborted ChatModelStream TextContentStream ToolCallsStream ReasoningContentStream UsageMetadataStream ReplayBuffer applyDelta getEventDelta getReasoningDelta isReasoningContent normalizeUsage parseToolArgs standardizeToolBlock content-block-start content-block-delta text-delta reasoning-delta data-delta block-delta content-block-finish message-start message-finish usage output_version v1 finish_reason usage_metadata response_metadata toolCalls text reasoning output ContentBlock.Tools.ToolCall pipe invoke batch stream withRetry withFallbacks tool createAgent MCP adapters ToolHooks DynamicStructuredTool VectorStore Retriever StructuredOutputParser createContentParser createFunctionCallingParser FunctionCallingParserConstructor assembleStructuredOutputPipeline includeRaw raw parsed parserAssign parserNone parsedWithFallback RunnablePassthrough.assign RunnableSequence.from BaseLanguageModelInput JsonOutputKeyToolsParser returnSingle StandardSchemaOutputParser SerializableSchema isSerializableSchema InteropZodType isInteropZodSchema BaseLLMOutputParser BaseOutputParser FormatInstructionsOptions parseResult parseResultWithPrompt parseWithPrompt getFormatInstructions OutputParserException OUTPUT_PARSING_FAILURE BaseTransformOutputParser BaseCumulativeTransformOutputParser parsePartialResult JsonOutputParser parseJsonMarkdown parsePartialJson StringOutputParser StrOutputParser BytesOutputParser TextEncoder ListOutputParser CommaSeparatedListOutputParser CustomListOutputParser NumberedListOutputParser MarkdownListOutputParser XMLOutputParser XML_FORMAT_INSTRUCTIONS parseXMLMarkdown StandardSchemaOutputParser fromSerializableSchema OutputFunctionsParser JsonOutputFunctionsParser JsonKeyOutputFunctionsParser JsonOutputToolsParser JsonOutputKeyToolsParser ParsedToolCall parseToolCall convertLangChainToolCallToOpenAI makeInvalidToolCall returnId returnSingle keyName argsOnly stream callbacks BaseCallbackHandler BaseCallbackHandlerInput ignoreLLM ignoreChain ignoreAgent ignoreRetriever ignoreCustomEvent _awaitHandler raiseError HandleLLMNewTokenCallbackFields handleLLMNewToken handleChatModelStreamEvent CallbackManagerOptions BaseCallbackConfig parseCallbackConfigArg BaseCallbackManager BaseRunManager CallbackManagerForLLMRun CallbackManagerForChainRun CallbackManagerForToolRun CallbackManagerForRetrieverRun CallbackManager.configure CallbackManager.fromHandlers addHandler removeHandler setHandlers inheritableHandlers inheritableTags inheritableMetadata getParentRunId getChild handleCustomEvent dispatchCustomEvent EventStreamCallbackHandler EventStreamCallbackHandlerInput StreamEvent StreamEventData includeNames includeTypes includeTags excludeNames excludeTypes excludeTags isStreamEventsHandler LogStreamCallbackHandler LogStreamCallbackHandlerInput RunLogPatch RunLog RunState LogEntry SchemaFormat isLogStreamHandler RunCollectorCallbackHandler tracedRuns RootListenersTracer onRunCreate onRunUpdate LangSmith createMiddleware wrapModelCall wrapToolCall humanInTheLoopMiddleware modelRetryMiddleware toolRetryMiddleware dynamic tools stateSchema contextSchema interruptOn piiMiddleware PIIDetectionError applyToToolResults redaction mask hash OpenAIModerationMiddleware openAIModerationMiddleware canJumpTo exitBehavior anthropicPromptCachingMiddleware cache_control ttl unsupportedModelBehavior dynamicSystemPromptMiddleware summarizationMiddleware contextEditingMiddleware ClearToolUsesEdit llmToolSelectorMiddleware modelCallLimitMiddleware toolCallLimitMiddleware threadLimit runLimit maxTools alwaysInclude REMOVE_ALL_MESSAGES trimMessages ToolCallLimitExceededError ModelCallLimitMiddlewareError initChatModel ConfigurableModel MODEL_PROVIDER_CONFIG SUPPORTED_PROVIDERS ChatModelProvider getChatModelByClassName _initChatModelHelper _inferModelProvider modelProvider configurableFields configPrefix configurable RunnableConfig DEFAULT_RECURSION_LIMIT _getTracingInheritableMetadataFromConfig CONFIGURABLE_TO_TRACING_METADATA_EXCLUDED_KEYS PRIMITIVES getCallbackManagerForConfig mergeConfigs ensureConfig patchConfig pickRunnableConfigKeys AsyncLocalStorageProviderSingleton recursionLimit runId runName maxConcurrency timeout AbortSignal.timeout signal timeoutMs metadata tags configurable store BaseStore InMemoryStore mget mset mdelete yieldKeys AsyncGenerator keyValuePairs langchain storage consumeIteratorInContext consumeAsyncIterableInContext runWithConfig getRunnableConfig LC_CHILD_KEY lc:child_config AsyncLocalStorageProvider getInstance avoidCreatingRootRunTree CallbackManager._configureSync parentRunId LangChainTracer getRunTreeWithTracingConfig RunTree <runnable_lambda> tracingEnabled false runTree.extra _CONTEXT_VARIABLES_KEY previousValue storage.getStore storage.run initializeGlobalInstance getGlobalAsyncLocalStorageInstance setGlobalAsyncLocalStorageInstance MockAsyncLocalStorage AgentRunStream GraphRunStream Graph nodeDataStr nodeDataJson toJsonSchema toJSON stableNodeIds addNode removeNode addEdge firstNode lastNode extend trimFirstNode trimLastNode reid drawMermaid drawMermaidPng drawMermaidImage _firstNode _lastNode _escapeNodeLabel MARKDOWN_SPECIAL_CHARS _generateMermaidGraphStyles curveStyle withStyles nodeColors wrapLabelNWords mermaid.ink toBase64Url backgroundColor imageType streamTransformers StreamTransformer StreamChannel createToolCallTransformer ToolCallProjection ToolCallStream isOwnEvent isHeadlessToolInterruptError isSerializedToolMessage normalizeToolOutput pendingCalls resolveOutput rejectOutput resolveStatus resolveError toolCallsLog.close toolCallsLog.fail ProtocolEvent streamMode text/event-stream convertToHttpEventStream IterableReadableStream TextEncoder ReadableStream<Uint8Array> controller.enqueue event: data event: end JSON.stringify(chunk) fromReadableStream EventStreamContentType text/event-stream EventSourceMessage getBytes getLines getMessages ControlChars NewLine CarriageReturn Space Colon fieldLength discardTrailingNewline TextDecoder onId onRetry parseInt Number.isNaN newMessage isEmpty convertEventStreamToIterableReadableDataStream onMetadataEvent event error metadata controller.close JSONPatchOperation applyPatch RunLogPatch RunLog fromRunLogPatch concat states[states.length - 1].newDocument LogEntry RunState id name type tags metadata start_time streamed_output streamed_output_str inputs final_output end_time logs SchemaFormat original streaming_events LogStreamCallbackHandlerInput autoClose includeNames includeTypes includeTags excludeNames excludeTypes excludeTags _schemaFormat isLogStreamHandler log_stream_tracer lc_prefer_streaming TransformStream writable.getWriter writer receiveStream IterableReadableStream.fromReadableStream Symbol.asyncIterator _includeRun keyMapByRunId counterMapByRunName tapOutputIterable onRunCreate onRunUpdate onLLMNewToken /logs/${key}/streamed_output/- /logs/${runName}/streamed_output_str/- /logs/${runName}/streamed_output/- /logs/${runName}/inputs /logs/${runName}/final_output /logs/${runName}/end_time /final_output _getStandardizedInputs _getStandardizedOutputs isChatGenerationChunk AIMessageChunk writer.close content-block-delta content-block-finish tool-started tool-finished tool-error responseFormat structuredResponse ToolStrategy ProviderStrategy TypedToolStrategy toolStrategy providerStrategy transformResponseFormat ResponseFormatUndefined hasSupportForJsonSchemaOutput StructuredOutputParsingError MultipleStructuredOutputsError ToolStrategyOptions handleError toolMessageContent ToolMessageFields ToolMessageChunk DirectToolOutput isDirectToolOutput lc_direct_tool_output tool_call_id status artifact metadata ResponseFormat content_and_artifact ToolOutputType ToolEventType InferToolEventFromFunc InferToolOutputFromFunc ContentAndArtifact ToolReturnType StructuredTool DynamicTool DynamicStructuredTool ToolWrapperParams ToolInputParsingException interopParseAsync validate verboseParsingErrors ToolInputSchemaBase ToolInputSchemaInputType ToolInputSchemaOutputType StructuredToolCallInput ToolCallInput StructuredToolInterface responseFormat defaultConfig verboseParsingErrors extras _formatToolOutput returnDirect toolCallId config.toolCall Tool response format handleToolStart handleToolEvent handleToolError handleToolEnd isSimpleStringZodSchema validatesOnlyStrings AsyncLocalStorageProviderSingleton runWithConfig patchConfig pickRunnableConfigKeys getAbortSignalError convertToOpenAIFunction convertToOpenAITool FunctionDefinition ToolDefinition RunnableToolLike isLangChainTool isStructuredTool isStructuredToolParams isRunnableToolLike strict fieldsCopy strict !== undefined parameters toJsonSchema ToJSONSchemaParams _jsonSchemaCache WeakMap canCache cached StandardJSONSchemaV1 isStandardJsonSchema isZodSchemaV4 isZodSchemaV3 interopZodTransformInputSchema interopZodObjectStrict zodToJsonSchema toJSONSchema ToolCall ToolCallChunk InvalidToolCall tool_calls invalid_tool_calls defaultToolCallParser collapseToolCallChunks contentBlocks missingContentBlockToolCalls missingToolCalls tool_call tool_call_chunk invalid_tool_call server_tool_call server_tool_call_chunk server_tool_call_result HeadlessTool HeadlessToolFields HeadlessToolImplementation createHeadlessTool HeadlessToolOverload headlessTool implement useStream ToolRunnableConfig createRetrieverTool BaseRetrieverInterface BaseRetriever BaseRetrieverInput _getRelevantDocuments handleRetrieverStart handleRetrieverEnd handleRetrieverError CallbackManagerForRetrieverRun parseCallbackConfigArg ensureConfig FakeRetriever BaseDocumentTransformer MappingDocumentTransformer transformDocuments _transformDocument BaseDocumentCompressor compressDocuments isBaseDocumentCompressor BaseDocumentLoader DocumentLoader load CallbackManagerForToolRun formatDocumentsAsString DynamicStructuredToolInput retriever.getChild RunnableWithMessageHistory RunnableWithMessageHistoryInputs GetSessionHistoryCallable _getInputMessages _getOutputMessages _enterHistory _exitHistory _mergeConfig configurable.messageHistory existingMessages.length inputMessages.slice HumanMessage AIMessage isBaseMessage generations[0][0].message BaseChatMessageHistory BaseListChatMessageHistory InMemoryChatMessageHistory getMessageHistory inputMessagesKey outputMessagesKey historyMessagesKey messageHistory sessionId loadHistory insertHistory addMessages _coerceToolCall isSerializedConstructor SerializedConstructor _constructMessageFromParams coerceMessageLikeToMessage _contentBlockToString getBufferString mapV1MessageToStoredMessage StoredMessage StoredMessageV1 mapStoredMessageToChatMessage mapStoredMessagesToChatMessages mapChatMessagesToStoredMessages toDict filterMessages FilterMessagesFields includeNames excludeNames includeTypes excludeTypes includeIds excludeIds _filterMessages _isMessageType mergeMessageRuns _mergeMessageRuns convertToChunk _chunkToMsg trimMessages TrimMessagesFields maxTokens tokenCounter strategy allowPartial endOn startOn includeSystem textSplitter _trimMessagesHelper _firstMaxTokens _lastMaxTokens _switchTypeToMessage _MSG_CHUNK_MAP BaseMessageChunk isBaseMessageChunk AIMessageChunk AIMessageChunkFields HumanMessageChunk SystemMessageChunk FunctionMessageChunk ChatMessageChunk mergeResponseMetadata mergeUsageMetadata UsageMetadata ModalitiesTokenDetails input_token_details output_token_details FewShotPromptTemplate FewShotChatMessagePromptTemplate BaseExampleSelector LengthBasedExampleSelector SemanticSimilarityExampleSelector BasePromptSelector ConditionalPromptSelector BaseGetPromptAsyncOptions getPrompt getPromptAsync defaultPrompt conditionals partialVariables isLLM isChatModel BaseLanguageModelInterface exampleSelector examplePrompt exampleSeparator partialVariables inputKeys exampleKeys maxLength getTextLength selectExamples TemplateFormat ParsedTemplateNode ParsedFStringNode parseFString parseMustache interpolateFString interpolateMustache DEFAULT_FORMATTER_MAPPING DEFAULT_PARSER_MAPPING renderTemplate parseTemplate checkValidTemplate INVALID_PROMPT_INPUT templateFormat validateTemplate mustache f-string image_url ImagePromptTemplateInput ImagePromptValue ImageContent ContentBlock additionalContentFields detail Must provide either an image URL url must be a string MessageContentComplex DataContentBlock BaseDataContentBlock URLContentBlock Base64ContentBlock PlainTextContentBlock IDContentBlock isDataContentBlock isURLContentBlock isBase64ContentBlock isPlainTextContentBlock isIDContentBlock convertToOpenAIImageBlock parseMimeType parseBase64DataUrl ProviderFormatTypes StandardContentBlockConverter convertToProviderContentBlock convertToStandardContentBlock convertToV1FromDataContentBlock convertToV1FromDataContent isOpenAIDataBlock convertToV1FromOpenAIDataBlock convertToV1FromChatCompletions convertToV1FromChatCompletionsChunk convertToV1FromChatCompletionsInput convertToV1FromResponses convertToV1FromResponsesChunk convertToV1FromAnthropicContentBlock convertToV1FromAnthropicInput convertToV1FromAnthropicMessage convertAnthropicAnnotation StandardContentBlockTranslator contentBlocksFromNonStringFirst mergeContent tool_call server_tool_call reasoning citation non_standard mime_type source_type fileId metadata convertToV1FromOpenRouterMessage ChatOpenRouterTranslator reasoning_content reasoning_details reasoning.summary reasoning.text reasoning.encrypted convertToV1FromGroqMessage ChatGroqTranslator <think> convertToV1FromOllamaMessage ChatOllamaTranslator convertToV1FromDeepSeekMessage ChatDeepSeekTranslator convertToV1FromXAIMessage ChatXAITranslator ChatGoogleGenAITranslator ChatGoogleTranslator thinking thoughtSignature thought inlineData functionCall functionResponse fileData executableCode codeExecutionResult convertToV1FromChatBedrockConverseInput convertToV1FromChatBedrockConverseMessage ChatBedrockConverseTranslator citations_content citationsContent reasoning_content guard_content cache_point documentChar documentPage documentChunk BaseMessagePromptTemplate BaseChatPromptTemplate BaseMessageStringPromptTemplate ChatMessagePromptTemplate HumanMessagePromptTemplate AIMessagePromptTemplate SystemMessagePromptTemplate ImagePromptTemplate _StringImageMessagePromptTemplate MessagesPlaceholderFields BaseMessagePromptTemplateLike _coerceMessagePromptTemplateLike isMessagesPlaceholder _parseImagePrompts promptMessages flattenedMessages flattenedPartialVariables PipelinePromptTemplate PipelinePromptParams PipelinePromptTemplateInput pipelinePrompts finalPrompt computeInputValues intermediateValues extractRequiredInputValues formatPipelinePrompts StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "pipeline-prompt-template",
      "pipeline-prompts",
      "pipeline-final-prompt",
      "pipeline-input-computation",
      "pipeline-format-prompts",
      "pipeline-partial"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain structured prompt readiness without validating schemas", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-structured-prompt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-structured-prompt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "structured-prompts.ts"), [
      "import { ChatPromptTemplate, StructuredPrompt, type StructuredPromptInput, type BaseMessagePromptTemplateLike } from \"@langchain/core/prompts\";",
      "import { RunnableBinding } from \"@langchain/core/runnables\";",
      "",
      "const promptMessages: BaseMessagePromptTemplateLike[] = [",
      "  [\"system\", \"Return only structured inventory data.\"],",
      "  [\"human\", \"Summarize {topic} with quantity and risk.\"],",
      "];",
      "const schema = {",
      "  name: \"inventory_summary\",",
      "  description: \"structured output for a tutor inventory\",",
      "  parameters: { topic: { type: \"string\" }, quantity: { type: \"integer\" } },",
      "};",
      "export const prompt = StructuredPrompt.fromMessagesAndSchema(promptMessages, schema, \"jsonSchema\");",
      "const input: StructuredPromptInput = { inputVariables: [\"topic\"], promptMessages, schema, method: \"jsonMode\" };",
      "const chatPrompt = ChatPromptTemplate.fromMessages(promptMessages);",
      "const structuredPromptTerms = \"StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding isWithStructuredOutput isRunnableBinding lc_namespace lc_aliases schema_ DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize ChatPromptTemplateInput BaseMessagePromptTemplateLike\";",
      "void RunnableBinding;",
      "void input;",
      "void chatPrompt;",
      "void structuredPromptTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number; outputCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      structuredOutputSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/structured-prompts.ts");
    expect(report.sourcePattern).toContain("StructuredPrompt StructuredPromptInput fromMessagesAndSchema schema method jsonMode jsonSchema functionMode withStructuredOutput RunnableBinding");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(setup?.outputCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "structured-prompt",
      "structured-prompt-schema",
      "structured-prompt-method",
      "structured-prompt-pipe",
      "structured-prompt-factory"
    ]));
    expect(readySignals(report.structuredOutputSignals)).toEqual(expect.arrayContaining(["with-structured-output"]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain dict prompt readiness without rendering dictionaries", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-dict-prompt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-dict-prompt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "dict-prompts.ts"), [
      "import { DictPromptTemplate } from \"@langchain/core/prompts\";",
      "import type { TypedPromptInputValues } from \"@langchain/core/prompts\";",
      "",
      "type TutorInput = { topic: string; audience: string; tone: string };",
      "type TutorDict = { title: string; body: { summary: string; tags: string[] }; metadata: { ready: boolean } };",
      "const template = {",
      "  title: \"Study {topic}\",",
      "  body: {",
      "    summary: \"Explain {topic} for {audience}\",",
      "    tags: [\"{audience}\", \"{tone}\"],",
      "  },",
      "  metadata: { ready: true },",
      "};",
      "export const dictPrompt = new DictPromptTemplate<TutorInput, TutorDict>({ template, templateFormat: \"f-string\" });",
      "const values: TypedPromptInputValues<TutorInput> = { topic: \"agents\", audience: \"beginners\", tone: \"careful\" };",
      "const dictPromptTerms = \"DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate runType prompt lc_serializable BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize lc_namespace DictPromptTemplate nested dictionary template array object\";",
      "void dictPrompt;",
      "void values;",
      "void dictPromptTerms;"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/dict-prompts.ts");
    expect(report.sourcePattern).toContain("DictPromptTemplate TypedPromptInputValues _getInputVariables _insertInputVariables templateFormat inputVariables renderTemplate parseTemplate");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "dict-prompt-template",
      "dict-prompt-template-format",
      "dict-input-variables",
      "dict-template-render",
      "dict-nested-template"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });

  it("detects LangChain base prompt serialization readiness without invoking prompts", async () => {
    const studiesRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-prompt-readiness-"));
    const sourceRoot = await fs.mkdtemp(path.join(os.tmpdir(), "repotutor-llm-base-prompt-source-"));
    await fs.cp(fixtureRoot, sourceRoot, { recursive: true });
    await fs.mkdir(path.join(sourceRoot, "src", "llm"), { recursive: true });
    await fs.writeFile(path.join(sourceRoot, "package.json"), JSON.stringify({
      dependencies: {
        "@langchain/core": "latest",
        langchain: "latest"
      }
    }, null, 2));
    await fs.writeFile(path.join(sourceRoot, "src", "llm", "base-prompt-serialization.ts"), [
      "import { PromptTemplate, type BasePromptTemplate, type BasePromptTemplateInput, type BaseStringPromptTemplate, type TypedPromptInputValues } from \"@langchain/core/prompts\";",
      "import type { SerializedBasePromptTemplate, SerializedFewShotTemplate, SerializedPromptTemplate } from \"@langchain/core/prompts\";",
      "",
      "type TutorPromptInput = BasePromptTemplateInput & { inputVariables: string[]; metadata?: Record<string, unknown>; tags?: string[] };",
      "const prompt = PromptTemplate.fromTemplate(\"Explain {topic} to {audience}\");",
      "const promptContract: BasePromptTemplate<TypedPromptInputValues> | BaseStringPromptTemplate = prompt;",
      "const serialized: SerializedPromptTemplate | SerializedFewShotTemplate | SerializedBasePromptTemplate = {",
      "  _type: \"prompt\",",
      "  input_variables: [\"topic\", \"audience\"],",
      "  template_format: \"f-string\",",
      "  template: \"Explain {topic} to {audience}\",",
      "};",
      "const basePromptTerms = \"BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate TypedPromptInputValues PromptValueReturnType formatPromptValue mergePartialAndUserVariables lc_attributes outputParser metadata tags invoke runType prompt _getPromptType StringPromptValue StringPromptValueInterface SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format example_prompt example_separator fromExamples fromTemplate serialize deserialize ExtractTemplateParamsRecursive ParamsFromFString ExtractedFStringParams validateTemplate additionalContentFields Cannot have an input variable named stop\";",
      "void promptContract;",
      "void serialized;",
      "void basePromptTerms;",
      "void ({} as TutorPromptInput);"
    ].join("\n"));

    const result = await runStudy({ source: sourceRoot, mode: "quick", level: "beginner", studiesRoot });
    const report = JSON.parse(await fs.readFile(path.join(result.session.outputPaths.analysis, "llm-readiness-report.json"), "utf8")) as {
      sourcePattern: string;
      llmSetups: Array<{ filePath: string; provider: string; promptCount: number }>;
      promptSignals: Array<{ signal: string; readiness: string }>;
      packageSignals: Array<{ signal: string; readiness: string }>;
    };
    const readySignals = <T extends { signal: string; readiness: string }>(items: T[]) => items.filter((item) => item.readiness === "ready").map((item) => item.signal);
    const setup = report.llmSetups.find((item) => item.filePath === "src/llm/base-prompt-serialization.ts");
    expect(report.sourcePattern).toContain("BasePromptTemplate BasePromptTemplateInput BaseStringPromptTemplate PromptValueReturnType formatPromptValue mergePartialAndUserVariables");
    expect(report.sourcePattern).toContain("StringPromptValue SerializedPromptTemplate SerializedFewShotTemplate SerializedBasePromptTemplate input_variables template_format serialize deserialize load LoadOptions secretsMap secretsFromEnv optionalImportsMap optionalImportEntrypoints importMap maxDepth DEFAULT_MAX_DEPTH reviver SerializedConstructor SerializedSecret SerializedNotImplemented getEnvironmentVariable isEscapedObject unescapeValue LC_ESCAPED_KEY escapeObject needsEscaping serializeValue serializeLcObject lc_serializable lc_secrets lc_aliases lc_attributes lc_serializable_keys toJSON toJSONNotImplemented replaceSecrets keyToJson keyFromJson mapKeys");
    expect(setup?.provider).toBe("langchain");
    expect(setup?.promptCount).toBeGreaterThan(0);
    expect(readySignals(report.promptSignals)).toEqual(expect.arrayContaining([
      "base-prompt-template",
      "base-prompt-input",
      "base-string-prompt-template",
      "prompt-value-formatting",
      "prompt-serialization",
      "prompt-partial-merge"
    ]));
    expect(readySignals(report.packageSignals)).toEqual(expect.arrayContaining(["langchain", "@langchain/core"]));
  });
});
