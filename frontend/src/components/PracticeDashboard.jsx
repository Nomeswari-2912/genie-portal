import React from "react";

const NAV_ITEMS = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "questions", label: "Question Bank", icon: "📚" },
  { id: "interview", label: "Mock Interview", icon: "🎤" },
  { id: "roadmap", label: "Roadmap", icon: "🗺️" },
  { id: "resume", label: "Resume Build", icon: "📄" },
  { id: "quiz", label: "Quiz", icon: "✅" },
  { id: "settings", label: "Settings", icon: "⚙️" },
];

function ProgressCircle({ percent, color = "#3b82f6" }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div className="tw-circle">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e0f2fe" strokeWidth="9" />
        <circle
          cx="40" cy="40" r={radius} fill="none"
          stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform="rotate(-90 40 40)"
        />
      </svg>
      <span className="tw-circle-label">{percent}%</span>
    </div>
  );
}

export default function PracticeDashboard({ onNavigate }) {
  const navTarget = {
    home: "workspace",
    questions: "practice",
    interview: "session",
    roadmap: "plan",
    resume: "workspace",
    quiz: "practice",
    settings: "session",
  };

  return (
    <div className="tw-dashboard">
      {/* Left sidebar */}
      <aside className="tw-sidebar">
        <div className="tw-logo">
          <span className="tw-logo-icon">🚲</span>
          <div>
            <strong>Training Wheels</strong>
            <small>AI Interview Prep</small>
          </div>
        </div>
        <nav className="tw-nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className="tw-nav-item"
              onClick={() => onNavigate?.(navTarget[item.id] || "workspace")}
            >
              <span className="tw-nav-icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
        <div className="tw-profile">
          <span className="tw-avatar">VN</span>
          <div className="tw-profile-info">
            <strong>Vaka Nomeswari</strong>
            <small>vaka.nomeswari@email.com</small>
          </div>
          <button type="button" className="tw-dots" aria-label="Profile menu">⋯</button>
        </div>
      </aside>

      {/* Main content */}
      <main className="tw-main">
        <h1 className="tw-title"><span className="tw-title-icon">📊</span> My Progress Dashboard</h1>

        <div className="tw-skill-cards">
          <div className="tw-card">
            <ProgressCircle percent={0} color="#3b82f6" />
            <h3>Technical Skills</h3>
            <p>Algorithms, data structures, and coding challenges.</p>
          </div>
          <div className="tw-card">
            <ProgressCircle percent={0} color="#8b5cf6" />
            <h3>Behavioral Skills</h3>
            <p>Teamwork, communication, and adaptability.</p>
          </div>
          <div className="tw-card">
            <ProgressCircle percent={0} color="#06b6d4" />
            <h3>Problem Solving</h3>
            <p>Logical thinking and decision-making.</p>
          </div>
        </div>

        <div className="tw-card tw-breakdown">
          <h3>Detailed Progress Breakdown</h3>
          <table className="tw-table">
            <thead>
              <tr><th>Module</th><th>Progress</th><th>Tasks Completed</th><th>Total Tasks</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Algorithms</td>
                <td><div className="tw-mini-bar"><span style={{ width: "0%" }} /></div> 0%</td>
                <td>0</td><td>50</td>
              </tr>
              <tr>
                <td>Behavioral Questions</td>
                <td><div className="tw-mini-bar"><span style={{ width: "0%" }} /></div> 0%</td>
                <td>0</td><td>20</td>
              </tr>
            </tbody>
          </table>
        </div>
      </main>

      {/* Right sidebar */}
      <aside className="tw-right">
        <div className="tw-card">
          <h3>Scheduled Interviews</h3>
          <div className="tw-sched-item">
            <div className="tw-sched-top">
              <strong>AI Basics</strong>
              <span className="tw-badge">Confirmed</span>
            </div>
            <div className="tw-sched-meta">
              <span>Interviews: 0/40</span>
              <span>Starts in: 45 min</span>
            </div>
            <div className="tw-mini-bar"><span style={{ width: "0%" }} /></div>
          </div>
        </div>

        <div className="tw-card">
          <h3>Progress Tracking</h3>
          <p className="tw-updated">Last updated: 2h ago</p>
          <div className="tw-track-item">
            <div className="tw-track-top"><strong>AI Interview Practice</strong><span>0%</span></div>
            <div className="tw-mini-bar"><span style={{ width: "0%" }} /></div>
            <small>Completed: 0/50 · Next: System Design</small>
          </div>
          <div className="tw-track-item">
            <div className="tw-track-top"><strong>Behavioral</strong><span>0%</span></div>
            <div className="tw-mini-bar"><span style={{ width: "0%" }} /></div>
            <small>Completed: 0/20</small>
          </div>
        </div>
      </aside>
    </div>
  );
}
