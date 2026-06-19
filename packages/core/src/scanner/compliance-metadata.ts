import path from "node:path";
import type { LicenseRightsReport, SbomReport, SourceType } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { inferEcosystem } from "./repo-structure.js";
import { encodedPath } from "./source-links.js";

type SbomContext = {
  sourceType?: SourceType | null;
  sourceUrl?: string | null;
  localSourcePath?: string | null;
  branch?: string | null;
  commitHash?: string | null;
};

export async function buildLicenseRightsReport(walk: WalkResult): Promise<LicenseRightsReport> {
  const licenseFiles: LicenseRightsReport["licenseFiles"] = [];
  const packageLicenseSignals: LicenseRightsReport["packageLicenseSignals"] = [];
  const readmeLicenseReferences: LicenseRightsReport["readmeLicenseReferences"] = [];

  for (const file of walk.files) {
    const licenseScore = licenseFilenameScore(file.relPath);
    if (licenseScore > 0) {
      const text = (await readTextIfSafe(file.absPath, 120_000)) ?? "";
      const detected = detectLicenseFromText(text, file.relPath);
      licenseFiles.push({
        filePath: file.relPath,
        filenameScore: licenseScore,
        detectedSpdxId: detected.spdxId,
        confidence: detected.confidence,
        matcher: detected.matcher,
        evidence: detected.evidence,
        sourceHref: `source/${encodedPath(file.relPath)}`
      });
      continue;
    }

    const packageSignal = await packageLicenseSignal(file);
    if (packageSignal) packageLicenseSignals.push(packageSignal);

    if (/^readme(\.[a-z0-9]+)?$/i.test(path.basename(file.relPath))) {
      const text = (await readTextIfSafe(file.absPath, 80_000)) ?? "";
      readmeLicenseReferences.push(...readmeLicenseSignals(file.relPath, text));
    }
  }

  licenseFiles.sort((a, b) => b.filenameScore - a.filenameScore || b.confidence - a.confidence || a.filePath.localeCompare(b.filePath));
  packageLicenseSignals.sort((a, b) => b.confidence - a.confidence || a.filePath.localeCompare(b.filePath));
  readmeLicenseReferences.sort((a, b) => b.confidence - a.confidence || a.filePath.localeCompare(b.filePath));

  const selected = selectProjectLicense(licenseFiles, packageLicenseSignals, readmeLicenseReferences);
  const reviewWarnings: LicenseRightsReport["reviewWarnings"] = [];
  if (licenseFiles.length === 0) {
    reviewWarnings.push({
      severity: "error",
      message: "Licensee pattern: no root LICENSE/COPYING/UNLICENSE or top-level LICENSES/* candidate was found.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (licenseFiles.length > 1 && new Set(licenseFiles.map((file) => file.detectedSpdxId ?? "unknown")).size > 1) {
    reviewWarnings.push({
      severity: "warn",
      message: "Multiple license file candidates point to different identifiers; human review is required before publishing or reusing code.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (packageLicenseSignals.length > 0 && licenseFiles.length === 0) {
    reviewWarnings.push({
      severity: "warn",
      message: "Package metadata declares a license, but Licensee notes package fields are not a platform-agnostic substitute for a distributed license file.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (readmeLicenseReferences.length > 0) {
    reviewWarnings.push({
      severity: "info",
      message: "README license references are treated as review hints because natural-language license claims can be ambiguous.",
      relatedHref: "html/license-rights.html"
    });
  }

  const rightsChecklist: LicenseRightsReport["rightsChecklist"] = [
    {
      label: "Root license file",
      status: licenseFiles.length > 0 ? "pass" : "missing",
      evidence: licenseFiles.length > 0 ? `${licenseFiles.length} candidate license file(s) found.` : "No LICENSE, LICENCE, COPYING, COPYRIGHT, UNLICENSE, or LICENSES/* candidate found.",
      relatedHref: "html/license-rights.html"
    },
    {
      label: "Package license metadata",
      status: packageLicenseSignals.length > 0 ? "review" : "missing",
      evidence: packageLicenseSignals.length > 0 ? `${packageLicenseSignals.length} package manifest license signal(s) found.` : "No package manager license field detected in supported manifests.",
      relatedHref: "html/license-rights.html"
    },
    {
      label: "README license references",
      status: readmeLicenseReferences.length > 0 ? "review" : "missing",
      evidence: readmeLicenseReferences.length > 0 ? `${readmeLicenseReferences.length} README license reference(s) found.` : "No README license reference detected.",
      relatedHref: "html/license-rights.html"
    },
    {
      label: "Project license confidence",
      status: selected.spdxId && selected.confidence >= 0.8 ? "pass" : selected.spdxId ? "review" : "missing",
      evidence: selected.evidence,
      relatedHref: selected.sourceHref ?? "html/license-rights.html"
    }
  ];

  return {
    summary: `Licensee식 license rights report: license file 후보 ${licenseFiles.length}개, package license 신호 ${packageLicenseSignals.length}개, README 참조 ${readmeLicenseReferences.length}개를 분리해 검토 상태를 표시했습니다.`,
    sourcePattern: "Licensee license file detection filename score SPDX confidence matched_files package metadata README references human compliance review",
    detectedProjectLicense: selected,
    licenseFiles,
    packageLicenseSignals,
    readmeLicenseReferences,
    reviewWarnings,
    rightsChecklist,
    learnerNextSteps: [
      "Root license file 항목이 missing이면 배포/공개 전 LICENSE 파일을 추가할지 결정하세요.",
      "package license metadata는 보조 신호입니다. 실제 배포 권리는 license file과 원문을 먼저 확인하세요.",
      "README license reference는 자연어 힌트이므로 detectedProjectLicense를 확정하는 근거로 단독 사용하지 마세요.",
      "여러 license 후보가 있으면 선택형/이중 라이선스인지, 서로 충돌하는지 사람 검토로 분리하세요."
    ]
  };
}

function licenseFilenameScore(filePath: string): number {
  const parts = filePath.split("/");
  const fileName = parts.at(-1) ?? filePath;
  const lower = fileName.toLowerCase();
  if (parts.length === 2 && parts[0] === "LICENSES" && /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.(?:md|markdown|txt|html)$/i.test(fileName)) return 1;
  if (/^(un)?licen[sc]e$/i.test(fileName)) return 1;
  if (/^(un)?licen[sc]e\.(md|markdown|txt|html)$/i.test(fileName)) return 0.95;
  if (/^copying$/i.test(fileName)) return 0.9;
  if (/^copying\.(md|markdown|txt|html)$/i.test(fileName)) return 0.85;
  if (/^(un)?licen[sc]e[-_][^.]+(\.[a-z0-9]+)?$/i.test(fileName)) return 0.7;
  if (/^copying[-_][^.]+(\.[a-z0-9]+)?$/i.test(fileName)) return 0.65;
  if (/^copyright(\.(md|markdown|txt|html))?$/i.test(fileName)) return 0.35;
  if (/^patents(\.[a-z0-9]+)?$/i.test(fileName)) return 0.15;
  if (lower === "unlicense") return 1;
  return 0;
}

function detectLicenseFromText(text: string, filePath: string): { spdxId: string | null; confidence: number; matcher: LicenseRightsReport["licenseFiles"][number]["matcher"]; evidence: string } {
  const spdxFromFilename = spdxFromLicenseFilename(filePath);
  const normalized = text.toLowerCase().replace(/\s+/g, " ");
  if (/^\s*copyright\s+\(?(c\))?\s+/i.test(text.trim()) && text.trim().split(/\r?\n/).length <= 3) {
    return { spdxId: null, confidence: 0.8, matcher: "copyright-only", evidence: "Only a short copyright notice was detected; treat as no explicit license until reviewed." };
  }
  const keyword = knownLicenseKeyword(normalized);
  if (keyword) {
    return { spdxId: keyword.spdxId, confidence: keyword.confidence, matcher: keyword.exact ? "exact-keyword" : "text-similarity-hint", evidence: keyword.evidence };
  }
  if (spdxFromFilename) {
    return { spdxId: spdxFromFilename, confidence: 0.75, matcher: "spdx-filename", evidence: `SPDX-style identifier inferred from filename ${path.basename(filePath)}.` };
  }
  return { spdxId: null, confidence: 0.2, matcher: "unknown", evidence: "Filename looked license-related, but no supported license keyword was detected." };
}

function knownLicenseKeyword(normalized: string): { spdxId: string; confidence: number; exact: boolean; evidence: string } | null {
  const candidates = [
    { spdxId: "MIT", exact: /mit license|permission is hereby granted, free of charge/.test(normalized) },
    { spdxId: "Apache-2.0", exact: /apache license, version 2\.0|www\.apache\.org\/licenses\/license-2\.0/.test(normalized) },
    { spdxId: "AGPL-3.0-or-later", exact: /gnu affero general public license|agpl/.test(normalized) },
    { spdxId: "LGPL-3.0-or-later", exact: /gnu lesser general public license|lgpl/.test(normalized) },
    { spdxId: "GPL-3.0-or-later", exact: /gnu general public license|\bgpl\b/.test(normalized) },
    { spdxId: "BSD-3-Clause", exact: /redistribution and use in source and binary forms|bsd 3-clause/.test(normalized) },
    { spdxId: "ISC", exact: /isc license|permission to use, copy, modify, and\/or distribute this software/.test(normalized) },
    { spdxId: "MPL-2.0", exact: /mozilla public license version 2\.0|mpl-2\.0/.test(normalized) },
    { spdxId: "Unlicense", exact: /this is free and unencumbered software released into the public domain|unlicense/.test(normalized) },
    { spdxId: "CC0-1.0", exact: /creative commons zero|cc0 1\.0 universal/.test(normalized) }
  ];
  const found = candidates.find((candidate) => candidate.exact);
  if (!found) return null;
  return { spdxId: found.spdxId, confidence: 0.92, exact: true, evidence: `Recognized ${found.spdxId} license keyword in license text.` };
}

function spdxFromLicenseFilename(filePath: string): string | null {
  const base = path.basename(filePath).replace(/\.(md|markdown|txt|html)$/i, "");
  if (filePath.startsWith("LICENSES/") && /^[A-Za-z0-9](?:[A-Za-z0-9.-]*[A-Za-z0-9])?$/.test(base)) return base;
  const match = base.match(/(?:license|copying)[-_]([A-Za-z0-9][A-Za-z0-9.-]*)$/i);
  return match?.[1] ?? null;
}

async function packageLicenseSignal(file: WalkResult["files"][number]): Promise<LicenseRightsReport["packageLicenseSignals"][number] | null> {
  const base = path.basename(file.relPath);
  if (!["package.json", "Cargo.toml", "pyproject.toml"].includes(base)) return null;
  const text = await readTextIfSafe(file.absPath, 120_000);
  if (text === null) return null;
  let packageName: string | null = null;
  let licenseText: string | null = null;
  if (base === "package.json") {
    try {
      const parsed = JSON.parse(text) as { name?: unknown; license?: unknown };
      packageName = typeof parsed.name === "string" ? parsed.name : null;
      licenseText = typeof parsed.license === "string" ? parsed.license : null;
    } catch {
      licenseText = null;
    }
  } else {
    packageName = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1] ?? null;
    licenseText = text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1] ?? null;
  }
  if (!licenseText) return null;
  return {
    filePath: file.relPath,
    packageName,
    licenseText,
    detectedSpdxId: normalizeSpdxExpression(licenseText),
    confidence: 0.65,
    sourceHref: `source/${encodedPath(file.relPath)}`
  };
}

function readmeLicenseSignals(filePath: string, text: string): LicenseRightsReport["readmeLicenseReferences"] {
  const signals: LicenseRightsReport["readmeLicenseReferences"] = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    if (!/licen[sc]e|copyright|apache|mit|gpl|agpl|bsd|unlicense/i.test(line)) continue;
    const detected = normalizeSpdxExpression(line) ?? knownLicenseKeyword(line.toLowerCase())?.spdxId ?? null;
    signals.push({
      filePath,
      detectedSpdxId: detected,
      snippet: line.trim().slice(0, 220),
      confidence: detected ? 0.45 : 0.25,
      sourceHref: `source/${encodedPath(filePath)}`
    });
    if (signals.length >= 6) break;
  }
  return signals;
}

function normalizeSpdxExpression(value: string): string | null {
  const clean = value.trim().replace(/^license\s*[:=]\s*/i, "").replace(/^["']|["']$/g, "");
  const simple = clean.match(/\b(MIT|Apache-2\.0|AGPL-3\.0(?:-or-later|-only)?|GPL-3\.0(?:-or-later|-only)?|LGPL-3\.0(?:-or-later|-only)?|BSD-3-Clause|BSD-2-Clause|ISC|MPL-2\.0|Unlicense|CC0-1\.0)\b/i)?.[1];
  if (!simple) return null;
  const canonical = simple.toUpperCase() === "UNLICENSE" ? "Unlicense" : simple.toUpperCase() === "MIT" ? "MIT" : simple;
  return canonical;
}

function selectProjectLicense(
  licenseFiles: LicenseRightsReport["licenseFiles"],
  packageSignals: LicenseRightsReport["packageLicenseSignals"],
  readmeSignals: LicenseRightsReport["readmeLicenseReferences"]
): LicenseRightsReport["detectedProjectLicense"] {
  const primaryFile = licenseFiles.find((file) => file.detectedSpdxId) ?? licenseFiles[0];
  if (primaryFile?.detectedSpdxId) {
    return {
      spdxId: primaryFile.detectedSpdxId,
      confidence: primaryFile.confidence,
      evidence: `${primaryFile.filePath} matched by ${primaryFile.matcher}: ${primaryFile.evidence}`,
      sourceHref: primaryFile.sourceHref
    };
  }
  const packageSignal = packageSignals[0];
  if (packageSignal?.detectedSpdxId) {
    return {
      spdxId: packageSignal.detectedSpdxId,
      confidence: packageSignal.confidence,
      evidence: `${packageSignal.filePath} declares license ${packageSignal.licenseText}; treat as package metadata review signal.`,
      sourceHref: packageSignal.sourceHref
    };
  }
  const readmeSignal = readmeSignals[0];
  if (readmeSignal?.detectedSpdxId) {
    return {
      spdxId: readmeSignal.detectedSpdxId,
      confidence: readmeSignal.confidence,
      evidence: `${readmeSignal.filePath} contains license reference: ${readmeSignal.snippet}`,
      sourceHref: readmeSignal.sourceHref
    };
  }
  return {
    spdxId: null,
    confidence: 0,
    evidence: "No project license could be detected from Licensee-style file, package, or README signals.",
    sourceHref: null
  };
}

export async function buildSbomReport(context: SbomContext, walk: WalkResult): Promise<SbomReport> {
  const packageManifests: SbomReport["packageManifests"] = [];
  const packageArtifacts: SbomReport["packageArtifacts"] = [];
  const fileArtifacts: SbomReport["fileArtifacts"] = [];
  const relationships: SbomReport["relationships"] = [];
  const sourceNode = "source:repository";

  for (const file of walk.files) {
    const artifactKind = sbomFileArtifactKind(file.relPath);
    if (artifactKind) {
      fileArtifacts.push({
        filePath: file.relPath,
        artifactKind,
        size: file.size,
        sourceHref: `source/${encodedPath(file.relPath)}`
      });
      relationships.push({
        from: sourceNode,
        to: file.relPath,
        relationshipType: "contains",
        evidenceHref: `source/${encodedPath(file.relPath)}`
      });
    }

    const manifest = await sbomManifestArtifacts(file);
    if (!manifest) continue;
    packageManifests.push(manifest.manifest);
    packageArtifacts.push(...manifest.packages);
    relationships.push(...manifest.relationships);
  }

  packageManifests.sort((a, b) => a.filePath.localeCompare(b.filePath));
  packageArtifacts.sort((a, b) => a.ecosystem.localeCompare(b.ecosystem) || a.name.localeCompare(b.name) || (a.version ?? "").localeCompare(b.version ?? ""));
  fileArtifacts.sort((a, b) => a.filePath.localeCompare(b.filePath));

  const reviewWarnings: SbomReport["reviewWarnings"] = [];
  if (packageManifests.length === 0) {
    reviewWarnings.push({
      severity: "error",
      message: "Syft-style SBOM inventory found no supported package manifests.",
      relatedHref: "html/sbom.html"
    });
  }
  if (packageArtifacts.length > 0 && !fileArtifacts.some((artifact) => artifact.artifactKind === "lockfile")) {
    reviewWarnings.push({
      severity: "warn",
      message: "Package manifests were found, but no lockfile artifact was detected; exact resolved package versions may need a package-manager lockfile.",
      relatedHref: "html/sbom.html"
    });
  }
  if (fileArtifacts.some((artifact) => artifact.artifactKind === "container")) {
    reviewWarnings.push({
      severity: "info",
      message: "Container build files were detected. This static report records them as evidence but does not inspect built images or OS packages.",
      relatedHref: "html/sbom.html"
    });
  }

  return {
    summary: `Syft식 SBOM report: package manifest ${packageManifests.length}개, package artifact ${packageArtifacts.length}개, file artifact ${fileArtifacts.length}개, relationship ${relationships.length}개를 정적 분석으로 기록했습니다.`,
    sourcePattern: "Syft SBOM source descriptor artifacts packages file metadata relationships CycloneDX SPDX output formats",
    sourceDescriptor: {
      sourceType: context.sourceType ?? null,
      sourceUrl: context.sourceUrl ?? null,
      localSourcePath: context.localSourcePath ?? null,
      branch: context.branch ?? null,
      commitHash: context.commitHash ?? null,
      descriptorName: "RepoTutor static SBOM",
      descriptorVersion: "1"
    },
    packageManifests,
    packageArtifacts,
    fileArtifacts,
    relationships,
    outputFormats: [
      {
        format: "syft-json",
        readiness: "partial",
        reason: "RepoTutor emits a static educational SBOM report, not Syft's full schema with resolver metadata."
      },
      {
        format: "cyclonedx-json",
        readiness: "partial",
        reason: "Package name/version/PURL fields are present where manifest data allows, but this report does not emit a full CycloneDX document."
      },
      {
        format: "spdx-json",
        readiness: "partial",
        reason: "Package and license hints are recorded, but SPDX document namespace, checksums, and full package verification are outside the static learner report."
      }
    ],
    reviewWarnings,
    learnerNextSteps: [
      "Lockfile가 missing이면 실제 배포 전 package manager lockfile로 resolved version을 확인하세요.",
      "container artifact가 있으면 Syft 같은 실제 SBOM 도구로 image/filesystem을 별도 스캔하세요.",
      "PURL이 없는 package artifact는 manifest가 이름/버전 정보를 충분히 제공하는지 확인하세요.",
      "이 report는 학습용 정적 inventory입니다. 보안 스캔이나 규제 제출용 SBOM을 대체하지 않습니다."
    ]
  };
}

async function sbomManifestArtifacts(file: WalkResult["files"][number]): Promise<{
  manifest: SbomReport["packageManifests"][number];
  packages: SbomReport["packageArtifacts"];
  relationships: SbomReport["relationships"];
} | null> {
  const base = path.basename(file.relPath);
  if (!["package.json", "Cargo.toml", "requirements.txt", "pyproject.toml", "go.mod"].includes(base)) return null;
  const text = await readTextIfSafe(file.absPath, 160_000);
  if (text === null) return null;
  const ecosystem = sbomEcosystemForManifest(file.relPath);
  const sourceHref = `source/${encodedPath(file.relPath)}`;
  const packages = parseSbomPackages(file.relPath, text, ecosystem);
  const directDependencies = packages.filter((pkg) => !/dev|test/i.test(pkg.foundBy)).length;
  const devDependencies = packages.length - directDependencies;
  return {
    manifest: {
      filePath: file.relPath,
      ecosystem,
      packageCount: packages.length,
      directDependencies,
      devDependencies,
      sourceHref
    },
    packages,
    relationships: [
      {
        from: file.relPath,
        to: ecosystem,
        relationshipType: "uses-ecosystem",
        evidenceHref: sourceHref
      },
      ...packages.map((pkg) => ({
        from: file.relPath,
        to: `${pkg.packageType}:${pkg.name}`,
        relationshipType: "declares" as const,
        evidenceHref: sourceHref
      })),
      ...packages.map((pkg) => ({
        from: `${pkg.packageType}:${pkg.name}`,
        to: file.relPath,
        relationshipType: "evidence-for" as const,
        evidenceHref: sourceHref
      }))
    ]
  };
}

function parseSbomPackages(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const base = path.basename(filePath);
  if (base === "package.json") return parsePackageJsonSbom(filePath, text, ecosystem);
  if (base === "Cargo.toml") return parseCargoSbom(filePath, text, ecosystem);
  if (base === "requirements.txt") return parseRequirementsSbom(filePath, text, ecosystem);
  if (base === "pyproject.toml") return parsePyprojectSbom(filePath, text, ecosystem);
  if (base === "go.mod") return parseGoModSbom(filePath, text, ecosystem);
  return [];
}

function parsePackageJsonSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  try {
    const json = JSON.parse(text) as {
      name?: unknown;
      version?: unknown;
      license?: unknown;
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const packages: SbomReport["packageArtifacts"] = [];
    if (typeof json.name === "string") {
      packages.push(sbomPackageArtifact({
        name: json.name,
        version: typeof json.version === "string" ? json.version : null,
        ecosystem,
        packageType: "npm",
        foundBy: "package-json-project",
        filePath,
        licenses: typeof json.license === "string" ? [json.license] : []
      }));
    }
    for (const [name, version] of Object.entries(json.dependencies ?? {})) {
      packages.push(sbomPackageArtifact({ name, version, ecosystem, packageType: "npm", foundBy: "package-json-dependencies", filePath, licenses: [] }));
    }
    for (const [name, version] of Object.entries(json.devDependencies ?? {})) {
      packages.push(sbomPackageArtifact({ name, version, ecosystem, packageType: "npm", foundBy: "package-json-devDependencies", filePath, licenses: [] }));
    }
    return packages;
  } catch {
    return [];
  }
}

function parseCargoSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const packages: SbomReport["packageArtifacts"] = [];
  const projectName = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1];
  if (projectName) {
    packages.push(sbomPackageArtifact({
      name: projectName,
      version: text.match(/^\s*version\s*=\s*["']([^"']+)["']/m)?.[1] ?? null,
      ecosystem,
      packageType: "cargo",
      foundBy: "cargo-project",
      filePath,
      licenses: text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1]?.split(/\s+OR\s+|\s+AND\s+/i) ?? []
    }));
  }
  for (const name of manifestSectionKeys(text, "dependencies")) {
    packages.push(sbomPackageArtifact({ name, version: null, ecosystem, packageType: "cargo", foundBy: "cargo-dependencies", filePath, licenses: [] }));
  }
  for (const name of manifestSectionKeys(text, "dev-dependencies")) {
    packages.push(sbomPackageArtifact({ name, version: null, ecosystem, packageType: "cargo", foundBy: "cargo-dev-dependencies", filePath, licenses: [] }));
  }
  return packages;
}

function parseRequirementsSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("-"))
    .slice(0, 80)
    .map((line) => {
      const [name, version] = line.split(/[=<>~!]=?/);
      return sbomPackageArtifact({ name: name.trim(), version: version?.trim() ?? null, ecosystem, packageType: "pypi", foundBy: "requirements.txt", filePath, licenses: [] });
    });
}

function parsePyprojectSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const packages: SbomReport["packageArtifacts"] = [];
  const projectName = text.match(/^\s*name\s*=\s*["']([^"']+)["']/m)?.[1];
  if (projectName) {
    packages.push(sbomPackageArtifact({
      name: projectName,
      version: text.match(/^\s*version\s*=\s*["']([^"']+)["']/m)?.[1] ?? null,
      ecosystem,
      packageType: "pypi",
      foundBy: "pyproject-project",
      filePath,
      licenses: text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1] ? [text.match(/^\s*license\s*=\s*["']([^"']+)["']/m)?.[1] as string] : []
    }));
  }
  const dependencyBlock = text.match(/dependencies\s*=\s*\[([\s\S]*?)\]/m)?.[1] ?? "";
  for (const match of dependencyBlock.matchAll(/["']([^"']+)["']/g)) {
    const [name, version] = match[1].split(/[=<>~!]=?/);
    packages.push(sbomPackageArtifact({ name: name.trim(), version: version?.trim() ?? null, ecosystem, packageType: "pypi", foundBy: "pyproject-dependencies", filePath, licenses: [] }));
  }
  return packages;
}

function parseGoModSbom(filePath: string, text: string, ecosystem: string): SbomReport["packageArtifacts"] {
  const packages: SbomReport["packageArtifacts"] = [];
  const moduleName = text.match(/^module\s+(.+)$/m)?.[1]?.trim();
  if (moduleName) {
    packages.push(sbomPackageArtifact({ name: moduleName, version: null, ecosystem, packageType: "go", foundBy: "go-module", filePath, licenses: [] }));
  }
  const requireLines = [...text.matchAll(/^\s*require\s+([^\s]+)\s+([^\s]+)/gm)].map((match) => [match[1], match[2]] as const);
  const blockLines = [...text.matchAll(/^\s*([^\s()]+)\s+(v[^\s]+)(?:\s+\/\/.*)?$/gm)].map((match) => [match[1], match[2]] as const);
  for (const [name, version] of [...requireLines, ...blockLines].slice(0, 80)) {
    if (name === moduleName || name === "module" || name === "go") continue;
    packages.push(sbomPackageArtifact({ name, version, ecosystem, packageType: "go", foundBy: "go-mod-require", filePath, licenses: [] }));
  }
  return packages;
}

function sbomPackageArtifact(input: {
  name: string;
  version: string | null;
  ecosystem: string;
  packageType: string;
  foundBy: string;
  filePath: string;
  licenses: string[];
}): SbomReport["packageArtifacts"][number] {
  const version = normalizeManifestVersion(input.version);
  return {
    name: input.name,
    version,
    ecosystem: input.ecosystem,
    packageType: input.packageType,
    purl: packageUrl(input.packageType, input.name, version),
    licenses: input.licenses.filter(Boolean),
    foundBy: input.foundBy,
    locations: [input.filePath],
    evidenceHref: `source/${encodedPath(input.filePath)}`
  };
}

function sbomFileArtifactKind(filePath: string): SbomReport["fileArtifacts"][number]["artifactKind"] | null {
  const base = path.basename(filePath);
  if (["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "Cargo.lock", "poetry.lock", "Pipfile.lock", "go.sum"].includes(base)) return "lockfile";
  if (["package.json", "Cargo.toml", "requirements.txt", "pyproject.toml", "go.mod"].includes(base)) return "manifest";
  if (/^Dockerfile/i.test(base) || /docker-compose\.ya?ml$/i.test(base)) return "container";
  if (/\.ya?ml$/i.test(base) || /\.toml$/i.test(base)) return "config";
  return null;
}

function sbomEcosystemForManifest(filePath: string): string {
  const base = path.basename(filePath);
  if (base === "package.json") return "JavaScript/Node";
  if (base === "Cargo.toml") return "Rust/Cargo";
  if (base === "requirements.txt" || base === "pyproject.toml") return "Python";
  if (base === "go.mod") return "Go";
  return inferEcosystem(filePath);
}

function manifestSectionKeys(text: string, section: string): string[] {
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const block = text.match(new RegExp(`^\\s*\\[${escaped}\\]\\s*$([\\s\\S]*?)(?=^\\s*\\[|$)`, "m"))?.[1] ?? "";
  return [...block.matchAll(/^\s*([A-Za-z0-9_-]+)\s*=/gm)].map((match) => match[1]).filter(Boolean);
}

function normalizeManifestVersion(value: string | null): string | null {
  if (!value) return null;
  const cleaned = value.trim().replace(/^[\^~<>=!* ]+/, "");
  return cleaned || value.trim();
}

function packageUrl(packageType: string, name: string, version: string | null): string | null {
  const normalizedName = name.trim();
  if (!normalizedName) return null;
  const encodedName = normalizedName.split("/").map(encodeURIComponent).join("/");
  return `pkg:${packageType}/${encodedName}${version ? `@${encodeURIComponent(version)}` : ""}`;
}
