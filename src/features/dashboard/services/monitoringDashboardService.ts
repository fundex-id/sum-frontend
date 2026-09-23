import axios from 'axios';
import {
  ApiResponse,
  CollectionScheduleItem,
  MonitoringSummaryResponse,
  RepaymentReceiptItem,
  RevenueComparisonItem,
} from '../dtos/monitoring-dashboard.dto';

// TODO: ganti dengan axios instance bawaan project (yang sudah punya baseURL + interceptor auth)
// jika repaymentSecurityService sudah memakainya. Tinggal ubah import di bawah.
const api = axios.create({
  baseURL: import.meta.env?.VITE_API_BASE_URL ?? '/api',
});

// Set ke false begitu endpoint backend sudah tersedia.
const USE_MOCK = true;

const delay = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

// =========================================================================
// MOCK DATA (sementara)
// =========================================================================
const mockSummary: MonitoringSummaryResponse = {
  totalPenerbit: 10,
  totalSaham: 8,
  totalSukuk: 5,
  totalOutstanding: 48_750_000_000,
  totalSinkingFund: 12_300_000_000,
  collectionRate: 78.4,
};

// 12 bulan penuh. Bulan yang belum terlewati hanya punya potensial (realized: null).
// Catatan: dummy ini mengasumsikan bulan berjalan = September.
const mockRevenue: RevenueComparisonItem[] = [
  { month: 1, potential: 850_000_000, realized: 850_000_000 },
  { month: 2, potential: 950_000_000, realized: 900_000_000 },
  { month: 3, potential: 1_100_000_000, realized: 1_100_000_000 },
  { month: 4, potential: 750_000_000, realized: 630_000_000 },
  { month: 5, potential: 1_300_000_000, realized: 1_250_000_000 },
  { month: 6, potential: 1_400_000_000, realized: 950_000_000 },
  { month: 7, potential: 1_200_000_000, realized: 1_150_000_000 },
  { month: 8, potential: 1_050_000_000, realized: 1_000_000_000 },
  { month: 9, potential: 1_250_000_000, realized: 620_000_000 },
  { month: 10, potential: 1_300_000_000, realized: null },
  { month: 11, potential: 1_150_000_000, realized: null },
  { month: 12, potential: 1_500_000_000, realized: null },
];

const mockSchedule: CollectionScheduleItem[] = [
  {
    day: 5,
    items: [
      { investeeName: 'Temu Sushi', securityName: 'Sukuk Temu Sushi I', description: 'Setoran Sinking Fund', amount: 85_000_000, status: 'PAID' },
    ],
  },
  {
    day: 12,
    items: [
      { investeeName: 'Temu Sushi', securityName: 'Sukuk Temu Sushi I', description: 'Distribusi Bagi Hasil', amount: 42_500_000, status: 'PARTIAL' },
    ],
  },
  {
    day: 13,
    items: [
      { investeeName: 'Coffee Toffee', securityName: 'Sukuk Coffee Toffee II', description: 'Setoran Sinking Fund', amount: 60_000_000, status: 'PAID' },
    ],
  },
  {
    day: 16,
    items: [
      { investeeName: 'CV Megah Lestari', securityName: 'Sukuk Megah Lestari I', description: 'Monitoring Fee', amount: 15_000_000, status: 'OVERDUE' },
      { investeeName: 'CV Megah Lestari', securityName: 'Sukuk Megah Lestari I', description: 'Denda keterlambatan', amount: 2_250_000, status: 'OVERDUE' },
    ],
  },
  {
    day: 21,
    items: [
      { investeeName: 'PT KKI', securityName: 'Sukuk KKI Tahap 1', description: 'Setoran Sinking Fund', amount: 250_000_000, status: 'UNPAID' },
      { investeeName: 'Nusa Farm', securityName: 'Saham Nusa Farm', description: 'Setoran Sinking Fund', amount: 35_000_000, status: 'PARTIAL' },
    ],
  },
  {
    day: 24,
    items: [
      { investeeName: 'PT Meimo', securityName: 'Sukuk Meimo I', description: 'Distribusi Bagi Hasil', amount: 120_000_000, status: 'UNPAID' },
    ],
  },
  {
    day: 28,
    items: [
      { investeeName: 'Coffee Toffee', securityName: 'Sukuk Coffee Toffee II', description: 'Monitoring Fee', amount: 12_000_000, status: 'DRAFT' },
    ],
  },
];

const mockReceipts: RepaymentReceiptItem[] = [
  { id: 'r-1', receiptNo: 'RCP-2026-0142', investeeName: 'PT KKI', securityName: 'Sukuk KKI Tahap 1', amount: 250_000_000, paidAt: '2026-09-18T09:15:00Z', status: 'PAID' },
  { id: 'r-2', receiptNo: 'RCP-2026-0141', investeeName: 'Temu Sushi', securityName: 'Sukuk Temu Sushi I', amount: 42_500_000, paidAt: '2026-09-15T13:40:00Z', status: 'PAID' },
  { id: 'r-3', receiptNo: 'RCP-2026-0140', investeeName: 'CV Megah Lestari', securityName: 'Sukuk Megah Lestari I', amount: 9_000_000, paidAt: '2026-09-12T08:05:00Z', status: 'PARTIAL' },
  { id: 'r-4', receiptNo: 'RCP-2026-0139', investeeName: 'Coffee Toffee', securityName: 'Sukuk Coffee Toffee II', amount: 60_000_000, paidAt: '2026-09-10T15:22:00Z', status: 'LATE' },
  { id: 'r-5', receiptNo: 'RCP-2026-0138', investeeName: 'PT Meimo', securityName: 'Sukuk Meimo I', amount: 120_000_000, paidAt: '2026-09-05T10:00:00Z', status: 'PAID' },
  { id: 'r-6', receiptNo: 'RCP-2026-0137', investeeName: 'Nusa Farm', securityName: 'Saham Nusa Farm', amount: 35_000_000, paidAt: '2026-08-28T11:30:00Z', status: 'PAID' },
];

// =========================================================================
// SERVICE
// =========================================================================
export const monitoringDashboardService = {
  /** Row 1 — ringkasan portofolio */
  async getSummary(): Promise<ApiResponse<MonitoringSummaryResponse>> {
    if (USE_MOCK) {
      await delay();
      return { data: mockSummary };
    }
    const res = await api.get<ApiResponse<MonitoringSummaryResponse>>('/monitoring/summary');
    return res.data;
  },

  /** Row 2 (kiri) — revenue potensial vs realisasi */
  async getRevenueComparison(year: number): Promise<ApiResponse<RevenueComparisonItem[]>> {
    if (USE_MOCK) {
      await delay();
      return { data: mockRevenue };
    }
    const res = await api.get<ApiResponse<RevenueComparisonItem[]>>('/monitoring/revenue-comparison', {
      params: { year },
    });
    return res.data;
  },

  /** Row 2 (kanan) — jadwal penagihan pada bulan tertentu (month: 1-12) */
  async getCollectionSchedule(year: number, month: number): Promise<ApiResponse<CollectionScheduleItem[]>> {
    if (USE_MOCK) {
      await delay();
      return { data: mockSchedule };
    }
    const res = await api.get<ApiResponse<CollectionScheduleItem[]>>('/monitoring/collection-schedule', {
      params: { year, month },
    });
    return res.data;
  },

  /** Row 3 — repayment receipt terbaru (descending by paidAt) */
  async getLatestReceipts(limit = 5): Promise<ApiResponse<{ items: RepaymentReceiptItem[] }>> {
    if (USE_MOCK) {
      await delay();
      const items = [...mockReceipts]
        .sort((a, b) => new Date(b.paidAt).getTime() - new Date(a.paidAt).getTime())
        .slice(0, limit);
      return { data: { items } };
    }
    const res = await api.get<ApiResponse<{ items: RepaymentReceiptItem[] }>>('/repayment-receipts', {
      params: { sortBy: 'paidAt', sortOrder: 'desc', limit },
    });
    return res.data;
  },
};