import unittest

from backend.ml_service import (
    AnalysisRequest,
    _date_key,
    _extract_skills,
    _is_course_related_title,
    _latest_alumni,
    analyze,
)


class ClassicalMLServiceTests(unittest.TestCase):
    def test_nlp_extracts_known_skills_from_job_text(self):
        skills = _extract_skills(
            "<p>Build APIs with Node.js, React, and PostgreSQL.</p>",
            {"Node.js", "React", "PostgreSQL", "Python"},
        )
        self.assertEqual(skills, ["Node.js", "PostgreSQL", "React"])

    def test_course_related_job_titles_use_whole_word_matches(self):
        self.assertTrue(_is_course_related_title("IT Support Specialist"))
        self.assertFalse(_is_course_related_title("Recruiter"))

    def test_iso_timestamps_compare_across_timezone_offsets(self):
        self.assertGreater(
            _date_key("2026-01-01T03:00:00+08:00"),
            _date_key("2026-01-01T00:00:00Z"),
        )

    def test_latest_survey_can_clear_stale_skills_and_employment(self):
        request = AnalysisRequest(
            alumni=[{
                "id": "1",
                "userId": "u1",
                "verificationStatus": "verified",
                "employed": "Employed",
                "jobTitle": "Developer",
                "skills": ["Python"],
            }],
            surveyResponses=[
                {"userId": "u1", "employed": "Unemployed", "skills": ["SQL"], "submittedAt": "2025-01-01T00:00:00Z"},
                {"userId": "u1", "employed": "Unknown", "jobTitle": "", "skills": [], "submittedAt": "2026-01-01T00:00:00Z"},
            ],
        )
        current = _latest_alumni(request)
        self.assertEqual(current[0]["employed"], "Unknown")
        self.assertEqual(current[0]["skills"], [])

    def test_unverified_alumni_are_excluded_from_model_population(self):
        request = AnalysisRequest(alumni=[
            {"id": "verified", "verificationStatus": "verified", "skills": ["Python"]},
            {"id": "pending", "verificationStatus": "pending", "skills": ["React"]},
        ])
        self.assertEqual([row["id"] for row in _latest_alumni(request)], ["verified"])

    def test_analysis_returns_all_five_techniques_and_course_matches(self):
        alumni = [
            {
                "id": str(index),
                "userId": f"user-{index}",
                "program": "BS Computer Science",
                "gradYear": str(2020 + index),
                "employed": "Unemployed" if index >= 6 else "Employed",
                "jobTitle": ("Software Developer" if index < 3 else "Chef") if index < 6 else "",
                "years": str(index),
                "skills": [["Python"], ["SQL"], ["React"], ["Cooking"], ["Baking"], ["Service"]][index % 6],
            }
            for index in range(8)
        ]
        request = AnalysisRequest(
            alumni=alumni,
            jobs=[{"id": "job-1", "title": "Python Developer", "skills": ["Python", "SQL"]}],
            courses=[{
                "id": "course-1",
                "title": "Programming",
                "program": "BS Computer Science",
                "competencies": ["Python", "SQL"],
            }],
        )

        result = analyze(request)
        techniques = result["techniques"]
        self.assertEqual(
            set(techniques),
            {"nlp", "tfidfCosine", "cart", "kmeans", "logisticRegression"},
        )
        self.assertEqual(techniques["tfidfCosine"]["courseCatalogCount"], 1)
        self.assertTrue(techniques["tfidfCosine"]["courseMatches"])
        self.assertGreater(techniques["nlp"]["courseSkillsExtracted"], 0)
        self.assertEqual(techniques["cart"]["status"], "trained")
        self.assertEqual(techniques["logisticRegression"]["status"], "trained")
        self.assertEqual(techniques["cart"]["metrics"]["confusionMatrix"]["values"][0][0]
                         + techniques["cart"]["metrics"]["confusionMatrix"]["values"][0][1]
                         + techniques["cart"]["metrics"]["confusionMatrix"]["values"][1][0]
                         + techniques["cart"]["metrics"]["confusionMatrix"]["values"][1][1], 6)
        self.assertIsNotNone(techniques["kmeans"]["silhouetteScore"])

    def test_supervised_models_report_insufficient_labeled_data(self):
        result = analyze(AnalysisRequest(alumni=[
            {"id": "one", "employed": "Employed", "jobTitle": "Software Developer", "program": "CS", "skills": ["Python"]},
            {"id": "two", "employed": "Employed", "jobTitle": "Web Developer", "program": "CS", "skills": ["React"]},
            {"id": "three", "employed": "Unknown", "program": "IT", "skills": ["SQL"]},
        ]))
        techniques = result["techniques"]
        self.assertEqual(techniques["cart"]["status"], "insufficient_data")
        self.assertEqual(techniques["logisticRegression"]["status"], "insufficient_data")


if __name__ == "__main__":
    unittest.main()
