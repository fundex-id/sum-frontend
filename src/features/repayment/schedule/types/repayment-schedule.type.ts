import { Big } from 'big.js';
import { InvoiceStatus, ScheduleType } from './repayment-schedule.enum';

export interface RepaymentScheduleID {
  id: string;
}

export interface RepaymentScheduleParent {
  repaymentSecurityId: string; // UUID
}


export interface RepaymentScheduleInfo {
  // Schedule Info
  scheduleType: ScheduleType | null | '';
  scheduleSequence: number;
  scheduleDate: string; // ISO Date string (YYYY-MM-DD)
  
}

export interface RepaymentScheduleInvoiceInfo {
  // Invoice Specifics
  invoiceNumber: string | null;
  invoiceSequence: number;
  invoiceDocumentUrl: string | null;
  invoiceSentTrial: number ;
  invoiceDate: string | null; // ISO Date string (YYYY-MM-DD)
  invoiceStatus: InvoiceStatus | null | '';
  invoiceNotes: string | null;
}

export interface RepaymentScheduleInvoiceFee {
  // Fees & Revenues (Net Base)
  invoiceFeeAdministration: string;
  invoiceFeeProvision: string;
  invoiceFeePlatform: string;
  invoiceFeeServicing: string;
  invoiceFeeMonitoring: string;
  invoiceFeeOther: string;

  // Taxes
  invoiceFeeAdministrationTax: string;
  invoiceFeeProvisionTax: string;
  invoiceFeePlatformTax: string;
  invoiceFeeServicingTax: string;
  invoiceFeeMonitoringTax: string;
  invoiceFeeOtherTax: string;

  // Investments & Penalties
  invoiceSinkingFund: string;
  invoiceYield: string;
  invoiceActualLoss: string;
  invoicePenalty: string;

  // Totals
  invoiceTotal: string;
  invoiceTotalTax: string;
  invoiceTotalWithTax: string;
}

export interface RepaymentScheduleInvoiceFeeBig {
  // Fees & Revenues (Net Base)
  invoiceFeeAdministration: Big;
  invoiceFeeProvision: Big;
  invoiceFeePlatform: Big;
  invoiceFeeServicing: Big;
  invoiceFeeMonitoring: Big;
  invoiceFeeOther: Big;

  // Taxes
  invoiceFeeAdministrationTax: Big;
  invoiceFeeProvisionTax: Big;
  invoiceFeePlatformTax: Big;
  invoiceFeeServicingTax: Big;
  invoiceFeeMonitoringTax: Big;
  invoiceFeeOtherTax: Big;

  // Investments & Penalties
  invoiceSinkingFund: Big;
  invoiceYield: Big;
  invoiceActualLoss: Big;
  invoicePenalty: Big;

  // Totals
  invoiceTotal: Big;
  invoiceTotalTax: Big;
  invoiceTotalWithTax: Big;
}

export interface RepaymentScheduleInvoicePaid {
  paidInvoice: string;
  paidActualLoss: string;
  paidPenalty: string;
  paidPenaltyIsSettled: boolean;
}

export interface RepaymentScheduleInvoicePaidBig {
  paidInvoice: Big;
  paidActualLoss: Big;
  paidPenalty: Big;
  paidPenaltyIsSettled: boolean;
}

export interface RepaymentScheduleAuditTrail {
  // Audit Trails
  createdBy: string;
  createdAt: string; // ISO Datetime string
  updatedBy: string;
  updatedAt: string; // ISO Datetime string
  deletedBy: string | null;
  deletedAt: string | null; // ISO Datetime string
}

export interface RepaymentScheduleInfoSummary 
extends RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo,
        RepaymentScheduleInvoiceInfo {}

export interface ScheduleItem 
extends RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo,
        RepaymentScheduleInvoiceInfo,
        RepaymentScheduleInvoiceFee,
        Pick<RepaymentScheduleAuditTrail, 'createdBy' | 'createdAt'> {}

export interface InvoiceInfo
extends 
        RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo, 
        RepaymentScheduleInvoiceInfo {}

export interface InvoiceSummary 
extends 
        RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo, 
        RepaymentScheduleInvoiceFee {}

export interface InvoiceSummaryWithPenaltyBig 
extends 
        RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo, 
        RepaymentScheduleInvoiceFeeBig {
        outstandingTotalWithTax: Big;
        penaltySettled: Big;
        penaltyIsSettled: boolean;
        penaltyCalculated: Big;
        taxPpn: Big;
        taxFactor: Big;
        }
