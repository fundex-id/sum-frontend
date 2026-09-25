// src/pages/repayment/SecurityCollateral.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SecurityCollateralCreateWrapper from '../components/form/SecurityCollateralCreateWrapper';
import SecurityCollateralEditWrapper from '../components/form/SecurityCollateralEditWrapper';
import { useGlobalMode } from '../../../../contexts/GlobalModeContext';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { securityCollateralService } from '../services/securityCollateralService';
import { SecurityCollateralItem } from '../types/security-collateral.type';
import { repaymentSecurityService } from '../../security/services/repaymentSecurityService';
import { SecurityCollateralItemResponse } from '../dtos/security-collateral.dto';
import { RepaymentSecuritySummaryResponse } from '../../security/dtos/repayment-security.dto';
import { formatRupiah } from '../../../../utils/currency';
import { getStatusStyle } from '../../../../utils/styles';
import SecurityTypeBadge from '../../security/components/badges/SecurityTypeBadge';
import ContractStatusBadge from '../../security/components/badges/ContractStatusBadge';
import VerificationStatusBadge from '../components/badge/VerificationStatusBadge';
import FeeWithTax from '../../../../components/ui/FeeWithTax';
import CollateralStatusBadge from '../components/badge/CollateralBadge';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';



export default function SecurityCollateralPage() {
  const { repaymentId } = useParams<{ repaymentId: string }>();
  const [ collaterals, setCollaterals] = useState<SecurityCollateralItemResponse[]>([]);
  const [repaymentSecSummary, setRepaymentSecSummary] = useState<RepaymentSecuritySummaryResponse>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isEditMode } = useGlobalMode();
  const { openPanel } = useSidePanel();



  // useEffect(() => {
  //   const fetchCollaterals = async () => {
  //     try {
  //       const response = await fetch(`${API_BASE_URL}/repayment/securities/${repaymentId}/collaterals`);
  //       if (!response.ok) {
  //         throw new Error('Gagal mengambil data kolateral');
  //       }
  //       const result = await response.json();
  //       setCollaterals(result.data?.items || []);
  //     } catch (err: any) {
  //       setError(err.message);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   if (repaymentId) {
  //     fetchCollaterals();
  //   }
  // }, [repaymentId]);

  useEffect(() => {
    if (!repaymentId) return;

    const fetchCollateralData = async () => {
      try {
        setIsLoading(true);
        setError(null);


        const [securityCollateralsRes, repaymentSecSummaryRes, ] = await Promise.all([
          securityCollateralService.getSecurityCollateralItems(repaymentId),
          repaymentSecurityService.getRepaymentSecuritySummary(repaymentId),
        ]);


        setCollaterals(securityCollateralsRes.data.items || []);
        setRepaymentSecSummary(repaymentSecSummaryRes.data.item);
      
      } catch (err: any) {
        console.error('Error fetching collateral:', err);
        setError(err.securityCollateralsRes?.data?.message || 'Terjadi kesalahan saat memproses data dari server.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCollateralData();
  }, [repaymentId]);

  if (isLoading) return <div className="p-6 text-slate-500 font-medium">Memuat data agunan...</div>;
  if (error) return <div className="p-6 text-red-500 font-medium">Error: {error}</div>;

  const totalCollateralValue = collaterals.reduce((sum, item) => sum + Number(item.collateralValueEstimated || 0), 0);


  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto space-y-4">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-lg font-bold text-slate-900">Daftar Jaminan (Collaterals)</h1>
            <p className="text-xs text-slate-500 mt-1">Kelola dan monitor aset jaminan untuk fasilitas pendanaan</p>
          </div>
          <Link to={`/dashboard/repayment/schedules/${repaymentId}`} className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors">
            &larr; Kembali
          </Link>
        </div>

        {/* Kontainer 1: Ringkasan Informasi Penerbit */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <div className="grid grid-cols-[2fr_3fr_1fr_1fr] gap-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama Penerbit</span>
              <span className="text-sm font-bold text-slate-800">{repaymentSecSummary.investeeName}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{repaymentSecSummary.investeeName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Nama Efek</span>
              <span className="text-sm font-bold text-slate-800">{repaymentSecSummary.securityName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Tipe Efek</span>
              <div className="mt-0.5">
                <SecurityTypeBadge type={repaymentSecSummary.securityType || null} />
              </div>
            </div>
            <div className="flex flex-col">
              <span className={`text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1`}>Status Kontrak</span>
              <div className="mt-0.5">
                
                  <ContractStatusBadge status={repaymentSecSummary.contractStatus || null} />
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
                    <th rowSpan={2} className="w-12 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">No</th>
                    <th rowSpan={2} className="w-2/6 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider pl-4">Detail <br /> Jaminan</th>
                    <th colSpan={4} className="w-3/6 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Status Verifikasi</th>
                    <th rowSpan={2} className="w-1/6 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center ">Estimasi <br /> Nilai</th>
                    <th rowSpan={2} className="w-28 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center ">Status <br /> Jaminan</th>
                    <th rowSpan={2} className="w-28 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center ">View <br /> Dokumen</th>
                    {isEditMode && (<th rowSpan={2} className="w-16 py-2.5 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center ">Edit</th>)}
                </tr>
                <tr className="bg-slate-50 border-b border-slate-200">
                    
                    <th className="w-1/4 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Dokumen</th>
                    <th className="w-1/4 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Legalitas</th>
                    <th className="w-1/4 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Nilai</th>
                    <th className="w-1/4 px-2 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-center">Lapangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400">Memuat data jaminan...</td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-rose-500">Error: {error}</td>
                  </tr>
                ) : collaterals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-xs text-slate-400 italic">-- belum ada jaminan --</td>
                  </tr>
                ) : (
                  <>


                    {collaterals.map((item, index) => (
                      <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* 1. Kolom Nomor */}
                        <td className="px-2 py-2 align-top text-center text-xs font-medium text-slate-500">
                          {index + 1}
                        </td>
                        
                        {/* 2. Kolom Detail Jaminan */}
                        <td className="px-2 py-2 align-top">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800 mb-1">{item.collateralType.replace('_', ' ')}</span>
                            <span className="text-[11px] text-slate-600 leading-relaxed">{item.collateralDescription}</span>
                          </div>
                        </td>
                        
                        {/* 3. Kolom Status Verifikasi (Grid Berukuran 2x2) */}
                        <td className="px-2 py-2 align-top ">
                          <div className="flex flex-col">
                            <div>
                              <VerificationStatusBadge status={item.verificationDocumentStatus} size="xs"/>
                            </div>
                            <div className="w-3/5 text-[8px] text-slate-600 italic mt-0.5 leading-tight">
                              <span className="font-bold">Notes: </span>
                              {item.verificationDocumentNotes}
                            </div>
                          </div>
                          
                        </td>
                        <td className="px-2 py-2 align-top">
                          <VerificationStatusBadge status={item.verificationFieldStatus} size="xs"/>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <VerificationStatusBadge status={item.verificationLegalStatus} size="xs"/>
                        </td>
                        <td className="px-2 py-2 align-top">
                          <VerificationStatusBadge status={item.verificationValueStatus} size="xs"/>
                        </td>

                        {/* 4. Kolom Estimasi Nilai */}
                        <td className="px-2 py-2 align-top text-right">
                          <span className="text-xs font-mono font-semibold text-slate-800">
                            <FeeWithTax base={item.collateralValueEstimated} />
                          </span>
                        </td>
                        
                        {/* 5. Kolom Status */}
                        <td className="px-2 py-2 align-top text-center">
                          <CollateralStatusBadge status={item.collateralStatus || null} size="sm"/>
                        </td>
                        
                        {/* 6. Kolom View Dokumen */}
                        <td className="px-2 py-2 align-top text-center">
                          {item.documentUrl ? (
                            <a 
                              href={item.documentUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center justify-center p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors" 
                              title="Buka Dokumen PDF"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400">-</span>
                          )}
                        </td>
                        {isEditMode && (
                            <td className="px-2 py-2 text-left align-top">
                                <button 
                                  onClick={() => openPanel(<SecurityCollateralEditWrapper collateralId={item.id} repaymentSecuritySummary={repaymentSecSummary}/>)}
                                  className="text-[12px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1 py-1 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                    </svg>
                                </button>
                            </td>)}
                      </tr>
                    ))}
                  </>
                )}
                
              </tbody>
              <tfoot>
                    {/* Baris Total di Bagian Bawah Sejajar Kolom Estimasi Nilai */}
                    <tr className="bg-slate-50 border-t border-slate-200 font-semibold">
                                          <td colSpan={3} className="py-3 pl-14 text-center text-slate-900 text-xs uppercase tracking-tight">
                        Perkiraan total estimasi nilai jaminan
                      </td>
                      <td className="px-2 py-2 text-right font-monotext-md">
                        <FeeWithTax base={totalCollateralValue} size="lg"/>
                      </td>
                      <td colSpan={2} className="bg-slate-50"></td>
                    </tr>
              </tfoot>
            </table>
            {/* Row Tambah Kolateral Baru (Muncul jika isEditMode aktif) sebelum baris total */}
            {isEditMode && (
                  <div className="border-t-2 border-slate-200 flex items-center justify-center">
                  <button
                      type="button"
                      onClick={() => openPanel(<SecurityCollateralCreateWrapper repaymentSecuritySummary={repaymentSecSummary}/>)}
                      className="w-11/12 py-4 m-4 last:flex items-center justify-center border-2 border-dashed rounded-lg border-amber-200 bg-amber-50/40 hover:bg-amber-100 text-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-200 group">
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