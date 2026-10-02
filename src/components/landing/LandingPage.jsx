import BrandLogo from "../ui/BrandLogo";
import LandingHero from "./LandingHero";
import LandingAbout from "./LandingAbout";
import LandingFeatures from "./LandingFeatures";
import LandingSteps from "./LandingSteps";
import LandingStats from "./LandingStats";
import LandingCTA from "./LandingCTA";
import LandingFooter from "./LandingFooter";

export default function LandingPage({ alumni, onGetStarted, onLogin }) {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-brand">
            <div className="crest small"><BrandLogo /></div>
            <div>
              <div className="landing-brand-name">Alumni Tracer</div>
              <div className="landing-brand-sub">SPC IT / CS</div>
            </div>
          </div>
          <div className="landing-nav-actions">
            <button className="btn-nav-login" onClick={onLogin}>Login</button>
            <button className="btn-nav-cta" onClick={onGetStarted}>Get Started</button>
          </div>
        </div>
      </nav>

      <LandingHero onGetStarted={onGetStarted} onLogin={onLogin} />
      <LandingAbout />
      <LandingFeatures />
      <LandingSteps />
      <LandingStats alumni={alumni} />
      <LandingCTA onGetStarted={onGetStarted} />
      <LandingFooter onLogin={onLogin} onGetStarted={onGetStarted} />
    </div>
  );
}