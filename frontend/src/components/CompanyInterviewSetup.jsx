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
  const [role, setRole] = useState("Software Engineer");
  const [experience, setExperience] = useState("Fresher");
  const [round, setRound] = useState("Technical");
  const [difficulty, setDifficulty] = useState("Adaptive");
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

  const handleStart = () => {
    if (!effectiveCompany) return;
    const config = {
      role,
      type: round,
      // Adaptive maps to the Medium baseline — Genie's adaptive engine adjusts difficulty per answer.
      difficulty: difficulty === "Adaptive" ? "Medium" : difficulty,
      experience,
      company: effectiveCompany,
      duration: 30,
      questions: 10,
      language: "en",
      mode: "voice",
      explanationLanguage: "",
    };
    try {
      localStorage.setItem("genie-interview-setup", JSON.stringify(config));
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
