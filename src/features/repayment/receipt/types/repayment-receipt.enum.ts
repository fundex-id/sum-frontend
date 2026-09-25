/**
 * Final bookkeeping settlement status block.
 */
export enum ReceiptStatus {
    SUCCESS = 'SUCCESS',
    FAILED = 'FAILED',
    REVERSED = 'REVERSED',
  }

  /**
 * Payment method used to transfer the money.
 */
export enum ReceiptMethod {
    BANK_TRANSFER = 'BANK_TRANSFER',
    VIRTUAL_ACCOUNT = 'VIRTUAL_ACCOUNT',
    GIRO = 'GIRO',
    CORPORATE_CARD = 'CORPORATE_CARD',
    OTHER = 'OTHER', // Ditambahkan untuk mengakomodasi "etc" pada definisi schema
  }

export enum ScheduleType {
  UPFRONT = 'UPFRONT',
  INSTALLMENT = 'INSTALLMENT'
}