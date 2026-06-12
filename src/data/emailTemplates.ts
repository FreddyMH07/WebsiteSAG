// Email templates for HR → Candidate communication via mailto
// Placeholders: {{nama}}, {{posisi}}, {{perusahaan}}, {{nama_hr}} (auto-filled)
//               {{tanggal}}, {{jam}}, {{lokasi}} (manual input, per template)
// Body max ~1000 chars to stay within safe mailto URL limits after encoding.

export interface EmailTemplate {
  id: string;
  label: string;
  stage: string;
  subject: string;
  body: string;
  manualVars: Array<'tanggal' | 'jam' | 'lokasi'>;
}

export const MANUAL_VAR_LABELS: Record<string, string> = {
  tanggal: 'Hari / Tanggal',
  jam:     'Waktu (Jam)',
  lokasi:  'Lokasi / Link Meeting',
};

export const emailTemplates: EmailTemplate[] = [
  {
    id: 'undangan-psikotes',
    label: 'Undangan Tahap Psikotes',
    stage: 'Screening',
    subject: 'Undangan Psikotes – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Terima kasih atas ketertarikan Anda melamar posisi {{posisi}} di {{perusahaan}}.

Kami mengundang Anda untuk mengikuti Tahap Psikotes:

Hari/Tanggal : {{tanggal}}
Waktu        : {{jam}}
Lokasi/Link  : {{lokasi}}

Harap hadir 15 menit lebih awal dengan membawa kartu identitas (KTP/SIM) dan alat tulis.

Mohon konfirmasi kehadiran dengan membalas email ini.

Salam hormat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: ['tanggal', 'jam', 'lokasi'],
  },

  {
    id: 'undangan-interview-hr',
    label: 'Undangan Interview HR',
    stage: 'Interview',
    subject: 'Undangan Wawancara HR – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Selamat! Anda lolos ke tahap Wawancara HR untuk posisi {{posisi}} di {{perusahaan}}.

Detail wawancara:

Hari/Tanggal : {{tanggal}}
Waktu        : {{jam}}
Lokasi/Link  : {{lokasi}}

Durasi sekitar 45–60 menit. Harap membawa kartu identitas dan dokumen pendukung.

Mohon konfirmasi kehadiran dengan membalas email ini.

Salam hormat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: ['tanggal', 'jam', 'lokasi'],
  },

  {
    id: 'undangan-interview-user',
    label: 'Undangan Interview User / Manager',
    stage: 'Interview',
    subject: 'Undangan Wawancara User – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Selamat! Anda melanjutkan ke tahap Wawancara dengan User/Manager untuk posisi {{posisi}} di {{perusahaan}}.

Detail wawancara:

Hari/Tanggal : {{tanggal}}
Waktu        : {{jam}}
Lokasi/Link  : {{lokasi}}

Durasi sekitar 60–90 menit. Harap membawa kartu identitas dan dokumen pendukung.

Kami menantikan kehadiran Anda.

Salam hormat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: ['tanggal', 'jam', 'lokasi'],
  },

  {
    id: 'tidak-lanjut',
    label: 'Tidak Dapat Melanjutkan Proses',
    stage: 'Penolakan',
    subject: 'Pemberitahuan Hasil Seleksi – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Terima kasih atas ketertarikan dan waktu yang Anda curahkan dalam proses seleksi posisi {{posisi}} di {{perusahaan}}.

Setelah melalui evaluasi yang cermat, dengan penuh pertimbangan kami menyampaikan bahwa kami belum dapat melanjutkan proses seleksi Anda pada tahap ini. Keputusan ini tidak mencerminkan kualitas pribadi Anda.

Sesuai kebijakan rekrutmen grup kami, Anda dipersilakan untuk melamar kembali setelah 12 bulan dari tanggal lamaran.

Kami mendoakan kesuksesan untuk perjalanan karier Anda.

Salam hormat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: [],
  },

  {
    id: 'offering',
    label: 'Undangan Pembahasan Offering',
    stage: 'Offering',
    subject: 'Undangan Pembahasan Penawaran – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Selamat! Anda berhasil melewati seluruh tahapan seleksi untuk posisi {{posisi}} di {{perusahaan}}.

Kami mengundang Anda untuk hadir dalam sesi Pembahasan Penawaran Kerja:

Hari/Tanggal : {{tanggal}}
Waktu        : {{jam}}
Lokasi/Link  : {{lokasi}}

Pada sesi ini kami akan membahas detail paket kompensasi dan ketentuan bergabung.

Mohon konfirmasi kehadiran Anda.

Salam hormat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: ['tanggal', 'jam', 'lokasi'],
  },

  {
    id: 'diterima',
    label: 'Selamat Bergabung (Diterima)',
    stage: 'Offering',
    subject: 'Selamat Bergabung – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Selamat bergabung dengan keluarga besar {{perusahaan}}!

Kami dengan bangga menyampaikan bahwa Anda resmi diterima sebagai bagian dari tim kami untuk posisi {{posisi}}.

Informasi mengenai jadwal onboarding dan dokumen yang perlu disiapkan akan kami sampaikan segera.

Jika ada pertanyaan sebelum hari pertama bergabung, jangan ragu menghubungi kami.

Kami menantikan kontribusi Anda.

Salam hangat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: [],
  },

  {
    id: 'minta-dokumen',
    label: 'Permintaan Kelengkapan Dokumen',
    stage: 'Umum',
    subject: 'Permintaan Dokumen Tambahan – {{posisi}} | {{perusahaan}}',
    body:
`Kepada Yth.
{{nama}}

Dengan hormat,

Sehubungan dengan proses seleksi posisi {{posisi}} di {{perusahaan}}, kami memerlukan beberapa dokumen tambahan untuk melengkapi berkas Anda.

Mohon kirimkan dokumen berikut melalui balasan email ini:
- KTP / Kartu Identitas
- Ijazah dan transkrip nilai terakhir
- Surat keterangan pengalaman kerja (jika ada)
- Sertifikat / portofolio pendukung (jika ada)
- Pas foto terbaru

Deadline pengiriman: {{tanggal}}

Terima kasih atas kerja samanya.

Salam hormat,
{{nama_hr}}
Tim Rekrutmen {{perusahaan}}`,
    manualVars: ['tanggal'],
  },
];

// Default template ID based on current application status
export function getDefaultTemplateId(status: string): string {
  switch (status) {
    case 'Applied':
    case 'Screening HR':  return 'undangan-psikotes';
    case 'Psikotes':      return 'undangan-interview-hr';
    case 'Interview HR':  return 'undangan-interview-user';
    case 'Interview User':return 'offering';
    case 'Offering':      return 'diterima';
    case 'Accepted':      return 'diterima';
    case 'Rejected':
    case 'Talent Pool':   return 'tidak-lanjut';
    default:              return 'undangan-psikotes';
  }
}

// Fill all placeholders in a template string
export function fillPlaceholders(
  text: string,
  vars: Record<string, string>,
): string {
  return Object.entries(vars).reduce(
    (t, [k, v]) => t.split(`{{${k}}}`).join(v || `{{${k}}}`),
    text,
  );
}
