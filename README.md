# Alumni Tracer System

A React/Vite alumni tracking and career analytics application backed by
Supabase. Alumni can maintain a profile, submit employment and skills surveys,
find relevant job postings, and view alumni events. Administrators can verify
accounts, manage alumni information, and review employment and skills
analytics.

## Features added and changes made

### Accounts, verification, and profiles

- Alumni can create an account with their name, program, graduation year,
  login email, and password. Supabase Auth handles account identity.
- New alumni accounts are reviewed by an administrator before access to
  restricted features is granted. Pending accounts see a verification-status
  page with a manual status check and automatic refresh; rejected accounts see
  a separate status page.
- The initial Alumni Survey modal collects Date of Birth, Contact Number,
  login email, calculated age, and address along with the employment survey.
  These personal-detail fields are intentionally not part of the sign-up form.
- Alumni can update their profile, personal details, login email, and photo.
  Admin alumni details include program, Date of Birth, age, contact number,
  login email, address, employment information, and skills.
- Survey responses are retained as history. Skill lists are deduplicated
  case-insensitively when submitted and displayed, avoiding duplicate chips
  and React keys.

### Administrator tools

- Verify or reject new alumni registrations; manage alumni accounts and view
  their profiles and survey history.
- Search alumni/user records by name and search survey results by the alumnus's
  name.
- Review survey completion and employment summaries.
- Publish and remove job postings, including a job description, required
  skills, and an external posting link.
- Publish and remove events, including an event description; alumni can read
  the event details and RSVP.
- Manage notifications and review analytics and activity.
- Course competency management was removed from the admin interface and the
  application no longer requests the retired `course_competencies` table.

### Career scores and recommendations

- **Job Alignment** is an explainable estimate based on employment status,
  current job-title category, and recognized IT/CS skills. Unemployed or
  unknown alumni score 0%. Direct IT/CS-related roles score 100%; adjacent,
  transferable, and other role categories receive partial base credit, with
  up to 20 additional points for recognized digital skills. It is not a
  hiring probability.
- **Dashboard Skill alignment** is separate from Job Alignment. Unemployed or
  unknown profiles score 0%. For direct IT/CS-related roles, the score is the
  share of listed skills recognized as IT/CS skills. For other employed roles,
  each recognized IT/CS skill adds 25 points, capped at 100; for example,
  one recognized skill scores 25%, two score 50%, and three score 75%.
- Job recommendations combine TF-IDF/cosine profile similarity (70%) and
  exact required-skill coverage (30%). Postings with no profile/skill evidence
  are excluded. Match scores are rankings, not predictions of hiring success.
- Job descriptions are used as text input for skill extraction. Admin analytics
  use verified alumni and the newest survey response per alumnus where
  applicable.
- Alumni can mark applications as applied; application records are stored
  separately from simply viewing a posting.

### Machine-learning implementation

The app uses classical machine learning only. There is a Python API using
scikit-learn and an in-browser fallback so core insights continue to work when
the API is not running.

- NLP text preprocessing and skill extraction.
- TF-IDF and cosine similarity for job/profile and course-related matching.
- CART decision tree for career-outcome alignment classification.
- K-Means clustering for alumni career trends.
- Logistic regression for employability outcomes.
- Supervised evaluation reports accuracy, macro precision, macro recall,
  macro F1, and a confusion matrix when there is sufficient labeled data.
  K-Means reports a silhouette score when it can be calculated. Insufficient
  or unknown labels are not presented as valid trained-model results.
- The Python service is optional. The browser implementation is used by
  default, and a configured but unavailable API falls back to browser analysis.
  The frontend has no default localhost API dependency.
- Names and contact information are excluded from the analysis API payload.

These models and scores describe the available profile and posting data; they
do not guarantee a particular career or hiring outcome.

## Run the app

1. Install Node.js supported by `package.json` and install dependencies:
   `npm install`
2. Configure the Supabase URL and anon key in the frontend environment.
3. Start the frontend:
   `npm run dev`
4. Optionally run the Python API:
   - Install Python 3.10 or newer.
   - Install API dependencies: `python -m pip install -r backend/requirements.txt`
   - Start the service: `python -m uvicorn backend.ml_service:app --reload`
   - Set `VITE_ML_API_URL` in the frontend environment to use it. Configure
     `ML_CORS_ORIGINS` on the API with the allowed frontend origins.

## Supabase SQL

Run SQL in the Supabase SQL Editor for the same project configured in the
frontend environment. These scripts have different scopes:

- `src/supabase/schema.sql` — full schema for a fresh setup or a complete
  schema refresh. It includes RLS policies and the current table definitions.
  It also drops the retired `course_competencies` table.
- `src/supabase/ml_schema.sql` — focused additions for an existing base
  schema, including email/job/event description fields and course-competency
  table cleanup.
- `src/supabase/alumni_email.sql` — adds alumni email, Date of Birth, contact
  number, and address columns, plus the event description column and the
  event-read grant used by the app.
- `src/supabase/event_description.sql` — the specific, minimal migration when
  only the event description column is needed:

  ```sql
  alter table public.events
    add column if not exists description text not null default '';
  ```

Do not run a broad schema script just to add event descriptions; use the
focused migration above. SQL changes must be run against the hosted Supabase
project before the matching frontend feature can persist there.

## Project history

The sequence below summarizes the project from its initial application to the
current feature set; it is organized by development milestone rather than
calendar date.

1. **Initial application:** React/Vite app with alumni and admin views,
   authentication and registration screens, surveys, profiles, job listings,
   events, notifications, analytics, and Supabase data access.
2. **Profile and navigation improvements:** personal profile editing,
   profile-photo support, admin profile details, survey modal behavior,
   application/event controls, and dashboard/sidebar navigation refinements.
3. **Career analytics and ML:** added the Python/scikit-learn service and
   browser ML implementation, model tests, job and skill matching, analytics,
   fallback behavior, and improved alignment explanations.
4. **Data and UX refinements:** corrected role/course labels, separated job
   and skill metrics, improved partial skill scoring, removed duplicate or
   unwanted recommendation/analytics displays, retired course competency
   management, and improved spacing and navigation.
5. **Account and survey details:** synchronized the Supabase login email,
   added personal details to the profile and first Alumni Survey modal,
   displayed age and formatted DOB in admin alumni information, kept survey
   history usable, and prevented duplicate skill chips/keys.
6. **Reliability and admin tools:** avoided a required localhost ML service,
   added fallback behavior, fixed empty DOB values for SQL `date` columns,
   guarded against duplicate alumni-row creation during auth callbacks,
   made alumni-row errors visible, added a focused verification-status check,
   searchable survey results, and event descriptions.

## Validation

The browser ML tests can be run with:

```sh
node --test src/lib/browserMl.test.js
```

The project also provides:

```sh
npm run lint
npm run build
```
