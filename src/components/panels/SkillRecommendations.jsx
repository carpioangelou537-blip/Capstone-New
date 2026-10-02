import { getSkillGaps } from "../../lib/utils";
import EmptyState from "../ui/EmptyState";

export default function SkillRecommendations({ me, jobs }) {
  const gaps = getSkillGaps(me, jobs);
  return (
    <div style={{ marginTop: 18 }}>
      <div className="list-item-sub" style={{ marginBottom: 10 }}>Recommended skills to learn</div>
      {gaps.length === 0 ? (
        <EmptyState icon="spark" text="You already cover every skill currently requested across open postings — nice work." />
      ) : (
        <div className="chip-row">
          {gaps.slice(0, 6).map((g) => (
            <span className="chip match" key={g.skill}>
              {g.skill} <span style={{ opacity: 0.65 }}>· {g.demand} posting{g.demand === 1 ? "" : "s"}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}