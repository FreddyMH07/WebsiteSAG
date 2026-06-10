-- ============================================================
-- SAG Career Portal — Seed: Super Admin + 5 Dummy Candidates
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Schema verified: Juni 2026
-- ============================================================


-- ============================================================
-- BAGIAN 1: SUPER ADMIN — spv.hrd@sahabatagro.co.id
-- Password default: HRD@SAG2026!  (ganti setelah login pertama)
-- ============================================================

DO $$
DECLARE
  v_uid UUID;
BEGIN
  SELECT id INTO v_uid FROM auth.users WHERE email = 'spv.hrd@sahabatagro.co.id';

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();

    INSERT INTO auth.users (
      instance_id, id, aud, role, email,
      encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data,
      is_super_admin, created_at, updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_uid, 'authenticated', 'authenticated',
      'spv.hrd@sahabatagro.co.id',
      crypt('HRD@SAG2026!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"SPV HRD"}',
      false, now(), now()
    );

    INSERT INTO auth.identities (
      provider_id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      'spv.hrd@sahabatagro.co.id', v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', 'spv.hrd@sahabatagro.co.id'),
      'email', now(), now(), now()
    );

    RAISE NOTICE 'Auth user created: spv.hrd@sahabatagro.co.id — UID: %', v_uid;
  ELSE
    RAISE NOTICE 'Auth user sudah ada: spv.hrd@sahabatagro.co.id — UID: %', v_uid;
  END IF;

  -- profiles: id, full_name, email, role, status, created_at, updated_at (NO phone)
  INSERT INTO profiles (id, full_name, email, role, status, created_at, updated_at)
  VALUES (v_uid, 'SPV HRD SAG', 'spv.hrd@sahabatagro.co.id', 'super_admin', 'active', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    role       = 'super_admin',
    status     = 'active',
    updated_at = now();

  RAISE NOTICE 'Profile super_admin OK: spv.hrd@sahabatagro.co.id';
END $$;


-- ============================================================
-- BAGIAN 2: 5 DUMMY JOBS
-- (diperlukan karena applications.job_id NOT NULL)
-- ============================================================

DO $$
DECLARE
  admin_uid UUID;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'freddymazmurhutabarat07@gmail.com';

  INSERT INTO jobs (
    id, slug, title, company, department, location,
    employment_type, level, work_arrangement,
    description, requirements, status, closing_date,
    created_by, created_at, updated_at
  ) VALUES
    (
      'a1b2c3d4-0001-0001-0001-000000000001',
      'agronomy-officer',
      'Agronomy Officer',
      'PT Pematang Agri Lestari', 'Agronomy', 'Mesuji, Lampung',
      'Full-time', 'Staff', 'On-site',
      'Bertanggung jawab atas pemantauan dan perawatan tanaman kelapa sawit di area perkebunan.',
      'S1 Agroteknologi/Pertanian, min. 2 tahun pengalaman di perkebunan kelapa sawit.',
      'published', now() + INTERVAL '30 days',
      admin_uid, now() - INTERVAL '35 days', now()
    ),
    (
      'a1b2c3d4-0002-0002-0002-000000000002',
      'finance-accounting-staff',
      'Finance & Accounting Staff',
      'PT Sahabat Agro Group', 'Finance & Accounting', 'Jakarta Utara',
      'Full-time', 'Staff', 'Hybrid',
      'Mengelola laporan keuangan, rekonsiliasi bank, dan administrasi perpajakan.',
      'S1 Akuntansi, min. 1 tahun pengalaman, familiar dengan SAP atau sistem ERP.',
      'published', now() + INTERVAL '30 days',
      admin_uid, now() - INTERVAL '30 days', now()
    ),
    (
      'a1b2c3d4-0003-0003-0003-000000000003',
      'it-developer',
      'IT Developer',
      'PT Sahabat Agro Group', 'IT', 'Jakarta Utara',
      'Full-time', 'Senior Staff', 'Hybrid',
      'Mengembangkan dan memelihara sistem internal termasuk HRIS, ePlantation, dan middleware.',
      'S1 Teknik Informatika/Ilmu Komputer, min. 3 tahun pengalaman, menguasai React/Node.js atau Python.',
      'published', now() + INTERVAL '45 days',
      admin_uid, now() - INTERVAL '25 days', now()
    ),
    (
      'a1b2c3d4-0004-0004-0004-000000000004',
      'hrd-staff',
      'HRD Staff',
      'PT Sahabat Agro Group', 'HRD', 'Jakarta Utara',
      'Full-time', 'Staff', 'On-site',
      'Mengelola proses rekrutmen, administrasi karyawan, dan program pengembangan SDM.',
      'S1 Manajemen SDM/Psikologi, min. 2 tahun pengalaman di HR, memiliki sertifikasi CHRP diutamakan.',
      'published', now() + INTERVAL '30 days',
      admin_uid, now() - INTERVAL '20 days', now()
    ),
    (
      'a1b2c3d4-0005-0005-0005-000000000005',
      'senior-internal-auditor',
      'Senior Internal Auditor',
      'PT Sahabat Agro Group', 'Internal Audit', 'Jakarta Utara',
      'Full-time', 'Senior Staff', 'Hybrid',
      'Melaksanakan audit internal atas proses bisnis, keuangan, dan kepatuhan di seluruh entitas SAG Group.',
      'S1 Akuntansi, min. 5 tahun pengalaman audit, memiliki sertifikasi CIA/QIA diutamakan.',
      'published', now() + INTERVAL '30 days',
      admin_uid, now() - INTERVAL '15 days', now()
    )
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE '5 dummy jobs berhasil dibuat.';
END $$;


-- ============================================================
-- BAGIAN 3: 5 DUMMY CANDIDATES + APPLICATIONS
-- Password semua: Candidate@2026!
-- ============================================================

DO $$
DECLARE
  uid1 UUID := gen_random_uuid();
  uid2 UUID := gen_random_uuid();
  uid3 UUID := gen_random_uuid();
  uid4 UUID := gen_random_uuid();
  uid5 UUID := gen_random_uuid();

  dummy_pass TEXT := crypt('Candidate@2026!', gen_salt('bf'));

  job_agronomy  UUID := 'a1b2c3d4-0001-0001-0001-000000000001';
  job_finance   UUID := 'a1b2c3d4-0002-0002-0002-000000000002';
  job_it        UUID := 'a1b2c3d4-0003-0003-0003-000000000003';
  job_hrd       UUID := 'a1b2c3d4-0004-0004-0004-000000000004';
  job_audit     UUID := 'a1b2c3d4-0005-0005-0005-000000000005';
BEGIN

  -- ── Auth users ────────────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', uid1, 'authenticated', 'authenticated',
     'ahmad.fauzi@gmail.com',    dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now() - INTERVAL '30 days', now()),
    ('00000000-0000-0000-0000-000000000000', uid2, 'authenticated', 'authenticated',
     'siti.rahmawati@gmail.com', dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now() - INTERVAL '25 days', now()),
    ('00000000-0000-0000-0000-000000000000', uid3, 'authenticated', 'authenticated',
     'budi.firmansyah@gmail.com',dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now() - INTERVAL '20 days', now()),
    ('00000000-0000-0000-0000-000000000000', uid4, 'authenticated', 'authenticated',
     'dewi.anggraini@gmail.com', dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now() - INTERVAL '15 days', now()),
    ('00000000-0000-0000-0000-000000000000', uid5, 'authenticated', 'authenticated',
     'rizky.maulana@gmail.com',  dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now() - INTERVAL '10 days', now())
  ON CONFLICT (email) DO NOTHING;

  -- ── Auth identities ───────────────────────────────────────
  INSERT INTO auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    ('ahmad.fauzi@gmail.com',    uid1, jsonb_build_object('sub', uid1::text, 'email', 'ahmad.fauzi@gmail.com'),    'email', now(), now(), now()),
    ('siti.rahmawati@gmail.com', uid2, jsonb_build_object('sub', uid2::text, 'email', 'siti.rahmawati@gmail.com'), 'email', now(), now(), now()),
    ('budi.firmansyah@gmail.com',uid3, jsonb_build_object('sub', uid3::text, 'email', 'budi.firmansyah@gmail.com'),'email', now(), now(), now()),
    ('dewi.anggraini@gmail.com', uid4, jsonb_build_object('sub', uid4::text, 'email', 'dewi.anggraini@gmail.com'), 'email', now(), now(), now()),
    ('rizky.maulana@gmail.com',  uid5, jsonb_build_object('sub', uid5::text, 'email', 'rizky.maulana@gmail.com'),  'email', now(), now(), now())
  ON CONFLICT DO NOTHING;

  -- ── Profiles (NO phone column) ────────────────────────────
  INSERT INTO profiles (id, full_name, email, role, status, created_at, updated_at)
  VALUES
    (uid1, 'Ahmad Fauzi Hidayat',   'ahmad.fauzi@gmail.com',    'candidate', 'active', now() - INTERVAL '30 days', now()),
    (uid2, 'Siti Rahmawati',        'siti.rahmawati@gmail.com', 'candidate', 'active', now() - INTERVAL '25 days', now()),
    (uid3, 'Budi Firmansyah',       'budi.firmansyah@gmail.com','candidate', 'active', now() - INTERVAL '20 days', now()),
    (uid4, 'Dewi Anggraini',        'dewi.anggraini@gmail.com', 'candidate', 'active', now() - INTERVAL '15 days', now()),
    (uid5, 'Rizky Maulana Saputra', 'rizky.maulana@gmail.com',  'candidate', 'active', now() - INTERVAL '10 days', now())
  ON CONFLICT (id) DO NOTHING;

  -- ── Candidates (experience_years = INTEGER) ───────────────
  INSERT INTO candidates (
    id, user_id, full_name, email, phone, domicile,
    education, major, experience_years, experience_year,
    current_company, current_position, expected_salary,
    linkedin_url, cv_url, created_at, updated_at
  ) VALUES
    (gen_random_uuid(), uid1,
     'Ahmad Fauzi Hidayat', 'ahmad.fauzi@gmail.com', '+62 812-1234-5678',
     'Bandar Lampung', 'S1', 'Agroteknologi', 3, '3 tahun',
     'PT Perkebunan Nusantara VII', 'Staff Agronomi', 'Rp 6.000.000 - Rp 8.000.000',
     'https://linkedin.com/in/ahmad-fauzi-hidayat', NULL,
     now() - INTERVAL '30 days', now()),
    (gen_random_uuid(), uid2,
     'Siti Rahmawati', 'siti.rahmawati@gmail.com', '+62 813-2345-6789',
     'Palembang', 'S1', 'Akuntansi', 2, '2 tahun',
     'KAP Tanubrata & Rekan', 'Junior Auditor', 'Rp 5.500.000 - Rp 7.000.000',
     'https://linkedin.com/in/siti-rahmawati-akuntansi', NULL,
     now() - INTERVAL '25 days', now()),
    (gen_random_uuid(), uid3,
     'Budi Firmansyah', 'budi.firmansyah@gmail.com', '+62 878-3456-7890',
     'Jakarta Selatan', 'S1', 'Teknik Informatika', 5, '5 tahun',
     'PT Telkom Indonesia', 'Senior IT Developer', 'Rp 10.000.000 - Rp 14.000.000',
     'https://linkedin.com/in/budi-firmansyah-dev', NULL,
     now() - INTERVAL '20 days', now()),
    (gen_random_uuid(), uid4,
     'Dewi Anggraini', 'dewi.anggraini@gmail.com', '+62 856-4567-8901',
     'Bogor', 'S1', 'Manajemen Sumber Daya Manusia', 3, '3 tahun',
     'PT Indofood Sukses Makmur', 'HR Generalist', 'Rp 6.500.000 - Rp 8.500.000',
     'https://linkedin.com/in/dewi-anggraini-hr', NULL,
     now() - INTERVAL '15 days', now()),
    (gen_random_uuid(), uid5,
     'Rizky Maulana Saputra', 'rizky.maulana@gmail.com', '+62 821-5678-9012',
     'Bekasi', 'S1', 'Akuntansi', 6, '6 tahun',
     'BDO Indonesia', 'Senior Internal Auditor', 'Rp 12.000.000 - Rp 16.000.000',
     'https://linkedin.com/in/rizky-maulana-audit', NULL,
     now() - INTERVAL '10 days', now())
  ON CONFLICT DO NOTHING;

  -- ── Applications (job_id NOT NULL, pakai UUID dari BAGIAN 2) ─
  INSERT INTO applications (
    id, job_id, candidate_id, job_slug, status,
    expected_salary, availability, cover_note,
    source, created_at, updated_at
  ) VALUES
    (gen_random_uuid(), job_agronomy, uid1, 'agronomy-officer', 'interview',
     'Rp 6.000.000 - Rp 8.000.000', '1 bulan setelah penawaran',
     'Saya memiliki pengalaman 3 tahun di bidang agronomi perkebunan kelapa sawit dan tertarik berkontribusi dalam pengembangan lahan berkelanjutan di SAG.',
     'portal', now() - INTERVAL '28 days', now() - INTERVAL '5 days'),

    (gen_random_uuid(), job_finance, uid2, 'finance-accounting-staff', 'screening',
     'Rp 5.500.000 - Rp 7.000.000', '2 minggu setelah penawaran',
     'Lulus cumlaude Akuntansi UNSRI. Berpengalaman dalam audit laporan keuangan dan rekonsiliasi bank selama 2 tahun di KAP.',
     'portal', now() - INTERVAL '22 days', now() - INTERVAL '10 days'),

    (gen_random_uuid(), job_it, uid3, 'it-developer', 'offering',
     'Rp 10.000.000 - Rp 14.000.000', 'Segera',
     'Berpengalaman 5 tahun dalam pengembangan sistem enterprise termasuk ERP dan middleware. Sangat tertarik dengan proyek ePlantation dan AutoML SAG.',
     'portal', now() - INTERVAL '18 days', now() - INTERVAL '2 days'),

    (gen_random_uuid(), job_hrd, uid4, 'hrd-staff', 'submitted',
     'Rp 6.500.000 - Rp 8.500.000', '1 bulan setelah penawaran',
     'Bersertifikasi CHRP dengan pengalaman mengelola rekrutmen dan pengembangan karyawan di perusahaan FMCG skala nasional.',
     'portal', now() - INTERVAL '13 days', now() - INTERVAL '13 days'),

    (gen_random_uuid(), job_audit, uid5, 'senior-internal-auditor', 'rejected',
     'Rp 12.000.000 - Rp 16.000.000', '1 bulan setelah penawaran',
     'Senior auditor bersertifikasi CIA dengan 6 tahun pengalaman di firma audit Big-4 afiliasi dan pemahaman mendalam standar IIA.',
     'portal', now() - INTERVAL '8 days', now() - INTERVAL '3 days')
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '5 dummy candidates + applications berhasil dibuat.';
END $$;


-- ============================================================
-- VERIFIKASI — jalankan setelah script selesai
-- ============================================================

SELECT u.email, p.full_name, p.role, p.status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email IN (
  'spv.hrd@sahabatagro.co.id',
  'ahmad.fauzi@gmail.com', 'siti.rahmawati@gmail.com',
  'budi.firmansyah@gmail.com', 'dewi.anggraini@gmail.com', 'rizky.maulana@gmail.com'
)
ORDER BY p.role DESC, u.email;

SELECT c.full_name, c.domicile, c.education, c.experience_years,
       j.title AS job_title, a.status AS app_status
FROM candidates c
JOIN applications a ON a.candidate_id = c.user_id
JOIN jobs j ON j.id = a.job_id
ORDER BY a.created_at DESC;
