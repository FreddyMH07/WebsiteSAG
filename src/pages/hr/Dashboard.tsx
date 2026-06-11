import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, FileText, Clock, CheckCircle, ArrowRight, AlertCircle, Briefcase } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { supabase } from '@/lib/supabase';
import type { ApplicationRow, ApplicationStatus } from '@/types';

const STATUS_PARAM: Record<string, string> = {
  'Applied':      'Applied',
  'Screening HR': 'Screening+HR',
  'Interview HR': 'Interview+HR',
  'Offering':     'Offering',
  'Accepted':     'Accepted',
  'Rejected':     'Rejected',
};

interface PerPT { id: string; name: string; count: number; }

export default function HRDashboard() {
  const [applications, setApplications] = useState<ApplicationRow[]>([]);
  const [jobsOpen,   setJobsOpen]   = useState(0);
  const [jobsClosed, setJobsClosed] = useState(0);
  const [perPT,      setPerPT]      = useState<PerPT[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [{ data: appData }, { data: jobsData }] = await Promise.all([
          supabase
            .from('applications')
            .select('*, candidates(full_name, email, phone)')
            .order('created_at', { ascending: false }),
          supabase
            .from('jobs')
            .select('id, status, company_id, companies(id, name, short_name)'),
        ]);

        const apps = (appData ?? []) as ApplicationRow[];
        setApplications(apps);

        // Jobs open / closed counts
        setJobsOpen(  (jobsData ?? []).filter((j) => j.status === 'published').length);
        setJobsClosed((jobsData ?? []).filter((j) => j.status === 'closed').length);

        // Build job_id → company map
        type CoInfo = { id: string; name: string };
        const jobCoMap: Record<string, CoInfo> = {};
        (jobsData ?? []).forEach((j) => {
          if (!j.company_id) return;
          const co = j.companies as unknown as { id: string; name: string } | null;
          if (co) jobCoMap[j.id] = { id: co.id, name: co.name };
        });

        // Aggregate applications per company
        const acc: Record<string, { name: string; count: number }> = {};
        apps.forEach((app) => {
          const jobId = (app as unknown as Record<string, unknown>).job_id as string | null;
          const co = jobId ? jobCoMap[jobId] : null;
          const key  = co?.id   ?? 'holding';
          const name = co?.name ?? 'PT Sahabat Agro Group';
          if (!acc[key]) acc[key] = { name, count: 0 };
          acc[key].count++;
        });
        setPerPT(
          Object.entries(acc)
            .map(([id, { name, count }]) => ({ id, name, count }))
            .sort((a, b) => b.count - a.count)
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const counts = {
    total:      applications.length,
    newApps:    applications.filter((a) => a.status === 'Applied').length,
    inProgress: applications.filter((a) => ['Screening HR', 'Psikotes', 'Interview HR', 'Interview User', 'Offering'].includes(a.status)).length,
    accepted:   applications.filter((a) => a.status === 'Accepted').length,
  };

  const recent = applications.slice(0, 5);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const perluTindakan = applications.filter(
    (a) => a.status === 'Applied' && new Date(a.created_at) < sevenDaysAgo
  );

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

      {/* Jobs Open / Closed cards */}
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        {[
          { label: 'Jobs Open',   value: jobsOpen,   color: 'bg-green-100 text-green-700',  to: '/hr/jobs?tab=published' },
          { label: 'Jobs Closed', value: jobsClosed, color: 'bg-slate-100 text-slate-500',  to: '/hr/jobs?tab=closed' },
        ].map(({ label, value, color, to }) => (
          <Link key={label} to={to}
            className="card flex items-center gap-4 p-5 transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
            <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-800">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Overview stat cards — each is a link */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Applications', value: counts.total,      icon: FileText,    color: 'bg-blue-100 text-blue-600',     to: '/hr/applications' },
          { label: 'New / Submitted',    value: counts.newApps,    icon: Clock,       color: 'bg-yellow-100 text-yellow-600', to: '/hr/applications?status=Applied' },
          { label: 'In Progress',        value: counts.inProgress, icon: Users,       color: 'bg-purple-100 text-purple-600', to: '/hr/applications?status=in_progress' },
          { label: 'Accepted',           value: counts.accepted,   icon: CheckCircle, color: 'bg-green-100 text-green-600',   to: '/hr/applications?status=Accepted' },
        ].map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to}
            className="card p-6 transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-3xl font-black text-slate-800">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Status breakdown — each card is a link */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {(['Applied', 'Screening HR', 'Interview HR', 'Offering', 'Accepted', 'Rejected'] as ApplicationStatus[]).map((status) => {
          const count = applications.filter((a) => a.status === status).length;
          const param = STATUS_PARAM[status] ?? encodeURIComponent(status);
          return (
            <Link key={status} to={`/hr/applications?status=${param}`}
              className="card p-4 text-center transition hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
              <p className="text-2xl font-black text-slate-800">{count}</p>
              <StatusBadge status={status} />
            </Link>
          );
        })}
      </div>

      {/* Bottom: Recent + Perlu Tindakan + per-PT */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Applications */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black text-sag-green">Recent Applications</h2>
            <Link to="/hr/applications" className="flex items-center gap-1 text-xs font-bold text-sag-gold hover:underline">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada lamaran.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {recent.map((app) => (
                <div key={app.id} className="flex items-center gap-3 px-5 py-3 hover:bg-sag-mist/40 transition">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">{app.candidates?.full_name ?? '—'}</p>
                    <p className="truncate text-xs text-slate-400">{app.job_title ?? app.job_slug ?? '—'}</p>
                  </div>
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <StatusBadge status={app.status as ApplicationStatus} />
                    <span className="text-xs text-slate-400">
                      {new Date(app.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>
                  <Link to={`/hr/applications/${app.id}`}
                    className="flex-shrink-0 text-xs font-bold text-sag-gold hover:underline">
                    Detail
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lamaran per Perusahaan */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h2 className="font-black text-sag-green">Lamaran per Perusahaan</h2>
          </div>
          {perPT.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-slate-400">Belum ada data.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {perPT.map(({ id, name, count }) => (
                <Link
                  key={id}
                  to={id === 'holding' ? '/hr/applications' : `/hr/applications?company=${id}`}
                  className="flex items-center justify-between px-5 py-3 hover:bg-sag-mist/40 transition"
                >
                  <span className="truncate text-sm font-semibold text-slate-700">{name}</span>
                  <span className="ml-3 flex-shrink-0 rounded-full bg-sag-green/10 px-3 py-0.5 text-xs font-bold text-sag-green">
                    {count}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Perlu Tindakan */}
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-slate-100 p-5">
            <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            <h2 className="font-black text-sag-green">Perlu Tindakan</h2>
            <span className="ml-auto text-xs text-slate-400">Belum diproses &gt; 7 hari</span>
          </div>
          {perluTindakan.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm font-semibold text-green-600">
              Tidak ada lamaran tertunda ✓
            </p>
          ) : (
            <div className="divide-y divide-slate-50">
              {perluTindakan.slice(0, 5).map((app) => {
                const daysAgo = Math.floor((Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={app.id} className="flex items-center gap-3 px-5 py-3 hover:bg-amber-50/50 transition">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-800">{app.candidates?.full_name ?? '—'}</p>
                      <p className="truncate text-xs text-slate-400">{app.job_title ?? app.job_slug ?? '—'}</p>
                    </div>
                    <span className="flex-shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
                      {daysAgo}h lalu
                    </span>
                    <Link to={`/hr/applications/${app.id}`}
                      className="flex-shrink-0 text-xs font-bold text-sag-gold hover:underline">
                      Tinjau
                    </Link>
                  </div>
                );
              })}
              {perluTindakan.length > 5 && (
                <div className="px-5 py-3 text-center">
                  <Link to="/hr/applications?status=Applied"
                    className="text-xs font-bold text-sag-gold hover:underline">
                    +{perluTindakan.length - 5} lamaran lainnya →
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </HRLayout>
    </>
  );
}
