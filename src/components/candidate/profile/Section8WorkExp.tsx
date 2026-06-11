import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, WorkExperience } from '@/types';

const emptyRow = (): WorkExperience => ({ year_from: '', year_to: '', company: '', initial_position: '', final_position: '', initial_salary: '', final_salary: '', reason_leaving: '', responsibilities: '' });

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section8WorkExp({ profile, onSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<{ rows: WorkExperience[] }>({
    defaultValues: { rows: [emptyRow()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  useEffect(() => {
    reset({ rows: profile?.work_experiences?.length ? profile.work_experiences : [emptyRow()] });
  }, [profile, reset]);

  const onSubmit = async (data: { rows: WorkExperience[] }) => {
    await onSave({ work_experiences: data.rows.filter((r) => r.company.trim()) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-1 text-lg font-black text-sag-green">8. Pengalaman Kerja</h2>
      <p className="mb-5 text-xs text-slate-500">Dimulai dari perusahaan terakhir, pengalaman 10 tahun terakhir.</p>
      <div className="space-y-5">
        {fields.map((f, i) => (
          <div key={f.id} className="rounded-2xl border border-slate-200 p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-sag-green">Perusahaan #{i + 1}</span>
              <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label text-xs">Tahun Masuk *</label>
                <input {...register(`rows.${i}.year_from`)} className="input mt-1 text-sm" placeholder="mm/yyyy" />
              </div>
              <div>
                <label className="label text-xs">Tahun Keluar <span className="text-slate-400">(kosong = masih bekerja)</span></label>
                <input {...register(`rows.${i}.year_to`)} className="input mt-1 text-sm" placeholder="mm/yyyy" />
              </div>
              <div className="sm:col-span-2">
                <label className="label text-xs">Nama & Alamat Perusahaan *</label>
                <input {...register(`rows.${i}.company`)} className="input mt-1 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Jabatan Awal</label>
                <input {...register(`rows.${i}.initial_position`)} className="input mt-1 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Jabatan Akhir *</label>
                <input {...register(`rows.${i}.final_position`)} className="input mt-1 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Gaji Awal (Rp)</label>
                <input {...register(`rows.${i}.initial_salary`)} type="number" className="input mt-1 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Gaji Akhir (Rp)</label>
                <input {...register(`rows.${i}.final_salary`)} type="number" className="input mt-1 text-sm" />
              </div>
              <div>
                <label className="label text-xs">Alasan Keluar</label>
                <textarea {...register(`rows.${i}.reason_leaving`)} className="input mt-1 h-16 resize-none text-sm" />
              </div>
              <div>
                <label className="label text-xs">Tanggung Jawab</label>
                <textarea {...register(`rows.${i}.responsibilities`)} className="input mt-1 h-16 resize-none text-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => append(emptyRow())} className="btn-secondary mt-4 text-sm">
        <Plus className="mr-1 h-4 w-4" /> Tambah Pengalaman
      </button>
      <SectionSaveBar isSubmitting={isSubmitting} />
    </form>
  );
}
