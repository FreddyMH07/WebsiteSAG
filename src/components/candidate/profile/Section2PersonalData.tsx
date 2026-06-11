import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, Candidate } from '@/types';

const schema = z.object({
  full_name:       z.string().min(2, 'Wajib diisi'),
  phone:           z.string().min(8, 'Wajib diisi'),
  birth_place:     z.string().min(1, 'Wajib diisi'),
  birth_date:      z.string().min(1, 'Wajib diisi'),
  blood_type:      z.string().optional(),
  gender:          z.string().min(1, 'Wajib diisi'),
  religion:        z.string().optional(),
  marital_status:  z.string().min(1, 'Wajib diisi'),
  nik:             z.string().length(16, 'NIK harus 16 digit').regex(/^\d+$/, 'Hanya angka'),
  address_current: z.string().min(5, 'Wajib diisi'),
  address_ktp:     z.string().min(5, 'Wajib diisi'),
  same_address:    z.boolean().optional(),
});
type F = z.infer<typeof schema>;

interface Props {
  profile: CandidateProfile | null;
  candidate: Candidate | null;
  email: string;
  onSave: (patch: CandidateProfilePatch) => Promise<void>;
}

export default function Section2PersonalData({ profile, candidate, email, onSave }: Props) {
  const [sameAddr, setSameAddr] = useState(false);
  const { register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', phone: '', birth_place: '', birth_date: '', blood_type: '', gender: '', religion: '', marital_status: '', nik: '', address_current: '', address_ktp: '', same_address: false },
  });

  useEffect(() => {
    reset({
      full_name:       candidate?.full_name ?? '',
      phone:           candidate?.phone ?? '',
      birth_place:     profile?.birth_place ?? '',
      birth_date:      profile?.birth_date ?? '',
      blood_type:      profile?.blood_type ?? '',
      gender:          profile?.gender ?? '',
      religion:        profile?.religion ?? '',
      marital_status:  profile?.marital_status ?? '',
      nik:             profile?.nik ?? '',
      address_current: profile?.address_current ?? '',
      address_ktp:     profile?.address_ktp ?? '',
    });
  }, [profile, candidate, reset]);

  const currentAddr = watch('address_current');
  const handleSameAddr = (checked: boolean) => {
    setSameAddr(checked);
    if (checked) setValue('address_ktp', currentAddr);
  };

  const onSubmit = async (data: F) => {
    const { same_address, ...rest } = data;
    await onSave(rest);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">2. Data Diri</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nama Lengkap *</label>
          <input {...register('full_name')} className="input mt-1" />
          {errors.full_name && <p className="mt-1 text-xs text-red-500">{errors.full_name.message}</p>}
        </div>
        <div>
          <label className="label">Email</label>
          <input value={email} disabled className="input mt-1 bg-slate-50 text-slate-400" />
        </div>
        <div>
          <label className="label">Tempat Lahir *</label>
          <input {...register('birth_place')} className="input mt-1" />
          {errors.birth_place && <p className="mt-1 text-xs text-red-500">{errors.birth_place.message}</p>}
        </div>
        <div>
          <label className="label">Tanggal Lahir *</label>
          <input {...register('birth_date')} type="date" className="input mt-1" />
          {errors.birth_date && <p className="mt-1 text-xs text-red-500">{errors.birth_date.message}</p>}
        </div>
        <div>
          <label className="label">Golongan Darah</label>
          <select {...register('blood_type')} className="input mt-1">
            <option value="">Pilih...</option>
            {['A','B','AB','O','Tidak tahu'].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Jenis Kelamin *</label>
          <select {...register('gender')} className="input mt-1">
            <option value="">Pilih...</option>
            <option value="Laki-laki">Laki-laki</option>
            <option value="Perempuan">Perempuan</option>
          </select>
          {errors.gender && <p className="mt-1 text-xs text-red-500">{errors.gender.message}</p>}
        </div>
        <div>
          <label className="label">No. Telp / HP *</label>
          <input {...register('phone')} type="tel" className="input mt-1" />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="label">Agama</label>
          <select {...register('religion')} className="input mt-1">
            <option value="">Pilih...</option>
            {['Islam','Kristen Protestan','Katolik','Hindu','Buddha','Konghucu','Lainnya'].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status Perkawinan *</label>
          <select {...register('marital_status')} className="input mt-1">
            <option value="">Pilih...</option>
            {['Belum Menikah','Menikah','Cerai Hidup','Cerai Mati'].map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          {errors.marital_status && <p className="mt-1 text-xs text-red-500">{errors.marital_status.message}</p>}
        </div>
        <div>
          <label className="label">No. KTP (NIK) * — 16 digit</label>
          <input {...register('nik')} className="input mt-1" maxLength={16} />
          {errors.nik && <p className="mt-1 text-xs text-red-500">{errors.nik.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label className="label">Alamat Lengkap Saat Ini *</label>
          <textarea {...register('address_current')} className="input mt-1 h-20 resize-none" />
          {errors.address_current && <p className="mt-1 text-xs text-red-500">{errors.address_current.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <div className="mb-2 flex items-center gap-2">
            <label className="label mb-0">Alamat Lengkap Sesuai KTP *</label>
            <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-500">
              <input type="checkbox" checked={sameAddr} onChange={(e) => handleSameAddr(e.target.checked)} className="accent-sag-green" />
              Sama dengan alamat saat ini
            </label>
          </div>
          <textarea {...register('address_ktp')} className="input h-20 resize-none" />
          {errors.address_ktp && <p className="mt-1 text-xs text-red-500">{errors.address_ktp.message}</p>}
        </div>
      </div>
      <SectionSaveBar isSubmitting={isSubmitting} />
    </form>
  );
}
