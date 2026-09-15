import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminChatService } from '../interfaces/IAdminChatService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminChatService implements IAdminChatService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getConversations() {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.CHAT.CONVERSATIONS
        );
    }

    async getHistory(userId: number | string) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.CHAT.HISTORY(userId)
        );
    }

    async sendMessage(userId: number | string, data: Record<string, string>) {
        return this.httpClient.post<ApiResponse<any>>(
            API_CONFIG.ADMIN.CHAT.SEND_MESSAGE(userId),
            data
        );
    }
}