import { Component, type FormEvent } from 'react';
import { Lock, Mail, GraduationCap, Loader2, AlertCircle } from 'lucide-react';
import { withRouter } from '../utils/withRouter';

class Login extends Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      username: '',
      password: '',
      loading: false,
      error: ''
    };
  }

  handleLogin = (e: FormEvent) => {
    e.preventDefault();
    this.setState({ loading: true, error: '' });

    const { username, password } = this.state;
    const { navigate } = this.props;

    // Simulasi proses jaringan (API belum siap)
    setTimeout(() => {
      // Logika Smart Redirect
      if (username === 'mahasiswa_demo@apps.ipb.ac.id' && password === 'mahasiswa123') {
        navigate('/dashboard');
      } else if (username === 'staff_demo@apps.ipb.ac.id' && password === 'admin123') {
        navigate('/admin-dashboard');
      } else {
        this.setState({
          error: 'Username atau password salah. (Gunakan akun demo)',
          loading: false
        });
      }
    }, 1500); // Simulasi delay 1.5 detik
  };

  render() {
    const { username, password, loading, error } = this.state;

    return (
      <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-slate-50">
        <div className="w-full max-w-[440px] animate-in fade-in zoom-in duration-500">
          
          {/* Bagian Header Logo */}
          <div className="mb-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[#003366] text-white shadow-xl shadow-blue-900/20">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-[#003366] sm:text-3xl">IASH</h1>
            <p className="mt-1 text-sm font-bold uppercase tracking-widest text-slate-400">IPB Academic Service Helper</p>
          </div>

          {/* Kartu Login Utama */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-2xl shadow-slate-200 ring-1 ring-slate-200">
            <div className="p-8 sm:p-10">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-slate-900">Selamat Datang</h2>
                <p className="text-sm text-slate-500 mt-1">Silakan masuk dengan akun IPB Anda.</p>
              </div>

              <form onSubmit={this.handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email IPB</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="email"
                      required
                      value={username}
                      onChange={(e) => this.setState({ username: e.target.value })}
                      className="block w-full rounded-2xl border-0 py-3.5 pl-12 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm transition-all outline-none"
                      placeholder="nama@apps.ipb.ac.id"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Password</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => this.setState({ password: e.target.value })}
                      className="block w-full rounded-2xl border-0 py-3.5 pl-12 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-[#003366] sm:text-sm transition-all outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-[#003366] px-4 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-[#002244] hover:shadow-xl disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Masuk Sekarang
                      <div className="absolute inset-0 translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-500 group-hover:-translate-x-full" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-10 text-center space-y-6">
                <p className="text-xs font-medium text-slate-400">
                  Lupa password? <span className="text-[#003366] font-bold hover:underline cursor-pointer">Hubungi Helpdesk ICT IPB</span>
                </p>
                
                <div className="flex items-center justify-center gap-4 border-t border-slate-100 pt-8">
                  <img src="https://www.ipb.ac.id/wp-content/uploads/2023/12/Logo-IPB-University_Horizontal.png" alt="IPB" className="h-10" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Demo Credentials Box */}
          <div className="mt-8 rounded-2xl bg-blue-50/50 p-5 border border-blue-100 backdrop-blur-sm">
            <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest text-center mb-3">Akun Demo</p>
            <div className="grid grid-cols-2 gap-4 text-[11px] text-blue-700/80">
              <div className="space-y-1 text-center">
                <p className="font-black text-blue-900">Mahasiswa:</p>
                <p className="truncate">mahasiswa_demo@apps.ipb.ac.id</p>
                <p className="text-xs font-mono">mahasiswa123</p>
              </div>
              <div className="space-y-1 text-center border-l border-blue-200">
                <p className="font-black text-blue-900">Staf TU:</p>
                <p className="truncate">staff_demo@apps.ipb.ac.id</p>
                <p className="text-xs font-mono">admin123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default withRouter(Login);