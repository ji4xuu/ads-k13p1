# Backend Documentation

Dokumentasi lengkap struktur, kegunaan, dan dependency setiap file di `backend/`.

---

## Directory Structure

```
backend/
├── main.py                         # Entry point FastAPI — app setup, middleware, router
├── requirements.txt                # Daftar dependency Python
├── .env                            # Environment variables (tidak di-commit)
├── .env.example                    # Template env vars
├── seed_demo.py                    # Seed akun demo (mahasiswa + staff)
├── seed_services.py                # Seed jenis layanan akademik
├── uploads/                        # File upload (berkas syarat & hasil)
│   ├── berkas_syarat/              # File yang diupload mahasiswa saat submit
│   └── berkas_hasil/               # File dokumen hasil yang diupload staff
│
└── app/
    ├── config.py                   # Settings dari environment variables
    ├── database.py                 # Koneksi database, session factory, Base ORM
    ├── dependencies.py             # FastAPI dependency injection (auth, role guard)
    ├── limiter.py                  # Rate limiter (anti-spam)
    ├── logger.py                   # Structured logging (security + audit)
    │
    ├── models/                     # ORM models — definisi tabel database
    │   ├── user_model.py
    │   ├── ticket_model.py
    │   └── service_type_model.py
    │
    ├── schemas/                    # Pydantic schemas — validasi request & shape response
    │   ├── auth_schema.py
    │   ├── user_schema.py
    │   ├── ticket_schema.py
    │   └── service_schema.py
    │
    ├── repositories/               # Data access layer — satu-satunya yang boleh query DB
    │   ├── user_repository.py
    │   ├── ticket_repository.py
    │   └── service_repository.py
    │
    ├── services/                   # Business logic layer
    │   ├── auth_service.py
    │   ├── ticket_service.py
    │   ├── service_service.py
    │   ├── admin_service.py
    │   └── notification_service.py
    │
    └── routes/                     # HTTP endpoints — terima request, return response
        ├── auth_routes.py
        ├── ticket_routes.py
        ├── service_routes.py
        └── admin_routes.py
```

---

## Aturan Arsitektur (Wajib dari Dosen)

```
Request → Route → Service → Repository → ORM Model → Database
                  (logic)   (data access)  (schema only)
```

- **Routes** — entry point saja. Terima request, panggil service, return response. Tidak ada `if`, tidak ada logika bisnis.
- **Services** — semua keputusan bisnis ada di sini (boleh tidak? valid tidak? transisi status boleh tidak?).
- **Repositories** — satu-satunya layer yang boleh sentuh `Session` database. Tidak ada logika.
- **ORM Models** — definisi kolom dan relasi saja. Tidak ada method bisnis.
- **Schemas** — bentuk data yang masuk dan keluar API. Dipakai di route, bukan di service/repo.
- **OOP wajib** — semua service dan repository adalah class.

---

## Alur Request (Gambaran Besar)

```
Browser kirim request
        ↓
main.py — middleware (CORS, security headers, rate limit)
        ↓
routes/*.py — validasi schema input (Pydantic otomatis)
        ↓
dependencies.py — cek token JWT, tentukan siapa yang request
        ↓
services/*.py — jalankan logika bisnis
        ↓
repositories/*.py — query database
        ↓
models/*.py — ORM model ↔ tabel PostgreSQL
        ↓
response dikembalikan ke browser (schema Pydantic → JSON)
```

---

## Core Files

### `main.py`
**Kegunaan:** Entry point seluruh aplikasi FastAPI. Tempat app dibuat, middleware dipasang, dan semua router didaftarkan.

**Yang dilakukan:**
- Buat instance `FastAPI` dengan title dan versi
- Auto-create semua tabel saat startup: `Base.metadata.create_all(bind=engine)`
- Pasang middleware CORS — hanya izinkan request dari `localhost:5173` dan `FRONTEND_URL`
- Pasang middleware security headers (`X-Content-Type-Options`, `X-Frame-Options`, dll.)
- Pasang rate limiter dan global exception handler (cegah stack trace bocor ke client)
- Register router: `auth_routes`, `service_routes`, `ticket_routes`, `admin_routes`
- Health check endpoint: `GET /` → `{"status": "ok"}`

**Imports dari:**
- `app.database` — engine, Base
- `app.routes` — auth_routes, service_routes, ticket_routes
- `app.limiter` — limiter
- `app.config` — settings

---

### `app/config.py`
**Kegunaan:** Baca semua environment variables dari file `.env` menggunakan Pydantic Settings. Satu-satunya tempat konfigurasi dibaca.

**Variables:**

| Variable | Default | Keterangan |
|----------|---------|-----------|
| `DATABASE_URL` | — | Wajib diisi |
| `SECRET_KEY` | — | Wajib diisi, untuk JWT |
| `ALGORITHM` | `"HS256"` | Algoritma JWT |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `1440` | 24 jam |
| `MAIL_USERNAME` | `""` | Kosong = email disabled |
| `MAIL_PASSWORD` | `""` | |
| `MAIL_FROM` | `noreply@iash.ipb.ac.id` | |
| `MAIL_SERVER` | `smtp.gmail.com` | |
| `MAIL_PORT` | `587` | |
| `UPLOAD_DIR` | `"uploads"` | Folder penyimpanan file |
| `FRONTEND_URL` | `http://localhost:5173` | Untuk CORS + link email |

**Dipakai oleh:** `database.py`, `services/auth_service.py`, `services/ticket_service.py`, `services/notification_service.py`, `main.py`

---

### `app/database.py`
**Kegunaan:** Setup koneksi database SQLAlchemy. Menyediakan tiga hal yang dipakai di seluruh app:

- `engine` — koneksi ke PostgreSQL
- `SessionLocal` — factory untuk membuat sesi database baru
- `Base` — class induk semua ORM model
- `get_db()` — dependency FastAPI yang membuka sesi per request dan menutupnya setelah selesai

**Pola `get_db()`:**
```python
def get_db():
    db = SessionLocal()
    try:
        yield db       # sesi dipakai di route handler
    finally:
        db.close()     # pasti ditutup walau ada error
```

**Dipakai oleh:** `dependencies.py`, semua repository, semua route

---

### `app/dependencies.py`
**Kegunaan:** FastAPI dependency untuk autentikasi dan otorisasi. Dipasang di route sebagai parameter — FastAPI otomatis menjalankannya sebelum handler.

**Empat dependency:**

| Dependency | Fungsi | Error jika |
|-----------|--------|-----------|
| `get_current_user` | Baca token JWT dari header, return `User` | Token tidak valid → 401 |
| `require_staff` | Pastikan user adalah staff (role apapun kecuali mahasiswa) | User adalah mahasiswa → 403 |
| `require_mahasiswa` | Pastikan user adalah mahasiswa | User adalah staff → 403 |
| `require_ipb_staff` | Pastikan user adalah `staff_ipb` — untuk endpoint admin sistem | Role bukan staff_ipb → 403 |

**Cara pakai di route:**
```python
def all_tickets(current_user: User = Depends(require_staff)):
    # hanya staff yang sampai sini
```

**Dipakai oleh:** Semua route yang butuh auth

---

### `app/limiter.py`
**Kegunaan:** Konfigurasi rate limiter berbasis IP menggunakan SlowAPI. Dibuat sekali di sini, dipasang di `main.py`, dipakai di route dengan decorator.

**Contoh pemakaian di route:**
```python
@limiter.limit("10/minute")  # maksimal 10 request per menit per IP
def login(...):
```

**Dipakai oleh:** `main.py` (setup), `routes/auth_routes.py` (endpoint login)

---

### `app/logger.py`
**Kegunaan:** Setup dua structured logger untuk mencatat event penting ke stdout.

| Logger | Nama | Dipakai untuk |
|--------|------|--------------|
| `security_logger` | `iash.security` | Login gagal, akses ditolak, token invalid |
| `audit_logger` | `iash.audit` | Ticket diklaim, disetujui, ditolak, selesai |

Format log: `2024-01-01 10:00:00 [INFO] iash.audit — TICKET_APPROVED ticket_id=... staff=...`

**Dipakai oleh:** `services/auth_service.py`, `services/ticket_service.py`

---

## Models

Model hanya berisi definisi kolom dan relasi. Tidak ada method bisnis.

### `models/user_model.py` — tabel `users`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `email` | String(255) | Unique, indexed |
| `password_hash` | String(255) | Bcrypt hash |
| `nama` | String(255) | |
| `nim_nip` | String(50) | |
| `role` | Enum | `mahasiswa` / `staff_departemen` / `staff_fakultas` / `staff_ipb` |
| `is_active` | Boolean | Default True |
| `created_at` | DateTime | |

**Relasi:**
- `submitted_tickets` → tiket yang disubmit user ini (sebagai mahasiswa)
- `assigned_tickets` → tiket yang ditangani user ini (sebagai staff)

---

### `models/ticket_model.py` — tabel `tickets`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `mahasiswa_id` | UUID | FK → users.id |
| `service_type_id` | UUID | FK → service_types.id |
| `status` | Enum | Lihat lifecycle di bawah |
| `purpose` | Text | Keperluan/alasan pengajuan |
| `file_syarat_path` | String | Path relatif file syarat mahasiswa |
| `assigned_to` | UUID | FK → users.id, NULL = belum diklaim |
| `catatan_tu` | Text | Catatan dari staff |
| `file_hasil_path` | String | Path relatif dokumen hasil |
| `created_at` | DateTime | |
| `updated_at` | DateTime | Auto-update |

**Status lifecycle:**
```
dalam_antrean → diproses → dalam_pembuatan → selesai
                         ↘ ditolak
```

---

### `models/service_type_model.py` — tabel `service_types`

| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | UUID | Primary key |
| `nama` | String(255) | Nama layanan |
| `deskripsi` | Text | Deskripsi layanan, nullable |
| `level` | Enum | `departemen` / `fakultas` / `ipb` |
| `berkas_dibutuhkan` | Text | JSON string — daftar berkas yang dibutuhkan |

---

## Schemas

Schema adalah "kontrak" data antara client dan server. Pydantic otomatis validasi saat request masuk dan serialisasi saat response keluar.

### `schemas/auth_schema.py`

| Schema | Arah | Isi |
|--------|------|-----|
| `LoginRequest` | Request | email, password |
| `TokenResponse` | Response | access_token, token_type="bearer" |
| `TokenData` | Internal | user_id (payload JWT) |

---

### `schemas/user_schema.py`

| Schema | Arah | Isi |
|--------|------|-----|
| `UserResponse` | Response | id, email, nama, nim_nip, role, is_active, created_at |

---

### `schemas/ticket_schema.py`

| Schema | Arah | Isi |
|--------|------|-----|
| `TicketRejectRequest` | Request | catatan_tu (wajib, min 10 karakter) |
| `TicketApproveRequest` | Request | catatan_tu (opsional) |
| `TicketResponse` | Response | id, status, purpose, file paths, catatan_tu, created_at, updated_at + nested: mahasiswa (UserResponse), service_type (ServiceTypeResponse), assigned_staff (UserResponse\|null) |

---

### `schemas/service_schema.py`

| Schema | Arah | Isi |
|--------|------|-----|
| `ServiceTypeResponse` | Response | id, nama, deskripsi, level, berkas_dibutuhkan (list[str] — di-parse dari JSON string di DB) |

---

## Repositories

Satu-satunya layer yang boleh query database. Tidak ada logika bisnis.

### `repositories/user_repository.py`

| Method | Fungsi |
|--------|--------|
| `get_by_id(user_id)` | Ambil user by UUID |
| `get_by_email(email)` | Ambil user by email |
| `create(email, password_hash, nama, nim_nip, role)` | Buat user baru |
| `list_all()` | Semua user, urut terbaru |
| `deactivate(user)` | Set `is_active = False` |

**Dipakai oleh:** `services/auth_service.py`, `services/admin_service.py`

---

### `repositories/service_repository.py`

| Method | Fungsi |
|--------|--------|
| `get_all()` | Semua service type |
| `get_by_id(service_id)` | Service by UUID |

**Dipakai oleh:** `services/ticket_service.py`

---

### `repositories/ticket_repository.py`

| Method | Fungsi |
|--------|--------|
| `get_by_id(ticket_id)` | Tiket by UUID |
| `get_by_mahasiswa(mahasiswa_id)` | Semua tiket milik mahasiswa, urut terbaru |
| `get_all(status_filter?)` | Semua tiket, optional filter status |
| `create(...)` | Buat tiket baru, status `dalam_antrean` |
| `has_active_ticket(staff_id)` | Cek apakah staff sedang pegang tiket aktif |
| `claim_specific(ticket, staff_id)` | Klaim tiket tertentu, set status `diproses` |
| `claim_next(staff_id, staff_level)` | Klaim tiket berikutnya di antrian (FIFO). Pakai `SELECT FOR UPDATE SKIP LOCKED` untuk hindari race condition kalau ada dua staff klaim bersamaan |
| `update_status(ticket, status, catatan?)` | Update status + catatan TU |
| `set_file_hasil(ticket, file_path)` | Simpan path dokumen hasil |
| `count_in_queue_by_level(staff_level)` | Hitung tiket pending per level |

**Dipakai oleh:** `services/ticket_service.py`

---

## Services

Semua logika bisnis ada di sini.

### `services/auth_service.py`

| Method | Fungsi |
|--------|--------|
| `login(email, password)` | Verifikasi kredensial, buat JWT token |
| `get_user_from_token(token)` | Decode JWT, ambil user dari DB |
| `_create_token(user_id)` | (private) Buat JWT token dengan expiry |

**Imports dari:** `repositories/user_repository.py`, `app/logger.py`

---

### `services/service_service.py`

| Method | Fungsi |
|--------|--------|
| `list_services()` | Daftar semua jenis layanan (memanggil `ServiceRepository`) |

Dipakai oleh `routes/service_routes.py` — route tidak memanggil repository langsung agar layering tetap `Route → Service → Repository`.

**Imports dari:** `repositories/service_repository.py`

---

### `services/admin_service.py`

| Method | Fungsi |
|--------|--------|
| `list_users()` | Daftar semua user |
| `create_user(email, password, nama, nim_nip, role)` | Validasi role valid + email belum ada, buat user baru |
| `deactivate_user(user_id)` | Nonaktifkan akun — validasi user ada dan masih aktif |

Hanya bisa diakses oleh `staff_ipb` via `require_ipb_staff` dependency.

**Imports dari:** `repositories/user_repository.py`

---

### `services/ticket_service.py`

| Method | Fungsi |
|--------|--------|
| `submit(mahasiswa, service_type_id, purpose, file)` | Validasi service ada, simpan file PDF, buat tiket, kirim notifikasi |
| `claim_specific(staff, ticket_id)` | Validasi status `dalam_antrean`, cocokkan level staff dengan level layanan, klaim tiket |
| `claim_next(staff)` | Klaim tiket berikutnya di antrian sesuai level staff |
| `approve(staff, ticket_id, catatan?)` | Validasi transisi status, update ke `dalam_pembuatan` |
| `reject(staff, ticket_id, catatan)` | Validasi transisi status, update ke `ditolak` |
| `complete(staff, ticket_id, file, catatan?)` | Upload dokumen hasil, update ke `selesai`, kirim notifikasi |
| `get_ticket_detail(requester, ticket_id)` | Ambil detail tiket — mahasiswa hanya boleh lihat miliknya sendiri |
| `get_my_tickets(mahasiswa)` | Semua tiket milik mahasiswa |
| `get_all_tickets(staff, status_filter?)` | Semua tiket (hanya staff) |

**Validasi transisi status** — dikelola via `_VALID_TRANSITIONS`:
```python
{
  "dalam_antrean": ["diproses"],
  "diproses": ["dalam_pembuatan", "ditolak"],
  "dalam_pembuatan": ["selesai"],
  "ditolak": [],
  "selesai": [],
}
```

**Level matching staff:**
```python
{
  "staff_departemen": "departemen",
  "staff_fakultas": "fakultas",
  "staff_ipb": "ipb",
}
```

**Imports dari:** `repositories/ticket_repository.py`, `repositories/service_repository.py`, `services/notification_service.py`, `app/logger.py`, `app/config.py`

---

### `services/notification_service.py`
**Kegunaan:** Kirim email HTML ke mahasiswa di setiap perubahan status tiket. Jika `MAIL_USERNAME` kosong, semua notifikasi di-skip tanpa error — app tetap berjalan normal.

| Method | Trigger |
|--------|---------|
| `notify_submitted(ticket)` | Tiket baru disubmit |
| `notify_claimed(ticket)` | Tiket diklaim staff |
| `notify_approved(ticket)` | Tiket disetujui |
| `notify_rejected(ticket)` | Tiket ditolak |
| `notify_completed(ticket, frontend_url)` | Dokumen selesai, sertakan link download |

**Dipakai oleh:** `services/ticket_service.py`

---

## Routes

Entry point HTTP. Tidak ada logika — cukup terima request, panggil service, return response.

### `routes/auth_routes.py` — prefix `/api/auth`

| Method | Path | Auth | Fungsi |
|--------|------|------|--------|
| POST | `/login` | — | Login, return JWT token. Rate limited 10/menit |
| GET | `/me` | ✓ | Data user yang sedang login |

---

### `routes/service_routes.py` — prefix `/api/services`

| Method | Path | Auth | Fungsi |
|--------|------|------|--------|
| GET | `` | ✓ | Daftar semua jenis layanan |

---

### `routes/ticket_routes.py` — prefix `/api/tickets`

| Method | Path | Auth | Role | Fungsi |
|--------|------|------|------|--------|
| POST | `` | ✓ | Semua | Submit tiket baru (form + file opsional) |
| GET | `/my` | ✓ | Semua | Tiket milik user yang login |
| GET | `` | ✓ | Staff | Semua tiket (optional filter status) |
| GET | `/{id}` | ✓ | Semua | Detail tiket (mahasiswa hanya miliknya) |
| POST | `/claim` | ✓ | Staff | Klaim tiket berikutnya di antrian |
| POST | `/{id}/claim` | ✓ | Staff | Klaim tiket tertentu |
| PATCH | `/{id}/approve` | ✓ | Staff | Setujui tiket |
| PATCH | `/{id}/reject` | ✓ | Staff | Tolak tiket |
| PATCH | `/{id}/complete` | ✓ | Staff | Upload dokumen hasil + tandai selesai |
| GET | `/{id}/download-syarat` | ✓ (token param) | Semua | Download berkas syarat |
| GET | `/{id}/download` | ✓ (token param) | Semua | Download dokumen hasil |

**Catatan download:** Token bisa dikirim via header `Authorization` atau query param `?token=` — karena browser tidak bisa set custom header saat buka link download langsung.

**Batas file upload:** Maksimal 10 MB, hanya PDF.

---

### `routes/admin_routes.py` — prefix `/api/admin`

Semua endpoint hanya bisa diakses oleh `staff_ipb`.

| Method | Path | Fungsi |
|--------|------|--------|
| GET | `/users` | Daftar semua user |
| POST | `/users` | Buat akun baru (body: email, password, nama, nim_nip, role) |
| PATCH | `/users/{id}/deactivate` | Nonaktifkan akun |

Gunakan endpoint ini via Postman atau curl untuk manajemen akun setelah deploy.

---

## Seed Scripts

| Script | Fungsi | Kapan dijalankan |
|--------|--------|-----------------|
| `seed_demo.py` | Buat 7 akun demo: 3 mahasiswa, 2 staff_departemen, 1 staff_fakultas, 1 staff_ipb | Development / staging |
| `seed_services.py` | Buat 14 jenis layanan: 6 tingkat fakultas, 8 tingkat IPB | Development + production (idempotent) |

Seed yang dipakai adalah **`seed_services.py` + `seed_demo.py`** (sesuai CLAUDE.md). Keduanya idempotent — aman dijalankan berkali-kali, skip kalau data sudah ada.

**Cara tambah akun baru setelah deploy:** Edit `DEMO_USERS` di `seed_demo.py`, tambahkan entry baru, lalu jalankan `python seed_demo.py`. Atau gunakan endpoint `POST /api/admin/users` dengan token `staff_ipb`.

---

## Dependency Map per Use Case

### Login
```
POST /api/auth/login
  → auth_routes.py (rate limit 10/menit)
  → AuthService(db).login(email, password)
      → UserRepository.get_by_email(email)
      → bcrypt.verify(password, hash)
      → _create_token(user_id) → JWT token
  → return TokenResponse
```

### Submit Tiket Baru
```
POST /api/tickets (form + file)
  → ticket_routes.py
  → Depends(get_current_user) → validasi token
  → TicketService(db).submit(mahasiswa, service_type_id, purpose, file)
      → ServiceRepository.get_by_id(service_type_id)  # validasi layanan ada
      → _save_file(file, "berkas_syarat")               # simpan PDF
      → TicketRepository.create(...)                    # buat tiket
      → NotificationService.notify_submitted(ticket)   # kirim email
  → return TicketResponse
```

### Admin Klaim & Proses Tiket
```
POST /api/tickets/claim
  → ticket_routes.py
  → Depends(require_staff) → validasi token + role
  → TicketService(db).claim_next(staff)
      → petakan role staff ke level layanan
      → TicketRepository.claim_next(staff_id, level)
          → SELECT FOR UPDATE SKIP LOCKED (hindari race condition)
      → NotificationService.notify_claimed(ticket)
  → return TicketResponse

PATCH /api/tickets/{id}/approve
  → TicketService(db).approve(staff, ticket_id, catatan)
      → validasi staff = assigned_to
      → _assert_transition("diproses", "dalam_pembuatan")
      → TicketRepository.update_status(ticket, "dalam_pembuatan")
      → audit_logger.info("TICKET_APPROVED ...")
      → NotificationService.notify_approved(ticket)
  → return TicketResponse
```

### Download File
```
GET /api/tickets/{id}/download?token=<jwt>
  → ticket_routes.py
  → AuthService.get_user_from_token(token)  # token dari query param atau header
  → TicketService.get_ticket_detail(user, ticket_id)  # cek akses
  → _safe_path(UPLOAD_DIR, file_hasil_path)  # cegah path traversal attack
  → return FileResponse
```
