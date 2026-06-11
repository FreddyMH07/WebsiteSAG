import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Send, ArrowLeft, LogIn, UserPlus } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { sendApplyNotification } from '@/lib/web3forms';
import { getJobBySlug } from '@/lib/contentful';
import type { ContentfulJob, Candidate } from '@/types';

const schema = z.object({
  expected_salary: z.string().min(1, 'Wajib diisi'),
  availability: z.string().min(1, 'Wajib diisi'),
  cover_note: z.string().min(30, 'Minimal 30 karakter').max(2000),
  consent: z.literal(true, { errorMap: () => ({ message: 'Anda harus menyetujui pemrosesan data pribadi' }) }),
});
type FormData = z.infer<typeof schema>;

export default function Apply() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [job, setJob] = useState<ContentfulJob | null>(null);
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!slug) return;
    getJobBySlug(slug)
      .then((data) => setJob(data as ContentfulJob | null))
      .catch(() => setJob(null))
      .finally(() => {
        if (!user) setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!slug || !user) { setLoading(false); return; }
    (async () => {
      const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
      setCandidate(cand ?? null);
      if (cand?.id) {
        const [{ data: existing }, { data: cp }] = await Promise.all([
          supabase.from('applications').select('id').eq('candidate_id', cand.id).eq('job_slug', slug).maybeSingle(),
          supabase.from('candidate_profiles').select('birth_date,gender,marital_status,nik,address_current,consent_data_truth,consent_pdp,declared_name').eq('candidate_id', cand.id).maybeSingle(),
        ]);
        setAlreadyApplied(!!existing);
        const c = cp as any;
        setProfileComplete(!!(c?.birth_date && c?.gender && c?.marital_status && c?.nik && c?.address_current && c?.consent_data_truth && c?.consent_pdp && c?.declared_name));
      }
      setLoading(false);
    })();
  }, [slug, user]);

  const onSubmit = async (data: FormData) => {
    if (!user || !job || !candidate) return;
    if (alreadyApplied) { toast('Anda sudah melamar posisi ini sebelumnya.', 'error'); return; }

    let cvUrl = candidate.cv_url;

    if (cvFile) {
      const ext = cvFile.name.split('.').pop();
      const path = `${user.id}/${Date.now()}-apply.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('candidate-cv').upload(path, cvFile, { upsert: true });
      if (uploadErr) { toast('Gagal upload CV: ' + uploadErr.message, 'error'); return; }
      const { data: urlData } = supabase.storage.from('candidate-cv').getPublicUrl(path);
      cvUrl = urlData.publicUrl;
      await supabase.from('candidates').update({ cv_url: cvUrl }).eq('user_id', user.id);
    }

    if (!cvUrl) { toast('Silakan upload CV Anda sebelum melamar.', 'error'); return; }

    const { error } = await supabase.from('applications').insert({
      candidate_id: candidate.id,
      job_slug: job.slug,
      job_title: job.title,
      status: 'Applied',
      expected_salary: data.expected_salary,
      availability: data.availability,
      cover_note: data.cover_note,
    });

    if (error) {
      if (error.message.includes('already_applied_this_year')) {
        toast('Anda sudah melamar posisi ini dalam 12 bulan terakhir.', 'error');
      } else if (error.message.includes('profile_incomplete')) {
        toast('Formulir Data Diri belum lengkap. Silakan lengkapi terlebih dahulu.', 'error');
      } else {
        toast('Gagal mengirim lamaran: ' + error.message, 'error');
      }
      return;
    }

    try {
      await sendApplyNotification({
        candidateName: candidate.full_name,
        candidateEmail: candidate.email,
        candidatePhone: candidate.phone ?? '-',
        jobTitle: job.title,
        appliedAt: new Date().toLocaleDateString('id-ID'),
        cvUrl: cvUrl ?? undefined,
        adminDetailUrl: `${window.location.origin}/hr/applications`,
      });
    } catch (_) {
      // Notification failure does not block the application
    }

    navigate('/thank-you', { state: { jobTitle: job.title } });
  };

  if (loading) return (
    <><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div><Footer /></>
  );

  if (!job) return (
    <>
      <Navbar />
      <div className="container-page py-20 text-center">
        <p className="text-xl font-black text-sag-green">Posisi tidak ditemukan.</p>
        <Link to="/jobs" className="btn-primary mt-6">Kembali ke Lowongan</Link>
      </div>
      <Footer />
    </>
  );

  if (!job.isOpen) return (
    <>
      <Navbar />
      <div className="container-page py-20 text-center">
        <p className="text-xl font-black text-red-600">Lowongan ini sudah ditutup.</p>
        <p className="mt-2 text-slate-500">Silakan cek posisi lain yang masih terbuka.</p>
        <Link to="/jobs" className="btn-primary mt-6">Lihat Lowongan Lain</Link>
      </div>
      <Footer />
    </>
  );

  // Not logged in — show auth gate
  if (!user) return (
    <>
      <Navbar />
      <section className="section-pad">
        <div className="container-page max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-sag-gold">Lamar Posisi</p>
          <h1 className="mt-2 text-2xl font-black text-sag-green">{job.title}</h1>
          <p className="mt-3 text-slate-500">Anda perlu masuk atau mendaftar untuk melamar posisi ini.</p>
          <div className="mt-8 grid gap-3">
            <Link
              to="/candidate/login"
              state={{ from: `/apply/${slug}` }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" /> Masuk sebagai Kandidat
            </Link>
            <Link
              to="/candidate/register"
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <UserPlus className="h-4 w-4" /> Daftar Akun Baru
            </Link>
            <Link to={`/jobs/${slug}`} className="text-sm text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Kembali ke Detail Lowongan
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );

  if (alreadyApplied) return (
    <>
      <Navbar />
      <div className="container-page py-20 text-center">
        <p className="text-2xl font-black text-amber-600">Sudah Melamar</p>
        <p className="mt-2 text-slate-600">Anda sudah mengirimkan lamaran untuk posisi <strong>{job.title}</strong>.</p>
        <div className="mt-6 flex justify-center gap-3">
          <Link to="/candidate/dashboard" className="btn-primary">Lihat Lamaran Saya</Link>
          <Link to="/jobs" className="btn-secondary">Lihat Lowongan Lain</Link>
        </div>
      </div>
      <Footer />
    </>
  );

  // Profile not complete — gate before the form
  if (!profileComplete) return (
    <>
      <Navbar />
      <section className="section-pad">
        <div className="container-page max-w-md text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-sag-gold">Satu Langkah Lagi</p>
          <h1 className="mt-2 text-2xl font-black text-sag-green">Lengkapi Formulir Data Diri</h1>
          <p className="mt-3 text-slate-500">
            Sebelum melamar <strong>{job.title}</strong>, Anda perlu mengisi Formulir Data Diri SAG terlebih dahulu
            dan menandatangani pernyataan persetujuan.
          </p>
          <div className="mt-8 grid gap-3">
            <Link
              to="/candidate/profile"
              state={{ from: `/apply/${slug}` }}
              className="btn-primary flex items-center justify-center gap-2"
            >
              Isi Formulir Data Diri →
            </Link>
            <Link to={`/jobs/${slug}`} className="text-sm text-slate-400 hover:text-slate-600 transition">
              <ArrowLeft className="mr-1 inline h-3.5 w-3.5" /> Kembali ke Detail Lowongan
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );

  return (
    <>
      <Navbar />
      <div className="container-page py-7">
        <Link to={`/jobs/${slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sag-green transition">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Detail Lowongan
        </Link>
      </div>

      <section className="pb-20">
        <div className="container-page max-w-2xl">
          <div className="mb-6">
            <h1 className="text-3xl font-black text-sag-green">Lamar: {job.title}</h1>
            <p className="mt-1 text-slate-500">{job.department} · {job.location} · {job.employmentType}</p>
          </div>

          {!candidate?.cv_url && (
            <div className="mb-5 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Anda belum mengupload CV. Upload di bawah ini atau di{' '}
              <Link to="/candidate/profile" className="font-bold underline">halaman profil</Link>.
            </div>
          )}

          <div className="card p-7">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="rounded-2xl bg-sag-mist p-4 text-sm">
                <p className="font-bold text-sag-green">Melamar sebagai: {candidate?.full_name}</p>
                <p className="text-slate-500">{candidate?.email} · {candidate?.phone}</p>
              </div>

              <div>
                <label className="label">Ekspektasi Gaji (IDR) *</label>
                <input {...register('expected_salary')} className="input mt-1" placeholder="mis. 8.000.000 - 10.000.000" defaultValue={candidate?.expected_salary ?? ''} />
                {errors.expected_salary && <p className="mt-1 text-xs text-red-500">{errors.expected_salary.message}</p>}
              </div>

              <div>
                <label className="label">Ketersediaan Bergabung *</label>
                <select {...register('availability')} className="input mt-1">
                  <option value="">Pilih ketersediaan</option>
                  <option value="Immediately">Segera / Immediately</option>
                  <option value="2 weeks">2 Minggu</option>
                  <option value="1 month">1 Bulan</option>
                  <option value="2 months">2 Bulan</option>
                  <option value="3 months">3 Bulan</option>
                </select>
                {errors.availability && <p className="mt-1 text-xs text-red-500">{errors.availability.message}</p>}
              </div>

              <div>
                <label className="label">Cover Letter / Motivasi *</label>
                <textarea
                  {...register('cover_note')}
                  className="input mt-1 h-40 resize-none"
                  placeholder="Ceritakan mengapa Anda adalah kandidat yang tepat untuk posisi ini..."
                />
                {errors.cover_note && <p className="mt-1 text-xs text-red-500">{errors.cover_note.message}</p>}
              </div>

              <div>
                <label className="label">CV / Resume {!candidate?.cv_url && '*'}</label>
                {candidate?.cv_url && (
                  <p className="mt-1 mb-2 text-xs text-green-700">
                    CV sudah ada.{' '}
                    <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="underline">Lihat CV</a>
                  </p>
                )}
                <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 2 * 1024 * 1024) {
                      toast('Ukuran CV maksimal 2MB.', 'error');
                      e.target.value = '';
                      return;
                    }
                    setCvFile(file ?? null);
                  }} />
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
                  <Upload className="mr-2 h-4 w-4" />
                  {cvFile ? cvFile.name : `${candidate?.cv_url ? 'Ganti' : 'Upload'} CV (PDF/DOC, maks 2MB)`}
                </button>
              </div>

              <div className="flex items-start gap-3">
                <input {...register('consent')} type="checkbox" id="consent" className="mt-0.5 h-4 w-4 cursor-pointer accent-sag-green" />
                <label htmlFor="consent" className="cursor-pointer text-xs text-slate-600">
                  Saya menyetujui pemrosesan data pribadi saya untuk keperluan lamaran kerja ini. *
                </label>
              </div>
              {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? <Spinner size="sm" /> : <><Send className="mr-2 h-4 w-4" />Kirim Lamaran</>}
              </button>
            </form>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
