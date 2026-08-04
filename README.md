# 🎙️ KataCek — Pengenalan Suara & Kamus Bahasa Indonesia

<p align="center">
  <b>Aplikasi Web Real-time Speech-to-Text dan Validasi Kosakata Bahasa Indonesia berbasis Web Speech API & Kamus Digital.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/Bootstrap-5.3-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap 5.3" />
  <img src="https://img.shields.io/badge/jQuery-3.7.1-0769AD?style=for-the-badge&logo=jquery&logoColor=white" alt="jQuery 3.7.1" />
  <img src="https://img.shields.io/badge/Font_Awesome-7.0-528DD7?style=for-the-badge&logo=fontawesome&logoColor=white" alt="Font Awesome" />
  <img src="https://img.shields.io/badge/Web_Speech_API-Supported-0d6efd?style=for-the-badge" alt="Web Speech API" />
</p>

---

## 📋 Daftar Isi

- [Tentang KataCek](#-tentang-katacek)
- [Fitur Utama](#-fitur-utama)
- [Teknologi & Dependensi](#-teknologi--dependensi)
- [Struktur Proyek](#-struktur-proyek)
- [Cara Menjalankan](#-cara-menjalankan)
  - [1. Menggunakan PHP (Rekomendasi)](#1-menggunakan-php-rekomendasi)
  - [2. Menggunakan Python](#2-menggunakan-python)
  - [3. Menggunakan Node.js (`http-server`)](#3-menggunakan-nodejs-http-server)
  - [4. Menggunakan WAMP / XAMPP / Live Server](#4-menggunakan-wamp--xampp--live-server)
- [Petunjuk Penggunaan](#-petunjuk-penggunaan)
- [Struktur Data `dictionary.json`](#-struktur-data-dictionaryjson)
- [Kompatibilitas Browser](#-kompatibilitas-browser)
- [Troubleshooting & Solusi Masalah](#-troubleshooting--solusi-masalah)
- [Catatan & Penolakan Tanggung Jawab](#-catatan--penolakan-tanggung-jawab)

---

## 📌 Tentang KataCek

**KataCek** adalah aplikasi web interaktif yang merubah ucapan suara (*speech-to-text*) dalam Bahasa Indonesia menjadi teks secara *real-time*, sekaligus melakukan pencocokan kata secara otomatis terhadap database kamus Bahasa Indonesia.

Setiap kata dari hasil rekaman diproses dan ditandai secara visual:
- 🟢 **Kata Ditemukan (Valid)**: Diberi warna hijau dan dapat diklik untuk menampilkan definisi/penjelasan lengkap dari kamus.
- 🔴 **Kata Tidak Ditemukan**: Diberi warna merah sebagai petunjuk bahwa kata tersebut tidak ada dalam basis data.

---

## ✨ Fitur Utama

- 🎤 **Real-time Speech Recognition**: Menggunakan Web Speech API yang dikonfigurasi khusus untuk Bahasa Indonesia (`id-ID`) dengan transkripsi sementara (*interim results*).
- 🔄 **Perekaman Berkelanjutan (Continuous Recording)**: Perekaman tetap aktif secara otomatis meskipun ada jeda bicara, hingga tombol **Stop** ditekan secara manual.
- 💬 **Tampilan Berbasis Chat (Chat-Bubble Interface)**: Transkripsi ucapan ditampilkan secara rapi dalam format gelembung percakapan (*chat bubble*).
- 🔍 **Validasi & Penandaan Kata Otomatis**:
  - Warna **Hijau** untuk kata yang terdaftar dalam kamus.
  - Warna **Merah** untuk kata yang tidak ditemukan dalam kamus.
- 📖 **Modal Detail Penjelasan Kata**: Klik pada kata berwarna hijau untuk membuka modal dialog interaktif yang menampilkan seluruh definisi dan arti kata tersebut.
- 📊 **Statistik Real-time**: Menampilkan penghitung live jumlah total kata dalam kamus, kata yang berhasil ditemukan, dan kata yang tidak ditemukan.
- ⚙️ **Pengaturan & Manajemen Sesi**:
  - Sakelar opsional (*toggle switch*) untuk mengosongkan riwayat chat secara otomatis setiap kali memulai perekaman baru.
  - Tombol **Kosongkan Chat** (*Clear*) untuk menghapus riwayat pesan kapan saja.
- ⚠️ **Penanganan Kesalahan & Deteksi Browser**: Notifikasi interaktif jika browser tidak mendukung Web Speech API, izin mikrofon ditolak, atau file database gagal dimuat.

---

## 🛠️ Teknologi & Dependensi

Proyek ini dibangun menggunakan teknologi *front-end* modern tanpa membutuhkan proses kompilasi (*build step*):

| Teknologi / Library | Versi | Fungsi / Kegunaan |
| :--- | :--- | :--- |
| **HTML5 & CSS3** | Standard | Struktur halaman & kustomisasi antarmuka (*modern CSS variables & gradients*) |
| **Bootstrap** | `v5.3.8` | Framework UI responsif, sistem grid, modal, badge, dan komponen tombol |
| **jQuery** | `v3.7.1` | Manipulasi DOM, AJAX `$.getJSON`, dan pemrosesan event interaktif |
| **Font Awesome** | `v7.0.1` | Ikonografi UI modern (mikrofon, stat, modal, dll) |
| **Web Speech API** | Browser Native | Mesin pengenalan suara (*speech recognition engine*) Bahasa Indonesia |

---

## 📁 Struktur Proyek

```text
KataCek/
├── index.html       # Antarmuka utama aplikasi (UI, gaya CSS, & logika JavaScript)
├── dictionary.json  # Database kamus Bahasa Indonesia (JSON format)
└── README.md        # Dokumentasi & panduan penggunaan proyek
```

---

## 🚀 Cara Menjalankan

> ⚠️ **PENTING**: Aplikasi ini **WAJIB** dijalankan melalui **Web Server Lokal** (menggunakan protokol `http://` atau `https://`). Membuka `index.html` langsung menggunakan protokol `file://` akan menyebabkan kegagalan pemuatan `dictionary.json` (CORS policy) dan pemblokiran akses mikrofon oleh browser.

Pilih salah satu cara menjalankan server lokal di bawah ini:

### 1. Menggunakan PHP (Rekomendasi)

Buka terminal / command prompt di dalam direktori proyek `KataCek`, lalu jalankan:

```bash
php -S localhost:8000
```

Akses aplikasi melalui browser:
```text
http://localhost:8000
```

---

### 2. Menggunakan Python

Jika Anda memiliki Python terinstal:

```bash
# Python 3.x
python -m http.server 8000
```

Akses aplikasi melalui browser:
```text
http://localhost:8000
```

---

### 3. Menggunakan Node.js (`http-server`)

Jika Anda menggunakan Node.js:

```bash
npx http-server -p 8000
```

Akses aplikasi melalui browser:
```text
http://localhost:8000
```

---

### 4. Menggunakan WAMP / XAMPP / Live Server

- **WampServer / XAMPP**: Tempatkan folder `KataCek` di dalam direktori web root (misal `c:\wamp64\www\KataCek` atau `C:\xampp\htdocs\KataCek`), aktifkan Apache, lalu buka `http://localhost/KataCek/index.html`.
- **VS Code Live Server**: Buka proyek di VS Code, klik kanan pada `index.html` dan pilih **Open with Live Server**.

---

## 📖 Petunjuk Penggunaan

1. **Buka Aplikasi**: Akses alamat server lokal pada browser yang didukung (Google Chrome atau Microsoft Edge).
2. **Muat Database**: Tunggu hingga indikator *"Memuat database kamus..."* selesai dan berubah menjadi sukses.
3. **Mulai Merekam**:
   - Klik tombol **Mulai Merekam** (berwarna biru dengan ikon mikrofon).
   - Berikan izin (*allow*) akses mikrofon saat browser meminta konfirmasi.
4. **Berbicara**:
   - Mulai berbicara dalam Bahasa Indonesia dengan jelas.
   - Teks ucapan sementara (*interim text*) akan muncul secara langsung.
   - Setelah klausa selesai, teks akan dikonversi menjadi gelembung chat (*chat bubble*).
5. **Cek Arti Kata**:
   - Klik pada kata berwarna **hijau** untuk membuka modal penjelasan definisi kata tersebut.
   - Kata berwarna **merah** mengindikasikan kata tersebut belum terdaftar di database.
6. **Menghentikan Perekaman**: Klik tombol **Stop** (berwarna merah) untuk mengakhiri sesi perekaman.
7. **Pengaturan Chat**:
   - Centang atau hapus centang opsi *"Kosongkan chat setiap kali mulai merekam"* sesuai kebutuhan Anda.
   - Gunakan tombol **Hapus (Ikon Tong Sampah)** untuk membersihkan obrolan kapan saja.

---

## 📊 Struktur Data `dictionary.json`

File `dictionary.json` menyimpan metadata dan peta kata beserta daftar definisinya:

```json
{
  "_metadata": {
    "jumlah_entri": 115664,
    "jumlah_kata_unik": 70934
  },
  "kata": {
    "abad": [
      "masa seratus tahun"
    ],
    "aplikasi": [
      "karya simpanan",
      "penggunaan; penerapan"
    ]
  }
}
```

### Statistik Database
- **Total Entri**: **115.664**
- **Kata Unik**: **70.934**
- **Sumber Data**: `dictionary__MySQL.sql` (dikompilasi menjadi format JSON).

---

## 🌐 Kompatibilitas Browser

Web Speech API memerlukan dukungan browser native:

| Browser | Dukungan | Catatan |
| :--- | :---: | :--- |
| **Google Chrome** (Desktop/Android) | ✅ **Sangat Baik** | Kompatibilitas terbaik untuk pengenalan suara Bahasa Indonesia (`id-ID`). |
| **Microsoft Edge** (Chromium) | ✅ **Sangat Baik** | Berbasis Chromium, bekerja dengan lancar. |
| **Brave / Opera / Vivaldi** | ⚠️ **Parsial** | Tergantung pada konfigurasi layanan Web Speech internal browser. |
| **Mozilla Firefox** | ❌ **Tidak Didukung** | Web Speech API belum diaktifkan secara bawaan di Firefox. |
| **Apple Safari** | ⚠️ **Terbatas** | Memerlukan dukungan Speech Recognition API versi terbaru di macOS/iOS. |

---

## ⚠️ Troubleshooting & Solusi Masalah

#### 1. Pesan: *"dictionary.json gagal dimuat..."*
- **Penyebab**: Aplikasi dibuka langsung via `file://` atau file `dictionary.json` tidak berada dalam direktori yang sama dengan `index.html`.
- **Solusi**: Pastikan Anda menjalankan aplikasi melalui web server lokal (`http://localhost:...`).

#### 2. Pesan: *"Browser belum mendukung SpeechRecognition"*
- **Penyebab**: Anda menggunakan browser yang belum mendukung Web Speech API (seperti Firefox).
- **Solusi**: Buka aplikasi menggunakan Google Chrome atau Microsoft Edge versi terbaru.

#### 3. Pesan Error: *"Izin mikrofon ditolak"*
- **Penyebab**: Browser memblokir akses ke mikrofon.
- **Solusi**: Klik ikon gembok / pengatur izin di bilah alamat (*address bar*) browser, ubah izin Mikrofon menjadi **Izinkan (Allow)**, lalu muat ulang halaman.

#### 4. Suara tidak terdeteksi saat berbicara
- **Penyebab**: Mikrofon bawaan perangkat tidak aktif atau terhubung ke perangkat input yang salah.
- **Solusi**: Periksa pengaturan audio sistem operasi Anda dan pastikan input mikrofon sudah benar.

---

## 📜 Catatan & Penolakan Tanggung Jawab

Data kamus yang digunakan dalam aplikasi ini berasal dari referensi berkas pengguna dan **tidak diklaim sebagai edisi resmi KBBI 2026** atau terbitan resmi Badan Pengembangan dan Pembinaan Bahasa. Aplikasi ini ditujukan untuk kebutuhan demonstrasi, eksperimen, dan alat bantu pengenalan suara Bahasa Indonesia.
