import { Component, type ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext, type AuthContextType } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
import FaqPage from './pages/student/FaqPage';
import ApplyTicket from './pages/student/ApplyTicket';
import History from './pages/student/History';
import Queue from './pages/admin/Queue';
import TicketDetail from './pages/admin/TicketDetail';
import Header from './components/Header';

class MainLayout extends Component<{ children: ReactNode }> {
  render() {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col">
        <Header />
        <main className="flex-grow">{this.props.children}</main>
      </div>
    );
  }
}

// Guard: redirect ke "/" jika belum login, atau ke halaman sesuai role jika akses rute yang salah
class ProtectedRoute extends Component<{ children: ReactNode; role?: 'mahasiswa' | 'staff' }> {
  static contextType = AuthContext;
  declare context: AuthContextType;

  render() {
    const { isAuthenticated, user } = this.context;
    if (!isAuthenticated) return <Navigate to="/" replace />;

    const isStaff = user?.role !== 'mahasiswa';
    if (this.props.role === 'mahasiswa' && isStaff) return <Navigate to="/admin-dashboard" replace />;
    if (this.props.role === 'staff' && !isStaff) return <Navigate to="/dashboard" replace />;

    return <>{this.props.children}</>;
  }
}

export default class App extends Component {
  render() {
    return (
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />

            <Route path="/dashboard" element={
              <ProtectedRoute role="mahasiswa"><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
            } />
            <Route path="/faqs" element={
              <ProtectedRoute role="mahasiswa"><MainLayout><FaqPage /></MainLayout></ProtectedRoute>
            } />
            <Route path="/form-layanan" element={
              <ProtectedRoute role="mahasiswa"><MainLayout><ApplyTicket /></MainLayout></ProtectedRoute>
            } />
            <Route path="/history" element={
              <ProtectedRoute role="mahasiswa"><MainLayout><History /></MainLayout></ProtectedRoute>
            } />

            <Route path="/admin-dashboard" element={
              <ProtectedRoute role="staff"><MainLayout><Queue /></MainLayout></ProtectedRoute>
            } />
            <Route path="/admin/ticket/:id" element={
              <ProtectedRoute role="staff"><MainLayout><TicketDetail /></MainLayout></ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    );
  }
}
