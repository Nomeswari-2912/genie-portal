import React, { useState } from "react";

const languages = [
  { id: "python", label: "Python" },
  { id: "javascript", label: "JavaScript" },
  { id: "java", label: "Java" },
];
const difficulties = ["easy", "medium", "hard"];

const fallbackProblem = (language) => {
  const base = {
    title: "Largest Number in an Array",
    description: "Write a program that reads an array of integers and prints the largest number.\n\nExample: input `5` then `1 2 3 4 5` → output `5`.",
    inputFormat: "First line: integer n. Second line: n space-separated integers.",
    outputFormat: "A single integer — the largest number in the array.",
    constraints: "1 ≤ n ≤ 10^5, values fit in 32-bit integers.",
    testCases: [
      { input: "5\n1 2 3 4 5", expectedOutput: "5" },
      { input: "3\n-1 -5 -2", expectedOutput: "-1" },
      { input: "1\n42", expectedOutput: "42" },
      { input: "4\n7 7 7 7", expectedOutput: "7" },
    ],
  };
  const starters = {
    python: `import sys

def main():
    data = sys.stdin.read().split()
    n = int(data[0])
    numbers = list(map(int, data[1:1 + n]))
    # TODO: find and print the largest number
    print(max(numbers))

main()
`,
    javascript: `const fs = require("fs");

const input = fs.readFileSync(0, "utf8").trim().split(/\\s+/);
const n = Number(input[0]);
const numbers = input.slice(1, 1 + n).map(Number);
// TODO: find and print the largest number
console.log(Math.max(...numbers));
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
  };
  return { ...base, starterCode: starters[language] || starters.python };
};

const normalizeOutput = (value) => String(value ?? "").replace(/\r\n/g, "\n").trim().replace(/[ \t]+$/gm, "").trim();

const verdictLabels = { correct: "Correct", partially_correct: "Partially correct", incorrect: "Needs work" };

export default function CodingPractice() {
  const [language, setLanguage] = useState("python");
  const [difficulty, setDifficulty] = useState("easy");
  const [topic, setTopic] = useState("");
  const [problem, setProblem] = useState(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState(null);
  const [evaluation, setEvaluation] = useState(null);

  const generateProblem = async () => {
    setBusy("problem");
    setError("");
    setResults(null);
    setEvaluation(null);
    try {
      const response = await fetch("/api/code-problem", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language, difficulty, topic }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Could not generate a problem.");
      setProblem(result.problem);
      setCode(result.problem.starterCode || "");
    } catch (requestError) {
      setProblem(fallbackProblem(language));
      setCode(fallbackProblem(language).starterCode);
      setError(`AI problem generation is unavailable (${requestError.message}). Showing the built-in example instead.`);
    } finally {
      setBusy("");
    }
  };

  const runCode = async () => {
    if (!problem || busy) return;
    setBusy("run");
    setError("");
    setEvaluation(null);
    try {
      const settled = await Promise.all(problem.testCases.map(async (testCase, index) => {
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
          stderr: result.stderr || "",
          exitCode: result.exitCode,
          timedOut: result.timedOut,
        };
      }));
      setResults(settled);
    } catch (requestError) {
      setError(requestError.message);
      setResults(null);
    } finally {
      setBusy("");
    }
  };

  const submitCode = async () => {
    if (!problem || busy) return;
    setBusy("submit");
    setError("");
    try {
      const response = await fetch("/api/evaluate-code", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          problem: { title: problem.title, description: problem.description },
          language,
          code,
          results: (results || []).map((item) => ({
            input: item.input,
            expected: item.expected,
            actual: item.actual,
            passed: item.passed,
            stage: item.stage,
          })),
        }),
      });
      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Evaluation failed.");
      setEvaluation(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy("");
    }
  };

  const passedCount = results ? results.filter((item) => item.passed).length : 0;

  return (
    <div className="coding-practice">
      <header className="coding-toolbar">
        <div>
          <span className="section-kicker">CODING PRACTICE</span>
          <h1>Genie interview coding</h1>
          <p>Get an AI-generated problem, write code, run it against test cases, then submit for feedback.</p>
        </div>
        <div className="coding-toolbar-controls">
          <label>
            <span>Language</span>
            <select value={language} onChange={(event) => { setLanguage(event.target.value); setProblem(null); setResults(null); setEvaluation(null); setCode(""); }}>
              {languages.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
            </select>
          </label>
          <label>
            <span>Difficulty</span>
            <select value={difficulty} onChange={(event) => setDifficulty(event.target.value)}>
              {difficulties.map((item) => <option key={item} value={item}>{item[0].toUpperCase() + item.slice(1)}</option>)}
            </select>
          </label>
          <label className="coding-topic">
            <span>Topic (optional)</span>
            <input value={topic} onChange={(event) => setTopic(event.target.value)} placeholder="e.g. arrays, recursion" maxLength={120} />
          </label>
          <button type="button" className="primary-button" onClick={generateProblem} disabled={!!busy}>
            {busy === "problem" ? "Generating…" : problem ? "New problem" : "Get problem"}
          </button>
        </div>
      </header>

      {error && <p className="coding-error" role="alert">{error}</p>}

      {!problem ? (
        <div className="coding-empty panel">
          <strong>No problem loaded</strong>
          <p>Pick a language and difficulty, then press <b>Get problem</b> — Genie will write a coding interview question with test cases.</p>
        </div>
      ) : (
        <div className="coding-layout">
          <section className="coding-problem panel">
            <div className="coding-problem-heading">
              <h2>{problem.title}</h2>
              <span className="coding-badge">{difficulty}</span>
            </div>
            <p className="coding-description">{problem.description}</p>
            {problem.inputFormat && <p><strong>Input:</strong> {problem.inputFormat}</p>}
            {problem.outputFormat && <p><strong>Output:</strong> {problem.outputFormat}</p>}
            {problem.constraints && <p><strong>Constraints:</strong> {problem.constraints}</p>}
            <p className="coding-test-count">{problem.testCases.length} hidden test cases{results ? ` · ${passedCount}/${results.length} passed` : ""}</p>
          </section>

          <section className="coding-editor-panel panel">
            <div className="coding-editor-bar">
              <span>Main.{languages.find((item) => item.id === language)?.id === "python" ? "py" : languages.find((item) => item.id === language)?.id === "java" ? "java" : "js"}</span>
              <div>
                <button type="button" onClick={runCode} disabled={!!busy || !code.trim()}>{busy === "run" ? "Running…" : "▶ Run Code"}</button>
                <button type="button" className="primary-button" onClick={submitCode} disabled={!!busy || !code.trim()}>{busy === "submit" ? "Evaluating…" : "Submit Code"}</button>
              </div>
            </div>
            <textarea
              className="coding-editor"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Tab") {
                  event.preventDefault();
                  const target = event.target;
                  const start = target.selectionStart;
                  const end = target.selectionEnd;
                  setCode(code.slice(0, start) + "    " + code.slice(end));
                  requestAnimationFrame(() => { target.selectionStart = target.selectionEnd = start + 4; });
                }
              }}
              spellCheck={false}
              aria-label="Code editor"
            />
          </section>
        </div>
      )}

      {results && (
        <section className="coding-results">
          <h3>Test case results · {passedCount}/{results.length} passed</h3>
          {results.map((item) => (
            <article className={`coding-case ${item.passed ? "passed" : "failed"}`} key={item.index}>
              <header>
                <strong>Case {item.index + 1}</strong>
                <span className={`coding-case-status ${item.passed ? "passed" : "failed"}`}>{item.passed ? "Passed" : item.stage === "compile" ? "Compilation error" : item.timedOut ? "Timed out" : "Failed"}</span>
              </header>
              <dl>
                <div><dt>Input</dt><dd><pre>{item.input}</pre></dd></div>
                <div><dt>Expected</dt><dd><pre>{item.expected}</pre></dd></div>
                <div><dt>Actual</dt><dd><pre>{item.actual || "(no output)"}</pre></dd></div>
              </dl>
              {!item.passed && item.stderr && <pre className="coding-stderr">{item.stderr}</pre>}
            </article>
          ))}
        </section>
      )}

      {evaluation && (
        <section className="coding-evaluation panel">
          <div className="coding-eval-heading">
            <h3>Genie evaluation</h3>
            <span className={`coding-verdict ${evaluation.verdict}`}>{verdictLabels[evaluation.verdict] || evaluation.verdict}{evaluation.score !== null ? ` · ${evaluation.score}/100` : ""}</span>
          </div>
          {evaluation.feedback && <p>{evaluation.feedback}</p>}
          {(evaluation.timeComplexity || evaluation.spaceComplexity) && (
            <p className="coding-complexity">
              {evaluation.timeComplexity && <span>Time: <strong>{evaluation.timeComplexity}</strong></span>}
              {evaluation.spaceComplexity && <span>Space: <strong>{evaluation.spaceComplexity}</strong></span>}
            </p>
          )}
          {evaluation.improvements?.length > 0 && (
            <div>
              <strong>Suggestions</strong>
              <ul>{evaluation.improvements.map((item, index) => <li key={index}>{item}</li>)}</ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
