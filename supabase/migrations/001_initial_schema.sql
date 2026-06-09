-- ============================================================
-- SAG Career Portal – Supabase Schema
-- Run in Supabase Dashboard > SQL Editor
--
-- NOTES:
-- • profiles.id  = auth.users.id (standard Supabase pattern)
-- • candidates.user_id = auth.users.id (FK, candidates has own PK id)
-- • applications.candidate_id = candidates.user_id = auth.users.id
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── profiles ────────────────────────────────────────────────
-- id here IS the auth user UUID (references auth.users.id directly)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT NOT NULL,
  email       TEXT NOT NULL,
  phone       TEXT,
  role        TEXT NOT NULL CHECK (role IN ('candidate', 'hr_admin', 'super_admin')) DEFAULT 'candidate',
  status      TEXT NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ
);

-- ─── candidates ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS candidates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  full_name         TEXT NOT NULL,
  email             TEXT NOT NULL,
  phone             TEXT,
  domicile          TEXT,
  education         TEXT,
  major             TEXT,
  experience_year   TEXT,
  current_company   TEXT,
  current_position  TEXT,
  expected_salary   TEXT,
  linkedin_url      TEXT,
  portfolio_url     TEXT,
  cv_url            TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ
);

-- ─── jobs (optional – Supabase fallback if not using Contentful) ─
CREATE TABLE IF NOT EXISTS jobs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title           TEXT NOT NULL,
  slug            TEXT UNIQUE NOT NULL,
  department      TEXT,
  location        TEXT,
  employment_type TEXT,
  description     TEXT,
  requirements    TEXT,
  status          TEXT NOT NULL CHECK (status IN ('active', 'inactive', 'closed')) DEFAULT 'active',
  deadline        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);

-- ─── applications ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id    UUID REFERENCES candidates(user_id) ON DELETE CASCADE NOT NULL,
  job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL,
  job_slug        TEXT,
  job_title       TEXT NOT NULL,
  status          TEXT NOT NULL CHECK (status IN ('submitted', 'screening', 'interview', 'offering', 'accepted', 'rejected')) DEFAULT 'submitted',
  expected_salary TEXT,
  availability    TEXT,
  cover_note      TEXT,
  applied_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS uniq_application_candidate_job
  ON applications (candidate_id, job_slug)
  WHERE job_slug IS NOT NULL;

-- ─── application_notes ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS application_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  note            TEXT NOT NULL,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- ─── profiles policies ────────────────────────────────────────
-- profiles.id IS the auth user UUID, so we compare auth.uid() = id

CREATE POLICY "profiles: owner read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- HR admins can read all profiles
-- NOTE: uses profiles.id (not user_id) because profiles.id = auth.uid()
CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

-- ─── candidates policies ──────────────────────────────────────

CREATE POLICY "candidates: owner all"
  ON candidates FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "candidates: admin read"
  ON candidates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

-- ─── jobs policies ────────────────────────────────────────────

CREATE POLICY "jobs: public read active"
  ON jobs FOR SELECT
  USING (status = 'active' OR auth.uid() IS NOT NULL);

CREATE POLICY "jobs: admin all"
  ON jobs FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

-- ─── applications policies ────────────────────────────────────

CREATE POLICY "applications: candidate insert"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = candidate_id);

CREATE POLICY "applications: candidate read own"
  ON applications FOR SELECT
  USING (auth.uid() = candidate_id);

CREATE POLICY "applications: admin read all"
  ON applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

CREATE POLICY "applications: admin update"
  ON applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

-- ─── application_notes policies ───────────────────────────────

CREATE POLICY "notes: admin all"
  ON application_notes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

CREATE POLICY "notes: creator read"
  ON application_notes FOR SELECT
  USING (auth.uid() = created_by);

-- ============================================================
-- Storage: candidate-cv bucket
-- Create manually: Supabase Dashboard > Storage > New bucket
--   Name: candidate-cv | Public: false | Max size: 10MB
--   Allowed types: application/pdf, application/msword,
--     application/vnd.openxmlformats-officedocument.wordprocessingml.document
-- ============================================================

CREATE POLICY "cv: candidate upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'candidate-cv'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "cv: candidate read own"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'candidate-cv'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "cv: admin read all"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'candidate-cv'
    AND EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

-- ============================================================
-- Set super_admin (run after creating auth user):
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'your@email.com';
-- ============================================================
