import { useInView } from "../../hooks/useInView";
import AnimatedNumber from "../ui/AnimatedNumber";

export default function LandingStats({ alumni }) {
  const [ref, inView] = useInView(0.3);
  const registered = alumni.length;
  const verified = alumni.filter((a) => a.verificationStatus === "verified").length;
  const surveyed = alumni.filter((a) => a.surveyCompleted).length;
  const tracked = alumni.filter((a) => a.employed && a.employed !== "Unknown").length;
  const stats = [
    { label: "Registered alumni", value: String(registered) },
    { label: "Verified alumni", value: String(verified) },
    { label: "Completed surveys", value: String(surveyed) },
    { label: "Careers tracked", value: String(tracked) },
  ];
  return (
    <section className="lp-section" ref={ref}>
      <div className="stats-section-inner">
        {stats.map((s) => (
          <div className="stat-lp" key={s.label}>
            <b><AnimatedNumber value={s.value} start={inView} /></b>
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}