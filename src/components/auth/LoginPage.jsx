import { useState } from "react";
import AuthShell from "../layout/AuthShell";
import Icon from "../ui/Icon";

export default function LoginPage({ onSubmit, error, goSignup, goHome }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit(email.trim(), password);
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell onBack={goHome}>
      <div className="auth-card">
        <h2>Login</h2>

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
          <label className="field">
            <span>Email address</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@spc.edu.ph"
              autoComplete="email"
              required
            />
          </label>
          <label className="field">
            <span>Password</span>
            <div className="pw-wrap">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="pw-toggle"
                onClick={() => setShowPw((s) => !s)}
                aria-label="Toggle password visibility"
              >
                <Icon name="eye" size={18} />
              </button>
            </div>
          </label>
          <div className="field-row">
            <label className="checkbox"><input type="checkbox" /> <span>Remember me</span></label>
            <a href="#" className="text-link" onClick={(e) => e.preventDefault()}>Forgot password?</a>
          </div>
          <button type="submit" className="btn-primary btn-block" disabled={busy}>
            {busy ? "Signing in…" : (<><span>Sign in</span> <Icon name="arrow" size={16} /></>)}
          </button>
        </form>

        <p className="switch-line">New here? <button className="text-link" onClick={goSignup}>Create an account</button></p>
      </div>
    </AuthShell>
  );
}