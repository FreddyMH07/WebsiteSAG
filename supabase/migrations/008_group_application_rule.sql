-- Migration 008: Change application frequency check from per-position to per-group
-- Policy: one candidate may submit ONE application per 12 months across ALL positions/companies.

CREATE OR REPLACE FUNCTION fn_check_application_frequency()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Group-wide block: any application by this candidate in the last 12 months
  IF EXISTS (
    SELECT 1 FROM applications
    WHERE candidate_id = NEW.candidate_id
      AND id           IS DISTINCT FROM NEW.id
      AND created_at   > NOW() - INTERVAL '12 months'
  ) THEN
    RAISE EXCEPTION 'already_applied_this_year'
      USING HINT = 'Anda sudah melamar di grup kami dalam 12 bulan terakhir.';
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger already exists from migration 004; CREATE OR REPLACE FUNCTION is enough.
-- Re-create trigger to be safe (idempotent).
DROP TRIGGER IF EXISTS trg_application_frequency ON applications;
CREATE TRIGGER trg_application_frequency
  BEFORE INSERT ON applications
  FOR EACH ROW EXECUTE FUNCTION fn_check_application_frequency();
