import { supabase } from '@/lib/supabase';
import type { Job, CompanyInfo } from '@/types';

export const HOLDING: CompanyInfo = {
  name: 'PT Sahabat Agro Group',
  shortName: 'SAG',
  logoUrl: '/assets/sag/brand/logo-ptsag.png',
  address: null,
};

/** Returns company info with fallback to holding if null or missing logo. */
export function resolveCompany(company: CompanyInfo | null): CompanyInfo {
  if (!company) return HOLDING;
  return company;
}

const SELECT_COLS = 'id,title,slug,department,employment_type,location,description,requirements,status,closing_date,company_id,companies(name,short_name,logo_url,address)';

function mapRow(row: Record<string, unknown>): Job {
  const co = row.companies as Record<string, unknown> | null | undefined;
  return {
    id:             String(row.id),
    title:          String(row.title),
    slug:           String(row.slug),
    company: co ? {
      name:      String(co.name),
      shortName: co.short_name ? String(co.short_name) : null,
      logoUrl:   co.logo_url   ? String(co.logo_url)   : null,
      address:   co.address    ? String(co.address)    : null,
    } : null,
    department:     String(row.department ?? ''),
    employmentType: String(row.employment_type ?? ''),
    location:       String(row.location ?? ''),
    description:    row.description  ? String(row.description)  : undefined,
    requirements:   row.requirements ? String(row.requirements) : undefined,
    isOpen:         row.status === 'published',
    closingDate:    row.closing_date ? String(row.closing_date) : undefined,
  };
}

export async function getActiveJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(SELECT_COLS)
    .eq('status', 'published')
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getAllJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select(SELECT_COLS)
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return data.map(mapRow);
}

export async function getJobBySlug(slug: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select(SELECT_COLS)
    .eq('slug', slug)
    .maybeSingle();
  if (error || !data) return null;
  return mapRow(data as Record<string, unknown>);
}
