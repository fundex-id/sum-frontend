import React from 'react';
import { useNavigate } from 'react-router-dom'; // 👈 Ubah import Link jadi useNavigate
import RepaymentScheduleCreateWrapper from '../../../schedule/components/form/RepaymentScheduleCreateWrapper';
import RepaymentScheduleEditWrapper from '../../../schedule/components/form/RepaymentScheduleEditWrapper';
import FeeWithTax from '../../../../../components/ui/FeeWithTax';
import { RepaymentScheduleItemWithPenaltyResponse } from '../../../schedule/dtos/repayment-schedule.dto';
import InvoiceStatusBadge from '../../../schedule/components/badges/InvoiceStatusBadge';
import { formatDate } from '../../../../../utils/date';
import { RepaymentSecurityWithSinkingFundResponse } from '../../dtos/repayment-security.dto';
import Penalty from '../../../../../components/ui/Penalty';
import { InvoiceStatus, ScheduleType } from '../../../schedule/types/repayment-schedule.enum';
import { Big } from 'big.js';
import { toSafeBig } from '../../../../../utils/number';
import { InvoiceInfo } from '../../../schedule/types/repayment-schedule.type';

interface RepaymentScheduleTableProps {
  repaymentSecurity: RepaymentSecurityWithSinkingFundResponse;
  repaymentSchedules: RepaymentScheduleItemWithPenaltyResponse[];
  penaltyPercentageDaily: number | string;
  isEditMode: boolean;
  openPanel: (component: React.ReactNode) => void;
  onDataChanged?: ()=> void;
}

export interface ValidationItem {
  label: string;
  isMatched: boolean;
}

/**
 * Helper untuk menghasilkan pesan error dinamis berdasarkan item yang tidak sesuai (false).
 * Contoh output: "Sinking Fund, Yield Amount, dan Monitoring Fee tidak sesuai"
 */
export const generateMismatchMessage = (items: ValidationItem[]): string => {
  // Filter hanya item yang isMatched-nya false, lalu ambil label-nya saja
  const mismatchedItems = items
    .filter(item => !item.isMatched)
    .map(item => item.label);

  if (mismatchedItems.length === 0) {
    return ''; // Semua sesuai, tidak ada pesan error
  }

  if (mismatchedItems.length === 1) {
    return `${mismatchedItems[0]} tidak sesuai`;
  }

  if (mismatchedItems.length === 2) {
    return `${mismatchedItems[0]} dan ${mismatchedItems[1]} tidak sesuai`;
  }

  // Jika lebih dari 2, gunakan koma dan "dan" di akhir
  const lastItem = mismatchedItems.pop();
  return `${mismatchedItems.join(', ')}, dan ${lastItem} tidak sesuai`;
};

export default function SchedulePanel({
  repaymentSecurity,
  repaymentSchedules,
  isEditMode,
  openPanel,
  onDataChanged,
}: RepaymentScheduleTableProps) {
  
  const navigate = useNavigate(); // 👈 Inisialisasi hook navigasi

  

  const upfrontFee = repaymentSchedules
    .filter(s => s.scheduleType === ScheduleType.UPFRONT)
    .sort((a, b) => a.scheduleSequence - b.scheduleSequence)
    .map(row => ({
      id: row.id,
      no: row.scheduleSequence,
      dueDate: row.scheduleDate || '',
      status: row.invoiceStatus || null,
      admin: toSafeBig(row.invoiceFeeAdministration),
      adminTax: toSafeBig(row.invoiceFeeAdministrationTax),
      provision: toSafeBig(row.invoiceFeeProvision),
      provisionTax: toSafeBig(row.invoiceFeeProvisionTax),
      platform: toSafeBig(row.invoiceFeePlatform),
      platformTax: toSafeBig(row.invoiceFeePlatformTax),
      servicing: toSafeBig(row.invoiceFeeServicing),
      servicingTax: toSafeBig(row.invoiceFeeServicingTax),
      baseTotal: toSafeBig(row.invoiceTotal),
      taxTotal: toSafeBig(row.invoiceTotalTax),
      grandTotal: toSafeBig(row.invoiceTotalWithTax),
    }));

  const installmentsFee = repaymentSchedules
    .filter(s => s.scheduleType === ScheduleType.INSTALLMENT)
    .sort((a, b) => a.scheduleSequence - b.scheduleSequence)
    .map(row => ({
      id: row.id,
      month: row.scheduleSequence,
      dueDate: row.scheduleDate || '',
      sf: toSafeBig(row.invoiceSinkingFund),
      yield: toSafeBig(row.invoiceYield),
      monitoring: toSafeBig(row.invoiceFeeMonitoring),
      taxMonitoring: toSafeBig(row.invoiceFeeMonitoringTax),
      baseTotal: toSafeBig(row.invoiceTotal),
      taxTotal: toSafeBig(row.invoiceTotalTax),
      grandTotal: toSafeBig(row.invoiceTotalWithTax),
      outstanding: toSafeBig(row.outstandingTotalWithTax),
      penaltySettled: toSafeBig(row.penaltySettled),
      penaltyIsSettled: row.penaltyIsSettled,
      penaltyCalculated: toSafeBig(row.penaltyCalculated),
      status: row.invoiceStatus
    }));

    const lastUpfront: InvoiceInfo = repaymentSchedules
    .filter(s => s.scheduleType === ScheduleType.UPFRONT)
    .sort((a, b) => a.scheduleSequence - b.scheduleSequence)
    .map(row => ({
      id: row.id,

      repaymentSecurityId: row.repaymentSecurityId,

      scheduleType: row.scheduleType || null,
      scheduleSequence: row.scheduleSequence,
      scheduleDate: row.scheduleDate || '',

      invoiceNumber: row.invoiceNumber || null,
      invoiceSequence: row.invoiceSequence ?? 0,
      invoiceDocumentUrl: row.invoiceDocumentUrl || null,
      invoiceSentTrial: row.invoiceSentTrial ?? 0,
      invoiceDate: row.invoiceDate || null,
      invoiceStatus: row.invoiceStatus || null,
      invoiceNotes: row.invoiceNotes || null,
    })).slice(-1)[0];

    const lastInstallment: InvoiceInfo = repaymentSchedules
    .filter(s => s.scheduleType === ScheduleType.INSTALLMENT)
    .sort((a, b) => a.scheduleSequence - b.scheduleSequence)
    .map(row => ({
      id: row.id,

      repaymentSecurityId: row.repaymentSecurityId,

      scheduleType: row.scheduleType || null,
      scheduleSequence: row.scheduleSequence,
      scheduleDate: row.scheduleDate || '',

      invoiceNumber: row.invoiceNumber || null,
      invoiceSequence: row.invoiceSequence ?? 0,
      invoiceDocumentUrl: row.invoiceDocumentUrl || null,
      invoiceSentTrial: row.invoiceSentTrial ?? 0,
      invoiceDate: row.invoiceDate || null,
      invoiceStatus: row.invoiceStatus || null,
      invoiceNotes: row.invoiceNotes || null,
    })).slice(-1)[0];


    const totalSinkingFund = installmentsFee.reduce((sum, row) => sum.plus(row.status!==InvoiceStatus.VOID && row.status!==InvoiceStatus.WRITE_OFF ? row.sf : Big(0)), Big(0));
    const totalYieldAmount = installmentsFee.reduce((sum, row) => sum.plus(row.status!==InvoiceStatus.VOID && row.status!==InvoiceStatus.WRITE_OFF ? row.yield : Big(0)), Big(0));
    const totalMonitoringFee = installmentsFee.reduce((sum, row) => sum.plus(row.status!==InvoiceStatus.VOID && row.status!==InvoiceStatus.WRITE_OFF ? row.monitoring:  Big(0)), Big(0));

    const precision = 0;

    const isSinkingFundMatched = totalSinkingFund.round(precision).eq(toSafeBig(repaymentSecurity.contractUnderlyingFund).round(precision));
    const isYieldAmountMatched = totalYieldAmount.round(precision).eq(toSafeBig(repaymentSecurity.contractYieldAmount));
    const isMonitoringFeeMatched = totalMonitoringFee.round(precision).eq(toSafeBig(repaymentSecurity.contractFeeMonitoring));

    const totalCorrectionMessage = generateMismatchMessage([
      { label: 'Sinking Fund', isMatched: isSinkingFundMatched },
      { label: 'Yield Amount', isMatched: isYieldAmountMatched },
      { label: 'Monitoring Fee', isMatched: isMonitoringFeeMatched },
    ]);

    // const totalTaxMonitoring = installmentsFee.reduce((sum, row) => sum.plus(row.taxMonitoring), Big(0));
    // const totalGrandTotal = installmentsFee.reduce((sum, row) => sum.plus(row.grandTotal), Big(0));
  

  // Fungsi navigasi yang akan dipasang ke 3 kolom pertama
  const handleRowClick = (id: string) => {
    navigate(`schedules/${id}`);
  };

  // Helper Classes: 
  // - tdLeftClickable: Meniru Sidebar.tsx (border-l-2 dengan warna rose-500) + cursor pointer
  // - tdClickable: Kolom ke-2 & ke-3 yang bisa diklik
  // - tdMid: Kolom ke-4 sampai sebelum akhir, tidak bisa diklik tapi tetep dapet efek hover bg-slate-50
  const tdLeftClickable = "border-b border-slate-100 border-l-2 border-l-transparent group-hover:border-l-rose-500 group-hover:bg-slate- transition-all duration-150 cursor-pointer";
  const tdClickable = "border-b border-slate-100 group-hover:bg-slate-100 transition-all duration-150 cursor-pointer";
  const tdMid = "border-b border-slate-100 group-hover:bg-slate-100 transition-all duration-150";
  const tdEdit = "border-b border-slate-100 bg-white group-hover:bg-white"; // Kolom edit tetap netral putih

  return (
      <div className="bg-white rounded-xl border-2 border-slate-200 shadow-sm overflow-hidden">
        {/* ROW 1: Tabel Upfront Fee */}
        <div className="p-5 border-b-2 border-slate-200">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-3 border-b-2 border-slate-100 pb-2">Pembayaran di Awal (UPFRONT FEE)</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-500 uppercase tracking-wider border-y border-slate-200">
                  <th className="w-12 py-2 px-2 font-bold text-center">No</th>
                  <th className="w-20 py-2 px-2 font-bold text-center">Status</th>
                  <th className="w-28 py-2 px-2 font-bold text-left">Jatuh Tempo</th>
                  <th className="py-2 px-2 font-bold text-right">Biaya Admin</th>
                  <th className="py-2 px-2 font-bold text-right">Provisi</th>
                  <th className="py-2 px-2 font-bold text-right">Biaya Platform</th>
                  <th className="py-2 px-2 font-bold text-right">Biaya Service</th>
                  <th className="py-2 px-2 font-bold text-right">Biaya Total</th>
                  <th className="py-2 px-2 font-bold text-right">Total + Pajak</th>
                  {isEditMode && <th className="w-12 py-2 px-2 font-bold text-left">Edit</th>}
                </tr>
              </thead>
              <tbody className="text-[11px] font-medium text-slate-700">
                {!upfrontFee || upfrontFee.length === 0 ? (
                  <tr>
                    <td colSpan={isEditMode ? 10 : 9} className="py-4 text-center italic text-slate-400 border-b border-slate-100">
                      -- Data tidak tersedia --
                    </td>
                  </tr>
                ) : (
                  upfrontFee.map((uf) => {
                    return (
                    <tr key={uf.no} className="group">
                        {/* 3 KOLOM AWAL - CLICKABLE */}
                        <td className={`py-2 px-2 text-center font-mono font-normal}`} onClick={() => handleRowClick(uf.id)}>
                          <div className={`rounded-md ${tdLeftClickable}`}>
                            {`${uf.no})`}
                          </div>
                        </td>
                        <td className={`py-2 px-2 text-left align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <InvoiceStatusBadge status={uf.status} size='sm' />
                        </td>
                        <td className={`py-2 px-2 align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <div className="inline-flex items-center gap-1.5 font-normal text-slate-600 transition-colors">
                            {formatDate(uf.dueDate)}
                          </div>
                        </td>

                        {/* SISA KOLOM - NOT CLICKABLE */}
                        <td className={`py-2 px-2 text-right align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <FeeWithTax base={uf.admin.gt(0)?uf.admin:'-'} tax={uf.adminTax} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <FeeWithTax base={uf.provision.gt(0)?uf.provision:'-'} tax={uf.provisionTax} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <FeeWithTax base={uf.platform.gt(0)?uf.platform:'-'} tax={uf.platformTax} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <FeeWithTax base={uf.servicing.gt(0)?uf.servicing:'-'} tax={uf.servicingTax} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <FeeWithTax base={uf.baseTotal} tax={uf.taxTotal} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right align-top ${tdClickable}`} onClick={() => handleRowClick(uf.id)}>
                          <FeeWithTax base={uf.grandTotal} weight="bold" withRp={false} />
                        </td>
                        
                        {isEditMode && (
                          <td className={`py-2 px-2 text-left align-top ${tdEdit}`}>
                              <button 
                              onClick={() => openPanel(<RepaymentScheduleEditWrapper scheduleId={uf.id} repaymentSecurity={repaymentSecurity} onSuccess={onDataChanged}/>)}
                              className="text-[12px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1 py-1 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                              </button>
                          </td>
                        )}
                      </tr>
                    );})
                  
                )}
              </tbody> 
              
            </table>
          </div>
        </div>

        {/* ROW 2: Tabel Jadwal Bulanan */}
        <div className="px-4 py-2">
          <h3 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider my-3 border-b-2 border-slate-100 pb-2">Pembayaran Cicilan Bulanan (INSTALLMENT)</h3>
          <div className="overflow-x-auto">
            <table className="w-full table-fixed text-left border-collapse whitespace-nowrap">
            <thead>
                <tr className="bg-slate-50 text-[9px] text-slate-500 uppercase tracking-wider border-y border-slate-200">
                  <th className="w-12 py-2 px-2 font-bold text-center">No</th>
                  <th className="w-20 py-2 px-2 font-bold text-center">Status</th>
                  <th className="w-28 py-2 px-2 font-bold text-left">Jatuh Tempo</th>
                  <th className="py-2 px-2 font-bold text-right">Cicilan <br />Sinking Fund</th>
                  <th className="py-2 px-2 font-bold text-right">Yield</th>
                  <th className="py-2 px-2 font-bold text-right">Biaya <br />Pemantauan</th>
                  <th className="py-2 px-2 font-bold text-right">Total</th>
                  <th className="py-2 px-2 font-bold text-right">Total + Pajak</th>
                  <th className="py-2 px-2 font-bold text-right">Denda</th>
                  {isEditMode && <th className="w-12 py-2 px-2 font-bold text-left">Edit</th>}
                </tr>
            </thead>
            <tbody className="text-[11px] font-medium text-slate-700">
                {!installmentsFee || installmentsFee.length === 0 ? (
                  <tr>
                    <td colSpan={isEditMode ? 10 : 9} className="py-4 text-center italic text-slate-400 border-b border-slate-100">
                      -- Data tidak tersedia --
                    </td>
                  </tr>
                ) : (
                  installmentsFee.map((sch) => {
                  return (
                      <tr key={sch.month} className={`group align-top ${sch.status===InvoiceStatus.VOID || sch.status===InvoiceStatus.WRITE_OFF ?"[&>*:nth-child(n+4)]:opacity-30":"" }`}>
                        {/* 3 KOLOM AWAL - CLICKABLE */}
                        <td className={`py-2 px-2 text-center font-mono font-normal}`} onClick={() => handleRowClick(sch.id)}>
                          <div className={`rounded-md ${tdLeftClickable}`}>
                            {`${sch.month})`}
                          </div>
                        </td>
                        <td className={`py-2 px-2 text-left font-mono font-bold ${tdClickable}`} onClick={() => handleRowClick(sch.id)}>
                          <InvoiceStatusBadge status={sch.status} size='sm'/>
                        </td>
                        <td className={`py-2 px-2 align-top ${tdClickable}`} onClick={() => handleRowClick(sch.id)}>
                          <div className="inline-flex items-center gap-1.5 font-normal text-slate-600 transition-colors">
                            {`${formatDate(sch.dueDate)}`}
                            
                          </div>
                        </td>

                        {/* SISA KOLOM - NOT CLICKABLE */}
                        <td className={`py-2 px-2 text-right relative ${tdClickable}` } onClick={() => handleRowClick(sch.id)}>
                            <FeeWithTax base={sch.sf} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right relative ${tdClickable}`} onClick={() => handleRowClick(sch.id)}>
                            <FeeWithTax base={sch.yield} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right relative ${tdClickable}`} onClick={() => handleRowClick(sch.id)}>
                            <FeeWithTax base={sch.monitoring} tax={sch.taxMonitoring} withRp={false} />
                        </td>
                        <td className={`py-2 px-2 text-right relative ${tdClickable}`}>
                            <FeeWithTax base={sch.baseTotal} tax={sch.taxTotal} withRp={false} onClick={() => handleRowClick(sch.id)}/>
                        </td>
                        <td className={`py-2 px-2 text-right relative ${tdClickable}`}>
                            <FeeWithTax base={sch.grandTotal} weight="bold" withRp={false} onClick={() => handleRowClick(sch.id)}/>
                        </td>
                        <td className={`py-2 px-2 text-right font-mono font-bold text-xs text-slate-800 ${tdClickable}`} onClick={() => handleRowClick(sch.id)}>
                            <Penalty penalty={sch.penaltyCalculated} mode={sch.penaltyIsSettled ? 'settled' : 'ongoing'} withRp={false} />
                        </td>
                        
                        {isEditMode && (
                        <td className={`py-2 px-2 text-left align-top ${tdEdit}`}>
                            <button 
                            onClick={() => openPanel(<RepaymentScheduleEditWrapper scheduleId={sch.id} repaymentSecurity={repaymentSecurity} onSuccess={onDataChanged}/>)}
                            className="text-[12px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-1 py-1 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                            </button>
                        </td>)}
                      </tr>
                  );
                  })
                )}
            </tbody>
            {installmentsFee && installmentsFee.length > 0 &&
            <tfoot>
                <tr className="bg-slate-50 text-slate-500 tracking-wider border-y border-slate-200">
                  <td className="w-28 py-2 px-2 pr-10 font-bold text-right text-[14px] " colSpan={3}>TOTAL</td>
                  <td className="py-2 px-2 font-bold text-right">
                    <FeeWithTax base={totalSinkingFund} weight='bold' withRp={false} color={`${isSinkingFundMatched?'black':'yellow'}`}/>
                  </td>
                  <td className="py-2 px-2 font-bold text-right">
                    <FeeWithTax base={totalYieldAmount} weight='bold' withRp={false} color={`${isYieldAmountMatched?'black':'yellow'}`}/>
                  </td>
                  <td className="py-2 px-2 font-bold text-right">
                    <FeeWithTax base={totalMonitoringFee} weight='bold' withRp={false} color={`${isMonitoringFeeMatched?'black':'yellow'}`}/>
                  </td>
                  <td className="py-2 px-2 pl-10 text-left text-[9px] text-amber-700" colSpan={3}>
                      {totalCorrectionMessage}
                  </td>
                  {isEditMode && (<td></td>)}
                </tr>
              </tfoot>
            }
            </table>
            {/* ROW 3: Buat Jadwal Pembayaran Baru (Khusus Edit Mode) */}
            {isEditMode && (
              <div className="border-t-2 border-slate-200 flex items-center justify-center">
                <button
                    type="button"
                    onClick={() => openPanel(<RepaymentScheduleCreateWrapper repaymentSecurity={repaymentSecurity} lastUpfront={lastUpfront} lastInstallment={lastInstallment} onSuccess={onDataChanged}/>)}
                    className="w-11/12 py-4 m-4 last:flex items-center justify-center border-2 border-dashed rounded-lg border-amber-200 bg-amber-50/40 hover:bg-amber-100 text-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-200 group">
                    <div className="bg-amber-100 p-1 rounded-full group-hover:bg-amber-500 transition-colors">
                      <svg className="w-4 h-4 text-amber-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="font-semibold text-xs pl-1"> Buat Jadwal Tagihan Baru</span>
                  </button>
                </div>
            )}
          </div>
        </div>

        

      </div>
  );
}