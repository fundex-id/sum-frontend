import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import RepaymentCard from '../components/dashboard/RepaymentCard';
import { useGlobalMode } from '../../../contexts/GlobalModeContext';
import { repaymentSecurityService } from '../services/repaymentSecurityService';
import { RepaymentSecurityCardResponse } from '../dtos/repayment-security.dto';
import { ContractStatus, SecurityType } from '../types/repayment-security.enum';
import { useBreadcrumb } from '../../../contexts/BreadcrumbContext';

export default function RepaymentDashboardPage() {
  const [data, setData] = useState<RepaymentSecurityCardResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [securityTypeFilter, setSecurityTypeFilter] = useState('ALL'); // NEW: State untuk Tipe Efek

  const { isEditMode } = useGlobalMode();

  // 💡 SENIOR-STYLE: Baca parameter dari URL browser lo
  const [searchParams, setSearchParams] = useSearchParams();
  const actionParam = searchParams.get('action'); // Akan membaca '?action=add'
  
  // Status panel terbuka kalau ada parameter 'add' atau 'edit'
  const isFormOpen = actionParam === 'add' || actionParam === 'edit';
  const formMode = actionParam === 'add' ? 'add' : 'edit';
  const { setBreadcrumbs } = useBreadcrumb();

  // 2. Gunakan useEffect untuk memanggil Service
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const responseData = await repaymentSecurityService.getRepaymentSecurityCards();
      setData(responseData?.data?.items || []); 

      setBreadcrumbs([
        { label: 'DASHBOARD', path: '/dashboard/monitoring' },
        { label: 'REPAYMENT', path: '/repayment/securities' },
      ]);
      
    } catch (err: any) {
      console.error("Gagal memuat data dashboard:", err);
      setError(
        err?.response?.data?.message || "Terjadi kesalahan saat memuat data dari server."
      );
    } finally {
      setLoading(false);
    }
  }, []); // Array dependensi useCallback kosong jika tidak memakai variabel state/props eksternal

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]); // Array dependensi kosong: hanya dijalankan sekali saat komponen di-mount (dimuat)

  // Asumsi: Filter logic untuk memproses data dari backend sebelum di-render
  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    
    // NEW: Cek Name, Investee, dan Investee Legal (di-cast ke any untuk jaga-jaga apabila DTO belum di-update)
    const matchesSearch = 
      !searchTerm || 
      item.securityName?.toLowerCase().includes(searchLower) ||
      (item as any).investeeName?.toLowerCase().includes(searchLower) ||
      (item as any).investeeNameLegal?.toLowerCase().includes(searchLower);

    const matchesStatus = statusFilter === 'ALL' || item.contractStatus === statusFilter;
    
    // NEW: Cek Tipe Efek (Sukuk / Saham)
    const matchesType = securityTypeFilter === 'ALL' || (item as any).securityType === securityTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    // Mengubah mt-16 menjadi mt-24 agar tidak tertutup fixed navbar
    // FIX: Menghapus h-full dan menambahkan pb-12 agar scroll halaman berjalan natural dan tidak terpotong
    <div className="mt-20 w-full p-4">
       {/* =====================================================================
          HEADER / TITLE PAGE
      ====================================================================== */}

      <div className="ml-2">
        <div className="flex flex-col justify-between items-start mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DASHBOARD PEMBAYARAN PENERBIT</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Dashboard untuk memantau kewajiban pembayaran penerbit</p>
        </div>
      </div>
      
      {/* FILTER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm items-center">
        {/* 1. Search */}
        <div className="flex-1 w-full">
          <input
            type="text"
            placeholder="Cari Nama Investee, Nama Legal, atau Security..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* 2. Security Type / Tipe Efek Filter */}
        <div className="w-full md:w-48">
          <select
            value={securityTypeFilter}
            onChange={(e) => setSecurityTypeFilter(e.target.value)}
            className="w-full px-4 py-2 text-xs text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer transition-all"
          >
            <option value="ALL">Semua Tipe Efek</option>
            <option value={SecurityType.SUKUK}>Sukuk</option>
            <option value={SecurityType.SAHAM}>Saham</option>
          </select>
        </div>

        {/* 3. Status Filter */}
        <div className="w-full md:w-56">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 text-xs text-slate-700 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer transition-all"
          >
            <option value="ALL">Semua Status</option>
            <option value={ContractStatus.PERFORMING}>Performing</option>
            <option value={ContractStatus.OBSERVATION}>Observation</option>
            <option value={ContractStatus.SUBSTANDARD}>Substandard</option>
            <option value={ContractStatus.DOUBTFUL}>Doubtful</option>
            <option value={ContractStatus.DEFAULTED}>Defaulted</option>
          </select>
        </div>
      </div>

      {/* KONDISI LOADING */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-sm font-medium text-slate-400 animate-pulse">Memuat data repayment...</div>
        </div>
      )}

      {/* KONDISI ERROR */}
      {error && (
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-sm text-rose-600 font-medium flex items-center justify-center">
          ⚠️ Terjadi kesalahan:  {error}
        </div>
      )}

      {/* GRID LAYOUT (3 Columns) */}
      {!loading && !error && (
        <>
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center bg-white rounded-xl border border-slate-200/60 border-dashed">
              <div className="my-16 text-center">
                <span className="text-2xl mb-2">📭</span>
                <p className="text-sm text-slate-400 font-medium">Data tidak ditemukan.</p>
              </div>
              {isEditMode && (
                  <div className="w-full flex justify-center flex-row pb-10">
                    <div className="w-1/3">
                      <RepaymentCard key="_key" data={null as any} onDataChanged={fetchDashboardData}/>
                    </div>
                  </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredData.map((repayment) => (
                <RepaymentCard key={repayment.id} data={repayment} url={repayment.id} onDataChanged={fetchDashboardData}/>
              ))}
              {isEditMode && (
                <RepaymentCard key="_key" data={null as any} onDataChanged={fetchDashboardData}/>
              )}
            </div>
          )}
        </>
      )}

      {/* RENDER PANEL FORM JIKA DIAKTIFKAN VIA URL */}
      {/* {isFormOpen && (
        <RepaymentSecurityFormPanel 
          mode={formMode} 
          // Bisa melempar fungsi untuk me-refresh data (misal re-fetch) jika dibutuhkan
        />
      )} */}
    </div>
  );
}