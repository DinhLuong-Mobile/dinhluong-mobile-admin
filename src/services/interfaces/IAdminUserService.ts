import { ApiResponse } from '../../types/admin.types';

export interface IAdminUserService {
    getAllUsers(params?: { keyword?: string; isEnabled?: boolean }): Promise<ApiResponse<any>>;
    getUserDetail(id: number | string): Promise<ApiResponse<any>>;
    getUserStats(): Promise<ApiResponse<any>>;
    toggleStatus(id: number | string): Promise<ApiResponse<string>>;
    importUsersExcel(formData: FormData): Promise<ApiResponse<any>>;
    exportUsersExcel(params?: { keyword?: string; isEnabled?: boolean }): Promise<Blob>;
}