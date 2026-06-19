import path from "node:path";
import type { CoverageReport, IncrementalReport, SourceSnapshotReport, StudySession } from "@repotutor/shared";
import { pathExists } from "./fs-utils.js";
import { readJson } from "./storage.js";
import { listSessions } from "./sessions.js";

interface PreviousAnalysis {
  session: StudySession;
  snapshot: SourceSnapshotReport;
  coverageReport: CoverageReport | null;
}

export async function findPreviousSnapshot(studiesRoot: string, current: StudySession): Promise<PreviousAnalysis | null> {
  const sessions = await listSessions(studiesRoot);
  for (const session of sessions) {
    if (session.sessionId === current.sessionId) continue;
    if (session.owner !== current.owner || session.repo !== current.repo) continue;
    if (session.status !== "complete") continue;
    const snapshotPath = path.join(session.outputPaths.root, "analysis", "source-snapshot-report.json");
    if (!await pathExists(snapshotPath)) continue;
    const coveragePath = path.join(session.outputPaths.root, "analysis", "coverage-report.json");
    return {
      session,
      snapshot: await readJson<SourceSnapshotReport>(snapshotPath),
      coverageReport: await pathExists(coveragePath) ? await readJson<CoverageReport>(coveragePath) : null
    };
  }
  return null;
}

export function buildIncrementalReport(current: SourceSnapshotReport, currentCoverage: CoverageReport, previous: PreviousAnalysis | null): IncrementalReport {
  const coverageDelta = buildCoverageDelta(currentCoverage, previous?.coverageReport ?? null);
  if (!previous) {
    return {
      baselineSessionId: null,
      baselinePath: null,
      addedFiles: [],
      changedFiles: [],
      removedFiles: [],
      unchangedFiles: current.files.map((file) => file.filePath),
      coverageDelta,
      summary: "이 저장소의 비교 기준 이전 세션이 아직 없습니다.",
      beginnerExplanation: "incremental report는 같은 repo를 다시 분석했을 때 파일 변화만 빠르게 파악하기 위한 리포트입니다. 첫 분석에서는 비교할 이전 세션이 없으므로 모든 추적 파일을 현재 기준으로 저장합니다."
    };
  }

  const before = new Map(previous.snapshot.files.map((file) => [file.filePath, file]));
  const after = new Map(current.files.map((file) => [file.filePath, file]));
  const addedFiles: string[] = [];
  const changedFiles: string[] = [];
  const removedFiles: string[] = [];
  const unchangedFiles: string[] = [];

  for (const [filePath, file] of after) {
    const old = before.get(filePath);
    if (!old) addedFiles.push(filePath);
    else if (old.sha256 !== file.sha256 || old.size !== file.size) changedFiles.push(filePath);
    else unchangedFiles.push(filePath);
  }
  for (const filePath of before.keys()) {
    if (!after.has(filePath)) removedFiles.push(filePath);
  }

  return {
    baselineSessionId: previous.session.sessionId,
    baselinePath: previous.session.outputPaths.root,
    addedFiles,
    changedFiles,
    removedFiles,
    unchangedFiles,
    coverageDelta,
    summary: `이전 세션 ${previous.session.sessionId} 대비 추가 ${addedFiles.length}개, 변경 ${changedFiles.length}개, 삭제 ${removedFiles.length}개, 유지 ${unchangedFiles.length}개입니다.`,
    beginnerExplanation: "추가(added)는 새로 생긴 파일, 변경(changed)은 내용이나 크기가 달라진 파일, 삭제(removed)는 이전 세션에는 있었지만 현재에는 없는 파일입니다. 이 리포트는 다음 학습 때 다시 볼 부분을 좁히는 데 사용합니다."
  };
}

function buildCoverageDelta(current: CoverageReport, previous: CoverageReport | null): IncrementalReport["coverageDelta"] {
  if (!previous) {
    return {
      baselineCoverageRatio: null,
      currentCoverageRatio: current.coverageRatio,
      coverageRatioDelta: null,
      baselineCoveredImportantFiles: null,
      currentCoveredImportantFiles: current.coveredImportantFiles,
      coveredImportantFilesDelta: null,
      baselineTotalScannedFiles: null,
      currentTotalScannedFiles: current.totalScannedFiles,
      totalScannedFilesDelta: null,
      summary: "이전 세션의 coverage report가 없어 커버리지 변화량은 아직 계산하지 않습니다."
    };
  }
  const ratioDelta = current.coverageRatio - previous.coverageRatio;
  const coveredDelta = current.coveredImportantFiles - previous.coveredImportantFiles;
  const totalDelta = current.totalScannedFiles - previous.totalScannedFiles;
  return {
    baselineCoverageRatio: previous.coverageRatio,
    currentCoverageRatio: current.coverageRatio,
    coverageRatioDelta: ratioDelta,
    baselineCoveredImportantFiles: previous.coveredImportantFiles,
    currentCoveredImportantFiles: current.coveredImportantFiles,
    coveredImportantFilesDelta: coveredDelta,
    baselineTotalScannedFiles: previous.totalScannedFiles,
    currentTotalScannedFiles: current.totalScannedFiles,
    totalScannedFilesDelta: totalDelta,
    summary: `커버리지 비율은 ${(previous.coverageRatio * 100).toFixed(1)}%에서 ${(current.coverageRatio * 100).toFixed(1)}%로 ${(ratioDelta * 100).toFixed(1)}%p 변했습니다.`
  };
}
