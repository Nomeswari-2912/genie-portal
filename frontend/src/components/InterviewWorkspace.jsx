import React, { useState } from "react";

const icon = (paths) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);

export const interviewModules = [
  {
    id: "resume", label: "Resume-Based Interview", note: "Questions tailored to your resume", tone: "blue",
    icon: icon(<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>),
  },
  {
    id: "company", label: "Company-Specific Interview", note: "Practice for specific companies", tone: "orange",
    icon: icon(<><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M3 9h18M9 21V9" /></>),
  },
  {
    id: "coding", label: "Live Coding Round", note: "Code problems with test cases", tone: "teal",
    icon: icon(<><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></>),
  },
  {
    id: "speech", label: "Speech Analysis", note: "Filler words, pauses, WPM tracking", tone: "pink",
    icon: icon(<><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></>),
  },
  {
    id: "hints", label: "Genie Hints", note: "3-level hints without giving answers", tone: "yellow",
    icon: icon(<><path d="M12 3a6 6 0 0 0-9 9 9 9 0 0 0 9 9c4.97 0 9-2.24 9-5V4.34C21 3.6 19.67 3 18.25 3H12Z" /><path d="M8 12h8" /><path d="M9 16h6" /></>),
  },
  {
    id: "suggestions", label: "Answer Suggestions", note: "Improved answers and practice mode", tone: "green",
    icon: icon(<><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" /></>),
  },
  {
    id: "adaptive", label: "Adaptive Interview", note: "Difficulty adjusts to performance", tone: "red",
    icon: icon(<><path d="M3 3v18h18" /><path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" /></>),
  },
  {
    id: "replay", label: "Interview Replay", note: "View transcripts and detailed reports", tone: "indigo",
    icon: icon(<><circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16" /></>),
  },
  {
    id: "language", label: "Multi-language Support", note: "English, Hindi, Telugu, and more", tone: "cyan",
    icon: icon(<><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1-4-10z" /></>),
  },
  {
    id: "plan", label: "Personalized Practice Plan", note: "Skill-based practice recommendations", tone: "violet",
    icon: icon(<><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2Z" /><polyline points="14 2 14 8 20 8" /><path d="M9 15h6M9 11h6M9 7h3" /></>),
  },
];

function ModuleCard({ module, active, onClick }) {
  return (
    <button
      className={`interview-module-card ${module.tone} ${active ? "active" : ""}`}
      onClick={onClick}
      aria-pressed={active}
    >
      <span className={`interview-module-icon ${module.tone}`} aria-hidden="true">{module.icon}</span>
      <div className="interview-module-title">
        <strong>{module.label}</strong>
        <p>{module.note}</p>
      </div>
    </button>
  );
}

export default function InterviewWorkspace({ onOpenModule }) {
  const [activeModule, setActiveModule] = useState("session");

  const handleModuleClick = (id) => {
    setActiveModule(id);
    onOpenModule?.(id);
  };

  return (
    <div className="interview-workspace">
      <header className="interview-workspace-header">
        <div>
          <span className="section-kicker">AI MOCK INTERVIEW</span>
          <h1>Interview Workspace</h1>
          <p>Select a feature to start — Genie adapts to your resume, role, and performance.</p>
        </div>
        <div className="workspace-status">
          <span className="status-dot" aria-hidden="true" />
          <strong>Active</strong>
        </div>
      </header>

      <section className="interview-modules-grid">
        {interviewModules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            active={activeModule === module.id}
            onClick={() => handleModuleClick(module.id)}
          />
        ))}
      </section>
    </div>
  );
}
