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
  { id: uid(), title: "Software Engineer", company: "Robinsons Land Corporation", skills: ["Java", "Python", "SQL", "debugging"], link: "https://ph.linkedin.com/jobs/view/software-engineer-at-robinsons-land-corporation-4381568711" },
  { id: uid(), title: "IT QA Analyst", company: "Robinsons Land Corporation", skills: ["Software testing", "bug reporting", "documentation"], link: "https://ph.linkedin.com/jobs/view/it-qa-analyst-at-robinsons-land-corporation-4279868022" },
  { id: uid(), title: "IT Support Engineer", company: "LinkedIn", skills: ["Windows", "troubleshooting", "networking"], link: "https://www.linkedin.com/jobs/search/?keywords=IT%20Support%20Engineer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Technical Support Engineer", company: "LinkedIn", skills: ["Hardware", "software", "customer support"], link: "https://www.linkedin.com/jobs/search/?keywords=Technical%20Support%20Engineer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Web Developer", company: "LinkedIn", skills: ["HTML", "CSS", "JavaScript"], link: "https://www.linkedin.com/jobs/search/?keywords=Web%20Developer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Frontend Developer", company: "LinkedIn", skills: ["React", "JavaScript", "responsive design"], link: "https://www.linkedin.com/jobs/search/?keywords=Frontend%20Developer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Backend Developer", company: "LinkedIn", skills: ["Node.js", "SQL", "APIs"], link: "https://www.linkedin.com/jobs/search/?keywords=Backend%20Developer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Full-Stack Developer", company: "LinkedIn", skills: ["React", "backend programming", "databases"], link: "https://www.linkedin.com/jobs/search/?keywords=Full%20Stack%20Developer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Junior Software Developer", company: "LinkedIn", skills: ["Programming", "Git", "debugging"], link: "https://www.linkedin.com/jobs/search/?keywords=Junior%20Software%20Developer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Database Administrator", company: "LinkedIn", skills: ["SQL", "backups", "database security"], link: "https://www.linkedin.com/jobs/search/?keywords=Database%20Administrator&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Network Technician", company: "LinkedIn", skills: ["TCP/IP", "routers", "switches"], link: "https://www.linkedin.com/jobs/search/?keywords=Network%20Technician&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "System Administrator", company: "LinkedIn", skills: ["Windows/Linux", "servers", "security"], link: "https://www.linkedin.com/jobs/search/?keywords=System%20Administrator&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Cybersecurity Analyst", company: "LinkedIn", skills: ["Network security", "threat monitoring"], link: "https://www.linkedin.com/jobs/search/?keywords=Cybersecurity%20Analyst&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Software Tester", company: "LinkedIn", skills: ["QA", "test cases", "bug reporting"], link: "https://www.linkedin.com/jobs/search/?keywords=Software%20Tester&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "UI/UX Designer", company: "LinkedIn", skills: ["Figma", "wireframes", "prototyping"], link: "https://www.linkedin.com/jobs/search/?keywords=UI%20UX%20Designer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "IT Help Desk Technician", company: "LinkedIn", skills: ["Troubleshooting", "ticketing", "Windows"], link: "https://www.linkedin.com/jobs/search/?keywords=IT%20Help%20Desk&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "IT Project Assistant", company: "LinkedIn", skills: ["Documentation", "Excel", "coordination"], link: "https://www.linkedin.com/jobs/search/?keywords=IT%20Project%20Assistant&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Data Analyst", company: "LinkedIn", skills: ["Excel", "SQL", "Power BI"], link: "https://www.linkedin.com/jobs/search/?keywords=Data%20Analyst&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "WordPress Developer", company: "LinkedIn", skills: ["WordPress", "PHP", "HTML", "CSS"], link: "https://www.linkedin.com/jobs/search/?keywords=WordPress%20Developer&location=Iligan%20City%2C%20Philippines" },
  { id: uid(), title: "Process Developer", company: "1000 Miles Limited", skills: ["Workflow automation", "Odoo ERP", "Power Automate"], link: "https://ph.linkedin.com/jobs/view/process-developer-at-1000-miles-limited-4184575937" },
  { id: uid(), title: "IT Staff", company: "Facebook", skills: ["Computer troubleshooting", "MS Office"], link: "https://www.facebook.com/search/posts/?q=IT%20Staff%20Hiring%20Iligan%20City" },
  { id: uid(), title: "Computer Technician", company: "Facebook", skills: ["PC repair", "Windows installation"], link: "https://www.facebook.com/search/posts/?q=Computer%20Technician%20Hiring%20Iligan" },
  { id: uid(), title: "Web Developer", company: "Facebook", skills: ["HTML", "CSS", "JavaScript"], link: "https://www.facebook.com/search/posts/?q=Web%20Developer%20Hiring%20Iligan%20City" },
  { id: uid(), title: "Frontend Developer", company: "Facebook", skills: ["React", "CSS", "responsive design"], link: "https://www.facebook.com/search/posts/?q=Frontend%20Developer%20Hiring%20Iligan" },
  { id: uid(), title: "Backend Developer", company: "Facebook", skills: ["Node.js", "PHP", "SQL"], link: "https://www.facebook.com/search/posts/?q=Backend%20Developer%20Hiring%20Iligan" },
  { id: uid(), title: "Full-Stack Developer", company: "Facebook", skills: ["Frontend", "backend", "databases"], link: "https://www.facebook.com/search/posts/?q=Full%20Stack%20Developer%20Hiring%20Iligan" },
  { id: uid(), title: "IT Support Technician", company: "Facebook", skills: ["Troubleshooting", "networking"], link: "https://www.facebook.com/search/posts/?q=IT%20Support%20Technician%20Hiring%20Iligan" },
  { id: uid(), title: "Technical Support Representative", company: "Facebook", skills: ["Troubleshooting", "communication"], link: "https://www.facebook.com/search/posts/?q=Technical%20Support%20Hiring%20Iligan%20City" },
  { id: uid(), title: "Network Technician", company: "Facebook", skills: ["TCP/IP", "LAN", "routers"], link: "https://www.facebook.com/search/posts/?q=Network%20Technician%20Hiring%20Iligan" },
  { id: uid(), title: "IT Help Desk Staff", company: "Facebook", skills: ["Ticketing", "user support"], link: "https://www.facebook.com/search/posts/?q=IT%20Help%20Desk%20Hiring%20Iligan" },
  { id: uid(), title: "UI/UX Designer", company: "Facebook", skills: ["Figma", "wireframes", "prototypes"], link: "https://www.facebook.com/search/posts/?q=UI%20UX%20Designer%20Hiring%20Iligan" },
  { id: uid(), title: "Graphic Designer", company: "Facebook", skills: ["Canva", "Photoshop", "Illustrator"], link: "https://www.facebook.com/search/posts/?q=Graphic%20Designer%20Hiring%20Iligan" },
  { id: uid(), title: "WordPress Developer", company: "Facebook", skills: ["WordPress", "PHP", "CSS"], link: "https://www.facebook.com/search/posts/?q=WordPress%20Developer%20Hiring%20Iligan" },
  { id: uid(), title: "Software Developer", company: "Facebook", skills: ["Java", "Python", "SQL"], link: "https://www.facebook.com/search/posts/?q=Software%20Developer%20Hiring%20Iligan%20City" },
  { id: uid(), title: "Junior Programmer", company: "Facebook", skills: ["Programming", "debugging"], link: "https://www.facebook.com/search/posts/?q=Junior%20Programmer%20Hiring%20Iligan" },
  { id: uid(), title: "Database Assistant", company: "Facebook", skills: ["SQL", "Excel", "data management"], link: "https://www.facebook.com/search/posts/?q=Database%20Assistant%20Hiring%20Iligan" },
  { id: uid(), title: "IT QA Tester", company: "Facebook", skills: ["Testing", "test cases", "bug reports"], link: "https://www.facebook.com/search/posts/?q=QA%20Tester%20Hiring%20Iligan" },
  { id: uid(), title: "Data Analyst", company: "Facebook", skills: ["Excel", "SQL", "Power BI"], link: "https://www.facebook.com/search/posts/?q=Data%20Analyst%20Hiring%20Iligan" },
  { id: uid(), title: "IT Encoder", company: "Facebook", skills: ["Typing", "Excel", "file management"], link: "https://www.facebook.com/search/posts/?q=IT%20Encoder%20Hiring%20Iligan" },
  { id: uid(), title: "Digital Content Specialist", company: "Facebook", skills: ["Canva", "content creation", "social media"], link: "https://www.facebook.com/search/posts/?q=Social%20Media%20Specialist%20Hiring%20Iligan" },
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