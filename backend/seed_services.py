"""
Seed jenis layanan — aman dijalankan di production.

  python seed_services.py
"""

import json
from app.database import engine, SessionLocal
from app.database import Base
from app.models import User, ServiceType, Ticket  # noqa: F401

SERVICES = [
    # ── FAKULTAS ────────────────────────────────────────────────────────────────
    {
        "nama": "Surat Cuti Mahasiswa",
        "deskripsi": "Pengajuan cuti sementara dari kegiatan perkuliahan. Diproses oleh TU Dekanat FMIPA.",
        "level": "fakultas",
        "berkas_dibutuhkan": json.dumps([
            "Bukti pendukung alasan cuti (surat dokter / surat keterangan ekonomi / dll)",
        ]),
    },
    {
        "nama": "Surat Aktif Kembali dari Cuti",
        "deskripsi": "Pengajuan untuk kembali aktif kuliah setelah masa cuti berakhir.",
        "level": "fakultas",
        "berkas_dibutuhkan": json.dumps([]),
    },
    {
        "nama": "Surat Pengunduran Diri",
        "deskripsi": "Prosedur resmi untuk berhenti menjadi mahasiswa IPB. Diproses oleh TU Dekanat FMIPA.",
        "level": "fakultas",
        "berkas_dibutuhkan": json.dumps([]),
    },
    {
        "nama": "Surat Perpanjangan Studi",
        "deskripsi": "Permohonan perpanjangan masa studi di luar batas normal yang ditetapkan.",
        "level": "fakultas",
        "berkas_dibutuhkan": json.dumps([
            "Scan persetujuan dosen pembimbing akademik (PDF)",
        ]),
    },
    {
        "nama": "Surat Keterangan Kelulusan",
        "deskripsi": "Surat keterangan bahwa mahasiswa telah menyelesaikan studi, diterbitkan sebelum ijazah resmi terbit.",
        "level": "fakultas",
        "berkas_dibutuhkan": json.dumps([]),
    },
    {
        "nama": "Legalisasi Ijazah / Transkrip",
        "deskripsi": "Pengesahan fotokopi ijazah atau transkrip nilai oleh Dekanat FMIPA.",
        "level": "fakultas",
        "berkas_dibutuhkan": json.dumps([
            "Fotokopi ijazah atau transkrip yang akan dilegalisir",
        ]),
    },

    # ── IPB (UNIVERSITAS) ────────────────────────────────────────────────────────
    {
        "nama": "Surat Keterangan Mahasiswa Aktif",
        "deskripsi": "Surat resmi yang menyatakan status mahasiswa aktif semester ini. Dapat diterbitkan dalam Bahasa Indonesia atau Bahasa Inggris.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "KTM + bukti pembayaran UKT semester berjalan (digabung dalam 1 file PDF)",
        ]),
    },
    {
        "nama": "SK Proses Perbaikan Data PDDIKTI",
        "deskripsi": "Surat keterangan bahwa pemohon sedang dalam proses perbaikan atau pemutakhiran data di PDDIKTI.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "Fotokopi ijazah atau transkrip akhir (wajib bagi yang sudah berstatus lulus)",
        ]),
    },
    {
        "nama": "SK Data Tidak Tercantum di PDDIKTI",
        "deskripsi": "Surat keterangan bagi lulusan yang datanya tidak tercantum di PDDIKTI (umumnya angkatan 2003/2004 ke bawah).",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "Fotokopi ijazah atau transkrip akhir",
        ]),
    },
    {
        "nama": "SK Penggantian KTM Hilang",
        "deskripsi": "Surat keterangan untuk penggantian Kartu Tanda Mahasiswa (KTM) Multistrata yang hilang.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "Surat keterangan kehilangan dari kepolisian yang masih berlaku",
        ]),
    },
    {
        "nama": "SK Keabsahan Ijazah",
        "deskripsi": "Surat keterangan yang menyatakan bahwa ijazah pemohon adalah sah dan diterbitkan oleh IPB University.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "Fotokopi ijazah atau transkrip akhir",
        ]),
    },
    {
        "nama": "SK Letter of Acceptance (LoA)",
        "deskripsi": "Surat keterangan penerimaan di IPB untuk mahasiswa Multistrata yang memerlukan bukti penerimaan dari institusi lain.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "Surat keterangan dari instansi yang memerlukan LoA",
            "Bukti cetak persyaratan yang diminta instansi (digabung dalam 1 file PDF)",
        ]),
    },
    {
        "nama": "SK Sedang / Tidak Menerima Beasiswa",
        "deskripsi": "Surat keterangan status penerimaan beasiswa mahasiswa, untuk keperluan pengajuan beasiswa baru atau instansi terkait.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "KTM + file identitas berisi nama, NIM, fakultas, dan nama beasiswa (digabung dalam 1 file PDF)",
        ]),
    },
    {
        "nama": "Surat Keterangan Pendamping Ijazah (SKPI)",
        "deskripsi": "Penanganan kendala atau permasalahan SKPI bagi mahasiswa yang terdaftar sebagai wisudawan.",
        "level": "ipb",
        "berkas_dibutuhkan": json.dumps([
            "Screenshot atau bukti kendala dari studentportal.ipb.ac.id",
        ]),
    },
]


def run():
    print("Membuat tabel...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        for data in SERVICES:
            existing = db.query(ServiceType).filter(ServiceType.nama == data["nama"]).first()
            if existing:
                print(f"  [SKIP] Layanan '{data['nama']}' sudah ada.")
                continue
            db.add(ServiceType(**data))
            print(f"  [OK]   Layanan '{data['nama']}' ditambahkan.")
        db.commit()
        print("\nSeed layanan selesai.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
