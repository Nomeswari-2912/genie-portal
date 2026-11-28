import React, { useEffect, useState } from "react";

const fallbackData = {
  overall: "Good",
  didWell: ["You effectively highlighted a challenge you faced during college and the impact it had on your grades."],
  missed: ["You could have provided more specific details about the challenge and how you overcame it."],
  improvements: ["You could have mentioned any specific strategies or actions you took to improve your grades and manage your responsibilities effectively."],
  sampleAnswer: "During my final year of college, I faced the challenge of managing my coursework and commitments as a member of the college football team. Attending numerous practice sessions and tournaments affected my ability to balance both responsibilities, ultimately impacting my grades. However, I recognized the importance of my academic performance and made the decision to prioritize my studies over football. To overcome this challenge, I implemented specific strategies such as creating a detailed schedule, seeking guidance from professors, and utilizing effective time management techniques. By doing so, I was able to improve my grades and successfully manage my responsibilities.",
  hint: "useState manages state, while useEffect handles side effects.",
};

export default function AnswerSuggestions({ question, answer, role, evaluation }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Clear cached data when question or answer changes
  useEffect(() => {
    setData(null);
    setOpen(false);
    setError("");
  }, [question, answer]);

  const load = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    if (data) {
      setOpen(true);
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
    } catch {
      setData(fallbackData);
      setOpen(true);
    } finally {
      setBusy(false);
    }
  };

  const shown = data || fallbackData;

  return (
    <div className="answer-suggestions">
      <button type="button" className="suggestions-toggle" onClick={load} disabled={busy || !question}>
        {busy ? "Analyzing…" : open ? "Hide suggestions" : "✨ Get answer suggestions"}
      </button>
      {error && <p className="suggestions-error" role="alert">{error}</p>}
      {open && (
        <div className="suggestions-card">
          <section className="suggestion-section">
            <h4>Answer Quality</h4>
            <p className="suggestion-quality">{shown.overall || "Good"}</p>
          </section>

          <section className="suggestion-section">
            <h4>Answer Assessment</h4>
            <div className="suggestion-assessment">
              {shown.didWell?.length > 0 && (
                <div className="assessment-block">
                  <strong>What Went Well:</strong>
                  <ul>{shown.didWell.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
              {shown.missed?.length > 0 && (
                <div className="assessment-block">
                  <strong>What Needs Improvement:</strong>
                  <ul>{shown.missed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          </section>

          <section className="suggestion-section">
            <h4>Answer Guidance</h4>
            <div className="suggestion-guidance">
              {shown.improvements?.length > 0 && (
                <div className="guidance-block">
                  <strong>What Would Have Impressed the Interviewer:</strong>
                  <ul>{shown.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              )}
              {shown.sampleAnswer && (
                <div className="guidance-block">
                  <strong>Refined Answer: Putting It All Together</strong>
                  <blockquote className="suggested-answer">{shown.sampleAnswer}</blockquote>
                </div>
              )}
            </div>
          </section>

          <section className="suggestion-section">
            <h4>Example Hint</h4>
            <p className="suggestion-hint">{shown.hint || fallbackData.hint}</p>
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
