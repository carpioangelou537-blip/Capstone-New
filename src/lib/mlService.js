const ML_API_URL = (import.meta.env.VITE_ML_API_URL || "").trim().replace(/\/+$/, "");

export function isMlServiceConfigured() {
  return Boolean(ML_API_URL);
}

export async function analyzeCareerData({ alumni, jobs, courses, surveyResponses }, signal) {
  if (!ML_API_URL) {
    throw new Error("Python ML service is not configured.");
  }

  const payload = {
    alumni: alumni.map(({ id, userId, program, gradYear, employed, jobTitle, years, skills, verificationStatus }) => ({
      id, userId, program, gradYear, employed, jobTitle, years, skills, verificationStatus,
    })),
    jobs: jobs.map(({ id, title, company, description, skills }) => ({
      id, title, company, description, skills,
    })),
    courses: courses.map(({ id, title, program, description, competencies }) => ({
      id, title, program, description, competencies,
    })),
    surveyResponses: surveyResponses.map(({ userId, employed, jobTitle, years, skills, submittedAt, updatedAt }) => ({
      userId, employed, jobTitle, years, skills, submittedAt, updatedAt,
    })),
  };
  const response = await fetch(`${ML_API_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    signal,
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`ML service returned ${response.status}: ${detail || response.statusText}`);
  }
  return response.json();
}
