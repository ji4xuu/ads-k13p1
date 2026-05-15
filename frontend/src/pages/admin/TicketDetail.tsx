import { Component } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle2, XCircle, AlertCircle, Loader2, Upload, RefreshCw } from 'lucide-react';
import ActionModal from '../../components/ActionModal';
import { withRouter } from '../../utils/withRouter';
import { ticketsApi } from '../../api/tickets.api';

class TicketDetail extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      ticket: null,
      loading: true,
      isModalOpen: false,
      actionType: null,
      claimLoading: false,
      downloadLoading: false,
    };
  }

  componentDidMount() {
    const { id } = this.props.params;
    if (id) {
      ticketsApi.getById(id)
        .then((ticket) => this.setState({ ticket, loading: false }))
        .catch(() => this.setState({ loading: false }));
    }
  }

  handleOpenModal = (type: 'Approve' | 'Reject' | 'Complete') => {
    this.setState({ actionType: type, isModalOpen: true });
  };

  handleCloseModal = () => {
    this.setState({ isModalOpen: false });
  };

  handleClaim = async () => {
    this.setState({ claimLoading: true });
    try {
      const updated = await ticketsApi.claimSpecific(this.state.ticket.id);
      this.setState({ ticket: updated, claimLoading: false });
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Gagal mengambil tiket.');
      this.setState({ claimLoading: false });
    }
  };

  handleDownloadSyarat = async () => {
    this.setState({ downloadLoading: true });
    try {
      await ticketsApi.downloadFile(this.state.ticket.id, 'syarat');
    } catch {
      alert('Gagal mengunduh berkas.');
    } finally {
      this.setState({ downloadLoading: false });
    }
  };

  handleStatusUpdate = (newStatus: string) => {
    this.setState((prev: any) => ({
      ticket: { ...prev.ticket, status: newStatus },
    }));
  };

  renderStatusStepper = () => {
    const { ticket } = this.state;
    const status = ticket.status;
    const isRejected = status === 'Ditolak';

    const normalSteps = [
      { key: 'dalam_antrean',   label: 'Dalam Antrean',   dotBg: 'bg-orange-400', lineBg: 'bg-orange-200', textColor: 'text-orange-700' },
      { key: 'diproses',        label: 'Diproses',        dotBg: 'bg-blue-500',   lineBg: 'bg-blue-200',   textColor: 'text-blue-700'   },
      { key: 'dalam_pembuatan', label: 'Dalam Pembuatan', dotBg: 'bg-purple-500', lineBg: 'bg-purple-200', textColor: 'text-purple-700' },
      { key: 'selesai',         label: 'Selesai',         dotBg: 'bg-green-500',  lineBg: 'bg-green-200',  textColor: 'text-green-700'  },
    ];

    const rejectedSteps = [
      { key: 'dalam_antrean', label: 'Dalam Antrean', dotBg: 'bg-orange-400', lineBg: 'bg-orange-200', textColor: 'text-orange-700' },
      { key: 'diproses',      label: 'Diproses',      dotBg: 'bg-blue-500',   lineBg: 'bg-blue-200',   textColor: 'text-blue-700'   },
      { key: 'ditolak',       label: 'Ditolak',       dotBg: 'bg-red-500',    lineBg: 'bg-red-200',    textColor: 'text-red-700'    },
    ];

    const steps = isRejected ? rejectedSteps : normalSteps;

    const ORDER: Record<string, number> = {
      'Dalam Antrean': 0,
      'Diproses': 1,
      'Dalam Pembuatan': 2,
      'Ditolak': 2,
      'Selesai': 3,
    };
    const currentOrder = ORDER[status] ?? 0;

    return (
      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-5">Alur Proses</h3>
        {steps.map((step, idx) => {
          const isDone = idx < currentOrder;
          const isCurrent = idx === currentOrder;
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 text-white
                  ${isDone || isCurrent ? step.dotBg : 'bg-slate-100'}
                  ${isCurrent ? 'shadow-md' : ''}`}>
                  {isDone
                    ? <CheckCircle2 className="h-4 w-4" />
                    : <span className={`text-xs font-black ${!isCurrent ? 'text-slate-400' : ''}`}>{idx + 1}</span>}
                </div>
                {!isLast && <div className={`w-0.5 h-7 ${isDone ? step.lineBg : 'bg-slate-100'}`} />}
              </div>
              <p className={`text-sm font-bold mt-1 pb-2
                ${isCurrent ? step.textColor : isDone ? 'text-slate-500' : 'text-slate-300'}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </section>
    );
  };

  getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Dalam Antrean':
        return { label: 'Dalam Antrean', dot: 'bg-orange-400', desc: 'Sedang menunggu diambil oleh staf TU.' };
      case 'Diproses':
        return { label: 'Diproses', dot: 'bg-blue-400', desc: 'Staf TU sedang meninjau kelengkapan berkas.' };
      case 'Dalam Pembuatan':
        return { label: 'Dalam Pembuatan', dot: 'bg-purple-400', desc: 'Berkas disetujui. Dokumen sedang dibuat.' };
      case 'Ditolak':
        return { label: 'Ditolak', dot: 'bg-red-400', desc: 'Pengajuan ditolak. Lihat catatan dari TU.' };
      case 'Selesai':
        return { label: 'Selesai', dot: 'bg-green-400', desc: 'Proses selesai. Mahasiswa dapat mengunduh dokumen.' };
      default:
        return { label: status, dot: 'bg-slate-400', desc: '' };
    }
  };

  render() {
    const { ticket, loading, isModalOpen, actionType, claimLoading, downloadLoading } = this.state;
    const { navigate } = this.props;

    if (loading) return (
      <div className="flex justify-center py-24">
        <Loader2 className="animate-spin h-8 w-8 text-[#003366]" />
      </div>
    );
    if (!ticket) return (
      <div className="text-center py-24 text-slate-500 font-medium">Tiket tidak ditemukan.</div>
    );

    const formData = JSON.parse(ticket.form_data);
    const statusDisplay = this.getStatusDisplay(ticket.status);

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4 sm:px-6">

        <button
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#003366] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Antrean
        </button>

        <div className="flex flex-col gap-2 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Detail Tiket</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-sm font-bold text-slate-500 font-mono">ID: {ticket.id.split('-')[0]}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{ticket.jenis_tiket}</h1>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Kiri: Detail Data */}
          <div className="lg:col-span-2 space-y-8">

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
              <h3 className="mb-6 text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-[#003366]" /> Isi Formulir
              </h3>
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Mahasiswa</p>
                    <p className="mt-1 font-bold text-slate-900 text-lg">{ticket.user_nama}</p>
                    <p className="text-sm font-medium text-slate-500">{ticket.user_nim_nip}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">Tanggal Masuk</p>
                    <p className="mt-1 font-bold text-slate-900">
                      {new Date(ticket.submission_date).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">Alasan & Keperluan</p>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed font-medium">
                      {formData.purpose}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8">
              <h3 className="mb-6 text-lg font-bold text-slate-900 flex items-center gap-2">
                <Upload className="h-5 w-5 text-[#003366]" /> Berkas Syarat Mahasiswa
              </h3>
              {ticket.file_syarat_path ? (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200 transition hover:bg-blue-50 hover:ring-blue-200 cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-white p-3 shadow-sm border border-slate-200 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Berkas_Syarat_Mahasiswa.pdf</p>
                      <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">Dokumen Pendukung</p>
                    </div>
                  </div>
                  <button
                    onClick={this.handleDownloadSyarat}
                    disabled={downloadLoading}
                    className="rounded-lg bg-white p-2.5 text-slate-500 shadow-sm border border-slate-200 hover:text-white hover:bg-[#003366] hover:border-[#003366] transition-all disabled:opacity-50"
                    title="Unduh Berkas"
                  >
                    {downloadLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-500 font-medium italic bg-slate-50 p-5 rounded-xl border-2 border-dashed border-slate-200">
                  <AlertCircle className="h-6 w-6 text-slate-400" /> Mahasiswa tidak melampirkan berkas pendukung.
                </div>
              )}
            </section>
          </div>

          {/* Kanan: Status & Aksi */}
          <div className="space-y-6">

            <section className="rounded-2xl bg-[#003366] p-6 text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 -m-4 h-32 w-32 rounded-full bg-white opacity-5" />
              <h3 className="text-lg font-bold">Status Saat Ini</h3>
              <div className="mt-5 flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full animate-pulse ${statusDisplay.dot}`} />
                <span className="text-2xl font-black tracking-tight">{statusDisplay.label}</span>
              </div>
              <p className="mt-5 text-xs font-bold text-blue-200 leading-relaxed uppercase tracking-widest border-t border-white/10 pt-4">
                {statusDisplay.desc}
              </p>
            </section>

            {this.renderStatusStepper()}

            {/* Tombol Aksi — tampil sesuai status */}
            {ticket.status === 'Diproses' && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <button
                  onClick={() => this.handleOpenModal('Reject')}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-200 hover:scale-[1.02]"
                >
                  <XCircle className="h-6 w-6 mb-1" /> Tolak
                </button>
                <button
                  onClick={() => this.handleOpenModal('Approve')}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-blue-600 border-2 border-blue-600 p-4 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-700 hover:border-blue-700 hover:scale-[1.02]"
                >
                  <CheckCircle2 className="h-6 w-6 mb-1" /> Setujui & Proses
                </button>
              </div>
            )}

            {ticket.status === 'Dalam Pembuatan' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <button
                  onClick={() => this.handleOpenModal('Complete')}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl bg-green-600 border-2 border-green-600 p-5 text-sm font-bold text-white shadow-md transition-all hover:bg-green-700 hover:border-green-700 hover:scale-[1.02]"
                >
                  <Upload className="h-6 w-6 mb-1" />
                  Upload Dokumen & Tandai Selesai
                </button>
              </div>
            )}

            {ticket.status === 'Selesai' && (
              <div className="rounded-xl bg-green-50 border border-green-100 p-4 flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                <p className="text-sm font-medium text-green-800">Tiket ini telah selesai diproses.</p>
              </div>
            )}

            {ticket.status === 'Ditolak' && (
              <div className="rounded-xl bg-red-50 border border-red-100 p-4 flex items-center gap-3">
                <XCircle className="h-5 w-5 text-red-600 shrink-0" />
                <p className="text-sm font-medium text-red-800">Tiket ini telah ditolak.</p>
              </div>
            )}

            {ticket.status === 'Dalam Antrean' && (
              <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <button
                  onClick={this.handleClaim}
                  disabled={claimLoading}
                  className="w-full flex flex-col items-center justify-center gap-2 rounded-2xl bg-[#003366] border-2 border-[#003366] p-5 text-sm font-bold text-white shadow-md transition-all hover:bg-[#002244] hover:border-[#002244] hover:scale-[1.02] disabled:opacity-50"
                >
                  {claimLoading
                    ? <Loader2 className="h-6 w-6 animate-spin" />
                    : <RefreshCw className="h-6 w-6 mb-1" />}
                  {claimLoading ? 'Mengambil...' : 'Ambil & Mulai Proses Tiket Ini'}
                </button>
              </div>
            )}
          </div>
        </div>

        <ActionModal
          isOpen={isModalOpen}
          onClose={this.handleCloseModal}
          onSuccess={this.handleStatusUpdate}
          ticket={ticket}
          actionType={actionType}
        />

      </div>
    );
  }
}

export default withRouter(TicketDetail);
