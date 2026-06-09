# SAG Website – React + Vite + Supabase

Website resmi **PT Sahabat Agro Group** dengan company profile, career portal, HR dashboard, dan integrasi Supabase, Contentful, dan Web3Forms.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 6 + TypeScript |
| Styling | Tailwind CSS 3 |
| Routing | React Router v6 |
| Database & Auth | Supabase (PostgreSQL + Auth + Storage) |
| CMS | Contentful |
| Email Notification | Web3Forms |
| Hosting | Vercel |

---

## Quick Start

```bash
cd sag-website-vite
npm install
cp .env.example .env
# Fill in .env with your actual keys
npm run dev
```

Open http://localhost:5173

---

## Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
VITE_SUPABASE_URL=           # Supabase project URL
VITE_SUPABASE_ANON_KEY=      # Supabase anon key (public)
VITE_CONTENTFUL_SPACE_ID=    # Contentful Space ID
VITE_CONTENTFUL_ACCESS_TOKEN= # Contentful Content Delivery API token
VITE_WEB3FORMS_ACCESS_KEY=   # Web3Forms access key
VITE_APP_URL=                # Your deployed URL (for email links)
```

---

## Setup Guide

### 1. Supabase Setup

1. Create a project at https://supabase.com
2. Go to **SQL Editor** and run `supabase/migrations/001_initial_schema.sql`
3. Go to **Storage → Create Bucket**:
   - Name: `candidate-cv`
   - Public: `false`
   - Allowed MIME: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
   - Max size: `10 MB`
4. Go to **Project Settings → API** and copy your `URL` and `anon key`

**Create first HR Admin:**
After registering a user, run in SQL Editor:
```sql
UPDATE profiles SET role = 'hr_admin' WHERE email = 'your-admin@email.com';
```

### 2. Contentful Setup

1. Create an account at https://contentful.com
2. Create a new Space
3. Go to **Content Model** and create these content types:

#### `job`
| Field | Field ID | Type |
|---|---|---|
| Title | `title` | Short text |
| Slug | `slug` | Short text |
| Department | `department` | Short text |
| Location | `location` | Short text |
| Employment Type | `employmentType` | Short text |
| Description | `description` | Long text |
| Requirements | `requirements` | Long text |
| Status | `status` | Short text (active/inactive/closed) |
| Deadline | `deadline` | Date |

#### `digitalPortfolio`
| Field | Field ID | Type |
|---|---|---|
| Title | `title` | Short text |
| Slug | `slug` | Short text |
| Description | `description` | Long text |
| Category | `category` | Short text |
| Business Impact | `businessImpact` | Long text |
| Technology | `technology` | Short text |
| Status | `status` | Short text |

#### `businessUnit`
| Field | Field ID | Type |
|---|---|---|
| Name | `name` | Short text |
| Slug | `slug` | Short text |
| Description | `description` | Long text |
| Location | `location` | Short text |
| Category | `category` | Short text |
| Status | `status` | Short text |

4. Go to **Settings → API Keys** → Copy **Space ID** and **Content Delivery API access token**

### 3. Web3Forms Setup

1. Go to https://web3forms.com
2. Enter your HR email address to receive notifications
3. Copy the **Access Key**
4. Set `VITE_WEB3FORMS_ACCESS_KEY` in your `.env`

Notifications are sent for:
- Contact form submissions
- Partnership inquiries  
- New job applications (with candidate info + CV link)

---

## Deploy to Vercel

1. Push this folder to a GitHub repository
2. Go to https://vercel.com → **Add New Project**
3. Import your GitHub repo
4. Set **Root Directory** to `sag-website-vite` (if in a monorepo)
5. Add all environment variables from `.env`
6. Click **Deploy**

The `vercel.json` file already handles client-side routing (SPA fallback).

---

## Project Structure

```
sag-website-vite/
├── public/
│   └── assets/sag/           ← Copy from sag-career-portal-asset-ready/public/
├── src/
│   ├── components/
│   │   ├── admin/            ← AdminLayout
│   │   └── common/           ← Navbar, Footer, ProtectedRoute, Spinner, StatusBadge
│   ├── data/siteContent.ts   ← Static content, assets, business data
│   ├── hooks/
│   │   ├── useAuth.tsx       ← Supabase auth context
│   │   └── useToast.tsx      ← Toast notifications
│   ├── lib/
│   │   ├── supabase.ts       ← Supabase client
│   │   ├── contentful.ts     ← Contentful client + fetch helpers
│   │   ├── web3forms.ts      ← Email notification helpers
│   │   └── export.ts         ← CSV export
│   ├── pages/
│   │   ├── Home, About, BusinessUnits, DigitalPortfolio
│   │   ├── Careers, CareerDetail, Contact, Partnership
│   │   ├── candidate/        ← Register, Login, Profile, Dashboard, Apply
│   │   └── admin/            ← Login, Dashboard, Applications, ApplicationDetail, Export
│   └── types/                ← TypeScript types + Supabase DB types
├── supabase/migrations/001_initial_schema.sql
├── .env.example
├── vercel.json               ← SPA routing fix for Vercel
└── package.json
```

---

## Copy Assets

Copy the existing assets from the old project:
```bash
# From the project root (Website SAG/)
cp -R sag-career-portal-asset-ready/public/assets sag-website-vite/public/
```

---

## User Roles

| Role | Access |
|---|---|
| `candidate` | Register, login, update profile, upload CV, apply, view own applications |
| `hr_admin` | View all candidates, all applications, update status, add notes, export CSV |
| `super_admin` | All admin access + manage users |

---

## Features

### Public
- Homepage with hero, company profile, business units, digital portfolio, activities
- About page with visi/misi, core values, area bisnis
- Business units detail page
- Digital portfolio page
- Career listing with search, department, and employment type filters
- Career detail page with apply button
- Contact form (Web3Forms)
- Partnership/vendor inquiry form (Web3Forms)

### Candidate Portal
- Register with email/password + data consent
- Login
- Profile page: personal info, education, experience, CV upload
- Dashboard: application history and status tracking
- Apply for job: cover letter, expected salary, availability, CV upload
- Duplicate application prevention
- Email notification to HR on apply

### HR Admin Dashboard
- Secure admin login (role-checked)
- Dashboard with application counts and status breakdown
- Applications table with search, status, department, and date filters
- Application detail with candidate info, cover letter, and status management
- HR notes per application
- CSV export with filters

---

## Security

- Supabase anon key only in frontend (never service role key)
- RLS enabled on all tables — candidates only see their own data
- Admin routes protected by `ProtectedRoute` (role check)
- CV storage: candidates can only upload/read their own files; admins can read all
- Passwords handled entirely by Supabase Auth (never stored manually)
