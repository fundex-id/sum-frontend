// src/features/repayment-schedule/services/repaymentScheduleService.ts
import { apiPrivate } from '../../../lib/api/apiClient';
import { ApiResponse } from '../../../types/api.type';
import { 
  RepaymentScheduleFormRequest, 
  RepaymentScheduleItemWithPenaltyResponse, 
  RepaymentScheduleEditFormResponse, 
  RepaymentScheduleDetailWithAuditResponse, 
  RepaymentScheduleDetailResponse, 
  RepaymentScheduleDetailWithPenaltyResponse, 
  RepaymentScheduleCalendar 
} from '../dtos/repayment-schedule.dto';

const PREFIX_SCHEDULES = '/repayment/schedules';
const PREFIX_SECURITIES = '/repayment/securities';

export const repaymentScheduleService = {
  // DETAIL
  getRepaymentScheduleDetail: async (scheduleId: string): Promise<ApiResponse<RepaymentScheduleDetailResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_SCHEDULES}/${scheduleId}`, {
      params: { mode: 'detail' },
    });
    return response.data;
  },

  getRepaymentScheduleDetailWithPenalty: async (scheduleId: string): Promise<ApiResponse<RepaymentScheduleDetailWithPenaltyResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_SCHEDULES}/${scheduleId}`, {
      params: { mode: 'detail-with-penalty' },
    });
    return response.data;
  },

  getRepaymentScheduleEditForm: async (scheduleId: string): Promise<ApiResponse<RepaymentScheduleEditFormResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_SCHEDULES}/${scheduleId}`, {
      params: { mode: 'detail' },
    });
    return response.data;
  },

  getRepaymentScheduleWithPenalty: async (scheduleId: string): Promise<ApiResponse<RepaymentScheduleItemWithPenaltyResponse>> => {
    const response = await apiPrivate.get(`/${PREFIX_SCHEDULES}/${scheduleId}`);
    return response.data;
  },

  // LIST / CALENDAR
  getRepaymentSchedulesCalendar: async (params?: { startMonth?: number; endMonth?: number }): Promise<ApiResponse<RepaymentScheduleCalendar>> => {
    const response = await apiPrivate.get(`${PREFIX_SCHEDULES}/calendar`, {
      params,
    });
    return response.data;
  },


  getRepaymentSchedulesWithPenalty: async (securityId: string): Promise<ApiResponse<RepaymentScheduleItemWithPenaltyResponse>> => {
    // const response = await axios.get(`${BASE_URL}/repayment/securities/${securityId}/schedules`);

    //VALIDASI jika diperlukan
    // if (!securityId || securityId === 'undefined') {
    //   throw new Error('securityId is required before fetching schedules');
    // }

    const response = await apiPrivate.get(`${PREFIX_SECURITIES}/${securityId}/schedules`);
    return response.data;
  },

  // CREATE
  createRepaymentSchedule: async (
    securityId: string, 
    payload: RepaymentScheduleFormRequest
  ): Promise<RepaymentScheduleDetailWithAuditResponse> => {
    const response = await apiPrivate.post(`${PREFIX_SECURITIES}/${securityId}/schedules`, payload);
    return response.data;
  },

  // UPDATE
  updateRepaymentSchedule: async (
    scheduleId: string, 
    payload: RepaymentScheduleFormRequest
  ): Promise<RepaymentScheduleDetailWithAuditResponse> => {
    const response = await apiPrivate.put(`${PREFIX_SCHEDULES}/${scheduleId}`, payload);
    return response.data;
  },

  // DELETE
  deleteRepaymentSchedule: async (scheduleId: string): Promise<RepaymentScheduleDetailWithAuditResponse> => {
    const response = await apiPrivate.delete(`${PREFIX_SCHEDULES}/${scheduleId}`);
    return response.data;
  },
};