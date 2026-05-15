import { Component, type ChangeEvent, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { Upload, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

class ActionModal extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      catatanTu: '',
      fileBalasan: null,
      actionLoading: false
    };
  }

  handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ fileBalasan: e.target.files[0] });
    }
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.setState({ actionLoading: true });

    // Simulasi pengiriman data
    setTimeout(() => {
      this.setState({ actionLoading: false });
      alert(`Berhasil! Tiket ${this.props.ticket?.id} telah di-${this.props.actionType === 'Approve' ? 'setujui' : 'tolak'}.`);
      this.handleClose();
    }, 1500);
  };

  handleClose = () => {
    // Reset state form saat ditutup
    this.setState({ catatanTu: '', fileBalasan: null, actionLoading: false });
    this.props.onClose();
  };

  render() {
    const { isOpen, ticket, actionType } = this.props;
    const { catatanTu, fileBalasan, actionLoading } = this.state;

    // Jika tidak buka, jangan render apapun
    if (!isOpen || !ticket || !actionType) return null;

    const isApprove = actionType === 'Approve';

    // Isi Konten Modal
    const modalContent = (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        
        <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
          
          {/* Bagian Header Modal */}
          <div className={`px-6 py-5 text-white flex items-center justify-between ${isApprove ? "bg-green-600" : "bg-red-600"}`}>
            <h3 className="text-xl font-bold flex items-center gap-2">
              {isApprove ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
              {isApprove ? 'Setujui Pengajuan' : 'Tolak Pengajuan'}
            </h3>
            <button 
              onClick={this.handleClose} 
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
          
          {/* Bagian Form Modal */}
          <form onSubmit={this.handleSubmit} className="p-8">
            
            {/* Info Singkat Tiket */}
            <div className="mb-6 rounded-xl bg-slate-50 p-4 border border-slate-100 flex flex-col gap-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">ID Tiket: <span className="text-slate-700">{ticket.id.split('-')[0]}</span></p>
              <p className="text-sm font-bold text-slate-900">Mahasiswa: {ticket.user_nama || ticket.studentName}</p>
            </div>

            <div className="space-y-6">
              
              {/* Textarea Catatan */}
              <div>
                <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                  Catatan untuk Mahasiswa <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={catatanTu}
                  onChange={(e) => this.setState({ catatanTu: e.target.value })}
                  className="w-full rounded-xl border-slate-300 text-slate-800 focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 p-4 outline-none transition-all resize-none shadow-sm"
                  placeholder={isApprove 
                    ? "Contoh: Surat sudah ditandatangani dan dapat diambil di loket TU..." 
                    : "Contoh: Mohon maaf, dokumen lampiran tidak terbaca/buram..."}
                />
              </div>

              {/* Upload Balasan (Hanya Wajib Jika Setuju) */}
              {isApprove && (
                <div>
                  <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wide">
                    Upload Dokumen Balasan <span className="text-red-500">*</span>
                  </label>
                  <div className={`border-2 border-dashed rounded-2xl p-8 text-center transition-colors ${fileBalasan ? 'border-[#003366] bg-blue-50' : 'border-slate-300 hover:border-[#003366] hover:bg-slate-50'}`}>
                    <input 
                      type="file" 
                      id="modal-upload" 
                      className="sr-only" 
                      required={isApprove}
                      onChange={this.handleFileChange}
                    />
                    <label 
                      htmlFor="modal-upload" 
                      className="cursor-pointer flex flex-col items-center gap-3"
                    >
                      <Upload className={`h-10 w-10 ${fileBalasan ? 'text-[#003366]' : 'text-slate-300'}`} />
                      <span className="text-sm font-bold text-slate-800 border-b border-transparent hover:border-slate-800">
                        {fileBalasan ? fileBalasan.name : 'Klik/Seret file PDF ke sini'}
                      </span>
                      <span className="text-xs font-medium text-slate-400">Wajib diunggah (Max 10MB)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Tombol Aksi Bawah */}
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
                className={`flex-1 rounded-xl py-3.5 text-sm font-bold text-white shadow-lg transition-all disabled:opacity-50 disabled:hover:scale-100 hover:scale-[1.02] flex justify-center items-center gap-2 ${isApprove ? "bg-green-600 hover:bg-green-700 shadow-green-600/20" : "bg-red-600 hover:bg-red-700 shadow-red-600/20"}`}
              >
                {actionLoading ? <Loader2 className="animate-spin h-5 w-5" /> : null}
                {actionLoading ? 'Memproses...' : 'Kirim Konfirmasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );

    // Menteleportasi modal langsung ke tag <body> HTML
    return createPortal(modalContent, document.body);
  }
}

export default ActionModal;