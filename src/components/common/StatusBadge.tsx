import type { ApplicationStatus } from '@/types';

const map: Record<ApplicationStatus, { label: string; cls: string }> = {
  'Applied':        { label: 'Applied',        cls: 'bg-blue-100 text-blue-700' },
  'Screening HR':   { label: 'Screening HR',   cls: 'bg-yellow-100 text-yellow-700' },
  'Psikotes':       { label: 'Psikotes',       cls: 'bg-cyan-100 text-cyan-700' },
  'Interview HR':   { label: 'Interview HR',   cls: 'bg-purple-100 text-purple-700' },
  'Interview User': { label: 'Interview User', cls: 'bg-violet-100 text-violet-700' },
  'Offering':       { label: 'Offering',       cls: 'bg-orange-100 text-orange-700' },
  'Accepted':       { label: 'Accepted',       cls: 'bg-green-100 text-green-700' },
  'Rejected':       { label: 'Rejected',       cls: 'bg-red-100 text-red-700' },
  'Talent Pool':    { label: 'Talent Pool',    cls: 'bg-teal-100 text-teal-700' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
