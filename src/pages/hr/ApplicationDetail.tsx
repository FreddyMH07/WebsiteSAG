import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, ExternalLink, Save, Plus } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import StatusBadge from '@/components/common/StatusBadge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { ApplicationRow, ApplicationNote, ApplicationStatus, Candidate } from '@/types';

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
  const [notes, setNotes] = useState<ApplicationNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<ApplicationStatus>('Applied');
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('applications').select('*, candidates(*), jobs(title, department, location)').eq('id', id).single(),
      supabase.from('application_notes').select('*').eq('application_id', id).order('created_at', { ascending: true }),
    ]).then(([{ data: appData }, { data: noteData }]) => {
      if (appData) {
        setApp(appData as ApplicationRow);
        setCandidate((appData as any).candidates as Candidate);
        setNewStatus(appData.status as ApplicationStatus);
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
      <div className="mb-6">
        <Link to="/hr/applications" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-sag-green transition mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Applications
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-sag-green">{(app as any).jobs?.title ?? app.job_slug ?? '—'}</h1>
            <p className="mt-1 text-sm text-slate-500">
              Application ID: {app.id} · Applied {new Date(app.created_at).toLocaleDateString('id-ID')}
            </p>
          </div>
          <StatusBadge status={app.status as ApplicationStatus} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {/* Candidate info */}
          <div className="card p-6">
            <h2 className="mb-4 font-black text-sag-green">Candidate Information</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              {[
                ['Name', candidate?.full_name],
                ['Email', candidate?.email],
                ['Phone', candidate?.phone],
                ['Domicile', candidate?.domicile],
                ['Education', candidate?.education],
                ['Major', candidate?.major],
                ['Experience', candidate?.experience_year],
                ['Current Company', candidate?.current_company],
                ['Current Position', candidate?.current_position],
                ['Expected Salary (Profile)', candidate?.expected_salary],
              ].map(([label, value]) => (
                <div key={label as string}>
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="font-semibold text-slate-800">{value || '—'}</p>
                </div>
              ))}
            </div>
            {candidate?.linkedin_url && (
              <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm text-blue-600 hover:underline">
                LinkedIn <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            {candidate?.cv_url && (
              <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="ml-4 mt-4 inline-flex items-center gap-1 text-sm text-sag-leaf hover:underline">
                View CV <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {/* Application details */}
          <div className="card p-6">
            <h2 className="mb-4 font-black text-sag-green">Application Details</h2>
            <div className="grid gap-4 sm:grid-cols-2 text-sm mb-4">
              <div>
                <p className="text-xs text-slate-500">Expected Salary (Applied)</p>
                <p className="font-semibold text-slate-800">{app.expected_salary ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Availability to Join</p>
                <p className="font-semibold text-slate-800">{app.availability ?? '—'}</p>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 mb-1">Cover Letter / Motivation</p>
              <div className="rounded-2xl bg-sag-mist p-4 text-sm text-slate-700 whitespace-pre-line leading-7">
                {app.cover_note || '—'}
              </div>
            </div>
          </div>

          {/* HR Notes */}
          <div className="card p-6">
            <h2 className="mb-4 font-black text-sag-green">HR Notes</h2>
            {notes.length === 0 ? (
              <p className="text-sm text-slate-400 mb-4">No notes yet.</p>
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
                placeholder="Add a note (interview result, screening observation, etc.)..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button onClick={handleAddNote} disabled={saving || !newNote.trim()} className="btn-primary text-sm">
                <Plus className="mr-2 h-4 w-4" /> Add Note
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="mb-4 font-black text-sag-green">Update Status</h3>
            <select className="input text-sm" value={newStatus} onChange={(e) => setNewStatus(e.target.value as ApplicationStatus)}>
              {STATUS_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            <button onClick={handleUpdateStatus} disabled={saving} className="btn-primary mt-3 w-full text-sm">
              {saving ? <Spinner size="sm" /> : <><Save className="mr-2 h-4 w-4" />Save Status</>}
            </button>
          </div>

          <div className="card p-5 text-sm text-slate-600">
            <p className="font-bold text-sag-green mb-2">Timeline</p>
            <p className="text-xs">Applied: {new Date(app.created_at).toLocaleDateString('id-ID')}</p>
            {app.updated_at && (
              <p className="text-xs mt-1">Last Updated: {new Date(app.updated_at).toLocaleDateString('id-ID')}</p>
            )}
          </div>
        </div>
      </div>
    </HRLayout>
    </>
  );
}
