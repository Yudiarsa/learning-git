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

Login/OTP di versi ini adalah **simulasi tampilan**, bukan sistem
otentikasi sungguhan — lihat bagian Keamanan di bawah.

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

Kode OTP ditampilkan langsung di layar (`Kode demo: ...`) karena belum
ada pengiriman WA/Email sungguhan.

## Struktur Menu (5 Tab)

- **Home** — sapaan + periode arisan berjalan (ke-N dari 10), ringkasan
  (total anggota, kas terkumpul, pinjaman beredar, anggota menunggak,
  jatuh tempo bulan ini), dan pengumuman.
- **Pinjaman** — kartu pinjaman aktif (jumlah, bunga, sisa cicilan,
  sisa hutang, progress bar, jatuh tempo), tombol Ajukan Pinjaman &
  Upload Bukti Bayar; admin melihat & memutuskan pengajuan yang menunggu.
- **Pembayaran** — upload bukti pembayaran, status verifikasi, histori
  transaksi (filter Semua/Setoran/Pinjaman/Angsuran); admin memverifikasi
  bukti yang masuk.
- **Anggota** — transparansi publik: status tiap anggota (Lancar/
  Menunggak Nx/Perlu Evaluasi Keanggotaan) dengan kode warna, klik untuk
  detail (skor kepatuhan, riwayat transaksi); admin bisa tambah/nonaktifkan
  anggota.
- **Lainnya** — Buku Kas (ledger masuk/keluar, transaksi hanya bisa
  dibatalkan, tidak dihapus), Timeline Periode (1–10), Audit Log,
  "Lihat Sebagai" (demo ganti peran admin/anggota tanpa logout), Tentang
  & Keterbatasan, Keluar.

## Aturan bisnis yang diterapkan

- Bunga pinjaman **1%/bulan**, tenor **10x cicilan**. Angsuran per bulan
  = (jumlah pinjaman ÷ 10) × 1,01.
- Status keanggotaan otomatis berdasarkan jumlah tunggakan: 0 = Lancar,
  1–2 = Menunggak Nx, ≥3 = **Perlu Evaluasi Keanggotaan** (bukan
  penghapusan otomatis — keputusan tetap di tangan admin).
- Skor kepatuhan = `100 − (tunggakan × 15)`, minimum 35.

## Struktur Berkas

```
index.html        markup + 5 tab panel + modal (pinjaman, bukti, anggota) + login screen
assets/style.css  tema, layout mobile-first, dark mode
assets/app.js     data contoh, state, autentikasi (simulasi), rendering, logika bisnis
```

## Catatan & Batasan (belum diimplementasikan)

- **Keamanan/otentikasi**: login (nomor HP + password) dan OTP di
  aplikasi ini adalah **simulasi UI** — tidak ada verifikasi ke server,
  tidak ada hashing password, kode OTP ditampilkan di layar yang sama.
  **Jangan gunakan untuk data anggota/keuangan sungguhan** sebelum
  backend otentikasi nyata (mis. Supabase Auth + OTP WA/Email) dibangun.
- **Tidak ada backend/database**: semua data tersimpan lokal per browser
  (localStorage) — tidak disinkronkan antar perangkat/anggota. Setiap
  orang yang membuka aplikasi ini akan melihat data contoh yang sama,
  bukan data bersama secara real-time.
- **Foto bukti pembayaran** disimpan sebagai data URL di localStorage,
  bukan di object storage — ukurannya terbatas dan bisa hilang jika
  cache browser dibersihkan.
- **Notifikasi**: pengingat jatuh tempo hanya muncul di dalam aplikasi
  (drawer 🔔), belum ada push notification atau pesan WhatsApp
  sungguhan.
- **Audit log** mencatat aksi admin sejak sesi ini dibuka (disimpan di
  state yang sama dengan data lain) — bukan log tingkat sistem yang
  tidak bisa dimodifikasi.
- Data awal (nama anggota, saldo, transaksi, pengumuman) adalah
  **data contoh** untuk demo tampilan, bukan data SEKE MESARI yang
  sesungguhnya.

## Rencana tahap berikutnya

Sesuai arahan awal: Next.js + Supabase (Postgres + Storage + Auth) untuk
backend nyata, OTP WhatsApp/Email untuk 2FA sungguhan, dan Firebase (atau
web push) untuk notifikasi jatuh tempo — menggantikan simulasi di versi
ini satu per satu tanpa mengubah alur UI yang sudah ada.
