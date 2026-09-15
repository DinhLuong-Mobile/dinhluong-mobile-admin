import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminPaymentService } from '../interfaces/IAdminPaymentService';
import type { ApiResponse } from '../../types/common.types';
import type { PaymentResponse, PaymentFilterParams } from '../../types/payment.types';

export class AdminPaymentService implements IAdminPaymentService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllPayments(params?: PaymentFilterParams) {
        return this.httpClient.get<ApiResponse<PaymentResponse[]>>(
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