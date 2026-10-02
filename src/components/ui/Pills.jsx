import Icon from "./Icon";

export function StatusPill({ status }) {
  if (status === true) return <span className="pill ok"><Icon name="check" size={11} /> Surveyed</span>;
  if (status === false) return <span className="pill pending">Pending</span>;
  if (status === "Employed" || status === "Self Employed") return <span className="pill ok"><Icon name="check" size={11} /> {status}</span>;
  if (status === "Unemployed") return <span className="pill pending">Unemployed</span>;
  return <span className="pill muted">{status}</span>;
}

export function VerifyPill({ status }) {
  if (status === "verified") return <span className="pill ok"><Icon name="check" size={11} /> Verified</span>;
  if (status === "rejected") return <span className="pill rejected">Rejected</span>;
  return <span className="pill pending">Pending</span>;
}