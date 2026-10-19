import { useState } from "react";
import EmptyState from "../ui/EmptyState";
import Icon from "../ui/Icon";
import MLInsights from "./MLInsights";

export default function CareerToolsPanel({ me, jobs, alumni, surveyResponses, onApply, jobApplications }) {
  const [searchQuery, setSearchQuery] = useState("");
  const appliedJobIds = (jobApplications || []).map((application) => String(application.jobId));
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const filteredJobs = jobs.filter((job) =>
    [job.title, job.company, job.description, ...(job.skills || [])]
      .some((value) => String(value || "").toLocaleLowerCase().includes(normalizedQuery))
  );

  return (
    <div className="panel-block">
      {jobs.length === 0 && <EmptyState icon="brief" text="No postings yet — check back once the AAO publishes openings." />}
      {jobs.length > 0 && (
        <section>
          <div className="overview-block-title">Browse all job listings</div>
          <p className="list-item-sub" style={{ margin: "0 0 10px", lineHeight: 1.5 }}>
            Listings link to LinkedIn or Facebook searches and may change over time. Confirm each role’s details with the original poster.
          </p>
          <form className="panel-search" role="search" onSubmit={(event) => event.preventDefault()}>
            <input
              type="search"
              aria-label="Search job listings by title, source, or skill"
              placeholder="Search jobs by title, source, or skill"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </form>
          <div className="list-item-sub" style={{ marginBottom: 8 }}>
            Showing {filteredJobs.length} of {jobs.length} listings
          </div>
          <div className="list-block">
            {filteredJobs.map((job) => (
              <div className="list-item" key={job.id}>
                <div className="list-item-main">
                  <div className="list-item-title">{job.title}</div>
                  <div className="list-item-sub">{job.company}</div>
                  {job.skills.length > 0 && (
                    <div className="chip-row" style={{ marginTop: 6 }}>
                      {job.skills.map((skill) => <span className="chip" key={skill}>{skill}</span>)}
                    </div>
                  )}
                  {job.link && (
                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="notif-goto" style={{ marginTop: 8, display: "inline-flex" }}>
                      <Icon name="arrow" size={12} /> {job.company === "LinkedIn" || job.company === "Facebook" ? `Browse on ${job.company}` : "View posting"}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
          {filteredJobs.length === 0 && <EmptyState icon="brief" text="No job listings match your search. Try another title, source, or skill." />}
        </section>
      )}
      <MLInsights
        alumni={alumni}
        jobs={jobs}
        surveyResponses={surveyResponses}
        currentAlumnus={me}
        onApply={onApply}
        appliedJobIds={appliedJobIds}
      />
    </div>
  );
}