import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminVoucherService, VoucherRequest } from '../interfaces/IAdminVoucherService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminVoucherService implements IAdminVoucherService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllVouchers(params?: { keyword?: string }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.VOUCHERS.BASE,
            { params }
        );
    }

    async createVoucher(data: VoucherRequest) {
        return this.httpClient.post<ApiResponse<any>>(
            API_CONFIG.ADMIN.VOUCHERS.BASE,
            data
        );
    }

    async updateVoucher(id: number | string, data: VoucherRequest) {
        return this.httpClient.put<ApiResponse<any>>(
            API_CONFIG.ADMIN.VOUCHERS.BY_ID(id),
            data
        );
    }

    async deleteVoucher(id: number | string) {
        return this.httpClient.delete<ApiResponse<string>>(
            API_CONFIG.ADMIN.VOUCHERS.BY_ID(id)
        );
    }
}