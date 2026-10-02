import { useState } from "react";
import Icon from "../ui/Icon";
import { EMPLOYMENT_OPTIONS } from "../../lib/constants";

export default function SurveyFormPanel({ me, onSubmit, surveyHistory = [], submitLabel = "Submit survey" }) {
  const [employed, setEmployed] = useState(EMPLOYMENT_OPTIONS.includes(me.employed) ? me.employed : "Unemployed");
  const [jobTitle, setJobTitle] = useState(me.jobTitle || "");
  const [companyName, setCompanyName] = useState(me.companyName || "");
  const [businessName, setBusinessName] = useState(me.businessName || "");
  const [years, setYears] = useState(me.years || "");
  const [skillsText, setSkillsText] = useState(me.skills.join(", "));
  const [done, setDone] = useState(me.surveyCompleted);

  function submit(e) {
    e.preventDefault();
    const skills = skillsText.split(",").map((s) => s.trim()).filter(Boolean);
    onSubmit({
      employed,
      jobTitle: employed === "Employed" ? jobTitle.trim() : "",
      companyName: employed === "Employed" ? companyName.trim() : "",
      businessName: employed === "Self Employed" ? businessName.trim() : "",
      years: employed === "Employed" || employed === "Self Employed" ? years.trim() : "",
      skills,
    });
    setDone(true);
  }

  return (
    <div className="panel-block">
      <form className="panel-form" onSubmit={submit}>
        <label>Current employment status
          <select value={employed} onChange={(e) => setEmployed(e.target.value)}>
            {EMPLOYMENT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </label>

        {employed === "Employed" && (
          <>
            <label>Current job title
              <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Junior Web Developer" required />
            </label>
            <div className="row">
              <label>Company name
                <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Iligan Digital Solutions" required />
              </label>
              <label>Years employed
                <input value={years} onChange={(e) => setYears(e.target.value)} type="number" min="0" step="0.5" placeholder="e.g. 2" required />
              </label>
            </div>
          </>
        )}

        {employed === "Self Employed" && (
          <div className="row">
            <label>Business name
              <input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="e.g. Reyes Web Studio" required />
            </label>
            <label>Years in business
              <input value={years} onChange={(e) => setYears(e.target.value)} type="number" min="0" step="0.5" placeholder="e.g. 3" required />
            </label>
          </div>
        )}

        <label>Skills gained since graduating (comma separated)
          <input value={skillsText} onChange={(e) => setSkillsText(e.target.value)} placeholder="React, SQL, Project Management" />
        </label>
        <button type="submit" className="btn-primary btn-block" style={{ maxWidth: 240 }}>{submitLabel}</button>
        {done && <span className="confirm-badge"><Icon name="check" size={13} /> Survey on file — this feeds AAO's analytics</span>}
      </form>

      <div className="overview-block-title" style={{ marginTop: 24 }}>My survey history</div>
      {surveyHistory.length === 0 ? (
        <p style={{ fontSize: "0.82rem", color: "#6b6b6b", marginTop: 4 }}>
          Your previous survey submissions will appear here.
        </p>
      ) : (
        <div className="list-block" style={{ marginTop: 8 }}>
          {surveyHistory.map((response, index) => (
            <div className="list-item" key={response.id}>
              <div className="list-item-main">
                <div className="list-item-title">
                  {index === 0 ? "Latest response" : `Previous response ${index}`}
                </div>
                <div className="list-item-sub">
                  {response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : "Date unavailable"} · {response.employed}
                  {response.jobTitle ? ` · ${response.jobTitle}` : ""}
                  {response.companyName ? ` at ${response.companyName}` : ""}
                  {response.businessName ? ` · ${response.businessName}` : ""}
                </div>
              </div>
              <div className="chip-row">
                {response.skills.map((skill) => <span className="chip" key={`${response.id}-${skill}`}>{skill}</span>)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}