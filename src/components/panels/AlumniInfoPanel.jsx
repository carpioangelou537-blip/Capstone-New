import { useState } from "react";
import { VerifyPill, StatusPill } from "../ui/Pills";

function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return null;
  const [year, month, day] = String(dateOfBirth).split("-").map(Number);
  if (!year || !month || !day) return null;
  const today = new Date();
  const age = today.getFullYear() - year - (
    today.getMonth() + 1 < month
    || (today.getMonth() + 1 === month && today.getDate() < day)
      ? 1
      : 0
  );
  return age >= 0 ? age : null;
}

export default function AlumniInfoPanel({ alumni, skillsHistory }) {
  const [openId, setOpenId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const filteredAlumni = alumni.filter((alumnus) =>
    String(alumnus.name || "").toLocaleLowerCase().startsWith(searchQuery.trim().toLocaleLowerCase())
  );

  return (
    <div className="panel-block">
      <form className="panel-search" onSubmit={(event) => { event.preventDefault(); setSearchQuery(searchInput); }}>
        <input
          type="search"
          aria-label="Search alumni by name"
          placeholder="Search by name"
          value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setSearchQuery(event.target.value);
            }}
        />
        <button type="submit" className="btn-primary">Search</button>
      </form>
      <div className="list-block">
      {filteredAlumni.length ? filteredAlumni.map((a) => (
        <div
          className="list-item"
          key={a.id}
          onClick={() => setOpenId(openId === a.id ? null : a.id)}
          style={{ cursor: "pointer", flexDirection: "column", alignItems: "stretch" }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", width: "100%", flexWrap: "wrap", gap: 10 }}>
            <div className="list-item-main">
              <div className="list-item-title">{a.name}{a.isSelf ? " (You)" : ""}</div>
              <div className="list-item-sub">{a.program} · Class of {a.gradYear}</div>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <VerifyPill status={a.verificationStatus} />
              <StatusPill status={a.employed} />
            </div>
          </div>
          {openId === a.id && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #e6e1df" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "10px 18px", marginBottom: 12 }}>
                <div>
                  <div className="list-item-sub">Date of Birth</div>
                  <div>{a.dateOfBirth || "Not provided"}</div>
                </div>
                <div>
                  <div className="list-item-sub">Age</div>
                  <div>{calculateAge(a.dateOfBirth) ?? "Not available"}</div>
                </div>
                <div>
                  <div className="list-item-sub">Contact Number</div>
                  <div>{a.contactNumber || "Not provided"}</div>
                </div>
                <div>
                  <div className="list-item-sub">Email Address</div>
                  <div>{a.email || "Not available"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="list-item-sub">Address</div>
                  <div>{a.address || "Not provided"}</div>
                </div>
              </div>
              {a.employed === "Employed" && (a.jobTitle || a.companyName || a.years) && (
                <div className="list-item-sub" style={{ marginBottom: 8 }}>
                  {a.jobTitle && <>Current role: {a.jobTitle}</>}
                  {a.companyName && <> at {a.companyName}</>}
                  {a.years && <> · {a.years} yr{a.years === "1" ? "" : "s"}</>}
                </div>
              )}
              {a.employed === "Self Employed" && (a.businessName || a.years) && (
                <div className="list-item-sub" style={{ marginBottom: 8 }}>
                  Self-employed{a.businessName && <> · {a.businessName}</>}{a.years && <> · {a.years} yr{a.years === "1" ? "" : "s"}</>}
                </div>
              )}
              <div className="list-item-sub" style={{ marginBottom: 6 }}>Self-reported skills</div>
              <div className="chip-row">
                {a.skills.length
                  ? a.skills.map((s) => <span className="chip" key={s}>{s}</span>)
                  : <span className="list-item-sub">No skills submitted yet.</span>}
              </div>
              {skillsHistory && skillsHistory.length > 0 && (
                <>
                  <div className="list-item-sub" style={{ marginBottom: 6, marginTop: 12 }}>Skills history (snapshots)</div>
                  {skillsHistory
                    .filter((h) => h.userId && h.userId === a.userId)
                    .sort((left, right) => String(right.snapshotDate || "").localeCompare(String(left.snapshotDate || "")))
                    .slice(0, 1)
                    .map((h) => (
                      <div key={h.id} style={{ marginBottom: 8 }}>
                        <div className="chip-row">
                          {h.skills.length
                            ? h.skills.map((s) => <span className="chip" key={s}>{s}</span>)
                            : <span className="list-item-sub">—</span>}
                        </div>
                        <div className="list-item-sub" style={{ marginTop: 4 }}>{h.snapshotDate || ""}</div>
                      </div>
                    ))}
                </>
              )}
            </div>
          )}
        </div>
      )) : <div className="empty-state">No alumni names start with “{searchQuery}”.</div>}
      </div>
    </div>
  );
}