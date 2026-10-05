import test from "node:test";
import assert from "node:assert/strict";
import {
  analyzeInBrowser,
  extractJobSkills,
  getCareerAlignment,
  getDigitalSkillAlignment,
  getJobMatchMetrics,
  isCourseRelatedTitle,
  mergeLatestSurveyResponses,
  rankJobMatches,
} from "./browserMl.js";

const alumni = [
  { id: "1", userId: "u1", program: "BS Computer Science", gradYear: "2020", employed: "Employed", jobTitle: "Software Developer", skills: ["Python"] },
  { id: "2", userId: "u2", program: "BS Computer Science", gradYear: "2021", employed: "Employed", jobTitle: "Web Developer", skills: ["React"] },
  { id: "3", userId: "u3", program: "BS Computer Science", gradYear: "2022", employed: "Employed", jobTitle: "Data Analyst", skills: ["SQL"] },
  { id: "4", userId: "u4", program: "BS Information Technology", gradYear: "2020", employed: "Employed", jobTitle: "Chef", skills: ["Cooking"] },
  { id: "5", userId: "u5", program: "BS Information Technology", gradYear: "2021", employed: "Employed", jobTitle: "Baker", skills: ["Baking"] },
  { id: "6", userId: "u6", program: "BS Information Technology", gradYear: "2022", employed: "Employed", jobTitle: "Waiter", skills: ["Service"] },
  { id: "7", userId: "u7", program: "BS Computer Science", gradYear: "2023", employed: "Unemployed", jobTitle: "", skills: ["Python"] },
  { id: "8", userId: "u8", program: "BS Information Technology", gradYear: "2023", employed: "Unemployed", jobTitle: "", skills: ["Cooking"] },
];

test("browser fallback runs all five classical ML techniques", () => {
    const result = analyzeInBrowser({
      alumni,
      jobs: [{ id: "j1", title: "Python Developer", company: "Example", description: "Build apps with React", skills: ["Python", "SQL"] }],
      courses: [{ id: "c1", title: "Programming", program: "BS Computer Science", competencies: ["Python", "SQL"] }],
      surveyResponses: [],
    });

    assert.equal(result.analysisMode, "browser");
    assert.deepEqual(Object.keys(result.techniques).sort(), ["cart", "kmeans", "logisticRegression", "nlp", "tfidfCosine"].sort());
    assert.ok(result.techniques.nlp.jobs[0].skills.includes("Python"));
    assert.ok(result.techniques.nlp.courses[0].skills.includes("SQL"));
    assert.ok(result.techniques.tfidfCosine.jobMatches.find((match) => match.alumniId === "1").matchedSkills.includes("Python"));
    assert.equal(result.techniques.tfidfCosine.courseMatches.length, 4);
    assert.equal(result.techniques.cart.status, "trained");
    assert.equal(result.techniques.logisticRegression.status, "trained");
    assert.equal(result.techniques.cart.metrics.confusionMatrix.values.flat().reduce((sum, count) => sum + count, 0), 6);
    assert.equal(result.techniques.kmeans.status, "trained");
    assert.ok(Number.isFinite(result.techniques.kmeans.silhouetteScore));
});

test("browser fallback withholds supervised metrics without enough labeled examples", () => {
    const result = analyzeInBrowser({
      alumni: alumni.slice(0, 3),
      jobs: [],
      courses: [],
      surveyResponses: [],
    });

    assert.equal(result.techniques.cart.status, "insufficient_data");
    assert.equal(result.techniques.logisticRegression.status, "insufficient_data");
});

test("latest survey data replaces stale values even with explicit unknown and empty skills", () => {
  const merged = mergeLatestSurveyResponses(
    [{ id: "1", userId: "u1", employed: "Employed", jobTitle: "Developer", skills: ["Python"] }],
    [
      { userId: "u1", employed: "Unemployed", jobTitle: "", skills: [], submittedAt: "2025-01-01T00:00:00Z" },
      { userId: "u1", employed: "Unknown", jobTitle: "", skills: [], submittedAt: "2026-01-01T00:00:00Z" },
    ],
  );
  assert.equal(merged[0].employed, "Unknown");
  assert.equal(merged[0].jobTitle, "");
  assert.deepEqual(merged[0].skills, []);
});

test("unverified alumni do not influence career analytics or recommendation rankings", () => {
  const result = analyzeInBrowser({
    alumni: [
      { id: "verified", verificationStatus: "verified", program: "CS", skills: ["Python"], employed: "Employed" },
      { id: "pending", verificationStatus: "pending", program: "CS", skills: ["React"], employed: "Unemployed" },
    ],
    jobs: [{ id: "j1", title: "React Developer", skills: ["React"] }],
    courses: [],
    surveyResponses: [],
  });
  assert.equal(result.sampleCount, 1);
  assert.equal(result.techniques.tfidfCosine.jobMatches.length, 1);
  assert.equal(result.techniques.tfidfCosine.jobMatches[0].alumniId, "verified");
});

test("job ranking excludes postings with no profile or skill evidence", () => {
  const ranked = rankJobMatches([
    { jobId: "match", similarity: 0.1, matchedSkills: ["Python"], missingSkills: ["SQL"] },
    { jobId: "unrelated", similarity: 0, matchedSkills: [], missingSkills: ["React"] },
  ]);
  assert.deepEqual(ranked.map((item) => item.jobId), ["match"]);
  assert.ok(ranked[0].score > 0);
});

test("course-alignment labels match whole words instead of substrings", () => {
  assert.equal(isCourseRelatedTitle("Software Developer"), true);
  assert.equal(isCourseRelatedTitle("IT Support Specialist"), true);
  assert.equal(isCourseRelatedTitle("Recruiter"), false);
});

test("NLP skill extraction recognizes description requirements and avoids substrings", () => {
  const [job] = extractJobSkills([
    { id: "1", title: "JavaScript Developer", description: "Use Node.js and PostgreSQL." },
  ]);
  assert.deepEqual(job.skills, ["JavaScript", "Node.js", "PostgreSQL"]);
});

test("dashboard and job alignment metrics use current profile and extracted requirements", () => {
  const jobs = [
    { id: "j1", title: "React Developer", skills: ["React", "JavaScript"] },
    { id: "j2", title: "Python Analyst", skills: ["Python", "SQL"] },
    { id: "j3", title: "Network Engineer", skills: ["Networking"] },
  ];
  const first = getJobMatchMetrics({ employed: "Employed", jobTitle: "Web Developer", skills: ["React"] }, jobs);
  assert.equal(first.matchedJobCount, 1);
  assert.equal(first.eligibleJobCount, 1);
  assert.equal(first.matchedSkillCount, 1);
  assert.equal(first.requiredSkillCount, 2);
  assert.equal(first.jobCoverage, 1);
  assert.equal(first.skillCoverage, 1 / 2);

  const updated = getJobMatchMetrics({ employed: "Employed", jobTitle: "Web Developer", skills: ["React", "JavaScript", "Python", "SQL"] }, jobs);
  assert.equal(updated.matchedJobCount, 1);
  assert.equal(updated.jobCoverage, 1);
  assert.equal(updated.matchedSkillCount, 2);
  assert.equal(updated.skillCoverage, 1);
});

test("job requirements stay fixed per posting and metrics change with current job data", () => {
  const jobs = [
    { id: "j1", title: "React Developer", skills: ["React", "JavaScript"] },
    { id: "j2", title: "Python Analyst", skills: ["Python", "SQL"] },
  ];
  const first = getJobMatchMetrics({ employed: "Employed", jobTitle: "Web Developer", skills: ["React"] }, jobs);
  const differentProfile = getJobMatchMetrics({ employed: "Employed", jobTitle: "Web Developer", skills: ["React", "JavaScript"] }, jobs);
  assert.equal(first.requiredSkillCount, differentProfile.requiredSkillCount);
  assert.equal(first.eligibleJobCount, differentProfile.eligibleJobCount);
  assert.notEqual(first.skillCoverage, differentProfile.skillCoverage);

  const changedJobs = [
    ...jobs,
    { id: "j3", title: "Network Engineer", skills: ["Networking"] },
  ];
  const changed = getJobMatchMetrics({ employed: "Employed", jobTitle: "Web Developer", skills: ["React"] }, changedJobs);
  assert.equal(changed.eligibleJobCount, 1);
  assert.equal(changed.requiredSkillCount, 2);
  assert.equal(changed.jobCoverage, 1);
  assert.equal(changed.skillCoverage, 1 / 2);
});

test("unemployed and unknown profiles have zero job and skill alignment", () => {
  const jobs = [
    { id: "j1", title: "React Developer", skills: ["React", "JavaScript"] },
    { id: "j2", title: "Python Analyst", skills: ["Python", "SQL"] },
  ];

  for (const employed of ["Unemployed", "Unknown"]) {
    const metrics = getJobMatchMetrics({ employed, jobTitle: "Web Developer", skills: ["React", "Python", "SQL"] }, jobs);
    assert.equal(metrics.jobCoverage, 0);
    assert.equal(metrics.skillCoverage, 0);
    assert.equal(metrics.hasCurrentEmployment, false);
  }

  const employedMetrics = getJobMatchMetrics({ employed: "Employed", jobTitle: "Web Developer", skills: ["React"] }, jobs);
  assert.equal(employedMetrics.jobCoverage, 1);
  assert.equal(employedMetrics.skillCoverage, 0.5);
  assert.equal(employedMetrics.hasCurrentEmployment, true);
});

test("Web Developer aligns with its matching posting rather than unrelated open jobs", () => {
  const metrics = getJobMatchMetrics({
    employed: "Employed",
    jobTitle: "Web Developer",
    skills: ["JavaScript", "React"],
  }, [
    { id: "web", title: "Junior Web Developer", skills: ["JavaScript", "React"] },
    { id: "data", title: "Data Analyst", skills: ["Python", "SQL", "Data Analysis"] },
    { id: "support", title: "IT Support Specialist", skills: ["Networking", "Cybersecurity"] },
  ]);

  assert.equal(metrics.eligibleJobCount, 1);
  assert.equal(metrics.matchedJobCount, 1);
  assert.equal(metrics.jobCoverage, 1);
  assert.equal(metrics.skillCoverage, 1);
});

test("IT/CS-related jobs score 100%, skills are tracked separately, and unemployed score zero", () => {
  const developer = getCareerAlignment({
    employed: "Employed",
    jobTitle: "Web Developer",
    skills: ["JavaScript", "React"],
  });
  assert.equal(developer.score, 100);
  assert.equal(developer.category, "direct");
  assert.equal(getCareerAlignment({
    employed: "Employed",
    jobTitle: "Web Developer",
    skills: [],
  }).score, 100);

  const cashier = getCareerAlignment({
    employed: "Employed",
    jobTitle: "Sales Lady / Cashier",
    skills: ["Computer Skills", "Excel"],
  });
  assert.equal(cashier.score, 20);
  assert.equal(cashier.category, "transferable");

  const unemployed = getCareerAlignment({
    employed: "Unemployed",
    jobTitle: "Web Developer",
    skills: ["JavaScript", "React"],
  });
  assert.equal(unemployed.score, 0);
});

test("a cashier role receives partial alignment from the role and recognized skills", () => {
  const profile = {
    employed: "Employed",
    jobTitle: "Cashier",
    skills: ["Computer"],
  };
  const alignment = getCareerAlignment(profile);

  assert.equal(alignment.score, 15);
});

test("IT/CS role skills score fully, unrelated roles scale by skill count, unemployed score zero", () => {
  const relatedRole = getDigitalSkillAlignment({
    employed: "Employed",
    jobTitle: "Web Developer",
    skills: ["React", "SQL"],
  });
  assert.equal(relatedRole.score, 100);

  const unrelatedRole = getDigitalSkillAlignment({
    employed: "Employed",
    jobTitle: "Cashier",
    skills: ["React", "SQL"],
  });
  assert.equal(unrelatedRole.score, 50);

  const oneSkillOutsideIT = getDigitalSkillAlignment({
    employed: "Employed",
    jobTitle: "Cashier",
    skills: ["React"],
  });
  assert.equal(oneSkillOutsideIT.score, 25);

  const threeSkillsOutsideIT = getDigitalSkillAlignment({
    employed: "Employed",
    jobTitle: "Cashier",
    skills: ["React", "SQL", "JavaScript"],
  });
  assert.equal(threeSkillsOutsideIT.score, 75);

  const unemployed = getDigitalSkillAlignment({
    employed: "Unemployed",
    jobTitle: "Web Developer",
    skills: ["React", "SQL"],
  });
  assert.equal(unemployed.score, 0);

  assert.deepEqual(unrelatedRole.matchedSkills, ["React", "SQL"]);
  assert.equal(unrelatedRole.totalSkills, 2);
});
