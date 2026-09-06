# Koperasi Keluarga

Aplikasi web sederhana untuk mengelola koperasi keluarga, dengan tampilan
mobile-first bergaya aplikasi fintech: dashboard berbasis kartu, bottom
navigation, dan dukungan mode gelap.

## Menjalankan

Aplikasi ini adalah static site (HTML/CSS/JS murni, tanpa build step).
Buka `index.html` langsung di browser, atau jalankan server statis lokal:

```bash
python3 -m http.server 8000
# lalu buka http://localhost:8000
```

Data disimpan di `localStorage` browser (per perangkat/browser), diisi
otomatis dengan **data contoh** saat pertama kali dibuka.

## Struktur Menu (4 Tab)

- **Dashboard** — kas koperasi, saldo simpanan, pinjaman aktif, SHU tahun
  ini, jumlah anggota, notifikasi jatuh tempo, quick action (Setoran,
  Penarikan, Pinjaman, Angsuran), dan aktivitas terbaru.
- **Anggota** — daftar anggota (cari by nama) → klik untuk lihat profil,
  grafik simpanan 6 bulan terakhir, riwayat transaksi, SHU diterima, dan
  kode anggota.
- **Keuangan** — ringkasan kas masuk/keluar/saldo akhir, grafik simpanan
  per bulan, pinjaman beredar, dan tren kas koperasi.
- **Laporan** — filter periode (Hari Ini/Bulan Ini/Tahun Ini/Custom) dan
  jenis laporan (Simpanan/Pinjaman/Angsuran/SHU Anggota), dengan ekspor
  ke Excel (CSV) dan PDF (cetak browser).

## Struktur Berkas

```
index.html        markup + 4 tab panel + modal (quick action, detail anggota)
assets/style.css  tema, layout mobile-first, dark mode
assets/app.js     data contoh, state, rendering, dan logika interaksi
```

## Catatan & Batasan (belum diimplementasikan)

- **QR anggota**: hanya ditampilkan sebagai kode unik (`KOP-xxxx`) dan
  pola dekoratif — bukan QR yang bisa dipindai kamera sungguhan. Fitur
  scan kamera nyata butuh library QR + izin kamera, belum dibuat di
  versi ini.
- **SHU otomatis tutup buku**: SHU dihitung proporsional terhadap saldo
  simpanan tiap anggota sebagai simulasi, bukan proses tutup buku
  akuntansi yang sesungguhnya.
- **Tidak ada backend/login**: semua data tersimpan lokal di browser
  (localStorage), tidak disinkronkan antar perangkat/pengguna. Untuk
  penggunaan multi-anggota sungguhan perlu backend + autentikasi.
- Data awal (nama anggota, saldo, transaksi) adalah **data contoh**
  untuk demo tampilan, bukan data koperasi nyata.
