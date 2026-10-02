import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { SidePanelProvider } from '../../contexts/SidePanelContext';
import SidePanelLayout from './SidePanelLayout';
import { tokenStorage } from '../../lib/storage/tokenStorage';

export default function DashboardLayout() {
  const token = tokenStorage.getAccessToken();
  
  // 1. STATE MANAGEMENT: Mengontrol status collapse secara global di level layout
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Proteksi Route Tingkat Global Layout
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  //  // debuggin
  // useEffect(() => {
  //   console.log("📢 [DashboardLayout] Status isCollapsed berubah menjadi:", isCollapsed);
  // }, [isCollapsed]); // <-- Array dependensi ini kuncinya! Dia bakal nembak log tiap kali isi variabel ini berubah.

  return (
    <div 
      className={`grid ${
        isCollapsed ? 'grid-cols-[4rem_1fr]' : 'grid-cols-[16rem_1fr]'
      } min-h-screen bg-slate-50/50 transition-all duration-300`}
    >

      {/* PANEL KIRI: Navigasi Menu (Tetap Fixed & Z-Index Aman) */}
      <div 
        className={`fixed top-0 left-0 h-screen ${
          isCollapsed ? 'w-16' : 'w-64'
        } z-50 transition-all duration-300`}
      >
        {/* Kita parsing state ke dalam Sidebar agar tombol di dalam sidebar bisa ngubah state-nya */}
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* 2. THE SECRET SPACER: Div kosong ini otomatis mengisi kolom ke-1 grid.
          Dia berfungsi sebagai bumper otomatis penahan lebar sidebar yang sedang melayang (fixed). */}
      <div className="transition-all duration-300"></div>

      {/* PANEL KANAN: Area Utama (Otomatis masuk ke kolom ke-2 / 1fr tanpa perlu margin/padding kiri!) */}
      <div className="flex flex-col min-h-screen overflow-x-hidden">
        {/* Atas: Navbar */}
        
        <SidePanelProvider>
          <div className="flex flex-col min-h-screen bg-slate-50">

            
            {/* Misal lo pasang komponen Navbar & Sidebar lo di sini */}
            <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}/>
            
            {/* Bawah: Area Konten Dinamis (Disesuaikan p-5 agar tetap compact & padat data) */}
            <main className="flex-1 p-5">
              <Outlet />
            </main>

            
            {/* Komponen pembungkus panel gesernya ada di paling dasar */}
            <SidePanelLayout />
            
          </div>
        </SidePanelProvider>

      </div>

    </div>
  );
}