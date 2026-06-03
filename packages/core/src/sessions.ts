import fs from "node:fs/promises";
import path from "node:path";
import type { StudySession } from "@repotutor/shared";
import { pathExists } from "./fs-utils.js";
import { readJson } from "./storage.js";

export async function listSessions(studiesRoot = path.join(process.cwd(), "studies")): Promise<StudySession[]> {
  const indexJson = path.join(studiesRoot, "index.json");
  const sessions: StudySession[] = [];
  if (await pathExists(indexJson)) {
    sessions.push(...await readJson<StudySession[]>(indexJson));
  }
  const byDate = await fs.readdir(studiesRoot, { withFileTypes: true }).catch(() => []);
  for (const dateDir of byDate.filter((entry) => entry.isDirectory() && /^\d{4}-\d{2}-\d{2}$/.test(entry.name))) {
    const datePath = path.join(studiesRoot, dateDir.name);
    const entries = await fs.readdir(datePath, { withFileTypes: true });
    for (const entry of entries.filter((item) => item.isDirectory())) {
      const sessionPath = path.join(datePath, entry.name, "session.json");
      if (await pathExists(sessionPath)) {
        const session = await readJson<StudySession>(sessionPath);
        if (!sessions.some((existing) => existing.sessionId === session.sessionId)) sessions.push(session);
      }
    }
  }
  return sessions.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}
