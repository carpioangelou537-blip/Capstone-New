import EmptyState from "../ui/EmptyState";
import MLInsights from "./MLInsights";

export default function CareerToolsPanel({ me, jobs, alumni, surveyResponses, onApply, jobApplications }) {
  const appliedJobIds = (jobApplications || []).map((application) => String(application.jobId));

  return (
    <div className="panel-block">
      {jobs.length === 0 && <EmptyState icon="brief" text="No postings yet — check back once the AAO publishes openings." />}
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