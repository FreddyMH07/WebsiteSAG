import { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Users, Search, ShieldCheck, ShieldOff, Shield,
  UserCheck, UserX, Mail, AlertCircle, CheckCircle2, RefreshCw,
} from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole, UserStatus } from '@/types';

const ROLE_LABEL: Record<UserRole, string> = {
  candidate:   'Kandidat',
  hr_admin:    'HR Admin',
  super_admin: 'Super Admin',
};

const ROLE_COLOR: Record<UserRole, string> = {
  candidate:   'bg-slate-100 text-slate-600',
  hr_admin:    'bg-blue-100 text-blue-700',
  super_admin: 'bg-amber-100 text-amber-700',
};

const STATUS_COLOR: Record<UserStatus, string> = {
  active:   'bg-emerald-100 text-emerald-700',
  inactive: 'bg-red-100 text-red-600',
};

export default function UserManagement() {
  const { profile: myProfile, isSuperAdmin } = useAuth();
  const { toast } = useToast();

  const [hrUsers, setHrUsers]           = useState<Profile[]>([]);
  const [loading, setLoading]           = useState(true);
  const [actionId, setActionId]         = useState<string | null>(null);

  const [searchEmail, setSearchEmail]   = useState('');
  const [searching, setSearching]       = useState(false);
  const [searchResult, setSearchResult] = useState<Profile | null | 'not_found'>(null);
  const [inviteSent, setInviteSent]     = useState(false);

  const loadHRUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .in('role', ['hr_admin', 'super_admin'])
      .order('role', { ascending: false })
      .order('full_name');
    if (error) toast('Gagal memuat data pengguna: ' + error.message, 'error');
    else       setHrUsers(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { loadHRUsers(); }, [loadHRUsers]);

  async function updateProfile(id: string, patch: Partial<Pick<Profile, 'role' | 'status'>>) {
    setActionId(id);
    const { error } = await supabase
      .from('profiles')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      toast('Gagal memperbarui: ' + error.message, 'error');
      setActionId(null);
      return;
    }

    toast('Berhasil diperbarui', 'success');
    await loadHRUsers();

    if (searchResult && searchResult !== 'not_found' && searchResult.id === id) {
      const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) setSearchResult(data);
    }
    setActionId(null);
  }

  async function handleSearch() {
    const email = searchEmail.trim().toLowerCase();
    if (!email) return;
    setSearching(true);
    setSearchResult(null);
    setInviteSent(false);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) toast('Error pencarian: ' + error.message, 'error');
    else       setSearchResult(data ?? 'not_found');
    setSearching(false);
  }

  async function handleInvite() {
    const email = searchEmail.trim().toLowerCase();
    if (!email) return;
    setActionId('invite');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) toast('Gagal kirim undangan: ' + error.message, 'error');
    else       setInviteSent(true);
    setActionId(null);
  }

  if (!isSuperAdmin) {
    return (
      <HRLayout>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ShieldOff className="mb-4 h-12 w-12 text-slate-300" />
          <h2 className="text-lg font-bold text-slate-700">Akses Dibatasi</h2>
          <p className="mt-1 text-sm text-slate-500">Halaman ini hanya dapat diakses oleh Super Admin.</p>
        </div>
      </HRLayout>
    );
  }

  return (
    <HRLayout>
      <Helmet><title>Kelola Pengguna — SAG HR</title></Helmet>
      <div className="mx-auto max-w-4xl space-y-8">

        <div>
          <h1 className="text-2xl font-black text-sag-forest">Kelola Pengguna HR</h1>
          <p className="mt-1 text-sm text-slate-500">
            Atur role dan akses tim HR. Hanya Super Admin yang dapat mengakses halaman ini.
          </p>
        </div>

        {/* ── Tim HR saat ini ────────────────────────────────────────── */}
        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-bold text-slate-800">
              <Users className="h-4 w-4 text-sag-green" />
              Tim HR ({hrUsers.length})
            </h2>
            <button
              onClick={loadHRUsers}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition"
            >
              <RefreshCw className="h-3 w-3" /> Refresh
            </button>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-400">Memuat…</p>
          ) : hrUsers.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">Belum ada pengguna HR.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm">
                <thead>
                  <tr className="table-head">
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {hrUsers.map(u => {
                    const isMe = u.id === myProfile?.id;
                    const busy = actionId === u.id;
                    return (
                      <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium text-slate-800">{u.full_name}</td>
                        <td className="px-4 py-3 text-slate-500">{u.email}</td>
                        <td className="px-4 py-3">
                          <span className={`badge ${ROLE_COLOR[u.role]}`}>
                            {ROLE_LABEL[u.role]}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`badge ${STATUS_COLOR[u.status]}`}>
                            {u.status === 'active' ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isMe ? (
                            <span className="text-xs italic text-slate-400">Akun Anda</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {u.role === 'hr_admin' && (
                                <button
                                  disabled={busy}
                                  onClick={() => updateProfile(u.id, { role: 'super_admin' })}
                                  className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition"
                                >
                                  <ShieldCheck className="h-3 w-3" /> Super Admin
                                </button>
                              )}
                              {u.role === 'super_admin' && (
                                <button
                                  disabled={busy}
                                  onClick={() => updateProfile(u.id, { role: 'hr_admin' })}
                                  className="flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 transition"
                                >
                                  <Shield className="h-3 w-3" /> Turunkan ke HR Admin
                                </button>
                              )}
                              {u.status === 'active' ? (
                                <button
                                  disabled={busy}
                                  onClick={() => updateProfile(u.id, { status: 'inactive' })}
                                  className="flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition"
                                >
                                  <UserX className="h-3 w-3" /> Nonaktifkan
                                </button>
                              ) : (
                                <button
                                  disabled={busy}
                                  onClick={() => updateProfile(u.id, { status: 'active' })}
                                  className="flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 transition"
                                >
                                  <UserCheck className="h-3 w-3" /> Aktifkan
                                </button>
                              )}
                              <button
                                disabled={busy}
                                onClick={() => {
                                  if (confirm(`Cabut akses HR dari ${u.full_name}?\nMereka tidak bisa login ke HR portal lagi.`)) {
                                    updateProfile(u.id, { role: 'candidate' });
                                  }
                                }}
                                className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200 disabled:opacity-50 transition"
                              >
                                Cabut Akses HR
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* ── Tambah / Promosikan ─────────────────────────────────────── */}
        <section className="card p-6">
          <h2 className="mb-1 flex items-center gap-2 font-bold text-slate-800">
            <UserCheck className="h-4 w-4 text-sag-green" /> Tambah / Promosikan HR Admin
          </h2>
          <p className="mb-4 text-xs text-slate-500">
            Cari berdasarkan email. Jika user sudah terdaftar, promosikan langsung.
            Jika belum, kirim magic link agar mereka bisa membuat akun — lalu promosikan setelah login pertama.
          </p>

          <div className="flex gap-2">
            <input
              type="email"
              className="input flex-1"
              placeholder="email@contoh.com"
              value={searchEmail}
              onChange={e => {
                setSearchEmail(e.target.value);
                setSearchResult(null);
                setInviteSent(false);
              }}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              disabled={searching || !searchEmail.trim()}
              className="btn-primary flex items-center gap-2 px-5"
            >
              <Search className="h-4 w-4" />
              {searching ? 'Mencari…' : 'Cari'}
            </button>
          </div>

          {/* Found */}
          {searchResult && searchResult !== 'not_found' && (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-slate-800">{searchResult.full_name}</p>
                  <p className="text-sm text-slate-500">{searchResult.email}</p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <span className={`badge ${ROLE_COLOR[searchResult.role]}`}>{ROLE_LABEL[searchResult.role]}</span>
                  <span className={`badge ${STATUS_COLOR[searchResult.status]}`}>
                    {searchResult.status === 'active' ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
              </div>

              {searchResult.role === 'candidate' && (
                <button
                  disabled={!!actionId}
                  onClick={() => updateProfile(searchResult.id, { role: 'hr_admin' })}
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <ShieldCheck className="h-4 w-4" />
                  {actionId === searchResult.id ? 'Menyimpan…' : 'Jadikan HR Admin'}
                </button>
              )}

              {searchResult.role === 'hr_admin' && (
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <CheckCircle2 className="h-3 w-3" /> Sudah HR Admin
                  </span>
                  <button
                    disabled={!!actionId}
                    onClick={() => updateProfile(searchResult.id, { role: 'super_admin' })}
                    className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-50 transition"
                  >
                    <ShieldCheck className="h-3 w-3" />
                    {actionId === searchResult.id ? 'Menyimpan…' : 'Promosikan ke Super Admin'}
                  </button>
                </div>
              )}

              {searchResult.role === 'super_admin' && (
                <span className="flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                  <ShieldCheck className="h-3 w-3" /> Super Admin
                </span>
              )}
            </div>
          )}

          {/* Not found — offer invite */}
          {searchResult === 'not_found' && !inviteSent && (
            <div className="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4">
              <div className="mb-3 flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
                <div>
                  <p className="font-semibold text-orange-800">User belum terdaftar</p>
                  <p className="mt-0.5 text-xs text-orange-700">
                    <strong>{searchEmail}</strong> belum memiliki akun. Kirim magic link agar mereka bisa
                    login dan membuat akun. Setelah login pertama, cari lagi di sini untuk dipromosikan.
                  </p>
                </div>
              </div>
              <button
                disabled={actionId === 'invite'}
                onClick={handleInvite}
                className="flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50 transition"
              >
                <Mail className="h-3 w-3" />
                {actionId === 'invite' ? 'Mengirim…' : 'Kirim Magic Link Undangan'}
              </button>
            </div>
          )}

          {/* Invite sent */}
          {inviteSent && (
            <div className="mt-4 flex items-start gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <div>
                <p className="font-semibold text-emerald-800">Link undangan terkirim!</p>
                <p className="mt-0.5 text-xs text-emerald-700">
                  Email dikirim ke <strong>{searchEmail}</strong>. Setelah mereka klik link dan login pertama kali,
                  kembali ke sini dan cari email mereka untuk mempromosikan menjadi HR Admin.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* ── Catatan keamanan ─────────────────────────────────────────── */}
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
          <p className="mb-1.5 font-semibold text-slate-600">Catatan Keamanan</p>
          <ul className="list-disc space-y-0.5 pl-4">
            <li>Hanya Super Admin yang dapat membuka dan memodifikasi role pengguna.</li>
            <li>Tidak dapat mengubah role akun sendiri (mencegah self-lockout).</li>
            <li>
              Pengguna yang di-nonaktifkan masih bisa login secara teknis. Untuk memblokir sepenuhnya,
              hapus akun di <strong>Supabase Dashboard → Authentication → Users</strong>.
            </li>
          </ul>
        </section>

      </div>
    </HRLayout>
  );
}
