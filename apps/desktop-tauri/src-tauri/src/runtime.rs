use serde_json::json;
use std::path::PathBuf;

pub(crate) fn studies_root_override() -> Option<String> {
    std::env::var("REPOTUTOR_STUDIES_ROOT")
        .ok()
        .filter(|value| !value.trim().is_empty())
}

pub(crate) fn add_studies_root_param(params: &mut serde_json::Value) {
    if let Some(studies_root) = studies_root_override() {
        params["studiesRoot"] = json!(studies_root);
    }
}

pub(crate) fn resolve_sidecar_path() -> Option<PathBuf> {
    if let Some(sidecar) = sidecar_path_override() {
        return Some(sidecar);
    }
    default_sidecar_candidates()
        .into_iter()
        .find(|path| path.is_file())
}

pub(crate) fn resolve_node_runtime() -> PathBuf {
    if let Some(node) = node_path_override() {
        return node;
    }
    default_node_candidates()
        .into_iter()
        .find(|path| path.is_file())
        .unwrap_or_else(|| PathBuf::from("node"))
}

fn sidecar_path_override() -> Option<PathBuf> {
    std::env::var("REPOTUTOR_SIDECAR")
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

fn node_path_override() -> Option<PathBuf> {
    std::env::var("REPOTUTOR_NODE")
        .ok()
        .map(|value| value.trim().to_string())
        .filter(|value| !value.is_empty())
        .map(PathBuf::from)
}

fn default_sidecar_candidates() -> Vec<PathBuf> {
    let repo_relative = PathBuf::from("apps/desktop-tauri/sidecar-dist/sidecar/bridge.js");
    let package_relative = PathBuf::from("sidecar-dist/sidecar/bridge.js");
    let mut candidates = Vec::new();

    if let Ok(current_dir) = std::env::current_dir() {
        candidates.push(current_dir.join(&repo_relative));
        candidates.push(current_dir.join(&package_relative));
    }
    if let Some(current_exe) = current_exe_path() {
        if let Some(exe_dir) = current_exe.parent() {
            candidates.push(exe_dir.join("../Resources/sidecar-dist/sidecar/bridge.js"));
            candidates.push(exe_dir.join("../resources/sidecar-dist/sidecar/bridge.js"));
            candidates.push(exe_dir.join("resources/sidecar-dist/sidecar/bridge.js"));
            candidates.push(exe_dir.join(&package_relative));
            candidates.push(exe_dir.join("../../../sidecar-dist/sidecar/bridge.js"));
            candidates.push(exe_dir.join("../../../../sidecar-dist/sidecar/bridge.js"));
        }
    }

    candidates
}

fn default_node_candidates() -> Vec<PathBuf> {
    let repo_relative = PathBuf::from("apps/desktop-tauri/sidecar-dist/runtime/node");
    let package_relative = PathBuf::from("sidecar-dist/runtime/node");
    let mut candidates = Vec::new();

    if let Ok(current_dir) = std::env::current_dir() {
        candidates.push(current_dir.join(&repo_relative));
        candidates.push(current_dir.join(&package_relative));
    }
    if let Some(current_exe) = current_exe_path() {
        if let Some(exe_dir) = current_exe.parent() {
            candidates.push(exe_dir.join("../Resources/runtime/node"));
            candidates.push(exe_dir.join("../resources/runtime/node"));
            candidates.push(exe_dir.join("resources/runtime/node"));
            candidates.push(exe_dir.join(&package_relative));
            candidates.push(exe_dir.join("../../../sidecar-dist/runtime/node"));
            candidates.push(exe_dir.join("../../../../sidecar-dist/runtime/node"));
        }
    }

    candidates
}

fn current_exe_path() -> Option<PathBuf> {
    #[cfg(test)]
    if let Ok(value) = std::env::var("REPOTUTOR_TEST_CURRENT_EXE") {
        let trimmed = value.trim();
        if !trimmed.is_empty() {
            return Some(PathBuf::from(trimmed));
        }
    }
    std::env::current_exe().ok()
}
