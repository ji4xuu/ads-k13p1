import { Component, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Upload, CheckCircle2, XCircle, Loader2, FileCheck } from 'lucide-react';
import { ticketsApi } from '../api/tickets.api';

type ActionType = 'Reject' | 'Approve' | 'Complete';

const ACTION_CONFIG = {
  Reject: {
    title: 'Tolak Pengajuan',
    icon: <XCircle className="h-6 w-6" />,
    headerBg: 'bg-red-600',
    btnBg: 'bg-red-600 hover:bg-red-700 shadow-red-600/20',
    btnLabel: 'Kirim Penolakan',
    showFile: false,
    catatanRequired: true,
    catatanPlaceholder: 'Contoh: Dokumen lampiran tidak terbaca/buram. Mohon unggah ulang dengan resolusi min. 300dpi.',
  },
  Approve: {
    title: 'Setujui & Mulai Proses',
    icon: <CheckCircle2 className="h-6 w-6" />,
    headerBg: 'bg-blue-600',
    btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20',
    btnLabel: 'Setujui & Proses',
    showFile: false,
    catatanRequired: false,
    catatanPlaceholder: 'Opsional: pesan atau instruksi untuk mahasiswa...',
  },
  Complete: {
    title: 'Upload Dokumen & Tandai Selesai',
    icon: <FileCheck className="h-6 w-6" />,
    headerBg: 'bg-green-600',
    btnBg: 'bg-green-600 hover:bg-green-700 shadow-green-600/20',
    btnLabel: 'Tandai Selesai',
    showFile: true,
    catatanRequired: false,
    catatanPlaceholder: 'Opsional: instruksi pengambilan atau catatan tambahan...',
  },
};

class ActionModal extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      catatan: '',
      fileBalasan: null,
      actionLoading: false
    };
  }

  handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ fileBalasan: e.target.files[0] });
    }
  };

  handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    this.setState({ actionLoading: true });
    const { actionType, ticket } = this.props;
    const { catatan, fileBalasan } = this.state;
    try {
      let updated: any;
      if (actionType === 'Reject') {
        updated = await ticketsApi.reject(ticket.id, catatan);
      } else if (actionType === 'Approve') {
        updated = await ticketsApi.approve(ticket.id, catatan || undefined);
      } else {
        updated = await ticketsApi.complete(ticket.id, fileBalasan, catatan || undefined);
      }
      this.props.onSuccess?.(updated.status);
      this.handleClose();
    } catch (err: any) {
      alert(err.response?.data?.detail ?? 'Aksi gagal. Coba lagi.');
      this.setState({ actionLoading: false });
    }
  };

  handleClose = () => {
    this.setState({ catatan: '', fileBalasan: null, actionLoading: false });
    this.props.onClose();
  };

  render() {
    const { isOpen, ticket, actionType } = this.props;
    const { catatan, fileBalasan, actionLoading } = this.state;

    if (!isOpen || !ticket || !actionType) return null;

    const config = ACTION_CONFIG[actionType as ActionType];
    if (!config) return null;

    const modalContent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">

          <div className={`px-6 py-5 text-white flex items-center justify-between ${config.headerBg}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
              {config.icon} {config.title}
            </h3>
            <button
              onClick={this.handleClose}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={this.handleSubmit} className="p-8">
            <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                ID Tiket: <span className="text-slate-700">{ticket.id?.split('-')[0]}</span>
              </p>
              <p className="text-sm font-bold text-slate-900">
                Mahasiswa: {ticket.user_nama || ticket.studentName}
              </p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                  Catatan untuk Mahasiswa{' '}
                  {config.catatanRequired
                    ? <span className="text-red-500">*</span>
                    : <span className="text-slate-400 normal-case font-medium">(opsional)</span>}
                </label>
                <textarea
                  required={config.catatanRequired}
                  rows={4}
                  value={catatan}
                  onChange={(e) => this.setState({ catatan: e.target.value })}
                  className="w-full rounded-xl text-slate-800 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 p-4 outline-none transition-all resize-none shadow-sm ring-1 ring-slate-300"
                  placeholder={config.catatanPlaceholder}
                />
              </div>

              {config.showFile && (
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                    Upload Dokumen Hasil <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${fileBalasan ? 'border-[#003366] bg-blue-50' : 'border-slate-300 hover:border-[#003366] hover:bg-slate-50'}`}>
                    <input
                      type="file"
                      id="modal-upload"
                      className="sr-only"
                      required
                      onChange={this.handleFileChange}
                    />
                    <label htmlFor="modal-upload" className="cursor-pointer flex flex-col items-center gap-3">
                      <Upload className={`h-10 w-10 ${fileBalasan ? 'text-[#003366]' : 'text-slate-300'}`} />
                      <span className="text-sm font-bold text-slate-800">
                        {fileBalasan ? fileBalasan.name : 'Klik/Seret file PDF ke sini'}
                      </span>
                      <span className="text-xs font-medium text-slate-400">Maks. 10MB</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={this.handleClose}
                className="flex-1 rounded-xl border border-slate-200 py-3.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                disabled={actionLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className={`flex-1 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 hover:scale-[1.02] flex justify-center items-center gap-2 ${config.btnBg}`}
              >
                {actionLoading && <Loader2 className="animate-spin h-5 w-5" />}
                {actionLoading ? 'Memproses...' : config.btnLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }
}

export default ActionModal;