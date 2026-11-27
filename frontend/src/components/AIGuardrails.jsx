import React, { useEffect, useRef, useState } from "react";

const metrics = [
  { key: "allowedRequests", label: "Total requests allowed", tone: "allowed" },
  { key: "blockedRequests", label: "Blocked requests", tone: "blocked" },
  { key: "privacyWarnings", label: "Privacy warnings", tone: "privacy" },
  { key: "restrictedTopicAlerts", label: "Restricted topic alerts", tone: "restricted" },
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

export default function AIGuardrails() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const refreshRef = useRef(null);

  useEffect(() => {
    let active = true;
    const refresh = async () => {
      setRefreshing(true);
      try {
        const response = await fetch("/api/guardrails");
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
        if (!active) return;
        setSnapshot(result);
        setError("");
      } catch (loadError) {
        console.error("Could not load guardrail activity.", loadError);
        if (active) setError(loadError.message || "Could not load guardrail activity.");
      } finally {
        if (active) {
          setLoading(false);
          setRefreshing(false);
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
        <button
          type="button"
          className="guardrails-refresh"
          onClick={() => refreshRef.current?.()}
          disabled={refreshing}
        >
          {refreshing ? "Refreshing…" : "Refresh"}
        </button>
      </header>

      {error && <p className="guardrails-error" role="alert">{error}</p>}

      <section className="guardrails-dashboard" aria-labelledby="guardrails-title">
        <header className="guardrails-dashboard-heading">
          <span className="guardrails-shield" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 3 20 6v5.5c0 4.7-3.1 8-8 9.5-4.9-1.5-8-4.8-8-9.5V6l8-3Z" />
              <path d="m8.5 12 2.2 2.2 4.8-5" />
            </svg>
          </span>
          <h2 id="guardrails-title">AI Guardrails Dashboard</h2>
          <span className="guardrails-active"><i /> Active</span>
        </header>

        <div className="guardrails-metrics" aria-live="polite">
          {metrics.map(({ key, label, tone }) => (
            <article className={`guardrails-metric ${tone}`} key={key}>
              <strong>{loading ? "—" : snapshot?.[key] ?? "—"}</strong>
              <span>{label}</span>
            </article>
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
            <h3 id="guardrails-activity-title">Recent activity</h3>
            {snapshot?.startedAt && <span>Since {formatEventTime(snapshot.startedAt)}</span>}
          </div>
          {!snapshot?.recentEvents.length ? (
            <p className="guardrails-empty">
              {loading ? "Loading recent activity…" : "No requests monitored yet. Activity appears as Genie is used."}
            </p>
          ) : (
            <ul className="guardrails-events">
              {snapshot.recentEvents.map((event, index) => (
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
          )}
          <p className="guardrails-privacy-note">Request text is not stored in this dashboard. Live counters reset when the server restarts.</p>
        </section>
      </section>
    </div>
  );
}
