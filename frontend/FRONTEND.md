# Frontend Documentation

Dokumentasi lengkap struktur, kegunaan, dan dependency setiap file di `frontend/src/`.

---

## Directory Structure

```
src/
├── main.tsx                    # Entry point — render App ke DOM
├── App.tsx                     # Router utama, layout, route guard
├── index.css                   # Global style
│
├── api/                        # Semua komunikasi ke backend
│   ├── client.ts               # Axios instance (token, error handling)
│   ├── auth.api.ts             # Login, ambil data user
│   ├── tickets.api.ts          # Semua operasi tiket
│   ├── services.api.ts         # Ambil daftar jenis layanan
│   └── mappers.ts              # Transform response backend → tipe frontend
│
├── context/
│   └── AuthContext.tsx         # State auth global (user, token, login, logout)
│
├── utils/
│   ├── withRouter.tsx          # HOC: inject navigate, location, params
│   └── withAuth.tsx            # HOC: inject auth context
│
├── components/
│   ├── Header.tsx              # Navbar role-aware + mobile menu
│   └── ActionModal.tsx         # Modal approve/reject/complete (admin)
│
└── pages/
    ├── Login.tsx               # Halaman login
    ├── student/
    │   ├── Dashboard.tsx       # Halaman utama mahasiswa
    │   ├── History.tsx         # Riwayat tiket mahasiswa
    │   ├── ApplyTicket.tsx     # Form submit tiket baru
    │   ├── TemplateSurat.tsx   # Halaman unduh template surat self-service
    │   └── FaqPage.tsx         # Halaman FAQ (statis)
    └── admin/
        ├── Queue.tsx           # Antrian tiket (admin)
        └── TicketDetail.tsx    # Detail + aksi tiket (admin)
```

---

## Aturan Arsitektur

- **Semua component adalah class component** — tidak ada functional component. Ini constraint project.
- **Pages** boleh import dari: `api/`, `utils/`, `components/`, `context/`
- **API layer** hanya boleh import dari: `client.ts` dan `mappers.ts`
- **Utils** tidak boleh import dari file project manapun — berdiri sendiri
- **Tidak ada pemanggilan `fetch`/`axios` langsung di pages** — semua lewat `api/`

---

## Core Files

### `main.tsx`
**Kegunaan:** Entry point. Ambil elemen `#root` dari `index.html`, render seluruh app React ke dalamnya.

**Imports dari:**
- `react` — StrictMode
- `react-dom/client` — createRoot
- `./index.css` — global style
- `./App.tsx` — root component

**Dipakai oleh:** Tidak ada (ini titik awal, tidak diimport siapapun)

---

### `App.tsx`
**Kegunaan:** Mendefinisikan seluruh struktur routing aplikasi. Berisi dua class internal:
- `MainLayout` — wrapper semua halaman yang sudah login (pasang Header + background)
- `ProtectedRoute` — guard yang redirect ke `/` kalau belum login, atau redirect ke rute yang benar kalau role salah

**Logika ProtectedRoute:**
```
Belum login → redirect ke "/"
Login sebagai mahasiswa, akses rute staff → redirect ke "/admin-dashboard"
Login sebagai staff, akses rute mahasiswa → redirect ke "/dashboard"
```

**Imports dari:**
- `react-router-dom` — BrowserRouter, Routes, Route, Navigate
- `./context/AuthContext` — AuthProvider, AuthContext
- Semua komponen halaman (Login, Dashboard, dst.)
- `./components/Header`

**Dipakai oleh:** `main.tsx`

---

### `index.css`
**Kegunaan:** Global style. Satu-satunya hal penting: `overflow-y: scroll` — paksa scrollbar selalu muncul supaya layout tidak bergeser saat konten berubah panjang.

---

## API Layer

### `api/client.ts`
**Kegunaan:** Axios instance yang dipakai semua modul API. Mengurus dua hal otomatis:
1. **Token** — setiap request secara otomatis disertai `Authorization: Bearer <token>` dari localStorage
2. **401 handler** — kalau response 401, hapus token dari localStorage dan redirect ke `/`

**Imports dari:**
- `axios`
- `import.meta.env.VITE_API_URL` — URL backend dari environment variable

**Dipakai oleh:** `auth.api.ts`, `tickets.api.ts`, `services.api.ts`

---

### `api/mappers.ts`
**Kegunaan:** Pure utility — transform data dari format backend (snake_case, status bahasa Indonesia singkat) ke format yang dipakai frontend (display-friendly).

**Yang dilakukan:**
- `mapTicket(t)` — konversi ticket backend → ticket frontend (termasuk status display)
- `mapService(s)` — konversi service backend → service frontend
- `STATUS_TO_DISPLAY` — mapping: `"dalam_antrean"` → `"Dalam Antrean"`
- `STATUS_TO_BACKEND` — reverse mapping untuk API call

**Imports dari:** Tidak ada (pure function, tidak bergantung file lain)

**Dipakai oleh:** `tickets.api.ts`, `services.api.ts`

---

### `api/auth.api.ts`
**Kegunaan:** Operasi autentikasi.

**Method:**
- `login(email, password)` — POST `/api/auth/login` (form-urlencoded, OAuth2 format), lalu GET `/api/auth/me` untuk ambil data user. Return `{ token, user }`.
- `me()` — GET `/api/auth/me`, return data user yang sedang login.

**Imports dari:**
- `./client`

**Dipakai oleh:** `context/AuthContext.tsx`

---

### `api/services.api.ts`
**Kegunaan:** Ambil daftar jenis layanan akademik yang tersedia.

**Method:**
- `list()` — GET `/api/services`, return array service yang sudah di-map.

**Imports dari:**
- `./client`
- `./mappers` — mapService

**Dipakai oleh:** `pages/student/ApplyTicket.tsx`

---

### `api/tickets.api.ts`
**Kegunaan:** Semua operasi tiket — submit, lihat, klaim, approve, reject, complete, download.

**Method:**

| Method | HTTP | Endpoint | Dipakai di |
|--------|------|----------|-----------|
| `myTickets()` | GET | `/api/tickets/my` | History.tsx |
| `allTickets(statusFilter?)` | GET | `/api/tickets` | Queue.tsx |
| `getById(id)` | GET | `/api/tickets/:id` | TicketDetail.tsx |
| `submit(serviceTypeId, purpose, file)` | POST | `/api/tickets` | ApplyTicket.tsx |
| `claimNext()` | POST | `/api/tickets/claim` | Queue.tsx |
| `claimSpecific(ticketId)` | POST | `/api/tickets/:id/claim` | TicketDetail.tsx |
| `approve(ticketId, catatan?)` | PATCH | `/api/tickets/:id/approve` | ActionModal.tsx |
| `reject(ticketId, catatan)` | PATCH | `/api/tickets/:id/reject` | ActionModal.tsx |
| `complete(ticketId, file, catatan?)` | PATCH | `/api/tickets/:id/complete` | ActionModal.tsx |
| `downloadFile(ticketId, type)` | GET | `/api/tickets/:id/download[-syarat]` | History.tsx, TicketDetail.tsx |

**Imports dari:**
- `./client`
- `./mappers` — mapTicket, STATUS_TO_BACKEND

---

## Context

### `context/AuthContext.tsx`
**Kegunaan:** Menyimpan state autentikasi secara global — siapapun di app bisa tahu siapa yang sedang login dan bisa panggil logout tanpa perlu kirim data lewat props satu per satu.

**State:**
- `user: User | null` — data user yang login (id, email, nama, nim_nip, role)
- `token: string | null` — JWT token

**Yang tersedia via context:**
- `isAuthenticated: boolean`
- `login(email, password)` — panggil `authApi.login()`, simpan token + user ke localStorage dan state
- `logout()` — hapus localStorage, reset state

**Persistence:** Token dan user disimpan di `localStorage` (`iash_token`, `iash_user`) — tetap ada setelah browser ditutup sampai logout.

**Imports dari:**
- `./api/auth.api`

**Dipakai oleh:** `App.tsx` (via AuthProvider), semua component yang pakai `withAuth`

---

## Utils

### `utils/withRouter.tsx`
**Kegunaan:** HOC yang inject props routing ke class component. Diperlukan karena hooks React Router (`useNavigate`, `useLocation`, dll.) tidak bisa dipakai di class component.

**Props yang diinject:**
- `navigate(path)` — pindah halaman secara programmatic
- `location` — info halaman sekarang (pathname, search, hash)
- `params` — URL parameter (misal `:id` dari `/admin/ticket/:id`)

**Pemakaian:**
```tsx
export default withRouter(MyComponent);
// di dalam component: this.props.navigate('/dashboard')
```

**Dipakai oleh:** Semua halaman yang perlu navigasi

---

### `utils/withAuth.tsx`
**Kegunaan:** HOC yang inject seluruh `AuthContext` ke class component sebagai prop `auth`.

**Props yang diinject:**
- `auth.user` — data user login
- `auth.isAuthenticated`
- `auth.login()`
- `auth.logout()`

**Pemakaian:**
```tsx
export default withAuth(MyComponent);
// di dalam component: this.props.auth.user.nama
```

**Dipakai oleh:** Login.tsx, Dashboard.tsx, Queue.tsx, ApplyTicket.tsx, Header.tsx

---

## Components

### `components/Header.tsx`
**Kegunaan:** Navbar yang tampil di semua halaman setelah login. Otomatis menampilkan link navigasi yang berbeda untuk mahasiswa dan admin berdasarkan URL pathname.

**Deteksi role:** `location.pathname.includes('/admin')` → tampilkan menu admin, otherwise menu mahasiswa.

**Nav link mahasiswa:** Beranda → Ajukan Tiket → Riwayat Tiket → Template Surat → FAQs

**State:**
- `isMobileMenuOpen: boolean` — toggle hamburger menu

**Method:**
- `isActive(path)` — cek apakah route sedang aktif (untuk highlight nav link)
- `handleLogout()` — panggil `auth.logout()` lalu navigate ke `/`

**Imports dari:**
- `../utils/withRouter`, `../utils/withAuth`

**Dipakai oleh:** `App.tsx` (di dalam MainLayout, muncul di semua protected route)

---

### `components/ActionModal.tsx`
**Kegunaan:** Modal untuk aksi admin terhadap tiket. Render ke `document.body` via React Portal supaya tidak terpengaruh z-index parent component.

**Mendukung tiga tipe aksi** (dikontrol prop `actionType`):

| actionType | Aksi | Input |
|-----------|------|-------|
| `'Reject'` | Tolak tiket | Catatan wajib |
| `'Approve'` | Setujui, lanjut ke pembuatan | Catatan opsional |
| `'Complete'` | Upload dokumen hasil, tandai selesai | File PDF wajib + catatan opsional |

**State:**
- `catatan: string` — isi catatan TU
- `fileBalasan: File | null` — file dokumen hasil (untuk Complete)
- `actionLoading: boolean`

**Method:**
- `handleSubmit(e)` — panggil API yang sesuai berdasarkan `actionType`
- `handleClose()` — reset state + panggil `onClose` prop

**Props:**
- `ticket` — data tiket
- `actionType: 'Approve' | 'Reject' | 'Complete'`
- `isOpen: boolean`
- `onClose()` — callback setelah modal ditutup

**Imports dari:**
- `../api/tickets.api`

**Dipakai oleh:** `pages/admin/TicketDetail.tsx`

---

## Pages — Student

### `pages/Login.tsx`
**Kegunaan:** Halaman login. Form email + password, kirim ke backend, redirect ke halaman sesuai role.

**State:**
- `username: string` — isi input email
- `password: string` — isi input password
- `loading: boolean` — disable tombol + tampilkan spinner
- `error: string` — pesan error login gagal

**Method:**
- `handleLogin(e)` — prevent default, panggil `auth.login()`, redirect berdasarkan role

**Alur setelah login berhasil:**
```
user.role === 'mahasiswa' → navigate('/dashboard')
user.role lainnya         → navigate('/admin-dashboard')
```

**Imports dari:**
- `../utils/withRouter`, `../utils/withAuth`

---

### `pages/student/Dashboard.tsx`
**Kegunaan:** Halaman utama mahasiswa. Menampilkan tiga kartu menu (Ajukan Tiket, Riwayat, FAQ) dan banner bantuan. Tidak ada API call — murni navigasi.

**Tidak punya state** — semua data statis (menuItems adalah properti class).

**Imports dari:**
- `../../utils/withRouter`, `../../utils/withAuth`

---

### `pages/student/History.tsx`
**Kegunaan:** Tampilkan daftar tiket milik mahasiswa yang login. Bisa filter by status, sort by tanggal, expand detail per tiket, download dokumen hasil.

**State:**
- `tickets: array` — daftar tiket dari backend
- `loading: boolean`
- `expandedId: string | null` — ID tiket yang sedang dibuka detailnya
- `filterStatus: string` — filter status aktif
- `sortOrder: string` — 'terbaru' atau 'terlama'
- `downloadingId: string | null` — ID tiket yang sedang didownload
- `downloadError: string`

**Method:**
- `componentDidMount()` — fetch `ticketsApi.myTickets()`
- `handleDownload(ticketId, e)` — download dokumen hasil via `ticketsApi.downloadFile()`
- `toggleExpand(id)` — buka/tutup detail accordion
- `getStatusBadge(status)` — render badge berwarna sesuai status

**Imports dari:**
- `../../utils/withRouter`
- `../../api/tickets.api`

---

### `pages/student/ApplyTicket.tsx`
**Kegunaan:** Form submit tiket baru. Dua tampilan: (1) katalog jenis layanan dengan search, (2) form isi keperluan + upload berkas syarat.

**State:**
- `services: array` — daftar layanan dari backend
- `selectedService: object | null` — layanan yang dipilih
- `searchTerm: string`
- `purpose: string` — isi keperluan
- `file: File | null` — berkas syarat (PDF)
- `fileError: string`
- `loading: boolean`
- `success: boolean`
- `error: string`

**Method:**
- `componentDidMount()` — fetch `servicesApi.list()`
- `handleFileChange(e)` — validasi tipe file (harus PDF)
- `handleSubmit(e)` — panggil `ticketsApi.submit()`, redirect ke `/history`

**Imports dari:**
- `../../utils/withRouter`, `../../utils/withAuth`
- `../../api/services.api`
- `../../api/tickets.api`

---

### `pages/student/TemplateSurat.tsx`
**Kegunaan:** Halaman self-service untuk surat-surat yang tidak perlu melalui tiket TU. Mahasiswa cukup unduh template, isi sendiri, lalu ajukan tanda tangan via DigiSign IPB.

**Data:** 4 template surat hardcoded (Pengantar Magang, Penelitian, Permintaan Data, Kunjungan). Setiap item berisi nama, deskripsi, daftar yang perlu disiapkan, dan `link` (URL ke file template — diisi setelah dapat template nyata dari TU).

**Konten halaman:**
- Cards per template dengan tombol "Lihat Template" (hyperlink eksternal)
- Seksi petunjuk langkah: Download → Isi data → DigiSign → Follow up WA
- Banner dengan link ke digisign.ipb.ac.id

**Tidak ada API call** — halaman statis. Untuk update template, cukup ubah array `TEMPLATES` di dalam file.

**Imports dari:**
- `../../utils/withRouter`

---

### `pages/student/FaqPage.tsx`
**Kegunaan:** Halaman FAQ statis dengan accordion dan search. Tidak ada API call.

**State:**
- `openIndex: number | null` — index FAQ yang sedang terbuka
- `search: string`

**Data:** 6 FAQ hardcoded di dalam file — berisi pertanyaan tentang cara pakai sistem (login, submit tiket, arti status, download dokumen, tiket ditolak, beda Template Surat vs Ajukan Tiket).

**Imports dari:**
- `../../utils/withRouter`

---

## Pages — Admin

### `pages/admin/Queue.tsx`
**Kegunaan:** Dashboard admin — tampilkan antrian tiket yang bisa diklaim. Filter otomatis berdasarkan level staff (departemen/fakultas/ipb). Ada fitur search, filter status, sort, dan tombol klaim tiket berikutnya.

**State:**
- `tickets: array` — semua tiket dari backend
- `loading: boolean`
- `searchTerm: string`
- `filterStatus: string`
- `sortOrder: string`
- `claimLoading: boolean`

**Level filtering:** Role staff dipetakan ke level layanan:
```
staff_departemen → tampilkan tiket level "departemen"
staff_fakultas   → tampilkan tiket level "fakultas"
staff_ipb        → tampilkan tiket level "ipb"
```

**Method:**
- `loadTickets()` — fetch `ticketsApi.allTickets()`
- `handleAmbilTiket()` — klaim tiket berikutnya via `ticketsApi.claimNext()`, navigate ke detail

**Imports dari:**
- `../../utils/withRouter`, `../../utils/withAuth`
- `../../api/tickets.api`

**Navigasi:** Klik baris tiket → navigate ke `/admin/ticket/:id`

---

### `pages/admin/TicketDetail.tsx`
**Kegunaan:** Detail tiket untuk admin. Tampilkan semua info tiket, status stepper, tombol aksi sesuai status, dan buka ActionModal untuk transisi status.

**State:**
- `ticket: object | null`
- `loading: boolean`
- `isModalOpen: boolean`
- `actionType: 'Approve' | 'Reject' | 'Complete' | null`
- `claimLoading: boolean`
- `downloadLoading: boolean`

**Tombol aksi berdasarkan status:**

| Status tiket | Tombol yang muncul |
|-------------|-------------------|
| `Dalam Antrean` | "Ambil & Mulai Proses" |
| `Diproses` | "Tolak" + "Setujui & Proses" |
| `Dalam Pembuatan` | "Upload Dokumen & Tandai Selesai" |
| `Selesai` / `Ditolak` | Tidak ada (info saja) |

**Method:**
- `componentDidMount()` — fetch `ticketsApi.getById(id)` (id dari URL params)
- `handleClaim()` — klaim tiket ini via `ticketsApi.claimSpecific()`
- `handleOpenModal(type)` — buka ActionModal dengan tipe aksi
- `handleStatusUpdate(newStatus)` — update state lokal setelah modal selesai
- `handleDownloadSyarat()` — download berkas syarat mahasiswa
- `renderStatusStepper()` — render progress bar status visual

**Imports dari:**
- `../../utils/withRouter`
- `../../api/tickets.api`
- `../../components/ActionModal`

---

## Dependency Map per Use Case

### Login
```
Login.tsx
  ├── withAuth         → utils/withAuth.tsx
  │     └── AuthContext  → context/AuthContext.tsx
  │           └── authApi.login() → api/auth.api.ts
  │                 └── client    → api/client.ts
  └── withRouter       → utils/withRouter.tsx
        └── navigate('/dashboard') atau '/admin-dashboard'
```

### Submit Tiket Baru
```
ApplyTicket.tsx
  ├── componentDidMount → servicesApi.list() → api/services.api.ts
  │                             └── mappers.ts (mapService)
  ├── onSubmit → ticketsApi.submit() → api/tickets.api.ts
  │                    └── mappers.ts (mapTicket)
  └── navigate('/history') setelah berhasil
```

### Lihat Riwayat Tiket
```
History.tsx
  ├── componentDidMount → ticketsApi.myTickets() → api/tickets.api.ts
  │                             └── mappers.ts (mapTicket)
  └── handleDownload → ticketsApi.downloadFile() → api/tickets.api.ts
```

### Admin Proses Tiket
```
Queue.tsx
  ├── loadTickets() → ticketsApi.allTickets()
  ├── handleAmbilTiket() → ticketsApi.claimNext()
  └── navigate('/admin/ticket/:id')
        ↓
TicketDetail.tsx
  ├── componentDidMount → ticketsApi.getById(id)
  ├── handleClaim() → ticketsApi.claimSpecific(id)
  └── handleOpenModal(type)
        ↓
    ActionModal.tsx
      ├── approve → ticketsApi.approve(id, catatan)
      ├── reject  → ticketsApi.reject(id, catatan)
      └── complete → ticketsApi.complete(id, file, catatan)
```

### Semua Halaman (setelah login)
```
App.tsx (MainLayout)
  └── Header.tsx
        ├── withRouter → location.pathname (deteksi role)
        └── withAuth   → auth.logout()
```
