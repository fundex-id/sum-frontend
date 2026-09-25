// =========================================================================
// DTOs untuk Monitoring Dashboard
// Sudah disinkronkan dengan response backend src/modules/dashboard.
// ApiResponse<T> generic sekarang dipakai bersama dari '../../types/api.type'
// =========================================================================

import { ReceiptStatus } from "../../repayment/receipt/types/repayment-receipt.enum";
import { InvoiceStatus } from "../../repayment/schedule/types/repayment-schedule.enum";

/** Row 1 — kartu ringkasan */
export interface MonitoringSummaryResponse {
  totalPenerbit: number; // jumlah penerbit unik (1 penerbit bisa punya >1 efek)
  totalSaham: number;
  totalSukuk: number;
  totalOutstanding: number;
  totalSinkingFund: number;
  collectionRate: number; // dalam persen, contoh: 78.4
}

/** Row 2 (kiri) — revenue potensial vs realisasi per bulan */
export interface RevenueComparisonItem {
  month: number; // 1-12
  potential: number; // Rupiah
  realized: number | null; // null / tidak ada = belum ada realisasi (bulan belum terlewati)
}


/** Row 2 (kanan) — item pembayaran pada suatu tanggal */
export interface CollectionDueItem {
  investeeName: string;
  securityName: string;
  description: string; // contoh: 'Setoran Sinking Fund'
  amount: number; // Rupiah
  status: InvoiceStatus;
}

export interface CollectionScheduleItem {
  day: number; // tanggal dalam bulan (1-31)
  items: CollectionDueItem[];
}

export interface RepaymentReceiptItem {
  id: string;
  securityCode: string;
  investeeName: string;
  securityName: string;
  amount: number; // Rupiah
  paidAt: string; // ISO date string
  status: ReceiptStatus;
}