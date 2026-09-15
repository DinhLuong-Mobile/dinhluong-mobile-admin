// src/types/common.types.ts

export interface ApiResponse<T> {
    status: string;
    code: number;
    message: string;
    timestamp: string;
    data: T;
}

// Gộp chung PageableResponse và PageResponse thành 1 chuẩn duy nhất
export interface PageResponse<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number; // Current page index
    empty: boolean;
    last?: boolean;
}