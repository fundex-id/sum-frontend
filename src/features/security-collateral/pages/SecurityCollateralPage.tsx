// src/pages/repayment/SecurityCollateral.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import SecurityCollateralCreateWrapper from '../components/form/SecurityCollateralCreateWrapper';
import SecurityCollateralEditWrapper from '../components/form/SecurityCollateralEditWrapper';
import { useGlobalMode } from '../../../contexts/GlobalModeContext';
import { useSidePanel } from '../../../contexts/SidePanelContext';
import { securityCollateralService } from '../services/securityCollateralService';
import { SecurityCollateralItem } from '../types/security-collateral.type';
import { repaymentSecurityService } from '../../repayment-security/services/repaymentSecurityService';
import { SecurityCollateralItemResponse } from '../dtos/security-collateral.dto';
import { RepaymentSecurityDetailResponse, RepaymentSecuritySummaryResponse } from '../../repayment-security/dtos/repayment-security.dto';
import { formatPercentage, formatRupiah } from '../../../utils/currency';
import { getStatusStyle } from '../../../utils/styles';
import SecurityTypeBadge from '../../repayment-security/components/badge/SecurityTypeBadge';
import ContractStatusBadge from '../../repayment-security/components/badge/ContractStatusBadge';
import VerificationStatusBadge from '../components/badge/VerificationStatusBadge';
import FeeWithTax from '../../../components/ui/FeeWithTax';
import CollateralStatusBadge from '../components/badge/CollateralBadge';
import { toSafeBig } from '../../../utils/number';
import { useBreadcrumb } from '../../../contexts/BreadcrumbContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export default function SecurityCollateralPage() {
  const { repaymentId } = useParams<{ repaymentId: string }>();
  const [collaterals, setCollaterals] = useState<SecurityCollateralItemResponse[]>([]);
  const [repaymentSecurity, setRepaymentSecurity] = useState<RepaymentSecurityDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isEditMode } = useGlobalMode();
  const { openPanel } = useSidePanel();
  const { setBreadcrumbs } = useBreadcrumb();

  // Callback untuk Fetch Security Collaterals
  const fetchSecurityCollaterals = useCallback(async () => {
    try {
      const res = await securityCollateralService.getSecurityCollateralItems(repaymentId);
      setCollaterals(res.data.items || []);
      return res;
    } catch (err: any) {
      throw err; // Lempar ke atas agar ditangkap oleh blok catch di useEffect
    }
  }, [repaymentId]);

  // Callback untuk Fetch Repayment Security
  const fetchRepaymentSecurity = useCallback(async () => {
    try {
      const res = await repaymentSecurityService.getRepaymentSecurityDetail(repaymentId);
      setRepaymentSecurity(res.data.item);
      return res.data.item; // Return item agar bisa dipakai untuk Breadcrumbs
    } catch (err: any) {
      throw err;
    }
  }, [repaymentId]);

  // 3. useEffect untuk Initial Load & Orchestrator
  useEffect(() => {
    if (!repaymentId) return;

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Jalankan kedua fetcher secara paralel
        // Kita hanya butuh menangkap data dari fetchRepaymentSecurity untuk breadcrumb
        const [_, repaymentSecurityItem] = await Promise.all([
          fetchSecurityCollaterals(),
          fetchRepaymentSecurity(),
        ]);

        // Set BREADCRUMBS menggunakan data yang direturn
        if (repaymentSecurityItem) {
          setBreadcrumbs([
            { label: 'DASHBOARD', path: '/dashboard/monitoring' },
            { label: 'REPAYMENT', path: '/dashboard/repayment' },
            { 
              label: repaymentSecurityItem.securityCode ?? 'DETAIL', 
              path: `/dashboard/repayment/${repaymentSecurityItem.id}` 
            },
            { 
              label: "COLLATERALS",
              path: `/dashboard/repayment/${repaymentSecurityItem.id}/collaterals` 
            }
          ]);
        }
        
      } catch (err: any) {
        console.error('Error fetching data:', err);
        // Penyesuaian optional chaining untuk penanganan error
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan saat memproses data dari server.');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [repaymentId, fetchSecurityCollaterals, fetchRepaymentSecurity]);

  if (isLoading) {
    return (
      <div className="mt-20 flex h-64 items-center justify-center">
        <div className="animate-pulse text-sm font-medium text-slate-400">
          Memuat data agunan...
        </div>
      </div>
    );
  }
  
  // 2. Error State (Menggunakan Box Alert Berwarna Rose/Merah)
  if (error) {
    return (
      <div className="mt-20 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-600">
        <span>⚠️ Terjadi kesalahan: {error}</span>
      </div>
    );
  }
  
  // 3. Empty State (Mengembalikan null jika data tidak ditemukan)
  if (!repaymentSecurity) {
    <div className="mt-20 p-8 text-center text-slate-500 font-medium">
      ⚠️ Data tidak ditemukan.
    </div>
  }

  const underlyingFund = toSafeBig(repaymentSecurity.contractUnderlyingFund)
  const totalCollateralValue = toSafeBig(collaterals.reduce((sum, item) => sum + Number(item.collateralValueEstimated || 0), 0));
  const coverageRate = totalCollateralValue.div(underlyingFund);

  // Helper render item verifikasi di dalam grid 2x2
  const renderGridVerificationItem = (label: string | null, status: string | null, notes: string | null) => (
    <div className="w-full flex flex-col border border-slate-100 p-1.5 rounded-lg bg-slate-50/50 mb-0.5">
      {/* Ubah items-center menjadi items-start agar sejajar di atas */}
      <div className="flex items-start gap-1.5 text-[10px]">
        {/* Lebar 1/4 (25%) */}
        <span className="w-2/5 text-slate-500 font-medium pt-[1px]">
          {label}
        </span>
        
        {/* Lebar 1/4 (25%) */}
        <span className="w-2/5">
          <VerificationStatusBadge status={status} size="xs" />
        </span>
        
        {/* Lebar 2/4 atau 1/2 (50%) */}
        <span className="w-3/5 text-[10px] text-slate-600 italic pt-[1px] leading-tight" title={notes || undefined}>
          <span className="font-bold not-italic">Notes: </span>
          {notes ? (
            <>{notes}</>
          ) : (
            "-"
          )}
        </span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-800">DAFTAR JAMINAN (KOLATERAL)</h1>
            <p className="text-xs text-slate-500 mt-1">Kelola dan monitor aset jaminan untuk fasilitas pendanaan</p>
          </div>
       
        </div>
        

        {/* Kontainer 1: Ringkasan Informasi Penerbit */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="flex flex-row gap-4">
            <div className="w-1/6 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama Penerbit</span>
              <span className="text-sm font-bold text-slate-800">{repaymentSecurity.investeeName}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{repaymentSecurity.investeeNameLegal}</span>
            </div>
            <div className="w-2/6 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama Efek</span>
              <span className="text-sm font-bold text-slate-800">{repaymentSecurity.securityName}</span>
            </div>
            <div className="w-1/6 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tipe Efek</span>
              <div className="mt-0.5">
                <SecurityTypeBadge type={repaymentSecurity.securityType || null} />
              </div>
            </div>
            <div className="w-1/6 flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Status Kontrak</span>
              <div className="mt-0.5">
                <ContractStatusBadge status={repaymentSecurity.contractStatus || null} />
              </div>
            </div>
            <div className="w-1/6 flex flex-col text-right">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">(%) Coverage</span>
              <div className="text-md font-bold text-slate-800 text-right">
                {/* <div>{formatRupiah(underlyingFund)}</div>
                <div>{formatRupiah(totalCollateralValue)}</div> */}
                <div>{formatPercentage(coverageRate, 'zero')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Kontainer 2: Tabel List Collateral */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/50">
            <h2 className="text-sm font-bold text-slate-800">Rincian Aset Jaminan</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-12 py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">No</th>
                    <th className="w-24 py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                    <th className="w-3/12 py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Detail Jaminan</th>
                    <th className="w-7/12 py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status Verifikasi</th>
                    <th className="w-1/12 py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">Estimasi Nilai</th>
                    <th className="w-14 py-3 px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Dokumen</th>
                    {isEditMode && (<th className="w-14 py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Edit</th>)}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={isEditMode ? 7 : 6} className="py-8 text-center text-xs text-slate-400">Memuat data jaminan...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={isEditMode ? 7 : 6} className="py-8 text-center text-xs text-rose-500">Error: {error}</td>
                  </tr>
                ) : collaterals.length === 0 ? (
                  <tr>
                    <td colSpan={isEditMode ? 7 : 6} className="py-8 text-center text-xs text-slate-400 italic">-- belum ada jaminan --</td>
                  </tr>
                ) : (
                  <>
                    {collaterals.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* 1. Kolom Nomor */}
                        <td className="py-4 px-4 align-top text-center text-xs font-medium text-slate-500">
                          <div className="mt-1">{index + 1}</div>
                        </td>

                        {/* 2. Kolom Status */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="mt-0.5">
                            <CollateralStatusBadge status={item.collateralStatus || null} size="sm"/>
                          </div>
                        </td>
                        
                        {/* 3. Kolom Detail Jaminan */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col mt-0.5">
                            <span className="text-xs font-bold text-slate-800 mb-1">
                              {item.collateralType ? item.collateralType.replace(/_/g, ' ') : '-'}
                            </span>
                            <span className="text-[11px] text-slate-600 leading-relaxed">{item.collateralDescription}</span>
                          </div>
                        </td>
                        
                        {/* 4. Kolom Status Verifikasi (max-w-sm dihilangkan agar lebar) */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex flex-col w-full">
                            {renderGridVerificationItem('Verifikasi Dokumen', item.verificationDocumentStatus, item.verificationDocumentNotes)}
                            {renderGridVerificationItem('Verifikasi Lapangan', item.verificationFieldStatus, item.verificationFieldNotes)}
                            {renderGridVerificationItem('Verifikasi Legal', item.verificationLegalStatus, item.verificationLegalNotes)}
                            {renderGridVerificationItem('Verifikasi Nilai', item.verificationValueStatus, item.verificationValueNotes)}
                          </div>
                        </td>

                        {/* 5. Kolom Estimasi Nilai */}
                        <td className="py-4 px-4 align-top text-right">
                          <div className="mt-0.5">
                            <span className="text-xs font-mono font-semibold text-slate-800">
                              <FeeWithTax base={item.collateralValueEstimated} />
                            </span>
                          </div>
                        </td>
                        
                        {/* 6. Kolom View Dokumen (Diganti Ikon Mata Standard) */}
                        <td className="py-4 px-4 align-top text-center">
                          <div className="mt-0.5 flex justify-center">
                            <a 
                              href={item.documentUrl ?? "#"} 
                              target={item.documentUrl ? "_blank" : undefined} 
                              rel="noopener noreferrer" 
                              className={`inline-flex items-center justify-center p-1.5 rounded transition-colors ${
                                item.documentUrl 
                                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100" 
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                              title={item.documentUrl ? "Lihat Dokumen" : "Dokumen Tidak Tersedia"}
                              onClick={(e) => !item.documentUrl && e.preventDefault()} // Mencegah scroll ke atas jika klik '#'
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </a>
                          </div>
                        </td>

                        
                        {/* 7. Kolom Edit */}
                        {isEditMode && (
                          <td className="py-4 px-3 align-top text-center">
                            <div className="mt-0.5 flex justify-center">
                              <button 
                                onClick={() => openPanel(<SecurityCollateralEditWrapper collateralId={item.id} repaymentSecuritySummary={repaymentSecurity} onSuccess={fetchSecurityCollaterals}/>)}
                                className="text-[12px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-1.5 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center justify-center"
                                title="Edit Kolateral"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                {/* Baris Total di Bagian Bawah Sejajar Kolom Estimasi Nilai */}
                <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                  <td colSpan={4} className="py-4 pl-14 text-center text-slate-900 text-xs uppercase tracking-tight">
                    Perkiraan total estimasi nilai jaminan
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-md">
                    <FeeWithTax base={totalCollateralValue} size="lg"/>
                  </td>
                  <td colSpan={isEditMode ? 2 : 1} className="bg-slate-50"></td>
                </tr>
              </tfoot>
            </table>
            
            {/* Row Tambah Kolateral Baru (Muncul jika isEditMode aktif) sebelum baris total */}
            {isEditMode && (
              <div className="border-t-2 border-slate-200 flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => openPanel(<SecurityCollateralCreateWrapper repaymentSecuritySummary={repaymentSecurity} onSuccess={fetchSecurityCollaterals}/>)}
                  className="w-11/12 py-4 m-4 flex items-center justify-center border-2 border-dashed rounded-lg border-amber-200 bg-amber-50/40 hover:bg-amber-100 text-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-200 group"
                >
                  <div className="bg-amber-100 p-1 rounded-full group-hover:bg-amber-500 transition-colors">
                    <svg className="w-4 h-4 text-amber-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-semibold text-xs pl-1">Tambah Kolateral Baru</span>
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}