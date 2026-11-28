import React, { useState } from "react";

const LANGUAGES = [
  { name: "English", flag: "🇺🇸" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "Russian", flag: "🇷🇺" },
  { name: "Romanian", flag: "🇷🇴" },
  { name: "Slovak", flag: "🇸🇰" },
  { name: "Croatian", flag: "🇭🇷" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "German", flag: "🇩🇪" },
  { name: "Polish", flag: "🇵🇱" },
  { name: "Danish", flag: "🇩🇰" },
];

export default function LanguageSession({ onBack, onStart }) {
  const [selected, setSelected] = useState("English");

  return (
    <div className="lang-session-page">
      {/* Blurred dashboard background */}
      <div className="lang-bg" aria-hidden="true">
        <div className="lang-bg-content">
          <div className="lang-bg-nav">
            <span className="lang-bg-logo">✦ Genie</span>
            <span>Dashboard</span><span>Interviews</span><span>Reports</span>
          </div>
          <h1 className="lang-bg-title">Welcome back, Vaka</h1>
          <div className="lang-bg-banner">Prepare for your next interview with AI-powered mock sessions</div>
          <div className="lang-bg-cards">
            <div className="lang-bg-card" /><div className="lang-bg-card" /><div className="lang-bg-card" />
          </div>
        </div>
      </div>
      <div className="lang-overlay" aria-hidden="true" />

      {/* New Session modal */}
      <div className="lang-modal-wrap">
        <div className="lang-modal">
          <button type="button" className="lang-modal-close" onClick={onBack} aria-label="Close">×</button>
          <h2 className="lang-modal-title">New Session</h2>
          <p className="lang-modal-sub">Step 5 of 5</p>
          <p className="lang-modal-instruction">Fluent in multiple languages? Select your preferred language.</p>

          <div className="lang-grid">
            {LANGUAGES.map((lang) => {
              const active = selected === lang.name;
              return (
                <button
                  key={lang.name}
                  type="button"
                  className={`lang-card${active ? " active" : ""}`}
                  onClick={() => setSelected(lang.name)}
                >
                  <span className="lang-flag">{lang.flag}</span>
                  <span className="lang-name">{lang.name}</span>
                  {active && <span className="lang-check">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="lang-modal-footer">
            <button type="button" className="lang-back" onClick={onBack}>Back</button>
            <button type="button" className="lang-start" onClick={() => onStart?.(selected)}>Start Session →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
