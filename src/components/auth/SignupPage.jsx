import { useState } from "react";
import AuthShell from "../layout/AuthShell";
import Icon from "../ui/Icon";
import Modal from "../ui/Modal";
import { PROGRAM_OPTIONS, YEAR_OPTIONS } from "../../lib/constants";

export default function SignupPage({ onSubmit, error, goLogin, goHome }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [program, setProgram] = useState(PROGRAM_OPTIONS[0]);
  const [gradYear, setGradYear] = useState(YEAR_OPTIONS[0]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [consentModal, setConsentModal] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        program,
        gradYear,
        email: email.trim(),
        password,
        confirmPassword,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell onBack={goHome}>
      <div className="auth-card">
        <h2>Sign Up</h2>

        {error && (
          <div
            role="alert"
            style={{
              background: "rgba(92,15,26,0.08)",
              color: "var(--maroon-bright)",
              border: "1px solid rgba(92,15,26,0.25)",
              borderRadius: 8,
              padding: "5px 14px",
              fontSize: "0.8rem",
              marginBottom: 14,
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={submit} className="auth-form">
          <div className="field-pair">
            <label className="field">
              <span>First name</span>
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} type="text" placeholder="Juan" autoComplete="given-name" required />
            </label>
            <label className="field">
              <span>Last name</span>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} type="text" placeholder="Dela Cruz" autoComplete="family-name" required />
            </label>
          </div>

          <div className="field-pair">
            <label className="field">
              <span>Program</span>
              <select value={program} onChange={(e) => setProgram(e.target.value)} required>
                {PROGRAM_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Year graduated</span>
              <select value={gradYear} onChange={(e) => setGradYear(e.target.value)} required>
                {YEAR_OPTIONS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </label>
          </div>

          <label className="field"><span>Email address</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@spc.edu.ph" autoComplete="email" required /></label>

          <div className="field-pair">
            <label className="field"><span>Password</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" autoComplete="new-password" required /></label>
            <label className="field"><span>Confirm password</span><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" autoComplete="new-password" required /></label>
          </div>

          <div className="consent-field">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={privacyAccepted}
                required
                onChange={(event) => {
                  if (event.target.checked) setConsentModal("privacy");
                  else setPrivacyAccepted(false);
                }}
              />
              <span>I agree to the data privacy terms of the Alumni Affairs Office</span>
            </label>
            <div className="consent-links">
              <button type="button" className="text-link" onClick={() => setConsentModal("privacy")}>Privacy Policy</button>
              <span aria-hidden="true">·</span>
              <button type="button" className="text-link" onClick={() => setConsentModal("terms")}>Terms and Conditions</button>
            </div>
          </div>

          <p style={{ fontSize: "0.76rem", color: "#6b6b6b", lineHeight: 1.5, margin: 0 }}>
            An administrator will need to verify your account before you can access the Alumni Survey and other restricted features.
          </p>

          <button type="submit" className="btn-primary btn-block" disabled={busy}>
            {busy ? "Creating account…" : (<><span>Create account</span> <Icon name="arrow" size={16} /></>)}
          </button>
        </form>

        <p className="switch-line">Already registered? <button className="text-link" onClick={goLogin}>Sign in</button></p>
      </div>
      {consentModal && (
        <Modal
          title={consentModal === "privacy" ? "Privacy Policy" : "Terms and Conditions"}
          subtitle="Alumni Affairs Office · Account registration"
          onClose={() => setConsentModal(null)}
        >
          <div className="consent-tabs" role="tablist" aria-label="Consent documents">
            <button type="button" role="tab" aria-selected={consentModal === "privacy"} className={consentModal === "privacy" ? "active" : ""} onClick={() => setConsentModal("privacy")}>Privacy Policy</button>
            <button type="button" role="tab" aria-selected={consentModal === "terms"} className={consentModal === "terms" ? "active" : ""} onClick={() => setConsentModal("terms")}>Terms and Conditions</button>
          </div>
          <div className="consent-content" role="tabpanel">
            {consentModal === "privacy" ? (
              <>
                <h4>How your information is used</h4>
                <p>The Alumni Affairs Office uses the information you provide to create and verify your alumni account, maintain alumni records, and provide alumni services and communications.</p>
                <h4>Information and access</h4>
                <p>Your profile and survey responses are available to authorized administrators for alumni record management and reporting. Information is not intended for public display through this service.</p>
                <h4>Your choices</h4>
                <p>Provide accurate information and contact the Alumni Affairs Office to request access to or correction of your account information, or to ask questions about its handling.</p>
              </>
            ) : (
              <>
                <h4>Using your account</h4>
                <p>You agree to provide accurate registration details, keep your sign-in credentials private, and use the service only for its intended alumni-related purposes.</p>
                <h4>Account verification</h4>
                <p>Account access to restricted features may require administrator verification. The Alumni Affairs Office may restrict access when account information is inaccurate or the service is misused.</p>
                <h4>Your agreement</h4>
                <p>You may review these terms before continuing. You can close this window without accepting; acceptance is required to create an account.</p>
              </>
            )}
          </div>
          <div className="consent-actions">
            <button type="button" className="btn-ghost" onClick={() => setConsentModal(null)}>Cancel</button>
            <button
              type="button"
              className="btn-primary"
              onClick={() => { setPrivacyAccepted(true); setConsentModal(null); }}
            >
              Agree and continue
            </button>
          </div>
        </Modal>
      )}
    </AuthShell>
  );
}