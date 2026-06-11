import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/common/Spinner';
import { sagAssets } from '@/data/siteContent';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});
type FormData = z.infer<typeof schema>;

export default function HRLogin() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [serverErr, setServerErr] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerErr('');
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email: data.email, password: data.password });
    if (error) { setServerErr('Email atau password salah.'); return; }

    if (authData.user) {
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', authData.user.id).single();
      if (!profile || !['hr_admin', 'super_admin'].includes(profile.role)) {
        await supabase.auth.signOut();
        setServerErr('Akses ditolak. Portal ini hanya untuk HR Admin.');
        return;
      }
    }

    navigate('/hr/dashboard');
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 lg:block">
        <img src={sagAssets.office} alt="SAG Office" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-sag-forest/85" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white p-1.5 shadow-sag-soft">
              <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-sag-gold">HR Admin Portal</p>
              <p className="text-sm font-black text-white">PT Sahabat Agro Group</p>
            </div>
          </Link>
          <div className="text-white">
            <h2 className="text-3xl font-black">HR Admin Portal</h2>
            <p className="mt-3 text-white/70">Kelola kandidat, tinjau lamaran, dan monitor pipeline rekrutmen.</p>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center bg-sag-mist px-4 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <Link to="/"><img src={sagAssets.logo} alt="SAG" className="h-12 w-auto" /></Link>
          </div>
          <div className="card p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sag-green/10">
                <ShieldCheck className="h-5 w-5 text-sag-green" />
              </div>
              <div>
                <h1 className="text-xl font-black text-sag-green">HR Admin Login</h1>
                <p className="text-xs text-slate-500">Restricted access</p>
              </div>
            </div>

            {serverErr && (
              <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm text-red-600">{serverErr}</div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Email Address</label>
                <input {...register('email')} type="email" className="input mt-1" placeholder="admin@sahabatagro.co.id" />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative mt-1">
                  <input {...register('password')} type={showPw ? 'text' : 'password'} className="input pr-10" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
              </div>
              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? <Spinner size="sm" /> : 'Sign In to HR Admin'}
              </button>
            </form>

            <div className="mt-5 space-y-2 text-center text-xs text-slate-400">
              <p>
                <Link to="/forgot-password" className="hover:text-sag-green hover:underline transition">
                  Lupa Password?
                </Link>
              </p>
              <p>
                <Link to="/candidate/login" className="hover:underline">Kandidat? Masuk di sini</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
