-- Migration 007: RLS policies for HR job management
-- Allows hr_admin and super_admin to INSERT and UPDATE jobs
-- Public (anon/authenticated) can only SELECT published jobs

-- Ensure RLS is enabled
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "jobs_select_published" ON jobs;
DROP POLICY IF EXISTS "jobs_select_all_hr"    ON jobs;
DROP POLICY IF EXISTS "jobs_insert_hr"        ON jobs;
DROP POLICY IF EXISTS "jobs_update_hr"        ON jobs;

-- 1. Public: can read published jobs only
CREATE POLICY "jobs_select_published" ON jobs
  FOR SELECT
  USING (status = 'published');

-- 2. HR admin / super admin: can read ALL jobs (any status)
CREATE POLICY "jobs_select_all_hr" ON jobs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hr_admin', 'super_admin')
    )
  );

-- 3. HR admin / super admin: can insert new jobs
CREATE POLICY "jobs_insert_hr" ON jobs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hr_admin', 'super_admin')
    )
  );

-- 4. HR admin / super admin: can update existing jobs
CREATE POLICY "jobs_update_hr" ON jobs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hr_admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role IN ('hr_admin', 'super_admin')
    )
  );
