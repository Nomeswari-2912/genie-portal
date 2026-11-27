import React, { useEffect, useRef, useState } from "react";

const assessmentLabels = {
  correct: "Correct",
  partially_correct: "Partially correct",
  incorrect: "Incorrect",
  subjective: "Open-ended",
};
const spokenAssessments = {
  correct: "That answer is correct.",
  partially_correct: "That answer is partially correct.",
  incorrect: "That answer is incorrect.",
  subjective: "That was an open-ended answer with no single correct response.",
};

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

function formatListeningDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

export default function LiveInterview({ role, onSpeakingChange, onListeningChange, onCandidateAnswer, onCandidateEvaluation, onInterviewStart, onInterviewComplete, onViewTranscript, controlsRef }) {
  const [history, setHistory] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);
  const [listening, setListening] = useState(false);
  const [listeningDuration, setListeningDuration] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [error, setError] = useState("");
  const [resumeContext, setResumeContext] = useState("");
  const recognitionRef = useRef(null);
  const recognitionTranscriptRef = useRef("");
  const recognitionInterimRef = useRef("");
  const continueListeningRef = useRef(false);
  const recognitionRestartRef = useRef(null);
  const networkRetryCountRef = useRef(0);
  const listeningStartedAtRef = useRef(null);
  const startedRef = useRef(false);
  const endedRef = useRef(false);
  const reportSentRef = useRef(false);
  const candidateAnswerIndexRef = useRef(0);
  startedRef.current = started;
  endedRef.current = ended;
  const updateListening = (active) => {
    if (active && listeningStartedAtRef.current === null) {
      listeningStartedAtRef.current = Date.now();
      setListeningDuration(0);
    } else if (!active && listeningStartedAtRef.current !== null) {
      setListeningDuration(Math.floor((Date.now() - listeningStartedAtRef.current) / 1000));
      listeningStartedAtRef.current = null;
    }
    setListening(active);
    onListeningChange(active);
  };
  const getRecognitionTranscript = () => [
    recognitionTranscriptRef.current,
    recognitionInterimRef.current,
  ].filter(Boolean).join(" ").trim();

  useEffect(() => {
    if (!listening) return undefined;
    const timer = window.setInterval(() => {
      if (listeningStartedAtRef.current !== null) {
        setListeningDuration(Math.floor((Date.now() - listeningStartedAtRef.current) / 1000));
      }
    }, 250);
    return () => window.clearInterval(timer);
  }, [listening]);

  useEffect(() => () => {
    continueListeningRef.current = false;
    window.clearTimeout(recognitionRestartRef.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    onSpeakingChange(false);
    onListeningChange(false);
  }, [onListeningChange, onSpeakingChange]);

  const speak = (text, onComplete) => {
    if (!voiceEnabled || !window.speechSynthesis) {
      onSpeakingChange(false);
      onComplete?.();
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => onSpeakingChange(true);
    utterance.onend = () => {
      onSpeakingChange(false);
      onComplete?.();
    };
    utterance.onerror = () => {
      onSpeakingChange(false);
      onComplete?.();
    };
    window.speechSynthesis.speak(utterance);
  };

  const readResumeContext = () => {
    let resume = {};
    try {
      const savedResume = localStorage.getItem("genie-resume-details");
      if (savedResume) {
        const parsed = JSON.parse(savedResume);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          throw new Error("Saved resume details have an invalid format.");
        }
        resume = parsed;
      }
    } catch (readError) {
      console.error("Could not read saved resume details for the interview.", readError);
      throw new Error("Could not read your saved resume. Open Resume Builder, check your saved details, and try again.");
    }

    let savedSkills = "";
    try {
      savedSkills = localStorage.getItem("genie-resume-skills") || "";
    } catch (readError) {
      console.error("Could not read saved resume skills for the interview.", readError);
      throw new Error("Could not read your saved skills. Check browser storage and try again.");
    }
    return [
      ["Professional title", resume.role],
      ["Profile", resume.summary],
      ["Skills", [resume.skills, savedSkills].filter(Boolean).join(", ")],
      ["Experience", resume.experience],
      ["Internships", resume.internships],
      ["Education", resume.education],
      ["Certifications", resume.certifications],
    ].filter(([, value]) => typeof value === "string" && value.trim())
      .map(([label, value]) => `${label}: ${value.trim()}`)
      .join("\n")
      .slice(0, 6000);
  };

  const getInterviewerReply = async (turns, resumeDetails) => {
    let response;
    try {
      response = await fetch("/api/interview-turn", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, history: turns, resume: resumeDetails }),
      });
    } catch (requestError) {
      console.error("Could not reach the live interview endpoint.", requestError);
      throw new Error("Could not reach the live interviewer. Check that GenieBot is running and try again.");
    }

    let result;
    try {
      result = await response.json();
    } catch (parseError) {
      console.error("The live interview endpoint returned a non-JSON response.", parseError);
      if (response.status === 404) {
        throw new Error("The live interviewer endpoint is unavailable. Restart GenieBot from the project folder and reload this page.");
      }
      throw new Error("The live interviewer returned an empty or invalid response. Restart GenieBot and try again.");
    }

    if (!response.ok) throw new Error(result.error || "The AI interviewer could not respond. Please try again.");
    if (typeof result.reply !== "string" || !result.reply.trim()) {
      throw new Error("The AI interviewer returned an empty reply. Please try again.");
    }
    return result;
  };

  const startInterview = async () => {
    setBusy(true);
    setError("");
    setEnded(false);
    endedRef.current = false;
    startedRef.current = false;
    continueListeningRef.current = false;
    setHistory([]);
    setStarted(false);
    setDraft("");
    reportSentRef.current = false;
    candidateAnswerIndexRef.current = 0;
    onInterviewStart();
    try {
      const resumeDetails = readResumeContext();
      setResumeContext(resumeDetails);
      const result = await getInterviewerReply([], resumeDetails);
      setHistory([{ speaker: "interviewer", text: result.reply.trim() }]);
      setStarted(true);
      startedRef.current = true;
      speak(result.reply.trim(), () => toggleListening(true));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (answer) => {
    if (!answer || busy || ended || listening) return;
    setBusy(true);
    setError("");
    try {
      const candidateTurnIndex = candidateAnswerIndexRef.current;
      const candidateTurn = { speaker: "candidate", text: answer };
      const turns = [...history, candidateTurn];
      const result = await getInterviewerReply(turns, resumeContext);
      if (!result.evaluation?.scores ||
        typeof result.evaluation.feedback !== "string" ||
        !assessmentLabels[result.evaluation.assessment]) {
        throw new Error("Genie could not evaluate that answer. Please try again.");
      }
      candidateTurn.evaluation = result.evaluation;
      candidateAnswerIndexRef.current += 1;
      onCandidateAnswer(answer, candidateTurnIndex);
      onCandidateEvaluation(candidateTurnIndex, result.evaluation);
      const nextHistory = [...turns, { speaker: "interviewer", text: result.reply.trim() }];
      setHistory(nextHistory);
      setDraft("");
      speak(`${spokenAssessments[result.evaluation.assessment]} ${result.evaluation.feedback} ${result.reply.trim()}`, () => toggleListening(true));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy(false);
    }
  };

  const toggleListening = (forceStart = false) => {
    if (listening) {
      if (forceStart) return;
      continueListeningRef.current = false;
      const isWaitingToRestart = recognitionRestartRef.current !== null;
      window.clearTimeout(recognitionRestartRef.current);
      recognitionRestartRef.current = null;
      const transcript = getRecognitionTranscript();
      if (transcript) setDraft(transcript);
      if (isWaitingToRestart) {
        updateListening(false);
        recognitionRef.current = null;
      } else {
        recognitionRef.current?.stop();
      }
      return;
    }
    if (!startedRef.current && !forceStart) {
      setError("Start the live interview before speaking.");
      return;
    }
    if ((busy && !forceStart) || endedRef.current) return;
    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser. Type your answer and select Send answer.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = navigator.language || "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    continueListeningRef.current = true;
    recognitionTranscriptRef.current = "";
    recognitionInterimRef.current = "";
    networkRetryCountRef.current = 0;
    recognition.onresult = (event) => {
      let interimTranscript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript?.trim();
        if (!transcript) continue;
        if (event.results[index].isFinal) {
          recognitionTranscriptRef.current = `${recognitionTranscriptRef.current} ${transcript}`.trim();
        } else {
          interimTranscript = `${interimTranscript} ${transcript}`.trim();
        }
      }
      recognitionInterimRef.current = interimTranscript;
      if (interimTranscript || recognitionTranscriptRef.current) networkRetryCountRef.current = 0;
      setDraft(getRecognitionTranscript());
      setError("");
    };
    recognition.onerror = (event) => {
      if (event.error === "aborted" && !continueListeningRef.current) return;
      if (event.error === "no-speech" && continueListeningRef.current) return;

      if (event.error === "network" &&
        continueListeningRef.current &&
        networkRetryCountRef.current < 2) {
        networkRetryCountRef.current += 1;
        setError(`Voice connection interrupted. Reconnecting (${networkRetryCountRef.current}/2)…`);
        const transcript = getRecognitionTranscript();
        if (transcript) setDraft(transcript);
        return;
      }

      continueListeningRef.current = false;
      const transcript = getRecognitionTranscript();
      const message = event.error === "not-allowed"
        ? "Microphone access was denied. Allow it in your browser settings, or type your answer."
        : event.error === "network"
          ? transcript
            ? "Voice recognition could not reconnect. Your captured words are in the answer box; add anything missing or try again."
            : "Voice recognition could not connect before transcribing. Check your internet connection and microphone permission, then try again or type your answer."
          : event.error === "no-speech"
            ? "No speech was detected. Try again or type your answer."
            : transcript
              ? `Voice input failed (${event.error}). Your captured words are in the answer box; you can type the rest.`
              : `Voice input failed (${event.error}). Try again or type your answer.`;
      setError(message);
      updateListening(false);
      if (transcript) setDraft((current) => current.trim() || transcript);
    };
    recognition.onend = () => {
      const answer = getRecognitionTranscript();
      if (continueListeningRef.current && startedRef.current && !endedRef.current) {
        recognitionRestartRef.current = window.setTimeout(() => {
          recognitionRestartRef.current = null;
          if (!continueListeningRef.current || endedRef.current) return;
          try {
            recognition.start();
          } catch (recognitionError) {
            continueListeningRef.current = false;
            recognitionRef.current = null;
            setDraft(answer);
            setError("Voice input paused unexpectedly. Your recognized words are saved; review them or continue typing.");
            updateListening(false);
          }
        }, networkRetryCountRef.current ? 500 * networkRetryCountRef.current : 200);
        return;
      }
      updateListening(false);
      recognitionRef.current = null;
      if (answer) setDraft(answer);
    };

    try {
      recognitionRef.current = recognition;
      recognition.start();
      updateListening(true);
      setError("");
    } catch (recognitionError) {
      continueListeningRef.current = false;
      recognitionRef.current = null;
      setError(`Could not start voice input: ${recognitionError.message}`);
      updateListening(false);
    }
  };

  const sendTypedAnswer = (event) => {
    event.preventDefault();
    submitAnswer(draft.trim());
  };

  const endInterview = () => {
    if (endedRef.current) return true;
    if (busy) {
      setError("Wait for Genie to finish evaluating your answer before ending the interview.");
      return false;
    }
    endedRef.current = true;
    continueListeningRef.current = false;
    window.clearTimeout(recognitionRestartRef.current);
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    onSpeakingChange(false);
    updateListening(false);
    setEnded(true);
    if (!reportSentRef.current) {
      reportSentRef.current = true;
      onInterviewComplete(history);
    }
    return true;
  };

  if (controlsRef) {
    controlsRef.current = {
      toggleListening: () => toggleListening(),
      endInterview,
    };
  }

  return (
    <section className="live-interview-panel" aria-label="Live AI interview">
      <header className="live-interview-heading">
        <div>
          <span className="section-kicker">LIVE AI INTERVIEW</span>
          <h2>Practice with Genie</h2>
        </div>
        <button
          type="button"
          className={`voice-output-toggle ${voiceEnabled ? "enabled" : ""}`}
          onClick={() => setVoiceEnabled((enabled) => {
            if (enabled) {
              window.speechSynthesis?.cancel();
              onSpeakingChange(false);
            }
            return !enabled;
          })}
          aria-pressed={voiceEnabled}
        >
          {voiceEnabled ? "◖)) Voice on" : "Voice off"}
        </button>
      </header>

      {!started ? (
        <div className="live-interview-start">
          <p>Genie asks a question, then transcribes your spoken answer here. Stop listening to review it, then select Send answer for feedback.</p>
          <button type="button" className="primary-button" onClick={startInterview} disabled={busy}>
            {busy ? "Starting interview…" : "Start live interview"}
          </button>
        </div>
      ) : (
        <>
          <div className="live-interview-transcript" aria-live="polite">
            {history.map((turn, index) => (
              <article className={`live-interview-turn ${turn.speaker}`} key={`${index}-${turn.speaker}`}>
                <strong>{turn.speaker === "interviewer" ? "Genie AI" : "You"}</strong>
                <p>{turn.text}</p>
                {turn.speaker === "candidate" && turn.evaluation && (
                  <small className="live-interview-evaluation">
                    <strong>{assessmentLabels[turn.evaluation.assessment]}:</strong> {turn.evaluation.feedback}
                  </small>
                )}
              </article>
            ))}
            {busy && <p className="live-interview-thinking" role="status">Genie is thinking…</p>}
          </div>
          {!ended && (
            <form className="live-interview-compose" onSubmit={sendTypedAnswer}>
              <label className="sr-only" htmlFor="live-interview-answer">Your spoken or written answer</label>
              <textarea
                id="live-interview-answer"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Your spoken answer appears here, or type an answer…"
                rows="3"
                disabled={busy}
              />
              <div className="live-interview-actions">
                <div className="live-interview-recording-controls">
                  <button type="button" className={listening ? "listening" : ""} onClick={() => toggleListening()} disabled={busy}>
                    {listening ? "Stop listening" : "Start speaking"}
                  </button>
                  <span
                    className={`live-interview-timer${listening ? " is-active" : ""}`}
                    role="timer"
                    aria-label={`Listening time ${formatListeningDuration(listeningDuration)}`}
                  >
                    {listening && <span aria-hidden="true">● </span>}
                    {formatListeningDuration(listeningDuration)}
                  </span>
                </div>
                <button type="submit" className="primary-button" disabled={!draft.trim() || busy || listening}>
                  {busy ? "Sending…" : "Send answer"}
                </button>
              </div>
            </form>
          )}
          <div className="live-interview-footer">
            <span>{ended ? "Interview ended. See Chat for your report." : listening ? "Listening… your words appear in the answer box. Stop listening to review them." : listeningDuration ? `Listening stopped at ${formatListeningDuration(listeningDuration)}. Review your answer, then send it for feedback.` : "Use Start speaking to dictate an answer, or type it in the answer box."}</span>
            {started && <button type="button" onClick={() => onViewTranscript(history)}>View transcript</button>}
            {ended ? (
              <button type="button" onClick={startInterview} disabled={busy}>Start again</button>
            ) : (
              <button type="button" onClick={endInterview} disabled={busy}>End interview</button>
            )}
          </div>
        </>
      )}
      {error && <p className="live-interview-error" role="alert">{error}</p>}
    </section>
  );
}
