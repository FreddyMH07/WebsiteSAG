import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Linkedin, ExternalLink } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { sagAssets, contactInfo } from '@/data/siteContent';

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-sag-forest text-white">
      <div className="container-page py-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">

          {/* Brand */}
          <div className="max-w-sm">
            {/* Logo badge — white bg agar logo PNG terbaca di dark bg */}
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-white p-1.5 flex-shrink-0">
                <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-sag-gold">Career Portal</p>
                <p className="text-sm font-black text-white">PT Sahabat Agro Group</p>
              </div>
            </div>

            <p className="text-sm leading-7 text-white/55">
              {t(
                'Portal rekrutmen resmi PT Sahabat Agro Group — holding agribisnis terintegrasi di Indonesia sejak 2017.',
                'Official recruitment portal of PT Sahabat Agro Group — integrated agribusiness holding company since 2017.',
              )}
            </p>

            {/* Contact info */}
            <div className="mt-5 space-y-2">
              <a href={`mailto:${contactInfo.emailHr}`} className="flex items-center gap-2 text-xs text-white/55 hover:text-white transition">
                <Mail className="h-3.5 w-3.5 text-sag-gold flex-shrink-0" />
                <span>{contactInfo.emailHr} <span className="text-white/30">({t('Rekrutmen', 'Recruitment')})</span></span>
              </a>
              <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-2 text-xs text-white/55 hover:text-white transition">
                <Phone className="h-3.5 w-3.5 text-sag-gold flex-shrink-0" /> {contactInfo.phone}
              </a>
              <a href={contactInfo.maps} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 text-xs text-white/55 hover:text-white transition">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-sag-gold flex-shrink-0" />
                <span className="leading-5">{contactInfo.addressShort}</span>
              </a>
            </div>

            {/* Social */}
            <div className="mt-5 flex gap-3">
              <a href={contactInfo.linkedin} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white transition">
                <Linkedin className="h-3.5 w-3.5" /> LinkedIn
              </a>
              <a href={contactInfo.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-2 text-xs font-bold text-white/60 hover:bg-white/10 hover:text-white transition">
                <ExternalLink className="h-3.5 w-3.5" /> {t('Website Utama', 'Main Website')}
              </a>
            </div>
          </div>

          {/* Career Portal links */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sag-gold">Career Portal</p>
            <nav className="flex flex-col gap-2.5 text-sm text-white/60">
              <Link to="/?tab=overview" className="hover:text-white transition">Overview</Link>
              <Link to="/jobs" className="hover:text-white transition">{t('Lowongan Kerja', 'Job Openings')}</Link>
              <Link to="/contact" className="hover:text-white transition">{t('Kontak HR', 'Contact HR')}</Link>
              <Link to="/candidate/register" className="hover:text-white transition">{t('Daftar Kandidat', 'Register')}</Link>
              <Link to="/candidate/login" className="hover:text-white transition">{t('Masuk Kandidat', 'Candidate Sign In')}</Link>
              <Link to="/hr/login" className="hover:text-white transition text-white/30">HR Admin</Link>
            </nav>
          </div>

          {/* Anti-fraud */}
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-widest text-sag-gold">
              {t('Informasi Penting', 'Important Notice')}
            </p>
            <div className="rounded-2xl border border-amber-500/30 bg-amber-900/20 p-4">
              <p className="text-xs font-bold text-amber-400">⚠️ {t('Waspada Penipuan', 'Anti-Fraud Alert')}</p>
              <p className="mt-2 text-xs leading-6 text-white/55">
                {t(
                  'Rekrutmen SAG tidak pernah memungut biaya apapun dalam proses seleksi.',
                  'SAG recruitment never charges any fees during the selection process.',
                )}
              </p>
              <Link to="/contact" className="mt-3 inline-block text-xs font-bold text-sag-gold hover:underline">
                {t('Laporkan Penipuan →', 'Report Fraud →')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container-page flex flex-col gap-1 text-center text-xs text-white/30 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} PT Sahabat Agro Group. All rights reserved.</p>
          <p>career.sahabatagro.co.id</p>
        </div>
      </div>
    </footer>
  );
}
