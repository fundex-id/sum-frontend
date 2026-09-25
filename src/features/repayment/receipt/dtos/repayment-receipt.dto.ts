import { RepaymentReceiptID, RepaymentReceiptInfo, RepaymentReceiptParent, RepaymentReceiptPayment } from '../types/repayment-receipt.type';

export interface RepaymentReceiptDetailResponse 
extends RepaymentReceiptID,
        RepaymentReceiptParent,
        RepaymentReceiptInfo,
        RepaymentReceiptPayment {}


export interface RepaymentReceiptDetailWithAuditResponse 
extends RepaymentReceiptID,
        RepaymentReceiptParent,
        RepaymentReceiptInfo,
        RepaymentReceiptPayment {}

export interface RepaymentReceiptFormRequest
extends RepaymentReceiptParent,
        RepaymentReceiptInfo,
        RepaymentReceiptPayment {}

export interface RepaymentReceiptEditFormResponse 
extends RepaymentReceiptParent,
        RepaymentReceiptInfo,
        RepaymentReceiptPayment {}