-- ============================================================
-- DEV / STAGING SEED — 5 Dummy Jobs + 5 Dummy Candidates
-- ============================================================
-- ⚠  DO NOT RUN IN PRODUCTION.
-- This seed creates test auth users with known passwords.
-- It is intended for local development and staging environments only.
--
-- PREREQUISITES:
--   Run migrations 001–012 before this seed.
--   Migration 012 must have run to ensure closing_date column exists.
--
-- DUMMY PASSWORDS (change after staging use):
--   Candidates: Candidate@2026!
-- ============================================================

-- ── PART 1: 5 Dummy Jobs ─────────────────────────────────────────────────────

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'spv.hrd@sahabatagro.co.id';

  INSERT INTO jobs (
    id, slug, title, department, location,
    employment_type, level, work_arrangement,
    description, requirements, status, closing_date,
    created_by, created_at, updated_at
  ) VALUES
    (
      'a1b2c3d4-0001-0001-0001-000000000001',
      'agronomy-officer',
      'Agronomy Officer',
      'Agronomy', 'Mesuji, Lampung',
      'Full-time', 'Staff', 'On-site',
      'Bertanggung jawab atas pemantauan dan perawatan tanaman kelapa sawit di area perkebunan.',
      'S1 Agroteknologi/Pertanian, min. 2 tahun pengalaman di perkebunan kelapa sawit.',
      'published', NOW() + INTERVAL '30 days',
      admin_uid, NOW() - INTERVAL '35 days', NOW()
    ),
    (
      'a1b2c3d4-0002-0002-0002-000000000002',
      'finance-accounting-staff',
      'Finance & Accounting Staff',
      'Finance & Accounting', 'Jakarta Utara',
      'Full-time', 'Staff', 'Hybrid',
      'Mengelola laporan keuangan, rekonsiliasi bank, dan administrasi perpajakan.',
      'S1 Akuntansi, min. 1 tahun pengalaman, familiar dengan SAP atau sistem ERP.',
      'published', NOW() + INTERVAL '30 days',
      admin_uid, NOW() - INTERVAL '30 days', NOW()
    ),
    (
      'a1b2c3d4-0003-0003-0003-000000000003',
      'it-developer',
      'IT Developer',
      'IT', 'Jakarta Utara',
      'Full-time', 'Senior Staff', 'Hybrid',
      'Mengembangkan dan memelihara sistem internal termasuk HRIS, ePlantation, dan middleware.',
      'S1 Teknik Informatika/Ilmu Komputer, min. 3 tahun pengalaman, menguasai React/Node.js atau Python.',
      'published', NOW() + INTERVAL '45 days',
      admin_uid, NOW() - INTERVAL '25 days', NOW()
    ),
    (
      'a1b2c3d4-0004-0004-0004-000000000004',
      'hrd-staff',
      'HRD Staff',
      'HRD', 'Jakarta Utara',
      'Full-time', 'Staff', 'On-site',
      'Mengelola proses rekrutmen, administrasi karyawan, dan program pengembangan SDM.',
      'S1 Manajemen SDM/Psikologi, min. 2 tahun pengalaman di HR, memiliki sertifikasi CHRP diutamakan.',
      'published', NOW() + INTERVAL '30 days',
      admin_uid, NOW() - INTERVAL '20 days', NOW()
    ),
    (
      'a1b2c3d4-0005-0005-0005-000000000005',
      'senior-internal-auditor',
      'Senior Internal Auditor',
      'Internal Audit', 'Jakarta Utara',
      'Full-time', 'Senior Staff', 'Hybrid',
      'Melaksanakan audit internal atas proses bisnis, keuangan, dan kepatuhan di seluruh entitas SAG Group.',
      'S1 Akuntansi, min. 5 tahun pengalaman audit, memiliki sertifikasi CIA/QIA diutamakan.',
      'published', NOW() + INTERVAL '30 days',
      admin_uid, NOW() - INTERVAL '15 days', NOW()
    )
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE '5 dummy jobs seeded.';
END $$;


-- ── PART 2: 5 Dummy Candidates + Applications ────────────────────────────────

DO $$
DECLARE
  uid1 UUID; uid2 UUID; uid3 UUID; uid4 UUID; uid5 UUID;
  cid1 UUID; cid2 UUID; cid3 UUID; cid4 UUID; cid5 UUID;
  dummy_pass TEXT := crypt('Candidate@2026!', gen_salt('bf'));
  job_agronomy UUID; job_finance UUID; job_it UUID; job_hrd UUID; job_audit UUID;
BEGIN

  SELECT id INTO job_agronomy FROM jobs WHERE slug = 'agronomy-officer'         LIMIT 1;
  SELECT id INTO job_finance  FROM jobs WHERE slug = 'finance-accounting-staff'  LIMIT 1;
  SELECT id INTO job_it       FROM jobs WHERE slug = 'it-developer'              LIMIT 1;
  SELECT id INTO job_hrd      FROM jobs WHERE slug = 'hrd-staff'                 LIMIT 1;
  SELECT id INTO job_audit    FROM jobs WHERE slug = 'senior-internal-auditor'   LIMIT 1;

  IF job_agronomy IS NULL OR job_finance IS NULL OR job_it IS NULL
     OR job_hrd IS NULL OR job_audit IS NULL THEN
    RAISE EXCEPTION 'One or more dummy jobs missing. Run PART 1 first.';
  END IF;

  -- Auth users
  SELECT id INTO uid1 FROM auth.users WHERE email = 'ahmad.fauzi@gmail.com';
  IF uid1 IS NULL THEN
    uid1 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', uid1, 'authenticated', 'authenticated',
      'ahmad.fauzi@gmail.com', dummy_pass, NOW(),
      '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '30 days', NOW());
    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES ('ahmad.fauzi@gmail.com', uid1,
      jsonb_build_object('sub', uid1::text, 'email', 'ahmad.fauzi@gmail.com'),
      'email', NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO uid2 FROM auth.users WHERE email = 'siti.rahmawati@gmail.com';
  IF uid2 IS NULL THEN
    uid2 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', uid2, 'authenticated', 'authenticated',
      'siti.rahmawati@gmail.com', dummy_pass, NOW(),
      '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '25 days', NOW());
    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES ('siti.rahmawati@gmail.com', uid2,
      jsonb_build_object('sub', uid2::text, 'email', 'siti.rahmawati@gmail.com'),
      'email', NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO uid3 FROM auth.users WHERE email = 'budi.firmansyah@gmail.com';
  IF uid3 IS NULL THEN
    uid3 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', uid3, 'authenticated', 'authenticated',
      'budi.firmansyah@gmail.com', dummy_pass, NOW(),
      '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '20 days', NOW());
    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES ('budi.firmansyah@gmail.com', uid3,
      jsonb_build_object('sub', uid3::text, 'email', 'budi.firmansyah@gmail.com'),
      'email', NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO uid4 FROM auth.users WHERE email = 'dewi.anggraini@gmail.com';
  IF uid4 IS NULL THEN
    uid4 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', uid4, 'authenticated', 'authenticated',
      'dewi.anggraini@gmail.com', dummy_pass, NOW(),
      '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '15 days', NOW());
    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES ('dewi.anggraini@gmail.com', uid4,
      jsonb_build_object('sub', uid4::text, 'email', 'dewi.anggraini@gmail.com'),
      'email', NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
  END IF;

  SELECT id INTO uid5 FROM auth.users WHERE email = 'rizky.maulana@gmail.com';
  IF uid5 IS NULL THEN
    uid5 := gen_random_uuid();
    INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at)
    VALUES ('00000000-0000-0000-0000-000000000000', uid5, 'authenticated', 'authenticated',
      'rizky.maulana@gmail.com', dummy_pass, NOW(),
      '{"provider":"email","providers":["email"]}', '{}', false, NOW() - INTERVAL '10 days', NOW());
    INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
    VALUES ('rizky.maulana@gmail.com', uid5,
      jsonb_build_object('sub', uid5::text, 'email', 'rizky.maulana@gmail.com'),
      'email', NOW(), NOW(), NOW()) ON CONFLICT DO NOTHING;
  END IF;

  -- Profiles
  INSERT INTO profiles (id, full_name, email, role, status, created_at, updated_at) VALUES
    (uid1, 'Ahmad Fauzi Hidayat',   'ahmad.fauzi@gmail.com',    'candidate', 'active', NOW() - INTERVAL '30 days', NOW()),
    (uid2, 'Siti Rahmawati',        'siti.rahmawati@gmail.com', 'candidate', 'active', NOW() - INTERVAL '25 days', NOW()),
    (uid3, 'Budi Firmansyah',       'budi.firmansyah@gmail.com','candidate', 'active', NOW() - INTERVAL '20 days', NOW()),
    (uid4, 'Dewi Anggraini',        'dewi.anggraini@gmail.com', 'candidate', 'active', NOW() - INTERVAL '15 days', NOW()),
    (uid5, 'Rizky Maulana Saputra', 'rizky.maulana@gmail.com',  'candidate', 'active', NOW() - INTERVAL '10 days', NOW())
  ON CONFLICT (id) DO NOTHING;

  -- Candidates
  SELECT id INTO cid1 FROM candidates WHERE user_id = uid1;
  IF cid1 IS NULL THEN
    cid1 := gen_random_uuid();
    INSERT INTO candidates (id, user_id, full_name, email, phone, domicile, education, major,
      experience_year, current_company, current_position, expected_salary, linkedin_url, cv_url, created_at, updated_at)
    VALUES (cid1, uid1, 'Ahmad Fauzi Hidayat', 'ahmad.fauzi@gmail.com', '+62 812-1234-5678',
      'Bandar Lampung', 'S1', 'Agroteknologi', '3 tahun', 'PT Perkebunan Nusantara VII',
      'Staff Agronomi', 'Rp 6.000.000 - Rp 8.000.000',
      'https://linkedin.com/in/ahmad-fauzi-hidayat', NULL,
      NOW() - INTERVAL '30 days', NOW());
  END IF;

  SELECT id INTO cid2 FROM candidates WHERE user_id = uid2;
  IF cid2 IS NULL THEN
    cid2 := gen_random_uuid();
    INSERT INTO candidates (id, user_id, full_name, email, phone, domicile, education, major,
      experience_year, current_company, current_position, expected_salary, linkedin_url, cv_url, created_at, updated_at)
    VALUES (cid2, uid2, 'Siti Rahmawati', 'siti.rahmawati@gmail.com', '+62 813-2345-6789',
      'Palembang', 'S1', 'Akuntansi', '2 tahun', 'KAP Tanubrata & Rekan',
      'Junior Auditor', 'Rp 5.500.000 - Rp 7.000.000',
      'https://linkedin.com/in/siti-rahmawati-akuntansi', NULL,
      NOW() - INTERVAL '25 days', NOW());
  END IF;

  SELECT id INTO cid3 FROM candidates WHERE user_id = uid3;
  IF cid3 IS NULL THEN
    cid3 := gen_random_uuid();
    INSERT INTO candidates (id, user_id, full_name, email, phone, domicile, education, major,
      experience_year, current_company, current_position, expected_salary, linkedin_url, cv_url, created_at, updated_at)
    VALUES (cid3, uid3, 'Budi Firmansyah', 'budi.firmansyah@gmail.com', '+62 878-3456-7890',
      'Jakarta Selatan', 'S1', 'Teknik Informatika', '5 tahun', 'PT Telkom Indonesia',
      'Senior IT Developer', 'Rp 10.000.000 - Rp 14.000.000',
      'https://linkedin.com/in/budi-firmansyah-dev', NULL,
      NOW() - INTERVAL '20 days', NOW());
  END IF;

  SELECT id INTO cid4 FROM candidates WHERE user_id = uid4;
  IF cid4 IS NULL THEN
    cid4 := gen_random_uuid();
    INSERT INTO candidates (id, user_id, full_name, email, phone, domicile, education, major,
      experience_year, current_company, current_position, expected_salary, linkedin_url, cv_url, created_at, updated_at)
    VALUES (cid4, uid4, 'Dewi Anggraini', 'dewi.anggraini@gmail.com', '+62 856-4567-8901',
      'Bogor', 'S1', 'Manajemen Sumber Daya Manusia', '3 tahun', 'PT Indofood Sukses Makmur',
      'HR Generalist', 'Rp 6.500.000 - Rp 8.500.000',
      'https://linkedin.com/in/dewi-anggraini-hr', NULL,
      NOW() - INTERVAL '15 days', NOW());
  END IF;

  SELECT id INTO cid5 FROM candidates WHERE user_id = uid5;
  IF cid5 IS NULL THEN
    cid5 := gen_random_uuid();
    INSERT INTO candidates (id, user_id, full_name, email, phone, domicile, education, major,
      experience_year, current_company, current_position, expected_salary, linkedin_url, cv_url, created_at, updated_at)
    VALUES (cid5, uid5, 'Rizky Maulana Saputra', 'rizky.maulana@gmail.com', '+62 821-5678-9012',
      'Bekasi', 'S1', 'Akuntansi', '6 tahun', 'BDO Indonesia',
      'Senior Internal Auditor', 'Rp 12.000.000 - Rp 16.000.000',
      'https://linkedin.com/in/rizky-maulana-audit', NULL,
      NOW() - INTERVAL '10 days', NOW());
  END IF;

  -- Applications
  INSERT INTO applications (id, job_id, candidate_id, job_slug, status, expected_salary,
    availability, cover_note, created_at, updated_at)
  SELECT gen_random_uuid(), job_agronomy, cid1, 'agronomy-officer', 'Interview HR',
    'Rp 6.000.000 - Rp 8.000.000', '1 bulan setelah penawaran',
    'Saya memiliki pengalaman 3 tahun di bidang agronomi perkebunan kelapa sawit.',
    NOW() - INTERVAL '28 days', NOW() - INTERVAL '5 days'
  WHERE NOT EXISTS (SELECT 1 FROM applications WHERE candidate_id = cid1 AND job_id = job_agronomy);

  INSERT INTO applications (id, job_id, candidate_id, job_slug, status, expected_salary,
    availability, cover_note, created_at, updated_at)
  SELECT gen_random_uuid(), job_finance, cid2, 'finance-accounting-staff', 'Screening HR',
    'Rp 5.500.000 - Rp 7.000.000', '2 minggu setelah penawaran',
    'Lulus cumlaude Akuntansi UNSRI. Berpengalaman audit laporan keuangan selama 2 tahun di KAP.',
    NOW() - INTERVAL '22 days', NOW() - INTERVAL '10 days'
  WHERE NOT EXISTS (SELECT 1 FROM applications WHERE candidate_id = cid2 AND job_id = job_finance);

  INSERT INTO applications (id, job_id, candidate_id, job_slug, status, expected_salary,
    availability, cover_note, created_at, updated_at)
  SELECT gen_random_uuid(), job_it, cid3, 'it-developer', 'Offering',
    'Rp 10.000.000 - Rp 14.000.000', 'Segera',
    'Berpengalaman 5 tahun pengembangan sistem enterprise termasuk ERP dan middleware.',
    NOW() - INTERVAL '18 days', NOW() - INTERVAL '2 days'
  WHERE NOT EXISTS (SELECT 1 FROM applications WHERE candidate_id = cid3 AND job_id = job_it);

  INSERT INTO applications (id, job_id, candidate_id, job_slug, status, expected_salary,
    availability, cover_note, created_at, updated_at)
  SELECT gen_random_uuid(), job_hrd, cid4, 'hrd-staff', 'Applied',
    'Rp 6.500.000 - Rp 8.500.000', '1 bulan setelah penawaran',
    'Bersertifikasi CHRP dengan pengalaman rekrutmen dan pengembangan karyawan.',
    NOW() - INTERVAL '13 days', NOW() - INTERVAL '13 days'
  WHERE NOT EXISTS (SELECT 1 FROM applications WHERE candidate_id = cid4 AND job_id = job_hrd);

  INSERT INTO applications (id, job_id, candidate_id, job_slug, status, expected_salary,
    availability, cover_note, created_at, updated_at)
  SELECT gen_random_uuid(), job_audit, cid5, 'senior-internal-auditor', 'Rejected',
    'Rp 12.000.000 - Rp 16.000.000', '1 bulan setelah penawaran',
    'Senior auditor bersertifikasi CIA dengan 6 tahun pengalaman di firma audit.',
    NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days'
  WHERE NOT EXISTS (SELECT 1 FROM applications WHERE candidate_id = cid5 AND job_id = job_audit);

  RAISE NOTICE 'Dev seed complete. Candidates: %, %, %, %, %', uid1, uid2, uid3, uid4, uid5;
END $$;
