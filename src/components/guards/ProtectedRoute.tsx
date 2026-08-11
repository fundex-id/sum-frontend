import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  // Tampilkan layar loading saat Context masih mengecek LocalStorage di awal refresh
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-5 h-5 border-2 border-slate-300 border-t-[#090f26] rounded-full animate-spin"></div>
          <span className="text-sm font-medium">Memverifikasi sesi...</span>
        </div>
      </div>
    );
  }

  // Jika tidak terautentikasi, tendang kembali ke halaman Login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Jika aman, render rute anak-anaknya (seperti DashboardLayout)
  return <Outlet />;
}