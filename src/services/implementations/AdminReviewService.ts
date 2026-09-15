import { IHttpClient } from '../../api/IHttpClient';
import { API_CONFIG } from '../../config/api.config';
import { IAdminReviewService } from '../interfaces/IAdminReviewService';
import type { ApiResponse, PageResponse } from '../../types/common.types';
import type { AdminCommentResponse, AdminReplyRequest } from '../../types/review.types';

export class AdminReviewService implements IAdminReviewService {
    constructor(private readonly httpClient: IHttpClient) {}

    async getReviews(params?: { keyword?: string; status?: string; page?: number; size?: number }) {
        return this.httpClient.get<ApiResponse<PageResponse<AdminCommentResponse>>>(
            API_CONFIG.ADMIN.REVIEWS.BASE,
            { params }
        );
    }

    async updateStatus(id: number | string, status: string) {
       return this.httpClient.put<ApiResponse<string>>(
        `${API_CONFIG.ADMIN.REVIEWS.UPDATE_STATUS(id)}?status=${status}`,
        {} 
    );
    }

    async replyToReview(id: number | string, data: AdminReplyRequest) {
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