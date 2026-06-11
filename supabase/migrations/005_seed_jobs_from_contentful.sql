-- ============================================================
-- MIGRATION 005: Insert missing jobs from Contentful
-- Status constraint: 'draft' | 'published' | 'closed'
-- Only inserts jobs whose slug does not yet exist (DO NOTHING).
-- Does NOT touch existing jobs — HR data takes precedence.
-- ============================================================

INSERT INTO jobs (title, slug, company, department, location, employment_type, description, requirements, status)
VALUES (
  'Finance & Accounting',
  'finance-accounting',
  'PT Sahabat Agro Group',
  'Finance',
  'Jakarta, Indonesia',
  'Full-time',
  'Mengelola catatan keuangan, menyiapkan laporan, dan memastikan akuntansi yang akurat di seluruh anak perusahaan perkebunan kami.',
  'S1 Accounting or Finance
Min. 2 years experience
Proficient in SAP/MYOB
Strong analytical skills',
  'published'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, slug, company, department, location, employment_type, description, requirements, status)
VALUES (
  'Internal Audit',
  'internal-audit',
  'PT Sahabat Agro Group',
  'Audit',
  'Jakarta / Field (Lampung & Belitung)',
  'Full-time',
  'Melakukan audit internal atas operasi perkebunan, transaksi keuangan, dan proses kepatuhan di seluruh anak perusahaan.',
  'S1 Accounting/Management
Min. 2 years audit experience
CIA certification a plus
Willing to travel',
  'published'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, slug, company, department, location, employment_type, description, requirements, status)
VALUES (
  'Human Resources Development',
  'human-resources-development',
  'PT Sahabat Agro Group',
  'HR',
  'Jakarta, Indonesia',
  'Full-time',
  'Mengelola fungsi HR termasuk rekrutmen, pengembangan karyawan, manajemen kinerja, dan budaya organisasi.',
  'S1 Psychology/HR Management
Min. 2 years HR experience
Strong interpersonal skills
Knowledge of labor law',
  'published'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO jobs (title, slug, company, department, location, employment_type, description, requirements, status)
VALUES (
  'Corporate Planning',
  'corporate-planning',
  'PT Sahabat Agro Group',
  'Strategy',
  'Jakarta, Indonesia',
  'Full-time',
  'Mendukung perencanaan strategis, analisis bisnis, dan inisiatif pengembangan korporat di seluruh Sahabat Agro Group.',
  'S1 Business/Management/Economics
Strong analytical & presentation skills
Experience in consulting or strategic roles preferred',
  'published'
) ON CONFLICT (slug) DO NOTHING;

-- it-developer already exists → DO NOTHING will skip it automatically.

-- End of migration 005
