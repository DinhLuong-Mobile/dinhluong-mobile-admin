import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminDashboardService } from '../interfaces/IAdminDashboardService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminDashboardService implements IAdminDashboardService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getDashboard(params?: { time?: string; startDate?: string; endDate?: string }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.DASHBOARD.GET_DASHBOARD,
            { params }
        );
    }

    async exportDashboard(params?: { time?: string; startDate?: string; endDate?: string }) {
        // Vì API này trả về file (binary/blob), ta cấu hình responseType trong headers nếu cần, 
        // hoặc xử lý trực tiếp qua httpClient
        return this.httpClient.get<Blob>(
            API_CONFIG.ADMIN.DASHBOARD.EXPORT,
            { 
                params,
                headers: { 'Accept': 'application/octet-stream' }
            }
        );
    }

    async getAiInsights(params?: { time?: string; startDate?: string; endDate?: string }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.DASHBOARD.AI_INSIGHTS,
            { params }
        );
    }
}