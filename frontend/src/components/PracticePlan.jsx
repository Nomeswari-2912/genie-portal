import React, { useMemo } from "react";
import { loadInterviewHistory } from "./InterviewHistory.jsx";

const skillActions = (score) => {
  if (score >= 80) return { tier: "advanced", label: "Advanced practice", tip: "Tackle harder problems and edge cases — stretch beyond the basics." };
  if (score >= 65) return { tier: "revise", label: "Revise fundamentals", tip: "Review core concepts and the mistakes that cost you points." };
  if (score >= 50) return { tier: "daily", label: "Daily practice", tip: "Short focused drills every day beat one long session." };
  return { tier: "rebuild", label: "Rebuild basics", tip: "Rebuild the foundations before your next interview — confidence first." };
};

const skillTip = (skill, score) => {
  const base = skillActions(score).tip;
  if (/communication|grammar|vocabulary|clarity/i.test(skill)) {
    return "Practise speaking aloud daily — record yourself, then review pace, fillers, and structure.";
  }
  if (/problem solving|correctness|technical/i.test(skill)) {
    return "Solve one problem a day and explain your reasoning out loud before coding.";
  }
  return base;
};

function weekStart(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function formatWeek(ts) {
  return new Date(ts).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function PracticePlan({ onOpenSession }) {
  const entries = useMemo(() => loadInterviewHistory(), []);

  const { skills, weekly, recommendation, totals } = useMemo(() => {
    const skillTotals = new Map();
    const addSkill = (name, value) => {
      if (!Number.isFinite(value)) return;
      const entry = skillTotals.get(name) || { total: 0, count: 0 };
      entry.total += value;
      entry.count += 1;
      skillTotals.set(name, entry);
    };

    for (const entry of entries) {
      const dims = entry.dimensionScores || {};
      const quality = dims.quality || {};
      if (Object.keys(quality).length) {
        for (const [name, value] of Object.entries(quality)) addSkill(name, value);
      } else {
        if (Number.isFinite(entry.technicalScore)) addSkill("Technical Knowledge", entry.technicalScore);
        if (Number.isFinite(entry.communicationScore)) addSkill("Communication Clarity", entry.communicationScore);
      }
    }

    const skillList = [...skillTotals.entries()]
      .map(([name, { total, count }]) => ({ name, score: Math.round(total / count) }))
      .sort((a, b) => a.score - b.score);

    const weeks = new Map();
    for (const entry of entries) {
      if (!Number.isFinite(entry.overall) || !entry.date) continue;
      const key = weekStart(entry.date);
      const bucket = weeks.get(key) || { total: 0, count: 0 };
      bucket.total += entry.overall;
      bucket.count += 1;
      weeks.set(key, bucket);
    }
    const weeklyData = [...weeks.entries()]
      .map(([week, { total, count }]) => ({ week, score: Math.round(total / count) }))
      .sort((a, b) => a.week - b.week)
      .slice(-8);

    const weakest = skillList[0] || null;
    let recommendation = null;
    if (weakest) {
      const weakName = weakest.name.toLowerCase();
      if (/communication|grammar|vocabulary|clarity/.test(weakName)) {
        recommendation = {
          type: "Behavioral",
          difficulty: weakest.score < 50 ? "Easy" : "Medium",
          focus: "Clear, structured spoken answers",
          reason: `Your weakest area is ${weakest.name} (${weakest.score}%). A behavioral interview practises exactly that.`,
        };
      } else if (/problem|correctness|technical|relevance|completeness/.test(weakName)) {
        recommendation = {
          type: "Technical",
          difficulty: weakest.score < 50 ? "Easy" : "Medium",
          focus: weakest.name,
          reason: `Your weakest area is ${weakest.name} (${weakest.score}%). A focused technical interview will drill it.`,
        };
      } else {
        recommendation = {
          type: "Technical",
          difficulty: "Easy",
          focus: weakest.name,
          reason: `Your weakest area is ${weakest.name} (${weakest.score}%). Start easy and rebuild confidence.`,
        };
      }
    }

    return {
      skills: skillList,
      weekly: weeklyData,
      recommendation,
      totals: { sessions: entries.length, avg: entries.length ? Math.round(entries.reduce((s, e) => s + (e.overall || 0), 0) / entries.length) : null },
    };
  }, [entries]);

  const maxScore = Math.max(60, ...weekly.map((item) => item.score), ...skills.map((item) => item.score));

  if (!entries.length) {
    return (
      <div className="practice-plan">
        <header className="plan-header">
          <span className="section-kicker">PERSONALIZED PRACTICE PLAN</span>
          <h1>Practice plan</h1>
          <p>Your plan is built from interview history — complete a mock interview and Genie will map your weak spots into daily practice.</p>
        </header>
        <div className="plan-empty panel">
          <strong>No interview data yet</strong>
          <p>Finish an interview in the Interview Session tab, then come back — your skill scores, weekly progress, and recommended next interview will appear here.</p>
          {onOpenSession && <button type="button" className="primary-button" onClick={onOpenSession}>Start an interview</button>}
        </div>
      </div>
    );
  }

  return (
    <div className="practice-plan">
      <header className="plan-header">
        <span className="section-kicker">PERSONALIZED PRACTICE PLAN</span>
        <h1>Your practice plan</h1>
        <p>Built from {totals.sessions} interview{totals.sessions === 1 ? "" : "s"} · average score {totals.avg ?? "—"}/100</p>
      </header>

      <section className="plan-skills">
        <h2>Skill focus areas</h2>
        <div className="plan-skill-list">
          {skills.map((skill) => {
            const action = skillActions(skill.score);
            return (
              <article className={`plan-skill ${action.tier}`} key={skill.name}>
                <div className="plan-skill-score">
                  <strong>{skill.score}%</strong>
                  <span>{skill.name}</span>
                </div>
                <div className="plan-skill-body">
                  <span className={`plan-tier tier-${action.tier}`}>{action.label}</span>
                  <p>{skillTip(skill.name, skill.score)}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {weekly.length > 0 && (
        <section className="plan-chart panel">
          <h2>Weekly progress</h2>
          <div className="weekly-chart" role="img" aria-label="Weekly average interview scores">
            {weekly.map((item) => (
              <div className="weekly-bar-wrap" key={item.week}>
                <strong>{item.score}</strong>
                <div className="weekly-bar-track">
                  <div className="weekly-bar" style={{ height: `${Math.max(6, (item.score / maxScore) * 100)}%` }} />
                </div>
                <span>{formatWeek(item.week)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {recommendation && (
        <section className="plan-recommendation panel">
          <h2>Recommended next interview</h2>
          <p>{recommendation.reason}</p>
          <div className="recommendation-card">
            <div><span>Type</span><strong>{recommendation.type}</strong></div>
            <div><span>Difficulty</span><strong>{recommendation.difficulty}</strong></div>
            <div><span>Focus</span><strong>{recommendation.focus}</strong></div>
            {onOpenSession && <button type="button" className="primary-button" onClick={onOpenSession}>Start this interview</button>}
          </div>
        </section>
      )}
    </div>
  );
}
