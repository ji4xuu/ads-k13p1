import { Component, type ChangeEvent } from 'react';
import { Search, ChevronRight, Loader2, User, CheckCircle2, XCircle, Clock, RefreshCw, Wrench, ChevronDown, Inbox } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';
import { withAuth } from '../../utils/withAuth';
import { ticketsApi } from '../../api/tickets.api';

const STATUS_OPTIONS = [
  { value: 'semua', label: 'Semua Status' },
  { value: 'Dalam Antrean', label: 'Dalam Antrean' },
  { value: 'Diproses', label: 'Diproses' },
  { value: 'Dalam Pembuatan', label: 'Dalam Pembuatan' },
  { value: 'Ditolak', label: 'Ditolak' },
  { value: 'Selesai', label: 'Selesai' },
];

const ROLE_LEVEL: Record<string, string> = {
  'staff_departemen': 'departemen',
  'staff_fakultas': 'fakultas',
  'staff_ipb': 'ipb',
};

const LEVEL_LABEL: Record<string, string> = {
  'departemen': 'Departemen',
  'fakultas': 'Fakultas',
  'ipb': 'IPB',
};

class Queue extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      tickets: [],
      loading: true,
      searchTerm: '',
      filterStatus: 'Dalam Antrean',
      sortOrder: 'terlama',
      claimLoading: false,
    };
  }

  componentDidMount() {
    this.loadTickets();
  }

  loadTickets = () => {
    this.setState({ loading: true });
    ticketsApi.allTickets()
      .then((tickets) => this.setState({ tickets, loading: false }))
      .catch(() => this.setState({ loading: false }));
  };

  handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleAmbilTiket = async () => {
    this.setState({ claimLoading: true });
    try {
      const ticket = await ticketsApi.claimNext();
      this.props.navigate(`/admin/ticket/${ticket.id}`);
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Tidak ada tiket dalam antrean untuk level Anda.');
      this.setState({ claimLoading: false });
    }
  };

  getStatusBadge = (status: string) => {
    switch (status) {
      case 'Dalam Antrean':
        return <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700"><Clock className="h-3 w-3" /> Dalam Antrean</span>;
      case 'Diproses':
        return <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700"><RefreshCw className="h-3 w-3" /> Diproses</span>;
      case 'Dalam Pembuatan':
        return <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700"><Wrench className="h-3 w-3" /> Dalam Pembuatan</span>;
      case 'Selesai':
        return <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-700"><CheckCircle2 className="h-3 w-3" /> Selesai</span>;
      case 'Ditolak':
        return <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700"><XCircle className="h-3 w-3" /> Ditolak</span>;
      default:
        return null;
    }
  };

  render() {
    const { tickets, loading, searchTerm, filterStatus, sortOrder, claimLoading } = this.state;
    const { navigate } = this.props;

    const myLevel = ROLE_LEVEL[this.props.auth?.user?.role ?? ''] ?? '';
    const levelLabel = LEVEL_LABEL[myLevel] ?? myLevel;

    // Hanya tampilkan tiket sesuai level staff yang sedang login
    const myTickets = tickets.filter((t: any) => t.service_level === myLevel);

    const antreanCount = myTickets.filter((t: any) => t.status === 'Dalam Antrean').length;

    const filtered = myTickets
      .filter((t: any) => {
        const matchSearch =
          t.user_nama?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.user_nim_nip?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.jenis_tiket.toLowerCase().includes(searchTerm.toLowerCase());
        const matchFilter = filterStatus === 'semua' || t.status === filterStatus;
        return matchSearch && matchFilter;
      })
      .sort((a: any, b: any) => {
        const diff = new Date(a.submission_date).getTime() - new Date(b.submission_date).getTime();
        return sortOrder === 'terlama' ? diff : -diff;
      });

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Antrean</h1>
          <p className="text-slate-500">Kelola permintaan layanan akademik dari mahasiswa.</p>
        </div>

        {/* Banner Ambil Tiket Berikutnya */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl bg-[#003366] p-5 text-white shadow-lg shadow-blue-900/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 border border-white/20">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-lg">
                {antreanCount > 0
                  ? `${antreanCount} tiket untuk level Anda menunggu di antrean`
                  : 'Tidak ada tiket di antrean untuk level Anda'}
              </p>
              <p className="text-sm text-blue-200">
                {antreanCount > 0
                  ? `Level ${levelLabel} — klik tombol untuk mengambil tiket terlama (FIFO).`
                  : `Level ${levelLabel} — semua tiket sudah tertangani.`}
              </p>
            </div>
          </div>
          <button
            onClick={this.handleAmbilTiket}
            disabled={antreanCount === 0 || claimLoading}
            className="shrink-0 flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#003366] shadow-sm transition hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {claimLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {claimLoading ? 'Mengambil...' : 'Ambil Tiket Berikutnya'}
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 sm:grid-cols-5">
          {[
            { label: 'Dalam Antrean', key: 'Dalam Antrean', color: 'border-orange-400' },
            { label: 'Diproses', key: 'Diproses', color: 'border-blue-400' },
            { label: 'Dalam Pembuatan', key: 'Dalam Pembuatan', color: 'border-purple-400' },
            { label: 'Selesai', key: 'Selesai', color: 'border-green-500' },
            { label: 'Ditolak', key: 'Ditolak', color: 'border-red-500' },
          ].map(({ label, key, color }) => (
            <div key={key} className={`rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200 border-l-4 ${color}`}>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">
                {myTickets.filter((t: any) => t.status === key).length}
              </p>
            </div>
          ))}
        </div>

        {/* Search, Filter, Sort */}
        <div className="flex flex-wrap items-center gap-3">
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
            onClick={() => this.setState({ sortOrder: sortOrder === 'terlama' ? 'terbaru' : 'terlama' })}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-300 bg-white hover:bg-slate-50 transition-colors"
          >
            {sortOrder === 'terlama' ? '↑ Terlama' : '↓ Terbaru'}
          </button>
        </div>

        {/* Tabel */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Mahasiswa</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Layanan</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tanggal Masuk</th>
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
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 text-sm">
                      Tidak ada tiket ditemukan.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ticket: any) => (
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
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/ticket/${ticket.id}`)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300"
                        >
                          Rincian <ChevronRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(withAuth(Queue));
