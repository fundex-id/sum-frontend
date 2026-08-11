// src/features/repayment-receipt/services/repaymentReceiptService.ts
import { apiPrivate } from '../../../lib/api/apiClient';
import { ApiResponse } from '../../../types/api.type';
import { 
  RepaymentReceiptFormRequest, 
  RepaymentReceiptEditFormResponse, 
  RepaymentReceiptDetailWithAuditResponse 
} from '../dtos/repayment-receipt.dto';

const PREFIX_SCHEDULES = '/repayment/schedules';
const PREFIX_RECEIPTS = '/repayment/receipts';

export const repaymentReceiptService = {
  // DETAIL
  getRepaymentReceiptEditForm: async (receiptId: string): Promise<ApiResponse<RepaymentReceiptEditFormResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_RECEIPTS}/${receiptId}`);
    return response.data;
  },
  
  // LIST
  getRepaymentReceipts: async (scheduleId: string) => {
    const response = await apiPrivate.get(`${PREFIX_SCHEDULES}/${scheduleId}/receipts`);
    return response.data;
  },

  // CREATE
  createRepaymentReceipt: async (
    scheduleId: string, 
    payload: RepaymentReceiptFormRequest | FormData
  ): Promise<RepaymentReceiptDetailWithAuditResponse> => {
    const isFormData = payload instanceof FormData;

    const response = await apiPrivate.post(`${PREFIX_SCHEDULES}/${scheduleId}/receipts`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    return response.data;
  },

  // UPDATE
  updateRepaymentReceipt: async (
    receiptId: string, 
    payload: RepaymentReceiptFormRequest | FormData
  ): Promise<RepaymentReceiptDetailWithAuditResponse> => {
    const isFormData = payload instanceof FormData;

    const response = await apiPrivate.put(`${PREFIX_RECEIPTS}/${receiptId}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    return response.data;
  },

  // DELETE
  deleteRepaymentReceipt: async (receiptId: string): Promise<RepaymentReceiptDetailWithAuditResponse> => {
    const response = await apiPrivate.delete(`${PREFIX_RECEIPTS}/${receiptId}`);
    return response.data;
  },
};