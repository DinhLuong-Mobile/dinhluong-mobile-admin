import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminPaymentService } from '../interfaces/IAdminPaymentService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminPaymentService implements IAdminPaymentService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllPayments(params?: { method?: string; status?: string; keyword?: string }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.PAYMENTS.BASE,
            { params }
        );
    }

    async confirmRefund(id: number | string) {
        return this.httpClient.put<ApiResponse<string>>(
            API_CONFIG.ADMIN.PAYMENTS.CONFIRM_REFUND(id),
            {}
        );
    }
}