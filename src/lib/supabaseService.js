import { supabase } from "../supabaseClient";

/* ------------------------------ auth --------------------------------- */

export async function signUp(email, password, metadata) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  });
  return { user: data?.user || null, session: data?.session || null, identities: data?.identities || [], error };
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { user: data?.user || null, session: data?.session || null, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSessionUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
}

export function onAuthChange(callback) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user || null);
  });

  return data?.subscription || null;
}

const TABLES = {
  alumni: "alumni",
  jobs: "jobs",
  events: "events",
  notifications: "notifications",
  surveyResponses: "survey_responses",
  skillsHistory: "alumni_skills_history",
  courseRecommendations: "course_recommendations",
  jobApplications: "job_applications",
  adminActivityLogs: "admin_activity_logs",
};

const ALUMNUS_COLUMN_MAP = {
  name: "full_name",
  program: "program",
  gradYear: "grad_year",
  employed: "employed",
  jobTitle: "job_title",
  companyName: "company_name",
  businessName: "business_name",
  years: "years",
  skills: "skills",
  surveyCompleted: "survey_completed",
  avatar: "avatar_url",
  verificationStatus: "verification_status",
  isSelf: "is_self",
};

function alumnusToRow(rec) {
  const row = {};
  for (const [appKey, dbKey] of Object.entries(ALUMNUS_COLUMN_MAP)) {
    if (Object.prototype.hasOwnProperty.call(rec, appKey) && rec[appKey] !== undefined) {
      row[dbKey] = rec[appKey];
    }
  }
  if (rec.userId !== undefined) {
    row.user_id = rec.userId;
  }
  return row;
}

function rowToAlumnus(row) {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.full_name,
    program: row.program,
    gradYear: row.grad_year != null ? String(row.grad_year) : "",
    employed: row.employed || "Unknown",
    jobTitle: row.job_title || "",
    companyName: row.company_name || "",
    businessName: row.business_name || "",
    years: row.years || "",
    skills: Array.isArray(row.skills) ? row.skills : [],
    surveyCompleted: Boolean(row.survey_completed),
    avatar: row.avatar_url || null,
    verificationStatus: row.verification_status || "pending",
    isSelf: Boolean(row.is_self),
    createdAt: row.created_at || null,
  };
}

function jobToRow(rec) {
  return {
    id: rec.id,
    title: rec.title,
    company: rec.company,
    skills: rec.skills || [],
    link: rec.link || "",
  };
}

function rowToJob(row) {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    skills: Array.isArray(row.skills) ? row.skills : [],
    link: row.link || "",
  };
}

function eventToRow(rec) {
  return { id: rec.id, title: rec.title, date: rec.date, rsvps: rec.rsvps || [] };
}

function rowToEvent(row) {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    rsvps: Array.isArray(row.rsvps) ? row.rsvps : [],
  };
}

function notificationToRow(rec) {
  return { id: rec.id, text: rec.text, date: rec.date, target: rec.target || null };
}

function rowToNotification(row) {
  return { id: row.id, text: row.text, date: row.date, target: row.target || null };
}

function surveyToRow(rec) {
  return {
    id: rec.id,
    user_id: rec.userId || null,
    employed: rec.employed || "Unknown",
    job_title: rec.jobTitle || "",
    company_name: rec.companyName || "",
    business_name: rec.businessName || "",
    years: rec.years || "",
    skills: rec.skills || [],
    submitted_at: rec.submittedAt || null,
    updated_at: rec.updatedAt || null,
  };
}

function rowToSurvey(row) {
  return {
    id: row.id,
    userId: row.user_id,
    employed: row.employed || "Unknown",
    jobTitle: row.job_title || "",
    companyName: row.company_name || "",
    businessName: row.business_name || "",
    years: row.years || "",
    skills: Array.isArray(row.skills) ? row.skills : [],
    submittedAt: row.submitted_at || null,
    updatedAt: row.updated_at || null,
  };
}

function skillsToRow(rec) {
  return {
    id: rec.id,
    user_id: rec.userId || null,
    skills: rec.skills || [],
    snapshot_date: rec.snapshotDate || null,
  };
}

function rowToSkills(row) {
  return { id: row.id, userId: row.user_id, skills: Array.isArray(row.skills) ? row.skills : [], snapshotDate: row.snapshot_date || null };
}

function recommendationToRow(rec) {
  return {
    id: rec.id,
    user_id: rec.userId || null,
    skill: rec.skill || "",
    demand: rec.demand != null ? rec.demand : 0,
    reason: rec.reason || "",
    created_at: rec.createdAt || null,
  };
}

function rowToRecommendation(row) {
  return {
    id: row.id,
    userId: row.user_id,
    skill: row.skill || "",
    demand: row.demand != null ? row.demand : 0,
    reason: row.reason || "",
    createdAt: row.created_at || null,
  };
}

function applicationToRow(rec) {
  return {
    id: rec.id,
    user_id: rec.userId || null,
    job_id: rec.jobId || null,
    status: rec.status || "applied",
    applied_at: rec.appliedAt || null,
  };
}

function rowToApplication(row) {
  return {
    id: row.id,
    userId: row.user_id,
    jobId: row.job_id || null,
    status: row.status || "applied",
    appliedAt: row.applied_at || null,
  };
}

function activityToRow(rec) {
  return {
    id: rec.id,
    admin_user_id: rec.adminUserId || null,
    action: rec.action || "",
    detail: rec.detail || "",
    created_at: rec.createdAt || null,
  };
}

function rowToActivity(row) {
  return {
    id: row.id,
    adminUserId: row.admin_user_id,
    action: row.action || "",
    detail: row.detail || "",
    createdAt: row.created_at || null,
  };
}

/* ------------------------------- reads ------------------------------- */

export async function fetchAlumni() {
  const { data, error } = await supabase
    .from(TABLES.alumni)
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToAlumnus);
}

export async function fetchMyAlumnus(userId) {
  const { data, error } = await supabase
    .from(TABLES.alumni)
    .select("*")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToAlumnus(data) : null;
}

/* find an old row created before login-linking existed (user_id null) that
   belongs to this name, so sign-in can claim it instead of stacking a new
   pending account on top */
export async function findUnlinkedAlumnusByName(name) {
  const { data, error } = await supabase
    .from(TABLES.alumni)
    .select("*")
    .is("user_id", null)
    .eq("full_name", name)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? rowToAlumnus(data) : null;
}

export async function fetchJobs() {
  const { data, error } = await supabase
    .from(TABLES.jobs)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToJob);
}

export async function fetchEvents() {
  const { data, error } = await supabase
    .from(TABLES.events)
    .select("*")
    .order("date", { ascending: true });
  if (error) throw error;
  return (data || []).map(rowToEvent);
}

export async function fetchNotifications() {
  const { data, error } = await supabase
    .from(TABLES.notifications)
    .select("*")
    .order("date", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToNotification);
}

export async function fetchSurveyResponses() {
  const { data, error } = await supabase
    .from(TABLES.surveyResponses)
    .select("*")
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToSurvey);
}

export async function fetchSkillsHistory() {
  const { data, error } = await supabase
    .from(TABLES.skillsHistory)
    .select("*")
    .order("snapshot_date", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToSkills);
}

export async function fetchCourseRecommendations() {
  const { data, error } = await supabase
    .from(TABLES.courseRecommendations)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToRecommendation);
}

export async function fetchJobApplications() {
  const { data, error } = await supabase
    .from(TABLES.jobApplications)
    .select("*")
    .order("applied_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToApplication);
}

export async function fetchAdminActivityLogs() {
  const { data, error } = await supabase
    .from(TABLES.adminActivityLogs)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToActivity);
}

export async function fetchAll() {
  const [alumni, jobs, events, notifications, surveyResponses, skillsHistory, courseRecommendations, jobApplications, adminActivityLogs] =
    await Promise.all([
      fetchAlumni(),
      fetchJobs(),
      fetchEvents(),
      fetchNotifications(),
      fetchSurveyResponses(),
      fetchSkillsHistory(),
      fetchCourseRecommendations(),
      fetchJobApplications(),
      fetchAdminActivityLogs(),
    ]);
  return { alumni, jobs, events, notifications, surveyResponses, skillsHistory, courseRecommendations, jobApplications, adminActivityLogs };
}

/* ------------------------------ writes ------------------------------ */

export async function updateAlumnus(id, patch) {
  const row = alumnusToRow(patch);
  const { data, error } = await supabase
    .from(TABLES.alumni)
    .update(row)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertAlumnus(rec) {
  const { data, error } = await supabase
    .from(TABLES.alumni)
    .insert(alumnusToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAlumnus(id) {
  const { error } = await supabase.from(TABLES.alumni).delete().eq("id", id);
  if (error) throw error;
}

export async function insertJob(rec) {
  const { data, error } = await supabase
    .from(TABLES.jobs)
    .insert(jobToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteJob(id) {
  const { error } = await supabase.from(TABLES.jobs).delete().eq("id", id);
  if (error) throw error;
}

export async function insertEvent(rec) {
  const { data, error } = await supabase
    .from(TABLES.events)
    .insert(eventToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteEvent(id) {
  const { error } = await supabase.from(TABLES.events).delete().eq("id", id);
  if (error) throw error;
}

export async function setEventRsvps(id, rsvps) {
  const { data, error } = await supabase
    .from(TABLES.events)
    .update({ rsvps })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertNotification(rec) {
  const { data, error } = await supabase
    .from(TABLES.notifications)
    .insert(notificationToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertSurveyResponse(rec) {
  const { data, error } = await supabase
    .from(TABLES.surveyResponses)
    .insert(surveyToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertSkillsHistory(rec) {
  const { data, error } = await supabase
    .from(TABLES.skillsHistory)
    .insert(skillsToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function replaceCourseRecommendations(userId, recs) {
  const { error } = await supabase.from(TABLES.courseRecommendations).delete().eq("user_id", userId);
  if (error) throw error;
  if (recs.length > 0) {
    const rows = recs.map((r) => recommendationToRow({ ...r, userId }));
    const { error: insertError } = await supabase.from(TABLES.courseRecommendations).insert(rows);
    if (insertError) throw insertError;
  }
}

export async function insertJobApplication(rec) {
  const { data, error } = await supabase
    .from(TABLES.jobApplications)
    .insert(applicationToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function insertActivityLog(rec) {
  const { data, error } = await supabase
    .from(TABLES.adminActivityLogs)
    .insert(activityToRow(rec))
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function sendApprovalEmail(userId, email, name) {
  const { data, error } = await supabase.functions.invoke("send-approval-email", {
    body: { userId, email, name },
  });
  if (error) throw error;
  return data;
}