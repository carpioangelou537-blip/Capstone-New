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
          <div className="hero-mock">
            <div className="hero-mock-head">
              <span className="hero-mock-title">Alignment Snapshot</span>
              <Icon name="spark" size={16} />
            </div>
            <div className="hero-mock-stats">
              <div className="hero-mock-stat"><b>82%</b><span>Skill match rate</span></div>
              <div className="hero-mock-stat"><b>+3</b><span>Trending skills</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}