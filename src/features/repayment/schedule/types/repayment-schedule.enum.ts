/**
 * Lifecycle flag status. Use to filter outstanding AR (Accounts Receivable).
 */
export enum InvoiceStatus {
    DRAFT = 'DRAFT',
    UNPAID = 'UNPAID',
    PARTIAL = 'PARTIAL',
    PAID = 'PAID',
    OVERDUE = 'OVERDUE',
    VOID = 'VOID',
    WRITE_OFF = 'WRITE_OFF',
  }

  /**
 * Categorizes the billing block. Guides business logic for revenue tracking.
 */
export enum ScheduleType {
    UPFRONT = 'UPFRONT',
    INSTALLMENT = 'INSTALLMENT',
  }
  