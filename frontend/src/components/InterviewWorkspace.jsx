import React, { useState } from "react";

const icon = (body) => (
  <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">{body}</svg>
);

const defs = (id, c1, c2) => (
  <defs>
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={c1} /><stop offset="1" stopColor={c2} />
    </linearGradient>
    <radialGradient id={`${id}-gloss`} cx="0.35" cy="0.25" r="0.9">
      <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
  </defs>
);

const gloss = (id, cx = 24, cy = 24, rx = 20, ry = 20) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-gloss)`} />
);

export const interviewModules = [
  {
    id: "resume", label: "Resume-Based Interview", note: "Questions tailored to your resume", tone: "blue",
    icon: icon(<>
      {defs("g-resume", "#a78bfa", "#6d28d9")}
      <ellipse cx="24" cy="42" rx="14" ry="3" fill="#c4b5fd" opacity="0.35" />
      <path d="M12 8 Q12 5 15 5 H27 L36 14 V40 Q36 43 33 43 H15 Q12 43 12 40 Z" fill="url(#g-resume)" />
      <path d="M27 5 L27 14 H36" fill="#ede9fe" />
      <circle cx="22" cy="22" r="6" fill="#ede9fe" />
      <path d="M14 37 Q14 30 22 30 Q30 30 30 37" fill="#ede9fe" />
      <circle cx="33" cy="31" r="7" fill="#f8fafc" stroke="#7c3aed" strokeWidth="3" />
      <line x1="38" y1="36" x2="44" y2="42" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
      {gloss("g-resume", 21, 14, 9, 5)}
    </>),
  },
  {
    id: "company", label: "Company-Specific Interview", note: "Practice for specific companies", tone: "orange",
    icon: icon(<>
      {defs("g-company", "#818cf8", "#4f46e5")}
      <ellipse cx="24" cy="42" rx="15" ry="3" fill="#c7d2fe" opacity="0.35" />
      <rect x="10" y="12" width="28" height="30" rx="3" fill="url(#g-company)" />
      <rect x="10" y="12" width="28" height="6" rx="3" fill="#312e81" />
      {[16, 24, 32].map((x) => <rect key={x} x={x - 2.5} y="23" width="5" height="7" rx="1" fill="#e0e7ff" opacity="0.9" />)}
      <rect x="20" y="33" width="8" height="9" rx="1" fill="#312e81" />
      <rect x="6" y="38" width="12" height="7" rx="2" fill="#f59e0b" />
      <rect x="8" y="38" width="3" height="7" rx="1" fill="#b45309" />
      <rect x="15" y="38" width="3" height="7" rx="1" fill="#b45309" />
      {gloss("g-company", 20, 18, 8, 4)}
    </>),
  },
  {
    id: "coding", label: "Live Coding Round", note: "Code problems with test cases", tone: "teal",
    icon: icon(<>
      {defs("g-coding", "#67e8f9", "#2563eb")}
      <ellipse cx="24" cy="42" rx="16" ry="3" fill="#bae6fd" opacity="0.4" />
      <rect x="8" y="10" width="32" height="22" rx="4" fill="url(#g-coding)" />
      <rect x="8" y="10" width="32" height="5" rx="2.5" fill="#1e3a8a" />
      <rect x="12" y="32" width="24" height="4" rx="2" fill="#93c5fd" />
      <text x="24" y="27" textAnchor="middle" fontSize="13" fontWeight="800" fill="#fff" fontFamily="monospace">&lt;/&gt;</text>
      <circle cx="38" cy="14" r="6" fill="#a5f3fc" opacity="0.9" />
      <circle cx="38" cy="14" r="9" fill="none" stroke="#67e8f9" strokeWidth="1.5" opacity="0.5" />
      {gloss("g-coding", 19, 16, 9, 4)}
    </>),
  },
  {
    id: "speech", label: "Speech Analysis", note: "Filler words, pauses, WPM tracking", tone: "pink",
    icon: icon(<>
      {defs("g-speech", "#f0abfc", "#9333ea")}
      <ellipse cx="24" cy="43" rx="13" ry="3" fill="#f5d0fe" opacity="0.4" />
      <rect x="20" y="6" width="8" height="5" rx="2.5" fill="#7e22ce" />
      <rect x="16" y="11" width="16" height="24" rx="8" fill="url(#g-speech)" />
      <rect x="19" y="14" width="4" height="18" rx="2" fill="#fdf4ff" opacity="0.85" />
      {[6, 14, 22, 30, 38].map((x, i) => (
        <rect key={x} x={x} y={i % 2 ? 40 - i * 1.5 : 40 + i * 1.5} width="2.5" height={6 + i * 2} rx="1.25" fill={i % 2 ? "#c084fc" : "#e879f9"} opacity={0.55 + i * 0.08} />
      ))}
      {gloss("g-speech", 21, 18, 5, 8)}
    </>),
  },
  {
    id: "hints", label: "Genie Hints", note: "3-level hints without giving answers", tone: "yellow",
    icon: icon(<>
      {defs("g-hints", "#fde68a", "#d946ef")}
      <ellipse cx="24" cy="42" rx="12" ry="3" fill="#fde68a" opacity="0.4" />
      <path d="M10 38 L30 18" stroke="url(#g-hints)" strokeWidth="5" strokeLinecap="round" />
      <path d="M30 18 L36 12 L34 20 Z" fill="#fbbf24" />
      <path d="M36 8 l1.6 3.4 3.4 1.6 -3.4 1.6 -1.6 3.4 -1.6 -3.4 -3.4 -1.6 3.4 -1.6 Z" fill="#fde047" />
      <circle cx="14" cy="14" r="2.5" fill="#f0abfc" />
      <circle cx="38" cy="30" r="2" fill="#a5f3fc" />
      <circle cx="34" cy="36" r="1.6" fill="#fde047" />
      {gloss("g-hints", 24, 26, 10, 6)}
    </>),
  },
  {
    id: "suggestions", label: "Answer Suggestions", note: "Improved answers and practice mode", tone: "green",
    icon: icon(<>
      {defs("g-sugg", "#6ee7b7", "#7c3aed")}
      <ellipse cx="24" cy="42" rx="15" ry="3" fill="#a7f3d0" opacity="0.4" />
      <path d="M10 12 h24 a6 6 0 0 1 6 6 v8 a6 6 0 0 1 -6 6 h-12 l-7 6 v-6 h-5 a6 6 0 0 1 -6 -6 v-8 a6 6 0 0 1 6 -6 z" fill="url(#g-sugg)" />
      <path d="M16 36 h18 a5 5 0 0 1 5 5 v5 l-5 -4 h-13 a5 5 0 0 1 -5 -5 v-1 a5 5 0 0 1 5 -5 z" fill="#c4b5fd" />
      <circle cx="20" cy="22" r="2" fill="#fff" /><circle cx="28" cy="22" r="2" fill="#fff" /><circle cx="36" cy="22" r="2" fill="#fff" />
      <circle cx="26" cy="40" r="1.8" fill="#fff" /><circle cx="33" cy="40" r="1.8" fill="#fff" />
      {gloss("g-sugg", 21, 20, 10, 6)}
    </>),
  },
  {
    id: "adaptive", label: "Adaptive Interview", note: "Difficulty adjusts to performance", tone: "red",
    icon: icon(<>
      {defs("g-adapt", "#fca5a5", "#7c3aed")}
      <ellipse cx="24" cy="42" rx="15" ry="3" fill="#fecaca" opacity="0.4" />
      <rect x="8" y="14" width="7" height="24" rx="3.5" fill="#c4b5fd" />
      <rect x="19" y="22" width="7" height="16" rx="3.5" fill="#a78bfa" />
      <rect x="30" y="10" width="7" height="28" rx="3.5" fill="url(#g-adapt)" />
      <circle cx="37" cy="8" r="6" fill="#fde047" stroke="#f59e0b" strokeWidth="2" />
      <path d="M34.5 8 l2 2 3.5 -4" stroke="#92400e" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {gloss("g-adapt", 24, 18, 10, 5)}
    </>),
  },
  {
    id: "replay", label: "Interview Replay", note: "View transcripts and detailed reports", tone: "indigo",
    icon: icon(<>
      {defs("g-replay", "#a5b4fc", "#4f46e5")}
      <ellipse cx="24" cy="42" rx="15" ry="3" fill="#c7d2fe" opacity="0.4" />
      <rect x="6" y="12" width="36" height="24" rx="5" fill="url(#g-replay)" />
      <rect x="6" y="8" width="36" height="7" rx="3.5" fill="#312e81" />
      {[10, 17, 24, 31, 38].map((x, i) => (
        <rect key={x} x={x} y="8" width="3" height="7" fill={i % 2 ? "#f8fafc" : "#a5b4fc"} transform={`rotate(${i % 2 ? 18 : -18} ${x + 1.5} 11.5)`} />
      ))}
      <circle cx="24" cy="24" r="8" fill="#fff" opacity="0.95" />
      <path d="M22 19.5 L29 24 L22 28.5 Z" fill="#4f46e5" />
      {gloss("g-replay", 20, 18, 9, 5)}
    </>),
  },
  {
    id: "language", label: "Multi-language Support", note: "English, Hindi, Telugu, and more", tone: "cyan",
    icon: icon(<>
      {defs("g-lang", "#7dd3fc", "#2563eb")}
      <ellipse cx="24" cy="42" rx="14" ry="3" fill="#bae6fd" opacity="0.4" />
      <circle cx="24" cy="24" r="16" fill="url(#g-lang)" />
      <ellipse cx="24" cy="24" rx="16" ry="7" fill="none" stroke="#dbeafe" strokeWidth="1.5" opacity="0.7" />
      <ellipse cx="24" cy="24" rx="7" ry="16" fill="none" stroke="#dbeafe" strokeWidth="1.5" opacity="0.7" />
      <line x1="8" y1="24" x2="40" y2="24" stroke="#dbeafe" strokeWidth="1.5" opacity="0.7" />
      <text x="24" y="29" textAnchor="middle" fontSize="12" fontWeight="800" fill="#fff">A</text>
      {gloss("g-lang", 19, 17, 8, 5)}
    </>),
  },
  {
    id: "plan", label: "Personalized Practice Plan", note: "Skill-based practice recommendations", tone: "violet",
    icon: icon(<>
      {defs("g-plan", "#c084fc", "#6d28d9")}
      <ellipse cx="24" cy="42" rx="14" ry="3" fill="#d8b4fe" opacity="0.4" />
      <circle cx="24" cy="24" r="13" fill="url(#g-plan)" />
      <circle cx="24" cy="24" r="13" fill="none" stroke="#ede9fe" strokeWidth="1" opacity="0.5" />
      {[[24, 14], [33, 20], [30, 31], [18, 31], [15, 20], [18, 18], [30, 18]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="#fff" opacity="0.95" />
      ))}
      <path d="M24 14 L33 20 M33 20 L30 31 M30 31 L24 24 M24 24 L15 20 M15 20 L18 18 M18 18 L24 24 M30 18 L24 24" stroke="#fff" strokeWidth="1.6" opacity="0.85" fill="none" />
      {gloss("g-plan", 20, 17, 8, 5)}
    </>),
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
