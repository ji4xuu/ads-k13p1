import { Component } from 'react';
import { FilePlus, History, HelpCircle, ArrowRight } from 'lucide-react';
import { withRouter } from '../../utils/withRouter';

class Dashboard extends Component<any> {
  // Menu disimpan sebagai properti kelas
  menuItems = [
    {
      title: 'Ajukan Tiket',
      description: 'Mulai permohonan layanan akademik baru Anda di sini.',
      // Penyesuaian agar warna ikon berubah menjadi putih saat di-hover
      icon: <FilePlus className="h-8 w-8 text-[#003366] group-hover:text-white transition-colors" />,
      path: '/form-layanan', 
      color: 'bg-blue-50',
    },
    {
      title: 'Riwayat Pengajuan',
      description: 'Pantau status dan hasil dari tiket yang telah Anda ajukan.',
      icon: <History className="h-8 w-8 text-[#003366] group-hover:text-white transition-colors" />,
      path: '/history',
      color: 'bg-slate-50',
    },
    {
      title: 'Bantuan & FAQs',
      description: 'Temukan jawaban atas pertanyaan umum seputar layanan akademik.',
      icon: <HelpCircle className="h-8 w-8 text-[#003366] group-hover:text-white transition-colors" />,
      path: '/faqs',
      color: 'bg-indigo-50',
    },
  ];

  render() {
    const { navigate } = this.props;

    return (
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Halo, <span className="text-[#003366]">Mahasiswa Demo</span> 👋
          </h1>
          <p className="mt-2 text-lg text-slate-500">
            Selamat datang di IASH. Apa yang ingin Anda lakukan hari ini?
          </p>
        </div>

        {/* Grid Menu Kartu */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {this.menuItems.map((item) => (
            <button
              key={item.title}
              onClick={() => navigate(item.path)}
              className="group relative flex flex-col items-start overflow-hidden rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-xl hover:ring-[#003366] text-left"
            >
              {/* Wadah Ikon */}
              <div className={`mb-6 rounded-xl ${item.color} p-4 transition-colors group-hover:bg-[#003366] group-hover:text-white`}>
                {item.icon}
              </div>
              
              {/* Teks Konten */}
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#003366] transition-colors">
                {item.title}
              </h3>
              <p className="mt-3 text-slate-500 text-sm leading-relaxed">
                {item.description}
              </p>
              
              {/* Teks "Buka Layanan" yang muncul saat di-hover */}
              <div className="mt-8 flex items-center text-sm font-bold text-[#003366] opacity-0 transition-all group-hover:opacity-100 group-hover:translate-x-1">
                Buka Layanan <ArrowRight className="ml-2 h-4 w-4" />
              </div>

              {/* Ornamen Lingkaran Dekoratif di Pojok Kanan Bawah */}
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-[#003366]/5 transition-transform group-hover:scale-150" />
            </button>
          ))}
        </div>

        {/* Banner Bantuan Cepat */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003366]/10 text-[#003366]">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Butuh Bantuan Cepat?</h4>
              <p className="text-sm text-slate-500">Hubungi Helpdesk Direktorat Administrasi Pendidikan jika Anda mengalami kendala sistem.</p>
            </div>
          </div>
        </div>

      </div>
    );
  }
}

export default withRouter(Dashboard);