import React, { useState } from "react";

const skills = [
  { name: "Data Analysis", score: 92, level: "Expert" },
  { name: "Python", score: 85, level: "Advanced" },
  { name: "SQL", score: 85, level: "Advanced" },
  { name: "Machine Learning", score: 75, level: "Intermediate" },
  { name: "Communication", score: 80, level: "Advanced" },
  { name: "Project Management", score: 70, level: "Intermediate" },
  { name: "Tableau", score: 78, level: "Advanced" },
];

const gaps = [
  { name: "AWS", status: "Required", tone: "missing" },
  { name: "Cloud Computing", status: "Required", tone: "missing" },
  { name: "Big Data", status: "Required", tone: "missing" },
  { name: "Docker", status: "Preferred", tone: "preferred" },
  { name: "Kubernetes", status: "Preferred", tone: "preferred" },
];

const recommendations = [
  { name: "AWS (Amazon Web Services)", impact: "High Impact", score: 95 },
  { name: "Cloud Computing", impact: "High Impact", score: 90 },
  { name: "Big Data Technologies", impact: "High Impact", score: 88 },
  { name: "Docker", impact: "Medium Impact", score: 75 },
];

const categories = [
  { title: "Technical Skills", value: "12 (Advanced Average)", detail: "Python · SQL · Data Analysis · Tableau · Machine Learning" },
  { title: "Soft Skills", value: "8 (Advanced Average)", detail: "Communication · Collaboration · Leadership · Problem Solving" },
  { title: "Industry-Specific", value: "5 (Intermediate Average)", detail: "Data Storytelling · Business Intelligence · Data Governance" },
];

function SkillBar({ skill, index }) {
  return (
    <div className="career-skill">
      <div className="career-skill-label">
        <span>{skill.name}</span>
        <span className="career-skill-rating"><strong>{skill.score}%</strong> Proficiency, <i className={`skill-level level-${skill.level.toLowerCase()}`}>{skill.level}</i><b aria-label="Verified">✓</b></span>
      </div>
      <div className="career-skill-track"><span style={{ width: `${skill.score}%`, animationDelay: `${index * 55}ms` }} /></div>
    </div>
  );
}

export default function CareerDashboard({ atsScore = null }) {
  const [advancedSkills, setAdvancedSkills] = useState(true);
  const [openCategory, setOpenCategory] = useState(null);
  const [addedSkills, setAddedSkills] = useState(() => localStorage.getItem("genie-resume-skills")?.split(",").map((item) => item.trim()).filter(Boolean) ?? []);
  const [notice, setNotice] = useState("");

  const addSkill = (skill) => {
    const savedSkills = localStorage.getItem("genie-resume-skills")?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];
    if (savedSkills.includes(skill)) {
      setAddedSkills((current) => current.includes(skill) ? current : [...current, skill]);
      setNotice(`${skill} is already in your resume.`);
      return;
    }

    try {
      localStorage.setItem("genie-resume-skills", [...savedSkills, skill].join(", "));
      setAddedSkills((current) => [...current, skill]);
      setNotice(`${skill} added to your resume.`);
    } catch (error) {
      console.error("Could not save this skill to the resume.", error);
      setNotice("Could not save this skill. Check browser storage and try again.");
    }
  };

  return (
    <div className="career-dashboard">
      <section className="career-skills-card career-panel">
        <header className="career-panel-heading">
          <h2>Current Skills Analysis</h2>
        </header>
        <div className="career-card-content">
          <div className="career-subheading">
            <h3>Strengths Visualization</h3>
            <label className="career-toggle-label">Show Advanced Skills
              <input type="checkbox" checked={advancedSkills} onChange={(event) => setAdvancedSkills(event.target.checked)} />
              <span className="career-toggle" />
            </label>
          </div>
          <div className="career-skill-list">
            {skills.filter((skill) => advancedSkills || skill.score < 80).map((skill, index) => <SkillBar key={skill.name} skill={skill} index={index} />)}
          </div>

          <div className="career-divider" />
          <div className="career-subheading">
            <h3>Skills Category</h3>
            <label className="career-toggle-label">Show Advanced Skills
              <input type="checkbox" checked={advancedSkills} onChange={(event) => setAdvancedSkills(event.target.checked)} />
              <span className="career-toggle" />
            </label>
          </div>
          <h3 className="career-small-title">Top Skills Highlighted</h3>
          <div className="skill-chips"><span>Data Analysis</span><span>Python</span><span>SQL</span></div>
          <div className="career-category-list">
            {categories.map((category, index) => (
              <div className="career-category" key={category.title}>
                <button aria-expanded={openCategory === index} onClick={() => setOpenCategory(openCategory === index ? null : index)}>
                  <span><strong>{category.title}:</strong> {category.value}</span><span className="category-chevron">{openCategory === index ? "⌃" : "⌄"}</span>
                </button>
                {openCategory === index && <p>{category.detail}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="career-middle-column">
        <section className="role-fit-banner">
          <div className="role-fit-gauge" aria-label={atsScore === null ? "ATS score not calculated" : `ATS score ${atsScore} out of 100`}>
            <svg viewBox="0 0 170 96" role="img" aria-hidden="true">
              <path className="gauge-track" d="M 12 84 A 73 73 0 0 1 158 84" />
              <path className="gauge-value" d="M 12 84 A 73 73 0 0 1 158 84" style={{
                strokeDasharray: 229.3,
                strokeDashoffset: atsScore === null ? 229.3 : 229.3 * (1 - atsScore / 100),
              }} />
            </svg>
            <div className="gauge-score"><strong>{atsScore ?? "—"}{atsScore !== null && <span>/100</span>}</strong><small>ATS Score</small></div>
          </div>
          <div className="compatibility-card">
            <span className="compatibility-icon">↗</span>
            <h2>Resume Match: <strong>{atsScore === null ? "Not calculated" : `${atsScore}%`}</strong></h2>
            <p>{atsScore === null
              ? "Upload a resume and add a job description in Resume Builder to see your ATS score here."
              : "This ATS keyword-match score is from your latest resume and job description."}</p>
          </div>
        </section>

        <section className="career-gap-panel career-panel">
          <header className="career-panel-heading"><h2>Skills Gap Analysis</h2></header>
          <div className="gap-content">
            <section className="gap-overview">
              <h3>Skills Gap Overview</h3>
              <div className="gap-chart" aria-label="Present skills 78 percent, missing skills 22 percent">
                <div className="gap-bar-group">
                  <div className="gap-bar present-bar"><span /></div>
                  <span className="gap-axis">0</span>
                  <strong>Present Skills<br />(78%)</strong>
                </div>
                <div className="gap-bar-group missing-group">
                  <div className="gap-missing-label">22%</div>
                  <div className="gap-bar missing-bar"><span /></div>
                  <span className="gap-axis">0</span>
                  <strong>Missing Skills<br />(22%)</strong>
                </div>
                <div className="gap-y-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0</span></div>
                <div className="gap-grid-lines"><i /><i /><i /><i /></div>
              </div>

              <h3 className="severity-title">Gap Severity Indicators</h3>
              <div className="severity-list">
                <article className="severity-item severity-critical"><span className="severity-number">3</span><div><strong>Critical Gaps:</strong><small>AWS · Cloud Computing · Big Data</small></div></article>
                <article className="severity-item severity-important"><span className="severity-number">5</span><div><strong>Important Gaps:</strong><small>Docker · Kubernetes · Testing</small></div></article>
                <article className="severity-item severity-nice"><span className="severity-number">4</span><div><strong>Nice-to-have Gaps:</strong><small>Git · Jenkins · Agile</small></div></article>
              </div>
            </section>

            <section className="role-requirements">
              <h3>Profile vs. Target Role Requirements</h3>
              <div className="requirements-diagram">
                <div className="requirement-column">
                  <h4>Current<br />Profile</h4>
                  <div className="requirement-skill current">Python<small>(Advanced)</small></div>
                  <div className="requirement-skill current">SQL<small>(Advanced)</small></div>
                  <div className="requirement-skill current">Tableau<small>(Advanced)</small></div>
                  <div className="requirement-skill current">Machine<br />Learning<small>(Intermediate)</small></div>
                </div>
                <div className="requirement-connectors" aria-hidden="true">
                  <i /><i /><i /><i /><i />
                </div>
                <div className="requirement-column target">
                  <h4>Target Role:<br />Senior Data<br />Analyst</h4>
                  <div className="requirement-skill target-current">Python<small>(Expert)</small></div>
                  <div className="requirement-skill target-current">SQL<small>(Expert)</small></div>
                  <div className="requirement-skill target-missing">AWS<small>(Required)</small></div>
                  <div className="requirement-skill target-missing">Cloud Computing<small>(Required)</small></div>
                  <div className="requirement-skill target-missing">Big Data<small>(Required)</small></div>
                  <div className="requirement-skill target-preferred">Docker<small>(Preferred)</small></div>
                  <div className="requirement-skill target-preferred">Kubernetes<small>(Preferred)</small></div>
                </div>
              </div>
            </section>
          </div>
        </section>
      </div>

      <aside className="career-recommendations-column">
        <section className="career-recommendations career-panel">
          <header className="career-panel-heading"><h2>Recommended Skills to Add</h2></header>
          <div className="career-card-content">
            <h3 className="career-small-title">Prioritized Skill Suggestions</h3>
            <div className="recommendation-list">
              {recommendations.map((item, index) => {
                const added = addedSkills.includes(item.name);
                return (
                  <article className="recommendation-item" key={item.name}>
                    <div className="recommendation-top">
                      <div><h3>{index + 1}. {item.name}</h3><span>{item.impact} ({item.score}%)</span></div>
                      <button className={added ? "added-skill-button" : "add-skill-button"} onClick={() => addSkill(item.name)} disabled={added}>{added ? "Added ✓" : "Add to Resume"}</button>
                    </div>
                    <div className="recommendation-links"><a href={`https://www.google.com/search?q=${encodeURIComponent(`${item.name} learning resources`)}`} target="_blank" rel="noreferrer">↗ Learning Resource Link</a><a href={`https://www.google.com/search?q=${encodeURIComponent(`${item.name} free course`)}`} target="_blank" rel="noreferrer">View Courses ↗</a></div>
                  </article>
                );
              })}
            </div>
            {notice && <p className="resume-add-notice" role="status">{notice}</p>}

            <div className="learning-resources">
              <h3>Learning Resources</h3>
              <a href="https://www.google.com/search?q=AWS+Certified+Solutions+Architect+Associate+course" target="_blank" rel="noreferrer">AWS Certified Solutions Architect Associate (Course) <span>↗</span></a>
              <a href="https://www.google.com/search?q=introduction+to+cloud+computing+article" target="_blank" rel="noreferrer">Introduction to Cloud Computing (Article) <span>↗</span></a>
              <a href="https://www.google.com/search?q=big+data+fundamentals+webinar" target="_blank" rel="noreferrer">Big Data Fundamentals (Webinar) <span>↗</span></a>
            </div>
          </div>
        </section>
      </aside>
    </div>
  );
}
