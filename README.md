# React + Vite

## Classical machine-learning service

The React app calls a separate Python API for NLP-based skill extraction,
TF-IDF/cosine job and course matching, CART career-alignment classification,
K-Means career clusters, and logistic-regression employability classification.
The API uses alumni, survey, and job data already loaded by the app; it does
not need database credentials.

1. Install Python 3.10 or newer.
2. From the repository root, install the API dependencies:
   `python -m pip install -r backend/requirements.txt`
3. Start the API in one terminal:
   `python -m uvicorn backend.ml_service:app --reload`
4. Start the React app in another terminal:
   `npm run dev`
5. If the original database schema is already installed, run
   `src/supabase/ml_schema.sql` in the Supabase SQL editor. This focused,
   rerunnable migration adds `jobs.description` and removes the retired
   `course_competencies` table. Otherwise, the full
   `src/supabase/schema.sql` includes the same cleanup.
   This migration also adds the admin-visible email field. Existing alumni
   email addresses are populated when those alumni next sign in.

The browser implementation is used by default without making a request to a
local Python server. Set `VITE_ML_API_URL` in the frontend environment to
enable a Python API, and set `ML_CORS_ORIGINS` on the
Python service to a comma-separated list of allowed frontend origins. Only
the profile, skills, survey outcomes, and postings needed for analysis are sent
to the API; names and contact details are not included.
Use HTTPS and restrict access appropriately when deploying beyond a trusted
local environment.

If a configured Python service cannot be reached, the app automatically runs
its classical NLP, TF-IDF/cosine matching, CART, logistic-regression, and
K-Means implementations in the browser. This keeps insights usable without a
running Python process; running the Python service uses the scikit-learn
implementations instead.

Supervised models are not presented as trained until there are at least four
labeled alumni and at least two examples per class. Accuracy, macro precision,
macro recall, macro F1, and the confusion matrix are computed from stratified
out-of-fold predictions. CART's target follows the existing course-related
job-title keyword rule; logistic regression uses observed survey employment
status and does not use the current job title or employment duration as
predictors. K-Means reports its silhouette score, or explains when data is too
small or uniform. These measures describe the available data and are not a
guarantee of future prediction accuracy. Unknown/unreported survey outcomes
are excluded from supervised training.

The service is classical machine learning only; it does not use deep learning,
neural networks, reinforcement learning, or LLMs.

Job recommendations use 70% TF-IDF cosine similarity and 30% exact coverage
of skills extracted from job requirements. Postings with no skill overlap and
no text similarity are excluded. Admin outcome analytics use verified alumni,
the newest survey response per alumnus, one count per distinct skill per
person, and one demand count per posting. These deterministic match rankings
are not represented as hiring probabilities.

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
