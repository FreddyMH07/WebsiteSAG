import { useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, ExternalLink, Globe } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLang } from '@/hooks/useLang';
import { sagAssets } from '@/data/siteContent';

export default function Navbar() {
  const { profile, isAdmin, signOut } = useAuth();
  const { lang, toggle } = useLang();
  const [open, setOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const { pathname } = useLocation();

  const dashboardHref = isAdmin ? '/hr/dashboard' : '/candidate/dashboard';
  const isActiveJobs = pathname.startsWith('/jobs') || pathname.startsWith('/apply');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-xl shadow-sm">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 flex-shrink-0">
          <img src={sagAssets.logo} alt="PT Sahabat Agro Group" className="h-10 w-auto object-contain" />
          <div className="hidden sm:block">
            <p className="text-sm font-black tracking-tight text-sag-green leading-tight">Sahabat Agro Group</p>
            <p className="text-[10px] text-slate-400 leading-tight">Career Portal</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 text-sm font-semibold text-slate-600 lg:flex">
          <Link
            to="/?tab=overview"
            className={`px-4 py-2 rounded-xl transition ${pathname === '/' && !window.location.search.includes('tab=jobs') ? 'text-sag-green bg-sag-mist' : 'hover:text-sag-green hover:bg-sag-mist'}`}
          >
            Overview
          </Link>
          <NavLink
            to="/jobs"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl transition ${isActive || isActiveJobs ? 'text-sag-green bg-sag-mist' : 'hover:text-sag-green hover:bg-sag-mist'}`
            }
          >
            {lang === 'id' ? 'Lowongan' : 'Jobs'}
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              `px-4 py-2 rounded-xl transition ${isActive ? 'text-sag-green bg-sag-mist' : 'hover:text-sag-green hover:bg-sag-mist'}`
            }
          >
            {lang === 'id' ? 'Kontak' : 'Contact'}
          </NavLink>
        </nav>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          {/* Lang toggle */}
          <button
            onClick={toggle}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:border-sag-green/40 hover:text-sag-green transition"
            title="Ganti bahasa / Switch language"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === 'id' ? 'EN' : 'ID'}
          </button>

          {/* Back to main site */}
          <a
            href="https://sahabatagro.co.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-400 hover:text-sag-green transition"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {lang === 'id' ? 'Website Utama' : 'Main Site'}
          </a>

          {profile ? (
            <div className="relative">
              <button
                onClick={() => setDropOpen(!dropOpen)}
                className="btn-secondary flex items-center gap-2 text-sm py-2"
              >
                {profile.full_name.split(' ')[0]}
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-slate-200 bg-white py-2 shadow-sag-soft">
                  <Link
                    to={dashboardHref}
                    onClick={() => setDropOpen(false)}
                    className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-sag-mist"
                  >
                    Dashboard
                  </Link>
                  {!isAdmin && (
                    <>
                      <Link to="/candidate/profile" onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-sag-mist">
                        {lang === 'id' ? 'Profil Saya' : 'My Profile'}
                      </Link>
                      <Link to="/candidate/applications" onClick={() => setDropOpen(false)} className="block px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-sag-mist">
                        {lang === 'id' ? 'Lamaran Saya' : 'My Applications'}
                      </Link>
                    </>
                  )}
                  <hr className="my-1 border-slate-100" />
                  <button
                    onClick={() => { signOut(); setDropOpen(false); }}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-4 w-4" />
                    {lang === 'id' ? 'Keluar' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/candidate/login" className="btn-secondary text-sm py-2">
                {lang === 'id' ? 'Masuk' : 'Sign In'}
              </Link>
              <Link to="/candidate/register" className="btn-primary text-sm py-2">
                {lang === 'id' ? 'Daftar' : 'Register'}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggle}
            className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600"
          >
            <Globe className="h-3.5 w-3.5" />
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <button onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6 text-sag-green" /> : <Menu className="h-6 w-6 text-sag-green" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-100 bg-white pb-4 lg:hidden">
          <nav className="flex flex-col px-4 pt-2">
            {[
              { to: '/?tab=overview', label: 'Overview' },
              { to: '/jobs', label: lang === 'id' ? 'Lowongan' : 'Jobs' },
              { to: '/contact', label: lang === 'id' ? 'Kontak' : 'Contact' },
            ].map(({ to, label }) => (
              <Link key={to} to={to} onClick={() => setOpen(false)} className="py-3 text-sm font-semibold border-b border-slate-100 text-slate-700">
                {label}
              </Link>
            ))}
            <a href="https://sahabatagro.co.id" target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className="flex items-center gap-1.5 py-3 text-sm font-semibold border-b border-slate-100 text-slate-500">
              <ExternalLink className="h-4 w-4" /> {lang === 'id' ? 'Website Utama' : 'Main Site'}
            </a>
            <div className="mt-4 flex flex-col gap-2">
              {profile ? (
                <>
                  <Link to={dashboardHref} onClick={() => setOpen(false)} className="btn-secondary justify-center">Dashboard</Link>
                  {!isAdmin && <Link to="/candidate/applications" onClick={() => setOpen(false)} className="btn-secondary justify-center">{lang === 'id' ? 'Lamaran Saya' : 'My Applications'}</Link>}
                  <button onClick={() => { signOut(); setOpen(false); }} className="btn-danger justify-center">{lang === 'id' ? 'Keluar' : 'Sign Out'}</button>
                </>
              ) : (
                <>
                  <Link to="/candidate/login" onClick={() => setOpen(false)} className="btn-primary justify-center">{lang === 'id' ? 'Masuk' : 'Sign In'}</Link>
                  <Link to="/candidate/register" onClick={() => setOpen(false)} className="btn-secondary justify-center">{lang === 'id' ? 'Daftar' : 'Register'}</Link>
                  <Link to="/hr/login" onClick={() => setOpen(false)} className="text-center text-xs text-slate-400 py-2 hover:text-sag-green">HR Admin Login</Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
