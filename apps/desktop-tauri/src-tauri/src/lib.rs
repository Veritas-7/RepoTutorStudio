mod commands;
mod models;
mod runtime;
mod sidecar;

use commands::{
    apply_source_prune, list_sessions, load_quiz, resume_session, source_prune_plan, study_source,
    submit_quiz,
};

#[cfg(test)]
use runtime::resolve_sidecar_path;
#[cfg(test)]
use serde_json::json;
#[cfg(test)]
use sidecar::call_sidecar;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            study_source,
            resume_session,
            list_sessions,
            load_quiz,
            submit_quiz,
            source_prune_plan,
            apply_source_prune
        ])
        .run(tauri::generate_context!())
        .expect("error while running RepoTutor Studio");
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Map;
    use std::path::{Path, PathBuf};
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    #[ignore = "requires compiled desktop sidecar path via REPOTUTOR_SIDECAR"]
    fn call_sidecar_drives_compiled_bridge() {
        let sidecar = std::env::var("REPOTUTOR_SIDECAR")
            .expect("REPOTUTOR_SIDECAR must point at the compiled desktop sidecar bridge");
        assert!(
            Path::new(&sidecar).is_file(),
            "compiled sidecar bridge should exist: {sidecar}"
        );

        let root = repo_root();
        let studies_root = rust_sidecar_studies_root();
        std::fs::create_dir_all(&studies_root).expect("create Rust sidecar smoke studies root");
        let fixture_source = root.join("packages/core/tests/fixtures/simple-ts-app");
        assert!(
            fixture_source.is_dir(),
            "fixture source should exist: {}",
            fixture_source.display()
        );

        let study = call_sidecar(
            "study",
            json!({
                "source": fixture_source,
                "mode": "quick",
                "level": "beginner",
                "studiesRoot": studies_root,
                "enableCodex": false
            }),
        )
        .expect("REPOTUTOR_SIDECAR should enable sidecar")
        .expect("compiled sidecar study should succeed");

        let session_id = string_field(&study, "sessionId");
        let session_path = string_field(&study, "path");
        assert_eq!(
            study
                .get("verificationOk")
                .and_then(|value| value.as_bool()),
            Some(true)
        );
        assert_file(
            string_field(&study, "verificationReport"),
            "study verification report",
        );
        assert_file(
            string_field(&study, "verificationMarkdown"),
            "study verification markdown",
        );
        assert_file(
            string_field(&study, "verificationHtml"),
            "study verification html",
        );
        assert!(
            study
                .get("quizQuestions")
                .and_then(|value| value.as_u64())
                .unwrap_or(0)
                > 0
        );

        let listed = call_sidecar("list", json!({ "studiesRoot": studies_root }))
            .expect("REPOTUTOR_SIDECAR should enable sidecar")
            .expect("compiled sidecar list should succeed");
        let rows = listed.as_array().expect("list result should be an array");
        assert!(
            rows.iter().any(
                |row| row.get("sessionId").and_then(|value| value.as_str()) == Some(session_id)
            ),
            "compiled sidecar list should include the study session"
        );

        let resumed = call_sidecar("resume", json!({ "sessionPath": session_path }))
            .expect("REPOTUTOR_SIDECAR should enable sidecar")
            .expect("compiled sidecar resume should succeed");
        assert_eq!(string_field(&resumed, "sessionId"), session_id);
        assert_eq!(string_field(&resumed, "path"), session_path);
        assert_eq!(
            resumed
                .get("verificationOk")
                .and_then(|value| value.as_bool()),
            Some(true)
        );

        let quiz = std::fs::read_to_string(Path::new(session_path).join("analysis/quiz.json"))
            .expect("read generated quiz");
        let quiz: serde_json::Value = serde_json::from_str(&quiz).expect("parse generated quiz");
        let mut answers = Map::new();
        for question in quiz
            .get("questions")
            .and_then(|value| value.as_array())
            .expect("quiz questions array")
        {
            let id = string_field(question, "id").to_string();
            answers.insert(id, json!(string_field(question, "correctChoice")));
        }
        let attempt = call_sidecar(
            "quiz",
            json!({ "sessionPath": session_path, "answers": answers }),
        )
        .expect("REPOTUTOR_SIDECAR should enable sidecar")
        .expect("compiled sidecar quiz should succeed");
        assert_eq!(
            attempt.get("score").and_then(|value| value.as_f64()),
            Some(100.0)
        );
        assert_eq!(
            attempt.get("wrong").and_then(|value| value.as_u64()),
            Some(0)
        );
        assert_file(
            string_field(&attempt, "wrongNotesHtml"),
            "quiz wrong notes html",
        );
        assert_file(
            string_field(&attempt, "wrongNotesMarkdown"),
            "quiz wrong notes markdown",
        );
        assert_file(
            string_field(&attempt, "learningRecord"),
            "quiz learning record",
        );

        let prune = call_sidecar("sourcePrunePlan", json!({ "sessionPath": session_path }))
            .expect("REPOTUTOR_SIDECAR should enable sidecar")
            .expect("compiled sidecar sourcePrunePlan should succeed");
        assert_eq!(
            prune.get("applied").and_then(|value| value.as_bool()),
            Some(false)
        );
        assert_file(string_field(&prune, "reportPath"), "source prune report");
        assert_file(
            string_field(&prune, "markdownPath"),
            "source prune markdown",
        );
        assert!(
            Path::new(session_path).join("source").is_dir(),
            "source snapshot should stay present"
        );
    }

    #[test]
    #[ignore = "requires compiled desktop sidecar at the default repo path"]
    fn tauri_commands_discover_compiled_bridge_without_env() {
        let root = repo_root();
        let sidecar = root.join("apps/desktop-tauri/sidecar-dist/sidecar/bridge.js");
        assert!(
            sidecar.is_file(),
            "compiled sidecar bridge should exist at default path: {}",
            sidecar.display()
        );

        let previous_cwd = std::env::current_dir().expect("read current dir");
        let previous_sidecar = std::env::var("REPOTUTOR_SIDECAR").ok();
        let previous_studies_root = std::env::var("REPOTUTOR_STUDIES_ROOT").ok();
        std::env::remove_var("REPOTUTOR_SIDECAR");
        std::env::set_current_dir(&root).expect("set repo root cwd for default sidecar discovery");

        let resolved = resolve_sidecar_path().expect("default sidecar path should be discovered");
        assert_eq!(
            resolved, sidecar,
            "REPOTUTOR_SIDECAR-free discovery should use the compiled repo sidecar"
        );

        let studies_root = rust_sidecar_studies_root();
        std::fs::create_dir_all(&studies_root)
            .expect("create Rust default sidecar discovery studies root");
        std::env::set_var("REPOTUTOR_STUDIES_ROOT", &studies_root);
        let fixture_source = root.join("packages/core/tests/fixtures/simple-ts-app");
        assert!(
            fixture_source.is_dir(),
            "fixture source should exist: {}",
            fixture_source.display()
        );

        let study = study_source(
            fixture_source.to_string_lossy().to_string(),
            "quick".to_string(),
            "beginner".to_string(),
            false,
            Some("Prove direct app use works without a sidecar env override.".to_string()),
        )
        .expect("study_source command should discover the compiled sidecar without env");

        assert!(study.session_id.len() > 0, "session id should be non-empty");
        assert!(
            Path::new(&study.path).starts_with(&studies_root),
            "study_source should honor REPOTUTOR_STUDIES_ROOT"
        );
        assert_eq!(study.verification_ok, Some(true));
        assert!(
            study.quiz_questions > 0,
            "quiz questions should be positive"
        );
        assert_file(&study.html, "default discovery study html");
        assert!(
            Path::new(&study.path).join("source").is_dir(),
            "source snapshot should stay present"
        );

        let rows =
            list_sessions().expect("list_sessions command should use default sidecar discovery");
        assert!(
            rows.iter().any(|row| row.session_id == study.session_id),
            "list_sessions should include the discovered-sidecar study session"
        );

        let resumed = resume_session(study.path.clone())
            .expect("resume_session command should use default sidecar discovery");
        assert_eq!(resumed.session_id, study.session_id);
        assert_eq!(resumed.path, study.path);
        assert_eq!(resumed.verification_ok, Some(true));

        std::env::set_current_dir(previous_cwd).expect("restore previous cwd");
        restore_env_var("REPOTUTOR_SIDECAR", previous_sidecar);
        restore_env_var("REPOTUTOR_STUDIES_ROOT", previous_studies_root);
    }

    #[test]
    #[ignore = "requires a built macOS .app bundle with sidecar resource"]
    fn tauri_commands_discover_app_resource_sidecar_without_env() {
        let root = repo_root();
        let app_binary = root.join(
            "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app/Contents/MacOS/repotutor-studio",
        );
        let resource_sidecar = root.join(
            "apps/desktop-tauri/src-tauri/target/release/bundle/macos/RepoTutor Studio.app/Contents/Resources/sidecar-dist/sidecar/bridge.js",
        );
        assert!(
            app_binary.is_file(),
            "macOS app binary should exist: {}",
            app_binary.display()
        );
        assert!(
            resource_sidecar.is_file(),
            "bundled app resource sidecar should exist: {}",
            resource_sidecar.display()
        );

        let previous_cwd = std::env::current_dir().expect("read current dir");
        let previous_sidecar = std::env::var("REPOTUTOR_SIDECAR").ok();
        let previous_test_current_exe = std::env::var("REPOTUTOR_TEST_CURRENT_EXE").ok();
        let previous_studies_root = std::env::var("REPOTUTOR_STUDIES_ROOT").ok();
        let isolated_cwd = rust_sidecar_studies_root().join("empty-cwd");
        std::fs::create_dir_all(&isolated_cwd).expect("create isolated cwd");
        std::env::remove_var("REPOTUTOR_SIDECAR");
        std::env::set_var("REPOTUTOR_TEST_CURRENT_EXE", &app_binary);
        std::env::set_current_dir(&isolated_cwd)
            .expect("set isolated cwd so repo-relative sidecar is not discovered first");

        let resolved =
            resolve_sidecar_path().expect("app resource sidecar path should be discovered");
        assert_eq!(
            std::fs::canonicalize(&resolved).expect("canonicalize resolved sidecar"),
            std::fs::canonicalize(&resource_sidecar).expect("canonicalize resource sidecar"),
            "REPOTUTOR_SIDECAR-free app layout discovery should use the bundled resource sidecar"
        );

        let studies_root = rust_sidecar_studies_root();
        std::fs::create_dir_all(&studies_root)
            .expect("create Rust app resource sidecar studies root");
        std::env::set_var("REPOTUTOR_STUDIES_ROOT", &studies_root);
        let fixture_source = root.join("packages/core/tests/fixtures/simple-ts-app");
        assert!(
            fixture_source.is_dir(),
            "fixture source should exist: {}",
            fixture_source.display()
        );

        let study = study_source(
            fixture_source.to_string_lossy().to_string(),
            "quick".to_string(),
            "beginner".to_string(),
            false,
            Some(
                "Prove the packaged app resource sidecar is discovered by Rust commands."
                    .to_string(),
            ),
        )
        .expect("study_source command should discover the bundled app resource sidecar");

        assert!(study.session_id.len() > 0, "session id should be non-empty");
        assert!(
            Path::new(&study.path).starts_with(&studies_root),
            "study_source should honor REPOTUTOR_STUDIES_ROOT"
        );
        assert_eq!(study.verification_ok, Some(true));
        assert!(
            study.quiz_questions > 0,
            "quiz questions should be positive"
        );
        assert_file(&study.html, "app resource sidecar study html");
        assert!(
            Path::new(&study.path).join("source").is_dir(),
            "source snapshot should stay present"
        );

        let rows = list_sessions()
            .expect("list_sessions command should discover the bundled app resource sidecar");
        assert!(
            rows.iter().any(|row| row.session_id == study.session_id),
            "list_sessions should include the app-resource-sidecar study session"
        );

        let resumed = resume_session(study.path.clone())
            .expect("resume_session command should discover the bundled app resource sidecar");
        assert_eq!(resumed.session_id, study.session_id);
        assert_eq!(resumed.path, study.path);
        assert_eq!(resumed.verification_ok, Some(true));

        std::env::set_current_dir(previous_cwd).expect("restore previous cwd");
        restore_env_var("REPOTUTOR_SIDECAR", previous_sidecar);
        restore_env_var("REPOTUTOR_TEST_CURRENT_EXE", previous_test_current_exe);
        restore_env_var("REPOTUTOR_STUDIES_ROOT", previous_studies_root);
    }

    #[test]
    #[ignore = "requires compiled desktop sidecar path via REPOTUTOR_SIDECAR"]
    fn tauri_commands_drive_compiled_bridge() {
        let sidecar = std::env::var("REPOTUTOR_SIDECAR")
            .expect("REPOTUTOR_SIDECAR must point at the compiled desktop sidecar bridge");
        assert!(
            Path::new(&sidecar).is_file(),
            "compiled sidecar bridge should exist: {sidecar}"
        );

        let root = repo_root();
        let studies_root = rust_sidecar_studies_root();
        std::fs::create_dir_all(&studies_root).expect("create Rust command smoke studies root");
        std::env::set_var("REPOTUTOR_STUDIES_ROOT", &studies_root);
        let fixture_source = root.join("packages/core/tests/fixtures/simple-ts-app");
        assert!(
            fixture_source.is_dir(),
            "fixture source should exist: {}",
            fixture_source.display()
        );

        let study = study_source(
            fixture_source.to_string_lossy().to_string(),
            "quick".to_string(),
            "beginner".to_string(),
            false,
            Some("I want to learn how to brief AI to rebuild this simple app.".to_string()),
        )
        .expect("study_source command should drive compiled sidecar");

        assert!(study.session_id.len() > 0, "session id should be non-empty");
        assert!(
            Path::new(&study.path).starts_with(&studies_root),
            "study_source should honor REPOTUTOR_STUDIES_ROOT"
        );
        assert_eq!(study.verification_ok, Some(true));
        assert!(
            study.quiz_questions > 0,
            "quiz questions should be positive"
        );
        assert_file(&study.html, "study command html");
        assert_file(
            study
                .daily_summary_html
                .as_deref()
                .expect("daily summary html should be present"),
            "study command daily summary html",
        );
        assert_file(
            study
                .teaching_workspace_html
                .as_deref()
                .expect("teaching workspace html should be present"),
            "study command teaching workspace html",
        );
        assert_file(
            study
                .verification_report
                .as_deref()
                .expect("verification report should be present"),
            "study command verification report",
        );

        let rows = list_sessions().expect("list_sessions command should drive compiled sidecar");
        let listed_row = rows
            .iter()
            .find(|row| row.session_id == study.session_id)
            .expect("list_sessions should include the study_source session");
        assert_eq!(listed_row.mode, "quick");
        assert_eq!(listed_row.score, None);
        assert_eq!(listed_row.wrong, 0);
        assert_eq!(listed_row.path, study.path);

        let resumed = resume_session(study.path.clone())
            .expect("resume_session command should drive sidecar");
        assert_eq!(resumed.session_id, study.session_id);
        assert_eq!(resumed.path, study.path);
        assert_eq!(resumed.verification_ok, Some(true));

        let quiz = load_quiz(study.path.clone()).expect("load_quiz command should read quiz");
        let mut answers = Map::new();
        for question in quiz
            .get("questions")
            .and_then(|value| value.as_array())
            .expect("quiz questions array")
        {
            let id = string_field(question, "id").to_string();
            answers.insert(id, json!(string_field(question, "correctChoice")));
        }
        let attempt = submit_quiz(study.path.clone(), json!(answers))
            .expect("submit_quiz command should drive compiled sidecar");
        assert_eq!(attempt.score, 100.0);
        assert_eq!(attempt.wrong, 0);
        assert_file(
            attempt
                .wrong_notes_html
                .as_deref()
                .expect("wrong notes html should be present"),
            "submit_quiz wrong notes html",
        );
        assert_file(
            attempt
                .wrong_notes_markdown
                .as_deref()
                .expect("wrong notes markdown should be present"),
            "submit_quiz wrong notes markdown",
        );
        assert_file(
            attempt
                .learning_record
                .as_deref()
                .expect("learning record should be present"),
            "submit_quiz learning record",
        );

        let prune = source_prune_plan(study.path.clone())
            .expect("source_prune_plan command should drive compiled sidecar");
        assert_eq!(
            prune.get("applied").and_then(|value| value.as_bool()),
            Some(false)
        );
        assert_file(
            string_field(&prune, "reportPath"),
            "command source prune report",
        );
        assert_file(
            string_field(&prune, "markdownPath"),
            "command source prune markdown",
        );
        assert!(
            Path::new(&study.path).join("source").is_dir(),
            "source snapshot should stay present"
        );
        assert!(
            apply_source_prune(study.path.clone(), "WRONG".to_string()).is_err(),
            "apply_source_prune should require the explicit confirmation token"
        );

        std::env::remove_var("REPOTUTOR_STUDIES_ROOT");
    }

    fn repo_root() -> PathBuf {
        PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .and_then(|path| path.parent())
            .and_then(|path| path.parent())
            .expect("src-tauri should be nested under apps/desktop-tauri")
            .to_path_buf()
    }

    fn rust_sidecar_studies_root() -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("system time should be after UNIX_EPOCH")
            .as_nanos();
        std::env::temp_dir().join(format!(
            "repotutor-rust-sidecar-smoke-{}-{nanos}",
            std::process::id()
        ))
    }

    fn string_field<'a>(value: &'a serde_json::Value, key: &str) -> &'a str {
        value
            .get(key)
            .and_then(|field| field.as_str())
            .unwrap_or_else(|| panic!("{key} should be a non-empty string"))
    }

    fn assert_file(file_path: &str, label: &str) {
        assert!(!file_path.is_empty(), "{label} path should be non-empty");
        assert!(
            Path::new(file_path).is_file(),
            "{label} should exist: {file_path}"
        );
    }

    fn restore_env_var(key: &str, value: Option<String>) {
        match value {
            Some(value) => std::env::set_var(key, value),
            None => std::env::remove_var(key),
        }
    }
}
