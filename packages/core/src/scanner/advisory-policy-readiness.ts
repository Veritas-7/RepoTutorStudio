import path from "node:path";
import type { AdvisoryReport, LicenseRightsReport, PolicyGateReport, ProvenanceReport, SbomReport, SecurityReadinessReport, SourceSnapshotReport, VexReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function isIacConfigFile(filePath: string): boolean {
  return /(Dockerfile|docker-compose\.ya?ml|compose\.ya?ml|\.tf|\.tfvars|k8s|kubernetes|helm|chart\.ya?ml|values\.ya?ml|deployment\.ya?ml|service\.ya?ml|ingress\.ya?ml|skaffold\.ya?ml|tiltfile|serverless\.ya?ml|cloudformation|template\.ya?ml|bicep|pulumi|ansible|playbook|\.rego)$/i.test(filePath);
}

function advisoryEcosystemForPackage(packageType: string, fallback: string): string {
  const normalized = packageType.toLowerCase();
  if (normalized === "npm") return "npm";
  if (normalized === "pypi") return "PyPI";
  if (normalized === "cargo") return "crates.io";
  if (normalized === "go") return "Go";
  if (normalized === "maven") return "Maven";
  if (normalized === "composer") return "Packagist";
  if (normalized === "nuget") return "NuGet";
  if (normalized === "gem") return "RubyGems";
  return fallback;
}

function advisoryEcosystemForLockfile(filePath: string): string {
  const base = path.basename(filePath);
  if (["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock"].includes(base)) return "npm";
  if (base === "Cargo.lock") return "crates.io";
  if (["poetry.lock", "Pipfile.lock", "pdm.lock", "uv.lock", "pylock.toml"].includes(base)) return "PyPI";
  if (base === "go.sum" || base === "go.mod") return "Go";
  if (base === "composer.lock") return "Packagist";
  if (base === "Gemfile.lock" || base === "gems.locked") return "RubyGems";
  if (base === "packages.lock.json" || base === "packages.config") return "NuGet";
  if (base === "pom.xml" || base === "gradle.lockfile") return "Maven";
  return "unknown";
}

function advisoryPackageCountForLockfile(filePath: string, sbomReport: SbomReport): number {
  const directory = path.posix.dirname(filePath);
  const ecosystem = advisoryEcosystemForLockfile(filePath);
  return sbomReport.packageArtifacts.filter((pkg) => {
    const sameDirectory = pkg.locations.some((location) => path.posix.dirname(location) === directory);
    const sameEcosystem = advisoryEcosystemForPackage(pkg.packageType, pkg.ecosystem) === ecosystem;
    return sameDirectory || sameEcosystem;
  }).length;
}

function isOsvScannerConfigFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "osv-scanner.toml" || base === ".osv-scanner.toml";
}

export async function buildAdvisoryReport(
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  licenseRightsReport: LicenseRightsReport
): Promise<AdvisoryReport> {
  const packageQueryTargets = sbomReport.packageArtifacts.slice(0, 80).map((pkg): AdvisoryReport["packageQueryTargets"][number] => ({
    name: pkg.name,
    ecosystem: advisoryEcosystemForPackage(pkg.packageType, pkg.ecosystem),
    version: pkg.version,
    purl: pkg.purl,
    sourceType: "manifest",
    readiness: pkg.version ? "queryable" : "partial",
    evidence: pkg.version
      ? `${pkg.foundBy} declares ${pkg.name}@${pkg.version}; OSV-style matching can query by ecosystem, name, and version.`
      : `${pkg.foundBy} declares ${pkg.name}, but no resolved version was available for exact vulnerability matching.`,
    relatedHref: pkg.evidenceHref
  }));
  const lockfileArtifacts = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile");
  const lockfileSignals: AdvisoryReport["lockfileSignals"] = lockfileArtifacts.map((artifact) => {
    const packageCount = advisoryPackageCountForLockfile(artifact.filePath, sbomReport);
    return {
      filePath: artifact.filePath,
      ecosystem: advisoryEcosystemForLockfile(artifact.filePath),
      packageCount,
      readiness: packageCount > 0 ? "ready" : "partial",
      sourceHref: artifact.sourceHref
    };
  });
  const configFiles = walk.files.filter((file) => isOsvScannerConfigFile(file.relPath));
  const configTexts = await Promise.all(configFiles.map(async (file) => ({
    filePath: file.relPath,
    text: await readTextIfSafe(file.absPath, 120_000)
  })));
  const configText = configTexts.map((item) => item.text ?? "").join("\n");
  const hasIgnoredVulns = /\[\[IgnoredVulns\]\]|IgnoredVulns/i.test(configText);
  const hasPackageOverrides = /\[\[PackageOverrides\]\]|PackageOverrides/i.test(configText);
  const hasLicenseEvidence = licenseRightsReport.licenseFiles.length > 0 || licenseRightsReport.packageLicenseSignals.length > 0;
  const localDbFiles = walk.files.filter((file) => /(^|\/)(osv-scanner|osv-vulnerabilities|vulnerability-db)\/.+all\.zip$/i.test(file.relPath) || /(^|\/)all\.zip$/i.test(file.relPath) && /osv|vulnerab/i.test(file.relPath));
  const containerArtifacts = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const versionedTargets = packageQueryTargets.filter((target) => target.readiness === "queryable");
  const partialTargets = packageQueryTargets.filter((target) => target.readiness === "partial");
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");
  const npmManifest = sbomReport.packageManifests.find((manifest) => advisoryEcosystemForLockfile(manifest.filePath) === "npm" || /javascript|node/i.test(manifest.ecosystem));
  const npmLockfile = lockfileSignals.find((signal) => signal.ecosystem === "npm");

  const advisorySources: AdvisoryReport["advisorySources"] = [
    {
      source: "OSV.dev",
      readiness: packageQueryTargets.length > 0 ? "external" : "missing",
      evidence: packageQueryTargets.length > 0 ? `${packageQueryTargets.length} package target(s) can be sent to OSV.dev; RepoTutor does not send package data.` : "No package targets were available for OSV.dev matching.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "deps.dev",
      readiness: packageQueryTargets.length > 0 ? "external" : "missing",
      evidence: packageQueryTargets.length > 0 ? "Dependency resolution and transitive graph enrichment require external deps.dev/OSV-Scanner execution." : "No package manifest was found for dependency graph enrichment.",
      relatedHref: "html/sbom.html"
    },
    {
      source: "GitHub-Advisory-Database",
      readiness: packageQueryTargets.some((target) => ["npm", "pypi", "Go", "Maven", "Packagist", "NuGet", "RubyGems"].includes(target.ecosystem)) ? "external" : "missing",
      evidence: "GitHub advisory data can corroborate ecosystem package results, but this static report does not call the GitHub API.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "RustSec",
      readiness: packageQueryTargets.some((target) => target.ecosystem === "crates.io") ? "external" : "missing",
      evidence: packageQueryTargets.some((target) => target.ecosystem === "crates.io") ? "Rust/Cargo package target(s) were found for RustSec-backed advisory matching." : "No Rust/Cargo package target was detected.",
      relatedHref: "html/sbom.html"
    },
    {
      source: "NVD",
      readiness: packageQueryTargets.length > 0 || containerArtifacts.length > 0 ? "external" : "missing",
      evidence: packageQueryTargets.length > 0 || containerArtifacts.length > 0 ? "NVD/CVE enrichment is an external scanner concern after package or OS evidence is available." : "No package or container artifact was found for CVE enrichment.",
      relatedHref: containerArtifacts[0]?.sourceHref ?? "html/advisories.html"
    },
    {
      source: "local-offline-db",
      readiness: localDbFiles.length > 0 ? "ready" : "missing",
      evidence: localDbFiles.length > 0 ? `Offline OSV database candidate(s): ${localDbFiles.map((file) => file.relPath).join(", ")}.` : "No local OSV offline database all.zip files were detected.",
      relatedHref: localDbFiles[0] ? `source/${encodedPath(localDbFiles[0].relPath)}` : "html/advisories.html"
    }
  ];

  const policyControls: AdvisoryReport["policyControls"] = [
    {
      control: "ignored-vulns",
      status: hasIgnoredVulns ? "ready" : configFiles.length > 0 ? "partial" : "missing",
      evidence: hasIgnoredVulns ? `IgnoredVulns policy found in ${configFiles.map((file) => file.relPath).join(", ")}.` : configFiles.length > 0 ? "OSV config exists, but no IgnoredVulns section was detected." : "No osv-scanner.toml policy file with IgnoredVulns was detected.",
      relatedHref: configFiles[0] ? `source/${encodedPath(configFiles[0].relPath)}` : "html/advisories.html"
    },
    {
      control: "package-overrides",
      status: hasPackageOverrides ? "ready" : configFiles.length > 0 ? "partial" : "missing",
      evidence: hasPackageOverrides ? `PackageOverrides policy found in ${configFiles.map((file) => file.relPath).join(", ")}.` : configFiles.length > 0 ? "OSV config exists, but no PackageOverrides section was detected." : "No PackageOverrides policy was detected.",
      relatedHref: configFiles[0] ? `source/${encodedPath(configFiles[0].relPath)}` : "html/advisories.html"
    },
    {
      control: "license-allowlist",
      status: hasLicenseEvidence ? "partial" : "missing",
      evidence: hasLicenseEvidence ? `${licenseRightsReport.licenseFiles.length} license file(s) and ${licenseRightsReport.packageLicenseSignals.length} package license signal(s) can seed an allowlist, but OSV-Scanner allowlist execution is external.` : "No license evidence was available for license allowlist planning.",
      relatedHref: "html/license-rights.html"
    },
    {
      control: "offline-db",
      status: localDbFiles.length > 0 ? "ready" : "missing",
      evidence: localDbFiles.length > 0 ? "A local OSV database artifact was detected for offline vulnerability matching." : "Offline mode needs a downloaded OSV database; none was found in the generated session `source/` snapshot.",
      relatedHref: localDbFiles[0] ? `source/${encodedPath(localDbFiles[0].relPath)}` : "html/advisories.html"
    },
    {
      control: "call-analysis",
      status: versionedTargets.length > 0 ? "external" : "missing",
      evidence: versionedTargets.length > 0 ? "OSV-Scanner may enrich some results with reachability/call analysis, but RepoTutor does not execute source analysis." : "No versioned package targets were available for call-analysis planning.",
      relatedHref: "html/security-readiness.html"
    },
    {
      control: "guided-remediation",
      status: npmManifest && npmLockfile ? "partial" : npmManifest ? "missing" : "external",
      evidence: npmManifest && npmLockfile ? `npm manifest ${npmManifest.filePath} and lockfile ${npmLockfile.filePath} are present; use OSV fix only in a trusted workspace.` : npmManifest ? "npm manifest exists, but guided remediation usually needs a matching lockfile." : "Guided remediation is ecosystem-specific and must be run outside RepoTutor.",
      relatedHref: npmLockfile?.sourceHref ?? npmManifest?.sourceHref ?? "html/advisories.html"
    }
  ];

  const resultModel: AdvisoryReport["resultModel"] = [
    {
      field: "results[].source.path/type",
      purpose: "각 취약점 결과가 어떤 lockfile, SBOM, git, artifact, OS image source에서 왔는지 추적합니다.",
      readiness: sbomReport.fileArtifacts.length > 0 ? "ready" : "partial",
      evidence: `${sbomReport.fileArtifacts.length} SBOM file artifact(s) can become OSV result source rows.`,
      relatedHref: "html/sbom.html"
    },
    {
      field: "packages[].package",
      purpose: "ecosystem, name, version, PURL을 advisory query key로 사용합니다.",
      readiness: packageQueryTargets.length > 0 ? "ready" : "partial",
      evidence: `${packageQueryTargets.length} package query target(s), ${versionedTargets.length} with exact version(s).`,
      relatedHref: "html/advisories.html"
    },
    {
      field: "packages[].vulnerabilities",
      purpose: "OSV IDs, aliases, severity, fixed versions를 scanner 결과로 채웁니다.",
      readiness: packageQueryTargets.length > 0 ? "external" : "partial",
      evidence: vulnerabilityScanner?.evidence ?? "Vulnerability matching requires an external advisory database query.",
      relatedHref: "html/security-readiness.html"
    },
    {
      field: "packages[].licenseViolations",
      purpose: "license allowlist 정책과 package license evidence를 대조합니다.",
      readiness: hasLicenseEvidence ? "partial" : "external",
      evidence: hasLicenseEvidence ? "License evidence exists, but allowlist policy execution is outside the static report." : "License violation fields require scanner policy execution.",
      relatedHref: "html/license-rights.html"
    },
    {
      field: "imageMetadata",
      purpose: "container layer, base image, distro/OS package advisory context를 담습니다.",
      readiness: containerArtifacts.length > 0 ? "partial" : "external",
      evidence: containerArtifacts.length > 0 ? `${containerArtifacts.length} container config artifact(s) were detected; built image metadata still requires scanner execution.` : "No container image metadata exists in this source-only snapshot.",
      relatedHref: containerArtifacts[0]?.sourceHref ?? "html/runtime-environment.html"
    }
  ];

  const remediationQueue: AdvisoryReport["remediationQueue"] = [];
  if (packageQueryTargets.length === 0) {
    remediationQueue.push({
      priority: "high",
      action: "Add or expose supported package manifests before advisory scanning.",
      why: "OSV-style matching needs ecosystem package coordinates.",
      relatedHref: "html/sbom.html"
    });
  }
  if (packageQueryTargets.length > 0 && lockfileSignals.length === 0) {
    remediationQueue.push({
      priority: "high",
      action: "Commit package lockfiles for deployable package ecosystems.",
      why: "Lockfiles improve exact version matching and reduce advisory ambiguity.",
      relatedHref: "html/sbom.html"
    });
  }
  if (partialTargets.length > 0) {
    remediationQueue.push({
      priority: "medium",
      action: "Resolve package targets that lack versions before relying on advisory results.",
      why: `${partialTargets.length} package target(s) only have name/ecosystem evidence.`,
      relatedHref: "html/advisories.html"
    });
  }
  if (!hasIgnoredVulns) {
    remediationQueue.push({
      priority: "medium",
      action: "Create an osv-scanner.toml policy for ignored vulnerabilities with reason and expiry.",
      why: "Accepted vulnerability risk should be explicit, time-bounded, and reviewable.",
      relatedHref: "html/advisories.html"
    });
  }
  if (localDbFiles.length === 0) {
    remediationQueue.push({
      priority: "low",
      action: "Download an OSV offline database when scans must run without sending package metadata.",
      why: "Offline mode avoids network disclosure but needs a fresh local database.",
      relatedHref: "html/advisories.html"
    });
  }
  remediationQueue.push({
    priority: "low",
    action: "Run real OSV-Scanner outside RepoTutor before making security release decisions.",
    why: "This report is query readiness metadata only and does not claim actual vulnerability presence or absence.",
    relatedHref: "html/advisories.html"
  });

  return {
    summary: `OSV-Scanner식 advisory query readiness report: package target ${packageQueryTargets.length}개, lockfile signal ${lockfileSignals.length}개, advisory source ${advisorySources.length}개, policy control ${policyControls.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OSV-Scanner package extraction vulnerability matching OSV.dev lockfile SBOM offline remediation ignore policy",
    packageQueryTargets,
    lockfileSignals,
    advisorySources,
    policyControls,
    resultModel,
    remediationQueue: remediationQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: "osv-scanner scan source -r <project> --format json",
        purpose: "source directory에서 package extraction과 advisory matching을 실행합니다."
      },
      {
        command: "osv-scanner scan -L <lockfile> --format json",
        purpose: "특정 lockfile을 기준으로 정확한 package version advisory 결과를 확인합니다."
      },
      {
        command: "osv-scanner --offline-vulnerabilities --download-offline-databases <project>",
        purpose: "offline DB를 미리 내려받아 이후 offline scan 준비를 합니다."
      },
      {
        command: "osv-scanner scan image <image>:<tag> --format html",
        purpose: "container image layer와 OS package advisory context를 HTML로 확인합니다."
      },
      {
        command: "osv-scanner fix -M package.json -L package-lock.json",
        purpose: "trusted workspace에서만 guided remediation을 검토합니다. package manager scripts가 실행될 수 있습니다."
      }
    ],
    learnerNextSteps: [
      "package query target 중 version이 없는 항목부터 lockfile 또는 resolved metadata로 보강하세요.",
      "IgnoredVulns와 PackageOverrides 정책은 reason과 expiry를 포함해 리뷰 가능하게 유지하세요.",
      "privacy가 중요한 프로젝트는 online scan 대신 offline database 준비 상태를 먼저 확인하세요.",
      "이 리포트는 OSV-Scanner 실행 결과가 아니라 정적 질의 준비도입니다. 실제 취약점 판단에는 OSV-Scanner를 별도 실행하세요."
    ]
  };
}

export function buildVexReport(
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  advisoryReport: AdvisoryReport,
  provenanceReport: ProvenanceReport,
  sourceSnapshotReport: SourceSnapshotReport
): VexReport {
  const productTargets = vexProductTargets(sbomReport, sourceSnapshotReport);
  const sarifFiles = walk.files.filter((file) => /\.sarif(?:\.json)?$/i.test(file.relPath) || /(^|\/)sarif-results\.json$/i.test(file.relPath));
  const vexTemplateFiles = walk.files.filter((file) => /(^|\/)\.openvex\/templates\//.test(file.relPath) || /(^|\/)openvex\.(json|ya?ml)$/i.test(file.relPath));
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");
  const vulnAttestation = provenanceReport.attestationSignals.find((signal) => signal.predicateType === "vuln");
  const signatureSignal = provenanceReport.signatureSignals.find((signal) => signal.material === "signature");
  const dsseSignal = provenanceReport.signatureSignals.find((signal) => signal.material === "bundle");
  const transparencySignal = provenanceReport.signatureSignals.find((signal) => signal.material === "transparency-log");
  const firstProduct = productTargets[0]?.productId ?? "<product-purl-or-uri>";
  const statementDrafts: VexReport["statementDrafts"] = productTargets.slice(0, 5).map((product) => ({
    vulnerabilityId: "pending-advisory-id",
    productIds: [product.productId],
    status: "under_investigation",
    justification: null,
    needsHumanReview: true,
    evidence: `${product.productId} has product identity evidence, but RepoTutor has not confirmed any specific vulnerability impact.`,
    relatedHref: product.relatedHref
  }));

  const vulnerabilityInputs: VexReport["vulnerabilityInputs"] = [
    {
      source: "advisory-query",
      readiness: advisoryReport.packageQueryTargets.length > 0 ? "ready" : "missing",
      evidence: advisoryReport.packageQueryTargets.length > 0 ? `${advisoryReport.packageQueryTargets.length} advisory query target(s) are available for later VEX statement matching.` : "No advisory query targets were available.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "security-readiness",
      readiness: vulnerabilityScanner?.readiness ?? "missing",
      evidence: vulnerabilityScanner?.evidence ?? "No vulnerability scanner readiness row was available.",
      relatedHref: vulnerabilityScanner?.relatedHref ?? "html/security-readiness.html"
    },
    {
      source: "scanner-sarif",
      readiness: sarifFiles.length > 0 ? "ready" : "missing",
      evidence: sarifFiles.length > 0 ? `SARIF result candidate(s): ${sarifFiles.map((file) => file.relPath).join(", ")}.` : "No SARIF scanner result file was detected; vexctl filter needs scanner results as input.",
      relatedHref: sarifFiles[0] ? `source/${encodedPath(sarifFiles[0].relPath)}` : "html/security-readiness.html"
    },
    {
      source: "manual-cve",
      readiness: "external",
      evidence: "Manual CVE/GHSA/RUSTSEC review must be supplied by a human or an external advisory source before producing final VEX statements.",
      relatedHref: "html/advisories.html"
    },
    {
      source: "attestation",
      readiness: vulnAttestation?.readiness === "available" ? "ready" : vulnAttestation?.readiness === "partial" ? "partial" : "external",
      evidence: vulnAttestation?.evidence ?? "No vulnerability predicate attestation was detected; VEX can still be created as a new document and attested later.",
      relatedHref: vulnAttestation?.relatedHref ?? "html/provenance.html"
    }
  ];

  const statusMatrix: VexReport["statusMatrix"] = [
    {
      status: "affected",
      requiredEvidence: "Confirmed vulnerable code path plus an action statement, mitigation plan, or fixed-version target.",
      allowedFields: ["action_statement", "status_notes", "aliases", "subcomponents"],
      filtersScannerResult: false,
      readiness: productTargets.length > 0 ? "partial" : "external"
    },
    {
      status: "not_affected",
      requiredEvidence: "A specific OpenVEX justification and, when useful, an impact statement that explains why the product is not affected.",
      allowedFields: ["justification", "impact_statement", "status_notes", "aliases", "subcomponents"],
      filtersScannerResult: true,
      readiness: advisoryReport.packageQueryTargets.length > 0 ? "partial" : "external"
    },
    {
      status: "fixed",
      requiredEvidence: "Release, commit, package, or image digest evidence proving the vulnerability is fixed for the product.",
      allowedFields: ["status_notes", "aliases", "subcomponents"],
      filtersScannerResult: true,
      readiness: provenanceReport.artifactSignals.some((signal) => signal.readiness === "ready") ? "partial" : "external"
    },
    {
      status: "under_investigation",
      requiredEvidence: "An owner, timebox, product identity, and pending advisory identifier for triage.",
      allowedFields: ["status_notes", "aliases", "subcomponents"],
      filtersScannerResult: false,
      readiness: productTargets.length > 0 ? "ready" : "partial"
    }
  ];

  const justificationCatalog: VexReport["justificationCatalog"] = [
    {
      justification: "component_not_present",
      useWhen: "Scanner result names a dependency or component that is absent from the shipped product.",
      requiresImpactStatement: true,
      readiness: productTargets.length > 0 ? "partial" : "external"
    },
    {
      justification: "vulnerable_code_not_present",
      useWhen: "The package exists, but the vulnerable function, file, feature, or build option is not present.",
      requiresImpactStatement: true,
      readiness: "external"
    },
    {
      justification: "vulnerable_code_not_in_execute_path",
      useWhen: "The vulnerable code is present but cannot be reached by product execution paths.",
      requiresImpactStatement: true,
      readiness: "external"
    },
    {
      justification: "inline_mitigations_already_exist",
      useWhen: "The product includes controls that neutralize the vulnerable behavior.",
      requiresImpactStatement: true,
      readiness: "external"
    },
    {
      justification: "protected_by_compiler",
      useWhen: "Compiler or build hardening prevents exploitation for the shipped artifact.",
      requiresImpactStatement: true,
      readiness: "external"
    }
  ];

  const documentWorkflow: VexReport["documentWorkflow"] = [
    {
      step: "create",
      command: `vexctl create --product ${firstProduct} --vuln pending-advisory-id --status under_investigation`,
      purpose: "Start a new OpenVEX document with product identity and a pending vulnerability record.",
      readiness: productTargets.length > 0 ? "ready" : "partial"
    },
    {
      step: "add",
      command: `vexctl add --in-place main.openvex.json --product ${firstProduct} --vuln pending-advisory-id --status not_affected --justification vulnerable_code_not_in_execute_path`,
      purpose: "Add a reviewed not_affected statement only after evidence and justification are available.",
      readiness: "external"
    },
    {
      step: "merge",
      command: "vexctl merge investigation.openvex.json resolution.openvex.json",
      purpose: "Merge chronological VEX documents so investigation and resolution history stay reviewable.",
      readiness: statementDrafts.length > 0 ? "partial" : "external"
    },
    {
      step: "attest",
      command: "vexctl attest --attach --sign main.openvex.json <image>@sha256:<digest>",
      purpose: "Wrap VEX metadata in a signed in-toto/Sigstore attestation for a concrete subject digest.",
      readiness: provenanceReport.signatureSignals.some((signal) => signal.readiness === "present") ? "partial" : "external"
    },
    {
      step: "filter",
      command: "vexctl filter scan_results.sarif.json main.openvex.json",
      purpose: "Apply fixed or not_affected VEX statements to SARIF scanner output after human review.",
      readiness: sarifFiles.length > 0 && statementDrafts.length > 0 ? "partial" : "external"
    },
    {
      step: "generate",
      command: "vexctl generate --templates=\".openvex/templates/\" --product <product>",
      purpose: "Generate VEX from local golden templates when a repository has .openvex/templates.",
      readiness: vexTemplateFiles.length > 0 ? "ready" : "external"
    }
  ];

  const attestationReadiness: VexReport["attestationReadiness"] = [
    {
      requirement: "subject-digest",
      status: sourceSnapshotReport.totalFiles > 0 ? "ready" : "missing",
      evidence: sourceSnapshotReport.totalFiles > 0 ? `${sourceSnapshotReport.totalFiles} source file digest(s) are available; release/image subject digests still need external artifact evidence.` : "No source digest evidence is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      requirement: "dsse-envelope",
      status: dsseSignal?.readiness === "present" ? "ready" : "external",
      evidence: dsseSignal?.evidence ?? "No DSSE/Sigstore bundle was detected; vexctl attest can produce one in a signing environment.",
      relatedHref: dsseSignal?.relatedHref ?? "html/provenance.html"
    },
    {
      requirement: "signature",
      status: signatureSignal?.readiness === "present" ? "ready" : "external",
      evidence: signatureSignal?.evidence ?? "No detached signature was detected; signing is an external release step.",
      relatedHref: signatureSignal?.relatedHref ?? "html/provenance.html"
    },
    {
      requirement: "transparency-log",
      status: transparencySignal?.readiness === "present" ? "ready" : "external",
      evidence: transparencySignal?.evidence ?? "Transparency log proof usually comes from Sigstore/Rekor or a downloaded bundle.",
      relatedHref: transparencySignal?.relatedHref ?? "html/provenance.html"
    },
    {
      requirement: "product-match",
      status: productTargets.length > 0 ? "ready" : "missing",
      evidence: productTargets.length > 0 ? `${productTargets.length} product target(s) can be matched to VEX statements.` : "No product identity evidence is available for VEX statements.",
      relatedHref: productTargets[0]?.relatedHref ?? "html/sbom.html"
    }
  ];

  const riskQueue: VexReport["riskQueue"] = [];
  if (productTargets.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Add package, SBOM, source, or container product identity before producing VEX.",
      why: "OpenVEX statements must name affected products.",
      relatedHref: "html/sbom.html"
    });
  }
  if (advisoryReport.packageQueryTargets.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Run or prepare advisory matching before writing final VEX statuses.",
      why: "VEX statements need a concrete vulnerability identifier and impact analysis.",
      relatedHref: "html/advisories.html"
    });
  }
  if (sarifFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Export scanner results as SARIF before relying on vexctl filter workflows.",
      why: "vexctl filter applies reviewed VEX statements to SARIF results.",
      relatedHref: "html/security-readiness.html"
    });
  }
  if (vexTemplateFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Create .openvex/templates when VEX statements should be generated repeatedly.",
      why: "Template-backed generation keeps author, role, and document defaults consistent.",
      relatedHref: "html/vex.html"
    });
  }
  riskQueue.push({
    priority: "medium",
    action: "Require human evidence review before using not_affected or fixed statuses.",
    why: "VEX can suppress scanner findings; every suppressing status needs traceable impact evidence.",
    relatedHref: "html/vex.html"
  });
  riskQueue.push({
    priority: "low",
    action: "Run real vexctl in a trusted release workspace before attaching or signing VEX metadata.",
    why: "RepoTutor records readiness metadata only and does not create signed attestations.",
    relatedHref: "html/provenance.html"
  });

  return {
    summary: `OpenVEX impact readiness report: product target ${productTargets.length}개, vulnerability input ${vulnerabilityInputs.length}개, status rule ${statusMatrix.length}개, workflow ${documentWorkflow.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OpenVEX affected not_affected fixed under_investigation justification product subcomponent vulnerability statement attestation SARIF filter",
    productTargets,
    vulnerabilityInputs,
    statusMatrix,
    justificationCatalog,
    statementDrafts,
    documentWorkflow,
    attestationReadiness,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    learnerNextSteps: [
      "statementDrafts는 실제 취약점 확인 결과가 아니라 pending triage 템플릿입니다.",
      "not_affected 또는 fixed 상태는 scanner 결과를 숨길 수 있으므로 impact evidence와 reviewer를 먼저 기록하세요.",
      "제품 식별자는 package PURL, container digest, source digest처럼 재현 가능한 값으로 고정하세요.",
      "SARIF 필터링과 attestation signing은 RepoTutor 밖의 신뢰된 release workspace에서 실행하세요."
    ]
  };
}

function vexProductTargets(sbomReport: SbomReport, sourceSnapshotReport: SourceSnapshotReport): VexReport["productTargets"] {
  const seen = new Set<string>();
  const targets: VexReport["productTargets"] = [];
  for (const pkg of sbomReport.packageArtifacts.slice(0, 80)) {
    const productId = pkg.purl ?? `pkg:${pkg.packageType}/${pkg.name}${pkg.version ? `@${pkg.version}` : ""}`;
    if (seen.has(productId)) continue;
    seen.add(productId);
    targets.push({
      productId,
      productType: "package",
      version: pkg.version,
      evidence: `${pkg.foundBy} records ${pkg.name}${pkg.version ? `@${pkg.version}` : ""} as a VEX product candidate.`,
      relatedHref: pkg.evidenceHref
    });
  }
  for (const artifact of sbomReport.fileArtifacts.filter((item) => item.artifactKind === "container").slice(0, 10)) {
    const productId = `container-config:${artifact.filePath}`;
    if (seen.has(productId)) continue;
    seen.add(productId);
    targets.push({
      productId,
      productType: "container",
      version: null,
      evidence: `${artifact.filePath} is a container configuration candidate; a real image digest is needed for release VEX.`,
      relatedHref: artifact.sourceHref
    });
  }
  if (sbomReport.packageArtifacts.length > 0 && !seen.has("analysis/sbom-report.json")) {
    seen.add("analysis/sbom-report.json");
    targets.push({
      productId: "analysis/sbom-report.json",
      productType: "sbom",
      version: sbomReport.sourceDescriptor.descriptorVersion,
      evidence: "RepoTutor static SBOM can be signed or referenced as product inventory evidence.",
      relatedHref: "html/sbom.html"
    });
  }
  const firstDigest = sourceSnapshotReport.files[0]?.sha256;
  if (firstDigest && !seen.has(`pkg:generic/source-snapshot@${firstDigest.slice(0, 16)}`)) {
    targets.push({
      productId: `pkg:generic/source-snapshot@${firstDigest.slice(0, 16)}`,
      productType: "source",
      version: firstDigest.slice(0, 16),
      evidence: `${sourceSnapshotReport.totalFiles} source file digest(s) are recorded for source-level product identity.`,
      relatedHref: "analysis/source-snapshot-report.json"
    });
  }
  return targets;
}

export async function buildPolicyGateReport(
  walk: WalkResult,
  securityReadinessReport: SecurityReadinessReport
): Promise<PolicyGateReport> {
  const regoFiles = walk.files.filter((file) => file.relPath.endsWith(".rego"));
  const policyDocuments: PolicyGateReport["policyDocuments"] = [];
  for (const file of regoFiles.slice(0, 100)) {
    const text = await readTextIfSafe(file.absPath, 180_000);
    const packageName = text?.match(/^\s*package\s+([A-Za-z0-9_./-]+)/m)?.[1] ?? null;
    const ruleNames = text ? extractRegoRuleNames(text) : [];
    const testRuleCount = ruleNames.filter((name) => /^test_|^todo_test/.test(name)).length;
    const decisionRules = ruleNames.filter((name) => /^(allow|deny|violation|warn|warning|errors?|fail|pass|authz|allowed|main)$/i.test(name)).slice(0, 20);
    policyDocuments.push({
      filePath: file.relPath,
      packageName,
      ruleCount: ruleNames.length,
      testRuleCount,
      decisionRules,
      readiness: packageName && ruleNames.length > 0 ? "ready" : packageName || ruleNames.length > 0 ? "partial" : "missing",
      sourceHref: `source/${encodedPath(file.relPath)}`
    });
  }

  const inputDocuments = policyInputDocuments(walk);
  const schemaDocuments = inputDocuments.filter((doc) => doc.documentType === "schema");
  const testRuleTotal = policyDocuments.reduce((sum, doc) => sum + doc.testRuleCount, 0);
  const decisionDocs = policyDocuments.filter((doc) => doc.packageName && doc.decisionRules.length > 0);
  const gateQueries: PolicyGateReport["gateQueries"] = decisionDocs.flatMap((doc) => doc.decisionRules.slice(0, 4).map((rule) => ({
    query: `data.${doc.packageName}.${rule}`,
    purpose: /deny|violation|warn|fail|error/i.test(rule)
      ? "Use with --fail-defined when non-empty deny or violation output should fail CI."
      : "Use with --fail when an allow/pass decision must be defined and truthy.",
    readiness: "ready" as const,
    relatedHref: doc.sourceHref
  }))).slice(0, 24);
  if (gateQueries.length === 0 && policyDocuments.length > 0) {
    gateQueries.push({
      query: "data",
      purpose: "Inspect loaded policy/data documents before choosing a CI gate entrypoint.",
      readiness: "partial",
      relatedHref: policyDocuments[0].sourceHref
    });
  }

  const manifestFiles = walk.files.filter((file) => /(^|\/)\.manifest$|(^|\/)manifest\.ya?ml$|(^|\/)manifest\.json$/i.test(file.relPath));
  const signatureFiles = walk.files.filter((file) => /(^|\/)\.signatures\.json$|\.sig$|signature/i.test(file.relPath));
  const capabilitiesFiles = walk.files.filter((file) => /capabilities.*\.json$/i.test(file.relPath));
  const hasIacSignal = securityReadinessReport.securitySignals.some((signal) => signal.kind === "iac-config" || signal.kind === "container-config");

  const testCoverage: PolicyGateReport["testCoverage"] = [
    {
      target: "rego-policy-tests",
      status: testRuleTotal > 0 ? "covered" : policyDocuments.length > 0 ? "missing" : "missing",
      evidence: testRuleTotal > 0 ? `${testRuleTotal} Rego test/todo test rule(s) were detected.` : "No Rego test_ rules were detected.",
      relatedHref: policyDocuments.find((doc) => doc.testRuleCount > 0)?.sourceHref ?? "html/policy-gates.html"
    },
    {
      target: "compile-check",
      status: policyDocuments.length > 0 ? "partial" : "missing",
      evidence: policyDocuments.length > 0 ? `${policyDocuments.length} Rego policy file(s) can be handed to opa check --strict.` : "No Rego files were detected for opa check.",
      relatedHref: policyDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    },
    {
      target: "schema-validation",
      status: schemaDocuments.length > 0 ? "covered" : "missing",
      evidence: schemaDocuments.length > 0 ? `${schemaDocuments.length} schema document(s) can be supplied with --schema.` : "No schema files were detected for typed input/data validation.",
      relatedHref: schemaDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    },
    {
      target: "decision-fixtures",
      status: inputDocuments.length > 0 ? "partial" : "missing",
      evidence: inputDocuments.length > 0 ? `${inputDocuments.length} input/data/config document(s) can seed policy decision fixtures.` : "No input.json, data.json/yaml, IaC, or manifest fixture was detected.",
      relatedHref: inputDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    }
  ];

  const bundleReadiness: PolicyGateReport["bundleReadiness"] = [
    {
      requirement: "policy-files",
      status: policyDocuments.length > 0 ? "ready" : "missing",
      evidence: policyDocuments.length > 0 ? `${policyDocuments.length} Rego file(s) are available for opa build.` : "No Rego policy files were found.",
      relatedHref: policyDocuments[0]?.sourceHref ?? "html/policy-gates.html"
    },
    {
      requirement: "data-files",
      status: inputDocuments.length > 0 ? "ready" : hasIacSignal ? "partial" : "missing",
      evidence: inputDocuments.length > 0 ? `${inputDocuments.length} data/input document(s) were detected.` : hasIacSignal ? "IaC/security signals exist, but no explicit OPA data fixture was detected." : "No data/input documents were detected.",
      relatedHref: inputDocuments[0]?.sourceHref ?? "html/security-readiness.html"
    },
    {
      requirement: "entrypoints",
      status: gateQueries.length > 0 && gateQueries[0].query !== "data" ? "ready" : policyDocuments.length > 0 ? "partial" : "missing",
      evidence: gateQueries.length > 0 ? `${gateQueries.length} gate query candidate(s) were inferred.` : "No decision rule entrypoint was detected.",
      relatedHref: gateQueries[0]?.relatedHref ?? "html/policy-gates.html"
    },
    {
      requirement: "manifest",
      status: manifestFiles.length > 0 ? "ready" : "missing",
      evidence: manifestFiles.length > 0 ? `Bundle manifest candidate(s): ${manifestFiles.map((file) => file.relPath).join(", ")}.` : "No OPA bundle .manifest or manifest.yaml/json file was detected.",
      relatedHref: manifestFiles[0] ? `source/${encodedPath(manifestFiles[0].relPath)}` : "html/policy-gates.html"
    },
    {
      requirement: "signature",
      status: signatureFiles.length > 0 ? "ready" : "external",
      evidence: signatureFiles.length > 0 ? `Signature material candidate(s): ${signatureFiles.map((file) => file.relPath).join(", ")}.` : "Bundle signing/verification is an external release step unless .signatures.json is committed.",
      relatedHref: signatureFiles[0] ? `source/${encodedPath(signatureFiles[0].relPath)}` : "html/provenance.html"
    },
    {
      requirement: "capabilities",
      status: capabilitiesFiles.length > 0 ? "ready" : "external",
      evidence: capabilitiesFiles.length > 0 ? `Capabilities file(s): ${capabilitiesFiles.map((file) => file.relPath).join(", ")}.` : "Capabilities constraints are external unless the repository pins an OPA capabilities JSON file.",
      relatedHref: capabilitiesFiles[0] ? `source/${encodedPath(capabilitiesFiles[0].relPath)}` : "html/policy-gates.html"
    }
  ];

  const decisionOutputs: PolicyGateReport["decisionOutputs"] = [
    {
      field: "result",
      purpose: "Contains the raw Rego query value returned by opa eval.",
      readiness: gateQueries.length > 0 ? "ready" : "partial",
      evidence: gateQueries.length > 0 ? "Gate query candidates are available for JSON result capture." : "A query entrypoint still needs to be selected.",
      relatedHref: "html/policy-gates.html"
    },
    {
      field: "errors",
      purpose: "Captures parse, compile, type, or runtime errors for CI failure handling.",
      readiness: policyDocuments.length > 0 ? "partial" : "external",
      evidence: policyDocuments.length > 0 ? "opa check --strict can produce structured errors before eval." : "No policy documents exist to check.",
      relatedHref: "html/policy-gates.html"
    },
    {
      field: "metrics/profile",
      purpose: "Records evaluation timing and hot expressions when policy performance matters.",
      readiness: policyDocuments.length > 0 ? "external" : "partial",
      evidence: "OPA exposes metrics/profile output, but RepoTutor does not execute policies.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      field: "coverage",
      purpose: "Shows which policy expressions were exercised by opa test.",
      readiness: testRuleTotal > 0 ? "external" : "partial",
      evidence: testRuleTotal > 0 ? "Test rules exist; run opa test --coverage for exact coverage." : "No test rules were detected for coverage.",
      relatedHref: "html/policy-gates.html"
    },
    {
      field: "explanation/trace",
      purpose: "Debugs why a policy decision passed, failed, or was undefined.",
      readiness: policyDocuments.length > 0 ? "external" : "partial",
      evidence: "OPA can emit explanation traces, but they require executing a chosen input/query pair.",
      relatedHref: "html/policy-gates.html"
    }
  ];

  const riskQueue: PolicyGateReport["riskQueue"] = [];
  if (policyDocuments.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Add Rego policy files before advertising policy-as-code gates.",
      why: "OPA gates need policy modules with packages and rules.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (policyDocuments.length > 0 && testRuleTotal === 0) {
    riskQueue.push({
      priority: "high",
      action: "Add Rego test_ rules and run opa test --fail-on-empty.",
      why: "Policy gates are risky without tests that prove allow/deny behavior.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (inputDocuments.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Commit sample input/data fixtures for each policy gate entrypoint.",
      why: "OPA decisions depend on structured input and data documents.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (schemaDocuments.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Add JSON Schema for important input/data documents.",
      why: "opa check/eval can use schemas to catch reference mistakes before runtime.",
      relatedHref: "html/policy-gates.html"
    });
  }
  if (manifestFiles.length === 0) {
    riskQueue.push({
      priority: "low",
      action: "Package release policy as an OPA bundle with manifest and entrypoints.",
      why: "Bundles make policy distribution, inspection, and signing repeatable.",
      relatedHref: "html/policy-gates.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real OPA commands in CI before enforcing deploy or release decisions.",
    why: "RepoTutor reports readiness only and does not evaluate policy decisions.",
    relatedHref: "html/policy-gates.html"
  });

  const primaryQuery = gateQueries.find((query) => query.query !== "data")?.query ?? "data.<package>.<rule>";

  return {
    summary: `OPA식 policy gate readiness report: policy document ${policyDocuments.length}개, input/data document ${inputDocuments.length}개, gate query ${gateQueries.length}개, bundle requirement ${bundleReadiness.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "OPA Rego policy input data decision eval test bundle schema strict fail gate",
    policyDocuments,
    inputDocuments,
    gateQueries,
    testCoverage,
    bundleReadiness,
    decisionOutputs,
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    recommendedCommands: [
      {
        command: "opa check --strict <policy-dir>",
        purpose: "Parse, compile, type-check, and strict-check Rego modules before policy evaluation."
      },
      {
        command: "opa test <policy-dir> --fail-on-empty --format=json",
        purpose: "Run Rego test_ rules and fail CI when no tests are discovered."
      },
      {
        command: `opa eval --data <policy-dir> --input input.json '${primaryQuery}' --format=json`,
        purpose: "Evaluate a selected policy decision against an input fixture and capture structured results."
      },
      {
        command: "opa build -b <policy-dir> -e <entrypoint> -o bundle.tar.gz",
        purpose: "Package policy/data into a distributable bundle with explicit entrypoints."
      },
      {
        command: "opa inspect bundle.tar.gz",
        purpose: "Inspect bundled packages, data roots, and manifest metadata before deployment."
      }
    ],
    learnerNextSteps: [
      "먼저 Rego package와 decision rule이 있는지 확인하고, CI gate query를 하나씩 명시하세요.",
      "deny/violation/warn 계열 rule은 non-empty result가 실패인지 명확히 정하세요.",
      "policy input fixture와 schema를 함께 두면 undefined decision과 reference typo를 줄일 수 있습니다.",
      "이 리포트는 OPA 실행 결과가 아닙니다. 실제 allow/deny 판단은 opa check/test/eval을 별도 실행하세요."
    ]
  };
}

function extractRegoRuleNames(text: string): string[] {
  const names = new Set<string>();
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*(package|import|else|some|every|with|not)\b/.test(line)) continue;
    const match = line.match(/^\s*(?:default\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*(?:\[|\(|contains\b|:=|=|\{|if\b)/);
    if (!match) continue;
    names.add(match[1]);
  }
  return [...names].sort();
}

function policyInputDocuments(walk: WalkResult): PolicyGateReport["inputDocuments"] {
  const docs: PolicyGateReport["inputDocuments"] = [];
  const seen = new Set<string>();
  for (const file of walk.files) {
    const type = policyDocumentType(file.relPath);
    if (!type || seen.has(file.relPath)) continue;
    seen.add(file.relPath);
    docs.push({
      filePath: file.relPath,
      documentType: type,
      readiness: type === "unknown" ? "partial" : "ready",
      evidence: policyDocumentEvidence(file.relPath, type),
      sourceHref: `source/${encodedPath(file.relPath)}`
    });
  }
  return docs.slice(0, 80);
}

function policyDocumentType(filePath: string): PolicyGateReport["inputDocuments"][number]["documentType"] | null {
  const base = path.basename(filePath).toLowerCase();
  if (base === "input.json" || base === "input.yaml" || base === "input.yml") return "input";
  if (base === "data.json" || base === "data.yaml" || base === "data.yml") return "data";
  if (base.endsWith(".schema.json") || /(^|\/)schemas?\//i.test(filePath)) return "schema";
  if (isIacConfigFile(filePath)) return "iac";
  if (["package.json", "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "go.mod", "Cargo.toml", "pyproject.toml"].includes(path.basename(filePath))) return "manifest";
  if (/policy|gate|admission|terraform|kubernetes|deploy/i.test(filePath) && /\.(json|ya?ml|toml)$/i.test(filePath)) return "unknown";
  return null;
}

function policyDocumentEvidence(filePath: string, type: PolicyGateReport["inputDocuments"][number]["documentType"]): string {
  if (type === "input") return `${filePath} can be passed to opa eval with --input.`;
  if (type === "data") return `${filePath} can be loaded under data for policy evaluation.`;
  if (type === "schema") return `${filePath} can validate input/data references with --schema.`;
  if (type === "iac") return `${filePath} is an IaC/config candidate for policy-as-code gates.`;
  if (type === "manifest") return `${filePath} is a project/deployment manifest candidate for policy checks.`;
  return `${filePath} looks policy-related but needs a human to classify its role.`;
}
