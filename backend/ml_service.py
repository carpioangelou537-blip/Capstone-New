import html
import os
import re
import unicodedata
from collections import Counter
from datetime import datetime, timezone
from typing import Any

import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, ConfigDict, Field
from sklearn.cluster import KMeans
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    confusion_matrix,
    precision_recall_fscore_support,
    silhouette_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier


SKILL_TAXONOMY = (
    "JavaScript", "TypeScript", "Python", "Java", "C++", "C#", "PHP", "Ruby", "Go",
    "Rust", "SQL", "HTML", "CSS", "React", "Angular", "Vue", "Node.js", "Express",
    "Django", "Flask", "Spring", ".NET", "Laravel", "Next.js", "REST API", "GraphQL",
    "PostgreSQL", "MySQL", "MongoDB", "Firebase", "Supabase", "Redis", "AWS", "Azure",
    "Google Cloud", "Docker", "Kubernetes", "Linux", "Git", "GitHub", "CI/CD",
    "Cybersecurity", "Networking", "Network Administration", "Technical Support",
    "Data Analysis", "Data Science", "Machine Learning", "Artificial Intelligence",
    "TensorFlow", "scikit-learn", "Power BI", "Tableau", "Excel", "Project Management",
    "Agile", "UI/UX", "Figma", "Software Testing", "Quality Assurance", "DevOps",
    "Cloud Computing", "Information Security", "System Administration",
)
COURSE_KEYWORDS = (
    "developer", "programmer", "software", "web", "app", "application", "system",
    "systems", "network", "networking", "information technology", "database", "data",
    "cyber", "security", "cloud", "qa", "quality assurance", "tester", "engineer",
    "engineering", "support", "helpdesk", "help desk", "administrator", "admin",
    "analyst", "ui", "ux", "designer", "devops", "technician", "coder", "programming",
    "infrastructure", "technical",
)


class AlumniRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str | int | None = None
    userId: str | None = None
    program: str = ""
    gradYear: str = ""
    employed: str = "Unknown"
    jobTitle: str = ""
    years: str = ""
    skills: list[str] = Field(default_factory=list)
    verificationStatus: str = "verified"


class JobRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str | int | None = None
    title: str = ""
    company: str = ""
    description: str = ""
    skills: list[str] = Field(default_factory=list)


class CourseRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str | int | None = None
    title: str = ""
    program: str = ""
    competencies: list[str] = Field(default_factory=list)
    description: str = ""


class SurveyRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    userId: str = ""
    employed: str = "Unknown"
    jobTitle: str = ""
    years: str = ""
    skills: list[str] = Field(default_factory=list)
    submittedAt: str = ""
    updatedAt: str = ""


class AnalysisRequest(BaseModel):
    alumni: list[AlumniRecord] = Field(default_factory=list, max_length=5000)
    jobs: list[JobRecord] = Field(default_factory=list, max_length=2000)
    courses: list[CourseRecord] = Field(default_factory=list, max_length=2000)
    surveyResponses: list[SurveyRecord] = Field(default_factory=list, max_length=20000)


app = FastAPI(title="Alumni Tracer Classical ML API", version="1.0.0")
allowed_origins = [
    origin.strip()
    for origin in os.getenv("ML_CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def clean_text(value: Any) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<[^>]*>", " ", text)
    text = unicodedata.normalize("NFKC", text).lower()
    text = re.sub(r"[^a-z0-9+#./\s-]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def _date_key(value: str) -> float:
    if not value:
        return 0.0
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.timestamp()
    except ValueError:
        return 0.0


def _is_course_related_title(title: str) -> bool:
    normalized = clean_text(title)
    return any(
        re.search(
            r"(?<![a-z0-9])" + re.escape(keyword).replace(r"\ ", r"\s+") + r"(?![a-z0-9])",
            normalized,
        )
        for keyword in COURSE_KEYWORDS
    )


def _latest_alumni(request: AnalysisRequest) -> list[dict[str, Any]]:
    latest: dict[str, SurveyRecord] = {}
    for response in request.surveyResponses:
        if not response.userId:
            continue
        previous = latest.get(response.userId)
        response_date = _date_key(response.updatedAt or response.submittedAt)
        previous_date = _date_key((previous.updatedAt or previous.submittedAt) if previous else "")
        if previous is None or response_date > previous_date:
            latest[response.userId] = response

    records = []
    seen = set()
    for alumnus in request.alumni:
        row = alumnus.model_dump()
        if row["verificationStatus"] in ("pending", "rejected"):
            continue
        survey = latest.get(alumnus.userId or "")
        if survey:
            for key in ("employed", "jobTitle", "years", "skills"):
                value = getattr(survey, key)
                row[key] = value
        identity = str(row.get("userId") or row.get("id") or "")
        if identity and identity in seen:
            continue
        if identity:
            seen.add(identity)
        records.append(row)
    return records


def _profile_text(person: dict[str, Any]) -> str:
    return clean_text(" ".join([
        person.get("program", ""),
        " ".join(person.get("skills", [])),
    ]))


def _job_text(job: JobRecord) -> str:
    return clean_text(" ".join([
        job.title, job.description, " ".join(job.skills),
    ]))


def _course_text(course: CourseRecord) -> str:
    return clean_text(" ".join([
        course.title, course.program, course.description, " ".join(course.competencies),
    ]))


def _extract_skills(text: str, vocabulary: set[str]) -> list[str]:
    normalized = clean_text(text)
    found = []
    for skill in vocabulary:
        candidate = clean_text(skill)
        if not candidate:
            continue
        pattern = r"(?<![a-z0-9])" + re.escape(candidate).replace(r"\ ", r"\s+") + r"(?![a-z0-9])"
        if re.search(pattern, normalized):
            found.append(skill)
    return sorted(found, key=str.casefold)


def _similarities(documents: list[str]) -> np.ndarray:
    if not documents or not any(documents):
        return np.zeros((len(documents), len(documents)), dtype=float)
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        token_pattern=r"(?u)[a-z][a-z0-9+#./-]*",
        sublinear_tf=True,
    )
    try:
        matrix = vectorizer.fit_transform(documents)
    except ValueError:
        return np.zeros((len(documents), len(documents)), dtype=float)
    return (matrix @ matrix.T).toarray()


def _classifier_report(
    records: list[dict[str, Any]],
    labels: list[str],
    model: Any,
    feature_for: Any,
) -> dict[str, Any]:
    counts = Counter(labels)
    if len(records) < 4 or len(counts) < 2 or min(counts.values(), default=0) < 2:
        return {
            "status": "insufficient_data",
            "model": model.__class__.__name__,
            "sampleCount": len(records),
            "classCounts": dict(counts),
            "message": "Need at least 4 labeled alumni and at least 2 examples in each class before training and cross-validating.",
            "predictions": [],
            "metrics": None,
        }

    n_splits = min(5, min(counts.values()))
    cv = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=42)
    pipeline = Pipeline([
        ("tfidf", TfidfVectorizer(
            stop_words="english",
            ngram_range=(1, 2),
            token_pattern=r"(?u)[a-z][a-z0-9+#./-]*",
            sublinear_tf=True,
        )),
        ("classifier", model),
    ])
    texts = [feature_for(record) for record in records]
    predictions = cross_val_predict(pipeline, texts, labels, cv=cv)
    class_names = sorted(counts)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average="macro", zero_division=0
    )
    matrix = confusion_matrix(labels, predictions, labels=class_names)
    results = []
    for record, actual, predicted in zip(records, labels, predictions):
        if not record.get("id") and not record.get("userId"):
            continue
        results.append({
            "alumniId": str(record.get("id") or ""),
            "userId": record.get("userId") or "",
            "actual": actual,
            "predicted": str(predicted),
            "correct": bool(actual == predicted),
        })
    return {
        "status": "trained",
        "model": model.__class__.__name__,
        "sampleCount": len(records),
        "classCounts": dict(counts),
        "crossValidationFolds": n_splits,
        "metrics": {
            "accuracy": round(float(accuracy_score(labels, predictions)), 4),
            "precisionMacro": round(float(precision), 4),
            "recallMacro": round(float(recall), 4),
            "f1Macro": round(float(f1), 4),
            "confusionMatrix": {
                "labels": class_names,
                "values": matrix.tolist(),
            },
        },
        "predictions": results,
    }


def _cluster_report(records: list[dict[str, Any]]) -> dict[str, Any]:
    usable = [record for record in records if _profile_text(record)]
    if len(usable) < 3:
        return {
            "status": "insufficient_data",
            "sampleCount": len(usable),
            "message": "At least 3 alumni with profile or career data are needed to cluster.",
            "silhouetteScore": None,
            "assignments": [],
        }
    vectorizer = TfidfVectorizer(
        stop_words="english",
        ngram_range=(1, 2),
        token_pattern=r"(?u)[a-z][a-z0-9+#./-]*",
        sublinear_tf=True,
    )
    try:
        matrix = vectorizer.fit_transform([_profile_text(record) for record in usable])
    except ValueError:
        matrix = None
    if matrix is None or matrix.shape[1] == 0 or len({row.tobytes() for row in matrix.toarray()}) < 2:
        return {
            "status": "insufficient_data",
            "sampleCount": len(usable),
            "message": "Profiles do not contain enough variation to form meaningful clusters.",
            "silhouetteScore": None,
            "assignments": [],
        }

    best = None
    max_clusters = min(5, len(usable) - 1)
    for k in range(2, max_clusters + 1):
        model = KMeans(n_clusters=k, random_state=42, n_init=10)
        labels = model.fit_predict(matrix)
        if len(set(labels)) < 2 or len(set(labels)) >= len(usable):
            continue
        score = float(silhouette_score(matrix, labels, metric="cosine"))
        if best is None or score > best["score"]:
            best = {"model": model, "labels": labels, "score": score}
    if best is None:
        return {
            "status": "insufficient_data",
            "sampleCount": len(usable),
            "message": "Profiles do not contain enough distinct patterns for clustering.",
            "silhouetteScore": None,
            "assignments": [],
        }
    assignments = []
    for record, label in zip(usable, best["labels"]):
        assignments.append({
            "alumniId": str(record.get("id") or ""),
            "userId": record.get("userId") or "",
            "cluster": int(label),
        })
    return {
        "status": "trained",
        "sampleCount": len(usable),
        "clusterCount": len(set(best["labels"])),
        "silhouetteScore": round(best["score"], 4),
        "assignments": assignments,
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "classical-ml"}


@app.post("/analyze")
def analyze(request: AnalysisRequest) -> dict[str, Any]:
    alumni = _latest_alumni(request)
    jobs = request.jobs
    courses = request.courses
    vocabulary = set(SKILL_TAXONOMY)
    for person in alumni:
        vocabulary.update(str(skill).strip() for skill in person.get("skills", []) if str(skill).strip())
    for job in jobs:
        vocabulary.update(skill.strip() for skill in job.skills if skill.strip())
    for course in courses:
        vocabulary.update(skill.strip() for skill in course.competencies if skill.strip())

    extracted_jobs = [
        {
            "jobId": str(job.id or ""),
            "title": job.title,
            "skills": _extract_skills(_job_text(job), vocabulary),
        }
        for job in jobs
    ]
    extracted_courses = [
        {
            "courseId": str(course.id or ""),
            "title": course.title,
            "skills": _extract_skills(_course_text(course), vocabulary),
        }
        for course in courses
    ]
    profile_docs = [_profile_text(person) for person in alumni]
    job_docs = [_job_text(job) for job in jobs]
    course_docs = [_course_text(course) for course in courses]
    all_docs = profile_docs + job_docs + course_docs
    similarity = _similarities(all_docs)
    job_matches = []
    skill_demand: Counter[str] = Counter()
    for index, job in enumerate(jobs):
        job_skills = set(extracted_jobs[index]["skills"])
        skill_demand.update(skill.casefold() for skill in job_skills)
        for person_index, person in enumerate(alumni):
            if person.get("id") is None and person.get("userId") is None:
                continue
            profile_skills = {str(skill).strip().casefold() for skill in person.get("skills", [])}
            gaps = sorted(
                (skill for skill in job_skills if skill.casefold() not in profile_skills),
                key=str.casefold,
            )
            job_matches.append({
                "alumniId": str(person.get("id") or ""),
                "userId": person.get("userId") or "",
                "jobId": str(job.id or ""),
                "title": job.title,
                "similarity": round(float(similarity[person_index, len(alumni) + index]), 4),
                "matchedSkills": sorted(
                    (skill for skill in job_skills if skill.casefold() in profile_skills),
                    key=str.casefold,
                ),
                "missingSkills": gaps,
            })
    job_matches.sort(key=lambda item: item["similarity"], reverse=True)

    course_matches = []
    course_offset = len(alumni) + len(jobs)
    for course_index, course in enumerate(courses):
        for person_index, person in enumerate(alumni):
            if person.get("id") is None and person.get("userId") is None:
                continue
            if course.program and person.get("program") and course.program.casefold() != person["program"].casefold():
                continue
            course_matches.append({
                "alumniId": str(person.get("id") or ""),
                "userId": person.get("userId") or "",
                "courseId": str(course.id or ""),
                "courseTitle": course.title,
                "program": course.program,
                "similarity": round(float(similarity[person_index, course_offset + course_index]), 4),
            })
    course_matches.sort(key=lambda item: item["similarity"], reverse=True)

    recommendations = []
    for person in alumni:
        present = {str(skill).strip().casefold() for skill in person.get("skills", [])}
        person_id = str(person.get("id") or "")
        user_id = person.get("userId") or ""
        for skill, demand in skill_demand.most_common():
            if skill in present:
                continue
            matching_courses = [
                course for course, analyzed in zip(courses, extracted_courses)
                if any(skill == item.casefold() for item in analyzed["skills"])
                and (not course.program or course.program.casefold() == str(person.get("program", "")).casefold())
            ]
            recommendations.append({
                "alumniId": person_id,
                "userId": user_id,
                "skill": next(
                    (found for entry in extracted_jobs for found in entry["skills"] if found.casefold() == skill),
                    skill,
                ),
                "demand": demand,
                "courses": [
                    {"courseId": str(course.id or ""), "title": course.title}
                    for course in matching_courses[:3]
                ],
            })

    alignment_records = [
        person for person in alumni
        if person.get("jobTitle", "").strip()
        and person.get("employed", "Unknown") in ("Employed", "Self Employed")
    ]
    alignment_labels = [
        "Aligned" if _is_course_related_title(person["jobTitle"]) else "Not aligned"
        for person in alignment_records
    ]
    alignment = _classifier_report(
        alignment_records,
        alignment_labels,
        DecisionTreeClassifier(max_depth=4, class_weight="balanced", random_state=42),
        lambda person: clean_text(" ".join([
            person.get("program", ""), " ".join(person.get("skills", [])),
        ])),
    )
    alignment["targetDefinition"] = "Course-related job-title keyword label; see the shared COURSE_KEYWORDS rule."

    employment_records = [
        person for person in alumni
        if person.get("employed") in ("Employed", "Self Employed", "Unemployed")
    ]
    employment_labels = [
        "Employed" if person["employed"] in ("Employed", "Self Employed") else "Unemployed"
        for person in employment_records
    ]
    employability = _classifier_report(
        employment_records,
        employment_labels,
        LogisticRegression(class_weight="balanced", max_iter=1000, random_state=42),
        lambda person: clean_text(" ".join([
            person.get("program", ""), person.get("gradYear", ""),
            " ".join(person.get("skills", [])),
        ])),
    )
    employability["targetDefinition"] = "Current survey employment status; job title and employment duration are excluded from predictors."

    cluster = _cluster_report(alumni)
    for assignment in cluster.get("assignments", []):
        member = next(
            (record for record in alumni if str(record.get("id") or "") == assignment["alumniId"]
             and (record.get("userId") or "") == assignment["userId"]),
            {},
        )
        assignment["program"] = member.get("program", "")
        assignment["employment"] = member.get("employed", "Unknown")
        assignment["jobTitle"] = member.get("jobTitle", "")
        assignment["skills"] = member.get("skills", [])

    return {
        "sampleCount": len(alumni),
        "techniques": {
            "nlp": {
                "status": "ready",
                "jobsProcessed": len(jobs),
                "skillsExtracted": sum(len(item["skills"]) for item in extracted_jobs),
                "jobs": extracted_jobs,
                "coursesProcessed": len(courses),
                "courseSkillsExtracted": sum(len(item["skills"]) for item in extracted_courses),
                "courses": extracted_courses,
            },
            "tfidfCosine": {
                "status": "ready",
                "jobMatches": job_matches,
                "courseMatches": course_matches,
                "recommendations": recommendations,
                "courseCatalogCount": len(courses),
            },
            "cart": alignment,
            "kmeans": cluster,
            "logisticRegression": employability,
        },
    }
