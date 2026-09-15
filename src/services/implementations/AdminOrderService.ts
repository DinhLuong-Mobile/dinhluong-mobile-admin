import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminOrderService, BulkStatusRequest } from '../interfaces/IAdminOrderService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminOrderService implements IAdminOrderService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllOrders(params?: { status?: string; keyword?: string }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.ORDERS.BASE,
            { params }
        );
    }

    async getStats() {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.ORDERS.STATS
        );
    }

    async updateStatus(id: number | string, data: Record<string, string>) {
        return this.httpClient.put<ApiResponse<any>>(
            API_CONFIG.ADMIN.ORDERS.UPDATE_STATUS(id),
            data
        );
    }

    async updateBulkStatus(data: BulkStatusRequest) {
        return this.httpClient.put<ApiResponse<string>>(
            API_CONFIG.ADMIN.ORDERS.BULK_STATUS,
            data
        );
    }

    async exportExcel(params?: { status?: string; keyword?: string }) {
        return this.httpClient.get<Blob>(
            API_CONFIG.ADMIN.ORDERS.EXPORT_EXCEL,
            { 
                params,
                headers: { 'Accept': 'application/octet-stream' }
            }
        );
    }
}