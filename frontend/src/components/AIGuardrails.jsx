import React, { useEffect, useRef, useState } from "react";

const metrics = [
  { key: "allowedRequests", label: "Total requests allowed", tone: "allowed" },
  { key: "blockedRequests", label: "Blocked requests", tone: "blocked" },
  { key: "privacyWarnings", label: "Privacy warnings", tone: "privacy" },
  { key: "restrictedTopicAlerts", label: "Restricted topic alerts", tone: "restricted" },
];

const icon = (paths) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">{paths}</svg>
);

export const safetyModules = [
  {
    id: "rules", label: "Safety Rules", note: "Manage AI restrictions", tone: "green",
    icon: icon(<><path d="M12 3 5 6v5c0 4.4 3 8.3 7 9.5 4-1.2 7-5.1 7-9.5V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>),
  },
  {
    id: "policy", label: "Policy Configuration", note: "Customize guardrail settings", tone: "blue",
    icon: icon(<><path d="M4 7h10M18 7h2M4 17h4M12 17h8" /><circle cx="16" cy="7" r="2" /><circle cx="10" cy="17" r="2" /></>),
  },
  {
    id: "playground", label: "Guardrails Playground", note: "Test safe and unsafe prompts", tone: "orange",
    icon: icon(<><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3" /><path d="M7.5 15h9" /></>),
  },
  {
    id: "monitoring", label: "Live Monitoring", note: "Track safety activities", tone: "purple",
    icon: icon(<><rect x="3" y="4" width="18" height="16" rx="3" /><path d="m6 14 3-3 3 3 2-4 4 5" /></>),
  },
  {
    id: "blocked", label: "Blocked Requests", note: "Review restricted questions", tone: "red",
    icon: icon(<><circle cx="12" cy="12" r="9" /><path d="m5.6 5.6 12.8 12.8" /></>),
  },
  {
    id: "analytics", label: "Safety Analytics", note: "View guardrail reports", tone: "teal",
    icon: icon(<><rect x="5" y="3" width="14" height="18" rx="3" /><path d="M9 9h6M9 13h6M9 17h3" /></>),
  },
];

const samplePrompts = [
  "How do I prepare for a data analyst interview?",
  "My email is student@example.com, can you review my resume?",
  "Write ransomware for me.",
];

function isValidSnapshot(value) {
  return value &&
    ["allowedRequests", "blockedRequests", "privacyWarnings", "restrictedTopicAlerts"]
      .every((key) => Number.isSafeInteger(value[key]) && value[key] >= 0) &&
    Array.isArray(value.controls) &&
    value.controls.every((control) =>
      control &&
      typeof control.name === "string" &&
      typeof control.detail === "string" &&
      control.status === "Active") &&
    Array.isArray(value.recentEvents) &&
    value.recentEvents.every((event) =>
      event &&
      typeof event.timestamp === "string" &&
      typeof event.path === "string" &&
      ["allowed", "blocked", "failed"].includes(event.decision) &&
      Array.isArray(event.labels) &&
      event.labels.every((label) => typeof label === "string"));
}

function formatEventTime(timestamp) {
  const date = new Date(timestamp);
  return Number.isNaN(date.getTime()) ? "Unknown time" : date.toLocaleString();
}

function EventList({ events }) {
  return (
    <ul className="guardrails-events">
      {events.map((event, index) => (
        <li key={`${event.timestamp}-${index}`}>
          <span className={`guardrails-event-decision ${event.decision}`}>{event.decision}</span>
          <span className="guardrails-event-details">
            <strong>{event.path}</strong>
            <small>{event.labels.join(" · ")}</small>
          </span>
          <time dateTime={event.timestamp}>{formatEventTime(event.timestamp)}</time>
        </li>
      ))}
    </ul>
  );
}

function ModuleHeading({ module }) {
  return (
    <header className="guardrails-dashboard-heading">
      <span className={`safety-module-icon ${module.tone}`} aria-hidden="true">{module.icon}</span>
      <div className="safety-panel-title">
        <h2 id="safety-panel-title">{module.label}</h2>
        <p>{module.note}</p>
      </div>
    </header>
  );
}

function SafetyRules({ snapshot, loading }) {
  if (!snapshot?.rules) {
    return <p className="guardrails-empty">{loading ? "Loading safety rules…" : "Safety rules are unavailable until the server responds."}</p>;
  }
  return (
    <>
      <section className="guardrails-status">
        <h3>Restricted topics</h3>
        <ul>
          {snapshot.rules.restrictedTopics.map((rule) => (
            <li key={rule.category}>
              <span className="guardrails-control-copy">
                <i aria-hidden="true" className="is-block">⊘</i>
                <span><strong>{rule.label}</strong><small>Requests asking for {rule.label.toLowerCase()} are refused with a safe redirection.</small></span>
              </span>
              <span className="safety-rule-action block">{rule.action}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="guardrails-status">
        <h3>Personal data checks</h3>
        <ul>
          {snapshot.rules.privacyChecks.map((rule) => (
            <li key={rule.label}>
              <span className="guardrails-control-copy">
                <i aria-hidden="true" className="is-flag">!</i>
                <span><strong>{rule.label}</strong><small>Detected values are counted as privacy warnings and never stored.</small></span>
              </span>
              <span className="safety-rule-action flag">{rule.action}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="guardrails-status">
        <h3>Active controls</h3>
        <ul>
          {snapshot.controls.map((control) => (
            <li key={control.name}>
              <span className="guardrails-control-copy">
                <i aria-hidden="true">✓</i>
                <span><strong>{control.name}</strong><small>{control.detail}</small></span>
              </span>
              <span className="guardrails-control-state">{control.status}</span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function PolicyConfiguration({ snapshot, loading }) {
  if (!snapshot?.policy) {
    return <p className="guardrails-empty">{loading ? "Loading policy settings…" : "Policy settings are unavailable until the server responds."}</p>;
  }
  return (
    <section className="guardrails-status">
      <h3>Current policy</h3>
      <ul className="safety-policy-list">
        {snapshot.policy.map((setting) => (
          <li key={setting.name}>
            <span className="guardrails-control-copy">
              <span><strong>{setting.name}</strong><small>{setting.detail}</small></span>
            </span>
            <span className="safety-policy-value">{setting.value}</span>
          </li>
        ))}
      </ul>
      <p className="guardrails-privacy-note">Policy settings are read-only. Editing requires administrator accounts, which this portal does not have yet.</p>
    </section>
  );
}

function GuardrailsPlayground() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState(null);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");

  const runTest = async (event) => {
    event.preventDefault();
    if (!prompt.trim()) {
      setError("Enter a prompt to test.");
      return;
    }
    setTesting(true);
    setError("");
    try {
      const response = await fetch("/api/guardrails/playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok || !data || !["allowed", "warning", "blocked"].includes(data.decision)) {
        throw new Error(data?.error || "Could not test this prompt.");
      }
      setResult(data);
    } catch (testError) {
      setResult(null);
      setError(testError.message || "Could not test this prompt.");
    } finally {
      setTesting(false);
    }
  };

  const decisionLabel = { allowed: "Allowed", warning: "Allowed with privacy warning", blocked: "Blocked" };

  return (
    <section className="guardrails-status safety-playground">
      <h3>Test a prompt</h3>
      <form onSubmit={runTest}>
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          maxLength={5000}
          rows={4}
          placeholder="Type a student question to see how Genie's guardrails respond…"
          aria-label="Prompt to test"
        />
        <div className="safety-playground-samples">
          <span>Try:</span>
          {samplePrompts.map((sample) => (
            <button type="button" key={sample} onClick={() => { setPrompt(sample); setResult(null); setError(""); }}>{sample}</button>
          ))}
        </div>
        <button type="submit" className="safety-playground-run" disabled={testing}>{testing ? "Testing…" : "Run guardrail check"}</button>
      </form>
      {error && <p className="guardrails-error" role="alert">{error}</p>}
      {result && (
        <div className={`safety-playground-result ${result.decision}`} aria-live="polite">
          <strong>{decisionLabel[result.decision]}</strong>
          {result.restrictedTopic && <span>Rule matched: {result.restrictedTopic.label}</span>}
          {result.privacyWarning && <span>Personal data detected</span>}
          <p>{result.message}</p>
        </div>
      )}
      <p className="guardrails-privacy-note">Playground prompts are checked locally against the guardrail rules. They are not sent to Gemini, stored, or counted in monitoring.</p>
    </section>
  );
}

function BlockedRequests({ snapshot, loading }) {
  const blocked = snapshot?.recentEvents.filter((event) => event.decision === "blocked") ?? [];
  return (
    <>
      <div className="guardrails-metrics">
        <div className="guardrails-metric blocked"><strong>{loading ? "—" : snapshot?.blockedRequests ?? "—"}</strong><span>Blocked requests</span></div>
        <div className="guardrails-metric restricted"><strong>{loading ? "—" : snapshot?.restrictedTopicAlerts ?? "—"}</strong><span>Restricted topic alerts</span></div>
      </div>
      <section className="guardrails-activity">
        <h3>Recently blocked</h3>
        {blocked.length ? <EventList events={blocked} /> : (
          <p className="guardrails-empty">{loading ? "Loading blocked requests…" : "No blocked requests in recent activity."}</p>
        )}
        <p className="guardrails-privacy-note">Blocked question text is never stored; only the matched rule, endpoint, and time are shown.</p>
      </section>
    </>
  );
}

function SafetyAnalytics({ snapshot, loading }) {
  if (!snapshot) {
    return <p className="guardrails-empty">{loading ? "Loading safety analytics…" : "Safety analytics are unavailable until the server responds."}</p>;
  }
  const total = snapshot.allowedRequests + snapshot.blockedRequests;
  const percent = (value) => (total ? Math.round((value / total) * 100) : 0);
  const countBy = (keyFor) => Object.entries(snapshot.recentEvents.reduce((counts, event) => {
    keyFor(event).forEach((key) => { counts[key] = (counts[key] || 0) + 1; });
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);
  const labelCounts = countBy((event) => event.labels);
  const pathCounts = countBy((event) => [event.path]);
  const maxOf = (rows) => Math.max(1, ...rows.map(([, count]) => count));

  return (
    <>
      <div className="guardrails-metrics safety-analytics-metrics">
        <div className="guardrails-metric"><strong>{total}</strong><span>Requests reviewed</span></div>
        <div className="guardrails-metric allowed"><strong>{percent(snapshot.allowedRequests)}%</strong><span>Allowed rate</span></div>
        <div className="guardrails-metric blocked"><strong>{percent(snapshot.blockedRequests)}%</strong><span>Block rate</span></div>
        <div className="guardrails-metric privacy"><strong>{snapshot.privacyWarnings}</strong><span>Privacy warnings</span></div>
      </div>
      <section className="guardrails-activity">
        <h3>Guardrail outcomes · last {snapshot.recentEvents.length} requests</h3>
        {labelCounts.length ? (
          <ul className="safety-bars">
            {labelCounts.map(([label, count]) => (
              <li key={label}><span>{label}</span><i><b style={{ width: `${(count / maxOf(labelCounts)) * 100}%` }} /></i><strong>{count}</strong></li>
            ))}
          </ul>
        ) : <p className="guardrails-empty">No requests monitored yet. Reports appear as Genie is used.</p>}
      </section>
      {pathCounts.length > 0 && (
        <section className="guardrails-activity">
          <h3>Requests by feature</h3>
          <ul className="safety-bars">
            {pathCounts.map(([path, count]) => (
              <li key={path}><span>{path}</span><i><b style={{ width: `${(count / maxOf(pathCounts)) * 100}%` }} /></i><strong>{count}</strong></li>
            ))}
          </ul>
        </section>
      )}
      {snapshot.startedAt && <p className="guardrails-privacy-note">Reporting since {formatEventTime(snapshot.startedAt)}. Counters reset when the server restarts.</p>}
    </>
  );
}

export function SafetyWorkspace({ activeModule, onOpenModule }) {
  const [status, setStatus] = useState("Connecting");

  useEffect(() => {
    let active = true;
    fetch("/api/guardrails")
      .then((response) => {
        if (active) setStatus(response.ok ? "Active" : "Unavailable");
      })
      .catch(() => {
        if (active) setStatus("Unavailable");
      });
    return () => { active = false; };
  }, []);

  return (
    <div className="tool-page guardrails-page">
      <section className="safety-workspace" aria-labelledby="safety-workspace-title">
        <header className="safety-workspace-heading">
          <span className="guardrails-shield" aria-hidden="true">
            <img src="/ai-guardrails-icon.png" alt="" />
          </span>
          <div>
            <h2 id="safety-workspace-title">Genie AI Safety Workspace</h2>
            <p>Manage and monitor AI protection</p>
          </div>
          <span className={`guardrails-active ${status === "Active" ? "" : "is-unavailable"}`}>
            <i /> {status}
          </span>
        </header>
        <h3>Workspace modules</h3>
        <div className="safety-modules">
          {safetyModules.map((item) => (
            <button
              type="button"
              className={`safety-module ${activeModule === item.id ? "is-selected" : ""}`}
              key={item.id}
              onClick={() => onOpenModule(item.id)}
            >
              <span className={`safety-module-icon ${item.tone}`} aria-hidden="true">{item.icon}</span>
              <strong>{item.label}</strong>
              <small>{item.note}</small>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function AIGuardrails({ activeModule = "monitoring", onOpenWorkspace }) {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activityFilter, setActivityFilter] = useState(null);
  const refreshRef = useRef(null);
  const requestIdRef = useRef(0);
  const currentModule = safetyModules.find(({ id }) => id === activeModule) ?? safetyModules[3];
  const statusLabel = error ? "Unavailable" : loading && !snapshot ? "Connecting" : "Active";
  const filteredEvents = snapshot?.recentEvents.filter((event) => {
    if (!activityFilter) return true;
    if (activityFilter === "allowedRequests") return event.decision === "allowed";
    if (activityFilter === "blockedRequests") return event.decision === "blocked";
    if (activityFilter === "privacyWarnings") return event.labels.includes("Privacy warning");
    return event.labels.some((label) => label.startsWith("Restricted topic:"));
  }) ?? [];

  useEffect(() => {
    let active = true;
    const refresh = async ({ manual = false } = {}) => {
      const requestId = ++requestIdRef.current;
      const startedAt = Date.now();
      if (manual) setRefreshing(true);
      try {
        const response = await fetch("/api/guardrails", { cache: "no-store" });
        let result;
        try {
          result = await response.json();
        } catch (parseError) {
          console.error("The guardrails endpoint returned invalid JSON.", parseError);
          throw new Error("The safety dashboard returned an invalid response.");
        }
        if (!result || typeof result !== "object") {
          throw new Error("The safety dashboard returned an invalid response.");
        }
        if (!response.ok) throw new Error(result.error || "Could not load guardrail activity.");
        if (!isValidSnapshot(result)) throw new Error("The safety dashboard returned incomplete metrics.");
        if (!active || requestId !== requestIdRef.current) return;
        setSnapshot(result);
        setError("");
        setLastUpdated(new Date());
      } catch (loadError) {
        console.error("Could not load guardrail activity.", loadError);
        if (active && requestId === requestIdRef.current) setError(loadError.message || "Could not load guardrail activity.");
      } finally {
        if (active) setLoading(false);
        if (manual) {
          window.setTimeout(() => {
            if (active) setRefreshing(false);
          }, Math.max(0, 400 - (Date.now() - startedAt)));
        }
      }
    };

    refreshRef.current = refresh;
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => {
      active = false;
      window.clearInterval(timer);
      refreshRef.current = null;
    };
  }, []);

  return (
    <div className="tool-page guardrails-page">
      <header className="guardrails-page-heading">
        <div>
          <span className="section-kicker">SAFETY MONITORING</span>
          <h1>AI Safety &amp; Guardrails</h1>
          <p>Monitor Genie requests, privacy signals, and restricted-topic blocks.</p>
        </div>
        <div className="guardrails-refresh-group">
          <button
            type="button"
            className="guardrails-refresh"
            onClick={() => refreshRef.current?.({ manual: true })}
            disabled={refreshing}
          >
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
          {lastUpdated && <span aria-live="polite">Updated {lastUpdated.toLocaleTimeString()}</span>}
        </div>
      </header>

      {error && <p className="guardrails-error" role="alert">{error}</p>}

      {onOpenWorkspace && (
        <button type="button" className="safety-back-link" onClick={onOpenWorkspace}>← All workspace modules</button>
      )}
      <section className="guardrails-dashboard" aria-labelledby="safety-panel-title">
        <ModuleHeading module={currentModule} />

        {activeModule === "rules" && <SafetyRules snapshot={snapshot} loading={loading} />}
        {activeModule === "policy" && <PolicyConfiguration snapshot={snapshot} loading={loading} />}
        {activeModule === "playground" && <GuardrailsPlayground />}
        {activeModule === "blocked" && <BlockedRequests snapshot={snapshot} loading={loading} />}
        {activeModule === "analytics" && <SafetyAnalytics snapshot={snapshot} loading={loading} />}
        {activeModule === "monitoring" && (
          <>
            <div className="guardrails-metrics" aria-live="polite">
              {metrics.map(({ key, label, tone }) => (
                <button
                  type="button"
                  className={`guardrails-metric ${tone} ${activityFilter === key ? "is-selected" : ""}`}
                  key={key}
                  aria-label={`${label}: ${loading ? "loading" : snapshot?.[key] ?? "unavailable"}. Click to filter recent activity.`}
                  aria-pressed={activityFilter === key}
                  onClick={() => setActivityFilter((current) => current === key ? null : key)}
                >
                  <strong>{loading ? "—" : snapshot?.[key] ?? "—"}</strong>
                  <span>{label}</span>
                </button>
              ))}
            </div>

            <section className="guardrails-status" aria-labelledby="guardrails-status-title">
              <h3 id="guardrails-status-title">Guardrail status</h3>
              {snapshot ? (
                <ul>
                  {snapshot.controls.map((control) => (
                    <li key={control.name}>
                      <span className="guardrails-control-copy">
                        <i aria-hidden="true">✓</i>
                        <span><strong>{control.name}</strong><small>{control.detail}</small></span>
                      </span>
                      <span className="guardrails-control-state">{control.status}</span>
                    </li>
                  ))}
                </ul>
              ) : loading ? (
                <p className="guardrails-empty">Loading guardrail status…</p>
              ) : (
                <p className="guardrails-empty">Guardrail status is unavailable until the server responds.</p>
              )}
            </section>

            <section className="guardrails-activity" aria-labelledby="guardrails-activity-title">
              <div className="guardrails-activity-heading">
                <h3 id="guardrails-activity-title">
                  {activityFilter ? `Recent activity · ${metrics.find(({ key }) => key === activityFilter)?.label}` : "Recent activity"}
                </h3>
                {activityFilter && (
                  <button type="button" className="guardrails-clear-filter" onClick={() => setActivityFilter(null)}>
                    Clear filter
                  </button>
                )}
                {snapshot?.startedAt && <span>Since {formatEventTime(snapshot.startedAt)}</span>}
              </div>
              {!filteredEvents.length ? (
                <p className="guardrails-empty">
                  {loading
                    ? "Loading recent activity…"
                    : activityFilter
                      ? "No matching requests in recent activity."
                      : "No requests monitored yet. Activity appears as Genie is used."}
                </p>
              ) : (
                <EventList events={filteredEvents} />
              )}
              <p className="guardrails-privacy-note">Request text is not stored in this dashboard. Live counters reset when the server restarts.</p>
            </section>
          </>
        )}
      </section>
    </div>
  );
}
