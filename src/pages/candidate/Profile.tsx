import { useState, useEffect, useRef, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Upload, FileText, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import { getActiveJobs } from '@/lib/jobs';
import ProfileStepper from '@/components/candidate/profile/ProfileStepper';
import Section1Position from '@/components/candidate/profile/Section1Position';
import Section2PersonalData from '@/components/candidate/profile/Section2PersonalData';
import Section3Family from '@/components/candidate/profile/Section3Family';
import Section4FormalEdu from '@/components/candidate/profile/Section4FormalEdu';
import Section5NonFormalEdu from '@/components/candidate/profile/Section5NonFormalEdu';
import Section6Languages from '@/components/candidate/profile/Section6Languages';
import Section7Organizations from '@/components/candidate/profile/Section7Organizations';
import Section8WorkExp from '@/components/candidate/profile/Section8WorkExp';
import Section9References from '@/components/candidate/profile/Section9References';
import Section10OtherInfo from '@/components/candidate/profile/Section10OtherInfo';
import Section11Declaration from '@/components/candidate/profile/Section11Declaration';
import type { Candidate, CandidateProfile, CandidateProfilePatch, ContentfulJob } from '@/types';

// Sections 5 and 7 are optional (non-formal edu / organizations)
const REQUIRED_IDS = [1, 2, 3, 4, 6, 8, 9, 10, 11];

function getCompleteSections(p: CandidateProfile | null): number[] {
  if (!p) return [5, 7]; // optional sections always count as done
  const done: number[] = [5, 7];
  if (p.applied_position) done.push(1);
  if (p.birth_place && p.birth_date && p.gender && p.marital_status && p.nik && p.address_current && p.address_ktp) done.push(2);
  if ((p.family_members ?? []).length > 0) done.push(3);
  if ((p.formal_education ?? []).length > 0) done.push(4);
  if ((p.languages ?? []).length > 0) done.push(6);
  if ((p.work_experiences ?? []).length > 0) done.push(8);
  if ((p.references_data ?? []).length > 0) done.push(9);
  const o = p.other_info ?? {};
  if (o.emergency_name && o.emergency_phone && o.why_join) done.push(10);
  if (p.consent_data_truth && p.consent_pdp && p.declared_name) done.push(11);
  return done;
}

export default function CandidateProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [candProfile, setCandProfile] = useState<CandidateProfile | null>(null);
  const [jobs, setJobs] = useState<ContentfulJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState(1);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getActiveJobs().then(setJobs).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    (async () => {
      try {
        const { data: cand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
        setCandidate(cand ?? null);
        if (cand?.id) {
          const { data: cp } = await supabase.from('candidate_profiles').select('*').eq('candidate_id', cand.id).maybeSingle();
          setCandProfile((cp as CandidateProfile) ?? null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const handleSave = useCallback(async (patch: CandidateProfilePatch) => {
    if (!user || !candidate) return;
    const { full_name, phone, ...profileFields } = patch;

    try {
      // 1. Update candidates row if name/phone in patch
      if (full_name !== undefined || phone !== undefined) {
        await supabase.from('candidates').update({
          ...(full_name !== undefined && { full_name }),
          ...(phone !== undefined && { phone }),
          updated_at: new Date().toISOString(),
        }).eq('user_id', user.id);
        await supabase.from('profiles').update({
          ...(full_name !== undefined && { full_name }),
          ...(phone !== undefined && { phone }),
        }).eq('id', user.id);
        await refreshProfile();
      }

      // 2. Upsert candidate_profiles
      if (Object.keys(profileFields).length > 0) {
        if (candProfile?.id) {
          const { error } = await supabase
            .from('candidate_profiles')
            .update({ ...profileFields, updated_at: new Date().toISOString() })
            .eq('id', candProfile.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('candidate_profiles')
            .insert({ candidate_id: candidate.id, ...profileFields });
          if (error) throw error;
        }
      }

      // 3. Reload fresh state
      const { data: newCand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
      if (newCand) setCandidate(newCand);
      const { data: newCp } = await supabase.from('candidate_profiles').select('*').eq('candidate_id', candidate.id).maybeSingle();
      setCandProfile((newCp as CandidateProfile) ?? null);

      toast('Tersimpan!', 'success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast('Gagal menyimpan: ' + msg, 'error');
    }
  }, [user, candidate, candProfile, refreshProfile, toast]);

  const handleUploadCV = async () => {
    if (!user || !cvFile) return;
    setCvUploading(true);
    const ext = cvFile.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('candidate-cv').upload(path, cvFile, { upsert: true });
    if (error) { toast('Gagal upload CV: ' + error.message, 'error'); setCvUploading(false); return; }
    const { data: urlData } = supabase.storage.from('candidate-cv').getPublicUrl(path);
    await supabase.from('candidates').update({ cv_url: urlData.publicUrl }).eq('user_id', user.id);
    const { data: newCand } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
    if (newCand) setCandidate(newCand);
    setCvFile(null);
    toast('CV berhasil diupload!', 'success');
    setCvUploading(false);
  };

  if (loading) return (
    <><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div><Footer /></>
  );

  const completeSections = getCompleteSections(candProfile);
  const doneRequired = REQUIRED_IDS.filter((id) => completeSections.includes(id)).length;
  const pct = Math.round((doneRequired / REQUIRED_IDS.length) * 100);
  const isProfileComplete = doneRequired === REQUIRED_IDS.length;

  const sp = { profile: candProfile, onSave: handleSave };

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Navbar />
      <div className="section-pad">
        <div className="container-page max-w-4xl">
          {/* Header + progress */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-sag-green">Formulir Lamaran Kerja</h1>
              <p className="mt-1 text-slate-500">Isi semua seksi secara bertahap. Data tersimpan per seksi.</p>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-sag-green">{doneRequired}/{REQUIRED_IDS.length} Seksi Wajib</div>
              <div className="mt-1 h-2.5 w-44 overflow-hidden rounded-full bg-slate-100">
                <div className="h-2.5 rounded-full bg-sag-green transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <div className="mt-0.5 text-xs text-slate-400">{pct}% kelengkapan profil</div>
              {isProfileComplete && (
                <div className="mt-1 flex items-center justify-end gap-1 text-xs font-bold text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Profil Lengkap — Siap Melamar
                </div>
              )}
            </div>
          </div>

          {/* CV strip */}
          <div className="card mb-5 flex flex-wrap items-center gap-4 p-4">
            <FileText className="h-5 w-5 flex-shrink-0 text-sag-green" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-sag-green">CV / Resume</p>
              {candidate?.cv_url
                ? <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 underline truncate block">CV sudah ada — klik untuk melihat</a>
                : <p className="text-xs text-red-500">Belum ada CV. Upload sebelum melamar.</p>}
            </div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && file.size > 2 * 1024 * 1024) { toast('Ukuran CV maks 2MB.', 'error'); e.target.value = ''; return; }
                setCvFile(file ?? null);
              }} />
            {cvFile ? (
              <div className="flex items-center gap-2">
                <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs max-w-[140px] truncate">{cvFile.name}</span>
                <button type="button" onClick={handleUploadCV} disabled={cvUploading} className="btn-primary py-1 text-xs">
                  {cvUploading ? <Spinner size="sm" /> : 'Simpan CV'}
                </button>
                <button type="button" onClick={() => setCvFile(null)} className="text-xs text-slate-400 hover:text-red-500">Batal</button>
              </div>
            ) : (
              <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary py-1.5 text-xs">
                <Upload className="mr-1.5 h-3.5 w-3.5" />
                {candidate?.cv_url ? 'Ganti CV' : 'Upload CV'}
              </button>
            )}
          </div>

          {/* Stepper tabs */}
          <ProfileStepper current={activeSection} completeSections={completeSections} onChange={setActiveSection} />

          {/* Active section form */}
          <div className="card p-6 sm:p-8">
            {activeSection === 1  && <Section1Position {...sp} jobs={jobs} />}
            {activeSection === 2  && <Section2PersonalData {...sp} candidate={candidate} email={profile?.email ?? ''} />}
            {activeSection === 3  && <Section3Family {...sp} />}
            {activeSection === 4  && <Section4FormalEdu {...sp} />}
            {activeSection === 5  && <Section5NonFormalEdu {...sp} />}
            {activeSection === 6  && <Section6Languages {...sp} />}
            {activeSection === 7  && <Section7Organizations {...sp} />}
            {activeSection === 8  && <Section8WorkExp {...sp} />}
            {activeSection === 9  && <Section9References {...sp} />}
            {activeSection === 10 && <Section10OtherInfo {...sp} />}
            {activeSection === 11 && <Section11Declaration {...sp} />}
          </div>

          {/* Prev / Next navigation */}
          <div className="mt-4 flex justify-between">
            {activeSection > 1
              ? <button type="button" onClick={() => setActiveSection((s) => s - 1)} className="btn-secondary">← Sebelumnya</button>
              : <span />}
            {activeSection < 11 &&
              <button type="button" onClick={() => setActiveSection((s) => s + 1)} className="btn-primary">Berikutnya →</button>}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
