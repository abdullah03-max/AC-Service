import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyOTPPage from './pages/VerifyOTPPage';
import ServicesPage from './pages/ServicesPage';
import BookingPage from './pages/BookingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import BookingDetailPage from './pages/BookingDetailPage';
import InvoicePage from './pages/InvoicePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <div className="min-h-screen mesh-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#00d4ff] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // If route is admin-only (roles only contains 'admin'), send to admin login.
    // Otherwise redirect to the public login/register flow.
    if (roles && roles.length === 1 && roles.includes('admin')) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'technician' ? '/technician' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'technician') return <Navigate to="/technician" />;
  return <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify" element={<VerifyOTPPage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/resetpassword/:token" element={<ResetPasswordPage />} />
      <Route path="/home" element={<DashboardRedirect />} />

      <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><UserDashboard /></ProtectedRoute>} />
      <Route path="/book/:serviceId" element={<ProtectedRoute roles={['user','admin']}><BookingPage /></ProtectedRoute>} />
      <Route path="/booking/:id" element={<ProtectedRoute><BookingDetailPage /></ProtectedRoute>} />
      <Route path="/invoice/:bookingId" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />

      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/*" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="/technician" element={<ProtectedRoute roles={['technician']}><TechnicianDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#111827',
              color: '#f1f5f9',
              borderRadius: '12px',
              fontSize: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            },
            success: {
              iconTheme: { primary: '#00d4ff', secondary: '#111827' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#111827' },
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
