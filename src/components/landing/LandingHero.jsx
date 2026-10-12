import Icon from "../ui/Icon";

export default function LandingHero({ onGetStarted, onLogin }) {
  return (
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy">
          <span className="lp-eyebrow">SPC · IT &amp; CS Alumni Tracer</span>
          <h1 className="hero-title">Trace every graduate's <em>path</em> from classroom to career.</h1>
          <p className="hero-sub">
            A single system for the Alumni Affairs Office and IT/CS graduates alike — track employment,
            match skills to real job openings, and see which courses actually shape careers.
          </p>
          <div className="hero-ctas">
            <button className="btn-primary" onClick={onGetStarted}>Get Started <Icon name="arrow" size={16} /></button>
            <button className="btn-secondary" onClick={onLogin}>Login</button>
          </div>
        </div>
        <div className="hero-visual">
          <img
            className="hero-artwork"
            src="/Landingimages-videos/alumni-hero.png"
            alt="St. Peter's College alumni tracer and graduates"
          />
        </div>
      </div>
    </section>
  );
}