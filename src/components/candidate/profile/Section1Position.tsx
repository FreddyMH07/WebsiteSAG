import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SectionSaveBar from './SectionSaveBar';
import type { CandidateProfile, CandidateProfilePatch, ContentfulJob } from '@/types';

const schema = z.object({ applied_position: z.string().min(1, 'Wajib diisi') });
type F = z.infer<typeof schema>;

interface Props {
  profile: CandidateProfile | null;
  jobs: ContentfulJob[];
  onSave: (patch: CandidateProfilePatch) => Promise<void>;
}

export default function Section1Position({ profile, jobs, onSave }: Props) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
    defaultValues: { applied_position: '' },
  });

  useEffect(() => {
    reset({ applied_position: profile?.applied_position ?? '' });
  }, [profile, reset]);

  const onSubmit = async (data: F) => { await onSave(data); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">1. Posisi yang Dilamar</h2>
      <div className="max-w-md">
        <label className="label">Untuk Posisi *</label>
        <select {...register('applied_position')} className="input mt-1">
          <option value="">Pilih posisi...</option>
          {jobs.filter((j) => j.isOpen).map((j) => (
            <option key={j.id} value={j.title}>{j.title}</option>
          ))}
          <option value="__other__">Lainnya</option>
        </select>
        {errors.applied_position && <p className="mt-1 text-xs text-red-500">{errors.applied_position.message}</p>}
      </div>
      <SectionSaveBar isSubmitting={isSubmitting} />
    </form>
  );
}
