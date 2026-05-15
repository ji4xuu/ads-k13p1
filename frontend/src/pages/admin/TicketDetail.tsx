import { Component } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle2, XCircle, AlertCircle, Loader2, Upload } from 'lucide-react';
import ActionModal from '../../components/ActionModal';
import { withRouter } from '../../utils/withRouter';

class TicketDetail extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      ticket: null,
      loading: true,
      isModalOpen: false,
      actionType: null // 'Approve' | 'Reject' | null
    };
  }

  componentDidMount() {
    const { id } = this.props.params;

    // Simulasi pengambilan data detail tiket dari server
    setTimeout(() => {
      this.setState({
        loading: false,
        ticket: {
          id: id || '1b59918b-7255-4a88-be82-0d1a7394ba17',
          jenis_tiket: 'Legalisir Ijazah / Transkrip',
          status: 'Pending',
          user_nama: 'Mahasiswa Demo',
          user_nim_nip: 'G640001',
          submission_date: '2026-05-07T04:42:00Z',
          form_data: JSON.stringify({ purpose: 'Legalisir Ijazah untuk lamar kerja' }),
          file_syarat_path: 'berkas_dummy.pdf',
          catatan_tu: '',
          file_balasan_path: ''
        }
      });
    }, 1000);
  }

  handleOpenModal = (type: 'Approve' | 'Reject') => {
    this.setState({
      actionType: type,
      isModalOpen: true
    });
  };

  handleCloseModal = () => {
    this.setState({ isModalOpen: false });
    // Opsional: Kamu bisa menambahkan this.props.navigate('/admin-dashboard') di sini 
    // jika ingin otomatis kembali ke tabel setelah modal ditutup.
  };

  render() {
    const { ticket, loading, isModalOpen, actionType } = this.state;
    const { navigate } = this.props;

    if (loading) return <div className="flex justify-center py-24"><Loader2 className="animate-spin h-8 w-8 text-[#003366]" /></div>;
    if (!ticket) return <div className="text-center py-24 text-slate-500 font-medium">Tiket tidak ditemukan.</div>;

    const formData = JSON.parse(ticket.form_data);

    return (
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4 sm:px-6">
        
        {/* Tombol Kembali */}
        <button 
          onClick={() => navigate('/admin-dashboard')}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#003366] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Kembali ke Antrean
        </button>

        {/* Header Judul */}
        <div className="flex flex-col gap-2 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Detail Tiket</span>
            <span className="h-1 w-1 rounded-full bg-slate-300" />
            <span className="text-sm font-bold text-slate-500 font-mono">ID: {ticket.id.split('-')[0]}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900">{ticket.jenis_tiket}</h1>
        </div>

        {/* Layout Utama 2 Kolom Kiri, 1 Kolom Kanan */}
        <div className="grid gap-8 lg:grid-cols-3">
          
          {/* ================= AREA KIRI: DETAIL DATA ================= */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Kotak Isi Formulir */}
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

            {/* Kotak Dokumen Lampiran */}
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
                    onClick={(e) => { e.stopPropagation(); alert('Simulasi: Berkas Diunduh'); }}
                    className="rounded-lg bg-white p-2.5 text-slate-500 shadow-sm border border-slate-200 hover:text-white hover:bg-[#003366] hover:border-[#003366] transition-all group-hover:scale-105"
                    title="Unduh Berkas"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 text-slate-500 font-medium italic bg-slate-50 p-5 rounded-xl border-2 border-dashed border-slate-200">
                  <AlertCircle className="h-6 w-6 text-slate-400" /> Mahasiswa tidak melampirkan berkas fisik pendukung.
                </div>
              )}
            </section>
          </div>

          {/* ================= AREA KANAN: STATUS & AKSI ================= */}
          <div className="space-y-6">
            
            {/* Box Biru Status */}
            <section className="rounded-2xl bg-[#003366] p-6 text-white shadow-lg overflow-hidden relative">
              <div className="absolute top-0 right-0 -m-4 h-32 w-32 rounded-full bg-white opacity-5" />
              <h3 className="text-lg font-bold">Status Saat Ini</h3>
              <div className="mt-5 flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full animate-pulse ${
                  ticket.status === 'Pending' ? 'bg-orange-400' : 
                  ticket.status === 'Disetujui' ? 'bg-green-400' : 'bg-red-400'
                }`} />
                <span className="text-2xl font-black tracking-tight">{ticket.status}</span>
              </div>
              <p className="mt-5 text-xs font-bold text-blue-200 leading-relaxed uppercase tracking-widest border-t border-white/10 pt-4">
                {ticket.status === 'Pending' ? 'Sedang menunggu tindakan dari staf TU' : 'Proses telah selesai dilakukan.'}
              </p>
            </section>

            {/* Tombol Aksi Memanggil ActionModal */}
            {ticket.status === 'Pending' && (
              <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-500">
                <button
                  onClick={() => this.handleOpenModal('Reject')}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-sm font-bold text-red-700 transition-all hover:bg-red-100 hover:border-red-200 hover:scale-[1.02]"
                >
                  <XCircle className="h-6 w-6 mb-1" /> Tolak
                </button>
                <button
                  onClick={() => this.handleOpenModal('Approve')}
                  className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-green-600 border-2 border-green-600 p-4 text-sm font-bold text-white shadow-md transition-all hover:bg-green-700 hover:border-green-700 hover:scale-[1.02]"
                >
                  <CheckCircle2 className="h-6 w-6 mb-1" /> Setujui
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Memanggil Komponen Modal Terpisah */}
        <ActionModal 
          isOpen={isModalOpen} 
          onClose={this.handleCloseModal} 
          ticket={ticket} 
          actionType={actionType} 
        />

      </div>
    );
  }
}

export default withRouter(TicketDetail);