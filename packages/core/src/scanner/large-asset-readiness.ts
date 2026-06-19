import path from "node:path";
import type { LargeAssetReadinessReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export async function buildLargeAssetReadinessReport(walk: WalkResult): Promise<LargeAssetReadinessReport> {
  const sourceFiles = await largeAssetSourceFiles(walk);
  const assetSetups = largeAssetSetups(sourceFiles);
  const lfsSignals = largeAssetLfsSignals(sourceFiles);
  const dvcSignals = largeAssetDvcSignals(sourceFiles);
  const submoduleSignals = largeAssetSubmoduleSignals(sourceFiles);
  const workflowSignals = largeAssetWorkflowSignals(sourceFiles);
  const packageSignals = largeAssetPackageSignals(sourceFiles);
  const hasAssetSetup = assetSetups.length > 0;
  const hasLfsAttributes = lfsSignals.some((item) => item.signal === "gitattributes" && item.readiness === "ready");
  const hasLfsPointer = lfsSignals.some((item) => ["pointer-file", "oid-sha256"].includes(item.signal) && item.readiness === "ready");
  const hasLfsStatus = lfsSignals.some((item) => ["status-command", "fsck"].includes(item.signal) && item.readiness === "ready");
  const hasLfsTransport = lfsSignals.some((item) => ["pull-push-fetch", "install-command"].includes(item.signal) && item.readiness === "ready");
  const hasDvcOuts = dvcSignals.some((item) => ["dvc-yaml", "dvc-file", "outs"].includes(item.signal) && item.readiness === "ready");
  const hasDvcRemote = dvcSignals.some((item) => ["remote-config", "default-remote"].includes(item.signal) && item.readiness === "ready");
  const hasDvcFlow = dvcSignals.some((item) => ["push", "pull", "status", "repro"].includes(item.signal) && item.readiness === "ready");
  const hasLockable = lfsSignals.some((item) => item.signal === "lockable" && item.readiness === "ready");
  const hasLocks = lfsSignals.some((item) => item.signal === "locks" && item.readiness === "ready");
  const hasSubmodule = submoduleSignals.some((item) => ["gitmodules", "submodule-url", "submodule-path"].includes(item.signal) && item.readiness === "ready");
  const hasRecursiveClone = submoduleSignals.some((item) => item.signal === "recursive-clone" && item.readiness === "ready");

  const riskQueue: LargeAssetReadinessReport["riskQueue"] = [];
  if (!hasAssetSetup) {
    riskQueue.push({
      priority: "high",
      action: "Add explicit large-asset ownership, LFS, DVC, or submodule evidence before claiming large asset readiness.",
      why: "Large models, media, datasets, and generated archives need a reproducible versioning path that plain Git history usually cannot explain by itself.",
      relatedHref: "html/large-asset-readiness.html"
    });
  }
  if (hasLfsPointer && !hasLfsAttributes) {
    riskQueue.push({
      priority: "high",
      action: "Add or repair .gitattributes LFS patterns for detected pointer files.",
      why: "Git LFS pointer files without matching attributes are easy to check out incorrectly and are hard for learners to reproduce.",
      relatedHref: largeAssetFirstHref(assetSetups, "git-lfs")
    });
  }
  if (hasLfsAttributes && (!hasLfsStatus || !hasLfsTransport)) {
    riskQueue.push({
      priority: "medium",
      action: "Document Git LFS install, status/fsck, and pull/fetch/push checks in CI or contributor docs.",
      why: "Git LFS tracking alone does not prove clones fetch large objects or that pointer integrity is checked.",
      relatedHref: largeAssetFirstHref(assetSetups, "git-lfs")
    });
  }
  if (hasLockable && !hasLocks) {
    riskQueue.push({
      priority: "medium",
      action: "Document the locking workflow for lockable LFS patterns.",
      why: "Lockable patterns protect binary assets only when contributors know how to inspect and manage locks.",
      relatedHref: largeAssetFirstHref(assetSetups, "git-lfs")
    });
  }
  if (hasDvcOuts && !hasDvcRemote) {
    riskQueue.push({
      priority: "high",
      action: "Configure and document a default DVC remote for tracked outs.",
      why: "DVC-tracked datasets and models are not reproducible for a new learner unless the data remote can be discovered and pulled.",
      relatedHref: largeAssetFirstHref(assetSetups, "dvc")
    });
  }
  if (hasDvcRemote && !hasDvcFlow) {
    riskQueue.push({
      priority: "medium",
      action: "Add DVC status, pull, push, or repro workflow evidence.",
      why: "A DVC remote is storage configuration; learners still need the safe commands that validate, hydrate, and reproduce data outputs.",
      relatedHref: largeAssetFirstHref(assetSetups, "dvc")
    });
  }
  if (hasSubmodule && !hasRecursiveClone) {
    riskQueue.push({
      priority: "low",
      action: "Document recursive clone/update commands for asset submodules.",
      why: "Submodule-backed asset trees often look empty or stale unless clone/update steps are explicit.",
      relatedHref: largeAssetFirstHref(assetSetups, "git-submodule")
    });
  }

  return {
    summary: `Large asset readiness report: asset setup ${assetSetups.length}개, Git LFS ready signals ${lfsSignals.filter((item) => item.readiness === "ready").length}개, DVC ready signals ${dvcSignals.filter((item) => item.readiness === "ready").length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Git LFS DVC large file data versioning .gitattributes filter=lfs pointer oid sha256 lockable migrate track status fsck prune dvc.yaml dvc.lock outs deps metrics params remote cache push pull status repro",
    assetSetups,
    lfsSignals,
    dvcSignals,
    submoduleSignals,
    workflowSignals,
    packageSignals,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      { command: "git lfs track", purpose: "List tracked Git LFS patterns from .gitattributes in a trusted checkout." },
      { command: "git lfs status --json", purpose: "Check whether LFS objects differ between HEAD, index, working tree, and the LFS server." },
      { command: "git lfs fsck --pointers BASE..HEAD", purpose: "Validate LFS pointer files and object integrity for a review range." },
      { command: "git lfs migrate info --everything --pointers=ignore --top=100", purpose: "Find large historical blobs that may need LFS migration planning." },
      { command: "git lfs pull", purpose: "Hydrate LFS-tracked assets after clone or checkout." },
      { command: "dvc doctor", purpose: "Inspect DVC installation, cache, and environment details in a trusted workspace." },
      { command: "dvc status", purpose: "Compare DVC pipeline/data state against the workspace and configured remotes." },
      { command: "dvc pull", purpose: "Fetch DVC-tracked data/model outputs from the configured remote." },
      { command: "dvc push", purpose: "Upload changed DVC outputs after reproducing a pipeline." },
      { command: "dvc repro", purpose: "Reproduce DVC stages from declared deps, params, metrics, and outs." },
      { command: "rg \"filter=lfs|version https://git-lfs.github.com/spec/v1|dvc.yaml|dvc.lock|outs:|deps:|remote\" .", purpose: "Statically inventory LFS/DVC evidence without executing project commands." }
    ],
    learnerNextSteps: [
      "Open .gitattributes first and map each filter=lfs pattern to the asset classes it protects.",
      "Check whether LFS pointer files and lockable patterns also have status, fsck, pull, and lock workflow documentation.",
      "For DVC, read dvc.yaml, dvc.lock, and .dvc/config together: outs and deps explain what changes, while remotes explain how learners hydrate data.",
      "Separate static readiness from live data access: RepoTutor does not contact LFS/DVC remotes or download large assets."
    ]
  };
}

type LargeAssetSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function largeAssetSourceFiles(walk: WalkResult): Promise<LargeAssetSourceFile[]> {
  const files: LargeAssetSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate && !largeAssetPathSignal(file.relPath)) continue;
    if (!largeAssetInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 220_000);
    if (!text) continue;
    if (!largeAssetPathSignal(file.relPath) && !largeAssetContentSignal(text)) continue;
    files.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
    if (files.length >= 260) break;
  }
  return files;
}

function largeAssetInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return largeAssetPathSignal(filePath)
    || /^(package\.json|pyproject\.toml|requirements.*\.txt|README\.md|CONTRIBUTING\.md|Makefile|justfile)$/i.test(base)
    || /\.(ya?ml|json|md|toml|ini|cfg|txt|sh|bash|zsh|ps1|[cm]?[jt]sx?|py|rb|go)$/i.test(base);
}

function largeAssetPathSignal(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^\.gitattributes$/i.test(base)
    || /^\.gitmodules$/i.test(base)
    || /^dvc\.(ya?ml|lock)$/i.test(base)
    || /^\.dvcignore$/i.test(base)
    || /\.dvc$/i.test(base)
    || /^\.dvc\/config(\.local)?$/i.test(filePath)
    || /(^|\/)(lfs|dvc|assets?|datasets?|models?|checkpoints?|weights?|media|artifacts?)(\/|[-_.])/i.test(filePath)
    || /large[-_ ]?(asset|file)|git[-_ ]?lfs|data[-_ ]?version|model[-_ ]?weights/i.test(filePath);
}

function largeAssetContentSignal(text: string): boolean {
  return /\b(filter=lfs|git\s+lfs|version https:\/\/git-lfs\.github\.com\/spec\/v1|oid sha256:|dvc\.yaml|dvc\.lock|dvc\s+(push|pull|status|repro|doctor|remote|stage|add)|outs:|deps:|metrics:|params:|\.dvc\/config|submodule)\b/i.test(text);
}

function largeAssetSetups(sourceFiles: LargeAssetSourceFile[]): LargeAssetReadinessReport["assetSetups"] {
  return sourceFiles.slice(0, 100).map((source) => {
    const patternCount = countMatches(source.text, /(^|\s)filter=lfs\b|\bdiff=lfs\b|\bmerge=lfs\b|^\s*(?!#)\S+\s+.*\bfilter=lfs\b/gim);
    const pointerCount = countMatches(source.text, /version https:\/\/git-lfs\.github\.com\/spec\/v1|oid sha256:/gi);
    const outCount = countMatches(source.text, /(^|\n)\s*outs?:\s*|\bouts\b/gi);
    const depCount = countMatches(source.text, /(^|\n)\s*deps?:\s*|\bdeps\b/gi);
    const metricCount = countMatches(source.text, /(^|\n)\s*metrics?:\s*|\bmetrics\.json\b|\b-M\b/gi);
    const remoteCount = countMatches(source.text, /\bremote\b|s3:\/\/|gs:\/\/|azure:\/\/|ssh:\/\/|gdrive:\/\/|oss:\/\//gi);
    const cacheCount = countMatches(source.text, /\bcache\b|run-cache|\.dvc\/cache/gi);
    const lockableCount = countMatches(source.text, /\blockable\b|git\s+lfs\s+locks?/gi);
    const commandCount = countMatches(source.text, /\b(git\s+lfs|dvc\s+(push|pull|status|repro|doctor|remote|stage|add|fetch|checkout|commit))\b/gi);
    const tool = largeAssetToolFor(source.filePath, source.text);
    const setupType = largeAssetSetupTypeFor(source.filePath, source.text);
    const evidenceScore = patternCount + pointerCount + outCount + depCount + metricCount + remoteCount + cacheCount + lockableCount + commandCount;
    const readiness = evidenceScore >= 2 || ["gitattributes", "dvc-file", "dvc-pipeline", "dvc-config", "gitmodules"].includes(setupType)
      ? "ready"
      : evidenceScore > 0
        ? "partial"
        : "missing";
    return {
      filePath: source.filePath,
      tool,
      setupType,
      patternCount,
      pointerCount,
      outCount,
      depCount,
      metricCount,
      remoteCount,
      cacheCount,
      lockableCount,
      commandCount,
      readiness,
      evidence: `${source.filePath} has ${patternCount} LFS pattern signal(s), ${pointerCount} pointer signal(s), ${outCount} DVC out signal(s), ${depCount} dep signal(s), ${remoteCount} remote signal(s), and ${commandCount} command signal(s).`,
      sourceHref: source.sourceHref
    };
  });
}

function largeAssetToolFor(filePath: string, text: string): LargeAssetReadinessReport["assetSetups"][number]["tool"] {
  if (/^\.gitattributes$/i.test(path.basename(filePath)) || /\b(filter=lfs|git\s+lfs|git-lfs\.github\.com\/spec\/v1)\b/i.test(text)) return "git-lfs";
  if (/^dvc\.(ya?ml|lock)$/i.test(path.basename(filePath)) || /\.dvc$/i.test(filePath) || /^\.dvc\//i.test(filePath) || /\bdvc\s+(push|pull|status|repro|doctor|remote|stage|add)\b/i.test(text)) return "dvc";
  if (/^\.gitmodules$/i.test(path.basename(filePath)) || /\bsubmodule\b/i.test(text)) return "git-submodule";
  if (largeAssetContentSignal(text)) return "custom";
  return "unknown";
}

function largeAssetSetupTypeFor(filePath: string, text: string): LargeAssetReadinessReport["assetSetups"][number]["setupType"] {
  const base = path.basename(filePath);
  if (/^\.gitattributes$/i.test(base)) return "gitattributes";
  if (/git-lfs\.github\.com\/spec\/v1|oid sha256:/i.test(text)) return "lfs-pointer";
  if (/\.dvc$/i.test(filePath)) return "dvc-file";
  if (/^dvc\.(ya?ml|lock)$/i.test(base)) return "dvc-pipeline";
  if (/^\.dvc\/config(\.local)?$/i.test(filePath)) return "dvc-config";
  if (/^\.gitmodules$/i.test(base)) return "gitmodules";
  if (/\.(md|txt)$/i.test(base)) return "documentation";
  if (/\.(sh|bash|zsh|ps1|[cm]?[jt]sx?|py|rb|go)$/i.test(base) || /package\.json|Makefile|justfile/i.test(base)) return "script";
  return "unknown";
}

function largeAssetLfsSignals(sourceFiles: LargeAssetSourceFile[]): LargeAssetReadinessReport["lfsSignals"] {
  const specs: Array<{ signal: LargeAssetReadinessReport["lfsSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "gitattributes", pattern: /\.gitattributes|filter=lfs/i, evidence: ".gitattributes or LFS attribute evidence was detected." },
    { signal: "filter-lfs", pattern: /\bfilter=lfs\b/i, evidence: "filter=lfs evidence was detected." },
    { signal: "diff-merge-lfs", pattern: /\bdiff=lfs\b|\bmerge=lfs\b/i, evidence: "diff/merge LFS driver evidence was detected." },
    { signal: "pointer-file", pattern: /version https:\/\/git-lfs\.github\.com\/spec\/v1/i, evidence: "Git LFS pointer file version evidence was detected." },
    { signal: "oid-sha256", pattern: /oid sha256:[0-9a-f]{16,}/i, evidence: "Git LFS SHA-256 object pointer evidence was detected." },
    { signal: "track-command", pattern: /git\s+lfs\s+track/i, evidence: "git lfs track evidence was detected." },
    { signal: "install-command", pattern: /git\s+lfs\s+install/i, evidence: "git lfs install evidence was detected." },
    { signal: "status-command", pattern: /git\s+lfs\s+status/i, evidence: "git lfs status evidence was detected." },
    { signal: "pull-push-fetch", pattern: /git\s+lfs\s+(pull|push|fetch)/i, evidence: "git lfs pull/push/fetch evidence was detected." },
    { signal: "fsck", pattern: /git\s+lfs\s+fsck|--pointers/i, evidence: "git lfs fsck pointer validation evidence was detected." },
    { signal: "migrate", pattern: /git\s+lfs\s+migrate/i, evidence: "git lfs migrate evidence was detected." },
    { signal: "prune", pattern: /git\s+lfs\s+prune/i, evidence: "git lfs prune evidence was detected." },
    { signal: "lockable", pattern: /\blockable\b|--lockable/i, evidence: "lockable LFS pattern evidence was detected." },
    { signal: "locks", pattern: /git\s+lfs\s+locks?/i, evidence: "git lfs lock/list-locks evidence was detected." },
    { signal: "skip-smudge", pattern: /skip-smudge|GIT_LFS_SKIP_SMUDGE/i, evidence: "skip-smudge checkout evidence was detected." },
    { signal: "case-sensitive-patterns", pattern: /case[- ]sensitive|bracketed case|case patterns/i, evidence: "case-sensitive LFS pattern guidance was detected." }
  ];
  return largeAssetSignalFromSpecs(sourceFiles, specs, "Git LFS");
}

function largeAssetDvcSignals(sourceFiles: LargeAssetSourceFile[]): LargeAssetReadinessReport["dvcSignals"] {
  const specs: Array<{ signal: LargeAssetReadinessReport["dvcSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "dvc-yaml", pattern: /(^|\/)dvc\.ya?ml$|stages:\s*\n/i, evidence: "dvc.yaml pipeline evidence was detected." },
    { signal: "dvc-lock", pattern: /(^|\/)dvc\.lock$|md5:\s*|hash:\s*/i, evidence: "dvc.lock/hash evidence was detected." },
    { signal: "dvc-file", pattern: /\.dvc$|outs:\s*\n/i, evidence: ".dvc file or outs evidence was detected." },
    { signal: "outs", pattern: /(^|\n)\s*outs?:\s*/i, evidence: "DVC outs evidence was detected." },
    { signal: "deps", pattern: /(^|\n)\s*deps?:\s*/i, evidence: "DVC deps evidence was detected." },
    { signal: "metrics", pattern: /(^|\n)\s*metrics?:\s*|\bmetrics\.json\b|\b-M\b/i, evidence: "DVC metrics evidence was detected." },
    { signal: "params", pattern: /(^|\n)\s*params?:\s*|\bparams\.ya?ml\b/i, evidence: "DVC params evidence was detected." },
    { signal: "remote-config", pattern: /\['remote "|^\s*\[remote\b|\bdvc\s+remote\s+add\b|s3:\/\/|gs:\/\/|azure:\/\/|gdrive:\/\//im, evidence: "DVC remote config evidence was detected." },
    { signal: "default-remote", pattern: /\bremote\s*=|dvc\s+remote\s+default|\bdvc\s+remote\s+add\s+-d\b/i, evidence: "DVC default remote evidence was detected." },
    { signal: "cache", pattern: /\.dvc\/cache|\bcache\s*=|\bcache\b/i, evidence: "DVC cache evidence was detected." },
    { signal: "push", pattern: /\bdvc\s+push\b/i, evidence: "dvc push evidence was detected." },
    { signal: "pull", pattern: /\bdvc\s+pull\b/i, evidence: "dvc pull evidence was detected." },
    { signal: "status", pattern: /\bdvc\s+status\b/i, evidence: "dvc status evidence was detected." },
    { signal: "repro", pattern: /\bdvc\s+repro\b/i, evidence: "dvc repro evidence was detected." },
    { signal: "run-cache", pattern: /run-cache|stage cache|stage_cache/i, evidence: "DVC run-cache or stage-cache evidence was detected." },
    { signal: "dvcignore", pattern: /(^|\/)\.dvcignore$|\.dvcignore/i, evidence: ".dvcignore evidence was detected." },
    { signal: "optional-remote-deps", pattern: /dvc-(s3|azure|gdrive|gs|oss|ssh)|\[s3\]|\[azure\]|\[gdrive\]|\[gs\]/i, evidence: "optional DVC remote dependency evidence was detected." }
  ];
  return largeAssetSignalFromSpecs(sourceFiles, specs, "DVC");
}

function largeAssetSubmoduleSignals(sourceFiles: LargeAssetSourceFile[]): LargeAssetReadinessReport["submoduleSignals"] {
  const specs: Array<{ signal: LargeAssetReadinessReport["submoduleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "gitmodules", pattern: /(^|\/)\.gitmodules$|\[submodule /i, evidence: ".gitmodules evidence was detected." },
    { signal: "submodule-url", pattern: /^\s*url\s*=/im, evidence: "submodule URL evidence was detected." },
    { signal: "submodule-path", pattern: /^\s*path\s*=/im, evidence: "submodule path evidence was detected." },
    { signal: "recursive-clone", pattern: /--recursive|submodule\s+update\s+--init|submodule\.recurse/i, evidence: "recursive clone/update evidence was detected." },
    { signal: "lfs-submodule", pattern: /submodule.*lfs|lfs.*submodule/i, evidence: "LFS submodule interaction evidence was detected." }
  ];
  return largeAssetSignalFromSpecs(sourceFiles, specs, "submodule");
}

function largeAssetWorkflowSignals(sourceFiles: LargeAssetSourceFile[]): LargeAssetReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: LargeAssetReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "ci-fetch", pattern: /\b(git\s+lfs\s+fetch|dvc\s+fetch)\b/i, evidence: "CI fetch evidence was detected." },
    { signal: "ci-pull", pattern: /\b(git\s+lfs\s+pull|dvc\s+pull)\b/i, evidence: "CI pull evidence was detected." },
    { signal: "ci-push", pattern: /\b(git\s+lfs\s+push|dvc\s+push)\b/i, evidence: "CI push evidence was detected." },
    { signal: "artifact-cache", pattern: /actions\/cache|cache:|restore-keys|artifact|\.dvc\/cache/i, evidence: "artifact/cache evidence was detected." },
    { signal: "pre-push-hook", pattern: /pre-push|\.git\/hooks\/pre-push|\.husky\/pre-push/i, evidence: "pre-push large asset hook evidence was detected." },
    { signal: "checkout-lfs", pattern: /lfs:\s*true|git\s+lfs\s+checkout|GIT_LFS_SKIP_SMUDGE/i, evidence: "checkout LFS evidence was detected." },
    { signal: "dvc-repro", pattern: /\bdvc\s+repro\b/i, evidence: "DVC repro workflow evidence was detected." },
    { signal: "dvc-doctor", pattern: /\bdvc\s+doctor\b/i, evidence: "DVC doctor workflow evidence was detected." }
  ];
  return largeAssetSignalFromSpecs(sourceFiles, specs, "workflow");
}

function largeAssetPackageSignals(sourceFiles: LargeAssetSourceFile[]): LargeAssetReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LargeAssetReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "git-lfs", pattern: /\bgit-lfs\b|\bgit\s+lfs\b/i, evidence: "Git LFS package or command evidence was detected." },
    { signal: "dvc", pattern: /(^|["'\s])dvc(["'\s:@<>=-]|$)|\bdvc\s+(push|pull|status|repro|doctor)\b/i, evidence: "DVC package or command evidence was detected." },
    { signal: "dvc-s3", pattern: /\bdvc-s3\b|\[s3\]|s3:\/\//i, evidence: "DVC S3 remote dependency evidence was detected." },
    { signal: "dvc-azure", pattern: /\bdvc-azure\b|\[azure\]|azure:\/\//i, evidence: "DVC Azure remote dependency evidence was detected." },
    { signal: "dvc-gdrive", pattern: /\bdvc-gdrive\b|\[gdrive\]|gdrive:\/\//i, evidence: "DVC Google Drive remote dependency evidence was detected." },
    { signal: "dvc-gs", pattern: /\bdvc-gs\b|\[gs\]|gs:\/\//i, evidence: "DVC Google Cloud Storage dependency evidence was detected." },
    { signal: "dvc-oss", pattern: /\bdvc-oss\b|\[oss\]|oss:\/\//i, evidence: "DVC OSS remote dependency evidence was detected." },
    { signal: "dvc-ssh", pattern: /\bdvc-ssh\b|\[ssh\]|ssh:\/\//i, evidence: "DVC SSH remote dependency evidence was detected." },
    { signal: "custom", pattern: /large[-_ ]?(asset|file)|model weights|dataset|checkpoint|artifact/i, evidence: "custom large asset terminology evidence was detected." }
  ];
  return largeAssetSignalFromSpecs(sourceFiles, specs, "package");
}

function largeAssetSignalFromSpecs<T extends { signal: string; pattern: RegExp; evidence: string }>(
  sourceFiles: LargeAssetSourceFile[],
  specs: T[],
  label: string
): Array<{ signal: T["signal"]; readiness: "ready" | "missing" | "external"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.text) || spec.pattern.test(source.filePath));
    return {
      signal: spec.signal,
      readiness: match ? "ready" : sourceFiles.length > 0 ? "external" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec.signal} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/large-asset-readiness.html"
    };
  });
}

function largeAssetFirstHref(assetSetups: LargeAssetReadinessReport["assetSetups"], tool: LargeAssetReadinessReport["assetSetups"][number]["tool"]): string {
  return assetSetups.find((item) => item.tool === tool)?.sourceHref ?? "html/large-asset-readiness.html";
}

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

