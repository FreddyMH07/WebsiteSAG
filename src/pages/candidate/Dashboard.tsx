import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Briefcase, User, FileText, ArrowRight } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Application, Candidate, ApplicationStatus } from '@/types';

export default function CandidateDashboard() {
  const { user, profile } = useAuth();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
      setCandidate(cand ?? null);
      if (cand?.id) {
        const { data: apps } = await supabase
          .from('applications').select('*')
          .eq('candidate_id', cand.id)
          .order('created_at', { ascending: false });
        setApplications(apps ?? []);
      }
      setLoading(false);
    })();
  }, [user]);

  if (loading) return (
    <><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div><Footer /></>
  );

  const profileComplete = candidate?.cv_url && candidate?.domicile && candidate?.education;

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Navbar />
      <div className="section-pad">
        <div className="container-page">
          <div className="mb-8">
            <p className="font-bold uppercase tracking-widest text-sag-gold text-sm">Candidate Portal</p>
            <h1 className="mt-2 text-3xl font-black text-sag-green">Welcome, {profile?.full_name?.split(' ')[0]}!</h1>
          </div>

          {/* Profile completion alert */}
          {!profileComplete && (
            <div className="mb-6 rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <p className="font-semibold text-amber-800">Complete your profile to apply for positions</p>
              <p className="mt-1 text-sm text-amber-700">Add your domicile, education, and upload your CV to start applying.</p>
              <Link to="/candidate/profile" className="btn-gold mt-3">Complete Profile <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </div>
          )}

          {/* Stats */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{applications.length}</p>
                  <p className="text-xs text-slate-500">Total Applications</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-green-100">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {applications.filter((a) => ['Interview HR', 'Interview User', 'Offering', 'Accepted'].includes(a.status)).length}
                  </p>
                  <p className="text-xs text-slate-500">Active / Interview</p>
                </div>
              </div>
            </div>
            <div className="card p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sag-green/10">
                  <User className="h-5 w-5 text-sag-green" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">{profileComplete ? '✓' : '!'}</p>
                  <p className="text-xs text-slate-500">Profile Status</p>
                </div>
              </div>
            </div>
          </div>

          {/* Applications list */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h2 className="font-black text-sag-green">My Applications</h2>
              <Link to="/jobs" className="btn-secondary text-xs px-4 py-2">Browse Jobs</Link>
            </div>
            {applications.length === 0 ? (
              <div className="py-16 text-center">
                <Briefcase className="mx-auto h-12 w-12 text-slate-200" />
                <p className="mt-4 font-semibold text-slate-500">No applications yet</p>
                <p className="mt-1 text-sm text-slate-400">Browse open positions and apply to get started.</p>
                <Link to="/jobs" className="btn-primary mt-6">See Open Roles</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="table-head">
                      <th className="px-4 py-3">Position</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Applied</th>
                      <th className="px-4 py-3">Salary Expected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-sag-mist/50 transition">
                        <td className="table-cell font-semibold text-sag-green">{app.job_title ?? app.job_slug ?? '—'}</td>
                        <td className="table-cell"><StatusBadge status={app.status as ApplicationStatus} /></td>
                        <td className="table-cell text-slate-500">{new Date(app.created_at).toLocaleDateString('id-ID')}</td>
                        <td className="table-cell text-slate-600">{app.expected_salary ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick links */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Link to="/candidate/profile" className="card flex items-center gap-4 p-5 hover:border-sag-green/30 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sag-green/10">
                <User className="h-5 w-5 text-sag-green" />
              </div>
              <div>
                <p className="font-bold text-sag-green">Update Profile & CV</p>
                <p className="text-xs text-slate-500">Keep your information current</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
            </Link>
            <Link to="/jobs" className="card flex items-center gap-4 p-5 hover:border-sag-green/30 transition">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sag-gold/10">
                <Briefcase className="h-5 w-5 text-sag-gold" />
              </div>
              <div>
                <p className="font-bold text-sag-green">Browse Open Positions</p>
                <p className="text-xs text-slate-500">Find your next opportunity</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
