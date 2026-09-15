export interface OrderFilterParams {
    status?: string;
    keyword?: string;
    page?: number;
    size?: number;
}
export interface OrderItemResponse {
  id: number;
  productVariantId: number;
  slug: string;
  productName: string;
  variantName: string;
  imageUrl: string;
  quantity: number;
  priceAtPurchase: number;
  comboItems?: any[]; // Map theo ComboItemDetail nếu cần
  available: boolean;
}

export interface OrderResponse {
  id: number;
  totalAmount: number;
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  createdAt: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  reason?: string;
  userNote?: string;
  deliveredAt?: string;
  discountAmount?: number;
  cancelledBy?: string;
  items: OrderItemResponse[];
}

export interface OrderStatsResponse {
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelledOrReturned: number;
  total: number;
}

export interface BulkStatusRequest {
  orderIds: number[];
  newStatus: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'RETURNED' | 'CANCELLED';
  reason?: string;
}

export interface PaymentResponse {
  id: number;
  orderId: number;
  customerName: string;
  method: string;
  amount: number;
  status: string;
  transactionId: string;
  paidAt: string;
}