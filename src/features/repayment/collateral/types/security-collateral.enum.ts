/**
 * Collateral asset category index text.
 */
export enum CollateralType {
    INVOICE = 'INVOICE',
    CEK_MUNDUR = 'CEK_MUNDUR',
    SERTIFIKAT_TANAH = 'SERTIFIKAT_TANAH',
    BPKB_MOBIL = 'BPKB_MOBIL',
    OTHER = 'OTHER', // Ditambahkan untuk mengakomodasi "etc"
  }

  /**
 * Current status of collateral.
 */
export enum CollateralStatus {
    IDLE = 'IDLE',
    WARNING = 'WARNING',
    LITIGATION = 'LITIGATION',
    EXECUTING = 'EXECUTING',
    EXECUTED = 'EXECUTED',
    RELEASED = 'RELEASED',
  }

  /**
 * Administrative verification state used across document, field, legal, and value validation.
 */
export enum VerificationStatus {
    SUBMITTED = 'SUBMITTED',
    UNDER_REVIEW = 'UNDER_REVIEW',
    VERIFIED = 'VERIFIED',
    DECLINED = 'DECLINED',
  }