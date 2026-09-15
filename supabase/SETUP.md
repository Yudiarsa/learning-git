# Setup Supabase untuk SEKE MESARI

Langkah ini hanya perlu dilakukan **sekali** oleh Anda (saya tidak bisa membuat
akun Supabase atas nama Anda).

## 1. Buat akun & project

1. Buka https://supabase.com → **Start your project** → daftar pakai akun
   GitHub Anda (tidak perlu kartu kredit untuk free tier).
2. Klik **New project**.
3. Isi:
   - **Name**: `seke-mesari` (bebas)
   - **Database Password**: buat password kuat, **simpan baik-baik** (ini
     password database, beda dari password login anggota).
   - **Region**: pilih yang paling dekat (mis. Southeast Asia (Singapore)).
4. Klik **Create new project**, tunggu ±2 menit sampai statusnya aktif.

## 2. Jalankan skema database

1. Di sidebar kiri project, klik **SQL Editor**.
2. Klik **New query**.
3. Buka file `supabase/schema.sql` di repo ini, copy semua isinya, paste ke
   SQL Editor.
4. Klik **Run** (atau Ctrl+Enter). Harus muncul "Success. No rows returned".

## 3. Aktifkan Storage untuk foto bukti pembayaran

1. Di sidebar kiri, klik **Storage**.
2. Klik **New bucket** → nama `bukti-pembayaran` → **Public bucket**: ON
   (supaya foto bisa ditampilkan langsung tanpa autentikasi tambahan) →
   **Create bucket**.

## 4. Ambil kredensial untuk saya

1. Di sidebar kiri, klik **Project Settings** (ikon gear) → **API**.
2. Salin dua nilai ini dan kirim ke saya:
   - **Project URL** (bentuknya `https://xxxxx.supabase.co`)
   - **anon public** key (kunci panjang di bagian "Project API keys")

   ⚠️ **Jangan** kirim `service_role` key — itu kunci rahasia dengan akses
   penuh, tidak boleh dipakai di aplikasi client-side sama sekali.

Setelah saya terima dua nilai itu, saya lanjutkan migrasi kode aplikasinya.

## 5. Jadikan diri Anda admin pertama

Semua orang yang mendaftar lewat aplikasi otomatis jadi **role: anggota**
(bukan admin) — ini sengaja, supaya orang tidak bisa mengangkat diri
sendiri jadi admin. Karena itu, admin pertama harus di-set manual, sekali
saja:

1. Buka aplikasi, tap **"Belum punya akun? Daftar di sini"**, daftar
   dengan nama & nomor HP Anda sendiri sebagai bendahara/admin.
2. Kembali ke Supabase **SQL Editor** → **New query**, jalankan (ganti
   nomor HP sesuai yang Anda daftarkan):
   ```sql
   update public.anggota set role = 'admin' where hp = '081111000001';
   ```
3. Logout dari aplikasi lalu login lagi — sekarang tampil sebagai Admin.

Anggota lain yang mendaftar setelahnya otomatis dapat role anggota biasa —
kalau perlu tambah admin lagi, ulangi langkah 2 dengan nomor HP mereka.
