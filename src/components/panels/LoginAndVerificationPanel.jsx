import Icon from "../ui/Icon";
import EmptyState from "../ui/EmptyState";
import { VerifyPill } from "../ui/Pills";

export default function LoginAndVerificationPanel({
  alumni,
  onApprove,
  onReject,
}) {
  const pending = alumni.filter((a) => a.verificationStatus === "pending");
  const verified = alumni.filter((a) => a.verificationStatus === "verified").length;
  const reviewed = alumni.filter((a) => a.verificationStatus !== "pending");

  return (
    <div className="panel-block">
      <div className="access-check-row">
        <div className="access-check-item">
          <Icon name="key" size={16} />
          <span>The Alumni Affairs Office reviews new registrations. When an account is approved, an email is sent to the alumnus so they know they can sign in.</span>
        </div>
        <div className="access-check-stat">
          <b>{verified}</b>
          <span>verified account{verified === 1 ? "" : "s"} can sign in</span>
        </div>
      </div>

      <div className="overview-block-title" style={{ marginTop: 4 }}>
        Pending review ({pending.length})
      </div>
      <div className="list-block" style={{ marginBottom: 22 }}>
        {pending.length === 0 && <EmptyState icon="shield" text="No alumni waiting for verification — every registration has been reviewed." />}
        {pending.map((a) => (
          <div className="list-item" key={a.id}>
            <div className="list-item-main">
              <div className="list-item-title">
                {a.name}{a.isSelf ? " (You)" : ""}
                {a.userId && <span className="pill muted" style={{ marginLeft: 8 }}>Online account</span>}
              </div>
              <div className="list-item-sub">{a.program} · Class of {a.gradYear}</div>
            </div>
            <div className="list-item-actions">
              <button className="btn-ghost" onClick={() => onApprove(a.id)}>
                <Icon name="check" size={14} /> Approve
              </button>
              <button className="btn-danger" onClick={() => onReject(a.id)} aria-label={`Reject ${a.name}`}>
                <Icon name="x" size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="overview-block-title">Reviewed accounts</div>
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Program</th><th>Year</th><th>Status</th></tr></thead>
          <tbody>
            {reviewed.map((a) => (
              <tr key={a.id}>
                <td data-label="Name">
                  {a.name}{a.isSelf ? " (You)" : ""}{" "}
                  {a.userId && <span className="pill muted" style={{ marginLeft: 6, fontSize: "0.65rem", padding: "2px 8px" }}>online</span>}
                </td>
                <td data-label="Program">{a.program}</td>
                <td data-label="Year">{a.gradYear}</td>
                <td data-label="Status"><VerifyPill status={a.verificationStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}