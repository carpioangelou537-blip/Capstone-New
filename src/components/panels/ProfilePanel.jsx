import { useRef, useState } from "react";
import Icon from "../ui/Icon";

export default function ProfilePanel({ me, onSave }) {
  const [name, setName] = useState(me.name);
  const [program, setProgram] = useState(me.program);
  const [gradYear, setGradYear] = useState(me.gradYear);
  const [avatar, setAvatar] = useState(me.avatar || null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(reader.result);
    reader.readAsDataURL(file);
  }

  function submit(e) {
    e.preventDefault();
    onSave({ name: name.trim() || me.name, program: program.trim() || me.program, gradYear, avatar });
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
        <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }}>Save profile</button>
        {saved && <span className="confirm-badge"><Icon name="check" size={13} /> Profile updated</span>}
      </form>
    </div>
  );
}