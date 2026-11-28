import React, { useState } from "react";
import { interviewLanguages } from "./LiveInterview.jsx";

export default function LanguageSession({ onBack, onStart }) {
  const [selected, setSelected] = useState("en");

  return (
    <div className="lang-session-page">
      {/* New Session modal */}
      <div className="lang-modal-wrap">
        <div className="lang-modal">
          <button type="button" className="lang-modal-close" onClick={onBack} aria-label="Close">×</button>
          <h2 className="lang-modal-title">New Session</h2>
          <p className="lang-modal-sub">Step 5 of 5</p>
          <p className="lang-modal-instruction">Fluent in multiple languages? Select your preferred language.</p>

          <div className="lang-grid">
            {interviewLanguages.map((lang) => {
              const active = selected === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  className={`lang-card${active ? " active" : ""}`}
                  onClick={() => setSelected(lang.code)}
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
