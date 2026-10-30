import { useState } from "react";
import AuthShell from "../layout/AuthShell";
import Icon from "../ui/Icon";

export function ForgotPasswordPage({ onSubmit, error, goLogin, goHome }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      setSent(await onSubmit(email.trim()));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell onBack={goHome}>
      <div className="auth-card">
        <h2>Forgot password?</h2>
        <p style={{ fontSize: "0.84rem", color: "#5f6368", lineHeight: 1.5, marginBottom: 18 }}>
          Enter your account email and we’ll send you a secure link to choose a new password.
        </p>
        {error && <div role="alert" className="auth-error">{error}</div>}
        {sent ? (
          <div role="status" className="auth-success">
            If an account exists for that email, a password recovery link will arrive shortly. Check your inbox and spam folder.
          </div>
        ) : (
          <form onSubmit={submit} className="auth-form">
            <label className="field">
              <span>Email address</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@spc.edu.ph"
                autoComplete="email"
                required
              />
            </label>
            <button type="submit" className="btn-primary btn-block" disabled={busy}>
              {busy ? "Sending…" : "Send recovery link"}
            </button>
          </form>
        )}
        <p className="switch-line">
          Remembered it? <button className="text-link" onClick={goLogin}>Sign in</button>
        </p>
      </div>
    </AuthShell>
  );
}

export function UpdatePasswordPage({ onSubmit, error }) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [validationError, setValidationError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setValidationError("");
    if (password.length < 6) {
      setValidationError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      await onSubmit(password);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="auth-card">
        <h2>Choose a new password</h2>
        <p style={{ fontSize: "0.84rem", color: "#5f6368", lineHeight: 1.5, marginBottom: 18 }}>
          Set a new password for your Alumni Tracer account.
        </p>
        {(validationError || error) && <div role="alert" className="auth-error">{validationError || error}</div>}
        <form onSubmit={submit} className="auth-form">
          <label className="field">
            <span>New password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
              minLength={6}
              required
            />
          </label>
          <button type="submit" className="btn-primary btn-block" disabled={busy}>
            {busy ? "Updating…" : (<><span>Update password</span> <Icon name="arrow" size={16} /></>)}
          </button>
        </form>
      </div>
    </AuthShell>
  );
}
