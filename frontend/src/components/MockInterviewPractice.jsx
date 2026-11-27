import React, { useState } from "react";

const questionSets = {
  "Product Designer": [
    "Tell me about a product experience you improved. How did you know your changes made a difference?",
    "How do you balance user needs with business goals when they seem to conflict?",
    "Walk me through how you approach a new design problem when the brief is still unclear.",
  ],
  "Software Engineer": [
    "Tell me about a technical challenge you solved. What trade-offs did you consider?",
    "How do you make a codebase easier for the next person to work in?",
    "Describe a time you had to debug a problem you couldn't reproduce at first.",
  ],
  "Marketing Manager": [
    "Tell me about a campaign that didn't perform as expected. What did you learn?",
    "How do you decide which audience segment to prioritize?",
    "How do you measure the long-term impact of a marketing initiative?",
  ],
};

export default function MockInterviewPractice() {
  const [role, setRole] = useState("Product Designer");
  const [started, setStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [answers, setAnswers] = useState([]);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const questions = started ? sessionQuestions : questionSets[role];
  const finished = started && questionIndex >= questions.length;

  const start = () => {
    setAnswers([]);
    setAnswer("");
    setQuestionIndex(0);
    setSessionQuestions([...questionSets[role]].sort(() => Math.random() - 0.5));
    setStarted(true);
  };
  const nextQuestion = () => {
    if (!answer.trim()) return;
    setAnswers((current) => [...current, answer.trim()]);
    setAnswer("");
    setQuestionIndex((current) => current + 1);
  };
  const skipQuestion = () => {
    setAnswers((current) => [...current, "(skipped this question)"]);
    setAnswer("");
    setQuestionIndex((current) => current + 1);
  };

  return (
    <div className="tool-page">
      <div className="page-heading compact-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR PRACTICE SPACE</div>
          <h1>Show up ready to <span className="serif-accent">be yourself.</span></h1>
          <p>Get comfortable with the questions before the big day arrives.</p>
        </div>
        <div className="practice-badge"><span>✦</span> LOW PRESSURE. HIGH POTENTIAL.</div>
      </div>

      <div className="interview-layout">
        <section className="interview-main panel">
          {!started ? (
            <div className="interview-intro">
              <div className="interview-illustration"><div className="illustration-orbit orbit-one" /><div className="illustration-orbit orbit-two" /><div className="illustration-face">☺</div><span className="illustration-star star-one">✦</span><span className="illustration-star star-two">✧</span></div>
              <span className="section-kicker">A LITTLE PRACTICE, A LOT MORE CONFIDENCE</span>
              <h2>Make room to find<br />your <span className="serif-accent">best answers.</span></h2>
              <p>Choose the kind of role you’re preparing for. We’ll take it one thoughtful question at a time.</p>
              <label className="field-label role-select-label">I’m practicing for a
                <select value={role} onChange={(event) => setRole(event.target.value)}>
                  {Object.keys(questionSets).map((item) => <option key={item}>{item}</option>)}
                </select>
              </label>
              <button className="primary-button start-button" onClick={start}>Let’s begin <span>→</span></button>
              <div className="session-note"><span>◷</span> About 5 minutes <span className="note-separator">·</span> Just for you, no pressure</div>
            </div>
          ) : finished ? (
            <div className="interview-finished">
              <div className="finished-icon">✦</div>
              <span className="section-kicker">THAT’S A WRAP</span>
              <h2>You showed up.<br /><span className="serif-accent">That’s what counts.</span></h2>
              <p>You answered all {questions.length} questions for a {role} role. Take a moment to reflect on what felt strong and what you’d like to explore more.</p>
              <div className="answer-review">{answers.map((item, index) => <div key={index}><span>0{index + 1}</span><p>{item}</p></div>)}</div>
              <button className="primary-button start-button" onClick={start}>Practice again <span>↻</span></button>
            </div>
          ) : (
            <div className="active-interview">
              <div className="question-top"><span className="section-kicker">A QUESTION FOR YOU</span><span className="question-count">0{questionIndex + 1} <i>/</i> 0{questions.length}</span></div>
              <div className="progress-track"><span style={{ width: `${(questionIndex / questions.length) * 100}%` }} /></div>
              <div className="interviewer"><div className="interviewer-avatar">✦</div><span>Genie is listening</span><span className="listening-pulse" /></div>
              <h2>{questions[questionIndex]}</h2>
              <label className="field-label answer-label">Take your time. What would you say?<textarea rows="7" value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Start wherever feels right..." /></label>
              <div className="answer-actions"><span>Your answer stays right here with you.</span><div className="answer-action-buttons"><button className="skip-button" onClick={skipQuestion}>Skip question</button><button className="primary-button" disabled={!answer.trim()} onClick={nextQuestion}>{questionIndex === questions.length - 1 ? "Finish practice" : "Next question"} <span>→</span></button></div></div>
            </div>
          )}
        </section>
        <aside className="interview-aside">
          <div className="aside-note">
            <span className="note-sparkle">✧</span><span className="section-kicker">A GENTLE REMINDER</span>
            <h3>There’s no<br />perfect answer.</h3>
            <p>The best answers are honest, specific, and yours. Take a breath before you begin.</p>
            <div className="note-signoff">You’ve got this <span>♡</span></div>
          </div>
          <div className="session-details"><span className="section-kicker">YOUR SESSION</span><div><span>Role</span><strong>{role}</strong></div><div><span>Questions</span><strong>{questions.length} thoughtful prompts</strong></div><div><span>Format</span><strong>One at a time</strong></div></div>
        </aside>
      </div>
    </div>
  );
}
