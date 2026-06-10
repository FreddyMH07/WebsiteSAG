import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Mail, Send, CheckCircle, AlertCircle, Linkedin, ExternalLink } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import SEO from '@/components/common/SEO';
import { useLang } from '@/hooks/useLang';
import { sagAssets, contactInfo } from '@/data/siteContent';

const WEB3FORMS_KEY = '564ae03b-d042-4fdc-828b-ba76d1f3b9e2';

const schema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Format email tidak valid'),
  subject: z.string().min(3, 'Wajib diisi'),
  message: z.string().min(20, 'Pesan minimal 20 karakter'),
});
type FormData = z.infer<typeof schema>;

export default function Contact() {
  const { t } = useLang();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `[SAG Career Contact] ${data.subject} – ${data.name}`,
          name: data.name,
          email: data.email,
          message: data.message,
        }),
      });
      const json = await res.json();
      if (json.success) { setStatus('success'); reset(); }
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <>
      <SEO
        title="Kontak HR | PT Sahabat Agro Group"
        description="Hubungi tim HR PT Sahabat Agro Group untuk pertanyaan rekrutmen, status lamaran, atau laporkan penipuan yang mengatasnamakan SAG."
        canonical="/contact"
      />
      <Navbar />

      {/* Page header */}
      <section className="relative overflow-hidden bg-sag-forest py-16">
        <img src={sagAssets.office} alt="" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-sag-forest/95 to-sag-forest/70" />
        <div className="container-page relative">
          <p className="text-xs font-bold uppercase tracking-widest text-sag-gold">{t('Hubungi Kami', 'Get in Touch')}</p>
          <h1 className="mt-3 text-4xl font-black text-white">{t('Kontak & Informasi', 'Contact & Information')}</h1>
          <p className="mt-3 text-white/65 max-w-xl">
            {t(
              'Ada pertanyaan seputar rekrutmen atau lowongan kerja? Tim HR kami siap membantu.',
              'Have questions about recruitment or job openings? Our HR team is ready to help.'
            )}
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page grid gap-10 lg:grid-cols-[1fr_400px]">

          {/* Contact form */}
          <div>
            <h2 className="text-2xl font-black text-sag-green mb-6">{t('Kirim Pesan', 'Send a Message')}</h2>

            {status === 'success' && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-green-50 border border-green-200 p-4 text-green-700">
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
                <div>
                  <p className="font-bold">{t('Pesan terkirim!', 'Message sent!')}</p>
                  <p className="text-sm">{t('Tim kami akan merespons dalam 1–2 hari kerja.', 'Our team will respond within 1–2 business days.')}</p>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="mb-6 flex items-center gap-3 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                <p className="text-sm">{t('Gagal mengirim. Silakan coba lagi.', 'Failed to send. Please try again.')}</p>
              </div>
            )}

            <div className="card p-7">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="label">{t('Nama Lengkap', 'Full Name')} *</label>
                    <input {...register('name')} className="input mt-1" placeholder={t('Nama Anda', 'Your name')} />
                    {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="label">{t('Alamat Email', 'Email Address')} *</label>
                    <input {...register('email')} type="email" className="input mt-1" placeholder="nama@email.com" />
                    {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                </div>

                <div>
                  <label className="label">{t('Topik', 'Subject')} *</label>
                  <select {...register('subject')} className="input mt-1">
                    <option value="">{t('Pilih topik...', 'Select topic...')}</option>
                    <option value="Pertanyaan Lowongan">{t('Pertanyaan tentang Lowongan', 'Job Opening Inquiry')}</option>
                    <option value="Status Lamaran">{t('Status Lamaran', 'Application Status')}</option>
                    <option value="Laporan Penipuan">{t('Laporan Penipuan Rekrutmen', 'Recruitment Fraud Report')}</option>
                    <option value="Kerja Sama">{t('Kerja Sama / Partnership', 'Partnership / Collaboration')}</option>
                    <option value="Lainnya">{t('Lainnya', 'Other')}</option>
                  </select>
                  {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="label">{t('Pesan', 'Message')} *</label>
                  <textarea
                    {...register('message')}
                    className="input mt-1 h-36 resize-none"
                    placeholder={t('Tulis pesan Anda di sini...', 'Write your message here...')}
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-500">{errors.message.message}</p>}
                </div>

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                  {isSubmitting ? <Spinner size="sm" /> : <><Send className="mr-2 h-4 w-4" />{t('Kirim Pesan', 'Send Message')}</>}
                </button>
              </form>
            </div>
          </div>

          {/* Info sidebar */}
          <div className="space-y-5">
            <div className="card p-6">
              <h3 className="font-black text-sag-green mb-5">{t('Informasi Kontak', 'Contact Information')}</h3>
              <div className="space-y-4">
                <a href={`mailto:${contactInfo.email}`} className="flex items-start gap-3 group">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sag-green/10">
                    <Mail className="h-4 w-4 text-sag-green" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Email IT / Umum</p>
                    <p className="text-sm font-semibold text-sag-green group-hover:underline break-all">{contactInfo.email}</p>
                  </div>
                </a>
                <a href={contactInfo.maps} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 group">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-sag-green/10">
                    <MapPin className="h-4 w-4 text-sag-green" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">{t('Alamat Kantor', 'Office Address')}</p>
                    <p className="text-sm font-semibold text-slate-700 group-hover:text-sag-green leading-6">{contactInfo.address}</p>
                  </div>
                </a>
              </div>
              <div className="mt-5 flex gap-3 pt-5 border-t border-slate-100">
                <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-blue-400 hover:text-blue-600 transition">
                  <Linkedin className="h-4 w-4" /> LinkedIn
                </a>
                <a href={contactInfo.website} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:border-sag-green hover:text-sag-green transition">
                  <ExternalLink className="h-4 w-4" /> Website
                </a>
              </div>
            </div>

            {/* Anti-fraud box */}
            <div className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
              <p className="text-sm font-black text-amber-800">⚠️ {t('Peringatan Penipuan', 'Anti-Fraud Notice')}</p>
              <p className="mt-2 text-xs leading-6 text-amber-700">
                {t(
                  'Rekrutmen SAG tidak pernah memungut biaya apapun. Jika Anda dimintai biaya atas nama SAG, segera hubungi kami.',
                  'SAG recruitment never charges any fees. If you are asked for payment in SAG\'s name, please contact us immediately.'
                )}
              </p>
            </div>

            <div className="overflow-hidden rounded-3xl h-44">
              <img src={sagAssets.office} alt="Kantor SAG" className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
