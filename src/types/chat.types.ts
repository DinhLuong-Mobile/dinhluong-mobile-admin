// Dành cho tính năng Live Chat
export interface ChatMessage {
  id: number;
  senderId: number;
  receiverId: number;
  message: string;
  isRead: boolean;
  sentAt: string;
}

export interface ConversationDTO {
  userId: number;
  userName: string;
  userAvatar: string;
  lastMessage: string;
  sentAt: string;
  unreadCount: number;
  isRead: boolean;
}

// Dành cho tính năng AI Generate Content (Ở màn tạo sản phẩm)
export interface AiContentRequest {
  productName: string;
  specificationsJson: string;
  imageUrls: string[];
}

export interface AiSpecExtractRequest {
  rawText: string;
  attributesInfo: string;
}