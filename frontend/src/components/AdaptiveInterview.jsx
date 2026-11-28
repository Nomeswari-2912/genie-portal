import React, { useEffect, useRef, useState } from "react";
import { interviewRoleOptions } from "./LiveInterview.jsx";

const roles = interviewRoleOptions;
const types = ["Technical", "Behavioral", "HR", "Mixed"];
const difficulties = ["Beginner", "Intermediate", "Advanced", "Adaptive"];
const durations = [15, 30, 45, 60];
const questionCounts = [5, 10, 15, 20];
const languages = [
  { code: "en", name: "English" },
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
];
const modes = ["Video", "Audio"];

const typeMap = { Technical: "Technical", Behavioral: "Behavioral", HR: "HR", Mixed: "Technical" };
const difficultyMap = { Beginner: "Easy", Intermediate: "Medium", Advanced: "Hard", Adaptive: "Medium" };

export default function AdaptiveInterview({ onBack, onStart }) {
  const [role, setRole] = useState(roles[0]);
  const [type, setType] = useState(types[0]);
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState(10);
  const [language, setLanguage] = useState("en");
  const [mode, setMode] = useState("Video");
  const [resumeName, setResumeName] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(false);
  const [spkOn, setSpkOn] = useState(true);
  const [camError, setCamError] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const fileRef = useRef(null);
  const camVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, []);

  const toggleCamera = async () => {
    if (camOn) {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      setCamOn(false);
      setCamError("");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (camVideoRef.current) camVideoRef.current.srcObject = stream;
      setCamOn(true);
      setCamError("");
    } catch {
      setCamError("Camera unavailable — check browser permissions");
    }
  };

  const handleResume = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ok = /\.(pdf|docx|txt)$/i.test(file.name) || ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/octet-stream"].includes(file.type);
    if (!ok) {
      setResumeError("Please upload a PDF, DOCX, or TXT file");
      setResumeName("");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("File must be under 5 MB");
      setResumeName("");
      return;
    }
    setResumeError("");
    setResumeName(file.name);
  };

  const start = () => {
    localStorage.setItem("genie-interview-setup", JSON.stringify({
      type: typeMap[type],
      company: "",
      experience: "",
      difficulty: difficultyMap[difficulty],
      duration,
      questions,
      language,
      explanationLanguage: "",
      mode: mode === "Video" ? "video" : "voice",
    }));
    if (resumeName) localStorage.setItem("genie-interview-resume-name", JSON.stringify(resumeName));
    onStart?.({ role });
  };

  const field = (label, children) => (
    <label className="ai-field">
      <span>{label}</span>
      {children}
    </label>
  );

  return (
    <div className="adaptive-page">
      <nav className="ai-nav">
        <button type="button" onClick={onBack}>← Back to Workspace</button>
        <button type="button" onClick={start}>Interview Session</button>
        <button type="button" onClick={() => onStart?.({ nav: "practice" })}>Practice Questions</button>
        <button type="button" onClick={() => onStart?.({ nav: "companysetup" })}>Company Interview</button>
        <button type="button" onClick={() => onStart?.({ nav: "coding" })}>Coding</button>
        <button type="button" onClick={() => onStart?.({ nav: "plan" })}>Practice Plan</button>
        <button type="button" onClick={() => onStart?.({ nav: "history" })}>History</button>
      </nav>

      <header className="ai-header">
        <div className="ai-brand">
          <img src="/genie-mascot.png" alt="Genie" className="ai-mascot" />
          <div>
            <strong>Genie Portal</strong>
            <small>Adaptive AI Mock Interview</small>
          </div>
        </div>
        <div className="ai-header-right">
          <span className="ai-live"><span className="ai-live-dot" /> Live Session</span>
          <div className="ai-profile-wrap">
            <button type="button" className="ai-profile" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>Vaka Nomeswari ▾</button>
            {profileOpen && (
              <div className="ai-profile-menu">
                <span className="ai-profile-name">Vaka Nomeswari</span>
                <button type="button" onClick={() => { setProfileOpen(false); onBack?.(); }}>← Back to Dashboard</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="ai-body">
        <div className="ai-video-panel">
          <div className="ai-avatar-stage">
            <img src="/genie-mascot.png" alt="Genie AI interviewer" className="ai-avatar" />
            <span className="ai-avatar-label">AI Interviewer</span>
            <span className="ai-speaking" />
          </div>
          <div className="ai-cam-preview">
            {camOn ? <video ref={camVideoRef} autoPlay muted playsInline /> : <span>Cam</span>}
          </div>
          {camError && <p className="ai-cam-error">{camError}</p>}
          <div className="ai-video-controls">
            <span className="ai-rec">● REC</span>
            <button type="button" title={micOn ? "Mute microphone" : "Unmute microphone"} onClick={() => setMicOn((on) => !on)} className={micOn ? "" : "control-off"}>{micOn ? "🎤" : "🔇"}</button>
            <button type="button" title={camOn ? "Turn camera off" : "Turn camera on"} onClick={toggleCamera} className={camOn ? "" : "control-off"}>{camOn ? "📷" : "🚫"}</button>
            <button type="button" title={spkOn ? "Mute speaker" : "Unmute speaker"} onClick={() => setSpkOn((on) => !on)} className={spkOn ? "" : "control-off"}>{spkOn ? "🔊" : "🔈"}</button>
            <button type="button" className="ai-end" onClick={onBack}>End Interview</button>
          </div>
        </div>

        <section className="ai-config panel">
          <h2>Adaptive Interview with Genie</h2>
          <div className="ai-grid">
            {field("Job Role", (
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.map((r) => <option key={r}>{r}</option>)}
              </select>
            ))}
            {field("Interview Type", (
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {types.map((t) => <option key={t}>{t}</option>)}
              </select>
            ))}
            {field("Difficulty Level", (
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                {difficulties.map((d) => <option key={d}>{d}</option>)}
              </select>
            ))}
            {field("Interview Duration", (
              <select value={duration} onChange={(e) => setDuration(Number(e.target.value))}>
                {durations.map((d) => <option key={d} value={d}>{d} min</option>)}
              </select>
            ))}
            {field("Number of Questions", (
              <select value={questions} onChange={(e) => setQuestions(Number(e.target.value))}>
                {questionCounts.map((q) => <option key={q} value={q}>{q}</option>)}
              </select>
            ))}
            {field("Language", (
              <select value={language} onChange={(e) => setLanguage(e.target.value)}>
                {languages.map((l) => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            ))}
            {field("Interview Mode", (
              <select value={mode} onChange={(e) => setMode(e.target.value)}>
                {modes.map((m) => <option key={m}>{m}</option>)}
              </select>
            ))}
          </div>

          <div className="ai-resume">
            <span className="ai-resume-label">Resume (PDF / DOCX)</span>
            <input ref={fileRef} type="file" accept=".pdf,.docx" className="sr-only" onChange={handleResume} />
            <button type="button" className="ai-upload" onClick={() => fileRef.current?.click()}>
              {resumeName ? `✓ ${resumeName}` : "Upload Resume"}
            </button>
            {resumeError && <p className="ai-resume-error">{resumeError}</p>}
          </div>

          <div className="ai-intel">
            <h3>Adaptive Intelligence</h3>
            <ul>
              <li>Difficulty starts at <strong>{difficulty}</strong> and adjusts per answer quality</li>
              <li>Strong answers → harder follow-ups; weak answers → simpler probes</li>
              <li>Technical accuracy, relevance, clarity &amp; problem-solving evaluated each turn</li>
              <li>No repeated questions · full context retained · results saved to History</li>
            </ul>
          </div>

          <button type="button" className="ai-start" onClick={start}>▶ Start Adaptive Interview</button>
        </section>
      </div>
    </div>
  );
}
