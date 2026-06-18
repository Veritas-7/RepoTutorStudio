use crate::runtime::{resolve_node_runtime, resolve_sidecar_path};
use serde_json::json;
use std::io::{Read, Write};
use std::process::{Child, Command, ExitStatus, Stdio};
use std::thread;
use std::time::{Duration, Instant};

pub(crate) fn call_sidecar(
    method: &str,
    params: serde_json::Value,
) -> Option<Result<serde_json::Value, String>> {
    let sidecar = resolve_sidecar_path()?;
    let node = resolve_node_runtime();
    let mut child = match Command::new(&node)
        .arg(sidecar)
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
    {
        Ok(child) => child,
        Err(error) => {
            return Some(Err(format!(
                "failed to spawn sidecar runtime {}: {}",
                node.display(),
                error
            )))
        }
    };
    if let Some(stdin) = child.stdin.as_mut() {
        let request = json!({ "id": "tauri-command", "method": method, "params": params });
        if let Err(error) = writeln!(stdin, "{}", request) {
            let _ = child.kill();
            return Some(Err(error.to_string()));
        }
    }
    drop(child.stdin.take());
    let output = match wait_with_timeout(child, sidecar_timeout(method)) {
        Ok(output) => output,
        Err(error) => return Some(Err(error)),
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
    if let Some(error) = envelope
        .pointer("/result/error")
        .and_then(|value| value.as_str())
    {
        return Some(Err(error.to_string()));
    }
    Some(Ok(envelope
        .get("result")
        .cloned()
        .unwrap_or(serde_json::Value::Null)))
}

struct SidecarOutput {
    status: ExitStatus,
    stdout: Vec<u8>,
    stderr: Vec<u8>,
}

fn sidecar_timeout(method: &str) -> Duration {
    if let Ok(value) = std::env::var("REPOTUTOR_SIDECAR_TIMEOUT_MS") {
        if let Ok(milliseconds) = value.trim().parse::<u64>() {
            if milliseconds > 0 {
                return Duration::from_millis(milliseconds);
            }
        }
    }
    if method == "study" {
        Duration::from_secs(30 * 60)
    } else {
        Duration::from_secs(2 * 60)
    }
}

fn wait_with_timeout(mut child: Child, timeout: Duration) -> Result<SidecarOutput, String> {
    let mut stdout = child
        .stdout
        .take()
        .ok_or_else(|| "sidecar stdout pipe was not captured".to_string())?;
    let mut stderr = child
        .stderr
        .take()
        .ok_or_else(|| "sidecar stderr pipe was not captured".to_string())?;
    let stdout_handle = thread::spawn(move || {
        let mut buffer = Vec::new();
        stdout
            .read_to_end(&mut buffer)
            .map(|_| buffer)
            .map_err(|error| error.to_string())
    });
    let stderr_handle = thread::spawn(move || {
        let mut buffer = Vec::new();
        stderr
            .read_to_end(&mut buffer)
            .map(|_| buffer)
            .map_err(|error| error.to_string())
    });

    let started = Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(status)) => {
                return Ok(SidecarOutput {
                    status,
                    stdout: join_reader(stdout_handle)?,
                    stderr: join_reader(stderr_handle)?,
                });
            }
            Ok(None) => {
                if started.elapsed() >= timeout {
                    let _ = child.kill();
                    let _ = child.wait();
                    let stdout = join_reader(stdout_handle).unwrap_or_default();
                    let stderr = join_reader(stderr_handle).unwrap_or_default();
                    let stderr_text = String::from_utf8_lossy(&stderr);
                    let stdout_text = String::from_utf8_lossy(&stdout);
                    return Err(format!(
                        "sidecar timed out after {} ms{}{}",
                        timeout.as_millis(),
                        if stderr_text.is_empty() { "" } else { ": " },
                        if stderr_text.is_empty() {
                            stdout_text.as_ref()
                        } else {
                            stderr_text.as_ref()
                        }
                    ));
                }
                thread::sleep(Duration::from_millis(50));
            }
            Err(error) => return Err(error.to_string()),
        }
    }
}

fn join_reader(handle: thread::JoinHandle<Result<Vec<u8>, String>>) -> Result<Vec<u8>, String> {
    handle
        .join()
        .map_err(|_| "sidecar output reader panicked".to_string())?
}
