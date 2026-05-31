# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IASH** (IPB Academic Service Helper) — a full-stack academic service ticket system for IPB University. Students submit service requests (surat keterangan, legalisir, cuti akademik, etc.); staff (TU) review, claim, approve/reject, and complete them.

## Commands

### Frontend (`frontend/`)

```bash
npm run dev       # start Vite dev server (http://localhost:5173)
npm run build     # type-check + production build
npm run lint      # ESLint
npm run preview   # preview production build
```

### Backend (`backend/`)

```bash
uvicorn main:app --reload          # start FastAPI dev server (http://localhost:8000)
python seed_demo.py                # seed demo user accounts
python seed_services.py            # seed service type catalogue
```

Backend setup requires a `.env` file — copy `.env.example` and fill in `DATABASE_URL` and `SECRET_KEY`. The database schema is auto-created on first startup (`Base.metadata.create_all`).

## Frontend Architecture

### Class Component Convention

**All components are React Class Components** — no functional components. This is an intentional project constraint. Hooks are unavailable, so two HOCs are used instead:

- **`withRouter`** (`src/utils/withRouter.tsx`) — injects `navigate`, `location`, and `params` as props. Required for any component that navigates.
- **`withAuth`** (`src/utils/withAuth.tsx`) — injects the `auth` prop (the full `AuthContextType`) from `AuthContext`. Required for any component that reads user or calls login/logout.

Components often compose both:
```tsx
export default withRouter(withAuth(MyComponent));
```

### Route Structure

| Path | Component | Role |
|------|-----------|------|
| `/` | `Login` | Public |
| `/dashboard` | `student/Dashboard` | Student |
| `/form-layanan` | `student/ApplyTicket` | Student |
| `/history` | `student/History` | Student |
| `/template-surat` | `student/TemplateSurat` | Student |
| `/faqs` | `student/FaqPage` | Student |
| `/admin-dashboard` | `admin/Queue` | Admin |
| `/admin/ticket/:id` | `admin/TicketDetail` | Admin |

`Header` detects role by checking `location.pathname.includes('/admin')`.

### Authentication Flow

`AuthContext` (`src/context/AuthContext.tsx`) stores `token` and `user` in `localStorage` (`iash_token`, `iash_user`). `login()` calls `POST /api/auth/login` (OAuth2 form), then `GET /api/auth/me` to retrieve the user object.

The axios client (`src/api/client.ts`) automatically attaches the bearer token from `localStorage` and redirects to `/` on 401.

### API Layer

All backend calls go through typed modules in `src/api/`:
- `auth.api.ts` — login, me
- `tickets.api.ts` — submit, list, detail, approve/reject/complete, download
- `services.api.ts` — list service types
- `mappers.ts` — maps raw API responses to frontend types

### `ActionModal` — Portal Pattern

`src/components/ActionModal.tsx` renders into `document.body` via `createPortal`. Used in both `Queue` and `TicketDetail`. Props: `ticket`, `actionType` (`'Approve' | 'Reject'`), `isOpen`, `onClose`.

### Styling

- **Tailwind CSS v3** — no component library.
- Brand primary: `#003366` (Tailwind token: `deep-sea`).
- Background: `#F5F7FA` (Tailwind token: `light-bg`).
- `index.css` sets `overflow-y: scroll` globally to prevent layout shift.

## Backend Architecture

**Tech stack:** FastAPI + SQLAlchemy 2 + PostgreSQL, deployed on Railway. Frontend deployed on Vercel. Django is strictly forbidden.

### Layering (mandatory)

```
Request → Route → Service → Repository → ORM Model → Database
                  (logic)   (data access)
```

- Routes are entry points only — no business logic.
- Services contain all business logic — never touch `Session` directly.
- Repositories are the only layer allowed to query the database.
- ORM models (`app/models/`) define schema only — no logic.

### OOP Requirement

All backend code must use OOP. Each service and repository is a class instantiated per request with a `db: Session` dependency.

### User Roles

`mahasiswa` | `staff_departemen` | `staff_fakultas` | `staff_ipb`

Staff are matched to tickets by level — a `staff_departemen` can only claim/process tickets with `service_type.level == "departemen"`. This is enforced in `TicketService`.

### Ticket Lifecycle

```
dalam_antrean → diproses → dalam_pembuatan → selesai
                         ↘ ditolak
```

Transitions are validated against `_VALID_TRANSITIONS` in `ticket_service.py`. Invalid transitions return HTTP 422.

### File Uploads

Only PDF files are accepted (validated by extension and MIME type). Max 10 MB. Files are stored under `UPLOAD_DIR/berkas_syarat/` (student uploads) and `UPLOAD_DIR/berkas_hasil/` (staff result documents). Download endpoints use path traversal protection (`_safe_path`).

### Email Notifications

Configured via SMTP env vars. Leave `MAIL_USERNAME` empty to disable — the app runs normally without it (notification calls are silently skipped).

### Security Features

- JWT access tokens (HS256, 24h expiry by default)
- Rate limiting on login: 10 requests/minute (slowapi)
- Global exception handler prevents stack traces leaking to clients
- Security + audit structured logging in `app/logger.py`

### Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| `mahasiswa` | `alif.maulana@apps.ipb.ac.id` | `mahasiswa123` |
| `mahasiswa` | `siti.rahmawati@apps.ipb.ac.id` | `mahasiswa123` |
| `mahasiswa` | `budi.santoso@apps.ipb.ac.id` | `mahasiswa123` |
| `staff_departemen` | `ridwan.tu.ilkom@apps.ipb.ac.id` | `admin123` |
| `staff_departemen` | `herman.tu.ilkom@apps.ipb.ac.id` | `admin123` |
| `staff_fakultas` | `sri.wahyuni.fmipa@apps.ipb.ac.id` | `admin123` |
| `staff_ipb` | `admin.dap@apps.ipb.ac.id` | `admin123` |

Seed with `python seed_demo.py` and `python seed_services.py` from `backend/`.

### Admin Endpoints (manajemen akun)

Hanya `staff_ipb` yang bisa akses. Gunakan via Postman dengan Bearer token:

```
GET    /api/admin/users                        — list semua user
POST   /api/admin/users                        — buat akun baru
PATCH  /api/admin/users/{user_id}/deactivate   — nonaktifkan akun
```



### Tech Stack

| Layer | Technology | Deploy |
|-------|-----------|--------|
| Frontend | React + Vite + Tailwind CSS | Vercel |
| Backend | Python — FastAPI or Flask (**Django is strictly forbidden**) | Railway |
| Database | PostgreSQL | Railway |


**Code paradigm: OOP is mandatory throughout the entire backend codebase.**

### Clean Architecture Rules

**Rule 1 — Business Logic Isolation**
Business logic must never live in a Controller or Route. Routes are entry points only: receive request, return response. Nothing else.

**Rule 2 — No Direct CRUD**
Controllers must never touch the database directly. All data operations must go through a Domain Class / Service Layer.

**Rule 3 — ORM Restriction**
ORM classes (e.g. SQLAlchemy models) are for schema mapping only. Business logic must never be placed inside an ORM class.

**Required layering:**
```
Request → Route/Controller → Service Layer → Repository → ORM Model → Database
                              (business       (data
                               logic here)     access here)
```
