// ─── Auth / User ──────────────────────────────────────────────────────────────

export type UserRole = 'candidate' | 'hr_admin' | 'super_admin';
export type UserStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string | null;
}

// ─── Candidate ────────────────────────────────────────────────────────────────

export interface Candidate {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string | null;
  domicile: string | null;
  education: string | null;
  major: string | null;
  experience_year: string | null;
  current_company: string | null;
  current_position: string | null;
  expected_salary: string | null;
  linkedin_url: string | null;
  portfolio_url: string | null;
  cv_url: string | null;
  created_at: string;
  updated_at: string | null;
}

// ─── Application ──────────────────────────────────────────────────────────────

export type ApplicationStatus =
  | 'Applied'
  | 'Screening HR'
  | 'Psikotes'
  | 'Interview HR'
  | 'Interview User'
  | 'Offering'
  | 'Accepted'
  | 'Rejected'
  | 'Talent Pool';

export interface Application {
  id: string;
  candidate_id: string;
  job_id: string | null;
  job_slug: string | null;
  job_title: string | null;
  status: ApplicationStatus;
  expected_salary: string | null;
  availability: string | null;
  cover_note: string | null;
  created_at: string;
  updated_at: string | null;
}

// Application joined with candidate + job data (for admin views)
export interface ApplicationRow extends Application {
  candidates?: Pick<
    Candidate,
    | 'full_name'
    | 'email'
    | 'phone'
    | 'domicile'
    | 'education'
    | 'major'
    | 'experience_year'
    | 'current_company'
    | 'cv_url'
  >;
  jobs?: Pick<Job, 'title' | 'department' | 'location'> | null;
}

// ─── Application Note ─────────────────────────────────────────────────────────

export interface ApplicationNote {
  id: string;
  application_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

// ─── Job (Contentful or Supabase) ─────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  slug: string;
  department: string;
  location: string;
  employment_type: string;
  description: string;
  requirements: string;
  status: 'active' | 'inactive' | 'closed';
  deadline: string | null;
  created_at?: string;
}

// ─── Contentful — Job Vacancy ─────────────────────────────────────────────────

export interface ContentfulJob {
  id: string;
  title: string;
  slug: string;
  department: string;
  employmentType: string;        // maps from Contentful field "type"
  location: string;
  descriptionEnglish?: string;
  descriptionIndonesian?: string;
  requirements?: string;
  displayOrder?: number;
  isOpen: boolean;
  closingDate?: string;
}
