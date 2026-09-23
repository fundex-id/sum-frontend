// =========================================================================
// DTOs untuk Monitoring Dashboard
// Sesuaikan nama field dengan response backend saat endpoint sudah siap.
// =========================================================================

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
  
  /**
   * Status invoice. Jika project sudah punya tipe InvoiceStatus,
   * hapus definisi ini dan import dari sana.
   */
  export type InvoiceStatus = 'DRAFT' | 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'VOID' | 'WRITE_OFF';
  
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
  
  /** Row 3 — tabel repayment_receipt */
  export type RepaymentReceiptStatus = 'PAID' | 'PARTIAL' | 'LATE';
  
  export interface RepaymentReceiptItem {
    id: string;
    receiptNo: string;
    investeeName: string;
    securityName: string;
    amount: number; // Rupiah
    paidAt: string; // ISO date string
    status: RepaymentReceiptStatus;
  }
  
  /** Bentuk umum response API (mengikuti pola `responseData?.data`) */
  export interface ApiResponse<T> {
    data: T;
    message?: string;
  }