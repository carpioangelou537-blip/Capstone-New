import { getCareerAlignment, mergeLatestSurveyResponses } from "../../lib/browserMl";
import Icon from "../ui/Icon";

export default function JobAlignmentPanel({ me, surveyResponses }) {
  const profile = mergeLatestSurveyResponses([me], surveyResponses)[0] || me;
  const careerAlignment = getCareerAlignment(profile);
  const pct = careerAlignment.score;
  const roleTitle = careerAlignment.title;
  const courseName = String(profile.program || "").replace(/^BS\s+/i, "").trim();
  const roleName = profile.employed === "Self Employed"
    ? profile.businessName
    : profile.jobTitle;
  const categoryLabel = {
    direct: courseName || "Direct IT role",
    adjacent: "IT-adjacent role",
    transferable: "Transferable role",
    unrelated: "Other role",
  }[careerAlignment.category];

  return (
    <div className="panel-block">
      <div className="overview-block-title">Your job alignment</div>
      <p className="list-item-sub" style={{ margin: "0 0 14px", lineHeight: 1.5 }}>
        A personal estimate based on your reported role and digital skills. Only your profile is included.
      </p>

      <section
        aria-label="Your job alignment score and profile"
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 24,
          padding: 20,
          border: "1px solid #e6e1df",
          borderRadius: 14,
          background: "#fff",
        }}
      >
        <div
          role="img"
          aria-label={`Your job alignment score is ${pct}%`}
          style={{
            width: 164,
            height: 164,
            flex: "0 0 164px",
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            background: `conic-gradient(#5c0f1a ${pct * 3.6}deg, #eee8e6 0deg)`,
          }}
        >
          <div
            style={{
              width: 128,
              height: 128,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              background: "#fff",
            }}
          >
            <strong style={{ color: "#3a0a11", fontSize: "2rem", lineHeight: 1.1 }}>{pct}%</strong>
            <span style={{ marginTop: 4, color: "#6b6b6b", fontSize: "0.75rem" }}>alignment</span>
          </div>
        </div>

        <div style={{ flex: "1 1 220px" }}>
          <div className="list-item-sub" style={{ marginBottom: 4 }}>Your current role</div>
          <div className="list-item-title" style={{ marginBottom: 6 }}>
            {roleName || "No current role/title"}
          </div>
          <div className="list-item-sub">
            {profile.employed || "Employment status not provided"}
            {profile.companyName && profile.employed !== "Self Employed" ? ` · ${profile.companyName}` : ""}
            {profile.program ? ` · ${profile.program}` : ""}
            {profile.years ? ` · ${profile.years} yr${profile.years === "1" ? "" : "s"}` : ""}
          </div>
          {categoryLabel && (
            <div style={{ marginTop: 12 }}>
              {careerAlignment.category === "direct" ? (
                <span className="pill ok"><Icon name="check" size={11} /> {categoryLabel}</span>
              ) : (
                <span className="pill muted">{categoryLabel}</span>
              )}
            </div>
          )}
          <p style={{ fontSize: "0.82rem", color: "#4a4a4a", marginTop: 12, lineHeight: 1.5 }}>
            {!careerAlignment.isEmployed
              ? `Your score is 0% because your current status is ${profile.employed || "Unknown"}.`
              : !roleTitle
                ? "Add your current job title to estimate role alignment."
                : `Estimate based on the ${careerAlignment.category} role category and recognized digital skills. This is not a hiring probability.`}
          </p>
        </div>
      </section>
    </div>
  );
}
