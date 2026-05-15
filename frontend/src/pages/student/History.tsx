import { Component, Fragment } from 'react';
import { Clock, CheckCircle, XCircle, Download, FileText, ChevronRight, Loader2, Info } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';

class History extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tickets: [],
      loading: true,
      expandedId: null
    };
  }

  // Pengganti useEffect() untuk mengambil data saat halaman pertama kali dimuat
  componentDidMount() {
    // Simulasi pengambilan data dari server selama 1.5 detik
    setTimeout(() => {
      this.setState({
        loading: false,
        tickets: [
          {
            id: 'TKT-2026-001',
            jenis_tiket: 'Surat Keterangan Mahasiswa Aktif',
            submission_date: '2026-05-07T08:00:00Z',
            status: 'Pending',
            catatan_tu: '',
            file_balasan_path: ''
          },
          {
            id: 'TKT-2026-002',
            jenis_tiket: 'Permohonan Cuti Akademik',
            submission_date: '2026-05-05T14:30:00Z',
            status: 'Disetujui',
            catatan_tu: 'Berkas lengkap dan telah disetujui oleh Kaprodi. Silakan unduh surat resmi.',
            file_balasan_path: 'SK_Cuti_Akademik_G640001.pdf'
          },
          {
            id: 'TKT-2026-003',
            jenis_tiket: 'Legalisir Ijazah / Transkrip',
            submission_date: '2026-04-20T09:15:00Z',
            status: 'Ditolak',
            catatan_tu: 'Kualitas scan ijazah terlalu buram. Mohon unggah ulang dengan resolusi minimal 300dpi.',
            file_balasan_path: ''
          }
        ]
      });
    }, 1500);
  }

  toggleExpand = (id: string) => {
    this.setState((prevState: any) => ({
      expandedId: prevState.expandedId === id ? null : id
    }));
  };

  getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
            <Clock className="h-3 w-3" /> Dalam Antrean
          </span>
        );
      case 'Disetujui':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle className="h-3 w-3" /> Selesai / Disetujui
          </span>
        );
      case 'Ditolak':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
            <XCircle className="h-3 w-3" /> Ditolak
          </span>
        );
      default:
        return null;
    }
  };

  render() {
    const { tickets, loading, expandedId } = this.state;

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Tiket</h1>
            <p className="text-slate-500">Pantau status dan hasil pengajuan layanan akademik Anda.</p>
          </div>
        </div>

        {/* State 1: Sedang Loading */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Memuat riwayat tiket...</p>
          </div>
          
        /* State 2: Data Kosong (Jika Array tickets kosong) */
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
            <div className="mb-4 rounded-full bg-slate-50 p-4">
              <Info className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Belum ada riwayat</h3>
            <p className="mt-2 text-sm text-slate-500">Anda belum pernah mengajukan tiket layanan apapun.</p>
            <button onClick={() => this.props.navigate('/form-layanan')} className="mt-6 font-semibold text-[#003366] hover:underline">
              Ajukan tiket sekarang
            </button>
          </div>
          
        /* State 3: Menampilkan Tabel Data */
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                
                {/* Header Tabel */}
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Layanan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Pengajuan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                  </tr>
                </thead>
                
                {/* Body Tabel */}
                <tbody className="divide-y divide-slate-100">
                  {tickets.map((ticket: any) => (
                    <Fragment key={ticket.id}>
                      {/* Baris Utama yang Bisa Diklik */}
                      <tr 
                        onClick={() => this.toggleExpand(ticket.id)}
                        className={`group transition cursor-pointer ${expandedId === ticket.id ? "bg-slate-50" : "hover:bg-slate-50/50"}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#003366] transition ${expandedId === ticket.id ? "bg-white shadow-sm ring-1 ring-slate-200" : "bg-blue-50"}`}>
                              <FileText className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{ticket.jenis_tiket}</p>
                              <p className="text-xs text-slate-400">ID: {ticket.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-medium">
                          {new Date(ticket.submission_date).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric'
                          })}
                        </td>
                        <td className="px-6 py-4">
                          {this.getStatusBadge(ticket.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-3">
                            {ticket.status === 'Disetujui' && ticket.file_balasan_path && (
                              <button
                                onClick={(e) => { e.stopPropagation(); alert('Mengunduh dokumen...'); }}
                                className="inline-flex items-center gap-2 rounded-lg bg-[#003366] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#002244]"
                              >
                                <Download className="h-3.5 w-3.5" /> Unduh
                              </button>
                            )}
                            <ChevronRight className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${expandedId === ticket.id ? "rotate-90 text-[#003366]" : ""}`} />
                          </div>
                        </td>
                      </tr>

                      {/* Detail Accordion yang Terbuka saat Diklik */}
                      {expandedId === ticket.id && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="animate-in slide-in-from-top-2 duration-300">
                              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Informasi Tambahan</h4>
                                <div className="grid gap-6 sm:grid-cols-2">
                                  
                                  {/* Kolom Catatan TU */}
                                  <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan dari Staf TU</p>
                                    {ticket.catatan_tu ? (
                                      <div className={`rounded-xl p-4 text-sm font-medium leading-relaxed border ${ticket.status === 'Disetujui' ? "bg-green-50 border-green-100 text-green-900" : ticket.status === 'Ditolak' ? "bg-red-50 border-red-100 text-red-900" : "bg-orange-50 border-orange-100 text-orange-900"}`}>
                                        {ticket.catatan_tu}
                                      </div>
                                    ) : (
                                      <p className="text-sm italic text-slate-400">Belum ada catatan dari TU.</p>
                                    )}
                                  </div>

                                  {/* Kolom Status Progres */}
                                  <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Progres</p>
                                    <div className="flex items-center gap-3">
                                      <div className={`h-3 w-3 rounded-full animate-pulse ${ticket.status === 'Pending' ? "bg-orange-400" : ticket.status === 'Disetujui' ? "bg-green-500" : "bg-red-500"}`} />
                                      <span className="text-sm font-bold text-slate-700">
                                        {ticket.status === 'Pending' ? 'Menunggu Review Petugas' :
                                        ticket.status === 'Disetujui' ? 'Permintaan Selesai & Dokumen Terbit' :
                                        'Permintaan Ditolak'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                      {ticket.status === 'Pending' && "Petugas Tata Usaha akan segera memeriksa kelengkapan berkas Anda."}
                                      {ticket.status === 'Disetujui' && "Silakan unduh dokumen hasil melalui tombol yang tersedia."}
                                      {ticket.status === 'Ditolak' && "Mohon periksa catatan penolakan dan lakukan pengajuan ulang jika diperlukan."}
                                    </p>
                                  </div>

                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(History);