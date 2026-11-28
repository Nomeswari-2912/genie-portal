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
  const [session, setSession] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const history = loadInterviewHistory();
    setSession(history.find((entry) => Array.isArray(entry.speechTurns) && entry.speechTurns.length) || null);
  }, []);

  const turns = useMemo(() => session?.speechTurns || [], [session]);
  const candidateName = session?.candidateName || "Candidate";

  const span = useMemo(() => {
    if (!turns.length) return { start: 0, end: 0 };
    const start = turns[0].at;
    const last = turns[turns.length - 1];
    const estimatedEnd = last.speaker === "candidate" && last.speech?.wordCount
      ? last.at + Math.round((last.speech.wordCount / 140) * 60000)
      : last.at + 12000;
    const end = Math.max(estimatedEnd, session?.durationSeconds ? start + session.durationSeconds * 1000 : estimatedEnd);
    return { start, end: Math.max(end, start + 1000) };
  }, [turns, session]);

  const totalSeconds = Math.max(1, Math.round((span.end - span.start) / 1000));

  const segments = useMemo(() => turns.map((turn, index) => {
    const next = turns[index + 1];
    const end = next ? next.at : span.end;
    return {
      speaker: turn.speaker,
      start: Math.max(0, (turn.at - span.start) / 1000),
      end: Math.max(0, (Math.min(end, span.end) - span.start) / 1000),
      speech: turn.speech,
      relevance: turn.relevance,
    };
  }).filter((seg) => seg.end > seg.start), [turns, span]);

  const candidateSpeech = turns.filter((turn) => turn.speaker === "candidate" && turn.speech);
  const candidateSeconds = segments.filter((seg) => seg.speaker === "candidate").reduce((sum, seg) => sum + (seg.end - seg.start), 0);
  const interviewerSeconds = segments.filter((seg) => seg.speaker === "interviewer").reduce((sum, seg) => sum + (seg.end - seg.start), 0);

  const metrics = useMemo(() => ({
    clarity: avg(candidateSpeech.map((turn) => turn.speech.clarity)),
    relevance: avg(candidateSpeech.map((turn) => turn.relevance)),
    wpm: avg(candidateSpeech.map((turn) => turn.speech.wpm)),
    confidence: avg(candidateSpeech.map((turn) => turn.speech.score)),
    fillers: candidateSpeech.reduce((sum, turn) => sum + (turn.speech.fillerWords || 0), 0),
    pauses: candidateSpeech.reduce((sum, turn) => sum + (turn.speech.longPauses || 0), 0),
    repeated: candidateSpeech.reduce((sum, turn) => sum + (turn.speech.repeatedWords || 0), 0),
  }), [candidateSpeech]);

  const suggestions = useMemo(() => {
    const list = [];
    if (metrics.fillers > 0) list.push("Reduce unnecessary filler words.");
    if (metrics.pauses > 0) list.push("Avoid long pauses.");
    if (metrics.wpm !== null && (metrics.wpm < 90 || metrics.wpm > 190)) list.push("Maintain a clear speaking pace.");
    if (metrics.relevance !== null && metrics.relevance < 60) list.push("Give structured answers that stay on topic.");
    if (metrics.repeated > 0) list.push("Avoid repeating the same words or phrases.");
    if (metrics.clarity !== null && metrics.clarity < 70) list.push("Speak clearly and articulate each word.");
    if (!list.length) list.push("Keep up the good pace — structured answers and confident delivery.");
    return list.slice(0, 5);
  }, [metrics]);

  const waveform = useMemo(() => {
    const bars = 90;
    const bucket = totalSeconds / bars;
    const values = Array.from({ length: bars }, (_, i) => {
      const t = i * bucket;
      const seg = segments.find((s) => t >= s.start && t < s.end);
      if (!seg) return 0.06 + Math.random() * 0.05;
      const density = seg.speaker === "candidate" ? (seg.speech?.wordCount || 30) : 40;
      return Math.min(1, 0.25 + (density / 160) + Math.random() * 0.35);
    });
    return values;
  }, [segments, totalSeconds]);

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

  const progress = totalSeconds ? Math.min(100, (elapsed / totalSeconds) * 100) : 0;
  const activeSpeaker = segments.find((seg) => elapsed >= seg.start && elapsed < seg.end)?.speaker;

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
          <span className="speech-brand-icon">✦</span>
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
          {!session ? (
            <div className="speech-empty">
              <h2>Speech Analysis</h2>
              <p>No recorded interview speech found yet. Complete a mock interview with spoken answers to see your waveform, speaker timeline, and AI scores here.</p>
              <button type="button" className="primary-button" onClick={() => onNavigate?.("session")}>Start an interview</button>
            </div>
          ) : (
            <>
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
                      onClick={() => { setPlaying(false); setElapsed(0); setFinished(false); }}
                    >⏹ Stop</button>
                  </div>
                </div>
                <div className="speech-progress"><span style={{ width: `${progress}%` }} /></div>
                {activeSpeaker && <p className="speech-now-playing">Now playing: <strong>{activeSpeaker === "candidate" ? candidateName : "Genie AI"}</strong></p>}
              </section>

              <section className="speech-card">
                <div className="speech-card-head">
                  <h3>Speaker Timeline</h3>
                  <span className="speech-turn-count">{turns.length} turns</span>
                </div>
                <div className="speech-timeline-lanes">
                  {[
                    { id: "candidate", label: candidateName, sub: "Candidate", color: "#7c5cff" },
                    { id: "interviewer", label: "Genie AI", sub: "AI Interviewer", color: "#12b5a5" },
                  ].map((lane) => {
                    const laneSegs = segments.filter((seg) => seg.speaker === lane.id);
                    const laneSeconds = laneSegs.reduce((sum, seg) => sum + (seg.end - seg.start), 0);
                    const interruptions = laneSegs.filter((seg, i) => {
                      const prev = segments[segments.indexOf(seg) - 1];
                      return prev && prev.speaker !== lane.id && seg.start - prev.end < 0.5 && i > 0;
                    }).length;
                    return (
                      <div key={lane.id} className="speech-lane">
                        <div className="speech-lane-label">
                          <span className="speech-lane-dot" style={{ background: lane.color }} />
                          <div>
                            <strong>{lane.label}</strong>
                            <small>{lane.sub}</small>
                          </div>
                        </div>
                        <div className="speech-lane-track">
                          {laneSegs.map((seg, i) => (
                            <span
                              key={i}
                              className="speech-lane-seg"
                              style={{
                                left: `${(seg.start / totalSeconds) * 100}%`,
                                width: `${Math.max(0.8, ((seg.end - seg.start) / totalSeconds) * 100)}%`,
                                background: lane.color,
                              }}
                            />
                          ))}
                        </div>
                        <div className="speech-lane-stats">
                          <span>{fmtTime(laneSeconds)} speaking</span>
                          {lane.id === "candidate" && interruptions > 0 && <span>{interruptions} interruption{interruptions === 1 ? "" : "s"}</span>}
                          {lane.id === "interviewer" && metrics.pauses > 0 && <span>{metrics.pauses} long pause{metrics.pauses === 1 ? "" : "s"} detected</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <p className="speech-compare">
                  {candidateName} spoke {fmtTime(candidateSeconds)} vs Genie AI {fmtTime(interviewerSeconds)}
                  {candidateSeconds + interviewerSeconds > 0 && ` — candidate ${(candidateSeconds / (candidateSeconds + interviewerSeconds) * 100).toFixed(0)}% of talk time`}
                </p>
              </section>

              <section className="speech-card">
                <div className="speech-card-head"><h3>AI Score &amp; Feedback</h3></div>
                <div className="speech-metrics-grid">
                  {metricTile("Voice clarity", metrics.clarity, "%")}
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
            </>
          )}
        </main>
      </div>
    </div>
  );
}
