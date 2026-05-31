import { Component } from 'react';
import { FileText, ExternalLink, CheckCircle } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';

const TEMPLATES = [
  {
    nama: "Surat Pengantar Magang",
    deskripsi: "Surat resmi dari departemen untuk kegiatan magang / Kerja Praktik (KP) di instansi atau perusahaan.",
    persiapan: [
      "Nama lengkap instansi/perusahaan tujuan",
      "Rentang waktu magang (tanggal mulai – selesai)",
      "Bidang atau divisi yang dituju",
    ],
    link: "#",
  },
  {
    nama: "Surat Pengantar Penelitian",
    deskripsi: "Surat pengantar untuk kegiatan penelitian di lembaga atau instansi eksternal dalam rangka tugas akhir atau riset.",
    persiapan: [
      "Nama lembaga/instansi tujuan",
      "Topik penelitian secara singkat",
      "Rentang waktu penelitian",
    ],
    link: "#",
  },
  {
    nama: "Surat Pengantar Permintaan Data",
    deskripsi: "Surat pengantar untuk meminta data ke instansi atau perusahaan sebagai bahan skripsi, penelitian, atau tugas kuliah.",
    persiapan: [
      "Nama instansi yang dituju",
      "Jenis data yang dibutuhkan",
      "Keperluan dan penggunaan data",
    ],
    link: "#",
  },
  {
    nama: "Surat Pengantar Kunjungan",
    deskripsi: "Surat pengantar untuk kunjungan industri atau kunjungan lapangan ke suatu instansi atau lokasi.",
    persiapan: [
      "Nama instansi/lokasi tujuan",
      "Tanggal kunjungan",
      "Tujuan kunjungan",
    ],
    link: "#",
  },
];

const STEPS = [
  {
    nomor: "1",
    judul: "Unduh Template",
    detail: "Klik tombol 'Lihat Template' pada jenis surat yang dibutuhkan, lalu unduh filenya.",
  },
  {
    nomor: "2",
    judul: "Isi Data Diri",
    detail: "Lengkapi template dengan nama, NIM, program studi, dan keperluan sesuai panduan di dokumen.",
  },
  {
    nomor: "3",
    judul: "Ajukan Tanda Tangan via DigiSign",
    detail: "Buka digisign.ipb.ac.id, unggah dokumen yang sudah diisi, lalu ajukan ke dosen atau pejabat departemen yang berwenang.",
  },
  {
    nomor: "4",
    judul: "Follow Up via WhatsApp",
    detail: "Hubungi dosen atau pejabat yang bersangkutan via WhatsApp untuk konfirmasi dan percepatan proses tanda tangan.",
  },
];

class TemplateSurat extends Component<any, any> {
  render() {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <FileText className="h-8 w-8 text-[#003366]" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Template Surat</h1>
          <p className="mt-3 text-slate-500 text-lg max-w-2xl mx-auto">
            Surat-surat berikut dapat diurus secara mandiri. Unduh template, isi data diri, lalu ajukan tanda tangan melalui DigiSign IPB.
          </p>
        </div>

        {/* Template Cards */}
        <div className="space-y-4 mb-14">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-[#003366]" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base">{t.nama}</h3>
                <p className="mt-1 text-slate-500 text-sm">{t.deskripsi}</p>
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Yang perlu disiapkan</p>
                  <ul className="space-y-1">
                    {t.persiapan.map((p, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="sm:self-center">
                <a
                  href={t.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#003366] text-white text-sm font-medium rounded-xl hover:bg-[#002244] transition-colors whitespace-nowrap"
                >
                  <ExternalLink className="w-4 h-4" /> Lihat Template
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Petunjuk DigiSign */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-8 mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Cara Mengurus Surat Secara Mandiri</h2>
          <div className="space-y-5">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-[#003366] text-white text-sm font-bold flex items-center justify-center shrink-0">
                  {s.nomor}
                </div>
                <div>
                  <p className="font-semibold text-slate-800">{s.judul}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Banner DigiSign */}
        <div className="p-8 rounded-3xl bg-[#003366] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/10">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">Ajukan Tanda Tangan Digital</h3>
            <p className="text-blue-100 mt-1">Gunakan DigiSign IPB untuk meminta tanda tangan dosen atau pejabat secara online.</p>
          </div>
          <a
            href="https://digisign.ipb.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#003366] rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
          >
            <ExternalLink className="h-5 w-5" /> Buka DigiSign IPB
          </a>
        </div>

      </div>
    );
  }
}

export default withRouter(TemplateSurat);
