-- ============================================================
-- MIGRATION 006: Backfill applications.job_id + restore FK
-- ============================================================

-- STEP 1: Preview — lamaran yang job_slug-nya TIDAK cocok dengan job mana pun
-- (Jalankan SELECT ini dulu jika ingin tahu; aman, tidak mengubah data)
-- SELECT a.id, a.job_slug, a.job_title, a.status
-- FROM applications a
-- LEFT JOIN jobs j ON j.slug = a.job_slug
-- WHERE j.id IS NULL;

-- STEP 2: Backfill job_id dari job_slug
-- Hanya update baris yang job_id-nya NULL atau bukan UUID valid
UPDATE applications a
SET    job_id     = j.id,
       updated_at = NOW()
FROM   jobs j
WHERE  a.job_slug = j.slug
  AND  (a.job_id IS NULL
        OR a.job_id::text NOT SIMILAR TO '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');

-- STEP 3: Laporan — lamaran yang masih tidak bisa di-resolve (job_slug tidak dikenal)
-- Ini hanya SELECT, tidak mengubah data; biarkan job_id = NULL
-- SELECT id, job_slug, job_title, status, created_at
-- FROM applications
-- WHERE job_id IS NULL;

-- STEP 4: Pastikan kolom job_id bertipe UUID (sudah seharusnya dari schema awal)
-- ALTER TABLE applications ALTER COLUMN job_id TYPE UUID USING job_id::uuid;

-- STEP 5: Pasang FK constraint (SET NULL agar lamaran tidak ikut terhapus jika job dihapus)
-- Hapus constraint lama jika ada
ALTER TABLE applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;

ALTER TABLE applications
  ADD CONSTRAINT applications_job_id_fkey
  FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE SET NULL;

-- STEP 6: Verifikasi hasil
SELECT
  a.job_slug,
  a.job_title,
  j.title  AS jobs_title,
  a.job_id IS NOT NULL AS has_job_id
FROM applications a
LEFT JOIN jobs j ON j.id = a.job_id
ORDER BY a.created_at;
