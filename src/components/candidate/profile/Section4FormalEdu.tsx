import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, FormalEducation } from '@/types';

const emptyRow = (): FormalEducation => ({ level: '', school_name: '', major: '', city: '', year_from: '', year_to: '', gpa: '' });
const levels = ['SD','SMP','SMA/SMK','D1','D2','D3','D4','S1','S2','S3'];

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section4FormalEdu({ profile, onSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<{ rows: FormalEducation[] }>({
    defaultValues: { rows: [emptyRow()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  useEffect(() => {
    reset({ rows: profile?.formal_education?.length ? profile.formal_education : [emptyRow()] });
  }, [profile, reset]);

  const onSubmit = async (data: { rows: FormalEducation[] }) => {
    await onSave({ formal_education: data.rows.filter((r) => r.school_name.trim()) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">4. Pendidikan Formal</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm">
          <thead>
            <tr className="table-head">
              {['Jenjang *','Nama Sekolah *','Jurusan','Kota','Dari','Sampai','IPK/Nilai',''].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="px-2 py-1.5">
                  <select {...register(`rows.${i}.level`)} className="input text-xs w-24">
                    <option value="">-</option>
                    {levels.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.school_name`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.major`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.city`)} className="input text-xs w-24" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.year_from`)} className="input text-xs w-20" placeholder="2010" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.year_to`)} className="input text-xs w-20" placeholder="2014" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.gpa`)} className="input text-xs w-20" /></td>
                <td className="px-2 py-1.5">
                  <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => append(emptyRow())} className="btn-secondary mt-3 text-sm">
        <Plus className="mr-1 h-4 w-4" /> Tambah Baris
      </button>
      <SectionSaveBar isSubmitting={isSubmitting} />
    </form>
  );
}
