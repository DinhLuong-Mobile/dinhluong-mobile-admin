import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminAuthService } from '../interfaces/IAdminAuthService';
import { adminAuthStorage } from '../storage/adminAuthStorage';
import type { ApiResponse, AdminLoginResponse } from '../../types/common.types';

export class AdminAuthService implements IAdminAuthService {
    constructor(private readonly httpClient: IHttpClient) {}

    async login(credentials: { email: string; password: string }) {
        const response = await this.httpClient.post<ApiResponse<AdminLoginResponse>>(
            API_CONFIG.ADMIN.AUTH.LOGIN,
            credentials
        );

        // Lưu thông tin vào storage ngay trong service nếu login thành công
        // Giúp UI component không cần phải tự làm bước này
        if (response && response.code === 200 && response.data) {
            adminAuthStorage.setUser({
                token: response.data.token,
                refreshToken: response.data.refreshToken,
                user: {
                    id: response.data.id,
                    name: response.data.name,
                    email: response.data.email,
                    avatar: response.data.avatar,
                    typeAccount: response.data.typeAccount
                }
            });
        }

        return response;
    }

    logout() {
        adminAuthStorage.removeUser();
    }
}