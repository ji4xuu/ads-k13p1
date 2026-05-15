import React, { Component } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/student/Dashboard';
import FaqPage from './pages/student/FaqPage';
import ApplyTicket from './pages/student/ApplyTicket';
import History from './pages/student/History';
import Queue from './pages/admin/Queue';
import TicketDetail from './pages/admin/TicketDetail';
import Header from './components/Header';

// MainLayout diubah menjadi Class Component
class MainLayout extends Component<{ children: React.ReactNode }> {
  render() {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col">
        <Header />
        <main className="flex-grow">{this.props.children}</main>
      </div>
    );
  }
}

// App utama diubah menjadi Class Component
export default class App extends Component {
  render() {
    return (
      <Router>
        <Routes>
          {/* Rute Publik */}
          <Route path="/" element={<Login />} />
          
          {/* Rute Student */}
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/faqs" element={<MainLayout><FaqPage /></MainLayout>} />
          <Route path="/form-layanan" element={<MainLayout><ApplyTicket /></MainLayout>} />
          <Route path="/history" element={<MainLayout><History /></MainLayout>} />

          {/* Rute Admin */}
          <Route path="/admin-dashboard" element={<MainLayout><Queue /></MainLayout>} />
          <Route path="/admin/ticket/:id" element={<MainLayout><TicketDetail /></MainLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    );
  }
}