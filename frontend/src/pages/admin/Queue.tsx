import { Component, type ChangeEvent } from 'react';
import { Search, ChevronRight, Loader2, User, CheckCircle2, XCircle } from 'lucide-react';
import ActionModal from '../../components/ActionModal';
import { withRouter } from '../../utils/withRouter';

class Queue extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tickets: [],
      loading: true,
      searchTerm: '',
      // State untuk ActionModal
      isModalOpen: false,
      selectedTicket: null,
      actionType: null
    };
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({
        loading: false,
        tickets: [
          {
            id: 'TKT-2026-001',
            user_nama: 'Budi Santoso',
            user_nim_nip: 'G64190001',
            jenis_tiket: 'Surat Keterangan Mahasiswa Aktif',
            submission_date: '2026-05-07T08:00:00Z',
            status: 'Pending'
          },
          {
            id: 'TKT-2026-002',
            user_nama: 'Siti Aminah',
            user_nim_nip: 'G64190022',
            jenis_tiket: 'Permohonan Cuti Akademik',
            submission_date: '2026-05-06T14:30:00Z',
            status: 'Disetujui'
          },
          {
            id: 'TKT-2026-003',
            user_nama: 'Ahmad Fauzi',
            user_nim_nip: 'G64190033',
            jenis_tiket: 'Legalisir Ijazah / Transkrip',
            submission_date: '2026-05-05T09:15:00Z',
            status: 'Ditolak'
          }
        ]
      });
    }, 1500);
  }

  handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  // Fungsi pengontrol Modal
  handleOpenModal = (ticket: any, type: 'Approve' | 'Reject') => {
    this.setState({
      selectedTicket: ticket,
      actionType: type,
      isModalOpen: true
    });
  };

  handleCloseModal = () => {
    this.setState({ isModalOpen: false });
  };

  getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">Pending</span>;
      case 'Disetujui':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">Selesai</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">Ditolak</span>;
      default:
        return null;
    }
  };

  render() {
    const { tickets, loading, searchTerm, isModalOpen, selectedTicket, actionType } = this.state;
    const { navigate } = this.props;

    const filteredTickets = tickets.filter((t: any) => 
      t.user_nama?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      t.user_nim_nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.jenis_tiket.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Antrean</h1>
          <p className="text-slate-500">Kelola permintaan layanan akademik dari mahasiswa.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Antrean</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {tickets.filter((t: any) => t.status === 'Pending').length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 border-l-4 border-green-500">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Disetujui</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {tickets.filter((t: any) => t.status === 'Disetujui').length}
            </p>
          </div>
          <div className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 border-l-4 border-red-500">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Ditolak</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">
              {tickets.filter((t: any) => t.status === 'Ditolak').length}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari NIM, Nama, atau Jenis Layanan..."
              value={searchTerm}
              onChange={this.handleSearch}
              className="block w-full rounded-lg border-0 py-2.5 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm outline-none transition-all"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mahasiswa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Layanan</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      Memuat data antrean...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Tidak ada antrean ditemukan.</td>
                  </tr>
                ) : (
                  filteredTickets.map((ticket: any) => (
                    <tr key={ticket.id} className="group transition hover:bg-slate-50/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            <User className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900">{ticket.user_nama}</p>
                            <p className="text-xs text-slate-400">{ticket.user_nim_nip}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-slate-700">{ticket.jenis_tiket}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(ticket.submission_date).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4">
                        {this.getStatusBadge(ticket.status)}
                      </td>
                      
                      {/* Kolom Aksi dengan Tombol Rincian & Aksi Cepat */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          
                          {/* Tombol Aksi Cepat (Hanya muncul jika tiket berstatus Pending) dipindah ke kiri */}
                          {ticket.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => this.handleOpenModal(ticket, 'Approve')}
                                className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-1.5 text-green-600 shadow-sm transition hover:bg-green-100 hover:border-green-300"
                                title="Setujui Cepat"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => this.handleOpenModal(ticket, 'Reject')}
                                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-1.5 text-red-600 shadow-sm transition hover:bg-red-100 hover:border-red-300"
                                title="Tolak Cepat"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}

                          {/* Tombol Rincian dipindah ke paling kanan */}
                          <button
                            onClick={() => navigate(`/admin/ticket/${ticket.id}`)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                            title="Lihat Detail Lengkap"
                          >
                            Rincian <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                          
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Aksi Cepat */}
        <ActionModal 
          isOpen={isModalOpen} 
          onClose={this.handleCloseModal} 
          ticket={selectedTicket} 
          actionType={actionType} 
        />

      </div>
    );
  }
}

export default withRouter(Queue);