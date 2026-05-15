import { Component } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogOut, User, LayoutGrid, FilePlus, History, HelpCircle, Inbox } from 'lucide-react';
import { withRouter } from '../utils/withRouter';
import { withAuth } from '../utils/withAuth';

class Header extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      isMobileMenuOpen: false
    };
  }

  isActive = (path: string) => {
    return this.props.location?.pathname === path;
  };

  handleLogout = () => {
    this.props.auth.logout();
    this.props.navigate('/');
  };

  toggleMobileMenu = () => {
    this.setState((prevState: any) => ({
      isMobileMenuOpen: !prevState.isMobileMenuOpen
    }));
  };

  render() {
    const { isMobileMenuOpen } = this.state;
    const { navigate, location } = this.props;
    
    const isAdmin = location?.pathname.includes('/admin');

    return (
      <header className="bg-[#003366] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* KUNCI PERBAIKAN: Membungkus Logo dan Navigasi dalam satu grup flex di sebelah kiri */}
            <div className="flex items-center gap-10">
              
              {/* Bagian Kiri: Logo IASH Academic Helper */}
              <div className="flex-shrink-0 flex items-center cursor-pointer gap-2" onClick={() => navigate(isAdmin ? '/admin-dashboard' : '/dashboard')}>
                <div className="bg-white px-2 py-1 rounded text-[#003366] font-black text-sm tracking-widest">
                  IASH
                </div>
                <span className="text-white font-bold text-lg hidden sm:block">Academic Helper</span>
              </div>

              {/* Bagian Tengah -> Kiri: Menu Navigasi (Desktop) */}
              <nav className="hidden md:flex space-x-6">
                {isAdmin ? (
                  <Link to="/admin-dashboard" className={`flex items-center gap-2 text-sm font-medium transition-all py-1 border-b-2 ${this.isActive('/admin-dashboard') ? 'text-white border-white' : 'text-white/70 hover:text-white border-transparent hover:border-white/30'}`}>
                    <Inbox className="w-4 h-4" /> Dashboard Antrean
                  </Link>
                ) : (
                  <>
                    <Link to="/dashboard" className={`flex items-center gap-2 text-sm font-medium transition-all py-1 border-b-2 ${this.isActive('/dashboard') ? 'text-white border-white' : 'text-white/70 hover:text-white border-transparent hover:border-white/30'}`}>
                      <LayoutGrid className="w-4 h-4" /> Beranda
                    </Link>
                    <Link to="/form-layanan" className={`flex items-center gap-2 text-sm font-medium transition-all py-1 border-b-2 ${this.isActive('/form-layanan') ? 'text-white border-white' : 'text-white/70 hover:text-white border-transparent hover:border-white/30'}`}>
                      <FilePlus className="w-4 h-4" /> Ajukan Tiket
                    </Link>
                    <Link to="/history" className={`flex items-center gap-2 text-sm font-medium transition-all py-1 border-b-2 ${this.isActive('/history') ? 'text-white border-white' : 'text-white/70 hover:text-white border-transparent hover:border-white/30'}`}>
                      <History className="w-4 h-4" /> Riwayat Tiket
                    </Link>
                    <Link to="/faqs" className={`flex items-center gap-2 text-sm font-medium transition-all py-1 border-b-2 ${this.isActive('/faqs') ? 'text-white border-white' : 'text-white/70 hover:text-white border-transparent hover:border-white/30'}`}>
                      <HelpCircle className="w-4 h-4" /> FAQs
                    </Link>
                  </>
                )}
              </nav>
            </div>

            {/* Bagian Kanan: Profil & Logout (Desktop) */}
            <div className="hidden md:flex items-center gap-5">
              
              {/* Info User */}
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right hidden lg:flex">
                  <span className="text-sm font-bold text-white">{this.props.auth.user?.nama ?? '—'}</span>
                  <span className="text-[10px] text-white/70 tracking-wider">{this.props.auth.user?.nim_nip ?? ''}</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <User className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Garis Pemisah */}
              <div className="w-px h-8 bg-white/20"></div>

              {/* Tombol Logout */}
              <button 
                onClick={this.handleLogout}
                className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 transition-colors px-4 py-2 rounded-lg text-white text-sm font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>

            {/* Tombol Hamburger Menu (Mobile) */}
            <div className="md:hidden flex items-center">
              <button onClick={this.toggleMobileMenu} className="text-white/70 hover:text-white focus:outline-none">
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Menu Mobile */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-[#002244] shadow-inner border-t border-white/10">
            <div className="px-4 pt-4 pb-6 space-y-2">
              {isAdmin ? (
                <Link to="/admin-dashboard" onClick={this.toggleMobileMenu} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${this.isActive('/admin-dashboard') ? 'bg-white/10 text-white border-l-4 border-white' : 'text-white/70 border-l-4 border-transparent'}`}>
                  <Inbox className="w-5 h-5" /> Dashboard Antrean
                </Link>
              ) : (
                <>
                  <Link to="/dashboard" onClick={this.toggleMobileMenu} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${this.isActive('/dashboard') ? 'bg-white/10 text-white border-l-4 border-white' : 'text-white/70 border-l-4 border-transparent'}`}>
                    <LayoutGrid className="w-5 h-5" /> Beranda
                  </Link>
                  <Link to="/form-layanan" onClick={this.toggleMobileMenu} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${this.isActive('/form-layanan') ? 'bg-white/10 text-white border-l-4 border-white' : 'text-white/70 border-l-4 border-transparent'}`}>
                    <FilePlus className="w-5 h-5" /> Ajukan Tiket
                  </Link>
                  <Link to="/history" onClick={this.toggleMobileMenu} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${this.isActive('/history') ? 'bg-white/10 text-white border-l-4 border-white' : 'text-white/70 border-l-4 border-transparent'}`}>
                    <History className="w-5 h-5" /> Riwayat Tiket
                  </Link>
                  <Link to="/faqs" onClick={this.toggleMobileMenu} className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${this.isActive('/faqs') ? 'bg-white/10 text-white border-l-4 border-white' : 'text-white/70 border-l-4 border-transparent'}`}>
                    <HelpCircle className="w-5 h-5" /> FAQs
                  </Link>
                </>
              )}
              
              <div className="w-full h-px bg-white/10 my-4"></div>
              
              <div className="flex items-center gap-3 px-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-white">{this.props.auth.user?.nama ?? '—'}</span>
                  <span className="text-xs text-white/70">{this.props.auth.user?.nim_nip ?? ''}</span>
                </div>
              </div>

              <button onClick={this.handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 text-white transition-colors px-4 py-3 rounded-lg text-sm font-medium border border-red-500/30">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }
}

export default withRouter(withAuth(Header));