use crate::models::{QuizAttemptResponse, SessionRow, StudyResponse};
use crate::runtime::{add_studies_root_param, studies_root_override};
use crate::sidecar::call_sidecar;
use serde_json::json;
use std::process::Command;

#[tauri::command]
pub(crate) fn study_source(
    source: String,
    mode: String,
    level: String,
    enable_codex: bool,
    learner_brief_text: Option<String>,
) -> Result<StudyResponse, String> {
    let mut sidecar_params = json!({
        "source": source.clone(),
        "mode": mode.clone(),
        "level": level.clone(),
        "enableCodex": enable_codex,
        "learnerBriefText": learner_brief_text.clone()
    });
    add_studies_root_param(&mut sidecar_params);
    if let Some(result) = call_sidecar("study", sidecar_params) {
        return result
            .and_then(|value| serde_json::from_value(value).map_err(|error| error.to_string()));
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let mut temp_brief_path: Option<std::path::PathBuf> = None;
    let mut args = vec![
        "study".to_string(),
        source.clone(),
        "--mode".to_string(),
        mode.clone(),
        "--level".to_string(),
        level.clone(),
    ];
    if !enable_codex {
        args.push("--no-codex".to_string());
    }
    if let Some(text) = learner_brief_text
        .as_ref()
        .filter(|value| !value.trim().is_empty())
    {
        let temp_path = std::env::temp_dir().join(format!(
            "repotutor-tauri-learner-brief-{}.md",
            std::process::id()
        ));
        std::fs::write(&temp_path, text).map_err(|error| error.to_string())?;
        let temp_path_arg = temp_path.to_string_lossy().to_string();
        temp_brief_path = Some(temp_path);
        args.push("--learner-brief".to_string());
        args.push(temp_path_arg);
    }
    if let Some(studies_root) = studies_root_override() {
        args.push("--studies-root".to_string());
        args.push(studies_root);
    }
    let output = Command::new(cli)
        .args(args)
        .output()
        .map_err(|error| error.to_string())?;
    if let Some(path) = temp_brief_path {
        let _ = std::fs::remove_file(path);
    }
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

#[tauri::command]
pub(crate) fn resume_session(session_path: String) -> Result<StudyResponse, String> {
    if let Some(result) = call_sidecar("resume", json!({ "sessionPath": session_path.clone() })) {
        return result
            .and_then(|value| serde_json::from_value(value).map_err(|error| error.to_string()));
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let output = Command::new(cli)
        .args(["resume", &session_path, "--format", "json"])
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    let mut value: serde_json::Value =
        serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())?;
    let root = value
        .get("root")
        .and_then(|item| item.as_str())
        .unwrap_or(&session_path)
        .to_string();
    if value.get("path").is_none() {
        value["path"] = json!(root.clone());
    }
    if value.get("status").is_none() {
        value["status"] = json!("complete");
    }
    if value.get("learnerGoalAlignmentHtml").is_none() {
        value["learnerGoalAlignmentHtml"] = json!(std::path::Path::new(&root)
            .join("reference")
            .join("learner-goal-alignment.html")
            .to_string_lossy()
            .to_string());
    }
    if value.get("quizQuestions").is_none() {
        let quiz_questions =
            std::fs::read_to_string(std::path::Path::new(&root).join("session.json"))
                .ok()
                .and_then(|text| serde_json::from_str::<serde_json::Value>(&text).ok())
                .and_then(|session| {
                    session
                        .pointer("/quizSummary/totalQuestions")
                        .and_then(|item| item.as_u64())
                })
                .unwrap_or(0);
        value["quizQuestions"] = json!(quiz_questions);
    }
    serde_json::from_value(value).map_err(|error| error.to_string())
}

#[tauri::command]
pub(crate) fn load_quiz(session_path: String) -> Result<serde_json::Value, String> {
    let quiz_path = std::path::Path::new(&session_path)
        .join("analysis")
        .join("quiz.json");
    let text = std::fs::read_to_string(quiz_path).map_err(|error| error.to_string())?;
    serde_json::from_str(&text).map_err(|error| error.to_string())
}

#[tauri::command]
pub(crate) fn submit_quiz(
    session_path: String,
    answers: serde_json::Value,
) -> Result<QuizAttemptResponse, String> {
    if let Some(result) = call_sidecar(
        "quiz",
        json!({ "sessionPath": session_path.clone(), "answers": answers.clone() }),
    ) {
        return result
            .and_then(|value| serde_json::from_value(value).map_err(|error| error.to_string()));
    }
    let temp_path = std::env::temp_dir().join(format!(
        "repotutor-tauri-answers-{}.json",
        std::process::id()
    ));
    std::fs::write(&temp_path, answers.to_string()).map_err(|error| error.to_string())?;
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let output = Command::new(cli)
        .args([
            "quiz",
            &session_path,
            "--answers",
            temp_path.to_string_lossy().as_ref(),
        ])
        .output()
        .map_err(|error| error.to_string())?;
    let _ = std::fs::remove_file(temp_path);
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

#[tauri::command]
pub(crate) fn list_sessions() -> Result<Vec<SessionRow>, String> {
    let mut sidecar_params = json!({});
    add_studies_root_param(&mut sidecar_params);
    if let Some(result) = call_sidecar("list", sidecar_params) {
        return result
            .and_then(|value| serde_json::from_value(value).map_err(|error| error.to_string()));
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let mut args = vec!["list".to_string()];
    if let Some(studies_root) = studies_root_override() {
        args.push("--studies-root".to_string());
        args.push(studies_root);
    }
    let output = Command::new(cli)
        .args(args)
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

#[tauri::command]
pub(crate) fn source_prune_plan(session_path: String) -> Result<serde_json::Value, String> {
    if let Some(result) = call_sidecar("sourcePrunePlan", json!({ "sessionPath": session_path })) {
        return result;
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let output = Command::new(cli)
        .args(["prune-source", &session_path, "--format", "json"])
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

#[tauri::command]
pub(crate) fn apply_source_prune(
    session_path: String,
    confirm: String,
) -> Result<serde_json::Value, String> {
    if confirm != "DELETE-SOURCE-SNAPSHOT" {
        return Err("source prune apply requires confirm DELETE-SOURCE-SNAPSHOT.".to_string());
    }
    if let Some(result) = call_sidecar(
        "applySourcePrune",
        json!({ "sessionPath": session_path, "confirm": confirm }),
    ) {
        return result;
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let output = Command::new(cli)
        .args([
            "prune-source",
            &session_path,
            "--apply",
            "--confirm",
            "DELETE-SOURCE-SNAPSHOT",
            "--format",
            "json",
        ])
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}
