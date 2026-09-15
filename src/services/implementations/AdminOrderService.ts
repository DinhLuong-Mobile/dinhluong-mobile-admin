import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminOrderService } from '../interfaces/IAdminOrderService';
import type { ApiResponse } from '../../types/common.types';
import type { OrderResponse, OrderStatsResponse, OrderFilterParams, BulkStatusRequest } from '../../types/order.types';

export class AdminOrderService implements IAdminOrderService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllOrders(params?: OrderFilterParams) {
        return this.httpClient.get<ApiResponse<OrderResponse[]>>(
            API_CONFIG.ADMIN.ORDERS.BASE,
            { params }
        );
    }

    async getStats() {
        return this.httpClient.get<ApiResponse<OrderStatsResponse>>(
            API_CONFIG.ADMIN.ORDERS.STATS
        );
    }

    async updateStatus(id: number | string, data: { status: string; reason?: string }) {
        return this.httpClient.put<ApiResponse<string>>(
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

    async exportExcel(params?: OrderFilterParams) {
        return this.httpClient.get<Blob>(
            API_CONFIG.ADMIN.ORDERS.EXPORT_EXCEL,
            { 
                params,
                responseType: 'blob',
                headers: { 'Accept': 'application/octet-stream' }
            }
        );
    }
}