# Functional Requirements Document (FRD)
## SAG Career Portal — career.sahabatagro.co.id
**Versi:** 1.0 | **Dibuat:** Juni 2026 | **Status:** In Development

---

## 1. Tujuan Dokumen

FRD ini mendefinisikan semua kebutuhan fungsional SAG Career Portal — platform rekrutmen resmi PT Sahabat Agro Group. Dokumen ini menjadi acuan pengembangan dan pengujian sistem.

---

## 2. Ruang Lingkup Sistem

SAG Career Portal adalah aplikasi web single-page (SPA) yang menghubungkan:
- **Pencari kerja (kandidat)** yang ingin melamar posisi di SAG Group
- **Tim HR** yang memproses dan mengelola lamaran masuk

Sistem ini **tidak** mencakup:
- Penggajian (payroll)
- Absensi / kehadiran
- Manajemen karyawan aktif (onboarding)
- HRIS (HR Information System)

---

## 3. Pengguna Sistem

### 3.1 Kandidat (Pencari Kerja)
- Publik umum yang ingin melamar pekerjaan di SAG
- Dapat mendaftar sendiri melalui website
- Role di database: `candidate`

### 3.2 HR Admin
- Staf HR SAG yang memproses lamaran
- Akun dibuat oleh Super Admin
- Role di database: `hr_admin`

### 3.3 Super Admin
- IT/Management SAG dengan akses penuh
- Dapat mengatur role pengguna lain
- Role di database: `super_admin`

---

## 4. Kebutuhan Fungsional

### FR-01: Manajemen Akun Kandidat

| ID | Requirement |
|----|-------------|
| FR-01.1 | Kandidat dapat mendaftar dengan email, nama, nomor HP, dan password |
| FR-01.2 | Sistem harus validasi email unik (tidak bisa daftar dua kali dengan email yang sama) |
| FR-01.3 | Password minimal 8 karakter |
| FR-01.4 | Kandidat harus menyetujui persetujuan pemrosesan data pribadi saat registrasi |
| FR-01.5 | Kandidat dapat login dan logout |
| FR-01.6 | Kandidat hanya dapat mengakses data miliknya sendiri |
| FR-01.7 | Sistem membuat record di tabel `profiles` (role=candidate) dan `candidates` saat registrasi |

### FR-02: Profil Kandidat

| ID | Requirement |
|----|-------------|
| FR-02.1 | Kandidat dapat mengisi dan memperbarui profil lengkap |
| FR-02.2 | Profil mencakup: nama, HP, domisili, pendidikan, jurusan, pengalaman, perusahaan saat ini, posisi saat ini, gaji diharapkan, LinkedIn, portfolio |
| FR-02.3 | Kandidat dapat upload file CV (PDF/Word, maks 10MB) |
| FR-02.4 | CV disimpan di Supabase Storage bucket `candidate-cv` (private) |
| FR-02.5 | Sistem menampilkan peringatan jika profil belum lengkap (domisili, pendidikan, CV) |

### FR-03: Pencarian & Tampilan Lowongan

| ID | Requirement |
|----|-------------|
| FR-03.1 | Sistem menampilkan daftar lowongan aktif dari Contentful CMS |
| FR-03.2 | Lowongan menampilkan: judul, departemen, lokasi, tipe pekerjaan, deadline |
| FR-03.3 | Pengguna dapat filter lowongan berdasarkan departemen |
| FR-03.4 | Pengguna dapat mencari lowongan berdasarkan kata kunci |
| FR-03.5 | Setiap lowongan memiliki halaman detail dengan deskripsi dan persyaratan lengkap |
| FR-03.6 | Lowongan dapat ditampilkan dalam Bahasa Indonesia dan Inggris |

### FR-04: Proses Lamaran (Apply)

| ID | Requirement |
|----|-------------|
| FR-04.1 | Hanya kandidat yang login dan memiliki profil lengkap yang dapat melamar |
| FR-04.2 | Form lamaran mencakup: gaji yang diharapkan, ketersediaan mulai kerja, surat lamaran, upload CV |
| FR-04.3 | Satu kandidat tidak dapat melamar posisi yang sama lebih dari satu kali |
| FR-04.4 | CV yang diupload saat apply akan diperbarui di profil kandidat |
| FR-04.5 | Lamaran tersimpan di tabel `applications` dengan status awal `submitted` |
| FR-04.6 | Setelah submit, kandidat diarahkan ke halaman terima kasih |

### FR-05: Dashboard & Tracking Kandidat

| ID | Requirement |
|----|-------------|
| FR-05.1 | Kandidat dapat melihat semua lamaran yang pernah dikirim |
| FR-05.2 | Status lamaran ditampilkan secara real-time (submitted, screening, interview, offering, accepted, rejected) |
| FR-05.3 | Dashboard menampilkan statistik: total lamaran, lamaran aktif, status profil |

### FR-06: HR Admin — Manajemen Lamaran

| ID | Requirement |
|----|-------------|
| FR-06.1 | HR Admin dapat login melalui halaman khusus `/hr/login` |
| FR-06.2 | Sistem menolak akses jika role bukan `hr_admin` atau `super_admin` |
| FR-06.3 | HR Admin dapat melihat semua lamaran yang masuk |
| FR-06.4 | HR Admin dapat filter lamaran berdasarkan status |
| FR-06.5 | HR Admin dapat membuka detail setiap lamaran |
| FR-06.6 | HR Admin dapat mengubah status lamaran (submitted → screening → interview → offering → accepted/rejected) |
| FR-06.7 | HR Admin dapat menambah catatan internal pada setiap lamaran |
| FR-06.8 | Catatan internal tidak terlihat oleh kandidat |
| FR-06.9 | HR Admin dapat mengakses CV kandidat |

### FR-07: HR Admin — Manajemen Kandidat

| ID | Requirement |
|----|-------------|
| FR-07.1 | HR Admin dapat melihat daftar semua kandidat terdaftar |
| FR-07.2 | Data kandidat mencakup: nama, email, HP, domisili, pendidikan, link CV |
| FR-07.3 | HR Admin dapat mencari dan filter kandidat |

### FR-08: SEO & Discoverability

| ID | Requirement |
|----|-------------|
| FR-08.1 | Halaman publik (Home, Jobs, Contact) memiliki meta tags SEO lengkap |
| FR-08.2 | Halaman privat (dashboard, profil, HR) memiliki meta noindex |
| FR-08.3 | Sistem menyediakan robots.txt yang melarang indexing halaman privat |
| FR-08.4 | Sistem menyediakan sitemap.xml untuk halaman publik |
| FR-08.5 | Halaman detail lowongan memiliki JSON-LD schema JobPosting |
| FR-08.6 | Homepage memiliki JSON-LD schema Organization dan WebSite |

### FR-09: Internasionalisasi (i18n)

| ID | Requirement |
|----|-------------|
| FR-09.1 | Sistem mendukung dua bahasa: Indonesia (default) dan Inggris |
| FR-09.2 | Toggle bahasa tersedia di Navbar untuk semua halaman publik |
| FR-09.3 | Preferensi bahasa disimpan di localStorage browser |
| FR-09.4 | Teks utama pada halaman kandidat dan publik bilingual |

### FR-10: Keamanan & Privasi

| ID | Requirement |
|----|-------------|
| FR-10.1 | Semua data kandidat dilindungi RLS (Row Level Security) Supabase |
| FR-10.2 | Kandidat hanya dapat mengakses data miliknya sendiri |
| FR-10.3 | CV kandidat disimpan di private bucket (tidak bisa diakses publik tanpa auth) |
| FR-10.4 | HR Admin hanya dapat mengakses data jika sudah terautentikasi dengan role yang benar |
| FR-10.5 | Service role key Supabase tidak pernah diekspos ke frontend |
| FR-10.6 | SUPABASE_ANON_KEY dan SUPABASE_URL boleh dipakai di client side |

### FR-11: Kontak & Notifikasi

| ID | Requirement |
|----|-------------|
| FR-11.1 | Halaman kontak memiliki form yang mengirim pesan ke email HR via Web3Forms |
| FR-11.2 | Email HR rekrutmen: hr@sahabatagro.co.id |
| FR-11.3 | Email IT/umum: admin.it@sahabatagro.co.id |
| FR-11.4 | Peringatan anti-penipuan ditampilkan di footer, halaman kontak, dan halaman jobs |

---

## 5. Kebutuhan Non-Fungsional

| ID | Requirement |
|----|-------------|
| NFR-01 | Halaman harus load dalam < 3 detik pada koneksi 4G |
| NFR-02 | Desain responsive untuk mobile, tablet, dan desktop |
| NFR-03 | Browser yang didukung: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+ |
| NFR-04 | Uptime target: 99.5% (mengikuti SLA Vercel + Supabase) |
| NFR-05 | Gambar dioptimasi dalam format WebP |
| NFR-06 | Tidak ada data sensitif yang tersimpan di localStorage kecuali preferensi UI |

---

## 6. Aturan Bisnis

| ID | Aturan |
|----|--------|
| BR-01 | Rekrutmen SAG tidak pernah memungut biaya apapun |
| BR-02 | Kandidat hanya bisa melamar satu posisi yang sama sekali |
| BR-03 | CV harus diupload sebelum lamaran bisa dikirim |
| BR-04 | Super Admin adalah satu-satunya yang bisa mengubah role user lain |
| BR-05 | Lowongan yang sudah closed tidak bisa dilamar |
| BR-06 | Pelamar di bawah umur tidak diterima (validasi opsional di future sprint) |

---

## 7. Integrasi Eksternal

| Sistem | Fungsi |
|--------|--------|
| **Supabase** | Auth, database (PostgreSQL), storage (CV) |
| **Contentful CMS** | Sumber data lowongan pekerjaan |
| **Web3Forms** | Pengiriman form kontak ke email |
| **Vercel** | Hosting dan deployment |
| **Google Fonts** | Plus Jakarta Sans |

---

## 8. Batasan Sistem

- Sistem tidak mengirim email notifikasi otomatis ke kandidat saat status berubah (fitur future)
- Tidak ada fitur chat/messaging antara HR dan kandidat (fitur future)
- Upload CV hanya mendukung format PDF, DOC, DOCX
- Maksimal ukuran file CV: 10MB
