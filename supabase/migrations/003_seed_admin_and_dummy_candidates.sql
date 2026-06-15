-- ============================================================
-- Migration 003: Super Admin Profile Setup
-- ============================================================
-- SECURITY NOTICE: This file previously contained hardcoded passwords
-- for auth.users inserts. Those blocks have been removed.
-- The password committed in earlier git history (HRD@SAG2026!) MUST be
-- rotated immediately if it was used in any real environment.
--
-- PREREQUISITE: Create the auth user via Supabase Dashboard FIRST:
--   Authentication → Users → Add user
--   Email: spv.hrd@sahabatagro.co.id
--   Set a strong password — never commit it to the repository.
--
-- Then run this migration (or migration 013) to assign the super_admin role.
--
-- DEV DUMMY DATA (5 candidates + dummy jobs):
--   See supabase/seeds/dev_candidates.sql — DEV/STAGING ONLY.
--   Never run seed files in production.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'spv.hrd@sahabatagro.co.id') THEN
    RAISE WARNING
      'Auth user spv.hrd@sahabatagro.co.id not found. '
      'Create via Supabase Dashboard → Authentication → Users → Add user, '
      'then re-run this migration.';
  ELSE
    INSERT INTO public.profiles (id, full_name, email, role, status, created_at, updated_at)
    SELECT id, 'SPV HRD SAG', email, 'super_admin', 'active', NOW(), NOW()
    FROM auth.users
    WHERE email = 'spv.hrd@sahabatagro.co.id'
    ON CONFLICT (id) DO UPDATE
      SET role       = 'super_admin',
          status     = 'active',
          updated_at = NOW();

    RAISE NOTICE 'super_admin profile ready: spv.hrd@sahabatagro.co.id';
  END IF;
END $$;
