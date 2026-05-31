"""
Seed akun demo — HANYA untuk development/staging, JANGAN dijalankan di production dengan password ini.

  python seed_demo.py

Untuk menambah akun baru, tambahkan entry ke DEMO_USERS di bawah lalu jalankan script ini lagi.
Script ini aman dijalankan berulang — akun yang sudah ada akan dilewati (SKIP).
"""

from app.database import engine, SessionLocal
from app.database import Base
from app.models import User, ServiceType, Ticket  # noqa: F401
from passlib.context import CryptContext

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_USERS = [
    # ── MAHASISWA ────────────────────────────────────────────────────────────────
    {
        "email": "alif.maulana@apps.ipb.ac.id",
        "password": "mahasiswa123",
        "nama": "Alif Maulana Pratama",
        "nim_nip": "G6412210012",
        "role": "mahasiswa",
    },
    {
        "email": "siti.rahmawati@apps.ipb.ac.id",
        "password": "mahasiswa123",
        "nama": "Siti Rahmawati Dewi",
        "nim_nip": "G6412210047",
        "role": "mahasiswa",
    },
    {
        "email": "budi.santoso@apps.ipb.ac.id",
        "password": "mahasiswa123",
        "nama": "Budi Santoso",
        "nim_nip": "G6412200089",
        "role": "mahasiswa",
    },

    # ── STAFF DEPARTEMEN (TU Dept. Ilmu Komputer) ────────────────────────────────
    {
        "email": "ridwan.tu.ilkom@apps.ipb.ac.id",
        "password": "admin123",
        "nama": "Ridwan Prasetyo",
        "nim_nip": "197305152000031002",
        "role": "staff_departemen",
    },
    {
        "email": "herman.tu.ilkom@apps.ipb.ac.id",
        "password": "admin123",
        "nama": "Herman Wijaya",
        "nim_nip": "196809221997031003",
        "role": "staff_departemen",
    },

    # ── STAFF FAKULTAS (TU Dekanat FMIPA) ───────────────────────────────────────
    {
        "email": "sri.wahyuni.fmipa@apps.ipb.ac.id",
        "password": "admin123",
        "nama": "Sri Wahyuni",
        "nim_nip": "197204101999032001",
        "role": "staff_fakultas",
    },

    # ── STAFF IPB (Admin Sistem / DAP) ───────────────────────────────────────────
    {
        "email": "admin.dap@apps.ipb.ac.id",
        "password": "admin123",
        "nama": "Admin Sistem IPB",
        "nim_nip": "197810202003121001",
        "role": "staff_ipb",
    },
]


def run():
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for data in DEMO_USERS:
            existing = db.query(User).filter(User.email == data["email"]).first()
            if existing:
                print(f"  [SKIP] User {data['email']} sudah ada.")
                continue
            db.add(User(
                email=data["email"],
                password_hash=_pwd.hash(data["password"]),
                nama=data["nama"],
                nim_nip=data["nim_nip"],
                role=data["role"],
            ))
            print(f"  [OK]   User {data['email']} ({data['role']}) ditambahkan.")
        db.commit()
        print("\nSeed demo users selesai.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
