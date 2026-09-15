import { ApiResponse, AdminLoginResponse } from '../../types/admin.types';

export interface IAdminAuthService {
    login(credentials: { email: string; password: string }): Promise<ApiResponse<AdminLoginResponse>>;
    logout(): void;
}