import Icon from "../ui/Icon";
import EmptyState from "../ui/EmptyState";

export function AdminDashboardOverview({ alumni, jobs, events, notifications, onNavigate }) {
  const pendingVerifications = alumni.filter((a) => a.verificationStatus === "pending").length;

  const updates = [
    ...notifications.map((n) => ({ id: n.id, text: n.text, date: n.date, icon: "bell", target: "Manage Notifications" })),
    ...jobs.map((j) => ({ id: `job-${j.id}`, text: `New posting: ${j.title} at ${j.company}`, date: null, icon: "brief", target: "Career Tools & Job Postings" })),
    ...events.map((e) => ({ id: `ev-${e.id}`, text: `Upcoming: ${e.title}`, date: e.date, icon: "calendar", target: "Manage Event Posting" })),
  ].sort((a, b) => (a.date && b.date ? (a.date < b.date ? 1 : -1) : 0));

  return (
    <div className="panel-block">
      {pendingVerifications > 0 && (
        <div className="lock-banner">
          <Icon name="shield" size={18} />
          <span>{pendingVerifications} alumni {pendingVerifications === 1 ? "registration is" : "registrations are"} waiting for verification.</span>
          <button type="button" className="notif-goto" style={{ marginLeft: "auto" }} onClick={() => onNavigate("Login & Verification")}>
            Review now <Icon name="arrow" size={12} />
          </button>
        </div>
      )}

      <div className="overview-block-title">Latest updates</div>
      <div className="list-block">
        {updates.length === 0 && <EmptyState icon="bell" text="No announcements, postings, or events yet — anything you publish will show up here first." />}
        {updates.slice(0, 5).map((n) => (
          <div className="list-item" key={n.id}>
            <div className="list-item-main">
              <div className="list-item-title" style={{ fontWeight: 500 }}>{n.text}</div>
              <div className="list-item-sub">{n.date || "Just posted"}</div>
            </div>
            <button type="button" className="notif-goto" onClick={() => onNavigate(n.target)}>
              Go to {n.target} <Icon name="arrow" size={12} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AlumniDashboardOverview({ me, jobs, events, notifications, onNavigate }) {
  const matchedJobs = jobs.filter((j) => j.skills.some((s) => me.skills.some((ms) => ms.toLowerCase() === s.toLowerCase()))).length;
  const uniqueMatchedSkills = [...new Set(me.skills.filter((skill) =>
    jobs.some((j) => j.skills.some((s) => s.toLowerCase() === skill.toLowerCase()))
  ))];
  const alignmentPct = me.skills.length ? Math.round((uniqueMatchedSkills.length / me.skills.length) * 100) : 0;
  const updates = [
    ...notifications.map((n) => ({ id: n.id, text: n.text, date: n.date, target: n.target })),
    ...events.map((e) => ({ id: `ev-${e.id}`, text: `Upcoming: ${e.title}`, date: e.date, target: "Events & Activities" })),
  ].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <div className="panel-block">
      {!me.surveyCompleted && (
        <div className="lock-banner">
          <Icon name="doc" size={18} />
          <span>You haven't completed your alumni survey yet — finish it to unlock job matches and analytics.</span>
        </div>
      )}

      <div className="overview-block-title">Latest updates</div>
      <div className="list-block" style={{ marginBottom: 22 }}>
        {updates.length === 0 && <EmptyState icon="bell" text="No announcements, postings, or events yet." />}
        {updates.slice(0, 4).map((n) => (
          <div className="list-item" key={n.id}>
            <div className="list-item-main">
              <div className="list-item-title" style={{ fontWeight: 500 }}>{n.text}</div>
              <div className="list-item-sub">{n.date}</div>
            </div>
            {n.target && (
              <button type="button" className="notif-goto" onClick={() => onNavigate(n.target)}>
                Go to {n.target} <Icon name="arrow" size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="overview-block-title">Career tools</div>
      <div className="overview-grid" style={{ marginBottom: 22 }}>
        <button type="button" className="overview-link" onClick={() => onNavigate("Career Tools")}>
          <span className="overview-link-title"><Icon name="brief" size={15} /> Career Tools</span>
          <span className="overview-link-sub">{jobs.length} open posting{jobs.length === 1 ? "" : "s"}</span>
        </button>
        <button type="button" className="overview-link" onClick={() => onNavigate("Job Alignment")}>
          <span className="overview-link-title"><Icon name="chart" size={15} /> Job Alignment</span>
          <span className="overview-link-sub">{matchedJobs} matched posting{matchedJobs === 1 ? "" : "s"}</span>
        </button>
        <button type="button" className="overview-link" onClick={() => onNavigate("Events & Activities")}>
          <span className="overview-link-title"><Icon name="calendar" size={15} /> Events &amp; Activities</span>
          <span className="overview-link-sub">{events.length} upcoming</span>
        </button>
      </div>

      <div className="overview-block-title">Alignment analytics</div>
      <div className="bar-row">
        <div className="bar-label">Skill alignment</div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${alignmentPct}%` }} /></div>
        <div className="bar-value">{alignmentPct}%</div>
      </div>
      <button type="button" className="notif-goto" onClick={() => onNavigate("Job Alignment")}>
        See full breakdown <Icon name="arrow" size={12} />
      </button>
    </div>
  );
}