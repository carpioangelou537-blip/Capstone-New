export const CURRENT_YEAR = new Date().getFullYear();

export const PROGRAM_OPTIONS = ["BS Computer Science", "BS Information Technology"];

export const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1990 + 1 },
  (_, i) => String(CURRENT_YEAR - i)
);

export const EMPLOYMENT_OPTIONS = ["Employed", "Self Employed", "Unemployed"];

export const COURSE_KEYWORDS = [
  "developer", "programmer", "software", "web", "app", "application", "system", "systems",
  "network", "networking", "information technology", "database", "data", "cyber", "security",
  "cloud", "qa", "quality assurance", "tester", "engineer", "engineering", "support", "helpdesk",
  "help desk", "administrator", "admin", "analyst", "ui", "ux", "designer", "devops", "technician",
  "coder", "programming", "infrastructure", "technical",
];

export const ADMIN_FEATURES = [
  { icon: "grid", title: "Dashboard", text: "A quick overview of the alumni network — new activity and pending items surface here first." },
  { icon: "shield", title: "Login & Verification", text: "Every sign-in is checked against the account database, and every new alumni registration is reviewed right here — confirm submitted details, then approve or reject an account before it can reach the survey and dashboard." },
  { icon: "users", title: "Manage User Accounts", text: "Create, update, view, and remove staff and alumni accounts, keeping access and security controls enforced system-wide." },
  { icon: "id", title: "View Alumni Information", text: "Browse alumni records — student details, employment history, and self-reported skills — in one monitored view." },
  { icon: "chart", title: "View Survey Results", text: "Review alumni responses to issued surveys to track outcomes, response patterns, and emerging work trends." },
  { icon: "bell", title: "Manage Notifications", text: "Send announcements, reminders, and alerts to alumni to keep engagement and response rates high." },
  { icon: "spark", title: "View AI Analytics", text: "See AI-generated career-tracking analytics showing which skills and coursework shape alumni outcomes, informing curriculum decisions." },
  { icon: "brief", title: "Career Tools & Job Postings", text: "Maintain job recommendations and postings shared by partner schools, published for alumni through the Career Tools module." },
  { icon: "calendar", title: "Manage Event Posting", text: "Set up and announce alumni events, then track attendee responses through the Events Response System." },
];

export function getAlumniFeatures() {
  return [
    { icon: "grid", title: "Dashboard", text: "A quick overview of your profile, matches, and updates — jump straight to any module from here." },
    { icon: "doc", title: "Complete the Alumni Survey", text: "Share your employment status and current skill set so it can be matched against the job bank and your field of study." },
    { icon: "chart", title: "Job Alignment", text: "See how closely your current skills line up with what employers are hiring for right now." },
    { icon: "brief", title: "Career Tools", text: "Get AI-generated matches between your skills, profile, and open career opportunities." },
    { icon: "calendar", title: "Events & Activities", text: "Browse upcoming alumni events and respond — RSVP, decline, or leave feedback — through the Event Response System." },
  ];
}

export const LANDING_FEATURES = [
  { icon: "id", title: "Alumni Tracking", text: "One record per graduate — program, employment, and skills — kept current and easy to search." },
  { icon: "brief", title: "Career Tools", text: "Curated job postings from partner employers, matched against each alumnus's own skill set." },
  { icon: "doc", title: "Survey System", text: "A short employment survey that feeds every other module the moment it's submitted." },
  { icon: "chart", title: "Job-Course Alignment", text: "See how closely real job openings match what each program actually teaches." },
  { icon: "spark", title: "Analytics", text: "AI-assisted insight into which skills and courses lead to strong outcomes." },
  { icon: "bell", title: "Alumni Updates", text: "Announcements, survey reminders, and events reach alumni the moment they're posted." },
];

export const HOW_IT_WORKS = [
  { title: "Register", text: "Alumni create an account with their program and graduation year." },
  { title: "Admin Verification", text: "The Alumni Affairs Office reviews and confirms each new registration." },
  { title: "Complete Survey", text: "Verified alumni report their employment status and current skills." },
  { title: "View Analytics", text: "Career alignment, skill demand, and job matches unlock right away." },
];

export const NOTIFICATION_TARGETS = [
  "Complete the Alumni Survey",
  "Career Tools",
  "Job Alignment",
  "Events & Activities",
];