-- Migration 010: email_log — lightweight audit trail for HR mailto emails

CREATE TABLE IF NOT EXISTS email_log (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID        REFERENCES applications(id) ON DELETE CASCADE,
  template_id    TEXT        NOT NULL,
  subject        TEXT,
  hr_name        TEXT,
  opened_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  opened_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS email_log_application_id_idx ON email_log (application_id);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "email_log_select_hr" ON email_log;
DROP POLICY IF EXISTS "email_log_insert_hr" ON email_log;

-- HR admin / super_admin can read all email logs
CREATE POLICY "email_log_select_hr" ON email_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('hr_admin', 'super_admin')
    )
  );

-- HR admin / super_admin can insert logs (no update / delete — immutable audit)
CREATE POLICY "email_log_insert_hr" ON email_log
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
        AND role IN ('hr_admin', 'super_admin')
    )
  );
