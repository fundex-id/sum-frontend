// src/pages/repayment/components/ReceiptPanel.tsx
import React, { useState } from 'react';
import FeeWithTax from '../../../../components/ui/FeeWithTax';
import { useGlobalMode } from '../../../../contexts/GlobalModeContext';
import { useSidePanel } from '../../../../contexts/SidePanelContext';
import { InvoiceSummaryWithPenaltyBig } from '../../types/repayment-schedule.type';
import { RepaymentReceiptDetailResponse } from '../../../repayment-receipt/dtos/repayment-receipt.dto';
import RepaymentReceiptCreateWrapper from '../../../repayment-receipt/components/form/RepaymentReceiptCreateWrapper';
import RepaymentReceiptEditWrapper from '../../../repayment-receipt/components/form/RepaymentReceiptEditWrapper';
import { formatRupiah } from '../../../../utils/currency';
import { formatDate } from '../../../../utils/date';
import ReceiptStatusBadge from '../../../repayment-receipt/components/badge/ReceiptStatusBadge';
import { toSafeBig } from '../../../../utils/number';
import { Big } from 'big.js';
import { InvoiceRemainingBalanceResponse } from '../../dtos/repayment-schedule.dto';
import { ReceiptStatus } from '../../../repayment-receipt/types/repayment-receipt.enum';

interface ReceiptPanelProps {
  receipts: RepaymentReceiptDetailResponse[];
  invoiceSummary: InvoiceSummaryWithPenaltyBig;
  invoiceRemaining: InvoiceRemainingBalanceResponse;
  onDataChanged?: ()=> void;
}

export default function ReceiptPanel({ receipts, invoiceSummary, invoiceRemaining, onDataChanged }: ReceiptPanelProps) {
  const [expandedRows, setExpandedRows] = useState<string[]>([]);
  const { isEditMode } = useGlobalMode();
  const { openPanel } = useSidePanel();

  // Toggle expand/collapse row
  const toggleRow = (id: string) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };


  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      <div className="mb-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Riwayat Penerimaan Pembayaran (Repayment Receipt)
        </h2>
        <p className="text-[10px] text-slate-400 mt-0.5">
          Daftar kuitansi setoran dana dari penerbit untuk tagihan term ini
        </p>
      </div>

      <div className="overflow-x-auto mx-2 px-2">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead>
            <tr className="bg-slate-50 text-[9px] text-slate-500 uppercase tracking-wider border-y border-slate-200">
              
              <th className="w-8 py-2 px-2 font-bold text-left">No</th>
              <th className="w-18 py-2 px-2 font-bold text-center">Status</th>
              <th className="w-28 py-2 px-2 font-bold text-left">Tanggal Diterima</th>
              <th className="py-2 px-2 font-bold text-center">Metode Pembayaran</th>
              <th className="py-2 px-2 font-bold text-center">Notes</th>
              <th className="py-2 px-2 font-bold text-right">Jumlah Dana Diterima</th>
              <th className="w-8 py-2 px-2"></th>
              <th className="w-18 py-2 px-2 font-bold text-center">Dok</th>
              {isEditMode && <th className="py-2.5 px-3 font-bold text-center">Edit</th>}
              
              
            </tr>
          </thead>

          <tbody className="text-[11px] font-medium text-slate-700 divide-y divide-slate-100">
            {receipts.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-4 px-3 text-center text-slate-500 italic">
                  -- Belum ada riwayat pembayaran --
                </td>
              </tr>
            ) : (
              receipts.map((rcpt, idx) => {
                const isExpanded = expandedRows.includes(rcpt.id);

                return (
                  <React.Fragment key={rcpt.id}>
                    <tr
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      onClick={() => toggleRow(rcpt.id)}
                    >
                      <td className="py-2 px-2">{idx + 1}</td>
                      <td className="py-2 px-2 text-center">
                        <ReceiptStatusBadge status={rcpt.receiptStatus||null} size="sm"/>
                      </td>
                      <td className="py-2 px-2">{formatDate(rcpt.receiptDate)}</td>
                      <td className="py-2 px-2 text-center">BANK TRANSFER</td>
                      <td className="py-2 px-2 text-center">{rcpt.receiptNotes}</td>
                      <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600">
                        <FeeWithTax base={rcpt.receiptTotalWithTax} withRp={false} />
                      </td>
                      <td className="py-3 px-3 text-left">
                        <div className="flex items-center justify-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2.5}
                            stroke="currentColor"
                            className={`w-3.5 h-3.5 transition-transform duration-300 ease-in-out ${
                              isExpanded ? 'rotate-45 text-rose-500' : 'text-slate-400'
                            }`}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                          </svg>
                        </div>
                      </td>
                      <td className="py-2 px-2 align-top text-center">
                          <div className="mt-0.5 flex justify-center">
                            <a 
                              href={rcpt.receiptDocumentUrl ?? "#"} 
                              target={rcpt.receiptDocumentUrl ? "_blank" : undefined} 
                              rel="noopener noreferrer" 
                              className={`inline-flex items-center justify-center p-1.5 rounded transition-colors ${
                                rcpt.receiptDocumentUrl
                                  ? "bg-blue-50 text-blue-600 hover:bg-blue-100" 
                                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
                              }`}
                              title={rcpt.receiptDocumentUrl ? "Lihat Dokumen" : "Dokumen Tidak Tersedia"}
                              onClick={(e) => !rcpt.receiptDocumentUrl&& e.preventDefault()} // Mencegah scroll ke atas jika klik '#'
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            </a>
                          </div>
                        </td>
                      {isEditMode && (
                        <td className="py-2 px-2 text-right align-top">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openPanel(
                                <RepaymentReceiptEditWrapper receiptId={rcpt.id} invoiceSummary={invoiceSummary} invoiceRemaining={invoiceRemaining} onSuccess={onDataChanged}/>
                              );
                            }}
                            className="text-[12px] font-semibold bg-amber-50 mx-auto text-amber-700 border border-amber-200 px-1 py-1 rounded-lg hover:bg-amber-100 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-200 flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                        </td>
                      )}
                      
                    </tr>

                    {/* EXPANDED ROW DETAIL */}
                    {/* EXPANDED ROW DETAIL (Selalu di-render, animasinya di-handle CSS) */}
                    <tr>
                      {/* Menggunakan colSpan dinamis agar rapi menutupi semua kolom */}
                      <td colSpan={6} className="p-0 border-none">
                        <div
                          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${
                            isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                          }`}
                        >
                          <div className="overflow-hidden">
                            {/* Pindahkan background, padding, dan border ke div bagian dalam ini */}
                            <div className="py-4 bg-slate-50/50 border-b border-slate-100 flex justify-end gap-4 text-[11px]">
                              
                              <div className="w-2/5 bg border-l-2 border-slate-300 space-y-3 pl-5 px-3 rounded-xl">
                                {toSafeBig(rcpt?.receiptFeeAdministration).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Biaya Administrasi</span>
                                    <FeeWithTax
                                      base={toSafeBig(rcpt.receiptFeeAdministration)}
                                      tax={toSafeBig(rcpt.receiptFeeAdministrationTax)}
                                      size="sm"
                                    />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptFeeProvision).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Biaya Provisi</span>
                                    <FeeWithTax
                                      base={toSafeBig(rcpt.receiptFeeProvision)}
                                      tax={toSafeBig(rcpt.receiptFeeProvisionTax)}
                                      size="sm"
                                    />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptFeePlatform).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Biaya Platform</span>
                                    <FeeWithTax
                                      base={toSafeBig(rcpt.receiptFeePlatform)}
                                      tax={toSafeBig(rcpt.receiptFeePlatformTax)}
                                      size="sm"
                                    />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptFeeServicing).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Biaya Servicing</span>
                                    <FeeWithTax
                                      base={toSafeBig(rcpt.receiptFeeServicing)}
                                      tax={toSafeBig(rcpt.receiptFeeServicingTax)}
                                      size="sm"
                                    />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptFeeMonitoring).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Biaya Monitoring</span>
                                    <FeeWithTax
                                      base={toSafeBig(rcpt.receiptFeeMonitoring)}
                                      tax={toSafeBig(rcpt.receiptFeeMonitoringTax)}
                                      size="sm"
                                    />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptSinkingFund).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Cicilan Sinking Fund</span>
                                    <FeeWithTax base={toSafeBig(rcpt.receiptSinkingFund)} size="sm" />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptYield).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Imbal hasil / Kupon</span>
                                    <FeeWithTax base={toSafeBig(rcpt.receiptYield)} size="sm" />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptFeeOther).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Biaya Lain-lain</span>
                                    <FeeWithTax
                                      base={Number(rcpt.receiptFeeOther)}
                                      tax={Number(rcpt.receiptFeeOtherTax)}
                                      size="sm"
                                    />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptPenalty).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Denda</span>
                                    <FeeWithTax base={toSafeBig(rcpt.receiptPenalty)} size="sm" />
                                  </div>
                                )}

                                {toSafeBig(rcpt?.receiptActualLoss).gt(0) && (
                                  <div className="flex justify-between items-center rounded">
                                    <span className="font-normal text-slate-900">Kerugian Riil</span>
                                    <FeeWithTax base={toSafeBig(rcpt.receiptActualLoss)} size="sm" />
                                  </div>
                                )}

                                <div className="flex justify-between items-center rounded">
                                  <span className="font-semibold text-slate-900">TOTAL</span>
                                  <FeeWithTax
                                    base={toSafeBig(rcpt.receiptTotal)}
                                    tax={toSafeBig(rcpt.receiptTotalTax)}
                                    size="sm"
                                  />
                                </div>

                                <div className="flex justify-between items-center rounded">
                                  <span className="font-bold text-slate-900">TOTAL + PAJAK</span>
                                  <FeeWithTax
                                    base={toSafeBig(rcpt.receiptTotalWithTax)}
                                    size="sm"
                                    weight="bold"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            )}
          </tbody>
          <tfoot>
            {receipts.length > 0 && (
              <>
                  <tr className="bg-slate-50/50 border-t border-slate-200 font-bold">
                      <td colSpan={5} className="py-3 px-2 text-right text-slate-700 text-xs uppercase">
                        Total Pembayaran Diterima
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-slate-700 text-xs">
                      {formatRupiah(
                        receipts
                          .filter(item => item.receiptStatus === ReceiptStatus.SUCCESS)
                          .reduce((sum, item) => sum.plus(toSafeBig(item.receiptTotalWithTax || '0')), new Big('0'))
                      )}
                      </td>
                      <td colSpan={2}></td>
                      {isEditMode && (<td></td>)}
                  </tr>
                  {toSafeBig(invoiceRemaining?.invoiceTotalWithTax).gt(0) && (
                  <tr className="bg-slate-50/50 border-t border-slate-200 font-bold">
                      <td colSpan={5} className="py-3 px-2 text-right text-amber-700  text-xs uppercase">
                        Sisa Pembayaran
                      </td>
                      <td className="py-3 px-2 text-right font-mono text-amber-700  text-xs">
                      {formatRupiah(invoiceRemaining.invoiceTotalWithTax || new Big('0')) }
                      </td>
                      <td colSpan={2}></td>
                      {isEditMode && (<td></td>)}
                  </tr>
                  )}
              </>
              )}
              

          </tfoot>
        </table>
        {/* Row Tambah Receipt Pembayaran */}
        {isEditMode && (
              <div className="border-t-2 border-slate-200 flex items-center justify-center">
              <button
                  type="button"
                  onClick={() => openPanel(<RepaymentReceiptCreateWrapper invoiceSummary={invoiceSummary} invoiceRemaining={invoiceRemaining} onSuccess={onDataChanged}/>)}
                  className="w-11/12 py-4 m-4 last:flex items-center justify-center border-2 border-dashed rounded-lg border-amber-200 bg-amber-50/40 hover:bg-amber-100 text-amber-700 transition-all focus:outline-none focus:ring-2 focus:ring-amber-200 group">
                  <div className="bg-amber-100 p-1 rounded-full group-hover:bg-amber-500 transition-colors">
                    <svg className="w-4 h-4 text-amber-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <span className="font-semibold text-xs pl-1"> Tambah Bukti Pembayaran</span>
                </button>
              </div>
            )}
      </div>
    </div>
  );
}