import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, ToggleLeft, ToggleRight, AlertTriangle, X, Search, ExternalLink } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

type JobStatus = 'draft' | 'published' | 'closed';

interface AppStats {
  total: number;
  newApps: number;
  inProgress: number;
  hired: number;
  rejected: number;
}

interface HRJob {
  id: string;
  title: string;
  slug: string;
  company: string;
  department: string;
  location: string;
  employment_type: string;
  level: string | null;
  work_arrangement: string | null;
  description: string | null;
  responsibilities: string | null;
  requirements: string | null;
  benefits: string | null;
  status: JobStatus;
  closing_date: string | null;
  created_at: string;
  stats: AppStats;
}

interface JobForm {
  title: string;
  company: string;
  department: string;
  location: string;
  employment_type: string;
  level: string;
  work_arrangement: string;
  description: string;
  responsibilities: string;
  requirements: string;
  benefits: string;
  closing_date: string;
  status: JobStatus;
}

const EMPTY_FORM: JobForm = {
  title: '',
  company: 'PT Sahabat Agro Group',
  department: '',
  location: '',
  employment_type: 'Full-time',
  level: '',
  work_arrangement: 'On-site',
  description: '',
  responsibilities: '',
  requirements: '',
  benefits: '',
  closing_date: '',
  status: 'draft',
};

const IN_PROGRESS_STATUSES = ['Screening HR', 'Psikotes', 'Interview HR', 'Interview User', 'Offering'];
const EMPTY_STATS: AppStats = { total: 0, newApps: 0, inProgress: 0, hired: 0, rejected: 0 };

// ── Helpers ───────────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
}

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: JobStatus }) {
  const cls =
    status === 'published' ? 'bg-green-100 text-green-700' :
    status === 'closed'    ? 'bg-red-50 text-red-600' :
                             'bg-slate-100 text-slate-500';
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>
      {status === 'published' ? 'Open' : status === 'closed' ? 'Closed' : 'Draft'}
    </span>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="label">{label}{required && <span className="ml-0.5 text-red-500">*</span>}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HRJobs() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<HRJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'published' | 'draft' | 'closed'>('published');
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<HRJob | null>(null);
  const [form, setForm] = useState<JobForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [slugWarning, setSlugWarning] = useState(false);
  const [toggleTarget, setToggleTarget] = useState<HRJob | null>(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from('jobs').select('*').order('created_at', { ascending: false });
    if (error) { toast('Gagal memuat data: ' + error.message, 'error'); setLoading(false); return; }

    const ids = (data ?? []).map((j) => j.id);
    const statsMap: Record<string, AppStats> = {};

    if (ids.length > 0) {
      const { data: appData } = await supabase.from('applications').select('job_id, status').in('job_id', ids);
      (appData ?? []).forEach((row) => {
        if (!row.job_id) return;
        const s = statsMap[row.job_id] ?? { ...EMPTY_STATS };
        s.total++;
        if (row.status === 'Applied') s.newApps++;
        if (IN_PROGRESS_STATUSES.includes(row.status)) s.inProgress++;
        if (row.status === 'Accepted') s.hired++;
        if (row.status === 'Rejected') s.rejected++;
        statsMap[row.job_id] = s;
      });
    }

    setJobs((data ?? []).map((j) => ({ ...j, stats: statsMap[j.id] ?? { ...EMPTY_STATS } })));
    setLoading(false);
  }, [toast]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setSlugWarning(false); setModal('add'); };
  const openEdit = (job: HRJob) => {
    setEditing(job);
    setForm({
      title: job.title, company: job.company, department: job.department,
      location: job.location, employment_type: job.employment_type,
      level: job.level ?? '', work_arrangement: job.work_arrangement ?? '',
      description: job.description ?? '', responsibilities: job.responsibilities ?? '',
      requirements: job.requirements ?? '', benefits: job.benefits ?? '',
      closing_date: job.closing_date ? job.closing_date.split('T')[0] : '',
      status: job.status,
    });
    setSlugWarning(job.stats.total > 0);
    setModal('edit');
  };
  const closeModal = () => { setModal(null); setEditing(null); };

  const handleChange = (field: keyof JobForm, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const computedSlug = modal === 'add' ? slugify(form.title) : editing?.slug ?? '';

  const handleSave = async () => {
    if (!form.title.trim()) { toast('Judul posisi wajib diisi.', 'error'); return; }
    if (!form.company.trim()) { toast('Nama perusahaan wajib diisi.', 'error'); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(), company: form.company.trim(),
      department: form.department.trim(), location: form.location.trim(),
      employment_type: form.employment_type, level: form.level || null,
      work_arrangement: form.work_arrangement || null,
      description: form.description || null, responsibilities: form.responsibilities || null,
      requirements: form.requirements || null, benefits: form.benefits || null,
      closing_date: form.closing_date || null, status: form.status,
    };
    if (modal === 'add') {
      const { error } = await supabase.from('jobs').insert({ ...payload, slug: computedSlug || slugify(form.title) });
      if (error) { toast('Gagal menyimpan: ' + error.message, 'error'); setSaving(false); return; }
      toast('Lowongan berhasil ditambahkan.', 'success');
    } else if (editing) {
      const { error } = await supabase.from('jobs').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', editing.id);
      if (error) { toast('Gagal menyimpan: ' + error.message, 'error'); setSaving(false); return; }
      toast('Lowongan berhasil diperbarui.', 'success');
    }
    setSaving(false); closeModal(); fetchJobs();
  };

  const handleToggle = async (job: HRJob) => {
    const next: JobStatus = job.status === 'published' ? 'closed' : 'published';
    const { error } = await supabase.from('jobs').update({ status: next, updated_at: new Date().toISOString() }).eq('id', job.id);
    if (error) toast('Gagal mengubah status: ' + error.message, 'error');
    else toast(`Status diubah ke "${next}".`, 'success');
    setToggleTarget(null); fetchJobs();
  };

  const q = search.toLowerCase();
  const displayed = jobs
    .filter((j) => j.status === tab)
    .filter((j) => !q || j.title.toLowerCase().includes(q) || j.department.toLowerCase().includes(q))
    .sort((a, b) => b.stats.total - a.stats.total);

  const tabCounts = { published: jobs.filter((j) => j.status === 'published').length, draft: jobs.filter((j) => j.status === 'draft').length, closed: jobs.filter((j) => j.status === 'closed').length };

  return (
    <HRLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-sag-green">Manajemen Lowongan</h1>
          <p className="mt-0.5 text-sm text-slate-500">Kelola & pantau pelamar per posisi</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Tambah Lowongan
        </button>
      </div>

      {/* Tabs + Search */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-2xl bg-white p-1 shadow-sm ring-1 ring-slate-100">
          {(['published', 'draft', 'closed'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-xl px-4 py-1.5 text-sm font-semibold transition ${tab === t ? 'bg-sag-green text-white shadow' : 'text-slate-500 hover:text-sag-green'}`}>
              {t === 'published' ? 'Open' : t === 'draft' ? 'Draft' : 'Closed'}
              <span className="ml-1.5 opacity-70 text-xs">({tabCounts[t]})</span>
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input pl-9 pr-4 text-sm w-56"
            placeholder="Cari judul / departemen…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : displayed.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            {search ? 'Tidak ada lowongan yang cocok.' : `Tidak ada lowongan "${tab}".`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Posisi</th>
                  <th className="px-4 py-3">Dept / Tipe</th>
                  <th className="px-4 py-3">Lokasi</th>
                  <th className="px-4 py-3">Closing</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">New</th>
                  <th className="px-4 py-3 text-center">Progress</th>
                  <th className="px-4 py-3 text-center">H / R</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((job) => (
                  <tr key={job.id} className="border-b border-slate-50 hover:bg-sag-mist/40 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{job.title}</span>
                        <a href={`/jobs/${job.slug}`} target="_blank" rel="noopener noreferrer"
                          className="text-slate-300 hover:text-sag-gold transition">
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      <div>{job.department}</div>
                      <div className="text-xs">{job.employment_type}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{job.location}</td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{fmtDate(job.closing_date)}</td>
                    <td className="px-4 py-3 text-center">
                      {job.stats.total > 0 ? (
                        <Link to={`/hr/applications?job=${job.slug}`}
                          className="inline-block font-bold text-sag-green hover:underline">
                          {job.stats.total}
                        </Link>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {job.stats.newApps > 0 ? (
                        <span className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {job.stats.newApps}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {job.stats.inProgress > 0 ? (
                        <span className="inline-block rounded-full bg-purple-100 px-2 py-0.5 text-xs font-bold text-purple-700">
                          {job.stats.inProgress}
                        </span>
                      ) : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center text-xs font-semibold text-slate-600">
                      <span className="text-green-600">{job.stats.hired}</span>
                      {' / '}
                      <span className="text-red-500">{job.stats.rejected}</span>
                    </td>
                    <td className="px-4 py-3 text-center"><StatusBadge status={job.status} /></td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(job)} title="Edit"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sag-green transition">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => setToggleTarget(job)}
                          title={job.status === 'published' ? 'Tutup' : 'Buka'}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-amber-600 transition">
                          {job.status === 'published'
                            ? <ToggleRight className="h-4 w-4 text-green-600" />
                            : <ToggleLeft className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toggle confirm */}
      {toggleTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-sm p-6">
            <p className="font-bold text-sag-green">
              {toggleTarget.status === 'published' ? 'Tutup Lowongan?' : 'Buka Kembali Lowongan?'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              <strong>{toggleTarget.title}</strong> akan diubah ke{' '}
              <strong>{toggleTarget.status === 'published' ? '"closed"' : '"published"'}</strong>.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setToggleTarget(null)} className="btn-secondary text-sm">Batal</button>
              <button onClick={() => handleToggle(toggleTarget)} className="btn-primary text-sm">Ya, Ubah</button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10">
          <div className="card w-full max-w-2xl p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-sag-green">
                {modal === 'add' ? 'Tambah Lowongan' : 'Edit Lowongan'}
              </h2>
              <button onClick={closeModal} className="rounded-full p-1 text-slate-400 hover:text-red-500 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            {slugWarning && (
              <div className="mb-4 flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  Lowongan ini sudah memiliki <strong>{editing?.stats.total}</strong> lamaran.
                  Slug tidak dapat diubah untuk menjaga konsistensi data lamaran.
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 px-4 py-2 text-xs text-slate-500">
                Slug:{' '}
                <span className="font-mono font-semibold text-slate-700">
                  {modal === 'add' ? (computedSlug || '(akan dibuat otomatis)') : editing?.slug}
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Judul Posisi" required>
                  <input className="input" value={form.title} onChange={(e) => handleChange('title', e.target.value)} placeholder="mis. Finance & Accounting Staff" />
                </Field>
                <Field label="Perusahaan" required>
                  <input className="input" value={form.company} onChange={(e) => handleChange('company', e.target.value)} />
                </Field>
                <Field label="Departemen">
                  <input className="input" value={form.department} onChange={(e) => handleChange('department', e.target.value)} placeholder="mis. Finance & Accounting" />
                </Field>
                <Field label="Lokasi">
                  <input className="input" value={form.location} onChange={(e) => handleChange('location', e.target.value)} placeholder="mis. Pekanbaru, Riau" />
                </Field>
                <Field label="Tipe Pekerjaan">
                  <select className="input" value={form.employment_type} onChange={(e) => handleChange('employment_type', e.target.value)}>
                    <option>Full-time</option><option>Part-time</option><option>Contract</option><option>Internship</option><option>Freelance</option>
                  </select>
                </Field>
                <Field label="Level">
                  <select className="input" value={form.level} onChange={(e) => handleChange('level', e.target.value)}>
                    <option value="">— Pilih Level —</option>
                    <option>Entry Level</option><option>Junior</option><option>Mid Level</option><option>Senior</option><option>Manager</option><option>Director</option>
                  </select>
                </Field>
                <Field label="Pengaturan Kerja">
                  <select className="input" value={form.work_arrangement} onChange={(e) => handleChange('work_arrangement', e.target.value)}>
                    <option>On-site</option><option>Remote</option><option>Hybrid</option>
                  </select>
                </Field>
                <Field label="Closing Date">
                  <input className="input" type="date" value={form.closing_date} onChange={(e) => handleChange('closing_date', e.target.value)} />
                </Field>
              </div>

              <Field label="Deskripsi Pekerjaan">
                <textarea className="input h-28 resize-y" value={form.description} onChange={(e) => handleChange('description', e.target.value)} placeholder="Gambaran umum posisi…" />
              </Field>
              <Field label="Tanggung Jawab">
                <textarea className="input h-28 resize-y" value={form.responsibilities} onChange={(e) => handleChange('responsibilities', e.target.value)} placeholder="Satu tanggung jawab per baris…" />
              </Field>
              <Field label="Persyaratan">
                <textarea className="input h-28 resize-y" value={form.requirements} onChange={(e) => handleChange('requirements', e.target.value)} placeholder="Satu persyaratan per baris…" />
              </Field>
              <Field label="Benefit">
                <textarea className="input h-20 resize-y" value={form.benefits} onChange={(e) => handleChange('benefits', e.target.value)} placeholder="Satu benefit per baris…" />
              </Field>
              <Field label="Status">
                <select className="input" value={form.status} onChange={(e) => handleChange('status', e.target.value as JobStatus)}>
                  <option value="draft">Draft (tidak terlihat kandidat)</option>
                  <option value="published">Published / Open (terlihat kandidat)</option>
                  <option value="closed">Closed (ditutup)</option>
                </select>
              </Field>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="btn-secondary">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Spinner size="sm" /> : modal === 'add' ? 'Simpan Lowongan' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRLayout>
  );
}
