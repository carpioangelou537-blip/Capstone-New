import { isEmployedStatus } from "../../lib/utils";
import Icon from "../ui/Icon";
import EmptyState from "../ui/EmptyState";

export default function SurveyResultsPanel({ alumni, surveyResponses }) {
  const total = alumni.length;
  const responses = surveyResponses || [];
  const latestByUser = new Map();
  responses.forEach((response) => {
    if (response.userId && !latestByUser.has(response.userId)) latestByUser.set(response.userId, response);
  });
  const completed = alumni.filter((a) => a.surveyCompleted || latestByUser.has(a.userId)).length;
  const employed = alumni.filter((a) => isEmployedStatus(a.employed)).length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const empPct = total ? Math.round((employed / total) * 100) : 0;
  const nameByUser = new Map(alumni.filter((a) => a.userId).map((a) => [a.userId, a.name]));

  return (
    <div className="panel-block">
      <div className="access-check-row">
        <div className="access-check-item">
          <Icon name="chart" size={16} />
          <span>Each submitted survey is stored in the survey responses table and drives these stats.</span>
        </div>
        <div className="access-check-stat">
          <b>{responses.length}</b>
          <span>responses recorded</span>
        </div>
      </div>
      <div className="bar-row" style={{ marginTop: 4 }}>
        <div className="bar-label">Survey completion</div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="bar-value">{pct}%</div>
      </div>
      <div className="bar-row">
        <div className="bar-label">Employed alumni</div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${empPct}%` }} /></div>
        <div className="bar-value">{empPct}%</div>
      </div>
      <div className="list-block" style={{ marginTop: 18 }}>
        {responses.length === 0 && <EmptyState icon="chart" text="No survey responses yet. They'll appear here as alumni submit theirs." />}
        {responses.map((response) => (
          <div className="list-item" key={response.id}>
            <div className="list-item-main">
              <div className="list-item-title">{nameByUser.get(response.userId) || "Alumni survey"}</div>
              <div className="list-item-sub">{response.submittedAt ? new Date(response.submittedAt).toLocaleDateString() : "Date unavailable"} · {response.employed}</div>
            </div>
            <div className="chip-row">{response.skills.slice(0, 3).map((s) => <span className="chip" key={s}>{s}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}