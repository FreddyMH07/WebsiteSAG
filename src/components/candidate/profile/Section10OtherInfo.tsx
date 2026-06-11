import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
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

interface Props { profile: CandidateProfile | null; onSave: (p: CandidateProfilePatch) => Promise<void> }

function Radio({ label, name, value, register: reg }: { label: string; name: string; value: string; register: UseFormRegister<F> }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 text-sm">
      <input type="radio" {...reg(name as keyof F)} value={value} className="accent-sag-green" />
      {label}
    </label>
  );
}

export default function Section10OtherInfo({ profile, onSave }: Props) {
  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm<F>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const o = profile?.other_info ?? {};
    reset({ ...o } as F);
  }, [profile, reset]);

  const w = watch();
  const onSubmit = async (data: F) => { await onSave({ other_info: data as Partial<OtherInfo> }); };

  const Q = ({ q, children }: { q: string; children: React.ReactNode }) => (
    <div className="rounded-2xl border border-slate-100 bg-sag-mist/30 p-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">{q}</p>
      {children}
    </div>
  );

  const YesNo = ({ name }: { name: string }) => (
    <div className="flex gap-4">
      <Radio label="YA" name={name} value="YA" register={register} />
      <Radio label="TIDAK" name={name} value="TIDAK" register={register} />
    </div>
  );

  const Cond = ({ show, name, placeholder }: { show: boolean; name: string; placeholder?: string }) =>
    show ? <textarea {...register(name as keyof F)} className="input mt-2 h-20 resize-none text-sm" placeholder={placeholder} /> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h2 className="mb-5 text-lg font-black text-sag-green">10. Informasi Lainnya</h2>

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
        <Q q="1. Dapatkah kami menghubungi referensi Anda untuk memperoleh informasi lengkap mengenai diri Anda?">
          <YesNo name="can_contact_references" />
          <Cond show={w.can_contact_references === 'TIDAK'} name="can_contact_reason" placeholder="Alasan..." />
        </Q>
        <Q q="2. Apakah Anda pernah bekerja pada perusahaan/grup kami sebelumnya?">
          <YesNo name="worked_here_before" />
          <Cond show={w.worked_here_before === 'YA'} name="worked_here_details" placeholder="Kapan, sebagai apa, dan nama perusahaan?" />
        </Q>
        <Q q="3. Mengapa Anda memutuskan untuk resign / berniat mengajukan resign dari tempat Anda bekerja sekarang?">
          <textarea {...register('reason_resign')} className="input h-20 resize-none text-sm" />
        </Q>
        <Q q="4. Apa kekurangan dari tempat Anda bekerja sekarang / sebelumnya?">
          <textarea {...register('company_weakness')} className="input h-20 resize-none text-sm" />
        </Q>
        <Q q="5. Mengapa Anda ingin bergabung dengan perusahaan kami? *">
          <textarea {...register('why_join')} className="input h-20 resize-none text-sm" />
          {errors.why_join && <p className="mt-1 text-xs text-red-500">{errors.why_join.message}</p>}
        </Q>
        <Q q="6. Apakah Anda memiliki keluarga/kenalan yang bekerja pada perusahaan/grup kami?">
          <YesNo name="has_family_here" />
          <Cond show={w.has_family_here === 'YA'} name="has_family_details" placeholder="Siapa, sebagai apa, di perusahaan mana?" />
        </Q>
        <Q q="7. Sebutkan kelebihan dan kelemahan diri Anda (masing-masing 3)">
          <div className="grid gap-2 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-semibold text-green-700">Kelebihan</p>
              {[1,2,3].map((n) => <input key={n} {...register(`strength_${n}` as keyof F)} className="input mb-2 text-sm" placeholder={`Kelebihan ${n}`} />)}
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold text-red-700">Kelemahan</p>
              {[1,2,3].map((n) => <input key={n} {...register(`weakness_${n}` as keyof F)} className="input mb-2 text-sm" placeholder={`Kelemahan ${n}`} />)}
            </div>
          </div>
        </Q>
        <Q q="8. Apakah Anda termasuk tulang punggung keluarga?">
          <YesNo name="is_breadwinner" />
        </Q>
        <Q q="9. Apa hobi Anda?">
          <input {...register('hobby')} className="input text-sm" />
        </Q>
        <Q q="10. ⚠ Apakah Anda pernah menderita sakit jantung, kanker, HIV/AIDS, ginjal, penyakit atau kecelakaan lainnya?">
          <YesNo name="has_medical_history" />
          <Cond show={w.has_medical_history === 'YA'} name="medical_history_details" placeholder="Kapan dan apa penyakit/kecelakaannya?" />
        </Q>
        <Q q="11. ⚠ Apakah ada istri/anak Anda yang menderita sakit jantung, kanker, HIV/AIDS, ginjal, penyakit atau kecelakaan lainnya?">
          <YesNo name="spouse_medical_history" />
          <Cond show={w.spouse_medical_history === 'YA'} name="spouse_medical_details" placeholder="Siapa? Kapan dialami?" />
        </Q>
        <Q q="12. ⚠ Apakah Anda mempunyai masalah dengan tubuh Anda, seperti penglihatan, pendengaran, berbicara, buta warna, dll.?">
          <YesNo name="has_physical_issues" />
          <Cond show={w.has_physical_issues === 'YA'} name="physical_issues_details" placeholder="Keterangan..." />
        </Q>
        <Q q="13. ⚠ Apakah Anda pernah bermasalah dengan pihak yang berwajib?">
          <YesNo name="has_legal_issues" />
          <Cond show={w.has_legal_issues === 'YA'} name="legal_issues_details" placeholder="Kapan dan kasus apa?" />
        </Q>
        <Q q="14. Bersediakah Anda dimutasikan ke cabang lain atau perusahaan lain dalam grup kami?">
          <YesNo name="willing_transfer" />
          <Cond show={w.willing_transfer === 'TIDAK'} name="not_willing_transfer_reason" placeholder="Jika Tidak, kenapa?" />
        </Q>
        <Q q="15. Jika suatu saat Anda menolak dimutasi, apa sanksinya bagi Anda?">
          <textarea {...register('transfer_refusal_consequence')} className="input h-16 resize-none text-sm" />
        </Q>
        <Q q="16. Bersediakah Anda melakukan perjalanan dinas ke luar kota untuk waktu tertentu?">
          <YesNo name="willing_travel" />
          <Cond show={w.willing_travel === 'TIDAK'} name="not_willing_travel_reason" placeholder="Jika Tidak, kenapa?" />
        </Q>
      </div>

      <p className="mt-4 text-xs text-slate-400">⚠ Data kesehatan (pertanyaan 10-12) adalah data pribadi spesifik yang dilindungi UU No. 27/2022 tentang PDP. Data ini hanya diproses untuk keperluan rekrutmen.</p>
      <SectionSaveBar isSubmitting={isSubmitting} />
    </form>
  );
}
