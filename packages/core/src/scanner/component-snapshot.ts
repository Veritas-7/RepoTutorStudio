import path from "node:path";
import { htmlAnchor } from "@repotutor/shared";
import type { ComponentGraphReport, FileLesson, FolderLesson, GlossaryTerm, RebuildRoadmap, SourceSnapshotReport } from "@repotutor/shared";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
export function buildComponentGraphReport(folderLessons: FolderLesson[], fileLessons: FileLesson[], glossary: GlossaryTerm[], rebuildRoadmap: RebuildRoadmap): ComponentGraphReport {
  const nodes: ComponentGraphReport["nodes"] = [{
    id: "root",
    type: "root",
    label: "repo root",
    path: ".",
    summary: "분석 대상 저장소의 시작점입니다.",
    href: "index.html"
  }];
  const edges: ComponentGraphReport["edges"] = [];

  for (const folder of folderLessons.slice(0, 20)) {
    const id = nodeId("folder", folder.folderPath);
    nodes.push({
      id,
      type: "folder",
      label: folder.folderPath,
      path: folder.folderPath,
      summary: folder.role,
      href: `folders.html#${htmlAnchor(folder.folderPath)}`
    });
    edges.push({ from: "root", to: id, label: "contains" });
  }

  for (const file of fileLessons.slice(0, 35)) {
    const id = nodeId("file", file.filePath);
    nodes.push({
      id,
      type: "file",
      label: file.filePath,
      path: file.filePath,
      summary: file.role,
      href: `files.html#${htmlAnchor(file.filePath)}`
    });
    const folder = closestFolderForFile(file.filePath, folderLessons);
    edges.push({ from: folder ? nodeId("folder", folder.folderPath) : "root", to: id, label: "explains file" });
  }

  for (const term of glossary.slice(0, 20)) {
    const id = nodeId("term", term.termEn);
    nodes.push({
      id,
      type: "term",
      label: `${term.termKo} (${term.termEn})`,
      path: null,
      summary: term.simpleDefinition,
      href: `glossary.html#${htmlAnchor(term.termEn)}`
    });
    const matchingFile = fileLessons.find((file) => file.glossaryTerms.some((value) => value.includes(term.termKo) || value.includes(term.termEn)));
    edges.push({ from: matchingFile ? nodeId("file", matchingFile.filePath) : "root", to: id, label: "uses term" });
  }

  for (const step of rebuildRoadmap.steps.slice(0, 10)) {
    const id = nodeId("step", String(step.order));
    nodes.push({
      id,
      type: "rebuild-step",
      label: `${step.order}. ${step.title}`,
      path: null,
      summary: step.goal,
      href: "rebuild.html"
    });
    const relatedFile = fileLessons.find((file) => step.relatedSourcePaths.some((sourcePath) => file.filePath === sourcePath || file.filePath.startsWith(`${sourcePath}/`)));
    edges.push({ from: relatedFile ? nodeId("file", relatedFile.filePath) : "root", to: id, label: "rebuilds through" });
  }

  const mermaidEdges = edges.slice(0, 80).map((edge) => `  ${edge.from}["${labelForMermaid(nodes, edge.from)}"] -->|${edge.label}| ${edge.to}["${labelForMermaid(nodes, edge.to)}"]`).join("\n");
  return {
    nodes,
    edges,
    summary: buildComponentGraphSummary(nodes, edges),
    entryNodeIds: ["root", ...fileLessons.filter((file) => /main|index|cli|app/i.test(path.basename(file.filePath))).slice(0, 5).map((file) => nodeId("file", file.filePath))],
    mermaid: `flowchart TD\n${mermaidEdges || "  root[\"repo root\"]"}`,
    beginnerExplanation: "component graph는 폴더, 핵심 파일, 용어, 재구현 단계를 하나의 관계도로 묶습니다. 학습자는 한 파일이 어느 폴더에 속하고 어떤 용어와 구현 단계로 이어지는지 한눈에 따라갈 수 있습니다."
  };
}

function buildComponentGraphSummary(nodes: ComponentGraphReport["nodes"], edges: ComponentGraphReport["edges"]): ComponentGraphReport["summary"] {
  const nodeTypeCounts = countBy(nodes.map((node) => node.type));
  const edgeLabelCounts = countBy(edges.map((edge) => edge.label));
  const degree = new Map<string, number>();
  for (const edge of edges) {
    degree.set(edge.from, (degree.get(edge.from) ?? 0) + 1);
    degree.set(edge.to, (degree.get(edge.to) ?? 0) + 1);
  }
  const topConnectedNodes = nodes
    .map((node) => ({ id: node.id, label: node.label, type: node.type, degree: degree.get(node.id) ?? 0 }))
    .sort((a, b) => b.degree - a.degree || a.label.localeCompare(b.label))
    .slice(0, 8);
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    nodeTypeCounts,
    edgeLabelCounts,
    topConnectedNodes,
    largeRepoAdvice: "큰 저장소에서는 먼저 연결 수가 높은 노드와 file/folder 필터를 보고, 그 다음 rebuild-step과 term 노드로 학습 순서를 좁히세요."
  };
}

function countBy(values: string[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) counts[value] = (counts[value] ?? 0) + 1;
  return counts;
}

export async function buildSourceSnapshotReport(walk: WalkResult): Promise<SourceSnapshotReport> {
  const files = [];
  for (const file of walk.files.filter((candidate) => candidate.isTextCandidate)) {
    const text = await readTextIfSafe(file.absPath);
    files.push({
      filePath: file.relPath,
      size: file.size,
      sha256: text === null ? `untracked-${file.size}` : await sha256(text),
      tracked: text !== null
    });
  }
  return {
    createdAt: new Date().toISOString(),
    totalFiles: files.length,
    files: files.sort((a, b) => a.filePath.localeCompare(b.filePath))
  };
}

async function sha256(text: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(text).digest("hex");
}

function nodeId(prefix: string, value: string): string {
  return `${prefix}_${htmlAnchor(value).replace(/-/g, "_")}`;
}

function closestFolderForFile(filePath: string, folderLessons: FolderLesson[]): FolderLesson | null {
  return folderLessons
    .filter((folder) => filePath.startsWith(`${folder.folderPath}/`))
    .sort((a, b) => b.folderPath.length - a.folderPath.length)[0] ?? null;
}

function labelForMermaid(nodes: ComponentGraphReport["nodes"], id: string): string {
  const label = nodes.find((node) => node.id === id)?.label ?? id;
  return label.replaceAll("\"", "'");
}
