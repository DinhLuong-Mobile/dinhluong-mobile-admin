// src/types/cart.types.ts

export interface CartComboItem {
    id: number | string;
    name: string;
    price: number;
    originalPrice?: number;
    image: string;
    checked: boolean; 
    type?: "gift" | "service" | "sim"; 
}

export interface CartItem {
    id: number | string; 
    productVariantId: number | string; 
    sku: string; 
    name: string;
    slug: string; 
    image: string; 
    price: number;
    originalPrice?: number;
    colorName: string; 
    rom?: string; 
    quantity: number; 
    checked: boolean; 
    stockQuantity: number; 
    combos?: CartComboItem[]; 
}

export interface CartSummary {
    totalPrice: number; 
    totalDiscount: number; 
    finalPrice: number; 
    totalItems: number; 
}