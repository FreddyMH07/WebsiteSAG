import { useState, useEffect, useCallback, useRef } from 'react';
import { Building2, Plus, Pencil, Upload, X, Image } from 'lucide-react';
import HRLayout from '@/components/hr/HRLayout';
import Spinner from '@/components/common/Spinner';
import { useToast } from '@/hooks/useToast';
import { supabase } from '@/lib/supabase';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Company {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  address: string | null;
  is_holding: boolean;
}

interface CompanyForm {
  name: string;
  short_name: string;
  address: string;
}

const EMPTY_FORM: CompanyForm = { name: '', short_name: '', address: '' };

// ── Main ──────────────────────────────────────────────────────────────────────

export default function HRCompanies() {
  const { toast } = useToast();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<'add' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Company | null>(null);
  const [form, setForm] = useState<CompanyForm>(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('companies')
      .select('*')
      .order('is_holding', { ascending: false })
      .order('name');
    setCompanies(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setLogoFile(null);
    setLogoPreview(null);
    setModal('add');
  };

  const openEdit = (c: Company) => {
    setEditing(c);
    setForm({ name: c.name, short_name: c.short_name ?? '', address: c.address ?? '' });
    setLogoFile(null);
    setLogoPreview(null);
    setModal('edit');
  };

  const closeModal = () => {
    setModal(null);
    setEditing(null);
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleFileSelect = (file: File) => {
    if (file.size > 1024 * 1024) { toast('Ukuran logo maksimal 1 MB.', 'error'); return; }
    if (!['image/png', 'image/webp', 'image/jpeg'].includes(file.type)) {
      toast('Format logo harus PNG, WebP, atau JPG.', 'error');
      return;
    }
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast('Nama perusahaan wajib diisi.', 'error'); return; }
    setSaving(true);

    let logo_url: string | null | undefined = undefined; // undefined = don't change

    if (logoFile) {
      const ext = logoFile.name.split('.').pop();
      const slug = form.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 24);
      const path = `${slug}/${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('company-logos')
        .upload(path, logoFile, { upsert: true });
      if (uploadErr) {
        toast('Gagal upload logo: ' + uploadErr.message, 'error');
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from('company-logos').getPublicUrl(path);
      logo_url = urlData.publicUrl;
    }

    const payload: Record<string, unknown> = {
      name:       form.name.trim(),
      short_name: form.short_name.trim() || null,
      address:    form.address.trim() || null,
    };
    if (logo_url !== undefined) payload.logo_url = logo_url;

    if (modal === 'add') {
      const { error } = await supabase.from('companies').insert(payload);
      if (error) { toast('Gagal menyimpan: ' + error.message, 'error'); setSaving(false); return; }
      toast('Perusahaan berhasil ditambahkan.', 'success');
    } else if (editing) {
      const { error } = await supabase.from('companies').update(payload).eq('id', editing.id);
      if (error) { toast('Gagal menyimpan: ' + error.message, 'error'); setSaving(false); return; }
      toast('Perusahaan berhasil diperbarui.', 'success');
    }

    setSaving(false);
    closeModal();
    fetchCompanies();
  };

  return (
    <HRLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-sag-green">Kelola Perusahaan</h1>
          <p className="mt-0.5 text-sm text-slate-500">Daftar PT dalam Grup SAG — logo digunakan pada kop cetak</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <Plus className="h-4 w-4" /> Tambah PT
        </button>
      </div>

      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-5 py-3 w-20">Logo</th>
                  <th className="px-5 py-3">Nama Perusahaan</th>
                  <th className="px-5 py-3">Singkatan</th>
                  <th className="px-5 py-3">Alamat</th>
                  <th className="px-5 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 hover:bg-sag-mist/40 transition">
                    <td className="px-5 py-3">
                      {c.logo_url ? (
                        <img src={c.logo_url} alt={c.short_name ?? c.name}
                          className="h-10 w-auto max-w-[80px] object-contain" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                          <Image className="h-5 w-5 text-slate-300" />
                        </div>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span className="font-semibold text-slate-800">{c.name}</span>
                      {c.is_holding && (
                        <span className="ml-2 rounded-full bg-sag-gold/20 px-2 py-0.5 text-xs font-bold text-sag-gold">
                          Holding
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-500">{c.short_name ?? '—'}</td>
                    <td className="px-5 py-3 text-slate-500 max-w-xs truncate">{c.address ?? '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => openEdit(c)} title="Edit"
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-sag-green transition">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="card w-full max-w-lg p-7">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-xl font-black text-sag-green">
                {modal === 'add' ? 'Tambah Perusahaan' : 'Edit Perusahaan'}
              </h2>
              <button onClick={closeModal}
                className="rounded-full p-1 text-slate-400 hover:text-red-500 transition">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Logo upload section */}
              <div>
                <label className="label">Logo Perusahaan</label>
                <div className="mt-1 flex items-start gap-4">
                  <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="preview" className="h-full w-full object-contain p-1" />
                    ) : editing?.logo_url ? (
                      <img src={editing.logo_url} alt="logo" className="h-full w-full object-contain p-1" />
                    ) : (
                      <Building2 className="h-8 w-8 text-slate-300" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".png,.webp,.jpg,.jpeg"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) handleFileSelect(f);
                        e.target.value = '';
                      }}
                    />
                    <button type="button" onClick={() => fileRef.current?.click()}
                      className="btn-secondary text-sm flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      {logoFile ? logoFile.name : (editing?.logo_url ? 'Ganti Logo' : 'Upload Logo')}
                    </button>
                    <p className="mt-1.5 text-xs text-slate-400">PNG, WebP, JPG · Maksimal 1 MB</p>
                    {logoPreview && (
                      <button type="button"
                        onClick={() => { setLogoFile(null); setLogoPreview(null); }}
                        className="mt-1 text-xs text-red-400 hover:text-red-600">
                        Batalkan pilihan logo
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="label">Nama Perusahaan <span className="text-red-500">*</span></label>
                <input className="input mt-1" value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="mis. PT Garuda Bumi Perkasa" />
              </div>

              <div>
                <label className="label">Singkatan / Short Name</label>
                <input className="input mt-1" value={form.short_name}
                  onChange={(e) => setForm((p) => ({ ...p, short_name: e.target.value }))}
                  placeholder="mis. GBP" />
              </div>

              <div>
                <label className="label">Alamat</label>
                <textarea className="input mt-1 h-24 resize-none" value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  placeholder="Alamat lengkap perusahaan (opsional)…" />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={closeModal} className="btn-secondary">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Spinner size="sm" /> : modal === 'add' ? 'Simpan' : 'Simpan Perubahan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </HRLayout>
  );
}
