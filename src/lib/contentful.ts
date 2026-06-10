import { createClient } from 'contentful';
import type { ContentfulJob } from '@/types';

const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID as string | undefined;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN as string | undefined;

// Graceful — if Contentful is not configured, use fallback data
const contentfulClient = spaceId && accessToken
  ? createClient({ space: spaceId, accessToken })
  : null;

// ─── Fallback data (build won't fail if Contentful not connected) ─────────────
const FALLBACK_JOBS: ContentfulJob[] = [
  {
    id: 'fallback-1',
    title: 'Agronomist',
    slug: 'agronomist-lampung',
    department: 'Agronomi',
    employmentType: 'Full Time',
    location: 'Lampung',
    descriptionIndonesian: 'Bertanggung jawab atas pengelolaan kebun kelapa sawit meliputi monitoring pertumbuhan tanaman, pengendalian hama, dan penerapan good agricultural practices.',
    requirements: 'S1 Agronomi / Pertanian. Pengalaman min. 1 tahun di perkebunan sawit.',
    isOpen: true,
    displayOrder: 1,
  },
  {
    id: 'fallback-2',
    title: 'HR Generalist',
    slug: 'hr-generalist-jakarta',
    department: 'Human Resources',
    employmentType: 'Full Time',
    location: 'Jakarta',
    descriptionIndonesian: 'Mendukung operasional HR harian mencakup rekrutmen, administrasi kepegawaian, dan pengembangan karyawan.',
    requirements: 'S1 Manajemen SDM / Psikologi. Pengalaman min. 2 tahun di posisi HR.',
    isOpen: true,
    displayOrder: 2,
  },
  {
    id: 'fallback-3',
    title: 'Finance & Accounting Staff',
    slug: 'finance-staff-jakarta',
    department: 'Finance & Accounting',
    employmentType: 'Full Time',
    location: 'Jakarta',
    descriptionIndonesian: 'Membantu proses akuntansi dan keuangan harian di kantor pusat.',
    requirements: 'S1 Akuntansi / Keuangan. Fresh graduate dipersilakan melamar.',
    isOpen: true,
    displayOrder: 3,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function mapEntry(item: any): ContentfulJob {
  const f = item.fields as Record<string, any>;
  return {
    id: item.sys.id,
    title: f.title ?? '',
    slug: f.slug ?? item.sys.id,
    department: f.department ?? '',
    employmentType: f.type ?? f.employmentType ?? '',
    location: f.location ?? '',
    descriptionEnglish: f.descriptionEnglish ?? f.description ?? '',
    descriptionIndonesian: f.descriptionIndonesian ?? '',
    requirements: f.requirements ?? '',
    displayOrder: f.displayOrder ?? 99,
    isOpen: f.isOpen ?? true,
    closingDate: f.closingDate ?? f.deadline ?? undefined,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getActiveJobs(): Promise<ContentfulJob[]> {
  if (!contentfulClient) return FALLBACK_JOBS;
  try {
    const res = await contentfulClient.getEntries({
      content_type: 'jobVacancy',
      'fields.isOpen': true,
      order: ['fields.displayOrder', '-sys.createdAt'] as any,
    });
    const jobs = res.items.map(mapEntry);
    return jobs.length ? jobs : FALLBACK_JOBS;
  } catch {
    return FALLBACK_JOBS;
  }
}

export async function getAllJobs(): Promise<ContentfulJob[]> {
  if (!contentfulClient) return FALLBACK_JOBS;
  try {
    const res = await contentfulClient.getEntries({
      content_type: 'jobVacancy',
      order: ['fields.displayOrder', '-sys.createdAt'] as any,
    });
    const jobs = res.items.map(mapEntry);
    return jobs.length ? jobs : FALLBACK_JOBS;
  } catch {
    return FALLBACK_JOBS;
  }
}

export async function getJobBySlug(slug: string): Promise<ContentfulJob | null> {
  // Check fallback first (for dev without Contentful)
  const fallback = FALLBACK_JOBS.find((j) => j.slug === slug);

  if (!contentfulClient) return fallback ?? null;
  try {
    const res = await contentfulClient.getEntries({
      content_type: 'jobVacancy',
      'fields.slug': slug,
      limit: 1,
    });
    if (!res.items.length) return fallback ?? null;
    return mapEntry(res.items[0]);
  } catch {
    return fallback ?? null;
  }
}
