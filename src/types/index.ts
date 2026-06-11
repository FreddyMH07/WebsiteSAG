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
}

// ─── Application Note ─────────────────────────────────────────────────────────

export interface ApplicationNote {
  id: string;
  application_id: string;
  note: string;
  created_by: string;
  created_at: string;
}

// ─── Candidate Profile (SAG Employment Application Form) ──────────────────────

export type FamilyMember = { relation: string; name: string; gender: string; age: string; occupation: string; address: string };
export type FormalEducation = { level: string; school_name: string; major: string; city: string; year_from: string; year_to: string; gpa: string };
export type InformalEducation = { year: string; topic: string; organizer: string; city: string; duration: string; certificate: string };
export type Language = { language: string; speaking: string; writing: string; reading: string };
export type Organization = { org_name: string; period: string; city: string; position: string };
export type WorkExperience = { year_from: string; year_to: string; company: string; initial_position: string; final_position: string; initial_salary: string; final_salary: string; reason_leaving: string; responsibilities: string };
export type Reference = { name: string; company: string; address: string; phone: string; position: string; relation: string };
export type OtherInfo = {
  emergency_name: string; emergency_relation: string; emergency_address: string; emergency_phone: string;
  can_contact_references: string; can_contact_reason: string;
  worked_here_before: string; worked_here_details: string;
  reason_resign: string; company_weakness: string; why_join: string;
  has_family_here: string; has_family_details: string;
  strength_1: string; strength_2: string; strength_3: string;
  weakness_1: string; weakness_2: string; weakness_3: string;
  is_breadwinner: string; hobby: string;
  has_medical_history: string; medical_history_details: string;
  spouse_medical_history: string; spouse_medical_details: string;
  has_physical_issues: string; physical_issues_details: string;
  has_legal_issues: string; legal_issues_details: string;
  willing_transfer: string; not_willing_transfer_reason: string; transfer_refusal_consequence: string;
  willing_travel: string; not_willing_travel_reason: string;
};

export interface CandidateProfile {
  id: string;
  candidate_id: string;
  applied_position: string | null;
  birth_place: string | null;
  birth_date: string | null;
  blood_type: string | null;
  gender: string | null;
  religion: string | null;
  marital_status: string | null;
  nik: string | null;
  address_current: string | null;
  address_ktp: string | null;
  family_members: FamilyMember[];
  formal_education: FormalEducation[];
  informal_education: InformalEducation[];
  languages: Language[];
  organizations: Organization[];
  work_experiences: WorkExperience[];
  references_data: Reference[];
  other_info: Partial<OtherInfo>;
  consent_data_truth: boolean;
  consent_pdp: boolean;
  declared_at: string | null;
  declared_name: string | null;
  created_at: string;
  updated_at: string | null;
}

export type CandidateProfilePatch = Partial<CandidateProfile> & { full_name?: string; phone?: string };

// ─── Job (Supabase jobs table) ────────────────────────────────────────────────

export interface Job {
  id: string;
  title: string;
  slug: string;
  company?: string;
  department: string;
  employmentType: string;
  location: string;
  description?: string;
  requirements?: string;
  isOpen: boolean;
  closingDate?: string;
}

/** @deprecated use Job */
export type ContentfulJob = Job;
