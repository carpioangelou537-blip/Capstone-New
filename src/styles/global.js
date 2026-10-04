export const STYLES = `

@import url("https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500&display=swap");

:root {
  --black: #0b0a0a;
  --near-black: #1a1414;
  --maroon: #5c0f1a;
  --maroon-deep: #3a0a11;
  --maroon-bright: #8b1e3f;
  --gold: var(--white);
  --white: #ffffff;
  --off-white: #f4f0ee;

  /* Semantic design tokens — one source of truth for every page */
  --color-primary: var(--maroon);
  --color-primary-strong: var(--maroon-deep);
  --color-secondary: var(--black);
  --color-accent: var(--maroon-bright);
  --color-bg: var(--off-white);
  --color-surface: var(--white);
  --color-text: var(--black);
  --color-muted: #6b6b6b;
  --color-border: rgba(11, 10, 10, 0.08);
  --color-success: var(--maroon-bright);
  --color-warning: var(--maroon-bright);
  --color-error: #a33333;

  --font-display: "Playfair Display", Georgia, serif;
  --font-body: "Inter", -apple-system, sans-serif;
  --font-mono: "IBM Plex Mono", monospace;

  --radius: 14px;
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --shadow-container: 0 16px 28px -18px rgba(11, 10, 10, 0.48);
}

* { box-sizing: border-box; }

html, body, #root, .tracer-root {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100%;
  overflow-x: hidden;
}

.tracer-root, .tracer-root * { margin: 0; padding: 0; }

.tracer-root {
  font-family: var(--font-body);
  color: var(--color-text);
  background: var(--color-bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.tracer-root button, .tracer-root input, .tracer-root select, .tracer-root textarea {
  font-family: inherit;
}

.tracer-root a { color: inherit; }

.icon-check, .icon-x, .icon-arrow {
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

@media (prefers-reduced-motion: reduce) {
  .tracer-root *, .tracer-root *::before, .tracer-root *::after {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
  }
}

/* ---------------------------------------------------------------- */
/*  Splash / loading screen                                            */
/* ---------------------------------------------------------------- */

.splash-screen {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  animation: fadeIn 0.25s var(--ease) both;
}
.splash-logo-wrap { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.splash-loading-text {
  font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.16em; text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7); animation: fadeUp 0.6s var(--ease) both; animation-delay: 0.15s;
}

/* ---------------------------------------------------------------- */
/*  Auth shell — plain, no decoration                                  */
/* ---------------------------------------------------------------- */

.auth-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: clamp(20px, 4vw, 30px);
  padding: clamp(28px, 6vw, 48px) clamp(14px, 4vw, 20px) clamp(40px, 8vw, 64px);
  background: var(--color-primary);
}

.auth-back {
  align-self: flex-start;
  display: inline-flex; align-items: center; gap: 6px;
  border: none; background: rgba(255,255,255,0.1); color: var(--white);
  font-size: 0.78rem; font-weight: 600; padding: 7px 12px; border-radius: 999px; cursor: pointer;
  transition: background 0.2s var(--ease);
}
.auth-back:hover { background: rgba(255,255,255,0.2); }

.auth-logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  animation: fadeUp 0.5s var(--ease) both;
}

.auth-card-wrap { position: relative; width: 100%; display: flex; justify-content: center; }

.auth-card {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: var(--radius);
  padding: clamp(22px, 5vw, 36px) clamp(18px, 5vw, 34px) 30px;
  box-shadow: 0 30px 60px -20px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(139, 30, 63, 0.15);
  animation: cardIn 0.6s var(--ease) both;
  animation-delay: 0.1s;
}

@keyframes cardIn { from { opacity: 0; transform: translateY(24px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes popIn { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: scale(1); } }
@keyframes bgShift { 0%, 100% { background-position: 0% 0%; } 50% { background-position: 60% 40%; } }
@keyframes floatY { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

.auth-card h2 { font-family: var(--font-display); font-size: clamp(1.3rem, 4vw, 1.6rem); margin: 6px 0 18px; }

.role-toggle { display: flex; background: var(--color-bg); border-radius: 999px; padding: 4px; gap: 4px; margin-bottom: 22px; }
.role-tab {
  flex: 1; border: none; background: transparent; padding: 9px 10px; border-radius: 999px;
  font-weight: 600; font-size: 0.83rem; color: #6b6b6b; cursor: pointer;
  transition: background 0.3s var(--ease), color 0.3s var(--ease), transform 0.2s var(--ease);
}
.role-tab.active { background: var(--color-primary); color: var(--white); box-shadow: 0 6px 14px -6px rgba(92, 15, 26, 0.6); }
.role-tab:not(.active):hover { color: var(--color-primary); transform: translateY(-1px); }

.auth-form { display: flex; flex-direction: column; gap: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; font-size: 0.82rem; font-weight: 600; color: var(--color-text); }
.field-pair { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

.field input, .field select, .field textarea {
  border: 1.5px solid #e2dede; border-radius: 9px; padding: 11px 13px; font-size: 0.92rem;
  color: var(--color-text); background: var(--color-bg);
  transition: border-color 0.25s var(--ease), box-shadow 0.25s var(--ease), background 0.25s var(--ease);
  width: 100%;
}
.field select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='%235c0f1a'%3E%3Cpath d='M5.5 7.5 10 12l4.5-4.5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 14px; padding-right: 32px; cursor: pointer; }
.field input:focus, .field select:focus, .field textarea:focus {
  outline: none; border-color: var(--color-primary); background: var(--white);
  box-shadow: 0 0 0 4px rgba(92, 15, 26, 0.12);
}

.pw-wrap { position: relative; display: flex; }
.pw-wrap input { flex: 1; padding-right: 40px; }
.pw-toggle {
  position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
  border: none; background: transparent; color: #8a8a8a; cursor: pointer; padding: 4px; border-radius: 6px;
  transition: color 0.2s var(--ease);
}
.pw-toggle:hover { color: var(--color-primary); }

.field-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; flex-wrap: wrap; gap: 8px; }
.checkbox { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; color: #4a4a4a; font-weight: 500; cursor: pointer; }
.checkbox input { accent-color: var(--color-primary); width: 16px; height: 16px; }

.text-link { border: none; background: none; color: var(--color-primary); font-weight: 600; cursor: pointer; padding: 0; position: relative; }
.text-link::after {
  content: ""; position: absolute; left: 0; bottom: -2px; width: 0; height: 1.5px; background: var(--color-primary);
  transition: width 0.25s var(--ease);
}
.text-link:hover::after { width: 100%; }

.btn-primary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: none; border-radius: 10px; padding: 12px 20px;
  background: linear-gradient(135deg, var(--maroon-bright), var(--maroon-deep));
  background-size: 200% 200%;
  color: var(--white); font-weight: 700; font-size: 0.9rem; letter-spacing: 0.01em; cursor: pointer;
  position: relative; overflow: hidden;
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease), background-position 0.5s var(--ease);
  box-shadow: 0 10px 20px -10px rgba(92, 15, 26, 0.7);
}
.btn-primary svg { transition: transform 0.25s var(--ease); }
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 28px -12px rgba(92, 15, 26, 0.75); background-position: 100% 50%; }
.btn-primary:hover svg { transform: translateX(3px); }
.btn-primary:active { transform: translateY(0) scale(0.98); }
.btn-primary:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }
.btn-block { width: 100%; margin-top: 4px; }

.btn-secondary {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  border: 1.5px solid rgba(255,255,255,0.5); border-radius: 10px; padding: 12px 20px;
  background: transparent; color: var(--white); font-weight: 700; font-size: 0.9rem; cursor: pointer;
  transition: all 0.25s var(--ease);
}
.btn-secondary:hover { background: rgba(255,255,255,0.12); border-color: var(--white); transform: translateY(-2px); }
.btn-secondary:focus-visible { outline: 2px solid var(--color-accent); outline-offset: 2px; }

.btn-ghost {
  display: inline-flex; align-items: center; gap: 6px; border: 1.5px solid rgba(92,15,26,0.25);
  background: transparent; color: var(--maroon-deep); font-weight: 600; font-size: 0.8rem;
  padding: 8px 14px; border-radius: 9px; cursor: pointer; transition: all 0.2s var(--ease);
}
.btn-ghost:hover { background: rgba(92,15,26,0.06); border-color: var(--color-primary); transform: translateY(-1px); }

/* Inside the dark maroon detail panel, the default maroon-on-transparent
   styling above is unreadable — flip to a light variant there. Covers
   Save profile, Upload/Change photo, Send notification, Add alumnus,
   Publish posting, Post event, and verification actions, since they all
   live in this panel. */
.detail-panel .btn-ghost {
  border-color: rgba(255,255,255,0.35);
  color: var(--white);
  background: rgba(255,255,255,0.08);
}
.detail-panel .btn-ghost:hover {
  background: rgba(255,255,255,0.18);
  border-color: rgba(255,255,255,0.65);
  transform: translateY(-1px);
}
.detail-panel .btn-ghost:focus-visible {
  outline: 2px solid var(--color-accent); outline-offset: 2px;
}

/* The lock banner below is styled for a light background by default
   (dark maroon text on a soft pink tint). Inside the dark maroon
   detail panel that combination is nearly unreadable, so flip it to a
   light-on-dark variant there — this is where AlumniDashboardOverview
   renders it. */
.detail-panel .lock-banner {
  background: rgba(255,255,255,0.1);
  border-color: rgba(255,255,255,0.28);
  color: var(--white);
}

.btn-danger {
  border: none; background: transparent; color: #a33; cursor: pointer; padding: 6px 8px; border-radius: 7px;
  transition: background 0.2s var(--ease), transform 0.2s var(--ease);
  display: inline-flex; align-items: center; justify-content: center;
}
.btn-danger:hover { background: rgba(163,51,51,0.1); transform: scale(1.08); }

.switch-line { text-align: center; font-size: 0.86rem; color: #5a5a5a; margin: 20px 0 0; }

/* ---------------------------------------------------------------- */
/*  Crest / logo                                                       */
/* ---------------------------------------------------------------- */

.crest {
  flex-shrink: 0;
  width: 56px; height: 56px;
  border-radius: 50%;
  background: var(--white);
  color: var(--maroon-deep);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-weight: 800; font-size: 0.95rem; letter-spacing: 0.03em;
  box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.18);
  overflow: hidden; padding: 0;
  animation: crestPulse 3.4s ease-in-out infinite;
}
.crest.small { width: 40px; height: 40px; font-size: 0.75rem; animation: none; }
.crest.xl { width: 96px; height: 96px; font-size: 1.4rem; box-shadow: 0 0 0 5px rgba(255,255,255,0.18); }

@keyframes crestPulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(255,255,255,0.18); }
  50% { box-shadow: 0 0 0 8px rgba(255,255,255,0.08); }
}
.crest.xl {
  animation: crestPulse 2.2s ease-in-out infinite;
}

.crest-logo { width: 100%; height: 100%; object-fit: cover; display: block; }

.logo-duo { display: flex; align-items: center; justify-content: center; gap: clamp(10px, 3vw, 18px); flex-wrap: wrap; }
@media (max-width: 480px) {
  .logo-duo { flex-direction: row; gap: 10px; }
}

/* ---------------------------------------------------------------- */
/*  Toasts                                                             */
/* ---------------------------------------------------------------- */

.toast-stack {
  position: fixed; top: 16px; right: 16px; left: 16px;
  display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
  z-index: 999; pointer-events: none;
}
.toast {
  pointer-events: auto;
  max-width: 340px;
  width: 100%;
  background: var(--black);
  color: var(--white);
  border-left: 4px solid var(--color-accent);
  border-radius: 10px;
  padding: 12px 16px;
  font-size: 0.83rem;
  box-shadow: 0 14px 30px -14px rgba(0,0,0,0.6);
  animation: toastIn 0.4s var(--ease) both, toastOut 0.4s var(--ease) 2.4s both;
  display: flex; align-items: center; gap: 8px;
}
@keyframes toastIn { from { opacity: 0; transform: translateX(24px) scale(0.96); } to { opacity: 1; transform: translateX(0) scale(1); } }
@keyframes toastOut { to { opacity: 0; transform: translateX(24px) scale(0.96); } }
@media (max-width: 520px) {
  .toast-stack { left: 10px; right: 10px; align-items: stretch; }
  .toast { max-width: none; }
}
.env-warning {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  background: #fdecea; color: #9b1c1c;
  border-bottom: 1px solid #f3c0bb;
  padding: 8px 16px;
  font-size: 0.8rem;
  text-align: center;
}
.env-warning code { background: rgba(0,0,0,0.06); padding: 1px 5px; border-radius: 4px; font-size: 0.75rem; }

/* ---------------------------------------------------------------- */
/*  Modal (first-time survey / profile)                                */
/* ---------------------------------------------------------------- */

.modal-overlay {
  position: fixed; inset: 0; z-index: 500;
  background: rgba(11, 10, 10, 0.55);
  backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  display: flex; align-items: center; justify-content: center;
  padding: 20px;
  animation: fadeIn 0.3s var(--ease) both;
}
.modal-card {
  width: 100%; max-width: 540px; max-height: 88vh; overflow-y: auto;
  background: linear-gradient(165deg, var(--color-primary) 0%, var(--maroon-deep) 100%);
  color: var(--white); border-radius: var(--radius);
  padding: clamp(20px, 5vw, 30px);
  box-shadow: 0 40px 80px -20px rgba(0,0,0,0.6);
  animation: cardIn 0.4s var(--ease) both;
  position: relative;
}
.modal-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 6px; }
.modal-head h3 { font-family: var(--font-display); font-size: clamp(1.1rem, 3vw, 1.3rem); margin: 0; }
.modal-close {
  border: none; background: rgba(255,255,255,0.08); color: var(--white); width: 32px; height: 32px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0;
  transition: background 0.2s var(--ease);
}
.modal-close:hover { background: rgba(255,255,255,0.18); }
.modal-sub { font-size: 0.85rem; color: rgba(255,255,255,0.72); margin: 0 0 18px; line-height: 1.5; }

.profile-survey-summary { margin: 4px 0; padding: 14px 0; border-block: 1px solid rgba(255,255,255,0.2); color: var(--white); }
.profile-survey-heading { margin-bottom: 10px; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.68); }
.profile-survey-status { display: flex; align-items: baseline; flex-wrap: wrap; gap: 6px 10px; font-size: 0.84rem; }
.profile-survey-label, .profile-survey-date { color: rgba(255,255,255,0.68); font-size: 0.76rem; }
.profile-survey-status strong { color: var(--white); }
.profile-survey-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px 16px; margin-top: 12px; }
.profile-survey-details > div { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.profile-survey-details span { color: rgba(255,255,255,0.64); font-size: 0.7rem; }
.profile-survey-details strong { color: var(--white); font-size: 0.8rem; font-weight: 600; overflow-wrap: anywhere; }
.profile-survey-details .profile-survey-skills { grid-column: 1 / -1; }
.profile-survey-empty { margin: 8px 0 0; color: rgba(255,255,255,0.72); font-size: 0.8rem; }

/* ---------------------------------------------------------------- */
/*  Pending / rejected status pages                                    */
/* ---------------------------------------------------------------- */

.status-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  background: var(--color-bg); padding: 24px;
}
.status-card {
  width: 100%; max-width: 480px; background: var(--color-surface); border-radius: var(--radius);
  padding: clamp(28px, 6vw, 44px) clamp(24px, 5vw, 36px); text-align: center;
  box-shadow: 0 30px 60px -30px rgba(0,0,0,0.25);
  animation: cardIn 0.5s var(--ease) both;
}
.status-icon {
  width: 68px; height: 68px; border-radius: 50%; margin: 0 auto 20px;
  display: flex; align-items: center; justify-content: center;
  animation: popIn 0.5s var(--ease) both; animation-delay: 0.1s;
}
.status-icon.pending { background: rgba(139,30,63,0.12); color: var(--color-warning); }
.status-icon.rejected { background: rgba(163,51,51,0.12); color: var(--color-error); }
.status-card h2 { font-family: var(--font-display); font-size: clamp(1.2rem, 4vw, 1.5rem); margin-bottom: 10px; }
.status-card p { color: var(--color-muted); font-size: 0.9rem; line-height: 1.6; margin-bottom: 8px; }
.status-actions { display: flex; gap: 10px; justify-content: center; margin-top: 22px; flex-wrap: wrap; }

/* ---------------------------------------------------------------- */
/*  Landing page                                                       */
/* ---------------------------------------------------------------- */

.landing-page { background: var(--color-bg); color: var(--color-text); }

.landing-nav {
  position: sticky; top: 0; z-index: 200; background: rgba(244,240,238,0.86);
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--color-border);
}
.landing-nav-inner {
  max-width: 1180px; margin: 0 auto; padding: 12px clamp(16px, 4vw, 32px);
  display: flex; align-items: center; justify-content: space-between; gap: 16px;
}
.landing-brand { display: flex; align-items: center; gap: 10px; }
.landing-brand-name { font-family: var(--font-display); font-weight: 700; font-size: 1.02rem; line-height: 1.15; }
.landing-brand-sub { font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-muted); }
.landing-nav-actions { display: flex; align-items: center; gap: 10px; }
.btn-nav-login {
  border: none; background: transparent; color: var(--color-primary); font-weight: 700; font-size: 0.85rem;
  padding: 9px 14px; border-radius: 999px; cursor: pointer; transition: background 0.2s var(--ease);
}
.btn-nav-login:hover { background: rgba(92,15,26,0.08); }
.btn-nav-cta {
  border: none; background: var(--color-primary); color: var(--white); font-weight: 700; font-size: 0.85rem;
  padding: 9px 16px; border-radius: 999px; cursor: pointer; transition: all 0.2s var(--ease);
  box-shadow: 0 8px 18px -10px rgba(92,15,26,0.6);
}
.btn-nav-cta:hover { transform: translateY(-2px); box-shadow: 0 12px 22px -10px rgba(92,15,26,0.7); }

.lp-section { max-width: 1180px; margin: 0 auto; padding: clamp(56px, 9vw, 100px) clamp(16px, 5vw, 32px); }
.lp-eyebrow {
  display: inline-flex; align-items: center; gap: 8px; font-family: var(--font-mono); font-size: 0.7rem;
  letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-primary);
  background: rgba(92,15,26,0.07); padding: 6px 12px; border-radius: 999px; margin-bottom: 18px;
}
/* Hero */
.hero {
  position: relative; overflow: hidden;
  background: linear-gradient(175deg, var(--color-primary) 0%, var(--maroon-deep) 78%, var(--black) 140%);
  background-size: 160% 160%; animation: bgShift 22s ease-in-out infinite;
  color: var(--white);
}
.hero-inner {
  max-width: 1180px; margin: 0 auto; padding: clamp(72px, 12vw, 120px) clamp(16px, 5vw, 32px) clamp(56px, 9vw, 96px);
  display: grid; grid-template-columns: 1.05fr 0.95fr; gap: clamp(32px, 6vw, 60px); align-items: center;
}
.hero-copy { animation: fadeUp 0.7s var(--ease) both; }
.hero-copy .lp-eyebrow { color: var(--gold); background: rgba(139,30,63,0.16); }
.hero-title { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.1rem); line-height: 1.08; font-weight: 800; margin-bottom: 18px; }
.hero-title em { font-style: normal; color: var(--gold); }
.hero-sub { font-size: clamp(0.94rem, 2vw, 1.05rem); color: rgba(255,255,255,0.78); max-width: 46ch; line-height: 1.65; margin-bottom: 30px; }
.hero-ctas { display: flex; gap: 12px; flex-wrap: wrap; }

.hero-visual { position: relative; animation: fadeUp 0.8s var(--ease) both; animation-delay: 0.1s; }
.hero-mock {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.16); border-radius: 16px;
  padding: 20px; backdrop-filter: blur(6px); box-shadow: 0 40px 80px -30px rgba(0,0,0,0.5);
  animation: floatY 6s ease-in-out infinite;
}
.hero-mock-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.hero-mock-title { font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.55); }
.hero-mock-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 16px; }
.hero-mock-stat { background: rgba(255,255,255,0.06); border-radius: 10px; padding: 12px; }
.hero-mock-stat b { display: block; font-family: var(--font-mono); font-size: 1.15rem; color: var(--gold); }
.hero-mock-stat span { font-size: 0.68rem; color: rgba(255,255,255,0.55); }
/* About */
.about-section { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(28px, 6vw, 56px); align-items: center; }
.about-copy { animation: fadeUp 0.6s var(--ease) both; }
.about-copy h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 3.4vw, 2.1rem); margin-bottom: 14px; }
.about-copy p { color: var(--color-muted); line-height: 1.7; font-size: 0.95rem; margin-bottom: 12px; }
.about-visual {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 26px; box-shadow: 0 30px 60px -36px rgba(0,0,0,0.3); animation: fadeUp 0.7s var(--ease) both; animation-delay: 0.1s;
}
.about-visual-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--color-border); }
.about-visual-row:last-child { border-bottom: none; }
.about-visual-icon { width: 34px; height: 34px; border-radius: 9px; background: rgba(92,15,26,0.08); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.about-visual-text b { display: block; font-size: 0.86rem; }
.about-visual-text span { font-size: 0.78rem; color: var(--color-muted); }

/* Features */
.lp-head { display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 34px; }
.lp-head h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 3.4vw, 2.1rem); margin-bottom: 8px; }
.lp-head p { color: var(--color-muted); font-size: 0.95rem; max-width: 56ch; }

.lp-feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 250px), 1fr)); gap: 16px; }
.lp-feature-card {
  background: var(--color-surface); border: 1px solid var(--color-border); border-radius: var(--radius);
  padding: 22px; opacity: 0; transform: translateY(18px); transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}
.lp-feature-card.in { opacity: 1; transform: translateY(0); transition: opacity 0.5s var(--ease), transform 0.5s var(--ease); }
.lp-feature-card:hover { transform: translateY(-5px); box-shadow: 0 20px 34px -22px rgba(92,15,26,0.35); border-color: rgba(92,15,26,0.3); }
.lp-feature-icon { width: 42px; height: 42px; border-radius: 10px; background: var(--color-primary-strong); color: var(--white); display: flex; align-items: center; justify-content: center; margin-bottom: 14px; }
.lp-feature-card h3 { font-size: 0.98rem; margin-bottom: 6px; }
.lp-feature-card p { font-size: 0.82rem; color: var(--color-muted); line-height: 1.5; }

/* How it works */
.steps-section-inner { background: var(--color-primary); border-radius: 22px; padding: clamp(32px, 6vw, 56px); color: var(--white); }
.steps-section-inner .lp-head h2, .steps-section-inner .lp-head p { color: var(--white); }
.steps-section-inner .lp-head p { color: rgba(255,255,255,0.72); }
.steps-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0; position: relative; }
.step-item { position: relative; padding: 0 14px; opacity: 0; transform: translateY(14px); }
.step-item.in { opacity: 1; transform: translateY(0); transition: opacity 0.5s var(--ease), transform 0.5s var(--ease); }
.step-num {
  width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1.5px solid rgba(139,30,63,0.6);
  color: var(--gold); font-family: var(--font-mono); font-weight: 700; display: flex; align-items: center; justify-content: center;
  margin-bottom: 14px; position: relative; z-index: 2;
}
.step-item::after {
  content: ""; position: absolute; top: 20px; left: 54%; width: 100%; height: 1.5px;
  background: linear-gradient(90deg, rgba(139,30,63,0.5), rgba(139,30,63,0.05));
}
.step-item:last-child::after { display: none; }
.step-item h4 { font-size: 0.94rem; margin-bottom: 6px; }
.step-item p { font-size: 0.8rem; color: rgba(255,255,255,0.65); line-height: 1.5; }
@media (max-width: 760px) { .step-item::after { display: none; } }

/* Stats */
.stats-section-inner {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px;
  background: var(--white); border-radius: 22px; padding: clamp(32px, 6vw, 52px); color: var(--black);
}
.stat-lp { text-align: center; }
.stat-lp b { display: block; font-family: var(--font-mono); font-size: clamp(1.8rem, 4vw, 2.5rem); color: var(--black); }
.stat-lp span { font-size: 0.8rem; color: rgba(11,10,10,0.65); }

/* CTA banner */
.cta-banner {
  background: linear-gradient(135deg, var(--maroon-bright), var(--maroon-deep));
  border-radius: 22px; padding: clamp(36px, 7vw, 60px); text-align: center; color: var(--white);
  display: flex; flex-direction: column; align-items: center; gap: 18px;
}
.cta-banner h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 3.6vw, 2.2rem); max-width: 24ch; }
.cta-banner p { color: rgba(255,255,255,0.75); max-width: 48ch; font-size: 0.94rem; }

/* Footer */
.lp-footer { background: var(--white); color: rgba(11,10,10,0.7); }
.lp-footer-inner { max-width: 1180px; margin: 0 auto; padding: 44px clamp(16px, 5vw, 32px) 26px; }
.lp-footer-grid { display: grid; grid-template-columns: 1.4fr 1fr 1fr; gap: 30px; margin-bottom: 30px; }
.lp-footer-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.lp-footer p { font-size: 0.84rem; line-height: 1.6; max-width: 40ch; }
.lp-footer h5 { color: var(--black); font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 12px; }
.lp-footer ul { list-style: none; display: flex; flex-direction: column; gap: 8px; }
.lp-footer ul button { background: none; border: none; color: rgba(11,10,10,0.65); font-size: 0.84rem; cursor: pointer; text-align: left; padding: 0; transition: color 0.2s var(--ease); }
.lp-footer ul button:hover { color: var(--gold); }
.lp-footer-bottom { border-top: 1px solid rgba(11,10,10,0.1); padding-top: 18px; font-size: 0.76rem; color: rgba(11,10,10,0.55); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px; }

@media (max-width: 860px) {
  .hero-inner { grid-template-columns: 1fr; }
  .about-section { grid-template-columns: 1fr; }
  .lp-footer-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 520px) {
  .lp-footer-grid { grid-template-columns: 1fr; }
  .landing-nav-actions { gap: 6px; }
  .btn-nav-login, .btn-nav-cta { padding: 8px 11px; font-size: 0.78rem; }
}

/* ---------------------------------------------------------------- */
/*  Dashboard layout                                                  */
/* ---------------------------------------------------------------- */

.dash {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  display: grid;
  grid-template-columns: minmax(200px, 260px) 1fr;
  align-items: stretch;
  background: var(--color-bg);
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.5s var(--ease), transform 0.5s var(--ease);
}
.dash.in { opacity: 1; transform: translateY(0); }

.dash-sidebar {
  background: linear-gradient(190deg, var(--color-primary) 0%, var(--maroon-deep) 65%, var(--black) 130%);
  background-size: 160% 160%;
  animation: bgShift 20s ease-in-out infinite;
  color: var(--white);
  padding: 22px 10px 22px 0;
  display: flex; flex-direction: column; gap: 22px;
  position: sticky; top: 0; align-self: stretch; height: auto; min-height: 100vh;
}

.dash-crest { display: flex; align-items: center; gap: 12px; padding: 0 6px; }
.dash-brand { font-family: var(--font-display); font-weight: 700; font-size: 1rem; }
.dash-role { font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.65); margin-top: 2px; }

.dash-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow-y: auto; }
.dash-nav-item {
  display: flex; align-items: center; gap: 12px; padding: 10px 12px; border: none; background: transparent;
  color: rgba(255, 255, 255, 0.78); border-radius: 9px; font-size: 0.84rem; font-weight: 500; cursor: pointer;
  text-align: left; position: relative;
  transition: background 0.25s var(--ease), color 0.25s var(--ease), padding-left 0.25s var(--ease);
  animation: slideIn 0.4s var(--ease) both; animation-delay: calc(var(--i) * 0.04s);
}
@keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
.dash-nav-item:hover { background: rgba(255, 255, 255, 0.08); color: var(--white); padding-left: 16px; }
.dash-nav-item.active { background: var(--white); color: var(--maroon-deep); font-weight: 700; box-shadow: 0 8px 18px -8px rgba(0, 0, 0, 0.5); }
.dash-nav-item:disabled { opacity: 0.32; cursor: not-allowed; }
.dash-nav-item:disabled:hover { background: transparent; padding-left: 12px; color: rgba(255,255,255,0.78); }
.nav-label { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.nav-badge {
  font-family: var(--font-mono); font-size: 0.62rem; font-weight: 700; padding: 2px 7px; border-radius: 999px;
  background: var(--white); color: var(--maroon-deep); flex-shrink: 0;
  animation: badgePop 0.4s var(--ease) both;
}
.dash-nav-item.active .nav-badge { background: var(--color-primary); color: var(--white); }
@keyframes badgePop { from { transform: scale(0); } to { transform: scale(1); } }

.dash-logout {
  display: flex; align-items: center; gap: 10px; border: 1px solid rgba(255, 255, 255, 0.25); background: transparent;
  color: var(--white); padding: 10px 12px; border-radius: 9px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
  transition: background 0.25s var(--ease), border-color 0.25s var(--ease);
}
.dash-logout:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.5); }

.dash-main { padding: clamp(18px, 4vw, 32px) clamp(16px, 5vw, 40px) 60px clamp(10px, 2vw, 20px); max-width: 1180px; background: var(--color-bg); }

.dash-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; animation: fadeUp 0.6s var(--ease) both; position: relative; z-index: 30; }
.dash-header h1 { font-family: var(--font-display); font-size: clamp(1.15rem, 3.4vw, 1.75rem); color: var(--color-text); margin-top: 4px; }
.dash-header .eyebrow { color: var(--color-primary); }
.dash-header-actions { display: flex; align-items: center; gap: 12px; position: relative; z-index: 30; }

.eyebrow {
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.14em;
  font-size: 0.68rem;
  color: rgba(255, 255, 255, 0.75);
}

.notif-wrap { position: relative; z-index: 30; }

.dash-profile-action {
  display: flex; align-items: center; gap: 8px; border: 1px solid rgba(92, 15, 26, 0.12); background: var(--color-surface);
  color: var(--maroon-deep); padding: 8px 12px; border-radius: 999px; font-size: 0.82rem; font-weight: 600; cursor: pointer;
  box-shadow: 0 8px 24px -16px rgba(0, 0, 0, 0.3); position: relative; transition: transform 0.2s var(--ease);
}
.dash-profile-action:hover { transform: translateY(-2px); }
.dash-profile-action.active { background: var(--color-primary); color: var(--white); border-color: transparent; }
.dash-profile-action:disabled { opacity: 0.35; cursor: not-allowed; transform: none; }
.ping-dot {
  position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%;
  background: var(--color-accent); box-shadow: 0 0 0 0 rgba(139,30,63,0.7);
  animation: ping 1.8s ease-out infinite;
}
@keyframes ping { 0% { box-shadow: 0 0 0 0 rgba(139,30,63,0.6); } 70% { box-shadow: 0 0 0 8px rgba(139,30,63,0); } 100% { box-shadow: 0 0 0 0 rgba(139,30,63,0); } }

/* Notification dropdown */
.notif-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(340px, 88vw);
  max-height: 380px;
  overflow-y: auto;
  background: var(--color-primary);
  color: var(--white);
  border-radius: 12px;
  box-shadow: 0 24px 50px -18px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.08);
  z-index: 400;
  padding: 8px;
  animation: dropIn 0.22s var(--ease) both;
}
@keyframes dropIn { from { opacity: 0; transform: translateY(-6px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
.notif-dropdown-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 10px 10px; font-family: var(--font-mono); font-size: 0.68rem;
  text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.5);
  border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 6px;
}
.notif-item {
  display: flex; flex-direction: column; gap: 6px;
  padding: 10px 10px; border-radius: 9px; cursor: default;
  transition: background 0.2s var(--ease);
}
.notif-item:hover { background: rgba(255,255,255,0.06); }
.notif-item-text { font-size: 0.82rem; line-height: 1.4; color: rgba(255,255,255,0.92); }
.notif-item-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.notif-item-date { font-size: 0.7rem; color: rgba(255,255,255,0.45); }
.notif-goto {
  border: 1px solid rgba(255,255,255,0.2); background: rgba(255,255,255,0.06); color: var(--white);
  font-size: 0.72rem; font-weight: 600; padding: 5px 10px; border-radius: 999px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 5px; transition: all 0.2s var(--ease); flex-shrink: 0;
}
.notif-goto:hover { background: var(--color-accent); border-color: var(--color-accent); color: var(--maroon-deep); }
.notif-empty { padding: 22px 10px; text-align: center; font-size: 0.82rem; color: rgba(255,255,255,0.45); }

.dash-avatar {
  width: 42px; height: 42px; border-radius: 50%; background: var(--color-primary); color: var(--white);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: var(--font-display);
  flex-shrink: 0; overflow: hidden; transition: transform 0.3s var(--ease);
  border: none; cursor: pointer; font-size: 1rem;
}
.dash-avatar img { width: 100%; height: 100%; object-fit: cover; display: block; }
.dash-avatar:hover { transform: rotate(-8deg) scale(1.06); }

/* Lock banner */
.lock-banner {
  display: flex; align-items: center; gap: 10px;
  background: rgba(92, 15, 26, 0.08); border: 1px solid rgba(92, 15, 26, 0.25); color: var(--maroon-deep);
  padding: 12px 16px; border-radius: 10px; font-size: 0.85rem; margin-bottom: 18px;
  animation: fadeUp 0.4s var(--ease) both;
}
.lock-banner svg { flex-shrink: 0; }

/* Avatar upload in profile panel */
.avatar-upload { display: flex; align-items: center; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
.avatar-preview {
  width: 64px; height: 64px; border-radius: 50%; background: rgba(255,255,255,0.12); color: var(--white);
  display: flex; align-items: center; justify-content: center; font-weight: 700; font-family: var(--font-display);
  font-size: 1.3rem; overflow: hidden; flex-shrink: 0; border: 1px solid rgba(255,255,255,0.2);
}
.avatar-preview img { width: 100%; height: 100%; object-fit: cover; display: block; }
.avatar-upload-actions { display: flex; flex-direction: column; gap: 6px; align-items: flex-start; }
.avatar-hint { font-size: 0.72rem; color: rgba(255,255,255,0.5); }

/* Stats */
.stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 30px; }
.stat-card {
  background: var(--color-surface); border-radius: var(--radius); padding: 18px; border: 1px solid rgba(92, 15, 26, 0.1);
  box-shadow: 0 10px 24px -18px rgba(0, 0, 0, 0.4);
  animation: cardIn 0.5s var(--ease) both; animation-delay: calc(var(--i) * 0.07s);
  transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
}
.stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 30px -16px rgba(92, 15, 26, 0.35); }
.stat-value { font-family: var(--font-mono); font-size: clamp(1.25rem, 3vw, 1.7rem); font-weight: 500; color: var(--maroon-deep); }
.stat-label { font-size: 0.78rem; color: #6b6b6b; margin-top: 4px; }

/* Feature grid (admin nav preview grid on Dashboard) */
.feature-section { margin-bottom: 8px; }
.feature-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 14px; flex-wrap: wrap; gap: 6px; }
.feature-section h2 { font-family: var(--font-display); font-size: clamp(1.05rem, 2.6vw, 1.2rem); color: var(--color-text); }
.feature-section-hint { font-size: 0.78rem; color: #7a7a7a; }

.feature-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 230px), 1fr)); gap: 14px; margin-bottom: 30px; }

.feature-card {
  text-align: left; background: var(--color-surface); border: 1px solid rgba(0, 0, 0, 0.06); border-radius: var(--radius);
  padding: 18px; cursor: pointer; position: relative; overflow: hidden;
  animation: cardIn 0.5s var(--ease) both; animation-delay: calc(var(--i) * 0.05s);
  transition: transform 0.3s var(--ease), box-shadow 0.3s var(--ease), border-color 0.3s var(--ease);
}
.feature-card::before {
  content: ""; position: absolute; inset: 0; background: linear-gradient(135deg, rgba(92, 15, 26, 0.06), transparent 60%);
  opacity: 0; transition: opacity 0.3s var(--ease);
}
.feature-card:hover, .feature-card.active { transform: translateY(-5px); box-shadow: 0 20px 34px -20px rgba(92, 15, 26, 0.45); border-color: rgba(92, 15, 26, 0.35); }
.feature-card:hover::before, .feature-card.active::before { opacity: 1; }
.feature-card.active { outline: 2px solid var(--color-primary); outline-offset: -2px; }

.feature-icon-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px; }
.feature-icon {
  width: 40px; height: 40px; border-radius: 10px; background: var(--maroon-deep); color: var(--white);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.3s var(--ease), background 0.3s var(--ease);
}
.feature-card:hover .feature-icon { transform: rotate(-6deg) scale(1.08); background: var(--maroon-bright); }

.feature-badge {
  font-family: var(--font-mono); font-size: 0.66rem; font-weight: 700; padding: 3px 8px; border-radius: 999px;
  background: rgba(139,30,63,0.12); color: var(--maroon); border: 1px solid rgba(139,30,63,0.4);
  animation: badgePop 0.4s var(--ease) both;
}

.feature-card h3 { font-size: 0.95rem; margin-bottom: 6px; color: var(--color-text); }
.feature-card p { font-size: 0.8rem; color: #666; line-height: 1.45; }

/* Detail panel */
.detail-panel {
  margin-top: 22px; background: linear-gradient(165deg, var(--color-primary) 0%, var(--maroon-deep) 100%);
  color: var(--white); border-radius: var(--radius);
  padding: clamp(18px, 4vw, 28px); display: flex; gap: 16px; align-items: flex-start; flex-wrap: wrap;
  animation: fadeUp 0.4s var(--ease) both;
}
.detail-icon {
  width: 46px; height: 46px; border-radius: 12px; background: var(--black); display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.detail-body { flex: 1; min-width: 220px; }
.detail-panel h3 { font-family: var(--font-display); margin-bottom: 6px; font-size: clamp(1rem, 3vw, 1.1rem); }
.detail-panel > .detail-body > p:first-of-type { margin: 0 0 16px; color: rgba(255, 255, 255, 0.75); font-size: 0.88rem; line-height: 1.5; }

/* Generic panel widgets used inside detail panels */
.panel-block { animation: fadeIn 0.35s var(--ease) both; }
.panel-form { display: flex; flex-direction: column; gap: 12px; margin-bottom: 18px; }
.panel-form .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; }
.panel-form label { display: flex; flex-direction: column; gap: 5px; font-size: 0.76rem; font-weight: 600; color: rgba(255,255,255,0.85); }
.panel-form input, .panel-form select, .panel-form textarea {
  border: 1.5px solid rgba(255,255,255,0.18); border-radius: 8px; padding: 9px 11px; font-size: 0.86rem;
  background: rgba(255,255,255,0.06); color: var(--white); transition: border-color 0.2s var(--ease), background 0.2s var(--ease);
}
.panel-form input::placeholder, .panel-form textarea::placeholder { color: rgba(255,255,255,0.35); }
.panel-form input:focus, .panel-form select:focus, .panel-form textarea:focus {
  outline: none; border-color: var(--color-accent); background: rgba(255,255,255,0.1);
}
.panel-form select option { color: black; }
.panel-search { display: flex; gap: 8px; margin-bottom: 14px; }
.panel-search input {
  min-width: 0; flex: 1; border: 1.5px solid #d8d2d0; border-radius: 8px; padding: 9px 11px;
  background: var(--white); color: var(--black); font-size: 0.86rem;
}
.panel-search input:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(92,15,26,0.12); }
.panel-search .btn-primary { flex-shrink: 0; padding: 9px 16px; }
.detail-panel .panel-search input { border-color: #d8d2d0; background: var(--white); color: var(--black); }
.consent-field { display: flex; flex-direction: column; align-items: flex-start; gap: 5px; }
.consent-links { display: flex; align-items: center; gap: 8px; padding-left: 24px; font-size: 0.76rem; color: #777; }
.consent-links .text-link { font-size: inherit; }
.consent-tabs { display: flex; gap: 8px; margin: 4px 0 16px; border-bottom: 1px solid rgba(255,255,255,0.2); }
.consent-tabs button { border: 0; border-bottom: 2px solid transparent; padding: 8px 4px; background: transparent; color: rgba(255,255,255,0.7); font: inherit; cursor: pointer; }
.consent-tabs button.active { border-bottom-color: var(--white); color: var(--white); }
.consent-content { max-height: min(48vh, 360px); overflow-y: auto; padding-right: 4px; font-size: 0.84rem; line-height: 1.6; color: rgba(255,255,255,0.86); }
.consent-content h4 { margin: 14px 0 4px; color: var(--white); font-size: 0.88rem; }
.consent-content h4:first-child { margin-top: 0; }
.consent-content p { margin: 0 0 10px; }
.consent-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 18px; }
.notification-target-select { color: var(--white); background: var(--color-primary); border-color: rgba(255, 255, 255, 0.22); }
.notification-target-select option { background: var(--color-primary); color: var(--white); }

.table-wrap { width: 100%; overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 10px; }
.data-table { width: 100%; border-collapse: collapse; font-size: 0.82rem; min-width: 420px; }
.data-table th { text-align: left; font-family: var(--font-mono); font-size: 0.66rem; text-transform: uppercase; letter-spacing: 0.08em; color: rgba(255,255,255,0.5); padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.12); }
.data-table td { padding: 10px 10px; border-bottom: 1px solid rgba(255,255,255,0.08); vertical-align: middle; }
.data-table tr { transition: background 0.2s var(--ease); animation: fadeIn 0.3s var(--ease) both; }
.data-table tbody tr:hover { background: rgba(255,255,255,0.04); }

.pill { display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; font-weight: 600; padding: 3px 9px; border-radius: 999px; }
.pill.ok { background: rgba(139,30,63,0.12); color: var(--maroon); }
.pill.pending { background: rgba(139,30,63,0.12); color: var(--maroon); }
.pill.rejected { background: rgba(163,51,51,0.16); color: #e08a8a; }
.pill.muted { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.65); }

.chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14);
  color: var(--white); font-size: 0.74rem; padding: 4px 10px; border-radius: 999px;
  animation: popIn 0.25s var(--ease) both;
}
.chip.match { background: rgba(139,30,63,0.12); border-color: rgba(139,30,63,0.4); color: var(--maroon); }
.chip button { background: none; border: none; color: inherit; cursor: pointer; display: flex; padding: 0; opacity: 0.7; }
.chip button:hover { opacity: 1; }

.list-block { display: flex; flex-direction: column; gap: 10px; }
.list-item {
  background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; padding: 12px 14px;
  display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap;
  animation: fadeUp 0.3s var(--ease) both; transition: transform 0.2s var(--ease), border-color 0.2s var(--ease);
}
.list-item:hover { transform: translateX(2px); border-color: rgba(139,30,63,0.4); }
.list-item-main { min-width: 0; flex: 1; }
.list-item-title { font-weight: 700; font-size: 0.88rem; overflow-wrap: anywhere; }
.list-item-sub { font-size: 0.76rem; color: rgba(255,255,255,0.55); margin-top: 2px; overflow-wrap: anywhere; }
.list-item-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

.bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.bar-label { width: 120px; flex-shrink: 0; font-size: 0.78rem; color: rgba(255,255,255,0.75); }
.bar-track { flex: 1; height: 9px; border-radius: 999px; background: rgba(255,255,255,0.1); overflow: hidden; }
.bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--maroon-bright), var(--color-accent)); transition: width 0.8s var(--ease); }
.bar-value { width: 34px; text-align: right; font-family: var(--font-mono); font-size: 0.74rem; color: rgba(255,255,255,0.7); }

.btn-rsvp {
  border: 1.5px solid rgba(255,255,255,0.25); background: transparent; color: var(--white); font-weight: 600; font-size: 0.78rem;
  padding: 7px 13px; border-radius: 999px; cursor: pointer; transition: all 0.2s var(--ease); display: inline-flex; gap: 6px; align-items: center;
}
.btn-rsvp:hover { border-color: var(--color-accent); }
.btn-rsvp.going { background: var(--color-primary); border-color: var(--color-primary); color: var(--white); }

.empty-state { text-align: center; padding: 24px 10px; color: rgba(255,255,255,0.5); font-size: 0.84rem; }

.empty-state-rich {
  display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center;
  padding: 30px 16px; color: rgba(255,255,255,0.55); animation: fadeIn 0.35s var(--ease) both;
}
.empty-state-rich .empty-state-icon {
  width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7);
}
.empty-state-rich p { font-size: 0.84rem; max-width: 34ch; line-height: 1.5; }
.detail-panel .empty-state-rich { color: #7a7a7a; }
.detail-panel .empty-state-rich .empty-state-icon { background: rgba(92,15,26,0.08); color: var(--color-primary); }

/* Access-check summary row — used to fold the "Login & Authentication"
   explainer into the merged Login & Verification panel without it
   competing for space with the review queue below. */
.access-check-row {
  display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap;
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 10px;
  padding: 12px 16px; margin-bottom: 20px;
}
.access-check-item { display: flex; align-items: center; gap: 10px; font-size: 0.82rem; color: rgba(255,255,255,0.8); line-height: 1.45; max-width: 44ch; }
.access-check-item svg { flex-shrink: 0; color: var(--gold); }
.access-check-stat { text-align: right; flex-shrink: 0; }
.access-check-stat b { display: block; font-family: var(--font-mono); font-size: 1.15rem; }
.access-check-stat span { font-size: 0.68rem; color: rgba(255,255,255,0.55); white-space: nowrap; }
.detail-panel .access-check-row { background: #faf7f6; border-color: #e6e1df; }
.detail-panel .access-check-item { color: #4a4a4a; }
.detail-panel .access-check-item svg { color: var(--color-primary); }
.detail-panel .access-check-stat b { color: var(--maroon-deep); }

/* List item: quiet left accent that warms on hover — small, deliberate
   motion cue rather than a flat card. */
.list-item { border-left: 3px solid transparent; }
.list-item:hover { border-left-color: var(--color-accent); }

/* Stat card icon chip */
.stat-card { display: flex; align-items: flex-start; gap: 12px; }
.stat-card-icon {
  width: 34px; height: 34px; border-radius: 9px; flex-shrink: 0;
  background: rgba(92,15,26,0.08); color: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
}
.stat-card-body { min-width: 0; }

.confirm-badge {
  display: inline-flex; align-items: center; gap: 6px; font-size: 0.78rem; font-weight: 700; color: var(--maroon);
  background: rgba(139,30,63,0.12); padding: 6px 12px; border-radius: 999px; animation: popIn 0.3s var(--ease) both;
}

/* Dashboard overview panel */
.overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin-top: 16px; }
.overview-link {
  display: flex; flex-direction: column; align-items: flex-start; gap: 6px; text-align: left;
  border: 1px solid rgba(255,255,255,0.14); background: rgba(255,255,255,0.05); color: var(--white);
  padding: 12px 14px; border-radius: 10px; cursor: pointer; transition: all 0.2s var(--ease);
}
.overview-link:hover { background: rgba(255,255,255,0.12); border-color: rgba(139,30,63,0.5); transform: translateY(-2px); }
.overview-link-title { font-weight: 700; font-size: 0.85rem; display: flex; align-items: center; gap: 8px; }
.overview-link-sub { font-size: 0.74rem; color: rgba(255,255,255,0.55); }
.overview-block-title { font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: rgba(255,255,255,0.55); margin: 22px 0 10px; }
.overview-block-title:first-child { margin-top: 0; }

/* Dashboard module surfaces use a light reading surface in both roles. */
.detail-panel { background: var(--white); color: var(--black); }
.detail-panel h3, .detail-panel .overview-block-title, .detail-panel .panel-block, .detail-panel .list-item-title, .detail-panel .overview-link-title { color: var(--black); }
.detail-panel > .detail-body > p:first-of-type { color: #4a4a4a; }
.detail-panel .panel-form label, .detail-panel .bar-label, .detail-panel .bar-value { color: var(--black); }
.detail-panel .panel-form input, .detail-panel .panel-form select, .detail-panel .panel-form textarea {
  border-color: #d8d2d0; background: var(--white); color: var(--black);
}
.detail-panel .panel-form input::placeholder, .detail-panel .panel-form textarea::placeholder { color: #888; }
.detail-panel .panel-form input:focus, .detail-panel .panel-form select:focus, .detail-panel .panel-form textarea:focus { background: var(--white); }
.detail-panel .data-table th { color: #555; border-bottom-color: #d8d2d0; }
.detail-panel .data-table td { border-bottom-color: #e6e1df; }
.detail-panel .data-table tbody tr:hover { background: #faf7f6; }
.detail-panel .detail-icon { background: var(--color-primary); color: var(--white); }
.detail-panel .list-item { background: var(--white); border-color: #ddd7d5; }
.detail-panel .list-item-sub, .detail-panel .overview-link-sub { color: #666; }
.detail-panel .avatar-preview { background: var(--color-primary); color: var(--white); border-color: var(--color-primary); }
.detail-panel .avatar-hint { color: #666; }
.detail-panel .bar-track { background: #e8e1df; }
.detail-panel .empty-state { color: #666; }
.detail-panel .overview-link { border-color: #ddd7d5; background: var(--white); color: var(--black); }
.detail-panel .overview-link:hover { background: #faf7f6; border-color: var(--color-primary); }
.detail-panel button { background: var(--color-primary); color: var(--white); border-color: var(--color-primary); }
.detail-panel button:hover { background: var(--maroon-bright); border-color: var(--maroon-bright); }
.detail-panel .btn-ghost { background: var(--color-primary); color: var(--white); border-color: var(--color-primary); }
.detail-panel .btn-ghost:hover { background: var(--maroon-bright); border-color: var(--maroon-bright); }
.survey-history-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.survey-history-action { display: inline-flex; align-items: center; justify-content: center; min-height: 34px; padding: 7px 11px; border: 1px solid rgba(255,255,255,0.3); border-radius: 7px; background: rgba(255,255,255,0.08); color: var(--white); font-size: 0.76rem; font-weight: 600; cursor: pointer; }
.survey-history-action:hover { background: rgba(255,255,255,0.16); }
.detail-panel .survey-history-action { border-color: #d8d2d0; background: var(--white); color: var(--maroon-deep); }
.detail-panel .survey-history-action:hover { background: #faf7f6; border-color: var(--color-primary); }
.detail-panel .btn-primary { background: var(--color-primary); background-size: auto; }
.detail-panel .btn-danger { background: var(--color-primary); color: var(--white); }
.detail-panel .btn-rsvp.going { background: var(--color-primary); border-color: var(--color-primary); color: var(--white); }
.detail-panel .lock-banner { background: var(--white); border-color: #d8d2d0; color: var(--black); }
.detail-panel .chip { background: #f4f0ee; border-color: #d8d2d0; color: var(--black); }
.detail-panel .chip.match { background: rgba(139,30,63,0.12); border-color: rgba(139,30,63,0.4); color: var(--maroon); }
.detail-panel .pill.ok, .detail-panel .pill.pending, .detail-panel .pill.rejected { background: var(--color-primary); color: var(--white); }
.detail-panel .pill.muted { background: #f4f0ee; color: #555; }
.detail-panel .notification-target-select { background: var(--white); color: var(--black); border-color: #d8d2d0; }
.detail-panel .notification-target-select option { background: var(--white); color: var(--black); }
.detail-panel .text-link { padding: 6px 10px; color: var(--white) !important; background: var(--color-primary); }
.detail-panel .text-link::after { background: var(--white); }
.detail-panel .notif-goto { background: var(--color-primary); border-color: var(--color-primary); color: var(--white); }
.detail-panel .notif-goto:hover { background: var(--maroon-bright); border-color: var(--maroon-bright); color: var(--white); }
.modal-card .btn-ghost { background: var(--white); border-color: var(--white); color: var(--maroon-deep); }
.modal-card .btn-ghost:hover { background: var(--off-white); border-color: var(--off-white); color: var(--maroon-deep); }

.auth-card, .status-card, .hero-mock, .about-visual, .lp-feature-card,
.steps-section-inner, .stats-section-inner, .cta-banner, .stat-card,
.detail-panel, .list-item, .access-check-row, .modal-card {
  box-shadow: var(--shadow-container);
}

/* ---------------------------------------------------------------- */
/*  Responsive                                                        */
/* ---------------------------------------------------------------- */

@media (max-width: 980px) {
  .stat-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 860px) {
  .dash { grid-template-columns: 1fr; }
  .dash-sidebar { position: sticky; top: 0; z-index: 50; height: auto; min-height: 0; flex-direction: row; flex-wrap: wrap; align-items: center; gap: 12px; padding: 14px 16px; }
  .dash-nav { flex-direction: row; flex-wrap: wrap; overflow-y: visible; overflow-x: auto; flex: 1; }
  .dash-nav-item span.nav-label { display: none; }
  .dash-nav-item { padding: 10px; min-width: 42px; justify-content: center; }
  .dash-nav-item:hover { padding-left: 10px; }
  .dash-logout span { display: inline; }
  .dash-main { padding: 20px 16px 50px; }
  .nav-badge { position: absolute; top: 2px; right: 2px; }
}

@media (max-width: 640px) {
  .field-pair { grid-template-columns: 1fr; }
  .auth-card { padding: 26px 20px 22px; }
  .stat-grid { grid-template-columns: 1fr 1fr; }
  .feature-grid { grid-template-columns: 1fr 1fr; }
  .crest.xl { width: 80px; height: 80px; font-size: 1.2rem; box-shadow: 0 0 0 4px rgba(255,255,255,0.18); }
  .dash-header { flex-direction: column; align-items: flex-start; }
  .dash-header-actions { width: 100%; justify-content: space-between; }
  .notif-dropdown { position: fixed; top: 64px; left: 10px; right: 10px; width: auto; }
  .list-item { flex-direction: column; align-items: flex-start; }
  .bar-label { width: 90px; font-size: 0.72rem; }
}

@media (max-width: 480px) {
  .panel-form .row { grid-template-columns: 1fr; }
  .panel-form { gap: 14px; }
  .panel-form input, .panel-form select, .panel-form textarea { padding: 11px 12px; font-size: 0.9rem; }
  .btn-ghost, .btn-danger, .btn-rsvp { min-height: 38px; }
  .dash-nav-item { min-height: 40px; }
  .detail-panel { flex-direction: column; }
  .detail-icon { width: 40px; height: 40px; }
  .avatar-preview { width: 56px; height: 56px; font-size: 1.1rem; }
  .list-item { padding: 11px 12px; }
  .bar-label { width: 76px; font-size: 0.68rem; }
  .lock-banner { font-size: 0.8rem; align-items: flex-start; }
  .table-wrap { margin: 0 -2px; }
  .crest.xl { width: 68px; height: 68px; font-size: 1rem; box-shadow: 0 0 0 4px rgba(255,255,255,0.18); }
  .modal-card { padding: 20px 18px; }
}

@media (max-width: 420px) {
  .stat-grid { grid-template-columns: 1fr; }
  .feature-grid { grid-template-columns: 1fr; }
  .dash-crest { flex: 1 1 100%; }
  .role-toggle { flex-wrap: wrap; }
  .field-row { flex-direction: column; align-items: flex-start; gap: 10px; }
}

@media (max-width: 340px) {
  .dash-nav-item { padding: 8px; }
  .dash-logout span { display: none; }
  .dash-header h1 { font-size: 1.1rem; }
}
`;
