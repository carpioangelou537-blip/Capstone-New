import { useState } from "react";
import Icon from "../ui/Icon";

export default function JobsAdminPanel({ jobs, onAdd, onRemove }) {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [skills, setSkills] = useState("");
  const [link, setLink] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!title.trim() || !company.trim()) return;
    onAdd({ title: title.trim(), company: company.trim(), skills: skills.split(",").map((s) => s.trim()).filter(Boolean), link: link.trim() });
    setTitle(""); setCompany(""); setSkills(""); setLink("");
  }

  return (
    <div className="panel-block">
      <form className="panel-form" onSubmit={submit}>
        <div className="row">
          <label>Job title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Frontend Developer" /></label>
          <label>Company<input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Iligan Digital Solutions" /></label>
        </div>
        <label>Skills needed (comma separated)<input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, JavaScript" /></label>
        <label>Posting link (Facebook, LinkedIn, or company page)<input value={link} onChange={(e) => setLink(e.target.value)} type="url" placeholder="https://facebook.com/... or https://linkedin.com/..." /></label>
        <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }}><Icon name="plus" size={14} /> Publish posting</button>
      </form>

      <div className="list-block">
        {jobs.map((j) => (
          <div className="list-item" key={j.id}>
            <div className="list-item-main">
              <div className="list-item-title">{j.title}</div>
              <div className="list-item-sub">{j.company}</div>
              <div className="chip-row" style={{ marginTop: 6 }}>{j.skills.map((s) => <span className="chip" key={s}>{s}</span>)}</div>
              {j.link && (
                <a href={j.link} target="_blank" rel="noopener noreferrer" className="notif-goto" style={{ marginTop: 8, display: "inline-flex" }}>
                  <Icon name="arrow" size={12} /> View posting
                </a>
              )}
            </div>
            <div className="list-item-actions">
              <button className="btn-danger" onClick={() => onRemove(j.id)} aria-label={`Remove ${j.title}`}><Icon name="trash" size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}