import { Component, type ChangeEvent } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageCircle } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';

class FaqPage extends Component<any, any> {
  // Data statis FAQ
  FAQS = [
    {
      question: "Bagaimana cara melacak status pengajuan saya?",
      answer: "Anda dapat melihat status terbaru melalui menu 'Riwayat Tiket'. Status akan diperbarui secara real-time oleh Staf TU dari Status 'Pending' menjadi 'Disetujui' atau 'Ditolak'."
    },
    {
      question: "Berapa lama waktu proses administrasi di IASH?",
      answer: "Rata-rata waktu pemrosesan adalah 1-3 hari kerja, tergantung pada jenis layanan dan kelengkapan berkas yang Anda unggah."
    },
    {
      question: "Apa yang harus dilakukan jika pengajuan saya ditolak?",
      answer: "Klik pada baris riwayat tiket Anda untuk melihat 'Catatan dari Staf TU'. Di sana akan tertera alasan penolakan dan instruksi perbaikan. Anda dapat mengajukan ulang tiket baru setelah melengkapi kekurangan tersebut."
    },
    {
      question: "Apakah saya bisa membatalkan tiket yang sudah terlanjur dikirim?",
      answer: "Saat ini sistem tidak mendukung pembatalan mandiri. Jika terjadi kesalahan fatal, segera hubungi Helpdesk DSITD atau datang ke loket TU terkait untuk pembatalan manual."
    }
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
            <p className="text-blue-100 mt-1">Tim kami siap membantu kendala administrasi Anda.</p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white text-[#003366] rounded-xl font-bold shadow-sm hover:bg-blue-50 transition-colors">
            <MessageCircle className="h-5 w-5" /> Hubungi Helpdesk
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(FaqPage);