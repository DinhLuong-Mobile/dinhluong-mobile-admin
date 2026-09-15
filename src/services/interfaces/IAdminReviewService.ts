import { ApiResponse } from '../../types/admin.types';

export interface IAdminReviewService {
    getReviews(params?: { 
        keyword?: string; 
        status?: 'PENDING' | 'APPROVED' | 'REJECTED' | string; 
        page?: number; 
        size?: number;
    }): Promise<ApiResponse<any>>;
    
    updateStatus(id: number | string, status: 'PENDING' | 'APPROVED' | 'REJECTED' | string): Promise<ApiResponse<string>>;
    
    replyToReview(id: number | string, data: { content: string }): Promise<ApiResponse<string>>;
    
    deleteReview(id: number | string): Promise<ApiResponse<string>>;
}