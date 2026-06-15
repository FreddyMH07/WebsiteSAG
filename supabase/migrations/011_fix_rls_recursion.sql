-- Migration 011: Fix infinite RLS recursion + consolidate all admin policies
-- ─────────────────────────────────────────────────────────────────────────────
-- Root cause: every policy that checked admin role did:
--   EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN (...))
-- When this subquery is evaluated inside a policy ON the profiles table itself,
-- Postgres/Supabase enters infinite recursion and throws an error.
--
-- Fix: SECURITY DEFINER function is_admin() reads profiles without triggering
-- its own RLS (SECURITY DEFINER bypasses RLS on the function body).
-- All admin policies across every table now call is_admin() instead.
-- ─────────────────────────────────────────────────────────────────────────────
-- Idempotent: uses CREATE OR REPLACE, DROP POLICY IF EXISTS everywhere.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Helper function ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('hr_admin', 'super_admin')
  );
$$;

-- Revoke from public (unauthenticated); grant to authenticated only
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM public;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ── 2. profiles ───────────────────────────────────────────────────────────────
-- The recursive policy: subquery on profiles inside a policy for profiles.
-- Owner policies (auth.uid() = id) are non-recursive and unchanged.

DROP POLICY IF EXISTS "profiles: admin read all" ON profiles;

CREATE POLICY "profiles: admin read all"
  ON profiles FOR SELECT
  USING (public.is_admin());

-- ── 3. candidates ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "candidates: admin read" ON candidates;

CREATE POLICY "candidates: admin read"
  ON candidates FOR SELECT
  USING (public.is_admin());

-- ── 4. applications ───────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "applications: admin read all" ON applications;
DROP POLICY IF EXISTS "applications: admin update"   ON applications;

CREATE POLICY "applications: admin read all"
  ON applications FOR SELECT
  USING (public.is_admin());

CREATE POLICY "applications: admin update"
  ON applications FOR UPDATE
  USING (public.is_admin());

-- ── 5. application_notes ──────────────────────────────────────────────────────

DROP POLICY IF EXISTS "notes: admin all" ON application_notes;

CREATE POLICY "notes: admin all"
  ON application_notes FOR ALL
  USING (public.is_admin());

-- ── 6. jobs ───────────────────────────────────────────────────────────────────
-- "jobs: admin all" from 001/002 coexists with 007 specific policies — both dropped.

DROP POLICY IF EXISTS "jobs: admin all"    ON jobs;
DROP POLICY IF EXISTS "jobs_select_all_hr" ON jobs;
DROP POLICY IF EXISTS "jobs_insert_hr"     ON jobs;
DROP POLICY IF EXISTS "jobs_update_hr"     ON jobs;

CREATE POLICY "jobs_select_all_hr" ON jobs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "jobs_insert_hr" ON jobs
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "jobs_update_hr" ON jobs
  FOR UPDATE
  USING    (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 7. companies ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "companies_insert_hr" ON companies;
DROP POLICY IF EXISTS "companies_update_hr" ON companies;

CREATE POLICY "companies_insert_hr" ON companies
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "companies_update_hr" ON companies
  FOR UPDATE
  USING    (public.is_admin())
  WITH CHECK (public.is_admin());

-- ── 8. email_log ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "email_log_select_hr" ON email_log;
DROP POLICY IF EXISTS "email_log_insert_hr" ON email_log;

CREATE POLICY "email_log_select_hr" ON email_log
  FOR SELECT USING (public.is_admin());

-- INSERT: authenticated HR only; immutable after creation (no UPDATE/DELETE policy)
CREATE POLICY "email_log_insert_hr" ON email_log
  FOR INSERT WITH CHECK (public.is_admin());

-- ── 9. storage: candidate-cv (private bucket) ─────────────────────────────────

DROP POLICY IF EXISTS "cv: admin read all" ON storage.objects;

CREATE POLICY "cv: admin read all" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'candidate-cv'
    AND public.is_admin()
  );

-- ── 10. storage: company-logos (public bucket, HR write) ─────────────────────

DROP POLICY IF EXISTS "company_logos_hr_upload" ON storage.objects;
DROP POLICY IF EXISTS "company_logos_hr_update" ON storage.objects;

CREATE POLICY "company_logos_hr_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos'
    AND public.is_admin()
  );

CREATE POLICY "company_logos_hr_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'company-logos'
    AND public.is_admin()
  );

-- ── Verification queries (run manually after applying) ────────────────────────
-- SELECT proname, prosecdef FROM pg_proc WHERE proname = 'is_admin';
-- -- Expect: prosecdef = true
--
-- SELECT schemaname, tablename, policyname, cmd, qual
-- FROM pg_policies
-- WHERE tablename IN ('profiles','candidates','applications','jobs','companies','email_log')
-- ORDER BY tablename, cmd;
-- -- Confirm no policy still references "FROM profiles" in its qual string.
