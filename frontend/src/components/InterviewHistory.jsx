import React, { useState } from "react";

export const INTERVIEW_HISTORY_KEY = "genie-interview-history";
const HISTORY_LIMIT = 20;

export function loadInterviewHistory() {
  try {
    const saved = JSON.parse(localStorage.getItem(INTERVIEW_HISTORY_KEY) || "null");
    return Array.isArray(saved) ? saved.filter((entry) => entry && typeof entry === "object") : [];
  } catch {
    return [];
  }
}

export function saveInterviewHistory(entries) {
  try {
    localStorage.setItem(INTERVIEW_HISTORY_KEY, JSON.stringify(entries.slice(0, HISTORY_LIMIT)));
  } catch {
    // Storage may be unavailable; history simply won't persist.
  }
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "—";
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.round(seconds % 60);
  return minutes ? `${minutes}m ${remaining}s` : `${remaining}s`;
}

function formatDate(isoString) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" }) +
    " · " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function InterviewHistory() {
  const [entries, setEntries] = useState(loadInterviewHistory);
  const [reportEntry, setReportEntry] = useState(null);

  const removeEntry = (id) => {
    const next = entries.filter((entry) => entry.id !== id);
    setEntries(next);
    saveInterviewHistory(next);
  };

  return (
    <div className="history-page">
      <header className="history-heading">
        <div>
          <span className="section-kicker">INTERVIEW HISTORY</span>
          <h1>Your past <span className="serif-accent">interviews.</span></h1>
          <p>Review scores, performance trends, and detailed reports from previous sessions.</p>
        </div>
        <span className="history-count">{entries.length} session{entries.length === 1 ? "" : "s"}</span>
      </header>

      {!entries.length ? (
        <div className="history-empty panel">
          <span className="history-empty-icon">◷</span>
          <h2>No interviews yet</h2>
          <p>Complete a mock interview and your session summary will appear here.</p>
        </div>
      ) : (
        <div className="history-list">
          {entries.map((entry) => (
            <article className="history-card panel" key={entry.id}>
              <div className="history-card-main">
                <div className="history-card-title">
                  <strong>{entry.role || "Mock Interview"}</strong>
                  <span className={`history-performance ${entry.performance === "Improved" ? "improved" : "needs-work"}`}>
                    {entry.performance || "—"}
                  </span>
                </div>
                <div className="history-card-meta">
                  <span>{entry.company ? `🏢 ${entry.company} · ` : ""}{entry.type || "Interview"}{entry.mode ? ` · ${entry.mode === "text" ? "Text" : entry.mode === "video" ? "Video" : "Voice"}` : ""}{entry.hintsUsed ? ` · ${entry.hintsUsed} hint${entry.hintsUsed === 1 ? "" : "s"}` : ""}</span>
                  <span>{formatDate(entry.date)}</span>
                </div>
              </div>
              <div className="history-card-stats">
                <div><span>Duration</span><strong>{formatDuration(entry.durationSeconds)}</strong></div>
                <div><span>Questions</span><strong>{entry.questions ?? "—"}</strong></div>
                <div><span>Overall</span><strong>{entry.overall ?? "—"}{entry.overall !== null && entry.overall !== undefined ? "/100" : ""}</strong></div>
              </div>
              <div className="history-card-actions">
                <button type="button" className="primary-button" onClick={() => setReportEntry(entry)}>View detailed report</button>
                <button type="button" className="history-delete" onClick={() => removeEntry(entry.id)}>Delete</button>
              </div>
            </article>
          ))}
        </div>
      )}

      {reportEntry && (
        <div className="history-report-overlay" role="dialog" aria-modal="true" aria-label="Interview report">
          <div className="history-report-card">
            <div className="history-report-heading">
              <div>
                <span className="section-kicker">DETAILED REPORT</span>
                <h2>{reportEntry.role} · {formatDate(reportEntry.date)}</h2>
              </div>
              <button type="button" onClick={() => setReportEntry(null)} aria-label="Close report">✕</button>
            </div>
            <div className="history-report-summary">
              <div><span>Overall</span><strong>{reportEntry.overall ?? "—"}/100</strong></div>
              <div><span>Video</span><strong>{reportEntry.videoScore ?? "—"}%</strong></div>
              <div><span>Workmap</span><strong>{reportEntry.workmapScore ?? "—"}%</strong></div>
              <div><span>Technical</span><strong>{reportEntry.technicalScore ?? "—"}%</strong></div>
              <div><span>Communication</span><strong>{reportEntry.communicationScore ?? "—"}%</strong></div>
            </div>
            <pre className="history-report-text">{reportEntry.report || "No detailed report was saved for this session."}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
