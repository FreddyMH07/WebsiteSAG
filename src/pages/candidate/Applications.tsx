import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Briefcase, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Application, ApplicationStatus } from '@/types';

export default function CandidateApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data: cand } = await supabase.from('candidates').select('id').eq('user_id', user.id).single();
        if (!cand) { setLoading(false); return; }
        const { data } = await supabase
          .from('applications')
          .select('*, jobs(title)')
          .eq('candidate_id', cand.id)
          .order('created_at', { ascending: false });
        setApplications(data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Navbar />
      <div className="section-pad">
        <div className="container-page">
          <div className="mb-6 flex items-center gap-4">
            <Link to="/candidate/dashboard" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sag-green transition">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-black text-sag-green">Lamaran Saya</h1>
            <p className="text-sm text-slate-500">{applications.length} lamaran total</p>
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="flex justify-center py-20"><Spinner size="lg" /></div>
            ) : applications.length === 0 ? (
              <div className="py-20 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-slate-200" />
                <p className="mt-4 font-semibold text-slate-500">Belum ada lamaran</p>
                <p className="mt-1 text-sm text-slate-400">Lihat lowongan yang tersedia dan mulai melamar.</p>
                <Link to="/jobs" className="btn-primary mt-6">Lihat Lowongan</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-head">
                      <th className="px-4 py-3">Posisi</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Tanggal Lamar</th>
                      <th className="px-4 py-3">Ekspektasi Gaji</th>
                      <th className="px-4 py-3">Ketersediaan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-sag-mist/50 transition">
                        <td className="table-cell">
                          <p className="font-semibold text-sag-green">{(app as any).jobs?.title ?? app.job_slug ?? '—'}</p>
                          {app.job_slug && (
                            <Link to={`/jobs/${app.job_slug}`} className="text-xs text-slate-400 hover:underline">
                              Lihat lowongan
                            </Link>
                          )}
                        </td>
                        <td className="table-cell"><StatusBadge status={app.status as ApplicationStatus} /></td>
                        <td className="table-cell text-slate-500 whitespace-nowrap">
                          {new Date(app.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="table-cell text-slate-600">{app.expected_salary ?? '-'}</td>
                        <td className="table-cell text-slate-600">{app.availability ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <Link to="/jobs" className="btn-secondary">Lihat Lowongan Lainnya</Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
