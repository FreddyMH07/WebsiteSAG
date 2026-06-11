// Supabase Database types – avoid circular references by using explicit types

type ProfileRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: 'candidate' | 'hr_admin' | 'super_admin';
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string | null;
};

type CandidateRow = {
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
};

type ApplicationRow = {
  id: string;
  candidate_id: string;
  job_id: string | null;
  job_slug: string | null;
  job_title: string | null;
  status: 'Applied' | 'Screening HR' | 'Psikotes' | 'Interview HR' | 'Interview User' | 'Offering' | 'Accepted' | 'Rejected' | 'Talent Pool';
  expected_salary: string | null;
  availability: string | null;
  cover_note: string | null;
  created_at: string;
  updated_at: string | null;
};

type ApplicationNoteRow = {
  id: string;
  application_id: string;
  note: string;
  created_by: string;
  created_at: string;
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: Omit<ProfileRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<ProfileRow, 'id' | 'created_at'>>;
      };
      candidates: {
        Row: CandidateRow;
        Insert: Omit<CandidateRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<CandidateRow, 'id' | 'created_at'>>;
      };
      applications: {
        Row: ApplicationRow;
        Insert: Omit<ApplicationRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<ApplicationRow, 'id' | 'created_at'>>;
      };
      application_notes: {
        Row: ApplicationNoteRow;
        Insert: Omit<ApplicationNoteRow, 'id' | 'created_at'> & { id?: string };
        Update: Partial<Omit<ApplicationNoteRow, 'id' | 'created_at'>>;
      };
    };
  };
}
