import { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, Save, User, FileText } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { Candidate } from '@/types';

const schema = z.object({
  full_name: z.string().min(2, 'Required'),
  phone: z.string().min(8, 'Required'),
  domicile: z.string().optional(),
  education: z.string().optional(),
  major: z.string().optional(),
  experience_year: z.string().optional(),
  current_company: z.string().optional(),
  current_position: z.string().optional(),
  expected_salary: z.string().optional(),
  linkedin_url: z.string().optional(),
  portfolio_url: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

const educationOptions = ['SMA/SMK', 'D3', 'S1', 'S2', 'S3'];
const experienceOptions = ['Fresh Graduate', '< 1 Year', '1-3 Years', '3-5 Years', '5-10 Years', '10+ Years'];

export default function CandidateProfile() {
  const { user, profile, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const { data } = await supabase.from('candidates').select('*').eq('user_id', user.id).single();
        if (data) {
          const cand = data as unknown as Candidate;
          setCandidate(cand);
          reset({
            full_name: cand.full_name,
            phone: cand.phone ?? '',
            domicile: cand.domicile ?? '',
            education: cand.education ?? '',
            major: cand.major ?? '',
            experience_year: cand.experience_year ?? '',
            current_company: cand.current_company ?? '',
            current_position: cand.current_position ?? '',
            expected_salary: cand.expected_salary ?? '',
            linkedin_url: cand.linkedin_url ?? '',
            portfolio_url: cand.portfolio_url ?? '',
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const uploadCV = async (file: File): Promise<string | null> => {
    if (!user) return null;
    setCvUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('candidate-cv').upload(path, file, { upsert: true });
    setCvUploading(false);
    if (error) { toast('Failed to upload CV: ' + error.message, 'error'); return null; }
    const { data } = supabase.storage.from('candidate-cv').getPublicUrl(path);
    return data.publicUrl;
  };

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    let cvUrl = candidate?.cv_url;

    if (cvFile) {
      const uploaded = await uploadCV(cvFile);
      if (uploaded) cvUrl = uploaded;
    }

    const payload = { ...data, cv_url: cvUrl, updated_at: new Date().toISOString() };

    if (candidate) {
      await supabase.from('candidates').update(payload).eq('user_id', user.id);
    } else {
      await supabase.from('candidates').insert({ user_id: user.id, email: profile?.email ?? '', ...payload });
    }

    await supabase.from('profiles').update({ full_name: data.full_name, phone: data.phone }).eq('id', user.id);
    await refreshProfile();

    toast('Profile updated successfully!', 'success');
    // Reload candidate
    supabase.from('candidates').select('*').eq('user_id', user.id).single().then(({ data: d }) => { if (d) setCandidate(d); });
  };

  if (loading) return (
    <><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div><Footer /></>
  );

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <Navbar />
      <div className="section-pad">
        <div className="container-page max-w-3xl">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-sag-green">My Profile</h1>
            <p className="mt-1 text-slate-500">Keep your profile updated to improve your chances of getting hired.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-lg font-black text-sag-green">
                <User className="h-5 w-5" /> Personal Information
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">Full Name *</label>
                  <input {...register('full_name')} className="input mt-1" />
                  {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
                </div>
                <div>
                  <label className="label">Phone / WhatsApp *</label>
                  <input {...register('phone')} className="input mt-1" placeholder="+62 8xx xxxx xxxx" />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="label">Domicile / City</label>
                  <input {...register('domicile')} className="input mt-1" placeholder="Jakarta, Lampung, etc." />
                </div>
                <div>
                  <label className="label">LinkedIn URL</label>
                  <input {...register('linkedin_url')} className="input mt-1" placeholder="linkedin.com/in/yourname" />
                </div>
                <div className="sm:col-span-2">
                  <label className="label">Portfolio URL</label>
                  <input {...register('portfolio_url')} className="input mt-1" placeholder="github.com/yourname or portfolio link" />
                </div>
              </div>
            </div>

            {/* Education & Experience */}
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-lg font-black text-sag-green">
                <FileText className="h-5 w-5" /> Education & Experience
              </h2>
              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="label">Education Level</label>
                  <select {...register('education')} className="input mt-1">
                    <option value="">Select level</option>
                    {educationOptions.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Major / Field of Study</label>
                  <input {...register('major')} className="input mt-1" placeholder="e.g. Computer Science, Agronomy" />
                </div>
                <div>
                  <label className="label">Years of Experience</label>
                  <select {...register('experience_year')} className="input mt-1">
                    <option value="">Select experience</option>
                    {experienceOptions.map((e) => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Current / Last Company</label>
                  <input {...register('current_company')} className="input mt-1" />
                </div>
                <div>
                  <label className="label">Current / Last Position</label>
                  <input {...register('current_position')} className="input mt-1" />
                </div>
                <div>
                  <label className="label">Expected Salary (IDR)</label>
                  <input {...register('expected_salary')} className="input mt-1" placeholder="e.g. 8.000.000 - 10.000.000" />
                </div>
              </div>
            </div>

            {/* CV Upload */}
            <div className="card p-7">
              <h2 className="flex items-center gap-2 text-lg font-black text-sag-green">
                <Upload className="h-5 w-5" /> CV / Resume
              </h2>
              <div className="mt-4">
                {candidate?.cv_url && (
                  <div className="mb-4 flex items-center gap-3 rounded-2xl bg-green-50 p-3">
                    <FileText className="h-5 w-5 text-green-600" />
                    <span className="flex-1 text-sm font-semibold text-green-700">CV uploaded</span>
                    <a href={candidate.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-green-700 hover:underline">View</a>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && file.size > 2 * 1024 * 1024) {
                      toast('Ukuran CV maksimal 2MB.', 'error');
                      e.target.value = '';
                      return;
                    }
                    setCvFile(file ?? null);
                  }}
                />
                <button type="button" onClick={() => fileRef.current?.click()} className="btn-secondary">
                  <Upload className="mr-2 h-4 w-4" />
                  {cvFile ? cvFile.name : 'Upload CV (PDF/DOC, maks 2MB)'}
                </button>
                {cvUploading && <p className="mt-2 text-sm text-slate-500">Uploading...</p>}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? <Spinner size="sm" /> : <><Save className="mr-2 h-4 w-4" />Save Profile</>}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
