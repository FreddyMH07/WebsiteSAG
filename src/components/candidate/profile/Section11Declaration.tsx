import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ShieldCheck } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch } from '@/types';

const schema = z.object({
  declared_name:      z.string().min(2, 'Wajib diisi'),
  consent_data_truth: z.literal(true, { errorMap: () => ({ message: 'Wajib disetujui' }) }),
  consent_pdp:        z.literal(true, { errorMap: () => ({ message: 'Wajib disetujui' }) }),
});
type F = z.infer<typeof schema>;

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section11Declaration({ profile, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { declared_name: '', consent_data_truth: undefined, consent_pdp: undefined },
  });

  useEffect(() => {
    reset({
      declared_name:      profile?.declared_name ?? '',
      consent_data_truth: profile?.consent_data_truth === true ? true : undefined,
      consent_pdp:        profile?.consent_pdp === true ? true : undefined,
    });
  }, [profile, reset]);

  const onSubmit = async (data: F) => {
    await onSave({
      consent_data_truth: data.consent_data_truth,
      consent_pdp:        data.consent_pdp,
      declared_name:      data.declared_name,
      declared_at:        new Date().toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">11. Pernyataan & Persetujuan</h2>

      <div className="space-y-4">
        <label className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4 cursor-pointer hover:bg-sag-mist/30 transition">
          <input {...register('consent_data_truth')} type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0 accent-sag-green" />
          <p className="text-sm text-slate-700 leading-6">
            Saya menjamin bahwa semua yang saya tulis di Lembar Data Pribadi ini adalah benar dan lengkap.
            Saya memahami bahwa adanya informasi yang tidak benar (atau penghapusan) di dalam aplikasi ini, atau dokumen pendukungnya,
            merupakan bukti yang memadai untuk pembatalan penawaran kerja atau pemutusan hubungan kerja tanpa pesangon jika saya diterima bekerja
            (sesuai pasal 1603 O KUH Perdata).
          </p>
        </label>
        {errors.consent_data_truth && <p className="text-xs text-red-500">{errors.consent_data_truth.message}</p>}

        <label className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4 cursor-pointer hover:bg-blue-100/50 transition">
          <input {...register('consent_pdp')} type="checkbox" className="mt-0.5 h-4 w-4 flex-shrink-0 accent-sag-green" />
          <p className="text-sm text-slate-700 leading-6">
            <ShieldCheck className="mb-0.5 mr-1 inline h-4 w-4 text-blue-600" />
            Saya memberikan persetujuan eksplisit kepada PT Sahabat Agro Group untuk memproses data pribadi saya, termasuk data pribadi spesifik (data kesehatan),
            semata-mata untuk keperluan proses rekrutmen, sesuai UU No. 27 Tahun 2022 tentang Pelindungan Data Pribadi.
          </p>
        </label>
        {errors.consent_pdp && <p className="text-xs text-red-500">{errors.consent_pdp.message}</p>}
      </div>

      <div className="mt-5">
        <label className="label">Nama Lengkap (sebagai tanda tangan digital) *</label>
        <input {...register('declared_name')} className="input mt-1 max-w-sm" placeholder="Tulis nama lengkap Anda" />
        {errors.declared_name && <p className="mt-1 text-xs text-red-500">{errors.declared_name.message}</p>}
      </div>

      {profile?.declared_at && (
        <p className="mt-3 text-xs text-green-700">
          Terakhir ditandatangani: {new Date(profile.declared_at).toLocaleString('id-ID')}
        </p>
      )}

      <SectionSaveBar isSubmitting={isSubmitting} label="Tandatangani & Simpan" />
    </form>
  );
}
