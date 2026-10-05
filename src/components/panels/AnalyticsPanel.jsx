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
import { extractJobSkills, latestSurveyResponses, mergeLatestSurveyResponses } from "../../lib/browserMl";
import EmptyState from "../ui/EmptyState";
import MLInsights from "./MLInsights";

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
  const latestByUser = latestSurveyResponses(surveyResponses);
  const verifiedAlumni = alumni.filter((alumnus) => alumnus.verificationStatus === "verified");
  const currentAlumni = mergeLatestSurveyResponses(verifiedAlumni, surveyResponses);
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
  currentAlumni.forEach((a) => new Set((a.skills || []).map((skill) => String(skill).trim().toLowerCase())).forEach((key) => {
    if (!key) return;
    if (!freq[key]) {
      const original = a.skills.find((skill) => String(skill).trim().toLowerCase() === key);
      freq[key] = { label: String(original).trim(), count: 0 };
    }
    freq[key].count += 1;
  }));
  const demand = {};
  const extractedJobs = extractJobSkills(jobs, currentAlumni);
  extractedJobs.forEach((job) => new Set(job.skills.map((skill) => skill.toLowerCase())).forEach((key) => {
    demand[key] = (demand[key] || 0) + 1;
  }));
  const skillList = [...new Set([...Object.keys(freq), ...Object.keys(demand)])]
    .sort((a, b) => (demand[b] || 0) - (demand[a] || 0) || (freq[b]?.count || 0) - (freq[a]?.count || 0))
    .slice(0, 6);
  const maxFreq = Math.max(1, ...skillList.map((skill) => freq[skill]?.count || 0));

  const skillsData = skillList.map((s) => ({
    skill: freq[s]?.label || extractedJobs.flatMap((job) => job.skills).find((skill) => skill.toLowerCase() === s) || s,
    alumni: freq[s]?.count || 0,
    demand: demand[s] || 0,
    pct: Math.round(((freq[s]?.count || 0) / maxFreq) * 100),
  }));

  const total = verifiedAlumni.length;
  const completed = verifiedAlumni.filter((a) => a.surveyCompleted || latestByUser.has(a.userId)).length;
  const completionPct = total ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="panel-block">
      <MLInsights alumni={alumni} jobs={jobs} surveyResponses={surveyResponses} />
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
                itemStyle={{ color: "#fff" }}
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
        Employment distribution and survey response rate include verified alumni only. The bar chart
        counts each distinct extracted job skill once per posting and each distinct reported skill once
        per verified alumnus; unverified accounts do not affect these outcome analytics.
      </p>
    </div>
  );
}