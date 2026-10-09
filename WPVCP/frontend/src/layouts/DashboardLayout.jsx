import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';

export default function DashboardLayout({ allowedRoles }) {
  const { user, token, loading, role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const hasToken = token || localStorage.getItem('wpvcp_token');

  if (loading || (hasToken && !user)) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-main)',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: 44,
          height: 44,
          borderRadius: '50%',
          border: '3px solid var(--border)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 0.8s linear infinite'
        }} />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>Initializing your wedding dashboard...</p>
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not authenticated
  if (!hasToken || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role authorization check
  if (allowedRoles) {
    const isAllowed = allowedRoles.includes(role) || (role === 'ADMIN' && allowedRoles.includes('PLANNER'));
    if (!isAllowed) {
      if (role === 'ADMIN' || role === 'PLANNER') return <Navigate to="/planner/dashboard" replace />;
      if (role === 'VENDOR') return <Navigate to="/vendor/dashboard" replace />;
      return <Navigate to="/customer/dashboard" replace />;
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Sidebar with 18 navigations */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* Global Floating Role-Aware Chatbot */}
      <Chatbot />
    </div>
  );
}
