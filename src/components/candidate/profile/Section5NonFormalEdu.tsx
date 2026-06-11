import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, InformalEducation } from '@/types';

const emptyRow = (): InformalEducation => ({ year: '', topic: '', organizer: '', city: '', duration: '', certificate: '' });

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section5NonFormalEdu({ profile, onSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<{ rows: InformalEducation[] }>({
    defaultValues: { rows: [emptyRow()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  useEffect(() => {
    reset({ rows: profile?.informal_education?.length ? profile.informal_education : [emptyRow()] });
  }, [profile, reset]);

  const onSubmit = async (data: { rows: InformalEducation[] }) => {
    await onSave({ informal_education: data.rows.filter((r) => r.topic.trim()) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">5. Pendidikan Non-Formal / Pelatihan</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[750px] text-sm">
          <thead>
            <tr className="table-head">
              {['Tahun','Materi Pelatihan','Penyelenggara','Tempat','Lamanya','Sertifikat',''].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.year`)} className="input text-xs w-20" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.topic`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.organizer`)} className="input text-xs" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.city`)} className="input text-xs w-24" /></td>
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.duration`)} className="input text-xs w-24" /></td>
                <td className="px-2 py-1.5">
                  <select {...register(`rows.${i}.certificate`)} className="input text-xs w-28">
                    <option value="">-</option>
                    <option value="Ada">Ada</option>
                    <option value="Tidak Ada">Tidak Ada</option>
                  </select>
                </td>
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
