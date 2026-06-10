-- ============================================================
-- SAG Career Portal — Seed: Super Admin + 5 Dummy Candidates
-- Jalankan di: Supabase Dashboard → SQL Editor
-- Tanggal: Juni 2026
-- ============================================================

-- ============================================================
-- BAGIAN 1: SUPER ADMIN — spv.hrd@sahabatagro.co.id
-- Password default: HRD@SAG2026!  (ganti setelah login pertama)
-- ============================================================

DO $$
DECLARE
  v_uid UUID;
BEGIN
  -- Cek apakah sudah ada
  SELECT id INTO v_uid FROM auth.users WHERE email = 'spv.hrd@sahabatagro.co.id';

  IF v_uid IS NULL THEN
    v_uid := gen_random_uuid();

    -- Buat auth user
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

    -- Buat identity record (dibutuhkan untuk login)
    INSERT INTO auth.identities (
      id, user_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      v_uid::text, v_uid,
      jsonb_build_object('sub', v_uid::text, 'email', 'spv.hrd@sahabatagro.co.id'),
      'email', now(), now(), now()
    );

    RAISE NOTICE 'Auth user created untuk spv.hrd: %', v_uid;
  ELSE
    RAISE NOTICE 'Auth user sudah ada untuk spv.hrd: %', v_uid;
  END IF;

  -- Upsert profile sebagai super_admin
  INSERT INTO profiles (id, full_name, email, phone, role, status, created_at, updated_at)
  VALUES (
    v_uid, 'SPV HRD SAG', 'spv.hrd@sahabatagro.co.id',
    '+62 21 2188 2445', 'super_admin', 'active', now(), now()
  )
  ON CONFLICT (id) DO UPDATE SET
    role       = 'super_admin',
    status     = 'active',
    updated_at = now();

  RAISE NOTICE 'Profile super_admin OK: spv.hrd@sahabatagro.co.id';
END $$;


-- ============================================================
-- BAGIAN 2: 5 DUMMY CANDIDATES
-- Password semua: Candidate@2026!
-- ============================================================

DO $$
DECLARE
  -- UUID untuk setiap kandidat
  uid1 UUID := gen_random_uuid();
  uid2 UUID := gen_random_uuid();
  uid3 UUID := gen_random_uuid();
  uid4 UUID := gen_random_uuid();
  uid5 UUID := gen_random_uuid();

  dummy_pass TEXT := crypt('Candidate@2026!', gen_salt('bf'));
BEGIN

  -- ── Buat 5 auth users ──────────────────────────────────────
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at
  ) VALUES
    ('00000000-0000-0000-0000-000000000000', uid1, 'authenticated', 'authenticated',
     'ahmad.fauzi@gmail.com',   dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
    ('00000000-0000-0000-0000-000000000000', uid2, 'authenticated', 'authenticated',
     'siti.rahmawati@gmail.com', dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
    ('00000000-0000-0000-0000-000000000000', uid3, 'authenticated', 'authenticated',
     'budi.firmansyah@gmail.com',dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
    ('00000000-0000-0000-0000-000000000000', uid4, 'authenticated', 'authenticated',
     'dewi.anggraini@gmail.com', dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now()),
    ('00000000-0000-0000-0000-000000000000', uid5, 'authenticated', 'authenticated',
     'rizky.maulana@gmail.com',  dummy_pass, now(),
     '{"provider":"email","providers":["email"]}', '{}', false, now(), now())
  ON CONFLICT (email) DO NOTHING;

  -- ── Buat identity records ──────────────────────────────────
  INSERT INTO auth.identities (id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES
    (uid1::text, uid1, jsonb_build_object('sub', uid1::text, 'email', 'ahmad.fauzi@gmail.com'),    'email', now(), now(), now()),
    (uid2::text, uid2, jsonb_build_object('sub', uid2::text, 'email', 'siti.rahmawati@gmail.com'), 'email', now(), now(), now()),
    (uid3::text, uid3, jsonb_build_object('sub', uid3::text, 'email', 'budi.firmansyah@gmail.com'),'email', now(), now(), now()),
    (uid4::text, uid4, jsonb_build_object('sub', uid4::text, 'email', 'dewi.anggraini@gmail.com'), 'email', now(), now(), now()),
    (uid5::text, uid5, jsonb_build_object('sub', uid5::text, 'email', 'rizky.maulana@gmail.com'),  'email', now(), now(), now())
  ON CONFLICT DO NOTHING;

  -- ── Buat profiles ──────────────────────────────────────────
  INSERT INTO profiles (id, full_name, email, phone, role, status, created_at, updated_at)
  VALUES
    (uid1, 'Ahmad Fauzi Hidayat',  'ahmad.fauzi@gmail.com',    '+62 812-1234-5678', 'candidate', 'active', now() - INTERVAL '30 days', now()),
    (uid2, 'Siti Rahmawati',       'siti.rahmawati@gmail.com', '+62 813-2345-6789', 'candidate', 'active', now() - INTERVAL '25 days', now()),
    (uid3, 'Budi Firmansyah',      'budi.firmansyah@gmail.com','+62 878-3456-7890', 'candidate', 'active', now() - INTERVAL '20 days', now()),
    (uid4, 'Dewi Anggraini',       'dewi.anggraini@gmail.com', '+62 856-4567-8901', 'candidate', 'active', now() - INTERVAL '15 days', now()),
    (uid5, 'Rizky Maulana Saputra','rizky.maulana@gmail.com',  '+62 821-5678-9012', 'candidate', 'active', now() - INTERVAL '10 days', now())
  ON CONFLICT (id) DO NOTHING;

  -- ── Buat candidates (profil detail) ───────────────────────
  INSERT INTO candidates (
    id, user_id, full_name, email, phone, domicile,
    education, major, experience_year,
    current_company, current_position,
    expected_salary, linkedin_url, cv_url,
    created_at, updated_at
  ) VALUES
    (
      gen_random_uuid(), uid1,
      'Ahmad Fauzi Hidayat', 'ahmad.fauzi@gmail.com', '+62 812-1234-5678',
      'Bandar Lampung', 'S1', 'Agroteknologi', '3 tahun',
      'PT Perkebunan Nusantara VII', 'Staff Agronomi',
      'Rp 6.000.000 - Rp 8.000.000',
      'https://linkedin.com/in/ahmad-fauzi-hidayat',
      NULL,
      now() - INTERVAL '30 days', now()
    ),
    (
      gen_random_uuid(), uid2,
      'Siti Rahmawati', 'siti.rahmawati@gmail.com', '+62 813-2345-6789',
      'Palembang', 'S1', 'Akuntansi', '2 tahun',
      'KAP Tanubrata & Rekan', 'Junior Auditor',
      'Rp 5.500.000 - Rp 7.000.000',
      'https://linkedin.com/in/siti-rahmawati-akuntansi',
      NULL,
      now() - INTERVAL '25 days', now()
    ),
    (
      gen_random_uuid(), uid3,
      'Budi Firmansyah', 'budi.firmansyah@gmail.com', '+62 878-3456-7890',
      'Jakarta Selatan', 'S1', 'Teknik Informatika', '5 tahun',
      'PT Telkom Indonesia', 'Senior IT Developer',
      'Rp 10.000.000 - Rp 14.000.000',
      'https://linkedin.com/in/budi-firmansyah-dev',
      NULL,
      now() - INTERVAL '20 days', now()
    ),
    (
      gen_random_uuid(), uid4,
      'Dewi Anggraini', 'dewi.anggraini@gmail.com', '+62 856-4567-8901',
      'Bogor', 'S1', 'Manajemen Sumber Daya Manusia', '3 tahun',
      'PT Indofood Sukses Makmur', 'HR Generalist',
      'Rp 6.500.000 - Rp 8.500.000',
      'https://linkedin.com/in/dewi-anggraini-hr',
      NULL,
      now() - INTERVAL '15 days', now()
    ),
    (
      gen_random_uuid(), uid5,
      'Rizky Maulana Saputra', 'rizky.maulana@gmail.com', '+62 821-5678-9012',
      'Bekasi', 'S1', 'Akuntansi', '6 tahun',
      'BDO Indonesia', 'Senior Internal Auditor',
      'Rp 12.000.000 - Rp 16.000.000',
      'https://linkedin.com/in/rizky-maulana-audit',
      NULL,
      now() - INTERVAL '10 days', now()
    )
  ON CONFLICT DO NOTHING;

  -- ── Buat applications ──────────────────────────────────────
  -- Status bervariasi: submitted, screening, interview, offering, rejected
  INSERT INTO applications (
    id, candidate_id, job_slug, job_title,
    status, expected_salary, availability, cover_note,
    applied_at, updated_at
  ) VALUES
    (
      gen_random_uuid(), uid1,
      'agronomy-officer', 'Agronomy Officer',
      'interview',
      'Rp 6.000.000 - Rp 8.000.000',
      '1 bulan setelah penawaran',
      'Saya memiliki pengalaman 3 tahun di bidang agronomi perkebunan kelapa sawit. Saya tertarik bergabung dengan SAG untuk berkontribusi dalam pengembangan lahan yang berkelanjutan.',
      now() - INTERVAL '28 days', now() - INTERVAL '5 days'
    ),
    (
      gen_random_uuid(), uid2,
      'finance-staff', 'Finance & Accounting Staff',
      'screening',
      'Rp 5.500.000 - Rp 7.000.000',
      '2 minggu setelah penawaran',
      'Lulus dengan predikat cumlaude dari Jurusan Akuntansi UNSRI. Berpengalaman dalam audit laporan keuangan dan rekonsiliasi bank selama 2 tahun.',
      now() - INTERVAL '22 days', now() - INTERVAL '10 days'
    ),
    (
      gen_random_uuid(), uid3,
      'it-developer', 'IT Developer',
      'offering',
      'Rp 10.000.000 - Rp 14.000.000',
      'Segera',
      'Berpengalaman 5 tahun dalam pengembangan sistem enterprise, termasuk ERP dan middleware. Tertarik dengan proyek ePlantation dan AutoML yang dikerjakan SAG.',
      now() - INTERVAL '18 days', now() - INTERVAL '2 days'
    ),
    (
      gen_random_uuid(), uid4,
      'hrd-staff', 'HRD Staff',
      'submitted',
      'Rp 6.500.000 - Rp 8.500.000',
      '1 bulan setelah penawaran',
      'Memiliki sertifikasi CHRP dan pengalaman mengelola rekrutmen serta pengembangan karyawan di perusahaan FMCG skala nasional.',
      now() - INTERVAL '13 days', now() - INTERVAL '13 days'
    ),
    (
      gen_random_uuid(), uid5,
      'internal-auditor', 'Senior Internal Auditor',
      'rejected',
      'Rp 12.000.000 - Rp 16.000.000',
      '1 bulan setelah penawaran',
      'Senior auditor dengan 6 tahun pengalaman di firma audit Big-4 afiliasi. Memiliki sertifikasi CIA dan pemahaman mendalam tentang standar IIA.',
      now() - INTERVAL '8 days', now() - INTERVAL '3 days'
    )
  ON CONFLICT DO NOTHING;

  RAISE NOTICE '5 dummy candidates + applications berhasil dibuat.';
END $$;


-- ============================================================
-- VERIFIKASI
-- Jalankan query ini untuk memastikan semua data berhasil masuk
-- ============================================================

SELECT
  u.email,
  p.full_name,
  p.role,
  p.status
FROM auth.users u
JOIN profiles p ON p.id = u.id
WHERE u.email IN (
  'spv.hrd@sahabatagro.co.id',
  'ahmad.fauzi@gmail.com',
  'siti.rahmawati@gmail.com',
  'budi.firmansyah@gmail.com',
  'dewi.anggraini@gmail.com',
  'rizky.maulana@gmail.com'
)
ORDER BY p.role DESC, u.email;


SELECT
  c.full_name,
  c.domicile,
  c.education,
  c.major,
  c.experience_year,
  a.job_title,
  a.status AS application_status
FROM candidates c
JOIN applications a ON a.candidate_id = c.user_id
ORDER BY a.applied_at DESC;
