-- Migration 009: companies table, logo support, jobs.company_id FK

-- ── 1. Table ──────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT UNIQUE NOT NULL,
  short_name  TEXT,
  logo_url    TEXT,
  address     TEXT,
  is_holding  BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── 2. RLS ────────────────────────────────────────────────────────────────────
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "companies_select_public" ON companies;
DROP POLICY IF EXISTS "companies_insert_hr"     ON companies;
DROP POLICY IF EXISTS "companies_update_hr"     ON companies;

CREATE POLICY "companies_select_public" ON companies
  FOR SELECT USING (true);

CREATE POLICY "companies_insert_hr" ON companies
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin'))
  );

CREATE POLICY "companies_update_hr" ON companies
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin')))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin')));

-- ── 3. Seed ───────────────────────────────────────────────────────────────────
INSERT INTO companies (name, short_name, logo_url, is_holding) VALUES
  ('PT Sahabat Agro Group',         'SAG',  '/assets/sag/brand/logo-ptsag.png', true),
  ('PT Pematang Agri Lestari',      'PAL',  NULL, false),
  ('PT Lambang Sawit Perkasa',      'LSP',  NULL, false),
  ('PT Hasil Sawit Bina Sejahtera', 'HSBS', '/assets/sag/units/hsbs.webp',      false),
  ('PT Garuda Bumi Perkasa',        'GBP',  NULL, false)
ON CONFLICT (name) DO NOTHING;

-- ── 4. Add company_id FK to jobs ──────────────────────────────────────────────
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id);

-- ── 5. Backfill: match by name, unmatched → holding ──────────────────────────
UPDATE jobs j
SET    company_id = c.id
FROM   companies c
WHERE  j.company = c.name
  AND  j.company_id IS NULL;

UPDATE jobs
SET    company_id = (SELECT id FROM companies WHERE is_holding = true LIMIT 1)
WHERE  company_id IS NULL;

-- ── 6. Drop old text column ───────────────────────────────────────────────────
ALTER TABLE jobs DROP COLUMN IF EXISTS company;

-- ── 7. Storage bucket for company logos ──────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "company_logos_public_read" ON storage.objects;
DROP POLICY IF EXISTS "company_logos_hr_upload"   ON storage.objects;
DROP POLICY IF EXISTS "company_logos_hr_update"   ON storage.objects;

CREATE POLICY "company_logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'company-logos');

CREATE POLICY "company_logos_hr_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'company-logos' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin'))
  );

CREATE POLICY "company_logos_hr_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'company-logos' AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('hr_admin', 'super_admin'))
  );
