use serde::{Deserialize, Serialize};
use serde_json::json;
use std::io::Write;
use std::process::{Command, Stdio};

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct StudyResponse {
    session_id: String,
    status: String,
    path: String,
    html: String,
    quiz_questions: u32,
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct SessionRow {
    session_id: String,
    repo: String,
    created_at: String,
    mode: String,
    score: Option<f64>,
    wrong: u32,
    path: String,
}

#[tauri::command]
fn study_source(source: String, mode: String, level: String) -> Result<StudyResponse, String> {
    if let Some(result) = call_sidecar("study", json!({ "source": source, "mode": mode, "level": level })) {
        return result.and_then(|value| serde_json::from_value(value).map_err(|error| error.to_string()));
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let output = Command::new(cli)
        .args(["study", &source, "--mode", &mode, "--level", &level])
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

#[tauri::command]
fn list_sessions() -> Result<Vec<SessionRow>, String> {
    if let Some(result) = call_sidecar("list", json!({})) {
        return result.and_then(|value| serde_json::from_value(value).map_err(|error| error.to_string()));
    }
    let cli = std::env::var("REPOTUTOR_CLI").unwrap_or_else(|_| "repo-tutor".to_string());
    let output = Command::new(cli)
        .arg("list")
        .output()
        .map_err(|error| error.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    serde_json::from_slice(&output.stdout).map_err(|error| error.to_string())
}

fn call_sidecar(method: &str, params: serde_json::Value) -> Option<Result<serde_json::Value, String>> {
    let sidecar = std::env::var("REPOTUTOR_SIDECAR").ok()?;
    let mut child = match Command::new("node")
        .arg(sidecar)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(child) => child,
        Err(error) => return Some(Err(error.to_string())),
    };
    if let Some(stdin) = child.stdin.as_mut() {
        let request = json!({ "id": "tauri-command", "method": method, "params": params });
        if let Err(error) = writeln!(stdin, "{}", request) {
            return Some(Err(error.to_string()));
        }
    }
    let output = match child.wait_with_output() {
        Ok(output) => output,
        Err(error) => return Some(Err(error.to_string())),
    };
    if !output.status.success() {
        return Some(Err(String::from_utf8_lossy(&output.stderr).to_string()));
    }
    let line = String::from_utf8_lossy(&output.stdout)
        .lines()
        .next()
        .unwrap_or("")
        .to_string();
    let envelope: serde_json::Value = match serde_json::from_str(&line) {
        Ok(value) => value,
        Err(error) => return Some(Err(error.to_string())),
    };
    if let Some(error) = envelope.pointer("/result/error").and_then(|value| value.as_str()) {
        return Some(Err(error.to_string()));
    }
    Some(Ok(envelope.get("result").cloned().unwrap_or(serde_json::Value::Null)))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![study_source, list_sessions])
        .run(tauri::generate_context!())
        .expect("error while running RepoTutor Studio");
}
