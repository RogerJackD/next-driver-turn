import type { ReportFilters, ReportResponse } from '@/types';
import { authUtils } from '@/utils/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const reportsService = {
  getReport: async (filters: ReportFilters): Promise<ReportResponse> => {
    try {
      const params = new URLSearchParams();
      params.append('reportType', filters.reportType);

      if (filters.vehicleStopId) params.append('vehicleStopId', String(filters.vehicleStopId));
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.exitReason) params.append('exitReason', filters.exitReason);
      if (filters.registerStatus) params.append('registerStatus', filters.registerStatus);
      if (filters.driverId) params.append('driverId', String(filters.driverId));

      if (filters.reportType === 'records') {
        if (filters.page) params.append('page', String(filters.page));
        if (filters.limit) params.append('limit', String(filters.limit));
      }

      const response = await fetch(`${API_BASE_URL}/reports?${params.toString()}`, {
        method: 'GET',
        headers: authUtils.getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || `Error ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching report:', error);
      throw error;
    }
  },
};
