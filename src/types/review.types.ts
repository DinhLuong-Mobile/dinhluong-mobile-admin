export interface AdminCommentResponse {
  id: number;
  productId: number;
  userId: number;
  productName: string;
  productThumbnail: string;
  productSlug: string;
  authorName: string;
  authorPhone: string;
  authorAvatar: string;
  rating: number;
  content: string;
  isPurchased: boolean;
  isAdminReply: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  imageUrls: string[];
}

export interface AdminReplyRequest {
  content: string;
}