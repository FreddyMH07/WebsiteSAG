import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  MapPin, Briefcase, Clock, Search, ChevronRight,
  Filter, ArrowRight,
} from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import SEO from '@/components/common/SEO';
import { useLang } from '@/hooks/useLang';
import { sagAssets, companyStats, benefits, careerDepartments, employmentTypes } from '@/data/siteContent';
import { getActiveJobs } from '@/lib/contentful';
import type { ContentfulJob } from '@/types';

const SITE_URL = 'https://career.sahabatagro.co.id';

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'PT Sahabat Agro Group Career',
  url: SITE_URL,
  description: 'Portal karir resmi PT Sahabat Agro Group. Temukan lowongan kerja di perkebunan, pabrik, dan kantor pusat kami.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/jobs?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

const jsonLdOrg = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'PT Sahabat Agro Group',
  url: 'https://sahabatagro.co.id',
  logo: `${SITE_URL}/assets/sag/brand/logo-ptsag.png`,
  description: 'Perusahaan holding agribisnis modern yang bergerak di bidang perkebunan kelapa sawit dan pengolahan CPO.',
  foundingDate: '2017',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'JL Sunter Agung Podomoro No.9-10 Blok N 2, RT.10/RW.11',
    addressLocality: 'Jakarta Utara',
    postalCode: '14350',
    addressCountry: 'ID',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+62-21-2188-2445',
    contactType: 'HR',
    email: 'admin.it@sahabatagro.co.id',
    availableLanguage: ['Indonesian', 'English'],
  },
  sameAs: ['https://www.linkedin.com/company/sahabat-agro-group/'],
};

type Tab = 'overview' | 'jobs';

/* ── Animated counter ────────────────────────────────────────────────────── */
function useCountUp(target: string, trigger: boolean) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    if (!trigger) return;
    const num = parseInt(target.replace(/\D/g, ''), 10);
    if (isNaN(num)) { setDisplay(target); return; }
    const suffix = target.replace(/[0-9]/g, '');
    let cur = 0;
    const step = Math.max(1, Math.ceil(num / 50));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, num);
      setDisplay(cur.toLocaleString('id-ID') + suffix);
      if (cur >= num) clearInterval(timer);
    }, 30);
    return () => clearInterval(timer);
  }, [trigger, target]);
  return display;
}

function StatCard({ value, label, labelEn, trigger }: { value: string; label: string; labelEn: string; trigger: boolean }) {
  const { t } = useLang();
  const display = useCountUp(value, trigger);
  return (
    <div className="text-center px-4">
      <p className="text-3xl font-black text-sag-gold md:text-4xl">{display}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-white/60">{t(label, labelEn)}</p>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────────── */
export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = (searchParams.get('tab') as Tab) ?? 'overview';
  const { t } = useLang();

  const [jobs, setJobs] = useState<ContentfulJob[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [empType, setEmpType] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (tab === 'jobs' && jobs.length === 0) {
      setLoadingJobs(true);
      getActiveJobs()
        .then((d) => setJobs(d as ContentfulJob[]))
        .catch(() => setJobs([]))
        .finally(() => setLoadingJobs(false));
    }
  }, [tab]);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    return (
      (!q || j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.department.toLowerCase().includes(q)) &&
      (!dept || j.department === dept) &&
      (!empType || j.employmentType === empType)
    );
  });

  const switchTab = (tb: Tab) => setSearchParams({ tab: tb });

  return (
    <>
      <SEO
        title="Career | PT Sahabat Agro Group"
        description="Explore career opportunities at PT Sahabat Agro Group. Find job vacancies in plantation, mill, and head office support across Indonesia."
        canonical="/"
        jsonLd={[jsonLdWebsite, jsonLdOrg]}
      />

      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-[480px] overflow-hidden bg-sag-forest">
        {/* Single blurred background — teks headline tetap terbaca jelas */}
        <img
          src={sagAssets.heroPlantation}
          alt=""
          className="absolute inset-0 h-full w-full object-cover scale-105 blur-sm"
        />
        <div className="absolute inset-0 bg-sag-forest/85" />

        <div className="container-page relative pt-14 pb-6">
          <div className="flex items-center gap-4 mb-7">
            {/* White badge — shows real logo without color hacks */}
            <div className="h-14 w-14 rounded-xl bg-white p-2 shadow-sag-soft flex-shrink-0">
              <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-sag-gold uppercase">
                {t('Portal Karir Resmi', 'Official Career Portal')}
              </p>
              <h1 className="text-2xl font-black text-white md:text-3xl">PT Sahabat Agro Group</h1>
              <p className="text-xs text-white/50 mt-0.5 italic">"From Plantation to Production"</p>
            </div>
          </div>

          <h2 className="text-4xl font-black text-white max-w-2xl leading-tight md:text-5xl">
            {t('Tumbuh Bersama', 'Grow Together')}{' '}
            <span className="text-sag-gold">{t('dalam Agribisnis', 'in Agribusiness')}</span>
          </h2>
          <p className="mt-4 text-base text-white/65 max-w-xl leading-7">
            {t(
              'Bergabunglah dengan tim kami dan berkontribusi langsung pada pertumbuhan agribisnis berkelanjutan di Indonesia.',
              'Join our team and contribute directly to sustainable agribusiness growth across Indonesia.',
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => switchTab('jobs')} className="btn-gold">
              {t('Lihat Lowongan', 'Browse Jobs')} <ChevronRight className="ml-1 inline h-4 w-4" />
            </button>
            <Link to="/candidate/register" className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/5 px-6 py-3 text-sm font-bold text-white hover:bg-white/15 transition">
              {t('Daftar Akun', 'Create Account')}
            </Link>
          </div>
        </div>

        {/* Tab bar */}
        <div className="relative mt-4 border-t border-white/10">
          <div className="container-page flex">
            {(['overview', 'jobs'] as Tab[]).map((tb) => (
              <button
                key={tb}
                onClick={() => switchTab(tb)}
                className={`relative px-6 py-4 text-sm font-bold transition ${
                  tab === tb
                    ? 'text-white after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-sag-gold'
                    : 'text-white/45 hover:text-white/80'
                }`}
              >
                {tb === 'overview'
                  ? t('Overview', 'Overview')
                  : `${t('Lowongan', 'Jobs')}${jobs.length > 0 ? ` (${jobs.length})` : ''}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── OVERVIEW TAB ─────────────────────────────────────────────────── */}
      {tab === 'overview' && (
        <main>

          {/* Stats bar */}
          <section ref={statsRef} className="bg-sag-green py-10">
            <div className="container-page">
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 divide-x divide-white/10">
                {companyStats.map((s) => (
                  <StatCard key={s.value} {...s} trigger={statsVisible} />
                ))}
              </div>
            </div>
          </section>

          {/* About + photo grid */}
          <section className="section-pad">
            <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-sag-gold">{t('Tentang Kami', 'About Us')}</p>
                <h2 className="mt-3 text-3xl font-black text-sag-green leading-tight md:text-4xl">
                  {t('Agribisnis Terintegrasi', 'Integrated Agribusiness')} <br />
                  <span className="text-sag-leaf">{t('dari Kebun ke Pabrik', 'from Plantation to Mill')}</span>
                </h2>
                <p className="mt-5 leading-8 text-slate-600">
                  {t(
                    'PT Sahabat Agro Group adalah holding agribisnis modern yang mengelola lebih dari 2.500 hektare perkebunan kelapa sawit dan pabrik CPO terintegrasi di Lampung, Jambi, dan Belitung Timur. Berdiri sejak 2017 dengan lebih dari 400 karyawan.',
                    'PT Sahabat Agro Group is a modern agribusiness holding managing over 2,500 hectares of palm oil plantation and integrated CPO mill in Lampung, Jambi, and East Belitung. Founded in 2017 with over 400 employees.',
                  )}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {['PT PAL · Lampung', 'PT LSP · Lampung/Jambi', 'PT HSBS · Belitung Timur', 'PT GBP · CPO Mill'].map((u) => (
                    <span key={u} className="rounded-full border border-sag-green/20 bg-sag-mist px-4 py-1.5 text-xs font-bold text-sag-green">{u}</span>
                  ))}
                </div>
                <button onClick={() => switchTab('jobs')} className="btn-primary mt-7">
                  {t('Lihat Lowongan', 'View Openings')} <ArrowRight className="ml-2 h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 grid-rows-2 gap-3 h-[400px]">
                <div className="row-span-2 overflow-hidden rounded-3xl">
                  <img src={sagAssets.pal} alt="PAL Estate" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="overflow-hidden rounded-3xl">
                  <img src={sagAssets.office} alt="Kantor SAG" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="overflow-hidden rounded-3xl">
                  <img src={sagAssets.gbp} alt="GBP Mill" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </div>
            </div>
          </section>

          {/* Life at SAG */}
          <section className="section-pad bg-sag-forest">
            <div className="container-page">
              <div className="text-center mb-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-sag-gold">{t('Kehidupan di SAG', 'Life at SAG')}</p>
                <h2 className="mt-3 text-3xl font-black text-white">{t('Di Balik Layar Kami', 'Behind the Scenes')}</h2>
                <p className="mt-3 text-white/55 text-sm max-w-md mx-auto">
                  {t('Momen nyata dari tim kami di lapangan dan kantor pusat.', 'Real moments from our teams in the field and headquarters.')}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 auto-rows-[160px]">
                <div className="col-span-2 row-span-2 overflow-hidden rounded-3xl relative group">
                  <img src={sagAssets.gatheringWide} alt="Family Gathering" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-sag-forest/70 via-transparent to-transparent rounded-3xl" />
                  <div className="absolute bottom-4 left-5">
                    <p className="text-sm font-black text-white drop-shadow">Family Business Gathering</p>
                    <p className="text-xs text-white/70">{t('Mempererat kebersamaan lintas entitas', 'Building unity across entities')}</p>
                  </div>
                </div>
                {[
                  { src: sagAssets.agronomy, alt: t('Agronomi Lapangan', 'Field Agronomy') },
                  { src: sagAssets.eplantTraining, alt: t('Pelatihan ePlant', 'ePlant Training') },
                  { src: sagAssets.team, alt: t('Tim SAG', 'SAG Team') },
                  { src: sagAssets.ubmMou, alt: t('MoU UBM', 'UBM MoU') },
                ].map(({ src, alt }) => (
                  <div key={alt} className="overflow-hidden rounded-3xl relative group">
                    <img src={src} alt={alt} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-sag-forest/60 via-transparent to-transparent rounded-3xl" />
                    <p className="absolute bottom-2.5 left-3 text-[11px] font-bold text-white drop-shadow">{alt}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="section-pad bg-sag-mist">
            <div className="container-page">
              <div className="text-center mb-10">
                <p className="text-[11px] font-bold uppercase tracking-widest text-sag-gold">{t('Mengapa Bergabung?', 'Why Join Us?')}</p>
                <h2 className="mt-3 text-2xl font-black text-sag-green">{t('Manfaat & Keunggulan', 'Benefits & Perks')}</h2>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {benefits.map((b) => (
                  <div key={b.title} className="group card p-6 hover:border-sag-green/30 hover:shadow-sag-hover hover:-translate-y-1 transition-all duration-300">
                    <div className="mb-4 text-3xl">{b.icon}</div>
                    <h3 className="font-black text-sag-green group-hover:text-sag-leaf transition-colors">
                      {t(b.title, b.titleEn)}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{t(b.desc, b.descEn)}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Latest jobs preview */}
          <LatestJobsPreview switchTab={switchTab} />

          {/* Anti-fraud notice */}
          <section className="bg-amber-50 border-y border-amber-200 py-5">
            <div className="container-page flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-black text-amber-800">⚠️ {t('Perhatian Pelamar', 'Notice to Applicants')}</p>
                <p className="mt-1 text-sm text-amber-700">
                  {t(
                    'Rekrutmen PT SAG tidak pernah memungut biaya apapun. Waspada penipuan yang mengatasnamakan SAG.',
                    "SAG recruitment never charges any fees. Beware of fraud using SAG's name.",
                  )}
                </p>
              </div>
              <Link to="/contact" className="flex-shrink-0 rounded-full border border-amber-400 bg-white px-5 py-2.5 text-sm font-bold text-amber-800 hover:bg-amber-100 transition">
                {t('Hubungi Kami', 'Contact Us')}
              </Link>
            </div>
          </section>
        </main>
      )}

      {/* ── JOBS TAB ─────────────────────────────────────────────────────── */}
      {tab === 'jobs' && (
        <main>
          <section className="sticky top-16 z-30 border-b border-slate-200 bg-white py-4 shadow-sm">
            <div className="container-page flex flex-wrap gap-3">
              <div className="relative min-w-[200px] flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  className="input pl-10"
                  placeholder={t('Cari posisi atau lokasi...', 'Search position or location...')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select className="input w-auto min-w-[160px]" value={dept} onChange={(e) => setDept(e.target.value)}>
                <option value="">{t('Semua Departemen', 'All Departments')}</option>
                {careerDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
              <select className="input w-auto min-w-[140px]" value={empType} onChange={(e) => setEmpType(e.target.value)}>
                <option value="">{t('Semua Tipe', 'All Types')}</option>
                {employmentTypes.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              {(search || dept || empType) && (
                <button className="btn-secondary flex items-center gap-2" onClick={() => { setSearch(''); setDept(''); setEmpType(''); }}>
                  <Filter className="h-4 w-4" /> {t('Reset', 'Reset')}
                </button>
              )}
            </div>
          </section>

          <section className="section-pad bg-sag-mist">
            <div className="container-page">
              {loadingJobs ? (
                <div className="flex justify-center py-20"><Spinner size="lg" /></div>
              ) : filtered.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-sag-green/10 flex items-center justify-center">
                    <Briefcase className="h-8 w-8 text-sag-green/40" />
                  </div>
                  <p className="text-xl font-black text-sag-green">{t('Tidak ada lowongan ditemukan.', 'No positions found.')}</p>
                  <p className="mt-2 text-slate-500 text-sm">{t('Coba ubah filter atau cek kembali nanti.', 'Try adjusting filters or check back later.')}</p>
                </div>
              ) : (
                <>
                  <p className="mb-5 text-sm text-slate-500">{filtered.length} {t('lowongan tersedia', 'positions available')}</p>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((job) => <JobCard key={job.id} job={job} />)}
                  </div>
                </>
              )}
            </div>
          </section>
        </main>
      )}

      <Footer />
    </>
  );
}

/* ── Latest Jobs Preview ──────────────────────────────────────────────────── */
function LatestJobsPreview({ switchTab }: { switchTab: (t: Tab) => void }) {
  const { t } = useLang();
  const [jobs, setJobs] = useState<ContentfulJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveJobs()
      .then((d) => setJobs((d as ContentfulJob[]).slice(0, 3)))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || jobs.length === 0) return null;

  return (
    <section className="section-pad">
      <div className="container-page">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-sag-gold">{t('Rekrutmen Aktif', 'Active Recruitment')}</p>
            <h2 className="mt-2 text-2xl font-black text-sag-green">{t('Posisi yang Tersedia', 'Available Positions')}</h2>
          </div>
          <button onClick={() => switchTab('jobs')} className="flex items-center gap-1 text-sm font-bold text-sag-gold hover:underline">
            {t('Lihat Semua', 'View All')} <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {jobs.map((job) => <JobCard key={job.id} job={job} />)}
        </div>
      </div>
    </section>
  );
}

/* ── Job Card ─────────────────────────────────────────────────────────────── */
export function JobCard({ job }: { job: ContentfulJob }) {
  const { t } = useLang();
  return (
    <div className={`group card flex flex-col p-6 transition-all duration-300 ${
      job.isOpen ? 'hover:border-sag-leaf/40 hover:shadow-sag-hover hover:-translate-y-1' : 'opacity-60'
    }`}>
      <div className="flex items-start justify-between gap-2">
        <span className="badge border border-sag-green/15 bg-sag-green/8 text-sag-green text-xs">{job.department}</span>
        <span className={`badge flex-shrink-0 text-xs font-bold ${job.isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
          {job.isOpen ? t('Buka', 'Open') : t('Tutup', 'Closed')}
        </span>
      </div>
      <h3 className="mt-3 flex-1 text-base font-black text-sag-green leading-snug group-hover:text-sag-leaf transition-colors">
        {job.title}
      </h3>
      <div className="mt-3 space-y-1.5 text-sm text-slate-500">
        <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-sag-gold flex-shrink-0" />{job.location}</span>
        <span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5 text-sag-gold flex-shrink-0" />{job.employmentType}</span>
        {job.closingDate && (
          <span className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-sag-gold flex-shrink-0" />
            {t('Closing', 'Closing')}: {new Date(job.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>
      <div className="mt-5 flex gap-2">
        <Link to={`/jobs/${job.slug}`} className="btn-secondary flex-1 text-center text-xs py-2">
          {t('Detail', 'Details')}
        </Link>
        {job.isOpen && (
          <Link to={`/apply/${job.slug}`} className="btn-primary flex-1 text-center text-xs py-2">
            {t('Lamar', 'Apply')}
          </Link>
        )}
      </div>
    </div>
  );
}
