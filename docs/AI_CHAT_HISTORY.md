# AI Chat History — SAG Career Portal
**Project:** sag-website-vite (career.sahabatagro.co.id)
**AI:** Claude Sonnet 4.6 (claude-sonnet-4-6)
**Developer:** Freddy Mazmurhutabarat (freddymazmurhutabarat07@gmail.com)
**Periode:** Juni 2026

---

## Ringkasan Semua Sesi

### Sesi 1–3 (Awal Proyek)
**Fokus:** Setup proyek, migrasi dari Firebase ke Supabase

**Yang dikerjakan:**
- Inisialisasi project `sag-website-vite` dengan Vite 6 + React 18 + TypeScript
- Setup Tailwind CSS dengan custom colors (sag-forest, sag-green, sag-gold, dll)
- Konfigurasi Supabase client (`src/lib/supabase.ts`)
- Konfigurasi Contentful client (`src/lib/contentful.ts`)
- Desain database schema awal (`supabase/migrations/001_initial_schema.sql`)
- Setup routing lengkap di `App.tsx`
- Rebuild `Navbar.tsx` dengan language toggle (ID/EN)
- Rebuild `Footer.tsx` dengan HR contact
- Setup `AuthProvider` + `useAuth` hook
- Setup `ProtectedRoute` component

---

### Sesi 4 (Konten & UI)
**Fokus:** Home page, halaman lowongan, halaman detail job

**Yang dikerjakan:**
- `src/data/siteContent.ts` — company data, assets mapping, contact info
- `Home.tsx` — landing page dengan hero section, stats, about, benefits, job preview, anti-fraud
- `Jobs.tsx` — listing dari Contentful, filter, search
- `JobDetail.tsx` — detail lowongan dari Contentful + JSON-LD JobPosting schema
- `Apply.tsx` — form lamaran + upload CV ke Supabase Storage
- `ThankYou.tsx` — halaman sukses apply
- `Contact.tsx` — form kontak via Web3Forms

---

### Sesi 5 (Candidate Portal)
**Fokus:** Halaman-halaman untuk kandidat

**Yang dikerjakan:**
- `candidate/Login.tsx` — desain login kandidat, bilingual
- `candidate/Register.tsx` — form registrasi + insert ke profiles & candidates
- `candidate/Dashboard.tsx` — dashboard dengan stats dan daftar lamaran
- `candidate/Profile.tsx` — edit profil + upload CV
- `candidate/Applications.tsx` — daftar lamaran kandidat
- `HRLayout.tsx` — sidebar layout untuk HR admin
- `hr/Login.tsx` — login HR dengan validasi role
- `hr/Dashboard.tsx` — dashboard HR
- `hr/Applications.tsx` — daftar lamaran (HR view)
- `hr/ApplicationDetail.tsx` — detail + ubah status + catatan
- `hr/Candidates.tsx` — daftar kandidat

---

### Sesi 6 (Bug Fixes & Polish)
**Fokus:** Fix visual bugs, SEO, kontak HR

**Masalah yang dilaporkan:**
1. Logo putih/blank di dark background (kotak putih)
2. Hero/login background foto terlalu busy, headline tidak terbaca
3. Overview page terlalu panjang
4. Tidak ada kontak HR email

**Solusi yang diterapkan:**

**Bug 1 — Logo white box:**
- Root cause: `brightness-0 invert` pada PNG berbackground putih = solid white square
- Fix: ganti dengan white badge container `<div class="bg-white rounded-xl p-1.5">` di semua 6 lokasi:
  - `Home.tsx` hero
  - `candidate/Login.tsx`
  - `candidate/Register.tsx`
  - `hr/Login.tsx`
  - `HRLayout.tsx`
  - `AdminLayout.tsx`
  - `Footer.tsx`

**Bug 2 — Background foto terlalu ramai:**
- Fix: gunakan single image dengan `blur-sm scale-105` + solid overlay `bg-sag-forest/85`
- Diterapkan di: `Home.tsx` hero, `candidate/Register.tsx`

**Bug 3 — Overview terlalu panjang:**
- Hapus section: Business Units, Vision & Mission, Core Values dari Home
- Pertahankan: Hero → Stats → About → Life at SAG → Benefits → Jobs Preview → Anti-fraud

**Bug 4 — Kontak HR:**
- Tambah `emailHr: 'hr@sahabatagro.co.id'` ke `siteContent.ts`
- Update `Footer.tsx` dan `Contact.tsx`

**GBP Image Inappropriate:**
- Foto lama menampilkan spanduk "PT GBP MENERIMA BUAH ILEGAL"
- Fix: ganti `sagAssets.gbp` ke `company-profile-gbp-new-2-image1.webp`

---

### Sesi 7 (SEO Implementation)
**Fokus:** SEO lengkap untuk career.sahabatagro.co.id

**Yang dikerjakan:**
- Install `react-helmet-async`
- Buat `src/components/common/SEO.tsx` dengan props: title, description, canonical, ogImage, noIndex, jsonLd
- Update `App.tsx` dengan `<HelmetProvider>`
- Update `index.html` dengan base SEO tags + Google Fonts
- Buat `public/robots.txt` — block private pages
- Buat `public/sitemap.xml` — 6 public URLs
- Tambah SEO ke: Home, Jobs, JobDetail, Contact
- Tambah noindex ke semua halaman privat: candidate dashboard/profile/applications, HR dashboard/applications/candidates
- JSON-LD WebSite + Organization di Home
- JSON-LD JobPosting di JobDetail
- Tambah language toggle (ID/EN) ke candidate Login dan Register

---

### Sesi 8 (Critical Bug Fix — HR Login)
**Fokus:** Fix HR admin tidak bisa login

**Masalah dilaporkan:** User `freddymazmurhutabarat07@gmail.com` dengan role `super_admin` dapat "Akses ditolak" saat login HR.

**Investigasi:**

**Temuan 1 — Kolom `user_id` tidak ada di `profiles`:**
```
SQL Error: column "user_id" of relation "profiles" does not exist
```
Tabel `profiles` di database aktual menggunakan `id` = auth UUID (standard Supabase pattern).
Migration file yang dibuat salah mendesain `id` sebagai auto-generated UUID + `user_id` sebagai FK.

**Files yang difix:**
```typescript
// useAuth.tsx:37
// BEFORE: .eq('user_id', uid)
// AFTER:  .eq('id', uid)

// hr/Login.tsx:32
// BEFORE: .eq('user_id', authData.user.id)
// AFTER:  .eq('id', authData.user.id)

// candidate/Register.tsx:46
// BEFORE: profiles.insert({ user_id: authData.user.id, ... })
// AFTER:  profiles.insert({ id: authData.user.id, ... })

// candidate/Profile.tsx:103
// BEFORE: profiles.update().eq('user_id', user.id)
// AFTER:  profiles.update().eq('id', user.id)
```

**Note:** `candidates` table TETAP pakai `user_id` (bukan `id`) karena candidates punya auto-gen PK `id` terpisah.

**Temuan 2 — RLS Policy infinite recursion:**
```
code: '42P17': infinite recursion detected in policy for relation "profiles"
```
Policy "profiles: admin read all" melakukan query ke `profiles` dari dalam policy `profiles` → infinite loop.

**SQL Fix (run di Supabase SQL Editor):**
```sql
DROP POLICY IF EXISTS "profiles: admin read all"            ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"        ON profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;
```

**Temuan 3 — Tabel lain dan RLS policies belum ada/benar:**
Dibuat `supabase/migrations/002_fix_rls_and_missing_tables.sql` yang:
- Drop + recreate profiles policies (non-recursive)
- Create tables: candidates, jobs, applications, application_notes
- Add columns if missing (ALTER TABLE ADD COLUMN IF NOT EXISTS)
- Create RLS policies untuk semua tabel
- All admin policies reference `profiles p WHERE p.id = auth.uid()` (bukan p.user_id)

**Temuan 4 — Types tidak sinkron:**
- Hapus `user_id` dari `Profile` interface di `src/types/index.ts`
- Hapus `user_id` dari `ProfileRow` di `src/types/database.ts`

---

## Ringkasan File yang Dibuat/Diubah

### File Baru
| File | Deskripsi |
|------|-----------|
| `src/components/common/SEO.tsx` | SEO meta tags + JSON-LD |
| `src/data/siteContent.ts` | Company data, assets, contacts |
| `public/robots.txt` | SEO robots config |
| `public/sitemap.xml` | SEO sitemap |
| `supabase/migrations/001_initial_schema.sql` | DB schema (reference) |
| `supabase/migrations/002_fix_rls_and_missing_tables.sql` | DB patch |
| `docs/USER_MANUAL.md` | User manual |
| `docs/FRD.md` | Functional requirements |
| `docs/FSD.md` | Functional spec |
| `docs/AI_CHAT_HISTORY.md` | This file |

### File yang Dimodifikasi
| File | Perubahan Kunci |
|------|-----------------|
| `src/App.tsx` | Tambah HelmetProvider, routing HR/candidate |
| `src/hooks/useAuth.tsx` | Fix: `user_id` → `id` di query profiles |
| `src/types/index.ts` | Hapus `user_id` dari Profile interface |
| `src/types/database.ts` | Hapus `user_id` dari ProfileRow |
| `src/pages/Home.tsx` | Rewrite: hero, overview singkat, SEO |
| `src/pages/candidate/Login.tsx` | Redesign: bilingual, stats grid, blur bg |
| `src/pages/candidate/Register.tsx` | Redesign: blur bg, white logo badge |
| `src/pages/candidate/Profile.tsx` | Fix: profiles.update().eq('id', ...) |
| `src/pages/candidate/Register.tsx` | Fix: profiles.insert({ id: ... }) |
| `src/pages/hr/Login.tsx` | Fix: profiles.eq('id', ...) + debug logs |
| `src/components/common/Footer.tsx` | White logo badge, HR email |
| `src/components/common/Navbar.tsx` | Language toggle ID/EN |
| `src/components/hr/HRLayout.tsx` | White logo badge fix |
| `src/components/admin/AdminLayout.tsx` | White logo badge fix |
| `src/pages/Contact.tsx` | Add HR email, SEO |
| `src/pages/Jobs.tsx` | Add SEO |
| `src/pages/JobDetail.tsx` | Add SEO + JSON-LD JobPosting |
| `index.html` | Base SEO, Google Fonts, OG tags |
| `vite.config.ts` | envPrefix PUBLIC_/CONTENTFUL_ |

---

## Supabase Project Info

| Item | Value |
|------|-------|
| Project Name | sag-career-portal |
| Project URL | https://qziolrpcgmbhedtetnzl.supabase.co |
| Account | sahabatagro.it@gmail.com |
| Super Admin Auth User | freddymazmurhutabarat07@gmail.com |
| Super Admin UUID | 002e8841-4302-47f7-a2f8-268da3330859 |

---

## Perintah Penting

```bash
# Dev
cd sag-website-vite
npm run dev          # localhost:5173

# Build
npm run build        # output ke dist/

# Type check
npx tsc --noEmit

# Deploy (via Vercel CLI atau GitHub push)
vercel --prod
```

---

## SQL Commands Penting (Supabase)

```sql
-- Cek semua policies pada sebuah tabel
SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles';

-- Verifikasi UUID match antara auth dan profiles
SELECT au.id auth_uuid, p.id profile_uuid, p.role, (au.id = p.id) match
FROM auth.users au
LEFT JOIN profiles p ON p.email = au.email
WHERE au.email = 'user@email.com';

-- Set super admin
UPDATE profiles SET role = 'super_admin' WHERE email = 'user@email.com';

-- Drop recursive policies (RUN JIKA ADA infinite recursion error)
DROP POLICY IF EXISTS "profiles: admin read all"            ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles"        ON profiles;
DROP POLICY IF EXISTS "Super admin can manage all profiles" ON profiles;
```

---

## Aturan Keamanan (Tidak Boleh Dilanggar)

1. `SUPABASE_SERVICE_ROLE_KEY` **JANGAN PERNAH** diekspos ke frontend
2. RLS harus aktif di semua tabel user data
3. CV bucket harus **private** (bukan public)
4. HR hanya bisa akses dashboard jika `role = hr_admin` atau `super_admin`
5. Kandidat hanya bisa akses data dirinya sendiri
6. Policy admin di `profiles` **TIDAK BOLEH** recursive (akan menyebabkan error 42P17)
