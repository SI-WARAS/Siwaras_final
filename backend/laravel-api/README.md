# SI-WARAS Laravel API Backend

Backend REST API untuk aplikasi SI-WARAS (Sistem Informasi Warga Sehat) berbasis **Laravel 13** + **Sanctum** sebagai pengganti Node.js/Prisma backend.

---

## ⚙️ Persyaratan

| Kebutuhan | Versi |
|-----------|-------|
| PHP       | >= 8.1 |
| Composer  | >= 2.x |
| MySQL/MariaDB | >= 5.7 / 10.x |
| PHP Extensions | `pdo_mysql`, `fileinfo`, `mbstring`, `openssl` |

---

## 🚀 Cara Menjalankan

### 1. Install dependensi
```bash
cd backend/laravel-api
composer install
```

### 2. Konfigurasi environment
File `.env` sudah dikonfigurasi. Sesuaikan jika perlu:
```env
DB_DATABASE=siwaras
DB_USERNAME=root
DB_PASSWORD=
```

### 3. Generate app key (jika belum ada)
```bash
php artisan key:generate
```

### 4. Jalankan migrasi + seeder
```bash
php artisan migrate:fresh --seed
```
Ini akan membuat semua tabel dan mengisi data awal:
- 14 Pedukuhan
- 1 Admin (`admin` / `admin123`)
- 1 Kepala Desa (`kepala_desa` / `kepala123`)
- 14 Kader per pedukuhan (`kader_<nama>` / `kader123`)

### 5. Jalankan server
```bash
php artisan serve --port=8000
```
Server berjalan di: **http://127.0.0.1:8000**

---

## 📡 API Endpoints

### Auth (Publik)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login, dapatkan token |

### Auth (Protected)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/auth/me` | Info user saat ini |
| `POST` | `/api/auth/logout` | Logout (hapus token) |

### Dashboard
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/dashboard/stats` | Statistik PTM & area |

### Pasien
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/patients` | Daftar pasien (+ search, pagination) |
| `POST` | `/api/patients` | Tambah pasien baru |
| `GET`  | `/api/patients/{id}` | Detail pasien |
| `PUT`  | `/api/patients/{id}` | Update pasien |
| `DELETE` | `/api/patients/{id}` | Hapus pasien |

### Pedukuhan
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/pedukuhans` | Daftar semua pedukuhan |

### Rekam Medis
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `GET`  | `/api/records` | Semua rekam medis |
| `POST` | `/api/records` | Tambah rekam medis |
| `GET`  | `/api/records/{id}` | Detail rekam medis |
| `PUT`  | `/api/records/{id}` | Update rekam medis |
| `DELETE` | `/api/records/{id}` | Hapus rekam medis |
| `GET`  | `/api/records/patient/{patientId}` | Rekam medis per pasien |

---

## 🔐 Autentikasi

Gunakan **Bearer Token** di header setiap request yang dilindungi:

```
Authorization: Bearer <token_dari_login>
```

Contoh login:
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

## 👥 Role & Akses

| Role | Akses Data |
|------|-----------|
| `ADMIN` | Semua data |
| `VILLAGE_HEAD` | Semua data |
| `HEALTH_WORKER` | Hanya data pedukuhan sendiri |

---

## 📁 Struktur Penting

```
laravel-api/
├── app/
│   ├── Http/Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── PatientController.php
│   │   ├── MedicalRecordController.php
│   │   └── DashboardController.php
│   └── Models/
│       ├── User.php
│       ├── Pedukuhan.php
│       ├── Patient.php
│       └── MedicalRecord.php
├── database/
│   ├── migrations/
│   └── seeders/DatabaseSeeder.php
├── routes/api.php
├── config/cors.php
└── .env
```

---

## 🔧 Aktifkan Ekstensi PHP (jika belum)

Edit `php.ini` dan hapus tanda `;` pada:
```ini
extension=pdo_mysql
extension=fileinfo
extension=mbstring
```
