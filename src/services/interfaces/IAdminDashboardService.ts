import { ApiResponse } from '../../types/common.types';

export interface IAdminDashboardService {
    getDashboard(params?: { time?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any>>;
    exportDashboard(params?: { time?: string; startDate?: string; endDate?: string }): Promise<Blob>;
    getAiInsights(params?: { time?: string; startDate?: string; endDate?: string }): Promise<ApiResponse<any>>;
}