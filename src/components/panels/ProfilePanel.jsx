import { useRef, useState } from "react";
import Icon from "../ui/Icon";

export default function ProfilePanel({ me, email, latestSurveyStatus, latestSurvey, onSave }) {
  const [name, setName] = useState(me.name);
  const [program, setProgram] = useState(me.program);
  const [gradYear, setGradYear] = useState(me.gradYear);
  const [dateOfBirth, setDateOfBirth] = useState(me.dateOfBirth || "");
  const [address, setAddress] = useState(me.address || "");
  const [contactNumber, setContactNumber] = useState(me.contactNumber || "");
  const [emailAddress, setEmailAddress] = useState(email || "");
  const [avatar, setAvatar] = useState(me.avatar || null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);
  const age = dateOfBirth ? (() => {
    const [year, month, day] = dateOfBirth.split("-").map(Number);
    const today = new Date();
    return today.getFullYear() - year - (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day) ? 1 : 0);
  })() : null;

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  }

  function submit(e) {
    e.preventDefault();
    onSave({
      name: name.trim() || me.name,
      program: program.trim() || me.program,
      gradYear,
      dateOfBirth,
      address: address.trim(),
      contactNumber: contactNumber.trim(),
      email: emailAddress.trim(),
      avatar,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="panel-block">
      <div className="avatar-upload">
        <div className="avatar-preview">
          {avatar ? <img src={avatar} alt="Profile" /> : (name || "U").slice(0, 1).toUpperCase()}
        </div>
        <div className="avatar-upload-actions">
          <button type="button" className="btn-ghost" onClick={() => fileRef.current && fileRef.current.click()}>
            <Icon name="camera" size={14} /> {avatar ? "Change photo" : "Upload photo"}
          </button>
          {avatar && <button type="button" className="text-link" style={{ color: "var(--maroon)", fontSize: "0.76rem" }} onClick={() => setAvatar(null)}>Remove photo</button>}
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
        </div>
      </div>
      <form className="panel-form" onSubmit={submit}>
        <div className="row">
          <label>Full name<input value={name} onChange={(e) => setName(e.target.value)} /></label>
          <label>Program<input value={program} onChange={(e) => setProgram(e.target.value)} /></label>
          <label>Year graduated<input value={gradYear} onChange={(e) => setGradYear(e.target.value)} /></label>
        </div>
        <div className="row">
          <label>Date of Birth<input type="date" value={dateOfBirth} onChange={(e) => setDateOfBirth(e.target.value)} /></label>
          <label>Contact Number<input type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} /></label>
          <label>Email Address<input type="email" value={emailAddress} onChange={(e) => setEmailAddress(e.target.value)} /></label>
        </div>
        <div className="list-item-sub">Age: {age === null ? "Not provided" : age}</div>
        <label>Address<input value={address} onChange={(e) => setAddress(e.target.value)} /></label>
        <div className="profile-survey-summary">
          <div className="profile-survey-heading">Latest survey</div>
          <div className="profile-survey-status">
            <span className="profile-survey-label">Employment status</span>
            <strong>{latestSurveyStatus || "Unknown"}</strong>
            {latestSurvey?.submittedAt && <span className="profile-survey-date">Submitted {new Date(latestSurvey.submittedAt).toLocaleDateString()}</span>}
          </div>
          {latestSurvey ? (
            <div className="profile-survey-details">
              {(latestSurvey.jobTitle || latestSurvey.businessName) && <div><span>Role / business</span><strong>{latestSurvey.jobTitle || latestSurvey.businessName}</strong></div>}
              {latestSurvey.companyName && <div><span>Company</span><strong>{latestSurvey.companyName}</strong></div>}
              {latestSurvey.years && <div><span>Experience</span><strong>{latestSurvey.years} year{latestSurvey.years === "1" ? "" : "s"}</strong></div>}
              {latestSurvey.skills?.length > 0 && <div className="profile-survey-skills"><span>Skills</span><strong>{latestSurvey.skills.join(", ")}</strong></div>}
            </div>
          ) : (
            <p className="profile-survey-empty">No survey response on file.</p>
          )}
        </div>
        <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }}>Save profile</button>
        {saved && <span className="confirm-badge"><Icon name="check" size={13} /> Profile updated</span>}
      </form>
    </div>
  );
}