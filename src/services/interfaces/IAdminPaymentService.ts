import { ApiResponse } from '../../types/admin.types';

export interface IAdminPaymentService {
    getAllPayments(params?: { method?: string; status?: string; keyword?: string }): Promise<ApiResponse<any>>;
    confirmRefund(id: number | string): Promise<ApiResponse<string>>;
}