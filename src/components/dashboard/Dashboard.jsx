import { useEffect, useState } from "react";
import { ADMIN_FEATURES, getAlumniFeatures } from "../../lib/constants";
import Icon from "../ui/Icon";
import AnimatedNumber from "../ui/AnimatedNumber";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { AdminDashboardOverview, AlumniDashboardOverview } from "./DashboardOverviews";
import LoginAndVerificationPanel from "../panels/LoginAndVerificationPanel";
import ManageUsersPanel from "../panels/ManageUsersPanel";
import AlumniInfoPanel from "../panels/AlumniInfoPanel";
import SurveyResultsPanel from "../panels/SurveyResultsPanel";
import NotifyComposerPanel from "../panels/NotifyComposerPanel";
import AnalyticsPanel from "../panels/AnalyticsPanel";
import JobsAdminPanel from "../panels/JobsAdminPanel";
import EventsAdminPanel from "../panels/EventsAdminPanel";
import SurveyFormPanel from "../panels/SurveyFormPanel";
import JobAlignmentPanel from "../panels/JobAlignmentPanel";
import CareerToolsPanel from "../panels/CareerToolsPanel";
import EventsAlumniPanel from "../panels/EventsAlumniPanel";
import ProfileModal from "../modals/ProfileModal";
import SurveyModal from "../modals/SurveyModal";

export default function Dashboard({ role, name, me, email, domain, onLogout }) {
  const {
    alumni,
    jobs,
    events,
    notifications,
    surveyResponses,
    skillsHistory,
    courseRecommendations,
    jobApplications,
    actions,
  } = domain;
  const safeMe = me || {
    id: null,
    userId: null,
    name: name || (role === "admin" ? "Administrator" : "Alumnus"),
    program: "",
    gradYear: "",
    dateOfBirth: "",
    address: "",
    contactNumber: "",
    employed: "Unknown",
    jobTitle: "",
    companyName: "",
    businessName: "",
    years: "",
    skills: [],
    surveyCompleted: false,
    avatar: null,
    verificationStatus: role === "admin" ? "verified" : "pending",
    isSelf: false,
  };
  const features = role === "admin" ? ADMIN_FEATURES : getAlumniFeatures();
  const notificationReadKey = `alumni-tracer-read-${role}-${safeMe.userId || safeMe.id || "guest"}`;
  const seenFeaturesKey = `alumni-tracer-seen-${role}-${safeMe.userId || safeMe.id || "guest"}`;

  const [active, setActive] = useState(features[0].title);
  const [entered, setEntered] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [surveyModalOpen, setSurveyModalOpen] = useState(false);
  const [surveyDismissed, setSurveyDismissed] = useState(false);
  const [readNotificationIds, setReadNotificationIds] = useState([]);
  const [seenFeatures, setSeenFeatures] = useState([]);
  const [navigationHistory, setNavigationHistory] = useState([]);

  useEffect(() => {
    try {
      setReadNotificationIds(JSON.parse(localStorage.getItem(notificationReadKey) || "[]"));
    } catch {
      setReadNotificationIds([]);
    }
  }, [notificationReadKey]);

  useEffect(() => {
    try {
      setSeenFeatures(JSON.parse(localStorage.getItem(seenFeaturesKey) || "[]"));
    } catch {
      setSeenFeatures([]);
    }
  }, [seenFeaturesKey]);

  const unreadNotificationCount = notifications.filter((notification) => !readNotificationIds.includes(String(notification.id))).length;

  function markNotificationsRead() {
    const ids = notifications.map((notification) => String(notification.id));
    const nextReadIds = [...new Set([...readNotificationIds, ...ids])];
    setReadNotificationIds(nextReadIds);
    localStorage.setItem(notificationReadKey, JSON.stringify(nextReadIds));
  }

  function toggleNotifications() {
    const opening = !notifOpen;
    setNotifOpen(opening);
    if (opening) markNotificationsRead();
  }

  function markFeatureSeen(title) {
    const nextSeen = [...new Set([...seenFeatures, title])];
    setSeenFeatures(nextSeen);
    localStorage.setItem(seenFeaturesKey, JSON.stringify(nextSeen));
  }

  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 60);
    return () => clearTimeout(t);
  }, []);

  /* the alumni survey comes only AFTER an admin verifies the account —
     verification first, then the modal opens for the survey */
  useEffect(() => {
    if (role === "alumni" && me && me.verificationStatus === "verified" && !me.surveyCompleted && !surveyDismissed) {
      setSurveyModalOpen(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, me, surveyDismissed]);

  function handleSurveySubmit(data) {
    if (!safeMe) return;
    actions.submitSurvey(data);
    goToFeature(data.employed === "Unemployed" ? "Career Tools" : "Job Alignment");
  }

  function handleModalSubmit(data) {
    handleSurveySubmit(data);
    setSurveyModalOpen(false);
    setSurveyDismissed(true);
  }

  function goToFeature(title) {
    if (title !== active) setNavigationHistory((history) => [...history, active]);
    markFeatureSeen(title);
    if (role === "admin" && title === "Manage Notifications") markNotificationsRead();
    setActive(title);
  }

  function goBack() {
    if (navigationHistory.length === 0) return;
    const previous = navigationHistory[navigationHistory.length - 1];
    setNavigationHistory((history) => history.slice(0, -1));
    markFeatureSeen(previous);
    setActive(previous);
  }

  const surveyedCount = alumni.filter((a) => a.surveyCompleted).length;
  const pendingVerifications = alumni.filter((a) => a.verificationStatus === "pending").length;
  const verifiedCount = alumni.filter((a) => a.verificationStatus === "verified").length;
  const totalRsvps = events.reduce((sum, e) => sum + e.rsvps.length, 0);
  const matchedJobs = jobs.filter((j) =>
    j.skills.some((s) => safeMe.skills.some((ms) => String(ms).toLowerCase() === String(s).toLowerCase()))
  ).length;

  const STATS = {
    admin: [
      { label: "Total alumni", value: String(alumni.length), icon: "users" },
      { label: "Pending verifications", value: String(pendingVerifications), icon: "shield" },
      { label: "Verified alumni", value: String(verifiedCount), icon: "check" },
      { label: "Open job postings", value: String(jobs.length), icon: "brief" },
    ],
    alumni: [
      { label: "Profile completeness", value: `${Math.min(100, 30 + safeMe.skills.length * 15 + (safeMe.surveyCompleted ? 25 : 0))}%`, icon: "id" },
      { label: "Matched openings", value: String(matchedJobs), icon: "brief" },
      { label: "Upcoming events", value: String(events.length), icon: "calendar" },
      { label: "Survey status", value: safeMe.surveyCompleted ? "Done" : "Pending", icon: "doc" },
    ],
  };

  function getBadge(title) {
    if (seenFeatures.includes(title) && !(title === "Manage Notifications" && unreadNotificationCount > 0)) return null;
    if (role === "admin") {
      if (title === "Login & Verification") return pendingVerifications;
      if (title === "Manage User Accounts") return alumni.length;
      if (title === "View Alumni Information") return alumni.length;
      if (title === "View Survey Results") return surveyedCount;
      if (title === "Manage Notifications") return unreadNotificationCount;
      if (title === "Career Tools & Job Postings") return jobs.length;
      if (title === "Manage Event Posting") return totalRsvps;
    } else {
      if (title === "Job Alignment" || title === "Career Tools") return matchedJobs;
      if (title === "Events & Activities") return events.length;
      if (title === "Complete the Alumni Survey") return safeMe.surveyCompleted ? "Done" : "Pending";
    }
    return null;
  }

  const myRecommendations = courseRecommendations.filter((r) => r.userId && r.userId === safeMe.userId);
  const myApplications = jobApplications.filter((a) => a.userId && a.userId === safeMe.userId);
  const mySurveyHistory = surveyResponses
    .filter((response) => response.userId && response.userId === safeMe.userId)
    .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

  function renderPanel(title) {
    if (role === "admin") {
      switch (title) {
        case "Dashboard":
          return <AdminDashboardOverview alumni={alumni} jobs={jobs} events={events} notifications={notifications} onNavigate={goToFeature} />;
        case "Login & Verification":
          return <LoginAndVerificationPanel alumni={alumni} onApprove={actions.approveAlumni} onReject={actions.rejectAlumni} />;
        case "Manage User Accounts":
          return <ManageUsersPanel alumni={alumni} onAdd={actions.addAlumni} onRemove={actions.removeAlumni} />;
        case "View Alumni Information":
          return <AlumniInfoPanel alumni={alumni} skillsHistory={skillsHistory} />;
        case "View Survey Results":
          return <SurveyResultsPanel alumni={alumni} surveyResponses={surveyResponses} />;
        case "Manage Notifications":
          return <NotifyComposerPanel notifications={notifications} onSend={actions.sendNotification} />;
        case "View AI Analytics":
          return <AnalyticsPanel alumni={alumni} jobs={jobs} surveyResponses={surveyResponses} />;
        case "Career Tools & Job Postings":
          return <JobsAdminPanel jobs={jobs} onAdd={actions.addJob} onRemove={actions.removeJob} />;
        case "Manage Event Posting":
          return <EventsAdminPanel events={events} onAdd={actions.addEvent} onRemove={actions.removeEvent} />;
        default:
          return null;
      }
    }
    switch (title) {
      case "Dashboard":
        return <AlumniDashboardOverview me={safeMe} jobs={jobs} events={events} notifications={notifications} onNavigate={goToFeature} />;
      case "Complete the Alumni Survey":
        return <SurveyFormPanel me={safeMe} onSubmit={handleSurveySubmit} surveyHistory={mySurveyHistory} />;
      case "Job Alignment":
        return <JobAlignmentPanel me={safeMe} jobs={jobs} recommendations={myRecommendations} />;
      case "Career Tools":
        return <CareerToolsPanel me={safeMe} jobs={jobs} onApply={actions.applyJob} jobApplications={myApplications} />;
      case "Events & Activities":
        return <EventsAlumniPanel events={events} me={safeMe} onRsvp={actions.rsvpEvent} />;
      default:
        return null;
    }
  }

  const activeFeature = features.find((f) => f.title === active);

  return (
    <div className={`dash ${entered ? "in" : ""}`}>
      {surveyModalOpen && role === "alumni" && me && me.verificationStatus === "verified" && !me.surveyCompleted && (
        <SurveyModal me={safeMe} onSubmit={handleModalSubmit} onClose={() => { setSurveyModalOpen(false); setSurveyDismissed(true); }} />
      )}
      {profileModalOpen && role === "alumni" && (
        <ProfileModal
          me={safeMe}
          email={email}
          latestSurveyStatus={mySurveyHistory[0]?.employed || safeMe.employed}
          latestSurvey={mySurveyHistory[0] || (safeMe.surveyCompleted ? safeMe : null)}
          onSave={actions.updateSelf}
          onClose={() => setProfileModalOpen(false)}
        />
      )}

      <DashboardSidebar
        role={role}
        me={safeMe}
        features={features}
        active={active}
        onSelect={goToFeature}
        getBadge={getBadge}
        onLogout={onLogout}
      />

      <main className="dash-main">
        <DashboardHeader
          role={role}
          name={name}
          me={safeMe}
          notifications={notifications}
          notifOpen={notifOpen}
          onToggleNotif={toggleNotifications}
          unreadCount={unreadNotificationCount}
          canGoBack={navigationHistory.length > 0}
          onBack={goBack}
          onGoto={goToFeature}
          onCloseNotif={() => setNotifOpen(false)}
          onOpenProfile={() => setProfileModalOpen(true)}
        />

        <section className="stat-grid">
          {STATS[role].map((s, i) => (
            <div className="stat-card" style={{ "--i": i }} key={s.label}>
              <div className="stat-card-icon"><Icon name={s.icon} size={16} /></div>
              <div className="stat-card-body">
                <p className="stat-value"><AnimatedNumber value={s.value} start /></p>
                <p className="stat-label">{s.label}</p>
              </div>
            </div>
          ))}
        </section>

        {activeFeature && (
          <section className="detail-panel" key={activeFeature.title}>
            <div className="detail-icon"><Icon name={activeFeature.icon} size={24} /></div>
            <div className="detail-body">
              <h3>{activeFeature.title}</h3>
              <p>{activeFeature.text}</p>
              {renderPanel(activeFeature.title)}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}