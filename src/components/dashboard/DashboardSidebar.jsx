import Icon from "../ui/Icon";
import BrandLogo from "../ui/BrandLogo";

export default function DashboardSidebar({
  role,
  me,
  features,
  active,
  onSelect,
  getBadge,
  surveyLocked,
  onLogout,
}) {
  return (
    <aside className="dash-sidebar">
      <div className="dash-crest">
        <div className="crest small">
          {me?.avatar && role === "alumni" ? (
            <img src={me.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <BrandLogo />
          )}
        </div>
        <div>
          <p className="dash-brand">Alumni Tracer</p>
          <p className="dash-role">{role === "admin" ? "Administrator" : "Alumnus"}</p>
        </div>
      </div>

      <nav className="dash-nav">
        {features.map((f, i) => {
          const badge = getBadge(f.title);
          return (
            <button
              key={f.title}
              className={`dash-nav-item ${active === f.title ? "active" : ""}`}
              style={{ "--i": i }}
              onClick={() => onSelect(f.title)}
              disabled={surveyLocked && f.title !== "Complete the Alumni Survey"}
            >
              <Icon name={f.icon} size={18} />
              <span className="nav-label">{f.title}</span>
              {badge !== null && badge !== undefined && badge !== 0 && <span className="nav-badge">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <button className="dash-logout" onClick={onLogout}>
        <Icon name="logout" size={18} /> <span>Sign out</span>
      </button>
    </aside>
  );
}