import React, { useState } from "react";

const hintPool = [
  "useState manages state, while useEffect handles side effects.",
  "Think about edge cases: empty input, duplicates, and very large values.",
  "Structure your answer: situation → action → result.",
  "Mention a real project example to make your answer concrete.",
  "Keep your pace steady and pause briefly before answering.",
];

const criteria = [
  { name: "Relevance", check: "Does the answer match the question?" },
  { name: "Clarity", check: "Is the answer understandable?" },
  { name: "Confidence", check: "Does the answer sound assured?" },
  { name: "Examples", check: "Does it contain practical examples?" },
  { name: "Structure", check: "Is the answer organized properly?" },
  { name: "Completeness", check: "Does it address all important points?" },
];

export default function AnswerSuggestions({ defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const [hintIndex, setHintIndex] = useState(0);
  const [qualityScore, setQualityScore] = useState(82); // 0-100, green zone

  const qualityRating = qualityScore < 25 ? "Poor" : qualityScore < 50 ? "Needs improvement" : qualityScore < 75 ? "Average" : "Good";

  const handleMeterClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
    setQualityScore(Math.round(pct));
  };

  // Exact sample output matching the reference
  const data = {
    overall: qualityRating,
    didWell: ["You effectively highlighted a challenge you faced during college and the impact it had on your grades."],
    missed: ["You should explain the exact steps you followed to overcome the challenge. Include a specific example of your time-management strategy and describe the final result."],
    improvements: ["You could have mentioned any specific strategies or actions you took to improve your grades and manage your responsibilities effectively."],
    sampleAnswer: "During my final year of college, I faced the challenge of managing my coursework and commitments as a member of the college football team. Attending numerous practice sessions and tournaments affected my ability to balance both responsibilities, ultimately impacting my grades. However, I recognized the importance of my academic performance and made the decision to prioritize my studies over football. To overcome this challenge, I implemented specific strategies such as creating a detailed schedule, seeking guidance from professors, and utilizing effective time management techniques. By doing so, I was able to improve my grades and successfully manage my responsibilities.",
    hint: hintPool[0],
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
            <div className="quality-meter" role="img" aria-label={`Answer quality: ${qualityRating}`}>
              <div className="quality-meter-track" onClick={handleMeterClick} style={{ cursor: "pointer" }}>
                <span className="quality-seg seg-poor" />
                <span className="quality-seg seg-needs" />
                <span className="quality-seg seg-average" />
                <span className="quality-seg seg-good" />
                <span className="quality-indicator" style={{ left: `${qualityScore}%` }} />
              </div>
              <div className="quality-labels">
                <span>Poor</span>
                <span>Needs improvement</span>
                <span>Average</span>
                <span>Good</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={qualityScore}
                onChange={(event) => setQualityScore(Number(event.target.value))}
                className="quality-slider"
                aria-label="Adjust answer quality score"
              />
            </div>
            <p className="suggestion-quality">{qualityRating} <small className="quality-score">({qualityScore}/100)</small></p>
          </section>

          <div className="suggestions-columns">
            <div className="suggestions-col">
              <section className="suggestion-section">
                <h4>Answer Assessment</h4>
                <div className="assessment-block">
                  <strong>What Went Well</strong>
                  <ul>{data.didWell.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <div className="assessment-block">
                  <strong>What Needs Improvement</strong>
                  <ul>{data.missed.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
              </section>
            </div>

            <div className="suggestions-col">
              <section className="suggestion-section">
                <h4>Answer Guidance</h4>
                <div className="guidance-block">
                  <strong>What Would Have Impressed the Interviewer</strong>
                  <ul>{data.improvements.map((item, i) => <li key={i}>{item}</li>)}</ul>
                </div>
                <div className="guidance-block">
                  <strong>Refined Answer: Putting It All Together</strong>
                  <blockquote className="suggested-answer">{data.sampleAnswer}</blockquote>
                </div>
              </section>

              <section className="suggestion-section">
                <h4>Evaluation Criteria</h4>
                <table className="criteria-table">
                  <thead>
                    <tr><th>Criteria</th><th>What AI checks</th></tr>
                  </thead>
                  <tbody>
                    {criteria.map((row) => (
                      <tr key={row.name}><td>{row.name}</td><td>{row.check}</td></tr>
                    ))}
                  </tbody>
                </table>
              </section>
            </div>
          </div>

          <section className="suggestion-section">
            <h4>Example Hint</h4>
            <p className="suggestion-hint">{hintPool[hintIndex]}</p>
          </section>

          <section className="suggestion-section">
            <p className="suggestion-assistance">Genie AI assistance: <em>"Would you like another clue or would you like to try answering?"</em></p>
            <button
              type="button"
              className="primary-button suggestion-practice-btn"
              onClick={() => setHintIndex((index) => (index + 1) % hintPool.length)}
            >
              Get Another Hint
            </button>
          </section>
        </div>
      )}
    </div>
  );
}
