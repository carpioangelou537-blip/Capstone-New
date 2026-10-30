import Icon from "../ui/Icon";

export function PendingVerificationPage({ onLogout }) {
  return (
    <div className="status-page">
      <div className="status-card">
        <div className="status-icon pending"><Icon name="clock" size={30} /></div>
        <h2>Your account is under review</h2>
        <p><strong>Thanks for registering.</strong> The Alumni Affairs Office will review your account before granting access to the Alumni Survey and other restricted features.</p>
        <p style={{ fontSize: "0.8rem" }}>
          We’ll contact you by email once your account is approved. Please sign out and sign in again after receiving our message.
        </p>
        <div className="status-actions">
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