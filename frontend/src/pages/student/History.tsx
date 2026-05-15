import { Component, Fragment } from 'react';
import { Clock, CheckCircle, XCircle, Download, FileText, ChevronRight, Loader2, Info, RefreshCw, Wrench, ChevronDown, AlertCircle } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';
import { ticketsApi } from '../../api/tickets.api';

const STATUS_OPTIONS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'Dalam Antrean', label: 'Dalam Antrean' },
  { value: 'Diproses', label: 'Diproses' },
  { value: 'Dalam Pembuatan', label: 'Dalam Pembuatan' },
  { value: 'Ditolak', label: 'Ditolak' },
  { value: 'Selesai', label: 'Selesai' },
];

class History extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tickets: [],
      loading: true,
      expandedId: null,
      filterStatus: 'semua',
      sortOrder: 'terbaru',
      downloadingId: null as string | null,
      downloadError: '',
    };
  }

  componentDidMount() {
    ticketsApi.myTickets()
      .then((tickets) => this.setState({ tickets, loading: false }))
      .catch(() => this.setState({ loading: false }));
  }

  handleDownload = async (ticketId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    this.setState({ downloadingId: ticketId, downloadError: '' });
    try {
      await ticketsApi.downloadFile(ticketId, 'hasil');
    } catch {
      this.setState({ downloadError: 'Gagal mengunduh dokumen. Coba lagi.' });
    } finally {
      this.setState({ downloadingId: null });
    }
  };

  toggleExpand = (id: string) => {
    this.setState((prevState: any) => ({
      expandedId: prevState.expandedId === id ? null : id
    }));
  };

  getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dalam Antrean':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
            <Clock className="h-3 w-3" /> Dalam Antrean
          </span>
        );
      case 'Diproses':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
            <RefreshCw className="h-3 w-3" /> Diproses
          </span>
        );
      case 'Dalam Pembuatan':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">
            <Wrench className="h-3 w-3" /> Dalam Pembuatan
          </span>
        );
      case 'Selesai':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700">
            <CheckCircle className="h-3 w-3" /> Selesai
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

  getAccordionBorderColor = (status: string) => {
    switch (status) {
      case 'Selesai': return 'border-green-100 bg-green-50 text-green-900';
      case 'Ditolak': return 'border-red-100 bg-red-50 text-red-900';
      case 'Diproses': return 'border-blue-100 bg-blue-50 text-blue-900';
      case 'Dalam Pembuatan': return 'border-purple-100 bg-purple-50 text-purple-900';
      default: return 'border-orange-100 bg-orange-50 text-orange-900';
    }
  };

  render() {
    const { tickets, loading, expandedId, filterStatus, sortOrder, downloadingId, downloadError } = this.state;

    const filtered = tickets
      .filter((t: any) => filterStatus === 'semua' || t.status === filterStatus)
      .sort((a: any, b: any) => {
        const diff = new Date(a.submission_date).getTime() - new Date(b.submission_date).getTime();
        return sortOrder === 'terbaru' ? -diff : diff;
      });

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Riwayat Tiket</h1>
            <p className="text-slate-500">Pantau status dan hasil pengajuan layanan akademik Anda.</p>
          </div>
        </div>

        {downloadError && (
          <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 border border-red-100">
            <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />
            <p className="text-sm font-medium text-red-700">{downloadError}</p>
          </div>
        )}

        {/* Filter & Sort Bar */}
        {!loading && tickets.length > 0 && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => this.setState({ filterStatus: e.target.value })}
                className="appearance-none pl-4 pr-10 py-2.5 rounded-xl border-0 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-[#003366] outline-none bg-white cursor-pointer"
              >
                {STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            </div>

            <button
              onClick={() => this.setState({ sortOrder: sortOrder === 'terbaru' ? 'terlama' : 'terbaru' })}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 bg-white hover:bg-slate-50 transition-colors"
            >
              {sortOrder === 'terbaru' ? '↓ Terbaru' : '↑ Terlama'}
            </button>

            {filterStatus !== 'semua' && (
              <button
                onClick={() => this.setState({ filterStatus: 'semua' })}
                className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors underline"
              >
                Reset filter
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-sm font-medium">Memuat riwayat tiket...</p>
          </div>

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

        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl bg-white py-12 text-center shadow-sm ring-1 ring-slate-200">
            <Info className="h-8 w-8 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Tidak ada tiket dengan status <strong>{filterStatus}</strong>.</p>
          </div>

        ) : (
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Jenis Layanan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Pengajuan</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((ticket: any) => (
                    <Fragment key={ticket.id}>
                      <tr
                        onClick={() => this.toggleExpand(ticket.id)}
                        className={`group transition cursor-pointer ${expandedId === ticket.id ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#003366] transition ${expandedId === ticket.id ? 'bg-white shadow-sm ring-1 ring-slate-200' : 'bg-blue-50'}`}>
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
                          <div className="flex items-center justify-end gap-2">
                            {ticket.status === 'Selesai' && ticket.file_balasan_path && (
                              <button
                                onClick={(e) => this.handleDownload(ticket.id, e)}
                                disabled={downloadingId === ticket.id}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-[#003366] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#002244] disabled:opacity-60"
                              >
                                {downloadingId === ticket.id
                                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  : <Download className="h-3.5 w-3.5" />}
                                Unduh
                              </button>
                            )}
                            <ChevronRight className={`h-5 w-5 text-slate-300 transition-transform duration-300 ${expandedId === ticket.id ? 'rotate-90 text-[#003366]' : ''}`} />
                          </div>
                        </td>
                      </tr>

                      {expandedId === ticket.id && (
                        <tr className="bg-slate-50/50">
                          <td colSpan={4} className="px-6 py-4">
                            <div className="animate-in slide-in-from-top-2 duration-300">
                              <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Informasi Tambahan</h4>
                                <div className="grid gap-6 sm:grid-cols-2">

                                  <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan dari Staf TU</p>
                                    {ticket.catatan_tu ? (
                                      <div className={`rounded-xl p-4 text-sm font-medium leading-relaxed border ${this.getAccordionBorderColor(ticket.status)}`}>
                                        {ticket.catatan_tu}
                                      </div>
                                    ) : (
                                      <p className="text-sm italic text-slate-400">Belum ada catatan dari TU.</p>
                                    )}
                                  </div>

                                  <div className="space-y-3">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Progres</p>
                                    <div className="flex items-center gap-3">
                                      <div className={`h-3 w-3 rounded-full animate-pulse ${
                                        ticket.status === 'Dalam Antrean' ? 'bg-orange-400'
                                        : ticket.status === 'Diproses' ? 'bg-blue-400'
                                        : ticket.status === 'Dalam Pembuatan' ? 'bg-purple-400'
                                        : ticket.status === 'Selesai' ? 'bg-green-500'
                                        : 'bg-red-500'
                                      }`} />
                                      <span className="text-sm font-bold text-slate-700">{ticket.status}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                      {ticket.status === 'Dalam Antrean' && 'Pengajuan Anda sedang menunggu ditinjau oleh staf TU.'}
                                      {ticket.status === 'Diproses' && 'Staf TU sedang meninjau kelengkapan berkas Anda.'}
                                      {ticket.status === 'Dalam Pembuatan' && 'Berkas disetujui. Dokumen sedang dalam tahap pembuatan.'}
                                      {ticket.status === 'Selesai' && 'Dokumen selesai. Silakan unduh melalui tombol yang tersedia.'}
                                      {ticket.status === 'Ditolak' && 'Mohon periksa catatan penolakan dan ajukan tiket baru jika diperlukan.'}
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
