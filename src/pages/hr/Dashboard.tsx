import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, FileText, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { supabase } from '@/lib/supabase';
import type { ApplicationRow, ApplicationStatus } from '@/types';

export default function HRDashboard() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('applications')
          .select('*, candidates(full_name, email, phone), jobs(title, department, location)')
          .order('created_at', { ascending: false });
        setApplications((data ?? []) as ApplicationRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = {
    total: applications.length,
    newApps: applications.filter((a) => a.status === 'Applied').length,
    inProgress: applications.filter((a) => ['Screening HR', 'Psikotes', 'Interview HR', 'Interview User', 'Offering'].includes(a.status)).length,
    accepted: applications.filter((a) => a.status === 'Accepted').length,
  };

  const recent = applications.slice(0, 8);

  if (loading) return (
    <HRLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></HRLayout>
  );

  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <HRLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-sag-green">Dashboard</h1>
        <p className="text-sm text-slate-500">
          Recruitment overview — {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Applications', value: counts.total, icon: FileText, color: 'bg-blue-100 text-blue-600' },
          { label: 'New / Submitted', value: counts.newApps, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
          { label: 'In Progress', value: counts.inProgress, icon: Users, color: 'bg-purple-100 text-purple-600' },
          { label: 'Accepted', value: counts.accepted, icon: CheckCircle, color: 'bg-green-100 text-green-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-6">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {(['Applied', 'Screening HR', 'Interview HR', 'Offering', 'Accepted', 'Rejected'] as ApplicationStatus[]).map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          return (
            <div key={status} className="card p-4 text-center">
              <p className="text-2xl font-black text-slate-800">{count}</p>
              <StatusBadge status={status} />
            </div>
          );
        })}
      </div>

      {/* Recent applications */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-black text-sag-green">Recent Applications</h2>
          <Link to="/hr/applications" className="flex items-center gap-1 text-xs font-bold text-sag-gold hover:underline">
            View All <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-head">
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Applied</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {recent.map((app) => (
                <tr key={app.id} className="hover:bg-sag-mist/40 transition">
                  <td className="table-cell">
                    <p className="font-semibold text-slate-800">{app.candidates?.full_name ?? '—'}</p>
                    <p className="text-xs text-slate-400">{app.candidates?.email}</p>
                  </td>
                  <td className="table-cell font-semibold text-sag-green">{app.jobs?.title ?? app.job_slug ?? '—'}</td>
                  <td className="table-cell"><StatusBadge status={app.status as ApplicationStatus} /></td>
                  <td className="table-cell text-slate-500">{new Date(app.created_at).toLocaleDateString('id-ID')}</td>
                  <td className="table-cell">
                    <Link to={`/hr/applications/${app.id}`} className="text-xs font-bold text-sag-gold hover:underline">Detail</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </HRLayout>
    </>
  );
}
