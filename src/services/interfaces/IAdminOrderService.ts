import { ApiResponse } from '../../types/admin.types';

export interface BulkStatusRequest {
    orderIds: number[];
    newStatus: string;
    reason?: string;
}

export interface IAdminOrderService {
    getAllOrders(params?: { status?: string; keyword?: string }): Promise<ApiResponse<any>>;
    getStats(): Promise<ApiResponse<any>>;
    updateStatus(id: number | string, data: Record<string, string>): Promise<ApiResponse<any>>;
    updateBulkStatus(data: BulkStatusRequest): Promise<ApiResponse<string>>;
    exportExcel(params?: { status?: string; keyword?: string }): Promise<Blob>;
}