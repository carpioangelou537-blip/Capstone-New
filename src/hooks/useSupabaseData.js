import { useEffect, useMemo, useRef, useState } from "react";
import {
  SEED_ALUMNI,
  SEED_JOBS,
  SEED_EVENTS,
  SEED_NOTIFICATIONS,
  SEED_SURVEY_RESPONSES,
  SEED_SKILLS_HISTORY,
  SEED_SKILL_RECOMMENDATIONS,
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
  const [skillRecommendations, setSkillRecommendations] = useState(SEED_SKILL_RECOMMENDATIONS);
  const [adminActivityLogs, setAdminActivityLogs] = useState(SEED_ACTIVITY_LOGS);
  const [dbStatus, setDbStatus] = useState("idle");
  const [loading, setLoading] = useState(false);
  const [alumniReady, setAlumniReady] = useState(false);
  const [alumniLoadError, setAlumniLoadError] = useState(false);
  const [dataErrors, setDataErrors] = useState([]);
  const activeDataUserId = useRef(null);

  const userId = user?.id || null;

  useEffect(() => {
    let cancelled = false;

    if (!userId) {
      activeDataUserId.current = null;
      setAlumni(SEED_ALUMNI);
      setJobs(SEED_JOBS);
      setEvents(SEED_EVENTS);
      setNotifications(SEED_NOTIFICATIONS);
      setSurveyResponses(SEED_SURVEY_RESPONSES);
      setSkillsHistory(SEED_SKILLS_HISTORY);
      setSkillRecommendations(SEED_SKILL_RECOMMENDATIONS);
      setAdminActivityLogs(SEED_ACTIVITY_LOGS);
      setDbStatus("idle");
      setLoading(false);
      setAlumniReady(false);
      setAlumniLoadError(false);
      setDataErrors([]);
      return () => {
        cancelled = true;
      };
    }

    if (activeDataUserId.current !== userId) {
      activeDataUserId.current = userId;
      setAlumni([]);
      setJobs([]);
      setEvents([]);
      setNotifications([]);
      setSurveyResponses([]);
      setSkillsHistory([]);
      setSkillRecommendations([]);
      setAdminActivityLogs([]);
    }

    setLoading(true);
    setAlumniReady(false);
    setAlumniLoadError(false);
    setDataErrors([]);

    async function load() {
      try {
        const remote = await api.fetchAll({
          userId,
          isAdmin: user?.app_metadata?.role === "admin",
          onAlumniLoaded(rows, error) {
            if (cancelled) return;
            setAlumni(rows);
            setAlumniLoadError(Boolean(error));
            setAlumniReady(true);
          },
        });
        if (cancelled) return;
        const failedResources = new Set(remote.errors.map((error) => error.resource));
        if (!failedResources.has("alumni")) setAlumni(remote.alumni);
        if (!failedResources.has("jobs")) setJobs(remote.jobs);
        if (!failedResources.has("events")) setEvents(remote.events);
        if (!failedResources.has("notifications")) setNotifications(remote.notifications);
        if (!failedResources.has("surveyResponses")) setSurveyResponses(remote.surveyResponses);
        if (!failedResources.has("skillsHistory")) setSkillsHistory(remote.skillsHistory);
        if (!failedResources.has("skillRecommendations")) setSkillRecommendations(remote.skillRecommendations);
        if (!failedResources.has("adminActivityLogs")) setAdminActivityLogs(remote.adminActivityLogs);
        setDataErrors(remote.errors);
        remote.errors.forEach((error) => {
          console.error(`Could not load Supabase resource "${error.resource}".`, error.message);
        });
        setDbStatus(remote.errors.length === 0 ? "connected" : "partial");
      } catch (error) {
        if (cancelled) return;
        console.error("Could not load data from Supabase; showing the dashboard without remote data.", error);
        setDataErrors([{ resource: "database", message: error.message || "Database request failed." }]);
        setDbStatus("offline");
      } finally {
        if (!cancelled) {
          setAlumniReady(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, user?.app_metadata?.role, refreshKey]);

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
    skillRecommendations,
    adminActivityLogs,
    me,
    loading,
    dbStatus,
    alumniReady,
    alumniLoadError,
    dataErrors,
    setAlumni,
    setJobs,
    setEvents,
    setNotifications,
    setSurveyResponses,
    setSkillsHistory,
    setSkillRecommendations,
    setAdminActivityLogs,
  };
}