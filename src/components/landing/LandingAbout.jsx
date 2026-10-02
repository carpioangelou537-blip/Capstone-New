import { useInView } from "../../hooks/useInView";
import Icon from "../ui/Icon";

export default function LandingAbout() {
  const [ref, inView] = useInView();
  return (
    <section
      className="lp-section about-section"
      ref={ref}
      style={{ opacity: inView ? 1 : 0, transition: "opacity 0.6s var(--ease)" }}
    >
      <div className="about-copy">
        <span className="lp-eyebrow">About the system</span>
        <h2>Built for one job: keep the Alumni Tracer honest.</h2>
        <p>
          Every IT and CS graduate gets a living profile — updated through a short survey rather than a
          one-time exit form. The Alumni Affairs Office verifies each account before it goes live, so the
          data behind every chart and recommendation actually reflects real people.
        </p>
        <p>
          From there, the system does the matching: skills against job postings, job titles against course
          curricula, and outcomes against the programs that produced them.
        </p>
      </div>
      <div className="about-visual">
        <div className="about-visual-row">
          <div className="about-visual-icon"><Icon name="shield" size={17} /></div>
          <div className="about-visual-text"><b>Verified accounts only</b><span>Admin review before survey access</span></div>
        </div>
        <div className="about-visual-row">
          <div className="about-visual-icon"><Icon name="chart" size={17} /></div>
          <div className="about-visual-text"><b>Live alignment scoring</b><span>Skills vs. market demand, always current</span></div>
        </div>
        <div className="about-visual-row">
          <div className="about-visual-icon"><Icon name="academic" size={17} /></div>
          <div className="about-visual-text"><b>Program-level insight</b><span>Which courses translate into hires</span></div>
        </div>
      </div>
    </section>
  );
}