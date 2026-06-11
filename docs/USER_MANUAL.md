# User Manual — SAG Career Portal
**career.sahabatagro.co.id**
Versi: 2.0 | Terakhir diperbarui: Juni 2026

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

SAG Career Portal adalah platform rekrutmen resmi PT Sahabat Agro Group (SAG) untuk melamar pekerjaan di seluruh unit bisnis grup, termasuk:

| Perusahaan | Singkatan |
|---|---|
| PT Sahabat Agro Group | SAG *(holding)* |
| PT Pematang Agri Lestari | PAL |
| PT Lambang Sawit Perkasa | LSP |
| PT Hasil Sawit Bina Sejahtera | HSBS |
| PT Garuda Bumi Perkasa | GBP |

**URL Produksi:** https://career.sahabatagro.co.id
**URL Dev Lokal:** http://localhost:5173

**Dua jenis pengguna:**
| Role | Akses |
|---|---|
| Kandidat | Daftar, login, lamar pekerjaan, pantau status |
| HR Admin | Login khusus, kelola lowongan, lamaran, kandidat & perusahaan |

---

## 2. Kandidat — Panduan Lengkap

### 2.1 Registrasi Akun

1. Kunjungi `/candidate/register`
2. Isi form: Nama Lengkap, Email, No. HP/WhatsApp, Password (min. 8 karakter), Konfirmasi Password
3. Centang persetujuan pemrosesan data pribadi
4. Klik **Buat Akun**
5. Setelah berhasil, diarahkan ke halaman login

> **Catatan:** Lengkapi profil terlebih dahulu sebelum melamar — tombol Apply tidak muncul jika profil belum lengkap.

### 2.2 Login Kandidat

1. Kunjungi `/candidate/login`
2. Masukkan email dan password
3. Klik **Masuk** → diarahkan ke Dashboard Kandidat

### 2.3 Dashboard Kandidat (`/candidate/dashboard`)

Menampilkan:
- **Total Lamaran** — jumlah lamaran yang sudah dikirim
- **Active / Interview** — lamaran yang masih aktif diproses
- **Status Profil** — apakah profil sudah lengkap (✓) atau belum (!)
- **Aturan Grup** — jika masih dalam periode 12 bulan dari lamaran terakhir, muncul banner amber berisi nama posisi, tanggal melamar, dan tanggal bisa melamar kembali
- **Daftar Lamaran** — tabel semua lamaran beserta status terkini

### 2.4 Melengkapi Profil (`/candidate/profile`)

Sebelum melamar **wajib** mengisi:
- Nama Lengkap, No. HP
- Domisili (kota)
- Pendidikan terakhir, Jurusan
- Tahun pengalaman kerja
- Perusahaan & jabatan saat ini (jika ada)
- Ekspektasi gaji
- Upload CV (PDF, maks 10 MB)

Field opsional: LinkedIn URL, portfolio URL.

Klik **Simpan Perubahan** setelah mengisi.

### 2.5 Melamar Pekerjaan (`/jobs`)

1. Buka halaman **Lowongan** dari navbar
2. Gunakan filter (departemen, tipe) atau kolom pencarian
3. Klik lowongan yang diminati → halaman detail
4. Sidebar menampilkan nama perusahaan, closing date, dan tombol **Apply Sekarang**
5. Jika belum login → diarahkan ke halaman login kandidat terlebih dahulu
6. Isi form lamaran: gaji diharapkan, ketersediaan mulai kerja, cover letter (opsional)
7. Klik **Kirim Lamaran**

**Aturan Grup — 1 Lamaran per 12 Bulan:**

Satu kandidat hanya dapat melamar **satu kali ke seluruh grup SAG** dalam periode 12 bulan. Jika sudah melamar posisi mana pun dalam setahun terakhir:
- Halaman detail menampilkan notifikasi amber berisi posisi yang pernah dilamar + tanggal bisa melamar kembali
- Halaman Apply akan menampilkan halaman blokir (tidak bisa submit)
- Dashboard kandidat menampilkan banner informasi yang sama

### 2.6 Formulir Lengkap SAG (`/candidate/profile`)

Di halaman profil juga terdapat **Formulir Data Diri SAG** — digunakan saat proses seleksi dan tercetak dalam formulir lamaran HR. Isi selengkap mungkin.

### 2.7 Melihat Status Lamaran (`/candidate/applications`)

Tabel semua lamaran dengan posisi, tanggal, dan status terkini.

**Status pipeline lamaran:**
| Status | Arti |
|---|---|
| Applied | Lamaran diterima, menunggu diproses HR |
| Screening HR | Seleksi administrasi oleh HR |
| Psikotes | Diundang untuk psikotes |
| Interview HR | Wawancara dengan tim HR |
| Interview User | Wawancara dengan user/departemen terkait |
| Offering | Tahap penawaran kerja |
| Accepted | Diterima bekerja |
| Rejected | Tidak lolos seleksi |
| Talent Pool | Ditandai sebagai kandidat potensial untuk kebutuhan mendatang |

---

## 3. HR Admin — Panduan Lengkap

### 3.1 Login HR Admin (`/hr/login`)

> Halaman ini **hanya** untuk HR Admin dan Super Admin. Kandidat login di `/candidate/login`.

1. Kunjungi `/hr/login`
2. Masukkan email dan password akun HR
3. Klik **Sign In to HR Admin** → diarahkan ke HR Dashboard

**Syarat akses:** Akun harus memiliki `role = 'hr_admin'` atau `role = 'super_admin'` di tabel `profiles`. Hubungi Super Admin atau Tim IT jika akun belum diberi akses.

### 3.2 HR Dashboard (`/hr/dashboard`)

Ringkasan rekrutmen real-time:

**Cards Overview (baris atas):**
- **Total Applications** — semua lamaran; klik → halaman Applications
- **New / Submitted** — lamaran berstatus Applied; klik → filter Applied
- **In Progress** — gabungan Screening HR + Psikotes + Interview HR + Interview User + Offering; klik → filter in_progress
- **Accepted** — lamaran diterima; klik → filter Accepted

**Status Breakdown (baris kedua):**  
6 kartu kecil per status (Applied, Screening HR, Interview HR, Offering, Accepted, Rejected) — masing-masing dapat diklik untuk langsung membuka filter.

**Recent Applications:**  
5 lamaran terbaru dengan nama kandidat, posisi, status, dan tanggal. Klik **Detail** untuk membuka.

**Perlu Tindakan:**  
Lamaran berstatus *Applied* yang masuk lebih dari 7 hari lalu dan belum diproses. Maksimal 5 baris ditampilkan; lebih dari itu ada link ke semua lamaran tertunda.

### 3.3 Manajemen Lowongan (`/hr/jobs`)

#### Tab Status
- **Open** — lowongan aktif, terlihat oleh kandidat
- **Draft** — belum dipublikasikan
- **Closed** — ditutup, tidak terlihat kandidat

#### Filter & Pencarian
- Dropdown **Perusahaan** — filter per PT
- **Search** — cari judul posisi atau departemen

#### Kolom Statistik Lamaran
| Kolom | Keterangan |
|---|---|
| Total | Jumlah semua lamaran; klik untuk buka filter di Applications |
| New | Lamaran berstatus Applied (biru) |
| Progress | Lamaran dalam proses (ungu) |
| H / R | Hired / Rejected count |

#### Menambah Lowongan Baru
1. Klik **Tambah Lowongan**
2. Isi form: Judul Posisi *(wajib)*, Perusahaan *(wajib)*, Departemen, Lokasi, Tipe Pekerjaan, Level, Pengaturan Kerja, Closing Date
3. Isi konten: Deskripsi, Tanggung Jawab, Persyaratan, Benefit
4. Pilih status: **Draft** (belum publik) atau **Published** (langsung tayang)
5. Klik **Simpan Lowongan**

> Slug URL dibuat otomatis dari judul saat pertama kali disimpan. Setelah ada lamaran masuk, slug tidak dapat diubah untuk menjaga konsistensi data.

#### Mengedit Lowongan
1. Klik ikon **pensil** di baris lowongan
2. Ubah field yang diperlukan
3. Klik **Simpan Perubahan**

> Jika lowongan sudah ada lamaran, muncul peringatan amber tentang slug yang terkunci.

#### Menutup / Membuka Kembali Lowongan
- Klik ikon **toggle** di kolom Aksi
- Konfirmasi di dialog yang muncul
- Status beralih antara `published` ↔ `closed`

### 3.4 Kelola Lamaran (`/hr/applications`)

Daftar semua lamaran dengan filter:
- **Status** — pilih satu status atau "In Progress (All)" untuk semua tahap aktif
- **Perusahaan** — filter per PT (jika lamaran terhubung ke job dengan company_id)
- **Pencarian** — nama kandidat atau judul posisi

Klik baris lamaran untuk membuka detail.

### 3.5 Detail Lamaran (`/hr/applications/:id`)

Halaman ini memuat:
- **Informasi Kandidat** — nama, email, HP, domisili, pendidikan, perusahaan terakhir, jabatan, ekspektasi gaji profil
- **Link CV** — klik untuk membuka dokumen CV
- **Link LinkedIn** (jika diisi)
- **Detail Lamaran** — ekspektasi gaji saat melamar, ketersediaan, cover letter
- **Formulir Data Diri SAG** — jika kandidat sudah mengisi form lengkap

#### Mengubah Status Pipeline
1. Di sidebar kanan, pilih status baru dari dropdown
2. Klik **Simpan Status**

#### Menambah Catatan Internal
1. Ketik catatan di area teks bawah (hasil interview, observasi, dll.)
2. Klik **Tambah Catatan**
3. Catatan hanya terlihat oleh HR Admin, tidak oleh kandidat

#### Mencetak Formulir Lamaran
1. Klik **Cetak Formulir** (pojok kanan atas atau bawah)
2. Browser membuka dialog print
3. **Kop surat otomatis** — logo dan nama PT sesuai perusahaan yang membuka lowongan tersebut (bukan selalu SAG Holding). Jika perusahaan belum memiliki logo, otomatis menggunakan logo SAG sebagai fallback
4. Kop menampilkan: logo, nama PT, alamat (jika ada), label "EMPLOYMENT APPLICATION FORM", dan tanggal cetak

> Widget helpdesk dan elemen UI lainnya **tidak ikut tercetak** (`print:hidden`).

### 3.6 Daftar Kandidat (`/hr/candidates`)

Tabel semua kandidat terdaftar: nama, email, HP, domisili, pendidikan, dan link CV. Tersedia filter dan pencarian.

### 3.7 Kelola Perusahaan (`/hr/companies`)

Daftar PT dalam Grup SAG beserta logo yang digunakan pada kop cetak formulir.

#### Menambah Perusahaan Baru
1. Klik **Tambah PT**
2. Isi form:
   - **Nama Perusahaan** *(wajib)* — nama lengkap, mis. "PT Garuda Bumi Perkasa"
   - **Singkatan / Short Name** — mis. "GBP"
   - **Alamat** — opsional, muncul di kop cetak
3. Upload logo (opsional):
   - Format: PNG, WebP, atau JPG
   - Ukuran maksimal: 1 MB
   - Preview tampil sebelum disimpan
4. Klik **Simpan**

#### Mengedit Perusahaan
1. Klik ikon **pensil** di baris perusahaan
2. Ubah field yang diperlukan; upload logo baru jika ingin ganti
3. Klik **Simpan Perubahan**

> Perusahaan holding (SAG) ditandai dengan badge **Holding** dan selalu muncul paling atas. Logo holding digunakan sebagai fallback di kop cetak jika perusahaan anak belum memiliki logo.

---

## 4. Fitur Umum

### 4.1 Bahasa (ID / EN)

Toggle bahasa tersedia di Navbar (pojok kanan atas). Preferensi disimpan di localStorage.

### 4.2 Anti-Penipuan

SAG Career Portal **tidak pernah** memungut biaya dalam proses rekrutmen. Jika ada pihak yang meminta biaya atas nama SAG, segera hubungi:
- Email HR: hr@sahabatagro.co.id
- Email IT: sahabatagro.it@gmail.com

### 4.3 Halaman Lowongan Publik (`/jobs`)

Menampilkan semua posisi berstatus `published`. Filter berdasarkan departemen, tipe pekerjaan, dan pencarian teks.

### 4.4 Halaman Kontak (`/contact`)

Form pesan langsung ke tim HR via Web3Forms. Informasi kontak lengkap.

---

## 5. Troubleshooting

### "Akses ditolak. Portal ini hanya untuk HR Admin."
**Penyebab:** Role akun bukan `hr_admin` atau `super_admin`.  
**Solusi:** Hubungi Super Admin untuk mengatur role di database.

### Tombol "Apply Sekarang" tidak muncul
**Penyebab:** Profil kandidat belum lengkap (domisili, pendidikan, atau CV belum diisi).  
**Solusi:** Lengkapi profil di `/candidate/profile` terlebih dahulu.

### Muncul halaman blokir saat mencoba Apply
**Penyebab:** Sudah pernah melamar ke grup SAG dalam 12 bulan terakhir.  
**Solusi:** Halaman menampilkan tanggal kapan bisa melamar kembali. Kandidat perlu menunggu hingga tanggal tersebut.

### Logo perusahaan tidak muncul di kop cetak
**Penyebab:** Logo belum diupload atau URL logo tidak valid.  
**Solusi:** Buka `/hr/companies`, edit perusahaan terkait, dan upload logo baru (PNG/WebP/JPG, maks 1 MB). Sistem akan fallback ke logo SAG hingga logo baru diupload.

### Upload logo gagal di Kelola Perusahaan
**Penyebab:** File terlalu besar (>1 MB) atau format tidak didukung.  
**Solusi:** Kompres gambar atau convert ke PNG/WebP sebelum upload.

### Tidak bisa upload CV (kandidat)
**Penyebab:** File terlalu besar (>10 MB) atau format tidak didukung.  
**Solusi:** Pastikan file PDF maksimal 10 MB.

### Slug tidak bisa diubah saat edit lowongan
**Penyebab:** Lowongan sudah memiliki lamaran; mengubah slug akan memutus relasi data.  
**Solusi:** Buat lowongan baru jika perlu slug yang berbeda, atau pertahankan slug yang ada.

### Halaman loading terus
**Penyebab:** Koneksi ke Supabase lambat atau error konfigurasi.  
**Solusi:** Refresh halaman. Jika berlanjut, hubungi Tim IT.

---

## 6. Kontak Dukungan

| Keperluan | Kontak |
|---|---|
| Pertanyaan rekrutmen | hr@sahabatagro.co.id |
| Masalah teknis website | sahabatagro.it@gmail.com |
| Laporan penipuan | hr@sahabatagro.co.id |

**Website Utama:** https://www.sahabatagro.co.id  
**LinkedIn:** https://linkedin.com/company/sahabat-agro-group
