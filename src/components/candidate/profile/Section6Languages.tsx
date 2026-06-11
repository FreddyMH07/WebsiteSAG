import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, Language } from '@/types';

const emptyRow = (): Language => ({ language: '', speaking: '', writing: '', reading: '' });
const skills = ['Kurang','Cukup','Baik','Sangat Baik'];

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section6Languages({ profile, onSave }: Props) {
  const { register, handleSubmit, control, reset, formState: { isSubmitting } } = useForm<{ rows: Language[] }>({
    defaultValues: { rows: [emptyRow()] },
  });
  const { fields, append, remove } = useFieldArray({ control, name: 'rows' });

  useEffect(() => {
    reset({ rows: profile?.languages?.length ? profile.languages : [emptyRow()] });
  }, [profile, reset]);

  const onSubmit = async (data: { rows: Language[] }) => {
    await onSave({ languages: data.rows.filter((r) => r.language.trim()) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">6. Kemampuan Bahasa</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] text-sm">
          <thead>
            <tr className="table-head">
              {['Bahasa Asing','Bicara','Tulis','Membaca',''].map((h) => (
                <th key={h} className="px-3 py-2 text-left">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fields.map((f, i) => (
              <tr key={f.id} className="border-b border-slate-100">
                <td className="px-2 py-1.5"><input {...register(`rows.${i}.language`)} className="input text-xs" placeholder="Inggris, Mandarin..." /></td>
                {(['speaking','writing','reading'] as const).map((k) => (
                  <td key={k} className="px-2 py-1.5">
                    <select {...register(`rows.${i}.${k}`)} className="input text-xs">
                      <option value="">-</option>
                      {skills.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                ))}
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
