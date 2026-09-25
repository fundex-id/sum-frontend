// src/features/dashboard/services/monitoringDashboardService.ts

import { apiPrivate } from '../../../lib/api/apiClient';
import { ApiResponse } from '../../../types/api.type';
import {
  CollectionScheduleItem,
  MonitoringSummaryResponse,
  RepaymentReceiptItem,
  RevenueComparisonItem,
} from '../dtos/monitoring-dashboard.dto';

const PREFIX_DASHBOARD = '/dashboard';

export const monitoringDashboardService = {
  /** Row 1 — ringkasan portofolio */
  getSummary: async (): Promise<ApiResponse<MonitoringSummaryResponse>> => {
    const response = await apiPrivate.get(`${PREFIX_DASHBOARD}/summary`);
    return response.data;
  },

  /** Row 2 (kiri) — revenue potensial vs realisasi */
  getRevenueComparison: async (year: number): Promise<ApiResponse<RevenueComparisonItem>> => {
    const response = await apiPrivate.get(`${PREFIX_DASHBOARD}/revenue-comparison`, {
      params: { year },
    });
    return response.data;
  },

  /** Row 2 (kanan) — jadwal penagihan pada bulan tertentu (month: 1-12) */
  getCollectionSchedule: async (year: number, month: number): Promise<ApiResponse<CollectionScheduleItem>> => {
    const response = await apiPrivate.get(`${PREFIX_DASHBOARD}/collection-schedule`, {
      params: { year, month },
    });
    return response.data;
  },

  /** Row 3 — repayment receipt terbaru (descending by paidAt) */
  getLatestReceipts: async (limit = 5): Promise<ApiResponse<RepaymentReceiptItem>> => {
    const response = await apiPrivate.get(`${PREFIX_DASHBOARD}/repayment-receipts/latest`, {
      params: { limit },
    });
    return response.data;
  },
};