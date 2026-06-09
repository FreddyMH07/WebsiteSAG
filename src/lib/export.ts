import Papa from 'papaparse';
import type { ApplicationRow } from '@/types';

export function exportApplicationsToCSV(applications: ApplicationRow[]) {
  const rows = applications.map((app) => ({
    'Candidate Name': app.candidates?.full_name ?? '',
    Email: app.candidates?.email ?? '',
    Phone: app.candidates?.phone ?? '',
    Domicile: app.candidates?.domicile ?? '',
    Education: app.candidates?.education ?? '',
    Major: app.candidates?.major ?? '',
    'Experience (years)': app.candidates?.experience_year ?? '',
    'Current Company': app.candidates?.current_company ?? '',
    'Job Title': app.job_title ?? '',
    Status: app.status ?? '',
    'Expected Salary': app.expected_salary ?? '',
    Availability: app.availability ?? '',
    'Cover Note': app.cover_note ?? '',
    'CV URL': app.candidates?.cv_url ?? '',
    'Applied At': app.applied_at ? new Date(app.applied_at).toLocaleDateString('id-ID') : '',
  }));

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `sag-aplikasi-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
