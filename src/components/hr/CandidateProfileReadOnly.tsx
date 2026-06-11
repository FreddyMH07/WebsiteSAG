import type { CandidateProfile } from '@/types';

interface Props { cp: CandidateProfile }

const Row = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
    <p className="text-sm text-slate-800">{value || '—'}</p>
  </div>
);

const SectionBox = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6 print:mb-4">
    <h3 className="mb-3 border-b border-sag-green/20 pb-1 text-base font-black text-sag-green">{title}</h3>
    {children}
  </div>
);

export default function CandidateProfileReadOnly({ cp }: Props) {
  const o = cp.other_info ?? {};

  return (
    <div className="text-sm">
      {/* Section 1 */}
      <SectionBox title="1. Posisi yang Dilamar">
        <Row label="Posisi" value={cp.applied_position} />
      </SectionBox>

      {/* Section 2 */}
      <SectionBox title="2. Data Diri">
        <div className="grid gap-3 sm:grid-cols-3">
          <Row label="Tempat Lahir" value={cp.birth_place} />
          <Row label="Tanggal Lahir" value={cp.birth_date ? new Date(cp.birth_date).toLocaleDateString('id-ID') : null} />
          <Row label="Golongan Darah" value={cp.blood_type} />
          <Row label="Jenis Kelamin" value={cp.gender} />
          <Row label="Agama" value={cp.religion} />
          <Row label="Status Perkawinan" value={cp.marital_status} />
          <Row label="NIK" value={cp.nik} />
          <div className="sm:col-span-2"><Row label="Alamat Sekarang" value={cp.address_current} /></div>
          <div className="sm:col-span-3"><Row label="Alamat KTP" value={cp.address_ktp} /></div>
        </div>
      </SectionBox>

      {/* Section 3 */}
      <SectionBox title="3. Data Keluarga">
        {(cp.family_members ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-xs">
              <thead><tr className="table-head print:bg-slate-800">
                {['Hubungan','Nama','L/P','Usia','Pekerjaan','Alamat'].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {cp.family_members.map((f, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-2 py-1.5">{f.relation}</td>
                    <td className="px-2 py-1.5">{f.name}</td>
                    <td className="px-2 py-1.5">{f.gender}</td>
                    <td className="px-2 py-1.5">{f.age}</td>
                    <td className="px-2 py-1.5">{f.occupation}</td>
                    <td className="px-2 py-1.5">{f.address}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionBox>

      {/* Section 4 */}
      <SectionBox title="4. Pendidikan Formal">
        {(cp.formal_education ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[580px] text-xs">
              <thead><tr className="table-head print:bg-slate-800">
                {['Jenjang','Nama Sekolah','Jurusan','Kota','Tahun','IPK/Nilai'].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {cp.formal_education.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-2 py-1.5">{e.level}</td>
                    <td className="px-2 py-1.5">{e.school_name}</td>
                    <td className="px-2 py-1.5">{e.major}</td>
                    <td className="px-2 py-1.5">{e.city}</td>
                    <td className="px-2 py-1.5">{e.year_from}–{e.year_to}</td>
                    <td className="px-2 py-1.5">{e.gpa}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionBox>

      {/* Section 5 */}
      <SectionBox title="5. Pendidikan Non-Formal">
        {(cp.informal_education ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-xs">
              <thead><tr className="table-head print:bg-slate-800">
                {['Tahun','Topik','Penyelenggara','Kota','Durasi','Sertifikat'].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}
              </tr></thead>
              <tbody>
                {cp.informal_education.map((e, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="px-2 py-1.5">{e.year}</td>
                    <td className="px-2 py-1.5">{e.topic}</td>
                    <td className="px-2 py-1.5">{e.organizer}</td>
                    <td className="px-2 py-1.5">{e.city}</td>
                    <td className="px-2 py-1.5">{e.duration}</td>
                    <td className="px-2 py-1.5">{e.certificate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionBox>

      {/* Section 6 */}
      <SectionBox title="6. Kemampuan Bahasa">
        {(cp.languages ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <table className="w-full max-w-md text-xs">
            <thead><tr className="table-head print:bg-slate-800">
              {['Bahasa','Berbicara','Menulis','Membaca'].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {cp.languages.map((l, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-2 py-1.5">{l.language}</td>
                  <td className="px-2 py-1.5">{l.speaking}</td>
                  <td className="px-2 py-1.5">{l.writing}</td>
                  <td className="px-2 py-1.5">{l.reading}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionBox>

      {/* Section 7 */}
      <SectionBox title="7. Organisasi">
        {(cp.organizations ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <table className="w-full max-w-2xl text-xs">
            <thead><tr className="table-head print:bg-slate-800">
              {['Nama Organisasi','Periode','Kota','Jabatan'].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {cp.organizations.map((org, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-2 py-1.5">{org.org_name}</td>
                  <td className="px-2 py-1.5">{org.period}</td>
                  <td className="px-2 py-1.5">{org.city}</td>
                  <td className="px-2 py-1.5">{org.position}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionBox>

      {/* Section 8 */}
      <SectionBox title="8. Pengalaman Kerja">
        {(cp.work_experiences ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <div className="space-y-4">
            {cp.work_experiences.map((w, i) => (
              <div key={i} className="rounded-2xl border border-slate-100 p-4">
                <p className="mb-2 font-bold text-sag-green text-xs">Perusahaan #{i + 1}</p>
                <div className="grid gap-2 sm:grid-cols-3 text-xs">
                  <Row label="Nama & Alamat Perusahaan" value={w.company} />
                  <Row label="Periode" value={`${w.year_from} – ${w.year_to || 'sekarang'}`} />
                  <Row label="Jabatan Awal" value={w.initial_position} />
                  <Row label="Jabatan Akhir" value={w.final_position} />
                  <Row label="Gaji Awal" value={w.initial_salary ? `Rp ${Number(w.initial_salary).toLocaleString('id-ID')}` : undefined} />
                  <Row label="Gaji Akhir" value={w.final_salary ? `Rp ${Number(w.final_salary).toLocaleString('id-ID')}` : undefined} />
                  <Row label="Alasan Keluar" value={w.reason_leaving} />
                  <div className="sm:col-span-2"><Row label="Tanggung Jawab" value={w.responsibilities} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionBox>

      {/* Section 9 */}
      <SectionBox title="9. Referensi">
        {(cp.references_data ?? []).length === 0 ? <p className="text-slate-400 text-xs">Tidak ada data</p> : (
          <table className="w-full max-w-2xl text-xs">
            <thead><tr className="table-head print:bg-slate-800">
              {['Nama','Perusahaan','Telp','Jabatan','Hubungan'].map((h) => <th key={h} className="px-2 py-1.5 text-left">{h}</th>)}
            </tr></thead>
            <tbody>
              {cp.references_data.map((r, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="px-2 py-1.5">{r.name}</td>
                  <td className="px-2 py-1.5">{r.company}</td>
                  <td className="px-2 py-1.5">{r.phone}</td>
                  <td className="px-2 py-1.5">{r.position}</td>
                  <td className="px-2 py-1.5">{r.relation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionBox>

      {/* Section 10 */}
      <SectionBox title="10. Informasi Lainnya">
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <Row label="Kontak Darurat" value={o.emergency_name ? `${o.emergency_name} (${o.emergency_relation}) – ${o.emergency_phone}` : undefined} />
          <Row label="Alamat Kontak Darurat" value={o.emergency_address} />
        </div>
        <div className="grid gap-2 sm:grid-cols-2 text-xs">
          {[
            ['Boleh dihubungi referensi', o.can_contact_references, o.can_contact_reason],
            ['Pernah bekerja di grup', o.worked_here_before, o.worked_here_details],
            ['Alasan resign', o.reason_resign, undefined],
            ['Kekurangan perusahaan sebelumnya', o.company_weakness, undefined],
            ['Mengapa ingin bergabung', o.why_join, undefined],
            ['Keluarga/kenalan di grup', o.has_family_here, o.has_family_details],
            ['Kelebihan', [o.strength_1, o.strength_2, o.strength_3].filter(Boolean).join(', '), undefined],
            ['Kelemahan', [o.weakness_1, o.weakness_2, o.weakness_3].filter(Boolean).join(', '), undefined],
            ['Tulang punggung', o.is_breadwinner, undefined],
            ['Hobi', o.hobby, undefined],
            ['Riwayat penyakit', o.has_medical_history, o.medical_history_details],
            ['Penyakit keluarga', o.spouse_medical_history, o.spouse_medical_details],
            ['Masalah fisik', o.has_physical_issues, o.physical_issues_details],
            ['Masalah hukum', o.has_legal_issues, o.legal_issues_details],
            ['Bersedia mutasi', o.willing_transfer, o.not_willing_transfer_reason],
            ['Konsekuensi tolak mutasi', o.transfer_refusal_consequence, undefined],
            ['Bersedia dinas luar kota', o.willing_travel, o.not_willing_travel_reason],
          ].map(([label, val, detail]) => (
            <div key={label as string}>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label as string}</p>
              <p className="text-sm text-slate-800">{(val as string) || '—'}{detail ? ` — ${detail}` : ''}</p>
            </div>
          ))}
        </div>
      </SectionBox>

      {/* Section 11 */}
      <SectionBox title="11. Pernyataan">
        <div className="grid gap-2 sm:grid-cols-3 text-xs">
          <Row label="Persetujuan Data" value={cp.consent_data_truth ? '✓ Disetujui' : '✗ Belum'} />
          <Row label="Persetujuan PDP" value={cp.consent_pdp ? '✓ Disetujui' : '✗ Belum'} />
          <Row label="Tanda Tangan Digital" value={cp.declared_name} />
          <Row label="Waktu Pernyataan" value={cp.declared_at ? new Date(cp.declared_at).toLocaleString('id-ID') : undefined} />
        </div>
      </SectionBox>
    </div>
  );
}
