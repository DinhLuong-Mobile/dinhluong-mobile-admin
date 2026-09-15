import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminReviewService } from '../interfaces/IAdminReviewService';
import type { ApiResponse } from '../../types/admin.types';

export class AdminReviewService implements IAdminReviewService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getReviews(params?: { keyword?: string; status?: string; page?: number; size?: number }) {
        return this.httpClient.get<ApiResponse<any>>(
            API_CONFIG.ADMIN.REVIEWS.BASE,
            { params }
        );
    }

    async updateStatus(id: number | string, status: string) {
        // Dựa theo Swagger, 'status' là query parameter (in: "query") chứ không phải body
        return this.httpClient.put<ApiResponse<string>>(
            API_CONFIG.ADMIN.REVIEWS.UPDATE_STATUS(id),
            null, // Không có body
            { params: { status } } // Truyền status qua query string
        );
    }

    async replyToReview(id: number | string, data: { content: string }) {
        return this.httpClient.post<ApiResponse<string>>(
            API_CONFIG.ADMIN.REVIEWS.REPLY(id),
            data
        );
    }

    async deleteReview(id: number | string) {
        return this.httpClient.delete<ApiResponse<string>>(
            API_CONFIG.ADMIN.REVIEWS.BY_ID(id)
        );
    }
}