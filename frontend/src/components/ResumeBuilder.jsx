import React, { useEffect, useRef, useState } from "react";
import CareerDashboard from "./CareerDashboard.jsx";

const initialResume = {
  name: "Vaka Nomeswari",
  role: "Product Designer",
  email: "",
  location: "",
  summary: "Curious product designer with 4+ years of experience turning complex problems into simple, thoughtful digital experiences.",
  skills: "Product strategy, UX research, Figma, Prototyping, Design systems",
  experience: "",
  internships: "",
  education: "",
  certifications: "",
};

const resumeStorageKey = "genie-resume-details";

function loadResume() {
  let savedDetails = {};
  try {
    const stored = localStorage.getItem(resumeStorageKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        savedDetails = parsed;
      } else {
        console.error("Saved resume details have an invalid format.");
      }
    }
  } catch (error) {
    console.error("Could not load saved resume details.", error);
  }

  const resume = Object.fromEntries(
    Object.keys(initialResume).map((field) => [
      field,
      typeof savedDetails[field] === "string" && !(field === "name" && savedDetails[field] === "Alex Morgan")
        ? savedDetails[field]
        : initialResume[field],
    ]),
  );
  const savedSkills = localStorage.getItem("genie-resume-skills");
  resume.skills = [...new Set([...resume.skills.split(","), ...(savedSkills ?? "").split(",")]
    .map((skill) => skill.trim())
    .filter(Boolean))].join(", ");
  return resume;
}

export default function ResumeBuilder() {
  const [view, setView] = useState("dashboard");
  const [resume, setResume] = useState(loadResume);
  const [isEditing, setIsEditing] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [atsStatus, setAtsStatus] = useState("idle");
  const [atsError, setAtsError] = useState("");
  const resumeUploadRef = useRef(null);
  const atsRequestRef = useRef(null);
  const atsTimerRef = useRef(null);
  const update = (field) => (event) => setResume((current) => ({ ...current, [field]: event.target.value }));
  const skills = resume.skills.split(",").map((skill) => skill.trim()).filter(Boolean);
  const experienceEntries = resume.experience.split("\n").map((entry) => entry.trim()).filter(Boolean);
  const internshipEntries = resume.internships.split("\n").map((entry) => entry.trim()).filter(Boolean);
  const educationEntries = resume.education.split("\n").map((entry) => entry.trim()).filter(Boolean);
  const certificationEntries = resume.certifications.split("\n").map((entry) => entry.trim()).filter(Boolean);

  useEffect(() => {
    atsRequestRef.current?.abort();
    setAtsScore(0);
    setAtsError("");
    setAtsStatus("idle");
    if (!resumeFile || !jobDescription.trim()) return undefined;

    atsTimerRef.current = window.setTimeout(async () => {
      atsTimerRef.current = null;
      const controller = new AbortController();
      atsRequestRef.current = controller;
      setAtsStatus("loading");
      const formData = new FormData();
      formData.append("resume", resumeFile);
      formData.append("jobDescription", jobDescription.trim());

      try {
        const response = await fetch("/api/ats-score", { method: "POST", body: formData, signal: controller.signal });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Could not calculate the ATS score.");
        if (!Number.isInteger(result.score) || result.score < 0 || result.score > 100) {
          throw new Error("The ATS score response was invalid. Please try again.");
        }
        setAtsScore(result.score);
        setAtsStatus("done");
      } catch (error) {
        if (error.name === "AbortError") return;
        console.error("Could not calculate an ATS score.", error);
        setAtsError(error instanceof Error ? error.message : "Could not calculate the ATS score.");
        setAtsStatus("error");
      }
    }, 400);

    return () => {
      window.clearTimeout(atsTimerRef.current);
      atsTimerRef.current = null;
      atsRequestRef.current?.abort();
    };
  }, [resumeFile, jobDescription]);

  const toggleEditing = () => {
    if (!isEditing) {
      setIsEditing(true);
      setSaveMessage("");
      return;
    }

    try {
      localStorage.setItem(resumeStorageKey, JSON.stringify(resume));
      setIsEditing(false);
      setSaveMessage("Your resume details have been saved.");
    } catch (error) {
      console.error("Could not save your resume details.", error);
      setSaveMessage("Could not save your resume details. Check browser storage and try again.");
    }
  };

  const calculateAtsScore = async (event) => {
    event.preventDefault();
    if (!resumeFile || !jobDescription.trim() || atsStatus === "loading") return;

    setAtsStatus("loading");
    setAtsError("");
    setAtsScore(0);
    window.clearTimeout(atsTimerRef.current);
    atsTimerRef.current = null;
    atsRequestRef.current?.abort();
    const controller = new AbortController();
    atsRequestRef.current = controller;
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobDescription", jobDescription.trim());

    try {
      const response = await fetch("/api/ats-score", { method: "POST", body: formData, signal: controller.signal });
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("The ATS score endpoint returned an invalid response.", parseError);
        throw new Error("Could not read the ATS score response. Restart the app and try again.");
      }
      if (!response.ok) throw new Error(result.error || "Could not calculate the ATS score.");
      if (!Number.isInteger(result.score) || result.score < 0 || result.score > 100) {
        throw new Error("The ATS score response was invalid. Please try again.");
      }
      setAtsScore(result.score);
      setAtsStatus("done");
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error("Could not calculate an ATS score.", error);
      setAtsError(error instanceof Error ? error.message : "Could not calculate the ATS score.");
      setAtsStatus("error");
    }
  };

  const updateResumeFile = (event) => {
    setResumeFile(event.target.files?.[0] ?? null);
    setAtsScore(0);
    setAtsError("");
    setAtsStatus("idle");
  };

  const updateJobDescription = (event) => {
    setJobDescription(event.target.value);
    setAtsScore(0);
    setAtsError("");
    setAtsStatus("idle");
  };

  return (
    <div className="career-workspace">
      <nav className="genie-view-switch resume-view-switch" aria-label="Resume workspace views">
        <button className={view === "dashboard" ? "selected" : ""} aria-current={view === "dashboard" ? "page" : undefined} onClick={() => setView("dashboard")}>Skills Dashboard</button>
        <button className={view === "resume" ? "selected" : ""} aria-current={view === "resume" ? "page" : undefined} onClick={() => setView("resume")}>Resume Builder</button>
      </nav>
      {view === "dashboard" ? <CareerDashboard atsScore={atsScore} /> : <div className="tool-page">
      <div className="page-heading compact-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR STORY, WELL TOLD</div>
          <h1>Build a resume that <span className="serif-accent">feels like you.</span></h1>
          <p>A few details in, a clearer picture of your next chapter out.</p>
        </div>
        <button className="primary-button print-button" onClick={() => window.print()}><span>↓</span> Print / Save PDF</button>
      </div>

      <form className="panel ats-score-panel" onSubmit={calculateAtsScore}>
        <div className="ats-score-heading">
          <div><span className="section-kicker">RESUME MATCH</span><h2>ATS Score</h2></div>
          {atsScore !== null && <div className="ats-score-result" role="status" aria-label={`ATS score ${atsScore} out of 100`}><strong>{atsScore}</strong><span>/100</span></div>}
        </div>
        <div className="ats-upload-grid">
          <div className="ats-upload-field">
            <input ref={resumeUploadRef} type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" onChange={updateResumeFile} aria-label="Upload resume" />
            <button type="button" className="ats-upload-button" onClick={() => resumeUploadRef.current?.click()}><span>↑</span> Upload Resume</button>
            <span className="ats-file-name">{resumeFile?.name ?? "PDF, DOCX, or TXT · Up to 5 MB"}</span>
          </div>
          <label className="ats-job-description">
            <span>Job Description</span>
            <textarea value={jobDescription} onChange={updateJobDescription} placeholder="Paste or type the job description here…" rows={4} maxLength={100000} aria-label="Job description text" />
          </label>
        </div>
        <div className="ats-score-footer">
          <p>Estimated keyword match between your resume and the job description. ATS systems can score resumes differently.</p>
          <button type="submit" className="primary-button" disabled={!resumeFile || !jobDescription.trim() || atsStatus === "loading"}>{atsStatus === "loading" ? "Calculating…" : "Calculate ATS Score"}</button>
        </div>
        {atsError && <p className="ats-score-error" role="alert">{atsError}</p>}
      </form>

      <div className="resume-layout">
        <section className="panel editor-panel">
          <div className="panel-heading"><div><span className="section-kicker">01 — THE BASICS</span><h2>Your details</h2></div><button className="edit-mark" type="button" onClick={toggleEditing} aria-label={isEditing ? "Save resume details" : "Edit resume details"} title={isEditing ? "Save resume details" : "Edit resume details"}>{isEditing ? "✓" : "✎"}</button></div>
          <label className="field-label">Full name<input value={resume.name} onChange={update("name")} placeholder="Your name" readOnly={!isEditing} /></label>
          <label className="field-label">Professional title<input value={resume.role} onChange={update("role")} placeholder="e.g. Product Designer" readOnly={!isEditing} /></label>
          <div className="field-row">
            <label className="field-label">Email<input type="email" value={resume.email} onChange={update("email")} placeholder="you@email.com" readOnly={!isEditing} /></label>
            <label className="field-label">Location<input value={resume.location} onChange={update("location")} placeholder="City, Country" readOnly={!isEditing} /></label>
          </div>
          <label className="field-label">A little about you<textarea value={resume.summary} onChange={update("summary")} rows="4" placeholder="What makes your work yours?" readOnly={!isEditing} /></label>
          <label className="field-label">Your strengths <span className="label-note">Separate with commas</span><input value={resume.skills} onChange={update("skills")} placeholder="Research, teamwork, ..." readOnly={!isEditing} /></label>
          <label className="field-label">Experience <span className="label-note">One role per line</span><textarea value={resume.experience} onChange={update("experience")} rows="4" placeholder="Senior Designer — Company Name (2022–Present)&#10;Describe your impact and achievements" readOnly={!isEditing} /></label>
          <label className="field-label">Internships <span className="label-note">One internship per line</span><textarea value={resume.internships} onChange={update("internships")} rows="3" placeholder="Design Intern — Company Name (Summer 2023)&#10;Describe your contributions" readOnly={!isEditing} /></label>
          <label className="field-label">Education <span className="label-note">One qualification per line</span><textarea value={resume.education} onChange={update("education")} rows="3" placeholder="B.Des. in Product Design — University Name (2020–2024)" readOnly={!isEditing} /></label>
          <label className="field-label">Certifications <span className="label-note">One certification per line</span><textarea value={resume.certifications} onChange={update("certifications")} rows="3" placeholder="Certification name — Issuing organization (Year)" readOnly={!isEditing} /></label>
          {saveMessage && <p className="resume-save-message" role="status">{saveMessage}</p>}
          <div className="editor-tip"><span>✧</span><p><strong>A small tip</strong> Lead with the impact you made, not just the tasks you did.</p></div>
        </section>

        <section className="resume-preview-wrap">
          <div className="preview-toolbar"><span>LIVE PREVIEW</span><span><i /> Looking good</span></div>
          <article className="resume-paper">
            <div className="resume-paper-top"><span>CURRICULUM VITAE</span><span>✦</span></div>
            <h2>{resume.name || "Your Name"}</h2>
            <div className="resume-role">{resume.role || "Your Professional Title"}</div>
            <div className="resume-contact">{resume.email || "you@email.com"} <span>·</span> {resume.location || "Your Location"}</div>
            <div className="resume-rule" />
            <h3>PROFILE</h3>
            <p>{resume.summary || "A short introduction about your experience and what you bring to the table."}</p>
            <div className="resume-rule" />
            <h3>CORE STRENGTHS</h3>
            <div className="skill-list">{(skills.length ? skills : ["Your skills"]).map((skill) => <span key={skill}>{skill}</span>)}</div>
            <div className="resume-rule" />
            <h3>EXPERIENCE</h3>
            {experienceEntries.length ? (
              <ul className="resume-entry-list">{experienceEntries.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul>
            ) : <div className="resume-placeholder"><p>Add your work experience in the editor.</p></div>}
            <div className="resume-rule" />
            <h3>INTERNSHIPS</h3>
            {internshipEntries.length ? (
              <ul className="resume-entry-list">{internshipEntries.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul>
            ) : <div className="resume-placeholder"><p>Add your internships in the editor.</p></div>}
            <div className="resume-rule" />
            <h3>EDUCATION</h3>
            {educationEntries.length ? (
              <ul className="resume-entry-list">{educationEntries.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul>
            ) : <div className="resume-placeholder"><p>Add your education details in the editor.</p></div>}
            <div className="resume-rule" />
            <h3>CERTIFICATIONS</h3>
            {certificationEntries.length ? (
              <ul className="resume-entry-list">{certificationEntries.map((entry, index) => <li key={`${entry}-${index}`}>{entry}</li>)}</ul>
            ) : <div className="resume-placeholder"><p>Add your certifications in the editor.</p></div>}
            <div className="resume-paper-bottom">{(resume.name || "Your Name").toUpperCase()} <span>·</span> {new Date().getFullYear()}</div>
          </article>
        </section>
      </div>
      </div>}
    </div>
  );
}
