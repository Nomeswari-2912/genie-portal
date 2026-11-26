import React, { useCallback, useRef, useState } from "react";
import MockInterviewPractice from "./MockInterviewPractice.jsx";
import LiveInterview from "./LiveInterview.jsx";

const workmap = [
  { label: "Presentation", color: "violet" },
  { label: "Opportunistic", color: "orange" },
  { label: "Business Acumen", color: "violet" },
  { label: "Closing Technique", color: "red" },
];

const radarAxes = [
  { label: "Professionalism", vector: [0, -74] },
  { label: "Attitude", vector: [56, -51] },
  { label: "Creativity", vector: [69, -1] },
  { label: "Communication", vector: [41, 45] },
  { label: "Leadership", vector: [-41, 45] },
  { label: "Teamwork", vector: [-69, -1] },
  { label: "Sociability", vector: [-56, -51] },
];

const assessmentLabels = {
  correct: "Correct",
  partially_correct: "Partially correct",
  incorrect: "Incorrect",
  subjective: "Open-ended",
};

const evidenceTerms = {
  action: /\b(achieved|analyzed|built|created|designed|developed|identified|implemented|improved|increased|launched|led|measured|organized|reduced|researched|resolved|tested)\b/gi,
  structure: /\b(first|then|because|therefore|finally|as a result|for example)\b/gi,
  business: /\b(business|customer|conversion|cost|growth|impact|metric|revenue|stakeholder|user)\b/gi,
  result: /\b(result|outcome|improved|increased|reduced|achieved|launched|delivered|success)\b/gi,
  collaboration: /\b(collaborated|partnered|team|together|stakeholder|feedback)\b/gi,
  ownership: /\b(i led|i owned|my responsibility|i decided|i drove|i managed)\b/gi,
  reflection: /\b(learned|lesson|feedback|adapted|mistake|next time|growth)\b/gi,
  creative: /\b(designed|prototype|experiment|creative|alternative|solution|idea|innovative)\b/gi,
};

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function analyzeAnswers(answers, evaluations) {
  if (!answers.length) return null;

  const text = answers.join(" ").toLowerCase();
  const words = text.match(/\b[\p{L}\p{N}'’-]+\b/gu) ?? [];
  const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim()).length;
  const actions = countMatches(text, evidenceTerms.action);
  const structure = countMatches(text, evidenceTerms.structure);
  const businessEvidence = countMatches(text, evidenceTerms.business);
  const resultEvidence = countMatches(text, evidenceTerms.result);
  const collaboration = countMatches(text, evidenceTerms.collaboration);
  const ownership = countMatches(text, evidenceTerms.ownership);
  const reflection = countMatches(text, evidenceTerms.reflection);
  const creative = countMatches(text, evidenceTerms.creative);
  const hasMetric = /\b\d+(?:\.\d+)?%?\b/.test(text);

  const video = {
    Communication: clampScore(20 + Math.min(words.length, 70) * 0.55 + Math.min(sentences, 5) * 7 + structure * 2),
    Leadership: clampScore(24 + actions * 8 + ownership * 10 + Math.min(words.length, 45) * 0.2),
    Teamwork: clampScore(25 + collaboration * 12 + Math.min(answers.length, 4) * 5),
    Sociability: clampScore(28 + collaboration * 8 + Math.min(sentences, 5) * 6),
    Professionalism: clampScore(28 + Math.min(sentences, 5) * 7 + actions * 4 + structure * 4),
    Attitude: clampScore(30 + reflection * 14 + Math.min(answers.length, 4) * 5),
    Creativity: clampScore(24 + creative * 12 + actions * 4),
  };
  const workmapScores = {
    Presentation: video.Communication,
    Opportunistic: clampScore(22 + actions * 9 + creative * 7 + structure * 4),
    "Business Acumen": clampScore(20 + businessEvidence * 13 + (hasMetric ? 12 : 0) + resultEvidence * 5),
    "Closing Technique": clampScore(18 + resultEvidence * 10 + (hasMetric ? 25 : 0) + Math.min(answers.length, 4) * 5),
  };

  const combineScores = (group, fallbackScores) => {
    const categories = Object.keys(fallbackScores);
    return Object.fromEntries(categories.map((category) => {
      const scores = answers.map((_, index) =>
        evaluations[index]?.scores?.[group]?.[category] ?? fallbackScores[category]);
      return [category, clampScore(scores.reduce((sum, score) => sum + score, 0) / scores.length)];
    }));
  };
  const finalVideo = combineScores("video", video);
  const finalWorkmap = combineScores("workmap", workmapScores);

  return {
    video: finalVideo,
    workmap: finalWorkmap,
    videoAverage: clampScore(Object.values(finalVideo).reduce((sum, score) => sum + score, 0) / Object.keys(finalVideo).length),
    workmapAverage: clampScore(Object.values(finalWorkmap).reduce((sum, score) => sum + score, 0) / Object.keys(finalWorkmap).length),
  };
}

function radarPoints(scores) {
  return radarAxes.map(({ label, vector }) => {
    const score = scores?.[label] ?? 0;
    return `${110 + vector[0] * score / 100},${94 + vector[1] * score / 100}`;
  }).join(" ");
}

export default function MockInterview() {
  const [view, setView] = useState("session");
  const [selectedRole, setSelectedRole] = useState("UI/UX Designer");
  const [chatTab, setChatTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [chatError, setChatError] = useState("");
  const [draft, setDraft] = useState("");
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(false);
  const [callActive, setCallActive] = useState(true);
  const [recording, setRecording] = useState(true);
  const [people, setPeople] = useState(["Genie AI", "You"]);
  const [addPersonOpen, setAddPersonOpen] = useState(false);
  const [personDraft, setPersonDraft] = useState("");
  const [scoreInfo, setScoreInfo] = useState("");
  const [interviewerSpeaking, setInterviewerSpeaking] = useState(false);
  const liveInterviewControls = useRef(null);
  const [candidateAnswers, setCandidateAnswers] = useState([]);
  const [candidateEvaluations, setCandidateEvaluations] = useState([]);
  const interviewScores = analyzeAnswers(candidateAnswers, candidateEvaluations);
  const recordCandidateAnswer = useCallback((answer, index) => {
    setCandidateAnswers((current) => {
      const next = [...current];
      next[index] = answer;
      return next;
    });
  }, []);
  const recordCandidateEvaluation = useCallback((index, evaluation) => {
    setCandidateEvaluations((current) => {
      const next = [...current];
      next[index] = evaluation;
      return next;
    });
  }, []);
  const resetInterviewScores = useCallback(() => {
    setCandidateAnswers([]);
    setCandidateEvaluations([]);
  }, []);

  const completeInterview = (turns) => {
    const evaluations = turns
      .filter((turn) => turn.speaker === "candidate" && turn.evaluation)
      .map((turn) => turn.evaluation);
    if (!evaluations.length) {
      setMessages((current) => [...current, {
        author: "Genie AI Interview Report",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: "No completed answers were evaluated, so Genie could not prepare a score report. Complete at least one answer before ending the interview.",
        tone: "system",
      }]);
      setChatTab("chat");
      return;
    }

    const groupAverages = (group) => Object.keys(evaluations[0].scores[group]).map((category) => {
      const score = clampScore(evaluations.reduce((sum, evaluation) => sum + evaluation.scores[group][category], 0) / evaluations.length);
      return `${category}: ${score}%`;
    });
    const assessmentCounts = evaluations.reduce((counts, evaluation) => {
      counts[evaluation.assessment] += 1;
      return counts;
    }, { correct: 0, partially_correct: 0, incorrect: 0, subjective: 0 });
    const answerReviews = turns
      .filter((turn) => turn.speaker === "candidate" && turn.evaluation)
      .map((turn, index) => `Answer ${index + 1} — ${assessmentLabels[turn.evaluation.assessment]}: ${turn.evaluation.feedback}`)
      .join("\n");
    const strengths = [...new Set(evaluations.flatMap((evaluation) => evaluation.strengths))].slice(0, 4);
    const improvements = [...new Set(evaluations.flatMap((evaluation) => evaluation.improvements))].slice(0, 4);
    const overall = clampScore(evaluations.reduce((sum, evaluation) => {
      const scores = [...Object.values(evaluation.scores.video), ...Object.values(evaluation.scores.workmap)];
      return sum + scores.reduce((total, score) => total + score, 0) / scores.length;
    }, 0) / evaluations.length);
    const report = [
      "Interview performance report",
      `Overall performance: ${overall}/100`,
      `Answers reviewed: ${evaluations.length}`,
      `Answer assessment: ${assessmentCounts.correct} correct · ${assessmentCounts.partially_correct} partially correct · ${assessmentCounts.incorrect} incorrect · ${assessmentCounts.subjective} open-ended`,
      `Answer-by-answer feedback:\n${answerReviews}`,
      `Workmap: ${groupAverages("workmap").join(" · ")}`,
      `Communication indicators: ${groupAverages("video").join(" · ")}`,
      strengths.length ? `Strengths: ${strengths.join("; ")}` : "",
      improvements.length ? `Areas to improve: ${improvements.join("; ")}` : "",
      "Scores and feedback are based on transcript evidence only; camera behavior is not analyzed.",
    ].filter(Boolean).join("\n\n");
    setMessages((current) => [...current, {
      author: "Genie AI Interview Report",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: report,
      tone: "system",
    }]);
    setChatTab("chat");
  };

  const changeRole = (event) => {
    setSelectedRole(event.target.value);
    resetInterviewScores();
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text || chatBusy) return;
    const userMessage = {
      author: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text,
      tone: "you",
    };
    const chatHistory = [
      ...messages
        .filter((message) => message.tone === "you" || message.tone === "assistant")
        .map((message) => ({
          role: message.tone === "you" ? "user" : "assistant",
          text: message.text,
        })),
      { role: "user", text },
    ].slice(-16);
    setMessages((current) => [...current, userMessage]);
    setDraft("");
    setChatTab("chat");
    setChatBusy(true);
    setChatError("");
    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role: selectedRole, history: chatHistory }),
      });
      let result;
      try {
        result = await response.json();
      } catch (parseError) {
        console.error("The interview chat endpoint returned an invalid response.", parseError);
        throw new Error("Genie returned an invalid response. Restart the app and try again.");
      }
      if (!response.ok) throw new Error(result.error || "Genie could not respond. Please try again.");
      if (typeof result.reply !== "string" || !result.reply.trim()) {
        throw new Error("Genie returned an empty response. Please try again.");
      }
      setMessages((current) => [...current, {
        author: "Genie AI",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: result.reply.trim(),
        tone: "assistant",
      }]);
    } catch (requestError) {
      console.error("Could not get a reply in the interview chat.", requestError);
      setChatError(requestError.message || "Genie could not respond. Please try again.");
    } finally {
      setChatBusy(false);
    }
  };

  const addPerson = (event) => {
    event.preventDefault();
    const name = personDraft.trim();
    if (!name) return;
    if (people.some((person) => person.toLowerCase() === name.toLowerCase())) {
      setPersonDraft("");
      setAddPersonOpen(false);
      return;
    }
    setPeople((current) => [...current, name]);
    setPersonDraft("");
    setAddPersonOpen(false);
  };

  const viewTranscript = (turns) => {
    if (!turns.length) return;
    const transcript = turns
      .map((turn) => [
        `${turn.speaker === "interviewer" ? "Genie AI" : "You"}: ${turn.text}`,
        turn.evaluation?.assessment ? `Answer assessment: ${assessmentLabels[turn.evaluation.assessment]}` : "",
        turn.evaluation?.feedback ? `Genie feedback: ${turn.evaluation.feedback}` : "",
      ].filter(Boolean).join("\n"))
      .join("\n\n");
    setMessages((current) => [...current, {
      author: "Live interview transcript",
      time: "Now",
      text: transcript,
      tone: "system",
    }]);
    setChatTab("chat");
  };

  const endCall = () => {
    if (liveInterviewControls.current?.endInterview?.() === false) return;
    setCallActive(false);
    setRecording(false);
    setCameraOn(false);
    setMicOn(false);
  };

  if (view === "practice") {
    return (
      <div className="interview-workspace">
        <nav className="interview-view-switch" aria-label="Interview views">
          <button onClick={() => setView("session")}>Interview Session</button>
          <button className="active" aria-current="page" onClick={() => setView("practice")}>Practice Questions</button>
        </nav>
        <MockInterviewPractice />
      </div>
    );
  }

  return (
    <div className="interview-workspace">
      <nav className="interview-view-switch" aria-label="Interview views">
        <button className="active" aria-current="page" onClick={() => setView("session")}>Interview Session</button>
        <button onClick={() => setView("practice")}>Practice Questions</button>
      </nav>

      <div className="session-page">
        <header className="session-toolbar">
          <div className="session-title-group">
            <span className="session-brand-mark">H</span>
            <div className="session-heading-copy">
              <span className="section-kicker">AI MOCK INTERVIEW</span>
              <label className="session-role-label">
                <span className="sr-only">Interview role</span>
                <select value={selectedRole} onChange={changeRole} aria-label="Interview role">
                  <option>UI/UX Designer</option>
                  <option>Product Designer</option>
                  <option>Software Engineer</option>
                  <option>Data Analyst</option>
                  <option>Marketing Manager</option>
                </select>
              </label>
            </div>
            <span className="session-host">with Genie AI</span>
          </div>
          <div className="session-toolbar-actions">
            <span className="session-live-badge"><i /> {callActive ? "Live session" : "Session ended"}</span>
            <span className="session-profile"><span className="session-profile-avatar">V</span> Vaka Nomeswari <span>⌄</span></span>
          </div>
        </header>

        <div className="session-grid">
          <main className="session-center">
            <div className="attending-row">
              <div><span className="attending-icon">♧</span><strong>People attending the call</strong><span className="attendee-total">{people.length}</span></div>
              <button onClick={() => setAddPersonOpen((current) => !current)}><span>＋</span> Add person to the call</button>
            </div>
            {addPersonOpen && (
              <form className="add-person-form" onSubmit={addPerson}>
                <label htmlFor="person-name">Invite a participant</label>
                <input id="person-name" value={personDraft} onChange={(event) => setPersonDraft(event.target.value)} placeholder="Enter their name" autoFocus />
                <button type="submit">Add</button>
                <button type="button" className="cancel-invite" onClick={() => { setAddPersonOpen(false); setPersonDraft(""); }}>Cancel</button>
              </form>
            )}

            <section className={`call-stage ${!callActive ? "call-ended" : ""}`} aria-label="Interview call">
              {callActive ? (
                <>
                  <div className="call-stage-background" />
                  <div className="call-watermark">G</div>
                  <div className="candidate-heading">
                    <span className="candidate-avatar">G</span>
                    <span><strong>Genie AI</strong><small>AI interviewer · {selectedRole}</small></span>
                    {recording && <span className="recording-badge"><i /> Recording</span>}
                  </div>
                  <div className={`candidate-scene ${interviewerSpeaking ? "is-speaking" : ""}`} aria-label="AI interviewer avatar">
                    <div className="scene-window window-left" />
                    <div className="scene-window window-right" />
                    <div className="scene-plant"><i /><i /><i /><b /></div>
                    <div className="scene-table" />
                    <div className="candidate-body"><div className="candidate-neck" /><div className="candidate-shirt" /><div className="candidate-head"><div className="candidate-hair" /><i className="candidate-eye eye-left" /><i className="candidate-eye eye-right" /><span className="candidate-smile" /><i className="candidate-glasses glasses-left" /><i className="candidate-glasses glasses-right" /><span className="glasses-bridge" /></div></div>
                    <div className="candidate-hand hand-left"><i /><i /><i /><i /></div>
                    <div className="candidate-hand hand-right"><i /><i /><i /></div>
                    <span className="scene-caption">Genie AI <i>·</i> Interviewer</span>
                  </div>

                  <div className="participant-thumbnails">
                    <button className="participant-tile participant-tile-one" onClick={() => setCameraOn((current) => !current)} aria-label="Toggle your camera preview"><span className="tile-avatar">V</span><small>You <i>{cameraOn ? "●" : "○"}</i></small></button>
                    <button className="participant-tile participant-tile-two" onClick={() => setChatTab("participants")} aria-label="View Genie AI interviewer"><span className="tile-avatar selena-avatar">G</span><small>Genie AI <i>●</i></small></button>
                  </div>

                  <div className="call-controls" aria-label="Call controls">
                    <button className={micOn ? "" : "control-muted"} aria-label={micOn ? "Stop listening" : "Start speaking"} onClick={() => liveInterviewControls.current?.toggleListening()}><span>{micOn ? "♩" : "♩̸"}</span></button>
                    <button className="control-end-call" aria-label="End call" onClick={endCall}><span>☎</span></button>
                    <button className={cameraOn ? "" : "control-muted"} aria-label={cameraOn ? "Turn camera off" : "Turn camera on"} onClick={() => setCameraOn((current) => !current)}><span>▣</span></button>
                    <button className={recording ? "control-recording" : ""} aria-label={recording ? "Stop recording" : "Start recording"} onClick={() => setRecording((current) => !current)}><span>◉</span></button>
                  </div>
                </>
              ) : (
                <div className="call-ended-message"><span>☎</span><h2>The interview session has ended.</h2><p>Your feedback and scorecard are ready to review.</p><button onClick={() => { setCallActive(true); setMicOn(false); setCameraOn(true); }}>Rejoin session</button></div>
              )}
            </section>

            <LiveInterview
              key={selectedRole}
              role={selectedRole}
              onSpeakingChange={setInterviewerSpeaking}
              onListeningChange={setMicOn}
              onCandidateAnswer={recordCandidateAnswer}
              onCandidateEvaluation={recordCandidateEvaluation}
              onInterviewStart={resetInterviewScores}
              onInterviewComplete={completeInterview}
              onViewTranscript={viewTranscript}
              controlsRef={liveInterviewControls}
            />

            <div className="feedback-grid">
              <section className="feedback-card">
                <div className="feedback-card-heading"><div><h2>AI Video Score</h2><p>{interviewScores ? "Live estimate · updates after each answer" : "Scores update as you answer"}</p></div><button aria-label="About AI video score" aria-expanded={scoreInfo === "video"} aria-controls="video-score-info" onClick={() => setScoreInfo((current) => current === "video" ? "" : "video")}>i</button></div>
                {scoreInfo === "video" && <p className="score-info-message" id="video-score-info">Live communication estimate based on your transcribed answers. Camera, facial expression, and body language are not analyzed.</p>}
                <div className="radar-plot">
                  <svg viewBox="0 0 220 174" role="img" aria-label={interviewScores ? `Live communication scores: ${radarAxes.map(({ label }) => `${label} ${interviewScores.video[label]}%`).join(", ")}` : "Video feedback scores will appear after your first interview answer"}>
                    <polygon className="radar-grid" points="110,20 166,43 179,93 151,139 69,139 41,93 54,43" />
                    <polygon className="radar-grid" points="110,39 153,56 163,94 141,128 79,128 57,94 67,56" />
                    <polygon className="radar-grid" points="110,57 139,69 147,94 130,116 90,116 73,94 81,69" />
                    <polygon className="radar-data" points={radarPoints(interviewScores?.video)} />
                    <g className="radar-axes"><line x1="110" y1="94" x2="110" y2="20" /><line x1="110" y1="94" x2="166" y2="43" /><line x1="110" y1="94" x2="179" y2="93" /><line x1="110" y1="94" x2="151" y2="139" /><line x1="110" y1="94" x2="69" y2="139" /><line x1="110" y1="94" x2="41" y2="93" /><line x1="110" y1="94" x2="54" y2="43" /></g>
                    <g className="radar-labels"><text x="110" y="12" textAnchor="middle">Professionalism</text><text x="174" y="39">Attitude</text><text x="183" y="96">Creativity</text><text x="154" y="154">Communication</text><text x="65" y="154" textAnchor="end">Leadership</text><text x="34" y="96" textAnchor="end">Teamwork</text><text x="47" y="39" textAnchor="end">Sociability</text></g>
                    <g className="radar-dots">{radarPoints(interviewScores?.video).split(" ").map((point, index) => {
                      const [cx, cy] = point.split(",");
                      return <circle key={radarAxes[index].label} cx={cx} cy={cy} r="2" />;
                    })}</g>
                  </svg>
                </div>
              </section>
              <section className="feedback-card workmap-card">
                <div className="feedback-card-heading"><div><h2>Workmap Score</h2><p>{interviewScores ? "Live estimate · updates after each answer" : "Scores update as you answer"}</p></div><button aria-label="About workmap score" aria-expanded={scoreInfo === "workmap"} aria-controls="workmap-score-info" onClick={() => setScoreInfo((current) => current === "workmap" ? "" : "workmap")}>i</button></div>
                {scoreInfo === "workmap" && <p className="score-info-message" id="workmap-score-info">Scores update from evidence in your transcribed answers, such as examples, structure, outcomes, and metrics.</p>}
                <div className="workmap-score-list">
                  {workmap.map((item) => {
                    const score = interviewScores?.workmap[item.label] ?? 0;
                    return <div className="workmap-row" key={item.label}><div><span>{item.label}</span><strong>{interviewScores ? `${score}%` : "—"}</strong></div><div className="workmap-track"><i className={item.color} style={{ width: `${score}%` }} /></div></div>;
                  })}
                </div>
              </section>
            </div>
          </main>

          <aside className="session-right">
            <section className="score-summary">
              <div className="score-ring score-ring-video" style={{ "--score": `${interviewScores?.videoAverage ?? 0}%` }}><div><strong>{interviewScores ? interviewScores.videoAverage : "—"}</strong>{interviewScores && <span>%</span>}</div></div>
              <div className="score-ring score-ring-workmap" style={{ "--score": `${interviewScores?.workmapAverage ?? 0}%` }}><div><strong>{interviewScores ? interviewScores.workmapAverage : "—"}</strong>{interviewScores && <span>%</span>}</div></div>
              <div className="score-summary-labels"><strong>AI Video Score</strong><strong>Workmap Score</strong></div>
              <p className="score-summary-note">AI scores use answer transcripts; camera behavior is not analyzed.</p>
            </section>

            <section className="session-chat-card">
              <div className="chat-tabs" role="tablist" aria-label="Interview side panel">
                <button role="tab" aria-selected={chatTab === "chat"} className={chatTab === "chat" ? "selected" : ""} onClick={() => setChatTab("chat")}>Chat <span>{messages.length}</span></button>
                <button role="tab" aria-selected={chatTab === "participants"} className={chatTab === "participants" ? "selected" : ""} onClick={() => setChatTab("participants")}>Participants</button>
              </div>
              {chatTab === "chat" ? (
                <>
                  <div className="chat-message-list" aria-live="polite">
                    {!messages.length && <p className="session-chat-empty">Chat with Genie or view your live interview transcript here.</p>}
                    {messages.map((message, index) => (
                      <article className={`session-message ${message.tone}`} key={`${index}-${message.author}`}>
                        <div className={`chat-person-avatar ${message.tone === "you" ? "you-avatar" : ""}`}>{message.author.split(" ").map((part) => part[0]).join("").slice(0, 2)}</div>
                        <div className="session-message-body">
                          <div className="session-message-meta"><strong>{message.author}</strong><time>{message.time}</time></div>
                          <p>{message.text}</p>
                        </div>
                      </article>
                    ))}
                    {chatBusy && <p className="chat-assistant-status" role="status">Genie is thinking…</p>}
                    {chatError && <p className="chat-assistant-error" role="alert">{chatError}</p>}
                  </div>
                  <form className="session-chat-compose" onSubmit={sendMessage}>
                    <input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Send your message..." aria-label="Send a chat message" />
                    <button type="submit" aria-label="Send message" disabled={!draft.trim() || chatBusy}>↑</button>
                  </form>
                </>
              ) : (
                <div className="participant-list" role="tabpanel">
                  {people.map((person, index) => <div className="participant-list-item" key={`${person}-${index}`}><span className={`participant-list-avatar avatar-color-${index % 4}`}>{person.split(" ").map((part) => part[0]).join("").slice(0, 2)}</span><div><strong>{person}</strong><small>{person === "You" ? "You · Candidate" : person === "Genie AI" ? "AI interviewer" : "Participant"}</small></div><i /></div>)}
                  <button className="invite-participant-button" onClick={() => setAddPersonOpen(true)}>＋ Add a participant</button>
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
