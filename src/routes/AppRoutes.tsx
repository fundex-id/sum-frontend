import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import DashboardLayout from '../components/layouts/DashboardLayout';
import MonitoringDashboard from '../features/dashboard/pages/MonitoringDashboard';
import { BreadcrumbProvider } from '../contexts/BreadcrumbContext';

// 1. IMPORT Halaman Repayment Dashboard yang Baru Kita Bikin
import RepaymentDashboardPage from '../features/repayment/security/pages/RepaymentDashboardPage';
import RepaymentDetailPage from '../features/repayment/security/pages/RepaymentDetailPage';
import RepaymentSchedulePage from '../features/repayment/schedule/pages/RepaymentSchedulePage';
import SecurityCollateralPage from '../features/repayment/collateral/pages/SecurityCollateralPage';
import { GlobalModeProvider } from '../contexts/GlobalModeContext';
import ScheduleCalendarPage from '../features/repayment/schedule/pages/ScheduleCalendarPage';
import { AuthProvider } from '../contexts/AuthContext';
import ProtectedRoute from '../components/guards/ProtectedRoute';


// Komponen Halaman Dummy untuk mengetes apakah redirect login berhasil
const TestDashboard = () => {
  const token = localStorage.getItem('sum_pp_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 mb-4">
          ✓
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Login & Routing Sukses!</h1>
        <p className="mt-2 text-sm text-slate-500">
          Anda berhasil masuk ke halaman Dashboard Monitoring SUM-PP.
        </p>
        <button
          onClick={() => {
            localStorage.removeItem('sum_pp_token');
            window.location.reload();
          }}
          className="mt-6 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 transition-colors"
        >
          Keluar (Logout)
        </button>
      </div>
    </div>
  );
};

export default function AppRoutes() {
  return (
    <AuthProvider>
      <GlobalModeProvider>
        <BreadcrumbProvider>
          <BrowserRouter>
            <Routes>
              {/* Jalur default mengarah ke login */}
              <Route path="/" element={<Navigate to="/login" replace />} />
              
              {/* Halaman Utama Login */}
              <Route path='/login' element={<LoginPage />} />
              
              <Route element={<ProtectedRoute />}>
                {/* Jalur Terproteksi: Struktur Dashboard */}
                <Route path="/dashboard" element={<DashboardLayout />}>
                    <Route path="monitoring" element={<MonitoringDashboard />} />
                </Route>

                <Route element={<DashboardLayout />}>
                    
                    {/* --- GRUP DASHBOARD --- */}
                    <Route path="dashboard">
                        <Route path="monitoring" element={<MonitoringDashboard />} />
                    </Route>

                    {/* --- GRUP REPAYMENT --- */}
                    <Route path="repayment">
                        <Route path="securities" element={<RepaymentDashboardPage />} />
                        <Route path="securities/:repaymentId" element={<RepaymentDetailPage />} />
                        <Route path="securities/:repaymentId/schedules/:scheduleId" element={<RepaymentSchedulePage />} />
                        <Route path="securities/:repaymentId/collaterals" element={<SecurityCollateralPage />} />
                        
                        <Route path="calendar" element={<ScheduleCalendarPage />} />
                        <Route path="receipts" element={<ScheduleCalendarPage />} />
                    </Route>

                    {/* --- GRUP RANDOM --- */}
                    <Route path="random">
                        <Route index element={<Navigate to="overview" replace />} />
                        <Route path="overview" element={<div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-600 font-medium">Halaman Overview Utama (Placeholder)</div>} />
                        <Route path="sinking-fund" element={<div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-600 font-medium">Halaman Kupon & Sinking Fund (Placeholder)</div>} />
                        <Route path="collaterals" element={<div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-600 font-medium">Halaman Cek Mundur & Kolateral (Placeholder)</div>} />
                        <Route path="compliance" element={<div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-600 font-medium">Halaman Denda & Kepatuhan (Placeholder)</div>} />
                        <Route path="billing" element={<div className="bg-white p-6 rounded-xl border border-slate-100 text-slate-600 font-medium">Halaman Monitoring Fee & Pajak (Placeholder)</div>} />
                    </Route>

                </Route>
              </Route>
              
              {/* --- FALLBACK ROUTE --- */}
              <Route path="*" element={
                <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500 font-medium">
                  404 - Halaman Tidak Ditemukan
                </div>
              } />
            </Routes>
          </BrowserRouter>
        </BreadcrumbProvider>
      </GlobalModeProvider>
    </AuthProvider>
  );
}