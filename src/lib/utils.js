import { CURRENT_YEAR, COURSE_KEYWORDS } from "./constants";

export function uid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isEmployedStatus(status) {
  return status === "Employed" || status === "Self Employed";
}

export function isJobRelatedToCourse(jobTitle) {
  if (!jobTitle || !jobTitle.trim()) return null;
  const t = jobTitle.toLowerCase();
  return COURSE_KEYWORDS.some((k) => t.includes(k));
}

export function getSkillGaps(me, jobs) {
  const demand = {};
  jobs.forEach((j) =>
    j.skills.forEach((s) => {
      const has = me.skills.some((ms) => ms.toLowerCase() === s.toLowerCase());
      if (!has) demand[s] = (demand[s] || 0) + 1;
    })
  );
  return Object.keys(demand)
    .sort((a, b) => demand[b] - demand[a])
    .map((s) => ({ skill: s, demand: demand[s] }));
}

export function todayString() {
  return new Date().toISOString().slice(0, 10);
}

export function freshSelf() {
  return {
    id: "self",
    isSelf: true,
    name: "You",
    program: "BS Computer Science",
    gradYear: String(CURRENT_YEAR),
    employed: "Unknown",
    jobTitle: "",
    companyName: "",
    businessName: "",
    years: "",
    skills: ["JavaScript", "React"],
    surveyCompleted: false,
    avatar: null,
    verificationStatus: "verified",
  };
}