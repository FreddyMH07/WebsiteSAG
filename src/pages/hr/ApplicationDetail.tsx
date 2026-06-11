import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ExternalLink, Save, Plus, Printer } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import CandidateProfileReadOnly from '@/components/hr/CandidateProfileReadOnly';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { ApplicationRow, ApplicationNote, ApplicationStatus, Candidate, CandidateProfile } from '@/types';

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'Applied',        label: 'Applied' },
  { value: 'Screening HR',   label: 'Screening HR' },
  { value: 'Psikotes',       label: 'Psikotes' },
  { value: 'Interview HR',   label: 'Interview HR' },
  { value: 'Interview User', label: 'Interview User' },
  { value: 'Offering',       label: 'Offering' },
  { value: 'Accepted',       label: 'Accepted' },
  { value: 'Rejected',       label: 'Rejected' },
  { value: 'Talent Pool',    label: 'Talent Pool' },
];

export default function HRApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [app, setApp] = useState<ApplicationRow | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candProfile, setCandProfile] = useState<CandidateProfile | null>(null);
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [companyInfo, setCompanyInfo] = useState<{
    name: string; short_name: string | null; logo_url: string | null; address: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('applications').select('*, candidates(*)').eq('id', id).single(),
      supabase.from('application_notes').select('*').eq('application_id', id).order('created_at', { ascending: true }),
    ]).then(async ([{ data: appData }, { data: noteData }]) => {
      if (appData) {
        setApp(appData as ApplicationRow);
        const cand = (appData as any).candidates as Candidate;
        setCandidate(cand);
        setNewStatus(appData.status as ApplicationStatus);
        // Load candidate_profiles using candidate.id
        if (cand?.id) {
          const { data: cp } = await supabase
            .from('candidate_profiles')
            .select('*')
            .eq('candidate_id', cand.id)
            .maybeSingle();
          setCandProfile((cp as CandidateProfile) ?? null);
        }
        const jobId = (appData as Record<string, unknown>).job_id as string | null;
        if (jobId) {
          const { data: jobData } = await supabase
            .from('jobs')
            .select('companies(name, short_name, logo_url, address)')
            .eq('id', jobId)
            .maybeSingle();
          const co = (jobData as Record<string, unknown> | null)?.companies as {
            name: string; short_name: string | null; logo_url: string | null; address: string | null;
          } | null;
          setCompanyInfo(co ?? null);
        }
      }
      setNotes((noteData ?? []) as ApplicationNote[]);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleUpdateStatus = async () => {
    if (!app || !id) return;
    setSaving(true);
    const { error } = await supabase.from('applications').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) { toast('Failed to update status', 'error'); }
    else { setApp({ ...app, status: newStatus }); toast('Status updated!', 'success'); }
    setSaving(false);
  };

  const handleAddNote = async () => {
    if (!id || !newNote.trim() || !user) return;
    setSaving(true);
    const { data, error } = await supabase.from('application_notes').insert({
      application_id: id,
      note: newNote.trim(),
      created_by: user.id,
    }).select().single();
    if (error) { toast('Failed to add note', 'error'); }
    else { setNotes([...notes, data as ApplicationNote]); setNewNote(''); toast('Note added!', 'success'); }
    setSaving(false);
  };

  if (loading) return (
    <HRLayout><div className="flex justify-center py-20"><Spinner size="lg" /></div></HRLayout>
  );
  if (!app) return (
    <HRLayout><p className="text-slate-500">Application not found.</p></HRLayout>
  );

  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <HRLayout>
      {/* Print header — only visible when printing */}
      {(() => {
        const co = companyInfo ?? {
          name: 'PT Sahabat Agro Group',
          short_name: 'SAG',
          logo_url: '/assets/sag/brand/logo-ptsag.png',
          address: null,
        };
        const logoUrl = co.logo_url ?? '/assets/sag/brand/logo-ptsag.png';
        return (
          <div className="hidden print:block print:mb-6">
            <div className="flex items-center gap-4 border-b-2 border-sag-green pb-4">
              <img src={logoUrl} alt={co.name} className="h-16 w-auto object-contain" />
              <div>
                <p className="text-xl font-black text-sag-green">{co.name.toUpperCase()}</p>
                {co.address && <p className="text-xs text-slate-600">{co.address}</p>}
                <p className="text-sm font-bold text-slate-700">EMPLOYMENT APPLICATION FORM — Formulir Lamaran Kerja</p>
                <p className="text-xs text-slate-500">Dicetak: {new Date().toLocaleDateString('id-ID')}</p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="mb-6 print:hidden">
        <Link to="/hr/applications" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sag-green transition mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-sag-green">{app.job_title ?? app.job_slug ?? '—'}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Application ID: {app.id} · Applied {new Date(app.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary text-sm print:hidden"
            >
              <Printer className="mr-2 h-4 w-4" /> Cetak Formulir
            </button>
            <StatusBadge status={app.status as ApplicationStatus} />
          </div>
        </div>
      </div>

      {/* Print-only title */}
      <div className="hidden print:block mb-4">
        <h1 className="text-xl font-black text-sag-green">{app.job_title ?? app.job_slug ?? '—'}</h1>
        <p className="text-sm text-slate-500">Applied: {new Date(app.created_at).toLocaleDateString('id-ID')}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Candidate info */}
          <div className="card p-6">
            <h2 className="mb-4 font-black text-sag-green">Informasi Kandidat</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {[
                ['Nama', candidate?.full_name],
                ['Email', candidate?.email],
                ['No. HP', candidate?.phone],
                ['Domisili', candidate?.domicile],
                ['Pendidikan', candidate?.education],
                ['Jurusan', candidate?.major],
                ['Pengalaman', candidate?.experience_year],
                ['Perusahaan Terakhir', candidate?.current_company],
                ['Jabatan Terakhir', candidate?.current_position],
                ['Ekspektasi Gaji (Profil)', candidate?.expected_salary],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold text-slate-800">{value || '—'}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-4 print:hidden">
              {candidate?.linkedin_url && (
                <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                  LinkedIn <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
              {candidate?.cv_url ? (
                <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-bold text-sag-leaf hover:underline">
                  Lihat CV / Resume <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <span className="text-sm text-slate-400">CV belum diupload</span>
              )}
            </div>
          </div>

          {/* Application details */}
          <div className="card p-6">
            <h2 className="mb-4 font-black text-sag-green">Detail Lamaran</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm mb-4">
              <div>
                <p className="text-xs text-slate-500">Ekspektasi Gaji (Lamar)</p>
                <p className="font-semibold text-slate-800">{app.expected_salary ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Ketersediaan Bergabung</p>
                <p className="font-semibold text-slate-800">{app.availability ?? '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Cover Letter / Motivasi</p>
              <div className="rounded-2xl bg-sag-mist p-4 text-sm text-slate-700 whitespace-pre-line leading-7">
                {app.cover_note || '—'}
              </div>
            </div>
          </div>

          {/* Full SAG Employment Application Form */}
          {candProfile ? (
            <div className="card p-6">
              <h2 className="mb-5 font-black text-sag-green">Formulir Data Diri (SAG)</h2>
              <CandidateProfileReadOnly cp={candProfile} />
            </div>
          ) : (
            <div className="card p-6 print:hidden">
              <p className="text-sm text-slate-400">Kandidat belum mengisi Formulir Data Diri SAG.</p>
            </div>
          )}

          {/* HR Notes — hidden in print */}
          <div className="card p-6 print:hidden">
            <h2 className="mb-4 font-black text-sag-green">Catatan HR</h2>
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400 mb-4">Belum ada catatan.</p>
            ) : (
              <div className="space-y-3 mb-4">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-sag-mist p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-line">{note.note}</p>
                    <p className="mt-2 text-xs text-slate-400">{new Date(note.created_at).toLocaleString('id-ID')}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <textarea
                className="input h-24 resize-none text-sm"
                placeholder="Tambah catatan (hasil interview, observasi screening, dll.)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button onClick={handleAddNote} disabled={saving || !newNote.trim()} className="btn-primary text-sm">
                <Plus className="mr-2 h-4 w-4" /> Tambah Catatan
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar — hidden in print */}
        <div className="space-y-4 print:hidden">
          <div className="card p-6">
            <h3 className="mb-4 font-black text-sag-green">Update Status</h3>
            <select className="input text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button onClick={handleUpdateStatus} disabled={saving} className="btn-primary mt-3 w-full text-sm">
              {saving ? <Spinner size="sm" /> : <><Save className="mr-2 h-4 w-4" />Simpan Status</>}
            </button>
          </div>

          <div className="card p-5 text-sm text-slate-600">
            <p className="font-bold text-sag-green mb-2">Timeline</p>
            <p className="text-xs">Applied: {new Date(app.created_at).toLocaleDateString('id-ID')}</p>
            {app.updated_at && (
              <p className="text-xs mt-1">Last Updated: {new Date(app.updated_at).toLocaleDateString('id-ID')}</p>
            )}
          </div>

          <button onClick={() => window.print()} className="btn-secondary w-full text-sm">
            <Printer className="mr-2 h-4 w-4" /> Cetak Formulir
          </button>
        </div>
      </div>
    </HRLayout>
    </>
  );
}
