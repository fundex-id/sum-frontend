// src/features/security-collateral/services/securityCollateralService.ts
import { apiPrivate } from '../../../lib/api/apiClient';
import { ApiResponse } from '../../../types/api.type';
import { 
  SecurityCollateralItemResponse, 
  SecurityCollateralFormRequest, 
  SecurityCollateralEditFormResponse 
} from '../dtos/security-collateral.dto';

const PREFIX_SECURITIES = '/repayment/securities';
const PREFIX_COLLATERALS = '/security/collaterals';

export const securityCollateralService = {
  /* DETAIL */
  getSecurityCollateral: async (collateralId: string): Promise<ApiResponse<SecurityCollateralItemResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_COLLATERALS}/${collateralId}`);
    return response.data;
  },

  getSecurityCollateralEditForm: async (collateralId: string): Promise<ApiResponse<SecurityCollateralEditFormResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_COLLATERALS}/${collateralId}`);
    return response.data;
  },

  /* LIST */
  getSecurityCollateralItems: async (securityId: string): Promise<ApiResponse<SecurityCollateralItemResponse[]>> => {
    const response = await apiPrivate.get(`${PREFIX_SECURITIES}/${securityId}/collaterals`);
    return response.data;
  },

  /* CREATE */
  createSecurityCollateral: async (
    repaymentSecurityId: string, 
    payload: SecurityCollateralFormRequest | FormData
  ): Promise<SecurityCollateralItemResponse> => {
    const isFormData = payload instanceof FormData;

    const response = await apiPrivate.post(`${PREFIX_SECURITIES}/${repaymentSecurityId}/collaterals`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    return response.data;
  },


  /* UPDATE */
  updateSecurityCollateral: async (
    collateralId: string, 
    payload: SecurityCollateralFormRequest | FormData
  ): Promise<SecurityCollateralItemResponse> => {
    const isFormData = payload instanceof FormData;

    const response = await apiPrivate.put(`${PREFIX_COLLATERALS}/${collateralId}`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
    });

    return response.data;
  },

  /* DELETE */
  deleteSecurityCollateral: async (collateralId: string): Promise<SecurityCollateralItemResponse> => {
    const response = await apiPrivate.delete(`${PREFIX_COLLATERALS}/${collateralId}`);
    return response.data;
  },
  
};