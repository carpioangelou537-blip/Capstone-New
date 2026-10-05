import { useEffect, useMemo, useState } from "react";
import { analyzeCareerData, isMlServiceConfigured } from "../../lib/mlService";
import { analyzeInBrowser, rankJobMatches } from "../../lib/browserMl";
import Icon from "../ui/Icon";

export default function MLInsights({
  alumni,
  jobs,
  surveyResponses = [],
  currentAlumnus,
  onApply,
  appliedJobIds = [],
}) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const payload = useMemo(
    () => JSON.stringify({ alumni, jobs, courses: [], surveyResponses }),
    [alumni, jobs, surveyResponses],
  );

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    const data = JSON.parse(payload);
    const analysis = isMlServiceConfigured()
      ? analyzeCareerData(data, controller.signal)
      : Promise.resolve().then(() => analyzeInBrowser(data));
    analysis
      .then(setResult)
      .catch((requestError) => {
        if (requestError.name === "AbortError") return;
        try {
          setResult(analyzeInBrowser(data));
        } catch (fallbackError) {
          setError(`Python service failed (${requestError.message}); browser analysis failed (${fallbackError.message}).`);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [payload]);

  if (loading) {
    return <div className="overview-block-title" style={{ marginTop: 18 }}>Analyzing skills and job matches…</div>;
  }
  if (error) {
    return <div className="list-item" role="status" style={{ marginTop: 18 }}>{error}</div>;
  }

  const techniques = result.techniques;
  const personId = String(currentAlumnus?.id || "");
  const userId = currentAlumnus?.userId || "";
  const ownMatches = currentAlumnus
    ? techniques.tfidfCosine.jobMatches.filter(
      (item) => (personId && item.alumniId === personId) || (userId && item.userId === userId),
    )
    : [];
  const matches = currentAlumnus
    ? ownMatches
    : techniques.tfidfCosine.jobMatches;
  const rankedMatches = rankJobMatches(matches);
  const recommendations = currentAlumnus ? rankedMatches.slice(0, 5) : [];
  const jobsById = new Map(jobs.map((job) => [String(job.id), job]));
  const bestJobs = !currentAlumnus
    ? jobs.map((job) => {
      const matchesForJob = rankedMatches.filter((match) => match.jobId === String(job.id));
      const relevantMatches = rankJobMatches(matchesForJob);
      const average = relevantMatches.length
        ? relevantMatches.reduce((sum, match) => sum + match.score, 0) / relevantMatches.length
        : 0;
      return { job, average, matchedAlumni: relevantMatches.length };
    }).filter((item) => item.matchedAlumni > 0).sort((left, right) => right.average - left.average)
    : [];

  return (
    <div style={{ marginTop: 20 }}>
      <section>
        <div className="overview-block-title">
          {currentAlumnus ? "Your recommended jobs" : "Job analytics · best-fit openings"}
        </div>
        <p className="list-item-sub" style={{ margin: "0 0 10px", lineHeight: 1.5 }}>
          Match score weights TF-IDF profile similarity at 70% and exact required-skill coverage at 30%. It is a ranking—not a probability of getting hired. Zero-evidence matches are excluded.
        </p>
        {currentAlumnus && recommendations.length === 0 && (
          <p className="list-item-sub">No relevant job matches yet. Complete your skills profile or check again when suitable jobs are posted.</p>
        )}
        {!currentAlumnus && bestJobs.length === 0 && (
          <p className="list-item-sub">No job postings currently have enough profile overlap to recommend to alumni.</p>
        )}
        {currentAlumnus && recommendations.length > 0 && <div className="list-block">
        {recommendations.map((match) => {
          const job = jobsById.get(match.jobId);
          const applied = appliedJobIds.includes(match.jobId);
          return (
            <div className="list-item" key={`${match.alumniId}-${match.jobId}`}>
              <div className="list-item-main">
                <div className="list-item-title">{match.title}</div>
                <div className="list-item-sub">
                  {match.skillCoverage === null
                    ? `Text similarity ${Math.round(match.score * 100)}%`
                    : `Match score ${Math.round(match.score * 100)}% · ${match.matchedSkills.length} of ${match.matchedSkills.length + match.missingSkills.length} required skills matched`}
                </div>
                {match.matchedSkills.length > 0 && (
                  <div className="list-item-sub">Matched: {match.matchedSkills.join(", ")}</div>
                )}
                {match.missingSkills.length > 0 && (
                  <div className="list-item-sub">Skills to build: {match.missingSkills.join(", ")}</div>
                )}
                {job?.link && (
                  <a href={job.link} target="_blank" rel="noopener noreferrer" className="notif-goto" style={{ marginTop: 8, display: "inline-flex" }}>
                    <Icon name="arrow" size={12} /> View posting
                  </a>
                )}
              </div>
              {onApply && (applied ? (
                <span className="pill muted">Applied</span>
              ) : (
                <button className="btn-primary" style={{ whiteSpace: "nowrap", padding: "8px 14px" }} onClick={() => onApply(match.jobId)}>
                  <Icon name="arrow" size={12} /> Apply
                </button>
              ))}
            </div>
          );
        })}
        </div>}
        {!currentAlumnus && bestJobs.length > 0 && <div className="list-block">
        {bestJobs.map(({ job, average, matchedAlumni }) => (
          <div className="list-item" key={job.id}>
            <div className="list-item-main">
              <div className="list-item-title">{job.title}</div>
              <div className="list-item-sub">{job.company} · matched {matchedAlumni} verified alumni</div>
            </div>
            <span className="pill ok">Avg. match {Math.round(average * 100)}%</span>
          </div>
        ))}
        </div>}
      </section>
      <div className="list-item-sub" style={{ marginTop: 8 }}>
        NLP extracted {techniques.nlp.skillsExtracted} skills from current job postings.
      </div>
    </div>
  );
}
