# Functional Specification Document (FSD)
## SAG Career Portal — career.sahabatagro.co.id
**Versi:** 1.0 | **Dibuat:** Juni 2026 | **Stack:** React 18 + Vite 6 + TypeScript + Supabase + Contentful

---

## 1. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vite SPA)                       │
│  React 18 + TypeScript + Tailwind CSS                        │
│  Hosted: Vercel (career.sahabatagro.co.id)                   │
├──────────────┬──────────────────┬───────────────────────────┤
│   Supabase   │    Contentful    │        Web3Forms           │
│  Auth + DB   │    CMS (Jobs)    │    Contact Form Email      │
│  + Storage   │                  │                            │
└──────────────┴──────────────────┴───────────────────────────┘
```

---

## 2. Tech Stack

| Layer | Teknologi | Versi |
|-------|-----------|-------|
| Framework | React | 18 |
| Build Tool | Vite | 6 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3 |
| Routing | React Router DOM | 6 |
| Forms | React Hook Form + Zod | Latest |
| Auth & DB | Supabase JS | v2 |
| CMS | Contentful SDK | Latest |
| SEO | react-helmet-async | Latest |
| Icons | Lucide React | Latest |
| Fonts | Plus Jakarta Sans (Google Fonts) | - |
| Hosting | Vercel | - |

---

## 3. Struktur Direktori

```
sag-website-vite/
├── public/
│   ├── robots.txt              # SEO: blocks private pages
│   ├── sitemap.xml             # SEO: public pages
│   └── images/                 # Static assets
│       ├── company/            # Company photos (WebP)
│       └── logo/               # SAG logo
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx      # Top navigation + language toggle
│   │   │   ├── Footer.tsx      # Footer with HR contact
│   │   │   ├── SEO.tsx         # Helmet-based SEO component
│   │   │   ├── ProtectedRoute.tsx  # Auth guard wrapper
│   │   │   ├── Spinner.tsx     # Loading indicator
│   │   │   └── StatusBadge.tsx # Application status badge
│   │   ├── hr/
│   │   │   └── HRLayout.tsx    # HR admin sidebar + layout
│   │   └── admin/
│   │       └── AdminLayout.tsx # Super admin layout (legacy)
│   ├── data/
│   │   └── siteContent.ts      # Company data, assets, contact info
│   ├── hooks/
│   │   ├── useAuth.tsx         # AuthProvider + useAuth hook
│   │   ├── useLang.tsx         # Language toggle (ID/EN)
│   │   └── useToast.tsx        # Toast notification
│   ├── lib/
│   │   ├── supabase.ts         # Supabase client init
│   │   └── contentful.ts       # Contentful client init
│   ├── pages/
│   │   ├── Home.tsx            # Landing page
│   │   ├── Jobs.tsx            # Job listings
│   │   ├── JobDetail.tsx       # Single job + apply CTA
│   │   ├── Apply.tsx           # Application form
│   │   ├── ThankYou.tsx        # Post-apply success
│   │   ├── Contact.tsx         # Contact form + info
│   │   ├── NotFound.tsx        # 404
│   │   ├── candidate/
│   │   │   ├── Login.tsx       # Candidate login
│   │   │   ├── Register.tsx    # Candidate register
│   │   │   ├── Dashboard.tsx   # Candidate dashboard
│   │   │   ├── Profile.tsx     # Candidate profile edit
│   │   │   └── Applications.tsx # Candidate applications list
│   │   └── hr/
│   │       ├── Login.tsx       # HR admin login
│   │       ├── Dashboard.tsx   # HR dashboard
│   │       ├── Applications.tsx    # All applications list
│   │       ├── ApplicationDetail.tsx # Single application
│   │       └── Candidates.tsx  # All candidates list
│   ├── types/
│   │   ├── index.ts            # App types (Profile, Candidate, Application, Job)
│   │   └── database.ts         # Supabase database types
│   └── App.tsx                 # Routes + AuthProvider
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # Full schema (reference)
│       └── 002_fix_rls_and_missing_tables.sql  # Patch for existing DB
├── docs/                       # Dokumentasi proyek
│   ├── USER_MANUAL.md
│   ├── FRD.md
│   ├── FSD.md
│   └── AI_CHAT_HISTORY.md
└── index.html                  # Entry point + SEO base tags
```

---

## 4. Database Schema (Supabase / PostgreSQL)

### 4.1 Tabel `profiles`
**Catatan penting:** `id` di tabel ini IS the auth.users UUID (bukan auto-generated UUID terpisah). Ini adalah pola standar Supabase.

```sql
profiles (
  id          UUID PRIMARY KEY → references auth.users(id)
  full_name   TEXT NOT NULL
  email       TEXT NOT NULL
  phone       TEXT
  role        TEXT  -- 'candidate' | 'hr_admin' | 'super_admin'
  status      TEXT  -- 'active' | 'inactive'
  created_at  TIMESTAMPTZ
  updated_at  TIMESTAMPTZ
)
```

**Query pattern (BENAR):** `.eq('id', user.id)` — bukan `user_id`!

### 4.2 Tabel `candidates`
Menyimpan data profil detail kandidat. `user_id` adalah FK ke auth.users.

```sql
candidates (
  id                UUID PRIMARY KEY (auto-generated)
  user_id           UUID → references auth.users(id)  ← ini yang dipakai di query
  full_name         TEXT NOT NULL
  email             TEXT NOT NULL
  phone             TEXT
  domicile          TEXT
  education         TEXT
  major             TEXT
  experience_year   TEXT
  current_company   TEXT
  current_position  TEXT
  expected_salary   TEXT
  linkedin_url      TEXT
  portfolio_url     TEXT
  cv_url            TEXT
  created_at        TIMESTAMPTZ
  updated_at        TIMESTAMPTZ
)
```

**Query pattern:** `.eq('user_id', user.id)` ← pakai `user_id`, bukan `id`

### 4.3 Tabel `applications`

```sql
applications (
  id              UUID PRIMARY KEY (auto-generated)
  candidate_id    UUID → references candidates(user_id)  ← = auth.users UUID
  job_id          UUID → references jobs(id) (nullable)
  job_slug        TEXT
  job_title       TEXT NOT NULL
  status          TEXT  -- 'submitted'|'screening'|'interview'|'offering'|'accepted'|'rejected'
  expected_salary TEXT
  availability    TEXT
  cover_note      TEXT
  applied_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
)
```

**UNIQUE INDEX:** `(candidate_id, job_slug)` — mencegah double apply.

### 4.4 Tabel `application_notes`

```sql
application_notes (
  id              UUID PRIMARY KEY
  application_id  UUID → references applications(id)
  note            TEXT NOT NULL
  created_by      UUID → references auth.users(id)
  created_at      TIMESTAMPTZ
)
```

### 4.5 Tabel `jobs` (opsional — fallback dari Contentful)

```sql
jobs (
  id              UUID PRIMARY KEY
  title           TEXT NOT NULL
  slug            TEXT UNIQUE NOT NULL
  department      TEXT
  location        TEXT
  employment_type TEXT
  description     TEXT
  requirements    TEXT
  status          TEXT  -- 'active'|'inactive'|'closed'
  deadline        DATE
  created_at      TIMESTAMPTZ
  updated_at      TIMESTAMPTZ
)
```

---

## 5. RLS (Row Level Security) Policies

### profiles
| Policy | Command | Condition |
|--------|---------|-----------|
| owner read | SELECT | `auth.uid() = id` |
| owner update | UPDATE | `auth.uid() = id` |
| owner insert | INSERT | `auth.uid() = id` |

**PENTING — Jangan tambahkan policy admin recursive pada profiles!**
Policy yang query `profiles` dari dalam `profiles` akan menyebabkan:
`ERROR: 42P17: infinite recursion detected in policy for relation "profiles"`

Policy admin read-all di `profiles` **tidak diperlukan** untuk operasi HR. HR hanya perlu baca profil sendiri (owner read sudah cukup).

### candidates
| Policy | Command | Condition |
|--------|---------|-----------|
| owner all | ALL | `auth.uid() = user_id` |
| admin read | SELECT | `EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('hr_admin','super_admin'))` |

### applications
| Policy | Command | Condition |
|--------|---------|-----------|
| candidate insert | INSERT | `auth.uid() = candidate_id` |
| candidate read own | SELECT | `auth.uid() = candidate_id` |
| admin read all | SELECT | admin EXISTS check |
| admin update | UPDATE | admin EXISTS check |

### application_notes
| Policy | Command | Condition |
|--------|---------|-----------|
| admin all | ALL | admin EXISTS check |
| creator read | SELECT | `auth.uid() = created_by` |

### Storage (candidate-cv bucket)
| Policy | Operation | Condition |
|--------|-----------|-----------|
| candidate upload | INSERT | `foldername[1] = auth.uid()::text` |
| candidate read own | SELECT | `foldername[1] = auth.uid()::text` |
| admin read all | SELECT | admin EXISTS check |

---

## 6. Authentication Flow

### 6.1 Kandidat Login
```
User input email+password
  → supabase.auth.signInWithPassword()
  → Success: session stored in localStorage
  → AuthProvider.onAuthStateChange fires
  → loadProfile(uid) queries profiles WHERE id = uid
  → ProtectedRoute checks profile.role === 'candidate'
  → Navigate to /candidate/dashboard
```

### 6.2 HR Admin Login
```
User input email+password
  → supabase.auth.signInWithPassword()
  → Success: authData.user.id returned
  → Query profiles WHERE id = authData.user.id
  → Check role IN ('hr_admin', 'super_admin')
  → Fail: signOut() + show "Akses ditolak"
  → Pass: navigate('/hr/dashboard')
  → ProtectedRoute (requiredRole='admin') double-checks via useAuth().profile
```

### 6.3 Logout
```
signOut() → Supabase clears session → AuthProvider sets profile=null
  → ProtectedRoute redirects to login
```

---

## 7. Content Architecture (Contentful)

**Space ID:** `g3carpnxcxjx`
**Environment:** `master`

**Content Type: `jobVacancy`**
| Field | Type | Keterangan |
|-------|------|------------|
| title | Short text | Judul posisi |
| slug | Short text | URL-friendly identifier |
| department | Short text | Departemen |
| employmentType | Short text | Full-time/Part-time/Contract |
| location | Short text | Lokasi penempatan |
| descriptionEnglish | Long text | Deskripsi dalam Bahasa Inggris |
| descriptionIndonesian | Long text | Deskripsi dalam Bahasa Indonesia |
| requirements | Long text | Persyaratan |
| isOpen | Boolean | Status lowongan aktif |
| closingDate | Date | Batas waktu lamaran |
| displayOrder | Integer | Urutan tampilan |

---

## 8. SEO Implementation

### Komponen SEO (`src/components/common/SEO.tsx`)
Menggunakan `react-helmet-async` untuk inject ke `<head>`:
- `<title>`
- `<meta name="description">`
- `<meta name="robots">` (noindex untuk halaman privat)
- `<link rel="canonical">`
- Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`)
- Twitter Card tags
- JSON-LD structured data (via `<script type="application/ld+json">`)

### JSON-LD Schemas
| Halaman | Schema |
|---------|--------|
| Homepage | `WebSite` + `Organization` |
| `/jobs/:slug` | `JobPosting` |

### Static SEO Files
| File | Isi |
|------|-----|
| `public/robots.txt` | Allow / Disallow private paths |
| `public/sitemap.xml` | 6 public URLs |

---

## 9. Environment Variables

File `.env` (jangan di-commit ke Git):

```env
# Contentful CMS
CONTENTFUL_SPACE_ID=g3carpnxcxjx
CONTENTFUL_ACCESS_TOKEN=[token]
CONTENTFUL_ENVIRONMENT=master

# Supabase
PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
PUBLIC_SUPABASE_ANON_KEY=[anon-key]

# Web3Forms
PUBLIC_WEB3FORMS_KEY_CAREER=[key]

# App
PUBLIC_APP_URL=https://career.sahabatagro.co.id
```

**Prefix Vite:** `envPrefix: ['VITE_', 'PUBLIC_', 'CONTENTFUL_']` di `vite.config.ts`

**LARANGAN KERAS:** `SUPABASE_SERVICE_ROLE_KEY` tidak boleh ada di frontend. Hanya boleh di server-side.

---

## 10. Routing Map

| Path | Component | Auth Required | Role |
|------|-----------|---------------|------|
| `/` | Home | - | - |
| `/jobs` | Jobs | - | - |
| `/jobs/:slug` | JobDetail | - | - |
| `/apply/:slug` | Apply | ✅ | candidate |
| `/apply/thank-you` | ThankYou | ✅ | candidate |
| `/contact` | Contact | - | - |
| `/candidate/login` | CandidateLogin | - | - |
| `/candidate/register` | CandidateRegister | - | - |
| `/candidate/dashboard` | CandidateDashboard | ✅ | candidate |
| `/candidate/profile` | CandidateProfile | ✅ | candidate |
| `/candidate/applications` | CandidateApplications | ✅ | candidate |
| `/hr/login` | HRLogin | - | - |
| `/hr/dashboard` | HRDashboard | ✅ | hr_admin/super_admin |
| `/hr/applications` | HRApplications | ✅ | hr_admin/super_admin |
| `/hr/applications/:id` | HRApplicationDetail | ✅ | hr_admin/super_admin |
| `/hr/candidates` | HRCandidates | ✅ | hr_admin/super_admin |

---

## 11. Komponen Kunci

### `AuthProvider` + `useAuth`
- Menyimpan state: `session`, `user`, `profile`, `loading`
- Expose: `isAdmin`, `isSuperAdmin`, `signOut()`, `refreshProfile()`
- `loadProfile(uid)` → query `profiles WHERE id = uid`

### `ProtectedRoute`
Props: `requiredRole: 'candidate' | 'admin'`, `redirectTo: string`
- Jika `loading`: tampilkan spinner
- Jika `!profile`: redirect ke login
- Jika role tidak cocok: redirect ke login

### `SEO`
Props: `title?`, `description?`, `canonical?`, `ogImage?`, `noIndex?`, `jsonLd?`

### `useLang`
Returns: `{ lang: 'id' | 'en', setLang, t(id: string, en: string) }`
Persisted to `localStorage`.

---

## 12. Known Issues & Catatan Penting

| Issue | Status | Solusi |
|-------|--------|--------|
| `profiles` table: id = auth UUID (bukan user_id) | ✅ Fixed | Semua query profiles pakai `.eq('id', ...)` |
| RLS infinite recursion pada profiles | ✅ Fixed | Hapus semua SELECT policy admin di profiles |
| `candidates` table: pakai `user_id` (bukan id) | ✅ OK | Query candidates tetap `.eq('user_id', ...)` |
| Dev server port conflict | ⚠️ | Default 5173, fallback ke 5174/5175 |
| Logo PNG background putih | ✅ Fixed | Pakai white badge container, tanpa brightness-0 filter |
| GBP image inappropriate ("ILEGAL") | ✅ Fixed | Diganti ke company-profile-gbp-new-2-image1.webp |
