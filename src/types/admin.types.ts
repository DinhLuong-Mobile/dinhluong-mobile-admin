
import type { User } from './auth.types'; 


export interface AdminUser extends User {
    refreshToken: string; 
}


export interface BulkStockUpdateRequest {
    productId: number;
    stocks: Array<{
        variantId: number;
        stockQuantity: number;
    }>;
}