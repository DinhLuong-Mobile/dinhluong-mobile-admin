import { ApiResponse } from '../../types/admin.types';

export interface IAdminChatService {
    getConversations(): Promise<ApiResponse<any>>;
    getHistory(userId: number | string): Promise<ApiResponse<any>>;
    sendMessage(userId: number | string, data: Record<string, string>): Promise<ApiResponse<any>>;
}