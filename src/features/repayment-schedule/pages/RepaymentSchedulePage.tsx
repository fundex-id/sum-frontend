// src/pages/repayment/RepaymentSchedulePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import RepaymentScheduleEditWrapper from '../components/form/RepaymentScheduleEditWrapper';
import ReceiptPanel from '../components/schedule/ReceiptPanel';
import FeeWithTax from '../../../components/ui/FeeWithTax';
import { useGlobalMode } from '../../../contexts/GlobalModeContext';
import { useSidePanel } from '../../../contexts/SidePanelContext';
import { InvoiceSummaryWithPenaltyBig } from '../types/repayment-schedule.type';
import InvoiceStatusBadge from '../../repayment-security/components/badge/InvoiceStatusBadge';
import { ScheduleType } from '../types/repayment-schedule.enum';
import { repaymentScheduleService } from '../services/repaymentScheduleService';
import { repaymentReceiptService } from '../../repayment-receipt/services/repaymentReceiptService';
import { repaymentSecurityService } from '../../repayment-security/services/repaymentSecurityService';
import { RepaymentSecurityDetailResponse } from '../../repayment-security/dtos/repayment-security.dto';
import { RepaymentScheduleDetailWithPenaltyResponse } from '../dtos/repayment-schedule.dto';
import { RepaymentReceiptDetailResponse } from '../../repayment-receipt/dtos/repayment-receipt.dto';
import { toSafeBig } from '../../../utils/number';
import { calculateDays, formatDate } from '../../../utils/date';
import Penalty from '../../../components/ui/Penalty';
import { useBreadcrumb } from '../../../contexts/BreadcrumbContext';
import { formatRupiah } from '../../../utils/currency';

export default function RepaymentSchedulePage() {
  const { repaymentId, scheduleId } = useParams<{ 
    repaymentId: string; 
    scheduleId: string; 
  }>();
  
  const [schedule, setSchedule] = useState<RepaymentScheduleDetailWithPenaltyResponse > ();
  const [receipts, setReceipts] = useState<RepaymentReceiptDetailResponse[]>([]);
  const [repaymentSecurity, setRepaymentSecurity] = useState<RepaymentSecurityDetailResponse>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { isEditMode } = useGlobalMode();
  const { openPanel } = useSidePanel();
  const { setBreadcrumbs } = useBreadcrumb();


  // 1. Callback untuk Schedule (Return data agar bisa dipakai di breadcrumbs)
  const fetchRepaymentSchedule = useCallback(async () => {
    if (!scheduleId) return null;
    try {
      const res = await repaymentScheduleService.getRepaymentScheduleDetailWithPenalty(scheduleId);
      setSchedule(res.data.item);
      return res.data.item; // <-- Kembalikan datanya
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan sistem';
      setError(errorMessage);
      return null;
    }
  }, [scheduleId]);

  // 2. Callback untuk Receipts (Tidak butuh return karena tidak dipakai di breadcrumbs)
  const fetchRepaymentReceipts = useCallback(async () => {
    if (!scheduleId) return;
    try {
      const res = await repaymentReceiptService.getRepaymentReceipts(scheduleId);
      setReceipts(res.data.items || []);
      return res.data.items || [];
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan sistem';
      setError(errorMessage);
    }
  }, [scheduleId]);

  // 3. Callback untuk Security Detail (Return data agar bisa dipakai di breadcrumbs)
  const fetchRepaymentSecurity = useCallback(async () => {
    if (!repaymentId) return null;
    try {
      const res = await repaymentSecurityService.getRepaymentSecurityDetail(repaymentId);
      setRepaymentSecurity(res.data.item);
      return res.data.item; // <-- Kembalikan datanya
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan sistem';
      setError(errorMessage);
      return null;
    }
  }, [repaymentId]);

  useEffect(() => {
    // Guard clause agar tidak mengeksekusi jika ID belum ada
    if (!scheduleId || !repaymentId) return;
  
    const fetchAllDetails = async () => {
      try {
        setLoading(true);
        setError(null);
    
        // Jalankan paralel dan tangkap hasil return dari callback
        const [scheduleRes, receiptsRes, repaymentRes] = await Promise.all([
          fetchRepaymentSchedule(),
          fetchRepaymentReceipts(),
          fetchRepaymentSecurity()
        ]);
    
        // Set Breadcrumbs jika data Schedule & Security berhasil didapat
        if (scheduleRes && repaymentRes) {
          setBreadcrumbs([
            { label: 'DASHBOARD', path: '/dashboard/monitoring' },
            { label: 'REPAYMENT', path: '/repayment/securities' },
            { 
              label: repaymentRes.securityCode ?? 'DETAIL', 
              path: `/repayment/securities/${repaymentRes.id}` 
            },
            { 
              label: `${scheduleRes.scheduleType} ${scheduleRes.scheduleSequence}` ?? 'SCHEDULE', 
              path: `/repayment/securities/${repaymentRes.id}/schedules/${scheduleRes.id}` 
            }
          ]);
        }
    
      } catch (err: any) {
        // Error handling API sudah ditangani di masing-masing try-catch callback
        console.error("Gagal memuat detail data repayment:", err);
      } finally {
        setLoading(false); // Matikan loading global setelah SEMUA request selesai
      }
    };
  
    fetchAllDetails();
  }, [scheduleId, repaymentId, fetchRepaymentSchedule, fetchRepaymentReceipts, fetchRepaymentSecurity
  ]);

  const invoiceSummary: InvoiceSummaryWithPenaltyBig = {
        id: schedule?.id ?? '',
        repaymentSecurityId: schedule?.repaymentSecurityId ?? '',
        scheduleType: schedule?.scheduleType ?? null,
        scheduleSequence: schedule?.scheduleSequence ?? 0,
        scheduleDate: schedule?.scheduleDate ?? '',
        invoiceFeeAdministration : toSafeBig(schedule?.invoiceFeeAdministration),
        invoiceFeeAdministrationTax : toSafeBig(schedule?.invoiceFeeAdministrationTax),
        invoiceFeeProvision : toSafeBig(schedule?.invoiceFeeProvision),
        invoiceFeeProvisionTax : toSafeBig(schedule?.invoiceFeeProvisionTax),
        invoiceFeePlatform : toSafeBig(schedule?.invoiceFeePlatform),
        invoiceFeePlatformTax : toSafeBig(schedule?.invoiceFeePlatformTax),
        invoiceFeeServicing : toSafeBig(schedule?.invoiceFeeServicing),
        invoiceFeeServicingTax : toSafeBig(schedule?.invoiceFeeServicingTax),
        invoiceFeeMonitoring : toSafeBig(schedule?.invoiceFeeMonitoring),
        invoiceFeeMonitoringTax : toSafeBig(schedule?.invoiceFeeMonitoringTax),
        invoiceFeeOther : toSafeBig(schedule?.invoiceFeeOther),
        invoiceFeeOtherTax : toSafeBig(schedule?.invoiceFeeOtherTax),
        invoiceSinkingFund : toSafeBig(schedule?.invoiceSinkingFund),
        invoiceYield : toSafeBig(schedule?.invoiceYield),
        invoiceActualLoss : toSafeBig(schedule?.invoiceActualLoss),
        invoicePenalty : toSafeBig(schedule?.invoicePenalty),
        invoiceTotal : toSafeBig(schedule?.invoiceTotal),
        invoiceTotalTax : toSafeBig(schedule?.invoiceTotalTax),
        invoiceTotalWithTax : toSafeBig(schedule?.invoiceTotalWithTax),
        outstandingTotalWithTax : toSafeBig(schedule?.outstandingTotalWithTax),
        penaltySettled : toSafeBig(schedule?.penaltySettled),
        penaltyCalculated : toSafeBig(schedule?.penaltyCalculated),
        penaltyIsSettled : schedule?.penaltyIsSettled ?? false,
        taxPpn : toSafeBig(repaymentSecurity?.contractTaxPpn),
        taxFactor : toSafeBig(repaymentSecurity?.contractTaxFactor)
  }

  //DENDA
  const daysOverdue = calculateDays(null, invoiceSummary.scheduleDate);
  const penalty = invoiceSummary.penaltyIsSettled?invoiceSummary.penaltySettled:invoiceSummary.penaltyCalculated;
  const actualLoss = invoiceSummary.invoiceActualLoss;
  const invoiceTotalWithTaxAndPenalty = 
        invoiceSummary.invoiceTotalWithTax
        .plus(invoiceSummary.invoiceActualLoss)
        .plus(penalty);
  
  // 1. Loading State
  if (loading) {
    return (
      <div className="mt-20 flex h-64 items-center justify-center">
        <div className="animate-pulse text-sm font-medium text-slate-400">
          Memuat rincian jadwal...
        </div>
      </div>
    );
  }

  // 2. Error State (Masalah Koneksi / Gagal API)
  if (error) {
    return (
      <div className="mt-20 rounded-xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-medium text-rose-600">
        <span>⚠️ Terjadi kesalahan: {error}</span>
      </div>
    );
  }

  // 3. Empty State (Koneksi Sukses, tapi Data Memang Kosong)
  if (!schedule) {
    return (
      <div className="mt-20 rounded-xl border border-amber-200 bg-amber-50 p-4 text-center text-sm font-medium text-amber-600">
        <span>⚠️ Data rincian jadwal tidak ditemukan.</span>
      </div>
    );
  }


  return (
    <div className="p-6 mt-12 bg-slate-50 min-h-screen text-slate-600">
   
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-8">
        <div>
          <div className="flex gap-4">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {schedule.scheduleType === ScheduleType.INSTALLMENT 
                ? `INVOICE CICILAN BULAN KE ${schedule.scheduleSequence}`
                : `INVOICE UPFRONT KE ${schedule.scheduleSequence}`}
            </h1>
          </div> 

          <p className="text-xs text-slate-400 mt-0.5">
            {schedule.scheduleType === ScheduleType.INSTALLMENT 
              ? `Detail rincian invoice cicilan dan riwayat pembayaran pada bulan ke ${schedule.scheduleSequence}`
              : `Detail rincian invoice biaya di awal (upfront fee) dan riwayat pembayaran`}
          </p>
        </div>
        <div>
          <InvoiceStatusBadge status={schedule.invoiceStatus || null} size="lg"/>
        </div>
      </div>

      {/* LAYOUT CONTAINER SUMMARY & DETAIL */}
      <div className="flex flex-col lg:flex-row gap-4 items-start mb-6">
        
        {/* CONTAINER KIRI: DETAIL KOMPONEN TAGIHAN */}
        <div className="w-full lg:w-2/3 bg-white rounded-xl border-2 border-slate-200 shadow-sm px-4 flex flex-col justify-between self-stretch">
          <div className='h-14 flex items-center justify-between border-b-2 border-slate-100 shrink-0'>
            <h3 className="text-[12px] font-bold text-slate-800 uppercase tracking-wider pt-0.5 shrink-0">
              Rincian Komponen Tagihan
            </h3>
            <div>
              {isEditMode && (
                <button 
                  onClick={() => repaymentSecurity && openPanel(<RepaymentScheduleEditWrapper scheduleId={schedule.id} repaymentSecurity={repaymentSecurity} onSuccess={fetchRepaymentSchedule}/>)}
                  className="text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-2 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Ubah Detail
                </button>
              )}
            </div>
          </div>
         
          <div className="grow flex flex-col justify-between text-[13px] font-medium text-slate-700 pt-2 pb-4">
            <div className="space-y-1.5">
                {invoiceSummary.invoiceFeeAdministration.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Biaya Administrasi</span>
                    <FeeWithTax base={invoiceSummary.invoiceFeeAdministration} tax={invoiceSummary.invoiceFeeAdministrationTax} />
                </div>
                )}

                {invoiceSummary.invoiceFeeProvision.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Biaya Provisi</span>
                    <FeeWithTax base={invoiceSummary.invoiceFeeProvision} tax={invoiceSummary.invoiceFeeProvisionTax} />
                </div>
                )}

                {invoiceSummary.invoiceFeePlatform.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Biaya Platform</span>
                    <FeeWithTax base={invoiceSummary.invoiceFeePlatform} tax={invoiceSummary.invoiceFeePlatformTax} />
                </div>
                )}

                {invoiceSummary.invoiceFeeServicing.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Biaya Servicing</span>
                    <FeeWithTax base={invoiceSummary.invoiceFeeServicing} tax={invoiceSummary.invoiceFeeServicingTax} />
                </div>
                )}

                {invoiceSummary.invoiceFeeMonitoring.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Biaya Monitoring</span>
                    <FeeWithTax base={invoiceSummary.invoiceFeeMonitoring} tax={invoiceSummary.invoiceFeeMonitoringTax} />
                </div>
                )}

                {invoiceSummary.invoiceFeeOther.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Biaya Lain-lain</span>
                    <FeeWithTax base={invoiceSummary.invoiceFeeOther} tax={invoiceSummary.invoiceFeeOtherTax} />
                </div>
                )}

                {invoiceSummary.invoiceSinkingFund.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Cicilan Sinking Fund</span>
                    <FeeWithTax base={invoiceSummary.invoiceSinkingFund} />
                </div>
                )}

                {invoiceSummary.invoiceYield.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Imbal hasil / Kupon</span>
                    <FeeWithTax base={invoiceSummary.invoiceYield} />
                </div>
                )}

                {invoiceSummary.invoicePenalty.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Denda</span>
                    <FeeWithTax base={invoiceSummary.invoicePenalty} />
                </div>
                )}

                {invoiceSummary.invoiceActualLoss.gt(0) && (
                <div className="flex justify-between items-center p-2 rounded">
                    <span className="font-normal text-slate-900">Kerugian Riil</span>
                    <FeeWithTax base={invoiceSummary.invoiceActualLoss} />
                </div>
                )}

            </div>
            
            {/* WRAPPER BAGIAN BAWAH (TOTAL & DENDA) */}
            <div>
              <div className="mt-4 border-slate-300 flex flex-col bg-blue-50 border-t-2 border-dashed space-y-1.5">
                  <div className="flex justify-between items-center p-2 rounded border-t border-slate-100 mt-1.5">
                  <span className="font-semibold text-slate-900">TOTAL</span>
                  <FeeWithTax base={invoiceSummary.invoiceTotal} tax={invoiceSummary.invoiceTotalTax} weight="bold" />
                  </div>

                  <div className="flex justify-between items-center p-2 rounded">
                  <span className="font-bold text-slate-900">TOTAL + PPN</span>
                  <FeeWithTax base={invoiceSummary.invoiceTotalWithTax} size="lg" weight="bold" />
                  </div>
              </div>

              { !!daysOverdue && daysOverdue > 0 && invoiceSummary.scheduleType == ScheduleType.INSTALLMENT && (
                  <div className="mt-4 border-rose-200 flex flex-col bg-red-50 border-t-2 border-dashed space-y-1">
                      <div className="flex justify-between items-center p-2 rounded border-t border-slate-100 mt-1">
                      <span className="font-normal ">Denda (total {daysOverdue} hari)</span>

                      <Penalty penalty={penalty} size="md" mode={invoiceSummary.penaltyIsSettled ? 'settled' : 'ongoing'}/>
                      </div>

                      <div className="flex justify-between items-center p-2 rounded border-t border-slate-100">
                      <span className="font-normal ">Kerugian Riil</span>
                      <FeeWithTax base={actualLoss} />
                      </div>

                      <div className="flex justify-between items-center p-2 rounded">
                      <span className="font-bold text-slate-900">TOTAL + PPN + Denda + Kerugian Riil</span>
                      <FeeWithTax base={invoiceTotalWithTaxAndPenalty} size="lg" weight="bold" />
                      </div>
                  </div>
              )}
            </div>
            
          </div>
        </div>

        {/* CONTAINER KANAN: RINGKASAN AKUMULASI (SUMMARY) */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex flex-col justify-between self-start">
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
              Ringkasan Invoice
            </h2>
            <div className="text-[11px] font-medium space-y-2 text-slate-600">
              <div className="flex justify-between">
                <span>Status Invoice</span>
                <span className="font-semibol">
                  {schedule.invoiceStatus || '-'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>No Invoice</span>
                <span className="text-slate-900 font-semibold">{schedule.invoiceNumber ?? '-'}</span>
              </div>
              <div className="flex justify-between border-b-2 pb-4">
                <span>Tanggal Invoicing</span>
                <span className="text-slate-900 font-semibold">{formatDate(schedule.invoiceDate ?? '')}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span>Total Tagihan</span>
                <span className="text-slate-900 font-mono">{formatRupiah(schedule.invoiceTotalWithTax)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tanggal Jatuh Tempo</span>
                <span className="text-slate-900 font-semibold">{formatDate(schedule.scheduleDate)}</span>
              </div>

              <div className="flex justify-between border-b-2 pb-4">
                <span>Catatan / Notes</span>
                <span className="text-slate-900 font-normal">{schedule.invoiceNotes || '-'}</span>
              </div>

              <div className="flex justify-between pt-2">
                <span>Bank (Escrow)</span>
                <div className="flex items-start gap-1.5">
                  { repaymentSecurity?.contractEscrowAccount ? (
                      <>
                        <button 
                          type="button"
                          title="copy nomor va"
                          onClick={() => navigator.clipboard.writeText(repaymentSecurity?.contractEscrowAccount || '')}
                          className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                          </svg>
                        </button>
                        <span className="font-semibold text-slate-900">
                          {repaymentSecurity?.contractEscrowAccount} ({repaymentSecurity?.contractEscrowBank})
                        </span>
                      </> ) :
                        <span className="font-semibold text-slate-900">
                          -
                        </span>
                    }
                </div>
              </div>
              
              <div className="flex justify-between">
                <span>Virtual Account</span>
                <div className="flex items-start gap-1.5">
                  { repaymentSecurity?.contractVaNumber ? (
                    <>
                      <button 
                        type="button"
                        title="copy nomor va"
                        onClick={() => navigator.clipboard.writeText(repaymentSecurity?.contractVaNumber || '')}
                        className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                      </button>
                      <span className="font-semibold text-slate-900">
                        {repaymentSecurity?.contractVaNumber} ({repaymentSecurity?.contractVaBank})
                      </span>
                    </> ) :
                      <span className="font-semibold text-slate-900">
                        -
                      </span>
                  }
                </div>
              </div>

              


            </div>
          </div>
        </div>
      </div>

      {/* KOMPONEN RECEIPT PANEL (KOMPONEN TABEL DIPISAH) */}
      <ReceiptPanel receipts={receipts} invoiceSummary={invoiceSummary} onDataChanged={fetchRepaymentReceipts}/>
    </div>
  );
}