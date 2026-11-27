import React, { useState } from "react";
import GenieBot from "./components/GenieBot.jsx";
import ResumeBuilder from "./components/ResumeBuilder.jsx";
import MockInterview from "./components/MockInterview.jsx";
import AttendanceReport from "./components/AttendanceReport.jsx";

const tools = [
  { id: "genie", label: "Genie Bot", icon: "✦", note: "Your career copilot" },
  { id: "resume", label: "Resume Builder", icon: "▤", note: "Make your next move" },
  { id: "interview", label: "AI Mock Interview", icon: "◉", note: "Practice with confidence" },
  { id: "attendance", label: "Attendance Report", icon: "▦", note: "See your progress" },
];

const components = {
  genie: GenieBot,
  resume: ResumeBuilder,
  interview: MockInterview,
  attendance: AttendanceReport,
};

export default function App() {
  const [activeTool, setActiveTool] = useState("genie");
  const [helpOpen, setHelpOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const ActiveComponent = components[activeTool];
  const active = tools.find((tool) => tool.id === activeTool);

  const openTool = (toolId) => {
    setActiveTool(toolId);
    setHelpOpen(false);
    setProfileOpen(false);
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#" aria-label="genie portal home" onClick={(event) => { event.preventDefault(); openTool("genie"); }}>
          <span className="brand-mark">g</span>
          <span>genie portal</span>
        </a>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="tool-nav" aria-label="Career tools">
          {tools.map((tool) => (
            <button
              className={`nav-item ${activeTool === tool.id ? "is-active" : ""}`}
              key={tool.id}
              onClick={() => openTool(tool.id)}
              aria-current={activeTool === tool.id ? "page" : undefined}
            >
              <span className={`nav-icon icon-${tool.id}`} aria-hidden="true">
                {tool.id === "genie" ? <img className="genie-nav-mascot" src="/genie-mascot.png" alt="" /> :
                  tool.id === "resume" ? <img className="resume-nav-icon" src="/resume-builder-icon.png" alt="" /> :
                    tool.id === "interview" ? <img className="interview-nav-icon" src="/interview-nav-icon.jpe?v=1" alt="" /> :
                      tool.id === "attendance" ? <img className="attendance-nav-icon" src="/attendance-report-icon.png?v=5" alt="" /> : tool.icon}
              </span>
              <span>{tool.label}</span>
              {activeTool === tool.id && <span className="nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <span className="upgrade-sparkle">✧</span>
            <strong>Big goals, meet Genie.</strong>
            <p>Your next opportunity is closer than you think.</p>
            <button onClick={() => openTool("resume")}>Explore your tools <span>↗</span></button>
          </div>
          <div className="profile">
            <div className="avatar">V</div>
            <div className="profile-copy"><strong>Vaka Nomeswari</strong><span>Free plan</span></div>
            <button
              className="profile-menu"
              aria-label="Profile options"
              aria-expanded={profileOpen}
              aria-controls="profile-details"
              onClick={() => { setProfileOpen((current) => !current); setHelpOpen(false); }}
            >···</button>
            {profileOpen && (
              <section className="profile-details-popover" id="profile-details" aria-label="Profile details">
                <strong>Vaka Nomeswari</strong>
                <span>Free plan · Career workspace</span>
                <button onClick={() => openTool("resume")}>Open Resume Builder <span>↗</span></button>
                <button className="popover-close" aria-label="Close profile details" onClick={() => setProfileOpen(false)}>Close</button>
              </section>
            )}
          </div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{active.label}</strong></div>
          <div className="topbar-right">
            <span className="help-link">Need a hand?</span>
            <button
              className="help-button"
              aria-label="Help"
              aria-expanded={helpOpen}
              aria-controls="help-details"
              onClick={() => { setHelpOpen((current) => !current); setProfileOpen(false); }}
            >?</button>
          </div>
          {helpOpen && (
            <section className="help-details-popover" id="help-details" aria-label="GenieBot help">
              <strong>Need a hand?</strong>
              <p>Choose a tool from the sidebar. In Genie Bot, upload a screenshot, add an optional message, and select <b>Get Answer</b>.</p>
              <button aria-label="Close help" onClick={() => setHelpOpen(false)}>Got it</button>
            </section>
          )}
        </header>
        <section className={`page-content ${activeTool === "resume" ? "career-dashboard-content" : ""}`} key={activeTool}>
          <ActiveComponent />
        </section>
        <footer className="app-footer"><span>Made for your next chapter</span><span className="footer-sparkle">✦</span></footer>
      </main>
    </div>
  );
}
