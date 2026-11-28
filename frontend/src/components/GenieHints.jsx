import React, { useEffect, useMemo, useRef, useState } from "react";
import { interviewRoleOptions } from "./LiveInterview.jsx";

const LANGUAGES = [
  { id: "python", label: "Python", available: true },
  { id: "java", label: "Java", available: true },
  { id: "c", label: "C", available: false },
  { id: "cpp", label: "C++", available: false },
];

const STARTERS = {
  python: `# AI evaluates: "Your approach is correct. Consider handling duplicate values and empty arrays."
import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    numbers = list(map(int, data[1:1 + n]))
    # TODO: print the largest number
    print(max(numbers))

main()
`,
  java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        int n = scanner.nextInt();
        int largest = Integer.MIN_VALUE;
        for (int i = 0; i < n; i++) {
            int value = scanner.nextInt();
            // TODO: track the largest value
            if (value > largest) largest = value;
        }
        System.out.println(largest);
    }
}
`,
  c: `#include <stdio.h>

int main(void) {
    int n, largest;
    scanf("%d", &n);
    scanf("%d", &largest);
    for (int i = 1; i < n; i++) {
        int value;
        scanf("%d", &value);
        /* TODO: track the largest value */
        if (value > largest) largest = value;
    }
    printf("%d\\n", largest);
    return 0;
}
`,
  cpp: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    int n;
    cin >> n;
    vector<int> numbers(n);
    for (int i = 0; i < n; i++) cin >> numbers[i];
    // TODO: print the largest number
    cout << *max_element(numbers.begin(), numbers.end()) << endl;
    return 0;
}
`,
};

const PROBLEM = {
  title: "Largest Number in an Array",
  description: "Write a program that reads an array of integers and prints the largest number.\n\nExample: input `5` then `1 2 3 4 5` → output `5`.",
  inputFormat: "First line: integer n. Second line: n space-separated integers.",
  outputFormat: "A single integer — the largest number in the array.",
  testCases: [
    { input: "5\n1 2 3 4 5", expectedOutput: "5" },
    { input: "3\n-1 -5 -2", expectedOutput: "-1" },
    { input: "1\n42", expectedOutput: "42" },
    { input: "4\n7 7 7 7", expectedOutput: "7" },
  ],
};

const normalizeOutput = (value) => String(value ?? "").replace(/\r\n/g, "\n").trim().replace(/[ \t]+$/gm, "").trim();
const fmtClock = (totalSeconds) => `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;

const escapeHtml = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const TOKEN_REGEX = /(#[^\n]*|\/\/[^\n]*|\/\*[\s\S]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|\b\d+(?:\.\d+)?\b|\b(?:import|from|def|class|return|if|else|elif|for|while|try|except|finally|with|as|in|not|and|or|is|lambda|pass|break|continue|raise|yield|global|None|True|False|print|input|len|range|int|str|list|dict|set|self|public|private|protected|static|final|void|int|long|float|double|char|bool|new|delete|this|struct|class|extends|implements|throws|throws|package|null|true|false|const|let|var|function|typeof|instanceof)\b)/g;

const highlightLine = (line) => {
  let result = "";
  let lastIndex = 0;
  TOKEN_REGEX.lastIndex = 0;
  let match;
  while ((match = TOKEN_REGEX.exec(line)) !== null) {
    result += escapeHtml(line.slice(lastIndex, match.index));
    const token = match[0];
    let cls = "tok-plain";
    if (token.startsWith("#") || token.startsWith("//") || token.startsWith("/*")) cls = "tok-comment";
    else if (token.startsWith('"') || token.startsWith("'")) cls = "tok-string";
    else if (/^\d/.test(token)) cls = "tok-number";
    else cls = "tok-keyword";
    result += `<span class="${cls}">${escapeHtml(token)}</span>`;
    lastIndex = match.index + token.length;
  }
  result += escapeHtml(line.slice(lastIndex));
  return result || " ";
};

export default function GenieHints({ onNavigate }) {
  const [role, setRole] = useState(interviewRoleOptions[0]);
  const [seconds, setSeconds] = useState(0);
  const [messages, setMessages] = useState([
    { role: "genie", text: "Hi! I'm Genie. Ask me anything about your interview, or get a hint on the coding problem →" },
  ]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const [language, setLanguage] = useState("python");
  const [code, setCode] = useState(STARTERS.python);
  const [results, setResults] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [codeBusy, setCodeBusy] = useState("");
  const [codeError, setCodeError] = useState("");

  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);
  const editorRef = useRef(null);
  const highlightRef = useRef(null);

  useEffect(() => {
    const timer = window.setInterval(() => setSeconds((value) => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy]);

  const lang = LANGUAGES.find((item) => item.id === language) || LANGUAGES[0];

  const sendMessage = async (text) => {
    const message = (text ?? draft).trim();
    if (!message || busy) return;
    const nextMessages = [...messages, { role: "user", text: message }];
    setMessages(nextMessages);
    setDraft("");
    setBusy(true);
    try {
      const response = await fetch("/api/interview-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          history: nextMessages.slice(-14).map((item) => ({ role: item.role === "user" ? "user" : "assistant", text: item.text })),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Genie could not respond.");
      const reply = (result.reply || "").trim();
      setMessages((current) => [...current, { role: "genie", text: reply }]);
      if (voiceOn && reply && window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(reply.slice(0, 600));
        utterance.rate = 1;
        window.speechSynthesis.speak(utterance);
      }
    } catch (requestError) {
      setMessages((current) => [...current, { role: "genie", text: `Sorry — ${requestError.message}` }]);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMessages((current) => [...current, { role: "genie", text: "Voice input isn't supported in this browser — type your message instead." }]);
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript?.trim();
      setListening(false);
      if (transcript) sendMessage(transcript);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  };

  const switchLanguage = (id) => {
    setLanguage(id);
    setCode(STARTERS[id] || STARTERS.python);
    setResults(null);
    setEvaluation(null);
    setCodeError("");
  };

  const syncScroll = () => {
    if (editorRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = editorRef.current.scrollTop;
      highlightRef.current.scrollLeft = editorRef.current.scrollLeft;
    }
  };

  const runCode = async () => {
    if (!lang.available) {
      setCodeError(`${lang.label} execution needs a compiler that isn't installed on this machine. Try Python or Java.`);
      return;
    }
    setCodeBusy("run");
    setCodeError("");
    setEvaluation(null);
    try {
      const settled = await Promise.all(PROBLEM.testCases.map(async (testCase, index) => {
        const response = await fetch("/api/execute-code", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ language, code, stdin: testCase.input }),
        });
        const result = await response.json().catch(() => null);
        if (!response.ok) throw new Error(result?.error || "Code execution failed.");
        const stdout = result.stdout || "";
        const passed = result.exitCode === 0 && !result.timedOut && normalizeOutput(stdout) === normalizeOutput(testCase.expectedOutput);
        return {
          index,
          input: testCase.input,
          expected: testCase.expectedOutput,
          actual: result.timedOut ? "(timed out after 8s)" : stdout.trim() || (result.stderr || "").trim().split("\n").slice(0, 3).join("\n"),
          passed,
          stage: result.stage,
        };
      }));
      setResults(settled);
    } catch (requestError) {
      setCodeError(requestError.message);
      setResults(null);
    } finally {
      setCodeBusy("");
    }
  };

  const submitCode = async () => {
    if (!lang.available) {
      setCodeError(`${lang.label} execution needs a compiler that isn't installed on this machine. Try Python or Java.`);
      return;
    }
    setCodeBusy("submit");
    setCodeError("");
    try {
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          problem: { title: PROBLEM.title, description: PROBLEM.description },
          language,
          code,
          results: (results || []).map((item) => ({
            input: item.input, expected: item.expected, actual: item.actual, passed: item.passed, stage: item.stage,
          })),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Evaluation failed.");
      setEvaluation(result);
    } catch (requestError) {
      setCodeError(requestError.message);
    } finally {
      setCodeBusy("");
    }
  };

  const lineCount = code.split("\n").length;
  const highlighted = useMemo(() => code.split("\n").map(highlightLine).join("\n"), [code]);
  const passedCount = results ? results.filter((item) => item.passed).length : 0;

  return (
    <div className="genie-hints-page">
      <header className="gh-header">
        <div className="gh-brand">
          <span className="gh-logo"><img src="/genie-mascot.png" alt="Genie" /></span>
          <strong>GENIE AI</strong>
        </div>
        <div className="gh-status">
          <span className="gh-live-dot" />
          <span>LIVE</span>
        </div>
        <div className="gh-timer" title="Interview timer">{fmtClock(seconds)}</div>
        <div className="gh-spacer" />
        <label className="gh-role">
          <span>Job role</span>
          <select value={role} onChange={(event) => setRole(event.target.value)}>
            {interviewRoleOptions.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        <div className="gh-profile-wrap">
          <button type="button" className="gh-profile" onClick={() => setProfileOpen((open) => !open)}>
            <span className="gh-avatar">C</span>
            Candidate
            <span className="gh-caret">▾</span>
          </button>
          {profileOpen && (
            <div className="gh-profile-menu">
              <button type="button" onClick={() => { setProfileOpen(false); onNavigate?.("workspace"); }}>Candidate profile</button>
              <button type="button" onClick={() => { setProfileOpen(false); onNavigate?.("session"); }}>Interview settings</button>
            </div>
          )}
        </div>
      </header>

      <div className="gh-body">
        <section className="gh-chat panel">
          <div className="gh-chat-head">
            <h3>Interview Assistant</h3>
            <span className="gh-chat-sub">Hints · explanations · coding help</span>
          </div>
          <div className="gh-messages">
            {messages.map((message, index) => (
              <div key={index} className={`gh-msg ${message.role}`}>
                <span className="gh-msg-sender">{message.role === "user" ? "You" : "Genie AI"}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {busy && <div className="gh-msg genie"><span className="gh-msg-sender">Genie AI</span><p className="gh-thinking">Genie is thinking…</p></div>}
            <div ref={chatEndRef} />
          </div>
          <form
            className="gh-compose"
            onSubmit={(event) => { event.preventDefault(); sendMessage(); }}
          >
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Type a message or tap the mic to speak…"
              rows="2"
              disabled={busy}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />
            <div className="gh-compose-actions">
              <button
                type="button"
                className={`gh-mic${listening ? " listening" : ""}`}
                onClick={toggleMic}
                title={listening ? "Stop voice input" : "Speak your answer"}
                aria-label={listening ? "Stop voice input" : "Start voice input"}
              >
                {listening ? "⏹" : "🎙"}
              </button>
              <button type="submit" className="primary-button" disabled={busy || !draft.trim()}>
                {busy ? "Sending…" : "Send ➤"}
              </button>
            </div>
          </form>
        </section>

        <section className="gh-code panel">
          <div className="gh-code-head">
            <div>
              <h3>Coding Workspace</h3>
              <p className="gh-problem-title">{PROBLEM.title}</p>
            </div>
            <div className="gh-lang-tabs">
              {LANGUAGES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`gh-lang-tab${language === item.id ? " active" : ""}`}
                  onClick={() => switchLanguage(item.id)}
                >
                  {item.label}{!item.available && <small>no compiler</small>}
                </button>
              ))}
            </div>
          </div>
          <p className="gh-problem-desc">{PROBLEM.description} <span className="gh-io">In: {PROBLEM.inputFormat} · Out: {PROBLEM.outputFormat}</span></p>

          <div className="gh-editor-wrap">
            <div className="gh-gutter" aria-hidden="true">
              {Array.from({ length: lineCount }, (_, index) => <span key={index}>{index + 1}</span>)}
            </div>
            <div className="gh-editor">
              <pre ref={highlightRef} className="gh-highlight" aria-hidden="true"><code dangerouslySetInnerHTML={{ __html: highlighted + "\n" }} /></pre>
              <textarea
                ref={editorRef}
                className="gh-textarea"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onScroll={syncScroll}
                spellCheck={false}
                wrap="off"
                aria-label="Code editor"
              />
            </div>
          </div>

          <div className="gh-code-actions">
            <button type="button" className="gh-run" onClick={runCode} disabled={codeBusy === "run" || !lang.available}>
              {codeBusy === "run" ? "Running…" : "▶ Run code"}
            </button>
            <button type="button" className="primary-button" onClick={submitCode} disabled={codeBusy === "submit" || !lang.available}>
              {codeBusy === "submit" ? "Evaluating…" : "Submit code"}
            </button>
          </div>
          {!lang.available && <p className="gh-code-note">{lang.label} needs a compiler that isn't installed on this machine — Python and Java run live.</p>}
          {codeError && <p className="gh-code-error">{codeError}</p>}

          {results && (
            <div className="gh-results">
              <div className="gh-results-head">
                <strong>Test case results</strong>
                <span>{passedCount}/{results.length} passed</span>
              </div>
              {results.map((item) => (
                <div key={item.index} className={`gh-test ${item.passed ? "passed" : "failed"}`}>
                  <span className="gh-test-badge">{item.passed ? "✓" : "✗"}</span>
                  <div>
                    <strong>Case {item.index + 1}</strong>
                    <small>input: {item.input.replace(/\n/g, " · ")} → expected {item.expected}, got {item.actual || "(no output)"}</small>
                  </div>
                </div>
              ))}
            </div>
          )}

          {evaluation && (
            <div className="gh-eval">
              <div className="gh-eval-head">
                <strong>AI evaluates</strong>
                <span className={`gh-verdict ${evaluation.verdict}`}>{evaluation.verdict === "correct" ? "Correct" : evaluation.verdict === "partially_correct" ? "Partially correct" : "Needs work"}{evaluation.score !== undefined ? ` · ${evaluation.score}/100` : ""}</span>
              </div>
              <p>{evaluation.feedback}</p>
              {Array.isArray(evaluation.improvements) && evaluation.improvements.length > 0 && (
                <div className="gh-improvements">
                  <strong>Debugging suggestions</strong>
                  <ul>{evaluation.improvements.map((item, index) => <li key={index}>{item}</li>)}</ul>
                </div>
              )}
              {(evaluation.timeComplexity || evaluation.spaceComplexity) && (
                <small className="gh-complexity">Time: {evaluation.timeComplexity || "—"} · Space: {evaluation.spaceComplexity || "—"}</small>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
