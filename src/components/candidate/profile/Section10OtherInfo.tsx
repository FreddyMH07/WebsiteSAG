import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import SectionSaveBar from './SectionSaveBar';
import type { UseFormRegister } from 'react-hook-form';
import type { CandidateProfile, CandidateProfilePatch, OtherInfo } from '@/types';

const schema = z.object({
  emergency_name:     z.string().min(1, 'Wajib'),
  emergency_relation: z.string().min(1, 'Wajib'),
  emergency_address:  z.string().optional().default(''),
  emergency_phone:    z.string().min(6, 'Wajib'),
  can_contact_references: z.string().default(''),
  can_contact_reason: z.string().optional().default(''),
  worked_here_before: z.string().default(''),
  worked_here_details: z.string().optional().default(''),
  reason_resign:      z.string().optional().default(''),
  company_weakness:   z.string().optional().default(''),
  why_join:           z.string().min(1, 'Wajib diisi'),
  has_family_here:    z.string().default(''),
  has_family_details: z.string().optional().default(''),
  strength_1: z.string().optional().default(''), strength_2: z.string().optional().default(''), strength_3: z.string().optional().default(''),
  weakness_1: z.string().optional().default(''), weakness_2: z.string().optional().default(''), weakness_3: z.string().optional().default(''),
  is_breadwinner:     z.string().default(''),
  hobby:              z.string().optional().default(''),
  has_medical_history: z.string().default(''),
  medical_history_details: z.string().optional().default(''),
  spouse_medical_history: z.string().default(''),
  spouse_medical_details: z.string().optional().default(''),
  has_physical_issues: z.string().default(''),
  physical_issues_details: z.string().optional().default(''),
  has_legal_issues:   z.string().default(''),
  legal_issues_details: z.string().optional().default(''),
  willing_transfer:   z.string().default(''),
  not_willing_transfer_reason: z.string().optional().default(''),
  transfer_refusal_consequence: z.string().optional().default(''),
  willing_travel:     z.string().default(''),
  not_willing_travel_reason: z.string().optional().default(''),
});
type F = z.infer<typeof schema>;

// ─── Sub-components defined OUTSIDE so React doesn't remount on re-render ─────

function QuestionBox({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-sag-mist/30 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">{q}</p>
      {children}
    </div>
  );
}

function YesNoRadio({ name, reg }: { name: keyof F; reg: UseFormRegister<F> }) {
  return (
    <div className="flex gap-4">
      <label className="flex cursor-pointer items-center gap-1.5 text-sm">
        <input type="radio" {...reg(name)} value="YA" className="accent-sag-green" /> YA
      </label>
      <label className="flex cursor-pointer items-center gap-1.5 text-sm">
        <input type="radio" {...reg(name)} value="TIDAK" className="accent-sag-green" /> TIDAK
      </label>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

export default function Section10OtherInfo({ profile, onSave }: Props) {
  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const o = profile?.other_info ?? {};
    reset({ ...o } as F);
  }, [profile, reset]);

  // Watch only the fields used for conditional rendering
  const [
    can_contact_references, worked_here_before, has_family_here,
    has_medical_history, spouse_medical_history, has_physical_issues,
    has_legal_issues, willing_transfer, willing_travel,
  ] = useWatch({
    control,
    name: [
      'can_contact_references', 'worked_here_before', 'has_family_here',
      'has_medical_history', 'spouse_medical_history', 'has_physical_issues',
      'has_legal_issues', 'willing_transfer', 'willing_travel',
    ],
  });

  const onSubmit = async (data: F) => { await onSave({ other_info: data as Partial<OtherInfo> }); };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">10. Informasi Lainnya</h2>

      {/* Emergency contact */}
      <div className="mb-6 rounded-2xl border border-sag-green/20 bg-sag-mist p-5">
        <h3 className="mb-4 font-bold text-sag-green">Kontak Darurat</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label text-xs">Nama Kontak Darurat *</label>
            <input {...register('emergency_name')} className="input mt-1 text-sm" />
            {errors.emergency_name && <p className="mt-1 text-xs text-red-500">{errors.emergency_name.message}</p>}
          </div>
          <div>
            <label className="label text-xs">Hubungan *</label>
            <input {...register('emergency_relation')} className="input mt-1 text-sm" />
            {errors.emergency_relation && <p className="mt-1 text-xs text-red-500">{errors.emergency_relation.message}</p>}
          </div>
          <div>
            <label className="label text-xs">Alamat</label>
            <input {...register('emergency_address')} className="input mt-1 text-sm" />
          </div>
          <div>
            <label className="label text-xs">No. Telp / HP *</label>
            <input {...register('emergency_phone')} type="tel" className="input mt-1 text-sm" />
            {errors.emergency_phone && <p className="mt-1 text-xs text-red-500">{errors.emergency_phone.message}</p>}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <QuestionBox q="1. Dapatkah kami menghubungi referensi Anda untuk memperoleh informasi lengkap mengenai diri Anda?">
          <YesNoRadio name="can_contact_references" reg={register} />
          {can_contact_references === 'TIDAK' && (
            <textarea {...register('can_contact_reason')} className="input mt-2 h-20 resize-none text-sm" placeholder="Alasan..." />
          )}
        </QuestionBox>

        <QuestionBox q="2. Apakah Anda pernah bekerja pada perusahaan/grup kami sebelumnya?">
          <YesNoRadio name="worked_here_before" reg={register} />
          {worked_here_before === 'YA' && (
            <textarea {...register('worked_here_details')} className="input mt-2 h-20 resize-none text-sm" placeholder="Kapan, sebagai apa, dan nama perusahaan?" />
          )}
        </QuestionBox>

        <QuestionBox q="3. Mengapa Anda memutuskan untuk resign / berniat mengajukan resign dari tempat Anda bekerja sekarang?">
          <textarea {...register('reason_resign')} className="input h-20 resize-none text-sm" />
        </QuestionBox>

        <QuestionBox q="4. Apa kekurangan dari tempat Anda bekerja sekarang / sebelumnya?">
          <textarea {...register('company_weakness')} className="input h-20 resize-none text-sm" />
        </QuestionBox>

        <QuestionBox q="5. Mengapa Anda ingin bergabung dengan perusahaan kami? *">
          <textarea {...register('why_join')} className="input h-20 resize-none text-sm" />
          {errors.why_join && <p className="mt-1 text-xs text-red-500">{errors.why_join.message}</p>}
        </QuestionBox>

        <QuestionBox q="6. Apakah Anda memiliki keluarga/kenalan yang bekerja pada perusahaan/grup kami?">
          <YesNoRadio name="has_family_here" reg={register} />
          {has_family_here === 'YA' && (
            <textarea {...register('has_family_details')} className="input mt-2 h-20 resize-none text-sm" placeholder="Siapa, sebagai apa, di perusahaan mana?" />
          )}
        </QuestionBox>

        <QuestionBox q="7. Sebutkan kelebihan dan kelemahan diri Anda (masing-masing 3)">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-green-700">Kelebihan</p>
              <input {...register('strength_1')} className="input mb-2 text-sm" placeholder="Kelebihan 1" />
              <input {...register('strength_2')} className="input mb-2 text-sm" placeholder="Kelebihan 2" />
              <input {...register('strength_3')} className="input text-sm" placeholder="Kelebihan 3" />
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-red-700">Kelemahan</p>
              <input {...register('weakness_1')} className="input mb-2 text-sm" placeholder="Kelemahan 1" />
              <input {...register('weakness_2')} className="input mb-2 text-sm" placeholder="Kelemahan 2" />
              <input {...register('weakness_3')} className="input text-sm" placeholder="Kelemahan 3" />
            </div>
          </div>
        </QuestionBox>

        <QuestionBox q="8. Apakah Anda termasuk tulang punggung keluarga?">
          <YesNoRadio name="is_breadwinner" reg={register} />
        </QuestionBox>

        <QuestionBox q="9. Apa hobi Anda?">
          <input {...register('hobby')} className="input text-sm" />
        </QuestionBox>

        <QuestionBox q="10. ⚠ Apakah Anda pernah menderita sakit jantung, kanker, HIV/AIDS, ginjal, penyakit atau kecelakaan lainnya?">
          <YesNoRadio name="has_medical_history" reg={register} />
          {has_medical_history === 'YA' && (
            <textarea {...register('medical_history_details')} className="input mt-2 h-20 resize-none text-sm" placeholder="Kapan dan apa penyakit/kecelakaannya?" />
          )}
        </QuestionBox>

        <QuestionBox q="11. ⚠ Apakah ada istri/anak Anda yang menderita sakit jantung, kanker, HIV/AIDS, ginjal, penyakit atau kecelakaan lainnya?">
          <YesNoRadio name="spouse_medical_history" reg={register} />
          {spouse_medical_history === 'YA' && (
            <textarea {...register('spouse_medical_details')} className="input mt-2 h-20 resize-none text-sm" placeholder="Siapa? Kapan dialami?" />
          )}
        </QuestionBox>

        <QuestionBox q="12. ⚠ Apakah Anda mempunyai masalah dengan tubuh Anda, seperti penglihatan, pendengaran, berbicara, buta warna, dll.?">
          <YesNoRadio name="has_physical_issues" reg={register} />
          {has_physical_issues === 'YA' && (
            <textarea {...register('physical_issues_details')} className="input mt-2 h-20 resize-none text-sm" placeholder="Keterangan..." />
          )}
        </QuestionBox>

        <QuestionBox q="13. ⚠ Apakah Anda pernah bermasalah dengan pihak yang berwajib?">
          <YesNoRadio name="has_legal_issues" reg={register} />
          {has_legal_issues === 'YA' && (
            <textarea {...register('legal_issues_details')} className="input mt-2 h-20 resize-none text-sm" placeholder="Kapan dan kasus apa?" />
          )}
        </QuestionBox>

        <QuestionBox q="14. Bersediakah Anda dimutasikan ke cabang lain atau perusahaan lain dalam grup kami?">
          <YesNoRadio name="willing_transfer" reg={register} />
          {willing_transfer === 'TIDAK' && (
            <textarea {...register('not_willing_transfer_reason')} className="input mt-2 h-16 resize-none text-sm" placeholder="Jika Tidak, kenapa?" />
          )}
        </QuestionBox>

        <QuestionBox q="15. Jika suatu saat Anda menolak dimutasi, apa sanksinya bagi Anda?">
          <textarea {...register('transfer_refusal_consequence')} className="input h-16 resize-none text-sm" />
        </QuestionBox>

        <QuestionBox q="16. Bersediakah Anda melakukan perjalanan dinas ke luar kota untuk waktu tertentu?">
          <YesNoRadio name="willing_travel" reg={register} />
          {willing_travel === 'TIDAK' && (
            <textarea {...register('not_willing_travel_reason')} className="input mt-2 h-16 resize-none text-sm" placeholder="Jika Tidak, kenapa?" />
          )}
        </QuestionBox>
      </div>

      <p className="mt-4 text-xs text-slate-400">⚠ Data kesehatan (pertanyaan 10-12) adalah data pribadi spesifik yang dilindungi UU No. 27/2022 tentang PDP.</p>
      <SectionSaveBar isSubmitting={isSubmitting} />
    </form>
  );
}
