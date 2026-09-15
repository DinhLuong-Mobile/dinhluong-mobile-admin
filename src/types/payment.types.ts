export interface PaymentResponse {
    id: number;
    orderId: number;
    method: 'COD' | 'VNPAY';
    amount: number;
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUND_PENDING' | 'REFUNDED';
    transactionId?: string;
    paidAt?: string;
    customerName?: string;
}

export interface PaymentFilterParams {
    method?: string;
    status?: string;
    keyword?: string;
}