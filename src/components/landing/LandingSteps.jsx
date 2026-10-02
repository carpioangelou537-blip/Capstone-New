import { HOW_IT_WORKS } from "../../lib/constants";
import { useInView } from "../../hooks/useInView";

export default function LandingSteps() {
  const [ref, inView] = useInView();
  return (
    <section className="lp-section" ref={ref}>
      <div className="steps-section-inner">
        <div className="lp-head">
          <span className="lp-eyebrow" style={{ color: "var(--white)", background: "rgba(255,255,255,0.12)" }}>
            How it works
          </span>
          <h2>From registration to insight, in four steps.</h2>
          <p>Each step unlocks the next — nothing is skipped, and nothing is assumed.</p>
        </div>
        <div className="steps-row">
          {HOW_IT_WORKS.map((s, i) => (
            <div
              className={`step-item ${inView ? "in" : ""}`}
              style={{ transitionDelay: `${i * 90}ms` }}
              key={s.title}
            >
              <div className="step-num">{i + 1}</div>
              <h4>{s.title}</h4>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}