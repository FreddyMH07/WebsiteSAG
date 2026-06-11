import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, KeyRound, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/common/Spinner';
import { sagAssets } from '@/data/siteContent';

const schema = z.object({
  password: z.string().min(8, 'Password minimal 8 karakter'),
  confirm: z.string(),
}).refine((d) => d.password === d.confirm, {
  message: 'Password tidak cocok',
  path: ['confirm'],
});
type FormData = z.infer<typeof schema>;

type PageState = 'loading' | 'ready' | 'success' | 'invalid';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [pageState, setPageState] = useState<PageState>('loading');
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    // Supabase fires PASSWORD_RECOVERY when user arrives from reset email link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPageState('ready');
      }
    });

    // Also check current session — if user already has a recovery session active
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setPageState('ready');
      else {
        // Give it 3 seconds for the hash to be processed by Supabase client
        setTimeout(() => {
          setPageState((prev) => prev === 'loading' ? 'invalid' : prev);
        }, 3000);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: FormData) => {
    setServerErr('');
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setServerErr(error.message);
      return;
    }
    setPageState('success');
    setTimeout(() => navigate('/candidate/login'), 3000);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="relative hidden w-1/2 lg:block">
        <img src={sagAssets.heroPlantation} alt="SAG" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-sag-forest/90" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-sag-soft">
              <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sag-gold">Portal Karir Resmi</p>
              <p className="text-sm font-black">PT Sahabat Agro Group</p>
            </div>
          </Link>
          <div>
            <h2 className="text-3xl font-black leading-snug">Buat Password<br /><span className="text-sag-gold">Baru Anda</span></h2>
            <p className="mt-4 text-sm text-white/60">Pilih password yang kuat dan mudah diingat untuk mengamankan akun Anda.</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full flex-col items-center justify-center bg-sag-mist px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Link to="/"><img src={sagAssets.logo} alt="SAG" className="h-10 w-auto" /></Link>
          </div>

          {pageState === 'loading' && (
            <div className="card p-8 text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-sm text-slate-500">Memverifikasi tautan reset...</p>
            </div>
          )}

          {pageState === 'invalid' && (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-7 w-7 text-red-500" />
              </div>
              <h2 className="text-xl font-black text-red-600">Tautan Tidak Valid</h2>
              <p className="mt-3 text-sm text-slate-600 leading-6">
                Tautan reset password sudah kadaluarsa atau tidak valid. Silakan minta tautan baru.
              </p>
              <Link to="/forgot-password" className="btn-primary mt-6 w-full text-center block">
                Minta Tautan Baru
              </Link>
            </div>
          )}

          {pageState === 'success' && (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-sag-green">Password Berhasil Diubah!</h2>
              <p className="mt-3 text-sm text-slate-600">Kamu akan diarahkan ke halaman login dalam 3 detik...</p>
              <Link to="/candidate/login" className="btn-primary mt-6 w-full text-center block">
                Masuk Sekarang
              </Link>
            </div>
          )}

          {pageState === 'ready' && (
            <div className="card p-8">
              <div className="mb-7">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-sag-green/10">
                  <KeyRound className="h-6 w-6 text-sag-green" />
                </div>
                <h1 className="text-2xl font-black text-sag-green">Buat Password Baru</h1>
                <p className="mt-1 text-sm text-slate-500">Minimal 8 karakter.</p>
              </div>

              {serverErr && (
                <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                  {serverErr}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="label">Password Baru</label>
                  <div className="relative mt-1">
                    <input
                      {...register('password')}
                      type={showPw ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Minimal 8 karakter"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>

                <div>
                  <label className="label">Konfirmasi Password</label>
                  <div className="relative mt-1">
                    <input
                      {...register('confirm')}
                      type={showCf ? 'text' : 'password'}
                      className="input pr-10"
                      placeholder="Ulangi password baru"
                      autoComplete="new-password"
                    />
                    <button type="button" onClick={() => setShowCf(!showCf)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirm && <p className="mt-1 text-xs text-red-500">{errors.confirm.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                  {isSubmitting ? <Spinner size="sm" /> : 'Simpan Password Baru'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
