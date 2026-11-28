import React, { useEffect, useMemo, useRef, useState } from "react";
import { loadInterviewHistory } from "./InterviewHistory.jsx";

const fmtTime = (seconds) => {
  const s = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};

const avg = (values) => {
  const nums = values.filter((value) => Number.isFinite(value));
  return nums.length ? Math.round(nums.reduce((sum, value) => sum + value, 0) / nums.length) : null;
};

const ICONS = {
  overview: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  recordings: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="13" height="12" rx="2" /><path d="M15 10l7-3v10l-7-3" />
    </svg>
  ),
  speech: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2" />
    </svg>
  ),
  reports: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />
    </svg>
  ),
  settings: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87 1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" />
    </svg>
  ),
};

export default function SpeechAnalysis({ onNavigate }) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(88);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  // Hardcoded sample data matching the screenshot
  const candidateName = "Vaka Nomeswari";
  const interviewerName = "Genie AI";
  const totalSeconds = 300; // 5:00
  const waveform = Array.from({ length: 90 }, () => 0.25 + Math.random() * 0.4);
  const turns = 7;
  const candidateSeconds = 42;
  const interviewerSeconds = 36;

  const metrics = {
    clarity: 125,
    relevance: 85,
    wpm: 140,
    confidence: 88,
  };

  const suggestions = [
    "Reduce unnecessary filler words.",
    "Avoid long pauses.",
    "Give structured answers.",
    "Explain projects with real examples.",
    "Maintain a clear speaking pace.",
  ];

  useEffect(() => {
    if (!playing) return undefined;
    timerRef.current = setInterval(() => {
      setElapsed((value) => {
        if (value + 0.25 >= totalSeconds) {
          setPlaying(false);
          setFinished(true);
          return totalSeconds;
        }
        return value + 0.25;
      });
    }, 250);
    return () => clearInterval(timerRef.current);
  }, [playing, totalSeconds]);

  const progress = (elapsed / totalSeconds) * 100;
  const activeSpeaker = elapsed < 60 ? interviewerName : candidateName;

  const navItems = [
    { id: "overview", label: "Overview", title: "Overview", onClick: () => onNavigate?.("workspace") },
    { id: "recordings", label: "Recordings", title: "Interview recordings", onClick: () => onNavigate?.("history") },
    { id: "speech", label: "Speech", title: "Speech analysis", onClick: null, active: true },
    { id: "reports", label: "Reports", title: "Performance reports", onClick: () => onNavigate?.("plan") },
    { id: "settings", label: "Settings", title: "Trainer settings", onClick: () => onNavigate?.("session") },
  ];

  const metricTile = (label, value, suffix) => (
    <div className="speech-metric">
      <span className="speech-metric-label">{label}</span>
      <strong className="speech-metric-value">
        {value === null ? "—" : value}{suffix ? <small>{suffix}</small> : null}
      </strong>
    </div>
  );

  return (
    <div className="speech-page">
      <header className="speech-header">
        <div className="speech-brand">
          <span className="speech-brand-icon"><img src="/genie-mascot.png" alt="Genie" /></span>
          <div>
            <strong>GenieAI Trainer</strong>
            <small>Interview Analysis</small>
          </div>
        </div>
        <div className="speech-header-actions">
          <button type="button" className="speech-header-btn" onClick={() => onNavigate?.("history")}>Interview Analysis ▾</button>
          <button type="button" className="speech-header-btn" onClick={() => onNavigate?.("workspace")}>Help and support</button>
          <button type="button" className="speech-profile" onClick={() => onNavigate?.("workspace")}>
            <span className="speech-avatar">{candidateName.charAt(0).toUpperCase()}</span>
            {candidateName}
          </button>
        </div>
      </header>

      <div className="speech-body">
        <nav className="speech-sidebar">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`speech-nav-btn${item.active ? " active" : ""}`}
              title={item.title}
              onClick={item.onClick || undefined}
            >
              {ICONS[item.id]}
              <span className="speech-nav-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <main className="speech-main">
          <section className="speech-card">
            <div className="speech-card-head">
              <h3>Interview Recording</h3>
              <span className="speech-live-dot" />
            </div>
            <div className="speech-waveform" aria-hidden="true">
              {waveform.map((value, index) => (
                <span
                  key={index}
                  className={`speech-wave-bar${progress > (index / waveform.length) * 100 ? " played" : ""}`}
                  style={{ height: `${Math.round(value * 100)}%` }}
                />
              ))}
            </div>
            <div className="speech-player-row">
              <span className="speech-time">{fmtTime(elapsed)} / {fmtTime(totalSeconds)}</span>
              <div className="speech-controls">
                {playing ? (
                  <button type="button" className="speech-ctrl" onClick={() => setPlaying(false)}>⏸ Pause</button>
                ) : (
                  <button type="button" className="speech-ctrl" onClick={() => { setFinished(false); setPlaying(true); }}>{finished ? "▶ Start again" : "▶ Play"}</button>
                )}
                <button
                  type="button"
                  className="speech-ctrl"
                  onClick={() => { setPlaying(false); setElapsed(88); setFinished(false); }}
                >⏹ Stop</button>
              </div>
            </div>
            <div className="speech-progress"><span style={{ width: `${progress}%` }} /></div>
            {activeSpeaker && <p className="speech-now-playing">Now playing: <strong>{activeSpeaker}</strong></p>}
          </section>

          <section className="speech-card">
            <div className="speech-card-head">
              <h3>Speaker Timeline</h3>
              <span className="speech-turn-count">{turns} turns</span>
            </div>
            <div className="speech-timeline-lanes">
              {[
                { id: "candidate", label: candidateName, sub: "Candidate", color: "#7c5cff" },
                { id: "interviewer", label: interviewerName, sub: "AI Interviewer", color: "#12b5a5" },
              ].map((lane) => (
                <div key={lane.id} className="speech-lane">
                  <div className="speech-lane-label">
                    <span className="speech-lane-dot" style={{ background: lane.color }} />
                    <div>
                      <strong>{lane.label}</strong>
                      <small>{lane.sub}</small>
                    </div>
                  </div>
                  <div className="speech-lane-track">
                    <span className="speech-lane-seg" style={{ left: "10%", width: "20%", background: lane.color }} />
                    <span className="speech-lane-seg" style={{ left: "35%", width: "15%", background: lane.color }} />
                  </div>
                  <div className="speech-lane-stats">
                    <span>{fmtTime(lane.id === "candidate" ? candidateSeconds : interviewerSeconds)} speaking</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="speech-compare">
              {candidateName} spoke {fmtTime(candidateSeconds)} vs {interviewerName} {fmtTime(interviewerSeconds)}
            </p>
          </section>

          <section className="speech-card">
            <div className="speech-card-head"><h3>AI Score &amp; Feedback</h3></div>
            <div className="speech-metrics-grid">
              {metricTile("Voice clarity", metrics.clarity, "")}
              {metricTile("Response relevance", metrics.relevance, "%")}
              {metricTile("Speaking speed", metrics.wpm, " WPM")}
              {metricTile("Confidence", metrics.confidence, "%")}
            </div>
            <div className="speech-suggestions">
              <h4>Improvement suggestions</h4>
              <ul>
                {suggestions.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
