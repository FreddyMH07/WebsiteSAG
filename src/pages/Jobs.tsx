import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Briefcase, Clock, Search, Filter } from 'lucide-react';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import Spinner from '@/components/common/Spinner';
import SEO from '@/components/common/SEO';
import { sagAssets, careerDepartments, employmentTypes } from '@/data/siteContent';
import { getActiveJobs } from '@/lib/contentful';
import type { ContentfulJob } from '@/types';

export default function Jobs() {
  const [jobs, setJobs] = useState<ContentfulJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('');
  const [empType, setEmpType] = useState('');

  useEffect(() => {
    getActiveJobs()
      .then((data) => setJobs(data as ContentfulJob[]))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch = !q || j.title.toLowerCase().includes(q) || j.location.toLowerCase().includes(q) || j.department.toLowerCase().includes(q);
    const matchDept = !dept || j.department === dept;
    const matchType = !empType || j.employmentType === empType;
    return matchSearch && matchDept && matchType;
  });

  return (
    <>
      <SEO
        title="Lowongan Kerja | PT Sahabat Agro Group"
        description="Temukan lowongan kerja terbaru di PT Sahabat Agro Group — perkebunan, pabrik CPO, dan kantor pusat. Daftarkan diri Anda sekarang."
        canonical="/jobs"
      />
      <Navbar />

      <section className="relative overflow-hidden bg-sag-forest py-20 text-white">
        <img src={sagAssets.gatheringWide} alt="Open Positions" className="absolute inset-0 h-full w-full object-cover opacity-20" />
        <div className="container-page relative">
          <p className="font-bold uppercase tracking-[0.3em] text-sag-gold text-xs">Open Positions</p>
          <h1 className="mt-3 text-4xl font-black md:text-5xl">Grow with SAG.</h1>
          <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
            Bergabunglah bersama tim kami dan bangun karir di lingkungan agribisnis modern yang berfokus pada inovasi dan pertumbuhan berkelanjutan.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/candidate/register" className="btn-gold">Daftar sebagai Kandidat</Link>
            <Link to="/candidate/login" className="btn-secondary">Masuk</Link>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="border-b border-slate-200 bg-white py-5">
        <div className="container-page flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Cari posisi atau lokasi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input w-auto min-w-[160px]" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Semua Departemen</option>
            {careerDepartments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select className="input w-auto min-w-[140px]" value={empType} onChange={(e) => setEmpType(e.target.value)}>
            <option value="">Semua Tipe</option>
            {employmentTypes.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          {(search || dept || empType) && (
            <button className="btn-secondary flex items-center gap-2" onClick={() => { setSearch(''); setDept(''); setEmpType(''); }}>
              <Filter className="h-4 w-4" /> Clear
            </button>
          )}
        </div>
      </section>

      {/* Job listing */}
      <section className="section-pad bg-sag-mist">
        <div className="container-page">
          {loading ? (
            <div className="flex justify-center py-20"><Spinner size="lg" /></div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-2xl font-black text-sag-green">Tidak ada lowongan ditemukan.</p>
              <p className="mt-2 text-slate-500">Coba ubah filter pencarian atau cek kembali nanti.</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job) => (
                <div key={job.id} className={`card flex flex-col p-6 transition ${job.isOpen ? 'hover:border-sag-green/30 hover:shadow-lg' : 'opacity-70'}`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="badge bg-sag-mist text-sag-green">{job.department}</span>
                    <span className={`badge flex-shrink-0 ${job.isOpen ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {job.isOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                  <h3 className="mt-3 flex-1 text-lg font-black text-sag-green leading-snug">{job.title}</h3>
                  <div className="mt-4 space-y-1.5 text-sm text-slate-500">
                    <span className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                    <span className="flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" />{job.employmentType}</span>
                    {job.closingDate && (
                      <span className="flex items-center gap-2">
                        <Clock className="h-3.5 w-3.5" />
                        Closing: {new Date(job.closingDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <div className="mt-5 flex gap-2">
                    <Link to={`/jobs/${job.slug}`} className="btn-secondary flex-1 text-center text-sm py-2">Detail</Link>
                    {job.isOpen && (
                      <Link to={`/apply/${job.slug}`} className="btn-primary flex-1 text-center text-sm py-2">Apply</Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
