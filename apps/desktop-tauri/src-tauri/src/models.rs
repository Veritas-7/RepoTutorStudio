use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct StudyResponse {
    pub(crate) session_id: String,
    pub(crate) status: String,
    pub(crate) path: String,
    pub(crate) html: String,
    pub(crate) daily_summary_html: Option<String>,
    pub(crate) teaching_workspace_html: Option<String>,
    pub(crate) learner_goal_alignment_html: Option<String>,
    pub(crate) verification_ok: Option<bool>,
    pub(crate) verification_report: Option<String>,
    pub(crate) verification_markdown: Option<String>,
    pub(crate) verification_html: Option<String>,
    pub(crate) verification_checked_required_artifacts: Option<u32>,
    pub(crate) verification_checks: Option<serde_json::Value>,
    pub(crate) quiz_questions: u32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionRow {
    pub(crate) session_id: String,
    pub(crate) repo: String,
    pub(crate) created_at: String,
    pub(crate) mode: String,
    pub(crate) score: Option<f64>,
    pub(crate) wrong: u32,
    pub(crate) path: String,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct QuizAttemptResponse {
    pub(crate) attempt_id: String,
    pub(crate) score: f64,
    pub(crate) correct: u32,
    pub(crate) wrong: u32,
    pub(crate) wrong_notes: String,
    pub(crate) wrong_notes_html: Option<String>,
    pub(crate) wrong_notes_markdown: Option<String>,
    pub(crate) learning_record: Option<String>,
    pub(crate) review_guidance: Option<String>,
}
