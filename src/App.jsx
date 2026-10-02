import { useEffect, useState } from "react";
import { STYLES } from "./styles/global";
import { uid, todayString, getSkillGaps } from "./lib/utils";
import { PROGRAM_OPTIONS, CURRENT_YEAR } from "./lib/constants";
import * as api from "./lib/supabaseService";
import { hasSupabaseEnv } from "./supabaseClient";
import { useSupabaseData } from "./hooks/useSupabaseData";
import SplashScreen from "./components/layout/SplashScreen";
import ToastStack from "./components/ui/ToastStack";
import LandingPage from "./components/landing/LandingPage";
import LoginPage from "./components/auth/LoginPage";
import SignupPage from "./components/auth/SignupPage";
import { PendingVerificationPage, RejectedVerificationPage } from "./components/auth/VerificationPages";
import Dashboard from "./components/dashboard/Dashboard";

function userDisplayName(u) {
  const meta = u.user_metadata || {};
  return [meta.firstName, meta.lastName].filter(Boolean).join(" ");
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [page, setPage] = useState("landing");
  const [role, setRole] = useState("alumni");
  const [name, setName] = useState("");
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [refresh, setRefresh] = useState(0);

  const data = useSupabaseData(user, refresh);
  const {
    alumni,
    jobs,
    events,
    notifications,
    surveyResponses,
    skillsHistory,
    courseRecommendations,
    jobApplications,
    adminActivityLogs,
    setAlumni,
    setJobs,
    setEvents,
    setNotifications,
    setSurveyResponses,
    setCourseRecommendations,
    setJobApplications,
    setAdminActivityLogs,
    loading,
    dbStatus,
    me,
  } = data;
  const [checkedAt, setCheckedAt] = useState(0);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("alumni-tracer-page", page);
      localStorage.setItem("alumni-tracer-role", role);
    } else {
      localStorage.removeItem("alumni-tracer-page");
      localStorage.removeItem("alumni-tracer-role");
    }
  }, [page, role, user]);

  /* restore session + keep it in sync */
  useEffect(() => {
    let active = true;
    const sub = api.onAuthChange((u) => {
      if (!active) return;
      if (u) {
        setUser(u);
        setRole(u.user_metadata?.role || "alumni");
        setName(userDisplayName(u));
      } else {
        setUser(null);
      }
    });
    api.getSessionUser().then((u) => {
      if (!active) return;
      if (u) {
        setUser(u);
        setRole(u.user_metadata?.role || "alumni");
        setName(userDisplayName(u));
        setPage("splash");
      }
      setAuthChecked(true);
    }).catch(() => {
      if (!active) return;
      setAuthChecked(true);
    });
    return () => {
      active = false;
      sub?.unsubscribe?.();
    };
  }, []);

  /* signing out (or an unauthenticated visitor) lands on the landing page */
  useEffect(() => {
    if (!authChecked) return;
    if (!user && ["dashboard", "pending", "rejected", "splash"].includes(page)) {
      setPage("landing");
    }
  }, [authChecked, user, page]);

  /* once a user is authenticated and their data has loaded, resolve the
     correct page: admin -> dashboard, alumnus -> verified dashboard (a
     forcing survey modal opens there for new alumni), otherwise the
     pending/rejected gate. Routing never trusts seed data as the real
     authenticated identity. */
  useEffect(() => {
    if (!authChecked || !user || (page !== "splash" && page !== "pending") || loading || dbStatus === "idle") return;
    if (role === "admin") {
      setPage("dashboard");
      return;
    }
    if (dbStatus === "offline") {
      setPage("dashboard");
      return;
    }
    /* an alumnus with no linked row yet is still in the verification
       stage — verification always comes before the dashboard/survey */
    if (!me) {
      setPage("pending");
      return;
    }
    if (me.verificationStatus === "pending") {
      setPage("pending");
      return;
    }
    if (me.verificationStatus === "rejected") {
      setPage("rejected");
      return;
    }
    setPage("dashboard");
  }, [authChecked, user, page, loading, dbStatus, role, me]);

  /* while waiting for approval, keep quietly re-checking so an approved
     account unlocks on its own the moment the admin verifies it */
  useEffect(() => {
    if (page !== "pending") return;
    const bump = () => {
      setCheckedAt((n) => n + 1);
      setRefresh((k) => k + 1);
    };
    const id = setInterval(bump, 7000);
    const onVis = () => {
      if (!document.hidden) bump();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [page]);

  function addToast(text) {
    const id = uid();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }

  async function ensureAlumnusRow(u) {
    const r = u.user_metadata?.role || "alumni";
    if (r === "admin") return;
    try {
      const existing = await api.fetchMyAlumnus(u.id);
      if (existing) return;
      const displayName = userDisplayName(u);
      if (displayName) {
        const unlinked = await api.findUnlinkedAlumnusByName(displayName);
        if (unlinked) {
          await api.updateAlumnus(unlinked.id, { userId: u.id });
          addToast(`Welcome back, ${displayName} — your account is linked.`);
          setRefresh((k) => k + 1);
          return;
        }
      }
      const meta = u.user_metadata || {};
      const record = {
        id: uid(),
        userId: u.id,
        name: userDisplayName(u) || "Alumnus",
        program: meta.program || PROGRAM_OPTIONS[0],
        gradYear: meta.gradYear ? String(meta.gradYear) : String(CURRENT_YEAR),
        employed: "Unknown",
        jobTitle: "",
        companyName: "",
        businessName: "",
        years: "",
        skills: [],
        surveyCompleted: false,
        avatar: null,
        verificationStatus: "pending",
        isSelf: false,
      };
      await api.insertAlumnus(record).catch(() => {});
      setRefresh((k) => k + 1);
    } catch {
      /* RLS or database offline — demo seed data keeps the app usable */
    }
  }

  async function handleLogin(email, password) {
    setAuthError("");
    const res = await api.signIn(email, password);
    if (res.error) {
      setAuthError(res.error.message);
      return;
    }
    const u = res.user;
    if (!u) {
      setAuthError("Sign-in failed. Please try again.");
      return;
    }
    const r = u.user_metadata?.role || "alumni";
    setRole(r);
    setName(userDisplayName(u));
    await ensureAlumnusRow(u);
    setPage("splash");
  }

  async function handleSignup(form) {
    setAuthError("");
    if (!form.password || form.password.length < 6) {
      setAuthError("Password must be at least 6 characters long.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setAuthError("Passwords do not match.");
      return;
    }
    const metadata = {
      firstName: form.firstName,
      lastName: form.lastName,
      role: "alumni",
      program: form.program,
      gradYear: form.gradYear,
    };
    const res = await api.signUp(form.email, form.password, metadata);
    if (res.error) {
      setAuthError(res.error.message);
      return;
    }
    if (!res.user) {
      setAuthError("Sign-up failed. Please try again.");
      return;
    }
    setName(userDisplayName(res.user));
    if (res.session) {
      await ensureAlumnusRow(res.user);
      setPage("splash");
    } else {
      setAuthError("Account created. Please check your email to confirm your account, then sign in.");
      setPage("login");
    }
  }

  async function handleLogout() {
    await api.signOut();
    setUser(null);
    setRole("alumni");
    setName("");
    setAuthError("");
    localStorage.removeItem("alumni-tracer-page");
    localStorage.removeItem("alumni-tracer-role");
    setPage("landing");
  }

  const actions = {
    updateSelf(patch) {
      setAlumni((list) => list.map((a) => (a.isSelf || (me && a.userId === me.userId) ? { ...a, ...patch } : a)));
      if (me) api.updateAlumnus(me.id, patch).catch(() => {});
      addToast("Profile updated.");
    },
    submitSurvey({ employed, jobTitle, companyName, businessName, years, skills }) {
      const patch = {
        employed,
        jobTitle: jobTitle || "",
        companyName: companyName || "",
        businessName: businessName || "",
        years: years || "",
        skills,
        surveyCompleted: true,
      };
      setAlumni((list) => list.map((a) => (a.isSelf || (me && a.userId === me.userId) ? { ...a, ...patch } : a)));
      if (me) {
        api.updateAlumnus(me.id, patch).catch(() => {});
        const now = new Date().toISOString();
        const surveyRow = {
          id: uid(),
          userId: me.userId,
          employed,
          jobTitle: jobTitle || "",
          companyName: companyName || "",
          businessName: businessName || "",
          years: years || "",
          skills,
          submittedAt: now,
          updatedAt: now,
        };
        setSurveyResponses((list) => [surveyRow, ...list]);
        api
          .insertSurveyResponse(surveyRow)
          .then((row) => setSurveyResponses((list) => list.map((s) => (s.id === surveyRow.id ? { ...s, id: row.id } : s))))
          .catch(() => {});
        api
          .insertSkillsHistory({ id: uid(), userId: me.userId, skills, snapshotDate: todayString() })
          .catch(() => {});
        const gaps = getSkillGaps({ ...me, skills }, jobs);
        const recRows = gaps.map((g) => ({
          id: uid(),
          userId: me.userId,
          skill: g.skill,
          demand: g.demand,
          reason:
            g.demand === 1
              ? "Requested by one current partner posting"
              : `Requested across ${g.demand} current postings`,
          createdAt: now,
        }));
        setCourseRecommendations(recRows);
        api.replaceCourseRecommendations(me.userId, recRows).catch(() => {});
      }
      addToast("Survey submitted — thanks for the update!");
    },
    logAdmin(action, detail) {
      const rec = {
        id: uid(),
        adminUserId: user ? user.id : null,
        action,
        detail: detail || "",
        createdAt: new Date().toISOString(),
      };
      setAdminActivityLogs((list) => [rec, ...list]);
      api.insertActivityLog(rec).catch(() => {});
    },
    applyJob(jobId) {
      if (!me) return;
      const job = jobs.find((j) => j.id === jobId);
      if (!job || jobApplications.some((a) => a.userId === me.userId && a.jobId === jobId)) return;
      const rec = { id: uid(), userId: me.userId, jobId, status: "applied", appliedAt: todayString() };
      setJobApplications((list) => [rec, ...list]);
      api
        .insertJobApplication(rec)
        .then((row) => setJobApplications((list) => list.map((a) => (a.id === rec.id ? { ...a, id: row.id } : a))))
        .catch(() => {});
      addToast(`Application submitted for ${job.title}.`);
    },
    addAlumni({ name: n, program: prog, gradYear }) {
      const record = {
        id: uid(),
        name: n,
        program: prog,
        gradYear,
        employed: "Unknown",
        jobTitle: "",
        companyName: "",
        businessName: "",
        years: "",
        skills: [],
        surveyCompleted: false,
        avatar: null,
        verificationStatus: "verified",
        isSelf: false,
      };
      setAlumni((list) => [...list, record]);
      api
        .insertAlumnus(record)
        .then((row) => {
          setAlumni((list) => list.map((a) => (a.id === record.id ? { ...a, id: row.id } : a)));
        })
        .catch(() => {});
      actions.logAdmin("added_alumnus", n);
      addToast("Alumnus added to the directory.");
    },
    removeAlumni(id) {
      const target = alumni.find((a) => a.id === id);
      setAlumni((list) => list.filter((a) => a.id !== id));
      api.deleteAlumnus(id).catch(() => {});
      actions.logAdmin("removed_alumnus", target ? target.name : "");
    },
    approveAlumni(id) {
      const alumnus = alumni.find((a) => a.id === id);
      setAlumni((list) => list.map((a) => (a.id === id ? { ...a, verificationStatus: "verified" } : a)));
      api.updateAlumnus(id, { verificationStatus: "verified" }).catch(() => {});
      if (alumnus) {
        actions.logAdmin("approved_alumnus", alumnus.name);
        api
          .sendApprovalEmail(alumnus.userId, alumnus.name)
          .then((r) => {
            if (r && r.ok) addToast("Alumnus approved — confirmation email sent.");
          })
          .catch(() => {});
        addToast("Alumnus approved.");
      }
    },
    rejectAlumni(id) {
      const alumnus = alumni.find((a) => a.id === id);
      setAlumni((list) => list.map((a) => (a.id === id ? { ...a, verificationStatus: "rejected" } : a)));
      api.updateAlumnus(id, { verificationStatus: "rejected" }).catch(() => {});
      actions.logAdmin("rejected_alumnus", alumnus ? alumnus.name : "");
      addToast("Alumnus registration rejected.");
    },
    addJob(job) {
      const record = { id: uid(), ...job };
      setJobs((list) => [record, ...list]);
      api
        .insertJob(record)
        .then((row) => {
          setJobs((list) => list.map((j) => (j.id === record.id ? { ...j, id: row.id } : j)));
        })
        .catch(() => {});
      actions.logAdmin("published_job", job.title);
      addToast("Job posting published to alumni.");
    },
    removeJob(id) {
      const target = jobs.find((j) => j.id === id);
      setJobs((list) => list.filter((j) => j.id !== id));
      api.deleteJob(id).catch(() => {});
      actions.logAdmin("removed_job", target ? target.title : "");
    },
    addEvent(ev) {
      const record = { id: uid(), rsvps: [], ...ev };
      setEvents((list) => [record, ...list]);
      api
        .insertEvent(record)
        .then((row) => {
          setEvents((list) => list.map((e) => (e.id === record.id ? { ...e, id: row.id } : e)));
        })
        .catch(() => {});
      actions.logAdmin("published_event", ev.title);
      addToast("Event posted to alumni.");
    },
    removeEvent(id) {
      const target = events.find((e) => e.id === id);
      setEvents((list) => list.filter((e) => e.id !== id));
      api.deleteEvent(id).catch(() => {});
      actions.logAdmin("removed_event", target ? target.title : "");
    },
    rsvpEvent(eventId) {
      const current = events.find((e) => e.id === eventId);
      if (!current || !me) return;
      const going = current.rsvps.includes(me.name);
      const next = going ? current.rsvps.filter((n) => n !== me.name) : [...current.rsvps, me.name];
      setEvents((list) => list.map((e) => (e.id === eventId ? { ...e, rsvps: next } : e)));
      api.setEventRsvps(eventId, next).catch(() => {});
      addToast("RSVP updated.");
    },
    sendNotification(text, target = "Complete the Alumni Survey") {
      const record = { id: uid(), text, date: todayString(), target };
      setNotifications((list) => [record, ...list]);
      api
        .insertNotification(record)
        .then((row) => {
          setNotifications((list) => list.map((n) => (n.id === record.id ? { ...n, id: row.id } : n)));
        })
        .catch(() => {});
      actions.logAdmin("sent_notification", text);
      addToast("Notification sent to all alumni.");
    },
  };

  const domain = {
    alumni,
    jobs,
    events,
    notifications,
    surveyResponses,
    skillsHistory,
    courseRecommendations,
    jobApplications,
    adminActivityLogs,
    actions,
  };

  if (booting) {
    return (
      <div className="tracer-root">
        <style>{STYLES}</style>
        <SplashScreen />
      </div>
    );
  }

  let body;
  if (page === "splash") {
    body = <SplashScreen />;
  } else if (page === "dashboard") {
    body = <Dashboard role={role} name={name} me={me} domain={domain} onLogout={handleLogout} />;
  } else if (page === "signup") {
    body = (
      <SignupPage
        onSubmit={handleSignup}
        error={authError}
        goLogin={() => setPage("login")}
        goHome={() => setPage("landing")}
      />
    );
  } else if (page === "pending") {
    body = (
      <PendingVerificationPage
        autoCheck={checkedAt > 0}
        onRefresh={() => {
          setRefresh((k) => k + 1);
          setPage("splash");
        }}
        onLogout={handleLogout}
      />
    );
  } else if (page === "rejected") {
    body = <RejectedVerificationPage onLogout={handleLogout} />;
  } else if (page === "login") {
    body = (
      <LoginPage
        onSubmit={handleLogin}
        error={authError}
        goSignup={() => setPage("signup")}
        goHome={() => setPage("landing")}
      />
    );
  } else {
    body = <LandingPage alumni={alumni} onGetStarted={() => setPage("signup")} onLogin={() => setPage("login")} />;
  }

  return (
    <div className="tracer-root">
      <style>{STYLES}</style>
      {!hasSupabaseEnv && (
        <div className="env-warning">
          No <code>.env</code> found — running on demo data. Copy the <code>.env</code> file from your Capstone folder to enable
          sign-up / login.
        </div>
      )}
      <ToastStack toasts={toasts} />
      {body}
    </div>
  );
}