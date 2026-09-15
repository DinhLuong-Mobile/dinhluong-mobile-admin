// ------------------------------------
// 1. Types Chung (Common)
// ------------------------------------
export interface ApiResponse<T> {
    status: string;
    code: number;
    message: string;
    timestamp: string;
    data: T;
}

export interface PageableResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Current page
    empty: boolean;
}

// ------------------------------------
// 2. Types cho Auth / User
// ------------------------------------
export interface AdminLoginResponse {
    token: string;
    refreshToken: string;
    id: number;
    email: string;
    name: string;
    avatar: string;
    typeAccount: string;
}

// ------------------------------------
// 3. Types cho Product
// ------------------------------------
export interface ProductCardResponse {
    id: number;
    slug: string;
    name: string;
    image: string;
    price: number;
    originalPrice: number;
    discountNote: string;
}

export interface BulkStockUpdateRequest {
    productId: number;
    stocks: Array<{
        variantId: number;
        stockQuantity: number;
    }>;
}