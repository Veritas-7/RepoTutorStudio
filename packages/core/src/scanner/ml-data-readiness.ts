import type { DataAnnotationReadinessReport, FeatureStoreReadinessReport, LakehouseTableReadinessReport, ModelRegistryReadinessReport } from "@repotutor/shared";
import path from "node:path";
import { readTextIfSafe, type WalkResult } from "../fs-utils.js";
import { encodedPath } from "./source-links.js";

function countMatches(text: string, pattern: RegExp): number {
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);
  return [...text.matchAll(globalPattern)].length;
}

export async function buildDataAnnotationReadinessReport(walk: WalkResult): Promise<DataAnnotationReadinessReport> {
  const sourceFiles = await dataAnnotationSourceFiles(walk);
  const annotationSetups = dataAnnotationSetupsFromSources(sourceFiles);
  const platformSignals = dataAnnotationPlatformSignals(sourceFiles);
  const projectSignals = dataAnnotationProjectSignals(sourceFiles);
  const taskSignals = dataAnnotationTaskSignals(sourceFiles);
  const schemaSignals = dataAnnotationSchemaSignals(sourceFiles);
  const workflowSignals = dataAnnotationWorkflowSignals(sourceFiles);
  const qualitySignals = dataAnnotationQualitySignals(sourceFiles);
  const prelabelSignals = dataAnnotationPrelabelSignals(sourceFiles);
  const exportSignals = dataAnnotationExportSignals(sourceFiles);
  const ciSignals = dataAnnotationCiSignals(sourceFiles);
  const packageSignals = dataAnnotationPackageSignals(sourceFiles);

  const hasProject = projectSignals.filter((item) => item.readiness === "ready").length >= 2 || annotationSetups.some((item) => item.projectCount > 0);
  const hasTask = taskSignals.some((item) => item.readiness === "ready") || annotationSetups.some((item) => item.taskCount > 0);
  const hasSchema = schemaSignals.filter((item) => item.readiness === "ready").length >= 2 || annotationSetups.some((item) => item.schemaCount > 0 && item.labelCount > 0);
  const hasWorkflow = workflowSignals.some((item) => item.readiness === "ready") || annotationSetups.some((item) => item.workflowCount > 0);
  const hasQuality = qualitySignals.some((item) => item.readiness === "ready") || annotationSetups.some((item) => item.qualityCount + item.reviewCount > 0);
  const hasPrelabel = prelabelSignals.some((item) => item.readiness === "ready") || annotationSetups.some((item) => item.prelabelCount > 0);
  const hasExport = exportSignals.some((item) => item.readiness === "ready") || annotationSetups.some((item) => item.exportCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || annotationSetups.some((item) => item.ciCount > 0);

  const riskQueue: DataAnnotationReadinessReport["riskQueue"] = [];
  if (!hasProject || !hasSchema || !hasTask) {
    riskQueue.push({
      priority: "high",
      action: "Add annotation project, task or record import, and label/question schema evidence before claiming annotation readiness.",
      why: "A labeling workflow is not reproducible if learners cannot find the project boundary, units to label, and schema contract.",
      relatedHref: "html/data-annotation-readiness.html"
    });
  }
  if (hasProject && !hasWorkflow) {
    riskQueue.push({
      priority: "high",
      action: "Document annotate, load_annotations, submit response, draft, review, consensus, or active-learning workflow calls.",
      why: "Project setup alone does not prove that labels can move through the annotation lifecycle.",
      relatedHref: "html/data-annotation-readiness.html"
    });
  }
  if (hasWorkflow && !hasQuality) {
    riskQueue.push({
      priority: "medium",
      action: "Add agreement, consensus, disagreement, confidence, validation, evaluation, metrics, or review queue evidence.",
      why: "Annotation outputs need quality controls before they can safely train or evaluate models.",
      relatedHref: "html/data-annotation-readiness.html"
    });
  }
  if (hasWorkflow && !hasPrelabel) {
    riskQueue.push({
      priority: "low",
      action: "Consider adding predictions, suggestions, embeddings, similarity search, or active learning to reduce labeling cost.",
      why: "Model-assisted prelabeling is not mandatory, but it makes large annotation loops easier to operate.",
      relatedHref: "html/data-annotation-readiness.html"
    });
  }
  if (hasWorkflow && !hasExport) {
    riskQueue.push({
      priority: "medium",
      action: "Add export evidence for JSON, CSV, COCO, YOLO, FiftyOneDataset, storage, or downstream training handoff.",
      why: "Labels are hard to use if the repository does not show how annotations leave the tool.",
      relatedHref: "html/data-annotation-readiness.html"
    });
  }
  if ((hasQuality || hasExport) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run annotation import, schema, quality, and export smoke checks in CI and upload artifacts.",
      why: "Annotation workflows should be reproducible outside local UI sessions.",
      relatedHref: "html/data-annotation-readiness.html"
    });
  }

  return {
    summary: `Data annotation readiness report: annotation setup ${annotationSetups.length}개, project signal ${projectSignals.length}개, workflow signal ${workflowSignals.length}개, quality signal ${qualitySignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Data annotation readiness Label Studio FiftyOne Argilla annotation labeling label_config annotate load_annotations FeedbackDataset questions suggestions responses agreement consensus review export CI",
    annotationSetups,
    platformSignals,
    projectSignals,
    taskSignals,
    schemaSignals,
    workflowSignals,
    qualitySignals,
    prelabelSignals,
    exportSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"label_config|LabelInterface|annotate\\(|load_annotations|FeedbackDataset|rg\\.Dataset|LabelQuestion|TextQuestion\" .", purpose: "Find annotation tools, labeling interfaces, and question/schema definitions." },
      { command: "rg \"tasks|records|samples|metadata|maximum_annotations|overlap|bulk|assignment|filter_by\" .", purpose: "Find task, record, sample, assignment, overlap, and filtering evidence." },
      { command: "rg \"prediction|suggestion|show_collab_predictions|compute_similarity|embedding|weak supervision|active learning\" .", purpose: "Find prelabel, model-assisted, embedding, and active learning evidence." },
      { command: "rg \"agreement|consensus|disagreement|review|ground_truth|evaluate_detections|evaluate_classifications|validation|metrics\" .", purpose: "Find quality control and review evidence." },
      { command: "rg \"export|load_annotations|dataset\\.export|COCO|YOLO|FiftyOneDataset|upload-artifact|annotation smoke\" .github workflows .", purpose: "Find export, downstream handoff, and CI artifact evidence." }
    ],
    learnerNextSteps: [
      "먼저 Label Studio, FiftyOne, Argilla, CVAT, Labelbox 또는 custom annotation workflow 파일이 있는지 찾으세요.",
      "project/dataset/workspace, tasks/records/samples, label_config/question/schema가 같은 workflow 안에서 연결되는지 확인하세요.",
      "annotate, load_annotations, submit response, draft, review, consensus, ground truth, active learning 흐름이 반복 가능한지 확인하세요.",
      "agreement, disagreement, review queue, validation, evaluation, metrics로 label 품질을 검증하는지 확인하세요.",
      "prediction/suggestion prelabel과 JSON/CSV/COCO/YOLO/FiftyOneDataset export, CI smoke artifact가 있는지 확인하세요."
    ]
  };
}

type DataAnnotationSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function dataAnnotationSourceFiles(walk: WalkResult): Promise<DataAnnotationSourceFile[]> {
  const rows: DataAnnotationSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!dataAnnotationInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!dataAnnotationPathSignal(file.relPath) && !dataAnnotationContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function dataAnnotationInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|label_config\.(xml|json|ya?ml)|annotation_config\.json|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(label[-_]?studio|labelstudio|fiftyone|fifty-one|argilla|cvat|labelbox|annotation|annotations|annotator|labeling|labels|ground_truth|predictions|feedback|review|consensus|agreement|suggestions?|responses?|exports?)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|xml|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|py|ipynb|java|scala|kt|go|rs)$/i.test(filePath);
}

function dataAnnotationPathSignal(filePath: string): boolean {
  return /(^|\/)(label[-_]?studio|labelstudio|fiftyone|fifty-one|argilla|cvat|labelbox|annotation|annotations|annotator|labeling|ground_truth|predictions|feedback|review|consensus|agreement|suggestions?|responses?|exports?)(\/|\.|-|_|$)/i.test(filePath)
    || /^(label_config\.(xml|json|ya?ml)|annotation_config\.json)$/i.test(path.basename(filePath));
}

function dataAnnotationContentSignal(text: string): boolean {
  return /Label Studio|label[-_]?studio|label_config|FiftyOne|load_annotations|annotate\(|Argilla|FeedbackDataset|rg\.Dataset|LabelQuestion|TextQuestion|annotation|labeling workflow|inter-annotator|agreement|consensus|ground_truth|prediction|suggestion|COCO|YOLO|annotation smoke/i.test(text);
}

function dataAnnotationSetupsFromSources(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["annotationSetups"] {
  const rows: DataAnnotationReadinessReport["annotationSetups"] = [];
  for (const source of sourceFiles) {
    const projectCount = countMatches(source.text, /projects?\.create|Project\b|project_id|project title|dataset\s*=|fo\.Dataset|rg\.Dataset|FeedbackDataset|workspace|guidelines|labeling interface|task template/gi);
    const taskCount = countMatches(source.text, /tasks?|records?|samples?|import_tasks|records\.log|add_sample|metadata|assignment|assignee|annotators?|maximum_annotations|overlap|bulk|filter_by|match_tags/gi);
    const schemaCount = countMatches(source.text, /label_config|LABEL_CONFIG|LABEL_CONFIG_XML|LabelInterface|<View|<Choices|<RectangleLabels|<BrushLabels|<TextArea|LabelQuestion|MultiLabelQuestion|RatingQuestion|TextQuestion|RankingQuestion|questions|taxonomy/gi);
    const labelCount = countMatches(source.text, /Label\b|Choice\b|classes|labels|categories|annotations|ground_truth|Detections|Classification|Bbox|bbox|mask|span/gi);
    const workflowCount = countMatches(source.text, /annotate\(|annotations\.create|load_annotations|submit response|submit_response|responses?|save draft|draft|review|consensus|ground_truth|active learning/gi);
    const qualityCount = countMatches(source.text, /inter[- ]annotator|agreement_annotator|total_agreement|agreement|consensus|disagreement|review queue|confidence|evaluate_detections|evaluate_classifications|evaluation|validation|metrics|quality-check/gi);
    const prelabelCount = countMatches(source.text, /predictions?|suggestions?|show_collab_predictions|compute_similarity|embedding|VectorSettings|weak supervision|active learning|model-assisted|prelabel/gi);
    const reviewCount = countMatches(source.text, /review|consensus|disagreement|ground_truth|pending|draft|response_status|approve|reject|human consensus/gi);
    const exportCount = countMatches(source.text, /export|dataset\.export|JSON|CSV|COCO|YOLO|FiftyOneDataset|COCODetectionDataset|YOLOv5Dataset|storage|download|downstream/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|annotation smoke|import-smoke|export-smoke|schema-check|quality-check|upload-artifact|annotation-report|pytest/gi);
    const totalSignals = projectCount + taskCount + schemaCount + labelCount + workflowCount + qualityCount + prelabelCount + reviewCount + exportCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: dataAnnotationTool(source),
      projectCount,
      taskCount,
      schemaCount,
      labelCount,
      workflowCount,
      qualityCount,
      prelabelCount,
      reviewCount,
      exportCount,
      ciCount,
      readiness: projectCount > 0 && taskCount > 0 && (schemaCount + labelCount) > 0 && workflowCount > 0 && (qualityCount + reviewCount) > 0 && exportCount > 0 && ciCount > 0 ? "ready" : "partial",
      evidence: `${totalSignals} data annotation readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.projectCount + b.taskCount + b.schemaCount + b.labelCount + b.workflowCount + b.qualityCount + b.prelabelCount + b.reviewCount + b.exportCount + b.ciCount) - (a.projectCount + a.taskCount + a.schemaCount + a.labelCount + a.workflowCount + a.qualityCount + a.prelabelCount + a.reviewCount + a.exportCount + a.ciCount))
    .slice(0, 60);
}

function dataAnnotationTool(source: DataAnnotationSourceFile): DataAnnotationReadinessReport["annotationSetups"][number]["tool"] {
  if (/label[-_]?studio|labelstudio/i.test(source.filePath) || /Label Studio|label_studio|label_config|show_collab_predictions|maximum_annotations/i.test(source.text)) return "label-studio";
  if (/fiftyone|fifty-one/i.test(source.filePath) || /FiftyOne|fiftyone|fo\.Dataset|load_annotations|compute_similarity|FiftyOneDataset|COCODetectionDataset|YOLOv5Dataset/i.test(source.text)) return "fiftyone";
  if (/argilla/i.test(source.filePath) || /Argilla|argilla|rg\.Dataset|FeedbackDataset|LabelQuestion|TextQuestion|Suggestion|Response|VectorSettings/i.test(source.text)) return "argilla";
  if (/cvat/i.test(source.filePath) || /CVAT|cvat/i.test(source.text)) return "cvat";
  if (/labelbox/i.test(source.filePath) || /Labelbox|labelbox/i.test(source.text)) return "labelbox";
  if (/annotation|labeling|annotator|labels/i.test(source.filePath) || /annotation|labeling workflow|annotator|ground_truth/i.test(source.text)) return "custom";
  return "unknown";
}

function dataAnnotationPlatformSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["platformSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["platformSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "label-studio", pattern: /label[-_]?studio|label_studio|Label Studio|label_config/i, evidence: "Label Studio package/API evidence was detected." },
    { signal: "fiftyone", pattern: /fiftyone|FiftyOne|fo\.Dataset|load_annotations/i, evidence: "FiftyOne package/API evidence was detected." },
    { signal: "argilla", pattern: /argilla|Argilla|rg\.Dataset|FeedbackDataset|LabelQuestion/i, evidence: "Argilla package/API evidence was detected." },
    { signal: "cvat", pattern: /cvat|CVAT/i, evidence: "CVAT evidence was detected." },
    { signal: "labelbox", pattern: /labelbox|Labelbox/i, evidence: "Labelbox evidence was detected." },
    { signal: "custom", pattern: /annotation|labeling workflow|annotator|ground_truth/i, evidence: "custom annotation workflow evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "platform", "signal");
}

function dataAnnotationProjectSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["projectSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["projectSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "project", pattern: /projects?\.create|Project\b|project_id|project title/i, evidence: "annotation project evidence was detected." },
    { signal: "dataset", pattern: /Dataset|dataset|FeedbackDataset/i, evidence: "annotation dataset evidence was detected." },
    { signal: "workspace", pattern: /workspace|Workspace/i, evidence: "workspace evidence was detected." },
    { signal: "labeling-interface", pattern: /label_config|LABEL_CONFIG|LabelInterface|<View|labeling interface/i, evidence: "labeling interface evidence was detected." },
    { signal: "task-template", pattern: /task template|template|labeling interface|question template/i, evidence: "task template evidence was detected." },
    { signal: "guidelines", pattern: /guidelines|annotation guideline|labeling instruction/i, evidence: "annotation guideline evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "project", "signal");
}

function dataAnnotationTaskSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["taskSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["taskSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "task", pattern: /tasks?|Task\b|import_tasks/i, evidence: "task evidence was detected." },
    { signal: "record", pattern: /records?|Record\b|records\.log/i, evidence: "record evidence was detected." },
    { signal: "sample", pattern: /samples?|Sample\b|add_sample/i, evidence: "sample evidence was detected." },
    { signal: "import", pattern: /import_tasks|import traces|tasks\.create|records\.log|dataset\.add_sample/i, evidence: "task/record import evidence was detected." },
    { signal: "metadata", pattern: /metadata|meta fields|context fields/i, evidence: "metadata evidence was detected." },
    { signal: "assignment", pattern: /assignment|assignee|annotator|annotators|assigned/i, evidence: "assignment evidence was detected." },
    { signal: "overlap", pattern: /overlap|maximum_annotations|min_submitted|agreement/i, evidence: "overlap/agreement sampling evidence was detected." },
    { signal: "bulk", pattern: /bulk|batch|Bulk/i, evidence: "bulk operation evidence was detected." },
    { signal: "filter", pattern: /filter_by|match_tags|filter|view\.match/i, evidence: "filter/view evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "task", "signal");
}

function dataAnnotationSchemaSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "label-config", pattern: /label_config|LABEL_CONFIG|LABEL_CONFIG_XML|LabelInterface|<View/i, evidence: "label config evidence was detected." },
    { signal: "question", pattern: /LabelQuestion|MultiLabelQuestion|RatingQuestion|TextQuestion|RankingQuestion|questions/i, evidence: "question schema evidence was detected." },
    { signal: "choice", pattern: /<Choices|Choice\b|choices|labels|classes/i, evidence: "choice/label option evidence was detected." },
    { signal: "taxonomy", pattern: /taxonomy|Taxonomy|hierarchical labels/i, evidence: "taxonomy evidence was detected." },
    { signal: "bounding-box", pattern: /RectangleLabels|bounding box|bbox|Detections|BoundingBox/i, evidence: "bounding box evidence was detected." },
    { signal: "segmentation", pattern: /BrushLabels|PolygonLabels|segmentation|mask/i, evidence: "segmentation evidence was detected." },
    { signal: "span", pattern: /Labels|TextArea|span|named entity|NER|token/i, evidence: "text span evidence was detected." },
    { signal: "ranking", pattern: /RankingQuestion|ranking|rank/i, evidence: "ranking question evidence was detected." },
    { signal: "rating", pattern: /RatingQuestion|rating|score/i, evidence: "rating question evidence was detected." },
    { signal: "text-response", pattern: /TextQuestion|TextArea|free text|response text/i, evidence: "text response evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function dataAnnotationWorkflowSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["workflowSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["workflowSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "annotate", pattern: /annotate\(|annotations\.create|annotation workflow|start annotation/i, evidence: "annotate workflow evidence was detected." },
    { signal: "load-annotations", pattern: /load_annotations|load annotations|import annotations/i, evidence: "load annotations evidence was detected." },
    { signal: "submit-response", pattern: /submit response|submit_response|Response\b|responses\.create/i, evidence: "response submission evidence was detected." },
    { signal: "draft", pattern: /draft|save as draft|save_draft/i, evidence: "draft response evidence was detected." },
    { signal: "review", pattern: /review|review queue|human review/i, evidence: "review workflow evidence was detected." },
    { signal: "consensus", pattern: /consensus|human consensus/i, evidence: "consensus workflow evidence was detected." },
    { signal: "ground-truth", pattern: /ground_truth|ground truth|gold label/i, evidence: "ground truth evidence was detected." },
    { signal: "active-learning", pattern: /active learning|compute_similarity|uncertainty sampling|unique sample/i, evidence: "active learning evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "workflow", "signal");
}

function dataAnnotationQualitySignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["qualitySignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["qualitySignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "inter-annotator-agreement", pattern: /inter[- ]annotator|agreement_annotator|total_agreement|annotator agreement/i, evidence: "inter-annotator agreement evidence was detected." },
    { signal: "consensus", pattern: /consensus|human consensus/i, evidence: "consensus evidence was detected." },
    { signal: "disagreement", pattern: /disagreement|conflict|different annotators/i, evidence: "disagreement evidence was detected." },
    { signal: "review-queue", pattern: /review queue|pending review|review/i, evidence: "review queue evidence was detected." },
    { signal: "confidence-score", pattern: /confidence|score|prediction score/i, evidence: "confidence score evidence was detected." },
    { signal: "evaluation", pattern: /evaluate_detections|evaluate_classifications|evaluation|eval_key/i, evidence: "evaluation evidence was detected." },
    { signal: "validation", pattern: /validation|validate|schema-check|quality-check/i, evidence: "validation evidence was detected." },
    { signal: "metrics", pattern: /metrics|report|annotation-report|quality metrics/i, evidence: "metrics/report evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "quality", "signal");
}

function dataAnnotationPrelabelSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["prelabelSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["prelabelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "prediction", pattern: /predictions?|Prediction\b|ls\.predictions\.create/i, evidence: "prediction evidence was detected." },
    { signal: "suggestion", pattern: /suggestions?|Suggestion\b|rg\.Suggestion/i, evidence: "suggestion evidence was detected." },
    { signal: "model-assisted", pattern: /show_collab_predictions|model-assisted|model assisted|prelabel/i, evidence: "model-assisted labeling evidence was detected." },
    { signal: "similarity", pattern: /compute_similarity|similarity|nearest neighbor/i, evidence: "similarity evidence was detected." },
    { signal: "embedding", pattern: /embedding|VectorSettings|vector/i, evidence: "embedding/vector evidence was detected." },
    { signal: "weak-supervision", pattern: /weak supervision|weak_supervision|programmatic label/i, evidence: "weak supervision evidence was detected." },
    { signal: "active-learning", pattern: /active learning|uncertainty sampling|unique sample/i, evidence: "active learning evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "prelabel", "signal");
}

function dataAnnotationExportSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["exportSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["exportSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "export", pattern: /export|dataset\.export|export_annotations/i, evidence: "export evidence was detected." },
    { signal: "json", pattern: /\bJSON\b|\.json|application\/json/i, evidence: "JSON export evidence was detected." },
    { signal: "csv", pattern: /\bCSV\b|\.csv|text\/csv/i, evidence: "CSV export evidence was detected." },
    { signal: "coco", pattern: /COCO|COCODetectionDataset/i, evidence: "COCO export evidence was detected." },
    { signal: "yolo", pattern: /YOLO|YOLOv5Dataset/i, evidence: "YOLO export evidence was detected." },
    { signal: "fiftyone-dataset", pattern: /FiftyOneDataset|fo\.types\.FiftyOneDataset/i, evidence: "FiftyOneDataset export evidence was detected." },
    { signal: "storage", pattern: /storage|S3|cloud storage|export storage/i, evidence: "storage/export destination evidence was detected." },
    { signal: "downstream", pattern: /downstream|load_annotations|training dataset|model training/i, evidence: "downstream handoff evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "export", "signal");
}

function dataAnnotationCiSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["ciSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "import-smoke-command", pattern: /import-smoke|annotation smoke|records\.log|import_tasks|tasks\.create/i, evidence: "annotation import smoke evidence was detected." },
    { signal: "export-smoke-command", pattern: /export-smoke|dataset\.export|export annotations|export check/i, evidence: "annotation export smoke evidence was detected." },
    { signal: "schema-check-command", pattern: /schema-check|label_config|LabelQuestion|TextQuestion|validate schema/i, evidence: "annotation schema check evidence was detected." },
    { signal: "quality-check-command", pattern: /quality-check|agreement|consensus|evaluate_detections|evaluate_classifications|annotation quality/i, evidence: "annotation quality check evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|annotation-report|agreement-report|exports\/annotations|exports\/coco|exports\/yolo/i, evidence: "annotation artifact upload evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function dataAnnotationPackageSignals(sourceFiles: DataAnnotationSourceFile[]): DataAnnotationReadinessReport["packageSignals"] {
  const specs: Array<{ signal: DataAnnotationReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "label-studio", pattern: /label-studio|label_studio|Label Studio/i, evidence: "Label Studio package evidence was detected." },
    { signal: "fiftyone", pattern: /fiftyone|FiftyOne/i, evidence: "FiftyOne package evidence was detected." },
    { signal: "argilla", pattern: /argilla|Argilla/i, evidence: "Argilla package evidence was detected." },
    { signal: "cvat", pattern: /cvat|CVAT/i, evidence: "CVAT package evidence was detected." },
    { signal: "labelbox", pattern: /labelbox|Labelbox/i, evidence: "Labelbox package evidence was detected." },
    { signal: "custom", pattern: /annotation|labeling workflow|annotator/i, evidence: "custom annotation package/workflow evidence was detected." }
  ];
  return dataAnnotationSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function dataAnnotationSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: DataAnnotationSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/data-annotation-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildLakehouseTableReadinessReport(walk: WalkResult): Promise<LakehouseTableReadinessReport> {
  const sourceFiles = await lakehouseTableSourceFiles(walk);
  const lakehouseSetups = lakehouseTableSetupsFromSources(sourceFiles);
  const formatSignals = lakehouseFormatSignals(sourceFiles);
  const tableSignals = lakehouseTableSignals(sourceFiles);
  const metadataSignals = lakehouseMetadataSignals(sourceFiles);
  const schemaSignals = lakehouseSchemaSignals(sourceFiles);
  const writeSignals = lakehouseWriteSignals(sourceFiles);
  const timeTravelSignals = lakehouseTimeTravelSignals(sourceFiles);
  const maintenanceSignals = lakehouseMaintenanceSignals(sourceFiles);
  const streamingSignals = lakehouseStreamingSignals(sourceFiles);
  const ciSignals = lakehouseCiSignals(sourceFiles);
  const packageSignals = lakehousePackageSignals(sourceFiles);

  const hasFormat = formatSignals.some((item) => item.readiness === "ready") || lakehouseSetups.length > 0;
  const hasTable = tableSignals.filter((item) => item.readiness === "ready").length >= 2 || lakehouseSetups.some((item) => item.tableCount > 0);
  const hasMetadata = metadataSignals.filter((item) => item.readiness === "ready").length >= 2 || lakehouseSetups.some((item) => item.metadataCount + item.transactionCount > 0);
  const hasWrite = writeSignals.some((item) => item.readiness === "ready") || lakehouseSetups.some((item) => item.mergeCount + item.transactionCount > 0);
  const hasSchema = schemaSignals.filter((item) => item.readiness === "ready").length >= 2 || lakehouseSetups.some((item) => item.schemaCount + item.partitionCount > 0);
  const hasTimeTravel = timeTravelSignals.some((item) => item.readiness === "ready") || lakehouseSetups.some((item) => item.timeTravelCount > 0);
  const hasMaintenance = maintenanceSignals.some((item) => item.readiness === "ready") || lakehouseSetups.some((item) => item.maintenanceCount > 0);
  const hasStreaming = streamingSignals.some((item) => item.readiness === "ready") || lakehouseSetups.some((item) => item.streamingCount > 0);
  const hasCheckpointOrIncremental = streamingSignals.some((item) => item.readiness === "ready" && ["checkpoint-location", "change-data-feed", "incremental-query", "deltastreamer"].includes(item.signal));
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || lakehouseSetups.some((item) => item.ciCount > 0);

  const riskQueue: LakehouseTableReadinessReport["riskQueue"] = [];
  if (!hasFormat || !hasTable || !hasMetadata) {
    riskQueue.push({
      priority: "high",
      action: "Add Delta Lake, Apache Iceberg, Apache Hudi, table, and transaction metadata evidence before claiming lakehouse readiness.",
      why: "A lakehouse table is not reproducible if learners cannot find its table format and the metadata log, snapshot, manifest, or timeline that protects commits.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }
  if (hasTable && !hasWrite) {
    riskQueue.push({
      priority: "high",
      action: "Document append, MERGE INTO, upsert, delete, overwrite, copy-on-write, merge-on-read, or streaming write paths.",
      why: "A table definition alone does not prove that data can safely enter or mutate the lakehouse table.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }
  if (hasWrite && !hasSchema) {
    riskQueue.push({
      priority: "medium",
      action: "Add schema evolution, partition spec, partition evolution, generated column, constraints, sort order, record key, or precombine key evidence.",
      why: "Write paths need explicit schema and partition contracts before learners can reason about compatibility and layout.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }
  if (hasWrite && !hasTimeTravel) {
    riskQueue.push({
      priority: "medium",
      action: "Add version-as-of, timestamp-as-of, snapshot id, branch/tag, restore, rollback, or savepoint evidence.",
      why: "Lakehouse table changes should be auditable and recoverable through time travel or rollback controls.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }
  if (hasWrite && !hasMaintenance) {
    riskQueue.push({
      priority: "medium",
      action: "Add VACUUM, OPTIMIZE, compaction, clustering, cleaner, expireSnapshots, rewriteDataFiles, remove_orphan_files, or manifest rewrite evidence.",
      why: "Lakehouse tables accumulate files and metadata; learners need to find the maintenance loop before trusting operations.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }
  if (hasStreaming && !hasCheckpointOrIncremental) {
    riskQueue.push({
      priority: "medium",
      action: "Connect streaming evidence to checkpointLocation, Change Data Feed, incremental query, or HoodieDeltaStreamer checkpoints.",
      why: "Streaming table writes need a replay boundary or incremental cursor to stay recoverable.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }
  if ((hasTable || hasMaintenance) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run table, merge, maintenance, and streaming smoke checks in CI and upload metadata/log artifacts.",
      why: "Lakehouse readiness is easier to verify when table lifecycle commands produce artifacts outside a local Spark/Flink session.",
      relatedHref: "html/lakehouse-table-readiness.html"
    });
  }

  return {
    summary: `Lakehouse table readiness report: lakehouse setup ${lakehouseSetups.length}개, table signal ${tableSignals.length}개, metadata signal ${metadataSignals.length}개, maintenance signal ${maintenanceSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Lakehouse table readiness Delta Lake Apache Iceberg Apache Hudi DeltaTable MERGE INTO VACUUM OPTIMIZE Change Data Feed _delta_log checkpoint Snapshot ManifestFile PartitionSpec DataFile DeleteFile Catalog metadata.json HoodieTable HoodieTimeline HoodieDeltaStreamer compaction clustering cleaner incremental query time travel CI",
    lakehouseSetups,
    formatSignals,
    tableSignals,
    metadataSignals,
    schemaSignals,
    writeSignals,
    timeTravelSignals,
    maintenanceSignals,
    streamingSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"DeltaTable|delta\\.\\`|_delta_log|MERGE INTO|VACUUM|OPTIMIZE|Change Data Feed\" .", purpose: "Find Delta Lake table, transaction log, merge, maintenance, and CDF evidence." },
      { command: "rg \"Iceberg|Snapshot|ManifestFile|PartitionSpec|DataFile|DeleteFile|VERSION AS OF|TIMESTAMP AS OF\" .", purpose: "Find Apache Iceberg catalog, snapshot, manifest, schema, and time travel evidence." },
      { command: "rg \"HoodieTable|HoodieWriteConfig|HoodieTimeline|HoodieDeltaStreamer|Compaction|Clustering|incremental query\" .", purpose: "Find Apache Hudi table, write config, timeline, streaming, and maintenance evidence." },
      { command: "rg \"schema evolution|partition evolution|record key|precombine|sort order|constraints|generated column\" .", purpose: "Find schema, partition, ordering, and key contract evidence." },
      { command: "rg \"expireSnapshots|rewriteDataFiles|remove_orphan_files|cleaner|rollback|savepoint|upload-artifact|table smoke\" .github .", purpose: "Find maintenance, recovery, CI smoke, and artifact evidence." }
    ],
    learnerNextSteps: [
      "먼저 Delta Lake, Apache Iceberg, Apache Hudi 또는 custom lakehouse table format 설정 파일이 있는지 찾으세요.",
      "_delta_log, checkpoint, protocol, metadata.json, manifest, snapshot, HoodieTimeline, commit instant 같은 transaction metadata가 write path와 연결되는지 확인하세요.",
      "MERGE INTO, upsert, delete, overwrite, copy-on-write, merge-on-read, streaming write가 schema/partition contract와 함께 설명되는지 확인하세요.",
      "VERSION AS OF, TIMESTAMP AS OF, snapshot id, branch/tag, restore, rollback, savepoint로 변경 이력을 추적하거나 되돌릴 수 있는지 확인하세요.",
      "VACUUM, OPTIMIZE, compaction, clustering, cleaner, expireSnapshots, rewriteDataFiles, remove_orphan_files와 CI smoke artifact가 있는지 확인하세요."
    ]
  };
}

type LakehouseTableSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function lakehouseTableSourceFiles(walk: WalkResult): Promise<LakehouseTableSourceFile[]> {
  const rows: LakehouseTableSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!lakehouseTableInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!lakehouseTablePathSignal(file.relPath) && !lakehouseTableContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function lakehouseTableInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|pom\.xml|build\.gradle|build\.gradle\.kts|build\.sbt|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(delta|deltalake|delta[-_]?lake|iceberg|hudi|lakehouse|tables?|catalog|metastore|spark|flink|streaming|warehouse|manifests?|snapshots?|checkpoints?|compaction|clustering|cleaner)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|xml|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|py|ipynb|java|scala|kt|go|rs|sql)$/i.test(filePath);
}

function lakehouseTablePathSignal(filePath: string): boolean {
  return /(^|\/)(delta|deltalake|delta[-_]?lake|iceberg|hudi|lakehouse|tables?|catalog|metastore|streaming|warehouse|manifests?|snapshots?|checkpoints?|compaction|clustering|cleaner)(\/|\.|-|_|$)/i.test(filePath)
    || /(_delta_log|metadata\.json|\.hoodie)/i.test(filePath);
}

function lakehouseTableContentSignal(text: string): boolean {
  return /DeltaTable|delta[- ]lake|_delta_log|MERGE INTO|VACUUM|OPTIMIZE|Change Data Feed|Apache Iceberg|Iceberg|Snapshot|ManifestFile|PartitionSpec|DataFile|DeleteFile|VERSION AS OF|TIMESTAMP AS OF|metadata\.json|Apache Hudi|HoodieTable|HoodieWriteConfig|HoodieTimeline|HoodieDeltaStreamer|Compaction|Clustering|incremental query|time travel|lakehouse table|table smoke/i.test(text);
}

function lakehouseTableSetupsFromSources(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["lakehouseSetups"] {
  const rows: LakehouseTableReadinessReport["lakehouseSetups"] = [];
  for (const source of sourceFiles) {
    const tableCount = countMatches(source.text, /DeltaTable|delta\.`|spark\.read\.format\(["']delta|Table\b|Catalog\b|HiveCatalog|HadoopCatalog|NessieCatalog|HoodieTable|HoodieTableMetaClient|hoodie\.table\.name|CREATE TABLE|USING (delta|iceberg|hudi)|managed table|external table/gi);
    const metadataCount = countMatches(source.text, /_delta_log|checkpoint|protocol version|upgradeTableProtocol|metadata\.json|manifest list|ManifestList|ManifestFile|Snapshot|SnapshotRef|HoodieTimeline|HoodieCommitMetadata|commit instant|instant time|metadata table|\.hoodie/gi);
    const transactionCount = countMatches(source.text, /transaction|commit|snapshot isolation|optimistic concurrency|MERGE INTO|upsert|delete from|overwrite|copy-on-write|merge-on-read|HoodieCommit|HoodieTimeline|COMMIT_ACTION/gi);
    const schemaCount = countMatches(source.text, /schema evolution|mergeSchema|overwriteSchema|generated column|constraints?|PartitionSpec|Schema\b|schema\(|sort order|recordkey\.field|record key|precombine\.field|precombine key/gi);
    const partitionCount = countMatches(source.text, /partition spec|partition evolution|PartitionSpec|partitioned by|partitionBy|partition field|PartitionField|partition path|hoodie\.datasource\.write\.partitionpath\.field/gi);
    const mergeCount = countMatches(source.text, /MERGE INTO|merge into|whenMatched|whenNotMatched|upsert|insert_overwrite|delete from|update set|overwrite|copy-on-write|merge-on-read|streaming write/gi);
    const timeTravelCount = countMatches(source.text, /VERSION AS OF|TIMESTAMP AS OF|time travel|snapshot-id|snapshot id|SnapshotRef|branch|tag|restore table|RESTORE TABLE|rollback|savepoint|SetCurrentSnapshot|RollbackToTimestamp/gi);
    const maintenanceCount = countMatches(source.text, /VACUUM|OPTIMIZE|ZORDER|compaction|Compaction|clustering|Clustering|cleaner|Cleaner|expireSnapshots|rewriteDataFiles|remove_orphan_files|removeOrphanFiles|rewriteManifests|manifest rewrite/gi);
    const streamingCount = countMatches(source.text, /checkpointLocation|checkpoint location|Change Data Feed|readChangeFeed|delta streaming|incremental query|HoodieDeltaStreamer|DeltaStreamer|flink sink|FlinkSink|Kafka Connect|kafka-connect|streaming write/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|table-smoke|merge-smoke|maintenance-smoke|streaming-smoke|upload-artifact|lakehouse-report|_delta_log|metadata\.json|\.hoodie|manifest-list|pytest|spark-submit/gi);
    const totalSignals = tableCount + metadataCount + transactionCount + schemaCount + partitionCount + mergeCount + timeTravelCount + maintenanceCount + streamingCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      format: lakehouseFormat(source),
      tableCount,
      metadataCount,
      transactionCount,
      schemaCount,
      partitionCount,
      mergeCount,
      timeTravelCount,
      maintenanceCount,
      streamingCount,
      ciCount,
      readiness: tableCount > 0 && metadataCount > 0 && transactionCount > 0 && (schemaCount + partitionCount) > 0 && mergeCount > 0 && timeTravelCount > 0 && maintenanceCount > 0 && ciCount > 0 ? "ready" : "partial",
      evidence: `${totalSignals} lakehouse table readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.tableCount + b.metadataCount + b.transactionCount + b.schemaCount + b.partitionCount + b.mergeCount + b.timeTravelCount + b.maintenanceCount + b.streamingCount + b.ciCount) - (a.tableCount + a.metadataCount + a.transactionCount + a.schemaCount + a.partitionCount + a.mergeCount + a.timeTravelCount + a.maintenanceCount + a.streamingCount + a.ciCount))
    .slice(0, 60);
}

function lakehouseFormat(source: LakehouseTableSourceFile): LakehouseTableReadinessReport["lakehouseSetups"][number]["format"] {
  if (/delta|deltalake/i.test(source.filePath) || /DeltaTable|delta-spark|deltalake|delta\.`|_delta_log|Change Data Feed/i.test(source.text)) return "delta";
  if (/iceberg/i.test(source.filePath) || /Apache Iceberg|Iceberg|PartitionSpec|ManifestFile|metadata\.json|SnapshotRef/i.test(source.text)) return "iceberg";
  if (/hudi/i.test(source.filePath) || /Apache Hudi|HoodieTable|HoodieWriteConfig|HoodieTimeline|HoodieDeltaStreamer|\.hoodie/i.test(source.text)) return "hudi";
  if (/lakehouse|table format|catalog table/i.test(source.filePath) || /lakehouse table|table format|transaction log/i.test(source.text)) return "custom";
  return "unknown";
}

function lakehouseFormatSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["formatSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["formatSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "delta-lake", pattern: /DeltaTable|delta[- ]lake|delta-spark|deltalake|delta\.`|_delta_log/i, evidence: "Delta Lake package/API evidence was detected." },
    { signal: "apache-iceberg", pattern: /Apache Iceberg|Iceberg|iceberg-spark|iceberg-flink|PartitionSpec|ManifestFile|metadata\.json/i, evidence: "Apache Iceberg package/API evidence was detected." },
    { signal: "apache-hudi", pattern: /Apache Hudi|Hudi|HoodieTable|HoodieWriteConfig|HoodieTimeline|HoodieDeltaStreamer/i, evidence: "Apache Hudi package/API evidence was detected." },
    { signal: "custom", pattern: /lakehouse table|table format|transaction log|snapshot isolation|catalog table/i, evidence: "custom lakehouse table format evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "format", "signal");
}

function lakehouseTableSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["tableSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["tableSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "delta-table", pattern: /DeltaTable|spark\.read\.format\(["']delta|delta\.`|USING delta|format\(["']delta/i, evidence: "Delta table evidence was detected." },
    { signal: "iceberg-table", pattern: /Iceberg|TableMetadata|PartitionSpec|USING iceberg|format\(["']iceberg/i, evidence: "Iceberg table evidence was detected." },
    { signal: "hudi-table", pattern: /HoodieTable|HoodieTableMetaClient|hoodie\.table\.name|USING hudi|format\(["']hudi/i, evidence: "Hudi table evidence was detected." },
    { signal: "catalog-table", pattern: /Catalog\b|HiveCatalog|HadoopCatalog|GlueCatalog|NessieCatalog|BigQueryMetastoreCatalog|metastore/i, evidence: "catalog table evidence was detected." },
    { signal: "path-table", pattern: /forPath|path table|table path|basePath|warehouse path|s3:\/\/|abfs:\/\/|gs:\/\//i, evidence: "path table evidence was detected." },
    { signal: "managed-table", pattern: /managed table|CREATE TABLE|create table|saveAsTable|tableProperty|TBLPROPERTIES/i, evidence: "managed table evidence was detected." },
    { signal: "external-table", pattern: /external table|EXTERNAL|LOCATION|table location|external_location/i, evidence: "external table evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "table", "signal");
}

function lakehouseMetadataSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["metadataSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["metadataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "delta-log", pattern: /_delta_log|Delta log|transaction log/i, evidence: "Delta transaction log evidence was detected." },
    { signal: "checkpoint", pattern: /checkpoint|checkpointLocation|Table\.checkpoint|CHECKPOINT/i, evidence: "checkpoint evidence was detected." },
    { signal: "protocol-version", pattern: /protocol version|upgradeTableProtocol|minReaderVersion|minWriterVersion/i, evidence: "protocol version evidence was detected." },
    { signal: "iceberg-metadata-json", pattern: /metadata\.json|TableMetadata/i, evidence: "Iceberg metadata.json evidence was detected." },
    { signal: "manifest-list", pattern: /manifest list|ManifestList|manifest-list/i, evidence: "Iceberg manifest list evidence was detected." },
    { signal: "manifest-file", pattern: /ManifestFile|manifest file|manifest-file/i, evidence: "Iceberg manifest file evidence was detected." },
    { signal: "snapshot", pattern: /Snapshot\b|snapshot-id|snapshot id|SnapshotRef|snapshot summary/i, evidence: "snapshot evidence was detected." },
    { signal: "hudi-timeline", pattern: /HoodieTimeline|timeline|instant time|HoodieActiveTimeline/i, evidence: "Hudi timeline evidence was detected." },
    { signal: "commit-instant", pattern: /HoodieCommitMetadata|commit instant|COMMIT_ACTION|instant time/i, evidence: "Hudi commit instant evidence was detected." },
    { signal: "metadata-table", pattern: /metadata table|HoodieTableMetadata|HoodieBackedTableMetadata|metadata index/i, evidence: "metadata table evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "metadata", "signal");
}

function lakehouseSchemaSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["schemaSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["schemaSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "schema-evolution", pattern: /schema evolution|mergeSchema|overwriteSchema|SchemaEvolution|evolve schema/i, evidence: "schema evolution evidence was detected." },
    { signal: "partition-spec", pattern: /PartitionSpec|partition spec|partitionBy|PARTITIONED BY/i, evidence: "partition spec evidence was detected." },
    { signal: "partition-evolution", pattern: /partition evolution|replace partition|updateSpec|evolve partition/i, evidence: "partition evolution evidence was detected." },
    { signal: "generated-column", pattern: /generated column|GENERATED ALWAYS|generatedColumns/i, evidence: "generated column evidence was detected." },
    { signal: "constraints", pattern: /constraints?|CHECK \(|NOT NULL|invariant/i, evidence: "constraint evidence was detected." },
    { signal: "sort-order", pattern: /sort order|SortOrder|ZORDER|zorder|order by/i, evidence: "sort order evidence was detected." },
    { signal: "record-key", pattern: /recordkey\.field|record key|HoodieRecord|_hoodie_record_key/i, evidence: "record key evidence was detected." },
    { signal: "precombine-key", pattern: /precombine\.field|precombine key|ORDERING_FIELDS|ordering field/i, evidence: "precombine/ordering key evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "schema", "signal");
}

function lakehouseWriteSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["writeSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["writeSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "append", pattern: /append|mode\(["']append|INSERT INTO|write\.append/i, evidence: "append write evidence was detected." },
    { signal: "merge-into", pattern: /MERGE INTO|merge into|whenMatched|whenNotMatched/i, evidence: "merge into evidence was detected." },
    { signal: "upsert", pattern: /upsert|UPSERT|HoodieDeltaStreamer|deltastreamer/i, evidence: "upsert evidence was detected." },
    { signal: "delete", pattern: /DELETE FROM|delete from|deleteFiles|DeleteFile|delete operation/i, evidence: "delete evidence was detected." },
    { signal: "overwrite", pattern: /overwrite|INSERT OVERWRITE|insert_overwrite|replaceWhere/i, evidence: "overwrite evidence was detected." },
    { signal: "copy-on-write", pattern: /copy[-_ ]on[-_ ]write|COPY_ON_WRITE/i, evidence: "copy-on-write evidence was detected." },
    { signal: "merge-on-read", pattern: /merge[-_ ]on[-_ ]read|MERGE_ON_READ/i, evidence: "merge-on-read evidence was detected." },
    { signal: "streaming-write", pattern: /writeStream|streaming write|FlinkSink|Kafka Connect|HoodieDeltaStreamer/i, evidence: "streaming write evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "write", "signal");
}

function lakehouseTimeTravelSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["timeTravelSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["timeTravelSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "version-as-of", pattern: /VERSION AS OF|versionAsOf|version as of/i, evidence: "version-as-of evidence was detected." },
    { signal: "timestamp-as-of", pattern: /TIMESTAMP AS OF|timestampAsOf|timestamp as of/i, evidence: "timestamp-as-of evidence was detected." },
    { signal: "snapshot-id", pattern: /snapshot-id|snapshot id|SnapshotId|snapshot_id/i, evidence: "snapshot id evidence was detected." },
    { signal: "branch-or-tag", pattern: /SnapshotRef|branch|tag|refs\/heads|Nessie/i, evidence: "branch/tag evidence was detected." },
    { signal: "restore", pattern: /RESTORE TABLE|restore table|restoreToVersion|restoreToTimestamp/i, evidence: "restore evidence was detected." },
    { signal: "rollback", pattern: /rollback|RollbackToTimestamp|rollbackTo|SetCurrentSnapshot/i, evidence: "rollback evidence was detected." },
    { signal: "savepoint", pattern: /savepoint|Savepoint/i, evidence: "savepoint evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "time travel", "signal");
}

function lakehouseMaintenanceSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["maintenanceSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["maintenanceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "vacuum", pattern: /VACUUM|vacuum/i, evidence: "VACUUM evidence was detected." },
    { signal: "optimize", pattern: /OPTIMIZE|optimize|ZORDER|zorder/i, evidence: "OPTIMIZE/ZORDER evidence was detected." },
    { signal: "compaction", pattern: /compaction|Compaction|compact/i, evidence: "compaction evidence was detected." },
    { signal: "clustering", pattern: /clustering|Clustering|cluster/i, evidence: "clustering evidence was detected." },
    { signal: "cleaner", pattern: /cleaner|Cleaner|cleaning policy|clean/i, evidence: "cleaner evidence was detected." },
    { signal: "expire-snapshots", pattern: /expireSnapshots|expire snapshots|expire_snapshots/i, evidence: "expire snapshots evidence was detected." },
    { signal: "rewrite-data-files", pattern: /rewriteDataFiles|rewrite data files|rewrite_data_files/i, evidence: "rewrite data files evidence was detected." },
    { signal: "remove-orphan-files", pattern: /remove_orphan_files|removeOrphanFiles|remove orphan files/i, evidence: "remove orphan files evidence was detected." },
    { signal: "manifest-rewrite", pattern: /rewriteManifests|rewrite manifests|manifest rewrite/i, evidence: "manifest rewrite evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "maintenance", "signal");
}

function lakehouseStreamingSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["streamingSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["streamingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "checkpoint-location", pattern: /checkpointLocation|checkpoint location|checkpoint path/i, evidence: "checkpoint location evidence was detected." },
    { signal: "change-data-feed", pattern: /Change Data Feed|readChangeFeed|changeDataFeed|CDF/i, evidence: "Change Data Feed evidence was detected." },
    { signal: "incremental-query", pattern: /incremental query|incremental read|begin instant|beginInstantTime/i, evidence: "incremental query evidence was detected." },
    { signal: "delta-streaming", pattern: /delta streaming|writeStream.*delta|readStream.*delta|DeltaSource/i, evidence: "Delta streaming evidence was detected." },
    { signal: "flink-sink", pattern: /FlinkSink|flink sink|iceberg-flink|hudi-flink/i, evidence: "Flink sink evidence was detected." },
    { signal: "kafka-connect", pattern: /Kafka Connect|kafka-connect|IcebergSinkConnector|HudiSinkConnector/i, evidence: "Kafka Connect evidence was detected." },
    { signal: "deltastreamer", pattern: /HoodieDeltaStreamer|DeltaStreamer|deltastreamer/i, evidence: "HoodieDeltaStreamer evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "streaming", "signal");
}

function lakehouseCiSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["ciSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "table-smoke-command", pattern: /table-smoke|lakehouse table smoke|spark-submit|pytest.*lakehouse/i, evidence: "table smoke command evidence was detected." },
    { signal: "merge-smoke-command", pattern: /merge-smoke|MERGE INTO|upsert smoke|merge smoke/i, evidence: "merge smoke command evidence was detected." },
    { signal: "maintenance-smoke-command", pattern: /maintenance-smoke|VACUUM|OPTIMIZE|expireSnapshots|compaction|cleaner/i, evidence: "maintenance smoke command evidence was detected." },
    { signal: "streaming-smoke-command", pattern: /streaming-smoke|checkpointLocation|HoodieDeltaStreamer|Kafka Connect|flink sink/i, evidence: "streaming smoke command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|lakehouse-report|_delta_log|metadata\.json|\.hoodie|manifest-list|table-report/i, evidence: "lakehouse artifact upload evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function lakehousePackageSignals(sourceFiles: LakehouseTableSourceFile[]): LakehouseTableReadinessReport["packageSignals"] {
  const specs: Array<{ signal: LakehouseTableReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "delta-spark", pattern: /delta-spark|io\.delta|DeltaTable|delta-core/i, evidence: "delta-spark package evidence was detected." },
    { signal: "delta-rs", pattern: /deltalake|delta-rs|delta_kernel|delta-standalone/i, evidence: "delta-rs/deltalake package evidence was detected." },
    { signal: "iceberg", pattern: /org\.apache\.iceberg|pyiceberg|Iceberg|iceberg-core/i, evidence: "Iceberg package evidence was detected." },
    { signal: "iceberg-spark", pattern: /iceberg-spark|SparkCatalog|org\.apache\.iceberg\.spark/i, evidence: "iceberg-spark package evidence was detected." },
    { signal: "iceberg-flink", pattern: /iceberg-flink|org\.apache\.iceberg\.flink/i, evidence: "iceberg-flink package evidence was detected." },
    { signal: "hudi", pattern: /org\.apache\.hudi|apache-hudi|hudi-core|HoodieTable/i, evidence: "Hudi package evidence was detected." },
    { signal: "hudi-spark", pattern: /hudi-spark|hudi-spark-datasource|HoodieSpark/i, evidence: "hudi-spark package evidence was detected." },
    { signal: "hudi-flink", pattern: /hudi-flink|org\.apache\.hudi\.flink/i, evidence: "hudi-flink package evidence was detected." },
    { signal: "custom", pattern: /lakehouse table|table format|transaction log/i, evidence: "custom lakehouse package/workflow evidence was detected." }
  ];
  return lakehouseSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function lakehouseSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: LakehouseTableSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/lakehouse-table-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildFeatureStoreReadinessReport(walk: WalkResult): Promise<FeatureStoreReadinessReport> {
  const sourceFiles = await featureStoreSourceFiles(walk);
  const featureStoreSetups = featureStoreSetupsFromSources(sourceFiles);
  const definitionSignals = featureStoreDefinitionSignals(sourceFiles);
  const sourceSignals = featureStoreSourceSignals(sourceFiles);
  const storageSignals = featureStoreStorageSignals(sourceFiles);
  const retrievalSignals = featureStoreRetrievalSignals(sourceFiles);
  const materializationSignals = featureStoreMaterializationSignals(sourceFiles);
  const ciSignals = featureStoreCiSignals(sourceFiles);
  const packageSignals = featureStorePackageSignals(sourceFiles);

  const hasDefinitions = definitionSignals.filter((item) => item.readiness === "ready").length >= 3 || featureStoreSetups.some((item) => item.definitionCount > 0 && item.entityCount > 0);
  const hasSources = sourceSignals.some((item) => item.readiness === "ready") || featureStoreSetups.some((item) => item.sourceCount > 0);
  const hasStorage = storageSignals.some((item) => item.readiness === "ready") || featureStoreSetups.some((item) => item.offlineStoreCount + item.onlineStoreCount + item.registryCount > 0);
  const hasRetrieval = retrievalSignals.some((item) => item.readiness === "ready") || featureStoreSetups.some((item) => item.retrievalCount + item.trainingDatasetCount > 0);
  const hasMaterialization = materializationSignals.some((item) => item.readiness === "ready") || featureStoreSetups.some((item) => item.materializationCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || featureStoreSetups.some((item) => item.ciCount > 0);

  const riskQueue: FeatureStoreReadinessReport["riskQueue"] = [];
  if (!hasDefinitions) {
    riskQueue.push({
      priority: "high",
      action: "Add feature entities, views, groups, services, anchors, or schema definitions before claiming feature store readiness.",
      why: "A feature store needs explicit feature definitions that learners can map to model inputs.",
      relatedHref: "html/feature-store-readiness.html"
    });
  }
  if (hasDefinitions && !hasSources) {
    riskQueue.push({
      priority: "high",
      action: "Document batch, stream, request, push, or source data bindings for feature definitions.",
      why: "Features are hard to reproduce if the raw data source and event timestamp are not visible.",
      relatedHref: "html/feature-store-readiness.html"
    });
  }
  if (hasDefinitions && !hasStorage) {
    riskQueue.push({
      priority: "medium",
      action: "Add offline store, online store, registry, or provider configuration evidence.",
      why: "Feature stores need durable registry metadata and separate offline/online serving paths.",
      relatedHref: "html/feature-store-readiness.html"
    });
  }
  if (hasDefinitions && !hasRetrieval) {
    riskQueue.push({
      priority: "medium",
      action: "Capture historical and online retrieval APIs plus point-in-time training dataset generation.",
      why: "Readiness requires both training-time correctness and serving-time feature retrieval.",
      relatedHref: "html/feature-store-readiness.html"
    });
  }
  if (hasSources && !hasMaterialization) {
    riskQueue.push({
      priority: "low",
      action: "Add materialization, streaming ingestion, sink, or feature server evidence.",
      why: "Online features usually need a reproducible path from offline/stream sources into a serving store.",
      relatedHref: "html/feature-store-readiness.html"
    });
  }
  if ((hasDefinitions || hasMaterialization) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run feature store apply/materialization/offline-online checks in CI and upload artifacts.",
      why: "Feature definitions and materialization jobs should be reproducible outside local notebooks.",
      relatedHref: "html/feature-store-readiness.html"
    });
  }

  return {
    summary: `Feature store readiness report: feature store setup ${featureStoreSetups.length}개, definition signal ${definitionSignals.length}개, source signal ${sourceSignals.length}개, retrieval signal ${retrievalSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Feature store readiness Feast Feathr Hopsworks FeatureStore FeatureView Entity FeatureService FeatureAnchor DerivedFeature FeatureGroup offline store online store registry materialize materialize-incremental historical features online features point-in-time training dataset feature join Redis Spark Kafka CI",
    featureStoreSetups,
    definitionSignals,
    sourceSignals,
    storageSignals,
    retrievalSignals,
    materializationSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"FeatureStore|FeatureView|Entity|FeatureService|FeatureAnchor|DerivedFeature|FeatureGroup\" .", purpose: "Find feature definitions and logical grouping objects." },
      { command: "rg \"batch_source|stream_source|RequestSource|PushSource|DataSource|event_timestamp|ttl\" .", purpose: "Find source bindings, event timestamps, and freshness windows." },
      { command: "rg \"offline_store|online_store|registry|provider|Redis|Spark|Snowflake|BigQuery\" .", purpose: "Find registry and offline/online store configuration." },
      { command: "rg \"get_historical_features|get_online_features|point-in-time|training dataset|FeatureJoin\" .", purpose: "Find training retrieval, online retrieval, and point-in-time join evidence." },
      { command: "rg \"materialize|materialize-incremental|FeatureGenJob|FeatureJoinJob|feature server|upload-artifact\" .", purpose: "Find materialization, serving, and CI artifact evidence." }
    ],
    learnerNextSteps: [
      "먼저 Feast/Feathr/Hopsworks 또는 custom feature store 정의 파일이 있는지 찾으세요.",
      "Entity, FeatureView, FeatureService, FeatureAnchor, DerivedFeature, FeatureGroup과 schema field가 모델 입력을 설명하는지 확인하세요.",
      "batch/stream/request/push source와 event timestamp, TTL/freshness 설정이 함께 남는지 확인하세요.",
      "offline store, online store, registry, provider, Redis/Spark/Snowflake/BigQuery 같은 저장 경로가 분리되어 있는지 확인하세요.",
      "historical features, online features, point-in-time join, training dataset, materialize, feature server, CI artifact로 반복 생성 가능한지 확인하세요."
    ]
  };
}

type FeatureStoreSourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function featureStoreSourceFiles(walk: WalkResult): Promise<FeatureStoreSourceFile[]> {
  const rows: FeatureStoreSourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!featureStoreInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!featureStorePathSignal(file.relPath) && !featureStoreContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function featureStoreInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|feature_store\.ya?ml|features\.py|feature_repo\.ya?ml|feathr_config.*\.ya?ml|workflow\.ya?ml)$/i.test(base)
    || /(^|\/)(feast|feathr|hopsworks|feature_store|feature-store|featurestore|feature_repo|features|materialization|registry|online_store|offline_store)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|sql|py|java|scala|kt|go|rs)$/i.test(filePath);
}

function featureStorePathSignal(filePath: string): boolean {
  return /(^|\/)(feast|feathr|hopsworks|feature_store|feature-store|featurestore|feature_repo|features|materialization|registry|online_store|offline_store)(\/|\.|-|_|$)/i.test(filePath)
    || /^(feature_store\.ya?ml|features\.py|feature_repo\.ya?ml|feathr_config.*\.ya?ml)$/i.test(path.basename(filePath));
}

function featureStoreContentSignal(text: string): boolean {
  return /FeatureStore|feature store|FeatureView|FeatureService|FeatureAnchor|DerivedFeature|FeatureGroup|offline store|online store|registry|materialize|historical features|online features|point-in-time|training dataset|FeatureJoin|RedisSink|KafkaConfig|Hopsworks/i.test(text);
}

function featureStoreSetupsFromSources(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["featureStoreSetups"] {
  const rows: FeatureStoreReadinessReport["featureStoreSetups"] = [];
  for (const source of sourceFiles) {
    const definitionCount = countMatches(source.text, /FeatureStore|FeatureView|BatchFeatureView|StreamFeatureView|FeatureService|FeatureAnchor|DerivedFeature|FeatureGroup|Feature\b|Field\b|schema/gi);
    const entityCount = countMatches(source.text, /Entity|entities|entity_df|join_key|primary_key|FeatureGroup|feature group/gi);
    const sourceCount = countMatches(source.text, /batch_source|stream_source|RequestSource|PushSource|DataSource|SparkSqlSource|KafkaConfig|event_timestamp|timestamp_field|ttl|source:/gi);
    const offlineStoreCount = countMatches(source.text, /offline_store|offline store|OfflineStore|offline_write_batch|Snowflake|BigQuery|Spark|Delta|Hive/gi);
    const onlineStoreCount = countMatches(source.text, /online_store|online store|OnlineStore|Redis|RedisSink|get_online_features|feature server|serving/gi);
    const materializationCount = countMatches(source.text, /materialize|materialize-incremental|materialize_features|FeatureGenJob|FeatureJoinJob|streaming ingestion|sink|RedisSink/gi);
    const retrievalCount = countMatches(source.text, /get_historical_features|get_online_features|historical features|online features|point-in-time|FeatureJoin|entity_df|multi_get_online_features|serving API/gi);
    const registryCount = countMatches(source.text, /registry|FeatureRegistry|FeathrRegistry|registry_store|feature_registry|apply_entity|apply_feature_view/gi);
    const trainingDatasetCount = countMatches(source.text, /training dataset|TrainingDataset|training data|point-in-time correct|historical feature table/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|feast apply|feast materialize|materialize_features|feature store test|upload-artifact|pytest/gi);
    const totalSignals = definitionCount + entityCount + sourceCount + offlineStoreCount + onlineStoreCount + materializationCount + retrievalCount + registryCount + trainingDatasetCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: featureStoreTool(source),
      definitionCount,
      entityCount,
      sourceCount,
      offlineStoreCount,
      onlineStoreCount,
      materializationCount,
      retrievalCount,
      registryCount,
      trainingDatasetCount,
      ciCount,
      readiness: definitionCount > 0 && entityCount > 0 && sourceCount > 0 && (offlineStoreCount + onlineStoreCount + registryCount) > 0 && (retrievalCount + trainingDatasetCount) > 0 && (materializationCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} feature store readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.definitionCount + b.entityCount + b.sourceCount + b.offlineStoreCount + b.onlineStoreCount + b.materializationCount + b.retrievalCount + b.registryCount + b.trainingDatasetCount + b.ciCount) - (a.definitionCount + a.entityCount + a.sourceCount + a.offlineStoreCount + a.onlineStoreCount + a.materializationCount + a.retrievalCount + a.registryCount + a.trainingDatasetCount + a.ciCount))
    .slice(0, 60);
}

function featureStoreTool(source: FeatureStoreSourceFile): FeatureStoreReadinessReport["featureStoreSetups"][number]["tool"] {
  if (/hopsworks/i.test(source.filePath) || /Hopsworks|FeatureGroup|Feature View|Feature Store API|TrainingDataset|featurestore/i.test(source.text)) return "hopsworks";
  if (/feathr/i.test(source.filePath) || /Feathr|FeatureAnchor|DerivedFeature|RedisSink|FeatureJoinJob|FeatureGenJob|FeathrRegistry/i.test(source.text)) return "feathr";
  if (/feast/i.test(source.filePath) || /from feast|FeatureStore|FeatureView|FeatureService|feast apply|feast materialize/i.test(source.text)) return "feast";
  if (/feature|registry|materialize|online|offline/i.test(source.filePath) || /feature store|feature view|online store|offline store/i.test(source.text)) return "custom";
  return "unknown";
}

function featureStoreDefinitionSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["definitionSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["definitionSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "entity", pattern: /Entity|entities|join_key|primary_key/i, evidence: "feature entity evidence was detected." },
    { signal: "feature-view", pattern: /FeatureView|BatchFeatureView|StreamFeatureView|feature view/i, evidence: "feature view evidence was detected." },
    { signal: "feature-service", pattern: /FeatureService|feature service/i, evidence: "feature service evidence was detected." },
    { signal: "feature-anchor", pattern: /FeatureAnchor|anchor_list|Feature Anchor/i, evidence: "Feathr feature anchor evidence was detected." },
    { signal: "derived-feature", pattern: /DerivedFeature|derived feature|OnDemandFeatureView|transformation/i, evidence: "derived/on-demand feature evidence was detected." },
    { signal: "feature-group", pattern: /FeatureGroup|feature group|Feature Group/i, evidence: "Hopsworks feature group evidence was detected." },
    { signal: "schema-field", pattern: /Field\b|schema|features=|features:/i, evidence: "feature schema field evidence was detected." },
    { signal: "transform", pattern: /transform|UDF|Spark SQL|feature_transformation|Aggregation/i, evidence: "feature transformation evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "definition", "signal");
}

function featureStoreSourceSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["sourceSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["sourceSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "batch-source", pattern: /batch_source|BatchSource|FileSource|SparkSource|SnowflakeSource|BigQuerySource/i, evidence: "batch source evidence was detected." },
    { signal: "stream-source", pattern: /stream_source|StreamFeatureView|KafkaConfig|Kinesis|streaming source/i, evidence: "stream source evidence was detected." },
    { signal: "request-source", pattern: /RequestSource|request source|INPUT_CONTEXT/i, evidence: "request source evidence was detected." },
    { signal: "push-source", pattern: /PushSource|push source|push support/i, evidence: "push source evidence was detected." },
    { signal: "data-source", pattern: /DataSource|SparkSqlSource|source:/i, evidence: "data source evidence was detected." },
    { signal: "event-timestamp", pattern: /event_timestamp|timestamp_field|event timestamp/i, evidence: "event timestamp evidence was detected." },
    { signal: "ttl", pattern: /ttl|TTL|freshness/i, evidence: "TTL/freshness evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "source", "signal");
}

function featureStoreStorageSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["storageSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["storageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "offline-store", pattern: /offline_store|offline store|OfflineStore/i, evidence: "offline store evidence was detected." },
    { signal: "online-store", pattern: /online_store|online store|OnlineStore/i, evidence: "online store evidence was detected." },
    { signal: "registry", pattern: /registry|FeatureRegistry|FeathrRegistry|feature_registry|registry_store/i, evidence: "feature registry evidence was detected." },
    { signal: "provider", pattern: /provider|Provider|RepoConfig|feature_store\.ya?ml/i, evidence: "provider/config evidence was detected." },
    { signal: "redis", pattern: /Redis|RedisSink|redis/i, evidence: "Redis online store evidence was detected." },
    { signal: "spark", pattern: /Spark|SparkSession|SparkSqlSource|pyspark/i, evidence: "Spark compute/source evidence was detected." },
    { signal: "snowflake", pattern: /Snowflake|SnowflakeSource/i, evidence: "Snowflake store/source evidence was detected." },
    { signal: "bigquery", pattern: /BigQuery|BigQuerySource/i, evidence: "BigQuery store/source evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "storage", "signal");
}

function featureStoreRetrievalSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["retrievalSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["retrievalSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "historical-features", pattern: /get_historical_features|historical features|historical feature table/i, evidence: "historical feature retrieval evidence was detected." },
    { signal: "online-features", pattern: /get_online_features|multi_get_online_features|online features/i, evidence: "online feature retrieval evidence was detected." },
    { signal: "point-in-time", pattern: /point-in-time|point in time|point_in_time|point-in-time correct/i, evidence: "point-in-time correctness evidence was detected." },
    { signal: "training-dataset", pattern: /training dataset|TrainingDataset|training data/i, evidence: "training dataset evidence was detected." },
    { signal: "feature-join", pattern: /FeatureJoin|feature join|join configuration|entity_df/i, evidence: "feature join evidence was detected." },
    { signal: "entity-df", pattern: /entity_df|entity dataframe|entity rows/i, evidence: "entity dataframe evidence was detected." },
    { signal: "serving-api", pattern: /feature server|serving API|online scoring|serve features|Feature Store API/i, evidence: "serving API evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "retrieval", "signal");
}

function featureStoreMaterializationSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["materializationSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["materializationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "materialize-command", pattern: /feast materialize|materialize_features|materialize\(/i, evidence: "materialization command/API evidence was detected." },
    { signal: "incremental-materialize", pattern: /materialize-incremental|materialize_incremental|incremental materialization/i, evidence: "incremental materialization evidence was detected." },
    { signal: "scheduled-materialization", pattern: /schedule|cron|Airflow|DAG|scheduled materialization/i, evidence: "scheduled materialization evidence was detected." },
    { signal: "streaming-ingestion", pattern: /streaming ingestion|Kafka|Kinesis|streaming job|streaming=True/i, evidence: "streaming ingestion evidence was detected." },
    { signal: "sink", pattern: /RedisSink|sink|online sink|offline sink/i, evidence: "feature sink evidence was detected." },
    { signal: "feature-server", pattern: /feature server|FeatureServer|serve|serving/i, evidence: "feature server evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "materialization", "signal");
}

function featureStoreCiSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["ciSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "feature-store-apply-command", pattern: /feast apply|feature store apply|FeatureStore\.apply|client\.register|registry apply/i, evidence: "feature store apply/register command evidence was detected." },
    { signal: "materialization-command", pattern: /feast materialize|materialize_features|materialize-incremental|FeatureGenJob/i, evidence: "materialization command evidence was detected." },
    { signal: "offline-online-test-command", pattern: /get_historical_features|get_online_features|offline.*online|feature store test|pytest/i, evidence: "offline/online feature test evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|registry\.db|feature-store-report|training-dataset|feature artifacts/i, evidence: "feature store artifact upload evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function featureStorePackageSignals(sourceFiles: FeatureStoreSourceFile[]): FeatureStoreReadinessReport["packageSignals"] {
  const specs: Array<{ signal: FeatureStoreReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "feast", pattern: /feast|FeatureStore|FeatureView/i, evidence: "Feast package/API evidence was detected." },
    { signal: "feathr", pattern: /feathr|FeatureAnchor|DerivedFeature|FeathrRegistry/i, evidence: "Feathr package/API evidence was detected." },
    { signal: "hopsworks", pattern: /hopsworks|FeatureGroup|Feature Store API|TrainingDataset/i, evidence: "Hopsworks package/API evidence was detected." },
    { signal: "redis", pattern: /redis|Redis|RedisSink/i, evidence: "Redis package/API evidence was detected." },
    { signal: "spark", pattern: /pyspark|SparkSession|SparkSqlSource|spark/i, evidence: "Spark package/API evidence was detected." },
    { signal: "kafka", pattern: /kafka|KafkaConfig|Kinesis/i, evidence: "Kafka/stream package evidence was detected." }
  ];
  return featureStoreSignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function featureStoreSignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: FeatureStoreSourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/feature-store-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}

export async function buildModelRegistryReadinessReport(walk: WalkResult): Promise<ModelRegistryReadinessReport> {
  const sourceFiles = await modelRegistrySourceFiles(walk);
  const modelRegistrySetups = modelRegistrySetupsFromSources(sourceFiles);
  const registrationSignals = modelRegistryRegistrationSignals(sourceFiles);
  const metadataSignals = modelRegistryMetadataSignals(sourceFiles);
  const artifactSignals = modelRegistryArtifactSignals(sourceFiles);
  const lifecycleSignals = modelRegistryLifecycleSignals(sourceFiles);
  const servingSignals = modelRegistryServingSignals(sourceFiles);
  const lineageSignals = modelRegistryLineageSignals(sourceFiles);
  const ciSignals = modelRegistryCiSignals(sourceFiles);
  const packageSignals = modelRegistryPackageSignals(sourceFiles);

  const hasRegistration = registrationSignals.filter((item) => item.readiness === "ready").length >= 2 || modelRegistrySetups.some((item) => item.registeredModelCount > 0 && item.versionCount > 0);
  const hasArtifacts = artifactSignals.some((item) => item.readiness === "ready") || modelRegistrySetups.some((item) => item.artifactCount > 0);
  const hasMetadata = metadataSignals.some((item) => item.readiness === "ready") || modelRegistrySetups.some((item) => item.metadataCount + item.aliasCount + item.stageCount + item.signatureCount > 0);
  const hasLifecycle = lifecycleSignals.some((item) => item.readiness === "ready") || modelRegistrySetups.some((item) => item.versionCount > 0);
  const hasServing = servingSignals.some((item) => item.readiness === "ready") || modelRegistrySetups.some((item) => item.servingCount > 0);
  const hasCi = ciSignals.some((item) => item.readiness === "ready") || modelRegistrySetups.some((item) => item.ciCount > 0);

  const riskQueue: ModelRegistryReadinessReport["riskQueue"] = [];
  if (!hasRegistration) {
    riskQueue.push({
      priority: "high",
      action: "Add registered model and model version evidence before claiming model registry readiness.",
      why: "A model registry must identify model families and immutable model versions separately.",
      relatedHref: "html/model-registry-readiness.html"
    });
  }
  if (hasRegistration && !hasArtifacts) {
    riskQueue.push({
      priority: "high",
      action: "Record model artifact URI, model URI, download URI, Bento artifact, or container image evidence.",
      why: "Model versions are not reproducible without a durable artifact pointer.",
      relatedHref: "html/model-registry-readiness.html"
    });
  }
  if (hasRegistration && !hasMetadata) {
    riskQueue.push({
      priority: "medium",
      action: "Add tags, aliases, stages, signatures, input examples, descriptions, or metrics to model versions.",
      why: "Learners need metadata to understand promotion state, compatibility, and model quality.",
      relatedHref: "html/model-registry-readiness.html"
    });
  }
  if (hasRegistration && !hasLifecycle) {
    riskQueue.push({
      priority: "medium",
      action: "Document create, update, search, delete, stage transition, promotion, approval, or rollback operations.",
      why: "A registry is operationally useful only if version lifecycle actions are visible.",
      relatedHref: "html/model-registry-readiness.html"
    });
  }
  if (hasArtifacts && !hasServing) {
    riskQueue.push({
      priority: "low",
      action: "Link registry versions to serving environments, inference services, REST/gRPC APIs, or Bento deployment commands.",
      why: "Model registry readiness should show how a version reaches batch or online inference.",
      relatedHref: "html/model-registry-readiness.html"
    });
  }
  if ((hasRegistration || hasServing) && !hasCi) {
    riskQueue.push({
      priority: "low",
      action: "Run model registration, model tests, serving smoke checks, and artifact uploads in CI.",
      why: "Model registry state should be reproducible outside a local notebook or UI session.",
      relatedHref: "html/model-registry-readiness.html"
    });
  }

  return {
    summary: `Model registry readiness report: registry setup ${modelRegistrySetups.length}개, registration signal ${registrationSignals.length}개, metadata signal ${metadataSignals.length}개, serving signal ${servingSignals.length}개를 정적 분석으로 정리했습니다.`,
    sourcePattern: "Model registry readiness MLflow Kubeflow Model Registry BentoML RegisteredModel ModelVersion ModelArtifact model URI artifact URI alias stage tag signature input example lineage serving environment inference service KServe REST gRPC Bento build containerize CI",
    modelRegistrySetups,
    registrationSignals,
    metadataSignals,
    artifactSignals,
    lifecycleSignals,
    servingSignals,
    lineageSignals,
    ciSignals,
    packageSignals,
    riskQueue,
    recommendedCommands: [
      { command: "rg \"RegisteredModel|registered_model|register_model|ModelVersion|model version\" .", purpose: "Find registered model and model version definitions." },
      { command: "rg \"ModelArtifact|artifact_uri|model_uri|models:/|download URI|bentoml build|containerize\" .", purpose: "Find durable model artifact and packaging pointers." },
      { command: "rg \"alias|stage|tag|signature|input_example|customProperties|metric\" .", purpose: "Find registry metadata, compatibility, and promotion state." },
      { command: "rg \"InferenceService|ServingEnvironment|KServe|REST|gRPC|bentoml serve|deployment\" .", purpose: "Find serving links from registry versions to inference endpoints." },
      { command: "rg \"register_model|mlflow models serve|bentoml build|pytest|upload-artifact|curl\" .github workflows .", purpose: "Find CI registration, validation, and serving smoke evidence." }
    ],
    learnerNextSteps: [
      "먼저 MLflow, Kubeflow Model Registry, BentoML 또는 custom model registry 정의가 있는지 찾으세요.",
      "RegisteredModel과 ModelVersion이 모델 family와 immutable version을 분리해서 설명하는지 확인하세요.",
      "ModelArtifact, artifact URI, model URI, Bento tag, container image처럼 재현 가능한 artifact pointer가 있는지 확인하세요.",
      "alias, stage, tag, signature, input example, metric, lineage metadata가 promotion 판단을 돕는지 확인하세요.",
      "InferenceService, serving environment, REST/gRPC, Bento serve/deploy, CI smoke test로 registry version이 inference까지 연결되는지 확인하세요."
    ]
  };
}

type ModelRegistrySourceFile = {
  filePath: string;
  text: string;
  sourceHref: string;
};

async function modelRegistrySourceFiles(walk: WalkResult): Promise<ModelRegistrySourceFile[]> {
  const rows: ModelRegistrySourceFile[] = [];
  for (const file of walk.files) {
    if (!file.isTextCandidate) continue;
    if (!modelRegistryInspectablePath(file.relPath)) continue;
    const text = await readTextIfSafe(file.absPath, 240_000);
    if (!text) continue;
    if (!modelRegistryPathSignal(file.relPath) && !modelRegistryContentSignal(text)) continue;
    rows.push({ filePath: file.relPath, text, sourceHref: `source/${encodedPath(file.relPath)}` });
  }
  return rows.slice(0, 240);
}

function modelRegistryInspectablePath(filePath: string): boolean {
  const base = path.basename(filePath);
  return /^(package\.json|pyproject\.toml|requirements\.txt|setup\.py|setup\.cfg|bentofile\.ya?ml|model-registry\.ya?ml|model_registry\.ya?ml|workflow\.ya?ml|service\.py)$/i.test(base)
    || /(^|\/)(mlflow|model_registry|model-registry|models|model_store|model-store|bentoml|bento|kserve|inference_service|inferenceservice|serving_environment|serving-environment)(\/|\.|-|_|$)/i.test(filePath)
    || /(^|\/)\.github\/workflows\/[^/]+\.(ya?ml)$/i.test(filePath)
    || /\.(json|ya?ml|toml|txt|ts|tsx|js|jsx|mjs|cjs|md|sql|py|go|java|scala|kt|rs)$/i.test(filePath);
}

function modelRegistryPathSignal(filePath: string): boolean {
  return /(^|\/)(mlflow|model_registry|model-registry|models|model_store|model-store|bentoml|bento|kserve|inference_service|inferenceservice|serving_environment|serving-environment)(\/|\.|-|_|$)/i.test(filePath)
    || /^(bentofile\.ya?ml|model-registry\.ya?ml|model_registry\.ya?ml|service\.py)$/i.test(path.basename(filePath));
}

function modelRegistryContentSignal(text: string): boolean {
  return /Model Registry|RegisteredModel|registered model|ModelVersion|model version|ModelArtifact|artifact_uri|model_uri|models:\/|MlflowClient|register_model|set_registered_model_alias|transition_model_version_stage|ServingEnvironment|InferenceService|KServe|bentoml\.models|bentoml build|bentoml serve|containerize/i.test(text);
}

function modelRegistrySetupsFromSources(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["modelRegistrySetups"] {
  const rows: ModelRegistryReadinessReport["modelRegistrySetups"] = [];
  for (const source of sourceFiles) {
    const registeredModelCount = countMatches(source.text, /RegisteredModel|registered model|registered_model|create_registered_model|CreateRegisteredModel|registered_model_name|bentoml\.models|ModelStore/gi);
    const versionCount = countMatches(source.text, /ModelVersion|model version|create_model_version|CreateModelVersion|models:\/|version\b|Tag\b|bento tag/gi);
    const artifactCount = countMatches(source.text, /ModelArtifact|artifact_uri|artifact URI|model_uri|download URI|GetModelVersionDownloadUri|Bento\b|bentoml build|containerize|container image|Docker image/gi);
    const metadataCount = countMatches(source.text, /tag|alias|stage|customProperties|custom property|description|metric|signature|input_example|input example/gi);
    const aliasCount = countMatches(source.text, /alias|set_registered_model_alias|SetRegisteredModelAlias|GetModelVersionByAlias/gi);
    const stageCount = countMatches(source.text, /stage|Staging|Production|Archived|transition_model_version_stage|transition stage|promote/gi);
    const lineageCount = countMatches(source.text, /lineage|source_run_id|run_id|dataset|provenance|EmitModelVersionLineage|source run/gi);
    const signatureCount = countMatches(source.text, /signature|ModelSignature|infer_signature|input_example|input example|schema/gi);
    const servingCount = countMatches(source.text, /InferenceService|ServingEnvironment|KServe|model server|REST|gRPC|grpc|bentoml serve|bentoml deploy|deployment|serving/gi);
    const ciCount = countMatches(source.text, /\.github\/workflows|github actions|register_model|mlflow models serve|bentoml build|bentoml containerize|pytest|curl|upload-artifact/gi);
    const totalSignals = registeredModelCount + versionCount + artifactCount + metadataCount + aliasCount + stageCount + lineageCount + signatureCount + servingCount + ciCount;
    if (totalSignals === 0) continue;
    rows.push({
      filePath: source.filePath,
      tool: modelRegistryTool(source),
      registeredModelCount,
      versionCount,
      artifactCount,
      metadataCount,
      aliasCount,
      stageCount,
      lineageCount,
      signatureCount,
      servingCount,
      ciCount,
      readiness: registeredModelCount > 0 && versionCount > 0 && artifactCount > 0 && metadataCount > 0 && (servingCount + ciCount) > 0 ? "ready" : "partial",
      evidence: `${totalSignals} model registry readiness signal(s) detected in this file.`,
      sourceHref: source.sourceHref
    });
  }
  return rows
    .sort((a, b) => (b.registeredModelCount + b.versionCount + b.artifactCount + b.metadataCount + b.aliasCount + b.stageCount + b.lineageCount + b.signatureCount + b.servingCount + b.ciCount) - (a.registeredModelCount + a.versionCount + a.artifactCount + a.metadataCount + a.aliasCount + a.stageCount + a.lineageCount + a.signatureCount + a.servingCount + a.ciCount))
    .slice(0, 60);
}

function modelRegistryTool(source: ModelRegistrySourceFile): ModelRegistryReadinessReport["modelRegistrySetups"][number]["tool"] {
  if (/kubeflow|model-registry|model_registry|kserve|inference/i.test(source.filePath) || /Kubeflow|Model Registry Service|model_registry\/v1|ServingEnvironment|InferenceService|KServe/i.test(source.text)) return "kubeflow";
  if (/bentoml|bento/i.test(source.filePath) || /BentoML|bentoml\.models|bentoml build|bentoml serve|containerize|BentoCloud/i.test(source.text)) return "bentoml";
  if (/mlflow/i.test(source.filePath) || /MLflow|MlflowClient|mlflow\.(register_model|models)|models:\/|transition_model_version_stage|set_registered_model_alias/i.test(source.text)) return "mlflow";
  if (/model|registry|serving/i.test(source.filePath) || /model registry|registered model|model version|model artifact/i.test(source.text)) return "custom";
  return "unknown";
}

function modelRegistryRegistrationSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["registrationSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["registrationSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "registered-model", pattern: /RegisteredModel|registered model|registered_model|create_registered_model|CreateRegisteredModel|registered_model_name/i, evidence: "registered model evidence was detected." },
    { signal: "model-version", pattern: /ModelVersion|model version|create_model_version|CreateModelVersion|models:\//i, evidence: "model version evidence was detected." },
    { signal: "model-artifact", pattern: /ModelArtifact|model artifact|artifact_uri|artifact URI/i, evidence: "model artifact evidence was detected." },
    { signal: "model-uri", pattern: /model_uri|model URI|models:\/|model path/i, evidence: "model URI evidence was detected." },
    { signal: "model-store", pattern: /ModelStore|model store|bentoml\.models|bentoml models/i, evidence: "model store evidence was detected." },
    { signal: "bento", pattern: /Bento\b|bentofile|bentoml build|bento tag/i, evidence: "Bento artifact evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "registration", "signal");
}

function modelRegistryMetadataSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["metadataSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["metadataSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "tag", pattern: /tag|set_tag|SetRegisteredModelTag|SetModelVersionTag/i, evidence: "tag metadata evidence was detected." },
    { signal: "alias", pattern: /alias|set_registered_model_alias|SetRegisteredModelAlias|GetModelVersionByAlias/i, evidence: "alias metadata evidence was detected." },
    { signal: "stage", pattern: /stage|Staging|Production|Archived|transition_model_version_stage/i, evidence: "stage/promotion evidence was detected." },
    { signal: "custom-property", pattern: /customProperties|custom property|MetadataStringValue|metadata value/i, evidence: "custom property evidence was detected." },
    { signal: "description", pattern: /description|model description|versionDescription/i, evidence: "description evidence was detected." },
    { signal: "metric", pattern: /metric|versionScore|accuracy|auc|f1|evaluation/i, evidence: "metric/evaluation evidence was detected." },
    { signal: "signature", pattern: /signature|ModelSignature|infer_signature|schema/i, evidence: "model signature evidence was detected." },
    { signal: "input-example", pattern: /input_example|input example|example input/i, evidence: "input example evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "metadata", "signal");
}

function modelRegistryArtifactSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["artifactSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["artifactSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "artifact-uri", pattern: /artifact_uri|artifact URI|Artifact URI|ARTIFACT_URI/i, evidence: "artifact URI evidence was detected." },
    { signal: "model-uri", pattern: /model_uri|model URI|models:\/|runs:\/|s3:\/\/|gs:\/\//i, evidence: "model URI evidence was detected." },
    { signal: "download-uri", pattern: /download URI|download_uri|GetModelVersionDownloadUri|get-download-uri/i, evidence: "download URI evidence was detected." },
    { signal: "container-image", pattern: /container image|Docker image|image:|containerize|bentoml containerize/i, evidence: "container image evidence was detected." },
    { signal: "dockerfile", pattern: /Dockerfile|docker build|docker run/i, evidence: "Dockerfile/container build evidence was detected." },
    { signal: "bento-build", pattern: /bentoml build|bentofile|Bento\b/i, evidence: "Bento build evidence was detected." },
    { signal: "package-config", pattern: /pyproject\.toml|requirements\.txt|python_packages|conda|pip_requirements|bentofile/i, evidence: "model package config evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "artifact", "signal");
}

function modelRegistryLifecycleSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["lifecycleSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["lifecycleSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "create", pattern: /create_registered_model|CreateRegisteredModel|create_model_version|CreateModelVersion|register_model/i, evidence: "create/register evidence was detected." },
    { signal: "update", pattern: /UpdateRegisteredModel|UpdateModelVersion|upsert|patch|update model/i, evidence: "update/upsert evidence was detected." },
    { signal: "search", pattern: /SearchRegisteredModels|SearchModelVersions|search_registered_models|search_model_versions|FindRegisteredModel|FindModelVersion/i, evidence: "search/list evidence was detected." },
    { signal: "delete", pattern: /DeleteRegisteredModel|DeleteModelVersion|delete_registered_model|delete_model_version/i, evidence: "delete evidence was detected." },
    { signal: "transition-stage", pattern: /transition_model_version_stage|transition stage|Staging|Production|Archived/i, evidence: "stage transition evidence was detected." },
    { signal: "approval", pattern: /approval|approve|review|validated|champion/i, evidence: "approval/review evidence was detected." },
    { signal: "promotion", pattern: /promote|promotion|Production|candidate|champion/i, evidence: "promotion evidence was detected." },
    { signal: "rollback", pattern: /rollback|roll back|previous version|Archived/i, evidence: "rollback evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "lifecycle", "signal");
}

function modelRegistryServingSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["servingSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["servingSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "inference-service", pattern: /InferenceService|inference service|inference_services/i, evidence: "inference service evidence was detected." },
    { signal: "serving-environment", pattern: /ServingEnvironment|serving environment|serving_environments/i, evidence: "serving environment evidence was detected." },
    { signal: "kserve", pattern: /KServe|serving\.kserve\.io|kserve/i, evidence: "KServe evidence was detected." },
    { signal: "model-server", pattern: /model server|mlflow models serve|BentoServer|server:/i, evidence: "model server evidence was detected." },
    { signal: "rest-api", pattern: /REST|HTTP|curl|OpenAPI|\/api\/model_registry/i, evidence: "REST API evidence was detected." },
    { signal: "grpc", pattern: /gRPC|grpc/i, evidence: "gRPC evidence was detected." },
    { signal: "bento-serve", pattern: /bentoml serve|BentoServer|@bentoml\.service/i, evidence: "Bento serve evidence was detected." },
    { signal: "deployment", pattern: /deployment|deploy|bentoml deploy|BentoCloud|SageMaker|Kubernetes/i, evidence: "deployment evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "serving", "signal");
}

function modelRegistryLineageSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["lineageSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["lineageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "run-link", pattern: /run_id|run id|source run|source_run_id|runs:\//i, evidence: "run link evidence was detected." },
    { signal: "source-run", pattern: /source_run_id|source run|run_uuid/i, evidence: "source run evidence was detected." },
    { signal: "model-version-lineage", pattern: /EmitModelVersionLineage|model version lineage|version lineage/i, evidence: "model version lineage evidence was detected." },
    { signal: "dataset-link", pattern: /dataset|Dataset|training data|input dataset/i, evidence: "dataset link evidence was detected." },
    { signal: "evaluation-metric", pattern: /metric|evaluation|accuracy|auc|f1|versionScore/i, evidence: "evaluation metric evidence was detected." },
    { signal: "provenance", pattern: /provenance|source|created_by|created at|lineage/i, evidence: "provenance evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "lineage", "signal");
}

function modelRegistryCiSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["ciSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["ciSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "github-actions", pattern: /\.github\/workflows|github actions|uses: actions\//i, evidence: "GitHub Actions workflow evidence was detected." },
    { signal: "register-command", pattern: /register_model|mlflow register|CreateRegisteredModel|CreateModelVersion|bentoml build/i, evidence: "model registration command evidence was detected." },
    { signal: "model-test-command", pattern: /pytest|model test|signature validation|predict\(|evaluation/i, evidence: "model test command evidence was detected." },
    { signal: "serving-smoke-command", pattern: /mlflow models serve|bentoml serve|curl|InferenceService|smoke/i, evidence: "serving smoke command evidence was detected." },
    { signal: "artifact-upload", pattern: /upload-artifact|artifact_uri|model-uri|bento tag|container image|registry-report/i, evidence: "model registry artifact upload evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "CI", "signal");
}

function modelRegistryPackageSignals(sourceFiles: ModelRegistrySourceFile[]): ModelRegistryReadinessReport["packageSignals"] {
  const specs: Array<{ signal: ModelRegistryReadinessReport["packageSignals"][number]["signal"]; pattern: RegExp; evidence: string }> = [
    { signal: "mlflow", pattern: /mlflow|MlflowClient|register_model|models:\//i, evidence: "MLflow package/API evidence was detected." },
    { signal: "kubeflow-model-registry", pattern: /model-registry|model_registry|kubeflow|RegisteredModel|ModelVersion|ModelArtifact/i, evidence: "Kubeflow Model Registry package/API evidence was detected." },
    { signal: "bentoml", pattern: /bentoml|BentoML|bentofile|Bento\b/i, evidence: "BentoML package/API evidence was detected." },
    { signal: "kserve", pattern: /kserve|KServe|serving\.kserve\.io|InferenceService/i, evidence: "KServe serving evidence was detected." },
    { signal: "docker", pattern: /Dockerfile|docker|containerize|container image/i, evidence: "Docker/container package evidence was detected." }
  ];
  return modelRegistrySignalFromSpecs(sourceFiles, specs, "package", "signal");
}

function modelRegistrySignalFromSpecs<T extends Record<K, string> & { pattern: RegExp; evidence: string }, K extends string>(
  sourceFiles: ModelRegistrySourceFile[],
  specs: T[],
  label: string,
  labelKey: K
): Array<Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string }> {
  return specs.map((spec) => {
    const match = sourceFiles.find((source) => spec.pattern.test(source.filePath) || spec.pattern.test(source.text));
    return {
      [labelKey]: spec[labelKey],
      readiness: match ? "ready" : "missing",
      evidence: match ? `${match.filePath} ${spec.evidence}` : `${label} ${spec[labelKey]} evidence was not detected.`,
      relatedHref: match?.sourceHref ?? "html/model-registry-readiness.html"
    } as Record<K, T[K]> & { readiness: "ready" | "missing"; evidence: string; relatedHref: string };
  });
}
