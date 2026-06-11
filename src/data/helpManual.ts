// Help manual data — KHUSUS HR Admin
// Digunakan oleh widget HelpDesk.tsx; jangan expose ke area kandidat/publik.

export type HelpCategory =
  | 'Memulai'
  | 'Kelola Job'
  | 'Kelola Lamaran'
  | 'Kelola Perusahaan'
  | 'Cetak Formulir'
  | 'Akun & Akses'
  | 'Masalah Umum';

export interface HelpTopic {
  id: string;
  category: HelpCategory;
  question: string;
  answer: string;
  steps?: string[];
  route?: string;
}

export const HELP_CATEGORIES: HelpCategory[] = [
  'Memulai',
  'Kelola Job',
  'Kelola Lamaran',
  'Kelola Perusahaan',
  'Cetak Formulir',
  'Akun & Akses',
  'Masalah Umum',
];

export const helpTopics: HelpTopic[] = [
  // ── Memulai ────────────────────────────────────────────────────────────────

  {
    id: 'memulai-login',
    category: 'Memulai',
    question: 'Bagaimana cara login ke HR Admin Portal?',
    answer:
      'Kunjungi halaman login HR, masukkan email dan password akun HR Anda, lalu klik "Sign In to HR Admin". Akun Anda harus memiliki role hr_admin atau super_admin di sistem.',
    steps: [
      'Buka /hr/login',
      'Masukkan email HR Anda',
      'Masukkan password',
      'Klik "Sign In to HR Admin"',
      'Anda akan diarahkan ke Dashboard',
    ],
    route: '/hr/login',
  },
  {
    id: 'memulai-dashboard',
    category: 'Memulai',
    question: 'Apa saja yang ditampilkan di Dashboard HR?',
    answer:
      'Dashboard menampilkan: (1) 4 kartu overview — Total Lamaran, New/Submitted, In Progress, Accepted; (2) 6 kartu status breakdown yang bisa diklik untuk filter; (3) Recent Applications — 5 lamaran terbaru; (4) Perlu Tindakan — lamaran berstatus Applied yang belum diproses lebih dari 7 hari.',
    route: '/hr/dashboard',
  },
  {
    id: 'memulai-navigasi',
    category: 'Memulai',
    question: 'Bagaimana cara navigasi antar halaman HR?',
    answer:
      'Gunakan sidebar di sebelah kiri. Menu tersedia: Dashboard, Jobs, Applications, Candidates, dan Perusahaan. Di mobile, klik ikon hamburger (☰) di pojok kiri atas untuk membuka sidebar.',
  },
  {
    id: 'memulai-role',
    category: 'Memulai',
    question: 'Apa perbedaan role hr_admin dan super_admin?',
    answer:
      'Keduanya memiliki akses penuh ke seluruh area HR (Dashboard, Jobs, Applications, Candidates, Perusahaan). Role super_admin umumnya digunakan untuk akun IT/manajemen yang juga perlu mengatur role pengguna lain di database Supabase.',
  },

  // ── Kelola Job ─────────────────────────────────────────────────────────────

  {
    id: 'job-tambah',
    category: 'Kelola Job',
    question: 'Bagaimana cara menambah lowongan baru?',
    answer:
      'Klik tombol "Tambah Lowongan" di halaman Jobs. Isi form dengan judul posisi dan perusahaan (wajib), lalu lengkapi departemen, lokasi, tipe pekerjaan, level, tanggal closing, deskripsi, dan persyaratan. Pilih status Draft untuk menyimpan tanpa langsung tayang, atau Published agar langsung terlihat kandidat.',
    steps: [
      'Buka halaman /hr/jobs',
      'Klik "Tambah Lowongan"',
      'Isi Judul Posisi (wajib)',
      'Pilih Perusahaan dari dropdown (wajib)',
      'Isi Departemen, Lokasi, Tipe Pekerjaan, Level',
      'Isi Deskripsi, Tanggung Jawab, Persyaratan, Benefit',
      'Pilih Status: Draft atau Published',
      'Klik "Simpan Lowongan"',
    ],
    route: '/hr/jobs',
  },
  {
    id: 'job-edit',
    category: 'Kelola Job',
    question: 'Bagaimana cara mengedit lowongan yang sudah ada?',
    answer:
      'Klik ikon pensil (✏️) di baris lowongan yang ingin diedit. Ubah field yang diperlukan, lalu klik "Simpan Perubahan". Perhatikan: jika lowongan sudah memiliki lamaran, slug URL tidak dapat diubah.',
    steps: [
      'Buka /hr/jobs',
      'Temukan lowongan yang ingin diedit',
      'Klik ikon pensil di kolom Aksi',
      'Ubah field yang diperlukan',
      'Klik "Simpan Perubahan"',
    ],
    route: '/hr/jobs',
  },
  {
    id: 'job-tutup',
    category: 'Kelola Job',
    question: 'Bagaimana cara menutup atau membuka kembali lowongan?',
    answer:
      'Klik ikon toggle (⊙) di kolom Aksi pada baris lowongan. Dialog konfirmasi akan muncul. Konfirmasi untuk mengubah status antara "published" (Open) dan "closed". Lowongan closed tidak terlihat oleh kandidat.',
    steps: [
      'Temukan lowongan di tabel',
      'Klik ikon toggle di kolom Aksi',
      'Baca konfirmasi yang muncul',
      'Klik "Ya, Ubah" untuk melanjutkan',
    ],
    route: '/hr/jobs',
  },
  {
    id: 'job-slug',
    category: 'Kelola Job',
    question: 'Apa itu slug dan mengapa tidak bisa diubah setelah ada lamaran?',
    answer:
      'Slug adalah identifikasi URL unik untuk setiap lowongan, dibuat otomatis dari judul saat pertama disimpan (contoh: "finance-staff-pekanbaru"). Setelah ada kandidat yang melamar, slug dikunci karena data lamaran menyimpan referensi ke slug tersebut — mengubahnya akan memutus relasi data lamaran.',
  },
  {
    id: 'job-filter',
    category: 'Kelola Job',
    question: 'Bagaimana cara memfilter lowongan per perusahaan?',
    answer:
      'Gunakan dropdown "Semua Perusahaan" di atas tabel lowongan. Pilih salah satu PT untuk menampilkan hanya lowongan milik perusahaan tersebut. Filter ini bisa dikombinasikan dengan tab status (Open/Draft/Closed) dan kolom pencarian.',
    route: '/hr/jobs',
  },
  {
    id: 'job-stats',
    category: 'Kelola Job',
    question: 'Apa arti kolom New, Progress, dan H/R di tabel lowongan?',
    answer:
      'Kolom ini menampilkan statistik lamaran per lowongan: New (biru) = lamaran berstatus Applied yang belum diproses; Progress (ungu) = lamaran aktif dalam pipeline (Screening HR, Psikotes, Interview HR, Interview User, Offering); H/R = jumlah Hired/Accepted dibanding Rejected. Klik angka di kolom Total untuk langsung membuka filter lamaran posisi tersebut.',
    route: '/hr/jobs',
  },

  // ── Kelola Lamaran ─────────────────────────────────────────────────────────

  {
    id: 'lamaran-lihat',
    category: 'Kelola Lamaran',
    question: 'Bagaimana cara melihat semua lamaran yang masuk?',
    answer:
      'Buka halaman Applications. Semua lamaran ditampilkan dalam tabel dengan nama kandidat, posisi, status, dan tanggal. Gunakan filter status, filter perusahaan, atau kolom pencarian untuk mempersempit hasil.',
    route: '/hr/applications',
  },
  {
    id: 'lamaran-status',
    category: 'Kelola Lamaran',
    question: 'Bagaimana cara mengubah status pipeline lamaran?',
    answer:
      'Buka detail lamaran, lalu di panel kanan pilih status baru dari dropdown, dan klik "Simpan Status". Status akan langsung diperbarui dan kandidat dapat melihat perubahan ini di dashboard mereka.',
    steps: [
      'Klik lamaran di halaman Applications',
      'Lihat panel kanan "Update Status"',
      'Pilih status baru dari dropdown',
      'Klik "Simpan Status"',
    ],
  },
  {
    id: 'lamaran-catatan',
    category: 'Kelola Lamaran',
    question: 'Bagaimana cara menambah catatan internal untuk lamaran?',
    answer:
      'Di halaman detail lamaran, gulir ke bawah ke bagian "Catatan HR". Ketik catatan (hasil wawancara, observasi, dll.) di textarea, lalu klik "Tambah Catatan". Catatan hanya terlihat oleh HR Admin, tidak oleh kandidat.',
    steps: [
      'Buka detail lamaran',
      'Gulir ke bagian "Catatan HR"',
      'Ketik catatan di textarea',
      'Klik "Tambah Catatan"',
    ],
  },
  {
    id: 'lamaran-filter-inprogress',
    category: 'Kelola Lamaran',
    question: 'Apa itu filter "In Progress (All)" di halaman Applications?',
    answer:
      'Filter ini menampilkan semua lamaran yang sedang dalam proses aktif, yaitu gabungan dari status: Screening HR, Psikotes, Interview HR, Interview User, dan Offering — dalam satu tampilan tanpa perlu memilih satu per satu.',
    route: '/hr/applications',
  },
  {
    id: 'lamaran-perlu-tindakan',
    category: 'Kelola Lamaran',
    question: 'Apa itu blok "Perlu Tindakan" di Dashboard?',
    answer:
      'Blok ini menampilkan lamaran berstatus Applied yang masuk lebih dari 7 hari lalu dan belum diproses. Ini adalah pengingat agar HR segera menindaklanjuti lamaran yang tertunda. Klik "Tinjau" untuk langsung membuka detail lamaran tersebut.',
    route: '/hr/dashboard',
  },
  {
    id: 'lamaran-aturan-12-bulan',
    category: 'Kelola Lamaran',
    question: 'Apa itu aturan 1 lamaran per 12 bulan untuk kandidat?',
    answer:
      'Sistem mencegah kandidat yang sama melamar ke grup SAG lebih dari satu kali dalam 12 bulan, untuk posisi apapun. Jika kandidat mencoba melamar lagi sebelum 12 bulan berlalu, sistem akan otomatis memblokir dengan menampilkan informasi kapan mereka bisa melamar kembali.',
  },

  // ── Kelola Perusahaan ──────────────────────────────────────────────────────

  {
    id: 'pt-tambah',
    category: 'Kelola Perusahaan',
    question: 'Bagaimana cara menambah perusahaan baru ke grup?',
    answer:
      'Buka halaman Perusahaan, klik "Tambah PT", isi nama perusahaan (wajib), singkatan, dan alamat. Opsional: upload logo perusahaan (PNG/WebP/JPG, maks 1 MB). Klik "Simpan". Perusahaan baru langsung tersedia di dropdown pilihan saat membuat lowongan.',
    steps: [
      'Buka /hr/companies',
      'Klik "Tambah PT"',
      'Isi Nama Perusahaan (wajib)',
      'Isi Singkatan dan Alamat (opsional)',
      'Upload logo jika ada (klik "Upload Logo")',
      'Klik "Simpan"',
    ],
    route: '/hr/companies',
  },
  {
    id: 'pt-logo',
    category: 'Kelola Perusahaan',
    question: 'Bagaimana cara mengupload atau mengganti logo perusahaan?',
    answer:
      'Saat menambah atau mengedit perusahaan, klik tombol "Upload Logo" di modal form. Pilih file gambar (PNG, WebP, atau JPG, maksimal 1 MB). Preview akan langsung tampil. Klik "Simpan" untuk menyimpan. Logo akan digunakan di kop surat cetak formulir lamaran perusahaan tersebut.',
    steps: [
      'Buka /hr/companies',
      'Klik ikon pensil di baris perusahaan',
      'Klik "Ganti Logo" di modal',
      'Pilih file PNG/WebP/JPG ≤ 1 MB',
      'Periksa preview logo',
      'Klik "Simpan Perubahan"',
    ],
    route: '/hr/companies',
  },
  {
    id: 'pt-format-logo',
    category: 'Kelola Perusahaan',
    question: 'Format file apa yang didukung untuk logo perusahaan?',
    answer:
      'Logo perusahaan mendukung format: PNG (disarankan untuk logo dengan latar transparan), WebP (ukuran lebih kecil), dan JPG/JPEG. Ukuran file maksimal 1 MB. Logo dengan latar transparan (PNG/WebP) akan terlihat lebih baik di kop cetak.',
    route: '/hr/companies',
  },

  // ── Cetak Formulir ─────────────────────────────────────────────────────────

  {
    id: 'cetak-cara',
    category: 'Cetak Formulir',
    question: 'Bagaimana cara mencetak formulir lamaran kandidat?',
    answer:
      'Buka halaman detail lamaran, lalu klik tombol "Cetak Formulir" (tersedia di pojok kanan atas dan bawah halaman). Browser akan membuka dialog print. Kop surat dan semua data kandidat akan terformat otomatis untuk dicetak.',
    steps: [
      'Buka /hr/applications',
      'Klik salah satu lamaran untuk membuka detail',
      'Klik tombol "Cetak Formulir"',
      'Pilih printer atau "Save as PDF"',
      'Klik Print/Save',
    ],
  },
  {
    id: 'cetak-kop-otomatis',
    category: 'Cetak Formulir',
    question: 'Mengapa kop surat berubah sesuai perusahaan yang membuka lowongan?',
    answer:
      'Sistem mengambil data perusahaan dari lowongan yang dilamar (via job_id → company_id → companies). Logo dan nama PT yang tercetak adalah milik perusahaan yang membuka lowongan tersebut, bukan selalu SAG Holding. Jika perusahaan belum memiliki logo, sistem otomatis menggunakan logo SAG sebagai fallback agar kop tidak kosong.',
  },
  {
    id: 'cetak-logo-fallback',
    category: 'Cetak Formulir',
    question: 'Kop cetak menampilkan logo SAG padahal lowongan milik anak perusahaan — kenapa?',
    answer:
      'Ini terjadi karena perusahaan terkait belum memiliki logo yang diupload. Upload logo perusahaan di halaman Kelola Perusahaan (/hr/companies). Setelah logo tersimpan, semua cetak formulir untuk lowongan perusahaan tersebut akan menggunakan logo yang baru.',
    steps: [
      'Buka /hr/companies',
      'Temukan perusahaan yang belum ada logonya',
      'Klik ikon pensil untuk edit',
      'Upload logo (PNG/WebP/JPG, ≤ 1 MB)',
      'Simpan — kop cetak langsung diperbarui',
    ],
    route: '/hr/companies',
  },

  // ── Akun & Akses ───────────────────────────────────────────────────────────

  {
    id: 'akun-lupa-password',
    category: 'Akun & Akses',
    question: 'Bagaimana cara reset password akun HR?',
    answer:
      'Gunakan fitur "Lupa Password" di halaman login HR (/hr/login). Masukkan email akun HR Anda, dan link reset password akan dikirim via email. Klik link tersebut untuk membuat password baru. Link berlaku selama 1 jam.',
    steps: [
      'Buka /hr/login',
      'Klik "Lupa Password?" di bawah form',
      'Masukkan email akun HR Anda',
      'Cek inbox email untuk link reset',
      'Klik link dan buat password baru',
    ],
    route: '/hr/login',
  },
  {
    id: 'akun-tambah-hr',
    category: 'Akun & Akses',
    question: 'Bagaimana cara menambah akun HR Admin baru?',
    answer:
      'Penambahan akun HR Admin dilakukan oleh Super Admin melalui Supabase Dashboard. Super Admin perlu: (1) membuat user baru di Supabase Auth, atau meminta calon HR mendaftar sendiri, lalu (2) mengubah field role di tabel profiles menjadi "hr_admin". Hubungi Tim IT untuk proses ini.',
  },

  // ── Masalah Umum ───────────────────────────────────────────────────────────

  {
    id: 'masalah-akses-ditolak',
    category: 'Masalah Umum',
    question: 'Muncul pesan "Akses ditolak" saat masuk ke halaman HR?',
    answer:
      'Akun Anda belum memiliki role hr_admin atau super_admin. Hubungi Super Admin atau Tim IT untuk mengubah role akun Anda di database. Pastikan juga Anda login menggunakan akun yang benar (bukan akun kandidat).',
  },
  {
    id: 'masalah-upload-logo-gagal',
    category: 'Masalah Umum',
    question: 'Upload logo perusahaan gagal — apa penyebabnya?',
    answer:
      'Kemungkinan penyebab: (1) Ukuran file melebihi 1 MB — kompres gambar terlebih dahulu; (2) Format file tidak didukung — gunakan PNG, WebP, atau JPG; (3) Koneksi internet tidak stabil — coba ulangi. Pastikan pesan error yang muncul dibaca untuk diagnosis lebih akurat.',
    route: '/hr/companies',
  },
  {
    id: 'masalah-lamaran-tidak-muncul',
    category: 'Masalah Umum',
    question: 'Lamaran baru tidak muncul di daftar Applications?',
    answer:
      'Coba refresh halaman (tekan F5 atau Ctrl+R). Jika masih tidak muncul, pastikan filter status tidak terlalu spesifik — pilih "Semua Status". Jika masalah berlanjut, kemungkinan ada delay koneksi ke database; tunggu beberapa menit lalu refresh kembali.',
    route: '/hr/applications',
  },
  {
    id: 'masalah-kandidat-tidak-bisa-apply',
    category: 'Masalah Umum',
    question: 'Kandidat melaporkan tidak bisa melamar padahal lowongan masih Open?',
    answer:
      'Ada dua kemungkinan: (1) Kandidat belum melengkapi profil (domisili, pendidikan, CV) — minta mereka melengkapi profil di /candidate/profile; (2) Kandidat sudah melamar ke grup SAG dalam 12 bulan terakhir — sistem memberlakukan aturan 1 lamaran per grup per tahun. Sistem akan menampilkan tanggal kapan mereka bisa melamar kembali.',
  },
];
