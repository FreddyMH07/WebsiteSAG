import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Search, ExternalLink, Filter } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import { supabase } from '@/lib/supabase';
import type { Candidate } from '@/types';

export default function HRCandidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [educationFilter, setEducationFilter] = useState('');
  const [expFilter, setExpFilter] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from('candidates')
          .select('*')
          .order('created_at', { ascending: false });
        setCandidates((data ?? []) as Candidate[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const educationLevels = [...new Set(candidates.map((c) => c.education).filter(Boolean))] as string[];
  const experienceYears = [...new Set(candidates.map((c) => c.experience_year).filter(Boolean))] as string[];

  const filtered = candidates.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.domicile ?? '').toLowerCase().includes(q);
    const matchEdu = !educationFilter || c.education === educationFilter;
    const matchExp = !expFilter || c.experience_year === expFilter;
    return matchSearch && matchEdu && matchExp;
  });

  const clearFilters = () => { setSearch(''); setEducationFilter(''); setExpFilter(''); };
  const hasFilters = search || educationFilter || expFilter;

  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <HRLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black text-sag-green">Candidates</h1>
        <p className="text-sm text-slate-500">{filtered.length} of {candidates.length} registered candidates</p>
      </div>

      <div className="card mb-5 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input className="input pl-10 text-sm" placeholder="Search name, email, city..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="input w-auto min-w-[130px] text-sm" value={educationFilter} onChange={(e) => setEducationFilter(e.target.value)}>
            <option value="">All Education</option>
            {educationLevels.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          <select className="input w-auto min-w-[150px] text-sm" value={expFilter} onChange={(e) => setExpFilter(e.target.value)}>
            <option value="">All Experience</option>
            {experienceYears.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
          {hasFilters && (
            <button onClick={clearFilters} className="btn-secondary flex items-center gap-1 text-sm">
              <Filter className="h-3.5 w-3.5" /> Clear
            </button>
          )}
        </div>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner size="lg" /></div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-semibold text-slate-500">No candidates found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-head">
                  <th className="px-4 py-3">Candidate</th>
                  <th className="px-4 py-3">Education</th>
                  <th className="px-4 py-3">Experience</th>
                  <th className="px-4 py-3">Current Position</th>
                  <th className="px-4 py-3">Domicile</th>
                  <th className="px-4 py-3">CV</th>
                  <th className="px-4 py-3">Applications</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-sag-mist/40 transition">
                    <td className="table-cell">
                      <p className="font-semibold text-slate-800">{c.full_name}</p>
                      <p className="text-xs text-slate-400">{c.email}</p>
                      <p className="text-xs text-slate-400">{c.phone}</p>
                    </td>
                    <td className="table-cell text-slate-600">
                      <p>{c.education ?? '—'}</p>
                      {c.major && <p className="text-xs text-slate-400">{c.major}</p>}
                    </td>
                    <td className="table-cell text-slate-600">{c.experience_year ?? '—'}</td>
                    <td className="table-cell text-slate-600">
                      <p>{c.current_position ?? '—'}</p>
                      {c.current_company && <p className="text-xs text-slate-400">{c.current_company}</p>}
                    </td>
                    <td className="table-cell text-slate-600">{c.domicile ?? '—'}</td>
                    <td className="table-cell">
                      {c.cv_url ? (
                        <a href={c.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-sag-leaf hover:underline">
                          View <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : <span className="text-xs text-slate-400">—</span>}
                    </td>
                    <td className="table-cell">
                      <Link
                        to={`/hr/applications?q=${encodeURIComponent(c.full_name)}`}
                        className="text-xs font-bold text-sag-gold hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </HRLayout>
    </>
  );
}
