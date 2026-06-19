import type { LicenseRightsReport, SbomReport, SecurityReadinessReport } from "@repotutor/shared";
import type { WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

export function buildSecurityReadinessReport(
  walk: WalkResult,
  sbomReport: SbomReport,
  licenseRightsReport: LicenseRightsReport
): SecurityReadinessReport {
  const textFileCount = walk.files.filter((file) => file.isTextCandidate).length;
  const lockfiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "lockfile");
  const containerFiles = sbomReport.fileArtifacts.filter((artifact) => artifact.artifactKind === "container");
  const iacFiles = walk.files.filter((file) => isIacConfigFile(file.relPath));
  const hasPackages = sbomReport.packageArtifacts.length > 0;
  const hasLicenseEvidence = licenseRightsReport.licenseFiles.length > 0 || licenseRightsReport.packageLicenseSignals.length > 0;
  const securitySignals: SecurityReadinessReport["securitySignals"] = [
    ...sbomReport.packageManifests.map((manifest) => ({
      kind: "manifest" as const,
      filePath: manifest.filePath,
      severity: "info" as const,
      message: `${manifest.ecosystem} manifest declares ${manifest.packageCount} package artifact(s).`,
      sourceHref: manifest.sourceHref
    })),
    ...lockfiles.map((artifact) => ({
      kind: "lockfile" as const,
      filePath: artifact.filePath,
      severity: "info" as const,
      message: "Lockfile can improve exact vulnerability matching for language package scanners.",
      sourceHref: artifact.sourceHref
    })),
    ...containerFiles.map((artifact) => ({
      kind: "container-config" as const,
      filePath: artifact.filePath,
      severity: "warn" as const,
      message: "Container build/config file should be scanned for image, package, and misconfiguration risk.",
      sourceHref: artifact.sourceHref
    })),
    ...iacFiles.map((file) => ({
      kind: "iac-config" as const,
      filePath: file.relPath,
      severity: "warn" as const,
      message: "IaC-style config file can be checked by Trivy misconfiguration scanning.",
      sourceHref: `source/${encodedPath(file.relPath)}`
    })),
    ...walk.secretCandidatePaths.map((filePath) => ({
      kind: "secret-candidate" as const,
      filePath,
      severity: "error" as const,
      message: "Secret-like path was excluded from the safe study snapshot and should be scanned in the original repository.",
      sourceHref: "html/security-readiness.html"
    })),
    ...licenseRightsReport.licenseFiles.map((file) => ({
      kind: "license" as const,
      filePath: file.filePath,
      severity: file.detectedSpdxId ? "info" as const : "warn" as const,
      message: file.detectedSpdxId ? `License evidence detected as ${file.detectedSpdxId}.` : "License file exists but needs human classification.",
      sourceHref: file.sourceHref
    })),
    {
      kind: "sbom" as const,
      filePath: "analysis/sbom-report.json",
      severity: hasPackages ? "info" as const : "warn" as const,
      message: hasPackages ? `${sbomReport.packageArtifacts.length} package artifact(s) are available for scanner handoff.` : "No package artifact inventory is available.",
      sourceHref: "html/sbom.html"
    }
  ];

  const scannerTargets: SecurityReadinessReport["scannerTargets"] = [
    {
      target: "filesystem",
      readiness: textFileCount > 0 ? "ready" : "missing",
      evidence: textFileCount > 0 ? `${textFileCount} safe text file(s) are available in the study snapshot.` : "No safe text files are available to scan.",
      relatedHref: "html/files.html"
    },
    {
      target: "git-repository",
      readiness: "partial",
      evidence: "RepoTutor preserves branch/commit metadata, but the safe study source removes .git history; scan the original repository for full git context.",
      relatedHref: "html/project-activity.html"
    },
    {
      target: "container-image",
      readiness: containerFiles.length > 0 ? "partial" : "missing",
      evidence: containerFiles.length > 0 ? `${containerFiles.length} container config file(s) found; built image scanning still requires an image reference.` : "No Dockerfile or docker-compose file was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      target: "kubernetes",
      readiness: iacFiles.some((file) => /k8s|kubernetes|helm|chart|deployment|service/i.test(file.relPath)) ? "partial" : "missing",
      evidence: iacFiles.length > 0 ? `${iacFiles.length} IaC-like config file(s) found; Kubernetes readiness depends on actual manifest type.` : "No Kubernetes or IaC config file was detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      target: "sbom",
      readiness: hasPackages ? "ready" : "missing",
      evidence: hasPackages ? `${sbomReport.packageArtifacts.length} package artifact(s) are available in the static SBOM report.` : "No package artifacts are available for SBOM target scanning.",
      relatedHref: "html/sbom.html"
    }
  ];

  const scannerCoverage: SecurityReadinessReport["scannerCoverage"] = [
    {
      scanner: "vulnerability",
      readiness: hasPackages && lockfiles.length > 0 ? "ready" : hasPackages ? "partial" : "missing",
      evidence: hasPackages && lockfiles.length > 0 ? `${lockfiles.length} lockfile(s) and ${sbomReport.packageArtifacts.length} package artifact(s) found.` : hasPackages ? "Package manifests exist, but no lockfile was detected for exact resolved versions." : "No package artifacts were detected.",
      relatedHref: "html/sbom.html"
    },
    {
      scanner: "secret",
      readiness: textFileCount > 0 ? "ready" : "missing",
      evidence: textFileCount > 0 ? `Secret scanning can inspect ${textFileCount} safe text file(s); excluded secret-like paths must be scanned in the original source.` : "No text files are available for secret scanning.",
      relatedHref: "html/security-readiness.html"
    },
    {
      scanner: "misconfiguration",
      readiness: containerFiles.length > 0 || iacFiles.length > 0 ? "ready" : "missing",
      evidence: containerFiles.length > 0 || iacFiles.length > 0 ? `${containerFiles.length} container config and ${iacFiles.length} IaC config file(s) found.` : "No Docker, Kubernetes, Terraform, CloudFormation, or Helm-style config files were detected.",
      relatedHref: "html/runtime-environment.html"
    },
    {
      scanner: "license",
      readiness: hasLicenseEvidence ? "ready" : "missing",
      evidence: hasLicenseEvidence ? "License evidence is available from License Rights report." : "No license file or package license signal was detected.",
      relatedHref: "html/license-rights.html"
    },
    {
      scanner: "sbom",
      readiness: hasPackages ? "ready" : "missing",
      evidence: hasPackages ? "Static SBOM package artifacts are available for handoff." : "No package artifacts are available.",
      relatedHref: "html/sbom.html"
    }
  ];

  const actionQueue: SecurityReadinessReport["actionQueue"] = [];
  if (hasPackages && lockfiles.length === 0) {
    actionQueue.push({
      priority: "high",
      action: "Add or verify a package lockfile before vulnerability triage.",
      why: "Trivy vulnerability matching is more precise when resolved package versions are known.",
      relatedHref: "html/sbom.html"
    });
  }
  if (!hasLicenseEvidence) {
    actionQueue.push({
      priority: "high",
      action: "Add or verify project license evidence.",
      why: "Trivy can classify licenses, but the project first needs discoverable license evidence.",
      relatedHref: "html/license-rights.html"
    });
  }
  if (containerFiles.length === 0 && iacFiles.length === 0) {
    actionQueue.push({
      priority: "medium",
      action: "Record deployment artifacts if this project ships containers or infrastructure.",
      why: "Misconfiguration scanning needs Docker, Kubernetes, Terraform, CloudFormation, or similar config files.",
      relatedHref: "html/runtime-environment.html"
    });
  }
  actionQueue.push({
    priority: "low",
    action: "Run the real scanner outside RepoTutor when security decisions matter.",
    why: "This report is readiness metadata only and does not query vulnerability databases or scan secrets.",
    relatedHref: "html/security-readiness.html"
  });

  return {
    summary: `Trivy식 security readiness report: targets ${scannerTargets.length}개, scanner coverage ${scannerCoverage.length}개, security signal ${securitySignals.length}개, action ${actionQueue.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Trivy targets scanners vulnerability secret misconfiguration license SBOM severity security readiness",
    scannerTargets,
    scannerCoverage,
    securitySignals,
    actionQueue,
    recommendedCommands: [
      {
        command: "trivy fs --scanners vuln,secret,misconfig,license <project>",
        purpose: "Filesystem snapshot에서 vulnerability, secret, misconfiguration, license scanner를 함께 실행합니다."
      },
      {
        command: "trivy repo --scanners vuln,secret,misconfig,license <git-url>",
        purpose: "원본 Git repository를 대상으로 safe study snapshot에서 빠진 git context와 secret-like paths를 확인합니다."
      },
      {
        command: "trivy sbom <sbom-file>",
        purpose: "실제 CycloneDX/SPDX/Syft SBOM 파일이 있을 때 SBOM target으로 재검토합니다."
      }
    ],
    learnerNextSteps: [
      "readiness가 partial인 scanner는 왜 partial인지 evidence를 먼저 읽으세요.",
      "이 report는 취약점 결과가 아닙니다. 실제 CVE, secret, misconfig 판단은 Trivy 같은 스캐너 실행이 필요합니다.",
      "safe study snapshot에서 제외된 secret-like paths는 원본 저장소에서 별도 스캔하세요.",
      "license와 SBOM report를 함께 보고 공개/배포 전 누락된 evidence를 보강하세요."
    ]
  };
}

function isIacConfigFile(filePath: string): boolean {
  return /(^|\/)(Dockerfile|docker-compose\.ya?ml|compose\.ya?ml|kubernetes|k8s|helm|charts?|terraform|\.tf$|serverless\.ya?ml|cloudformation|template\.ya?ml)/i.test(filePath)
    || /\.(tf|tfvars|ya?ml)$/i.test(filePath) && /(apiVersion|kind:|Resources:|provider|resource|module|helm)/i.test(filePath);
}

