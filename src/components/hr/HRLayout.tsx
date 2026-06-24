import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import HelpDesk from '@/components/hr/HelpDesk';
import { LayoutDashboard, Users, FileText, Menu, LogOut, ChevronRight, Briefcase, Building2, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { sagAssets } from '@/data/siteContent';

const BASE_MENU = [
  { label: 'Dashboard',    href: '/hr/dashboard',    icon: LayoutDashboard },
  { label: 'Jobs',         href: '/hr/jobs',          icon: Briefcase },
  { label: 'Applications', href: '/hr/applications',  icon: FileText },
  { label: 'Candidates',   href: '/hr/candidates',    icon: Users },
  { label: 'Perusahaan',   href: '/hr/companies',     icon: Building2 },
];

export default function HRLayout({ children }: { children: React.ReactNode }) {
  const { profile, isSuperAdmin, signOut } = useAuth();

  const menu = [
    ...BASE_MENU,
    ...(isSuperAdmin ? [{ label: 'Kelola User', href: '/hr/users', icon: ShieldCheck }] : []),
  ];
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/hr/login');
  };

  const Sidebar = () => (
    <aside className="flex h-full w-64 flex-col bg-sag-forest">
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <div className="h-9 w-9 rounded-lg bg-white p-1 flex-shrink-0">
          <img src={sagAssets.logo} alt="SAG" className="h-full w-full object-contain" />
        </div>
        <div>
          <p className="text-xs font-black text-white">Sahabat Agro Group</p>
          <p className="text-[10px] text-white/50">HR Admin Portal</p>
        </div>
      </div>
      <nav className="flex-1 p-4">
        {menu.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition mb-1 ${
                isActive ? 'bg-sag-gold text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-white/10 p-4">
        <div className="mb-3 flex items-center gap-2 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sag-gold text-xs font-black text-white">
            {profile?.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-white">{profile?.full_name}</p>
            <p className="text-[10px] text-white/50 capitalize">{profile?.role?.replace('_', ' ')}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="flex w-full items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-500/10 transition">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-sag-mist">
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="flex">
            <Sidebar />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden">
            <Menu className="h-5 w-5 text-slate-600" />
          </button>
          <nav className="hidden items-center gap-2 text-xs text-slate-500 lg:flex">
            <Link to="/" className="hover:text-sag-green">Career Portal</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="font-semibold text-sag-green">HR Admin</span>
          </nav>
          <button onClick={handleSignOut} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition">
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Helpdesk widget — mounts on all HR pages, never printed */}
      <HelpDesk />
    </div>
  );
}
