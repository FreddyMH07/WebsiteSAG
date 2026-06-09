import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/common/Spinner';
import SEO from '@/components/common/SEO';
import { useLang } from '@/hooks/useLang';
import { sagAssets } from '@/data/siteContent';

const schema = z.object({
  fullName: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  phone: z.string().min(8, 'Nomor HP wajib diisi'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirmPassword: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: 'Anda harus menyetujui pernyataan di atas' }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});
type FormData = z.infer<typeof schema>;

export default function CandidateRegister() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [showPw, setShowPw] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerErr('');
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { full_name: data.fullName } },
    });
    if (error) { setServerErr(error.message); return; }

    if (authData.user) {
      await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
        role: 'candidate',
        status: 'active',
      });
      await supabase.from('candidates').insert({
        user_id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone,
      });
    }

    navigate('/candidate/login', { state: { registered: true } });
  };

  return (
    <>
      <SEO
        title="Daftar Kandidat | Career PT Sahabat Agro Group"
        description="Buat akun kandidat untuk melamar posisi di PT Sahabat Agro Group dan pantau status lamaran Anda."
        canonical="/candidate/register"
      />

      <div className="flex min-h-screen">

        {/* ── Left panel ───────────────────────────────────────────────── */}
        <div className="relative hidden w-1/2 flex-col lg:flex">
          <img
            src={sagAssets.team}
            alt="SAG Team"
            className="absolute inset-0 h-full w-full object-cover scale-105 blur-sm"
          />
          <div className="absolute inset-0 bg-sag-forest/92" />

          <div className="relative flex h-full flex-col p-12">
            {/* Logo badge */}
            <Link to="/" className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-sag-soft">
                <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sag-gold">{t('Portal Karir Resmi', 'Official Career Portal')}</p>
                <p className="text-sm font-black text-white">PT Sahabat Agro Group</p>
              </div>
            </Link>

            {/* Center content */}
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sag-gold mb-3">
                {t('Langkah Pertama Kariermu', 'Your First Career Step')}
              </p>
              <h2 className="text-4xl font-black text-white leading-tight">
                {t('Bergabung dengan', 'Join the')}<br />
                <span className="text-sag-gold">{t('Keluarga SAG', 'SAG Family')}</span>
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">
                {t(
                  'Daftar sekarang dan akses ratusan peluang karir di perkebunan, pabrik, dan kantor pusat SAG.',
                  'Register now and access career opportunities across SAG plantations, mills, and headquarters.',
                )}
              </p>

              <div className="mt-8 space-y-3">
                {[
                  { en: 'Apply to multiple positions easily', id: 'Lamar beberapa posisi dengan mudah' },
                  { en: 'Upload and manage your CV securely', id: 'Upload dan kelola CV Anda dengan aman' },
                  { en: 'Track application status in real-time', id: 'Pantau status lamaran secara real-time' },
                ].map((item) => (
                  <div key={item.en} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-sag-gold flex-shrink-0" />
                    {t(item.id, item.en)}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs italic text-white/25">"From Plantation to Production"</p>
          </div>
        </div>

        {/* ── Form panel ───────────────────────────────────────────────── */}
        <div className="flex w-full flex-col items-center justify-center bg-sag-mist px-6 py-10 lg:w-1/2">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow-sag-soft">
                <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sag-gold">{t('Portal Karir', 'Career Portal')}</p>
                <p className="text-sm font-black text-sag-green">PT Sahabat Agro Group</p>
              </div>
            </div>

            <div className="card p-8 shadow-sag-hover">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-sag-green">{t('Buat Akun', 'Create Account')}</h1>
                <p className="mt-1 text-sm text-slate-500">{t('Pendaftaran kandidat baru', 'New candidate registration')}</p>
              </div>

              {serverErr && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">{serverErr}</div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">{t('Nama Lengkap', 'Full Name')} *</label>
                  <input {...register('fullName')} className="input mt-1" placeholder={t('Nama lengkap Anda', 'Your full name')} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="label">{t('Alamat Email', 'Email Address')} *</label>
                  <input {...register('email')} type="email" className="input mt-1" placeholder="your@email.com" autoComplete="email" />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">{t('No. HP / WhatsApp', 'Phone / WhatsApp')} *</label>
                  <input {...register('phone')} className="input mt-1" placeholder="+62 8xx xxxx xxxx" />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
                <div>
                  <label className="label">{t('Password', 'Password')} *</label>
                  <div className="relative mt-1">
                    <input {...register('password')} type={showPw ? 'text' : 'password'} className="input pr-10" placeholder={t('Minimal 8 karakter', 'Minimum 8 characters')} autoComplete="new-password" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="label">{t('Konfirmasi Password', 'Confirm Password')} *</label>
                  <input {...register('confirmPassword')} type="password" className="input mt-1" placeholder={t('Ulangi password Anda', 'Repeat your password')} autoComplete="new-password" />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
                </div>
                <div className="flex items-start gap-3 pt-1">
                  <input {...register('consent')} type="checkbox" id="consent" className="mt-0.5 h-4 w-4 cursor-pointer accent-sag-green flex-shrink-0" />
                  <label htmlFor="consent" className="cursor-pointer text-xs leading-5 text-slate-600">
                    {t(
                      'Saya menyetujui pemrosesan data pribadi saya untuk keperluan rekrutmen di PT Sahabat Agro Group.',
                      'I agree to the processing of my personal data for recruitment purposes at PT Sahabat Agro Group.',
                    )} *
                  </label>
                </div>
                {errors.consent && <p className="text-xs text-red-500">{errors.consent.message}</p>}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                  {isSubmitting ? <Spinner size="sm" /> : t('Buat Akun', 'Create Account')}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-500">
                {t('Sudah punya akun?', 'Already have an account?')}{' '}
                <Link to="/candidate/login" className="font-bold text-sag-green hover:underline">{t('Masuk', 'Sign In')}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
