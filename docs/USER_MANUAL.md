# User Manual — SAG Career Portal
**career.sahabatagro.co.id**
Versi: 1.0 | Terakhir diperbarui: Juni 2026

---

## Daftar Isi
1. [Gambaran Umum](#1-gambaran-umum)
2. [Kandidat — Panduan Lengkap](#2-kandidat--panduan-lengkap)
3. [HR Admin — Panduan Lengkap](#3-hr-admin--panduan-lengkap)
4. [Fitur Umum](#4-fitur-umum)
5. [Troubleshooting](#5-troubleshooting)
6. [Kontak Dukungan](#6-kontak-dukungan)

---

## 1. Gambaran Umum

SAG Career Portal adalah platform rekrutmen resmi PT Sahabat Agro Group (SAG) untuk melamar pekerjaan di seluruh unit bisnis SAG, termasuk:
- PT Sahabat Agro Group (Induk)
- PT Gemilang Berlian Pratama (GBP)
- PT Subur Makmur Sentosa (SMS)
- PT Agro Makmur Raya (AMR)

**URL Produksi:** https://career.sahabatagro.co.id
**URL Dev Lokal:** http://localhost:5173

**Dua jenis pengguna:**
| Role | Akses |
|------|-------|
| Kandidat | Daftar, login, lamar pekerjaan, pantau status |
| HR Admin | Login khusus, kelola lamaran & kandidat |

---

## 2. Kandidat — Panduan Lengkap

### 2.1 Registrasi Akun

1. Kunjungi `/candidate/register`
2. Isi form:
   - Nama Lengkap
   - Alamat Email (akan dipakai untuk login)
   - No. HP / WhatsApp
   - Password (minimal 8 karakter)
   - Konfirmasi Password
3. Centang persetujuan pemrosesan data pribadi
4. Klik **Buat Akun**
5. Setelah berhasil, akan diarahkan ke halaman login

> **Catatan:** Setelah mendaftar, lengkapi profil terlebih dahulu sebelum melamar posisi.

### 2.2 Login

1. Kunjungi `/candidate/login`
2. Masukkan email dan password
3. Klik **Masuk**
4. Jika berhasil, diarahkan ke Dashboard

### 2.3 Dashboard Kandidat (`/candidate/dashboard`)

Dashboard menampilkan:
- **Total Lamaran** — jumlah lamaran yang sudah dikirim
- **Active / Interview** — lamaran yang masih aktif diproses
- **Status Profil** — apakah profil sudah lengkap (✓) atau belum (!)
- **Daftar Lamaran** — tabel semua lamaran beserta status terkini
- **Shortcut** — Update Profil & Browse Lowongan

**Status lamaran yang mungkin muncul:**
| Status | Arti |
|--------|------|
| Submitted | Lamaran diterima, belum diproses |
| Screening | Sedang diseleksi oleh HR |
| Interview | Diundang interview |
| Offering | Tahap penawaran kerja |
| Accepted | Diterima bekerja |
| Rejected | Tidak lolos seleksi |

### 2.4 Melengkapi Profil (`/candidate/profile`)

Sebelum melamar, pastikan profil lengkap:
- **Nama & Kontak** — Nama lengkap, nomor HP
- **Domisili** — Kota tempat tinggal saat ini
- **Pendidikan** — Jenjang pendidikan terakhir
- **Jurusan** — Bidang studi
- **Pengalaman** — Berapa tahun pengalaman kerja
- **Perusahaan Sekarang** — Perusahaan & posisi saat ini (jika ada)
- **Gaji yang Diharapkan** — Ekspektasi gaji
- **LinkedIn** — URL profil LinkedIn (opsional)
- **Portfolio** — URL portfolio (opsional)
- **Upload CV** — File PDF/Word, maks 10MB

Klik **Simpan Perubahan** setelah mengisi semua data.

### 2.5 Melamar Pekerjaan (`/jobs`)

1. Buka halaman **Lowongan** dari menu navbar
2. Gunakan filter untuk mencari berdasarkan departemen/lokasi
3. Klik lowongan yang diminati
4. Di halaman detail, klik **Lamar Sekarang**
5. Isi form lamaran:
   - Gaji yang diharapkan
   - Ketersediaan mulai kerja
   - Surat lamaran singkat (opsional)
   - Upload CV terbaru (atau gunakan yang sudah ada di profil)
6. Klik **Kirim Lamaran**

> **Penting:** Satu akun hanya bisa melamar satu posisi yang sama. Jika sudah melamar, tombol akan menampilkan "Sudah Melamar".

### 2.6 Melihat Status Lamaran (`/candidate/applications`)

Halaman ini menampilkan semua lamaran lengkap dengan:
- Posisi yang dilamar
- Tanggal melamar
- Status terkini
- Gaji yang diharapkan

---

## 3. HR Admin — Panduan Lengkap

### 3.1 Login HR Admin (`/hr/login`)

> **Penting:** Halaman ini hanya untuk HR Admin dan Super Admin. Kandidat harus login di `/candidate/login`.

1. Kunjungi `/hr/login`
2. Masukkan email dan password akun HR
3. Klik **Sign In to HR Admin**
4. Jika berhasil, diarahkan ke HR Dashboard

**Syarat akses:** Akun harus terdaftar di `profiles` dengan `role = 'hr_admin'` atau `role = 'super_admin'`.

### 3.2 HR Dashboard (`/hr/dashboard`)

Menampilkan ringkasan:
- Total lamaran masuk
- Lamaran per status (Submitted, Screening, Interview, dll)
- Lamaran terbaru (5 terakhir)

### 3.3 Kelola Lamaran (`/hr/applications`)

Daftar semua lamaran dengan:
- Filter berdasarkan status
- Informasi kandidat (nama, email, posisi)
- Tanggal melamar
- Link ke detail lamaran

Klik baris lamaran untuk membuka detail.

### 3.4 Detail Lamaran (`/hr/applications/:id`)

Halaman detail menampilkan:
- Data kandidat lengkap (nama, email, HP, domisili, pendidikan)
- Link CV kandidat
- Informasi lamaran (posisi, gaji, ketersediaan, surat lamaran)
- Tombol perubahan status:
  - Submitted → Screening → Interview → Offering → Accepted / Rejected
- Catatan internal (notes untuk tim HR)

**Mengubah status lamaran:**
1. Klik tombol status yang diinginkan
2. Status akan tersimpan otomatis

**Menambah catatan internal:**
1. Ketik catatan di kolom yang tersedia
2. Klik **Simpan Catatan**
3. Catatan hanya bisa dilihat oleh HR Admin (tidak terlihat oleh kandidat)

### 3.5 Daftar Kandidat (`/hr/candidates`)

Tabel semua kandidat terdaftar dengan:
- Nama, email, HP
- Domisili, pendidikan
- Link CV
- Filter & pencarian

---

## 4. Fitur Umum

### 4.1 Bahasa (ID / EN)

Toggle bahasa tersedia di Navbar (pojok kanan atas):
- **ID** — Bahasa Indonesia
- **EN** — English

Preferensi bahasa disimpan di browser (localStorage).

### 4.2 Anti-Penipuan

SAG Career Portal **tidak pernah** memungut biaya apapun dalam proses rekrutmen. Jika ada pihak yang meminta biaya atas nama SAG, segera hubungi:
- Email HR: hr@sahabatagro.co.id
- Email IT: admin.it@sahabatagro.co.id

### 4.3 Halaman Lowongan (`/jobs`)

- Menampilkan semua posisi aktif dari Contentful CMS
- Filter berdasarkan departemen dan tipe pekerjaan
- Pencarian berdasarkan judul posisi

### 4.4 Halaman Kontak (`/contact`)

- Form pesan langsung ke tim HR via Web3Forms
- Informasi kontak lengkap (email, telepon, alamat)
- Link LinkedIn dan website utama

---

## 5. Troubleshooting

### "Akses ditolak. Portal ini hanya untuk HR Admin."
**Penyebab:** Akun yang digunakan tidak memiliki role `hr_admin` atau `super_admin` di database.
**Solusi:** Hubungi Super Admin untuk mengatur role akun Anda di Supabase.

### Tidak bisa upload CV
**Penyebab:** File terlalu besar (>10MB) atau format tidak didukung.
**Solusi:** Pastikan file CV berformat PDF/Word dan ukurannya kurang dari 10MB.

### Tombol "Lamar Sekarang" tidak muncul
**Penyebab:** Profil belum lengkap (domisili, pendidikan, atau CV belum diisi).
**Solusi:** Lengkapi profil di `/candidate/profile` terlebih dahulu.

### Halaman loading terus
**Penyebab:** Koneksi ke Supabase lambat atau ada error.
**Solusi:** Refresh halaman. Jika masih terjadi, hubungi tim IT.

---

## 6. Kontak Dukungan

| Keperluan | Kontak |
|-----------|--------|
| Pertanyaan rekrutmen | hr@sahabatagro.co.id |
| Masalah teknis website | admin.it@sahabatagro.co.id |
| Laporan penipuan | hr@sahabatagro.co.id |

**Website Utama:** https://www.sahabatagro.co.id
**LinkedIn:** https://linkedin.com/company/sahabat-agro-group
