// src/pages/repayment/RepaymentDetail.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import RepaymentSecurityEditWrapper from '../components/form/RepaymentSecurityEditWrapper';
import InfoRow from '../../../../components/ui/InfoRow';
import { useGlobalMode } from '../../../../contexts/GlobalModeContext';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { repaymentSecurityService } from '../services/repaymentSecurityService';
import { repaymentScheduleService } from '../../schedule/services/repaymentScheduleService';
import { securityCollateralService } from '../../collateral/services/securityCollateralService';
import CollateralPanel from '../components/detail/CollateralPanel';
import { SecurityCollateralItemResponse } from '../../collateral/dtos/security-collateral.dto';
import SchedulePanel from '../components/detail/SchedulePanel';
import { RepaymentScheduleItemWithPenaltyResponse } from '../../schedule/dtos/repayment-schedule.dto';
import { formatPercentage, formatRupiah } from '../../../../utils/currency';
import { formatDate } from '../../../../utils/date';
import { ScheduleType } from '../../schedule/types/repayment-schedule.enum';
import { RepaymentSecurityWithSinkingFundResponse } from '../dtos/repayment-security.dto';
import ContractStatusBadge from '../components/badges/ContractStatusBadge';
import SecurityTypeBadge from '../components/badges/SecurityTypeBadge';
import { SecurityType } from '../types/repayment-security.enum';
import Penalty from '../../../../components/ui/Penalty';
import RevenuePanel from '../components/detail/RevenuePanel';
import { toSafeBig } from '../../../../utils/number';
import { useBreadcrumb } from '../../../../contexts/BreadcrumbContext';
import { resolveS3Url } from '../../../../utils/url';

export default function RepaymentDetailPage() {
  const { repaymentId } = useParams<{ repaymentId: string }>();

  const [repaymentSecurity, setRepaymentSecurity] = useState<RepaymentSecurityWithSinkingFundResponse | null>(null);
  const [repaymentSchedules, setRepaymentSchedules] = useState<RepaymentScheduleItemWithPenaltyResponse[]>([]);
  const [securityCollaterals, setSecurityCollaterals] = useState<SecurityCollateralItemResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk progress bar dinamis
  const [totalReceipt, setTotalReceipt] = useState<number>(0);
  const [animatedProgress, setAnimatedProgress] = useState<number>(0);

  const { isEditMode } = useGlobalMode();
  const { openPanel } = useSidePanel();
  const { setBreadcrumbs } = useBreadcrumb();

  // 1. Callback khusus untuk me-refresh Repayment Security
  const fetchRepaymentSecurity = useCallback(async () => {
    if (!repaymentId) return;
    try {
      const res = await repaymentSecurityService.getRepaymentSecurityWithSinkingFund(repaymentId);
      setRepaymentSecurity(res.data.item);
      return res.data.item;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  }, [repaymentId]);

  // 2. Callback khusus untuk me-refresh Repayment Schedules
  const fetchRepaymentSchedules = useCallback(async () => {
    if (!repaymentId) return;
    try {
      const res = await repaymentScheduleService.getRepaymentSchedulesWithPenalty(repaymentId);
      setRepaymentSchedules(res.data.items || []);
      return res.data.items || [];
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  }, [repaymentId]);

  // 3. Callback khusus untuk me-refresh Security Collaterals (BARU)
  const fetchSecurityCollaterals = useCallback(async () => {
    if (!repaymentId) return;
    try {
      const res = await securityCollateralService.getSecurityCollateralItems(repaymentId);
      setSecurityCollaterals(res.data.items || []);
      return res.data.items || [];
    } catch (err: any) {
      setError(err.response?.data?.message || err.message);
    }
  }, [repaymentId]);

  // 4. useEffect untuk Initial Load (Bersih & Rapi)
  useEffect(() => {
    if (!repaymentId) return;

    const loadAllInitialData = async () => {
      try {
        setLoading(true); // Nyalakan loading global
        
        // Jalankan ketiga request secara paralel dan tangkap hasilnya
        const [repaymentRes, schedulesRes, collateralRes] = await Promise.all([
          fetchRepaymentSecurity(),
          fetchRepaymentSchedules(),
          fetchSecurityCollaterals() 
        ]);

        // Set Breadcrumbs HANYA JIKA data security berhasil didapatkan
        if (repaymentRes) {
          setBreadcrumbs([
            { label: 'DASHBOARD', path: '/dashboard/monitoring' },
            { label: 'REPAYMENT', path: '/repayment/securities' },
            { 
              label: repaymentRes.securityCode ?? 'Detail Repayment', 
              path: `/repayment/securities/${repaymentRes.id}` 
            }
          ]);
        }

      } catch (err: any) {
        // Error sudah ditangani di masing-masing try-catch callback
      } finally {
        setLoading(false); // Matikan loading global setelah selesai
      }
    };

    loadAllInitialData();
  }, [
    repaymentId, 
    fetchRepaymentSecurity, 
    fetchRepaymentSchedules, 
    fetchSecurityCollaterals 
  ]);
  

  // Loading & Error UI Fallback
  // 1. Kondisi Memuat Data (Loading State) dengan Efek Animasi Pulse
  if (loading) {
    return (
      <div className="mt-20 p-8 text-center text-sm font-medium text-slate-400 animate-pulse">
        Memuat detail data...
      </div>
    );
  }

  // 2. Kondisi Error (Error State)
  if (error) {
    return (
      <div className="mt-20 bg-rose-50 p-4 rounded-xl border border-rose-200 text-sm text-rose-600 font-medium flex items-center justify-center">
        ⚠️ Terjadi kesalahan: {error}
      </div>
    );
  }

  // 3. Kondisi Data Kosong (Empty State)
  if (!repaymentSecurity) {
    return (
      <div className="mt-20 p-8 text-center text-slate-500 font-medium">
        ⚠️ Data tidak ditemukan.
      </div>
    );
  }

  // ===========================================================================
  // DATA PREPARATION & CALCULATIONS
  // ===========================================================================
  
  // Kalkulasi Pendapatan (Revenue)

  const duration = Number(repaymentSecurity.contractDurationInMonths)
  
  const feeAdmin = toSafeBig(repaymentSecurity.contractFeeAdministration);
  const feeAdminPct = toSafeBig(repaymentSecurity.contractFeeAdministrationPercentage);
  
  const feeProvision = toSafeBig(repaymentSecurity.contractFeeProvision);
  const feeProvisionPct = toSafeBig(repaymentSecurity.contractFeeProvisionPercentage);
  
  const feePlatform = toSafeBig(repaymentSecurity.contractFeePlatform);
  const feePlatformPct = toSafeBig(repaymentSecurity.contractFeePlatformPercentage);
  
  const feeServicing = toSafeBig(repaymentSecurity.contractFeeServicing);
  const feeServicingPct = toSafeBig(repaymentSecurity.contractFeeServicingPercentage);
  
  const feeMonitoring = toSafeBig(repaymentSecurity.contractFeeMonitoring);
  const feeMonitoringPctMonthly = toSafeBig(repaymentSecurity.contractFeeMonitoringPercentageMonthly);
  const feeMonitoringPct = feeMonitoringPctMonthly.times(duration);
  
  const totalRevenue = feeAdmin.plus(feeProvision).plus(feePlatform).plus(feeServicing).plus(feeMonitoring);
  const totalRevenuePercentage = feeAdminPct.plus(feeProvisionPct).plus(feePlatformPct).plus(feeServicingPct).plus(feeMonitoringPct);
  

  const totalInstallment = repaymentSchedules.filter(
    (schedule) => schedule.scheduleType === ScheduleType.INSTALLMENT
  ).length;


  const totalPenalty = repaymentSchedules
  .filter((schedule) => schedule.scheduleType === ScheduleType.INSTALLMENT)
  .reduce((accumulator, row) => {
    // Tentukan nilai denda berdasarkan status settlement
    const penaltyValue = row.penaltyIsSettled ? row.penaltySettled : row.penaltyCalculated;
    // console.log('[RepaymentDetailPage] penaltyValue : ',penaltyValue);
    // console.log('[RepaymentDetailPage] row.penaltyIsSettled : ',row.penaltyIsSettled);
    // console.log('[RepaymentDetailPage] row.penaltySettled : ',row.penaltySettled);
    // console.log('[RepaymentDetailPage] row.penaltyCalculated : ',row.penaltyCalculated);
    
    // Pastikan nilai adalah angka (antisipasi jika data bernilai null/undefined)
    return accumulator + (Number(penaltyValue) || 0);
  }, 0);
  // ===========================================================================
  // MAPPING DATA SCHEDULES & COLLATERALS
  // ===========================================================================
  
  // Ambil Data Order 0 untuk Upfront
  

  // Kalkulasi Progress Dana Aktual untuk ditambilkan di text
  const underlyingFund = toSafeBig(repaymentSecurity?.contractUnderlyingFund);
  const sinkingFund = toSafeBig(repaymentSecurity?.receiptSinkingFundSum)
  let progressPercentage = sinkingFund.div(underlyingFund);

  // if (underlyingFund > 0) {
  //   progressPercentage = (totalReceipt / underlyingFund) * 100;
  // }

  // console.log("[RepaymentDetailPage] underlyingFund : ",underlyingFund.toFixed(2));
  // console.log("[RepaymentDetailPage] sinkingFund : ",sinkingFund.toFixed(2));
  // console.log("[RepaymentDetailPage] progressPercentage : ",progressPercentage.toFixed(2));
  
  // console.log("[RepaymentDetailPage] animatedProgress : ",animatedProgress);
  // console.log("[RepaymentDetailPage] boundedWidth : ",boundedWidth);
  

  return (
    <div className="mt-20 p-4 w-full max-w-[1400px] mx-auto space-y-5 bg-slate-50/20 min-h-screen text-slate-700 antialiased">
      
      {/* =====================================================================
          HEADER / TITLE PAGE
      ====================================================================== */}

      <div className="ml-2">
        <div className="flex flex-col justify-between items-start mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">DETAIL PEMBAYARAN PENERBIT</h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Detail jadwal pembayaran penerbit, potensi revenue, dan kolateral</p>
        </div>
      </div>

      {/* =====================================================================
          ROW 1: CONTAINER 1 (Utama - 1/3) & CONTAINER 2 (Detail - 2/3)
      ====================================================================== */}
      {/* 💡 UPDATE KOMPONEN INFOROW LO JADI SEPERTI INI BIAR FONT KIRI MEMBESAR */}
      {/* const InfoRow = ({ label, value, fontMono, textClass = "text-slate-800" }: any) => (
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</span>
          <span className={`text-[13px] font-semibold leading-tight ${fontMono ? 'font-mono' : 'font-sans'} ${textClass}`}>
            {value || '-'}
          </span>
        </div>
      ); 
      */}


      {/* ================= MULAI DARI SINI ================= */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        
        {/* CONTAINER 2: Detil Informasi (KIRI - Font Agak Dibesarkan & Fit) */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border-2 border-slate-200 shadow-sm px-4 flex flex-col justify-start">
          <div className='h-14 flex items-center justify-between border-b-2 border-slate-100'>
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider pt-0.5 shrink-0">
              Detil Informasi & Legalitas
            </h3>

            {isEditMode && (
                <button 
                    // 3. Tambahkan onClick di sini (sesuaikan "data.id" dengan variabel ID row/item lo saat ini)
                    onClick={() => openPanel(<RepaymentSecurityEditWrapper repaymentId={repaymentSecurity.id} onSuccess={fetchRepaymentSecurity}/>)}
                    className="self-center text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-2 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Ubah Detail
                </button>
            )}
          </div>
          
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-3 ">
            {/* Baris 1 */}
            <InfoRow label="Nama Penerbit" value={repaymentSecurity.investeeName} />
            <InfoRow label="Nama Penerbit (Legal)" value={repaymentSecurity.investeeNameLegal} />

            {/* Baris 2 */}
            <InfoRow label="Nama Efek" value={repaymentSecurity.securityName} />
            <InfoRow label="Tipe Efek" value={repaymentSecurity.securityType} />
            
            <InfoRow label="Kode Efek" value={repaymentSecurity.securityCode} />
            <InfoRow label="Status" value={repaymentSecurity.contractStatus} />
            
            
            {/* Baris 3 */}
            <InfoRow label="Jumlah Pendanaan" value={formatRupiah(repaymentSecurity.contractUnderlyingFund)} fontMono />
            <InfoRow label="Sinking Fund" value={formatRupiah(repaymentSecurity.receiptSinkingFundSum)} fontMono />
            
            {/* Baris 4 */}
            <InfoRow label="Jumlah Imbal Hasil (p.a.)" value={formatRupiah(repaymentSecurity.contractYieldAmount)} fontMono />
            <InfoRow label="Persentase Imbal Hasil" value={`${formatPercentage(repaymentSecurity.contractYieldRateAnnually)} p.a`} fontMono  />
            
            {/* Baris 5 */}
            <InfoRow label="Penerbitan Ke" value={repaymentSecurity.securitySequence} />
            <InfoRow label="Durasi Efek" value={`${repaymentSecurity.contractDurationInMonths} Bulan`} />
          
            {/* Baris 6 (Kiri Kosong) */}
            <InfoRow label="Mulai" value={formatDate(repaymentSecurity.contractStartDate)} />
            <InfoRow label="Selesai" value={formatDate(repaymentSecurity.contractEndDate)} />
            
            {/* Section Dokumen */}
            <div className="flex col-span-2 w-full gap-x-5 gap-y-3">
              <div className="w-1/2">
                <InfoRow label="Judul Dokumen Perjanjian" value={repaymentSecurity.contractDocumentTitle} />
              </div>
              <div className="w-1/2">
                <InfoRow label="Nomor Dokumen Perjanjian" value={repaymentSecurity.contractDocumentNumber} fontMono />
                <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-4 mb-1">Unduh Dokumen Perjanjian</span>
                    {repaymentSecurity.contractDocumentUrl 
                      ? (<a href={resolveS3Url(repaymentSecurity.contractDocumentUrl as string) ?? '#'} target="_blank" rel="noreferrer" className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 w-fit bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Unduh Dokumen
                    </a>)
                      : (
                        <span className="text-[13px] font-sans font-semibold text-slate-700 ml-0.5">
                          -
                        </span>
                      )}
                </div>
                  
              </div>
            </div>

            
          </div>
        </div>

        {/* CONTAINER 1: Informasi Utama (KANAN) */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border-2 border-slate-200 shadow-sm p-4 flex flex-col justify-between">
          
          <div className="flex flex-col gap-2 mb-6">
            {/* Baris 1: Penerbit, Legalitas, dan Status */}
            <div className="flex justify-between items-start gap-2 border-b-2 border-slate-100 pb-2.5">
              <div className="min-w-0 pr-2">
                <h3 className="text-[16px] font-bold text-slate-800 leading-tight truncate" title={repaymentSecurity.investeeName}>
                  {repaymentSecurity.investeeName}
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5 font-medium truncate" title={repaymentSecurity.investeeNameLegal}>
                  {repaymentSecurity.investeeNameLegal}
                </p>
              </div>
              <div>
                <ContractStatusBadge status={repaymentSecurity.contractStatus || null} size='md'/>
              </div>
                

            </div>

            {/* Baris 2: Tipe Efek & Nama Efek */}
            <div className="flex items-center gap-2 mt-0.5">
              <span>
                <SecurityTypeBadge type={repaymentSecurity.securityType || null} size='md'/>
              </span>
              <span className="text-[14px] font-bold text-slate-800 leading-tight line-clamp-2">
                {repaymentSecurity.securityName}
              </span>
            </div>

            {/* Baris 3: Jumlah Pendanaan */}
            <div className="bg-slate-50 border-2 border-slate-100 rounded-lg p-2.5 my-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Jumlah Pendanaan</span>
              <p className="text-xl xl:text-2xl font-black text-slate-800 font-mono tracking-tighter break-words leading-none">
                {formatRupiah(repaymentSecurity.contractUnderlyingFund)}
              </p>
            </div>

            {/* Baris 4: Imbal Hasil & % */}
            <div className="flex justify-between items-end border-t border-slate-100 pt-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{'Sinking Fund'}</span>
                <span className="text-[12px] font-mono font-semibold text-slate-700">{formatRupiah(repaymentSecurity.receiptSinkingFundSum,undefined, 'zero')}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">% Terkumpul</span>
                <span className="text-[12px] font-mono font-semibold text-slate-700">{formatPercentage(progressPercentage, 'zero')}</span>
              </div>
            </div>

            {/* Baris 4: Imbal Hasil & % */}
            <div className="flex justify-between items-end border-t border-slate-100 pt-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">{repaymentSecurity.securityType === SecurityType.SUKUK ? 'Total Kupon Investor' : 'Total Dividen Investor'}</span>
                <span className="text-[12px] font-mono font-semibold text-slate-700">{formatRupiah(repaymentSecurity.contractYieldAmount)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">% p.a.</span>
                <span className="text-[12px] font-mono font-semibold text-slate-700">{formatPercentage(repaymentSecurity.contractYieldRateAnnually)}</span>
              </div>
            </div>

            {/* Baris 5: Potensi Revenue & % */}
            <div className="flex justify-between items-end border-t border-slate-100 pt-2 text-green-50">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Potensi Revenue Perusahaan</span>
                <span className="text-[12px] font-mono font-semibold text-slate-700">{formatRupiah(totalRevenue)}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">% ESTIMASI</span>
                <span className="text-[12px] font-mono font-semibold text-slate-700">{formatPercentage(totalRevenuePercentage)}</span>
              </div>
            </div>

            {/* Baris 6: Jumlah Cicilan & Kolateral */}
            <div className="flex justify-between items-end border-t border-slate-100 pt-2">
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Jumlah Cicilan</span>
                <span className="text-[12px] font-sans font-semibold text-slate-700">{totalInstallment}x Cicilan</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Durasi</span>
                <span className="text-[12px] font-sans font-semibold text-slate-700">{repaymentSecurity.contractDurationInMonths} Bln</span>
              </div>
            </div>

            <div className="flex justify-between items-end border-t border-slate-100 pt-2">
              {/* Jaminan */}
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Agunan</span>
                <span className="text-[12px] font-sans font-semibold text-slate-700">{securityCollaterals.length} Kolateral</span>
              </div>
              {/* Kanan: Selesai */}
              <div className="flex flex-col text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Denda</span>
                <span className="text-[12px] font-sans font-semibold text-slate-700">
                  <Penalty penalty={totalPenalty} mode='normal'/>
                </span>
              </div>
            </div>

          </div>

          {/* Baris 8: Progress Bar Animasi */}
          <div className="mt-auto pt-3 border-t-2 border-slate-100">
            <div className="flex justify-between text-[10px] font-bold mb-1.5">
              <span className="text-slate-500 uppercase tracking-wider">Sinking Fund</span>
              <span className="text-slate-700">{formatPercentage(progressPercentage, 'zero')} Terkumpul</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
              <div 
                className={`${
                  progressPercentage.lt(100) ? "bg-orange-500" : "bg-green-500"
                } h-full rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${formatPercentage(progressPercentage,'zero',0)}` }}
              ></div>
            </div>
          </div>
        </div>

      </div>

      {/* =====================================================================
          ROW 2: CONTAINER 3 (Tabel Pembayaran Atas-Bawah)
      ====================================================================== */}
      <SchedulePanel 
      repaymentSecurity={repaymentSecurity} 
      repaymentSchedules={repaymentSchedules} 
      penaltyPercentageDaily={repaymentSecurity.contractPenaltyPercentageDaily} 
      isEditMode={isEditMode} 
      openPanel={openPanel}
      onDataChanged={fetchRepaymentSchedules}/>
      
      {/* =====================================================================
          ROW 3: CONTAINER 4 (Revenue) & CONTAINER 5 (Collateral)
      ====================================================================== */}
      <div className="flex flex-col lg:flex-row gap-5">
        
        {/* CONTAINER 4: Revenue Summary (1/2) */}
        <RevenuePanel repaymentSecurity={repaymentSecurity} />

        {/* CONTAINER 5: Daftar Agunan / Kolateral (1/2) */}
        <CollateralPanel securityCollaterals={securityCollaterals} />

      </div>

    </div>
  );
}



