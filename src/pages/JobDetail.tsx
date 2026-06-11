import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Briefcase, Clock, ArrowLeft, Calendar, AlertCircle } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import SEO from '@/components/common/SEO';
import { useAuth } from '@/hooks/useAuth';
import { getJobBySlug } from '@/lib/jobs';
import type { ContentfulJob } from '@/types';

const SITE_URL = 'https://career.sahabatagro.co.id';

function buildJobPosting(job: ContentfulJob) {
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || job.requirements || job.title,
    datePosted: new Date().toISOString().split('T')[0],
    ...(job.closingDate ? { validThrough: job.closingDate } : {}),
    employmentType: job.employmentType?.toUpperCase().replace(' ', '_') ?? 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: 'PT Sahabat Agro Group',
      sameAs: 'https://sahabatagro.co.id',
      logo: `${SITE_URL}/assets/sag/brand/logo-ptsag.png`,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: job.location,
        addressCountry: 'ID',
      },
    },
    url: `${SITE_URL}/jobs/${job.slug}`,
  };
}

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState<ContentfulJob | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    getJobBySlug(slug)
      .then((data) => setJob(data as ContentfulJob | null))
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <><Navbar /><div className="flex min-h-[60vh] items-center justify-center"><Spinner size="lg" /></div><Footer /></>
  );

  if (!job) return (
    <>
      <Navbar />
      <div className="container-page py-20 text-center">
        <p className="text-2xl font-black text-sag-green">Posisi tidak ditemukan.</p>
        <Link to="/jobs" className="btn-primary mt-6">Kembali ke Daftar Lowongan</Link>
      </div>
      <Footer />
    </>
  );

  const handleApply = () => {
    if (!profile) {
      navigate('/candidate/login', { state: { from: `/apply/${slug}` } });
      return;
    }
    if (profile.role !== 'candidate') {
      navigate('/candidate/login', { state: { from: `/apply/${slug}` } });
      return;
    }
    navigate(`/apply/${slug}`);
  };

  const description = job.description;

  return (
    <>
      <SEO
        title={`${job.title} | Career PT Sahabat Agro Group`}
        description={`Lowongan ${job.title} di PT Sahabat Agro Group. Lokasi: ${job.location}. Tipe: ${job.employmentType}. Lamar sekarang melalui portal karir resmi kami.`}
        canonical={`/jobs/${job.slug}`}
        noIndex={!job.isOpen}
        jsonLd={buildJobPosting(job)}
      />
      <Navbar />

      <div className="container-page py-7">
        <Link to="/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sag-green transition">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar Lowongan
        </Link>
      </div>

      <section className="pb-20">
        <div className="container-page grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div>
            <div className="card p-8">
              <div className="flex items-start justify-between gap-3">
                <span className="badge bg-sag-mist text-sag-green">{job.department}</span>
                <span className={`badge flex-shrink-0 ${job.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  {job.isOpen ? 'Open' : 'Closed'}
                </span>
              </div>
              <h1 className="mt-4 text-3xl font-black text-sag-green md:text-4xl">{job.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-sag-gold" />{job.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-sag-gold" />{job.employmentType}</span>
                {job.closingDate && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-sag-gold" />
                    Closing: {new Date(job.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                )}
              </div>

              {!job.isOpen && (
                <div className="mt-6 flex items-center gap-2 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  Posisi ini sudah ditutup. Silakan cek lowongan lain yang masih terbuka.
                </div>
              )}

              <hr className="my-8 border-slate-100" />

              {description && (
                <div>
                  <h2 className="text-xl font-black text-sag-green">Deskripsi Pekerjaan</h2>
                  <div className="mt-4 whitespace-pre-line leading-8 text-slate-600">{description}</div>
                </div>
              )}

              {job.requirements && (
                <div className="mt-8">
                  <h2 className="text-xl font-black text-sag-green">Persyaratan</h2>
                  <div className="mt-4 whitespace-pre-line leading-8 text-slate-600">{job.requirements}</div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="card p-6">
              <h3 className="font-black text-sag-green">Ringkasan Posisi</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-slate-500">Departemen</dt>
                  <dd className="font-semibold text-slate-800">{job.department}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Lokasi</dt>
                  <dd className="font-semibold text-slate-800">{job.location}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Tipe Pekerjaan</dt>
                  <dd className="font-semibold text-slate-800">{job.employmentType}</dd>
                </div>
                <div>
                  <dt className="text-slate-500">Status</dt>
                  <dd className={`font-semibold ${job.isOpen ? 'text-green-600' : 'text-red-500'}`}>
                    {job.isOpen ? 'Sedang Dibuka' : 'Sudah Ditutup'}
                  </dd>
                </div>
                {job.closingDate && (
                  <div>
                    <dt className="flex items-center gap-1 text-slate-500"><Calendar className="h-3.5 w-3.5" />Closing Date</dt>
                    <dd className="font-semibold text-slate-800">
                      {new Date(job.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </dd>
                  </div>
                )}
              </dl>

              {job.isOpen && (
                <button onClick={handleApply} className="btn-primary mt-6 w-full">
                  Apply Sekarang
                </button>
              )}

              {!profile && job.isOpen && (
                <p className="mt-3 text-center text-xs text-slate-500">
                  <Link to="/candidate/login" className="text-sag-gold hover:underline">Masuk</Link>
                  {' '}atau{' '}
                  <Link to="/candidate/register" className="text-sag-gold hover:underline">daftar</Link>
                  {' '}untuk melamar
                </p>
              )}
            </div>

            <div className="card bg-sag-mist p-6">
              <p className="text-sm font-bold text-sag-green">Tentang PT Sahabat Agro Group</p>
              <p className="mt-2 text-xs leading-6 text-slate-600">
                Holding agribisnis terintegrasi yang mengelola perkebunan kelapa sawit, pabrik CPO, dan transformasi digital di seluruh Indonesia.
              </p>
              <a href="https://sahabatagro.co.id" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-xs font-bold text-sag-gold hover:underline">
                Kunjungi Website Utama →
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
