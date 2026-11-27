import React, { useState } from "react";

const dimensionLabels = {
  relevance: "Relevance",
  technicalAccuracy: "Technical accuracy",
  completeness: "Completeness",
  clarity: "Clarity",
  structure: "Structure",
};

export default function AnswerSuggestions({ question, answer, role, evaluation }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceText, setPracticeText] = useState("");
  const [practiceBusy, setPracticeBusy] = useState(false);
  const [practiceFeedback, setPracticeFeedback] = useState("");

  const load = async () => {
    if (data) {
      setOpen((current) => !current);
      return;
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/answer-suggestions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          question,
          answer,
          role,
          evaluation: evaluation
            ? { assessment: evaluation.assessment, feedback: evaluation.feedback }
            : null,
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not generate suggestions.");
      setData(result);
      setOpen(true);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const practiceAgain = async () => {
    if (!practiceText.trim() || practiceBusy) return;
    setPracticeBusy(true);
    setPracticeFeedback("");
    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          history: [{
            role: "user",
            text: `I'm practicing interview answers for the ${role} role. The question was: "${question}". My rewritten answer is: "${practiceText.trim()}". Give brief feedback on what improved versus the original and what still needs work.`,
          }],
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not get practice feedback.");
      setPracticeFeedback(result.reply || "");
    } catch (requestError) {
      setPracticeFeedback(requestError.message);
    } finally {
      setPracticeBusy(false);
    }
  };

  return (
    <div className="answer-suggestions">
      <button type="button" className="suggestions-toggle" onClick={load} disabled={busy || !question}>
        {busy ? "Analyzing…" : data ? (open ? "Hide suggestions" : "Show suggestions") : "✨ Get answer suggestions"}
      </button>
      {error && <p className="suggestions-error" role="alert">{error}</p>}
      {open && data && (
        <div className="suggestions-card">
          <section>
            <h4>Your original answer</h4>
            <blockquote>{answer}</blockquote>
          </section>
          <section>
            <h4>Answer evaluation</h4>
            <div className="suggestion-dimensions">
              {Object.entries(dimensionLabels).map(([key, label]) => (
                <div className="suggestion-dimension" key={key}>
                  <span>{label}</span>
                  <strong>{data.dimensions?.[key] ?? "—"}{data.dimensions?.[key] !== null && data.dimensions?.[key] !== undefined ? "%" : ""}</strong>
                </div>
              ))}
            </div>
          </section>
          {data.didWell?.length > 0 && (
            <section><h4>What you did well</h4><ul>{data.didWell.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
          )}
          {data.missed?.length > 0 && (
            <section><h4>What you missed</h4><ul>{data.missed.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
          )}
          {data.improvements?.length > 0 && (
            <section><h4>How to improve</h4><ul>{data.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul></section>
          )}
          {data.sampleAnswer && (
            <section>
              <h4>Suggested answer</h4>
              <blockquote className="suggested-answer">{data.sampleAnswer}</blockquote>
            </section>
          )}
          <section>
            <button type="button" className="practice-toggle" onClick={() => setPracticeOpen((current) => !current)}>
              {practiceOpen ? "Hide practice area" : "🎤 Practice answering again"}
            </button>
            {practiceOpen && (
              <div className="practice-area">
                <textarea
                  value={practiceText}
                  onChange={(event) => setPracticeText(event.target.value)}
                  placeholder="Rewrite the answer in your own words…"
                  rows="4"
                />
                <button type="button" onClick={practiceAgain} disabled={practiceBusy || !practiceText.trim()}>
                  {practiceBusy ? "Getting feedback…" : "Get feedback on my rewrite"}
                </button>
                {practiceFeedback && <p className="practice-feedback">{practiceFeedback}</p>}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
