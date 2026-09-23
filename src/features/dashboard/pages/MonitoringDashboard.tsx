import React, { useState, useEffect, useCallback } from 'react';
import { useBreadcrumb } from '../../../contexts/BreadcrumbContext';
import { monitoringDashboardService } from '../services/monitoringDashboardService';
import {
  CollectionDueItem,
  CollectionScheduleItem,
  InvoiceStatus,
  MonitoringSummaryResponse,
  RepaymentReceiptItem,
  RepaymentReceiptStatus,
  RevenueComparisonItem,
} from '../dtos/monitoring-dashboard.dto';

// =========================================================================
// HELPERS & KONSTANTA
// =========================================================================
const formatRupiah = (num: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(num);

const decimalFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

// Label sumbu Y: 500.000.000 -> "500 Jt", 1.500.000.000 -> "1,5 M"
const formatAxis = (num: number) => {
  if (num === 0) return '0';
  if (num >= 1_000_000_000) return `${decimalFormat.format(num / 1_000_000_000)} M`;
  return `${decimalFormat.format(num / 1_000_000)} Jt`;
};

// Pecahan sumbu Y dibulatkan: 500 Jt / 1 M / 2 M / 5 M / 10 M, maksimal ±5 segmen
const pickAxisStep = (maxValue: number) => {
  const steps = [500_000_000, 1_000_000_000, 2_000_000_000, 5_000_000_000, 10_000_000_000];
  return steps.find((s) => maxValue / s <= 5) ?? steps[steps.length - 1];
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const WEEKDAY_LABELS = ['M', 'S', 'S', 'R', 'K', 'J', 'S']; // Minggu-first

// Palet warna status (disadur dari badge invoice)
const STATUS_STYLE: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-100 text-slate-700 border-slate-300',
  UNPAID: 'bg-amber-50 text-amber-700 border-amber-300',
  PARTIAL: 'bg-lime-50 text-lime-700 border-lime-400',
  PAID: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  OVERDUE: 'bg-rose-50 text-rose-700 border-rose-300',
  VOID: 'bg-zinc-300 text-zinc-500 border-zinc-400',
  WRITE_OFF: 'bg-slate-500 text-white border-slate-600',
};

const STATUS_DOT: Record<InvoiceStatus, string> = {
  DRAFT: 'bg-slate-400',
  UNPAID: 'bg-amber-400',
  PARTIAL: 'bg-lime-500',
  PAID: 'bg-emerald-500',
  OVERDUE: 'bg-rose-500',
  VOID: 'bg-zinc-400',
  WRITE_OFF: 'bg-slate-500',
};

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  UNPAID: 'Belum Dibayar',
  PARTIAL: 'Sebagian',
  PAID: 'Lunas',
  OVERDUE: 'Terlambat',
  VOID: 'Void',
  WRITE_OFF: 'Write Off',
};

// Urutan prioritas untuk menentukan warna sel tanggal jika ada beberapa status di hari yang sama
const STATUS_PRIORITY: InvoiceStatus[] = ['OVERDUE', 'UNPAID', 'PARTIAL', 'DRAFT', 'PAID', 'VOID', 'WRITE_OFF'];

const dominantStatus = (items: CollectionDueItem[]): InvoiceStatus =>
  STATUS_PRIORITY.find((s) => items.some((i) => i.status === s)) ?? 'DRAFT';

const RECEIPT_STATUS_STYLE: Record<RepaymentReceiptStatus, { cls: string; label: string }> = {
  PAID: { cls: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Lunas' },
  PARTIAL: { cls: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Sebagian' },
  LATE: { cls: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Terlambat' },
};

export default function MonitoringDashboard() {
  const [summary, setSummary] = useState<MonitoringSummaryResponse | null>(null);
  const [revenue, setRevenue] = useState<RevenueComparisonItem[]>([]);
  const [schedule, setSchedule] = useState<CollectionScheduleItem[]>([]);
  const [receipts, setReceipts] = useState<RepaymentReceiptItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { setBreadcrumbs } = useBreadcrumb();

  // Bulan berjalan untuk kalender & chart
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-11
  const monthLabel = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Minggu

  // Breadcrumb di-set sekali saat mount (bukan saat render, supaya tidak memicu re-render loop)
  useEffect(() => {
    setBreadcrumbs([{ label: 'DASHBOARD', path: '/dashboard/monitoring' }]);
  }, [setBreadcrumbs]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [summaryRes, revenueRes, scheduleRes, receiptRes] = await Promise.all([
        monitoringDashboardService.getSummary(),
        monitoringDashboardService.getRevenueComparison(year),
        monitoringDashboardService.getCollectionSchedule(year, month + 1),
        monitoringDashboardService.getLatestReceipts(5),
      ]);

      setSummary(summaryRes?.data || null);
      setRevenue(revenueRes?.data || []);
      setSchedule(scheduleRes?.data || []);
      setReceipts(receiptRes?.data?.items || []);
    } catch (err: any) {
      console.error('Gagal memuat data monitoring dashboard:', err);
      setError(err?.response?.data?.message || 'Terjadi kesalahan saat memuat data dari server.');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // ---- Derived: kalender ----
  const scheduleByDay = schedule.reduce<Record<number, CollectionScheduleItem>>((acc, item) => {
    acc[item.day] = item;
    return acc;
  }, {});
  const legendStatuses = STATUS_PRIORITY.filter((s) => schedule.some((e) => e.items.some((i) => i.status === s)));

  // ---- Derived: chart 12 bulan ----
  // Realisasi hanya ditampilkan sampai bulan berjalan; bulan setelahnya potensial saja.
  const chartData = MONTH_LABELS.map((label, i) => {
    const found = revenue.find((r) => r.month === i + 1);
    return {
      label,
      potential: found?.potential ?? 0,
      realized: i <= month ? found?.realized ?? null : null,
    };
  });
  const dataMax = Math.max(0, ...chartData.flatMap((d) => [d.potential, d.realized ?? 0]));
  const axisStep = pickAxisStep(dataMax);
  const axisMax = Math.max(axisStep, Math.ceil(dataMax / axisStep) * axisStep);
  const axisTicks = Array.from({ length: axisMax / axisStep + 1 }, (_, i) => axisMax - i * axisStep); // atas -> 0

  // Jaga-jaga: urutkan & batasi di sisi client juga (descending by paidAt, max 5)
  const latestReceipts = [...receipts]
    .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
    .slice(0, 5);

  return (
    <div className="p-5 w-full max-w-7xl mx-auto space-y-4 bg-slate-50/20 min-h-screen text-slate-600 antialiased">
      {/* =====================================================================
          HEADER / TITLE PAGE
      ====================================================================== */}
      <div className="mt-12 pb-1">
        <h1 className="text-xl font-bold tracking-tight text-slate-700">Dashboard Monitoring</h1>
        <p className="text-xs text-slate-400 mt-0.5">
          Dashboard Sistem Untuk Monitoring (SUM) Securities Crowdfunding FundEx Indonesia
        </p>
      </div>

      {/* KONDISI LOADING */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-sm font-medium text-slate-400 animate-pulse">Memuat data monitoring...</div>
        </div>
      )}

      {/* KONDISI ERROR */}
      {error && (
        <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-sm text-rose-600 font-medium flex items-center justify-center">
          ⚠️ Terjadi kesalahan: {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* =================================================================
              ROW 1 — SUMMARY CARDS
          ================================================================== */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Portofolio */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Total Portofolio</div>
              <div className="text-xl font-bold text-slate-700 mt-1 flex flex-wrap items-baseline gap-1 font-mono">
                {summary?.totalPenerbit ?? 0}
                <span className="text-[10px] font-normal text-slate-400 font-sans">Penerbit</span>
                <span className="text-slate-300 mx-1 font-normal">|</span>
                {summary?.totalSaham ?? 0}
                <span className="text-[10px] font-normal text-slate-400 font-sans">Saham</span>
                <span className="text-slate-300 font-normal">,</span>
                {summary?.totalSukuk ?? 0}
                <span className="text-[10px] font-normal text-slate-400 font-sans">Sukuk</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {(summary?.totalSaham ?? 0) + (summary?.totalSukuk ?? 0)} efek dari {summary?.totalPenerbit ?? 0} penerbit
              </div>
            </div>

            {/* Total Outstanding */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Total Outstanding</div>
              <div className="text-lg font-bold text-slate-700 mt-1.5 font-mono">
                {formatRupiah(summary?.totalOutstanding ?? 0)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Sisa kewajiban seluruh penerbit</div>
            </div>

            {/* Total Sinking Fund */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Total Sinking Fund</div>
              <div className="text-lg font-bold text-slate-700 mt-1.5 font-mono">
                {formatRupiah(summary?.totalSinkingFund ?? 0)}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Saldo dana penampung terkumpul</div>
            </div>

            {/* Collection Rate */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">Collection Rate</div>
              <div className="text-xl font-bold text-slate-700 mt-1 font-mono">
                {(summary?.collectionRate ?? 0).toFixed(1)}%
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-blue-950 h-full rounded-full"
                  style={{ width: `${Math.min(100, summary?.collectionRate ?? 0)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* =================================================================
              ROW 2 — CHART & CALENDAR
          ================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* REVENUE CHART: Potensial vs Realisasi (12 bulan) */}
            <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-600">Revenue: Potensial vs Realisasi</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Perbandingan revenue tahun {year}</p>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-medium">
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-rose-500 rounded-xs"></span>
                    <span className="text-slate-400">Potensial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 bg-blue-950 rounded-xs"></span>
                    <span className="text-slate-400">Realisasi</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-6 grow">
                {/* Y axis */}
                <div className="h-44 flex flex-col justify-between text-[9px] font-mono text-slate-400 text-right w-10 shrink-0">
                  {axisTicks.map((t) => (
                    <span key={t} className="leading-none">
                      {formatAxis(t)}
                    </span>
                  ))}
                </div>

                {/* Plot area */}
                <div className="flex-1 relative">
                  {/* Gridlines */}
                  <div className="absolute inset-x-0 top-0 h-44 flex flex-col justify-between pointer-events-none">
                    {axisTicks.map((t) => (
                      <div key={t} className="border-b border-dashed border-slate-200 w-full h-0"></div>
                    ))}
                  </div>

                  {/* Bars */}
                  <div className="h-44 flex items-end justify-between px-1 relative">
                    {chartData.map((d, i) => {
                      const tooltipAlign =
                        i <= 2 ? 'left-0' : i >= 9 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                      return (
                        <div key={d.label} className="flex-1 h-full flex items-end justify-center gap-0.5 group relative">
                          {/* Potensial (merah) */}
                          <div
                            className="bg-rose-500 w-2 rounded-t-xs transition-colors group-hover:bg-rose-600"
                            style={{ height: `${(d.potential / axisMax) * 100}%` }}
                          ></div>
                          {/* Realisasi (biru tua) — tinggi 0 jika belum ada, agar posisi bar potensial tetap konsisten */}
                          <div
                            className="bg-blue-950 w-2 rounded-t-xs transition-colors group-hover:bg-blue-900"
                            style={{ height: `${((d.realized ?? 0) / axisMax) * 100}%` }}
                          ></div>

                          {/* Tooltip */}
                          <div
                            className={`absolute bottom-full mb-1 ${tooltipAlign} bg-slate-800 text-white text-[10px] py-1 px-2 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 whitespace-nowrap space-y-0.5`}
                          >
                            <div className="font-semibold">
                              {d.label} {year}
                            </div>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                              Potensial: {formatRupiah(d.potential)}
                            </div>
                            <div className="flex items-center gap-1.5 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                              Realisasi: {d.realized === null ? '-' : formatRupiah(d.realized)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* X axis labels */}
                  <div className="flex justify-between px-1 mt-1.5">
                    {chartData.map((d) => (
                      <span key={d.label} className="flex-1 text-center text-[10px] font-semibold text-slate-400">
                        {d.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* CALENDAR: Jadwal Pembayaran */}
            <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-bold text-slate-600">Jadwal Pembayaran</h3>
                <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm capitalize">
                  {monthLabel}
                </span>
              </div>

              <div className="grid grid-cols-7 text-center text-[10px] font-bold text-slate-400 mt-2">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={i}>{label}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1 mt-1 content-start">
                {/* Sel kosong untuk offset hari pertama */}
                {Array.from({ length: firstWeekday }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-7"></div>
                ))}

                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const dayNumber = index + 1;
                  const entry = scheduleByDay[dayNumber];
                  const col = (firstWeekday + index) % 7;
                  const isToday = dayNumber === today.getDate();

                  const cellStyle = entry
                    ? `${STATUS_STYLE[dominantStatus(entry.items)]} border font-semibold`
                    : 'bg-slate-50/60 text-slate-500 hover:bg-slate-100/80';

                  // Tooltip menyesuaikan kolom supaya tidak keluar dari panel
                  const align = col <= 1 ? 'left-0' : col >= 5 ? 'right-0' : 'left-1/2 -translate-x-1/2';
                  const total = entry ? entry.items.reduce((sum, it) => sum + it.amount, 0) : 0;

                  return (
                    <div
                      key={dayNumber}
                      className={`h-7 rounded-md flex flex-col items-center justify-center text-[11px] tracking-tight relative group transition-all ${
                        entry ? 'cursor-pointer' : ''
                      } ${cellStyle} ${isToday ? 'ring-1 ring-blue-950' : ''}`}
                    >
                      <span>{dayNumber}</span>

                      {entry && (
                        <div
                          className={`absolute top-full mt-1 ${align} w-64 bg-slate-800 text-white rounded-lg shadow-lg p-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-40 text-left font-normal`}
                        >
                          <div className="text-[10px] font-semibold mb-1.5 capitalize">
                            {dayNumber} {monthLabel}
                          </div>
                          <ul className="space-y-1.5">
                            {entry.items.map((it, i) => (
                              <li key={i} className="text-[10px] leading-snug">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold">{it.investeeName}</span>
                                  <span className="flex items-center gap-1 text-slate-300 shrink-0">
                                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[it.status]}`}></span>
                                    {STATUS_LABEL[it.status]}
                                  </span>
                                </div>
                                <div className="text-slate-300">{it.securityName}</div>
                                <div className="flex justify-between gap-2 text-slate-300">
                                  <span>{it.description}</span>
                                  <span className="font-mono text-white">{formatRupiah(it.amount)}</span>
                                </div>
                              </li>
                            ))}
                          </ul>
                          {entry.items.length > 1 && (
                            <div className="flex justify-between border-t border-slate-600 mt-2 pt-1.5 text-[10px] font-semibold">
                              <span>Total</span>
                              <span className="font-mono">{formatRupiah(total)}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend (hanya status yang muncul di bulan ini) */}
              {legendStatuses.length > 0 && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3 text-[10px] text-slate-400">
                  {legendStatuses.map((s) => (
                    <div key={s} className="flex items-center gap-1">
                      <span className={`w-2 h-2 rounded-full ${STATUS_DOT[s]}`}></span>
                      {STATUS_LABEL[s]}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* =================================================================
              ROW 3 — REPAYMENT RECEIPT TERBARU
          ================================================================== */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <h3 className="text-xs font-bold text-slate-600">Repayment Receipt Terbaru</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">5 pembayaran terakhir, diurutkan dari yang terbaru.</p>
              </div>
            </div>

            <div className="overflow-x-auto mt-1">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-2 pr-4 font-semibold">No. Receipt</th>
                    <th className="py-2 pr-4 font-semibold">Investee</th>
                    <th className="py-2 pr-4 font-semibold">Security</th>
                    <th className="py-2 pr-4 font-semibold">Tanggal Bayar</th>
                    <th className="py-2 pr-4 font-semibold text-right">Nominal</th>
                    <th className="py-2 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestReceipts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Belum ada pembayaran tercatat.
                      </td>
                    </tr>
                  ) : (
                    latestReceipts.map((r) => {
                      const status = RECEIPT_STATUS_STYLE[r.status];
                      return (
                        <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-2.5 pr-4 font-mono text-slate-500">{r.receiptNo}</td>
                          <td className="py-2.5 pr-4 font-semibold text-slate-700">{r.investeeName}</td>
                          <td className="py-2.5 pr-4 text-slate-500">{r.securityName}</td>
                          <td className="py-2.5 pr-4 text-slate-500">{formatDate(r.paidAt)}</td>
                          <td className="py-2.5 pr-4 text-right font-mono text-slate-700">{formatRupiah(r.amount)}</td>
                          <td className="py-2.5 text-center">
                            <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md border ${status.cls}`}>
                              {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}