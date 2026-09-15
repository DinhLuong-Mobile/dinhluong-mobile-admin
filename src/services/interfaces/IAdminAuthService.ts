import type { ApiResponse } from '../../types/common.types';
import type { AdminUser } from '../../types/admin.types'; 

export interface IAdminAuthService {
    login(credentials: { email: string; password: string }): Promise<ApiResponse<AdminUser>>;
    logout(): void;
}