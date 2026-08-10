import { InvoiceStatus, ScheduleType } from "../types/repayment-schedule.enum";
import { RepaymentScheduleAuditTrail, RepaymentScheduleID, RepaymentScheduleInfo, RepaymentScheduleInvoiceFee, RepaymentScheduleInvoiceInfo, RepaymentScheduleParent } from "../types/repayment-schedule.type";

export interface RepaymentScheduleDetailResponse
extends RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo,
        RepaymentScheduleInvoiceInfo,
        RepaymentScheduleInvoiceFee {}

export interface RepaymentScheduleDetailWithPenaltyResponse 
extends RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo,
        RepaymentScheduleInvoiceFee,
        RepaymentScheduleInvoiceInfo {
        outstandingTotalWithTax: string;
        penaltySettled: string;
        penaltyIsSettled: boolean;
        penaltyCalculated: string;
          
      }

export interface RepaymentScheduleDetailWithAuditResponse
extends RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo,
        RepaymentScheduleInvoiceInfo,
        RepaymentScheduleInvoiceFee, 
        RepaymentScheduleAuditTrail {}

export interface RepaymentScheduleItemResponse
extends RepaymentScheduleID,
        RepaymentScheduleParent,
        RepaymentScheduleInfo,
        RepaymentScheduleInvoiceInfo,
        RepaymentScheduleInvoiceFee,
        RepaymentScheduleAuditTrail {}

  export interface RepaymentScheduleFormRequest 
  extends RepaymentScheduleParent,
          RepaymentScheduleInfo,
          RepaymentScheduleInvoiceInfo,
          RepaymentScheduleInvoiceFee {}

  export interface RepaymentScheduleEditFormResponse 
  extends RepaymentScheduleParent,
          RepaymentScheduleInfo,
          RepaymentScheduleInvoiceInfo,
          RepaymentScheduleInvoiceFee {}

  export interface RepaymentScheduleItemWithPenaltyResponse 
  extends RepaymentScheduleDetailWithPenaltyResponse {}

  export interface RepaymentScheduleCalendar extends 
  RepaymentScheduleID, 
  RepaymentScheduleParent, 
  RepaymentScheduleInfo, 
  RepaymentScheduleInvoiceInfo,
  Pick<RepaymentScheduleInvoiceFee, 'invoiceTotalWithTax'> {
  
  // -- Join fields dari tabel REPAYMENT_SECURITY --
  investeeName: string;
  investeeNameLegal: string;
  securityCode: string;
  
}
    


