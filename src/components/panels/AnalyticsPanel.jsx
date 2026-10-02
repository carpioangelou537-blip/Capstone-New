import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { isEmployedStatus } from "../../lib/utils";
import EmptyState from "../ui/EmptyState";

const EMPLOYMENT_COLORS = {
  Employed: "#3a0a11",
  "Self Employed": "#5c0f1a",
  Unemployed: "#8b1e3f",
  Unknown: "#b6a2a0",
};

const BAR_COLORS = {
  alumni: "#5c0f1a",
  demand: "#8b1e3f",
};

function DonutTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  return (
    <div
      style={{
        background: "#1a1414",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.15)",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: "0.78rem",
        boxShadow: "0 10px 24px -10px rgba(0,0,0,0.6)",
      }}
    >
      <b>{item.name}</b>: {item.value}
    </div>
  );
}

export default function AnalyticsPanel({ alumni, jobs, surveyResponses = [] }) {
  const latestByUser = new Map();
  surveyResponses.forEach((response) => {
    if (response.userId && !latestByUser.has(response.userId)) latestByUser.set(response.userId, response);
  });
  const currentAlumni = alumni.map((alumnus) => {
    const latest = latestByUser.get(alumnus.userId);
    return latest ? { ...alumnus, ...latest, skills: latest.skills } : alumnus;
  });
  const employedCount = currentAlumni.filter((a) => isEmployedStatus(a.employed)).length;
  const selfEmployedCount = currentAlumni.filter((a) => a.employed === "Self Employed").length;
  const unemployedCount = currentAlumni.filter((a) => a.employed === "Unemployed").length;
  const unknownCount = currentAlumni.filter((a) => !isEmployedStatus(a.employed) && a.employed !== "Unemployed").length;

  const employmentData = [
    { name: "Employed", value: employedCount - selfEmployedCount },
    { name: "Self Employed", value: selfEmployedCount },
    { name: "Unemployed", value: unemployedCount },
    { name: "Unknown", value: unknownCount },
  ].filter((d) => d.value > 0);

  const freq = {};
  currentAlumni.forEach((a) => a.skills.forEach((skill) => {
    const key = String(skill).trim().toLowerCase();
    if (!key) return;
    if (!freq[key]) freq[key] = { label: String(skill).trim(), count: 0 };
    freq[key].count += 1;
  }));
  const demand = {};
  jobs.forEach((job) => job.skills.forEach((skill) => {
    const key = String(skill).trim().toLowerCase();
    if (key) demand[key] = (demand[key] || 0) + 1;
  }));
  const skillList = Object.keys(freq).sort((a, b) => freq[b].count - freq[a].count).slice(0, 6);
  const maxFreq = Math.max(1, ...skillList.map((skill) => freq[skill].count));

  const skillsData = skillList.map((s) => ({
    skill: freq[s].label,
    alumni: freq[s].count,
    demand: demand[s] || 0,
    pct: Math.round((freq[s].count / maxFreq) * 100),
  }));

  const total = alumni.length;
  const completed = currentAlumni.filter((a) => a.surveyCompleted || latestByUser.has(a.userId)).length;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="panel-block">
      <div className="overview-block-title" style={{ marginTop: 4 }}>
        Employment distribution
      </div>
      {employmentData.length === 0 ? (
        <EmptyState icon="spark" text="No employment data yet — analytics populate once alumni submit surveys." />
      ) : (
        <div style={{ width: "100%", height: 250 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={employmentData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={58}
                outerRadius={88}
                paddingAngle={3}
                stroke="#ffffff"
                strokeWidth={2}
              >
                {employmentData.map((entry) => (
                  <Cell key={entry.name} fill={EMPLOYMENT_COLORS[entry.name] || "#5c0f1a"} />
                ))}
              </Pie>
              <Tooltip content={<DonutTooltip />} />
              <Legend
                formatter={(value) => <span style={{ color: "#4a4a4a", fontSize: "0.76rem" }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overview-block-title">Survey response rate</div>
      <div className="bar-row">
        <div className="bar-label">Completion</div>
        <div className="bar-track"><div className="bar-fill" style={{ width: `${completionPct}%` }} /></div>
        <div className="bar-value">{completionPct}%</div>
      </div>

      <div className="overview-block-title">Top alumni skills vs. employer demand</div>
      {skillsData.length === 0 ? (
        <EmptyState icon="spark" text="Analytics will populate once alumni submit skills." />
      ) : (
        <div style={{ width: "100%", height: 280 }}>
          <ResponsiveContainer>
            <BarChart data={skillsData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e6e1df" vertical={false} />
              <XAxis
                dataKey="skill"
                tickLine={false}
                axisLine={{ stroke: "#d8d2d0" }}
                tick={{ fill: "#4a4a4a", fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                tick={{ fill: "#6b6b6b", fontSize: 11 }}
              />
              <Tooltip
                cursor={{ fill: "rgba(92,15,26,0.05)" }}
                contentStyle={{
                  background: "#1a1414",
                  color: "#fff",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: 8,
                  fontSize: "0.76rem",
                }}
                labelStyle={{ color: "#fff", fontWeight: 700 }}
              />
              <Legend
                formatter={(value) => (
                  <span style={{ color: "#4a4a4a", fontSize: "0.76rem" }}>
                    {value === "alumni" ? "Alumni count" : "Employer demand"}
                  </span>
                )}
              />
              <Bar dataKey="alumni" name="alumni" fill={BAR_COLORS.alumni} radius={[6, 6, 0, 0]} maxBarSize={34} />
              <Bar dataKey="demand" name="demand" fill={BAR_COLORS.demand} radius={[6, 6, 0, 0]} maxBarSize={34} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="overview-block-title">How to read this</div>
      <p style={{ fontSize: "0.82rem", color: "#4a4a4a", lineHeight: 1.6, marginTop: 4 }}>
        The donut shows the employment status of every registered alumni. The bar chart compares the most
        commonly reported alumni skills against the skills actually requested in open partner postings —
        gaps here are curriculum opportunities for the AAO.
      </p>
    </div>
  );
}