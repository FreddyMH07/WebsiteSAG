-- Migration 013: Idempotent super_admin role assignment
-- ─────────────────────────────────────────────────────────────────────────────
-- DO NOT create auth users or store passwords in migration files.
-- The auth user for spv.hrd@sahabatagro.co.id must be created FIRST via:
--
--   Option A (Supabase Dashboard):
--     Authentication → Users → Add user
--     Email: spv.hrd@sahabatagro.co.id
--     Set a strong password (rotate the one from migration 003 if it was ever used)
--
--   Option B (Supabase CLI):
--     supabase auth admin createuser \
--       --email spv.hrd@sahabatagro.co.id \
--       --password '<strong-password>'
--
-- Then run this migration to grant super_admin role.
-- Safe to re-run: no-op if role is already super_admin.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'spv.hrd@sahabatagro.co.id') THEN
    RAISE WARNING
      'Auth user spv.hrd@sahabatagro.co.id not found. '
      'Create the user via Supabase Dashboard (Authentication → Users → Add user) '
      'and then re-run this migration.';
  ELSE
    INSERT INTO public.profiles (id, full_name, email, role, status, created_at, updated_at)
    SELECT id, 'SPV HRD SAG', email, 'super_admin', 'active', NOW(), NOW()
    FROM auth.users
    WHERE email = 'spv.hrd@sahabatagro.co.id'
    ON CONFLICT (id) DO UPDATE
      SET role       = 'super_admin',
          updated_at = NOW();

    RAISE NOTICE 'super_admin role set for spv.hrd@sahabatagro.co.id';
  END IF;
END $$;

-- Verify:
-- SELECT id, email, full_name, role FROM profiles WHERE email = 'spv.hrd@sahabatagro.co.id';
