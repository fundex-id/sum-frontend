import { ReceiptMethod, ReceiptStatus } from './repayment-receipt.enum';

export interface RepaymentReceiptID {
  // Identifiers & Relations
  id: string; // UUID
}

export interface RepaymentReceiptParent {
  repaymentScheduleId: string; // UUID
}

export interface RepaymentReceiptInfo {
  // Receipt Core Info
  receiptDate: string; // ISO Date string
  receiptStatus: ReceiptStatus | null | '';
  receiptNotes: string | null;
  receiptMethod: ReceiptMethod | null | '';
  receiptDocumentUrl: File | string | null;
}

export interface RepaymentReceiptPayment {
  // Fees & Revenues (Real Cash Received)
  receiptFeeAdministration: string;
  receiptFeeProvision: string;
  receiptFeePlatform: string;
  receiptFeeServicing: string;
  receiptFeeMonitoring: string;
  receiptFeeOther: string;

  // Taxes (Real Cash Cleared)
  receiptFeeAdministrationTax: string;
  receiptFeeProvisionTax: string;
  receiptFeePlatformTax: string;
  receiptFeeServicingTax: string;
  receiptFeeMonitoringTax: string;
  receiptFeeOtherTax: string;

  // Investments, Yields, Penalties (Real Cash Allocations)
  receiptSinkingFund: string;
  receiptYield: string;
  receiptActualLoss: string;
  receiptPenalty: string;

  // Totals
  receiptTotal: string;
  receiptTotalTax: string;
  receiptTotalWithTax: string;
}


export interface RepaymentReceiptAuditTrail {
  // Audit Trails
  createdBy: string;
  createdAt: string; // ISO Datetime string
  updatedBy: string;
  updatedAt: string; // ISO Datetime string
  deletedBy: string | null;
  deletedAt: string | null; // ISO Datetime string
}

export interface RepaymentReceipt 
extends RepaymentReceiptID,
        RepaymentReceiptParent,
        RepaymentReceiptInfo,
        RepaymentReceiptPayment,
        RepaymentReceiptAuditTrail{}