import React, { useState } from "react";
import { interviewRoleOptions } from "./LiveInterview.jsx";

const companies = [
  { name: "Deloitte", domain: "deloitte.com" },
  { name: "Accenture", domain: "accenture.com" },
  { name: "TCS", domain: "tcs.com" },
  { name: "Infosys", domain: "infosys.com" },
  { name: "Wipro", domain: "wipro.com" },
  { name: "HCLTech", domain: "hcltech.com" },
  { name: "Tech Mahindra", domain: "techmahindra.com" },
  { name: "Cognizant", domain: "cognizant.com" },
  { name: "Capgemini", domain: "capgemini.com" },
  { name: "IBM", domain: "ibm.com" },
  { name: "Oracle", domain: "oracle.com" },
  { name: "Google", domain: "google.com" },
  { name: "Microsoft", domain: "microsoft.com" },
  { name: "Amazon", domain: "amazon.com" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
];
const experienceOptions = ["Fresher", "Junior", "Mid-level", "Senior"];
const roundOptions = ["Aptitude", "Technical", "HR", "Coding"];
const difficultyOptions = ["Adaptive", "Easy", "Medium", "Hard"];
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

const companyInitial = (name) => name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "CO";

function CompanyLogo({ name, domain }) {
  const [failed, setFailed] = useState(false);
  if (failed || !domain) {
    return <span className="company-logo-fallback" aria-hidden="true">{companyInitial(name)}</span>;
  }
  return (
    <img
      className="company-logo-img"
      src={`https://www.google.com/s2/favicons?domain=${domain}&sz=128`}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function CompanyInterviewSetup({ onStart, onBack }) {
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [role, setRole] = useState("Software Developer");
  const [experience, setExperience] = useState("Fresher");
  const [round, setRound] = useState("Technical");
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
  const [resumeName, setResumeName] = useState("");
  const [resumeBusy, setResumeBusy] = useState(false);
  const [resumeError, setResumeError] = useState("");
  const resumeInputRef = React.useRef(null);
  const [sampleQuestions, setSampleQuestions] = useState([]);
  const [sampleBusy, setSampleBusy] = useState(false);
  const [sampleError, setSampleError] = useState("");
  const [generated, setGenerated] = useState(false);

  const effectiveCompany = company || customCompany.trim();

  const generateSamples = async () => {
    if (!effectiveCompany) {
      setSampleError("Select or enter a company first.");
      return;
    }
    setSampleBusy(true);
    setSampleError("");
    try {
      const response = await fetch("/api/company-sample-questions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          company: effectiveCompany,
          role,
          experience,
          round,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not generate sample questions.");
      setSampleQuestions(Array.isArray(result?.questions) ? result.questions : []);
      setGenerated(true);
    } catch (error) {
      setSampleError(error.message || "Could not generate sample questions.");
    } finally {
      setSampleBusy(false);
    }
  };

  const handleResumeUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setResumeBusy(true);
    setResumeError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const response = await fetch("/api/extract-resume", { method: "POST", body: formData });
      const result = await response.json().catch(() => null);
      if (!response.ok || typeof result?.resume !== "string" || !result.resume.trim()) {
        throw new Error(result?.error || "Could not read that resume. Try a PDF, DOCX, or TXT file.");
      }
      const payload = { text: result.resume.trim().slice(0, 6000), name: result.fileName || file.name };
      try {
        localStorage.setItem("genie-interview-resume", JSON.stringify(payload));
      } catch {
        // Storage may be unavailable.
      }
      setResumeName(payload.name);
    } catch (error) {
      setResumeError(error.message || "Could not upload the resume.");
      setResumeName("");
    } finally {
      setResumeBusy(false);
    }
  };

  const removeResume = () => {
    try { localStorage.removeItem("genie-interview-resume"); } catch { /* ignore */ }
    setResumeName("");
    setResumeError("");
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

  const handleStart = () => {
    if (!effectiveCompany) return;
    const config = {
      role,
      type: round,
      // Adaptive maps to the Medium baseline — Genie's adaptive engine adjusts difficulty per answer.
      difficulty: difficulty === "Adaptive" ? "Medium" : difficulty,
      experience,
      company: effectiveCompany,
      duration,
      questions,
      language,
      explanationLanguage,
      mode,
    };
    try {
      localStorage.setItem("genie-interview-setup", JSON.stringify(config));
      localStorage.setItem("genie-interview-autostart", "1");
    } catch {
      // Storage may be unavailable.
    }
    onStart?.(config);
  };

  const configRows = [
    { label: "Company", value: effectiveCompany || "—" },
    { label: "Job role", value: role },
    { label: "Experience", value: experience },
    { label: "Interview round", value: round },
    { label: "Difficulty", value: difficulty },
    { label: "Duration", value: `${duration} min` },
    { label: "Questions", value: questions },
    { label: "Language", value: languageOptions.find((l) => l.code === language)?.name || language },
    { label: "Mode", value: modeOptions.find((m) => m.value === mode)?.label || mode },
  ];

  return (
    <div className="company-setup">
      <header className="company-setup-header">
        {onBack && <button type="button" className="prep-back" onClick={onBack}>← Back to workspace</button>}
        <span className="section-kicker">COMPANY-SPECIFIC INTERVIEW</span>
        <h1>Company Interview</h1>
        <p>Your interview will be personalized using the selected company and job role.</p>
      </header>

      <section className="company-picker">
        <h2>Select company</h2>
        <div className="company-grid">
          {companies.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`company-card${effectiveCompany === item.name ? " selected" : ""}`}
              onClick={() => { setCompany(item.name); setCustomCompany(""); }}
            >
              <CompanyLogo name={item.name} domain={item.domain} />
              <span className="company-name">{item.name}</span>
            </button>
          ))}
        </div>
        <div className="company-custom">
          <label htmlFor="custom-company">Or enter another company</label>
          <input
            id="custom-company"
            type="text"
            placeholder="Company name"
            value={customCompany}
            onChange={(event) => { setCustomCompany(event.target.value); setCompany(""); }}
          />
        </div>
      </section>

      <section className="company-settings">
        <h2>Next configuration</h2>
        <div className="company-settings-grid">
          <label>
            <span>Job role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              {interviewRoleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Experience</span>
            <select value={experience} onChange={(event) => setExperience(event.target.value)}>
              {experienceOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Interview round</span>
            <select value={round} onChange={(event) => setRound(event.target.value)}>
              {roundOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {difficultyOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Duration</span>
            <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}>
              {durationOptions.map((item) => <option key={item} value={item}>{item} min</option>)}
            </select>
          </label>
          <label>
            <span>Questions</span>
            <select value={questions} onChange={(event) => setQuestions(Number(event.target.value))}>
              {questionOptions.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label>
            <span>Language</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value)}>
              {languageOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span>Explanations in</span>
            <select value={explanationLanguage} onChange={(event) => setExplanationLanguage(event.target.value)}>
              {explanationOptions.map((item) => <option key={item.code} value={item.code}>{item.name}</option>)}
            </select>
          </label>
          <label>
            <span>Mode</span>
            <select value={mode} onChange={(event) => setMode(event.target.value)}>
              {modeOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </label>
        </div>

        <div className="company-resume-row">
          <input
            ref={resumeInputRef}
            type="file"
            accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
            className="sr-only"
            onChange={handleResumeUpload}
          />
          <button type="button" className="secondary-button" onClick={() => resumeInputRef.current?.click()} disabled={resumeBusy}>
            {resumeBusy ? "Analyzing…" : "⬆ Upload Resume (optional)"}
          </button>
          {resumeName ? (
            <span className="resume-upload-status">
              <strong>{resumeName}</strong> — Genie will ask about your resume
              <button type="button" onClick={removeResume}>Remove</button>
            </span>
          ) : (
            <span className="company-resume-hint">PDF, DOCX, or TXT — personalize questions with your resume</span>
          )}
          {resumeError && <p className="preparation-error" role="alert">{resumeError}</p>}
        </div>

        <div className="company-toggle-row">
          <button type="button" className={`voice-output-toggle${voiceOn ? " enabled" : ""}`} onClick={toggleVoice} aria-pressed={voiceOn}>
            {voiceOn ? "◖)) Voice on" : "Voice off"}
          </button>
          <button type="button" className={`voice-output-toggle${handsFree ? " enabled" : ""}`} onClick={toggleHandsFree} aria-pressed={handsFree} title="Automatically listen for your answers after each question">
            {handsFree ? "◉ Hands-free on" : "Hands-free off"}
          </button>
        </div>

        <dl className="company-config-summary">
          {configRows.map((row) => (
            <div key={row.label}>
              <dt>{row.label}</dt>
              <dd>{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="company-samples">
        <div className="company-samples-head">
          <h2>Sample questions generated</h2>
          <button type="button" className="secondary-button" onClick={generateSamples} disabled={sampleBusy || !effectiveCompany}>
            {sampleBusy ? "Generating…" : generated ? "↻ Regenerate" : "Generate sample questions"}
          </button>
        </div>
        {sampleError && <p className="preparation-error" role="alert">{sampleError}</p>}
        {sampleQuestions.length > 0 && (
          <ol className="company-sample-list">
            {sampleQuestions.map((question, index) => <li key={index}>{question}</li>)}
          </ol>
        )}
        {generated && sampleQuestions.length > 0 && (
          <p className="company-sample-note">Company-oriented practice questions — inspired by typical {effectiveCompany} interviews, not verified actual questions.</p>
        )}
      </section>

      <div className="company-setup-actions">
        <button type="button" className="primary-button" onClick={handleStart} disabled={!effectiveCompany}>
          Start Interview →
        </button>
      </div>
    </div>
  );
}
