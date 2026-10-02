import { isJobRelatedToCourse } from "../../lib/utils";
import { getSkillGaps } from "../../lib/utils";
import Icon from "../ui/Icon";
import EmptyState from "../ui/EmptyState";

export default function JobAlignmentPanel({ me, jobs, recommendations }) {
  const scored = jobs.map((j) => ({
    ...j,
    overlap: j.skills.filter((s) => me.skills.some((ms) => ms.toLowerCase() === s.toLowerCase())),
  }));
  const overlapping = scored.filter((j) => j.overlap.length > 0).sort((a, b) => b.overlap.length - a.overlap.length);
  const pct = scored.length ? Math.round((overlapping.length / scored.length) * 100) : 0;
  const related = me.employed === "Employed" ? isJobRelatedToCourse(me.jobTitle) : null;
  const gaps = getSkillGaps(me, jobs);

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
          {related === true && <span className="pill ok"><Icon name="check" size={11} /> Related to your course</span>}
          {related === false && <span className="pill muted">Outside your course field</span>}
        </div>
      )}
      {me.employed === "Unemployed" && (
        <p style={{ fontSize: "0.82rem", color: "#8a3b1d", margin: "0 0 12px", lineHeight: 1.5 }}>
          You're marked as currently <strong>unemployed</strong> — this shows how many open postings you
          could apply to right now, so it starts from your skills rather than a current role.
        </p>
      )}
      <div className="bar-row">
        <div className="bar-label">Market alignment</div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="bar-value">{pct}%</div>
      </div>
      <p style={{ fontSize: "0.82rem", color: "#4a4a4a", margin: "10px 0 16px", lineHeight: 1.5 }}>
        Share of currently open postings whose skills overlap at least one of your reported skills — a
        100% would mean you could apply to every posting, not that a role matches perfectly.
      </p>
      <div className="list-block">
        {overlapping.length === 0 && <EmptyState icon="brief" text="No overlapping postings right now — your skill set is ahead of current listings." />}
        {overlapping.map((j) => (
          <div className="list-item" key={j.id}>
            <div className="list-item-main">
              <div className="list-item-title">{j.title}</div>
              <div className="list-item-sub">{j.company}</div>
              <div className="chip-row" style={{ marginTop: 6 }}>
                {j.skills.map((s) => <span className={`chip ${j.overlap.includes(s) ? "match" : ""}`} key={s}>{s}</span>)}
              </div>
              {j.link && (
                <a href={j.link} target="_blank" rel="noopener noreferrer" className="notif-goto" style={{ marginTop: 8, display: "inline-flex" }}>
                  <Icon name="arrow" size={12} /> Visit posting
                </a>
              )}
            </div>
            <span className="pill ok">{j.overlap.length} skill match{j.overlap.length === 1 ? "" : "es"}</span>
          </div>
        ))}
      </div>
      {gaps.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="list-item-sub" style={{ marginBottom: 10 }}>Recommended skills to learn</div>
          <div className="chip-row">
            {gaps.slice(0, 6).map((g) => (
              <span className="chip match" key={g.skill}>
                {g.skill} <span style={{ opacity: 0.65 }}>· {g.demand} posting{g.demand === 1 ? "" : "s"}</span>
              </span>
            ))}
          </div>
        </div>
      )}
      {recommendations && recommendations.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div className="list-item-sub" style={{ marginBottom: 10 }}>Your course recommendations</div>
          <div className="list-block">
            {recommendations.map((r) => (
              <div className="list-item" key={r.id}>
                <div className="list-item-main">
                  <div className="list-item-title">{r.skill || "—"}</div>
                  {r.reason && <div className="list-item-sub">{r.reason}</div>}
                </div>
                {r.demand > 0 && <span className="pill ok">{r.demand} posting{r.demand === 1 ? "" : "s"}</span>}
              </div>
            ))}
          </div>
          <p style={{ fontSize: "0.78rem", color: "#8a8a8a", marginTop: 8 }}>
            Stored with your latest survey response so they stay consistent even as new postings arrive.
          </p>
        </div>
      )}
    </div>
  );
}