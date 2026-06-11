import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, FamilyMember } from '@/types';

const emptyRow = (): FamilyMember => ({ relation: '', name: '', gender: '', age: '', occupation: '', address: '' });

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section3Family({ profile, onSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<{ rows: FamilyMember[] }>({
    defaultValues: { rows: [emptyRow()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  useEffect(() => {
    reset({ rows: profile?.family_members?.length ? profile.family_members : [emptyRow()] });
  }, [profile, reset]);

  const onSubmit = async (data: { rows: FamilyMember[] }) => {
    await onSave({ family_members: data.rows.filter((r) => r.name.trim()) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">3. Data Keluarga</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-sm">
          <thead>
            <tr className="table-head">
              {['Hubungan *','Nama *','L/P','Usia','Pekerjaan','Alamat',''].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="px-2 py-1.5">
                  <select {...register(`rows.${i}.relation`)} className="input text-xs">
                    <option value="">Pilih</option>
                    {['Ayah','Ibu','Suami','Istri','Anak','Kakak','Adik'].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.name`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5">
                  <select {...register(`rows.${i}.gender`)} className="input text-xs w-16">
                    <option value="">-</option>
                    <option value="L">L</option>
                    <option value="P">P</option>
                  </select>
                </td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.age`)} type="number" className="input text-xs w-16" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.occupation`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.address`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5">
                  <button type="button" onClick={() => remove(i)} className="text-red-400 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </button>
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
