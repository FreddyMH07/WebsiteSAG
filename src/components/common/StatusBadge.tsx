import type { ApplicationStatus } from '@/types';

const map: Record<ApplicationStatus, { label: string; cls: string }> = {
  submitted:  { label: 'Submitted',  cls: 'bg-blue-100 text-blue-700' },
  screening:  { label: 'Screening',  cls: 'bg-yellow-100 text-yellow-700' },
  interview:  { label: 'Interview',  cls: 'bg-purple-100 text-purple-700' },
  offering:   { label: 'Offering',   cls: 'bg-orange-100 text-orange-700' },
  accepted:   { label: 'Accepted',   cls: 'bg-green-100 text-green-700' },
  rejected:   { label: 'Rejected',   cls: 'bg-red-100 text-red-700' },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
