import { BookOpen, RotateCcw, Search } from "lucide-react";
import React from "react";
import { scoreSummaryText } from "../app-copy.js";
import type { SessionRow } from "../types.js";

void React;

interface SessionSidebarProps {
  currentPath: string | null;
  filteredSessions: SessionRow[];
  onRefreshSessions: () => void;
  onSearchChange: (value: string) => void;
  onSelectSession: (session: SessionRow) => void;
  search: string;
  totalSessions: number;
}

export function SessionSidebar({
  currentPath,
  filteredSessions,
  onRefreshSessions,
  onSearchChange,
  onSelectSession,
  search,
  totalSessions
}: SessionSidebarProps) {
  return (
    <aside className="session-sidebar">
      <div className="brand">
        <BookOpen size={22} />
        <span>
          <strong>RepoTutor Studio</strong>
          <small>바이브코딩 학습 관제실</small>
        </span>
      </div>
      <label className="search-box">
        <Search size={16} />
        <input
          aria-label="세션 검색"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="세션 검색"
        />
      </label>
      <button type="button" className="icon-text" onClick={onRefreshSessions} title="세션 새로고침">
        <RotateCcw size={16} />
        새로고침
      </button>
      <div className="session-list">
        {filteredSessions.map((session) => (
          <button type="button" key={session.sessionId} className={currentPath === session.path ? "session-row active" : "session-row"} onClick={() => onSelectSession(session)}>
            <span>{session.repo}</span>
            <small>{session.createdAt.slice(0, 10)} · {scoreSummaryText(session)} · 오답 {session.wrong}</small>
          </button>
        ))}
        {totalSessions > 0 && filteredSessions.length === 0 ? (
          <p className="session-empty">검색 결과가 없습니다</p>
        ) : null}
      </div>
    </aside>
  );
}
