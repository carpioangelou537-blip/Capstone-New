import Icon from "../ui/Icon";

export default function LandingCTA({ onGetStarted }) {
  return (
    <section className="lp-section">
      <div className="cta-banner">
        <h2>Your record shapes the next graduate's chances.</h2>
        <p>Register, get verified, and complete your survey — it takes a few minutes and keeps the whole alignment picture accurate.</p>
        <button className="btn-primary" onClick={onGetStarted}>Create your account <Icon name="arrow" size={16} /></button>
      </div>
    </section>
  );
}