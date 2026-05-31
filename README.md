# IASH — IPB Academic Service Helper

Sistem manajemen tiket layanan akademik IPB. Mahasiswa mengajukan permintaan (surat keterangan, legalisir, cuti akademik, dll.), staf TU meninjau dan memproses pengajuan tersebut.

---

## Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS |
| Backend | Python 3.11 + FastAPI + SQLAlchemy |
| Database | PostgreSQL |
| Auth | JWT (HS256, 24 jam) + bcrypt |
| Email | SMTP via fastapi-mail |
| Deploy | Vercel (frontend) + Railway (backend + DB) |

---

## Arsitektur Backend

```
Request → Route → Service Layer → Repository → ORM Model → PostgreSQL
```

- **Routes** (`app/routes/`) — hanya terima request dan kembalikan response
- **Services** (`app/services/`) — semua business logic di sini
- **Repositories** (`app/repositories/`) — semua query database di sini
- **Models** (`app/models/`) — mapping schema ORM saja, tanpa logic

Semua komponen backend menggunakan OOP (class-based).

---

## Alur Status Tiket

```
Dalam Antrean → Diproses → Dalam Pembuatan → Selesai
                         ↘ Ditolak
```

Staff mengambil tiket dari pool antrean sesuai levelnya (FIFO, menggunakan `SELECT FOR UPDATE SKIP LOCKED` untuk mencegah race condition).

### Level Staff vs Layanan

| Role | Level | Menangani |
|------|-------|-----------|
| `staff_departemen` | departemen | _(belum ada layanan level departemen di katalog `seed_services.py` saat ini)_ |
| `staff_fakultas` | fakultas | 6 layanan tingkat fakultas (cuti, aktif kembali, pengunduran diri, perpanjangan studi, keterangan kelulusan, legalisasi ijazah/transkrip) |
| `staff_ipb` | ipb | 8 layanan tingkat IPB (surat keterangan aktif, berbagai SK PDDIKTI/ijazah/KTM/beasiswa, SKPI, dll.) |

> Catatan: katalog `seed_services.py` hanya berisi layanan level `fakultas` dan `ipb`. Akun `staff_departemen` tetap bisa login namun antreannya kosong sampai ada layanan level `departemen` ditambahkan.

---

## Setup Lokal

### Prasyarat

- Python 3.11+
- Node.js 18+
- PostgreSQL (berjalan di localhost:5432)

### Backend

```bash
cd backend

# Buat virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Buat file .env dari template
cp .env.example .env
# Buka .env dan sesuaikan nilai DATABASE_URL dan SECRET_KEY

# Buat database PostgreSQL
psql -U postgres -c "CREATE USER iash_user WITH PASSWORD 'iash_pass';"
psql -U postgres -c "CREATE DATABASE iash_db OWNER iash_user;"

# Jalankan server
uvicorn main:app --reload --port 8000
```

Nilai `.env` minimal yang perlu diubah dari template untuk dev lokal:

```env
DATABASE_URL=postgresql://iash_user:iash_pass@localhost:5432/iash_db
SECRET_KEY=bebas-isi-apa-saja-untuk-lokal
```

Sisanya (`FRONTEND_URL`, `UPLOAD_DIR`, dll.) sudah ada default yang benar di `.env.example`.

### Seed Data Awal

```bash
# Seed jenis layanan (wajib)
python seed_services.py

# Seed akun demo — hanya untuk development
python seed_demo.py
```

Akun demo setelah `seed_demo.py` (7 akun):

| Role | Email | Password |
|------|-------|----------|
| `mahasiswa` | `alif.maulana@apps.ipb.ac.id` | `mahasiswa123` |
| `mahasiswa` | `siti.rahmawati@apps.ipb.ac.id` | `mahasiswa123` |
| `mahasiswa` | `budi.santoso@apps.ipb.ac.id` | `mahasiswa123` |
| `staff_departemen` | `ridwan.tu.ilkom@apps.ipb.ac.id` | `admin123` |
| `staff_departemen` | `herman.tu.ilkom@apps.ipb.ac.id` | `admin123` |
| `staff_fakultas` | `sri.wahyuni.fmipa@apps.ipb.ac.id` | `admin123` |
| `staff_ipb` | `admin.dap@apps.ipb.ac.id` | `admin123` |

### Frontend

```bash
cd frontend
npm install
npm run dev   # buka http://localhost:5173
```

Frontend otomatis konek ke `http://localhost:8000` jika `VITE_API_URL` tidak di-set.

---

## Environment Variables

### Backend (`.env` / Railway)

| Variable | Wajib | Default | Keterangan |
|----------|-------|---------|------------|
| `DATABASE_URL` | Ya | — | Connection string PostgreSQL |
| `SECRET_KEY` | Ya | — | JWT signing key — **harus kuat di production** |
| `ALGORITHM` | Tidak | `HS256` | Algoritma JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tidak | `1440` | Masa berlaku token (menit) |
| `FRONTEND_URL` | Ya | `http://localhost:5173` | URL frontend — dipakai untuk CORS dan link email |
| `UPLOAD_DIR` | Tidak | `uploads` | Path penyimpanan file upload |
| `MAIL_USERNAME` | Tidak | — | Email SMTP (kosong = notifikasi dinonaktifkan) |
| `MAIL_PASSWORD` | Tidak | — | App password Gmail |
| `MAIL_FROM` | Tidak | `noreply@iash.ipb.ac.id` | Alamat pengirim email |
| `MAIL_SERVER` | Tidak | `smtp.gmail.com` | SMTP server |
| `MAIL_PORT` | Tidak | `587` | SMTP port |

### Frontend (`.env.local` / Vercel)

| Variable | Wajib | Keterangan |
|----------|-------|------------|
| `VITE_API_URL` | Ya (production) | URL backend Railway, misal `https://iash-backend.railway.app` |

---

## Deploy ke Production

### Persiapan SECRET_KEY

Generate key yang kuat:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Gunakan output-nya sebagai nilai `SECRET_KEY` di Railway.

### Railway (Backend + Database)

1. Buat project baru di Railway
2. Tambah service **PostgreSQL** — salin `DATABASE_URL` yang dihasilkan
3. Tambah service **dari GitHub repo**, root directory: `backend/`
4. Set environment variables:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   SECRET_KEY=<hasil generate di atas>
   FRONTEND_URL=https://<nama-app>.vercel.app   # tanpa trailing slash
   UPLOAD_DIR=/tmp/uploads
   # Email opsional — kosongkan MAIL_USERNAME untuk menonaktifkan:
   MAIL_USERNAME=<gmail>
   MAIL_PASSWORD=<app-password>
   ```
   > Start command terbaca otomatis dari `Procfile`. **Jangan** set variabel `PORT` — Railway meng-inject `$PORT` sendiri.
5. Penyimpanan file: lihat [File Storage](#file-storage) untuk pilihan ephemeral (`/tmp/uploads`) vs persistent (volume).
6. Setelah deploy, jalankan seed:
   ```bash
   python seed_services.py
   ```
   > Jangan jalankan `seed_demo.py` di production.

### Vercel (Frontend)

1. Import repo GitHub, set root directory ke `frontend/`
2. Build command: `npm run build`
3. Set environment variable:
   ```
   VITE_API_URL=https://<nama-backend>.railway.app
   ```
4. Deploy

### CORS

Cukup set `FRONTEND_URL` (tanpa trailing slash) di env vars Railway — tidak perlu edit kode. Backend hanya mengizinkan origin tersebut + `localhost` untuk dev.

---

## File Storage

Filesystem Railway bersifat **ephemeral** — file upload (PDF berkas syarat & hasil) hilang saat redeploy/restart, sedangkan **data di PostgreSQL tetap aman** (tersimpan di service database terpisah).

- **Free tier / demo:** set `UPLOAD_DIR=/tmp/uploads`. File bersifat sementara — cukup untuk satu sesi demo (alur upload → download tetap berjalan).
- **Persistent (paid):** tambah **Volume** di service backend dengan mount path `/app/uploads`, lalu set `UPLOAD_DIR=/app/uploads`. File bertahan melewati redeploy.

Untuk produksi sungguhan, opsi yang lebih ideal adalah object storage (S3-compatible / Railway Storage Bucket) dengan database menyimpan path/URL file.

---

## API Endpoints

Dokumentasi interaktif tersedia di `http://localhost:8000/docs` (Swagger UI).

| Method | Endpoint | Auth | Keterangan |
|--------|----------|------|------------|
| POST | `/api/auth/login` | — | Login, terima JWT |
| GET | `/api/auth/me` | User | Info user yang login |
| POST | `/api/tickets` | User | Ajukan tiket baru |
| GET | `/api/tickets/my` | User | Daftar tiket milik sendiri |
| GET | `/api/tickets` | Staff | Semua tiket (untuk dashboard staff) |
| POST | `/api/tickets/claim` | Staff | Ambil tiket berikutnya (FIFO, sesuai level) |
| POST | `/api/tickets/{id}/claim` | Staff | Klaim tiket spesifik |
| PATCH | `/api/tickets/{id}/approve` | Staff | Setujui tiket → Dalam Pembuatan |
| PATCH | `/api/tickets/{id}/reject` | Staff | Tolak tiket |
| PATCH | `/api/tickets/{id}/complete` | Staff | Upload dokumen hasil → Selesai |
| GET | `/api/tickets/{id}/download` | User | Unduh dokumen hasil |
| GET | `/api/tickets/{id}/download-syarat` | Staff | Unduh berkas syarat mahasiswa |
| GET | `/api/services` | User | Daftar jenis layanan |
| GET | `/api/admin/users` | `staff_ipb` | Daftar semua user |
| POST | `/api/admin/users` | `staff_ipb` | Buat akun baru |
| PATCH | `/api/admin/users/{id}/deactivate` | `staff_ipb` | Nonaktifkan akun |

---

## Manajemen Akun Tanpa UI Admin

Belum ada dashboard admin di frontend. Pembuatan & penonaktifan akun dilakukan **lewat API** oleh user `staff_ipb` (mis. `admin.dap@apps.ipb.ac.id`) — cocok untuk developer mengelola akun setelah deploy tanpa perlu halaman admin.

```bash
# 1. Login sebagai staff_ipb untuk dapat token
TOKEN=$(curl -s -X POST https://<backend>/api/auth/login \
  -d "username=admin.dap@apps.ipb.ac.id&password=<password>" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2. Buat akun baru (role: mahasiswa | staff_departemen | staff_fakultas | staff_ipb)
curl -X POST https://<backend>/api/admin/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"baru@apps.ipb.ac.id","password":"rahasia123","nama":"Nama Lengkap","nim_nip":"G64xxxxxx","role":"mahasiswa"}'

# 3. Nonaktifkan akun
curl -X PATCH https://<backend>/api/admin/users/<user_id>/deactivate -H "Authorization: Bearer $TOKEN"
```

> Atau pakai Swagger UI di `/docs` (klik **Authorize**, tempel token). Akun `staff_ipb` pertama dibuat lewat `seed_demo.py`.

📘 **Panduan operasional lengkap** (kelola akun & layanan, akses DB, update FE/BE, checklist deploy): lihat [`OPERATIONS.md`](./OPERATIONS.md).

---

## Roadmap / Pengembangan Selanjutnya

Penguatan dan fitur yang direncanakan untuk iterasi berikutnya, beserta pertimbangan desainnya:

| Isu | Dampak | Catatan |
|-----|--------|---------|
| Tidak ada database migration (Alembic) | Perubahan schema butuh intervensi manual | `create_all` sudah cukup untuk first deploy; perlu Alembic jika schema berubah di versi berikutnya |
| Token tidak bisa direvoke (no blacklist) | Logout hanya hapus dari localStorage; token tetap valid sampai expired | Butuh Redis atau tabel DB tambahan — tidak proporsional untuk skala ini |
| Tidak ada MFA | Staff bisa dicompromise dengan credential saja | Implementasi butuh library authenticator atau email OTP |
| Account lockout tidak ada | Brute force per akun bisa melewati rate limit (via VPN/proxy) | Rate limiting per IP sudah ada via slowapi |
| Password strength tidak divalidasi | Password lemah bisa dipakai saat admin membuat akun | Perlu ditambahkan `@field_validator` di `CreateUserRequest` (`admin_routes.py`) — registrasi mandiri tidak tersedia, akun hanya dibuat oleh `staff_ipb` |
| Upload hanya 1 file | Mahasiswa harus merge semua dokumen sebelum upload | Schema DB `file_syarat_path` singular; multiple file butuh migrasi schema |
| Tidak ada CSP header | Risiko XSS dari script injection | Perlu ditambahkan setelah URL asset Vercel diketahui |
| Token di localStorage | Rentan XSS theft | Tradeoff vs UX (sessionStorage tidak persisten antar tab) |
| Email download link ke `/history` | User harus login manual untuk unduh | Direct download link tidak bisa karena butuh Bearer token |

---

## Commands Ringkas

```bash
# Backend
uvicorn main:app --reload          # dev server
python seed_services.py            # seed layanan (production-safe)
python seed_demo.py                # seed akun demo (dev only)

# Frontend
npm run dev                        # dev server
npm run build                      # production build + type check
npm run lint                       # ESLint
```
