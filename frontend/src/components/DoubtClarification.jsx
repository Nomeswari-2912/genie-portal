import React, { useEffect, useRef, useState } from "react";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "hi", name: "हिन्दी", flag: "🇮🇳" },
  { code: "te", name: "తెలుగు", flag: "🇮🇳" },
];

const speechLanguages = {
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  de: "de-DE",
  ru: "ru-RU",
  zh: "zh-CN",
  hi: "hi-IN",
  te: "te-IN",
};

function getSpeechRecognition() {
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}

export default function DoubtClarification() {
  const [language, setLanguage] = useState("en");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const fileInput = useRef(null);
  const recognitionRef = useRef(null);
  const transcriptRef = useRef("");
  const discardTranscriptRef = useRef(false);
  const [listening, setListening] = useState(false);
  const [voiceDraft, setVoiceDraft] = useState("");
  const [voiceError, setVoiceError] = useState("");

  useEffect(() => {
    if (!image) {
      setImagePreview("");
      return undefined;
    }

    const preview = URL.createObjectURL(image);
    setImagePreview(preview);
    return () => URL.revokeObjectURL(preview);
  }, [image]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const toggleVoiceInput = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();
    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser. You can type your message instead.");
      return;
    }

    setVoiceError("");
    setVoiceDraft("");
    transcriptRef.current = "";
    discardTranscriptRef.current = false;
    const recognition = new SpeechRecognition();
    recognition.lang = speechLanguages[language] || "en-US";
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => setListening(true);
    recognition.onresult = (event) => {
      let interim = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const transcript = event.results[index][0]?.transcript?.trim();
        if (!transcript) continue;
        if (event.results[index].isFinal) {
          transcriptRef.current = `${transcriptRef.current} ${transcript}`.trim();
        } else {
          interim = `${interim} ${transcript}`.trim();
        }
      }
      setVoiceDraft([transcriptRef.current, interim].filter(Boolean).join(" "));
    };
    recognition.onerror = (event) => {
      const error = event.error === "not-allowed"
        ? "Microphone access was denied. Allow microphone access or type your message."
        : event.error === "no-speech"
          ? "No speech was detected. Try again or type your message."
          : `Voice input failed (${event.error}). You can type your message instead.`;
      setVoiceError(error);
      setListening(false);
    };
    recognition.onend = () => {
      const transcript = transcriptRef.current.trim();
      if (transcript && !discardTranscriptRef.current) {
        setMessage((current) => [current.trim(), transcript].filter(Boolean).join(" ").slice(0, 1000));
      }
      setVoiceDraft("");
      setListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (error) {
      console.error("Could not start Genie voice input.", error);
      recognitionRef.current = null;
      setListening(false);
      setVoiceError("Could not start voice input. Check microphone permission and try again.");
    }
  };

  const chooseImage = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setErrorMessage("");
    setActionMessage("");
    setAnswer("");
    setMessages([]);
    if (!selected.type.startsWith("image/")) {
      setImage(null);
      setStatus("error");
      setErrorMessage("Choose an image file to continue.");
      event.target.value = "";
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setImage(null);
      setStatus("error");
      setErrorMessage("Choose an image smaller than 10 MB.");
      event.target.value = "";
      return;
    }

    setImage(selected);
    setStatus("ready");
  };

  const getAnswer = async (event) => {
    event.preventDefault();
    const currentMessage = message.trim();
    if ((!image && !currentMessage) || status === "loading" || listening || (messages.length > 0 && !currentMessage)) return;

    setStatus("loading");
    setErrorMessage("");
    setActionMessage("");

    const formData = new FormData();
    if (image) formData.append("image", image);
    formData.append("language", language);
    formData.append("message", currentMessage);
    formData.append("history", JSON.stringify(messages.slice(-10).map((turn) => ({
      role: turn.role === "assistant" ? "model" : "user",
      text: turn.text,
    }))));

    try {
      const response = await fetch("/api/solve-image", {
        method: "POST",
        body: formData,
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `The image could not be answered (HTTP ${response.status}).`);
      }
      if (typeof result.answer !== "string" || !result.answer.trim()) {
        throw new Error("The AI service did not return an answer. Try another image.");
      }

      const answerText = result.answer.trim();
      setAnswer(answerText);
      setMessage("");
      setMessages((current) => [
        ...current,
        { role: "user", text: currentMessage || "Please explain this screenshot." },
        { role: "assistant", text: answerText },
      ]);
      setStatus("answered");
    } catch (error) {
      console.error("Could not get Genie's answer.", error);
      setErrorMessage(error instanceof Error ? error.message : "Genie could not answer. Please try again.");
      setStatus("error");
    }
  };

  const clearImage = () => {
    discardTranscriptRef.current = true;
    recognitionRef.current?.stop();
    setImage(null);
    setMessage("");
    setAnswer("");
    setMessages([]);
    setStatus("idle");
    setErrorMessage("");
    setActionMessage("");
    setVoiceError("");
    setVoiceDraft("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const copyAnswer = async () => {
    try {
      await navigator.clipboard.writeText(answer);
      setActionMessage("Answer copied.");
    } catch (error) {
      console.error("Could not copy the answer.", error);
      setActionMessage("Copy is unavailable in this browser.");
    }
  };

  const downloadAnswer = () => {
    const url = URL.createObjectURL(new Blob([answer], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "genie-answer.txt";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setActionMessage("Answer downloaded.");
  };

  return (
    <div className="tool-page genie-page">
      <div className="page-heading genie-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-dot" /> YOUR DOUBT-CLARIFICATION COMPANION</div>
          <h1>Every question deserves <span className="serif-accent">a clear answer.</span></h1>
          <p>Upload a screenshot or type a question, then continue with follow-ups.</p>
        </div>
        <label className="language-picker">
          <span>ANSWER LANGUAGE</span>
          <select aria-label="Answer language" value={language} onChange={(event) => setLanguage(event.target.value)}>
            {languages.map((item) => <option key={item.code} value={item.code}>{item.flag} {item.name}</option>)}
          </select>
        </label>
      </div>

      <div className="doubt-layout">
        <div className="doubt-main">
          <section className="doubt-question panel" aria-labelledby="question-title">
            <div className="doubt-section-heading">
              <div><span className="section-kicker">{image ? "YOUR SCREENSHOT" : "ASK GENIE"}</span><h2 id="question-title">{messages.length ? (image ? "Ask a follow-up about this screenshot." : "Ask Genie a follow-up.") : image ? "Screenshot ready. Ask Genie about it." : "Ask a question or upload a screenshot."}</h2></div>
              {image && <span className="image-ready-badge"><i /> Image ready</span>}
            </div>
            {image && imagePreview ? (
              <div className="uploaded-question">
                <img src={imagePreview} alt={`Screenshot preview: ${image.name}`} />
                <div><strong>{image.name}</strong><span>{(image.size / 1024).toFixed(0)} KB · Ready to solve</span></div>
                <button className="remove-image-button" type="button" onClick={clearImage} aria-label="Remove uploaded screenshot" disabled={status === "loading"}>×</button>
              </div>
            ) : (
              <button className="screenshot-dropzone" type="button" onClick={() => fileInput.current?.click()} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
                event.preventDefault();
                const file = event.dataTransfer.files?.[0];
                if (!file) return;
                const transfer = new DataTransfer();
                transfer.items.add(file);
                if (fileInput.current) {
                  fileInput.current.files = transfer.files;
                  fileInput.current.dispatchEvent(new Event("change", { bubbles: true }));
                }
              }}>
                <span className="dropzone-icon">↥</span>
                <strong>Choose a screenshot to upload</strong>
                <span>or drag and drop an image here</span>
                <small>PNG, JPG, WEBP · Up to 10 MB</small>
                <small>You can also ask Genie without a screenshot below.</small>
              </button>
            )}
          </section>

          <section className="doubt-answer panel" aria-labelledby="answer-title" aria-live="polite">
            <div className="doubt-section-heading answer-heading">
              <div><span className="section-kicker">GENIE’S EXPLANATION</span><h2 id="answer-title">{messages.length ? "Conversation with Genie" : "Answer"}</h2></div>
              {status === "answered" && <span className="answer-ready"><i /> Answer ready</span>}
            </div>

            {messages.length > 0 && (
              <div className="genie-chat-thread">
                {messages.map((turn, index) => (
                  <article className={`genie-chat-turn ${turn.role === "user" ? "from-user" : "from-genie"}`} key={`${index}-${turn.role}`}>
                    <strong>{turn.role === "user" ? "You" : "Genie"}</strong>
                    <p>{turn.text}</p>
                  </article>
                ))}
              </div>
            )}
            {status === "loading" && (
              <div className="answer-placeholder loading-answer" role="status">
                <span className="answer-spinner" />
                <p>{messages.length ? "Genie is thinking…" : image ? "Genie is analyzing your screenshot and preparing an explanation…" : "Genie is answering your question…"}</p>
              </div>
            )}
            {status === "error" && <div className="answer-notice" role="alert"><span>!</span><p>{errorMessage}</p></div>}
            {messages.length === 0 && status !== "loading" && status !== "error" && (
              <div className="answer-placeholder"><span>✦</span><p>Genie's answer will appear here after you ask a question or upload a screenshot.</p></div>
            )}

            {status === "answered" && (
              <div className="answer-actions">
                <button type="button" className="secondary-button" onClick={clearImage}>＋ Start a New Conversation</button>
                <div>
                  <button type="button" className="text-action" onClick={downloadAnswer}><span>↓</span> Download</button>
                  <button type="button" className="text-action" onClick={copyAnswer}><span>▢</span> Copy</button>
                </div>
              </div>
            )}
            {actionMessage && <span className="action-feedback" role="status">{actionMessage}</span>}
          </section>
        </div>

        <aside className="doubt-aside">
          <div className="doubt-tip"><span className="tip-sparkle">✧</span><span className="section-kicker">HOW GENIE HELPS</span><p>Ask a question directly or upload a screenshot from any subject.</p></div>
          <div className="doubt-tip"><span className="tip-sparkle">↺</span><span className="section-kicker">TAKE YOUR TIME</span><p>Genie answers typed questions and explains screenshots in your chosen language.</p></div>
        </aside>
      </div>

      <form className="doubt-compose panel upload-only-compose" onSubmit={getAnswer}>
        <div className="genie-message-entry">
          <div className="genie-message-heading">
            <label className="message-field-label" htmlFor="genie-message">MESSAGE TO GENIE <span>{image ? "OPTIONAL" : "REQUIRED"}</span></label>
            <button className={`voice-input-button${listening ? " is-listening" : ""}`} type="button" onClick={toggleVoiceInput} aria-pressed={listening} disabled={status === "loading"}>
              <span aria-hidden="true">{listening ? "■" : "🎙"}</span> {listening ? "Stop listening" : "Speak"}
            </button>
          </div>
          <textarea
            id="genie-message"
            className="genie-message-input"
            value={[message, voiceDraft].filter(Boolean).join(" ")}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder={messages.length ? (image ? "Ask a follow-up about the screenshot…" : "Ask Genie a follow-up…") : "Ask Genie a question or tell it what to focus on…"}
            maxLength={1000}
            rows={2}
            disabled={status === "loading" || listening}
          />
          {listening && <span className="voice-input-status" role="status">Listening… speak your question. Your words will appear here.</span>}
          <span className="voice-input-help">Speak to dictate, then review and press Get Answer. Enter sends; Shift+Enter adds a line.</span>
          {voiceError && <span className="voice-input-error" role="alert">{voiceError}</span>}
          <div className="upload-only-entry">
            <input ref={fileInput} className="file-input-hidden" type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={chooseImage} aria-label="Upload a screenshot" disabled={status === "loading"} />
            <button type="button" className="upload-button" onClick={() => fileInput.current?.click()} disabled={status === "loading"}><span>↥</span> {image ? "Change Screenshot" : "Upload Screenshot"}</button>
            <span className="upload-hint">PNG, JPG, WEBP · up to 10 MB</span>
          </div>
        </div>
        <div className="compose-actions">
          <button type="button" className="clear-button" onClick={clearImage} disabled={status === "loading" || (!image && !message.trim() && messages.length === 0 && status !== "error")}>Clear</button>
          <button type="submit" className="get-answer-button" disabled={(!image && !message.trim()) || status === "loading" || listening || (messages.length > 0 && !message.trim())}>{status === "loading" ? "Thinking…" : status === "error" ? "Try again" : messages.length ? "Send" : "Get Answer"} <span>{status === "loading" ? "…" : "→"}</span></button>
        </div>
      </form>
      <p className="genie-disclaimer">{image ? "Your screenshot stays attached while you ask follow-up questions. Check each answer for accuracy." : "You can ask typed questions or upload a screenshot. Check each answer for accuracy."}</p>
    </div>
  );
}
