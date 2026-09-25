import { CollateralStatus, CollateralType, VerificationStatus } from './security-collateral.enum';

export interface SecurityCollateralID {
  id: string; // UUID
}

export interface SecurityCollateralParent {
  repaymentSecurityId: string; // UUID
}

export interface SecurityCollateralInfo {
  // Core Collateral Info
  collateralType: CollateralType | '' | null;
  collateralDescription: string | null;
  collateralValueEstimated: string; // Appraiser estimation
  collateralStatus: CollateralStatus | null | '';
  executionTime: string | null; // ISO Datetime string
  documentUrl: File | string | null;
}

export interface SecurityCollateralVerificationAll {
  // Administrative: Document Verification
  verificationDocumentStatus: VerificationStatus | null | '';
  verificationDocumentNotes: string | null;
  verificationDocumentBy: string | null;
  verificationDocumentAt: string | null; // ISO Datetime string

  // Administrative: Field/On-Site Verification
  verificationFieldStatus: VerificationStatus | null | '';
  verificationFieldNotes: string | null;
  verificationFieldBy: string | null;
  verificationFieldAt: string | null; // ISO Datetime string

  // Administrative: Legal & Notary Verification
  verificationLegalStatus: VerificationStatus | null | '';
  verificationLegalNotes: string | null;
  verificationLegalBy: string | null;
  verificationLegalAt: string | null; // ISO Datetime string

  // Administrative: Appraisal & Value Verification
  verificationValueStatus: VerificationStatus | null | '';
  verificationValueNotes: string | null;
  verificationValueBy: string | null;
  verificationValueAt: string | null; // ISO Datetime string
}

export interface SecurityCollateralVerificationStatus {
  verificationDocumentStatus: VerificationStatus | null | '';
  verificationFieldStatus: VerificationStatus | null | '';
  verificationLegalStatus: VerificationStatus | null | '';
  verificationValueStatus: VerificationStatus | null | '';
}

export interface SecurityCollateralVerificationNotes {
  verificationDocumentNotes: string | null;
  verificationFieldNotes: string | null;
  verificationLegalNotes: string | null;
  verificationValueNotes: string | null;
}

export interface SecurityCollateralAuditTrail {
  // Audit Trails
  createdBy: string;
  createdAt: string; // ISO Datetime string
  updatedBy: string;
  updatedAt: string; // ISO Datetime string
  deletedBy: string | null;
  deletedAt: string | null; // ISO Datetime string
}

export interface SecurityCollateral
extends SecurityCollateralID,
        SecurityCollateralParent,
        SecurityCollateralInfo,
        SecurityCollateralVerificationAll,
        SecurityCollateralAuditTrail {}

export interface SecurityCollateralItem 
extends SecurityCollateralID,
        SecurityCollateralParent,
        SecurityCollateralInfo,
        SecurityCollateralVerificationStatus,
        SecurityCollateralVerificationNotes {}

export interface SecurityCollateralSummary 
extends SecurityCollateralID,
        SecurityCollateralParent,
        SecurityCollateralInfo,
        SecurityCollateralVerificationStatus {}