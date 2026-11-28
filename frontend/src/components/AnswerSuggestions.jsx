import React, { useState } from "react";

export default function AnswerSuggestions() {
  const [open, setOpen] = useState(false);

  // Exact sample output matching the screenshot
  const data = {
    overall: "Good",
    didWell: ["You effectively highlighted a challenge you faced during college and the impact it had on your grades."],
    missed: ["You could have provided more specific details about the challenge and how you overcame it."],
    improvements: ["You could have mentioned any specific strategies or actions you took to improve your grades and manage your responsibilities effectively."],
    sampleAnswer: "During my final year of college, I faced the challenge of managing my coursework and commitments as a member of the college football team. Attending numerous practice sessions and tournaments affected my ability to balance both responsibilities, ultimately impacting my grades. However, I recognized the importance of my academic performance and made the decision to prioritize my studies over football. To overcome this challenge, I implemented specific strategies such as creating a detailed schedule, seeking guidance from professors, and utilizing effective time management techniques. By doing so, I was able to improve my grades and successfully manage my responsibilities.",
    hint: "useState manages state, while useEffect handles side effects.",
  };

  return (
    <div className="answer-suggestions">
      <button type="button" className="suggestions-toggle" onClick={() => setOpen((current) => !current)}>
        {open ? "Hide suggestions" : "✨ Get answer suggestions"}
      </button>
      {open && (
        <div className="suggestions-card">
          <section className="suggestion-section">
            <h4>Answer Quality</h4>
            <p className="suggestion-quality">{data.overall}</p>
          </section>

          <section className="suggestion-section">
            <h4>Answer Assessment</h4>
            <div className="suggestion-assessment">
              <div className="assessment-block">
                <strong>What Went Well:</strong>
                <ul>{data.didWell.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
              <div className="assessment-block">
                <strong>What Needs Improvement:</strong>
                <ul>{data.missed.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
            </div>
          </section>

          <section className="suggestion-section">
            <h4>Answer Guidance</h4>
            <div className="suggestion-guidance">
              <div className="guidance-block">
                <strong>What Would Have Impressed the Interviewer:</strong>
                <ul>{data.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul>
              </div>
              <div className="guidance-block">
                <strong>Refined Answer: Putting It All Together</strong>
                <blockquote className="suggested-answer">{data.sampleAnswer}</blockquote>
              </div>
            </div>
          </section>

          <section className="suggestion-section">
            <h4>Example Hint</h4>
            <p className="suggestion-hint">{data.hint}</p>
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
