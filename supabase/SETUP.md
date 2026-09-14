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
