import { Component, type FormEvent, type ChangeEvent } from 'react';
import { Search, ChevronRight, FileText, Upload, AlertCircle, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';

class ApplyTicket extends Component<any, any> {
  // Data statis layanan (menggantikan import SERVICES eksternal)
  SERVICES = [
    { id: 1, name: 'Surat Keterangan Mahasiswa Aktif', description: 'Surat resmi yang menyatakan status mahasiswa aktif semester ini.' },
    { id: 2, name: 'Legalisir Ijazah / Transkrip', description: 'Pengajuan pengesahan fotokopi dokumen akademik.' },
    { id: 3, name: 'Permohonan Cuti Akademik', description: 'Pengajuan cuti sementara dari kegiatan perkuliahan.' },
    { id: 4, name: 'Permohonan Undur Diri', description: 'Prosedur resmi untuk berhenti menjadi mahasiswa IPB.' }
  ];

  // Data user dummy (menggantikan useAuth)
  user = {
    nama: 'Mahasiswa Demo',
    nim_nip: 'G640001'
  };

  constructor(props: any) {
    super(props);
    this.state = {
      selectedService: null,
      searchTerm: '',
      purpose: '',
      file: null,
      loading: false,
      success: false
    };
  }

  handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: e.target.value });
  };

  handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ file: e.target.files[0] });
    }
  };

  handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true });

    // Simulasi proses jaringan ke Backend selama 1.5 detik
    setTimeout(() => {
      this.setState({ loading: false, success: true });
      
      // Redirect ke halaman history setelah 2 detik
      setTimeout(() => {
        this.props.navigate('/history');
      }, 2000);
      
    }, 1500);
  };

  render() {
    const { selectedService, searchTerm, purpose, file, loading, success } = this.state;

    // Filter layanan berdasarkan pencarian
    const filteredServices = this.SERVICES.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- TAMPILAN 1: LAYAR SUKSES ---
    if (success) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-500">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Pengajuan Berhasil!</h2>
          <p className="mt-2 text-slate-500">Tiket Anda telah dikirim dan sedang dalam antrean.</p>
          <p className="mt-4 text-sm text-slate-400 italic">Mengalihkan ke halaman riwayat...</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold text-slate-900">Ajukan Tiket Layanan</h1>
          <p className="text-slate-500">Pilih jenis layanan akademik yang Anda butuhkan.</p>
        </div>

        {/* --- TAMPILAN 2: KATALOG LAYANAN --- */}
        {!selectedService ? (
          <div className="space-y-6">
            
            {/* Search Bar */}
            <div className="relative max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Cari layanan..."
                value={searchTerm}
                onChange={this.handleSearch}
                className="block w-full rounded-lg border-0 py-3 pl-10 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm outline-none transition-all"
              />
            </div>

            {/* Grid Katalog */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {filteredServices.map(service => (
                <button
                  key={service.id}
                  onClick={() => this.setState({ selectedService: service })}
                  className="group flex flex-col items-start rounded-xl bg-white p-6 text-left shadow-sm ring-1 ring-slate-200 transition-all hover:ring-[#003366] hover:shadow-md"
                >
                  <div className="mb-4 rounded-lg bg-blue-50 p-3 text-[#003366] group-hover:bg-[#003366] group-hover:text-white transition-colors">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-slate-900 leading-tight text-lg">{service.name}</h3>
                  <p className="mt-2 text-sm text-slate-500 flex-grow">{service.description}</p>
                  <div className="mt-6 flex items-center text-xs font-semibold text-[#003366] uppercase tracking-wider">
                    Pilih Layanan <ChevronRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          
          /* --- TAMPILAN 3: FORM PENGAJUAN --- */
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 lg:p-8 animate-in slide-in-from-right-8 duration-300">
            
            {/* Tombol Kembali */}
            <button 
              onClick={() => this.setState({ selectedService: null, purpose: '', file: null })}
              className="mb-6 flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-[#003366] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
            </button>

            {/* Judul Form */}
            <div className="mb-8 border-b border-slate-100 pb-6">
              <h2 className="text-xl font-bold text-[#003366]">{selectedService.name}</h2>
              <p className="mt-1 text-sm text-slate-500">Lengkapi formulir di bawah ini untuk memproses pengajuan Anda.</p>
            </div>

            <form onSubmit={this.handleSubmit} className="space-y-6">
              
              {/* Info User (Disabled) */}
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Nama Lengkap</label>
                  <input disabled value={this.user.nama} className="block w-full rounded-lg bg-slate-50 border-0 py-3 px-4 text-slate-500 ring-1 ring-inset ring-slate-200 sm:text-sm cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">NIM</label>
                  <input disabled value={this.user.nim_nip} className="block w-full rounded-lg bg-slate-50 border-0 py-3 px-4 text-slate-500 ring-1 ring-inset ring-slate-200 sm:text-sm cursor-not-allowed" />
                </div>
              </div>

              {/* Textarea Keperluan */}
              <div>
                <label htmlFor="purpose" className="block text-sm font-bold text-slate-700 mb-2">Alasan & Keperluan</label>
                <textarea
                  id="purpose"
                  rows={4}
                  required
                  value={purpose}
                  onChange={(e) => this.setState({ purpose: e.target.value })}
                  className="block w-full rounded-lg border-0 py-3 px-4 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm outline-none transition-all"
                  placeholder="Jelaskan secara singkat keperluan Anda..."
                />
              </div>

              {/* Upload Box */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Upload Berkas Syarat (.pdf, .jpg)</label>
                <div className={`mt-1 flex justify-center rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${file ? 'border-[#003366] bg-blue-50/30' : 'border-slate-300 hover:border-[#003366] bg-slate-50 hover:bg-slate-50/50'}`}>
                  <div className="text-center">
                    <Upload className={`mx-auto h-12 w-12 ${file ? 'text-[#003366]' : 'text-slate-400'}`} />
                    <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                      <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-bold text-[#003366] focus-within:outline-none hover:text-blue-700">
                        <span>Upload file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={this.handleFileChange} />
                      </label>
                      <p className="pl-1">atau drag and drop</p>
                    </div>
                    <p className="text-xs leading-5 text-slate-500 mt-1">PDF, PNG, JPG maksimal 10MB</p>
                    {file && (
                      <p className="mt-3 text-sm font-bold text-[#003366] bg-blue-100/50 inline-block px-3 py-1 rounded-full border border-blue-200">
                        {file.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="rounded-xl bg-blue-50 p-4 border border-blue-100">
                <div className="flex">
                  <AlertCircle className="h-5 w-5 text-[#003366]" />
                  <div className="ml-3">
                    <h3 className="text-sm font-bold text-[#003366]">Pastikan data sudah benar</h3>
                    <p className="mt-1 text-sm text-blue-800">Pengajuan yang sudah dikirim tidak dapat dibatalkan atau diubah. Pastikan dokumen yang diunggah dapat terbaca dengan jelas.</p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-xl bg-[#003366] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#002244] hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                  {loading ? 'Memproses...' : 'Kirim Pengajuan'}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(ApplyTicket);