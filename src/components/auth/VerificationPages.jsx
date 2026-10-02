import Icon from "../ui/Icon";

export function PendingVerificationPage({ onRefresh, onLogout, autoCheck }) {
  return (
    <div className="status-page">
      <div className="status-card">
        <div className="status-icon pending"><Icon name="clock" size={30} /></div>
        <h2>Your account is pending verification.</h2>
        <p>An administrator needs to verify your account before you can access the Alumni Survey and other restricted features.</p>
        <p style={{ fontSize: "0.8rem" }}>
          You're fully signed in — the moment the Alumni Affairs Office approves your account, this page will
          automatically let you into the dashboard and open the alumni survey for you to complete.
          {autoCheck ? " Still waiting… we'll keep checking." : " Checking every few seconds…"}
        </p>
        <div className="status-actions">
          <button className="btn-ghost" style={{ color: "var(--maroon-deep)" }} onClick={onRefresh}>
            <Icon name="arrow" size={14} /> Check verification status
          </button>
          <button className="text-link" onClick={onLogout}>Sign out</button>
        </div>
      </div>
    </div>
  );
}

export function RejectedVerificationPage({ onLogout }) {
  return (
    <div className="status-page">
      <div className="status-card">
        <div className="status-icon rejected"><Icon name="x" size={26} /></div>
        <h2>Your registration was not approved.</h2>
        <p>The Alumni Affairs Office was unable to verify the details on your account, so access to the Alumni Survey and dashboard remains restricted.</p>
        <p style={{ fontSize: "0.8rem" }}>If you believe this is a mistake, please reach out to the Alumni Affairs Office directly.</p>
        <div className="status-actions">
          <button className="btn-ghost" style={{ color: "var(--maroon-deep)" }} onClick={onLogout}>
            <Icon name="logout" size={14} /> Sign out
          </button>
        </div>
      </div>
    </div>
  );
}