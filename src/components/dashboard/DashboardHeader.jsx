import Icon from "../ui/Icon";
import NotificationDropdown from "./NotificationDropdown";

export default function DashboardHeader({
  role,
  name,
  me,
  notifications,
  notifOpen,
  onToggleNotif,
  surveyLocked,
  onGoto,
  onCloseNotif,
  onOpenProfile,
}) {
  return (
    <header className="dash-header">
      <div>
        <p className="eyebrow" style={{ color: "var(--maroon)" }}>
          Good day, {name || me?.name || (role === "admin" ? "Administrator" : "Alumnus")}
        </p>
        <h1>{role === "admin" ? "Alumni Affairs Office Dashboard" : "My Alumni Dashboard"}</h1>
      </div>
      <div className="dash-header-actions">
        {role === "alumni" && (
          <div className="notif-wrap">
            <button
              className={`dash-profile-action ${notifOpen ? "active" : ""}`}
              onClick={onToggleNotif}
              disabled={surveyLocked}
              style={{ position: "relative" }}
            >
              <Icon name="bell" size={18} />
              <span>Notifications</span>
              {notifications.length > 0 && <span className="ping-dot" />}
            </button>
            {notifOpen && (
              <NotificationDropdown
                notifications={notifications}
                onGoto={onGoto}
                onClose={onCloseNotif}
              />
            )}
          </div>
        )}
        <button
          className="dash-avatar"
          onClick={() => role === "alumni" && onOpenProfile()}
          aria-label={role === "alumni" ? "Open profile and settings" : "Account"}
          style={{ cursor: role === "alumni" ? "pointer" : "default" }}
        >
          {role === "alumni" && me?.avatar ? (
            <img src={me.avatar} alt="" />
          ) : (
            (name || me?.name || "U").slice(0, 1).toUpperCase()
          )}
        </button>
      </div>
    </header>
  );
}