import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/common/Spinner';
import SEO from '@/components/common/SEO';
import { useLang } from '@/hooks/useLang';
import { sagAssets, companyStats } from '@/data/siteContent';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});
type FormData = z.infer<typeof schema>;

export default function CandidateLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLang();
  const from = (location.state as { from?: string })?.from ?? '/candidate/dashboard';
  const registered = (location.state as { registered?: boolean })?.registered;

  const [showPw, setShowPw] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerErr('');
    const { error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) { setServerErr(t('Email atau password salah.', 'Invalid email or password.')); return; }
    navigate(from, { replace: true });
  };

  return (
    <>
      <SEO
        title="Masuk Kandidat | Career PT Sahabat Agro Group"
        description="Masuk ke portal karir PT Sahabat Agro Group untuk mengelola lamaran dan profil Anda."
        canonical="/candidate/login"
        noIndex={false}
      />

      <div className="flex min-h-screen">

        {/* ── Left panel ────────────────────────────────────────────────── */}
        <div className="relative hidden w-1/2 flex-col lg:flex">
          <img
            src={sagAssets.heroPlantation}
            alt="SAG Plantation"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-sag-forest/92" />

          <div className="relative flex h-full flex-col p-12">
            {/* Logo badge */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-sag-soft">
                <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sag-gold">{t('Portal Karir Resmi', 'Official Career Portal')}</p>
                <p className="text-sm font-black text-white">PT Sahabat Agro Group</p>
              </div>
            </Link>

            {/* Center */}
            <div className="flex flex-1 flex-col justify-center">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sag-gold mb-3">
                {t('Bergabunglah dengan Tim Kami', 'Join Our Team')}
              </p>
              <h2 className="text-4xl font-black text-white leading-tight">
                {t('Mulai Kariermu', 'Start Your Career')}<br />
                <span className="text-sag-gold">{t('di Agribisnis', 'in Agribusiness')}</span>
              </h2>
              <p className="mt-5 max-w-xs text-sm leading-7 text-white/55">
                {t(
                  'Kelola lamaran kerja Anda, pantau progres seleksi, dan raih kesempatan karir terbaik.',
                  'Manage your job applications, track selection progress, and seize the best career opportunities.',
                )}
              </p>

              {/* Stats */}
              <div className="mt-9 grid grid-cols-4 gap-3">
                {companyStats.map((s) => (
                  <div key={s.value} className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur-sm">
                    <p className="text-xl font-black text-sag-gold">{s.value}</p>
                    <p className="mt-1 text-[10px] leading-4 text-white/50">{t(s.label, s.labelEn)}</p>
                  </div>
                ))}
              </div>

              {/* Feature highlights */}
              <div className="mt-8 space-y-3">
                {[
                  { en: 'Track all your applications in one place', id: 'Pantau semua lamaran dalam satu tempat' },
                  { en: 'Get notified on application status updates', id: 'Notifikasi update status lamaran otomatis' },
                  { en: 'Securely upload your CV and documents', id: 'Upload CV dan dokumen dengan aman' },
                ].map((item) => (
                  <div key={item.en} className="flex items-center gap-3 text-sm text-white/60">
                    <span className="h-1.5 w-1.5 rounded-full bg-sag-gold flex-shrink-0" />
                    {t(item.id, item.en)}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom */}
            <p className="text-xs italic text-white/25">"From Plantation to Production"</p>
          </div>
        </div>

        {/* ── Right panel ───────────────────────────────────────────────── */}
        <div className="flex w-full flex-col items-center justify-center bg-sag-mist px-6 py-12 lg:w-1/2">
          <div className="w-full max-w-sm">

            {/* Mobile logo */}
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="h-10 w-10 rounded-xl bg-white p-1.5 shadow-sag-soft">
                <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-sag-gold">{t('Portal Karir', 'Career Portal')}</p>
                <p className="text-sm font-black text-sag-green">PT Sahabat Agro Group</p>
              </div>
            </div>

            <div className="card p-8 shadow-sag-hover">
              <div className="mb-7">
                <h1 className="text-2xl font-black text-sag-green">{t('Masuk Akun', 'Sign In')}</h1>
                <p className="mt-1 text-sm text-slate-500">{t('Akses portal karir Anda', 'Access your career portal')}</p>
              </div>

              {registered && (
                <div className="mb-5 rounded-2xl border border-green-200 bg-green-50 p-3.5 text-sm text-green-700">
                  ✅ {t('Akun dibuat! Cek email untuk verifikasi, lalu masuk.', 'Account created! Check your email to verify, then sign in.')}
                </div>
              )}

              {serverErr && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-600">
                  {serverErr}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="label">{t('Alamat Email', 'Email Address')}</label>
                  <input
                    {...register('email')}
                    type="email"
                    className="input mt-1"
                    placeholder="nama@email.com"
                    autoComplete="email"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="label">{t('Password', 'Password')}</label>
                  <div className="relative mt-1">
                    <input
                      {...register('password')}
                      type={showPw ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder={t('Password Anda', 'Your password')}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                  <div className="mt-1.5 text-right">
                    <Link to="/forgot-password" className="text-xs text-slate-400 hover:text-sag-green transition">
                      {t('Lupa Password?', 'Forgot password?')}
                    </Link>
                  </div>
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                  {isSubmitting ? <Spinner size="sm" /> : t('Masuk', 'Sign In')}
                </button>
              </form>

              <div className="mt-6 space-y-2 text-center">
                <p className="text-sm text-slate-500">
                  {t('Belum punya akun?', "Don't have an account?")}{' '}
                  <Link to="/candidate/register" className="font-bold text-sag-green hover:underline">
                    {t('Daftar Sekarang', 'Register')}
                  </Link>
                </p>
                <p className="text-xs text-slate-400">
                  <Link to="/hr/login" className="hover:text-sag-green hover:underline transition">
                    {t('Login sebagai HR Admin', 'HR Admin? Sign in here')}
                  </Link>
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              {t('Dengan masuk, Anda menyetujui', 'By signing in, you agree to our')}{' '}
              <Link to="/contact" className="hover:underline">{t('kebijakan privasi', 'privacy policy')}</Link> SAG.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
