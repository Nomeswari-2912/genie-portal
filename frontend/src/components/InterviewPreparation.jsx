import { useState } from "react";

export default function InterviewPreparation({ onSubmit, onCancel }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeError, setResumeError] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleResumeUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setResumeError("Please upload your resume in PDF format");
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
      setResumeError("Please upload your resume in PDF format");
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

      await onSubmit(formData);
    } catch (error) {
      console.error("Preparation submission failed", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="interview-preparation-container">
      <header className="preparation-header">
        <span className="section-kicker">INTERVIEW PREPARATION</span>
        <h1>Interview Preparation</h1>
        <p>Upload your resume and provide additional information to prepare for your interview.</p>
      </header>

      <form className="preparation-form" onSubmit={handleSubmit}>
        <section className="preparation-section">
          <label className="preparation-label">
            Resume
            <span className="required">*</span>
          </label>
          <div className="preparation-upload">
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf"
              onChange={handleResumeUpload}
              className="sr-only"
            />
            <label htmlFor="resume-upload" className={`upload-button${resumeFile ? " has-file" : ""}`}>
              {resumeFile ? `✓ ${resumeFile.name}` : "Upload Resume PDF"}
            </label>
            {resumeError && <p className="preparation-error" role="alert">{resumeError}</p>}
            <p className="preparation-hint">* Required - Please upload your resume in PDF format</p>
          </div>
        </section>

        <section className="preparation-section">
          <label className="preparation-label">Professional Links</label>
          <div className="preparation-links">
            <div className="preparation-input">
              <span className="input-icon">💼</span>
              <input
                type="url"
                placeholder="LinkedIn URL (Optional)"
                value={linkedin}
                onChange={(event) => setLinkedin(event.target.value)}
              />
            </div>
            <div className="preparation-input">
              <span className="input-icon">{`{ }`}</span>
              <input
                type="url"
                placeholder="GitHub URL (Optional)"
                value={github}
                onChange={(event) => setGithub(event.target.value)}
              />
            </div>
            <div className="preparation-input">
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

        <section className="preparation-section">
          <label className="preparation-label">Additional Information</label>
          <textarea
            className="preparation-textarea"
            placeholder="Tell us more about yourself, your projects, achievements,…"
            value={additionalInfo}
            onChange={(event) => setAdditionalInfo(event.target.value)}
            rows="4"
          />
        </section>

        <section className="preparation-section">
          <label className="preparation-label">Job Description</label>
          <textarea
            className="preparation-textarea"
            placeholder="Paste the job description here"
            value={jobDescription}
            onChange={(event) => setJobDescription(event.target.value)}
            rows="4"
          />
        </section>

        <div className="preparation-actions">
          {onCancel && <button type="button" onClick={onCancel} className="cancel-button">Cancel</button>}
          <button type="submit" className="primary-button" disabled={submitting || !resumeFile}>
            {submitting ? "Preparing…" : "Submit Interview Preparation"}
          </button>
        </div>
      </form>
    </div>
  );
}
