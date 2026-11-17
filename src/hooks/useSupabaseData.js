import { useEffect, useMemo, useState } from "react";
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

const DATA_LOAD_TIMEOUT_MS = 15000;

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

    setLoading(true);
    setAlumniReady(false);
    setAlumniLoadError(false);
    setDataErrors([]);

    async function load() {
      let timeoutId;
      try {
        const remote = await Promise.race([
          api.fetchAll((rows, error) => {
            if (cancelled) return;
            setAlumni(rows);
            setAlumniLoadError(Boolean(error));
            setAlumniReady(true);
          }),
          new Promise((_, reject) => {
            timeoutId = setTimeout(
              () => reject(new Error(`Supabase data request timed out after ${DATA_LOAD_TIMEOUT_MS / 1000} seconds.`)),
              DATA_LOAD_TIMEOUT_MS,
            );
          }),
        ]);
        if (cancelled) return;
        setAlumni(remote.alumni);
        setJobs(remote.jobs);
        setEvents(remote.events);
        setNotifications(remote.notifications);
        setSurveyResponses(remote.surveyResponses);
        setSkillsHistory(remote.skillsHistory);
        setSkillRecommendations(remote.skillRecommendations);
        setAdminActivityLogs(remote.adminActivityLogs);
        setDataErrors(remote.errors);
        remote.errors.forEach((error) => {
          console.error(`Could not load Supabase resource "${error.resource}".`, error.message);
        });
        setDbStatus(remote.errors.length === 0 ? "connected" : "partial");
      } catch (error) {
        if (cancelled) return;
        console.error("Could not load data from Supabase; showing the dashboard without remote data.", error);
        setAlumni([]);
        setJobs([]);
        setEvents([]);
        setNotifications([]);
        setSurveyResponses([]);
        setSkillsHistory([]);
        setSkillRecommendations([]);
        setAdminActivityLogs([]);
        setDataErrors([{ resource: "database", message: error.message || "Database request failed." }]);
        setDbStatus("offline");
      } finally {
        clearTimeout(timeoutId);
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