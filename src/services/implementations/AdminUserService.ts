import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminUserService } from '../interfaces/IAdminUserService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminUserService implements IAdminUserService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getAllUsers(params?: { keyword?: string; isEnabled?: boolean }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.USERS.BASE,
            { params }
        );
    }

    async getUserDetail(id: number | string) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.USERS.BY_ID(id)
        );
    }

    async getUserStats() {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.USERS.STATS
        );
    }

    async toggleStatus(id: number | string) {
        return this.httpClient.put<ApiResponse<string>>(
            API_CONFIG.ADMIN.USERS.TOGGLE_STATUS(id),
            {}
        );
    }

    async importUsersExcel(formData: FormData) {
        return this.httpClient.post<ApiResponse<any>>(
            API_CONFIG.ADMIN.USERS.IMPORT_EXCEL,
            formData
        );
    }

    async exportUsersExcel(params?: { keyword?: string; isEnabled?: boolean }) {
        return this.httpClient.get<Blob>(
            API_CONFIG.ADMIN.USERS.EXPORT_EXCEL,
            { 
                params,
                headers: { 'Accept': 'application/octet-stream' }
            }
        );
    }
}