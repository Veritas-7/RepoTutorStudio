import React from "react";

void React;

interface LogEntry {
  key: string;
  line: string;
}

interface LogPanelProps {
  entries: LogEntry[];
}

export function LogPanel({ entries }: LogPanelProps) {
  return (
    <section className="log-panel">
      <h2>진행 로그</h2>
      {entries.map(({ line, key }) => <p key={key}>{line}</p>)}
    </section>
  );
}
