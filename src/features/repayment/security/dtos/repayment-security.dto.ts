import { RepaymentSecurityAuditTrail, 
          RepaymentSecurityContactAndBank, 
          RepaymentSecurityDetailInfo, 
          RepaymentSecurityDocuments, 
          RepaymentSecurityFees, 
          RepaymentSecurityID, 
          RepaymentSecurityInvesteeInfo, 
          RepaymentSecurityInvestment, 
          RepaymentSecurityPenaltiesAndTaxes, 
          RepaymentSecurityRestructuring } from "../types/repayment-security.type";

// export interface RepaymentSecurityDetailResponse {
  
// }

export interface RepaymentSecurityDetailResponse 
  extends RepaymentSecurityID,
          RepaymentSecurityInvesteeInfo,
          RepaymentSecurityDetailInfo, 
          RepaymentSecurityInvestment, 
          RepaymentSecurityFees, 
          RepaymentSecurityPenaltiesAndTaxes, 
          RepaymentSecurityContactAndBank, 
          RepaymentSecurityDocuments {}

export interface RepaymentSecurityDetailWithAuditResponse 
extends RepaymentSecurityID,
        RepaymentSecurityInvesteeInfo,
        RepaymentSecurityDetailInfo, 
        RepaymentSecurityInvestment, 
        RepaymentSecurityFees, 
        RepaymentSecurityPenaltiesAndTaxes, 
        RepaymentSecurityContactAndBank, 
        RepaymentSecurityDocuments,
        RepaymentSecurityAuditTrail {}

export interface RepaymentSecurityWithSinkingFundResponse 
  extends RepaymentSecurityDetailResponse {
    receiptSinkingFundSum: string;
}

// 1. DTO untuk masing-masing item (fokus ke isi data.items)
export interface RepaymentSecurityCardResponse 
  extends RepaymentSecurityID,
          RepaymentSecurityInvesteeInfo,
          RepaymentSecurityDetailInfo, 
          RepaymentSecurityInvestment {
    receiptSinkingFundSum: string;
}

export interface RepaymentSecuritySummaryResponse 
  extends RepaymentSecurityID,
          RepaymentSecurityInvesteeInfo,
          RepaymentSecurityDetailInfo,
          Pick<RepaymentSecurityInvestment, 'contractStatus'>{
}

export interface SecurityLookupResponse 
  extends RepaymentSecurityID,
          RepaymentSecurityInvesteeInfo,
          RepaymentSecurityDetailInfo {
}

  // file: repayment-security-item.dto.ts

  export interface RepaymentSecurityFormRequest 
  extends RepaymentSecurityInvesteeInfo,
          RepaymentSecurityDetailInfo, 
          RepaymentSecurityInvestment, 
          RepaymentSecurityFees, 
          RepaymentSecurityPenaltiesAndTaxes, 
          RepaymentSecurityContactAndBank, 
          RepaymentSecurityDocuments, 
          RepaymentSecurityRestructuring {

      contractFeeMonitoringMonthly: string;
      contractFeeMonitoringPercentage: string;

      scheduleUpfrontFlag: boolean;
      scheduleInstallmentFlag: boolean;
      scheduleUpfrontDate: string | null;
      scheduleInstallmentDate: string | null;

          }

  export interface RepaymentSecurityEditFormResponse 
  extends RepaymentSecurityInvesteeInfo,
          RepaymentSecurityDetailInfo, 
          RepaymentSecurityInvestment, 
          RepaymentSecurityFees, 
          RepaymentSecurityPenaltiesAndTaxes, 
          RepaymentSecurityContactAndBank, 
          RepaymentSecurityDocuments, 
          RepaymentSecurityRestructuring {}

// export interface RepaymentSecurityFormRequest {
//     id: string | null;
//     investeeId: string;
//     investeeName: string;
//     investeeNameLegal: string;
//     investeeIconUrl: string;
//     securityId: string;
//     securityType: SecurityType | null;
//     securityName: string;
//     securityCode: string;
//     securitySeries: number | null;
//     securityPhase: number | null;
//     securitySequence: number | null;
  
//     contractStartDate: string;
//     contractEndDate: string;
//     contractDurationInMonths: number;
//     contractStatus: ContractStatus | '';
  
//     contractUnderlyingFund: string;
//     contractYieldAmount: string;
//     contractYieldRateAnnually: string;
//     contractFeeAdministration: string;
//     contractFeeAdministrationPercentage: string;
//     contractFeeProvision: string;
//     contractFeeProvisionPercentage: string;
//     contractFeePlatform: string;
//     contractFeePlatformPercentage: string;
//     contractFeeServicing: string;
//     contractFeeServicingPercentage: string;
//     contractFeeMonitoringMonthly: string;
//     contractFeeMonitoringPercentageMonthly: string;
//     contractFeeMonitoring: string;
//     contractFeeMonitoringPercentage: string;
  
//     contractTaxPpn: string;
//     contractTaxFactor: string;
//     contractTaxYield: string;
//     contractPenaltyPercentageDaily: string;
  
//     contractEscrowBank: string;
//     contractEscrowAccount: string;
//     contractVaBank: string;
//     contractVaNumber: string;
//     contractContactEmail: string;
//     contractContactWhatsapp: string;
  
//     contractDocumentTitle: string;
//     contractDocumentNumber: string;
//     contractDocumentUrl: File | null;
//     restructOrder: number | null;
//     restructParentSecurityId: string | null;
//     restructOriginalSecurityId: string | null;

//     scheduleUpfrontFlag: boolean;
//     scheduleInstallmentFlag: boolean;
//     scheduleUpfrontDate: string;
//     scheduleInstallmentDate: string;

  // }

// export interface RepaymentSecurityEditFormResponse {
//   id: string;
//   investeeId: string;
//   investeeName: string;
//   investeeNameLegal: string;
//   investeeIconUrl: string | null;
  
//   securityId: string;
//   securityType: SecurityType | null; // Union literal type untuk auto-complete
//   securityName: string;
//   securityCode: string;
//   securitySeries: number;
//   securityPhase: number;
//   securitySequence: number;
  
//   contractDocumentTitle: string | null;
//   contractDocumentNumber: string | null;
//   contractDocumentUrl: string | null;
  
//   contractUnderlyingFund: string; // Bentuk nominal di JSON berupa string
//   contractStartDate: string; // Format ISO Date string
//   contractEndDate: string; // Format ISO Date string
//   contractDurationInMonths: number;
//   contractStatus: ContractStatus | null;
  
//   contractYieldAmount: string;
//   contractYieldRateAnnually: string;
  
//   contractFeeAdministration: string;
//   contractFeeAdministrationPercentage: string;
//   contractFeeProvision: string;
//   contractFeeProvisionPercentage: string;
//   contractFeePlatform: string;
//   contractFeePlatformPercentage: string;
//   contractFeeServicing: string;
//   contractFeeServicingPercentage: string;
//   contractFeeMonitoring: string;
//   contractFeeMonitoringPercentageMonthly: string;
  
//   contractPenaltyPercentageDaily: string;
  
//   contractTaxPpn: string;
//   contractTaxYield: string;
//   contractTaxFactor: string;
  
//   contractEscrowBank: string;
//   contractEscrowAccount: string;
//   contractVaBank: string;
//   contractVaNumber: string;
//   contractContactEmail: string;
//   contractContactWhatsapp: string;
  
//   restructOrder: number;
//   restructParentSecurityId: string | null;
//   restructOriginalSecurityId: string | null;
  
//   createdBy: string;
//   createdAt: string; // Format ISO Date string
//   updatedBy: string;
//   updatedAt: string; // Format ISO Date string
//   deletedBy: string | null;
//   deletedAt: string | null;
// }

  