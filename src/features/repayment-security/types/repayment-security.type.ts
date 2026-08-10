import { ContractStatus, SecurityContract, SecurityType } from "./repayment-security.enum";

// 1. Grup Identitas & Relasi (Sering dipakai untuk Dropdown, Card, atau List Ringkas)

export interface RepaymentSecurityID {
  id: string;
}


export interface RepaymentSecurityIdentity {
  investeeId: string; 
  securityId: string; 
  investeeName: string;
  investeeNameLegal: string;
  investeeIconUrl: string | null;
  securityType: SecurityType | null | '';
  securityContract: SecurityContract | null | '';
  securityName: string;
  securityCode: string;
  securitySeries: number | null;
  securityPhase: number | null;
  securitySequence: number | null;
}

// 2. Grup Investasi Utama, Imbal Hasil, dan Tenor
export interface RepaymentSecurityInvestment {
  contractUnderlyingFund: string;
  contractStartDate: string | null; 
  contractEndDate: string | null; 
  contractDurationInMonths: number | null;
  contractStatus: ContractStatus | null | '';
  contractYieldAmount: string;
  contractYieldRateAnnually: string;
}

// 3. Grup Semua Jenis Biaya (Fee)
export interface RepaymentSecurityFees {
  contractFeeAdministration: string;
  contractFeeAdministrationPercentage: string;
  contractFeeProvision: string;
  contractFeeProvisionPercentage: string;
  contractFeePlatform: string;
  contractFeePlatformPercentage: string;
  contractFeeServicing: string;
  contractFeeServicingPercentage: string;
  contractFeeMonitoring: string;
  contractFeeMonitoringPercentageMonthly: string;
}

// 4. Grup Denda & Pajak
export interface RepaymentSecurityPenaltiesAndTaxes {
  contractPenaltyPercentageDaily: string;
  contractTaxPpn: string;
  contractTaxYield: string;
  contractTaxFactor: string;
}

// 5. Grup Informasi Pembayaran & Kontak Routing
export interface RepaymentSecurityContactAndBank {
  contractEscrowBank: string | null;
  contractEscrowAccount: string | null;
  contractVaBank: string | null;
  contractVaNumber: string | null;
  contractContactEmail: string | null;
  contractContactWhatsapp: string | null;
}

// 6. Grup Legal & Dokumen Kontrak
export interface RepaymentSecurityDocuments {
  contractDocumentTitle: string | null;
  contractDocumentNumber: string | null;
  contractDocumentUrl: File | string | null;
}

export interface RepaymentSecurityFundPaid {
  paidYieldAmount: string;
  paidSinkingFund: string;
}

// 7. Grup Informasi Restrukturisasi (Opsional)
export interface RepaymentSecurityRestructuring {
  restructOrder: number;
  restructParentSecurityId: string | null; 
  restructOriginalSecurityId: string | null; 
}

// 8. Grup Audit Trail (Metadata Sistem)
export interface RepaymentSecurityAuditTrail {
  createdBy: string;
  createdAt: string; 
  updatedBy: string;
  updatedAt: string; 
  deletedBy: string | null;
  deletedAt: string | null; 
}


  