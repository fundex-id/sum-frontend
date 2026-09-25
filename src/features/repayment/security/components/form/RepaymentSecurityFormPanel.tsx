import React, { useState, useEffect } from 'react';
import { ContractStatus, SecurityType } from '../types/repayment-security.enum';

interface RepaymentSecurityFormPanelProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'add' | 'edit';
  initialData?: any; // Nanti bisa diganti dengan interface RepaymentSecurity lo
}

export default function RepaymentSecurityFormPanel({
  isOpen,
  onClose,
  mode = 'add',
  initialData
}: RepaymentSecurityFormPanelProps) {
  // State khusus untuk mode minimize
  const [isMinimized, setIsMinimized] = useState(false);

  // Reset state minimize setiap kali panel dibuka atau ditutup dari luar
  useEffect(() => {
    if (!isOpen) {
      setIsMinimized(false);
    }
  }, [isOpen]);

  // Jika tidak open dan tidak di-minimize, hilangkan dari DOM (unmount)
  if (!isOpen && !isMinimized) return null;

  // TAMPILAN 1: MODE MINIMIZE (Docked di kanan bawah)
  if (isMinimized) {
    return (
      <div
        className="fixed bottom-0 right-8 w-72 bg-white border border-slate-200 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] rounded-t-xl z-50 flex items-center justify-between p-3 cursor-pointer hover:bg-slate-50 transition-colors animate-slide-up"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center gap-3">
          {/* Dot indicator */}
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <span className="text-sm font-bold text-slate-700">
            {mode === 'add' ? 'Draft: Data Baru' : 'Draft: Edit Data'}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Biar pas diklik close, panel nggak ke-maximize lagi
            onClose();
          }}
          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md transition-colors"
          title="Tutup Form"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    );
  }

  // TAMPILAN 2: MODE NORMAL (Side Panel Terbuka)
  return (
    <>
      {/* Backdrop Overlay transparan biar fokus, tapi nge-klik di luar form akan mentrigger fungsi Minimize */}
      <div
        className="fixed inset-0 bg-slate-900/10 backdrop-blur-[1px] z-40 transition-opacity"
        onClick={() => setIsMinimized(true)}
      ></div>

      {/* Main Panel - Lebar minimum 400px, max 33vw (1/3 layar) di desktop */}
      <div className="fixed top-0 right-0 h-screen w-full md:w-[33vw] md:min-w-[450px] bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200">
        
        {/* PANEL HEADER */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-700">
                {mode === 'add' ? 'Baru' : 'Edit Mode'}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-800">
              {mode === 'add' ? 'Tambah Repayment Security' : 'Ubah Repayment Security'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {mode === 'add' 
                ? 'Lengkapi seluruh informasi penerbit dan detil kontrak.' 
                : 'Ubah informasi pada data form di bawah sesuai kebutuhan.'}
            </p>
          </div>

          {/* Header Actions (Minimize & Close) */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
              title="Minimize Form"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 12H4" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Close (Buang Draft)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* PANEL BODY (Scrollable Form Area) */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          
          {/* Dummy Field 1 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nama Penerbit (Investee)</label>
            <input
              type="text"
              placeholder="Contoh: PT Teknologi Masa Depan"
              defaultValue={mode === 'edit' ? initialData?.investee_name : ''}
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-700"
            />
          </div>

          {/* Dummy Field 2 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tipe Security</label>
              <select className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-700 bg-white">
                <option value="">-- Pilih Tipe --</option>
                <option value={SecurityType.SUKUK}>Sukuk</option>
                <option value={SecurityType.SAHAM}>Saham</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status Kontrak</label>
              <select className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-700 bg-white">
                <option value="PERFORMING">Performing</option>
                <option value="OBSERVATION">Observation</option>
                <option value="DEFAULTED">Defaulted</option>
                <option value="">-- Pilih Status --</option>
                <option value={ContractStatus.PERFORMING}>Performing</option>
                <option value={ContractStatus.OBSERVATION}>Observation</option>
                <option value={ContractStatus.SUBSTANDARD}>Substandard</option>
                <option value={ContractStatus.DOUBTFUL}>Doubtful</option>
                <option value={ContractStatus.DEFAULTED}>Defaulted</option>
              </select>
            </div>
          </div>

          {/* Dummy Field 3 */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nilai Pendanaan (Underlying Fund)</label>
            <div className="relative">
              <span className="absolute left-3 top-[9px] text-slate-400 text-sm font-bold">Rp</span>
              <input
                type="number"
                placeholder="0"
                className="w-full text-sm pl-9 pr-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-700"
              />
            </div>
          </div>

          {/* Dummy Field 4 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Date</label>
              <input
                type="date"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-600"
              />
            </div>
          </div>

          {/* Area Catatan/Placeholder tambahan agar bisa scroll panjang */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catatan Internal</label>
            <textarea
              rows={4}
              placeholder="Tambahkan catatan khusus terkait penerbit..."
              className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors text-slate-700"
            ></textarea>
          </div>

        </div>

        {/* PANEL FOOTER (Actions) */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-800 transition-colors"
          >
            Batal
          </button>
          <button
            className="px-4 py-2 text-sm font-semibold text-white bg-amber-500 rounded-lg shadow-sm shadow-amber-500/20 hover:bg-amber-600 focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            {mode === 'add' ? 'Simpan Data Baru' : 'Simpan Perubahan'}
          </button>
        </div>
      </div>
    </>
  );
}