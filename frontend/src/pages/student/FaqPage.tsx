import { Component, type ChangeEvent } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle, Mail } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';

class FaqPage extends Component<any, any> {
  // Data statis FAQ
  FAQS = [
    {
      question: "Bagaimana cara login ke IASH?",
      answer: "Gunakan email IPB (@apps.ipb.ac.id) dan password yang telah diberikan oleh staf TU. Jika belum memiliki akun, hubungi TU Departemen atau TU Fakultas untuk pembuatan akun."
    },
    {
      question: "Bagaimana cara mengajukan tiket layanan?",
      answer: "Klik menu 'Ajukan Tiket' di navigasi atas. Pilih jenis layanan yang dibutuhkan, isi kolom keperluan dengan jelas, unggah berkas persyaratan jika diminta, lalu klik Kirim. Tiket Anda akan masuk ke antrean dan diproses oleh staf TU."
    },
    {
      question: "Apa arti masing-masing status tiket?",
      answer: "'Dalam Antrean' berarti tiket sudah diterima dan menunggu diambil staf. 'Diproses' berarti staf sedang menangani tiket Anda. 'Dalam Pembuatan' berarti dokumen sedang disiapkan. 'Selesai' berarti dokumen sudah dapat diunduh. 'Ditolak' berarti ada kekurangan — baca catatan staf untuk mengetahui alasannya."
    },
    {
      question: "Bagaimana cara mengunduh dokumen hasil?",
      answer: "Buka menu 'Riwayat Tiket', klik tiket yang berstatus Selesai, lalu klik tombol 'Unduh Dokumen'. File PDF akan otomatis terunduh ke perangkat Anda."
    },
    {
      question: "Apa yang harus dilakukan jika tiket saya ditolak?",
      answer: "Buka tiket yang ditolak di menu 'Riwayat Tiket' dan baca 'Catatan dari Staf TU'. Di sana tercantum alasan penolakan dan instruksi perbaikan. Ajukan tiket baru setelah melengkapi kekurangan yang disebutkan."
    },
    {
      question: "Apa bedanya 'Template Surat' dengan 'Ajukan Tiket'?",
      answer: "'Template Surat' berisi surat-surat yang dapat diurus sendiri tanpa perlu menunggu staf TU — cukup unduh template, isi data diri, lalu ajukan tanda tangan via DigiSign IPB. 'Ajukan Tiket' digunakan untuk layanan yang memerlukan verifikasi atau keputusan dari staf TU, seperti cuti akademik, pengunduran diri, atau legalisir."
    },
  ];

  constructor(props: any) {
    super(props);
    this.state = {
      openIndex: 0, // FAQ pertama otomatis terbuka
      search: ""
    };
  }

  handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({ search: e.target.value });
  };

  toggleFaq = (index: number) => {
    this.setState((prevState: any) => ({
      openIndex: prevState.openIndex === index ? null : index
    }));
  };

  render() {
    const { openIndex, search } = this.state;

    // Filter FAQ berdasarkan pencarian
    const filteredFaqs = this.FAQS.filter(faq => 
      faq.question.toLowerCase().includes(search.toLowerCase()) || 
      faq.answer.toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-50 rounded-2xl">
              <HelpCircle className="h-8 w-8 text-[#003366]" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Pusat Bantuan & FAQs</h1>
          <p className="mt-3 text-slate-500 text-lg">Temukan jawaban atas pertanyaan seputar layanan akademik IPB.</p>
        </div>

        {/* Search Bar */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Cari pertanyaan atau bantuan..."
            value={search}
            onChange={this.handleSearch}
            className="block w-full pl-12 pr-4 py-4 rounded-2xl border-0 shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[#003366] transition sm:text-sm outline-none"
          />
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq, index) => (
              <div 
                key={index} 
                className={`overflow-hidden rounded-2xl bg-white border transition-all duration-300 ${openIndex === index ? "border-[#003366] shadow-md ring-1 ring-[#003366]/10" : "border-slate-200 shadow-sm"}`}
              >
                <button
                  onClick={() => this.toggleFaq(index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className={`font-bold transition-colors ${openIndex === index ? "text-[#003366]" : "text-slate-800"}`}>
                    {faq.question}
                  </span>
                  {openIndex === index ? (
                    <ChevronUp className="h-5 w-5 text-[#003366] shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-400 shrink-0" />
                  )}
                </button>
                
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-6 pb-6 text-slate-600 leading-relaxed">
                    <div className="pt-2 border-t border-slate-100 flex gap-3">
                      <div className="mt-2 h-2 w-2 rounded-full bg-[#003366] shrink-0" />
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State untuk Pencarian */
            <div className="text-center py-12 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">Pertanyaan tidak ditemukan. Coba gunakan kata kunci lain.</p>
            </div>
          )}
        </div>

        {/* Contact Banner */}
        <div className="mt-16 p-8 rounded-3xl bg-[#003366] text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/10">
          <div className="text-center md:text-left">
            <h3 className="text-xl font-bold">Masih butuh bantuan lain?</h3>
            <p className="text-blue-100 mt-1">Tim ISC Helpcenter siap membantu kendala administrasi Anda.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://wa.me/6281234511395?text=Halo%20Admin%20ISC!%20ada%20sesuatu%20yang%20ingin%20saya%20tanyakan%2C%20bisa%20tolong%20bantu%20saya%3F"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-[#003366] rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors whitespace-nowrap"
            >
              <MessageCircle className="h-5 w-5" /> Chat ISC Helpcenter
            </a>
            <a
              href="mailto:ask@apps.ipb.ac.id"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white border border-white/30 rounded-xl font-bold hover:bg-white/20 transition-colors whitespace-nowrap"
            >
              <Mail className="h-5 w-5" /> Email
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(FaqPage);