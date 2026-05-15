# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**IASH** (IPB Academic Service Helper) — a frontend-only React SPA for managing academic service ticket submissions at IPB University. Students submit requests (surat keterangan, legalisir, cuti akademik, etc.); admin staff (staf TU) review and approve/reject them.

There is currently **no backend**. All data is mocked via `setTimeout` in `componentDidMount`. Authentication is simulated with hardcoded demo credentials.

## Commands

All commands run from `frontend/`:

```bash
npm run dev       # start dev server (Vite)
npm run build     # type-check + production build
npm run lint      # ESLint
npm run preview   # preview production build
```

## Architecture

### Class Component Convention

**All components are React Class Components**, not functional components. This is an intentional constraint for the project. Do not introduce function components. Navigation hooks are unavailable inside class components, so a `withRouter` HOC is used instead.

### `withRouter` HOC — Required Pattern

`src/utils/withRouter.tsx` wraps class components to inject `navigate`, `location`, and `params` as props. Every class component that needs routing must:
1. Import and call `withRouter` on the export
2. Access routing via `this.props.navigate(path)`, `this.props.location`, and `this.props.params`

```tsx
// Pattern used throughout the codebase
export default withRouter(MyComponent);
```

### Route Structure

| Path | Component | Role |
|------|-----------|------|
| `/` | `Login` | Public |
| `/dashboard` | `student/Dashboard` | Student |
| `/form-layanan` | `student/ApplyTicket` | Student |
| `/history` | `student/History` | Student |
| `/faqs` | `student/FaqPage` | Student |
| `/admin-dashboard` | `admin/Queue` | Admin |
| `/admin/ticket/:id` | `admin/TicketDetail` | Admin |

The `Header` component detects the current role by checking `location.pathname.includes('/admin')` and renders different nav links accordingly.

### `ActionModal` — Portal Pattern

`src/components/ActionModal.tsx` renders into `document.body` via `createPortal`. It is used in both `Queue` (quick approve/reject) and `TicketDetail` (full detail view). The modal receives `ticket`, `actionType` (`'Approve' | 'Reject'`), `isOpen`, and `onClose` props.

### Styling

- **Tailwind CSS v3** — utility-first. No component library.
- Brand primary: `#003366` (also available as `deep-sea` Tailwind token).
- Background: `#F5F7FA` (also `light-bg` token).
- `index.css` forces `overflow-y: scroll` globally to prevent layout shift from scrollbar appearing/disappearing.

### Demo Credentials (Login)

| Role | Email | Password |
|------|-------|----------|
| Student | `mahasiswa_demo@apps.ipb.ac.id` | `mahasiswa123` |
| Staff/Admin | `staff_demo@apps.ipb.ac.id` | `admin123` |

These are hardcoded in `src/pages/Login.tsx:26-29`. Login redirects to `/dashboard` (student) or `/admin-dashboard` (admin).

### Ticket Status Values

`'Pending'` | `'Disetujui'` | `'Ditolak'` — used consistently across Queue, History, and TicketDetail for badge rendering and conditional logic.

---

## Backend Architecture (Mandatory — Lecturer Rules, No Exceptions)

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
