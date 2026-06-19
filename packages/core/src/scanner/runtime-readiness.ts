import fsSync from "node:fs";
import path from "node:path";
import type { DependencyReport, RuntimeEnvironmentReport } from "@repotutor/shared";
import type { WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export function buildRuntimeEnvironmentReport(walk: WalkResult, dependencyReport: DependencyReport): RuntimeEnvironmentReport {
  const detectedManifests = dependencyReport.manifests.map((manifest) => ({
    filePath: manifest.filePath,
    ecosystem: manifest.ecosystem,
    signal: `${manifest.dependencies.length}개 의존성 또는 설정 항목을 확인했습니다.`
  }));
  const sourceFiles = runtimeEnvironmentSourceFiles(walk);
  const setupFiles = walk.files.filter((file) => setupSignalFor(file.relPath) !== null);
  const containerFiles = walk.files.filter((file) => containerSignalFor(file.relPath) !== null);
  const setupSignals = setupFiles.slice(0, 12).map((file) => ({
    filePath: file.relPath,
    signal: setupSignalFor(file.relPath) ?? "setup file",
    beginnerExplanation: `${file.relPath} 파일은 실행 전에 필요한 설치, 스크립트, 환경 변수 단서를 제공합니다.`
  }));
  const containerSignals = containerFiles.slice(0, 12).map((file) => ({
    filePath: file.relPath,
    signal: containerSignalFor(file.relPath) ?? "container file",
    beginnerExplanation: `${file.relPath} 파일은 컨테이너 또는 서비스 실행 방식을 추정하는 근거입니다.`
  }));
  const serviceHints = [
    ...detectedManifests.map((manifest) => ({
      name: manifest.ecosystem,
      reason: `${manifest.filePath} 기준으로 ${manifest.ecosystem} 런타임 준비가 필요합니다.`,
      sourcePath: manifest.filePath
    })),
    ...containerSignals.map((signal) => ({
      name: signal.filePath.toLowerCase().includes("compose") ? "Docker Compose" : "Docker",
      reason: signal.signal,
      sourcePath: signal.filePath
    }))
  ].slice(0, 12);
  const toolVersionSignals = runtimeToolVersionSignals(sourceFiles);
  const environmentConfigSignals = runtimeEnvironmentConfigSignals(sourceFiles);
  const taskRunnerSignals = runtimeTaskRunnerSignals(sourceFiles);
  const missingSignals = [
    setupSignals.length === 0 ? "설치/실행 매니페스트를 찾지 못했습니다." : null,
    containerSignals.length === 0 ? "Dockerfile 또는 Compose 파일을 찾지 못했습니다." : null,
    walk.files.some((file) => /\.env\.example$|\.env\.sample$/i.test(file.relPath)) ? null : ".env.example 또는 .env.sample 예시 파일이 보이지 않습니다.",
    toolVersionSignals.some((item) => item.readiness === "ready") ? null : "mise, .tool-versions, 또는 idiomatic version file 기반 tool version 단서가 보이지 않습니다.",
    taskRunnerSignals.some((item) => item.readiness === "ready") ? null : "mise task 또는 task include 단서가 보이지 않습니다."
  ].filter(Boolean) as string[];
  return {
    summary: `docSmith/mise식 실행 환경 점검: manifest ${detectedManifests.length}개, container signal ${containerSignals.length}개, setup signal ${setupSignals.length}개, tool version signal ${toolVersionSignals.length}개, env config signal ${environmentConfigSignals.length}개, task signal ${taskRunnerSignals.length}개를 정적으로 확인했습니다.`,
    sourcePattern: "docSmith Dockerfile and Docker Compose generation prompts; mise dev tools env vars tasks mise.toml .mise.toml .tool-versions idiomatic version files mise install exec run doctor trust config hierarchy environments task_config includes mise-action",
    detectedManifests,
    setupSignals,
    containerSignals,
    serviceHints,
    toolVersionSignals,
    environmentConfigSignals,
    taskRunnerSignals,
    missingSignals,
    learnerNextSteps: [
      "manifest 파일에서 설치 명령과 런타임 버전을 먼저 확인하세요.",
      "mise.toml이나 .tool-versions가 있으면 [tools]와 lock/version 파일을 먼저 읽어 실제 런타임 버전을 고정하세요.",
      "[env]와 MISE_ENV 관련 파일은 학습 실행 전 필요한 환경 변수를 설명하는 근거로 분리하세요.",
      "[tasks]와 mise-tasks 파일은 build/test/lint/dev 명령을 재현하는 학습 경로로 사용하세요.",
      "Dockerfile이나 Compose 파일이 있으면 로컬 실행 방식과 컨테이너 실행 방식을 비교하세요.",
      ".env.example이 없으면 필요한 환경 변수를 README와 config 파일에서 따로 추적하세요."
    ]
  };
}

type RuntimeEnvironmentSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

function runtimeEnvironmentSourceFiles(walk: WalkResult): RuntimeEnvironmentSourceFile[] {
  const files: RuntimeEnvironmentSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate || !runtimeEnvironmentInspectablePath(file.relPath)) continue;
    let text: string;
    try {
      text = fsSync.readFileSync(file.absPath, "utf8").slice(0, 180_000);
    } catch {
      continue;
    }
    if (!runtimeEnvironmentPathSignal(file.relPath) && !runtimeEnvironmentContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 220) break;
  }
  return files;
}

function runtimeEnvironmentInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return runtimeEnvironmentPathSignal(filePath)
    || /^readme\.(md|txt)$/i.test(base)
    || /^package\.json$/i.test(base)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath)
    || /\.(toml|ya?ml|json|md|env|sh|bash|zsh)$/i.test(filePath);
}

function runtimeEnvironmentPathSignal(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return /^\.?mise(?:\.[a-z0-9_-]+)?(?:\.local)?\.toml$/i.test(base)
    || /^\.?miserc\.toml$/i.test(base)
    || /^\.tool-versions$/i.test(base)
    || /^\.(node|ruby|python|java|go|rust)-version$/i.test(base)
    || /^mise\.lock$/i.test(base)
    || /^mise\/config(?:\.[a-z0-9_-]+)?\.toml$/i.test(filePath)
    || /^\.mise\/config(?:\.[a-z0-9_-]+)?\.toml$/i.test(filePath)
    || /^\.config\/mise(?:\/config(?:\.[a-z0-9_-]+)?|\.toml|\/conf\.d\/.+\.toml)$/i.test(filePath)
    || /^mise-tasks\//i.test(filePath)
    || /^\.github\/workflows\/.+\.ya?ml$/i.test(filePath);
}

function runtimeEnvironmentContentSignal(text: string): boolean {
  return /\bmise\b|MISE_ENV|MISE_CONFIG|MISE_PROJECT_ROOT|\.tool-versions|\[tools\]|\[env\]|\[tasks(?:\.|\])|task_config|mise-action|mise\s+(install|exec|x|run|doctor|trust|config|watch)/i.test(text);
}

function runtimeToolVersionSignals(sourceFiles: RuntimeEnvironmentSourceFile[]): RuntimeEnvironmentReport["toolVersionSignals"] {
  const specs: Array<{ signal: RuntimeEnvironmentReport["toolVersionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mise-config", pattern: /(^|\/)\.?mise(?:\.[a-z0-9_-]+)?(?:\.local)?\.toml$|(^|\/)\.?config\/mise/i, evidence: "mise config file evidence was detected." },
    { signal: "mise-tools", pattern: /\[tools\]|tools\.[A-Za-z0-9_"'.:-]+\s*=|node\s*=\s*["']|python\s*=\s*["']|ruby\s*=\s*["']/i, evidence: "mise [tools] version evidence was detected." },
    { signal: "tool-versions", pattern: /(^|\/)\.tool-versions$|\.tool-versions/i, evidence: "asdf-compatible .tool-versions evidence was detected." },
    { signal: "idiomatic-version-file", pattern: /(^|\/)\.(node|ruby|python|java|go|rust)-version$|\.(node|ruby|python|java|go|rust)-version/i, evidence: "idiomatic version file evidence was detected." },
    { signal: "mise-lock", pattern: /(^|\/)mise\.lock$|mise\.lock/i, evidence: "mise lockfile evidence was detected." },
    { signal: "mise-install-command", pattern: /\bmise\s+install\b|jdx\/mise-action.+install/i, evidence: "mise install command evidence was detected." },
    { signal: "mise-exec-command", pattern: /\bmise\s+(exec|x)\b/i, evidence: "mise exec command evidence was detected." },
    { signal: "mise-action", pattern: /jdx\/mise-action|mise-action/i, evidence: "GitHub Actions mise-action evidence was detected." },
    { signal: "mise-doctor", pattern: /\bmise\s+doctor\b/i, evidence: "mise doctor troubleshooting command evidence was detected." },
    { signal: "mise-trust", pattern: /\bmise\s+(trust|untrust)\b|trusted_config_paths/i, evidence: "mise trust policy evidence was detected." }
  ];
  return runtimeSignalFromSpecs(sourceFiles, specs, "tool version", "signal");
}

function runtimeEnvironmentConfigSignals(sourceFiles: RuntimeEnvironmentSourceFile[]): RuntimeEnvironmentReport["environmentConfigSignals"] {
  const specs: Array<{ signal: RuntimeEnvironmentReport["environmentConfigSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "env-section", pattern: /\[env\]|env\.[A-Za-z0-9_]+\s*=/i, evidence: "mise [env] section evidence was detected." },
    { signal: "env-file-directive", pattern: /_\.(file|dotenv)\s*=|\.env(\.example|\.sample)?/i, evidence: "env file directive evidence was detected." },
    { signal: "env-source-directive", pattern: /_\.source\s*=|source_env|source_file/i, evidence: "env source directive evidence was detected." },
    { signal: "mise-env", pattern: /MISE_ENV|--env\s+[A-Za-z0-9_-]+|-E\s+[A-Za-z0-9_-]+/i, evidence: "MISE_ENV environment selection evidence was detected." },
    { signal: "mise-env-config", pattern: /(^|\/)\.?mise\.[a-z0-9_-]+(?:\.local)?\.toml$|mise\.\{MISE_ENV\}\.toml/i, evidence: "environment-specific mise config evidence was detected." },
    { signal: "mise-config-hierarchy", pattern: /MISE_CEILING_PATHS|MISE_CONFIG_DIR|config\.local\.toml|conf\.d|mise config|mise cfg/i, evidence: "mise config hierarchy evidence was detected." },
    { signal: "mise-settings", pattern: /\[settings\]|settings\.[A-Za-z0-9_-]+\s*=|experimental\s*=/i, evidence: "mise settings evidence was detected." },
    { signal: "mise-path", pattern: /_\.(path|path_prepend)|MISE_DATA_DIR|MISE_INSTALL_PATH|MISE_PROJECT_ROOT/i, evidence: "mise path/environment directory evidence was detected." },
    { signal: "direnv", pattern: /direnv|\.envrc|use_mise/i, evidence: "direnv integration evidence was detected." }
  ];
  return runtimeSignalFromSpecs(sourceFiles, specs, "environment config", "signal");
}

function runtimeTaskRunnerSignals(sourceFiles: RuntimeEnvironmentSourceFile[]): RuntimeEnvironmentReport["taskRunnerSignals"] {
  const specs: Array<{ signal: RuntimeEnvironmentReport["taskRunnerSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "toml-task", pattern: /\[tasks(?:\.|\])|tasks\.[A-Za-z0-9_"'.:-]+\s*=/i, evidence: "mise TOML task evidence was detected." },
    { signal: "file-task", pattern: /^mise-tasks\//i, evidence: "mise file task evidence was detected." },
    { signal: "task-depends", pattern: /\bdepends\s*=\s*\[|\bdepends\s*=/i, evidence: "mise task dependency evidence was detected." },
    { signal: "task-description", pattern: /\bdescription\s*=/i, evidence: "mise task description evidence was detected." },
    { signal: "task-run-command", pattern: /\brun\s*=\s*["']|\brun\s*=\s*\[/i, evidence: "mise task run command evidence was detected." },
    { signal: "task-config-includes", pattern: /\[task_config\]|\bincludes\s*=\s*\[/i, evidence: "mise task_config include evidence was detected." },
    { signal: "mise-run-command", pattern: /\bmise\s+run\b|\bmise\s+[A-Za-z0-9_-]+\b/i, evidence: "mise run command evidence was detected." },
    { signal: "mise-watch-command", pattern: /\bmise\s+watch\b|watching-files/i, evidence: "mise watch command evidence was detected." },
    { signal: "monorepo-task-context", pattern: /MISE_MONOREPO_ROOT|MISE_PROJECT_ROOT|experimental_monorepo_root/i, evidence: "mise monorepo task context evidence was detected." }
  ];
  return runtimeSignalFromSpecs(sourceFiles, specs, "task runner", "signal");
}

function runtimeSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: RuntimeEnvironmentSourceFile[],
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
      relatedHref: match?.sourceHref ?? "html/runtime-environment.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string };
  });
}

function setupSignalFor(filePath: string): string | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "package.json") return "Node package scripts/dependencies";
  if (base === "requirements.txt") return "Python pip requirements";
  if (base === "pyproject.toml") return "Python project metadata";
  if (base === "cargo.toml") return "Rust cargo manifest";
  if (base === "go.mod") return "Go module manifest";
  if (/^readme\.(md|txt)$/i.test(base)) return "README setup instructions";
  if (/\.env\.example$|\.env\.sample$/i.test(filePath)) return "environment variable example";
  if (/^\.?mise(?:\.[a-z0-9_-]+)?(?:\.local)?\.toml$/i.test(base)) return "mise dev tools/env/tasks config";
  if (base === ".tool-versions") return "asdf-compatible tool versions";
  return null;
}

function containerSignalFor(filePath: string): string | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "dockerfile" || base.endsWith(".dockerfile")) return "Dockerfile container recipe";
  if (base === "docker-compose.yml" || base === "docker-compose.yaml" || base === "compose.yml" || base === "compose.yaml") return "Docker Compose service map";
  return null;
}
