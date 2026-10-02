import { CURRENT_YEAR } from "./constants";
import { uid, freshSelf } from "./utils";

export const SEED_ALUMNI = [
  freshSelf(),
  { id: uid(), name: "Maria Santos", program: "BS Information Technology", gradYear: "2022", employed: "Employed", jobTitle: "Data & Systems Coordinator", companyName: "CDO Analytics Hub", businessName: "", years: "3", skills: ["SQL", "Project Management", "Python"], surveyCompleted: true, avatar: null, verificationStatus: "verified", isSelf: false },
  { id: uid(), name: "Jerome Villanueva", program: "BS Computer Science", gradYear: "2023", employed: "Employed", jobTitle: "Frontend Developer", companyName: "Iligan Digital Solutions", businessName: "", years: "1", skills: ["React", "Node.js", "UI/UX"], surveyCompleted: true, avatar: null, verificationStatus: "verified", isSelf: false },
  { id: uid(), name: "Angel Reyes", program: "BS Information Technology", gradYear: "2021", employed: "Self Employed", jobTitle: "", companyName: "", businessName: "Reyes Network Consulting", years: "4", skills: ["Networking", "Cybersecurity"], surveyCompleted: true, avatar: null, verificationStatus: "verified", isSelf: false },
  { id: uid(), name: "Paolo Cruz", program: "BS Computer Science", gradYear: String(CURRENT_YEAR), employed: "Unemployed", jobTitle: "", companyName: "", businessName: "", years: "", skills: ["Java", "Data Analysis"], surveyCompleted: true, avatar: null, verificationStatus: "verified", isSelf: false },
  { id: uid(), name: "Kristine Bautista", program: "BS Information Technology", gradYear: String(CURRENT_YEAR), employed: "Unknown", jobTitle: "", companyName: "", businessName: "", years: "", skills: [], surveyCompleted: false, avatar: null, verificationStatus: "pending", isSelf: false },
];

export const SEED_JOBS = [
  { id: uid(), title: "Junior Web Developer", company: "Iligan Digital Solutions", skills: ["JavaScript", "React"], link: "https://www.facebook.com/" },
  { id: uid(), title: "IT Support Specialist", company: "Northern Mindanao Hospital", skills: ["Networking", "Cybersecurity"], link: "" },
  { id: uid(), title: "Data Analyst", company: "CDO Analytics Hub", skills: ["Python", "Data Analysis", "SQL"], link: "https://www.linkedin.com/" },
];

export const SEED_EVENTS = [
  { id: uid(), title: "Homecoming & Career Fair", date: "2026-09-12", rsvps: [] },
  { id: uid(), title: "IT Alumni Tech Talk", date: "2026-10-03", rsvps: ["Maria Santos"] },
];

export const SEED_NOTIFICATIONS = [
  { id: uid(), text: "Welcome to the Alumni Tracer System! Complete your survey to unlock job matches.", date: "2026-08-01", target: "Complete the Alumni Survey" },
];

export const SEED_SURVEY_RESPONSES = [
  { id: uid(), userId: "", employed: "Employed", jobTitle: "Junior Web Developer", companyName: "Iligan Digital Solutions", businessName: "", years: "1", skills: ["JavaScript", "React"], submittedAt: "2026-07-01", updatedAt: "2026-07-01" },
  { id: uid(), userId: "", employed: "Employed", jobTitle: "Data & Systems Coordinator", companyName: "CDO Analytics Hub", businessName: "", years: "3", skills: ["SQL", "Project Management", "Python"], submittedAt: "2026-06-15", updatedAt: "2026-06-15" },
  { id: uid(), userId: "", employed: "Employed", jobTitle: "Frontend Developer", companyName: "Iligan Digital Solutions", businessName: "", years: "1", skills: ["React", "Node.js", "UI/UX"], submittedAt: "2026-06-02", updatedAt: "2026-06-02" },
  { id: uid(), userId: "", employed: "Self Employed", jobTitle: "", companyName: "", businessName: "Reyes Network Consulting", years: "4", skills: ["Networking", "Cybersecurity"], submittedAt: "2026-05-20", updatedAt: "2026-05-20" },
  { id: uid(), userId: "", employed: "Unemployed", jobTitle: "", companyName: "", businessName: "", years: "", skills: ["Java", "Data Analysis"], submittedAt: "2026-05-10", updatedAt: "2026-05-10" },
];

export const SEED_SKILLS_HISTORY = [
  { id: uid(), userId: "", skills: ["JavaScript", "React", "SQL"], snapshotDate: "2026-08-01" },
  { id: uid(), userId: "", skills: ["React", "Node.js", "UI/UX"], snapshotDate: "2026-08-15" },
];

export const SEED_COURSE_RECOMMENDATIONS = [
  { id: uid(), userId: "", skill: "Networking", demand: 1, reason: "Requested by IT Support Specialist at Northern Mindanao Hospital", createdAt: "2026-08-01" },
  { id: uid(), userId: "", skill: "Node.js", demand: 1, reason: "Requested by Junior Web Developer at Iligan Digital Solutions", createdAt: "2026-08-01" },
];

export const SEED_JOB_APPLICATIONS = [
  { id: uid(), userId: "", jobId: null, status: "applied", appliedAt: "2026-08-20" },
];

export const SEED_ACTIVITY_LOGS = [
  { id: uid(), adminUserId: "", action: "approved_alumnus", detail: "Maria Santos", createdAt: "2026-08-01 08:12:00" },
  { id: uid(), adminUserId: "", action: "published_job", detail: "Junior Web Developer at Iligan Digital Solutions", createdAt: "2026-08-02 09:00:00" },
];