-- Migration 012: Fix jobs.status constraint + kill leaky SELECT policy
-- ─────────────────────────────────────────────────────────────────────────────
-- Problems fixed:
-- 1. jobs.status CHECK used ('active','inactive','closed') but frontend/seeds
--    use ('draft','published','closed'). Seed inserts would violate the old check.
-- 2. "jobs: public read active" (from 001/002) — USING (status='active' OR auth.uid() IS NOT NULL)
--    — any logged-in user (including candidates) could read draft/closed jobs.
--    This policy was never dropped when 007 added jobs_select_published.
-- 3. applications.status CHECK used ('submitted','screening',...) but frontend
--    and types.ts use ('Applied','Screening HR','Psikotes',...).
-- 4. Column drift: closing_date/level/work_arrangement/benefits/created_by were
--    added manually to the live DB but never in a migration.
--    applications.created_at (used by frontend) was missing — only applied_at existed.
-- ─────────────────────────────────────────────────────────────────────────────
-- Idempotent: all ALTER TABLE use IF NOT EXISTS / IF EXISTS. Safe to re-run.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Migrate stale jobs.status values before changing constraint ────────────
-- Only affects rows that still have old values (no-op if already patched)
UPDATE jobs SET status = 'published' WHERE status = 'active';
UPDATE jobs SET status = 'draft'     WHERE status = 'inactive';

-- ── 2. Replace jobs.status constraint ────────────────────────────────────────
ALTER TABLE jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE jobs ADD  CONSTRAINT jobs_status_check
  CHECK (status IN ('draft', 'published', 'closed'));

-- ── 3. Drop the leaky "any logged-in user reads all jobs" policy ──────────────
-- This coexisted silently with jobs_select_published (007), allowing candidates
-- to query draft and closed postings.
DROP POLICY IF EXISTS "jobs: public read active" ON jobs;

-- After this migration the only two SELECT policies on jobs are:
--   jobs_select_published  (USING status = 'published')  — from 007, unchanged
--   jobs_select_all_hr     (USING is_admin())             — updated in 011

-- ── 4. Add columns that exist in live DB but not in migrations ────────────────

-- jobs
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS closing_date     DATE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS level            TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS work_arrangement TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS benefits         TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS created_by       UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Ensure company_id FK exists (added in 009, but guard for partial migrations)
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- ── 5. Drop old jobs columns (already handled in 009 for company, but be safe) ─
ALTER TABLE jobs DROP COLUMN IF EXISTS deadline;
ALTER TABLE jobs DROP COLUMN IF EXISTS company;

-- ── 6. Fix applications.status constraint ────────────────────────────────────
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_status_check;
ALTER TABLE applications ADD  CONSTRAINT applications_status_check
  CHECK (status IN (
    'Applied', 'Screening HR', 'Psikotes',
    'Interview HR', 'Interview User', 'Offering',
    'Accepted', 'Rejected', 'Talent Pool'
  ));

-- ── 7. Add applications.created_at (frontend types expect this; 001 only had applied_at) ──
ALTER TABLE applications ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── Manual test checklist ─────────────────────────────────────────────────────
-- a) Anon (not logged in):
--      SELECT * FROM jobs; → only published rows, zero draft/closed
-- b) Candidate (role=candidate, logged in):
--      SELECT * FROM jobs; → same: only published rows
-- c) HR admin (role=hr_admin):
--      SELECT * FROM jobs; → all rows (draft + published + closed)
-- d) INSERT INTO jobs (slug='test', title='T', status='active') → should fail CHECK
-- e) INSERT INTO jobs (slug='test', title='T', status='draft') as candidate → fail RLS
