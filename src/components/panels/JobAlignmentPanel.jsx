import { getCareerAlignment } from "../../lib/browserMl";
import Icon from "../ui/Icon";
import MLInsights from "./MLInsights";

export default function JobAlignmentPanel({ me, jobs, alumni, surveyResponses }) {
  const careerAlignment = getCareerAlignment(me);
  const pct = careerAlignment.score;
  const roleTitle = careerAlignment.title;
  const courseName = String(me.program || "").replace(/^BS\s+/i, "").trim() || "your course";
  return (
    <div className="panel-block">
      {(me.jobTitle || me.businessName) && (
        <div className="list-item" style={{ marginBottom: 16 }}>
          <div className="list-item-main">
            <div className="list-item-title">{me.employed === "Self Employed" ? me.businessName : me.jobTitle}</div>
            <div className="list-item-sub">
              {me.employed === "Self Employed" ? "Self-employed" : `Reported role${me.companyName ? ` at ${me.companyName}` : ""}`} · {me.program}
              {me.years && <> · {me.years} yr{me.years === "1" ? "" : "s"}</>}
            </div>
          </div>
          {careerAlignment.category === "direct" && <span className="pill ok"><Icon name="check" size={11} /> {courseName}-related role</span>}
          {careerAlignment.category === "adjacent" && <span className="pill muted">{courseName}-adjacent role</span>}
          {careerAlignment.category === "transferable" && <span className="pill muted">Transferable role</span>}
          {careerAlignment.category === "unrelated" && <span className="pill muted">Other role</span>}
        </div>
      )}
      <div className="bar-row">
        <div className="bar-label">Job alignment</div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="bar-value">
          {!careerAlignment.isEmployed ? "0%" : roleTitle ? `${pct}%` : "—"}
        </div>
      </div>
      <p style={{ fontSize: "0.82rem", color: "#4a4a4a", margin: "10px 0 16px", lineHeight: 1.5 }}>
        {!careerAlignment.isEmployed
          ? `Job alignment is 0% while your current status is ${me.employed || "Unknown"}.`
          : !roleTitle
            ? "Add your current job title to estimate role alignment."
            : `Estimate based on the ${careerAlignment.category} role category and recognized digital skills. These scores are not hiring probabilities.`}
      </p>
      <MLInsights alumni={alumni} jobs={jobs} surveyResponses={surveyResponses} currentAlumnus={me} />
    </div>
  );
}