// src/features/repayment-security/services/repaymentSecurityService.ts
import { apiPrivate } from '../../../../lib/api/apiClient';
import { ApiResponse } from '../../../../types/api.type'
import { RepaymentSecurityCardResponse, 
        RepaymentSecurityDetailResponse, 
        RepaymentSecurityDetailWithAuditResponse, 
        RepaymentSecurityEditFormResponse, 
        RepaymentSecurityFormRequest, 
        RepaymentSecuritySummaryResponse, 
        RepaymentSecurityWithSinkingFundResponse, 
        SecurityLookupResponse } from '../dtos/repayment-security.dto';
        
const PREFIX_REPAYMENT_SECURITIES = '/repayment/securities'; 

export type RepaymentMode = 'detail' | 'summary' | 'detail-with-sf'; 

export const repaymentSecurityService = {
  // SECURITY LOOKUP
  getRepaymentSecurityLookup: async (): Promise<ApiResponse<SecurityLookupResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}/lookup`);
    return response.data;
  },

  // DETAIL
  getRepaymentSecurityDetail: async (id: string): Promise<ApiResponse<RepaymentSecurityDetailResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}/${id}`, {
      params: { mode: 'detail' },
    });
    return response.data;
  },

  getRepaymentSecurityEditForm: async (id: string): Promise<ApiResponse<RepaymentSecurityEditFormResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}/${id}`, {
      params: { mode: 'detail' },
    });
    return response.data;
  },

  getRepaymentSecurityWithSinkingFund: async (id: string): Promise<ApiResponse<RepaymentSecurityWithSinkingFundResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}/${id}`, {
      params: { mode: 'detail-with-sf' },
    });
    return response.data;
  },

  getRepaymentSecuritySummary: async (id: string): Promise<ApiResponse<RepaymentSecuritySummaryResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}/${id}`, {
      params: { mode: 'summary' },
    });
    return response.data;
  },

  getRepaymentSecuritySummary2: async (id: string): Promise<ApiResponse<RepaymentSecuritySummaryResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}/${id}/summary`);
    return response.data;
  },

  // LIST
  getRepaymentSecurityCards: async (): Promise<ApiResponse<RepaymentSecurityCardResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_REPAYMENT_SECURITIES}`); // Setara dengan /repayment/securities
    return response.data;
  },

  // CREATE
  createRepaymentSecurity: async (payload: RepaymentSecurityFormRequest | FormData): Promise<RepaymentSecurityDetailWithAuditResponse> => {
    const isFormData = payload instanceof FormData;
    
    // apiPrivate otomatis menggunakan 'application/json'
    // Tapi kita bisa menimpanya (override) jika mengirim FormData
    const response = await apiPrivate.post(`${PREFIX_REPAYMENT_SECURITIES}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    return response.data;
  },

  // UPDATE
  updateRepaymentSecurity: async (id: string, payload: RepaymentSecurityFormRequest | FormData): Promise<RepaymentSecurityDetailWithAuditResponse> => {
    const isFormData = payload instanceof FormData;
    
    const response = await apiPrivate.put(`${PREFIX_REPAYMENT_SECURITIES}/${id}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    return response.data;
  },

  deleteRepaymentSecurity: async (repaymentSecurityId: string): Promise<RepaymentSecurityDetailWithAuditResponse> => {
    const response = await apiPrivate.delete(`${PREFIX_REPAYMENT_SECURITIES}/${repaymentSecurityId}`);
    return response.data;
  },

  mapRepaymentSecuritySummaryFromDetail: (
    detail: RepaymentSecurityDetailResponse | RepaymentSecurityWithSinkingFundResponse
  ): RepaymentSecuritySummaryResponse => {
    return {
      id: detail.id,
      investeeId: detail.investeeId,
      investeeName: detail.investeeName,
      investeeNameLegal: detail.investeeNameLegal,
      investeeIconUrl: detail.investeeIconUrl, 
      securityId: detail.securityId,
      securityType: detail.securityType, 
      securityContract: detail.securityContract,
      securityName: detail.securityName,
      securityCode: detail.securityCode,
      securitySeries: detail.securitySeries,
      securityPhase: detail.securityPhase,
      securitySequence: detail.securitySequence,
      contractStatus: detail.contractStatus || null,
    };
  },
  
};