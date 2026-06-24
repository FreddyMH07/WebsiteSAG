-- ─────────────────────────────────────────────────────────────────────────────
-- 014: Super Admin — User Management Policies
--   • is_super_admin() SECURITY DEFINER helper (mirrors is_admin(); avoids RLS
--     recursion when used in UPDATE policies on the profiles table itself)
--   • Policy: super_admin can UPDATE any profile row (role / status)
--     The existing "profiles: admin read all" (from 011) already covers SELECT.
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Helper: resolves current user's super_admin status without triggering RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id   = auth.uid()
      AND role = 'super_admin'
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM public;
GRANT  EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;

-- 2. Super admin may UPDATE any profile (to set role / status)
--    "profiles: owner update" (from 011) still lets each user edit their own row.
--    This policy adds the ability to edit OTHER users' rows.
DROP POLICY IF EXISTS "profiles: super_admin update any" ON profiles;
CREATE POLICY "profiles: super_admin update any"
  ON profiles FOR UPDATE
  USING  (public.is_super_admin())
  WITH CHECK (public.is_super_admin());
