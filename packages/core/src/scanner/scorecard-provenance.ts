import path from "node:path";
import type { LicenseRightsReport, ProvenanceReport, SbomReport, ScorecardReport, SecurityReadinessReport, SourceSnapshotReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import type { AnalysisContext } from "./analyzer.js";
import { encodedPath } from "./source-links.js";
export async function buildScorecardReport(
  walk: WalkResult,
  licenseRightsReport: LicenseRightsReport,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport
): Promise<ScorecardReport> {
  const securityPolicyFiles = walk.files.filter((file) => /(^|\/)(SECURITY|security)\.md$/i.test(file.relPath));
  const workflowFiles = walk.files.filter((file) => /^\.github\/workflows\/.+\.ya?ml$/i.test(file.relPath));
  const testFiles = walk.files.filter((file) => /(^|\/)(__tests__|tests?|spec)\/|(\.test|\.spec)\.[cm]?[jt]sx?$/i.test(file.relPath));
  const dependencyUpdateFiles = walk.files.filter((file) => /(^|\/)(dependabot\.ya?ml|renovate\.json|renovate\.json5|\.renovaterc(?:\.json)?|\.github\/renovate\.json)$/i.test(file.relPath));
  const sastFiles = walk.files.filter((file) => /(^|\/)(codeql|semgrep|snyk|sonar-project|\.snyk|\.semgrep)\b/i.test(file.relPath));
  const binaryArtifacts = walk.files.filter((file) => /\.(exe|dll|dylib|so|class|pyc|jar|war|ear|min\.js)$/i.test(file.relPath));
  const packageRanges = await packageDependencyRangeSignals(walk);
  const scriptSignals = await packageJsonScriptSignals(walk);
  const workflowSignals = await workflowSafetySignals(workflowFiles);
  const hasLicenseEvidence = Boolean(licenseRightsReport.detectedProjectLicense.spdxId);
  const hasPackageInventory = sbomReport.packageArtifacts.length > 0;
  const hasLockfile = sbomReport.fileArtifacts.some((artifact) => artifact.artifactKind === "lockfile");
  const dangerousWorkflowEvidence = workflowSignals.dangerousFiles.length > 0
    ? `${workflowSignals.dangerousFiles.join(", ")} workflow uses pull_request_target with checkout/script patterns.`
    : workflowFiles.length > 0
      ? `${workflowFiles.length} workflow file(s) found without the dangerous static pattern.`
      : "No GitHub workflow files were detected, so dangerous workflow analysis is inconclusive.";

  const checks: ScorecardReport["checks"] = [
    {
      name: "Maintained",
      score: walk.files.length > 0 ? 8 : 0,
      status: walk.files.length > 0 ? "pass" : "fail",
      risk: "low",
      evidence: walk.files.length > 0 ? `${walk.files.length} safe source file(s) are present in the study snapshot.` : "No source files were available in the safe snapshot.",
      remediation: "Keep release, issue, and commit freshness checks in the original repository before depending on this project.",
      relatedHref: "html/project-activity.html"
    },
    {
      name: "License",
      score: hasLicenseEvidence ? 10 : licenseRightsReport.packageLicenseSignals.length > 0 ? 4 : 0,
      status: hasLicenseEvidence ? "pass" : licenseRightsReport.packageLicenseSignals.length > 0 ? "partial" : "fail",
      risk: "medium",
      evidence: hasLicenseEvidence ? `Project license detected as ${licenseRightsReport.detectedProjectLicense.spdxId}.` : licenseRightsReport.packageLicenseSignals.length > 0 ? "Package metadata has license hints, but no project-level license was detected." : "No project license evidence was detected.",
      remediation: "Add or verify a project-level LICENSE file and keep package metadata aligned.",
      relatedHref: "html/license-rights.html"
    },
    {
      name: "SBOM",
      score: hasPackageInventory && hasLockfile ? 10 : hasPackageInventory ? 6 : 0,
      status: hasPackageInventory && hasLockfile ? "pass" : hasPackageInventory ? "partial" : "fail",
      risk: "medium",
      evidence: `${sbomReport.packageArtifacts.length} package artifact(s), ${sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile").length} lockfile artifact(s).`,
      remediation: "Generate a full CycloneDX/SPDX/Syft SBOM when distribution or security review requires resolved components.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "Security-Policy",
      score: securityPolicyFiles.length > 0 ? 10 : 0,
      status: securityPolicyFiles.length > 0 ? "pass" : "fail",
      risk: "high",
      evidence: securityPolicyFiles.length > 0 ? `Security policy file(s): ${securityPolicyFiles.map((file) => file.relPath).join(", ")}.` : "No SECURITY.md file was detected.",
      remediation: "Add SECURITY.md with supported versions and vulnerability disclosure instructions.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "CI-Tests",
      score: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? 10 : testFiles.length > 0 || scriptSignals.testScripts > 0 ? 5 : 0,
      status: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? "pass" : testFiles.length > 0 || scriptSignals.testScripts > 0 ? "partial" : "fail",
      risk: "low",
      evidence: `${workflowFiles.length} workflow file(s), ${scriptSignals.testScripts} package test script(s), ${testFiles.length} test file(s).`,
      remediation: "Check in test commands and run them in CI on every pull request.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Pinned-Dependencies",
      score: packageRanges.total === 0 ? null : packageRanges.unpinned === 0 && hasLockfile ? 10 : packageRanges.unpinned === 0 ? 7 : 2,
      status: packageRanges.total === 0 ? "unknown" : packageRanges.unpinned === 0 && hasLockfile ? "pass" : packageRanges.unpinned === 0 ? "partial" : "fail",
      risk: "medium",
      evidence: packageRanges.total === 0 ? "No supported dependency range fields were found." : `${packageRanges.pinned}/${packageRanges.total} dependency range(s) look exact; unpinned examples: ${packageRanges.examples.join(", ") || "none"}.`,
      remediation: "Pin direct dependency ranges or keep a package-manager lockfile so resolved versions are reviewable.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "Dependency-Update-Tool",
      score: dependencyUpdateFiles.length > 0 ? 10 : 0,
      status: dependencyUpdateFiles.length > 0 ? "pass" : "fail",
      risk: "medium",
      evidence: dependencyUpdateFiles.length > 0 ? `Dependency update config(s): ${dependencyUpdateFiles.map((file) => file.relPath).join(", ")}.` : "No Dependabot or Renovate config was detected.",
      remediation: "Add Dependabot or Renovate so dependency updates arrive as reviewable pull requests.",
      relatedHref: "html/sbom.html"
    },
    {
      name: "SAST",
      score: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? 10 : 0,
      status: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? "pass" : "fail",
      risk: "medium",
      evidence: sastFiles.length > 0 || workflowSignals.sastMentions.length > 0 ? `SAST signal(s): ${[...sastFiles.map((file) => file.relPath), ...workflowSignals.sastMentions].join(", ")}.` : "No CodeQL, Semgrep, Snyk, Sonar, or similar SAST signal was detected.",
      remediation: "Add a SAST workflow or document an equivalent static analysis step.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Binary-Artifacts",
      score: binaryArtifacts.length === 0 ? 10 : 0,
      status: binaryArtifacts.length === 0 ? "pass" : "fail",
      risk: "high",
      evidence: binaryArtifacts.length === 0 ? "No generated binary artifact extensions were detected in the safe snapshot." : `Binary-like artifact(s): ${binaryArtifacts.slice(0, 8).map((file) => file.relPath).join(", ")}.`,
      remediation: "Remove generated binaries from source or document reproducible build provenance.",
      relatedHref: "html/files.html"
    },
    {
      name: "Dangerous-Workflow",
      score: workflowFiles.length === 0 ? null : workflowSignals.dangerousFiles.length === 0 ? 10 : 0,
      status: workflowFiles.length === 0 ? "unknown" : workflowSignals.dangerousFiles.length === 0 ? "pass" : "fail",
      risk: "high",
      evidence: dangerousWorkflowEvidence,
      remediation: "Avoid pull_request_target workflows that check out or execute untrusted pull request code.",
      relatedHref: "html/security-readiness.html"
    },
    {
      name: "Branch-Protection",
      score: null,
      status: "unknown",
      risk: "high",
      evidence: "Branch protection requires live source-host provider settings and cannot be proven from the generated session `source/` snapshot.",
      remediation: "Verify branch rules or rulesets in GitHub/GitLab with required reviews, status checks, and force-push protection.",
      relatedHref: "html/project-activity.html"
    },
    {
      name: "Code-Review",
      score: null,
      status: "unknown",
      risk: "high",
      evidence: "Code review enforcement requires provider pull request or merge request history.",
      remediation: "Verify required human review on protected branches in the original repository.",
      relatedHref: "html/project-activity.html"
    }
  ];

  const categoryScores: ScorecardReport["categoryScores"] = [
    scorecardCategory("source", ["Maintained", "Binary-Artifacts", "License"], checks, "Source hygiene combines maintained source, binary artifact absence, and license evidence.", "html/files.html"),
    scorecardCategory("build", ["CI-Tests", "Dangerous-Workflow"], checks, "Build hygiene checks whether tests and workflow safety are visible.", "html/security-readiness.html"),
    scorecardCategory("dependency", ["SBOM", "Pinned-Dependencies", "Dependency-Update-Tool"], checks, "Dependency hygiene combines inventory, pinning, lockfiles, and update automation.", "html/sbom.html"),
    scorecardCategory("security", ["Security-Policy", "SAST", "Branch-Protection", "Code-Review"], checks, "Security hygiene separates local evidence from provider-only controls.", "html/security-readiness.html"),
    scorecardCategory("maintenance", ["Maintained", "Dependency-Update-Tool"], checks, "Maintenance hygiene tracks whether the project leaves future upkeep signals.", "html/project-activity.html")
  ];

  const policyFindings: ScorecardReport["policyFindings"] = [
    {
      policy: "Project has discoverable license evidence",
      result: hasLicenseEvidence ? "pass" : "fail",
      evidence: hasLicenseEvidence ? `Detected ${licenseRightsReport.detectedProjectLicense.spdxId}.` : "License Rights report could not detect a project license.",
      relatedHref: "html/license-rights.html"
    },
    {
      policy: "Project has dependency inventory",
      result: hasPackageInventory ? "pass" : "fail",
      evidence: hasPackageInventory ? `${sbomReport.packageArtifacts.length} package artifact(s) recorded.` : "No package artifacts recorded.",
      relatedHref: "html/sbom.html"
    },
    {
      policy: "Project has security disclosure policy",
      result: securityPolicyFiles.length > 0 ? "pass" : "fail",
      evidence: securityPolicyFiles.length > 0 ? securityPolicyFiles.map((file) => file.relPath).join(", ") : "No SECURITY.md file detected.",
      relatedHref: "html/security-readiness.html"
    },
    {
      policy: "Project has automated test signal",
      result: workflowFiles.length > 0 && (testFiles.length > 0 || scriptSignals.testScripts > 0) ? "pass" : testFiles.length > 0 || scriptSignals.testScripts > 0 ? "review" : "fail",
      evidence: `${workflowFiles.length} workflow file(s), ${scriptSignals.testScripts} test script(s), ${testFiles.length} test file(s).`,
      relatedHref: "html/security-readiness.html"
    },
    {
      policy: "Provider controls require live verification",
      result: "review",
      evidence: "Branch-Protection and Code-Review are intentionally unknown in a safe local snapshot.",
      relatedHref: "html/project-activity.html"
    }
  ];

  const riskQueue = scorecardRiskQueue(checks, securityReadinessReport);
  const structuredResults: ScorecardReport["structuredResults"] = checks.map((check) => ({
    checkName: check.name,
    probe: `${check.name} static evidence probe`,
    outcome: check.status === "unknown" ? "unknown" : check.status === "fail" ? "negative" : "positive",
    evidence: check.evidence
  }));

  const aggregateScore = scorecardWeightedScore(checks);
  return {
    summary: `OpenSSF Scorecard식 project scorecard: aggregate ${aggregateScore}/10, checks ${checks.length}개, policy finding ${policyFindings.length}개, risk queue ${riskQueue.length}개를 정적 학습 리포트로 정리했습니다.`,
    sourcePattern: "OpenSSF Scorecard checks score 0-10 risk remediation structured results policy measurement",
    aggregateScore,
    checks,
    categoryScores,
    policyFindings,
    riskQueue,
    structuredResults,
    learnerNextSteps: [
      "unknown check는 실패가 아니라 provider API나 repository history가 필요한 항목입니다.",
      "high risk queue부터 확인하고, 관련 License/SBOM/Security Readiness 리포트의 원본 근거를 대조하세요.",
      "이 리포트는 OpenSSF Scorecard 실행 결과가 아니라 RepoTutor의 정적 학습용 사전 점검입니다.",
      "배포, 의존성 채택, 보안 의사결정에는 원본 repository에서 실제 scorecard 도구를 실행하세요."
    ]
  };
}

function scorecardWeightedScore(checks: ScorecardReport["checks"]): number {
  const weights: Record<ScorecardReport["checks"][number]["risk"], number> = {
    critical: 10,
    high: 7.5,
    medium: 5,
    low: 2.5,
    unknown: 1
  };
  const scored = checks.filter((check) => check.score !== null);
  const totalWeight = scored.reduce((sum, check) => sum + weights[check.risk], 0);
  if (totalWeight === 0) return 0;
  const weighted = scored.reduce((sum, check) => sum + (check.score ?? 0) * weights[check.risk], 0) / totalWeight;
  return Number(weighted.toFixed(1));
}

function scorecardCategory(
  category: ScorecardReport["categoryScores"][number]["category"],
  names: string[],
  checks: ScorecardReport["checks"],
  explanation: string,
  relatedHref: string
): ScorecardReport["categoryScores"][number] {
  const selected = checks.filter((check) => names.includes(check.name) && check.score !== null);
  const score = selected.length === 0 ? null : Number((selected.reduce((sum, check) => sum + (check.score ?? 0), 0) / selected.length).toFixed(1));
  return { category, score, explanation, relatedHref };
}

function scorecardRiskQueue(checks: ScorecardReport["checks"], securityReadinessReport: SecurityReadinessReport): ScorecardReport["riskQueue"] {
  const queue: ScorecardReport["riskQueue"] = [];
  for (const check of checks) {
    if (check.status === "pass") continue;
    const priority = check.risk === "high" || check.risk === "critical" ? "high" : check.risk === "medium" ? "medium" : "low";
    if (check.status === "unknown") {
      queue.push({
        priority: "low",
        checkName: check.name,
        action: `Verify ${check.name} in the original source-host provider.`,
        why: check.evidence,
        relatedHref: check.relatedHref
      });
      continue;
    }
    queue.push({
      priority,
      checkName: check.name,
      action: check.remediation,
      why: check.evidence,
      relatedHref: check.relatedHref
    });
  }
  for (const action of securityReadinessReport.actionQueue.filter((item) => item.priority !== "low").slice(0, 3)) {
    queue.push({
      priority: action.priority,
      checkName: "Security-Readiness",
      action: action.action,
      why: action.why,
      relatedHref: action.relatedHref
    });
  }
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  return queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.checkName.localeCompare(b.checkName)).slice(0, 12);
}

export function buildProvenanceReport(
  context: AnalysisContext,
  walk: WalkResult,
  sbomReport: SbomReport,
  securityReadinessReport: SecurityReadinessReport,
  sourceSnapshotReport: SourceSnapshotReport
): ProvenanceReport {
  const sourceFileCount = sourceSnapshotReport.totalFiles;
  const lockfileCount = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile").length;
  const containerFiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const signatureFiles = provenanceFiles(walk, isSignatureMaterialFile);
  const bundleFiles = provenanceFiles(walk, isSigstoreBundleFile);
  const certificateFiles = provenanceFiles(walk, isCertificateMaterialFile);
  const publicKeyFiles = provenanceFiles(walk, isPublicKeyMaterialFile);
  const trustedRootFiles = provenanceFiles(walk, isTrustedRootMaterialFile);
  const attestationFiles = provenanceFiles(walk, isAttestationMaterialFile);
  const slsaFiles = attestationFiles.filter((filePath) => /slsa|provenance|intoto|in-toto|\.link/i.test(filePath));
  const spdxFiles = provenanceFiles(walk, (filePath) => /spdx/i.test(filePath));
  const cyclonedxFiles = provenanceFiles(walk, (filePath) => /cyclonedx|cdx/i.test(filePath));
  const vulnFiles = attestationFiles.filter((filePath) => /vuln|vulnerability/i.test(filePath));
  const hasPackageArtifacts = sbomReport.packageArtifacts.length > 0;
  const vulnerabilityScanner = securityReadinessReport.scannerCoverage.find((scanner) => scanner.scanner === "vulnerability");

  const artifactSignals: ProvenanceReport["artifactSignals"] = [
    {
      artifact: "generated session `source/` snapshot",
      artifactType: "source-snapshot",
      readiness: sourceFileCount > 0 ? "ready" : "missing",
      evidence: sourceFileCount > 0 ? `${sourceFileCount} generated session \`source/\` snapshot text file digest(s) are recorded in source-snapshot-report.json.` : "No generated session `source/` snapshot digest evidence is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      artifact: "package inventory",
      artifactType: "package",
      readiness: hasPackageArtifacts && lockfileCount > 0 ? "ready" : hasPackageArtifacts ? "partial" : "missing",
      evidence: hasPackageArtifacts ? `${sbomReport.packageArtifacts.length} package artifact(s), ${lockfileCount} lockfile artifact(s).` : "No package artifacts are recorded in the SBOM report.",
      relatedHref: "html/sbom.html"
    },
    {
      artifact: "container image",
      artifactType: "container",
      readiness: containerFiles.length > 0 ? "partial" : "missing",
      evidence: containerFiles.length > 0 ? `${containerFiles.length} container build/config file(s) found; a signed image digest still requires an external registry artifact.` : "No Dockerfile or Compose evidence was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      artifact: "static SBOM report",
      artifactType: "sbom",
      readiness: hasPackageArtifacts ? "ready" : "missing",
      evidence: hasPackageArtifacts ? "RepoTutor generated static SBOM package evidence that can be exported or signed as a blob." : "The static SBOM report has no package artifacts to sign.",
      relatedHref: "html/sbom.html"
    },
    {
      artifact: "release candidate",
      artifactType: "release",
      readiness: sbomReport.packageManifests.length > 0 || context.commitHash ? "partial" : "missing",
      evidence: sbomReport.packageManifests.length > 0 || context.commitHash ? `Release evidence is partial: ${sbomReport.packageManifests.length} package manifest(s), commit ${context.commitHash?.slice(0, 12) ?? "unknown"}.` : "No package manifest or commit metadata is available for release provenance.",
      relatedHref: "html/project-activity.html"
    },
    {
      artifact: "generic source blob",
      artifactType: "blob",
      readiness: sourceFileCount > 0 ? "ready" : "missing",
      evidence: sourceFileCount > 0 ? "Any generated markdown, JSON, or source digest can be treated as a cosign sign-blob candidate." : "No file digest evidence exists for blob signing.",
      relatedHref: "html/files.html"
    }
  ];

  const signatureSignals: ProvenanceReport["signatureSignals"] = [
    {
      material: "signature",
      readiness: signatureFiles.length > 0 ? "present" : "missing",
      evidence: signatureFiles.length > 0 ? `Detached signature file(s): ${signatureFiles.join(", ")}.` : "No detached signature file such as .sig was detected.",
      relatedHref: signatureFiles[0] ? `source/${encodedPath(signatureFiles[0])}` : "html/provenance.html"
    },
    {
      material: "bundle",
      readiness: bundleFiles.length > 0 ? "present" : "missing",
      evidence: bundleFiles.length > 0 ? `Sigstore bundle file(s): ${bundleFiles.join(", ")}.` : "No Sigstore bundle was detected; bundles are the preferred offline verification material.",
      relatedHref: bundleFiles[0] ? `source/${encodedPath(bundleFiles[0])}` : "html/provenance.html"
    },
    {
      material: "certificate",
      readiness: certificateFiles.length > 0 ? "present" : "missing",
      evidence: certificateFiles.length > 0 ? `Certificate material file(s): ${certificateFiles.join(", ")}.` : "No certificate material was detected outside a possible external bundle.",
      relatedHref: certificateFiles[0] ? `source/${encodedPath(certificateFiles[0])}` : "html/provenance.html"
    },
    {
      material: "public-key",
      readiness: publicKeyFiles.length > 0 ? "present" : "missing",
      evidence: publicKeyFiles.length > 0 ? `Public key file(s): ${publicKeyFiles.join(", ")}.` : "No public key material such as cosign.pub was detected.",
      relatedHref: publicKeyFiles[0] ? `source/${encodedPath(publicKeyFiles[0])}` : "html/provenance.html"
    },
    {
      material: "trusted-root",
      readiness: trustedRootFiles.length > 0 ? "present" : "external",
      evidence: trustedRootFiles.length > 0 ? `Trusted root file(s): ${trustedRootFiles.join(", ")}.` : "Trusted root material usually comes from Sigstore trust-root distribution or an explicit trusted_root.json.",
      relatedHref: trustedRootFiles[0] ? `source/${encodedPath(trustedRootFiles[0])}` : "html/provenance.html"
    },
    {
      material: "transparency-log",
      readiness: bundleFiles.length > 0 ? "present" : "external",
      evidence: bundleFiles.length > 0 ? "A Sigstore bundle can carry transparency log proof for offline verification." : "Transparency log inclusion must be checked through Rekor or a downloaded bundle.",
      relatedHref: bundleFiles[0] ? `source/${encodedPath(bundleFiles[0])}` : "html/provenance.html"
    }
  ];

  const attestationSignals: ProvenanceReport["attestationSignals"] = [
    {
      predicateType: "slsaprovenance",
      readiness: slsaFiles.length > 0 ? "available" : "missing",
      evidence: slsaFiles.length > 0 ? `SLSA/provenance attestation candidate(s): ${slsaFiles.join(", ")}.` : "No SLSA provenance, in-toto, or link attestation file was detected.",
      relatedHref: slsaFiles[0] ? `source/${encodedPath(slsaFiles[0])}` : "html/provenance.html"
    },
    {
      predicateType: "spdx",
      readiness: spdxFiles.length > 0 ? "available" : hasPackageArtifacts ? "partial" : "missing",
      evidence: spdxFiles.length > 0 ? `SPDX artifact(s): ${spdxFiles.join(", ")}.` : hasPackageArtifacts ? "Static SBOM package inventory exists, but no standalone SPDX predicate file was detected." : "No SPDX evidence was detected.",
      relatedHref: spdxFiles[0] ? `source/${encodedPath(spdxFiles[0])}` : "html/sbom.html"
    },
    {
      predicateType: "cyclonedx",
      readiness: cyclonedxFiles.length > 0 ? "available" : hasPackageArtifacts ? "partial" : "missing",
      evidence: cyclonedxFiles.length > 0 ? `CycloneDX artifact(s): ${cyclonedxFiles.join(", ")}.` : hasPackageArtifacts ? "Static SBOM package inventory exists, but no standalone CycloneDX predicate file was detected." : "No CycloneDX evidence was detected.",
      relatedHref: cyclonedxFiles[0] ? `source/${encodedPath(cyclonedxFiles[0])}` : "html/sbom.html"
    },
    {
      predicateType: "vuln",
      readiness: vulnFiles.length > 0 ? "available" : vulnerabilityScanner?.readiness === "missing" ? "missing" : "partial",
      evidence: vulnFiles.length > 0 ? `Vulnerability attestation candidate(s): ${vulnFiles.join(", ")}.` : vulnerabilityScanner ? vulnerabilityScanner.evidence : "No vulnerability scanner readiness evidence is available.",
      relatedHref: vulnFiles[0] ? `source/${encodedPath(vulnFiles[0])}` : "html/security-readiness.html"
    },
    {
      predicateType: "custom",
      readiness: attestationFiles.length > 0 ? "available" : "missing",
      evidence: attestationFiles.length > 0 ? `Generic attestation/predicate file(s): ${attestationFiles.join(", ")}.` : "No generic attestation, predicate, or DSSE envelope file was detected.",
      relatedHref: attestationFiles[0] ? `source/${encodedPath(attestationFiles[0])}` : "html/provenance.html"
    }
  ];

  const identityRequirements: ProvenanceReport["identityRequirements"] = [
    {
      requirement: "artifact digest pinning",
      status: sourceFileCount > 0 || Boolean(context.commitHash) ? "known" : "missing",
      evidence: sourceFileCount > 0 ? `${sourceFileCount} source file digest(s) are available; repository commit is ${context.commitHash?.slice(0, 12) ?? "unknown"}.` : "No digest or commit metadata is available.",
      relatedHref: "analysis/source-snapshot-report.json"
    },
    {
      requirement: "expected certificate identity",
      status: "missing",
      evidence: "Keyless verification requires an expected certificate identity; RepoTutor cannot infer the release identity from a safe local snapshot.",
      relatedHref: "html/provenance.html"
    },
    {
      requirement: "expected OIDC issuer",
      status: "external",
      evidence: "Keyless verification requires the OIDC issuer, commonly https://token.actions.githubusercontent.com for GitHub Actions or another issuer chosen by the publisher.",
      relatedHref: "html/provenance.html"
    },
    {
      requirement: "public key or certificate chain",
      status: publicKeyFiles.length > 0 || certificateFiles.length > 0 ? "known" : "missing",
      evidence: publicKeyFiles.length > 0 || certificateFiles.length > 0 ? `Verification material found: ${[...publicKeyFiles, ...certificateFiles].join(", ")}.` : "No public key or certificate chain material was detected.",
      relatedHref: publicKeyFiles[0] || certificateFiles[0] ? `source/${encodedPath(publicKeyFiles[0] ?? certificateFiles[0])}` : "html/provenance.html"
    },
    {
      requirement: "trusted root and transparency log proof",
      status: trustedRootFiles.length > 0 || bundleFiles.length > 0 ? "known" : "external",
      evidence: trustedRootFiles.length > 0 || bundleFiles.length > 0 ? `Trusted verification evidence found: ${[...trustedRootFiles, ...bundleFiles].join(", ")}.` : "Trusted root and Rekor proof must be fetched or provided outside the generated session `source/` snapshot.",
      relatedHref: trustedRootFiles[0] || bundleFiles[0] ? `source/${encodedPath(trustedRootFiles[0] ?? bundleFiles[0])}` : "html/provenance.html"
    }
  ];

  const riskQueue: ProvenanceReport["riskQueue"] = [];
  if (signatureFiles.length === 0 && bundleFiles.length === 0) {
    riskQueue.push({
      priority: "high",
      action: "Create and store a Sigstore bundle or detached signature for release artifacts.",
      why: "Cosign verification needs signature material; a bundle is preferred because it can carry certificate and transparency log proof.",
      relatedHref: "html/provenance.html"
    });
  }
  if (!identityRequirements.some((requirement) => requirement.requirement === "expected certificate identity" && requirement.status === "known")) {
    riskQueue.push({
      priority: "high",
      action: "Document the expected certificate identity and OIDC issuer for keyless verification.",
      why: "Cosign keyless verification should pin identity and issuer, not just accept any valid certificate.",
      relatedHref: "html/provenance.html"
    });
  }
  if (!attestationSignals.some((signal) => signal.readiness === "available")) {
    riskQueue.push({
      priority: "medium",
      action: "Add SLSA, SBOM, or vulnerability attestations for artifacts that will be distributed.",
      why: "Cosign attestations let verifiers check provenance and subject relationship instead of only checking a signature.",
      relatedHref: "html/provenance.html"
    });
  }
  if (containerFiles.length > 0) {
    riskQueue.push({
      priority: "medium",
      action: "Sign and verify container images by digest, not tags.",
      why: "Container config exists, but a mutable tag is not enough provenance evidence.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  if (publicKeyFiles.length === 0 && certificateFiles.length === 0 && bundleFiles.length === 0) {
    riskQueue.push({
      priority: "medium",
      action: "Provide a public key, certificate chain, or Sigstore bundle alongside signed artifacts.",
      why: "Offline verification needs trust material available to the verifier.",
      relatedHref: "html/provenance.html"
    });
  }
  riskQueue.push({
    priority: "low",
    action: "Run real cosign verification outside RepoTutor for release decisions.",
    why: "This report is readiness metadata only and does not query Rekor, validate certificates, or verify signatures.",
    relatedHref: "html/provenance.html"
  });

  return {
    summary: `Cosign식 provenance readiness report: artifact signal ${artifactSignals.length}개, signature material ${signatureSignals.length}개, attestation ${attestationSignals.length}개, identity requirement ${identityRequirements.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Cosign signature bundle attestation transparency log trusted root certificate identity verification",
    artifactSignals,
    signatureSignals,
    attestationSignals,
    identityRequirements,
    verificationCommands: [
      {
        command: "cosign verify-blob <artifact> --bundle <artifact.sigstore.json> --certificate-identity <identity> --certificate-oidc-issuer <issuer>",
        purpose: "Generic blob을 Sigstore bundle, expected identity, OIDC issuer로 검증합니다."
      },
      {
        command: "cosign verify-attestation --type slsaprovenance --certificate-identity <identity> --certificate-oidc-issuer <issuer> <image>",
        purpose: "컨테이너 이미지의 SLSA provenance attestation과 subject 관계를 검증합니다."
      },
      {
        command: "cosign tree <image>",
        purpose: "OCI artifact에 붙은 signature, attestation, SBOM referrer를 확인합니다."
      },
      {
        command: "cosign verify --key cosign.pub <image>@sha256:<digest>",
        purpose: "공개키 기반으로 digest-pinned container image signature를 검증합니다."
      }
    ],
    riskQueue: riskQueue.sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] - { high: 0, medium: 1, low: 2 }[b.priority])),
    learnerNextSteps: [
      "artifact readiness와 signature material을 먼저 대조해 어떤 산출물을 서명해야 하는지 정하세요.",
      "keyless flow는 certificate identity와 OIDC issuer를 반드시 명시해서 검증하세요.",
      "attestation subject가 실제 artifact digest와 연결되는지 원본 registry나 bundle에서 확인하세요.",
      "이 리포트는 Cosign 실행 결과가 아니라 정적 준비도 리포트입니다. 실제 release 판단에는 cosign verify 계열 명령을 실행하세요."
    ]
  };
}

function provenanceFiles(walk: WalkResult, predicate: (filePath: string) => boolean): string[] {
  return walk.files
    .filter((file) => predicate(file.relPath))
    .map((file) => file.relPath)
    .sort((a, b) => a.localeCompare(b));
}

function isSignatureMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "cosign.sig" || base.endsWith(".sig") || base.endsWith(".signature") || base.endsWith(".pem.sig");
}

function isSigstoreBundleFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "bundle.json" || base === "artifact.sigstore.json" || base.endsWith(".sigstore") || base.endsWith(".sigstore.json") || base.endsWith(".bundle") || base.endsWith(".bundle.json");
}

function isCertificateMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base.endsWith(".crt") || base.endsWith(".cert") || base.endsWith(".cer") || (base.endsWith(".pem") && !isPublicKeyMaterialFile(filePath));
}

function isPublicKeyMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "cosign.pub" || base === "public.key" || base === "public_key.pem" || base.endsWith(".pub");
}

function isTrustedRootMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return base === "trusted_root.json" || base === "trusted-root.json" || base === "sigstore-root.json" || base === "root.json";
}

function isAttestationMaterialFile(filePath: string): boolean {
  const base = path.basename(filePath).toLowerCase();
  return /attestation|predicate|provenance|intoto|in-toto|dsse|slsa/.test(filePath.toLowerCase()) || base.endsWith(".intoto.jsonl") || base.endsWith(".link");
}

async function packageDependencyRangeSignals(walk: WalkResult): Promise<{ total: number; pinned: number; unpinned: number; filePaths: string[]; examples: string[] }> {
  const result = { total: 0, pinned: 0, unpinned: 0, filePaths: [] as string[], examples: [] as string[] };
  const packageJsonFiles = walk.files.filter((file) => path.basename(file.relPath) === "package.json");
  for (const file of packageJsonFiles) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    try {
      const json = JSON.parse(text) as Record<string, Record<string, string> | unknown>;
      for (const section of ["dependencies", "devDependencies", "peerDependencies", "optionalDependencies"]) {
        const dependencies = json[section];
        if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) continue;
        result.filePaths.push(file.relPath);
        for (const [name, version] of Object.entries(dependencies as Record<string, string>)) {
          if (typeof version !== "string") continue;
          result.total += 1;
          if (isPinnedDependencyRange(version)) {
            result.pinned += 1;
          } else {
            result.unpinned += 1;
            if (result.examples.length < 5) result.examples.push(`${name}@${version}`);
          }
        }
      }
    } catch {
      // Ignore malformed package manifests in the static readiness pass.
    }
  }
  result.filePaths = [...new Set(result.filePaths)].sort();
  return result;
}

function isPinnedDependencyRange(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || /workspace:|file:|link:|git\+|github:|latest|\*|x/i.test(trimmed)) return false;
  if (/^[~^<>!=]/.test(trimmed)) return false;
  if (/\s*\|\|\s*|\s+-\s+/.test(trimmed)) return false;
  return /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(trimmed);
}

async function packageJsonScriptSignals(walk: WalkResult): Promise<{ testScripts: number; scriptFiles: string[] }> {
  const scriptFiles: string[] = [];
  let testScripts = 0;
  for (const file of walk.files.filter((candidate) => path.basename(candidate.relPath) === "package.json")) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    try {
      const json = JSON.parse(text) as { scripts?: Record<string, string> };
      for (const [name, command] of Object.entries(json.scripts ?? {})) {
        if (/test|spec|vitest|jest|mocha|tap|ava|playwright|cypress/i.test(`${name} ${command}`)) {
          testScripts += 1;
          scriptFiles.push(file.relPath);
        }
      }
    } catch {
      // Ignore malformed package manifests in the static readiness pass.
    }
  }
  return { testScripts, scriptFiles: [...new Set(scriptFiles)].sort() };
}

async function workflowSafetySignals(workflowFiles: WalkResult["files"]): Promise<{ dangerousFiles: string[]; sastMentions: string[] }> {
  const dangerousFiles: string[] = [];
  const sastMentions: string[] = [];
  for (const file of workflowFiles) {
    const text = await readTextIfSafe(file.absPath, 160_000);
    if (!text) continue;
    if (/pull_request_target/i.test(text) && /(actions\/checkout|github\.event\.pull_request|head_ref|npm\s+(install|ci|test)|yarn|pnpm|pip|bash|sh\s)/i.test(text)) {
      dangerousFiles.push(file.relPath);
    }
    if (/codeql|semgrep|snyk|sonar|static analysis|sast/i.test(text)) {
      sastMentions.push(file.relPath);
    }
  }
  return {
    dangerousFiles: [...new Set(dangerousFiles)].sort(),
    sastMentions: [...new Set(sastMentions)].sort()
  };
}
