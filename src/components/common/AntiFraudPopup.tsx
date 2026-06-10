import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, ShieldAlert, Ban, CreditCard } from 'lucide-react';
import { useLang } from '@/hooks/useLang';
import { sagAssets } from '@/data/siteContent';

const SESSION_KEY = 'sag_fraud_notice_shown';

export default function AntiFraudPopup() {
  const [visible, setVisible] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(SESSION_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={dismiss}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/65 backdrop-blur-sm animate-fade-in" />

      {/* Modal card */}
      <div
        className="relative z-10 w-full max-w-[420px] rounded-3xl bg-white shadow-2xl overflow-hidden animate-pop-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ─── Header ─────────────────────────────────────────── */}
        <div className="relative bg-sag-forest px-6 pt-6 pb-8 text-center overflow-hidden">
          {/* Decorative rings */}
          <div className="pointer-events-none absolute -top-8 -right-8 h-32 w-32 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/5" />

          {/* Close button — top right of header */}
          <button
            onClick={dismiss}
            aria-label="Tutup"
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 transition text-white"
          >
            <X className="h-4 w-4" />
          </button>

          {/* SAG Logo */}
          <div className="relative mx-auto mb-4 h-12 w-12 rounded-2xl bg-white p-1.5 shadow-lg">
            <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
          </div>

          {/* Subtitle */}
          <div className="relative flex items-center justify-center gap-1.5 mb-2">
            <ShieldAlert className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-sag-gold">
              PT Sahabat Agro Group
            </p>
          </div>

          {/* Main title */}
          <h2 className="relative text-xl font-black text-white leading-tight">
            {t('⚠️ WASPADA', '⚠️ BEWARE')}
            <br />
            <span className="text-amber-400">
              {t('PENIPUAN REKRUTMEN!', 'RECRUITMENT FRAUD!')}
            </span>
          </h2>
        </div>

        {/* ─── Body ───────────────────────────────────────────── */}
        <div className="px-6 py-5">
          {/* Two info cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="rounded-2xl bg-sag-forest/5 border border-sag-forest/10 p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-sag-green/10">
                <Ban className="h-5 w-5 text-sag-green" />
              </div>
              <p className="text-[11px] font-black text-sag-forest leading-snug">
                {t('TIDAK ADA BIAYA', 'NO FEES')}
              </p>
              <p className="mt-1 text-[10px] text-slate-500 leading-snug">
                {t('untuk rekrutmen calon karyawan', 'for candidate recruitment')}
              </p>
            </div>
            <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-center">
              <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl bg-red-100">
                <CreditCard className="h-5 w-5 text-red-500" />
              </div>
              <p className="text-[11px] font-black text-slate-700 leading-snug">
                {t('PERMINTAAN TRANSFER', 'TRANSFER REQUESTS')}
              </p>
              <p className="mt-1 text-[11px] font-black text-red-600">
                {t('= PENIPUAN!', '= FRAUD!')}
              </p>
            </div>
          </div>

          {/* Warning description */}
          <p className="text-[13px] text-slate-600 leading-6 text-center mb-5">
            {t(
              'Hati-hati penipuan yang mengatasnamakan PT Sahabat Agro Group dalam proses rekrutmen. SAG tidak pernah memungut biaya apapun dalam bentuk apapun.',
              "Beware of fraudulent schemes using PT Sahabat Agro Group's name. SAG never charges any fees in any form whatsoever.",
            )}
          </p>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link
              to="/contact"
              onClick={dismiss}
              className="flex-1 rounded-2xl bg-sag-green py-3 text-center text-sm font-black text-white hover:bg-sag-forest transition"
            >
              {t('Hubungi Kami', 'Contact Us')}
            </Link>
            <button
              onClick={dismiss}
              className="flex-1 rounded-2xl border-2 border-slate-200 py-3 text-sm font-bold text-slate-500 hover:border-slate-300 hover:bg-slate-50 transition"
            >
              {t('Saya Mengerti', 'I Understand')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
