import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminVoucherService } from '../interfaces/IAdminVoucherService';
import type { ApiResponse } from '../../types/common.types';
import type { Voucher } from '../../types/voucher.types'; 

export class AdminVoucherService implements IAdminVoucherService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllVouchers(params?: { keyword?: string }) {
        return this.httpClient.get<ApiResponse<Voucher[]>>(
            API_CONFIG.ADMIN.VOUCHERS.BASE,
            { params }
        );
    }

    async createVoucher(data: Partial<Voucher>) {
        return this.httpClient.post<ApiResponse<Voucher>>(
            API_CONFIG.ADMIN.VOUCHERS.BASE,
            data
        );
    }

    async updateVoucher(id: number | string, data: Partial<Voucher>) {
        return this.httpClient.put<ApiResponse<Voucher>>(
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