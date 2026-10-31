import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";

const ACTION_LABELS = {
  approved_alumnus: { icon: "check", label: "Approved alumnus" },
  rejected_alumnus: { icon: "x", label: "Rejected alumnus" },
  added_alumnus: { icon: "plus", label: "Added alumnus" },
  removed_alumnus: { icon: "trash", label: "Removed alumnus" },
  published_job: { icon: "brief", label: "Published job posting" },
  removed_job: { icon: "trash", label: "Removed job posting" },
  published_event: { icon: "calendar", label: "Published event" },
  removed_event: { icon: "trash", label: "Removed event" },
  sent_notification: { icon: "bell", label: "Sent notification" },
};

export default function AdminActivityLogsPanel({ adminActivityLogs, alumni }) {
  const byUserId = (id) => alumni.find((a) => a.userId === id);
  return (
    <div className="panel-block">
      <div className="access-check-row">
        <div className="access-check-item">
          <Icon name="clock" size={16} />
          <span>Every verification and moderation action is written to the activity log with a timestamp.</span>
        </div>
        <div className="access-check-stat">
          <b>{adminActivityLogs.length}</b>
          <span>logged action{adminActivityLogs.length === 1 ? "" : "s"}</span>
        </div>
      </div>
      <div className="list-block" style={{ marginTop: 18 }}>
        {adminActivityLogs.length === 0 && (
          <EmptyState icon="clock" text="No admin activity recorded yet. Approvals, rejections, and postings will be logged here." />
        )}
        {adminActivityLogs.map((log) => {
          const meta = ACTION_LABELS[log.action] || { icon: "arrow", label: log.action };
          const adminName = byUserId(log.adminUserId)?.name;
          return (
            <div className="list-item" key={log.id}>
              <div className="list-item-main">
                <div className="list-item-title">
                  <Icon name={meta.icon} size={13} style={{ verticalAlign: "-2px", marginRight: 6 }} />
                  {meta.label} {log.detail && <span style={{ color: "#4a4a4a" }}>— {log.detail}</span>}
                </div>
                <div className="list-item-sub">
                  {log.createdAt || "—"} {adminName ? `· by ${adminName}` : ""}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}