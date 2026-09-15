import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminDashboardService } from '../interfaces/IAdminDashboardService';
import type { ApiResponse } from '../../types/common.types';

import type { DashboardResponse, AiBusinessInsightResponse } from '../../types/dashboard.types';

export interface DashboardFilterParams {
    time?: string;
    startDate?: string;
    endDate?: string;
}

export class AdminDashboardService implements IAdminDashboardService {

    constructor(private readonly httpClient: IHttpClient) {}

    async getDashboard(params?: DashboardFilterParams) {
        return this.httpClient.get<ApiResponse<DashboardResponse>>(
            API_CONFIG.ADMIN.DASHBOARD.GET_DASHBOARD,
            { params }
        );
    }

    async exportDashboard(params?: DashboardFilterParams) {
        return this.httpClient.get<Blob>(
            API_CONFIG.ADMIN.DASHBOARD.EXPORT,
            { 
                params,
                responseType: 'blob', 
                headers: { 'Accept': 'application/octet-stream' }
            }
        );
    }

    async getAiInsights(params?: DashboardFilterParams) {
        return this.httpClient.get<ApiResponse<AiBusinessInsightResponse>>(
            API_CONFIG.ADMIN.DASHBOARD.AI_INSIGHTS,
            { params }
        );
    }
}