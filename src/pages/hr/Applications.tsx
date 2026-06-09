import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, Filter, Download } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { supabase } from '@/lib/supabase';
import { careerDepartments } from '@/data/siteContent';
import type { ApplicationRow, ApplicationStatus } from '@/types';

const STATUS_OPTIONS: ApplicationStatus[] = ['submitted', 'screening', 'interview', 'offering', 'accepted', 'rejected'];

function downloadCSV(rows: ApplicationRow[]) {
  const headers = ['Name', 'Email', 'Phone', 'Position', 'Status', 'Applied', 'Expected Salary', 'Availability'];
  const lines = rows.map((r) => [
    r.candidates?.full_name ?? '',
    r.candidates?.email ?? '',
    r.candidates?.phone ?? '',
    r.job_title,
    r.status,
    new Date(r.applied_at).toLocaleDateString('id-ID'),
    r.expected_salary ?? '',
    r.availability ?? '',
  ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...lines].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `sag-applications-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function HRApplications() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('applications')
          .select('*, candidates(full_name, email, phone, domicile, cv_url)')
          .order('applied_at', { ascending: false });
        setApplications((data ?? []) as ApplicationRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = applications.filter((app) => {
    const name = app.candidates?.full_name?.toLowerCase() ?? '';
    const email = app.candidates?.email?.toLowerCase() ?? '';
    const q = search.toLowerCase();
    const matchSearch = !q || name.includes(q) || email.includes(q) || app.job_title.toLowerCase().includes(q);
    const matchStatus = !statusFilter || app.status === statusFilter;
    const matchDept = !deptFilter || app.job_title.toLowerCase().includes(deptFilter.toLowerCase());
    const appliedDate = new Date(app.applied_at).toISOString().split('T')[0];
    const matchFrom = !dateFrom || appliedDate >= dateFrom;
    const matchTo = !dateTo || appliedDate <= dateTo;
    return matchSearch && matchStatus && matchDept && matchFrom && matchTo;
  });

  const clearFilters = () => { setSearch(''); setStatusFilter(''); setDeptFilter(''); setDateFrom(''); setDateTo(''); };
  const hasFilters = search || statusFilter || deptFilter || dateFrom || dateTo;

  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <HRLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-sag-green">Applications</h1>
          <p className="text-sm text-slate-500">{filtered.length} of {applications.length} applications</p>
        </div>
        <button onClick={() => downloadCSV(filtered)} className="btn-secondary flex items-center gap-2 text-sm">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="card mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="input pl-10 text-sm" placeholder="Search name, email, position..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto min-w-[130px] text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
          <select className="input w-auto min-w-[150px] text-sm" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            {careerDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="date" className="input w-auto text-sm" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} title="From date" />
          <input type="date" className="input w-auto text-sm" value={dateTo} onChange={(e) => setDateTo(e.target.value)} title="To date" />
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary flex items-center gap-1 text-sm">
              <Filter className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-slate-500">No applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Position</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Applied</th>
                  <th className="px-4 py-3">Expected Salary</th>
                  <th className="px-4 py-3">CV</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-sag-mist/40 transition">
                    <td className="table-cell">
                      <p className="font-semibold text-slate-800">{app.candidates?.full_name ?? '—'}</p>
                      <p className="text-xs text-slate-400">{app.candidates?.email}</p>
                      <p className="text-xs text-slate-400">{app.candidates?.phone}</p>
                    </td>
                    <td className="table-cell font-semibold text-sag-green">{app.job_title}</td>
                    <td className="table-cell"><StatusBadge status={app.status as ApplicationStatus} /></td>
                    <td className="table-cell text-slate-500 whitespace-nowrap">{new Date(app.applied_at).toLocaleDateString('id-ID')}</td>
                    <td className="table-cell text-slate-600">{app.expected_salary ?? '—'}</td>
                    <td className="table-cell">
                      {app.candidates?.cv_url ? (
                        <a href={app.candidates.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-sag-leaf hover:underline">View CV</a>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="table-cell">
                      <Link to={`/hr/applications/${app.id}`} className="text-xs font-bold text-sag-gold hover:underline whitespace-nowrap">View Detail</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HRLayout>
    </>
  );
}
