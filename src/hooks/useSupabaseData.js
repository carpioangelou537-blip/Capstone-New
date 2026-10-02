import { useEffect, useMemo, useState } from "react";
import {
  SEED_ALUMNI,
  SEED_JOBS,
  SEED_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_SURVEY_RESPONSES,
  SEED_SKILLS_HISTORY,
  SEED_COURSE_RECOMMENDATIONS,
  SEED_JOB_APPLICATIONS,
  SEED_ACTIVITY_LOGS,
} from "../lib/seed";
import * as api from "../lib/supabaseService";

/**
 * Loads all app data from Supabase. When nobody is signed in (or Supabase
 * is unreachable) it falls back to the bundled seed data so the landing
 * page and demo still render. When a user is signed in, remote data is
 * used as-is — seeds never mask a real (empty) database.
 */
export function useSupabaseData(user, refreshKey = 0) {
  const [alumni, setAlumni] = useState(SEED_ALUMNI);
  const [jobs, setJobs] = useState(SEED_JOBS);
  const [events, setEvents] = useState(SEED_EVENTS);
  const [notifications, setNotifications] = useState(SEED_NOTIFICATIONS);
  const [surveyResponses, setSurveyResponses] = useState(SEED_SURVEY_RESPONSES);
  const [skillsHistory, setSkillsHistory] = useState(SEED_SKILLS_HISTORY);
  const [courseRecommendations, setCourseRecommendations] = useState(SEED_COURSE_RECOMMENDATIONS);
  const [jobApplications, setJobApplications] = useState(SEED_JOB_APPLICATIONS);
  const [adminActivityLogs, setAdminActivityLogs] = useState(SEED_ACTIVITY_LOGS);
  const [dbStatus, setDbStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const userId = user?.id || null;

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      setAlumni(SEED_ALUMNI);
      setJobs(SEED_JOBS);
      setEvents(SEED_EVENTS);
      setNotifications(SEED_NOTIFICATIONS);
      setSurveyResponses(SEED_SURVEY_RESPONSES);
      setSkillsHistory(SEED_SKILLS_HISTORY);
      setCourseRecommendations(SEED_COURSE_RECOMMENDATIONS);
      setJobApplications(SEED_JOB_APPLICATIONS);
      setAdminActivityLogs(SEED_ACTIVITY_LOGS);
      setDbStatus("idle");
      setLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setLoading(true);

    async function load() {
      try {
        const remote = await api.fetchAll();
        if (cancelled) return;
        setAlumni(remote.alumni);
        setJobs(remote.jobs);
        setEvents(remote.events);
        setNotifications(remote.notifications);
        setSurveyResponses(remote.surveyResponses);
        setSkillsHistory(remote.skillsHistory);
        setCourseRecommendations(remote.courseRecommendations);
        setJobApplications(remote.jobApplications);
        setAdminActivityLogs(remote.adminActivityLogs);
        setDbStatus("connected");
      } catch {
        if (cancelled) return;
        setAlumni([]);
        setJobs([]);
        setEvents([]);
        setNotifications([]);
        setSurveyResponses([]);
        setSkillsHistory([]);
        setCourseRecommendations([]);
        setJobApplications([]);
        setAdminActivityLogs([]);
        setDbStatus("offline");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, refreshKey]);

  const me = useMemo(() => {
    if (!userId) return alumni.find((a) => a.isSelf) || alumni[0] || null;
    const own = alumni.find((a) => a.userId === userId);
    if (!own) return null;
    const hasSurveyRow = surveyResponses.some((s) => s.userId === userId);
    return hasSurveyRow ? { ...own, surveyCompleted: true } : own;
  }, [alumni, userId, surveyResponses]);

  return {
    alumni,
    jobs,
    events,
    notifications,
    surveyResponses,
    skillsHistory,
    courseRecommendations,
    jobApplications,
    adminActivityLogs,
    me,
    loading,
    dbStatus,
    setAlumni,
    setJobs,
    setEvents,
    setNotifications,
    setSurveyResponses,
    setSkillsHistory,
    setCourseRecommendations,
    setJobApplications,
    setAdminActivityLogs,
  };
}