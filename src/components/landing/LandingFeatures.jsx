import { LANDING_FEATURES } from "../../lib/constants";
import { useInView } from "../../hooks/useInView";
import Icon from "../ui/Icon";

export default function LandingFeatures() {
  const [ref, inView] = useInView();
  return (
    <section className="lp-section" ref={ref}>
      <div className="lp-head">
        <span className="lp-eyebrow">Key features</span>
        <h2>Everything the Alumni Affairs Office needs, in one place.</h2>
        <p>Six modules cover tracking, careers, surveys, alignment, analytics, and outreach.</p>
      </div>
      <div className="lp-feature-grid">
        {LANDING_FEATURES.map((f, i) => (
          <div
            className={`lp-feature-card ${inView ? "in" : ""}`}
            style={{ transitionDelay: `${i * 60}ms` }}
            key={f.title}
          >
            <div className="lp-feature-icon"><Icon name={f.icon} size={20} /></div>
            <h3>{f.title}</h3>
            <p>{f.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}