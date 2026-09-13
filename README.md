# SEKE MESARI — Arisan & Pinjaman Keluarga

Aplikasi web untuk mengelola arisan & pinjaman keluarga SEKE MESARI:
transparansi kas, status pinjaman tiap anggota, verifikasi pembayaran,
dan audit trail — dengan tampilan mobile-first bergaya aplikasi fintech.

## Menjalankan

Aplikasi ini adalah static site (HTML/CSS/JS murni, tanpa build step).
Buka `index.html` langsung di browser, atau jalankan server statis lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Data disimpan di `localStorage` browser (per perangkat/browser), diisi
otomatis dengan **data contoh** saat pertama kali dibuka.

## Login demo

Login (HP + password, satu langkah, tanpa OTP) hanya untuk membedakan
tampilan tiap anggota — bukan sistem otentikasi sungguhan. Lihat bagian
Keamanan di bawah untuk alasannya.

| Nama | HP | Password | Peran |
|---|---|---|---|
| Gede | 081111000001 | admin123 | Admin |
| Made | 081111000002 | made123 | Anggota (pinjaman lancar) |
| Wayan | 081111000003 | wayan123 | Anggota (menunggak 2x) |
| Komang | 081111000004 | komang123 | Anggota (tanpa pinjaman) |
| Ketut | 081111000005 | ketut123 | Anggota (perlu evaluasi) |
| Nyoman | 081111000006 | nyoman123 | Anggota (tanpa pinjaman) |
| Putu | 081111000007 | putu123 | Anggota (pinjaman lancar) |
| Kadek | 081111000008 | kadek123 | Anggota (tanpa pinjaman) |
| Wayan Sari | 081111000009 | sari123 | Anggota (tanpa pinjaman) |
| Made Ayu | 081111000010 | ayu123 | Anggota (menunggak 1x) |

## Struktur Menu (5 Tab)

- **Home** — sapaan + periode arisan berjalan (ke-N dari 10), ringkasan
  (total anggota, kas terkumpul, pinjaman beredar, anggota menunggak,
  jatuh tempo bulan ini), dan pengumuman.
- **Pinjaman** — kartu pinjaman aktif (jumlah, bunga, sisa cicilan,
  sisa hutang, progress bar, jatuh tempo) + **riwayat pembayaran bernomor
  urut** (angsuran ke berapa, tanggal, jumlah) untuk anggota melihat
  pinjamannya sendiri; tombol Ajukan Pinjaman & Upload Bukti Bayar. Admin
  melihat daftar **Menunggak & Jatuh Tempo** (semua anggota berpinjaman,
  diurutkan dari yang paling perlu perhatian) dan memutuskan pengajuan
  yang menunggu.
- **Pembayaran** — upload bukti pembayaran, status verifikasi, histori
  transaksi (filter Semua/Setoran/Pinjaman/Angsuran); admin memverifikasi
  bukti yang masuk.
- **Anggota** — transparansi publik: status tiap anggota (Lancar/
  Menunggak Nx/Perlu Evaluasi Keanggotaan) dengan kode warna, klik untuk
  detail (skor kepatuhan, riwayat pembayaran bernomor urut + tanggal jatuh
  tempo, riwayat transaksi lengkap); admin bisa tambah/nonaktifkan
  anggota.
- **Lainnya** — Buku Kas (ledger masuk/keluar, transaksi hanya bisa
  dibatalkan, tidak dihapus), Neraca Keuangan (snapshot posisi keuangan:
  Aset vs Kewajiban & Ekuitas, format dua kolom), Timeline Periode (1–10),
  Audit Log, "Lihat Sebagai" (demo ganti peran admin/anggota tanpa
  logout), Tentang & Keterbatasan, Keluar.

## Aturan bisnis yang diterapkan

- Bunga pinjaman **1%/bulan**, tenor **10x cicilan**. Angsuran per bulan
  = (jumlah pinjaman ÷ 10) × 1,01.
- Status keanggotaan otomatis berdasarkan jumlah tunggakan: 0 = Lancar,
  1–2 = Menunggak Nx, ≥3 = **Perlu Evaluasi Keanggotaan** (bukan
  penghapusan otomatis — keputusan tetap di tangan admin).
- Skor kepatuhan = `100 − (tunggakan × 15)`, minimum 35.
- **Neraca Keuangan**: Aset = Kas Koperasi + Piutang Pinjaman Anggota
  (pokok yang belum kembali). Kewajiban = total Simpanan Anggota. Ekuitas
  ("SHU / Laba Ditahan") dihitung sebagai *selisih* Aset dikurangi
  Kewajiban — bukan ditebak dari bunga per transaksi — sehingga neraca
  selalu balance sesuai persamaan akuntansi dasar (Aset = Kewajiban +
  Ekuitas), bahkan saat admin memverifikasi nominal pembayaran yang tidak
  persis mengikuti rumus angsuran.

## Struktur Berkas

```
index.html        markup + 5 tab panel + modal (pinjaman, bukti, anggota) + login screen
assets/style.css  tema, layout mobile-first, dark mode
assets/app.js     data contoh, state, autentikasi (simulasi), rendering, logika bisnis
```

## Keamanan (batasan yang disengaja, bukan sekadar "belum sempat")

Aplikasi ini sengaja dibuat tanpa backend/API — sesuai kebutuhan: tidak
ada transaksi uang riil yang diproses aplikasi, dan tidak terkoneksi ke
mobile banking. Konsekuensinya perlu dipahami, bukan diabaikan:

- **Login satu langkah (HP + password) hanya untuk identifikasi**, bukan
  proteksi keamanan. Karena tidak ada server, semua password (dan semua
  data anggota) ada di dalam `assets/app.js` yang bisa dibaca siapa pun
  yang membuka kode sumber halaman — juga bisa dilewati langsung lewat
  browser console. Ini bukan bug, ini konsekuensi struktural dari
  arsitektur client-only.
- **Cocok untuk**: dipakai internal antar anggota SEKE MESARI yang saling
  percaya, link tidak disebar ke luar kelompok.
- **Tidak cocok untuk**: data yang harus benar-benar rahasia dari sesama
  anggota, atau situasi di mana seseorang bisa punya insentif membuka
  kode sumber untuk melihat/mengubah data anggota lain.
- Jika di masa depan aplikasi ini perlu menyimpan uang riil atau
  terhubung ke sistem pembayaran, arsitektur ini **harus** diganti dengan
  backend + autentikasi sungguhan — jangan menambah fitur uang riil di
  atas fondasi client-only ini.

## Batasan lain

- **Tidak ada backend/database**: semua data tersimpan lokal per browser
  (localStorage) — tidak disinkronkan antar perangkat/anggota. Setiap
  anggota yang membuka aplikasi ini melihat data lokalnya sendiri, bukan
  data bersama secara real-time.
- **Foto bukti pembayaran** disimpan sebagai data URL di localStorage —
  ukurannya terbatas dan bisa hilang jika cache browser dibersihkan.
- **Notifikasi**: pengingat jatuh tempo hanya muncul di dalam aplikasi
  (drawer 🔔), tidak ada push notification atau pesan WhatsApp.
- **Audit log** tersimpan di state yang sama dengan data lain (localStorage)
  — bukan log tingkat sistem yang tidak bisa dimodifikasi.
- Data awal (nama anggota, saldo, transaksi, pengumuman) adalah
  **data contoh** untuk demo tampilan, bukan data SEKE MESARI yang
  sesungguhnya.
