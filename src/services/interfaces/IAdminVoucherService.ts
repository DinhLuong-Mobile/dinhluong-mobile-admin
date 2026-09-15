import { ApiResponse } from '../../types/admin.types';

export interface VoucherRequest {
    code: string;
    discount: number;
    discountType: 'PERCENT' | 'FIXED';
    minOrderAmount: number;
    usageLimit: number;
    expiryDate: string;
    collectable?: boolean;
}

export interface IAdminVoucherService {
    getAllVouchers(params?: { keyword?: string }): Promise<ApiResponse<any>>;
    createVoucher(data: VoucherRequest): Promise<ApiResponse<any>>;
    updateVoucher(id: number | string, data: VoucherRequest): Promise<ApiResponse<any>>;
    deleteVoucher(id: number | string): Promise<ApiResponse<string>>;
}