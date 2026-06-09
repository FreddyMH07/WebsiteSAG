-- ============================================================
-- PATCH: Fix RLS Policies + Create Missing Tables
-- Run this in Supabase Dashboard > SQL Editor
-- Safe to run on existing deployment (profiles table already exists)
-- ============================================================

-- ─── Step 1: Drop broken RLS policies on profiles ────────────
-- The old policies referenced "user_id" column which doesn't exist
-- in the actual profiles table (profiles.id IS the auth user UUID)

DROP POLICY IF EXISTS "profiles: owner read"      ON profiles;
DROP POLICY IF EXISTS "profiles: owner update"    ON profiles;
DROP POLICY IF EXISTS "profiles: owner insert"    ON profiles;
DROP POLICY IF EXISTS "profiles: admin read all"  ON profiles;

-- ─── Step 2: Recreate profiles policies using "id" ───────────

CREATE POLICY "profiles: owner read"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles: owner insert"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role IN ('hr_admin', 'super_admin')
    )
  );

-- ─── Step 3: Create missing tables ───────────────────────────

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- If applications table already existed with missing columns, add them:
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_slug        TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS job_id          UUID REFERENCES jobs(id) ON DELETE SET NULL;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS expected_salary TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS availability    TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_note      TEXT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS updated_at      TIMESTAMPTZ;

-- Also patch candidates table in case it existed with missing columns:
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS domicile         TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS education        TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS major            TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS experience_year  TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_company  TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS current_position TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS expected_salary  TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS linkedin_url     TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS portfolio_url    TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS cv_url           TEXT;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS updated_at       TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_application_candidate_job
  ON applications (candidate_id, job_slug)
  WHERE job_slug IS NOT NULL;

CREATE TABLE IF NOT EXISTS application_notes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id  UUID REFERENCES applications(id) ON DELETE CASCADE NOT NULL,
  note            TEXT NOT NULL,
  created_by      UUID REFERENCES auth.users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Step 4: Enable RLS on new tables ────────────────────────

ALTER TABLE candidates        ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs              ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_notes ENABLE ROW LEVEL SECURITY;

-- ─── Step 5: RLS policies for candidates ─────────────────────

DROP POLICY IF EXISTS "candidates: owner all"  ON candidates;
DROP POLICY IF EXISTS "candidates: admin read" ON candidates;

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

-- ─── Step 6: RLS policies for jobs ───────────────────────────

DROP POLICY IF EXISTS "jobs: public read active" ON jobs;
DROP POLICY IF EXISTS "jobs: admin all"          ON jobs;

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

-- ─── Step 7: RLS policies for applications ───────────────────

DROP POLICY IF EXISTS "applications: candidate insert"   ON applications;
DROP POLICY IF EXISTS "applications: candidate read own" ON applications;
DROP POLICY IF EXISTS "applications: admin read all"     ON applications;
DROP POLICY IF EXISTS "applications: admin update"       ON applications;

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

-- ─── Step 8: RLS policies for application_notes ──────────────

DROP POLICY IF EXISTS "notes: admin all"    ON application_notes;
DROP POLICY IF EXISTS "notes: creator read" ON application_notes;

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

-- ─── Done ─────────────────────────────────────────────────────
-- After running this, verify super_admin role:
-- SELECT id, email, role FROM profiles WHERE email = 'freddymazmurhutabarat07@gmail.com';
-- If role is not super_admin, run:
-- UPDATE profiles SET role = 'super_admin' WHERE email = 'freddymazmurhutabarat07@gmail.com';
