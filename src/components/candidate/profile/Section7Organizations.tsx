import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, Organization } from '@/types';

const emptyRow = (): Organization => ({ org_name: '', period: '', city: '', position: '' });

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section7Organizations({ profile, onSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<{ rows: Organization[] }>({
    defaultValues: { rows: [emptyRow()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  useEffect(() => {
    reset({ rows: profile?.organizations?.length ? profile.organizations : [emptyRow()] });
  }, [profile, reset]);

  const onSubmit = async (data: { rows: Organization[] }) => {
    await onSave({ organizations: data.rows.filter((r) => r.org_name.trim()) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">7. Aktivitas Sosial & Pengalaman Organisasi</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-sm">
          <thead>
            <tr className="table-head">
              {['Nama Organisasi / Kegiatan','Periode','Kota','Jabatan',''].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.org_name`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.period`)} className="input text-xs w-28" placeholder="2018-2020" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.city`)} className="input text-xs w-28" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.position`)} className="input text-xs" /></td>
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
