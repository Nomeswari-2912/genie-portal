import React, { useState } from "react";

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
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const handleResumeUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setResumeError("");
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
              <button type="button" className="primary-button" onClick={onStartInterview}>
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
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    className="sr-only"
                  />
                  <label htmlFor="resume-upload" className={`upload-button genieview-style${resumeFile ? " has-file" : ""}`}>
                    <span className="upload-icon">📄</span>
                    {resumeFile ? `✓ ${resumeFile.name}` : "Upload Resume PDF"}
                  </label>
                  <p className="preparation-error genieview-style" role="alert">{resumeError || "* Required - Please upload your resume in PDF format"}</p>
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
