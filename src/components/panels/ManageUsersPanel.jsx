import { useState } from "react";
import Icon from "../ui/Icon";
import { ProgramSelect, YearSelect } from "../ui/Selects";
import { StatusPill, VerifyPill } from "../ui/Pills";

export default function ManageUsersPanel({ alumni, onAdd, onRemove }) {
  const [name, setName] = useState("");
  const [program, setProgram] = useState("BS Computer Science");
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAlumni = alumni.filter((alumnus) =>
    String(alumnus.name || "").toLocaleLowerCase().startsWith(searchQuery.trim().toLocaleLowerCase())
  );

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), program, gradYear: year });
    setName("");
  }

  return (
    <div className="panel-block">
      <form className="panel-form" onSubmit={submit}>
        <div className="row">
          <label>
            Full name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" />
          </label>
          <ProgramSelect value={program} onChange={setProgram} />
          <YearSelect value={year} onChange={setYear} />
        </div>
        <button type="submit" className="btn-ghost" style={{ alignSelf: "flex-start" }}>
          <Icon name="plus" size={14} /> Add alumnus
        </button>
      </form>

      <form className="panel-search" onSubmit={(event) => { event.preventDefault(); setSearchQuery(searchInput); }}>
        <input
          type="search"
          aria-label="Search user accounts by name"
          placeholder="Search users by name"
          value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setSearchQuery(event.target.value);
            }}
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Name</th><th>Program</th><th>Year</th><th>Survey</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {filteredAlumni.length ? filteredAlumni.map((a) => (
              <tr key={a.id}>
                <td>{a.name}{a.isSelf ? " (You)" : ""}</td>
                <td>{a.program}</td>
                <td>{a.gradYear}</td>
                <td><StatusPill status={a.surveyCompleted} /></td>
                <td><VerifyPill status={a.verificationStatus} /></td>
                <td>
                  {!a.isSelf && (
                    <button className="btn-danger" onClick={() => onRemove(a.id)} aria-label={`Remove ${a.name}`}>
                      <Icon name="trash" size={15} />
                    </button>
                  )}
                </td>
              </tr>
            )) : <tr><td colSpan={6} className="empty-state">No user names start with “{searchQuery}”.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}