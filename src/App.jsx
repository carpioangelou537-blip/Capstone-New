import { useEffect, useRef, useState } from "react";
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
import { ForgotPasswordPage, UpdatePasswordPage } from "./components/auth/PasswordRecoveryPages";
import Dashboard from "./components/dashboard/Dashboard";

const alumnusRowRequests = new Map();

function isPasswordRecoveryCallback() {
  return window.location.hash.includes("type=recovery")
    || new URLSearchParams(window.location.search).get("type") === "recovery";
}

function userDisplayName(u) {
  const meta = u.user_metadata || {};
  return [meta.firstName, meta.lastName].filter(Boolean).join(" ");
}

function userRole(u) {
  return u?.app_metadata?.role === "admin" ? "admin" : "alumni";
}

function isHttpLink(link) {
  if (!link) return true;
  try {
    return ["http:", "https:"].includes(new URL(link).protocol);
  } catch {
    return false;
  }
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [page, setPage] = useState(() => (
    isPasswordRecoveryCallback() ? "reset-password" : "landing"
  ));
  const [role, setRole] = useState("alumni");
  const [name, setName] = useState("");
  const [toasts, setToasts] = useState([]);

  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [refresh, setRefresh] = useState(0);
  const passwordRecovery = useRef(isPasswordRecoveryCallback());

  const data = useSupabaseData(user, refresh);
  const {
    alumni,
    jobs,
    events,
    notifications,
    surveyResponses,
    skillsHistory,
    courseRecommendations,
    adminActivityLogs,
    setAlumni,
    setJobs,
    setEvents,
    setNotifications,
    setSurveyResponses,
    setCourseRecommendations,
    setAdminActivityLogs,
    loading,
    dbStatus,
    me,
  } = data;

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
    const sub = api.onAuthChange((u, event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY") {
        passwordRecovery.current = true;
        setPage("reset-password");
      }
      if (u) {
        setUser(u);
        setRole(userRole(u));
        setName(userDisplayName(u));
        ensureAlumnusRow(u);
      } else {
        setUser(null);
      }
    });
    api.getSessionUser().then(async (u) => {
      if (!active) return;
      if (u) {
        setUser(u);
        setRole(userRole(u));
        setName(userDisplayName(u));
        await ensureAlumnusRow(u);
        if (!passwordRecovery.current) setPage("splash");
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

  /* Resolve authenticated users after their real account data has loaded. */
  useEffect(() => {
    if (!authChecked || !user || page !== "splash" || loading || dbStatus === "idle") return;
    if (role === "admin") {
      setPage("dashboard");
      return;
    }
    if (dbStatus === "offline") {
      setPage("dashboard");
      return;
    }
    /* A missing alumni row remains pending until the Alumni Affairs Office
       has enough information to approve the account. */
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

  function addToast(text) {
    const id = uid();
    setToasts((t) => [...t, { id, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }

  async function ensureAlumnusRow(u) {
    const r = userRole(u);
    if (r === "admin") return;

    const pendingRequest = alumnusRowRequests.get(u.id);
    if (pendingRequest) return pendingRequest;

    const request = (async () => {
      const existing = await api.fetchMyAlumnus(u.id);
      if (existing) {
        if (u.email && existing.email !== u.email) {
          await api.updateAlumnus(existing.id, { email: u.email });
          setRefresh((k) => k + 1);
        }
        return;
      }
      const displayName = userDisplayName(u);
      if (displayName) {
        const unlinked = await api.findUnlinkedAlumnusByName(displayName);
        if (unlinked) {
          await api.updateAlumnus(unlinked.id, { userId: u.id, email: u.email || "" });
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
        email: u.email || "",
        program: meta.program || PROGRAM_OPTIONS[0],
        gradYear: meta.gradYear ? String(meta.gradYear) : String(CURRENT_YEAR),
        dateOfBirth: meta.dateOfBirth || "",
        contactNumber: meta.contactNumber || "",
        address: meta.address || "",
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
      await api.insertAlumnus(record);
      setRefresh((k) => k + 1);
    })().catch((error) => {
      console.error("Could not create or sync the alumni record.", error);
      addToast(`Could not save your alumni record: ${error.message || "Supabase request failed."}`);
    }).finally(() => {
      if (alumnusRowRequests.get(u.id) === request) alumnusRowRequests.delete(u.id);
    });
    alumnusRowRequests.set(u.id, request);
    return request;
  }

  async function handleLogin(email, password) {
    setAuthError("");
    setAuthMessage("");
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
    const r = userRole(u);
    setRole(r);
    setName(userDisplayName(u));
    await ensureAlumnusRow(u);
    setPage("splash");
  }

  async function handlePasswordResetRequest(email) {
    setAuthError("");
    const { error } = await api.requestPasswordReset(email);
    if (error) {
      setAuthError(error.message);
      return false;
    }
    return true;
  }

  async function handlePasswordUpdate(password) {
    setAuthError("");
    const { error } = await api.updatePassword(password);
    if (error) {
      setAuthError(error.message);
      return;
    }
    const { error: signOutError } = await api.signOut();
    if (signOutError) {
      console.error("Password updated, but the recovery session could not be signed out.", signOutError);
      passwordRecovery.current = false;
      addToast("Password updated, but we could not sign you out automatically. Sign out before leaving this device.");
      setPage("splash");
      return;
    }
    passwordRecovery.current = false;
    setAuthMessage("Your password has been updated. You can now sign in with your new password.");
    setUser(null);
    setRole("alumni");
    setName("");
    setPage("login");
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
      const { email, ...profilePatch } = patch;
      const savedPatch = { ...profilePatch, ...(email === user?.email ? { email } : {}) };
      setAlumni((list) => list.map((a) => (a.isSelf || (me && a.userId === me.userId) ? { ...a, ...savedPatch } : a)));
      if (me) api.updateAlumnus(me.id, savedPatch).catch(() => {});
      if (email && email !== user?.email) {
        api.updateAuthEmail(email).then(({ error }) => {
          addToast(error ? "Profile saved, but the email change could not be started." : "Check your inbox to confirm the new email address.");
        }).catch(() => addToast("Profile saved, but the email change could not be started."));
      }
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
    async approveAlumni(id) {
      const alumnus = alumni.find((a) => a.id === id);
      if (!alumnus) return;

      try {
        await api.updateAlumnus(id, { verificationStatus: "verified" });
      } catch (error) {
        console.error("Could not verify the alumnus account.", error);
        addToast(`Could not approve ${alumnus.name}: ${error.message || "database request failed."}`);
        return;
      }

      setAlumni((list) => list.map((a) => (a.id === id ? { ...a, verificationStatus: "verified" } : a)));
      actions.logAdmin("approved_alumnus", alumnus.name);

      if (!alumnus.email) {
        addToast("Alumnus approved, but no email address is available for notification.");
        return;
      }

      try {
        const result = await api.sendApprovalEmail(alumnus.userId, alumnus.email, alumnus.name);
        if (!result?.ok) throw new Error(result?.error || "Email provider rejected the message.");
        addToast("Alumnus approved — verification email sent.");
      } catch (error) {
        console.error("Alumnus approved, but the verification email could not be sent.", error);
        addToast(`Alumnus approved, but the email could not be sent: ${error.message || "email service request failed."}`);
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
    async sendNotification(text, target = "", link = "") {
      if (!isHttpLink(link)) {
        addToast("Please enter a valid link starting with http:// or https://.");
        return false;
      }
      const record = { id: uid(), text, date: todayString(), target, link };
      try {
        const row = await api.insertNotification(record);
        setNotifications((list) => [{ ...record, id: row.id }, ...list]);
      } catch (error) {
        console.error("Could not save the notification.", error);
        addToast(`Could not send notification: ${error.message || "database request failed."}`);
        return false;
      }
      actions.logAdmin("sent_notification", text);
      addToast("Notification sent to all alumni.");
      return true;
    },
    async updateNotification(id, changes) {
      if (!isHttpLink(changes.link)) {
        addToast("Please enter a valid link starting with http:// or https://.");
        return false;
      }
      const notification = notifications.find((item) => item.id === id);
      if (!notification) {
        addToast("Could not find that notification. Refresh and try again.");
        return false;
      }
      try {
        await api.updateNotification(id, changes);
        setNotifications((list) => list.map((item) => (
          item.id === id ? { ...item, ...changes } : item
        )));
      } catch (error) {
        console.error("Could not update the notification.", error);
        addToast(`Could not update notification: ${error.message || "database request failed."}`);
        return false;
      }
      actions.logAdmin("updated_notification", changes.text);
      addToast("Notification updated.");
      return true;
    },
    async deleteNotification(id) {
      const notification = notifications.find((item) => item.id === id);
      if (!notification) {
        addToast("Could not find that notification. Refresh and try again.");
        return false;
      }
      try {
        await api.deleteNotification(id);
        setNotifications((list) => list.filter((item) => item.id !== id));
      } catch (error) {
        console.error("Could not delete the notification.", error);
        addToast(`Could not delete notification: ${error.message || "database request failed."}`);
        return false;
      }
      actions.logAdmin("deleted_notification", notification.text);
      addToast("Notification deleted.");
      return true;
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
    body = <Dashboard role={role} name={name} me={me} email={user?.email || ""} domain={domain} onLogout={handleLogout} />;
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
    body = <PendingVerificationPage onLogout={handleLogout} />;
  } else if (page === "rejected") {
    body = <RejectedVerificationPage onLogout={handleLogout} />;
  } else if (page === "forgot-password") {
    body = (
      <ForgotPasswordPage
        onSubmit={handlePasswordResetRequest}
        error={authError}
        goLogin={() => {
          setAuthError("");
          setPage("login");
        }}
        goHome={() => setPage("landing")}
      />
    );
  } else if (page === "reset-password") {
    body = <UpdatePasswordPage onSubmit={handlePasswordUpdate} error={authError} />;
  } else if (page === "login") {
    body = (
      <LoginPage
        onSubmit={handleLogin}
        error={authError}
        message={authMessage}
        goSignup={() => setPage("signup")}
        goForgotPassword={() => {
          setAuthError("");
          setPage("forgot-password");
        }}
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