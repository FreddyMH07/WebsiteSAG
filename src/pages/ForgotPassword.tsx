import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import Spinner from '@/components/common/Spinner';
import { sagAssets } from '@/data/siteContent';

const schema = z.object({
  email: z.string().email('Email tidak valid'),
});
type FormData = z.infer<typeof schema>;

const SITE_URL = 'https://career.sahabatagro.co.id';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${SITE_URL}/reset-password`,
    });
    // Always show success (do not expose whether email exists)
    setSentEmail(data.email);
    setSent(true);
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
            <h2 className="text-3xl font-black leading-snug">Reset Password<br /><span className="text-sag-gold">Akun Anda</span></h2>
            <p className="mt-4 text-sm text-white/60">Masukkan email terdaftar Anda dan kami akan mengirimkan tautan untuk membuat password baru.</p>
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

          {sent ? (
            <div className="card p-8 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
              <h2 className="text-xl font-black text-sag-green">Email Terkirim!</h2>
              <p className="mt-3 text-sm text-slate-600 leading-6">
                Jika <strong>{sentEmail}</strong> terdaftar di sistem kami, kamu akan menerima email berisi tautan reset password.
              </p>
              <p className="mt-2 text-xs text-slate-400">Cek folder Spam jika tidak masuk dalam 5 menit.</p>
              <Link to="/candidate/login" className="btn-primary mt-6 w-full text-center block">
                Kembali ke Halaman Masuk
              </Link>
            </div>
          ) : (
            <div className="card p-8">
              <div className="mb-7">
                <Link to="/candidate/login" className="mb-4 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-sag-green transition">
                  <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Login
                </Link>
                <h1 className="text-2xl font-black text-sag-green">Lupa Password?</h1>
                <p className="mt-1 text-sm text-slate-500">Masukkan email Anda untuk menerima tautan reset.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="label">Alamat Email</label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      {...register('email')}
                      type="email"
                      className="input pl-10"
                      placeholder="nama@email.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3">
                  {isSubmitting ? <Spinner size="sm" /> : 'Kirim Tautan Reset'}
                </button>
              </form>

              <div className="mt-6 space-y-2 text-center text-xs text-slate-400">
                <p>
                  Ingat password?{' '}
                  <Link to="/candidate/login" className="font-bold text-sag-green hover:underline">Masuk</Link>
                </p>
                <p>
                  Belum punya akun?{' '}
                  <Link to="/candidate/register" className="font-bold text-sag-green hover:underline">Daftar Sekarang</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
