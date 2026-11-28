import React, { useEffect, useState } from "react";

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

  // Clear cached data when question or answer changes
  useEffect(() => {
    setData(null);
    setOpen(false);
    setError("");
  }, [question, answer]);

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
          <section className="suggestion-section">
            <h4>Answer Quality</h4>
            <p className="suggestion-quality">{data.overall || "Good"}</p>
          </section>

          <section className="suggestion-section">
            <h4>Answer Assessment</h4>
            <div className="suggestion-assessment">
              {data.didWell?.length > 0 && (
                <div className="assessment-block">
                  <strong>What Went Well:</strong>
                  <ul>{data.didWell.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
              {data.missed?.length > 0 && (
                <div className="assessment-block">
                  <strong>What Needs Improvement:</strong>
                  <ul>{data.missed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          </section>

          <section className="suggestion-section">
            <h4>Answer Guidance</h4>
            <div className="suggestion-guidance">
              {data.improvements?.length > 0 && (
                <div className="guidance-block">
                  <strong>What Would Have Impressed the Interviewer:</strong>
                  <ul>{data.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
              {data.sampleAnswer && (
                <div className="guidance-block">
                  <strong>Refined Answer: Putting It All Together</strong>
                  <blockquote className="suggested-answer">{data.sampleAnswer}</blockquote>
                </div>
              )}
            </div>
          </section>

          <section className="suggestion-section">
            <h4>Example Hint</h4>
            <p className="suggestion-hint">{data.hint || "useState manages state, while useEffect handles side effects."}</p>
          </section>

          <section className="suggestion-section">
            <p className="suggestion-assistance">Genie AI assistance: <em>"Would you like another clue or would you like to try answering?"</em></p>
            <button type="button" className="primary-button suggestion-practice-btn">
              Get Another Hint
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
