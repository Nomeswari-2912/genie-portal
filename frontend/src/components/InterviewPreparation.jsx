import React, { useState } from "react";
import { interviewRoleOptions } from "./LiveInterview.jsx";

const typeOptions = ["Technical", "HR", "Behavioral", "Coding", "Mixed"];
const difficultyOptions = ["Easy", "Medium", "Hard", "Adaptive"];
const durationOptions = [15, 30, 45, 60];
const questionOptions = [5, 10, 15, 20];
const languageOptions = [
  { code: "en", name: "English" },
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
  { code: "ta", name: "Tamil" },
  { code: "kn", name: "Kannada" },
  { code: "ml", name: "Malayalam" },
];
const explanationOptions = [
  { code: "", name: "Same as Interview" },
  { code: "en", name: "English" },
  { code: "te", name: "Telugu" },
  { code: "hi", name: "Hindi" },
];
const modeOptions = [
  { value: "video", label: "Video" },
  { value: "voice", label: "Audio" },
  { value: "text", label: "Text" },
];

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", note: "Overview", target: "workspace" },
  { id: "prepare", label: "Prepare", note: "Upload resume and details", active: true },
  { id: "mock", label: "Mock Interview", note: "Live AI session", target: "session" },
  { id: "qa", label: "Q&A", note: "View questions and answers", target: "session" },
  { id: "feedback", label: "Feedback", note: "View performance", target: "history" },
];

export default function InterviewPreparation({ onSubmit, onNavigate, onStartInterview }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [role, setRole] = useState(interviewRoleOptions[0]);
  const [interviewType, setInterviewType] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Adaptive");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState(10);
  const [language, setLanguage] = useState("en");
  const [explanationLanguage, setExplanationLanguage] = useState("");
  const [mode, setMode] = useState("voice");
  const [voiceOn, setVoiceOn] = useState(() => {
    try { return localStorage.getItem("genie-voice-enabled") !== "0"; } catch { return true; }
  });
  const [handsFree, setHandsFree] = useState(() => {
    try { return localStorage.getItem("genie-hands-free") !== "0"; } catch { return true; }
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleResumeUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const ok = /\.(pdf|docx|txt)$/i.test(file.name) ||
      ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "text/plain", "application/octet-stream"].includes(file.type);
    if (!ok) {
      setResumeError("Please upload a PDF, DOCX, or TXT file");
      setResumeFile(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setResumeError("Resume file must be under 5 MB");
      setResumeFile(null);
      return;
    }
    setResumeError("");
    setResumeFile(file);
  };

  const toggleVoice = () => {
    const next = !voiceOn;
    setVoiceOn(next);
    try { localStorage.setItem("genie-voice-enabled", next ? "1" : "0"); } catch { /* ignore */ }
  };

  const toggleHandsFree = () => {
    const next = !handsFree;
    setHandsFree(next);
    try { localStorage.setItem("genie-hands-free", next ? "1" : "0"); } catch { /* ignore */ }
  };

  const interviewConfig = {
    role,
    type: interviewType,
    difficulty: difficulty === "Adaptive" ? "Medium" : difficulty,
    company: "",
    experience: "",
    duration,
    questions,
    language,
    explanationLanguage,
    mode,
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!resumeFile) {
      setResumeError("Required - Please upload your resume in PDF format");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("linkedin", linkedin.trim());
      formData.append("github", github.trim());
      formData.append("portfolio", portfolio.trim());
      formData.append("additionalInfo", additionalInfo.trim());
      formData.append("jobDescription", jobDescription.trim());

      const result = await onSubmit(formData);
      setSubmitted({
        fileName: result?.fileName || resumeFile.name,
        topics: Array.isArray(result?.topics) ? result.topics : [],
        hasLinks: Boolean(linkedin.trim() || github.trim() || portfolio.trim()),
        hasJobDescription: Boolean(jobDescription.trim()),
      });
    } catch (error) {
      setResumeError(error?.message || "Preparation failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const analysisItems = submitted ? [
    { label: "Resume analyzed", done: true },
    { label: "Skills extracted", done: true },
    { label: "Professional links saved", done: submitted.hasLinks },
    { label: "Job description analyzed", done: submitted.hasJobDescription },
    { label: "Interview topics generated", done: submitted.topics.length > 0 },
  ] : [];

  return (
    <div className="prep-page genieview-style">
      <aside className="prep-sidebar genieview-style">
        <div className="prep-brand">
          <span className="prep-brand-logo">◉</span>
          <strong>Genieview</strong>
        </div>
        <nav className="prep-sidebar-nav genieview-style">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`prep-nav-item genieview-style${item.active ? " active" : ""}`}
              onClick={() => !item.active && onNavigate?.(item.target || "workspace")}
            >
              <strong>{item.label}</strong>
              <span>{item.note}</span>
            </button>
          ))}
        </nav>
      </aside>

      <main className="prep-main genieview-style">
        {submitted ? (
          <div className="prep-success">
            <div className="prep-success-icon">✓</div>
            <h1>Interview Preparation Submitted!</h1>
            <p>Your profile information has been received successfully.</p>

            <section className="prep-analysis panel">
              <h2>Genie AI Analysis</h2>
              <ul className="prep-analysis-list">
                {analysisItems.map((item) => (
                  <li key={item.label} className={item.done ? "done" : "skipped"}>
                    <span className="prep-check">{item.done ? "✓" : "—"}</span>
                    {item.label}
                  </li>
                ))}
              </ul>
              {submitted.topics.length > 0 && (
                <div className="prep-topics">
                  <h3>Interview topics</h3>
                  <div className="prep-topic-chips">
                    {submitted.topics.map((topic) => <span key={topic} className="prep-topic-chip">{topic}</span>)}
                  </div>
                </div>
              )}
              <p className="prep-analysis-file">Resume: {submitted.fileName}</p>
            </section>

            <div className="prep-success-actions">
              <button type="button" className="primary-button" onClick={() => onStartInterview?.(interviewConfig)}>
                Start AI mock interview →
              </button>
              <button type="button" className="secondary-button" onClick={() => setSubmitted(null)}>
                Edit details
              </button>
            </div>
          </div>
        ) : (
          <>
            <header className="preparation-header genieview-style">
              <span className="section-kicker">INTERVIEW PREPARATION</span>
              <h1>Interview Preparation</h1>
              <p>Upload your resume and provide additional information to prepare for your interview.</p>
            </header>

            <form className="preparation-form" onSubmit={handleSubmit}>
              <section className="preparation-section genieview-style">
                <label className="preparation-label genieview-style">Resume</label>
                <div className="preparation-upload">
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleResumeUpload}
                    className="sr-only"
                  />
                  <label htmlFor="resume-upload" className={`upload-button genieview-style${resumeFile ? " has-file" : ""}`}>
                    <span className="upload-icon">📄</span>
                    {resumeFile ? `✓ ${resumeFile.name}` : "Upload Resume (PDF, DOCX, TXT)"}
                  </label>
                  <p className="preparation-error genieview-style" role="alert">{resumeError || "* Required - Please upload your resume (PDF, DOCX, or TXT)"}</p>
                </div>
              </section>

              <section className="preparation-section genieview-style">
                <label className="preparation-label genieview-style">Professional Links</label>
                <div className="preparation-links">
                  <div className="preparation-input genieview-style">
                    <span className="input-icon">💼</span>
                    <input
                      type="url"
                      placeholder="LinkedIn URL (Optional)"
                      value={linkedin}
                      onChange={(event) => setLinkedin(event.target.value)}
                    />
                  </div>
                  <div className="preparation-input genieview-style">
                    <span className="input-icon">{`{ }`}</span>
                    <input
                      type="url"
                      placeholder="GitHub URL (Optional)"
                      value={github}
                      onChange={(event) => setGithub(event.target.value)}
                    />
                  </div>
                  <div className="preparation-input genieview-style">
                    <span className="input-icon">📂</span>
                    <input
                      type="url"
                      placeholder="Portfolio URL (Optional)"
                      value={portfolio}
                      onChange={(event) => setPortfolio(event.target.value)}
                    />
                  </div>
                </div>
              </section>

              <section className="preparation-section genieview-style">
                <label className="preparation-label genieview-style">Additional Information</label>
                <div className="preparation-textarea-wrap">
                  <span className="textarea-icon">ℹ</span>
                  <textarea
                    className="preparation-textarea genieview-style"
                    placeholder="Tell us more about yourself, your projects, achievements,…"
                    value={additionalInfo}
                    onChange={(event) => setAdditionalInfo(event.target.value)}
                    rows="4"
                  />
                </div>
              </section>

              <section className="preparation-section genieview-style">
                <label className="preparation-label genieview-style">Job Description</label>
                <div className="preparation-textarea-wrap">
                  <span className="textarea-icon">📄</span>
                  <textarea
                    className="preparation-textarea genieview-style"
                    placeholder="Paste the job description here"
                    value={jobDescription}
                    onChange={(event) => setJobDescription(event.target.value)}
                    rows="4"
                  />
                </div>
              </section>

              <section className="preparation-section genieview-style">
                <label className="preparation-label genieview-style">Interview Settings</label>
                <div className="prep-settings-grid">
                  <label className="prep-setting-field">
                    <span>Job Role</span>
                    <select value={role} onChange={(event) => setRole(event.target.value)}>
                      {interviewRoleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Interview Type</span>
                    <select value={interviewType} onChange={(event) => setInterviewType(event.target.value)}>
                      {typeOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Difficulty</span>
                    <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
                      {difficultyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Duration</span>
                    <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
                      {durationOptions.map((item) => <option key={item} value={item}>{item} min</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Questions</span>
                    <select value={questions} onChange={(event) => setQuestions(Number(event.target.value))}>
                      {questionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Language</span>
                    <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                      {languageOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Explanations in</span>
                    <select value={explanationLanguage} onChange={(event) => setExplanationLanguage(event.target.value)}>
                      {explanationOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
                    </select>
                  </label>
                  <label className="prep-setting-field">
                    <span>Mode</span>
                    <select value={mode} onChange={(event) => setMode(event.target.value)}>
                      {modeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </label>
                </div>
                <div className="prep-toggle-row">
                  <button type="button" className={`voice-output-toggle${voiceOn ? " enabled" : ""}`} onClick={toggleVoice} aria-pressed={voiceOn}>
                    {voiceOn ? "◖)) Voice on" : "Voice off"}
                  </button>
                  <button type="button" className={`voice-output-toggle${handsFree ? " enabled" : ""}`} onClick={toggleHandsFree} aria-pressed={handsFree} title="Automatically listen for your answers after each question">
                    {handsFree ? "◉ Hands-free on" : "Hands-free off"}
                  </button>
                </div>
              </section>

              <div className="preparation-actions genieview-style">
                <button type="submit" className="primary-button" disabled={submitting || !resumeFile}>
                  {submitting ? "Preparing…" : "Submit Interview Preparation"}
                </button>
              </div>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
