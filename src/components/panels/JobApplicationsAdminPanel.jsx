import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";

export default function JobApplicationsAdminPanel({ jobApplications, jobs, alumni }) {
  const byJobId = (id) => jobs.find((j) => j.id === id);
  const byUserId = (id) => alumni.find((a) => a.userId === id);

  const perJob = jobs.map((j) => ({
    job: j,
    count: jobApplications.filter((a) => a.jobId === j.id).length,
  })).filter((x) => x.count > 0);

  return (
    <div className="panel-block">
      {perJob.length > 0 && (
        <div className="overview-block-title" style={{ marginTop: 4 }}>Openings receiving applications</div>
      )}
      <div className="list-block" style={{ marginBottom: 22 }}>
        {perJob.length === 0 && (
          <EmptyState icon="brief" text="No applications yet — when alumni apply from Career Tools they'll show up here, linked to the posting." />
        )}
        {perJob.map(({ job, count }) => (
          <div className="list-item" key={job.id}>
            <div className="list-item-main">
              <div className="list-item-title">{job.title}</div>
              <div className="list-item-sub">{job.company}</div>
            </div>
            <span className="pill ok">{count} applicant{count === 1 ? "" : "s"}</span>
          </div>
        ))}
      </div>

      {jobApplications.length > 0 && (
        <div className="overview-block-title">Application log</div>
      )}
      <div className="table-wrap">
        <table className="data-table">
          <thead><tr><th>Applicant</th><th>Posting</th><th>Status</th><th>Applied</th></tr></thead>
          <tbody>
            {jobApplications.map((a) => {
              const alum = byUserId(a.userId);
              const job = byJobId(a.jobId);
              return (
                <tr key={a.id}>
                  <td>{alum ? alum.name : "—"}</td>
                  <td>{job ? `${job.title} · ${job.company}` : "—"}</td>
                  <td>
                    <span className="pill ok"><Icon name="check" size={11} /> {a.status}</span>
                  </td>
                  <td>{a.appliedAt || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}