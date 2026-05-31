# OPERATIONS — Panduan Operasional IASH

Panduan praktis: **apa yang bisa diubah tanpa deploy ulang**, **apa yang butuh deploy ulang**, dan **langkah detail** tiap operasi (kelola akun, kelola layanan, akses DB, update FE/BE).

> Ringkasan cepat:
> - **Frontend** di-serve sebagai build statis di Vercel → setiap perubahan tampilan/logika **butuh rebuild + redeploy**.
> - **Backend (kode)** di Railway → perubahan logika/route/validasi **butuh redeploy**.
> - **Data** (akun & layanan = baris di PostgreSQL) → bisa diubah **tanpa redeploy** (lewat API admin atau DB langsung).

---

## 0. Bisa vs Butuh Redeploy — Tabel Ringkas

| Operasi | Tanpa redeploy? | Cara |
|---------|:---:|------|
| Buat / nonaktifkan **akun** | ✅ | API `POST`/`PATCH /api/admin/users` (token `staff_ipb`) — [bagian C](#c-manajemen-akun-tanpa-ui-admin) |
| **Tambah** jenis layanan | ✅ | `seed_services.py` di Railway, atau `INSERT` SQL — [bagian D](#d-manajemen-layanan-service_types) |
| **Edit / hapus** jenis layanan | ✅ (via DB) | `UPDATE`/`DELETE` SQL langsung — [bagian D](#d-manajemen-layanan-service_types) (tidak ada endpoint) |
| Ubah data apa pun (tiket, user, layanan) | ✅ (via DB) | Konsol PostgreSQL Railway — [bagian E](#e-akses-database-langsung) |
| Pakai aplikasi (submit, claim, approve, complete, download) | ✅ | Lewat UI / API biasa |
| Ubah **tampilan / perilaku frontend** | ❌ | Rebuild + redeploy Vercel — [bagian A](#a-update-frontend) |
| Ubah **logika / route / validasi backend** | ❌ | Redeploy Railway — [bagian B](#b-update-backend) |
| Ubah **skema tabel** (kolom baru, dll.) | ❌ | Belum ada Alembic → intervensi manual ([Keterbatasan di README](./README.md)) |

---

## A. Update Frontend

### Lokal (development)
```bash
cd frontend
npm run dev        # http://localhost:5173
```
Vite memakai **HMR** — begitu file disimpan, browser **langsung update tanpa reload manual**. Tidak perlu build.

### Production (Vercel)
Situs live menyajikan hasil `npm run build` (folder `dist/`). Edit di laptop **tidak** mengubah situs live. Untuk update:
1. Commit & **push ke GitHub** → Vercel otomatis build & deploy ulang.
   _(atau manual: `npm run build` lalu `vercel --prod`)_
2. Pastikan env var di Vercel benar:
   - `VITE_API_URL=https://<backend>.railway.app`
3. Cek hasil build dulu sebelum deploy: `npm run build` harus lulus (tsc + vite).

---

## B. Update Backend

### Lokal (development)
```bash
cd backend
source venv/bin/activate          # Windows: venv\Scripts\activate
uvicorn main:app --reload --port 8000
```
Flag `--reload` me-restart server otomatis tiap file `.py` berubah. Swagger: `http://localhost:8000/docs`.

### Production (Railway)
Perubahan **kode** (route/service/repository/model/validasi) butuh redeploy:
1. Commit & **push ke GitHub** → Railway rebuild & deploy ulang otomatis.
2. Pastikan env var Railway lengkap (lihat [README](./README.md) bagian Environment Variables): `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL`, `UPLOAD_DIR=/app/uploads`, dst.

---

## C. Manajemen Akun (tanpa UI admin)

Belum ada dashboard admin di frontend. Akun dibuat/dinonaktifkan **lewat API** oleh user role `staff_ipb` (mis. `admin.dap@apps.ipb.ac.id`). Cocok untuk developer mengelola akun setelah deploy.

Endpoint (semua butuh token `staff_ipb`):

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| `GET` | `/api/admin/users` | Daftar semua user |
| `POST` | `/api/admin/users` | Buat akun baru |
| `PATCH` | `/api/admin/users/{user_id}/deactivate` | Nonaktifkan akun |

Role valid: `mahasiswa` · `staff_departemen` · `staff_fakultas` · `staff_ipb`.

### Lewat curl
```bash
BASE=https://<backend>.railway.app      # lokal: http://localhost:8000

# 1) Login staff_ipb → ambil token
TOKEN=$(curl -s -X POST $BASE/api/auth/login \
  -d "username=admin.dap@apps.ipb.ac.id&password=<password>" \
  | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")

# 2) Buat akun baru
curl -X POST $BASE/api/admin/users \
  -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"email":"baru@apps.ipb.ac.id","password":"rahasia123","nama":"Nama Lengkap","nim_nip":"G64xxxxxx","role":"mahasiswa"}'

# 3) Lihat semua user
curl $BASE/api/admin/users -H "Authorization: Bearer $TOKEN"

# 4) Nonaktifkan akun (akun nonaktif tidak bisa login → 403)
curl -X PATCH $BASE/api/admin/users/<user_id>/deactivate -H "Authorization: Bearer $TOKEN"
```

Respons error yang mungkin: `409` email sudah terdaftar, `400` role tidak valid, `403` token bukan `staff_ipb`.

### Lewat Swagger UI
Buka `$BASE/docs` → klik **Authorize** → tempel `access_token` → jalankan endpoint `admin`.

### Lewat seed (akun massal)
Untuk menambah banyak akun sekaligus: edit `DEMO_USERS` di `backend/seed_demo.py`, lalu jalankan `python seed_demo.py` di Railway (idempotent — skip yang sudah ada). Akun `staff_ipb` pertama dibuat dari sini.

---

## D. Manajemen Layanan (`service_types`)

Layanan adalah **data** di tabel `service_types`. Kolom:

| Kolom | Keterangan |
|-------|-----------|
| `nama` | Nama layanan (unik secara praktik — seed memakai nama sebagai kunci skip) |
| `deskripsi` | Teks deskripsi (boleh kosong) |
| `level` | `departemen` \| `fakultas` \| `ipb` — menentukan staff mana yang menanganinya |
| `berkas_dibutuhkan` | **JSON string** berisi array, mis. `'["KTM aktif","Scan KRS"]'` |

> Catatan level: staff hanya menangani tiket yang `service_type.level`-nya cocok dengan rolenya (`staff_fakultas` → `fakultas`, `staff_ipb` → `ipb`). Katalog `seed_services.py` saat ini hanya berisi `fakultas` & `ipb`; akun `staff_departemen` belum punya layanan.

### Tambah layanan baru — ✅ tanpa redeploy
**Opsi 1 — lewat seed (disarankan, terlacak di git):**
1. Edit `backend/seed_services.py`, tambah entry ke list `SERVICES`.
2. Jalankan di Railway shell: `python seed_services.py` (idempotent — hanya menambah yang belum ada).

**Opsi 2 — INSERT SQL langsung** (lihat [bagian E](#e-akses-database-langsung)):
```sql
INSERT INTO service_types (id, nama, deskripsi, level, berkas_dibutuhkan)
VALUES (gen_random_uuid(),
        'Surat Keterangan Aktif (Departemen)',
        'Diproses oleh TU Departemen.',
        'departemen',
        '["KTM aktif","Scan KRS semester berjalan"]');
```

### Edit / hapus layanan — ✅ tapi HANYA via DB langsung
`seed_services.py` **tidak** meng-update baris yang sudah ada (dia skip kalau nama sudah ada), dan **tidak ada endpoint** CRUD layanan. Jadi:
```sql
-- Ubah level / deskripsi
UPDATE service_types SET level = 'departemen'
WHERE nama = 'Surat Keterangan Mahasiswa Aktif';

-- Ubah berkas yang dibutuhkan (tetap JSON string)
UPDATE service_types SET berkas_dibutuhkan = '["KTM aktif","Bukti UKT"]'
WHERE nama = 'Surat Cuti Mahasiswa';

-- Hapus layanan (pastikan tidak ada tiket yang memakainya, atau hapus tiketnya dulu)
DELETE FROM service_types WHERE nama = 'Nama Layanan Lama';
```
> ⚠️ Menghapus layanan yang masih dipakai tiket akan melanggar foreign key. Hapus/relokasi tiket terkait dulu.

---

## E. Akses Database Langsung

Railway menyediakan koneksi PostgreSQL (tab **Variables** → `DATABASE_URL`, atau tab **Data**/**Connect**).

```bash
# psql langsung ke DB produksi
psql "<DATABASE_URL dari Railway>"

# contoh query cepat
\dt                                   -- lihat tabel
SELECT email, role, is_active FROM users ORDER BY created_at DESC;
SELECT nama, level FROM service_types ORDER BY level, nama;
SELECT status, count(*) FROM tickets GROUP BY status;
```
Lokal:
```bash
psql "postgresql://<user>:<password>@localhost:5432/iash_db"
```

---

## F. Seed Data Awal (deploy baru)

```bash
cd backend
python seed_services.py     # WAJIB — katalog layanan (production-safe, idempotent)
python seed_demo.py         # HANYA dev/staging — 7 akun demo (jangan di production dgn password ini)
```
Tabel dibuat otomatis saat startup (`Base.metadata.create_all`). Kedua seed idempotent (skip data yang sudah ada).

Reset bersih lokal (hati-hati, menghapus semua data):
```bash
python -c "from app.database import engine, Base; from app.models import User, ServiceType, Ticket; Base.metadata.drop_all(bind=engine)"
python seed_services.py && python seed_demo.py
```

---

## G. File Upload (Persistent Volume)

Railway memakai **ephemeral filesystem** — file PDF (berkas syarat & hasil) **hilang tiap redeploy** tanpa volume permanen.
1. Railway → service backend → tab **Volumes** → mount path `/app/uploads`.
2. Set env `UPLOAD_DIR=/app/uploads`.

Tanpa ini, dokumen yang sudah diupload tidak bertahan melewati restart.

---

## H. Checklist Persiapan Deploy

- [ ] `SECRET_KEY` kuat di Railway: `python3 -c "import secrets; print(secrets.token_urlsafe(32))"`
- [ ] `DATABASE_URL` mengarah ke PostgreSQL Railway
- [ ] `FRONTEND_URL` = URL Vercel (untuk CORS + link email)
- [ ] `UPLOAD_DIR=/app/uploads` + Persistent Volume aktif
- [ ] (Opsional) `MAIL_USERNAME`/`MAIL_PASSWORD` diisi untuk notifikasi email; **kosongkan** kalau tidak dipakai (app tetap jalan)
- [ ] Vercel: `VITE_API_URL` = URL backend Railway
- [ ] Jalankan `python seed_services.py` di Railway (jangan `seed_demo.py` di production)
- [ ] `npm run build` (frontend) & backend start tanpa error
