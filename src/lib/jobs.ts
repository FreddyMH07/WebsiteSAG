import { supabase } from '@/lib/supabase';
import type { Job } from '@/types';

const SELECT_COLS = 'id,title,slug,company,department,employment_type,location,description,requirements,status,closing_date';

function mapRow(row: Record<string, unknown>): Job {
  return {
    id:              String(row.id),
    title:           String(row.title),
    slug:            String(row.slug),
    company:         row.company   ? String(row.company)   : undefined,
    department:      String(row.department ?? ''),
    employmentType:  String(row.employment_type ?? ''),
    location:        String(row.location ?? ''),
    description:     row.description  ? String(row.description)  : undefined,
    requirements:    row.requirements ? String(row.requirements) : undefined,
    isOpen:          row.status === 'published',
    closingDate:     row.closing_date ? String(row.closing_date) : undefined,
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
