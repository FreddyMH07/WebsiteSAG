import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Briefcase, User } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';

export default function ThankYou() {
  const location = useLocation();
  const jobTitle = (location.state as { jobTitle?: string })?.jobTitle;

  return (
    <>
      <Navbar />
      <section className="section-pad">
        <div className="container-page max-w-lg text-center">
          <div className="flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
          </div>
          <h1 className="mt-6 text-3xl font-black text-sag-green">Lamaran Terkirim!</h1>
          {jobTitle && (
            <p className="mt-2 text-slate-600">
              Lamaran Anda untuk posisi <strong>{jobTitle}</strong> telah berhasil kami terima.
            </p>
          )}
          <p className="mt-3 text-sm text-slate-500 leading-7">
            Tim HR kami akan meninjau lamaran Anda dan menghubungi melalui email atau WhatsApp jika profil Anda sesuai. Proses seleksi biasanya membutuhkan 1–2 minggu.
          </p>

          <div className="mt-8 rounded-3xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <strong>Penting:</strong> Rekrutmen PT Sahabat Agro Group tidak pernah memungut biaya apapun dalam proses seleksi.
          </div>

          <div className="mt-8 grid gap-3">
            <Link to="/candidate/dashboard" className="btn-primary flex items-center justify-center gap-2">
              <User className="h-4 w-4" /> Lihat Status Lamaran Saya
            </Link>
            <Link to="/jobs" className="btn-secondary flex items-center justify-center gap-2">
              <Briefcase className="h-4 w-4" /> Lihat Lowongan Lainnya
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
