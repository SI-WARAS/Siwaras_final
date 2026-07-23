# SI-WARAS Prototype v2 - Panduan Running Lokal & cPanel

Dokumen ini berisi panduan lengkap untuk menjalankan proyek SI-WARAS di lingkungan **Lokal (Localhost)** dan mendeposisikannya di **cPanel Hosting**.

---

## 🗑️ 1. Pembersihan File Tidak Perlu (Cleaned Files)
File-file berikut telah dibersihkan dari direktori proyek:
- `backend/laravel-api/vendor.zip` (50MB archive usang)
- `backend/laravel-api/create_test_excel.php` & `test_import.xlsx` (File testing internal)
- `frontend/dist/fend.zip` (File zip sisa build)
- `.DS_Store` (File metadata macOS)
- `docker-compose.yml` (Konfigurasi Docker usang yang tidak dipakai)

---

## 💻 2. Cara Running di Lokal (Local Development)

### A. Persiapan Database
1. Buka MySQL Server lokal (XAMPP / Laragon / MySQL CLI).
2. Buat database baru bernama `siwaras`.
3. Import file database yang ada di root proyek: `siwaras_dump.sql` ke database `siwaras`.
   *(Atau alternatif: jalankan `php artisan migrate:fresh --seed` di folder backend untuk membuat skema & data awal otomatis).*

### Akun Bawaan (Default Credentials):
- **Admin**: `admin` / `admin123`
- **Kepala Desa**: `kepala_desa` / `kepala123`
- **Kader**: `kader_gluntung_kidul` (atau nama dusun lainnya dengan prefix `kader_`) / `kader123`


### B. Setup & Jalankan Backend (Laravel API)
1. Masuk ke folder backend:
   ```bash
   cd backend/laravel-api
   ```
2. Pastikan file `.env` mengarah ke database lokal Anda (secara default sudah diatur):
   ```env
   APP_ENV=local
   APP_DEBUG=true
   APP_URL=http://localhost:8000

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=siwaras
   DB_USERNAME=root
   DB_PASSWORD=
   ```
3. Hubungkan folder storage (jika belum):
   ```bash
   php artisan storage:link
   ```
4. Jalankan server Laravel:
   ```bash
   php artisan serve
   ```
   Backend akan berjalan di `http://127.0.0.1:8000`.

### C. Setup & Jalankan Frontend (React + Vite)
1. Buka terminal baru dan masuk ke folder frontend:
   ```bash
   cd frontend
   ```
2. Pastikan file `.env` di folder `frontend` berisi:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
3. Install dependensi (jika diperlukan) dan jalankan server pengembangan:
   ```bash
   npm install
   npm run dev
   ```
4. Buka browser ke alamat `http://localhost:5173`.

---

## 🌐 3. Panduan Deploy di cPanel Hosting

Proyek ini telah dikonfigurasi agar bisa langsung berjalan di cPanel dengan dukungan URL rewrite (`.htaccess`).

### A. Setup Database di cPanel
1. Masuk ke cPanel > **MySQL® Databases**.
2. Buat database baru (misal: `user_siwaras`).
3. Buat pengguna MySQL baru dan berikan hak akses penuh (ALL PRIVILEGES) ke database tersebut.
4. Buka **phpMyAdmin**, pilih database tersebut, lalu **Import** file `siwaras_dump.sql`.

### B. Deploy Backend (Laravel API di Subdomain / Folder)
1. Unggah seluruh isi folder `backend/laravel-api` ke server hosting (misalnya ke `/home/username/backend` atau subfolder domain `api.siwaras.com`).
2. Di cPanel > **File Manager**, buat file `.env` dari contoh `.env.cpanel.example`:
   ```env
   APP_ENV=production
   APP_DEBUG=false
   APP_URL=https://api.domain-anda.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_DATABASE=nama_user_siwaras
   DB_USERNAME=nama_user_db
   DB_PASSWORD=password_db_anda
   ```
3. Pastikan konfigurasi `.htaccess` di root folder backend & folder `public/` tetap ada (telah disiapkan di proyek).
4. Jika domain mengarah ke root backend, `.htaccess` di root backend akan otomatis mengarahkan request ke folder `public/`.
5. Buat symlink storage via Terminal cPanel (atau SSH):
   ```bash
   cd backend/laravel-api
   php artisan storage:link
   ```

### C. Deploy Frontend (React Build)
1. Di komputer lokal, masuk ke folder `frontend` dan ubah `.env.production` sesuai URL API backend cPanel Anda:
   ```env
   VITE_API_URL=https://api.domain-anda.com/api
   ```
2. Jalankan perintah build:
   ```bash
   npm run build
   ```
3. Perintah ini akan menghasilkan folder `dist/` yang di dalamnya sudah mencakup file `.htaccess` untuk SPA Routing (React Router).
4. Unggah seluruh isi dalam folder `dist/` ke **public_html** (atau subfolder domain utama Anda) di cPanel.

---

## 🔒 4. Keamanan & Konfigurasi CORS
Konfigurasi CORS di `backend/laravel-api/config/cors.php` sudah disesuaikan agar menerima permintaan baik dari `http://localhost:5173` (lokal) maupun dari domain produksi di cPanel.
