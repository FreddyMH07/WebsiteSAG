-- ============================================================
-- MIGRATION 004: SAG Employment Application Form
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Drop old unique constraint (blocked all re-applications)
DROP INDEX IF EXISTS uniq_application_candidate_job;

-- 2. candidate_profiles table (1:1 with candidates)
CREATE TABLE IF NOT EXISTS candidate_profiles (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  candidate_id     UUID NOT NULL UNIQUE REFERENCES candidates(id) ON DELETE CASCADE,

  -- Section 1: Position
  applied_position TEXT,

  -- Section 2: Personal Data
  birth_place      TEXT,
  birth_date       DATE,
  blood_type       TEXT,
  gender           TEXT,
  religion         TEXT,
  marital_status   TEXT,
  nik              TEXT,
  address_current  TEXT,
  address_ktp      TEXT,

  -- Sections 3-9: Dynamic JSONB arrays
  family_members     JSONB NOT NULL DEFAULT '[]'::jsonb,
  formal_education   JSONB NOT NULL DEFAULT '[]'::jsonb,
  informal_education JSONB NOT NULL DEFAULT '[]'::jsonb,
  languages          JSONB NOT NULL DEFAULT '[]'::jsonb,
  organizations      JSONB NOT NULL DEFAULT '[]'::jsonb,
  work_experiences   JSONB NOT NULL DEFAULT '[]'::jsonb,
  references_data    JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Section 10: Emergency contact + 16 questions (JSONB object)
  other_info         JSONB NOT NULL DEFAULT '{}'::jsonb,

  -- Section 11: Declaration
  consent_data_truth BOOLEAN NOT NULL DEFAULT FALSE,
  consent_pdp        BOOLEAN NOT NULL DEFAULT FALSE,
  declared_at        TIMESTAMPTZ,
  declared_name      TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "candidate_profiles: owner all"  ON candidate_profiles;
DROP POLICY IF EXISTS "candidate_profiles: admin read" ON candidate_profiles;

-- Candidate can manage their own profile
CREATE POLICY "candidate_profiles: owner all"
  ON candidate_profiles FOR ALL
  USING (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()))
  WITH CHECK (candidate_id IN (SELECT id FROM candidates WHERE user_id = auth.uid()));

-- HR can read all profiles
CREATE POLICY "candidate_profiles: admin read"
  ON candidate_profiles FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = auth.uid() AND p.role IN ('hr_admin', 'super_admin')
  ));

-- 3. Trigger: max 1 application per position per 12 months
CREATE OR REPLACE FUNCTION fn_check_application_frequency()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.job_slug IS NOT NULL AND EXISTS (
    SELECT 1 FROM applications
    WHERE candidate_id = NEW.candidate_id
      AND job_slug     = NEW.job_slug
      AND id           IS DISTINCT FROM NEW.id
      AND created_at   > NOW() - INTERVAL '12 months'
  ) THEN
    RAISE EXCEPTION 'already_applied_this_year'
      USING HINT = 'Anda sudah melamar posisi ini dalam 12 bulan terakhir.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_application_frequency ON applications;
CREATE TRIGGER trg_application_frequency
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION fn_check_application_frequency();

-- 4. Trigger: require complete profile before applying
CREATE OR REPLACE FUNCTION fn_require_complete_profile()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_prof candidate_profiles%ROWTYPE;
BEGIN
  SELECT * INTO v_prof FROM candidate_profiles WHERE candidate_id = NEW.candidate_id;
  IF NOT FOUND
    OR v_prof.applied_position IS NULL OR v_prof.birth_place IS NULL
    OR v_prof.birth_date IS NULL OR v_prof.gender IS NULL
    OR v_prof.marital_status IS NULL OR v_prof.nik IS NULL
    OR v_prof.address_current IS NULL OR v_prof.address_ktp IS NULL
    OR NOT COALESCE(v_prof.consent_data_truth, FALSE)
    OR NOT COALESCE(v_prof.consent_pdp, FALSE)
    OR v_prof.declared_at IS NULL
  THEN
    RAISE EXCEPTION 'profile_incomplete'
      USING HINT = 'Lengkapi profil Anda sebelum melamar.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_require_complete_profile ON applications;
CREATE TRIGGER trg_require_complete_profile
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION fn_require_complete_profile();
